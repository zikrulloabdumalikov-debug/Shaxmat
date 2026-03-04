import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../store/useGameStore';

export const PromotionModal: React.FC = () => {
  const { gameState, setPendingPromotion, makeMove } = useGameStore();
  const { pendingPromotion, turn } = gameState;

  if (!pendingPromotion) return null;

  const pieces = [
    { type: 'q', label: 'Queen' },
    { type: 'r', label: 'Rook' },
    { type: 'b', label: 'Bishop' },
    { type: 'n', label: 'Knight' },
  ];

  const handleSelect = (promotion: string) => {
    makeMove({
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion,
    });
    setPendingPromotion(null);
  };

  const pieceImages: Record<string, string> = {
    wq: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
    wr: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
    wb: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
    wn: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
    bq: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
    br: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
    bb: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
    bn: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-lg"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-700 p-4 rounded-2xl shadow-2xl flex gap-3"
        >
          {pieces.map((piece) => (
            <button
              key={piece.type}
              onClick={() => handleSelect(piece.type)}
              className="w-16 h-16 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all border border-zinc-700/50 hover:border-emerald-500/50 group"
            >
              <img
                src={pieceImages[`${turn}${piece.type}`]}
                alt={piece.label}
                className="w-12 h-12 group-hover:scale-110 transition-transform"
              />
            </button>
          ))}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
