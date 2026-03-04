import React from 'react';
import { motion } from 'motion/react';
import { Chess, Square } from 'chess.js';
import { GameState } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useGameStore } from '../store/useGameStore';
import { PromotionModal } from './PromotionModal';
import { EvaluationBar } from './EvaluationBar';
import { ChessTimer } from './ChessTimer';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const THEMES = {
  classic: {
    dark: "bg-[#779556]",
    light: "bg-[#ebecd0]",
    lastMove: "bg-yellow-100/40",
    selected: "bg-yellow-200/60",
  },
  wood: {
    dark: "bg-[#b58863]",
    light: "bg-[#f0d9b5]",
    lastMove: "bg-orange-200/40",
    selected: "bg-orange-300/60",
  },
  dark: {
    dark: "bg-[#4b7399]",
    light: "bg-[#eae9d2]",
    lastMove: "bg-blue-200/40",
    selected: "bg-blue-300/60",
  }
};

interface ChessBoardProps {
  gameState: GameState;
  onMove: (from: string, to: string, promotion?: string) => void;
  disabled?: boolean;
  viewMode?: '2d' | '3d';
  isFlipped?: boolean;
}

const PIECE_IMAGES_2D: Record<string, string> = {
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

const PIECE_IMAGES_3D: Record<string, string> = {
  wP: 'https://images.chesscomfiles.com/chess-themes/pieces/3d_plastic/150/wp.png',
  wN: 'https://images.chesscomfiles.com/chess-themes/pieces/3d_plastic/150/wn.png',
  wB: 'https://images.chesscomfiles.com/chess-themes/pieces/3d_plastic/150/wb.png',
  wR: 'https://images.chesscomfiles.com/chess-themes/pieces/3d_plastic/150/wr.png',
  wQ: 'https://images.chesscomfiles.com/chess-themes/pieces/3d_plastic/150/wq.png',
  wK: 'https://images.chesscomfiles.com/chess-themes/pieces/3d_plastic/150/wk.png',
  bP: 'https://images.chesscomfiles.com/chess-themes/pieces/3d_plastic/150/bp.png',
  bN: 'https://images.chesscomfiles.com/chess-themes/pieces/3d_plastic/150/bn.png',
  bB: 'https://images.chesscomfiles.com/chess-themes/pieces/3d_plastic/150/bb.png',
  bR: 'https://images.chesscomfiles.com/chess-themes/pieces/3d_plastic/150/br.png',
  bQ: 'https://images.chesscomfiles.com/chess-themes/pieces/3d_plastic/150/bq.png',
  bK: 'https://images.chesscomfiles.com/chess-themes/pieces/3d_plastic/150/bk.png',
};

export const ChessBoard: React.FC<ChessBoardProps> = ({ gameState, onMove, disabled, viewMode = '2d', isFlipped = false }) => {
  const [selectedSquare, setSelectedSquare] = React.useState<string | null>(null);
  const [validMoves, setValidMoves] = React.useState<string[]>([]);
  const setPendingPromotion = useGameStore(state => state.setPendingPromotion);
  
  const game = React.useMemo(() => new Chess(gameState.fen), [gameState.fen]);
  const board = isFlipped ? [...game.board()].reverse().map(row => [...row].reverse()) : game.board();
  const theme = THEMES[gameState.theme || 'classic'];

  // Sound effects
  const playSound = (type: 'move' | 'capture' | 'check' | 'mate') => {
    const sounds = {
      move: 'https://images.chesscomfiles.com/chess-themes/pieces/base/sounds/move-self.mp3',
      capture: 'https://images.chesscomfiles.com/chess-themes/pieces/base/sounds/capture.mp3',
      check: 'https://images.chesscomfiles.com/chess-themes/pieces/base/sounds/move-check.mp3',
      mate: 'https://images.chesscomfiles.com/chess-themes/pieces/base/sounds/game-end.mp3',
    };
    const audio = new Audio(sounds[type]);
    audio.play().catch(() => {});

    // Vibration for mobile
    if (navigator.vibrate) {
      navigator.vibrate(type === 'mate' ? [100, 50, 100] : 20);
    }
  };

  React.useEffect(() => {
    if (gameState.lastMove) {
      const isCapture = gameState.history[gameState.history.length - 1]?.includes('x');
      if (gameState.status === 'checkmate') playSound('mate');
      else if (gameState.isCheck) playSound('check');
      else if (isCapture) playSound('capture');
      else playSound('move');
    }
  }, [gameState.fen]);

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
          setPendingPromotion({ from: selectedSquare, to: square });
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

  const handleDragStart = (e: React.DragEvent, square: string) => {
    if (disabled) return;
    const piece = game.get(square as Square);
    if (piece && piece.color === gameState.turn) {
      e.dataTransfer.setData('sourceSquare', square);
      setSelectedSquare(square);
      const moves = game.moves({ square: square as Square, verbose: true });
      setValidMoves(moves.map(m => m.to));
      
      // Create a ghost image or just let it be
      const img = new Image();
      img.src = pieceImages[`${piece.color}${piece.type.toUpperCase()}`];
      e.dataTransfer.setDragImage(img, 25, 25);
    }
  };

  const handleDrop = (e: React.DragEvent, targetSquare: string) => {
    e.preventDefault();
    if (disabled) return;
    const sourceSquare = e.dataTransfer.getData('sourceSquare');
    if (sourceSquare && sourceSquare !== targetSquare) {
      const move = game.moves({ square: sourceSquare as Square, verbose: true })
        .find(m => m.to === targetSquare);

      if (move) {
        if (move.flags.includes('p')) {
          setPendingPromotion({ from: sourceSquare, to: targetSquare });
        } else {
          onMove(sourceSquare, targetSquare);
        }
      }
    }
    setSelectedSquare(null);
    setValidMoves([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const pieceImages = viewMode === '3d' ? PIECE_IMAGES_3D : PIECE_IMAGES_2D;
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const displayLetters = isFlipped ? [...letters].reverse() : letters;
  const numbers = [8, 7, 6, 5, 4, 3, 2, 1];
  const displayNumbers = isFlipped ? [...numbers].reverse() : numbers;

  return (
    <div className="relative flex flex-col gap-4 w-full max-w-[680px]">
      {/* Opponent Timer & Info */}
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <span className="text-zinc-400 font-bold">{isFlipped ? 'W' : 'B'}</span>
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-300">{isFlipped ? 'Player 1' : 'Opponent'}</div>
            <div className="text-[10px] text-zinc-500 font-mono">Rating: 1500</div>
          </div>
        </div>
        <ChessTimer 
          time={isFlipped ? gameState.timer.w : gameState.timer.b} 
          isActive={gameState.timer.isActive && gameState.turn === (isFlipped ? 'w' : 'b')}
          isLowTime={(isFlipped ? gameState.timer.w : gameState.timer.b) < 30}
          side="top"
        />
      </div>

      <div className="relative flex gap-4 w-full p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
        <EvaluationBar evaluation={gameState.evaluation} isFlipped={isFlipped} />
        
        <div className="flex-1">
        <PromotionModal />
        {/* Top Letters */}
      <div className="grid grid-cols-8 ml-6 mr-6 h-6 items-center">
        {displayLetters.map(letter => (
          <span key={letter} className="text-[10px] font-bold text-zinc-600 text-center uppercase tracking-widest">{letter}</span>
        ))}
      </div>

      <div className="flex">
        {/* Left Numbers */}
        <div className="flex flex-col justify-around w-6 py-2">
          {displayNumbers.map(num => (
            <span key={num} className="text-[10px] font-bold text-zinc-600 text-center">{num}</span>
          ))}
        </div>

        {/* The Board */}
        <div className="relative aspect-square flex-1 border-2 border-zinc-800 rounded-sm overflow-hidden bg-zinc-900">
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
            {board.map((row, i) =>
              row.map((piece, j) => {
                const square = isFlipped 
                  ? `${String.fromCharCode(104 - j)}${1 + i}`
                  : `${String.fromCharCode(97 + j)}${8 - i}`;
                const isDark = isFlipped ? (i + j) % 2 === 1 : (i + j) % 2 === 1; // Actually it's the same
                const isSelected = selectedSquare === square;
                const isValidMove = validMoves.includes(square);
                const isLastMove = gameState.lastMove && (gameState.lastMove.from === square || gameState.lastMove.to === square);
                const isCheck = gameState.isCheck && piece?.type === 'k' && piece?.color === gameState.turn;

                return (
                    <div
                      key={square}
                      onClick={() => handleSquareClick(square)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, square)}
                      className={cn(
                        "relative flex items-center justify-center cursor-pointer transition-colors duration-200",
                        isDark ? theme.dark : theme.light,
                        isSelected && theme.selected,
                        isLastMove && !isSelected && theme.lastMove,
                        isCheck && "bg-red-500/60"
                      )}
                    >
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
                        src={pieceImages[`${piece.color}${piece.type.toUpperCase()}`]}
                        alt={`${piece.color} ${piece.type}`}
                        draggable={!disabled && piece.color === gameState.turn}
                        onDragStart={(e) => handleDragStart(e, square)}
                        className={cn(
                          "z-20 select-none",
                          viewMode === '3d' ? "w-[95%] h-[95%] -translate-y-1 drop-shadow-xl" : "w-[85%] h-[85%]"
                        )}
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

        {/* Right Numbers */}
        <div className="flex flex-col justify-around w-6 py-2">
          {displayNumbers.map(num => (
            <span key={num} className="text-[10px] font-bold text-zinc-600 text-center">{num}</span>
          ))}
        </div>
      </div>

      {/* Bottom Letters */}
      <div className="grid grid-cols-8 ml-6 mr-6 h-6 items-center">
        {displayLetters.map(letter => (
          <span key={letter} className="text-[10px] font-bold text-zinc-600 text-center uppercase tracking-widest">{letter}</span>
        ))}
      </div>
    </div>
  </div>

  {/* Player Timer & Info */}
  <div className="flex items-center justify-between px-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
        <span className="text-zinc-400 font-bold">{isFlipped ? 'B' : 'W'}</span>
      </div>
      <div>
        <div className="text-sm font-bold text-zinc-300">{isFlipped ? 'Opponent' : 'You'}</div>
        <div className="text-[10px] text-zinc-500 font-mono">Rating: 1500</div>
      </div>
    </div>
    <ChessTimer 
      time={isFlipped ? gameState.timer.b : gameState.timer.w} 
      isActive={gameState.timer.isActive && gameState.turn === (isFlipped ? 'b' : 'w')}
      isLowTime={(isFlipped ? gameState.timer.b : gameState.timer.w) < 30}
      side="bottom"
    />
  </div>
</div>
);
};
