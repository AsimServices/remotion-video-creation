import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const IsometricNeonCity: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const progress = interpolate(frame, [0, durationInFrames * 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pulseA = Math.sin(frame * 0.04) * 0.5 + 0.5;
  const pulseB = Math.sin(frame * 0.06 + 1.5) * 0.5 + 0.5;
  const pulseC = Math.sin(frame * 0.03 + 3.0) * 0.5 + 0.5;

  const isoX = (x: number, y: number) => (x - y) * 64;
  const isoY = (x: number, y: number) => (x + y) * 32;

  const cx = width / 2;
  const cy = height / 2 - 80;

  const gridSize = 7;
  const buildings: Array<{
    gx: number; gy: number;
    maxH: number; color: string; accent: string; delay: number;
  }> = [];

  const colors = [
    { color: '#0ff', accent: '#0af' },
    { color: '#f0f', accent: '#a0f' },
    { color: '#0f8', accent: '#0fa' },
    { color: '#ff0', accent: '#fa0' },
    { color: '#08f', accent: '#04f' },
  ];

  for (let gx = 0; gx < gridSize; gx++) {
    for (let gy = 0; gy < gridSize; gy++) {
      const dist = Math.sqrt((gx - gridSize / 2) ** 2 + (gy - gridSize / 2) ** 2);
      const maxH = Math.max(10, 180 - dist * 15 + Math.sin(gx * 1.3 + gy * 0.9) * 60);
      const ci = (gx * 3 + gy * 5) % colors.length;
      const delay = dist * 0.08;
      buildings.push({ gx, gy, maxH, ...colors[ci], delay });
    }
  }

  buildings.sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy));

  const tileW = 128;
  const tileH = 64;

  return (
    <div style={{ width, height, background: '#050510', overflow: 'hidden', position: 'relative', opacity }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at ${cx}px ${cy + 200}px, rgba(0,80,160,0.3) 0%, transparent 65%)`,
      }} />

      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="softglow">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Ground grid */}
        {Array.from({ length: gridSize + 1 }, (_, i) => {
          const x0 = isoX(i, 0) + cx;
          const y0 = isoY(i, 0) + cy;
          const x1 = isoX(i, gridSize) + cx;
          const y1 = isoY(i, gridSize) + cy;
          const x2 = isoX(0, i) + cx;
          const y2 = isoY(0, i) + cy;
          const x3 = isoX(gridSize, i) + cx;
          const y3 = isoY(gridSize, i) + cy;
          return (
            <g key={i}>
              <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="rgba(0,200,255,0.12)" strokeWidth="1" />
              <line x1={x2} y1={y2} x2={x3} y2={y3} stroke="rgba(0,200,255,0.12)" strokeWidth="1" />
            </g>
          );
        })}

        {/* Ground tiles */}
        {buildings.map(({ gx, gy }, idx) => {
          const px = isoX(gx, gy) + cx;
          const py = isoY(gx, gy) + cy;
          const pts = [
            [px, py],
            [px + tileW / 2, py + tileH / 2],
            [px, py + tileH],
            [px - tileW / 2, py + tileH / 2],
          ];
          return (
            <polygon
              key={`tile-${idx}`}
              points={pts.map(p => p.join(',')).join(' ')}
              fill="rgba(0,30,60,0.6)"
              stroke="rgba(0,200,255,0.08)"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Buildings */}
        {buildings.map(({ gx, gy, maxH, color, accent, delay }, idx) => {
          const localProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay * 0.5)));
          const eased = localProgress < 0.5
            ? 4 * localProgress ** 3
            : 1 - (-2 * localProgress + 2) ** 3 / 2;
          const bh = maxH * eased;

          if (bh < 1) return null;

          const px = isoX(gx, gy) + cx;
          const py = isoY(gx, gy) + cy;

          const tw = tileW / 2;
          const th = tileH / 2;

          // Top face
          const top = [
            [px, py - bh],
            [px + tw, py + th - bh],
            [px, py + tileH - bh],
            [px - tw, py + th - bh],
          ];
          // Right face
          const right = [
            [px + tw, py + th - bh],
            [px, py + tileH - bh],
            [px, py + tileH],
            [px + tw, py + th],
          ];
          // Left face
          const left = [
            [px - tw, py + th - bh],
            [px, py + tileH - bh],
            [px, py + tileH],
            [px - tw, py + th],
          ];

          const pIdx = (gx + gy) % 3;
          const pulse = pIdx === 0 ? pulseA : pIdx === 1 ? pulseB : pulseC;
          const windowGlow = 0.3 + pulse * 0.5;
          const edgeGlow = 0.5 + pulse * 0.5;

          return (
            <g key={`b-${idx}`} filter="url(#glow)">
              {/* Left face */}
              <polygon
                points={left.map(p => p.join(',')).join(' ')}
                fill={`rgba(0,20,40,0.95)`}
                stroke={accent}
                strokeWidth="0.5"
              />
              {/* Right face */}
              <polygon
                points={right.map(p => p.join(',')).join(' ')}
                fill={`rgba(0,15,30,0.95)`}
                stroke={color}
                strokeWidth="0.5"
              />
              {/* Top face */}
              <polygon
                points={top.map(p => p.join(',')).join(' ')}
                fill={`rgba(0,40,80,0.9)`}
                stroke={color}
                strokeWidth="1"
              />

              {/* Window rows on right face */}
              {bh > 30 && Array.from({ length: Math.floor(bh / 20) }, (_, wi) => {
                const wFrac = (wi + 0.5) / (bh / 20);
                const wY = py + tileH - (wi + 1) * 20 * eased;
                const wX = px + tw * 0.5;
                const wXoff = tw * 0.25;
                return (
                  <rect
                    key={wi}
                    x={wX - wXoff / 2}
                    y={wY - 5}
                    width={wXoff}
                    height={4}
                    fill={color}
                    opacity={windowGlow * (1 - wFrac * 0.3)}
                    rx={1}
                  />
                );
              })}

              {/* Window rows on left face */}
              {bh > 30 && Array.from({ length: Math.floor(bh / 20) }, (_, wi) => {
                const wFrac = (wi + 0.5) / (bh / 20);
                const wY = py + tileH - (wi + 1) * 20 * eased;
                const wX = px - tw * 0.5;
                const wXoff = tw * 0.25;
                return (
                  <rect
                    key={wi}
                    x={wX - wXoff / 2}
                    y={wY - 5}
                    width={wXoff}
                    height={4}
                    fill={accent}
                    opacity={windowGlow * 0.7 * (1 - wFrac * 0.3)}
                    rx={1}
                  />
                );
              })}

              {/* Roof edge glow */}
              <line
                x1={top[0][0]} y1={top[0][1]}
                x2={top[1][0]} y2={top[1][1]}
                stroke={color} strokeWidth={1.5} opacity={edgeGlow}
              />
              <line
                x1={top[0][0]} y1={top[0][1]}
                x2={top[3][0]} y2={top[3][1]}
                stroke={accent} strokeWidth={1.5} opacity={edgeGlow}
              />

              {/* Antenna / spire on tall buildings */}
              {bh > 120 && (
                <line
                  x1={px} y1={py - bh}
                  x2={px} y2={py - bh - 20}
                  stroke={color}
                  strokeWidth={1.5}
                  opacity={edgeGlow}
                  filter="url(#softglow)"
                />
              )}
              {bh > 120 && (
                <circle
                  cx={px} cy={py - bh - 20}
                  r={2 + pulse * 2}
                  fill={color}
                  opacity={edgeGlow}
                  filter="url(#softglow)"
                />
              )}
            </g>
          );
        })}

        {/* Atmospheric scan line */}
        {(() => {
          const scanY = interpolate(frame % 120, [0, 120], [cy - 100, cy + 400]);
          return (
            <line
              x1={0} y1={scanY}
              x2={width} y2={scanY}
              stroke="rgba(0,255,255,0.04)"
              strokeWidth="2"
            />
          );
        })()}

        {/* Floating particles */}
        {Array.from({ length: 40 }, (_, i) => {
          const seed = i * 137.508;
          const px2 = (Math.sin(seed) * 0.5 + 0.5) * width;
          const baseY = (Math.cos(seed * 0.7) * 0.5 + 0.5) * height;
          const py2 = baseY - ((frame * (0.3 + (i % 5) * 0.1)) % height);
          const r = 0.5 + (i % 3) * 0.5;
          const pc = colors[i % colors.length].color;
          return (
            <circle key={`p-${i}`} cx={px2} cy={py2} r={r} fill={pc} opacity={0.4 + (i % 3) * 0.2} />
          );
        })}
      </svg>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Color overlay shimmer */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, rgba(0,255,255,${0.02 + pulseA * 0.02}) 0%, transparent 50%, rgba(255,0,255,${0.02 + pulseB * 0.02}) 100%)`,
        pointerEvents: 'none',
      }} />
    </div>
  );
};