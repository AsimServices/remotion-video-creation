import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const HolographicGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const progress = frame / durationInFrames;
  const scanLineOffset = (frame * 3) % height;
  const pulseA = Math.sin(frame * 0.05) * 0.5 + 0.5;
  const pulseB = Math.sin(frame * 0.03 + 1.2) * 0.5 + 0.5;
  const horizonY = height * 0.42;
  const vpX = width / 2;

  const numCols = 24;
  const numRows = 30;
  const gridWidth = width * 2.2;
  const gridDepth = height - horizonY;

  const colLines = [];
  for (let i = 0; i <= numCols; i++) {
    const t = i / numCols;
    const xFar = vpX + (t - 0.5) * gridWidth * 0.08;
    const xNear = vpX + (t - 0.5) * gridWidth;
    const alpha = 0.15 + 0.55 * (1 - Math.abs(t - 0.5) * 2);
    const glowAlpha = alpha * (0.4 + 0.6 * pulseA);
    colLines.push(
      <line
        key={`col-${i}`}
        x1={xFar} y1={horizonY}
        x2={xNear} y2={height + 40}
        stroke={`rgba(0,255,220,${glowAlpha})`}
        strokeWidth={i === numCols / 2 ? 2.5 : 1}
      />
    );
  }

  const rowLines = [];
  for (let j = 1; j <= numRows; j++) {
    const tRaw = j / numRows;
    const tPow = Math.pow(tRaw, 2.2);
    const y = horizonY + tPow * gridDepth * 1.05;
    const xSpread = (gridWidth / 2) * (0.04 + 0.96 * tPow);
    const alpha = 0.08 + 0.55 * tPow;
    const animShift = (frame * 2.5 * (tPow)) % (gridDepth * 1.05);
    const yAnim = horizonY + ((tPow * gridDepth * 1.05 + animShift * 0) % (gridDepth * 1.05));
    const scanHighlight = Math.abs(y - scanLineOffset) < 8 ? 0.9 : 0;
    const finalAlpha = Math.min(1, alpha + scanHighlight * 0.6);
    rowLines.push(
      <line
        key={`row-${j}`}
        x1={vpX - xSpread} y1={y}
        x2={vpX + xSpread} y2={y}
        stroke={`rgba(0,255,220,${finalAlpha})`}
        strokeWidth={scanHighlight > 0 ? 2.5 : 1}
      />
    );
    void yAnim;
    void animShift;
  }

  const scanBars = [];
  const numScanBars = 3;
  for (let s = 0; s < numScanBars; s++) {
    const offset = (s / numScanBars) * height;
    const sy = ((frame * 2.2 + offset) % (height * 1.4)) - height * 0.2;
    if (sy > horizonY - 20) {
      const tScan = Math.max(0, (sy - horizonY) / (height - horizonY));
      const barAlpha = (0.12 + 0.2 * pulseB) * (0.3 + 0.7 * tScan);
      scanBars.push(
        <rect
          key={`scan-${s}`}
          x={0} y={sy - 6}
          width={width} height={14}
          fill={`rgba(0,255,200,${barAlpha})`}
        />
      );
    }
  }

  const glowNodes = [];
  for (let i = 1; i < numCols; i += 3) {
    for (let j = 2; j <= numRows; j += 4) {
      const tC = i / numCols;
      const tR = Math.pow(j / numRows, 2.2);
      const nx = vpX + (tC - 0.5) * gridWidth * (0.04 + 0.96 * tR);
      const ny = horizonY + tR * gridDepth * 1.05;
      if (ny > height + 20) continue;
      const nodeFlicker = Math.sin(frame * 0.12 + i * 1.7 + j * 0.9) * 0.5 + 0.5;
      const nodeAlpha = 0.3 + 0.7 * nodeFlicker * tR;
      glowNodes.push(
        <circle
          key={`node-${i}-${j}`}
          cx={nx} cy={ny}
          r={2.5 + nodeFlicker * 2}
          fill={`rgba(0,255,220,${nodeAlpha})`}
        />
      );
    }
  }

  const horizonGlowHeight = 90;
  const flareX = vpX + Math.sin(frame * 0.018) * width * 0.06;

  return (
    <div style={{ width, height, background: '#020810', overflow: 'hidden', opacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="horizonGlow" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor={`rgba(0,200,255,${0.35 + 0.2 * pulseA})`} />
            <stop offset="60%" stopColor="rgba(0,100,200,0.08)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <radialGradient id="flareGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`rgba(100,255,255,${0.7 + 0.3 * pulseB})`} />
            <stop offset="100%" stopColor="rgba(0,200,255,0)" />
          </radialGradient>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020810" />
            <stop offset="100%" stopColor="#041228" />
          </linearGradient>
          <linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(2,8,16,0.85)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Sky */}
        <rect x={0} y={0} width={width} height={horizonY} fill="url(#skyGrad)" />

        {/* Horizon atmospheric glow */}
        <rect
          x={0} y={horizonY - horizonGlowHeight}
          width={width} height={horizonGlowHeight * 2}
          fill="url(#horizonGlow)"
        />

        {/* Distant star field */}
        {Array.from({ length: 60 }, (_, i) => {
          const sx = (i * 317 + 11) % width;
          const sy2 = (i * 199 + 7) % (horizonY * 0.92);
          const starFlicker = Math.sin(frame * 0.07 + i * 2.3) * 0.4 + 0.6;
          return (
            <circle
              key={`star-${i}`}
              cx={sx} cy={sy2}
              r={0.8 + (i % 3) * 0.5}
              fill={`rgba(180,240,255,${starFlicker * 0.6})`}
            />
          );
        })}

        {/* Horizon line */}
        <line
          x1={0} y1={horizonY} x2={width} y2={horizonY}
          stroke={`rgba(0,220,255,${0.6 + 0.4 * pulseA})`}
          strokeWidth={2}
          filter="url(#softGlow)"
        />
        <line
          x1={0} y1={horizonY} x2={width} y2={horizonY}
          stroke={`rgba(0,220,255,${0.3 + 0.2 * pulseA})`}
          strokeWidth={8}
        />

        {/* Grid floor */}
        <g filter="url(#glow)">
          {colLines}
          {rowLines}
        </g>

        {/* Scan bars */}
        {scanBars}

        {/* Grid intersection nodes */}
        <g filter="url(#glow)">
          {glowNodes}
        </g>

        {/* Floor fade overlay */}
        <rect x={0} y={horizonY} width={width} height={height - horizonY} fill="url(#floorFade)" />

        {/* Central vanishing point flare */}
        <ellipse
          cx={flareX} cy={horizonY}
          rx={80 + 30 * pulseB} ry={18 + 8 * pulseA}
          fill="url(#flareGlow)"
          opacity={0.7 + 0.3 * pulseA}
        />

        {/* Ambient vignette */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.72)" />
        </radialGradient>
        <rect x={0} y={0} width={width} height={height} fill="url(#vignette)" />
      </svg>
    </div>
  );
};