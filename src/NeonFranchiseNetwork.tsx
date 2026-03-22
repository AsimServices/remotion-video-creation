import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { x: 0.13, y: 0.38, name: 'New York', size: 14 },
  { x: 0.09, y: 0.32, name: 'Chicago', size: 10 },
  { x: 0.07, y: 0.42, name: 'Miami', size: 9 },
  { x: 0.04, y: 0.35, name: 'Los Angeles', size: 12 },
  { x: 0.05, y: 0.28, name: 'Vancouver', size: 8 },
  { x: 0.48, y: 0.22, name: 'London', size: 13 },
  { x: 0.50, y: 0.20, name: 'Paris', size: 12 },
  { x: 0.52, y: 0.24, name: 'Berlin', size: 10 },
  { x: 0.54, y: 0.28, name: 'Rome', size: 9 },
  { x: 0.58, y: 0.22, name: 'Moscow', size: 11 },
  { x: 0.55, y: 0.40, name: 'Dubai', size: 13 },
  { x: 0.62, y: 0.45, name: 'Mumbai', size: 12 },
  { x: 0.72, y: 0.30, name: 'Beijing', size: 14 },
  { x: 0.75, y: 0.38, name: 'Shanghai', size: 13 },
  { x: 0.76, y: 0.42, name: 'Hong Kong', size: 11 },
  { x: 0.78, y: 0.50, name: 'Singapore', size: 10 },
  { x: 0.82, y: 0.52, name: 'Sydney', size: 11 },
  { x: 0.20, y: 0.62, name: 'São Paulo', size: 12 },
  { x: 0.18, y: 0.55, name: 'Bogotá', size: 9 },
  { x: 0.46, y: 0.55, name: 'Lagos', size: 10 },
  { x: 0.54, y: 0.60, name: 'Nairobi', size: 9 },
  { x: 0.52, y: 0.68, name: 'Johannesburg', size: 10 },
  { x: 0.68, y: 0.52, name: 'Bangkok', size: 10 },
  { x: 0.79, y: 0.35, name: 'Tokyo', size: 14 },
  { x: 0.60, y: 0.36, name: 'Karachi', size: 9 },
  { x: 0.44, y: 0.26, name: 'Stockholm', size: 8 },
  { x: 0.56, y: 0.30, name: 'Istanbul', size: 11 },
  { x: 0.65, y: 0.40, name: 'Delhi', size: 13 },
];

const CONNECTIONS = [
  [0, 1], [0, 2], [0, 4], [0, 5], [0, 12],
  [1, 3], [1, 5], [3, 4],
  [5, 6], [5, 7], [5, 25], [6, 8], [7, 9],
  [9, 26], [26, 10], [10, 11], [11, 23],
  [5, 6], [8, 26], [10, 20], [20, 21],
  [12, 13], [12, 23], [13, 14], [14, 15], [15, 16],
  [11, 24], [24, 27], [27, 22], [22, 15],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [6, 7], [7, 8], [9, 10], [23, 13], [14, 22],
];

const PULSES = Array.from({ length: 40 }, (_, i) => ({
  cityIndex: i % CITIES.length,
  offset: (i * 137) % 600,
  speed: 1 + (i % 5) * 0.3,
}));

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 1337 + 300) % 2160,
  size: 1 + (i % 4),
  speed: 0.3 + (i % 6) * 0.15,
  phase: (i * 97) % 600,
}));

export const NeonFranchiseNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const globalPulse = Math.sin(frame * 0.04) * 0.5 + 0.5;
  const slowRotate = frame * 0.002;

  return (
    <div style={{ width, height, background: '#020408', position: 'relative', overflow: 'hidden', opacity }}>
      {/* Deep space background */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0a0f1e" stopOpacity="1" />
            <stop offset="100%" stopColor="#010204" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="50%" stopColor="#88ddff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0044ff" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowStrong" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width={width} height={height} fill="url(#bgGlow)" />

        {/* Ambient nebula clouds */}
        {[
          { cx: 0.2, cy: 0.4, rx: 600, ry: 400, color: '#001133' },
          { cx: 0.7, cy: 0.3, rx: 700, ry: 350, color: '#000a22' },
          { cx: 0.5, cy: 0.7, rx: 500, ry: 300, color: '#0a0020' },
          { cx: 0.85, cy: 0.6, rx: 400, ry: 300, color: '#001122' },
        ].map((cloud, i) => (
          <ellipse
            key={i}
            cx={cloud.cx * width}
            cy={cloud.cy * height}
            rx={cloud.rx}
            ry={cloud.ry}
            fill={cloud.color}
            opacity={0.5 + Math.sin(frame * 0.01 + i * 1.5) * 0.15}
          />
        ))}

        {/* Background particles / stars */}
        {PARTICLES.map((p, i) => {
          const twinkle = Math.sin(frame * p.speed * 0.05 + p.phase) * 0.4 + 0.6;
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={p.size * 0.6}
              fill="#aaccff"
              opacity={twinkle * 0.4}
            />
          );
        })}

        {/* Connection lines */}
        {CONNECTIONS.map(([a, b], i) => {
          const cityA = CITIES[a];
          const cityB = CITIES[b];
          const ax = cityA.x * width;
          const ay = cityA.y * height;
          const bx = cityB.x * width;
          const by = cityB.y * height;

          const revealDelay = (i * 7) % 200;
          const revealProgress = interpolate(frame, [revealDelay, revealDelay + 80], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

          const midX = (ax + bx) / 2;
          const midY = (ay + by) / 2 - Math.abs(bx - ax) * 0.12;
          const pathStr = `M ${ax} ${ay} Q ${midX} ${midY} ${bx} ${by}`;

          const lineOpacity = revealProgress * (0.35 + Math.sin(frame * 0.02 + i * 0.4) * 0.1);

          return (
            <g key={i}>
              {/* Outer glow line */}
              <path
                d={pathStr}
                stroke="#4488ff"
                strokeWidth={3}
                fill="none"
                opacity={lineOpacity * 0.4}
                filter="url(#glow)"
                strokeDasharray="8 4"
                strokeDashoffset={-(frame * 1.5 + i * 20) % 24}
              />
              {/* Main line */}
              <path
                d={pathStr}
                stroke="#99ddff"
                strokeWidth={1.5}
                fill="none"
                opacity={lineOpacity * 0.8}
                strokeDasharray="6 3"
                strokeDashoffset={-(frame * 1.5 + i * 20) % 18}
              />
              {/* Bright core line */}
              <path
                d={pathStr}
                stroke="#ffffff"
                strokeWidth={0.8}
                fill="none"
                opacity={lineOpacity * 0.5}
              />
            </g>
          );
        })}

        {/* Data flow pulses along connections */}
        {PULSES.map((pulse, i) => {
          const connIndex = i % CONNECTIONS.length;
          const [a, b] = CONNECTIONS[connIndex];
          const cityA = CITIES[a];
          const cityB = CITIES[b];
          const ax = cityA.x * width;
          const ay = cityA.y * height;
          const bx = cityB.x * width;
          const by = cityB.y * height;

          const cycleFrame = (frame + pulse.offset) % 300;
          const t = (cycleFrame / 300) * pulse.speed % 1;

          const midX = (ax + bx) / 2;
          const midY = (ay + by) / 2 - Math.abs(bx - ax) * 0.12;

          const px = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * midX + t * t * bx;
          const py = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * midY + t * t * by;

          const pulseOpacity = Math.sin(t * Math.PI) * 0.9;

          return (
            <g key={i} filter="url(#glowStrong)">
              <circle cx={px} cy={py} r={5} fill="#ffffff" opacity={pulseOpacity * 0.9} />
              <circle cx={px} cy={py} r={10} fill="#88ccff" opacity={pulseOpacity * 0.4} />
              <circle cx={px} cy={py} r={18} fill="#3366ff" opacity={pulseOpacity * 0.15} />
            </g>
          );
        })}

        {/* City nodes */}
        {CITIES.map((city, i) => {
          const cx = city.x * width;
          const cy = city.y * height;
          const revealDelay = (i * 23) % 150;
          const revealed = interpolate(frame, [revealDelay, revealDelay + 40], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

          const pulse1 = Math.sin(frame * 0.06 + i * 0.8) * 0.5 + 0.5;
          const pulse2 = Math.sin(frame * 0.04 + i * 1.2 + 1) * 0.5 + 0.5;
          const ring1Size = city.size * 3 + pulse1 * city.size * 2;
          const ring2Size = city.size * 5 + pulse2 * city.size * 3;
          const ring3Size = city.size * 8 + globalPulse * city.size * 4;

          return (
            <g key={i} opacity={revealed}>
              {/* Outermost ambient ring */}
              <circle
                cx={cx}
                cy={cy}
                r={ring3Size}
                fill="none"
                stroke="#1144aa"
                strokeWidth={1}
                opacity={0.15 + pulse1 * 0.1}
              />
              {/* Second pulse ring */}
              <circle
                cx={cx}
                cy={cy}
                r={ring2Size}
                fill="none"
                stroke="#2266cc"
                strokeWidth={1.5}
                opacity={0.25 + pulse2 * 0.15}
                filter="url(#glow)"
              />
              {/* First pulse ring */}
              <circle
                cx={cx}
                cy={cy}
                r={ring1Size}
                fill="none"
                stroke="#55aaff"
                strokeWidth={2}
                opacity={0.5 + pulse1 * 0.3}
                filter="url(#glow)"
              />
              {/* Glow halo */}
              <circle
                cx={cx}
                cy={cy}
                r={city.size * 2.5}
                fill="#3399ff"
                opacity={(0.15 + pulse2 * 0.15)}
                filter="url(#glowStrong)"
              />
              {/* Core dot */}
              <circle
                cx={cx}
                cy={cy}
                r={city.size}
                fill="#ffffff"
                opacity={0.95}
                filter="url(#glowStrong)"
              />
              {/* Inner bright core */}
              <circle
                cx={cx}
                cy={cy}
                r={city.size * 0.5}
                fill="#eef8ff"
                opacity={1}
              />
              {/* Cross marker */}
              <line
                x1={cx - city.size * 1.8}
                y1={cy}
                x2={cx + city.size * 1.8}
                y2={cy}
                stroke="#88ccff"
                strokeWidth={1}
                opacity={0.6 + pulse1 * 0.3}
              />
              <line
                x1={cx}
                y1={cy - city.size * 1.8}
                x2={cx}
                y2={cy + city.size * 1.8}
                stroke="#88ccff"
                strokeWidth={1}
                opacity={0.6 + pulse1 * 0.3}
              />
            </g>
          );
        })}

        {/* Central network hub glow at center of mass */}
        <circle
          cx={0.5 * width}
          cy={0.42 * height}
          r={interpolate(globalPulse, [0, 1], [180, 260])}
          fill="none"
          stroke="#0033aa"
          strokeWidth={2}
          opacity={0.12}
          filter="url(#glow)"
        />
        <circle
          cx={0.5 * width}
          cy={0.42 * height}
          r={interpolate(globalPulse, [0, 1], [80, 120])}
          fill="#001133"
          opacity={0.25 + globalPulse * 0.1}
          filter="url(#glowStrong)"
        />

        {/* Scanning beam effect */}
        {[0, 1, 2].map((i) => {
          const scanAngle = (frame * 0.8 + i * 120) % 360;
          const scanRad = (scanAngle * Math.PI) / 180;
          const scanLen = 900;
          const scanX = 0.5 * width + Math.cos(scanRad) * scanLen;
          const scanY = 0.42 * height + Math.sin(scanRad) * scanLen;
          return (
            <line
              key={i}
              x1={0.5 * width}
              y1={0.42 * height}
              x2={scanX}
              y2={scanY}
              stroke="#2255ff"
              strokeWidth={2}
              opacity={0.04 + i * 0.02}
              filter="url(#glow)"
            />
          );
        })}

        {/* Rotating outer ring decorations */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (frame * 0.3 + i * 60) % 360;
          const rad = (angle * Math.PI) / 180;
          const ringR = 700 + i * 40;
          const dotX = 0.5 * width + Math.cos(rad) * ringR;
          const dotY = 0.42 * height + Math.sin(rad) * (ringR * 0.55);
          return (
            <circle
              key={i}
              cx={dotX}
              cy={dotY}
              r={4 + (i % 3) * 2}
              fill="#3366ff"
              opacity={0.3 + Math.sin(frame * 0.05 + i) * 0.15}
              filter="url(#softGlow)"
            />
          );
        })}

        {/* Corner hex decorations */}
        {[
          { x: 0.05, y: 0.05 },
          { x: 0.95, y: 0.05 },
          { x: 0.05, y: 0.95 },
          { x: 0.95, y: 0.95 },
        ].map((corner, i) => {
          const cx2 = corner.x * width;
          const cy2 = corner.y * height;
          const hexPulse = Math.sin(frame * 0.05 + i * 1.57) * 0.5 + 0.5;
          return (
            <g key={i}>
              <circle cx={cx2} cy={cy2} r={60 + hexPulse * 20} fill="none" stroke="#1133aa" strokeWidth={1} opacity={0.3} />
              <circle cx={cx2} cy={cy2} r={40 + hexPulse * 10} fill="none" stroke="#2244bb" strokeWidth={1.5} opacity={0.4} />
              <circle cx={cx2} cy={cy2} r={8} fill="#3366ff" opacity={0.6 + hexPulse * 0.3} filter="url(#glow)" />
            </g>
          );
        })}

        {/* Horizontal grid lines */}
        {Array.from({ length: 8 }, (_, i) => {
          const y = (i / 7) * height;
          return (
            <line
              key={i}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke="#0a1a40"
              strokeWidth={1}
              opacity={0.3}
            />
          );
        })}

        {/* Vertical grid lines */}
        {Array.from({ length: 14 }, (_, i) => {
          const x = (i / 13) * width;
          return (
            <line
              key={i}
              x1={x}
              y1={0}
              x2={x}
              y2={height}
              stroke="#0a1a40"
              strokeWidth={1}
              opacity={0.3}
            />
          );
        })}

        {/* Top vignette */}
        <defs>
          <linearGradient id="vigTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020408" stopOpacity="0.8" />
            <stop offset="20%" stopColor="#020408" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="vigBottom" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#020408" stopOpacity="0.8" />
            <stop offset="20%" stopColor="#020408" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="vigLeft" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#020408" stopOpacity="0.7" />
            <stop offset="15%" stopColor="#020408" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="vigRight" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#020408" stopOpacity="0.7" />
            <stop offset="15%" stopColor="#020408" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width={width} height={height} fill="url(#vigTop)" />
        <rect width={width} height={height} fill="url(#vigBottom)" />
        <rect width={width} height={height} fill="url(#vigLeft)" />
        <rect width={width} height={height} fill="url(#vigRight)" />
      </svg>
    </div>
  );
};