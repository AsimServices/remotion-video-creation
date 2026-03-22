import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const PRESENCE_DOTS = [
  { lat: 40.7, lon: -74.0, label: 'NY' },
  { lat: 51.5, lon: -0.1, label: 'LDN' },
  { lat: 48.8, lon: 2.3, label: 'PAR' },
  { lat: 52.5, lon: 13.4, label: 'BER' },
  { lat: 55.7, lon: 37.6, label: 'MOS' },
  { lat: 35.7, lon: 139.7, label: 'TKY' },
  { lat: 31.2, lon: 121.5, label: 'SHA' },
  { lat: 22.3, lon: 114.2, label: 'HKG' },
  { lat: 1.3, lon: 103.8, label: 'SIN' },
  { lat: -33.9, lon: 151.2, label: 'SYD' },
  { lat: 19.4, lon: -99.1, label: 'MEX' },
  { lat: -23.5, lon: -46.6, label: 'SAO' },
  { lat: 37.6, lon: -122.4, label: 'SFO' },
  { lat: 41.9, lon: 12.5, label: 'ROM' },
  { lat: 25.2, lon: 55.3, label: 'DXB' },
  { lat: 28.6, lon: 77.2, label: 'DEL' },
  { lat: -26.2, lon: 28.0, label: 'JHB' },
  { lat: 6.5, lon: 3.4, label: 'LOS' },
  { lat: 59.9, lon: 10.7, label: 'OSL' },
  { lat: 43.7, lon: -79.4, label: 'TOR' },
];

const GRID_LINES_LAT = Array.from({ length: 13 }, (_, i) => -90 + i * 15);
const GRID_LINES_LON = Array.from({ length: 24 }, (_, i) => -180 + i * 15);

const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 1337 + 200) % 2160,
  r: ((i * 17) % 3) + 1,
  opacity: 0.3 + ((i * 7) % 7) * 0.1,
  twinkleOffset: (i * 41) % 100,
}));

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  angle: (i * 360) / 60,
  radius: 520 + ((i * 37) % 120),
  size: 2 + ((i * 13) % 4),
  speed: 0.3 + ((i * 7) % 10) * 0.05,
  opacity: 0.2 + ((i * 11) % 6) * 0.1,
}));

function latLonToXY(lat: number, lon: number, rotationDeg: number, R: number): { x: number; y: number; visible: boolean } {
  const phi = (lat * Math.PI) / 180;
  const lambda = ((lon + rotationDeg) * Math.PI) / 180;
  const x = R * Math.cos(phi) * Math.sin(lambda);
  const y = -R * Math.sin(phi);
  const z = R * Math.cos(phi) * Math.cos(lambda);
  return { x, y, visible: z > 0 };
}

function latLonToPath(lat: number, lon: number, rotationDeg: number, R: number) {
  return latLonToXY(lat, lon, rotationDeg, R);
}

export const CorporateGlobePresence: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const rotationDeg = (frame * 0.25) % 360;
  const cx = width / 2;
  const cy = height / 2;
  const R = 700;

  const dotActivation = PRESENCE_DOTS.map((_, i) => {
    const startFrame = i * 18;
    return interpolate(frame, [startFrame, startFrame + 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  });

  const pulseBase = Math.sin(frame * 0.08) * 0.5 + 0.5;

  return (
    <div style={{ width, height, background: '#000008', overflow: 'hidden', position: 'relative', opacity }}>
      {/* Stars */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {STARS.map((s, i) => {
          const twinkle = 0.5 + 0.5 * Math.sin(frame * 0.05 + s.twinkleOffset * 0.3);
          return (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="white"
              opacity={s.opacity * twinkle}
            />
          );
        })}
      </svg>

      {/* Outer glow rings */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0066ff" stopOpacity="0" />
            <stop offset="60%" stopColor="#0044cc" stopOpacity="0.08" />
            <stop offset="80%" stopColor="#0033aa" stopOpacity="0.18" />
            <stop offset="90%" stopColor="#0055ff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#001166" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="earthSurface" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#0099ff" stopOpacity="1" />
            <stop offset="40%" stopColor="#0055cc" stopOpacity="1" />
            <stop offset="70%" stopColor="#002288" stopOpacity="1" />
            <stop offset="100%" stopColor="#000833" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="atmosphereGrad" cx="40%" cy="30%" r="65%">
            <stop offset="85%" stopColor="#001155" stopOpacity="0" />
            <stop offset="93%" stopColor="#0044ff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0066ff" stopOpacity="0" />
          </radialGradient>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="dotGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="earthClip">
            <circle cx={cx} cy={cy} r={R} />
          </clipPath>
        </defs>

        {/* Outer halo glow */}
        <circle cx={cx} cy={cy} r={R + 120} fill="url(#earthGlow)" opacity={0.7 + pulseBase * 0.3} />
        <circle cx={cx} cy={cy} r={R + 60} fill="none" stroke="#0055ff" strokeWidth="1.5" opacity={0.15 + pulseBase * 0.1} />
        <circle cx={cx} cy={cy} r={R + 90} fill="none" stroke="#0044cc" strokeWidth="1" opacity={0.08 + pulseBase * 0.05} />

        {/* Earth base */}
        <circle cx={cx} cy={cy} r={R} fill="url(#earthSurface)" />

        {/* Grid lines clipped to Earth */}
        <g clipPath="url(#earthClip)" opacity={0.18}>
          {GRID_LINES_LAT.map((lat, i) => {
            const pts: string[] = [];
            for (let lonStep = 0; lonStep <= 360; lonStep += 3) {
              const lon = -180 + lonStep;
              const { x, y, visible } = latLonToPath(lat, lon, rotationDeg, R);
              if (visible) pts.push(`${cx + x},${cy + y}`);
            }
            if (pts.length < 2) return null;
            return <polyline key={i} points={pts.join(' ')} fill="none" stroke="#44aaff" strokeWidth="0.8" />;
          })}
          {GRID_LINES_LON.map((lon, i) => {
            const pts: string[] = [];
            for (let latStep = -90; latStep <= 90; latStep += 3) {
              const { x, y, visible } = latLonToPath(latStep, lon, rotationDeg, R);
              if (visible) pts.push(`${cx + x},${cy + y}`);
            }
            if (pts.length < 2) return null;
            return <polyline key={i} points={pts.join(' ')} fill="none" stroke="#44aaff" strokeWidth="0.8" />;
          })}
        </g>

        {/* Atmosphere overlay */}
        <circle cx={cx} cy={cy} r={R} fill="url(#atmosphereGrad)" />

        {/* Presence dots */}
        {PRESENCE_DOTS.map((dot, i) => {
          const { x, y, visible } = latLonToXY(dot.lat, dot.lon, rotationDeg, R);
          if (!visible) return null;
          const act = dotActivation[i];
          const pulse = 0.6 + 0.4 * Math.sin(frame * 0.1 + i * 1.3);
          const ringScale = 1 + 1.5 * ((frame * 0.04 + i * 0.7) % 1);
          const ringOpacity = act * (1 - ((frame * 0.04 + i * 0.7) % 1)) * 0.7;
          return (
            <g key={i} filter="url(#dotGlow)" opacity={act}>
              {/* Pulse ring */}
              <circle
                cx={cx + x}
                cy={cy + y}
                r={14 * ringScale}
                fill="none"
                stroke="#00aaff"
                strokeWidth="1.5"
                opacity={ringOpacity}
              />
              {/* Dot core */}
              <circle
                cx={cx + x}
                cy={cy + y}
                r={7}
                fill="#00ccff"
                opacity={pulse * 0.9}
              />
              <circle
                cx={cx + x}
                cy={cy + y}
                r={4}
                fill="white"
                opacity={pulse}
              />
            </g>
          );
        })}

        {/* Specular highlight */}
        <ellipse
          cx={cx - R * 0.28}
          cy={cy - R * 0.32}
          rx={R * 0.28}
          ry={R * 0.18}
          fill="white"
          opacity={0.06}
        />
      </svg>

      {/* Orbiting particles */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {PARTICLES.map((p, i) => {
          const angle = ((p.angle + frame * p.speed) * Math.PI) / 180;
          const px = cx + Math.cos(angle) * p.radius;
          const py = cy + Math.sin(angle) * p.radius * 0.35;
          const depthFactor = 0.5 + 0.5 * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={px}
              cy={py}
              r={p.size * depthFactor}
              fill="#0088ff"
              opacity={p.opacity * depthFactor}
            />
          );
        })}
      </svg>

      {/* Connection arcs between dots */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} opacity={0.35}>
        {PRESENCE_DOTS.map((dot, i) => {
          const pairs = [[0, 1], [1, 2], [2, 13], [3, 4], [4, 14], [5, 6], [6, 7], [7, 8], [9, 8], [10, 11], [0, 10], [12, 0], [15, 7], [16, 17]];
          return pairs.map(([a, b], j) => {
            if (i !== a) return null;
            const from = latLonToXY(PRESENCE_DOTS[a].lat, PRESENCE_DOTS[a].lon, rotationDeg, R);
            const to = latLonToXY(PRESENCE_DOTS[b].lat, PRESENCE_DOTS[b].lon, rotationDeg, R);
            if (!from.visible || !to.visible) return null;
            const act = Math.min(dotActivation[a], dotActivation[b]);
            const midX = (cx + from.x + cx + to.x) / 2;
            const midY = (cy + from.y + cy + to.y) / 2 - 80;
            const arcProgress = interpolate(frame, [Math.max(a, b) * 18 + 50, Math.max(a, b) * 18 + 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <path
                key={j}
                d={`M${cx + from.x},${cy + from.y} Q${midX},${midY} ${cx + to.x},${cy + to.y}`}
                fill="none"
                stroke="#00aaff"
                strokeWidth="1.5"
                opacity={act * arcProgress * 0.6}
                strokeDasharray="8 6"
                strokeDashoffset={-frame * 1.5}
              />
            );
          });
        })}
      </svg>

      {/* Vignette overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width, height,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,8,0.7) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};