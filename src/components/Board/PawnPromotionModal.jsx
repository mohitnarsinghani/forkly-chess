import React from 'react';

export function PawnPromotionModal({ isOpen, color = 'w', onSelect }) {
  if (!isOpen) return null;

  const pieces = [
    { type: 'q', label: 'Queen', icon: color === 'w' ? '♛' : '♕' },
    { type: 'r', label: 'Rook', icon: color === 'w' ? '♜' : '♖' },
    { type: 'b', label: 'Bishop', icon: color === 'w' ? '♝' : '♗' },
    { type: 'n', label: 'Knight', icon: color === 'w' ? '♞' : '♘' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-chess-card border border-chess-border p-6 rounded-2xl shadow-2xl max-w-xs w-full text-center space-y-4 animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-bold text-white">Promote Pawn</h3>
        <p className="text-xs text-chess-textMuted">Choose a piece for promotion:</p>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {pieces.map((p) => (
            <button
              key={p.type}
              onClick={() => onSelect(p.type)}
              className="flex flex-col items-center justify-center p-4 bg-chess-panel hover:bg-chess-accent hover:text-black border border-chess-border hover:border-chess-accent rounded-xl transition duration-150 group"
            >
              <span className="text-4xl mb-1 group-hover:scale-110 transition">{p.icon}</span>
              <span className="text-xs font-bold text-gray-200 group-hover:text-black">{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
