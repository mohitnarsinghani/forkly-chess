import React from 'react';
import {
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
  RotateCw,
  Menu,
} from 'lucide-react';

interface MoveNavControlBarProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  onFlip: () => void;
  onOpenMoveList?: () => void;
}

export const MoveNavControlBar: React.FC<MoveNavControlBarProps> = ({
  canGoBack,
  canGoForward,
  onFirst,
  onPrev,
  onNext,
  onLast,
  onFlip,
  onOpenMoveList,
}) => {
  return (
    <div
      id="move-navigation-bar"
      className="w-full bg-[#f1f3f5] border-y border-zinc-300 py-1.5 px-4 flex items-center justify-between text-zinc-700 select-none shadow-sm"
    >
      {/* First Move |< */}
      <button
        id="nav-btn-first"
        onClick={onFirst}
        disabled={!canGoBack}
        title="First move"
        className="p-1.5 rounded-lg hover:bg-zinc-200 active:bg-zinc-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <ChevronFirst className="w-5 h-5 text-zinc-700" />
      </button>

      {/* Previous Move < */}
      <button
        id="nav-btn-prev"
        onClick={onPrev}
        disabled={!canGoBack}
        title="Previous move"
        className="p-1.5 rounded-lg hover:bg-zinc-200 active:bg-zinc-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-zinc-700" />
      </button>

      {/* Next Move > */}
      <button
        id="nav-btn-next"
        onClick={onNext}
        disabled={!canGoForward}
        title="Next move"
        className="p-1.5 rounded-lg hover:bg-zinc-200 active:bg-zinc-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-zinc-700" />
      </button>

      {/* Last Move >| */}
      <button
        id="nav-btn-last"
        onClick={onLast}
        disabled={!canGoForward}
        title="Current / Last move"
        className="p-1.5 rounded-lg hover:bg-zinc-200 active:bg-zinc-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <ChevronLast className="w-5 h-5 text-zinc-700" />
      </button>

      {/* Flip Board 🔄 */}
      <button
        id="nav-btn-flip"
        onClick={onFlip}
        title="Flip board orientation"
        className="p-1.5 rounded-lg hover:bg-zinc-200 active:bg-zinc-300 transition-colors"
      >
        <RotateCw className="w-5 h-5 text-zinc-700" />
      </button>

      {/* Options / Move list ≡ */}
      <button
        id="nav-btn-menu"
        onClick={onOpenMoveList}
        title="Game moves & options"
        className="p-1.5 rounded-lg hover:bg-zinc-200 active:bg-zinc-300 transition-colors"
      >
        <Menu className="w-5 h-5 text-zinc-700" />
      </button>
    </div>
  );
};
