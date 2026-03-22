import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = Array.from({ length: 60 }, (_, i) => ({
  x: ((i * 1731 + 300) % 3400) + 220,
  y: ((i * 1337 + 200) % 1800) + 180,
  size: ((i * 97) % 18) + 6,
  pulseOffset: (i * 43) % 100,
  marketValue: ((i * 173) % 100) / 100,
  colorIndex: i % 5,
  delayFactor: (i * 0.7) % 1,
  ringCount: (i % 3) + 2,
}));

const CONNECTIONS = Array.from({ length: 40 }, (_, i) => ({
  fromIdx: (i * 7) % 60,
  toIdx: (i * 11 + 5) % 60,
  delay: (i * 0.6) % 1,
  opacity: ((i * 53) % 60) / 100 + 0.15,
}));

const GRID_LINES_H = Array.from({ length: 24 }, (_, i) => ({
  y: (i / 23) * 2160,
  opacity: ((i * 37) % 40) / 100 + 0.02,
}));

const GRID_LINES_V = Array.from({ length: 42 }, (_, i) => ({
  x: (i / 41) * 3840,
  opacity: ((i * 29) % 40) / 100 + 0.02,
}));

const PARTICLES = Array.from({ length: 120 }, (_, i) => ({
  x: ((i * 2311) % 3840),
  y: ((i * 1873) % 2160),
  size: ((i * 41) % 3) + 1,
  speed: ((i * 67) % 80) / 100 + 0.2,
  phase: (i * 53) % 100,
}));

const COLORS = [
  '#00ffcc',
  '#ff6b35',
  '#ffd700',
  '#00aaff',
  '#ff4499',
];

const CONTOUR_PATHS = Array.from({ length: 12 }, (_, i) => {
  const cx = 1920;
  const cy = 1080;
  const rx = 400 + i * 130;
  const ry = 250 + i * 80;
  return { rx, ry, cx, cy, opacity: 0.03 + (i % 3) * 0.01 };
});

export const MapIlluminationReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const masterOpacity = Math.min(fadeIn, fadeOut);

  const revealProgress = interpolate(frame, [30, durationInFrames - 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const mapGlow = interpolate(revealProgress, [0, 0.4, 1], [0, 0.3, 0.7]);

  return (
    <div
      style={{
        width,
        height,
        background: '#020408',
        overflow: 'hidden',
        position: 'relative',
        opacity: masterOpacity,
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#001122" stopOpacity={mapGlow} />
            <stop offset="100%" stopColor="#020408" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="40%">
            <stop offset="0%" stopColor="#003344" stopOpacity={interpolate(revealProgress, [0.2, 0.8], [0, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          {CITIES.map((city, i) => (
            <radialGradient key={`grad-${i}`} id={`cityGlow-${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={COLORS[city.colorIndex]} stopOpacity="0.9" />
              <stop offset="60%" stopColor={COLORS[city.colorIndex]} stopOpacity="0.3" />
              <stop offset="100%" stopColor={COLORS[city.colorIndex]} stopOpacity="0" />
            </radialGradient>
          ))}
          <filter id="blur-sm">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="blur-md">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="blur-lg">
            <feGaussianBlur stdDeviation="15" />
          </filter>
          <filter id="glow-intense">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background glow */}
        <rect width={width} height={height} fill="url(#bgGlow)" />
        <rect width={width} height={height} fill="url(#centerGlow)" />

        {/* Grid lines */}
        {GRID_LINES_H.map((line, i) => {
          const lineOpacity = interpolate(revealProgress, [i * 0.03, i * 0.03 + 0.3], [0, line.opacity], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <line
              key={`h-${i}`}
              x1={0} y1={line.y}
              x2={width} y2={line.y}
              stroke="#00ffcc"
              strokeWidth="0.5"
              opacity={lineOpacity}
            />
          );
        })}
        {GRID_LINES_V.map((line, i) => {
          const lineOpacity = interpolate(revealProgress, [i * 0.015, i * 0.015 + 0.3], [0, line.opacity], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <line
              key={`v-${i}`}
              x1={line.x} y1={0}
              x2={line.x} y2={height}
              stroke="#00aaff"
              strokeWidth="0.5"
              opacity={lineOpacity}
            />
          );
        })}

        {/* Contour ellipses */}
        {CONTOUR_PATHS.map((c, i) => {
          const contourProgress = interpolate(revealProgress, [i * 0.05, i * 0.05 + 0.4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <ellipse
              key={`contour-${i}`}
              cx={c.cx}
              cy={c.cy}
              rx={c.rx}
              ry={c.ry}
              fill="none"
              stroke="#00aaff"
              strokeWidth="1"
              opacity={c.opacity * contourProgress}
            />
          );
        })}

        {/* Connections between cities */}
        {CONNECTIONS.map((conn, i) => {
          const from = CITIES[conn.fromIdx];
          const to = CITIES[conn.toIdx];
          const connProgress = interpolate(
            revealProgress,
            [conn.delay * 0.5 + 0.2, conn.delay * 0.5 + 0.5],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const pulse = interpolate(
            (frame + i * 17) % 90,
            [0, 45, 90],
            [0.3, 0.9, 0.3],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const mx = (from.x + to.x) / 2;
          const my = Math.min(from.y, to.y) - 80;
          const d = `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
          return (
            <path
              key={`conn-${i}`}
              d={d}
              fill="none"
              stroke={COLORS[i % 5]}
              strokeWidth="1"
              opacity={conn.opacity * connProgress * pulse}
              strokeDasharray="6 4"
              filter="url(#blur-sm)"
            />
          );
        })}

        {/* Glowing city data points */}
        {CITIES.map((city, i) => {
          const cityReveal = interpolate(
            revealProgress,
            [city.delayFactor * 0.6 + 0.1, city.delayFactor * 0.6 + 0.35],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const pulseFrame = (frame + city.pulseOffset * 3) % 80;
          const pulse = interpolate(pulseFrame, [0, 40, 80], [0.5, 1, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const color = COLORS[city.colorIndex];
          const glowSize = city.size * 4 * pulse;
          const barHeight = interpolate(cityReveal, [0, 1], [0, city.marketValue * 80 + 20]);

          return (
            <g key={`city-${i}`} opacity={cityReveal}>
              {/* Outer glow rings */}
              {Array.from({ length: city.ringCount }, (_, ri) => {
                const ringPulse = interpolate(
                  (frame + city.pulseOffset * 3 + ri * 25) % (70 + ri * 15),
                  [0, 35 + ri * 7, 70 + ri * 15],
                  [0.5, 0.1, 0.5],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );
                return (
                  <circle
                    key={`ring-${i}-${ri}`}
                    cx={city.x}
                    cy={city.y}
                    r={city.size * (2 + ri * 1.5) * (0.8 + pulse * 0.2)}
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    opacity={ringPulse * 0.4}
                  />
                );
              })}

              {/* Glow halo */}
              <circle
                cx={city.x}
                cy={city.y}
                r={glowSize}
                fill={`url(#cityGlow-${i})`}
                opacity={0.4 * pulse}
                filter="url(#blur-md)"
              />

              {/* Market bar */}
              <rect
                x={city.x - 3}
                y={city.y - barHeight - city.size}
                width={6}
                height={barHeight}
                fill={color}
                opacity={0.6 * cityReveal}
                filter="url(#blur-sm)"
              />

              {/* Core dot */}
              <circle
                cx={city.x}
                cy={city.y}
                r={city.size * 0.6}
                fill={color}
                opacity={0.95}
                filter="url(#glow-intense)"
              />

              {/* Bright center */}
              <circle
                cx={city.x}
                cy={city.y}
                r={city.size * 0.3}
                fill="white"
                opacity={0.8 * pulse}
              />
            </g>
          );
        })}

        {/* Floating particles */}
        {PARTICLES.map((p, i) => {
          const particleY = (p.y - (frame * p.speed * 0.4) % height + height) % height;
          const particleOpacity = interpolate(
            revealProgress,
            [p.phase / 100 * 0.5 + 0.1, p.phase / 100 * 0.5 + 0.3],
            [0, 0.4],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const twinkle = interpolate(
            (frame + p.phase * 4) % 60,
            [0, 30, 60],
            [0.2, 1, 0.2],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          return (
            <circle
              key={`part-${i}`}
              cx={p.x}
              cy={particleY}
              r={p.size}
              fill={COLORS[i % 5]}
              opacity={particleOpacity * twinkle}
            />
          );
        })}

        {/* Sweeping reveal light */}
        {(() => {
          const sweepX = interpolate(revealProgress, [0, 1], [-200, width + 200]);
          const sweepOpacity = interpolate(revealProgress, [0, 0.05, 0.9, 1], [0, 0.6, 0.6, 0]);
          return (
            <rect
              x={sweepX - 80}
              y={0}
              width={160}
              height={height}
              fill="url(#bgGlow)"
              opacity={sweepOpacity}
              filter="url(#blur-lg)"
              style={{ mixBlendMode: 'screen' }}
            />
          );
        })()}

        {/* Global ambient glow overlay */}
        <ellipse
          cx={width / 2}
          cy={height / 2}
          rx={width * 0.4}
          ry={height * 0.35}
          fill="none"
          stroke="#00ffcc"
          strokeWidth="1"
          opacity={interpolate(revealProgress, [0.5, 1], [0, 0.08], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
          filter="url(#blur-lg)"
        />
      </svg>
    </div>
  );
};