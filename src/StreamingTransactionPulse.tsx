import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const DOTS = Array.from({ length: 120 }, (_, i) => ({
  x: ((i * 1731 + 47) % 1000) / 1000,
  y: ((i * 1337 + 83) % 1000) / 1000,
  delay: (i * 73) % 180,
  duration: 40 + ((i * 31) % 60),
  size: 4 + ((i * 17) % 10),
  colorIndex: i % 5,
  pulseOffset: (i * 43) % 100,
}));

const CONNECTIONS = Array.from({ length: 60 }, (_, i) => ({
  x1: ((i * 2341 + 11) % 1000) / 1000,
  y1: ((i * 1873 + 29) % 1000) / 1000,
  x2: (((i + 13) * 1571 + 53) % 1000) / 1000,
  y2: (((i + 7) * 2213 + 17) % 1000) / 1000,
  delay: (i * 97) % 200,
  duration: 60 + ((i * 41) % 80),
  colorIndex: i % 5,
}));

const RIPPLES = Array.from({ length: 40 }, (_, i) => ({
  x: ((i * 1993 + 61) % 1000) / 1000,
  y: ((i * 1447 + 37) % 1000) / 1000,
  delay: (i * 113) % 300,
  duration: 80 + ((i * 23) % 60),
  colorIndex: i % 5,
}));

const GRID_LINES_H = Array.from({ length: 18 }, (_, i) => i);
const GRID_LINES_V = Array.from({ length: 32 }, (_, i) => i);

const CONTINENT_PATHS = [
  // North America
  "M 120 180 L 180 160 L 240 170 L 280 200 L 300 240 L 280 280 L 240 310 L 200 320 L 160 300 L 130 270 L 110 230 Z",
  // South America
  "M 210 340 L 250 330 L 280 350 L 290 400 L 280 450 L 260 490 L 230 510 L 210 490 L 200 450 L 195 400 L 200 360 Z",
  // Europe
  "M 420 150 L 480 140 L 520 150 L 540 180 L 520 210 L 480 220 L 440 210 L 415 190 Z",
  // Africa
  "M 440 230 L 500 220 L 540 240 L 560 290 L 560 360 L 540 410 L 510 440 L 480 450 L 450 430 L 430 390 L 420 340 L 415 280 Z",
  // Asia
  "M 540 130 L 650 110 L 760 120 L 820 150 L 840 190 L 820 230 L 780 250 L 720 260 L 660 250 L 600 240 L 560 220 L 540 190 Z",
  // Australia
  "M 720 360 L 780 350 L 820 370 L 830 410 L 820 440 L 790 460 L 750 460 L 720 440 L 705 410 L 710 380 Z",
];

const COLORS = [
  '#00f5ff',
  '#7c3aed',
  '#10b981',
  '#f59e0b',
  '#ef4444',
];

const GLOW_COLORS = [
  'rgba(0,245,255,',
  'rgba(124,58,237,',
  'rgba(16,185,129,',
  'rgba(245,158,11,',
  'rgba(239,68,68,',
];

export const StreamingTransactionPulse: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const mapScale = width / 960;
  const mapOffsetX = 0;
  const mapOffsetY = (height - 540 * mapScale) / 2;

  return (
    <div
      style={{
        width,
        height,
        background: '#050a0f',
        overflow: 'hidden',
        opacity: globalOpacity,
        position: 'relative',
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, #0a1628 0%, #050a0f 70%)',
        }}
      />

      {/* Animated scanline overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0, 245, 255, 0.012) 3px,
            rgba(0, 245, 255, 0.012) 4px
          )`,
        }}
      />

      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-soft">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-map">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0d2040" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#050a0f" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background ambient glow */}
        <ellipse
          cx={width / 2}
          cy={height / 2}
          rx={width * 0.6}
          ry={height * 0.5}
          fill="url(#bg-glow)"
        />

        {/* Grid lines */}
        <g opacity="0.06">
          {GRID_LINES_H.map((i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={(i / 17) * height}
              x2={width}
              y2={(i / 17) * height}
              stroke="#00f5ff"
              strokeWidth={0.5}
            />
          ))}
          {GRID_LINES_V.map((i) => (
            <line
              key={`v${i}`}
              x1={(i / 31) * width}
              y1={0}
              x2={(i / 31) * width}
              y2={height}
              stroke="#00f5ff"
              strokeWidth={0.5}
            />
          ))}
        </g>

        {/* Continent shapes */}
        <g
          transform={`translate(${mapOffsetX}, ${mapOffsetY}) scale(${mapScale})`}
          filter="url(#glow-map)"
        >
          {CONTINENT_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="rgba(0, 245, 255, 0.07)"
              stroke="rgba(0, 245, 255, 0.25)"
              strokeWidth={1.5}
            />
          ))}
        </g>

        {/* Connection lines */}
        {CONNECTIONS.map((conn, i) => {
          const localFrame = (frame - conn.delay + 600) % 300;
          const progress = (localFrame % conn.duration) / conn.duration;
          const lineOpacity = interpolate(
            progress,
            [0, 0.1, 0.7, 1],
            [0, 0.6, 0.3, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const x1 = conn.x1 * width;
          const y1 = conn.y1 * height;
          const x2 = conn.x2 * width;
          const y2 = conn.y2 * height;

          // Animated dash offset
          const dashLen = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          const dashOffset = -progress * dashLen * 2;

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={COLORS[conn.colorIndex]}
              strokeWidth={1.5}
              strokeOpacity={lineOpacity * 0.5}
              strokeDasharray={`${dashLen * 0.3} ${dashLen * 0.7}`}
              strokeDashoffset={dashOffset}
            />
          );
        })}

        {/* Ripple effects */}
        {RIPPLES.map((ripple, i) => {
          const localFrame = (frame - ripple.delay + 600) % 400;
          const progress = (localFrame % ripple.duration) / ripple.duration;
          const rippleOpacity = interpolate(
            progress,
            [0, 0.1, 0.6, 1],
            [0, 0.8, 0.2, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const rippleRadius = interpolate(progress, [0, 1], [10, 120]);

          return (
            <circle
              key={i}
              cx={ripple.x * width}
              cy={ripple.y * height}
              r={rippleRadius * mapScale}
              fill="none"
              stroke={COLORS[ripple.colorIndex]}
              strokeWidth={2}
              strokeOpacity={rippleOpacity * 0.4}
            />
          );
        })}

        {/* Secondary ripple (offset) */}
        {RIPPLES.map((ripple, i) => {
          const localFrame = (frame - ripple.delay + 600 + 20) % 400;
          const progress = (localFrame % ripple.duration) / ripple.duration;
          const rippleOpacity = interpolate(
            progress,
            [0, 0.1, 0.6, 1],
            [0, 0.5, 0.1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const rippleRadius = interpolate(progress, [0, 1], [10, 180]);

          return (
            <circle
              key={`r2-${i}`}
              cx={ripple.x * width}
              cy={ripple.y * height}
              r={rippleRadius * mapScale}
              fill="none"
              stroke={COLORS[ripple.colorIndex]}
              strokeWidth={1}
              strokeOpacity={rippleOpacity * 0.25}
            />
          );
        })}

        {/* Transaction pulse dots */}
        {DOTS.map((dot, i) => {
          const localFrame = (frame - dot.delay + 600) % 300;
          const progress = (localFrame % dot.duration) / dot.duration;

          const dotOpacity = interpolate(
            progress,
            [0, 0.15, 0.6, 1],
            [0, 1, 0.7, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const pulseProgress = ((frame + dot.pulseOffset) % 40) / 40;
          const pulseScale = interpolate(pulseProgress, [0, 0.5, 1], [1, 1.4, 1]);

          const cx = dot.x * width;
          const cy = dot.y * height;
          const r = dot.size * mapScale * pulseScale;

          const colorStr = GLOW_COLORS[dot.colorIndex];

          return (
            <g key={i} opacity={dotOpacity} filter="url(#glow-soft)">
              {/* Outer glow */}
              <circle
                cx={cx}
                cy={cy}
                r={r * 3}
                fill={`${colorStr}0.1)`}
              />
              {/* Mid glow */}
              <circle
                cx={cx}
                cy={cy}
                r={r * 1.8}
                fill={`${colorStr}0.2)`}
              />
              {/* Core dot */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={COLORS[dot.colorIndex]}
                opacity={0.95}
              />
              {/* Bright center */}
              <circle
                cx={cx}
                cy={cy}
                r={r * 0.4}
                fill="white"
                opacity={0.8}
              />
            </g>
          );
        })}

        {/* Large hub nodes */}
        {[
          { x: 0.22, y: 0.38, label: 0 },
          { x: 0.51, y: 0.3, label: 1 },
          { x: 0.72, y: 0.28, label: 2 },
          { x: 0.48, y: 0.55, label: 3 },
          { x: 0.82, y: 0.62, label: 4 },
          { x: 0.28, y: 0.65, label: 0 },
        ].map((hub, i) => {
          const pulseProgress = ((frame + i * 37) % 60) / 60;
          const outerPulse = interpolate(pulseProgress, [0, 0.5, 1], [20, 35, 20]);
          const innerPulse = interpolate(pulseProgress, [0, 0.5, 1], [8, 12, 8]);
          const glowOpacity = interpolate(pulseProgress, [0, 0.5, 1], [0.3, 0.6, 0.3]);

          return (
            <g key={i} filter="url(#glow-strong)">
              <circle
                cx={hub.x * width}
                cy={hub.y * height}
                r={outerPulse * mapScale}
                fill={`${GLOW_COLORS[hub.label]}${glowOpacity})`}
                stroke={COLORS[hub.label]}
                strokeWidth={1.5}
                strokeOpacity={0.5}
              />
              <circle
                cx={hub.x * width}
                cy={hub.y * height}
                r={innerPulse * mapScale}
                fill={COLORS[hub.label]}
                opacity={0.9}
              />
              <circle
                cx={hub.x * width}
                cy={hub.y * height}
                r={innerPulse * 0.4 * mapScale}
                fill="white"
                opacity={0.9}
              />
            </g>
          );
        })}

        {/* Streaming data arcs between hubs */}
        {[
          { x1: 0.22, y1: 0.38, x2: 0.51, y2: 0.3, c: 0 },
          { x1: 0.51, y1: 0.3, x2: 0.72, y2: 0.28, c: 1 },
          { x1: 0.72, y1: 0.28, x2: 0.82, y2: 0.62, c: 2 },
          { x1: 0.48, y1: 0.55, x2: 0.28, y2: 0.65, c: 3 },
          { x1: 0.22, y1: 0.38, x2: 0.28, y2: 0.65, c: 4 },
          { x1: 0.51, y1: 0.3, x2: 0.48, y2: 0.55, c: 0 },
        ].map((arc, i) => {
          const progress = ((frame + i * 45) % 120) / 120;
          const dotX = interpolate(progress, [0, 1], [arc.x1 * width, arc.x2 * width]);
          const dotY = interpolate(progress, [0, 1], [arc.y1 * height, arc.y2 * height]);
          const arcOpacity = interpolate(
            progress,
            [0, 0.1, 0.9, 1],
            [0, 1, 1, 0]
          );

          return (
            <g key={i}>
              <line
                x1={arc.x1 * width}
                y1={arc.y1 * height}
                x2={arc.x2 * width}
                y2={arc.y2 * height}
                stroke={COLORS[arc.c]}
                strokeWidth={1}
                strokeOpacity={0.2}
              />
              <circle
                cx={dotX}
                cy={dotY}
                r={8 * mapScale}
                fill={COLORS[arc.c]}
                opacity={arcOpacity * 0.9}
                filter="url(#glow-strong)"
              />
            </g>
          );
        })}

        {/* Corner accent decorations */}
        {[
          { x: 0, y: 0, rx: 1, ry: 1 },
          { x: width, y: 0, rx: -1, ry: 1 },
          { x: 0, y: height, rx: 1, ry: -1 },
          { x: width, y: height, rx: -1, ry: -1 },
        ].map((corner, i) => {
          const pulse = interpolate(((frame + i * 50) % 90) / 90, [0, 0.5, 1], [0.4, 1, 0.4]);
          return (
            <g key={i} opacity={pulse}>
              <line x1={corner.x} y1={corner.y} x2={corner.x + corner.rx * 120} y2={corner.y} stroke="#00f5ff" strokeWidth={2} strokeOpacity={0.5} />
              <line x1={corner.x} y1={corner.y} x2={corner.x} y2={corner.y + corner.ry * 120} stroke="#00f5ff" strokeWidth={2} strokeOpacity={0.5} />
              <circle cx={corner.x} cy={corner.y} r={6} fill="#00f5ff" opacity={0.7} />
            </g>
          );
        })}

        {/* Horizontal scan line */}
        {(() => {
          const scanY = ((frame * 2) % (height + 200)) - 100;
          return (
            <line
              x1={0}
              y1={scanY}
              x2={width}
              y2={scanY}
              stroke="rgba(0, 245, 255, 0.08)"
              strokeWidth={2}
            />
          );
        })()}
      </svg>
    </div>
  );
};