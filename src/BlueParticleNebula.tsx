import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const BlueParticleNebula: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const t = frame / 30;

  const generateParticles = (count: number, seed: number, layer: number) => {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const s = (seed * 9301 + i * 49297) % 233280;
      const r1 = s / 233280;
      const r2 = ((s * 1103515245 + 12345) % 233280) / 233280;
      const r3 = ((s * 22695477 + 1) % 233280) / 233280;
      const r4 = ((s * 6364136223846793005 + 1442695040888963407) % 233280) / 233280;
      const r5 = ((s * 1664525 + 1013904223) % 233280) / 233280;

      const armAngle = (i / count) * Math.PI * 2 * (layer % 3 === 0 ? 3 : layer % 3 === 1 ? 2 : 4);
      const spiralTightness = 0.4 + r1 * 0.4;
      const baseRadius = r2 * 0.45 * Math.min(width, height) * 0.5;
      const noiseRadius = baseRadius + (r3 - 0.5) * 80;

      const spiralAngle = armAngle + noiseRadius * spiralTightness * 0.01;
      const rotationSpeed = (0.04 + r4 * 0.03) * (layer % 2 === 0 ? 1 : -0.5);
      const currentAngle = spiralAngle + t * rotationSpeed;

      const cx = width / 2 + Math.cos(currentAngle) * noiseRadius;
      const cy = height / 2 + Math.sin(currentAngle) * noiseRadius * 0.55;

      const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.5 + r5 * 2) + i));
      const baseSize = 0.8 + r1 * 3.5;
      const size = baseSize * (layer === 0 ? 1.4 : layer === 1 ? 1.0 : 0.7);

      const hue = 190 + r3 * 60;
      const saturation = 70 + r1 * 30;
      const lightness = 50 + r2 * 40;
      const alpha = (0.3 + r4 * 0.7) * twinkle;

      const blurAmount = layer === 2 ? 0.5 : layer === 1 ? 1.0 : 1.5;

      particles.push(
        <circle
          key={`${layer}-${i}`}
          cx={cx}
          cy={cy}
          r={size}
          fill={`hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`}
          style={{ filter: `blur(${blurAmount}px)` }}
        />
      );
    }
    return particles;
  };

  const generateNebulaClouds = () => {
    const clouds = [];
    const cloudCount = 8;
    for (let i = 0; i < cloudCount; i++) {
      const s = (i * 137 + 42) * 9301 % 233280;
      const r1 = s / 233280;
      const r2 = ((s * 1103515245 + 12345) % 233280) / 233280;
      const r3 = ((s * 22695477 + 1) % 233280) / 233280;
      const r4 = ((s * 6364136 + 1442695) % 233280) / 233280;

      const angle = r1 * Math.PI * 2 + t * 0.02 * (i % 2 === 0 ? 1 : -0.7);
      const radius = 80 + r2 * 280;
      const cx = width / 2 + Math.cos(angle) * radius;
      const cy = height / 2 + Math.sin(angle) * radius * 0.5;
      const rx = 120 + r3 * 200;
      const ry = 60 + r4 * 120;
      const hue = 200 + r1 * 50;
      const alpha = 0.015 + r2 * 0.04;

      clouds.push(
        <ellipse
          key={`cloud-${i}`}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={`hsla(${hue}, 90%, 60%, ${alpha})`}
          style={{ filter: `blur(${30 + r3 * 40}px)` }}
          transform={`rotate(${r1 * 60}, ${cx}, ${cy})`}
        />
      );
    }
    return clouds;
  };

  const coreGlow = interpolate(Math.sin(t * 0.3), [-1, 1], [0.6, 1.0]);

  return (
    <div style={{ width, height, background: '#020408', position: 'relative', overflow: 'hidden', opacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`hsla(210, 100%, 80%, ${0.15 * coreGlow})`} />
            <stop offset="40%" stopColor={`hsla(220, 90%, 50%, ${0.08 * coreGlow})`} />
            <stop offset="100%" stopColor="hsla(230, 80%, 20%, 0)" />
          </radialGradient>
          <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsla(200, 80%, 40%, 0.05)" />
            <stop offset="60%" stopColor="hsla(210, 90%, 30%, 0.03)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <ellipse cx={width / 2} cy={height / 2} rx={width * 0.45} ry={height * 0.4}
          fill="url(#outerGlow)" style={{ filter: 'blur(60px)' }} />

        {generateNebulaClouds()}

        <g style={{ filter: 'blur(2px)' }}>{generateParticles(300, 1, 0)}</g>
        <g style={{ filter: 'blur(1px)' }}>{generateParticles(500, 2, 1)}</g>
        <g>{generateParticles(400, 3, 2)}</g>

        <ellipse cx={width / 2} cy={height / 2} rx={width * 0.38} ry={height * 0.32}
          fill="url(#coreGrad)" style={{ filter: 'blur(40px)' }} />

        <circle cx={width / 2} cy={height / 2} r={40}
          fill={`hsla(200, 100%, 85%, ${0.25 * coreGlow})`}
          style={{ filter: 'blur(15px)' }} />
        <circle cx={width / 2} cy={height / 2} r={12}
          fill={`hsla(200, 100%, 95%, ${0.6 * coreGlow})`}
          style={{ filter: 'blur(4px)' }} />
      </svg>
    </div>
  );
};