// Greedy longest-match scan that collapses recognised triggers (and their
// consecutive repeats) into named steps, while keeping the raw moves so the
// notation can still be shown.
import type { Move } from '../cube/notation';
import { TRIGGERS_BY_LENGTH, type Trigger } from './triggers';

export interface SolveStep {
  /** All raw moves belonging to this step. */
  moves: Move[];
  /** Present when this step is a recognised trigger. */
  trigger?: Trigger;
  /** How many times the trigger repeats back-to-back (>=1). */
  repeat: number;
}

function matchesAt(moves: Move[], pattern: Move[], i: number): boolean {
  if (i + pattern.length > moves.length) return false;
  for (let k = 0; k < pattern.length; k++) {
    if (moves[i + k] !== pattern[k]) return false;
  }
  return true;
}

export function detectPatterns(moves: Move[]): SolveStep[] {
  const steps: SolveStep[] = [];
  let i = 0;
  while (i < moves.length) {
    let matched: Trigger | undefined;
    for (const trig of TRIGGERS_BY_LENGTH) {
      if (matchesAt(moves, trig.moves, i)) {
        matched = trig;
        break;
      }
    }
    if (matched) {
      const len = matched.moves.length;
      let repeat = 1;
      while (matchesAt(moves, matched.moves, i + repeat * len)) repeat++;
      steps.push({
        moves: moves.slice(i, i + repeat * len),
        trigger: matched,
        repeat,
      });
      i += repeat * len;
    } else {
      steps.push({ moves: [moves[i]], repeat: 1 });
      i += 1;
    }
  }
  return steps;
}

/** Short Korean label for a step, e.g. "트위스트 ×2" or "오른쪽 시계방향". */
import { moveToHuman } from '../cube/notation';
export function stepLabel(step: SolveStep): string {
  if (step.trigger) {
    return step.repeat > 1
      ? `${step.trigger.name} ×${step.repeat}`
      : `${step.trigger.name} 한 번`;
  }
  return moveToHuman(step.moves[0]);
}
