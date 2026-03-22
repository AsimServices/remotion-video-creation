import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface Star {
  id: number;
  angle: number;
  baseRadius: number;
  speed: number;
  size: number;
  colorHue: number;
  offset: number;
}

const NUM_STARS = 300;

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}

const stars: Star[] = Array.from({ length: NUM_STARS }, (_, i) => ({
  id: i,
  angle: seededRandom(i * 7.1) * Math.PI * 2,
  baseRadius: seededRandom(i * 3.3) * 0.15 + 0.02,
  speed: seededRandom(i * 5.7) * 0.6 + 0.4,
  size: seededRandom(i * 2.9) * 2.5 + 0.5,
  colorHue: seededRandom(i * 11.3) * 60 + 180,
  offset: seededRandom(i * 4.1) * 600,
}));

export const StarfieldWarpSpeed: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const warpProgress = interpolate(
    frame,
    [0, durationInFrames * 0.3, durationInFrames * 0.7, durationInFrames],
    [0, 0.4, 0.9, 1.0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const cx = width / 2;
  const cy = height / 2;
  const maxDim = Math.sqrt(cx * cx + cy * cy) * 1.1;

  const warpGlow = interpolate(warpProgress, [0, 0.5, 1], [0, 0.3, 0.7]);

  return (
    <div
      style={{
        width,
        height,
        background: 'black',
        overflow: 'hidden',
        position: 'relative',
        opacity: globalOpacity,
      }}
    >
      {/* Deep space radial gradient background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, 
            rgba(10, 5, 40, 1) 0%, 
            rgba(5, 2, 20, 1) 40%, 
            rgba(0, 0, 5, 1) 100%)`,
        }}
      />

      {/* Central warp core glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, 
            rgba(100, 160, 255, ${warpGlow * 0.4}) 0%,
            rgba(60, 100, 220, ${warpGlow * 0.2}) 15%,
            rgba(20, 40, 120, ${warpGlow * 0.1}) 35%,
            transparent 60%)`,
        }}
      />

      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0 }}
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`rgba(180,210,255,${warpGlow * 0.9})`} />
            <stop offset="40%" stopColor={`rgba(80,130,255,${warpGlow * 0.5})`} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        {stars.map((star) => {
          const t = ((frame + star.offset) * star.speed * 0.008 * (1 + warpProgress * 5)) % 1;
          const eased = Math.pow(t, 1.5 + warpProgress * 1.5);

          const startRadius = star.baseRadius * maxDim * 0.1;
          const endRadius = maxDim * 1.2;
          const currentRadius = startRadius + eased * (endRadius - startRadius);

          const x = cx + Math.cos(star.angle) * currentRadius;
          const y = cy + Math.sin(star.angle) * currentRadius;

          const streakLength = interpolate(
            warpProgress,
            [0, 0.3, 0.7, 1],
            [2, 15, 60, 120]
          ) * star.speed * (0.5 + eased * 2);

          const prevRadius = Math.max(0, currentRadius - streakLength);
          const x1 = cx + Math.cos(star.angle) * prevRadius;
          const y1 = cy + Math.sin(star.angle) * prevRadius;

          const brightness = interpolate(eased, [0, 0.3, 0.7, 1], [0.1, 0.7, 1.0, 1.0]);
          const alpha = interpolate(eased, [0, 0.05, 0.85, 1], [0, 1, 1, 0]);
          const strokeWidth = star.size * (0.3 + eased * 1.5) * (1 + warpProgress * 1.5);

          const r = Math.round(interpolate(star.colorHue, [180, 240], [100, 150]));
          const g = Math.round(interpolate(star.colorHue, [180, 240], [200, 180]));
          const b = 255;

          const gradId = `sg${star.id}`;

          return (
            <g key={star.id}>
              <defs>
                <linearGradient id={gradId} x1={x1} y1={y1} x2={x} y2={y} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={`rgba(${r},${g},${b},0)`} />
                  <stop offset="60%" stopColor={`rgba(${r},${g},${b},${alpha * brightness * 0.4})`} />
                  <stop offset="100%" stopColor={`rgba(${r},${g},${b},${alpha * brightness})`} />
                </linearGradient>
              </defs>
              <line
                x1={x1}
                y1={y1}
                x2={x}
                y2={y}
                stroke={`url(#${gradId})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              {/* Star head glow */}
              <circle
                cx={x}
                cy={y}
                r={strokeWidth * 1.2}
                fill={`rgba(${r},${g},${b},${alpha * brightness * 0.9})`}
                style={{ filter: 'blur(0.5px)' }}
              />
            </g>
          );
        })}

        {/* Central warp core */}
        <circle
          cx={cx}
          cy={cy}
          r={interpolate(warpProgress, [0, 0.5, 1], [3, 20, 8])}
          fill={`url(#coreGlow)`}
          opacity={warpGlow}
        />
        <circle
          cx={cx}
          cy={cy}
          r={interpolate(warpProgress, [0, 0.5, 1], [1, 8, 3])}
          fill={`rgba(220,235,255,${warpGlow})`}
        />
      </svg>

      {/* Vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, 
            transparent 30%, 
            rgba(0,0,0,0.3) 70%, 
            rgba(0,0,0,0.7) 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Speed lines overlay at high warp */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: warpProgress * 0.15,
          background: `repeating-conic-gradient(
            from 0deg at 50% 50%,
            rgba(100,150,255,0.03) 0deg,
            transparent 1deg,
            transparent 3deg,
            rgba(100,150,255,0.03) 4deg
          )`,
        }}
      />
    </div>
  );
};