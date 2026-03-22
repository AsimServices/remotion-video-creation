import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const LiquidMercury: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const t = frame / 30;

  const numRipples = 8;
  const ripples = Array.from({ length: numRipples }, (_, i) => {
    const freq = 0.3 + i * 0.15;
    const phase = (i * Math.PI * 2) / numRipples;
    const cx = width * (0.2 + 0.6 * ((Math.sin(t * freq + phase) + 1) / 2));
    const cy = height * (0.2 + 0.6 * ((Math.cos(t * freq * 0.7 + phase * 1.3) + 1) / 2));
    const r = 80 + 60 * Math.sin(t * 0.5 + phase);
    return { cx, cy, r, phase, freq };
  });

  const numRows = 60;
  const numCols = 100;
  const cellW = width / numCols;
  const cellH = height / numRows;

  const getDisplacement = (x: number, y: number) => {
    let dz = 0;
    for (let i = 0; i < numRipples; i++) {
      const { cx, cy, freq, phase } = ripples[i];
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      dz += Math.sin(dist * 0.015 - t * (2 + freq) + phase) * Math.exp(-dist * 0.0018) * 40;
    }
    dz += Math.sin(x * 0.008 + t * 0.7) * 15;
    dz += Math.cos(y * 0.01 + t * 0.5) * 12;
    dz += Math.sin((x + y) * 0.006 + t * 1.1) * 10;
    return dz;
  };

  const getNormal = (x: number, y: number) => {
    const eps = 4;
    const dzdx = (getDisplacement(x + eps, y) - getDisplacement(x - eps, y)) / (2 * eps);
    const dzdy = (getDisplacement(x, y + eps) - getDisplacement(x, y - eps)) / (2 * eps);
    const len = Math.sqrt(dzdx * dzdx + dzdy * dzdy + 1);
    return { nx: -dzdx / len, ny: -dzdy / len, nz: 1 / len };
  };

  const lightDir = {
    x: Math.sin(t * 0.3) * 0.6,
    y: Math.cos(t * 0.2) * 0.4 - 0.3,
    z: 0.8,
  };
  const lLen = Math.sqrt(lightDir.x ** 2 + lightDir.y ** 2 + lightDir.z ** 2);
  lightDir.x /= lLen; lightDir.y /= lLen; lightDir.z /= lLen;

  const cells: React.ReactNode[] = [];
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const x = col * cellW + cellW / 2;
      const y = row * cellH + cellH / 2;
      const { nx, ny, nz } = getNormal(x, y);
      const diffuse = Math.max(0, nx * lightDir.x + ny * lightDir.y + nz * lightDir.z);
      const rx = 2 * (nx * nz) - lightDir.x;
      const ry = 2 * (ny * nz) - lightDir.y;
      const rz = 2 * (nz * nz) - lightDir.z;
      const specDot = Math.max(0, rx * 0 + ry * 0 + rz * 1);
      const specular = Math.pow(specDot, 32) * 1.5;
      const ambient = 0.12;
      const intensity = ambient + diffuse * 0.6 + specular;
      const base = Math.floor(intensity * 210);
      const r = Math.min(255, base + 10);
      const g = Math.min(255, base + 10);
      const b = Math.min(255, base + 18);
      const alpha = 0.85 + 0.15 * Math.min(1, intensity);
      cells.push(
        <rect
          key={`${row}-${col}`}
          x={col * cellW}
          y={row * cellH}
          width={cellW + 0.5}
          height={cellH + 0.5}
          fill={`rgba(${r},${g},${b},${alpha})`}
        />
      );
    }
  }

  const numHighlights = 12;
  const highlights = Array.from({ length: numHighlights }, (_, i) => {
    const phase = (i * Math.PI * 2) / numHighlights;
    const hx = width * (0.15 + 0.7 * ((Math.sin(t * 0.4 + phase) + 1) / 2));
    const hy = height * (0.15 + 0.7 * ((Math.cos(t * 0.35 + phase * 1.2) + 1) / 2));
    const hr = 20 + 30 * Math.abs(Math.sin(t * 0.6 + phase));
    const ha = 0.05 + 0.12 * Math.abs(Math.sin(t * 0.8 + phase * 0.7));
    return { hx, hy, hr, ha };
  });

  return (
    <div style={{ width, height, background: '#050508', overflow: 'hidden', opacity }}>
      <svg width={width} height={height} style={{ display: 'block' }}>
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#050508" />
          </radialGradient>
          <filter id="blur1">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <rect width={width} height={height} fill="url(#bgGrad)" />
        <g>{cells}</g>
        {highlights.map((h, i) => (
          <ellipse
            key={i}
            cx={h.hx}
            cy={h.hy}
            rx={h.hr * 2.5}
            ry={h.hr * 1.2}
            fill={`rgba(220,225,255,${h.ha})`}
            filter="url(#blur2)"
          />
        ))}
        {highlights.slice(0, 5).map((h, i) => (
          <ellipse
            key={`bright-${i}`}
            cx={h.hx}
            cy={h.hy}
            rx={h.hr * 0.5}
            ry={h.hr * 0.3}
            fill={`rgba(255,255,255,${Math.min(0.9, h.ha * 5)})`}
          />
        ))}
        <rect width={width} height={height} fill="rgba(160,170,210,0.04)" />
      </svg>
    </div>
  );
};