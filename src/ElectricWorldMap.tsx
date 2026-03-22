import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Continent relay nodes (normalized 0-1 coords mapped to SVG)
const NODES = [
  { id: 0, x: 0.22, y: 0.38, label: 'NA' },
  { id: 1, x: 0.48, y: 0.32, label: 'EU' },
  { id: 2, x: 0.55, y: 0.55, label: 'AF' },
  { id: 3, x: 0.72, y: 0.38, label: 'AS' },
  { id: 4, x: 0.80, y: 0.62, label: 'OC' },
  { id: 5, x: 0.30, y: 0.65, label: 'SA' },
  { id: 6, x: 0.63, y: 0.25, label: 'RU' },
];

const CONNECTIONS = [
  { from: 0, to: 1, delay: 0 },
  { from: 1, to: 3, delay: 18 },
  { from: 3, to: 4, delay: 36 },
  { from: 1, to: 2, delay: 12 },
  { from: 0, to: 5, delay: 24 },
  { from: 2, to: 3, delay: 42 },
  { from: 1, to: 6, delay: 6 },
  { from: 6, to: 3, delay: 30 },
  { from: 5, to: 2, delay: 48 },
  { from: 3, to: 2, delay: 54 },
  { from: 0, to: 6, delay: 60 },
  { from: 4, to: 2, delay: 66 },
];

// Pre-computed lightning bolt segment offsets
const BOLT_OFFSETS = Array.from({ length: 40 }, (_, i) => ({
  ox: ((i * 1731 + 97) % 200) / 1000 - 0.1,
  oy: ((i * 1337 + 53) % 200) / 1000 - 0.1,
}));

// Stars
const STARS = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1973) % 3840,
  y: (i * 1291) % 2160,
  r: ((i * 317) % 4) + 1,
  twinkleOffset: (i * 73) % 60,
}));

// Floating data particles per connection
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  tOffset: (i * 17) % 60,
  connIdx: i % CONNECTIONS.length,
}));

// World map simplified polygon paths (normalized, will be scaled)
const LAND_PATHS = [
  // North America
  'M 0.08,0.20 L 0.15,0.18 L 0.22,0.22 L 0.30,0.25 L 0.33,0.35 L 0.28,0.45 L 0.22,0.52 L 0.18,0.48 L 0.12,0.42 L 0.08,0.35 Z',
  // South America
  'M 0.22,0.52 L 0.28,0.50 L 0.34,0.55 L 0.35,0.68 L 0.30,0.78 L 0.24,0.75 L 0.20,0.65 L 0.20,0.58 Z',
  // Europe
  'M 0.42,0.18 L 0.52,0.16 L 0.56,0.20 L 0.54,0.30 L 0.48,0.35 L 0.44,0.32 L 0.40,0.28 Z',
  // Africa
  'M 0.44,0.35 L 0.54,0.33 L 0.62,0.40 L 0.62,0.58 L 0.56,0.68 L 0.48,0.65 L 0.44,0.55 Z',
  // Asia
  'M 0.56,0.16 L 0.78,0.14 L 0.88,0.22 L 0.88,0.38 L 0.80,0.48 L 0.70,0.50 L 0.62,0.44 L 0.60,0.35 L 0.56,0.28 Z',
  // Australia
  'M 0.74,0.58 L 0.84,0.56 L 0.88,0.65 L 0.84,0.72 L 0.76,0.72 L 0.72,0.65 Z',
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getLightningPath(
  x1: number, y1: number, x2: number, y2: number,
  boltOffsets: typeof BOLT_OFFSETS,
  segments: number = 8
): string {
  const pts: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const bx = lerp(x1, x2, t);
    const by = lerp(y1, y2, t);
    if (i === 0 || i === segments) {
      pts.push([bx, by]);
    } else {
      const idx = (i - 1) % boltOffsets.length;
      pts.push([bx + boltOffsets[idx].ox * (x2 - x1), by + boltOffsets[idx].oy * (y2 - y1)]);
    }
  }
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]},${p[1]}`).join(' ');
}

export const ElectricWorldMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const svgW = width;
  const svgH = height;

  // Map node screen coords
  const nodeCoords = NODES.map(n => ({
    ...n,
    sx: n.x * svgW,
    sy: n.y * svgH,
  }));

  // Pulsing grid lines
  const gridLines: JSX.Element[] = [];
  const gridCols = 24;
  const gridRows = 14;
  for (let c = 0; c <= gridCols; c++) {
    const x = (c / gridCols) * svgW;
    const gOpacity = 0.06 + 0.04 * Math.sin(frame * 0.04 + c * 0.3);
    gridLines.push(
      <line key={`gc${c}`} x1={x} y1={0} x2={x} y2={svgH}
        stroke="#00ffff" strokeWidth={1} opacity={gOpacity} />
    );
  }
  for (let r = 0; r <= gridRows; r++) {
    const y = (r / gridRows) * svgH;
    const gOpacity = 0.06 + 0.04 * Math.sin(frame * 0.04 + r * 0.5);
    gridLines.push(
      <line key={`gr${r}`} x1={0} y1={y} x2={svgW} y2={y}
        stroke="#00ffff" strokeWidth={1} opacity={gOpacity} />
    );
  }

  // Lightning bolt connections
  const lightningElements: JSX.Element[] = [];
  CONNECTIONS.forEach((conn, ci) => {
    const fromNode = nodeCoords[conn.from];
    const toNode = nodeCoords[conn.to];
    const cycleLen = 80;
    const t = ((frame + conn.delay * 2) % cycleLen) / cycleLen;
    const boltVisible = t < 0.35;
    const boltAlpha = boltVisible
      ? interpolate(t, [0, 0.05, 0.25, 0.35], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      : 0;

    if (boltAlpha > 0) {
      // Use different bolt offsets per connection
      const offsetSlice = BOLT_OFFSETS.slice((ci * 3) % (BOLT_OFFSETS.length - 8), (ci * 3) % (BOLT_OFFSETS.length - 8) + 8);
      const path1 = getLightningPath(fromNode.sx, fromNode.sy, toNode.sx, toNode.sy, offsetSlice, 8);
      const offsetSlice2 = BOLT_OFFSETS.slice((ci * 5 + 4) % (BOLT_OFFSETS.length - 8), (ci * 5 + 4) % (BOLT_OFFSETS.length - 8) + 8);
      const path2 = getLightningPath(fromNode.sx, fromNode.sy, toNode.sx, toNode.sy, offsetSlice2, 8);

      lightningElements.push(
        <g key={`bolt${ci}`} opacity={boltAlpha}>
          {/* Outer glow */}
          <path d={path1} fill="none" stroke="#ffffff" strokeWidth={12} opacity={0.08}
            strokeLinecap="round" />
          <path d={path1} fill="none" stroke="#00eeff" strokeWidth={6} opacity={0.3}
            strokeLinecap="round" />
          {/* Core bolt */}
          <path d={path1} fill="none" stroke="#ffffff" strokeWidth={2.5} opacity={0.9}
            strokeLinecap="round" />
          {/* Secondary bolt */}
          <path d={path2} fill="none" stroke="#88ffff" strokeWidth={1.5} opacity={0.5}
            strokeLinecap="round" />
        </g>
      );
    }

    // Static faint arc connection
    const mx = (fromNode.sx + toNode.sx) / 2;
    const my = (fromNode.sy + toNode.sy) / 2 - Math.abs(toNode.sx - fromNode.sx) * 0.12;
    lightningElements.push(
      <path
        key={`arc${ci}`}
        d={`M ${fromNode.sx},${fromNode.sy} Q ${mx},${my} ${toNode.sx},${toNode.sy}`}
        fill="none"
        stroke="#004488"
        strokeWidth={1.5}
        opacity={0.35}
        strokeDasharray="10 8"
      />
    );
  });

  // Data packets traveling along connections
  const dataPackets: JSX.Element[] = [];
  PARTICLES.forEach((p, pi) => {
    const conn = CONNECTIONS[p.connIdx];
    const fromNode = nodeCoords[conn.from];
    const toNode = nodeCoords[conn.to];
    const cycleLen = 90;
    const t = ((frame + p.tOffset * 4 + conn.delay) % cycleLen) / cycleLen;
    const px = lerp(fromNode.sx, toNode.sx, t);
    const py = lerp(fromNode.sy, toNode.sy, t);
    const alpha = interpolate(t, [0, 0.1, 0.85, 1], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    dataPackets.push(
      <g key={`pkt${pi}`} opacity={alpha}>
        <circle cx={px} cy={py} r={14} fill="#00ccff" opacity={0.15} />
        <circle cx={px} cy={py} r={7} fill="#00eeff" opacity={0.5} />
        <circle cx={px} cy={py} r={3} fill="#ffffff" opacity={0.95} />
      </g>
    );
  });

  // Node rings and pulse
  const nodeElements: JSX.Element[] = nodeCoords.map((n, ni) => {
    const pulseT = (frame * 0.05 + ni * 1.1) % (Math.PI * 2);
    const pulseR = 28 + 14 * Math.sin(pulseT);
    const pulseAlpha = 0.3 + 0.2 * Math.sin(pulseT);
    const outerPulseR = 50 + 25 * Math.sin(pulseT * 0.7 + ni);
    return (
      <g key={`node${ni}`}>
        {/* Outer pulse ring */}
        <circle cx={n.sx} cy={n.sy} r={outerPulseR} fill="none"
          stroke="#00ffff" strokeWidth={1.5} opacity={pulseAlpha * 0.4} />
        {/* Inner pulse ring */}
        <circle cx={n.sx} cy={n.sy} r={pulseR} fill="none"
          stroke="#00eeff" strokeWidth={2} opacity={pulseAlpha} />
        {/* Glow halo */}
        <circle cx={n.sx} cy={n.sy} r={22} fill="#004466" opacity={0.6} />
        <circle cx={n.sx} cy={n.sy} r={22} fill="none"
          stroke="#00ffff" strokeWidth={3} opacity={0.8} />
        {/* Core dot */}
        <circle cx={n.sx} cy={n.sy} r={10} fill="#00eeff" opacity={0.9} />
        <circle cx={n.sx} cy={n.sy} r={5} fill="#ffffff" opacity={1} />
        {/* Cross reticle */}
        <line x1={n.sx - 35} y1={n.sy} x2={n.sx - 25} y2={n.sy}
          stroke="#00ffff" strokeWidth={2} opacity={0.7} />
        <line x1={n.sx + 25} y1={n.sy} x2={n.sx + 35} y2={n.sy}
          stroke="#00ffff" strokeWidth={2} opacity={0.7} />
        <line x1={n.sx} y1={n.sy - 35} x2={n.sx} y2={n.sy - 25}
          stroke="#00ffff" strokeWidth={2} opacity={0.7} />
        <line x1={n.sx} y1={n.sy + 25} x2={n.sx} y2={n.sy + 35}
          stroke="#00ffff" strokeWidth={2} opacity={0.7} />
      </g>
    );
  });

  // Land masses
  const landElements = LAND_PATHS.map((d, li) => {
    const scaledD = d.replace(/(\d+\.\d+),(\d+\.\d+)/g, (_, nx, ny) => {
      return `${parseFloat(nx) * svgW},${parseFloat(ny) * svgH}`;
    });
    return (
      <path
        key={`land${li}`}
        d={scaledD}
        fill="#001a2e"
        stroke="#00334d"
        strokeWidth={3}
        opacity={0.85}
      />
    );
  });

  // Stars twinkle
  const starElements = STARS.map((s, si) => {
    const twinkle = 0.4 + 0.6 * Math.abs(Math.sin((frame + s.twinkleOffset) * 0.05));
    return (
      <circle key={`star${si}`} cx={s.x} cy={s.y} r={s.r}
        fill="#aaddff" opacity={twinkle * 0.5} />
    );
  });

  // Global electric flicker overlay
  const flickerAlpha = 0.015 + 0.01 * Math.sin(frame * 1.7) + 0.008 * Math.sin(frame * 3.1);

  // Vignette gradient id
  const vigId = 'vigGrad';
  const glowId = 'glowBlur';

  return (
    <div style={{
      width, height,
      background: '#000810',
      overflow: 'hidden',
      opacity: globalOpacity,
      position: 'relative',
    }}>
      <svg width={svgW} height={svgH} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id={vigId} cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#000810" stopOpacity="0" />
            <stop offset="100%" stopColor="#000005" stopOpacity="0.85" />
          </radialGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background stars */}
        {starElements}

        {/* Grid */}
        {gridLines}

        {/* Land */}
        {landElements}

        {/* Connections and bolts */}
        {lightningElements}

        {/* Data packets */}
        {dataPackets}

        {/* Nodes */}
        <g filter={`url(#${glowId})`}>
          {nodeElements}
        </g>

        {/* Flicker overlay */}
        <rect x={0} y={0} width={svgW} height={svgH}
          fill="#00ffff" opacity={flickerAlpha} />

        {/* Vignette */}
        <rect x={0} y={0} width={svgW} height={svgH}
          fill={`url(#${vigId})`} />
      </svg>
    </div>
  );
};