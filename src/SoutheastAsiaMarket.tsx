import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { x: 0.52, y: 0.38, name: 'Bangkok', size: 14 },
  { x: 0.55, y: 0.52, name: 'Kuala Lumpur', size: 12 },
  { x: 0.57, y: 0.57, name: 'Singapore', size: 13 },
  { x: 0.61, y: 0.35, name: 'Ho Chi Minh', size: 12 },
  { x: 0.60, y: 0.22, name: 'Hanoi', size: 11 },
  { x: 0.48, y: 0.30, name: 'Yangon', size: 10 },
  { x: 0.56, y: 0.28, name: 'Phnom Penh', size: 10 },
  { x: 0.63, y: 0.48, name: 'Borneo', size: 9 },
  { x: 0.70, y: 0.42, name: 'Manila', size: 11 },
  { x: 0.65, y: 0.62, name: 'Jakarta', size: 13 },
  { x: 0.58, y: 0.65, name: 'Sumatra', size: 9 },
  { x: 0.72, y: 0.65, name: 'Bali', size: 8 },
  { x: 0.45, y: 0.25, name: 'Mandalay', size: 9 },
  { x: 0.53, y: 0.45, name: 'Pattaya', size: 8 },
  { x: 0.66, y: 0.55, name: 'Makassar', size: 8 },
];

const DOTS = Array.from({ length: 300 }, (_, i) => ({
  x: 0.35 + ((i * 1731 + 500) % 4200) / 10000,
  y: 0.15 + ((i * 1337 + 200) % 5500) / 10000,
  size: 2 + (i % 5),
  hue: 160 + (i % 80),
  delay: (i * 1.8) % 500,
  speed: 0.5 + (i % 7) * 0.15,
  orbitRadius: 10 + (i % 40),
  orbitAngleOffset: (i * 137) % 628,
  brightness: 0.5 + (i % 5) * 0.1,
  cityIndex: i % CITIES.length,
  clusterOffset: ((i * 97) % 60) - 30,
}));

const CONNECTIONS = Array.from({ length: 40 }, (_, i) => ({
  from: i % CITIES.length,
  to: (i * 3 + 2) % CITIES.length,
  delay: i * 12,
  duration: 80 + (i % 40),
}));

const RIPPLES = Array.from({ length: 60 }, (_, i) => ({
  cityIndex: i % CITIES.length,
  delay: i * 9,
  duration: 60 + (i % 30),
  maxRadius: 40 + (i % 60),
}));

export const SoutheastAsiaMarket: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const progress = frame / durationInFrames;

  const mapRegions = [
    { points: '460,80 520,60 580,90 610,150 590,220 560,260 530,250 490,200 450,160 430,120', color: '#1a3a2a' },
    { points: '530,250 560,260 590,220 630,240 650,300 640,360 600,380 570,350 540,310', color: '#1a3a2a' },
    { points: '560,350 600,380 640,360 680,390 700,440 680,490 640,510 600,480 570,430', color: '#1a3a2a' },
    { points: '580,430 640,510 700,530 750,510 760,560 720,600 670,610 620,580 580,520', color: '#1a3a2a' },
    { points: '430,190 490,200 530,250 510,300 470,320 430,300 400,250 410,210', color: '#152e20' },
    { points: '610,150 650,140 690,170 710,220 700,280 670,300 630,280 600,230', color: '#152e20' },
    { points: '690,270 730,260 770,290 790,350 760,410 720,420 690,380 680,320', color: '#152e20' },
  ];

  return (
    <div style={{ width, height, background: '#050d0a', position: 'relative', overflow: 'hidden', opacity }}>
      
      {/* Background grid */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGlow" cx="55%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#0a2518" stopOpacity="1" />
            <stop offset="100%" stopColor="#020806" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="centerGlow" cx="55%" cy="45%" r="35%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#bgGlow)" />
        <rect width={width} height={height} fill="url(#centerGlow)" />

        {/* Grid lines */}
        {Array.from({ length: 30 }, (_, i) => (
          <line
            key={`hgrid-${i}`}
            x1={0} y1={(i / 30) * height}
            x2={width} y2={(i / 30) * height}
            stroke="#0d2018" strokeWidth="1" opacity="0.4"
          />
        ))}
        {Array.from({ length: 50 }, (_, i) => (
          <line
            key={`vgrid-${i}`}
            x1={(i / 50) * width} y1={0}
            x2={(i / 50) * width} y2={height}
            stroke="#0d2018" strokeWidth="1" opacity="0.4"
          />
        ))}
      </svg>

      {/* Main map SVG */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 1000 800"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          {CITIES.map((city, i) => (
            <radialGradient key={`cityGlow-${i}`} id={`cityGlow-${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
            </radialGradient>
          ))}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Map regions */}
        {mapRegions.map((region, i) => {
          const pulseScale = 1 + Math.sin(frame * 0.02 + i) * 0.002;
          return (
            <polygon
              key={`region-${i}`}
              points={region.points}
              fill={region.color}
              stroke="#1f5035"
              strokeWidth="1.5"
              opacity="0.85"
              transform={`scale(${pulseScale})`}
            />
          );
        })}

        {/* Connection lines */}
        {CONNECTIONS.map((conn, i) => {
          const localFrame = frame - conn.delay;
          if (localFrame < 0) return null;
          const t = (localFrame % (conn.duration + 60)) / conn.duration;
          if (t > 1.2) return null;
          const dashProgress = interpolate(t, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
          const fadeConn = t > 1 ? interpolate(t, [1, 1.2], [1, 0]) : 1;

          const from = CITIES[conn.from];
          const to = CITIES[conn.to];
          const x1 = from.x * 1000;
          const y1 = from.y * 800;
          const x2 = to.x * 1000;
          const y2 = to.y * 800;
          const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

          return (
            <line
              key={`conn-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#00ff88"
              strokeWidth="0.8"
              opacity={0.4 * fadeConn}
              strokeDasharray={`${lineLength * dashProgress} ${lineLength}`}
              filter="url(#glow)"
            />
          );
        })}

        {/* Ripple effects */}
        {RIPPLES.map((ripple, i) => {
          const localFrame = frame - ripple.delay;
          if (localFrame < 0) return null;
          const t = (localFrame % ripple.duration) / ripple.duration;
          const city = CITIES[ripple.cityIndex];
          const r = t * ripple.maxRadius;
          const rippleOpacity = interpolate(t, [0, 0.5, 1], [0.8, 0.4, 0]);

          return (
            <circle
              key={`ripple-${i}`}
              cx={city.x * 1000}
              cy={city.y * 800}
              r={r}
              fill="none"
              stroke="#00ff88"
              strokeWidth="0.8"
              opacity={rippleOpacity}
            />
          );
        })}

        {/* Multiplying dots */}
        {DOTS.map((dot, i) => {
          const localFrame = frame - dot.delay;
          if (localFrame < 0) return null;

          const city = CITIES[dot.cityIndex];
          const spreadProgress = interpolate(localFrame, [0, 300], [0, 1], { extrapolateRight: 'clamp' });
          const dotFade = interpolate(localFrame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

          const baseX = city.x * 1000;
          const baseY = city.y * 800;
          const angle = (dot.orbitAngleOffset / 100) + localFrame * dot.speed * 0.01;
          const spread = spreadProgress * dot.orbitRadius;

          const dx = Math.cos(angle) * spread + dot.clusterOffset * spreadProgress;
          const dy = Math.sin(angle) * spread + dot.clusterOffset * 0.5 * spreadProgress;

          const pulse = 1 + Math.sin(localFrame * 0.08 + i) * 0.3;
          const dotSize = dot.size * pulse * 0.5;

          const hue = dot.hue + Math.sin(localFrame * 0.05) * 20;

          return (
            <circle
              key={`dot-${i}`}
              cx={baseX + dx}
              cy={baseY + dy}
              r={dotSize}
              fill={`hsl(${hue}, 100%, ${50 + dot.brightness * 20}%)`}
              opacity={dotFade * dot.brightness}
              filter="url(#glow)"
            />
          );
        })}

        {/* City nodes */}
        {CITIES.map((city, i) => {
          const cityReveal = interpolate(frame, [i * 15, i * 15 + 40], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const pulse = 1 + Math.sin(frame * 0.05 + i * 0.7) * 0.2;
          const outerPulse = 1 + Math.sin(frame * 0.04 + i * 0.5) * 0.4;

          return (
            <g key={`city-${i}`} opacity={cityReveal}>
              {/* Outer glow */}
              <circle
                cx={city.x * 1000}
                cy={city.y * 800}
                r={city.size * 3 * outerPulse}
                fill={`url(#cityGlow-${i})`}
                opacity="0.5"
              />
              {/* City dot */}
              <circle
                cx={city.x * 1000}
                cy={city.y * 800}
                r={city.size * 0.6 * pulse}
                fill="#00ff88"
                opacity="0.9"
                filter="url(#strongGlow)"
              />
              {/* Inner core */}
              <circle
                cx={city.x * 1000}
                cy={city.y * 800}
                r={city.size * 0.25}
                fill="white"
                opacity="0.95"
              />
            </g>
          );
        })}

        {/* Data flow particles on connections */}
        {CONNECTIONS.slice(0, 20).map((conn, i) => {
          const from = CITIES[conn.from];
          const to = CITIES[conn.to];
          const localFrame = frame - conn.delay;
          if (localFrame < 0) return null;

          const t = ((localFrame * 0.008) % 1);
          const px = from.x * 1000 + (to.x * 1000 - from.x * 1000) * t;
          const py = from.y * 800 + (to.y * 800 - from.y * 800) * t;
          const particleFade = Math.sin(t * Math.PI);

          return (
            <circle
              key={`particle-${i}`}
              cx={px}
              cy={py}
              r={3}
              fill="#ffffff"
              opacity={particleFade * 0.8}
              filter="url(#strongGlow)"
            />
          );
        })}

        {/* Growth burst rings */}
        {Array.from({ length: 8 }, (_, i) => {
          const burstDelay = i * 70;
          const localFrame = frame - burstDelay;
          if (localFrame < 0) return null;
          const t = (localFrame % 200) / 200;
          const city = CITIES[i % CITIES.length];
          const r = t * 150;
          const ringOpacity = interpolate(t, [0, 0.3, 1], [0, 0.3, 0]);

          return (
            <circle
              key={`burst-${i}`}
              cx={city.x * 1000}
              cy={city.y * 800}
              r={r}
              fill="none"
              stroke="#00ff44"
              strokeWidth="2"
              opacity={ringOpacity}
            />
          );
        })}
      </svg>

      {/* Overlay gradient vignette */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        background: 'radial-gradient(ellipse at 55% 45%, transparent 40%, rgba(2, 8, 5, 0.7) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Scanline effect */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, opacity: 0.03 }}>
        {Array.from({ length: 200 }, (_, i) => (
          <line
            key={`scan-${i}`}
            x1={0} y1={(i / 200) * height}
            x2={width} y2={(i / 200) * height}
            stroke="white" strokeWidth="1"
          />
        ))}
      </svg>

      {/* Corner decorations */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {[
          [0, 0, 1, 1],
          [1, 0, -1, 1],
          [0, 1, 1, -1],
          [1, 1, -1, -1],
        ].map(([cx, cy, sx, sy], i) => (
          <g key={`corner-${i}`} transform={`translate(${cx * width}, ${cy * height}) scale(${sx * width / 800}, ${sy * height / 600})`}>
            <polyline
              points="0,80 0,0 80,0"
              fill="none"
              stroke="#00ff88"
              strokeWidth="3"
              opacity={0.4 + Math.sin(frame * 0.03 + i) * 0.2}
            />
          </g>
        ))}
      </svg>
    </div>
  );
};