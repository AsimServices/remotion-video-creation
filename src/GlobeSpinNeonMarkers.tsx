import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CONTINENTS = [
  { name: 'North America', lat: 40, lon: -100, color: '#00ffff', delay: 30 },
  { name: 'South America', lat: -15, lon: -60, color: '#ff00ff', delay: 90 },
  { name: 'Europe', lat: 50, lon: 15, color: '#00ff88', delay: 150 },
  { name: 'Africa', lat: 0, lon: 20, color: '#ffaa00', delay: 210 },
  { name: 'Asia', lat: 40, lon: 90, color: '#ff4488', delay: 270 },
  { name: 'Australia', lat: -25, lon: 135, color: '#44aaff', delay: 330 },
  { name: 'Antarctica', lat: -80, lon: 0, color: '#aaffee', delay: 390 },
];

const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 1337 + 200) % 2160,
  size: ((i * 17) % 4) + 1,
  opacity: ((i * 13) % 60 + 40) / 100,
}));

const GRID_LINES_LAT = Array.from({ length: 13 }, (_, i) => -90 + i * 15);
const GRID_LINES_LON = Array.from({ length: 24 }, (_, i) => i * 15);

const LAND_SHAPES = [
  // North America - simplified polygon points (lat, lon)
  [[70,-140],[70,-60],[50,-55],[25,-80],[15,-90],[20,-105],[30,-115],[50,-125],[60,-140]],
  // South America
  [[10,-75],[10,-60],[0,-50],[-15,-35],[-55,-65],[-55,-70],[-40,-73],[-20,-70],[-5,-80]],
  // Europe
  [[71,28],[71,15],[60,5],[50,-5],[43,-9],[36,-5],[36,10],[45,15],[48,22],[55,25],[60,30]],
  // Africa
  [[37,10],[37,35],[22,38],[10,42],[0,42],[-10,40],[-35,20],[-35,15],[-10,15],[0,10],[10,10],[20,17],[30,32]],
  // Asia
  [[70,30],[70,180],[40,145],[35,140],[22,120],[10,105],[5,100],[15,80],[25,68],[40,55],[55,50],[65,60],[70,60]],
  // Australia
  [[-15,130],[-15,142],[-25,155],[-40,148],[-45,168],[-43,145],[-38,140],[-30,115],[-22,114],[-15,128]],
];

function latLonToXY(lat: number, lon: number, rotationY: number, cx: number, cy: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + rotationY) * (Math.PI / 180);
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return { x: cx + x, y: cy - y, z };
}

function isVisible(z: number) {
  return z >= 0;
}

export const GlobeSpinNeonMarkers: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.38;

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const rotationY = interpolate(frame, [0, durationInFrames], [0, 720]);

  // Atmosphere glow rings
  const atmosphereRings = Array.from({ length: 5 }, (_, i) => ({
    r: radius + 10 + i * 18,
    opacity: (0.15 - i * 0.025) * globalOpacity,
    color: '#004488',
  }));

  return (
    <div style={{ width, height, background: '#020408', overflow: 'hidden', position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Stars */}
        {STARS.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="white"
            opacity={star.opacity * globalOpacity}
          />
        ))}

        {/* Atmosphere rings */}
        {atmosphereRings.map((ring, i) => (
          <circle
            key={`atm-${i}`}
            cx={cx}
            cy={cy}
            r={ring.r}
            fill="none"
            stroke={ring.color}
            strokeWidth={16 - i * 2}
            opacity={ring.opacity}
          />
        ))}

        {/* Outer glow */}
        <defs>
          <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#001133" stopOpacity="1" />
            <stop offset="70%" stopColor="#000a22" stopOpacity="1" />
            <stop offset="100%" stopColor="#000408" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="globeHighlight" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#003366" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <clipPath id="globeClip">
            <circle cx={cx} cy={cy} r={radius} />
          </clipPath>
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="markerGlow">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Globe base */}
        <circle cx={cx} cy={cy} r={radius} fill="url(#globeGlow)" opacity={globalOpacity} />

        {/* Grid lines */}
        <g clipPath="url(#globeClip)" opacity={globalOpacity}>
          {/* Latitude lines */}
          {GRID_LINES_LAT.map((lat, li) => {
            const points: string[] = [];
            const steps = 72;
            for (let s = 0; s <= steps; s++) {
              const lon = -180 + s * (360 / steps);
              const pos = latLonToXY(lat, lon, rotationY, cx, cy, radius);
              if (pos.z >= -radius * 0.1) {
                points.push(`${pos.x},${pos.y}`);
              }
            }
            if (points.length < 2) return null;
            return (
              <polyline
                key={`lat-${li}`}
                points={points.join(' ')}
                fill="none"
                stroke="#0a3a6a"
                strokeWidth={lat === 0 ? 3 : 1.5}
                opacity={lat === 0 ? 0.6 : 0.3}
              />
            );
          })}

          {/* Longitude lines */}
          {GRID_LINES_LON.map((lon, li) => {
            const points: string[] = [];
            for (let lat = -90; lat <= 90; lat += 3) {
              const pos = latLonToXY(lat, lon, rotationY, cx, cy, radius);
              if (pos.z >= -radius * 0.1) {
                points.push(`${pos.x},${pos.y}`);
              }
            }
            if (points.length < 2) return null;
            return (
              <polyline
                key={`lon-${li}`}
                points={points.join(' ')}
                fill="none"
                stroke="#0a3a6a"
                strokeWidth={lon % 90 === 0 ? 3 : 1.5}
                opacity={lon % 90 === 0 ? 0.6 : 0.3}
              />
            );
          })}
        </g>

        {/* Land shapes */}
        <g clipPath="url(#globeClip)" opacity={globalOpacity}>
          {LAND_SHAPES.map((shape, si) => {
            const projectedPoints = shape.map(([lat, lon]) =>
              latLonToXY(lat, lon, rotationY, cx, cy, radius)
            );
            const allVisible = projectedPoints.filter(p => isVisible(p.z));
            if (allVisible.length < 3) return null;
            const pointsStr = projectedPoints
              .filter(p => isVisible(p.z))
              .map(p => `${p.x},${p.y}`)
              .join(' ');
            return (
              <polygon
                key={`land-${si}`}
                points={pointsStr}
                fill="#0d2a4a"
                stroke="#1a5a8a"
                strokeWidth={2}
                opacity={0.7}
              />
            );
          })}
        </g>

        {/* Highlight overlay */}
        <circle cx={cx} cy={cy} r={radius} fill="url(#globeHighlight)" opacity={globalOpacity * 0.6} />

        {/* Continent neon markers */}
        {CONTINENTS.map((continent, ci) => {
          if (frame < continent.delay) return null;
          const pos = latLonToXY(continent.lat, continent.lon, rotationY, cx, cy, radius);
          if (!isVisible(pos.z)) return null;

          const appearProgress = interpolate(frame, [continent.delay, continent.delay + 30], [0, 1], { extrapolateRight: 'clamp' });
          const pulsePhase = ((frame - continent.delay) * 0.05) % (Math.PI * 2);
          const pulseScale = 1 + Math.sin(pulsePhase) * 0.3;
          const ringOpacity = (0.5 + Math.sin(pulsePhase) * 0.3) * appearProgress * globalOpacity;
          const depthFade = interpolate(pos.z, [0, radius], [0.3, 1]);

          return (
            <g key={`marker-${ci}`} opacity={appearProgress * globalOpacity * depthFade}>
              {/* Outer pulse ring */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={40 * pulseScale}
                fill="none"
                stroke={continent.color}
                strokeWidth={2}
                opacity={ringOpacity * 0.5}
              />
              {/* Mid ring */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={25 * (1 + (1 - pulseScale) * 0.2)}
                fill="none"
                stroke={continent.color}
                strokeWidth={3}
                opacity={ringOpacity * 0.8}
              />
              {/* Core dot */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={10}
                fill={continent.color}
                opacity={globalOpacity}
                filter="url(#markerGlow)"
              />
              {/* Inner bright core */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={5}
                fill="white"
                opacity={0.9 * globalOpacity}
              />
              {/* Vertical neon spike */}
              <line
                x1={pos.x}
                y1={pos.y}
                x2={pos.x}
                y2={pos.y - 60 * appearProgress}
                stroke={continent.color}
                strokeWidth={2}
                opacity={0.7 * globalOpacity}
                filter="url(#neonGlow)"
              />
              {/* Top diamond */}
              <polygon
                points={`${pos.x},${pos.y - 70 * appearProgress} ${pos.x - 8},${pos.y - 58 * appearProgress} ${pos.x},${pos.y - 52 * appearProgress} ${pos.x + 8},${pos.y - 58 * appearProgress}`}
                fill={continent.color}
                opacity={0.9 * globalOpacity * appearProgress}
                filter="url(#neonGlow)"
              />
            </g>
          );
        })}

        {/* Globe edge darkening ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#000408"
          strokeWidth={30}
          opacity={globalOpacity * 0.8}
        />

        {/* Equator highlight */}
        <g clipPath="url(#globeClip)" opacity={globalOpacity * 0.4}>
          {(() => {
            const pts: string[] = [];
            for (let lon = -180; lon <= 180; lon += 2) {
              const pos = latLonToXY(0, lon, rotationY, cx, cy, radius);
              if (pos.z >= 0) pts.push(`${pos.x},${pos.y}`);
            }
            return pts.length > 1 ? (
              <polyline points={pts.join(' ')} fill="none" stroke="#00aaff" strokeWidth={3} />
            ) : null;
          })()}
        </g>

        {/* Scanning latitude line */}
        <g clipPath="url(#globeClip)" opacity={globalOpacity * 0.6}>
          {(() => {
            const scanLat = interpolate(frame % 180, [0, 180], [-60, 60]);
            const pts: string[] = [];
            for (let lon = -180; lon <= 180; lon += 2) {
              const pos = latLonToXY(scanLat, lon, rotationY, cx, cy, radius);
              if (pos.z >= 0) pts.push(`${pos.x},${pos.y}`);
            }
            return pts.length > 1 ? (
              <polyline
                points={pts.join(' ')}
                fill="none"
                stroke="#00ffaa"
                strokeWidth={2}
                opacity={0.4}
                filter="url(#neonGlow)"
              />
            ) : null;
          })()}
        </g>
      </svg>
    </div>
  );
};