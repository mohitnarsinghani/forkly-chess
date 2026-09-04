import React, { useState, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { PieceColor, PieceType } from '../../types';
import { Check, ArrowLeftRight, Trash2, RotateCcw, Shield } from 'lucide-react';
import { chessAudio } from '../../utils/chessAudio';

interface BoardEditorProps {
  initialFen: string;
  orientation: 'white' | 'black';
  boardTheme?: 'wood' | 'green' | 'dark';
  pieceTheme?: 'cburnett' | 'merida';
  onApply: (newFen: string) => void;
  onCancel: () => void;
  onFlipOrientation: () => void;
}

type BoardPiece = { type: PieceType; color: PieceColor } | null;
type ToolSelection = { type: PieceType; color: PieceColor } | 'trash' | null;

interface TouchDragState {
  piece: { type: PieceType; color: PieceColor };
  originSquare?: { r: number; c: number };
  x: number;
  y: number;
}

export const BoardEditor: React.FC<BoardEditorProps> = ({
  initialFen,
  orientation,
  boardTheme = 'wood',
  pieceTheme = 'cburnett',
  onApply,
  onCancel,
  onFlipOrientation,
}) => {
  // Parse initial FEN into 8x8 matrix (r=0 is rank 8, r=7 is rank 1; c=0 is file a, c=7 is file h)
  const parseFenToBoard = (fenString: string): {
    board: BoardPiece[][];
    turn: 'w' | 'b';
    castling: { K: boolean; Q: boolean; k: boolean; q: boolean };
  } => {
    const parts = fenString.trim().split(/\s+/);
    const boardPart = parts[0] || '8/8/8/8/8/8/8/8';
    const turnPart = (parts[1] === 'b' ? 'b' : 'w') as 'w' | 'b';
    const castlingPart = parts[2] || 'KQkq';

    const matrix: BoardPiece[][] = [];
    const ranks = boardPart.split('/');

    for (let r = 0; r < 8; r++) {
      const row: BoardPiece[] = [];
      const rankStr = ranks[r] || '8';
      for (const ch of rankStr) {
        if (/[1-8]/.test(ch)) {
          const emptyCount = parseInt(ch, 10);
          for (let i = 0; i < emptyCount; i++) {
            row.push(null);
          }
        } else {
          const color: PieceColor = ch === ch.toUpperCase() ? 'w' : 'b';
          const type = ch.toLowerCase() as PieceType;
          row.push({ type, color });
        }
      }
      while (row.length < 8) row.push(null);
      matrix.push(row.slice(0, 8));
    }

    return {
      board: matrix,
      turn: turnPart,
      castling: {
        K: castlingPart.includes('K'),
        Q: castlingPart.includes('Q'),
        k: castlingPart.includes('k'),
        q: castlingPart.includes('q'),
      },
    };
  };

  const parsed = parseFenToBoard(initialFen);
  const [board, setBoard] = useState<BoardPiece[][]>(parsed.board);
  const [turn, setTurn] = useState<'w' | 'b'>(parsed.turn);
  const [castling, setCastling] = useState(parsed.castling);
  const [selectedTool, setSelectedTool] = useState<ToolSelection>(null);
  const [selectedBoardSquare, setSelectedBoardSquare] = useState<{ r: number; c: number } | null>(null);
  
  // HTML5 Drag state
  const [draggedSquare, setDraggedSquare] = useState<{ r: number; c: number } | null>(null);
  const [draggedPalettePiece, setDraggedPalettePiece] = useState<{ type: PieceType; color: PieceColor } | null>(null);
  const [dragOverSquare, setDragOverSquare] = useState<{ r: number; c: number } | null>(null);

  // Mobile Touch Drag state
  const [touchDrag, setTouchDrag] = useState<TouchDragState | null>(null);

  const [castlingModalOpen, setCastlingModalOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  // Available pieces in palette
  const pieceTypes: PieceType[] = ['k', 'q', 'r', 'b', 'n', 'p'];

  // Board square colors
  const colors = {
    wood: {
      light: 'bg-[#f0d9b5] text-[#b58863]',
      dark: 'bg-[#b58863] text-[#f0d9b5]',
    },
    green: {
      light: 'bg-[#ebecd0] text-[#779556]',
      dark: 'bg-[#779556] text-[#ebecd0]',
    },
    dark: {
      light: 'bg-[#3e444c] text-[#262b30]',
      dark: 'bg-[#262b30] text-[#3e444c]',
    },
  }[boardTheme];

  // Square Click handler (Tap to select & tap to place)
  const handleSquareClick = (r: number, c: number) => {
    setValidationError(null);

    // If trash tool selected
    if (selectedTool === 'trash') {
      if (board[r][c]) {
        const next = board.map((row) => [...row]);
        next[r][c] = null;
        setBoard(next);
        chessAudio.playMove();
      }
      return;
    }

    // If a palette piece tool is selected -> Place on square
    if (selectedTool) {
      const next = board.map((row) => [...row]);
      next[r][c] = { type: selectedTool.type, color: selectedTool.color };
      setBoard(next);
      chessAudio.playMove();
      return;
    }

    // If previously selected a board piece -> Move to this square
    if (selectedBoardSquare) {
      if (selectedBoardSquare.r === r && selectedBoardSquare.c === c) {
        // Deselect or remove
        setSelectedBoardSquare(null);
        return;
      }
      const next = board.map((row) => [...row]);
      next[r][c] = next[selectedBoardSquare.r][selectedBoardSquare.c];
      next[selectedBoardSquare.r][selectedBoardSquare.c] = null;
      setBoard(next);
      setSelectedBoardSquare(null);
      chessAudio.playMove();
      return;
    }

    // If clicking a square with a piece and no tool selected -> Select it for moving
    if (board[r][c]) {
      setSelectedBoardSquare({ r, c });
      return;
    }
  };

  // Clear all pieces
  const handleClearBoard = () => {
    const empty: BoardPiece[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
    setBoard(empty);
    setCastling({ K: false, Q: false, k: false, q: false });
    setSelectedTool(null);
    setSelectedBoardSquare(null);
    setValidationError(null);
    chessAudio.playMove();
  };

  // Reset to standard chess starting position
  const handleResetToStandard = () => {
    const start = parseFenToBoard(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    );
    setBoard(start.board);
    setTurn('w');
    setCastling({ K: true, Q: true, k: true, q: true });
    setSelectedTool(null);
    setSelectedBoardSquare(null);
    setValidationError(null);
    chessAudio.playMove();
  };

  // ---------------- HTML5 Drag & Drop Handlers ----------------

  // 1. Drag started on a board piece
  const handleDragStartSquare = (e: React.DragEvent, r: number, c: number) => {
    const piece = board[r][c];
    if (!piece) return;
    setDraggedSquare({ r, c });
    setDraggedPalettePiece(null);
    setSelectedBoardSquare(null);
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ source: 'board', r, c, piece })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  // 2. Drag started on a palette piece
  const handleDragStartPalette = (
    e: React.DragEvent,
    piece: { type: PieceType; color: PieceColor }
  ) => {
    setDraggedPalettePiece(piece);
    setDraggedSquare(null);
    setSelectedBoardSquare(null);
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ source: 'palette', piece })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

  // 3. Drag over a square
  const handleDragOverSquare = (e: React.DragEvent, r: number, c: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedSquare ? 'move' : 'copy';
    if (!dragOverSquare || dragOverSquare.r !== r || dragOverSquare.c !== c) {
      setDragOverSquare({ r, c });
    }
  };

  // 4. Drop onto a square
  const handleDropOnSquare = (e: React.DragEvent, targetR: number, targetC: number) => {
    e.preventDefault();
    setDragOverSquare(null);

    // Case A: Moved from another board square
    if (draggedSquare) {
      const { r: srcR, c: srcC } = draggedSquare;
      if (srcR === targetR && srcC === targetC) {
        setDraggedSquare(null);
        return;
      }
      const next = board.map((row) => [...row]);
      next[targetR][targetC] = next[srcR][srcC];
      next[srcR][srcC] = null;
      setBoard(next);
      setDraggedSquare(null);
      chessAudio.playMove();
      return;
    }

    // Case B: Dropped from palette
    if (draggedPalettePiece) {
      const next = board.map((row) => [...row]);
      next[targetR][targetC] = {
        type: draggedPalettePiece.type,
        color: draggedPalettePiece.color,
      };
      setBoard(next);
      setDraggedPalettePiece(null);
      chessAudio.playMove();
      return;
    }

    // Fallback if dataTransfer used
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        const next = board.map((row) => [...row]);
        if (data.source === 'board') {
          next[targetR][targetC] = next[data.r][data.c];
          next[data.r][data.c] = null;
        } else if (data.source === 'palette' && data.piece) {
          next[targetR][targetC] = data.piece;
        }
        setBoard(next);
        chessAudio.playMove();
      }
    } catch {
      // ignore
    }
    setDraggedSquare(null);
    setDraggedPalettePiece(null);
  };

  // 5. Dragged off the board (onto palette/trash or outside) -> Remove piece from board
  const handleDropOffBoard = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSquare(null);
    if (draggedSquare) {
      const { r, c } = draggedSquare;
      const next = board.map((row) => [...row]);
      next[r][c] = null;
      setBoard(next);
      setDraggedSquare(null);
      chessAudio.playMove();
    }
  };

  // ---------------- Touch Drag Handlers (Mobile Support) ----------------

  const handleTouchStartPalette = (
    e: React.TouchEvent,
    piece: { type: PieceType; color: PieceColor }
  ) => {
    const touch = e.touches[0];
    if (!touch) return;
    setTouchDrag({
      piece,
      x: touch.clientX,
      y: touch.clientY,
    });
  };

  const handleTouchStartSquare = (
    e: React.TouchEvent,
    r: number,
    c: number
  ) => {
    const piece = board[r][c];
    if (!piece) return;
    const touch = e.touches[0];
    if (!touch) return;
    setTouchDrag({
      piece,
      originSquare: { r, c },
      x: touch.clientX,
      y: touch.clientY,
    });
  };

  // Global touchmove and touchend listener when dragging with touch
  useEffect(() => {
    if (!touchDrag) return;

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      setTouchDrag((prev) => (prev ? { ...prev, x: touch.clientX, y: touch.clientY } : null));

      // Check element under touch point for square hover highlight
      const elem = document.elementFromPoint(touch.clientX, touch.clientY);
      const squareElem = elem?.closest('[data-square-r]');
      if (squareElem) {
        const r = parseInt(squareElem.getAttribute('data-square-r') || '-1', 10);
        const c = parseInt(squareElem.getAttribute('data-square-c') || '-1', 10);
        if (r >= 0 && c >= 0) {
          setDragOverSquare({ r, c });
          return;
        }
      }
      setDragOverSquare(null);
    };

    const onTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (touch) {
        const elem = document.elementFromPoint(touch.clientX, touch.clientY);
        const squareElem = elem?.closest('[data-square-r]');

        if (squareElem) {
          const targetR = parseInt(squareElem.getAttribute('data-square-r') || '-1', 10);
          const targetC = parseInt(squareElem.getAttribute('data-square-c') || '-1', 10);

          if (targetR >= 0 && targetC >= 0) {
            const next = board.map((row) => [...row]);
            if (touchDrag.originSquare) {
              const { r: srcR, c: srcC } = touchDrag.originSquare;
              if (srcR !== targetR || srcC !== targetC) {
                next[targetR][targetC] = next[srcR][srcC];
                next[srcR][srcC] = null;
                setBoard(next);
                chessAudio.playMove();
              }
            } else {
              next[targetR][targetC] = touchDrag.piece;
              setBoard(next);
              chessAudio.playMove();
            }
          }
        } else if (touchDrag.originSquare) {
          // Dropped outside board -> Remove piece from board
          const { r: srcR, c: srcC } = touchDrag.originSquare;
          const next = board.map((row) => [...row]);
          next[srcR][srcC] = null;
          setBoard(next);
          chessAudio.playMove();
        }
      }
      setTouchDrag(null);
      setDragOverSquare(null);
    };

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [touchDrag, board]);

  // Apply Changes and build valid FEN
  const handleApply = () => {
    let whiteKings = 0;
    let blackKings = 0;
    let pawnsOnFirstOrLastRank = false;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p) {
          if (p.type === 'k') {
            if (p.color === 'w') whiteKings++;
            else blackKings++;
          }
          if (p.type === 'p' && (r === 0 || r === 7)) {
            pawnsOnFirstOrLastRank = true;
          }
        }
      }
    }

    if (whiteKings === 0) {
      setValidationError('White needs a King (♔) on the board.');
      return;
    }
    if (whiteKings > 1) {
      setValidationError('White cannot have more than 1 King.');
      return;
    }
    if (blackKings === 0) {
      setValidationError('Black needs a King (♚) on the board.');
      return;
    }
    if (blackKings > 1) {
      setValidationError('Black cannot have more than 1 King.');
      return;
    }
    if (pawnsOnFirstOrLastRank) {
      setValidationError('Pawns cannot be placed on the 1st or 8th rank.');
      return;
    }

    const rankStrings: string[] = [];
    for (let r = 0; r < 8; r++) {
      let emptyCount = 0;
      let rankStr = '';
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            rankStr += emptyCount;
            emptyCount = 0;
          }
          rankStr += p.color === 'w' ? p.type.toUpperCase() : p.type.toLowerCase();
        }
      }
      if (emptyCount > 0) {
        rankStr += emptyCount;
      }
      rankStrings.push(rankStr);
    }

    const boardFen = rankStrings.join('/');

    let castlingStr = '';
    if (castling.K) castlingStr += 'K';
    if (castling.Q) castlingStr += 'Q';
    if (castling.k) castlingStr += 'k';
    if (castling.q) castlingStr += 'q';
    if (!castlingStr) castlingStr = '-';

    const candidateFen = `${boardFen} ${turn} ${castlingStr} - 0 1`;

    try {
      const test = new Chess(candidateFen);
      onApply(test.fen());
    } catch {
      try {
        const altTurn = turn === 'w' ? 'b' : 'w';
        const repaired = new Chess(`${boardFen} ${altTurn} - - 0 1`);
        onApply(repaired.fen());
      } catch (err: any) {
        setValidationError('Invalid chess position: ' + (err?.message || 'Check king safety.'));
      }
    }
  };

  const rowIndices = orientation === 'white' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const colIndices = orientation === 'white' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  return (
    <div id="board-position-editor" className="w-full flex flex-col items-center select-none">
      {/* 1. TOP EDIT ACTION BAR (APPLY, CANCEL, A1<=>H8) */}
      <div className="w-full bg-[#171536] px-3 py-2.5 flex items-center justify-between border-b border-indigo-950 shadow-md">
        <div className="flex items-center gap-2">
          {/* APPLY Button */}
          <button
            id="editor-btn-apply"
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2563eb] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-md shadow-sm transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>APPLY</span>
          </button>

          {/* CANCEL Button */}
          <button
            id="editor-btn-cancel"
            onClick={onCancel}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-semibold text-xs uppercase tracking-wider rounded-md shadow-sm transition-all border border-slate-300"
          >
            CANCEL
          </button>
        </div>

        {/* FLIP ORIENTATION BUTTON (A1 ⇄ H8) */}
        <button
          id="editor-btn-flip"
          onClick={onFlipOrientation}
          title="Flip Board Orientation"
          className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 font-semibold text-xs rounded-md shadow-sm transition-all border border-slate-300"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>A1 ⇄ H8</span>
        </button>
      </div>

      {/* 2. SECOND TOOLBAR ROW (White/Black to play toggle, Castling, Clear Board) */}
      <div className="w-full bg-[#1b183d] px-3 py-2 flex items-center justify-between border-b border-indigo-900/40 text-xs text-zinc-200">
        {/* Turn Toggle Switch */}
        <div className="flex items-center gap-2">
          <button
            id="editor-btn-toggle-turn"
            onClick={() => setTurn(turn === 'w' ? 'b' : 'w')}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <div
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                turn === 'w' ? 'bg-slate-200' : 'bg-slate-600'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                  turn === 'w' ? 'translate-x-0 bg-slate-900' : 'translate-x-4 bg-white'
                }`}
              />
            </div>
            <span className="font-medium text-zinc-200 whitespace-nowrap">
              {turn === 'w' ? 'White to play' : 'Black to play'}
            </span>
          </button>
        </div>

        {/* Action Buttons: Castling, Clear Board, Reset */}
        <div className="flex items-center gap-2">
          <button
            id="editor-btn-castling"
            onClick={() => setCastlingModalOpen(!castlingModalOpen)}
            className={`px-3 py-1 font-medium rounded-md shadow-xs transition-all border text-xs ${
              castlingModalOpen
                ? 'bg-amber-400 text-slate-950 border-amber-500'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
            }`}
          >
            Castling
          </button>

          <button
            id="editor-btn-clear"
            onClick={handleClearBoard}
            className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 font-medium rounded-md shadow-xs transition-all border border-slate-300 text-xs"
          >
            Clear Board
          </button>

          <button
            id="editor-btn-standard"
            onClick={handleResetToStandard}
            title="Reset to standard starting position"
            className="p-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-md shadow-xs transition-all border border-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Castling Settings Popover */}
      {castlingModalOpen && (
        <div
          id="editor-castling-popover"
          className="w-full bg-[#201c47] border-b border-indigo-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Castling Rights:</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={castling.K}
                onChange={(e) => setCastling({ ...castling, K: e.target.checked })}
                className="accent-blue-600 rounded"
              />
              <span>White O-O</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={castling.Q}
                onChange={(e) => setCastling({ ...castling, Q: e.target.checked })}
                className="accent-blue-600 rounded"
              />
              <span>White O-O-O</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={castling.k}
                onChange={(e) => setCastling({ ...castling, k: e.target.checked })}
                className="accent-blue-600 rounded"
              />
              <span>Black O-O</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={castling.q}
                onChange={(e) => setCastling({ ...castling, q: e.target.checked })}
                className="accent-blue-600 rounded"
              />
              <span>Black O-O-O</span>
            </label>
          </div>
        </div>
      )}

      {/* Validation Error Alert */}
      {validationError && (
        <div className="w-full bg-rose-950/90 border-b border-rose-500 text-rose-200 text-xs px-3 py-1.5 text-center font-medium">
          {validationError}
        </div>
      )}

      {/* 3. BLACK PIECES PALETTE (ABOVE THE BOARD) - DRAGGABLE */}
      <div
        id="palette-black-pieces"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOffBoard}
        className="w-full max-w-[620px] bg-[#141130] py-2 px-3 flex items-center justify-center gap-2 sm:gap-4 border-b border-indigo-950/60"
      >
        {pieceTypes.map((type) => {
          const isSelected =
            selectedTool &&
            typeof selectedTool === 'object' &&
            selectedTool.type === type &&
            selectedTool.color === 'b';
          return (
            <div
              key={`black-${type}`}
              id={`palette-b-${type}`}
              draggable
              onDragStart={(e) => handleDragStartPalette(e, { type, color: 'b' })}
              onTouchStart={(e) => handleTouchStartPalette(e, { type, color: 'b' })}
              onClick={() => {
                setSelectedBoardSquare(null);
                setSelectedTool(isSelected ? null : { type, color: 'b' });
              }}
              className={`w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center rounded-lg transition-all cursor-grab active:cursor-grabbing ${
                isSelected
                  ? 'bg-blue-600/40 ring-2 ring-blue-500 scale-110 shadow-lg'
                  : 'hover:bg-white/10 active:scale-95'
              }`}
              title={`Drag or tap to place Black ${type.toUpperCase()}`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 pointer-events-none select-none flex items-center justify-center">
                <ChessPiece type={type} color="b" theme={pieceTheme} size="large" />
              </div>
            </div>
          );
        })}

        {/* Trash Tool / Drop here to delete */}
        <div
          id="palette-trash"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropOffBoard}
          onClick={() => {
            setSelectedBoardSquare(null);
            setSelectedTool(selectedTool === 'trash' ? null : 'trash');
          }}
          className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            selectedTool === 'trash'
              ? 'bg-rose-600/40 ring-2 ring-rose-500 scale-110 text-rose-300'
              : 'text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95'
          }`}
          title="Eraser: Drop piece here to delete, or tap to clear squares"
        >
          <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 pointer-events-none" />
        </div>
      </div>

      {/* 4. THE 8x8 CHESSBOARD (Interactive Drag & Drop Matrix) */}
      <div
        ref={boardRef}
        className="w-full max-w-[620px] aspect-square relative select-none"
      >
        <div className="w-full h-full grid grid-cols-8 grid-rows-8 border border-zinc-700/60 shadow-2xl">
          {rowIndices.map((r, visualRowIndex) =>
            colIndices.map((c, visualColIndex) => {
              const isLight = (r + c) % 2 === 0;
              const squareColor = isLight ? colors.light : colors.dark;
              const piece = board[r][c];

              // Coordinate labels
              const fileLetter = String.fromCharCode('a'.charCodeAt(0) + c);
              const rankNumber = (8 - r).toString();

              const showFileLabel = visualRowIndex === 7;
              const showRankLabel = visualColIndex === 0;

              // Check if square is currently targeted by drag
              const isTargeted =
                dragOverSquare &&
                dragOverSquare.r === r &&
                dragOverSquare.c === c;

              // Check if square is selected via tap
              const isSelected =
                selectedBoardSquare &&
                selectedBoardSquare.r === r &&
                selectedBoardSquare.c === c;

              return (
                <div
                  key={`${r}-${c}`}
                  id={`square-${fileLetter}${rankNumber}`}
                  data-square-r={r}
                  data-square-c={c}
                  onClick={() => handleSquareClick(r, c)}
                  onDragOver={(e) => handleDragOverSquare(e, r, c)}
                  onDrop={(e) => handleDropOnSquare(e, r, c)}
                  className={`relative flex items-center justify-center transition-all ${squareColor} ${
                    isTargeted ? 'ring-4 ring-blue-400 brightness-110 z-10' : ''
                  } ${isSelected ? 'ring-3 ring-amber-400 brightness-105 z-10' : ''}`}
                >
                  {/* Rank coordinate label */}
                  {showRankLabel && (
                    <span className="absolute top-0.5 left-1 text-[9px] sm:text-[11px] font-bold select-none opacity-80 pointer-events-none">
                      {rankNumber}
                    </span>
                  )}

                  {/* File coordinate label */}
                  {showFileLabel && (
                    <span className="absolute bottom-0.5 right-1 text-[9px] sm:text-[11px] font-bold select-none opacity-80 pointer-events-none">
                      {fileLetter}
                    </span>
                  )}

                  {/* Drop target indicator pulse */}
                  {isTargeted && (
                    <div className="absolute inset-0 bg-blue-500/25 pointer-events-none" />
                  )}

                  {/* Chess piece (Draggable on both Desktop and Mobile) */}
                  {piece && (
                    <div
                      draggable
                      onDragStart={(e) => handleDragStartSquare(e, r, c)}
                      onTouchStart={(e) => handleTouchStartSquare(e, r, c)}
                      className={`w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform hover:scale-110 select-none ${
                        isSelected ? 'scale-115 ring-2 ring-amber-400 rounded' : ''
                      }`}
                    >
                      <ChessPiece
                        type={piece.type}
                        color={piece.color}
                        theme={pieceTheme}
                        size="large"
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. WHITE PIECES PALETTE (BELOW THE BOARD) - DRAGGABLE */}
      <div
        id="palette-white-pieces"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOffBoard}
        className="w-full max-w-[620px] bg-[#141130] py-2 px-3 flex items-center justify-center gap-2 sm:gap-4 border-t border-indigo-950/60"
      >
        {pieceTypes.map((type) => {
          const isSelected =
            selectedTool &&
            typeof selectedTool === 'object' &&
            selectedTool.type === type &&
            selectedTool.color === 'w';
          return (
            <div
              key={`white-${type}`}
              id={`palette-w-${type}`}
              draggable
              onDragStart={(e) => handleDragStartPalette(e, { type, color: 'w' })}
              onTouchStart={(e) => handleTouchStartPalette(e, { type, color: 'w' })}
              onClick={() => {
                setSelectedBoardSquare(null);
                setSelectedTool(isSelected ? null : { type, color: 'w' });
              }}
              className={`w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center rounded-lg transition-all cursor-grab active:cursor-grabbing ${
                isSelected
                  ? 'bg-blue-600/40 ring-2 ring-blue-500 scale-110 shadow-lg'
                  : 'hover:bg-white/10 active:scale-95'
              }`}
              title={`Drag or tap to place White ${type.toUpperCase()}`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 pointer-events-none select-none flex items-center justify-center">
                <ChessPiece type={type} color="w" theme={pieceTheme} size="large" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Tip */}
      <div className="w-full max-w-[620px] text-center py-2 px-2 text-[11px] text-zinc-400">
        💡 <strong className="text-zinc-300">Drag & Drop</strong> pieces from palette to board, or move pieces square-to-square. Drag off the board to delete. Tap also works!
      </div>

      {/* Mobile Floating Ghost Piece during Touch Drag */}
      {touchDrag && (
        <div
          style={{
            position: 'fixed',
            left: touchDrag.x,
            top: touchDrag.y,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          className="w-14 h-14 drop-shadow-2xl opacity-90 scale-125"
        >
          <ChessPiece
            type={touchDrag.piece.type}
            color={touchDrag.piece.color}
            theme={pieceTheme}
          />
        </div>
      )}
    </div>
  );
};
