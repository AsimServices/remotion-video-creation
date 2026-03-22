import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const LOCATIONS = Array.from({ length: 48 }, (_, i) => ({
  x: ((i * 1731 + 400) % 3200) + 320,
  y: ((i * 1337 + 200) % 1600) + 280,
  delay: (i * 11) % 300,
  size: ((i * 17) % 30) + 20,
  hue: (i * 37) % 60 + 10,
  ringCount: (i % 3) + 2,
}));

const CONNECTIONS = Array.from({ length: 60 }, (_, i) => ({
  from: (i * 7) % 48,
  to: (i * 13 + 5) % 48,
  delay: (i * 9) % 350,
  duration: 80 + (i * 13) % 60,
}));

const MAP_PATHS = Array.from({ length: 120 }, (_, i) => ({
  x1: ((i * 1531) % 3400) + 220,
  y1: ((i * 1123) % 1700) + 230,
  x2: ((i * 1531 + i * 523) % 3400) + 220,
  y2: ((i * 1123 + i * 317) % 1700) + 230,
  opacity: 0.04 + (i % 5) * 0.012,
}));

const GRID_LINES_H = Array.from({ length: 30 }, (_, i) => ({
  y: 100 + i * 66,
}));

const GRID_LINES_V = Array.from({ length: 55 }, (_, i) => ({
  x: 60 + i * 68,
}));

export const FranchiseExpansionPulse: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const wavePhase = frame * 0.02;

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 50% 50%, #0a0f1a 0%, #030508 100%)',
        overflow: 'hidden',
        opacity: globalOpacity,
        position: 'relative',
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Grid */}
        {GRID_LINES_H.map((line, i) => (
          <line
            key={`gh-${i}`}
            x1={0}
            y1={line.y}
            x2={width}
            y2={line.y}
            stroke="#1a3a5c"
            strokeWidth={0.5}
            opacity={0.2}
          />
        ))}
        {GRID_LINES_V.map((line, i) => (
          <line
            key={`gv-${i}`}
            x1={line.x}
            y1={0}
            x2={line.x}
            y2={height}
            stroke="#1a3a5c"
            strokeWidth={0.5}
            opacity={0.2}
          />
        ))}

        {/* Map texture paths */}
        {MAP_PATHS.map((path, i) => (
          <line
            key={`mp-${i}`}
            x1={path.x1}
            y1={path.y1}
            x2={path.x2}
            y2={path.y2}
            stroke="#2a5a8c"
            strokeWidth={1}
            opacity={path.opacity}
          />
        ))}

        {/* Territory fills - ellipses representing regions */}
        {LOCATIONS.map((loc, i) => {
          const active = frame > loc.delay;
          if (!active) return null;
          const age = frame - loc.delay;
          const territoryScale = interpolate(age, [0, 80], [0, 1], { extrapolateRight: 'clamp' });
          const territoryOpacity = interpolate(age, [0, 40, 200, 280], [0, 0.12, 0.08, 0.05], { extrapolateRight: 'clamp' });
          return (
            <ellipse
              key={`terr-${i}`}
              cx={loc.x}
              cy={loc.y}
              rx={loc.size * 8 * territoryScale}
              ry={loc.size * 5 * territoryScale}
              fill={`hsla(${loc.hue + 180}, 80%, 50%, ${territoryOpacity})`}
            />
          );
        })}

        {/* Connection lines between locations */}
        {CONNECTIONS.map((conn, i) => {
          const locA = LOCATIONS[conn.from];
          const locB = LOCATIONS[conn.to];
          const activeA = frame > locA.delay + 40;
          const activeB = frame > locB.delay + 40;
          if (!activeA || !activeB) return null;
          const connStart = Math.max(locA.delay, locB.delay) + 50;
          if (frame < connStart) return null;
          const age = frame - connStart;
          const progress = interpolate(age, [0, conn.duration], [0, 1], { extrapolateRight: 'clamp' });
          const connOpacity = interpolate(age, [0, 30, conn.duration, conn.duration + 60], [0, 0.5, 0.5, 0.15], { extrapolateRight: 'clamp' });

          const endX = locA.x + (locB.x - locA.x) * progress;
          const endY = locA.y + (locB.y - locA.y) * progress;

          return (
            <g key={`conn-${i}`}>
              <line
                x1={locA.x}
                y1={locA.y}
                x2={endX}
                y2={endY}
                stroke={`hsla(${(i * 23) % 60 + 160}, 90%, 70%, ${connOpacity})`}
                strokeWidth={1.5}
              />
            </g>
          );
        })}

        {/* Location markers with bloom rings */}
        {LOCATIONS.map((loc, i) => {
          const active = frame > loc.delay;
          if (!active) return null;
          const age = frame - loc.delay;

          const markerScale = interpolate(age, [0, 20, 30], [0, 1.4, 1], { extrapolateRight: 'clamp' });
          const markerOpacity = interpolate(age, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

          const rings = Array.from({ length: loc.ringCount }, (__, r) => {
            const ringOffset = r * 40;
            const ringAge = age - ringOffset;
            if (ringAge < 0) return null;
            const ringProgress = (ringAge % 120) / 120;
            const ringRadius = interpolate(ringProgress, [0, 1], [loc.size * 0.5, loc.size * 4]);
            const ringOpacity = interpolate(ringProgress, [0, 0.3, 1], [0.8, 0.4, 0]);
            return { ringRadius, ringOpacity, key: r };
          });

          const pulsePhase = (age + i * 15) * 0.05;
          const innerGlow = 0.6 + Math.sin(pulsePhase) * 0.3;

          return (
            <g key={`loc-${i}`} transform={`translate(${loc.x}, ${loc.y})`} opacity={markerOpacity}>
              {/* Outer bloom glow */}
              <circle
                r={loc.size * 3 * markerScale}
                fill={`hsla(${loc.hue + 180}, 100%, 60%, 0.06)`}
              />
              <circle
                r={loc.size * 1.8 * markerScale}
                fill={`hsla(${loc.hue + 180}, 100%, 65%, 0.12)`}
              />

              {/* Pulse rings */}
              {rings.map((ring) =>
                ring ? (
                  <circle
                    key={ring.key}
                    r={ring.ringRadius}
                    fill="none"
                    stroke={`hsla(${loc.hue + 180}, 90%, 70%, ${ring.ringOpacity})`}
                    strokeWidth={2}
                  />
                ) : null
              )}

              {/* Core marker */}
              <circle
                r={loc.size * 0.7 * markerScale}
                fill={`hsla(${loc.hue + 180}, 100%, 80%, ${innerGlow})`}
              />
              <circle
                r={loc.size * 0.3 * markerScale}
                fill={`hsla(${loc.hue + 200}, 100%, 95%, 0.95)`}
              />

              {/* Cross hair lines */}
              <line
                x1={-loc.size * 1.5 * markerScale}
                y1={0}
                x2={-loc.size * 0.8 * markerScale}
                y2={0}
                stroke={`hsla(${loc.hue + 180}, 80%, 70%, 0.6)`}
                strokeWidth={1.5}
              />
              <line
                x1={loc.size * 0.8 * markerScale}
                y1={0}
                x2={loc.size * 1.5 * markerScale}
                y2={0}
                stroke={`hsla(${loc.hue + 180}, 80%, 70%, 0.6)`}
                strokeWidth={1.5}
              />
              <line
                x1={0}
                y1={-loc.size * 1.5 * markerScale}
                x2={0}
                y2={-loc.size * 0.8 * markerScale}
                stroke={`hsla(${loc.hue + 180}, 80%, 70%, 0.6)`}
                strokeWidth={1.5}
              />
              <line
                x1={0}
                y1={loc.size * 0.8 * markerScale}
                x2={0}
                y2={loc.size * 1.5 * markerScale}
                stroke={`hsla(${loc.hue + 180}, 80%, 70%, 0.6)`}
                strokeWidth={1.5}
              />
            </g>
          );
        })}

        {/* Global pulse wave from center */}
        {[0, 1, 2, 3].map((waveIdx) => {
          const waveDelay = waveIdx * 60;
          if (frame < waveDelay) return null;
          const waveAge = frame - waveDelay;
          const waveRadius = interpolate(waveAge % 240, [0, 240], [0, Math.max(width, height) * 0.9]);
          const waveOpacity = interpolate(waveAge % 240, [0, 40, 200, 240], [0, 0.15, 0.05, 0]);
          return (
            <circle
              key={`wave-${waveIdx}`}
              cx={width / 2}
              cy={height / 2}
              r={waveRadius}
              fill="none"
              stroke={`rgba(100, 200, 255, ${waveOpacity})`}
              strokeWidth={3}
            />
          );
        })}

        {/* Scanline overlay */}
        {Array.from({ length: 8 }, (_, i) => {
          const scanY = ((frame * 4 + i * (height / 8)) % height);
          return (
            <line
              key={`scan-${i}`}
              x1={0}
              y1={scanY}
              x2={width}
              y2={scanY}
              stroke="rgba(100, 200, 255, 0.03)"
              strokeWidth={2}
            />
          );
        })}

        {/* Corner decorations */}
        {[
          { x: 80, y: 80 },
          { x: width - 80, y: 80 },
          { x: 80, y: height - 80 },
          { x: width - 80, y: height - 80 },
        ].map((corner, i) => {
          const cornerOpacity = interpolate(frame, [0, 60], [0, 0.7], { extrapolateRight: 'clamp' });
          const size = 50;
          const sign = i % 2 === 0 ? 1 : -1;
          const signY = i < 2 ? 1 : -1;
          return (
            <g key={`corner-${i}`} opacity={cornerOpacity}>
              <line x1={corner.x} y1={corner.y} x2={corner.x + sign * size} y2={corner.y} stroke="#4a9eff" strokeWidth={3} />
              <line x1={corner.x} y1={corner.y} x2={corner.x} y2={corner.y + signY * size} stroke="#4a9eff" strokeWidth={3} />
              <circle cx={corner.x} cy={corner.y} r={5} fill="#4a9eff" />
            </g>
          );
        })}

        {/* Vignette overlay */}
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(3,5,8,0.7)" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={width} height={height} fill="url(#vignette)" />
      </svg>
    </div>
  );
};