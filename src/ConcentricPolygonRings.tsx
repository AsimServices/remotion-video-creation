import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const ConcentricPolygonRings: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2;

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const rings = [
    { sides: 3, radius: 80,  speed: 0.8,  color: '#ff00ff', phase: 0 },
    { sides: 4, radius: 140, speed: -0.6, color: '#00ffff', phase: Math.PI / 4 },
    { sides: 5, radius: 200, speed: 0.5,  color: '#ff6600', phase: 0 },
    { sides: 6, radius: 260, speed: -0.4, color: '#00ff88', phase: Math.PI / 6 },
    { sides: 7, radius: 320, speed: 0.35, color: '#ff0088', phase: 0 },
    { sides: 8, radius: 380, speed: -0.3, color: '#88ff00', phase: Math.PI / 8 },
    { sides: 9, radius: 440, speed: 0.25, color: '#0088ff', phase: 0 },
    { sides: 10, radius: 500, speed: -0.2, color: '#ffcc00', phase: Math.PI / 10 },
  ];

  const getPolygonPoints = (sides: number, radius: number, rotation: number): string => {
    const points: string[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides + rotation;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  const t = frame / 30;

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: '#050508',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, opacity }}
      >
        <defs>
          {rings.map((ring, i) => (
            <filter key={`filter-${i}`} id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur1" />
              <feGaussianBlur stdDeviation="12" result="blur2" />
              <feGaussianBlur stdDeviation="20" result="blur3" />
              <feMerge>
                <feMergeNode in="blur3" />
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0a0a1a" />
            <stop offset="100%" stopColor="#050508" />
          </radialGradient>
        </defs>

        <rect width={width} height={height} fill="url(#bgGrad)" />

        {/* Subtle background pulse */}
        {rings.map((ring, i) => {
          const pulseOpacity = interpolate(
            Math.sin(t * ring.speed * 0.5 + ring.phase),
            [-1, 1],
            [0.02, 0.06]
          );
          const rotation = t * ring.speed + ring.phase;
          const points = getPolygonPoints(ring.sides, ring.radius * 1.05, rotation);
          return (
            <polygon
              key={`bg-${i}`}
              points={points}
              fill={ring.color}
              stroke="none"
              opacity={pulseOpacity}
            />
          );
        })}

        {/* Main rings */}
        {rings.map((ring, i) => {
          const rotation = t * ring.speed + ring.phase;
          const points = getPolygonPoints(ring.sides, ring.radius, rotation);

          const pulseRadius = ring.radius + 8 * Math.sin(t * 1.5 + i);
          const pulsePoints = getPolygonPoints(ring.sides, pulseRadius, rotation);

          const strokeWidth = interpolate(
            Math.sin(t * 0.8 + i * 0.7),
            [-1, 1],
            [1.5, 3.5]
          );

          const glowOpacity = interpolate(
            Math.sin(t * 0.6 + i),
            [-1, 1],
            [0.6, 1.0]
          );

          return (
            <g key={`ring-${i}`}>
              {/* Glow layer */}
              <polygon
                points={pulsePoints}
                fill="none"
                stroke={ring.color}
                strokeWidth={strokeWidth + 6}
                opacity={glowOpacity * 0.3}
                filter={`url(#glow-${i})`}
              />
              {/* Main stroke */}
              <polygon
                points={points}
                fill="none"
                stroke={ring.color}
                strokeWidth={strokeWidth}
                opacity={glowOpacity}
                strokeLinejoin="round"
              />
              {/* Inner highlight */}
              <polygon
                points={getPolygonPoints(ring.sides, ring.radius * 0.97, rotation)}
                fill="none"
                stroke="white"
                strokeWidth={0.5}
                opacity={glowOpacity * 0.2}
              />
            </g>
          );
        })}

        {/* Center orb */}
        <circle cx={cx} cy={cy} r={40} fill="#050508" />
        <circle
          cx={cx}
          cy={cy}
          r={30 + 5 * Math.sin(t * 2)}
          fill="none"
          stroke="#ffffff"
          strokeWidth={1}
          opacity={0.15}
        />
        <circle
          cx={cx}
          cy={cy}
          r={15 + 3 * Math.sin(t * 3)}
          fill="#ffffff"
          opacity={0.05 + 0.05 * Math.sin(t * 2)}
          filter="url(#glow-0)"
        />
        {rings.slice(0, 3).map((ring, i) => (
          <circle
            key={`spoke-${i}`}
            cx={cx}
            cy={cy}
            r={8}
            fill={ring.color}
            opacity={0.6 + 0.4 * Math.sin(t * 2 + i)}
            filter={`url(#glow-${i})`}
          />
        ))}
      </svg>
    </div>
  );
};