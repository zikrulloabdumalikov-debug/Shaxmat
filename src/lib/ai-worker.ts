/**
 * Chess AI Engine using Minimax with Alpha-Beta Pruning
 */

import { Chess, Move } from 'chess.js';

// Piece values for evaluation
const PIECE_VALUES: Record<string, number> = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900,
};

// Simplified Piece-Square Tables for better positioning
const PAWN_PST = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_PST = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

/**
 * Evaluates the current board position
 */
function evaluateBoard(game: Chess): number {
  let totalEvaluation = 0;
  const board = game.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        let value = PIECE_VALUES[piece.type] || 0;
        
        // Add positional bonus
        if (piece.type === 'p') value += PAWN_PST[piece.color === 'w' ? i : 7 - i][j];
        if (piece.type === 'n') value += KNIGHT_PST[piece.color === 'w' ? i : 7 - i][j];

        totalEvaluation += piece.color === 'w' ? value : -value;
      }
    }
  }
  return totalEvaluation;
}

/**
 * Minimax algorithm with Alpha-Beta pruning
 */
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean
): number {
  if (depth === 0) {
    return -evaluateBoard(game);
  }

  const moves = game.moves();

  if (isMaximizingPlayer) {
    let bestEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer);
      game.undo();
      bestEval = Math.max(bestEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return bestEval;
  } else {
    let bestEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer);
      game.undo();
      bestEval = Math.min(bestEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return bestEval;
  }
}

/**
 * Finds the best move for the current player
 */
export function getBestMove(game: Chess, depth: number = 3): string | null {
  const moves = game.moves();
  if (moves.length === 0) return null;

  let bestMove = null;
  let bestValue = -Infinity;

  // Shuffle moves to add variety
  const shuffledMoves = moves.sort(() => Math.random() - 0.5);

  for (const move of shuffledMoves) {
    game.move(move);
    const boardValue = minimax(game, depth - 1, -Infinity, Infinity, false);
    game.undo();

    if (boardValue > bestValue) {
      bestValue = boardValue;
      bestMove = move;
    }
  }

  return bestMove;
}

// Web Worker interface
if (typeof self !== 'undefined') {
  self.onmessage = (e: MessageEvent) => {
    const { fen, depth } = e.data;
    const game = new Chess(fen);
    const move = getBestMove(game, depth);
    self.postMessage({ move });
  };
}
