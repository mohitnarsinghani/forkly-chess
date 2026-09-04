import React from 'react';
import { EvaluationState } from '../../types';

interface BestMoveDisplayProps {
  evaluation: EvaluationState;
  turn: 'w' | 'b';
  inCheck: boolean;
  isGameOver: boolean;
  isEngineEnabled: boolean;
  onToggleEngine: () => void;
  activeArrowRank: number | null;
  onSelectArrowRank: (rank: number | null) => void;
  moveHistory?: Array<{ san: string; num: number; isWhite: boolean }>;
}

export const BestMoveDisplay: React.FC<BestMoveDisplayProps> = ({
  evaluation,
  turn,
  inCheck,
  isGameOver,
  isEngineEnabled,
  onToggleEngine,
  activeArrowRank,
  onSelectArrowRank,
  moveHistory = [],
}) => {
  const { topMoves = [], bestMove, scoreText = '+0.5', depth, source, isLoading } =
    evaluation;

  const lines = topMoves.length > 0 ? topMoves : bestMove ? [bestMove] : [];

  return (
    <div
      id="chessvision-analysis-panel"
      className="w-full bg-white text-zinc-900 border-b border-zinc-300 select-none shadow-sm flex flex-col"
    >
      {/* Top Row: Big Score + Stockfish Depth + Toggle Switch (Exact Screenshot UI) */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-zinc-150">
        {/* Left: Big Bold Score + Engine info */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black font-sans tracking-tight text-zinc-900 leading-none">
            {isEngineEnabled ? scoreText || '+0.0' : '-'}
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
              <span>Stockfish 18</span>
              <span className="px-1.5 py-0.5 text-[9px] bg-emerald-100 text-emerald-800 font-bold rounded">
                NNUE
              </span>
            </span>
            <span className="text-[11px] text-zinc-500 font-medium">
              {isLoading
                ? 'Stockfish 18 thinking...'
                : `Depth ${depth || 14} • MultiPV 3`}
            </span>
          </div>
        </div>

        {/* Right: Orange Toggle Switch + "Toggle engine" */}
        <div className="flex items-center gap-2">
          {/* Custom Orange Switch from Screenshot */}
          <button
            id="toggle-engine-switch-main"
            role="switch"
            aria-checked={isEngineEnabled}
            onClick={onToggleEngine}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isEngineEnabled ? 'bg-[#ea580c]' : 'bg-zinc-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isEngineEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex flex-col leading-tight text-right">
            <span className="text-[11px] font-semibold text-zinc-700">Toggle</span>
            <span className="text-[11px] text-zinc-500 -mt-0.5">engine</span>
          </div>
        </div>
      </div>

      {/* Engine Multi-Lines (Exact Chessvision.ai layout) */}
      {isEngineEnabled && (
        <div className="divide-y divide-zinc-150">
          {isLoading ? (
            <div className="px-4 py-3 text-xs text-zinc-500 animate-pulse">
              Querying engine lines...
            </div>
          ) : lines.length === 0 ? (
            <div className="px-4 py-2.5 text-xs text-zinc-500">
              No legal moves available
            </div>
          ) : (
            lines.slice(0, 3).map((line, idx) => {
              const rank = (line.rank || idx + 1) as 1 | 2 | 3;
              const isSelected = activeArrowRank === null || activeArrowRank === rank;

              return (
                <div
                  key={line.uci || idx}
                  onClick={() =>
                    onSelectArrowRank(activeArrowRank === rank ? null : rank)
                  }
                  className={`px-4 py-1.5 flex items-center gap-2.5 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-50/90 hover:bg-zinc-100'
                      : 'opacity-50 hover:opacity-90'
                  }`}
                  title={`Line ${rank}: click to focus arrow`}
                >
                  {/* Score */}
                  <span className="font-bold font-sans text-zinc-900 min-w-[34px]">
                    {line.scoreText || '+0.0'}
                  </span>

                  {/* Moves Sequence in Algebraic (e.g. 2.c4 e6 3.Nf3 d5 ...) */}
                  <div className="flex-1 overflow-x-auto scrollbar-none whitespace-nowrap font-medium text-zinc-800 tracking-normal">
                    {line.pvList && line.pvList.length > 0 ? (
                      line.pvList.slice(0, 8).map((moveSan, mIdx) => {
                        const moveNumber = Math.floor(mIdx / 2) + (turn === 'w' ? 1 : 1);
                        const isWhiteMove = mIdx % 2 === 0 ? turn === 'w' : turn !== 'w';
                        const prefix =
                          mIdx === 0
                            ? `${moveNumber}.${turn === 'b' ? '..' : ''}`
                            : isWhiteMove
                            ? `${moveNumber}.`
                            : '';

                        return (
                          <span key={mIdx} className="mr-1.5">
                            {prefix && (
                              <span className="text-zinc-600 font-normal">
                                {prefix}
                              </span>
                            )}
                            <span
                              className={
                                mIdx === 0
                                  ? 'font-bold text-zinc-950 underline decoration-[#ea580c] decoration-2 underline-offset-2'
                                  : 'text-zinc-700'
                              }
                            >
                              {moveSan}
                            </span>
                          </span>
                        );
                      })
                    ) : (
                      <span>{line.san || line.uci}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Move History Strip with Orange Active Move Pill (from screenshot: 1.d4 [Nf6]) */}
      <div className="px-4 py-2 bg-white border-t border-zinc-200 flex items-center gap-2 text-xs font-semibold overflow-x-auto scrollbar-none">
        {moveHistory.length === 0 ? (
          <span className="text-zinc-400 font-normal italic">
            Starting position
          </span>
        ) : (
          moveHistory.map((item, idx) => {
            const isLast = idx === moveHistory.length - 1;
            const prefix = item.isWhite ? `${item.num}.` : '';

            return (
              <div key={idx} className="flex items-center gap-1 shrink-0">
                {prefix && <span className="text-zinc-500">{prefix}</span>}
                <span
                  className={
                    isLast
                      ? 'bg-[#ea580c] text-white px-2 py-0.5 rounded font-bold text-xs shadow-sm'
                      : 'text-zinc-800'
                  }
                >
                  {item.san}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
