import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// World map simplified paths (Mercator projection approximations)
// Coordinates normalized to 0-1 range for width/height scaling

// Manufacturing hubs (major industrial centers)
const HUBS = [
  { id: 'shanghai', x: 0.785, y: 0.335, label: 'Shanghai' },
  { id: 'shenzhen', x: 0.775, y: 0.365, label: 'Shenzhen' },
  { id: 'tokyo', x: 0.825, y: 0.32, label: 'Tokyo' },
  { id: 'bangalore', x: 0.695, y: 0.41, label: 'Bangalore' },
  { id: 'seoul', x: 0.81, y: 0.31, label: 'Seoul' },
  { id: 'detroit', x: 0.235, y: 0.295, label: 'Detroit' },
  { id: 'stuttgart', x: 0.495, y: 0.26, label: 'Stuttgart' },
  { id: 'mexico', x: 0.195, y: 0.39, label: 'Mexico City' },
];

// Consumer markets
const MARKETS = [
  { id: 'newyork', x: 0.265, y: 0.3, label: 'New York' },
  { id: 'losangeles', x: 0.155, y: 0.34, label: 'Los Angeles' },
  { id: 'london', x: 0.47, y: 0.245, label: 'London' },
  { id: 'dubai', x: 0.625, y: 0.375, label: 'Dubai' },
  { id: 'singapore', x: 0.775, y: 0.44, label: 'Singapore' },
  { id: 'sydney', x: 0.865, y: 0.62, label: 'Sydney' },
  { id: 'saopaulo', x: 0.295, y: 0.585, label: 'São Paulo' },
  { id: 'mumbai', x: 0.68, y: 0.4, label: 'Mumbai' },
  { id: 'paris', x: 0.485, y: 0.255, label: 'Paris' },
  { id: 'toronto', x: 0.25, y: 0.285, label: 'Toronto' },
];

// Freight corridors connecting hubs to markets
const CORRIDORS = [
  { from: 'shanghai', to: 'losangeles', type: 'sea', delay: 0 },
  { from: 'shanghai', to: 'newyork', type: 'sea', delay: 8 },
  { from: 'shanghai', to: 'london', type: 'sea', delay: 15 },
  { from: 'shanghai', to: 'dubai', type: 'sea', delay: 5 },
  { from: 'shenzhen', to: 'singapore', type: 'sea', delay: 3 },
  { from: 'shenzhen', to: 'sydney', type: 'sea', delay: 20 },
  { from: 'shenzhen', to: 'saopaulo', type: 'sea', delay: 12 },
  { from: 'tokyo', to: 'losangeles', type: 'sea', delay: 7 },
  { from: 'tokyo', to: 'newyork', type: 'air', delay: 18 },
  { from: 'tokyo', to: 'toronto', type: 'air', delay: 25 },
  { from: 'bangalore', to: 'dubai', type: 'air', delay: 2 },
  { from: 'bangalore', to: 'london', type: 'air', delay: 22 },
  { from: 'bangalore', to: 'mumbai', type: 'land', delay: 1 },
  { from: 'seoul', to: 'losangeles', type: 'sea', delay: 10 },
  { from: 'seoul', to: 'singapore', type: 'sea', delay: 16 },
  { from: 'detroit', to: 'newyork', type: 'land', delay: 4 },
  { from: 'detroit', to: 'toronto', type: 'land', delay: 0 },
  { from: 'detroit', to: 'losangeles', type: 'land', delay: 14 },
  { from: 'stuttgart', to: 'london', type: 'land', delay: 6 },
  { from: 'stuttgart', to: 'dubai', type: 'air', delay: 9 },
  { from: 'stuttgart', to: 'paris', type: 'land', delay: 1 },
  { from: 'mexico', to: 'newyork', type: 'land', delay: 11 },
  { from: 'mexico', to: 'saopaulo', type: 'air', delay: 17 },
  { from: 'mexico', to: 'losangeles', type: 'land', delay: 3 },
  { from: 'shanghai', to: 'toronto', type: 'air', delay: 28 },
  { from: 'shenzhen', to: 'paris', type: 'air', delay: 24 },
];

// Particles per corridor
const PARTICLES_PER_CORRIDOR = 5;

// Pre-compute particle offsets deterministically
const PARTICLE_OFFSETS = Array.from({ length: CORRIDORS.length * PARTICLES_PER_CORRIDOR }, (_, i) => ({
  phase: (i * 0.2) % 1.0,
  size: 3 + (i % 5),
  speedMult: 0.7 + (i % 7) * 0.1,
}));

// Pre-compute star field
const STARS = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731 + 42) % 3840,
  y: (i * 1337 + 77) % 2160,
  r: 0.5 + (i % 4) * 0.5,
  brightness: 0.2 + (i % 8) * 0.1,
}));

// Pre-compute grid lines
const GRID_LAT = Array.from({ length: 13 }, (_, i) => i / 12);
const GRID_LON = Array.from({ length: 25 }, (_, i) => i / 24);

// Helper: get node position
const getPos = (id: string, width: number, height: number) => {
  const all = [...HUBS, ...MARKETS];
  const node = all.find(n => n.id === id);
  if (!node) return { x: 0, y: 0 };
  return { x: node.x * width, y: node.y * height };
};

// Helper: cubic bezier control point (arched path)
const getControlPoint = (
  x1: number, y1: number, x2: number, y2: number, type: string
) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const archHeight = type === 'air' ? -0.18 : type === 'sea' ? -0.12 : -0.07;
  return {
    cx: mx - dy * archHeight * 0.5,
    cy: my + dx * archHeight * 0.5 - len * Math.abs(archHeight) * 0.3,
  };
};

// Quadratic bezier point
const quadBezier = (t: number, x1: number, y1: number, cx: number, cy: number, x2: number, y2: number) => {
  const mt = 1 - t;
  return {
    x: mt * mt * x1 + 2 * mt * t * cx + t * t * x2,
    y: mt * mt * y1 + 2 * mt * t * cy + t * t * y2,
  };
};

// Color by type
const corridorColor = (type: string) => {
  if (type === 'air') return '#00d4ff';
  if (type === 'sea') return '#0066ff';
  return '#ff8c00';
};

const particleColor = (type: string) => {
  if (type === 'air') return '#80ffff';
  if (type === 'sea') return '#4499ff';
  return '#ffcc44';
};

export const FreightCorridorMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalFade = interpolate(frame, [0, 50, durationInFrames - 50, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Animated time
  const t = frame / 30; // seconds

  // Overall reveal
  const mapReveal = interpolate(frame, [0, 80], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        width,
        height,
        background: '#04070f',
        overflow: 'hidden',
        opacity: globalFade,
        position: 'relative',
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Stars */}
        {STARS.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill={`rgba(255,255,255,${star.brightness * mapReveal})`}
          />
        ))}

        {/* Grid lines (Mercator style) */}
        {GRID_LAT.map((frac, i) => (
          <line
            key={`lat-${i}`}
            x1={0}
            y1={frac * height}
            x2={width}
            y2={frac * height}
            stroke="rgba(30,80,140,0.25)"
            strokeWidth={1}
            opacity={mapReveal}
          />
        ))}
        {GRID_LON.map((frac, i) => (
          <line
            key={`lon-${i}`}
            x1={frac * width}
            y1={0}
            x2={frac * width}
            y2={height}
            stroke="rgba(30,80,140,0.25)"
            strokeWidth={1}
            opacity={mapReveal}
          />
        ))}

        {/* Continent outlines (very simplified shapes) */}
        {/* North America */}
        <path
          d="M 150,180 Q 200,150 280,160 Q 330,165 370,200 Q 400,230 390,280 Q 370,320 340,360 Q 280,420 240,460 Q 200,480 180,440 Q 160,400 140,350 Q 120,290 130,240 Z"
          fill="rgba(20,50,90,0.45)"
          stroke="rgba(40,120,200,0.5)"
          strokeWidth={2}
          opacity={mapReveal}
          transform={`scale(${width / 3840}, ${height / 2160})`}
        />
        {/* South America */}
        <path
          d="M 900,880 Q 950,820 1000,850 Q 1060,870 1080,930 Q 1100,1000 1080,1080 Q 1060,1150 1020,1200 Q 970,1240 920,1210 Q 870,1170 850,1100 Q 830,1020 840,950 Z"
          fill="rgba(20,50,90,0.45)"
          stroke="rgba(40,120,200,0.5)"
          strokeWidth={2}
          opacity={mapReveal}
          transform={`scale(${width / 3840}, ${height / 2160})`}
        />
        {/* Europe */}
        <path
          d="M 1680,380 Q 1730,340 1800,350 Q 1860,360 1880,400 Q 1900,440 1870,480 Q 1840,510 1790,520 Q 1730,525 1690,500 Q 1660,470 1660,430 Z"
          fill="rgba(20,50,90,0.45)"
          stroke="rgba(40,120,200,0.5)"
          strokeWidth={2}
          opacity={mapReveal}
          transform={`scale(${width / 3840}, ${height / 2160})`}
        />
        {/* Africa */}
        <path
          d="M 1700,560 Q 1760,530 1840,540 Q 1920,555 1960,620 Q 2000,700 1980,800 Q 1960,900 1900,970 Q 1840,1020 1760,1010 Q 1680,990 1640,920 Q 1600,840 1610,740 Q 1620,640 1660,590 Z"
          fill="rgba(20,50,90,0.45)"
          stroke="rgba(40,120,200,0.5)"
          strokeWidth={2}
          opacity={mapReveal}
          transform={`scale(${width / 3840}, ${height / 2160})`}
        />
        {/* Asia */}
        <path
          d="M 2080,200 Q 2300,180 2600,200 Q 2900,220 3100,300 Q 3200,350 3200,420 Q 3200,500 3100,550 Q 2950,600 2800,580 Q 2600,560 2400,540 Q 2200,500 2100,440 Q 2000,390 1980,320 Q 1970,270 2000,230 Z"
          fill="rgba(20,50,90,0.45)"
          stroke="rgba(40,120,200,0.5)"
          strokeWidth={2}
          opacity={mapReveal}
          transform={`scale(${width / 3840}, ${height / 2160})`}
        />
        {/* Australia */}
        <path
          d="M 3100,1080 Q 3200,1040 3300,1060 Q 3400,1090 3420,1160 Q 3440,1240 3380,1300 Q 3300,1340 3200,1320 Q 3100,1290 3070,1220 Q 3040,1150 3070,1110 Z"
          fill="rgba(20,50,90,0.45)"
          stroke="rgba(40,120,200,0.5)"
          strokeWidth={2}
          opacity={mapReveal}
          transform={`scale(${width / 3840}, ${height / 2160})`}
        />

        {/* Freight corridor lines */}
        {CORRIDORS.map((corridor, ci) => {
          const from = getPos(corridor.from, width, height);
          const to = getPos(corridor.to, width, height);
          const cp = getControlPoint(from.x, from.y, to.x, to.y, corridor.type);
          const pathD = `M ${from.x} ${from.y} Q ${cp.cx} ${cp.cy} ${to.x} ${to.y}`;
          const color = corridorColor(corridor.type);

          const corridorReveal = interpolate(
            frame,
            [corridor.delay * 3, corridor.delay * 3 + 40],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          // Animated dash offset for flowing effect
          const dashOffset = -(t * 60 * (0.8 + (ci % 5) * 0.08));

          return (
            <g key={`corridor-${ci}`} opacity={corridorReveal}>
              {/* Base glow line */}
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={3}
                strokeOpacity={0.15}
              />
              {/* Animated dashed line */}
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeOpacity={0.6}
                strokeDasharray="20 30"
                strokeDashoffset={dashOffset}
              />
              {/* Bright core line */}
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={1}
                strokeOpacity={0.3}
                strokeDasharray="5 45"
                strokeDashoffset={dashOffset * 1.5}
              />
            </g>
          );
        })}

        {/* Freight particles along corridors */}
        {CORRIDORS.map((corridor, ci) => {
          const from = getPos(corridor.from, width, height);
          const to = getPos(corridor.to, width, height);
          const cp = getControlPoint(from.x, from.y, to.x, to.y, corridor.type);
          const color = particleColor(corridor.type);

          const corridorReveal = interpolate(
            frame,
            [corridor.delay * 3, corridor.delay * 3 + 40],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          return Array.from({ length: PARTICLES_PER_CORRIDOR }, (_, pi) => {
            const pIdx = ci * PARTICLES_PER_CORRIDOR + pi;
            const offset = PARTICLE_OFFSETS[pIdx];
            const speed = 0.12 * offset.speedMult;
            const rawT = ((t * speed + offset.phase) % 1 + 1) % 1;
            const pos = quadBezier(rawT, from.x, from.y, cp.cx, cp.cy, to.x, to.y);

            // Fade near edges of path
            const edgeFade = Math.min(rawT * 6, 1) * Math.min((1 - rawT) * 6, 1);

            return (
              <g key={`particle-${ci}-${pi}`} opacity={corridorReveal * edgeFade}>
                {/* Glow halo */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={offset.size * 3}
                  fill={color}
                  opacity={0.08}
                />
                {/* Core dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={offset.size * 0.8}
                  fill={color}
                  opacity={0.9}
                />
                {/* Bright center */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={offset.size * 0.3}
                  fill="white"
                  opacity={0.7}
                />
              </g>
            );
          });
        })}

        {/* Manufacturing hub nodes */}
        {HUBS.map((hub, i) => {
          const x = hub.x * width;
          const y = hub.y * height;
          const hubReveal = interpolate(
            frame,
            [i * 5 + 20, i * 5 + 60],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          // Pulsing ring
          const pulseT = ((t * 1.2 + i * 0.4) % 1 + 1) % 1;
          const pulseR = interpolate(pulseT, [0, 1], [12, 45]);
          const pulseOpacity = interpolate(pulseT, [0, 0.5, 1], [0.8, 0.3, 0]);

          return (
            <g key={`hub-${i}`} opacity={hubReveal}>
              {/* Outer pulse ring */}
              <circle cx={x} cy={y} r={pulseR} fill="none" stroke="#ff8c00" strokeWidth={2} opacity={pulseOpacity} />
              {/* Second pulse ring offset */}
              <circle
                cx={x} cy={y}
                r={interpolate(((pulseT + 0.5) % 1), [0, 1], [12, 45])}
                fill="none" stroke="#ff8c00" strokeWidth={1.5}
                opacity={interpolate(((pulseT + 0.5) % 1), [0, 0.5, 1], [0.5, 0.15, 0])}
              />
              {/* Glow halo */}
              <circle cx={x} cy={y} r={18} fill="#ff8c00" opacity={0.12} />
              {/* Node circle */}
              <circle cx={x} cy={y} r={8} fill="#ff6600" stroke="#ffaa44" strokeWidth={2} />
              {/* Center dot */}
              <circle cx={x} cy={y} r={3} fill="white" opacity={0.9} />
              {/* Cross marks */}
              <line x1={x - 14} y1={y} x2={x + 14} y2={y} stroke="#ff8c00" strokeWidth={1} opacity={0.5} />
              <line x1={x} y1={y - 14} x2={x} y2={y + 14} stroke="#ff8c00" strokeWidth={1} opacity={0.5} />
            </g>
          );
        })}

        {/* Consumer market nodes */}
        {MARKETS.map((market, i) => {
          const x = market.x * width;
          const y = market.y * height;
          const marketReveal = interpolate(
            frame,
            [i * 4 + 30, i * 4 + 70],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const pulseT = ((t * 0.9 + i * 0.35) % 1 + 1) % 1;
          const pulseR = interpolate(pulseT, [0, 1], [10, 38]);
          const pulseOpacity = interpolate(pulseT, [0, 0.5, 1], [0.7, 0.25, 0]);

          return (
            <g key={`market-${i}`} opacity={marketReveal}>
              {/* Outer pulse ring */}
              <circle cx={x} cy={y} r={pulseR} fill="none" stroke="#00d4ff" strokeWidth={1.5} opacity={pulseOpacity} />
              {/* Glow halo */}
              <circle cx={x} cy={y} r={15} fill="#00d4ff" opacity={0.1} />
              {/* Node diamond */}
              <polygon
                points={`${x},${y - 9} ${x + 9},${y} ${x},${y + 9} ${x - 9},${y}`}
                fill="#0088cc"
                stroke="#00d4ff"
                strokeWidth={1.5}
              />
              {/* Center dot */}
              <circle cx={x} cy={y} r={2.5} fill="white" opacity={0.9} />
            </g>
          );
        })}

        {/* Global data overlay - scanning line */}
        {(() => {
          const scanX = ((t * 0.08) % 1) * width;
          return (
            <line
              x1={scanX}
              y1={0}
              x2={scanX}
              y2={height}
              stroke="rgba(0,180,255,0.06)"
              strokeWidth={3}
            />
          );
        })()}

        {/* Corner decorative elements */}
        {/* Top-left bracket */}
        <path d={`M 60,60 L 60,30 L 90,30`} fill="none" stroke="rgba(0,180,255,0.5)" strokeWidth={3} opacity={mapReveal} />
        <path d={`M 60,60 L 30,60 L 30,30`} fill="none" stroke="rgba(0,180,255,0.5)" strokeWidth={3} opacity={mapReveal} />
        {/* Top-right bracket */}
        <path d={`M ${width - 60},60 L ${width - 60},30 L ${width - 90},30`} fill="none" stroke="rgba(0,180,255,0.5)" strokeWidth={3} opacity={mapReveal} />
        <path d={`M ${width - 60},60 L ${width - 30},60 L ${width - 30},30`} fill="none" stroke="rgba(0,180,255,0.5)" strokeWidth={3} opacity={mapReveal} />
        {/* Bottom-left bracket */}
        <path d={`M 60,${height - 60} L 60,${height - 30} L 90,${height - 30}`} fill="none" stroke="rgba(0,180,255,0.5)" strokeWidth={3} opacity={mapReveal} />
        <path d={`M 60,${height - 60} L 30,${height - 60} L 30,${height - 30}`} fill="none" stroke="rgba(0,180,255,0.5)" strokeWidth={3} opacity={mapReveal} />
        {/* Bottom-right bracket */}
        <path d={`M ${width - 60},${height - 60} L ${width - 60},${height - 30} L ${width - 90},${height - 30}`} fill="none" stroke="rgba(0,180,255,0.5)" strokeWidth={3} opacity={mapReveal} />
        <path d={`M ${width - 60},${height - 60} L ${width - 30},${height - 60} L ${width - 30},${height - 30}`} fill="none" stroke="rgba(0,180,255,0.5)" strokeWidth={3} opacity={mapReveal} />

        {/* Legend indicators */}
        {/* Sea route indicator */}
        <line x1={80} y1={height - 130} x2={160} y2={height - 130} stroke="#0066ff" strokeWidth={3} opacity={mapReveal * 0.8} strokeDasharray="15 10" />
        <circle cx={250} cy={height - 130} r={6} fill="#0066ff" opacity={mapReveal * 0.8} />
        {/* Air route indicator */}
        <line x1={80} y1={height - 190} x2={160} y2={height - 190} stroke="#00d4ff" strokeWidth={3} opacity={mapReveal * 0.8} strokeDasharray="15 10" />
        <circle cx={250} cy={height - 190} r={6} fill="#00d4ff" opacity={mapReveal * 0.8} />
        {/* Land route indicator */}
        <line x1={80} y1={height - 250} x2={160} y2={height - 250} stroke="#ff8c00" strokeWidth={3} opacity={mapReveal * 0.8} strokeDasharray="15 10" />
        <circle cx={250} cy={height - 250} r={6} fill="#ff8c00" opacity={mapReveal * 0.8} />

        {/* Hub marker legend */}
        <circle cx={90} cy={height - 310} r={8} fill="#ff6600" stroke="#ffaa44" strokeWidth={2} opacity={mapReveal * 0.8} />
        <polygon
          points={`90,${height - 390 - 9} ${99},${height - 390} ${90},${height - 390 + 9} ${81},${height - 390}`}
          fill="#0088cc"
          stroke="#00d4ff"
          strokeWidth={1.5}
          opacity={mapReveal * 0.8}
        />

        {/* Equator line */}
        <line x1={0} y1={height * 0.52} x2={width} y2={height * 0.52} stroke="rgba(0,180,255,0.12)" strokeWidth={2} strokeDasharray="40 20" opacity={mapReveal} />

        {/* Tropic lines */}
        <line x1={0} y1={height * 0.42} x2={width} y2={height * 0.42} stroke="rgba(0,180,255,0.07)" strokeWidth={1.5} strokeDasharray="20 30" opacity={mapReveal} />
        <line x1={0} y1={height * 0.62} x2={width} y2={height * 0.62} stroke="rgba(0,180,255,0.07)" strokeWidth={1.5} strokeDasharray="20 30" opacity={mapReveal} />

        {/* Radial glow at map center */}
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,60,120,0.4)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <rect x={0} y={0} width={width} height={height} fill="url(#centerGlow)" opacity={mapReveal * 0.5} />

        {/* Vignette */}
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.7)" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={width} height={height} fill="url(#vignette)" />
      </svg>
    </div>
  );
};