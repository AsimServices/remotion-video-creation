import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NUM_POINTS = 300;
const DATA_POINTS = Array.from({ length: NUM_POINTS }, (_, i) => ({
  x: (i * 2731 + 137) % 3840,
  y: (i * 1993 + 421) % 2160,
  size: ((i * 17) % 18) + 6,
  pulseOffset: (i * 47) % 120,
  pulseSpeed: 0.6 + ((i * 13) % 10) * 0.08,
  colorIndex: i % 6,
  ringCount: (i % 3) + 2,
  opacity: 0.5 + ((i * 29) % 50) * 0.01,
  glowSize: ((i * 23) % 30) + 20,
}));

const NUM_LINES = 80;
const CONNECTION_LINES = Array.from({ length: NUM_LINES }, (_, i) => ({
  x1: (i * 3113 + 200) % 3840,
  y1: (i * 2337 + 300) % 2160,
  x2: ((i * 1877 + 600) * 2) % 3840,
  y2: ((i * 2111 + 100) * 2) % 2160,
  opacity: 0.05 + ((i * 7) % 15) * 0.01,
  colorIndex: i % 6,
  animOffset: (i * 31) % 180,
}));

const GRID_COLS = 24;
const GRID_ROWS = 14;

const NEON_COLORS = [
  '#00ffff',
  '#ff00ff',
  '#00ff88',
  '#ff6600',
  '#ffff00',
  '#ff0088',
];

const GLOW_COLORS = [
  'rgba(0,255,255,',
  'rgba(255,0,255,',
  'rgba(0,255,136,',
  'rgba(255,102,0,',
  'rgba(255,255,0,',
  'rgba(255,0,136,',
];

const BURST_POINTS = Array.from({ length: 8 }, (_, i) => ({
  x: (i * 4111 + 500) % 3840,
  y: (i * 3001 + 400) % 2160,
  startFrame: (i * 60) % 400,
  colorIndex: i % 6,
}));

export const NeonDataPointStorm: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scanLineY = ((frame * 3) % (height + 200)) - 100;

  return (
    <div
      style={{
        width,
        height,
        background: '#020408',
        position: 'relative',
        overflow: 'hidden',
        opacity: globalOpacity,
      }}
    >
      {/* Deep background radial glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,60,80,0.4) 0%, rgba(0,10,20,0.8) 60%, #020408 100%)`,
        }}
      />

      {/* Grid overlay */}
      <svg
        style={{ position: 'absolute', inset: 0 }}
        width={width}
        height={height}
      >
        <defs>
          <filter id="globalGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="15" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {Array.from({ length: GRID_COLS + 1 }, (_, i) => {
          const x = (i / GRID_COLS) * width;
          return (
            <line
              key={`vcol-${i}`}
              x1={x} y1={0} x2={x} y2={height}
              stroke="rgba(0,200,255,0.06)"
              strokeWidth="1"
            />
          );
        })}
        {Array.from({ length: GRID_ROWS + 1 }, (_, i) => {
          const y = (i / GRID_ROWS) * height;
          return (
            <line
              key={`hrow-${i}`}
              x1={0} y1={y} x2={width} y2={y}
              stroke="rgba(0,200,255,0.06)"
              strokeWidth="1"
            />
          );
        })}

        {/* Connection lines */}
        {CONNECTION_LINES.map((line, i) => {
          const pulse = Math.sin((frame + line.animOffset) * 0.04) * 0.5 + 0.5;
          const color = NEON_COLORS[line.colorIndex];
          const opacity = line.opacity * pulse * 0.8;
          return (
            <line
              key={`conn-${i}`}
              x1={line.x1} y1={line.y1}
              x2={line.x2} y2={line.y2}
              stroke={color}
              strokeWidth={1.5}
              strokeOpacity={opacity}
              filter="url(#globalGlow)"
            />
          );
        })}

        {/* Scan line */}
        <rect
          x={0}
          y={scanLineY}
          width={width}
          height={200}
          fill="url(#scanGrad)"
          opacity={0.12}
        />
        <defs>
          <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,255,255,0)" />
            <stop offset="40%" stopColor="rgba(0,255,255,0.6)" />
            <stop offset="50%" stopColor="rgba(0,255,255,1)" />
            <stop offset="60%" stopColor="rgba(0,255,255,0.6)" />
            <stop offset="100%" stopColor="rgba(0,255,255,0)" />
          </linearGradient>
        </defs>

        {/* Burst wave animations */}
        {BURST_POINTS.map((bp, i) => {
          const localFrame = (frame - bp.startFrame + 600) % 600;
          const burstProgress = (localFrame % 150) / 150;
          const burstRadius = burstProgress * 400;
          const burstOpacity = interpolate(burstProgress, [0, 0.3, 1], [0.8, 0.4, 0]);
          const color = NEON_COLORS[bp.colorIndex];
          return (
            <g key={`burst-${i}`}>
              <circle
                cx={bp.x} cy={bp.y}
                r={burstRadius}
                fill="none"
                stroke={color}
                strokeWidth={3}
                strokeOpacity={burstOpacity}
                filter="url(#softGlow)"
              />
              <circle
                cx={bp.x} cy={bp.y}
                r={burstRadius * 0.6}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeOpacity={burstOpacity * 0.5}
              />
            </g>
          );
        })}

        {/* Data points */}
        {DATA_POINTS.map((pt, i) => {
          const pulse = Math.sin((frame + pt.pulseOffset) * pt.pulseSpeed * 0.05);
          const pulseFactor = pulse * 0.5 + 0.5;
          const ringPulse = Math.sin((frame + pt.pulseOffset) * pt.pulseSpeed * 0.03) * 0.5 + 0.5;
          const color = NEON_COLORS[pt.colorIndex];
          const glowColor = GLOW_COLORS[pt.colorIndex];
          const coreOpacity = 0.7 + pulseFactor * 0.3;
          const currentSize = pt.size * (0.8 + pulseFactor * 0.4);

          return (
            <g key={`pt-${i}`}>
              {/* Outer glow blob */}
              <circle
                cx={pt.x} cy={pt.y}
                r={pt.glowSize * (0.8 + pulseFactor * 0.5)}
                fill={`${glowColor}${(0.05 + pulseFactor * 0.08).toFixed(3)})`}
              />

              {/* Rings */}
              {Array.from({ length: pt.ringCount }, (_, ri) => {
                const ringRadius = currentSize * (1.8 + ri * 1.6) * (0.7 + ringPulse * 0.5);
                const ringOpacity = (0.3 - ri * 0.07) * pulseFactor;
                return (
                  <circle
                    key={`ring-${i}-${ri}`}
                    cx={pt.x} cy={pt.y}
                    r={ringRadius}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.5}
                    strokeOpacity={ringOpacity}
                    filter="url(#globalGlow)"
                  />
                );
              })}

              {/* Core dot */}
              <circle
                cx={pt.x} cy={pt.y}
                r={currentSize}
                fill={color}
                fillOpacity={coreOpacity}
                filter="url(#strongGlow)"
              />

              {/* Bright center */}
              <circle
                cx={pt.x} cy={pt.y}
                r={currentSize * 0.4}
                fill="white"
                fillOpacity={0.7 + pulseFactor * 0.3}
              />

              {/* Cross hair lines */}
              <line
                x1={pt.x - currentSize * 3} y1={pt.y}
                x2={pt.x + currentSize * 3} y2={pt.y}
                stroke={color}
                strokeWidth={1}
                strokeOpacity={0.25 * pulseFactor}
              />
              <line
                x1={pt.x} y1={pt.y - currentSize * 3}
                x2={pt.x} y2={pt.y + currentSize * 3}
                stroke={color}
                strokeWidth={1}
                strokeOpacity={0.25 * pulseFactor}
              />
            </g>
          );
        })}

        {/* Animated perimeter sweep */}
        <rect
          x={4} y={4}
          width={width - 8} height={height - 8}
          fill="none"
          stroke="rgba(0,255,255,0.15)"
          strokeWidth={3}
          filter="url(#globalGlow)"
        />
        <rect
          x={20} y={20}
          width={width - 40} height={height - 40}
          fill="none"
          stroke="rgba(0,200,255,0.08)"
          strokeWidth={1.5}
        />

        {/* Corner accents */}
        {[
          { x: 40, y: 40 },
          { x: width - 40, y: 40 },
          { x: 40, y: height - 40 },
          { x: width - 40, y: height - 40 },
        ].map((corner, ci) => {
          const cornerPulse = Math.sin(frame * 0.06 + ci * Math.PI * 0.5) * 0.5 + 0.5;
          const len = 80;
          const sx = ci % 2 === 0 ? 1 : -1;
          const sy = ci < 2 ? 1 : -1;
          return (
            <g key={`corner-${ci}`} filter="url(#globalGlow)">
              <line
                x1={corner.x} y1={corner.y}
                x2={corner.x + sx * len} y2={corner.y}
                stroke={`rgba(0,255,255,${0.4 + cornerPulse * 0.6})`}
                strokeWidth={3}
              />
              <line
                x1={corner.x} y1={corner.y}
                x2={corner.x} y2={corner.y + sy * len}
                stroke={`rgba(0,255,255,${0.4 + cornerPulse * 0.6})`}
                strokeWidth={3}
              />
              <circle
                cx={corner.x} cy={corner.y}
                r={8 + cornerPulse * 6}
                fill="none"
                stroke="rgba(0,255,255,0.6)"
                strokeWidth={2}
              />
            </g>
          );
        })}
      </svg>

      {/* Vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(2,4,8,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};