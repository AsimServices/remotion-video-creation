import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const BUBBLE_COUNT = 60;

const BUBBLES = Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
  x: (i * 1733 + 200) % 1920,
  baseY: ((i * 1337) % 900) + 100,
  size: ((i * 47) % 60) + 10,
  speed: ((i * 13) % 40) + 20,
  wobbleAmp: ((i * 31) % 30) + 5,
  wobbleFreq: ((i * 7) % 5) + 2,
  phaseOffset: (i * 23) % 628,
  opacity: ((i * 17) % 40) / 100 + 0.15,
  delay: (i * 19) % 300,
  glowSize: ((i * 53) % 20) + 5,
  shimmerOffset: (i * 41) % 100,
}));

const LIGHT_RAYS = Array.from({ length: 12 }, (_, i) => ({
  x: (i * 160 + 80) % 1920,
  width: ((i * 37) % 80) + 20,
  opacity: ((i * 23) % 30) / 100 + 0.03,
  speed: ((i * 11) % 20) + 10,
  phaseOffset: (i * 57) % 628,
}));

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  x: (i * 947 + 50) % 1920,
  y: (i * 613 + 50) % 1080,
  size: ((i * 7) % 3) + 1,
  speed: ((i * 11) % 15) + 5,
  opacity: ((i * 29) % 40) / 100 + 0.1,
  delay: (i * 31) % 400,
}));

export const UnderwaterBubbles: React.FC = () => {
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
        background: 'linear-gradient(180deg, #001a2e 0%, #002940 25%, #003355 60%, #001520 100%)',
        overflow: 'hidden',
        opacity: globalOpacity,
        position: 'relative',
      }}
    >
      {/* Caustic light overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse 120% 40% at 50% -10%, rgba(0,150,200,0.12) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Animated light rays */}
      {LIGHT_RAYS.map((ray, i) => {
        const rayWave = Math.sin((frame * 0.02 + ray.phaseOffset * 0.01) * ray.speed * 0.1) * 0.3 + 0.7;
        return (
          <div
            key={`ray-${i}`}
            style={{
              position: 'absolute',
              top: -50,
              left: ray.x - ray.width / 2,
              width: ray.width,
              height: height * 1.2,
              background: `linear-gradient(180deg, rgba(100,220,255,${ray.opacity * rayWave}) 0%, rgba(50,180,230,${ray.opacity * 0.3 * rayWave}) 40%, transparent 100%)`,
              transform: `skewX(${Math.sin((frame * 0.015 + ray.phaseOffset * 0.01)) * 8}deg)`,
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {/* Floating particles */}
      {PARTICLES.map((p, i) => {
        const elapsed = Math.max(0, frame - p.delay);
        const yOffset = (elapsed * p.speed * 0.03) % (height + 50);
        const currentY = p.y - yOffset;
        const wrappedY = ((currentY % (height + 100)) + height + 100) % (height + 100) - 50;
        return (
          <div
            key={`particle-${i}`}
            style={{
              position: 'absolute',
              left: p.x,
              top: wrappedY,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: `rgba(150,230,255,${p.opacity})`,
              boxShadow: `0 0 ${p.size * 2}px rgba(100,200,255,${p.opacity * 0.8})`,
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {/* Bubbles */}
      {BUBBLES.map((bubble, i) => {
        const elapsed = Math.max(0, frame - bubble.delay);
        const totalTravel = height + bubble.size * 2 + 100;
        const rawY = (elapsed * bubble.speed * 0.03) % totalTravel;
        const currentY = height + bubble.size - rawY;

        const wobble = Math.sin(
          (elapsed * 0.05 * bubble.wobbleFreq) + bubble.phaseOffset * 0.01
        ) * bubble.wobbleAmp;

        const currentX = bubble.x + wobble;

        const shimmer = interpolate(
          Math.sin(elapsed * 0.08 + bubble.shimmerOffset * 0.1),
          [-1, 1],
          [0.6, 1.0]
        );

        const squish = 1 + Math.sin(elapsed * 0.07 + bubble.phaseOffset * 0.01) * 0.08;

        return (
          <svg
            key={`bubble-${i}`}
            style={{
              position: 'absolute',
              left: currentX - bubble.size,
              top: currentY - bubble.size,
              width: bubble.size * 2,
              height: bubble.size * 2,
              overflow: 'visible',
              pointerEvents: 'none',
            }}
            viewBox={`0 0 ${bubble.size * 2} ${bubble.size * 2}`}
          >
            <defs>
              <radialGradient
                id={`bubbleGrad-${i}`}
                cx="35%"
                cy="30%"
                r="65%"
                fx="30%"
                fy="25%"
              >
                <stop offset="0%" stopColor="rgba(200,240,255,0.55)" />
                <stop offset="35%" stopColor="rgba(100,200,240,0.12)" />
                <stop offset="70%" stopColor="rgba(30,130,180,0.08)" />
                <stop offset="100%" stopColor="rgba(0,80,140,0.18)" />
              </radialGradient>
              <radialGradient
                id={`bubbleEdge-${i}`}
                cx="50%"
                cy="50%"
                r="50%"
              >
                <stop offset="70%" stopColor="transparent" />
                <stop offset="100%" stopColor={`rgba(120,210,255,${bubble.opacity * 1.5})`} />
              </radialGradient>
              <filter id={`bubbleBlur-${i}`}>
                <feGaussianBlur stdDeviation="0.5" />
              </filter>
            </defs>

            {/* Outer glow */}
            <ellipse
              cx={bubble.size}
              cy={bubble.size}
              rx={bubble.size * 1.15}
              ry={bubble.size * 1.15 * squish}
              fill="none"
              stroke={`rgba(80,190,240,${bubble.opacity * 0.3})`}
              strokeWidth={bubble.glowSize * 0.5}
              filter={`url(#bubbleBlur-${i})`}
              opacity={shimmer}
            />

            {/* Main bubble body */}
            <ellipse
              cx={bubble.size}
              cy={bubble.size}
              rx={bubble.size * 0.92}
              ry={bubble.size * 0.92 * squish}
              fill={`url(#bubbleGrad-${i})`}
              opacity={bubble.opacity * shimmer * 2.5}
            />

            {/* Edge rim */}
            <ellipse
              cx={bubble.size}
              cy={bubble.size}
              rx={bubble.size * 0.92}
              ry={bubble.size * 0.92 * squish}
              fill={`url(#bubbleEdge-${i})`}
              stroke={`rgba(160,230,255,${bubble.opacity * 1.2})`}
              strokeWidth={1.2}
              opacity={shimmer}
            />

            {/* Inner specular highlight */}
            <ellipse
              cx={bubble.size * 0.6}
              cy={bubble.size * 0.45}
              rx={bubble.size * 0.22}
              ry={bubble.size * 0.12}
              fill={`rgba(255,255,255,${0.45 * shimmer})`}
              transform={`rotate(-30, ${bubble.size * 0.6}, ${bubble.size * 0.45})`}
            />

            {/* Small secondary highlight */}
            <ellipse
              cx={bubble.size * 0.72}
              cy={bubble.size * 0.35}
              rx={bubble.size * 0.07}
              ry={bubble.size * 0.04}
              fill={`rgba(255,255,255,${0.3 * shimmer})`}
              transform={`rotate(-30, ${bubble.size * 0.72}, ${bubble.size * 0.35})`}
            />

            {/* Bottom shadow */}
            <ellipse
              cx={bubble.size}
              cy={bubble.size * 1.3}
              rx={bubble.size * 0.5}
              ry={bubble.size * 0.18}
              fill={`rgba(0,50,100,${bubble.opacity * 0.5})`}
            />
          </svg>
        );
      })}

      {/* Deep water vignette */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,8,20,0.75) 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Surface shimmer at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 80,
          background: `linear-gradient(180deg, rgba(0,180,230,${0.08 + Math.sin(frame * 0.05) * 0.03}) 0%, transparent 100%)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};