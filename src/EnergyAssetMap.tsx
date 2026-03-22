import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CONTINENTS = [
  // North America
  { id: 'na', points: '320,180 280,200 260,240 270,280 300,320 340,350 380,340 420,310 440,270 430,230 400,200 360,185' },
  // South America
  { id: 'sa', points: '360,380 330,400 310,440 320,490 340,540 360,570 390,560 410,520 420,470 410,430 390,400' },
  // Europe
  { id: 'eu', points: '540,160 520,180 510,210 525,240 550,250 580,240 600,210 595,180 570,165' },
  // Africa
  { id: 'af', points: '540,270 520,300 510,340 515,400 530,450 555,480 580,475 600,440 610,390 605,340 590,300 570,275' },
  // Asia
  { id: 'as', points: '620,140 600,160 590,200 600,240 630,260 670,270 720,260 760,240 780,200 770,160 740,140 700,130 660,135' },
  // Australia
  { id: 'au', points: '720,400 700,420 695,455 710,480 740,490 775,480 795,455 790,425 765,408' },
];

const ASSETS = [
  { x: 310, y: 260, size: 18, delay: 0, intensity: 1.0 },
  { x: 390, y: 290, size: 14, delay: 15, intensity: 0.85 },
  { x: 350, y: 480, size: 16, delay: 8, intensity: 0.9 },
  { x: 370, y: 520, size: 12, delay: 22, intensity: 0.75 },
  { x: 555, y: 200, size: 13, delay: 5, intensity: 0.88 },
  { x: 570, y: 380, size: 15, delay: 18, intensity: 0.95 },
  { x: 550, y: 430, size: 11, delay: 30, intensity: 0.7 },
  { x: 640, y: 180, size: 17, delay: 12, intensity: 1.0 },
  { x: 700, y: 200, size: 14, delay: 25, intensity: 0.82 },
  { x: 750, y: 220, size: 16, delay: 3, intensity: 0.93 },
  { x: 720, y: 160, size: 12, delay: 38, intensity: 0.78 },
  { x: 730, y: 450, size: 13, delay: 10, intensity: 0.86 },
  { x: 760, y: 465, size: 10, delay: 20, intensity: 0.72 },
  { x: 420, y: 240, size: 15, delay: 7, intensity: 0.91 },
  { x: 620, y: 250, size: 11, delay: 42, intensity: 0.68 },
  { x: 680, y: 240, size: 14, delay: 33, intensity: 0.84 },
  { x: 580, y: 320, size: 16, delay: 16, intensity: 0.97 },
  { x: 340, y: 310, size: 13, delay: 28, intensity: 0.79 },
  { x: 760, y: 180, size: 12, delay: 45, intensity: 0.73 },
  { x: 510, y: 360, size: 14, delay: 35, intensity: 0.87 },
];

const CONNECTIONS = [
  [0, 6], [1, 3], [2, 4], [5, 9], [7, 8],
  [10, 11], [3, 13], [4, 14], [6, 15], [16, 17],
  [0, 13], [7, 10], [8, 9], [11, 12], [5, 16],
];

const GRID_LINES_H = Array.from({ length: 20 }, (_, i) => i);
const GRID_LINES_V = Array.from({ length: 36 }, (_, i) => i);

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 1731 + 200) % 900,
  y: (i * 1337 + 100) % 600,
  size: ((i * 97) % 4) + 1,
  speed: ((i * 53) % 80) + 20,
  offset: (i * 37) % 100,
}));

export const EnergyAssetMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const scaleX = width / 1100;
  const scaleY = height / 700;

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const globalPulse = (frame % 90) / 90;

  return (
    <div style={{ width, height, background: '#050810', overflow: 'hidden', opacity }}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 1100 700"
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="100%" stopColor="#020508" />
          </radialGradient>

          <radialGradient id="pulseGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff6600" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#ff4400" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ff2200" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="30%" stopColor="#ffcc00" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#ff6600" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ff3300" stopOpacity="0.4" />
          </radialGradient>

          <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="strongGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="10" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="connectionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff6600" stopOpacity="0" />
            <stop offset="50%" stopColor="#ff6600" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff6600" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="1100" height="700" fill="url(#bgGrad)" />

        {/* Grid lines */}
        {GRID_LINES_H.map(i => {
          const y = (i / 19) * 700;
          const lineOpacity = 0.04 + 0.02 * Math.sin(frame * 0.02 + i * 0.3);
          return (
            <line
              key={`h${i}`}
              x1="0" y1={y} x2="1100" y2={y}
              stroke="#1a3a5c"
              strokeWidth="0.5"
              opacity={lineOpacity}
            />
          );
        })}
        {GRID_LINES_V.map(i => {
          const x = (i / 35) * 1100;
          const lineOpacity = 0.04 + 0.02 * Math.sin(frame * 0.02 + i * 0.2);
          return (
            <line
              key={`v${i}`}
              x1={x} y1="0" x2={x} y2="700"
              stroke="#1a3a5c"
              strokeWidth="0.5"
              opacity={lineOpacity}
            />
          );
        })}

        {/* Continent shapes */}
        {CONTINENTS.map(c => (
          <g key={c.id}>
            <polygon
              points={c.points}
              fill="#0d2035"
              stroke="#1a4060"
              strokeWidth="1.5"
              opacity="0.85"
            />
            <polygon
              points={c.points}
              fill="none"
              stroke="#1e5080"
              strokeWidth="0.5"
              opacity="0.4"
            />
          </g>
        ))}

        {/* Connection lines between assets */}
        {CONNECTIONS.map(([a, b], idx) => {
          const assetA = ASSETS[a];
          const assetB = ASSETS[b];
          const dashOffset = -(frame * 2) % 40;
          const connPulse = Math.sin(frame * 0.05 + idx * 0.7);
          const connOpacity = interpolate(connPulse, [-1, 1], [0.1, 0.45]);
          return (
            <line
              key={`conn${idx}`}
              x1={assetA.x} y1={assetA.y}
              x2={assetB.x} y2={assetB.y}
              stroke="#ff6600"
              strokeWidth="0.8"
              strokeDasharray="8 6"
              strokeDashoffset={dashOffset + idx * 5}
              opacity={connOpacity}
              filter="url(#softGlow)"
            />
          );
        })}

        {/* Floating particles */}
        {PARTICLES.map((p, i) => {
          const t = ((frame + p.offset * 2) % p.speed) / p.speed;
          const py = p.y - t * 60;
          const px = p.x + Math.sin(frame * 0.02 + i * 1.3) * 8;
          const particleOpacity = interpolate(t, [0, 0.1, 0.9, 1], [0, 0.6, 0.6, 0]);
          return (
            <circle
              key={`particle${i}`}
              cx={px}
              cy={py}
              r={p.size * 0.5}
              fill="#ff6600"
              opacity={particleOpacity * 0.3}
            />
          );
        })}

        {/* Asset pulse rings and cores */}
        {ASSETS.map((asset, i) => {
          const phasedFrame = (frame + asset.delay * 3) % 90;
          const pulseProgress = phasedFrame / 90;

          // Outer ring 1
          const ring1Scale = interpolate(pulseProgress, [0, 1], [0.5, 3.5]);
          const ring1Opacity = interpolate(pulseProgress, [0, 0.3, 1], [0.8, 0.5, 0]) * asset.intensity;

          // Outer ring 2
          const ring2Progress = (pulseProgress + 0.35) % 1;
          const ring2Scale = interpolate(ring2Progress, [0, 1], [0.5, 2.8]);
          const ring2Opacity = interpolate(ring2Progress, [0, 0.3, 1], [0.6, 0.35, 0]) * asset.intensity;

          // Inner glow pulse
          const innerPulse = 0.7 + 0.3 * Math.sin(frame * 0.12 + i * 0.8);
          const innerGlowSize = asset.size * 1.5 * innerPulse;

          // Core breathe
          const coreBreathe = 0.85 + 0.15 * Math.sin(frame * 0.1 + i * 0.6);

          // Intro animation
          const assetRevealFrame = i * 12;
          const assetScale = interpolate(frame, [assetRevealFrame, assetRevealFrame + 30], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const assetOpacity = interpolate(frame, [assetRevealFrame, assetRevealFrame + 20], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <g key={`asset${i}`} opacity={assetOpacity} transform={`translate(${asset.x}, ${asset.y}) scale(${assetScale}) translate(${-asset.x}, ${-asset.y})`}>
              {/* Outermost pulse ring 1 */}
              <circle
                cx={asset.x} cy={asset.y}
                r={asset.size * ring1Scale}
                fill="none"
                stroke="#ff5500"
                strokeWidth="1.5"
                opacity={ring1Opacity}
              />

              {/* Outer pulse ring 2 */}
              <circle
                cx={asset.x} cy={asset.y}
                r={asset.size * ring2Scale}
                fill="none"
                stroke="#ff7700"
                strokeWidth="1"
                opacity={ring2Opacity}
              />

              {/* Inner glow area */}
              <circle
                cx={asset.x} cy={asset.y}
                r={innerGlowSize}
                fill="url(#pulseGrad)"
                opacity={0.35 * asset.intensity}
                filter="url(#strongGlow)"
              />

              {/* Core dot */}
              <circle
                cx={asset.x} cy={asset.y}
                r={asset.size * 0.45 * coreBreathe}
                fill="url(#coreGrad)"
                filter="url(#glow)"
                opacity={asset.intensity}
              />

              {/* Bright center */}
              <circle
                cx={asset.x} cy={asset.y}
                r={asset.size * 0.15}
                fill="#ffffff"
                opacity={0.9 * asset.intensity}
              />

              {/* Cross hair lines */}
              <line
                x1={asset.x - asset.size * 0.8} y1={asset.y}
                x2={asset.x + asset.size * 0.8} y2={asset.y}
                stroke="#ff8833"
                strokeWidth="0.7"
                opacity={0.5 * asset.intensity}
              />
              <line
                x1={asset.x} y1={asset.y - asset.size * 0.8}
                x2={asset.x} y2={asset.y + asset.size * 0.8}
                stroke="#ff8833"
                strokeWidth="0.7"
                opacity={0.5 * asset.intensity}
              />
            </g>
          );
        })}

        {/* Global atmospheric pulse overlay */}
        <ellipse
          cx="550" cy="350"
          rx={400 + 30 * Math.sin(frame * 0.03)}
          ry={250 + 20 * Math.sin(frame * 0.025)}
          fill="none"
          stroke="#ff4400"
          strokeWidth="1"
          opacity={0.05 + 0.03 * Math.sin(frame * 0.04)}
        />
        <ellipse
          cx="550" cy="350"
          rx={320 + 25 * Math.sin(frame * 0.035 + 1)}
          ry={190 + 15 * Math.sin(frame * 0.028 + 1)}
          fill="none"
          stroke="#ff6600"
          strokeWidth="0.8"
          opacity={0.04 + 0.02 * Math.sin(frame * 0.05 + 2)}
        />

        {/* Vignette */}
        <radialGradient id="vigGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.7" />
        </radialGradient>
        <rect width="1100" height="700" fill="url(#vigGrad)" />

        {/* Scan line effect */}
        {Array.from({ length: 8 }, (_, i) => {
          const scanY = ((frame * 1.5 + i * 88) % 700);
          return (
            <line
              key={`scan${i}`}
              x1="0" y1={scanY} x2="1100" y2={scanY}
              stroke="#ff6600"
              strokeWidth="0.5"
              opacity="0.04"
            />
          );
        })}
      </svg>
    </div>
  );
};