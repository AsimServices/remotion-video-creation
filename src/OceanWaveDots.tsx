import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// ─── Config ────────────────────────────────────────────────────────────────

const COLS = 50;
const ROWS = 30;
const DOT_SPACING = 38;
const BASE_DOT_RADIUS = 3;
const MAX_WAVE_HEIGHT = 120; // max vertical displacement in px
const PERSPECTIVE = 900;
const CAMERA_TILT_DEG = 55; // isometric-ish tilt

// Wave layers – multiple sine waves overlaid for organic feel
interface WaveLayer {
  freqX: number;   // spatial frequency along X
  freqY: number;   // spatial frequency along Y
  speed: number;   // temporal speed (cycles per 10s)
  amplitude: number; // 0-1 fraction of MAX_WAVE_HEIGHT
  phase: number;   // initial phase offset
}

const WAVES: WaveLayer[] = [
  { freqX: 0.08, freqY: 0.04, speed: 0.6, amplitude: 1.0, phase: 0 },
  { freqX: 0.12, freqY: 0.10, speed: 0.9, amplitude: 0.4, phase: 1.2 },
  { freqX: 0.05, freqY: 0.15, speed: 0.35, amplitude: 0.5, phase: 2.8 },
  { freqX: 0.18, freqY: 0.06, speed: 1.2, amplitude: 0.25, phase: 4.1 },
];

// ─── Color helpers ──────────────────────────────────────────────────────────

function lerpColor(a: [number, number, number], b: [number, number, number], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

// Deep ocean blue → cyan → seafoam white
const COLOR_LOW: [number, number, number] = [15, 23, 75];      // deep blue
const COLOR_MID: [number, number, number] = [34, 140, 195];    // ocean blue
const COLOR_HIGH: [number, number, number] = [180, 240, 255];  // seafoam crest

function waveColor(normalizedHeight: number): string {
  // normalizedHeight: -1 (trough) to 1 (crest)
  const t = (normalizedHeight + 1) / 2; // map to 0-1
  if (t < 0.5) {
    return lerpColor(COLOR_LOW, COLOR_MID, t * 2);
  }
  return lerpColor(COLOR_MID, COLOR_HIGH, (t - 0.5) * 2);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const OceanWaveDots: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const t = frame / fps; // time in seconds

  // Global opacity fade-in / fade-out
  const opacity = interpolate(
    frame,
    [0, 45, durationInFrames - 45, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Calculate the wave height for a grid position
  const getWaveHeight = (col: number, row: number): number => {
    let h = 0;
    for (const w of WAVES) {
      h +=
        w.amplitude *
        Math.sin(col * w.freqX * Math.PI * 2 + row * w.freqY * Math.PI * 2 + t * w.speed * Math.PI * 2 + w.phase);
    }
    // normalise by sum of amplitudes → -1..1
    const totalAmp = WAVES.reduce((s, w) => s + w.amplitude, 0);
    return h / totalAmp;
  };

  // Grid origin (center it)
  const gridW = (COLS - 1) * DOT_SPACING;
  const gridH = (ROWS - 1) * DOT_SPACING;

  // Build dot data
  const dots: {
    screenX: number;
    screenY: number;
    radius: number;
    color: string;
    opacity: number;
    depth: number;
  }[] = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // Flat grid position (centered)
      const gx = c * DOT_SPACING - gridW / 2;
      const gz = r * DOT_SPACING - gridH / 2;

      // Wave displacement on Y
      const waveNorm = getWaveHeight(c, r);
      const gy = waveNorm * MAX_WAVE_HEIGHT;

      // 3D → 2D projection (tilt the grid toward camera)
      const tiltRad = (CAMERA_TILT_DEG * Math.PI) / 180;
      const cosT = Math.cos(tiltRad);
      const sinT = Math.sin(tiltRad);

      // Rotate around X-axis by tilt
      const y3d = gy * cosT - gz * sinT;
      const z3d = gy * sinT + gz * cosT;

      // Perspective projection
      const depth = z3d + PERSPECTIVE + 400; // shift so nothing is behind camera
      const scale = PERSPECTIVE / depth;
      const screenX = gx * scale + width / 2;
      const screenY = -y3d * scale + height / 2 + 80;

      // Size & opacity based on depth for depth cue
      const radius = BASE_DOT_RADIUS * scale * (0.9 + 0.3 * ((waveNorm + 1) / 2));
      const depthOpacity = interpolate(depth, [300, 1800], [1, 0.25], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

      dots.push({
        screenX,
        screenY,
        radius: Math.max(radius, 0.8),
        color: waveColor(waveNorm),
        opacity: depthOpacity,
        depth,
      });
    }
  }

  // Sort back-to-front for correct overlap
  dots.sort((a, b) => b.depth - a.depth);

  return (
    <div
      style={{
        width,
        height,
        background: 'linear-gradient(180deg, #020617 0%, #0c1130 40%, #0f172a 100%)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Ambient glow at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '10%',
          right: '10%',
          height: '40%',
          background: 'radial-gradient(ellipse 100% 100% at 50% 100%, rgba(34,140,195,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, opacity }}
      >
        {/* Connecting lines between neighbours (subtle mesh) */}
        <g opacity={0.12}>
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const idx = r * COLS + c;
              const elements: React.ReactElement[] = [];
              // right neighbour
              if (c < COLS - 1) {
                const nIdx = r * COLS + (c + 1);
                const d = dots[idx]; // after sort these may be jumbled
                // Use unsorted for lines – recalculate
                elements.push(
                  <line
                    key={`h-${r}-${c}`}
                    x1={getScreenX(c, r)}
                    y1={getScreenY(c, r)}
                    x2={getScreenX(c + 1, r)}
                    y2={getScreenY(c + 1, r)}
                    stroke="#228cc3"
                    strokeWidth={0.5}
                  />
                );
              }
              // bottom neighbour
              if (r < ROWS - 1) {
                elements.push(
                  <line
                    key={`v-${r}-${c}`}
                    x1={getScreenX(c, r)}
                    y1={getScreenY(c, r)}
                    x2={getScreenX(c, r + 1)}
                    y2={getScreenY(c, r + 1)}
                    stroke="#228cc3"
                    strokeWidth={0.5}
                  />
                );
              }
              return elements;
            })
          )}
        </g>

        {/* Dots */}
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.screenX}
            cy={d.screenY}
            r={d.radius}
            fill={d.color}
            fillOpacity={d.opacity}
          />
        ))}
      </svg>

      {/* Title overlay */}
      <TitleOverlay frame={frame} fps={fps} durationInFrames={durationInFrames} />
    </div>
  );

  // Helper closures that recalculate screen coords for the mesh lines
  function getScreenX(c: number, r: number): number {
    const gx = c * DOT_SPACING - gridW / 2;
    const gz = r * DOT_SPACING - gridH / 2;
    const waveNorm = getWaveHeight(c, r);
    const gy = waveNorm * MAX_WAVE_HEIGHT;
    const tiltRad = (CAMERA_TILT_DEG * Math.PI) / 180;
    const z3d = gy * Math.sin(tiltRad) + gz * Math.cos(tiltRad);
    const depth = z3d + PERSPECTIVE + 400;
    const scale = PERSPECTIVE / depth;
    return gx * scale + width / 2;
  }

  function getScreenY(c: number, r: number): number {
    const gx = c * DOT_SPACING - gridW / 2;
    const gz = r * DOT_SPACING - gridH / 2;
    const waveNorm = getWaveHeight(c, r);
    const gy = waveNorm * MAX_WAVE_HEIGHT;
    const tiltRad = (CAMERA_TILT_DEG * Math.PI) / 180;
    const cosT = Math.cos(tiltRad);
    const sinT = Math.sin(tiltRad);
    const y3d = gy * cosT - gz * sinT;
    const z3d = gy * sinT + gz * cosT;
    const depth = z3d + PERSPECTIVE + 400;
    const scale = PERSPECTIVE / depth;
    return -y3d * scale + height / 2 + 80;
  }
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
        bottom: 50,
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
          color: '#e0f2fe',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          textShadow: '0 0 30px #0ea5e9, 0 0 60px #0369a1',
        }}
      >
        Ocean Wave Grid
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
        Dots Rising &amp; Falling in Harmony
      </div>
    </div>
  );
};
