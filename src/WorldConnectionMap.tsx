import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { id: 0, x: 0.5, y: 0.45, isHub: true, name: 'hub' },
  { id: 1, x: 0.15, y: 0.35, isHub: false, name: 'nyc' },
  { id: 2, x: 0.22, y: 0.55, isHub: false, name: 'bogota' },
  { id: 3, x: 0.28, y: 0.72, isHub: false, name: 'sao' },
  { id: 4, x: 0.42, y: 0.28, isHub: false, name: 'london' },
  { id: 5, x: 0.55, y: 0.25, isHub: false, name: 'moscow' },
  { id: 6, x: 0.48, y: 0.55, isHub: false, name: 'cairo' },
  { id: 7, x: 0.62, y: 0.32, isHub: false, name: 'dubai' },
  { id: 8, x: 0.72, y: 0.42, isHub: false, name: 'india' },
  { id: 9, x: 0.82, y: 0.38, isHub: false, name: 'beijing' },
  { id: 10, x: 0.88, y: 0.52, isHub: false, name: 'tokyo' },
  { id: 11, x: 0.78, y: 0.65, isHub: false, name: 'singapore' },
  { id: 12, x: 0.85, y: 0.75, isHub: false, name: 'sydney' },
  { id: 13, x: 0.38, y: 0.65, isHub: false, name: 'lagos' },
  { id: 14, x: 0.60, y: 0.68, isHub: false, name: 'nairobi' },
];

const PARTICLES = Array.from({ length: 200 }, (_, i) => ({
  cityIndex: i % (CITIES.length - 1) + 1,
  offset: (i * 37) % 100,
  speed: 0.4 + ((i * 13) % 60) / 100,
  size: 3 + (i % 5),
}));

const GRID_LINES_H = Array.from({ length: 18 }, (_, i) => i);
const GRID_LINES_V = Array.from({ length: 36 }, (_, i) => i);

const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 1337 + 200) % 2160,
  size: 1 + (i % 3),
  opacity: 0.2 + (i % 5) * 0.08,
}));

const LAND_PATHS = [
  // North America
  'M 380 280 L 520 220 L 680 200 L 820 240 L 880 320 L 860 400 L 780 460 L 700 480 L 620 520 L 560 580 L 500 560 L 440 500 L 380 440 L 340 360 Z',
  // South America
  'M 560 560 L 640 540 L 700 580 L 740 660 L 760 760 L 720 880 L 660 940 L 580 920 L 520 840 L 500 740 L 520 640 Z',
  // Europe
  'M 1420 180 L 1560 160 L 1680 200 L 1720 280 L 1680 340 L 1580 360 L 1480 340 L 1400 280 Z',
  // Africa
  'M 1480 420 L 1640 380 L 1800 420 L 1880 540 L 1900 680 L 1860 820 L 1780 940 L 1660 980 L 1520 940 L 1420 820 L 1380 680 L 1400 540 Z',
  // Asia
  'M 1720 160 L 2100 120 L 2480 160 L 2800 240 L 3000 360 L 3080 480 L 2960 540 L 2720 560 L 2480 520 L 2240 480 L 2000 420 L 1800 360 L 1720 280 Z',
  // Australia
  'M 2800 700 L 3000 660 L 3200 720 L 3280 840 L 3200 960 L 3000 1000 L 2800 940 L 2720 820 Z',
  // Greenland
  'M 860 80 L 1020 60 L 1140 120 L 1120 220 L 980 260 L 860 200 Z',
  // UK
  'M 1380 220 L 1440 200 L 1460 260 L 1420 300 L 1380 280 Z',
  // Japan
  'M 2980 280 L 3060 260 L 3120 320 L 3080 380 L 2980 360 Z',
];

export const WorldConnectionMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scaleW = width / 3840;
  const scaleH = height / 2160;

  const hub = CITIES[0];
  const hubX = hub.x * width;
  const hubY = hub.y * height;

  const pulseScale = 1 + 0.15 * Math.sin((frame / 30) * Math.PI * 2);
  const pulseOpacity = 0.5 + 0.5 * Math.sin((frame / 30) * Math.PI * 2);

  return (
    <div style={{ width, height, background: '#020810', overflow: 'hidden', opacity: globalOpacity }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="100%" stopColor="#020810" />
          </radialGradient>
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#4488ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#88bbff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2255cc" stopOpacity="0" />
          </radialGradient>
          <filter id="blur1">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="20" />
          </filter>
          <filter id="blur3">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width={width} height={height} fill="url(#bgGrad)" />

        {/* Stars */}
        {STARS.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star.x * scaleW}
            cy={star.y * scaleH}
            r={star.size * Math.min(scaleW, scaleH)}
            fill="white"
            opacity={star.opacity * (0.6 + 0.4 * Math.sin((frame / 60 + i * 0.3) * Math.PI * 2))}
          />
        ))}

        {/* Grid lines */}
        {GRID_LINES_H.map((i) => (
          <line
            key={`gh-${i}`}
            x1={0}
            y1={(i / 18) * height}
            x2={width}
            y2={(i / 18) * height}
            stroke="#1a3060"
            strokeWidth={1}
            opacity={0.15}
          />
        ))}
        {GRID_LINES_V.map((i) => (
          <line
            key={`gv-${i}`}
            x1={(i / 36) * width}
            y1={0}
            x2={(i / 36) * width}
            y2={height}
            stroke="#1a3060"
            strokeWidth={1}
            opacity={0.15}
          />
        ))}

        {/* Land masses */}
        <g transform={`scale(${scaleW}, ${scaleH})`} opacity={0.35}>
          {LAND_PATHS.map((d, i) => (
            <path
              key={`land-${i}`}
              d={d}
              fill="#1a3a6e"
              stroke="#2a5aaa"
              strokeWidth={2}
            />
          ))}
        </g>

        {/* Land glow overlay */}
        <g transform={`scale(${scaleW}, ${scaleH})`} opacity={0.12} filter="url(#blur2)">
          {LAND_PATHS.map((d, i) => (
            <path key={`land-glow-${i}`} d={d} fill="#3366cc" />
          ))}
        </g>

        {/* Connection lines from hub to cities */}
        {CITIES.filter(c => !c.isHub).map((city, idx) => {
          const cityX = city.x * width;
          const cityY = city.y * height;
          const lineProgress = interpolate(
            frame,
            [20 + idx * 8, 60 + idx * 8],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const dx = cityX - hubX;
          const dy = cityY - hubY;
          const endX = hubX + dx * lineProgress;
          const endY = hubY + dy * lineProgress;

          const mx = (hubX + cityX) / 2;
          const my = (hubY + cityY) / 2 - Math.abs(dx) * 0.15;

          const pulseT = ((frame / 90 + idx * 0.15) % 1);
          const pX = hubX + dx * pulseT;
          const pY = hubY + dy * pulseT;

          const dist = Math.sqrt(dx * dx + dy * dy);
          const lineOpacity = interpolate(lineProgress, [0, 0.1, 1], [0, 0.8, 0.5]);

          return (
            <g key={`conn-${city.id}`}>
              {/* Main line */}
              <path
                d={`M ${hubX} ${hubY} Q ${mx} ${my} ${endX} ${endY}`}
                fill="none"
                stroke="#4488ff"
                strokeWidth={2 * Math.min(scaleW, scaleH) * 4}
                opacity={lineOpacity * 0.3}
                strokeLinecap="round"
              />
              <path
                d={`M ${hubX} ${hubY} Q ${mx} ${my} ${endX} ${endY}`}
                fill="none"
                stroke="white"
                strokeWidth={1.5 * Math.min(scaleW, scaleH) * 4}
                opacity={lineOpacity * 0.7}
                strokeLinecap="round"
              />
              {/* Traveling dot */}
              {lineProgress >= 1 && (
                <circle
                  cx={pX}
                  cy={pY}
                  r={6 * Math.min(scaleW, scaleH) * 4}
                  fill="white"
                  opacity={0.9 * (1 - Math.abs(pulseT - 0.5) * 2) + 0.1}
                  filter="url(#blur3)"
                />
              )}
            </g>
          );
        })}

        {/* City nodes */}
        {CITIES.filter(c => !c.isHub).map((city, idx) => {
          const cityX = city.x * width;
          const cityY = city.y * height;
          const appear = interpolate(
            frame,
            [55 + idx * 8, 80 + idx * 8],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const r = 14 * Math.min(scaleW, scaleH) * 4;
          const cityPulse = 1 + 0.2 * Math.sin((frame / 45 + idx * 0.4) * Math.PI * 2);

          return (
            <g key={`city-${city.id}`} opacity={appear}>
              <circle cx={cityX} cy={cityY} r={r * 4 * cityPulse} fill="#4488ff" opacity={0.08} filter="url(#blur1)" />
              <circle cx={cityX} cy={cityY} r={r * 1.8} fill="#4488ff" opacity={0.25} />
              <circle cx={cityX} cy={cityY} r={r * 0.9} fill="white" opacity={0.9} />
              <circle cx={cityX} cy={cityY} r={r * 0.4} fill="#aaccff" opacity={1} />
            </g>
          );
        })}

        {/* Hub city - center */}
        <g>
          {/* Outer pulse rings */}
          {[1, 2, 3].map((ring) => {
            const ringPhase = ((frame / 90 + ring * 0.33) % 1);
            const ringR = interpolate(ringPhase, [0, 1], [30, 200]) * Math.min(scaleW, scaleH) * 4;
            const ringOpacity = interpolate(ringPhase, [0, 0.3, 1], [0.8, 0.4, 0]);
            return (
              <circle
                key={`ring-${ring}`}
                cx={hubX}
                cy={hubY}
                r={ringR}
                fill="none"
                stroke="white"
                strokeWidth={3 * Math.min(scaleW, scaleH) * 4}
                opacity={ringOpacity}
              />
            );
          })}

          {/* Hub glow */}
          <circle
            cx={hubX}
            cy={hubY}
            r={120 * Math.min(scaleW, scaleH) * 4 * pulseScale}
            fill="url(#hubGlow)"
            opacity={0.4}
            filter="url(#blur2)"
          />

          {/* Hub core */}
          <circle cx={hubX} cy={hubY} r={40 * Math.min(scaleW, scaleH) * 4} fill="#4488ff" opacity={0.3} />
          <circle cx={hubX} cy={hubY} r={22 * Math.min(scaleW, scaleH) * 4} fill="white" opacity={0.95} />
          <circle cx={hubX} cy={hubY} r={10 * Math.min(scaleW, scaleH) * 4} fill="#88bbff" opacity={1} />

          {/* Hub ring accent */}
          <circle
            cx={hubX}
            cy={hubY}
            r={28 * Math.min(scaleW, scaleH) * 4}
            fill="none"
            stroke="white"
            strokeWidth={2 * Math.min(scaleW, scaleH) * 4}
            opacity={pulseOpacity * 0.6}
          />
        </g>

        {/* Global ambient glow at hub */}
        <circle
          cx={hubX}
          cy={hubY}
          r={500 * Math.min(scaleW, scaleH) * 4}
          fill="#1133aa"
          opacity={0.06}
          filter="url(#blur2)"
        />

        {/* Particles moving along connections */}
        {PARTICLES.map((p, i) => {
          const city = CITIES[p.cityIndex];
          const cityX = city.x * width;
          const cityY = city.y * height;
          const dx = cityX - hubX;
          const dy = cityY - hubY;

          const lineProgress = interpolate(
            frame,
            [20 + (p.cityIndex - 1) * 8, 60 + (p.cityIndex - 1) * 8],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          if (lineProgress < 1) return null;

          const t = ((frame * p.speed / 120 + p.offset / 100) % 1);
          const px = hubX + dx * t;
          const py = hubY + dy * t;
          const fadeOpacity = 1 - Math.abs(t - 0.5) * 1.8;

          return (
            <circle
              key={`p-${i}`}
              cx={px}
              cy={py}
              r={4 * Math.min(scaleW, scaleH) * 4}
              fill="white"
              opacity={Math.max(0, fadeOpacity * 0.6)}
            />
          );
        })}

        {/* Vignette overlay */}
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="50%" stopColor="transparent" />
            <stop offset="100%" stopColor="#020810" stopOpacity="0.8" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#vignette)" />
      </svg>
    </div>
  );
};