import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Pre-computed deterministic data
const PORTS = [
  { x: 0.12, y: 0.38, name: 'A' },
  { x: 0.22, y: 0.28, name: 'B' },
  { x: 0.48, y: 0.22, name: 'C' },
  { x: 0.52, y: 0.35, name: 'D' },
  { x: 0.62, y: 0.18, name: 'E' },
  { x: 0.72, y: 0.32, name: 'F' },
  { x: 0.85, y: 0.28, name: 'G' },
  { x: 0.88, y: 0.45, name: 'H' },
  { x: 0.78, y: 0.55, name: 'I' },
  { x: 0.65, y: 0.62, name: 'J' },
  { x: 0.55, y: 0.72, name: 'K' },
  { x: 0.42, y: 0.68, name: 'L' },
  { x: 0.28, y: 0.75, name: 'M' },
  { x: 0.18, y: 0.62, name: 'N' },
  { x: 0.08, y: 0.52, name: 'O' },
  { x: 0.35, y: 0.42, name: 'P' },
  { x: 0.92, y: 0.62, name: 'Q' },
  { x: 0.15, y: 0.82, name: 'R' },
];

const ROUTES = [
  { from: 0, to: 1, offset: 0 },
  { from: 1, to: 2, offset: 15 },
  { from: 2, to: 3, offset: 30 },
  { from: 3, to: 4, offset: 45 },
  { from: 4, to: 5, offset: 60 },
  { from: 5, to: 6, offset: 75 },
  { from: 6, to: 7, offset: 90 },
  { from: 7, to: 8, offset: 105 },
  { from: 8, to: 9, offset: 20 },
  { from: 9, to: 10, offset: 35 },
  { from: 10, to: 11, offset: 50 },
  { from: 11, to: 12, offset: 65 },
  { from: 12, to: 13, offset: 80 },
  { from: 13, to: 14, offset: 95 },
  { from: 14, to: 0, offset: 10 },
  { from: 2, to: 15, offset: 25 },
  { from: 15, to: 9, offset: 40 },
  { from: 3, to: 8, offset: 55 },
  { from: 5, to: 9, offset: 70 },
  { from: 1, to: 15, offset: 85 },
  { from: 6, to: 16, offset: 100 },
  { from: 16, to: 8, offset: 115 },
  { from: 12, to: 17, offset: 5 },
  { from: 0, to: 14, offset: 120 },
];

const PARTICLES = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731 + 500) % 10000 / 10000,
  y: (i * 1337 + 200) % 10000 / 10000,
  size: ((i * 47) % 4) + 1,
  speed: ((i * 73) % 100) / 100 * 0.8 + 0.2,
  phase: (i * 113) % 628 / 100,
}));

const LAND_MASSES = [
  // North America-ish
  { points: '0.05,0.18 0.25,0.15 0.32,0.22 0.30,0.35 0.22,0.40 0.12,0.42 0.05,0.35' },
  // Europe-ish
  { points: '0.42,0.15 0.58,0.12 0.62,0.22 0.55,0.28 0.45,0.25 0.40,0.20' },
  // Asia-ish
  { points: '0.60,0.10 0.90,0.10 0.92,0.30 0.85,0.38 0.72,0.35 0.65,0.28 0.58,0.20' },
  // Africa-ish
  { points: '0.48,0.35 0.60,0.32 0.62,0.55 0.55,0.68 0.48,0.72 0.42,0.60 0.44,0.45' },
  // South America-ish
  { points: '0.20,0.45 0.32,0.42 0.35,0.58 0.30,0.75 0.22,0.80 0.16,0.68 0.18,0.55' },
  // Australia-ish
  { points: '0.72,0.55 0.88,0.52 0.90,0.65 0.80,0.70 0.70,0.65' },
  // Antarctica-ish
  { points: '0.00,0.88 0.25,0.85 0.50,0.88 0.75,0.85 1.00,0.88 1.00,1.00 0.00,1.00' },
];

const GRID_LINES_H = Array.from({ length: 12 }, (_, i) => i / 12);
const GRID_LINES_V = Array.from({ length: 20 }, (_, i) => i / 20);

function getBezierPoint(t: number, p0x: number, p0y: number, p1x: number, p1y: number, p2x: number, p2y: number) {
  const mt = 1 - t;
  return {
    x: mt * mt * p0x + 2 * mt * t * p1x + t * t * p2x,
    y: mt * mt * p0y + 2 * mt * t * p1y + t * t * p2y,
  };
}

function getControlPoint(x1: number, y1: number, x2: number, y2: number, idx: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const offset = ((idx * 137) % 100) / 100 * 0.15 - 0.075;
  return { cx: mx + offset, cy: my - 0.08 - Math.abs(offset) };
}

export const BioluminescentOceanMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const time = frame / 30;

  // Pulsing glow animation
  const pulsePhase = (frame % 120) / 120;
  const globalPulse = 0.7 + 0.3 * Math.sin(pulsePhase * Math.PI * 2);

  return (
    <div style={{
      width,
      height,
      background: 'radial-gradient(ellipse at 50% 50%, #020b18 0%, #010810 40%, #000508 100%)',
      opacity: globalOpacity,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <svg width={width} height={height} viewBox="0 0 1 1" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {/* Ocean glow filter */}
          <filter id="oceanGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.005" result="blur1" />
            <feGaussianBlur stdDeviation="0.012" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="landGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.003" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="portGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="0.006" result="blur1" />
            <feGaussianBlur stdDeviation="0.015" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="particleGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="0.003" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="deepOcean" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#001833" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#000508" stopOpacity="0.9" />
          </radialGradient>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#00eeff" stopOpacity="1" />
            <stop offset="100%" stopColor="#00ffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Deep ocean background */}
        <rect x="0" y="0" width="1" height="1" fill="url(#deepOcean)" />

        {/* Latitude/longitude grid */}
        {GRID_LINES_H.map((y, i) => {
          const gridOpacity = 0.06 + 0.02 * Math.sin(time * 0.5 + i * 0.5);
          return (
            <line key={`gh${i}`} x1="0" y1={y} x2="1" y2={y}
              stroke="#004466" strokeWidth="0.001" opacity={gridOpacity} />
          );
        })}
        {GRID_LINES_V.map((x, i) => {
          const gridOpacity = 0.06 + 0.02 * Math.sin(time * 0.5 + i * 0.3);
          return (
            <line key={`gv${i}`} x1={x} y1="0" x2={x} y2="1"
              stroke="#004466" strokeWidth="0.001" opacity={gridOpacity} />
          );
        })}

        {/* Ocean current shimmer lines */}
        {Array.from({ length: 8 }, (_, i) => {
          const y = 0.15 + i * 0.1;
          const waveOffset = Math.sin(time * 0.8 + i * 1.2) * 0.03;
          const shimmerOpacity = 0.04 + 0.02 * Math.sin(time + i);
          return (
            <path key={`current${i}`}
              d={`M 0 ${y + waveOffset} Q 0.25 ${y + waveOffset + 0.02} 0.5 ${y + waveOffset} Q 0.75 ${y + waveOffset - 0.02} 1 ${y + waveOffset}`}
              fill="none" stroke="#00aaff" strokeWidth="0.002" opacity={shimmerOpacity} />
          );
        })}

        {/* Land masses */}
        {LAND_MASSES.map((land, i) => {
          const pts = land.points.split(' ').map(p => {
            const [px, py] = p.split(',').map(Number);
            return `${px},${py}`;
          }).join(' ');
          const landPulse = 0.85 + 0.15 * Math.sin(time * 0.3 + i * 0.7);
          return (
            <g key={`land${i}`} filter="url(#landGlow)">
              <polygon
                points={pts}
                fill="#0a2a1a"
                stroke="#00ff88"
                strokeWidth="0.003"
                opacity={landPulse}
              />
              <polygon
                points={pts}
                fill="none"
                stroke="#00ffaa"
                strokeWidth="0.001"
                opacity={landPulse * 0.5}
              />
            </g>
          );
        })}

        {/* Sea routes with flowing particles */}
        {ROUTES.map((route, i) => {
          const p1 = PORTS[route.from];
          const p2 = PORTS[route.to];
          const { cx, cy } = getControlPoint(p1.x, p1.y, p2.x, p2.y, i);

          // Flow progress: each route has offset phase
          const routePeriod = 180; // frames per cycle
          const routeProgress = ((frame + route.offset * 3) % routePeriod) / routePeriod;

          // Route base opacity
          const routeOpacity = 0.25 + 0.1 * Math.sin(time * 1.5 + i * 0.4);

          // Flowing particle along route
          const pt = getBezierPoint(routeProgress, p1.x, p1.y, cx, cy, p2.x, p2.y);
          const ptTrail1 = getBezierPoint(Math.max(0, routeProgress - 0.05), p1.x, p1.y, cx, cy, p2.x, p2.y);
          const ptTrail2 = getBezierPoint(Math.max(0, routeProgress - 0.12), p1.x, p1.y, cx, cy, p2.x, p2.y);

          const particleGlow = 0.6 + 0.4 * Math.sin(time * 3 + i);

          return (
            <g key={`route${i}`} filter="url(#oceanGlow)">
              {/* Route path */}
              <path
                d={`M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`}
                fill="none"
                stroke="#00ccff"
                strokeWidth="0.0015"
                opacity={routeOpacity}
                strokeDasharray="0.02 0.01"
              />
              {/* Bright core route */}
              <path
                d={`M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`}
                fill="none"
                stroke="#00eeff"
                strokeWidth="0.0005"
                opacity={routeOpacity * 0.8}
              />
              {/* Trail particles */}
              <circle cx={ptTrail2.x} cy={ptTrail2.y} r="0.003" fill="#0066ff" opacity={particleGlow * 0.2} />
              <circle cx={ptTrail1.x} cy={ptTrail1.y} r="0.004" fill="#00aaff" opacity={particleGlow * 0.5} />
              {/* Main flowing particle */}
              <circle cx={pt.x} cy={pt.y} r="0.006" fill="#00ffff" opacity={particleGlow * 0.9} />
              <circle cx={pt.x} cy={pt.y} r="0.003" fill="#ffffff" opacity={particleGlow} />
            </g>
          );
        })}

        {/* Floating bioluminescent particles */}
        {PARTICLES.map((p, i) => {
          const floatX = p.x + 0.02 * Math.sin(time * p.speed + p.phase);
          const floatY = p.y + 0.015 * Math.cos(time * p.speed * 0.7 + p.phase + 1.2);
          const particleOpacity = 0.3 + 0.4 * Math.sin(time * p.speed * 2 + p.phase);
          const r = (p.size * 0.0008) + 0.0005 * Math.sin(time * 2 + i);
          const hue = (i * 13 + frame * 0.05) % 60; // blue to cyan range
          const color = i % 3 === 0 ? '#00ffcc' : i % 3 === 1 ? '#0088ff' : '#00eeff';
          return (
            <circle
              key={`particle${i}`}
              cx={floatX}
              cy={floatY}
              r={r}
              fill={color}
              opacity={particleOpacity}
              filter="url(#particleGlow)"
            />
          );
        })}

        {/* Port nodes */}
        {PORTS.map((port, i) => {
          const portPulse = 0.6 + 0.4 * Math.sin(time * 2.5 + i * 0.8);
          const ringScale = 1 + 0.3 * Math.sin(time * 2 + i * 1.1);
          const outerRingOpacity = interpolate(
            (frame + i * 20) % 90,
            [0, 45, 90],
            [0.8, 0.2, 0.8],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          return (
            <g key={`port${i}`} filter="url(#portGlow)">
              {/* Outer pulse ring */}
              <circle
                cx={port.x}
                cy={port.y}
                r={0.012 * ringScale}
                fill="none"
                stroke="#00ffff"
                strokeWidth="0.001"
                opacity={outerRingOpacity * 0.4}
              />
              {/* Mid ring */}
              <circle
                cx={port.x}
                cy={port.y}
                r={0.008}
                fill="none"
                stroke="#00ddff"
                strokeWidth="0.0015"
                opacity={portPulse * 0.7}
              />
              {/* Core */}
              <circle
                cx={port.x}
                cy={port.y}
                r={0.004}
                fill="#00eeff"
                opacity={portPulse}
              />
              {/* Bright center */}
              <circle
                cx={port.x}
                cy={port.y}
                r={0.002}
                fill="#ffffff"
                opacity={portPulse * 0.9}
              />
            </g>
          );
        })}

        {/* Large bioluminescent bloom overlays */}
        {[
          { x: 0.15, y: 0.6, r: 0.08, phase: 0 },
          { x: 0.5, y: 0.5, r: 0.12, phase: 1.5 },
          { x: 0.8, y: 0.45, r: 0.07, phase: 3 },
          { x: 0.35, y: 0.7, r: 0.06, phase: 4.5 },
          { x: 0.7, y: 0.7, r: 0.09, phase: 2 },
        ].map((bloom, i) => {
          const bloomPulse = 0.04 + 0.03 * Math.sin(time * 0.8 + bloom.phase);
          return (
            <radialGradient key={`blg${i}`} id={`bloom${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00aaff" stopOpacity={bloomPulse} />
              <stop offset="100%" stopColor="#001133" stopOpacity="0" />
            </radialGradient>
          );
        })}
        {[
          { x: 0.15, y: 0.6, r: 0.08, phase: 0 },
          { x: 0.5, y: 0.5, r: 0.12, phase: 1.5 },
          { x: 0.8, y: 0.45, r: 0.07, phase: 3 },
          { x: 0.35, y: 0.7, r: 0.06, phase: 4.5 },
          { x: 0.7, y: 0.7, r: 0.09, phase: 2 },
        ].map((bloom, i) => {
          const bloomOpacity = 0.3 + 0.25 * Math.sin(time * 0.8 + bloom.phase);
          return (
            <ellipse
              key={`bloom${i}`}
              cx={bloom.x}
              cy={bloom.y}
              rx={bloom.r * (1 + 0.1 * Math.sin(time * 0.5 + bloom.phase))}
              ry={bloom.r * 0.6 * (1 + 0.1 * Math.cos(time * 0.5 + bloom.phase))}
              fill={`url(#bloom${i})`}
              opacity={bloomOpacity}
            />
          );
        })}

        {/* Vignette overlay */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="40%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.7" />
        </radialGradient>
        <rect x="0" y="0" width="1" height="1" fill="url(#vignette)" />

        {/* Scanline overlay for depth */}
        {Array.from({ length: 30 }, (_, i) => (
          <line key={`scan${i}`}
            x1="0" y1={i / 30} x2="1" y2={i / 30}
            stroke="#000011" strokeWidth="0.001" opacity="0.15"
          />
        ))}
      </svg>

      {/* Additional CSS-free glow overlay using div */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `radial-gradient(ellipse at ${50 + 10 * Math.sin(time * 0.3)}% ${50 + 8 * Math.cos(time * 0.2)}%, rgba(0,100,255,0.04) 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />
    </div>
  );
};