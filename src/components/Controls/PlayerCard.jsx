import React from 'react';

export function PlayerCard({
  name = 'Player',
  rating = 1400,
  flag = '🇺🇸',
  avatar = '',
  capturedPieces = [],
  materialAdvantage = 0,
  timeInSeconds = 600,
  isActive = false,
  isWhite = true,
  enableTimer = true
}) {
  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const PIECE_UNICODES = {
    p: '♟',
    n: '♞',
    b: '♝',
    r: '♜',
    q: '♛',
    P: '♙',
    N: '♘',
    B: '♗',
    R: '♖',
    Q: '♕'
  };

  return (
    <div
      className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-[#1e1d1b] border rounded-xl shadow-md transition-all font-['Nunito',sans-serif] ${
        isActive ? 'border-[#81b64c] ring-2 ring-[#81b64c]' : 'border-[#3e3b38]'
      }`}
    >
      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-lg bg-[#262421] border border-[#3e3b38] flex items-center justify-center text-lg font-bold shadow-sm overflow-hidden shrink-0">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span>{isWhite ? '♔' : '♚'}</span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5 font-extrabold text-xs text-white">
            <span className="truncate max-w-[110px] sm:max-w-[160px]">{name}</span>
            <span className="text-neutral-400 font-mono text-[11px]">({rating})</span>
            <span className="text-sm">{flag}</span>
          </div>

          {/* Captured Pieces & Material score */}
          <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
            <span className="tracking-tighter">
              {capturedPieces.map((p, idx) => PIECE_UNICODES[p] || p).join('')}
            </span>
            {materialAdvantage > 0 && (
              <span className="text-xs font-bold text-lime-400 ml-1">+{materialAdvantage}</span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Clock Box */}
      {enableTimer && (
        <div
          className={`px-3 py-1.5 rounded-lg text-sm font-black font-mono transition-all ${
            isActive
              ? 'bg-[#81b64c] text-white shadow-md ring-2 ring-lime-400'
              : 'bg-[#262421] text-gray-300 border border-[#3e3b38]'
          }`}
        >
          {formatTime(timeInSeconds)}
        </div>
      )}
    </div>
  );
}
