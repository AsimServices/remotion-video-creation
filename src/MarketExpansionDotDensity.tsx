import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const GRID_COLS = 80;
const GRID_ROWS = 45;
const TOTAL_DOTS = GRID_COLS * GRID_ROWS;

const DOTS = Array.from({ length: TOTAL_DOTS }, (_, i) => {
  const col = i % GRID_COLS;
  const row = Math.floor(i / GRID_COLS);
  const jitterX = ((i * 1731 + row * 317) % 40) - 20;
  const jitterY = ((i * 937 + col * 211) % 30) - 15;
  const size = ((i * 73 + row * 19) % 6) + 2;
  const brightness = ((i * 53 + col * 31) % 60) + 40;
  const phase = (i * 127 + row * 43) % 100;
  const isOriginal = i % 2 === 0;
  return { col, row, jitterX, jitterY, size, brightness, phase, isOriginal };
});

const REGION_ZONES = Array.from({ length: 12 }, (_, i) => ({
  cx: ((i * 1234 + 500) % 3200) + 320,
  cy: ((i * 876 + 300) % 1700) + 230,
  rx: ((i * 543) % 400) + 200,
  ry: ((i * 321) % 250) + 120,
  delay: ((i * 47) % 100) / 100,
  hue: (i * 37 + 180) % 360,
}));

const PULSE_RINGS = Array.from({ length: 8 }, (_, i) => ({
  cx: ((i * 1567 + 400) % 3200) + 320,
  cy: ((i * 987 + 200) % 1700) + 230,
  delay: (i * 0.12),
  hue: (i * 45 + 200) % 360,
}));

const CONNECTIONS = Array.from({ length: 20 }, (_, i) => ({
  x1: ((i * 1234) % 3200) + 320,
  y1: ((i * 876) % 1700) + 230,
  x2: (((i + 3) * 1731) % 3200) + 320,
  y2: (((i + 3) * 937) % 1700) + 230,
  delay: (i * 0.04),
}));

export const MarketExpansionDotDensity: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const expansionProgress = interpolate(frame, [80, 350], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const expansionEased = expansionProgress < 0.5
    ? 2 * expansionProgress * expansionProgress
    : 1 - Math.pow(-2 * expansionProgress + 2, 2) / 2;

  const dividerX = interpolate(expansionEased, [0, 1], [width * 0.5, width * 0.05]);

  const scanlineY = interpolate(frame, [80, 350], [-50, height + 50], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const cellW = width / GRID_COLS;
  const cellH = height / GRID_ROWS;

  return (
    <div style={{ width, height, background: '#050810', opacity: globalOpacity, overflow: 'hidden', position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>
          <radialGradient id="expansionGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a3a6a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#020408" stopOpacity="0" />
          </radialGradient>
          <filter id="glow1">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="leftClip">
            <rect x={0} y={0} width={dividerX} height={height} />
          </clipPath>
          <clipPath id="rightClip">
            <rect x={dividerX} y={0} width={width - dividerX} height={height} />
          </clipPath>
        </defs>

        <rect width={width} height={height} fill="url(#bgGlow)" />

        {/* Grid lines - subtle */}
        {Array.from({ length: GRID_COLS + 1 }, (_, i) => (
          <line
            key={`vl-${i}`}
            x1={i * cellW} y1={0} x2={i * cellW} y2={height}
            stroke="#0d1a2e" strokeWidth="0.5" strokeOpacity="0.4"
          />
        ))}
        {Array.from({ length: GRID_ROWS + 1 }, (_, i) => (
          <line
            key={`hl-${i}`}
            x1={0} y1={i * cellH} x2={width} y2={i * cellH}
            stroke="#0d1a2e" strokeWidth="0.5" strokeOpacity="0.4"
          />
        ))}

        {/* Region zones glow - right side (expanded) */}
        {REGION_ZONES.map((zone, i) => {
          const zoneProgress = interpolate(expansionEased, [zone.delay, Math.min(zone.delay + 0.4, 1)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const pulse = Math.sin(frame * 0.04 + i * 0.7) * 0.3 + 0.7;
          return (
            <ellipse
              key={`zone-${i}`}
              cx={zone.cx} cy={zone.cy}
              rx={zone.rx * zoneProgress * pulse}
              ry={zone.ry * zoneProgress * pulse}
              fill={`hsla(${zone.hue}, 70%, 40%, ${0.06 * zoneProgress})`}
              stroke={`hsla(${zone.hue}, 80%, 60%, ${0.15 * zoneProgress})`}
              strokeWidth="1"
              clipPath="url(#rightClip)"
            />
          );
        })}

        {/* Original dots - left side (before) */}
        {DOTS.filter(d => d.isOriginal).map((dot, i) => {
          const x = dot.col * cellW + cellW / 2 + dot.jitterX;
          const y = dot.row * cellH + cellH / 2 + dot.jitterY;
          const pulse = Math.sin(frame * 0.03 + dot.phase * 0.063) * 0.25 + 0.75;
          const opacity = 0.5 + pulse * 0.3;
          const hue = 200 + (dot.brightness % 40);
          return (
            <circle
              key={`orig-${i}`}
              cx={x} cy={y}
              r={dot.size * 0.7}
              fill={`hsla(${hue}, 60%, ${dot.brightness}%, ${opacity})`}
              clipPath="url(#leftClip)"
            />
          );
        })}

        {/* Expanded dots - right side (after) - all dots including new ones */}
        {DOTS.map((dot, i) => {
          const x = dot.col * cellW + cellW / 2 + dot.jitterX;
          const y = dot.row * cellH + cellH / 2 + dot.jitterY;
          const dotDelay = (dot.col / GRID_COLS) * 0.6 + (dot.row / GRID_ROWS) * 0.2;
          const dotProgress = interpolate(
            expansionEased,
            [dotDelay * 0.8, Math.min(dotDelay * 0.8 + 0.3, 1)],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const pulse = Math.sin(frame * 0.04 + dot.phase * 0.063 + i * 0.1) * 0.3 + 0.7;
          const hue = dot.isOriginal ? 200 + (dot.brightness % 30) : 160 + (dot.brightness % 50);
          const sat = dot.isOriginal ? 55 : 75;
          const lit = dot.isOriginal ? dot.brightness : Math.min(dot.brightness + 20, 85);
          const opacity = dotProgress * (0.6 + pulse * 0.35);
          const r = dot.size * (dot.isOriginal ? 0.7 : 0.9) * dotProgress;
          return (
            <circle
              key={`exp-${i}`}
              cx={x} cy={y}
              r={r}
              fill={`hsla(${hue}, ${sat}%, ${lit}%, ${opacity})`}
              clipPath="url(#rightClip)"
              filter={dot.isOriginal ? undefined : "url(#glow1)"}
            />
          );
        })}

        {/* Connections between dots - right side */}
        {CONNECTIONS.map((conn, i) => {
          const connProgress = interpolate(expansionEased, [conn.delay + 0.3, Math.min(conn.delay + 0.7, 1)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const pulse = Math.sin(frame * 0.05 + i * 0.4) * 0.4 + 0.6;
          return (
            <line
              key={`conn-${i}`}
              x1={conn.x1} y1={conn.y1}
              x2={conn.x2} y2={conn.y2}
              stroke={`hsla(180, 70%, 60%, ${0.2 * connProgress * pulse})`}
              strokeWidth="1.5"
              strokeDasharray="8 12"
              clipPath="url(#rightClip)"
            />
          );
        })}

        {/* Scanline effect during transition */}
        {expansionProgress > 0 && expansionProgress < 1 && (
          <>
            <rect
              x={0} y={scanlineY - 60}
              width={width} height={120}
              fill="none"
              stroke="rgba(100,200,255,0.6)"
              strokeWidth="2"
              filter="url(#softGlow)"
            />
            <rect
              x={0} y={scanlineY - 30}
              width={width} height={60}
              fill="rgba(100,200,255,0.03)"
            />
          </>
        )}

        {/* Divider line */}
        <line
          x1={dividerX} y1={0}
          x2={dividerX} y2={height}
          stroke="rgba(100,200,255,0.7)"
          strokeWidth="3"
          filter="url(#glow2)"
        />
        <line
          x1={dividerX} y1={0}
          x2={dividerX} y2={height}
          stroke="rgba(180,230,255,0.9)"
          strokeWidth="1"
        />

        {/* Pulse rings on right side */}
        {PULSE_RINGS.map((ring, i) => {
          const ringProgress = interpolate(expansionEased, [ring.delay, Math.min(ring.delay + 0.5, 1)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const cycleDuration = 120;
          const cycleFrame = (frame + i * 40) % cycleDuration;
          const cycleProgress = cycleFrame / cycleDuration;
          const pulsRadius = interpolate(cycleProgress, [0, 1], [0, 280]);
          const pulseOpacity = interpolate(cycleProgress, [0, 0.3, 1], [0, 0.5, 0]) * ringProgress;
          return (
            <circle
              key={`pulse-${i}`}
              cx={ring.cx} cy={ring.cy}
              r={pulsRadius}
              fill="none"
              stroke={`hsla(${ring.hue}, 80%, 65%, ${pulseOpacity})`}
              strokeWidth="2"
              clipPath="url(#rightClip)"
              filter="url(#glow1)"
            />
          );
        })}

        {/* Corner accent decorations */}
        {[
          { x: 40, y: 40 }, { x: width - 40, y: 40 },
          { x: 40, y: height - 40 }, { x: width - 40, y: height - 40 }
        ].map((corner, i) => {
          const pulse = Math.sin(frame * 0.05 + i * 1.2) * 0.3 + 0.7;
          return (
            <g key={`corner-${i}`} opacity={pulse}>
              <circle cx={corner.x} cy={corner.y} r={20} fill="none" stroke="rgba(100,180,255,0.3)" strokeWidth="1.5" />
              <circle cx={corner.x} cy={corner.y} r={6} fill="rgba(100,180,255,0.4)" />
              <line x1={corner.x - 30} y1={corner.y} x2={corner.x + 30} y2={corner.y} stroke="rgba(100,180,255,0.2)" strokeWidth="1" />
              <line x1={corner.x} y1={corner.y - 30} x2={corner.x} y2={corner.y + 30} stroke="rgba(100,180,255,0.2)" strokeWidth="1" />
            </g>
          );
        })}

        {/* Left side dim overlay - before state */}
        <rect
          x={0} y={0}
          width={dividerX} height={height}
          fill="rgba(2,4,8,0.25)"
        />

        {/* Glow behind divider */}
        <rect
          x={dividerX - 60} y={0}
          width={120} height={height}
          fill="rgba(100,200,255,0.04)"
          filter="url(#softGlow)"
        />

      </svg>
    </div>
  );
};