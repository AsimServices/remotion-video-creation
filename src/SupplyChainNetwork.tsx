import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NODES = Array.from({ length: 32 }, (_, i) => ({
  x: [
    1920, 2800, 3200, 3400, 3600, 2600, 2200, 1600, 1200, 800, 400, 600,
    1000, 1400, 1800, 2400, 3000, 3500, 700, 300, 200, 500, 900, 1300,
    1700, 2100, 2500, 2900, 3300, 3700, 150, 3800,
  ][i],
  y: [
    1080, 600, 700, 900, 1100, 1300, 1500, 1400, 1200, 1000, 800, 1600,
    1800, 1700, 500, 400, 500, 600, 400, 1100, 1500, 700, 600, 1900,
    2000, 1900, 700, 800, 1300, 800, 1800, 1400,
  ][i],
  size: ((i * 7) % 20) + 12,
  delay: i * 15,
  pulseOffset: (i * 37) % 60,
}));

const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [0, 14], [14, 15],
  [15, 16], [16, 17], [0, 18], [18, 19], [19, 20], [20, 21], [21, 22],
  [22, 23], [23, 24], [24, 25], [1, 15], [5, 13], [7, 11], [2, 16],
  [4, 17], [3, 26], [26, 27], [27, 28], [28, 29], [0, 30], [30, 31],
];

const PACKETS = Array.from({ length: 20 }, (_, i) => ({
  edgeIdx: i % EDGES.length,
  speed: 0.008 + ((i * 13) % 10) * 0.001,
  offset: (i * 31) % 100 / 100,
  size: 6 + (i % 5) * 2,
}));

const CONTINENTS = [
  { x: 1600, y: 600, w: 900, h: 600, rx: 200 },
  { x: 400, y: 700, w: 700, h: 500, rx: 150 },
  { x: 2700, y: 500, w: 800, h: 700, rx: 180 },
  { x: 3200, y: 1200, w: 600, h: 500, rx: 140 },
  { x: 800, y: 1400, w: 400, h: 350, rx: 100 },
  { x: 2000, y: 1500, w: 500, h: 400, rx: 120 },
  { x: 1200, y: 1700, w: 600, h: 300, rx: 90 },
];

const GRID_LINES_H = Array.from({ length: 18 }, (_, i) => i * 120);
const GRID_LINES_V = Array.from({ length: 32 }, (_, i) => i * 120);

export const SupplyChainNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const totalProgress = frame / durationInFrames;

  return (
    <div style={{ width, height, background: '#03080f', position: 'relative', overflow: 'hidden', opacity: globalOpacity }}>
      {/* Deep space background gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, #071828 0%, #03080f 70%)',
      }} />

      {/* Grid overlay */}
      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0a3a6b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#03080f" stopOpacity="0" />
          </radialGradient>
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
          <filter id="nodeGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background glow */}
        <rect width={width} height={height} fill="url(#bgGlow)" />

        {/* Grid lines horizontal */}
        {GRID_LINES_H.map((y, i) => (
          <line
            key={`gh-${i}`}
            x1={0} y1={y} x2={width} y2={y}
            stroke="#0d2a45"
            strokeWidth="1"
            opacity="0.4"
          />
        ))}

        {/* Grid lines vertical */}
        {GRID_LINES_V.map((x, i) => (
          <line
            key={`gv-${i}`}
            x1={x} y1={0} x2={x} y2={height}
            stroke="#0d2a45"
            strokeWidth="1"
            opacity="0.4"
          />
        ))}

        {/* Continent blobs */}
        {CONTINENTS.map((c, i) => {
          const cProgress = interpolate(frame, [i * 20, i * 20 + 60], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp'
          });
          return (
            <rect
              key={`cont-${i}`}
              x={c.x} y={c.y} width={c.w} height={c.h}
              rx={c.rx} ry={c.rx}
              fill="#0b2236"
              opacity={cProgress * 0.6}
            />
          );
        })}

        {/* Latitude/longitude curved lines */}
        {Array.from({ length: 8 }, (_, i) => {
          const yPos = 200 + i * 240;
          const waveAmp = 30 * Math.sin(i * 0.5);
          const d = `M 0 ${yPos} Q ${width / 4} ${yPos + waveAmp} ${width / 2} ${yPos} Q ${3 * width / 4} ${yPos - waveAmp} ${width} ${yPos}`;
          return (
            <path
              key={`lat-${i}`}
              d={d}
              fill="none"
              stroke="#0d3a5e"
              strokeWidth="1"
              opacity="0.35"
            />
          );
        })}

        {Array.from({ length: 12 }, (_, i) => {
          const xPos = (i + 1) * (width / 13);
          const waveAmp = 40;
          const d = `M ${xPos} 0 Q ${xPos + waveAmp} ${height / 4} ${xPos} ${height / 2} Q ${xPos - waveAmp} ${3 * height / 4} ${xPos} ${height}`;
          return (
            <path
              key={`lon-${i}`}
              d={d}
              fill="none"
              stroke="#0d3a5e"
              strokeWidth="1"
              opacity="0.3"
            />
          );
        })}

        {/* Edges */}
        {EDGES.map(([a, b], idx) => {
          const nodeA = NODES[a];
          const nodeB = NODES[b];
          const edgeDelay = Math.max(nodeA.delay, nodeB.delay) + 10;
          const edgeProgress = interpolate(frame, [edgeDelay, edgeDelay + 40], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp'
          });

          const mx = (nodeA.x + nodeB.x) / 2;
          const my = (nodeA.y + nodeB.y) / 2 - 80;

          const pathStr = `M ${nodeA.x} ${nodeA.y} Q ${mx} ${my} ${nodeB.x} ${nodeB.y}`;

          const dashLen = 2000;
          const dashOffset = dashLen * (1 - edgeProgress);

          const pulsePhase = (frame * 0.02 + idx * 0.3) % (Math.PI * 2);
          const edgeOpacity = 0.4 + 0.2 * Math.sin(pulsePhase);

          return (
            <g key={`edge-${idx}`}>
              {/* Glow edge */}
              <path
                d={pathStr}
                fill="none"
                stroke="#1565c0"
                strokeWidth="3"
                strokeDasharray={`${dashLen}`}
                strokeDashoffset={`${dashOffset}`}
                opacity={edgeProgress * edgeOpacity * 0.5}
                filter="url(#softGlow)"
              />
              {/* Core edge */}
              <path
                d={pathStr}
                fill="none"
                stroke="#2196f3"
                strokeWidth="1.5"
                strokeDasharray={`${dashLen}`}
                strokeDashoffset={`${dashOffset}`}
                opacity={edgeProgress * edgeOpacity}
              />
            </g>
          );
        })}

        {/* Data packets */}
        {PACKETS.map((pkt, i) => {
          const edge = EDGES[pkt.edgeIdx];
          const nodeA = NODES[edge[0]];
          const nodeB = NODES[edge[1]];

          const edgeDelay = Math.max(nodeA.delay, nodeB.delay) + 50;
          if (frame < edgeDelay) return null;

          const t = ((frame * pkt.speed + pkt.offset) % 1);
          const mx = (nodeA.x + nodeB.x) / 2;
          const my = (nodeA.y + nodeB.y) / 2 - 80;

          const bx = (1 - t) * (1 - t) * nodeA.x + 2 * (1 - t) * t * mx + t * t * nodeB.x;
          const by = (1 - t) * (1 - t) * nodeA.y + 2 * (1 - t) * t * my + t * t * nodeB.y;

          const trailOpacity = interpolate(frame, [edgeDelay, edgeDelay + 20], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp'
          });

          return (
            <g key={`pkt-${i}`} opacity={trailOpacity}>
              <circle cx={bx} cy={by} r={pkt.size * 2} fill="#64b5f6" opacity="0.15" filter="url(#softGlow)" />
              <circle cx={bx} cy={by} r={pkt.size} fill="#90caf9" opacity="0.8" />
              <circle cx={bx} cy={by} r={pkt.size * 0.5} fill="#ffffff" opacity="0.9" />
            </g>
          );
        })}

        {/* Nodes */}
        {NODES.map((node, i) => {
          const nodeProgress = interpolate(frame, [node.delay, node.delay + 30], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp'
          });

          const pulsePhase = ((frame + node.pulseOffset) * 0.05) % (Math.PI * 2);
          const pulseScale = 1 + 0.3 * Math.sin(pulsePhase);
          const ringOpacity = 0.5 + 0.3 * Math.sin(pulsePhase);

          const outerPulse = 1 + 0.8 * Math.sin(pulsePhase * 0.7);
          const outerOpacity = 0.3 * (1 - Math.sin(pulsePhase * 0.7) * 0.5);

          const isHub = i === 0 || i === 1 || i === 2 || i === 5;

          return (
            <g key={`node-${i}`} opacity={nodeProgress}>
              {/* Outer glow ring */}
              <circle
                cx={node.x} cy={node.y}
                r={node.size * 3 * outerPulse}
                fill="none"
                stroke="#1565c0"
                strokeWidth="1"
                opacity={outerOpacity * nodeProgress}
              />
              {/* Pulse ring */}
              <circle
                cx={node.x} cy={node.y}
                r={node.size * 2 * pulseScale}
                fill="none"
                stroke="#2196f3"
                strokeWidth={isHub ? "2" : "1"}
                opacity={ringOpacity * 0.7}
                filter="url(#glow)"
              />
              {/* Node core */}
              <circle
                cx={node.x} cy={node.y}
                r={node.size}
                fill={isHub ? "#1565c0" : "#0d47a1"}
                filter="url(#nodeGlow)"
              />
              <circle
                cx={node.x} cy={node.y}
                r={node.size}
                fill="none"
                stroke={isHub ? "#64b5f6" : "#2196f3"}
                strokeWidth={isHub ? "3" : "2"}
              />
              {/* Inner highlight */}
              <circle
                cx={node.x - node.size * 0.25}
                cy={node.y - node.size * 0.25}
                r={node.size * 0.35}
                fill="#90caf9"
                opacity="0.6"
              />
              {/* Center dot */}
              <circle
                cx={node.x} cy={node.y}
                r={node.size * 0.2}
                fill="#ffffff"
                opacity="0.9"
              />
            </g>
          );
        })}

        {/* Central hub dramatic glow */}
        <circle
          cx={NODES[0].x} cy={NODES[0].y}
          r={120 + 20 * Math.sin(frame * 0.04)}
          fill="radial-gradient"
          stroke="#1976d2"
          strokeWidth="1"
          opacity={interpolate(frame, [NODES[0].delay, NODES[0].delay + 40], [0, 0.4], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp'
          })}
          filter="url(#softGlow)"
          fill-opacity="0"
        />

        {/* Scanning sweep line */}
        {(() => {
          const sweepX = interpolate(frame % 300, [0, 300], [0, width]);
          const sweepOpacity = 0.15;
          return (
            <line
              x1={sweepX} y1={0} x2={sweepX} y2={height}
              stroke="#2196f3"
              strokeWidth="2"
              opacity={sweepOpacity}
            />
          );
        })()}

        {/* Corner decorative elements */}
        {[
          { cx: 0, cy: 0 },
          { cx: width, cy: 0 },
          { cx: 0, cy: height },
          { cx: width, cy: height },
        ].map((corner, i) => (
          <g key={`corner-${i}`}>
            <circle cx={corner.cx} cy={corner.cy} r={200} fill="none" stroke="#1565c0" strokeWidth="1" opacity="0.2" />
            <circle cx={corner.cx} cy={corner.cy} r={350} fill="none" stroke="#0d47a1" strokeWidth="1" opacity="0.12" />
          </g>
        ))}

        {/* Ambient particles */}
        {Array.from({ length: 50 }, (_, i) => {
          const px = (i * 1731 + 500) % width;
          const py = (i * 1337 + 200) % height;
          const drift = Math.sin((frame * 0.01 + i * 0.3) % (Math.PI * 2)) * 10;
          const particleOpacity = 0.2 + 0.2 * Math.sin(frame * 0.03 + i * 0.5);
          return (
            <circle
              key={`particle-${i}`}
              cx={px + drift}
              cy={py + drift * 0.5}
              r={1.5}
              fill="#42a5f5"
              opacity={particleOpacity}
            />
          );
        })}

        {/* Circular radar rings from center */}
        {[1, 2, 3, 4].map((ring) => {
          const maxR = ring * 300;
          const ringProgress = ((frame * 0.4 + ring * 80) % 400) / 400;
          const currentR = maxR * ringProgress;
          const rOpacity = (1 - ringProgress) * 0.3;
          return (
            <circle
              key={`radar-${ring}`}
              cx={NODES[0].x}
              cy={NODES[0].y}
              r={currentR}
              fill="none"
              stroke="#1976d2"
              strokeWidth="2"
              opacity={rOpacity}
            />
          );
        })}
      </svg>

      {/* Vignette overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(3,8,15,0.7) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};