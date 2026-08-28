// Utility to calculate captured pieces and material advantage difference

const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9 };

export function calculateMaterial(chessInstance) {
  const initialCounts = { p: 8, n: 2, b: 2, r: 2, q: 1 };

  const currentWhite = { p: 0, n: 0, b: 0, r: 0, q: 0 };
  const currentBlack = { p: 0, n: 0, b: 0, r: 0, q: 0 };

  const board = chessInstance.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type !== 'k') {
        if (piece.color === 'w') {
          currentWhite[piece.type]++;
        } else {
          currentBlack[piece.type]++;
        }
      }
    }
  }

  // Captured pieces by White (i.e. missing Black pieces)
  const capturedBlackPieces = [];
  ['p', 'b', 'n', 'r', 'q'].forEach((type) => {
    const missing = initialCounts[type] - currentBlack[type];
    for (let i = 0; i < missing; i++) {
      capturedBlackPieces.push(type);
    }
  });

  // Captured pieces by Black (i.e. missing White pieces)
  const capturedWhitePieces = [];
  ['p', 'b', 'n', 'r', 'q'].forEach((type) => {
    const missing = initialCounts[type] - currentWhite[type];
    for (let i = 0; i < missing; i++) {
      capturedWhitePieces.push(type);
    }
  });

  // Calculate material sum
  const whiteVal =
    currentWhite.p * 1 + currentWhite.n * 3 + currentWhite.b * 3 + currentWhite.r * 5 + currentWhite.q * 9;
  const blackVal =
    currentBlack.p * 1 + currentBlack.n * 3 + currentBlack.b * 3 + currentBlack.r * 5 + currentBlack.q * 9;

  const diff = whiteVal - blackVal;

  return {
    whiteScore: diff > 0 ? diff : 0,
    blackScore: diff < 0 ? Math.abs(diff) : 0,
    capturedByWhite: capturedBlackPieces,
    capturedByBlack: capturedWhitePieces
  };
}
