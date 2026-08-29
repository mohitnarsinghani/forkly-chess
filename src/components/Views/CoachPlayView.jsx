import React, { useState } from 'react';
import { ArrowLeft, Settings, ChevronDown, ChevronUp, Play, Bot, Trophy, Sparkles, Check, GraduationCap } from 'lucide-react';
import { BotPlayView } from './BotPlayView';
import { ColorSelector } from '../Controls/ColorSelector';

export function CoachPlayView({ onBack }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedBot, setSelectedBot] = useState({
    name: 'Strategy Coach',
    badge: 'Guided Learning',
    avatar: '🧔🏻‍♂️',
    desc: 'Provides in-game strategy tips, tactical guidance, and move explanations.',
    tier: 'Guided Coach',
    isCoach: true
  });
  const [selectedColor, setSelectedColor] = useState('w'); // 'w', 'b', 'r'
  const [expandedTiers, setExpandedTiers] = useState({
    'New to Chess': false,
    'Beginner': false,
    'Novice': false,
    'Intermediate': true, // Open by default
    'Master / Grandmaster': false
  });

  // 5 Skill Tiers with Accurate ELO Ratings & Personality Bots
  const tiers = [
    {
      name: 'New to Chess',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      bots: [
        { name: 'Martin', elo: 200, avatar: '👶', desc: 'Just learning how pieces move. Great for absolute beginners.', level: 1 },
        { name: 'Elani', elo: 300, avatar: '👧', desc: 'Loves pushing pawns and simple piece developments.', level: 1 },
      ]
    },
    {
      name: 'Beginner',
      badgeColor: 'bg-lime-500/20 text-lime-400 border-lime-500/40',
      bots: [
        { name: 'Sven', elo: 400, avatar: '👦', desc: 'Focuses on simple piece captures and basic defense.', level: 1 },
        { name: 'Komomo', elo: 500, avatar: '🐼', desc: 'Plays solid opening moves and looks for easy checks.', level: 1 },
      ]
    },
    {
      name: 'Novice',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      bots: [
        { name: 'Nelson', elo: 600, avatar: '👴', desc: 'Loves early Queen attacks. Watch out for quick checkmates!', level: 2 },
        { name: 'Isabel', elo: 800, avatar: '👩‍🦱', desc: 'Calculates short tactical combinations and piece forks.', level: 2 },
      ]
    },
    {
      name: 'Intermediate',
      badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
      bots: [
        { name: 'Mateo', elo: 1200, avatar: '🧔', desc: 'Plays positional chess, controls the center, and guards king safety.', level: 3 },
        { name: 'Pablo', elo: 1400, avatar: '👨‍🦰', desc: 'Punishes tactical blunders and executes clean endgame mates.', level: 3 },
      ]
    },
    {
      name: 'Master / Grandmaster',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      bots: [
        { name: 'Francis', elo: 1800, avatar: '🧙‍♂️', desc: 'Strong tactical calculation and precise defense under pressure.', level: 4 },
        { name: 'Stockfish Master', elo: 2200, avatar: '🤖', desc: 'Full Stockfish engine depth with grandmaster tactical precision.', level: 5 },
      ]
    }
  ];

  const toggleTier = (tierName) => {
    setExpandedTiers(prev => ({
      ...prev,
      [tierName]: !prev[tierName]
    }));
  };

  const resolvedColor = selectedColor === 'r' 
    ? (Math.random() < 0.5 ? 'w' : 'b') 
    : selectedColor;

  if (isPlaying) {
    return (
      <div className="min-h-screen bg-[#262421] text-white">
        <div className="px-4 pt-3 max-w-7xl mx-auto flex items-center justify-between font-['Nunito',sans-serif]">
          <button
            onClick={() => setIsPlaying(false)}
            className="flex items-center gap-2 text-xs font-black text-neutral-300 hover:text-white bg-[#161512] border border-[#3e3b38] px-4 py-2 rounded-xl transition shadow"
          >
            <ArrowLeft size={16} className="text-[#81b64c]" /> Back to Bot Selection
          </button>

          <div className="flex items-center gap-2 text-xs font-extrabold text-lime-400 bg-[#1c3614] border border-[#395e28] px-3.5 py-1.5 rounded-full shadow">
            <span>Playing vs {selectedBot.name} {selectedBot.elo ? `(${selectedBot.elo} ELO)` : `(${selectedBot.badge})`}</span>
          </div>
        </div>
        <BotPlayView
          selectedBot={selectedBot}
          selectedColor={resolvedColor}
          onBack={() => setIsPlaying(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 space-y-5 pb-28 select-none font-['Nunito',sans-serif]">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-[#161512] border border-[#3e3b38] text-neutral-300 hover:text-white flex items-center justify-center transition shadow"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-2.5 font-black text-lg text-white tracking-tight">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#81b64c] to-[#5b8233] border border-lime-400/40 flex items-center justify-center text-lg shadow font-black text-black">
            🤖
          </div>
          <span>Choose Your Bot Opponent</span>
        </div>

        <div className="w-10 h-10" />
      </div>

      {/* FEATURED TEACHING COACH CARD */}
      <div className="bg-[#1e1d1b] border-2 border-[#81b64c]/60 p-4 sm:p-5 rounded-2xl shadow-xl flex items-center justify-between gap-3.5">
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setSelectedBot({
          name: 'Strategy Coach',
          badge: 'Guided Learning',
          avatar: '🧔🏻‍♂️',
          desc: 'Provides in-game strategy tips, tactical guidance, and move explanations.',
          tier: 'Guided Coach',
          isCoach: true
        })}>
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#81b64c] to-[#5b8233] border-2 border-lime-400 flex items-center justify-center text-3xl shadow-lg shrink-0">
            🧔🏻‍♂️
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-extrabold text-base text-white">Strategy Coach</h3>
              <span className="text-[10px] font-black text-lime-400 bg-[#1c3614] border border-[#395e28] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <GraduationCap size={12} /> Guided Learning
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-semibold leading-relaxed">
              Provides in-game strategy advice and positional tips for learning players.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedBot({
              name: 'Strategy Coach',
              badge: 'Guided Learning',
              avatar: '🧔🏻‍♂️',
              desc: 'Provides in-game strategy tips, tactical guidance, and move explanations.',
              tier: 'Guided Coach',
              isCoach: true
            });
            setIsPlaying(true);
          }}
          className="px-4 py-2 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] text-white font-black text-xs rounded-xl border-b-2 border-[#3f5c20] shadow-md transition shrink-0 uppercase tracking-wider"
        >
          Train
        </button>
      </div>

      {/* Selected Bot & Color Configuration Card */}
      <div className="bg-[#1e1d1b] border border-[#3e3b38] p-5 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#81b64c] to-[#5b8233] border-2 border-lime-400 flex items-center justify-center text-3xl shadow-lg shrink-0">
            {selectedBot.avatar}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-extrabold text-lg text-white truncate">{selectedBot.name}</h3>
              <span className="text-xs font-black text-amber-400 bg-[#362714] border border-[#694b23] px-2.5 py-0.5 rounded-full">
                {selectedBot.elo ? `${selectedBot.elo} ELO` : selectedBot.badge || 'Guided Learning'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-semibold leading-snug">
              {selectedBot.desc}
            </p>
          </div>
        </div>

        {/* Color Selection & Big Play Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#262421]">
          <div className="flex flex-col items-center sm:items-start gap-1.5">
            <span className="text-[11px] font-extrabold uppercase text-neutral-400 tracking-wider">Play As</span>
            <ColorSelector selectedColor={selectedColor} onSelectColor={setSelectedColor} size="large" />
          </div>

          {/* Glossy Green Play Button */}
          <button
            onClick={() => setIsPlaying(true)}
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] text-white font-black rounded-xl text-sm uppercase border-b-4 border-[#3f5c20] shadow-lg tracking-wider transition-all flex items-center justify-center gap-2 active:translate-y-0.5"
          >
            <Play size={18} className="fill-white" />
            <span>PLAY VS {selectedBot.name.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* 5 SKILL TIERS ACCORDION LIST */}
      <div className="space-y-3 pt-2">
        <h2 className="font-extrabold text-xs text-neutral-400 uppercase tracking-wider px-1">
          Select Skill Tier
        </h2>

        {tiers.map((tier) => {
          const isExpanded = expandedTiers[tier.name];

          return (
            <div
              key={tier.name}
              className="bg-[#1e1d1b] border border-[#3e3b38] rounded-2xl overflow-hidden shadow-xl transition-all"
            >
              {/* Expandable Tier Header */}
              <button
                onClick={() => toggleTier(tier.name)}
                className="w-full p-4 flex items-center justify-between hover:bg-[#262421] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#262421] border border-[#3e3b38] flex items-center justify-center font-extrabold text-sm text-[#81b64c]">
                    ♟️
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-base text-white">{tier.name}</div>
                    <div className="text-[11px] text-neutral-400 font-semibold">{tier.bots.length} Bots Available</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${tier.badgeColor}`}>
                    {tier.name}
                  </span>
                  {isExpanded ? <ChevronUp size={20} className="text-neutral-400" /> : <ChevronDown size={20} className="text-neutral-400" />}
                </div>
              </button>

              {/* Bot Cards List inside Expanded Tier */}
              {isExpanded && (
                <div className="p-3 border-t border-[#262421] bg-[#161512] space-y-2.5">
                  {tier.bots.map((b) => {
                    const isSelected = selectedBot.name === b.name;

                    return (
                      <div
                        key={b.name}
                        onClick={() => setSelectedBot(b)}
                        className={`p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-[#243318] border-[#81b64c] shadow-md ring-2 ring-[#81b64c]'
                            : 'bg-[#1e1d1b] border-[#3e3b38] hover:border-[#524e49]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Bot Avatar */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#81b64c] to-[#5b8233] border border-lime-400 flex items-center justify-center text-2xl shadow-md shrink-0">
                            {b.avatar}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-white truncate">{b.name}</span>
                              <span className="text-[11px] font-black text-amber-400 font-mono">
                                ({b.elo} ELO)
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 font-semibold leading-snug line-clamp-1">
                              {b.desc}
                            </p>
                          </div>
                        </div>

                        {/* Select or Inline PLAY + Color Selector when selected */}
                        <div className="shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {isSelected ? (
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                              {/* Chess.com Style Color Selector */}
                              <ColorSelector selectedColor={selectedColor} onSelectColor={setSelectedColor} size="compact" />

                              {/* Direct PLAY Button in the Bot Row */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedBot(b);
                                  setIsPlaying(true);
                                }}
                                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] text-white font-black text-xs uppercase rounded-xl border-b-2 border-[#3f5c20] shadow-md flex items-center justify-center gap-1.5 shrink-0 active:translate-y-0.5"
                              >
                                <Play size={14} className="fill-white" />
                                <span>PLAY</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedBot(b)}
                              className="px-3.5 py-1.5 bg-[#262421] hover:bg-[#81b64c] text-white font-extrabold text-xs rounded-xl border border-[#3e3b38] hover:border-lime-400 transition shadow"
                            >
                              Select
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
