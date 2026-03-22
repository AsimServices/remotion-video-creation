import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { name: 'New York', x: 0.215, y: 0.36 },
  { name: 'London', x: 0.475, y: 0.255 },
  { name: 'Paris', x: 0.487, y: 0.27 },
  { name: 'Tokyo', x: 0.82, y: 0.31 },
  { name: 'Sydney', x: 0.855, y: 0.72 },
  { name: 'Dubai', x: 0.605, y: 0.39 },
  { name: 'Singapore', x: 0.77, y: 0.52 },
  { name: 'São Paulo', x: 0.285, y: 0.65 },
  { name: 'Lagos', x: 0.49, y: 0.49 },
  { name: 'Mumbai', x: 0.655, y: 0.415 },
  { name: 'Beijing', x: 0.795, y: 0.305 },
  { name: 'Los Angeles', x: 0.12, y: 0.355 },
  { name: 'Cairo', x: 0.555, y: 0.395 },
  { name: 'Moscow', x: 0.585, y: 0.225 },
  { name: 'Toronto', x: 0.205, y: 0.315 },
];

const CONNECTIONS = [
  [0, 1], [0, 14], [0, 11], [1, 2], [1, 13], [1, 12],
  [3, 10], [3, 6], [3, 4], [5, 8], [5, 9], [5, 12],
  [6, 4], [6, 9], [7, 8], [7, 11], [0, 7], [1, 5],
  [2, 13], [9, 5], [10, 3], [11, 7], [13, 5], [14, 1],
  [4, 6], [8, 12], [1, 9], [0, 5], [3, 5], [6, 5],
];

const WORLD_MAP_PATHS = [
  // North America simplified
  'M 120 140 L 160 130 L 200 135 L 230 145 L 250 160 L 245 180 L 220 195 L 200 210 L 170 220 L 150 240 L 130 250 L 115 230 L 105 200 L 100 175 L 110 155 Z',
  // South America
  'M 235 270 L 255 265 L 275 270 L 285 295 L 285 330 L 275 360 L 255 380 L 240 375 L 230 350 L 228 320 L 225 295 Z',
  // Europe
  'M 450 100 L 490 95 L 515 100 L 520 115 L 510 130 L 490 140 L 470 145 L 450 135 L 440 120 L 442 108 Z',
  // Africa
  'M 470 180 L 510 175 L 540 180 L 555 200 L 560 230 L 550 270 L 535 310 L 510 330 L 490 325 L 470 305 L 455 270 L 450 235 L 455 205 Z',
  // Asia
  'M 530 80 L 600 70 L 680 75 L 750 85 L 800 95 L 830 110 L 820 140 L 780 160 L 730 170 L 680 165 L 630 160 L 590 150 L 560 135 L 540 115 L 530 100 Z',
  // Australia
  'M 790 290 L 840 285 L 870 295 L 880 320 L 870 350 L 845 365 L 810 360 L 790 340 L 785 315 Z',
  // Japan/Islands
  'M 810 120 L 830 115 L 840 125 L 835 140 L 818 145 L 808 135 Z',
  // UK/Ireland
  'M 455 105 L 465 100 L 472 108 L 468 120 L 456 122 L 450 115 Z',
  // Greenland
  'M 330 60 L 380 55 L 400 70 L 390 95 L 360 100 L 335 90 Z',
  // Indonesia/SE Asia
  'M 755 230 L 790 225 L 810 235 L 805 248 L 780 252 L 758 245 Z',
];

function cubicBezierPoint(t: number, p0: number, p1: number, p2: number, p3: number) {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

function getConnectionColor(index: number): string {
  const colors = [
    '#00ffff', '#ff00ff', '#00ff88', '#ff6600', '#6600ff',
    '#ff0088', '#00ccff', '#ffcc00', '#88ff00', '#ff4488',
  ];
  return colors[index % colors.length];
}

export const WorldMapNeonConnections: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const scaleX = width / 960;
  const scaleY = height / 540;

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at center, #050a14 0%, #020508 100%)',
        overflow: 'hidden',
        opacity,
        position: 'relative',
      }}
    >
      {/* Stars background */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {Array.from({ length: 200 }).map((_, i) => {
          const sx = (((i * 137.508 + 23) % 1) * width);
          const sy = (((i * 97.3 + 11) % 1) * height);
          const sr = 0.5 + (i % 3) * 0.5;
          const starOpacity = 0.2 + (i % 5) * 0.1 + 0.15 * Math.sin(frame * 0.05 + i);
          return (
            <circle key={i} cx={sx} cy={sy} r={sr} fill="white" opacity={starOpacity} />
          );
        })}
      </svg>

      {/* Main SVG */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-soft">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-city">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="globe-gradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#0a1a2e" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#020508" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Globe glow background */}
        <ellipse
          cx={width / 2}
          cy={height / 2}
          rx={width * 0.45}
          ry={height * 0.42}
          fill="url(#globe-gradient)"
        />

        {/* Grid lines */}
        {Array.from({ length: 18 }).map((_, i) => {
          const x = (i / 17) * width;
          return (
            <line
              key={`vgrid-${i}`}
              x1={x} y1={0} x2={x} y2={height}
              stroke="#0a2040"
              strokeWidth="0.5"
              opacity="0.4"
            />
          );
        })}
        {Array.from({ length: 10 }).map((_, i) => {
          const y = (i / 9) * height;
          return (
            <line
              key={`hgrid-${i}`}
              x1={0} y1={y} x2={width} y2={y}
              stroke="#0a2040"
              strokeWidth="0.5"
              opacity="0.4"
            />
          );
        })}

        {/* World map landmasses */}
        {WORLD_MAP_PATHS.map((d, i) => {
          // Scale the path
          const scaledD = d.replace(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g, (match, px, py) => {
            return `${parseFloat(px) * scaleX * (960 / 960)} ${parseFloat(py) * scaleY * (540 / 540)}`;
          });
          return (
            <g key={i}>
              <path
                d={scaledD}
                fill="#0d2040"
                stroke="#1a4080"
                strokeWidth="1.5"
                opacity="0.85"
                filter="url(#glow-soft)"
              />
              <path
                d={scaledD}
                fill="none"
                stroke="#2060c0"
                strokeWidth="0.5"
                opacity="0.4"
              />
            </g>
          );
        })}

        {/* Connection lines */}
        {CONNECTIONS.map((conn, ci) => {
          const cityA = CITIES[conn[0]];
          const cityB = CITIES[conn[1]];
          const ax = cityA.x * width;
          const ay = cityA.y * height;
          const bx = cityB.x * width;
          const by = cityB.y * height;

          // Control points for curved arc
          const midX = (ax + bx) / 2;
          const midY = (ay + by) / 2;
          const dx = bx - ax;
          const dy = by - ay;
          const len = Math.sqrt(dx * dx + dy * dy);
          const cp1x = midX - dy * 0.3;
          const cp1y = midY + dx * 0.3 - len * 0.15;
          const cp2x = midX - dy * 0.1;
          const cp2y = midY + dx * 0.1 - len * 0.1;

          const color = getConnectionColor(ci);
          const speed = 0.008 + (ci % 5) * 0.003;
          const offset = (ci * 47.3) % 1;
          const tRaw = ((frame * speed + offset) % 1);

          // Animate line drawing with traveling particle
          const linePhase = (frame * 0.012 + ci * 0.15) % 2;
          const drawProgress = Math.min(linePhase, 1);
          const lineOpacity = 0.15 + 0.1 * Math.sin(frame * 0.05 + ci * 1.2);

          // Traveling dot position
          const t = tRaw;
          const dotX = cubicBezierPoint(t, ax, cp1x, cp2x, bx);
          const dotY = cubicBezierPoint(t, ay, cp1y, cp2y, by);

          const pulseScale = 0.6 + 0.4 * Math.sin(frame * 0.1 + ci * 0.7);

          return (
            <g key={ci}>
              {/* Base glow line */}
              <path
                d={`M ${ax} ${ay} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${bx} ${by}`}
                fill="none"
                stroke={color}
                strokeWidth="2"
                opacity={lineOpacity}
                strokeDasharray="6 4"
                strokeDashoffset={-frame * 2}
                filter="url(#glow-soft)"
              />
              {/* Bright line */}
              <path
                d={`M ${ax} ${ay} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${bx} ${by}`}
                fill="none"
                stroke={color}
                strokeWidth="0.8"
                opacity={lineOpacity * 2}
              />
              {/* Traveling particle */}
              <circle
                cx={dotX}
                cy={dotY}
                r={3 * pulseScale}
                fill={color}
                opacity={0.9}
                filter="url(#glow-strong)"
              />
              <circle
                cx={dotX}
                cy={dotY}
                r={6 * pulseScale}
                fill={color}
                opacity={0.3}
                filter="url(#glow-soft)"
              />
            </g>
          );
        })}

        {/* City nodes */}
        {CITIES.map((city, ci) => {
          const cx = city.x * width;
          const cy = city.y * height;
          const pulse1 = 0.5 + 0.5 * Math.sin(frame * 0.08 + ci * 1.1);
          const pulse2 = 0.5 + 0.5 * Math.sin(frame * 0.06 + ci * 0.9 + Math.PI);
          const ringScale1 = 1 + pulse1 * 1.5;
          const ringScale2 = 1 + pulse2 * 2.5;
          const color = getConnectionColor(ci);

          return (
            <g key={ci}>
              {/* Outer ring pulse */}
              <circle
                cx={cx}
                cy={cy}
                r={12 * ringScale2}
                fill="none"
                stroke={color}
                strokeWidth="0.5"
                opacity={0.15 * (1 - pulse2)}
              />
              {/* Mid ring pulse */}
              <circle
                cx={cx}
                cy={cy}
                r={8 * ringScale1}
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity={0.3 * (1 - pulse1)}
                filter="url(#glow-city)"
              />
              {/* Inner glow */}
              <circle
                cx={cx}
                cy={cy}
                r={5}
                fill={color}
                opacity={0.2}
                filter="url(#glow-soft)"
              />
              {/* Core dot */}
              <circle
                cx={cx}
                cy={cy}
                r={3}
                fill={color}
                opacity={0.95}
                filter="url(#glow-city)"
              />
              <circle
                cx={cx}
                cy={cy}
                r={1.5}
                fill="white"
                opacity={0.9}
              />
            </g>
          );
        })}

        {/* Scan line effect */}
        {(() => {
          const scanY = (frame * 2.5) % (height + 100) - 50;
          return (
            <rect
              x={0}
              y={scanY}
              width={width}
              height={2}
              fill="white"
              opacity={0.03}
            />
          );
        })()}

        {/* Corner decorations */}
        {[
          [0, 0, 1, 1],
          [width, 0, -1, 1],
          [0, height, 1, -1],
          [width, height, -1, -1],
        ].map(([cx, cy, sx, sy], i) => (
          <g key={i}>
            <line x1={cx as number} y1={(cy as number) + (sy as number) * 40} x2={cx as number} y2={cy as number} stroke="#00ffff" strokeWidth="1.5" opacity="0.6" />
            <line x1={(cx as number) + (sx as number) * 40} y1={cy as number} x2={cx as number} y2={cy as number} stroke="#00ffff" strokeWidth="1.5" opacity="0.6" />
            <circle cx={(cx as number) + (sx as number) * 5} cy={(cy as number) + (sy as number) * 5} r="2" fill="#00ffff" opacity="0.8" />
          </g>
        ))}

        {/* Ambient glow overlay */}
        <ellipse
          cx={width / 2}
          cy={height / 2}
          rx={width * 0.5}
          ry={height * 0.5}
          fill="none"
          stroke="#003366"
          strokeWidth="80"
          opacity="0.15"
        />
      </svg>
    </div>
  );
};