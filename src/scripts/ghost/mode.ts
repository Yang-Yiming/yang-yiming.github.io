// The ghost's behaviour mode, shared by the hero ghost and the switch in the Fun section.
// Stored like the theme so a visitor's choice survives reloads.

export type GhostMode = "calm" | "lively";

const KEY = "ghost-mode";
const EVENT = "ghost-mode-change";

export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function readGhostMode(): GhostMode {
  return localStorage.getItem(KEY) === "lively" ? "lively" : "calm";
}

export function writeGhostMode(mode: GhostMode) {
  localStorage.setItem(KEY, mode);
  document.dispatchEvent(new CustomEvent<GhostMode>(EVENT, { detail: mode }));
}

export function onGhostMode(listener: (mode: GhostMode) => void) {
  document.addEventListener(EVENT, (event) => listener((event as CustomEvent<GhostMode>).detail));
}
