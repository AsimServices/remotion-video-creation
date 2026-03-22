import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { id: 0, name: 'NYC', x: 0.22, y: 0.38, size: 18 },
  { id: 1, name: 'LA', x: 0.12, y: 0.42, size: 15 },
  { id: 2, name: 'London', x: 0.46, y: 0.28, size: 17 },
  { id: 3, name: 'Paris', x: 0.48, y: 0.30, size: 14 },
  { id: 4, name: 'Berlin', x: 0.51, y: 0.27, size: 13 },
  { id: 5, name: 'Dubai', x: 0.60, y: 0.42, size: 14 },
  { id: 6, name: 'Mumbai', x: 0.64, y: 0.46, size: 15 },
  { id: 7, name: 'Singapore', x: 0.72, y: 0.54, size: 14 },
  { id: 8, name: 'Tokyo', x: 0.80, y: 0.35, size: 16 },
  { id: 9, name: 'Sydney', x: 0.82, y: 0.70, size: 13 },
  { id: 10, name: 'SaoPaulo', x: 0.28, y: 0.65, size: 14 },
  { id: 11, name: 'Toronto', x: 0.21, y: 0.33, size: 12 },
  { id: 12, name: 'Chicago', x: 0.20, y: 0.37, size: 13 },
  { id: 13, name: 'Seoul', x: 0.79, y: 0.33, size: 13 },
  { id: 14, name: 'HongKong', x: 0.76, y: 0.43, size: 13 },
  { id: 15, name: 'Shanghai', x: 0.77, y: 0.38, size: 15 },
  { id: 16, name: 'Moscow', x: 0.58, y: 0.24, size: 13 },
  { id: 17, name: 'Cairo', x: 0.54, y: 0.41, size: 12 },
  { id: 18, name: 'Lagos', x: 0.47, y: 0.52, size: 12 },
  { id: 19, name: 'Nairobi', x: 0.57, y: 0.54, size: 11 },
];

const CONNECTIONS = [
  [0, 2], [0, 1], [0, 11], [0, 12], [0, 10],
  [2, 3], [2, 4], [2, 16], [2, 5],
  [3, 5], [4, 16], [5, 6], [5, 17],
  [6, 7], [6, 19], [7, 8], [7, 14], [7, 15],
  [8, 13], [8, 15], [8, 9],
  [14, 15], [13, 15],
  [10, 18], [17, 18], [18, 19],
  [0, 2], [1, 0], [9, 7],
  [16, 5], [19, 6],
];

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 1337 + 200) % 2160,
  size: ((i * 97) % 4) + 1,
  speed: ((i * 53) % 60) + 20,
  phase: (i * 113) % 600,
}));

const BACKGROUND_STARS = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 2731) % 3840,
  y: (i * 1993) % 2160,
  size: ((i * 37) % 3) + 0.5,
  brightness: ((i * 71) % 60) + 40,
}));

const CONTINENTS = [
  // North America
  'M 430 450 L 500 380 L 560 370 L 650 400 L 700 500 L 680 580 L 600 650 L 500 680 L 430 620 L 380 520 Z',
  // South America
  'M 520 700 L 580 670 L 650 710 L 680 800 L 660 900 L 590 960 L 520 920 L 480 840 L 490 750 Z',
  // Europe
  'M 1690 310 L 1800 280 L 1900 290 L 1960 350 L 1920 420 L 1820 440 L 1720 420 L 1660 370 Z',
  // Africa
  'M 1720 480 L 1840 460 L 1960 500 L 2020 600 L 2000 730 L 1920 840 L 1800 870 L 1680 820 L 1620 700 L 1640 580 Z',
  // Asia (simplified)
  'M 2000 260 L 2400 230 L 2700 280 L 2900 350 L 2950 450 L 2800 520 L 2600 540 L 2400 500 L 2200 460 L 2050 400 L 1980 330 Z',
  // Australia
  'M 2900 720 L 3050 700 L 3180 750 L 3200 850 L 3100 940 L 2940 930 L 2860 850 L 2880 770 Z',
];

export const StartupGrowthNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const scaleX = width / 3840;
  const scaleY = height / 2160;

  const cityLightupFrames = CITIES.map((_, i) => 30 + i * 18);

  const getCityOpacity = (cityIndex: number) => {
    const startFrame = cityLightupFrames[cityIndex];
    return interpolate(frame, [startFrame, startFrame + 25], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  };

  const getConnectionProgress = (connIndex: number) => {
    const startFrame = 80 + connIndex * 8;
    return interpolate(frame, [startFrame, startFrame + 40], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  };

  const getPulseScale = (cityIndex: number) => {
    const offset = cityIndex * 17;
    const pulseFrame = (frame + offset) % 90;
    return interpolate(pulseFrame, [0, 45, 90], [1, 1.6, 1]);
  };

  const getPulseOpacity = (cityIndex: number) => {
    const offset = cityIndex * 17;
    const pulseFrame = (frame + offset) % 90;
    return interpolate(pulseFrame, [0, 45, 90], [0.6, 0, 0.6]);
  };

  const globalPulse = interpolate((frame % 120), [0, 60, 120], [0.8, 1.0, 0.8]);

  return (
    <div style={{ width, height, background: '#000', overflow: 'hidden', opacity: globalOpacity }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Deep space background gradient */}
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#020d1a" />
            <stop offset="60%" stopColor="#010810" />
            <stop offset="100%" stopColor="#000305" />
          </radialGradient>
          <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00ffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#00ffff" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="20" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="cityFilter" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="connectionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00ffff" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        <rect width={width} height={height} fill="url(#bgGrad)" />

        {/* Background stars */}
        {BACKGROUND_STARS.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star.x * scaleX}
            cy={star.y * scaleY}
            r={star.size}
            fill={`rgba(200, 240, 255, ${star.brightness / 100})`}
          />
        ))}

        {/* Grid overlay */}
        <g opacity="0.06">
          {Array.from({ length: 20 }, (_, i) => (
            <line key={`hg-${i}`} x1={0} y1={(i / 20) * height} x2={width} y2={(i / 20) * height} stroke="#00ffff" strokeWidth="1" />
          ))}
          {Array.from({ length: 36 }, (_, i) => (
            <line key={`vg-${i}`} x1={(i / 36) * width} y1={0} x2={(i / 36) * width} y2={height} stroke="#00ffff" strokeWidth="1" />
          ))}
        </g>

        {/* Continent shapes */}
        {CONTINENTS.map((d, i) => (
          <path
            key={`continent-${i}`}
            d={d}
            transform={`scale(${scaleX}, ${scaleY})`}
            fill="rgba(0, 80, 100, 0.15)"
            stroke="rgba(0, 200, 220, 0.25)"
            strokeWidth="2"
          />
        ))}

        {/* Connections */}
        {CONNECTIONS.map((conn, idx) => {
          const cityA = CITIES[conn[0]];
          const cityB = CITIES[conn[1]];
          const progress = getConnectionProgress(idx);
          if (progress === 0) return null;

          const x1 = cityA.x * width;
          const y1 = cityA.y * height;
          const x2 = cityB.x * width;
          const y2 = cityB.y * height;

          const cx = x1 + (x2 - x1) * progress;
          const cy = y1 + (y2 - y1) * progress;

          return (
            <g key={`conn-${idx}`}>
              {/* Connection line base */}
              <line
                x1={x1} y1={y1}
                x2={cx} y2={cy}
                stroke="rgba(0, 200, 255, 0.15)"
                strokeWidth={3}
              />
              {/* Connection line glow */}
              <line
                x1={x1} y1={y1}
                x2={cx} y2={cy}
                stroke="rgba(0, 255, 255, 0.5)"
                strokeWidth={1.5}
                filter="url(#glow)"
              />
              {/* Traveling packet */}
              {progress > 0.1 && progress < 0.98 && (
                <circle
                  cx={cx} cy={cy}
                  r={5}
                  fill="#00ffff"
                  filter="url(#glow)"
                  opacity={0.9}
                />
              )}
            </g>
          );
        })}

        {/* Data particles floating */}
        {PARTICLES.map((p, i) => {
          const particleFrame = (frame + p.phase) % p.speed;
          const particleOpacity = interpolate(particleFrame, [0, p.speed * 0.3, p.speed * 0.7, p.speed], [0, 0.7, 0.7, 0]);
          return (
            <circle
              key={`particle-${i}`}
              cx={p.x * scaleX}
              cy={p.y * scaleY}
              r={p.size}
              fill="#00e5ff"
              opacity={particleOpacity * 0.5}
            />
          );
        })}

        {/* City nodes */}
        {CITIES.map((city, i) => {
          const cx = city.x * width;
          const cy = city.y * height;
          const opacity = getCityOpacity(i);
          const pulseScale = getPulseScale(i);
          const pulseOpacity = getPulseOpacity(i);
          const sz = city.size * scaleX * 60;

          if (opacity === 0) return null;

          return (
            <g key={`city-${i}`} opacity={opacity}>
              {/* Outer pulse ring */}
              <circle
                cx={cx} cy={cy}
                r={sz * pulseScale}
                fill="none"
                stroke="rgba(0, 255, 255, 0.4)"
                strokeWidth={2}
                opacity={pulseOpacity}
              />
              {/* Secondary pulse ring */}
              <circle
                cx={cx} cy={cy}
                r={sz * pulseScale * 1.5}
                fill="none"
                stroke="rgba(0, 200, 255, 0.2)"
                strokeWidth={1.5}
                opacity={pulseOpacity * 0.5}
              />
              {/* Glow halo */}
              <circle
                cx={cx} cy={cy}
                r={sz * 2.5}
                fill="rgba(0, 180, 255, 0.08)"
                filter="url(#cityFilter)"
              />
              {/* Core dot */}
              <circle
                cx={cx} cy={cy}
                r={sz * 0.6}
                fill="rgba(0, 230, 255, 0.9)"
                filter="url(#glow)"
              />
              {/* Center bright */}
              <circle
                cx={cx} cy={cy}
                r={sz * 0.3}
                fill="#ffffff"
                opacity={0.9 * globalPulse}
              />
            </g>
          );
        })}

        {/* Global network pulse overlay */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={interpolate((frame % 180), [0, 180], [0, width * 0.8])}
          fill="none"
          stroke="rgba(0, 255, 255, 0.04)"
          strokeWidth={3}
        />
        <circle
          cx={width / 2}
          cy={height / 2}
          r={interpolate((frame % 180), [0, 180], [0, width * 0.6])}
          fill="none"
          stroke="rgba(0, 200, 255, 0.05)"
          strokeWidth={2}
        />

        {/* Vignette */}
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.7)" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#vignette)" />

        {/* Scan line effect */}
        <rect
          x={0}
          y={interpolate(frame % 120, [0, 120], [0, height])}
          width={width}
          height={4}
          fill="rgba(0, 255, 255, 0.05)"
        />
      </svg>
    </div>
  );
};