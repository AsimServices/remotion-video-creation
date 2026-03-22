import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface Snowflake {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  windFactor: number;
  opacity: number;
  rotationSpeed: number;
  depth: number;
  phaseOffset: number;
  swayAmplitude: number;
}

const generateSnowflakes = (count: number): Snowflake[] => {
  const flakes: Snowflake[] = [];
  for (let i = 0; i < count; i++) {
    const depth = Math.random();
    flakes.push({
      id: i,
      x: Math.random() * 120 - 10,
      y: Math.random() * 120 - 10,
      size: interpolateLinear(depth, [0, 1], [4, 22]),
      speed: interpolateLinear(depth, [0, 1], [0.3, 1.8]),
      windFactor: interpolateLinear(depth, [0, 1], [0.2, 1.2]),
      opacity: interpolateLinear(depth, [0, 1], [0.2, 0.95]),
      rotationSpeed: (Math.random() - 0.5) * 2,
      depth,
      phaseOffset: Math.random() * Math.PI * 2,
      swayAmplitude: interpolateLinear(depth, [0, 1], [0.3, 1.5]),
    });
  }
  return flakes;
};

function interpolateLinear(t: number, inputRange: [number, number], outputRange: [number, number]): number {
  const [inMin, inMax] = inputRange;
  const [outMin, outMax] = outputRange;
  const clamped = Math.max(inMin, Math.min(inMax, t));
  return outMin + ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin);
}

const SNOWFLAKES = generateSnowflakes(160);

const SnowflakePath: React.FC<{ size: number; rotation: number; opacity: number; depth: number }> = ({
  size,
  rotation,
  opacity,
  depth,
}) => {
  const arms = 6;
  const r = size / 2;
  const inner = r * 0.35;
  const branchLen = r * 0.4;
  const branchAngle = 30;

  const paths: string[] = [];

  for (let i = 0; i < arms; i++) {
    const angle = (i / arms) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const ex = cos * r;
    const ey = sin * r;
    paths.push(`M 0 0 L ${ex.toFixed(2)} ${ey.toFixed(2)}`);

    const midX = cos * (r * 0.55);
    const midY = sin * (r * 0.55);
    const perpAngle1 = angle + (branchAngle * Math.PI) / 180;
    const perpAngle2 = angle - (branchAngle * Math.PI) / 180;
    paths.push(`M ${midX.toFixed(2)} ${midY.toFixed(2)} L ${(midX + Math.cos(perpAngle1) * branchLen).toFixed(2)} ${(midY + Math.sin(perpAngle1) * branchLen).toFixed(2)}`);
    paths.push(`M ${midX.toFixed(2)} ${midY.toFixed(2)} L ${(midX + Math.cos(perpAngle2) * branchLen).toFixed(2)} ${(midY + Math.sin(perpAngle2) * branchLen).toFixed(2)}`);

    const nearX = cos * (r * 0.3);
    const nearY = sin * (r * 0.3);
    const nearLen = branchLen * 0.5;
    paths.push(`M ${nearX.toFixed(2)} ${nearY.toFixed(2)} L ${(nearX + Math.cos(perpAngle1) * nearLen).toFixed(2)} ${(nearY + Math.sin(perpAngle1) * nearLen).toFixed(2)}`);
    paths.push(`M ${nearX.toFixed(2)} ${nearY.toFixed(2)} L ${(nearX + Math.cos(perpAngle2) * nearLen).toFixed(2)} ${(nearY + Math.sin(perpAngle2) * nearLen).toFixed(2)}`);
  }

  const glowIntensity = interpolateLinear(depth, [0, 1], [0.3, 1]);
  const strokeWidth = interpolateLinear(depth, [0, 1], [0.4, 1.2]);

  return (
    <g transform={`rotate(${rotation})`} opacity={opacity}>
      <circle cx={0} cy={0} r={inner} fill="none" stroke={`rgba(200,220,255,${glowIntensity * 0.4})`} strokeWidth={strokeWidth * 2} />
      <circle cx={0} cy={0} r={inner * 0.5} fill={`rgba(220,235,255,${glowIntensity * 0.6})`} />
      {paths.map((d, idx) => (
        <path
          key={idx}
          d={d}
          stroke={`rgba(210,230,255,1)`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      <path
        d={paths[0]}
        stroke={`rgba(255,255,255,${glowIntensity * 0.5})`}
        strokeWidth={strokeWidth * 2.5}
        fill="none"
        strokeLinecap="round"
        style={{ filter: 'blur(1px)' }}
      />
    </g>
  );
};

export const SilverSnowflakesDrift: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const windWave = Math.sin(frame * 0.018) * 0.8 + Math.sin(frame * 0.007) * 1.2;

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 30% 40%, #0a0f1a 0%, #04080f 60%, #010305 100%)',
        overflow: 'hidden',
        position: 'relative',
        opacity: globalOpacity,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 70% 20%, rgba(30,50,90,0.4) 0%, transparent 60%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 20% 80%, rgba(10,30,60,0.3) 0%, transparent 50%)',
        }}
      />

      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0 }}
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          <filter id="glow-soft">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="bgGrad" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#0d1a2e" />
            <stop offset="100%" stopColor="#020508" />
          </radialGradient>
        </defs>

        {SNOWFLAKES.map((flake) => {
          const totalPixelsY = height * 1.3;
          const totalPixelsX = width * 0.4;
          const cycleFrames = totalPixelsY / (flake.speed * 0.8);

          const elapsed = (frame + flake.phaseOffset * (cycleFrames / (Math.PI * 2))) % cycleFrames;
          const progress = elapsed / cycleFrames;

          const baseY = -flake.size * 2 + progress * (height + flake.size * 4);
          const baseX = flake.x * (width / 100) + progress * totalPixelsX * flake.windFactor;

          const swayX = Math.sin(frame * 0.04 * flake.speed + flake.phaseOffset) * flake.swayAmplitude * 15;
          const windX = windWave * flake.windFactor * 12;

          const finalX = baseX + swayX + windX;
          const finalY = baseY;

          const rotation = frame * flake.rotationSpeed * 0.5 + flake.phaseOffset * 57;

          const filterAttr = flake.depth > 0.7 ? 'url(#glow-strong)' : flake.depth > 0.4 ? 'url(#glow-soft)' : undefined;

          return (
            <g
              key={flake.id}
              transform={`translate(${finalX.toFixed(1)}, ${finalY.toFixed(1)})`}
              filter={filterAttr}
            >
              <SnowflakePath
                size={flake.size}
                rotation={rotation}
                opacity={flake.opacity}
                depth={flake.depth}
              />
            </g>
          );
        })}
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,5,15,0.6) 0%, transparent 15%, transparent 85%, rgba(0,5,15,0.8) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};