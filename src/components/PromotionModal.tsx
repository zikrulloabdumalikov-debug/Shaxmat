import React from 'react';
import { motion } from 'motion/react';

interface PromotionModalProps {
  color: 'w' | 'b';
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onClose: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ color, onSelect, onClose }) => {
  const pieces = ['q', 'r', 'b', 'n'] as const;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#262421] p-4 rounded-xl shadow-2xl border border-white/10 flex gap-4"
      >
        {pieces.map((piece) => (
          <button
            key={piece}
            onClick={() => onSelect(piece)}
            className="w-16 h-16 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <img
              src={`https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${color}${piece}.png`}
              alt={piece}
              className="w-14 h-14 object-contain"
            />
          </button>
        ))}
      </motion.div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};
