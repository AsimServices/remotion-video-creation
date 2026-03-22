import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface Blip {
  id: number;
  angle: number;
  distance: number;
  size: number;
  spawnFrame: number;
}

const blips: Blip[] = [
  { id: 1, angle: 0.45, distance: 0.3, size: 6, spawnFrame: 20 },
  { id: 2, angle: 1.1, distance: 0.6, size: 4, spawnFrame: 45 },
  { id: 3, angle: 2.3, distance: 0.45, size: 7, spawnFrame: 80 },
  { id: 4, angle: 3.7, distance: 0.7, size: 5, spawnFrame: 110 },
  { id: 5, angle: 4.9, distance: 0.25, size: 8, spawnFrame: 150 },
  { id: 6, angle: 0.9, distance: 0.5, size: 4, spawnFrame: 190 },
  { id: 7, angle: 5.5, distance: 0.6, size: 6, spawnFrame: 230 },
  { id: 8, angle: 2.8, distance: 0.35, size: 5, spawnFrame: 270 },
  { id: 9, angle: 1.6, distance: 0.75, size: 7, spawnFrame: 310 },
  { id: 10, angle: 4.2, distance: 0.55, size: 4, spawnFrame: 350 },
  { id: 11, angle: 3.0, distance: 0.4, size: 6, spawnFrame: 390 },
  { id: 12, angle: 0.2, distance: 0.65, size: 5, spawnFrame: 430 },
  { id: 13, angle: 5.1, distance: 0.3, size: 7, spawnFrame: 470 },
  { id: 14, angle: 2.0, distance: 0.8, size: 4, spawnFrame: 510 },
];

export const RadarSweep: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) * 0.42;

  const sweepAngle = ((frame / 90) * Math.PI * 2) % (Math.PI * 2);

  const numRings = 4;
  const rings = Array.from({ length: numRings }, (_, i) => (i + 1) / numRings);

  const numSpokes = 12;
  const spokes = Array.from({ length: numSpokes }, (_, i) => (i / numSpokes) * Math.PI * 2);

  const trailLength = Math.PI * 0.6;

  const getSweepPath = () => {
    const trailSteps = 60;
    const paths = [];
    for (let i = 0; i <= trailSteps; i++) {
      const t = i / trailSteps;
      const angle = sweepAngle - trailLength * (1 - t);
      const x1 = cx;
      const y1 = cy;
      const x2 = cx + Math.cos(angle) * maxRadius;
      const y2 = cy + Math.sin(angle) * maxRadius;
      const alpha = t * 0.55;
      paths.push(
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={`rgba(0, 255, 80, ${alpha})`}
          strokeWidth={1.5}
        />
      );
    }
    return paths;
  };

  const getBlipOpacity = (blip: Blip) => {
    const framesPerRevolution = 90;
    const blipAngle = blip.angle;

    let angleDiff = (sweepAngle - blipAngle) % (Math.PI * 2);
    if (angleDiff < 0) angleDiff += Math.PI * 2;

    if (frame < blip.spawnFrame) return 0;

    const glowDuration = 1.5;
    const glow = Math.max(0, 1 - (angleDiff / (Math.PI * 2)) * glowDuration);
    return glow;
  };

  const scanLineX = cx + Math.cos(sweepAngle) * maxRadius;
  const scanLineY = cy + Math.sin(sweepAngle) * maxRadius;

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at center, #040d08 0%, #010503 60%, #000200 100%)',
        position: 'relative',
        overflow: 'hidden',
        opacity,
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,255,80,0.04)" />
            <stop offset="70%" stopColor="rgba(0,255,80,0.02)" />
            <stop offset="100%" stopColor="rgba(0,255,80,0)" />
          </radialGradient>
          <filter id="greenGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="blipGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="sweepGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background radar fill */}
        <circle cx={cx} cy={cy} r={maxRadius} fill="url(#radarGlow)" />
        <circle cx={cx} cy={cy} r={maxRadius} fill="none" stroke="rgba(0,255,80,0.15)" strokeWidth={1.5} />

        {/* Grid rings */}
        {rings.map((r, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={maxRadius * r}
            fill="none"
            stroke="rgba(0,255,80,0.12)"
            strokeWidth={1}
            strokeDasharray="4 6"
          />
        ))}

        {/* Spoke lines */}
        {spokes.map((angle, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * maxRadius}
            y2={cy + Math.sin(angle) * maxRadius}
            stroke="rgba(0,255,80,0.08)"
            strokeWidth={1}
          />
        ))}

        {/* Sweep trail */}
        <g filter="url(#sweepGlow)">
          {getSweepPath()}
        </g>

        {/* Sweep leading line */}
        <line
          x1={cx}
          y1={cy}
          x2={scanLineX}
          y2={scanLineY}
          stroke="rgba(0,255,120,0.9)"
          strokeWidth={2}
          filter="url(#greenGlow)"
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={5} fill="rgba(0,255,80,0.9)" filter="url(#greenGlow)" />
        <circle cx={cx} cy={cy} r={2} fill="white" />

        {/* Blips */}
        {blips.map((blip) => {
          const blipX = cx + Math.cos(blip.angle) * maxRadius * blip.distance;
          const blipY = cy + Math.sin(blip.angle) * maxRadius * blip.distance;
          const blipOpacity = getBlipOpacity(blip);

          if (blipOpacity <= 0) return null;

          return (
            <g key={blip.id} filter="url(#blipGlow)">
              {/* Outer glow ring */}
              <circle
                cx={blipX}
                cy={blipY}
                r={blip.size * 2.5}
                fill="none"
                stroke={`rgba(0,255,80,${blipOpacity * 0.4})`}
                strokeWidth={1.5}
              />
              {/* Inner glow */}
              <circle
                cx={blipX}
                cy={blipY}
                r={blip.size * 1.4}
                fill={`rgba(0,255,80,${blipOpacity * 0.3})`}
              />
              {/* Core blip */}
              <circle
                cx={blipX}
                cy={blipY}
                r={blip.size * 0.7}
                fill={`rgba(160,255,180,${blipOpacity * 0.95})`}
              />
            </g>
          );
        })}

        {/* Corner decorations */}
        {[
          { x: cx - maxRadius * 0.72, y: cy - maxRadius * 0.72 },
          { x: cx + maxRadius * 0.72, y: cy - maxRadius * 0.72 },
          { x: cx - maxRadius * 0.72, y: cy + maxRadius * 0.72 },
          { x: cx + maxRadius * 0.72, y: cy + maxRadius * 0.72 },
        ].map((pos, i) => (
          <g key={i}>
            <line
              x1={pos.x - 12} y1={pos.y} x2={pos.x + 12} y2={pos.y}
              stroke="rgba(0,255,80,0.3)" strokeWidth={1}
            />
            <line
              x1={pos.x} y1={pos.y - 12} x2={pos.x} y2={pos.y + 12}
              stroke="rgba(0,255,80,0.3)" strokeWidth={1}
            />
          </g>
        ))}

        {/* Outer border decoration */}
        <rect
          x={cx - maxRadius - 20}
          y={cy - maxRadius - 20}
          width={(maxRadius + 20) * 2}
          height={(maxRadius + 20) * 2}
          rx={8}
          fill="none"
          stroke="rgba(0,255,80,0.06)"
          strokeWidth={1}
        />
      </svg>
    </div>
  );
};