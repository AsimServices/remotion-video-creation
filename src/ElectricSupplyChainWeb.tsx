import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NODES = [
  { id: 0, x: 0.12, y: 0.38, label: 'NYC' },
  { id: 1, x: 0.22, y: 0.62, label: 'SAO' },
  { id: 2, x: 0.45, y: 0.28, label: 'LON' },
  { id: 3, x: 0.52, y: 0.42, label: 'FRA' },
  { id: 4, x: 0.55, y: 0.62, label: 'LAG' },
  { id: 5, x: 0.62, y: 0.32, label: 'MOW' },
  { id: 6, x: 0.72, y: 0.38, label: 'DXB' },
  { id: 7, x: 0.78, y: 0.55, label: 'MUM' },
  { id: 8, x: 0.82, y: 0.30, label: 'DEL' },
  { id: 9, x: 0.88, y: 0.42, label: 'SHA' },
  { id: 10, x: 0.92, y: 0.30, label: 'TOK' },
  { id: 11, x: 0.88, y: 0.65, label: 'SIN' },
  { id: 12, x: 0.93, y: 0.72, label: 'SYD' },
  { id: 13, x: 0.35, y: 0.48, label: 'CAI' },
];

const ROUTES = [
  { from: 0, to: 2, speed: 0.0018 },
  { from: 0, to: 3, speed: 0.0015 },
  { from: 1, to: 4, speed: 0.0020 },
  { from: 2, to: 3, speed: 0.0025 },
  { from: 2, to: 5, speed: 0.0017 },
  { from: 3, to: 6, speed: 0.0022 },
  { from: 3, to: 13, speed: 0.0019 },
  { from: 4, to: 13, speed: 0.0021 },
  { from: 5, to: 6, speed: 0.0016 },
  { from: 5, to: 9, speed: 0.0014 },
  { from: 6, to: 7, speed: 0.0023 },
  { from: 6, to: 8, speed: 0.0020 },
  { from: 7, to: 11, speed: 0.0018 },
  { from: 8, to: 9, speed: 0.0024 },
  { from: 9, to: 10, speed: 0.0026 },
  { from: 9, to: 11, speed: 0.0019 },
  { from: 10, to: 12, speed: 0.0015 },
  { from: 11, to: 12, speed: 0.0022 },
  { from: 0, to: 1, speed: 0.0013 },
  { from: 13, to: 6, speed: 0.0017 },
];

const PACKETS_PER_ROUTE = 4;

const PACKETS = ROUTES.flatMap((route, ri) =>
  Array.from({ length: PACKETS_PER_ROUTE }, (_, pi) => ({
    routeIndex: ri,
    offset: (pi / PACKETS_PER_ROUTE),
    size: 6 + ((ri * 3 + pi * 7) % 8),
    trailLength: 0.08 + ((pi * 13 + ri * 7) % 20) * 0.004,
  }))
);

const BACKGROUND_STARS = Array.from({ length: 180 }, (_, i) => ({
  x: (i * 1731 + 317) % 3840,
  y: (i * 1337 + 211) % 2160,
  r: 1 + (i % 3),
  opacity: 0.2 + (i % 5) * 0.08,
}));

const PULSE_NODES = [0, 2, 9, 10, 6];

function lerpPoint(x1: number, y1: number, x2: number, y2: number, t: number) {
  const cx = (x1 + x2) / 2;
  const cy = Math.min(y1, y2) - 0.12 - Math.abs(x2 - x1) * 0.15;
  const mt = 1 - t;
  return {
    x: mt * mt * x1 + 2 * mt * t * cx + t * t * x2,
    y: mt * mt * y1 + 2 * mt * t * cy + t * t * y2,
  };
}

function getBezierPath(x1: number, y1: number, x2: number, y2: number) {
  const cx = (x1 + x2) / 2;
  const cy = Math.min(y1, y2) - 0.12 - Math.abs(x2 - x1) * 0.15;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

export const ElectricSupplyChainWeb: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const time = frame / 30;

  return (
    <div style={{ width, height, background: '#020a04', position: 'relative', overflow: 'hidden', opacity: globalOpacity }}>
      {/* Deep background grid */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#0a2a10" stopOpacity="1" />
            <stop offset="100%" stopColor="#020a04" stopOpacity="1" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="18" result="blur" />
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
        </defs>

        {/* Background gradient */}
        <rect width={width} height={height} fill="url(#bgGlow)" />

        {/* Stars */}
        {BACKGROUND_STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#39ff7a"
            opacity={s.opacity * (0.6 + 0.4 * Math.sin(time * 1.2 + i * 0.7))}
          />
        ))}

        {/* Route lines */}
        {ROUTES.map((route, ri) => {
          const from = NODES[route.from];
          const to = NODES[route.to];
          const x1 = from.x * width;
          const y1 = from.y * height;
          const x2 = to.x * width;
          const y2 = to.y * height;
          const pathStr = getBezierPath(x1, y1, x2, y2);
          const lineOpacity = 0.25 + 0.08 * Math.sin(time * 0.8 + ri * 0.5);
          return (
            <g key={ri}>
              <path
                d={pathStr}
                fill="none"
                stroke="#00ff44"
                strokeWidth={1.5}
                opacity={lineOpacity * 0.5}
                filter="url(#softGlow)"
              />
              <path
                d={pathStr}
                fill="none"
                stroke="#00ff44"
                strokeWidth={0.8}
                opacity={lineOpacity}
              />
            </g>
          );
        })}

        {/* Data packets */}
        {PACKETS.map((pkt, pi) => {
          const route = ROUTES[pkt.routeIndex];
          const from = NODES[route.from];
          const to = NODES[route.to];
          const x1 = from.x * width;
          const y1 = from.y * height;
          const x2 = to.x * width;
          const y2 = to.y * height;

          const rawT = ((time * route.speed * 30 + pkt.offset) % 1 + 1) % 1;
          const pos = lerpPoint(x1, y1, x2, y2, rawT);

          // Trail
          const trailPoints = Array.from({ length: 12 }, (_, ti) => {
            const trailT = Math.max(0, rawT - pkt.trailLength * (ti / 11));
            return lerpPoint(x1, y1, x2, y2, trailT);
          });

          const trailPath = trailPoints
            .map((p, ti) => (ti === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
            .join(' ');

          const pulseScale = 1 + 0.4 * Math.sin(time * 6 + pi * 1.3);

          return (
            <g key={pi}>
              {/* Trail */}
              <path
                d={trailPath}
                fill="none"
                stroke="#00ff44"
                strokeWidth={pkt.size * 0.5}
                strokeLinecap="round"
                opacity={0.35}
                filter="url(#softGlow)"
              />
              <path
                d={trailPath}
                fill="none"
                stroke="#aaffcc"
                strokeWidth={pkt.size * 0.2}
                strokeLinecap="round"
                opacity={0.6}
              />
              {/* Packet glow */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={pkt.size * 2.5 * pulseScale}
                fill="#00ff44"
                opacity={0.15}
                filter="url(#softGlow)"
              />
              {/* Packet core */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={pkt.size * 0.7}
                fill="#ccffdd"
                opacity={0.95}
                filter="url(#glow)"
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={pkt.size * 0.35}
                fill="#ffffff"
                opacity={0.9}
              />
            </g>
          );
        })}

        {/* Nodes */}
        {NODES.map((node, ni) => {
          const nx = node.x * width;
          const ny = node.y * height;
          const isPulse = PULSE_NODES.includes(ni);
          const pulseT = (time * 1.5 + ni * 0.7) % 1;
          const pulseR = interpolate(pulseT, [0, 1], [8, 60]);
          const pulseOp = interpolate(pulseT, [0, 0.5, 1], [0.6, 0.3, 0]);
          const innerPulse = 1 + 0.25 * Math.sin(time * 3 + ni * 1.1);

          return (
            <g key={ni}>
              {isPulse && (
                <>
                  <circle cx={nx} cy={ny} r={pulseR} fill="none" stroke="#00ff44" strokeWidth={1.5} opacity={pulseOp} />
                  <circle cx={nx} cy={ny} r={pulseR * 0.6} fill="none" stroke="#00ff44" strokeWidth={0.8} opacity={pulseOp * 0.5} />
                </>
              )}
              {/* Node outer ring */}
              <circle
                cx={nx}
                cy={ny}
                r={16 * innerPulse}
                fill="none"
                stroke="#00ff44"
                strokeWidth={1.5}
                opacity={0.4}
                filter="url(#softGlow)"
              />
              <circle
                cx={nx}
                cy={ny}
                r={12}
                fill="#020a04"
                stroke="#00ff44"
                strokeWidth={2}
                opacity={0.9}
                filter="url(#nodeGlow)"
              />
              <circle
                cx={nx}
                cy={ny}
                r={6}
                fill="#00ff44"
                opacity={0.9}
                filter="url(#glow)"
              />
              <circle
                cx={nx}
                cy={ny}
                r={3}
                fill="#ccffdd"
                opacity={1}
              />
            </g>
          );
        })}

        {/* Global ambient glow at center */}
        <ellipse
          cx={width * 0.5}
          cy={height * 0.45}
          rx={width * 0.45}
          ry={height * 0.35}
          fill="none"
          stroke="#00ff44"
          strokeWidth={1}
          opacity={0.04 + 0.02 * Math.sin(time * 0.5)}
          filter="url(#softGlow)"
        />
      </svg>

      {/* Scanline overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,68,0.012) 3px, rgba(0,255,68,0.012) 4px)',
        pointerEvents: 'none',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};