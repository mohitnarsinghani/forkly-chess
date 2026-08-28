import React, { useEffect, useState } from 'react';

export function SplashScreen({ onFinish }) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadingOut(true);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 600);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#161512] flex flex-col items-center justify-center select-none transition-opacity duration-600 font-['Nunito',sans-serif] ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Animated Pawn Logo Icon */}
      <div className="relative mb-6 animate-bounce duration-1000">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#81b64c] to-[#5b8233] flex items-center justify-center text-6xl shadow-xl border-2 border-lime-400/40 text-black">
          ♟️
        </div>
        <span className="absolute -bottom-2 -right-2 bg-[#81b64c] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
          v1.0
        </span>
      </div>

      {/* Brand Title */}
      <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-1">
        FORK<span className="text-[#81b64c]">LY</span>
      </h1>
      <p className="text-xs text-neutral-400 font-extrabold tracking-widest uppercase mt-2">
        Play, Learn & Master
      </p>

      {/* Animated Pieces Row */}
      <div className="flex items-center gap-3 mt-8 text-2xl text-white/40 animate-pulse">
        <span>♞</span>
        <span>♝</span>
        <span>♜</span>
        <span>♛</span>
        <span>♚</span>
      </div>

      {/* Progress Bar */}
      <div className="w-48 bg-[#262421] border border-[#3e3b38] h-2 rounded-full overflow-hidden mt-10 p-0.5">
        <div className="bg-gradient-to-r from-[#81b64c] to-[#5b8233] h-full animate-[pulse_1s_infinite] w-full origin-left transform scale-x-100 transition-transform duration-1000 rounded-full"></div>
      </div>
    </div>
  );
}
