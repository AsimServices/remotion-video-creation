import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NUM_RINGS = 6;
const NUM_PARTICLES = 40;
const NUM_GRID_LINES_H = 20;
const NUM_GRID_LINES_V = 36;
const NUM_STARS = 120;

const PARTICLES = Array.from({ length: NUM_PARTICLES }, (_, i) => ({
  angle: (i * 360) / NUM_PARTICLES,
  speed: 1.5 + ((i * 137) % 100) / 100,
  size: 3 + ((i * 73) % 8),
  opacity: 0.4 + ((i * 53) % 60) / 100,
  delay: (i * 11) % 30,
}));

const STARS = Array.from({ length: NUM_STARS }, (_, i) => ({
  x: (i * 1731) % 3840,
  y: (i * 1337) % 2160,
  size: 1 + ((i * 47) % 3),
  opacity: 0.2 + ((i * 83) % 60) / 100,
}));

const ORBIT_DOTS = Array.from({ length: 12 }, (_, i) => ({
  orbitRadius: 200 + i * 50,
  speed: 0.4 + (i % 4) * 0.15,
  startAngle: (i * 137) % 360,
  size: 4 + (i % 5),
}));

export const NewMarketEntry: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2;

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const masterOpacity = Math.min(fadeIn, fadeOut);

  // Marker appearance
  const markerReveal = interpolate(frame, [30, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const markerPulse = Math.sin(frame * 0.08) * 0.15 + 1;
  const markerGlowSize = interpolate(markerReveal, [0, 1], [0, 80]) * markerPulse;
  const markerSize = interpolate(markerReveal, [0, 1], [0, 32]);

  // Grid
  const gridOpacity = interpolate(frame, [20, 80], [0, 0.18], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Rings
  const rings = Array.from({ length: NUM_RINGS }, (_, i) => {
    const delay = 60 + i * 30;
    const duration = 120;
    const progress = interpolate(frame, [delay, delay + duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const radius = interpolate(progress, [0, 1], [0, 500 + i * 200]);
    const opacity = interpolate(progress, [0, 0.1, 0.7, 1], [0, 0.6 - i * 0.05, 0.3 - i * 0.03, 0]);
    return { radius, opacity, progress };
  });

  // Particles
  const particleProgress = interpolate(frame, [80, 160], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Pulsing outer halo
  const haloScale = 1 + Math.sin(frame * 0.05) * 0.08;
  const haloOpacity = interpolate(frame, [60, 120], [0, 0.25], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * (0.8 + Math.sin(frame * 0.06) * 0.2);

  // Pin marker geometry
  const pinReveal = interpolate(frame, [30, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pinY = interpolate(pinReveal, [0, 1], [-120, 0]);
  const pinOpacity = interpolate(pinReveal, [0, 0.3, 1], [0, 1, 1]);

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at center, #050d1a 0%, #020508 60%, #000000 100%)',
        overflow: 'hidden',
        opacity: masterOpacity,
        position: 'relative',
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Stars */}
        {STARS.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="white"
            opacity={star.opacity * masterOpacity}
          />
        ))}

        {/* Grid lines horizontal */}
        {Array.from({ length: NUM_GRID_LINES_H }, (_, i) => {
          const y = (i / NUM_GRID_LINES_H) * height;
          const dist = Math.abs(y - cy);
          const distOpacity = interpolate(dist, [0, height / 2], [0.5, 0.05]);
          return (
            <line
              key={`gh-${i}`}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke="#1a4a8a"
              strokeWidth={1}
              opacity={gridOpacity * distOpacity}
            />
          );
        })}

        {/* Grid lines vertical */}
        {Array.from({ length: NUM_GRID_LINES_V }, (_, i) => {
          const x = (i / NUM_GRID_LINES_V) * width;
          const dist = Math.abs(x - cx);
          const distOpacity = interpolate(dist, [0, width / 2], [0.5, 0.05]);
          return (
            <line
              key={`gv-${i}`}
              x1={x}
              y1={0}
              x2={x}
              y2={height}
              stroke="#1a4a8a"
              strokeWidth={1}
              opacity={gridOpacity * distOpacity}
            />
          );
        })}

        {/* Expanding rings */}
        {rings.map((ring, i) => (
          <circle
            key={`ring-${i}`}
            cx={cx}
            cy={cy}
            r={ring.radius}
            fill="none"
            stroke={i % 2 === 0 ? '#00c8ff' : '#0066ff'}
            strokeWidth={2 - i * 0.2}
            opacity={ring.opacity}
          />
        ))}

        {/* Pulsing halo */}
        <circle
          cx={cx}
          cy={cy}
          r={180 * haloScale}
          fill="none"
          stroke="#00c8ff"
          strokeWidth={60}
          opacity={haloOpacity * 0.3}
        />
        <circle
          cx={cx}
          cy={cy}
          r={100 * haloScale}
          fill="rgba(0, 100, 255, 0.05)"
          stroke="#0088ff"
          strokeWidth={2}
          opacity={haloOpacity}
        />

        {/* Defs for glow filter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="20" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="30" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="markerGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor="#00c8ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0044ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#0055ff" />
          </radialGradient>
        </defs>

        {/* Glow corona */}
        <circle
          cx={cx}
          cy={cy}
          r={markerGlowSize * 2}
          fill="url(#markerGrad)"
          opacity={markerReveal * 0.4}
          filter="url(#softGlow)"
        />

        {/* Orbit dots */}
        {ORBIT_DOTS.map((dot, i) => {
          const angle = ((dot.startAngle + frame * dot.speed) % 360) * (Math.PI / 180);
          const ox = cx + Math.cos(angle) * dot.orbitRadius;
          const oy = cy + Math.sin(angle) * dot.orbitRadius;
          const dotReveal = interpolate(frame, [80 + i * 10, 120 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <circle
              key={`orbit-${i}`}
              cx={ox}
              cy={oy}
              r={dot.size}
              fill="#00aaff"
              opacity={dotReveal * 0.7}
              filter="url(#glow)"
            />
          );
        })}

        {/* Particles emanating outward */}
        {PARTICLES.map((p, i) => {
          const delayedProgress = interpolate(
            frame,
            [80 + p.delay, 80 + p.delay + 80],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const angle = p.angle * (Math.PI / 180);
          const dist = delayedProgress * 600 * p.speed;
          const px = cx + Math.cos(angle) * dist;
          const py = cy + Math.sin(angle) * dist;
          const pOpacity = interpolate(delayedProgress, [0, 0.1, 0.8, 1], [0, p.opacity, p.opacity * 0.5, 0]);
          return (
            <circle
              key={`particle-${i}`}
              cx={px}
              cy={py}
              r={p.size}
              fill={i % 3 === 0 ? '#00c8ff' : i % 3 === 1 ? '#0066ff' : '#ffffff'}
              opacity={pOpacity}
              filter="url(#glow)"
            />
          );
        })}

        {/* Pin marker */}
        <g transform={`translate(${cx}, ${cy + pinY})`} opacity={pinOpacity} filter="url(#strongGlow)">
          {/* Pin body */}
          <ellipse cx={0} cy={20} rx={6} ry={3} fill="rgba(0, 200, 255, 0.3)" />
          <path
            d={`M 0 -60 C -28 -60 -28 -20 -28 -20 C -28 0 0 20 0 20 C 0 20 28 0 28 -20 C 28 -20 28 -60 0 -60 Z`}
            fill="none"
            stroke="#00c8ff"
            strokeWidth={3}
            opacity={0.9}
          />
          <path
            d={`M 0 -60 C -28 -60 -28 -20 -28 -20 C -28 0 0 20 0 20 C 0 20 28 0 28 -20 C 28 -20 28 -60 0 -60 Z`}
            fill="rgba(0, 100, 200, 0.25)"
          />
          {/* Pin inner circle */}
          <circle cx={0} cy={-30} r={14} fill="url(#coreGrad)" opacity={0.95} />
          <circle cx={0} cy={-30} r={8} fill="white" opacity={0.9} />
          <circle cx={0} cy={-30} r={18} fill="none" stroke="#00c8ff" strokeWidth={2} opacity={0.6} />
        </g>

        {/* Core glowing dot at center */}
        <circle
          cx={cx}
          cy={cy}
          r={markerSize}
          fill="url(#coreGrad)"
          opacity={markerReveal}
          filter="url(#strongGlow)"
        />
        <circle
          cx={cx}
          cy={cy}
          r={markerSize * 0.4}
          fill="white"
          opacity={markerReveal * 0.95}
        />

        {/* Crosshair lines */}
        {[0, 90, 180, 270].map((angle, i) => {
          const rad = angle * (Math.PI / 180);
          const lineReveal = interpolate(frame, [70 + i * 10, 130 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const len = 300 * lineReveal;
          const x2 = cx + Math.cos(rad) * len;
          const y2 = cy + Math.sin(rad) * len;
          return (
            <line
              key={`cross-${i}`}
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              stroke="#00c8ff"
              strokeWidth={1.5}
              opacity={lineReveal * 0.4}
              strokeDasharray="8 6"
            />
          );
        })}
      </svg>
    </div>
  );
};