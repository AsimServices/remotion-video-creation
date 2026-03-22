import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NUM_CITIES = 24;
const NUM_ARCS = 18;
const NUM_GRID_LAT = 12;
const NUM_GRID_LON = 18;
const NUM_STARS = 200;

const CITIES = Array.from({ length: NUM_CITIES }, (_, i) => {
  const lat = ((i * 137.508) % 140) - 70;
  const lon = (i * 97.3) % 360;
  return { lat, lon, size: ((i * 7) % 4) + 3 };
});

const ARCS = Array.from({ length: NUM_ARCS }, (_, i) => {
  const fromIdx = (i * 3) % NUM_CITIES;
  const toIdx = (i * 7 + 5) % NUM_CITIES;
  const phase = (i * 0.41) % 1;
  return { fromIdx, toIdx, phase };
});

const STARS = Array.from({ length: NUM_STARS }, (_, i) => ({
  x: (i * 1731 + 200) % 3840,
  y: (i * 1337 + 100) % 2160,
  size: ((i * 3) % 3) + 1,
  brightness: ((i * 17) % 60) + 40,
}));

function latLonToXYZ(lat: number, lon: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = lon * (Math.PI / 180);
  const x = Math.sin(phi) * Math.cos(theta);
  const y = Math.cos(phi);
  const z = Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}

function rotateY(
  x: number,
  y: number,
  z: number,
  angle: number
): [number, number, number] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x * cos + z * sin, y, -x * sin + z * cos];
}

function rotateX(
  x: number,
  y: number,
  z: number,
  angle: number
): [number, number, number] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x, y * cos - z * sin, y * sin + z * cos];
}

function project(
  x: number,
  y: number,
  z: number,
  cx: number,
  cy: number,
  radius: number
): [number, number, number] {
  const scale = 1 / (1 + z * 0.3);
  return [cx + x * radius * scale, cy - y * radius * scale, z];
}

export const RotatingWireframeEarth: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
  });
  const opacity = Math.min(fadeIn, fadeOut);

  const rotY = (frame / durationInFrames) * Math.PI * 4;
  const rotX = Math.sin(frame * 0.008) * 0.3;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.38;

  const getProjected = (lat: number, lon: number) => {
    let [x, y, z] = latLonToXYZ(lat, lon);
    [x, y, z] = rotateX(x, y, z, rotX);
    [x, y, z] = rotateY(x, y, z, rotY);
    return project(x, y, z, cx, cy, radius);
  };

  const gridLines: JSX.Element[] = [];

  for (let i = 0; i < NUM_GRID_LAT; i++) {
    const lat = -80 + (i / (NUM_GRID_LAT - 1)) * 160;
    const points: [number, number, number][] = [];
    for (let j = 0; j <= 72; j++) {
      const lon = (j / 72) * 360;
      points.push(getProjected(lat, lon));
    }
    const segments: JSX.Element[] = [];
    for (let j = 0; j < points.length - 1; j++) {
      const [x1, y1, z1] = points[j];
      const [x2, y2, z2] = points[j + 1];
      if (z1 > -0.5 && z2 > -0.5) {
        const alpha = Math.max(0, (Math.min(z1, z2) + 0.5) / 1.5) * 0.35;
        segments.push(
          <line
            key={`lat-${i}-${j}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={`rgba(0,200,255,${alpha})`}
            strokeWidth={1.5}
          />
        );
      }
    }
    gridLines.push(<g key={`lat-line-${i}`}>{segments}</g>);
  }

  for (let i = 0; i < NUM_GRID_LON; i++) {
    const lon = (i / NUM_GRID_LON) * 360;
    const points: [number, number, number][] = [];
    for (let j = 0; j <= 60; j++) {
      const lat = -90 + (j / 60) * 180;
      points.push(getProjected(lat, lon));
    }
    const segments: JSX.Element[] = [];
    for (let j = 0; j < points.length - 1; j++) {
      const [x1, y1, z1] = points[j];
      const [x2, y2, z2] = points[j + 1];
      if (z1 > -0.5 && z2 > -0.5) {
        const alpha = Math.max(0, (Math.min(z1, z2) + 0.5) / 1.5) * 0.35;
        segments.push(
          <line
            key={`lon-${i}-${j}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={`rgba(0,180,255,${alpha})`}
            strokeWidth={1.5}
          />
        );
      }
    }
    gridLines.push(<g key={`lon-line-${i}`}>{segments}</g>);
  }

  const cityElements: JSX.Element[] = [];
  const projectedCities = CITIES.map((c) => {
    const [px, py, pz] = getProjected(c.lat, c.lon);
    return { px, py, pz, size: c.size };
  });

  projectedCities.forEach((city, i) => {
    if (city.pz < -0.3) return;
    const vis = Math.max(0, (city.pz + 0.3) / 1.3);
    const pulse = 0.7 + 0.3 * Math.sin(frame * 0.12 + i * 1.3);
    const glowR = city.size * 6 * pulse;
    cityElements.push(
      <g key={`city-${i}`}>
        <circle
          cx={city.px}
          cy={city.py}
          r={glowR}
          fill={`rgba(0,255,220,${0.08 * vis * pulse})`}
        />
        <circle
          cx={city.px}
          cy={city.py}
          r={glowR * 0.5}
          fill={`rgba(0,255,220,${0.15 * vis * pulse})`}
        />
        <circle
          cx={city.px}
          cy={city.py}
          r={city.size * pulse}
          fill={`rgba(0,255,220,${0.9 * vis})`}
          stroke={`rgba(150,255,255,${0.7 * vis})`}
          strokeWidth={1.5}
        />
      </g>
    );
  });

  const arcElements: JSX.Element[] = [];
  ARCS.forEach((arc, i) => {
    const from = projectedCities[arc.fromIdx];
    const to = projectedCities[arc.toIdx];
    if (from.pz < -0.1 || to.pz < -0.1) return;

    const visFrom = Math.max(0, (from.pz + 0.1) / 1.1);
    const visTo = Math.max(0, (to.pz + 0.1) / 1.1);
    const vis = visFrom * visTo;

    const animProgress = ((frame * 0.007 + arc.phase) % 1);
    const pulseAlpha = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.05 + i * 0.9));

    const mx = (from.px + to.px) / 2;
    const my = (from.py + to.py) / 2;
    const dx = to.px - from.px;
    const dy = to.py - from.py;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const arcHeight = -dist * 0.35;
    const cpx = mx - dy * 0.1;
    const cpy = my + arcHeight + dx * 0.05;

    arcElements.push(
      <g key={`arc-${i}`}>
        <path
          d={`M ${from.px} ${from.py} Q ${cpx} ${cpy} ${to.px} ${to.py}`}
          stroke={`rgba(0,220,255,${0.15 * vis})`}
          strokeWidth={2}
          fill="none"
        />
        <path
          d={`M ${from.px} ${from.py} Q ${cpx} ${cpy} ${to.px} ${to.py}`}
          stroke={`rgba(100,255,255,${0.5 * vis * pulseAlpha})`}
          strokeWidth={1}
          fill="none"
          strokeDasharray={`${dist * 0.15} ${dist * 2}`}
          strokeDashoffset={-dist * animProgress * 2.5}
        />
      </g>
    );
  });

  const globeGlowSize = radius * 1.1;

  return (
    <div
      style={{
        width,
        height,
        background: '#030810',
        overflow: 'hidden',
        opacity,
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,100,180,0.12)" />
            <stop offset="60%" stopColor="rgba(0,60,120,0.06)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,30,60,0.8)" />
            <stop offset="100%" stopColor="rgba(3,8,16,1)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width={width} height={height} fill="url(#bgGlow)" />

        {STARS.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill={`rgba(180,220,255,${star.brightness / 100})`}
            opacity={0.6 + 0.4 * Math.sin(frame * 0.02 + i * 0.5)}
          />
        ))}

        <circle
          cx={cx}
          cy={cy}
          r={globeGlowSize * 1.3}
          fill="url(#globeGlow)"
        />

        <circle
          cx={cx}
          cy={cy}
          r={radius * 1.01}
          fill="rgba(0,20,50,0.55)"
          stroke="rgba(0,150,255,0.15)"
          strokeWidth={2}
        />

        {gridLines}
        {arcElements}
        {cityElements}

        <circle
          cx={cx}
          cy={cy}
          r={radius * 1.01}
          fill="none"
          stroke="rgba(0,200,255,0.25)"
          strokeWidth={3}
          filter="url(#glow)"
        />

        <circle
          cx={cx}
          cy={cy}
          r={radius * 1.04}
          fill="none"
          stroke="rgba(0,150,255,0.08)"
          strokeWidth={12}
        />

        <ellipse
          cx={cx}
          cy={cy + radius * 0.1}
          rx={radius * 1.05}
          ry={radius * 0.2}
          fill="none"
          stroke="rgba(0,200,255,0.06)"
          strokeWidth={20}
          transform={`rotate(-15, ${cx}, ${cy})`}
        />
      </svg>
    </div>
  );
};