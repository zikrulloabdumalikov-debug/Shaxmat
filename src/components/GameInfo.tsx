import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion, AnimatePresence } from 'motion/react';
import { History, Settings, RotateCcw, SkipBack, SkipForward, Play, Pause, Download, Upload, Trophy, Brain, BarChart2 } from 'lucide-react';
import clsx from 'clsx';

interface GameInfoProps {
  onUndo: () => void;
  onReset: () => void;
}

export const GameInfo: React.FC<GameInfoProps> = ({ onUndo, onReset }) => {
  const { gameState, stats, achievements, gameMode, aiDifficulty } = useGameStore();
  const [activeTab, setActiveTab] = useState<'game' | 'stats' | 'learning'>('game');

  const formatMove = (move: { from: string; to: string; san: string }, index: number) => {
    return (
      <div key={index} className="flex items-center gap-2 text-sm font-mono p-1 hover:bg-white/5 rounded">
        <span className="text-white/40 w-6">{Math.floor(index / 2) + 1}.</span>
        <span className={clsx(index % 2 === 0 ? 'text-white' : 'text-white/70')}>{move.san}</span>
      </div>
    );
  };

  return (
    <div className="w-full md:w-96 h-[600px] bg-[#262421] rounded-xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('game')}
          className={clsx(
            'flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2',
            activeTab === 'game' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
          )}
        >
          <History size={16} /> Game
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={clsx(
            'flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2',
            activeTab === 'stats' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
          )}
        >
          <BarChart2 size={16} /> Stats
        </button>
        <button
          onClick={() => setActiveTab('learning')}
          className={clsx(
            'flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2',
            activeTab === 'learning' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
          )}
        >
          <Brain size={16} /> Learning
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-2">
                {gameState.moveHistory.map((move, i) => formatMove(move, i))}
                {gameState.moveHistory.length === 0 && (
                  <div className="col-span-2 text-center text-white/20 py-8 italic">
                    Game started. White to move.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.wins}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Wins</div>
                </div>
                <div className="bg-white/5 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-400">{stats.losses}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Losses</div>
                </div>
                <div className="bg-white/5 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.draws}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Draws</div>
                </div>
                <div className="bg-white/5 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-400">{stats.rating}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Rating</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">Achievements</h3>
                <div className="space-y-2">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className={clsx("p-3 rounded-lg flex items-center gap-3", achievement.unlocked ? "bg-green-500/10 border border-green-500/20" : "bg-white/5 border border-white/5 opacity-50")}>
                      <div className={clsx("p-2 rounded-full", achievement.unlocked ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40")}>
                        <Trophy size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{achievement.title}</div>
                        <div className="text-xs text-white/40">{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'learning' && (
            <motion.div
              key="learning"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-medium text-white mb-2">Daily Puzzle</h3>
                <p className="text-sm text-white/60 mb-4">Solve today's tactical challenge to improve your rating.</p>
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium">
                  Start Puzzle
                </button>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-medium text-white mb-2">Openings</h3>
                <p className="text-sm text-white/60 mb-4">Learn common opening traps and strategies.</p>
                <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium">
                  Browse Library
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-white/10 bg-[#1e1c19]">
        <div className="flex justify-between items-center gap-2 mb-4">
          <button onClick={onUndo} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Undo">
            <RotateCcw size={20} />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="First Move">
            <SkipBack size={20} />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Previous Move">
            <Play size={20} className="rotate-180" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Next Move">
            <Play size={20} />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Last Move">
            <SkipForward size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onReset} className="py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium text-sm">
            New Game
          </button>
          <button className="py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2">
            <Download size={14} /> PGN
          </button>
        </div>
      </div>
    </div>
  );
};
