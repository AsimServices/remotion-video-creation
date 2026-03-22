import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Pre-computed city nodes for Asia Pacific region
const CITIES = [
  { name: 'Tokyo', lon: 139.6917, lat: 35.6895, size: 18 },
  { name: 'Seoul', lon: 126.9780, lat: 37.5665, size: 15 },
  { name: 'Beijing', lon: 116.4074, lat: 39.9042, size: 17 },
  { name: 'Shanghai', lon: 121.4737, lat: 31.2304, size: 16 },
  { name: 'Hong Kong', lon: 114.1694, lat: 22.3193, size: 13 },
  { name: 'Singapore', lon: 103.8198, lat: 1.3521, size: 14 },
  { name: 'Sydney', lon: 151.2093, lat: -33.8688, size: 15 },
  { name: 'Mumbai', lon: 72.8777, lat: 19.0760, size: 14 },
  { name: 'Bangkok', lon: 100.5018, lat: 13.7563, size: 12 },
  { name: 'Jakarta', lon: 106.8456, lat: -6.2088, size: 13 },
  { name: 'Kuala Lumpur', lon: 101.6869, lat: 3.1390, size: 11 },
  { name: 'Manila', lon: 120.9842, lat: 14.5995, size: 11 },
  { name: 'Taipei', lon: 121.5654, lat: 25.0330, size: 12 },
  { name: 'Osaka', lon: 135.5023, lat: 34.6937, size: 13 },
  { name: 'Shenzhen', lon: 114.0596, lat: 22.5431, size: 12 },
  { name: 'Guangzhou', lon: 113.2644, lat: 23.1291, size: 12 },
  { name: 'Chengdu', lon: 104.0665, lat: 30.5728, size: 10 },
  { name: 'Auckland', lon: 174.7633, lat: -36.8485, size: 9 },
  { name: 'Melbourne', lon: 144.9631, lat: -37.8136, size: 12 },
  { name: 'Bangalore', lon: 77.5946, lat: 12.9716, size: 11 },
  { name: 'Delhi', lon: 77.1025, lat: 28.7041, size: 15 },
  { name: 'Hanoi', lon: 105.8412, lat: 21.0278, size: 10 },
  { name: 'Ho Chi Minh', lon: 106.6297, lat: 10.8231, size: 11 },
  { name: 'Colombo', lon: 79.8612, lat: 6.9271, size: 8 },
  { name: 'Dhaka', lon: 90.4125, lat: 23.8103, size: 10 },
];

// Coastline path data approximating Asia Pacific landmasses (simplified polygons)
const LANDMASSES = [
  // Japan main islands
  [
    [130.0, 31.0], [131.0, 31.5], [132.0, 33.5], [133.0, 34.0], [134.5, 35.0],
    [136.0, 36.0], [137.5, 37.0], [139.0, 37.5], [140.5, 38.0], [141.5, 39.5],
    [141.5, 41.0], [140.5, 41.5], [139.5, 40.5], [138.0, 38.5], [136.5, 37.0],
    [135.0, 35.5], [133.0, 34.5], [131.0, 33.0], [130.0, 31.0],
  ],
  // Korean Peninsula
  [
    [124.5, 37.5], [126.0, 38.5], [127.5, 38.5], [129.0, 37.5], [129.5, 36.0],
    [129.0, 35.0], [128.0, 34.5], [127.0, 34.5], [126.0, 35.0], [125.5, 36.0],
    [124.5, 37.5],
  ],
  // China mainland (simplified)
  [
    [73.5, 39.5], [80.0, 42.0], [87.0, 49.0], [95.0, 52.0], [100.0, 50.0],
    [110.0, 53.0], [120.0, 53.0], [130.0, 47.0], [135.0, 48.5], [134.0, 45.0],
    [131.0, 42.0], [129.0, 42.5], [126.0, 41.5], [122.5, 40.0], [121.5, 38.0],
    [120.0, 36.5], [119.0, 34.0], [121.0, 30.0], [121.5, 28.0], [120.0, 26.0],
    [118.0, 24.0], [116.0, 22.5], [113.0, 22.0], [110.0, 20.0], [108.0, 21.0],
    [106.0, 22.0], [103.0, 22.5], [100.0, 22.0], [98.0, 24.0], [97.0, 27.0],
    [96.0, 28.0], [92.0, 27.5], [88.0, 28.0], [84.0, 28.5], [80.0, 32.0],
    [78.5, 34.0], [76.0, 37.0], [73.5, 39.5],
  ],
  // Southeast Asia peninsula
  [
    [98.0, 6.0], [100.0, 5.5], [103.0, 3.0], [104.0, 1.5], [103.5, 2.0],
    [102.0, 3.5], [100.5, 5.5], [99.0, 7.0], [98.5, 9.0], [99.0, 11.0],
    [100.0, 13.5], [101.5, 16.0], [102.5, 17.5], [103.0, 18.5], [104.5, 18.0],
    [105.0, 16.0], [108.0, 16.0], [109.0, 13.0], [109.5, 11.5], [107.5, 10.5],
    [106.0, 10.0], [104.5, 9.5], [103.0, 9.0], [101.0, 7.0], [99.5, 5.0],
    [98.0, 6.0],
  ],
  // Sumatra
  [
    [95.0, 5.5], [97.0, 4.0], [99.0, 3.0], [101.0, 2.0], [103.0, 1.0],
    [105.0, -1.5], [106.0, -4.0], [105.5, -5.5], [104.0, -5.0],
    [102.5, -3.0], [100.0, -0.5], [98.5, 2.0], [96.5, 3.5], [95.0, 5.5],
  ],
  // Java
  [
    [106.0, -6.0], [108.0, -6.5], [110.5, -6.5], [112.5, -7.0], [114.5, -7.5],
    [115.5, -8.0], [114.5, -8.5], [112.0, -8.0], [110.0, -7.8], [108.0, -7.5],
    [106.0, -6.0],
  ],
  // Philippines main
  [
    [117.0, 8.0], [118.5, 9.5], [119.5, 10.5], [120.5, 12.5], [122.0, 14.5],
    [123.5, 16.0], [124.0, 17.5], [122.5, 18.0], [121.0, 17.5], [119.5, 16.0],
    [118.0, 14.0], [117.5, 12.0], [117.0, 10.0], [117.0, 8.0],
  ],
  // Australia
  [
    [114.0, -22.0], [117.0, -20.5], [121.0, -19.5], [124.5, -17.5], [127.5, -14.0],
    [131.0, -12.0], [136.0, -12.0], [139.5, -17.0], [141.0, -18.0], [145.0, -19.0],
    [147.5, -20.5], [150.0, -22.5], [151.5, -24.0], [153.5, -27.5], [153.5, -30.0],
    [152.0, -33.0], [150.5, -35.5], [149.5, -37.5], [147.5, -38.5], [145.0, -38.5],
    [143.0, -38.5], [141.0, -38.5], [138.5, -36.0], [136.5, -35.5], [134.0, -33.0],
    [133.0, -32.5], [130.0, -32.0], [127.5, -32.0], [124.0, -34.0], [122.0, -34.0],
    [119.5, -34.0], [117.0, -33.5], [115.5, -31.0], [114.5, -28.5], [114.0, -26.0],
    [114.0, -22.0],
  ],
  // Indian subcontinent
  [
    [68.0, 23.5], [69.5, 22.5], [72.0, 22.0], [73.5, 20.0], [74.5, 17.5],
    [76.0, 15.0], [77.5, 12.0], [79.5, 10.0], [80.5, 8.5], [80.5, 7.0],
    [79.5, 7.5], [77.5, 8.0], [77.0, 9.5], [76.5, 11.5], [75.0, 13.0],
    [74.0, 14.5], [73.0, 16.0], [72.5, 18.0], [72.5, 20.0], [71.0, 21.0],
    [69.5, 22.0], [68.0, 23.5],
  ],
  // Sri Lanka
  [
    [79.5, 9.5], [80.5, 9.0], [81.5, 8.0], [81.5, 7.0], [80.5, 6.0],
    [79.5, 6.5], [79.0, 7.5], [79.5, 9.5],
  ],
  // Taiwan
  [
    [120.0, 22.0], [121.0, 22.5], [122.0, 24.0], [122.0, 25.0], [121.5, 25.5],
    [120.5, 25.0], [120.0, 23.5], [120.0, 22.0],
  ],
  // New Zealand North Island
  [
    [172.5, -34.5], [174.0, -35.5], [175.0, -37.0], [176.5, -38.0], [178.0, -38.5],
    [178.0, -39.5], [176.5, -40.5], [175.0, -41.0], [174.0, -40.5], [173.0, -39.0],
    [172.5, -37.0], [172.5, -34.5],
  ],
];

// Stars for background
const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 1337 + 200) % 2160,
  r: ((i * 97) % 4) + 0.5,
  opacity: ((i * 53) % 70 + 30) / 100,
}));

// Grid lines for globe
const LAT_LINES = [-60, -30, 0, 30, 60];
const LON_LINES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

// Connection edges between nearby cities
const CONNECTIONS = [
  [0, 13], // Tokyo - Osaka
  [0, 12], // Tokyo - Taipei
  [0, 1],  // Tokyo - Seoul
  [1, 2],  // Seoul - Beijing
  [2, 3],  // Beijing - Shanghai
  [3, 4],  // Shanghai - Hong Kong
  [4, 5],  // Hong Kong - Singapore
  [5, 9],  // Singapore - Jakarta
  [5, 10], // Singapore - KL
  [5, 7],  // Singapore - Mumbai
  [7, 19], // Mumbai - Bangalore
  [7, 20], // Mumbai - Delhi
  [3, 6],  // Shanghai - Sydney
  [6, 18], // Sydney - Melbourne
  [4, 14], // HK - Shenzhen
  [14, 15], // Shenzhen - Guangzhou
  [8, 21], // Bangkok - Hanoi
  [21, 22], // Hanoi - HCMC
  [11, 9], // Manila - Jakarta
  [12, 13], // Taipei - Osaka
];

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function project3D(lon: number, lat: number, rotY: number, rotX: number) {
  const phi = toRad(90 - lat);
  const theta = toRad(lon + rotY);
  const x = Math.sin(phi) * Math.cos(theta);
  const y = Math.cos(phi);
  const z = Math.sin(phi) * Math.sin(theta);
  // Apply slight X rotation for tilt
  const cosX = Math.cos(toRad(rotX));
  const sinX = Math.sin(toRad(rotX));
  const y2 = y * cosX - z * sinX;
  const z2 = y * sinX + z * cosX;
  return { x, y: y2, z: z2 };
}

function projectToScreen(
  lon: number,
  lat: number,
  rotY: number,
  rotX: number,
  cx: number,
  cy: number,
  radius: number,
) {
  const p = project3D(lon, lat, rotY, rotX);
  return {
    sx: cx + p.x * radius,
    sy: cy - p.y * radius,
    visible: p.z > -0.05,
    z: p.z,
  };
}

export const GlobeSpinAsiaPacific: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2;

  // Fade in/out
  const opacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Globe radius grows slightly as we zoom in
  const globeRadius = interpolate(
    frame,
    [0, durationInFrames * 0.4, durationInFrames],
    [700, 900, 1100],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Rotation: starts at 0 lon (Atlantic), spins east to center on Asia Pacific (~120 lon)
  // Total rotation from 0 to -120 (so Asia faces front)
  const rotY = interpolate(
    frame,
    [0, durationInFrames * 0.55, durationInFrames * 0.7, durationInFrames],
    [180, 0, -10, -10],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Slight vertical tilt
  const rotX = interpolate(
    frame,
    [0, durationInFrames * 0.5, durationInFrames],
    [-5, -15, -20],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Camera shift (pan) towards Asia
  const camX = interpolate(
    frame,
    [0, durationInFrames * 0.6, durationInFrames],
    [0, -80, -150],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const camY = interpolate(
    frame,
    [0, durationInFrames * 0.6, durationInFrames],
    [0, 50, 80],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const effectiveCX = cx + camX;
  const effectiveCY = cy + camY;

  // City light-up timing
  const cityLightStart = durationInFrames * 0.45;
  const cityLightDuration = durationInFrames * 0.35;

  // Atmosphere glow
  const atmosphereGlow = interpolate(
    frame,
    [0, durationInFrames * 0.4, durationInFrames],
    [0.3, 0.6, 0.8],
  );

  return (
    <div
      style={{
        width,
        height,
        background: '#020408',
        overflow: 'hidden',
        opacity,
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {/* Globe atmosphere gradient */}
          <radialGradient id="atmosphere" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#0a1628" stopOpacity="0" />
            <stop offset="70%" stopColor="#0d2444" stopOpacity={atmosphereGlow * 0.4} />
            <stop offset="90%" stopColor="#1a4a8a" stopOpacity={atmosphereGlow * 0.6} />
            <stop offset="100%" stopColor="#2255aa" stopOpacity={atmosphereGlow * 0.8} />
          </radialGradient>
          {/* Globe ocean gradient */}
          <radialGradient id="ocean" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#0d2444" />
            <stop offset="50%" stopColor="#071428" />
            <stop offset="100%" stopColor="#020810" />
          </radialGradient>
          {/* City glow filter */}
          <filter id="cityGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="8" result="blur1" />
            <feGaussianBlur stdDeviation="20" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Soft glow for connections */}
          <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Star glow */}
          <filter id="starGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Deep space gradient */}
          <radialGradient id="space" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#060d1a" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>
          {/* Globe clip */}
          <clipPath id="globeClip">
            <circle cx={effectiveCX} cy={effectiveCY} r={globeRadius} />
          </clipPath>
        </defs>

        {/* Deep space background */}
        <rect width={width} height={height} fill="url(#space)" />

        {/* Stars */}
        <g filter="url(#starGlow)">
          {STARS.map((star, i) => (
            <circle
              key={i}
              cx={star.x}
              cy={star.y}
              r={star.r}
              fill="white"
              opacity={star.opacity}
            />
          ))}
        </g>

        {/* Globe base sphere - ocean */}
        <circle
          cx={effectiveCX}
          cy={effectiveCY}
          r={globeRadius}
          fill="url(#ocean)"
        />

        {/* Globe grid lines (latitude) */}
        {LAT_LINES.map((lat) => {
          const points: string[] = [];
          for (let lonDeg = -180; lonDeg <= 180; lonDeg += 3) {
            const p = projectToScreen(lonDeg, lat, rotY, rotX, effectiveCX, effectiveCY, globeRadius);
            if (p.visible) {
              points.push(`${p.sx.toFixed(1)},${p.sy.toFixed(1)}`);
            }
          }
          return (
            <polyline
              key={`lat-${lat}`}
              points={points.join(' ')}
              fill="none"
              stroke="#1a3a6a"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              clipPath="url(#globeClip)"
            />
          );
        })}

        {/* Globe grid lines (longitude) */}
        {LON_LINES.map((lon) => {
          const points: string[] = [];
          for (let latDeg = -90; latDeg <= 90; latDeg += 3) {
            const p = projectToScreen(lon, latDeg, rotY, rotX, effectiveCX, effectiveCY, globeRadius);
            if (p.visible) {
              points.push(`${p.sx.toFixed(1)},${p.sy.toFixed(1)}`);
            }
          }
          return (
            <polyline
              key={`lon-${lon}`}
              points={points.join(' ')}
              fill="none"
              stroke="#1a3a6a"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              clipPath="url(#globeClip)"
            />
          );
        })}

        {/* Landmasses */}
        {LANDMASSES.map((coords, idx) => {
          const projected = coords.map(([lon, lat]) =>
            projectToScreen(lon, lat, rotY, rotX, effectiveCX, effectiveCY, globeRadius),
          );
          // Only render if majority of points are visible
          const visibleCount = projected.filter((p) => p.visible).length;
          if (visibleCount < projected.length * 0.3) return null;

          const pathParts: string[] = [];
          let penDown = false;
          projected.forEach((p, i) => {
            if (p.visible) {
              if (!penDown) {
                pathParts.push(`M ${p.sx.toFixed(1)} ${p.sy.toFixed(1)}`);
                penDown = true;
              } else {
                pathParts.push(`L ${p.sx.toFixed(1)} ${p.sy.toFixed(1)}`);
              }
            } else {
              penDown = false;
            }
          });
          if (pathParts.length < 2) return null;
          pathParts.push('Z');

          return (
            <path
              key={`land-${idx}`}
              d={pathParts.join(' ')}
              fill="#0f2a1a"
              stroke="#1e5a30"
              strokeWidth="2"
              strokeOpacity="0.8"
              fillOpacity="0.85"
              clipPath="url(#globeClip)"
            />
          );
        })}

        {/* City connection lines */}
        {CONNECTIONS.map(([a, b], idx) => {
          const cityA = CITIES[a];
          const cityB = CITIES[b];
          const pA = projectToScreen(cityA.lon, cityA.lat, rotY, rotX, effectiveCX, effectiveCY, globeRadius);
          const pB = projectToScreen(cityB.lon, cityB.lat, rotY, rotX, effectiveCX, effectiveCY, globeRadius);

          if (!pA.visible || !pB.visible) return null;

          const connectionAppear = interpolate(
            frame,
            [cityLightStart + idx * 8, cityLightStart + idx * 8 + 40, durationInFrames - 30, durationInFrames - 10],
            [0, 1, 1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
          );

          if (connectionAppear <= 0) return null;

          // Animated dash offset for data flow effect
          const dashOffset = interpolate(frame, [0, durationInFrames], [0, -200]);

          return (
            <g key={`conn-${idx}`} filter="url(#lineGlow)">
              {/* Base line */}
              <line
                x1={pA.sx}
                y1={pA.sy}
                x2={pB.sx}
                y2={pB.sy}
                stroke="#00aaff"
                strokeWidth="2"
                strokeOpacity={connectionAppear * 0.3}
                clipPath="url(#globeClip)"
              />
              {/* Animated data flow */}
              <line
                x1={pA.sx}
                y1={pA.sy}
                x2={pB.sx}
                y2={pB.sy}
                stroke="#44ddff"
                strokeWidth="3"
                strokeOpacity={connectionAppear * 0.7}
                strokeDasharray="20 40"
                strokeDashoffset={dashOffset}
                clipPath="url(#globeClip)"
              />
            </g>
          );
        })}

        {/* City nodes */}
        {CITIES.map((city, idx) => {
          const p = projectToScreen(city.lon, city.lat, rotY, rotX, effectiveCX, effectiveCY, globeRadius);
          if (!p.visible) return null;

          const lightDelay = cityLightStart + idx * 12;
          const cityOpacity = interpolate(
            frame,
            [lightDelay, lightDelay + 30, durationInFrames - 30, durationInFrames - 10],
            [0, 1, 1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
          );

          if (cityOpacity <= 0) return null;

          // Pulsing effect
          const pulse = interpolate(
            frame % 60,
            [0, 30, 60],
            [0.8, 1.2, 0.8],
          );

          const baseSize = city.size * (globeRadius / 900);
          const pulseSize = baseSize * pulse;

          return (
            <g key={`city-${idx}`} clipPath="url(#globeClip)">
              {/* Outer glow ring */}
              <circle
                cx={p.sx}
                cy={p.sy}
                r={pulseSize * 3.5}
                fill="none"
                stroke="#00ccff"
                strokeWidth="2"
                strokeOpacity={cityOpacity * 0.2 * pulse}
                filter="url(#cityGlow)"
              />
              {/* Middle glow ring */}
              <circle
                cx={p.sx}
                cy={p.sy}
                r={pulseSize * 2.2}
                fill="rgba(0, 180, 255, 0.1)"
                stroke="#00aaff"
                strokeWidth="2.5"
                strokeOpacity={cityOpacity * 0.5}
                filter="url(#cityGlow)"
              />
              {/* Core dot */}
              <circle
                cx={p.sx}
                cy={p.sy}
                r={baseSize}
                fill="#80eeff"
                opacity={cityOpacity}
                filter="url(#cityGlow)"
              />
              {/* Bright center */}
              <circle
                cx={p.sx}
                cy={p.sy}
                r={baseSize * 0.5}
                fill="white"
                opacity={cityOpacity * 0.9}
              />
            </g>
          );
        })}

        {/* Globe atmosphere overlay */}
        <circle
          cx={effectiveCX}
          cy={effectiveCY}
          r={globeRadius}
          fill="url(#atmosphere)"
          opacity={0.9}
        />

        {/* Globe edge highlight (limb) */}
        <circle
          cx={effectiveCX}
          cy={effectiveCY}
          r={globeRadius}
          fill="none"
          stroke="#3399cc"
          strokeWidth="3"
          strokeOpacity="0.5"
        />

        {/* Specular highlight */}
        <ellipse
          cx={effectiveCX - globeRadius * 0.3}
          cy={effectiveCY - globeRadius * 0.3}
          rx={globeRadius * 0.25}
          ry={globeRadius * 0.18}
          fill="white"
          opacity="0.04"
        />
      </svg>
    </div>
  );
};