import React, { useState } from 'react';
import { PieceColor, PieceType, PieceSize } from '../../types';

interface ChessPieceProps {
  type: PieceType;
  color: PieceColor;
  theme?: 'cburnett' | 'merida';
  size?: PieceSize;
  className?: string;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({
  type,
  color,
  theme = 'cburnett',
  size = 'large',
  className,
}) => {
  const [loadFailed, setLoadFailed] = useState(false);

  const pieceCode = `${color}${type.toUpperCase()}`; // e.g. "wP", "bK"
  const lichessUrl = `https://lichess1.org/assets/piece/${theme}/${pieceCode}.svg`;

  // Scale mappings: large is ~18% bigger to fill chess squares authentically, xl is ~28% bigger
  const sizeClasses = {
    normal: 'scale-[1.02]',
    large: 'scale-[1.18]',
    xl: 'scale-[1.28]',
  }[size];

  const combinedClass = className || `w-full h-full select-none pointer-events-none drop-shadow-sm object-contain ${sizeClasses} transition-transform`;

  if (!loadFailed) {
    return (
      <img
        src={lichessUrl}
        alt={`${color === 'w' ? 'White' : 'Black'} ${type}`}
        className={combinedClass}
        draggable={false}
        referrerPolicy="no-referrer"
        onError={() => setLoadFailed(true)}
      />
    );
  }

  // Fallback vector SVG if CDN is unreachable
  return (
    <FallbackPieceSVG type={type} color={color} size={size} className={combinedClass} />
  );
};

// Clean, high-contrast fallback vector pieces
const FallbackPieceSVG: React.FC<{ type: PieceType; color: PieceColor; size?: PieceSize; className?: string }> = ({
  type,
  color,
  size = 'large',
  className,
}) => {
  const isWhite = color === 'w';
  const fill = isWhite ? '#ffffff' : '#1e293b';
  const stroke = isWhite ? '#0f172a' : '#f8fafc';

  const symbols: Record<PieceType, { w: string; b: string }> = {
    p: { w: '♙', b: '♟' },
    n: { w: '♘', b: '♞' },
    b: { w: '♗', b: '♝' },
    r: { w: '♖', b: '♜' },
    q: { w: '♕', b: '♛' },
    k: { w: '♔', b: '♚' },
  };

  const fontSize = size === 'xl' ? '42' : size === 'large' ? '38' : '34';

  return (
    <svg viewBox="0 0 45 45" className={className}>
      <text
        x="50%"
        y="67%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={fontSize}
        fill={fill}
        stroke={stroke}
        strokeWidth="1.2"
        fontFamily="sans-serif"
      >
        {symbols[type][color]}
      </text>
    </svg>
  );
};
