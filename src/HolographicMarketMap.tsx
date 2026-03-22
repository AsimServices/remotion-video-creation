import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const MARKET_POINTS = Array.from({ length: 18 }, (_, i) => ({
  x: ((i * 1731 + 400) % 3400) + 220,
  y: ((i * 1337 + 200) % 1760) + 200,
  value: ((i * 479) % 100) + 20,
  phase: (i * 0.618) % 1,
  size: ((i * 137) % 30) + 20,
  color: i % 3 === 0 ? '#00ffcc' : i % 3 === 1 ? '#ff6b35' : '#7b5ea7',
  rings: ((i * 53) % 3) + 2,
  speed: 0.4 + ((i * 71) % 60) / 100,
}));

const GRID_LINES_H = Array.from({ length: 24 }, (_, i) => i);
const GRID_LINES_V = Array.from({ length: 42 }, (_, i) => i);

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  x: ((i * 2391) % 3840),
  y: ((i * 1847) % 2160),
  size: ((i * 97) % 4) + 1,
  speed: 0.3 + ((i * 61) % 70) / 100,
  phase: (i * 0.414) % 1,
}));

const CONTOUR_PATHS = Array.from({ length: 12 }, (_, i) => ({
  cx: ((i * 890) % 3200) + 320,
  cy: ((i * 670) % 1800) + 180,
  rx: ((i * 231) % 280) + 120,
  ry: ((i * 173) % 180) + 80,
  opacity: 0.04 + ((i * 37) % 40) / 1000,
}));

export const HolographicMarketMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const time = frame / 30;

  const scanY = ((frame * 2) % (height + 100)) - 50;

  return (
    <div style={{ width, height, background: '#03050a', position: 'relative', overflow: 'hidden', opacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>
          <radialGradient id="glowCyan" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00ffcc" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00ffcc" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glowOrange" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glowPurple" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7b5ea7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7b5ea7" stopOpacity="0" />
          </radialGradient>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="blur8">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="blur20">
            <feGaussianBlur stdDeviation="20" />
          </filter>
          <filter id="blur1">
            <feGaussianBlur stdDeviation="1" />
          </filter>
          <clipPath id="screen">
            <rect x={0} y={0} width={width} height={height} />
          </clipPath>
        </defs>

        {/* Background */}
        <rect width={width} height={height} fill="url(#bgGrad)" />

        {/* Contour lines */}
        {CONTOUR_PATHS.map((c, i) => (
          <ellipse
            key={i}
            cx={c.cx}
            cy={c.cy}
            rx={c.rx + Math.sin(time * 0.3 + i) * 10}
            ry={c.ry + Math.cos(time * 0.3 + i) * 8}
            fill="none"
            stroke="#1a3a5c"
            strokeWidth="1"
            opacity={c.opacity + 0.02}
          />
        ))}

        {/* Grid lines horizontal */}
        {GRID_LINES_H.map((i) => {
          const y = (i / GRID_LINES_H.length) * height;
          const pulse = Math.sin(time * 0.5 + i * 0.4) * 0.3 + 0.7;
          return (
            <line
              key={`h${i}`}
              x1={0} y1={y} x2={width} y2={y}
              stroke="#0d2a45"
              strokeWidth="1"
              opacity={0.3 * pulse}
            />
          );
        })}

        {/* Grid lines vertical */}
        {GRID_LINES_V.map((i) => {
          const x = (i / GRID_LINES_V.length) * width;
          const pulse = Math.sin(time * 0.5 + i * 0.25) * 0.3 + 0.7;
          return (
            <line
              key={`v${i}`}
              x1={x} y1={0} x2={x} y2={height}
              stroke="#0d2a45"
              strokeWidth="1"
              opacity={0.3 * pulse}
            />
          );
        })}

        {/* Perspective grid - horizontal converging lines */}
        {Array.from({ length: 14 }, (_, i) => {
          const t = i / 13;
          const y = height * 0.3 + t * height * 0.7;
          const xLeft = interpolate(t, [0, 1], [width * 0.5, 0]);
          const xRight = interpolate(t, [0, 1], [width * 0.5, width]);
          const op = 0.06 + t * 0.12;
          return (
            <line
              key={`pg${i}`}
              x1={xLeft} y1={y} x2={xRight} y2={y}
              stroke="#1e4a70"
              strokeWidth="1"
              opacity={op}
            />
          );
        })}

        {/* Perspective grid - vertical converging lines */}
        {Array.from({ length: 20 }, (_, i) => {
          const t = i / 19;
          const xBottom = t * width;
          return (
            <line
              key={`pv${i}`}
              x1={width * 0.5} y1={height * 0.3}
              x2={xBottom} y2={height}
              stroke="#1e4a70"
              strokeWidth="1"
              opacity={0.06}
            />
          );
        })}

        {/* Floating particles */}
        {PARTICLES.map((p, i) => {
          const py = (p.y - frame * p.speed * 0.5) % height;
          const flicker = Math.sin(time * 3 + p.phase * Math.PI * 2) * 0.4 + 0.6;
          return (
            <circle
              key={`part${i}`}
              cx={p.x}
              cy={py < 0 ? py + height : py}
              r={p.size}
              fill="#00d4ff"
              opacity={0.15 * flicker}
            />
          );
        })}

        {/* Market data markers with ripple rings */}
        {MARKET_POINTS.map((mp, i) => {
          const localTime = time * mp.speed + mp.phase * Math.PI * 2;
          const markerPulse = Math.sin(localTime * 2) * 0.15 + 0.85;
          const heightPulse = Math.sin(localTime * 1.5) * 0.1 + 0.9;

          const glowId = i % 3 === 0 ? 'glowCyan' : i % 3 === 1 ? 'glowOrange' : 'glowPurple';

          return (
            <g key={`mp${i}`} clipPath="url(#screen)">
              {/* Glow pool on ground */}
              <ellipse
                cx={mp.x}
                cy={mp.y}
                rx={mp.size * 4}
                ry={mp.size * 1.5}
                fill={mp.color}
                opacity={0.07 * markerPulse}
                filter="url(#blur8)"
              />

              {/* Ripple rings rising */}
              {Array.from({ length: mp.rings + 2 }, (_, r) => {
                const ringPhase = ((localTime * 0.8 + r / (mp.rings + 2)) % 1);
                const ringRadius = ringPhase * mp.size * 6;
                const ringOpacity = (1 - ringPhase) * 0.6;
                const ringY = mp.y - ringPhase * mp.size * 0.5;
                return (
                  <ellipse
                    key={`ring${r}`}
                    cx={mp.x}
                    cy={ringY}
                    rx={ringRadius}
                    ry={ringRadius * 0.3}
                    fill="none"
                    stroke={mp.color}
                    strokeWidth={2 - ringPhase * 1.5}
                    opacity={ringOpacity}
                  />
                );
              })}

              {/* Vertical beam/pillar */}
              <rect
                x={mp.x - 1.5}
                y={mp.y - mp.size * 3 * heightPulse}
                width={3}
                height={mp.size * 3 * heightPulse}
                fill={mp.color}
                opacity={0.4}
                filter="url(#blur2)"
              />
              <rect
                x={mp.x - 0.5}
                y={mp.y - mp.size * 3 * heightPulse}
                width={1}
                height={mp.size * 3 * heightPulse}
                fill={mp.color}
                opacity={0.9}
              />

              {/* Top glow cap */}
              <circle
                cx={mp.x}
                cy={mp.y - mp.size * 3 * heightPulse}
                r={mp.size * 0.4 * markerPulse}
                fill={mp.color}
                opacity={0.9}
                filter="url(#blur2)"
              />
              <circle
                cx={mp.x}
                cy={mp.y - mp.size * 3 * heightPulse}
                r={mp.size * 1.5 * markerPulse}
                fill={mp.color}
                opacity={0.15}
                filter="url(#blur8)"
              />

              {/* Outer glow halo at top */}
              <circle
                cx={mp.x}
                cy={mp.y - mp.size * 3 * heightPulse}
                r={mp.size * 3 * markerPulse}
                fill={mp.color}
                opacity={0.05}
                filter="url(#blur20)"
              />

              {/* Base diamond marker */}
              <polygon
                points={`
                  ${mp.x},${mp.y - mp.size * 0.6 * markerPulse}
                  ${mp.x + mp.size * 0.4},${mp.y}
                  ${mp.x},${mp.y + mp.size * 0.3 * markerPulse}
                  ${mp.x - mp.size * 0.4},${mp.y}
                `}
                fill={mp.color}
                opacity={0.7 * markerPulse}
              />

              {/* Horizontal scan line at marker */}
              <line
                x1={mp.x - mp.size * 2}
                y1={mp.y - mp.size * 3 * heightPulse}
                x2={mp.x + mp.size * 2}
                y2={mp.y - mp.size * 3 * heightPulse}
                stroke={mp.color}
                strokeWidth="1"
                opacity={0.5 * markerPulse}
              />

              {/* Data bar segments */}
              {Array.from({ length: 5 }, (_, b) => {
                const barH = ((mp.value / 120) * mp.size * 0.5) * ((b + 1) / 5);
                const barX = mp.x + mp.size * 0.6 + b * (mp.size * 0.25);
                const barY = mp.y - mp.size * 3 * heightPulse;
                const barAnim = Math.sin(localTime * 2 + b * 0.8) * 0.2 + 0.8;
                return (
                  <rect
                    key={`bar${b}`}
                    x={barX}
                    y={barY - barH * barAnim}
                    width={mp.size * 0.18}
                    height={barH * barAnim}
                    fill={mp.color}
                    opacity={0.5}
                  />
                );
              })}
            </g>
          );
        })}

        {/* Scan line sweep */}
        <rect
          x={0}
          y={scanY}
          width={width}
          height={3}
          fill="#00d4ff"
          opacity={0.06}
          filter="url(#blur8)"
        />
        <rect
          x={0}
          y={scanY}
          width={width}
          height={1}
          fill="#00d4ff"
          opacity={0.15}
        />

        {/* Horizontal accent lines */}
        {[0.25, 0.5, 0.75].map((frac, i) => {
          const y = height * frac;
          const pulse = Math.sin(time * 0.8 + i * 1.2) * 0.3 + 0.7;
          return (
            <line
              key={`accent${i}`}
              x1={0} y1={y} x2={width} y2={y}
              stroke="#00d4ff"
              strokeWidth="1"
              opacity={0.08 * pulse}
              strokeDasharray="40 80"
            />
          );
        })}

        {/* Corner decorations */}
        {[
          { x: 40, y: 40, r1: 0, r2: 90 },
          { x: width - 40, y: 40, r1: 90, r2: 180 },
          { x: width - 40, y: height - 40, r1: 180, r2: 270 },
          { x: 40, y: height - 40, r1: 270, r2: 360 },
        ].map((c, i) => {
          const pulse = Math.sin(time * 1.5 + i * 0.8) * 0.3 + 0.7;
          return (
            <g key={`corner${i}`}>
              <circle cx={c.x} cy={c.y} r={40} fill="none" stroke="#00d4ff" strokeWidth="1" opacity={0.2 * pulse} strokeDasharray="20 40" />
              <circle cx={c.x} cy={c.y} r={20} fill="none" stroke="#00d4ff" strokeWidth="1" opacity={0.3 * pulse} />
              <circle cx={c.x} cy={c.y} r={4} fill="#00d4ff" opacity={0.6 * pulse} />
            </g>
          );
        })}

        {/* Central ambient glow */}
        <ellipse
          cx={width / 2}
          cy={height / 2}
          rx={width * 0.4}
          ry={height * 0.3}
          fill="#001a2e"
          opacity={Math.sin(time * 0.3) * 0.05 + 0.08}
          filter="url(#blur20)"
        />

        {/* Vignette overlay */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="#000008" stopOpacity="0.7" />
        </radialGradient>
        <rect width={width} height={height} fill="url(#vignette)" />
      </svg>
    </div>
  );
};