import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Pre-computed star positions
const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 2731 + 17) % 3840,
  y: (i * 1337 + 53) % 2160,
  size: ((i * 13) % 4) + 1,
  opacity: ((i * 7) % 6) / 10 + 0.2,
}));

// Pre-computed arc/grid lines for globe
const LAT_LINES = Array.from({ length: 18 }, (_, i) => ({
  lat: -85 + i * 10,
}));

const LON_LINES = Array.from({ length: 36 }, (_, i) => ({
  lon: i * 10,
}));

// Simplified country polygon data (approximate, for visual effect)
// Each country: array of [lon, lat] pairs
const COUNTRIES: { name: string; color: string; path: [number, number][] }[] = [
  {
    name: 'france',
    color: '#00e5ff',
    path: [
      [2.5, 51.0], [-2.0, 48.5], [-4.5, 47.0], [-1.5, 46.0],
      [-1.8, 43.5], [3.0, 43.0], [7.5, 43.5], [7.0, 44.0],
      [6.5, 46.5], [8.0, 47.5], [7.5, 49.0], [6.0, 49.5],
      [4.5, 50.5], [2.5, 51.0],
    ],
  },
  {
    name: 'spain',
    color: '#ff6b35',
    path: [
      [-9.0, 42.0], [-8.5, 43.5], [-3.0, 43.5], [3.0, 43.0],
      [1.5, 41.0], [0.5, 39.5], [-0.5, 38.0], [-1.5, 37.0],
      [-5.0, 36.0], [-6.0, 37.0], [-9.0, 38.5], [-9.5, 39.5],
      [-9.0, 42.0],
    ],
  },
  {
    name: 'germany',
    color: '#b388ff',
    path: [
      [6.0, 51.0], [6.5, 52.0], [8.0, 53.5], [9.0, 54.5],
      [10.0, 55.0], [12.0, 54.5], [14.0, 54.0], [15.0, 51.5],
      [12.5, 50.5], [13.0, 48.5], [12.0, 47.5], [10.5, 47.5],
      [8.0, 47.5], [7.5, 49.0], [6.0, 51.0],
    ],
  },
  {
    name: 'italy',
    color: '#69f0ae',
    path: [
      [7.0, 44.0], [7.5, 43.5], [13.5, 43.5], [15.5, 41.0],
      [16.0, 41.5], [18.0, 40.5], [16.5, 38.0], [15.5, 38.0],
      [15.0, 37.5], [15.5, 37.0], [14.0, 37.5], [12.5, 37.0],
      [11.5, 38.0], [11.0, 42.5], [12.5, 44.0], [13.0, 45.5],
      [12.0, 47.5], [10.5, 47.5], [8.0, 47.5], [7.0, 44.0],
    ],
  },
  {
    name: 'uk',
    color: '#ff80ab',
    path: [
      [-5.5, 50.0], [-3.0, 49.5], [-0.5, 50.5], [1.5, 51.0],
      [1.0, 51.5], [-0.5, 51.5], [-1.0, 53.5], [-3.0, 54.5],
      [-5.0, 55.0], [-6.5, 56.5], [-5.0, 58.5], [-3.0, 58.5],
      [-1.5, 57.5], [-0.5, 56.0], [-2.0, 55.0], [-3.0, 53.5],
      [-2.0, 52.5], [-4.0, 51.5], [-5.5, 50.0],
    ],
  },
  {
    name: 'poland',
    color: '#ffd740',
    path: [
      [14.0, 54.0], [14.5, 54.5], [18.5, 54.5], [22.5, 54.5],
      [23.5, 54.0], [24.0, 54.5], [23.0, 56.0], [21.0, 57.0],
      [19.5, 57.0], [18.0, 56.5], [16.5, 54.5], [14.0, 54.0],
    ],
  },
  {
    name: 'ukraine',
    color: '#40c4ff',
    path: [
      [22.5, 48.5], [24.0, 47.5], [29.5, 46.0], [33.5, 46.5],
      [36.5, 47.5], [38.5, 47.5], [40.0, 48.5], [38.0, 49.5],
      [34.5, 51.0], [32.0, 52.5], [30.0, 51.5], [24.0, 52.5],
      [23.0, 52.5], [22.0, 51.0], [22.5, 48.5],
    ],
  },
  {
    name: 'sweden',
    color: '#ea80fc',
    path: [
      [11.0, 56.0], [12.5, 56.0], [14.0, 56.5], [16.0, 57.0],
      [18.0, 59.0], [18.5, 60.0], [18.5, 62.0], [17.5, 63.5],
      [18.0, 65.0], [17.0, 68.5], [18.0, 69.5], [20.0, 68.5],
      [22.0, 66.0], [24.0, 65.5], [24.0, 63.5], [23.0, 62.5],
      [21.0, 60.5], [19.0, 59.0], [17.5, 57.5], [16.0, 56.5],
      [14.5, 56.0], [13.0, 55.5], [11.0, 56.0],
    ],
  },
  {
    name: 'norway',
    color: '#ff6e40',
    path: [
      [5.0, 58.0], [7.5, 58.0], [10.0, 59.0], [11.0, 59.5],
      [11.0, 60.0], [12.0, 60.5], [13.5, 64.0], [15.0, 65.5],
      [16.0, 67.0], [17.0, 68.5], [18.0, 69.5], [20.0, 70.5],
      [22.5, 70.5], [25.0, 71.0], [28.0, 71.0], [30.0, 70.0],
      [29.0, 69.5], [26.5, 70.0], [24.0, 69.5], [22.0, 68.5],
      [20.0, 68.5], [18.0, 68.0], [16.5, 67.5], [14.5, 65.0],
      [13.5, 63.5], [14.5, 62.0], [13.5, 60.5], [12.5, 60.0],
      [11.5, 59.5], [10.5, 59.5], [9.5, 59.0], [8.5, 58.5],
      [7.0, 58.0], [5.0, 58.0],
    ],
  },
  {
    name: 'portugal',
    color: '#b9f6ca',
    path: [
      [-9.5, 42.0], [-8.0, 42.0], [-6.5, 41.5], [-6.5, 39.5],
      [-7.5, 37.5], [-9.0, 37.0], [-9.5, 38.0], [-9.0, 39.0],
      [-9.5, 39.5], [-9.5, 42.0],
    ],
  },
  {
    name: 'romania',
    color: '#ffcc00',
    path: [
      [22.0, 48.5], [24.0, 47.5], [26.5, 48.5], [29.5, 46.0],
      [30.0, 45.5], [29.5, 45.0], [28.5, 45.5], [27.0, 45.0],
      [26.0, 44.5], [25.0, 43.5], [23.0, 44.0], [22.0, 44.0],
      [21.0, 45.5], [20.5, 46.5], [22.0, 48.5],
    ],
  },
];

// Globe parameters
const GLOBE_CENTER_LON = 15; // Center of Europe (longitude)
const GLOBE_CENTER_LAT = 50; // Center of Europe (latitude)

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function projectPoint(
  lon: number,
  lat: number,
  rotX: number,
  rotY: number,
  cx: number,
  cy: number,
  radius: number
): { x: number; y: number; visible: boolean } {
  const phi = toRad(lat);
  const theta = toRad(lon);

  let x = Math.cos(phi) * Math.cos(theta);
  let y = Math.sin(phi);
  let z = Math.cos(phi) * Math.sin(theta);

  // Rotate around Y axis
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x1 = x * cosY - z * sinY;
  const z1 = x * sinY + z * cosY;
  x = x1;
  z = z1;

  // Rotate around X axis
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const y2 = y * cosX - z * sinX;
  const z2 = y * sinX + z * cosX;
  y = y2;
  z = z2;

  const visible = z > 0;
  const px = cx + x * radius;
  const py = cy - y * radius;
  return { x: px, y: py, visible };
}

function buildPath(
  points: [number, number][],
  rotX: number,
  rotY: number,
  cx: number,
  cy: number,
  radius: number
): string {
  let d = '';
  let first = true;
  for (const [lon, lat] of points) {
    const p = projectPoint(lon, lat, rotX, rotY, cx, cy, radius);
    if (!p.visible) {
      first = true;
      continue;
    }
    if (first) {
      d += `M ${p.x} ${p.y}`;
      first = false;
    } else {
      d += ` L ${p.x} ${p.y}`;
    }
  }
  return d;
}

function buildLatLinePath(
  lat: number,
  rotX: number,
  rotY: number,
  cx: number,
  cy: number,
  radius: number
): string {
  const steps = 72;
  let d = '';
  let first = true;
  for (let i = 0; i <= steps; i++) {
    const lon = -180 + (i * 360) / steps;
    const p = projectPoint(lon, lat, rotX, rotY, cx, cy, radius);
    if (!p.visible) {
      first = true;
      continue;
    }
    if (first) {
      d += `M ${p.x} ${p.y}`;
      first = false;
    } else {
      d += ` L ${p.x} ${p.y}`;
    }
  }
  return d;
}

function buildLonLinePath(
  lon: number,
  rotX: number,
  rotY: number,
  cx: number,
  cy: number,
  radius: number
): string {
  const steps = 36;
  let d = '';
  let first = true;
  for (let i = 0; i <= steps; i++) {
    const lat = -90 + (i * 180) / steps;
    const p = projectPoint(lon, lat, rotX, rotY, cx, cy, radius);
    if (!p.visible) {
      first = true;
      continue;
    }
    if (first) {
      d += `M ${p.x} ${p.y}`;
      first = false;
    } else {
      d += ` L ${p.x} ${p.y}`;
    }
  }
  return d;
}

export const GlobeEuropeZoom: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  // Phase 1: Globe spins fast (0-200), Phase 2: slows and zooms to Europe (200-450), Phase 3: hold (450-600)
  const spinPhase = interpolate(frame, [0, 200], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const slowPhase = interpolate(frame, [200, 420], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Fast rotation
  const fastRotY = interpolate(frame, [0, 200], [0, Math.PI * 4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Slow rotation ending at Europe center
  const targetRotY = -toRad(GLOBE_CENTER_LON);
  const slowRotY = interpolate(slowPhase, [0, 1], [fastRotY, targetRotY], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const rotY = frame < 200 ? fastRotY : slowRotY;

  const targetRotX = -toRad(GLOBE_CENTER_LAT - 10);
  const rotX = interpolate(frame, [0, 420], [0, targetRotX], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Zoom: globe radius grows
  const baseRadius = Math.min(width, height) * 0.38;
  const zoomedRadius = Math.min(width, height) * 1.4;
  const radius = interpolate(frame, [200, 450], [baseRadius, zoomedRadius], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Globe center: starts center, moves slightly
  const cx = width / 2;
  const cy = height / 2;

  // Country glow intensity
  const glowIntensity = interpolate(frame, [300, 420], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Pulse effect for country borders
  const pulse = 0.7 + 0.3 * Math.sin(frame * 0.15);

  // Grid opacity fades out as we zoom in
  const gridOpacity = interpolate(frame, [300, 450], [0.15, 0.04], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at center, #0a0f1e 0%, #020408 100%)',
        position: 'relative',
        overflow: 'hidden',
        opacity,
      }}
    >
      {/* Stars */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {STARS.map((star, i) => (
          <circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="white"
            opacity={star.opacity * (0.5 + 0.5 * Math.sin(frame * 0.02 + i))}
          />
        ))}
      </svg>

      {/* Globe */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <radialGradient id="globeGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#1a2a4a" />
            <stop offset="60%" stopColor="#0d1a30" />
            <stop offset="100%" stopColor="#020810" />
          </radialGradient>
          <radialGradient id="atmosphereGrad" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="transparent" />
            <stop offset="90%" stopColor="#00aaff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0055ff" stopOpacity="0.18" />
          </radialGradient>
          <filter id="glow1">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="30" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="globeClip">
            <circle cx={cx} cy={cy} r={radius} />
          </clipPath>
        </defs>

        {/* Globe base */}
        <circle cx={cx} cy={cy} r={radius} fill="url(#globeGrad)" />

        {/* Atmosphere glow */}
        <circle cx={cx} cy={cy} r={radius * 1.03} fill="url(#atmosphereGrad)" />
        <circle
          cx={cx}
          cy={cy}
          r={radius * 1.05}
          fill="none"
          stroke="#1155ff"
          strokeWidth={radius * 0.025}
          opacity={0.25}
        />

        {/* Grid lines */}
        <g clipPath="url(#globeClip)" opacity={gridOpacity}>
          {LAT_LINES.map((line, i) => (
            <path
              key={`lat-${i}`}
              d={buildLatLinePath(line.lat, rotX, rotY, cx, cy, radius)}
              fill="none"
              stroke="#3399ff"
              strokeWidth={1.5}
            />
          ))}
          {LON_LINES.map((line, i) => (
            <path
              key={`lon-${i}`}
              d={buildLonLinePath(line.lon, rotX, rotY, cx, cy, radius)}
              fill="none"
              stroke="#3399ff"
              strokeWidth={1.5}
            />
          ))}
        </g>

        {/* Country fills (subtle) */}
        <g clipPath="url(#globeClip)">
          {COUNTRIES.map((country, i) => {
            const d = buildPath(country.path, rotX, rotY, cx, cy, radius);
            return (
              <path
                key={`fill-${i}`}
                d={d}
                fill={country.color}
                opacity={glowIntensity * 0.08}
              />
            );
          })}
        </g>

        {/* Country borders with glow */}
        <g clipPath="url(#globeClip)" filter="url(#glow1)">
          {COUNTRIES.map((country, i) => {
            const d = buildPath(country.path, rotX, rotY, cx, cy, radius);
            return (
              <path
                key={`glow-${i}`}
                d={d}
                fill="none"
                stroke={country.color}
                strokeWidth={radius * 0.006}
                opacity={glowIntensity * pulse * 0.6}
                strokeLinejoin="round"
              />
            );
          })}
        </g>

        {/* Country borders sharp */}
        <g clipPath="url(#globeClip)">
          {COUNTRIES.map((country, i) => {
            const d = buildPath(country.path, rotX, rotY, cx, cy, radius);
            return (
              <path
                key={`sharp-${i}`}
                d={d}
                fill="none"
                stroke={country.color}
                strokeWidth={radius * 0.003}
                opacity={glowIntensity * pulse}
                strokeLinejoin="round"
              />
            );
          })}
        </g>

        {/* Outer glow ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius * 1.01}
          fill="none"
          stroke="#00aaff"
          strokeWidth={radius * 0.008}
          opacity={0.15 + 0.05 * Math.sin(frame * 0.08)}
          filter="url(#glow2)"
        />

        {/* Specular highlight */}
        <ellipse
          cx={cx - radius * 0.3}
          cy={cy - radius * 0.3}
          rx={radius * 0.2}
          ry={radius * 0.13}
          fill="white"
          opacity={0.04}
        />
      </svg>

      {/* Scanning line effect during rotation */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(
            ${(frame * 4) % 360}deg,
            transparent 45%,
            rgba(0, 170, 255, ${interpolate(frame, [0, 200], [0.04, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}) 50%,
            transparent 55%
          )`,
          pointerEvents: 'none',
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};