// Roam mode: the ghost leaves the hero and keeps the reader company from the side lanes.
// Loaded on demand, so calm and lively visitors never download or run any of this.
//
// A tiny director runs once per simulation tick and only decides where the dome should go;
// the body, cloth and face all come from the shared Ghost simulation.

import { clamp, rand, v, type Vec } from "./physics";
import type { Ghost } from "./ghost";

const TPS = 40; // simulation ticks per second
const DEADZONE = 120; // vertical slack before the ghost bothers to follow the cursor
const DRIFT_AFTER = 20 * TPS; // cursor completely still this long → wander a little
const DRIFT_RANGE = 80;
const DROPPED_FOR = 8 * TPS; // how long a dropped ghost stays where it landed
const PLAY_ENTER = 90;
const PLAY_EXIT = 150;
const MARGIN = 36; // half the on-screen body width, plus a little air
const EDGE = 50; // keep the dome this far from the top and bottom of the viewport

type State = "follow" | "play" | "held" | "dropped";

export function startRoam(ghost: Ghost, canvas: HTMLCanvasElement, from: Vec, onPoke: () => void) {
  ghost.enterRoam(from);
  ghost.resize();

  const main = document.querySelector<HTMLElement>(".page-main");
  let colL = 0;
  let colR = 0;
  let laneL = MARGIN;
  let laneR = MARGIN;
  const measure = () => {
    const vw = document.documentElement.clientWidth;
    if (main) {
      const r = main.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(main).paddingLeft) || 0;
      colL = r.left + pad;
      colR = r.right - pad;
    } else {
      colL = 0;
      colR = vw;
    }
    // Middle of the free strip beside the column; when it is too narrow the ghost peeks in from the edge.
    laneL = colL >= MARGIN * 2 ? colL / 2 : 6;
    laneR = vw - colR >= MARGIN * 2 ? (colR + vw) / 2 : vw - 6;
  };
  measure();

  let state: State = "follow";
  let side = from.x < document.documentElement.clientWidth / 2 ? -1 : 1;
  let cursor: Vec | null = null; // stays null on touch-only devices
  let lastMove = 0;

  let driftY = 0;
  let driftUntil = 0;

  let angle = 0;
  let nextBump = 0;

  let grab = v();
  let start = v();
  let moved = 0;
  let lastPointer = v();
  let flick = v(); // smoothed pointer velocity in px per event
  let shake = 0;
  let droppedUntil = 0;
  let dropGoal = v();

  const setCursor = (value: string) => {
    if (document.body.style.cursor !== value) document.body.style.cursor = value;
  };
  const blockSelect = (event: Event) => event.preventDefault();

  const onMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    cursor = v(event.clientX, event.clientY);
    lastMove = ghost.now;
    if (state === "held") {
      const dx = event.clientX - lastPointer.x;
      const dy = event.clientY - lastPointer.y;
      flick = v(flick.x * 0.6 + dx * 0.4, flick.y * 0.6 + dy * 0.4);
      moved = Math.max(moved, Math.hypot(event.clientX - start.x, event.clientY - start.y));
      shake += Math.min(Math.hypot(dx, dy), 60) * 0.12;
      lastPointer = cursor;
    } else {
      setCursor(ghost.hitTest(event.clientX, event.clientY) ? "grab" : "");
    }
  };

  const onDown = (event: PointerEvent) => {
    if (event.pointerType === "touch" || event.button !== 0) return;
    if (!ghost.hitTest(event.clientX, event.clientY)) return;
    event.preventDefault();
    const head = ghost.screenHead();
    grab = v(head.x - event.clientX, head.y - event.clientY);
    start = lastPointer = v(event.clientX, event.clientY);
    flick = v();
    moved = 0;
    shake = 0;
    state = "held";
    setCursor("grabbing");
    document.body.style.userSelect = "none";
    document.addEventListener("selectstart", blockSelect);
  };

  const onUp = () => {
    if (state !== "held") return;
    document.body.style.userSelect = "";
    document.removeEventListener("selectstart", blockSelect);
    setCursor("");
    ghost.setDizzy(false);

    // A grab must not also count as a click on whatever link sits under the ghost.
    const swallow = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("click", swallow, true);
    setTimeout(() => window.removeEventListener("click", swallow, true), 50);

    if (moved < 4) onPoke();
    // Carry the throw: aim a little ahead of where the hand let go.
    const head = ghost.screenHead();
    const vh = window.innerHeight;
    dropGoal = v(
      clamp(head.x + flick.x * 10, 6, document.documentElement.clientWidth - 6),
      clamp(head.y + flick.y * 10, EDGE, vh - EDGE),
    );
    droppedUntil = ghost.now + DROPPED_FOR;
    state = "dropped";
  };

  const direct = (g: Ghost) => {
    const now = g.now;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const head = g.screenHead();

    // Fade while over the text column so it never hides anything for long.
    const over = head.x > colL + 20 && head.x < colR - 20 ? "0.5" : "1";
    if (canvas.style.opacity !== over) canvas.style.opacity = over;

    if (state === "held" && cursor) {
      g.aim(cursor.x + grab.x, cursor.y + grab.y, 0.14);
      g.drag(0.82);
      flick = v(flick.x * 0.92, flick.y * 0.92);
      shake = Math.max(0, shake - 0.6);
      g.setDizzy(shake > 30);
      return;
    }

    if (state === "dropped") {
      if (now > droppedUntil) state = "follow";
      else {
        g.aim(dropGoal.x, dropGoal.y, 0.01);
        return;
      }
    }

    if (cursor) {
      const d = Math.hypot(cursor.x - head.x, cursor.y - head.y);
      if (state === "follow" && d < PLAY_ENTER) {
        state = "play";
        nextBump = now + 4 * TPS;
      } else if (state === "play" && d > PLAY_EXIT) {
        state = "follow";
      }
    } else if (state === "play") {
      state = "follow";
    }

    if (state === "play" && cursor) {
      // Circle the cursor, then nudge into it and cheer.
      angle += 0.06;
      g.aim(cursor.x + Math.cos(angle) * 70, cursor.y + Math.sin(angle) * 70, 0.03);
      g.drag(0.94);
      if (now >= nextBump) {
        nextBump = now + rand(4, 7) * TPS;
        g.kick(v(Math.sign(cursor.x - head.x) * 6, Math.sign(cursor.y - head.y) * 6));
        if (!g.busy) g.playHappy();
      }
      return;
    }

    // Follow / idle / drift.
    if (cursor) {
      // Swap sides only once the cursor is well past the middle, so it never flaps.
      if (side < 0 && cursor.x > vw * 0.7) side = 1;
      else if (side > 0 && cursor.x < vw * 0.3) side = -1;
    }
    const laneX = side < 0 ? laneL : laneR;
    const dy = cursor ? cursor.y - head.y : 0;
    let goalY = head.y;
    let pull = 0.012;

    if (cursor && Math.abs(dy) > DEADZONE) {
      goalY = cursor.y - Math.sign(dy) * DEADZONE * 0.5;
      pull = clamp(0.012 + ((Math.abs(dy) - DEADZONE) / vh) * 0.06, 0.012, 0.04);
      g.drag(0.9);
      driftUntil = 0;
    } else if (!cursor || now - lastMove > DRIFT_AFTER) {
      if (now > driftUntil) {
        driftY = clamp(head.y + rand(-DRIFT_RANGE, DRIFT_RANGE), EDGE, vh - EDGE);
        driftUntil = now + Math.round(rand(5, 9) * TPS);
      }
      goalY = driftY;
    }

    const crossing = Math.abs(head.x - laneX) > 80;
    g.aim(laneX, clamp(goalY, EDGE, vh - EDGE), crossing ? Math.max(pull, 0.02) : pull);
  };

  ghost.director = direct;
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onDown, { capture: true });
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
  window.addEventListener("resize", measure);

  // Fly back to the hero, fade out there, and only then hand the canvas back to the hero layout.
  return (done: () => void) => {
    onUp();
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerdown", onDown, true);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
    window.removeEventListener("resize", measure);
    setCursor("");

    const hero = document.querySelector<HTMLElement>("[data-ghost]");
    const since = ghost.now;
    let landedAt = 0;
    ghost.director = (g) => {
      if (landedAt) {
        if (g.now - landedAt > 14) {
          ghost.director = null;
          done();
        }
        return;
      }
      const rect = hero?.getBoundingClientRect();
      const onScreen = !!rect && rect.bottom > 0 && rect.top < window.innerHeight;
      const head = g.screenHead();
      let arrived = g.now - since > 3 * TPS;
      if (rect && onScreen) {
        const target = v(rect.left + rect.width / 2, rect.top + (rect.height * 152) / 410);
        g.aim(target.x, target.y, 0.05);
        g.drag(0.9);
        arrived ||= Math.hypot(target.x - head.x, target.y - head.y) < 12;
      } else {
        arrived = true; // hero is scrolled away, there is nowhere to fly to
      }
      if (arrived) {
        landedAt = g.now;
        canvas.style.opacity = "0";
      }
    };
  };
}
