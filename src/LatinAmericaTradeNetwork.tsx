import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { name: 'Mexico City', x: 0.178, y: 0.268 },
  { name: 'Havana', x: 0.247, y: 0.278 },
  { name: 'Guatemala City', x: 0.197, y: 0.318 },
  { name: 'Bogota', x: 0.243, y: 0.42 },
  { name: 'Caracas', x: 0.287, y: 0.385 },
  { name: 'Quito', x: 0.228, y: 0.46 },
  { name: 'Lima', x: 0.225, y: 0.535 },
  { name: 'La Paz', x: 0.268, y: 0.565 },
  { name: 'Brasilia', x: 0.358, y: 0.518 },
  { name: 'Asuncion', x: 0.318, y: 0.608 },
  { name: 'Santiago', x: 0.248, y: 0.668 },
  { name: 'Buenos Aires', x: 0.308, y: 0.688 },
  { name: 'Montevideo', x: 0.328, y: 0.695 },
  { name: 'Managua', x: 0.208, y: 0.335 },
  { name: 'Panama City', x: 0.225, y: 0.368 },
  { name: 'San Jose', x: 0.215, y: 0.352 },
];

const CONNECTIONS = [
  [0, 2], [0, 1], [0, 3], [2, 14], [14, 3], [3, 4], [3, 5], [3, 8],
  [4, 8], [5, 6], [5, 7], [6, 7], [6, 8], [7, 8], [7, 9], [8, 9],
  [8, 11], [8, 12], [9, 10], [9, 11], [10, 11], [11, 12], [0, 13],
  [13, 15], [15, 14], [14, 5], [1, 4], [6, 10], [3, 7],
];

const PARTICLES = Array.from({ length: CONNECTIONS.length * 3 }, (_, i) => ({
  connectionIndex: i % CONNECTIONS.length,
  offset: (i * 0.317) % 1.0,
  speed: 0.003 + ((i * 7) % 10) * 0.0004,
  size: 3 + (i % 5),
}));

const STARS = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731 + 300) % 3840,
  y: (i * 1337 + 150) % 2160,
  r: ((i * 17) % 3) + 1,
  opacity: 0.2 + ((i * 13) % 6) * 0.08,
}));

const GLOW_CITIES = Array.from({ length: CITIES.length }, (_, i) => ({
  pulseOffset: (i * 0.618) % 1.0,
}));

export const LatinAmericaTradeNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const t = frame / durationInFrames;

  return (
    <div style={{ width, height, background: '#080a0f', position: 'relative', overflow: 'hidden', opacity: globalOpacity }}>
      {/* Stars */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.opacity} />
        ))}
      </svg>

      {/* Subtle continental shape suggestion */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="mapGlow" cx="26%" cy="55%" r="45%">
            <stop offset="0%" stopColor="#1a1208" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#080a0f" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#0d0f1a" stopOpacity="1" />
            <stop offset="100%" stopColor="#040508" stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#bgGlow)" />
        <ellipse cx={width * 0.27} cy={height * 0.52} rx={width * 0.18} ry={height * 0.38}
          fill="url(#mapGlow)" />
      </svg>

      {/* Grid lines subtle */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`v${i}`}
            x1={(i + 1) * width / 13} y1={0}
            x2={(i + 1) * width / 13} y2={height}
            stroke="#1a1a2e" strokeWidth={1} opacity={0.4}
          />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`h${i}`}
            x1={0} y1={(i + 1) * height / 9}
            x2={width} y2={(i + 1) * height / 9}
            stroke="#1a1a2e" strokeWidth={1} opacity={0.4}
          />
        ))}
      </svg>

      {/* Trade connections */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {CONNECTIONS.map((conn, i) => {
            const c1 = CITIES[conn[0]];
            const c2 = CITIES[conn[1]];
            return (
              <linearGradient key={`lg${i}`} id={`lineGrad${i}`}
                x1={c1.x * width} y1={c1.y * height}
                x2={c2.x * width} y2={c2.y * height}
                gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#fcd34d" stopOpacity="1" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9" />
              </linearGradient>
            );
          })}
          <filter id="lineBlur">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="cityGlow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Glow lines */}
        {CONNECTIONS.map((conn, i) => {
          const c1 = CITIES[conn[0]];
          const c2 = CITIES[conn[1]];
          const animOffset = (i * 0.0431) % 1;
          const pulse = Math.sin((t * Math.PI * 2 * 1.5) + animOffset * Math.PI * 2) * 0.3 + 0.7;
          const drawProgress = interpolate(
            frame,
            [50 + i * 6, 50 + i * 6 + 40],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const x1 = c1.x * width;
          const y1 = c1.y * height;
          const x2 = c2.x * width;
          const y2 = c2.y * height;
          const midX = x1 + (x2 - x1) * drawProgress;
          const midY = y1 + (y2 - y1) * drawProgress;

          return (
            <g key={`conn${i}`}>
              <line
                x1={x1} y1={y1} x2={midX} y2={midY}
                stroke="#f59e0b"
                strokeWidth={6}
                opacity={0.15 * pulse}
                filter="url(#lineBlur)"
              />
              <line
                x1={x1} y1={y1} x2={midX} y2={midY}
                stroke={`url(#lineGrad${i})`}
                strokeWidth={1.5}
                opacity={0.7 * pulse * drawProgress}
              />
            </g>
          );
        })}

        {/* Particles on connections */}
        {PARTICLES.map((p, i) => {
          const conn = CONNECTIONS[p.connectionIndex];
          const c1 = CITIES[conn[0]];
          const c2 = CITIES[conn[1]];
          const rawPos = ((t * p.speed * 300 + p.offset)) % 1.0;
          const pos = rawPos;
          const x = c1.x * width + (c2.x - c1.x) * width * pos;
          const y = c1.y * height + (c2.y - c1.y) * height * pos;
          const fadeEdge = Math.min(pos, 1 - pos) * 10;
          const particleOpacity = Math.min(1, fadeEdge) * 0.85;
          const drawProgress = interpolate(
            frame,
            [50 + p.connectionIndex * 6 + 40, 50 + p.connectionIndex * 6 + 80],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          return (
            <circle
              key={`p${i}`}
              cx={x} cy={y}
              r={p.size * 0.5}
              fill="#fcd34d"
              opacity={particleOpacity * drawProgress}
            />
          );
        })}

        {/* City nodes */}
        {CITIES.map((city, i) => {
          const cx = city.x * width;
          const cy = city.y * height;
          const pulse = Math.sin((t * Math.PI * 2 * 2) + GLOW_CITIES[i].pulseOffset * Math.PI * 2) * 0.4 + 0.6;
          const appear = interpolate(frame, [50 + i * 8, 80 + i * 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const ringScale = interpolate(
            (frame + i * 20) % 90,
            [0, 90],
            [0.5, 2.5]
          );
          const ringOpacity = interpolate(
            (frame + i * 20) % 90,
            [0, 45, 90],
            [0.8, 0.3, 0]
          );

          return (
            <g key={`city${i}`} opacity={appear}>
              {/* Outer ring pulse */}
              <circle cx={cx} cy={cy} r={18 * ringScale} fill="none"
                stroke="#f59e0b" strokeWidth={1}
                opacity={ringOpacity * 0.5}
              />
              {/* Glow */}
              <circle cx={cx} cy={cy} r={14}
                fill="#f59e0b" opacity={0.12 * pulse}
                filter="url(#cityGlow)"
              />
              {/* Main dot */}
              <circle cx={cx} cy={cy} r={5}
                fill="#fcd34d"
                opacity={0.9 * pulse}
              />
              {/* Core */}
              <circle cx={cx} cy={cy} r={2.5}
                fill="white"
                opacity={0.95}
              />
            </g>
          );
        })}
      </svg>

      {/* Ambient overlay glow */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        <defs>
          <radialGradient id="ambientAmber" cx="27%" cy="52%" r="35%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#ambientAmber)" />
      </svg>

      {/* Vignette */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};