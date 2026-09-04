import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { Chess } from 'chess.js';
import { Header } from './Header';
import { Chessboard } from './Chessboard';
import { BoardEditor } from './BoardEditor';
import { MoveNavControlBar } from './MoveNavControlBar';
import { BestMoveDisplay } from './BestMoveDisplay';
import { BottomControls } from './BottomControls';
import { CameraScanModal } from './CameraScanModal';
import { EvaluationState, SampleBoard, PieceSize } from '../../types';
import { fetchChessEvaluation } from '../../utils/chessEngine';
import { chessAudio } from '../../utils/chessAudio';

// Default to the exact position from the user's Chessvision.ai screenshot (1.d4 Nf6)
const INITIAL_FEN = 'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2';

interface HistoryEntry {
  fen: string;
  san?: string;
  num?: number;
  isWhite?: boolean;
}

export default function ScannerView({ onBack }: { onBack?: () => void }) {
  const [chess, setChess] = useState<Chess>(() => new Chess(INITIAL_FEN));
  const [fen, setFen] = useState<string>(INITIAL_FEN);
  const [pgn, setPgn] = useState<string>('1. d4 Nf6 *');
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [boardTheme, setBoardTheme] = useState<'wood' | 'green' | 'dark'>('wood');
  const [pieceTheme, setPieceTheme] = useState<'cburnett' | 'merida'>('cburnett');
  const [pieceSize, setPieceSize] = useState<PieceSize>('large');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isEngineEnabled, setIsEngineEnabled] = useState(true);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // History stack for < and > navigation
  const [history, setHistory] = useState<HistoryEntry[]>([
    { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
    { fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1', san: 'd4', num: 1, isWhite: true },
    { fen: INITIAL_FEN, san: 'Nf6', num: 1, isWhite: false },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(2);

  // Scanner modal states
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [candidateScanFen, setCandidateScanFen] = useState<string | null>(null);

  // Notification / toast feedback
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);

  // Engine evaluation state
  const [evaluation, setEvaluation] = useState<EvaluationState>({
    score: 0.5,
    scoreText: '+0.5',
    winChance: 56,
    depth: 19,
    isLoading: false,
    source: 'lichess-cloud',
    topMoves: [
      {
        rank: 1,
        uci: 'c2c4',
        san: 'c4',
        score: 0.5,
        scoreText: '+0.5',
        pv: 'c2c4 e7e6 g1f3 d7d5 e2e3 c7c5 b1c3 b8c6',
        pvList: ['c4', 'e6', 'Nf3', 'd5', 'e3', 'c5', 'Nc3', 'Nc6'],
      },
      {
        rank: 2,
        uci: 'e2e3',
        san: 'e3',
        score: 0.5,
        scoreText: '+0.5',
        pv: 'e2e3 e7e6 g1f3 c7c5 f1e2 d7d5 e1g1 b8c6',
        pvList: ['e3', 'e6', 'Nf3', 'c5', 'Be2', 'd5', 'O-O', 'Nc6'],
      },
      {
        rank: 3,
        uci: 'g1f3',
        san: 'Nf3',
        score: 0.4,
        scoreText: '+0.4',
        pv: 'g1f3 d7d5 c2c4 e7e6 e2e3 g8f6 b1c3 c7c5',
        pvList: ['Nf3', 'd5', 'c4', 'e6', 'e3', 'Nf6', 'Nc3', 'c5'],
      },
    ],
  });

  // Selected arrow line (null = show all 3 lines arrows, 1/2/3 = focus specific line)
  const [activeArrowRank, setActiveArrowRank] = useState<number | null>(null);

  const [, startTransition] = useTransition();

  // Run evaluation whenever FEN changes and engine is enabled
  const runEvaluation = useCallback(
    async (targetFen: string) => {
      if (!isEngineEnabled) return;

      setEvaluation((prev) => ({ ...prev, isLoading: true }));
      try {
        const result = await fetchChessEvaluation(targetFen);
        setEvaluation(result);
      } catch (err) {
        console.error('Evaluation run error:', err);
        setEvaluation((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to evaluate position',
        }));
      }
    },
    [isEngineEnabled]
  );

  useEffect(() => {
    runEvaluation(fen);
  }, [fen, isEngineEnabled, runEvaluation]);

  // Handle board move interaction
  const handleMove = (newFen: string, move?: any) => {
    setFen(newFen);

    // Append to move history
    if (move) {
      const isWhiteMove = move.color === 'w';
      const moveNum = Math.floor((history.length) / 2) + 1;
      const newEntry: HistoryEntry = {
        fen: newFen,
        san: move.san,
        num: moveNum,
        isWhite: isWhiteMove,
      };

      const updatedHistory = [...history.slice(0, historyIndex + 1), newEntry];
      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
      setPgn(chess.pgn() || `${pgn} ${move.san}`);
    }
  };

  // Flip board orientation
  const handleFlipOrientation = () => {
    setOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
  };

  // Toggle active turn (White to move <-> Black to move)
  const handleToggleTurn = () => {
    try {
      const parts = fen.split(' ');
      if (parts.length >= 2) {
        parts[1] = parts[1] === 'w' ? 'b' : 'w';
        const updatedFen = parts.join(' ');
        const testChess = new Chess(updatedFen);
        setChess(testChess);
        setFen(testChess.fen());
        chessAudio.playMove();
      }
    } catch {
      // Ignored if invalid
    }
  };

  // Navigation: First move
  const handleFirstMove = () => {
    if (history.length > 0 && historyIndex > 0) {
      const target = history[0];
      setHistoryIndex(0);
      const newGame = new Chess(target.fen);
      setChess(newGame);
      setFen(target.fen);
      chessAudio.playMove();
    }
  };

  // Navigation: Previous move
  const handlePrevMove = () => {
    if (historyIndex > 0) {
      const target = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      const newGame = new Chess(target.fen);
      setChess(newGame);
      setFen(target.fen);
      chessAudio.playMove();
    }
  };

  // Navigation: Next move
  const handleNextMove = () => {
    if (historyIndex < history.length - 1) {
      const target = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      const newGame = new Chess(target.fen);
      setChess(newGame);
      setFen(target.fen);
      chessAudio.playMove();
    }
  };

  // Navigation: Last move
  const handleLastMove = () => {
    if (historyIndex < history.length - 1) {
      const target = history[history.length - 1];
      setHistoryIndex(history.length - 1);
      const newGame = new Chess(target.fen);
      setChess(newGame);
      setFen(target.fen);
      chessAudio.playMove();
    }
  };

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    chessAudio.setEnabled(next);
  };

  // Reset board
  const handleResetBoard = () => {
    const newGame = new Chess();
    setChess(newGame);
    const startFen = newGame.fen();
    setFen(startFen);
    setPgn('');
    setOrientation('white');
    setHistory([{ fen: startFen }]);
    setHistoryIndex(0);
    chessAudio.playMove();
  };

  // Apply FEN string directly
  const handleApplyFen = (newFenInput: string) => {
    try {
      const sanitized = newFenInput.trim();
      const testChess = new Chess(sanitized);
      setChess(testChess);
      setFen(testChess.fen());
      setHistory([{ fen: testChess.fen() }]);
      setHistoryIndex(0);
      chessAudio.playMove();
    } catch (err) {
      console.error('Invalid FEN:', err);
      throw new Error('Invalid FEN format.');
    }
  };

  // Apply PGN string directly
  const handleApplyPgn = (pgnInput: string) => {
    try {
      const newChess = new Chess();
      newChess.loadPgn(pgnInput);
      setChess(newChess);
      setFen(newChess.fen());
      setPgn(pgnInput);
      chessAudio.playMove();
    } catch (err) {
      console.error('Invalid PGN:', err);
    }
  };

  // AI Vision Scanner handler
  const handleScanImage = async (base64Image: string, mimeType: string, isCropped = false) => {
    setIsScanning(true);
    setScanError(null);
    try {
      const res = await fetch('/api/scan-chessboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          mimeType,
          isCropped,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.candidateFen) {
          setCandidateScanFen(errData.candidateFen);
        }
        let rawErr = errData.error || `Server responded with ${res.status}`;
        if (typeof rawErr === 'object') {
          rawErr = rawErr.message || JSON.stringify(rawErr);
        }
        if (typeof rawErr === 'string' && (rawErr.includes('503') || rawErr.includes('high demand') || rawErr.includes('UNAVAILABLE'))) {
          rawErr = 'AI service par temporary high demand hai. Kripya 2-3 second ruk kar dobara try karein.';
        }
        throw new Error(rawErr);
      }

      const data = await res.json();
      if (!data.success || !data.fen) {
        if (data.candidateFen) {
          setCandidateScanFen(data.candidateFen);
        }
        throw new Error(data.error || 'Failed to detect chessboard position.');
      }

      const detectedFen = data.fen.trim();
      setCandidateScanFen(null);

      // Test validity with chess.js
      let validChess: Chess;
      try {
        validChess = new Chess(detectedFen);
      } catch {
        // Try repairing turn and move counts if only board part was returned
        const parts = detectedFen.split(' ');
        if (parts[0] && parts[0].split('/').length === 8) {
          validChess = new Chess(`${parts[0]} w - - 0 1`);
        } else {
          throw new Error(`AI generated an invalid FEN: "${detectedFen}"`);
        }
      }

      startTransition(() => {
        setChess(validChess);
        setFen(validChess.fen());
        setHistory([{ fen: validChess.fen() }]);
        setHistoryIndex(0);
        if (data.orientation === 'black') {
          setOrientation('black');
        } else if (data.orientation === 'white') {
          setOrientation('white');
        }
      });

      setIsScanning(false);
      setIsScanModalOpen(false);
      const orientText = data.orientation === 'black' ? ' (Black perspective)' : '';
      setScanSuccessMessage(`Chessboard recognized and loaded successfully!${orientText}`);
      chessAudio.playMove();

      setTimeout(() => setScanSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Scan error:', err);
      setIsScanning(false);
      setScanError(
        err?.message ||
          'Failed to scan chessboard image. Please ensure the board is clearly visible with good lighting.'
      );
    }
  };

  // Select Sample Board
  const handleSelectSample = (sample: SampleBoard) => {
    try {
      const sampleChess = new Chess(sample.fen);
      setChess(sampleChess);
      setFen(sampleChess.fen());
      setHistory([{ fen: sampleChess.fen() }]);
      setHistoryIndex(0);
      chessAudio.playMove();
      setScanSuccessMessage(`Loaded sample: ${sample.name}`);
      setTimeout(() => setScanSuccessMessage(null), 3500);
    } catch (err) {
      console.error('Error loading sample board:', err);
    }
  };

  // File drop or direct input from bottom bar
  const handleDirectFileInput = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setIsScanModalOpen(true);
        handleScanImage(dataUrl, file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  const currentTurn = chess.turn();
  const inCheck = chess.inCheck();
  const isGameOver = chess.isGameOver();

  // Moves to display in the bottom strip (filtering entries with san)
  const moveHistoryItems = history
    .filter((h) => !!h.san)
    .map((h) => ({
      san: h.san!,
      num: h.num || 1,
      isWhite: h.isWhite ?? true,
    }));

  return (
    <div className="min-h-screen bg-[#110e26] text-zinc-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* 1. Header (Exact Chessvision.ai Top Bar + Turn Toggle Sub-bar) */}
      <Header
        onBack={onBack}
        turn={currentTurn}
        onToggleTurn={handleToggleTurn}
        orientation={orientation}
        onFlipOrientation={handleFlipOrientation}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onResetBoard={handleResetBoard}
        boardTheme={boardTheme}
        onChangeBoardTheme={setBoardTheme}
        pieceSize={pieceSize}
        onChangePieceSize={setPieceSize}
        onOpenSamples={() => setIsScanModalOpen(true)}
        onEnterEditMode={() => setIsEditMode(true)}
        currentFen={fen}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col items-center justify-start">
        {/* Success Alert Toast */}
        {scanSuccessMessage && (
          <div
            id="scan-success-toast"
            className="w-full max-w-lg mx-auto bg-emerald-900/90 border border-emerald-500 text-emerald-100 px-4 py-2 text-xs font-medium shadow-lg flex items-center justify-between z-40"
          >
            <span>{scanSuccessMessage}</span>
            <button
              onClick={() => setScanSuccessMessage(null)}
              className="text-emerald-300 hover:text-white text-xs px-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Central Stage: Maximized Chessboard or Position Editor */}
        <div className="w-full max-w-[640px] flex flex-col items-center bg-[#110e26]">
          {isEditMode ? (
            <BoardEditor
              initialFen={fen}
              orientation={orientation}
              boardTheme={boardTheme}
              pieceTheme={pieceTheme}
              onApply={(newFen) => {
                try {
                  const updatedChess = new Chess(newFen);
                  setChess(updatedChess);
                  setFen(updatedChess.fen());
                  setHistory([{ fen: updatedChess.fen() }]);
                  setHistoryIndex(0);
                  setIsEditMode(false);
                  chessAudio.playMove();
                  setScanSuccessMessage('Board position applied! Analyzing position...');
                  setTimeout(() => setScanSuccessMessage(null), 3500);
                } catch (err: any) {
                  console.error('Error applying edited FEN:', err);
                }
              }}
              onCancel={() => setIsEditMode(false)}
              onFlipOrientation={handleFlipOrientation}
            />
          ) : (
            <>
              {/* Full-width responsive Chessboard */}
              <div className="w-full relative">
                <Chessboard
                  chess={chess}
                  orientation={orientation}
                  theme={pieceTheme}
                  boardTheme={boardTheme}
                  pieceSize={pieceSize}
                  bestMove={isEngineEnabled ? evaluation.bestMove : undefined}
                  topMoves={isEngineEnabled ? evaluation.topMoves : undefined}
                  activeArrowRank={activeArrowRank}
                  showArrows={isEngineEnabled}
                  onMove={handleMove}
                />
              </div>

              {/* 2. Move Navigation Bar: |< < > >| 🔄 ≡ (Directly under the board) */}
              <MoveNavControlBar
                canGoBack={historyIndex > 0}
                canGoForward={historyIndex < history.length - 1}
                onFirst={handleFirstMove}
                onPrev={handlePrevMove}
                onNext={handleNextMove}
                onLast={handleLastMove}
                onFlip={handleFlipOrientation}
                onOpenMoveList={() => setIsScanModalOpen(true)}
              />

              {/* 3. Analysis Panel: Evaluation score, depth, orange engine toggle & 3-line suggestions */}
              <BestMoveDisplay
                evaluation={evaluation}
                turn={currentTurn}
                inCheck={inCheck}
                isGameOver={isGameOver}
                isEngineEnabled={isEngineEnabled}
                onToggleEngine={() => setIsEngineEnabled((prev) => !prev)}
                activeArrowRank={activeArrowRank}
                onSelectArrowRank={setActiveArrowRank}
                moveHistory={moveHistoryItems}
              />

              {/* 4. Bottom Controls: FEN, PGN input fields and Set buttons */}
              <BottomControls
                currentFen={fen}
                currentPgn={pgn}
                onApplyFen={handleApplyFen}
                onApplyPgn={handleApplyPgn}
                onOpenScanModal={() => setIsScanModalOpen(true)}
                onFileInputChange={handleDirectFileInput}
              />
            </>
          )}
        </div>
      </main>

      {/* Camera & File Upload Scanner Modal */}
      <CameraScanModal
        isOpen={isScanModalOpen}
        onClose={() => {
          setIsScanModalOpen(false);
          setScanError(null);
        }}
        onScanImage={handleScanImage}
        onSelectSample={handleSelectSample}
        onOpenEditor={() => {
          if (candidateScanFen) {
            try {
              const test = new Chess(candidateScanFen);
              setChess(test);
              setFen(test.fen());
            } catch {
              // Try with default tokens
              const boardOnly = candidateScanFen.split(' ')[0];
              if (boardOnly && boardOnly.split('/').length === 8) {
                try {
                  const test = new Chess(`${boardOnly} w - - 0 1`);
                  setChess(test);
                  setFen(test.fen());
                } catch {
                  setFen(candidateScanFen);
                }
              } else {
                setFen(candidateScanFen);
              }
            }
          }
          setIsEditMode(true);
        }}
        isScanning={isScanning}
        scanError={scanError}
      />
    </div>
  );
}
