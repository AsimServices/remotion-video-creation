import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { id: 0, name: 'New York', x: 0.215, y: 0.38 },
  { id: 1, name: 'London', x: 0.47, y: 0.28 },
  { id: 2, name: 'Tokyo', x: 0.82, y: 0.35 },
  { id: 3, name: 'Shanghai', x: 0.78, y: 0.40 },
  { id: 4, name: 'Singapore', x: 0.755, y: 0.565 },
  { id: 5, name: 'Dubai', x: 0.60, y: 0.44 },
  { id: 6, name: 'Frankfurt', x: 0.495, y: 0.295 },
  { id: 7, name: 'Mumbai', x: 0.645, y: 0.47 },
  { id: 8, name: 'Sao Paulo', x: 0.285, y: 0.665 },
  { id: 9, name: 'Sydney', x: 0.86, y: 0.72 },
  { id: 10, name: 'Los Angeles', x: 0.155, y: 0.42 },
  { id: 11, name: 'Toronto', x: 0.22, y: 0.355 },
  { id: 12, name: 'Paris', x: 0.475, y: 0.305 },
  { id: 13, name: 'Seoul', x: 0.815, y: 0.355 },
  { id: 14, name: 'Johannesburg', x: 0.525, y: 0.685 },
];

const ROUTES = [
  { from: 0, to: 1, intensity: 0.9, phase: 0 },
  { from: 0, to: 2, intensity: 0.85, phase: 0.3 },
  { from: 0, to: 10, intensity: 0.7, phase: 0.1 },
  { from: 1, to: 2, intensity: 0.88, phase: 0.5 },
  { from: 1, to: 5, intensity: 0.75, phase: 0.2 },
  { from: 1, to: 6, intensity: 0.95, phase: 0.4 },
  { from: 1, to: 12, intensity: 0.9, phase: 0.6 },
  { from: 2, to: 3, intensity: 0.92, phase: 0.15 },
  { from: 2, to: 13, intensity: 0.88, phase: 0.25 },
  { from: 3, to: 4, intensity: 0.8, phase: 0.35 },
  { from: 3, to: 7, intensity: 0.72, phase: 0.45 },
  { from: 4, to: 7, intensity: 0.78, phase: 0.55 },
  { from: 4, to: 5, intensity: 0.82, phase: 0.65 },
  { from: 5, to: 7, intensity: 0.85, phase: 0.1 },
  { from: 5, to: 14, intensity: 0.6, phase: 0.7 },
  { from: 0, to: 8, intensity: 0.65, phase: 0.8 },
  { from: 8, to: 14, intensity: 0.55, phase: 0.9 },
  { from: 9, to: 4, intensity: 0.7, phase: 0.2 },
  { from: 9, to: 2, intensity: 0.68, phase: 0.5 },
  { from: 10, to: 4, intensity: 0.6, phase: 0.75 },
  { from: 11, to: 1, intensity: 0.7, phase: 0.3 },
  { from: 0, to: 6, intensity: 0.82, phase: 0.4 },
  { from: 6, to: 5, intensity: 0.78, phase: 0.6 },
  { from: 7, to: 9, intensity: 0.65, phase: 0.85 },
  { from: 12, to: 5, intensity: 0.72, phase: 0.15 },
  { from: 13, to: 4, intensity: 0.76, phase: 0.55 },
  { from: 2, to: 10, intensity: 0.74, phase: 0.45 },
  { from: 1, to: 14, intensity: 0.58, phase: 0.75 },
];

const PARTICLES = Array.from({ length: ROUTES.length }, (_, i) => ({
  routeIndex: i,
  offset: (i * 0.137) % 1,
  speed: 0.003 + (i % 7) * 0.0005,
}));

const BACKGROUND_STARS = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 937 + 200) % 2160,
  size: ((i * 13) % 3) + 0.5,
  twinkle: (i * 0.37) % 1,
}));

const CONTINENT_BLOBS = [
  // North America
  { x: 0.08, y: 0.22, rx: 0.12, ry: 0.18 },
  { x: 0.19, y: 0.38, rx: 0.09, ry: 0.14 },
  // South America
  { x: 0.265, y: 0.6, rx: 0.055, ry: 0.14 },
  // Europe
  { x: 0.48, y: 0.27, rx: 0.065, ry: 0.10 },
  // Africa
  { x: 0.5, y: 0.56, rx: 0.075, ry: 0.15 },
  // Asia large
  { x: 0.67, y: 0.32, rx: 0.175, ry: 0.18 },
  // Southeast Asia
  { x: 0.775, y: 0.53, rx: 0.06, ry: 0.08 },
  // Australia
  { x: 0.85, y: 0.695, rx: 0.065, ry: 0.065 },
  // Greenland
  { x: 0.315, y: 0.15, rx: 0.045, ry: 0.06 },
];

function getCurvedPath(
  x1: number, y1: number,
  x2: number, y2: number,
  width: number, height: number
): string {
  const px1 = x1 * width;
  const py1 = y1 * height;
  const px2 = x2 * width;
  const py2 = y2 * height;
  const mx = (px1 + px2) / 2;
  const my = (py1 + py2) / 2;
  const dist = Math.sqrt((px2 - px1) ** 2 + (py2 - py1) ** 2);
  const curvature = dist * 0.22;
  const dx = px2 - px1;
  const dy = py2 - py1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const cx = mx - (dy / len) * curvature;
  const cy = my + (dx / len) * curvature - curvature * 0.5;
  return `M ${px1} ${py1} Q ${cx} ${cy} ${px2} ${py2}`;
}

function getPointOnQuadratic(
  x1: number, y1: number,
  x2: number, y2: number,
  width: number, height: number,
  t: number
): { x: number; y: number } {
  const px1 = x1 * width;
  const py1 = y1 * height;
  const px2 = x2 * width;
  const py2 = y2 * height;
  const mx = (px1 + px2) / 2;
  const my = (py1 + py2) / 2;
  const dist = Math.sqrt((px2 - px1) ** 2 + (py2 - py1) ** 2);
  const curvature = dist * 0.22;
  const dx = px2 - px1;
  const dy = py2 - py1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const cx = mx - (dy / len) * curvature;
  const cy = my + (dx / len) * curvature - curvature * 0.5;
  const x = (1 - t) ** 2 * px1 + 2 * (1 - t) * t * cx + t ** 2 * px2;
  const y = (1 - t) ** 2 * py1 + 2 * (1 - t) * t * cy + t ** 2 * py2;
  return { x, y };
}

export const PulsingWorldNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const time = frame / 30;

  return (
    <div style={{ width, height, background: '#030812', overflow: 'hidden', position: 'relative', opacity: globalOpacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="100%" stopColor="#030812" />
          </radialGradient>
          {ROUTES.map((route, i) => {
            const fromCity = CITIES[route.from];
            const toCity = CITIES[route.to];
            const color1 = `rgba(0, 180, 255, 1)`;
            const color2 = `rgba(100, 220, 255, 1)`;
            return (
              <linearGradient
                key={`grad-${i}`}
                id={`routeGrad-${i}`}
                x1={`${fromCity.x * 100}%`}
                y1={`${fromCity.y * 100}%`}
                x2={`${toCity.x * 100}%`}
                y2={`${toCity.y * 100}%`}
                gradientUnits="objectBoundingBox"
              >
                <stop offset="0%" stopColor={color1} />
                <stop offset="50%" stopColor={color2} />
                <stop offset="100%" stopColor={color1} />
              </linearGradient>
            );
          })}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="20" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="cityGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width={width} height={height} fill="url(#bgGrad)" />

        {/* Background stars */}
        {BACKGROUND_STARS.map((star, i) => {
          const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(time * 1.5 + star.twinkle * Math.PI * 2));
          return (
            <circle
              key={`star-${i}`}
              cx={star.x}
              cy={star.y}
              r={star.size}
              fill={`rgba(180, 210, 255, ${twinkle * 0.5})`}
            />
          );
        })}

        {/* Continent shapes */}
        {CONTINENT_BLOBS.map((blob, i) => {
          const pulse = 0.04 + 0.015 * Math.sin(time * 0.4 + i * 0.7);
          return (
            <ellipse
              key={`continent-${i}`}
              cx={blob.x * width}
              cy={blob.y * height}
              rx={blob.rx * width}
              ry={blob.ry * height}
              fill={`rgba(15, 35, 65, ${pulse * 10})`}
              stroke={`rgba(30, 60, 110, 0.3)`}
              strokeWidth={1}
            />
          );
        })}

        {/* Grid lines - latitude/longitude effect */}
        {Array.from({ length: 9 }, (_, i) => {
          const y = (i / 8) * height;
          return (
            <line
              key={`lat-${i}`}
              x1={0} y1={y} x2={width} y2={y}
              stroke="rgba(30, 60, 120, 0.12)"
              strokeWidth={1}
            />
          );
        })}
        {Array.from({ length: 13 }, (_, i) => {
          const x = (i / 12) * width;
          return (
            <line
              key={`lon-${i}`}
              x1={x} y1={0} x2={x} y2={height}
              stroke="rgba(30, 60, 120, 0.12)"
              strokeWidth={1}
            />
          );
        })}

        {/* Route lines */}
        {ROUTES.map((route, i) => {
          const fromCity = CITIES[route.from];
          const toCity = CITIES[route.to];
          const pulseFactor = 0.4 + 0.6 * Math.abs(Math.sin(time * 1.2 + route.phase * Math.PI * 2));
          const brightness = route.intensity * pulseFactor;
          const lineWidth = 1.5 + brightness * 3;
          const opacity = 0.15 + brightness * 0.7;
          const path = getCurvedPath(fromCity.x, fromCity.y, toCity.x, toCity.y, width, height);

          return (
            <g key={`route-${i}`}>
              {/* Glow layer */}
              <path
                d={path}
                fill="none"
                stroke={`rgba(0, 150, 255, ${opacity * 0.4})`}
                strokeWidth={lineWidth * 4}
                strokeLinecap="round"
                filter="url(#softGlow)"
              />
              {/* Main line */}
              <path
                d={path}
                fill="none"
                stroke={`rgba(60, 200, 255, ${opacity})`}
                strokeWidth={lineWidth}
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* Traveling particles on routes */}
        {PARTICLES.map((particle, i) => {
          const route = ROUTES[particle.routeIndex];
          const fromCity = CITIES[route.from];
          const toCity = CITIES[route.to];
          const t = (particle.offset + time * particle.speed * 30) % 1;
          const point = getPointOnQuadratic(
            fromCity.x, fromCity.y,
            toCity.x, toCity.y,
            width, height,
            t
          );
          const pulseFactor = route.intensity * (0.5 + 0.5 * Math.abs(Math.sin(time * 2 + particle.offset * Math.PI * 2)));
          const particleOpacity = 0.6 + 0.4 * pulseFactor;
          const particleSize = 4 + route.intensity * 6;

          return (
            <g key={`particle-${i}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r={particleSize * 2.5}
                fill={`rgba(100, 220, 255, ${particleOpacity * 0.2})`}
                filter="url(#glow)"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={particleSize}
                fill={`rgba(180, 240, 255, ${particleOpacity})`}
              />
            </g>
          );
        })}

        {/* City nodes */}
        {CITIES.map((city, i) => {
          const cityPulse = 0.6 + 0.4 * Math.sin(time * 2.5 + i * 0.8);
          const ringPulse = interpolate(
            (time * 1.5 + i * 0.3) % 1,
            [0, 1],
            [0, 1]
          );
          const ringRadius = 8 + ringPulse * 40;
          const ringOpacity = (1 - ringPulse) * 0.8;

          const connectedRoutes = ROUTES.filter(r => r.from === i || r.to === i);
          const avgIntensity = connectedRoutes.length > 0
            ? connectedRoutes.reduce((sum, r) => sum + r.intensity, 0) / connectedRoutes.length
            : 0.5;

          const nodeSize = 6 + avgIntensity * 14;
          const cx = city.x * width;
          const cy = city.y * height;

          return (
            <g key={`city-${i}`} filter="url(#cityGlow)">
              {/* Pulsing ring */}
              <circle
                cx={cx}
                cy={cy}
                r={ringRadius}
                fill="none"
                stroke={`rgba(0, 180, 255, ${ringOpacity * cityPulse})`}
                strokeWidth={2}
              />
              {/* Outer glow */}
              <circle
                cx={cx}
                cy={cy}
                r={nodeSize * 2.5}
                fill={`rgba(0, 140, 255, ${0.1 * cityPulse})`}
              />
              {/* Core */}
              <circle
                cx={cx}
                cy={cy}
                r={nodeSize}
                fill={`rgba(150, 230, 255, ${0.7 + 0.3 * cityPulse})`}
              />
              {/* Bright center */}
              <circle
                cx={cx}
                cy={cy}
                r={nodeSize * 0.4}
                fill={`rgba(255, 255, 255, ${0.9 * cityPulse})`}
              />
            </g>
          );
        })}

        {/* Global ambient pulse overlay */}
        <ellipse
          cx={width * 0.5}
          cy={height * 0.5}
          rx={width * 0.6}
          ry={height * 0.6}
          fill={`rgba(0, 60, 150, ${0.02 + 0.015 * Math.sin(time * 0.5)})`}
        />

        {/* Vignette */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.7)" />
        </radialGradient>
        <rect width={width} height={height} fill="url(#vignette)" />
      </svg>
    </div>
  );
};