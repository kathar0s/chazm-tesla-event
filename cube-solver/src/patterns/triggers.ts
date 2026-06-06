// Dictionary of well-known move sequences ("triggers"). The step player
// collapses these in the solution so the user thinks in terms of familiar
// patterns ("트위스트 한 번") instead of memorising raw notation.
import { parseMoves, type Move } from '../cube/notation';

export interface Trigger {
  /** Primary name shown to the user (the user's own vocabulary). */
  name: string;
  /** Standard nickname, shown as a hint. */
  alias: string;
  /** Canonical move sequence. */
  moves: Move[];
}

function t(name: string, alias: string, alg: string): Trigger {
  return { name, alias, moves: parseMoves(alg) };
}

// Ordered roughly long -> short; the detector sorts by length anyway, but
// keeping related variants together aids readability.
export const TRIGGERS: Trigger[] = [
  // The classic "sexy move" the user calls a twist, plus its common variants.
  t('트위스트', 'Sexy move (R U R\' U\')', "R U R' U'"),
  t('트위스트', 'Sexy move (L\' U\' L U)', "L' U' L U"),
  t('역트위스트', 'Reverse sexy (U R U\' R\')', "U R U' R'"),
  t('역트위스트', 'Reverse sexy (R\' U\' R U)', "R' U' R U"),
  // Sledgehammer and its mirror.
  t('슬레지해머', 'Sledgehammer (R\' F R F\')', "R' F R F'"),
  t('슬레지해머', 'Sledgehammer (L F\' L\' F)', "L F' L' F"),
  // OLL workhorses.
  t('수네', 'Sune (R U R\' U R U2 R\')', "R U R' U R U2 R'"),
  t('안티수네', 'Anti-Sune (R U2 R\' U\' R U\' R\')', "R U2 R' U' R U' R'"),
  // Right-hand / left-hand insert (beginner F2L pair insert).
  t('오른손 끼우기', 'Right insert (U R U\' R\')', "U R U' R'"),
  t('왼손 끼우기', 'Left insert (U\' L\' U L)', "U' L' U L"),
];

// Longest patterns first so the greedy matcher prefers bigger chunks.
export const TRIGGERS_BY_LENGTH = [...TRIGGERS].sort(
  (a, b) => b.moves.length - a.moves.length,
);
