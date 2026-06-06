import { create } from 'zustand';
import { SOLVED, applyMoves, isSolved, scramble as makeScramble } from '../cube/cubeState';
import type { Facelet } from '../cube/cubeState';
import type { Move, Face } from '../cube/notation';
import { detectPatterns, type SolveStep } from '../patterns/detectPatterns';
import { solve, type SolveMode } from '../solver';

export type Phase = 'input' | 'play';

interface AppState {
  phase: Phase;
  mode: SolveMode;

  /** State the cube is currently displaying. */
  facelet: Facelet;
  /** State captured when solving began (start of playback). */
  scrambleFacelet: Facelet;

  rawMoves: Move[];
  steps: SolveStep[];
  /** Number of raw moves already applied (playback progress). */
  cursor: number;
  /** Moves waiting to be animated, front first. */
  queue: Move[];

  solving: boolean;
  error: string | null;

  // actions
  setMode: (mode: SolveMode) => void;
  paintSticker: (index: number, face: Face) => void;
  setFacelet: (facelet: Facelet) => void;
  randomScramble: () => void;
  reset: () => void;
  startSolve: () => Promise<void>;
  backToInput: () => void;
  /** Queue the next step's moves for animation. */
  playNextStep: () => void;
  /** Jump (snap, no animation) to the boundary after `stepIndex` steps. */
  gotoStep: (stepIndex: number) => void;
  /** Called by the 3D scene when one queued move finishes animating. */
  completeMove: () => void;
}

/** Cumulative raw-move count at the end of each step. */
function stepEnds(steps: SolveStep[]): number[] {
  const ends: number[] = [];
  let n = 0;
  for (const s of steps) {
    n += s.moves.length;
    ends.push(n);
  }
  return ends;
}

export const useStore = create<AppState>((set, get) => ({
  phase: 'input',
  mode: 'beginner',
  facelet: SOLVED,
  scrambleFacelet: SOLVED,
  rawMoves: [],
  steps: [],
  cursor: 0,
  queue: [],
  solving: false,
  error: null,

  setMode: (mode) => set({ mode }),

  paintSticker: (index, face) =>
    set((s) => {
      const arr = s.facelet.split('');
      arr[index] = face;
      return { facelet: arr.join(''), error: null };
    }),

  setFacelet: (facelet) => set({ facelet, error: null }),

  randomScramble: () => set({ facelet: makeScramble().facelet, error: null }),

  reset: () => set({ facelet: SOLVED, error: null }),

  startSolve: async () => {
    const { facelet, mode } = get();
    set({ solving: true, error: null });
    try {
      const rawMoves = await solve(facelet, mode);
      const steps = detectPatterns(rawMoves);
      set({
        phase: 'play',
        scrambleFacelet: facelet,
        rawMoves,
        steps,
        cursor: 0,
        queue: [],
        solving: false,
      });
    } catch (err) {
      set({
        solving: false,
        error:
          err instanceof Error
            ? `풀이를 계산하지 못했습니다. 색이 올바른지 확인해 주세요. (${err.message})`
            : '풀이를 계산하지 못했습니다.',
      });
    }
  },

  backToInput: () => set({ phase: 'input', queue: [] }),

  playNextStep: () => {
    const { steps, cursor, queue } = get();
    if (queue.length > 0) return; // wait for current animation
    const ends = stepEnds(steps);
    const doneSteps = ends.filter((e) => e <= cursor).length;
    if (doneSteps >= steps.length) return;
    set({ queue: [...steps[doneSteps].moves] });
  },

  gotoStep: (stepIndex) => {
    const { steps, scrambleFacelet } = get();
    const ends = stepEnds(steps);
    const target = stepIndex <= 0 ? 0 : ends[stepIndex - 1] ?? 0;
    const moves = get().rawMoves.slice(0, target);
    set({ facelet: applyMoves(scrambleFacelet, moves), cursor: target, queue: [] });
  },

  completeMove: () =>
    set((s) => {
      if (s.queue.length === 0) return {};
      const [move, ...rest] = s.queue;
      return {
        facelet: applyMoves(s.facelet, [move]),
        cursor: s.cursor + 1,
        queue: rest,
      };
    }),
}));

export function currentStepIndex(steps: SolveStep[], cursor: number): number {
  let n = 0;
  let i = 0;
  for (const s of steps) {
    if (n >= cursor) break;
    n += s.moves.length;
    i++;
  }
  return i;
}

export function isFaceletSolved(facelet: Facelet): boolean {
  return isSolved(facelet);
}
