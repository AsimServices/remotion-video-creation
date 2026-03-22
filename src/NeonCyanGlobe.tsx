import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 2731 + 137) % 3840,
  y: (i * 1337 + 251) % 2160,
  size: ((i * 17) % 3) + 1,
  opacity: ((i * 43) % 60 + 40) / 100,
}));

const CONTINENT_PATHS = [
  // North America
  "M 180 120 L 220 100 L 270 105 L 290 130 L 280 160 L 250 185 L 220 190 L 190 175 L 170 150 Z",
  // South America
  "M 230 200 L 260 195 L 275 215 L 270 260 L 255 290 L 235 285 L 215 260 L 210 230 Z",
  // Europe
  "M 340 100 L 380 95 L 400 110 L 395 135 L 370 145 L 345 135 L 330 118 Z",
  // Africa
  "M 345 150 L 390 145 L 410 170 L 405 220 L 385 250 L 355 245 L 335 215 L 330 175 Z",
  // Asia
  "M 400 80 L 500 70 L 540 90 L 545 130 L 510 155 L 460 160 L 420 145 L 395 120 Z",
  // Australia
  "M 470 210 L 510 205 L 525 220 L 520 250 L 495 260 L 465 250 L 455 230 Z",
];

const LATITUDE_LINES = [-60, -30, 0, 30, 60];
const LONGITUDE_COUNT = 12;

function projectToEllipse(
  lon: number,
  lat: number,
  rotation: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
) {
  const lonRad = ((lon + rotation) * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const x = cx + rx * Math.cos(latRad) * Math.sin(lonRad);
  const y = cy - ry * Math.sin(latRad);
  const depth = Math.cos(latRad) * Math.cos(lonRad);
  return { x, y, depth };
}

export const NeonCyanGlobe: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const rotation = (frame / durationInFrames) * 360 * 2;
  const cx = width / 2;
  const cy = height / 2;
  const rx = height * 0.38;
  const ry = height * 0.38;

  const pulseGlow = interpolate(Math.sin((frame / 30) * Math.PI * 2), [-1, 1], [8, 20]);
  const pulseOpacity = interpolate(Math.sin((frame / 45) * Math.PI * 2), [-1, 1], [0.6, 1.0]);

  // Latitude lines
  const latLines = LATITUDE_LINES.map((lat) => {
    const latRad = (lat * Math.PI) / 180;
    const ellipseRx = rx * Math.cos(latRad);
    const ellipseRy = ry * 0.15;
    const yPos = cy - ry * Math.sin(latRad);
    return { lat, ellipseRx, ellipseRy, yPos };
  });

  // Longitude lines (as arcs projected)
  const longLines = Array.from({ length: LONGITUDE_COUNT }, (_, i) => {
    const lon = (i / LONGITUDE_COUNT) * 360;
    return lon;
  });

  // Continent projected points
  const continentData = CONTINENT_PATHS.map((path, idx) => {
    // Parse simplified polygon from path string - convert to sphere coords
    // Use fixed offsets per continent
    const lonOffsets = [-100, -60, 15, 20, 80, 135];
    const latOffsets = [45, -10, 50, 5, 45, -25];
    const scales = [60, 40, 30, 45, 80, 30];
    const basePoints = [
      [[0,0],[20,-10],[35,-5],[40,10],[35,25],[20,30],[0,25],[-15,15]],
      [[5,0],[20,-3],[28,8],[25,35],[12,50],[0,48],[-15,35],[-18,15]],
      [[0,0],[25,-3],[35,5],[32,20],[15,25],[0,20],[-10,10]],
      [[0,0],[30,-3],[42,10],[38,40],[22,55],[-2,52],[-18,38],[-22,20]],
      [[0,0],[60,-5],[90,10],[92,35],[68,50],[30,52],[-3,42],[-20,18]],
      [[0,0],[25,-3],[38,10],[34,30],[15,38],[-8,30],[-18,14]],
    ];
    const pts = basePoints[idx] || basePoints[0];
    return pts.map(([dlat, dlon]) => {
      const lon = lonOffsets[idx] + dlon * (scales[idx] / 60);
      const lat = latOffsets[idx] + dlat * (scales[idx] / 60);
      return projectToEllipse(lon, lat, rotation, cx, cy, rx, ry);
    });
  });

  return (
    <div style={{ width, height, background: '#000008', position: 'relative', overflow: 'hidden', opacity }}>
      {/* Stars */}
      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
        {STARS.map((star, i) => (
          <circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="white"
            opacity={star.opacity * interpolate(Math.sin((frame / 40 + i * 0.3) * Math.PI), [-1, 1], [0.4, 1.0])}
          />
        ))}
      </svg>

      {/* Globe glow background */}
      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
        <defs>
          <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00ffff" stopOpacity="0.08" />
            <stop offset="60%" stopColor="#00ffff" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#000008" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="globeSurface" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#001a2e" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#000005" stopOpacity="0.95" />
          </radialGradient>
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation={pulseGlow} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="continentGlow">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="globeClip">
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
          </clipPath>
        </defs>

        {/* Glow halo */}
        <ellipse cx={cx} cy={cy} rx={rx + 80} ry={ry + 80} fill="url(#globeGlow)" />

        {/* Globe surface */}
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#globeSurface)" />

        {/* Latitude grid lines */}
        {latLines.map(({ lat, ellipseRx, ellipseRy, yPos }) => (
          <ellipse
            key={`lat-${lat}`}
            cx={cx}
            cy={yPos}
            rx={ellipseRx}
            ry={ellipseRy}
            fill="none"
            stroke="#00ffff"
            strokeWidth="1.5"
            strokeOpacity={lat === 0 ? 0.5 : 0.2}
            clipPath="url(#globeClip)"
          />
        ))}

        {/* Longitude grid lines */}
        {longLines.map((lon, i) => {
          const points = Array.from({ length: 37 }, (_, j) => {
            const lat = -90 + j * 5;
            const p = projectToEllipse(lon, lat, rotation, cx, cy, rx, ry);
            return p;
          }).filter(p => p.depth >= -0.1);

          if (points.length < 2) return null;

          const pathD = points.map((p, idx) =>
            `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
          ).join(' ');

          return (
            <path
              key={`lon-${i}`}
              d={pathD}
              fill="none"
              stroke="#00ffff"
              strokeWidth="1.5"
              strokeOpacity={0.18}
              clipPath="url(#globeClip)"
            />
          );
        })}

        {/* Continents */}
        {continentData.map((pts, idx) => {
          const visible = pts.filter(p => p.depth > 0);
          if (visible.length < 3) return null;

          const avgDepth = pts.reduce((s, p) => s + p.depth, 0) / pts.length;
          const contOpacity = interpolate(avgDepth, [0, 0.8], [0.0, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          const pathD = pts.map((p, i) =>
            `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
          ).join(' ') + ' Z';

          const glowPulse = interpolate(Math.sin((frame / 60 + idx * 0.7) * Math.PI * 2), [-1, 1], [0.5, 1.0]);

          return (
            <g key={`continent-${idx}`} clipPath="url(#globeClip)" opacity={contOpacity * glowPulse}>
              {/* Glow layer */}
              <path
                d={pathD}
                fill="#00ffff"
                fillOpacity={0.12}
                stroke="#00ffff"
                strokeWidth="6"
                strokeOpacity={0.3}
                filter="url(#continentGlow)"
              />
              {/* Main fill */}
              <path
                d={pathD}
                fill="#003344"
                fillOpacity={0.85}
                stroke="#00ffff"
                strokeWidth="3"
                strokeOpacity={0.9}
              />
              {/* Bright edge */}
              <path
                d={pathD}
                fill="none"
                stroke="#80ffff"
                strokeWidth="1.5"
                strokeOpacity={0.6}
              />
            </g>
          );
        })}

        {/* Globe outline with neon glow */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke="#00ffff"
          strokeWidth="4"
          strokeOpacity={pulseOpacity}
          filter="url(#neonGlow)"
        />
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke="#80ffff"
          strokeWidth="2"
          strokeOpacity={0.9}
        />

        {/* Specular highlight */}
        <ellipse
          cx={cx - rx * 0.3}
          cy={cy - ry * 0.3}
          rx={rx * 0.25}
          ry={ry * 0.15}
          fill="white"
          fillOpacity={0.04}
        />

        {/* Equator highlight */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry * 0.04}
          fill="none"
          stroke="#00ffff"
          strokeWidth="2"
          strokeOpacity={0.35}
          clipPath="url(#globeClip)"
        />
      </svg>

      {/* Orbital ring */}
      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
        <defs>
          <filter id="ringGlow">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx * 1.35}
          ry={ry * 0.22}
          fill="none"
          stroke="#00ffff"
          strokeWidth="2"
          strokeOpacity={0.3}
          strokeDasharray="40 20"
          strokeDashoffset={frame * 2}
          filter="url(#ringGlow)"
        />
      </svg>
    </div>
  );
};