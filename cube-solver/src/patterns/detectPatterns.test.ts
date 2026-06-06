import { describe, it, expect } from 'vitest';
import { parseMoves } from '../cube/notation';
import { detectPatterns, stepLabel } from './detectPatterns';

describe('pattern detection', () => {
  it('collapses a single sexy move into a twist', () => {
    const steps = detectPatterns(parseMoves("R U R' U'"));
    expect(steps).toHaveLength(1);
    expect(steps[0].trigger?.name).toBe('트위스트');
    expect(steps[0].repeat).toBe(1);
    expect(stepLabel(steps[0])).toBe('트위스트 한 번');
  });

  it('counts consecutive repeats of a trigger', () => {
    const steps = detectPatterns(parseMoves("R U R' U' R U R' U'"));
    expect(steps).toHaveLength(1);
    expect(steps[0].repeat).toBe(2);
    expect(stepLabel(steps[0])).toBe('트위스트 ×2');
  });

  it('emits single moves when nothing matches', () => {
    const steps = detectPatterns(parseMoves('R2 D2'));
    expect(steps).toHaveLength(2);
    expect(steps[0].trigger).toBeUndefined();
    expect(steps.flatMap((s) => s.moves)).toEqual(['R2', 'D2']);
  });

  it('prefers the longest matching trigger (Sune over twist)', () => {
    const steps = detectPatterns(parseMoves("R U R' U R U2 R'"));
    expect(steps[0].trigger?.name).toBe('수네');
    expect(steps).toHaveLength(1);
  });
});
