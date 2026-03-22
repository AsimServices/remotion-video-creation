import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NODES = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 1373 + 200) % 3600 + 120,
  y: (i * 937 + 150) % 1800 + 180,
  radius: ((i * 17) % 18) + 8,
  pulseOffset: (i * 23) % 60,
  glowIntensity: ((i * 7) % 5) + 3,
}));

const EDGES = Array.from({ length: 52 }, (_, i) => {
  const from = (i * 7 + 3) % NODES.length;
  const to = (i * 11 + 5) % NODES.length;
  return {
    from,
    to,
    bandwidth: ((i * 13) % 5) + 1,
    flowOffset: (i * 19) % 100,
    flowSpeed: ((i * 7) % 4) + 1,
    colorShift: (i * 31) % 60,
  };
});

const PARTICLES = Array.from({ length: 180 }, (_, i) => {
  const edgeIdx = i % EDGES.length;
  return {
    edgeIdx,
    progress: (i * 37) % 100,
    size: ((i * 11) % 4) + 2,
    offset: (i * 53) % 20 - 10,
  };
});

const BACKGROUND_DOTS = Array.from({ length: 400 }, (_, i) => ({
  x: (i * 1979 + 100) % 3840,
  y: (i * 1523 + 100) % 2160,
  size: ((i * 7) % 3) + 1,
  opacity: ((i * 11) % 30) / 100 + 0.05,
}));

const ARCS = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 2131 + 200) % 3400 + 200,
  y: (i * 1741 + 150) % 1860 + 150,
  rx: ((i * 113) % 300) + 100,
  ry: ((i * 89) % 200) + 60,
  rotation: (i * 23) % 360,
  opacity: 0.04 + ((i * 7) % 6) / 100,
  dashOffset: (i * 41) % 200,
}));

export const TealInternetBackbone: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const scaleX = width / 3840;
  const scaleY = height / 2160;

  const time = frame / 30;

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 50% 50%, #010d12 0%, #000608 60%, #000000 100%)',
        overflow: 'hidden',
        opacity,
        position: 'relative',
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-soft">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-node">
            <feGaussianBlur stdDeviation="12" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="bg-radial" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#003344" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="edge-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ffcc" stopOpacity="0" />
            <stop offset="50%" stopColor="#00ffcc" stopOpacity="1" />
            <stop offset="100%" stopColor="#00ffcc" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Background glow */}
        <rect x={0} y={0} width={width} height={height} fill="url(#bg-radial)" />

        {/* Background constellation dots */}
        {BACKGROUND_DOTS.map((dot, i) => (
          <circle
            key={`dot-${i}`}
            cx={dot.x * scaleX}
            cy={dot.y * scaleY}
            r={dot.size * scaleX}
            fill="#00e5cc"
            opacity={dot.opacity}
          />
        ))}

        {/* Decorative arcs */}
        {ARCS.map((arc, i) => {
          const dashAnim = (arc.dashOffset + time * 20) % 400;
          return (
            <ellipse
              key={`arc-${i}`}
              cx={arc.x * scaleX}
              cy={arc.y * scaleY}
              rx={arc.rx * scaleX}
              ry={arc.ry * scaleY}
              fill="none"
              stroke="#00ffcc"
              strokeWidth={1 * scaleX}
              strokeOpacity={arc.opacity}
              strokeDasharray={`${30 * scaleX} ${60 * scaleX}`}
              strokeDashoffset={-dashAnim * scaleX}
              transform={`rotate(${arc.rotation}, ${arc.x * scaleX}, ${arc.y * scaleY})`}
            />
          );
        })}

        {/* Edges - base glow lines */}
        {EDGES.map((edge, i) => {
          const from = NODES[edge.from];
          const to = NODES[edge.to];
          const x1 = from.x * scaleX;
          const y1 = from.y * scaleY;
          const x2 = to.x * scaleX;
          const y2 = to.y * scaleY;

          const pulse = Math.sin(time * edge.flowSpeed * 0.8 + edge.flowOffset * 0.1) * 0.5 + 0.5;
          const edgeOpacity = 0.08 + pulse * 0.15;
          const strokeWidth = (edge.bandwidth * 0.4 + 0.5) * scaleX;

          const cx = (x1 + x2) / 2 + Math.sin(i * 0.7) * 200 * scaleX;
          const cy = (y1 + y2) / 2 + Math.cos(i * 0.5) * 150 * scaleY;

          return (
            <path
              key={`edge-base-${i}`}
              d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
              stroke={`hsl(${170 + edge.colorShift}, 100%, 60%)`}
              strokeWidth={strokeWidth * 2}
              fill="none"
              opacity={edgeOpacity}
              filter="url(#glow-soft)"
            />
          );
        })}

        {/* Edges - core lines */}
        {EDGES.map((edge, i) => {
          const from = NODES[edge.from];
          const to = NODES[edge.to];
          const x1 = from.x * scaleX;
          const y1 = from.y * scaleY;
          const x2 = to.x * scaleX;
          const y2 = to.y * scaleY;

          const pulse = Math.sin(time * edge.flowSpeed * 0.8 + edge.flowOffset * 0.1) * 0.5 + 0.5;
          const edgeOpacity = 0.15 + pulse * 0.25;
          const strokeWidth = (edge.bandwidth * 0.3 + 0.3) * scaleX;

          const cx = (x1 + x2) / 2 + Math.sin(i * 0.7) * 200 * scaleX;
          const cy = (y1 + y2) / 2 + Math.cos(i * 0.5) * 150 * scaleY;

          const pathLen = 600;
          const dashLen = (20 + edge.bandwidth * 10) * scaleX;
          const dashGap = (40 + edge.bandwidth * 5) * scaleX;
          const dashOffset = -((time * edge.flowSpeed * 60 + edge.flowOffset * 5) % pathLen) * scaleX;

          return (
            <path
              key={`edge-core-${i}`}
              d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
              stroke={`hsl(${170 + edge.colorShift}, 100%, 70%)`}
              strokeWidth={strokeWidth}
              fill="none"
              opacity={edgeOpacity}
              strokeDasharray={`${dashLen} ${dashGap}`}
              strokeDashoffset={dashOffset}
            />
          );
        })}

        {/* Flowing bandwidth pulses */}
        {PARTICLES.map((p, i) => {
          const edge = EDGES[p.edgeIdx];
          const from = NODES[edge.from];
          const to = NODES[edge.to];

          const x1 = from.x * scaleX;
          const y1 = from.y * scaleY;
          const x2 = to.x * scaleX;
          const y2 = to.y * scaleY;

          const cx = (x1 + x2) / 2 + Math.sin(p.edgeIdx * 0.7) * 200 * scaleX;
          const cy = (y1 + y2) / 2 + Math.cos(p.edgeIdx * 0.5) * 150 * scaleY;

          const t = ((p.progress / 100 + time * edge.flowSpeed * 0.04) % 1);

          const mt = t;
          const bx = (1 - mt) * (1 - mt) * x1 + 2 * (1 - mt) * mt * cx + mt * mt * x2;
          const by = (1 - mt) * (1 - mt) * y1 + 2 * (1 - mt) * mt * cy + mt * mt * y2;

          const tailT = Math.max(0, mt - 0.06);
          const tailBx = (1 - tailT) * (1 - tailT) * x1 + 2 * (1 - tailT) * tailT * cx + tailT * tailT * x2;
          const tailBy = (1 - tailT) * (1 - tailT) * y1 + 2 * (1 - tailT) * tailT * cy + tailT * tailT * y2;

          const particleOpacity = Math.sin(mt * Math.PI) * 0.9;

          return (
            <g key={`particle-${i}`} filter="url(#glow-strong)">
              <line
                x1={tailBx}
                y1={tailBy}
                x2={bx}
                y2={by}
                stroke={`hsl(${175 + (i * 7) % 30}, 100%, 80%)`}
                strokeWidth={(p.size * 0.6) * scaleX}
                opacity={particleOpacity * 0.5}
                strokeLinecap="round"
              />
              <circle
                cx={bx}
                cy={by}
                r={(p.size * 0.7) * scaleX}
                fill={`hsl(${175 + (i * 7) % 30}, 100%, 90%)`}
                opacity={particleOpacity}
              />
            </g>
          );
        })}

        {/* Nodes */}
        {NODES.map((node, i) => {
          const nx = node.x * scaleX;
          const ny = node.y * scaleY;
          const pulse = Math.sin(time * 1.5 + node.pulseOffset * 0.2) * 0.5 + 0.5;
          const outerRadius = (node.radius * 2.5 + pulse * node.radius * 2) * scaleX;
          const innerRadius = node.radius * scaleX;
          const coreRadius = node.radius * 0.5 * scaleX;

          return (
            <g key={`node-${i}`}>
              {/* Outer pulse ring */}
              <circle
                cx={nx}
                cy={ny}
                r={outerRadius}
                fill="none"
                stroke="#00ffcc"
                strokeWidth={1 * scaleX}
                opacity={0.08 + pulse * 0.12}
                filter="url(#glow-soft)"
              />
              {/* Middle ring */}
              <circle
                cx={nx}
                cy={ny}
                r={innerRadius * 1.8}
                fill="none"
                stroke="#00e5cc"
                strokeWidth={1.5 * scaleX}
                opacity={0.2 + pulse * 0.3}
              />
              {/* Node body */}
              <circle
                cx={nx}
                cy={ny}
                r={innerRadius}
                fill="#003333"
                stroke="#00ffcc"
                strokeWidth={2 * scaleX}
                opacity={0.85}
                filter="url(#glow-node)"
              />
              {/* Core */}
              <circle
                cx={nx}
                cy={ny}
                r={coreRadius}
                fill="#00ffdd"
                opacity={0.7 + pulse * 0.3}
              />
            </g>
          );
        })}

        {/* Major bandwidth surge lines */}
        {Array.from({ length: 8 }, (_, i) => {
          const edgeIdx = (i * 6 + 2) % EDGES.length;
          const edge = EDGES[edgeIdx];
          const from = NODES[edge.from];
          const to = NODES[edge.to];

          const x1 = from.x * scaleX;
          const y1 = from.y * scaleY;
          const x2 = to.x * scaleX;
          const y2 = to.y * scaleY;

          const cx = (x1 + x2) / 2 + Math.sin(edgeIdx * 0.7) * 200 * scaleX;
          const cy = (y1 + y2) / 2 + Math.cos(edgeIdx * 0.5) * 150 * scaleY;

          const surgeT = ((time * 0.25 + i * 0.15) % 1);
          const surgePulse = Math.sin(surgeT * Math.PI);
          const t = surgeT;

          const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
          const by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;

          return (
            <g key={`surge-${i}`} filter="url(#glow-strong)">
              <circle
                cx={bx}
                cy={by}
                r={12 * surgePulse * scaleX}
                fill="#00ffee"
                opacity={surgePulse * 0.9}
              />
              <circle
                cx={bx}
                cy={by}
                r={6 * surgePulse * scaleX}
                fill="#ffffff"
                opacity={surgePulse * 0.7}
              />
            </g>
          );
        })}

        {/* Global ambient glow overlay */}
        <ellipse
          cx={width * 0.5}
          cy={height * 0.45}
          rx={width * 0.45}
          ry={height * 0.35}
          fill="none"
          stroke="#00ffcc"
          strokeWidth={1 * scaleX}
          opacity={0.03 + Math.sin(time * 0.4) * 0.015}
          filter="url(#glow-soft)"
        />
        <ellipse
          cx={width * 0.5}
          cy={height * 0.45}
          rx={width * 0.25}
          ry={height * 0.2}
          fill="#001a1a"
          fillOpacity={0.04}
          stroke="none"
        />
      </svg>
    </div>
  );
};