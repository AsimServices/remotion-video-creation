import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const TidalGradientSweep: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const progress = frame / durationInFrames;

  // Main tide sweep offset (0 to 1 across the animation)
  const sweepX = interpolate(frame, [0, durationInFrames], [-width * 0.5, width * 1.5]);

  // Secondary wave oscillations
  const wave1 = Math.sin(frame * 0.04) * 60;
  const wave2 = Math.sin(frame * 0.027 + 1.2) * 40;
  const wave3 = Math.sin(frame * 0.06 + 2.4) * 30;

  // Particle-like shimmer spots
  const shimmerCount = 18;
  const shimmers = Array.from({ length: shimmerCount }, (_, i) => {
    const seed = i * 137.508;
    const px = ((seed * 0.618) % 1) * width;
    const py = ((seed * 0.382) % 1) * height;
    const phase = seed % (Math.PI * 2);
    const shimmerOpacity = interpolate(
      Math.sin(frame * 0.05 + phase),
      [-1, 1],
      [0.0, 0.35]
    );
    const scale = interpolate(Math.sin(frame * 0.03 + phase * 1.5), [-1, 1], [0.5, 1.5]);
    return { px, py, shimmerOpacity, scale, seed };
  });

  // Flowing blob layers
  const blobCount = 8;
  const blobs = Array.from({ length: blobCount }, (_, i) => {
    const seed = (i + 1) * 53.7;
    const bx = sweepX + ((seed * 0.3) % (width * 2)) - width * 0.3 + Math.sin(frame * 0.02 + seed) * 100;
    const by = height * ((seed * 0.17 + 0.1) % 0.9) + Math.sin(frame * 0.03 + seed * 0.5) * 80;
    const br = interpolate(Math.sin(frame * 0.025 + seed * 0.4), [-1, 1], [200, 500]);
    const bOpacity = interpolate(Math.sin(frame * 0.02 + seed * 0.7), [-1, 1], [0.08, 0.22]);
    const isTeal = i % 2 === 0;
    return { bx, by, br, bOpacity, isTeal };
  });

  const gradientShift = interpolate(frame, [0, durationInFrames], [0, 100]);

  return (
    <div
      style={{
        width,
        height,
        background: '#020d0e',
        overflow: 'hidden',
        position: 'relative',
        opacity,
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {/* Main teal-violet gradient */}
          <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#003d40" />
            <stop offset="30%" stopColor="#006d70" />
            <stop offset="60%" stopColor="#4b0082" />
            <stop offset="100%" stopColor="#2d0057" />
          </linearGradient>

          {/* Sweep gradient for the tide */}
          <linearGradient id="sweepGrad" x1="0%" y1="30%" x2="100%" y2="70%">
            <stop offset={`${gradientShift * 0.3}%`} stopColor="#00b4b8" stopOpacity="0" />
            <stop offset={`${20 + gradientShift * 0.3}%`} stopColor="#00b4b8" stopOpacity="0.55" />
            <stop offset={`${50 + gradientShift * 0.2}%`} stopColor="#7b2fff" stopOpacity="0.6" />
            <stop offset={`${80 + gradientShift * 0.1}%`} stopColor="#4b0082" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4b0082" stopOpacity="0" />
          </linearGradient>

          {/* Radial glow for blobs */}
          <radialGradient id="tealBlob" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00e5e8" stopOpacity="1" />
            <stop offset="100%" stopColor="#00e5e8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="violetBlob" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9b59ff" stopOpacity="1" />
            <stop offset="100%" stopColor="#9b59ff" stopOpacity="0" />
          </radialGradient>

          {/* Shimmer radial */}
          <radialGradient id="shimmerGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="60%" stopColor="#a0ffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#a0ffff" stopOpacity="0" />
          </radialGradient>

          <filter id="blur1">
            <feGaussianBlur stdDeviation="80" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="40" />
          </filter>
          <filter id="blurShimmer">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* Base deep background layer */}
        <rect width={width} height={height} fill="url(#mainGrad)" opacity="0.9" />

        {/* Flowing blob layers */}
        {blobs.map((b, i) => (
          <ellipse
            key={`blob-${i}`}
            cx={b.bx}
            cy={b.by}
            rx={b.br}
            ry={b.br * 0.6}
            fill={b.isTeal ? 'url(#tealBlob)' : 'url(#violetBlob)'}
            opacity={b.bOpacity}
            filter="url(#blur1)"
          />
        ))}

        {/* Main tide sweep band */}
        <rect
          x={sweepX - width * 0.4 + wave1}
          y={-height * 0.1}
          width={width * 1.0}
          height={height * 1.2}
          fill="url(#sweepGrad)"
          filter="url(#blur1)"
          opacity="0.7"
        />

        {/* Secondary offset sweep for depth */}
        <rect
          x={sweepX - width * 0.6 + wave2}
          y={-height * 0.05}
          width={width * 0.7}
          height={height * 1.1}
          fill="url(#sweepGrad)"
          filter="url(#blur2)"
          opacity="0.4"
        />

        {/* Tertiary sweep pulse */}
        <ellipse
          cx={sweepX + wave3}
          cy={height * 0.5}
          rx={width * 0.45}
          ry={height * 0.55}
          fill="url(#sweepGrad)"
          filter="url(#blur1)"
          opacity="0.35"
        />

        {/* Wavy horizontal bands */}
        {Array.from({ length: 7 }, (_, i) => {
          const yPos = (height / 8) * (i + 1);
          const waveOffset = Math.sin(frame * 0.035 + i * 0.7) * 50 + Math.sin(frame * 0.018 + i * 1.3) * 30;
          const bandOpacity = interpolate(Math.sin(frame * 0.04 + i * 0.9), [-1, 1], [0.03, 0.12]);
          return (
            <rect
              key={`band-${i}`}
              x={0}
              y={yPos + waveOffset - 20}
              width={width}
              height={40}
              rx={20}
              fill={i % 3 === 0 ? '#00e5e8' : i % 3 === 1 ? '#7b2fff' : '#00b4b8'}
              opacity={bandOpacity}
              filter="url(#blur2)"
            />
          );
        })}

        {/* Shimmer particles */}
        {shimmers.map((s, i) => (
          <ellipse
            key={`shimmer-${i}`}
            cx={s.px}
            cy={s.py}
            rx={14 * s.scale}
            ry={8 * s.scale}
            fill="url(#shimmerGrad)"
            opacity={s.shimmerOpacity}
            filter="url(#blurShimmer)"
          />
        ))}

        {/* Top-edge subtle glow */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height * 0.15}
          fill="#00e5e8"
          opacity={0.04}
          filter="url(#blur2)"
        />

        {/* Bottom-edge violet bloom */}
        <rect
          x={0}
          y={height * 0.85}
          width={width}
          height={height * 0.15}
          fill="#7b2fff"
          opacity={0.06}
          filter="url(#blur2)"
        />
      </svg>
    </div>
  );
};