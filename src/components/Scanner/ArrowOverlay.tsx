import React from 'react';
import { BestMoveInfo } from '../../types';

interface ArrowOverlayProps {
  moves?: BestMoveInfo[];
  orientation?: 'white' | 'black';
  activeRank?: number | null; // if null, show all 3
}

// Arrow colors for top 3 lines (Rank 1 matches user screenshot's vibrant sky blue/cyan)
export const ARROW_COLORS = {
  1: {
    primary: '#38bdf8', // Vibrant Sky Blue (exact match to screenshot)
    shadow: '#0369a1',
    label: '#0284c7',
  },
  2: {
    primary: '#34d399', // Emerald Green
    shadow: '#047857',
    label: '#059669',
  },
  3: {
    primary: '#fbbf24', // Amber Gold
    shadow: '#b45309',
    label: '#d97706',
  },
};

export const ArrowOverlay: React.FC<ArrowOverlayProps> = ({
  moves = [],
  orientation = 'white',
  activeRank = null,
}) => {
  if (!moves || moves.length === 0) {
    return null;
  }

  // Convert algebraic square (e.g. "e2") to 0-7 column and row
  const squareToCoords = (sq: string) => {
    if (!sq || sq.length < 2) return { x: 0, y: 0 };
    const file = sq.charCodeAt(0) - 'a'.charCodeAt(0); // 0..7
    const rank = parseInt(sq[1], 10) - 1;              // 0..7 (0=rank 1, 7=rank 8)

    const col = orientation === 'white' ? file : 7 - file;
    const row = orientation === 'white' ? 7 - rank : rank;

    // Center of square in 800x800 coordinate system (each square is 100x100)
    return {
      x: col * 100 + 50,
      y: row * 100 + 50,
    };
  };

  // Render arrows sorted so rank 3 is rendered first, then rank 2, then rank 1 on top
  const sortedMoves = [...moves].sort((a, b) => (b.rank || 3) - (a.rank || 1));

  return (
    <svg
      viewBox="0 0 800 800"
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="arrow-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>

      {sortedMoves.map((m) => {
        const rank = (m.rank || 1) as 1 | 2 | 3;
        const isHighlighted = activeRank === null || activeRank === rank;
        const colorConfig = ARROW_COLORS[rank] || ARROW_COLORS[1];

        const start = squareToCoords(m.from);
        const end = squareToCoords(m.to);

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 15) return null;

        // Proportions tailored to match user's screenshot
        // In the screenshot: wide shaft, clean triangular arrowhead pointing into target square
        const shaftWidth = rank === 1 ? 24 : 18;
        const headWidth = rank === 1 ? 48 : 38;
        const headLength = rank === 1 ? 40 : 32;
        const shortenEnd = 20;

        const unitX = dx / dist;
        const unitY = dy / dist;

        // Tip of the arrow terminates slightly before square center/edge
        const targetX = end.x - unitX * shortenEnd;
        const targetY = end.y - unitY * shortenEnd;

        // Arrow base (where arrowhead meets shaft)
        const arrowBaseX = targetX - unitX * headLength;
        const arrowBaseY = targetY - unitY * headLength;

        const perpX = -unitY * (headWidth / 2);
        const perpY = unitX * (headWidth / 2);

        const headP1 = `${targetX},${targetY}`;
        const headP2 = `${arrowBaseX + perpX},${arrowBaseY + perpY}`;
        const headP3 = `${arrowBaseX - perpX},${arrowBaseY - perpY}`;

        // Opacity
        let opacity = 0.88;
        if (rank === 2) opacity = 0.78;
        if (rank === 3) opacity = 0.68;
        if (!isHighlighted) opacity = 0.25;

        return (
          <g key={`${m.from}-${m.to}-${rank}`} opacity={opacity} filter="url(#arrow-glow)">
            {/* Origin indicator circle with rank number */}
            <circle
              cx={start.x}
              cy={start.y}
              r={rank === 1 ? 14 : 12}
              fill={colorConfig.primary}
              stroke="#0f172a"
              strokeWidth="2"
            />
            <text
              x={start.x}
              y={start.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={rank === 1 ? '14' : '12'}
              fontWeight="bold"
              fill="#0f172a"
              fontFamily="sans-serif"
            >
              {rank}
            </text>

            {/* Arrow shaft with rounded line cap */}
            <line
              x1={start.x}
              y1={start.y}
              x2={arrowBaseX}
              y2={arrowBaseY}
              stroke={colorConfig.primary}
              strokeWidth={shaftWidth}
              strokeLinecap="round"
            />

            {/* Triangular arrow head with subtle border */}
            <polygon
              points={`${headP1} ${headP2} ${headP3}`}
              fill={colorConfig.primary}
              stroke={colorConfig.primary}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </g>
        );
      })}
    </svg>
  );
};
