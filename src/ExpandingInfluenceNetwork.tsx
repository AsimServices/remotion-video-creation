import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NODE_COUNT = 60;
const RING_COUNT = 5;
const CONNECTION_COUNT = 80;

const NODES = Array.from({ length: NODE_COUNT }, (_, i) => ({
  x: (i * 1731 + 400) % 3600 + 120,
  y: (i * 1337 + 200) % 1900 + 130,
  size: ((i * 47) % 18) + 6,
  speed: ((i * 13) % 40) / 100 + 0.3,
  phase: (i * 97) % 100,
  ringIndex: i % RING_COUNT,
  pulsePhase: (i * 61) % 100,
}));

const CONNECTIONS = Array.from({ length: CONNECTION_COUNT }, (_, i) => ({
  fromIndex: (i * 7) % NODE_COUNT,
  toIndex: (i * 13 + 5) % NODE_COUNT,
  opacity: ((i * 31) % 60) / 100 + 0.1,
  phase: (i * 43) % 100,
}));

const WORLD_DOTS = Array.from({ length: 400 }, (_, i) => ({
  x: (i * 1931) % 3840,
  y: (i * 1237) % 2160,
  size: ((i * 17) % 3) + 1,
  brightness: ((i * 53) % 50) + 20,
}));

const RINGS = Array.from({ length: RING_COUNT }, (_, i) => ({
  baseRadius: 180 + i * 280,
  thickness: 2 + i * 0.5,
  speed: 0.8 - i * 0.12,
  color: [
    '#00f5ff',
    '#7c3aed',
    '#06b6d4',
    '#8b5cf6',
    '#22d3ee',
  ][i],
}));

const CONTINENTS = [
  // North America
  'M 480 480 L 560 440 L 680 420 L 720 460 L 760 500 L 800 560 L 780 620 L 720 680 L 660 720 L 600 700 L 540 660 L 500 600 L 480 540 Z',
  // South America
  'M 660 760 L 720 740 L 780 760 L 800 820 L 820 900 L 810 980 L 780 1040 L 740 1060 L 700 1040 L 660 980 L 640 900 L 640 820 Z',
  // Europe
  'M 1020 380 L 1100 360 L 1180 370 L 1220 400 L 1200 440 L 1160 460 L 1100 470 L 1060 460 L 1020 440 Z',
  // Africa
  'M 1020 500 L 1100 480 L 1180 490 L 1220 560 L 1240 660 L 1220 780 L 1180 860 L 1120 900 L 1060 880 L 1000 800 L 980 700 L 980 600 Z',
  // Asia
  'M 1260 340 L 1500 300 L 1700 320 L 1840 380 L 1900 440 L 1880 520 L 1800 560 L 1680 580 L 1560 560 L 1420 540 L 1320 500 L 1240 460 L 1220 400 Z',
  // Australia
  'M 1680 860 L 1760 840 L 1840 860 L 1880 920 L 1880 980 L 1840 1020 L 1760 1040 L 1680 1020 L 1640 960 L 1640 900 Z',
];

export const ExpandingInfluenceNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const masterOpacity = Math.min(fadeIn, fadeOut);

  const t = frame / 30;
  const scaleX = width / 3840;
  const scaleY = height / 2160;

  const cx = width * 0.5;
  const cy = height * 0.5;

  return (
    <div style={{ width, height, background: '#020408', overflow: 'hidden', opacity: masterOpacity }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="60%" stopColor="#04080f" />
            <stop offset="100%" stopColor="#000204" />
          </radialGradient>
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f5ff" stopOpacity="1" />
            <stop offset="40%" stopColor="#7c3aed" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#000204" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="20" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="nodeGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width={width} height={height} fill="url(#bgGrad)" />

        {/* Star field */}
        {WORLD_DOTS.map((dot, i) => {
          const twinkle = Math.sin(t * 1.2 + dot.phase * 0.1) * 0.3 + 0.7;
          return (
            <circle
              key={`star-${i}`}
              cx={dot.x * scaleX}
              cy={dot.y * scaleY}
              r={dot.size * 0.4 * Math.min(scaleX, scaleY)}
              fill={`rgba(150, 180, 220, ${(dot.brightness / 100) * twinkle})`}
            />
          );
        })}

        {/* World map continents */}
        <g transform={`translate(${width * 0.1}, ${height * 0.22}) scale(${scaleX * 0.78}, ${scaleY * 0.78})`} opacity="0.18">
          {CONTINENTS.map((path, i) => (
            <path
              key={`continent-${i}`}
              d={path}
              fill="#1a3a5c"
              stroke="#2a6a9c"
              strokeWidth="2"
            />
          ))}
        </g>

        {/* Grid lines (latitude/longitude suggestion) */}
        {Array.from({ length: 8 }, (_, i) => {
          const y = (height / 8) * i;
          return (
            <line
              key={`lat-${i}`}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke="rgba(0,180,220,0.04)"
              strokeWidth="1"
            />
          );
        })}
        {Array.from({ length: 14 }, (_, i) => {
          const x = (width / 14) * i;
          return (
            <line
              key={`lon-${i}`}
              x1={x}
              y1={0}
              x2={x}
              y2={height}
              stroke="rgba(0,180,220,0.04)"
              strokeWidth="1"
            />
          );
        })}

        {/* Expanding power rings */}
        {RINGS.map((ring, ri) => {
          const ringProgress = (t * ring.speed + ri * 0.4) % 1;
          const expandingRadius = ring.baseRadius * scaleX * (0.5 + ringProgress * 1.2);
          const ringOpacity = interpolate(ringProgress, [0, 0.3, 0.8, 1], [0, 0.7, 0.4, 0]);
          const pulseRing1Radius = ring.baseRadius * scaleX * (1 + Math.sin(t * 0.5 + ri) * 0.05);

          return (
            <g key={`ring-${ri}`}>
              {/* Static base ring */}
              <circle
                cx={cx}
                cy={cy}
                r={pulseRing1Radius}
                fill="none"
                stroke={ring.color}
                strokeWidth={ring.thickness}
                opacity={0.15 + Math.sin(t * 0.8 + ri * 0.5) * 0.05}
                strokeDasharray="20 10"
                filter="url(#glow)"
              />
              {/* Expanding ring */}
              <circle
                cx={cx}
                cy={cy}
                r={expandingRadius}
                fill="none"
                stroke={ring.color}
                strokeWidth={ring.thickness * 1.5}
                opacity={ringOpacity}
                filter="url(#glow)"
              />
              {/* Secondary expanding ring offset */}
              {(() => {
                const p2 = ((t * ring.speed + ri * 0.4 + 0.5) % 1);
                const r2 = ring.baseRadius * scaleX * (0.5 + p2 * 1.2);
                const o2 = interpolate(p2, [0, 0.3, 0.8, 1], [0, 0.4, 0.2, 0]);
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r2}
                    fill="none"
                    stroke={ring.color}
                    strokeWidth={ring.thickness}
                    opacity={o2}
                  />
                );
              })()}
            </g>
          );
        })}

        {/* Connection lines between nodes */}
        {CONNECTIONS.map((conn, i) => {
          const fromNode = NODES[conn.fromIndex];
          const toNode = NODES[conn.toIndex];
          const fx = (fromNode.x / 3840) * width;
          const fy = (fromNode.y / 2160) * height;
          const tx = (toNode.x / 3840) * width;
          const ty = (toNode.y / 2160) * height;

          const pulse = Math.sin(t * 1.5 + conn.phase * 0.1) * 0.3 + 0.7;
          const appear = interpolate(frame, [conn.phase * 0.8, conn.phase * 0.8 + 60], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

          return (
            <line
              key={`conn-${i}`}
              x1={fx}
              y1={fy}
              x2={tx}
              y2={ty}
              stroke={`rgba(0, 200, 255, ${conn.opacity * pulse * appear})`}
              strokeWidth={0.8}
            />
          );
        })}

        {/* Lines from center to nodes */}
        {NODES.filter((_, i) => i % 3 === 0).map((node, i) => {
          const nx = (node.x / 3840) * width;
          const ny = (node.y / 2160) * height;
          const appear = interpolate(frame, [node.phase * 1.2, node.phase * 1.2 + 80], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
          const pulse = Math.sin(t * 0.8 + node.phase * 0.08) * 0.3 + 0.5;

          return (
            <line
              key={`hub-conn-${i}`}
              x1={cx}
              y1={cy}
              x2={nx}
              y2={ny}
              stroke={`rgba(124, 58, 237, ${0.15 * pulse * appear})`}
              strokeWidth={0.6}
              strokeDasharray="8 16"
            />
          );
        })}

        {/* Network nodes */}
        {NODES.map((node, i) => {
          const nx = (node.x / 3840) * width;
          const ny = (node.y / 2160) * height;
          const appear = interpolate(frame, [node.phase * 1.0, node.phase * 1.0 + 40], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
          const pulse = Math.sin(t * 1.2 + node.pulsePhase * 0.08) * 0.4 + 0.6;
          const r = node.size * 0.45 * Math.min(scaleX, scaleY);
          const ringColor = RINGS[node.ringIndex].color;

          return (
            <g key={`node-${i}`} opacity={appear}>
              <circle
                cx={nx}
                cy={ny}
                r={r * 3 * pulse}
                fill={`${ringColor}22`}
              />
              <circle
                cx={nx}
                cy={ny}
                r={r * 1.5}
                fill={`${ringColor}55`}
                filter="url(#nodeGlow)"
              />
              <circle
                cx={nx}
                cy={ny}
                r={r}
                fill={ringColor}
                opacity={0.9}
              />
            </g>
          );
        })}

        {/* Central hub glow */}
        <circle
          cx={cx}
          cy={cy}
          r={300 * Math.min(scaleX, scaleY)}
          fill="url(#hubGlow)"
          opacity={0.3 + Math.sin(t * 0.6) * 0.1}
        />

        {/* Central hub core */}
        <g filter="url(#softGlow)">
          <circle
            cx={cx}
            cy={cy}
            r={60 * Math.min(scaleX, scaleY)}
            fill="rgba(0, 245, 255, 0.08)"
            stroke="rgba(0, 245, 255, 0.4)"
            strokeWidth="2"
          />
          <circle
            cx={cx}
            cy={cy}
            r={35 * Math.min(scaleX, scaleY) * (1 + Math.sin(t * 1.5) * 0.1)}
            fill="rgba(124, 58, 237, 0.3)"
            stroke="rgba(124, 58, 237, 0.8)"
            strokeWidth="3"
          />
          <circle
            cx={cx}
            cy={cy}
            r={16 * Math.min(scaleX, scaleY)}
            fill="rgba(0, 245, 255, 0.9)"
          />
          {/* Rotating hub marker */}
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (t * 0.5 + (i / 6) * Math.PI * 2);
            const orbitR = 80 * Math.min(scaleX, scaleY);
            const mx = cx + Math.cos(angle) * orbitR;
            const my = cy + Math.sin(angle) * orbitR;
            return (
              <circle
                key={`orbit-${i}`}
                cx={mx}
                cy={my}
                r={6 * Math.min(scaleX, scaleY)}
                fill="#00f5ff"
                opacity={0.7 + Math.sin(t * 2 + i) * 0.3}
              />
            );
          })}
        </g>

        {/* Scanline sweep */}
        {(() => {
          const sweepAngle = (t * 0.4) % (Math.PI * 2);
          const sweepLen = 700 * Math.min(scaleX, scaleY);
          const ex = cx + Math.cos(sweepAngle) * sweepLen;
          const ey = cy + Math.sin(sweepAngle) * sweepLen;
          return (
            <line
              x1={cx}
              y1={cy}
              x2={ex}
              y2={ey}
              stroke="rgba(0, 245, 255, 0.15)"
              strokeWidth="2"
            />
          );
        })()}

        {/* Vignette overlay */}
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="50%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.7)" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#vignette)" />
      </svg>
    </div>
  );
};