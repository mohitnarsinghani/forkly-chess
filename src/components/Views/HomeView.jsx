import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Bot, Swords, Play, GraduationCap, Trophy, Upload, ChevronRight, Sparkles, Star, Cpu, BarChart2 } from 'lucide-react';

export function HomeView({ onNavigate, user, onOpenProfile }) {
  const [selectedTime, setSelectedTime] = useState('10 min');

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-4 pb-28 select-none font-['Nunito',sans-serif] space-y-6">
      
      {/* 1. PLAYER CARD TOP BANNER */}
      <div className="bg-[#161512] border border-[#262421] p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 cursor-pointer" onClick={onOpenProfile}>
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#81b64c] to-[#5b8233] border-2 border-lime-400 flex items-center justify-center text-2xl shadow-lg shrink-0 text-white">
              🎅
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#81b64c] border-2 border-[#161512] animate-pulse" title="Online" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-white tracking-wide">
                {user?.username || 'Player'}
              </span>
              <span className="text-base">🇳🇴</span>
            </div>
            <p className="text-xs font-semibold text-neutral-400 mt-0.5 leading-relaxed">
              Welcome <span className="text-white font-extrabold">{user?.username || 'Player'}</span> to Forkly! Play with Bots, solve Puzzles & analyze your games! ♟️✨
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#1c3614] border border-[#395e28] px-4 py-2 rounded-full text-xs font-extrabold text-lime-400 shadow-md shrink-0">
          <Trophy size={16} className="text-lime-400" />
          <span>Stockfish 18 Active</span>
        </div>
      </div>

      {/* 2. MAIN 4-COLUMN HERO CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        
        {/* COLUMN 1: PLAY GAME CARD */}
        <div className="bg-[#1e1d1b] border border-[#3e3b38] rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-extrabold text-xl text-white tracking-wide">Play Game</h2>
              <span className="text-[10px] font-black text-white bg-[#81b64c] px-2.5 py-0.5 rounded-full shadow">LIVE</span>
            </div>

            {/* Time Selection Pills */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['10 min', '5 min', '3 days'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`py-2 px-1 rounded-xl font-extrabold text-xs transition border shadow-sm ${
                    selectedTime === t
                      ? 'bg-[#81b64c] text-white border-lime-400 shadow-md'
                      : 'bg-[#262421] text-neutral-300 border-[#3e3b38] hover:bg-[#302e2b]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Start Game Glossy Button */}
            <button
              onClick={() => onNavigate('coach')}
              className="w-full py-3.5 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] text-white font-black rounded-xl text-sm uppercase border-b-4 border-[#3f5c20] shadow-lg tracking-wider transition-all flex items-center justify-center gap-2 mb-2 active:translate-y-0.5"
            >
              <Play size={18} className="fill-white" />
              <span>START GAME</span>
            </button>
          </div>

          {/* Quick Links Rows */}
          <div className="space-y-2.5">
            <div
              onClick={() => onNavigate('coach')}
              className="p-3 rounded-xl bg-[#262421] border border-[#3e3b38] shadow-md hover:border-[#81b64c] transition flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#81b64c] to-[#5b8233] flex items-center justify-center text-white shadow-md shrink-0">
                  <Bot size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-white">Play Bots</div>
                  <div className="text-[10px] text-neutral-400 font-bold">Choose your opponent</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-neutral-400" />
            </div>

            <div
              onClick={() => onNavigate('review')}
              className="p-3 rounded-xl bg-[#262421] border border-[#3e3b38] shadow-md hover:border-purple-400 transition flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <Upload size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-white">Upload & Replay</div>
                  <div className="text-[10px] text-neutral-400 font-bold">Replay PGN games</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-neutral-400" />
            </div>

            <div
              onClick={() => onNavigate('passplay')}
              className="p-3 rounded-xl bg-[#262421] border border-[#3e3b38] shadow-md hover:border-amber-400 transition flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <Swords size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-white">Pass & Play</div>
                  <div className="text-[10px] text-neutral-400 font-bold">2 Players on 1 device</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-neutral-400" />
            </div>
          </div>
        </div>

        {/* COLUMN 2: PUZZLES CARD */}
        <div className="bg-[#1e1d1b] border border-[#3e3b38] rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-extrabold text-xl text-white tracking-wide">Puzzles</h2>
              <span className="text-[10px] font-black text-amber-400 bg-[#362714] px-2.5 py-0.5 rounded-full border border-[#694b23] flex items-center gap-1">
                <Star size={11} className="fill-amber-400" /> ★ 9.9
              </span>
            </div>

            <div className="p-2 bg-[#262421] border border-[#3e3b38] rounded-xl shadow-inner mb-3">
              <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                <Chessboard position="r1bqkb1r/pppp1ppp/2n5/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 0 4" arePiecesDraggable={false} />
              </div>
            </div>

            <div className="flex items-center justify-between mb-2 text-xs font-extrabold">
              <span className="text-lime-400 flex items-center gap-1">
                <span>🧩</span> 40,225 Puzzles
              </span>
              <span className="text-amber-400">75% Complete</span>
            </div>

            <div className="w-full bg-[#262421] h-3 rounded-full overflow-hidden border border-[#3e3b38] mb-2 p-0.5">
              <div className="bg-gradient-to-r from-[#81b64c] to-[#5b8233] h-full w-3/4 rounded-full shadow" />
            </div>
          </div>

          <button
            onClick={() => onNavigate('puzzlesMap')}
            className="w-full py-3.5 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] text-white font-black rounded-xl text-sm uppercase border-b-4 border-[#3f5c20] shadow-lg tracking-wider transition-all flex items-center justify-center gap-2 active:translate-y-0.5"
          >
            <Sparkles size={16} />
            <span>SOLVE PUZZLES</span>
          </button>
        </div>

        {/* COLUMN 3: GAME ANALYSIS CARD */}
        <div className="bg-[#1e1d1b] border border-[#3e3b38] rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-extrabold text-xl text-white tracking-wide">Game Analysis</h2>
              <span className="text-[10px] font-black text-cyan-300 bg-[#122b3b] px-2.5 py-0.5 rounded-full border border-[#204963]">ENGINE</span>
            </div>

            <div className="p-2 bg-[#262421] border border-[#3e3b38] rounded-xl shadow-inner mb-3">
              <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                <Chessboard position="rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1" arePiecesDraggable={false} />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-extrabold text-cyan-300 bg-[#122b3b]/60 border border-[#204963] p-2.5 rounded-xl">
              <Cpu size={18} className="shrink-0 text-cyan-400" />
              <span>Stockfish 18 Engine Lines</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('analysis')}
            className="w-full py-3.5 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] text-white font-black rounded-xl text-xs uppercase border-b-4 border-[#3f5c20] shadow-lg tracking-wider transition-all flex items-center justify-center gap-2 active:translate-y-0.5"
          >
            <BarChart2 size={16} />
            <span>START GAME ANALYSIS</span>
          </button>
        </div>

        {/* COLUMN 4: GAME REPLAY CARD */}
        <div className="bg-[#1e1d1b] border border-[#3e3b38] rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-extrabold text-xl text-white tracking-wide">Game Replay</h2>
              <span className="text-[10px] font-black text-purple-300 bg-[#29173b] px-2.5 py-0.5 rounded-full border border-[#4f2a70]">REPLAY</span>
            </div>

            <div className="p-2 bg-[#262421] border border-[#3e3b38] rounded-xl shadow-inner mb-3">
              <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                <Chessboard position="rnbqkbnr/pppp1ppp/4p3/8/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 1 3" arePiecesDraggable={false} />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-extrabold text-gray-300 bg-[#262421] border border-[#3e3b38] p-2.5 rounded-xl">
              <span>♟ Game Replay</span>
              <span className="text-[#81b64c]">PGN Viewer</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('review')}
            className="w-full py-3.5 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] text-white font-black rounded-xl text-xs uppercase border-b-4 border-[#3f5c20] shadow-lg tracking-wider transition-all flex items-center justify-center gap-2 active:translate-y-0.5"
          >
            <Upload size={16} />
            <span>UPLOAD & REPLAY GAME</span>
          </button>
        </div>

      </div>
    </div>
  );
}
