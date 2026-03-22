import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Pre-computed continent silhouette points (simplified polygons)
const CONTINENTS = [
  // North America
  {
    id: 'na',
    path: 'M 320 180 L 380 160 L 450 170 L 500 200 L 520 250 L 510 300 L 480 350 L 440 380 L 400 400 L 360 420 L 320 410 L 290 380 L 270 340 L 260 290 L 280 240 L 300 210 Z',
    cx: 390, cy: 290,
  },
  // South America
  {
    id: 'sa',
    path: 'M 400 480 L 440 470 L 470 490 L 490 530 L 500 580 L 490 640 L 470 690 L 440 720 L 410 730 L 380 710 L 360 670 L 350 620 L 355 570 L 370 520 Z',
    cx: 425, cy: 600,
  },
  // Europe
  {
    id: 'eu',
    path: 'M 700 150 L 750 140 L 800 155 L 820 180 L 810 210 L 780 230 L 750 240 L 720 230 L 695 210 L 685 185 Z',
    cx: 752, cy: 190,
  },
  // Africa
  {
    id: 'af',
    path: 'M 700 270 L 760 260 L 810 275 L 840 310 L 850 360 L 845 420 L 830 480 L 800 530 L 760 560 L 720 555 L 690 520 L 670 470 L 660 410 L 665 350 L 675 300 Z',
    cx: 757, cy: 410,
  },
  // Asia
  {
    id: 'as',
    path: 'M 850 130 L 950 110 L 1080 120 L 1180 150 L 1220 200 L 1200 260 L 1150 300 L 1080 320 L 1000 330 L 920 310 L 870 280 L 840 240 L 835 190 Z',
    cx: 1027, cy: 220,
  },
  // Australia
  {
    id: 'au',
    path: 'M 1050 480 L 1120 465 L 1190 475 L 1240 510 L 1250 560 L 1230 610 L 1190 640 L 1130 645 L 1080 625 L 1040 590 L 1030 540 Z',
    cx: 1140, cy: 555,
  },
];

// Trade wind routes connecting continents
const ROUTES = [
  { id: 0, from: { x: 500, y: 290 }, to: { x: 700, y: 190 }, cp1: { x: 570, y: 200 }, cp2: { x: 630, y: 200 } },
  { id: 1, from: { x: 500, y: 290 }, to: { x: 700, y: 270 }, cp1: { x: 560, y: 320 }, cp2: { x: 640, y: 280 } },
  { id: 2, from: { x: 425, y: 600 }, to: { x: 700, y: 410 }, cp1: { x: 500, y: 550 }, cp2: { x: 620, y: 450 } },
  { id: 3, from: { x: 757, y: 190 }, to: { x: 1027, y: 220 }, cp1: { x: 840, y: 140 }, cp2: { x: 940, y: 150 } },
  { id: 4, from: { x: 757, y: 410 }, to: { x: 1027, y: 220 }, cp1: { x: 840, y: 380 }, cp2: { x: 960, y: 300 } },
  { id: 5, from: { x: 1027, y: 220 }, to: { x: 1140, y: 555 }, cp1: { x: 1100, y: 300 }, cp2: { x: 1120, y: 440 } },
  { id: 6, from: { x: 500, y: 290 }, to: { x: 425, y: 600 }, cp1: { x: 450, y: 400 }, cp2: { x: 440, y: 500 } },
  { id: 7, from: { x: 700, y: 270 }, to: { x: 757, y: 190 }, cp1: { x: 710, y: 230 }, cp2: { x: 730, y: 200 } },
  { id: 8, from: { x: 1140, y: 555 }, to: { x: 500, y: 290 }, cp1: { x: 900, y: 400 }, cp2: { x: 650, y: 250 } },
  { id: 9, from: { x: 425, y: 600 }, to: { x: 757, y: 410 }, cp1: { x: 560, y: 580 }, cp2: { x: 680, y: 480 } },
  { id: 10, from: { x: 757, y: 410 }, to: { x: 1140, y: 555 }, cp1: { x: 880, y: 500 }, cp2: { x: 1020, y: 520 } },
  { id: 11, from: { x: 390, y: 290 }, to: { x: 1027, y: 220 }, cp1: { x: 600, y: 160 }, cp2: { x: 850, y: 170 } },
];

// Particles along routes
const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  routeIndex: i % ROUTES.length,
  offset: (i * 137) % 100 / 100,
  size: ((i * 17) % 4) + 2,
  speedMultiplier: 0.5 + ((i * 31) % 100) / 200,
  opacity: 0.4 + ((i * 53) % 60) / 100,
}));

// Background stars
const STARS = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731 + 400) % 1280,
  y: (i * 1337 + 200) % 800,
  size: (i % 3) * 0.5 + 0.5,
  brightness: 0.1 + ((i * 71) % 60) / 100,
}));

// Glow nodes at continent centers
const NODES = CONTINENTS.map((c, i) => ({
  cx: c.cx,
  cy: c.cy,
  pulseOffset: (i * 17) % 60,
}));

function getBezierPoint(t: number, p0: {x:number,y:number}, p1: {x:number,y:number}, p2: {x:number,y:number}, p3: {x:number,y:number}) {
  const mt = 1 - t;
  return {
    x: mt*mt*mt*p0.x + 3*mt*mt*t*p1.x + 3*mt*t*t*p2.x + t*t*t*p3.x,
    y: mt*mt*mt*p0.y + 3*mt*mt*t*p1.y + 3*mt*t*t*p2.y + t*t*t*p3.y,
  };
}

export const TradeWindRoutes: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const scaleX = width / 1280;
  const scaleY = height / 800;

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const time = frame / 30;

  return (
    <div style={{ width, height, background: '#020a10', overflow: 'hidden', opacity: globalOpacity }}>
      <svg width={width} height={height} viewBox="0 0 1280 800" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Deep ocean gradient */}
          <radialGradient id="oceanGrad" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stopColor="#021a2e" />
            <stop offset="100%" stopColor="#010810" />
          </radialGradient>
          {/* Cyan glow filter */}
          <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur1" />
            <feGaussianBlur stdDeviation="8" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="nodeGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Gradient for routes */}
          {ROUTES.map((r) => (
            <linearGradient key={`rg-${r.id}`} id={`routeGrad${r.id}`} x1={r.from.x / 1280} y1={r.from.y / 800} x2={r.to.x / 1280} y2={r.to.y / 800} gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#00b4d8" stopOpacity="0.1" />
            </linearGradient>
          ))}
          <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#021a2e" />
            <stop offset="100%" stopColor="#010810" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="1280" height="800" fill="url(#bgGrad)" />

        {/* Ocean subtle grid lines */}
        {Array.from({ length: 16 }, (_, i) => (
          <line
            key={`hg-${i}`}
            x1={0} y1={i * 53.3}
            x2={1280} y2={i * 53.3}
            stroke="#0a3a5a" strokeWidth="0.3" opacity="0.3"
          />
        ))}
        {Array.from({ length: 20 }, (_, i) => (
          <line
            key={`vg-${i}`}
            x1={i * 67.4} y1={0}
            x2={i * 67.4} y2={800}
            stroke="#0a3a5a" strokeWidth="0.3" opacity="0.3"
          />
        ))}

        {/* Stars */}
        {STARS.map((s, i) => (
          <circle
            key={`star-${i}`}
            cx={s.x} cy={s.y} r={s.size}
            fill="#a0e4ff"
            opacity={s.brightness * (0.5 + 0.5 * Math.sin(time * 2 + i * 0.7))}
          />
        ))}

        {/* Continent fills */}
        {CONTINENTS.map((c) => (
          <g key={c.id}>
            <path
              d={c.path}
              fill="#0d3a50"
              stroke="#0e5070"
              strokeWidth="1"
              opacity="0.85"
            />
            <path
              d={c.path}
              fill="none"
              stroke="#00c8e8"
              strokeWidth="0.6"
              opacity="0.4"
            />
          </g>
        ))}

        {/* Trade wind route lines - base glow */}
        {ROUTES.map((r) => {
          const dashOffset = -(time * 60 * (0.7 + (r.id * 0.07) % 0.6));
          const pulseOpacity = 0.25 + 0.15 * Math.sin(time * 1.5 + r.id * 0.8);
          return (
            <path
              key={`route-bg-${r.id}`}
              d={`M ${r.from.x} ${r.from.y} C ${r.cp1.x} ${r.cp1.y} ${r.cp2.x} ${r.cp2.y} ${r.to.x} ${r.to.y}`}
              fill="none"
              stroke="#00e5ff"
              strokeWidth="3"
              opacity={pulseOpacity}
              filter="url(#cyanGlow)"
            />
          );
        })}

        {/* Trade wind route lines - animated dashes */}
        {ROUTES.map((r) => {
          const speed = 0.7 + (r.id * 0.07) % 0.6;
          const dashOffset = -(time * 80 * speed);
          const opacity = 0.6 + 0.3 * Math.sin(time * 1.2 + r.id * 1.1);
          return (
            <path
              key={`route-dash-${r.id}`}
              d={`M ${r.from.x} ${r.from.y} C ${r.cp1.x} ${r.cp1.y} ${r.cp2.x} ${r.cp2.y} ${r.to.x} ${r.to.y}`}
              fill="none"
              stroke="#00f5ff"
              strokeWidth="1.5"
              strokeDasharray="18 12"
              strokeDashoffset={dashOffset}
              opacity={opacity}
            />
          );
        })}

        {/* Flowing particles along routes */}
        {PARTICLES.map((p, i) => {
          const route = ROUTES[p.routeIndex];
          const t = ((p.offset + time * p.speedMultiplier * 0.12) % 1 + 1) % 1;
          const pos = getBezierPoint(t, route.from, route.cp1, route.cp2, route.to);
          const trailT = Math.max(0, t - 0.03);
          const trailPos = getBezierPoint(trailT, route.from, route.cp1, route.cp2, route.to);

          const particleOpacity = p.opacity * (0.7 + 0.3 * Math.sin(time * 3 + i * 0.5));

          return (
            <g key={`particle-${i}`}>
              <line
                x1={trailPos.x} y1={trailPos.y}
                x2={pos.x} y2={pos.y}
                stroke="#00f5ff"
                strokeWidth={p.size * 0.5}
                opacity={particleOpacity * 0.5}
              />
              <circle
                cx={pos.x} cy={pos.y}
                r={p.size}
                fill="#00f5ff"
                opacity={particleOpacity}
                filter="url(#softGlow)"
              />
            </g>
          );
        })}

        {/* Continent node glows */}
        {NODES.map((n, i) => {
          const pulse = 0.4 + 0.6 * Math.abs(Math.sin((time * 1.8 + n.pulseOffset * 0.1)));
          const ringPulse = 0.3 + 0.4 * Math.abs(Math.sin(time * 1.3 + i * 0.9));
          const ringScale = 8 + 10 * Math.abs(Math.sin(time * 0.9 + i * 0.6));
          return (
            <g key={`node-${i}`}>
              {/* Outer pulse ring */}
              <circle
                cx={n.cx} cy={n.cy}
                r={ringScale}
                fill="none"
                stroke="#00e5ff"
                strokeWidth="1"
                opacity={ringPulse * 0.5}
              />
              {/* Second ring */}
              <circle
                cx={n.cx} cy={n.cy}
                r={ringScale * 0.6}
                fill="none"
                stroke="#00f5ff"
                strokeWidth="0.8"
                opacity={ringPulse * 0.7}
              />
              {/* Core glow */}
              <circle
                cx={n.cx} cy={n.cy}
                r={5}
                fill="#00e0ff"
                opacity={pulse * 0.8}
                filter="url(#nodeGlow)"
              />
              <circle
                cx={n.cx} cy={n.cy}
                r={3}
                fill="#ffffff"
                opacity={pulse}
              />
            </g>
          );
        })}

        {/* Ambient glow overlay on major crossing points */}
        {[
          { x: 600, y: 290 },
          { x: 730, y: 330 },
          { x: 550, y: 480 },
          { x: 900, y: 340 },
        ].map((pt, i) => {
          const opacity = 0.04 + 0.03 * Math.sin(time * 0.7 + i * 1.2);
          return (
            <circle
              key={`ambient-${i}`}
              cx={pt.x} cy={pt.y}
              r={120}
              fill="#00a8cc"
              opacity={opacity}
            />
          );
        })}

        {/* Vignette overlay */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="#010608" stopOpacity="0.75" />
        </radialGradient>
        <rect width="1280" height="800" fill="url(#vignette)" />
      </svg>
    </div>
  );
};