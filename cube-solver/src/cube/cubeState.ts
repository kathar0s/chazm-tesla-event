// Cube state engine. cubejs is used as the authoritative move engine and
// facelet representation, so move application and the optimal solver stay
// perfectly consistent.

import Cube from 'cubejs';
import type { Face, Move } from './notation';

/** 54-char facelet string, face order U R F D L B, letters = home face. */
export type Facelet = string;

export const SOLVED: Facelet =
  'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';

const FACE_ORDER: Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];

export function isSolved(facelet: Facelet): boolean {
  return facelet === SOLVED;
}

/** Apply a sequence of moves to a facelet, returning the new facelet. */
export function applyMoves(facelet: Facelet, moves: Move[] | string): Facelet {
  const cube = Cube.fromString(facelet);
  const alg = Array.isArray(moves) ? moves.join(' ') : moves;
  if (alg.trim()) cube.move(alg);
  return cube.asString();
}

const FACES: Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];
const MODS = ['', "'", '2'];

/**
 * Produce a random scramble and the resulting facelet. We generate random
 * face turns directly (avoiding consecutive same-face moves) so this does not
 * depend on the heavy Kociemba solver tables.
 */
export function scramble(length = 25): { moves: string; facelet: Facelet } {
  const seq: string[] = [];
  let last = '';
  while (seq.length < length) {
    const face = FACES[(Math.random() * FACES.length) | 0];
    if (face === last) continue;
    last = face;
    seq.push(face + MODS[(Math.random() * MODS.length) | 0]);
  }
  const moves = seq.join(' ');
  return { moves, facelet: applyMoves(SOLVED, moves) };
}

/**
 * Lightweight structural validation of a manually entered facelet:
 * correct length, fixed centres, and exactly nine of each colour. This
 * catches typical input mistakes; full solvability is reported by the solver.
 */
export function validateFacelet(facelet: Facelet): { ok: boolean; error?: string } {
  if (facelet.length !== 54) return { ok: false, error: '면이 54칸이 아닙니다.' };
  const counts: Record<string, number> = {};
  for (const ch of facelet) counts[ch] = (counts[ch] ?? 0) + 1;
  for (const f of FACE_ORDER) {
    if (counts[f] !== 9) return { ok: false, error: `${f}색이 9칸이 아닙니다 (${counts[f] ?? 0}칸).` };
  }
  const centers = [4, 13, 22, 31, 40, 49];
  for (let i = 0; i < 6; i++) {
    if (facelet[centers[i]] !== FACE_ORDER[i]) {
      return { ok: false, error: '가운데(센터) 색이 표준과 다릅니다.' };
    }
  }
  return { ok: true };
}
