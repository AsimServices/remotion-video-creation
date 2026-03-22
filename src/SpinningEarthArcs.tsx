import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { name: 'New York', lat: 40.7, lng: -74.0 },
  { name: 'London', lat: 51.5, lng: -0.1 },
  { name: 'Tokyo', lat: 35.7, lng: 139.7 },
  { name: 'Sydney', lat: -33.9, lng: 151.2 },
  { name: 'Dubai', lat: 25.2, lng: 55.3 },
  { name: 'Paris', lat: 48.9, lng: 2.3 },
  { name: 'Singapore', lat: 1.3, lng: 103.8 },
  { name: 'Mumbai', lat: 19.1, lng: 72.9 },
  { name: 'São Paulo', lat: -23.5, lng: -46.6 },
  { name: 'Lagos', lat: 6.5, lng: 3.4 },
  { name: 'Moscow', lat: 55.8, lng: 37.6 },
  { name: 'Beijing', lat: 39.9, lng: 116.4 },
  { name: 'Cairo', lat: 30.0, lng: 31.2 },
  { name: 'Toronto', lat: 43.7, lng: -79.4 },
  { name: 'Seoul', lat: 37.6, lng: 126.9 },
];

const ARC_CONNECTIONS = Array.from({ length: 24 }, (_, i) => ({
  from: (i * 7) % CITIES.length,
  to: (i * 11 + 3) % CITIES.length,
  delay: (i * 23) % 180,
  duration: 60 + (i * 13) % 60,
  color: i % 3 === 0 ? '#00f5ff' : i % 3 === 1 ? '#ff6b35' : '#a855f7',
  speed: 0.8 + (i % 5) * 0.12,
}));

const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 1337 + 200) % 2160,
  size: ((i * 7) % 4) + 1,
  opacity: 0.3 + ((i * 3) % 7) * 0.1,
}));

const GRID_LINES_LAT = Array.from({ length: 13 }, (_, i) => -90 + i * 15);
const GRID_LINES_LNG = Array.from({ length: 25 }, (_, i) => -180 + i * 15);

function latLngToXY(lat: number, lng: number, rotation: number, cx: number, cy: number, r: number) {
  const phi = (lat * Math.PI) / 180;
  const lambda = ((lng + rotation) * Math.PI) / 180;
  const cosLat = Math.cos(phi);
  const x = cx + r * cosLat * Math.sin(lambda);
  const y = cy - r * Math.sin(phi);
  const z = cosLat * Math.cos(lambda);
  return { x, y, z, visible: z > 0 };
}

function getArcPoints(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  rotation: number, cx: number, cy: number, r: number,
  progress: number
): { points: Array<{ x: number; y: number; z: number; visible: boolean }>; anyVisible: boolean } {
  const steps = 60;
  const points = [];
  let anyVisible = false;
  for (let i = 0; i <= steps * progress; i++) {
    const t = i / steps;
    const lat = lat1 + (lat2 - lat1) * t;
    const lng = lat1 + (lng2 - lng1) * t;
    const arcLat = lat1 + (lat2 - lat1) * t;
    const arcLng = lng1 + (lng2 - lng1) * t;
    const p = latLngToXY(arcLat, arcLng, rotation, cx, cy, r);
    if (p.visible) anyVisible = true;
    points.push(p);
  }
  return { points, anyVisible };
}

function buildPathD(points: Array<{ x: number; y: number; z: number; visible: boolean }>): string {
  let d = '';
  let drawing = false;
  for (const p of points) {
    if (p.visible) {
      if (!drawing) { d += `M ${p.x} ${p.y} `; drawing = true; }
      else { d += `L ${p.x} ${p.y} `; }
    } else {
      drawing = false;
    }
  }
  return d;
}

export const SpinningEarthArcs: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.38;

  const rotation = (frame * 0.25) % 360;

  // Draw globe grid
  const gridPaths: string[] = [];

  // Latitude lines
  for (const lat of GRID_LINES_LAT) {
    let d = '';
    let started = false;
    for (let lngStep = -180; lngStep <= 180; lngStep += 3) {
      const p = latLngToXY(lat, lngStep, rotation, cx, cy, r);
      if (p.visible) {
        if (!started) { d += `M ${p.x} ${p.y} `; started = true; }
        else { d += `L ${p.x} ${p.y} `; }
      } else {
        started = false;
      }
    }
    gridPaths.push(d);
  }

  // Longitude lines
  for (const lng of GRID_LINES_LNG) {
    let d = '';
    let started = false;
    for (let latStep = -90; latStep <= 90; latStep += 3) {
      const p = latLngToXY(latStep, lng, rotation, cx, cy, r);
      if (p.visible) {
        if (!started) { d += `M ${p.x} ${p.y} `; started = true; }
        else { d += `L ${p.x} ${p.y} `; }
      } else {
        started = false;
      }
    }
    gridPaths.push(d);
  }

  // City positions
  const cityPositions = CITIES.map(c => latLngToXY(c.lat, c.lng, rotation, cx, cy, r));

  // Arc data
  const arcData = ARC_CONNECTIONS.map(arc => {
    const localFrame = frame - arc.delay;
    if (localFrame < 0) return null;
    const cycle = localFrame % (arc.duration + 30);
    const progress = Math.min(cycle / arc.duration, 1);
    const fadeProgress = cycle > arc.duration ? 1 - (cycle - arc.duration) / 30 : 1;
    if (fadeProgress <= 0) return null;

    const fromCity = CITIES[arc.from];
    const toCity = CITIES[arc.to];

    const steps = 80;
    const points: Array<{ x: number; y: number; z: number; visible: boolean }> = [];
    let anyVisible = false;

    for (let i = 0; i <= steps * progress; i++) {
      const t = i / steps;
      const arcLat = fromCity.lat + (toCity.lat - fromCity.lat) * t;
      const arcLng = fromCity.lng + (toCity.lng - fromCity.lng) * t;
      const p = latLngToXY(arcLat, arcLng, rotation, cx, cy, r);
      if (p.visible) anyVisible = true;
      points.push(p);
    }

    if (!anyVisible) return null;

    const d = buildPathD(points);
    return { d, color: arc.color, fadeProgress, progress };
  });

  // Glow layers for globe
  const glowLayers = [
    { r: r * 1.08, opacity: 0.08, color: '#1a6fff' },
    { r: r * 1.04, opacity: 0.12, color: '#2a7fff' },
    { r: r * 1.01, opacity: 0.15, color: '#4a8fff' },
  ];

  return (
    <div style={{ width, height, background: '#020408', position: 'relative', overflow: 'hidden', opacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="globeGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#0d2a5e" />
            <stop offset="40%" stopColor="#071a3a" />
            <stop offset="100%" stopColor="#020810" />
          </radialGradient>
          <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a4fff" stopOpacity="0" />
            <stop offset="70%" stopColor="#1a4fff" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#1a4fff" stopOpacity="0.18" />
          </radialGradient>
          <filter id="arcGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="cityGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="starGlow">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
          <clipPath id="globeClip">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>

        {/* Stars */}
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.size}
            fill="white"
            opacity={s.opacity}
          />
        ))}

        {/* Globe atmosphere glow */}
        {glowLayers.map((gl, i) => (
          <circle key={i} cx={cx} cy={cy} r={gl.r} fill="none" stroke={gl.color} strokeWidth={r * 0.04} opacity={gl.opacity} />
        ))}

        {/* Globe base */}
        <circle cx={cx} cy={cy} r={r} fill="url(#globeGrad)" />
        <circle cx={cx} cy={cy} r={r} fill="url(#globeGlow)" />

        {/* Grid lines */}
        <g clipPath="url(#globeClip)">
          {gridPaths.map((d, i) => (
            <path
              key={i}
              d={d}
              stroke="#1e4a8f"
              strokeWidth="1.5"
              fill="none"
              opacity={0.35}
            />
          ))}
        </g>

        {/* Data arcs */}
        <g clipPath="url(#globeClip)" filter="url(#arcGlow)">
          {arcData.map((arc, i) => {
            if (!arc) return null;
            return (
              <g key={i}>
                <path
                  d={arc.d}
                  stroke={arc.color}
                  strokeWidth={5}
                  fill="none"
                  opacity={arc.fadeProgress * 0.4}
                  strokeLinecap="round"
                />
                <path
                  d={arc.d}
                  stroke={arc.color}
                  strokeWidth={2.5}
                  fill="none"
                  opacity={arc.fadeProgress * 0.9}
                  strokeLinecap="round"
                />
                <path
                  d={arc.d}
                  stroke="white"
                  strokeWidth={1}
                  fill="none"
                  opacity={arc.fadeProgress * 0.6}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </g>

        {/* Globe rim highlight */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#4a8fff"
          strokeWidth="2"
          opacity={0.5}
        />

        {/* City dots */}
        {cityPositions.map((pos, i) => {
          if (!pos.visible) return null;
          const pulse = Math.sin((frame * 0.1 + i * 0.7)) * 0.5 + 0.5;
          const baseSize = 10;
          const pulseSize = baseSize + pulse * 8;
          return (
            <g key={i} filter="url(#cityGlow)">
              <circle cx={pos.x} cy={pos.y} r={pulseSize} fill={i % 3 === 0 ? '#00f5ff' : i % 3 === 1 ? '#ff6b35' : '#a855f7'} opacity={0.15 + pulse * 0.1} />
              <circle cx={pos.x} cy={pos.y} r={baseSize * 0.6} fill={i % 3 === 0 ? '#00f5ff' : i % 3 === 1 ? '#ff6b35' : '#a855f7'} opacity={0.8} />
              <circle cx={pos.x} cy={pos.y} r={3} fill="white" opacity={0.95} />
            </g>
          );
        })}

        {/* Globe specular highlight */}
        <ellipse
          cx={cx - r * 0.25}
          cy={cy - r * 0.3}
          rx={r * 0.3}
          ry={r * 0.18}
          fill="white"
          opacity={0.04}
        />
      </svg>
    </div>
  );
};