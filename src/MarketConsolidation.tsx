import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NUM_DOTS = 120;
const NUM_CLUSTERS = 4;

const CLUSTER_CENTERS = [
  { x: 0.25, y: 0.35 },
  { x: 0.72, y: 0.28 },
  { x: 0.38, y: 0.70 },
  { x: 0.78, y: 0.72 },
];

const DOTS = Array.from({ length: NUM_DOTS }, (_, i) => {
  const startX = ((i * 1731 + 317) % 1000) / 1000;
  const startY = ((i * 1337 + 419) % 1000) / 1000;
  const clusterIndex = i % NUM_CLUSTERS;
  const offsetX = (((i * 173 + 91) % 200) - 100) / 1000;
  const offsetY = (((i * 293 + 137) % 200) - 100) / 1000;
  const size = ((i * 47) % 6) + 3;
  const delay = ((i * 13) % 30) / 100;
  const hue = [200, 280, 160, 320][clusterIndex];
  const hueVariance = ((i * 37) % 40) - 20;
  return {
    startX,
    startY,
    clusterIndex,
    offsetX,
    offsetY,
    size,
    delay,
    hue: hue + hueVariance,
    saturation: 60 + ((i * 17) % 30),
    lightness: 55 + ((i * 23) % 25),
  };
});

const PULSE_RINGS = Array.from({ length: NUM_CLUSTERS }, (_, i) => ({
  cx: CLUSTER_CENTERS[i].x,
  cy: CLUSTER_CENTERS[i].y,
  hue: [200, 280, 160, 320][i],
}));

const BACKGROUND_STARS = Array.from({ length: 200 }, (_, i) => ({
  x: ((i * 2311 + 503) % 1000) / 1000,
  y: ((i * 1987 + 701) % 1000) / 1000,
  r: ((i * 31) % 3) + 0.5,
  opacity: ((i * 57) % 60 + 20) / 100,
}));

export const MarketConsolidation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const convergenceProgress = interpolate(frame, [60, durationInFrames - 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const eased = convergenceProgress < 0.5
    ? 4 * convergenceProgress * convergenceProgress * convergenceProgress
    : 1 - Math.pow(-2 * convergenceProgress + 2, 3) / 2;

  return (
    <div style={{ width, height, background: '#06060f', position: 'relative', overflow: 'hidden', opacity }}>
      {/* Background stars */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {BACKGROUND_STARS.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star.x * width}
            cy={star.y * height}
            r={star.r}
            fill={`rgba(200,210,255,${star.opacity * 0.5})`}
          />
        ))}
      </svg>

      {/* Cluster glow backgrounds */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {PULSE_RINGS.map((ring, i) => {
          const glowRadius = interpolate(eased, [0, 1], [0, width * 0.18]);
          const glowOpacity = interpolate(eased, [0, 0.3, 1], [0, 0.12, 0.22]);
          return (
            <radialGradient key={`grad-${i}`} id={`glow-${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={`hsl(${ring.hue},80%,60%)`} stopOpacity={glowOpacity} />
              <stop offset="100%" stopColor={`hsl(${ring.hue},80%,30%)`} stopOpacity={0} />
            </radialGradient>
          );
        })}
        {PULSE_RINGS.map((ring, i) => {
          const glowRadius = interpolate(eased, [0, 1], [0, width * 0.18]);
          return (
            <circle
              key={`glow-circle-${i}`}
              cx={ring.cx * width}
              cy={ring.cy * height}
              r={glowRadius}
              fill={`url(#glow-${i})`}
            />
          );
        })}
      </svg>

      {/* Pulse rings */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {PULSE_RINGS.map((ring, i) => {
          return [0, 1, 2].map((pulseIndex) => {
            const pulsePhase = ((frame * 0.02 + pulseIndex * 0.33 + i * 0.25) % 1);
            const pulseRadius = interpolate(pulsePhase, [0, 1], [0, width * 0.14]) * eased;
            const pulseOpacity = interpolate(pulsePhase, [0, 0.4, 1], [0.5, 0.3, 0]) * eased;
            return (
              <circle
                key={`pulse-${i}-${pulseIndex}`}
                cx={ring.cx * width}
                cy={ring.cy * height}
                r={pulseRadius}
                fill="none"
                stroke={`hsl(${ring.hue},80%,65%)`}
                strokeWidth={2}
                opacity={pulseOpacity}
              />
            );
          });
        })}
      </svg>

      {/* Connection lines between cluster centers */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {PULSE_RINGS.map((ringA, i) =>
          PULSE_RINGS.slice(i + 1).map((ringB, j) => {
            const lineOpacity = interpolate(eased, [0.5, 1], [0, 0.15], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <line
                key={`conn-${i}-${j}`}
                x1={ringA.cx * width}
                y1={ringA.cy * height}
                x2={ringB.cx * width}
                y2={ringB.cy * height}
                stroke={`rgba(180,200,255,${lineOpacity})`}
                strokeWidth={1.5}
                strokeDasharray="12 8"
              />
            );
          })
        )}
      </svg>

      {/* Dots */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {DOTS.map((dot, i) => {
          const cluster = CLUSTER_CENTERS[dot.clusterIndex];
          const targetX = cluster.x + dot.offsetX;
          const targetY = cluster.y + dot.offsetY;

          const localProgress = Math.max(0, Math.min(1, (eased - dot.delay) / (1 - dot.delay)));
          const localEased = localProgress < 0.5
            ? 2 * localProgress * localProgress
            : 1 - Math.pow(-2 * localProgress + 2, 2) / 2;

          const cx = interpolate(localEased, [0, 1], [dot.startX * width, targetX * width]);
          const cy = interpolate(localEased, [0, 1], [dot.startY * height, targetY * height]);

          const sizeMultiplier = interpolate(localEased, [0, 0.5, 1], [1, 1.4, 1]);
          const r = dot.size * sizeMultiplier;

          const dotOpacity = interpolate(localEased, [0, 0.1], [0.5, 0.9]);

          return (
            <circle
              key={`dot-${i}`}
              cx={cx}
              cy={cy}
              r={r}
              fill={`hsl(${dot.hue},${dot.saturation}%,${dot.lightness}%)`}
              opacity={dotOpacity}
            />
          );
        })}
      </svg>

      {/* Cluster center orbs */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {PULSE_RINGS.map((ring, i) => {
          const orbRadius = interpolate(eased, [0, 1], [0, width * 0.025]);
          const innerRadius = orbRadius * 0.5;
          return (
            <g key={`orb-${i}`}>
              <radialGradient id={`orb-grad-${i}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={`hsl(${ring.hue},90%,90%)`} stopOpacity={0.95} />
                <stop offset="60%" stopColor={`hsl(${ring.hue},80%,60%)`} stopOpacity={0.8} />
                <stop offset="100%" stopColor={`hsl(${ring.hue},70%,30%)`} stopOpacity={0} />
              </radialGradient>
              <circle
                cx={ring.cx * width}
                cy={ring.cy * height}
                r={orbRadius}
                fill={`url(#orb-grad-${i})`}
              />
              <circle
                cx={ring.cx * width}
                cy={ring.cy * height}
                r={innerRadius}
                fill={`hsl(${ring.hue},90%,85%)`}
                opacity={0.9 * eased}
              />
            </g>
          );
        })}
      </svg>

      {/* Vignette overlay */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stopColor="transparent" stopOpacity={0} />
          <stop offset="100%" stopColor="#020208" stopOpacity={0.75} />
        </radialGradient>
        <rect x={0} y={0} width={width} height={height} fill="url(#vignette)" />
      </svg>
    </div>
  );
};