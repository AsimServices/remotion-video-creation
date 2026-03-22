import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const GoldLowPolyMesh: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const cols = 18;
  const rows = 10;
  const cellW = width / cols;
  const cellH = height / rows;

  const getHeight = (x: number, y: number, t: number): number => {
    const nx = x / cols;
    const ny = y / rows;
    const wave1 = Math.sin(nx * Math.PI * 2.5 + t * 0.8) * Math.cos(ny * Math.PI * 1.8 + t * 0.5);
    const wave2 = Math.sin(nx * Math.PI * 1.3 - t * 0.6 + ny * Math.PI * 2.1) * 0.6;
    const wave3 = Math.cos((nx + ny) * Math.PI * 3.2 + t * 1.1) * 0.3;
    return (wave1 + wave2 + wave3) / 1.9;
  };

  const t = frame * 0.025;

  const getColor = (h: number, brightness: number): string => {
    const base = 0.5 + h * 0.5;
    const r = Math.floor(interpolate(base, [0, 0.3, 0.6, 1], [60, 120, 200, 255]) * brightness);
    const g = Math.floor(interpolate(base, [0, 0.3, 0.6, 1], [30, 80, 140, 200]) * brightness);
    const b = Math.floor(interpolate(base, [0, 0.3, 0.6, 1], [0, 10, 20, 50]) * brightness);
    return `rgb(${Math.min(255, r)},${Math.min(255, g)},${Math.min(255, b)})`;
  };

  const triangles: React.ReactNode[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const jitter = (seed: number) => (Math.sin(seed * 127.1 + 311.7) * 0.5 + 0.5) * 0.3 - 0.15;

      const getPoint = (cx: number, cy: number) => {
        const hVal = getHeight(cx, cy, t);
        const px = cx * cellW + jitter(cx * 100 + cy) * cellW;
        const py = cy * cellH + jitter(cx * 200 + cy) * cellH + hVal * 40;
        return { x: px, y: py, h: hVal };
      };

      const p00 = getPoint(col, row);
      const p10 = getPoint(col + 1, row);
      const p01 = getPoint(col, row + 1);
      const p11 = getPoint(col + 1, row + 1);

      const avgH1 = (p00.h + p10.h + p11.h) / 3;
      const avgH2 = (p00.h + p11.h + p01.h) / 3;

      const dx1 = p10.x - p00.x;
      const dy1 = p10.y - p00.y;
      const dx2 = p11.x - p00.x;
      const dy2 = p11.y - p00.y;
      const cross1 = dx1 * dy2 - dy1 * dx2;
      const brightness1 = Math.max(0.3, Math.min(1.0, 0.65 + cross1 / 80000));

      const dx3 = p11.x - p00.x;
      const dy3 = p11.y - p00.y;
      const dx4 = p01.x - p00.x;
      const dy4 = p01.y - p00.y;
      const cross2 = dx3 * dy4 - dy3 * dx4;
      const brightness2 = Math.max(0.3, Math.min(1.0, 0.65 - cross2 / 80000));

      const color1 = getColor(avgH1, brightness1);
      const color2 = getColor(avgH2, brightness2);

      const strokeOpacity1 = interpolate(brightness1, [0.3, 1.0], [0.05, 0.25]);
      const strokeOpacity2 = interpolate(brightness2, [0.3, 1.0], [0.05, 0.25]);

      triangles.push(
        <polygon
          key={`t1-${row}-${col}`}
          points={`${p00.x},${p00.y} ${p10.x},${p10.y} ${p11.x},${p11.y}`}
          fill={color1}
          stroke={`rgba(255,220,80,${strokeOpacity1})`}
          strokeWidth={0.6}
        />
      );

      triangles.push(
        <polygon
          key={`t2-${row}-${col}`}
          points={`${p00.x},${p00.y} ${p11.x},${p11.y} ${p01.x},${p01.y}`}
          fill={color2}
          stroke={`rgba(255,220,80,${strokeOpacity2})`}
          strokeWidth={0.6}
        />
      );
    }
  }

  const shimmerX = interpolate(frame, [0, durationInFrames], [-width * 0.5, width * 1.5]);

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: '#0a0804',
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
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#1a1005" />
            <stop offset="100%" stopColor="#050302" />
          </radialGradient>
          <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,220,80,0)" />
            <stop offset="50%" stopColor="rgba(255,220,80,0.06)" />
            <stop offset="100%" stopColor="rgba(255,220,80,0)" />
          </linearGradient>
        </defs>
        <rect width={width} height={height} fill="url(#bgGlow)" />
        {triangles}
        <rect
          x={shimmerX}
          y={0}
          width={width * 0.4}
          height={height}
          fill="url(#shimmer)"
          style={{ mixBlendMode: 'screen' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(5,3,2,0.6) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};