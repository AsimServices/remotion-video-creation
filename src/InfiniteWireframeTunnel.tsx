import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const InfiniteWireframeTunnel: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const speed = 0.04;
  const tunnelProgress = (frame * speed) % 1;

  const cx = width / 2;
  const cy = height / 2;

  const numRings = 20;
  const numSegments = 8;
  const maxRadius = Math.max(width, height) * 0.85;
  const minRadius = 20;

  const getRingRadius = (index: number, progress: number) => {
    const t = ((index / numRings) + progress) % 1;
    const perspective = Math.pow(t, 2.2);
    return minRadius + perspective * (maxRadius - minRadius);
  };

  const getRingOpacity = (index: number, progress: number) => {
    const t = ((index / numRings) + progress) % 1;
    return interpolate(t, [0, 0.15, 0.7, 1], [0, 0.9, 0.5, 0.05]);
  };

  const getHue = (index: number, progress: number) => {
    const t = ((index / numRings) + progress) % 1;
    const baseHue = (frame * 0.3) % 360;
    return (baseHue + t * 60) % 360;
  };

  const rings = Array.from({ length: numRings }, (_, i) => {
    const radius = getRingRadius(i, tunnelProgress);
    const ringOpacity = getRingOpacity(i, tunnelProgress);
    const hue = getHue(i, tunnelProgress);
    const saturation = 80 + interpolate(radius, [minRadius, maxRadius], [0, 20]);
    const lightness = 40 + interpolate(radius, [minRadius, maxRadius], [30, 0]);
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

    const points: { x: number; y: number }[] = [];
    for (let s = 0; s < numSegments; s++) {
      const angle = (s / numSegments) * Math.PI * 2;
      const squish = 0.7;
      points.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius * squish,
      });
    }

    const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

    return { points, polygonPoints, radius, ringOpacity, color, hue };
  });

  const spokes: JSX.Element[] = [];
  for (let s = 0; s < numSegments; s++) {
    const angle = (s / numSegments) * Math.PI * 2;
    const squish = 0.7;
    const farRadius = maxRadius * 0.95;
    const nearRadius = minRadius * 2;

    const x1 = cx + Math.cos(angle) * nearRadius;
    const y1 = cy + Math.sin(angle) * nearRadius * squish;
    const x2 = cx + Math.cos(angle) * farRadius;
    const y2 = cy + Math.sin(angle) * farRadius * squish;

    const spokeHue = ((frame * 0.3) + (s / numSegments) * 60) % 360;
    spokes.push(
      <line
        key={`spoke-${s}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={`hsl(${spokeHue}, 70%, 45%)`}
        strokeWidth={0.8}
        strokeOpacity={0.35}
      />
    );
  }

  const glowRadius = interpolate(Math.sin(frame * 0.05), [-1, 1], [60, 100]);

  return (
    <div style={{ width, height, background: '#050508', overflow: 'hidden', opacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`hsl(${(frame * 0.3) % 360}, 80%, 60%)`} stopOpacity="0.5" />
            <stop offset="60%" stopColor={`hsl(${(frame * 0.3 + 30) % 360}, 60%, 20%)`} stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`hsl(${(frame * 0.2) % 360}, 50%, 8%)`} stopOpacity="1" />
            <stop offset="100%" stopColor="#030305" stopOpacity="1" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width={width} height={height} fill="url(#bgGlow)" />

        {spokes}

        {rings.map((ring, i) => (
          <polygon
            key={i}
            points={ring.polygonPoints}
            fill="none"
            stroke={ring.color}
            strokeWidth={interpolate(ring.radius, [minRadius, maxRadius], [3.5, 0.6])}
            strokeOpacity={ring.ringOpacity}
            filter={ring.radius < maxRadius * 0.3 ? 'url(#glow)' : undefined}
          />
        ))}

        <ellipse
          cx={cx}
          cy={cy}
          rx={glowRadius}
          ry={glowRadius * 0.7}
          fill="url(#centerGlow)"
          filter="url(#softGlow)"
        />

        {Array.from({ length: 6 }, (_, i) => {
          const particleAngle = ((i / 6) * Math.PI * 2) + frame * 0.02;
          const dist = interpolate((frame * 0.05 + i * 0.7) % 1, [0, 1], [20, maxRadius * 0.8]);
          const squish = 0.7;
          const px = cx + Math.cos(particleAngle) * dist;
          const py = cy + Math.sin(particleAngle) * dist * squish;
          const pOpacity = interpolate(dist, [20, maxRadius * 0.4, maxRadius * 0.8], [1, 0.7, 0]);
          const pHue = ((frame * 0.5) + i * 40) % 360;
          return (
            <circle
              key={`particle-${i}`}
              cx={px}
              cy={py}
              r={interpolate(dist, [20, maxRadius * 0.8], [4, 1.2])}
              fill={`hsl(${pHue}, 90%, 70%)`}
              opacity={pOpacity}
              filter="url(#glow)"
            />
          );
        })}
      </svg>
    </div>
  );
};