import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NUM_MARKERS = 18;
const NUM_PARTICLES_PER_MARKER = 32;
const CYCLE_FRAMES = 120;

const MARKERS = Array.from({ length: NUM_MARKERS }, (_, i) => ({
  x: ((i * 2137 + 500) % 3200) + 320,
  y: ((i * 1733 + 300) % 1700) + 230,
  size: ((i * 317) % 24) + 18,
  hue: (i * 37 + 180) % 360,
  phase: (i * 41) % CYCLE_FRAMES,
  color1: `hsl(${(i * 37 + 180) % 360}, 85%, 70%)`,
  color2: `hsl(${(i * 37 + 220) % 360}, 95%, 85%)`,
}));

const PARTICLES = Array.from({ length: NUM_MARKERS }, (_, mi) =>
  Array.from({ length: NUM_PARTICLES_PER_MARKER }, (_, pi) => {
    const angle = (pi / NUM_PARTICLES_PER_MARKER) * Math.PI * 2 + (mi * 0.7);
    const dist = ((pi * 173 + mi * 89) % 80) + 40;
    const spin = ((pi * 57 + mi * 23) % 360);
    const size = ((pi * 13 + mi * 7) % 6) + 2;
    return { angle, dist, spin, size };
  })
);

const MAP_LINES = Array.from({ length: 22 }, (_, i) => ({
  x1: (i * 1031) % 3840,
  y1: (i * 877) % 2160,
  x2: ((i * 1031 + 900) % 3840),
  y2: ((i * 877 + 600) % 2160),
  opacity: 0.05 + (i % 5) * 0.02,
}));

const GRID_COLS = 38;
const GRID_ROWS = 22;

const DOT_FIELD = Array.from({ length: GRID_ROWS }, (_, row) =>
  Array.from({ length: GRID_COLS }, (_, col) => ({
    x: (col / (GRID_COLS - 1)) * 3840,
    y: (row / (GRID_ROWS - 1)) * 2160,
    pulse: (col * 7 + row * 13) % 60,
  }))
);

function crystalPath(cx: number, cy: number, r: number): string {
  const sides = 6;
  const pts = Array.from({ length: sides }, (_, i) => {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 6;
    const ir = i % 2 === 0 ? r : r * 0.55;
    return `${cx + Math.cos(a) * ir},${cy + Math.sin(a) * ir}`;
  });
  return `M${pts.join('L')}Z`;
}

function innerCrystal(cx: number, cy: number, r: number): string {
  const sides = 6;
  const pts = Array.from({ length: sides }, (_, i) => {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 6;
    const ir = r * 0.38;
    return `${cx + Math.cos(a) * ir},${cy + Math.sin(a) * ir}`;
  });
  return `M${pts.join('L')}Z`;
}

export const CrystallineDataMarkers: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div style={{ width, height, background: '#060a10', overflow: 'hidden', position: 'relative', opacity: globalOpacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {MARKERS.map((m, i) => (
            <radialGradient key={`rg${i}`} id={`rg${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={m.color2} stopOpacity="0.95" />
              <stop offset="60%" stopColor={m.color1} stopOpacity="0.7" />
              <stop offset="100%" stopColor={m.color1} stopOpacity="0" />
            </radialGradient>
          ))}
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0d1a2e" />
            <stop offset="100%" stopColor="#060a10" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softglow" x="-80%" y="-80%" width="360%" height="360%">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="particleglow" x="-100%" y="-100%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width={width} height={height} fill="url(#bgGlow)" />

        {/* Grid dots */}
        {DOT_FIELD.map((row, ri) =>
          row.map((dot, ci) => {
            const pulse = Math.sin((frame + dot.pulse) * 0.04) * 0.5 + 0.5;
            return (
              <circle
                key={`d${ri}-${ci}`}
                cx={dot.x}
                cy={dot.y}
                r={1.2 + pulse * 0.8}
                fill={`rgba(80, 160, 255, ${0.06 + pulse * 0.07})`}
              />
            );
          })
        )}

        {/* Map connection lines */}
        {MAP_LINES.map((l, i) => (
          <line
            key={`ml${i}`}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke={`rgba(60,140,255,${l.opacity})`}
            strokeWidth={0.8}
          />
        ))}

        {/* Connection lines between markers */}
        {MARKERS.map((ma, ia) =>
          MARKERS.slice(ia + 1, ia + 3).map((mb, ib) => {
            const localFrameA = (frame + ma.phase) % CYCLE_FRAMES;
            const localFrameB = (frame + mb.phase) % CYCLE_FRAMES;
            const reformA = localFrameA / CYCLE_FRAMES;
            const reformB = localFrameB / CYCLE_FRAMES;
            const bothFormed = Math.min(
              interpolate(reformA, [0.5, 0.75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              interpolate(reformB, [0.5, 0.75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            );
            return (
              <line
                key={`cl${ia}-${ib}`}
                x1={ma.x} y1={ma.y} x2={mb.x} y2={mb.y}
                stroke={`hsla(${ma.hue}, 80%, 65%, ${bothFormed * 0.18})`}
                strokeWidth={1.5}
                strokeDasharray="8 14"
              />
            );
          })
        )}

        {/* Markers */}
        {MARKERS.map((m, mi) => {
          const localFrame = (frame + m.phase) % CYCLE_FRAMES;
          const t = localFrame / CYCLE_FRAMES;

          // Phase: 0-0.15 formed, 0.15-0.4 shattering, 0.4-0.5 dispersed, 0.5-0.75 reforming, 0.75-1.0 formed
          const isFormed1 = t < 0.15;
          const isShattering = t >= 0.15 && t < 0.4;
          const isDispersed = t >= 0.4 && t < 0.5;
          const isReforming = t >= 0.5 && t < 0.75;
          const isFormed2 = t >= 0.75;

          const shatterProgress = isShattering
            ? interpolate(t, [0.15, 0.4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            : isDispersed ? 1 : 0;

          const reformProgress = isReforming
            ? interpolate(t, [0.5, 0.75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            : isFormed2 ? 1 : 0;

          const crystalOpacity = (isFormed1 || isFormed2)
            ? 1
            : isShattering
              ? interpolate(t, [0.15, 0.4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : isReforming
                ? interpolate(t, [0.5, 0.75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : 0;

          const crystalScale = isFormed1
            ? 1 + Math.sin(frame * 0.04 + mi) * 0.04
            : isShattering
              ? interpolate(t, [0.15, 0.4], [1, 1.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : isReforming
                ? interpolate(t, [0.5, 0.75], [0.5, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : isFormed2
                  ? 1 + Math.sin(frame * 0.04 + mi) * 0.04
                  : 1;

          const glowPulse = Math.sin(frame * 0.05 + mi * 1.3) * 0.5 + 0.5;

          return (
            <g key={`marker${mi}`}>
              {/* Glow halo */}
              {crystalOpacity > 0 && (
                <circle
                  cx={m.x}
                  cy={m.y}
                  r={m.size * 3.5 * crystalScale * (1 + glowPulse * 0.3)}
                  fill={`url(#rg${mi})`}
                  opacity={crystalOpacity * 0.6}
                />
              )}

              {/* Particles */}
              {PARTICLES[mi].map((p, pi) => {
                const particleProgress = shatterProgress > 0
                  ? shatterProgress
                  : reformProgress > 0
                    ? 1 - reformProgress
                    : 0;

                if (particleProgress < 0.01) return null;

                const px = m.x + Math.cos(p.angle) * p.dist * particleProgress;
                const py = m.y + Math.sin(p.angle) * p.dist * particleProgress;
                const pOpacity = particleProgress * (1 - particleProgress * 0.5);
                const pScale = particleProgress;

                return (
                  <g key={`p${pi}`} filter="url(#particleglow)">
                    <rect
                      x={px - p.size * pScale / 2}
                      y={py - p.size * pScale / 2}
                      width={p.size * pScale}
                      height={p.size * pScale}
                      fill={m.color1}
                      opacity={pOpacity * 0.9}
                      transform={`rotate(${p.spin + shatterProgress * 180}, ${px}, ${py})`}
                    />
                    <circle
                      cx={px}
                      cy={py}
                      r={p.size * pScale * 0.4}
                      fill={m.color2}
                      opacity={pOpacity}
                    />
                  </g>
                );
              })}

              {/* Crystal body */}
              {crystalOpacity > 0.01 && (
                <g
                  filter="url(#glow)"
                  transform={`translate(${m.x},${m.y}) scale(${crystalScale}) translate(${-m.x},${-m.y})`}
                  opacity={crystalOpacity}
                >
                  {/* Outer shell */}
                  <path
                    d={crystalPath(m.x, m.y, m.size)}
                    fill={`hsla(${m.hue}, 80%, 60%, 0.25)`}
                    stroke={m.color1}
                    strokeWidth={1.5}
                  />
                  {/* Mid ring */}
                  <path
                    d={crystalPath(m.x, m.y, m.size * 0.75)}
                    fill={`hsla(${m.hue}, 90%, 75%, 0.2)`}
                    stroke={m.color2}
                    strokeWidth={1}
                  />
                  {/* Inner gem */}
                  <path
                    d={innerCrystal(m.x, m.y, m.size)}
                    fill={m.color2}
                    opacity={0.85}
                  />
                  {/* Center dot */}
                  <circle cx={m.x} cy={m.y} r={m.size * 0.12} fill="#ffffff" opacity={0.95} />
                  {/* Sparkle lines */}
                  {[0, 1, 2, 3].map(si => {
                    const sa = (si / 4) * Math.PI * 2 + frame * 0.02 + mi;
                    return (
                      <line
                        key={`sp${si}`}
                        x1={m.x + Math.cos(sa) * m.size * 0.15}
                        y1={m.y + Math.sin(sa) * m.size * 0.15}
                        x2={m.x + Math.cos(sa) * m.size * 0.9}
                        y2={m.y + Math.sin(sa) * m.size * 0.9}
                        stroke={m.color2}
                        strokeWidth={0.8}
                        opacity={0.5}
                      />
                    );
                  })}
                </g>
              )}
            </g>
          );
        })}

        {/* Ambient scan line */}
        {(() => {
          const scanY = ((frame * 3.6) % (height + 200)) - 100;
          return (
            <rect
              x={0}
              y={scanY}
              width={width}
              height={2}
              fill="rgba(80, 180, 255, 0.04)"
            />
          );
        })()}

        {/* Vignette */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.65)" />
        </radialGradient>
        <rect width={width} height={height} fill="url(#vignette)" />
      </svg>
    </div>
  );
};