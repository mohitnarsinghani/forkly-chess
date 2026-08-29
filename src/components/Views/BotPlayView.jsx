import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessboardContainer } from '../Board/ChessboardContainer';
import { EvalBar } from '../Board/EvalBar';
import { PlayerCard } from '../Controls/PlayerCard';
import { TimePresetSelector, TIME_PRESETS } from '../Controls/TimePresetSelector';
import { MoveHistory } from '../Controls/MoveHistory';
import { evaluateBoard, getBotMove, getLowEloMove } from '../../services/stockfishEngine';
import { stockfishWorker } from '../../services/stockfishWorker';
import { calculateMaterial } from '../../services/materialCalculator';
import { audio } from '../../services/audioService';
import { RefreshCw, Bot, Trophy, Play, Upload } from 'lucide-react';
import { ColorSelector } from '../Controls/ColorSelector';

export function BotPlayView({ selectedBot = null, selectedColor = 'w', onNavigate, onBack }) {
  const [chess, setChess] = useState(new Chess());
  const [history, setHistory] = useState([]);
  const [currentPly, setCurrentPly] = useState(0);
  const [playerColor, setPlayerColor] = useState(selectedColor || 'w');
  const [activeBot, setActiveBot] = useState(selectedBot || { name: 'Stockfish Grandmaster', elo: 2600, avatar: '🤖', level: 5 });
  const [botLevel, setBotLevel] = useState(selectedBot?.level || 5);
  const [isThinking, setIsThinking] = useState(false);
  const [evalScore, setEvalScore] = useState(0);
  const [lastMove, setLastMove] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  // Time controls
  const [enableTimer, setEnableTimer] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState(TIME_PRESETS[6]);
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);

  const levels = [
    { level: 1, name: 'Beginner', elo: '~800', skill: 1, depth: 2, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    { level: 2, name: 'Intermediate', elo: '~1400', skill: 6, depth: 5, color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
    { level: 3, name: 'Advanced', elo: '~1800', skill: 12, depth: 8, color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
    { level: 4, name: 'Master', elo: '~2200', skill: 16, depth: 11, color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
    { level: 5, name: 'Grandmaster', elo: '~2600', skill: 20, depth: 15, color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' },
  ];

  // Synchronize activeBot and playerColor when props change and start fresh game
  useEffect(() => {
    if (selectedBot) {
      setActiveBot(selectedBot);
      setBotLevel(selectedBot.level || 5);
    }
    const colorToUse = selectedColor || 'w';
    setPlayerColor(colorToUse);

    const initChess = new Chess();
    setChess(initChess);
    setHistory([]);
    setCurrentPly(0);
    setEvalScore(0);
    setLastMove(null);
    setGameResult(null);

    const initTime = selectedPreset ? selectedPreset.seconds : 600;
    setWhiteTime(initTime);
    setBlackTime(initTime);

    if (colorToUse === 'b') {
      setTimeout(() => {
        triggerBotMove(initChess, selectedBot || activeBot);
      }, 300);
    }
  }, [selectedBot, selectedColor]);

  // Active Timer Tick
  useEffect(() => {
    if (!enableTimer || chess.isGameOver() || isThinking || history.length === 0) return;

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
  }, [enableTimer, chess.turn(), chess.isGameOver(), isThinking, history.length]);

  const resetGame = (newColor = playerColor, newPreset = selectedPreset) => {
    const newChess = new Chess();
    setChess(newChess);
    setHistory([]);
    setCurrentPly(0);
    setPlayerColor(newColor);
    setEvalScore(0);
    setLastMove(null);
    setGameResult(null);

    const initTime = newPreset ? newPreset.seconds : 600;
    setWhiteTime(initTime);
    setBlackTime(initTime);

    audio.playGameStart();

    if (newColor === 'b') {
      setTimeout(() => {
        triggerBotMove(newChess, activeBot);
      }, 300);
    }
  };

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    resetGame(playerColor, preset);
  };

  const triggerBotMove = async (currentChess, botObj = activeBot) => {
    if (currentChess.isGameOver()) return;
    setIsThinking(true);

    try {
      const botElo = botObj?.elo || 1500;
      const tempChess = new Chess(currentChess.fen());
      let moveResult = null;

      // 1. Try FastAPI backend engine service
      try {
        const apiRes = await fetch('http://localhost:8000/api/bot/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fen: currentChess.fen(), elo: botElo })
        });
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.from && apiData.to) {
            moveResult = tempChess.move({ from: apiData.from, to: apiData.to, promotion: 'q' });
          }
        }
      } catch (apiErr) {
        // Silent fallback to local WASM worker
      }

      if (!moveResult) {
        if (botElo < 600) {
          // Realistic beginner bot moves for < 600 ELO
          await new Promise((resolve) => setTimeout(resolve, 450));
          const lowEloMove = getLowEloMove(tempChess.fen(), botElo);
          if (lowEloMove) {
            moveResult = tempChess.move(lowEloMove);
          }
        } else {
          // Stockfish engine calculation for >= 600 ELO
          let skill = 20;
          let depth = 15;
          if (botElo <= 600) { skill = 2; depth = 2; }
          else if (botElo <= 800) { skill = 4; depth = 3; }
          else if (botElo <= 1200) { skill = 8; depth = 5; }
          else if (botElo <= 1500) { skill = 11; depth = 7; }
          else if (botElo <= 1800) { skill = 14; depth = 9; }
          else if (botElo <= 2200) { skill = 17; depth = 12; }

          const uciMove = await stockfishWorker.getBestMove(
            tempChess.fen(),
            skill,
            depth,
            350
          );

          if (uciMove) {
            const from = uciMove.substring(0, 2);
            const to = uciMove.substring(2, 4);
            const promo = uciMove[4] || undefined;
            moveResult = tempChess.move({ from, to, promotion: promo });
          } else {
            const fallbackMove = getBotMove(tempChess.fen(), 3);
            if (fallbackMove) {
              moveResult = tempChess.move(fallbackMove);
            }
          }
        }
      }

      if (moveResult) {
        setChess(tempChess);
        setLastMove({ from: moveResult.from, to: moveResult.to });
        const newHist = tempChess.history({ verbose: true });
        setHistory(newHist);
        setCurrentPly(newHist.length);
        setEvalScore(evaluateBoard(tempChess));

        if (enableTimer && selectedPreset?.increment > 0) {
          if (playerColor === 'w') {
            setBlackTime((prev) => prev + selectedPreset.increment);
          } else {
            setWhiteTime((prev) => prev + selectedPreset.increment);
          }
        }

        if (tempChess.inCheck()) {
          audio.playCheck();
        } else if (moveResult.captured) {
          audio.playCapture();
        } else {
          audio.playMove();
        }

        checkGameOver(tempChess);
      }
    } catch (err) {
      console.error('triggerBotMove error:', err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleUserMove = (moveObj) => {
    if (isThinking || chess.isGameOver()) return null;
    if (chess.turn() !== playerColor) return null;

    try {
      const tempChess = new Chess(chess.fen());
      const moveResult = tempChess.move(moveObj);
      if (!moveResult) return null;

      setChess(tempChess);
      setLastMove({ from: moveResult.from, to: moveResult.to });
      const newHist = tempChess.history({ verbose: true });
      setHistory(newHist);
      setCurrentPly(newHist.length);
      setEvalScore(evaluateBoard(tempChess));

      if (enableTimer && selectedPreset?.increment > 0) {
        if (playerColor === 'w') {
          setWhiteTime((prev) => prev + selectedPreset.increment);
        } else {
          setBlackTime((prev) => prev + selectedPreset.increment);
        }
      }

      if (checkGameOver(tempChess)) {
        return moveResult;
      }

      // Schedule bot response asynchronously after user move renders
      setTimeout(() => {
        triggerBotMove(tempChess, activeBot);
      }, 250);

      return moveResult;
    } catch (e) {
      console.error('handleUserMove error:', e);
      return null;
    }
  };

  const checkGameOver = (c) => {
    if (c.isCheckmate()) {
      const winner = c.turn() === 'w' ? 'Black' : 'White';
      setGameResult(`Checkmate! ${winner} wins.`);
      audio.playGameEnd();
      return true;
    }
    if (c.isDraw()) {
      setGameResult('Game Draw (Stalemate / 50-move rule)');
      audio.playGameEnd();
      return true;
    }
    return false;
  };

  const handleTimeOut = (color) => {
    const winner = color === 'w' ? 'Black' : 'White';
    setGameResult(`Time Out! ${winner} wins.`);
    audio.playGameEnd();
  };

  const matInfo = calculateMaterial(chess);

  const topCardCaptured = playerColor === 'w' ? matInfo.capturedByBlack : matInfo.capturedByWhite;
  const topCardAdvantage = playerColor === 'w' ? matInfo.blackScore : matInfo.whiteScore;

  const bottomCardCaptured = playerColor === 'w' ? matInfo.capturedByWhite : matInfo.capturedByBlack;
  const bottomCardAdvantage = playerColor === 'w' ? matInfo.whiteScore : matInfo.blackScore;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full items-start justify-center">
      {/* Board Column */}
      <div className="flex flex-col items-center gap-3 w-full lg:w-auto">
        {/* Top Player Card (Opponent Bot) */}
        <div className="w-full max-w-[540px]">
          <PlayerCard
            name={activeBot.name || 'Stockfish Bot'}
            rating={activeBot.elo ? `${activeBot.elo}` : '2700'}
            flag={activeBot.avatar || '🤖'}
            capturedPieces={topCardCaptured}
            materialAdvantage={topCardAdvantage}
            timeInSeconds={playerColor === 'w' ? blackTime : whiteTime}
            isActive={chess.turn() !== playerColor && !isThinking}
            isWhite={playerColor === 'b'}
            enableTimer={enableTimer}
          />
        </div>

        {/* Board with Eval Bar perfectly aligned */}
        <div className="flex gap-2.5 items-stretch justify-center w-full max-w-[540px]">
          <EvalBar evaluation={evalScore} isFlipped={playerColor === 'b'} />
          <div className="flex-1 flex justify-center">
            <ChessboardContainer
              chess={chess}
              onMove={handleUserMove}
              isFlipped={playerColor === 'b'}
              lastMove={lastMove}
              disabled={isThinking || chess.isGameOver()}
            />
          </div>
        </div>

        {/* Bottom Player Card (User) */}
        <div className="w-full max-w-[540px]">
          <PlayerCard
            name="You"
            rating="1500"
            flag="🇳🇴"
            capturedPieces={bottomCardCaptured}
            materialAdvantage={bottomCardAdvantage}
            timeInSeconds={playerColor === 'w' ? whiteTime : blackTime}
            isActive={chess.turn() === playerColor}
            isWhite={playerColor === 'w'}
            enableTimer={enableTimer}
          />
        </div>

        {/* Game Result Banner */}
        {gameResult && (
          <div className="w-full max-w-[540px] bg-[#1c3614] border border-[#81b64c] text-white p-3 rounded-xl text-center font-bold flex items-center justify-center gap-2 animate-in fade-in shadow">
            <Trophy className="text-amber-400" size={20} />
            <span>{gameResult}</span>
          </div>
        )}
      </div>

      {/* Control Panel Column */}
      <div className="w-full lg:w-80 flex flex-col gap-4 font-['Nunito',sans-serif]">
        {/* Selected Bot Card OR Generic Difficulty Selector */}
        {selectedBot ? (
          <div className="bg-[#1e1d1b] border border-[#3e3b38] p-4 rounded-2xl space-y-2 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-neutral-400 flex items-center gap-1.5">
                <Bot size={16} className="text-[#81b64c]" />
                Selected Opponent
              </h3>
              {isThinking && <span className="text-xs text-lime-400 font-bold animate-pulse">Thinking...</span>}
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#262421] border border-[#3e3b38] rounded-xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#81b64c] to-[#5b8233] border border-lime-400 flex items-center justify-center text-2xl shadow-md shrink-0">
                {activeBot.avatar || '🤖'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-sm text-white truncate">{activeBot.name}</div>
                <div className="text-xs font-black text-amber-400 font-mono">
                  {activeBot.elo ? `${activeBot.elo} ELO` : activeBot.badge || 'Guided Coach'}
                </div>
              </div>
            </div>
            {activeBot.desc && (
              <p className="text-[11px] text-neutral-400 font-semibold leading-snug pt-1">
                {activeBot.desc}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-[#1e1d1b] border border-[#3e3b38] p-4 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-neutral-400 flex items-center gap-1.5">
                <Bot size={16} className="text-[#81b64c]" />
                Stockfish 18 Difficulty
              </h3>
              {isThinking && <span className="text-xs text-lime-400 font-bold animate-pulse">Thinking...</span>}
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {levels.map((l) => (
                <button
                  key={l.level}
                  onClick={() => {
                    setBotLevel(l.level);
                    setActiveBot({ name: `Stockfish ${l.name}`, elo: parseInt(l.elo.replace('~', ''), 10), avatar: '🤖', level: l.level });
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition ${
                    botLevel === l.level
                      ? `${l.color} shadow-md`
                      : 'bg-[#262421] border-[#3e3b38] text-neutral-300 hover:bg-[#302e2b]'
                  }`}
                >
                  <span>{l.name}</span>
                  <span className="font-mono opacity-80">{l.elo}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time Control Selection Grid */}
        <TimePresetSelector
          selectedPreset={selectedPreset}
          onSelectPreset={handleSelectPreset}
          enableTimer={enableTimer}
          onToggleEnableTimer={setEnableTimer}
        />

        {/* Game Side Options */}
        <div className="bg-[#1e1d1b] border border-[#3e3b38] p-4 rounded-2xl space-y-3 shadow-xl">
          <h3 className="text-xs font-black uppercase text-neutral-400 text-center">Play As Side</h3>
          <div className="flex justify-center py-1">
            <ColorSelector
              selectedColor={playerColor}
              onSelectColor={(col) => {
                const finalColor = col === 'r' ? (Math.random() < 0.5 ? 'w' : 'b') : col;
                resetGame(finalColor);
              }}
              size="large"
            />
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => resetGame()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] text-white font-black rounded-xl text-xs uppercase border-b-4 border-[#3f5c20] transition shadow active:translate-y-0.5"
            >
              <RefreshCw size={14} /> New Game
            </button>

            {onNavigate && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onNavigate('coach')}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#262421] hover:bg-[#302e2b] text-white font-extrabold rounded-xl text-xs border border-[#3e3b38] transition"
                >
                  <Play size={14} className="text-[#81b64c]" /> Change Bot
                </button>

                <button
                  onClick={() => onNavigate('review')}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#262421] hover:bg-[#302e2b] text-white font-extrabold rounded-xl text-xs border border-[#3e3b38] transition"
                >
                  <Upload size={14} className="text-purple-400" /> View Game
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Move History Panel */}
        <div className="h-64">
          <MoveHistory history={history} currentPly={currentPly} />
        </div>
      </div>
    </div>
  );
}
