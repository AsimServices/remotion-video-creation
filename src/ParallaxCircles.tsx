import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CircleDef {
  id: number;
  // base position in normalised coords [0..1]
  bx: number;
  by: number;
  // radius in px
  radius: number;
  // depth layer: 0 = far back (slowest, most transparent), 1 = closest (fastest, most opaque)
  depth: number;
  // parallax drift path params
  driftAmpX: number;  // px
  driftAmpY: number;  // px
  driftFreqX: number; // cycles per video
  driftFreqY: number;
  driftPhaseX: number;
  driftPhaseY: number;
  // visual
  color: [number, number, number]; // RGB
  baseOpacity: number;
  blur: number; // px gaussian blur
  strokeWidth: number;
  strokeOpacity: number;
}

// ─── Seeded pseudo-random ─────────────────────────────────────────────────────

function rand(seed: number): number {
  const x = Math.sin(seed + 137.508) * 93176.9341;
  return x - Math.floor(x);
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const PALETTES: [number, number, number][] = [
  [120, 80,  220],  // violet
  [60,  130, 240],  // periwinkle blue
  [30,  170, 200],  // teal
  [180, 100, 255],  // lavender
  [20,  200, 180],  // aquamarine
  [100, 60,  200],  // indigo
  [80,  160, 255],  // sky blue
  [200, 120, 255],  // soft purple
  [40,  210, 210],  // cyan
];

// ─── Build circle definitions ─────────────────────────────────────────────────

function buildCircles(count: number, W: number, H: number): CircleDef[] {
  const circles: CircleDef[] = [];
  for (let i = 0; i < count; i++) {
    const depth = rand(i * 7 + 1);            // 0 = far, 1 = near
    const radius = lerp(35, 320, rand(i * 7 + 2)) * (0.6 + 0.8 * (1 - depth));

    circles.push({
      id: i,
      bx: rand(i * 7 + 3),
      by: rand(i * 7 + 4),
      radius,
      depth,
      driftAmpX: lerp(18, 90,  rand(i * 7 + 5)) * (1 + depth),
      driftAmpY: lerp(12, 60,  rand(i * 7 + 6)) * (1 + depth),
      driftFreqX: lerp(0.15, 0.55, rand(i * 11 + 1)),
      driftFreqY: lerp(0.10, 0.45, rand(i * 11 + 2)),
      driftPhaseX: rand(i * 11 + 3) * Math.PI * 2,
      driftPhaseY: rand(i * 11 + 4) * Math.PI * 2,
      color: PALETTES[i % PALETTES.length],
      // far circles: very low opacity; near: more visible
      baseOpacity: lerp(0.04, 0.22, depth),
      blur: lerp(18, 1, depth),
      strokeWidth: lerp(0.6, 2.5, depth),
      strokeOpacity: lerp(0.08, 0.45, depth),
    });
  }
  // Sort far → near so near circles paint on top
  return circles.sort((a, b) => a.depth - b.depth);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const CIRCLE_COUNT = 60;

export const ParallaxCircles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // Build once (stable across frames since it only depends on W/H)
  const circles = React.useMemo(() => buildCircles(CIRCLE_COUNT, width, height), [width, height]);

  const t = frame / durationInFrames; // 0 → 1 over the whole video

  // Global fade in/out
  const masterOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Slow global camera drift — very gentle sinusoidal pan
  const camX = 22 * Math.sin(t * Math.PI * 2 * 0.4);
  const camY = 14 * Math.cos(t * Math.PI * 2 * 0.28);

  return (
    <div
      style={{
        width,
        height,
        overflow: 'hidden',
        position: 'relative',
        background: 'radial-gradient(ellipse 110% 90% at 50% 40%, #0d0e2a 0%, #08091e 50%, #030308 100%)',
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, opacity: masterOpacity }}
      >
        <defs>
          {/* One blur filter per unique blur level — group into bands */}
          {[2, 5, 10, 16, 22].map((b) => (
            <filter key={b} id={`blur-${b}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={b} />
            </filter>
          ))}
        </defs>

        {circles.map((c) => {
          // Per-circle parallax drift
          const dx =
            c.driftAmpX * Math.sin(t * Math.PI * 2 * c.driftFreqX + c.driftPhaseX) +
            camX * (0.2 + c.depth * 1.4); // perspective offset from camera drift
          const dy =
            c.driftAmpY * Math.cos(t * Math.PI * 2 * c.driftFreqY + c.driftPhaseY) +
            camY * (0.2 + c.depth * 1.4);

          const cx = c.bx * width + dx;
          const cy = c.by * height + dy;

          // Assign blur filter band
          const blurVal = c.blur < 4 ? 2 : c.blur < 8 ? 5 : c.blur < 14 ? 10 : c.blur < 19 ? 16 : 22;
          const filterId = `blur-${blurVal}`;

          // Gentle breathing pulse per circle
          const breathe = 1 + 0.04 * Math.sin(t * Math.PI * 2 * lerp(0.3, 0.9, c.depth) + c.driftPhaseX);
          const r = c.radius * breathe;

          const [R, G, B] = c.color;
          const fill = `rgba(${R},${G},${B},${c.baseOpacity})`;
          const stroke = `rgba(${R},${G},${B},${c.strokeOpacity})`;

          return (
            <circle
              key={c.id}
              cx={cx}
              cy={cy}
              r={r}
              fill={fill}
              stroke={stroke}
              strokeWidth={c.strokeWidth}
              filter={`url(#${filterId})`}
            />
          );
        })}
      </svg>
    </div>
  );
};
