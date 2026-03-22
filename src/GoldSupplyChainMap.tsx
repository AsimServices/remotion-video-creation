import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// World map dot positions (simplified continents using grid-based approach)
const CONTINENT_DOTS: Array<{ x: number; y: number; continent: number }> = [];

// Generate dots for each continent region
const CONTINENT_REGIONS = [
  // North America
  { x1: 0.05, y1: 0.15, x2: 0.25, y2: 0.55, id: 0, density: 0.35 },
  // South America
  { x1: 0.12, y1: 0.55, x2: 0.28, y2: 0.88, id: 1, density: 0.3 },
  // Europe
  { x1: 0.42, y1: 0.1, x2: 0.58, y2: 0.38, id: 2, density: 0.45 },
  // Africa
  { x1: 0.42, y1: 0.38, x2: 0.6, y2: 0.82, id: 3, density: 0.3 },
  // Asia
  { x1: 0.55, y1: 0.08, x2: 0.9, y2: 0.6, id: 4, density: 0.35 },
  // Australia
  { x1: 0.72, y1: 0.62, x2: 0.9, y2: 0.82, id: 5, density: 0.25 },
];

// Pre-generate continent dots
const generateContinentDots = () => {
  const dots: Array<{ x: number; y: number; continent: number }> = [];
  CONTINENT_REGIONS.forEach((region) => {
    const cols = Math.floor((region.x2 - region.x1) * 120);
    const rows = Math.floor((region.y2 - region.y1) * 80);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c + region.id * 10000;
        const threshold = region.density;
        const pseudo = ((idx * 1733 + 17) % 100) / 100;
        if (pseudo < threshold) {
          const nx = region.x1 + (c / cols) * (region.x2 - region.x1);
          const ny = region.y1 + (r / rows) * (region.y2 - region.y1);
          // Add small jitter
          const jx = ((idx * 397) % 100) / 100 / 120;
          const jy = ((idx * 613) % 100) / 100 / 80;
          dots.push({ x: nx + jx, y: ny + jy, continent: region.id });
        }
      }
    }
  });
  return dots;
};

(() => {
  const dots = generateContinentDots();
  dots.forEach((d) => CONTINENT_DOTS.push(d));
})();

// Supply chain hub cities (normalized 0-1 coordinates)
const HUBS = [
  { x: 0.13, y: 0.28, name: 'NA_WEST', continent: 0 },   // Los Angeles
  { x: 0.19, y: 0.22, name: 'NA_EAST', continent: 0 },   // New York
  { x: 0.21, y: 0.68, name: 'SA', continent: 1 },         // São Paulo
  { x: 0.48, y: 0.2, name: 'EU_W', continent: 2 },        // London
  { x: 0.53, y: 0.24, name: 'EU_E', continent: 2 },       // Frankfurt
  { x: 0.5, y: 0.52, name: 'AF', continent: 3 },          // Lagos
  { x: 0.62, y: 0.18, name: 'RU', continent: 4 },         // Moscow
  { x: 0.69, y: 0.3, name: 'IN', continent: 4 },          // Mumbai
  { x: 0.78, y: 0.28, name: 'CN', continent: 4 },         // Shanghai
  { x: 0.84, y: 0.32, name: 'JP', continent: 4 },         // Tokyo
  { x: 0.82, y: 0.7, name: 'AU', continent: 5 },          // Sydney
];

// Supply chain routes between hubs
const ROUTES = [
  { from: 2, to: 0, color: '#FFD700', delay: 0, speed: 1.0 },
  { from: 2, to: 1, color: '#FFA500', delay: 20, speed: 0.8 },
  { from: 3, to: 7, color: '#FFD700', delay: 40, speed: 0.9 },
  { from: 4, to: 2, color: '#FFE066', delay: 10, speed: 1.1 },
  { from: 4, to: 3, color: '#FFC200', delay: 55, speed: 0.85 },
  { from: 7, to: 8, color: '#FFD700', delay: 15, speed: 1.2 },
  { from: 8, to: 9, color: '#FFA500', delay: 30, speed: 0.95 },
  { from: 8, to: 4, color: '#FFE066', delay: 5, speed: 1.0 },
  { from: 9, to: 0, color: '#FFD700', delay: 45, speed: 0.88 },
  { from: 0, to: 2, color: '#FFC200', delay: 25, speed: 0.92 },
  { from: 1, to: 5, color: '#FFD700', delay: 35, speed: 0.78 },
  { from: 5, to: 3, color: '#FFE066', delay: 60, speed: 1.05 },
  { from: 9, to: 10, color: '#FFA500', delay: 50, speed: 0.82 },
  { from: 7, to: 3, color: '#FFD700', delay: 8, speed: 0.95 },
  { from: 6, to: 4, color: '#FFE066', delay: 18, speed: 1.15 },
];

// Particle positions along each route (pre-computed per route)
const ROUTE_PARTICLES = ROUTES.map((route, ri) => {
  return Array.from({ length: 5 }, (_, pi) => ({
    offset: ((ri * 137 + pi * 73) % 100) / 100,
    size: 2 + ((ri * 31 + pi * 17) % 3),
    alpha: 0.6 + ((ri * 53 + pi * 29) % 40) / 100,
  }));
});

// Background stars
const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 1731 + 7) % 3840,
  y: (i * 1337 + 3) % 2160,
  size: ((i * 97) % 3) + 0.5,
  alpha: 0.1 + ((i * 61) % 40) / 100,
}));

// Glowing orbs in background
const ORBS = Array.from({ length: 8 }, (_, i) => ({
  x: (i * 500 + 200) % 3840,
  y: (i * 380 + 150) % 2160,
  size: 200 + (i * 150) % 400,
  hue: 40 + (i * 15) % 30,
}));

export const GoldSupplyChainMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  // Slow pulsing for dots
  const pulse = Math.sin(frame * 0.03) * 0.15 + 0.85;
  // Slow rotation / drift for overall scene
  const drift = Math.sin(frame * 0.008) * 3;

  const scaleX = width;
  const scaleY = height;
  const padding = { x: 0.02, y: 0.06 };

  const toScreen = (nx: number, ny: number) => ({
    sx: (nx + padding.x) * scaleX * (1 - 2 * padding.x),
    sy: (ny + padding.y) * scaleY * (1 - 2 * padding.y),
  });

  // Get cubic bezier point
  const bezier = (t: number, p0: number, p1: number, p2: number, p3: number) => {
    const mt = 1 - t;
    return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
  };

  const getRoutePoint = (fromHub: typeof HUBS[0], toHub: typeof HUBS[0], t: number) => {
    const dx = toHub.x - fromHub.x;
    const dy = toHub.y - fromHub.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const midX = (fromHub.x + toHub.x) / 2;
    const midY = (fromHub.y + toHub.y) / 2 - dist * 0.35;

    const cp1x = fromHub.x + dx * 0.25;
    const cp1y = fromHub.y + dy * 0.25 - dist * 0.3;
    const cp2x = toHub.x - dx * 0.25;
    const cp2y = toHub.y - dy * 0.25 - dist * 0.3;

    return {
      x: bezier(t, fromHub.x, cp1x, cp2x, toHub.x),
      y: bezier(t, fromHub.y, cp1y, cp2y, toHub.y),
    };
  };

  const buildBezierPath = (fromHub: typeof HUBS[0], toHub: typeof HUBS[0]) => {
    const dx = toHub.x - fromHub.x;
    const dy = toHub.y - fromHub.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const cp1x = fromHub.x + dx * 0.25;
    const cp1y = fromHub.y + dy * 0.25 - dist * 0.3;
    const cp2x = toHub.x - dx * 0.25;
    const cp2y = toHub.y - dy * 0.25 - dist * 0.3;

    const from = toScreen(fromHub.x, fromHub.y);
    const cp1 = toScreen(cp1x, cp1y);
    const cp2 = toScreen(cp2x, cp2y);
    const to = toScreen(toHub.x, toHub.y);

    return `M ${from.sx} ${from.sy} C ${cp1.sx} ${cp1.sy}, ${cp2.sx} ${cp2.sy}, ${to.sx} ${to.sy}`;
  };

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 50% 40%, #0a0a1a 0%, #000005 70%, #000000 100%)',
        overflow: 'hidden',
        opacity,
        position: 'relative',
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {/* Gold gradient for routes */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B6914" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFD700" stopOpacity="1" />
            <stop offset="100%" stopColor="#8B6914" stopOpacity="0" />
          </linearGradient>

          {/* Radial glow for hubs */}
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#FFA500" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FF8C00" stopOpacity="0" />
          </radialGradient>

          {/* Outer glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="starGlow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background ambient orbs */}
        {ORBS.map((orb, i) => {
          const orbPulse = Math.sin(frame * 0.015 + i * 1.2) * 0.2 + 0.1;
          return (
            <ellipse
              key={`orb-${i}`}
              cx={orb.x + drift * (i % 2 === 0 ? 1 : -1)}
              cy={orb.y}
              rx={orb.size * 1.5}
              ry={orb.size}
              fill={`hsla(${orb.hue}, 80%, 35%, ${orbPulse})`}
              style={{ filter: 'blur(60px)' }}
            />
          );
        })}

        {/* Stars */}
        {STARS.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="white"
            opacity={star.alpha * (0.7 + Math.sin(frame * 0.05 + i * 0.3) * 0.3)}
          />
        ))}

        {/* Continent dots */}
        {CONTINENT_DOTS.map((dot, i) => {
          const { sx, sy } = toScreen(dot.x, dot.y);
          const dotPulse = pulse * (0.85 + Math.sin(frame * 0.02 + i * 0.1) * 0.15);
          const continentColors = ['#C8960C', '#B8860B', '#DAA520', '#CD853F', '#FFD700', '#FFC125'];
          const baseColor = continentColors[dot.continent];
          return (
            <circle
              key={`dot-${i}`}
              cx={sx}
              cy={sy}
              r={4 * dotPulse}
              fill={baseColor}
              opacity={0.55 * dotPulse}
            />
          );
        })}

        {/* Supply chain route paths (background glow) */}
        {ROUTES.map((route, ri) => {
          const fromHub = HUBS[route.from];
          const toHub = HUBS[route.to];
          const path = buildBezierPath(fromHub, toHub);
          const routeReveal = interpolate(frame, [50 + route.delay, 150 + route.delay], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <path
              key={`route-glow-${ri}`}
              d={path}
              stroke={route.color}
              strokeWidth={3}
              fill="none"
              opacity={0.12 * routeReveal}
              style={{ filter: 'blur(6px)' }}
            />
          );
        })}

        {/* Supply chain route paths */}
        {ROUTES.map((route, ri) => {
          const fromHub = HUBS[route.from];
          const toHub = HUBS[route.to];
          const path = buildBezierPath(fromHub, toHub);
          const routeReveal = interpolate(frame, [50 + route.delay, 180 + route.delay], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          // Dashed line animation
          const dashLength = 30;
          const gapLength = 60;
          const dashOffset = -(frame * route.speed * 2);

          return (
            <path
              key={`route-${ri}`}
              d={path}
              stroke={route.color}
              strokeWidth={1.5}
              fill="none"
              opacity={0.45 * routeReveal}
              strokeDasharray={`${dashLength} ${gapLength}`}
              strokeDashoffset={dashOffset}
            />
          );
        })}

        {/* Animated particles along routes */}
        {ROUTES.map((route, ri) => {
          const fromHub = HUBS[route.from];
          const toHub = HUBS[route.to];
          const routeReveal = interpolate(frame, [100 + route.delay, 200 + route.delay], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return ROUTE_PARTICLES[ri].map((particle, pi) => {
            const cycleLength = 180 / route.speed;
            const t = ((frame * route.speed + particle.offset * cycleLength) % cycleLength) / cycleLength;
            const point = getRoutePoint(fromHub, toHub, t);
            const { sx, sy } = toScreen(point.x, point.y);

            // Particle trail effect
            const trailT = Math.max(0, t - 0.05);
            const trailPoint = getRoutePoint(fromHub, toHub, trailT);
            const trailScreen = toScreen(trailPoint.x, trailPoint.y);

            return (
              <g key={`particle-${ri}-${pi}`} opacity={particle.alpha * routeReveal}>
                {/* Trail */}
                <line
                  x1={trailScreen.sx}
                  y1={trailScreen.sy}
                  x2={sx}
                  y2={sy}
                  stroke={route.color}
                  strokeWidth={particle.size * 0.8}
                  opacity={0.4}
                />
                {/* Main particle */}
                <circle
                  cx={sx}
                  cy={sy}
                  r={particle.size * 1.5}
                  fill={route.color}
                  filter="url(#glow)"
                />
                {/* Particle glow */}
                <circle
                  cx={sx}
                  cy={sy}
                  r={particle.size * 3}
                  fill={route.color}
                  opacity={0.25}
                />
              </g>
            );
          });
        })}

        {/* Hub cities */}
        {HUBS.map((hub, hi) => {
          const { sx, sy } = toScreen(hub.x, hub.y);
          const hubReveal = interpolate(frame, [40 + hi * 15, 100 + hi * 15], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const hubPulse = Math.sin(frame * 0.06 + hi * 0.8) * 0.5 + 0.5;
          const ringScale = interpolate(hubPulse, [0, 1], [1, 2.2]);
          const ringOpacity = interpolate(hubPulse, [0, 1], [0.6, 0]);

          return (
            <g key={`hub-${hi}`} opacity={hubReveal}>
              {/* Expanding ring */}
              <circle
                cx={sx}
                cy={sy}
                r={18 * ringScale}
                stroke="#FFD700"
                strokeWidth={1.5}
                fill="none"
                opacity={ringOpacity}
              />
              {/* Second ring */}
              <circle
                cx={sx}
                cy={sy}
                r={18 * ringScale * 1.5}
                stroke="#FFA500"
                strokeWidth={1}
                fill="none"
                opacity={ringOpacity * 0.5}
              />
              {/* Hub glow */}
              <circle
                cx={sx}
                cy={sy}
                r={22}
                fill="url(#hubGlow)"
                opacity={0.6}
              />
              {/* Hub core */}
              <circle
                cx={sx}
                cy={sy}
                r={7}
                fill="#FFD700"
                filter="url(#softGlow)"
              />
              {/* Hub inner dot */}
              <circle
                cx={sx}
                cy={sy}
                r={3.5}
                fill="white"
                opacity={0.9}
              />
            </g>
          );
        })}

        {/* Grid lines overlay (subtle) */}
        {Array.from({ length: 9 }, (_, i) => {
          const x = (width / 9) * i;
          return (
            <line
              key={`vgrid-${i}`}
              x1={x}
              y1={0}
              x2={x}
              y2={height}
              stroke="#1a1a2e"
              strokeWidth={0.5}
              opacity={0.3}
            />
          );
        })}
        {Array.from({ length: 7 }, (_, i) => {
          const y = (height / 7) * i;
          return (
            <line
              key={`hgrid-${i}`}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke="#1a1a2e"
              strokeWidth={0.5}
              opacity={0.3}
            />
          );
        })}

        {/* Top scanline effect */}
        {Array.from({ length: 20 }, (_, i) => {
          const y = ((frame * 2 + i * 108) % (height + 200)) - 100;
          return (
            <line
              key={`scan-${i}`}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke="#FFD700"
              strokeWidth={0.5}
              opacity={0.03}
            />
          );
        })}

        {/* Corner decorations */}
        {[
          { cx: 60, cy: 60, rot: 0 },
          { cx: width - 60, cy: 60, rot: 90 },
          { cx: 60, cy: height - 60, rot: 270 },
          { cx: width - 60, cy: height - 60, rot: 180 },
        ].map((corner, ci) => {
          const cornerReveal = interpolate(frame, [20 + ci * 10, 80 + ci * 10], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <g key={`corner-${ci}`} transform={`rotate(${corner.rot}, ${corner.cx}, ${corner.cy})`} opacity={cornerReveal}>
              <line x1={corner.cx} y1={corner.cy} x2={corner.cx + 40} y2={corner.cy} stroke="#FFD700" strokeWidth={2} opacity={0.8} />
              <line x1={corner.cx} y1={corner.cy} x2={corner.cx} y2={corner.cy + 40} stroke="#FFD700" strokeWidth={2} opacity={0.8} />
              <circle cx={corner.cx} cy={corner.cy} r={3} fill="#FFD700" opacity={0.9} />
            </g>
          );
        })}

        {/* Equator and meridian lines */}
        <line
          x1={0}
          y1={height * 0.5}
          x2={width}
          y2={height * 0.5}
          stroke="#FFD700"
          strokeWidth={0.8}
          opacity={0.12}
          strokeDasharray="20 30"
          strokeDashoffset={frame * 0.5}
        />
        <line
          x1={width * 0.5}
          y1={0}
          x2={width * 0.5}
          y2={height}
          stroke="#FFD700"
          strokeWidth={0.8}
          opacity={0.08}
          strokeDasharray="20 30"
          strokeDashoffset={frame * 0.5}
        />

        {/* Vignette overlay */}
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.7" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={width} height={height} fill="url(#vignette)" />
      </svg>
    </div>
  );
};