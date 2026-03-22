import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { x: 0.22, y: 0.38, name: 'NYC' },
  { x: 0.12, y: 0.35, name: 'Chicago' },
  { x: 0.08, y: 0.30, name: 'LA' },
  { x: 0.48, y: 0.28, name: 'London' },
  { x: 0.52, y: 0.26, name: 'Paris' },
  { x: 0.55, y: 0.24, name: 'Berlin' },
  { x: 0.62, y: 0.30, name: 'Moscow' },
  { x: 0.72, y: 0.38, name: 'Mumbai' },
  { x: 0.78, y: 0.32, name: 'Beijing' },
  { x: 0.84, y: 0.35, name: 'Tokyo' },
  { x: 0.82, y: 0.52, name: 'Sydney' },
  { x: 0.50, y: 0.55, name: 'Lagos' },
  { x: 0.30, y: 0.60, name: 'SaoPaulo' },
  { x: 0.25, y: 0.48, name: 'Miami' },
  { x: 0.60, y: 0.22, name: 'Helsinki' },
  { x: 0.68, y: 0.25, name: 'Astana' },
  { x: 0.75, y: 0.45, name: 'Singapore' },
  { x: 0.45, y: 0.42, name: 'Cairo' },
];

const CONNECTIONS = [
  [0, 4], [0, 7], [0, 8], [0, 9], [0, 12],
  [1, 0], [1, 4], [2, 0], [2, 12],
  [4, 5], [4, 6], [4, 11], [4, 17],
  [5, 6], [6, 7], [6, 8],
  [7, 8], [7, 16], [8, 9], [8, 15],
  [9, 10], [10, 16], [11, 12], [11, 17],
  [12, 13], [13, 0], [14, 4], [14, 15],
  [15, 16], [16, 17], [17, 11], [3, 4],
  [3, 13], [7, 11], [9, 16],
];

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  cx: (i * 1731 + 500) % 3840,
  cy: (i * 1337 + 200) % 2160,
  r: ((i * 17) % 3) + 1,
  speed: ((i * 7) % 5) + 2,
  phase: (i * 43) % 100,
  opacity: ((i * 13) % 6) / 10 + 0.1,
}));

const GRID_LINES_H = Array.from({ length: 18 }, (_, i) => i);
const GRID_LINES_V = Array.from({ length: 32 }, (_, i) => i);

const STARS = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1931) % 3840,
  y: (i * 1237) % 2160,
  r: ((i * 11) % 3) + 0.5,
  twinkle: (i * 37) % 60,
}));

export const GlobalBusinessDawn: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const masterOpacity = fadeIn * fadeOut;

  const sunProgress = interpolate(frame, [0, durationInFrames * 0.7], [0, 1], { extrapolateRight: 'clamp' });
  const sunX = interpolate(sunProgress, [0, 1], [-200, width + 200]);
  const sunY = interpolate(sunProgress, [0, 0.5, 1], [height * 0.85, height * 0.25, height * 0.85]);

  const dawnLight = interpolate(frame, [0, durationInFrames * 0.4], [0, 1], { extrapolateRight: 'clamp' });
  const dayLight = interpolate(frame, [durationInFrames * 0.3, durationInFrames * 0.6], [0, 1], { extrapolateRight: 'clamp' });

  const skyTop = interpolate(dawnLight, [0, 0.5, 1], [5, 12, 22]);
  const skyMid = interpolate(dawnLight, [0, 0.5, 1], [8, 28, 45]);
  const skyR2 = interpolate(dawnLight, [0, 0.5, 1], [255, 180, 100]);
  const skyG2 = interpolate(dawnLight, [0, 0.5, 1], [120, 80, 60]);
  const skyB2 = interpolate(dawnLight, [0, 0.5, 1], [0, 20, 30]);

  const horizonGlow = interpolate(dawnLight, [0, 0.3, 0.7, 1], [0, 0.6, 1, 0.7]);

  const mapReveal = interpolate(frame, [30, durationInFrames * 0.5], [0, 1], { extrapolateRight: 'clamp' });

  const connectionPhase = interpolate(frame, [60, durationInFrames * 0.6], [0, 1], { extrapolateRight: 'clamp' });

  const pulseA = Math.sin(frame * 0.08) * 0.5 + 0.5;
  const pulseB = Math.sin(frame * 0.05 + 1.2) * 0.5 + 0.5;

  const starOpacity = interpolate(dawnLight, [0, 0.5, 1], [1, 0.3, 0]);

  const gridOpacity = interpolate(frame, [20, 80], [0, 0.15], { extrapolateRight: 'clamp' }) * masterOpacity;

  return (
    <div style={{ width, height, background: '#000', overflow: 'hidden', opacity: masterOpacity }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff7aa" stopOpacity="1" />
            <stop offset="30%" stopColor="#ffcc44" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#ff8800" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ff4400" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sunCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="50%" stopColor="#fffde0" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffcc44" stopOpacity="0.9" />
          </radialGradient>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`rgb(${skyTop},${skyTop},${skyMid})`} />
            <stop offset="50%" stopColor={`rgb(${Math.floor(skyR2 * 0.3)},${Math.floor(skyG2 * 0.2)},${Math.floor(skyB2 * 0.4)})`} />
            <stop offset="100%" stopColor={`rgb(${skyR2},${skyG2},${skyB2})`} />
          </linearGradient>
          <radialGradient id="horizonGlow" cx="50%" cy="100%" r="60%">
            <stop offset="0%" stopColor={`rgba(255,120,20,${horizonGlow * 0.7})`} />
            <stop offset="40%" stopColor={`rgba(255,60,0,${horizonGlow * 0.3})`} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00eeff" stopOpacity="1" />
            <stop offset="60%" stopColor="#0088ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0044ff" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="20" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="mapBlur">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
          <clipPath id="mapClip">
            <rect x="0" y="0" width={width} height={height} />
          </clipPath>
        </defs>

        {/* Sky background */}
        <rect x="0" y="0" width={width} height={height} fill="url(#skyGrad)" />
        <rect x="0" y="0" width={width} height={height} fill="url(#horizonGlow)" />

        {/* Stars */}
        {STARS.map((star, i) => {
          const twinkle = Math.sin(frame * 0.05 + star.twinkle) * 0.3 + 0.7;
          return (
            <circle
              key={i}
              cx={star.x}
              cy={star.y}
              r={star.r}
              fill="white"
              opacity={star.r * 0.3 * twinkle * starOpacity}
            />
          );
        })}

        {/* Sun glow halo */}
        <circle cx={sunX} cy={sunY} r={600} fill="url(#sunGlow)" opacity={0.4 * dawnLight} />
        <circle cx={sunX} cy={sunY} r={300} fill="url(#sunGlow)" opacity={0.5 * dawnLight} />

        {/* Sun rays */}
        {Array.from({ length: 16 }, (_, i) => {
          const angle = (i / 16) * Math.PI * 2 + frame * 0.003;
          const rayLen = 250 + (i % 3) * 80;
          const rayWidth = 3 + (i % 2) * 2;
          const x2 = sunX + Math.cos(angle) * rayLen;
          const y2 = sunY + Math.sin(angle) * rayLen;
          return (
            <line
              key={i}
              x1={sunX} y1={sunY}
              x2={x2} y2={y2}
              stroke="#ffdd88"
              strokeWidth={rayWidth}
              opacity={0.15 * dawnLight}
              strokeLinecap="round"
            />
          );
        })}

        {/* Sun core */}
        <circle cx={sunX} cy={sunY} r={90} fill="url(#sunCore)" opacity={dawnLight} filter="url(#softGlow)" />
        <circle cx={sunX} cy={sunY} r={60} fill="#fffde0" opacity={dawnLight} />

        {/* Grid overlay */}
        <g opacity={gridOpacity}>
          {GRID_LINES_H.map(i => (
            <line
              key={`h${i}`}
              x1={0} y1={(i / 17) * height}
              x2={width} y2={(i / 17) * height}
              stroke="#4488ff"
              strokeWidth={1}
            />
          ))}
          {GRID_LINES_V.map(i => (
            <line
              key={`v${i}`}
              x1={(i / 31) * width} y1={0}
              x2={(i / 31) * width} y2={height}
              stroke="#4488ff"
              strokeWidth={1}
            />
          ))}
        </g>

        {/* World map silhouette - simplified continents */}
        <g opacity={mapReveal} filter="url(#mapBlur)" clipPath="url(#mapClip)">
          {/* North America */}
          <path
            d={`M ${width*0.05} ${height*0.15} 
               L ${width*0.25} ${height*0.12} 
               L ${width*0.30} ${height*0.18} 
               L ${width*0.28} ${height*0.28}
               L ${width*0.22} ${height*0.35}
               L ${width*0.20} ${height*0.50}
               L ${width*0.15} ${height*0.55}
               L ${width*0.10} ${height*0.45}
               L ${width*0.05} ${height*0.40}
               L ${width*0.03} ${height*0.28}
               Z`}
            fill={`rgba(30,50,80,${0.7 * mapReveal})`}
            stroke={`rgba(40,120,200,${0.4 * mapReveal})`}
            strokeWidth={2}
          />
          {/* South America */}
          <path
            d={`M ${width*0.20} ${height*0.52}
               L ${width*0.28} ${height*0.50}
               L ${width*0.32} ${height*0.60}
               L ${width*0.30} ${height*0.75}
               L ${width*0.22} ${height*0.82}
               L ${width*0.18} ${height*0.78}
               L ${width*0.15} ${height*0.65}
               L ${width*0.16} ${height*0.55}
               Z`}
            fill={`rgba(30,50,80,${0.7 * mapReveal})`}
            stroke={`rgba(40,120,200,${0.4 * mapReveal})`}
            strokeWidth={2}
          />
          {/* Europe */}
          <path
            d={`M ${width*0.44} ${height*0.15}
               L ${width*0.58} ${height*0.14}
               L ${width*0.60} ${height*0.22}
               L ${width*0.56} ${height*0.30}
               L ${width*0.50} ${height*0.32}
               L ${width*0.44} ${height*0.28}
               L ${width*0.42} ${height*0.22}
               Z`}
            fill={`rgba(30,50,80,${0.7 * mapReveal})`}
            stroke={`rgba(40,120,200,${0.4 * mapReveal})`}
            strokeWidth={2}
          />
          {/* Africa */}
          <path
            d={`M ${width*0.44} ${height*0.35}
               L ${width*0.56} ${height*0.33}
               L ${width*0.60} ${height*0.42}
               L ${width*0.58} ${height*0.58}
               L ${width*0.52} ${height*0.68}
               L ${width*0.46} ${height*0.68}
               L ${width*0.40} ${height*0.58}
               L ${width*0.40} ${height*0.45}
               Z`}
            fill={`rgba(30,50,80,${0.7 * mapReveal})`}
            stroke={`rgba(40,120,200,${0.4 * mapReveal})`}
            strokeWidth={2}
          />
          {/* Asia */}
          <path
            d={`M ${width*0.58} ${height*0.12}
               L ${width*0.90} ${height*0.10}
               L ${width*0.95} ${height*0.20}
               L ${width*0.92} ${height*0.30}
               L ${width*0.85} ${height*0.38}
               L ${width*0.75} ${height*0.48}
               L ${width*0.68} ${height*0.44}
               L ${width*0.62} ${height*0.35}
               L ${width*0.58} ${height*0.25}
               Z`}
            fill={`rgba(30,50,80,${0.7 * mapReveal})`}
            stroke={`rgba(40,120,200,${0.4 * mapReveal})`}
            strokeWidth={2}
          />
          {/* Australia */}
          <path
            d={`M ${width*0.78} ${height*0.58}
               L ${width*0.90} ${height*0.55}
               L ${width*0.93} ${height*0.65}
               L ${width*0.88} ${height*0.72}
               L ${width*0.78} ${height*0.72}
               L ${width*0.73} ${height*0.65}
               Z`}
            fill={`rgba(30,50,80,${0.7 * mapReveal})`}
            stroke={`rgba(40,120,200,${0.4 * mapReveal})`}
            strokeWidth={2}
          />
        </g>

        {/* Connections between cities */}
        {CONNECTIONS.map(([a, b], i) => {
          const cityA = CITIES[a];
          const cityB = CITIES[b];
          const ax = cityA.x * width;
          const ay = cityA.y * height;
          const bx = cityB.x * width;
          const by = cityB.y * height;
          const midX = (ax + bx) / 2;
          const midY = Math.min(ay, by) - Math.abs(bx - ax) * 0.15;

          const connStart = 60 + i * 8;
          const connEnd = connStart + 60;
          const connOpacity = interpolate(frame, [connStart, connEnd], [0, 1], { extrapolateRight: 'clamp' }) * connectionPhase;

          const animProgress = (frame * 0.012 + i * 0.3) % 1;
          const particleX = ax + (bx - ax) * animProgress;
          const particleY = ay + (by - ay) * animProgress;

          return (
            <g key={i} opacity={connOpacity}>
              <path
                d={`M ${ax} ${ay} Q ${midX} ${midY} ${bx} ${by}`}
                stroke={`rgba(0,200,255,0.15)`}
                strokeWidth={1.5}
                fill="none"
              />
              <path
                d={`M ${ax} ${ay} Q ${midX} ${midY} ${bx} ${by}`}
                stroke={`rgba(100,220,255,0.4)`}
                strokeWidth={0.8}
                fill="none"
                strokeDasharray="20 40"
                strokeDashoffset={-frame * 3}
              />
              <circle
                cx={particleX}
                cy={particleY}
                r={5}
                fill="#00eeff"
                opacity={0.8}
                filter="url(#glow)"
              />
            </g>
          );
        })}

        {/* City nodes */}
        {CITIES.map((city, i) => {
          const cx = city.x * width;
          const cy = city.y * height;
          const cityStart = 40 + i * 15;
          const cityOpacity = interpolate(frame, [cityStart, cityStart + 40], [0, 1], { extrapolateRight: 'clamp' }) * mapReveal;
          const pulse = Math.sin(frame * 0.08 + i * 0.7) * 0.4 + 0.6;
          const ringScale = (frame * 0.05 + i * 0.4) % 1;
          const ringOpacity = (1 - ringScale) * 0.6;
          const ringRadius = 20 + ringScale * 60;

          return (
            <g key={i} opacity={cityOpacity}>
              <circle cx={cx} cy={cy} r={ringRadius} fill="none" stroke="#00eeff" strokeWidth={1.5} opacity={ringOpacity} />
              <circle cx={cx} cy={cy} r={16} fill="rgba(0,100,180,0.3)" filter="url(#glow)" />
              <circle cx={cx} cy={cy} r={10} fill="url(#cityGlow)" opacity={pulse} filter="url(#glow)" />
              <circle cx={cx} cy={cy} r={5} fill="#00eeff" opacity={pulse} />
              <circle cx={cx} cy={cy} r={3} fill="white" opacity={0.9} />
            </g>
          );
        })}

        {/* Floating particles */}
        {PARTICLES.map((p, i) => {
          const t = (frame + p.phase * 6) * p.speed * 0.01;
          const px = (p.cx + Math.sin(t * 0.7 + i) * 80) % width;
          const py = (p.cy + Math.cos(t * 0.5 + i * 0.3) * 50) % height;
          const fOpacity = (Math.sin(frame * 0.04 + p.phase) * 0.3 + 0.5) * p.opacity * dawnLight;
          return (
            <circle key={i} cx={px} cy={py} r={p.r} fill="#88ccff" opacity={fOpacity} />
          );
        })}

        {/* Atmospheric light sweep */}
        <rect
          x={0} y={0} width={width} height={height}
          fill={`url(#horizonGlow)`}
          opacity={0.3}
        />

        {/* Vignette */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,5,0.7)" />
        </radialGradient>
        <rect x="0" y="0" width={width} height={height} fill="url(#vignette)" />

        {/* Light bloom from sun at horizon */}
        <ellipse
          cx={sunX}
          cy={height * 0.78}
          rx={width * 0.5}
          ry={height * 0.25}
          fill={`rgba(255,100,20,${0.08 * horizonGlow})`}
        />

        {/* Data flow overlay */}
        <g opacity={interpolate(frame, [100, 200], [0, 0.6], { extrapolateRight: 'clamp' })}>
          {Array.from({ length: 12 }, (_, i) => {
            const x1 = (i * 350 + 100) % width;
            const speed = 2 + (i % 3);
            const xPos = (x1 + frame * speed) % width;
            const yPos = (i * 180 + 100) % height;
            return (
              <rect
                key={i}
                x={xPos}
                y={yPos}
                width={60 + (i % 5) * 20}
                height={1.5}
                fill={`rgba(0,200,255,${0.1 + (i % 4) * 0.05})`}
                rx={1}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};