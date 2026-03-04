import React, { useRef } from 'react';
import { ScrollText, Trophy, History, Brain, RotateCcw, Undo2, Download, BarChart3, BookOpen, Layout, Palette, Timer, Play, Pause, Target, Zap, Upload } from 'lucide-react';
import { GameState, BoardTheme, TimeControl, TIME_CONTROLS, Puzzle, GameStats } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useGameStore } from '../store/useGameStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GameInfoProps {
  gameState: GameState;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  isAiThinking: boolean;
  gameMode: 'pvp' | 'pve';
  setGameMode: (mode: 'pvp' | 'pve') => void;
  viewMode: '2d' | '3d';
  setViewMode: (mode: '2d' | '3d') => void;
  isFlipped: boolean;
  setIsFlipped: (flipped: boolean) => void;
  setAiModel: (model: 'minimax' | 'gemini') => void;
  setTheme: (theme: BoardTheme) => void;
  jumpToMove: (index: number) => void;
  setTimeControl: (config: TimeControl) => void;
  toggleTimer: (active: boolean) => void;
  loadPuzzle: (puzzle: Puzzle) => void;
  stats: GameStats;
}

export const GameInfo: React.FC<GameInfoProps> = ({ 
  gameState, 
  onReset, 
  onUndo, 
  onRedo,
  isAiThinking,
  gameMode,
  setGameMode,
  viewMode,
  setViewMode,
  isFlipped,
  setIsFlipped,
  setAiModel,
  setTheme,
  jumpToMove,
  setTimeControl,
  toggleTimer,
  loadPuzzle,
  stats
}) => {
  const [activeTab, setActiveTab] = React.useState<'game' | 'stats' | 'learning'>('game');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { exportPgn, importPgn } = useGameStore();

  const themes: { id: BoardTheme; label: string; colors: string[] }[] = [
    { id: 'classic', label: 'Classic', colors: ['bg-[#ebecd0]', 'bg-[#779556]'] },
    { id: 'wood', label: 'Wood', colors: ['bg-[#f0d9b5]', 'bg-[#b58863]'] },
    { id: 'dark', label: 'Dark', colors: ['bg-[#eae9d2]', 'bg-[#4b7399]'] },
  ];

  const handleExportPgn = () => {
    const pgn = exportPgn();
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-${new Date().toISOString()}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportPgn = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const pgn = event.target?.result as string;
        if (pgn) {
          const success = importPgn(pgn);
          if (!success) {
            alert('Invalid PGN file.');
          }
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full lg:w-96 flex flex-col gap-4 h-full">
      {/* Tabs */}
      <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
        {(['game', 'stats', 'learning'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2 px-2 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest",
              activeTab === tab ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6 overflow-y-auto">
        {activeTab === 'game' && (
          <>
            {/* Status Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-3 h-3 rounded-full animate-pulse",
                  gameState.turn === 'w' ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "bg-zinc-600"
                )} />
                <span className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                  {gameState.turn === 'w' ? "White's Turn" : "Black's Turn"}
                </span>
              </div>
              {isAiThinking && (
                <div className="flex items-center gap-2 text-emerald-500">
                  <Brain size={16} className="animate-bounce" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">AI Thinking...</span>
                </div>
              )}
            </div>

            {/* Timer Selection */}
            <div className="space-y-3">
              <button
                onClick={() => toggleTimer(!gameState.timer.isActive)}
                className={cn(
                  "w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all",
                  gameState.timer.isActive 
                    ? "bg-red-900/20 text-red-400 border border-red-900/30 hover:bg-red-900/30" 
                    : "bg-emerald-900/20 text-emerald-400 border border-emerald-900/30 hover:bg-emerald-900/30"
                )}
              >
                {gameState.timer.isActive ? <><Pause size={14} /> Pause Game</> : <><Play size={14} /> Start / Resume</>}
              </button>
            </div>

            {/* View Mode */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">View</label>
                <div className="flex bg-zinc-800/50 p-1 rounded-xl border border-zinc-800">
                  <button
                    onClick={() => setViewMode('2d')}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg text-[10px] font-bold transition-all",
                      viewMode === '2d' ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    2D
                  </button>
                  <button
                    onClick={() => setViewMode('3d')}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg text-[10px] font-bold transition-all",
                      viewMode === '3d' ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    3D
                  </button>
                </div>
              </div>
            </div>

            {/* History Timeline */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-zinc-500">
                  <History size={14} />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">Move History</h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-600">{gameState.history.length} moves</span>
              </div>
              <div className="flex-1 bg-zinc-950/50 rounded-xl border border-zinc-800 p-3 overflow-y-auto max-h-[240px] scrollbar-thin scrollbar-thumb-zinc-700">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {Array.from({ length: Math.ceil(gameState.history.length / 2) }).map((_, i) => (
                    <React.Fragment key={i}>
                      <div className="flex items-center gap-2 group">
                        <span className="text-[10px] font-mono text-zinc-700 w-4">{i + 1}.</span>
                        <button
                          onClick={() => jumpToMove(i * 2)}
                          className="flex-1 text-left py-1 px-2 rounded hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
                        >
                          {gameState.history[i * 2]}
                        </button>
                      </div>
                      {gameState.history[i * 2 + 1] && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => jumpToMove(i * 2 + 1)}
                            className="flex-1 text-left py-1 px-2 rounded hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
                          >
                            {gameState.history[i * 2 + 1]}
                          </button>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={onUndo}
                className="flex flex-col items-center justify-center gap-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-colors border border-zinc-700"
                title="Undo"
              >
                <Undo2 size={16} />
                <span className="text-[8px] font-bold uppercase">Undo</span>
              </button>
              <button
                onClick={onRedo}
                disabled={gameState.redoStack.length === 0}
                className="flex flex-col items-center justify-center gap-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-colors border border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Redo"
              >
                <div className="rotate-180"><Undo2 size={16} /></div>
                <span className="text-[8px] font-bold uppercase">Redo</span>
              </button>
              <button
                onClick={handleExportPgn}
                className="flex flex-col items-center justify-center gap-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-colors border border-zinc-700"
                title="Export PGN"
              >
                <Download size={16} />
                <span className="text-[8px] font-bold uppercase">Exp</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-colors border border-zinc-700"
                title="Import PGN"
              >
                <Upload size={16} />
                <span className="text-[8px] font-bold uppercase">Imp</span>
                <input
                  type="file"
                  accept=".pgn"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImportPgn}
                />
              </button>
              <button
                onClick={onReset}
                className="flex flex-col items-center justify-center gap-1 py-3 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-xl transition-colors border border-red-900/30"
                title="Reset"
              >
                <RotateCcw size={16} />
                <span className="text-[8px] font-bold uppercase">Reset</span>
              </button>
            </div>
          </>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-400">
                <BarChart3 size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Performance</span>
              </div>
              <div className="text-sm font-bold text-emerald-500">
                Rating: {stats.rating}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 text-center">
                <div className="text-[10px] text-zinc-500 font-bold mb-1">WINS</div>
                <div className="text-2xl font-black text-emerald-500">{stats.wins}</div>
              </div>
              <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 text-center">
                <div className="text-[10px] text-zinc-500 font-bold mb-1">LOSS</div>
                <div className="text-2xl font-black text-red-500">{stats.losses}</div>
              </div>
              <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 text-center">
                <div className="text-[10px] text-zinc-500 font-bold mb-1">DRAW</div>
                <div className="text-2xl font-black text-zinc-400">{stats.draws}</div>
              </div>
            </div>
            
            <div className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-zinc-400">Win Rate</span>
                <span className="text-lg font-black text-white">
                  {stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: `${(stats.wins / (stats.totalGames || 1)) * 100}%` }} />
                <div className="h-full bg-zinc-500" style={{ width: `${(stats.draws / (stats.totalGames || 1)) * 100}%` }} />
                <div className="h-full bg-red-500" style={{ width: `${(stats.losses / (stats.totalGames || 1)) * 100}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
                <div className="text-[10px] text-zinc-500 font-bold mb-1 uppercase">Avg Moves</div>
                <div className="text-lg font-black text-zinc-200">
                  {stats.totalGames > 0 ? Math.round(stats.totalMoves / stats.totalGames) : 0}
                </div>
              </div>
              <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
                <div className="text-[10px] text-zinc-500 font-bold mb-1 uppercase">Fastest Mate</div>
                <div className="text-lg font-black text-zinc-200">
                  {stats.fastestMate ? `${stats.fastestMate} moves` : '-'}
                </div>
              </div>
              <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
                <div className="text-[10px] text-zinc-500 font-bold mb-1 uppercase">Longest Game</div>
                <div className="text-lg font-black text-zinc-200">
                  {stats.longestGame > 0 ? `${stats.longestGame} moves` : '-'}
                </div>
              </div>
              <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
                <div className="text-[10px] text-zinc-500 font-bold mb-1 uppercase">Total Games</div>
                <div className="text-lg font-black text-zinc-200">
                  {stats.totalGames}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">AI Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Stockfish</span>
                  <span className="font-mono text-zinc-300">
                    {stats.aiStats.minimax.wins}W - {stats.aiStats.minimax.losses}L - {stats.aiStats.minimax.draws}D
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Gemini AI</span>
                  <span className="font-mono text-zinc-300">
                    {stats.aiStats.gemini.wins}W - {stats.aiStats.gemini.losses}L - {stats.aiStats.gemini.draws}D
                  </span>
                </div>
              </div>
            </div>
            
            {/* Rating Trend Graph (Simplified) */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Rating Trend (Last 30)</h3>
              <div className="h-24 flex items-end gap-1">
                {stats.ratingHistory.map((r, i) => {
                  const min = Math.min(...stats.ratingHistory);
                  const max = Math.max(...stats.ratingHistory);
                  const range = max - min || 1;
                  const height = Math.max(10, ((r - min) / range) * 100);
                  return (
                    <div 
                      key={i} 
                      className="flex-1 bg-emerald-500/50 rounded-t-sm hover:bg-emerald-400 transition-colors relative group"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-zinc-800 text-white text-[10px] px-2 py-1 rounded">
                        {r}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'learning' && (
          <div className="space-y-6">
            {/* Puzzles Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Target size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Daily Puzzles</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-600">Rating: 1200</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'p1', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', solution: ['Nf6'], rating: 800, description: 'Find the best developing move.' },
                  { id: 'p2', fen: '6k1/5ppp/8/8/8/8/5PPP/6K1 w - - 0 1', solution: ['Kf1'], rating: 400, description: 'King activity in the endgame.' },
                ].map((puzzle) => (
                  <button
                    key={puzzle.id}
                    onClick={() => loadPuzzle(puzzle as Puzzle)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border transition-all group",
                      gameState.activePuzzle?.id === puzzle.id ? "bg-emerald-900/20 border-emerald-500/50" : "bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-zinc-200 group-hover:text-white">Puzzle #{puzzle.id}</span>
                      <span className="text-[10px] font-mono text-zinc-500">Rating: {puzzle.rating}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 line-clamp-1">{puzzle.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Tactics Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Zap size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Tactics Training</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['Fork', 'Pin', 'Skewer', 'Double Attack'].map((tactic) => (
                  <button
                    key={tactic}
                    className="p-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-2xl border border-zinc-700/50 transition-all text-center"
                  >
                    <div className="text-xs font-bold text-zinc-300 mb-1">{tactic}</div>
                    <div className="text-[8px] text-zinc-500 uppercase tracking-widest">12 Lessons</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Openings Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <BookOpen size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Opening Explorer</span>
              </div>
              {[
                { name: 'Italian Game', moves: '1. e4 e5 2. Nf3 Nc6 3. Bc4' },
                { name: 'Sicilian Defense', moves: '1. e4 c5' },
                { name: 'Ruy Lopez', moves: '1. e4 e5 2. Nf3 Nc6 3. Bb5' },
                { name: 'Queen\'s Gambit', moves: '1. d4 d5 2. c4' },
              ].map((opening) => (
                <button
                  key={opening.name}
                  className="w-full text-left p-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-2xl border border-zinc-700/50 transition-all group"
                >
                  <div className="text-sm font-bold text-zinc-200 group-hover:text-white mb-1">{opening.name}</div>
                  <div className="text-[10px] font-mono text-zinc-500">{opening.moves}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
