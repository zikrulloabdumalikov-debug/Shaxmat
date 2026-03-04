import { useEffect, useCallback, useRef, useState } from 'react';
import { Chess, Move } from 'chess.js';
import { useGameStore } from '../store/useGameStore';
import { getGameStatus } from '../types';
import { getGeminiMove } from '../services/geminiService';

export const useChessGame = () => {
  const {
    gameState,
    gameMode,
    aiDifficulty,
    aiModel,
    setGameState,
    updateStats,
    unlockAchievement,
    updateTime,
    whiteTime,
    blackTime,
    isTimerActive,
    stopTimer,
    startTimer,
    resetTimer,
  } = useGameStore();

  const chessRef = useRef(new Chess(gameState.fen));
  const workerRef = useRef<Worker | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../lib/ai-worker.ts', import.meta.url), {
      type: 'module',
    });

    workerRef.current.onmessage = (e) => {
      const bestMove = e.data;
      if (bestMove) {
        makeMove(bestMove);
      }
      setIsThinking(false);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    // Sync chess instance with store state if needed (e.g. undo/redo)
    if (chessRef.current.fen() !== gameState.fen) {
      chessRef.current = new Chess(gameState.fen);
    }
  }, [gameState.fen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && gameState.status === 'playing') {
      interval = setInterval(() => {
        if (gameState.turn === 'w') {
          updateTime('w', Math.max(0, whiteTime - 1));
          if (whiteTime <= 0) handleTimeout('w');
        } else {
          updateTime('b', Math.max(0, blackTime - 1));
          if (blackTime <= 0) handleTimeout('b');
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, gameState.status, gameState.turn, whiteTime, blackTime]);

  const handleTimeout = (color: 'w' | 'b') => {
    stopTimer();
    setGameState({
      status: 'checkmate', // Or timeout specific status
      winner: color === 'w' ? 'b' : 'w',
    });
    updateStats('loss'); // Current player lost
  };

  const makeMove = useCallback(
    (move: string | { from: string; to: string; promotion?: string }) => {
      try {
        const result = chessRef.current.move(move);
        if (result) {
          const newStatus = getGameStatus(chessRef.current);
          const newGameState = {
            fen: chessRef.current.fen(),
            turn: chessRef.current.turn(),
            isCheck: chessRef.current.isCheck(),
            isCheckmate: chessRef.current.isCheckmate(),
            isDraw: chessRef.current.isDraw(),
            isStalemate: chessRef.current.isStalemate(),
            isInsufficientMaterial: chessRef.current.isInsufficientMaterial(),
            isThreefoldRepetition: chessRef.current.isThreefoldRepetition(),
            history: chessRef.current.history(),
            moveHistory: [...gameState.moveHistory, { from: result.from, to: result.to, san: result.san }],
            status: newStatus,
            winner: newStatus === 'checkmate' ? (chessRef.current.turn() === 'w' ? 'b' : 'w') : null,
          };

          setGameState(newGameState);

          if (newStatus !== 'playing') {
            stopTimer();
            if (newStatus === 'checkmate') {
              updateStats(chessRef.current.turn() === 'w' ? 'loss' : 'win'); // If it was white's turn and they are mated, black won
              unlockAchievement('first_win'); 
            } else if (newStatus === 'draw' || newStatus === 'stalemate') {
              updateStats('draw');
            }
          } else {
            // Switch timer
          }

          return true;
        }
      } catch (e) {
        return false;
      }
      return false;
    },
    [gameState.moveHistory, setGameState, updateStats, unlockAchievement, stopTimer]
  );

  const makeAiMove = useCallback(async () => {
    if (isThinking || gameState.status !== 'playing') return;

    setIsThinking(true);
    
    // Small delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));

    if (aiModel === 'gemini-3-flash-preview') {
      try {
        const move = await getGeminiMove(gameState.fen, gameState.history);
        if (move) {
          makeMove(move);
          setIsThinking(false);
          return;
        }
      } catch (e) {
        console.error("Gemini failed, falling back to minimax");
      }
    }

    // Fallback or default to Minimax
    if (workerRef.current) {
      workerRef.current.postMessage({
        fen: gameState.fen,
        depth: aiDifficulty,
      });
    }
  }, [aiModel, aiDifficulty, gameState.fen, gameState.history, gameState.status, isThinking, makeMove]);

  useEffect(() => {
    if (gameMode === 'pve' && gameState.turn === 'b' && gameState.status === 'playing') {
      makeAiMove();
    }
  }, [gameState.turn, gameMode, gameState.status, makeAiMove]);

  const resetGame = () => {
    chessRef.current.reset();
    resetTimer();
    startTimer();
    setGameState({
      fen: chessRef.current.fen(),
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
      status: 'playing',
      winner: null,
    });
  };

  const undoMove = () => {
    chessRef.current.undo();
    // If PvE, undo twice to go back to player's turn
    if (gameMode === 'pve') {
      chessRef.current.undo();
    }
    
    setGameState({
      fen: chessRef.current.fen(),
      turn: chessRef.current.turn(),
      isCheck: chessRef.current.isCheck(),
      isCheckmate: chessRef.current.isCheckmate(),
      isDraw: chessRef.current.isDraw(),
      isStalemate: chessRef.current.isStalemate(),
      isInsufficientMaterial: chessRef.current.isInsufficientMaterial(),
      isThreefoldRepetition: chessRef.current.isThreefoldRepetition(),
      history: chessRef.current.history(),
      moveHistory: gameState.moveHistory.slice(0, gameMode === 'pve' ? -2 : -1), // Simplified history update
      status: getGameStatus(chessRef.current),
      winner: null,
    });
  };

  return {
    chess: chessRef.current,
    makeMove,
    resetGame,
    undoMove,
    isThinking,
  };
};
