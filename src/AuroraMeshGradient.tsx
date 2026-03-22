import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AuroraMeshGradient: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const t = frame / durationInFrames;

  const blob = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    phaseX: number,
    phaseY: number,
    phaseRX: number,
    phaseRY: number,
    speedX: number,
    speedY: number,
    color1: string,
    color2: string,
    gradId: string,
    blurId: string,
    opacity2: number
  ) => {
    const x = cx + Math.sin(t * Math.PI * 2 * speedX + phaseX) * width * 0.12;
    const y = cy + Math.cos(t * Math.PI * 2 * speedY + phaseY) * height * 0.1;
    const rxx = rx + Math.sin(t * Math.PI * 2 * 1.3 + phaseRX) * rx * 0.2;
    const ryy = ry + Math.cos(t * Math.PI * 2 * 1.1 + phaseRY) * ry * 0.2;
    const rotate = t * 360 * 0.05 + phaseX * 20;

    return (
      <>
        <defs>
          <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color1} stopOpacity={opacity2} />
            <stop offset="100%" stopColor={color2} stopOpacity={0} />
          </radialGradient>
          <filter id={blurId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="60" />
          </filter>
        </defs>
        <ellipse
          cx={x}
          cy={y}
          rx={rxx}
          ry={ryy}
          fill={`url(#${gradId})`}
          filter={`url(#${blurId})`}
          transform={`rotate(${rotate}, ${x}, ${y})`}
        />
      </>
    );
  };

  const meshLines = () => {
    const lines = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const phase = (i / count) * Math.PI * 2;
      const offset = Math.sin(t * Math.PI * 2 * 0.5 + phase) * 40;
      const alpha = 0.04 + 0.03 * Math.abs(Math.sin(t * Math.PI * 2 * 0.3 + phase));
      lines.push(
        <line
          key={`h${i}`}
          x1={0}
          y1={(height / count) * i + offset}
          x2={width}
          y2={(height / count) * i + offset + Math.sin(t * Math.PI * 2 + phase) * 30}
          stroke="rgba(180,120,255,1)"
          strokeWidth={0.6}
          strokeOpacity={alpha}
        />
      );
      lines.push(
        <line
          key={`v${i}`}
          x1={(width / count) * i + offset}
          y1={0}
          x2={(width / count) * i + offset + Math.sin(t * Math.PI * 2 + phase) * 30}
          y2={height}
          stroke="rgba(0,230,220,1)"
          strokeWidth={0.6}
          strokeOpacity={alpha}
        />
      );
    }
    return lines;
  };

  const particles = () => {
    const pts = [];
    const count = 80;
    for (let i = 0; i < count; i++) {
      const seed = i * 137.508;
      const px = ((seed * 7.3) % width);
      const py = ((seed * 3.7) % height);
      const drift = Math.sin(t * Math.PI * 2 * 0.4 + seed) * 60;
      const driftY = Math.cos(t * Math.PI * 2 * 0.3 + seed * 0.7) * 40;
      const alpha = 0.3 + 0.5 * Math.abs(Math.sin(t * Math.PI * 2 * 0.6 + seed));
      const r = 1 + 1.5 * Math.abs(Math.sin(seed));
      const color = i % 2 === 0 ? `rgba(160,80,255,${alpha})` : `rgba(0,210,220,${alpha})`;
      pts.push(
        <circle key={i} cx={px + drift} cy={py + driftY} r={r} fill={color} />
      );
    }
    return pts;
  };

  return (
    <div
      style={{
        width,
        height,
        background: '#07020f',
        position: 'relative',
        overflow: 'hidden',
        opacity,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {blob(width * 0.25, height * 0.35, 500, 380, 0, 0.5, 1.0, 1.2, 0.6, 0.5, '#8B2FC9', '#3D0070', 'g1', 'b1', 0.85)}
        {blob(width * 0.7, height * 0.55, 460, 350, 1.5, 2.0, 2.1, 0.8, 0.7, 0.4, '#00E5D5', '#007090', 'g2', 'b2', 0.75)}
        {blob(width * 0.5, height * 0.2, 420, 320, 3.0, 0.9, 0.5, 2.5, 0.5, 0.8, '#C040FF', '#6000AA', 'g3', 'b3', 0.7)}
        {blob(width * 0.15, height * 0.75, 380, 300, 2.0, 3.5, 1.8, 0.3, 0.9, 0.6, '#00BFDF', '#005070', 'g4', 'b4', 0.7)}
        {blob(width * 0.82, height * 0.2, 350, 280, 4.0, 1.1, 0.9, 1.7, 0.4, 0.7, '#9B59E8', '#200050', 'g5', 'b5', 0.65)}
        {blob(width * 0.6, height * 0.8, 400, 320, 0.8, 2.8, 2.3, 1.0, 0.8, 0.5, '#20DDD0', '#004060', 'g6', 'b6', 0.6)}

        <g opacity={0.6}>{meshLines()}</g>
        <g>{particles()}</g>
      </svg>
    </div>
  );
};