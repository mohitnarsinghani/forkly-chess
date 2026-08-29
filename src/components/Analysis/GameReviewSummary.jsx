import React from 'react';

export function GameReviewSummary({ reviewData }) {
  if (!reviewData) return null;

  const { whiteAccuracy, blackAccuracy, whiteCounts, blackCounts } = reviewData;

  const badgeRows = [
    { key: 'brilliant', label: 'Brilliant', icon: '‼️', color: 'text-teal-400', bg: 'bg-[#1baca6]/25 border border-teal-500/40' },
    { key: 'great', label: 'Great Move', icon: '!', color: 'text-blue-400', bg: 'bg-blue-500/25 border border-blue-500/40' },
    { key: 'best', label: 'Best Move', icon: '⭐', color: 'text-lime-400', bg: 'bg-[#81b64c]/25 border border-lime-500/40' },
    { key: 'excellent', label: 'Excellent', icon: '🟢', color: 'text-lime-500', bg: 'bg-lime-600/25 border border-lime-600/40' },
    { key: 'good', label: 'Good', icon: '👍', color: 'text-gray-300', bg: 'bg-gray-500/25 border border-gray-500/40' },
    { key: 'book', label: 'Book Move', icon: '📖', color: 'text-amber-400', bg: 'bg-amber-700/25 border border-amber-500/40' },
    { key: 'inaccuracy', label: 'Inaccuracy', icon: '🟡', color: 'text-yellow-400', bg: 'bg-yellow-500/25 border border-yellow-500/40' },
    { key: 'mistake', label: 'Mistake', icon: '🟠', color: 'text-orange-400', bg: 'bg-orange-500/25 border border-orange-500/40' },
    { key: 'miss', label: 'Miss', icon: '❌', color: 'text-rose-400', bg: 'bg-rose-600/25 border border-rose-500/40' },
    { key: 'blunder', label: 'Blunder', icon: '🔴', color: 'text-red-500', bg: 'bg-red-600/25 border border-red-500/40' },
  ];

  return (
    <div className="bg-[#1e1d1b] border border-[#3e3b38] rounded-2xl p-5 space-y-6 shadow-2xl">
      <div className="text-center border-b border-[#3e3b38] pb-4">
        <h2 className="text-lg font-black text-white tracking-wide uppercase">Game Review & Accuracy</h2>
        <p className="text-xs font-bold text-neutral-400">Stockfish 18 Automated Performance Analysis</p>
      </div>

      {/* Accuracy Gauges */}
      <div className="grid grid-cols-2 gap-4">
        {/* White Accuracy */}
        <div className="bg-[#262421] border border-[#3e3b38] rounded-xl p-4 text-center space-y-2">
          <p className="text-xs font-extrabold text-neutral-300 uppercase tracking-wider">White Accuracy</p>
          <div className="text-3xl font-black text-white font-mono">{whiteAccuracy}%</div>
          <div className="w-full bg-[#161512] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-lime-500 to-[#81b64c] h-full transition-all duration-700"
              style={{ width: `${whiteAccuracy}%` }}
            ></div>
          </div>
        </div>

        {/* Black Accuracy */}
        <div className="bg-[#262421] border border-[#3e3b38] rounded-xl p-4 text-center space-y-2">
          <p className="text-xs font-extrabold text-neutral-300 uppercase tracking-wider">Black Accuracy</p>
          <div className="text-3xl font-black text-white font-mono">{blackAccuracy}%</div>
          <div className="w-full bg-[#161512] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-lime-500 to-[#81b64c] h-full transition-all duration-700"
              style={{ width: `${blackAccuracy}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Move Classification Breakdown Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-black text-neutral-400 uppercase tracking-wider mb-2">
          Move Quality Breakdown
        </h4>
        <div className="space-y-1.5">
          {badgeRows.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-5 items-center p-2 rounded-xl bg-[#262421] border border-[#3e3b38]/70 text-xs font-bold"
            >
              <div className="col-span-1 text-center font-black text-white font-mono text-sm">
                {whiteCounts[row.key] || 0}
              </div>

              <div className="col-span-3 flex items-center justify-center gap-2">
                <span className={`px-3 py-1 rounded-lg ${row.bg} ${row.color} font-black text-xs flex items-center gap-1.5 shadow-sm`}>
                  <span>{row.icon}</span>
                  <span>{row.label}</span>
                </span>
              </div>

              <div className="col-span-1 text-center font-black text-white font-mono text-sm">
                {blackCounts[row.key] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
