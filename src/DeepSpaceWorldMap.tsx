import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { id: 0, name: 'NYC', x: 0.22, y: 0.38 },
  { id: 1, name: 'LON', x: 0.48, y: 0.28 },
  { id: 2, name: 'PAR', x: 0.49, y: 0.31 },
  { id: 3, name: 'BER', x: 0.52, y: 0.27 },
  { id: 4, name: 'MOW', x: 0.58, y: 0.24 },
  { id: 5, name: 'DXB', x: 0.62, y: 0.42 },
  { id: 6, name: 'MUM', x: 0.65, y: 0.45 },
  { id: 7, name: 'DEL', x: 0.67, y: 0.40 },
  { id: 8, name: 'SHA', x: 0.76, y: 0.37 },
  { id: 9, name: 'TOK', x: 0.82, y: 0.34 },
  { id: 10, name: 'SYD', x: 0.84, y: 0.70 },
  { id: 11, name: 'SIN', x: 0.76, y: 0.52 },
  { id: 12, name: 'LAX', x: 0.10, y: 0.37 },
  { id: 13, name: 'CHI', x: 0.18, y: 0.34 },
  { id: 14, name: 'MEX', x: 0.15, y: 0.45 },
  { id: 15, name: 'BOG', x: 0.22, y: 0.55 },
  { id: 16, name: 'SAO', x: 0.28, y: 0.65 },
  { id: 17, name: 'CAI', x: 0.55, y: 0.40 },
  { id: 18, name: 'NAI', x: 0.57, y: 0.52 },
  { id: 19, name: 'JHB', x: 0.56, y: 0.66 },
  { id: 20, name: 'IST', x: 0.56, y: 0.33 },
  { id: 21, name: 'KUL', x: 0.75, y: 0.53 },
  { id: 22, name: 'SEO', x: 0.80, y: 0.33 },
  { id: 23, name: 'BKK', x: 0.74, y: 0.47 },
];

const CONNECTIONS = [
  [0, 1], [0, 13], [0, 12], [1, 2], [1, 3], [2, 3], [3, 4],
  [4, 20], [20, 17], [17, 5], [5, 6], [5, 7], [7, 8], [8, 9],
  [9, 22], [22, 8], [8, 11], [11, 21], [21, 23], [23, 6],
  [9, 10], [10, 11], [1, 20], [0, 14], [14, 15], [15, 16],
  [16, 19], [19, 18], [18, 17], [17, 4], [4, 7], [6, 7],
  [12, 14], [13, 0], [1, 4], [11, 10], [0, 16],
];

const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: ((i * 2731 + 17) % 10000) / 10000,
  y: ((i * 1337 + 91) % 10000) / 10000,
  size: ((i * 113) % 3) + 0.5,
  brightness: ((i * 71) % 60) + 40,
  twinkleOffset: (i * 37) % 100,
}));

const SHOOTING_STARS = Array.from({ length: 6 }, (_, i) => ({
  startX: ((i * 1731) % 10000) / 10000,
  startY: ((i * 919) % 5000) / 10000,
  angle: 25 + (i * 7) % 20,
  length: 0.08 + (i % 4) * 0.02,
  period: 80 + (i * 43) % 120,
  delay: (i * 97) % 600,
}));

const NEBULA_CLOUDS = Array.from({ length: 8 }, (_, i) => ({
  cx: ((i * 1231) % 10000) / 10000,
  cy: ((i * 877) % 10000) / 10000,
  rx: 0.08 + (i % 5) * 0.04,
  ry: 0.05 + (i % 4) * 0.025,
  hue: [240, 260, 200, 280, 220, 250, 190, 270][i],
  opacity: 0.04 + (i % 3) * 0.02,
}));

export const DeepSpaceWorldMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const slowPulse = Math.sin(frame * 0.03) * 0.5 + 0.5;
  const slowPulse2 = Math.sin(frame * 0.02 + 1.2) * 0.5 + 0.5;

  return (
    <div style={{
      width,
      height,
      background: '#020408',
      position: 'relative',
      overflow: 'hidden',
      opacity: globalOpacity,
    }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0a0f1e" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>
          <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c8d8ff" stopOpacity="1" />
            <stop offset="100%" stopColor="#4080ff" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="bigGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="20" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {CITIES.map(city => (
            <radialGradient key={`grad-${city.id}`} id={`nodeGrad${city.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#a0c4ff" />
              <stop offset="100%" stopColor="#2060cc" stopOpacity="0" />
            </radialGradient>
          ))}
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6090e0" stopOpacity="0" />
            <stop offset="50%" stopColor="#a0c0ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6090e0" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width={width} height={height} fill="url(#bgGrad)" />

        {/* Nebula clouds */}
        {NEBULA_CLOUDS.map((cloud, i) => {
          const pulse = Math.sin(frame * 0.015 + i * 0.8) * 0.3 + 0.7;
          return (
            <ellipse
              key={`nebula-${i}`}
              cx={cloud.cx * width}
              cy={cloud.cy * height}
              rx={cloud.rx * width}
              ry={cloud.ry * height}
              fill={`hsla(${cloud.hue}, 70%, 40%, ${cloud.opacity * pulse})`}
              style={{ filter: 'blur(40px)' }}
            />
          );
        })}

        {/* Stars */}
        {STARS.map((star, i) => {
          const twinkle = Math.sin(frame * 0.05 + star.twinkleOffset * 0.3) * 0.4 + 0.6;
          return (
            <circle
              key={`star-${i}`}
              cx={star.x * width}
              cy={star.y * height}
              r={star.size * (width / 3840)}
              fill={`rgba(${star.brightness + 160}, ${star.brightness + 170}, ${star.brightness + 200}, ${twinkle})`}
            />
          );
        })}

        {/* Shooting stars */}
        {SHOOTING_STARS.map((ss, i) => {
          const localFrame = (frame - ss.delay + 600) % ss.period;
          if (localFrame > ss.period * 0.4) return null;
          const progress = localFrame / (ss.period * 0.4);
          const angleRad = (ss.angle * Math.PI) / 180;
          const x1 = (ss.startX + Math.cos(angleRad) * ss.length * progress) * width;
          const y1 = (ss.startY + Math.sin(angleRad) * ss.length * progress) * height;
          const trailLen = ss.length * 0.3;
          const x2 = (ss.startX + Math.cos(angleRad) * Math.max(0, ss.length * progress - trailLen)) * width;
          const y2 = (ss.startY + Math.sin(angleRad) * Math.max(0, ss.length * progress - trailLen)) * height;
          const opacity = interpolate(progress, [0, 0.1, 0.8, 1], [0, 1, 0.8, 0]);
          return (
            <line
              key={`ss-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(200,220,255,0.9)"
              strokeWidth={1.5 * (width / 3840)}
              strokeLinecap="round"
              opacity={opacity}
            />
          );
        })}

        {/* World map faint continents as blobs */}
        {/* North America */}
        <path
          d={`M ${0.05 * width} ${0.25 * height}
              C ${0.08 * width} ${0.20 * height}, ${0.20 * width} ${0.18 * height}, ${0.25 * width} ${0.25 * height}
              C ${0.28 * width} ${0.35 * height}, ${0.25 * width} ${0.42 * height}, ${0.22 * width} ${0.48 * height}
              C ${0.18 * width} ${0.55 * height}, ${0.14 * width} ${0.52 * height}, ${0.12 * width} ${0.48 * height}
              C ${0.08 * width} ${0.42 * height}, ${0.04 * width} ${0.35 * height}, ${0.05 * width} ${0.25 * height} Z`}
          fill="rgba(30,50,100,0.12)"
          stroke="rgba(60,100,180,0.08)"
          strokeWidth={1}
        />
        {/* Europe */}
        <path
          d={`M ${0.44 * width} ${0.22 * height}
              C ${0.47 * width} ${0.18 * height}, ${0.56 * width} ${0.18 * height}, ${0.58 * width} ${0.22 * height}
              C ${0.60 * width} ${0.28 * height}, ${0.58 * width} ${0.34 * height}, ${0.55 * width} ${0.36 * height}
              C ${0.50 * width} ${0.38 * height}, ${0.44 * width} ${0.35 * height}, ${0.43 * width} ${0.30 * height}
              C ${0.42 * width} ${0.26 * height}, ${0.43 * width} ${0.23 * height}, ${0.44 * width} ${0.22 * height} Z`}
          fill="rgba(30,50,100,0.12)"
          stroke="rgba(60,100,180,0.08)"
          strokeWidth={1}
        />
        {/* Africa */}
        <path
          d={`M ${0.46 * width} ${0.38 * height}
              C ${0.50 * width} ${0.36 * height}, ${0.58 * width} ${0.37 * height}, ${0.60 * width} ${0.43 * height}
              C ${0.62 * width} ${0.50 * height}, ${0.60 * width} ${0.60 * height}, ${0.57 * width} ${0.67 * height}
              C ${0.54 * width} ${0.73 * height}, ${0.50 * width} ${0.72 * height}, ${0.48 * width} ${0.65 * height}
              C ${0.44 * width} ${0.55 * height}, ${0.43 * width} ${0.45 * height}, ${0.46 * width} ${0.38 * height} Z`}
          fill="rgba(30,50,100,0.12)"
          stroke="rgba(60,100,180,0.08)"
          strokeWidth={1}
        />
        {/* Asia */}
        <path
          d={`M ${0.56 * width} ${0.18 * height}
              C ${0.65 * width} ${0.14 * height}, ${0.82 * width} ${0.16 * height}, ${0.88 * width} ${0.25 * height}
              C ${0.90 * width} ${0.35 * height}, ${0.85 * width} ${0.48 * height}, ${0.78 * width} ${0.55 * height}
              C ${0.72 * width} ${0.58 * height}, ${0.64 * width} ${0.55 * height}, ${0.60 * width} ${0.48 * height}
              C ${0.56 * width} ${0.42 * height}, ${0.54 * width} ${0.35 * height}, ${0.56 * width} ${0.28 * height}
              C ${0.57 * width} ${0.23 * height}, ${0.56 * width} ${0.18 * height}, ${0.56 * width} ${0.18 * height} Z`}
          fill="rgba(30,50,100,0.12)"
          stroke="rgba(60,100,180,0.08)"
          strokeWidth={1}
        />
        {/* Australia */}
        <path
          d={`M ${0.78 * width} ${0.63 * height}
              C ${0.82 * width} ${0.60 * height}, ${0.90 * width} ${0.62 * height}, ${0.91 * width} ${0.68 * height}
              C ${0.92 * width} ${0.74 * height}, ${0.88 * width} ${0.78 * height}, ${0.83 * width} ${0.78 * height}
              C ${0.78 * width} ${0.78 * height}, ${0.75 * width} ${0.73 * height}, ${0.76 * width} ${0.68 * height}
              C ${0.76 * width} ${0.65 * height}, ${0.77 * width} ${0.64 * height}, ${0.78 * width} ${0.63 * height} Z`}
          fill="rgba(30,50,100,0.12)"
          stroke="rgba(60,100,180,0.08)"
          strokeWidth={1}
        />
        {/* South America */}
        <path
          d={`M ${0.18 * width} ${0.48 * height}
              C ${0.22 * width} ${0.46 * height}, ${0.28 * width} ${0.48 * height}, ${0.30 * width} ${0.55 * height}
              C ${0.32 * width} ${0.62 * height}, ${0.30 * width} ${0.72 * height}, ${0.26 * width} ${0.78 * height}
              C ${0.22 * width} ${0.82 * height}, ${0.18 * width} ${0.80 * height}, ${0.16 * width} ${0.72 * height}
              C ${0.14 * width} ${0.62 * height}, ${0.14 * width} ${0.55 * height}, ${0.18 * width} ${0.48 * height} Z`}
          fill="rgba(30,50,100,0.12)"
          stroke="rgba(60,100,180,0.08)"
          strokeWidth={1}
        />

        {/* Latitude/Longitude grid lines */}
        {[0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85].map((y, i) => (
          <line
            key={`lat-${i}`}
            x1={0} y1={y * height}
            x2={width} y2={y * height}
            stroke="rgba(80,120,200,0.04)"
            strokeWidth={1}
          />
        ))}
        {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((x, i) => (
          <line
            key={`lon-${i}`}
            x1={x * width} y1={0}
            x2={x * width} y2={height}
            stroke="rgba(80,120,200,0.04)"
            strokeWidth={1}
          />
        ))}

        {/* Connection lines with animated data pulses */}
        {CONNECTIONS.map(([fromId, toId], connIdx) => {
          const from = CITIES[fromId];
          const to = CITIES[toId];
          const x1 = from.x * width;
          const y1 = from.y * height;
          const x2 = to.x * width;
          const y2 = to.y * height;

          const revealDelay = connIdx * 5;
          const revealProgress = interpolate(
            frame,
            [revealDelay, revealDelay + 60],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.15;

          const dx = x2 - x1;
          const dy = y2 - y1;

          const pulseSpeed = 0.008 + (connIdx % 5) * 0.002;
          const pulsePhase = (frame * pulseSpeed + connIdx * 0.4) % 1;

          const pulseX = x1 + dx * pulsePhase + (midX - (x1 + x2) / 2) * 4 * pulsePhase * (1 - pulsePhase);
          const pulseY = y1 + dy * pulsePhase + (midY - (y1 + y2) / 2) * 4 * pulsePhase * (1 - pulsePhase);

          const lineOpacity = 0.15 + 0.1 * Math.sin(frame * 0.02 + connIdx * 0.5);

          return (
            <g key={`conn-${connIdx}`} opacity={revealProgress}>
              <path
                d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                fill="none"
                stroke={`rgba(140,180,240,${lineOpacity})`}
                strokeWidth={1.2 * (width / 3840)}
              />
              <circle
                cx={pulseX}
                cy={pulseY}
                r={3 * (width / 3840)}
                fill="rgba(160,200,255,0.9)"
                filter="url(#glow)"
              />
            </g>
          );
        })}

        {/* City nodes */}
        {CITIES.map((city, i) => {
          const cx = city.x * width;
          const cy = city.y * height;

          const revealDelay = 20 + i * 8;
          const revealProgress = interpolate(
            frame,
            [revealDelay, revealDelay + 40],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const pulse = Math.sin(frame * 0.04 + i * 0.7) * 0.3 + 0.7;
          const ringPulse = Math.sin(frame * 0.05 + i * 0.5) * 0.5 + 0.5;
          const ringScale = 1 + ringPulse * 0.8;
          const ringOpacity = (1 - ringPulse) * 0.6;

          const baseSize = 5 * (width / 3840);
          const isHub = [0, 1, 4, 8, 9].includes(city.id);
          const nodeSize = isHub ? baseSize * 2 : baseSize;

          return (
            <g key={`city-${city.id}`} opacity={revealProgress}>
              {/* Outer expanding ring */}
              <circle
                cx={cx} cy={cy}
                r={nodeSize * 4 * ringScale}
                fill="none"
                stroke={`rgba(120,180,255,${ringOpacity * 0.5})`}
                strokeWidth={1 * (width / 3840)}
              />
              {/* Secondary ring */}
              <circle
                cx={cx} cy={cy}
                r={nodeSize * 6 * ringScale * 0.7}
                fill="none"
                stroke={`rgba(160,200,255,${ringOpacity * 0.3})`}
                strokeWidth={0.5 * (width / 3840)}
              />
              {/* Glow halo */}
              <circle
                cx={cx} cy={cy}
                r={nodeSize * 5}
                fill={`rgba(80,140,255,${0.08 * pulse})`}
                filter="url(#bigGlow)"
              />
              {/* Inner glow */}
              <circle
                cx={cx} cy={cy}
                r={nodeSize * 2.5}
                fill={`rgba(160,200,255,${0.3 * pulse})`}
                filter="url(#softGlow)"
              />
              {/* Core dot */}
              <circle
                cx={cx} cy={cy}
                r={nodeSize}
                fill="white"
                filter="url(#glow)"
              />
              {/* Crosshair */}
              <line
                x1={cx - nodeSize * 2.5} y1={cy}
                x2={cx + nodeSize * 2.5} y2={cy}
                stroke={`rgba(160,200,255,${0.4 * pulse})`}
                strokeWidth={0.5 * (width / 3840)}
              />
              <line
                x1={cx} y1={cy - nodeSize * 2.5}
                x2={cx} y2={cy + nodeSize * 2.5}
                stroke={`rgba(160,200,255,${0.4 * pulse})`}
                strokeWidth={0.5 * (width / 3840)}
              />
            </g>
          );
        })}

        {/* Ambient light overlay at center */}
        <radialGradient id="centerAmbient" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor={`rgba(20,40,100,${0.08 + slowPulse * 0.04})`} />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <rect width={width} height={height} fill="url(#centerAmbient)" />

        {/* Vignette */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="50%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,10,0.75)" />
        </radialGradient>
        <rect width={width} height={height} fill="url(#vignette)" />

        {/* Global pulse ring from center */}
        <circle
          cx={width * 0.5}
          cy={height * 0.45}
          r={interpolate(frame % 120, [0, 120], [0, width * 0.7])}
          fill="none"
          stroke={`rgba(80,120,200,${interpolate(frame % 120, [0, 60, 120], [0.12, 0.04, 0])})`}
          strokeWidth={2 * (width / 3840)}
        />
        <circle
          cx={width * 0.5}
          cy={height * 0.45}
          r={interpolate((frame + 60) % 120, [0, 120], [0, width * 0.7])}
          fill="none"
          stroke={`rgba(80,120,200,${interpolate((frame + 60) % 120, [0, 60, 120], [0.12, 0.04, 0])})`}
          strokeWidth={2 * (width / 3840)}
        />
      </svg>
    </div>
  );
};