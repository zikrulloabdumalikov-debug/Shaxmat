import { Chess } from 'chess.js';

export type GameStatus = 'idle' | 'playing' | 'checkmate' | 'draw' | 'stalemate' | 'insufficient_material' | 'threefold_repetition';

export type PlayerType = 'human' | 'ai';
export type PieceColor = 'w' | 'b';

export interface GameStats {
  wins: number;
  losses: number;
  draws: number;
  puzzlesSolved: number;
  rating: number;
}

export interface Puzzle {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  theme: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export type AiModel = 'minimax' | 'gemini-3-flash-preview';

export type BoardTheme = 'classic' | 'wood' | 'glass' | 'neon';

export interface TimeControl {
  initial: number; // in seconds
  increment: number; // in seconds
}

export interface GameState {
  fen: string;
  turn: PieceColor;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isStalemate: boolean;
  isInsufficientMaterial: boolean;
  isThreefoldRepetition: boolean;
  history: string[];
  capturedPieces: { w: string[]; b: string[] };
  moveHistory: { from: string; to: string; san: string }[];
  status: GameStatus;
  winner: PieceColor | null;
}

export const initialGameState: GameState = {
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  turn: 'w',
  isCheck: false,
  isCheckmate: false,
  isDraw: false,
  isStalemate: false,
  isInsufficientMaterial: false,
  isThreefoldRepetition: false,
  history: [],
  capturedPieces: { w: [], b: [] },
  moveHistory: [],
  status: 'idle',
  winner: null,
};

export const getGameStatus = (chess: Chess): GameStatus => {
  if (chess.isCheckmate()) return 'checkmate';
  if (chess.isDraw()) return 'draw';
  if (chess.isStalemate()) return 'stalemate';
  if (chess.isInsufficientMaterial()) return 'insufficient_material';
  if (chess.isThreefoldRepetition()) return 'threefold_repetition';
  return 'playing';
};
