import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const HUBS = [
  { x: 0.5, y: 0.5, label: 'center', radius: 0.045 },
  { x: 0.2, y: 0.25, label: 'hub', radius: 0.03 },
  { x: 0.75, y: 0.22, label: 'hub', radius: 0.03 },
  { x: 0.15, y: 0.65, label: 'hub', radius: 0.03 },
  { x: 0.82, y: 0.6, label: 'hub', radius: 0.03 },
  { x: 0.5, y: 0.82, label: 'hub', radius: 0.03 },
];

const BRANCHES = [
  { hubIdx: 1, x: 0.08, y: 0.12, radius: 0.018 },
  { hubIdx: 1, x: 0.14, y: 0.38, radius: 0.018 },
  { hubIdx: 1, x: 0.28, y: 0.1, radius: 0.018 },
  { hubIdx: 2, x: 0.65, y: 0.1, radius: 0.018 },
  { hubIdx: 2, x: 0.88, y: 0.1, radius: 0.018 },
  { hubIdx: 2, x: 0.92, y: 0.32, radius: 0.018 },
  { hubIdx: 3, x: 0.04, y: 0.55, radius: 0.018 },
  { hubIdx: 3, x: 0.08, y: 0.78, radius: 0.018 },
  { hubIdx: 3, x: 0.26, y: 0.82, radius: 0.018 },
  { hubIdx: 4, x: 0.72, y: 0.78, radius: 0.018 },
  { hubIdx: 4, x: 0.92, y: 0.72, radius: 0.018 },
  { hubIdx: 4, x: 0.94, y: 0.48, radius: 0.018 },
  { hubIdx: 5, x: 0.36, y: 0.93, radius: 0.018 },
  { hubIdx: 5, x: 0.62, y: 0.94, radius: 0.018 },
  { hubIdx: 5, x: 0.5, y: 0.96, radius: 0.018 },
];

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  hubIdx: i % 5 + 1,
  branchIdx: i % BRANCHES.length,
  offset: (i * 137) % 100 / 100,
  speed: 0.4 + (i * 31 % 60) / 100,
}));

const GRID_LINES_H = Array.from({ length: 22 }, (_, i) => i);
const GRID_LINES_V = Array.from({ length: 38 }, (_, i) => i);

const PULSE_RINGS = Array.from({ length: 5 }, (_, i) => ({
  delay: i * 20,
  maxR: 0.38 + (i % 3) * 0.05,
}));

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export const ElectricPurpleCorporateNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const cx = width * HUBS[0].x;
  const cy = height * HUBS[0].y;

  return (
    <div style={{ width, height, background: '#07020f', overflow: 'hidden', opacity: globalOpacity, position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Grid */}
        {GRID_LINES_H.map((i) => {
          const y = (i / 21) * height;
          return (
            <line
              key={`h${i}`}
              x1={0} y1={y} x2={width} y2={y}
              stroke="#2a0a4a"
              strokeWidth={1.5}
              opacity={0.35}
            />
          );
        })}
        {GRID_LINES_V.map((i) => {
          const x = (i / 37) * width;
          return (
            <line
              key={`v${i}`}
              x1={x} y1={0} x2={x} y2={height}
              stroke="#2a0a4a"
              strokeWidth={1.5}
              opacity={0.35}
            />
          );
        })}

        {/* Pulse rings from center */}
        {PULSE_RINGS.map((ring, ri) => {
          const t = ((frame + ring.delay * 3) % 90) / 90;
          const r = t * ring.maxR * Math.min(width, height);
          const opacity = interpolate(t, [0, 0.5, 1], [0.8, 0.4, 0]);
          return (
            <circle
              key={`pulse${ri}`}
              cx={cx} cy={cy}
              r={r}
              fill="none"
              stroke={`rgba(180,50,255,${opacity})`}
              strokeWidth={3 + (1 - t) * 4}
            />
          );
        })}

        {/* Lines from center to hubs */}
        {HUBS.slice(1).map((hub, hi) => {
          const hx = width * hub.x;
          const hy = height * hub.y;
          const pulse = (Math.sin((frame + hi * 30) * 0.06) + 1) / 2;
          return (
            <line
              key={`ch${hi}`}
              x1={cx} y1={cy} x2={hx} y2={hy}
              stroke={`rgba(160,40,255,${0.3 + pulse * 0.5})`}
              strokeWidth={3 + pulse * 4}
              strokeDasharray={`${20 + pulse * 20} ${15}`}
              strokeDashoffset={-(frame * 4)}
            />
          );
        })}

        {/* Lines from hubs to branches */}
        {BRANCHES.map((branch, bi) => {
          const hub = HUBS[branch.hubIdx];
          const hx = width * hub.x;
          const hy = height * hub.y;
          const bx = width * branch.x;
          const by = height * branch.y;
          const pulse = (Math.sin((frame + bi * 17) * 0.08) + 1) / 2;
          return (
            <line
              key={`hb${bi}`}
              x1={hx} y1={hy} x2={bx} y2={by}
              stroke={`rgba(200,80,255,${0.2 + pulse * 0.4})`}
              strokeWidth={2 + pulse * 2}
              strokeDasharray={`${12 + pulse * 10} 10`}
              strokeDashoffset={-(frame * 3)}
            />
          );
        })}

        {/* Particles along hub lines */}
        {PARTICLES.map((p, pi) => {
          const branch = BRANCHES[p.branchIdx];
          const hub = HUBS[branch.hubIdx];
          const stage = (frame * p.speed * 0.015 + p.offset) % 2;
          let px: number, py: number, opacity: number, size: number;

          if (stage < 1) {
            // center to hub
            const t = stage;
            const hx = width * hub.x;
            const hy = height * hub.y;
            px = lerp(cx, hx, t);
            py = lerp(cy, hy, t);
            opacity = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0.3]);
            size = 6;
          } else {
            // hub to branch
            const t = stage - 1;
            const hx = width * hub.x;
            const hy = height * hub.y;
            const bx = width * branch.x;
            const by = height * branch.y;
            px = lerp(hx, bx, t);
            py = lerp(hy, by, t);
            opacity = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
            size = 5;
          }

          return (
            <g key={`pt${pi}`}>
              <circle
                cx={px} cy={py} r={size * 2.5}
                fill={`rgba(200,100,255,${opacity * 0.15})`}
              />
              <circle
                cx={px} cy={py} r={size}
                fill={`rgba(230,150,255,${opacity})`}
              />
            </g>
          );
        })}

        {/* Hub nodes */}
        {HUBS.map((hub, hi) => {
          const hx = width * hub.x;
          const hy = height * hub.y;
          const r = width * hub.radius;
          const pulse = (Math.sin((frame + hi * 20) * 0.07) + 1) / 2;
          const isCenter = hi === 0;

          return (
            <g key={`hub${hi}`}>
              {/* Outer glow */}
              <circle
                cx={hx} cy={hy}
                r={r * (1.8 + pulse * 0.6)}
                fill={`rgba(${isCenter ? '200,60,255' : '150,40,220'},${0.08 + pulse * 0.1})`}
              />
              <circle
                cx={hx} cy={hy}
                r={r * (1.3 + pulse * 0.3)}
                fill={`rgba(${isCenter ? '180,50,255' : '130,30,200'},${0.15 + pulse * 0.1})`}
              />
              {/* Core */}
              <circle
                cx={hx} cy={hy}
                r={r}
                fill={`rgba(${isCenter ? '220,80,255' : '170,50,240'},0.9)`}
              />
              {/* Inner bright */}
              <circle
                cx={hx} cy={hy}
                r={r * 0.45}
                fill={`rgba(240,200,255,${0.7 + pulse * 0.3})`}
              />
              {/* Ring */}
              <circle
                cx={hx} cy={hy}
                r={r}
                fill="none"
                stroke={`rgba(230,120,255,${0.6 + pulse * 0.4})`}
                strokeWidth={3 + pulse * 3}
              />
            </g>
          );
        })}

        {/* Branch nodes */}
        {BRANCHES.map((branch, bi) => {
          const bx = width * branch.x;
          const by = height * branch.y;
          const r = width * branch.radius;
          const pulse = (Math.sin((frame + bi * 13) * 0.09) + 1) / 2;

          return (
            <g key={`branch${bi}`}>
              <circle
                cx={bx} cy={by}
                r={r * (1.6 + pulse * 0.5)}
                fill={`rgba(120,30,200,${0.1 + pulse * 0.08})`}
              />
              <circle
                cx={bx} cy={by}
                r={r}
                fill={`rgba(140,40,210,0.85)`}
              />
              <circle
                cx={bx} cy={by}
                r={r * 0.45}
                fill={`rgba(220,170,255,${0.6 + pulse * 0.4})`}
              />
              <circle
                cx={bx} cy={by}
                r={r}
                fill="none"
                stroke={`rgba(200,100,255,${0.4 + pulse * 0.4})`}
                strokeWidth={2 + pulse * 2}
              />
            </g>
          );
        })}

        {/* Large background ambient glow at center */}
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5500aa" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#07020f" stopOpacity="0" />
        </radialGradient>
        <ellipse
          cx={cx} cy={cy}
          rx={width * 0.35}
          ry={height * 0.35}
          fill="url(#centerGlow)"
        />
      </svg>
    </div>
  );
};