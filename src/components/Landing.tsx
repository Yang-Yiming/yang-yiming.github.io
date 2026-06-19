import type { RefObject } from "react";
import { siteMeta } from "../content";
import { Wave } from "./Wave";

interface LandingProps {
  onEnter?: () => void;
  pathRef: RefObject<SVGPathElement | null>;
}

export function Landing({ onEnter, pathRef }: LandingProps) {
  return (
    <section className="landing" aria-label="Intro">
      <div className="landing__content">
        <p className="landing__greeting">Hello</p>
        <p className="landing__name">{siteMeta.name}</p>
        <p className="landing__role">{siteMeta.role}</p>
      </div>
      <button
        className="landing__hint"
        type="button"
        onClick={onEnter}
        aria-label="Enter site"
      >
        <span>Scroll</span>
        <span className="landing__hint-arrow">↓</span>
      </button>
      <Wave pathRef={pathRef} />
    </section>
  );
}
