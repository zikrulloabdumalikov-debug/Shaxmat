import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Settings, User, Cpu, Users, ChevronRight, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import clsx from 'clsx';

interface MainMenuProps {
  onStartGame: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const { 
    gameMode, setGameMode, 
    aiDifficulty, setAiDifficulty,
    boardTheme, setBoardTheme,
    soundEnabled, toggleSound,
    showLegalMoves, toggleShowLegalMoves,
    stats
  } = useGameStore();

  const [activeSection, setActiveSection] = useState<'play' | 'settings' | 'profile'>('play');

  return (
    <div className="w-full max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 h-[600px]">
      {/* Sidebar Navigation */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setActiveSection('play')}
          className={clsx(
            "flex items-center gap-3 p-4 rounded-xl transition-all text-left",
            activeSection === 'play' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
          )}
        >
          <Play size={20} />
          <span className="font-medium">Play</span>
        </button>
        <button
          onClick={() => setActiveSection('settings')}
          className={clsx(
            "flex items-center gap-3 p-4 rounded-xl transition-all text-left",
            activeSection === 'settings' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
          )}
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
        <button
          onClick={() => setActiveSection('profile')}
          className={clsx(
            "flex items-center gap-3 p-4 rounded-xl transition-all text-left",
            activeSection === 'profile' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-white/60 hover:bg-white/5 hover:text-white"
          )}
        >
          <User size={20} />
          <span className="font-medium">Profile</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-[#262421] rounded-2xl border border-white/10 p-8 overflow-y-auto custom-scrollbar shadow-2xl">
        {activeSection === 'play' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Start New Game</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setGameMode('pve')}
                  className={clsx(
                    "p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-4 group",
                    gameMode === 'pve' ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/30 bg-white/5"
                  )}
                >
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <Cpu size={32} />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-white text-lg">Play vs AI</div>
                    <div className="text-white/40 text-sm mt-1">Challenge the engine</div>
                  </div>
                </button>

                <button
                  onClick={() => setGameMode('pvp')}
                  className={clsx(
                    "p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-4 group",
                    gameMode === 'pvp' ? "border-green-500 bg-green-500/10" : "border-white/10 hover:border-white/30 bg-white/5"
                  )}
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                    <Users size={32} />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-white text-lg">Play vs Friend</div>
                    <div className="text-white/40 text-sm mt-1">Local multiplayer</div>
                  </div>
                </button>
              </div>
            </div>

            {gameMode === 'pve' && (
              <div>
                <h3 className="text-white/60 font-medium mb-4 uppercase text-sm tracking-wider">AI Difficulty</h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setAiDifficulty(level)}
                      className={clsx(
                        "flex-1 py-3 rounded-lg font-bold transition-all",
                        aiDifficulty === level 
                          ? "bg-white text-black shadow-lg scale-105" 
                          : "bg-white/5 text-white/40 hover:bg-white/10"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onStartGame}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Start Game <ChevronRight size={20} />
            </button>
          </motion.div>
        )}

        {activeSection === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/10 rounded-lg text-white">
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </div>
                  <div>
                    <div className="font-medium text-white">Sound Effects</div>
                    <div className="text-sm text-white/40">Enable game sounds</div>
                  </div>
                </div>
                <button
                  onClick={toggleSound}
                  className={clsx(
                    "w-12 h-6 rounded-full transition-colors relative",
                    soundEnabled ? "bg-green-500" : "bg-white/20"
                  )}
                >
                  <div className={clsx(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                    soundEnabled ? "left-7" : "left-1"
                  )} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/10 rounded-lg text-white">
                    {showLegalMoves ? <Eye size={20} /> : <EyeOff size={20} />}
                  </div>
                  <div>
                    <div className="font-medium text-white">Show Legal Moves</div>
                    <div className="text-sm text-white/40">Highlight possible moves</div>
                  </div>
                </div>
                <button
                  onClick={toggleShowLegalMoves}
                  className={clsx(
                    "w-12 h-6 rounded-full transition-colors relative",
                    showLegalMoves ? "bg-green-500" : "bg-white/20"
                  )}
                >
                  <div className={clsx(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                    showLegalMoves ? "left-7" : "left-1"
                  )} />
                </button>
              </div>

              <div>
                <h3 className="text-white/60 font-medium mb-4 uppercase text-sm tracking-wider">Board Theme</h3>
                <div className="grid grid-cols-2 gap-4">
                  {['classic', 'wood', 'glass', 'neon'].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setBoardTheme(theme as any)}
                      className={clsx(
                        "p-4 rounded-xl border transition-all capitalize",
                        boardTheme === theme 
                          ? "border-blue-500 bg-blue-500/10 text-white" 
                          : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                      )}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
                GM
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Guest Player</h2>
                <div className="text-white/60 mt-1">Rating: {stats.rating}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                <div className="text-3xl font-bold text-white mb-1">{stats.wins}</div>
                <div className="text-xs text-white/40 uppercase tracking-wider">Wins</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                <div className="text-3xl font-bold text-white mb-1">{stats.losses}</div>
                <div className="text-xs text-white/40 uppercase tracking-wider">Losses</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                <div className="text-3xl font-bold text-white mb-1">{stats.draws}</div>
                <div className="text-xs text-white/40 uppercase tracking-wider">Draws</div>
              </div>
            </div>

            <div>
              <h3 className="text-white/60 font-medium mb-4 uppercase text-sm tracking-wider">Recent Activity</h3>
              <div className="space-y-2">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-white">Won vs AI (Level 3)</span>
                  </div>
                  <span className="text-white/40 text-sm">2h ago</span>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-white">Lost vs AI (Level 4)</span>
                  </div>
                  <span className="text-white/40 text-sm">5h ago</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
