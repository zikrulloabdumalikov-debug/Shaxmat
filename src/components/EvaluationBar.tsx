import React from 'react';
import { motion } from 'motion/react';

interface EvaluationBarProps {
  score: number; // -10 to 10, where positive is white advantage
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({ score }) => {
  // Clamp score between -5 and 5 for display purposes
  const clampedScore = Math.max(-5, Math.min(5, score));
  // Convert to percentage (0% = black winning, 100% = white winning)
  const percentage = ((clampedScore + 5) / 10) * 100;

  return (
    <div className="absolute -left-6 top-0 bottom-0 w-2 bg-[#302e2b] rounded-full overflow-hidden border border-white/10 hidden md:block">
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-white"
        initial={{ height: '50%' }}
        animate={{ height: `${percentage}%` }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      />
    </div>
  );
};
