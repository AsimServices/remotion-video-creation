import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { x: 0.72, y: 0.28, name: 'Beijing', size: 22, delay: 0 },
  { x: 0.76, y: 0.38, name: 'Shanghai', size: 20, delay: 8 },
  { x: 0.74, y: 0.45, name: 'Hangzhou', size: 14, delay: 16 },
  { x: 0.70, y: 0.44, name: 'Wuhan', size: 15, delay: 24 },
  { x: 0.66, y: 0.52, name: 'Chongqing', size: 16, delay: 32 },
  { x: 0.75, y: 0.52, name: 'Fuzhou', size: 13, delay: 40 },
  { x: 0.73, y: 0.56, name: 'Shenzhen', size: 18, delay: 48 },
  { x: 0.72, y: 0.55, name: 'Guangzhou', size: 17, delay: 56 },
  { x: 0.60, y: 0.38, name: 'Xian', size: 14, delay: 64 },
  { x: 0.55, y: 0.28, name: 'Urumqi', size: 11, delay: 72 },
  { x: 0.65, y: 0.25, name: 'Hohhot', size: 10, delay: 80 },
  { x: 0.78, y: 0.25, name: 'Shenyang', size: 12, delay: 88 },
  { x: 0.80, y: 0.30, name: 'Dalian', size: 11, delay: 96 },
  { x: 0.64, y: 0.42, name: 'Chengdu', size: 15, delay: 20 },
  { x: 0.58, y: 0.48, name: 'Kunming', size: 12, delay: 36 },
  { x: 0.68, y: 0.32, name: 'Taiyuan', size: 10, delay: 52 },
  { x: 0.76, y: 0.34, name: 'Jinan', size: 12, delay: 60 },
  { x: 0.79, y: 0.37, name: 'Nanjing', size: 13, delay: 68 },
  { x: 0.50, y: 0.42, name: 'Lhasa', size: 9, delay: 76 },
];

const CONNECTIONS = [
  [0, 1], [1, 5], [1, 6], [1, 7], [0, 2], [0, 8], [0, 11],
  [2, 6], [3, 4], [3, 1], [4, 14], [4, 8], [8, 0], [11, 12],
  [13, 4], [13, 3], [15, 0], [16, 1], [17, 1], [6, 7], [9, 10],
];

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 1731 + 200) % 100,
  y: (i * 1337 + 100) % 100,
  size: ((i * 7) % 4) + 1,
  speed: ((i * 13) % 30) + 10,
  offset: (i * 17) % 100,
}));

const GRID_LINES_H = Array.from({ length: 20 }, (_, i) => i);
const GRID_LINES_V = Array.from({ length: 30 }, (_, i) => i);

// Simplified China border path (normalized 0-1 coordinates)
const CHINA_REGIONS = [
  // Main body rough outline as a polygon
  '0.52,0.18 0.58,0.16 0.65,0.14 0.72,0.16 0.78,0.18 0.82,0.22 0.85,0.28 0.84,0.34 0.82,0.38 0.81,0.42 0.80,0.46 0.78,0.50 0.77,0.55 0.76,0.58 0.74,0.60 0.71,0.61 0.68,0.60 0.65,0.62 0.62,0.63 0.58,0.60 0.56,0.56 0.54,0.52 0.52,0.48 0.50,0.52 0.48,0.56 0.46,0.54 0.44,0.50 0.44,0.44 0.46,0.38 0.48,0.32 0.48,0.26 0.50,0.22',
];

export const ChinaMarketPresence: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const t = frame / durationInFrames;
  const slowT = frame / 30;

  // Map region polygon points scaled to actual dimensions
  const regionPoints = CHINA_REGIONS[0].split(' ').map(p => {
    const [px, py] = p.split(',').map(Number);
    return `${px * width},${py * height}`;
  }).join(' ');

  return (
    <div style={{ width, height, background: '#050810', overflow: 'hidden', opacity: globalOpacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {/* Red glow filter */}
          <filter id="redGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="20" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <radialGradient id="mapGrad" cx="65%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#1a0a0a" />
            <stop offset="60%" stopColor="#0a0510" />
            <stop offset="100%" stopColor="#050810" />
          </radialGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#cc0000" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#cc0000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="connectionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cc0000" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ffd700" stopOpacity="1" />
            <stop offset="100%" stopColor="#cc0000" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Background gradient */}
        <rect width={width} height={height} fill="url(#mapGrad)" />

        {/* Grid lines */}
        {GRID_LINES_H.map(i => {
          const y = (i / 20) * height;
          const opacity = interpolate(
            frame,
            [50 + i * 3, 80 + i * 3],
            [0, 0.06],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          return (
            <line
              key={`h${i}`}
              x1={0} y1={y} x2={width} y2={y}
              stroke="#4488aa"
              strokeWidth={1}
              opacity={opacity}
            />
          );
        })}
        {GRID_LINES_V.map(i => {
          const x = (i / 30) * width;
          const opacity = interpolate(
            frame,
            [50 + i * 2, 80 + i * 2],
            [0, 0.06],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          return (
            <line
              key={`v${i}`}
              x1={x} y1={0} x2={x} y2={height}
              stroke="#4488aa"
              strokeWidth={1}
              opacity={opacity}
            />
          );
        })}

        {/* China map glow background */}
        <ellipse
          cx={width * 0.65}
          cy={height * 0.40}
          rx={width * 0.22}
          ry={height * 0.28}
          fill="url(#centerGlow)"
          opacity={interpolate(frame, [80, 130], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
        />

        {/* China region outline */}
        <polygon
          points={regionPoints}
          fill="none"
          stroke="#cc2200"
          strokeWidth={3}
          opacity={interpolate(frame, [60, 120], [0, 0.4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
          filter="url(#redGlow)"
        />
        <polygon
          points={regionPoints}
          fill="#cc220008"
          stroke="none"
          opacity={interpolate(frame, [80, 140], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
        />

        {/* Connection lines between cities */}
        {CONNECTIONS.map(([fromIdx, toIdx], i) => {
          const from = CITIES[fromIdx];
          const to = CITIES[toIdx];
          const lineDelay = 120 + i * 8;
          const lineOpacity = interpolate(
            frame,
            [lineDelay, lineDelay + 30],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const pulseT = ((frame - lineDelay) / 40) % 1;
          const pulseOpacity = lineOpacity * (0.3 + 0.3 * Math.sin(slowT * 2 + i));

          const x1 = from.x * width;
          const y1 = from.y * height;
          const x2 = to.x * width;
          const y2 = to.y * height;

          // Animated dash offset for flowing lines
          const totalLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          const dashOffset = -(frame * 3 + i * 50) % (totalLength * 2);

          return (
            <g key={`conn${i}`}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#cc0000"
                strokeWidth={1.5}
                strokeOpacity={pulseOpacity * 0.5}
                strokeDasharray={`${totalLength * 0.3} ${totalLength * 0.7}`}
                strokeDashoffset={dashOffset}
              />
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#ffd700"
                strokeWidth={0.8}
                strokeOpacity={pulseOpacity * 0.4}
                strokeDasharray={`${totalLength * 0.15} ${totalLength * 0.85}`}
                strokeDashoffset={-dashOffset * 1.5}
              />
            </g>
          );
        })}

        {/* City markers */}
        {CITIES.map((city, i) => {
          const cx = city.x * width;
          const cy = city.y * height;
          const appearFrame = 80 + city.delay;
          const markerOpacity = interpolate(
            frame,
            [appearFrame, appearFrame + 30],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          // Pulse animation
          const pulseScale = 1 + 0.4 * Math.sin(slowT * 1.5 + i * 0.8);
          const pulseOpacity = 0.3 + 0.3 * Math.sin(slowT * 1.5 + i * 0.8);
          const innerPulse = 1 + 0.2 * Math.sin(slowT * 2 + i);

          // Alternate between red and gold for visual variety
          const isGold = i % 3 === 0;
          const primaryColor = isGold ? '#ffd700' : '#ff1a1a';
          const secondaryColor = isGold ? '#ff8c00' : '#cc0000';

          const baseSize = (city.size / 22) * (width / 100);

          return (
            <g key={`city${i}`} opacity={markerOpacity}>
              {/* Outer pulse ring */}
              <circle
                cx={cx} cy={cy}
                r={baseSize * 2.5 * pulseScale}
                fill="none"
                stroke={primaryColor}
                strokeWidth={1.5}
                opacity={pulseOpacity * 0.6}
              />
              {/* Mid ring */}
              <circle
                cx={cx} cy={cy}
                r={baseSize * 1.8 * innerPulse}
                fill="none"
                stroke={secondaryColor}
                strokeWidth={2}
                opacity={0.5}
                filter="url(#redGlow)"
              />
              {/* Core dot */}
              <circle
                cx={cx} cy={cy}
                r={baseSize * 0.9}
                fill={primaryColor}
                opacity={0.95}
                filter="url(#goldGlow)"
              />
              {/* Center bright spot */}
              <circle
                cx={cx} cy={cy}
                r={baseSize * 0.4}
                fill="white"
                opacity={0.8}
              />
              {/* Crosshair lines */}
              <line
                x1={cx - baseSize * 3} y1={cy}
                x2={cx + baseSize * 3} y2={cy}
                stroke={primaryColor}
                strokeWidth={1}
                opacity={0.4}
              />
              <line
                x1={cx} y1={cy - baseSize * 3}
                x2={cx} y2={cy + baseSize * 3}
                stroke={primaryColor}
                strokeWidth={1}
                opacity={0.4}
              />
            </g>
          );
        })}

        {/* Floating particles */}
        {PARTICLES.map((p, i) => {
          const px = (p.x / 100) * width;
          const py = ((p.y / 100 * height) + ((frame * (p.speed / 10)) % height) - height / 2 + height) % height;
          const particleOpacity = 0.2 + 0.3 * Math.sin(slowT * 2 + p.offset);
          const isRed = i % 2 === 0;

          return (
            <circle
              key={`p${i}`}
              cx={px}
              cy={py}
              r={(p.size / 4) * (width / 1920)}
              fill={isRed ? '#ff2200' : '#ffd700'}
              opacity={particleOpacity * interpolate(frame, [0, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
            />
          );
        })}

        {/* Sweeping radar ring from center */}
        {[0, 1, 2].map(ringIdx => {
          const ringFrame = frame - ringIdx * 60;
          const ringProgress = (ringFrame % 180) / 180;
          const ringRadius = ringProgress * width * 0.35;
          const ringOpacity = (1 - ringProgress) * 0.25;

          return (
            <circle
              key={`ring${ringIdx}`}
              cx={width * 0.65}
              cy={height * 0.40}
              r={ringRadius}
              fill="none"
              stroke="#cc0000"
              strokeWidth={3}
              opacity={ringOpacity}
            />
          );
        })}

        {/* Corner decorative elements */}
        {[
          { x: 0.02, y: 0.02 },
          { x: 0.98, y: 0.02 },
          { x: 0.02, y: 0.98 },
          { x: 0.98, y: 0.98 },
        ].map((corner, i) => {
          const cx = corner.x * width;
          const cy = corner.y * height;
          const size = width * 0.03;
          const cornerOpacity = interpolate(frame, [20 + i * 10, 60 + i * 10], [0, 0.7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const flipX = corner.x > 0.5 ? -1 : 1;
          const flipY = corner.y > 0.5 ? -1 : 1;

          return (
            <g key={`corner${i}`} opacity={cornerOpacity}>
              <line x1={cx} y1={cy} x2={cx + flipX * size} y2={cy} stroke="#ffd700" strokeWidth={3} />
              <line x1={cx} y1={cy} x2={cx} y2={cy + flipY * size} stroke="#ffd700" strokeWidth={3} />
              <circle cx={cx} cy={cy} r={5} fill="#ffd700" opacity={0.8} />
            </g>
          );
        })}

        {/* Central decorative ring */}
        <circle
          cx={width * 0.65}
          cy={height * 0.40}
          r={width * 0.005}
          fill="#ffd700"
          opacity={interpolate(frame, [100, 150], [0, 0.9], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
          filter="url(#goldGlow)"
        />

        {/* Horizontal scan line */}
        {(() => {
          const scanY = ((frame * 2.5) % height);
          const scanOpacity = 0.15;
          return (
            <line
              x1={0} y1={scanY}
              x2={width} y2={scanY}
              stroke="#cc0000"
              strokeWidth={2}
              opacity={scanOpacity}
            />
          );
        })()}

        {/* Data bars on the right side */}
        {Array.from({ length: 8 }, (_, i) => {
          const barY = height * (0.1 + i * 0.1);
          const barWidth = interpolate(
            frame,
            [150 + i * 20, 200 + i * 20],
            [0, width * (0.05 + (i * 1731 % 100) / 1000)],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const barOpacity = 0.5 + 0.2 * Math.sin(slowT + i);
          const isGold = i % 2 === 0;

          return (
            <g key={`bar${i}`}>
              <rect
                x={width * 0.88}
                y={barY}
                width={barWidth}
                height={height * 0.015}
                fill={isGold ? '#ffd700' : '#cc0000'}
                opacity={barOpacity}
                rx={3}
              />
              <rect
                x={width * 0.88}
                y={barY}
                width={4}
                height={height * 0.015}
                fill="white"
                opacity={0.6}
                rx={2}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};