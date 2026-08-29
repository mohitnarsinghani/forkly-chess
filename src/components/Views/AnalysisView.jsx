import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessboardContainer } from '../Board/ChessboardContainer';
import { EvalBar } from '../Board/EvalBar';
import { evaluateBoard, getTopEngineLines, getLichessCloudEval } from '../../services/stockfishEngine';
import { stockfishWorker } from '../../services/stockfishWorker';
import { Cpu, RotateCcw, ArrowRightLeft, ToggleLeft, ToggleRight, SkipBack, SkipForward, ChevronLeft, ChevronRight, Copy, Check, AlertCircle, Sparkles } from 'lucide-react';

export function AnalysisView() {
  const [chess, setChess] = useState(new Chess());
  const [history, setHistory] = useState([]);
  const [currentPly, setCurrentPly] = useState(0);
  const [evalScore, setEvalScore] = useState(0.0);
  const [topLines, setTopLines] = useState([]);
  const [customFenInput, setCustomFenInput] = useState('');
  const [customPgnInput, setCustomPgnInput] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [engineEnabled, setEngineEnabled] = useState(true);
  const [copiedFen, setCopiedFen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [engineError, setEngineError] = useState(null);
  const [engineSource, setEngineSource] = useState('Stockfish 18');

  // Recalculate 3 engine lines continuously on position update using Stockfish Worker & Cloud Eval
  useEffect(() => {
    if (!engineEnabled) {
      setTopLines([]);
      setEngineError(null);
      return;
    }

    let isMounted = true;
    let normalizedFen = '';

    try {
      normalizedFen = chess.fen();
    } catch (e) {
      setEngineError('Invalid board position FEN.');
      return;
    }

    setIsCalculating(true);
    setEngineError(null);

    // 1. Run Stockfish Web Worker locally (Fast & zero-latency)
    stockfishWorker.getMultiPVLines(normalizedFen, 3, 12, 400).then((workerLines) => {
      if (!isMounted) return;

      if (workerLines && workerLines.length > 0) {
        setTopLines(workerLines);
        setEvalScore(workerLines[0].score);
        setEngineSource('Stockfish 18 WASM');
        setIsCalculating(false);
      } else {
        // Fallback to local minimax engine evaluator
        const fallbackLines = getTopEngineLines(normalizedFen, 3);
        const evalVal = evaluateBoard(chess);
        setTopLines(fallbackLines);
        setEvalScore(evalVal);
        setEngineSource('Local Evaluator');
        setIsCalculating(false);
      }
    }).catch((err) => {
      if (!isMounted) return;
      console.warn('Stockfish Worker calculation warning:', err);
      const fallbackLines = getTopEngineLines(normalizedFen, 3);
      setTopLines(fallbackLines);
      setEvalScore(evaluateBoard(chess));
      setEngineSource('Local Evaluator (Fallback)');
      setIsCalculating(false);
    });

    // 2. Query Lichess Cloud Eval API (Depth 20-50) for grandmaster cloud precision
    getLichessCloudEval(normalizedFen, 3).then((cloudLines) => {
      if (!isMounted) return;
      if (cloudLines && cloudLines.length > 0) {
        setTopLines(cloudLines);
        setEvalScore(cloudLines[0].score);
        setEngineSource('Lichess Cloud Engine (Depth 20+)');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [chess.fen(), engineEnabled]);

  const handleUserMove = (moveObj) => {
    try {
      const moveRes = chess.move(moveObj);
      if (!moveRes) return null;

      setLastMove({ from: moveRes.from, to: moveRes.to });
      const newHist = chess.history({ verbose: true });
      setHistory(newHist);
      setCurrentPly(newHist.length);
      setChess(new Chess(chess.fen()));

      return moveRes;
    } catch (e) {
      return null;
    }
  };

  const handleLoadCustomFen = () => {
    if (!customFenInput.trim()) return;
    try {
      const c = new Chess(customFenInput.trim());
      setChess(c);
      setHistory([]);
      setCurrentPly(0);
      setLastMove(null);
      setEngineError(null);
    } catch (e) {
      setEngineError('Invalid FEN string format. Please verify and try again.');
    }
  };

  const handleLoadCustomPgn = () => {
    if (!customPgnInput.trim()) return;
    try {
      const c = new Chess();
      c.loadPgn(customPgnInput.trim());
      setChess(c);
      const newHist = c.history({ verbose: true });
      setHistory(newHist);
      setCurrentPly(newHist.length);
      setEngineError(null);
    } catch (e) {
      setEngineError('Invalid PGN notation text. Please check the move format.');
    }
  };

  const handleResetBoard = () => {
    const c = new Chess();
    setChess(c);
    setHistory([]);
    setCurrentPly(0);
    setLastMove(null);
    setEngineError(null);
  };

  const handleGoToPly = (ply) => {
    if (ply < 0 || ply > history.length) return;
    if (ply === 0) {
      setChess(new Chess());
      setCurrentPly(0);
      setLastMove(null);
      return;
    }

    const newChess = new Chess();
    let lastM = null;
    for (let i = 0; i < ply; i++) {
      if (history[i]) {
        try {
          lastM = newChess.move(history[i]);
        } catch (e) {}
      }
    }
    setChess(new Chess(newChess.fen()));
    setCurrentPly(ply);
    if (lastM) {
      setLastMove({ from: lastM.from, to: lastM.to });
    }
  };

  const handleGoToMove = handleGoToPly;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handleGoToPly(Math.max(0, currentPly - 1));
      } else if (e.key === 'ArrowRight') {
        handleGoToPly(Math.min(history.length, currentPly + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPly, history.length]);

  const handleCopyFen = () => {
    navigator.clipboard.writeText(chess.fen());
    setCopiedFen(true);
    setTimeout(() => setCopiedFen(false), 2000);
  };

  // Convert top 3 engine recommendations into translucent visual board arrows
  const ARROW_COLORS = ['rgba(129, 182, 76, 0.85)', 'rgba(59, 130, 246, 0.85)', 'rgba(245, 158, 11, 0.85)'];
  const customArrows = engineEnabled
    ? topLines
        .filter((l) => l.from && l.to)
        .map((l, idx) => [l.from, l.to, ARROW_COLORS[idx] || 'rgba(129, 182, 76, 0.8)'])
    : [];

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-6 space-y-4 pb-28 select-none font-['Nunito',sans-serif]">
      {/* Header Banner */}
      <div className="bg-[#1e1d1b] border border-[#3e3b38] p-4 rounded-2xl flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#81b64c] to-[#5b8233] border border-lime-400/40 flex items-center justify-center text-black font-black shadow">
            <Cpu size={20} />
          </div>
          <div>
            <h2 className="font-black text-lg text-white tracking-wide">Stockfish 18 Board Analysis</h2>
            <p className="text-xs text-neutral-400 font-semibold">Deep multi-engine evaluation with Lichess Cloud depth 20+</p>
          </div>
        </div>

        <button
          onClick={() => setEngineEnabled(!engineEnabled)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition border bg-[#262421] border-[#3e3b38] hover:border-[#81b64c]"
        >
          {engineEnabled ? (
            <>
              <ToggleRight size={20} className="text-[#81b64c]" />
              <span className="text-[#81b64c]">Engine ON</span>
            </>
          ) : (
            <>
              <ToggleLeft size={20} className="text-neutral-400" />
              <span className="text-neutral-400">Engine OFF</span>
            </>
          )}
        </button>
      </div>

      {/* Main Board & Controls Container */}
      <div className="bg-[#1e1d1b] border border-[#3e3b38] p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col items-center gap-4">
        {/* Board with Eval Bar */}
        <div className="flex gap-3 justify-center items-stretch w-full max-w-[540px]">
          <EvalBar evaluation={evalScore} isFlipped={isFlipped} />
          <div className="flex-1 flex justify-center">
            <ChessboardContainer
              chess={chess}
              onMove={handleUserMove}
              isFlipped={isFlipped}
              lastMove={lastMove}
              customArrows={customArrows}
            />
          </div>
        </div>

        {/* Board Move Navigation Controls */}
        <div className="flex items-center justify-between w-full max-w-[540px] pt-2 border-t border-[#262421]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleGoToPly(0)}
              disabled={currentPly === 0}
              className="p-2 rounded-lg bg-[#262421] hover:bg-[#302e2b] disabled:opacity-30 text-white transition shadow"
              title="First Move"
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={() => handleGoToPly(currentPly - 1)}
              disabled={currentPly === 0}
              className="p-2 rounded-lg bg-[#262421] hover:bg-[#302e2b] disabled:opacity-30 text-white transition shadow"
              title="Previous Move"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 text-xs font-black font-mono text-neutral-400">
              {currentPly} / {history.length}
            </span>
            <button
              onClick={() => handleGoToPly(currentPly + 1)}
              disabled={currentPly === history.length}
              className="p-2 rounded-lg bg-[#262421] hover:bg-[#302e2b] disabled:opacity-30 text-white transition shadow"
              title="Next Move"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => handleGoToPly(history.length)}
              disabled={currentPly === history.length}
              className="p-2 rounded-lg bg-[#262421] hover:bg-[#302e2b] disabled:opacity-30 text-white transition shadow"
              title="Last Move"
            >
              <SkipForward size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="p-2 rounded-lg bg-[#262421] hover:bg-[#302e2b] text-neutral-300 hover:text-white transition shadow border border-[#3e3b38]"
              title="Flip Board"
            >
              <ArrowRightLeft size={18} />
            </button>
            <button
              onClick={handleResetBoard}
              className="p-2 rounded-lg bg-[#262421] hover:bg-[#302e2b] text-neutral-300 hover:text-white transition shadow border border-[#3e3b38]"
              title="Reset Position"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Stockfish Engine Lines Table */}
      {engineEnabled && (
        <div className="bg-[#1e1d1b] border border-[#3e3b38] rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#262421] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="font-black text-2xl text-white font-mono">
                {evalScore > 0 ? `+${evalScore}` : evalScore}
              </span>
              <span className="text-xs font-bold text-neutral-400">{engineSource}</span>
              {isCalculating && <span className="text-xs text-lime-400 animate-pulse font-bold">Evaluating...</span>}
            </div>
            <span className="text-[10px] font-black text-lime-400 bg-[#1c3614] border border-[#395e28] px-3 py-1 rounded-full">
              3 Lines MultiPV
            </span>
          </div>

          {/* Engine Lines List */}
          <div className="space-y-2">
            {topLines.length === 0 ? (
              <div className="text-xs text-neutral-400 italic p-3 text-center">
                Evaluating position...
              </div>
            ) : (
              topLines.map((line, idx) => (
                <div
                  key={idx}
                  onClick={() => line.from && line.to && handleUserMove({ from: line.from, to: line.to, promotion: line.promotion })}
                  className="flex items-center justify-between bg-[#262421] hover:bg-[#302e2b] p-3 rounded-xl border border-[#3e3b38] hover:border-[#81b64c] cursor-pointer transition group shadow"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#1e1d1b] text-[10px] font-black text-[#81b64c] flex items-center justify-center border border-[#3e3b38]">
                      #{idx + 1}
                    </span>
                    <span className="font-mono font-black text-sm text-lime-400 w-14">
                      {line.formattedScore}
                    </span>
                    <span className="font-mono text-xs font-bold text-white tracking-wide group-hover:text-lime-300 transition truncate max-w-xs md:max-w-md">
                      {line.pv}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* FEN & PGN Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* FEN Card */}
        <div className="bg-[#1e1d1b] border border-[#3e3b38] p-4.5 rounded-2xl space-y-2 shadow-xl">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">FEN Position</label>
            <button
              onClick={handleCopyFen}
              className="text-xs flex items-center gap-1 text-[#81b64c] hover:underline font-bold"
            >
              {copiedFen ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedFen ? 'Copied!' : 'Copy FEN'}</span>
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customFenInput}
              onChange={(e) => setCustomFenInput(e.target.value)}
              placeholder={chess.fen()}
              className="flex-1 bg-[#262421] border border-[#3e3b38] text-white text-xs font-mono p-2.5 rounded-xl outline-none focus:border-[#81b64c] px-3"
            />
            <button
              onClick={handleLoadCustomFen}
              className="px-4 py-2 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] border-b-2 border-[#3f5c20] text-white font-extrabold text-xs rounded-xl transition shadow active:translate-y-0.5"
            >
              Set FEN
            </button>
          </div>
        </div>

        {/* PGN Card */}
        <div className="bg-[#1e1d1b] border border-[#3e3b38] p-4.5 rounded-2xl space-y-2 shadow-xl">
          <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">PGN Moves</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customPgnInput}
              onChange={(e) => setCustomPgnInput(e.target.value)}
              placeholder="e.g. 1. d4 Nf6 2. c4 e6"
              className="flex-1 bg-[#262421] border border-[#3e3b38] text-white text-xs font-mono p-2.5 rounded-xl outline-none focus:border-[#81b64c] px-3"
            />
            <button
              onClick={handleLoadCustomPgn}
              className="px-4 py-2 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] border-b-2 border-[#3f5c20] text-white font-extrabold text-xs rounded-xl transition shadow active:translate-y-0.5"
            >
              Set PGN
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
