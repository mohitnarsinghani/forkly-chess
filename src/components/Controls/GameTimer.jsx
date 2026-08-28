import React, { useEffect } from 'react';
import { Clock } from 'lucide-react';

export function GameTimer({
  whiteTime,
  blackTime,
  activeColor,
  isPaused,
  onTimeOut,
  whiteName = 'Player (White)',
  blackName = 'Opponent (Black)'
}) {
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (activeColor === 'w') {
        if (whiteTime <= 1) {
          onTimeOut('w');
        }
      } else {
        if (blackTime <= 1) {
          onTimeOut('b');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeColor, isPaused, whiteTime, blackTime]);

  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between bg-chess-panel border border-chess-border rounded-xl p-3 shadow-md">
      {/* Black Player Clock */}
      <div
        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
          activeColor === 'b' && !isPaused
            ? 'bg-zinc-800 text-white shadow-lg ring-2 ring-chess-accent'
            : 'bg-chess-card text-gray-400'
        }`}
      >
        <span className="w-3 h-3 rounded-full bg-zinc-900 border border-gray-600"></span>
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-400">{blackName}</p>
          <p className="font-mono text-xl font-extrabold tracking-wider">{formatTime(blackTime)}</p>
        </div>
      </div>

      <Clock size={20} className="text-chess-textMuted hidden sm:block animate-pulse" />

      {/* White Player Clock */}
      <div
        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
          activeColor === 'w' && !isPaused
            ? 'bg-zinc-100 text-black shadow-lg ring-2 ring-chess-accent'
            : 'bg-chess-card text-gray-400'
        }`}
      >
        <span className="w-3 h-3 rounded-full bg-white border border-gray-300"></span>
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-500">{whiteName}</p>
          <p className="font-mono text-xl font-extrabold tracking-wider">{formatTime(whiteTime)}</p>
        </div>
      </div>
    </div>
  );
}
