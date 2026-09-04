import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit2,
  Star,
  Share2,
  Menu,
  RotateCw,
  Volume2,
  VolumeX,
  ExternalLink,
  Youtube,
  BookOpen,
  Sparkles,
  Layers,
  Maximize2,
  X,
} from 'lucide-react';
import { PieceSize } from '../../types';

interface HeaderProps {
  onBack?: () => void;
  turn: 'w' | 'b';
  onToggleTurn: () => void;
  orientation: 'white' | 'black';
  onFlipOrientation: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetBoard: () => void;
  boardTheme: 'wood' | 'green' | 'dark';
  onChangeBoardTheme: (theme: 'wood' | 'green' | 'dark') => void;
  pieceSize: PieceSize;
  onChangePieceSize: (size: PieceSize) => void;
  onOpenSamples: () => void;
  onEnterEditMode?: () => void;
  currentFen: string;
}

export const Header: React.FC<HeaderProps> = ({
  onBack,
  turn,
  onToggleTurn,
  orientation,
  onFlipOrientation,
  soundEnabled,
  onToggleSound,
  onResetBoard,
  boardTheme,
  onChangeBoardTheme,
  pieceSize,
  onChangePieceSize,
  onOpenSamples,
  onEnterEditMode,
  currentFen,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [starred, setStarred] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Forkly Position Scanner',
          text: `Check out this chess position on Forkly: ${currentFen}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(currentFen);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      }
    } catch {
      // Ignored
    }
  };

  const openLichessAnalysis = () => {
    const cleanFen = encodeURIComponent(currentFen);
    window.open(`https://lichess.org/analysis/${cleanFen}`, '_blank');
  };

  const openYouTubeGames = () => {
    window.open(
      `https://www.youtube.com/results?search_query=chess+opening+analysis+games`,
      '_blank'
    );
  };

  const openMasterDatabase = () => {
    const cleanFen = encodeURIComponent(currentFen);
    window.open(`https://lichess.org/analysis#explorer?fen=${cleanFen}`, '_blank');
  };

  return (
    <header
      id="forkly-header"
      className="w-full bg-[#14122d] text-white select-none z-30 shadow-md border-b border-indigo-950/60"
    >
      {/* Top Bar: Title & Action Icons */}
      <div className="w-full px-3 py-2 flex items-center justify-between">
        {/* Left: App Title & Subtitle */}
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              title="Back to Home"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-bold tracking-wide text-white leading-tight font-sans flex items-center gap-1.5">
              <span className="text-emerald-400 font-extrabold tracking-tight">Forkly</span>
              <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                Scanner
              </span>
            </h1>
            <span className="text-[11px] text-zinc-400 font-normal tracking-wide">
              Forkly Position Scanner
            </span>
          </div>
        </div>

        {/* Right Action Icons: Edit, Star, Share, Menu */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Edit Board Position (Pencil icon as in Chessvision.ai screenshot) */}
          <button
            id="header-btn-edit-board"
            onClick={onEnterEditMode || onOpenSamples}
            title="Edit Board Position (Place / Remove Pieces)"
            className="p-2 rounded-lg text-zinc-200 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Star / Favorite */}
          <button
            id="header-btn-star"
            onClick={() => setStarred(!starred)}
            title={starred ? 'Saved to favorites' : 'Save to favorites'}
            className={`p-2 rounded-lg transition-colors ${
              starred
                ? 'text-amber-400 bg-amber-400/10'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Star className={`w-4 h-4 ${starred ? 'fill-amber-400' : ''}`} />
          </button>

          {/* Share */}
          <button
            id="header-btn-share"
            onClick={handleShare}
            title="Share Position / FEN"
            className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors relative"
          >
            <Share2 className="w-4 h-4" />
            {shareToast && (
              <span className="absolute -bottom-7 right-0 text-[10px] bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-50">
                FEN Copied!
              </span>
            )}
          </button>

          {/* Hamburger Menu */}
          <button
            id="header-btn-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            title="Menu Options"
            className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sub-bar (Directly above the board): Turn toggle + Action links */}
      <div className="w-full bg-[#1b183a] px-3 py-1.5 flex items-center justify-between border-t border-indigo-900/30 gap-2 overflow-x-auto scrollbar-none">
        {/* Turn indicator toggle (White King icon with pill toggle) */}
        <button
          id="btn-toggle-turn"
          onClick={onToggleTurn}
          title={`Click to switch active turn (currently ${turn === 'w' ? 'White' : 'Black'})`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#27234e] hover:bg-[#322c64] border border-indigo-800/40 text-xs font-semibold text-zinc-200 transition-colors shrink-0"
        >
          {/* Figurine */}
          <span className="text-base leading-none">
            {turn === 'w' ? '♔' : '♚'}
          </span>
          <div
            className={`w-7 h-3.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
              turn === 'w' ? 'bg-zinc-300' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full transition-transform duration-200 ease-in-out ${
                turn === 'w'
                  ? 'translate-x-3.5 bg-zinc-900'
                  : 'translate-x-0 bg-white'
              }`}
            />
          </div>
        </button>

        {/* Clean Action Shortcuts */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick piece size cycle button */}
          <button
            id="btn-subbar-piecesize"
            onClick={() => {
              const nextSize = pieceSize === 'normal' ? 'large' : pieceSize === 'large' ? 'xl' : 'normal';
              onChangePieceSize(nextSize);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#252148] hover:bg-[#302b5c] border border-indigo-700/50 text-[11px] font-medium text-zinc-200 transition-colors"
            title={`Piece Size: ${pieceSize === 'xl' ? 'Extra Large (XL)' : pieceSize === 'large' ? 'Large (Bada)' : 'Normal'}. Click to change.`}
          >
            <Maximize2 className="w-3 h-3 text-amber-400" />
            <span>Pieces: <strong className="text-amber-300">{pieceSize === 'xl' ? 'XL' : pieceSize === 'large' ? 'Bada' : 'Normal'}</strong></span>
          </button>

          {/* Quick Edit Board button */}
          {onEnterEditMode && (
            <button
              id="btn-subbar-edit"
              onClick={onEnterEditMode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#252148] hover:bg-[#302b5c] border border-indigo-700/50 text-[11px] font-medium text-zinc-200 transition-colors"
              title="Edit pieces on board"
            >
              <Edit2 className="w-3 h-3 text-amber-400" />
              <span>Edit</span>
            </button>
          )}

          {/* Open in Lichess Analysis */}
          <button
            id="btn-open-analysis"
            onClick={openLichessAnalysis}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#252148] hover:bg-[#302b5c] border border-indigo-700/50 text-[11px] font-medium text-zinc-200 transition-colors"
            title="Open interactive analysis on Lichess"
          >
            <span>Open</span>
            <ExternalLink className="w-3 h-3 text-zinc-300" />
          </button>
        </div>
      </div>

      {/* Slide-out or Dropdown Menu Modal */}
      {menuOpen && (
        <div
          id="header-menu-dropdown"
          className="bg-[#1a1738] border-b border-indigo-900/80 px-4 py-3 flex flex-col gap-2.5 animate-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between pb-2 border-b border-indigo-900/60">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Board & Engine Options
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Flip Board */}
            <button
              id="menu-btn-flip"
              onClick={() => {
                onFlipOrientation();
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-[#252148] hover:bg-[#302b5c] text-zinc-200 text-left"
            >
              <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Flip ({orientation})</span>
            </button>

            {/* Reset Board */}
            <button
              id="menu-btn-reset"
              onClick={() => {
                onResetBoard();
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-[#252148] hover:bg-[#302b5c] text-zinc-200 text-left"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Game</span>
            </button>

            {/* Sound Toggle */}
            <button
              id="menu-btn-sound"
              onClick={onToggleSound}
              className="flex items-center gap-2 p-2 rounded-lg bg-[#252148] hover:bg-[#302b5c] text-zinc-200 text-left"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sounds On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Sounds Muted</span>
                </>
              )}
            </button>

            {/* Sample Positions */}
            <button
              id="menu-btn-samples"
              onClick={() => {
                onOpenSamples();
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-[#252148] hover:bg-[#302b5c] text-zinc-200 text-left"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Sample Boards</span>
            </button>
          </div>

          {/* Board Theme picker */}
          <div className="pt-2 flex items-center justify-between border-t border-indigo-900/40">
            <span className="text-xs text-zinc-400">Board Theme</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onChangeBoardTheme('wood')}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 ${
                  boardTheme === 'wood'
                    ? 'bg-amber-700 text-white font-bold'
                    : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#b58863]" />
                Wood
              </button>
              <button
                onClick={() => onChangeBoardTheme('green')}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 ${
                  boardTheme === 'green'
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#779556]" />
                Green
              </button>
              <button
                onClick={() => onChangeBoardTheme('dark')}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 ${
                  boardTheme === 'dark'
                    ? 'bg-zinc-700 text-white font-bold'
                    : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#262b30]" />
                Dark
              </button>
            </div>
          </div>

          {/* Piece Size picker (Normal, Large / Bada, XL / Or Bada) */}
          <div className="pt-1.5 flex items-center justify-between">
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <Maximize2 className="w-3 h-3 text-amber-400" />
              <span>Pieces Size</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                id="btn-piece-size-normal"
                onClick={() => onChangePieceSize('normal')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  pieceSize === 'normal'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                Normal
              </button>
              <button
                id="btn-piece-size-large"
                onClick={() => onChangePieceSize('large')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  pieceSize === 'large'
                    ? 'bg-amber-600 text-white font-bold shadow-xs ring-1 ring-amber-400/40'
                    : 'bg-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                Bada (Large)
              </button>
              <button
                id="btn-piece-size-xl"
                onClick={() => onChangePieceSize('xl')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  pieceSize === 'xl'
                    ? 'bg-orange-600 text-white font-bold shadow-xs ring-1 ring-orange-400/40'
                    : 'bg-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                Or Bada (XL)
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
