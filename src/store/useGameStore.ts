import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Chess } from 'chess.js';
import { GameState, initialGameState, getGameStatus, AiModel, BoardTheme, TimeControl, TIME_CONTROLS, Puzzle, GameStats } from '../types';
import { calculateZobristHash } from '../lib/zobrist';

interface AppState {
  // Game State
  gameState: GameState;
  game: Chess;
  isAiThinking: boolean;
  
  // Settings
  viewMode: '2d' | '3d';
  gameMode: 'pvp' | 'pve';
  isFlipped: boolean;
  aiDepth: number;
  
  // Stats
  stats: GameStats;

  // Actions
  makeMove: (move: string | { from: string; to: string; promotion?: string }) => boolean;
  resetGame: () => void;
  undoMove: () => void;
  redoMove: () => void;
  setPendingPromotion: (promotion: { from: string; to: string } | null) => void;
  setAiThinking: (thinking: boolean) => void;
  setViewMode: (mode: '2d' | '3d') => void;
  setGameMode: (mode: 'pvp' | 'pve') => void;
  setAiModel: (model: AiModel) => void;
  setTheme: (theme: BoardTheme) => void;
  setEvaluation: (evalValue: number) => void;
  setIsFlipped: (flipped: boolean) => void;
  setAiDepth: (depth: number) => void;
  jumpToMove: (index: number) => void;
  importPgn: (pgn: string) => boolean;
  exportPgn: () => string;
  updateStats: (result: 'win' | 'loss' | 'draw') => void;
  
  // Timer Actions
  tick: () => void;
  setTimeControl: (config: TimeControl) => void;
  toggleTimer: (active: boolean) => void;
  
  // Puzzle Actions
  loadPuzzle: (puzzle: Puzzle) => void;
  checkPuzzleMove: (move: string | { from: string; to: string; promotion?: string }) => boolean;
}

export const useGameStore = create<AppState>()(
  persist(
    (set, get) => ({
      gameState: initialGameState,
      game: new Chess(),
      isAiThinking: false,
      viewMode: '2d',
      gameMode: 'pve',
      isFlipped: false,
      aiDepth: 3,
      stats: {
        wins: 0,
        losses: 0,
        draws: 0,
        totalGames: 0,
        rating: 1200,
        ratingHistory: [1200],
        fastestMate: null,
        longestGame: 0,
        totalMoves: 0,
        aiStats: {
          minimax: { wins: 0, losses: 0, draws: 0 },
          gemini: { wins: 0, losses: 0, draws: 0 },
        },
        achievements: [
          { id: 'first_win', title: 'First Blood', description: 'Win your first game', icon: 'Trophy', unlockedAt: null, progress: 0, maxProgress: 1 },
          { id: 'play_10', title: 'Dedicated', description: 'Play 10 games', icon: 'Swords', unlockedAt: null, progress: 0, maxProgress: 10 },
          { id: 'fast_mate', title: 'Speed Demon', description: 'Win in under 15 moves', icon: 'Zap', unlockedAt: null, progress: 0, maxProgress: 1 },
          { id: 'beat_gemini', title: 'AI Slayer', description: 'Beat Gemini AI', icon: 'Brain', unlockedAt: null, progress: 0, maxProgress: 1 },
        ]
      },

      makeMove: (move) => {
        const { game, gameState } = get();
        if (gameState.status === 'paused') return false;
        
        const newGame = new Chess(game.fen());
        try {
          const result = newGame.move(move);
          if (result) {
            const status = getGameStatus(newGame);
            
            // Timer logic: add increment
            const currentTurn = gameState.turn;
            const newTimer = { ...gameState.timer };
            if (newTimer.isActive) {
              newTimer[currentTurn] += newTimer.config.increment;
            }

            set({
              game: newGame,
              gameState: {
                ...gameState,
                fen: newGame.fen(),
                turn: newGame.turn(),
                isCheck: newGame.isCheck(),
                history: newGame.history(),
                status: status,
                lastMove: { from: result.from, to: result.to },
                redoStack: [],
                timer: newTimer,
              }
            });

            // Update stats if game ended
            if (status !== 'playing') {
              if (status === 'checkmate') {
                get().updateStats(newGame.turn() === 'b' ? 'win' : 'loss');
              } else {
                get().updateStats('draw');
              }
            }
            return true;
          }
        } catch (e) {
          console.error('Invalid move', e);
        }
        return false;
      },

      resetGame: () => {
        const newGame = new Chess();
        set({
          game: newGame,
          gameState: {
            ...initialGameState,
            aiModel: get().gameState.aiModel,
            theme: get().gameState.theme,
          }
        });
      },

      undoMove: () => {
        const { game, gameMode, gameState } = get();
        const newGame = new Chess(game.fen());
        const currentFen = game.fen();
        
        newGame.undo();
        const undoneFen = newGame.fen();
        
        const newRedoStack = [currentFen, ...gameState.redoStack];
        
        if (gameMode === 'pve' && gameState.turn === 'w') {
          const aiMoveFen = undoneFen;
          newGame.undo();
          const userMoveFen = newGame.fen();
          set({
            game: newGame,
            gameState: {
              ...gameState,
              fen: userMoveFen,
              turn: newGame.turn(),
              isCheck: newGame.isCheck(),
              history: newGame.history(),
              status: getGameStatus(newGame),
              lastMove: null,
              redoStack: [aiMoveFen, currentFen, ...gameState.redoStack],
            }
          });
        } else {
          set({
            game: newGame,
            gameState: {
              ...gameState,
              fen: undoneFen,
              turn: newGame.turn(),
              isCheck: newGame.isCheck(),
              history: newGame.history(),
              status: getGameStatus(newGame),
              lastMove: null,
              redoStack: newRedoStack,
            }
          });
        }
      },

      redoMove: () => {
        const { gameState } = get();
        if (gameState.redoStack.length === 0) return;

        const [nextFen, ...remainingRedo] = gameState.redoStack;
        const newGame = new Chess(nextFen);
        
        set({
          game: newGame,
          gameState: {
            ...gameState,
            fen: nextFen,
            turn: newGame.turn(),
            isCheck: newGame.isCheck(),
            history: newGame.history(),
            status: getGameStatus(newGame),
            lastMove: null,
            redoStack: remainingRedo,
          }
        });
      },

      jumpToMove: (index) => {
        const { game } = get();
        const history = game.history({ verbose: true });
        const newGame = new Chess();
        for (let i = 0; i <= index; i++) {
          newGame.move(history[i]);
        }
        set({
          game: newGame,
          gameState: {
            ...get().gameState,
            fen: newGame.fen(),
            turn: newGame.turn(),
            isCheck: newGame.isCheck(),
            history: newGame.history(),
            status: getGameStatus(newGame),
            lastMove: null,
          }
        });
      },

      setTheme: (theme) => set({ gameState: { ...get().gameState, theme } }),
      setEvaluation: (evaluation) => set({ gameState: { ...get().gameState, evaluation } }),
      setPendingPromotion: (promotion) => set({ gameState: { ...get().gameState, pendingPromotion: promotion } }),
      setAiThinking: (thinking) => set({ isAiThinking: thinking }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setGameMode: (mode) => set({ gameMode: mode }),
      setAiModel: (model) => set({ gameState: { ...get().gameState, aiModel: model } }),
      setIsFlipped: (flipped) => set({ isFlipped: flipped }),
      setAiDepth: (depth) => set({ aiDepth: depth }),

      importPgn: (pgn) => {
        try {
          const newGame = new Chess();
          newGame.loadPgn(pgn);
          set({
            game: newGame,
            gameState: {
              ...get().gameState,
              fen: newGame.fen(),
              turn: newGame.turn(),
              isCheck: newGame.isCheck(),
              history: newGame.history(),
              status: getGameStatus(newGame),
            }
          });
          return true;
        } catch (e) {
          return false;
        }
      },

      exportPgn: () => get().game.pgn(),

      updateStats: (result) => {
        set((state) => {
          const { game, gameState, gameMode } = state;
          const movesCount = Math.floor(game.history().length / 2);
          const isMate = game.isCheckmate();
          
          // ELO calculation (simplified)
          let ratingChange = 0;
          if (result === 'win') ratingChange = 15;
          else if (result === 'loss') ratingChange = -15;
          else ratingChange = 0;
          
          const newRating = Math.max(100, state.stats.rating + ratingChange);
          const newRatingHistory = [...state.stats.ratingHistory, newRating].slice(-30); // Keep last 30

          const aiModel = gameState.aiModel;
          const aiStatsUpdate = gameMode === 'pve' ? {
            [aiModel]: {
              wins: state.stats.aiStats[aiModel].wins + (result === 'win' ? 1 : 0),
              losses: state.stats.aiStats[aiModel].losses + (result === 'loss' ? 1 : 0),
              draws: state.stats.aiStats[aiModel].draws + (result === 'draw' ? 1 : 0),
            }
          } : {};

          // Update achievements
          const newAchievements = state.stats.achievements.map(ach => {
            let newProgress = ach.progress;
            
            if (ach.id === 'first_win' && result === 'win') newProgress = 1;
            if (ach.id === 'play_10') newProgress = Math.min(10, state.stats.totalGames + 1);
            if (ach.id === 'fast_mate' && result === 'win' && isMate && movesCount < 15) newProgress = 1;
            if (ach.id === 'beat_gemini' && result === 'win' && gameMode === 'pve' && aiModel === 'gemini') newProgress = 1;

            return {
              ...ach,
              progress: newProgress,
              unlockedAt: (newProgress >= ach.maxProgress && !ach.unlockedAt) ? Date.now() : ach.unlockedAt
            };
          });

          return {
            stats: {
              ...state.stats,
              totalGames: state.stats.totalGames + 1,
              wins: result === 'win' ? state.stats.wins + 1 : state.stats.wins,
              losses: result === 'loss' ? state.stats.losses + 1 : state.stats.losses,
              draws: result === 'draw' ? state.stats.draws + 1 : state.stats.draws,
              rating: newRating,
              ratingHistory: newRatingHistory,
              fastestMate: isMate && result === 'win' ? Math.min(state.stats.fastestMate || Infinity, movesCount) : state.stats.fastestMate,
              longestGame: Math.max(state.stats.longestGame, movesCount),
              totalMoves: state.stats.totalMoves + movesCount,
              aiStats: {
                ...state.stats.aiStats,
                ...aiStatsUpdate
              },
              achievements: newAchievements
            }
          };
        });
      },

      tick: () => {
        const { gameState } = get();
        if (!gameState.timer.isActive || gameState.status !== 'playing') return;

        const now = Date.now();
        const lastTick = gameState.timer.lastTick || now;
        const delta = (now - lastTick) / 1000;

        const turn = gameState.turn;
        const newTime = Math.max(0, gameState.timer[turn] - delta);

        if (newTime === 0) {
          set({
            gameState: {
              ...gameState,
              status: turn === 'w' ? 'checkmate' : 'checkmate', // Simplified: loss on time
              timer: {
                ...gameState.timer,
                [turn]: 0,
                lastTick: now,
              }
            }
          });
          get().updateStats(turn === 'w' ? 'loss' : 'win');
          return;
        }

        set({
          gameState: {
            ...gameState,
            timer: {
              ...gameState.timer,
              [turn]: newTime,
              lastTick: now,
            }
          }
        });
      },

      setTimeControl: (config) => {
        set({
          gameState: {
            ...get().gameState,
            timer: {
              w: config.initial,
              b: config.initial,
              lastTick: null,
              isActive: false,
              config,
            }
          }
        });
      },

      toggleTimer: (active) => {
        set({
          gameState: {
            ...get().gameState,
            timer: {
              ...get().gameState.timer,
              isActive: active,
              lastTick: active ? Date.now() : null,
            },
            status: active ? 'playing' : 'paused',
          }
        });
      },

      loadPuzzle: (puzzle) => {
        const newGame = new Chess(puzzle.fen);
        set({
          game: newGame,
          gameState: {
            ...initialGameState,
            fen: puzzle.fen,
            turn: newGame.turn(),
            activePuzzle: puzzle,
            puzzleProgress: 0,
          }
        });
      },

      checkPuzzleMove: (move) => {
        const { gameState, game } = get();
        if (!gameState.activePuzzle) return false;

        const expectedMove = gameState.activePuzzle.solution[gameState.puzzleProgress];
        const newGame = new Chess(game.fen());
        const result = newGame.move(move);

        if (result && result.san === expectedMove) {
          const nextProgress = gameState.puzzleProgress + 1;
          set({
            game: newGame,
            gameState: {
              ...gameState,
              fen: newGame.fen(),
              turn: newGame.turn(),
              puzzleProgress: nextProgress,
            }
          });

          // If puzzle complete
          if (nextProgress === gameState.activePuzzle.solution.length) {
            // Success!
          } else {
            // AI move for puzzle
            const aiMove = gameState.activePuzzle.solution[nextProgress];
            setTimeout(() => {
              const gameAfterAi = new Chess(get().game.fen());
              gameAfterAi.move(aiMove);
              set({
                game: gameAfterAi,
                gameState: {
                  ...get().gameState,
                  fen: gameAfterAi.fen(),
                  turn: gameAfterAi.turn(),
                  puzzleProgress: nextProgress + 1,
                }
              });
            }, 500);
          }
          return true;
        }
        return false;
      },
    }),
    {
      name: 'chess-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        stats: state.stats, 
        viewMode: state.viewMode, 
        gameMode: state.gameMode,
        aiDepth: state.aiDepth,
        isFlipped: state.isFlipped
      }),
    }
  )
);
