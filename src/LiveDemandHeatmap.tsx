import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { x: 0.138, y: 0.42, intensity: 0.95, size: 1.4 },
  { x: 0.158, y: 0.38, intensity: 0.85, size: 1.2 },
  { x: 0.48, y: 0.28, intensity: 0.9, size: 1.5 },
  { x: 0.52, y: 0.25, intensity: 0.75, size: 1.1 },
  { x: 0.505, y: 0.32, intensity: 0.88, size: 1.3 },
  { x: 0.54, y: 0.22, intensity: 0.7, size: 1.0 },
  { x: 0.55, y: 0.35, intensity: 0.82, size: 1.2 },
  { x: 0.57, y: 0.3, intensity: 0.78, size: 1.1 },
  { x: 0.62, y: 0.3, intensity: 0.72, size: 1.0 },
  { x: 0.76, y: 0.35, intensity: 0.92, size: 1.6 },
  { x: 0.78, y: 0.28, intensity: 0.88, size: 1.4 },
  { x: 0.795, y: 0.42, intensity: 0.85, size: 1.3 },
  { x: 0.82, y: 0.32, intensity: 0.8, size: 1.2 },
  { x: 0.84, y: 0.38, intensity: 0.75, size: 1.1 },
  { x: 0.87, y: 0.3, intensity: 0.7, size: 1.0 },
  { x: 0.24, y: 0.45, intensity: 0.65, size: 0.9 },
  { x: 0.27, y: 0.5, intensity: 0.6, size: 0.85 },
  { x: 0.33, y: 0.55, intensity: 0.55, size: 0.8 },
  { x: 0.35, y: 0.48, intensity: 0.58, size: 0.85 },
  { x: 0.38, y: 0.52, intensity: 0.62, size: 0.9 },
  { x: 0.42, y: 0.58, intensity: 0.5, size: 0.75 },
  { x: 0.45, y: 0.62, intensity: 0.48, size: 0.7 },
  { x: 0.58, y: 0.55, intensity: 0.55, size: 0.8 },
  { x: 0.6, y: 0.6, intensity: 0.52, size: 0.75 },
  { x: 0.65, y: 0.5, intensity: 0.6, size: 0.85 },
  { x: 0.68, y: 0.55, intensity: 0.58, size: 0.8 },
  { x: 0.72, y: 0.48, intensity: 0.65, size: 0.9 },
  { x: 0.75, y: 0.55, intensity: 0.62, size: 0.85 },
  { x: 0.88, y: 0.6, intensity: 0.58, size: 0.8 },
  { x: 0.9, y: 0.52, intensity: 0.55, size: 0.75 },
  { x: 0.15, y: 0.55, intensity: 0.45, size: 0.7 },
  { x: 0.2, y: 0.6, intensity: 0.42, size: 0.65 },
  { x: 0.1, y: 0.48, intensity: 0.5, size: 0.72 },
  { x: 0.12, y: 0.52, intensity: 0.48, size: 0.68 },
  { x: 0.92, y: 0.45, intensity: 0.45, size: 0.7 },
  { x: 0.95, y: 0.5, intensity: 0.42, size: 0.65 },
  { x: 0.7, y: 0.62, intensity: 0.4, size: 0.6 },
  { x: 0.73, y: 0.65, intensity: 0.38, size: 0.58 },
  { x: 0.48, y: 0.72, intensity: 0.35, size: 0.55 },
  { x: 0.52, y: 0.75, intensity: 0.32, size: 0.5 },
];

const WAVE_DOTS = Array.from({ length: 40 }, (_, i) => ({
  cx: ((i * 1731 + 300) % 9000) / 9000,
  cy: ((i * 937 + 200) % 4500) / 4500,
  phaseOffset: (i * 47) % 100,
  speed: 0.6 + ((i * 13) % 40) / 100,
  maxRadius: 60 + (i % 5) * 30,
}));

const GRID_LINES_H = Array.from({ length: 12 }, (_, i) => i);
const GRID_LINES_V = Array.from({ length: 22 }, (_, i) => i);

const CONTINENT_PATHS = [
  // North America (simplified)
  "M 220 160 L 280 140 L 340 150 L 380 180 L 400 220 L 390 260 L 360 280 L 320 290 L 280 280 L 250 260 L 220 240 Z",
  // South America
  "M 300 310 L 340 300 L 370 320 L 380 370 L 370 420 L 350 450 L 320 460 L 300 440 L 285 400 L 290 350 Z",
  // Europe
  "M 490 120 L 540 110 L 580 125 L 600 150 L 590 175 L 560 185 L 520 180 L 490 165 Z",
  // Africa
  "M 510 195 L 560 190 L 590 210 L 600 260 L 595 320 L 570 370 L 540 390 L 510 370 L 490 320 L 488 260 L 495 215 Z",
  // Asia
  "M 600 100 L 700 90 L 800 105 L 860 130 L 880 170 L 860 210 L 800 230 L 720 240 L 650 230 L 610 200 L 600 160 Z",
  // Australia
  "M 780 320 L 830 310 L 870 325 L 880 360 L 860 390 L 820 400 L 780 385 L 760 355 Z",
];

function getHeatColor(intensity: number, alpha: number): string {
  const r = Math.round(255 * Math.min(1, intensity * 1.5));
  const g = Math.round(255 * Math.max(0, intensity - 0.4) * 1.8);
  const b = Math.round(30 * (1 - intensity));
  return `rgba(${r},${g},${b},${alpha})`;
}

export const LiveDemandHeatmap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const mapW = width;
  const mapH = height;

  const scanLineY = ((frame * 1.5) % (mapH + 100)) - 50;

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 50% 50%, #0a0d1a 0%, #020408 100%)',
        overflow: 'hidden',
        opacity: globalOpacity,
        position: 'relative',
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Grid lines */}
        {GRID_LINES_H.map((i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={(i / 11) * mapH}
            x2={mapW}
            y2={(i / 11) * mapH}
            stroke="rgba(0,180,255,0.07)"
            strokeWidth={1}
          />
        ))}
        {GRID_LINES_V.map((i) => (
          <line
            key={`v${i}`}
            x1={(i / 21) * mapW}
            y1={0}
            x2={(i / 21) * mapW}
            y2={mapH}
            stroke="rgba(0,180,255,0.07)"
            strokeWidth={1}
          />
        ))}

        {/* Continent silhouettes */}
        {CONTINENT_PATHS.map((d, idx) => {
          const scaledD = d.replace(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g, (_, px, py) => {
            const nx = (parseFloat(px) / 1100) * mapW;
            const ny = (parseFloat(py) / 550) * mapH;
            return `${nx} ${ny}`;
          });
          return (
            <path
              key={idx}
              d={scaledD}
              fill="rgba(20,35,60,0.6)"
              stroke="rgba(0,120,200,0.25)"
              strokeWidth={2}
            />
          );
        })}

        {/* Heatmap glow blobs behind cities */}
        {CITIES.map((city, idx) => {
          const cx = city.x * mapW;
          const cy = city.y * mapH;
          const phase = (frame * 0.02 * city.intensity + idx * 0.7) % (Math.PI * 2);
          const pulse = 0.7 + 0.3 * Math.sin(phase);
          const blobR = city.size * 180 * pulse;
          const gradId = `blobGrad${idx}`;
          return (
            <g key={`blob${idx}`}>
              <defs>
                <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={getHeatColor(city.intensity, 0.55 * pulse)} />
                  <stop offset="40%" stopColor={getHeatColor(city.intensity * 0.8, 0.25 * pulse)} />
                  <stop offset="100%" stopColor={getHeatColor(city.intensity * 0.5, 0)} />
                </radialGradient>
              </defs>
              <circle cx={cx} cy={cy} r={blobR} fill={`url(#${gradId})`} />
            </g>
          );
        })}

        {/* Wave rings on high-intensity cities */}
        {CITIES.filter((c) => c.intensity > 0.7).map((city, idx) => {
          const cx = city.x * mapW;
          const cy = city.y * mapH;
          return [0, 1, 2].map((ring) => {
            const ringPhase = ((frame * 0.015 + idx * 0.8 + ring * 0.35) % 1);
            const ringR = city.size * 60 + ringPhase * city.size * 260;
            const ringOpacity = (1 - ringPhase) * 0.6 * city.intensity;
            return (
              <circle
                key={`ring${idx}_${ring}`}
                cx={cx}
                cy={cy}
                r={ringR}
                fill="none"
                stroke={getHeatColor(city.intensity, ringOpacity)}
                strokeWidth={2.5}
              />
            );
          });
        })}

        {/* City core dots */}
        {CITIES.map((city, idx) => {
          const cx = city.x * mapW;
          const cy = city.y * mapH;
          const phasePulse = Math.sin(frame * 0.04 * city.intensity + idx * 1.1);
          const coreR = city.size * 14 * (0.85 + 0.15 * phasePulse);
          const coreOpacity = 0.8 + 0.2 * phasePulse;
          const glowId = `glowGrad${idx}`;
          return (
            <g key={`dot${idx}`}>
              <defs>
                <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="white" stopOpacity={coreOpacity * 0.95} />
                  <stop offset="35%" stopColor={getHeatColor(city.intensity, coreOpacity * 0.85)} />
                  <stop offset="100%" stopColor={getHeatColor(city.intensity * 0.7, 0)} />
                </radialGradient>
              </defs>
              <circle cx={cx} cy={cy} r={coreR * 2.5} fill={`url(#${glowId})`} />
              <circle
                cx={cx}
                cy={cy}
                r={coreR * 0.4}
                fill="white"
                opacity={coreOpacity * 0.95}
              />
            </g>
          );
        })}

        {/* Ambient scattered wave dots */}
        {WAVE_DOTS.map((dot, idx) => {
          const cx = dot.cx * mapW;
          const cy = dot.cy * mapH;
          const phase = ((frame * dot.speed * 0.01 + dot.phaseOffset * 0.01) % 1);
          const r = phase * dot.maxRadius * (width / 3840);
          const opacity = (1 - phase) * 0.35;
          return (
            <circle
              key={`wave${idx}`}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={`rgba(0,180,255,${opacity})`}
              strokeWidth={1.2}
            />
          );
        })}

        {/* Scan line */}
        <line
          x1={0}
          y1={scanLineY}
          x2={mapW}
          y2={scanLineY}
          stroke="rgba(0,220,255,0.18)"
          strokeWidth={2}
        />
        <rect
          x={0}
          y={scanLineY - 60}
          width={mapW}
          height={60}
          fill="url(#scanGrad)"
        />
        <defs>
          <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,220,255,0)" />
            <stop offset="100%" stopColor="rgba(0,220,255,0.06)" />
          </linearGradient>
        </defs>

        {/* Outer vignette */}
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.75)" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={mapW} height={mapH} fill="url(#vignette)" />

        {/* Top cyan border glow */}
        <rect
          x={0}
          y={0}
          width={mapW}
          height={4}
          fill={`rgba(0,200,255,${0.4 + 0.2 * Math.sin(frame * 0.05)})`}
        />
        <rect
          x={0}
          y={mapH - 4}
          width={mapW}
          height={4}
          fill={`rgba(0,200,255,${0.3 + 0.15 * Math.sin(frame * 0.05 + 1)})`}
        />
      </svg>
    </div>
  );
};