import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const LOCATIONS = [
  { x: 0.515, y: 0.38, name: 'Paris', delay: 0 },
  { x: 0.535, y: 0.36, name: 'London', delay: 8 },
  { x: 0.555, y: 0.42, name: 'Milan', delay: 16 },
  { x: 0.58, y: 0.40, name: 'Vienna', delay: 24 },
  { x: 0.495, y: 0.37, name: 'Madrid', delay: 32 },
  { x: 0.62, y: 0.36, name: 'Moscow', delay: 40 },
  { x: 0.77, y: 0.38, name: 'Beijing', delay: 12 },
  { x: 0.81, y: 0.44, name: 'Shanghai', delay: 20 },
  { x: 0.82, y: 0.48, name: 'Hong Kong', delay: 28 },
  { x: 0.79, y: 0.46, name: 'Tokyo', delay: 36 },
  { x: 0.755, y: 0.48, name: 'Singapore', delay: 44 },
  { x: 0.68, y: 0.44, name: 'Dubai', delay: 6 },
  { x: 0.65, y: 0.46, name: 'Mumbai', delay: 14 },
  { x: 0.56, y: 0.50, name: 'Cairo', delay: 22 },
  { x: 0.57, y: 0.62, name: 'Johannesburg', delay: 30 },
  { x: 0.21, y: 0.38, name: 'New York', delay: 4 },
  { x: 0.17, y: 0.36, name: 'Toronto', delay: 18 },
  { x: 0.14, y: 0.42, name: 'Los Angeles', delay: 26 },
  { x: 0.255, y: 0.54, name: 'Rio', delay: 34 },
  { x: 0.235, y: 0.48, name: 'Bogota', delay: 42 },
  { x: 0.865, y: 0.70, name: 'Sydney', delay: 10 },
  { x: 0.72, y: 0.44, name: 'Riyadh', delay: 38 },
  { x: 0.54, y: 0.36, name: 'Amsterdam', delay: 46 },
  { x: 0.53, y: 0.34, name: 'Stockholm', delay: 50 },
];

const CONNECTIONS = [
  [0, 1], [0, 2], [0, 3], [0, 15], [1, 15], [2, 3],
  [4, 0], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10],
  [11, 12], [11, 6], [13, 0], [14, 13], [15, 16],
  [15, 17], [18, 19], [20, 10], [21, 11], [22, 0], [23, 22],
  [10, 8], [7, 9], [5, 0], [0, 22],
];

const GRID_LINES_H = Array.from({ length: 18 }, (_, i) => i / 17);
const GRID_LINES_V = Array.from({ length: 36 }, (_, i) => i / 35);

const STARS = Array.from({ length: 120 }, (_, i) => ({
  x: (i * 1731 + 337) % 3840,
  y: (i * 1337 + 113) % 2160,
  size: ((i * 7) % 4) + 1,
  opacity: ((i * 13) % 60) / 100 + 0.1,
}));

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 2311 + 500) % 3840,
  y: (i * 1777 + 200) % 2160,
  speed: ((i * 17) % 30) / 100 + 0.2,
  size: ((i * 5) % 3) + 1,
  phase: (i * 23) % 100,
}));

export const LuxuryBoutiqueMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const mapX = width * 0.05;
  const mapY = height * 0.08;
  const mapW = width * 0.9;
  const mapH = height * 0.84;

  const roseGold = '#C9956C';
  const roseGoldLight = '#E8B89A';
  const roseGoldDark = '#9B6B4A';
  const roseGoldGlow = '#F0C9A8';

  const continentPaths = [
    // North America
    `M ${mapX + mapW * 0.05} ${mapY + mapH * 0.15}
     L ${mapX + mapW * 0.08} ${mapY + mapH * 0.12}
     L ${mapX + mapW * 0.12} ${mapY + mapH * 0.10}
     L ${mapX + mapW * 0.18} ${mapY + mapH * 0.15}
     L ${mapX + mapW * 0.22} ${mapY + mapH * 0.20}
     L ${mapX + mapW * 0.25} ${mapY + mapH * 0.28}
     L ${mapX + mapW * 0.28} ${mapY + mapH * 0.38}
     L ${mapX + mapW * 0.26} ${mapY + mapH * 0.48}
     L ${mapX + mapW * 0.22} ${mapY + mapH * 0.52}
     L ${mapX + mapW * 0.18} ${mapY + mapH * 0.50}
     L ${mapX + mapW * 0.15} ${mapY + mapH * 0.44}
     L ${mapX + mapW * 0.12} ${mapY + mapH * 0.40}
     L ${mapX + mapW * 0.08} ${mapY + mapH * 0.35}
     L ${mapX + mapW * 0.06} ${mapY + mapH * 0.28}
     Z`,
    // South America
    `M ${mapX + mapW * 0.20} ${mapY + mapH * 0.54}
     L ${mapX + mapW * 0.25} ${mapY + mapH * 0.52}
     L ${mapX + mapW * 0.30} ${mapY + mapH * 0.56}
     L ${mapX + mapW * 0.32} ${mapY + mapH * 0.62}
     L ${mapX + mapW * 0.30} ${mapY + mapH * 0.72}
     L ${mapX + mapW * 0.27} ${mapY + mapH * 0.80}
     L ${mapX + mapW * 0.23} ${mapY + mapH * 0.86}
     L ${mapX + mapW * 0.20} ${mapY + mapH * 0.78}
     L ${mapX + mapW * 0.18} ${mapY + mapH * 0.68}
     L ${mapX + mapW * 0.17} ${mapY + mapH * 0.60}
     Z`,
    // Europe
    `M ${mapX + mapW * 0.46} ${mapY + mapH * 0.22}
     L ${mapX + mapW * 0.50} ${mapY + mapH * 0.18}
     L ${mapX + mapW * 0.54} ${mapY + mapH * 0.20}
     L ${mapX + mapW * 0.60} ${mapY + mapH * 0.22}
     L ${mapX + mapW * 0.62} ${mapY + mapH * 0.28}
     L ${mapX + mapW * 0.60} ${mapY + mapH * 0.34}
     L ${mapX + mapW * 0.56} ${mapY + mapH * 0.36}
     L ${mapX + mapW * 0.52} ${mapY + mapH * 0.38}
     L ${mapX + mapW * 0.48} ${mapY + mapH * 0.36}
     L ${mapX + mapW * 0.45} ${mapY + mapH * 0.30}
     Z`,
    // Africa
    `M ${mapX + mapW * 0.48} ${mapY + mapH * 0.40}
     L ${mapX + mapW * 0.54} ${mapY + mapH * 0.38}
     L ${mapX + mapW * 0.60} ${mapY + mapH * 0.40}
     L ${mapX + mapW * 0.63} ${mapY + mapH * 0.48}
     L ${mapX + mapW * 0.62} ${mapY + mapH * 0.58}
     L ${mapX + mapW * 0.60} ${mapY + mapH * 0.66}
     L ${mapX + mapW * 0.58} ${mapY + mapH * 0.74}
     L ${mapX + mapW * 0.55} ${mapY + mapH * 0.80}
     L ${mapX + mapW * 0.52} ${mapY + mapH * 0.76}
     L ${mapX + mapW * 0.50} ${mapY + mapH * 0.68}
     L ${mapX + mapW * 0.47} ${mapY + mapH * 0.56}
     L ${mapX + mapW * 0.46} ${mapY + mapH * 0.46}
     Z`,
    // Asia
    `M ${mapX + mapW * 0.60} ${mapY + mapH * 0.22}
     L ${mapX + mapW * 0.66} ${mapY + mapH * 0.18}
     L ${mapX + mapW * 0.72} ${mapY + mapH * 0.16}
     L ${mapX + mapW * 0.80} ${mapY + mapH * 0.20}
     L ${mapX + mapW * 0.88} ${mapY + mapH * 0.24}
     L ${mapX + mapW * 0.90} ${mapY + mapH * 0.32}
     L ${mapX + mapW * 0.88} ${mapY + mapH * 0.40}
     L ${mapX + mapW * 0.84} ${mapY + mapH * 0.48}
     L ${mapX + mapW * 0.80} ${mapY + mapH * 0.52}
     L ${mapX + mapW * 0.76} ${mapY + mapH * 0.50}
     L ${mapX + mapW * 0.72} ${mapY + mapH * 0.48}
     L ${mapX + mapW * 0.68} ${mapY + mapH * 0.50}
     L ${mapX + mapW * 0.65} ${mapY + mapH * 0.46}
     L ${mapX + mapW * 0.63} ${mapY + mapH * 0.40}
     L ${mapX + mapW * 0.62} ${mapY + mapH * 0.34}
     Z`,
    // Australia
    `M ${mapX + mapW * 0.78} ${mapY + mapH * 0.60}
     L ${mapX + mapW * 0.84} ${mapY + mapH * 0.58}
     L ${mapX + mapW * 0.90} ${mapY + mapH * 0.62}
     L ${mapX + mapW * 0.92} ${mapY + mapH * 0.68}
     L ${mapX + mapW * 0.90} ${mapY + mapH * 0.76}
     L ${mapX + mapW * 0.85} ${mapY + mapH * 0.80}
     L ${mapX + mapW * 0.80} ${mapY + mapH * 0.78}
     L ${mapX + mapW * 0.77} ${mapY + mapH * 0.72}
     L ${mapX + mapW * 0.76} ${mapY + mapH * 0.65}
     Z`,
  ];

  return (
    <div style={{ width, height, background: '#000000', position: 'relative', overflow: 'hidden', opacity }}>
      {/* Deep space background */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0A0608" />
            <stop offset="50%" stopColor="#060305" />
            <stop offset="100%" stopColor="#020102" />
          </radialGradient>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#1A0E14" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="markerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={roseGoldGlow} stopOpacity="1" />
            <stop offset="100%" stopColor={roseGold} stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="20" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="markerFilter" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="connectionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={roseGold} stopOpacity="0" />
            <stop offset="50%" stopColor={roseGoldLight} stopOpacity="0.6" />
            <stop offset="100%" stopColor={roseGold} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={roseGoldDark} stopOpacity="0.3" />
            <stop offset="50%" stopColor={roseGoldLight} stopOpacity="0.8" />
            <stop offset="100%" stopColor={roseGoldDark} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width={width} height={height} fill="url(#bgGrad)" />
        <rect width={width} height={height} fill="url(#mapGlow)" />

        {/* Stars */}
        {STARS.map((star, i) => {
          const twinkle = Math.sin((frame + star.phase * 10) / 40) * 0.3 + 0.7;
          return (
            <circle
              key={`star-${i}`}
              cx={star.x}
              cy={star.y}
              r={star.size * 0.5}
              fill={roseGoldGlow}
              opacity={star.opacity * twinkle}
            />
          );
        })}

        {/* Map container border */}
        <rect
          x={mapX - 2}
          y={mapY - 2}
          width={mapW + 4}
          height={mapH + 4}
          fill="none"
          stroke="url(#borderGrad)"
          strokeWidth="1.5"
          opacity="0.4"
        />

        {/* Grid lines - horizontal */}
        {GRID_LINES_H.map((t, i) => {
          const y = mapY + mapH * t;
          const lineOpacity = i % 3 === 0 ? 0.12 : 0.05;
          return (
            <line
              key={`hline-${i}`}
              x1={mapX}
              y1={y}
              x2={mapX + mapW}
              y2={y}
              stroke={roseGold}
              strokeWidth="0.5"
              opacity={lineOpacity}
            />
          );
        })}

        {/* Grid lines - vertical */}
        {GRID_LINES_V.map((t, i) => {
          const x = mapX + mapW * t;
          const lineOpacity = i % 6 === 0 ? 0.12 : 0.05;
          return (
            <line
              key={`vline-${i}`}
              x1={x}
              y1={mapY}
              x2={x}
              y2={mapY + mapH}
              stroke={roseGold}
              strokeWidth="0.5"
              opacity={lineOpacity}
            />
          );
        })}

        {/* Continents */}
        {continentPaths.map((path, i) => (
          <g key={`continent-${i}`}>
            <path
              d={path}
              fill="#1A0D14"
              stroke={roseGoldDark}
              strokeWidth="1.5"
              opacity="0.9"
            />
            <path
              d={path}
              fill="none"
              stroke={roseGold}
              strokeWidth="0.8"
              opacity="0.4"
              filter="url(#glow)"
            />
          </g>
        ))}

        {/* Connection lines between locations */}
        {CONNECTIONS.map(([a, b], i) => {
          const locA = LOCATIONS[a];
          const locB = LOCATIONS[b];
          const ax = mapX + mapW * locA.x;
          const ay = mapY + mapH * locA.y;
          const bx = mapX + mapW * locB.x;
          const by = mapY + mapH * locB.y;

          const lineDelay = (i * 7) % 60;
          const lineProgress = interpolate(
            frame,
            [50 + lineDelay, 50 + lineDelay + 40],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const pulseSpeed = 0.015 + (i % 5) * 0.003;
          const pulsePhase = (i * 37) % 100;
          const linePulse = Math.sin(frame * pulseSpeed + pulsePhase) * 0.3 + 0.5;

          // Curved path
          const midX = (ax + bx) / 2;
          const midY = Math.min(ay, by) - Math.abs(bx - ax) * 0.15;

          const totalLength = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
          const dashArray = totalLength;
          const dashOffset = totalLength * (1 - lineProgress);

          return (
            <g key={`conn-${i}`}>
              <path
                d={`M ${ax} ${ay} Q ${midX} ${midY} ${bx} ${by}`}
                fill="none"
                stroke={roseGold}
                strokeWidth="1"
                opacity={0.15 * linePulse}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
              />
              <path
                d={`M ${ax} ${ay} Q ${midX} ${midY} ${bx} ${by}`}
                fill="none"
                stroke={roseGoldLight}
                strokeWidth="0.5"
                opacity={0.25 * linePulse * lineProgress}
                filter="url(#glow)"
              />
            </g>
          );
        })}

        {/* Traveling dots on connections */}
        {CONNECTIONS.map(([a, b], i) => {
          const locA = LOCATIONS[a];
          const locB = LOCATIONS[b];
          const ax = mapX + mapW * locA.x;
          const ay = mapY + mapH * locA.y;
          const bx = mapX + mapW * locB.x;
          const by = mapY + mapH * locB.y;

          const speed = 0.008 + (i % 4) * 0.002;
          const phase = (i * 41) % 100;
          const t = ((frame * speed + phase / 100) % 1 + 1) % 1;

          // Quadratic bezier interpolation
          const midX = (ax + bx) / 2;
          const midY = Math.min(ay, by) - Math.abs(bx - ax) * 0.15;
          const dotX = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * midX + t * t * bx;
          const dotY = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * midY + t * t * by;

          const lineDelay = (i * 7) % 60;
          const lineProgress = interpolate(
            frame,
            [50 + lineDelay, 50 + lineDelay + 40],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          return (
            <circle
              key={`traveler-${i}`}
              cx={dotX}
              cy={dotY}
              r={3}
              fill={roseGoldGlow}
              opacity={0.8 * lineProgress}
              filter="url(#glow)"
            />
          );
        })}

        {/* Location markers */}
        {LOCATIONS.map((loc, i) => {
          const cx = mapX + mapW * loc.x;
          const cy = mapY + mapH * loc.y;

          const appearFrame = 60 + loc.delay * 3;
          const appear = interpolate(frame, [appearFrame, appearFrame + 20], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const pulseSpeed = 0.06 + (i % 5) * 0.008;
          const pulsePhase = (i * 53) % 100;
          const pulse1 = ((frame * pulseSpeed + pulsePhase) % 1 + 1) % 1;
          const pulse2 = ((frame * pulseSpeed + pulsePhase + 0.5) % 1 + 1) % 1;

          const ring1Radius = interpolate(pulse1, [0, 1], [8, 60]);
          const ring1Opacity = interpolate(pulse1, [0, 0.3, 1], [0.8, 0.4, 0]) * appear;

          const ring2Radius = interpolate(pulse2, [0, 1], [8, 45]);
          const ring2Opacity = interpolate(pulse2, [0, 0.3, 1], [0.6, 0.3, 0]) * appear;

          const coreGlow = Math.sin(frame * 0.05 + pulsePhase) * 0.3 + 0.7;

          return (
            <g key={`loc-${i}`}>
              {/* Outer pulse ring 1 */}
              <circle
                cx={cx}
                cy={cy}
                r={ring1Radius}
                fill="none"
                stroke={roseGold}
                strokeWidth="1.5"
                opacity={ring1Opacity}
              />
              {/* Outer pulse ring 2 */}
              <circle
                cx={cx}
                cy={cy}
                r={ring2Radius}
                fill="none"
                stroke={roseGoldLight}
                strokeWidth="1"
                opacity={ring2Opacity}
              />
              {/* Glow halo */}
              <circle
                cx={cx}
                cy={cy}
                r={18}
                fill={roseGold}
                opacity={0.08 * appear * coreGlow}
                filter="url(#markerFilter)"
              />
              {/* Core dot outer */}
              <circle
                cx={cx}
                cy={cy}
                r={7}
                fill={roseGoldDark}
                opacity={0.9 * appear}
                filter="url(#glow)"
              />
              {/* Core dot inner */}
              <circle
                cx={cx}
                cy={cy}
                r={4}
                fill={roseGold}
                opacity={appear}
              />
              {/* Core dot highlight */}
              <circle
                cx={cx - 1.5}
                cy={cy - 1.5}
                r={1.5}
                fill={roseGoldGlow}
                opacity={0.9 * appear}
              />
              {/* Diamond marker */}
              <polygon
                points={`${cx},${cy - 12} ${cx + 5},${cy} ${cx},${cy + 6} ${cx - 5},${cy}`}
                fill={roseGold}
                opacity={0.5 * appear}
              />
            </g>
          );
        })}

        {/* Floating particles */}
        {PARTICLES.map((p, i) => {
          const moveY = ((frame * p.speed + p.phase * 6) % height + height) % height;
          const particlePulse = Math.sin(frame * 0.04 + p.phase) * 0.4 + 0.6;
          return (
            <circle
              key={`particle-${i}`}
              cx={p.x}
              cy={moveY}
              r={p.size * 0.6}
              fill={roseGold}
              opacity={0.12 * particlePulse}
            />
          );
        })}

        {/* Corner ornaments */}
        {[
          [mapX + 20, mapY + 20, 1, 1],
          [mapX + mapW - 20, mapY + 20, -1, 1],
          [mapX + 20, mapY + mapH - 20, 1, -1],
          [mapX + mapW - 20, mapY + mapH - 20, -1, -1],
        ].map(([cx, cy, sx, sy], i) => (
          <g key={`corner-${i}`}>
            <line x1={cx} y1={cy} x2={cx + sx * 60} y2={cy} stroke={roseGold} strokeWidth="2" opacity="0.5" />
            <line x1={cx} y1={cy} x2={cx} y2={cy + sy * 60} stroke={roseGold} strokeWidth="2" opacity="0.5" />
            <circle cx={cx} cy={cy} r={3} fill={roseGold} opacity="0.7" />
          </g>
        ))}

        {/* Center cross */}
        <line
          x1={mapX + mapW * 0.5}
          y1={mapY + mapH * 0.48}
          x2={mapX + mapW * 0.5}
          y2={mapY + mapH * 0.52}
          stroke={roseGold}
          strokeWidth="1"
          opacity="0.2"
        />
        <line
          x1={mapX + mapW * 0.48}
          y1={mapY + mapH * 0.5}
          x2={mapX + mapW * 0.52}
          y2={mapY + mapH * 0.5}
          stroke={roseGold}
          strokeWidth="1"
          opacity="0.2"
        />

        {/* Top decorative bar */}
        <rect
          x={mapX + mapW * 0.3}
          y={mapY - 30}
          width={mapW * 0.4}
          height="1"
          fill="url(#borderGrad)"
          opacity="0.6"
        />
        <circle cx={mapX + mapW * 0.5} cy={mapY - 30} r={4} fill={roseGold} opacity="0.6" />

        {/* Bottom decorative bar */}
        <rect
          x={mapX + mapW * 0.2}
          y={mapY + mapH + 20}
          width={mapW * 0.6}
          height="1"
          fill="url(#borderGrad)"
          opacity="0.4"
        />

        {/* Vignette overlay */}
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="60%" stopColor="black" stopOpacity="0" />
            <stop offset="100%" stopColor="black" stopOpacity="0.7" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#vignette)" />

        {/* Scanline overlay */}
        {Array.from({ length: 20 }, (_, i) => (
          <line
            key={`scan-${i}`}
            x1={0}
            y1={(i / 20) * height}
            x2={width}
            y2={(i / 20) * height}
            stroke={roseGold}
            strokeWidth="0.3"
            opacity="0.02"
          />
        ))}
      </svg>
    </div>
  );
};