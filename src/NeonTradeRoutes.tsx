import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Pre-computed deterministic data
const NATIONS = [
  { name: 'China', x: 0.72, y: 0.32 },
  { name: 'USA', x: 0.14, y: 0.34 },
  { name: 'Germany', x: 0.49, y: 0.26 },
  { name: 'Japan', x: 0.79, y: 0.34 },
  { name: 'Netherlands', x: 0.48, y: 0.24 },
  { name: 'South Korea', x: 0.77, y: 0.33 },
  { name: 'Italy', x: 0.51, y: 0.28 },
  { name: 'France', x: 0.475, y: 0.27 },
  { name: 'Belgium', x: 0.487, y: 0.25 },
  { name: 'Mexico', x: 0.17, y: 0.42 },
];

const TRADE_ROUTES = [
  { from: 0, to: 1, weight: 1.0 },
  { from: 0, to: 3, weight: 0.85 },
  { from: 0, to: 2, weight: 0.9 },
  { from: 1, to: 2, weight: 0.75 },
  { from: 0, to: 5, weight: 0.8 },
  { from: 2, to: 4, weight: 0.7 },
  { from: 3, to: 5, weight: 0.65 },
  { from: 1, to: 9, weight: 0.6 },
  { from: 0, to: 6, weight: 0.7 },
  { from: 2, to: 7, weight: 0.65 },
  { from: 0, to: 1, weight: 0.55 },
  { from: 4, to: 8, weight: 0.5 },
  { from: 1, to: 3, weight: 0.72 },
  { from: 6, to: 7, weight: 0.45 },
  { from: 2, to: 8, weight: 0.6 },
  { from: 5, to: 0, weight: 0.8 },
  { from: 9, to: 0, weight: 0.55 },
  { from: 1, to: 2, weight: 0.68 },
];

// Stagger offsets per route
const ROUTE_OFFSETS = TRADE_ROUTES.map((_, i) => (i * 37) % 60);
const PULSE_SPEEDS = TRADE_ROUTES.map((_, i) => 0.4 + ((i * 13) % 10) * 0.06);

// Node glow sizes
const NODE_PHASE_OFFSETS = NATIONS.map((_, i) => (i * 19) % 60);

// Particle data per route
const PARTICLES_PER_ROUTE = TRADE_ROUTES.map((_, ri) =>
  Array.from({ length: 5 }, (__, pi) => ({
    offset: (pi * 20 + (ri * 7) % 17) % 100,
    size: 6 + ((pi * 3 + ri * 5) % 8),
  }))
);

// Background stars
const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 1731 + 42) % 3840,
  y: (i * 1337 + 17) % 2160,
  r: ((i * 7) % 4) + 1,
  brightness: 0.2 + ((i * 11) % 8) * 0.1,
}));

function cubicBezierPoint(t: number, p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number]): [number, number] {
  const mt = 1 - t;
  const x = mt * mt * mt * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t * t * t * p3[0];
  const y = mt * mt * mt * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t * t * t * p3[1];
  return [x, y];
}

export const NeonTradeRoutes: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const masterOpacity = Math.min(fadeIn, fadeOut);

  const t = frame / 30; // time in seconds

  return (
    <div style={{ width, height, background: '#050508', position: 'relative', overflow: 'hidden', opacity: masterOpacity }}>
      {/* Background stars */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {STARS.map((star, i) => {
          const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.2 + i * 0.7));
          return (
            <circle
              key={i}
              cx={star.x}
              cy={star.y}
              r={star.r}
              fill={`rgba(200,220,255,${(star.brightness * twinkle).toFixed(3)})`}
            />
          );
        })}
      </svg>

      {/* World map silhouette hint - subtle grid */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, opacity: 0.07 }}>
        {Array.from({ length: 20 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={(i / 19) * height} x2={width} y2={(i / 19) * height} stroke="#e8ff00" strokeWidth={1} />
        ))}
        {Array.from({ length: 36 }, (_, i) => (
          <line key={`v${i}`} x1={(i / 35) * width} y1={0} x2={(i / 35) * width} y2={height} stroke="#e8ff00" strokeWidth={1} />
        ))}
      </svg>

      {/* Trade Route Arcs */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur1" />
            <feGaussianBlur stdDeviation="20" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="nodeGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="30" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {TRADE_ROUTES.map((route, ri) => {
          const fromNation = NATIONS[route.from];
          const toNation = NATIONS[route.to];

          const x0 = fromNation.x * width;
          const y0 = fromNation.y * height;
          const x3 = toNation.x * width;
          const y3 = toNation.y * height;

          // Control points for arc
          const mx = (x0 + x3) / 2;
          const my = (y0 + y3) / 2;
          const dx = x3 - x0;
          const dy = y3 - y0;
          const len = Math.sqrt(dx * dx + dy * dy);
          const arcHeight = -len * 0.35;
          const nx = -dy / len;
          const ny = dx / len;

          const cx1 = x0 + dx * 0.25 + nx * arcHeight * 0.8;
          const cy1 = y0 + dy * 0.25 + ny * arcHeight * 0.8;
          const cx2 = x0 + dx * 0.75 + nx * arcHeight * 0.8;
          const cy2 = y0 + dy * 0.75 + ny * arcHeight * 0.8;

          const pathD = `M ${x0} ${y0} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x3} ${y3}`;

          // Pulse animation: traveling glow along path
          const speed = PULSE_SPEEDS[ri];
          const offset = ROUTE_OFFSETS[ri];
          const pulseProgress = ((t * speed + offset / 60) % 1 + 1) % 1;

          const neonAlpha = 0.5 + 0.5 * Math.sin(t * 2.1 + ri * 0.8) * route.weight;
          const lineAlpha = 0.3 + 0.2 * Math.sin(t * 1.5 + ri * 1.1);

          // Approximate path length for dash
          const approxLen = len * 1.4;
          const dashLen = approxLen * 0.15;
          const dashOffset = -pulseProgress * approxLen;

          return (
            <g key={ri}>
              {/* Base dim arc */}
              <path
                d={pathD}
                fill="none"
                stroke={`rgba(200,255,0,${(lineAlpha * 0.4).toFixed(3)})`}
                strokeWidth={1.5}
              />
              {/* Glowing arc */}
              <path
                d={pathD}
                fill="none"
                stroke={`rgba(220,255,0,${(neonAlpha * 0.7).toFixed(3)})`}
                strokeWidth={2.5}
                filter="url(#neonGlow)"
              />
              {/* Traveling pulse dash */}
              <path
                d={pathD}
                fill="none"
                stroke="rgba(255,255,100,0.95)"
                strokeWidth={4}
                strokeDasharray={`${dashLen} ${approxLen}`}
                strokeDashoffset={dashOffset}
                filter="url(#neonGlow)"
              />
              {/* Particles along route */}
              {PARTICLES_PER_ROUTE[ri].map((particle, pi) => {
                const pProgress = ((t * speed * 0.7 + (particle.offset + ri * 3) / 100) % 1 + 1) % 1;
                const [px, py] = cubicBezierPoint(
                  pProgress,
                  [x0, y0],
                  [cx1, cy1],
                  [cx2, cy2],
                  [x3, y3]
                );
                const pAlpha = 0.6 + 0.4 * Math.sin(t * 3 + pi * 1.3 + ri * 0.5);
                return (
                  <circle
                    key={pi}
                    cx={px}
                    cy={py}
                    r={particle.size}
                    fill={`rgba(255,255,80,${pAlpha.toFixed(3)})`}
                    filter="url(#neonGlow)"
                  />
                );
              })}
            </g>
          );
        })}

        {/* Nation nodes */}
        {NATIONS.map((nation, ni) => {
          const nx = nation.x * width;
          const ny = nation.y * height;
          const phaseOffset = NODE_PHASE_OFFSETS[ni];
          const pulse = 0.6 + 0.4 * Math.sin(t * 2.5 + phaseOffset * 0.1);
          const outerR = 20 + 12 * pulse;
          const innerR = 10 + 5 * pulse;
          const coreR = 6;
          const ringAlpha = 0.4 + 0.4 * pulse;
          const glowAlpha = 0.7 + 0.3 * pulse;

          return (
            <g key={ni}>
              {/* Outer halo */}
              <circle
                cx={nx}
                cy={ny}
                r={outerR * 1.8}
                fill={`rgba(200,255,0,${(ringAlpha * 0.08).toFixed(3)})`}
                filter="url(#softGlow)"
              />
              {/* Mid ring */}
              <circle
                cx={nx}
                cy={ny}
                r={outerR}
                fill="none"
                stroke={`rgba(220,255,0,${(ringAlpha * 0.5).toFixed(3)})`}
                strokeWidth={2}
                filter="url(#neonGlow)"
              />
              {/* Inner ring */}
              <circle
                cx={nx}
                cy={ny}
                r={innerR}
                fill="none"
                stroke={`rgba(240,255,50,${(glowAlpha * 0.8).toFixed(3)})`}
                strokeWidth={3}
                filter="url(#nodeGlow)"
              />
              {/* Core dot */}
              <circle
                cx={nx}
                cy={ny}
                r={coreR}
                fill={`rgba(255,255,150,${glowAlpha.toFixed(3)})`}
                filter="url(#nodeGlow)"
              />
              {/* Core center */}
              <circle
                cx={nx}
                cy={ny}
                r={3}
                fill="rgba(255,255,255,0.95)"
              />
            </g>
          );
        })}
      </svg>

      {/* Scanline overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)',
          pointerEvents: 'none',
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};