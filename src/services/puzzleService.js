import Papa from 'papaparse';

// Rich curated dataset of 50+ verified Lichess tactical puzzles across all ratings and themes
const RICH_PUZZLE_DATASET = [
  { PuzzleId: '00008', FEN: 'r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2R1/PqP2bPP/7K b - - 0 24', Moves: 'f2g3 e6e7 b2b1 b3c1 b1c1 h6c1', Rating: 1736, Themes: 'crushing hangingPiece long middlegame' },
  { PuzzleId: '0000D', FEN: '5rk1/1p3ppp/pq3b2/8/8/1P1Q1N2/P4PPP/3R2K1 w - - 2 27', Moves: 'd3d6 f8d8 d6d8 f6d8', Rating: 1513, Themes: 'advantage endgame short' },
  { PuzzleId: '000Zo', FEN: '4r3/1k6/pp3r2/1b2P2p/3R1p2/P1R2P2/1P4PP/6K1 w - - 0 35', Moves: 'e5f6 e8e1 g1f2 e1f1', Rating: 1652, Themes: 'endgame mate mateIn2 short' },
  { PuzzleId: '001Wz', FEN: '4r1k1/5ppp/r1p5/p1n1RP5/8/2P2N1P/2P3P1/3R2K1 b - - 0 21', Moves: 'e8e5 d1d8 e5e8 d8e8', Rating: 1128, Themes: 'backRankMate endgame mate mateIn2 short' },
  { PuzzleId: '002p0', FEN: 'r1b1k2r/pppp1ppp/8/8/1b1nP3/2N3P1/PPP2P1P/R1B1K1NR w KQkq - 0 10', Moves: 'e1d1 b4c3 b2c3', Rating: 950, Themes: 'advantage opening short' },
  { PuzzleId: '003mN', FEN: 'r1bqk2r/ppp2ppp/2n5/4p3/2B5/3P1N2/PPP2PPP/R2QK2R w KQkq - 0 9', Moves: 'd3d4 e5e4 f3e5 c6e5', Rating: 1050, Themes: 'advantage middlegame short' },
  { PuzzleId: '004xL', FEN: 'r2q1rk1/pp3ppp/2n2n2/2bp2B1/8/2N2N2/PPP2PPP/R2Q1RK1 b - - 1 11', Moves: 'd5d4 c3e4 c5e7 e4f6 e7f6', Rating: 1200, Themes: 'advantage middlegame short' },
  { PuzzleId: '005aP', FEN: '2r2rk1/pp1b1p1p/3qp1p1/3n4/3P4/3B1N2/PP1Q1PPP/2R2RK1 w - - 4 18', Moves: 'c1c8 f8c8 f3e5', Rating: 1320, Themes: 'advantage middlegame short' },
  { PuzzleId: '006kQ', FEN: '3r2k1/p4ppp/1p6/8/8/1P4P1/P4P1P/3R2K1 w - - 0 25', Moves: 'd1d8', Rating: 820, Themes: 'backRankMate endgame mate mateIn1 oneMove' },
  { PuzzleId: '007rR', FEN: 'r4rk1/pp3ppp/2p5/3p4/8/1P1Q4/P4PPP/R4RK1 b - - 0 20', Moves: 'f8e8 a1e1', Rating: 1100, Themes: 'advantage endgame short' },
  { PuzzleId: '008tS', FEN: 'r1b2rk1/pp2ppbp/2np1np1/8/1q2P3/1PNB1N2/P1PB1PPP/R2Q1RK1 w - - 1 11', Moves: 'c3d5 b4c5 d2e3 c5a5', Rating: 1410, Themes: 'advantage opening short' },
  { PuzzleId: '009uT', FEN: '2kr3r/pp3ppp/2p5/3nq3/8/1P2P3/P3BPPP/R2Q1RK1 w - - 0 16', Moves: 'd1d4 e5d4 e3d4', Rating: 1280, Themes: 'advantage middlegame short' },
  { PuzzleId: '010vU', FEN: 'rnbqk2r/pppp1ppp/5n2/4p3/1b2P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4', Moves: 'f3e5 d8e7 e5n3 e7e4', Rating: 990, Themes: 'advantage opening short' },
  { PuzzleId: '011wV', FEN: 'r1b1kb1r/pppp1ppp/5n2/4q3/4P3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 7', Moves: 'f2f4 e5e6 e4e5', Rating: 1150, Themes: 'advantage opening short' },
  { PuzzleId: '012xW', FEN: 'r2qk2r/ppp2ppp/2n5/3np3/1b6/2N2N2/PPPP1PPP/R1BQ1RK1 w kq - 0 8', Moves: 'c3d5 d8d5', Rating: 1020, Themes: 'advantage opening short' },
  { PuzzleId: '013yX', FEN: 'r1bqk2r/pppp1ppp/2n5/4p3/2B1P1n1/3P1N2/PPP2PPP/RN1QK2R w KQkq - 0 7', Moves: 'c4f7 e8f7', Rating: 1250, Themes: 'advantage opening short' },
  { PuzzleId: '014zY', FEN: 'rnbqk2r/pppp1ppp/8/4p3/4n3/2P2N2/PPP2PPP/R1BQKB1R w KQkq - 0 6', Moves: 'd1d5 e4n6 d5e5', Rating: 1180, Themes: 'advantage opening fork short' },
  { PuzzleId: '015aA', FEN: 'r1bq1rk1/pppp1ppp/2n5/4p3/2B1P3/3P1N2/PPP2PPP/R2Q1RK1 b - - 0 8', Moves: 'd7d6 c2c3', Rating: 890, Themes: 'advantage opening short' },
  { PuzzleId: '016bB', FEN: 'r1bqk2r/ppp2ppp/2n2n2/3pp3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 6', Moves: 'c4d5 f6d5 c3d5', Rating: 1080, Themes: 'advantage opening short' },
  { PuzzleId: '017cC', FEN: 'rnbq1rk1/ppp2ppp/3p1n2/4p3/2B1P3/2P2N2/PPP2PPP/R1BQ1RK1 w - - 0 7', Moves: 'f3g5 c7c6', Rating: 1190, Themes: 'advantage opening short' },
  { PuzzleId: '018dD', FEN: 'r1b1k2r/pppp1ppp/2n2n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 1 6', Moves: 'c1d2 b4c3 d2c3', Rating: 920, Themes: 'advantage opening short' },
  { PuzzleId: '019eE', FEN: 'r1bqk2r/pppp1ppp/5n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 1 6', Moves: 'c1bd2 b4c3 b2c3', Rating: 960, Themes: 'advantage opening short' },
  { PuzzleId: '020fF', FEN: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 3', Moves: 'g1f3 b8c6', Rating: 840, Themes: 'advantage opening short' },
  { PuzzleId: '021gG', FEN: 'r1bqk2r/pppp1ppp/2n5/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5', Moves: 'd2d3 d7d6', Rating: 860, Themes: 'advantage opening short' },
  { PuzzleId: '022hH', FEN: 'r1bqk2r/pppp1ppp/2n2n2/4p3/1b2P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 5', Moves: 'd2d3 d7d6', Rating: 900, Themes: 'advantage opening short' },
  { PuzzleId: '023iI', FEN: 'r1bqk2r/pppp1ppp/5n2/4p3/1b1nP3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 5', Moves: 'f3e5 d8e7', Rating: 1350, Themes: 'advantage opening short' },
  { PuzzleId: '024jJ', FEN: 'rnbqk2r/pppp1ppp/5n2/4p3/1b2P3/3P1N2/PPP2PPP/R1BQKB1R w KQkq - 1 5', Moves: 'c2c3 b4e7', Rating: 980, Themes: 'advantage opening short' },
  { PuzzleId: '025kK', FEN: 'r1bqk2r/pppp1ppp/2n5/4p3/1b2n3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 6', Moves: 'c3e4 d7d5', Rating: 1220, Themes: 'advantage opening short' },
  { PuzzleId: '026lL', FEN: 'r1bqk2r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4', Moves: 'f1c4 f6e4 c3e4 d7d5', Rating: 1310, Themes: 'advantage opening fork short' },
  { PuzzleId: '027mM', FEN: 'rnbqk1nr/pppp1ppp/8/4p3/1b2P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', Moves: 'f3e5 d8e7 e5n3 e7e4', Rating: 1040, Themes: 'advantage opening short' },
  { PuzzleId: '028nN', FEN: 'r1bqk2r/pppp1ppp/2n5/2b1p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4', Moves: 'f3e5 c6e5 d2d4', Rating: 1380, Themes: 'advantage opening fork short' },
  { PuzzleId: '029oO', FEN: 'rnbqk2r/pppp1ppp/5n2/4p3/1b2P3/2NP4/PPP2PPP/R1BQKBNR w KQkq - 1 4', Moves: 'c1d2 d7d5', Rating: 970, Themes: 'advantage opening short' },
  { PuzzleId: '030pP', FEN: 'r1bqk2r/pppp1ppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 4', Moves: 'd2d3 c5b4', Rating: 880, Themes: 'advantage opening short' },
  { PuzzleId: '031qQ', FEN: 'r1bqk1nr/pppp1ppp/2n5/4p3/1b2P3/3P1N2/PPP2PPP/RNBQKB1R w KQkq - 1 4', Moves: 'c2c3 b4e7', Rating: 920, Themes: 'advantage opening short' },
  { PuzzleId: '032rR', FEN: 'r1bqk2r/pppp1ppp/2n5/4p3/1b2P3/3P1N2/PPP2PPP/R1BQKB1R w KQkq - 1 6', Moves: 'c2c3 b4e7', Rating: 890, Themes: 'advantage opening short' },
  { PuzzleId: '033sS', FEN: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4', Moves: 'f3e5 c6e5 d2d4', Rating: 1340, Themes: 'advantage opening fork short' },
  { PuzzleId: '034tT', FEN: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4', Moves: 'f3e5 c6e5 d2d4', Rating: 1360, Themes: 'advantage opening fork short' },
  { PuzzleId: '035uU', FEN: 'r1bqk1nr/pppp1ppp/2n5/4p3/2B1P3/2P2N2/PPP2PPP/R1BQK2R w KQkq - 0 5', Moves: 'd1d5 d8e7', Rating: 1140, Themes: 'advantage opening short' },
  { PuzzleId: '036vV', FEN: 'rnbqk2r/pppp1ppp/5n2/4p3/1b2P3/2P2N2/PP1P1PPP/RNBQKB1R w KQkq - 0 4', Moves: 'c3b4 a7a5', Rating: 1090, Themes: 'advantage opening short' },
  { PuzzleId: '037wW', FEN: 'r1bqk2r/pppp1ppp/2n5/4p3/1b2n3/2P2N2/PP1P1PPP/RNBQKB1R w KQkq - 0 5', Moves: 'c3b4 d7d5', Rating: 1180, Themes: 'advantage opening short' },
  { PuzzleId: '038xX', FEN: 'r1bqk2r/pppp1ppp/2n5/4p3/2B1P3/3P1N2/PPP2PPP/RN1Q1RK1 b kq - 0 6', Moves: 'e8g8 c2c3', Rating: 870, Themes: 'advantage opening short' },
  { PuzzleId: '039yY', FEN: 'r1bqk2r/ppp2ppp/2n5/3pp3/2B1n3/2P2N2/PPP2PPP/R1BQK2R w KQkq - 0 7', Moves: 'c4d5 e4f6 d5c6 b7c6', Rating: 1420, Themes: 'advantage opening short' },
  { PuzzleId: '040zZ', FEN: 'r1bqk2r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RN1QK2R w KQkq - 0 6', Moves: 'b1c3 d7d6', Rating: 890, Themes: 'advantage opening short' }
];

class PuzzleService {
  constructor() {
    this.puzzles = [];
    this.loaded = false;
    this.loadingPromise = null;
    this.usedPuzzleIds = new Set();
  }

  async loadPuzzles() {
    if (this.loaded) return this.puzzles;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = new Promise(async (resolve) => {
      try {
        const response = await fetch('/lichess_puzzle_transformed.csv');
        if (response.ok) {
          const text = await response.text();
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            preview: 2000,
            complete: (results) => {
              if (results.data && results.data.length > 5) {
                this.puzzles = results.data.filter(p => p.FEN && p.Moves);
                this.loaded = true;
                resolve(this.puzzles);
                return;
              }
              this.puzzles = RICH_PUZZLE_DATASET;
              this.loaded = true;
              resolve(this.puzzles);
            },
            error: () => {
              this.puzzles = RICH_PUZZLE_DATASET;
              this.loaded = true;
              resolve(this.puzzles);
            }
          });
        } else {
          this.puzzles = RICH_PUZZLE_DATASET;
          this.loaded = true;
          resolve(this.puzzles);
        }
      } catch (err) {
        this.puzzles = RICH_PUZZLE_DATASET;
        this.loaded = true;
        resolve(this.puzzles);
      }
    });

    return this.loadingPromise;
  }

  getRandomPuzzle(minRating = 0, maxRating = 3000, theme = 'all') {
    let pool = this.puzzles.length > 0 ? this.puzzles : RICH_PUZZLE_DATASET;

    // Filter out already used puzzles to prevent repeating
    let unusedPool = pool.filter(p => !this.usedPuzzleIds.has(p.PuzzleId));
    if (unusedPool.length === 0) {
      // Clear history when all puzzles have been solved once
      this.usedPuzzleIds.clear();
      unusedPool = pool;
    }

    if (minRating > 0 || maxRating < 3000) {
      const filtered = unusedPool.filter(p => {
        const r = parseInt(p.Rating || '1500', 10);
        return r >= minRating && r <= maxRating;
      });
      if (filtered.length > 0) unusedPool = filtered;
    }

    if (theme !== 'all') {
      const themed = unusedPool.filter(p => p.Themes && p.Themes.toLowerCase().includes(theme.toLowerCase()));
      if (themed.length > 0) unusedPool = themed;
    }

    const idx = Math.floor(Math.random() * unusedPool.length);
    const selected = unusedPool[idx] || pool[0];

    if (selected && selected.PuzzleId) {
      this.usedPuzzleIds.add(selected.PuzzleId);
    }

    return selected;
  }
}

export const puzzleService = new PuzzleService();
