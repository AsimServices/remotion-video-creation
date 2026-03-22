import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { id: 0, name: 'Cairo', x: 0.535, y: 0.178 },
  { id: 1, name: 'Lagos', x: 0.32, y: 0.42 },
  { id: 2, name: 'Nairobi', x: 0.61, y: 0.455 },
  { id: 3, name: 'Johannesburg', x: 0.545, y: 0.695 },
  { id: 4, name: 'Casablanca', x: 0.28, y: 0.195 },
  { id: 5, name: 'Addis Ababa', x: 0.645, y: 0.385 },
  { id: 6, name: 'Khartoum', x: 0.59, y: 0.3 },
  { id: 7, name: 'Accra', x: 0.31, y: 0.41 },
  { id: 8, name: 'Dar es Salaam', x: 0.635, y: 0.495 },
  { id: 9, name: 'Luanda', x: 0.445, y: 0.535 },
  { id: 10, name: 'Dakar', x: 0.23, y: 0.29 },
  { id: 11, name: 'Kampala', x: 0.6, y: 0.435 },
  { id: 12, name: 'Abidjan', x: 0.295, y: 0.4 },
  { id: 13, name: 'Kinshasa', x: 0.48, y: 0.5 },
  { id: 14, name: 'Maputo', x: 0.585, y: 0.665 },
  { id: 15, name: 'Tunis', x: 0.445, y: 0.155 },
  { id: 16, name: 'Algiers', x: 0.375, y: 0.155 },
  { id: 17, name: 'Kigali', x: 0.575, y: 0.47 },
  { id: 18, name: 'Harare', x: 0.565, y: 0.62 },
  { id: 19, name: 'Lusaka', x: 0.545, y: 0.59 },
];

const CONNECTIONS = [
  [0, 6], [0, 15], [0, 16], [0, 4],
  [4, 10], [4, 16], [10, 12], [10, 1],
  [1, 12], [1, 7], [1, 13], [7, 12],
  [6, 5], [6, 2], [5, 2], [5, 11],
  [2, 8], [2, 11], [2, 17], [11, 17],
  [13, 9], [13, 17], [9, 19], [19, 18],
  [18, 3], [18, 14], [3, 14], [19, 3],
  [8, 14], [15, 16], [0, 5], [1, 9],
  [2, 3], [4, 1],
];

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  connectionIndex: i % CONNECTIONS.length,
  offset: (i * 0.137) % 1,
  speed: 0.003 + (i % 7) * 0.0015,
  size: 6 + (i % 5) * 3,
}));

const BG_STARS = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731 + 300) % 3840,
  y: (i * 1337 + 200) % 2160,
  r: 1 + (i % 3),
  opacity: 0.2 + (i % 5) * 0.12,
}));

const RIPPLE_CITIES = Array.from({ length: 20 }, (_, i) => ({
  cityId: i % CITIES.length,
  delay: (i * 0.17) % 1,
}));

const CITY_COLORS = [
  '#00ffff', '#ff00ff', '#ffff00', '#00ff88',
  '#ff6600', '#8800ff', '#00ccff', '#ff0088',
];

export const AfricaEconomicNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const t = frame / durationInFrames;
  const totalFrames = durationInFrames;

  // Africa continent outline (simplified polygon scaled to canvas)
  const africaPoints = [
    [0.38, 0.08], [0.44, 0.06], [0.50, 0.07], [0.56, 0.09],
    [0.60, 0.12], [0.64, 0.13], [0.67, 0.16], [0.68, 0.20],
    [0.70, 0.24], [0.71, 0.29], [0.70, 0.34], [0.72, 0.38],
    [0.73, 0.42], [0.72, 0.48], [0.70, 0.54], [0.68, 0.60],
    [0.65, 0.66], [0.62, 0.71], [0.58, 0.76], [0.56, 0.80],
    [0.545, 0.85], [0.54, 0.88], [0.535, 0.90],
    [0.52, 0.88], [0.51, 0.84], [0.50, 0.79],
    [0.47, 0.74], [0.44, 0.70], [0.41, 0.66],
    [0.38, 0.62], [0.35, 0.57], [0.31, 0.53],
    [0.27, 0.50], [0.24, 0.46], [0.23, 0.42],
    [0.24, 0.37], [0.26, 0.33], [0.27, 0.29],
    [0.26, 0.25], [0.27, 0.21], [0.29, 0.18],
    [0.31, 0.15], [0.33, 0.12], [0.36, 0.10],
  ];

  const africanPath = africaPoints
    .map(([px, py], i) => `${i === 0 ? 'M' : 'L'} ${px * width} ${py * height}`)
    .join(' ') + ' Z';

  const connectionRevealProgress = interpolate(frame, [30, totalFrames * 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ width, height, background: '#030812', overflow: 'hidden', opacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#001a2e" stopOpacity="1" />
            <stop offset="100%" stopColor="#030812" stopOpacity="1" />
          </radialGradient>
          <filter id="glow1" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow2" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow3" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="40" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="lineGrad0" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ffff" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#00ffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00ffff" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Background gradient */}
        <rect width={width} height={height} fill="url(#bgGlow)" />

        {/* Stars */}
        {BG_STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.opacity * 0.5} />
        ))}

        {/* Africa continent fill */}
        <path
          d={africanPath}
          fill="#041520"
          stroke="#0a3050"
          strokeWidth="2"
          opacity="0.9"
        />

        {/* Africa continent glow border */}
        <path
          d={africanPath}
          fill="none"
          stroke="#00aaff"
          strokeWidth="1.5"
          opacity={0.3 + 0.15 * Math.sin(frame * 0.04)}
          filter="url(#glow1)"
        />

        {/* Grid overlay on continent */}
        {Array.from({ length: 30 }, (_, i) => {
          const lineX = (0.22 + i * 0.02) * width;
          return (
            <line
              key={`grid-v-${i}`}
              x1={lineX} y1={0.06 * height}
              x2={lineX} y2={0.92 * height}
              stroke="#00aaff"
              strokeWidth="0.5"
              opacity="0.04"
            />
          );
        })}
        {Array.from({ length: 25 }, (_, i) => {
          const lineY = (0.06 + i * 0.035) * height;
          return (
            <line
              key={`grid-h-${i}`}
              x1={0.22 * width} y1={lineY}
              x2={0.73 * width} y2={lineY}
              stroke="#00aaff"
              strokeWidth="0.5"
              opacity="0.04"
            />
          );
        })}

        {/* Connections */}
        {CONNECTIONS.map(([fromIdx, toIdx], connIdx) => {
          const from = CITIES[fromIdx];
          const to = CITIES[toIdx];
          const connDelay = (connIdx / CONNECTIONS.length) * 0.7;
          const connProgress = interpolate(connectionRevealProgress, [connDelay, Math.min(connDelay + 0.15, 1)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          const x1 = from.x * width;
          const y1 = from.y * height;
          const x2 = to.x * width;
          const y2 = to.y * height;

          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2 - 60;

          const colorIdx = (fromIdx + toIdx) % CITY_COLORS.length;
          const color = CITY_COLORS[colorIdx];

          const pulse = 0.4 + 0.3 * Math.sin(frame * 0.05 + connIdx * 0.7);

          const pathD = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
          const totalLen = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * 1.3;
          const dashLen = totalLen * connProgress;

          return (
            <g key={`conn-${connIdx}`}>
              {/* Outer glow */}
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeDasharray={`${dashLen} ${totalLen}`}
                opacity={pulse * 0.3}
                filter="url(#glow2)"
              />
              {/* Main line */}
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeDasharray={`${dashLen} ${totalLen}`}
                opacity={pulse * 0.9}
                filter="url(#softGlow)"
              />
            </g>
          );
        })}

        {/* Traveling particles on connections */}
        {PARTICLES.map((p, i) => {
          const [fromIdx, toIdx] = CONNECTIONS[p.connectionIndex];
          const from = CITIES[fromIdx];
          const to = CITIES[toIdx];

          const x1 = from.x * width;
          const y1 = from.y * height;
          const x2 = to.x * width;
          const y2 = to.y * height;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2 - 60;

          const progress = ((frame * p.speed + p.offset) % 1);

          // Quadratic bezier interpolation
          const t1 = progress;
          const px = (1 - t1) * (1 - t1) * x1 + 2 * (1 - t1) * t1 * mx + t1 * t1 * x2;
          const py = (1 - t1) * (1 - t1) * y1 + 2 * (1 - t1) * t1 * my + t1 * t1 * y2;

          const connProgress = interpolate(connectionRevealProgress, [
            (p.connectionIndex / CONNECTIONS.length) * 0.7,
            Math.min((p.connectionIndex / CONNECTIONS.length) * 0.7 + 0.15, 1)
          ], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          if (connProgress < 0.5) return null;

          const colorIdx = (fromIdx + toIdx) % CITY_COLORS.length;
          const color = CITY_COLORS[colorIdx];
          const alpha = 0.6 + 0.4 * Math.sin(frame * 0.1 + i);

          return (
            <g key={`particle-${i}`}>
              <circle cx={px} cy={py} r={p.size * 2} fill={color} opacity={alpha * 0.2} filter="url(#glow2)" />
              <circle cx={px} cy={py} r={p.size * 0.6} fill={color} opacity={alpha} filter="url(#softGlow)" />
              <circle cx={px} cy={py} r={p.size * 0.25} fill="white" opacity={alpha * 0.9} />
            </g>
          );
        })}

        {/* City nodes */}
        {CITIES.map((city, i) => {
          const cx = city.x * width;
          const cy = city.y * height;
          const cityDelay = (i / CITIES.length) * 0.5;
          const cityProgress = interpolate(connectionRevealProgress, [cityDelay, cityDelay + 0.15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const color = CITY_COLORS[i % CITY_COLORS.length];

          const pulse1 = 0.5 + 0.5 * Math.sin(frame * 0.07 + i * 1.2);
          const ripple1 = (frame * 0.02 + i * 0.3) % 1;
          const ripple2 = (frame * 0.02 + i * 0.3 + 0.5) % 1;

          const nodeScale = cityProgress;

          return (
            <g key={`city-${i}`} transform={`scale(${nodeScale})`} style={{ transformOrigin: `${cx}px ${cy}px` }}>
              {/* Ripple rings */}
              <circle
                cx={cx} cy={cy}
                r={30 + ripple1 * 80}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                opacity={(1 - ripple1) * 0.4}
              />
              <circle
                cx={cx} cy={cy}
                r={30 + ripple2 * 80}
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity={(1 - ripple2) * 0.2}
              />

              {/* Glow halo */}
              <circle cx={cx} cy={cy} r={22} fill={color} opacity={pulse1 * 0.15} filter="url(#glow3)" />
              <circle cx={cx} cy={cy} r={16} fill={color} opacity={pulse1 * 0.25} filter="url(#glow2)" />

              {/* Node rings */}
              <circle cx={cx} cy={cy} r={14} fill="none" stroke={color} strokeWidth="2" opacity={0.6} />
              <circle cx={cx} cy={cy} r={10} fill="none" stroke={color} strokeWidth="1.5" opacity={0.8} />

              {/* Core */}
              <circle cx={cx} cy={cy} r={7} fill={color} opacity={0.9} filter="url(#softGlow)" />
              <circle cx={cx} cy={cy} r={4} fill="white" opacity={0.95} />

              {/* Cross lines */}
              <line x1={cx - 20} y1={cy} x2={cx + 20} y2={cy} stroke={color} strokeWidth="1" opacity={0.3} />
              <line x1={cx} y1={cy - 20} x2={cx} y2={cy + 20} stroke={color} strokeWidth="1" opacity={0.3} />
            </g>
          );
        })}

        {/* Hexagonal overlay pattern */}
        {Array.from({ length: 8 }, (_, i) => {
          const hx = (0.28 + (i % 4) * 0.13) * width;
          const hy = (0.15 + Math.floor(i / 4) * 0.35) * height;
          const hexProgress = interpolate(t, [i * 0.04, i * 0.04 + 0.2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const hexR = 60;
          const hexPoints = Array.from({ length: 6 }, (_, k) => {
            const angle = (k * 60 - 30) * Math.PI / 180;
            return `${hx + hexR * Math.cos(angle)},${hy + hexR * Math.sin(angle)}`;
          }).join(' ');
          return (
            <polygon
              key={`hex-${i}`}
              points={hexPoints}
              fill="none"
              stroke="#00ffff"
              strokeWidth="1"
              opacity={hexProgress * 0.08}
            />
          );
        })}

        {/* Scanning line */}
        {(() => {
          const scanY = interpolate(frame % 150, [0, 150], [0.06 * height, 0.92 * height]);
          return (
            <line
              x1={0.22 * width} y1={scanY}
              x2={0.73 * width} y2={scanY}
              stroke="#00ffff"
              strokeWidth="1.5"
              opacity="0.12"
              filter="url(#glow1)"
            />
          );
        })()}

        {/* Bottom data bar */}
        <rect x={0} y={height - 6} width={interpolate(frame, [0, durationInFrames], [0, width])} height={6}
          fill="#00ffff" opacity="0.6" filter="url(#glow1)" />

        {/* Corner accents */}
        {[
          [0, 0, 1, 1], [width, 0, -1, 1],
          [0, height, 1, -1], [width, height, -1, -1]
        ].map(([cx2, cy2, sx, sy], i) => (
          <g key={`corner-${i}`}>
            <line x1={cx2} y1={cy2} x2={cx2 + sx * 120} y2={cy2} stroke="#00ffff" strokeWidth="3" opacity="0.5" />
            <line x1={cx2} y1={cy2} x2={cx2} y2={cy2 + sy * 120} stroke="#00ffff" strokeWidth="3" opacity="0.5" />
            <circle cx={cx2} cy={cy2} r={8} fill="#00ffff" opacity="0.7" />
          </g>
        ))}

        {/* Data nodes - small floating indicators */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2 + frame * 0.005;
          const radius = (0.08 + (i % 3) * 0.03) * Math.min(width, height);
          const centerX = 0.47 * width;
          const centerY = 0.48 * height;
          const nx = centerX + Math.cos(angle) * radius;
          const ny = centerY + Math.sin(angle) * radius;
          const nodeOpacity = interpolate(frame, [60, 120], [0, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <g key={`float-${i}`}>
              <circle cx={nx} cy={ny} r={5} fill={CITY_COLORS[i % CITY_COLORS.length]} opacity={nodeOpacity * 0.4} filter="url(#glow1)" />
              <circle cx={nx} cy={ny} r={2.5} fill={CITY_COLORS[i % CITY_COLORS.length]} opacity={nodeOpacity} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};