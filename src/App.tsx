import React, { useState } from 'react';
import { ChessBoard } from './components/ChessBoard';
import { GameInfo } from './components/GameInfo';
import { MainMenu } from './components/MainMenu';
import { useChessGame } from './hooks/useChessGame';
import { useGameStore } from './store/useGameStore';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

function App() {
  const { chess, makeMove, resetGame, undoMove, isThinking } = useChessGame();
  const { gameState } = useGameStore();
  const [screen, setScreen] = useState<'menu' | 'game'>('menu');

  // Trigger confetti on win
  React.useEffect(() => {
    if (gameState.status === 'checkmate' && gameState.winner) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#60A5FA', '#34D399', '#F87171']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#60A5FA', '#34D399', '#F87171']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [gameState.status, gameState.winner]);

  return (
    <div className="min-h-screen bg-[#161512] text-white font-sans selection:bg-blue-500/30">
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setScreen('menu')}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center">
              <span className="text-xl font-bold">C</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Chess<span className="text-blue-500">Pro</span></h1>
          </div>
          
          {screen === 'game' && (
            <button 
              onClick={() => setScreen('menu')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium"
            >
              Back to Menu
            </button>
          )}
        </header>

        <main className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {screen === 'menu' ? (
              <motion.div
                key="menu"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <MainMenu onStartGame={() => {
                  resetGame();
                  setScreen('game');
                }} />
              </motion.div>
            ) : (
              <motion.div
                key="game"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col lg:flex-row items-start justify-center gap-8"
              >
                <ChessBoard 
                  chess={chess} 
                  onMove={makeMove} 
                  isThinking={isThinking}
                />
                <GameInfo 
                  onUndo={undoMove}
                  onReset={resetGame}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-8 text-center text-white/20 text-sm">
          <p>© 2024 ChessPro AI. Built with React, Tailwind & Gemini.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
