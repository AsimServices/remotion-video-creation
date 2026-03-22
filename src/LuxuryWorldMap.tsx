import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { name: 'New York', x: 0.218, y: 0.38 },
  { name: 'London', x: 0.468, y: 0.28 },
  { name: 'Paris', x: 0.482, y: 0.30 },
  { name: 'Dubai', x: 0.598, y: 0.42 },
  { name: 'Tokyo', x: 0.782, y: 0.34 },
  { name: 'Singapore', x: 0.726, y: 0.52 },
  { name: 'Sydney', x: 0.802, y: 0.68 },
  { name: 'Hong Kong', x: 0.758, y: 0.42 },
  { name: 'Shanghai', x: 0.768, y: 0.36 },
  { name: 'Mumbai', x: 0.638, y: 0.46 },
  { name: 'Moscow', x: 0.572, y: 0.26 },
  { name: 'São Paulo', x: 0.278, y: 0.64 },
  { name: 'Johannesburg', x: 0.532, y: 0.62 },
  { name: 'Los Angeles', x: 0.148, y: 0.38 },
  { name: 'Toronto', x: 0.218, y: 0.32 },
  { name: 'Frankfurt', x: 0.494, y: 0.28 },
  { name: 'Zurich', x: 0.490, y: 0.30 },
  { name: 'Stockholm', x: 0.508, y: 0.22 },
  { name: 'Seoul', x: 0.776, y: 0.32 },
  { name: 'Taipei', x: 0.768, y: 0.40 },
];

const CONNECTIONS = [
  [0, 1], [0, 13], [0, 14], [0, 3], [0, 4],
  [1, 2], [1, 10], [1, 3], [1, 15], [1, 16],
  [2, 3], [2, 15], [2, 17],
  [3, 4], [3, 9], [3, 7], [3, 12],
  [4, 7], [4, 8], [4, 18], [4, 5],
  [5, 7], [5, 6], [5, 9],
  [7, 8], [7, 19], [8, 18],
  [9, 12], [10, 17],
  [11, 0], [11, 1], [11, 12],
  [13, 14], [15, 16], [17, 10],
  [0, 11], [3, 5], [1, 9],
];

const STARS = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 1337 + 200) % 2160,
  size: ((i * 73) % 4) + 1,
  opacity: ((i * 47) % 60 + 20) / 100,
  twinkleOffset: (i * 113) % 100,
}));

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  connectionIdx: i % CONNECTIONS.length,
  speed: ((i * 37) % 60 + 40) / 100,
  offset: (i * 53) % 100,
  size: ((i * 29) % 3) + 2,
}));

const GLOW_RINGS = Array.from({ length: CITIES.length }, (_, i) => ({
  delay: (i * 23) % 60,
  duration: ((i * 41) % 40) + 60,
}));

function getArcPath(
  x1: number, y1: number,
  x2: number, y2: number,
  w: number, h: number
): string {
  const px1 = x1 * w;
  const py1 = y1 * h;
  const px2 = x2 * w;
  const py2 = y2 * h;
  const mx = (px1 + px2) / 2;
  const my = (py1 + py2) / 2;
  const dx = px2 - px1;
  const dy = py2 - py1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const curvature = 0.25;
  const cpx = mx - dy * curvature;
  const cpy = my + dx * curvature - dist * 0.15;
  return `M ${px1} ${py1} Q ${cpx} ${cpy} ${px2} ${py2}`;
}

function getPointOnQuadratic(
  x1: number, y1: number,
  x2: number, y2: number,
  w: number, h: number,
  t: number
): { x: number; y: number } {
  const px1 = x1 * w;
  const py1 = y1 * h;
  const px2 = x2 * w;
  const py2 = y2 * h;
  const mx = (px1 + px2) / 2;
  const my = (py1 + py2) / 2;
  const dx = px2 - px1;
  const dy = py2 - py1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const curvature = 0.25;
  const cpx = mx - dy * curvature;
  const cpy = my + dx * curvature - dist * 0.15;
  const x = (1 - t) * (1 - t) * px1 + 2 * (1 - t) * t * cpx + t * t * px2;
  const y = (1 - t) * (1 - t) * py1 + 2 * (1 - t) * t * cpy + t * t * py2;
  return { x, y };
}

export const LuxuryWorldMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const masterOpacity = Math.min(fadeIn, fadeOut);

  const time = frame / 30;

  // World map continents as simplified SVG paths (normalized 0-1)
  const W = width;
  const H = height;

  // Slow rotation effect on the whole map
  const mapOffsetX = interpolate(frame, [0, durationInFrames], [0, -80], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      width: W,
      height: H,
      background: 'radial-gradient(ellipse at 50% 40%, #0a0804 0%, #050402 60%, #020201 100%)',
      overflow: 'hidden',
      opacity: masterOpacity,
    }}>
      <svg width={W} height={H} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#B8860B" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c8a84b" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#c8a84b" stopOpacity="0" />
          </radialGradient>
          <filter id="blur1">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="blur3">
            <feGaussianBlur stdDeviation="20" />
          </filter>
          <filter id="blur4">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
          <linearGradient id="arcGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c8a84b" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFD700" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c8a84b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1508" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0d0b04" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Ambient background glow */}
        <ellipse cx={W * 0.5} cy={H * 0.45} rx={W * 0.6} ry={H * 0.5}
          fill="url(#centerGlow)" />

        {/* Stars */}
        {STARS.map((star, i) => {
          const twinkle = Math.sin(time * 2 + star.twinkleOffset) * 0.4 + 0.6;
          return (
            <circle
              key={`star-${i}`}
              cx={star.x}
              cy={star.y}
              r={star.size * 0.5}
              fill="#c8a84b"
              opacity={star.opacity * twinkle * 0.6}
            />
          );
        })}

        {/* Grid lines - horizontal */}
        {Array.from({ length: 9 }, (_, i) => {
          const y = H * (i + 1) / 10;
          const opacity = 0.06 + (i === 4 ? 0.04 : 0);
          return (
            <line key={`hgrid-${i}`}
              x1={0} y1={y} x2={W} y2={y}
              stroke="#c8a84b"
              strokeWidth={i === 4 ? 0.8 : 0.4}
              opacity={opacity}
            />
          );
        })}

        {/* Grid lines - vertical */}
        {Array.from({ length: 19 }, (_, i) => {
          const x = W * (i + 1) / 20;
          return (
            <line key={`vgrid-${i}`}
              x1={x} y1={0} x2={x} y2={H}
              stroke="#c8a84b"
              strokeWidth={0.4}
              opacity={0.04}
            />
          );
        })}

        {/* Equator line */}
        <line x1={0} y1={H * 0.5} x2={W} y2={H * 0.5}
          stroke="#c8a84b"
          strokeWidth={1}
          opacity={0.12}
          strokeDasharray="20,15"
        />

        {/* Tropic lines */}
        <line x1={0} y1={H * 0.38} x2={W} y2={H * 0.38}
          stroke="#c8a84b" strokeWidth={0.5} opacity={0.06} strokeDasharray="10,20" />
        <line x1={0} y1={H * 0.62} x2={W} y2={H * 0.62}
          stroke="#c8a84b" strokeWidth={0.5} opacity={0.06} strokeDasharray="10,20" />

        {/* Simplified continent outlines */}
        <g transform={`translate(${mapOffsetX}, 0)`} opacity={0.18}>
          {/* North America */}
          <polygon
            points={`
              ${W*0.06},${H*0.18} ${W*0.22},${H*0.15} ${W*0.28},${H*0.20}
              ${W*0.30},${H*0.30} ${W*0.26},${H*0.38} ${W*0.20},${H*0.42}
              ${W*0.16},${H*0.50} ${W*0.18},${H*0.55} ${W*0.22},${H*0.52}
              ${W*0.24},${H*0.44} ${W*0.14},${H*0.38} ${W*0.10},${H*0.30}
              ${W*0.08},${H*0.22}
            `}
            fill="#c8a84b"
            stroke="#c8a84b"
            strokeWidth={1}
          />
          {/* South America */}
          <polygon
            points={`
              ${W*0.24},${H*0.54} ${W*0.30},${H*0.52} ${W*0.34},${H*0.58}
              ${W*0.32},${H*0.68} ${W*0.28},${H*0.76} ${W*0.24},${H*0.74}
              ${W*0.20},${H*0.66} ${W*0.22},${H*0.58}
            `}
            fill="#c8a84b"
            stroke="#c8a84b"
            strokeWidth={1}
          />
          {/* Europe */}
          <polygon
            points={`
              ${W*0.44},${H*0.18} ${W*0.54},${H*0.16} ${W*0.56},${H*0.22}
              ${W*0.54},${H*0.28} ${W*0.50},${H*0.32} ${W*0.46},${H*0.30}
              ${W*0.44},${H*0.26} ${W*0.42},${H*0.22}
            `}
            fill="#c8a84b"
            stroke="#c8a84b"
            strokeWidth={1}
          />
          {/* Africa */}
          <polygon
            points={`
              ${W*0.46},${H*0.34} ${W*0.56},${H*0.32} ${W*0.60},${H*0.38}
              ${W*0.60},${H*0.50} ${W*0.58},${H*0.60} ${W*0.54},${H*0.66}
              ${W*0.50},${H*0.68} ${W*0.46},${H*0.62} ${W*0.44},${H*0.50}
              ${W*0.44},${H*0.40}
            `}
            fill="#c8a84b"
            stroke="#c8a84b"
            strokeWidth={1}
          />
          {/* Middle East */}
          <polygon
            points={`
              ${W*0.56},${H*0.32} ${W*0.64},${H*0.30} ${W*0.66},${H*0.38}
              ${W*0.62},${H*0.44} ${W*0.58},${H*0.44} ${W*0.56},${H*0.38}
            `}
            fill="#c8a84b"
            stroke="#c8a84b"
            strokeWidth={1}
          />
          {/* Asia */}
          <polygon
            points={`
              ${W*0.56},${H*0.16} ${W*0.80},${H*0.12} ${W*0.86},${H*0.18}
              ${W*0.84},${H*0.28} ${W*0.80},${H*0.34} ${W*0.78},${H*0.42}
              ${W*0.74},${H*0.48} ${W*0.68},${H*0.50} ${W*0.64},${H*0.44}
              ${W*0.62},${H*0.36} ${W*0.64},${H*0.28} ${W*0.60},${H*0.22}
              ${W*0.58},${H*0.18}
            `}
            fill="#c8a84b"
            stroke="#c8a84b"
            strokeWidth={1}
          />
          {/* Australia */}
          <polygon
            points={`
              ${W*0.76},${H*0.60} ${W*0.86},${H*0.58} ${W*0.88},${H*0.64}
              ${W*0.86},${H*0.72} ${W*0.80},${H*0.74} ${W*0.76},${H*0.70}
              ${W*0.74},${H*0.64}
            `}
            fill="#c8a84b"
            stroke="#c8a84b"
            strokeWidth={1}
          />
        </g>

        {/* Continent glow overlay */}
        <g transform={`translate(${mapOffsetX}, 0)`} opacity={0.05} filter="url(#blur2)">
          <polygon
            points={`${W*0.06},${H*0.18} ${W*0.28},${H*0.15} ${W*0.30},${H*0.38} ${W*0.14},${H*0.55} ${W*0.08},${H*0.22}`}
            fill="#FFD700"
          />
          <polygon
            points={`${W*0.44},${H*0.18} ${W*0.56},${H*0.16} ${W*0.54},${H*0.30} ${W*0.44},${H*0.26}`}
            fill="#FFD700"
          />
          <polygon
            points={`${W*0.56},${H*0.16} ${W*0.86},${H*0.12} ${W*0.80},${H*0.48} ${W*0.62},${H*0.36}`}
            fill="#FFD700"
          />
        </g>

        {/* Connection arcs - glow layer */}
        {CONNECTIONS.map((conn, i) => {
          const c1 = CITIES[conn[0]];
          const c2 = CITIES[conn[1]];
          const animDelay = (i * 17) % 80;
          const animDuration = ((i * 31) % 100) + 120;
          const progress = ((frame + animDelay) % animDuration) / animDuration;
          const arcProgress = interpolate(
            Math.min(progress * 2, 1),
            [0, 1], [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const baseOpacity = interpolate(
            frame,
            [animDelay, animDelay + 30, animDuration - 20, animDuration],
            [0, 0.4, 0.4, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const path = getArcPath(c1.x, c1.y, c2.x, c2.y, W, H);
          const pulseOpacity = (Math.sin(time * 1.5 + i * 0.7) * 0.15 + 0.25);

          return (
            <g key={`arc-glow-${i}`}>
              <path
                d={path}
                fill="none"
                stroke="#FFD700"
                strokeWidth={4}
                opacity={pulseOpacity * 0.3}
                filter="url(#blur2)"
                strokeLinecap="round"
              />
              <path
                d={path}
                fill="none"
                stroke="#c8a84b"
                strokeWidth={1.2}
                opacity={pulseOpacity * 0.6}
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* Animated particles on arcs */}
        {PARTICLES.map((p, i) => {
          const conn = CONNECTIONS[p.connectionIdx];
          const c1 = CITIES[conn[0]];
          const c2 = CITIES[conn[1]];
          const totalFrames = Math.floor(150 / p.speed);
          const offsetFrames = Math.floor((p.offset / 100) * totalFrames);
          const t = ((frame + offsetFrames) % totalFrames) / totalFrames;
          const pos = getPointOnQuadratic(c1.x, c1.y, c2.x, c2.y, W, H, t);
          const fadeEdge = Math.min(t * 8, 1) * Math.min((1 - t) * 8, 1);
          const shimmer = Math.sin(time * 3 + i * 1.3) * 0.3 + 0.7;

          return (
            <g key={`particle-${i}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={p.size * 3}
                fill="#FFD700"
                opacity={fadeEdge * shimmer * 0.15}
                filter="url(#blur1)"
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={p.size}
                fill="#FFE55C"
                opacity={fadeEdge * shimmer * 0.95}
              />
            </g>
          );
        })}

        {/* City nodes */}
        {CITIES.map((city, i) => {
          const cx = city.x * W;
          const cy = city.y * H;
          const pulse = Math.sin(time * 2 + GLOW_RINGS[i].delay * 0.1) * 0.5 + 0.5;
          const outerPulse = Math.sin(time * 1.5 + GLOW_RINGS[i].delay * 0.08) * 0.5 + 0.5;
          const ringScale = 1 + outerPulse * 0.8;
          const innerShimmer = Math.sin(time * 3 + i * 0.9) * 0.3 + 0.7;

          return (
            <g key={`city-${i}`}>
              {/* Outer glow */}
              <circle cx={cx} cy={cy} r={30 * ringScale}
                fill="none"
                stroke="#c8a84b"
                strokeWidth={1}
                opacity={outerPulse * 0.2}
                filter="url(#blur1)"
              />
              {/* Mid ring */}
              <circle cx={cx} cy={cy} r={18}
                fill="none"
                stroke="#FFD700"
                strokeWidth={1.5}
                opacity={pulse * 0.5}
                strokeDasharray="4,4"
              />
              {/* Inner glow */}
              <circle cx={cx} cy={cy} r={12}
                fill="#c8a84b"
                opacity={0.15}
                filter="url(#blur1)"
              />
              {/* Core dot */}
              <circle cx={cx} cy={cy} r={5}
                fill="#FFE55C"
                opacity={innerShimmer * 0.95}
              />
              {/* Core center */}
              <circle cx={cx} cy={cy} r={2.5}
                fill="#FFFFFF"
                opacity={innerShimmer * 0.9}
              />
              {/* Sparkle cross */}
              <line x1={cx - 8} y1={cy} x2={cx + 8} y2={cy}
                stroke="#FFD700"
                strokeWidth={0.8}
                opacity={pulse * 0.6}
              />
              <line x1={cx} y1={cy - 8} x2={cx} y2={cy + 8}
                stroke="#FFD700"
                strokeWidth={0.8}
                opacity={pulse * 0.6}
              />
            </g>
          );
        })}

        {/* Decorative corner ornaments */}
        {[
          { x: 60, y: 60, rot: 0 },
          { x: W - 60, y: 60, rot: 90 },
          { x: W - 60, y: H - 60, rot: 180 },
          { x: 60, y: H - 60, rot: 270 },
        ].map((corner, i) => {
          const shimmer = Math.sin(time * 1.2 + i * 1.5) * 0.2 + 0.7;
          return (
            <g key={`corner-${i}`} transform={`translate(${corner.x}, ${corner.y}) rotate(${corner.rot})`} opacity={shimmer * 0.7}>
              <line x1={-40} y1={0} x2={0} y2={0} stroke="#c8a84b" strokeWidth={1.5} />
              <line x1={0} y1={-40} x2={0} y2={0} stroke="#c8a84b" strokeWidth={1.5} />
              <circle cx={0} cy={0} r={3} fill="#FFD700" opacity={0.8} />
              <line x1={-20} y1={-6} x2={-6} y2={-6} stroke="#c8a84b" strokeWidth={0.7} opacity={0.5} />
              <line x1={-6} y1={-20} x2={-6} y2={-6} stroke="#c8a84b" strokeWidth={0.7} opacity={0.5} />
            </g>
          );
        })}

        {/* Central decorative rings */}
        {[200, 350, 500].map((r, i) => {
          const rot = time * (i % 2 === 0 ? 5 : -3) + i * 30;
          const opacity = 0.06 - i * 0.015;
          const dashLen = 8 + i * 4;
          return (
            <circle
              key={`deco-ring-${i}`}
              cx={W * 0.5}
              cy={H * 0.45}
              r={r}
              fill="none"
              stroke="#c8a84b"
              strokeWidth={0.8}
              opacity={opacity}
              strokeDasharray={`${dashLen},${dashLen * 2}`}
              strokeDashoffset={rot * r * 0.1}
            />
          );
        })}

        {/* Scanning line effect */}
        {(() => {
          const scanProgress = (frame % 300) / 300;
          const scanX = scanProgress * W;
          const scanOpacity = Math.sin(scanProgress * Math.PI) * 0.08;
          return (
            <line
              x1={scanX} y1={0}
              x2={scanX} y2={H}
              stroke="#FFD700"
              strokeWidth={2}
              opacity={scanOpacity}
              filter="url(#blur4)"
            />
          );
        })()}

        {/* Top border line */}
        <line x1={0} y1={0} x2={W} y2={0} stroke="#c8a84b" strokeWidth={2} opacity={0.4} />
        <line x1={0} y1={4} x2={W} y2={4} stroke="#c8a84b" strokeWidth={0.5} opacity={0.2} />
        {/* Bottom border */}
        <line x1={0} y1={H} x2={W} y2={H} stroke="#c8a84b" strokeWidth={2} opacity={0.4} />
        <line x1={0} y1={H - 4} x2={W} y2={H - 4} stroke="#c8a84b" strokeWidth={0.5} opacity={0.2} />
        {/* Left border */}
        <line x1={0} y1={0} x2={0} y2={H} stroke="#c8a84b" strokeWidth={2} opacity={0.4} />
        <line x1={4} y1={0} x2={4} y2={H} stroke="#c8a84b" strokeWidth={0.5} opacity={0.2} />
        {/* Right border */}
        <line x1={W} y1={0} x2={W} y2={H} stroke="#c8a84b" strokeWidth={2} opacity={0.4} />
        <line x1={W - 4} y1={0} x2={W - 4} y2={H} stroke="#c8a84b" strokeWidth={0.5} opacity={0.2} />

      </svg>
    </div>
  );
};