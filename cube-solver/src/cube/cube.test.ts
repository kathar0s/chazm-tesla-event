import { describe, it, expect } from 'vitest';
import { SOLVED, applyMoves, isSolved, validateFacelet, scramble } from './cubeState';
import { geometricApplyMove } from './geometry';
import { STICKERS } from './facelets';
import { invertMove, parseMoves } from './notation';

const ALL_MOVES = ['U', "U'", 'U2', 'D', "D'", 'R', "R'", 'F', "F'", 'L', "L'", 'B', "B'"];

// Every turn the solvers can emit: faces, slices, wide turns, rotations.
const EXTENDED_MOVES = [
  ...ALL_MOVES,
  'D2', 'R2', 'F2', 'L2', 'B2',
  'M', "M'", 'M2', 'E', "E'", 'E2', 'S', "S'", 'S2',
  'r', "r'", 'r2', 'l', "l'", 'u', "u'", 'd', "d'", 'f', "f'", 'b', "b'",
  'x', "x'", 'y', "y'", 'z', "z'",
];

function randomFacelet(): string {
  return applyMoves(SOLVED, Array.from({ length: 25 }, () => ALL_MOVES[(Math.random() * ALL_MOVES.length) | 0]));
}

describe('STICKERS geometry table', () => {
  it('has 54 stickers, 9 per face, unique positions', () => {
    expect(STICKERS).toHaveLength(54);
    const counts: Record<string, number> = {};
    const keys = new Set<string>();
    for (const s of STICKERS) {
      counts[s.face] = (counts[s.face] ?? 0) + 1;
      keys.add(`${s.pos.join(',')}|${s.normal.join(',')}`);
    }
    expect(keys.size).toBe(54);
    for (const f of ['U', 'R', 'F', 'D', 'L', 'B']) expect(counts[f]).toBe(9);
  });
});

describe('move engine (cubejs) vs geometry', () => {
  it('geometric move permutation matches cubejs for every move', () => {
    for (let trial = 0; trial < 20; trial++) {
      const f = randomFacelet();
      for (const m of EXTENDED_MOVES) {
        expect(geometricApplyMove(f, m), `move ${m}`).toBe(applyMoves(f, m));
      }
    }
  });

  it('a move followed by its inverse is the identity', () => {
    for (const m of ALL_MOVES) {
      const f = randomFacelet();
      expect(applyMoves(f, [m, invertMove(m)])).toBe(f);
    }
  });
});

describe('validation & scramble', () => {
  it('accepts the solved cube and rejects broken input', () => {
    expect(validateFacelet(SOLVED).ok).toBe(true);
    expect(validateFacelet('U'.repeat(54)).ok).toBe(false); // wrong counts
    expect(validateFacelet(SOLVED.slice(0, 53)).ok).toBe(false); // wrong length
  });

  it('scramble produces a valid, unsolved, solvable-shaped cube', () => {
    const { moves, facelet } = scramble();
    expect(validateFacelet(facelet).ok).toBe(true);
    expect(isSolved(facelet)).toBe(false);
    // undoing the scramble restores the solved cube
    const undo = parseMoves(moves).reverse().map(invertMove);
    expect(isSolved(applyMoves(facelet, undo))).toBe(true);
  });
});
