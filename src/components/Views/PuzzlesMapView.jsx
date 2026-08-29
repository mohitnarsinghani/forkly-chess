import React, { useState, useEffect, useRef } from 'react';
import { PuzzleView } from './PuzzleView';
import { ArrowLeft, Play, List, MapPin, Trophy, Sparkles, Star, Lock, RefreshCw, X } from 'lucide-react';

/* ============================================================================
   INLINE ISOMETRIC SVG COMPONENTS & DECORATIONS
   ============================================================================ */

// 1. Background Isometric Grass Pattern
function IsometricGrassBackground() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="iso-grass-grid-v3" width="60" height="34.64" patternUnits="userSpaceOnUse">
          <path d="M30 0 L60 17.32 L30 34.64 L0 17.32 Z" fill="none" stroke="#68a34d" strokeWidth="1" opacity="0.4" />
          <path d="M30 0 L30 34.64" fill="none" stroke="#68a34d" strokeWidth="0.5" opacity="0.2" />
          <path d="M0 17.32 L60 17.32" fill="none" stroke="#68a34d" strokeWidth="0.5" opacity="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#iso-grass-grid-v3)" />
    </svg>
  );
}

// 2. Isometric Tree SVG Component
function IsometricTreeSVG({ className = "w-20 h-24", shade = "green" }) {
  const canopyDark = shade === "emerald" ? "#1e5229" : shade === "light" ? "#38782a" : "#225219";
  const canopyMid = shade === "emerald" ? "#2d7a3e" : shade === "light" ? "#4da839" : "#2c6922";
  const canopyTop = shade === "emerald" ? "#3e9c52" : shade === "light" ? "#65c44f" : "#38852a";

  return (
    <svg viewBox="0 0 100 120" className={`${className} filter drop-shadow-md`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="108" rx="36" ry="10" fill="#14260f" opacity="0.5" />
      <path d="M44 75 L56 75 L58 108 L42 108 Z" fill="#5c381d" />
      <path d="M50 75 L56 75 L58 108 L50 108 Z" fill="#3d2311" />
      
      <path d="M15 80 C15 80 10 58 35 52 C35 52 40 42 60 45 C60 45 80 48 85 68 C85 68 90 82 72 85 C72 85 50 92 15 80 Z" fill={canopyDark} />
      <path d="M22 62 C22 62 18 42 40 38 C40 38 45 28 65 31 C65 31 82 35 80 52 C80 52 82 66 65 68 C65 68 45 72 22 62 Z" fill={canopyMid} />
      <path d="M30 42 C30 42 26 24 48 20 C48 20 55 10 70 16 C70 16 80 26 75 40 C75 40 70 48 55 48 C55 48 40 50 30 42 Z" fill={canopyTop} />
      
      <circle cx="42" cy="28" r="4" fill="#86efac" opacity="0.7" />
      <circle cx="36" cy="48" r="5" fill="#86efac" opacity="0.6" />
    </svg>
  );
}

// 3. Isometric Lily Pond SVG Component
function IsometricPondSVG({ className = "w-32 h-24" }) {
  return (
    <svg viewBox="0 0 140 100" className={`${className} filter drop-shadow-lg`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 50 C5 25 40 5 80 10 C120 15 135 35 130 65 C125 90 85 98 45 92 C15 88 15 70 10 50 Z" fill="#14260f" opacity="0.4" />
      <path d="M14 48 C10 27 42 8 80 13 C118 18 132 36 127 63 C122 86 84 94 46 88 C20 84 17 66 14 48 Z" fill="#4d3722" />
      <path d="M18 46 C14 29 44 12 79 17 C114 22 127 38 123 61 C119 82 83 90 47 84 C23 80 21 62 18 46 Z" fill="url(#pond-water-grad-v3)" />

      <path d="M40 40 C55 35 75 37 90 42" stroke="#bae6fd" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M30 60 C50 56 70 60 85 67" stroke="#bae6fd" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      
      <g transform="translate(35, 30)">
        <path d="M12 0 C18 0 24 5 24 12 C24 19 18 24 12 24 C5 24 0 19 0 12 C0 8 2 4 6 2 L12 12 Z" fill="#2d6e24" />
        <circle cx="14" cy="14" r="2" fill="#e0f2fe" opacity="0.9" />
      </g>

      <g transform="translate(75, 55)">
        <path d="M10 0 C15 0 20 4 20 10 C20 16 15 20 10 20 C4 20 0 16 0 10 C0 6 2 3 5 1 L10 10 Z" fill="#35822b" />
        <circle cx="10" cy="10" r="4" fill="#f472b6" />
        <circle cx="10" cy="10" r="2" fill="#fef08a" />
      </g>

      <defs>
        <linearGradient id="pond-water-grad-v3" x1="20" y1="20" x2="120" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 4. Isometric Wooden Bench SVG Component
function IsometricBenchSVG({ className = "w-20 h-16" }) {
  return (
    <svg viewBox="0 0 100 80" className={`${className} filter drop-shadow-md`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="70" rx="35" ry="8" fill="#14260f" opacity="0.5" />
      <rect x="25" y="48" width="5" height="20" rx="2" fill="#2d1c10" />
      <rect x="70" y="48" width="5" height="20" rx="2" fill="#2d1c10" />
      <rect x="35" y="44" width="4" height="18" rx="2" fill="#1c1109" />
      <rect x="80" y="44" width="4" height="18" rx="2" fill="#1c1109" />

      <path d="M15 42 L80 42 L88 48 L23 48 Z" fill="#945a2b" />
      <path d="M17 49 L82 49 L90 55 L25 55 Z" fill="#7a4821" />
      <path d="M10 25 L75 25 L78 33 L13 33 Z" fill="#a66733" />
      <path d="M12 34 L77 34 L80 41 L15 41 Z" fill="#8c5427" />

      <rect x="20" y="25" width="4" height="22" fill="#4a2e16" />
      <rect x="70" y="25" width="4" height="22" fill="#4a2e16" />

      <path d="M50 38 L54 38 L53 43 L49 43 Z" fill="#f8fafc" />
      <circle cx="51.5" cy="36.5" r="2" fill="#f8fafc" />
    </svg>
  );
}

// 5. Isometric Cabin House SVG Component
function IsometricCabinSVG({ className = "w-28 h-32" }) {
  return (
    <svg viewBox="0 0 120 140" className={`${className} filter drop-shadow-xl`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 115 L60 135 L115 115 L65 95 Z" fill="#14260f" opacity="0.6" />
      <path d="M20 70 L60 90 L60 120 L20 100 Z" fill="#7c4d28" />
      <path d="M60 90 L100 70 L100 100 L60 120 Z" fill="#5c381c" />
      <path d="M20 70 L60 45 L60 90 Z" fill="#694020" />
      <path d="M15 70 L58 40 L62 90 L18 92 Z" fill="#b91c1c" />
      <path d="M58 40 L105 65 L102 95 L62 90 Z" fill="#991b1b" />

      <rect x="80" y="42" width="10" height="22" fill="#4b5563" />
      <path d="M80 42 L90 42 L92 45 L78 45 Z" fill="#374151" />
      <circle cx="85" cy="34" r="4" fill="#f3f4f6" opacity="0.6" />
      <circle cx="90" cy="24" r="6" fill="#f3f4f6" opacity="0.4" />
      <circle cx="96" cy="14" r="8" fill="#f3f4f6" opacity="0.2" />

      <path d="M33 90 L47 97 L47 113 L33 106 Z" fill="#3b2312" />
      <circle cx="44" cy="103" r="1.5" fill="#fbbf24" />

      <path d="M72 82 L88 74 L88 88 L72 96 Z" fill="#fef08a" />
      <path d="M72 82 L88 74 L88 88 L72 96 Z" fill="#f59e0b" opacity="0.3" />
      <line x1="80" y1="78" x2="80" y2="92" stroke="#5c381c" strokeWidth="1.5" />
      <line x1="72" y1="89" x2="88" y2="81" stroke="#5c381c" strokeWidth="1.5" />
    </svg>
  );
}

// 6. Flowers Cluster SVG Component
function FlowersTuftSVG({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 50 50" className={`${className} filter drop-shadow-sm`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 40 Q 10 25 8 18 Q 14 24 20 40" fill="#4ade80" />
      <path d="M22 42 Q 25 22 28 14 Q 28 24 26 42" fill="#22c55e" />
      <path d="M30 40 Q 38 26 42 20 Q 36 28 32 40" fill="#4ade80" />

      <circle cx="12" cy="18" r="4" fill="#ef4444" />
      <circle cx="12" cy="18" r="1.5" fill="#fef08a" />

      <circle cx="28" cy="14" r="4.5" fill="#f59e0b" />
      <circle cx="28" cy="14" r="1.5" fill="#ffffff" />

      <circle cx="40" cy="22" r="3.5" fill="#a855f7" />
      <circle cx="40" cy="22" r="1.2" fill="#fef08a" />
    </svg>
  );
}

// 7. Small Grass Clump SVG Component
function GrassTuftSVG({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 40 35" className={`${className} opacity-90`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 32 Q 5 18 2 12 Q 8 18 14 32" fill="#4ade80" />
      <path d="M18 34 Q 20 14 22 8 Q 23 18 22 34" fill="#22c55e" />
      <path d="M25 32 Q 32 20 36 14 Q 31 22 28 32" fill="#86efac" />
    </svg>
  );
}

// 8. COMPACT CARTOON MASCOT COACH AVATAR (56px COMPACT DIAMETER, PROPORTIONAL & DETAILED)
function CoachAvatarSVG({ className = "w-14 h-14" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} rounded-full filter drop-shadow-md shrink-0`}
      style={{ width: '56px', height: '56px' }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="48" fill="#14260f" stroke="#81b64c" strokeWidth="3" />
      <circle cx="50" cy="50" r="45" fill="url(#coach-portrait-grad-v3)" stroke="#fef08a" strokeWidth="1" />

      <path d="M14 92 C14 68 32 60 50 60 C68 60 86 68 86 92 Z" fill="#243447" />
      <path d="M32 92 L50 68 L68 92 Z" fill="#3b4d61" />
      <path d="M44 70 L50 92 L56 70 Z" fill="#81b64c" />
      <path d="M42 72 L40 85" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M58 72 L60 85" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

      <rect x="42" y="52" width="16" height="14" fill="#f59e0b" rx="4" />
      <circle cx="50" cy="40" r="20" fill="#f59e0b" />

      <path d="M30 36 C30 20 36 15 50 15 C64 15 70 20 70 36 C70 46 64 56 50 56 C36 56 30 46 30 36 Z" fill="#381704" />
      <circle cx="50" cy="36" r="17" fill="#f59e0b" />
      
      <path d="M32 36 C32 50 40 54 50 54 C60 54 68 50 68 36 C68 45 60 50 50 50 C40 50 32 45 32 36 Z" fill="#381704" />

      <path d="M36 28 Q 41 25 45 29" stroke="#381704" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M55 29 Q 59 25 64 28" stroke="#381704" strokeWidth="2" strokeLinecap="round" fill="none" />

      <rect x="35" y="30" width="13" height="11" rx="3" fill="#ffffff" opacity="0.95" stroke="#1e293b" strokeWidth="2" />
      <rect x="52" y="30" width="13" height="11" rx="3" fill="#ffffff" opacity="0.95" stroke="#1e293b" strokeWidth="2" />
      <line x1="48" y1="34" x2="52" y2="34" stroke="#1e293b" strokeWidth="2.5" />

      <circle cx="41.5" cy="35.5" r="2.5" fill="#0f172a" />
      <circle cx="58.5" cy="35.5" r="2.5" fill="#0f172a" />
      <circle cx="40.5" cy="34.5" r="1" fill="#ffffff" />
      <circle cx="57.5" cy="34.5" r="1" fill="#ffffff" />

      <path d="M43 45 Q 50 49 57 45" stroke="#381704" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      <defs>
        <linearGradient id="coach-portrait-grad-v3" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 9. Pawn Progress Marker SVG Component
function PawnMarkerSVG({ className = "w-8 h-10" }) {
  return (
    <svg viewBox="0 0 40 50" className={`${className} filter drop-shadow-xl animate-bounce`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="46" rx="14" ry="4" fill="#000000" opacity="0.4" />
      <path d="M8 42 L32 42 Q 34 46 20 46 Q 6 46 8 42 Z" fill="#5b8233" />
      <rect x="10" y="38" width="20" height="4" rx="2" fill="#81b64c" />
      <path d="M13 38 C13 38 14 24 20 24 C26 24 27 38 27 38 Z" fill="#81b64c" />
      <path d="M20 24 C24 24 27 38 27 38 L20 38 Z" fill="#65973c" />
      <ellipse cx="20" cy="23" rx="8" ry="2.5" fill="#fef08a" />
      <circle cx="20" cy="14" r="8" fill="url(#pawn-head-grad-v3)" />
      <circle cx="17" cy="11" r="2.5" fill="#ffffff" opacity="0.7" />
      <path d="M17 6 L20 2 L23 6 L20 5 Z" fill="#fbbf24" />

      <defs>
        <radialGradient id="pawn-head-grad-v3" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#a3e635" />
          <stop offset="70%" stopColor="#65973c" />
          <stop offset="100%" stopColor="#3f6212" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// 10. CHUNKY WOODEN TREE-STUMP TILE WITH DEEP 3D SIDE DEPTH
function WoodenStumpTile({ level, state, onClick }) {
  const isCompleted = state === 'completed';
  const isCurrent = state === 'current';
  const isLocked = state === 'locked';

  const isEven = level % 2 === 0;

  let topFillStart = isEven ? '#e5b177' : '#d69c5e';
  let topFillEnd = isEven ? '#c78d4c' : '#b6773a';
  let sideFill = isEven ? '#7c4e26' : '#6d3f1a';
  let sideFillDark = isEven ? '#543317' : '#47280f';
  let ringColor = '#73411b';

  if (isCompleted) {
    topFillStart = '#f59e0b';
    topFillEnd = '#d97706';
    sideFill = '#92400e';
    sideFillDark = '#682d09';
    ringColor = '#78350f';
  } else if (isCurrent) {
    topFillStart = '#81b64c';
    topFillEnd = '#5b8233';
    sideFill = '#38541c';
    sideFillDark = '#253912';
    ringColor = '#2b4215';
  } else if (isLocked) {
    topFillStart = isEven ? '#5c3a21' : '#4f3019';
    topFillEnd = isEven ? '#422713' : '#381e0c';
    sideFill = isEven ? '#2d1809' : '#231106';
    sideFillDark = isEven ? '#1c0e05' : '#140803';
    ringColor = '#2b1708';
  }

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 ${
        isCurrent ? 'scale-110 z-20' : 'hover:scale-105 z-10'
      }`}
      style={{ width: '96px', height: '96px' }}
    >
      {isCurrent && (
        <div className="absolute inset-0 rounded-full bg-[#81b64c]/60 blur-md animate-pulse pointer-events-none scale-125" />
      )}

      <svg viewBox="0 0 100 110" className="w-full h-full filter drop-shadow-xl overflow-visible">
        <ellipse cx="50" cy="92" rx="44" ry="15" fill="#0d180a" opacity="0.65" />

        <path d="M8 42 C8 64 92 64 92 42 L92 72 C92 94 8 94 8 72 Z" fill={sideFill} />
        <path d="M8 55 C8 74 92 74 92 55 L92 72 C92 94 8 94 8 72 Z" fill={sideFillDark} opacity="0.5" />

        <line x1="20" y1="52" x2="20" y2="78" stroke="#120c07" strokeWidth="1.5" opacity="0.3" />
        <line x1="36" y1="56" x2="36" y2="82" stroke="#120c07" strokeWidth="1.5" opacity="0.3" />
        <line x1="64" y1="56" x2="64" y2="82" stroke="#120c07" strokeWidth="1.5" opacity="0.3" />
        <line x1="80" y1="52" x2="80" y2="78" stroke="#120c07" strokeWidth="1.5" opacity="0.3" />

        <ellipse
          cx="50"
          cy="42"
          rx="42"
          ry="26"
          fill={`url(#wood-top-v3-${level})`}
          stroke={isCurrent ? '#ffffff' : isCompleted ? '#fef08a' : '#3d220f'}
          strokeWidth={isCurrent ? "4" : "2"}
        />

        <ellipse cx="50" cy="42" rx="33" ry="20" fill="none" stroke={ringColor} strokeWidth="1.3" opacity="0.55" strokeDasharray="14 4 10 4" />
        <ellipse cx="50" cy="42" rx="23" ry="14" fill="none" stroke={ringColor} strokeWidth="1.3" opacity="0.5" strokeDasharray="8 3" />
        <ellipse cx="50" cy="42" rx="13" ry="8" fill="none" stroke={ringColor} strokeWidth="1" opacity="0.4" />
        <circle cx="50" cy="42" r="2" fill={ringColor} opacity="0.6" />

        {isCompleted && (
          <g transform="translate(70, 14)">
            <circle cx="10" cy="10" r="10" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
            <path d="M10 4 L12 8 L16 8.5 L13 11.5 L14 15.5 L10 13.5 L6 15.5 L7 11.5 L4 8.5 L8 8 Z" fill="#78350f" />
          </g>
        )}

        {isLocked && (
          <g transform="translate(72, 16)">
            <circle cx="9" cy="9" r="9" fill="#3b2312" stroke="#e4b076" strokeWidth="1" />
            <path d="M7 8 V6 A2 2 0 0 1 11 6 V8 M6 8 H12 V12 H6 Z" fill="none" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        )}

        <defs>
          <linearGradient id={`wood-top-v3-${level}`} x1="8" y1="18" x2="92" y2="68" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={topFillStart} />
            <stop offset="100%" stopColor={topFillEnd} />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center pb-5 pointer-events-none">
        <span
          className={`font-black text-2xl font-sans tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${
            isCurrent
              ? 'text-white scale-110'
              : isCompleted
              ? 'text-white'
              : 'text-white/90'
          }`}
        >
          {level}
        </span>
      </div>
    </button>
  );
}


/* ============================================================================
   MAIN PUZZLES MAP VIEW COMPONENT
   ============================================================================ */

export function PuzzlesMapView({ onBack }) {
  const [isSolving, setIsSolving] = useState(false);
  const [viewMode, setViewMode] = useState('map');
  const [selectedLevelModal, setSelectedLevelModal] = useState(null);
  const [coachTipIndex, setCoachTipIndex] = useState(0);
  const currentTileRef = useRef(null);

  const puzzlesSolved = parseInt(localStorage.getItem('chess_puzzles_solved') || '0', 10);
  const TOTAL_LEVELS = 20;
  const currentLevel = Math.min(TOTAL_LEVELS, Math.floor(puzzlesSolved / 2) + 1);

  const coachTips = [
    "Solving puzzles is the best way to develop pattern recognition and tactical skill.",
    "Always look for checks, captures, and threats before making your move!",
    "Look out for pinned pieces — they can't defend key squares effectively.",
    "Knight forks are deadly because knights jump over defender lines!",
    "Calculate your opponent's best response, not just your favorite continuation."
  ];

  useEffect(() => {
    if (currentTileRef.current) {
      setTimeout(() => {
        currentTileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400);
    }
  }, [viewMode]);

  if (isSolving) {
    return (
      <div className="space-y-4 bg-[#161512] min-h-screen font-['Nunito',sans-serif]">
        <div className="px-4 pt-3 max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setIsSolving(false)}
            className="flex items-center gap-2 text-xs font-black text-gray-300 hover:text-white bg-[#262421] border border-[#3e3b38] px-4 py-2 rounded-full transition shadow-md"
          >
            <ArrowLeft size={16} className="text-[#81b64c]" /> Back to Puzzles Map
          </button>

          <div className="flex items-center gap-2 text-xs font-black text-amber-400 bg-[#262421] border border-[#3e3b38] px-3.5 py-1.5 rounded-full shadow-md">
            <Trophy size={14} />
            <span>{puzzlesSolved} Solved</span>
          </div>
        </div>
        <PuzzleView />
      </div>
    );
  }

  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => TOTAL_LEVELS - i);

  const getXPosition = (lvl) => {
    const pattern = [0, 65, 115, 65, 0, -65, -115, -65];
    return pattern[(lvl - 1) % pattern.length];
  };

  const TILE_Y_STEP = 86;

  return (
    <div className="relative max-w-md md:max-w-lg mx-auto min-h-screen bg-[#24421b] text-white flex flex-col justify-between pb-28 select-none font-['Nunito',sans-serif]">
      {/* ----------------------------------------------------------------------
         1. STICKY TOP NAVBAR HEADER
         ---------------------------------------------------------------------- */}
      <header className="sticky top-0 z-30 bg-[#1b3414]/95 backdrop-blur-md border-b border-[#3b6329] px-4 py-3 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#81b64c] to-[#457521] border border-lime-400/40 flex items-center justify-center text-lg shadow-md">
              🧩
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white tracking-wide leading-none">Puzzles Map</h1>
              <p className="text-[10px] text-lime-400 font-extrabold uppercase tracking-wider mt-0.5">Garden Tactics Trail</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition shadow"
              title={viewMode === 'map' ? "Switch to List View" : "Switch to Map View"}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-black text-lime-400">
            <span>Level {currentLevel} of {TOTAL_LEVELS}</span>
            <span>{Math.round((puzzlesSolved / (TOTAL_LEVELS * 2)) * 100)}% Progress</span>
          </div>
          <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#81b64c] to-[#5b8233] rounded-full transition-all duration-500 shadow"
              style={{ width: `${Math.min(100, (puzzlesSolved / (TOTAL_LEVELS * 2)) * 100)}%` }}
            />
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------------------------
         2. COMPACT STRATEGY COACH SPEECH BUBBLE CARD
         ---------------------------------------------------------------------- */}
      <div className="px-4 pt-3 z-20">
        <div className="bg-[#1b3414]/90 backdrop-blur-md border border-[#3b6329] p-3.5 rounded-2xl shadow-xl flex items-center gap-3.5">
          {/* Compact Coach Avatar Circle */}
          <CoachAvatarSVG className="w-14 h-14 shrink-0" />

          {/* Single Row Text & Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-lime-400">
                Strategy Coach
              </span>
              <button
                onClick={() => setCoachTipIndex((prev) => (prev + 1) % coachTips.length)}
                className="hover:text-white transition flex items-center gap-1 bg-[#81b64c]/20 border border-[#81b64c]/40 px-2 py-0.5 rounded-full text-[10px] text-lime-300 font-bold"
                title="Next Tip"
              >
                <RefreshCw size={10} /> Tip #{coachTipIndex + 1}
              </button>
            </div>
            <p className="text-xs font-semibold text-gray-200 leading-snug line-clamp-2">
              "{coachTips[coachTipIndex]}"
            </p>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------------
         3. MAIN VIEW: ISOMETRIC GAME MAP vs LIST VIEW
         ---------------------------------------------------------------------- */}
      {viewMode === 'map' ? (
        <div className="relative flex-1 mx-3 my-3 bg-[#1e3b15] rounded-3xl border border-[#3b6329] overflow-hidden shadow-2xl p-4 min-h-[1850px] flex flex-col items-center">
          
          {/* Isometric Grass Grid Overlay */}
          <IsometricGrassBackground />

          {/* DENSE SCATTERED ISOMETRIC SCENERY */}
          <div className="absolute top-4 left-2 z-0 pointer-events-none opacity-90">
            <IsometricTreeSVG className="w-24 h-28" shade="emerald" />
          </div>
          <div className="absolute top-28 left-20 z-0 pointer-events-none">
            <GrassTuftSVG className="w-8 h-8" />
          </div>
          <div className="absolute top-12 right-2 z-0 pointer-events-none">
            <IsometricPondSVG className="w-32 h-24" />
          </div>
          <div className="absolute top-36 right-28 z-0 pointer-events-none">
            <FlowersTuftSVG className="w-10 h-10" />
          </div>

          <div className="absolute top-[220px] left-4 z-0 pointer-events-none">
            <IsometricTreeSVG className="w-18 h-22" shade="light" />
          </div>
          <div className="absolute top-[280px] right-6 z-0 pointer-events-none">
            <IsometricTreeSVG className="w-20 h-24" shade="green" />
          </div>
          <div className="absolute top-[320px] left-24 z-0 pointer-events-none">
            <FlowersTuftSVG className="w-9 h-9" />
          </div>

          <div className="absolute top-[440px] left-3 z-0 pointer-events-none">
            <IsometricBenchSVG className="w-20 h-16" />
          </div>
          <div className="absolute top-[500px] left-24 z-0 pointer-events-none">
            <GrassTuftSVG className="w-9 h-9" />
          </div>
          <div className="absolute top-[520px] right-4 z-0 pointer-events-none">
            <IsometricTreeSVG className="w-22 h-26" shade="emerald" />
          </div>
          <div className="absolute top-[600px] right-24 z-0 pointer-events-none">
            <FlowersTuftSVG className="w-10 h-10" />
          </div>

          <div className="absolute top-[700px] right-2 z-0 pointer-events-none">
            <IsometricCabinSVG className="w-28 h-32" />
          </div>
          <div className="absolute top-[760px] left-6 z-0 pointer-events-none">
            <IsometricTreeSVG className="w-18 h-22" shade="light" />
          </div>
          <div className="absolute top-[840px] left-20 z-0 pointer-events-none">
            <FlowersTuftSVG className="w-12 h-12" />
          </div>

          <div className="absolute top-[980px] right-6 z-0 pointer-events-none">
            <IsometricTreeSVG className="w-24 h-28" shade="green" />
          </div>
          <div className="absolute top-[1060px] left-4 z-0 pointer-events-none">
            <IsometricTreeSVG className="w-18 h-22" shade="emerald" />
          </div>
          <div className="absolute top-[1150px] right-28 z-0 pointer-events-none">
            <GrassTuftSVG className="w-10 h-10" />
          </div>
          <div className="absolute top-[1250px] left-24 z-0 pointer-events-none">
            <FlowersTuftSVG className="w-11 h-11" />
          </div>
          <div className="absolute top-[1400px] right-4 z-0 pointer-events-none">
            <IsometricTreeSVG className="w-22 h-26" shade="light" />
          </div>
          <div className="absolute top-[1550px] left-6 z-0 pointer-events-none">
            <IsometricPondSVG className="w-28 h-20" />
          </div>

          {/* Winding Trail SVG Path Line */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path
                d={levels.reduce((acc, lvl, idx) => {
                  const x = 200 + getXPosition(lvl);
                  const y = 90 + idx * TILE_Y_STEP;
                  return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                }, '')}
                fill="none"
                stroke="#81b64c"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
              />
              <path
                d={levels.reduce((acc, lvl, idx) => {
                  const x = 200 + getXPosition(lvl);
                  const y = 90 + idx * TILE_Y_STEP;
                  return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                }, '')}
                fill="none"
                stroke="#ffffff"
                strokeWidth="4"
                strokeDasharray="6 6"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
            </svg>
          </div>

          {/* Stepping-Stone Tiles Path Container */}
          <div className="relative w-full max-w-sm flex flex-col items-center gap-7 z-10 my-8">
            {levels.map((level) => {
              const isCompleted = level < currentLevel;
              const isCurrent = level === currentLevel;
              const isLocked = level > currentLevel;

              const state = isCompleted ? 'completed' : isCurrent ? 'current' : 'locked';
              const offsetX = getXPosition(level);

              return (
                <div
                  key={level}
                  ref={isCurrent ? currentTileRef : null}
                  className="relative flex items-center justify-center transition-transform duration-300"
                  style={{ transform: `translateX(${offsetX}px)` }}
                >
                  {/* Pawn Character & Profile Badges on Current Level Tile */}
                  {isCurrent && (
                    <div className="absolute -top-13 z-30 flex flex-col items-center pointer-events-none">
                      <div className="flex items-center gap-1 mb-0.5">
                        <div className="w-7 h-7 rounded-full bg-[#81b64c] border-2 border-white shadow-lg flex items-center justify-center text-xs" title="Player">
                          🎅
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[#5b8233] border-2 border-white shadow-lg flex items-center justify-center text-xs" title="Mentor">
                          🧔🏻‍♂️
                        </div>
                      </div>

                      <PawnMarkerSVG className="w-8 h-10" />
                    </div>
                  )}

                  {/* Chunkier 3D Wooden Stump Tile Button */}
                  <WoodenStumpTile
                    level={level}
                    state={state}
                    onClick={() => {
                      if (isLocked) {
                        setSelectedLevelModal({ level, state, rating: 800 + level * 75, theme: 'Tactics' });
                      } else {
                        setIsSolving(true);
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* LIST VIEW OVERVIEW GRID */
        <div className="p-4 space-y-3 flex-1 z-10 max-w-md mx-auto w-full">
          <div className="bg-[#1e1d1b] border border-[#3e3b38] p-4.5 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-white">All Puzzle Levels</h3>
              <p className="text-xs text-lime-400 font-bold">Select any unlocked level to solve</p>
            </div>
            <button
              onClick={() => setViewMode('map')}
              className="px-4 py-2 bg-gradient-to-b from-[#81b64c] to-[#5b8233] text-white text-xs font-black rounded-xl hover:from-[#92c858] hover:to-[#67943a] border-b-2 border-[#3f5c20] transition shadow"
            >
              View Map
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((lvl) => {
              const isCompleted = lvl < currentLevel;
              const isCurrent = lvl === currentLevel;
              const isLocked = lvl > currentLevel;

              return (
                <div
                  key={lvl}
                  onClick={() => {
                    if (!isLocked) setIsSolving(true);
                  }}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between cursor-pointer shadow ${
                    isCurrent
                      ? 'bg-[#243318] border-[#81b64c] shadow-md ring-2 ring-[#81b64c]'
                      : isCompleted
                      ? 'bg-[#1e1d1b] border-[#3e3b38] hover:border-amber-400'
                      : 'bg-[#161512] border-[#262421] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-full bg-[#262421] border border-[#3e3b38] flex items-center justify-center font-black text-sm text-white">
                      {lvl}
                    </span>
                    {isCompleted && <Star size={18} className="text-amber-400 fill-amber-400" />}
                    {isCurrent && <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-[#81b64c] text-white rounded-full">Active</span>}
                    {isLocked && <Lock size={16} className="text-neutral-400" />}
                  </div>

                  <div>
                    <div className="text-xs font-extrabold text-white">Level {lvl}</div>
                    <div className="text-[10px] font-semibold text-lime-400">{800 + lvl * 75} ELO Rating</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
         4. STICKY BOTTOM ACTION BAR
         ---------------------------------------------------------------------- */}
      <div className="fixed bottom-20 left-0 right-0 max-w-md md:max-w-lg mx-auto px-4 z-30">
        <div className="flex items-center gap-3 bg-[#161512]/95 backdrop-blur-md p-2.5 rounded-full border border-[#262421] shadow-2xl">
          <button
            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            className="w-12 h-12 rounded-full bg-[#262421] hover:bg-[#302e2b] border border-[#3e3b38] text-white flex items-center justify-center transition shrink-0 shadow active:translate-y-0.5"
            title="Toggle View Mode"
          >
            <List size={20} />
          </button>

          <button
            onClick={() => setIsSolving(true)}
            className="flex-1 py-3.5 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] active:translate-y-0.5 text-white font-black text-base rounded-full border-b-4 border-[#3f5c20] shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Play size={18} className="fill-white" />
            <span>SOLVE PUZZLES</span>
          </button>
        </div>
      </div>

      {/* Locked Level Modal Dialog */}
      {selectedLevelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1e1d1b] border border-[#3e3b38] rounded-2xl p-6 max-w-xs w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-[#262421] border border-[#3e3b38] mx-auto flex items-center justify-center text-3xl shadow">
              🔒
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white">Level {selectedLevelModal.level} Locked</h3>
              <p className="text-xs text-neutral-400 font-semibold mt-1">Complete Level {selectedLevelModal.level - 1} to unlock this puzzle challenge!</p>
            </div>
            <button
              onClick={() => setSelectedLevelModal(null)}
              className="w-full py-3 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] border-b-2 border-[#3f5c20] text-white font-black rounded-xl text-sm transition uppercase shadow"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
