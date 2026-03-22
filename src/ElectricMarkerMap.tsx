import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const MARKERS = Array.from({ length: 48 }, (_, i) => ({
  x: ((i * 1731 + 300) % 3200) + 320,
  y: ((i * 1337 + 200) % 1700) + 230,
  size: ((i % 5) + 1) * 6 + 8,
  pulseOffset: (i * 23) % 100,
  flashDelay: (i * 17) % 90,
  tier: i % 3,
  intensity: ((i * 7) % 10) / 10 + 0.3,
}));

const GRID_LINES_H = Array.from({ length: 24 }, (_, i) => ({
  y: (i / 23) * 2160,
  opacity: ((i * 13) % 7) / 7 * 0.08 + 0.02,
}));

const GRID_LINES_V = Array.from({ length: 42 }, (_, i) => ({
  x: (i / 41) * 3840,
  opacity: ((i * 11) % 7) / 7 * 0.08 + 0.02,
}));

const CONNECTIONS = Array.from({ length: 30 }, (_, i) => {
  const fromIdx = (i * 3) % 48;
  const toIdx = (i * 7 + 5) % 48;
  return {
    fromIdx,
    toIdx,
    delay: (i * 19) % 120,
    duration: 60 + (i * 11) % 60,
  };
});

const REGION_BLOBS = Array.from({ length: 8 }, (_, i) => ({
  cx: ((i * 2131) % 3000) + 420,
  cy: ((i * 1777) % 1800) + 180,
  rx: 180 + (i * 73) % 320,
  ry: 100 + (i * 97) % 180,
  opacity: 0.03 + (i % 4) * 0.015,
}));

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  x: ((i * 1993) % 3840),
  y: ((i * 1567) % 2160),
  size: ((i % 4) + 1) * 1.5,
  speed: ((i * 7) % 5) + 2,
  phaseOffset: (i * 31) % 100,
}));

export const ElectricMarkerMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const time = frame / 30;

  return (
    <div style={{ width, height, background: '#04060d', position: 'relative', overflow: 'hidden', opacity: globalOpacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Deep background gradient */}
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0a0f1e" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>
          <radialGradient id="glowWhite" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor="#a0c8ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1a4a8a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glowBlue" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60a8ff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#1040a0" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0020608" stopOpacity="0" />
          </radialGradient>
          <filter id="blur4">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="blur12">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <filter id="blur20">
            <feGaussianBlur stdDeviation="20" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width={width} height={height} fill="url(#bgGrad)" />

        {/* Region blobs */}
        {REGION_BLOBS.map((blob, i) => {
          const pulse = Math.sin(time * 0.4 + i * 1.2) * 0.3 + 0.7;
          return (
            <ellipse
              key={`blob-${i}`}
              cx={blob.cx}
              cy={blob.cy}
              rx={blob.rx * pulse}
              ry={blob.ry * pulse}
              fill="#1a3a6a"
              opacity={blob.opacity * pulse}
            />
          );
        })}

        {/* Grid lines */}
        {GRID_LINES_H.map((line, i) => (
          <line
            key={`gh-${i}`}
            x1={0} y1={line.y} x2={width} y2={line.y}
            stroke="#2040a0"
            strokeWidth="0.5"
            opacity={line.opacity}
          />
        ))}
        {GRID_LINES_V.map((line, i) => (
          <line
            key={`gv-${i}`}
            x1={line.x} y1={0} x2={line.x} y2={height}
            stroke="#2040a0"
            strokeWidth="0.5"
            opacity={line.opacity}
          />
        ))}

        {/* Connections between markers */}
        {CONNECTIONS.map((conn, i) => {
          const from = MARKERS[conn.fromIdx];
          const to = MARKERS[conn.toIdx];
          const progress = ((frame - conn.delay) % conn.duration) / conn.duration;
          const clampedProgress = Math.max(0, Math.min(1, progress));
          const alpha = Math.sin(clampedProgress * Math.PI) * 0.4;
          if (alpha < 0.01) return null;

          const mx = from.x + (to.x - from.x) * clampedProgress;
          const my = from.y + (to.y - from.y) * clampedProgress;

          return (
            <g key={`conn-${i}`}>
              <line
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="#4080ff"
                strokeWidth="1"
                opacity={alpha * 0.3}
                strokeDasharray="8 12"
              />
              <circle cx={mx} cy={my} r="4" fill="#80b8ff" opacity={alpha} filter="url(#blur4)" />
              <circle cx={mx} cy={my} r="2" fill="#ffffff" opacity={alpha * 0.8} />
            </g>
          );
        })}

        {/* Floating particles */}
        {PARTICLES.map((p, i) => {
          const drift = (frame * p.speed * 0.3 + p.phaseOffset * 21.6) % height;
          const px = p.x + Math.sin(time * 0.3 + p.phaseOffset * 0.063) * 60;
          const py = (p.y + drift) % height;
          const brightness = Math.sin(time * 2 + p.phaseOffset * 0.063) * 0.3 + 0.4;
          return (
            <circle
              key={`particle-${i}`}
              cx={px}
              cy={py}
              r={p.size}
              fill="#3060c0"
              opacity={brightness * 0.4}
            />
          );
        })}

        {/* Markers */}
        {MARKERS.map((marker, i) => {
          const flashCycle = (frame + marker.flashDelay * 3) % 90;
          const flashAlpha = flashCycle < 20
            ? interpolate(flashCycle, [0, 10, 20], [0, 1, 0.1])
            : 0.1 + Math.sin(time * 1.5 + marker.pulseOffset * 0.063) * 0.05;

          const pulseScale = 1 + Math.sin(time * 2 + marker.pulseOffset * 0.063) * 0.15;
          const ringScale = 1 + ((frame + marker.pulseOffset * 3) % 60) / 60 * 2;
          const ringAlpha = Math.max(0, 1 - ((frame + marker.pulseOffset * 3) % 60) / 60);

          const coreSize = marker.size * (marker.tier === 0 ? 1.4 : marker.tier === 1 ? 1.0 : 0.7);
          const glowSize = coreSize * 3;
          const outerGlow = coreSize * 6;

          const markerColor = marker.tier === 0 ? '#ffffff' : marker.tier === 1 ? '#a0d0ff' : '#6090d0';
          const glowColor = marker.tier === 0 ? '#80b8ff' : marker.tier === 1 ? '#4080e0' : '#204080';

          return (
            <g key={`marker-${i}`} transform={`translate(${marker.x}, ${marker.y})`}>
              {/* Outer expanding ring */}
              <circle
                r={coreSize * ringScale * 2.5}
                fill="none"
                stroke={glowColor}
                strokeWidth="1.5"
                opacity={ringAlpha * 0.5 * flashAlpha}
              />

              {/* Outer glow */}
              <circle
                r={outerGlow * pulseScale}
                fill={glowColor}
                opacity={0.04 * flashAlpha * marker.intensity}
                filter="url(#blur20)"
              />

              {/* Mid glow */}
              <circle
                r={glowSize * pulseScale}
                fill={glowColor}
                opacity={0.12 * flashAlpha}
                filter="url(#blur12)"
              />

              {/* Inner glow */}
              <circle
                r={coreSize * 1.5 * pulseScale}
                fill={markerColor}
                opacity={0.25 * flashAlpha}
                filter="url(#blur4)"
              />

              {/* Core dot */}
              <circle
                r={coreSize * pulseScale}
                fill={markerColor}
                opacity={flashAlpha}
              />

              {/* Bright center */}
              <circle
                r={coreSize * 0.4 * pulseScale}
                fill="#ffffff"
                opacity={flashAlpha * 0.9}
              />

              {/* Crosshair lines for tier 0 */}
              {marker.tier === 0 && (
                <>
                  <line x1={-coreSize * 3} y1={0} x2={-coreSize * 1.2} y2={0}
                    stroke={markerColor} strokeWidth="1" opacity={flashAlpha * 0.6} />
                  <line x1={coreSize * 1.2} y1={0} x2={coreSize * 3} y2={0}
                    stroke={markerColor} strokeWidth="1" opacity={flashAlpha * 0.6} />
                  <line x1={0} y1={-coreSize * 3} x2={0} y2={-coreSize * 1.2}
                    stroke={markerColor} strokeWidth="1" opacity={flashAlpha * 0.6} />
                  <line x1={0} y1={coreSize * 1.2} x2={0} y2={coreSize * 3}
                    stroke={markerColor} strokeWidth="1" opacity={flashAlpha * 0.6} />
                </>
              )}

              {/* Electric spike effect on flash */}
              {flashCycle < 15 && (
                <>
                  {[0, 60, 120, 180, 240, 300].map((angle, si) => {
                    const rad = (angle * Math.PI) / 180;
                    const len = coreSize * 4 * (1 - flashCycle / 15);
                    return (
                      <line
                        key={`spike-${si}`}
                        x1={0} y1={0}
                        x2={Math.cos(rad) * len}
                        y2={Math.sin(rad) * len}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        opacity={(1 - flashCycle / 15) * 0.8}
                      />
                    );
                  })}
                </>
              )}
            </g>
          );
        })}

        {/* Scan line effect */}
        {(() => {
          const scanY = ((frame * 3) % (height + 200)) - 100;
          return (
            <rect
              x={0} y={scanY}
              width={width} height={2}
              fill="#4080ff"
              opacity={0.06}
            />
          );
        })()}

        {/* Corner accents */}
        {[
          { x: 0, y: 0, rotate: 0 },
          { x: width, y: 0, rotate: 90 },
          { x: width, y: height, rotate: 180 },
          { x: 0, y: height, rotate: 270 },
        ].map((corner, i) => (
          <g key={`corner-${i}`} transform={`translate(${corner.x}, ${corner.y}) rotate(${corner.rotate})`}>
            <line x1={0} y1={0} x2={120} y2={0} stroke="#4080ff" strokeWidth="2" opacity={0.4} />
            <line x1={0} y1={0} x2={0} y2={120} stroke="#4080ff" strokeWidth="2" opacity={0.4} />
            <circle cx={0} cy={0} r={8} fill="#4080ff" opacity={0.3} />
          </g>
        ))}

        {/* Central ambient glow */}
        <ellipse
          cx={width / 2} cy={height / 2}
          rx={800 + Math.sin(time * 0.5) * 100}
          ry={500 + Math.sin(time * 0.7) * 80}
          fill="#1030a0"
          opacity={0.04}
          filter="url(#blur20)"
        />
      </svg>
    </div>
  );
};