import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessboardContainer } from '../Board/ChessboardContainer';
import { PlayerCard } from '../Controls/PlayerCard';
import { parsePgnToMoves } from '../../services/stockfishEngine';
import { Upload, Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, FileText, ArrowRightLeft, ArrowLeft } from 'lucide-react';

const SAMPLE_PGN = `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Bd2 Bxd2+ 8. Nbxd2 d5 9. exd5 Nxd5 10. Qb3 Nce7 11. O-O O-O 12. Rfe1 c6 13. a4 b6 14. Ne5 Bb7 15. a5 b5 16. a6 Bc8 17. Bxd5 Qxd5 18. Qxd5 cxd5 19. Nd3 Nc6 20. Nb3 Bf5 21. Ndc5 Rfe8 22. f3 f6 23. Kf2 Kf7 24. g4 Bg6 25. h4 h6 26. h5 Bh7 27. Nb7 Rxe1 28. Rxe1 Nb4 29. Nd6+ Kf8 30. Nc5 Nd3+ 31. Nxd3 Bxd3 32. Re3 Bc4 33. b3 Rd8 34. Nb7 1-0`;

export function GameReviewView({ onBack }) {
  const [pgnInput, setPgnInput] = useState(SAMPLE_PGN);
  const [movesList, setMovesList] = useState([]);
  const [currentPly, setCurrentPly] = useState(0);
  const [chess, setChess] = useState(new Chess());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    handleLoadPgn(SAMPLE_PGN);
  }, []);

  useEffect(() => {
    if (!isPlaying || movesList.length === 0) return;

    const timer = setInterval(() => {
      setCurrentPly((prev) => {
        if (prev >= movesList.length) {
          setIsPlaying(false);
          return prev;
        }
        const nextPly = prev + 1;
        updateBoardToPly(nextPly, movesList);
        return nextPly;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, movesList]);

  const handleLoadPgn = (pgnStr) => {
    if (!pgnStr || !pgnStr.trim()) return;
    const parsedMoves = parsePgnToMoves(pgnStr);
    if (!parsedMoves || parsedMoves.length === 0) {
      alert('Could not parse PGN moves. Please check PGN text format!');
      return;
    }

    const replayer = new Chess();
    const movesWithFen = [];

    parsedMoves.forEach((m, idx) => {
      try {
        replayer.move({ from: m.from, to: m.to, promotion: m.promotion });
      } catch (e) {
        try {
          replayer.move(m.san);
        } catch (e2) {}
      }

      movesWithFen.push({
        ply: idx + 1,
        moveNumber: Math.floor(idx / 2) + 1,
        color: m.color,
        san: m.san,
        from: m.from,
        to: m.to,
        fen: replayer.fen()
      });
    });

    setMovesList(movesWithFen);
    setChess(new Chess());
    setCurrentPly(0);
    setIsPlaying(false);
  };

  const updateBoardToPly = (ply, moves) => {
    if (ply === 0) {
      setChess(new Chess());
    } else if (moves[ply - 1]) {
      setChess(new Chess(moves[ply - 1].fen));
    }
  };

  const handleGoToMove = (ply) => {
    if (ply < 0 || ply > movesList.length) return;
    setCurrentPly(ply);
    updateBoardToPly(ply, movesList);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setPgnInput(text);
        handleLoadPgn(text);
      };
      reader.readAsText(file);
    }
  };

  const movePairs = [];
  for (let i = 0; i < movesList.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: movesList[i],
      black: movesList[i + 1] || null
    });
  }

  return (
    <div className="max-w-6xl mx-auto w-full p-4 md:p-6 space-y-6 pb-28 select-none font-['Nunito',sans-serif]">
      <div className="bg-[1e1d1b] border border-[#3e3b38] p-4 rounded-2xl flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-xs font-black text-neutral-300 hover:text-white bg-[#262421] border border-[#3e3b38] px-3.5 py-2 rounded-1xl transition shadow shrink-0">
              <ArrowLeft size={16} className="text-[#81b64c]" /> Back
            </button>
          )}
          <div className="w-10 h-10 rounded-1xl bg-gradient-to-br from-[#81b64c] to-[#5b8233] border border-lime-400/40 flex items-center justify-center text-black font-black shadow shrink-0">
            <Upload size={20} />
          </div>

          <div>
            <h1 className="font-black text-xl text-white tracking-tight">PGN Game Replayer & Review</h1>
            <p className="text-xs font-semibold text-neutral-400">Upload PGN text or files to replay and analyze grandmaster games</p>
          </div>
        </div>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-2 bg-[#262421] border border-[#3e3b38] px-4 py-2 rounded-1xl text-xs font-black text-white hover:border-[#81b64c] transition shadow shrink-0">
          <ArrowRightLeft size={16} className="text-lime-400" />
          <span>Flip Board</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 flex flex-col items-center gap-4">
          <div className="w-full max-w-[540px]">
            <PlayerCard
              name="Black Player"
              rating={1800}
              flag="b"
              isActive={currentPly > 0 && currentPly % 2 === 1}
              isWhite={false}
              enableTimer={false}
            />
          </div>


          <div className="w-full max-w-[540px] flex justify-center">
            <ChessboardContainer
              chess={chess}
              isFlipped={isFlipped}
              disabled={true}
            />
          </div>

          <div className="w-full max-w-[540px]">
            <PlayerCard
              name="White Player"
              rating={1850}
              flag="w"
              isActive={currentPly % 2 === 0}
              isWhite={true}
              enableTimer={false}
            />
          </div>


          <div className="w-full max-w-[540px] bg-[#1e1d1b] border border-[#3e3b38] p-3.5 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-black px-2">
              <span className="text-lime-400 font-mono">Ply {currentPly} / {movesList.length}</span>
              <span className="text-white">
                {currentPly === 0 ? 'Starting Position' : movesList[currentPly - 1] ? 'Move: ' + movesList[currentPly - 1].san : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGoToMove(0)}
                className="flex-1 py-2.5 bg-[#262421] hover:bg-[#302e2b] text-neutral-300 hover:text-white text-xs font-black rounded-1xl transition flex items-center justify-center border border-[#3e3b38]"
                title="First Move"
              >
                <SkipBack size={16} />
              </button>


              <button
                onClick={() => handleGoToMove(Math.max(0, currentPly - 1))}
                className="flex-1 py-2.5 bg-[#262421] hover:bg-[#302e2b] text-neutral-300 hover:text-white text-xs font-black rounded-1xl transition flex items-center justify-center border border-[#3e3b38]"
                title="Previous Move"
              >
                <ChevronLeft size={20} />
              </button>


              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={"px-6 py-2.5 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow " + (isPlaying ? "bg-amber-500 text-black" : "bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[#92c858] hover:to-[#67943a] border-b-2 border-[#3f5c20] text-white")}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="fill-white" />}
                <span>{isPlaying ? 'PAUSE' : 'AUTOPLAY'}</span>
              </button>


              <button
                onClick={() => handleGoToMove(Math.min(movesList.length, currentPly + 1))}
                className="flex-1 py-2.5 bg-[#262421] hover:bg-[#302e2b] text-neutral-300 hover:text-white text-xs font-black rounded-1xl transition flex items-center justify-center border border-[#3e3b38]"
                title="Next Move"
              >
                <ChevronRight size={20} />
              </button>


              <button
                onClick={() => handleGoToMove(movesList.length)}
                className="flex-1 py-2.5 bg-[#262421] hover:bg-[#302e2b] text-neutral-300 hover:text-white text-xs font-black rounded-1xl transition flex items-center justify-center border border-[#3e3b38]"
                title="Last Move"
              >
                <SkipForward size={16} />
              </button>
            </div>
          </div>
        </div>


        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[1e1d1b] border border-[#3e3b38] p-5 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#262421] pb-3">
              <h3 className="font-black text-xs uppercase text-white flex items-center gap-2">
                <FileText size={16} className="text-[#81b64c]" />
                Upload / Paste PGN
              </h3>

              <label className="cursor-pointer text-xs flex items-center gap-1 text-[#81b64c] hover:underline font-black">
                <Upload size={14} />
                <span>Import File</span>
                <input type="file" accept=".pgn" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>


            <textarea
              value={pgnInput}
              onChange={(e) => setPgnInput(e.target.value)}
              rows={4}
              placeholder="Paste PGN move text here..."
              className="w-full bg-[#262421] border border-[#3e3b38] text-white text-xs font-mono p-3 rounded-1xl outline-none focus:border-[#81b64c] transition"
            ></textarea>


            <button
              onClick={() => handleLoadPgn(pgnInput)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-b from-[#81b64c] to-[#5b8233] hover:from-[&92c858] hover:to-[#67923a] border-b-2 border-[#3f5c20] text-white font-black rounded-1xl text-xs transition uppercase tracking-wider shadow active:translate-y-0.5"
            >
              <Play size={16} />
              <span>Load & Replay Game</span>
            </button>
          </div>


          {movesList.length > 0 && (
            <div className="bg-[1e1d1b] border border-[#3e3b38] rounded-2xl p-5 space-y-3 shadow-xl">
              <h4 className="text-xs font-black text-neutral-400 uppercase tracking-wider border-b border-[#262421] pb-2">
                Game Move Table ({movesList.length} Moves)
              </h4>


              <div className="max-h-80 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
                {movePairs.map((pair) => (
                  <div key={pair.moveNumber} className="grid grid-cols-12 gap-1 items-center p-1.5 rounded-lg bg-[#262421] hover:bg-[#302e2b]">
                    <span className="col-span-2 text-neutral-400 font-black px-1">{pair.moveNumber}.</span>

                    <button
                      onClick={() => handleGoToMove(pair.white.ply)}
                      className={"col-span-5 text-left px-2 py-1 rounded-md font-black transition " + (currentPly === pair.white.ply ? "bg-[#81b64c] text-white shadow" : "text-neutral-200 hover:bg-[#383531]")}
                    >
                      {pair.white.san}
                    </button>


                    {pair.black ? (
                      <button
                        onClick={() => handleGoToMove(pair.black.ply)}
                        className={"col-span-5 text-left px-2 py-1 rounded-md font-black transition " + (currentPly === pair.black.ply ? "bg-[#81b64c] text-white shadow" : "text-neutral-200 hover:bg-[#383531]")}
                      >
                        {pair.black.san}
                      </button>
                    ) : (
                      <span className="col-span-5"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
