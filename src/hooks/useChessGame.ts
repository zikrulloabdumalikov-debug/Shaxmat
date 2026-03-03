import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess, Move } from 'chess.js';
import { GameState, initialGameState, getGameStatus } from '../types';

export function useChessGame() {
  const [game, setGame] = useState(new Chess());
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const aiWorkerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize AI Worker
    // Note: In Vite, we use new Worker(new URL('./ai-worker.ts', import.meta.url))
    // But for this environment, we'll simulate the worker if it's not easily available
    // or just run it in the main thread for simplicity if needed, 
    // but the user asked for Web Worker.
    try {
      aiWorkerRef.current = new Worker(new URL('../lib/ai-worker.ts', import.meta.url), { type: 'module' });
      aiWorkerRef.current.onmessage = (e) => {
        const { move } = e.data;
        if (move) {
          makeMove(move);
        }
        setIsAiThinking(false);
      };
    } catch (err) {
      console.error('Failed to start AI Worker', err);
    }

    return () => {
      aiWorkerRef.current?.terminate();
    };
  }, []);

  const updateGameState = useCallback((newGame: Chess, lastMove: Move | null = null) => {
    setGameState({
      fen: newGame.fen(),
      turn: newGame.turn(),
      isCheck: newGame.isCheck(),
      history: newGame.history(),
      status: getGameStatus(newGame),
      lastMove: lastMove ? { from: lastMove.from, to: lastMove.to } : null,
    });
  }, []);

  const makeMove = useCallback((move: string | { from: string; to: string; promotion?: string }) => {
    try {
      const newGame = new Chess(game.fen());
      const result = newGame.move(move);
      if (result) {
        setGame(newGame);
        updateGameState(newGame, result);
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }, [game, updateGameState]);

  const requestAiMove = useCallback((depth: number = 3) => {
    if (gameState.status !== 'playing' || isAiThinking) return;

    setIsAiThinking(true);
    if (aiWorkerRef.current) {
      aiWorkerRef.current.postMessage({ fen: game.fen(), depth });
    } else {
      // Fallback if worker fails
      setTimeout(() => {
        // Simple fallback would go here
        setIsAiThinking(false);
      }, 500);
    }
  }, [game, gameState.status, isAiThinking]);

  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    updateGameState(newGame);
  }, [updateGameState]);

  const undoMove = useCallback(() => {
    const newGame = new Chess(game.fen());
    newGame.undo();
    // If playing against AI, undo twice
    if (newGame.turn() === 'b') {
        newGame.undo();
    }
    setGame(newGame);
    updateGameState(newGame);
  }, [game, updateGameState]);

  return {
    game,
    gameState,
    makeMove,
    resetGame,
    undoMove,
    isAiThinking,
    requestAiMove,
  };
}
