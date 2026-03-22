import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const HQ = { x: 0.5, y: 0.42 }; // centered on world map

const OFFICES = [
  { x: 0.13, y: 0.35, delay: 40, label: 'NY' },
  { x: 0.18, y: 0.55, label: 'SAO', delay: 70 },
  { x: 0.47, y: 0.28, label: 'LON', delay: 90 },
  { x: 0.52, y: 0.25, label: 'PAR', delay: 110 },
  { x: 0.56, y: 0.27, label: 'BER', delay: 130 },
  { x: 0.62, y: 0.30, label: 'DUB', delay: 150 },
  { x: 0.58, y: 0.35, label: 'CAI', delay: 165 },
  { x: 0.65, y: 0.42, label: 'MUM', delay: 180 },
  { x: 0.72, y: 0.38, label: 'BKK', delay: 195 },
  { x: 0.76, y: 0.33, label: 'BEI', delay: 210 },
  { x: 0.80, y: 0.38, label: 'TOK', delay: 225 },
  { x: 0.83, y: 0.58, label: 'SYD', delay: 240 },
  { x: 0.22, y: 0.38, label: 'CHI', delay: 55 },
  { x: 0.15, y: 0.32, label: 'TOR', delay: 48 },
  { x: 0.10, y: 0.42, label: 'MEX', delay: 62 },
  { x: 0.68, y: 0.55, label: 'JNB', delay: 200 },
  { x: 0.44, y: 0.24, label: 'MAD', delay: 120 },
  { x: 0.70, y: 0.28, label: 'DEL', delay: 185 },
  { x: 0.26, y: 0.58, label: 'BOG', delay: 80 },
  { x: 0.60, y: 0.23, label: 'MOS', delay: 140 },
];

const PARTICLES = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 1337 + 200) % 2160,
  size: ((i * 17) % 3) + 1,
  speed: ((i * 7) % 40) + 20,
  phase: (i * 113) % 628,
}));

const GRID_COLS = 40;
const GRID_ROWS = 22;

const CONTINENTS: Array<{ points: string; opacity: number }> = [
  // North America
  { points: '380,160 480,140 560,150 580,200 560,260 520,300 480,320 440,310 400,280 360,240 340,200', opacity: 0.18 },
  // South America
  { points: '440,360 500,350 540,370 550,420 530,490 500,540 460,520 430,470 420,420', opacity: 0.18 },
  // Europe
  { points: '820,140 900,130 960,150 980,180 960,220 920,230 880,220 840,210 810,190', opacity: 0.18 },
  // Africa
  { points: '860,270 930,260 980,280 1000,340 990,420 960,480 920,490 880,460 850,400 840,330', opacity: 0.18 },
  // Asia
  { points: '980,120 1100,110 1240,130 1320,160 1360,200 1340,260 1280,290 1200,280 1100,260 1020,230 980,190', opacity: 0.18 },
  // Australia
  { points: '1260,380 1340,370 1380,400 1370,450 1320,460 1270,440 1250,410', opacity: 0.18 },
];

function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

function getArcPath(x1: number, y1: number, x2: number, y2: number, w: number, h: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const curvature = 0.35;
  const cx = mx - dy * curvature;
  const cy = my + dx * curvature - dist * 0.1;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

function getPointOnQuadratic(
  x1: number, y1: number,
  x2: number, y2: number,
  t: number
): { x: number; y: number } {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const curvature = 0.35;
  const cx = mx - dy * curvature;
  const cy = my + dx * curvature - dist * 0.1;
  const mt = 1 - t;
  return {
    x: mt * mt * x1 + 2 * mt * t * cx + t * t * x2,
    y: mt * mt * y1 + 2 * mt * t * cy + t * t * y2,
  };
}

export const CorporateExpansionMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const hqX = HQ.x * width;
  const hqY = HQ.y * height;

  const mapScale = width / 1920;

  return (
    <div style={{ width, height, background: '#030810', position: 'relative', overflow: 'hidden', opacity: globalOpacity }}>
      {/* Deep space background gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 40%, #0a1628 0%, #030810 70%)',
      }} />

      {/* Animated grid */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0, opacity: 0.06 }}>
        {Array.from({ length: GRID_COLS + 1 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * (width / GRID_COLS)} y1={0}
            x2={i * (width / GRID_COLS)} y2={height}
            stroke="#4af0ff" strokeWidth="1"
          />
        ))}
        {Array.from({ length: GRID_ROWS + 1 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={0} y1={i * (height / GRID_ROWS)}
            x2={width} y2={i * (height / GRID_ROWS)}
            stroke="#4af0ff" strokeWidth="1"
          />
        ))}
      </svg>

      {/* World map continents */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <filter id="glow-map">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="16" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-office">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="hq-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#0066ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0033aa" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bg-glow" cx="50%" cy="42%" r="40%">
            <stop offset="0%" stopColor="#0a2050" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#030810" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background glow */}
        <rect x={0} y={0} width={width} height={height} fill="url(#bg-glow)" />

        {/* Continent shapes scaled to 4K */}
        {CONTINENTS.map((c, i) => {
          const scaledPoints = c.points.split(' ').map(pt => {
            const [px, py] = pt.split(',').map(Number);
            return `${px * mapScale * 2},${py * mapScale * 2}`;
          }).join(' ');
          return (
            <polygon
              key={i}
              points={scaledPoints}
              fill="#1a3a6a"
              stroke="#2a5a9a"
              strokeWidth="2"
              opacity={c.opacity * 3}
              filter="url(#glow-map)"
            />
          );
        })}

        {/* Longitude/latitude curves */}
        {Array.from({ length: 12 }, (_, i) => {
          const lat = (i / 11) * height;
          return (
            <ellipse
              key={`lat${i}`}
              cx={width / 2} cy={lat}
              rx={width * 0.48} ry={width * 0.04}
              fill="none"
              stroke="#1a4060"
              strokeWidth="1"
              opacity={0.15}
            />
          );
        })}

        {/* Connection lines from HQ to offices */}
        {OFFICES.map((office, i) => {
          const ox = office.x * width;
          const oy = office.y * height;
          const lineStart = office.delay;
          const lineEnd = lineStart + 60;
          const progress = interpolate(frame, [lineStart, lineEnd], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });

          if (progress <= 0) return null;

          const pathD = getArcPath(hqX, hqY, ox, oy, width, height);

          // Animated dash
          const totalLength = 500;
          const dashOffset = totalLength * (1 - progress);
          const trailProgress = interpolate(frame, [lineStart + 10, lineEnd + 30], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });

          // Moving particle along line
          const particlePos = getPointOnQuadratic(hqX, hqY, ox, oy, Math.min(progress, 1));

          // Pulse animation at office
          const pulsePhase = (frame - lineEnd) / 30;
          const pulseScale = interpolate(
            (pulsePhase % 1),
            [0, 0.5, 1],
            [1, 2.5, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const pulseOpacity = interpolate(
            (pulsePhase % 1),
            [0, 0.5, 1],
            [0.8, 0.1, 0.8],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const officeOpacity = interpolate(frame, [lineEnd, lineEnd + 20], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });

          const colors = [
            '#00d4ff', '#00ffaa', '#ff6b35', '#ffd700', '#ff4488',
            '#44ffdd', '#ff9944', '#aa44ff', '#44ff88', '#ff4444',
          ];
          const color = colors[i % colors.length];

          return (
            <g key={i}>
              {/* Line trail */}
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeOpacity={0.15 * trailProgress}
                strokeDasharray={`${totalLength} ${totalLength}`}
                strokeDashoffset={0}
              />
              {/* Animated line */}
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeOpacity={0.9}
                strokeDasharray={`${totalLength} ${totalLength}`}
                strokeDashoffset={dashOffset}
                filter="url(#glow-office)"
              />
              {/* Moving particle */}
              {progress > 0 && progress < 1 && (
                <circle
                  cx={particlePos.x}
                  cy={particlePos.y}
                  r={12}
                  fill={color}
                  opacity={0.9}
                  filter="url(#glow-strong)"
                />
              )}
              {/* Office node */}
              {officeOpacity > 0 && (
                <g opacity={officeOpacity} filter="url(#glow-office)">
                  {/* Pulse ring */}
                  <circle
                    cx={ox} cy={oy}
                    r={20 * pulseScale}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    opacity={pulseOpacity * officeOpacity}
                  />
                  {/* Outer ring */}
                  <circle cx={ox} cy={oy} r={16} fill="none" stroke={color} strokeWidth="2" opacity={0.6} />
                  {/* Inner dot */}
                  <circle cx={ox} cy={oy} r={8} fill={color} opacity={0.95} />
                  {/* Center spark */}
                  <circle cx={ox} cy={oy} r={4} fill="white" opacity={0.8} />
                </g>
              )}
            </g>
          );
        })}

        {/* HQ node */}
        {(() => {
          const hqPulse = (frame / 40) % 1;
          const hqPulseR = interpolate(hqPulse, [0, 1], [30, 80]);
          const hqPulseO = interpolate(hqPulse, [0, 0.5, 1], [0.8, 0.1, 0]);
          const hqAppear = interpolate(frame, [0, 40], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });

          return (
            <g opacity={hqAppear} filter="url(#glow-strong)">
              {/* Large glow */}
              <circle cx={hqX} cy={hqY} r={120} fill="url(#hq-glow)" opacity={0.4} />
              {/* Pulse ring */}
              <circle cx={hqX} cy={hqY} r={hqPulseR} fill="none" stroke="#00d4ff" strokeWidth="3" opacity={hqPulseO} />
              {/* Secondary pulse */}
              <circle cx={hqX} cy={hqY} r={interpolate((frame / 60) % 1, [0, 1], [20, 70])}
                fill="none" stroke="#4488ff" strokeWidth="2"
                opacity={interpolate((frame / 60) % 1, [0, 0.5, 1], [0.6, 0.1, 0])} />
              {/* Outer ring */}
              <circle cx={hqX} cy={hqY} r={32} fill="none" stroke="#00d4ff" strokeWidth="3" opacity={0.8} />
              {/* Inner glow */}
              <circle cx={hqX} cy={hqY} r={22} fill="#003366" stroke="#00aaff" strokeWidth="2" opacity={0.9} />
              {/* Diamond shape */}
              <polygon
                points={`${hqX},${hqY - 18} ${hqX + 18},${hqY} ${hqX},${hqY + 18} ${hqX - 18},${hqY}`}
                fill="#00d4ff"
                opacity={0.8}
              />
              {/* Center bright */}
              <circle cx={hqX} cy={hqY} r={8} fill="white" opacity={0.95} />
              {/* Crosshair lines */}
              <line x1={hqX - 50} y1={hqY} x2={hqX - 36} y2={hqY} stroke="#00d4ff" strokeWidth="2" opacity={0.6} />
              <line x1={hqX + 36} y1={hqY} x2={hqX + 50} y2={hqY} stroke="#00d4ff" strokeWidth="2" opacity={0.6} />
              <line x1={hqX} y1={hqY - 50} x2={hqX} y2={hqY - 36} stroke="#00d4ff" strokeWidth="2" opacity={0.6} />
              <line x1={hqX} y1={hqY + 36} x2={hqX} y2={hqY + 50} stroke="#00d4ff" strokeWidth="2" opacity={0.6} />
            </g>
          );
        })()}

        {/* Floating particles */}
        {PARTICLES.map((p, i) => {
          const floatY = p.y + Math.sin((frame / p.speed) + p.phase / 100) * 30;
          const particleOpacity = interpolate(
            Math.sin((frame / (p.speed * 0.5)) + p.phase / 100),
            [-1, 0, 1],
            [0.05, 0.4, 0.05]
          );
          return (
            <circle
              key={i}
              cx={p.x}
              cy={floatY}
              r={p.size}
              fill="#4af0ff"
              opacity={particleOpacity * 0.5}
            />
          );
        })}

        {/* Scan line effect */}
        {(() => {
          const scanY = ((frame / durationInFrames) * height * 1.4) - height * 0.2;
          return (
            <rect
              x={0} y={scanY - 2} width={width} height={4}
              fill="#00d4ff"
              opacity={0.04}
            />
          );
        })()}

        {/* Corner decorations */}
        {[
          { x: 80, y: 80, rot: 0 },
          { x: width - 80, y: 80, rot: 90 },
          { x: width - 80, y: height - 80, rot: 180 },
          { x: 80, y: height - 80, rot: 270 },
        ].map((corner, i) => (
          <g key={i} transform={`translate(${corner.x}, ${corner.y}) rotate(${corner.rot})`}>
            <line x1={0} y1={0} x2={60} y2={0} stroke="#00d4ff" strokeWidth="3" opacity={0.5} />
            <line x1={0} y1={0} x2={0} y2={60} stroke="#00d4ff" strokeWidth="3" opacity={0.5} />
            <circle cx={0} cy={0} r={6} fill="#00d4ff" opacity={0.7} />
          </g>
        ))}

        {/* Data rings around HQ expanding over time */}
        {[1, 2, 3].map((ring) => {
          const ringProgress = interpolate(
            frame,
            [ring * 40, ring * 40 + 80],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const ringR = ring * 180 * ringProgress;
          return (
            <circle
              key={ring}
              cx={hqX} cy={hqY}
              r={ringR}
              fill="none"
              stroke="#0066ff"
              strokeWidth="1"
              strokeDasharray="20 15"
              opacity={0.15 * ringProgress}
            />
          );
        })}
      </svg>

      {/* Vignette overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, #000 100%)',
        pointerEvents: 'none',
      }} />

      {/* Top bar glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: 'linear-gradient(90deg, transparent, #00d4ff, #0066ff, #00d4ff, transparent)',
        opacity: 0.6,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
        background: 'linear-gradient(90deg, transparent, #00d4ff, #0066ff, #00d4ff, transparent)',
        opacity: 0.6,
      }} />
    </div>
  );
};