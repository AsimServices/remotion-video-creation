import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Internet Exchange Points (normalized 0-1 coordinates, approximate world map positions)
const EXCHANGE_POINTS = [
  { id: 0, x: 0.13, y: 0.38, name: 'NYC' },
  { id: 1, x: 0.08, y: 0.35, name: 'CHI' },
  { id: 2, x: 0.05, y: 0.32, name: 'LAX' },
  { id: 3, x: 0.22, y: 0.55, name: 'MIA' },
  { id: 4, x: 0.45, y: 0.28, name: 'LON' },
  { id: 5, x: 0.48, y: 0.27, name: 'AMS' },
  { id: 6, x: 0.50, y: 0.26, name: 'FRA' },
  { id: 7, x: 0.53, y: 0.25, name: 'WAR' },
  { id: 8, x: 0.55, y: 0.30, name: 'IST' },
  { id: 9, x: 0.58, y: 0.35, name: 'DXB' },
  { id: 10, x: 0.65, y: 0.42, name: 'MUM' },
  { id: 11, x: 0.72, y: 0.38, name: 'SIN' },
  { id: 12, x: 0.78, y: 0.32, name: 'HKG' },
  { id: 13, x: 0.82, y: 0.30, name: 'TYO' },
  { id: 14, x: 0.85, y: 0.42, name: 'SYD' },
  { id: 15, x: 0.62, y: 0.22, name: 'MOW' },
  { id: 16, x: 0.30, y: 0.60, name: 'SAO' },
  { id: 17, x: 0.52, y: 0.55, name: 'JNB' },
  { id: 18, x: 0.75, y: 0.22, name: 'BEI' },
  { id: 19, x: 0.20, y: 0.42, name: 'BOG' },
];

// Pre-compute fiber routes between exchange points
const ROUTES = [
  [0, 1], [0, 4], [1, 2], [2, 4], [0, 3],
  [4, 5], [5, 6], [6, 7], [6, 8], [8, 9],
  [9, 10], [10, 11], [11, 12], [12, 13], [13, 14],
  [4, 15], [15, 18], [18, 12], [18, 13],
  [0, 16], [16, 3], [3, 19],
  [4, 6], [9, 15], [10, 17],
  [11, 14], [5, 15], [2, 19], [16, 17],
  [7, 8], [1, 4], [0, 5], [3, 16], [13, 18],
  [6, 9], [10, 12], [14, 17],
];

// Pre-compute particles for each route
const PARTICLES_PER_ROUTE = 4;
const ROUTE_PARTICLES = ROUTES.map((_, routeIdx) =>
  Array.from({ length: PARTICLES_PER_ROUTE }, (__, pIdx) => ({
    offset: ((routeIdx * 137 + pIdx * 73) % 100) / 100,
    speed: 0.3 + ((routeIdx * 31 + pIdx * 17) % 70) / 100,
    size: 2 + (pIdx % 3),
  }))
);

// Stars background
const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 1731 + 42) % 3840,
  y: (i * 1337 + 17) % 2160,
  r: ((i * 97) % 3) + 1,
  opacity: 0.2 + ((i * 53) % 60) / 100,
}));

// World map continents as simplified SVG paths (normalized to 3840x2160)
// Using approximate continent outlines
const CONTINENT_PATHS = [
  // North America
  'M 200 350 Q 280 280 380 300 Q 450 350 480 420 Q 460 500 380 540 Q 300 520 240 480 Q 180 440 200 350 Z',
  // South America  
  'M 320 540 Q 380 520 420 580 Q 460 650 440 750 Q 400 820 340 800 Q 280 760 280 680 Q 280 600 320 540 Z',
  // Europe
  'M 1580 250 Q 1680 220 1780 240 Q 1840 270 1820 330 Q 1760 360 1680 350 Q 1600 330 1580 250 Z',
  // Africa
  'M 1680 380 Q 1760 360 1820 400 Q 1880 480 1860 580 Q 1820 680 1740 700 Q 1660 680 1640 580 Q 1620 480 1680 380 Z',
  // Asia
  'M 1840 180 Q 2100 150 2400 180 Q 2600 220 2700 320 Q 2680 420 2560 460 Q 2400 480 2200 440 Q 2000 400 1880 340 Q 1820 280 1840 180 Z',
  // Australia
  'M 2820 620 Q 2940 600 3020 660 Q 3060 720 3020 780 Q 2940 820 2840 780 Q 2780 720 2820 620 Z',
];

function cubicBezierPoint(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

function getRouteControlPoints(
  x1: number, y1: number, x2: number, y2: number
): { cx1: number; cy1: number; cx2: number; cy2: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const arcHeight = dist * 0.3;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const nx = -dy / dist;
  const ny = dx / dist;
  const cx = mx + nx * arcHeight;
  const cy = my + ny * arcHeight - arcHeight * 0.5;
  return {
    cx1: x1 + (cx - x1) * 0.5,
    cy1: y1 + (cy - y1) * 0.5 - arcHeight * 0.3,
    cx2: x2 + (cx - x2) * 0.5,
    cy2: y2 + (cy - y2) * 0.5 - arcHeight * 0.3,
  };
}

export const FiberOpticDataRoutes: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const time = frame / 30;

  // Pulse for exchange points
  const pulseScale = 1 + 0.3 * Math.sin(time * 2);

  return (
    <div style={{ width, height, background: '#020810', overflow: 'hidden', opacity: globalOpacity }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {/* Cyan glow filter */}
          <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur1" />
            <feGaussianBlur stdDeviation="12" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-point" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur1" />
            <feGaussianBlur stdDeviation="18" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#001a2e" />
            <stop offset="100%" stopColor="#020810" />
          </radialGradient>
          {ROUTES.map((route, idx) => {
            const p1 = EXCHANGE_POINTS[route[0]];
            const p2 = EXCHANGE_POINTS[route[1]];
            const x1 = p1.x * width;
            const y1 = p1.y * height;
            const x2 = p2.x * width;
            const y2 = p2.y * height;
            const { cx1, cy1, cx2, cy2 } = getRouteControlPoints(x1, y1, x2, y2);
            return (
              <linearGradient key={`lg-${idx}`} id={`routeGrad-${idx}`} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00ffff" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#00e5ff" stopOpacity="1" />
                <stop offset="100%" stopColor="#00ffff" stopOpacity="0.9" />
              </linearGradient>
            );
          })}
        </defs>

        {/* Background */}
        <rect width={width} height={height} fill="url(#bgGrad)" />

        {/* Stars */}
        {STARS.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill="#ffffff"
            opacity={star.opacity * (0.5 + 0.5 * Math.sin(time * 0.5 + i * 0.3))}
          />
        ))}

        {/* Continent shapes */}
        {CONTINENT_PATHS.map((path, i) => (
          <path
            key={`continent-${i}`}
            d={path}
            fill="none"
            stroke="#0a3040"
            strokeWidth="1.5"
            opacity="0.4"
          />
        ))}
        {CONTINENT_PATHS.map((path, i) => (
          <path
            key={`continent-fill-${i}`}
            d={path}
            fill="#061820"
            stroke="none"
            opacity="0.5"
          />
        ))}

        {/* Grid lines (subtle world map grid) */}
        {Array.from({ length: 18 }, (_, i) => (
          <line
            key={`vgrid-${i}`}
            x1={(i / 18) * width}
            y1={0}
            x2={(i / 18) * width}
            y2={height}
            stroke="#001828"
            strokeWidth="0.8"
            opacity="0.4"
          />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line
            key={`hgrid-${i}`}
            x1={0}
            y1={(i / 10) * height}
            x2={width}
            y2={(i / 10) * height}
            stroke="#001828"
            strokeWidth="0.8"
            opacity="0.4"
          />
        ))}

        {/* Fiber optic routes */}
        {ROUTES.map((route, routeIdx) => {
          const p1 = EXCHANGE_POINTS[route[0]];
          const p2 = EXCHANGE_POINTS[route[1]];
          const x1 = p1.x * width;
          const y1 = p1.y * height;
          const x2 = p2.x * width;
          const y2 = p2.y * height;
          const { cx1, cy1, cx2, cy2 } = getRouteControlPoints(x1, y1, x2, y2);
          const pathD = `M ${x1} ${y1} C ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}`;

          // Animate route draw-in
          const routeDelay = (routeIdx * 8) % 60;
          const drawProgress = interpolate(
            frame,
            [routeDelay, routeDelay + 80],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          // Pulsing opacity
          const routeOpacity = 0.3 + 0.2 * Math.sin(time * 1.5 + routeIdx * 0.4);

          return (
            <g key={`route-${routeIdx}`}>
              {/* Outer glow */}
              <path
                d={pathD}
                fill="none"
                stroke="#00ffff"
                strokeWidth="4"
                opacity={routeOpacity * 0.3 * drawProgress}
                filter="url(#glow-cyan)"
                strokeDasharray={`${drawProgress * 10000} 10000`}
              />
              {/* Main line */}
              <path
                d={pathD}
                fill="none"
                stroke={`url(#routeGrad-${routeIdx})`}
                strokeWidth="1.5"
                opacity={(routeOpacity + 0.3) * drawProgress}
                strokeDasharray={`${drawProgress * 10000} 10000`}
              />
            </g>
          );
        })}

        {/* Data packets traveling along routes */}
        {ROUTES.map((route, routeIdx) =>
          ROUTE_PARTICLES[routeIdx].map((particle, pIdx) => {
            const p1 = EXCHANGE_POINTS[route[0]];
            const p2 = EXCHANGE_POINTS[route[1]];
            const x1 = p1.x * width;
            const y1 = p1.y * height;
            const x2 = p2.x * width;
            const y2 = p2.y * height;
            const { cx1, cy1, cx2, cy2 } = getRouteControlPoints(x1, y1, x2, y2);

            const t = ((time * particle.speed * 0.15 + particle.offset) % 1 + 1) % 1;
            const px = cubicBezierPoint(t, x1, cx1, cx2, x2);
            const py = cubicBezierPoint(t, y1, cy1, cy2, y2);

            // Pulse brightness
            const brightness = 0.6 + 0.4 * Math.sin(time * 4 + pIdx * 1.3);

            const routeDelay = (routeIdx * 8) % 60;
            const visible = interpolate(
              frame,
              [routeDelay + 80, routeDelay + 100],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            return (
              <g key={`particle-${routeIdx}-${pIdx}`} opacity={visible * brightness}>
                {/* Packet glow */}
                <circle cx={px} cy={py} r={particle.size * 3} fill="#00ffff" opacity={0.15} filter="url(#glow-soft)" />
                {/* Packet core */}
                <circle cx={px} cy={py} r={particle.size} fill="#ffffff" opacity={0.9} />
                {/* Packet inner glow */}
                <circle cx={px} cy={py} r={particle.size * 1.5} fill="#00ffff" opacity={0.6} filter="url(#glow-soft)" />
              </g>
            );
          })
        )}

        {/* Exchange point nodes */}
        {EXCHANGE_POINTS.map((point, idx) => {
          const x = point.x * width;
          const y = point.y * height;

          const nodeDelay = (idx * 12) % 50;
          const nodeAppear = interpolate(
            frame,
            [nodeDelay, nodeDelay + 40],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          // Ring pulse
          const ringPulse = (time * 0.8 + idx * 0.2) % 1;
          const ringRadius = interpolate(ringPulse, [0, 1], [8, 40]);
          const ringOpacity = interpolate(ringPulse, [0, 0.3, 1], [0.8, 0.4, 0]);

          // Inner pulse
          const innerPulse = 1 + 0.2 * Math.sin(time * 3 + idx * 0.7) * pulseScale * 0.5;

          return (
            <g key={`node-${idx}`} opacity={nodeAppear}>
              {/* Expanding ring */}
              <circle
                cx={x}
                cy={y}
                r={ringRadius}
                fill="none"
                stroke="#00ffff"
                strokeWidth="1.5"
                opacity={ringOpacity * 0.5}
              />
              {/* Second ring offset */}
              <circle
                cx={x}
                cy={y}
                r={ringRadius * 0.6}
                fill="none"
                stroke="#00e5ff"
                strokeWidth="1"
                opacity={ringOpacity * 0.4}
              />
              {/* Outer glow */}
              <circle
                cx={x}
                cy={y}
                r={12 * innerPulse}
                fill="#00ffff"
                opacity={0.08}
                filter="url(#glow-point)"
              />
              {/* Node body */}
              <circle
                cx={x}
                cy={y}
                r={8}
                fill="#003344"
                stroke="#00ffff"
                strokeWidth="1.5"
                opacity={0.9}
              />
              {/* Inner core */}
              <circle
                cx={x}
                cy={y}
                r={4}
                fill="#00ffff"
                opacity={0.8 + 0.2 * Math.sin(time * 2 + idx)}
                filter="url(#glow-soft)"
              />
              {/* Center dot */}
              <circle
                cx={x}
                cy={y}
                r={2}
                fill="#ffffff"
                opacity={0.95}
              />
            </g>
          );
        })}

        {/* Global network activity overlay glow */}
        <ellipse
          cx={width * 0.5}
          cy={height * 0.45}
          rx={width * 0.55}
          ry={height * 0.35}
          fill="none"
          stroke="#002233"
          strokeWidth="1"
          opacity={0.15 + 0.05 * Math.sin(time * 0.3)}
        />

        {/* Scan line effect */}
        <rect
          x={0}
          y={((time * 60) % height) - 2}
          width={width}
          height={4}
          fill="#00ffff"
          opacity={0.02}
        />
      </svg>
    </div>
  );
};