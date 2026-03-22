import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const NeonRainBars: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const neonColors = [
    '#00ffff', '#ff00ff', '#00ff88', '#ff6600', '#ff0066',
    '#66ff00', '#0066ff', '#ffff00', '#ff3399', '#00ccff',
    '#ff9900', '#33ff33', '#cc00ff', '#ff6666', '#00ffcc',
  ];

  const numColumns = 48;
  const columnWidth = width / numColumns;

  const columns = Array.from({ length: numColumns }, (_, colIndex) => {
    const seed = colIndex * 137.508 + 42;
    const pseudoRandom = (n: number) => ((Math.sin(n * 9301 + 49297) * 233280) % 1 + 1) % 1;

    const numBars = 4 + Math.floor(pseudoRandom(seed) * 5);
    const colorIndex = Math.floor(pseudoRandom(seed + 1) * neonColors.length);
    const color = neonColors[colorIndex];
    const speed = 1.5 + pseudoRandom(seed + 2) * 3.5;
    const barHeightRatio = 0.05 + pseudoRandom(seed + 3) * 0.25;
    const barHeight = height * barHeightRatio;
    const offset = pseudoRandom(seed + 4) * height * 2;
    const flickerSpeed = 0.03 + pseudoRandom(seed + 5) * 0.07;
    const flickerPhase = pseudoRandom(seed + 6) * Math.PI * 2;
    const xJitter = (pseudoRandom(seed + 7) - 0.5) * columnWidth * 0.3;
    const widthScale = 0.4 + pseudoRandom(seed + 8) * 0.6;
    const barWidth = columnWidth * widthScale;
    const x = colIndex * columnWidth + (columnWidth - barWidth) / 2 + xJitter;

    return { numBars, color, speed, barHeight, offset, flickerSpeed, flickerPhase, barWidth, x, seed };
  });

  return (
    <div
      style={{
        width,
        height,
        background: '#050508',
        overflow: 'hidden',
        opacity,
        position: 'relative',
      }}
    >
      {/* Grid scanline overlay */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width, height, opacity: 0.03, pointerEvents: 'none' }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {Array.from({ length: Math.floor(height / 4) }, (_, i) => (
          <line key={i} x1={0} y1={i * 4} x2={width} y2={i * 4} stroke="#ffffff" strokeWidth={0.5} />
        ))}
      </svg>

      <svg
        style={{ position: 'absolute', top: 0, left: 0 }}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          {columns.map((col, colIndex) => (
            <React.Fragment key={colIndex}>
              <linearGradient id={`barGrad${colIndex}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={col.color} stopOpacity={0} />
                <stop offset="15%" stopColor={col.color} stopOpacity={0.2} />
                <stop offset="50%" stopColor={col.color} stopOpacity={1} />
                <stop offset="80%" stopColor={col.color} stopOpacity={0.7} />
                <stop offset="100%" stopColor={col.color} stopOpacity={0} />
              </linearGradient>
              <filter id={`glow${colIndex}`}>
                <feGaussianBlur stdDeviation={3 + (col.barWidth / 20)} result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </React.Fragment>
          ))}
          <filter id="globalGlow">
            <feGaussianBlur stdDeviation={8} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {columns.map((col, colIndex) => {
          const pseudoRandom = (n: number) => ((Math.sin(n * 9301 + 49297) * 233280) % 1 + 1) % 1;
          return Array.from({ length: col.numBars }, (_, barIndex) => {
            const barOffset = (height + col.barHeight) * (barIndex / col.numBars);
            const totalTravel = height + col.barHeight;
            const yPos = ((frame * col.speed + col.offset + barOffset) % totalTravel) - col.barHeight;

            const flickerVal = Math.sin(frame * col.flickerSpeed + col.flickerPhase + barIndex * 1.7);
            const flicker = 0.7 + 0.3 * flickerVal;

            const barHeightVariance = 1 + 0.2 * Math.sin(frame * 0.02 + barIndex * 2.3 + colIndex);
            const currentBarHeight = col.barHeight * barHeightVariance;

            const glowIntensity = 0.4 + 0.6 * Math.abs(flickerVal);
            const extraBarSeed = col.seed + barIndex * 100;
            const barColorShift = pseudoRandom(extraBarSeed + 10) > 0.85;

            const finalColor = barColorShift
              ? neonColors[Math.floor(pseudoRandom(extraBarSeed + 11) * neonColors.length)]
              : col.color;

            return (
              <g key={barIndex} opacity={flicker}>
                {/* Outer glow bar */}
                <rect
                  x={col.x - col.barWidth * 0.5}
                  y={yPos}
                  width={col.barWidth * 2}
                  height={currentBarHeight}
                  fill={`url(#barGrad${colIndex})`}
                  opacity={glowIntensity * 0.3}
                  filter={`url(#glow${colIndex})`}
                />
                {/* Core bar */}
                <rect
                  x={col.x}
                  y={yPos}
                  width={col.barWidth}
                  height={currentBarHeight}
                  fill={`url(#barGrad${colIndex})`}
                  opacity={glowIntensity}
                />
                {/* Bright center stripe */}
                <rect
                  x={col.x + col.barWidth * 0.3}
                  y={yPos + currentBarHeight * 0.3}
                  width={col.barWidth * 0.4}
                  height={currentBarHeight * 0.4}
                  fill={finalColor}
                  opacity={glowIntensity * 0.9}
                  rx={col.barWidth * 0.1}
                />
              </g>
            );
          });
        })}

        {/* Ambient horizontal glow bands */}
        {Array.from({ length: 3 }, (_, i) => {
          const bandY = height * (0.2 + i * 0.3) + Math.sin(frame * 0.015 + i * 2) * height * 0.05;
          return (
            <rect
              key={i}
              x={0}
              y={bandY - 2}
              width={width}
              height={4}
              fill={neonColors[i * 4]}
              opacity={0.04 + 0.02 * Math.sin(frame * 0.02 + i)}
            />
          );
        })}
      </svg>

      {/* Vignette overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};