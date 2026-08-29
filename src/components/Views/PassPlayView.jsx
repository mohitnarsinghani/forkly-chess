import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessboardContainer } from '../Board/ChessboardContainer';
import { PlayerCard } from '../Controls/PlayerCard';
import { TimePresetSelector, TIME_PRESETS } from '../Controls/TimePresetSelector';
import { MoveHistory } from '../Controls/MoveHistory';
import { calculateMaterial } from '../../services/materialCalculator';
import { audio } from '../../services/audioService';
import { Swords, RefreshCw, Trophy, ArrowLeft } from 'lucide-react';

export function PassPlayView({ onBack }) {
  const [chess, setChess] = useState(new Chess());
  const [history, setHistory] = useState([]);
  const [currentPly, setCurrentPly] = useState(0);
  const [autoFlip, setAutoFlip] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  // Time controls
  const [enableTimer, setEnableTimer] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState(TIME_PRESETS[6]);
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);

  useEffect(() => {
    if (!enableTimer || chess.isGameOver() || history.length === 0) return;

    const timer = setInterval(() => {
      if (chess.turn() === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            handleTimeOut('w');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            handleTimeOut('b');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [enableTimer, chess.turn(), chess.isGameOver(), history.length]);

  const resetGame = (newPreset = selectedPreset) => {
    const c = new Chess();
    setChess(c);
    setHistory([]);
    setCurrentPly(0);
    setIsFlipped(false);
    setLastMove(null);
    setGameResult(null);

    const initTime = newPreset ? newPreset.seconds : 600;
    setWhiteTime(initTime);
    setBlackTime(initTime);
    audio.playGameStart();
  };

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    resetGame(preset);
  };

  const handleUserMove = (moveObj) => {
    if (chess.isGameOver()) return null;

    try {
      const tempChess = new Chess(chess.fen());
      const moveResult = tempChess.move(moveObj);
      if (!moveResult) return null;

      setChess(tempChess);
      setLastMove({ from: moveResult.from, to: moveResult.to });

      const newHist = tempChess.history({ verbose: true });
      setHistory(newHist);
      setCurrentPly(newHist.length);

      if (enableTimer && selectedPreset?.increment > 0) {
        if (tempChess.turn() === 'b') {
          setWhiteTime((prev) => prev + selectedPreset.increment);
        } else {
          setBlackTime((prev) => prev + selectedPreset.increment);
        }
      }

      if (tempChess.inCheck()) {
        audio.playCheck();
      } else if (moveResult.captured) {
        audio.playCapture();
      } else {
        audio.playMove();
      }

      if (tempChess.isCheckmate()) {
        const winner = tempChess.turn() === 'w' ? 'Black' : 'White';
        setGameResult(`Checkmate! ${winner} wins.`);
        audio.playGameEnd();
      } else if (tempChess.isDraw()) {
        setGameResult('Game Draw (Stalemate / 50-move rule)');
        audio.playGameEnd();
      }

      if (autoFlip) {
        setIsFlipped((prev) => !prev);
      }

      return moveResult;
    } catch (e) {
      console.error('PassPlay Move error:', e);
      return null;
    }
  };

  const handleTimeOut = (color) => {
    const winner = color === 'w' ? 'Black' : 'White';
    setGameResult(`Time out! ${winner} wins.`);
    audio.playGameEnd();
  };

  const matInfo = calculateMaterial(chess);

  return (
    <div className="max-w-7xl mx-auto w-full p-4 md:p-6 space-y-4 pb-28 select-none font-['Nunito',sans-serif]">
      {onBack && (
        <div className="flex items-center justify-between bg-[#1e1d1b] border border-[#3e3b38] p-3.5 rounded-2xl shadow-xl">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-black text-neutral-300 hover:text-white bg-[#262421] border border-[#3e3b38] px-4 py-2 rounded-xl transition shadow"
          >
            <ArrowLeft size={16} className="text-[#81b64c]" /> Back to Home
          </button>
          <div className="flex items-center gap-2 text-xs font-extrabold text-lime-400 bg-[#1c3614] border border-[#395e28] px-3.5 py-1.5 rounded-full shadow">
            <Swords size={16} />
            <span>Pass & Play (Local 2 Players)</span>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        {/* Board Column */}
        <div className="flex flex-col items-center gap-3 w-full lg:w-auto">
          {/* Top Player Card */}
          <div className="w-full max-w-[540px]">
          <PlayerCard
            name="Player 2 (Black)"
            rating="1400"
            flag="🇺🇸"
            capturedPieces={matInfo.capturedByBlack}
            materialAdvantage={matInfo.blackScore}
            timeInSeconds={blackTime}
            isActive={chess.turn() === 'b'}
            isWhite={false}
            enableTimer={enableTimer}
          />
        </div>

        <ChessboardContainer
          chess={chess}
          onMove={handleUserMove}
          isFlipped={isFlipped}
          lastMove={lastMove}
          disabled={chess.isGameOver()}
          boardWidth={520}
        />

        {/* Bottom Player Card */}
        <div className="w-full max-w-[540px]">
          <PlayerCard
            name="Player 1 (White)"
            rating="1400"
            flag="🇳🇴"
            capturedPieces={matInfo.capturedByWhite}
            materialAdvantage={matInfo.whiteScore}
            timeInSeconds={whiteTime}
            isActive={chess.turn() === 'w'}
            isWhite={true}
            enableTimer={enableTimer}
          />
        </div>

        {gameResult && (
          <div className="w-full max-w-[540px] bg-[#1c3614] border border-[#81b64c] text-white p-3 rounded-xl text-center font-bold flex items-center justify-center gap-2 shadow">
            <Trophy className="text-amber-400" size={20} />
            <span>{gameResult}</span>
          </div>
        )}
      </div>

      {/* Control Panel Column */}
      <div className="w-full lg:w-80 flex flex-col gap-4 font-['Nunito',sans-serif]">
        {/* Time Control Grid */}
        <TimePresetSelector
          selectedPreset={selectedPreset}
          onSelectPreset={handleSelectPreset}
          enableTimer={enableTimer}
          onToggleEnableTimer={setEnableTimer}
        />

        {/* Pass & Play Options */}
        <div className="bg-[#1e1d1b] border border-[#3e3b38] p-4.5 rounded-2xl space-y-3 shadow-xl">
          <h3 className="text-xs font-black uppercase text-neutral-400 flex items-center gap-1.5">
            <Swords size={16} className="text-[#81b64c]" />
            Pass & Play Settings
          </h3>

          <label className="flex items-center justify-between p-3 bg-[#262421] border border-[#3e3b38] rounded-xl text-xs font-extrabold text-gray-300 cursor-pointer">
            <span>Auto-flip Board Each Turn</span>
            <input
              type="checkbox"
              checked={autoFlip}
              onChange={(e) => setAutoFlip(e.target.checked)}
              className="accent-[#81b64c] w-4 h-4 rounded"
            />
          </label>

          <button
            onClick={() => resetGame()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] border-b-4 border-[#3f5c20] text-white font-black rounded-xl text-xs uppercase transition shadow tracking-wider active:translate-y-0.5"
          >
            <RefreshCw size={16} /> New Pass & Play Game
          </button>
        </div>

        <div className="h-64">
          <MoveHistory history={history} currentPly={currentPly} />
        </div>
      </div>
    </div>
  </div>
);
}
