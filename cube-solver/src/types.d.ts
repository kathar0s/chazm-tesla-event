/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Minimal type declarations for the CommonJS solver libraries.
declare module 'cubejs' {
  export default class Cube {
    constructor(...args: unknown[]);
    static fromString(s: string): Cube;
    static scramble(): string;
    static inverse(alg: string | string[]): string;
    static initSolver(): void;
    static random(): Cube;
    move(alg: string | string[]): Cube;
    asString(): string;
    isSolved(): boolean;
    solve(maxDepth?: number): string;
    clone(): Cube;
  }
}

declare module 'rubiks-cube-solver' {
  /** Returns a space-separated solution using word notation (e.g. "Rprime U2 F"). */
  const solver: (state: string, options?: { partitioned?: boolean }) => string;
  export default solver;
}
