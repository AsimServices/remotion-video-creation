import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { name: 'Dubai', x: 0.638, y: 0.412, size: 22, delay: 0 },
  { name: 'Riyadh', x: 0.608, y: 0.432, size: 20, delay: 8 },
  { name: 'Cairo', x: 0.548, y: 0.398, size: 18, delay: 15 },
  { name: 'Nairobi', x: 0.575, y: 0.548, size: 16, delay: 22 },
  { name: 'Lagos', x: 0.458, y: 0.508, size: 17, delay: 30 },
  { name: 'Johannesburg', x: 0.558, y: 0.658, size: 15, delay: 38 },
  { name: 'Casablanca', x: 0.438, y: 0.368, size: 14, delay: 45 },
  { name: 'Addis Ababa', x: 0.588, y: 0.502, size: 14, delay: 52 },
  { name: 'Dar es Salaam', x: 0.582, y: 0.568, size: 13, delay: 58 },
  { name: 'Accra', x: 0.448, y: 0.498, size: 13, delay: 64 },
  { name: 'Muscat', x: 0.652, y: 0.438, size: 13, delay: 70 },
  { name: 'Doha', x: 0.630, y: 0.422, size: 12, delay: 76 },
  { name: 'Khartoum', x: 0.560, y: 0.458, size: 12, delay: 82 },
  { name: 'Abidjan', x: 0.442, y: 0.508, size: 12, delay: 88 },
  { name: 'Luanda', x: 0.528, y: 0.598, size: 11, delay: 94 },
];

const CONNECTIONS = [
  [0, 1], [0, 2], [0, 3], [1, 2], [1, 12],
  [2, 6], [2, 7], [3, 7], [3, 8], [4, 9],
  [4, 14], [5, 8], [5, 14], [6, 9], [7, 12],
  [0, 11], [1, 10], [3, 4], [3, 5],
];

const STARS = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731 + 42) % 3840,
  y: (i * 1337 + 17) % 2160,
  r: ((i * 97) % 3) + 1,
  opacity: ((i * 53) % 60 + 30) / 100,
}));

const GRID_LINES_H = Array.from({ length: 18 }, (_, i) => i);
const GRID_LINES_V = Array.from({ length: 32 }, (_, i) => i);

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  cx: 0.44 + ((i * 373) % 280) / 1000,
  cy: 0.36 + ((i * 211) % 350) / 1000,
  speed: 0.4 + ((i * 131) % 60) / 100,
  phase: (i * 97) % 100,
  radius: 1.5 + ((i * 61) % 30) / 10,
  orbitR: 20 + ((i * 43) % 80),
}));

export const MiddleEastAfricaMarketEntry: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const masterOpacity = Math.min(fadeIn, fadeOut);

  const mapX = width * 0.38;
  const mapY = height * 0.22;
  const mapW = width * 0.30;
  const mapH = height * 0.55;

  const pulseBase = (Math.sin(frame * 0.04) + 1) / 2;

  return (
    <div style={{ width, height, background: '#03060f', overflow: 'hidden', opacity: masterOpacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGlow" cx="55%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#0d1f3c" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#03060f" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="1" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="superGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="20" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="connGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Background gradient */}
        <rect width={width} height={height} fill="url(#bgGlow)" />

        {/* Stars */}
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="white"
            opacity={s.opacity * (0.5 + 0.5 * Math.sin(frame * 0.02 + i))}
          />
        ))}

        {/* Grid lines */}
        {GRID_LINES_H.map((i) => {
          const y = (i / 17) * height;
          const prog = interpolate(frame, [20 + i * 3, 80 + i * 3], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
          return (
            <line
              key={`h${i}`}
              x1={0}
              y1={y}
              x2={width * prog}
              y2={y}
              stroke="#0d2640"
              strokeWidth={0.6}
              opacity={0.4}
            />
          );
        })}
        {GRID_LINES_V.map((i) => {
          const x = (i / 31) * width;
          const prog = interpolate(frame, [20 + i * 2, 70 + i * 2], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
          return (
            <line
              key={`v${i}`}
              x1={x}
              y1={0}
              x2={x}
              y2={height * prog}
              stroke="#0d2640"
              strokeWidth={0.6}
              opacity={0.4}
            />
          );
        })}

        {/* Ambient region glow */}
        <ellipse
          cx={mapX + mapW * 0.5}
          cy={mapY + mapH * 0.45}
          rx={mapW * 1.0}
          ry={mapH * 0.7}
          fill="#0a3060"
          opacity={0.12 + 0.04 * pulseBase}
          filter="url(#superGlow)"
        />

        {/* Middle East + Africa outline paths */}
        <g transform={`translate(${mapX}, ${mapY})`} opacity={interpolate(frame, [30, 90], [0, 1], { extrapolateRight: 'clamp' })}>
          {/* Simplified Arabia peninsula */}
          <polygon
            points={`
              ${mapW * 0.58},${mapH * 0.22}
              ${mapW * 0.72},${mapH * 0.20}
              ${mapW * 0.80},${mapH * 0.28}
              ${mapW * 0.82},${mapH * 0.38}
              ${mapW * 0.76},${mapH * 0.52}
              ${mapW * 0.68},${mapH * 0.56}
              ${mapW * 0.60},${mapH * 0.48}
              ${mapW * 0.56},${mapH * 0.38}
              ${mapW * 0.54},${mapH * 0.28}
            `}
            fill="none"
            stroke="#1a4a80"
            strokeWidth={2.5}
            opacity={0.7}
          />
          {/* Levant */}
          <polygon
            points={`
              ${mapW * 0.46},${mapH * 0.14}
              ${mapW * 0.56},${mapH * 0.14}
              ${mapW * 0.58},${mapH * 0.22}
              ${mapW * 0.54},${mapH * 0.28}
              ${mapW * 0.48},${mapH * 0.25}
              ${mapW * 0.44},${mapH * 0.20}
            `}
            fill="none"
            stroke="#1a4a80"
            strokeWidth={2}
            opacity={0.6}
          />
          {/* North Africa */}
          <polygon
            points={`
              ${mapW * 0.00},${mapH * 0.10}
              ${mapW * 0.46},${mapH * 0.10}
              ${mapW * 0.46},${mapH * 0.14}
              ${mapW * 0.44},${mapH * 0.20}
              ${mapW * 0.46},${mapH * 0.28}
              ${mapW * 0.42},${mapH * 0.35}
              ${mapW * 0.36},${mapH * 0.40}
              ${mapW * 0.10},${mapH * 0.40}
              ${mapW * 0.00},${mapH * 0.35}
            `}
            fill="none"
            stroke="#1a4a80"
            strokeWidth={2.5}
            opacity={0.65}
          />
          {/* West Africa */}
          <polygon
            points={`
              ${mapW * 0.00},${mapH * 0.35}
              ${mapW * 0.10},${mapH * 0.40}
              ${mapW * 0.20},${mapH * 0.44}
              ${mapW * 0.28},${mapH * 0.52}
              ${mapW * 0.22},${mapH * 0.62}
              ${mapW * 0.10},${mapH * 0.60}
              ${mapW * 0.00},${mapH * 0.52}
            `}
            fill="none"
            stroke="#1a4a80"
            strokeWidth={2}
            opacity={0.6}
          />
          {/* East Africa */}
          <polygon
            points={`
              ${mapW * 0.46},${mapH * 0.28}
              ${mapW * 0.52},${mapH * 0.30}
              ${mapW * 0.54},${mapH * 0.38}
              ${mapW * 0.56},${mapH * 0.48}
              ${mapW * 0.52},${mapH * 0.58}
              ${mapW * 0.48},${mapH * 0.68}
              ${mapW * 0.42},${mapH * 0.76}
              ${mapW * 0.36},${mapH * 0.72}
              ${mapW * 0.30},${mapH * 0.64}
              ${mapW * 0.28},${mapH * 0.52}
              ${mapW * 0.36},${mapH * 0.40}
              ${mapW * 0.42},${mapH * 0.35}
            `}
            fill="none"
            stroke="#1a4a80"
            strokeWidth={2.2}
            opacity={0.65}
          />
          {/* Southern Africa */}
          <polygon
            points={`
              ${mapW * 0.30},${mapH * 0.64}
              ${mapW * 0.36},${mapH * 0.72}
              ${mapW * 0.34},${mapH * 0.84}
              ${mapW * 0.28},${mapH * 0.92}
              ${mapW * 0.22},${mapH * 0.90}
              ${mapW * 0.16},${mapH * 0.80}
              ${mapW * 0.14},${mapH * 0.68}
              ${mapW * 0.22},${mapH * 0.62}
            `}
            fill="none"
            stroke="#1a4a80"
            strokeWidth={2}
            opacity={0.6}
          />

          {/* Fill overlays with subtle glow */}
          <polygon
            points={`
              ${mapW * 0.58},${mapH * 0.22}
              ${mapW * 0.72},${mapH * 0.20}
              ${mapW * 0.80},${mapH * 0.28}
              ${mapW * 0.82},${mapH * 0.38}
              ${mapW * 0.76},${mapH * 0.52}
              ${mapW * 0.68},${mapH * 0.56}
              ${mapW * 0.60},${mapH * 0.48}
              ${mapW * 0.56},${mapH * 0.38}
              ${mapW * 0.54},${mapH * 0.28}
            `}
            fill="#0a2a5a"
            opacity={0.3}
          />
          <polygon
            points={`
              ${mapW * 0.00},${mapH * 0.10}
              ${mapW * 0.46},${mapH * 0.10}
              ${mapW * 0.46},${mapH * 0.14}
              ${mapW * 0.44},${mapH * 0.20}
              ${mapW * 0.46},${mapH * 0.28}
              ${mapW * 0.42},${mapH * 0.35}
              ${mapW * 0.36},${mapH * 0.40}
              ${mapW * 0.42},${mapH * 0.76}
              ${mapW * 0.34},${mapH * 0.84}
              ${mapW * 0.28},${mapH * 0.92}
              ${mapW * 0.22},${mapH * 0.90}
              ${mapW * 0.16},${mapH * 0.80}
              ${mapW * 0.14},${mapH * 0.68}
              ${mapW * 0.10},${mapH * 0.60}
              ${mapW * 0.00},${mapH * 0.52}
            `}
            fill="#081e3a"
            opacity={0.3}
          />
        </g>

        {/* Connection lines between cities */}
        {CONNECTIONS.map(([a, b], idx) => {
          const ca = CITIES[a];
          const cb = CITIES[b];
          const maxDelay = Math.max(ca.delay, cb.delay);
          const lineProgress = interpolate(frame, [maxDelay + 30, maxDelay + 80], [0, 1], {
            extrapolateRight: 'clamp',
            extrapolateLeft: 'clamp',
          });

          const x1 = ca.x * width;
          const y1 = ca.y * height;
          const x2 = cb.x * width;
          const y2 = cb.y * height;

          const dx = x2 - x1;
          const dy = y2 - y1;
          const len = Math.sqrt(dx * dx + dy * dy);
          const cx2 = x1 + dx * lineProgress;
          const cy2 = y1 + dy * lineProgress;

          const dashOffset = -(frame * 3);

          return (
            <g key={idx} opacity={lineProgress}>
              <line
                x1={x1} y1={y1}
                x2={cx2} y2={cy2}
                stroke="#00e5ff"
                strokeWidth={1.5}
                opacity={0.15}
              />
              <line
                x1={x1} y1={y1}
                x2={cx2} y2={cy2}
                stroke="#00e5ff"
                strokeWidth={1}
                opacity={0.4}
                strokeDasharray="12 24"
                strokeDashoffset={dashOffset}
                filter="url(#softGlow)"
              />
            </g>
          );
        })}

        {/* City markers */}
        {CITIES.map((city, i) => {
          const cx = city.x * width;
          const cy = city.y * height;
          const appear = interpolate(frame, [city.delay + 20, city.delay + 50], [0, 1], {
            extrapolateRight: 'clamp',
            extrapolateLeft: 'clamp',
          });
          const pulse1 = interpolate(
            (frame - city.delay) % 80,
            [0, 40, 80],
            [0, 1, 0],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          );
          const pulse2 = interpolate(
            (frame - city.delay + 20) % 80,
            [0, 40, 80],
            [0, 1, 0],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          );

          const s = city.size;
          const mainColor = i < 4 ? '#00e5ff' : i < 8 ? '#4dd8ff' : '#80eeff';
          const ringColor = i < 4 ? '#ff6b35' : '#00e5ff';

          return (
            <g key={i} opacity={appear}>
              {/* Outer pulse rings */}
              <circle
                cx={cx} cy={cy}
                r={s * 1.8 + pulse1 * s * 3.5}
                fill="none"
                stroke={mainColor}
                strokeWidth={1.5}
                opacity={0.6 * (1 - pulse1) * appear}
                filter="url(#softGlow)"
              />
              <circle
                cx={cx} cy={cy}
                r={s * 1.8 + pulse2 * s * 2.5}
                fill="none"
                stroke={ringColor}
                strokeWidth={1}
                opacity={0.4 * (1 - pulse2) * appear}
              />

              {/* Glow halo */}
              <circle
                cx={cx} cy={cy}
                r={s * 2.5}
                fill={mainColor}
                opacity={0.08 + 0.04 * pulseBase}
                filter="url(#superGlow)"
              />

              {/* Middle ring */}
              <circle
                cx={cx} cy={cy}
                r={s * 1.2}
                fill="none"
                stroke={mainColor}
                strokeWidth={2}
                opacity={0.6}
              />

              {/* Core dot */}
              <circle
                cx={cx} cy={cy}
                r={s * 0.55}
                fill={mainColor}
                opacity={0.95}
                filter="url(#glow)"
              />

              {/* Center bright point */}
              <circle
                cx={cx} cy={cy}
                r={s * 0.2}
                fill="white"
                opacity={0.9}
              />
            </g>
          );
        })}

        {/* Floating particles */}
        {PARTICLES.map((p, i) => {
          const angle = (frame * p.speed * 0.02 + p.phase) % (Math.PI * 2);
          const px = p.cx * width + Math.cos(angle) * p.orbitR;
          const py = p.cy * height + Math.sin(angle) * p.orbitR;
          const particleOpacity = interpolate(frame, [60, 100], [0, 1], { extrapolateRight: 'clamp' }) *
            (0.3 + 0.3 * Math.sin(frame * 0.05 + p.phase));

          return (
            <circle
              key={i}
              cx={px}
              cy={py}
              r={p.radius}
              fill="#00e5ff"
              opacity={particleOpacity}
              filter="url(#softGlow)"
            />
          );
        })}

        {/* Scanning line sweep */}
        {(() => {
          const sweepProgress = (frame * 0.8) % (width * 0.35);
          const sweepX = mapX - mapW * 0.1 + sweepProgress;
          const sweepOpacity = interpolate(frame, [80, 120], [0, 0.6], { extrapolateRight: 'clamp' });

          return (
            <line
              x1={sweepX}
              y1={mapY - mapH * 0.1}
              x2={sweepX}
              y2={mapY + mapH * 1.1}
              stroke="#00e5ff"
              strokeWidth={2}
              opacity={sweepOpacity * 0.25}
              filter="url(#softGlow)"
            />
          );
        })()}

        {/* Corner decoration lines */}
        {[
          { x: 60, y: 60, dirX: 1, dirY: 1 },
          { x: width - 60, y: 60, dirX: -1, dirY: 1 },
          { x: 60, y: height - 60, dirX: 1, dirY: -1 },
          { x: width - 60, y: height - 60, dirX: -1, dirY: -1 },
        ].map((corner, i) => {
          const prog = interpolate(frame, [10 + i * 10, 60 + i * 10], [0, 1], {
            extrapolateRight: 'clamp',
            extrapolateLeft: 'clamp',
          });
          const len = 120 * prog;
          return (
            <g key={i} stroke="#00e5ff" strokeWidth={2.5} opacity={0.5}>
              <line x1={corner.x} y1={corner.y} x2={corner.x + corner.dirX * len} y2={corner.y} />
              <line x1={corner.x} y1={corner.y} x2={corner.x} y2={corner.y + corner.dirY * len} />
              <circle cx={corner.x} cy={corner.y} r={4} fill="#00e5ff" opacity={prog} />
            </g>
          );
        })}

        {/* Data arc decorations */}
        {[0, 1, 2].map((i) => {
          const arcProgress = interpolate(frame, [100 + i * 20, 180 + i * 20], [0, 1], {
            extrapolateRight: 'clamp',
            extrapolateLeft: 'clamp',
          });
          const r = 280 + i * 80;
          const arcEnd = arcProgress * Math.PI * 0.6;
          const startX = width * 0.88 + r * Math.cos(Math.PI * 1.1);
          const startY = height * 0.5 + r * Math.sin(Math.PI * 1.1);
          const endX = width * 0.88 + r * Math.cos(Math.PI * 1.1 + arcEnd);
          const endY = height * 0.5 + r * Math.sin(Math.PI * 1.1 + arcEnd);

          return (
            <path
              key={i}
              d={`M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`}
              fill="none"
              stroke="#00e5ff"
              strokeWidth={1.5}
              opacity={0.2 + i * 0.05}
              filter="url(#softGlow)"
            />
          );
        })}

        {/* Vignette overlay */}
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="50%" stopColor="#03060f" stopOpacity="0" />
            <stop offset="100%" stopColor="#03060f" stopOpacity="0.75" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#vignette)" />
      </svg>
    </div>
  );
};