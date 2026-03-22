import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const HexGridRipple: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const hexSize = 48;
  const hexWidth = hexSize * 2;
  const hexHeight = Math.sqrt(3) * hexSize;
  const cols = Math.ceil(width / (hexWidth * 0.75)) + 3;
  const rows = Math.ceil(height / hexHeight) + 3;

  const centerX = width / 2;
  const centerY = height / 2;
  const time = frame / 30;

  const hexagons: JSX.Element[] = [];

  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const xOffset = col * hexWidth * 0.75;
      const yOffset = row * hexHeight + (col % 2 === 0 ? 0 : hexHeight / 2);

      const dx = xOffset - centerX;
      const dy = yOffset - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
      const normalizedDist = dist / maxDist;

      const rippleSpeed = 1.2;
      const rippleFreq = 3.5;
      const ripplePhase = dist / 120 - time * rippleSpeed;
      const rippleValue = Math.sin(ripplePhase * rippleFreq) * 0.5 + 0.5;

      const secondaryRipple = Math.sin(ripplePhase * 2.1 + 1.2) * 0.3 + 0.7;
      const combined = rippleValue * 0.7 + secondaryRipple * 0.3;

      const edgeFade = interpolate(normalizedDist, [0, 0.85, 1.0], [1, 0.7, 0.05], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      const glowIntensity = combined * edgeFade;

      const baseAlpha = 0.08 + glowIntensity * 0.35;
      const strokeAlpha = 0.3 + glowIntensity * 0.7;
      const glowBlur = 4 + glowIntensity * 18;

      const r = Math.round(0 + glowIntensity * 30);
      const g = Math.round(200 + glowIntensity * 55);
      const b = Math.round(220 + glowIntensity * 35);

      const points = Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 180) * (60 * i - 30);
        return `${xOffset + hexSize * Math.cos(angle)},${yOffset + hexSize * Math.sin(angle)}`;
      }).join(' ');

      hexagons.push(
        <g key={`${row}-${col}`}>
          <polygon
            points={points}
            fill={`rgba(${r},${g},${b},${baseAlpha})`}
            stroke={`rgba(${r},${g},${b},${strokeAlpha})`}
            strokeWidth={1.5}
            style={{ filter: `blur(${glowBlur * 0.3}px)` }}
          />
          <polygon
            points={points}
            fill="none"
            stroke={`rgba(${r},${g},${b},${strokeAlpha * 0.8})`}
            strokeWidth={0.8}
          />
        </g>
      );
    }
  }

  const numParticles = 60;
  const particles = Array.from({ length: numParticles }, (_, i) => {
    const seed = i * 137.508;
    const px = (Math.sin(seed) * 0.5 + 0.5) * width;
    const py = (Math.cos(seed * 1.618) * 0.5 + 0.5) * height;
    const particleTime = (time * 0.4 + i * 0.3) % 1;
    const particleOpacity = Math.sin(particleTime * Math.PI) * 0.8;
    const particleSize = 1 + Math.sin(seed * 3.14) * 2;
    return (
      <circle
        key={`p-${i}`}
        cx={px}
        cy={py + Math.sin(time * 0.5 + seed) * 30}
        r={particleSize}
        fill={`rgba(0,240,255,${particleOpacity * 0.6})`}
        style={{ filter: 'blur(2px)' }}
      />
    );
  });

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at center, #020c14 0%, #010810 50%, #000507 100%)',
        overflow: 'hidden',
        opacity,
        position: 'relative',
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(0,180,220,0.06)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width={width} height={height} fill="url(#bgGlow)" />
        <g filter="url(#glow)">
          {hexagons}
        </g>
        {particles}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={300}
          ry={200}
          fill="none"
          stroke={`rgba(0,220,255,${0.03 + Math.sin(time * 0.8) * 0.02})`}
          strokeWidth={80}
          style={{ filter: 'blur(40px)' }}
        />
      </svg>
    </div>
  );
};