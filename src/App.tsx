import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChessBoard } from './components/ChessBoard';
import { GameInfo } from './components/GameInfo';
import { useChessGame } from './hooks/useChessGame';
import confetti from 'canvas-confetti';
import { Trophy, Swords, Info, Brain } from 'lucide-react';

export default function App() {
  const { 
    gameState, 
    makeMove, 
    resetGame, 
    undoMove, 
    isAiThinking, 
    requestAiMove 
  } = useChessGame();

  const [gameMode, setGameMode] = useState<'pvp' | 'pve'>('pve');

  // Trigger AI move if it's AI's turn
  useEffect(() => {
    if (gameMode === 'pve' && gameState.turn === 'b' && gameState.status === 'playing') {
      const timer = setTimeout(() => {
        requestAiMove(3); // Depth 3 for medium difficulty
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [gameState.turn, gameState.status, gameMode, requestAiMove]);

  // Win celebration
  useEffect(() => {
    if (gameState.status === 'checkmate') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#779556', '#ebecd0', '#ffffff']
      });
    }
  }, [gameState.status]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row font-sans selection:bg-emerald-500/30">
      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-4xl flex flex-col items-center gap-8 relative z-10">
          {/* Header */}
          <header className="w-full flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <Swords className="text-emerald-500 w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Grandmaster Pro</h1>
                <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">Elite Chess Platform</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-zinc-300 uppercase">Engine Online</span>
                </div>
                <div className="w-px h-4 bg-zinc-800" />
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-bold text-zinc-300 uppercase">AI Ready</span>
                </div>
            </div>
          </header>

          {/* Game Board Container */}
          <div className="relative group">
            <AnimatePresence mode="wait">
              {gameState.status !== 'playing' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg"
                >
                  <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-700 shadow-2xl text-center max-w-xs">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-black text-white mb-2 uppercase italic">Game Over</h2>
                    <p className="text-zinc-400 mb-6 font-medium">
                      {gameState.status === 'checkmate' 
                        ? `Checkmate! ${gameState.turn === 'w' ? 'Black' : 'White'} wins.`
                        : `Draw by ${gameState.status}.`}
                    </p>
                    <button 
                      onClick={resetGame}
                      className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                    >
                      Play Again
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <ChessBoard 
              gameState={gameState} 
              onMove={(from, to, promotion) => makeMove({ from, to, promotion })}
              disabled={gameState.status !== 'playing' || (gameMode === 'pve' && gameState.turn === 'b')}
            />
          </div>

          {/* Footer Info */}
          <footer className="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-500">
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1"><Info size={14} /> FIDE Rules</span>
                <span className="flex items-center gap-1"><Brain size={14} /> Stockfish-Lite AI</span>
            </div>
            <p className="text-[10px] font-medium opacity-50">© 2026 GRANDMASTER CHESS • PROFESSIONAL EDITION</p>
          </footer>
        </div>
      </main>

      {/* Sidebar */}
      <aside className="w-full lg:w-auto">
        <GameInfo 
          gameState={gameState} 
          onReset={resetGame} 
          onUndo={undoMove}
          isAiThinking={isAiThinking}
          gameMode={gameMode}
          setGameMode={setGameMode}
        />
      </aside>
    </div>
  );
}
