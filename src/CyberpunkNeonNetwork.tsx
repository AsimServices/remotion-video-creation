import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NODE_COUNT = 80;
const NODES = Array.from({ length: NODE_COUNT }, (_, i) => ({
  x: (i * 1731 + 400) % 3600 + 120,
  y: (i * 1337 + 200) % 1900 + 130,
  size: ((i * 7) % 8) + 3,
  pulseOffset: (i * 137) % 60,
  glitchOffset: (i * 53) % 100,
}));

const CONNECTION_COUNT = 120;
const CONNECTIONS = Array.from({ length: CONNECTION_COUNT }, (_, i) => {
  const a = (i * 17) % NODE_COUNT;
  const b = (i * 31 + 13) % NODE_COUNT;
  return {
    a,
    b,
    flickerOffset: (i * 73) % 90,
    flickerSpeed: ((i * 11) % 5) + 1,
    thickness: ((i * 3) % 3) + 0.5,
    dash: (i % 4 === 0) ? 20 : (i % 3 === 0) ? 10 : 0,
  };
});

const CONTINENTS = [
  // North America
  "M 520 420 C 560 380 640 370 700 400 C 760 430 780 480 760 530 C 740 580 700 610 660 640 C 620 670 580 650 550 620 C 520 590 500 550 490 510 C 480 470 490 450 520 420 Z",
  // South America
  "M 620 680 C 650 660 690 665 710 690 C 730 715 740 760 730 810 C 720 860 700 890 670 900 C 640 910 620 885 610 850 C 600 815 600 770 605 730 C 610 690 600 695 620 680 Z",
  // Europe
  "M 1050 340 C 1090 320 1140 325 1160 355 C 1180 385 1170 420 1150 440 C 1130 460 1090 465 1065 450 C 1040 435 1030 405 1035 375 C 1040 345 1030 355 1050 340 Z",
  // Africa
  "M 1060 480 C 1100 460 1150 465 1175 495 C 1200 525 1205 580 1195 640 C 1185 700 1160 740 1125 755 C 1090 770 1055 750 1035 715 C 1015 680 1010 620 1020 565 C 1030 510 1030 495 1060 480 Z",
  // Asia
  "M 1250 300 C 1350 270 1520 265 1650 300 C 1780 335 1840 400 1820 470 C 1800 540 1720 580 1620 590 C 1520 600 1400 565 1320 520 C 1240 475 1200 410 1210 360 C 1220 310 1210 320 1250 300 Z",
  // Australia
  "M 1680 680 C 1730 660 1800 665 1840 700 C 1880 735 1890 790 1870 840 C 1850 890 1800 915 1750 910 C 1700 905 1660 870 1645 825 C 1630 780 1640 730 1655 700 C 1670 670 1660 695 1680 680 Z",
];

const GRID_LINES_H = Array.from({ length: 20 }, (_, i) => i);
const GRID_LINES_V = Array.from({ length: 36 }, (_, i) => i);

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  connIndex: (i * 7) % CONNECTION_COUNT,
  speed: ((i * 13) % 80) + 20,
  offset: (i * 37) % 100,
  size: ((i * 5) % 4) + 2,
}));

const GLITCH_BARS = Array.from({ length: 8 }, (_, i) => ({
  y: (i * 277) % 2000 + 80,
  height: ((i * 43) % 30) + 5,
  offset: (i * 61) % 70,
  duration: ((i * 17) % 10) + 5,
  xShift: ((i * 29) % 60) - 30,
}));

export const CyberpunkNeonNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scaleX = width / 3840;
  const scaleY = height / 2160;

  // Scanline offset
  const scanline = (frame * 3) % height;

  return (
    <div
      style={{
        width,
        height,
        background: '#020a02',
        overflow: 'hidden',
        position: 'relative',
        opacity: globalOpacity,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 3840 2160`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Dark background */}
        <rect width={3840} height={2160} fill="#020a02" />

        {/* Radial glow background */}
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#00ff4133" />
            <stop offset="60%" stopColor="#00ff0808" />
            <stop offset="100%" stopColor="#00000000" />
          </radialGradient>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00ff41" stopOpacity="1" />
            <stop offset="100%" stopColor="#00ff41" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="12" result="coloredBlur" />
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
          <clipPath id="screenClip">
            <rect width={3840} height={2160} />
          </clipPath>
        </defs>

        <rect width={3840} height={2160} fill="url(#centerGlow)" />

        {/* World map grid */}
        {GRID_LINES_H.map((i) => {
          const y = (i / 19) * 2160;
          const flicker = Math.sin(frame * 0.05 + i * 0.7) * 0.3 + 0.7;
          return (
            <line
              key={`h${i}`}
              x1={0} y1={y} x2={3840} y2={y}
              stroke="#00ff41"
              strokeWidth={0.4}
              strokeOpacity={0.08 * flicker}
            />
          );
        })}
        {GRID_LINES_V.map((i) => {
          const x = (i / 35) * 3840;
          const flicker = Math.sin(frame * 0.04 + i * 0.5) * 0.3 + 0.7;
          return (
            <line
              key={`v${i}`}
              x1={x} y1={0} x2={x} y2={2160}
              stroke="#00ff41"
              strokeWidth={0.4}
              strokeOpacity={0.08 * flicker}
            />
          );
        })}

        {/* Continents */}
        {CONTINENTS.map((d, i) => {
          const pulse = Math.sin(frame * 0.03 + i * 1.2) * 0.15 + 0.55;
          return (
            <g key={`cont${i}`}>
              <path
                d={d}
                fill="none"
                stroke="#00ff41"
                strokeWidth={1.5}
                strokeOpacity={pulse}
                filter="url(#softGlow)"
                transform={`scale(${3840 / 1920}, ${2160 / 1080})`}
              />
              <path
                d={d}
                fill="#00ff41"
                fillOpacity={0.04 + pulse * 0.06}
                transform={`scale(${3840 / 1920}, ${2160 / 1080})`}
              />
            </g>
          );
        })}

        {/* Connections */}
        {CONNECTIONS.map((conn, i) => {
          const nodeA = NODES[conn.a];
          const nodeB = NODES[conn.b];
          const flickerVal = Math.sin(frame * conn.flickerSpeed * 0.1 + conn.flickerOffset) * 0.5 + 0.5;
          const glitchActive = ((frame + conn.flickerOffset) % 45) < 3;
          const opacity = glitchActive ? flickerVal * 0.05 : flickerVal * 0.55;
          const glitchShift = glitchActive ? ((i * 7) % 20) - 10 : 0;

          const x1 = nodeA.x * 2;
          const y1 = nodeA.y * 2;
          const x2 = nodeB.x * 2;
          const y2 = nodeB.y * 2;

          return (
            <line
              key={`conn${i}`}
              x1={x1 + glitchShift}
              y1={y1}
              x2={x2 + glitchShift}
              y2={y2}
              stroke="#00ff41"
              strokeWidth={conn.thickness}
              strokeOpacity={opacity}
              strokeDasharray={conn.dash > 0 ? `${conn.dash} ${conn.dash}` : undefined}
              filter="url(#glow)"
            />
          );
        })}

        {/* Animated particles along connections */}
        {PARTICLES.map((particle, i) => {
          const conn = CONNECTIONS[particle.connIndex];
          const nodeA = NODES[conn.a];
          const nodeB = NODES[conn.b];
          const x1 = nodeA.x * 2;
          const y1 = nodeA.y * 2;
          const x2 = nodeB.x * 2;
          const y2 = nodeB.y * 2;

          const totalFrames = particle.speed;
          const t = ((frame + particle.offset * totalFrames / 100) % totalFrames) / totalFrames;
          const px = x1 + (x2 - x1) * t;
          const py = y1 + (y2 - y1) * t;
          const flicker = Math.sin(frame * 0.15 + i * 0.9) * 0.4 + 0.6;

          return (
            <circle
              key={`particle${i}`}
              cx={px}
              cy={py}
              r={particle.size}
              fill="#00ff41"
              fillOpacity={flicker * 0.9}
              filter="url(#strongGlow)"
            />
          );
        })}

        {/* Network nodes */}
        {NODES.map((node, i) => {
          const pulse = Math.sin(frame * 0.08 + node.pulseOffset) * 0.5 + 0.5;
          const glitch = ((frame + node.glitchOffset) % 60) < 2;
          const nx = node.x * 2;
          const ny = node.y * 2;
          const glitchX = glitch ? ((i * 13) % 30) - 15 : 0;
          const outerR = node.size * 2 + pulse * node.size;
          const innerR = node.size;

          return (
            <g key={`node${i}`} transform={`translate(${glitchX}, 0)`}>
              {/* Outer ring */}
              <circle
                cx={nx}
                cy={ny}
                r={outerR}
                fill="none"
                stroke="#00ff41"
                strokeWidth={0.8}
                strokeOpacity={0.3 * pulse}
                filter="url(#glow)"
              />
              {/* Middle ring */}
              <circle
                cx={nx}
                cy={ny}
                r={innerR * 1.5}
                fill="none"
                stroke="#00ff41"
                strokeWidth={1}
                strokeOpacity={0.6 * pulse}
                filter="url(#glow)"
              />
              {/* Core */}
              <circle
                cx={nx}
                cy={ny}
                r={innerR}
                fill="#00ff41"
                fillOpacity={0.8 + pulse * 0.2}
                filter="url(#strongGlow)"
              />
            </g>
          );
        })}

        {/* Glitch bars */}
        {GLITCH_BARS.map((bar, i) => {
          const isActive = ((frame + bar.offset) % (bar.duration + 40)) < bar.duration;
          if (!isActive) return null;
          const glitchOpacity = Math.sin(frame * 0.4 + i) * 0.3 + 0.4;
          return (
            <rect
              key={`glitch${i}`}
              x={bar.xShift}
              y={bar.y}
              width={3840}
              height={bar.height}
              fill="#00ff41"
              fillOpacity={glitchOpacity * 0.12}
              clipPath="url(#screenClip)"
            />
          );
        })}

        {/* Horizontal scan line */}
        <rect
          x={0}
          y={scanline}
          width={3840}
          height={3}
          fill="#00ff41"
          fillOpacity={0.06}
        />

        {/* Corner decorations */}
        {[
          { x: 50, y: 50, dir: 1 },
          { x: 3790, y: 50, dir: -1 },
          { x: 50, y: 2110, dir: 1 },
          { x: 3790, y: 2110, dir: -1 },
        ].map((corner, i) => {
          const pulse = Math.sin(frame * 0.06 + i * 1.5) * 0.3 + 0.7;
          return (
            <g key={`corner${i}`} filter="url(#glow)">
              <line
                x1={corner.x} y1={corner.y}
                x2={corner.x + corner.dir * 120} y2={corner.y}
                stroke="#00ff41" strokeWidth={3} strokeOpacity={pulse}
              />
              <line
                x1={corner.x} y1={corner.y}
                x2={corner.x} y2={corner.y + (i < 2 ? 1 : -1) * 120}
                stroke="#00ff41" strokeWidth={3} strokeOpacity={pulse}
              />
              <circle
                cx={corner.x} cy={corner.y} r={6}
                fill="#00ff41" fillOpacity={pulse}
              />
            </g>
          );
        })}

        {/* Central focal glow ring */}
        {[120, 240, 360, 500].map((r, i) => {
          const pulse = Math.sin(frame * 0.04 + i * 0.8) * 0.3 + 0.4;
          const rotate = frame * (i % 2 === 0 ? 0.3 : -0.2) + i * 45;
          return (
            <ellipse
              key={`ring${i}`}
              cx={1920}
              cy={1080}
              rx={r * 2}
              ry={r}
              fill="none"
              stroke="#00ff41"
              strokeWidth={1}
              strokeOpacity={pulse * 0.3}
              strokeDasharray="30 20"
              transform={`rotate(${rotate}, 1920, 1080)`}
              filter="url(#softGlow)"
            />
          );
        })}

        {/* Data streams - diagonal lines */}
        {Array.from({ length: 12 }, (_, i) => {
          const baseX = (i * 320) % 3840;
          const speed = ((i * 7) % 5) + 2;
          const yOffset = ((frame * speed + i * 200) % 3000) - 500;
          const opacity = Math.sin(frame * 0.05 + i) * 0.3 + 0.4;
          return (
            <line
              key={`stream${i}`}
              x1={baseX}
              y1={yOffset}
              x2={baseX + 150}
              y2={yOffset + 300}
              stroke="#00ff41"
              strokeWidth={1.5}
              strokeOpacity={opacity * 0.4}
              filter="url(#glow)"
            />
          );
        })}

        {/* Vignette */}
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#00000000" />
            <stop offset="100%" stopColor="#000000cc" />
          </radialGradient>
        </defs>
        <rect width={3840} height={2160} fill="url(#vignette)" />
      </svg>
    </div>
  );
};