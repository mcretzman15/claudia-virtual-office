'use client';

import { useEffect, useState, useCallback } from 'react';
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

// Demo state for when backend not connected
const DEMO_STATE: OfficeState = {
  room: 'IDLE',
  activity: 'idle',
  task: 'Start watcher locally to see real-time updates',
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

export default function Home() {
  const [state, setState] = useState<OfficeState>(DEMO_STATE);
  const [connected, setConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState<'STORMBREAKER' | 'TEXTEVIDENCE'>('STORMBREAKER');

  // Polling for status (works with or without backend)
  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3001/api/status', { 
        cache: 'no-store',
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        setState(data);
        setConnected(true);
        if (data.room !== 'IDLE') {
          setSelectedRoom(data.room as 'STORMBREAKER' | 'TEXTEVIDENCE');
        }
      }
    } catch (e) {
      // Backend not running - show demo state
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    // Poll every 3 seconds
    const pollInterval = setInterval(pollStatus, 3000);
    pollStatus(); // Initial call

    // Update clock
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timer);
    };
  }, [pollStatus]);

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
              {connected ? '🟢 Connected to local watcher' : '🟡 Demo mode - run watcher locally'}
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
            <div className={`card-retro min-h-[450px] relative overflow-hidden ${getRoomColor()}`}>
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
              <div className="relative z-10 p-8 flex items-center justify-center min-h-[350px]">
                {/* Background desk */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                  <div className="w-72 h-36 bg-amber-900 border-4 border-amber-700">
                    <div className="w-full h-4 bg-amber-800"></div>
                  </div>
                </div>

                {/* Computer monitor */}
                <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
                  <div className="w-36 h-28 bg-gray-800 border-4 border-gray-600 rounded-lg">
                    <div className="w-32 h-20 bg-blue-900 m-1 animate-pulse rounded flex items-center justify-center">
                      <span className="text-2xl">💻</span>
                    </div>
                    <div className="w-4 h-2 bg-green-500 mx-auto mt-1 rounded-full animate-pulse"></div>
                  </div>
                  <div className="w-24 h-3 bg-gray-600 mx-auto"></div>
                  <div className="w-32 h-2 bg-gray-700 mx-auto rounded"></div>
                </div>

                {/* Claudia Character - CSS Pixel Art */}
                <div className={`absolute bottom-36 right-1/3 ${getClaudiaAnimation()}`}>
                  {/* Character Container */}
                  <div className="relative">
                    {/* Crown */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex">
                      <div className="w-3 h-4 bg-yellow-400 border-2 border-yellow-600"></div>
                      <div className="w-4 h-5 bg-yellow-400 border-2 border-yellow-600 -mt-1"></div>
                      <div className="w-3 h-4 bg-yellow-400 border-2 border-yellow-600"></div>
                    </div>
                    
                    {/* Hair */}
                    <div className="flex">
                      <div className="w-4 h-12 bg-amber-800 border-2 border-amber-900"></div>
                      <div className="w-12 h-14 bg-amber-800 border-2 border-amber-900 -mt-2"></div>
                      <div className="w-4 h-12 bg-amber-800 border-2 border-amber-900"></div>
                    </div>
                    
                    {/* Face */}
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-orange-200 border-2 border-orange-300">
                      {/* Eyes */}
                      <div className="flex justify-center mt-2 space-x-2">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                      </div>
                      {/* Smile */}
                      <div className="w-4 h-2 bg-red-400 mx-auto mt-2 rounded-full"></div>
                    </div>
                    
                    {/* Body/Dress */}
                    <div className="w-16 h-20 bg-blue-600 mx-auto border-2 border-blue-800 -mt-2 relative">
                      {/* Italian flag sash */}
                      <div className="absolute top-4 left-0 w-full h-4 flex">
                        <div className="w-1/3 h-full bg-green-500"></div>
                        <div className="w-1/3 h-full bg-white border-l border-r border-gray-300"></div>
                        <div className="w-1/3 h-full bg-red-500"></div>
                      </div>
                    </div>
                    
                    {/* Arms */}
                    <div className={`absolute top-14 -left-3 w-4 h-12 bg-orange-200 border-2 border-orange-300 transform ${state.activity === 'coding' || state.activity === 'writing' ? 'rotate-12 animate-bounce' : ''}`}></div>
                    <div className={`absolute top-14 -right-3 w-4 h-12 bg-orange-200 border-2 border-orange-300 transform ${state.activity === 'coding' || state.activity === 'writing' ? '-rotate-12 animate-bounce' : ''}`}></div>
                    
                    {/* Coffee cup (when idle) */}
                    {state.activity === 'idle' && (
                      <div className="absolute top-20 -right-8 animate-bounce">
                        <div className="w-6 h-8 bg-white border-2 border-gray-400 rounded">
                          <div className="w-full h-2 bg-amber-700 mt-1"></div>
                          <div className="absolute -right-2 top-2 w-2 h-4 border-2 border-gray-400 rounded-r"></div>
                        </div>
                        <div className="absolute -top-2 left-1 text-xs">☕</div>
                      </div>
                    )}
                    
                    {/* Confetti (when celebrating) */}
                    {state.activity === 'commit' && (
                      <div className="absolute -top-8 left-0 animate-pulse">
                        <div className="text-2xl">🎉🎊✨</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Speech Bubble */}
                <div className="absolute top-16 right-8 bg-white text-black p-4 border-4 border-black max-w-xs rounded-lg">
                  <p className="font-retro text-xl">
                    {state.task}
                  </p>
                  <div className="absolute bottom-0 right-8 transform translate-y-1/2 rotate-45 w-4 h-4 bg-white border-r-4 border-b-4 border-black"></div>
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
            {/* Connection Status */}
            {!connected && (
              <div className="card-retro bg-red-900 border-red-500">
                <h3 className="font-pixel text-sm mb-2 text-red-300">⚠️ NOT CONNECTED</h3>
                <p className="text-sm mb-2">Run watcher locally:</p>
                <code className="block bg-black p-2 text-green-400 text-xs rounded">
                  cd ~/projects/claudia-office/watcher<br/>
                  npm start
                </code>
              </div>
            )}

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
          <p>🏰 Claudia's Virtual Office v1.1 | Real-time project monitoring</p>
          <p className="text-sm mt-1">Built with ❤️ for Matt Cretzman</p>
        </div>
      </footer>
    </div>
  );
}