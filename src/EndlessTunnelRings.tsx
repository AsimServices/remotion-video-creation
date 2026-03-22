import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const EndlessTunnelRings: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const fadeOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0]
  );

  const numRings = 12;
  const travelFrames = 180;
  const spacing = travelFrames / numRings;

  const rings = Array.from({ length: numRings }).map((_, i) => {
    const rawProgress = (frame - i * spacing) % travelFrames;
    const ringProgress = rawProgress < 0 ? rawProgress + travelFrames : rawProgress;
    const norm = ringProgress / travelFrames;

    const scale = interpolate(norm, [0, 1], [0.2, 4]);
    const opacity = interpolate(norm, [0, 0.8, 1], [0, 0.8, 0]);
    const rotation = interpolate(norm, [0, 1], [0, 360]);

    const baseSize = Math.min(width, height) * 0.8;
    const radius = baseSize / 2;

    return (
      <svg
        key={i}
        width={width}
        height={height}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: `translate(${width / 2}px, ${height / 2}px) rotate(${rotation}deg) scale(${scale}) translate(-${radius}px, -${radius}px)`,
          opacity,
          pointerEvents: 'none',
        }}
      >
        <circle
          cx={radius}
          cy={radius}
          r={radius * 0.9}
          fill="none"
          stroke="rgba(0,255,200,0.8)"
          strokeWidth={4}
        />
      </svg>
    );
  });

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: '#030303',
        overflow: 'hidden',
        position: 'relative',
        opacity: fadeOpacity,
      }}
    >
      {rings}
    </div>
  );
};