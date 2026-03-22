import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const QuantumWaveInterference: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const collisionPoints = [
    { x: width * 0.3, y: height * 0.35, phase: 0, speed: 1.0 },
    { x: width * 0.7, y: height * 0.3, phase: 40, speed: 0.85 },
    { x: width * 0.5, y: height * 0.65, phase: 20, speed: 0.95 },
    { x: width * 0.2, y: height * 0.7, phase: 60, speed: 1.1 },
    { x: width * 0.8, y: height * 0.72, phase: 80, speed: 0.9 },
  ];

  const numRings = 12;
  const maxRadius = Math.sqrt(width * width + height * height) * 0.6;

  const rings: React.ReactNode[] = [];

  collisionPoints.forEach((cp, ci) => {
    for (let r = 0; r < numRings; r++) {
      const ringPhase = (frame - cp.phase) * cp.speed;
      const progress = ((ringPhase - r * 30) % 360) / 360;
      if (progress < 0) continue;

      const radius = progress * maxRadius;
      const ringOpacity = Math.max(0, 1 - progress) * 0.7;

      const hue = (ci * 72 + r * 8 + frame * 0.3) % 360;
      const saturation = 70 + Math.sin(frame * 0.02 + r) * 20;
      const lightness = 55 + Math.sin(frame * 0.015 + ci) * 15;

      rings.push(
        <circle
          key={`ring-${ci}-${r}`}
          cx={cp.x}
          cy={cp.y}
          r={radius}
          fill="none"
          stroke={`hsla(${hue}, ${saturation}%, ${lightness}%, ${ringOpacity})`}
          strokeWidth={2 + (1 - progress) * 3}
        />
      );
    }
  });

  const interferencePoints: React.ReactNode[] = [];
  const gridSize = 45;
  const cols = Math.ceil(width / gridSize) + 1;
  const rows = Math.ceil(height / gridSize) + 1;

  for (let gx = 0; gx < cols; gx++) {
    for (let gy = 0; gy < rows; gy++) {
      const px = gx * gridSize;
      const py = gy * gridSize;

      let amplitude = 0;
      let hueAccum = 0;

      collisionPoints.forEach((cp, ci) => {
        const dx = px - cp.x;
        const dy = py - cp.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const waveVal = Math.sin((dist - (frame - cp.phase) * cp.speed * 2) * 0.025) * Math.exp(-dist / 600);
        amplitude += waveVal;
        hueAccum += ci * 72;
      });

      const normalizedAmp = amplitude / collisionPoints.length;
      const pointOpacity = Math.max(0, Math.abs(normalizedAmp)) * 0.85;
      const pointSize = Math.abs(normalizedAmp) * 5 + 1;
      const hue = (hueAccum / collisionPoints.length + frame * 0.5) % 360;
      const isConstructive = normalizedAmp > 0;
      const lightness = isConstructive ? 75 : 45;

      if (pointOpacity > 0.05) {
        interferencePoints.push(
          <circle
            key={`ip-${gx}-${gy}`}
            cx={px}
            cy={py}
            r={pointSize}
            fill={`hsla(${hue}, 90%, ${lightness}%, ${pointOpacity * 0.9})`}
          />
        );
      }
    }
  }

  const glowCircles: React.ReactNode[] = collisionPoints.map((cp, ci) => {
    const pulse = Math.sin(frame * 0.08 + ci * 1.2) * 0.5 + 0.5;
    const glowRadius = 20 + pulse * 25;
    const hue = (ci * 72 + frame * 0.4) % 360;
    return (
      <React.Fragment key={`glow-${ci}`}>
        <circle
          cx={cp.x}
          cy={cp.y}
          r={glowRadius * 2}
          fill={`hsla(${hue}, 100%, 60%, ${0.08 + pulse * 0.06})`}
        />
        <circle
          cx={cp.x}
          cy={cp.y}
          r={glowRadius}
          fill={`hsla(${hue}, 100%, 80%, ${0.35 + pulse * 0.2})`}
        />
        <circle
          cx={cp.x}
          cy={cp.y}
          r={6}
          fill={`hsla(${hue}, 100%, 95%, 0.95)`}
        />
      </React.Fragment>
    );
  });

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 50% 50%, #050a14 0%, #020408 100%)',
        opacity,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softglow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#softglow)" opacity={0.5}>
          {interferencePoints}
        </g>
        <g filter="url(#glow)" opacity={0.9}>
          {rings}
        </g>
        <g filter="url(#softglow)">
          {glowCircles}
        </g>
      </svg>
    </div>
  );
};