import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { x: 0.08, y: 0.38, name: 'NYC' },
  { x: 0.18, y: 0.72, name: 'MIA' },
  { x: 0.25, y: 0.32, name: 'CHI' },
  { x: 0.05, y: 0.25, name: 'MTL' },
  { x: 0.42, y: 0.68, name: 'LIS' },
  { x: 0.48, y: 0.55, name: 'LON' },
  { x: 0.52, y: 0.48, name: 'AMS' },
  { x: 0.55, y: 0.62, name: 'MAD' },
  { x: 0.58, y: 0.45, name: 'HAM' },
  { x: 0.62, y: 0.52, name: 'GEN' },
  { x: 0.65, y: 0.40, name: 'ODE' },
  { x: 0.72, y: 0.35, name: 'IST' },
  { x: 0.76, y: 0.55, name: 'SUE' },
  { x: 0.80, y: 0.65, name: 'DJI' },
  { x: 0.85, y: 0.48, name: 'KAR' },
  { x: 0.88, y: 0.60, name: 'MUM' },
  { x: 0.92, y: 0.42, name: 'SHA' },
  { x: 0.95, y: 0.55, name: 'HKG' },
  { x: 0.98, y: 0.48, name: 'TOK' },
  { x: 0.70, y: 0.75, name: 'SIN' },
  { x: 0.30, y: 0.80, name: 'RIO' },
  { x: 0.15, y: 0.85, name: 'BUE' },
  { x: 0.60, y: 0.82, name: 'CPT' },
  { x: 0.82, y: 0.80, name: 'PER' },
];

const ROUTES = [
  [0, 4], [0, 5], [0, 1], [1, 4], [1, 20], [1, 21],
  [4, 5], [5, 6], [5, 7], [6, 8], [7, 8], [8, 9],
  [9, 10], [10, 11], [11, 12], [12, 13], [13, 14],
  [14, 15], [15, 16], [16, 17], [17, 18], [17, 19],
  [19, 18], [15, 19], [13, 22], [22, 23], [20, 22],
  [2, 0], [2, 5], [3, 0], [3, 5], [21, 22], [19, 23],
  [11, 13], [7, 13], [6, 11], [9, 12],
];

const PULSES = Array.from({ length: 80 }, (_, i) => ({
  routeIndex: i % ROUTES.length,
  offset: (i * 0.137 + (i % 7) * 0.053) % 1.0,
  speed: 0.004 + (i % 5) * 0.0015,
  size: 6 + (i % 4) * 3,
  brightness: 0.6 + (i % 3) * 0.15,
}));

const STARS = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731 + 17) % 3840,
  y: (i * 937 + 53) % 2160,
  r: 1 + (i % 3),
  opacity: 0.1 + (i % 5) * 0.06,
}));

const GRID_LINES_H = Array.from({ length: 20 }, (_, i) => i);
const GRID_LINES_V = Array.from({ length: 36 }, (_, i) => i);

export const NeonLogisticsNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const time = frame / 30;

  return (
    <div style={{ width, height, background: '#050505', overflow: 'hidden', opacity: globalOpacity, position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6600" stopOpacity="1" />
            <stop offset="100%" stopColor="#FF6600" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a0800" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#050505" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="20" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background gradient */}
        <ellipse cx={width * 0.5} cy={height * 0.5} rx={width * 0.7} ry={height * 0.6}
          fill="url(#bgGlow)" />

        {/* Grid */}
        {GRID_LINES_H.map(i => {
          const y = (i / 20) * height;
          const pulse = Math.sin(time * 0.5 + i * 0.3) * 0.5 + 0.5;
          return (
            <line key={`h${i}`} x1={0} y1={y} x2={width} y2={y}
              stroke="#FF4400" strokeOpacity={0.03 + pulse * 0.02} strokeWidth={1} />
          );
        })}
        {GRID_LINES_V.map(i => {
          const x = (i / 36) * width;
          const pulse = Math.sin(time * 0.4 + i * 0.2) * 0.5 + 0.5;
          return (
            <line key={`v${i}`} x1={x} y1={0} x2={x} y2={height}
              stroke="#FF4400" strokeOpacity={0.03 + pulse * 0.02} strokeWidth={1} />
          );
        })}

        {/* Stars */}
        {STARS.map((s, i) => {
          const twinkle = Math.sin(time * 1.2 + i * 0.7) * 0.3 + 0.7;
          return (
            <circle key={`star${i}`} cx={s.x} cy={s.y} r={s.r}
              fill="#ffffff" opacity={s.opacity * twinkle} />
          );
        })}

        {/* Route lines */}
        {ROUTES.map((route, i) => {
          const c1 = CITIES[route[0]];
          const c2 = CITIES[route[1]];
          const x1 = c1.x * width;
          const y1 = c1.y * height;
          const x2 = c2.x * width;
          const y2 = c2.y * height;
          const pulse = Math.sin(time * 0.8 + i * 0.4) * 0.5 + 0.5;
          return (
            <g key={`route${i}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#FF4400" strokeOpacity={0.08 + pulse * 0.05}
                strokeWidth={1.5} />
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#FF6600" strokeOpacity={0.12 + pulse * 0.08}
                strokeWidth={0.8} filter="url(#glow)" />
            </g>
          );
        })}

        {/* Cargo pulses */}
        {PULSES.map((pulse, i) => {
          const route = ROUTES[pulse.routeIndex];
          const c1 = CITIES[route[0]];
          const c2 = CITIES[route[1]];
          const x1 = c1.x * width;
          const y1 = c1.y * height;
          const x2 = c2.x * width;
          const y2 = c2.y * height;

          const t = ((pulse.offset + time * pulse.speed * 3) % 1.0);
          const cx = x1 + (x2 - x1) * t;
          const cy = y1 + (y2 - y1) * t;

          const glowPulse = Math.sin(time * 3 + i * 0.8) * 0.3 + 0.7;

          return (
            <g key={`pulse${i}`}>
              <circle cx={cx} cy={cy} r={pulse.size * 2.5}
                fill="#FF6600" opacity={0.08 * pulse.brightness * glowPulse}
                filter="url(#softGlow)" />
              <circle cx={cx} cy={cy} r={pulse.size * 1.2}
                fill="#FF8800" opacity={0.25 * pulse.brightness * glowPulse}
                filter="url(#glow)" />
              <circle cx={cx} cy={cy} r={pulse.size * 0.5}
                fill="#FFAA44" opacity={0.9 * pulse.brightness} />
              <circle cx={cx} cy={cy} r={pulse.size * 0.2}
                fill="#FFFFFF" opacity={0.95} />
            </g>
          );
        })}

        {/* City nodes */}
        {CITIES.map((city, i) => {
          const cx = city.x * width;
          const cy = city.y * height;
          const pulse = Math.sin(time * 2 + i * 0.9) * 0.5 + 0.5;
          const ringScale = 1 + pulse * 0.6;
          const ripple = (time * 1.5 + i * 0.4) % 1;

          return (
            <g key={`city${i}`}>
              {/* Ripple ring */}
              <circle cx={cx} cy={cy} r={18 + ripple * 40}
                stroke="#FF6600" strokeWidth={1.5}
                fill="none"
                strokeOpacity={(1 - ripple) * 0.4} />
              {/* Outer glow */}
              <circle cx={cx} cy={cy} r={16 * ringScale}
                fill="#FF4400" opacity={0.06 + pulse * 0.04}
                filter="url(#strongGlow)" />
              {/* Mid ring */}
              <circle cx={cx} cy={cy} r={10}
                stroke="#FF6600" strokeWidth={2}
                fill="none" strokeOpacity={0.5 + pulse * 0.3}
                filter="url(#glow)" />
              {/* Inner ring */}
              <circle cx={cx} cy={cy} r={5}
                stroke="#FF8800" strokeWidth={1.5}
                fill="none" strokeOpacity={0.8 + pulse * 0.2} />
              {/* Core */}
              <circle cx={cx} cy={cy} r={3}
                fill="#FFAA44" opacity={0.9 + pulse * 0.1} />
              <circle cx={cx} cy={cy} r={1.5}
                fill="#FFFFFF" opacity={1} />
            </g>
          );
        })}

        {/* Large ambient glow orbs */}
        {[0.15, 0.5, 0.85].map((xf, i) => {
          const pulse = Math.sin(time * 0.6 + i * 1.5) * 0.3 + 0.7;
          return (
            <ellipse key={`orb${i}`}
              cx={xf * width} cy={height * 0.5}
              rx={width * 0.12 * pulse} ry={height * 0.15 * pulse}
              fill="#FF4400" opacity={0.025}
              filter="url(#softGlow)" />
          );
        })}

        {/* Scanline sweep */}
        {(() => {
          const scanY = ((time * 0.12) % 1) * height;
          return (
            <line x1={0} y1={scanY} x2={width} y2={scanY}
              stroke="#FF6600" strokeOpacity={0.06} strokeWidth={3} />
          );
        })()}

        {/* Corner accents */}
        {[
          { x: 0, y: 0, rx: 1, ry: 1 },
          { x: width, y: 0, rx: -1, ry: 1 },
          { x: 0, y: height, rx: 1, ry: -1 },
          { x: width, y: height, rx: -1, ry: -1 },
        ].map((corner, i) => {
          const pulse = Math.sin(time * 1.5 + i) * 0.4 + 0.6;
          return (
            <g key={`corner${i}`}>
              <line x1={corner.x} y1={corner.y}
                x2={corner.x + corner.rx * 120} y2={corner.y}
                stroke="#FF6600" strokeOpacity={0.4 * pulse} strokeWidth={2} />
              <line x1={corner.x} y1={corner.y}
                x2={corner.x} y2={corner.y + corner.ry * 120}
                stroke="#FF6600" strokeOpacity={0.4 * pulse} strokeWidth={2} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};