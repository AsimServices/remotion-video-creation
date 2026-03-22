import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const GRID_COLS = 24;
const GRID_ROWS = 14;

const ORDERS = Array.from({ length: 80 }, (_, i) => ({
  col: (i * 1731 + 7) % GRID_COLS,
  row: (i * 1337 + 3) % GRID_ROWS,
  spawnFrame: (i * 137) % 480,
  size: ((i * 53) % 4) + 2,
  colorType: i % 5,
  rippleCount: (i % 3) + 2,
  pulseOffset: (i * 17) % 30,
}));

const STREET_HIGHLIGHTS = Array.from({ length: 40 }, (_, i) => ({
  isHorizontal: i % 2 === 0,
  index: (i * 7) % (i % 2 === 0 ? GRID_ROWS : GRID_COLS),
  opacity: ((i * 31) % 40) / 100 + 0.03,
}));

const CITY_BLOCKS = Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => ({
  col: i % GRID_COLS,
  row: Math.floor(i / GRID_COLS),
  brightness: ((i * 127 + 53) % 60) / 100,
  hasBuilding: (i * 73 + 11) % 5 !== 0,
  buildingHeight: ((i * 43) % 60) + 20,
}));

const COLOR_PALETTES = [
  { core: '#00ffff', mid: '#0088ff', glow: 'rgba(0,200,255,0.6)' },
  { core: '#ff4466', mid: '#ff0033', glow: 'rgba(255,50,80,0.6)' },
  { core: '#44ff88', mid: '#00cc55', glow: 'rgba(50,255,120,0.6)' },
  { core: '#ffcc00', mid: '#ff8800', glow: 'rgba(255,180,0,0.6)' },
  { core: '#cc44ff', mid: '#8800ff', glow: 'rgba(180,50,255,0.6)' },
];

export const RealTimeOrderPlacement: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const cellW = width / GRID_COLS;
  const cellH = height / GRID_ROWS;

  const scanLineY = ((frame * 1.5) % height);
  const pulseGlobal = Math.sin(frame * 0.05) * 0.5 + 0.5;

  return (
    <div style={{ width, height, background: '#030810', position: 'relative', overflow: 'hidden', opacity: globalOpacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#0a1a2e" stopOpacity="1" />
            <stop offset="100%" stopColor="#020608" stopOpacity="1" />
          </radialGradient>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="blur6">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="blur12">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        {/* Background gradient */}
        <rect width={width} height={height} fill="url(#centerGlow)" />

        {/* City blocks */}
        {CITY_BLOCKS.map((block, i) => {
          if (!block.hasBuilding) return null;
          const x = block.col * cellW + cellW * 0.1;
          const y = block.row * cellH + cellH * 0.1;
          const bw = cellW * 0.8;
          const bh = cellH * 0.8;
          const buildingPulse = Math.sin(frame * 0.02 + block.col * 0.3 + block.row * 0.4) * 0.15 + 0.85;
          const brightness = block.brightness * buildingPulse;
          return (
            <rect
              key={i}
              x={x} y={y} width={bw} height={bh}
              fill={`rgba(${10 + brightness * 20}, ${20 + brightness * 30}, ${40 + brightness * 60}, ${0.4 + brightness * 0.3})`}
              rx={1}
            />
          );
        })}

        {/* Grid lines */}
        {Array.from({ length: GRID_COLS + 1 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * cellW} y1={0} x2={i * cellW} y2={height}
            stroke={`rgba(20,80,140,${0.25 + pulseGlobal * 0.05})`}
            strokeWidth={i % 4 === 0 ? 1.5 : 0.5}
          />
        ))}
        {Array.from({ length: GRID_ROWS + 1 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={0} y1={i * cellH} x2={width} y2={i * cellH}
            stroke={`rgba(20,80,140,${0.25 + pulseGlobal * 0.05})`}
            strokeWidth={i % 4 === 0 ? 1.5 : 0.5}
          />
        ))}

        {/* Street glow highlights */}
        {STREET_HIGHLIGHTS.map((s, i) => {
          if (s.isHorizontal) {
            return (
              <line
                key={`sh${i}`}
                x1={0} y1={s.index * cellH} x2={width} y2={s.index * cellH}
                stroke={`rgba(40,160,255,${s.opacity + pulseGlobal * 0.02})`}
                strokeWidth={3}
                filter="url(#blur2)"
              />
            );
          } else {
            return (
              <line
                key={`sv${i}`}
                x1={s.index * cellW} y1={0} x2={s.index * cellW} y2={height}
                stroke={`rgba(40,160,255,${s.opacity + pulseGlobal * 0.02})`}
                strokeWidth={3}
                filter="url(#blur2)"
              />
            );
          }
        })}

        {/* Scan line */}
        <rect
          x={0} y={scanLineY - 2} width={width} height={4}
          fill={`rgba(0,200,255,${0.06 + pulseGlobal * 0.04})`}
          filter="url(#blur6)"
        />
        <rect
          x={0} y={scanLineY} width={width} height={1}
          fill={`rgba(0,220,255,0.15)`}
        />

        {/* Order markers */}
        {ORDERS.map((order, i) => {
          const localFrame = frame - order.spawnFrame;
          if (localFrame < 0) return null;

          const palette = COLOR_PALETTES[order.colorType];
          const cx = (order.col + 0.5) * cellW;
          const cy = (order.row + 0.5) * cellH;

          // Pop-in animation
          const popDuration = 20;
          const liveDuration = 180;
          const fadeDuration = 30;
          const totalLife = popDuration + liveDuration + fadeDuration;

          if (localFrame > totalLife) return null;

          const popProgress = interpolate(localFrame, [0, popDuration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const fadeProgress = interpolate(localFrame, [popDuration + liveDuration, totalLife], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const markerOpacity = Math.min(popProgress, fadeProgress);

          const scaleVal = interpolate(localFrame, [0, popDuration * 0.6, popDuration], [0, 1.3, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          const baseSize = (order.size + 2) * (width / 3840) * 12;
          const pulseFactor = Math.sin(localFrame * 0.15 + order.pulseOffset) * 0.15 + 1;

          return (
            <g key={i} opacity={markerOpacity}>
              {/* Outer glow ring */}
              <circle
                cx={cx} cy={cy}
                r={baseSize * 3 * scaleVal * pulseFactor}
                fill="none"
                stroke={palette.glow}
                strokeWidth={2}
                filter="url(#blur6)"
                opacity={0.5}
              />

              {/* Ripple rings */}
              {Array.from({ length: order.rippleCount }, (_, r) => {
                const rippleFrame = localFrame - r * 12;
                if (rippleFrame < 0) return null;
                const rippleRadius = interpolate(rippleFrame % 60, [0, 60], [baseSize, baseSize * 5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                const rippleOpacity = interpolate(rippleFrame % 60, [0, 60], [0.6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                return (
                  <circle
                    key={r}
                    cx={cx} cy={cy}
                    r={rippleRadius}
                    fill="none"
                    stroke={palette.mid}
                    strokeWidth={1.5}
                    opacity={rippleOpacity * markerOpacity}
                  />
                );
              })}

              {/* Core dot glow */}
              <circle
                cx={cx} cy={cy}
                r={baseSize * 2 * scaleVal}
                fill={palette.glow}
                filter="url(#blur12)"
              />

              {/* Core dot */}
              <circle
                cx={cx} cy={cy}
                r={baseSize * scaleVal * pulseFactor}
                fill={palette.core}
                filter="url(#blur2)"
              />

              {/* Bright center */}
              <circle
                cx={cx} cy={cy}
                r={baseSize * 0.4 * scaleVal}
                fill="white"
                opacity={0.9}
              />

              {/* Cross hair lines */}
              <line
                x1={cx - baseSize * 2.5 * scaleVal} y1={cy}
                x2={cx + baseSize * 2.5 * scaleVal} y2={cy}
                stroke={palette.core}
                strokeWidth={1}
                opacity={0.6}
              />
              <line
                x1={cx} y1={cy - baseSize * 2.5 * scaleVal}
                x2={cx} y2={cy + baseSize * 2.5 * scaleVal}
                stroke={palette.core}
                strokeWidth={1}
                opacity={0.6}
              />
            </g>
          );
        })}

        {/* Overlay vignette */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="transparent" stopOpacity="0" />
          <stop offset="100%" stopColor="#000008" stopOpacity="0.7" />
        </radialGradient>
        <rect width={width} height={height} fill="url(#vignette)" />

        {/* Top bottom dark bands */}
        <rect width={width} height={height * 0.06} fill="rgba(0,0,5,0.5)" />
        <rect y={height * 0.94} width={width} height={height * 0.06} fill="rgba(0,0,5,0.5)" />
      </svg>
    </div>
  );
};