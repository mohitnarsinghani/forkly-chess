import React from 'react';
import { List, Star, ChevronLeft, ChevronRight } from 'lucide-react';

export function MobileBottomBar({ onOpenOptions, onStartReview, onPrevious, onNext }) {
  return (
    <div className="w-full bg-chess-panel border-t border-chess-border py-2 px-4 flex items-center justify-around z-30 shadow-2xl select-none">
      {/* Options Button */}
      <button
        onClick={onOpenOptions}
        className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-white transition"
      >
        <List size={22} />
        <span className="text-[10px] font-bold">Options</span>
      </button>

      {/* Game Review Star Button */}
      <button
        onClick={onStartReview}
        className="w-12 h-12 rounded-2xl bg-chess-accent hover:bg-chess-accentHover text-black flex items-center justify-center shadow-lg shadow-chess-accent/30 font-extrabold transition transform active:scale-95"
        title="Game Review"
      >
        <Star size={24} fill="currentColor" />
      </button>

      {/* Back Button */}
      <button
        onClick={onPrevious}
        className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-white transition"
      >
        <ChevronLeft size={24} />
        <span className="text-[10px] font-bold">Back</span>
      </button>

      {/* Forward Button */}
      <button
        onClick={onNext}
        className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-white transition"
      >
        <ChevronRight size={24} />
        <span className="text-[10px] font-bold">Forward</span>
      </button>
    </div>
  );
}
