import type { Move } from '../cube/notation';
import type { Facelet } from '../cube/cubeState';
import { solveOptimal } from './optimalSolver';
import { solveBeginner } from './beginnerSolver';

export type SolveMode = 'optimal' | 'beginner';

export const SOLVE_MODE_LABELS: Record<SolveMode, { title: string; subtitle: string }> = {
  optimal: { title: '최단 해법', subtitle: '가장 적은 수로 (약 20수)' },
  beginner: { title: '쉬운 해법', subtitle: '외우기 쉬운 공식 위주' },
};

/** Solve a facelet with the chosen method. Always async (optimal uses a worker). */
export async function solve(facelet: Facelet, mode: SolveMode): Promise<Move[]> {
  if (mode === 'optimal') return solveOptimal(facelet);
  return solveBeginner(facelet);
}

export { solveOptimal, solveBeginner };
