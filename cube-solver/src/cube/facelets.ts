// Geometry of the 54 facelets, derived faithfully from cubejs' own piece
// tables (node_modules/cubejs/lib/cube.js). Each facelet maps to a cubie
// position in {-1,0,1}^3 and an outward normal direction. This is the single
// source of truth that ties the cubejs facelet string to the 3D scene.

import type { Face } from './notation';

export type Vec3 = [number, number, number];

/** Outward unit direction of each face. x=right, y=up, z=toward viewer (front). */
export const DIR: Record<Face, Vec3> = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  R: [1, 0, 0],
  L: [-1, 0, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
};

/** WCA-standard colours, matched to cubejs face letters. */
export const COLORS: Record<Face, string> = {
  U: '#f5f5f5', // white
  R: '#c41e3a', // red
  F: '#009e60', // green
  D: '#ffd500', // yellow
  L: '#ff5800', // orange
  B: '#0051ba', // blue
};

// --- cubejs piece -> facelet index tables (replicated verbatim from source) ---
const _U = (x: number) => x - 1;
const _R = (x: number) => _U(9) + x;
const _F = (x: number) => _R(9) + x;
const _D = (x: number) => _F(9) + x;
const _L = (x: number) => _D(9) + x;
const _B = (x: number) => _L(9) + x;

const centerFacelet: number[] = [4, 13, 22, 31, 40, 49];
const centerColor: Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];

const cornerFacelet: number[][] = [
  [_U(9), _R(1), _F(3)],
  [_U(7), _F(1), _L(3)],
  [_U(1), _L(1), _B(3)],
  [_U(3), _B(1), _R(3)],
  [_D(3), _F(9), _R(7)],
  [_D(1), _L(9), _F(7)],
  [_D(7), _B(9), _L(7)],
  [_D(9), _R(9), _B(7)],
];
const cornerColor: Face[][] = [
  ['U', 'R', 'F'],
  ['U', 'F', 'L'],
  ['U', 'L', 'B'],
  ['U', 'B', 'R'],
  ['D', 'F', 'R'],
  ['D', 'L', 'F'],
  ['D', 'B', 'L'],
  ['D', 'R', 'B'],
];

const edgeFacelet: number[][] = [
  [_U(6), _R(2)],
  [_U(8), _F(2)],
  [_U(4), _L(2)],
  [_U(2), _B(2)],
  [_D(6), _R(8)],
  [_D(2), _F(8)],
  [_D(4), _L(8)],
  [_D(8), _B(8)],
  [_F(6), _R(4)],
  [_F(4), _L(6)],
  [_B(6), _L(4)],
  [_B(4), _R(6)],
];
const edgeColor: Face[][] = [
  ['U', 'R'],
  ['U', 'F'],
  ['U', 'L'],
  ['U', 'B'],
  ['D', 'R'],
  ['D', 'F'],
  ['D', 'L'],
  ['D', 'B'],
  ['F', 'R'],
  ['F', 'L'],
  ['B', 'L'],
  ['B', 'R'],
];

export interface Sticker {
  /** Centre of the cubie this sticker sits on. */
  pos: Vec3;
  /** Outward normal direction of the sticker. */
  normal: Vec3;
  /** Which face letter the sticker belongs to (its solved colour). */
  face: Face;
}

function sumDirs(faces: Face[]): Vec3 {
  return faces.reduce<Vec3>(
    (acc, f) => [acc[0] + DIR[f][0], acc[1] + DIR[f][1], acc[2] + DIR[f][2]],
    [0, 0, 0],
  );
}

/** STICKERS[i] describes facelet index i (0..53) in 3D space. */
export const STICKERS: Sticker[] = (() => {
  const out: Sticker[] = new Array(54);
  centerFacelet.forEach((idx, k) => {
    const face = centerColor[k];
    out[idx] = { pos: DIR[face], normal: DIR[face], face };
  });
  cornerFacelet.forEach((idxs, c) => {
    const pos = sumDirs(cornerColor[c]);
    idxs.forEach((idx, n) => {
      const face = cornerColor[c][n];
      out[idx] = { pos, normal: DIR[face], face };
    });
  });
  edgeFacelet.forEach((idxs, e) => {
    const pos = sumDirs(edgeColor[e]);
    idxs.forEach((idx, n) => {
      const face = edgeColor[e][n];
      out[idx] = { pos, normal: DIR[face], face };
    });
  });
  return out;
})();

/** Axis index per move face: 0=x, 1=y, 2=z. */
export interface MoveAxis {
  axis: 0 | 1 | 2;
  layer: 1 | -1; // coordinate of the layer along that axis
  sign: 1 | -1; // rotation sign for a clockwise (outward) quarter turn
}

export const MOVE_AXIS: Record<Face, MoveAxis> = {
  U: { axis: 1, layer: 1, sign: -1 },
  D: { axis: 1, layer: -1, sign: 1 },
  R: { axis: 0, layer: 1, sign: -1 },
  L: { axis: 0, layer: -1, sign: 1 },
  F: { axis: 2, layer: 1, sign: -1 },
  B: { axis: 2, layer: -1, sign: 1 },
};

export interface Cubie {
  pos: Vec3;
  stickers: { normal: Vec3; face: Face; index: number }[];
}

/** The 26 visible cubies, each with its outward stickers (facelet indices). */
export const CUBIES: Cubie[] = (() => {
  const byPos = new Map<string, Cubie>();
  STICKERS.forEach((s, index) => {
    const k = s.pos.join(',');
    let c = byPos.get(k);
    if (!c) {
      c = { pos: s.pos, stickers: [] };
      byPos.set(k, c);
    }
    c.stickers.push({ normal: s.normal, face: s.face, index });
  });
  return [...byPos.values()];
})();
