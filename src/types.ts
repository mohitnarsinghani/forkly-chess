export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceSize = 'normal' | 'large' | 'xl';

export interface ChessPieceData {
  type: PieceType;
  color: PieceColor;
}

export interface CloudEvalPv {
  moves: string; // e.g. "e2e4 c7c5 g1f3 d7d6"
  cp?: number;   // centipawns (from white's perspective)
  mate?: number; // moves to mate (positive for white, negative for black)
}

export interface CloudEvalResponse {
  cached: boolean;
  fen?: string;
  knodes?: number;
  depth?: number;
  pvs?: CloudEvalPv[];
  error?: string;
}

export interface BestMoveInfo {
  uci: string;      // e.g. "e2e4"
  from: string;     // e.g. "e2"
  to: string;       // e.g. "e4"
  san?: string;     // e.g. "e4" or "Nf3"
  cp?: number;
  mate?: number;
  scoreText?: string;
  depth?: number;
  pvList?: string[];
  source: 'stockfish-18' | 'lichess-cloud' | 'local-engine';
  rank?: number;     // 1, 2, 3
  color?: string;    // arrow color
}

export interface EvaluationState {
  score: number;        // in pawns, e.g. +0.5 or -1.2
  scoreText: string;    // "+0.5", "-1.2", "M3", "-M2"
  mate?: number;
  winChance: number;    // 0 to 100 percentage for White
  bestMove?: BestMoveInfo;
  topMoves?: BestMoveInfo[]; // Top 3 moves/lines
  depth?: number;
  isLoading: boolean;
  source?: 'stockfish-18' | 'lichess-cloud' | 'local-engine' | 'none';
  error?: string;
}

export interface SampleBoard {
  name: string;
  description: string;
  fen: string;
  imageUrl?: string;
}
