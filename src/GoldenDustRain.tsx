import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface Particle {
  id: number;
  x: number;
  startY: number;
  size: number;
  speed: number;
  opacity: number;
  blur: number;
  delay: number;
  sway: number;
  swaySpeed: number;
  isBokeh: boolean;
}

const generateParticles = (count: number, seed: number): Particle[] => {
  const particles: Particle[] = [];
  let s = seed;
  const rand = () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };

  for (let i = 0; i < count; i++) {
    const isBokeh = rand() < 0.18;
    particles.push({
      id: i,
      x: rand() * 1920,
      startY: -rand() * 1080,
      size: isBokeh ? rand() * 60 + 30 : rand() * 3 + 1,
      speed: isBokeh ? rand() * 0.3 + 0.1 : rand() * 1.2 + 0.4,
      opacity: isBokeh ? rand() * 0.12 + 0.04 : rand() * 0.7 + 0.3,
      blur: isBokeh ? rand() * 12 + 8 : rand() * 1.5,
      delay: rand() * 400,
      sway: rand() * 60 - 30,
      swaySpeed: rand() * 0.02 + 0.005,
      isBokeh,
    });
  }
  return particles;
};

const PARTICLES = generateParticles(280, 42);

export const GoldenDustRain: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 50% 30%, #1a1200 0%, #0a0800 50%, #000000 100%)',
        overflow: 'hidden',
        position: 'relative',
        opacity: globalOpacity,
      }}
    >
      {/* Subtle ambient glow layers */}
      <div
        style={{
          position: 'absolute',
          width: '60%',
          height: '40%',
          left: '20%',
          top: '5%',
          background: 'radial-gradient(ellipse, rgba(255,200,50,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '40%',
          height: '30%',
          left: '30%',
          top: '50%',
          background: 'radial-gradient(ellipse, rgba(255,160,20,0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          {PARTICLES.map((p) => (
            <radialGradient key={`grad-${p.id}`} id={`grad-${p.id}`} cx="50%" cy="50%" r="50%">
              {p.isBokeh ? (
                <>
                  <stop offset="0%" stopColor="#ffe066" stopOpacity="0" />
                  <stop offset="40%" stopColor="#ffd700" stopOpacity="0.6" />
                  <stop offset="70%" stopColor="#ffb800" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ff8c00" stopOpacity="0" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#fff5cc" stopOpacity="1" />
                  <stop offset="50%" stopColor="#ffd700" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ffb800" stopOpacity="0" />
                </>
              )}
            </radialGradient>
          ))}
        </defs>

        {PARTICLES.map((p) => {
          const elapsed = frame - p.delay;
          if (elapsed < 0) return null;

          const totalTravel = height + Math.abs(p.startY) + 100;
          const rawY = p.startY + elapsed * p.speed;
          const loopedY = ((rawY % totalTravel) + totalTravel) % totalTravel - Math.abs(p.startY);

          const swayX = Math.sin(elapsed * p.swaySpeed + p.id) * p.sway;
          const cx = p.x + swayX;
          const cy = loopedY;

          const fadeProgress = interpolate(elapsed, [0, 30], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const particleOpacity = p.opacity * fadeProgress;

          return (
            <g key={p.id} style={{ filter: p.blur > 0 ? `blur(${p.blur}px)` : undefined }}>
              <circle
                cx={cx}
                cy={cy}
                r={p.size}
                fill={`url(#grad-${p.id})`}
                opacity={particleOpacity}
              />
              {!p.isBokeh && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={p.size * 0.4}
                  fill="#fffbe0"
                  opacity={particleOpacity * 0.9}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Bottom fade */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '20%',
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};