import React from 'react';
import { motion } from 'motion/react';
import { Chess, Square } from 'chess.js';
import { GameState } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChessBoardProps {
  gameState: GameState;
  onMove: (from: string, to: string, promotion?: string) => void;
  disabled?: boolean;
}

const PIECE_IMAGES: Record<string, string> = {
  wP: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  wN: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
  wB: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
  wR: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
  wQ: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
  wK: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
  bP: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
  bN: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
  bB: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
  bR: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
  bQ: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
  bK: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
};

export const ChessBoard: React.FC<ChessBoardProps> = ({ gameState, onMove, disabled }) => {
  const [selectedSquare, setSelectedSquare] = React.useState<string | null>(null);
  const [validMoves, setValidMoves] = React.useState<string[]>([]);
  
  const game = React.useMemo(() => new Chess(gameState.fen), [gameState.fen]);
  const board = game.board();

  const handleSquareClick = (square: string) => {
    if (disabled) return;

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    // If a square is already selected, try to move
    if (selectedSquare) {
      const move = game.moves({ square: selectedSquare as Square, verbose: true })
        .find(m => m.to === square);

      if (move) {
        // Check for promotion
        if (move.flags.includes('p')) {
          onMove(selectedSquare, square, 'q'); // Default to queen for now
        } else {
          onMove(selectedSquare, square);
        }
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }
    }

    // Select new square if it has a piece of the current turn's color
    const piece = game.get(square as Square);
    if (piece && piece.color === gameState.turn) {
      setSelectedSquare(square);
      const moves = game.moves({ square: square as Square, verbose: true });
      setValidMoves(moves.map(m => m.to));
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  return (
    <div className="relative aspect-square w-full max-w-[600px] border-4 border-zinc-800 rounded-lg overflow-hidden shadow-2xl bg-zinc-900">
      <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
        {board.map((row, i) =>
          row.map((piece, j) => {
            const square = `${String.fromCharCode(97 + j)}${8 - i}`;
            const isDark = (i + j) % 2 === 1;
            const isSelected = selectedSquare === square;
            const isValidMove = validMoves.includes(square);
            const isLastMove = gameState.lastMove && (gameState.lastMove.from === square || gameState.lastMove.to === square);
            const isCheck = gameState.isCheck && piece?.type === 'k' && piece?.color === gameState.turn;

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                className={cn(
                  "relative flex items-center justify-center cursor-pointer transition-colors duration-200",
                  isDark ? "bg-[#779556]" : "bg-[#ebecd0]",
                  isSelected && "bg-yellow-200/60",
                  isLastMove && !isSelected && "bg-yellow-100/40",
                  isCheck && "bg-red-500/60"
                )}
              >
                {/* Square Coordinate Labels */}
                {j === 0 && (
                  <span className={cn(
                    "absolute top-0.5 left-0.5 text-[10px] font-bold",
                    isDark ? "text-[#ebecd0]" : "text-[#779556]"
                  )}>
                    {8 - i}
                  </span>
                )}
                {i === 7 && (
                  <span className={cn(
                    "absolute bottom-0.5 right-0.5 text-[10px] font-bold",
                    isDark ? "text-[#ebecd0]" : "text-[#779556]"
                  )}>
                    {String.fromCharCode(97 + j)}
                  </span>
                )}

                {/* Valid Move Indicator */}
                {isValidMove && (
                  <div className={cn(
                    "absolute z-10 rounded-full",
                    piece ? "w-full h-full border-4 border-black/10" : "w-3 h-3 bg-black/10"
                  )} />
                )}

                {/* Piece */}
                {piece && (
                  <motion.img
                    layoutId={piece.type + piece.color + i + j}
                    src={PIECE_IMAGES[`${piece.color}${piece.type.toUpperCase()}`]}
                    alt={`${piece.color} ${piece.type}`}
                    className="w-[85%] h-[85%] z-20 select-none pointer-events-none"
                    initial={false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
