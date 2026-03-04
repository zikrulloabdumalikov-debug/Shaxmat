// Simple Zobrist hashing implementation for position hashing
// This is a simplified version for demonstration

const ZOBRIST_KEYS: Record<string, number> = {};

function randomInt() {
  return Math.floor(Math.random() * 4294967296);
}

function initZobrist() {
  const pieces = ['p', 'n', 'b', 'r', 'q', 'k', 'P', 'N', 'B', 'R', 'Q', 'K'];
  for (let i = 0; i < 64; i++) {
    for (const piece of pieces) {
      ZOBRIST_KEYS[`${i}-${piece}`] = randomInt();
    }
  }
  ZOBRIST_KEYS['blackMove'] = randomInt();
  // Add castling and en passant keys as needed
}

initZobrist();

export function computeHash(fen: string): number {
  let hash = 0;
  const [position, turn] = fen.split(' ');
  
  let square = 0;
  for (let i = 0; i < position.length; i++) {
    const char = position[i];
    if (char === '/') continue;
    
    if (/\d/.test(char)) {
      square += parseInt(char);
    } else {
      const key = ZOBRIST_KEYS[`${square}-${char}`];
      if (key) hash ^= key;
      square++;
    }
  }

  if (turn === 'b') {
    hash ^= ZOBRIST_KEYS['blackMove'];
  }

  return hash;
}
