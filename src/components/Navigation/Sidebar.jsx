import React from 'react';
import { Play, Puzzle, Cpu, ChevronDown, Gem, Search, Settings, Mail, Volume2, VolumeX, Sparkles, Trophy, GraduationCap } from 'lucide-react';
import { audio } from '../../services/audioService';

export function Sidebar({ activeTab, setActiveTab, isMuted, setIsMuted, onOpenFeatures }) {
  const navItems = [
    { id: 'bot', label: 'Play', icon: Play },
    { id: 'puzzles', label: 'Puzzles', icon: Puzzle },
    { id: 'analysis', label: 'Analysis', icon: Cpu },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy, isComingSoon: true },
    { id: 'learn', label: 'Learn', icon: GraduationCap, isComingSoon: true },
    { id: 'features', label: 'What can I do?', icon: Sparkles, isHighlight: true },
    { id: 'more', label: 'More', icon: ChevronDown },
  ];

  return (
    <aside className="w-full md:w-56 bg-[#161512] border-r border-[#262421] flex flex-col justify-between shrink-0 select-none h-full min-h-screen font-['Nunito',sans-serif]">
      <div>
        {/* Header / Brand Logo */}
        <div className="p-4 flex items-center justify-between border-b border-[#262421]">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#81b64c] to-[#5b8233] border border-lime-400/40 flex items-center justify-center text-lg shadow font-black text-black">
              ♟️
            </div>
            <h1 className="font-black text-xl text-white tracking-tight">
              Fork<span className="text-[#81b64c]">ly</span>
            </h1>
          </div>

          <button
            onClick={() => {
              const newMute = !isMuted;
              setIsMuted(newMute);
              audio.muted = newMute;
              if (!newMute) audio.playMove();
            }}
            className="p-1.5 rounded-lg bg-[#262421] text-neutral-400 hover:text-white transition"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-[#81b64c]" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'bot' && activeTab === 'home') || (item.id === 'puzzles' && activeTab === 'puzzlesMap');
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isComingSoon) return;
                  if (item.id === 'bot') setActiveTab('home');
                  else if (item.id === 'puzzles') setActiveTab('puzzlesMap');
                  else if (item.id === 'analysis') setActiveTab('analysis');
                  else if (item.id === 'features') {
                    if (onOpenFeatures) onOpenFeatures();
                    else setActiveTab('features');
                  }
                  else setActiveTab('home');
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-extrabold text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#262421] text-white shadow-sm border-l-4 border-[#81b64c]'
                    : item.isHighlight
                    ? 'text-lime-400 hover:bg-[#262421] bg-[#1c3614]/40 border border-[#395e28]/40'
                    : item.isComingSoon
                    ? 'text-neutral-500 cursor-not-allowed opacity-75'
                    : 'text-neutral-300 hover:bg-[#262421] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={item.isHighlight ? 'text-lime-400' : isActive ? 'text-[#81b64c]' : item.isComingSoon ? 'text-neutral-600' : 'text-neutral-400'} />
                  <span className="tracking-wide">{item.label}</span>
                </div>

                {item.isComingSoon && (
                  <span className="text-[9px] font-black uppercase bg-[#262421] text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Card */}
      <div className="p-3 border-t border-[#262421] bg-[#161512] space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white cursor-pointer" onClick={() => setActiveTab('profile')}>
          <Search size={16} />
          <span>Search</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('profile')}>
            <div className="w-8 h-8 rounded-full bg-amber-700/80 flex items-center justify-center text-sm font-bold border border-amber-500/40">
              🎅
            </div>
            <span className="font-bold text-xs text-white truncate max-w-[100px]">
              User
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-neutral-400">
            <Mail size={15} className="hover:text-white cursor-pointer" />
            <Settings size={15} className="hover:text-white cursor-pointer" />
          </div>
        </div>
      </div>
    </aside>
  );
}
