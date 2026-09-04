import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { ArrowOverlay } from './ArrowOverlay';
import { BestMoveInfo, PieceColor, PieceType, PieceSize } from '../../types';
import { chessAudio } from '../../utils/chessAudio';

interface ChessboardProps {
  chess: Chess;
  orientation: 'white' | 'black';
  theme?: 'cburnett' | 'merida';
  boardTheme?: 'wood' | 'green' | 'dark';
  pieceSize?: PieceSize;
  bestMove?: BestMoveInfo;
  topMoves?: BestMoveInfo[];
  activeArrowRank?: number | null;
  showArrows?: boolean;
  onMove?: (newFen: string, move: any) => void;
  disabled?: boolean;
}

export const Chessboard: React.FC<ChessboardProps> = ({
  chess,
  orientation = 'white',
  theme = 'cburnett',
  boardTheme = 'wood',
  pieceSize = 'large',
  bestMove,
  topMoves,
  activeArrowRank = null,
  showArrows = true,
  onMove,
  disabled = false,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  // Clear selections when board changes externally
  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [chess.fen()]);

  // Board square colors based on theme (Classic realistic tournament wood)
  const colors = {
    wood: {
      light: 'bg-[#f0d9b5] text-[#b58863]',
      dark: 'bg-[#b58863] text-[#f0d9b5]',
      select: 'bg-amber-300/60',
      lastMove: 'bg-[#cdd26a]/60',
    },
    green: {
      light: 'bg-[#ebecd0] text-[#779556]',
      dark: 'bg-[#779556] text-[#ebecd0]',
      select: 'bg-lime-300/60',
      lastMove: 'bg-yellow-400/40',
    },
    dark: {
      light: 'bg-[#3e444c] text-[#262b30]',
      dark: 'bg-[#262b30] text-[#3e444c]',
      select: 'bg-emerald-500/50',
      lastMove: 'bg-amber-400/30',
    },
  }[boardTheme];

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const displayedFiles = orientation === 'white' ? files : [...files].reverse();
  const displayedRanks = orientation === 'white' ? [...ranks].reverse() : ranks;

  const currentTurn = chess.turn();
  const inCheck = chess.inCheck();

  // Find king square if in check
  let checkedKingSquare: Square | null = null;
  if (inCheck) {
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === currentTurn) {
          const file = String.fromCharCode('a'.charCodeAt(0) + c);
          const rank = (8 - r).toString();
          checkedKingSquare = `${file}${rank}` as Square;
          break;
        }
      }
    }
  }

  const handleSquareClick = (square: Square) => {
    if (disabled) return;

    // If a square is already selected
    if (selectedSquare) {
      if (selectedSquare === square) {
        // Deselect
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // Check if clicking another of the player's own pieces
      const pieceOnTarget = chess.get(square);
      if (pieceOnTarget && pieceOnTarget.color === currentTurn) {
        // Change selection
        setSelectedSquare(square);
        const moves = chess.moves({ square, verbose: true });
        setLegalMoves(moves.map((m) => m.to as Square));
        return;
      }

      // Attempt to make move
      try {
        const isCapture = chess.get(square) !== null;
        const move = chess.move({
          from: selectedSquare,
          to: square,
          promotion: 'q', // auto-promote to queen for quick play
        });

        if (move) {
          setLastMove({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          setLegalMoves([]);

          // Play authentic sound
          if (chess.inCheck()) {
            chessAudio.playCheck();
          } else if (move.captured || isCapture) {
            chessAudio.playCapture();
          } else {
            chessAudio.playMove();
          }

          if (onMove) {
            onMove(chess.fen(), move);
          }
          return;
        }
      } catch {
        // Illegal move
      }

      // If invalid move target, deselect
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // Selecting a piece
    const piece = chess.get(square);
    if (piece && piece.color === currentTurn) {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setLegalMoves(moves.map((m) => m.to as Square));
    }
  };

  // Drag and Drop support
  const handleDragStart = (e: React.DragEvent, square: Square) => {
    if (disabled) return;
    const piece = chess.get(square);
    if (piece && piece.color === currentTurn) {
      e.dataTransfer.setData('text/plain', square);
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setLegalMoves(moves.map((m) => m.to as Square));
    } else {
      e.preventDefault();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault();
    const fromSquare = e.dataTransfer.getData('text/plain') as Square;
    if (!fromSquare || disabled) return;

    try {
      const isCapture = chess.get(targetSquare) !== null;
      const move = chess.move({
        from: fromSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move) {
        setLastMove({ from: fromSquare, to: targetSquare });
        setSelectedSquare(null);
        setLegalMoves([]);

        if (chess.inCheck()) {
          chessAudio.playCheck();
        } else if (move.captured || isCapture) {
          chessAudio.playCapture();
        } else {
          chessAudio.playMove();
        }

        if (onMove) {
          onMove(chess.fen(), move);
        }
      }
    } catch {
      // Illegal drop
    }
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  return (
    <div className="relative w-full aspect-square max-w-[640px] mx-auto select-none sm:rounded-lg overflow-hidden shadow-2xl bg-zinc-900 border-y sm:border-2 border-zinc-800">
      {/* 8x8 Grid */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {displayedRanks.map((rank, rIdx) =>
          displayedFiles.map((file, fIdx) => {
            const square = `${file}${rank}` as Square;
            const piece = chess.get(square);
            const isDarkSquare = (rIdx + fIdx) % 2 === 1;

            const isSelected = selectedSquare === square;
            const isLegalTarget = legalMoves.includes(square);
            const isLastMoveSquare =
              lastMove && (lastMove.from === square || lastMove.to === square);
            const isKingInCheck = checkedKingSquare === square;

            // Show rank coordinate on the first column
            const showRankCoord = fIdx === 0;
            // Show file coordinate on the bottom row
            const showFileCoord = rIdx === 7;

            return (
              <div
                key={square}
                id={`square-${square}`}
                onClick={() => handleSquareClick(square)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, square)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                  isDarkSquare ? colors.dark : colors.light
                }`}
              >
                {/* Last move highlight */}
                {isLastMoveSquare && (
                  <div className={`absolute inset-0 ${colors.lastMove} z-0`} />
                )}

                {/* Selected square highlight */}
                {isSelected && (
                  <div className={`absolute inset-0 ${colors.select} ring-2 ring-amber-400 z-0`} />
                )}

                {/* Checked king glow */}
                {isKingInCheck && (
                  <div className="absolute inset-0 bg-red-600/50 ring-4 ring-red-500 animate-pulse z-0" />
                )}

                {/* Rank number coordinate */}
                {showRankCoord && (
                  <span
                    className={`absolute top-0.5 left-1 text-[10px] sm:text-xs font-bold font-mono opacity-80 pointer-events-none select-none z-10 ${
                      isDarkSquare ? colors.light.split(' ')[1] : colors.dark.split(' ')[1]
                    }`}
                  >
                    {rank}
                  </span>
                )}

                {/* File letter coordinate */}
                {showFileCoord && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-bold font-mono opacity-80 pointer-events-none select-none z-10 ${
                      isDarkSquare ? colors.light.split(' ')[1] : colors.dark.split(' ')[1]
                    }`}
                  >
                    {file}
                  </span>
                )}

                {/* Piece Image - Enlarged to fill square naturally and prominently */}
                {piece && (
                  <div
                    draggable={!disabled && piece.color === currentTurn}
                    onDragStart={(e) => handleDragStart(e, square)}
                    className="relative w-full h-full p-0 z-10 flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                  >
                    <ChessPiece
                      type={piece.type as PieceType}
                      color={piece.color as PieceColor}
                      theme={theme}
                      size={pieceSize}
                      className={`w-full h-full select-none pointer-events-none drop-shadow-sm object-contain ${
                        pieceSize === 'xl'
                          ? 'scale-[1.30]'
                          : pieceSize === 'normal'
                          ? 'scale-[1.04]'
                          : 'scale-[1.18]'
                      } transition-transform`}
                    />
                  </div>
                )}

                {/* Legal Move Indicator */}
                {isLegalTarget && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    {piece ? (
                      // Capture target ring
                      <div className="w-full h-full rounded-none ring-4 ring-amber-500/70 bg-amber-500/20" />
                    ) : (
                      // Normal move dot
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-zinc-900/35" />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* SVG Arrow Overlay for Top 3 Moves suggestions */}
      {showArrows && (
        <ArrowOverlay
          moves={topMoves && topMoves.length > 0 ? topMoves : bestMove ? [bestMove] : []}
          orientation={orientation}
          activeRank={activeArrowRank}
        />
      )}
    </div>
  );
};
