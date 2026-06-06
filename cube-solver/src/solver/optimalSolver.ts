// Near-optimal (Kociemba two-phase) solver, run in a worker. Requests are
// serialised so the worker never handles two solves at once.
import { parseMoves, type Move } from '../cube/notation';
import type { Facelet } from '../cube/cubeState';

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./optimal.worker.ts', import.meta.url), {
      type: 'module',
    });
  }
  return worker;
}

export function solveOptimal(facelet: Facelet): Promise<Move[]> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    const onMessage = (e: MessageEvent<{ ok: boolean; solution?: string; error?: string }>) => {
      w.removeEventListener('message', onMessage);
      if (e.data.ok && e.data.solution !== undefined) {
        resolve(parseMoves(e.data.solution));
      } else {
        reject(new Error(e.data.error ?? '풀이를 계산하지 못했습니다.'));
      }
    };
    w.addEventListener('message', onMessage);
    w.postMessage({ facelet });
  });
}
