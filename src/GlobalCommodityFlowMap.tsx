import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const TRADE_ROUTES = Array.from({ length: 40 }, (_, i) => {
  const startLon = ((i * 137.5 + 20) % 360) - 180;
  const startLat = ((i * 73.3 + 10) % 140) - 70;
  const endLon = ((i * 211.7 + 80) % 360) - 180;
  const endLat = ((i * 97.1 + 30) % 140) - 70;
  const volume = ((i * 53 + 17) % 100) / 100;
  const speed = 0.3 + ((i * 31) % 70) / 100;
  const hue = (i * 25) % 360;
  const thickness = 1 + volume * 4;
  const numParticles = 3 + Math.floor(volume * 8);
  return { startLon, startLat, endLon, endLat, volume, speed, hue, thickness, numParticles };
});

const PARTICLES = TRADE_ROUTES.flatMap((route, ri) =>
  Array.from({ length: route.numParticles }, (_, pi) => ({
    routeIndex: ri,
    offset: (pi / route.numParticles),
  }))
);

const CITY_NODES = [
  { lon: -74, lat: 40.7, name: 'NYC', size: 12 },
  { lon: -0.1, lat: 51.5, name: 'London', size: 11 },
  { lon: 139.7, lat: 35.7, name: 'Tokyo', size: 13 },
  { lon: 121.5, lat: 31.2, name: 'Shanghai', size: 12 },
  { lon: 72.8, lat: 19, name: 'Mumbai', size: 10 },
  { lon: -43.2, lat: -22.9, name: 'Rio', size: 9 },
  { lon: 37.6, lat: 55.8, name: 'Moscow', size: 9 },
  { lon: 2.3, lat: 48.9, name: 'Paris', size: 10 },
  { lon: 103.8, lat: 1.3, name: 'Singapore', size: 11 },
  { lon: -87.6, lat: 41.9, name: 'Chicago', size: 9 },
  { lon: 18.4, lat: -33.9, name: 'Cape Town', size: 8 },
  { lon: 151.2, lat: -33.9, name: 'Sydney', size: 9 },
  { lon: 31.2, lat: 30.1, name: 'Cairo', size: 8 },
  { lon: -99.1, lat: 19.4, name: 'Mexico City', size: 9 },
  { lon: -58.4, lat: -34.6, name: 'Buenos Aires', size: 8 },
];

const CONTINENT_PATHS = [
  // North America
  "M 280 120 L 340 100 L 380 110 L 400 130 L 410 160 L 400 190 L 380 220 L 360 250 L 340 270 L 320 260 L 300 240 L 290 210 L 280 180 L 270 150 Z",
  // South America
  "M 330 280 L 360 270 L 380 290 L 390 320 L 395 360 L 385 400 L 365 430 L 345 440 L 325 420 L 315 390 L 310 350 L 315 310 Z",
  // Europe
  "M 480 90 L 530 80 L 560 95 L 570 120 L 555 140 L 530 150 L 500 145 L 475 130 L 470 110 Z",
  // Africa
  "M 490 155 L 540 145 L 570 160 L 580 200 L 575 250 L 555 300 L 530 340 L 505 350 L 480 330 L 465 290 L 460 240 L 465 195 Z",
  // Asia
  "M 560 80 L 680 65 L 750 80 L 780 110 L 790 150 L 760 190 L 710 210 L 660 205 L 610 190 L 575 165 L 555 130 L 555 100 Z",
  // Australia
  "M 710 300 L 760 290 L 790 305 L 800 330 L 790 360 L 760 375 L 725 370 L 700 350 L 695 320 Z",
];

const GRID_LINES_LAT = Array.from({ length: 13 }, (_, i) => i * 15 - 90);
const GRID_LINES_LON = Array.from({ length: 25 }, (_, i) => i * 15 - 180);

function lonLatToXY(lon: number, lat: number, w: number, h: number) {
  const x = ((lon + 180) / 360) * w;
  const y = ((90 - lat) / 180) * h;
  return { x, y };
}

function getBezierPoint(t: number, x1: number, y1: number, x2: number, y2: number, w: number, h: number) {
  const cx = (x1 + x2) / 2;
  const cy = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.2 - h * 0.05;
  const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
  const by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
  return { x: bx, y: by };
}

function getBezierPath(x1: number, y1: number, x2: number, y2: number, h: number) {
  const cx = (x1 + x2) / 2;
  const cy = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.2 - h * 0.05;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

export const GlobalCommodityFlowMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const mapW = width;
  const mapH = height;

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const time = frame / 30;

  // Pulse effect
  const pulse = 0.5 + 0.5 * Math.sin(time * 2);

  return (
    <div style={{ width, height, background: '#030810', position: 'relative', overflow: 'hidden', opacity: globalOpacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="100%" stopColor="#030810" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="18" result="blur" />
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
          {TRADE_ROUTES.map((route, i) => (
            <linearGradient
              key={`grad-${i}`}
              id={`routeGrad-${i}`}
              gradientUnits="userSpaceOnUse"
              x1={lonLatToXY(route.startLon, route.startLat, mapW, mapH).x}
              y1={lonLatToXY(route.startLon, route.startLat, mapW, mapH).y}
              x2={lonLatToXY(route.endLon, route.endLat, mapW, mapH).x}
              y2={lonLatToXY(route.endLon, route.endLat, mapW, mapH).y}
            >
              <stop offset="0%" stopColor={`hsla(${route.hue}, 90%, 70%, 0.1)`} />
              <stop offset="50%" stopColor={`hsla(${route.hue}, 100%, 75%, ${0.4 + route.volume * 0.5})`} />
              <stop offset="100%" stopColor={`hsla(${(route.hue + 40) % 360}, 90%, 70%, 0.1)`} />
            </linearGradient>
          ))}
        </defs>

        {/* Background */}
        <rect width={width} height={height} fill="url(#bgGlow)" />

        {/* Grid Lines */}
        <g opacity="0.12">
          {GRID_LINES_LAT.map((lat, i) => {
            const y = ((90 - lat) / 180) * mapH;
            return <line key={`lat-${i}`} x1={0} y1={y} x2={mapW} y2={y} stroke="#3a6694" strokeWidth="1" />;
          })}
          {GRID_LINES_LON.map((lon, i) => {
            const x = ((lon + 180) / 360) * mapW;
            return <line key={`lon-${i}`} x1={x} y1={0} x2={x} y2={mapH} stroke="#3a6694" strokeWidth="1" />;
          })}
        </g>

        {/* Continent fills */}
        <g opacity="0.18" transform={`scale(${width / 1080}, ${height / 540})`}>
          {CONTINENT_PATHS.map((d, i) => (
            <path key={`cont-${i}`} d={d} fill="#1a3a5c" stroke="#2a5a8c" strokeWidth="1.5" />
          ))}
        </g>

        {/* Trade route lines */}
        {TRADE_ROUTES.map((route, i) => {
          const p1 = lonLatToXY(route.startLon, route.startLat, mapW, mapH);
          const p2 = lonLatToXY(route.endLon, route.endLat, mapW, mapH);
          const pathD = getBezierPath(p1.x, p1.y, p2.x, p2.y, mapH);

          // Animated dash offset
          const dashLen = 60 + route.volume * 80;
          const gapLen = 30 + (1 - route.volume) * 60;
          const dashOffset = -(time * route.speed * 150) % (dashLen + gapLen);

          // Route activation - each route appears at different times
          const routeActivation = interpolate(
            frame,
            [i * 3, i * 3 + 40],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const routeOpacity = routeActivation * (0.3 + route.volume * 0.5);

          return (
            <g key={`route-${i}`} opacity={routeOpacity} filter="url(#glow)">
              {/* Base route line */}
              <path
                d={pathD}
                fill="none"
                stroke={`url(#routeGrad-${i})`}
                strokeWidth={route.thickness * (width / 3840)}
                strokeDasharray={`${dashLen} ${gapLen}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
              {/* Glow layer */}
              <path
                d={pathD}
                fill="none"
                stroke={`hsla(${route.hue}, 100%, 80%, ${0.1 + route.volume * 0.15})`}
                strokeWidth={route.thickness * 3 * (width / 3840)}
                strokeDasharray={`${dashLen} ${gapLen}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* Particles along routes */}
        {PARTICLES.map((particle, pi) => {
          const route = TRADE_ROUTES[particle.routeIndex];
          const p1 = lonLatToXY(route.startLon, route.startLat, mapW, mapH);
          const p2 = lonLatToXY(route.endLon, route.endLat, mapW, mapH);

          const t = ((time * route.speed * 0.4 + particle.offset) % 1 + 1) % 1;
          const pos = getBezierPoint(t, p1.x, p1.y, p2.x, p2.y, mapH);

          const routeActivation = interpolate(
            frame,
            [particle.routeIndex * 3, particle.routeIndex * 3 + 40],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const particleSize = (2 + route.volume * 4) * (width / 3840);
          const particleOpacity = routeActivation * (0.7 + route.volume * 0.3);

          return (
            <g key={`particle-${pi}`} filter="url(#softGlow)">
              <circle
                cx={pos.x}
                cy={pos.y}
                r={particleSize * 3}
                fill={`hsla(${route.hue}, 100%, 80%, ${particleOpacity * 0.3})`}
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={particleSize}
                fill={`hsla(${route.hue}, 100%, 95%, ${particleOpacity})`}
              />
            </g>
          );
        })}

        {/* City Nodes */}
        {CITY_NODES.map((city, ci) => {
          const pos = lonLatToXY(city.lon, city.lat, mapW, mapH);
          const nodeActivation = interpolate(
            frame,
            [ci * 8 + 30, ci * 8 + 70],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const scaledSize = city.size * (width / 3840) * 4;
          const pulseScale = 1 + pulse * 0.4;
          const ringScale = 1 + ((time * 1.5 + ci * 0.7) % 1) * 2.5;
          const ringOpacity = (1 - ((time * 1.5 + ci * 0.7) % 1)) * 0.7 * nodeActivation;

          return (
            <g key={`city-${ci}`} filter="url(#cityGlow)" opacity={nodeActivation}>
              {/* Expanding ring */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={scaledSize * ringScale}
                fill="none"
                stroke={`hsla(${(ci * 40) % 360}, 90%, 75%, ${ringOpacity})`}
                strokeWidth={1.5 * (width / 3840)}
              />
              {/* Outer glow */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={scaledSize * 2}
                fill={`hsla(${(ci * 40) % 360}, 80%, 60%, 0.15)`}
              />
              {/* Core */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={scaledSize * pulseScale * 0.5}
                fill={`hsla(${(ci * 40) % 360}, 100%, 90%, 0.95)`}
              />
              {/* Inner bright */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={scaledSize * 0.25}
                fill="white"
                opacity={0.9}
              />
            </g>
          );
        })}

        {/* Ambient atmosphere overlay */}
        <radialGradient id="atmosphereGrad" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,5,20,0.6)" />
        </radialGradient>
        <rect width={width} height={height} fill="url(#atmosphereGrad)" />

        {/* Scanline subtle effect */}
        <rect
          width={width}
          height={height}
          fill="none"
          stroke="transparent"
          style={{ opacity: 0.03 }}
        />

        {/* Top intensity bar - volume indicator */}
        {TRADE_ROUTES.slice(0, 20).map((route, i) => {
          const barW = (width / 20) * 0.7;
          const barH = route.volume * height * 0.04;
          const barX = i * (width / 20) + (width / 40) * 0.3;
          const barY = height - barH - height * 0.01;
          const barActivation = interpolate(frame, [i * 5 + 60, i * 5 + 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const barPulse = 0.7 + 0.3 * Math.sin(time * 3 + i * 0.5);

          return (
            <g key={`bar-${i}`} opacity={barActivation * barPulse}>
              <rect
                x={barX}
                y={barY}
                width={barW}
                height={barH}
                fill={`hsla(${route.hue}, 90%, 65%, 0.7)`}
                rx={2}
              />
              <rect
                x={barX}
                y={barY}
                width={barW}
                height={Math.min(barH * 0.3, 4)}
                fill={`hsla(${route.hue}, 100%, 90%, 0.9)`}
                rx={2}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};