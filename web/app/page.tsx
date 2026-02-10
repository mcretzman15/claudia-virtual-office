'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './globals.css';

interface OfficeState {
  room: string;
  activity: string;
  task: string;
  progress: number;
  recentFiles: Array<{ path: string; time: number; room: string }>;
  recentCommits: Array<{ message: string; date: string; author: string }>;
  lastActive: number;
  stats: {
    filesModified: number;
    commitsToday: number;
    commandsRun: number;
  };
}

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<OfficeState>({
    room: 'IDLE',
    activity: 'idle',
    task: 'Initializing...',
    progress: 0,
    recentFiles: [],
    recentCommits: [],
    lastActive: Date.now(),
    stats: {
      filesModified: 0,
      commitsToday: 0,
      commandsRun: 0
    }
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState<'STORMBREAKER' | 'TEXTEVIDENCE'>('STORMBREAKER');

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('state-update', (newState: OfficeState) => {
      setState(newState);
      if (newState.room !== 'IDLE') {
        setSelectedRoom(newState.room as 'STORMBREAKER' | 'TEXTEVIDENCE');
      }
    });

    // Update clock
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      newSocket.close();
      clearInterval(timer);
    };
  }, []);

  const getClaudiaAnimation = () => {
    switch (state.activity) {
      case 'coding':
      case 'writing':
        return 'claudia-type';
      case 'commit':
        return 'claudia-celebrate';
      case 'idle':
        return 'claudia-idle';
      default:
        return 'claudia-walk';
    }
  };

  const getRoomColor = () => {
    return selectedRoom === 'STORMBREAKER' ? 'room-stormbreaker' : 'room-textevidence';
  };

  const getRoomName = () => {
    return selectedRoom === 'STORMBREAKER' ? '🌪️ STORMBREAKER DIGITAL' : '⚖️ TEXTEVIDENCE';
  };

  const getActivityIcon = () => {
    switch (state.activity) {
      case 'coding': return '👩‍💻';
      case 'writing': return '✍️';
      case 'commit': return '🎉';
      case 'idle': return '☕';
      case 'email': return '📧';
      case 'api': return '🔌';
      default: return '⚡';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTimeSinceActive = () => {
    const seconds = Math.floor((Date.now() - state.lastActive) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-retro">
      {/* Header */}
      <header className="bg-gray-800 border-b-4 border-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="font-pixel text-xl text-yellow-400 mb-1">
              🏰 CLAUDIA'S VIRTUAL OFFICE
            </h1>
            <p className="text-gray-400 text-lg">
              Real-time project monitoring
            </p>
          </div>
          <div className="text-right">
            <div className="font-pixel text-2xl text-green-400">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-gray-400">
              {currentTime.toLocaleDateString()}
            </div>
          </div>
        </div>
      </header>

      {/* Room Selector */}
      <div className="bg-gray-800 border-b-4 border-white">
        <div className="max-w-7xl mx-auto flex">
          <button
            onClick={() => setSelectedRoom('STORMBREAKER')}
            className={`flex-1 py-4 font-pixel text-sm uppercase tracking-wider transition-all ${
              selectedRoom === 'STORMBREAKER'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            🌪️ Stormbreaker
          </button>
          <button
            onClick={() => setSelectedRoom('TEXTEVIDENCE')}
            className={`flex-1 py-4 font-pixel text-sm uppercase tracking-wider transition-all ${
              selectedRoom === 'TEXTEVIDENCE'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            ⚖️ TextEvidence
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room Visual */}
          <div className="lg:col-span-2">
            <div className={`card-retro min-h-[400px] relative overflow-hidden ${getRoomColor()}`}>
              {/* Thunder effect for Stormbreaker */}
              {selectedRoom === 'STORMBREAKER' && (
                <div className="absolute inset-0 bg-white thunder-overlay pointer-events-none"></div>
              )}
              
              {/* Room Header */}
              <div className="relative z-10 p-4 border-b-4 border-white bg-black/30">
                <h2 className="font-pixel text-xl text-white">
                  {getRoomName()}
                </h2>
              </div>

              {/* Room Content */}
              <div className="relative z-10 p-8 flex items-center justify-center min-h-[300px]">
                {/* Desk/Furniture placeholder */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                  <div className="w-64 h-32 bg-gray-700 border-4 border-white"></div>
                  <div className="w-48 h-4 bg-gray-600 mx-auto"></div>
                </div>

                {/* Computer */}
                <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
                  <div className="w-32 h-24 bg-gray-800 border-4 border-white">
                    <div className="w-28 h-16 bg-blue-900 m-1 animate-pulse"></div>
                  </div>
                </div>

                {/* Claudia Character */}
                <div className={`text-8xl ${getClaudiaAnimation()}`}>
                  {getActivityIcon()}
                </div>

                {/* Speech Bubble */}
                <div className="absolute top-20 right-8 bg-white text-black p-4 border-4 border-black max-w-xs">
                  <p className="font-retro text-xl">
                    {state.task}
                  </p>
                </div>
              </div>

              {/* Room Footer */}
              <div className="relative z-10 p-4 border-t-4 border-white bg-black/30">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className={`status-dot ${state.activity === 'idle' ? 'status-idle' : 'status-active'}`}></span>
                    <span className="font-retro text-xl uppercase">
                      {state.activity}
                    </span>
                  </div>
                  <span className="text-gray-300">
                    Last active: {getTimeSinceActive()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="space-y-4">
            {/* Progress Card */}
            <div className="card-retro bg-gray-800">
              <h3 className="font-pixel text-sm mb-4 text-yellow-400">PROGRESS</h3>
              <div className="progress-retro mb-2">
                <div 
                  className="progress-retro-fill bg-green-500"
                  style={{ width: `${state.progress}%` }}
                ></div>
              </div>
              <p className="text-right font-pixel text-xl">{state.progress}%</p>
            </div>

            {/* Stats Card */}
            <div className="card-retro bg-gray-800">
              <h3 className="font-pixel text-sm mb-4 text-blue-400">TODAY'S STATS</h3>
              <div className="space-y-2 font-retro text-xl">
                <div className="flex justify-between">
                  <span>Files Modified:</span>
                  <span className="text-yellow-400">{state.stats.filesModified}</span>
                </div>
                <div className="flex justify-between">
                  <span>Commits:</span>
                  <span className="text-green-400">{state.stats.commitsToday}</span>
                </div>
                <div className="flex justify-between">
                  <span>Commands:</span>
                  <span className="text-purple-400">{state.stats.commandsRun}</span>
                </div>
              </div>
            </div>

            {/* Recent Files */}
            <div className="card-retro bg-gray-800">
              <h3 className="font-pixel text-sm mb-4 text-purple-400">RECENT FILES</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {state.recentFiles.length === 0 ? (
                  <p className="text-gray-500 font-retro">No recent activity...</p>
                ) : (
                  state.recentFiles.map((file, index) => (
                    <div key={index} className="text-sm border-l-4 border-blue-500 pl-2">
                      <p className="truncate">{file.path}</p>
                      <p className="text-gray-400 text-xs">
                        {formatTime(file.time)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Commits */}
            <div className="card-retro bg-gray-800">
              <h3 className="font-pixel text-sm mb-4 text-green-400">RECENT COMMITS</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {state.recentCommits.length === 0 ? (
                  <p className="text-gray-500 font-retro">No commits today...</p>
                ) : (
                  state.recentCommits.slice(0, 3).map((commit, index) => (
                    <div key={index} className="text-sm border-l-4 border-green-500 pl-2">
                      <p className="truncate">{commit.message}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(commit.date).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t-4 border-white p-4 mt-8">
        <div className="max-w-7xl mx-auto text-center font-retro text-gray-400">
          <p>🏰 Claudia's Virtual Office v1.0 | Monitoring: /Users/mattcretzman/.openclaw/workspace</p>
          <p className="text-sm mt-1">Built with ❤️ for Matt Cretzman</p>
        </div>
      </footer>
    </div>
  );
}