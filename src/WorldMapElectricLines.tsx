import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Pre-computed city connections and routes (deterministic)
const ORIGIN = { x: 0.5, y: 0.42 }; // Center of map (roughly Atlantic)

const DESTINATION_CITIES = [
  { x: 0.12, y: 0.28, name: 'nyc' },
  { x: 0.22, y: 0.35, name: 'london' },
  { x: 0.28, y: 0.22, name: 'reykjavik' },
  { x: 0.35, y: 0.55, name: 'casablanca' },
  { x: 0.42, y: 0.30, name: 'berlin' },
  { x: 0.48, y: 0.48, name: 'cairo' },
  { x: 0.55, y: 0.38, name: 'moscow' },
  { x: 0.62, y: 0.52, name: 'dubai' },
  { x: 0.68, y: 0.35, name: 'delhi' },
  { x: 0.72, y: 0.55, name: 'mumbai' },
  { x: 0.78, y: 0.32, name: 'beijing' },
  { x: 0.82, y: 0.48, name: 'shanghai' },
  { x: 0.85, y: 0.62, name: 'bangkok' },
  { x: 0.88, y: 0.70, name: 'singapore' },
  { x: 0.92, y: 0.55, name: 'tokyo' },
  { x: 0.08, y: 0.38, name: 'boston' },
  { x: 0.14, y: 0.48, name: 'miami' },
  { x: 0.08, y: 0.22, name: 'montreal' },
  { x: 0.18, y: 0.68, name: 'bogota' },
  { x: 0.22, y: 0.78, name: 'lima' },
  { x: 0.28, y: 0.85, name: 'santiago' },
  { x: 0.38, y: 0.75, name: 'lagos' },
  { x: 0.52, y: 0.72, name: 'nairobi' },
  { x: 0.55, y: 0.85, name: 'johannesburg' },
  { x: 0.72, y: 0.75, name: 'perth' },
  { x: 0.88, y: 0.82, name: 'sydney' },
  { x: 0.05, y: 0.32, name: 'chicago' },
  { x: 0.03, y: 0.42, name: 'losangeles' },
  { x: 0.65, y: 0.20, name: 'novosibirsk' },
  { x: 0.75, y: 0.15, name: 'yakutsk' },
];

const WAVE_RINGS = Array.from({ length: 8 }, (_, i) => ({
  delay: i * 45,
  maxRadius: 0.35 + (i % 3) * 0.05,
}));

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  x: ((i * 1731 + 500) % 9400) / 10000 + 0.03,
  y: ((i * 1337 + 200) % 9200) / 10000 + 0.03,
  size: ((i * 47) % 3) + 1,
  twinkleSpeed: ((i * 13) % 60) + 30,
  twinkleOffset: (i * 23) % 100,
}));

const SECONDARY_NODES = Array.from({ length: 25 }, (_, i) => ({
  fromIdx: i % DESTINATION_CITIES.length,
  toIdx: (i * 3 + 7) % DESTINATION_CITIES.length,
  delay: 200 + (i * 11) % 150,
  width: ((i * 7) % 3) + 0.5,
}));

// Simplified world map continents as SVG paths (normalized 0-1 coords scaled to viewport)
const CONTINENT_PATHS = [
  // North America (simplified)
  "M 0.03,0.18 L 0.08,0.15 L 0.14,0.14 L 0.18,0.18 L 0.20,0.25 L 0.22,0.30 L 0.18,0.35 L 0.15,0.40 L 0.12,0.48 L 0.14,0.58 L 0.18,0.65 L 0.16,0.70 L 0.12,0.72 L 0.10,0.68 L 0.08,0.60 L 0.05,0.55 L 0.04,0.48 L 0.03,0.42 L 0.02,0.35 L 0.03,0.28 Z",
  // South America (simplified)
  "M 0.14,0.60 L 0.18,0.58 L 0.22,0.62 L 0.25,0.68 L 0.28,0.76 L 0.26,0.84 L 0.24,0.90 L 0.20,0.92 L 0.18,0.88 L 0.16,0.82 L 0.14,0.76 L 0.13,0.70 Z",
  // Europe (simplified)
  "M 0.30,0.15 L 0.36,0.13 L 0.42,0.15 L 0.46,0.18 L 0.48,0.22 L 0.46,0.28 L 0.44,0.32 L 0.40,0.35 L 0.36,0.38 L 0.32,0.36 L 0.28,0.32 L 0.28,0.26 L 0.28,0.20 Z",
  // Africa (simplified)
  "M 0.30,0.40 L 0.36,0.38 L 0.42,0.40 L 0.46,0.45 L 0.50,0.52 L 0.52,0.60 L 0.50,0.68 L 0.48,0.76 L 0.44,0.82 L 0.40,0.85 L 0.36,0.84 L 0.32,0.80 L 0.30,0.72 L 0.28,0.64 L 0.28,0.56 L 0.28,0.48 Z",
  // Asia (simplified)
  "M 0.46,0.15 L 0.55,0.12 L 0.65,0.10 L 0.75,0.12 L 0.85,0.15 L 0.94,0.20 L 0.96,0.28 L 0.94,0.35 L 0.88,0.42 L 0.82,0.48 L 0.78,0.55 L 0.72,0.58 L 0.65,0.55 L 0.60,0.50 L 0.56,0.45 L 0.52,0.38 L 0.48,0.32 L 0.46,0.25 Z",
  // Australia (simplified)
  "M 0.72,0.65 L 0.78,0.62 L 0.84,0.63 L 0.90,0.66 L 0.94,0.72 L 0.92,0.80 L 0.88,0.85 L 0.82,0.86 L 0.76,0.84 L 0.72,0.80 L 0.70,0.74 Z",
];

function cubicBezier(t: number, p0: {x:number,y:number}, p1: {x:number,y:number}, p2: {x:number,y:number}, p3: {x:number,y:number}) {
  const mt = 1 - t;
  return {
    x: mt*mt*mt*p0.x + 3*mt*mt*t*p1.x + 3*mt*t*t*p2.x + t*t*t*p3.x,
    y: mt*mt*mt*p0.y + 3*mt*mt*t*p1.y + 3*mt*t*t*p2.y + t*t*t*p3.y,
  };
}

function getControlPoints(from: {x:number,y:number}, to: {x:number,y:number}, curvature: number) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const perpX = -dy * curvature;
  const perpY = dx * curvature;
  return {
    cp1: { x: from.x + dx * 0.25 + perpX, y: from.y + dy * 0.25 + perpY },
    cp2: { x: midX + perpX * 0.8, y: midY + perpY * 0.8 },
  };
}

function buildArcPath(from: {x:number,y:number}, to: {x:number,y:number}, progress: number, W: number, H: number, curvature: number = 0.3): string {
  const { cp1, cp2 } = getControlPoints(from, to, curvature);
  const steps = Math.max(2, Math.floor(progress * 60));
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * progress;
    const pt = cubicBezier(t, from, cp1, cp2, to);
    const px = pt.x * W;
    const py = pt.y * H;
    d += i === 0 ? `M ${px},${py}` : ` L ${px},${py}`;
  }
  return d;
}

export const WorldMapElectricLines: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const ox = ORIGIN.x * width;
  const oy = ORIGIN.y * height;

  // Pulse origin glow
  const pulsePhase = (frame % 90) / 90;
  const pulseRadius = interpolate(pulsePhase, [0, 1], [8, 40]) * (width / 3840);
  const pulseOpacity = interpolate(pulsePhase, [0, 0.5, 1], [0.9, 0.4, 0]);

  // Animate arcs: each city gets a staggered reveal
  const arcLines = DESTINATION_CITIES.map((city, i) => {
    const startFrame = 30 + i * 8;
    const endFrame = startFrame + 60;
    const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const curvature = 0.3 + ((i * 17) % 20) / 100;
    const lineWidth = (1.5 + ((i * 7) % 3)) * (width / 3840);
    const glowWidth = lineWidth * 4;
    const pathD = buildArcPath(ORIGIN, city, progress, width, height, curvature);
    const dotOpacity = progress > 0.98 ? 1 : 0;
    const dotRadius = (3 + (i % 4)) * (width / 3840);

    // Traveling particle along arc
    const travelPhase = interpolate(frame, [endFrame, endFrame + 120], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const { cp1, cp2 } = getControlPoints(ORIGIN, city, curvature);
    const travelPt = cubicBezier(travelPhase, ORIGIN, cp1, cp2, city);

    return { pathD, dotOpacity, dotRadius, city, lineWidth, glowWidth, progress, travelPt, travelPhase };
  });

  // Secondary city-to-city connections
  const secondaryArcs = SECONDARY_NODES.map((node, i) => {
    const from = DESTINATION_CITIES[node.fromIdx];
    const to = DESTINATION_CITIES[node.toIdx];
    const startFrame = node.delay;
    const progress = interpolate(frame, [startFrame, startFrame + 80], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const pathD = buildArcPath(from, to, progress, width, height, 0.2);
    return { pathD, progress, lineWidth: node.width * (width / 3840) };
  });

  // Wave rings from origin
  const waveRings = WAVE_RINGS.map((ring) => {
    const ringProgress = interpolate(frame, [ring.delay, ring.delay + 120], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const radius = ringProgress * ring.maxRadius * width;
    const opacity = interpolate(ringProgress, [0, 0.3, 1], [0, 0.6, 0]);
    return { radius, opacity };
  });

  return (
    <div style={{ width, height, background: '#03060e', overflow: 'hidden', position: 'relative', opacity: globalOpacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="originGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00bfff" stopOpacity="1" />
            <stop offset="100%" stopColor="#00bfff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bgGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#001428" stopOpacity="1" />
            <stop offset="100%" stopColor="#03060e" stopOpacity="1" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={3 * width / 3840} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={8 * width / 3840} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={2 * width / 3840} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background gradient */}
        <rect width={width} height={height} fill="url(#bgGlow)" />

        {/* Grid lines for map feel */}
        {Array.from({ length: 19 }, (_, i) => (
          <line
            key={`hgrid-${i}`}
            x1={0} y1={(i + 1) * height / 20}
            x2={width} y2={(i + 1) * height / 20}
            stroke="#0a1a2a"
            strokeWidth={0.5 * width / 3840}
          />
        ))}
        {Array.from({ length: 39 }, (_, i) => (
          <line
            key={`vgrid-${i}`}
            x1={(i + 1) * width / 40} y1={0}
            x2={(i + 1) * width / 40} y2={height}
            stroke="#0a1a2a"
            strokeWidth={0.5 * width / 3840}
          />
        ))}

        {/* Continent fills */}
        {CONTINENT_PATHS.map((path, i) => {
          const scaledPath = path.replace(/(\d+\.\d+),(\d+\.\d+)/g, (_, px, py) =>
            `${parseFloat(px) * width},${parseFloat(py) * height}`
          );
          return (
            <path
              key={`continent-${i}`}
              d={scaledPath}
              fill="#0d1f2d"
              stroke="#1a3a52"
              strokeWidth={1.5 * width / 3840}
              opacity={0.9}
            />
          );
        })}

        {/* Background particles/stars */}
        {PARTICLES.map((p, i) => {
          const twinkle = Math.sin((frame + p.twinkleOffset) * (Math.PI * 2) / p.twinkleSpeed) * 0.5 + 0.5;
          return (
            <circle
              key={`particle-${i}`}
              cx={p.x * width}
              cy={p.y * height}
              r={p.size * 0.4 * width / 3840}
              fill="#1e4060"
              opacity={0.2 + twinkle * 0.3}
            />
          );
        })}

        {/* Wave rings from origin */}
        {waveRings.map((ring, i) => (
          <circle
            key={`wave-${i}`}
            cx={ox}
            cy={oy}
            r={ring.radius}
            fill="none"
            stroke="#00bfff"
            strokeWidth={1.5 * width / 3840}
            opacity={ring.opacity}
          />
        ))}

        {/* Secondary city connections (dimmer) */}
        {secondaryArcs.map((arc, i) => arc.progress > 0.02 && (
          <g key={`sec-${i}`}>
            <path
              d={arc.pathD}
              fill="none"
              stroke="#004466"
              strokeWidth={arc.lineWidth * 2}
              opacity={0.25}
              strokeLinecap="round"
            />
            <path
              d={arc.pathD}
              fill="none"
              stroke="#0066aa"
              strokeWidth={arc.lineWidth}
              opacity={0.4}
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Primary arc lines from origin to cities */}
        {arcLines.map((arc, i) => arc.progress > 0.02 && (
          <g key={`arc-${i}`} filter="url(#glow)">
            {/* Glow layer */}
            <path
              d={arc.pathD}
              fill="none"
              stroke="#00bfff"
              strokeWidth={arc.glowWidth}
              opacity={0.15}
              strokeLinecap="round"
            />
            {/* Mid glow */}
            <path
              d={arc.pathD}
              fill="none"
              stroke="#00d4ff"
              strokeWidth={arc.lineWidth * 2}
              opacity={0.35}
              strokeLinecap="round"
            />
            {/* Core line */}
            <path
              d={arc.pathD}
              fill="none"
              stroke="#00f0ff"
              strokeWidth={arc.lineWidth}
              opacity={0.9}
              strokeLinecap="round"
            />
            {/* Traveling particle */}
            {arc.travelPhase > 0 && arc.travelPhase < 1 && (
              <g filter="url(#strongGlow)">
                <circle
                  cx={arc.travelPt.x * width}
                  cy={arc.travelPt.y * height}
                  r={arc.dotRadius * 1.5}
                  fill="#ffffff"
                  opacity={0.8}
                />
                <circle
                  cx={arc.travelPt.x * width}
                  cy={arc.travelPt.y * height}
                  r={arc.dotRadius * 3}
                  fill="#00bfff"
                  opacity={0.4}
                />
              </g>
            )}
            {/* Destination dot */}
            {arc.dotOpacity > 0 && (
              <g filter="url(#softGlow)">
                <circle
                  cx={arc.city.x * width}
                  cy={arc.city.y * height}
                  r={arc.dotRadius * 2}
                  fill="#003355"
                  opacity={0.8}
                />
                <circle
                  cx={arc.city.x * width}
                  cy={arc.city.y * height}
                  r={arc.dotRadius}
                  fill="#00f0ff"
                  opacity={arc.dotOpacity}
                />
                {/* Pulsing ring around destination */}
                <circle
                  cx={arc.city.x * width}
                  cy={arc.city.y * height}
                  r={arc.dotRadius * (2 + (frame % 60) / 30)}
                  fill="none"
                  stroke="#00bfff"
                  strokeWidth={0.8 * width / 3840}
                  opacity={interpolate((frame % 60) / 60, [0, 0.5, 1], [0.8, 0.3, 0])}
                />
              </g>
            )}
          </g>
        ))}

        {/* Origin city - central hub */}
        <g filter="url(#strongGlow)">
          {/* Outer pulse */}
          <circle cx={ox} cy={oy} r={pulseRadius} fill="#00bfff" opacity={pulseOpacity * 0.3} />
          {/* Large glow */}
          <circle cx={ox} cy={oy} r={18 * width / 3840} fill="#00bfff" opacity={0.15} />
          {/* Mid glow */}
          <circle cx={ox} cy={oy} r={10 * width / 3840} fill="#00d4ff" opacity={0.5} />
          {/* Core */}
          <circle cx={ox} cy={oy} r={5 * width / 3840} fill="#ffffff" opacity={0.95} />
          {/* Cross hairs */}
          <line
            x1={ox - 20 * width / 3840} y1={oy}
            x2={ox + 20 * width / 3840} y2={oy}
            stroke="#00f0ff" strokeWidth={1 * width / 3840} opacity={0.6}
          />
          <line
            x1={ox} y1={oy - 20 * width / 3840}
            x2={ox} y2={oy + 20 * width / 3840}
            stroke="#00f0ff" strokeWidth={1 * width / 3840} opacity={0.6}
          />
        </g>

        {/* Vignette overlay */}
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="60%" stopColor="transparent" stopOpacity="0" />
            <stop offset="100%" stopColor="#03060e" stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#vignette)" />
      </svg>
    </div>
  );
};