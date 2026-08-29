import React from 'react';
import { ArrowLeft, Play, Bot, Puzzle, Search, Upload, Swords, Sparkles, ChevronRight, HelpCircle, Trophy } from 'lucide-react';

export function FeaturesView({ onNavigate, onBack }) {
  const featureList = [
    {
      id: 'play_online',
      title: 'Play Online Matches',
      badge: 'Live',
      badgeColor: 'text-lime-400 bg-[#1c3614] border-[#395e28]',
      icon: '⏱️',
      iconBg: 'from-[#81b64c] to-[#5b8233]',
      desc: 'Play live chess against online players with custom time controls (10 min rapid, 5 min blitz, 3 days daily).',
      actionText: 'Play Online',
      target: 'home'
    },
    {
      id: 'play_bots',
      title: 'Stockfish & Personality Bots',
      badge: 'AI Engine',
      badgeColor: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
      icon: '🤖',
      iconBg: 'from-purple-600 to-indigo-600',
      desc: 'Challenge Stockfish 18 or 20+ personality bots organized into 5 skill tiers from Beginner to Grandmaster.',
      actionText: 'Choose Bot',
      target: 'coach'
    },
    {
      id: 'puzzles',
      title: 'Isometric Puzzles Map',
      badge: 'Tactics',
      badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      icon: '🧩',
      iconBg: 'from-amber-500 to-orange-600',
      desc: 'Solve 40,000+ tactical puzzles on a winding map with strategy tips from Coach Sam.',
      actionText: 'Solve Puzzles',
      target: 'puzzlesMap'
    },
    {
      id: 'analysis',
      title: 'Game & FEN/PGN Analysis',
      badge: 'Engine',
      badgeColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
      icon: '🔍',
      iconBg: 'from-cyan-600 to-blue-600',
      desc: 'Analyze any chess position or complete match by uploading FEN/PGN with live Stockfish evaluation & graph.',
      actionText: 'Analyze Position',
      target: 'analysis'
    },
    {
      id: 'review',
      title: 'Load Game & PGN Replay',
      badge: 'Review',
      badgeColor: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
      icon: '📜',
      iconBg: 'from-indigo-600 to-purple-600',
      desc: 'Load past games from PGN or raw text, step through moves turn-by-turn, and review accuracy ratings.',
      actionText: 'Load Game PGN',
      target: 'review'
    },
    {
      id: 'passplay',
      title: 'Pass & Play (2 Players)',
      badge: 'Local',
      badgeColor: 'text-lime-400 bg-[#1c3614] border-[#395e28]',
      icon: '⚔️',
      iconBg: 'from-[#81b64c] to-[#5b8233]',
      desc: 'Play a face-to-face match with a friend on one single device with automatic board flip and turn timer.',
      actionText: 'Pass & Play',
      target: 'passplay'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-4 pb-28 select-none font-['Nunito',sans-serif] space-y-6">
      
      {/* Top Navigation & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-[#161512] border border-[#3e3b38] text-neutral-300 hover:text-white flex items-center justify-center transition shadow hover:border-[#81b64c]"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-2.5 font-black text-lg text-white">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#81b64c] to-[#5b8233] border border-lime-400/40 flex items-center justify-center text-lg shadow font-black text-black">
            ♟️
          </div>
          <span>Features & App Guide</span>
        </div>

        <div className="w-10 h-10" />
      </div>

      {/* Hero Welcome Card */}
      <div className="bg-[#1e1d1b] border border-[#3e3b38] p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#81b64c] to-[#5b8233] border border-lime-400/40 flex items-center justify-center text-3xl shadow shrink-0">
            ✨
          </div>
          <div>
            <h1 className="font-black text-xl text-white tracking-tight">What can you do on Forkly?</h1>
            <p className="text-xs text-neutral-400 font-semibold mt-0.5 leading-relaxed">
              Explore everything Forkly has to offer — from online matches and bot battles to tactical puzzles & engine analysis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#1c3614] border border-[#395e28] px-4 py-2 rounded-full text-xs font-black text-lime-400 shadow shrink-0">
          <Sparkles size={16} />
          <span>6 Main Features</span>
        </div>
      </div>

      {/* Grid of Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
        {featureList.map((f) => (
          <div
            key={f.id}
            className="bg-[#1e1d1b] border border-[#3e3b38] rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4 hover:border-[#81b64c] transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.iconBg} border border-white/20 flex items-center justify-center text-2xl shadow shrink-0`}>
                  {f.icon}
                </div>
                <span className={`text-[11px] font-black uppercase px-3 py-0.5 rounded-full border ${f.badgeColor}`}>
                  {f.badge}
                </span>
              </div>

              <h2 className="font-black text-lg text-white tracking-tight mb-1.5">{f.title}</h2>
              <p className="text-xs text-neutral-400 font-semibold leading-relaxed">{f.desc}</p>
            </div>

            <button
              onClick={() => onNavigate(f.target)}
              className="w-full py-3 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] border-b-2 border-[#3f5c20] text-white font-black rounded-xl text-xs uppercase shadow tracking-wider transition-all flex items-center justify-center gap-2 active:translate-y-0.5"
            >
              <span>{f.actionText}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
