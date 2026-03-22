import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const WORLD_POINTS = [
  // North America
  { x: 0.13, y: 0.28 }, { x: 0.15, y: 0.32 }, { x: 0.18, y: 0.30 },
  { x: 0.20, y: 0.35 }, { x: 0.22, y: 0.38 }, { x: 0.16, y: 0.40 },
  { x: 0.12, y: 0.26 }, { x: 0.25, y: 0.36 }, { x: 0.19, y: 0.42 },
  { x: 0.14, y: 0.34 }, { x: 0.21, y: 0.31 }, { x: 0.17, y: 0.44 },
  { x: 0.23, y: 0.29 }, { x: 0.11, y: 0.30 }, { x: 0.24, y: 0.42 },
  // South America
  { x: 0.24, y: 0.52 }, { x: 0.26, y: 0.55 }, { x: 0.28, y: 0.58 },
  { x: 0.25, y: 0.62 }, { x: 0.27, y: 0.65 }, { x: 0.23, y: 0.60 },
  { x: 0.29, y: 0.54 }, { x: 0.22, y: 0.57 }, { x: 0.26, y: 0.70 },
  { x: 0.24, y: 0.68 }, { x: 0.28, y: 0.63 },
  // Europe
  { x: 0.46, y: 0.24 }, { x: 0.48, y: 0.26 }, { x: 0.50, y: 0.22 },
  { x: 0.52, y: 0.25 }, { x: 0.49, y: 0.28 }, { x: 0.44, y: 0.26 },
  { x: 0.47, y: 0.30 }, { x: 0.51, y: 0.20 }, { x: 0.53, y: 0.28 },
  { x: 0.45, y: 0.22 }, { x: 0.55, y: 0.24 }, { x: 0.43, y: 0.28 },
  // Africa
  { x: 0.48, y: 0.38 }, { x: 0.50, y: 0.42 }, { x: 0.52, y: 0.46 },
  { x: 0.49, y: 0.50 }, { x: 0.51, y: 0.54 }, { x: 0.47, y: 0.44 },
  { x: 0.53, y: 0.40 }, { x: 0.46, y: 0.48 }, { x: 0.54, y: 0.50 },
  { x: 0.50, y: 0.58 }, { x: 0.48, y: 0.56 },
  // Asia
  { x: 0.60, y: 0.22 }, { x: 0.63, y: 0.26 }, { x: 0.66, y: 0.24 },
  { x: 0.69, y: 0.28 }, { x: 0.72, y: 0.30 }, { x: 0.65, y: 0.30 },
  { x: 0.58, y: 0.26 }, { x: 0.75, y: 0.26 }, { x: 0.70, y: 0.22 },
  { x: 0.62, y: 0.32 }, { x: 0.68, y: 0.34 }, { x: 0.74, y: 0.32 },
  { x: 0.78, y: 0.28 }, { x: 0.64, y: 0.36 }, { x: 0.72, y: 0.38 },
  { x: 0.60, y: 0.34 }, { x: 0.76, y: 0.34 }, { x: 0.66, y: 0.40 },
  { x: 0.70, y: 0.18 }, { x: 0.56, y: 0.28 },
  // Australia / Oceania
  { x: 0.76, y: 0.58 }, { x: 0.78, y: 0.62 }, { x: 0.80, y: 0.56 },
  { x: 0.82, y: 0.60 }, { x: 0.74, y: 0.62 }, { x: 0.79, y: 0.66 },
  { x: 0.84, y: 0.58 },
  // Middle East
  { x: 0.57, y: 0.34 }, { x: 0.59, y: 0.36 }, { x: 0.61, y: 0.38 },
  { x: 0.55, y: 0.36 }, { x: 0.58, y: 0.40 },
  // Russia / North Asia
  { x: 0.62, y: 0.18 }, { x: 0.68, y: 0.16 }, { x: 0.74, y: 0.18 },
  { x: 0.80, y: 0.20 }, { x: 0.86, y: 0.18 }, { x: 0.58, y: 0.20 },
];

const PULSE_POINTS = WORLD_POINTS.map((p, i) => ({
  ...p,
  phase: (i * 137.508) % 600,
  duration: 60 + (i * 23) % 80,
  maxRadius: 18 + (i * 11) % 22,
  baseSize: 2.5 + (i % 4) * 0.5,
  intensity: 0.5 + (i % 5) * 0.1,
}));

const GRID_LINES_H = Array.from({ length: 9 }, (_, i) => (i + 1) / 10);
const GRID_LINES_V = Array.from({ length: 17 }, (_, i) => (i + 1) / 18);

export const WorldMapPulse: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const masterOpacity = Math.min(fadeIn, fadeOut);

  const mapOffsetX = width * 0.04;
  const mapOffsetY = height * 0.10;
  const mapWidth = width * 0.92;
  const mapHeight = height * 0.78;

  return (
    <div
      style={{
        width,
        height,
        background: '#000000',
        position: 'relative',
        overflow: 'hidden',
        opacity: masterOpacity,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Subtle grid */}
        {GRID_LINES_H.map((t, i) => {
          const y = mapOffsetY + mapHeight * t;
          return (
            <line
              key={`h${i}`}
              x1={mapOffsetX}
              y1={y}
              x2={mapOffsetX + mapWidth}
              y2={y}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
            />
          );
        })}
        {GRID_LINES_V.map((t, i) => {
          const x = mapOffsetX + mapWidth * t;
          return (
            <line
              key={`v${i}`}
              x1={x}
              y1={mapOffsetY}
              x2={x}
              y2={mapOffsetY + mapHeight}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
            />
          );
        })}

        {/* Map border */}
        <rect
          x={mapOffsetX}
          y={mapOffsetY}
          width={mapWidth}
          height={mapHeight}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1.5}
        />

        {/* Data points and pulses */}
        {PULSE_POINTS.map((pt, i) => {
          const cx = mapOffsetX + pt.x * mapWidth;
          const cy = mapOffsetY + pt.y * mapHeight;

          const localFrame = (frame - pt.phase + 600) % 600;
          const pulseProgress = localFrame < pt.duration
            ? localFrame / pt.duration
            : -1;

          const pulseActive = pulseProgress >= 0;
          const pulseRadius = pulseActive
            ? interpolate(pulseProgress, [0, 1], [pt.baseSize, pt.maxRadius])
            : 0;
          const pulseOpacity = pulseActive
            ? interpolate(pulseProgress, [0, 0.3, 1], [0, pt.intensity * 0.6, 0])
            : 0;

          const dotGlow = pulseActive
            ? interpolate(pulseProgress, [0, 0.2, 1], [1, 1, 0.4])
            : 0.4;

          const coreOpacity = 0.4 + (Math.sin(frame * 0.03 + i * 0.8) * 0.5 + 0.5) * 0.4;

          return (
            <g key={i}>
              {/* Pulse ring */}
              {pulseActive && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={pulseRadius}
                  fill="none"
                  stroke={`rgba(255,255,255,${pulseOpacity})`}
                  strokeWidth={1.5}
                />
              )}
              {/* Secondary inner ring */}
              {pulseActive && pulseProgress < 0.7 && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={pulseRadius * 0.55}
                  fill="none"
                  stroke={`rgba(255,255,255,${pulseOpacity * 0.5})`}
                  strokeWidth={1}
                />
              )}
              {/* Soft glow halo */}
              <circle
                cx={cx}
                cy={cy}
                r={pt.baseSize * 3.5}
                fill={`rgba(255,255,255,${coreOpacity * 0.06 * dotGlow})`}
              />
              {/* Core dot */}
              <circle
                cx={cx}
                cy={cy}
                r={pt.baseSize}
                fill={`rgba(255,255,255,${coreOpacity * dotGlow})`}
              />
            </g>
          );
        })}

        {/* Corner accents */}
        {[
          [mapOffsetX, mapOffsetY],
          [mapOffsetX + mapWidth, mapOffsetY],
          [mapOffsetX, mapOffsetY + mapHeight],
          [mapOffsetX + mapWidth, mapOffsetY + mapHeight],
        ].map(([cx, cy], i) => {
          const signs = [
            [1, 1], [-1, 1], [1, -1], [-1, -1],
          ];
          const [sx, sy] = signs[i];
          const len = 40;
          return (
            <g key={`corner${i}`}>
              <line
                x1={cx} y1={cy}
                x2={cx + sx * len} y2={cy}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={2}
              />
              <line
                x1={cx} y1={cy}
                x2={cx} y2={cy + sy * len}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={2}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};