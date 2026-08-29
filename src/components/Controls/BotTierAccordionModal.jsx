import React, { useState } from 'react';
import { BOT_PROFILES } from '../../services/botProfiles';
import { X, ChevronDown, ChevronUp, Play, Check } from 'lucide-react';

const SKILL_TIERS = [
  { id: 'beginner', title: 'New to Chess & Beginner', minElo: 0, maxElo: 700, badge: '200 - 600 ELO' },
  { id: 'intermediate', title: 'Novice & Intermediate', minElo: 701, maxElo: 1400, badge: '800 - 1400 ELO' },
  { id: 'advanced', title: 'Advanced & Master', minElo: 1401, maxElo: 3000, badge: '1500+ ELO' },
];

export function BotTierAccordionModal({ isOpen, onClose, selectedBot, onSelectBot, onStartGame, playerColor, setPlayerColor }) {
  const [openTier, setOpenTier] = useState('beginner');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none font-['Nunito',sans-serif]">
      <div className="bg-[#1e1d1b] border border-[#3e3b38] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="p-4 bg-[#161512] border-b border-[#3e3b38] flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-xl text-white tracking-wide">Choose Your Bot Opponent</h2>
            <p className="text-xs font-semibold text-neutral-400 mt-0.5">Select a skill tier and bot to challenge</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#262421] border border-[#3e3b38] text-neutral-400 hover:text-white flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Color Choice Bar */}
        <div className="p-4 bg-[#262421] border-b border-[#3e3b38] flex items-center justify-between gap-4">
          <span className="text-xs font-black uppercase text-neutral-300">Play As:</span>
          
          <div className="flex items-center gap-3">
            {/* White Button */}
            <button
              onClick={() => setPlayerColor('white')}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition shadow-md ${
                playerColor === 'white'
                  ? 'bg-white text-black ring-2 ring-[#81b64c] ring-offset-2 ring-offset-[#262421] scale-105'
                  : 'bg-[#302e2b] text-neutral-400 hover:text-white border border-[#3e3b38]'
              }`}
              title="Play as White"
            >
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M12 2a1 1 0 0 1 1 1v1h2a1 1 0 1 1 0 2h-2v1.1c1.8.4 3 2 3 3.9 0 1.2-.5 2.2-1.3 3H16v2h1a1 1 0 0 1 1 1v4H6v-4a1 1 0 0 1 1-1h1v-2h.3c-.8-.8-1.3-1.8-1.3-3 0-1.9 1.2-3.5 3-3.9V6H9a1 1 0 1 1 0-2h2V3a1 1 0 0 1 1-1z" />
              </svg>
            </button>

            {/* Random Button */}
            <button
              onClick={() => setPlayerColor('random')}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition shadow-md font-black text-sm ${
                playerColor === 'random'
                  ? 'bg-gradient-to-r from-neutral-200 to-neutral-800 text-amber-400 ring-2 ring-[#81b64c] ring-offset-2 ring-offset-[#262421] scale-105'
                  : 'bg-[#302e2b] text-neutral-400 hover:text-white border border-[#3e3b38]'
              }`}
              title="Random Color"
            >
              🎲
            </button>

            {/* Black Button */}
            <button
              onClick={() => setPlayerColor('black')}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition shadow-md ${
                playerColor === 'black'
                  ? 'bg-black text-white ring-2 ring-[#81b64c] ring-offset-2 ring-offset-[#262421] scale-105 border border-neutral-700'
                  : 'bg-[#302e2b] text-neutral-400 hover:text-white border border-[#3e3b38]'
              }`}
              title="Play as Black"
            >
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M12 2a1 1 0 0 1 1 1v1h2a1 1 0 1 1 0 2h-2v1.1c1.8.4 3 2 3 3.9 0 1.2-.5 2.2-1.3 3H16v2h1a1 1 0 0 1 1 1v4H6v-4a1 1 0 0 1 1-1h1v-2h.3c-.8-.8-1.3-1.8-1.3-3 0-1.9 1.2-3.5 3-3.9V6H9a1 1 0 1 1 0-2h2V3a1 1 0 0 1 1-1z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Accordions Container */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {SKILL_TIERS.map((tier) => {
            const isOpenTier = openTier === tier.id;
            const botsInTier = BOT_PROFILES.filter((b) => b.elo >= tier.minElo && b.elo <= tier.maxElo);

            return (
              <div key={tier.id} className="bg-[#262421] border border-[#3e3b38] rounded-xl overflow-hidden shadow-sm">
                
                {/* Accordion Header */}
                <button
                  onClick={() => setOpenTier(isOpenTier ? null : tier.id)}
                  className="w-full p-3.5 flex items-center justify-between bg-[#262421] hover:bg-[#302e2b] transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-white">{tier.title}</span>
                    <span className="text-[10px] font-black text-lime-400 bg-[#1c3614] border border-[#395e28] px-2 py-0.5 rounded-full">
                      {tier.badge}
                    </span>
                  </div>

                  {isOpenTier ? <ChevronUp size={18} className="text-neutral-400" /> : <ChevronDown size={18} className="text-neutral-400" />}
                </button>

                {/* Accordion Content */}
                {isOpenTier && (
                  <div className="p-3 border-t border-[#3e3b38] space-y-2 bg-[#1e1d1b]">
                    {botsInTier.map((bot) => {
                      const isSelected = selectedBot?.id === bot.id;

                      return (
                        <div
                          key={bot.id}
                          onClick={() => onSelectBot(bot)}
                          className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#262421] border-[#81b64c] shadow-md ring-1 ring-[#81b64c]'
                              : 'bg-[#262421]/60 border-[#3e3b38] hover:border-neutral-500'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xl shadow shrink-0">
                              {bot.avatar || '🤖'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-white">{bot.name}</span>
                                <span className="text-[10px] font-black text-amber-400 font-mono">({bot.elo} ELO)</span>
                              </div>
                              <p className="text-[10px] text-neutral-400 font-semibold truncate max-w-xs">{bot.description}</p>
                            </div>
                          </div>

                          {isSelected ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartGame();
                              }}
                              className="px-4 py-2 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] border-b-2 border-[#3f5c20] text-white font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 active:translate-y-0.5"
                            >
                              <Play size={14} className="fill-white" />
                              <span>PLAY</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectBot(bot);
                              }}
                              className="px-3.5 py-1.5 bg-[#302e2b] hover:bg-[#3e3b38] text-neutral-300 hover:text-white font-extrabold text-xs rounded-xl border border-[#3e3b38] transition"
                            >
                              Select
                            </button>
                          )}
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
    </div>
  );
}
