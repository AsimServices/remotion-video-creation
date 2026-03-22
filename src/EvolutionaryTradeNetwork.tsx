import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Pre-computed node positions and properties
const NODES = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 1731 + 400) % 3600 + 120,
  y: (i * 1337 + 300) % 1900 + 130,
  size: ((i * 7) % 18) + 8,
  era: Math.floor(i / 10), // 0-5 era buckets
  hue: (i * 37) % 360,
  pulseOffset: (i * 13) % 100,
}));

// Pre-computed edges between nodes
const EDGES = Array.from({ length: 180 }, (_, i) => {
  const a = (i * 17) % 60;
  const b = (i * 23 + 7) % 60;
  const era = Math.floor(i / 30);
  return { a, b, era, opacity: ((i * 11) % 5) * 0.1 + 0.3 };
});

// Ancient silk road-like backbone route points
const ANCIENT_ROUTE = [
  { x: 200, y: 1080 },
  { x: 600, y: 900 },
  { x: 1000, y: 800 },
  { x: 1400, y: 750 },
  { x: 1800, y: 700 },
  { x: 2200, y: 720 },
  { x: 2600, y: 780 },
  { x: 3000, y: 850 },
  { x: 3500, y: 950 },
  { x: 3800, y: 1080 },
];

// Secondary routes
const SECONDARY_ROUTES = Array.from({ length: 12 }, (_, i) => ({
  points: Array.from({ length: 5 }, (__, j) => ({
    x: (i * 331 + j * 700 + 200) % 3600 + 100,
    y: (i * 277 + j * 400 + 200) % 1800 + 180,
  })),
  era: Math.floor(i / 2),
  color: `hsl(${(i * 53) % 360}, 80%, 65%)`,
}));

// Particle positions along routes
const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  routeIndex: i % ANCIENT_ROUTE.length,
  speed: ((i * 7) % 10) * 0.003 + 0.002,
  offset: (i * 37) % 100 / 100,
  size: ((i * 3) % 4) + 2,
  color: `hsl(${(i * 41) % 360}, 90%, 70%)`,
}));

// Star field
const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 1231) % 3840,
  y: (i * 987) % 2160,
  size: ((i * 3) % 3) + 0.5,
  brightness: ((i * 17) % 60) + 40,
}));

function catmullRom(points: { x: number; y: number }[], t: number) {
  const n = points.length;
  if (n < 2) return points[0] || { x: 0, y: 0 };
  const scaled = t * (n - 1);
  const i = Math.min(Math.floor(scaled), n - 2);
  const local = scaled - i;
  const p0 = points[Math.max(0, i - 1)];
  const p1 = points[i];
  const p2 = points[Math.min(n - 1, i + 1)];
  const p3 = points[Math.min(n - 1, i + 2)];
  const t2 = local * local;
  const t3 = t2 * local;
  const x =
    0.5 * ((2 * p1.x) + (-p0.x + p2.x) * local + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
  const y =
    0.5 * ((2 * p1.y) + (-p0.y + p2.y) * local + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
  return { x, y };
}

function buildPathD(points: { x: number; y: number }[], progress: number) {
  if (points.length < 2) return '';
  const segments = 80;
  const steps = Math.floor(segments * progress);
  if (steps === 0) return '';
  let d = '';
  for (let s = 0; s <= steps; s++) {
    const t = s / segments;
    const { x, y } = catmullRom(points, t);
    d += s === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return d;
}

export const EvolutionaryTradeNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalProgress = frame / durationInFrames;
  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const masterOpacity = fadeIn * fadeOut;

  // Era progression: 6 eras over the full duration
  const eraProgress = globalProgress * 6;

  // Ancient route draw progress (era 0)
  const ancientRouteProgress = interpolate(eraProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // Background nebula pulse
  const nebulaPulse = Math.sin(frame * 0.02) * 0.5 + 0.5;

  const scaleX = width / 3840;
  const scaleY = height / 2160;

  return (
    <div style={{ width, height, background: '#020408', position: 'relative', overflow: 'hidden', opacity: masterOpacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {/* Radial gradient for background glow */}
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor={`rgba(10, 30, 60, ${0.4 + nebulaPulse * 0.2})`} />
            <stop offset="100%" stopColor="rgba(2, 4, 8, 1)" />
          </radialGradient>
          {/* Ancient route glow */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Gold gradient for ancient route */}
          <linearGradient id="ancientGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B6914" />
            <stop offset="30%" stopColor="#D4A843" />
            <stop offset="60%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#C0922A" />
          </linearGradient>
          {/* Modern network gradient */}
          <linearGradient id="modernBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00BFFF" />
            <stop offset="50%" stopColor="#7B2FFF" />
            <stop offset="100%" stopColor="#FF6B35" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width={width} height={height} fill="url(#bgGlow)" />

        {/* Stars */}
        {STARS.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star.x * scaleX}
            cy={star.y * scaleY}
            r={star.size * Math.min(scaleX, scaleY)}
            fill={`rgba(200, 220, 255, ${(star.brightness / 100) * 0.8})`}
          />
        ))}

        {/* Nebula clouds */}
        {[0, 1, 2, 3].map((idx) => {
          const cx = [960, 2880, 1920, 3200][idx] * scaleX;
          const cy = [540, 1620, 1400, 400][idx] * scaleY;
          const r = [400, 350, 300, 250][idx] * Math.min(scaleX, scaleY);
          const colors = ['#1a0533', '#0a1a3a', '#0d2b1a', '#2a0a1a'];
          const pulse = Math.sin(frame * 0.015 + idx * 1.2) * 0.3 + 0.7;
          return (
            <ellipse
              key={`nebula-${idx}`}
              cx={cx}
              cy={cy}
              rx={r * 2.5 * pulse}
              ry={r * 1.5 * pulse}
              fill={colors[idx]}
              opacity={0.4}
            />
          );
        })}

        {/* Grid overlay for modern era */}
        {eraProgress > 3 && (() => {
          const gridOpacity = interpolate(eraProgress, [3, 5], [0, 0.08], { extrapolateRight: 'clamp' });
          const cols = 20;
          const rows = 12;
          return (
            <g opacity={gridOpacity}>
              {Array.from({ length: cols + 1 }, (_, i) => (
                <line
                  key={`vgrid-${i}`}
                  x1={i * (width / cols)} y1={0}
                  x2={i * (width / cols)} y2={height}
                  stroke="#00BFFF" strokeWidth={0.5}
                />
              ))}
              {Array.from({ length: rows + 1 }, (_, i) => (
                <line
                  key={`hgrid-${i}`}
                  x1={0} y1={i * (height / rows)}
                  x2={width} y2={i * (height / rows)}
                  stroke="#00BFFF" strokeWidth={0.5}
                />
              ))}
            </g>
          );
        })()}

        {/* Ancient route - the backbone */}
        <g filter="url(#softGlow)">
          <path
            d={buildPathD(ANCIENT_ROUTE.map(p => ({ x: p.x * scaleX, y: p.y * scaleY })), ancientRouteProgress)}
            fill="none"
            stroke="url(#ancientGold)"
            strokeWidth={6 * Math.min(scaleX, scaleY) * 20}
            opacity={0.15}
            strokeLinecap="round"
          />
        </g>
        <g filter="url(#glow)">
          <path
            d={buildPathD(ANCIENT_ROUTE.map(p => ({ x: p.x * scaleX, y: p.y * scaleY })), ancientRouteProgress)}
            fill="none"
            stroke="url(#ancientGold)"
            strokeWidth={3 * Math.min(scaleX, scaleY) * 5}
            opacity={interpolate(eraProgress, [0, 0.5, 4, 5], [0, 1, 1, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
            strokeLinecap="round"
          />
        </g>

        {/* Secondary trade routes emerging over time */}
        {SECONDARY_ROUTES.map((route, i) => {
          const routeEra = route.era + 1;
          const routeProgress = interpolate(eraProgress, [routeEra, routeEra + 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          if (routeProgress <= 0) return null;
          const scaledPoints = route.points.map(p => ({ x: p.x * scaleX, y: p.y * scaleY }));
          return (
            <g key={`route-${i}`} filter="url(#glow)">
              <path
                d={buildPathD(scaledPoints, routeProgress)}
                fill="none"
                stroke={route.color}
                strokeWidth={2 * Math.min(scaleX, scaleY) * 5}
                opacity={0.6}
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* Network edges for complex modern web */}
        {EDGES.map((edge, i) => {
          const edgeEra = edge.era + 2;
          const edgeOpacity = interpolate(eraProgress, [edgeEra, edgeEra + 0.8], [0, edge.opacity], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          if (edgeOpacity <= 0.01) return null;
          const nodeA = NODES[edge.a];
          const nodeB = NODES[edge.b];
          const hue = (nodeA.hue + nodeB.hue) / 2;
          const pulse = Math.sin(frame * 0.04 + i * 0.3) * 0.3 + 0.7;
          return (
            <line
              key={`edge-${i}`}
              x1={nodeA.x * scaleX} y1={nodeA.y * scaleY}
              x2={nodeB.x * scaleX} y2={nodeB.y * scaleY}
              stroke={`hsl(${hue}, 80%, 60%)`}
              strokeWidth={1 * Math.min(scaleX, scaleY) * 3}
              opacity={edgeOpacity * pulse}
            />
          );
        })}

        {/* Trade nodes - cities appearing over time */}
        {NODES.map((node, i) => {
          const nodeEra = node.era;
          const nodeOpacity = interpolate(eraProgress, [nodeEra, nodeEra + 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          if (nodeOpacity <= 0.01) return null;
          const pulse = Math.sin(frame * 0.06 + node.pulseOffset) * 0.3 + 0.7;
          const scaledSize = node.size * Math.min(scaleX, scaleY) * 3;
          const cx = node.x * scaleX;
          const cy = node.y * scaleY;
          const hue = node.hue;
          return (
            <g key={`node-${i}`} filter="url(#nodeGlow)" opacity={nodeOpacity}>
              {/* Outer pulse ring */}
              <circle
                cx={cx} cy={cy}
                r={scaledSize * 3 * pulse}
                fill="none"
                stroke={`hsl(${hue}, 90%, 70%)`}
                strokeWidth={1}
                opacity={0.3 * (1 - pulse + 0.5)}
              />
              {/* Middle ring */}
              <circle
                cx={cx} cy={cy}
                r={scaledSize * 1.8}
                fill={`hsla(${hue}, 80%, 50%, 0.2)`}
                stroke={`hsl(${hue}, 90%, 65%)`}
                strokeWidth={1.5}
                opacity={0.7}
              />
              {/* Core */}
              <circle
                cx={cx} cy={cy}
                r={scaledSize}
                fill={`hsl(${hue}, 90%, 70%)`}
                opacity={0.95}
              />
              {/* Bright center */}
              <circle
                cx={cx} cy={cy}
                r={scaledSize * 0.4}
                fill="white"
                opacity={0.9}
              />
            </g>
          );
        })}

        {/* Moving particles along the ancient route */}
        {PARTICLES.map((particle, i) => {
          const particleOpacity = interpolate(eraProgress, [0, 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          if (particleOpacity <= 0.01) return null;
          const t = ((frame * particle.speed + particle.offset) % 1);
          const pos = catmullRom(ANCIENT_ROUTE.map(p => ({ x: p.x * scaleX, y: p.y * scaleY })), t);
          const alpha = Math.sin(t * Math.PI) * particleOpacity;
          return (
            <circle
              key={`particle-${i}`}
              cx={pos.x} cy={pos.y}
              r={particle.size * Math.min(scaleX, scaleY) * 2}
              fill={particle.color}
              opacity={alpha * 0.9}
            />
          );
        })}

        {/* Modern data flow particles on edges */}
        {eraProgress > 3 && EDGES.slice(0, 60).map((edge, i) => {
          const nodeA = NODES[edge.a];
          const nodeB = NODES[edge.b];
          const t = ((frame * 0.008 + i * 0.05) % 1);
          const px = nodeA.x * scaleX + (nodeB.x * scaleX - nodeA.x * scaleX) * t;
          const py = nodeA.y * scaleY + (nodeB.y * scaleY - nodeA.y * scaleY) * t;
          const flowOpacity = interpolate(eraProgress, [3, 4], [0, 1], { extrapolateRight: 'clamp' });
          const hue = (nodeA.hue + nodeB.hue) / 2;
          return (
            <circle
              key={`flow-${i}`}
              cx={px} cy={py}
              r={3 * Math.min(scaleX, scaleY)}
              fill={`hsl(${hue}, 100%, 80%)`}
              opacity={flowOpacity * 0.8}
            />
          );
        })}

        {/* Era milestone rings - pulsing circles at key junctions */}
        {[
          { x: 1920, y: 1080, era: 0 },
          { x: 960, y: 800, era: 1 },
          { x: 2880, y: 800, era: 2 },
          { x: 480, y: 1400, era: 3 },
          { x: 3360, y: 600, era: 4 },
        ].map((hub, i) => {
          const hubOpacity = interpolate(eraProgress, [hub.era, hub.era + 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          if (hubOpacity <= 0.01) return null;
          const wave1 = (frame * 0.5 + i * 20) % 120;
          const wave2 = (frame * 0.5 + i * 20 + 40) % 120;
          const r1 = wave1 * Math.min(scaleX, scaleY) * 2;
          const r2 = wave2 * Math.min(scaleX, scaleY) * 2;
          const a1 = Math.max(0, (1 - wave1 / 120));
          const a2 = Math.max(0, (1 - wave2 / 120));
          const colors = ['#FFD700', '#00FF88', '#00BFFF', '#FF6B35', '#FF00FF'];
          return (
            <g key={`hub-${i}`} opacity={hubOpacity}>
              <circle
                cx={hub.x * scaleX} cy={hub.y * scaleY}
                r={r1}
                fill="none"
                stroke={colors[i]}
                strokeWidth={2}
                opacity={a1 * 0.6}
              />
              <circle
                cx={hub.x * scaleX} cy={hub.y * scaleY}
                r={r2}
                fill="none"
                stroke={colors[i]}
                strokeWidth={2}
                opacity={a2 * 0.6}
              />
              <circle
                cx={hub.x * scaleX} cy={hub.y * scaleY}
                r={20 * Math.min(scaleX, scaleY)}
                fill={`${colors[i]}33`}
                stroke={colors[i]}
                strokeWidth={3}
                opacity={0.9}
              />
            </g>
          );
        })}

        {/* Light beams connecting major hubs in modern era */}
        {eraProgress > 4 && [
          [0, 1], [1, 2], [2, 3], [3, 4], [0, 2], [1, 4]
        ].map(([a, b], i) => {
          const hubs = [
            { x: 1920, y: 1080 },
            { x: 960, y: 800 },
            { x: 2880, y: 800 },
            { x: 480, y: 1400 },
            { x: 3360, y: 600 },
          ];
          const beamOpacity = interpolate(eraProgress, [4, 5], [0, 0.5], { extrapolateRight: 'clamp' });
          const pulse = Math.sin(frame * 0.08 + i) * 0.3 + 0.7;
          return (
            <line
              key={`beam-${i}`}
              x1={hubs[a].x * scaleX} y1={hubs[a].y * scaleY}
              x2={hubs[b].x * scaleX} y2={hubs[b].y * scaleY}
              stroke={`hsl(${i * 60}, 90%, 70%)`}
              strokeWidth={4 * Math.min(scaleX, scaleY)}
              opacity={beamOpacity * pulse}
              filter="url(#glow)"
            />
          );
        })}

        {/* Vignette overlay */}
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.7)" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#vignette)" />
      </svg>
    </div>
  );
};