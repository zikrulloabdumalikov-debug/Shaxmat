import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Settings, User, Trophy, Brain, Swords, Target, Clock, Palette } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { TIME_CONTROLS } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MainMenuProps {
  onStartGame: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [activeTab, setActiveTab] = React.useState<'play' | 'settings' | 'profile'>('play');
  const { 
    gameMode, setGameMode, 
    aiDepth, setAiDepth, 
    gameState, setAiModel, setTheme, setTimeControl,
    stats
  } = useGameStore();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans selection:bg-emerald-500/30">
      <div className="w-full max-w-2xl bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-48 bg-zinc-950/50 p-4 border-b md:border-b-0 md:border-r border-zinc-800 flex md:flex-col gap-2">
          <div className="hidden md:block mb-8 px-2">
            <h1 className="text-xl font-black text-white uppercase italic tracking-tighter">Chess AI</h1>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Master Edition</p>
          </div>

          <button
            onClick={() => setActiveTab('play')}
            className={cn(
              "flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold uppercase tracking-wider",
              activeTab === 'play' ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
          >
            <Play size={18} />
            <span className="hidden md:inline">Play</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              "flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold uppercase tracking-wider",
              activeTab === 'settings' ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
          >
            <Settings size={18} />
            <span className="hidden md:inline">Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              "flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold uppercase tracking-wider",
              activeTab === 'profile' ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
          >
            <User size={18} />
            <span className="hidden md:inline">Profile</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'play' && (
              <motion.div
                key="play"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-black text-white uppercase italic mb-1">Select Game Mode</h2>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Choose your challenge</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => { setGameMode('pve'); onStartGame(); }}
                    className="flex flex-col items-center justify-center gap-3 p-6 bg-zinc-800/50 hover:bg-zinc-800 rounded-2xl border border-zinc-700/50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                      <Brain size={24} />
                    </div>
                    <div className="text-center">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Vs Computer</h3>
                      <p className="text-[10px] text-zinc-400">Play against AI Engine</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { setGameMode('pvp'); onStartGame(); }}
                    className="flex flex-col items-center justify-center gap-3 p-6 bg-zinc-800/50 hover:bg-zinc-800 rounded-2xl border border-zinc-700/50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <Swords size={24} />
                    </div>
                    <div className="text-center">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Pass & Play</h3>
                      <p className="text-[10px] text-zinc-400">Play with a friend locally</p>
                    </div>
                  </button>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => { /* Handle puzzle start */ onStartGame(); }}
                    className="w-full flex items-center justify-between p-4 bg-zinc-800/30 hover:bg-zinc-800/50 rounded-2xl border border-zinc-700/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-500">
                        <Target size={20} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Daily Puzzles</h3>
                        <p className="text-[10px] text-zinc-400">Improve your tactics</p>
                      </div>
                    </div>
                    <Play size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-black text-white uppercase italic mb-1">Game Settings</h2>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Customize your experience</p>
                </div>

                <div className="space-y-4">
                  {/* Time Control */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      <Clock size={14} /> Time Control
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(TIME_CONTROLS).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => setTimeControl(config)}
                          className={cn(
                            "py-2 px-1 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider border",
                            gameState.timer.config.label === config.label
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                              : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                          )}
                        >
                          {config.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Difficulty */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      <Brain size={14} /> Engine Difficulty (Depth)
                    </label>
                    <div className="flex items-center gap-4 bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50">
                      <input 
                        type="range" 
                        min="1" max="5" 
                        value={aiDepth}
                        onChange={(e) => setAiDepth(Number(e.target.value))}
                        className="flex-1 accent-emerald-500"
                      />
                      <span className="text-sm font-mono font-bold text-emerald-400 w-4 text-center">{aiDepth}</span>
                    </div>
                  </div>

                  {/* Board Theme */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      <Palette size={14} /> Board Theme
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['classic', 'wood', 'dark'].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setTheme(theme as any)}
                          className={cn(
                            "py-2 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider border",
                            gameState.theme === theme
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                              : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
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

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Profile Header */}
                <div className="flex items-center gap-4 bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50">
                    <span className="text-2xl font-bold text-emerald-500">G</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Guest Player</h2>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Local Progress Only</p>
                  </div>
                  <button className="ml-auto px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-xs font-bold text-white transition-colors uppercase tracking-wider">
                    Login
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
                    <div className="text-[10px] text-zinc-500 font-bold mb-1 uppercase tracking-widest">Rating</div>
                    <div className="text-2xl font-black text-emerald-500">{stats.rating}</div>
                  </div>
                  <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
                    <div className="text-[10px] text-zinc-500 font-bold mb-1 uppercase tracking-widest">Games Played</div>
                    <div className="text-2xl font-black text-white">{stats.totalGames}</div>
                  </div>
                </div>

                <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Trophy size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Recent Achievements</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {stats.achievements?.filter(a => a.unlockedAt).slice(0, 2).map((ach) => (
                      <div key={ach.id} className="flex items-center gap-3 p-2 bg-zinc-800 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Trophy size={14} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-emerald-400">{ach.title}</h4>
                          <p className="text-[9px] text-zinc-400">{ach.description}</p>
                        </div>
                      </div>
                    ))}
                    {(!stats.achievements || stats.achievements.filter(a => a.unlockedAt).length === 0) && (
                      <p className="text-xs text-zinc-500 text-center py-2">No achievements yet. Play some games!</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
