import React from 'react';
import { motion } from 'motion/react';

interface EvaluationBarProps {
  evaluation: number; // Positive for white, negative for black
  isFlipped?: boolean;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({ evaluation, isFlipped }) => {
  // Clamp evaluation to [-5, 5] for visual representation
  const clampedEval = Math.max(-5, Math.min(5, evaluation));
  const percentage = ((clampedEval + 5) / 10) * 100;
  
  // If flipped, black is on top, white on bottom
  const whitePercentage = isFlipped ? 100 - percentage : percentage;

  return (
    <div className="relative w-2 h-full bg-zinc-800 rounded-full overflow-hidden flex flex-col">
      <motion.div
        initial={false}
        animate={{ height: `${100 - whitePercentage}%` }}
        className="w-full bg-zinc-900 transition-all duration-500"
      />
      <motion.div
        initial={false}
        animate={{ height: `${whitePercentage}%` }}
        className="w-full bg-white transition-all duration-500"
      />
      
      {/* Eval Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-between py-2 pointer-events-none">
        <span className={whitePercentage < 50 ? "text-[8px] font-bold text-white" : "text-[8px] font-bold text-black"}>
          {evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1)}
        </span>
      </div>
    </div>
  );
};
