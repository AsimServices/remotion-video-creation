import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NUM_CITIES = 60;
const NUM_CONNECTIONS = 120;
const NUM_PARTICLES = 80;

const CITIES = Array.from({ length: NUM_CITIES }, (_, i) => {
  const lat = ((i * 137.508) % 160) - 80;
  const lng = ((i * 221.317) % 360) - 180;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const x = Math.cos(latRad) * Math.cos(lngRad);
  const y = Math.sin(latRad);
  const z = Math.cos(latRad) * Math.sin(lngRad);
  const size = (i % 5) + 2;
  const brightness = 0.5 + (i % 10) * 0.05;
  const colorIndex = i % 4;
  return { lat, lng, latRad, lngRad, x, y, z, size, brightness, colorIndex };
});

const CONNECTIONS = Array.from({ length: NUM_CONNECTIONS }, (_, i) => {
  const a = (i * 7) % NUM_CITIES;
  const b = (i * 13 + 5) % NUM_CITIES;
  const speed = 0.3 + (i % 7) * 0.1;
  const offset = (i * 17) % 100;
  const colorIndex = i % 4;
  return { a, b, speed, offset, colorIndex };
});

const PARTICLES = Array.from({ length: NUM_PARTICLES }, (_, i) => {
  const connIndex = i % NUM_CONNECTIONS;
  const phaseOffset = (i * 23) % 100;
  return { connIndex, phaseOffset };
});

const NEON_COLORS = [
  { r: 0, g: 255, b: 200 },
  { r: 100, g: 180, b: 255 },
  { r: 255, g: 80, b: 200 },
  { r: 80, g: 255, b: 100 },
];

const STAR_POSITIONS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 1337 + 200) % 2160,
  size: ((i * 3) % 3) + 0.5,
  opacity: 0.2 + (i % 8) * 0.1,
}));

function projectPoint(
  x: number, y: number, z: number,
  rotY: number, cx: number, cy: number, radius: number
) {
  const cosR = Math.cos(rotY);
  const sinR = Math.sin(rotY);
  const px = x * cosR - z * sinR;
  const pz = x * sinR + z * cosR;
  const py = y;
  const visible = pz > -0.2;
  const depth = (pz + 1) / 2;
  const sx = cx + px * radius;
  const sy = cy - py * radius;
  return { sx, sy, visible, depth, pz };
}

export const GlobeNeonNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const progress = frame / durationInFrames;
  const rotY = progress * Math.PI * 4;

  const zoomScale = interpolate(frame, [0, durationInFrames], [1, 1.6], { extrapolateRight: 'clamp' });
  const cx = width / 2;
  const cy = height / 2;
  const baseRadius = Math.min(width, height) * 0.32 * zoomScale;

  const projectedCities = CITIES.map(city => {
    const proj = projectPoint(city.x, city.y, city.z, rotY, cx, cy, baseRadius);
    return { ...city, ...proj };
  });

  return (
    <div style={{
      width,
      height,
      background: 'radial-gradient(ellipse at 50% 50%, #050a14 0%, #020408 100%)',
      overflow: 'hidden',
      position: 'relative',
      opacity,
    }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="globeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0a1a2e" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#050d1a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#020508" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="glowOuter" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="transparent" stopOpacity="0" />
            <stop offset="100%" stopColor="#00aaff" stopOpacity="0.08" />
          </radialGradient>
          <filter id="glow1" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur1" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowStrong" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowCity" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="8" result="blur3" />
            <feMerge>
              <feMergeNode in="blur3" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="atmosphereFilter" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="18" result="blur4" />
          </filter>
          <clipPath id="globeClip">
            <circle cx={cx} cy={cy} r={baseRadius} />
          </clipPath>
        </defs>

        {/* Stars */}
        {STAR_POSITIONS.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="white"
            opacity={star.opacity * 0.6}
          />
        ))}

        {/* Atmosphere glow */}
        <circle
          cx={cx}
          cy={cy}
          r={baseRadius * 1.12}
          fill="none"
          stroke="#00ccff"
          strokeWidth={baseRadius * 0.08}
          opacity={0.07}
          filter="url(#atmosphereFilter)"
        />
        <circle
          cx={cx}
          cy={cy}
          r={baseRadius * 1.06}
          fill="none"
          stroke="#0088ff"
          strokeWidth={baseRadius * 0.04}
          opacity={0.12}
          filter="url(#atmosphereFilter)"
        />

        {/* Globe base */}
        <circle
          cx={cx}
          cy={cy}
          r={baseRadius}
          fill="url(#globeGrad)"
        />
        <circle
          cx={cx}
          cy={cy}
          r={baseRadius}
          fill="url(#glowOuter)"
        />

        {/* Latitude lines */}
        {[-60, -30, 0, 30, 60].map((latDeg, li) => {
          const latR = (latDeg * Math.PI) / 180;
          const r = Math.cos(latR) * baseRadius;
          const yOff = -Math.sin(latR) * baseRadius;
          if (r < 1) return null;
          return (
            <ellipse
              key={`lat-${li}`}
              cx={cx}
              cy={cy + yOff}
              rx={r}
              ry={r * 0.15}
              fill="none"
              stroke="#0a3050"
              strokeWidth={0.8}
              opacity={0.4}
              clipPath="url(#globeClip)"
            />
          );
        })}

        {/* Longitude lines */}
        {Array.from({ length: 12 }, (_, li) => {
          const angle = (li / 12) * Math.PI + rotY;
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);
          const frontVisible = cosA > 0;
          return (
            <ellipse
              key={`lon-${li}`}
              cx={cx}
              cy={cy}
              rx={Math.abs(sinA) * baseRadius}
              ry={baseRadius}
              fill="none"
              stroke="#0a3050"
              strokeWidth={frontVisible ? 0.8 : 0.3}
              opacity={frontVisible ? 0.35 : 0.15}
              clipPath="url(#globeClip)"
            />
          );
        })}

        {/* Network connections (back) */}
        {CONNECTIONS.map((conn, i) => {
          const cityA = projectedCities[conn.a];
          const cityB = projectedCities[conn.b];
          if (!cityA.visible && !cityB.visible) return null;
          const avgDepth = (cityA.depth + cityB.depth) / 2;
          if (avgDepth < 0.4) return null;
          const col = NEON_COLORS[conn.colorIndex];
          const lineOpacity = Math.min(cityA.depth, cityB.depth) * 0.4 * avgDepth;
          const pulse = Math.sin((frame * 0.05 + conn.offset * 0.1) * conn.speed) * 0.5 + 0.5;
          return (
            <line
              key={`conn-${i}`}
              x1={cityA.sx}
              y1={cityA.sy}
              x2={cityB.sx}
              y2={cityB.sy}
              stroke={`rgba(${col.r},${col.g},${col.b},${lineOpacity * (0.6 + pulse * 0.4)})`}
              strokeWidth={0.6 + pulse * 0.4}
              filter="url(#glow1)"
            />
          );
        })}

        {/* Traveling particles on connections */}
        {PARTICLES.map((particle, i) => {
          const conn = CONNECTIONS[particle.connIndex];
          const cityA = projectedCities[conn.a];
          const cityB = projectedCities[conn.b];
          if (!cityA.visible || !cityB.visible) return null;
          const t = ((frame * conn.speed * 0.01 + particle.phaseOffset * 0.01) % 1 + 1) % 1;
          const px = cityA.sx + (cityB.sx - cityA.sx) * t;
          const py = cityA.sy + (cityB.sy - cityA.sy) * t;
          const col = NEON_COLORS[conn.colorIndex];
          const depth = cityA.depth + (cityB.depth - cityA.depth) * t;
          if (depth < 0.4) return null;
          return (
            <circle
              key={`particle-${i}`}
              cx={px}
              cy={py}
              r={3 * depth}
              fill={`rgba(${col.r},${col.g},${col.b},${0.9 * depth})`}
              filter="url(#glowStrong)"
            />
          );
        })}

        {/* City dots */}
        {projectedCities.map((city, i) => {
          if (!city.visible) return null;
          const col = NEON_COLORS[city.colorIndex];
          const scaledSize = (city.size + 1) * city.depth * zoomScale * 0.8;
          const pulse = Math.sin(frame * 0.08 + i * 0.5) * 0.3 + 0.7;
          const cityOpacity = city.depth * city.brightness * pulse;
          return (
            <g key={`city-${i}`}>
              <circle
                cx={city.sx}
                cy={city.sy}
                r={scaledSize * 3}
                fill={`rgba(${col.r},${col.g},${col.b},${cityOpacity * 0.15})`}
                filter="url(#glowCity)"
              />
              <circle
                cx={city.sx}
                cy={city.sy}
                r={scaledSize}
                fill={`rgba(${col.r},${col.g},${col.b},${cityOpacity})`}
                filter="url(#glowStrong)"
              />
              <circle
                cx={city.sx}
                cy={city.sy}
                r={scaledSize * 0.4}
                fill={`rgba(255,255,255,${cityOpacity * 0.8})`}
              />
            </g>
          );
        })}

        {/* Globe rim highlight */}
        <circle
          cx={cx}
          cy={cy}
          r={baseRadius}
          fill="none"
          stroke="rgba(0,200,255,0.2)"
          strokeWidth={2}
        />
        <circle
          cx={cx - baseRadius * 0.1}
          cy={cy - baseRadius * 0.1}
          r={baseRadius}
          fill="none"
          stroke="rgba(150,220,255,0.06)"
          strokeWidth={baseRadius * 0.06}
          clipPath="url(#globeClip)"
        />

        {/* Specular highlight */}
        <ellipse
          cx={cx - baseRadius * 0.28}
          cy={cy - baseRadius * 0.32}
          rx={baseRadius * 0.18}
          ry={baseRadius * 0.12}
          fill="rgba(200,240,255,0.04)"
        />
      </svg>
    </div>
  );
};