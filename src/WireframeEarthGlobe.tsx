import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 1731 + 13) % 3840,
  y: (i * 1337 + 7) % 2160,
  size: ((i * 97) % 4) + 1,
  opacity: ((i * 53) % 80 + 20) / 100,
}));

const LAT_LINES = Array.from({ length: 13 }, (_, i) => ({
  lat: -90 + i * 15,
  isEquator: i === 6,
}));

const LON_LINES = Array.from({ length: 24 }, (_, i) => ({
  lon: i * 15,
}));

const NUM_DOTS = 80;
const CONTINENT_DOTS = Array.from({ length: NUM_DOTS }, (_, i) => ({
  lat: ((i * 137.5) % 140) - 70,
  lon: ((i * 251.3) % 360) - 180,
  size: ((i * 37) % 3) + 2,
}));

function projectPoint(lat: number, lon: number, rotationY: number, cx: number, cy: number, r: number) {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = ((lon + rotationY) * Math.PI) / 180;
  const x3d = Math.cos(latRad) * Math.sin(lonRad);
  const y3d = Math.sin(latRad);
  const z3d = Math.cos(latRad) * Math.cos(lonRad);
  return {
    x: cx + r * x3d,
    y: cy - r * y3d,
    z: z3d,
    visible: z3d > -0.05,
  };
}

function getLatCircle(lat: number, rotationY: number, cx: number, cy: number, r: number, segments = 120) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const lon = (i / segments) * 360 - 180;
    points.push(projectPoint(lat, lon, rotationY, cx, cy, r));
  }
  return points;
}

function getLonMeridian(lon: number, rotationY: number, cx: number, cy: number, r: number, segments = 80) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const lat = -90 + (i / segments) * 180;
    points.push(projectPoint(lat, lon, rotationY, cx, cy, r));
  }
  return points;
}

function buildPath(points: { x: number; y: number; z: number; visible: boolean }[]) {
  let path = '';
  let penDown = false;
  for (const pt of points) {
    if (pt.visible) {
      if (!penDown) {
        path += `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)} `;
        penDown = true;
      } else {
        path += `L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)} `;
      }
    } else {
      penDown = false;
    }
  }
  return path;
}

export const WireframeEarthGlobe: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const rotationY = (frame / durationInFrames) * 360 * 1.5;

  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.38;

  const glowPulse = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.5, 1.0]);

  return (
    <div style={{ width, height, background: '#000008', position: 'relative', overflow: 'hidden', opacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#001a3a" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#000820" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="atmosphereGlow" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#0044ff" stopOpacity="0" />
            <stop offset="90%" stopColor="#0066ff" stopOpacity={0.15 * glowPulse} />
            <stop offset="100%" stopColor="#00aaff" stopOpacity={0.3 * glowPulse} />
          </radialGradient>
          <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="equatorGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="starGlow">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="innerGlow" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#003366" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Stars */}
        {STARS.map((star, i) => {
          const twinkle = interpolate(
            Math.sin(frame * 0.03 + i * 0.7),
            [-1, 1],
            [star.opacity * 0.4, star.opacity]
          );
          return (
            <circle
              key={i}
              cx={star.x}
              cy={star.y}
              r={star.size}
              fill="white"
              opacity={twinkle}
              filter="url(#starGlow)"
            />
          );
        })}

        {/* Globe background sphere */}
        <circle cx={cx} cy={cy} r={r} fill="url(#globeGlow)" />
        <circle cx={cx} cy={cy} r={r} fill="url(#innerGlow)" />

        {/* Longitude meridian lines */}
        {LON_LINES.map((line, i) => {
          const pts = getLonMeridian(line.lon, rotationY, cx, cy, r);
          const d = buildPath(pts);
          const isMajor = line.lon % 30 === 0;
          return (
            <path
              key={`lon-${i}`}
              d={d}
              stroke={isMajor ? '#0077cc' : '#003366'}
              strokeWidth={isMajor ? 1.5 : 0.8}
              fill="none"
              opacity={isMajor ? 0.7 : 0.4}
              filter={isMajor ? 'url(#lineGlow)' : undefined}
            />
          );
        })}

        {/* Latitude circle lines */}
        {LAT_LINES.map((line, i) => {
          const pts = getLatCircle(line.lat, rotationY, cx, cy, r);
          const d = buildPath(pts);
          const isEquator = line.isEquator;
          const isTropic = Math.abs(line.lat) === 30;
          return (
            <path
              key={`lat-${i}`}
              d={d}
              stroke={isEquator ? '#00ddff' : isTropic ? '#0099cc' : '#004488'}
              strokeWidth={isEquator ? 3 : isTropic ? 1.8 : 0.9}
              fill="none"
              opacity={isEquator ? 0.9 * glowPulse : isTropic ? 0.7 : 0.4}
              filter={isEquator ? 'url(#equatorGlow)' : isTropic ? 'url(#lineGlow)' : undefined}
            />
          );
        })}

        {/* Glowing dots on grid intersections */}
        {Array.from({ length: 7 }, (_, li) => {
          const lat = -45 + li * 15;
          return Array.from({ length: 12 }, (_, loi) => {
            const lon = loi * 30;
            const pt = projectPoint(lat, lon, rotationY, cx, cy, r);
            if (!pt.visible) return null;
            const depthOpacity = interpolate(pt.z, [0, 1], [0.1, 0.8]);
            return (
              <circle
                key={`dot-${li}-${loi}`}
                cx={pt.x}
                cy={pt.y}
                r={3}
                fill="#00aaff"
                opacity={depthOpacity}
                filter="url(#lineGlow)"
              />
            );
          });
        })}

        {/* Atmosphere glow ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r * 1.02}
          fill="none"
          stroke="#0055ff"
          strokeWidth={r * 0.06}
          opacity={0.12 * glowPulse}
          filter="url(#equatorGlow)"
        />
        <circle cx={cx} cy={cy} r={r} fill="url(#atmosphereGlow)" />

        {/* Outer subtle ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r * 1.05}
          fill="none"
          stroke="#0033aa"
          strokeWidth={1}
          opacity={0.3 * glowPulse}
          filter="url(#lineGlow)"
        />

        {/* Pole markers */}
        {[{ lat: 90 }, { lat: -90 }].map(({ lat }, i) => {
          const pt = projectPoint(lat, 0, rotationY, cx, cy, r);
          if (!pt.visible) return null;
          return (
            <circle
              key={`pole-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={8}
              fill="#00ddff"
              opacity={0.9 * glowPulse}
              filter="url(#equatorGlow)"
            />
          );
        })}
      </svg>
    </div>
  );
};