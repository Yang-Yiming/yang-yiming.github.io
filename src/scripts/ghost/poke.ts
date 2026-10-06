import type { Ghost } from "./ghost";

/** Returns a reaction trigger: a click makes the ghost happy (sometimes with a photo face) or angry. */
export function createPoker(ghost: Ghost, srcs: string[]) {
  const images = srcs.map((src) => Object.assign(new Image(), { src }));
  let lastWasHappy: boolean | null = null;

  return () => {
    if (ghost.busy) return;
    // Bias against repeats so reactions feel varied while staying ~50/50 overall.
    const threshold = lastWasHappy === null ? 0.5 : lastWasHappy ? 0.7 : 0.3;
    lastWasHappy = Math.random() > threshold;
    if (lastWasHappy) {
      const ready = images.filter((image) => image.complete && image.naturalWidth);
      ghost.setPhoto(ready[Math.floor(Math.random() * ready.length)] ?? null);
      ghost.playHappy();
    } else {
      ghost.playAngry();
    }
  };
}
