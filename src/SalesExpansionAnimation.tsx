import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const MARKERS = Array.from({ length: 60 }, (_, i) => ({
  x: ((i * 1731 + 500) % 3400) + 220,
  y: ((i * 1337 + 300) % 1800) + 180,
  size: ((i * 137) % 18) + 8,
  delay: (i * 8) + 20,
  hue: (i * 47) % 360,
  pulseOffset: (i * 23) % 100,
  ringCount: (i % 3) + 2,
}));

const CONNECTIONS = Array.from({ length: 80 }, (_, i) => {
  const from = i % 60;
  const to = (i * 7 + 13) % 60;
  return {
    from,
    to,
    delay: Math.max(MARKERS[from].delay, MARKERS[to].delay) + 10,
  };
});

const REGION_BLOBS = Array.from({ length: 12 }, (_, i) => ({
  cx: ((i * 2311 + 700) % 3200) + 320,
  cy: ((i * 1789 + 400) % 1600) + 280,
  rx: ((i * 317) % 300) + 180,
  ry: ((i * 251) % 200) + 120,
  hue: (i * 60 + 180) % 360,
  delay: i * 30 + 40,
}));

const PARTICLES = Array.from({ length: 120 }, (_, i) => ({
  x: ((i * 1999 + 300) % 3600) + 120,
  y: ((i * 1423 + 200) % 1900) + 130,
  size: ((i * 71) % 4) + 1,
  speed: ((i * 53) % 30) + 10,
  phase: (i * 37) % 314,
}));

export const SalesExpansionAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const progress = frame / durationInFrames;

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 50% 50%, #050a14 0%, #020509 60%, #010204 100%)',
        overflow: 'hidden',
        opacity: globalOpacity,
        position: 'relative',
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {MARKERS.map((m, i) => (
            <radialGradient key={`rg-${i}`} id={`rg-${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={`hsl(${m.hue}, 100%, 80%)`} stopOpacity="1" />
              <stop offset="50%" stopColor={`hsl(${m.hue}, 90%, 50%)`} stopOpacity="0.6" />
              <stop offset="100%" stopColor={`hsl(${m.hue}, 80%, 30%)`} stopOpacity="0" />
            </radialGradient>
          ))}
          {REGION_BLOBS.map((b, i) => (
            <radialGradient key={`bg-${i}`} id={`bg-${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={`hsl(${b.hue}, 80%, 40%)`} stopOpacity="0.18" />
              <stop offset="100%" stopColor={`hsl(${b.hue}, 60%, 20%)`} stopOpacity="0" />
            </radialGradient>
          ))}
          <radialGradient id="bgCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0a1f3c" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#010204" stopOpacity="0" />
          </radialGradient>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-soft">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-region">
            <feGaussianBlur stdDeviation="30" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background center glow */}
        <ellipse cx={width / 2} cy={height / 2} rx={900} ry={600} fill="url(#bgCenter)" />

        {/* Grid lines */}
        {Array.from({ length: 30 }, (_, i) => {
          const x = (width / 29) * i;
          return (
            <line
              key={`vl-${i}`}
              x1={x} y1={0} x2={x} y2={height}
              stroke="#0d2040"
              strokeWidth="1"
              opacity={0.4}
            />
          );
        })}
        {Array.from({ length: 18 }, (_, i) => {
          const y = (height / 17) * i;
          return (
            <line
              key={`hl-${i}`}
              x1={0} y1={y} x2={width} y2={y}
              stroke="#0d2040"
              strokeWidth="1"
              opacity={0.4}
            />
          );
        })}

        {/* Region blobs */}
        {REGION_BLOBS.map((b, i) => {
          const blobOpacity = interpolate(frame, [b.delay, b.delay + 60], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          const pulse = Math.sin((frame * 0.015) + i * 0.8) * 0.15 + 0.85;
          return (
            <ellipse
              key={`blob-${i}`}
              cx={b.cx}
              cy={b.cy}
              rx={b.rx * pulse}
              ry={b.ry * pulse}
              fill={`url(#bg-${i})`}
              filter="url(#glow-region)"
              opacity={blobOpacity}
            />
          );
        })}

        {/* Connection lines */}
        {CONNECTIONS.map((c, i) => {
          const mf = MARKERS[c.from];
          const mt = MARKERS[c.to];
          const lineProgress = interpolate(frame, [c.delay, c.delay + 40], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          if (lineProgress === 0) return null;
          const endX = mf.x + (mt.x - mf.x) * lineProgress;
          const endY = mf.y + (mt.y - mf.y) * lineProgress;
          const midX = (mf.x + mt.x) / 2 + ((i * 37) % 100 - 50);
          const midY = (mf.y + mt.y) / 2 + ((i * 53) % 100 - 50);
          const hue = (mf.hue + mt.hue) / 2;
          return (
            <path
              key={`conn-${i}`}
              d={`M ${mf.x} ${mf.y} Q ${midX} ${midY} ${endX} ${endY}`}
              stroke={`hsl(${hue}, 100%, 65%)`}
              strokeWidth={1.2}
              fill="none"
              opacity={lineProgress * 0.5}
              filter="url(#glow-soft)"
            />
          );
        })}

        {/* Marker glows and rings */}
        {MARKERS.map((m, i) => {
          const appear = interpolate(frame, [m.delay, m.delay + 30], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          if (appear === 0) return null;
          const pulse = Math.sin((frame * 0.04) + m.pulseOffset * 0.1) * 0.3 + 0.7;

          return (
            <g key={`marker-${i}`}>
              {/* Expanding rings */}
              {Array.from({ length: m.ringCount }, (_, r) => {
                const ringPhase = ((frame * 0.8 + r * 40 + m.pulseOffset) % 120) / 120;
                const ringRadius = m.size * 1.5 + ringPhase * m.size * 5;
                const ringOpacity = (1 - ringPhase) * 0.6 * appear;
                return (
                  <circle
                    key={`ring-${i}-${r}`}
                    cx={m.x}
                    cy={m.y}
                    r={ringRadius}
                    fill="none"
                    stroke={`hsl(${m.hue}, 100%, 70%)`}
                    strokeWidth={1.5}
                    opacity={ringOpacity}
                  />
                );
              })}

              {/* Glow halo */}
              <circle
                cx={m.x}
                cy={m.y}
                r={m.size * 3 * pulse}
                fill={`url(#rg-${i})`}
                opacity={appear * 0.7}
                filter="url(#glow-strong)"
              />

              {/* Core dot */}
              <circle
                cx={m.x}
                cy={m.y}
                r={m.size * 0.5}
                fill={`hsl(${m.hue}, 100%, 90%)`}
                opacity={appear}
              />

              {/* Spike cross */}
              <line
                x1={m.x - m.size * 2}
                y1={m.y}
                x2={m.x + m.size * 2}
                y2={m.y}
                stroke={`hsl(${m.hue}, 100%, 80%)`}
                strokeWidth={0.8}
                opacity={appear * pulse * 0.6}
              />
              <line
                x1={m.x}
                y1={m.y - m.size * 2}
                x2={m.x}
                y2={m.y + m.size * 2}
                stroke={`hsl(${m.hue}, 100%, 80%)`}
                strokeWidth={0.8}
                opacity={appear * pulse * 0.6}
              />
            </g>
          );
        })}

        {/* Floating particles */}
        {PARTICLES.map((p, i) => {
          const floatY = Math.sin((frame * 0.02) + p.phase) * 20;
          const floatX = Math.cos((frame * 0.015) + p.phase) * 15;
          const particleOpacity = interpolate(
            frame,
            [p.speed, p.speed + 30, durationInFrames - 30, durationInFrames - 10],
            [0, 0.7, 0.7, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          return (
            <circle
              key={`part-${i}`}
              cx={p.x + floatX}
              cy={p.y + floatY}
              r={p.size}
              fill={`hsl(${(i * 47) % 360}, 80%, 70%)`}
              opacity={particleOpacity}
            />
          );
        })}

        {/* Sweeping radar line */}
        {(() => {
          const angle = (frame * 1.2) % 360;
          const rad = (angle * Math.PI) / 180;
          const cx = width / 2;
          const cy = height / 2;
          const len = Math.sqrt(width * width + height * height);
          return (
            <g>
              <line
                x1={cx}
                y1={cy}
                x2={cx + Math.cos(rad) * len}
                y2={cy + Math.sin(rad) * len}
                stroke="rgba(100,200,255,0.15)"
                strokeWidth={3}
                filter="url(#glow-soft)"
              />
              {/* Sweep trail */}
              {Array.from({ length: 8 }, (_, t) => {
                const trailAngle = ((angle - t * 6) % 360);
                const trailRad = (trailAngle * Math.PI) / 180;
                return (
                  <line
                    key={`trail-${t}`}
                    x1={cx}
                    y1={cy}
                    x2={cx + Math.cos(trailRad) * len}
                    y2={cy + Math.sin(trailRad) * len}
                    stroke={`rgba(100,200,255,${0.05 - t * 0.005})`}
                    strokeWidth={2}
                  />
                );
              })}
            </g>
          );
        })()}

        {/* Outer frame glow */}
        <rect
          x={0} y={0} width={width} height={height}
          fill="none"
          stroke="rgba(30,120,255,0.2)"
          strokeWidth={4}
        />
        <rect
          x={20} y={20} width={width - 40} height={height - 40}
          fill="none"
          stroke="rgba(30,120,255,0.1)"
          strokeWidth={2}
        />

        {/* Corner accents */}
        {[
          [0, 0], [width, 0], [0, height], [width, height]
        ].map(([cx, cy], i) => {
          const sx = cx === 0 ? 1 : -1;
          const sy = cy === 0 ? 1 : -1;
          const pulse = Math.sin(frame * 0.05 + i) * 0.3 + 0.7;
          return (
            <g key={`corner-${i}`} opacity={pulse}>
              <line x1={cx} y1={cy} x2={cx + sx * 120} y2={cy} stroke="#1e78ff" strokeWidth={3} opacity={0.6} />
              <line x1={cx} y1={cy} x2={cx} y2={cy + sy * 120} stroke="#1e78ff" strokeWidth={3} opacity={0.6} />
              <circle cx={cx} cy={cy} r={8} fill="#1e78ff" opacity={0.8} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};