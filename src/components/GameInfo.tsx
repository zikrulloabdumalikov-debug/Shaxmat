import React from 'react';
import { ScrollText, Trophy, History, Settings, Brain, RotateCcw, Undo2 } from 'lucide-react';
import { GameState } from '../types';

interface GameInfoProps {
  gameState: GameState;
  onReset: () => void;
  onUndo: () => void;
  isAiThinking: boolean;
  gameMode: 'pvp' | 'pve';
  setGameMode: (mode: 'pvp' | 'pve') => void;
}

export const GameInfo: React.FC<GameInfoProps> = ({ 
  gameState, 
  onReset, 
  onUndo, 
  isAiThinking,
  gameMode,
  setGameMode
}) => {
  return (
    <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 w-full lg:w-80 p-6 text-zinc-100">
      <div className="flex items-center gap-2 mb-8">
        <Trophy className="text-yellow-500 w-6 h-6" />
        <h2 className="text-xl font-bold tracking-tight">Grandmaster Pro</h2>
      </div>

      <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
        {/* Game Mode Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-800 rounded-lg">
          <button
            onClick={() => setGameMode('pve')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all ${
              gameMode === 'pve' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Brain size={16} />
            <span className="text-sm font-medium">VS AI</span>
          </button>
          <button
            onClick={() => setGameMode('pvp')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all ${
              gameMode === 'pvp' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History size={16} />
            <span className="text-sm font-medium">Local</span>
          </button>
        </div>

        {/* Status Card */}
        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Status</span>
            <div className={`w-2 h-2 rounded-full animate-pulse ${gameState.turn === 'w' ? 'bg-white' : 'bg-zinc-400'}`} />
          </div>
          <p className="text-lg font-semibold">
            {gameState.status === 'playing' 
              ? `${gameState.turn === 'w' ? "White's" : "Black's"} Turn`
              : gameState.status.toUpperCase()}
          </p>
          {isAiThinking && (
            <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
              <Brain size={12} className="animate-bounce" />
              AI is thinking...
            </p>
          )}
        </div>

        {/* Move History */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3 text-zinc-400">
            <ScrollText size={16} />
            <span className="text-sm font-bold uppercase tracking-wider">Move History</span>
          </div>
          <div className="flex-1 overflow-y-auto bg-zinc-800/30 rounded-xl p-3 border border-zinc-700/30 custom-scrollbar">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {Array.from({ length: Math.ceil(gameState.history.length / 2) }).map((_, i) => (
                <React.Fragment key={i}>
                  <div className="flex gap-2 text-sm">
                    <span className="text-zinc-600 font-mono w-4">{i + 1}.</span>
                    <span className="text-zinc-200 font-medium">{gameState.history[i * 2]}</span>
                  </div>
                  <div className="text-sm text-zinc-200 font-medium">
                    {gameState.history[i * 2 + 1] || ''}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3 mt-auto pt-6">
          <button
            onClick={onUndo}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-colors border border-zinc-700"
          >
            <Undo2 size={18} />
            <span className="font-bold text-sm">Undo</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-xl transition-colors border border-red-900/30"
          >
            <RotateCcw size={18} />
            <span className="font-bold text-sm">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
