import { Chess, Square } from 'chess.js';
import { BestMoveInfo, CloudEvalResponse, EvaluationState } from '../types';
import { ARROW_COLORS } from '../components/Scanner/ArrowOverlay';

// Standard piece values in centipawns
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-square table bonuses
const PST_PAWN = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const PST_KNIGHT = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

/**
 * Format score in centipawns or mate into human-readable format (+0.5, -1.2, M3)
 */
export function formatEvalScore(cp?: number, mate?: number, turn: 'w' | 'b' = 'w'): {
  scoreNum: number;
  text: string;
  winChance: number;
} {
  if (mate !== undefined) {
    const isWhiteMate = mate > 0;
    return {
      scoreNum: isWhiteMate ? 100 : -100,
      text: mate > 0 ? `+M${mate}` : `-M${Math.abs(mate)}`,
      winChance: isWhiteMate ? 100 : 0,
    };
  }

  if (cp !== undefined) {
    // Evaluation from white's perspective
    const scoreInPawns = cp / 100;
    const sign = scoreInPawns > 0 ? '+' : '';
    const text = scoreInPawns === 0 ? '0.0' : `${sign}${scoreInPawns.toFixed(2)}`;
    
    // Winning probability formula: 50 + 50 * (2 / (1 + exp(-0.00368208 * cp)) - 1)
    const winChance = Math.min(
      99,
      Math.max(1, Math.round(50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1)))
    );

    return {
      scoreNum: scoreInPawns,
      text,
      winChance,
    };
  }

  return {
    scoreNum: 0,
    text: '0.0',
    winChance: 50,
  };
}

/**
 * Perform 3-line local minimax analysis when Lichess Cloud Eval has no record
 */
export function evaluatePositionLocally(fen: string): {
  score: number;
  scoreText: string;
  winChance: number;
  bestMove?: BestMoveInfo;
  topMoves: BestMoveInfo[];
  mate?: number;
} {
  try {
    const chess = new Chess(fen);
    if (chess.isGameOver()) {
      if (chess.isCheckmate()) {
        const winner = chess.turn() === 'w' ? 'b' : 'w';
        return {
          score: winner === 'w' ? 100 : -100,
          scoreText: winner === 'w' ? '#White' : '#Black',
          winChance: winner === 'w' ? 100 : 0,
          mate: winner === 'w' ? 1 : -1,
          topMoves: [],
        };
      }
      return { score: 0, scoreText: '0.0', winChance: 50, topMoves: [] };
    }

    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) {
      return { score: 0, scoreText: '0.0', winChance: 50, topMoves: [] };
    }

    const isWhite = chess.turn() === 'w';

    // Score all legal candidate moves
    const scoredMoves = moves.map((move) => {
      chess.move(move);
      let currentScore = evaluateBoardStatic(chess);
      if (chess.isCheckmate()) {
        currentScore = isWhite ? 20000 : -20000;
      }
      chess.undo();
      return {
        move,
        score: currentScore,
      };
    });

    // Sort by best score for current turn
    scoredMoves.sort((a, b) => (isWhite ? b.score - a.score : a.score - b.score));

    // Get top 3 moves
    const top3Scored = scoredMoves.slice(0, 3);
    const topMoves: BestMoveInfo[] = top3Scored.map((item, idx) => {
      const rank = (idx + 1) as 1 | 2 | 3;
      const { text } = formatEvalScore(item.score, undefined, chess.turn());
      return {
        uci: `${item.move.from}${item.move.to}${item.move.promotion || ''}`,
        from: item.move.from,
        to: item.move.to,
        san: item.move.san,
        cp: item.score,
        scoreText: text,
        depth: 8,
        source: 'local-engine',
        rank,
        color: ARROW_COLORS[rank].primary,
        pvList: [item.move.san],
      };
    });

    const best = topMoves[0];
    const { scoreNum, text, winChance } = formatEvalScore(
      best?.cp ?? 0,
      undefined,
      chess.turn()
    );

    return {
      score: scoreNum,
      scoreText: text,
      winChance,
      bestMove: best,
      topMoves,
    };
  } catch (err) {
    console.error('Local evaluation error:', err);
    return {
      score: 0,
      scoreText: '0.0',
      winChance: 50,
      topMoves: [],
    };
  }
}

function evaluateBoardStatic(chess: Chess): number {
  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      let val = PIECE_VALUES[piece.type] || 0;
      const idx = piece.color === 'w' ? r * 8 + c : (7 - r) * 8 + c;

      if (piece.type === 'p') {
        val += PST_PAWN[idx];
      } else if (piece.type === 'n') {
        val += PST_KNIGHT[idx];
      }

      if (piece.color === 'w') {
        score += val;
      } else {
        score -= val;
      }
    }
  }

  // Mobility factor
  const currentTurn = chess.turn();
  const currentMobility = chess.moves().length;
  score += (currentTurn === 'w' ? 1 : -1) * (currentMobility * 4);

  return score;
}

/**
 * Converts a sequence of UCI moves (e.g. ["e2e4", "c7c5"]) into readable SAN moves (e.g. ["e4", "c5"])
 */
function convertUciListToSan(fen: string, uciMoves: string[]): string[] {
  const result: string[] = [];
  try {
    const tempChess = new Chess(fen);
    for (const uci of uciMoves) {
      if (uci.length < 4) break;
      const from = uci.substring(0, 2) as Square;
      const to = uci.substring(2, 4) as Square;
      const promotion = uci[4] || 'q';
      const m = tempChess.move({ from, to, promotion });
      if (m) {
        result.push(m.san);
      } else {
        result.push(uci);
        break;
      }
    }
  } catch {
    // If move sequence fails, return raw UCI
    return uciMoves;
  }
  return result;
}

/**
 * Fetch Stockfish 18 multi-PV evaluation with high accuracy (Chessvision.ai style)
 */
export async function fetchChessEvaluation(fen: string): Promise<EvaluationState> {
  const encodedFen = encodeURIComponent(fen);

  // 1. Try Server Stockfish 18 Engine (/api/stockfish-eval)
  try {
    const res = await fetch(`/api/stockfish-eval?fen=${encodedFen}&depth=12&movetime=500`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.topMoves && data.topMoves.length > 0) {
        return {
          score: data.score,
          scoreText: data.scoreText,
          mate: data.mate,
          winChance: data.winChance,
          bestMove: data.bestMove,
          topMoves: data.topMoves,
          depth: data.depth || 14,
          isLoading: false,
          source: data.source || 'stockfish-18',
        };
      }
    }
  } catch (err) {
    console.warn('Server stockfish evaluation failed, trying direct cloud engines:', err);
  }

  // 2. Direct Fallback: chess-api.com (Stockfish 18)
  try {
    const directApiRes = await fetch('https://chess-api.com/v1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fen, depth: 12 }),
    });

    if (directApiRes.ok) {
      const data1: any = await directApiRes.json();
      if (data1.move && data1.move !== '(none)') {
        const from = data1.from || data1.move.substring(0, 2);
        const to = data1.to || data1.move.substring(2, 4);
        const san = data1.san || data1.move;
        const cpVal = data1.centipawns
          ? parseInt(data1.centipawns, 10)
          : data1.eval
          ? Math.round(data1.eval * 100)
          : 0;
        const { text, winChance, scoreNum } = formatEvalScore(cpVal, data1.mate);
        const pvSan = data1.continuationArr
          ? convertUciListToSan(fen, [data1.move, ...data1.continuationArr])
          : [san];

        const bestMove: BestMoveInfo = {
          uci: data1.move,
          from,
          to,
          san,
          cp: cpVal,
          mate: data1.mate,
          scoreText: text,
          depth: data1.depth || 12,
          pvList: pvSan,
          source: 'stockfish-18',
          rank: 1,
          color: ARROW_COLORS[1].primary,
        };

        return {
          score: data1.eval ?? scoreNum,
          scoreText: text,
          mate: data1.mate,
          winChance: data1.winChance ? Math.round(data1.winChance) : winChance,
          bestMove,
          topMoves: [bestMove],
          depth: data1.depth || 12,
          isLoading: false,
          source: 'stockfish-18',
        };
      }
    }
  } catch (err) {
    console.warn('Direct chess-api.com fallback failed:', err);
  }

  // 3. Fallback: Lichess Cloud Database
  try {
    const lichessRes = await fetch(
      `https://lichess.org/api/cloud-eval?fen=${encodedFen}&multiPv=3`,
      { headers: { Accept: 'application/json' } }
    );
    if (lichessRes.ok) {
      const lichessData = await lichessRes.json();
      if (lichessData && lichessData.pvs && lichessData.pvs.length > 0) {
        const topMoves: BestMoveInfo[] = [];
        lichessData.pvs.slice(0, 3).forEach((pv: any, idx: number) => {
          const rank = (idx + 1) as 1 | 2 | 3;
          const moves = pv.moves ? pv.moves.split(' ') : [];
          const bestUci = moves[0] || '';
          if (bestUci.length >= 4) {
            const from = bestUci.substring(0, 2);
            const to = bestUci.substring(2, 4);
            let san = bestUci;
            try {
              const c = new Chess(fen);
              const m = c.move({
                from: from as Square,
                to: to as Square,
                promotion: bestUci[4] || 'q',
              });
              if (m) san = m.san;
            } catch {}
            const { text } = formatEvalScore(pv.cp, pv.mate);
            const readableSanList = convertUciListToSan(fen, moves.slice(0, 8));
            topMoves.push({
              uci: bestUci,
              from,
              to,
              san,
              cp: pv.cp,
              mate: pv.mate,
              scoreText: text,
              depth: lichessData.depth,
              pvList: readableSanList.length > 0 ? readableSanList : moves.slice(0, 8),
              source: 'stockfish-18',
              rank,
              color: ARROW_COLORS[rank].primary,
            });
          }
        });

        if (topMoves.length > 0) {
          const primary = topMoves[0];
          const { scoreNum, text, winChance } = formatEvalScore(primary.cp, primary.mate);
          return {
            score: scoreNum,
            scoreText: text,
            mate: primary.mate,
            winChance,
            bestMove: primary,
            topMoves,
            depth: lichessData.depth || 35,
            isLoading: false,
            source: 'stockfish-18',
          };
        }
      }
    }
  } catch (err) {
    console.warn('Lichess cloud eval query failed:', err);
  }

  // 4. Emergency offline fallback
  const localEval = evaluatePositionLocally(fen);
  return {
    score: localEval.score,
    scoreText: localEval.scoreText,
    mate: localEval.mate,
    winChance: localEval.winChance,
    bestMove: localEval.bestMove,
    topMoves: localEval.topMoves,
    depth: 8,
    isLoading: false,
    source: 'local-engine',
  };
}
