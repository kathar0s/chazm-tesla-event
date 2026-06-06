// Web Worker that runs cubejs' Kociemba two-phase solver. Building the pruning
// tables (initSolver) takes a second or two, so we keep it off the main thread.
import Cube from 'cubejs';

let initialized = false;

self.onmessage = (e: MessageEvent<{ facelet: string }>) => {
  try {
    if (!initialized) {
      Cube.initSolver();
      initialized = true;
    }
    const cube = Cube.fromString(e.data.facelet);
    const solution = cube.solve();
    (self as DedicatedWorkerGlobalScope).postMessage({ ok: true, solution });
  } catch (err) {
    (self as DedicatedWorkerGlobalScope).postMessage({ ok: false, error: String(err) });
  }
};
