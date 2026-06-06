// Beginner-friendly solver using the layered Fridrich (CFOP) method from
// rubiks-cube-solver. Longer than optimal, but built from memorable algorithms.
import solver from 'rubiks-cube-solver';
import { normalizeWordNotation, type Move } from '../cube/notation';
import type { Facelet } from '../cube/cubeState';

/**
 * Convert our canonical facelet (cubejs order U R F D L B, home-face letters)
 * to the rubiks-cube-solver format (order F R U D L B, lower-case colour
 * letters). The two libraries share the exact same within-face reading order
 * and colour-letter convention, so this is just a face reorder + lower-case.
 * Verified against the worked example in rubiks-cube-solver's README.
 */
export function toBeginnerInput(facelet: Facelet): string {
  const U = facelet.slice(0, 9);
  const R = facelet.slice(9, 18);
  const F = facelet.slice(18, 27);
  const D = facelet.slice(27, 36);
  const L = facelet.slice(36, 45);
  const B = facelet.slice(45, 54);
  return (F + R + U + D + L + B).toLowerCase();
}

export function solveBeginner(facelet: Facelet): Move[] {
  const raw = solver(toBeginnerInput(facelet));
  return normalizeWordNotation(raw);
}
