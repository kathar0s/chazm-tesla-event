import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CUBIES, COLORS } from '../cube/facelets';
import { turnSpec } from '../cube/geometry';
import type { Move, Face } from '../cube/notation';
import { useStore } from '../state/store';

const AXIS_UNIT = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 1),
];
const PLANE_NORMAL = new THREE.Vector3(0, 0, 1);
const TURN_MS = 320;

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

interface AnimState {
  move: Move;
  spec: ReturnType<typeof turnSpec>;
  t: number;
}

export function Cube3D() {
  const facelet = useStore((s) => s.facelet);
  const completeMove = useStore((s) => s.completeMove);

  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const anim = useRef<AnimState | null>(null);
  const tmpVec = useMemo(() => new THREE.Vector3(), []);
  const tmpQuat = useMemo(() => new THREE.Quaternion(), []);

  // Per-cubie sticker orientation quaternions (constant geometry).
  const stickerQuats = useMemo(
    () =>
      CUBIES.map((c) =>
        c.stickers.map((s) => {
          const q = new THREE.Quaternion();
          q.setFromUnitVectors(PLANE_NORMAL, new THREE.Vector3(...s.normal).normalize());
          return q;
        }),
      ),
    [],
  );

  useFrame((_, delta) => {
    if (!anim.current) {
      const queue = useStore.getState().queue;
      if (queue.length > 0) {
        anim.current = { move: queue[0], spec: turnSpec(queue[0]), t: 0 };
      }
    }
    const a = anim.current;
    if (!a) return;

    a.t += (delta * 1000) / TURN_MS;
    const k = Math.min(a.t, 1);
    const angle = easeInOut(k) * a.spec.dir * a.spec.quarters * (Math.PI / 2);
    const axisVec = AXIS_UNIT[a.spec.axis];

    CUBIES.forEach((c, i) => {
      const g = groupRefs.current[i];
      if (!g) return;
      const inLayer = a.spec.layers.includes(c.pos[a.spec.axis] as -1 | 0 | 1);
      if (inLayer) {
        tmpQuat.setFromAxisAngle(axisVec, angle);
        g.quaternion.copy(tmpQuat);
        tmpVec.set(...c.pos).applyQuaternion(tmpQuat);
        g.position.copy(tmpVec);
      } else {
        g.quaternion.identity();
        g.position.set(...c.pos);
      }
    });

    if (a.t >= 1) {
      // snap back to identity; recolouring from the new facelet makes it seamless
      CUBIES.forEach((c, i) => {
        const g = groupRefs.current[i];
        if (!g) return;
        g.quaternion.identity();
        g.position.set(...c.pos);
      });
      anim.current = null;
      completeMove();
    }
  });

  return (
    <group>
      {CUBIES.map((c, i) => (
        <group
          key={i}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
          position={c.pos}
        >
          <mesh>
            <boxGeometry args={[0.96, 0.96, 0.96]} />
            <meshStandardMaterial color="#15171c" roughness={0.6} metalness={0.1} />
          </mesh>
          {c.stickers.map((s, j) => (
            <mesh
              key={j}
              position={[s.normal[0] * 0.5, s.normal[1] * 0.5, s.normal[2] * 0.5]}
              quaternion={stickerQuats[i][j]}
            >
              <planeGeometry args={[0.82, 0.82]} />
              <meshStandardMaterial
                color={COLORS[facelet[s.index] as Face] ?? '#222'}
                roughness={0.4}
                metalness={0.05}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
