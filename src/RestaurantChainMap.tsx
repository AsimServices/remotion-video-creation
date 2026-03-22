import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const LOCATIONS = Array.from({ length: 60 }, (_, i) => ({
  x: 150 + ((i * 1731 + i * i * 47) % 3200),
  y: 300 + ((i * 1337 + i * i * 83) % 1400),
  size: 8 + (i % 5) * 4,
  pulseOffset: (i * 37) % 100,
  brightness: 0.6 + (i % 5) * 0.08,
  tier: i % 3,
}));

const STATE_LINES = [
  // Horizontal bands
  { x1: 120, y1: 480, x2: 3700, y2: 500 },
  { x1: 120, y1: 900, x2: 3700, y2: 920 },
  { x1: 120, y1: 1320, x2: 3700, y2: 1340 },
  // Vertical bands
  { x1: 650, y1: 280, x2: 660, y2: 1860 },
  { x1: 1200, y1: 280, x2: 1210, y2: 1860 },
  { x1: 1750, y1: 280, x2: 1760, y2: 1860 },
  { x1: 2300, y1: 280, x2: 2310, y2: 1860 },
  { x1: 2850, y1: 280, x2: 2860, y2: 1860 },
  { x1: 3400, y1: 280, x2: 3410, y2: 1860 },
  // Diagonal
  { x1: 900, y1: 280, x2: 1400, y2: 900 },
  { x1: 2000, y1: 900, x2: 2800, y2: 1800 },
  { x1: 400, y1: 1000, x2: 800, y2: 1800 },
  { x1: 2900, y1: 300, x2: 3600, y2: 1000 },
];

const ROADS = Array.from({ length: 30 }, (_, i) => ({
  x1: 100 + ((i * 2311) % 3600),
  y1: 200 + ((i * 1789) % 1600),
  x2: 300 + (((i + 5) * 2311) % 3400),
  y2: 400 + (((i + 3) * 1789) % 1400),
  opacity: 0.08 + (i % 4) * 0.02,
}));

const CONNECTION_PAIRS = Array.from({ length: 20 }, (_, i) => ({
  from: i % LOCATIONS.length,
  to: (i * 3 + 7) % LOCATIONS.length,
  delay: (i * 19) % 60,
}));

export const RestaurantChainMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const scaleX = width / 3840;
  const scaleY = height / 2160;

  return (
    <div
      style={{
        width,
        height,
        background: '#0a0805',
        overflow: 'hidden',
        opacity,
        position: 'relative',
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 3840 2160`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#1a1208" />
            <stop offset="100%" stopColor="#050402" />
          </radialGradient>
          <radialGradient id="markerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffb347" stopOpacity="1" />
            <stop offset="100%" stopColor="#ff6b00" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="25" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="mapGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="3840" height="2160" fill="url(#bgGlow)" />

        {/* Subtle grid */}
        {Array.from({ length: 40 }, (_, i) => (
          <line
            key={`hgrid-${i}`}
            x1="0" y1={i * 54} x2="3840" y2={i * 54}
            stroke="#1a1408" strokeWidth="1" opacity="0.5"
          />
        ))}
        {Array.from({ length: 72 }, (_, i) => (
          <line
            key={`vgrid-${i}`}
            x1={i * 54} y1="0" x2={i * 54} y2="2160"
            stroke="#1a1408" strokeWidth="1" opacity="0.5"
          />
        ))}

        {/* Map outline - simplified US shape */}
        <path
          d="M 400,400 L 500,320 L 700,280 L 1100,260 L 1600,250 L 2000,240 L 2400,260 L 2800,280 L 3100,320 L 3300,380 L 3450,420 L 3500,500 L 3520,600 L 3500,700 L 3480,800 L 3460,900 L 3440,1000 L 3420,1100 L 3400,1200 L 3380,1300 L 3350,1400 L 3300,1500 L 3200,1600 L 3000,1680 L 2700,1750 L 2400,1780 L 2100,1800 L 1800,1810 L 1600,1820 L 1400,1810 L 1200,1780 L 1000,1720 L 800,1640 L 600,1560 L 450,1480 L 350,1400 L 280,1300 L 250,1200 L 240,1100 L 260,1000 L 300,900 L 340,800 L 370,700 L 390,600 Z"
          fill="#0f0c07"
          stroke="#3d2e0f"
          strokeWidth="3"
          filter="url(#mapGlow)"
        />

        {/* Interior region lines */}
        {STATE_LINES.map((line, i) => (
          <line
            key={`state-${i}`}
            x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
            stroke="#2a1f0a"
            strokeWidth="1.5"
            opacity="0.6"
          />
        ))}

        {/* Road network */}
        {ROADS.map((road, i) => (
          <line
            key={`road-${i}`}
            x1={road.x1} y1={road.y1} x2={road.x2} y2={road.y2}
            stroke="#3d2e0f"
            strokeWidth="1"
            opacity={road.opacity}
          />
        ))}

        {/* Connection lines between locations */}
        {CONNECTION_PAIRS.map((pair, i) => {
          const loc1 = LOCATIONS[pair.from];
          const loc2 = LOCATIONS[pair.to];
          const progress = interpolate(
            (frame + pair.delay * 5) % 300,
            [0, 150, 300],
            [0, 1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          return (
            <line
              key={`conn-${i}`}
              x1={loc1.x} y1={loc1.y}
              x2={loc2.x} y2={loc2.y}
              stroke="#ff8c00"
              strokeWidth="1.5"
              opacity={progress * 0.25}
              strokeDasharray="8 12"
            />
          );
        })}

        {/* Location markers */}
        {LOCATIONS.map((loc, i) => {
          const pulsePhase = (frame * 0.05 + loc.pulseOffset * 0.1) % (Math.PI * 2);
          const pulse = Math.sin(pulsePhase) * 0.5 + 0.5;

          const revealDelay = i * 8;
          const revealProgress = interpolate(frame, [revealDelay, revealDelay + 40], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const outerRing = loc.size * (2.5 + pulse * 2.0);
          const innerRing = loc.size * (1.5 + pulse * 0.8);
          const coreSize = loc.size * (0.8 + pulse * 0.3);

          const tierColors = [
            { core: '#ffcc66', ring: '#ffaa00', outer: '#ff8800' },
            { core: '#ff9944', ring: '#ff6600', outer: '#cc4400' },
            { core: '#ffdd88', ring: '#ffbb44', outer: '#ff9900' },
          ];
          const colors = tierColors[loc.tier];

          return (
            <g key={`loc-${i}`} opacity={revealProgress}>
              {/* Outer glow ring */}
              <circle
                cx={loc.x} cy={loc.y}
                r={outerRing}
                fill="none"
                stroke={colors.outer}
                strokeWidth="1.5"
                opacity={0.15 + pulse * 0.15}
                filter="url(#softGlow)"
              />
              {/* Mid ring */}
              <circle
                cx={loc.x} cy={loc.y}
                r={innerRing}
                fill="none"
                stroke={colors.ring}
                strokeWidth="2"
                opacity={0.35 + pulse * 0.25}
                filter="url(#glow)"
              />
              {/* Glow fill */}
              <circle
                cx={loc.x} cy={loc.y}
                r={innerRing * 0.8}
                fill={colors.outer}
                opacity={0.08 + pulse * 0.08}
              />
              {/* Core dot */}
              <circle
                cx={loc.x} cy={loc.y}
                r={coreSize}
                fill={colors.core}
                opacity={0.8 + pulse * 0.2}
                filter="url(#glow)"
              />
              {/* Bright center */}
              <circle
                cx={loc.x} cy={loc.y}
                r={coreSize * 0.4}
                fill="#ffffff"
                opacity={0.6 + pulse * 0.3}
              />
            </g>
          );
        })}

        {/* Ambient warm glow overlay */}
        {LOCATIONS.filter((_, i) => i % 5 === 0).map((loc, i) => {
          const pulsePhase = (frame * 0.03 + loc.pulseOffset * 0.08) % (Math.PI * 2);
          const pulse = Math.sin(pulsePhase) * 0.5 + 0.5;
          return (
            <circle
              key={`ambient-${i}`}
              cx={loc.x} cy={loc.y}
              r={200 + pulse * 80}
              fill="#ff8800"
              opacity={0.012 + pulse * 0.008}
            />
          );
        })}

        {/* Scanning line */}
        {(() => {
          const scanX = interpolate(frame % 400, [0, 400], [100, 3740]);
          return (
            <line
              x1={scanX} y1="200"
              x2={scanX} y2="1900"
              stroke="#ffaa44"
              strokeWidth="2"
              opacity={interpolate(frame % 400, [0, 30, 370, 400], [0, 0.4, 0.4, 0])}
            />
          );
        })()}

        {/* Vignette overlay */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stopColor="transparent" />
          <stop offset="100%" stopColor="#050402" />
        </radialGradient>
        <rect width="3840" height="2160" fill="url(#vignette)" />
      </svg>
    </div>
  );
};