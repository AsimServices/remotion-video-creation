import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const DigitalFingerprintScan: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const cx = width / 2;
  const cy = height / 2;
  const fingerprintRadius = 200;

  // Scan line animation
  const scanProgress = (frame % 120) / 120;
  const scanY = interpolate(scanProgress, [0, 1], [-fingerprintRadius, fingerprintRadius]);

  // Pulse rings
  const pulseRings = [0, 40, 80].map((offset) => {
    const p = ((frame + offset) % 120) / 120;
    return {
      r: interpolate(p, [0, 1], [fingerprintRadius * 0.8, fingerprintRadius * 1.8]),
      opacity: interpolate(p, [0, 0.4, 1], [0.9, 0.5, 0]),
    };
  });

  // Fingerprint ridges - concentric ellipses with distortion
  const ridges = Array.from({ length: 22 }, (_, i) => {
    const t = i / 21;
    const baseRx = 20 + t * 170;
    const baseRy = 15 + t * 150;
    const distort = Math.sin(frame * 0.02 + i * 0.3) * 3;
    return { rx: baseRx + distort, ry: baseRy + distort, i };
  });

  // Glow intensity flicker
  const glowIntensity = 0.7 + 0.3 * Math.sin(frame * 0.15);
  const scanGlow = 0.8 + 0.2 * Math.sin(frame * 0.3);

  // Data particles
  const particles = Array.from({ length: 30 }, (_, i) => {
    const angle = (i / 30) * Math.PI * 2 + frame * 0.01 * (i % 2 === 0 ? 1 : -1);
    const dist = fingerprintRadius * 1.15 + Math.sin(frame * 0.05 + i) * 20;
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist;
    const pOpacity = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.08 + i * 0.7));
    const size = 2 + 2 * Math.abs(Math.sin(frame * 0.1 + i));
    return { px, py, pOpacity, size };
  });

  // Corner brackets
  const bracketSize = 30;
  const bracketOffset = fingerprintRadius * 1.15;
  const corners = [
    { x: cx - bracketOffset, y: cy - bracketOffset, rx: 1, ry: 1 },
    { x: cx + bracketOffset, y: cy - bracketOffset, rx: -1, ry: 1 },
    { x: cx - bracketOffset, y: cy + bracketOffset, rx: 1, ry: -1 },
    { x: cx + bracketOffset, y: cy + bracketOffset, rx: -1, ry: -1 },
  ];

  const neonColor = `rgba(0, 255, 200, ${glowIntensity})`;
  const neonColorDim = `rgba(0, 200, 160, 0.5)`;
  const scanColor = `rgba(0, 255, 220, ${scanGlow})`;

  return (
    <div
      style={{
        width,
        height,
        background: '#050a0e',
        position: 'relative',
        overflow: 'hidden',
        opacity,
      }}
    >
      {/* Background grid */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(0,255,180,0.06)" strokeWidth="1" />
          </pattern>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,80,60,0.3)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <filter id="blur1">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="blur3">
            <feGaussianBlur stdDeviation="15" />
          </filter>
          <clipPath id="fpClip">
            <ellipse cx={cx} cy={cy} rx={fingerprintRadius} ry={fingerprintRadius} />
          </clipPath>
        </defs>

        <rect width={width} height={height} fill="url(#grid)" />
        <rect width={width} height={height} fill="url(#bgGlow)" />

        {/* Pulse rings */}
        {pulseRings.map((ring, i) => (
          <g key={i}>
            <ellipse
              cx={cx}
              cy={cy}
              rx={ring.r}
              ry={ring.r}
              fill="none"
              stroke={`rgba(0, 255, 200, ${ring.opacity * 0.3})`}
              strokeWidth="12"
              filter="url(#blur2)"
            />
            <ellipse
              cx={cx}
              cy={cy}
              rx={ring.r}
              ry={ring.r}
              fill="none"
              stroke={`rgba(0, 255, 200, ${ring.opacity})`}
              strokeWidth="1.5"
            />
          </g>
        ))}

        {/* Outer glow circle */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={fingerprintRadius + 30}
          ry={fingerprintRadius + 30}
          fill="none"
          stroke={`rgba(0, 255, 180, ${0.15 * glowIntensity})`}
          strokeWidth="40"
          filter="url(#blur3)"
        />

        {/* Fingerprint ridges - glow layer */}
        <g clipPath="url(#fpClip)" filter="url(#blur1)">
          {ridges.map(({ rx, ry, i }) => (
            <ellipse
              key={`glow-${i}`}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill="none"
              stroke={`rgba(0, 255, 180, 0.25)`}
              strokeWidth="3"
            />
          ))}
        </g>

        {/* Fingerprint ridges - main layer */}
        <g clipPath="url(#fpClip)">
          {ridges.map(({ rx, ry, i }) => (
            <ellipse
              key={`ridge-${i}`}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill="none"
              stroke={neonColorDim}
              strokeWidth="1.5"
            />
          ))}

          {/* Scan line glow */}
          <rect
            x={cx - fingerprintRadius}
            y={cy + scanY - 10}
            width={fingerprintRadius * 2}
            height={20}
            fill={`rgba(0, 255, 220, 0.15)`}
            filter="url(#blur2)"
          />

          {/* Scan line */}
          <line
            x1={cx - fingerprintRadius}
            y1={cy + scanY}
            x2={cx + fingerprintRadius}
            y2={cy + scanY}
            stroke={scanColor}
            strokeWidth="2"
          />

          {/* Scan line dot accents */}
          {[-0.8, -0.4, 0, 0.4, 0.8].map((t, i) => (
            <circle
              key={i}
              cx={cx + t * fingerprintRadius}
              cy={cy + scanY}
              r={3}
              fill={scanColor}
              filter="url(#blur1)"
            />
          ))}
        </g>

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={6} fill={neonColor} filter="url(#blur1)" />
        <circle cx={cx} cy={cy} r={3} fill="white" />

        {/* Corner brackets */}
        {corners.map(({ x, y, rx: bx, ry: by }, i) => (
          <g key={i}>
            <line
              x1={x}
              y1={y}
              x2={x + bx * bracketSize}
              y2={y}
              stroke={neonColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1={x}
              y1={y}
              x2={x}
              y2={y + by * bracketSize}
              stroke={neonColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Bracket glow */}
            <line
              x1={x}
              y1={y}
              x2={x + bx * bracketSize}
              y2={y}
              stroke={`rgba(0,255,200,0.3)`}
              strokeWidth="8"
              strokeLinecap="round"
              filter="url(#blur1)"
            />
            <line
              x1={x}
              y1={y}
              x2={x}
              y2={y + by * bracketSize}
              stroke={`rgba(0,255,200,0.3)`}
              strokeWidth="8"
              strokeLinecap="round"
              filter="url(#blur1)"
            />
          </g>
        ))}

        {/* Orbiting particles */}
        {particles.map(({ px, py, pOpacity, size }, i) => (
          <circle
            key={i}
            cx={px}
            cy={py}
            r={size}
            fill={`rgba(0, 255, 200, ${pOpacity})`}
            filter={i % 4 === 0 ? 'url(#blur1)' : undefined}
          />
        ))}

        {/* Horizontal scan data lines */}
        {Array.from({ length: 6 }, (_, i) => {
          const lineY = cy - fingerprintRadius * 1.4 + i * (fingerprintRadius * 2.8 / 5);
          const lineOpacity = 0.15 + 0.1 * Math.sin(frame * 0.04 + i);
          const lineWidth = 80 + 60 * Math.abs(Math.sin(frame * 0.03 + i * 0.5));
          return (
            <g key={i}>
              <line
                x1={cx + fingerprintRadius * 1.35}
                y1={lineY}
                x2={cx + fingerprintRadius * 1.35 + lineWidth}
                y2={lineY}
                stroke={`rgba(0, 255, 180, ${lineOpacity})`}
                strokeWidth="2"
              />
              <line
                x1={cx - fingerprintRadius * 1.35}
                y1={lineY}
                x2={cx - fingerprintRadius * 1.35 - lineWidth}
                y2={lineY}
                stroke={`rgba(0, 255, 180, ${lineOpacity})`}
                strokeWidth="2"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};