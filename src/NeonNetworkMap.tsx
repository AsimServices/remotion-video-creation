import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Pre-computed node positions for the network map
const NODES = Array.from({ length: 24 }, (_, i) => ({
  x: ((i * 1733 + 312) % 3400) + 220,
  y: ((i * 1237 + 180) % 1800) + 180,
  type: i % 3, // 0=air, 1=sea, 2=land
  size: ((i * 7) % 12) + 8,
  pulseOffset: (i * 17) % 60,
}));

// Pre-computed connections between nodes
const CONNECTIONS = Array.from({ length: 36 }, (_, i) => ({
  fromIdx: (i * 7) % 24,
  toIdx: (i * 11 + 3) % 24,
  type: i % 3,
  dashOffset: (i * 23) % 100,
  animSpeed: ((i * 13) % 5) + 1,
  delay: (i * 11) % 40,
  controlX: ((i * 1531) % 3200) + 320,
  controlY: ((i * 997) % 1600) + 280,
}));

// Pre-computed particle positions along routes
const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  connIdx: i % 36,
  progress: (i * 37) % 100,
  size: ((i * 5) % 6) + 3,
  speedMult: ((i * 9) % 4) + 1,
  delay: (i * 19) % 80,
}));

// Floating background nodes
const BG_NODES = Array.from({ length: 80 }, (_, i) => ({
  x: (i * 1931) % 3840,
  y: (i * 1123) % 2160,
  size: ((i * 3) % 3) + 1,
  opacity: ((i * 7) % 5) / 10 + 0.05,
  twinkle: (i * 31) % 60,
}));

const TYPE_COLORS = [
  { main: '#00d4ff', glow: '#00aaff', trail: '#003366', label: 'AIR' },   // cyan/blue - air
  { main: '#00ff88', glow: '#00cc66', trail: '#003322', label: 'SEA' },   // green - sea
  { main: '#ff6600', glow: '#ff4400', trail: '#331100', label: 'LAND' },  // orange - land
];

export const NeonNetworkMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const masterOpacity = Math.min(fadeIn, fadeOut);

  const scaleX = width / 3840;
  const scaleY = height / 2160;

  // Helper: get point on quadratic bezier
  const getBezierPoint = (t: number, x0: number, y0: number, cx: number, cy: number, x1: number, y1: number) => {
    const mt = 1 - t;
    return {
      x: mt * mt * x0 + 2 * mt * t * cx + t * t * x1,
      y: mt * mt * y0 + 2 * mt * t * cy + t * t * y1,
    };
  };

  return (
    <div style={{ width, height, background: '#020408', opacity: masterOpacity, overflow: 'hidden', position: 'relative' }}>
      {/* Deep space background gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 30% 40%, #040d1a 0%, #020408 60%, #000102 100%)',
      }} />

      {/* Grid overlay */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="grid" width={80 * scaleX} height={80 * scaleY} patternUnits="userSpaceOnUse">
            <path
              d={`M ${80 * scaleX} 0 L 0 0 0 ${80 * scaleY}`}
              fill="none"
              stroke="#0a1a2a"
              strokeWidth={0.8}
            />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" opacity={0.6} />
      </svg>

      {/* Background twinkling nodes */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        {BG_NODES.map((node, i) => {
          const twinkle = Math.sin((frame + node.twinkle) * 0.05) * 0.3 + 0.7;
          return (
            <circle
              key={`bg-${i}`}
              cx={node.x * scaleX}
              cy={node.y * scaleY}
              r={node.size * Math.min(scaleX, scaleY)}
              fill="#1a3a5c"
              opacity={node.opacity * twinkle}
            />
          );
        })}
      </svg>

      {/* Main SVG layer */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          {TYPE_COLORS.map((tc, ti) => (
            <filter key={`glow-${ti}`} id={`glow-${ti}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={6 * Math.min(scaleX, scaleY)} result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <filter id="glow-strong" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={12 * Math.min(scaleX, scaleY)} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={3 * Math.min(scaleX, scaleY)} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Draw connection lines */}
        {CONNECTIONS.map((conn, i) => {
          const fromNode = NODES[conn.fromIdx];
          const toNode = NODES[conn.toIdx];
          const color = TYPE_COLORS[conn.type];
          const revealStart = conn.delay;
          const revealEnd = conn.delay + 40;
          const reveal = interpolate(frame, [revealStart, revealEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          if (reveal <= 0) return null;

          const x0 = fromNode.x * scaleX;
          const y0 = fromNode.y * scaleY;
          const x1 = toNode.x * scaleX;
          const y1 = toNode.y * scaleY;
          const cx = conn.controlX * scaleX;
          const cy = conn.controlY * scaleY;

          // Animated dash
          const dashLen = 40 * Math.min(scaleX, scaleY);
          const dashGap = 20 * Math.min(scaleX, scaleY);
          const dashAnimOffset = (frame * conn.animSpeed * 0.8) % (dashLen + dashGap);

          // Path for bezier
          const pathD = `M ${x0},${y0} Q ${cx},${cy} ${x1},${y1}`;

          // Approximate path length for stroke dash
          const approxLen = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2) * 1.3;

          return (
            <g key={`conn-${i}`} opacity={reveal * 0.85}>
              {/* Background trail */}
              <path
                d={pathD}
                fill="none"
                stroke={color.trail}
                strokeWidth={3 * Math.min(scaleX, scaleY)}
                opacity={0.4}
              />
              {/* Animated dashed line */}
              <path
                d={pathD}
                fill="none"
                stroke={color.main}
                strokeWidth={2 * Math.min(scaleX, scaleY)}
                strokeDasharray={`${dashLen} ${dashGap}`}
                strokeDashoffset={-dashAnimOffset}
                filter={`url(#glow-${conn.type})`}
                opacity={0.7}
              />
              {/* Static base line */}
              <path
                d={pathD}
                fill="none"
                stroke={color.main}
                strokeWidth={1 * Math.min(scaleX, scaleY)}
                opacity={0.25}
              />
            </g>
          );
        })}

        {/* Particles traveling along routes */}
        {PARTICLES.map((particle, i) => {
          const conn = CONNECTIONS[particle.connIdx];
          const fromNode = NODES[conn.fromIdx];
          const toNode = NODES[conn.toIdx];
          const color = TYPE_COLORS[conn.type];

          const speed = particle.speedMult * 0.003;
          const t = ((frame * speed + particle.progress / 100 + particle.delay * 0.01) % 1);

          const x0 = fromNode.x * scaleX;
          const y0 = fromNode.y * scaleY;
          const x1 = toNode.x * scaleX;
          const y1 = toNode.y * scaleY;
          const cx = conn.controlX * scaleX;
          const cy = conn.controlY * scaleY;

          const pos = getBezierPoint(t, x0, y0, cx, cy, x1, y1);
          // Trail points
          const tTrail = Math.max(0, t - 0.04);
          const posTrail = getBezierPoint(tTrail, x0, y0, cx, cy, x1, y1);

          const revealStart = conn.delay + 40;
          const particleReveal = interpolate(frame, [revealStart, revealStart + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          if (particleReveal <= 0) return null;

          const pSize = particle.size * Math.min(scaleX, scaleY);

          return (
            <g key={`particle-${i}`} opacity={particleReveal}>
              {/* Trail line */}
              <line
                x1={posTrail.x} y1={posTrail.y}
                x2={pos.x} y2={pos.y}
                stroke={color.main}
                strokeWidth={pSize * 0.8}
                strokeLinecap="round"
                opacity={0.6}
                filter={`url(#glow-${conn.type})`}
              />
              {/* Particle core */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={pSize}
                fill={color.main}
                filter={`url(#glow-${conn.type})`}
                opacity={0.95}
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={pSize * 0.4}
                fill="white"
                opacity={0.9}
              />
            </g>
          );
        })}

        {/* Draw nodes */}
        {NODES.map((node, i) => {
          const color = TYPE_COLORS[node.type];
          const revealStart = (i * 5) % 50;
          const reveal = interpolate(frame, [revealStart, revealStart + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          const pulse = Math.sin((frame + node.pulseOffset) * 0.06) * 0.4 + 0.6;
          const outerPulse = Math.sin((frame + node.pulseOffset) * 0.06 + Math.PI) * 0.5 + 0.5;
          const nx = node.x * scaleX;
          const ny = node.y * scaleY;
          const ns = node.size * Math.min(scaleX, scaleY);

          // Expanding rings
          const ringProgress = ((frame + node.pulseOffset * 3) % 80) / 80;
          const ringRadius = ns + ringProgress * ns * 4;
          const ringOpacity = (1 - ringProgress) * 0.6 * reveal;

          return (
            <g key={`node-${i}`} opacity={reveal}>
              {/* Outer expanding ring */}
              <circle
                cx={nx} cy={ny}
                r={ringRadius}
                fill="none"
                stroke={color.main}
                strokeWidth={1.5 * Math.min(scaleX, scaleY)}
                opacity={ringOpacity}
              />
              {/* Outer glow ring */}
              <circle
                cx={nx} cy={ny}
                r={ns * 2.5 * outerPulse}
                fill="none"
                stroke={color.main}
                strokeWidth={1.5 * Math.min(scaleX, scaleY)}
                opacity={0.25 * outerPulse}
                filter={`url(#glow-${node.type})`}
              />
              {/* Node body */}
              <circle
                cx={nx} cy={ny}
                r={ns * pulse}
                fill={color.trail}
                stroke={color.main}
                strokeWidth={2 * Math.min(scaleX, scaleY)}
                filter={`url(#glow-${node.type})`}
                opacity={0.9}
              />
              {/* Node center */}
              <circle
                cx={nx} cy={ny}
                r={ns * 0.4}
                fill={color.main}
                opacity={0.95}
              />
              {/* Inner white dot */}
              <circle
                cx={nx} cy={ny}
                r={ns * 0.2}
                fill="white"
                opacity={0.8}
              />
            </g>
          );
        })}

        {/* Legend icons - geometric shapes representing transport types */}
        {[0, 1, 2].map((typeIdx) => {
          const color = TYPE_COLORS[typeIdx];
          const baseX = (200 + typeIdx * 280) * scaleX;
          const baseY = 80 * scaleY;
          const legendReveal = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const iconSize = 18 * Math.min(scaleX, scaleY);

          return (
            <g key={`legend-${typeIdx}`} opacity={legendReveal * 0.9}>
              {/* Background pill */}
              <rect
                x={baseX - 60 * scaleX}
                y={baseY - 25 * scaleY}
                width={120 * scaleX}
                height={50 * scaleY}
                rx={25 * Math.min(scaleX, scaleY)}
                fill="#020810"
                stroke={color.main}
                strokeWidth={1.5 * Math.min(scaleX, scaleY)}
                opacity={0.8}
                filter={`url(#glow-${typeIdx})`}
              />
              {/* Type indicator dot */}
              <circle
                cx={baseX - 30 * scaleX}
                cy={baseY}
                r={iconSize * 0.6}
                fill={color.main}
                filter={`url(#glow-${typeIdx})`}
              />
              {/* Small dash line */}
              <line
                x1={baseX - 12 * scaleX} y1={baseY}
                x2={baseX + 30 * scaleX} y2={baseY}
                stroke={color.main}
                strokeWidth={3 * Math.min(scaleX, scaleY)}
                strokeDasharray={typeIdx === 0 ? `${8 * scaleX} ${4 * scaleX}` : typeIdx === 1 ? `${12 * scaleX} ${2 * scaleX}` : 'none'}
                filter={`url(#glow-${typeIdx})`}
                opacity={0.9}
              />
            </g>
          );
        })}

        {/* Scanning line effect */}
        {(() => {
          const scanProgress = (frame % 200) / 200;
          const scanY = scanProgress * height;
          const scanOpacity = interpolate(
            Math.abs(scanProgress - 0.5),
            [0, 0.5],
            [0.15, 0]
          );
          return (
            <line
              x1={0} y1={scanY}
              x2={width} y2={scanY}
              stroke="#00d4ff"
              strokeWidth={2 * scaleY}
              opacity={scanOpacity}
              filter="url(#glow-0)"
            />
          );
        })()}

        {/* Corner decorations */}
        {[
          { x: 40, y: 40 },
          { x: 3800, y: 40 },
          { x: 40, y: 2120 },
          { x: 3800, y: 2120 },
        ].map((corner, i) => {
          const cx = corner.x * scaleX;
          const cy = corner.y * scaleY;
          const cs = 25 * Math.min(scaleX, scaleY);
          const cornerReveal = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const flipX = i % 2 === 1 ? -1 : 1;
          const flipY = i >= 2 ? -1 : 1;

          return (
            <g key={`corner-${i}`} opacity={cornerReveal * 0.7}>
              <path
                d={`M ${cx} ${cy + cs * flipY} L ${cx} ${cy} L ${cx + cs * flipX} ${cy}`}
                fill="none"
                stroke="#00d4ff"
                strokeWidth={2.5 * Math.min(scaleX, scaleY)}
                filter="url(#glow-0)"
              />
            </g>
          );
        })}

        {/* Central hub glow */}
        {(() => {
          const hubPulse = Math.sin(frame * 0.04) * 0.3 + 0.7;
          const hubX = width / 2;
          const hubY = height / 2;
          const hubReveal = interpolate(frame, [30, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <g opacity={hubReveal}>
              <circle cx={hubX} cy={hubY} r={120 * Math.min(scaleX, scaleY) * hubPulse}
                fill="none" stroke="#00d4ff"
                strokeWidth={0.8 * Math.min(scaleX, scaleY)}
                opacity={0.08} />
              <circle cx={hubX} cy={hubY} r={60 * Math.min(scaleX, scaleY) * hubPulse}
                fill="none" stroke="#00d4ff"
                strokeWidth={1.2 * Math.min(scaleX, scaleY)}
                opacity={0.12} />
              <circle cx={hubX} cy={hubY} r={20 * Math.min(scaleX, scaleY)}
                fill="#001122"
                stroke="#00d4ff"
                strokeWidth={2 * Math.min(scaleX, scaleY)}
                filter="url(#glow-0)"
                opacity={0.5} />
            </g>
          );
        })()}
      </svg>

      {/* Vignette overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};