import React, { useState, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { PawnPromotionModal } from './PawnPromotionModal';
import { audio } from '../../services/audioService';

export function ChessboardContainer({
  chess,
  onMove,
  isFlipped = false,
  customArrows = [],
  lastMove = null,
  disabled = false,
  boardWidth = 520
}) {
  const containerRef = useRef(null);
  const [calculatedWidth, setCalculatedWidth] = useState(boardWidth);
  const [optionSquares, setOptionSquares] = useState({});
  const [pendingPromotion, setPendingPromotion] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentW = containerRef.current.parentElement?.clientWidth || window.innerWidth;
        const availableW = Math.min(parentW - 20, 520);
        setCalculatedWidth(availableW > 200 ? availableW : 340);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [boardWidth]);

  const [moveFrom, setMoveFrom] = useState(null);

  const getMoveOptions = (square) => {
    if (disabled) return;
    const moves = chess.moves({ square, verbose: true });
    if (moves.length === 0) {
      setOptionSquares({});
      return;
    }

    const newSquares = {};
    moves.forEach((move) => {
      newSquares[move.to] = {
        background:
          chess.get(move.to) && chess.get(move.to).color !== chess.get(square).color
            ? 'radial-gradient(circle, rgba(239, 68, 68, 0.7) 35%, transparent 40%)'
            : 'radial-gradient(circle, rgba(129, 182, 76, 0.75) 25%, transparent 30%)',
        borderRadius: '50%',
      };
    });

    newSquares[square] = {
      background: 'rgba(240, 193, 92, 0.5)',
    };

    setOptionSquares(newSquares);
  };

  const onPieceDrop = (sourceSquare, targetSquare) => {
    if (disabled) return false;
    setMoveFrom(null);

    const piece = chess.get(sourceSquare);
    if (
      piece &&
      piece.type === 'p' &&
      ((piece.color === 'w' && targetSquare[1] === '8') ||
        (piece.color === 'b' && targetSquare[1] === '1'))
    ) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare, color: piece.color });
      return true;
    }

    const isCaptured = !!chess.get(targetSquare);
    const move = onMove({ from: sourceSquare, to: targetSquare });

    if (!move) {
      setOptionSquares({});
      return false;
    }

    if (chess.inCheck()) {
      audio.playCheck();
    } else if (isCaptured) {
      audio.playCapture();
    } else if (move.flags.includes('k') || move.flags.includes('q')) {
      audio.playCastle();
    } else {
      audio.playMove();
    }

    setOptionSquares({});
    return true;
  };

  const handlePromotionSelect = (pieceType) => {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;
    setPendingPromotion(null);
    setMoveFrom(null);

    const move = onMove({ from, to, promotion: pieceType });
    if (move) {
      audio.playPromote();
    }
  };

  const onSquareClick = (square) => {
    if (disabled) return;

    if (!moveFrom) {
      const piece = chess.get(square);
      if (piece && piece.color === chess.turn()) {
        setMoveFrom(square);
        getMoveOptions(square);
      } else {
        setOptionSquares({});
      }
    } else {
      if (moveFrom === square) {
        setMoveFrom(null);
        setOptionSquares({});
        return;
      }

      const piece = chess.get(square);
      if (piece && piece.color === chess.turn()) {
        setMoveFrom(square);
        getMoveOptions(square);
        return;
      }

      const moveSuccessful = onPieceDrop(moveFrom, square);
      if (!moveSuccessful) {
        setMoveFrom(null);
        setOptionSquares({});
      }
    }
  };

  const customSquareStyles = { ...optionSquares };
  if (lastMove) {
    customSquareStyles[lastMove.from] = { backgroundColor: 'rgba(240, 193, 92, 0.4)' };
    customSquareStyles[lastMove.to] = { backgroundColor: 'rgba(240, 193, 92, 0.6)' };
  }

  return (
    <div
      ref={containerRef}
      className="relative flex justify-center items-center select-none shadow-2xl rounded-lg overflow-hidden border border-chess-border/80 bg-chess-card w-full max-w-[520px]"
    >
      <Chessboard
        position={chess.fen()}
        onPieceDrop={onPieceDrop}
        onSquareClick={onSquareClick}
        boardOrientation={isFlipped ? 'black' : 'white'}
        customSquareStyles={customSquareStyles}
        customArrows={customArrows}
        boardWidth={calculatedWidth}
        customDarkSquareStyle={{ backgroundColor: '#739552' }}
        customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
        animationDuration={200}
        arePiecesDraggable={!disabled}
      />

      <PawnPromotionModal
        isOpen={!!pendingPromotion}
        color={pendingPromotion?.color}
        onSelect={handlePromotionSelect}
      />
    </div>
  );
}
