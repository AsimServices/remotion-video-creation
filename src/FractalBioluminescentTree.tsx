import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface Branch {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  depth: number;
  angle: number;
  length: number;
  birthFrame: number;
  id: string;
}

const generateBranches = (
  x: number,
  y: number,
  angle: number,
  length: number,
  depth: number,
  maxDepth: number,
  parentId: string,
  birthFrame: number,
  framesPerLevel: number
): Branch[] => {
  if (depth > maxDepth || length < 2) return [];

  const rad = (angle * Math.PI) / 180;
  const x2 = x + Math.cos(rad) * length;
  const y2 = y + Math.sin(rad) * length;
  const id = `${parentId}-${depth}`;

  const branch: Branch = { x1: x, y1: y, x2, y2, depth, angle, length, birthFrame, id };

  const nextBirth = birthFrame + framesPerLevel;
  const leftBranches = generateBranches(x2, y2, angle - 25, length * 0.72, depth + 1, maxDepth, `${id}L`, nextBirth, framesPerLevel);
  const rightBranches = generateBranches(x2, y2, angle + 20, length * 0.68, depth + 1, maxDepth, `${id}R`, nextBirth, framesPerLevel);

  return [branch, ...leftBranches, ...rightBranches];
};

export const FractalBioluminescentTree: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const maxDepth = 10;
  const framesPerLevel = 18;

  const branches = React.useMemo(() => {
    return generateBranches(width / 2, height, -90, 160, 0, maxDepth, 'root', 0, framesPerLevel);
  }, [width, height]);

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const getColor = (depth: number): string => {
    const colors = [
      '#00ffcc', '#00e5ff', '#00bfff', '#1aff8c', '#66ffdd',
      '#00ffaa', '#33ccff', '#80ffee', '#00ff99', '#40e0d0',
      '#7fffff',
    ];
    return colors[depth % colors.length];
  };

  const getGlowColor = (depth: number): string => {
    const colors = [
      '#00ffcc', '#00e5ff', '#00bfff', '#1aff8c', '#66ffdd',
      '#00ffaa', '#33ccff', '#80ffee', '#00ff99', '#40e0d0',
      '#7fffff',
    ];
    return colors[depth % colors.length];
  };

  return (
    <div style={{ width, height, background: '#020810', position: 'relative', overflow: 'hidden', opacity: globalOpacity }}>
      {/* Deep background glow */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 600,
        height: 400,
        background: 'radial-gradient(ellipse at center bottom, rgba(0,255,180,0.06) 0%, transparent 70%)',
        borderRadius: '50%',
      }} />

      {/* Ambient particles */}
      {Array.from({ length: 60 }).map((_, i) => {
        const px = ((i * 137.5 + 50) % width);
        const py = ((i * 97.3 + 30) % height);
        const pulse = Math.sin(frame * 0.05 + i * 0.8) * 0.5 + 0.5;
        const size = 1.5 + pulse * 2;
        const opacity = 0.2 + pulse * 0.4;
        return (
          <div
            key={`particle-${i}`}
            style={{
              position: 'absolute',
              left: px,
              top: py,
              width: size,
              height: size,
              borderRadius: '50%',
              background: '#00ffcc',
              opacity,
              boxShadow: `0 0 ${size * 3}px #00ffcc`,
            }}
          />
        );
      })}

      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          {branches.map((branch) => {
            const filterId = `glow-${branch.depth}`;
            return null; // define once below
          })}
          {Array.from({ length: maxDepth + 1 }).map((_, d) => (
            <filter key={`filter-${d}`} id={`glow-${d}`} x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation={Math.max(1, 8 - d * 0.6)} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <filter id="superGlow" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {branches.map((branch) => {
          const growStart = branch.birthFrame;
          const growEnd = branch.birthFrame + framesPerLevel * 0.8;

          if (frame < growStart) return null;

          const growProgress = interpolate(frame, [growStart, growEnd], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const currentX2 = branch.x1 + (branch.x2 - branch.x1) * growProgress;
          const currentY2 = branch.y1 + (branch.y2 - branch.y1) * growProgress;

          const strokeWidth = Math.max(0.3, (maxDepth - branch.depth + 1) * 0.9);
          const color = getColor(branch.depth);
          const glowColor = getGlowColor(branch.depth);

          const pulseOffset = Math.sin(frame * 0.04 + branch.depth * 0.5 + branch.x1 * 0.01) * 0.3 + 0.7;
          const opacity = pulseOffset * (0.5 + (1 - branch.depth / maxDepth) * 0.5);

          return (
            <g key={branch.id}>
              {/* Outer glow layer */}
              <line
                x1={branch.x1}
                y1={branch.y1}
                x2={currentX2}
                y2={currentY2}
                stroke={glowColor}
                strokeWidth={strokeWidth * 4}
                strokeLinecap="round"
                opacity={opacity * 0.15}
                filter={`url(#glow-${Math.min(branch.depth, maxDepth)})`}
              />
              {/* Mid glow layer */}
              <line
                x1={branch.x1}
                y1={branch.y1}
                x2={currentX2}
                y2={currentY2}
                stroke={glowColor}
                strokeWidth={strokeWidth * 2}
                strokeLinecap="round"
                opacity={opacity * 0.4}
                filter={`url(#glow-${Math.min(branch.depth, maxDepth)})`}
              />
              {/* Core bright line */}
              <line
                x1={branch.x1}
                y1={branch.y1}
                x2={currentX2}
                y2={currentY2}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                opacity={opacity}
              />
            </g>
          );
        })}

        {/* Tip sparkles at growing ends */}
        {branches.map((branch) => {
          const growStart = branch.birthFrame;
          const growEnd = branch.birthFrame + framesPerLevel * 0.8;
          if (frame < growStart || frame > growEnd + 10) return null;

          const growProgress = interpolate(frame, [growStart, growEnd], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const currentX2 = branch.x1 + (branch.x2 - branch.x1) * growProgress;
          const currentY2 = branch.y1 + (branch.y2 - branch.y1) * growProgress;
          const tipGlow = interpolate(frame, [growStart, growEnd, growEnd + 10], [0, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const color = getColor(branch.depth);
          const r = (3 + (maxDepth - branch.depth) * 0.5) * tipGlow;

          return (
            <circle
              key={`tip-${branch.id}`}
              cx={currentX2}
              cy={currentY2}
              r={r}
              fill={color}
              opacity={tipGlow * 0.9}
              filter="url(#superGlow)"
            />
          );
        })}
      </svg>

      {/* Fog overlay at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 200,
        background: 'linear-gradient(to top, #020810 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};