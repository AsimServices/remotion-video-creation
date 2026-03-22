import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { x: 0.22, y: 0.38, name: 'New York' },
  { x: 0.12, y: 0.35, name: 'Los Angeles' },
  { x: 0.28, y: 0.32, name: 'London' },
  { x: 0.31, y: 0.30, name: 'Paris' },
  { x: 0.38, y: 0.28, name: 'Moscow' },
  { x: 0.52, y: 0.40, name: 'Dubai' },
  { x: 0.62, y: 0.38, name: 'Mumbai' },
  { x: 0.72, y: 0.32, name: 'Beijing' },
  { x: 0.78, y: 0.38, name: 'Tokyo' },
  { x: 0.75, y: 0.55, name: 'Singapore' },
  { x: 0.80, y: 0.68, name: 'Sydney' },
  { x: 0.18, y: 0.55, name: 'Sao Paulo' },
  { x: 0.48, y: 0.50, name: 'Nairobi' },
  { x: 0.35, y: 0.35, name: 'Cairo' },
  { x: 0.65, y: 0.28, name: 'Seoul' },
];

const CONNECTIONS = [
  [0, 1], [0, 2], [0, 11], [1, 11], [2, 3], [2, 4], [2, 13],
  [3, 4], [4, 7], [5, 6], [5, 13], [6, 7], [7, 8], [7, 9],
  [8, 14], [9, 10], [9, 7], [11, 12], [12, 13], [13, 5],
  [14, 7], [4, 5], [6, 9], [0, 3], [10, 9],
];

const RIPPLE_COUNTS = 4;
const RIPPLE_OFFSETS = Array.from({ length: CITIES.length }, (_, i) => (i * 37) % 60);
const STARS = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731 + 300) % 3840,
  y: (i * 1337 + 100) % 2160,
  r: ((i * 73) % 3) + 1,
  opacity: ((i * 53) % 60 + 40) / 100,
}));

const LAND_PATHS = [
  // North America simplified
  'M 280 280 L 380 240 L 500 230 L 560 260 L 600 310 L 580 380 L 520 420 L 460 450 L 400 480 L 340 500 L 300 460 L 260 420 L 240 370 L 250 320 Z',
  // South America simplified
  'M 380 520 L 440 500 L 500 530 L 520 580 L 510 650 L 480 720 L 440 760 L 400 740 L 370 680 L 360 610 L 360 560 Z',
  // Europe simplified
  'M 900 180 L 980 170 L 1060 180 L 1100 220 L 1080 270 L 1020 290 L 960 280 L 920 250 L 890 220 Z',
  // Africa simplified
  'M 960 340 L 1040 320 L 1100 340 L 1140 400 L 1150 480 L 1130 560 L 1080 620 L 1020 640 L 960 620 L 920 560 L 900 480 L 910 400 Z',
  // Asia simplified
  'M 1120 160 L 1300 140 L 1500 160 L 1680 200 L 1760 280 L 1720 360 L 1600 380 L 1480 360 L 1380 320 L 1280 300 L 1180 280 L 1100 240 Z',
  // Australia simplified
  'M 1680 580 L 1780 560 L 1860 590 L 1880 660 L 1840 720 L 1760 740 L 1680 710 L 1640 650 L 1650 600 Z',
  // Greenland
  'M 600 140 L 680 120 L 740 140 L 750 190 L 700 210 L 640 200 L 600 175 Z',
];

export const WorldMapRipple: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const scaleX = width / 2160;
  const scaleY = height / 2160;

  const pulse = Math.sin(frame * 0.05) * 0.5 + 0.5;

  return (
    <div style={{ width, height, background: '#020510', position: 'relative', overflow: 'hidden', opacity: globalOpacity }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Stars background */}
        {STARS.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star.x * (width / 3840)}
            cy={star.y * (height / 2160)}
            r={star.r * scaleX}
            fill="white"
            opacity={star.opacity * (0.6 + Math.sin(frame * 0.02 + i) * 0.4)}
          />
        ))}

        {/* Glowing grid lines */}
        {Array.from({ length: 19 }, (_, i) => (
          <line
            key={`vline-${i}`}
            x1={width * (i / 18)}
            y1={0}
            x2={width * (i / 18)}
            y2={height}
            stroke="#0a2040"
            strokeWidth={1}
            opacity={0.4}
          />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line
            key={`hline-${i}`}
            x1={0}
            y1={height * (i / 9)}
            x2={width}
            y2={height * (i / 9)}
            stroke="#0a2040"
            strokeWidth={1}
            opacity={0.4}
          />
        ))}

        {/* Land masses */}
        <g transform={`translate(${width * 0.05}, ${height * 0.08}) scale(${scaleX * 1.6}, ${scaleY * 1.6})`}>
          {LAND_PATHS.map((d, i) => (
            <path
              key={`land-${i}`}
              d={d}
              fill={`rgba(10, 40, 80, ${0.7 + pulse * 0.1})`}
              stroke="#0d4a8a"
              strokeWidth={1.5}
              opacity={0.85}
            />
          ))}
        </g>

        {/* Connection lines */}
        {CONNECTIONS.map(([a, b], i) => {
          const cityA = CITIES[a];
          const cityB = CITIES[b];
          const x1 = cityA.x * width;
          const y1 = cityA.y * height;
          const x2 = cityB.x * width;
          const y2 = cityB.y * height;

          const flowProgress = ((frame * 0.8 + i * 40) % 160) / 160;
          const glowOpacity = 0.3 + pulse * 0.2;

          return (
            <g key={`conn-${i}`}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#0066cc"
                strokeWidth={1.5 * scaleX}
                opacity={glowOpacity}
              />
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#00aaff"
                strokeWidth={0.5 * scaleX}
                opacity={0.15}
              />
              {/* Traveling dot */}
              <circle
                cx={x1 + (x2 - x1) * flowProgress}
                cy={y1 + (y2 - y1) * flowProgress}
                r={4 * scaleX}
                fill="#00eeff"
                opacity={0.9}
              />
            </g>
          );
        })}

        {/* City ripples */}
        {CITIES.map((city, ci) => {
          const cx = city.x * width;
          const cy = city.y * height;
          const offset = RIPPLE_OFFSETS[ci];

          return (
            <g key={`city-${ci}`}>
              {Array.from({ length: RIPPLE_COUNTS }, (_, ri) => {
                const rippleFrame = (frame + offset + ri * 20) % 80;
                const progress = rippleFrame / 80;
                const radius = progress * 100 * scaleX;
                const opacity = interpolate(progress, [0, 0.3, 1], [0.9, 0.5, 0]);

                return (
                  <circle
                    key={`ripple-${ci}-${ri}`}
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="none"
                    stroke="#00ccff"
                    strokeWidth={2 * scaleX * (1 - progress)}
                    opacity={opacity}
                  />
                );
              })}

              {/* City dot glow */}
              <circle
                cx={cx}
                cy={cy}
                r={18 * scaleX}
                fill="#002244"
                opacity={0.6}
              />
              <circle
                cx={cx}
                cy={cy}
                r={12 * scaleX}
                fill="#004488"
                opacity={0.7 + pulse * 0.2}
              />
              <circle
                cx={cx}
                cy={cy}
                r={6 * scaleX}
                fill="#00aaff"
                opacity={0.9 + pulse * 0.1}
              />
              <circle
                cx={cx}
                cy={cy}
                r={3 * scaleX}
                fill="#ffffff"
                opacity={1}
              />
            </g>
          );
        })}

        {/* Global atmospheric overlay */}
        <radialGradient id="atmo" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="#000510" stopOpacity={0.6} />
        </radialGradient>
        <rect x={0} y={0} width={width} height={height} fill="url(#atmo)" />

        {/* Scanline overlay */}
        {Array.from({ length: 40 }, (_, i) => (
          <line
            key={`scan-${i}`}
            x1={0}
            y1={height * (i / 40)}
            x2={width}
            y2={height * (i / 40)}
            stroke="#001833"
            strokeWidth={2}
            opacity={0.15}
          />
        ))}

        {/* Central glow */}
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="40%">
          <stop offset="0%" stopColor="#003366" stopOpacity={0.15 + pulse * 0.05} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <rect x={0} y={0} width={width} height={height} fill="url(#centerGlow)" />
      </svg>
    </div>
  );
};