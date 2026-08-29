import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export function MoveHistory({
  history = [],
  currentPly = 0,
  onGoToMove
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length]);

  const movePairs = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: history[i],
      whitePly: i + 1,
      black: history[i + 1] || null,
      blackPly: i + 2
    });
  }

  return (
    <div className="bg-[#1e1d1b] border border-[#3e3b38] rounded-2xl flex flex-col h-full overflow-hidden shadow-xl font-['Nunito',sans-serif]">
      <div className="p-3 bg-[#262421] border-b border-[#3e3b38] flex items-center justify-between font-mono">
        <h3 className="font-extrabold text-xs uppercase text-[#81b64c] tracking-wider">Move History</h3>
        <span className="text-[10px] bg-[#1c3614] border border-[#395e28] text-lime-400 px-2 py-0.5 rounded-full font-mono font-extrabold">
          {history.length} PLIES
        </span>
      </div>

      {/* Move List */}
      <div ref={scrollRef} className="flex-1 p-2 overflow-y-auto font-mono text-sm space-y-1">
        {movePairs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-neutral-400 italic">
            No moves played yet
          </div>
        ) : (
          movePairs.map((pair) => (
            <div key={pair.moveNumber} className="grid grid-cols-7 gap-1 items-center px-2 py-1 rounded-lg hover:bg-[#262421]">
              <span className="col-span-1 text-xs text-neutral-400 font-bold">{pair.moveNumber}.</span>

              {/* White Move */}
              <button
                onClick={() => onGoToMove && onGoToMove(pair.whitePly)}
                className={`col-span-3 text-left px-2 py-1 rounded-md text-xs font-semibold transition ${
                  currentPly === pair.whitePly
                    ? 'bg-[#81b64c] text-white font-extrabold shadow'
                    : 'text-gray-200 hover:bg-[#302e2b] hover:text-white'
                }`}
              >
                {pair.white?.san || pair.white}
              </button>

              {/* Black Move */}
              {pair.black ? (
                <button
                  onClick={() => onGoToMove && onGoToMove(pair.blackPly)}
                  className={`col-span-3 text-left px-2 py-1 rounded-md text-xs font-semibold transition ${
                    currentPly === pair.blackPly
                      ? 'bg-[#81b64c] text-white font-extrabold shadow'
                      : 'text-gray-200 hover:bg-[#302e2b] hover:text-white'
                  }`}
                >
                  {pair.black?.san || pair.black}
                </button>
              ) : (
                <span className="col-span-3"></span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Navigation Buttons */}
      {onGoToMove && (
        <div className="p-2 bg-[#262421] border-t border-[#3e3b38] grid grid-cols-4 gap-1">
          <button
            onClick={() => onGoToMove(0)}
            disabled={currentPly === 0}
            className="flex items-center justify-center p-2 rounded-lg bg-[#1e1d1b] hover:bg-[#302e2b] disabled:opacity-30 text-white transition"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            onClick={() => onGoToMove(Math.max(0, currentPly - 1))}
            disabled={currentPly === 0}
            className="flex items-center justify-center p-2 rounded-lg bg-[#1e1d1b] hover:bg-[#302e2b] disabled:opacity-30 text-white transition"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onGoToMove(Math.min(history.length, currentPly + 1))}
            disabled={currentPly === history.length}
            className="flex items-center justify-center p-2 rounded-lg bg-[#1e1d1b] hover:bg-[#302e2b] disabled:opacity-30 text-white transition"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => onGoToMove(history.length)}
            disabled={currentPly === history.length}
            className="flex items-center justify-center p-2 rounded-lg bg-[#1e1d1b] hover:bg-[#302e2b] disabled:opacity-30 text-white transition"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
