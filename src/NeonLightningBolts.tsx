import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface LightningSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  depth: number;
}

function generateLightning(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  depth: number,
  seed: number,
  segments: LightningSegment[]
) {
  if (depth === 0) {
    segments.push({ x1, y1, x2, y2, width: 1, depth });
    return;
  }

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);

  const pseudoRandom = (Math.sin(seed * 127.1 + depth * 311.7) * 43758.5453) % 1;
  const perpX = -dy / len;
  const perpY = dx / len;
  const offset = (pseudoRandom - 0.5) * len * 0.5;

  const newMidX = midX + perpX * offset;
  const newMidY = midY + perpY * offset;

  segments.push({ x1, y1, x2: newMidX, y2: newMidY, width: depth * 0.8, depth });
  segments.push({ x1: newMidX, y1: newMidY, x2, y2, width: depth * 0.8, depth });

  generateLightning(x1, y1, newMidX, newMidY, depth - 1, seed + 1.3, segments);
  generateLightning(newMidX, newMidY, x2, y2, depth - 1, seed + 2.7, segments);

  if (depth > 2) {
    const branchRand = (Math.sin(seed * 91.3 + depth * 421.7) * 43758.5453) % 1;
    if (Math.abs(branchRand) > 0.4) {
      const branchLen = len * 0.4;
      const branchAngle = (branchRand > 0 ? 1 : -1) * 0.6;
      const cos = Math.cos(branchAngle);
      const sin = Math.sin(branchAngle);
      const ndx = dx / len;
      const ndy = dy / len;
      const branchDX = (ndx * cos - ndy * sin) * branchLen;
      const branchDY = (ndx * sin + ndy * cos) * branchLen;
      generateLightning(
        newMidX, newMidY,
        newMidX + branchDX, newMidY + branchDY,
        depth - 2, seed + 5.1, segments
      );
    }
  }
}

export const NeonLightningBolts: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const boltConfigs = [
    { startX: width * 0.2, endX: width * 0.35, color: '#00ffff', glowColor: '#00ccff', seed: 42 },
    { startX: width * 0.5, endX: width * 0.6, color: '#ff00ff', glowColor: '#cc00ff', seed: 77 },
    { startX: width * 0.75, endX: width * 0.85, color: '#ffff00', glowColor: '#ffaa00', seed: 123 },
    { startX: width * 0.1, endX: width * 0.25, color: '#00ff88', glowColor: '#00cc66', seed: 55 },
    { startX: width * 0.6, endX: width * 0.9, color: '#ff4488', glowColor: '#ff0066', seed: 99 },
  ];

  const bolts = boltConfigs.map((config, boltIndex) => {
    const cycleLength = 18 + boltIndex * 7;
    const cycleFrame = frame % cycleLength;
    const flickerPhase = Math.sin(frame * 0.8 + boltIndex * 2.3);
    const isVisible = cycleFrame < cycleLength * 0.7;
    const seedOffset = Math.floor(frame / cycleLength) * 100 + boltIndex * 200;

    const startY = height * 0.05;
    const endY = height * 0.85 + boltIndex * height * 0.02;
    const startX = config.startX + Math.sin(frame * 0.05 + boltIndex) * 30;
    const endX = config.endX + Math.cos(frame * 0.04 + boltIndex * 1.5) * 20;

    const segments: LightningSegment[] = [];
    generateLightning(startX, startY, endX, endY, 6, config.seed + seedOffset, segments);

    const flickerOpacity = isVisible ? (0.7 + flickerPhase * 0.3) : 0;

    return { segments, color: config.color, glowColor: config.glowColor, flickerOpacity };
  });

  const sparkCount = 30;
  const sparks = Array.from({ length: sparkCount }, (_, i) => {
    const sparkSeed = i * 137.5 + frame * 0.3;
    const x = (Math.sin(sparkSeed * 0.7) * 0.5 + 0.5) * width;
    const y = (Math.cos(sparkSeed * 1.3) * 0.5 + 0.5) * height;
    const sparkOpacity = (Math.sin(sparkSeed * 2.1 + frame * 0.5) * 0.5 + 0.5);
    const size = 2 + Math.abs(Math.sin(sparkSeed)) * 4;
    const colorIndex = i % 3;
    const colors = ['#00ffff', '#ff00ff', '#00ff88'];
    return { x, y, sparkOpacity, size, color: colors[colorIndex] };
  });

  return (
    <div style={{ width, height, background: '#000005', opacity, position: 'relative', overflow: 'hidden' }}>
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          {bolts.map((bolt, i) => (
            <React.Fragment key={`filter-${i}`}>
              <filter id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id={`outerGlow-${i}`} x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="12" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </React.Fragment>
          ))}
          <filter id="sparkGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {bolts.map((bolt, boltIndex) =>
          bolt.segments.map((seg, segIndex) => (
            <React.Fragment key={`bolt-${boltIndex}-seg-${segIndex}`}>
              <line
                x1={seg.x1} y1={seg.y1}
                x2={seg.x2} y2={seg.y2}
                stroke={bolt.glowColor}
                strokeWidth={(seg.width + 1) * 6}
                opacity={bolt.flickerOpacity * 0.15}
                filter={`url(#outerGlow-${boltIndex})`}
                strokeLinecap="round"
              />
              <line
                x1={seg.x1} y1={seg.y1}
                x2={seg.x2} y2={seg.y2}
                stroke={bolt.color}
                strokeWidth={(seg.width + 1) * 2.5}
                opacity={bolt.flickerOpacity * 0.6}
                filter={`url(#glow-${boltIndex})`}
                strokeLinecap="round"
              />
              <line
                x1={seg.x1} y1={seg.y1}
                x2={seg.x2} y2={seg.y2}
                stroke="#ffffff"
                strokeWidth={Math.max(seg.width * 0.5, 0.5)}
                opacity={bolt.flickerOpacity * 0.9}
                strokeLinecap="round"
              />
            </React.Fragment>
          ))
        )}

        {sparks.map((spark, i) => (
          <circle
            key={`spark-${i}`}
            cx={spark.x}
            cy={spark.y}
            r={spark.size}
            fill={spark.color}
            opacity={spark.sparkOpacity * 0.8}
            filter="url(#sparkGlow)"
          />
        ))}
      </svg>
    </div>
  );
};