import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const MARKERS = Array.from({ length: 32 }, (_, i) => ({
  x: (i * 1731 + 500) % 3600 + 120,
  y: (i * 1337 + 300) % 1900 + 130,
  size: ((i * 47) % 60) + 40,
  phase: (i * 0.37) % (Math.PI * 2),
  speed: ((i * 13) % 7) / 10 + 0.5,
  hue: (i * 47) % 360,
  depth: (i % 4) + 1,
  rotOffset: (i * 23) % 360,
}));

const GRID_LINES_H = Array.from({ length: 22 }, (_, i) => ({
  y: i * 100 + 30,
  opacity: ((i * 17) % 5) / 20 + 0.04,
}));

const GRID_LINES_V = Array.from({ length: 40 }, (_, i) => ({
  x: i * 100 + 20,
  opacity: ((i * 11) % 5) / 20 + 0.04,
}));

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  x: (i * 983 + 200) % 3840,
  y: (i * 761 + 100) % 2160,
  size: ((i * 7) % 3) + 1,
  phase: (i * 0.53) % (Math.PI * 2),
  hue: (i * 53) % 360,
}));

const RINGS = Array.from({ length: 12 }, (_, i) => ({
  x: (i * 2311 + 400) % 3600 + 120,
  y: (i * 1789 + 200) % 1900 + 130,
  maxR: ((i * 67) % 200) + 150,
  phase: (i * 0.71) % (Math.PI * 2),
  speed: ((i * 19) % 5) / 10 + 0.3,
  hue: (i * 83) % 360,
}));

export const DiamondSalesMarkers: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const masterOpacity = fadeIn * fadeOut;

  const t = frame / 30;

  const DiamondMarker = ({
    x, y, size, phase, speed, hue, rotOffset,
  }: typeof MARKERS[0]) => {
    const rot = (t * speed * 40 + rotOffset) % 360;
    const pulse = 0.85 + 0.15 * Math.sin(t * speed * 2 + phase);
    const glowIntensity = 0.6 + 0.4 * Math.sin(t * speed * 1.5 + phase);
    const s = size * pulse;

    const colors = [
      `hsl(${hue}, 100%, 70%)`,
      `hsl(${(hue + 60) % 360}, 100%, 75%)`,
      `hsl(${(hue + 120) % 360}, 100%, 65%)`,
      `hsl(${(hue + 180) % 360}, 100%, 70%)`,
    ];

    const glowColor = `hsl(${hue}, 100%, 60%)`;
    const glowSize = s * 3 * glowIntensity;

    return (
      <g transform={`translate(${x}, ${y}) rotate(${rot})`}>
        <defs>
          <radialGradient id={`glow-${hue}-${rotOffset}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={glowColor} stopOpacity={0.9 * glowIntensity} />
            <stop offset="40%" stopColor={glowColor} stopOpacity={0.4 * glowIntensity} />
            <stop offset="100%" stopColor={glowColor} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`fill-${hue}-${rotOffset}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor={colors[0]} stopOpacity={1} />
            <stop offset="50%" stopColor={colors[1]} stopOpacity={0.9} />
            <stop offset="100%" stopColor={colors[2]} stopOpacity={0.7} />
          </radialGradient>
        </defs>
        <ellipse rx={glowSize} ry={glowSize} fill={`url(#glow-${hue}-${rotOffset})`} />
        <polygon
          points={`0,${-s} ${s * 0.6},0 0,${s} ${-s * 0.6},0`}
          fill={`url(#fill-${hue}-${rotOffset})`}
          stroke={colors[0]}
          strokeWidth={2}
          opacity={0.95}
        />
        <polygon
          points={`0,${-s * 0.7} ${s * 0.4},0 0,${s * 0.7} ${-s * 0.4},0`}
          fill="none"
          stroke={colors[3]}
          strokeWidth={1.5}
          opacity={0.6}
        />
        <polygon
          points={`0,${-s * 0.3} ${s * 0.2},0 0,${s * 0.3} ${-s * 0.2},0`}
          fill="white"
          opacity={0.8 * glowIntensity}
        />
        <line x1={-s * 0.6} y1={0} x2={s * 0.6} y2={0} stroke={colors[1]} strokeWidth={1} opacity={0.4} />
        <line x1={0} y1={-s} x2={0} y2={s} stroke={colors[2]} strokeWidth={1} opacity={0.4} />
      </g>
    );
  };

  return (
    <div style={{ width, height, background: '#030408', position: 'relative', overflow: 'hidden', opacity: masterOpacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0a0f1a" stopOpacity={1} />
            <stop offset="100%" stopColor="#020408" stopOpacity={1} />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#bgGrad)" />

        {GRID_LINES_H.map((line, i) => (
          <line
            key={`h${i}`}
            x1={0} y1={line.y * (height / 2160)}
            x2={width} y2={line.y * (height / 2160)}
            stroke="#4488ff"
            strokeWidth={1}
            opacity={line.opacity}
          />
        ))}
        {GRID_LINES_V.map((line, i) => (
          <line
            key={`v${i}`}
            x1={line.x * (width / 3840)} y1={0}
            x2={line.x * (width / 3840)} y2={height}
            stroke="#4488ff"
            strokeWidth={1}
            opacity={line.opacity}
          />
        ))}

        {RINGS.map((ring, i) => {
          const ringT = (t * ring.speed + ring.phase) % 3;
          const ringR = ring.maxR * (ringT / 3);
          const ringOpacity = (1 - ringT / 3) * 0.5;
          const rx = ring.x * (width / 3840);
          const ry = ring.y * (height / 2160);
          return (
            <circle
              key={`ring${i}`}
              cx={rx} cy={ry}
              r={ringR}
              fill="none"
              stroke={`hsl(${ring.hue}, 100%, 65%)`}
              strokeWidth={2}
              opacity={ringOpacity}
            />
          );
        })}

        {PARTICLES.map((p, i) => {
          const pOpacity = 0.3 + 0.4 * Math.abs(Math.sin(t * 0.8 + p.phase));
          const px = p.x * (width / 3840);
          const py = p.y * (height / 2160);
          return (
            <circle
              key={`p${i}`}
              cx={px} cy={py}
              r={p.size}
              fill={`hsl(${p.hue}, 100%, 80%)`}
              opacity={pOpacity}
            />
          );
        })}

        {MARKERS.map((marker, i) => (
          <g key={`m${i}`} transform={`scale(${width / 3840}, ${height / 2160})`}>
            <DiamondMarker {...marker} />
          </g>
        ))}

        <rect
          width={width} height={height}
          fill="none"
          stroke="#1a3a6a"
          strokeWidth={8}
          opacity={0.4}
        />
      </svg>
    </div>
  );
};