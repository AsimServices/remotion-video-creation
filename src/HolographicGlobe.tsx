import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NUM_LAT_LINES = 18;
const NUM_LON_LINES = 24;
const NUM_STARS = 200;

const STARS = Array.from({ length: NUM_STARS }, (_, i) => ({
  x: (i * 2731 + 137) % 3840,
  y: (i * 1337 + 89) % 2160,
  size: ((i * 47) % 4) + 1,
  opacity: ((i * 31) % 60) / 100 + 0.2,
}));

const CONTINENT_PATHS: { d: string; color: string }[] = [
  // North America (approximate, normalized to unit sphere projection)
  {
    color: '#00ffff',
    d: `M -0.45,0.35 C -0.50,0.30 -0.55,0.20 -0.52,0.10 C -0.48,0.00 -0.42,-0.05 -0.38,-0.10
        C -0.32,-0.18 -0.28,-0.22 -0.25,-0.28 C -0.22,-0.32 -0.20,-0.38 -0.22,-0.35
        C -0.30,-0.25 -0.35,-0.18 -0.38,-0.10 C -0.40,-0.05 -0.44,0.05 -0.48,0.15
        C -0.50,0.22 -0.48,0.30 -0.45,0.35 Z`,
  },
  // South America
  {
    color: '#00ffff',
    d: `M -0.28,-0.32 C -0.22,-0.35 -0.18,-0.40 -0.20,-0.48 C -0.22,-0.56 -0.28,-0.60 -0.30,-0.65
        C -0.32,-0.70 -0.28,-0.75 -0.25,-0.72 C -0.22,-0.68 -0.20,-0.62 -0.22,-0.55
        C -0.24,-0.48 -0.26,-0.42 -0.24,-0.38 C -0.22,-0.34 -0.18,-0.32 -0.20,-0.28
        C -0.22,-0.24 -0.28,-0.28 -0.28,-0.32 Z`,
  },
  // Europe
  {
    color: '#00ffff',
    d: `M 0.05,0.48 C 0.08,0.45 0.12,0.42 0.15,0.38 C 0.18,0.34 0.18,0.30 0.15,0.28
        C 0.12,0.26 0.08,0.28 0.05,0.32 C 0.02,0.36 0.00,0.40 0.02,0.44
        C 0.04,0.48 0.05,0.48 0.05,0.48 Z`,
  },
  // Africa
  {
    color: '#00ffff',
    d: `M 0.05,0.28 C 0.10,0.24 0.15,0.20 0.18,0.12 C 0.20,0.04 0.18,-0.05 0.15,-0.12
        C 0.12,-0.20 0.08,-0.28 0.05,-0.34 C 0.02,-0.38 0.00,-0.40 0.02,-0.36
        C 0.04,-0.30 0.06,-0.22 0.08,-0.14 C 0.10,-0.06 0.10,0.02 0.08,0.10
        C 0.06,0.18 0.02,0.24 0.05,0.28 Z`,
  },
  // Asia
  {
    color: '#00ffff',
    d: `M 0.15,0.38 C 0.22,0.42 0.30,0.45 0.38,0.42 C 0.46,0.38 0.50,0.30 0.52,0.22
        C 0.54,0.14 0.52,0.06 0.48,0.00 C 0.44,-0.06 0.38,-0.08 0.32,-0.05
        C 0.26,-0.02 0.22,0.04 0.18,0.10 C 0.14,0.16 0.12,0.22 0.14,0.28
        C 0.16,0.34 0.15,0.38 0.15,0.38 Z`,
  },
  // Australia
  {
    color: '#00ffff',
    d: `M 0.42,-0.35 C 0.48,-0.38 0.54,-0.36 0.58,-0.30 C 0.62,-0.24 0.60,-0.18 0.56,-0.14
        C 0.52,-0.10 0.46,-0.10 0.42,-0.14 C 0.38,-0.18 0.36,-0.24 0.38,-0.30
        C 0.40,-0.34 0.42,-0.35 0.42,-0.35 Z`,
  },
];

function projectPoint(
  lat: number,
  lon: number,
  rotationY: number,
  cx: number,
  cy: number,
  r: number
): { x: number; y: number; visible: boolean; z: number } {
  const phi = (lat * Math.PI) / 180;
  const theta = (lon * Math.PI) / 180 + rotationY;
  const x3d = Math.cos(phi) * Math.cos(theta);
  const y3d = Math.sin(phi);
  const z3d = Math.cos(phi) * Math.sin(theta);
  return {
    x: cx + x3d * r,
    y: cy - y3d * r,
    visible: z3d > -0.1,
    z: z3d,
  };
}

export const HolographicGlobe: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const rotationY = (frame / durationInFrames) * Math.PI * 4;
  const tilt = 0.28;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.04);

  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.36;

  // Grid lines
  const latLines: React.ReactNode[] = [];
  for (let i = 0; i <= NUM_LAT_LINES; i++) {
    const lat = -90 + (i * 180) / NUM_LAT_LINES;
    const points: string[] = [];
    let lastVisible = false;
    const segments: { x: number; y: number; visible: boolean }[][] = [];
    let currentSeg: { x: number; y: number; visible: boolean }[] = [];

    for (let j = 0; j <= 72; j++) {
      const lon = (j / 72) * 360;
      const phi = (lat * Math.PI) / 180;
      const theta = (lon * Math.PI) / 180 + rotationY;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);

      const x3d = cosPhi * cosTheta;
      const y3d = sinPhi;
      const z3d = cosPhi * sinTheta;

      const yTilted = y3d * Math.cos(tilt) - z3d * Math.sin(tilt);
      const zTilted = y3d * Math.sin(tilt) + z3d * Math.cos(tilt);

      const px = cx + x3d * r;
      const py = cy - yTilted * r;
      const visible = zTilted > -0.05;

      if (visible !== lastVisible && currentSeg.length > 0) {
        segments.push(currentSeg);
        currentSeg = [];
      }
      currentSeg.push({ x: px, y: py, visible });
      lastVisible = visible;
    }
    if (currentSeg.length > 0) segments.push(currentSeg);

    segments.forEach((seg, si) => {
      if (seg[0].visible) {
        const d = seg.map((p, pi) => `${pi === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
        const latFactor = Math.abs(lat) / 90;
        const alpha = 0.12 + 0.18 * (1 - latFactor);
        latLines.push(
          <path
            key={`lat-${i}-${si}`}
            d={d}
            fill="none"
            stroke={`rgba(0,255,255,${alpha})`}
            strokeWidth={2}
          />
        );
      }
    });
  }

  const lonLines: React.ReactNode[] = [];
  for (let j = 0; j < NUM_LON_LINES; j++) {
    const lon = (j * 360) / NUM_LON_LINES;
    const segments: { x: number; y: number; visible: boolean }[][] = [];
    let currentSeg: { x: number; y: number; visible: boolean }[] = [];
    let lastVisible = false;

    for (let i = 0; i <= 72; i++) {
      const lat = -90 + (i * 180) / 72;
      const phi = (lat * Math.PI) / 180;
      const theta = (lon * Math.PI) / 180 + rotationY;
      const x3d = Math.cos(phi) * Math.cos(theta);
      const y3d = Math.sin(phi);
      const z3d = Math.cos(phi) * Math.sin(theta);
      const yTilted = y3d * Math.cos(tilt) - z3d * Math.sin(tilt);
      const zTilted = y3d * Math.sin(tilt) + z3d * Math.cos(tilt);

      const px = cx + x3d * r;
      const py = cy - yTilted * r;
      const visible = zTilted > -0.05;

      if (visible !== lastVisible && currentSeg.length > 0) {
        segments.push(currentSeg);
        currentSeg = [];
      }
      currentSeg.push({ x: px, y: py, visible });
      lastVisible = visible;
    }
    if (currentSeg.length > 0) segments.push(currentSeg);

    segments.forEach((seg, si) => {
      if (seg[0].visible) {
        const d = seg.map((p, pi) => `${pi === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
        lonLines.push(
          <path
            key={`lon-${j}-${si}`}
            d={d}
            fill="none"
            stroke="rgba(0,220,255,0.15)"
            strokeWidth={2}
          />
        );
      }
    });
  }

  // Continent dots rendered as projected 3D points
  const continentDots: React.ReactNode[] = [];
  const continentPointSets = [
    // North America
    Array.from({ length: 80 }, (_, i) => ({
      lat: 15 + ((i * 53) % 55),
      lon: -170 + ((i * 47) % 100),
    })),
    // South America
    Array.from({ length: 60 }, (_, i) => ({
      lat: -55 + ((i * 61) % 65),
      lon: -82 + ((i * 43) % 40),
    })),
    // Europe
    Array.from({ length: 50 }, (_, i) => ({
      lat: 36 + ((i * 37) % 30),
      lon: -10 + ((i * 53) % 40),
    })),
    // Africa
    Array.from({ length: 80 }, (_, i) => ({
      lat: -35 + ((i * 59) % 72),
      lon: -18 + ((i * 41) % 55),
    })),
    // Asia
    Array.from({ length: 120 }, (_, i) => ({
      lat: 0 + ((i * 43) % 70),
      lon: 25 + ((i * 67) % 125),
    })),
    // Australia
    Array.from({ length: 40 }, (_, i) => ({
      lat: -40 + ((i * 53) % 30),
      lon: 113 + ((i * 37) % 40),
    })),
  ];

  continentPointSets.forEach((points, ci) => {
    points.forEach((pt, pi) => {
      const phi = (pt.lat * Math.PI) / 180;
      const theta = (pt.lon * Math.PI) / 180 + rotationY;
      const x3d = Math.cos(phi) * Math.cos(theta);
      const y3d = Math.sin(phi);
      const z3d = Math.cos(phi) * Math.sin(theta);
      const yTilted = y3d * Math.cos(tilt) - z3d * Math.sin(tilt);
      const zTilted = y3d * Math.sin(tilt) + z3d * Math.cos(tilt);

      if (zTilted < 0.05) return;

      const px = cx + x3d * r;
      const py = cy - yTilted * r;
      const bright = 0.4 + 0.6 * zTilted;
      const glow = pulse * 0.3 + 0.7;

      continentDots.push(
        <circle
          key={`cont-${ci}-${pi}`}
          cx={px}
          cy={py}
          r={3 + zTilted * 3}
          fill={`rgba(0,255,200,${bright * glow * 0.7})`}
        />
      );
    });
  });

  // Rings
  const rings: React.ReactNode[] = [];
  for (let ri = 0; ri < 4; ri++) {
    const rRadius = r * (1.05 + ri * 0.06);
    const ringOpacity = 0.06 + 0.04 * ri;
    const dashOffset = frame * (1 + ri * 0.5);
    rings.push(
      <circle
        key={`ring-${ri}`}
        cx={cx}
        cy={cy}
        r={rRadius}
        fill="none"
        stroke={`rgba(0,255,255,${ringOpacity})`}
        strokeWidth={ri === 0 ? 3 : 2}
        strokeDasharray={ri % 2 === 0 ? `${30 + ri * 10} ${20 + ri * 5}` : `${15 + ri * 8} ${30 + ri * 6}`}
        strokeDashoffset={dashOffset}
      />
    );
  }

  // Scanning line
  const scanAngle = (frame * 0.03) % (Math.PI * 2);
  const scanX2 = cx + Math.cos(scanAngle) * r * 1.1;
  const scanY2 = cy + Math.sin(scanAngle) * r * 1.1;

  // Glow halo layers
  const glowLayers = [0.04, 0.08, 0.12, 0.18].map((alpha, gi) => (
    <circle
      key={`glow-${gi}`}
      cx={cx}
      cy={cy}
      r={r * (1.0 - gi * 0.05)}
      fill="none"
      stroke={`rgba(0,200,255,${alpha * (0.8 + 0.2 * pulse)})`}
      strokeWidth={(4 - gi) * 12}
    />
  ));

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at center, #020b18 0%, #000508 60%, #000000 100%)',
        opacity,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Stars */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {STARS.map((s, i) => (
          <circle key={`star-${i}`} cx={s.x} cy={s.y} r={s.size} fill={`rgba(200,240,255,${s.opacity})`} />
        ))}
      </svg>

      {/* Globe SVG */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="globeGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="rgba(0,180,255,0.08)" />
            <stop offset="60%" stopColor="rgba(0,80,150,0.04)" />
            <stop offset="100%" stopColor="rgba(0,20,60,0.02)" />
          </radialGradient>
          <radialGradient id="shineGrad" cx="35%" cy="30%" r="50%">
            <stop offset="0%" stopColor="rgba(100,230,255,0.18)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="globeClip">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>

        {/* Outer glow rings */}
        <g filter="url(#strongGlow)">{glowLayers}</g>

        {/* Globe background */}
        <circle cx={cx} cy={cy} r={r} fill="url(#globeGrad)" />

        {/* Clipped grid & continents */}
        <g clipPath="url(#globeClip)">
          {/* Grid */}
          <g filter="url(#glow)">{latLines}{lonLines}</g>
          {/* Continent dots */}
          <g filter="url(#glow)">{continentDots}</g>
          {/* Shine overlay */}
          <circle cx={cx} cy={cy} r={r} fill="url(#shineGrad)" />
        </g>

        {/* Orbital rings */}
        <g filter="url(#glow)">{rings}</g>

        {/* Scanning beam */}
        <line
          x1={cx}
          y1={cy}
          x2={scanX2}
          y2={scanY2}
          stroke={`rgba(0,255,200,${0.3 * pulse})`}
          strokeWidth={3}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r * 1.02}
          fill="none"
          stroke={`rgba(0,255,220,${0.25 * pulse})`}
          strokeWidth={4}
          strokeDasharray="8 200"
          strokeDashoffset={-frame * 2}
        />

        {/* Globe edge outline */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={`rgba(0,220,255,${0.5 + 0.2 * pulse})`}
          strokeWidth={4}
          filter="url(#glow)"
        />

        {/* Equator highlight */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={r}
          ry={r * Math.cos(tilt) * 0.12}
          fill="none"
          stroke={`rgba(0,255,255,${0.18 + 0.08 * pulse})`}
          strokeWidth={3}
          filter="url(#glow)"
        />

        {/* Poles */}
        <circle
          cx={cx}
          cy={cy - r * Math.cos(tilt)}
          r={8 + 4 * pulse}
          fill={`rgba(0,255,255,${0.6 + 0.3 * pulse})`}
          filter="url(#glow)"
        />
        <circle
          cx={cx}
          cy={cy + r * Math.cos(tilt)}
          r={8 + 4 * pulse}
          fill={`rgba(0,255,255,${0.6 + 0.3 * pulse})`}
          filter="url(#glow)"
        />

        {/* Corner HUD decorations */}
        {[
          [80, 80],
          [width - 80, 80],
          [80, height - 80],
          [width - 80, height - 80],
        ].map(([hx, hy], hi) => (
          <g key={`hud-${hi}`}>
            <line x1={hx - 40} y1={hy} x2={hx - 10} y2={hy} stroke="rgba(0,200,255,0.4)" strokeWidth={2} />
            <line x1={hx} y1={hy - 40} x2={hx} y2={hy - 10} stroke="rgba(0,200,255,0.4)" strokeWidth={2} />
            <circle cx={hx} cy={hy} r={4} fill="rgba(0,255,255,0.5)" />
          </g>
        ))}
      </svg>
    </div>
  );
};