import React from 'react';
import clsx from 'clsx';
import { Clock } from 'lucide-react';

interface ChessTimerProps {
  color: 'w' | 'b';
  time: number;
  isActive: boolean;
}

export const ChessTimer: React.FC<ChessTimerProps> = ({ color, time, isActive }) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const isLowTime = time < 30;

  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300',
        isActive
          ? (color === 'w' ? 'bg-white text-black shadow-lg scale-105' : 'bg-black text-white shadow-lg scale-105 border border-white/20')
          : 'bg-white/5 text-white/40'
      )}
    >
      <Clock size={16} className={clsx(isActive && 'animate-pulse')} />
      <span className={clsx('font-mono text-xl font-bold', isLowTime && isActive && 'text-red-500 animate-pulse')}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};
