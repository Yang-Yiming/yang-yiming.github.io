// Owns the fullscreen canvas and ghost used by Roam. Every page builds its own, so the ghost
// is on all pages without any router or stored state: it simply fades in where the page loads.

import { Ghost } from "./ghost";
import { createPoker } from "./poke";
import { startRoam } from "./roam";

export type RoamHandle = {
  /** Fly home (if the hero is on screen), fade out, then call `done`. */
  leave(done: () => void): void;
  /** Remove everything immediately. */
  destroy(): void;
};

function spawnPoint() {
  const hero = document.querySelector<HTMLElement>("[data-ghost-canvas]");
  const rect = hero?.getBoundingClientRect();
  if (rect && rect.width && rect.bottom > 0 && rect.top < window.innerHeight) {
    return { x: rect.left + rect.width / 2, y: rect.top + (rect.height * 152) / 410 };
  }
  return { x: document.documentElement.clientWidth - 60, y: window.innerHeight * 0.4 };
}

export function enterRoamHost(photos: string[]): RoamHandle {
  const canvas = document.createElement("canvas");
  canvas.className = "roam-canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.opacity = "0";
  document.body.append(canvas);

  const ghost = new Ghost(canvas);
  ghost.setMode("roam", { instant: true });
  const stop = startRoam(ghost, canvas, spawnPoint(), createPoker(ghost, photos));
  ghost.start();

  const destroy = () => {
    ghost.destroy();
    canvas.remove();
  };
  return {
    leave: (done) =>
      stop(() => {
        destroy();
        done();
      }),
    destroy,
  };
}
