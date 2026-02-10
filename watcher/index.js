const chokidar = require('chokidar');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const WORKSPACE = '/Users/mattcretzman/.openclaw/workspace';
const PORT = 3001;

// State tracking
let currentState = {
  room: 'IDLE',
  activity: 'idle',
  task: 'Waiting for work...',
  progress: 0,
  recentFiles: [],
  recentCommits: [],
  lastActive: Date.now(),
  stats: {
    filesModified: 0,
    commitsToday: 0,
    commandsRun: 0
  }
};

// Room detection logic
function detectRoom(filePath, gitStatus) {
  const normalizedPath = filePath.toLowerCase();
  
  // TextEvidence detection
  if (normalizedPath.includes('textevidence') || 
      normalizedPath.includes('text-evidence') ||
      gitStatus?.includes('textevidence')) {
    return 'TEXTEVIDENCE';
  }
  
  // Stormbreaker detection (catch-all for other work)
  if (normalizedPath.includes('workspace') || 
      normalizedPath.includes('vincit') ||
      normalizedPath.includes('leadstorm') ||
      normalizedPath.includes('stormbreaker') ||
      gitStatus?.includes('stormbreaker')) {
    return 'STORMBREAKER';
  }
  
  return 'IDLE';
}

// Activity detection
function detectActivityType(filePath, command) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (command?.includes('git commit')) return 'commit';
  if (command?.includes('npm') || command?.includes('yarn')) return 'build';
  if (ext === '.ts' || ext === '.tsx' || ext === '.js') return 'coding';
  if (ext === '.md' || ext === '.txt') return 'writing';
  if (ext === '.json' || ext === '.csv') return 'data';
  if (command?.includes('curl') || command?.includes('api')) return 'api';
  if (command?.includes('gog') || command?.includes('email')) return 'email';
  
  return 'working';
}

// Get recent git commits from workspace and subdirectories
async function getRecentCommits() {
  const allCommits = [];
  
  // Try main workspace
  try {
    const mainGit = simpleGit(WORKSPACE);
    const mainLog = await mainGit.log({ maxCount: 5 });
    allCommits.push(...mainLog.all);
  } catch (e) {
    // No commits in main workspace
  }
  
  // Try subdirectories (textevidence, vincit-dashboard, etc.)
  const subdirs = ['textevidence', 'vincit-dashboard'];
  for (const dir of subdirs) {
    try {
      const dirPath = path.join(WORKSPACE, dir);
      const dirGit = simpleGit(dirPath);
      const dirLog = await dirGit.log({ maxCount: 3 });
      allCommits.push(...dirLog.all.map(c => ({
        ...c,
        message: `[${dir}] ${c.message}`
      })));
    } catch (e) {
      // Not a git repo or no commits
    }
  }
  
  // Sort by date, most recent first
  allCommits.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return allCommits.slice(0, 5).map(commit => ({
    message: commit.message,
    date: commit.date,
    author: commit.author_name
  }));
}

// Get recent bash commands
function getRecentCommands() {
  try {
    const bashHistory = fs.readFileSync('/Users/mattcretzman/.bash_history', 'utf8');
    const lines = bashHistory.split('\n').filter(line => line.trim());
    return lines.slice(-10);
  } catch (e) {
    return [];
  }
}

// Calculate progress (simplified algorithm)
function calculateProgress(recentFiles, commits) {
  const now = Date.now();
  const todayCommits = commits.filter(c => {
    const commitDate = new Date(c.date);
    return commitDate.toDateString() === new Date().toDateString();
  }).length;
  
  // Simple progress based on activity
  const fileActivity = Math.min(recentFiles.length * 5, 40);
  const commitActivity = Math.min(todayCommits * 20, 60);
  
  return Math.min(fileActivity + commitActivity, 100);
}

// File watcher
const watcher = chokidar.watch(WORKSPACE, {
  ignored: /node_modules|\.git|\.next|dist|build/,
  persistent: true,
  ignoreInitial: true
});

watcher
  .on('change', async (filePath) => {
    const relativePath = path.relative(WORKSPACE, filePath);
    const room = detectRoom(relativePath);
    const activity = detectActivityType(filePath);
    
    currentState.room = room;
    currentState.activity = activity;
    currentState.lastActive = Date.now();
    currentState.stats.filesModified++;
    
    // Add to recent files (keep last 5)
    currentState.recentFiles.unshift({
      path: relativePath,
      time: Date.now(),
      room: room
    });
    currentState.recentFiles = currentState.recentFiles.slice(0, 5);
    
    // Update task description
    if (room === 'TEXTEVIDENCE') {
      currentState.task = `Working on TextEvidence: ${path.basename(filePath)}`;
    } else if (room === 'STORMBREAKER') {
      currentState.task = `Working on Stormbreaker: ${path.basename(filePath)}`;
    }
    
    // Recalculate progress
    const commits = await getRecentCommits();
    currentState.progress = calculateProgress(currentState.recentFiles, commits);
    currentState.recentCommits = commits;
    
    // Broadcast update
    io.emit('state-update', currentState);
    console.log(`[${new Date().toLocaleTimeString()}] ${room}: ${activity} - ${relativePath}`);
  })
  .on('add', (filePath) => {
    console.log(`[NEW FILE] ${path.relative(WORKSPACE, filePath)}`);
  });

// Git polling
setInterval(async () => {
  const commits = await getRecentCommits();
  const todayCommits = commits.filter(c => {
    const commitDate = new Date(c.date);
    return commitDate.toDateString() === new Date().toDateString();
  });
  
  if (todayCommits.length > currentState.stats.commitsToday) {
    currentState.stats.commitsToday = todayCommits.length;
    currentState.activity = 'commit';
    currentState.lastActive = Date.now();
    io.emit('state-update', currentState);
    console.log(`[GIT] New commit detected! Total today: ${todayCommits.length}`);
  }
  
  currentState.recentCommits = commits;
}, 5000);

// Idle detection
setInterval(() => {
  const timeSinceActive = Date.now() - currentState.lastActive;
  
  if (timeSinceActive > 300000) { // 5 minutes
    if (currentState.room !== 'IDLE') {
      currentState.room = 'IDLE';
      currentState.activity = 'idle';
      currentState.task = 'Waiting for next task...';
      currentState.progress = 0;
      io.emit('state-update', currentState);
      console.log('[IDLE] No activity detected');
    }
  }
}, 30000);

// CORS for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Express routes
app.use(express.static('public'));

app.get('/api/status', (req, res) => {
  res.json(currentState);
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected to office');
  socket.emit('state-update', currentState);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`🏰 Claudia's Office Watcher running on port ${PORT}`);
  console.log(`👁️  Watching: ${WORKSPACE}`);
  console.log('Waiting for activity...');
});