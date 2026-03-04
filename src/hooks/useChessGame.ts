import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess, Move } from 'chess.js';
import { GameState, initialGameState, getGameStatus } from '../types';

export function useChessGame() {
  const [game, setGame] = useState(new Chess());
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const aiWorkerRef = useRef<Worker | null>(null);

  const updateGameState = useCallback((newGame: Chess, lastMove: Move | null = null) => {
    setGameState((prev) => ({
      ...prev,
      fen: newGame.fen(),
      turn: newGame.turn(),
      isCheck: newGame.isCheck(),
      history: newGame.history(),
      status: getGameStatus(newGame),
      lastMove: lastMove ? { from: lastMove.from, to: lastMove.to } : null,
    }));
  }, []);

  const setAiModel = useCallback((model: 'minimax' | 'gemini') => {
    setGameState(prev => ({ ...prev, aiModel: model }));
  }, []);

  const makeMove = useCallback((move: string | { from: string; to: string; promotion?: string }) => {
    let success = false;
    setGame((prevGame) => {
      const newGame = new Chess(prevGame.fen());
      try {
        const result = newGame.move(move);
        if (result) {
          success = true;
          updateGameState(newGame, result);
          return newGame;
        }
      } catch (e) {
        console.error('Invalid move', e);
      }
      return prevGame;
    });
    return success;
  }, [updateGameState]);

  useEffect(() => {
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
  }, [makeMove]);

  const requestAiMove = useCallback(async (depth: number = 3) => {
    if (gameState.status !== 'playing' || isAiThinking) return;

    setIsAiThinking(true);

    if (gameState.aiModel === 'gemini') {
      const { getGeminiMove } = await import('../services/geminiService');
      const move = await getGeminiMove(game.fen(), gameState.history);
      if (move) {
        const success = makeMove(move);
        if (!success) {
          // If Gemini fails with an invalid move, fallback to minimax
          console.warn("Gemini provided invalid move, falling back to Minimax");
          if (aiWorkerRef.current) {
            aiWorkerRef.current.postMessage({ fen: game.fen(), depth });
          } else {
            const { getBestMove } = await import('../lib/ai-worker');
            const bestMove = getBestMove(new Chess(game.fen()), depth);
            if (bestMove) makeMove(bestMove);
            setIsAiThinking(false);
          }
          return;
        }
      }
      setIsAiThinking(false);
    } else {
      if (aiWorkerRef.current) {
        aiWorkerRef.current.postMessage({ fen: game.fen(), depth });
      } else {
        // Fallback: Run AI in a timeout to avoid blocking UI too much
        setTimeout(async () => {
          const { getBestMove } = await import('../lib/ai-worker');
          const move = getBestMove(new Chess(game.fen()), depth);
          if (move) makeMove(move);
          setIsAiThinking(false);
        }, 100);
      }
    }
  }, [game, gameState.status, gameState.aiModel, gameState.history, isAiThinking, makeMove]);

  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    updateGameState(newGame);
  }, [updateGameState]);

  const undoMove = useCallback(() => {
    setGame((prevGame) => {
      const newGame = new Chess(prevGame.fen());
      newGame.undo();
      // If playing against AI, undo twice to get back to user's turn
      newGame.undo();
      updateGameState(newGame);
      return newGame;
    });
  }, [updateGameState]);

  return {
    game,
    gameState,
    makeMove,
    resetGame,
    undoMove,
    isAiThinking,
    requestAiMove,
    setAiModel,
  };
}
