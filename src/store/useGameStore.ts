import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, GameStats, initialGameState, AiModel, BoardTheme, TimeControl, Achievement, Puzzle } from '../types';

interface GameStore {
  gameState: GameState;
  gameMode: 'pvp' | 'pve';
  aiDifficulty: number; // 1-5
  aiModel: AiModel;
  boardTheme: BoardTheme;
  showLegalMoves: boolean;
  soundEnabled: boolean;
  stats: GameStats;
  achievements: Achievement[];
  currentPuzzle: Puzzle | null;
  timeControl: TimeControl;
  whiteTime: number;
  blackTime: number;
  isTimerActive: boolean;
  
  // Actions
  setGameState: (state: Partial<GameState>) => void;
  setGameMode: (mode: 'pvp' | 'pve') => void;
  setAiDifficulty: (difficulty: number) => void;
  setAiModel: (model: AiModel) => void;
  setBoardTheme: (theme: BoardTheme) => void;
  toggleShowLegalMoves: () => void;
  toggleSound: () => void;
  updateStats: (result: 'win' | 'loss' | 'draw') => void;
  unlockAchievement: (id: string) => void;
  loadPuzzle: (puzzle: Puzzle) => void;
  setTimeControl: (control: TimeControl) => void;
  updateTime: (color: 'w' | 'b', time: number) => void;
  resetTimer: () => void;
  startTimer: () => void;
  stopTimer: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      gameState: initialGameState,
      gameMode: 'pve',
      aiDifficulty: 3,
      aiModel: 'minimax',
      boardTheme: 'classic',
      showLegalMoves: true,
      soundEnabled: true,
      stats: {
        wins: 0,
        losses: 0,
        draws: 0,
        puzzlesSolved: 0,
        rating: 1200,
      },
      achievements: [
        {
          id: 'first_win',
          title: 'First Victory',
          description: 'Win your first game against AI',
          icon: 'trophy',
          unlocked: false,
          progress: 0,
          maxProgress: 1,
        },
        {
          id: 'puzzle_master',
          title: 'Puzzle Master',
          description: 'Solve 10 puzzles',
          icon: 'brain',
          unlocked: false,
          progress: 0,
          maxProgress: 10,
        },
      ],
      currentPuzzle: null,
      timeControl: { initial: 600, increment: 0 }, // 10 minutes
      whiteTime: 600,
      blackTime: 600,
      isTimerActive: false,

      setGameState: (newState) =>
        set((state) => ({ gameState: { ...state.gameState, ...newState } })),
      setGameMode: (mode) => set({ gameMode: mode }),
      setAiDifficulty: (difficulty) => set({ aiDifficulty: difficulty }),
      setAiModel: (model) => set({ aiModel: model }),
      setBoardTheme: (theme) => set({ boardTheme: theme }),
      toggleShowLegalMoves: () =>
        set((state) => ({ showLegalMoves: !state.showLegalMoves })),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      updateStats: (result) =>
        set((state) => {
          const newStats = { ...state.stats };
          if (result === 'win') newStats.wins++;
          if (result === 'loss') newStats.losses++;
          if (result === 'draw') newStats.draws++;
          return { stats: newStats };
        }),
      unlockAchievement: (id) =>
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === id ? { ...a, unlocked: true, progress: a.maxProgress } : a
          ),
        })),
      loadPuzzle: (puzzle) => set({ currentPuzzle: puzzle }),
      setTimeControl: (control) =>
        set({
          timeControl: control,
          whiteTime: control.initial,
          blackTime: control.initial,
        }),
      updateTime: (color, time) =>
        set((state) => ({
          whiteTime: color === 'w' ? time : state.whiteTime,
          blackTime: color === 'b' ? time : state.blackTime,
        })),
      resetTimer: () =>
        set((state) => ({
          whiteTime: state.timeControl.initial,
          blackTime: state.timeControl.initial,
          isTimerActive: false,
        })),
      startTimer: () => set({ isTimerActive: true }),
      stopTimer: () => set({ isTimerActive: false }),
    }),
    {
      name: 'chess-game-storage',
      partialize: (state) => ({
        gameMode: state.gameMode,
        aiDifficulty: state.aiDifficulty,
        aiModel: state.aiModel,
        boardTheme: state.boardTheme,
        showLegalMoves: state.showLegalMoves,
        soundEnabled: state.soundEnabled,
        stats: state.stats,
        achievements: state.achievements,
      }),
    }
  )
);
