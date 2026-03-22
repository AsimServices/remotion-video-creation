import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const GlitchInterference: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  // Pseudo-random based on frame
  const seed = (n: number) => {
    const x = Math.sin(n * 127.1 + frame * 0.3) * 43758.5453;
    return x - Math.floor(x);
  };

  const seed2 = (n: number, offset = 0) => {
    const x = Math.sin(n * 311.7 + frame * 1.7 + offset) * 43758.5453;
    return x - Math.floor(x);
  };

  // Glitch intensity varies over time
  const glitchIntensity = Math.sin(frame * 0.15) * 0.5 + 0.5 + seed(frame) * 0.3;
  const bigGlitch = seed(frame * 7.3) > 0.85 ? 1 : 0;
  const rgbShift = interpolate(glitchIntensity, [0, 1], [2, 18]) * (bigGlitch ? 3 : 1);

  // Scan lines count
  const numScanLines = 40;
  const numNoiseBlocks = 60;
  const numGlitchBars = 8;

  // Generate noise blocks
  const noiseBlocks = Array.from({ length: numNoiseBlocks }, (_, i) => {
    const x = seed(i * 13.7) * width;
    const y = seed2(i * 7.9) * height;
    const w = seed(i * 3.1 + 50) * 120 + 10;
    const h = seed2(i * 5.3 + 20) * 30 + 4;
    const alpha = seed(i * 11.1 + frame * 0.1) * 0.4;
    const color = i % 3 === 0 ? `rgba(255,0,80,${alpha})` : i % 3 === 1 ? `rgba(0,255,220,${alpha})` : `rgba(200,200,255,${alpha})`;
    return { x, y, w, h, color };
  });

  // Glitch horizontal bars
  const glitchBars = Array.from({ length: numGlitchBars }, (_, i) => {
    const active = seed(i * 99.3 + Math.floor(frame / 3)) > 0.5;
    const y = seed2(i * 41.1 + Math.floor(frame / 5)) * height;
    const h = seed(i * 17.3 + Math.floor(frame / 4)) * 40 + 5;
    const xShift = (seed(i * 23.7 + frame) - 0.5) * 80;
    const alpha = active ? seed(i * 55.1 + frame) * 0.7 + 0.2 : 0;
    return { y, h, xShift, alpha, active };
  });

  // Vertical lines
  const numVLines = 6;
  const vLines = Array.from({ length: numVLines }, (_, i) => {
    const x = seed(i * 77.1 + Math.floor(frame / 8)) * width;
    const alpha = seed2(i * 33.3 + frame * 0.5) * 0.5;
    return { x, alpha };
  });

  // CRT scanlines
  const scanLines = Array.from({ length: numScanLines }, (_, i) => {
    const y = (i / numScanLines) * height;
    const alpha = 0.06 + seed(i * 2.1) * 0.04;
    return { y, alpha };
  });

  return (
    <div style={{ width, height, background: '#000', overflow: 'hidden', opacity, position: 'relative' }}>
      {/* Base gradient background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 50%, #0a0a1a 0%, #000005 60%, #000000 100%)`,
      }} />

      {/* Animated grid */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"
            patternTransform={`translate(${frame % 60},${frame % 60})`}>
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(0,200,255,0.07)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />
      </svg>

      {/* RGB Channel Split Layer - Red */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen' }}>
        {glitchBars.map((bar, i) => (
          bar.active && (
            <rect key={`r-${i}`}
              x={bar.xShift - rgbShift}
              y={bar.y}
              width={width + Math.abs(bar.xShift)}
              height={bar.h}
              fill={`rgba(255,0,60,${bar.alpha * 0.8})`}
            />
          )
        ))}
        {/* Full-frame red channel offset */}
        <g transform={`translate(${-rgbShift},0)`} opacity="0.15">
          <rect width={width} height={height} fill="rgba(255,0,0,0)" />
          {noiseBlocks.map((b, i) => (
            i % 3 === 0 && (
              <rect key={`rn-${i}`} x={b.x} y={b.y} width={b.w} height={b.h} fill={`rgba(255,30,0,${0.3 + seed(i) * 0.4})`} />
            )
          ))}
        </g>
      </svg>

      {/* RGB Channel Split Layer - Cyan */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen' }}>
        {glitchBars.map((bar, i) => (
          bar.active && (
            <rect key={`c-${i}`}
              x={bar.xShift + rgbShift}
              y={bar.y}
              width={width + Math.abs(bar.xShift)}
              height={bar.h}
              fill={`rgba(0,255,220,${bar.alpha * 0.8})`}
            />
          )
        ))}
        <g transform={`translate(${rgbShift},0)`} opacity="0.15">
          {noiseBlocks.map((b, i) => (
            i % 3 === 1 && (
              <rect key={`cn-${i}`} x={b.x} y={b.y} width={b.w} height={b.h} fill={`rgba(0,255,200,${0.3 + seed2(i) * 0.4})`} />
            )
          ))}
        </g>
      </svg>

      {/* Noise blocks layer */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen' }}>
        {noiseBlocks.map((b, i) => (
          <rect key={`nb-${i}`} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.color} />
        ))}
      </svg>

      {/* Vertical glitch lines */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen' }}>
        {vLines.map((vl, i) => (
          <line key={`vl-${i}`} x1={vl.x} y1={0} x2={vl.x} y2={height}
            stroke={`rgba(180,180,255,${vl.alpha})`} strokeWidth={seed(i * 9.1) * 3 + 0.5} />
        ))}
      </svg>

      {/* Main signal waveform */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        {[0, 1, 2].map((layer) => {
          const points = Array.from({ length: 200 }, (_, i) => {
            const x = (i / 199) * width;
            const baseY = height / 2 + (layer - 1) * 80;
            const wave1 = Math.sin(i * 0.05 + frame * 0.08 + layer) * 60;
            const wave2 = Math.sin(i * 0.13 - frame * 0.05 + layer * 2) * 30;
            const glitch = seed(i * 7.1 + layer * 13 + Math.floor(frame / 2)) > 0.95
              ? (seed2(i + layer) - 0.5) * 150 : 0;
            return `${x},${baseY + wave1 + wave2 + glitch}`;
          }).join(' ');
          const colors = ['rgba(255,50,100,0.8)', 'rgba(0,255,200,0.8)', 'rgba(100,100,255,0.8)'];
          return (
            <polyline key={`wave-${layer}`} points={points}
              fill="none" stroke={colors[layer]} strokeWidth="1.5"
              opacity={0.6 + seed(layer * 333 + frame * 0.01) * 0.4}
            />
          );
        })}
      </svg>

      {/* Horizontal glitch displacement bands */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 20 }, (_, i) => {
          const shouldShow = seed(i * 444.1 + Math.floor(frame / 2)) > 0.75;
          if (!shouldShow) return null;
          const y = seed2(i * 222.3 + Math.floor(frame / 3)) * height;
          const h = seed(i * 111.7 + frame) * 15 + 2;
          const dx = (seed(i * 88.8 + frame) - 0.5) * 60;
          const alpha = seed2(i * 66.6 + frame) * 0.6 + 0.2;
          const color = i % 2 === 0 ? `rgba(255,255,255,${alpha})` : `rgba(0,220,255,${alpha * 0.8})`;
          return (
            <rect key={`hg-${i}`} x={dx} y={y} width={width} height={h} fill={color} />
          );
        })}
      </svg>

      {/* Static noise overlay using tiny rects */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0, mixBlendMode: 'overlay' }}>
        {Array.from({ length: 300 }, (_, i) => {
          const x = seed(i * 7.77 + Math.floor(frame / 1)) * width;
          const y = seed2(i * 3.33 + Math.floor(frame / 1)) * height;
          const s = seed(i * 15.5) * 4 + 1;
          const alpha = seed(i * 9.9 + frame) * 0.6;
          const bright = seed2(i * 5.5) > 0.5 ? 255 : 0;
          return (
            <rect key={`ns-${i}`} x={x} y={y} width={s} height={s}
              fill={`rgba(${bright},${bright},${bright},${alpha})`} />
          );
        })}
      </svg>

      {/* CRT Scanlines */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        {scanLines.map((sl, i) => (
          <line key={`sl-${i}`} x1={0} y1={sl.y} x2={width} y2={sl.y}
            stroke={`rgba(0,0,0,${sl.alpha})`} strokeWidth="2" />
        ))}
      </svg>

      {/* Vignette */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="40%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#vignette)" />
      </svg>

      {/* Edge flicker */}
      <div style={{
        position: 'absolute', inset: 0,
        boxShadow: `inset 0 0 ${80 + glitchIntensity * 40}px rgba(0,200,255,${0.05 + glitchIntensity * 0.1})`,
        pointerEvents: 'none',
      }} />
    </div>
  );
};