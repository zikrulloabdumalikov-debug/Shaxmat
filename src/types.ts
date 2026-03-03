import { Chess } from 'chess.js';

export type GameStatus = 'playing' | 'checkmate' | 'draw' | 'stalemate' | 'threefold' | 'insufficient';

export interface GameState {
  fen: string;
  turn: 'w' | 'b';
  isCheck: boolean;
  history: string[];
  status: GameStatus;
  lastMove: { from: string; to: string } | null;
}

export const initialGameState: GameState = {
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  turn: 'w',
  isCheck: false,
  history: [],
  status: 'playing',
  lastMove: null,
};

export function getGameStatus(game: Chess): GameStatus {
  if (game.isCheckmate()) return 'checkmate';
  if (game.isStalemate()) return 'stalemate';
  if (game.isThreefoldRepetition()) return 'threefold';
  if (game.isInsufficientMaterial()) return 'insufficient';
  if (game.isDraw()) return 'draw';
  return 'playing';
}
