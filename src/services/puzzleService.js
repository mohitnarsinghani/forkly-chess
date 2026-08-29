import Papa from 'papaparse';

// Fallback curated high quality puzzles in case CSV is loading or offline
const FALLBACK_PUZZLES = [
  {
    PuzzleId: '00008',
    FEN: 'r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2R1/PqP2bPP/7K b - - 0 24',
    Moves: 'f2g3 e6e7 b2b1 b3c1 b1c1 h6c1',
    Rating: 1736,
    Themes: 'crushing hangingPiece long middlegame',
    GameUrl: 'https://lichess.org/787zsVup/black#48'
  },
  {
    PuzzleId: '0000D',
    FEN: '5rk1/1p3ppp/pq3b2/8/8/1P1Q1N2/P4PPP/3R2K1 w - - 2 27',
    Moves: 'd3d6 f8d8 d6d8 f6d8',
    Rating: 1513,
    Themes: 'advantage endgame short',
    GameUrl: 'https://lichess.org/F8M8OS71#53'
  },
  {
    PuzzleId: '000Zo',
    FEN: '4r3/1k6/pp3r2/1b2P2p/3R1p2/P1R2P2/1P4PP/6K1 w - - 0 35',
    Moves: 'e5f6 e8e1 g1f2 e1f1',
    Rating: 1652,
    Themes: 'endgame mate mateIn2 short',
    GameUrl: 'https://lichess.org/n8Ff742v#69'
  },
  {
    PuzzleId: '001Wz',
    FEN: '4r1k1/5ppp/r1p5/p1n1RP5/8/2P2N1P/2P3P1/3R2K1 b - - 0 21',
    Moves: 'e8e5 d1d8 e8e8 d8e8',
    Rating: 1128,
    Themes: 'backRankMate endgame mate mateIn2 short',
    GameUrl: 'https://lichess.org/84RH3LaP/black#42'
  }
];

class PuzzleService {
  constructor() {
    this.puzzles = [];
    this.loaded = false;
    this.loadingPromise = null;
  }

  async loadPuzzles() {
    if (this.loaded) return this.puzzles;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = new Promise(async (resolve) => {
      try {
        const response = await fetch('/lichess_puzzle_transformed.csv');
        if (!response.ok) {
          throw new Error('CSV fetch failed');
        }
        const text = await response.text();

        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          preview: 2000, // Load first 2000 puzzles for fast initial load
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              this.puzzles = results.data.filter(p => p.FEN && p.Moves);
              this.loaded = true;
              resolve(this.puzzles);
            } else {
              this.puzzles = FALLBACK_PUZZLES;
              this.loaded = true;
              resolve(this.puzzles);
            }
          },
          error: () => {
            this.puzzles = FALLBACK_PUZZLES;
            this.loaded = true;
            resolve(this.puzzles);
          }
        });
      } catch (err) {
        console.warn('Using fallback puzzles:', err);
        this.puzzles = FALLBACK_PUZZLES;
        this.loaded = true;
        resolve(this.puzzles);
      }
    });

    return this.loadingPromise;
  }

  getRandomPuzzle(minRating = 0, maxRating = 3000, theme = 'all') {
    let pool = this.puzzles.length > 0 ? this.puzzles : FALLBACK_PUZZLES;

    if (minRating > 0 || maxRating < 3000) {
      const filtered = pool.filter(p => {
        const r = parseInt(p.Rating || '1500', 10);
        return r >= minRating && r <= maxRating;
      });
      if (filtered.length > 0) pool = filtered;
    }

    if (theme !== 'all') {
      const themed = pool.filter(p => p.Themes && p.Themes.toLowerCase().includes(theme.toLowerCase()));
      if (themed.length > 0) pool = themed;
    }

    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  }
}

export const puzzleService = new PuzzleService();
