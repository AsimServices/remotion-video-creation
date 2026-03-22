import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NUM_POINTS = 120;
const DATA_POINTS = Array.from({ length: NUM_POINTS }, (_, i) => ({
  x: (i * 1733 + 300) % 3840,
  y: (i * 1237 + 200) % 2160,
  size: ((i * 17) % 18) + 6,
  hue: (i * 47) % 360,
  burstDelay: (i * 4.8) % 580,
  burstDuration: 30 + ((i * 13) % 40),
  pulseOffset: (i * 29) % 100,
}));

const NUM_LINES = 60;
const MARKET_LINES = Array.from({ length: NUM_LINES }, (_, i) => ({
  x1: (i * 2311) % 3840,
  y1: (i * 1789) % 2160,
  x2: ((i * 2311 + i * 1100 + 800) % 3840),
  y2: ((i * 1789 + i * 900 + 600) % 2160),
  hue: (i * 53) % 360,
  delay: (i * 9) % 500,
}));

const NUM_RINGS = 30;
const BURST_RINGS = Array.from({ length: NUM_RINGS }, (_, i) => ({
  x: (i * 2771 + 500) % 3840,
  y: (i * 1931 + 400) % 2160,
  hue: (i * 61) % 360,
  delay: (i * 18) % 550,
  size: 60 + ((i * 23) % 120),
}));

const NUM_SPARKS = 80;
const SPARKS = Array.from({ length: NUM_SPARKS }, (_, i) => ({
  x: (i * 1447 + 200) % 3840,
  y: (i * 1601 + 150) % 2160,
  angle: (i * 137) % 360,
  length: 40 + ((i * 19) % 80),
  hue: (i * 43) % 360,
  delay: (i * 7) % 570,
}));

const GRID_COLS = 20;
const GRID_ROWS = 12;

export const FlashSaleMarketMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const globalPulse = Math.sin(frame * 0.08) * 0.5 + 0.5;
  const flashBeat = Math.sin(frame * 0.25) > 0.7 ? 1 : 0;

  return (
    <div style={{ width, height, background: '#020408', overflow: 'hidden', position: 'relative', opacity }}>
      {/* Deep background gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 50%, #001a2e ${20 + globalPulse * 10}%, #020408 70%)`,
      }} />

      {/* Grid overlay */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0, opacity: 0.08 + globalPulse * 0.04 }}>
        {Array.from({ length: GRID_COLS + 1 }, (_, i) => (
          <line key={`vc${i}`} x1={i * (width / GRID_COLS)} y1={0} x2={i * (width / GRID_COLS)} y2={height}
            stroke="#00aaff" strokeWidth={1} />
        ))}
        {Array.from({ length: GRID_ROWS + 1 }, (_, i) => (
          <line key={`hr${i}`} x1={0} y1={i * (height / GRID_ROWS)} x2={width} y2={i * (height / GRID_ROWS)}
            stroke="#00aaff" strokeWidth={1} />
        ))}
      </svg>

      {/* Market connection lines */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        {MARKET_LINES.map((line, i) => {
          const t = ((frame - line.delay) % 150) / 150;
          const lineOpacity = t < 0 ? 0 : interpolate(t, [0, 0.2, 0.7, 1], [0, 0.6, 0.3, 0]);
          return (
            <line key={i}
              x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
              stroke={`hsla(${line.hue}, 90%, 65%, ${lineOpacity})`}
              strokeWidth={1.5}
            />
          );
        })}
      </svg>

      {/* Burst rings */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        {BURST_RINGS.map((ring, i) => {
          const t = ((frame - ring.delay) % 120) / 120;
          if (t < 0) return null;
          const ringScale = interpolate(t, [0, 1], [0.1, 3]);
          const ringOpacity = interpolate(t, [0, 0.3, 1], [0.9, 0.5, 0]);
          return (
            <circle key={i}
              cx={ring.x} cy={ring.y}
              r={ring.size * ringScale}
              fill="none"
              stroke={`hsla(${ring.hue}, 100%, 70%, ${ringOpacity})`}
              strokeWidth={3}
            />
          );
        })}
      </svg>

      {/* Sparks */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        {SPARKS.map((spark, i) => {
          const t = ((frame - spark.delay) % 90) / 90;
          if (t < 0) return null;
          const rad = (spark.angle * Math.PI) / 180;
          const progress = interpolate(t, [0, 1], [0, spark.length]);
          const sparkOpacity = interpolate(t, [0, 0.2, 1], [0, 0.9, 0]);
          const x2 = spark.x + Math.cos(rad) * progress;
          const y2 = spark.y + Math.sin(rad) * progress;
          return (
            <line key={i}
              x1={spark.x} y1={spark.y} x2={x2} y2={y2}
              stroke={`hsla(${spark.hue}, 100%, 80%, ${sparkOpacity})`}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Data points */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          {DATA_POINTS.map((pt, i) => (
            <radialGradient key={i} id={`glow${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={`hsl(${pt.hue}, 100%, 90%)`} stopOpacity="1" />
              <stop offset="50%" stopColor={`hsl(${pt.hue}, 100%, 60%)`} stopOpacity="0.6" />
              <stop offset="100%" stopColor={`hsl(${pt.hue}, 100%, 40%)`} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>
        {DATA_POINTS.map((pt, i) => {
          const localT = (frame - pt.burstDelay) % pt.burstDuration / pt.burstDuration;
          const active = frame >= pt.burstDelay;
          if (!active) return null;
          const scale = interpolate(localT, [0, 0.3, 0.6, 1], [0.2, 1.4, 1, 0.8]);
          const ptOpacity = interpolate(localT, [0, 0.2, 0.7, 1], [0, 1, 0.7, 0.4]);
          const pulse = Math.sin(frame * 0.12 + pt.pulseOffset) * 0.3 + 0.7;
          const glowRadius = pt.size * scale * 3 * pulse;
          return (
            <g key={i}>
              <circle cx={pt.x} cy={pt.y} r={glowRadius}
                fill={`url(#glow${i})`} opacity={ptOpacity * 0.5} />
              <circle cx={pt.x} cy={pt.y} r={pt.size * scale * 0.5}
                fill={`hsl(${pt.hue}, 100%, 85%)`} opacity={ptOpacity} />
            </g>
          );
        })}
      </svg>

      {/* Flash burst overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 50%, hsla(${(frame * 2) % 360}, 100%, 60%, ${flashBeat * 0.06}) 0%, transparent 70%)`,
        mixBlendMode: 'screen',
      }} />

      {/* Scan line effect */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(to bottom, transparent ${(frame * 4) % height}px, hsla(180, 100%, 50%, 0.03) ${(frame * 4) % height + 4}px, transparent ${(frame * 4) % height + 8}px)`,
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.7) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Top glow bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(to right, transparent, hsl(${(frame * 3) % 360}, 100%, 60%), hsl(${(frame * 3 + 120) % 360}, 100%, 60%), transparent)`,
        opacity: 0.8 + globalPulse * 0.2,
      }} />

      {/* Bottom glow bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(to right, transparent, hsl(${(frame * 3 + 180) % 360}, 100%, 60%), hsl(${(frame * 3 + 300) % 360}, 100%, 60%), transparent)`,
        opacity: 0.8 + globalPulse * 0.2,
      }} />
    </div>
  );
};