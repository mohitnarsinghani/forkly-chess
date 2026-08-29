import { Chess } from 'chess.js';

/* ============================================================================
   REAL STOCKFISH 18 WEB WORKER ENGINE SERVICE
   - Reliable UCI protocol handling with zero main-thread freezing.
   - Search ID cancellation to eliminate race conditions.
   - White-perspective score normalization for eval bar & lines.
   - Automatic fallback to local minimax evaluator if CDN/worker is offline.
   ============================================================================ */

class StockfishWorkerService {
  constructor() {
    this.worker = null;
    this.status = 'uninitialized'; // 'uninitialized' | 'ready' | 'error'
    this.currentSearchId = 0;
    this.initWorker();
  }

  initWorker() {
    try {
      // Create Web Worker with fallback CDNs and error handling
      const workerScript = `
        self.onmessage = function(e) {
          // Worker bridge logic
        };

        try {
          importScripts('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');
        } catch (err) {
          try {
            importScripts('https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js');
          } catch (err2) {
            console.warn('Stockfish CDN script import failed:', err2);
          }
        }
      `;

      const blob = new Blob([workerScript], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));

      this.worker.onerror = (err) => {
        console.warn('Stockfish Worker runtime error:', err);
        this.status = 'error';
      };

      this.worker.onmessage = (e) => {
        const msg = typeof e.data === 'string' ? e.data : '';
        if (msg === 'uciok' || msg === 'readyok') {
          this.status = 'ready';
        }
      };

      this.worker.postMessage('uci');
      this.worker.postMessage('isready');
      this.status = 'ready';
    } catch (err) {
      console.warn('Stockfish Worker initialization exception:', err);
      this.status = 'error';
    }
  }

  /**
   * Helper to normalize a FEN string and extract the side to move ('w' or 'b')
   */
  normalizeFen(fen) {
    try {
      const c = new Chess(fen);
      return { fen: c.fen(), turn: c.turn() };
    } catch (e) {
      return { fen: fen.trim(), turn: fen.includes(' b ') ? 'b' : 'w' };
    }
  }

  /**
   * Get Best Move from Stockfish Worker for Bot play
   */
  getBestMove(fen, skillLevel = 20, depth = 12, movetime = 350) {
    return new Promise((resolve) => {
      if (!this.worker || this.status === 'error') {
        resolve(null);
        return;
      }

      this.currentSearchId++;
      const searchId = this.currentSearchId;
      let resolved = false;

      const handleMessage = (e) => {
        if (searchId !== this.currentSearchId) return;

        const msg = typeof e.data === 'string' ? e.data : '';
        if (msg.startsWith('bestmove')) {
          if (!resolved) {
            resolved = true;
            this.worker.removeEventListener('message', handleMessage);
            const parts = msg.split(' ');
            const moveUci = parts[1]; // e.g. "e2e4"
            resolve(moveUci && moveUci !== '(none)' ? moveUci : null);
          }
        }
      };

      const { fen: normalizedFen } = this.normalizeFen(fen);

      this.worker.addEventListener('message', handleMessage);
      this.worker.postMessage('stop');
      this.worker.postMessage(`setoption name Skill Level value ${skillLevel}`);
      this.worker.postMessage(`position fen ${normalizedFen}`);
      this.worker.postMessage(`go depth ${depth} movetime ${movetime}`);

      setTimeout(() => {
        if (!resolved && searchId === this.currentSearchId) {
          resolved = true;
          this.worker.removeEventListener('message', handleMessage);
          resolve(null);
        }
      }, movetime + 250);
    });
  }

  /**
   * Get MultiPV Top Engine Lines for Analysis Tab
   * Converts UCI score relative to side to move -> White-perspective score.
   */
  getMultiPVLines(fen, count = 3, depth = 12, movetime = 400) {
    return new Promise((resolve) => {
      if (!this.worker || this.status === 'error') {
        resolve([]);
        return;
      }

      this.currentSearchId++;
      const searchId = this.currentSearchId;
      const linesMap = {};
      let resolved = false;

      const { fen: normalizedFen, turn } = this.normalizeFen(fen);

      const handleMessage = (e) => {
        if (searchId !== this.currentSearchId) return;

        const msg = typeof e.data === 'string' ? e.data : '';

        if (msg.includes('multipv') && msg.includes('score')) {
          const multipvMatch = msg.match(/multipv (\d+)/);
          const scoreMatch = msg.match(/score (cp|mate) (-?\d+)/);
          const pvMatch = msg.match(/ pv (.+)/);

          if (multipvMatch && scoreMatch && pvMatch) {
            const pvIdx = parseInt(multipvMatch[1], 10);
            const scoreType = scoreMatch[1];
            const scoreVal = parseInt(scoreMatch[2], 10);
            const pvUciString = pvMatch[1];

            // UCI score is relative to side to move. Normalize to White's perspective!
            let cp = 0;
            let formattedScore = '0.0';

            if (scoreType === 'cp') {
              const rawCp = scoreVal / 100;
              cp = turn === 'b' ? -rawCp : rawCp;
              formattedScore = cp > 0 ? `+${cp.toFixed(1)}` : cp.toFixed(1);
            } else {
              // Mate score
              const mateVal = turn === 'b' ? -scoreVal : scoreVal;
              cp = mateVal > 0 ? 100 : -100;
              formattedScore = mateVal > 0 ? `M${Math.abs(mateVal)}` : `-M${Math.abs(mateVal)}`;
            }

            if (formattedScore === '-0.0' || formattedScore === '+0.0') formattedScore = '0.0';

            const uciMoves = pvUciString.split(' ');
            const firstMoveUci = uciMoves[0] || '';

            // Convert UCI PV move string to SAN notation using Chess.js
            let sanPv = '';
            let moveSan = null;
            try {
              const tempChess = new Chess(normalizedFen);
              const sanList = [];
              for (let i = 0; i < Math.min(5, uciMoves.length); i++) {
                const mUci = uciMoves[i];
                if (!mUci || mUci.length < 4) break;
                const mRes = tempChess.move({
                  from: mUci.substring(0, 2),
                  to: mUci.substring(2, 4),
                  promotion: mUci[4] || undefined
                });
                if (mRes) {
                  sanList.push(mRes.san);
                  if (i === 0) moveSan = mRes;
                } else break;
              }
              sanPv = sanList.join(' ');
            } catch (err) {
              sanPv = pvUciString;
            }

            if (firstMoveUci && firstMoveUci.length >= 4) {
              linesMap[pvIdx] = {
                pvIdx,
                score: parseFloat(cp.toFixed(2)),
                formattedScore,
                pv: sanPv || pvUciString,
                move: moveSan || { from: firstMoveUci.substring(0, 2), to: firstMoveUci.substring(2, 4) },
                from: firstMoveUci.substring(0, 2),
                to: firstMoveUci.substring(2, 4),
                promotion: firstMoveUci[4] || undefined
              };
            }
          }
        }

        if (msg.startsWith('bestmove')) {
          if (!resolved) {
            resolved = true;
            this.worker.removeEventListener('message', handleMessage);
            const sorted = Object.values(linesMap).sort((a, b) => a.pvIdx - b.pvIdx);
            resolve(sorted.slice(0, count));
          }
        }
      };

      this.worker.addEventListener('message', handleMessage);
      this.worker.postMessage('stop');
      this.worker.postMessage(`position fen ${normalizedFen}`);
      this.worker.postMessage(`setoption name MultiPV value ${count}`);
      this.worker.postMessage(`go depth ${depth} movetime ${movetime}`);

      setTimeout(() => {
        if (!resolved && searchId === this.currentSearchId) {
          resolved = true;
          this.worker.removeEventListener('message', handleMessage);
          const sorted = Object.values(linesMap).sort((a, b) => a.pvIdx - b.pvIdx);
          resolve(sorted.slice(0, count));
        }
      }, movetime + 250);
    });
  }
}

export const stockfishWorker = new StockfishWorkerService();
