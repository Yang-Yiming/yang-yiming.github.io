// Tiny Rain World–style physics kit.
// Objects keep `pos`, `lastPos` and `vel`; the simulation runs at a fixed tick and
// rendering interpolates lastPos → pos with a `timeStacker` in [0, 1).
// The hot paths below mutate vectors in place; the pure helpers are for one-off maths.

export type Vec = { x: number; y: number };

export const v = (x = 0, y = 0): Vec => ({ x, y });
export const add = (a: Vec, b: Vec): Vec => v(a.x + b.x, a.y + b.y);
export const sub = (a: Vec, b: Vec): Vec => v(a.x - b.x, a.y - b.y);
export const mul = (a: Vec, s: number): Vec => v(a.x * s, a.y * s);
export const len = (a: Vec) => Math.sqrt(a.x * a.x + a.y * a.y);
// sqrt rather than Math.hypot: hypot is noticeably slower in V8 and allocates.
export const dist = (a: Vec, b: Vec) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};
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
    const { pos, lastPos, vel } = this;
    lastPos.x = pos.x;
    lastPos.y = pos.y;
    vel.x *= airFriction;
    vel.y *= airFriction;
    pos.x += vel.x;
    pos.y += vel.y;
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
  const inv = 1 / d;
  const dx = (a.pos.x - b.pos.x) * inv;
  const dy = (a.pos.y - b.pos.y) * inv;
  const err = (d - target) * elasticity;
  const aShare = b.mass / (a.mass + b.mass);
  const ka = -err * aShare;
  const kb = err * (1 - aShare);
  a.pos.x += dx * ka;
  a.pos.y += dy * ka;
  a.vel.x += dx * ka;
  a.vel.y += dy * ka;
  b.pos.x += dx * kb;
  b.pos.y += dy * kb;
  b.vel.x += dx * kb;
  b.vel.y += dy * kb;
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
    const { cols, rows, segLen } = this;
    for (let c = 0; c < cols.length; c++) {
      const root = roots[c];
      const dir = restDirs[c];
      for (let i = 0; i < rows; i++) {
        const s = cols[c][i];
        s.lastPos.x = s.pos.x;
        s.lastPos.y = s.pos.y;
        s.vel.x *= friction;
        s.vel.y *= friction;
        s.vel.y += gravity;
        // Pull toward the rest pose so the sheet keeps its shape but still lags and sways.
        const reach = segLen * (i + 1);
        const k = this.stiffness[i] ?? 0;
        s.vel.x += (root.x + dir.x * reach - s.pos.x) * k;
        s.vel.y += (root.y + dir.y * reach - s.pos.y) * k;
        push(s, c, i);
        s.pos.x += s.vel.x;
        s.pos.y += s.vel.y;
      }
    }

    for (let iter = 0; iter < 3; iter++) {
      // Vertical threads, root outward. Each segment also nudges its parent a little.
      for (let c = 0; c < cols.length; c++) {
        const col = cols[c];
        this.relax(roots[c], col[0], segLen, 0, null);
        for (let i = 1; i < rows; i++) this.relax(col[i - 1].pos, col[i], segLen, 0.25, col[i - 1]);
      }
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
    // Read the anchor before writing anything: it may be the parent's own pos.
    const inv = 1 / d;
    const dx = (s.pos.x - anchor.x) * inv;
    const dy = (s.pos.y - anchor.y) * inv;
    const err = (d - target) * elasticity;
    const ks = -err * (1 - parentShare);
    s.pos.x += dx * ks;
    s.pos.y += dy * ks;
    s.vel.x += dx * ks * 0.5;
    s.vel.y += dy * ks * 0.5;
    if (parent) {
      const kp = err * parentShare;
      parent.pos.x += dx * kp;
      parent.pos.y += dy * kp;
      parent.vel.x += dx * kp * 0.5;
      parent.vel.y += dy * kp * 0.5;
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
