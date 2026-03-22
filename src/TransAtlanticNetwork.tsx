import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { name: 'New York', x: 0.22, y: 0.38, region: 'america' },
  { name: 'Boston', x: 0.21, y: 0.34, region: 'america' },
  { name: 'Washington', x: 0.225, y: 0.41, region: 'america' },
  { name: 'Toronto', x: 0.235, y: 0.33, region: 'america' },
  { name: 'Chicago', x: 0.195, y: 0.35, region: 'america' },
  { name: 'Miami', x: 0.215, y: 0.47, region: 'america' },
  { name: 'London', x: 0.47, y: 0.28, region: 'europe' },
  { name: 'Paris', x: 0.49, y: 0.31, region: 'europe' },
  { name: 'Frankfurt', x: 0.51, y: 0.29, region: 'europe' },
  { name: 'Amsterdam', x: 0.495, y: 0.265, region: 'europe' },
  { name: 'Madrid', x: 0.465, y: 0.36, region: 'europe' },
  { name: 'Zurich', x: 0.505, y: 0.315, region: 'europe' },
];

const CONNECTIONS = [
  { from: 0, to: 6, delay: 0 },
  { from: 0, to: 7, delay: 15 },
  { from: 1, to: 9, delay: 30 },
  { from: 2, to: 6, delay: 45 },
  { from: 3, to: 8, delay: 10 },
  { from: 4, to: 7, delay: 55 },
  { from: 5, to: 10, delay: 20 },
  { from: 0, to: 8, delay: 35 },
  { from: 1, to: 6, delay: 50 },
  { from: 2, to: 11, delay: 25 },
  { from: 3, to: 7, delay: 60 },
  { from: 4, to: 9, delay: 40 },
  { from: 5, to: 8, delay: 70 },
  { from: 0, to: 11, delay: 80 },
  { from: 1, to: 10, delay: 90 },
];

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  x: (i * 1731 + 200) % 3840,
  y: (i * 1337 + 100) % 2160,
  size: ((i * 97) % 4) + 1,
  speed: ((i * 53) % 60) + 30,
  opacity: ((i * 73) % 60) + 20,
}));

const GRID_LINES_H = Array.from({ length: 20 }, (_, i) => i);
const GRID_LINES_V = Array.from({ length: 36 }, (_, i) => i);

const LAND_PATCHES = Array.from({ length: 30 }, (_, i) => ({
  x: (i * 2311) % 3840,
  y: (i * 1789) % 2160,
  rx: ((i * 137) % 120) + 40,
  ry: ((i * 89) % 60) + 20,
  opacity: ((i * 43) % 30) + 5,
}));

export const TransAtlanticNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const arcCycleDuration = 180;

  return (
    <div style={{ width, height, background: '#020810', position: 'relative', overflow: 'hidden', opacity: globalOpacity }}>
      {/* Deep space background gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, #030d1f 0%, #020810 60%, #010508 100%)',
      }} />

      {/* Grid overlay */}
      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
        <defs>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0a4fff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0a4fff" stopOpacity="0" />
          </radialGradient>
          <filter id="blur1">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="20" />
          </filter>
          <filter id="blur3">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="arcGlow">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines horizontal */}
        {GRID_LINES_H.map((i) => (
          <line
            key={`h${i}`}
            x1={0} y1={(i / 20) * height}
            x2={width} y2={(i / 20) * height}
            stroke="#0a3060"
            strokeWidth="1"
            opacity="0.15"
          />
        ))}
        {/* Grid lines vertical */}
        {GRID_LINES_V.map((i) => (
          <line
            key={`v${i}`}
            x1={(i / 36) * width} y1={0}
            x2={(i / 36) * width} y2={height}
            stroke="#0a3060"
            strokeWidth="1"
            opacity="0.15"
          />
        ))}

        {/* Atlantic Ocean glow center */}
        <ellipse
          cx={width * 0.355}
          cy={height * 0.37}
          rx={width * 0.18}
          ry={height * 0.22}
          fill="url(#glowGrad)"
          opacity="0.6"
          filter="url(#blur2)"
        />

        {/* Stylized land masses */}
        {/* North America */}
        <ellipse cx={width * 0.2} cy={height * 0.38} rx={width * 0.09} ry={height * 0.18} fill="#0d2040" opacity="0.7" />
        <ellipse cx={width * 0.22} cy={height * 0.32} rx={width * 0.06} ry={height * 0.12} fill="#0d2040" opacity="0.6" />
        {/* Europe */}
        <ellipse cx={width * 0.5} cy={height * 0.3} rx={width * 0.06} ry={height * 0.1} fill="#0d2040" opacity="0.7" />
        <ellipse cx={width * 0.49} cy={height * 0.35} rx={width * 0.04} ry={height * 0.07} fill="#0d2040" opacity="0.5" />

        {/* Subtle land patches for texture */}
        {LAND_PATCHES.slice(0, 8).map((p, i) => (
          <ellipse key={`lp${i}`} cx={p.x * 0.15 + width * 0.12} cy={p.y * 0.08 + height * 0.28}
            rx={p.rx * 0.4} ry={p.ry * 0.4} fill="#0e2545" opacity={p.opacity / 400} />
        ))}
        {LAND_PATCHES.slice(8, 16).map((p, i) => (
          <ellipse key={`lp2${i}`} cx={p.x * 0.08 + width * 0.45} cy={p.y * 0.06 + height * 0.25}
            rx={p.rx * 0.3} ry={p.ry * 0.3} fill="#0e2545" opacity={p.opacity / 400} />
        ))}

        {/* Trans-Atlantic Arc Connections */}
        {CONNECTIONS.map((conn, idx) => {
          const fromCity = CITIES[conn.from];
          const toCity = CITIES[conn.to];
          const x1 = fromCity.x * width;
          const y1 = fromCity.y * height;
          const x2 = toCity.x * width;
          const y2 = toCity.y * height;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          const arcHeight = -Math.sqrt(dx * dx + dy * dy) * 0.28;
          const cx1 = mx;
          const cy1 = my + arcHeight;
          const pathD = `M ${x1} ${y1} Q ${cx1} ${cy1} ${x2} ${y2}`;

          const cycleOffset = (frame + conn.delay * 3) % arcCycleDuration;
          const progress = cycleOffset / arcCycleDuration;

          // Pulsing opacity for the arc
          const arcPhase = (frame * 0.02 + idx * 0.4) % (Math.PI * 2);
          const arcOpacity = 0.25 + 0.25 * Math.sin(arcPhase);

          // Traveling particle along arc
          const t = progress;
          const pt = 1 - t;
          const particleX = pt * pt * x1 + 2 * pt * t * cx1 + t * t * x2;
          const particleY = pt * pt * y1 + 2 * pt * t * cy1 + t * t * y2;

          const particleOpacity = interpolate(t, [0, 0.1, 0.9, 1.0], [0, 1, 1, 0]);

          return (
            <g key={`conn${idx}`}>
              {/* Glow arc background */}
              <path
                d={pathD}
                fill="none"
                stroke="#1a6fff"
                strokeWidth="6"
                opacity={arcOpacity * 0.4}
                filter="url(#blur1)"
              />
              {/* Main arc */}
              <path
                d={pathD}
                fill="none"
                stroke="#3a8fff"
                strokeWidth="1.5"
                opacity={arcOpacity + 0.1}
              />
              {/* Bright core arc */}
              <path
                d={pathD}
                fill="none"
                stroke="#aad4ff"
                strokeWidth="0.5"
                opacity={arcOpacity * 0.6}
              />
              {/* Traveling particle glow */}
              <circle
                cx={particleX}
                cy={particleY}
                r={14}
                fill="#1a6fff"
                opacity={particleOpacity * 0.35}
                filter="url(#blur1)"
              />
              {/* Traveling particle */}
              <circle
                cx={particleX}
                cy={particleY}
                r={4}
                fill="#80c0ff"
                opacity={particleOpacity * 0.9}
              />
              {/* Particle bright core */}
              <circle
                cx={particleX}
                cy={particleY}
                r={2}
                fill="#ffffff"
                opacity={particleOpacity}
              />
            </g>
          );
        })}

        {/* City nodes */}
        {CITIES.map((city, idx) => {
          const cx = city.x * width;
          const cy = city.y * height;
          const pulsePhase = (frame * 0.04 + idx * 0.8) % (Math.PI * 2);
          const pulseScale = 1 + 0.4 * Math.sin(pulsePhase);
          const pulseOpacity = 0.3 + 0.3 * Math.sin(pulsePhase);
          const isAmerica = city.region === 'america';
          const primaryColor = isAmerica ? '#00aaff' : '#4488ff';
          const glowColor = isAmerica ? '#0066cc' : '#2255cc';

          return (
            <g key={`city${idx}`}>
              {/* Outer pulse ring */}
              <circle cx={cx} cy={cy} r={18 * pulseScale} fill="none"
                stroke={primaryColor} strokeWidth="1.5" opacity={pulseOpacity * 0.5} />
              {/* Middle ring */}
              <circle cx={cx} cy={cy} r={12} fill="none"
                stroke={primaryColor} strokeWidth="1" opacity={0.6} />
              {/* Glow */}
              <circle cx={cx} cy={cy} r={10} fill={glowColor} opacity={0.3} filter="url(#blur3)" />
              {/* Core dot */}
              <circle cx={cx} cy={cy} r={4} fill={primaryColor} opacity={0.95} />
              {/* Bright center */}
              <circle cx={cx} cy={cy} r={1.5} fill="#ffffff" opacity={0.9} />
            </g>
          );
        })}

        {/* Floating ambient particles */}
        {PARTICLES.map((p, i) => {
          const floatY = p.y + Math.sin(frame * 0.015 + i * 0.3) * 20;
          const floatOpacity = (p.opacity / 100) * (0.5 + 0.5 * Math.sin(frame * 0.02 + i * 0.5));
          return (
            <circle
              key={`par${i}`}
              cx={p.x}
              cy={floatY}
              r={p.size * 0.6}
              fill="#2060aa"
              opacity={floatOpacity}
            />
          );
        })}

        {/* Large background glow arcs for depth */}
        {[0, 1, 2].map((i) => {
          const phase = (frame * 0.005 + i * 2.1) % (Math.PI * 2);
          const op = 0.04 + 0.03 * Math.sin(phase);
          const yOff = i * 80 - 80;
          return (
            <path
              key={`bgArc${i}`}
              d={`M ${width * 0.18} ${height * 0.38 + yOff} Q ${width * 0.35} ${height * 0.15 + yOff} ${width * 0.52} ${height * 0.3 + yOff}`}
              fill="none"
              stroke="#1a5fff"
              strokeWidth="80"
              opacity={op}
              filter="url(#blur2)"
            />
          );
        })}

        {/* Longitude lines for globe feel */}
        {[0.27, 0.31, 0.35, 0.39, 0.43].map((xFrac, i) => {
          const x = xFrac * width;
          const phase = (frame * 0.008 + i * 0.6) % (Math.PI * 2);
          const op = 0.04 + 0.03 * Math.sin(phase);
          return (
            <line key={`lon${i}`} x1={x} y1={height * 0.1} x2={x} y2={height * 0.7}
              stroke="#1a4fff" strokeWidth="1" opacity={op} />
          );
        })}
        {/* Latitude arcs */}
        {[0.25, 0.32, 0.38, 0.44, 0.5].map((yFrac, i) => {
          const y = yFrac * height;
          const phase = (frame * 0.008 + i * 0.6) % (Math.PI * 2);
          const op = 0.04 + 0.03 * Math.sin(phase);
          return (
            <line key={`lat${i}`} x1={width * 0.15} y1={y} x2={width * 0.56} y2={y}
              stroke="#1a4fff" strokeWidth="1" opacity={op} />
          );
        })}

        {/* Corner decorative elements */}
        {[
          { x: 80, y: 80 },
          { x: width - 80, y: 80 },
          { x: 80, y: height - 80 },
          { x: width - 80, y: height - 80 },
        ].map((corner, i) => {
          const phase = (frame * 0.03 + i * 1.5) % (Math.PI * 2);
          const r = 30 + 5 * Math.sin(phase);
          return (
            <g key={`corner${i}`}>
              <circle cx={corner.x} cy={corner.y} r={r} fill="none" stroke="#0a4fff" strokeWidth="1" opacity="0.3" />
              <circle cx={corner.x} cy={corner.y} r={r * 0.6} fill="none" stroke="#0a4fff" strokeWidth="1" opacity="0.2" />
              <circle cx={corner.x} cy={corner.y} r={4} fill="#0a6fff" opacity="0.7" />
            </g>
          );
        })}

        {/* Data flow rings emanating from Atlantic center */}
        {[0, 1, 2, 3].map((i) => {
          const ringProgress = ((frame * 0.4 + i * (arcCycleDuration / 4)) % arcCycleDuration) / arcCycleDuration;
          const ringR = ringProgress * width * 0.25;
          const ringOpacity = interpolate(ringProgress, [0, 0.3, 1], [0.5, 0.3, 0]);
          return (
            <ellipse
              key={`ring${i}`}
              cx={width * 0.355}
              cy={height * 0.37}
              rx={ringR}
              ry={ringR * 0.55}
              fill="none"
              stroke="#1a5fff"
              strokeWidth="2"
              opacity={ringOpacity}
            />
          );
        })}
      </svg>

      {/* Vignette overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 90% 90% at 35% 40%, transparent 40%, rgba(1,4,10,0.7) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Edge darkening */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(2,8,16,0.4) 0%, transparent 15%, transparent 85%, rgba(2,8,16,0.4) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};