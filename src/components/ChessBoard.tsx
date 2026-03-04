import React, { useState, useEffect } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { useGameStore } from '../store/useGameStore';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { PromotionModal } from './PromotionModal';
import { EvaluationBar } from './EvaluationBar';
import { ChessTimer } from './ChessTimer';

interface ChessBoardProps {
  chess: Chess;
  onMove: (move: { from: string; to: string; promotion?: string }) => boolean;
  isThinking: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({ chess, onMove, isThinking }) => {
  const { boardTheme, showLegalMoves, soundEnabled, gameState, whiteTime, blackTime } = useGameStore();
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Move[]>([]);
  const [promotionMove, setPromotionMove] = useState<{ from: string; to: string } | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  useEffect(() => {
    const history = chess.history({ verbose: true });
    if (history.length > 0) {
      const last = history[history.length - 1];
      setLastMove({ from: last.from, to: last.to });
    } else {
      setLastMove(null);
    }
  }, [chess, gameState.fen]);

  const playSound = (moveType: 'move' | 'capture' | 'check' | 'castle' | 'promote') => {
    if (!soundEnabled) return;
    // Placeholder for sound logic - in a real app, use Audio API
    // const audio = new Audio(`/sounds/${moveType}.mp3`);
    // audio.play().catch(() => {});
  };

  const handleSquareClick = (square: Square) => {
    // If waiting for promotion, ignore clicks
    if (promotionMove) return;

    // If clicking the same square, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    // If a square is already selected, try to move
    if (selectedSquare) {
      const moveAttempt = {
        from: selectedSquare,
        to: square,
        promotion: 'q', // Default to queen for validation check
      };

      // Check if move is valid (including promotion)
      const moves = chess.moves({ verbose: true });
      const validMove = moves.find(m => m.from === selectedSquare && m.to === square);

      if (validMove) {
        if (validMove.promotion) {
          setPromotionMove({ from: selectedSquare, to: square });
          return;
        }

        const success = onMove(moveAttempt);
        if (success) {
          playSound(chess.isCheck() ? 'check' : (chess.get(square) ? 'capture' : 'move'));
          setSelectedSquare(null);
          setPossibleMoves([]);
          return;
        }
      }
    }

    // Select new square
    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      if (showLegalMoves) {
        const moves = chess.moves({ square, verbose: true });
        setPossibleMoves(moves);
      }
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const handlePromotion = (piece: 'q' | 'r' | 'b' | 'n') => {
    if (promotionMove) {
      onMove({ ...promotionMove, promotion: piece });
      setPromotionMove(null);
      setSelectedSquare(null);
      setPossibleMoves([]);
      playSound('promote');
    }
  };

  const getPieceImage = (piece: { type: string; color: string } | null) => {
    if (!piece) return null;
    const fileName = `${piece.color}${piece.type.toUpperCase()}.png`;
    // Using a public chess piece set (e.g., from Wikimedia or a CDN)
    // For this example, we'll assume local assets or a reliable CDN
    return `https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${piece.color}${piece.type}.png`;
  };

  const board = chess.board();
  const isFlipped = false; // Can be added to store if user wants to flip board

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div className="w-full flex justify-between items-center px-4">
        <ChessTimer color="b" time={blackTime} isActive={gameState.turn === 'b'} />
        <div className="text-white/60 text-sm font-mono">Opponent (AI)</div>
      </div>

      <div className="relative flex">
        <EvaluationBar score={0.5} /> {/* Placeholder score */}
        
        <div className="relative w-[min(80vw,600px)] h-[min(80vw,600px)] bg-[#262421] rounded-lg shadow-2xl overflow-hidden border-4 border-[#302e2b]">
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
            {(isFlipped ? [...board].reverse() : board).map((row, rowIndex) =>
              (isFlipped ? [...row].reverse() : row).map((piece, colIndex) => {
                const actualRow = isFlipped ? 7 - rowIndex : rowIndex;
                const actualCol = isFlipped ? 7 - colIndex : colIndex;
                const square = String.fromCharCode(97 + actualCol) + (8 - actualRow) as Square;
                const isBlack = (actualRow + actualCol) % 2 === 1;
                const isSelected = selectedSquare === square;
                const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
                const isPossibleMove = possibleMoves.some(m => m.to === square);
                const isCapture = isPossibleMove && piece;
                const isCheck = piece?.type === 'k' && piece.color === chess.turn() && chess.isCheck();

                return (
                  <div
                    key={square}
                    onClick={() => handleSquareClick(square)}
                    className={clsx(
                      'relative flex items-center justify-center w-full h-full transition-colors duration-100',
                      isBlack 
                        ? (boardTheme === 'glass' ? 'bg-white/10' : 'bg-[#769656]') 
                        : (boardTheme === 'glass' ? 'bg-white/5' : 'bg-[#eeeed2]'),
                      isSelected && 'bg-[#baca44]',
                      isLastMove && !isSelected && 'bg-[#f5f682]',
                      isCheck && 'bg-red-500/50 radial-gradient'
                    )}
                  >
                    {/* Rank/File Labels */}
                    {colIndex === 0 && (
                      <span className={clsx("absolute top-0.5 left-0.5 text-[10px] font-bold", isBlack ? "text-[#eeeed2]" : "text-[#769656]")}>
                        {8 - actualRow}
                      </span>
                    )}
                    {rowIndex === 7 && (
                      <span className={clsx("absolute bottom-0.5 right-0.5 text-[10px] font-bold", isBlack ? "text-[#eeeed2]" : "text-[#769656]")}>
                        {String.fromCharCode(97 + actualCol)}
                      </span>
                    )}

                    {/* Move Indicators */}
                    {isPossibleMove && !isCapture && (
                      <div className="absolute w-1/3 h-1/3 bg-black/10 rounded-full" />
                    )}
                    {isCapture && (
                      <div className="absolute w-full h-full border-4 border-black/10 rounded-full" />
                    )}

                    {/* Piece */}
                    <AnimatePresence>
                      {piece && (
                        <motion.img
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          src={getPieceImage(piece)}
                          alt={`${piece.color} ${piece.type}`}
                          className="w-[90%] h-[90%] object-contain z-10 cursor-pointer hover:scale-105 transition-transform"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {promotionMove && (
            <PromotionModal
              color={chess.turn()}
              onSelect={handlePromotion}
              onClose={() => setPromotionMove(null)}
            />
          )}
        </div>
      </div>

      <div className="w-full flex justify-between items-center px-4">
        <ChessTimer color="w" time={whiteTime} isActive={gameState.turn === 'w'} />
        <div className="text-white/60 text-sm font-mono">You</div>
      </div>
    </div>
  );
};
