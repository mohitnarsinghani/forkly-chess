import React from 'react';
import { Bot, Puzzle, FileText, Cpu, Swords, Volume2, VolumeX } from 'lucide-react';
import { audio } from '../../services/audioService';

export function TopNavbar({ activeTab, setActiveTab, isMuted, setIsMuted }) {
  const navItems = [
    { id: 'bot', label: 'PLAY VS BOT', icon: Bot },
    { id: 'puzzles', label: 'PUZZLES', icon: Puzzle },
    { id: 'review', label: 'LOAD GAME', icon: FileText },
    { id: 'analysis', label: '3-LINE ANALYSIS', icon: Cpu },
    { id: 'passplay', label: 'PASS & PLAY', icon: Swords },
  ];

  return (
    <header className="w-full bg-[#1e1d1b]/90 backdrop-blur-md border-b border-[#3e3b38] sticky top-0 z-40 px-4 md:px-8 py-3 select-none font-['Montserrat',sans-serif]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo: < CHESSIO /> */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#81b64c] to-[#457521] flex items-center justify-center text-xl shadow-lg text-black font-black">
            ♟
          </div>
          <div>
            <h1 className="font-extrabold text-lg md:text-xl tracking-wider font-mono text-white flex items-center gap-1">
              <span className="text-[#81b64c]">&lt;</span>
              <span>CHESSIO</span>
              <span className="text-[#81b64c]">/&gt;</span>
            </h1>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3.5 py-2 font-mono text-xs font-bold tracking-wider transition-all duration-150 ${
                  isActive
                    ? 'text-[#81b64c] font-extrabold'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {/* Active Underline Bar */}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#81b64c] rounded-full shadow-[0_0_8px_#81b64c]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Status Badge & Mute Toggle */}
        <div className="flex items-center gap-3">
          {/* Status Pill Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-[#81b64c]/10 border border-[#81b64c]/30 px-3 py-1 rounded-full text-[11px] font-mono font-bold text-[#81b64c]">
            <span className="w-2 h-2 rounded-full bg-[#81b64c] animate-pulse"></span>
            <span>STOCKFISH 18 // ONLINE</span>
          </div>

          <button
            onClick={() => {
              const newMute = !isMuted;
              setIsMuted(newMute);
              audio.muted = newMute;
              if (!newMute) audio.playMove();
            }}
            className="p-2 rounded-lg bg-[#302e2b] border border-[#3e3b38] hover:border-[#81b64c]/50 text-gray-300 hover:text-white transition"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX size={18} className="text-rose-400" /> : <Volume2 size={18} className="text-[#81b64c]" />}
          </button>
        </div>
      </div>
    </header>
  );
}
