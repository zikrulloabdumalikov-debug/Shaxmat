import { Chess } from 'chess.js';

export type GameStatus = 'playing' | 'checkmate' | 'draw' | 'stalemate' | 'threefold' | 'insufficient' | 'paused';

export type AiModel = 'minimax' | 'gemini';

export type BoardTheme = 'classic' | 'wood' | 'dark';

export type TimeControl = {
  initial: number; // seconds
  increment: number; // seconds
  label: string;
};

export const TIME_CONTROLS: Record<string, TimeControl> = {
  bullet: { initial: 60, increment: 0, label: '1m' },
  blitz: { initial: 180, increment: 2, label: '3m+2s' },
  rapid: { initial: 600, increment: 5, label: '10m+5s' },
  classical: { initial: 1800, increment: 10, label: '30m+10s' },
};

export interface Puzzle {
  id: string;
  fen: string;
  solution: string[]; // Array of moves in SAN
  rating: number;
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
  progress: number;
  maxProgress: number;
}

export interface GameStats {
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  rating: number;
  ratingHistory: number[];
  fastestMate: number | null;
  longestGame: number;
  totalMoves: number;
  aiStats: {
    minimax: { wins: number; losses: number; draws: number };
    gemini: { wins: number; losses: number; draws: number };
  };
  achievements: Achievement[];
}

export interface GameState {
  fen: string;
  turn: 'w' | 'b';
  isCheck: boolean;
  history: string[];
  status: GameStatus;
  lastMove: { from: string; to: string } | null;
  aiModel: AiModel;
  redoStack: string[];
  pendingPromotion: { from: string; to: string } | null;
  evaluation: number;
  theme: BoardTheme;
  // Timer state
  timer: {
    w: number;
    b: number;
    lastTick: number | null;
    isActive: boolean;
    config: TimeControl;
  };
  // Puzzle state
  activePuzzle: Puzzle | null;
  puzzleProgress: number; // index of move in solution
}

export const initialGameState: GameState = {
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  turn: 'w',
  isCheck: false,
  history: [],
  status: 'playing',
  lastMove: null,
  aiModel: 'minimax',
  redoStack: [],
  pendingPromotion: null,
  evaluation: 0,
  theme: 'classic',
  timer: {
    w: 600,
    b: 600,
    lastTick: null,
    isActive: false,
    config: TIME_CONTROLS.rapid,
  },
  activePuzzle: null,
  puzzleProgress: 0,
};

export function getGameStatus(game: Chess): GameStatus {
  if (game.isCheckmate()) return 'checkmate';
  if (game.isStalemate()) return 'stalemate';
  if (game.isThreefoldRepetition()) return 'threefold';
  if (game.isInsufficientMaterial()) return 'insufficient';
  if (game.isDraw()) return 'draw';
  return 'playing';
}
