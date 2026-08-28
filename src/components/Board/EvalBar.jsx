import React from 'react';

export function EvalBar({ evaluation = 0, isFlipped = false, boardHeight = null }) {
  const getWhitePercentage = () => {
    if (evaluation >= 100) return 100;
    if (evaluation <= -100) return 0;

    const clamped = Math.max(-10, Math.min(10, evaluation));
    const percentage = 50 + (clamped / 10) * 45;
    return Math.max(4, Math.min(96, percentage));
  };

  const whitePct = getWhitePercentage();
  const blackPct = 100 - whitePct;

  const displayScore = () => {
    if (evaluation >= 100) return 'M';
    if (evaluation <= -100) return '-M';
    const val = Math.abs(evaluation).toFixed(1);
    return val === '0.0' ? '0.0' : val;
  };

  return (
    <div
      className="relative w-5 sm:w-6 bg-[#262421] border border-chess-border/80 rounded-md overflow-hidden flex flex-col justify-between select-none shadow-md shrink-0 self-stretch"
      style={boardHeight ? { height: `${boardHeight}px` } : {}}
    >
      {/* Top Section */}
      <div
        className={`w-full transition-all duration-500 ease-out flex items-start justify-center p-0.5 text-[9px] sm:text-[10px] font-black font-mono ${
          isFlipped ? 'bg-[#262421] text-white' : 'bg-white text-black'
        }`}
        style={{ height: `${isFlipped ? blackPct : whitePct}%` }}
      >
        {(!isFlipped && evaluation >= 0) || (isFlipped && evaluation < 0) ? (
          <span className="leading-tight pt-0.5">{displayScore()}</span>
        ) : null}
      </div>

      {/* Bottom Section */}
      <div
        className={`w-full transition-all duration-500 ease-out flex items-end justify-center p-0.5 text-[9px] sm:text-[10px] font-black font-mono ${
          isFlipped ? 'bg-white text-black' : 'bg-[#262421] text-white'
        }`}
        style={{ height: `${isFlipped ? whitePct : blackPct}%` }}
      >
        {(!isFlipped && evaluation < 0) || (isFlipped && evaluation >= 0) ? (
          <span className="leading-tight pb-0.5">{displayScore()}</span>
        ) : null}
      </div>
    </div>
  );
}
