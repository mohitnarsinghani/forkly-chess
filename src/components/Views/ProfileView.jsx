import React from 'react';
import { Calendar, Puzzle, Trophy, Zap, Clock, Rocket, LogOut, ShieldCheck } from 'lucide-react';

export function ProfileView({ user, onLogout, onOpenAuth }) {
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto min-h-[60vh] text-center space-y-4 font-['Nunito',sans-serif]">
        <div className="w-16 h-16 rounded-2xl bg-[#1e1d1b] border border-[#3e3b38] flex items-center justify-center text-3xl shadow-xl">
          👤
        </div>
        <h2 className="text-xl font-extrabold text-white">Log In to View Profile</h2>
        <p className="text-xs text-neutral-400">Track your ratings, matches, and solved puzzles across sessions.</p>
        <button
          onClick={onOpenAuth}
          className="w-full py-3.5 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] border-b-4 border-[#3f5c20] text-white font-black rounded-xl text-sm transition uppercase tracking-wider shadow active:translate-y-0.5"
        >
          Log In / Sign Up
        </button>
      </div>
    );
  }

  const puzzlesSolved = parseInt(localStorage.getItem('chess_puzzles_solved') || '0', 10);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6 font-['Nunito',sans-serif] pb-28">
      {/* Profile Header Banner */}
      <div className="bg-[#1e1d1b] border border-[#3e3b38] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#81b64c] to-[#5b8233] border-2 border-lime-400 flex items-center justify-center text-4xl shadow-lg text-white shrink-0">
          ♚
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-black text-white tracking-wide">{user.username}</h2>
            <span className="text-sm">🇳🇴</span>
            <ShieldCheck size={18} className="text-[#81b64c]" title="Verified Account" />
          </div>

          <p className="text-xs font-mono text-neutral-400">{user.email}</p>

          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-neutral-400 pt-1 font-semibold">
            <Calendar size={14} className="text-[#81b64c]" />
            <span>Joined {user.joinDate || 'August 2026'}</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl bg-[#262421] hover:bg-rose-500/20 hover:text-rose-400 text-gray-300 border border-[#3e3b38] transition text-xs font-black flex items-center gap-1.5 shadow"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Puzzles Solved Highlight Banner */}
      <div className="bg-[#1e1d1b] border border-[#81b64c]/40 p-5 rounded-2xl flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#81b64c] to-[#5b8233] text-white flex items-center justify-center text-2xl font-bold shadow">
            🧩
          </div>
          <div>
            <h3 className="font-black text-base text-white">Puzzles Solved</h3>
            <p className="text-xs text-lime-400 font-bold">Tactical Master Record</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-3xl font-black font-mono text-white">{puzzlesSolved}</span>
          <span className="block text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Solved</span>
        </div>
      </div>

      {/* Ratings Stats Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider">Rating Stats</h3>
        <div className="grid grid-cols-3 gap-3">
          {/* Blitz */}
          <div className="bg-[#1e1d1b] border border-[#3e3b38] p-4 rounded-2xl text-center space-y-1 shadow">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-1">
              <Zap size={18} />
            </div>
            <p className="text-xl font-black text-white font-mono">1343</p>
            <p className="text-[11px] font-extrabold text-neutral-400">Blitz</p>
          </div>

          {/* Rapid */}
          <div className="bg-[#1e1d1b] border border-[#3e3b38] p-4 rounded-2xl text-center space-y-1 shadow">
            <div className="w-8 h-8 rounded-lg bg-lime-500/15 border border-lime-500/30 flex items-center justify-center text-lime-400 mx-auto mb-1">
              <Clock size={18} />
            </div>
            <p className="text-xl font-black text-white font-mono">1338</p>
            <p className="text-[11px] font-extrabold text-neutral-400">Rapid</p>
          </div>

          {/* Bullet */}
          <div className="bg-[#1e1d1b] border border-[#3e3b38] p-4 rounded-2xl text-center space-y-1 shadow">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto mb-1">
              <Rocket size={18} />
            </div>
            <p className="text-xl font-black text-white font-mono">1280</p>
            <p className="text-[11px] font-extrabold text-neutral-400">Bullet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
