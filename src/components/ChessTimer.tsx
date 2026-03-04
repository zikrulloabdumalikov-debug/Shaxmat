import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChessTimerProps {
  time: number;
  isActive: boolean;
  isLowTime: boolean;
  side: 'top' | 'bottom';
}

export const ChessTimer: React.FC<ChessTimerProps> = ({ time, isActive, isLowTime, side }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    
    if (seconds < 10) {
      return `${secs}.${ms}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "px-4 py-2 rounded-lg font-mono text-xl font-bold transition-all duration-300 border-2",
      isActive 
        ? (isLowTime ? "bg-red-900/40 border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "bg-zinc-800 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]")
        : "bg-zinc-900 border-zinc-800 text-zinc-500"
    )}>
      {formatTime(time)}
    </div>
  );
};
