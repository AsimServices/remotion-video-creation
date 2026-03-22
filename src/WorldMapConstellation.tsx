import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { x: 0.215, y: 0.38, name: 'NYC', size: 14 },
  { x: 0.185, y: 0.45, name: 'Miami', size: 10 },
  { x: 0.27, y: 0.32, name: 'London', size: 13 },
  { x: 0.29, y: 0.30, name: 'Paris', size: 11 },
  { x: 0.32, y: 0.28, name: 'Berlin', size: 10 },
  { x: 0.35, y: 0.31, name: 'Moscow', size: 12 },
  { x: 0.38, y: 0.38, name: 'Dubai', size: 11 },
  { x: 0.45, y: 0.42, name: 'Mumbai', size: 12 },
  { x: 0.52, y: 0.38, name: 'Delhi', size: 11 },
  { x: 0.58, y: 0.35, name: 'Beijing', size: 13 },
  { x: 0.62, y: 0.38, name: 'Shanghai', size: 12 },
  { x: 0.65, y: 0.45, name: 'HongKong', size: 10 },
  { x: 0.68, y: 0.50, name: 'Bangkok', size: 9 },
  { x: 0.72, y: 0.48, name: 'Singapore', size: 11 },
  { x: 0.75, y: 0.58, name: 'Sydney', size: 12 },
  { x: 0.13, y: 0.43, name: 'Chicago', size: 10 },
  { x: 0.09, y: 0.38, name: 'Seattle', size: 9 },
  { x: 0.08, y: 0.48, name: 'LA', size: 12 },
  { x: 0.22, y: 0.55, name: 'Bogota', size: 9 },
  { x: 0.25, y: 0.62, name: 'Lima', size: 9 },
  { x: 0.28, y: 0.68, name: 'Santiago', size: 9 },
  { x: 0.30, y: 0.57, name: 'SaoPaulo', size: 11 },
  { x: 0.33, y: 0.48, name: 'Lagos', size: 10 },
  { x: 0.34, y: 0.54, name: 'Nairobi', size: 9 },
  { x: 0.31, y: 0.60, name: 'Johannesburg', size: 10 },
  { x: 0.44, y: 0.28, name: 'Istanbul', size: 10 },
  { x: 0.48, y: 0.32, name: 'Riyadh', size: 9 },
  { x: 0.56, y: 0.28, name: 'Karachi', size: 9 },
  { x: 0.60, y: 0.28, name: 'Dhaka', size: 9 },
  { x: 0.78, y: 0.40, name: 'Manila', size: 9 },
  { x: 0.70, y: 0.32, name: 'Tokyo', size: 13 },
  { x: 0.66, y: 0.32, name: 'Seoul', size: 11 },
];

const CONNECTIONS = [
  [0, 1], [0, 15], [0, 16], [0, 2], [2, 3], [2, 4], [3, 4], [4, 5],
  [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13],
  [13, 14], [0, 22], [22, 23], [23, 24], [21, 20], [20, 19], [19, 18],
  [18, 17], [17, 16], [15, 16], [5, 25], [25, 26], [26, 6], [7, 27],
  [27, 28], [28, 8], [9, 31], [31, 30], [30, 11], [10, 29], [29, 14],
  [2, 25], [0, 21], [21, 19], [22, 21], [6, 7], [13, 29],
];

const PULSE_TIMINGS = CITIES.map((_, i) => ({
  delay: (i * 37) % 200,
  period: 80 + (i * 23) % 60,
}));

const STAR_FIELD = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 1337 + 200) % 2160,
  r: 0.5 + (i % 5) * 0.4,
  brightness: 0.2 + (i % 7) * 0.1,
}));

const GRID_LINES_H = Array.from({ length: 18 }, (_, i) => i);
const GRID_LINES_V = Array.from({ length: 36 }, (_, i) => i);

export const WorldMapConstellation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = fadeIn * fadeOut;

  const zoomProgress = interpolate(frame, [0, durationInFrames], [1, 2.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const panX = interpolate(frame, [0, durationInFrames], [0, -width * 0.15], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const panY = interpolate(frame, [0, durationInFrames], [0, -height * 0.08], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const constellationReveal = interpolate(frame, [60, 250], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const gridOpacity = interpolate(frame, [30, 150], [0, 0.15], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const W = width;
  const H = height;

  const cx = (rx: number) => rx * W;
  const cy = (ry: number) => ry * H;

  const glowPulse = Math.sin(frame * 0.05) * 0.3 + 0.7;

  return (
    <div style={{ width, height, background: '#000', overflow: 'hidden', opacity }}>
      <svg width={W} height={H} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#030d1a" />
            <stop offset="100%" stopColor="#000005" />
          </radialGradient>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00eaff" stopOpacity="1" />
            <stop offset="100%" stopColor="#00eaff" stopOpacity="0" />
          </radialGradient>
          <filter id="blur2" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="blur8" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="blur20" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="20" />
          </filter>
        </defs>
        <rect width={W} height={H} fill="url(#bgGrad)" />
        {STAR_FIELD.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="white"
            opacity={s.brightness * (0.5 + 0.5 * Math.sin(frame * 0.02 + i))}
          />
        ))}
      </svg>

      <div style={{
        position: 'absolute', top: 0, left: 0, width: W, height: H,
        transform: `scale(${zoomProgress}) translate(${panX / zoomProgress}px, ${panY / zoomProgress}px)`,
        transformOrigin: '45% 45%',
      }}>
        <svg width={W} height={H} style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <radialGradient id="earthGlow" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#001a33" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#000010" stopOpacity="0" />
            </radialGradient>
          </defs>

          <ellipse cx={W * 0.45} cy={H * 0.45} rx={W * 0.42} ry={H * 0.38} fill="url(#earthGlow)" opacity={0.8} />

          {GRID_LINES_H.map((i) => {
            const y = (i / 17) * H;
            return (
              <line key={`h${i}`} x1={0} y1={y} x2={W} y2={y}
                stroke="#00aaff" strokeWidth={0.5} opacity={gridOpacity * (i === 9 ? 2 : 1)} />
            );
          })}
          {GRID_LINES_V.map((i) => {
            const x = (i / 35) * W;
            return (
              <line key={`v${i}`} x1={x} y1={0} x2={x} y2={H}
                stroke="#00aaff" strokeWidth={0.5} opacity={gridOpacity * (i === 18 ? 2 : 1)} />
            );
          })}

          {CONNECTIONS.map(([a, b], i) => {
            const ca = CITIES[a];
            const cb = CITIES[b];
            if (!ca || !cb) return null;
            const x1 = cx(ca.x);
            const y1 = cy(ca.y);
            const x2 = cx(cb.x);
            const y2 = cy(cb.y);
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.15;

            const lineReveal = interpolate(constellationReveal, [i * 0.015, i * 0.015 + 0.3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const dataPulse = (frame + i * 17) % 90;
            const pulseT = dataPulse / 90;
            const px = x1 + (x2 - x1) * pulseT + ((midX - x1) * 2 - x1) * pulseT * (1 - pulseT) * 0;
            const py = y1 + (y2 - y1) * pulseT;
            const pulseOpacity = Math.sin(pulseT * Math.PI) * 0.9 * constellationReveal;

            return (
              <g key={i}>
                <path
                  d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                  fill="none"
                  stroke="#00eaff"
                  strokeWidth={0.8}
                  opacity={lineReveal * 0.25}
                />
                <path
                  d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                  fill="none"
                  stroke="#00eaff"
                  strokeWidth={1.5}
                  opacity={lineReveal * 0.12}
                  filter="url(#blur2)"
                />
                <circle cx={px} cy={py} r={3} fill="#ffffff" opacity={pulseOpacity} />
                <circle cx={px} cy={py} r={6} fill="#00eaff" opacity={pulseOpacity * 0.5} filter="url(#blur2)" />
              </g>
            );
          })}

          {CITIES.map((city, i) => {
            const x = cx(city.x);
            const y = cy(city.y);
            const pt = PULSE_TIMINGS[i];
            const localFrame = (frame + pt.delay) % pt.period;
            const pulseR = interpolate(localFrame, [0, pt.period * 0.6], [city.size * 0.5, city.size * 3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const pulseOp = interpolate(localFrame, [0, pt.period * 0.3, pt.period * 0.7], [0.8, 0.4, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const nodeReveal = interpolate(constellationReveal, [i * 0.02, i * 0.02 + 0.2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const coreGlow = glowPulse * 0.7 + 0.3;

            return (
              <g key={i} opacity={nodeReveal}>
                <circle cx={x} cy={y} r={pulseR} fill="none" stroke="#00eaff" strokeWidth={1} opacity={pulseOp * 0.6} />
                <circle cx={x} cy={y} r={city.size * 2.5} fill="#00eaff" opacity={0.04 * coreGlow} filter="url(#blur8)" />
                <circle cx={x} cy={y} r={city.size * 5} fill="#0044aa" opacity={0.06 * coreGlow} filter="url(#blur20)" />
                <circle cx={x} cy={y} r={city.size * 0.6} fill="#00eaff" opacity={0.9 * coreGlow} />
                <circle cx={x} cy={y} r={city.size * 0.3} fill="#ffffff" opacity={1} />
              </g>
            );
          })}

          {[0, 1, 2].map(ringIdx => {
            const ringFrame = (frame + ringIdx * 100) % 300;
            const ringR = interpolate(ringFrame, [0, 300], [50, W * 0.45]);
            const ringOp = interpolate(ringFrame, [0, 100, 250, 300], [0, 0.12, 0.05, 0]);
            return (
              <circle
                key={ringIdx}
                cx={W * 0.45}
                cy={H * 0.42}
                r={ringR}
                fill="none"
                stroke="#00eaff"
                strokeWidth={1.5}
                opacity={ringOp * constellationReveal}
              />
            );
          })}
        </svg>
      </div>

      <svg width={W} height={H} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        <defs>
          <radialGradient id="vignetteGrad" cx="50%" cy="50%" r="70%">
            <stop offset="50%" stopColor="transparent" />
            <stop offset="100%" stopColor="#000008" stopOpacity="0.95" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#vignetteGrad)" />
      </svg>
    </div>
  );
};