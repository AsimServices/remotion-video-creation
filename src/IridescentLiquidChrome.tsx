import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const IridescentLiquidChrome: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const t = frame / 30;

  const ripples = Array.from({ length: 12 }, (_, i) => {
    const baseX = (i % 4) * (width / 3.5) + width * 0.05;
    const baseY = Math.floor(i / 4) * (height / 2.5) + height * 0.1;
    const phase = (i * Math.PI * 0.7) + t * (0.4 + i * 0.05);
    const cx = baseX + Math.sin(t * 0.3 + i * 1.1) * 120;
    const cy = baseY + Math.cos(t * 0.25 + i * 0.9) * 80;
    const radius = 180 + Math.sin(phase) * 60;
    const hue = (i * 30 + t * 20) % 360;
    const hue2 = (hue + 60) % 360;
    const opacity = 0.18 + 0.12 * Math.sin(phase * 0.7);
    return { cx, cy, radius, hue, hue2, opacity, i };
  });

  const waveLines = Array.from({ length: 30 }, (_, i) => {
    const y = (i / 29) * height;
    const amplitude = 18 + Math.sin(t * 0.4 + i * 0.3) * 12;
    const freq = 0.006 + Math.sin(i * 0.2 + t * 0.1) * 0.002;
    const phase = t * (0.5 + i * 0.03) + i * 0.5;
    const points = Array.from({ length: 80 }, (_, j) => {
      const x = (j / 79) * width;
      const dy = Math.sin(x * freq + phase) * amplitude + Math.sin(x * freq * 2.3 + phase * 1.4) * amplitude * 0.4;
      return `${x},${y + dy}`;
    }).join(' ');
    const hue = (i * 12 + t * 15) % 360;
    const opacity = 0.06 + 0.04 * Math.sin(t * 0.6 + i * 0.4);
    return { points, hue, opacity };
  });

  const specularBlobs = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2 + t * (0.08 + i * 0.01);
    const r = 280 + Math.sin(t * 0.3 + i) * 100;
    const cx = width / 2 + Math.cos(angle) * r;
    const cy = height / 2 + Math.sin(angle) * r * 0.5;
    const rx = 200 + Math.sin(t * 0.4 + i * 1.3) * 80;
    const ry = 120 + Math.cos(t * 0.35 + i * 1.1) * 50;
    const hue = (i * 45 + t * 10) % 360;
    return { cx, cy, rx, ry, hue, i };
  });

  return (
    <div style={{ width, height, background: '#050508', overflow: 'hidden', opacity: globalOpacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bg-grad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0d0d1a" />
            <stop offset="100%" stopColor="#020204" />
          </radialGradient>
          {ripples.map(({ i, hue, hue2 }) => (
            <radialGradient key={`rg-${i}`} id={`ripple-grad-${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={`hsl(${hue}, 100%, 75%)`} stopOpacity="0.9" />
              <stop offset="50%" stopColor={`hsl(${hue2}, 90%, 55%)`} stopOpacity="0.5" />
              <stop offset="100%" stopColor={`hsl(${(hue2 + 60) % 360}, 80%, 30%)`} stopOpacity="0" />
            </radialGradient>
          ))}
          {specularBlobs.map(({ i, hue }) => (
            <radialGradient key={`sg-${i}`} id={`spec-grad-${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={`hsl(${hue}, 100%, 92%)`} stopOpacity="0.55" />
              <stop offset="60%" stopColor={`hsl(${(hue + 30) % 360}, 90%, 65%)`} stopOpacity="0.2" />
              <stop offset="100%" stopColor={`hsl(${(hue + 80) % 360}, 80%, 40%)`} stopOpacity="0" />
            </radialGradient>
          ))}
          <filter id="blur-heavy">
            <feGaussianBlur stdDeviation="35" />
          </filter>
          <filter id="blur-mid">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id="blur-light">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="metallic">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <rect width={width} height={height} fill="url(#bg-grad)" />

        {/* Deep base layer - large color pools */}
        <g filter="url(#blur-heavy)" opacity="0.85">
          {ripples.map(({ cx, cy, radius, i, opacity }) => (
            <ellipse
              key={`deep-${i}`}
              cx={cx}
              cy={cy}
              rx={radius * 1.8}
              ry={radius * 1.1}
              fill={`url(#ripple-grad-${i})`}
              opacity={opacity * 1.4}
            />
          ))}
        </g>

        {/* Mid layer - specular blobs */}
        <g filter="url(#blur-mid)" opacity="0.9">
          {specularBlobs.map(({ cx, cy, rx, ry, i }) => (
            <ellipse
              key={`spec-${i}`}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={`url(#spec-grad-${i})`}
            />
          ))}
        </g>

        {/* Wave lines layer */}
        <g opacity="0.7">
          {waveLines.map(({ points, hue, opacity }, i) => (
            <polyline
              key={`wave-${i}`}
              points={points}
              fill="none"
              stroke={`hsl(${hue}, 90%, 70%)`}
              strokeWidth={0.8 + Math.sin(t + i) * 0.4}
              opacity={opacity}
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* Sharp highlight wave lines */}
        <g filter="url(#blur-light)" opacity="0.5">
          {waveLines.filter((_, i) => i % 5 === 0).map(({ points, hue }, i) => (
            <polyline
              key={`sharp-wave-${i}`}
              points={points}
              fill="none"
              stroke={`hsl(${hue}, 100%, 88%)`}
              strokeWidth={1.5}
              opacity={0.35}
            />
          ))}
        </g>

        {/* Top shimmer layer */}
        <g filter="url(#blur-mid)" opacity="0.6">
          {ripples.slice(0, 6).map(({ cx, cy, radius, i }) => {
            const shimmerHue = (i * 60 + t * 30 + 180) % 360;
            return (
              <ellipse
                key={`shimmer-${i}`}
                cx={cx + Math.sin(t * 0.8 + i) * 40}
                cy={cy + Math.cos(t * 0.7 + i) * 25}
                rx={radius * 0.5}
                ry={radius * 0.3}
                fill={`hsl(${shimmerHue}, 100%, 85%)`}
                opacity={0.12 + 0.08 * Math.sin(t * 1.2 + i)}
              />
            );
          })}
        </g>

        {/* Central liquid mirror highlight */}
        <ellipse
          cx={width / 2 + Math.sin(t * 0.2) * 60}
          cy={height / 2 + Math.cos(t * 0.15) * 30}
          rx={320 + Math.sin(t * 0.3) * 40}
          ry={180 + Math.cos(t * 0.25) * 20}
          fill="none"
          stroke={`hsl(${(t * 25) % 360}, 80%, 80%)`}
          strokeWidth={1.5}
          opacity={0.12}
          filter="url(#blur-light)"
        />

        {/* Iridescent overlay gradient sweep */}
        <rect
          width={width}
          height={height}
          fill={`hsl(${(t * 18) % 360}, 60%, 50%)`}
          opacity={0.04}
          style={{ mixBlendMode: 'screen' as any }}
        />
      </svg>
    </div>
  );
};