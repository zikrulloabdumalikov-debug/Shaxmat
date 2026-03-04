/**
 * Simple Zobrist Hashing implementation for chess positions.
 * This is used for position hashing as requested in the technical specs.
 */

// Random 64-bit numbers for each piece on each square
// 12 pieces (6 white, 6 black) * 64 squares
const zobristTable: bigint[][] = Array.from({ length: 64 }, () => 
  Array.from({ length: 12 }, () => BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) << 32n | BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)))
);

const sideToMove: bigint = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) << 32n | BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));

const pieceToIndex: Record<string, number> = {
  'wP': 0, 'wN': 1, 'wB': 2, 'wR': 3, 'wQ': 4, 'wK': 5,
  'bP': 6, 'bN': 7, 'bB': 8, 'bR': 9, 'bQ': 10, 'bK': 11
};

export function calculateZobristHash(board: any[][], turn: 'w' | 'b'): string {
  let hash = 0n;

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const squareIndex = i * 8 + j;
        const pieceIndex = pieceToIndex[`${piece.color}${piece.type.toUpperCase()}`];
        hash ^= zobristTable[squareIndex][pieceIndex];
      }
    }
  }

  if (turn === 'b') {
    hash ^= sideToMove;
  }

  return hash.toString(16);
}
