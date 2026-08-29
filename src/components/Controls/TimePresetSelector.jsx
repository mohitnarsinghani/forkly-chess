import React from 'react';
import { Rocket, Zap, Clock, Ban } from 'lucide-react';

export const TIME_PRESETS = [
  { id: 'bullet_1_0', category: 'Bullet', label: '1 min', seconds: 60, increment: 0, icon: Rocket },
  { id: 'bullet_1_1', category: 'Bullet', label: '1 + 1', seconds: 60, increment: 1, icon: Rocket },
  { id: 'bullet_2_1', category: 'Bullet', label: '2 + 1', seconds: 120, increment: 1, icon: Rocket },
  
  { id: 'blitz_3_0', category: 'Blitz', label: '3 min', seconds: 180, increment: 0, icon: Zap },
  { id: 'blitz_3_2', category: 'Blitz', label: '3 + 2', seconds: 180, increment: 2, icon: Zap },
  { id: 'blitz_5_0', category: 'Blitz', label: '5 min', seconds: 300, increment: 0, icon: Zap },

  { id: 'rapid_10_0', category: 'Rapid', label: '10 min', seconds: 600, increment: 0, icon: Clock },
  { id: 'rapid_10_5', category: 'Rapid', label: '10 + 5', seconds: 600, increment: 5, icon: Clock },
  { id: 'rapid_15_10', category: 'Rapid', label: '15 + 10', seconds: 900, increment: 10, icon: Clock },
];

export function TimePresetSelector({ selectedPreset, onSelectPreset, enableTimer, onToggleEnableTimer }) {
  return (
    <div className="bg-[#1e1d1b] border border-[#3e3b38] p-4.5 rounded-2xl space-y-4 shadow-xl font-['Nunito',sans-serif]">
      <div className="flex items-center justify-between border-b border-[#262421] pb-3">
        <h3 className="text-xs font-black uppercase text-neutral-400 flex items-center gap-1.5">
          <Clock size={16} className="text-[#81b64c]" />
          Time Controls
        </h3>

        <label className="flex items-center gap-2 text-xs font-extrabold text-gray-300 cursor-pointer">
          <span>Enable Timer</span>
          <input
            type="checkbox"
            checked={enableTimer}
            onChange={(e) => onToggleEnableTimer(e.target.checked)}
            className="accent-[#81b64c] w-4 h-4 rounded"
          />
        </label>
      </div>

      {!enableTimer ? (
        <div className="p-3 bg-[#262421] border border-[#3e3b38] rounded-xl text-center text-xs text-neutral-400 font-bold flex items-center justify-center gap-2">
          <Ban size={16} className="text-amber-400" />
          <span>Unlimited Time (No Clocks)</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Bullet Section */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-neutral-400">
              <Rocket size={12} className="text-amber-400" />
              <span>Bullet</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TIME_PRESETS.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectPreset(p)}
                  className={`py-2 px-1 rounded-xl border text-xs font-extrabold font-mono transition ${
                    selectedPreset?.id === p.id
                      ? 'bg-[#81b64c] text-white border-lime-400 shadow-md ring-2 ring-[#81b64c]'
                      : 'bg-[#262421] border-[#3e3b38] text-gray-300 hover:bg-[#302e2b]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Blitz Section */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-neutral-400">
              <Zap size={12} className="text-yellow-400" />
              <span>Blitz</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TIME_PRESETS.slice(3, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectPreset(p)}
                  className={`py-2 px-1 rounded-xl border text-xs font-extrabold font-mono transition ${
                    selectedPreset?.id === p.id
                      ? 'bg-[#81b64c] text-white border-lime-400 shadow-md ring-2 ring-[#81b64c]'
                      : 'bg-[#262421] border-[#3e3b38] text-gray-300 hover:bg-[#302e2b]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rapid Section */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-neutral-400">
              <Clock size={12} className="text-lime-400" />
              <span>Rapid</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TIME_PRESETS.slice(6, 9).map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectPreset(p)}
                  className={`py-2 px-1 rounded-xl border text-xs font-extrabold font-mono transition ${
                    selectedPreset?.id === p.id
                      ? 'bg-[#81b64c] text-white border-lime-400 shadow-md ring-2 ring-[#81b64c]'
                      : 'bg-[#262421] border-[#3e3b38] text-gray-300 hover:bg-[#302e2b]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
