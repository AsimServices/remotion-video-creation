import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star'] as const;
type Shape = typeof SHAPES[number];

const COLORS = [
  '#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
  '#85C1E9', '#82E0AA', '#F1948A', '#FAD7A0', '#A9CCE3',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#01CBC6', '#FF9F43',
];

interface Particle {
  id: number;
  shape: Shape;
  color: string;
  angle: number;
  speed: number;
  rotationSpeed: number;
  initialRotation: number;
  size: number;
  delay: number;
  wobble: number;
  wobbleSpeed: number;
}

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 137.508;
    particles.push({
      id: i,
      shape: SHAPES[i % SHAPES.length],
      color: COLORS[i % COLORS.length],
      angle: (i / count) * Math.PI * 2 + (Math.sin(seed) * 0.3),
      speed: 4 + (Math.abs(Math.sin(seed * 0.7)) * 6),
      rotationSpeed: (Math.sin(seed * 1.3) * 8),
      initialRotation: Math.sin(seed * 2.1) * 360,
      size: 12 + Math.abs(Math.sin(seed * 0.5)) * 22,
      delay: Math.floor(Math.abs(Math.sin(seed * 3.7)) * 15),
      wobble: Math.sin(seed * 0.9) * 30,
      wobbleSpeed: 2 + Math.abs(Math.sin(seed * 1.7)) * 3,
    });
  }
  return particles;
}

const PARTICLES = generateParticles(120);

function renderShape(shape: Shape, size: number, color: string): React.ReactNode {
  switch (shape) {
    case 'circle':
      return (
        <div style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 ${size * 0.5}px ${color}88`,
        }} />
      );
    case 'square':
      return (
        <div style={{
          width: size,
          height: size,
          backgroundColor: color,
          boxShadow: `0 0 ${size * 0.5}px ${color}88`,
        }} />
      );
    case 'triangle':
      return (
        <div style={{
          width: 0,
          height: 0,
          borderLeft: `${size * 0.5}px solid transparent`,
          borderRight: `${size * 0.5}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
          filter: `drop-shadow(0 0 ${size * 0.3}px ${color}88)`,
        }} />
      );
    case 'diamond':
      return (
        <div style={{
          width: size,
          height: size,
          backgroundColor: color,
          transform: 'rotate(45deg)',
          boxShadow: `0 0 ${size * 0.5}px ${color}88`,
        }} />
      );
    case 'star':
      return (
        <svg width={size * 1.2} height={size * 1.2} viewBox="0 0 24 24" style={{ overflow: 'visible' }}>
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={color}
            style={{ filter: `drop-shadow(0 0 ${size * 0.3}px ${color})` }}
          />
        </svg>
      );
  }
}

export const ConfettiExplosion: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const cx = width / 2;
  const cy = height / 2;

  const burstCount = 3;
  const burstInterval = Math.floor(durationInFrames / (burstCount + 1));

  return (
    <div style={{
      width,
      height,
      backgroundColor: '#0a0a0f',
      overflow: 'hidden',
      position: 'relative',
      opacity,
    }}>
      {/* Radial glow at center */}
      {Array.from({ length: burstCount }).map((_, burstIdx) => {
        const burstFrame = burstIdx * burstInterval;
        const localFrame = frame - burstFrame;
        if (localFrame < 0) return null;
        const glowScale = interpolate(localFrame, [0, 20, 60], [0, 1.5, 0], { extrapolateRight: 'clamp' });
        const glowOpacity = interpolate(localFrame, [0, 5, 40], [0, 0.8, 0], { extrapolateRight: 'clamp' });
        return (
          <div
            key={`glow-${burstIdx}`}
            style={{
              position: 'absolute',
              left: cx,
              top: cy,
              transform: `translate(-50%, -50%) scale(${glowScale})`,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(255,200,100,${glowOpacity}) 0%, rgba(255,100,150,${glowOpacity * 0.5}) 40%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {/* Particles per burst */}
      {Array.from({ length: burstCount }).map((_, burstIdx) => {
        const burstFrame = burstIdx * burstInterval;
        const colorOffset = burstIdx * 7;
        return PARTICLES.map((p) => {
          const localFrame = frame - burstFrame - p.delay;
          if (localFrame <= 0) return null;

          const gravity = 0.08;
          const t = localFrame;
          const distance = p.speed * t - 0.5 * gravity * t * t;
          if (distance < -200) return null;

          const px = cx + Math.cos(p.angle) * distance + Math.sin(t * p.wobbleSpeed * 0.1) * p.wobble;
          const py = cy + Math.sin(p.angle) * distance + 0.5 * gravity * t * t * Math.sign(Math.sin(p.angle));
          const rotation = p.initialRotation + p.rotationSpeed * t;

          const particleOpacity = interpolate(
            localFrame,
            [0, 10, 120, 200],
            [0, 1, 1, 0],
            { extrapolateRight: 'clamp' }
          );

          const color = COLORS[(p.id + colorOffset) % COLORS.length];

          return (
            <div
              key={`burst-${burstIdx}-particle-${p.id}`}
              style={{
                position: 'absolute',
                left: px,
                top: py,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                opacity: particleOpacity,
                pointerEvents: 'none',
              }}
            >
              {renderShape(p.shape, p.size, color)}
            </div>
          );
        });
      })}

      {/* Sparkle ring effects */}
      {Array.from({ length: burstCount }).map((_, burstIdx) => {
        const burstFrame = burstIdx * burstInterval;
        const localFrame = frame - burstFrame;
        if (localFrame < 0) return null;
        return Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          const ringRadius = interpolate(localFrame, [0, 80], [0, 500], { extrapolateRight: 'clamp' });
          const ringOpacity = interpolate(localFrame, [0, 5, 60, 90], [0, 1, 0.5, 0], { extrapolateRight: 'clamp' });
          const sx = cx + Math.cos(angle) * ringRadius;
          const sy = cy + Math.sin(angle) * ringRadius;
          const sparkSize = interpolate(localFrame, [0, 10, 80], [0, 6, 2], { extrapolateRight: 'clamp' });
          return (
            <div
              key={`ring-${burstIdx}-${i}`}
              style={{
                position: 'absolute',
                left: sx,
                top: sy,
                transform: 'translate(-50%, -50%)',
                width: sparkSize * 3,
                height: sparkSize * 3,
                borderRadius: '50%',
                backgroundColor: COLORS[(i + burstIdx * 5) % COLORS.length],
                opacity: ringOpacity,
                boxShadow: `0 0 ${sparkSize * 4}px ${COLORS[(i + burstIdx * 5) % COLORS.length]}`,
              }}
            />
          );
        });
      })}

      {/* Background shimmer particles */}
      {Array.from({ length: 40 }).map((_, i) => {
        const seed = i * 53.7;
        const shimmerPhase = (frame * 0.03 + seed) % (Math.PI * 2);
        const bx = (Math.sin(seed * 1.3) * 0.5 + 0.5) * width;
        const by = (Math.cos(seed * 0.7) * 0.5 + 0.5) * height;
        const shimmerOpacity = (Math.sin(shimmerPhase) * 0.5 + 0.5) * 0.3;
        const sz = 2 + Math.abs(Math.sin(seed)) * 3;
        return (
          <div
            key={`shimmer-${i}`}
            style={{
              position: 'absolute',
              left: bx,
              top: by,
              width: sz,
              height: sz,
              borderRadius: '50%',
              backgroundColor: COLORS[i % COLORS.length],
              opacity: shimmerOpacity,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </div>
  );
};