import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const STATES = [
  { id: 'AL', x: 640, y: 620, value: 72, label: 'AL' },
  { id: 'AK', x: 120, y: 780, value: 45, label: 'AK' },
  { id: 'AZ', x: 195, y: 560, value: 88, label: 'AZ' },
  { id: 'AR', x: 585, y: 570, value: 61, label: 'AR' },
  { id: 'CA', x: 105, y: 480, value: 95, label: 'CA' },
  { id: 'CO', x: 295, y: 470, value: 79, label: 'CO' },
  { id: 'CT', x: 845, y: 360, value: 83, label: 'CT' },
  { id: 'DE', x: 825, y: 415, value: 67, label: 'DE' },
  { id: 'FL', x: 700, y: 700, value: 91, label: 'FL' },
  { id: 'GA', x: 680, y: 630, value: 76, label: 'GA' },
  { id: 'HI', x: 250, y: 820, value: 58, label: 'HI' },
  { id: 'ID', x: 190, y: 330, value: 55, label: 'ID' },
  { id: 'IL', x: 620, y: 430, value: 87, label: 'IL' },
  { id: 'IN', x: 660, y: 420, value: 74, label: 'IN' },
  { id: 'IA', x: 555, y: 390, value: 68, label: 'IA' },
  { id: 'KS', x: 465, y: 490, value: 63, label: 'KS' },
  { id: 'KY', x: 668, y: 480, value: 71, label: 'KY' },
  { id: 'LA', x: 580, y: 640, value: 66, label: 'LA' },
  { id: 'ME', x: 875, y: 275, value: 52, label: 'ME' },
  { id: 'MD', x: 812, y: 420, value: 80, label: 'MD' },
  { id: 'MA', x: 860, y: 345, value: 86, label: 'MA' },
  { id: 'MI', x: 650, y: 355, value: 82, label: 'MI' },
  { id: 'MN', x: 530, y: 320, value: 75, label: 'MN' },
  { id: 'MS', x: 620, y: 620, value: 59, label: 'MS' },
  { id: 'MO', x: 565, y: 470, value: 73, label: 'MO' },
  { id: 'MT', x: 270, y: 300, value: 50, label: 'MT' },
  { id: 'NE', x: 450, y: 420, value: 64, label: 'NE' },
  { id: 'NV', x: 155, y: 430, value: 77, label: 'NV' },
  { id: 'NH', x: 855, y: 315, value: 70, label: 'NH' },
  { id: 'NJ', x: 835, y: 395, value: 89, label: 'NJ' },
  { id: 'NM', x: 275, y: 550, value: 62, label: 'NM' },
  { id: 'NY', x: 805, y: 345, value: 93, label: 'NY' },
  { id: 'NC', x: 735, y: 530, value: 81, label: 'NC' },
  { id: 'ND', x: 440, y: 300, value: 48, label: 'ND' },
  { id: 'OH', x: 700, y: 410, value: 85, label: 'OH' },
  { id: 'OK', x: 450, y: 540, value: 65, label: 'OK' },
  { id: 'OR', x: 130, y: 350, value: 78, label: 'OR' },
  { id: 'PA', x: 770, y: 385, value: 88, label: 'PA' },
  { id: 'RI', x: 858, y: 358, value: 69, label: 'RI' },
  { id: 'SC', x: 720, y: 565, value: 74, label: 'SC' },
  { id: 'SD', x: 445, y: 355, value: 53, label: 'SD' },
  { id: 'TN', x: 652, y: 518, value: 76, label: 'TN' },
  { id: 'TX', x: 420, y: 620, value: 94, label: 'TX' },
  { id: 'UT', x: 225, y: 450, value: 71, label: 'UT' },
  { id: 'VT', x: 840, y: 300, value: 60, label: 'VT' },
  { id: 'VA', x: 770, y: 470, value: 83, label: 'VA' },
  { id: 'WA', x: 145, y: 280, value: 90, label: 'WA' },
  { id: 'WV', x: 740, y: 445, value: 57, label: 'WV' },
  { id: 'WI', x: 590, y: 350, value: 77, label: 'WI' },
  { id: 'WY', x: 295, y: 375, value: 56, label: 'WY' },
];

const GRID_LINES = Array.from({ length: 20 }, (_, i) => i);

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  x: (i * 1731 + 200) % 980,
  y: (i * 1337 + 150) % 700,
  size: ((i * 73) % 3) + 1,
  speed: ((i * 37) % 40) + 20,
  offset: (i * 97) % 100,
}));

const CONNECTION_PAIRS = Array.from({ length: 18 }, (_, i) => ({
  from: (i * 7) % STATES.length,
  to: (i * 13 + 5) % STATES.length,
  delay: (i * 23) % 60,
}));

function getColor(value: number): string {
  if (value >= 85) return '#ff4d6d';
  if (value >= 70) return '#ff9f1c';
  if (value >= 55) return '#06d6a0';
  return '#4cc9f0';
}

function getGlowColor(value: number): string {
  if (value >= 85) return 'rgba(255,77,109,';
  if (value >= 70) return 'rgba(255,159,28,';
  if (value >= 55) return 'rgba(6,214,160,';
  return 'rgba(76,201,240,';
}

export const USASalesMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const scaleX = width / 980;
  const scaleY = height / 900;

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const scanLine = ((frame * 1.2) % (height + 100)) - 50;

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at center, #0a0f1e 0%, #020408 100%)',
        overflow: 'hidden',
        opacity,
        position: 'relative',
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0d2040" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#020408" stopOpacity="0" />
          </radialGradient>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="blur8">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="blur16">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background glow */}
        <ellipse
          cx={width / 2}
          cy={height / 2}
          rx={width * 0.55}
          ry={height * 0.45}
          fill="url(#bgGlow)"
        />

        {/* Grid lines horizontal */}
        {GRID_LINES.map((i) => {
          const y = (i / 20) * height;
          const gridOpacity = interpolate(
            Math.sin((frame * 0.02) + i * 0.5),
            [-1, 1],
            [0.03, 0.08]
          );
          return (
            <line
              key={`gh-${i}`}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke="#1a3a5c"
              strokeWidth={0.5}
              opacity={gridOpacity}
            />
          );
        })}

        {/* Grid lines vertical */}
        {GRID_LINES.map((i) => {
          const x = (i / 20) * width;
          const gridOpacity = interpolate(
            Math.sin((frame * 0.02) + i * 0.3),
            [-1, 1],
            [0.03, 0.08]
          );
          return (
            <line
              key={`gv-${i}`}
              x1={x}
              y1={0}
              x2={x}
              y2={height}
              stroke="#1a3a5c"
              strokeWidth={0.5}
              opacity={gridOpacity}
            />
          );
        })}

        {/* Scan line */}
        <rect
          x={0}
          y={scanLine}
          width={width}
          height={3}
          fill="rgba(0,200,255,0.06)"
          filter="url(#blur2)"
        />

        {/* Floating particles */}
        {PARTICLES.map((p, i) => {
          const px = (p.x + (frame * 0.3 * (i % 2 === 0 ? 1 : -1))) % (width / scaleX);
          const py = (p.y + (frame * 0.15)) % (height / scaleY);
          const pOpacity = interpolate(
            Math.sin((frame * 0.05) + p.offset),
            [-1, 1],
            [0.1, 0.5]
          );
          return (
            <circle
              key={`p-${i}`}
              cx={px * scaleX}
              cy={py * scaleY}
              r={p.size * Math.min(scaleX, scaleY)}
              fill="#4cc9f0"
              opacity={pOpacity}
            />
          );
        })}

        {/* Connection lines between states */}
        {CONNECTION_PAIRS.map((pair, i) => {
          const fromState = STATES[pair.from];
          const toState = STATES[pair.to];
          const lineProgress = interpolate(
            (frame + pair.delay) % 120,
            [0, 60, 90, 120],
            [0, 1, 1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const fx = fromState.x * scaleX;
          const fy = fromState.y * scaleY;
          const tx = toState.x * scaleX;
          const ty = toState.y * scaleY;
          const cx1 = fx + (tx - fx) * lineProgress;
          const cy1 = fy + (ty - fy) * lineProgress;
          return (
            <g key={`conn-${i}`} opacity={lineProgress * 0.4}>
              <line
                x1={fx}
                y1={fy}
                x2={cx1}
                y2={cy1}
                stroke={getColor(fromState.value)}
                strokeWidth={1 * Math.min(scaleX, scaleY)}
                strokeDasharray={`${4 * scaleX} ${8 * scaleX}`}
                filter="url(#blur2)"
              />
            </g>
          );
        })}

        {/* State markers */}
        {STATES.map((state, i) => {
          const sx = state.x * scaleX;
          const sy = state.y * scaleY;
          const color = getColor(state.value);
          const glowColor = getGlowColor(state.value);

          const staggerDelay = (i * 7) % 50;
          const appear = interpolate(frame, [staggerDelay, staggerDelay + 30], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const pulse1 = interpolate(
            (frame + i * 13) % 90,
            [0, 45, 90],
            [0, 1, 0]
          );
          const pulse2 = interpolate(
            (frame + i * 13 + 30) % 90,
            [0, 45, 90],
            [0, 1, 0]
          );

          const baseRadius = (state.value / 100) * 14 + 6;
          const scaledBase = baseRadius * Math.min(scaleX, scaleY);
          const ring1Radius = scaledBase + pulse1 * 30 * Math.min(scaleX, scaleY);
          const ring2Radius = scaledBase + pulse2 * 50 * Math.min(scaleX, scaleY);

          const innerPulse = interpolate(
            Math.sin((frame * 0.08) + i * 1.1),
            [-1, 1],
            [0.7, 1.0]
          );

          return (
            <g key={state.id} opacity={appear}>
              {/* Outer glow rings */}
              <circle
                cx={sx}
                cy={sy}
                r={ring2Radius}
                fill="none"
                stroke={`${glowColor}${(pulse2 * 0.3).toFixed(2)})`}
                strokeWidth={1.5 * Math.min(scaleX, scaleY)}
                filter="url(#blur2)"
              />
              <circle
                cx={sx}
                cy={sy}
                r={ring1Radius}
                fill="none"
                stroke={`${glowColor}${(pulse1 * 0.5).toFixed(2)})`}
                strokeWidth={2 * Math.min(scaleX, scaleY)}
                filter="url(#blur2)"
              />

              {/* Glow halo */}
              <circle
                cx={sx}
                cy={sy}
                r={scaledBase * 2.5}
                fill={`${glowColor}0.08)`}
                filter="url(#blur8)"
              />

              {/* Core dot glow */}
              <circle
                cx={sx}
                cy={sy}
                r={scaledBase * 1.5}
                fill={`${glowColor}0.4)`}
                filter="url(#blur8)"
              />

              {/* Core dot */}
              <circle
                cx={sx}
                cy={sy}
                r={scaledBase}
                fill={color}
                opacity={innerPulse}
                filter="url(#glow)"
              />

              {/* Center bright spot */}
              <circle
                cx={sx}
                cy={sy}
                r={scaledBase * 0.35}
                fill="white"
                opacity={innerPulse * 0.9}
              />
            </g>
          );
        })}

        {/* Top performance beams */}
        {STATES.filter((s) => s.value >= 88).map((state, i) => {
          const sx = state.x * scaleX;
          const sy = state.y * scaleY;
          const beamHeight = interpolate(
            Math.sin((frame * 0.05) + i * 2),
            [-1, 1],
            [height * 0.1, height * 0.35]
          );
          const beamOpacity = interpolate(
            Math.sin((frame * 0.04) + i * 1.5),
            [-1, 1],
            [0.05, 0.2]
          );
          return (
            <line
              key={`beam-${state.id}`}
              x1={sx}
              y1={sy}
              x2={sx}
              y2={sy - beamHeight}
              stroke={getColor(state.value)}
              strokeWidth={2 * Math.min(scaleX, scaleY)}
              opacity={beamOpacity}
              filter="url(#blur8)"
            />
          );
        })}

        {/* Central map glow overlay */}
        <ellipse
          cx={width * 0.52}
          cy={height * 0.52}
          rx={width * 0.38}
          ry={height * 0.32}
          fill="none"
          stroke="rgba(0,200,255,0.04)"
          strokeWidth={width * 0.002}
          filter="url(#blur16)"
        />

        {/* Vignette effect */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stopColor="transparent" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.7" />
        </radialGradient>
        <rect x={0} y={0} width={width} height={height} fill="url(#vignette)" />

        {/* Top and bottom edge glow lines */}
        <line
          x1={0}
          y1={height * 0.05}
          x2={width}
          y2={height * 0.05}
          stroke="rgba(0,200,255,0.15)"
          strokeWidth={1}
          filter="url(#blur2)"
        />
        <line
          x1={0}
          y1={height * 0.95}
          x2={width}
          y2={height * 0.95}
          stroke="rgba(0,200,255,0.15)"
          strokeWidth={1}
          filter="url(#blur2)"
        />
      </svg>
    </div>
  );
};