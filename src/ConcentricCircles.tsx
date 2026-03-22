import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// ─── Config ────────────────────────────────────────────────────────────────

interface RingConfig {
  radius: number;         // distance from center (px)
  count: number;          // number of shapes on this ring
  shape: 'triangle' | 'hexagon';
  size: number;           // circumradius of shape (px)
  speed: number;          // full rotations per 10 s (positive = CW, negative = CCW)
  color: string;
  strokeColor: string;
  strokeWidth: number;
  fillOpacity: number;
}

const RINGS: RingConfig[] = [
  // innermost – fast CW triangles
  {
    radius: 90,
    count: 6,
    shape: 'triangle',
    size: 18,
    speed: 2.0,
    color: '#a78bfa',
    strokeColor: '#c4b5fd',
    strokeWidth: 1.5,
    fillOpacity: 0.35,
  },
  // ring 2 – medium CCW hexagons
  {
    radius: 175,
    count: 8,
    shape: 'hexagon',
    size: 22,
    speed: -1.4,
    color: '#60a5fa',
    strokeColor: '#93c5fd',
    strokeWidth: 1.5,
    fillOpacity: 0.30,
  },
  // ring 3 – slow CW triangles
  {
    radius: 265,
    count: 12,
    shape: 'triangle',
    size: 20,
    speed: 0.9,
    color: '#34d399',
    strokeColor: '#6ee7b7',
    strokeWidth: 1.5,
    fillOpacity: 0.28,
  },
  // ring 4 – medium-fast CCW hexagons
  {
    radius: 355,
    count: 14,
    shape: 'hexagon',
    size: 26,
    speed: -1.8,
    color: '#fb923c',
    strokeColor: '#fdba74',
    strokeWidth: 1.5,
    fillOpacity: 0.25,
  },
  // ring 5 – very slow CW hexagons
  {
    radius: 445,
    count: 16,
    shape: 'hexagon',
    size: 28,
    speed: 0.5,
    color: '#f472b6',
    strokeColor: '#f9a8d4',
    strokeWidth: 1.5,
    fillOpacity: 0.22,
  },
  // ring 6 – fast CCW triangles
  {
    radius: 535,
    count: 20,
    shape: 'triangle',
    size: 24,
    speed: -2.4,
    color: '#facc15',
    strokeColor: '#fde68a',
    strokeWidth: 1.5,
    fillOpacity: 0.20,
  },
  // outermost – ultra-slow CW mixed (hexagons)
  {
    radius: 625,
    count: 24,
    shape: 'hexagon',
    size: 30,
    speed: 0.3,
    color: '#38bdf8',
    strokeColor: '#7dd3fc',
    strokeWidth: 1.5,
    fillOpacity: 0.18,
  },
];

// ─── Shape helpers ──────────────────────────────────────────────────────────

/** Returns the SVG polygon `points` string for a regular n-gon of given circumradius, centered at origin */
function regularNGon(n: number, r: number, startAngleDeg = 0): string {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = ((2 * Math.PI) / n) * i + (startAngleDeg * Math.PI) / 180;
    pts.push(`${r * Math.cos(a)},${r * Math.sin(a)}`);
  }
  return pts.join(' ');
}

const trianglePoints = (r: number) => regularNGon(3, r, -90);
const hexagonPoints = (r: number) => regularNGon(6, r, 0);

// ─── Single Shape ───────────────────────────────────────────────────────────

interface ShapeProps {
  cfg: RingConfig;
  angleDeg: number; // angular position on the ring
  ringAngle: number; // ring-level rotation applied to this shape's own facing
}

const Shape: React.FC<ShapeProps> = ({ cfg, angleDeg, ringAngle }) => {
  const rad = (angleDeg * Math.PI) / 180;
  const x = cfg.radius * Math.cos(rad);
  const y = cfg.radius * Math.sin(rad);
  const points =
    cfg.shape === 'triangle'
      ? trianglePoints(cfg.size)
      : hexagonPoints(cfg.size);

  // Each shape also rotates around its own center at the ring speed (nice local spin)
  const localSpin = ringAngle;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${localSpin})`}>
      <polygon
        points={points}
        fill={cfg.color}
        fillOpacity={cfg.fillOpacity}
        stroke={cfg.strokeColor}
        strokeWidth={cfg.strokeWidth}
        strokeLinejoin="round"
      />
    </g>
  );
};

// ─── Single Ring ─────────────────────────────────────────────────────────────

interface RingProps {
  cfg: RingConfig;
  ringAngleDeg: number; // current rotation angle of the whole ring
}

const Ring: React.FC<RingProps> = ({ cfg, ringAngleDeg }) => {
  const shapes = Array.from({ length: cfg.count }, (_, i) => {
    const baseAngle = (360 / cfg.count) * i;
    return (
      <Shape
        key={i}
        cfg={cfg}
        angleDeg={baseAngle + ringAngleDeg}
        ringAngle={ringAngleDeg}
      />
    );
  });

  return <g>{shapes}</g>;
};

// ─── Orbit trail circles ─────────────────────────────────────────────────────

const OrbitTrail: React.FC<{ radius: number; color: string }> = ({
  radius,
  color,
}) => (
  <circle
    cx={0}
    cy={0}
    r={radius}
    fill="none"
    stroke={color}
    strokeWidth={0.6}
    strokeOpacity={0.15}
    strokeDasharray="4 6"
  />
);

// ─── Center glow pulse ────────────────────────────────────────────────────────

const CenterGlow: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const t = frame / fps;
  const pulse = 0.7 + 0.3 * Math.sin(t * 2 * Math.PI * 0.8);
  return (
    <>
      <radialGradient id="cg1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.9 * pulse} />
        <stop offset="40%" stopColor="#60a5fa" stopOpacity={0.5 * pulse} />
        <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
      </radialGradient>
      <circle cx={0} cy={0} r={70 * pulse} fill="url(#cg1)" />
      {/* inner bright dot */}
      <circle cx={0} cy={0} r={10} fill="#e0e7ff" fillOpacity={0.85 * pulse} />
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const ConcentricCircles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2;

  // Global fade-in (first 60 frames) and fade-out (last 60 frames)
  const opacity = interpolate(
    frame,
    [0, 60, durationInFrames - 60, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Subtle slow camera drift – the whole SVG gently shifts
  const driftX = 18 * Math.sin((frame / fps) * 0.18 * 2 * Math.PI);
  const driftY = 12 * Math.cos((frame / fps) * 0.12 * 2 * Math.PI);

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse 80% 70% at 50% 50%, #1e1b4b 0%, #0f172a 55%, #020617 100%)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Starfield layer */}
      <Stars width={width} height={height} />

      {/* Main SVG */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, opacity }}
      >
        <g transform={`translate(${cx + driftX}, ${cy + driftY})`}>
          {/* Orbit trail dashed rings */}
          {RINGS.map((r, i) => (
            <OrbitTrail key={i} radius={r.radius} color={r.strokeColor} />
          ))}

          {/* Rotating shape rings */}
          {RINGS.map((cfg, i) => {
            // Convert speed (rotations per 10 s) → degrees per frame
            const degreesPerFrame = (cfg.speed * 360) / (10 * fps);
            const ringAngleDeg = frame * degreesPerFrame;
            return (
              <Ring key={i} cfg={cfg} ringAngleDeg={ringAngleDeg} />
            );
          })}

          {/* Center glow */}
          <CenterGlow frame={frame} fps={fps} />
        </g>
      </svg>

      {/* Title overlay */}
      <TitleOverlay frame={frame} fps={fps} durationInFrames={durationInFrames} />
    </div>
  );
};

// ─── Starfield ────────────────────────────────────────────────────────────────

const STAR_SEED = 42;
function pseudoRand(n: number): number {
  const x = Math.sin(n + STAR_SEED) * 10000;
  return x - Math.floor(x);
}

const Stars: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const stars = Array.from({ length: 180 }, (_, i) => ({
    x: pseudoRand(i * 3) * width,
    y: pseudoRand(i * 3 + 1) * height,
    r: 0.5 + pseudoRand(i * 3 + 2) * 1.5,
    op: 0.2 + pseudoRand(i * 7) * 0.6,
  }));

  return (
    <svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" fillOpacity={s.op} />
      ))}
    </svg>
  );
};

// ─── Title overlay ────────────────────────────────────────────────────────────

const TitleOverlay: React.FC<{
  frame: number;
  fps: number;
  durationInFrames: number;
}> = ({ frame, fps, durationInFrames }) => {
  const titleOpacity = interpolate(
    frame,
    [0, 40, durationInFrames - 50, durationInFrames - 10],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const titleY = interpolate(frame, [0, 50], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
        pointerEvents: 'none',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          color: '#e0e7ff',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          textShadow: '0 0 30px #818cf8, 0 0 60px #4f46e5',
        }}
      >
        Concentric Orbits
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 400,
          color: '#94a3b8',
          letterSpacing: '0.3em',
          marginTop: 8,
          textTransform: 'uppercase',
        }}
      >
        Triangles &amp; Hexagons · Rotating at Different Speeds
      </div>
    </div>
  );
};
