import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface Particle {
  id: number;
  x: number;
  baseY: number;
  size: number;
  speed: number;
  drift: number;
  driftSpeed: number;
  driftPhase: number;
  opacity: number;
  color: string;
  glowSize: number;
  birthFrame: number;
  lifespan: number;
}

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
};

const generateParticles = (count: number, width: number, height: number): Particle[] => {
  const colors = [
    '#FF6B00', '#FF8C00', '#FFA500', '#FFB833',
    '#FF4500', '#FF7700', '#FFCC44', '#FF5500',
    '#FFD700', '#FF3300',
  ];

  return Array.from({ length: count }, (_, i) => {
    const r = (seed: number) => seededRandom(i * 137.5 + seed);
    return {
      id: i,
      x: r(1) * width,
      baseY: height + r(2) * height * 0.5,
      size: 1.5 + r(3) * 5,
      speed: 0.4 + r(4) * 1.2,
      drift: 30 + r(5) * 80,
      driftSpeed: 0.3 + r(6) * 0.8,
      driftPhase: r(7) * Math.PI * 2,
      opacity: 0.4 + r(8) * 0.6,
      color: colors[Math.floor(r(9) * colors.length)],
      glowSize: 4 + r(10) * 12,
      birthFrame: Math.floor(r(11) * 180),
      lifespan: 200 + Math.floor(r(12) * 300),
    };
  });
};

export const EmberParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const particles = React.useMemo(() => generateParticles(120, width, height), [width, height]);

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const renderParticle = (p: Particle) => {
    const localFrame = (frame - p.birthFrame + p.lifespan * 10) % p.lifespan;
    const progress = localFrame / p.lifespan;

    const y = p.baseY - localFrame * p.speed * 3;
    const x = p.x + Math.sin(localFrame * p.driftSpeed * 0.05 + p.driftPhase) * p.drift;

    const fadeIn = interpolate(progress, [0, 0.1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const fadeOut = interpolate(progress, [0.7, 1.0], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const particleOpacity = p.opacity * fadeIn * fadeOut;

    const sizeFactor = interpolate(progress, [0, 0.3, 1.0], [0.3, 1, 0.1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const currentSize = p.size * sizeFactor;

    if (y < -50 || y > height + 50) return null;

    return (
      <g key={p.id} opacity={particleOpacity}>
        <circle
          cx={x}
          cy={y}
          r={currentSize * 3.5}
          fill={p.color}
          opacity={0.08}
          filter={`blur(${p.glowSize * 1.5}px)`}
        />
        <circle
          cx={x}
          cy={y}
          r={currentSize * 2}
          fill={p.color}
          opacity={0.2}
        />
        <circle
          cx={x}
          cy={y}
          r={currentSize}
          fill={p.color}
        />
        <circle
          cx={x}
          cy={y}
          r={currentSize * 0.4}
          fill="#FFFFFF"
          opacity={0.7}
        />
      </g>
    );
  };

  const bgGlow1 = interpolate(frame, [0, 150, 300, 450, 600], [0.3, 0.6, 0.4, 0.7, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bgGlow2 = interpolate(frame, [0, 200, 400, 600], [0.2, 0.5, 0.3, 0.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ width, height, background: '#0A0500', overflow: 'hidden', position: 'relative' }}>
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, opacity: globalOpacity }}
      >
        <defs>
          <radialGradient id="bgGlow1" cx="40%" cy="100%" r="60%">
            <stop offset="0%" stopColor="#FF4500" stopOpacity={bgGlow1 * 0.3} />
            <stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bgGlow2" cx="70%" cy="90%" r="50%">
            <stop offset="0%" stopColor="#FF8C00" stopOpacity={bgGlow2 * 0.25} />
            <stop offset="100%" stopColor="#FF8C00" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="groundGlow" cx="50%" cy="100%" r="50%">
            <stop offset="0%" stopColor="#FF6600" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#FF3300" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FF3300" stopOpacity="0" />
          </radialGradient>
          <filter id="blur-soft">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Background ambient glow */}
        <rect x={0} y={0} width={width} height={height} fill="url(#bgGlow1)" />
        <rect x={0} y={0} width={width} height={height} fill="url(#bgGlow2)" />
        <rect x={0} y={height * 0.6} width={width} height={height * 0.4} fill="url(#groundGlow)" />

        {/* Heat shimmer layers */}
        {[0, 1, 2].map((i) => {
          const shimmerX = interpolate(
            frame,
            [0, durationInFrames],
            [0, width * 0.1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const shimmerOpacity = 0.03 + i * 0.02;
          return (
            <ellipse
              key={`shimmer-${i}`}
              cx={width * (0.3 + i * 0.2) + Math.sin(frame * 0.02 + i) * 40}
              cy={height * 0.7}
              rx={120 + i * 60}
              ry={300 + i * 80}
              fill={`rgba(255, ${100 + i * 30}, 0, ${shimmerOpacity})`}
              style={{ filter: 'blur(20px)' }}
            />
          );
        })}

        {/* Ember particles */}
        <g>{particles.map(renderParticle)}</g>

        {/* Ground ember glow base */}
        <ellipse
          cx={width * 0.5}
          cy={height}
          rx={width * 0.4}
          ry={80}
          fill="rgba(255, 80, 0, 0.15)"
          style={{ filter: 'blur(30px)' }}
        />
      </svg>
    </div>
  );
};