import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface Firefly {
  id: number;
  x: number;
  baseY: number;
  size: number;
  speed: number;
  phase: number;
  pulseSpeed: number;
  pulsePhase: number;
  wobbleAmplitude: number;
  wobbleSpeed: number;
  color: string;
  opacity: number;
  delay: number;
}

const generateFireflies = (count: number): Firefly[] => {
  const colors = [
    '#FFD700',
    '#FFEC8B',
    '#FFF8A0',
    '#FFFACD',
    '#FFE55C',
    '#FFA500',
    '#FFB347',
    '#FFDEAD',
    '#F5DEB3',
    '#E6E600',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (i * 137.508 * 3.7) % 100,
    baseY: 20 + ((i * 97.3) % 80),
    size: 2 + ((i * 53.7) % 5),
    speed: 0.02 + ((i * 31.1) % 0.06),
    phase: (i * 2.39996) % (Math.PI * 2),
    pulseSpeed: 0.04 + ((i * 17.3) % 0.08),
    pulsePhase: (i * 1.61803) % (Math.PI * 2),
    wobbleAmplitude: 1.5 + ((i * 43.1) % 4),
    wobbleSpeed: 0.015 + ((i * 29.7) % 0.04),
    color: colors[i % colors.length],
    opacity: 0.4 + ((i * 61.3) % 0.6),
    delay: (i * 23.7) % 300,
  }));
};

const FIREFLY_COUNT = 80;
const fireflies = generateFireflies(FIREFLY_COUNT);

export const FireflyAnimation: React.FC = () => {
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
        background: '#000000',
        overflow: 'hidden',
        position: 'relative',
        opacity: globalOpacity,
      }}
    >
      {/* Subtle background gradient for depth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 80%, #0a0800 0%, #000000 60%)',
        }}
      />

      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          {fireflies.map((ff) => {
            const glowId = `glow-${ff.id}`;
            return (
              <radialGradient key={glowId} id={glowId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={ff.color} stopOpacity="1" />
                <stop offset="40%" stopColor={ff.color} stopOpacity="0.6" />
                <stop offset="100%" stopColor={ff.color} stopOpacity="0" />
              </radialGradient>
            );
          })}
        </defs>

        {fireflies.map((ff) => {
          const effectiveFrame = Math.max(0, frame - ff.delay);
          if (effectiveFrame <= 0) return null;

          const totalTravel = effectiveFrame * ff.speed;
          const cycleLength = 1.0;
          const cycleProgress = (totalTravel % cycleLength) / cycleLength;

          const baseYPos = ff.baseY - cycleProgress * 100;
          const wrappedY = ((baseYPos % 110) + 110) % 110;

          const wobble =
            Math.sin(effectiveFrame * ff.wobbleSpeed + ff.phase) *
            ff.wobbleAmplitude;
          const xPos = ff.x + wobble;

          const pulse =
            0.5 +
            0.5 *
              Math.sin(effectiveFrame * ff.pulseSpeed + ff.pulsePhase);
          const currentOpacity = ff.opacity * pulse;

          const entryOpacity = interpolate(effectiveFrame, [0, 60], [0, 1], {
            extrapolateRight: 'clamp',
          });

          const fadeNearTop = interpolate(wrappedY, [0, 15], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const finalOpacity = currentOpacity * entryOpacity * fadeNearTop;

          const glowSize = ff.size * (8 + pulse * 6);
          const coreSize = ff.size * (0.8 + pulse * 0.4);

          const cx = (xPos / 100) * width;
          const cy = (wrappedY / 100) * height;

          return (
            <g key={ff.id}>
              {/* Outer glow */}
              <circle
                cx={cx}
                cy={cy}
                r={glowSize}
                fill={`url(#glow-${ff.id})`}
                opacity={finalOpacity * 0.5}
              />
              {/* Mid glow */}
              <circle
                cx={cx}
                cy={cy}
                r={glowSize * 0.5}
                fill={`url(#glow-${ff.id})`}
                opacity={finalOpacity * 0.8}
              />
              {/* Core */}
              <circle
                cx={cx}
                cy={cy}
                r={coreSize}
                fill={ff.color}
                opacity={finalOpacity}
              />
              {/* Bright center */}
              <circle
                cx={cx}
                cy={cy}
                r={coreSize * 0.4}
                fill="#FFFFFF"
                opacity={finalOpacity * 0.9}
              />
            </g>
          );
        })}
      </svg>

      {/* Ground fog effect */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: height * 0.15,
          background:
            'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};