import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { x: 0.13, y: 0.38, name: 'NYC' },
  { x: 0.22, y: 0.52, name: 'BOG' },
  { x: 0.38, y: 0.28, name: 'LON' },
  { x: 0.42, y: 0.32, name: 'PAR' },
  { x: 0.48, y: 0.26, name: 'MOS' },
  { x: 0.52, y: 0.38, name: 'CAI' },
  { x: 0.58, y: 0.30, name: 'DXB' },
  { x: 0.65, y: 0.45, name: 'MUM' },
  { x: 0.72, y: 0.35, name: 'DEL' },
  { x: 0.78, y: 0.30, name: 'BEI' },
  { x: 0.82, y: 0.38, name: 'SHA' },
  { x: 0.85, y: 0.42, name: 'HKG' },
  { x: 0.88, y: 0.48, name: 'SIN' },
  { x: 0.90, y: 0.38, name: 'TOK' },
  { x: 0.92, y: 0.62, name: 'SYD' },
  { x: 0.08, y: 0.35, name: 'SFO' },
  { x: 0.10, y: 0.42, name: 'LAX' },
  { x: 0.30, y: 0.62, name: 'SAO' },
  { x: 0.44, y: 0.55, name: 'JNB' },
  { x: 0.60, y: 0.22, name: 'IST' },
];

const CONNECTIONS = [
  [0, 2], [0, 1], [0, 15], [0, 16], [2, 3], [2, 4], [2, 9], [2, 6],
  [3, 5], [4, 6], [4, 9], [5, 7], [6, 7], [7, 8], [8, 9], [9, 10],
  [10, 11], [11, 12], [12, 13], [13, 14], [1, 17], [5, 18], [6, 19],
  [2, 19], [0, 4], [15, 2], [16, 1], [9, 13], [7, 11], [3, 19],
  [19, 6], [17, 18], [4, 19], [8, 11], [0, 9], [2, 7],
];

const PARTICLES_PER_CONNECTION = 6;

const PARTICLES = CONNECTIONS.flatMap((conn, ci) =>
  Array.from({ length: PARTICLES_PER_CONNECTION }, (_, pi) => ({
    connIndex: ci,
    offset: (pi / PARTICLES_PER_CONNECTION),
    speed: 0.3 + ((ci * 7 + pi * 13) % 100) / 300,
    size: 2 + ((ci * 3 + pi * 7) % 5),
    colorIndex: (ci * 5 + pi * 3) % 4,
  }))
);

const CONTINENTS = [
  // North America
  'M 50 130 L 80 110 L 130 105 L 160 120 L 180 145 L 200 160 L 210 190 L 190 220 L 160 240 L 140 230 L 120 250 L 100 260 L 80 250 L 60 220 L 50 200 L 40 170 Z',
  // South America
  'M 130 270 L 155 255 L 175 260 L 195 285 L 200 320 L 195 360 L 180 395 L 160 415 L 140 420 L 125 400 L 118 370 L 115 340 L 120 305 Z',
  // Europe
  'M 330 80 L 370 70 L 420 68 L 450 75 L 470 90 L 460 110 L 440 120 L 415 115 L 395 125 L 370 120 L 350 110 L 330 100 Z',
  // Africa
  'M 350 145 L 390 135 L 430 140 L 460 155 L 475 185 L 480 220 L 470 260 L 455 295 L 430 320 L 405 330 L 375 325 L 350 305 L 330 275 L 320 245 L 325 210 L 335 180 L 340 160 Z',
  // Asia
  'M 460 70 L 530 55 L 620 50 L 700 60 L 760 70 L 800 85 L 820 100 L 810 120 L 780 140 L 750 150 L 720 160 L 680 165 L 640 170 L 600 165 L 560 150 L 530 140 L 500 130 L 470 115 L 455 95 Z',
  // Australia
  'M 750 280 L 800 270 L 845 275 L 870 295 L 880 320 L 875 345 L 855 365 L 825 375 L 795 370 L 770 355 L 750 330 L 740 305 Z',
];

const COLORS = [
  { r: 0, g: 200, b: 255 },
  { r: 120, g: 80, b: 255 },
  { r: 0, g: 255, b: 180 },
  { r: 255, g: 140, b: 0 },
];

function getArcPoint(x1: number, y1: number, x2: number, y2: number, t: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const cx = mx - (dy / len) * len * 0.3;
  const cy = my + (dx / len) * len * 0.3 - len * 0.15;
  const u = 1 - t;
  return {
    x: u * u * x1 + 2 * u * t * cx + t * t * x2,
    y: u * u * y1 + 2 * u * t * cy + t * t * y2,
  };
}

function getArcPath(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const cx = mx - (dy / len) * len * 0.3;
  const cy = my + (dx / len) * len * 0.3 - len * 0.15;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

export const ParticleStreamNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const mapW = width;
  const mapH = height;

  const cityCoords = CITIES.map(c => ({ x: c.x * mapW, y: c.y * mapH }));

  const pulse = Math.sin(frame * 0.05) * 0.5 + 0.5;

  return (
    <div style={{ width, height, background: '#04060e', opacity: globalOpacity, overflow: 'hidden', position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0a1428" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowStrong" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="18" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="mapGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {COLORS.map((c, i) => (
            <radialGradient key={i} id={`pg${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={`rgb(${c.r},${c.g},${c.b})`} stopOpacity="1" />
              <stop offset="100%" stopColor={`rgb(${c.r},${c.g},${c.b})`} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        <rect width={width} height={height} fill="url(#bgGrad)" />

        {/* Grid lines */}
        {Array.from({ length: 20 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={0} y1={(i / 20) * height}
            x2={width} y2={(i / 20) * height}
            stroke="rgba(0,150,255,0.04)" strokeWidth={1}
          />
        ))}
        {Array.from({ length: 36 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={(i / 36) * width} y1={0}
            x2={(i / 36) * width} y2={height}
            stroke="rgba(0,150,255,0.04)" strokeWidth={1}
          />
        ))}

        {/* Continent shapes */}
        <g filter="url(#mapGlow)" transform={`scale(${width / 960}, ${height / 500})`}>
          {CONTINENTS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="rgba(10,40,80,0.45)"
              stroke="rgba(0,180,255,0.18)"
              strokeWidth={1.2}
            />
          ))}
        </g>

        {/* Arc paths */}
        {CONNECTIONS.map((conn, ci) => {
          const a = cityCoords[conn[0]];
          const b = cityCoords[conn[1]];
          const pathOpacity = interpolate(
            (frame + ci * 20) % 300,
            [0, 30, 200, 250],
            [0.03, 0.12, 0.12, 0.03],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          return (
            <path
              key={ci}
              d={getArcPath(a.x, a.y, b.x, b.y)}
              fill="none"
              stroke={`rgba(0,180,255,${pathOpacity})`}
              strokeWidth={1.5}
            />
          );
        })}

        {/* Particles on arcs */}
        {PARTICLES.map((p, pi) => {
          const conn = CONNECTIONS[p.connIndex];
          const a = cityCoords[conn[0]];
          const b = cityCoords[conn[1]];
          const t = ((frame * p.speed * 0.008 + p.offset) % 1 + 1) % 1;
          const pos = getArcPoint(a.x, a.y, b.x, b.y, t);
          const col = COLORS[p.colorIndex];
          const trailLength = 6;
          const trailPositions = Array.from({ length: trailLength }, (_, ti) => {
            const tt = ((t - (ti + 1) * 0.012) % 1 + 1) % 1;
            return getArcPoint(a.x, a.y, b.x, b.y, tt);
          });
          const edgeFade = Math.sin(t * Math.PI);
          const opacity = edgeFade * 0.9;

          return (
            <g key={pi} opacity={opacity}>
              {trailPositions.map((tp, ti) => (
                <circle
                  key={ti}
                  cx={tp.x}
                  cy={tp.y}
                  r={p.size * (1 - ti / trailLength) * 0.6}
                  fill={`rgba(${col.r},${col.g},${col.b},${(1 - ti / trailLength) * 0.35})`}
                />
              ))}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={p.size * 1.8}
                fill={`rgba(${col.r},${col.g},${col.b},0.15)`}
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={p.size}
                fill={`rgb(${col.r},${col.g},${col.b})`}
                filter="url(#glow)"
              />
            </g>
          );
        })}

        {/* City nodes */}
        {cityCoords.map((c, i) => {
          const pulseFactor = 1 + pulse * 0.3 * ((i % 3) * 0.3 + 0.7);
          const baseR = 6 + (i % 4) * 2;
          const ringR = baseR * 2.5 * pulseFactor;
          const col = COLORS[i % 4];
          const r = col.r, g = col.g, b = col.b;
          return (
            <g key={i} filter="url(#glowStrong)">
              <circle cx={c.x} cy={c.y} r={ringR} fill="none" stroke={`rgba(${r},${g},${b},0.15)`} strokeWidth={1.5} />
              <circle cx={c.x} cy={c.y} r={ringR * 0.65} fill="none" stroke={`rgba(${r},${g},${b},0.25)`} strokeWidth={1} />
              <circle cx={c.x} cy={c.y} r={baseR + 4} fill={`rgba(${r},${g},${b},0.2)`} />
              <circle cx={c.x} cy={c.y} r={baseR} fill={`rgba(${r},${g},${b},0.8)`} />
              <circle cx={c.x} cy={c.y} r={baseR * 0.5} fill={`rgb(${Math.min(r + 80, 255)},${Math.min(g + 80, 255)},${Math.min(b + 80, 255)})`} />
            </g>
          );
        })}

        {/* Ambient glow spots */}
        {[
          { x: 0.5, y: 0.5, r: 0.25, col: '0,100,200' },
          { x: 0.15, y: 0.4, r: 0.15, col: '0,80,180' },
          { x: 0.8, y: 0.35, r: 0.18, col: '80,0,200' },
          { x: 0.65, y: 0.6, r: 0.12, col: '0,180,120' },
        ].map((s, i) => {
          const phase = (frame * 0.02 + i * 1.5) % (Math.PI * 2);
          const glowA = 0.03 + Math.sin(phase) * 0.015;
          return (
            <radialGradient key={i} id={`amb${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={`rgb(${s.col})`} stopOpacity={glowA * 4} />
              <stop offset="100%" stopColor={`rgb(${s.col})`} stopOpacity="0" />
            </radialGradient>
          );
        })}
        {[
          { x: 0.5, y: 0.5, r: 0.25 },
          { x: 0.15, y: 0.4, r: 0.15 },
          { x: 0.8, y: 0.35, r: 0.18 },
          { x: 0.65, y: 0.6, r: 0.12 },
        ].map((s, i) => (
          <ellipse
            key={i}
            cx={s.x * width}
            cy={s.y * height}
            rx={s.r * width}
            ry={s.r * height * 0.6}
            fill={`url(#amb${i})`}
          />
        ))}

        {/* Scanline overlay */}
        <rect
          width={width}
          height={height}
          fill="none"
          stroke="rgba(0,150,255,0.015)"
          strokeWidth={0}
          style={{ mixBlendMode: 'screen' }}
        />

        {/* Vignette */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.7)" />
        </radialGradient>
        <rect width={width} height={height} fill="url(#vignette)" />
      </svg>
    </div>
  );
};