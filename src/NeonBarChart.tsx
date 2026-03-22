import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const NeonBarChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const bars = [
    { color: '#00ffff', glow: '#00ffff', label: 'A', targetHeight: 320, delay: 0 },
    { color: '#ff00ff', glow: '#ff00ff', label: 'B', targetHeight: 480, delay: 8 },
    { color: '#00ff88', glow: '#00ff88', label: 'C', targetHeight: 260, delay: 16 },
    { color: '#ffaa00', glow: '#ffaa00', label: 'D', targetHeight: 540, delay: 24 },
    { color: '#ff4466', glow: '#ff4466', label: 'E', targetHeight: 380, delay: 32 },
    { color: '#aa44ff', glow: '#aa44ff', label: 'F', targetHeight: 430, delay: 40 },
    { color: '#00ccff', glow: '#00ccff', label: 'G', targetHeight: 300, delay: 48 },
    { color: '#ffdd00', glow: '#ffdd00', label: 'H', targetHeight: 500, delay: 56 },
  ];

  const chartBottom = height * 0.78;
  const barWidth = 80;
  const barGap = 60;
  const totalBarsWidth = bars.length * barWidth + (bars.length - 1) * barGap;
  const chartLeft = (width - totalBarsWidth) / 2;

  const pulsePhase = (frame / 30) * Math.PI * 2;

  const gridLines = [0.25, 0.5, 0.75, 1.0];

  return (
    <div style={{ width, height, background: '#080810', position: 'relative', overflow: 'hidden', opacity }}>
      {/* Background grid glow */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="70%" r="60%">
            <stop offset="0%" stopColor="#1a0030" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#080810" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#bgGlow)" />

        {/* Horizontal grid lines */}
        {gridLines.map((ratio, i) => {
          const y = chartBottom - ratio * 540;
          const gridOpacity = 0.15 + 0.05 * Math.sin(pulsePhase + i);
          return (
            <line
              key={i}
              x1={chartLeft - 20}
              y1={y}
              x2={chartLeft + totalBarsWidth + 20}
              y2={y}
              stroke="#334466"
              strokeWidth={1}
              strokeOpacity={gridOpacity}
              strokeDasharray="8 6"
            />
          );
        })}

        {/* Baseline */}
        <line
          x1={chartLeft - 20}
          y1={chartBottom}
          x2={chartLeft + totalBarsWidth + 20}
          y2={chartBottom}
          stroke="#445577"
          strokeWidth={2}
          strokeOpacity={0.6}
        />

        {/* Baseline glow */}
        <line
          x1={chartLeft - 20}
          y1={chartBottom}
          x2={chartLeft + totalBarsWidth + 20}
          y2={chartBottom}
          stroke="#6688cc"
          strokeWidth={6}
          strokeOpacity={0.15 + 0.05 * Math.sin(pulsePhase)}
        />

        {bars.map((bar, i) => {
          const x = chartLeft + i * (barWidth + barGap);
          const growStart = 60 + bar.delay;
          const growEnd = growStart + 40;

          const growProgress = interpolate(frame, [growStart, growEnd], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const eased = growProgress < 0.5
            ? 4 * growProgress * growProgress * growProgress
            : 1 - Math.pow(-2 * growProgress + 2, 3) / 2;

          const pulse = 1 + 0.015 * Math.sin(pulsePhase * 1.3 + i * 0.8);
          const currentHeight = bar.targetHeight * eased * pulse;

          const shimmerOffset = ((frame * 3 + i * 40) % (bar.targetHeight + 100)) - 50;
          const shimmerOpacity = 0.3 * eased;

          const gradId = `barGrad${i}`;
          const glowId = `barGlow${i}`;
          const shimId = `shimmer${i}`;

          return (
            <g key={i}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor={bar.color} stopOpacity="0.9" />
                  <stop offset="60%" stopColor={bar.color} stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
                </linearGradient>
                <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="blur1" />
                  <feGaussianBlur stdDeviation="20" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id={shimId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity={shimmerOpacity} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Glow shadow bar */}
              <rect
                x={x - 8}
                y={chartBottom - currentHeight}
                width={barWidth + 16}
                height={currentHeight}
                fill={bar.color}
                opacity={0.12 + 0.04 * Math.sin(pulsePhase + i)}
                rx={6}
                filter={`url(#${glowId})`}
              />

              {/* Main bar */}
              <rect
                x={x}
                y={chartBottom - currentHeight}
                width={barWidth}
                height={currentHeight}
                fill={`url(#${gradId})`}
                rx={4}
                filter={`url(#${glowId})`}
              />

              {/* Shimmer overlay */}
              <rect
                x={x}
                y={chartBottom - currentHeight + shimmerOffset}
                width={barWidth}
                height={60}
                fill={`url(#${shimId})`}
                rx={4}
                clipPath={`inset(${Math.max(0, -shimmerOffset)}px 0 ${Math.max(0, currentHeight - shimmerOffset - 60)}px 0 round 4px)`}
              />

              {/* Top cap glow */}
              <rect
                x={x - 4}
                y={chartBottom - currentHeight - 3}
                width={barWidth + 8}
                height={8}
                fill={bar.color}
                opacity={0.8 + 0.2 * Math.sin(pulsePhase * 1.5 + i)}
                rx={4}
                filter={`url(#${glowId})`}
              />

              {/* Reflection */}
              <rect
                x={x + 4}
                y={chartBottom - currentHeight + 6}
                width={10}
                height={currentHeight - 12}
                fill="#ffffff"
                opacity={0.06}
                rx={5}
              />
            </g>
          );
        })}

        {/* Floating particles */}
        {bars.map((bar, i) =>
          [0, 1, 2].map((p) => {
            const x = chartLeft + i * (barWidth + barGap) + barWidth / 2;
            const growStart = 80 + bar.delay;
            const growProgress = interpolate(frame, [growStart, growStart + 40], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const eased = growProgress < 0.5 ? 4 * growProgress ** 3 : 1 - (-2 * growProgress + 2) ** 3 / 2;
            const barTop = chartBottom - bar.targetHeight * eased;
            const particlePhase = (frame * 0.04 + i * 1.2 + p * 2.1) % (Math.PI * 2);
            const py = barTop - 20 - p * 30 - 40 * Math.abs(Math.sin(frame * 0.03 + p + i));
            const px = x + 18 * Math.sin(particlePhase + p);
            const particleOpacity = 0.5 * eased * (0.5 + 0.5 * Math.sin(frame * 0.08 + p * 3 + i));

            return (
              <circle
                key={`${i}-${p}`}
                cx={px}
                cy={py}
                r={2 + p}
                fill={bar.color}
                opacity={particleOpacity}
                filter={`url(#barGlow${i})`}
              />
            );
          })
        )}
      </svg>

      {/* Scanline overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 3px)',
          pointerEvents: 'none',
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};