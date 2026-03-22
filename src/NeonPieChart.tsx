import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const NeonPieChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.32;

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const slices = [
    { value: 0.28, color: '#ff00ff', glow: '#ff00ff', label: 'A' },
    { value: 0.22, color: '#00ffff', glow: '#00ffff', label: 'B' },
    { value: 0.18, color: '#ff6600', glow: '#ff6600', label: 'C' },
    { value: 0.15, color: '#00ff88', glow: '#00ff88', label: 'D' },
    { value: 0.10, color: '#ffff00', glow: '#ffff00', label: 'E' },
    { value: 0.07, color: '#ff4488', glow: '#ff4488', label: 'F' },
  ];

  const totalFramesForEntry = 90;

  const getArcPath = (startAngle: number, endAngle: number, r: number, innerR: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const ix1 = cx + innerR * Math.cos(toRad(endAngle));
    const iy1 = cy + innerR * Math.sin(toRad(endAngle));
    const ix2 = cx + innerR * Math.cos(toRad(startAngle));
    const iy2 = cy + innerR * Math.sin(toRad(startAngle));
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`;
  };

  let cumulative = 0;
  const renderedSlices = slices.map((slice, i) => {
    const startFraction = cumulative;
    cumulative += slice.value;
    const endFraction = cumulative;

    const delay = i * 12;
    const entryProgress = interpolate(frame, [delay, delay + totalFramesForEntry], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    const startAngle = -90 + startFraction * 360;
    const endAngle = -90 + endFraction * 360;
    const sweepAngle = endAngle - startAngle;
    const currentEndAngle = startAngle + sweepAngle * entryProgress;

    const innerRadius = radius * 0.4;
    const path = getArcPath(startAngle, currentEndAngle, radius, innerRadius);

    const pulse = Math.sin(frame * 0.05 + i * 1.1) * 0.5 + 0.5;
    const glowSize = 8 + pulse * 10;

    return { path, color: slice.color, glow: slice.glow, glowSize, i, entryProgress, startAngle, currentEndAngle, innerRadius };
  });

  // Particles
  const particleCount = 120;
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const sliceIndex = i % slices.length;
    const particleDelay = sliceIndex * 12 + 80;
    const particleProgress = interpolate(frame, [particleDelay, particleDelay + 60], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    const angle = (i / particleCount) * Math.PI * 2;
    const speed = 80 + (i % 7) * 30;
    const px = cx + Math.cos(angle) * speed * particleProgress * (1 + (i % 3) * 0.5);
    const py = cy + Math.sin(angle) * speed * particleProgress * (1 + (i % 3) * 0.5);
    const pOpacity = interpolate(particleProgress, [0, 0.3, 1], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const size = 2 + (i % 4);
    const color = slices[sliceIndex].color;

    return { px, py, pOpacity, size, color, i };
  });

  // Ring particles orbiting
  const orbitCount = 20;
  const orbitParticles = Array.from({ length: orbitCount }, (_, i) => {
    const angle = (i / orbitCount) * Math.PI * 2 + frame * 0.02;
    const r = radius * 1.2 + Math.sin(frame * 0.04 + i) * 15;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    const pulse2 = Math.sin(frame * 0.08 + i * 0.8) * 0.5 + 0.5;
    const color = slices[i % slices.length].color;
    return { px, py, pulse2, color };
  });

  // Background grid lines
  const gridLines = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    return {
      x2: cx + Math.cos(angle) * radius * 1.5,
      y2: cy + Math.sin(angle) * radius * 1.5,
    };
  });

  // Rotation of the whole chart
  const chartRotation = interpolate(frame, [0, durationInFrames], [0, 30], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ width, height, background: '#020208', opacity, position: 'relative', overflow: 'hidden' }}>
      {/* Background gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #020208 70%)',
      }} />

      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          {slices.map((s, i) => (
            <filter key={i} id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <filter id="glow-strong" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background grid */}
        {gridLines.map((line, i) => (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={line.x2} y2={line.y2}
            stroke="#ffffff"
            strokeOpacity={0.04}
            strokeWidth={1}
          />
        ))}

        {/* Concentric rings */}
        {[0.5, 0.75, 1.0, 1.25].map((r, i) => (
          <circle
            key={i}
            cx={cx} cy={cy}
            r={radius * r}
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.04}
            strokeWidth={1}
          />
        ))}

        {/* Pie slices group with rotation */}
        <g transform={`rotate(${chartRotation}, ${cx}, ${cy})`}>
          {/* Glow layer (blurred behind) */}
          {renderedSlices.map(({ path, color, glowSize, i }) => (
            <path
              key={`glow-path-${i}`}
              d={path}
              fill={color}
              opacity={0.3}
              style={{ filter: `blur(${glowSize}px)` }}
            />
          ))}

          {/* Main slices */}
          {renderedSlices.map(({ path, color, i }) => (
            <path
              key={`slice-${i}`}
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              opacity={0.95}
              filter={`url(#glow-${i})`}
            />
          ))}

          {/* Filled slices with transparency */}
          {renderedSlices.map(({ path, color, i }) => (
            <path
              key={`fill-${i}`}
              d={path}
              fill={color}
              opacity={0.12}
            />
          ))}
        </g>

        {/* Center glow */}
        <circle cx={cx} cy={cy} r={radius * 0.45} fill="url(#centerGlow)" />
        <circle
          cx={cx} cy={cy}
          r={radius * 0.38}
          fill="none"
          stroke="#ffffff"
          strokeWidth={1.5}
          strokeOpacity={0.2}
          filter="url(#glow-strong)"
        />

        {/* Inner pulsing dot */}
        <circle
          cx={cx} cy={cy}
          r={6 + Math.sin(frame * 0.1) * 3}
          fill="#ffffff"
          opacity={0.6}
          filter="url(#glow-strong)"
        />

        {/* Burst particles */}
        {particles.map(({ px, py, pOpacity, size, color, i }) => (
          <circle
            key={`particle-${i}`}
            cx={px} cy={py}
            r={size}
            fill={color}
            opacity={pOpacity}
            style={{ filter: `blur(1px)` }}
          />
        ))}

        {/* Orbit particles */}
        {orbitParticles.map(({ px, py, pulse2, color }, i) => (
          <circle
            key={`orbit-${i}`}
            cx={px} cy={py}
            r={3 + pulse2 * 3}
            fill={color}
            opacity={0.5 + pulse2 * 0.5}
            style={{ filter: `blur(2px)` }}
          />
        ))}

        {/* Outer decorative ring */}
        <circle
          cx={cx} cy={cy}
          r={radius * 1.35}
          fill="none"
          stroke="#ffffff"
          strokeWidth={1}
          strokeOpacity={0.07}
          strokeDasharray="4 8"
        />
      </svg>
    </div>
  );
};