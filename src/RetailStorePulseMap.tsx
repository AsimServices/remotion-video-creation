import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const STORES = Array.from({ length: 40 }, (_, i) => ({
  x: ((i * 2341 + 500) % 3400) + 220,
  y: ((i * 1733 + 300) % 1800) + 180,
  salesLevel: ((i * 7 + 3) % 10) / 10 + 0.1,
  pulseOffset: (i * 47) % 120,
  size: ((i * 13) % 6) + 8,
  colorIndex: i % 5,
}));

const GRID_LINES_H = Array.from({ length: 32 }, (_, i) => ({
  y: (i * 70) + 20,
  opacity: ((i * 3 + 1) % 5) * 0.04 + 0.03,
}));

const GRID_LINES_V = Array.from({ length: 56 }, (_, i) => ({
  x: (i * 70) + 20,
  opacity: ((i * 7 + 2) % 5) * 0.04 + 0.03,
}));

const BLOCKS = Array.from({ length: 120 }, (_, i) => ({
  x: ((i * 311) % 3600) + 100,
  y: ((i * 197) % 1900) + 80,
  w: ((i * 73) % 120) + 40,
  h: ((i * 89) % 80) + 30,
  opacity: ((i * 5) % 7) * 0.012 + 0.018,
}));

const ROADS_H = Array.from({ length: 14 }, (_, i) => ({
  y: (i * 155) + 80,
  thickness: (i % 3) * 1.5 + 1.5,
}));

const ROADS_V = Array.from({ length: 24 }, (_, i) => ({
  x: (i * 162) + 60,
  thickness: (i % 3) * 1.5 + 1.5,
}));

const STORE_COLORS = [
  { ring: '#ff6b35', glow: '#ff4500', dot: '#ffaa80' },
  { ring: '#00e5ff', glow: '#0099cc', dot: '#80f0ff' },
  { ring: '#76ff03', glow: '#4caf00', dot: '#ccff80' },
  { ring: '#ff1744', glow: '#cc0033', dot: '#ff8080' },
  { ring: '#e040fb', glow: '#9c00cc', dot: '#f0a0ff' },
];

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  x: ((i * 1931) % 3840),
  y: ((i * 1237) % 2160),
  size: ((i * 11) % 4) + 1,
  speed: ((i * 7) % 40) + 20,
  opacity: ((i * 3) % 8) * 0.04 + 0.06,
  delay: (i * 17) % 200,
}));

export const RetailStorePulseMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scanLine = ((frame * 3) % (height + 200)) - 100;

  return (
    <div style={{
      width, height,
      background: '#040608',
      overflow: 'hidden',
      opacity: globalOpacity,
      position: 'relative',
    }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0a1020" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>
          <filter id="glow1" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow2" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow3" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="28" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width={width} height={height} fill="url(#bgGrad)" />

        {/* City blocks */}
        {BLOCKS.map((b, i) => (
          <rect
            key={`block-${i}`}
            x={b.x} y={b.y} width={b.w} height={b.h}
            fill={`rgba(15, 35, 60, ${b.opacity})`}
            rx={1}
          />
        ))}

        {/* Grid lines horizontal */}
        {GRID_LINES_H.map((l, i) => (
          <line
            key={`gh-${i}`}
            x1={0} y1={l.y} x2={width} y2={l.y}
            stroke={`rgba(30, 80, 140, ${l.opacity})`}
            strokeWidth={0.5}
          />
        ))}

        {/* Grid lines vertical */}
        {GRID_LINES_V.map((l, i) => (
          <line
            key={`gv-${i}`}
            x1={l.x} y1={0} x2={l.x} y2={height}
            stroke={`rgba(30, 80, 140, ${l.opacity})`}
            strokeWidth={0.5}
          />
        ))}

        {/* Roads horizontal */}
        {ROADS_H.map((r, i) => (
          <line
            key={`rh-${i}`}
            x1={0} y1={r.y} x2={width} y2={r.y}
            stroke="rgba(20, 60, 100, 0.18)"
            strokeWidth={r.thickness}
          />
        ))}

        {/* Roads vertical */}
        {ROADS_V.map((r, i) => (
          <line
            key={`rv-${i}`}
            x1={r.x} y1={0} x2={r.x} y2={height}
            stroke="rgba(20, 60, 100, 0.18)"
            strokeWidth={r.thickness}
          />
        ))}

        {/* Floating particles */}
        {PARTICLES.map((p, i) => {
          const t = ((frame + p.delay) % p.speed) / p.speed;
          const py = p.y - t * 60;
          const fadeP = Math.sin(t * Math.PI) * p.opacity;
          return (
            <circle
              key={`part-${i}`}
              cx={p.x}
              cy={py}
              r={p.size}
              fill={`rgba(80, 160, 255, ${fadeP})`}
            />
          );
        })}

        {/* Store pulse rings */}
        {STORES.map((store, i) => {
          const color = STORE_COLORS[store.colorIndex];
          const t = ((frame + store.pulseOffset) % 90) / 90;
          const t2 = ((frame + store.pulseOffset + 30) % 90) / 90;
          const t3 = ((frame + store.pulseOffset + 60) % 90) / 90;

          const maxRadius = (store.salesLevel * 180 + 80);

          const r1 = t * maxRadius;
          const o1 = interpolate(t, [0, 0.3, 1], [0.9, 0.6, 0]);
          const r2 = t2 * maxRadius;
          const o2 = interpolate(t2, [0, 0.3, 1], [0.7, 0.4, 0]);
          const r3 = t3 * maxRadius;
          const o3 = interpolate(t3, [0, 0.3, 1], [0.5, 0.25, 0]);

          const dotPulse = 1 + Math.sin(frame * 0.12 + store.pulseOffset * 0.1) * 0.3;
          const dotSize = store.size * dotPulse;

          const glowPulse = interpolate(
            Math.sin(frame * 0.08 + store.pulseOffset * 0.08),
            [-1, 1], [0.5, 1.0]
          );

          return (
            <g key={`store-${i}`}>
              {/* Outer glow halo */}
              <circle
                cx={store.x} cy={store.y}
                r={store.size * 4 * glowPulse}
                fill="none"
                stroke={color.glow}
                strokeWidth={2}
                opacity={0.15 * glowPulse}
                filter="url(#glow3)"
              />
              {/* Pulse rings */}
              <circle cx={store.x} cy={store.y} r={r1} fill="none"
                stroke={color.ring} strokeWidth={2.5}
                opacity={o1 * store.salesLevel} filter="url(#glow1)" />
              <circle cx={store.x} cy={store.y} r={r2} fill="none"
                stroke={color.ring} strokeWidth={1.8}
                opacity={o2 * store.salesLevel} filter="url(#glow1)" />
              <circle cx={store.x} cy={store.y} r={r3} fill="none"
                stroke={color.ring} strokeWidth={1.2}
                opacity={o3 * store.salesLevel} />

              {/* Inner filled glow */}
              <circle cx={store.x} cy={store.y} r={dotSize * 2.5}
                fill={color.glow} opacity={0.2 * glowPulse} filter="url(#glow2)" />
              {/* Core dot */}
              <circle cx={store.x} cy={store.y} r={dotSize}
                fill={color.dot} opacity={0.95} filter="url(#softGlow)" />
              {/* Center bright */}
              <circle cx={store.x} cy={store.y} r={dotSize * 0.4}
                fill="#ffffff" opacity={0.9} />
            </g>
          );
        })}

        {/* Scan line effect */}
        <rect
          x={0} y={scanLine} width={width} height={2}
          fill="rgba(0, 180, 255, 0.04)"
        />
        <rect
          x={0} y={scanLine - 1} width={width} height={1}
          fill="rgba(0, 200, 255, 0.02)"
        />

        {/* Vignette overlay */}
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="40%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(2,4,8,0.85)" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#vignette)" />

        {/* Top highlight haze */}
        <rect x={0} y={0} width={width} height={height * 0.3}
          fill="rgba(0, 60, 120, 0.03)" />

        {/* Central ambient glow */}
        <ellipse
          cx={width / 2} cy={height / 2}
          rx={width * 0.4} ry={height * 0.35}
          fill="rgba(0, 80, 160, 0.04)"
        />
      </svg>
    </div>
  );
};