import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Pre-computed network nodes per continent
const AFRICA_NODES = Array.from({ length: 18 }, (_, i) => ({
  cx: 50 + ((i * 1731 + 13) % 80),
  cy: 45 + ((i * 1337 + 7) % 90),
  r: 2 + (i % 4),
}));

const EUROPE_NODES = Array.from({ length: 15 }, (_, i) => ({
  cx: 60 + ((i * 1193 + 5) % 55),
  cy: 10 + ((i * 997 + 11) % 35),
  r: 2 + (i % 3),
}));

const ASIA_NODES = Array.from({ length: 25 }, (_, i) => ({
  cx: 110 + ((i * 1571 + 3) % 120),
  cy: 10 + ((i * 1123 + 9) % 75),
  r: 2 + (i % 4),
}));

const NAMERICA_NODES = Array.from({ length: 16 }, (_, i) => ({
  cx: -120 + ((i * 1433 + 17) % 75),
  cy: 10 + ((i * 1277 + 5) % 55),
  r: 2 + (i % 4),
}));

const SAMERICA_NODES = Array.from({ length: 12 }, (_, i) => ({
  cx: -90 + ((i * 1613 + 11) % 50),
  cy: 45 + ((i * 1087 + 13) % 65),
  r: 2 + (i % 3),
}));

const AUSTRALIA_NODES = Array.from({ length: 10 }, (_, i) => ({
  cx: 130 + ((i * 1873 + 7) % 45),
  cy: 55 + ((i * 1049 + 3) % 40),
  r: 2 + (i % 3),
}));

// Edges: pairs of node indices for each continent
const AFRICA_EDGES = Array.from({ length: 22 }, (_, i) => ({
  a: i % AFRICA_NODES.length,
  b: (i * 3 + 5) % AFRICA_NODES.length,
}));

const EUROPE_EDGES = Array.from({ length: 18 }, (_, i) => ({
  a: i % EUROPE_NODES.length,
  b: (i * 3 + 4) % EUROPE_NODES.length,
}));

const ASIA_EDGES = Array.from({ length: 32 }, (_, i) => ({
  a: i % ASIA_NODES.length,
  b: (i * 4 + 7) % ASIA_NODES.length,
}));

const NAMERICA_EDGES = Array.from({ length: 18 }, (_, i) => ({
  a: i % NAMERICA_NODES.length,
  b: (i * 3 + 5) % NAMERICA_NODES.length,
}));

const SAMERICA_EDGES = Array.from({ length: 14 }, (_, i) => ({
  a: i % SAMERICA_NODES.length,
  b: (i * 3 + 4) % SAMERICA_NODES.length,
}));

const AUSTRALIA_EDGES = Array.from({ length: 10 }, (_, i) => ({
  a: i % AUSTRALIA_NODES.length,
  b: (i * 3 + 3) % AUSTRALIA_NODES.length,
}));

// Stars
const STARS = Array.from({ length: 280 }, (_, i) => ({
  x: (i * 1731 + 13) % 3840,
  y: (i * 1337 + 7) % 2160,
  r: 1 + (i % 3),
  opacity: 0.2 + ((i * 97) % 60) / 100,
}));

// Orbit particles
const ORBIT_PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  angle: (i / 40) * 360,
  orbitRx: 820 + (i % 5) * 18,
  orbitRy: 820 + (i % 5) * 18,
  size: 2 + (i % 4),
  speed: 0.3 + (i % 5) * 0.07,
  hue: 160 + (i * 19) % 120,
}));

type ContinentProps = {
  nodes: { cx: number; cy: number; r: number }[];
  edges: { a: number; b: number }[];
  color: string;
  glowColor: string;
  progress: number;
  offsetX: number;
  offsetY: number;
  scaleX?: number;
  scaleY?: number;
};

const ContinentNetwork: React.FC<ContinentProps> = ({
  nodes,
  edges,
  color,
  glowColor,
  progress,
  offsetX,
  offsetY,
  scaleX = 1,
  scaleY = 1,
}) => {
  const visibleEdges = Math.floor(progress * edges.length);
  const visibleNodes = Math.floor(progress * nodes.length);

  return (
    <g transform={`translate(${offsetX}, ${offsetY}) scale(${scaleX}, ${scaleY})`}>
      <defs>
        <filter id={`glow-${color.replace('#', '')}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {edges.slice(0, visibleEdges).map((e, i) => {
        const na = nodes[e.a];
        const nb = nodes[e.b];
        const edgeOpacity = interpolate(
          visibleEdges - i,
          [0, 3],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        return (
          <line
            key={i}
            x1={na.cx}
            y1={na.cy}
            x2={nb.cx}
            y2={nb.cy}
            stroke={color}
            strokeWidth="1.2"
            strokeOpacity={edgeOpacity * 0.75}
            style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
          />
        );
      })}
      {nodes.slice(0, visibleNodes).map((n, i) => {
        const nodeOpacity = interpolate(
          visibleNodes - i,
          [0, 3],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        return (
          <circle
            key={i}
            cx={n.cx}
            cy={n.cy}
            r={n.r * 2.5}
            fill={color}
            fillOpacity={nodeOpacity * 0.9}
            style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
          />
        );
      })}
    </g>
  );
};

export const DarkGlobeNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2;
  const globeR = Math.min(width, height) * 0.38;

  // Global fade in/out
  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Globe brightness
  const globeBrightness = interpolate(frame, [0, durationInFrames * 0.8], [0.05, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Continent sequences: each starts at different times
  const totalActive = durationInFrames - 100;
  const getProgress = (startFrac: number, dur: number) => {
    const start = startFrac * totalActive + 50;
    return interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  };

  const africaProgress = getProgress(0.0, 80);
  const europeProgress = getProgress(0.1, 70);
  const asiaProgress = getProgress(0.2, 90);
  const nameProgress = getProgress(0.35, 80);
  const sameProgress = getProgress(0.5, 70);
  const australiaProgress = getProgress(0.62, 60);

  // Globe rotation
  const rotation = interpolate(frame, [0, durationInFrames], [0, 20], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Pulsing glow on globe edge
  const glowPulse = interpolate(
    Math.sin((frame / durationInFrames) * Math.PI * 8),
    [-1, 1],
    [0.3, 0.8]
  );

  // Orbit particles
  const orbitOpacity = interpolate(frame, [80, 160], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width,
        height,
        background: '#020408',
        position: 'relative',
        overflow: 'hidden',
        opacity: globalOpacity,
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {/* Globe radial gradient */}
          <radialGradient id="globeGrad" cx="40%" cy="38%" r="60%">
            <stop offset="0%" stopColor={`hsl(210, 60%, ${8 + globeBrightness * 22}%)`} />
            <stop offset="50%" stopColor={`hsl(220, 70%, ${3 + globeBrightness * 14}%)`} />
            <stop offset="100%" stopColor={`hsl(230, 80%, ${1 + globeBrightness * 5}%)`} />
          </radialGradient>

          {/* Globe atmosphere glow */}
          <radialGradient id="atmGrad" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="transparent" />
            <stop offset="90%" stopColor={`hsla(190, 100%, 60%, ${glowPulse * globeBrightness * 0.4})`} />
            <stop offset="100%" stopColor={`hsla(200, 100%, 70%, ${glowPulse * globeBrightness * 0.15})`} />
          </radialGradient>

          {/* Specular highlight */}
          <radialGradient id="specGrad" cx="35%" cy="28%" r="35%">
            <stop offset="0%" stopColor={`rgba(180,220,255,${0.05 + globeBrightness * 0.12})`} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Grid line clipping */}
          <clipPath id="globeClip">
            <circle cx={cx} cy={cy} r={globeR} />
          </clipPath>

          {/* Outer glow filter */}
          <filter id="outerGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="28" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Stars */}
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" fillOpacity={s.opacity * 0.6} />
        ))}

        {/* Globe atmosphere outer halo */}
        <circle
          cx={cx}
          cy={cy}
          r={globeR + 38}
          fill={`hsla(190, 100%, 55%, ${glowPulse * globeBrightness * 0.12})`}
          style={{ filter: 'blur(24px)' }}
        />
        <circle
          cx={cx}
          cy={cy}
          r={globeR + 18}
          fill={`hsla(200, 100%, 60%, ${glowPulse * globeBrightness * 0.18})`}
          style={{ filter: 'blur(12px)' }}
        />

        {/* Globe base */}
        <circle cx={cx} cy={cy} r={globeR} fill="url(#globeGrad)" />

        {/* Latitude/longitude grid lines */}
        <g clipPath="url(#globeClip)" opacity={0.12 + globeBrightness * 0.2}>
          {/* Latitude lines */}
          {Array.from({ length: 9 }, (_, i) => {
            const lat = -80 + i * 20;
            const rad = lat * (Math.PI / 180);
            const ry = globeR * Math.cos(rad);
            const yPos = cy + globeR * Math.sin(rad);
            return (
              <ellipse
                key={`lat${i}`}
                cx={cx}
                cy={yPos}
                rx={ry}
                ry={ry * 0.25}
                fill="none"
                stroke="rgba(100,180,255,0.5)"
                strokeWidth="0.7"
              />
            );
          })}
          {/* Longitude lines */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI + (rotation * Math.PI) / 180;
            const x1 = cx + globeR * Math.cos(angle);
            const x2 = cx - globeR * Math.cos(angle);
            return (
              <ellipse
                key={`lon${i}`}
                cx={cx}
                cy={cy}
                rx={Math.abs(globeR * Math.cos(angle))}
                ry={globeR}
                fill="none"
                stroke="rgba(100,180,255,0.5)"
                strokeWidth="0.7"
              />
            );
          })}
        </g>

        {/* Continent network overlays */}
        <g clipPath="url(#globeClip)">
          {/* Africa - center of globe */}
          <ContinentNetwork
            nodes={AFRICA_NODES}
            edges={AFRICA_EDGES}
            color="#00ffcc"
            glowColor="#00ffcc"
            progress={africaProgress}
            offsetX={cx - 30}
            offsetY={cy - 10}
            scaleX={9}
            scaleY={9}
          />

          {/* Europe - upper center */}
          <ContinentNetwork
            nodes={EUROPE_NODES}
            edges={EUROPE_EDGES}
            color="#00cfff"
            glowColor="#00cfff"
            progress={europeProgress}
            offsetX={cx - 50}
            offsetY={cy - 280}
            scaleX={9}
            scaleY={9}
          />

          {/* Asia - upper right */}
          <ContinentNetwork
            nodes={ASIA_NODES}
            edges={ASIA_EDGES}
            color="#a78bfa"
            glowColor="#a78bfa"
            progress={asiaProgress}
            offsetX={cx + 60}
            offsetY={cy - 290}
            scaleX={8.5}
            scaleY={8.5}
          />

          {/* North America - upper left */}
          <ContinentNetwork
            nodes={NAMERICA_NODES}
            edges={NAMERICA_EDGES}
            color="#38bdf8"
            glowColor="#38bdf8"
            progress={nameProgress}
            offsetX={cx + 100}
            offsetY={cy - 260}
            scaleX={8.5}
            scaleY={8.5}
          />

          {/* South America - lower left */}
          <ContinentNetwork
            nodes={SAMERICA_NODES}
            edges={SAMERICA_EDGES}
            color="#34d399"
            glowColor="#34d399"
            progress={sameProgress}
            offsetX={cx + 60}
            offsetY={cy - 80}
            scaleX={8.5}
            scaleY={8.5}
          />

          {/* Australia - lower right */}
          <ContinentNetwork
            nodes={AUSTRALIA_NODES}
            edges={AUSTRALIA_EDGES}
            color="#f472b6"
            glowColor="#f472b6"
            progress={australiaProgress}
            offsetX={cx + 150}
            offsetY={cy + 60}
            scaleX={8}
            scaleY={8}
          />
        </g>

        {/* Specular highlight */}
        <circle cx={cx} cy={cy} r={globeR} fill="url(#specGrad)" />

        {/* Atmosphere rim */}
        <circle
          cx={cx}
          cy={cy}
          r={globeR}
          fill="none"
          stroke={`hsla(190, 100%, 65%, ${0.3 + globeBrightness * 0.5})`}
          strokeWidth="3"
          style={{ filter: 'blur(2px)' }}
        />
        <circle
          cx={cx}
          cy={cy}
          r={globeR}
          fill="url(#atmGrad)"
        />

        {/* Orbiting particles */}
        <g opacity={orbitOpacity}>
          {ORBIT_PARTICLES.map((p, i) => {
            const angle = ((p.angle + frame * p.speed) % 360) * (Math.PI / 180);
            const px = cx + p.orbitRx * Math.cos(angle);
            const py = cy + (p.orbitRy * 0.32) * Math.sin(angle);
            const behindGlobe = Math.sin(angle) < 0;
            return (
              <circle
                key={i}
                cx={px}
                cy={py}
                r={p.size}
                fill={`hsl(${p.hue}, 100%, 65%)`}
                fillOpacity={behindGlobe ? 0.15 : 0.85}
                style={{
                  filter: behindGlobe
                    ? 'none'
                    : `drop-shadow(0 0 ${p.size * 2}px hsl(${p.hue}, 100%, 65%))`,
                }}
              />
            );
          })}
        </g>

        {/* Cross-continent connection arcs */}
        {africaProgress > 0.5 && europeProgress > 0.5 && (
          <line
            x1={cx + 20}
            y1={cy + 50}
            x2={cx + 20}
            y2={cy - 200}
            stroke="rgba(0,255,180,0.3)"
            strokeWidth="1"
            strokeDasharray="8,6"
            clipPath="url(#globeClip)"
            style={{ filter: 'drop-shadow(0 0 4px #00ffcc)' }}
          />
        )}
        {asiaProgress > 0.5 && europeProgress > 0.5 && (
          <line
            x1={cx + 160}
            y1={cy - 150}
            x2={cx + 40}
            y2={cy - 200}
            stroke="rgba(167,139,250,0.3)"
            strokeWidth="1"
            strokeDasharray="8,6"
            clipPath="url(#globeClip)"
            style={{ filter: 'drop-shadow(0 0 4px #a78bfa)' }}
          />
        )}

        {/* Central glow point */}
        <circle
          cx={cx}
          cy={cy}
          r={12}
          fill={`rgba(150,220,255,${globeBrightness * 0.6})`}
          style={{ filter: 'blur(8px)' }}
        />
      </svg>
    </div>
  );
};