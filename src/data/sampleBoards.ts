import { SampleBoard } from '../types';

export const SAMPLE_BOARDS: SampleBoard[] = [
  {
    name: "Chessvision.ai (1.d4 Nf6)",
    description: "Exact position from your screenshot with 2.c4, 2.e3 suggestions and +0.5 evaluation",
    fen: "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2",
  },
  {
    name: "Saragossa Opening (Endgame)",
    description: "Previous screenshot position with Kg7-g8 and 3-line engine analysis",
    fen: "2b5/p5k1/1p2pr2/3p4/P2P1P2/2PB3R/1P5P/6K1 b - - 0 43",
  },
  {
    name: "Kasparov vs. Topalov (1999)",
    description: "The 'Immortal Game' with Kasparov's legendary rook sacrifice on d4",
    fen: "b2r3r/k4p1p/p2q1np1/NppP4/3p1Q2/P4PPB/1PP4P/1K1RR3 w - - 0 25",
  },
  {
    name: "Morphy's Opera Game (1858)",
    description: "Paul Morphy's famous tactical checkmate against Duke Karl and Count Isouard",
    fen: "4kb1r/p2n1ppp/4q3/4p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 1 17",
  },
  {
    name: "Fisher vs. Spassky (Game 6, 1972)",
    description: "Bobby Fischer's Queen's Gambit masterpiece in Reykjavik",
    fen: "1r4k1/1b1n1pp1/p2pp2p/8/2PPq3/4PN2/1Q3PPP/R4RK1 b - - 0 23",
  },
  {
    name: "Tactical Mate in 2 Puzzle",
    description: "White to move and find a decisive checkmate sequence",
    fen: "r1b2rk1/pp1p1ppp/2n5/1B1Q4/1b6/5N2/PPP2PPP/R1B2RK1 w - - 1 12",
  },
  {
    name: "Standard Starting Position",
    description: "Initial tournament chess board setup",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  }
];
