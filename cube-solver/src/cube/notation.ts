// Move notation utilities. We only deal with the 18 face turns that both
// solvers emit: U D R L F B, each optionally suffixed with ' (counter-clockwise)
// or 2 (half turn).

export type Face = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';
export type Move = string; // e.g. "R", "R'", "R2", "M", "r'", "x"

// Face turns (URFDLB), slice turns (MES), wide turns (lowercase rludfb) and
// whole-cube rotations (xyz). The beginner solver emits slice and wide turns.
const MOVE_RE = /^([URFDLBMESrludfbxyz])(['2]?)$/;

export function isMove(token: string): token is Move {
  return MOVE_RE.test(token);
}

export function parseMoves(alg: string): Move[] {
  return alg
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter(isMove);
}

export function moveFace(move: Move): Face {
  return move[0] as Face;
}

/** Returns the inverse of a single move. */
export function invertMove(move: Move): Move {
  const face = move[0];
  const mod = move.slice(1);
  if (mod === '2') return move; // self-inverse
  return mod === "'" ? face : face + "'";
}

/** Normalises the word notation emitted by rubiks-cube-solver to standard
 * notation: "Rprime" -> "R'", "U2" stays "U2", "F" stays "F". */
export function normalizeWordNotation(alg: string): Move[] {
  return alg
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/prime$/i, "'"))
    .filter(isMove);
}

const FACE_NAMES_KO: Record<Face, string> = {
  U: '윗면',
  D: '아랫면',
  R: '오른쪽',
  L: '왼쪽',
  F: '앞면',
  B: '뒷면',
};

const SLICE_NAMES_KO: Record<string, string> = {
  M: '가운데 세로줄',
  E: '가운데 가로줄',
  S: '가운데 앞줄',
  r: '오른쪽 두 겹',
  l: '왼쪽 두 겹',
  u: '윗면 두 겹',
  d: '아랫면 두 겹',
  f: '앞면 두 겹',
  b: '뒷면 두 겹',
  x: '큐브 전체 (R방향)',
  y: '큐브 전체 (U방향)',
  z: '큐브 전체 (F방향)',
};

/** Human-friendly Korean description of a single move, e.g. "오른쪽 시계방향". */
export function moveToHuman(move: Move): string {
  const base = move[0];
  const name = (FACE_NAMES_KO as Record<string, string>)[base] ?? SLICE_NAMES_KO[base] ?? base;
  const mod = move.slice(1);
  if (mod === '2') return `${name} 180°`;
  if (mod === "'") return `${name} 반시계`;
  return `${name} 시계방향`;
}
