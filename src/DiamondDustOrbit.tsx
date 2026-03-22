import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const DiamondDustOrbit: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const centerX = width / 2;
  const centerY = height / 2;

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const pulseScale = 1 + 0.15 * Math.sin((frame / 30) * Math.PI * 2);
  const pulseOpacity = 0.7 + 0.3 * Math.sin((frame / 25) * Math.PI * 2);

  const numParticles = 220;
  const particles = Array.from({ length: numParticles }, (_, i) => {
    const seed = i * 137.508;
    const orbitRadius = 80 + (i % 7) * 60 + Math.sin(seed) * 40;
    const speed = 0.3 + (i % 5) * 0.12 + Math.cos(seed * 0.1) * 0.08;
    const angleOffset = (seed * 47.3) % 360;
    const angle = ((frame * speed + angleOffset) * Math.PI) / 180;
    const tiltX = Math.sin(seed * 0.7) * 0.4;
    const tiltY = Math.cos(seed * 0.3) * 0.5;

    const x = centerX + orbitRadius * Math.cos(angle) * (1 + tiltX);
    const y = centerY + orbitRadius * Math.sin(angle) * (0.5 + tiltY * 0.3);

    const size = 1.5 + Math.abs(Math.sin(seed * 0.4 + frame * 0.05)) * 3.5;
    const shimmer = Math.abs(Math.sin(frame * 0.1 + seed * 0.2));
    const depthFactor = 0.4 + 0.6 * ((Math.sin(angle + seed) + 1) / 2);

    const hue = 180 + Math.sin(seed * 0.5) * 60;
    const saturation = 60 + shimmer * 40;
    const lightness = 70 + shimmer * 30;

    return { x, y, size, shimmer, depthFactor, hue, saturation, lightness, seed };
  });

  const numStreaks = 40;
  const streaks = Array.from({ length: numStreaks }, (_, i) => {
    const seed = i * 251.3 + 99;
    const orbitRadius = 100 + (i % 4) * 80 + Math.sin(seed) * 30;
    const speed = 0.2 + (i % 3) * 0.15;
    const angleOffset = (seed * 31.7) % 360;
    const angle = ((frame * speed + angleOffset) * Math.PI) / 180;
    const tiltX = Math.sin(seed * 0.6) * 0.35;
    const tiltY = Math.cos(seed * 0.4) * 0.4;

    const x = centerX + orbitRadius * Math.cos(angle) * (1 + tiltX);
    const y = centerY + orbitRadius * Math.sin(angle) * (0.5 + tiltY * 0.3);

    const trailAngle = Math.atan2(
      orbitRadius * Math.sin(angle) * (0.5 + tiltY * 0.3) * -speed,
      orbitRadius * Math.cos(angle) * (1 + tiltX) * speed
    );

    const trailLength = 20 + Math.abs(Math.sin(seed * 0.7)) * 30;
    const shimmer = Math.abs(Math.sin(frame * 0.08 + seed * 0.3));

    return { x, y, trailAngle, trailLength, shimmer, seed };
  });

  return (
    <div style={{ width, height, background: '#030309', overflow: 'hidden', position: 'relative', opacity: globalOpacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="20%" stopColor="#aaddff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#4488ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#001133" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#88bbff" stopOpacity="0.3" />
            <stop offset="60%" stopColor="#2244aa" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000011" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ambientGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#224488" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <filter id="blur1">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="blur3">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="sparkle">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient background glow */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={600}
          ry={500}
          fill="url(#ambientGlow)"
          filter="url(#blur3)"
        />

        {/* Outer orbit ring glow */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={480 * pulseScale}
          ry={480 * pulseScale}
          fill="url(#outerGlow)"
          filter="url(#blur3)"
        />

        {/* Streaks/trails */}
        {streaks.map((s, i) => (
          <line
            key={`streak-${i}`}
            x1={s.x}
            y1={s.y}
            x2={s.x + Math.cos(s.trailAngle + Math.PI) * s.trailLength}
            y2={s.y + Math.sin(s.trailAngle + Math.PI) * s.trailLength}
            stroke={`hsla(${200 + s.shimmer * 40}, 80%, 85%, ${0.15 + s.shimmer * 0.25})`}
            strokeWidth={0.8}
            strokeLinecap="round"
            filter="url(#blur1)"
          />
        ))}

        {/* Particles */}
        {particles.map((p, i) => {
          const alpha = p.depthFactor * (0.5 + p.shimmer * 0.5);
          return (
            <g key={`particle-${i}`}>
              {/* Glow halo */}
              <circle
                cx={p.x}
                cy={p.y}
                r={p.size * 2.5}
                fill={`hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${alpha * 0.3})`}
                filter="url(#blur1)"
              />
              {/* Core particle */}
              <circle
                cx={p.x}
                cy={p.y}
                r={p.size * 0.7}
                fill={`hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${alpha})`}
              />
              {/* Diamond cross sparkle on bright particles */}
              {p.shimmer > 0.75 && (
                <>
                  <line
                    x1={p.x - p.size * 2}
                    y1={p.y}
                    x2={p.x + p.size * 2}
                    y2={p.y}
                    stroke={`hsla(${p.hue}, 100%, 95%, ${alpha * 0.8})`}
                    strokeWidth={0.6}
                    filter="url(#blur1)"
                  />
                  <line
                    x1={p.x}
                    y1={p.y - p.size * 2}
                    x2={p.x}
                    y2={p.y + p.size * 2}
                    stroke={`hsla(${p.hue}, 100%, 95%, ${alpha * 0.8})`}
                    strokeWidth={0.6}
                    filter="url(#blur1)"
                  />
                </>
              )}
            </g>
          );
        })}

        {/* Central light source layers */}
        <circle
          cx={centerX}
          cy={centerY}
          r={120 * pulseScale}
          fill="url(#outerGlow)"
          filter="url(#blur2)"
          opacity={pulseOpacity * 0.6}
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={60 * pulseScale}
          fill="url(#coreGlow)"
          filter="url(#blur2)"
          opacity={pulseOpacity}
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={28 * pulseScale}
          fill="url(#coreGlow)"
          opacity={pulseOpacity}
        />
        {/* Bright center point */}
        <circle
          cx={centerX}
          cy={centerY}
          r={8 * pulseScale}
          fill="#ffffff"
          opacity={pulseOpacity}
        />

        {/* Central cross flare */}
        <line
          x1={centerX - 80 * pulseScale}
          y1={centerY}
          x2={centerX + 80 * pulseScale}
          y2={centerY}
          stroke={`rgba(200, 220, 255, ${0.4 * pulseOpacity})`}
          strokeWidth={1.5}
          filter="url(#blur1)"
        />
        <line
          x1={centerX}
          y1={centerY - 80 * pulseScale}
          x2={centerX}
          y2={centerY + 80 * pulseScale}
          stroke={`rgba(200, 220, 255, ${0.4 * pulseOpacity})`}
          strokeWidth={1.5}
          filter="url(#blur1)"
        />
        {/* Diagonal flares */}
        <line
          x1={centerX - 50 * pulseScale}
          y1={centerY - 50 * pulseScale}
          x2={centerX + 50 * pulseScale}
          y2={centerY + 50 * pulseScale}
          stroke={`rgba(180, 210, 255, ${0.2 * pulseOpacity})`}
          strokeWidth={1}
          filter="url(#blur1)"
        />
        <line
          x1={centerX + 50 * pulseScale}
          y1={centerY - 50 * pulseScale}
          x2={centerX - 50 * pulseScale}
          y2={centerY + 50 * pulseScale}
          stroke={`rgba(180, 210, 255, ${0.2 * pulseOpacity})`}
          strokeWidth={1}
          filter="url(#blur1)"
        />
      </svg>
    </div>
  );
};