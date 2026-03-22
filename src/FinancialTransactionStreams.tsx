import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { name: 'New York', x: 0.22, y: 0.38 },
  { name: 'London', x: 0.47, y: 0.28 },
  { name: 'Tokyo', x: 0.82, y: 0.32 },
  { name: 'Singapore', x: 0.76, y: 0.52 },
  { name: 'Hong Kong', x: 0.79, y: 0.40 },
  { name: 'Frankfurt', x: 0.50, y: 0.26 },
  { name: 'Zurich', x: 0.49, y: 0.27 },
  { name: 'Dubai', x: 0.60, y: 0.42 },
  { name: 'Sydney', x: 0.85, y: 0.72 },
  { name: 'Toronto', x: 0.20, y: 0.32 },
  { name: 'Paris', x: 0.48, y: 0.27 },
  { name: 'Shanghai', x: 0.80, y: 0.36 },
  { name: 'Mumbai', x: 0.65, y: 0.44 },
  { name: 'São Paulo', x: 0.28, y: 0.65 },
  { name: 'Chicago', x: 0.21, y: 0.35 },
  { name: 'Seoul', x: 0.81, y: 0.33 },
];

const CONNECTIONS = [
  { from: 0, to: 1, color: '#00ffcc', speed: 1.0, thickness: 3 },
  { from: 1, to: 2, color: '#ff00aa', speed: 0.8, thickness: 2.5 },
  { from: 0, to: 6, color: '#00aaff', speed: 1.2, thickness: 2 },
  { from: 2, to: 3, color: '#ffaa00', speed: 0.9, thickness: 2 },
  { from: 1, to: 7, color: '#aa00ff', speed: 1.1, thickness: 2.5 },
  { from: 3, to: 8, color: '#00ffcc', speed: 0.7, thickness: 2 },
  { from: 0, to: 13, color: '#ff4488', speed: 1.3, thickness: 2 },
  { from: 4, to: 11, color: '#44ffaa', speed: 0.85, thickness: 2 },
  { from: 1, to: 10, color: '#ffcc00', speed: 1.0, thickness: 1.5 },
  { from: 5, to: 7, color: '#00ccff', speed: 0.95, thickness: 2 },
  { from: 7, to: 12, color: '#ff6600', speed: 1.15, thickness: 2 },
  { from: 2, to: 15, color: '#cc00ff', speed: 0.75, thickness: 2.5 },
  { from: 9, to: 14, color: '#00ff88', speed: 1.05, thickness: 1.5 },
  { from: 11, to: 2, color: '#ff0066', speed: 0.9, thickness: 2 },
  { from: 12, to: 3, color: '#00ffff', speed: 1.2, thickness: 2 },
  { from: 13, to: 1, color: '#ff8800', speed: 0.8, thickness: 2 },
  { from: 14, to: 0, color: '#8800ff', speed: 1.1, thickness: 1.5 },
  { from: 6, to: 1, color: '#00ff44', speed: 0.85, thickness: 2 },
  { from: 10, to: 5, color: '#ff2244', speed: 1.0, thickness: 1.5 },
  { from: 15, to: 4, color: '#44aaff', speed: 0.95, thickness: 2 },
  { from: 8, to: 2, color: '#ffff00', speed: 1.3, thickness: 1.5 },
  { from: 3, to: 7, color: '#00ffcc', speed: 0.7, thickness: 2.5 },
  { from: 0, to: 4, color: '#ff00cc', speed: 1.0, thickness: 2 },
  { from: 1, to: 3, color: '#00aaff', speed: 0.9, thickness: 2 },
];

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  connectionIndex: i % CONNECTIONS.length,
  offset: (i * 0.137) % 1,
  size: 4 + (i % 6),
  delay: (i * 23) % 120,
}));

const GRID_LINES_H = Array.from({ length: 20 }, (_, i) => i);
const GRID_LINES_V = Array.from({ length: 36 }, (_, i) => i);

const PULSE_RINGS = Array.from({ length: 16 }, (_, i) => ({
  cityIndex: i % CITIES.length,
  delay: (i * 37) % 90,
  duration: 60 + (i % 40),
}));

const BACKGROUND_STARS = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 1337 + 300) % 2160,
  size: 1 + (i % 3),
  brightness: 0.2 + (i % 5) * 0.08,
}));

export const FinancialTransactionStreams: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const masterOpacity = Math.min(fadeIn, fadeOut);

  const getCityPos = (city: typeof CITIES[0]) => ({
    x: city.x * width,
    y: city.y * height,
  });

  const getParticlePos = (conn: typeof CONNECTIONS[0], progress: number) => {
    const fromCity = CITIES[conn.from];
    const toCity = CITIES[conn.to];
    const fx = fromCity.x * width;
    const fy = fromCity.y * height;
    const tx = toCity.x * width;
    const ty = toCity.y * height;
    const cx = (fx + tx) / 2 + (ty - fy) * 0.2;
    const cy = (fy + ty) / 2 - (tx - fx) * 0.2;
    const t = progress;
    const x = (1 - t) * (1 - t) * fx + 2 * (1 - t) * t * cx + t * t * tx;
    const y = (1 - t) * (1 - t) * fy + 2 * (1 - t) * t * cy + t * t * ty;
    return { x, y };
  };

  const getBezierPath = (conn: typeof CONNECTIONS[0]) => {
    const fromCity = CITIES[conn.from];
    const toCity = CITIES[conn.to];
    const fx = fromCity.x * width;
    const fy = fromCity.y * height;
    const tx = toCity.x * width;
    const ty = toCity.y * height;
    const cx = (fx + tx) / 2 + (ty - fy) * 0.2;
    const cy = (fy + ty) / 2 - (tx - fx) * 0.2;
    return `M ${fx} ${fy} Q ${cx} ${cy} ${tx} ${ty}`;
  };

  const gridOpacity = 0.06;

  return (
    <div style={{ width, height, background: '#020408', position: 'relative', overflow: 'hidden', opacity: masterOpacity }}>
      {/* Background stars */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {BACKGROUND_STARS.map((star, i) => (
          <circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="white"
            opacity={star.brightness}
          />
        ))}
      </svg>

      {/* Grid overlay */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {GRID_LINES_H.map((_, i) => {
          const y = (i / (GRID_LINES_H.length - 1)) * height;
          return (
            <line
              key={`h${i}`}
              x1={0} y1={y} x2={width} y2={y}
              stroke="#00aaff"
              strokeWidth={0.5}
              opacity={gridOpacity}
            />
          );
        })}
        {GRID_LINES_V.map((_, i) => {
          const x = (i / (GRID_LINES_V.length - 1)) * width;
          return (
            <line
              key={`v${i}`}
              x1={x} y1={0} x2={x} y2={height}
              stroke="#00aaff"
              strokeWidth={0.5}
              opacity={gridOpacity}
            />
          );
        })}
      </svg>

      {/* World map silhouette approximation using continental blobs */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#001a2e" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#020408" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={width} height={height} fill="url(#mapGlow)" />
        {/* North America */}
        <ellipse cx={width * 0.20} cy={height * 0.38} rx={width * 0.12} ry={height * 0.18} fill="#0a1a28" opacity={0.6} />
        {/* South America */}
        <ellipse cx={width * 0.27} cy={height * 0.65} rx={width * 0.07} ry={height * 0.16} fill="#0a1a28" opacity={0.6} />
        {/* Europe */}
        <ellipse cx={width * 0.49} cy={height * 0.28} rx={width * 0.06} ry={height * 0.10} fill="#0a1a28" opacity={0.6} />
        {/* Africa */}
        <ellipse cx={width * 0.50} cy={height * 0.55} rx={width * 0.07} ry={height * 0.18} fill="#0a1a28" opacity={0.6} />
        {/* Asia */}
        <ellipse cx={width * 0.72} cy={height * 0.36} rx={width * 0.16} ry={height * 0.18} fill="#0a1a28" opacity={0.6} />
        {/* Australia */}
        <ellipse cx={width * 0.84} cy={height * 0.70} rx={width * 0.07} ry={height * 0.08} fill="#0a1a28" opacity={0.6} />
        {/* Middle East */}
        <ellipse cx={width * 0.60} cy={height * 0.42} rx={width * 0.05} ry={height * 0.07} fill="#0a1a28" opacity={0.5} />
      </svg>

      {/* Connection lines */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {CONNECTIONS.map((conn, i) => (
            <filter key={`glow${i}`} id={`glow${i}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <filter id="cityGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {CONNECTIONS.map((conn, i) => {
          const pathOpacity = interpolate(
            (frame * conn.speed + i * 30) % 180,
            [0, 40, 140, 180],
            [0.1, 0.5, 0.5, 0.1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          return (
            <path
              key={i}
              d={getBezierPath(conn)}
              stroke={conn.color}
              strokeWidth={conn.thickness}
              fill="none"
              opacity={pathOpacity}
              filter={`url(#glow${i})`}
            />
          );
        })}
      </svg>

      {/* Particles along connections */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="particleGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {PARTICLES.map((p, i) => {
          const conn = CONNECTIONS[p.connectionIndex];
          const speed = conn.speed * 0.006;
          const rawProgress = ((frame * speed + p.offset) % 1 + 1) % 1;
          const pos = getParticlePos(conn, rawProgress);
          const trailOpacity = interpolate(rawProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
          return (
            <g key={i}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={p.size}
                fill={conn.color}
                opacity={trailOpacity * 0.9}
                filter="url(#particleGlow)"
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={p.size * 0.4}
                fill="white"
                opacity={trailOpacity}
              />
            </g>
          );
        })}
      </svg>

      {/* Pulse rings around cities */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {PULSE_RINGS.map((ring, i) => {
          const city = CITIES[ring.cityIndex];
          const pos = getCityPos(city);
          const cycleFrame = (frame + ring.delay * 3) % (ring.duration * 2);
          const progress = cycleFrame / (ring.duration * 2);
          const radius = interpolate(progress, [0, 1], [10, 120]);
          const opacity = interpolate(progress, [0, 0.3, 1], [0.8, 0.4, 0]);
          const colors = ['#00ffcc', '#ff00aa', '#00aaff', '#ffaa00', '#aa00ff'];
          const color = colors[i % colors.length];
          return (
            <circle
              key={i}
              cx={pos.x}
              cy={pos.y}
              r={radius}
              stroke={color}
              strokeWidth={2}
              fill="none"
              opacity={opacity}
            />
          );
        })}
      </svg>

      {/* City nodes */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="cityNodeGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {CITIES.map((city, i) => {
          const pos = getCityPos(city);
          const pulse = interpolate(
            Math.sin((frame * 0.05 + i * 0.8) % (2 * Math.PI)),
            [-1, 1],
            [0.7, 1.0]
          );
          const cityColors = ['#00ffcc', '#ff00aa', '#00aaff', '#ffaa00', '#aa00ff', '#ff4488'];
          const color = cityColors[i % cityColors.length];
          return (
            <g key={i}>
              <circle cx={pos.x} cy={pos.y} r={30 * pulse} fill={color} opacity={0.08} filter="url(#cityNodeGlow)" />
              <circle cx={pos.x} cy={pos.y} r={14} fill={color} opacity={0.3} />
              <circle cx={pos.x} cy={pos.y} r={8} fill={color} opacity={0.7} />
              <circle cx={pos.x} cy={pos.y} r={4} fill="white" opacity={0.9} />
              <circle cx={pos.x} cy={pos.y} r={22} stroke={color} strokeWidth={1.5} fill="none" opacity={0.4 * pulse} />
            </g>
          );
        })}
      </svg>

      {/* Scanline effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px)',
        pointerEvents: 'none',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Moving scan line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0.15,
      }}>
        <div style={{
          position: 'absolute',
          left: 0,
          width,
          height: 4,
          background: 'linear-gradient(90deg, transparent, #00ffcc, transparent)',
          top: ((frame * 4) % (height + 100)) - 50,
        }} />
      </div>

      {/* Data flow overlay */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, opacity: 0.3 }}>
        {Array.from({ length: 12 }, (_, i) => {
          const x = width * 0.05 + (i % 4) * width * 0.3;
          const y = height * 0.05 + Math.floor(i / 4) * height * 0.4;
          const val = (frame * 0.7 + i * 137) % 999;
          return null;
        })}
      </svg>

      {/* Corner decorations */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {[
          { x: 60, y: 60, rot: 0 },
          { x: width - 60, y: 60, rot: 90 },
          { x: width - 60, y: height - 60, rot: 180 },
          { x: 60, y: height - 60, rot: 270 },
        ].map((corner, i) => (
          <g key={i} transform={`translate(${corner.x}, ${corner.y}) rotate(${corner.rot})`}>
            <line x1={0} y1={0} x2={80} y2={0} stroke="#00ffcc" strokeWidth={3} opacity={0.6} />
            <line x1={0} y1={0} x2={0} y2={80} stroke="#00ffcc" strokeWidth={3} opacity={0.6} />
            <circle cx={0} cy={0} r={8} fill="none" stroke="#00ffcc" strokeWidth={2} opacity={0.5} />
          </g>
        ))}
      </svg>

      {/* Ambient glow overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        background: `radial-gradient(ellipse at ${50 + 10 * Math.sin(frame * 0.02)}% ${40 + 5 * Math.cos(frame * 0.015)}%, rgba(0,255,204,0.04) 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />
    </div>
  );
};