import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const EMBER_COUNT = 120;
const EMBERS = Array.from({ length: EMBER_COUNT }, (_, i) => ({
  startX: ((i * 1731 + 37) % 3200) + 320,
  startY: ((i * 1337 + 91) % 1400) + 400,
  offsetX: ((i * 421) % 200) - 100,
  size: ((i * 13) % 8) + 4,
  speed: ((i * 7) % 60) + 40,
  delay: (i * 17) % 400,
  opacity: ((i * 31) % 50) / 100 + 0.5,
  hue: ((i * 43) % 40) + 35,
  glowSize: ((i * 19) % 20) + 10,
  trailLength: ((i * 23) % 30) + 20,
}));

const PULSE_POINTS = Array.from({ length: 30 }, (_, i) => ({
  x: ((i * 2531 + 113) % 3200) + 320,
  y: ((i * 1997 + 71) % 1400) + 400,
  size: ((i * 11) % 15) + 8,
  delay: (i * 23) % 500,
  speed: ((i * 7) % 80) + 60,
}));

const STAR_COUNT = 200;
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  x: (i * 1973) % 3840,
  y: (i * 1451) % 2160,
  size: ((i * 7) % 3) + 1,
  twinkleSpeed: ((i * 13) % 30) + 20,
  twinkleOffset: (i * 17) % 100,
}));

const MAP_DOTS = Array.from({ length: 800 }, (_, i) => ({
  x: ((i * 1123) % 3200) + 320,
  y: ((i * 937) % 1400) + 380,
  size: ((i * 3) % 3) + 1.5,
  brightness: ((i * 41) % 40) + 20,
}));

export const GoldEmberWorldMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const masterOpacity = Math.min(fadeIn, fadeOut);

  const slowPulse = Math.sin(frame * 0.02) * 0.5 + 0.5;
  const medPulse = Math.sin(frame * 0.04) * 0.5 + 0.5;

  return (
    <div style={{ width, height, background: '#000', overflow: 'hidden', position: 'relative', opacity: masterOpacity }}>
      {/* Deep space background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, #0a0804 0%, #050302 60%, #000000 100%)',
      }} />

      {/* Stars */}
      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
        {STARS.map((star, i) => {
          const twinkle = Math.sin((frame + star.twinkleOffset) / star.twinkleSpeed * Math.PI * 2) * 0.4 + 0.6;
          return (
            <circle
              key={i}
              cx={star.x}
              cy={star.y}
              r={star.size}
              fill={`rgba(255, 235, 180, ${twinkle * 0.4})`}
            />
          );
        })}
      </svg>

      {/* World map dot matrix */}
      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3d2800" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx={width / 2} cy={height / 2} rx={width * 0.45} ry={height * 0.38} fill="url(#mapGlow)" />
        {MAP_DOTS.map((dot, i) => {
          const shimmer = Math.sin(frame * 0.03 + i * 0.1) * 0.15 + 0.85;
          return (
            <rect
              key={i}
              x={dot.x}
              y={dot.y}
              width={dot.size}
              height={dot.size}
              rx={dot.size * 0.3}
              fill={`rgba(${80 + dot.brightness}, ${50 + dot.brightness * 0.6}, ${dot.brightness * 0.3}, ${shimmer * 0.6})`}
            />
          );
        })}
      </svg>

      {/* Ambient golden horizon glow */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '40%',
        background: `radial-gradient(ellipse at 50% 100%, rgba(180, 100, 0, ${0.12 + slowPulse * 0.05}) 0%, rgba(100, 50, 0, 0.05) 50%, transparent 100%)`,
      }} />

      {/* SVG for embers and pulse rings */}
      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
        <defs>
          {EMBERS.map((_, i) => (
            <radialGradient key={i} id={`emberGlow${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={`hsl(${EMBERS[i].hue}, 100%, 80%)`} stopOpacity="1" />
              <stop offset="40%" stopColor={`hsl(${EMBERS[i].hue}, 100%, 55%)`} stopOpacity="0.8" />
              <stop offset="100%" stopColor={`hsl(${EMBERS[i].hue}, 80%, 30%)`} stopOpacity="0" />
            </radialGradient>
          ))}
          <radialGradient id="pulseRing" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c8860a" stopOpacity="0" />
            <stop offset="70%" stopColor="#c8860a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#c8860a" stopOpacity="0" />
          </radialGradient>
          <filter id="emberBlur">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Pulse rings at data points */}
        {PULSE_POINTS.map((pt, i) => {
          const cycleLength = pt.speed;
          const localFrame = (frame - pt.delay + durationInFrames) % cycleLength;
          if (localFrame < 0) return null;
          const progress = localFrame / cycleLength;
          const ringRadius = interpolate(progress, [0, 1], [pt.size * 0.5, pt.size * 4]);
          const ringOpacity = interpolate(progress, [0, 0.3, 1], [0, 0.8, 0]);
          const coreOpacity = interpolate(progress, [0, 0.1, 0.5, 1], [0, 1, 0.8, 0.4]);
          const innerPulse = Math.sin(frame * 0.08 + i) * 0.3 + 0.7;

          return (
            <g key={i} filter="url(#glowFilter)">
              <circle cx={pt.x} cy={pt.y} r={ringRadius} fill="none"
                stroke={`hsla(42, 100%, 60%, ${ringOpacity})`}
                strokeWidth={2}
              />
              <circle cx={pt.x} cy={pt.y} r={pt.size * 0.4}
                fill={`hsla(45, 100%, 70%, ${coreOpacity * innerPulse})`}
              />
              <circle cx={pt.x} cy={pt.y} r={pt.size * 0.15}
                fill={`rgba(255, 245, 200, ${coreOpacity})`}
              />
            </g>
          );
        })}

        {/* Rising ember particles */}
        {EMBERS.map((ember, i) => {
          const cycleLength = ember.speed;
          const localFrame = (frame - ember.delay) % (cycleLength + 20);
          if (localFrame < 0) return null;

          const progress = Math.max(0, Math.min(1, localFrame / cycleLength));
          const riseDistance = height * 0.35 * progress;
          const swayX = Math.sin(progress * Math.PI * 3 + i) * ember.offsetX * progress;

          const cx = ember.startX + swayX;
          const cy = ember.startY - riseDistance;

          const particleOpacity = interpolate(progress, [0, 0.1, 0.7, 1], [0, ember.opacity, ember.opacity * 0.7, 0]);
          const currentSize = interpolate(progress, [0, 0.2, 0.8, 1], [0, ember.size, ember.size * 0.6, 0]);
          const glowRadius = currentSize + ember.glowSize * (1 - progress * 0.5);

          const trailProgress = Math.max(0, progress - 0.05);
          const trailX = ember.startX + Math.sin(trailProgress * Math.PI * 3 + i) * ember.offsetX * trailProgress;
          const trailY = ember.startY - height * 0.35 * trailProgress;
          const trailOpacity = particleOpacity * 0.4;

          return (
            <g key={i} opacity={particleOpacity}>
              {/* Trail line */}
              <line
                x1={trailX} y1={trailY}
                x2={cx} y2={cy}
                stroke={`hsla(${ember.hue}, 100%, 60%, ${trailOpacity})`}
                strokeWidth={currentSize * 0.4}
                strokeLinecap="round"
              />
              {/* Outer glow */}
              <circle cx={cx} cy={cy} r={glowRadius} fill={`url(#emberGlow${i})`} />
              {/* Core ember */}
              <circle cx={cx} cy={cy} r={currentSize}
                fill={`hsla(${ember.hue}, 100%, 70%, 0.9)`}
                filter="url(#softGlow)"
              />
              {/* Bright core */}
              <circle cx={cx} cy={cy} r={currentSize * 0.4}
                fill={`hsla(${ember.hue + 20}, 100%, 95%, 1)`}
              />
            </g>
          );
        })}

        {/* Central golden meridian lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const x = width * 0.1 + (width * 0.8) * t;
          const lineOpacity = (Math.sin(frame * 0.02 + i * 1.2) * 0.15 + 0.15) * medPulse;
          return (
            <line key={i} x1={x} y1={height * 0.15} x2={x} y2={height * 0.85}
              stroke={`rgba(180, 120, 20, ${lineOpacity})`}
              strokeWidth={1}
            />
          );
        })}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t, i) => {
          const y = height * 0.15 + (height * 0.7) * t;
          const lineOpacity = (Math.sin(frame * 0.025 + i * 0.9) * 0.15 + 0.15) * slowPulse;
          return (
            <line key={i} x1={width * 0.1} y1={y} x2={width * 0.9} y2={y}
              stroke={`rgba(180, 120, 20, ${lineOpacity})`}
              strokeWidth={1}
            />
          );
        })}

        {/* Outer vignette rings */}
        <ellipse cx={width / 2} cy={height / 2} rx={width * 0.48} ry={height * 0.46}
          fill="none"
          stroke={`rgba(180, 110, 10, ${0.08 + slowPulse * 0.04})`}
          strokeWidth={2}
        />
        <ellipse cx={width / 2} cy={height / 2} rx={width * 0.44} ry={height * 0.42}
          fill="none"
          stroke={`rgba(150, 90, 5, ${0.05 + medPulse * 0.03})`}
          strokeWidth={1}
        />
      </svg>

      {/* Top vignette overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 0%, transparent 30%, rgba(0,0,0,0.7) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Corner darkening */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.8) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Subtle golden shimmer overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at ${50 + Math.sin(frame * 0.01) * 10}% ${50 + Math.cos(frame * 0.013) * 8}%, rgba(180, 110, 0, ${0.04 + slowPulse * 0.02}) 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />
    </div>
  );
};