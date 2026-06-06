// Rotation helpers shared by the 3D scene and validated by tests. Every move is
// modelled as: an axis, the set of layer coordinates it rotates, and a
// direction. This uniformly covers face turns, slice turns (M/E/S), wide turns
// (lower-case r/l/u/d/f/b) and whole-cube rotations (x/y/z). The same data
// drives the on-screen animation and the geometric facelet permutation used to
// prove the tables agree with cubejs.
import { STICKERS, type Vec3 } from './facelets';
import type { Move } from './notation';
import type { Facelet } from './cubeState';

export type Axis = 0 | 1 | 2;
export type Layer = -1 | 0 | 1;

/** Rotate a vector by ±90° about an axis (right-handed, dir = +1 CCW from +axis). */
export function rotate90(v: Vec3, axis: Axis, dir: 1 | -1): Vec3 {
  const [x, y, z] = v;
  switch (axis) {
    case 0:
      return dir === 1 ? [x, -z, y] : [x, z, -y];
    case 1:
      return dir === 1 ? [z, y, -x] : [-z, y, x];
    case 2:
      return dir === 1 ? [-y, x, z] : [y, -x, z];
  }
}

interface TurnBase {
  axis: Axis;
  layers: Layer[];
  /** Direction of a clockwise (outward) quarter turn, right-handed. */
  dir: 1 | -1;
}

// Hypotheses validated against cubejs in geometry tests.
const TURN_BASE: Record<string, TurnBase> = {
  U: { axis: 1, layers: [1], dir: -1 },
  D: { axis: 1, layers: [-1], dir: 1 },
  R: { axis: 0, layers: [1], dir: -1 },
  L: { axis: 0, layers: [-1], dir: 1 },
  F: { axis: 2, layers: [1], dir: -1 },
  B: { axis: 2, layers: [-1], dir: 1 },
  // slices (named after the face whose direction they follow)
  M: { axis: 0, layers: [0], dir: 1 }, // follows L
  E: { axis: 1, layers: [0], dir: 1 }, // follows D
  S: { axis: 2, layers: [0], dir: -1 }, // follows F
  // wide turns (outer face + adjacent middle)
  r: { axis: 0, layers: [1, 0], dir: -1 },
  l: { axis: 0, layers: [-1, 0], dir: 1 },
  u: { axis: 1, layers: [1, 0], dir: -1 },
  d: { axis: 1, layers: [-1, 0], dir: 1 },
  f: { axis: 2, layers: [1, 0], dir: -1 },
  b: { axis: 2, layers: [-1, 0], dir: 1 },
  // whole-cube rotations
  x: { axis: 0, layers: [-1, 0, 1], dir: -1 },
  y: { axis: 1, layers: [-1, 0, 1], dir: -1 },
  z: { axis: 2, layers: [-1, 0, 1], dir: -1 },
};

export interface TurnSpec {
  axis: Axis;
  layers: Layer[];
  dir: 1 | -1;
  /** Number of quarter turns (1 or 2). */
  quarters: 1 | 2;
}

export function turnSpec(move: Move): TurnSpec {
  const base = TURN_BASE[move[0]];
  if (!base) throw new Error(`알 수 없는 무브: ${move}`);
  const mod = move.slice(1);
  const dir: 1 | -1 = mod === "'" ? (-base.dir as 1 | -1) : base.dir;
  return { axis: base.axis, layers: base.layers, dir, quarters: mod === '2' ? 2 : 1 };
}

const key = (pos: Vec3, normal: Vec3) => `${pos.join(',')}|${normal.join(',')}`;
const INDEX_BY_KEY = new Map<string, number>(
  STICKERS.map((s, i) => [key(s.pos, s.normal), i]),
);

/**
 * Apply a move purely geometrically (rotate the affected layers' stickers and
 * re-read positions). Used in tests to confirm the 3D geometry matches cubejs.
 */
export function geometricApplyMove(facelet: Facelet, move: Move): Facelet {
  const { axis, layers, dir, quarters } = turnSpec(move);
  const out = facelet.split('');
  for (let i = 0; i < 54; i++) {
    const s = STICKERS[i];
    if (!layers.includes(s.pos[axis] as Layer)) continue;
    let pos = s.pos;
    let normal = s.normal;
    for (let q = 0; q < quarters; q++) {
      pos = rotate90(pos, axis, dir);
      normal = rotate90(normal, axis, dir);
    }
    const j = INDEX_BY_KEY.get(key(pos, normal));
    if (j === undefined) throw new Error(`no sticker at ${key(pos, normal)}`);
    out[j] = facelet[i];
  }
  return out.join('');
}
