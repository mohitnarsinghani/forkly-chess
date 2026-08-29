import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessboardContainer } from '../Board/ChessboardContainer';
import { puzzleService } from '../../services/puzzleService';
import { audio } from '../../services/audioService';
import { Puzzle, CheckCircle2, XCircle, ArrowRight, Trophy } from 'lucide-react';

export function PuzzleView() {
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [chess, setChess] = useState(new Chess());
  const [solutionMoves, setSolutionMoves] = useState([]);
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState('solving'); // 'solving', 'correct', 'failed'
  const [streak, setStreak] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [ratingRange, setRatingRange] = useState('all');
  const [lastMove, setLastMove] = useState(null);
  const [solverColor, setSolverColor] = useState('w'); // Color that user needs to solve

  const themes = [
    { id: 'all', label: 'All Themes' },
    { id: 'mateIn2', label: 'Mate in 2' },
    { id: 'fork', label: 'Fork' },
    { id: 'pin', label: 'Pin' },
    { id: 'endgame', label: 'Endgame' },
    { id: 'crushing', label: 'Crushing' },
    { id: 'short', label: 'Short Tactics' }
  ];

  useEffect(() => {
    puzzleService.loadPuzzles().then(() => {
      loadNextPuzzle();
    });
  }, []);

  const loadNextPuzzle = () => {
    let minR = 0;
    let maxR = 3000;
    if (ratingRange === '1000') { minR = 800; maxR = 1200; }
    if (ratingRange === '1500') { minR = 1300; maxR = 1700; }
    if (ratingRange === '2000') { minR = 1800; maxR = 2400; }

    const puzzle = puzzleService.getRandomPuzzle(minR, maxR, selectedTheme);
    if (!puzzle) return;

    const initialChess = new Chess(puzzle.FEN);
    const rawMoves = puzzle.Moves.split(' ');

    setCurrentPuzzle(puzzle);
    setChess(initialChess);
    setSolutionMoves(rawMoves);
    setStatus('solving');

    // The solver color is opposite of initial turn (because opponent plays move 0)
    const initialTurn = initialChess.turn();
    const actualSolverColor = initialTurn === 'w' ? 'b' : 'w';
    setSolverColor(actualSolverColor);

    // Play opponent's setup move (move 0)
    if (rawMoves.length > 0) {
      const oppMoveUci = rawMoves[0];
      const from = oppMoveUci.substring(0, 2);
      const to = oppMoveUci.substring(2, 4);
      const promo = oppMoveUci[4] || undefined;

      setTimeout(() => {
        const moveRes = initialChess.move({ from, to, promotion: promo });
        if (moveRes) {
          setLastMove({ from, to });
          setChess(new Chess(initialChess.fen()));
          setMoveIndex(1); // User responds to move index 1
        }
      }, 300);
    }
  };

  const handleUserMove = (moveObj) => {
    if (status !== 'solving' || moveIndex >= solutionMoves.length) return null;

    const expectedMoveUci = solutionMoves[moveIndex];
    const userFrom = moveObj.from;
    const userTo = moveObj.to;
    const userPromo = moveObj.promotion;
    const userMoveUci = `${userFrom}${userTo}${userPromo || ''}`;

    try {
      const moveRes = chess.move(moveObj);
      if (!moveRes) return null;

      setLastMove({ from: userFrom, to: userTo });

      // Compare user move with expected move
      if (userMoveUci.startsWith(expectedMoveUci.substring(0, 4))) {
        audio.playMove();
        const nextIdx = moveIndex + 1;

        if (nextIdx >= solutionMoves.length) {
          setStatus('correct');
          setStreak((prev) => prev + 1);
          const currentCount = parseInt(localStorage.getItem('chess_puzzles_solved') || '0', 10);
          localStorage.setItem('chess_puzzles_solved', (currentCount + 1).toString());
          audio.playGameEnd();
        } else {
          // Play opponent response move
          setMoveIndex(nextIdx + 1);
          setTimeout(() => {
            const oppMoveUci = solutionMoves[nextIdx];
            if (oppMoveUci) {
              const oppFrom = oppMoveUci.substring(0, 2);
              const oppTo = oppMoveUci.substring(2, 4);
              const oppPromo = oppMoveUci[4] || undefined;

              chess.move({ from: oppFrom, to: oppTo, promotion: oppPromo });
              setLastMove({ from: oppFrom, to: oppTo });
              setChess(new Chess(chess.fen()));
              audio.playMove();

              if (nextIdx + 1 >= solutionMoves.length) {
                setStatus('correct');
                setStreak((prev) => prev + 1);
                const currentCount = parseInt(localStorage.getItem('chess_puzzles_solved') || '0', 10);
                localStorage.setItem('chess_puzzles_solved', (currentCount + 1).toString());
                audio.playGameEnd();
              }
            }
          }, 350);
        }

        return moveRes;
      } else {
        setStatus('failed');
        audio.playIncorrect();
        setStreak(0);
        return moveRes;
      }
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full items-start justify-center">
      {/* Board Column */}
      <div className="flex flex-col items-center gap-4 w-full lg:w-auto">
        {/* Solver Turn Header Banner */}
        <div className="w-full max-w-[540px] bg-chess-panel border border-chess-border px-4 py-3 rounded-xl shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{solverColor === 'w' ? '⚪' : '🖤'}</span>
            <div>
              <h2 className="font-extrabold text-sm text-white">
                {solverColor === 'w' ? 'White to Move' : 'Black to Move'}
              </h2>
              <p className="text-[11px] text-chess-accent font-bold">Find the best move!</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-chess-card border border-chess-border px-3 py-1.5 rounded-lg">
            <Trophy size={16} className="text-chess-gold" />
            <span className="text-xs font-extrabold text-white">Streak: {streak}</span>
          </div>
        </div>

        {/* Board - Automatically Flipped so Solver pieces are ALWAYS at the bottom! */}
        <ChessboardContainer
          chess={chess}
          onMove={handleUserMove}
          isFlipped={solverColor === 'b'}
          lastMove={lastMove}
          disabled={status !== 'solving'}
          boardWidth={520}
        />

        {/* Puzzle Outcome Feedback Banner */}
        {status === 'correct' && (
          <div className="w-full max-w-[540px] bg-emerald-500/20 border border-emerald-500 text-emerald-300 p-3.5 rounded-xl text-center font-bold flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 size={20} />
            <span>Puzzle Solved! Great job!</span>
          </div>
        )}

        {status === 'failed' && (
          <div className="w-full max-w-[540px] bg-rose-500/20 border border-rose-500 text-rose-300 p-3.5 rounded-xl text-center font-bold flex items-center justify-center gap-2 animate-in fade-in">
            <XCircle size={20} />
            <span>Incorrect move! Try another puzzle.</span>
          </div>
        )}
      </div>

      {/* Side Control Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Puzzle Info Card */}
        <div className="bg-chess-panel border border-chess-border p-5 rounded-xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-chess-border/60 pb-3">
            <span className="text-xs text-chess-textMuted font-bold uppercase">Puzzle Rating</span>
            <span className="text-lg font-mono font-extrabold text-chess-accent">
              {currentPuzzle?.Rating || 1500} ELO
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-chess-textMuted font-bold uppercase">Themes</span>
            <div className="flex flex-wrap gap-1 pt-1">
              {currentPuzzle?.Themes?.split(' ').map((t, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-chess-card border border-chess-border text-gray-300 px-2 py-0.5 rounded font-mono font-semibold"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={loadNextPuzzle}
              className="w-full flex items-center justify-center gap-2 py-3 bg-chess-accent hover:bg-chess-accentHover text-black font-extrabold rounded-xl text-sm transition shadow-lg"
            >
              <span>Next Puzzle</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-chess-panel border border-chess-border p-4 rounded-xl space-y-3 shadow-lg">
          <h3 className="text-xs font-bold uppercase text-chess-textMuted">Filter Puzzles</h3>

          <div>
            <label className="text-[11px] text-gray-400 block mb-1 font-semibold">Theme Filter</label>
            <select
              value={selectedTheme}
              onChange={(e) => {
                setSelectedTheme(e.target.value);
                setTimeout(loadNextPuzzle, 100);
              }}
              className="w-full bg-chess-card border border-chess-border text-white text-xs rounded-lg p-2.5 outline-none font-bold"
            >
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-gray-400 block mb-1 font-semibold">Rating Range</label>
            <select
              value={ratingRange}
              onChange={(e) => {
                setRatingRange(e.target.value);
                setTimeout(loadNextPuzzle, 100);
              }}
              className="w-full bg-chess-card border border-chess-border text-white text-xs rounded-lg p-2.5 outline-none font-bold"
            >
              <option value="all">All Ratings (800 - 2400)</option>
              <option value="1000">Beginner (800 - 1200)</option>
              <option value="1500">Intermediate (1300 - 1700)</option>
              <option value="2000">Advanced (1800 - 2400)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
