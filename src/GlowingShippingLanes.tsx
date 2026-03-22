import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const PORTS = [
  { id: 0, x: 0.12, y: 0.38, name: 'New York' },
  { id: 1, x: 0.22, y: 0.55, name: 'Santos' },
  { id: 2, x: 0.47, y: 0.28, name: 'Rotterdam' },
  { id: 3, x: 0.51, y: 0.35, name: 'Mediterranean' },
  { id: 4, x: 0.55, y: 0.55, name: 'Mombasa' },
  { id: 5, x: 0.62, y: 0.38, name: 'Mumbai' },
  { id: 6, x: 0.72, y: 0.32, name: 'Shanghai' },
  { id: 7, x: 0.78, y: 0.42, name: 'Singapore' },
  { id: 8, x: 0.84, y: 0.38, name: 'Tokyo' },
  { id: 9, x: 0.88, y: 0.55, name: 'Sydney' },
  { id: 10, x: 0.30, y: 0.42, name: 'Dakar' },
  { id: 11, x: 0.15, y: 0.28, name: 'Halifax' },
];

const LANES = [
  { from: 0, to: 2, color: '#00cfff', speed: 0.8 },
  { from: 0, to: 11, color: '#00cfff', speed: 0.6 },
  { from: 11, to: 2, color: '#00cfff', speed: 0.7 },
  { from: 2, to: 6, color: '#00aaff', speed: 0.5 },
  { from: 2, to: 5, color: '#00aaff', speed: 0.6 },
  { from: 2, to: 3, color: '#00ddff', speed: 0.9 },
  { from: 3, to: 5, color: '#00ddff', speed: 0.7 },
  { from: 5, to: 6, color: '#00ffcc', speed: 0.8 },
  { from: 6, to: 8, color: '#00ffcc', speed: 0.9 },
  { from: 6, to: 7, color: '#00ffcc', speed: 0.7 },
  { from: 7, to: 9, color: '#00ffaa', speed: 0.6 },
  { from: 7, to: 5, color: '#00ffaa', speed: 0.5 },
  { from: 0, to: 1, color: '#44aaff', speed: 0.5 },
  { from: 1, to: 10, color: '#44aaff', speed: 0.4 },
  { from: 10, to: 4, color: '#44aaff', speed: 0.5 },
  { from: 4, to: 5, color: '#88ffcc', speed: 0.6 },
  { from: 4, to: 7, color: '#88ffcc', speed: 0.55 },
  { from: 8, to: 9, color: '#00ffcc', speed: 0.7 },
  { from: 0, to: 3, color: '#88ccff', speed: 0.45 },
  { from: 2, to: 10, color: '#88ccff', speed: 0.5 },
];

const STARS = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731 + 42) % 3840,
  y: (i * 1337 + 17) % 2160,
  r: ((i * 97) % 3) + 1,
  opacity: ((i * 53) % 60) / 100 + 0.2,
}));

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  laneIdx: i % LANES.length,
  offset: (i * 0.127) % 1.0,
  size: ((i * 37) % 5) + 3,
}));

function getQuadraticPoint(
  x1: number, y1: number,
  x2: number, y2: number,
  t: number
) {
  const cx = (x1 + x2) / 2 + (y2 - y1) * 0.3;
  const cy = (y1 + y2) / 2 - (x2 - x1) * 0.3;
  const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
  const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
  return { px, py };
}

function buildQuadPath(x1: number, y1: number, x2: number, y2: number) {
  const cx = (x1 + x2) / 2 + (y2 - y1) * 0.3;
  const cy = (y1 + y2) / 2 - (x2 - x1) * 0.3;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

const LAND_SHAPES = [
  // North America
  'M 250 130 L 480 110 L 520 160 L 490 230 L 430 280 L 380 310 L 320 350 L 270 340 L 230 290 L 210 240 L 220 180 Z',
  // South America
  'M 310 420 L 370 410 L 400 450 L 410 530 L 390 600 L 360 650 L 320 640 L 290 590 L 280 510 L 290 460 Z',
  // Europe
  'M 1680 110 L 1780 100 L 1820 130 L 1810 170 L 1770 190 L 1720 185 L 1680 160 Z',
  // Africa
  'M 1700 280 L 1800 270 L 1840 320 L 1840 430 L 1800 520 L 1750 560 L 1700 540 L 1660 480 L 1650 380 L 1660 310 Z',
  // Asia
  'M 1870 100 L 2250 90 L 2400 140 L 2450 200 L 2380 260 L 2250 280 L 2100 270 L 1980 240 L 1900 200 L 1870 160 Z',
  // Australia
  'M 2850 500 L 3000 480 L 3050 530 L 3040 600 L 2980 630 L 2880 620 L 2830 570 Z',
  // UK/Ireland
  'M 1720 115 L 1740 108 L 1745 125 L 1730 130 Z',
  // Japan
  'M 2850 210 L 2880 200 L 2900 225 L 2870 240 Z',
  // Indonesia (simplified)
  'M 2650 410 L 2720 400 L 2750 420 L 2730 440 L 2670 435 Z',
];

export const GlowingShippingLanes: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scaleX = width / 3840;
  const scaleY = height / 2160;

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 50% 50%, #010d1f 0%, #000508 100%)',
        overflow: 'hidden',
        opacity: globalOpacity,
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="18" result="blur1" />
            <feGaussianBlur stdDeviation="6" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-port" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="star-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="ocean-grad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#021a38" />
            <stop offset="60%" stopColor="#010e20" />
            <stop offset="100%" stopColor="#000508" />
          </radialGradient>
          <radialGradient id="pulse-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00cfff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00cfff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ocean background */}
        <rect width={width} height={height} fill="url(#ocean-grad)" />

        {/* Stars */}
        <g filter="url(#star-glow)">
          {STARS.map((s, i) => (
            <circle
              key={i}
              cx={s.x * scaleX}
              cy={s.y * scaleY * 0.45}
              r={s.r * scaleX / 3840 * 3840}
              fill="white"
              opacity={s.opacity * (0.5 + 0.5 * Math.sin(frame * 0.02 + i * 0.3))}
            />
          ))}
        </g>

        {/* Land masses */}
        <g transform={`scale(${scaleX}, ${scaleY})`} opacity={0.85}>
          {LAND_SHAPES.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="#0a2a1a"
              stroke="#0d3d28"
              strokeWidth={1.5}
            />
          ))}
        </g>

        {/* Ocean grid lines */}
        <g opacity={0.06}>
          {Array.from({ length: 18 }, (_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={(i / 17) * height}
              x2={width}
              y2={(i / 17) * height}
              stroke="#0088cc"
              strokeWidth={0.8 * scaleY}
            />
          ))}
          {Array.from({ length: 32 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={(i / 31) * width}
              y1={0}
              x2={(i / 31) * width}
              y2={height}
              stroke="#0088cc"
              strokeWidth={0.8 * scaleX}
            />
          ))}
        </g>

        {/* Shipping lanes - glow layers */}
        {LANES.map((lane, li) => {
          const p1 = PORTS[lane.from];
          const p2 = PORTS[lane.to];
          const x1 = p1.x * width;
          const y1 = p1.y * height;
          const x2 = p2.x * width;
          const y2 = p2.y * height;
          const d = buildQuadPath(x1, y1, x2, y2);

          const lanePhase = (li * 0.37) % 1.0;
          const dashOffset = -((frame * lane.speed + lanePhase * 600) % 300) * scaleX;
          const pulseOpacity = 0.4 + 0.3 * Math.sin(frame * 0.04 + li * 0.8);

          return (
            <g key={li}>
              {/* Wide outer glow */}
              <path
                d={d}
                fill="none"
                stroke={lane.color}
                strokeWidth={8 * scaleX}
                opacity={0.08}
                strokeLinecap="round"
              />
              {/* Medium glow */}
              <path
                d={d}
                fill="none"
                stroke={lane.color}
                strokeWidth={4 * scaleX}
                opacity={0.18 * pulseOpacity}
                strokeLinecap="round"
              />
              {/* Core lane */}
              <path
                d={d}
                fill="none"
                stroke={lane.color}
                strokeWidth={1.5 * scaleX}
                opacity={0.6}
                strokeLinecap="round"
                strokeDasharray={`${20 * scaleX} ${12 * scaleX}`}
                strokeDashoffset={dashOffset}
              />
              {/* Bright moving dashes */}
              <path
                d={d}
                fill="none"
                stroke="white"
                strokeWidth={0.8 * scaleX}
                opacity={0.3}
                strokeLinecap="round"
                strokeDasharray={`${8 * scaleX} ${24 * scaleX}`}
                strokeDashoffset={dashOffset * 1.3}
              />
            </g>
          );
        })}

        {/* Moving ship particles */}
        {PARTICLES.map((p, pi) => {
          const lane = LANES[p.laneIdx];
          const port1 = PORTS[lane.from];
          const port2 = PORTS[lane.to];
          const x1 = port1.x * width;
          const y1 = port1.y * height;
          const x2 = port2.x * width;
          const y2 = port2.y * height;

          const speed = lane.speed * 0.003;
          const t = ((frame * speed + p.offset) % 1.0);
          const { px, py } = getQuadraticPoint(x1, y1, x2, y2, t);

          const glowSize = p.size * scaleX * 2.5;
          const particleColor = lane.color;

          return (
            <g key={pi} filter="url(#glow-strong)">
              <circle
                cx={px}
                cy={py}
                r={glowSize * 2.5}
                fill={particleColor}
                opacity={0.12}
              />
              <circle
                cx={px}
                cy={py}
                r={glowSize}
                fill={particleColor}
                opacity={0.5}
              />
              <circle
                cx={px}
                cy={py}
                r={glowSize * 0.4}
                fill="white"
                opacity={0.85}
              />
            </g>
          );
        })}

        {/* Port nodes */}
        {PORTS.map((port, pi) => {
          const cx = port.x * width;
          const cy = port.y * height;
          const pulseScale = 1 + 0.4 * Math.sin(frame * 0.07 + pi * 1.1);
          const innerPulse = 1 + 0.25 * Math.sin(frame * 0.1 + pi * 0.7 + 1.5);
          const ringOpacity = 0.4 + 0.35 * Math.sin(frame * 0.05 + pi * 0.9);

          return (
            <g key={pi} filter="url(#glow-port)">
              {/* Outer pulse ring */}
              <circle
                cx={cx}
                cy={cy}
                r={28 * scaleX * pulseScale}
                fill="none"
                stroke="#00cfff"
                strokeWidth={1.5 * scaleX}
                opacity={ringOpacity * 0.4}
              />
              {/* Middle ring */}
              <circle
                cx={cx}
                cy={cy}
                r={18 * scaleX * innerPulse}
                fill="none"
                stroke="#00cfff"
                strokeWidth={2 * scaleX}
                opacity={ringOpacity * 0.7}
              />
              {/* Port glow fill */}
              <circle
                cx={cx}
                cy={cy}
                r={10 * scaleX}
                fill="#00cfff"
                opacity={0.25}
              />
              {/* Port core */}
              <circle
                cx={cx}
                cy={cy}
                r={5 * scaleX}
                fill="#00eeff"
                opacity={0.9}
              />
              {/* Port center dot */}
              <circle
                cx={cx}
                cy={cy}
                r={2.5 * scaleX}
                fill="white"
                opacity={1}
              />
            </g>
          );
        })}

        {/* Global ocean shimmer overlay */}
        <rect
          width={width}
          height={height}
          fill="none"
          stroke="none"
          opacity={0.04 + 0.02 * Math.sin(frame * 0.02)}
        />

        {/* Corner vignette */}
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="50%" stopColor="transparent" />
            <stop offset="100%" stopColor="#000508" stopOpacity="0.7" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#vignette)" />

        {/* Scanline subtle effect */}
        {Array.from({ length: 12 }, (_, i) => {
          const scanY = ((frame * 2 + i * (height / 12)) % height);
          return (
            <line
              key={`scan${i}`}
              x1={0}
              y1={scanY}
              x2={width}
              y2={scanY}
              stroke="#00aaff"
              strokeWidth={0.5 * scaleY}
              opacity={0.03}
            />
          );
        })}
      </svg>
    </div>
  );
};