import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const COUNTRIES = [
  { name: 'Germany', x: 0.515, y: 0.38, share: 21.5, color: '#4FC3F7' },
  { name: 'France', x: 0.468, y: 0.435, share: 17.2, color: '#81C784' },
  { name: 'UK', x: 0.432, y: 0.34, share: 15.8, color: '#FFB74D' },
  { name: 'Italy', x: 0.525, y: 0.485, share: 12.3, color: '#F06292' },
  { name: 'Spain', x: 0.43, y: 0.52, share: 9.7, color: '#CE93D8' },
  { name: 'Netherlands', x: 0.496, y: 0.365, share: 7.4, color: '#4DB6AC' },
  { name: 'Sweden', x: 0.535, y: 0.26, share: 5.9, color: '#FFF176' },
  { name: 'Poland', x: 0.565, y: 0.355, share: 4.8, color: '#FF8A65' },
  { name: 'Belgium', x: 0.482, y: 0.375, share: 4.1, color: '#A5D6A7' },
  { name: 'Austria', x: 0.538, y: 0.41, share: 3.6, color: '#EF9A9A' },
  { name: 'Denmark', x: 0.515, y: 0.305, share: 3.2, color: '#80DEEA' },
  { name: 'Norway', x: 0.505, y: 0.24, share: 2.8, color: '#FFCC02' },
  { name: 'Finland', x: 0.565, y: 0.215, share: 2.4, color: '#B39DDB' },
  { name: 'Czech', x: 0.548, y: 0.385, share: 2.1, color: '#FFAB91' },
  { name: 'Portugal', x: 0.408, y: 0.515, share: 1.9, color: '#80CBC4' },
  { name: 'Romania', x: 0.585, y: 0.42, share: 1.7, color: '#F48FB1' },
  { name: 'Hungary', x: 0.567, y: 0.405, share: 1.5, color: '#C5E1A5' },
  { name: 'Greece', x: 0.568, y: 0.495, share: 1.3, color: '#FFE082' },
  { name: 'Ireland', x: 0.41, y: 0.33, share: 1.1, color: '#80D8FF' },
  { name: 'Croatia', x: 0.548, y: 0.435, share: 0.9, color: '#FFCCBC' },
];

const PULSE_OFFSETS = COUNTRIES.map((_, i) => (i * 37) % 60);

const MAP_DOTS: { x: number; y: number; opacity: number }[] = [];
for (let i = 0; i < 800; i++) {
  MAP_DOTS.push({
    x: (i * 1731 + 113) % 10000 / 10000,
    y: (i * 1337 + 79) % 10000 / 10000,
    opacity: ((i * 97) % 40 + 10) / 100,
  });
}

const CONNECTION_PAIRS = [
  [0, 1], [0, 8], [1, 4], [1, 9], [0, 7], [2, 8], [2, 18],
  [3, 9], [4, 14], [5, 8], [6, 12], [7, 13], [9, 16], [15, 16],
  [16, 17], [10, 11], [11, 12], [0, 5], [1, 3], [6, 10],
];

const PARTICLE_COUNT = 120;
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  x: (i * 1973 + 31) % 10000 / 10000,
  y: (i * 1217 + 53) % 10000 / 10000,
  speed: ((i * 83) % 50 + 20) / 10000,
  size: ((i * 61) % 3 + 1),
  phaseOffset: (i * 47) % 100,
}));

export const EuropeanMarketShareMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const masterOpacity = Math.min(fadeIn, fadeOut);

  const mapX = width * 0.05;
  const mapY = height * 0.06;
  const mapW = width * 0.9;
  const mapH = height * 0.88;

  const totalShare = COUNTRIES.reduce((s, c) => s + c.share, 0);

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 50% 40%, #0a0f1e 0%, #050810 60%, #020408 100%)',
        opacity: masterOpacity,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Subtle grid overlay */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.04 }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {Array.from({ length: 40 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={(i / 40) * height} x2={width} y2={(i / 40) * height} stroke="#4FC3F7" strokeWidth={1} />
        ))}
        {Array.from({ length: 60 }, (_, i) => (
          <line key={`v${i}`} x1={(i / 60) * width} y1={0} x2={(i / 60) * width} y2={height} stroke="#4FC3F7" strokeWidth={1} />
        ))}
      </svg>

      {/* Floating particles */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} viewBox={`0 0 ${width} ${height}`}>
        {PARTICLES.map((p, i) => {
          const py = ((p.y + (frame * p.speed)) % 1) * height;
          const pulse = Math.sin((frame + p.phaseOffset) * 0.05) * 0.5 + 0.5;
          return (
            <circle
              key={i}
              cx={p.x * width}
              cy={py}
              r={p.size}
              fill="#4FC3F7"
              opacity={pulse * 0.15 + 0.05}
            />
          );
        })}
      </svg>

      {/* Background map dots */}
      <svg
        style={{ position: 'absolute', top: mapY, left: mapX, width: mapW, height: mapH, opacity: 0.12 }}
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
      >
        {MAP_DOTS.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={0.003} fill="#4FC3F7" opacity={d.opacity * 2} />
        ))}
      </svg>

      {/* Connection lines */}
      <svg
        style={{ position: 'absolute', top: mapY, left: mapX, width: mapW, height: mapH }}
        viewBox={`0 0 ${mapW} ${mapH}`}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {CONNECTION_PAIRS.map(([a, b], idx) => {
          const ca = COUNTRIES[a];
          const cb = COUNTRIES[b];
          const progress = interpolate(
            frame,
            [50 + idx * 8, 100 + idx * 8],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const x1 = ca.x * mapW;
          const y1 = ca.y * mapH;
          const x2 = cb.x * mapW;
          const y2 = cb.y * mapH;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const currentX = x1 + dx * progress;
          const currentY = y1 + dy * progress;
          const pulse = Math.sin(frame * 0.04 + idx * 0.7) * 0.3 + 0.7;
          return (
            <line
              key={idx}
              x1={x1}
              y1={y1}
              x2={currentX}
              y2={currentY}
              stroke={ca.color}
              strokeWidth={1.5}
              opacity={0.25 * pulse * progress}
              filter="url(#glow)"
            />
          );
        })}
      </svg>

      {/* Country markers */}
      <svg
        style={{ position: 'absolute', top: mapY, left: mapX, width: mapW, height: mapH }}
        viewBox={`0 0 ${mapW} ${mapH}`}
      >
        <defs>
          <filter id="markerGlow">
            <feGaussianBlur stdDeviation="12" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="20" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {COUNTRIES.map((country, i) => {
          const cx = country.x * mapW;
          const cy = country.y * mapH;
          const baseRadius = Math.sqrt(country.share / totalShare) * 160 + 20;
          const appearFrame = 60 + i * 12;
          const appear = interpolate(frame, [appearFrame, appearFrame + 30], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const pulsePhase = frame * 0.06 + PULSE_OFFSETS[i] * 0.1;
          const pulseScale = Math.sin(pulsePhase) * 0.12 + 1.0;
          const ringExpand = (frame + PULSE_OFFSETS[i] * 3) % 90 / 90;
          const ringRadius = baseRadius * (1 + ringExpand * 1.5);
          const ringOpacity = (1 - ringExpand) * 0.6 * appear;

          return (
            <g key={i} opacity={appear}>
              {/* Outer pulsing ring */}
              <circle
                cx={cx}
                cy={cy}
                r={ringRadius}
                fill="none"
                stroke={country.color}
                strokeWidth={2}
                opacity={ringOpacity}
              />
              {/* Second ring */}
              <circle
                cx={cx}
                cy={cy}
                r={ringRadius * 0.7}
                fill="none"
                stroke={country.color}
                strokeWidth={1.5}
                opacity={ringOpacity * 0.6}
              />
              {/* Glow halo */}
              <circle
                cx={cx}
                cy={cy}
                r={baseRadius * pulseScale * 1.4}
                fill={country.color}
                opacity={0.08}
                filter="url(#strongGlow)"
              />
              {/* Main circle */}
              <circle
                cx={cx}
                cy={cy}
                r={baseRadius * pulseScale}
                fill={country.color}
                opacity={0.25}
                filter="url(#markerGlow)"
              />
              {/* Core bright dot */}
              <circle
                cx={cx}
                cy={cy}
                r={baseRadius * 0.35 * pulseScale}
                fill={country.color}
                opacity={0.9}
                filter="url(#markerGlow)"
              />
              {/* Center white dot */}
              <circle
                cx={cx}
                cy={cy}
                r={baseRadius * 0.1}
                fill="#ffffff"
                opacity={0.95}
              />
            </g>
          );
        })}
      </svg>

      {/* Bar chart on right side */}
      <svg
        style={{ position: 'absolute', top: height * 0.08, left: width * 0.78, width: width * 0.19, height: height * 0.84 }}
        viewBox={`0 0 300 1000`}
      >
        {COUNTRIES.slice(0, 10).map((country, i) => {
          const barAppear = interpolate(
            frame,
            [80 + i * 15, 130 + i * 15],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const barWidth = (country.share / COUNTRIES[0].share) * 220 * barAppear;
          const pulse = Math.sin(frame * 0.05 + i * 0.4) * 0.03 + 1;
          const y = i * 92 + 20;
          return (
            <g key={i}>
              {/* Background track */}
              <rect x={0} y={y + 20} width={220} height={28} rx={14} fill="#ffffff" opacity={0.04} />
              {/* Bar */}
              <rect
                x={0}
                y={y + 20}
                width={barWidth * pulse}
                height={28}
                rx={14}
                fill={country.color}
                opacity={0.7}
              />
              {/* Glow bar */}
              <rect
                x={0}
                y={y + 20}
                width={barWidth * pulse}
                height={28}
                rx={14}
                fill={country.color}
                opacity={0.3}
                filter="url(#markerGlow)"
              />
              {/* Percentage dot indicator */}
              <circle
                cx={barWidth * pulse + 16}
                cy={y + 34}
                r={8}
                fill={country.color}
                opacity={barAppear * 0.9}
              />
            </g>
          );
        })}
      </svg>

      {/* Scanline effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.03) 3px,
            rgba(0,0,0,0.03) 4px
          )`,
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
          background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};