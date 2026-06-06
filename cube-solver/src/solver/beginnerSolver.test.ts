import { describe, it, expect } from 'vitest';
import { SOLVED, applyMoves, isSolved, scramble } from '../cube/cubeState';
import { solveBeginner, toBeginnerInput } from './beginnerSolver';

describe('beginner solver', () => {
  it('converter matches the rubiks-cube-solver README ground-truth vector', () => {
    const scrambled = applyMoves(SOLVED, "R' U L B U F L2 D R D U' R");
    const expected = 'flulfbddrrudrruddldbbburrfbllffdrubfrludlubrflubfbfudl';
    expect(toBeginnerInput(scrambled)).toBe(expected);
  });

  it('solves random scrambles end-to-end', () => {
    for (let i = 0; i < 10; i++) {
      const { facelet } = scramble();
      const moves = solveBeginner(facelet);
      expect(moves.length).toBeGreaterThan(0);
      expect(isSolved(applyMoves(facelet, moves))).toBe(true);
    }
  });
});
