import type { RefObject } from "react";

/*
 * SVG path data from SimonAKing/HomePage — identical command structure for smooth morphing.
 * The shape grows from a thin strip near the top of the SVG (initial) into a deep wavy curtain (target).
 */
const PATH_FLAT =
  "M -44,-50 C -52.71,28.52 15.86,8.186 184,14.69 383.3,22.39 462.5,12.58 638,14 835.5,15.6 987,6.4 1194,13.86 1661,30.68 1652,-36.74 1582,-140.1 1512,-243.5 15.88,-589.5 -44,-50 Z";

const PATH_WAVE =
  "M -44,-50 C -137.1,117.4 67.86,445.5 236,452 435.3,459.7 500.5,242.6 676,244 873.5,245.6 957,522.4 1154,594 1593,753.7 1793,226.3 1582,-126 1371,-478.3 219.8,-524.2 -44,-50 Z";

export function interpolateWavePath(t: number): string {
  const re = /-?\d+(?:\.\d+)?/g;
  const a = PATH_FLAT.match(re)!.map(Number);
  const b = PATH_WAVE.match(re)!.map(Number);

  let i = 0;
  return PATH_FLAT.replace(re, () => {
    const val = a[i] + (b[i] - a[i]) * Math.min(Math.max(t, 0), 1);
    i++;
    return String(Math.round(val * 100) / 100);
  });
}

interface WaveProps {
  pathRef: RefObject<SVGPathElement | null>;
}

export function Wave({ pathRef }: WaveProps) {
  return (
    <svg
      className="wave"
      width="100%"
      height="100vh"
      preserveAspectRatio="none"
      viewBox="0 0 1440 800"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="wave-clip">
          <path ref={pathRef} d={PATH_FLAT} />
        </clipPath>
      </defs>
    </svg>
  );
}
