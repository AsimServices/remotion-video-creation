import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Pre-computed region shapes (simplified polygons as percentage coordinates)
const REGIONS = [
  { id: 0, points: '10,15 25,10 35,20 30,35 15,30', color: '#1a3a5c', label: 'NW' },
  { id: 1, points: '35,10 55,8 60,22 50,28 35,20', color: '#1a4a3c', label: 'N' },
  { id: 2, points: '60,8 80,12 82,25 68,28 55,22', color: '#2a3a6c', label: 'NE' },
  { id: 3, points: '10,35 25,30 30,48 20,55 8,45', color: '#3a2a5c', label: 'W' },
  { id: 4, points: '30,35 50,28 60,22 65,38 55,52 38,50', color: '#1a2a4c', label: 'C' },
  { id: 5, points: '65,28 82,25 85,42 75,50 60,45 65,38', color: '#2a4a4c', label: 'E' },
  { id: 6, points: '8,55 20,55 25,68 18,78 6,70', color: '#3a3a2c', label: 'SW' },
  { id: 7, points: '25,55 38,50 45,65 35,78 22,75', color: '#2a3a3c', label: 'SC' },
  { id: 8, points: '45,52 60,45 68,58 60,72 48,70', color: '#1a4a5c', label: 'SE-W' },
  { id: 9, points: '60,45 75,50 78,62 68,75 60,72', color: '#3a2a4c', label: 'SE' },
];

// Pre-computed data markers with deterministic positions
const MARKERS = Array.from({ length: 120 }, (_, i) => ({
  x: 5 + (i * 1731 + 137) % 80,
  y: 5 + (i * 1337 + 271) % 80,
  size: 3 + (i % 7),
  regionId: i % 10,
  pulseOffset: (i * 47) % 100,
  year: 2019 + (i % 5),
  delay: (i * 13) % 300,
  brightness: 0.5 + ((i * 73) % 50) / 100,
}));

// Pre-computed connection lines
const CONNECTIONS = Array.from({ length: 40 }, (_, i) => ({
  x1: 10 + (i * 1531) % 75,
  y1: 10 + (i * 1173) % 75,
  x2: 10 + (i * 1731 + 500) % 75,
  y2: 10 + (i * 1337 + 300) % 75,
  delay: (i * 17) % 250,
  opacity: 0.15 + ((i * 31) % 30) / 100,
}));

// Pre-computed particle trail
const PARTICLES = Array.from({ length: 200 }, (_, i) => ({
  x: 5 + (i * 2731) % 88,
  y: 5 + (i * 2137) % 88,
  size: 1 + (i % 3),
  speed: 0.5 + ((i * 53) % 50) / 100,
  phase: (i * 61) % 100,
}));

// Year labels positions
const YEAR_DATA = [
  { year: 2019, growth: 8, cx: 20, cy: 88 },
  { year: 2020, growth: -3, cx: 35, cy: 88 },
  { year: 2021, growth: 12, cx: 50, cy: 88 },
  { year: 2022, growth: 18, cx: 65, cy: 88 },
  { year: 2023, growth: 24, cx: 80, cy: 88 },
];

export const YearOverYearGrowthMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const progress = frame / durationInFrames;
  const cycleProgress = (frame % 120) / 120;

  // Map viewBox
  const vw = 100;
  const vh = 100;

  return (
    <div
      style={{
        width,
        height,
        background: '#070a12',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background grid */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#0e1f35" strokeWidth="0.15" />
          </pattern>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="100" height="100" fill="url(#bgGlow)" />
        <rect width="100" height="100" fill="url(#grid)" />
      </svg>

      {/* Main map SVG */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Region polygons */}
        {REGIONS.map((region) => {
          const regionProgress = interpolate(
            frame,
            [region.id * 20, region.id * 20 + 80],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const pulse = Math.sin(frame * 0.03 + region.id * 0.7) * 0.15 + 0.85;
          return (
            <g key={region.id}>
              <polygon
                points={region.points}
                fill={region.color}
                fillOpacity={regionProgress * 0.7 * pulse}
                stroke="#1e4080"
                strokeWidth="0.3"
                strokeOpacity={regionProgress * 0.8}
              />
              <polygon
                points={region.points}
                fill="none"
                stroke="#2a7fff"
                strokeWidth="0.15"
                strokeOpacity={regionProgress * 0.4 * pulse}
              />
            </g>
          );
        })}

        {/* Connection lines */}
        {CONNECTIONS.map((conn, i) => {
          const lineProgress = interpolate(
            frame,
            [conn.delay, conn.delay + 60],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const flowAnim = (frame * 0.5 + i * 10) % 100 / 100;
          return (
            <line
              key={i}
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              stroke="#1e6fff"
              strokeWidth="0.12"
              strokeOpacity={lineProgress * conn.opacity * (0.5 + flowAnim * 0.5)}
              strokeDasharray="1,2"
              strokeDashoffset={-flowAnim * 30}
            />
          );
        })}

        {/* Data markers multiplying */}
        {MARKERS.map((marker, i) => {
          const markerProgress = interpolate(
            frame,
            [marker.delay, marker.delay + 40],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const pulsePhase = Math.sin((frame * 0.05 + marker.pulseOffset * 0.1) * Math.PI);
          const pulse = 1 + pulsePhase * 0.3 * markerProgress;
          const ringScale = 1 + ((frame * 0.03 + marker.pulseOffset * 0.05) % 1) * 2;
          const ringOpacity = (1 - ((frame * 0.03 + marker.pulseOffset * 0.05) % 1)) * markerProgress * 0.6;

          // Color based on year/growth
          const markerColor = marker.year === 2019 ? '#ff6b35'
            : marker.year === 2020 ? '#ff3535'
            : marker.year === 2021 ? '#35ff6b'
            : marker.year === 2022 ? '#35a0ff'
            : '#c035ff';

          return (
            <g key={i} filter="url(#glow)">
              {/* Pulse ring */}
              <circle
                cx={marker.x}
                cy={marker.y}
                r={marker.size * 0.4 * ringScale}
                fill="none"
                stroke={markerColor}
                strokeWidth="0.15"
                strokeOpacity={ringOpacity}
              />
              {/* Core dot */}
              <circle
                cx={marker.x}
                cy={marker.y}
                r={marker.size * 0.18 * pulse}
                fill={markerColor}
                fillOpacity={markerProgress * marker.brightness}
              />
              {/* Inner bright */}
              <circle
                cx={marker.x}
                cy={marker.y}
                r={marker.size * 0.07 * pulse}
                fill="white"
                fillOpacity={markerProgress * 0.8}
              />
            </g>
          );
        })}

        {/* Particles */}
        {PARTICLES.map((p, i) => {
          const particleFrame = (frame * p.speed + p.phase * 6) % durationInFrames;
          const particleProgress = interpolate(
            frame,
            [50 + i % 100, 150 + i % 100],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const twinkle = Math.abs(Math.sin((frame * 0.04 + p.phase * 0.2)));
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={p.size * 0.06}
              fill="#4a90e2"
              fillOpacity={particleProgress * twinkle * 0.4}
            />
          );
        })}

        {/* Year bar chart at bottom */}
        {YEAR_DATA.map((yd, i) => {
          const barProgress = interpolate(
            frame,
            [i * 40 + 100, i * 40 + 180],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const barHeight = Math.abs(yd.growth) * 0.08 * barProgress;
          const barColor = yd.growth >= 0 ? '#00e5a0' : '#ff4444';
          const barY = yd.growth >= 0 ? 90 - barHeight : 90;
          const glowPulse = 0.7 + Math.sin(frame * 0.05 + i) * 0.3;

          return (
            <g key={i} filter="url(#glow)">
              {/* Bar */}
              <rect
                x={yd.cx - 1.5}
                y={barY}
                width={3}
                height={barHeight}
                fill={barColor}
                fillOpacity={0.8 * glowPulse}
                rx="0.3"
              />
              {/* Bar top glow */}
              <rect
                x={yd.cx - 1.5}
                y={barY}
                width={3}
                height={0.4}
                fill="white"
                fillOpacity={barProgress * 0.6 * glowPulse}
                rx="0.2"
              />
              {/* Baseline */}
              <line
                x1={yd.cx - 3}
                y1={90}
                x2={yd.cx + 3}
                y2={90}
                stroke="#2a4a6c"
                strokeWidth="0.15"
                strokeOpacity={0.6}
              />
            </g>
          );
        })}

        {/* Timeline axis */}
        <line
          x1="8"
          y1="90"
          x2="90"
          y2="90"
          stroke="#1e3a5c"
          strokeWidth="0.2"
          strokeOpacity={interpolate(frame, [80, 130], [0, 0.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
        />

        {/* Scanning sweep line */}
        <line
          x1={5 + cycleProgress * 80}
          y1="5"
          x2={5 + cycleProgress * 80}
          y2="85"
          stroke="#2a7fff"
          strokeWidth="0.2"
          strokeOpacity={0.25}
        />
        <rect
          x={5 + cycleProgress * 80 - 2}
          y="5"
          width={4}
          height={80}
          fill="url(#scanGrad)"
          fillOpacity={0.08}
        />

        {/* Corner decorations */}
        <path d="M2,2 L8,2 L8,2.5 L2.5,2.5 L2.5,8 L2,8 Z" fill="none" stroke="#2a7fff" strokeWidth="0.3" strokeOpacity="0.6" />
        <path d="M92,2 L98,2 L98,8 L97.5,8 L97.5,2.5 L92,2.5 Z" fill="none" stroke="#2a7fff" strokeWidth="0.3" strokeOpacity="0.6" />
        <path d="M2,92 L2,98 L8,98 L8,97.5 L2.5,97.5 L2.5,92 Z" fill="none" stroke="#2a7fff" strokeWidth="0.3" strokeOpacity="0.6" />
        <path d="M92,98 L98,98 L98,92 L97.5,92 L97.5,97.5 L92,97.5 Z" fill="none" stroke="#2a7fff" strokeWidth="0.3" strokeOpacity="0.6" />

        {/* Growth indicator arcs */}
        {[0, 1, 2, 3].map((ring) => {
          const ringProgress = interpolate(
            frame,
            [200 + ring * 30, 260 + ring * 30],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const r = 5 + ring * 3;
          const pulse = 1 + Math.sin(frame * 0.04 + ring * 0.8) * 0.05;
          return (
            <circle
              key={ring}
              cx="50"
              cy="45"
              r={r * pulse}
              fill="none"
              stroke="#2a9fff"
              strokeWidth="0.2"
              strokeOpacity={ringProgress * (0.3 - ring * 0.06)}
              strokeDasharray="2,3"
            />
          );
        })}

        {/* Central hotspot */}
        <circle
          cx="50"
          cy="45"
          r={0.8 + Math.sin(frame * 0.08) * 0.2}
          fill="#5af"
          fillOpacity={0.9 * interpolate(frame, [150, 200], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
          filter="url(#strongGlow)"
        />

        {/* Gradient defs for sweep */}
        <defs>
          <linearGradient id="scanGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2a7fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#2a7fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#2a7fff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Overlay vignette */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(2,4,8,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};