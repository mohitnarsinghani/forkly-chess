import React from 'react';
import { Home, Puzzle, Bot, FileSearch, Sparkles } from 'lucide-react';

export function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'puzzlesMap', label: 'Puzzles', icon: Puzzle },
    { id: 'coach', label: 'Play Bots', icon: Bot },
    { id: 'analysis', label: 'Analysis', icon: FileSearch },
    { id: 'features', label: 'Features', icon: Sparkles },
  ];

  return (
    <div className="bg-[#161512] border-t border-[#262421] px-2 py-1.5 flex items-center justify-around font-['Nunito',sans-serif]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
              isActive
                ? 'text-[#81b64c] font-black'
                : 'text-neutral-400 hover:text-white font-bold'
            }`}
          >
            <Icon size={20} className={isActive ? 'text-[#81b64c]' : 'text-neutral-400'} />
            <span className="text-[10px] mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
