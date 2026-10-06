import {
  Chunk,
  Spring,
  Cloth,
  add,
  clamp,
  connect,
  dist,
  len,
  lerp,
  mul,
  norm,
  rand,
  sub,
  v,
  type Vec,
} from "./physics";
import type { GhostMode } from "./mode";

// Everything is laid out in the original 400×410 scene units and scaled on draw.
const SCENE_W = 400;
const SCENE_H = 410;
const TICK = 1 / 40; // Rain World runs its physics at 40 ticks per second.

const HOME = v(200, 152); // centre of the dome at rest
const RADIUS = 55; // half the 110px body width
const BODY_LEN = 68; // dome centre → hem, matches the original silhouette
const FACE_R = 42.5;
const BOB = (Math.PI * 2) / 96; // 2.4s float cycle, same as the original keyframes
const SWAY = (Math.PI * 2) / 200; // 5s side-to-side look, the original's face/eye sway
const STRETCH = 6; // how much the body breathes along its length; 0 keeps it rigid
const CALM_BOB = 5; // calm float height; lively uses 13, about the original's 20px travel
const CALM_STRETCH = 0.5; // share of STRETCH the body breathes when calm
const CALM_SWAY = 0.2; // calm face/eye side-to-side, as a share of full gaze (lively reaches 1)
const LEAN = 0.08; // how far the hem trails sideways behind the dome
// Hem scallops. 5 matches the current look, 4 gives slightly wider, softer lobes.
const LOBE_COUNT = 5;
const LOBE_W = (RADIUS * 2) / LOBE_COUNT;
const LOBES = Array.from({ length: LOBE_COUNT }, (_, i) => RADIUS - LOBE_W * (i + 0.5)); // centres, right → left
const NOTCHES = Array.from({ length: LOBE_COUNT + 1 }, (_, i) => RADIUS - LOBE_W * i);

// Barely-there gradient: reads as light on fabric rather than a shaded blob.
const BODY_TOP = "#b1bec7";
const BODY_BOTTOM = "#a7b5bf";
const BODY_ANGRY = "#c4a9ae";
const EYE = "#131a24";
const SYMBOL = "#aab8c2";

type Look = { target: Vec; until: number };
type Mood = "idle" | "happy" | "angry";

type Symbol = {
  kind: "x" | "o" | "+";
  home: Vec;
  size: number;
  phase: number;
  spin: number;
  angle: number; // accumulated spin, so pausing the spin when calm doesn't make it jump
  body: Chunk;
};

export class Ghost {
  private ctx: CanvasRenderingContext2D;
  private scale = 1;
  private dpr = 1;

  private head = new Chunk(HOME, 0.6);
  private hip = new Chunk(add(HOME, v(0, BODY_LEN)), 0.4);
  private skirt = new Cloth(LOBES.map((x) => add(HOME, v(x, BODY_LEN))), 3, 5.5, [0.16, 0.09, 0.05]);
  // Reused every tick for the skirt's attachment points and rest directions.
  private roots = LOBES.map(() => v());
  private rests = LOBES.map(() => v());

  // Expression state, all springs so every change eases and overshoots a little.
  private lookX = new Spring(0, 0, 0.12, 0.72);
  private lookY = new Spring(0, 0, 0.12, 0.72);
  private tilt = new Spring(0, 0, 0.06, 0.8);
  private blink = new Spring(1, 1, 0.55, 0.45);
  private happy = new Spring(0, 0, 0.12, 0.7);
  private angry = new Spring(0, 0, 0.15, 0.7);
  private faceSlide = new Spring(0, 0, 0.07, 0.78);
  private faceAlpha = new Spring(1, 1, 0.2, 0.6);
  private faceScale = new Spring(1, 1, 0.12, 0.72);
  private photoSlide = new Spring(-150, -150, 0.07, 0.78);
  private photoAlpha = new Spring(0, 0, 0.15, 0.65);

  private symbols: Symbol[];
  private photo: HTMLImageElement | null = null;

  private ticks = 0;
  private mood: Mood = "idle";
  private moodTimers: { at: number; fn: () => void }[] = [];
  private look: Look = { target: v(0, 0), until: 0 };
  private nextBlink = 60;
  private pointer: Vec | null = null;
  private lastPointer: Vec | null = null;
  private pointerSeen = -Infinity;
  private reduced: boolean;

  // Calm repeats the original's simple loops; lively adds wander, curiosity and glances.
  // `energy` eases between the two so switching never jolts the body.
  private mode: GhostMode = "calm";
  private energy = new Spring(0, 0, 0.02, 0.85);

  private running = false;
  private raf = 0;
  private lastTime = 0;
  private acc = 0;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const sym = (kind: Symbol["kind"], x: number, y: number, size = 12): Symbol => ({
      kind,
      home: v(x, y),
      size,
      phase: rand(0, Math.PI * 2),
      spin: rand(-0.004, 0.004),
      angle: 0,
      body: new Chunk(v(x, y), 1),
    });
    // Same six marks as the original, positions converted to scene units.
    this.symbols = [
      sym("x", 24, 154),
      sym("o", 19, 201, 18),
      sym("+", 50, 236),
      sym("x", 374, 146),
      sym("o", 383, 193, 14),
      sym("+", 350, 236),
    ];

    new ResizeObserver(() => this.resize()).observe(canvas);
    this.resize();
    window.addEventListener("pointermove", (event) => this.onPointer(event), { passive: true });
  }

  /** Reduced motion always keeps the ghost calm, whatever the visitor picked. */
  setMode(mode: GhostMode, { instant = false } = {}) {
    this.mode = this.reduced ? "calm" : mode;
    const energy = this.mode === "lively" ? 1 : 0;
    if (instant) this.energy.snap(energy);
    else this.energy.target = energy;
    this.look.until = 0;
  }

  setPhoto(image: HTMLImageElement | null) {
    this.photo = image;
  }

  get busy() {
    return this.mood !== "idle";
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    const frame = (now: number) => {
      if (!this.running) return;
      // Fixed-step simulation, render interpolates between the last two ticks.
      this.acc += Math.min(0.1, (now - this.lastTime) / 1000);
      this.lastTime = now;
      while (this.acc >= TICK) {
        this.update();
        this.acc -= TICK;
      }
      this.draw(this.acc / TICK);
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  // ───────────────────────────── reactions ─────────────────────────────

  private schedule(seconds: number, fn: () => void) {
    this.moodTimers.push({ at: this.ticks + Math.round(seconds / TICK), fn });
  }

  private runSchedule() {
    const due = this.moodTimers.filter((timer) => this.ticks >= timer.at);
    if (!due.length) return;
    this.moodTimers = this.moodTimers.filter((timer) => this.ticks < timer.at);
    due.forEach((timer) => timer.fn());
  }

  /** Face slides off to the right, the photo face slides in from the left, then back. */
  playHappy() {
    this.mood = "happy";
    this.happy.target = 1;
    this.head.vel.y -= 7; // a little hop
    this.blink.target = 1;

    if (!this.photo) {
      this.schedule(2.6, () => this.endMood());
      return;
    }
    this.faceSlide.target = 150;
    this.schedule(0.55, () => (this.faceAlpha.target = 0));
    this.schedule(1.0, () => {
      this.photoSlide.snap(-150, 0);
      this.photoAlpha.target = 1;
    });
    this.schedule(1.6, () => (this.head.vel.y -= 3.5));
    this.schedule(4.6, () => {
      this.photoAlpha.target = 0;
      this.faceSlide.snap(0);
      this.faceScale.snap(0.55, 1);
      this.faceAlpha.target = 1;
    });
    this.schedule(5.4, () => this.endMood());
  }

  /** Shivering fit with angry brows, then it shakes it off. */
  playAngry() {
    this.mood = "angry";
    this.angry.target = 1;
    this.schedule(2.0, () => {
      this.angry.target = 0;
      this.head.vel.y -= 2;
    });
    this.schedule(2.6, () => this.endMood());
  }

  private endMood() {
    this.mood = "idle";
    this.happy.target = 0;
    this.angry.target = 0;
    this.faceSlide.target = 0;
    this.faceAlpha.target = 1;
    this.photoAlpha.target = 0;
  }

  // ───────────────────────────── simulation ─────────────────────────────

  private onPointer(event: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width) return;
    const p = v(((event.clientX - rect.left) / rect.width) * SCENE_W, ((event.clientY - rect.top) / rect.height) * SCENE_H);
    // Only care about the pointer when it is reasonably near the scene.
    if (p.x < -500 || p.x > SCENE_W + 300 || p.y < -250 || p.y > SCENE_H + 250) return;
    this.pointer = p;
    this.pointerSeen = this.ticks;
  }

  private update() {
    this.ticks++;
    const t = this.ticks;
    this.runSchedule();

    const pointerActive = this.pointer && t - this.pointerSeen < 100;
    const motion = this.reduced ? 0.25 : 1;
    this.energy.update();
    const energy = clamp(this.energy.value, 0, 1);
    const lively = this.mode === "lively";

    // ── AI: pick where the head wants to be. ──
    // Calm is just the original's 2.4s float. Lively layers sines on top for a wander
    // that never visibly repeats.
    const wander = v(
      (Math.sin(t * 0.011) * 16 + Math.sin(t * 0.0237 + 1.3) * 8) * motion * energy,
      (Math.sin(t * 0.0171 + 0.7) * 6 * energy + Math.sin(t * BOB) * (CALM_BOB + (13 - CALM_BOB) * energy)) * motion,
    );
    let goal = add(HOME, wander);
    if (pointerActive && this.pointer && energy > 0.01) {
      // Curious: drift a little toward the cursor, but stay home.
      const pull = sub(this.pointer, HOME);
      goal = add(goal, mul(v(clamp(pull.x * 0.08, -26, 26), clamp(pull.y * 0.06, -16, 16)), energy));
    }

    const toGoal = sub(goal, this.head.pos);
    const pullK = this.mood === "angry" ? 0.03 : 0.014;
    this.head.vel = add(this.head.vel, mul(toGoal, pullK));

    // ── forces ──
    const gravity = 0.45;
    this.hip.vel.y += gravity;
    this.head.vel.y -= (gravity * this.hip.mass) / this.head.mass; // buoyant dome holds the hem up

    if (this.mood === "angry" && this.angry.target > 0) {
      // Shiver: fast alternating kicks plus noise, like a furious little vibration.
      const dir = t % 4 < 2 ? 1 : -1;
      this.head.vel.x += dir * 2.2 * motion + rand(-0.6, 0.6);
      this.head.vel.y += rand(-0.8, 0.8) * motion;
    }

    // Startle when the cursor whips past the face.
    if (lively && pointerActive && this.pointer && this.lastPointer) {
      const speed = dist(this.pointer, this.lastPointer);
      const away = sub(this.head.pos, this.pointer);
      if (speed > 18 && len(away) < 70) {
        this.head.vel = add(this.head.vel, mul(norm(away), 2.5));
        this.blink.snap(0.1, 1);
      }
    }
    this.lastPointer = this.pointer ? { ...this.pointer } : null;

    // Lean into turns: the hem gets dragged against the dome's sideways motion.
    this.hip.vel.x -= this.head.vel.x * LEAN;

    this.head.update(0.9);
    this.hip.update(0.88);
    // Breathing: longer while rising, shorter while sinking, like the original's offset bob.
    // A soft link lets the hem lag behind the dome too, so the length also follows the motion.
    const breath = -Math.cos(t * BOB) * STRETCH * (CALM_STRETCH + (1 - CALM_STRETCH) * energy) * motion;
    for (let i = 0; i < 2; i++) connect(this.head, this.hip, BODY_LEN - 4 + breath, 0.1);

    // ── skirt: a small cloth sheet hanging from the hem ──
    const axis = norm(sub(this.head.pos, this.hip.pos)); // points "up" along the body
    const right = v(-axis.y, axis.x);
    const ws = this.widthScale(dist(this.head.pos, this.hip.pos));
    // When calm the hem barely ripples on its own; it mostly just follows the float.
    const wave = this.mood === "happy" ? 0.4 : 0.02 + 0.06 * energy;
    const waveSpeed = this.mood === "happy" ? 0.24 : 0.07;
    const { roots, rests } = this;
    const hip = this.hip.pos;
    for (let i = 0; i < LOBE_COUNT; i++) {
      const x = LOBES[i];
      roots[i].x = hip.x + right.x * (x * ws) + axis.x * 4;
      roots[i].y = hip.y + right.y * (x * ws) + axis.y * 4;
      const rx = -axis.x + right.x * (x / 400);
      const ry = -axis.y + right.y * (x / 400);
      const l = Math.sqrt(rx * rx + ry * ry);
      rests[i].x = l < 1e-6 ? 0 : rx / l;
      rests[i].y = l < 1e-6 ? 1 : ry / l;
    }
    // Cloth trails behind the body, so motion itself makes it flutter.
    const drag = v(this.hip.vel.x * -0.06, this.hip.vel.y * -0.035);
    this.skirt.update(roots, rests, 0.84, 0.22, (seg, c, j) => {
      // One slow wave rolling across the whole hem, stronger toward the edge.
      const ripple = Math.sin(t * waveSpeed - c * 0.7) * wave * (j + 1) * 0.3;
      seg.vel.x += right.x * ripple + drag.x * (j + 1);
      seg.vel.y += right.y * ripple + drag.y * (j + 1);
    });

    // ── gaze ──
    // Lively follows the cursor anywhere and glances around on its own. Calm only looks at
    // a cursor that is actually over the ghost; otherwise it repeats the original's slow sway.
    const p = this.pointer;
    const pointerNear = pointerActive && p && p.x > 0 && p.x < SCENE_W && p.y > 0 && p.y < SCENE_H;
    let look: Vec;
    if (lively || pointerNear) {
      if (pointerActive && p) {
        this.look.target = p;
      } else if (t >= this.look.until) {
        // Idle glances: mostly ahead, sometimes at the page text on the left, sometimes around.
        const r = Math.random();
        this.look.target =
          r < 0.35 ? add(this.head.pos, v(0, 30)) : r < 0.6 ? v(-260, 120) : add(this.head.pos, v(rand(-200, 200), rand(-80, 120)));
        this.look.until = t + Math.round(rand(50, 160));
      }
      look = sub(this.look.target, this.head.pos);
      const reach = clamp(len(look) / 140, 0, 1);
      look = mul(norm(look), reach);
    } else {
      look = v(-Math.cos(t * SWAY) * CALM_SWAY * motion, 0.1);
    }
    if (this.mood === "angry" && this.angry.target > 0) look = v(t % 6 < 3 ? -1 : 1, 0.15);
    this.lookX.target = look.x;
    this.lookY.target = look.y * 0.8;
    // Calm keeps the dome upright; only lively tilts it toward what it's looking at.
    this.tilt.target = look.x * 0.1 * energy + (this.mood === "happy" ? Math.sin(t * 0.12) * 0.08 : 0);

    // ── blinking ──
    if (t >= this.nextBlink && this.mood === "idle") {
      this.blink.target = 0.05;
      // Lively blinks often, sometimes twice in a row; calm only every 6–10s.
      this.nextBlink = t + Math.round(lively ? (Math.random() < 0.2 ? 8 : rand(90, 220)) : rand(240, 400));
    }
    if (this.blink.value < 0.15) this.blink.target = 1;

    [this.lookX, this.lookY, this.tilt, this.blink, this.happy, this.angry].forEach((s) => s.update());
    [this.faceSlide, this.faceAlpha, this.faceScale, this.photoSlide, this.photoAlpha].forEach((s) => s.update());

    // ── floating marks get nudged by the body passing by ──
    // Calm keeps them in place like the original, where only their shine moved.
    this.symbols.forEach((s, i) => {
      const b = s.body;
      s.angle += s.spin * energy;
      const drift = v(Math.sin(t * 0.02 + i * 2) * 4 * energy, Math.cos(t * 0.017 + i) * 5 * energy);
      b.vel = add(b.vel, mul(sub(add(s.home, drift), b.pos), 0.01));
      const away = sub(b.pos, this.head.pos);
      const d = len(away);
      if (d < 120) b.vel = add(b.vel, mul(norm(away), (120 - d) * 0.004 + len(this.head.vel) * 0.01));
      b.update(0.9);
    });
  }

  private widthScale(length: number) {
    return clamp(1 / Math.sqrt(length / BODY_LEN), 0.88, 1.12);
  }

  // ───────────────────────────── graphics ─────────────────────────────

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.scale = rect.width / SCENE_W;
    this.canvas.width = Math.round(rect.width * this.dpr);
    this.canvas.height = Math.round(rect.height * this.dpr);
    if (!this.running) this.draw(1);
  }

  private draw(ts: number) {
    const { ctx } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const k = this.dpr * this.scale;
    ctx.setTransform(k, 0, 0, k, 0, 0);

    this.drawSymbols(ts);

    const H = this.head.at(ts);
    const P = this.hip.at(ts);
    const length = dist(H, P);
    const u = norm(sub(H, P)); // body up
    const r = v(-u.y, u.x); // body right
    const ws = this.widthScale(length);
    const stretch = length / BODY_LEN;

    // Dome frame: body angle plus the head's own tilt toward what it is looking at.
    const phi = Math.atan2(u.x, -u.y) + this.tilt.at(ts);
    const ud = v(Math.sin(phi), -Math.cos(phi));
    const rd = v(Math.cos(phi), Math.sin(phi));
    const rx = RADIUS * ws;
    const ry = RADIUS * clamp(stretch, 0.9, 1.12);

    const body = new Path2D();
    const domeL = sub(H, mul(rd, rx));
    const domeR = add(H, mul(rd, rx));
    const hemL = sub(P, mul(r, RADIUS * ws));
    const hemR = add(P, mul(r, RADIUS * ws));
    const side = length / 3;
    body.moveTo(domeL.x, domeL.y);
    body.ellipse(H.x, H.y, rx, ry, phi, Math.PI, Math.PI * 2);
    let c1 = sub(domeR, mul(ud, side));
    let c2 = add(hemR, mul(u, side));
    body.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, hemR.x, hemR.y);

    // Scalloped hem: each lobe is a cubic whose midpoint lands exactly on its tail tip.
    const notch = (x: number) => add(add(P, mul(r, x * ws)), mul(u, 1.5));
    for (let i = 0; i < LOBE_COUNT; i++) {
      const a = i === 0 ? hemR : notch(NOTCHES[i]);
      const b = i === LOBE_COUNT - 1 ? hemL : notch(NOTCHES[i + 1]);
      const tip = this.skirt.at(i, this.skirt.rows - 1, ts);
      const bulge = mul(sub(tip, lerp(a, b, 0.5)), 4 / 3);
      const p1 = add(a, bulge);
      const p2 = add(b, bulge);
      if (i === 0) body.lineTo(a.x, a.y);
      body.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, b.x, b.y);
    }

    c1 = add(hemL, mul(u, side));
    c2 = sub(domeL, mul(ud, side));
    body.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, domeL.x, domeL.y);
    body.closePath();

    // Body fill: soft top-to-hem gradient, flushed pink while angry.
    // The last few pixels below the hem line fade a little, like thin fabric.
    const top = sub(H, mul(ud, ry));
    const bottom = add(P, mul(u, -18));
    const grad = ctx.createLinearGradient(top.x, top.y, bottom.x, bottom.y);
    const anger = clamp(this.angry.at(ts), 0, 1);
    const hemAt = clamp(dist(top, P) / dist(top, bottom), 0, 1);
    const hemColor = mix(BODY_BOTTOM, BODY_ANGRY, anger * 0.8);
    grad.addColorStop(0, mix(BODY_TOP, BODY_ANGRY, anger * 0.6));
    grad.addColorStop(hemAt, hemColor);
    grad.addColorStop(1, hemColor.replace("rgb(", "rgba(").replace(")", ", 0.72)"));
    ctx.fillStyle = grad;
    ctx.fill(body);

    ctx.save();
    ctx.clip(body);
    this.drawFace(ts, H, ud, rd, ws);
    ctx.restore();
  }

  private drawFace(ts: number, H: Vec, ud: Vec, rd: Vec, ws: number) {
    const { ctx } = this;
    const lx = this.lookX.at(ts);
    const ly = this.lookY.at(ts);
    const phi = Math.atan2(rd.y, rd.x);
    const down = mul(ud, -1);

    // Face turns toward the gaze: it shifts and foreshortens like a ball rotating.
    const centre = add(add(H, mul(down, 2.5 + ly * 6)), mul(rd, lx * 11 * ws));
    const slide = this.faceSlide.at(ts);
    const faceCentre = add(centre, mul(rd, slide));
    const scale = this.faceScale.at(ts);
    const alpha = clamp(this.faceAlpha.at(ts), 0, 1);

    if (alpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(faceCentre.x, faceCentre.y);
      ctx.rotate(phi);
      ctx.scale(scale, scale);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(0, 0, FACE_R * (1 - 0.09 * Math.abs(lx)), FACE_R * (1 - 0.05 * Math.abs(ly)), 0, 0, Math.PI * 2);
      ctx.fill();

      const happy = clamp(this.happy.at(ts), 0, 1);
      const angry = clamp(this.angry.at(ts), 0, 1);

      // Blush.
      if (happy > 0.02) {
        ctx.fillStyle = `rgba(255, 150, 170, ${0.45 * happy})`;
        for (const sx of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(lx * 12 + sx * 26, 13 + ly * 6, 7, 4, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Eyes ride a little further than the face for parallax.
      const ex = lx * 13;
      const ey = ly * 7;
      const spacing = 19 * (1 - 0.14 * Math.abs(lx));
      for (const sx of [-1, 1]) this.drawEye(ex + sx * spacing, ey, sx, happy, angry, this.blink.at(ts));
      ctx.restore();
    }

    const pAlpha = clamp(this.photoAlpha.at(ts), 0, 1);
    if (this.photo && pAlpha > 0.01) {
      const pc = add(centre, mul(rd, this.photoSlide.at(ts)));
      ctx.save();
      ctx.globalAlpha = pAlpha;
      ctx.translate(pc.x, pc.y);
      ctx.rotate(phi);
      ctx.beginPath();
      ctx.arc(0, 0, FACE_R, 0, Math.PI * 2);
      ctx.clip();
      const img = this.photo;
      const s = Math.max((FACE_R * 2) / img.naturalWidth, (FACE_R * 2) / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
  }

  /** One shape morphing between round, happy (flat bottom) and angry (flat top, slanted). */
  private drawEye(x: number, y: number, side: number, happy: number, angry: number, blink: number) {
    const { ctx } = this;
    const w = 12;
    const h = (12 - 2 * Math.max(happy, angry)) * clamp(blink, 0.08, 1.1);
    const topR = 6 * (1 - angry);
    const botR = 6 * (1 - happy);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(side * -0.26 * angry);
    ctx.fillStyle = EYE;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, [
      Math.min(topR, h / 2),
      Math.min(topR, h / 2),
      Math.min(botR, h / 2),
      Math.min(botR, h / 2),
    ]);
    ctx.fill();
    ctx.restore();
  }

  private drawSymbols(ts: number) {
    const { ctx } = this;
    const time = (this.ticks + ts) * TICK;
    ctx.strokeStyle = SYMBOL;
    ctx.lineCap = "round";
    this.symbols.forEach((s) => {
      // Same 4s shine as the CSS original, each mark on its own phase.
      const alpha = 0.35 + 0.35 * Math.cos((time / 4) * Math.PI * 2 + s.phase);
      if (alpha < 0.01) return;
      const p = s.body.at(ts);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(s.angle + (p.x - s.home.x) * 0.02);
      ctx.beginPath();
      if (s.kind === "o") {
        ctx.lineWidth = 3;
        ctx.arc(0, 0, (s.size - 3) / 2, 0, Math.PI * 2);
      } else {
        ctx.lineWidth = 4;
        const a = s.kind === "x" ? Math.PI / 4 : 0;
        for (const angle of [a, a + Math.PI / 2]) {
          const d = v(Math.cos(angle) * 4, Math.sin(angle) * 4);
          ctx.moveTo(-d.x, -d.y);
          ctx.lineTo(d.x, d.y);
        }
      }
      ctx.stroke();
      ctx.restore();
    });
  }
}

function mix(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}
