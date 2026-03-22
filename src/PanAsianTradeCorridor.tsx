import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { id: 0, name: 'Singapore', x: 0.545, y: 0.72 },
  { id: 1, name: 'Bangkok', x: 0.475, y: 0.585 },
  { id: 2, name: 'Kuala Lumpur', x: 0.525, y: 0.67 },
  { id: 3, name: 'Jakarta', x: 0.555, y: 0.75 },
  { id: 4, name: 'Manila', x: 0.635, y: 0.595 },
  { id: 5, name: 'Ho Chi Minh', x: 0.565, y: 0.615 },
  { id: 6, name: 'Hanoi', x: 0.565, y: 0.545 },
  { id: 7, name: 'Yangon', x: 0.475, y: 0.535 },
  { id: 8, name: 'Phnom Penh', x: 0.545, y: 0.595 },
  { id: 9, name: 'Vientiane', x: 0.53, y: 0.555 },
  { id: 10, name: 'Shanghai', x: 0.62, y: 0.435 },
  { id: 11, name: 'Hong Kong', x: 0.61, y: 0.505 },
  { id: 12, name: 'Tokyo', x: 0.71, y: 0.43 },
  { id: 13, name: 'Seoul', x: 0.67, y: 0.42 },
  { id: 14, name: 'Mumbai', x: 0.375, y: 0.555 },
  { id: 15, name: 'Colombo', x: 0.415, y: 0.66 },
  { id: 16, name: 'Taipei', x: 0.645, y: 0.48 },
  { id: 17, name: 'Surabaya', x: 0.575, y: 0.775 },
  { id: 18, name: 'Guangzhou', x: 0.605, y: 0.5 },
  { id: 19, name: 'Dhaka', x: 0.44, y: 0.535 },
];

const CONNECTIONS = [
  [0, 2], [0, 3], [0, 5], [1, 2], [1, 5], [1, 8], [1, 9], [1, 7],
  [2, 3], [2, 5], [3, 17], [4, 11], [4, 16], [5, 8], [5, 6], [5, 11],
  [6, 9], [6, 11], [6, 10], [7, 19], [7, 1], [8, 9], [10, 11], [10, 13],
  [10, 12], [11, 16], [11, 18], [12, 13], [13, 10], [14, 15], [14, 19],
  [15, 0], [16, 10], [18, 11], [19, 7], [0, 11], [1, 6], [4, 10],
  [14, 1], [6, 10],
];

const PARTICLES = Array.from({ length: CONNECTIONS.length * 3 }, (_, i) => ({
  connectionIdx: i % CONNECTIONS.length,
  offset: (i * 0.137 + (i % 7) * 0.213) % 1,
  speed: 0.003 + (i % 5) * 0.001,
  size: 3 + (i % 4),
}));

const STARS = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731 + 47) % 3840,
  y: (i * 1337 + 83) % 2160,
  r: ((i * 73) % 3) + 1,
  opacity: 0.2 + ((i * 31) % 60) / 100,
}));

const PULSES = Array.from({ length: CITIES.length }, (_, i) => ({
  delay: (i * 23) % 90,
}));

export const PanAsianTradeCorridor: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const globalOpacity = fadeIn * fadeOut;

  const mapOffsetX = width * 0.08;
  const mapOffsetY = height * 0.05;
  const mapWidth = width * 0.84;
  const mapHeight = height * 0.9;

  const toScreen = (px: number, py: number) => ({
    sx: mapOffsetX + px * mapWidth,
    sy: mapOffsetY + py * mapHeight,
  });

  // Animated scan line
  const scanProgress = (frame % 180) / 180;

  // Rotating glow angle
  const glowAngle = (frame * 0.5) % 360;

  return (
    <div style={{ width, height, background: '#050810', position: 'relative', overflow: 'hidden', opacity: globalOpacity }}>
      {/* Star field */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.opacity} />
        ))}
      </svg>

      {/* Background gradient overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width, height,
        background: 'radial-gradient(ellipse at 55% 60%, rgba(20,10,50,0.7) 0%, rgba(5,8,16,0.95) 70%)',
      }} />

      {/* Subtle grid */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, opacity: 0.07 }}>
        {Array.from({ length: 40 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * (height / 40)} x2={width} y2={i * (height / 40)} stroke="#4488ff" strokeWidth={1} />
        ))}
        {Array.from({ length: 70 }, (_, i) => (
          <line key={`v${i}`} x1={i * (width / 70)} y1={0} x2={i * (width / 70)} y2={height} stroke="#4488ff" strokeWidth={1} />
        ))}
      </svg>

      {/* Scan line */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width, height: 4,
        background: 'linear-gradient(90deg, transparent, rgba(100,200,255,0.3), transparent)',
        transform: `translateY(${scanProgress * height}px)`,
        boxShadow: '0 0 30px 8px rgba(100,200,255,0.15)',
      }} />

      {/* Main SVG for map */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffd700" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffd700" stopOpacity="0" />
          </radialGradient>
          <filter id="blur1">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="blur3">
            <feGaussianBlur stdDeviation="20" />
          </filter>
          <filter id="cityBlur">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffd700" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#ffd700" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffd700" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Connection lines - glow layer */}
        {CONNECTIONS.map(([a, b], i) => {
          const ca = toScreen(CITIES[a].x, CITIES[a].y);
          const cb = toScreen(CITIES[b].x, CITIES[b].y);
          const lineProgress = interpolate(frame, [30 + i * 4, 70 + i * 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const mx = (ca.sx + cb.sx) / 2;
          const my = (ca.sy + cb.sy) / 2 - 60;
          const pulse = Math.sin(frame * 0.04 + i * 0.5) * 0.3 + 0.7;

          if (lineProgress === 0) return null;

          return (
            <g key={`conn-${i}`}>
              <path
                d={`M ${ca.sx} ${ca.sy} Q ${mx} ${my} ${cb.sx} ${cb.sy}`}
                fill="none"
                stroke="#ffd700"
                strokeWidth={3}
                strokeOpacity={lineProgress * pulse * 0.15}
                filter="url(#blur2)"
              />
              <path
                d={`M ${ca.sx} ${ca.sy} Q ${mx} ${my} ${cb.sx} ${cb.sy}`}
                fill="none"
                stroke="#ffd700"
                strokeWidth={1.5}
                strokeOpacity={lineProgress * pulse * 0.5}
                strokeDasharray="8 4"
                strokeDashoffset={-frame * 1.5}
              />
            </g>
          );
        })}

        {/* Particles along connections */}
        {PARTICLES.map((p, i) => {
          const [a, b] = CONNECTIONS[p.connectionIdx];
          const ca = toScreen(CITIES[a].x, CITIES[a].y);
          const cb = toScreen(CITIES[b].x, CITIES[b].y);
          const mx = (ca.sx + cb.sx) / 2;
          const my = (ca.sy + cb.sy) / 2 - 60;

          const t = (p.offset + frame * p.speed) % 1;

          // Quadratic bezier point
          const bx = (1 - t) * (1 - t) * ca.sx + 2 * (1 - t) * t * mx + t * t * cb.sx;
          const by = (1 - t) * (1 - t) * ca.sy + 2 * (1 - t) * t * my + t * t * cb.sy;

          const lineProgress = interpolate(frame, [30 + p.connectionIdx * 4, 80 + p.connectionIdx * 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const particleOpacity = lineProgress * (0.6 + Math.sin(frame * 0.1 + i) * 0.4);

          return (
            <g key={`part-${i}`} opacity={particleOpacity}>
              <circle cx={bx} cy={by} r={p.size + 4} fill="#ffd700" opacity={0.2} filter="url(#blur1)" />
              <circle cx={bx} cy={by} r={p.size} fill="#fff8dc" opacity={0.9} />
              <circle cx={bx} cy={by} r={p.size - 1} fill="white" opacity={1} />
            </g>
          );
        })}

        {/* City nodes */}
        {CITIES.map((city, i) => {
          const { sx, sy } = toScreen(city.x, city.y);
          const cityProgress = interpolate(frame, [40 + i * 5, 80 + i * 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const pulseDelay = PULSES[i].delay;
          const pulseR = interpolate((frame + pulseDelay) % 120, [0, 60, 120], [0, 40, 0]);
          const pulseO = interpolate((frame + pulseDelay) % 120, [0, 30, 60], [0.8, 0.3, 0]);

          return (
            <g key={`city-${i}`} opacity={cityProgress}>
              {/* Outer glow */}
              <circle cx={sx} cy={sy} r={30} fill="#ffd700" opacity={0.05} filter="url(#blur3)" />
              {/* Pulse ring */}
              <circle cx={sx} cy={sy} r={pulseR} fill="none" stroke="#ffd700" strokeWidth={2} opacity={pulseO} />
              {/* Glow circle */}
              <circle cx={sx} cy={sy} r={18} fill="#ffd700" opacity={0.12} filter="url(#cityBlur)" />
              {/* Outer ring */}
              <circle cx={sx} cy={sy} r={12} fill="none" stroke="#ffd700" strokeWidth={1.5} opacity={0.6} />
              {/* Inner ring */}
              <circle cx={sx} cy={sy} r={7} fill="none" stroke="#ffd700" strokeWidth={1} opacity={0.8} />
              {/* Core */}
              <circle cx={sx} cy={sy} r={4} fill="#ffd700" opacity={1} />
              <circle cx={sx} cy={sy} r={2} fill="white" opacity={1} />
              {/* Cross marker */}
              <line x1={sx - 16} y1={sy} x2={sx - 12} y2={sy} stroke="#ffd700" strokeWidth={1} opacity={0.5} />
              <line x1={sx + 12} y1={sy} x2={sx + 16} y2={sy} stroke="#ffd700" strokeWidth={1} opacity={0.5} />
              <line x1={sx} y1={sy - 16} x2={sx} y2={sy - 12} stroke="#ffd700" strokeWidth={1} opacity={0.5} />
              <line x1={sx} y1={sy + 12} x2={sx} y2={sy + 16} stroke="#ffd700" strokeWidth={1} opacity={0.5} />
            </g>
          );
        })}

        {/* Central radial glow */}
        <circle
          cx={toScreen(0.545, 0.62).sx}
          cy={toScreen(0.545, 0.62).sy}
          r={interpolate(Math.sin(frame * 0.02), [-1, 1], [180, 240])}
          fill="none"
          stroke="#ffd700"
          strokeWidth={1}
          opacity={0.04}
          filter="url(#blur2)"
        />

        {/* Rotating arc */}
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (glowAngle + i * 60) * (Math.PI / 180);
          const cx2 = toScreen(0.545, 0.62).sx;
          const cy2 = toScreen(0.545, 0.62).sy;
          const r = 350;
          const x1 = cx2 + Math.cos(angle) * r;
          const y1 = cy2 + Math.sin(angle) * r;
          return (
            <line key={`spoke-${i}`} x1={cx2} y1={cy2} x2={x1} y2={y1}
              stroke="#ffd700" strokeWidth={1} opacity={0.05} />
          );
        })}
      </svg>

      {/* Top-left corner decoration */}
      <svg width={300} height={300} style={{ position: 'absolute', top: 20, left: 20, opacity: 0.4 }}>
        <rect x={10} y={10} width={60} height={2} fill="#ffd700" />
        <rect x={10} y={10} width={2} height={60} fill="#ffd700" />
        <rect x={10} y={14} width={30} height={1} fill="#ffd700" opacity={0.5} />
      </svg>

      {/* Bottom-right corner decoration */}
      <svg width={300} height={300} style={{ position: 'absolute', bottom: 20, right: 20, opacity: 0.4 }}>
        <rect x={230} y={288} width={60} height={2} fill="#ffd700" />
        <rect x={288} y={230} width={2} height={60} fill="#ffd700" />
        <rect x={258} y={287} width={30} height={1} fill="#ffd700" opacity={0.5} />
      </svg>

      {/* Vignette */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width, height,
        background: 'radial-gradient(ellipse at 55% 60%, transparent 40%, rgba(2,3,10,0.7) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};