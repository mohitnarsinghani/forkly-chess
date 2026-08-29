import React from 'react';

// White King Icon
export function WhiteKingIcon({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.5 6V11M19.5 8.5H25.5" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22.5 11C16 11 14 17 14 20C14 24 16 26 17.5 27H27.5C29 26 31 24 31 20C31 17 29 11 22.5 11Z" fill="#ffffff" stroke="#1c1917" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M11.5 37H33.5V32H11.5V37Z" fill="#ffffff" stroke="#1c1917" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14.5 32C14.5 29.5 17 27 22.5 27C28 27 30.5 29.5 30.5 32" stroke="#1c1917" strokeWidth="2.5" />
      <circle cx="22.5" cy="18" r="2.5" fill="#1c1917" />
    </svg>
  );
}

// Black King Icon
export function BlackKingIcon({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.5 6V11M19.5 8.5H25.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22.5 11C16 11 14 17 14 20C14 24 16 26 17.5 27H27.5C29 26 31 24 31 20C31 17 29 11 22.5 11Z" fill="#1c1917" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M11.5 37H33.5V32H11.5V37Z" fill="#1c1917" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14.5 32C14.5 29.5 17 27 22.5 27C28 27 30.5 29.5 30.5 32" stroke="#ffffff" strokeWidth="2.5" />
      <circle cx="22.5" cy="18" r="2.5" fill="#ffffff" />
    </svg>
  );
}

// Split Random King Icon (Half White, Half Black)
export function RandomKingIcon({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="randomKingSplit" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#1c1917" />
        </linearGradient>
      </defs>
      <path d="M22.5 6V11M19.5 8.5H25.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22.5 11C16 11 14 17 14 20C14 24 16 26 17.5 27H27.5C29 26 31 24 31 20C31 17 29 11 22.5 11Z" fill="url(#randomKingSplit)" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M11.5 37H33.5V32H11.5V37Z" fill="url(#randomKingSplit)" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14.5 32C14.5 29.5 17 27 22.5 27C28 27 30.5 29.5 30.5 32" stroke="#ffffff" strokeWidth="2.5" />
    </svg>
  );
}

export function ColorSelector({ selectedColor = 'w', onSelectColor, size = "large" }) {
  const isCompact = size === "compact";
  const btnSize = isCompact ? "w-10 h-10 sm:w-11 sm:h-11" : "w-13 h-13 sm:w-14 sm:h-14";
  const iconSize = isCompact ? "w-6 h-6" : "w-7 h-7 sm:w-8 sm:h-8";

  return (
    <div className="flex items-center gap-2 sm:gap-3 select-none">
      {/* WHITE PIECE BUTTON */}
      <button
        type="button"
        onClick={() => onSelectColor('w')}
        className={`${btnSize} rounded-2xl flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-md relative ${
          selectedColor === 'w'
            ? 'bg-gradient-to-b from-white to-gray-200 border-2 border-[#81b64c] ring-4 ring-[#81b64c]/60 shadow-[0_0_16px_rgba(129,182,76,0.7)] scale-105 z-10'
            : 'bg-gradient-to-b from-gray-100 to-gray-300 border border-gray-400 opacity-60 hover:opacity-100 hover:scale-100'
        }`}
        title="Play as White"
      >
        <WhiteKingIcon className={iconSize} />
      </button>

      {/* RANDOM PIECE BUTTON */}
      <button
        type="button"
        onClick={() => onSelectColor('r')}
        className={`${btnSize} rounded-2xl flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-md relative ${
          selectedColor === 'r'
            ? 'bg-gradient-to-br from-gray-400 via-gray-700 to-zinc-900 border-2 border-[#81b64c] ring-4 ring-[#81b64c]/60 shadow-[0_0_16px_rgba(129,182,76,0.7)] scale-105 z-10'
            : 'bg-gradient-to-br from-gray-500 via-gray-800 to-zinc-950 border border-gray-600 opacity-60 hover:opacity-100 hover:scale-100'
        }`}
        title="Random Color (White or Black)"
      >
        <RandomKingIcon className={iconSize} />
      </button>

      {/* BLACK PIECE BUTTON */}
      <button
        type="button"
        onClick={() => onSelectColor('b')}
        className={`${btnSize} rounded-2xl flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-md relative ${
          selectedColor === 'b'
            ? 'bg-gradient-to-b from-[#2a2926] to-[#141311] border-2 border-[#81b64c] ring-4 ring-[#81b64c]/60 shadow-[0_0_16px_rgba(129,182,76,0.7)] scale-105 z-10'
            : 'bg-gradient-to-b from-[#2a2926] to-[#141311] border border-[#484541] opacity-60 hover:opacity-100 hover:scale-100'
        }`}
        title="Play as Black"
      >
        <BlackKingIcon className={iconSize} />
      </button>
    </div>
  );
}
