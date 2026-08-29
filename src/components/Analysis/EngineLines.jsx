import React from 'react';
import { Cpu, ArrowUpRight, Copy, Check } from 'lucide-react';

export function EngineLines({ lines = [], isCalculating = false, fen = '', onSelectLine }) {
  const [copied, setCopied] = React.useState(false);

  const copyFen = () => {
    navigator.clipboard.writeText(fen);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-chess-panel border border-chess-border rounded-xl p-4 space-y-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-chess-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="text-chess-accent animate-pulse" size={20} />
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">3-Line Engine Analysis</h3>
        </div>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold">
          Stockfish 18
        </span>
      </div>

      {/* Copy FEN section */}
      <div className="flex items-center justify-between bg-chess-card p-2.5 rounded-lg border border-chess-border">
        <div className="truncate text-xs font-mono text-chess-textMuted mr-2 select-all">
          <span className="text-chess-accent font-bold">FEN:</span> {fen}
        </div>
        <button
          onClick={copyFen}
          className="flex items-center gap-1 text-xs px-2.5 py-1 bg-chess-panel hover:bg-chess-border text-gray-200 rounded font-semibold transition shrink-0"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* 3 Engine Lines list */}
      <div className="space-y-2">
        {lines.length === 0 ? (
          <div className="text-xs text-chess-textMuted italic p-4 text-center">
            Calculating best moves...
          </div>
        ) : (
          lines.map((line, idx) => (
            <div
              key={idx}
              onClick={() => onSelectLine && onSelectLine(line.move)}
              className="p-3 bg-chess-card hover:bg-chess-card/80 border border-chess-border hover:border-chess-accent/60 rounded-xl transition cursor-pointer space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-chess-panel border border-chess-border text-[10px] font-bold flex items-center justify-center text-chess-accent">
                    #{idx + 1}
                  </span>
                  <span className="font-mono text-base font-extrabold text-white group-hover:text-chess-accent transition">
                    {line.move?.san}
                  </span>
                </div>
                <span
                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                    line.score >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {line.formattedScore}
                </span>
              </div>

              <div className="text-xs font-mono text-chess-textMuted flex items-center gap-1 truncate">
                <ArrowUpRight size={14} className="text-chess-accent shrink-0" />
                <span className="truncate">{line.pv}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
