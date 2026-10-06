// Tiny Rain World–style physics kit.
// Objects keep `pos`, `lastPos` and `vel`; the simulation runs at a fixed tick and
// rendering interpolates lastPos → pos with a `timeStacker` in [0, 1).

export type Vec = { x: number; y: number };

export const v = (x = 0, y = 0): Vec => ({ x, y });
export const add = (a: Vec, b: Vec): Vec => v(a.x + b.x, a.y + b.y);
export const sub = (a: Vec, b: Vec): Vec => v(a.x - b.x, a.y - b.y);
export const mul = (a: Vec, s: number): Vec => v(a.x * s, a.y * s);
export const len = (a: Vec) => Math.hypot(a.x, a.y);
export const dist = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y);
export const lerp = (a: Vec, b: Vec, t: number): Vec => v(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
export const norm = (a: Vec): Vec => {
  const l = len(a);
  return l < 1e-6 ? v(0, 1) : v(a.x / l, a.y / l);
};
// Screen space (y down): perp of "up" (0,-1) is "right" (1,0).
export const perp = (a: Vec): Vec => v(-a.y, a.x);
export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
export const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

/** A round mass point, the building block of every Rain World creature. */
export class Chunk {
  pos: Vec;
  lastPos: Vec;
  vel = v();

  constructor(pos: Vec, public mass: number) {
    this.pos = { ...pos };
    this.lastPos = { ...pos };
  }

  update(airFriction: number) {
    this.lastPos = { ...this.pos };
    this.vel = mul(this.vel, airFriction);
    this.pos = add(this.pos, this.vel);
  }

  at(t: number) {
    return lerp(this.lastPos, this.pos, t);
  }
}

/**
 * Soft distance constraint between two chunks (BodyChunkConnection).
 * The correction is split by mass and written into both position and velocity,
 * which is what gives Rain World bodies their springy, slightly elastic feel.
 */
export function connect(a: Chunk, b: Chunk, target: number, elasticity: number) {
  const d = dist(a.pos, b.pos);
  if (d < 1e-6) return;
  const dir = mul(sub(a.pos, b.pos), 1 / d);
  const err = (d - target) * elasticity;
  const aShare = b.mass / (a.mass + b.mass);
  const da = mul(dir, -err * aShare);
  const db = mul(dir, err * (1 - aShare));
  a.pos = add(a.pos, da);
  a.vel = add(a.vel, da);
  b.pos = add(b.pos, db);
  b.vel = add(b.vel, db);
}

export type Segment = { pos: Vec; lastPos: Vec; vel: Vec };

const segment = (p: Vec): Segment => ({ pos: { ...p }, lastPos: { ...p }, vel: v() });

/**
 * A small hanging sheet: one dangling chain (TailSegment[]) per column, with each
 * row also tied to its neighbours. The columns can't swing independently, so the
 * whole hem moves as one piece of cloth instead of as separate tentacles.
 */
export class Cloth {
  cols: Segment[][]; // [column][row], row 0 hangs from the root

  constructor(roots: Vec[], public rows: number, public segLen: number, public stiffness: number[]) {
    this.cols = roots.map((root) => Array.from({ length: rows }, (_, i) => segment(v(root.x, root.y + segLen * (i + 1)))));
  }

  update(
    roots: Vec[],
    restDirs: Vec[],
    friction: number,
    gravity: number,
    push: (seg: Segment, col: number, row: number) => void,
  ) {
    this.cols.forEach((col, c) =>
      col.forEach((s, i) => {
        s.lastPos = { ...s.pos };
        s.vel = mul(s.vel, friction);
        s.vel.y += gravity;
        // Pull toward the rest pose so the sheet keeps its shape but still lags and sways.
        const rest = add(roots[c], mul(restDirs[c], this.segLen * (i + 1)));
        s.vel = add(s.vel, mul(sub(rest, s.pos), this.stiffness[i] ?? 0));
        push(s, c, i);
        s.pos = add(s.pos, s.vel);
      }),
    );

    for (let iter = 0; iter < 3; iter++) {
      // Vertical threads, root outward. Each segment also nudges its parent a little.
      this.cols.forEach((col, c) =>
        col.forEach((s, i) => {
          const prev = i === 0 ? null : col[i - 1];
          const parentShare = prev ? 0.25 : 0;
          this.relax(prev ? prev.pos : roots[c], s, this.segLen, parentShare, prev);
        }),
      );
      // Horizontal threads keep neighbouring columns moving together.
      for (let c = 1; c < this.cols.length; c++) {
        const spacing = dist(roots[c - 1], roots[c]);
        for (let i = 0; i < this.rows; i++) this.relax(this.cols[c - 1][i].pos, this.cols[c][i], spacing, 0.5, this.cols[c - 1][i], 0.6);
      }
    }
  }

  private relax(anchor: Vec, s: Segment, target: number, parentShare: number, parent: Segment | null, elasticity = 1) {
    const d = dist(s.pos, anchor);
    if (d < 1e-6) return;
    const dir = mul(sub(s.pos, anchor), 1 / d);
    const err = (d - target) * elasticity;
    const ds = mul(dir, -err * (1 - parentShare));
    s.pos = add(s.pos, ds);
    s.vel = add(s.vel, mul(ds, 0.5));
    if (parent) {
      const dp = mul(dir, err * parentShare);
      parent.pos = add(parent.pos, dp);
      parent.vel = add(parent.vel, mul(dp, 0.5));
    }
  }

  at(col: number, row: number, t: number) {
    const s = this.cols[col][row];
    return lerp(s.lastPos, s.pos, t);
  }
}

/** Damped spring for scalar animation parameters, interpolated like everything else. */
export class Spring {
  last: number;
  vel = 0;

  constructor(public value: number, public target = value, public k = 0.08, public damp = 0.75) {
    this.last = value;
  }

  update() {
    this.last = this.value;
    this.vel = (this.vel + (this.target - this.value) * this.k) * this.damp;
    this.value += this.vel;
  }

  snap(value: number, target = value) {
    this.value = this.last = value;
    this.target = target;
    this.vel = 0;
  }

  at(t: number) {
    return this.last + (this.value - this.last) * t;
  }
}
