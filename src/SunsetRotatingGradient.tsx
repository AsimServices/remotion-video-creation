import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const SunsetRotatingGradient: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const rotation = interpolate(frame, [0, durationInFrames], [0, 360]);
  const rotation2 = interpolate(frame, [0, durationInFrames], [45, 405]);
  const rotation3 = interpolate(frame, [0, durationInFrames], [90, 450]);

  const pulse = interpolate(
    Math.sin((frame / durationInFrames) * Math.PI * 6),
    [-1, 1],
    [0.85, 1.15]
  );

  const pulse2 = interpolate(
    Math.sin((frame / durationInFrames) * Math.PI * 4 + 1),
    [-1, 1],
    [0.9, 1.1]
  );

  const orb1X = width * 0.5 + Math.cos((frame / durationInFrames) * Math.PI * 2) * width * 0.15;
  const orb1Y = height * 0.5 + Math.sin((frame / durationInFrames) * Math.PI * 2) * height * 0.1;

  const orb2X = width * 0.5 + Math.cos((frame / durationInFrames) * Math.PI * 2 + Math.PI) * width * 0.2;
  const orb2Y = height * 0.5 + Math.sin((frame / durationInFrames) * Math.PI * 2 + Math.PI) * height * 0.12;

  const orb3X = width * 0.5 + Math.cos((frame / durationInFrames) * Math.PI * 3 + Math.PI / 3) * width * 0.1;
  const orb3Y = height * 0.5 + Math.sin((frame / durationInFrames) * Math.PI * 3 + Math.PI / 3) * height * 0.15;

  const shimmerOpacity = interpolate(
    Math.sin((frame / durationInFrames) * Math.PI * 8),
    [-1, 1],
    [0.3, 0.7]
  );

  return (
    <div style={{ width, height, background: '#0a0305', overflow: 'hidden', opacity, position: 'relative' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="mainOrb1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#FF4500" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#C1440E" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="mainOrb2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB347" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#FF8C42" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#E05C00" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="mainOrb3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF3E1D" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#FF6347" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8B1A00" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="glowOrb" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#FFA500" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="deepOrb" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B0000" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#4A0010" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1a0008" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="sweepGrad1" x1="0%" y1="0%" x2="100%" y2="100%"
            gradientTransform={`rotate(${rotation}, ${width / 2}, ${height / 2})`}>
            <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.4" />
            <stop offset="25%" stopColor="#FF4500" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#FFB347" stopOpacity="0.3" />
            <stop offset="75%" stopColor="#C1440E" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="sweepGrad2" x1="100%" y1="0%" x2="0%" y2="100%"
            gradientTransform={`rotate(${rotation2}, ${width / 2}, ${height / 2})`}>
            <stop offset="0%" stopColor="#FF3E1D" stopOpacity="0.3" />
            <stop offset="30%" stopColor="#FFD700" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#FF8C42" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8B0000" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="sweepGrad3" x1="50%" y1="0%" x2="50%" y2="100%"
            gradientTransform={`rotate(${rotation3}, ${width / 2}, ${height / 2})`}>
            <stop offset="0%" stopColor="#FF6347" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#FF4500" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#4A0010" stopOpacity="0.2" />
          </linearGradient>

          <filter id="blur1">
            <feGaussianBlur stdDeviation="80" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="120" />
          </filter>
          <filter id="blur3">
            <feGaussianBlur stdDeviation="60" />
          </filter>
          <filter id="blurShimmer">
            <feGaussianBlur stdDeviation="40" />
          </filter>
        </defs>

        {/* Deep background base */}
        <rect x="0" y="0" width={width} height={height} fill="#0a0305" />

        {/* Rotating sweep layers */}
        <rect x="0" y="0" width={width} height={height} fill="url(#sweepGrad1)" />
        <rect x="0" y="0" width={width} height={height} fill="url(#sweepGrad2)" />
        <rect x="0" y="0" width={width} height={height} fill="url(#sweepGrad3)" />

        {/* Deep background orb */}
        <ellipse
          cx={width * 0.5}
          cy={height * 0.55}
          rx={width * 0.7 * pulse2}
          ry={height * 0.6 * pulse2}
          fill="url(#deepOrb)"
          filter="url(#blur2)"
        />

        {/* Large warm glow center */}
        <ellipse
          cx={width * 0.5}
          cy={height * 0.5}
          rx={width * 0.5 * pulse}
          ry={height * 0.45 * pulse}
          fill="url(#glowOrb)"
          filter="url(#blur2)"
          opacity={0.7}
        />

        {/* Floating orbs */}
        <ellipse
          cx={orb1X}
          cy={orb1Y}
          rx={width * 0.28 * pulse}
          ry={height * 0.3 * pulse}
          fill="url(#mainOrb1)"
          filter="url(#blur1)"
        />

        <ellipse
          cx={orb2X}
          cy={orb2Y}
          rx={width * 0.32 * pulse2}
          ry={height * 0.28 * pulse2}
          fill="url(#mainOrb2)"
          filter="url(#blur1)"
        />

        <ellipse
          cx={orb3X}
          cy={orb3Y}
          rx={width * 0.25 * pulse}
          ry={height * 0.26 * pulse}
          fill="url(#mainOrb3)"
          filter="url(#blur1)"
        />

        {/* Shimmer highlights */}
        <ellipse
          cx={width * 0.5 + Math.sin(frame * 0.04) * width * 0.05}
          cy={height * 0.45 + Math.cos(frame * 0.03) * height * 0.04}
          rx={width * 0.12}
          ry={height * 0.08}
          fill="#FFD700"
          filter="url(#blurShimmer)"
          opacity={shimmerOpacity * 0.5}
        />

        <ellipse
          cx={width * 0.4 + Math.cos(frame * 0.05) * width * 0.06}
          cy={height * 0.55 + Math.sin(frame * 0.04) * height * 0.05}
          rx={width * 0.1}
          ry={height * 0.07}
          fill="#FF8C42"
          filter="url(#blurShimmer)"
          opacity={shimmerOpacity * 0.6}
        />

        <ellipse
          cx={width * 0.62 + Math.sin(frame * 0.06 + 1) * width * 0.04}
          cy={height * 0.52 + Math.cos(frame * 0.05 + 1) * height * 0.04}
          rx={width * 0.09}
          ry={height * 0.065}
          fill="#FF6347"
          filter="url(#blurShimmer)"
          opacity={shimmerOpacity * 0.55}
        />

        {/* Edge vignette */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="50%" stopColor="#0a0305" stopOpacity="0" />
          <stop offset="100%" stopColor="#0a0305" stopOpacity="0.85" />
        </radialGradient>
        <rect x="0" y="0" width={width} height={height} fill="url(#vignette)" />
      </svg>
    </div>
  );
};