import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const PIPELINE_ROUTES = [
  { id: 0, points: [[400, 800], [600, 750], [850, 720], [1100, 700], [1400, 680], [1700, 660], [2000, 640], [2300, 650], [2600, 670]] },
  { id: 1, points: [[600, 750], [620, 900], [650, 1050], [700, 1200], [750, 1350], [800, 1500]] },
  { id: 2, points: [[1100, 700], [1150, 850], [1200, 1000], [1250, 1150], [1300, 1300], [1320, 1450]] },
  { id: 3, points: [[1700, 660], [1720, 820], [1740, 980], [1760, 1140], [1780, 1300]] },
  { id: 4, points: [[2000, 640], [2100, 750], [2200, 900], [2250, 1050], [2280, 1200]] },
  { id: 5, points: [[2300, 650], [2500, 600], [2700, 580], [2900, 570], [3100, 560], [3300, 580], [3500, 600]] },
  { id: 6, points: [[1400, 680], [1500, 560], [1600, 450], [1750, 380], [1900, 340], [2100, 320], [2300, 310]] },
  { id: 7, points: [[850, 720], [900, 600], [980, 500], [1100, 430], [1250, 380], [1420, 360]] },
  { id: 8, points: [[2600, 670], [2700, 800], [2750, 950], [2780, 1100], [2800, 1250], [2820, 1400]] },
  { id: 9, points: [[1900, 340], [2050, 280], [2200, 250], [2400, 230], [2600, 240], [2800, 260]] },
];

const NODES = [
  { id: 0, x: 400, y: 800, size: 28, label: 'origin' },
  { id: 1, x: 600, y: 750, size: 22, label: 'hub' },
  { id: 2, x: 850, y: 720, size: 24, label: 'hub' },
  { id: 3, x: 1100, y: 700, size: 26, label: 'hub' },
  { id: 4, x: 1400, y: 680, size: 30, label: 'major' },
  { id: 5, x: 1700, y: 660, size: 24, label: 'hub' },
  { id: 6, x: 2000, y: 640, size: 26, label: 'hub' },
  { id: 7, x: 2300, y: 650, size: 28, label: 'hub' },
  { id: 8, x: 2600, y: 670, size: 24, label: 'hub' },
  { id: 9, x: 3500, y: 600, size: 22, label: 'end' },
  { id: 10, x: 800, y: 1500, size: 20, label: 'end' },
  { id: 11, x: 1320, y: 1450, size: 20, label: 'end' },
  { id: 12, x: 1780, y: 1300, size: 20, label: 'end' },
  { id: 13, x: 2820, y: 1400, size: 20, label: 'end' },
  { id: 14, x: 2800, y: 260, size: 22, label: 'end' },
  { id: 15, x: 1420, y: 360, size: 20, label: 'end' },
  { id: 16, x: 2280, y: 1200, size: 20, label: 'end' },
];

const LAND_REGIONS = [
  { id: 0, d: 'M 200,600 Q 400,500 700,520 Q 900,540 1000,480 Q 1200,420 1500,400 Q 1800,380 2100,360 Q 2400,340 2700,380 Q 3000,420 3200,460 Q 3400,500 3600,480 L 3600,1200 Q 3400,1250 3000,1300 Q 2600,1350 2200,1380 Q 1800,1400 1400,1420 Q 1000,1440 700,1380 Q 450,1320 300,1200 Q 200,1100 200,900 Z', opacity: 0.18 },
  { id: 1, d: 'M 500,1380 Q 700,1350 900,1400 Q 1000,1500 900,1700 Q 800,1800 650,1750 Q 500,1700 480,1580 Z', opacity: 0.12 },
  { id: 2, d: 'M 1200,1420 Q 1400,1380 1600,1420 Q 1700,1500 1650,1650 Q 1580,1780 1400,1760 Q 1230,1740 1200,1620 Z', opacity: 0.12 },
  { id: 3, d: 'M 1800,1300 Q 2100,1280 2400,1320 Q 2600,1380 2700,1500 Q 2720,1650 2550,1720 Q 2350,1780 2100,1720 Q 1880,1660 1820,1520 Z', opacity: 0.14 },
  { id: 4, d: 'M 2700,1380 Q 2900,1340 3100,1380 Q 3200,1450 3180,1580 Q 3130,1700 2950,1720 Q 2770,1740 2720,1600 Z', opacity: 0.12 },
  { id: 5, d: 'M 800,300 Q 1000,250 1200,260 Q 1400,270 1500,320 Q 1600,370 1500,440 Q 1380,490 1200,480 Q 1000,470 870,430 Q 770,390 800,300 Z', opacity: 0.10 },
];

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  routeIdx: i % PIPELINE_ROUTES.length,
  offset: (i * 137) % 100 / 100,
  speed: 0.3 + (i % 7) * 0.1,
  size: 2 + (i % 5),
}));

const SPARKLES = Array.from({ length: 120 }, (_, i) => ({
  x: 200 + (i * 2731) % 3400,
  y: 200 + (i * 1337) % 1600,
  size: 1 + (i % 3),
  phase: (i * 0.7) % (Math.PI * 2),
  speed: 0.5 + (i % 4) * 0.3,
}));

function getPointOnPath(points: number[][], t: number): [number, number] {
  if (points.length < 2) return [points[0][0], points[0][1]];
  const totalSegments = points.length - 1;
  const scaled = t * totalSegments;
  const segIndex = Math.min(Math.floor(scaled), totalSegments - 1);
  const segT = scaled - segIndex;
  const p0 = points[segIndex];
  const p1 = points[segIndex + 1];
  return [
    p0[0] + (p1[0] - p0[0]) * segT,
    p0[1] + (p1[1] - p0[1]) * segT,
  ];
}

function pointsToSVGPath(points: number[][]): string {
  if (points.length === 0) return '';
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const mx = (prev[0] + curr[0]) / 2;
    const my = (prev[1] + curr[1]) / 2;
    d += ` Q ${prev[0]},${prev[1]} ${mx},${my}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last[0]},${last[1]}`;
  return d;
}

export const MiddleEastEnergyPipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const scaleX = width / 3840;
  const scaleY = height / 2160;

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const masterOpacity = Math.min(fadeIn, fadeOut);

  const time = frame / 30;

  const pipelineReveal = interpolate(frame, [30, 200], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  const pulseA = 0.7 + 0.3 * Math.sin(time * 2.1);
  const pulseB = 0.7 + 0.3 * Math.sin(time * 1.7 + 1.2);
  const pulseC = 0.7 + 0.3 * Math.sin(time * 2.5 + 2.4);

  const flowProgress = (time * 0.18) % 1;

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 50% 40%, #0d0a06 0%, #060404 60%, #030202 100%)',
        overflow: 'hidden',
        position: 'relative',
        opacity: masterOpacity,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 3840 2160`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="18" result="blur1" />
            <feGaussianBlur stdDeviation="8" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="30" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-node" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="land-glow">
            <feGaussianBlur stdDeviation="20" />
          </filter>
          <radialGradient id="bgGrad" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#1a0d00" />
            <stop offset="100%" stopColor="#030202" />
          </radialGradient>
          <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff6a00" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#ffb347" stopOpacity="1" />
            <stop offset="100%" stopColor="#ff4500" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Background glow */}
        <rect width="3840" height="2160" fill="url(#bgGrad)" />

        {/* Subtle ambient glow center */}
        <ellipse cx="1920" cy="900" rx="1200" ry="700"
          fill="#ff6a00" opacity={0.03 + 0.02 * Math.sin(time * 0.8)}
          filter="url(#glow-soft)"
        />

        {/* Land regions */}
        {LAND_REGIONS.map((region) => (
          <g key={region.id}>
            <path
              d={region.d}
              fill="#2a1500"
              opacity={region.opacity * pipelineReveal}
              filter="url(#land-glow)"
            />
            <path
              d={region.d}
              fill="none"
              stroke="#3d2200"
              strokeWidth="2"
              opacity={region.opacity * 1.5 * pipelineReveal}
            />
          </g>
        ))}

        {/* Grid lines - subtle latitude/longitude */}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`h${i}`}
            x1="0" y1={200 + i * 220}
            x2="3840" y2={200 + i * 220}
            stroke="#1a0d00" strokeWidth="1" opacity={0.4 * pipelineReveal}
          />
        ))}
        {Array.from({ length: 14 }, (_, i) => (
          <line key={`v${i}`}
            x1={120 + i * 270} y1="0"
            x2={120 + i * 270} y2="2160"
            stroke="#1a0d00" strokeWidth="1" opacity={0.4 * pipelineReveal}
          />
        ))}

        {/* Pipeline routes - glow layer (wide, soft) */}
        {PIPELINE_ROUTES.map((route) => {
          const revealDelay = route.id * 15;
          const routeReveal = interpolate(frame, [60 + revealDelay, 180 + revealDelay], [0, 1], {
            extrapolateRight: 'clamp', extrapolateLeft: 'clamp'
          });
          const pathD = pointsToSVGPath(route.points);
          return (
            <path
              key={`glow-${route.id}`}
              d={pathD}
              fill="none"
              stroke="#ff6a00"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.12 * routeReveal}
              filter="url(#glow-soft)"
            />
          );
        })}

        {/* Pipeline routes - main orange lines */}
        {PIPELINE_ROUTES.map((route) => {
          const revealDelay = route.id * 15;
          const routeReveal = interpolate(frame, [60 + revealDelay, 180 + revealDelay], [0, 1], {
            extrapolateRight: 'clamp', extrapolateLeft: 'clamp'
          });
          const pathD = pointsToSVGPath(route.points);
          const totalLength = route.points.length > 1 ? 3000 : 0;
          const pulse = 0.7 + 0.3 * Math.sin(time * 2 + route.id * 0.8);
          return (
            <path
              key={`pipe-${route.id}`}
              d={pathD}
              fill="none"
              stroke="#ff8c00"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9 * routeReveal * pulse}
              filter="url(#glow-strong)"
            />
          );
        })}

        {/* Pipeline routes - bright core */}
        {PIPELINE_ROUTES.map((route) => {
          const revealDelay = route.id * 15;
          const routeReveal = interpolate(frame, [60 + revealDelay, 180 + revealDelay], [0, 1], {
            extrapolateRight: 'clamp', extrapolateLeft: 'clamp'
          });
          const pathD = pointsToSVGPath(route.points);
          return (
            <path
              key={`core-${route.id}`}
              d={pathD}
              fill="none"
              stroke="#ffe4b5"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.6 * routeReveal}
            />
          );
        })}

        {/* Flow particles along pipelines */}
        {PARTICLES.map((p) => {
          const route = PIPELINE_ROUTES[p.routeIdx];
          const revealDelay = p.routeIdx * 15;
          const routeReveal = interpolate(frame, [100 + revealDelay, 200 + revealDelay], [0, 1], {
            extrapolateRight: 'clamp', extrapolateLeft: 'clamp'
          });
          const t = ((flowProgress * p.speed + p.offset) % 1);
          const [px, py] = getPointOnPath(route.points, t);
          const trailT = Math.max(0, t - 0.04);
          const [tx, ty] = getPointOnPath(route.points, trailT);
          const particleOpacity = 0.8 * routeReveal;
          return (
            <g key={`particle-${p.id}-${p.routeIdx}`} opacity={particleOpacity}>
              <line
                x1={tx} y1={ty} x2={px} y2={py}
                stroke="#ffb347"
                strokeWidth={p.size * 0.8}
                opacity={0.5}
                strokeLinecap="round"
              />
              <circle
                cx={px} cy={py} r={p.size}
                fill="#ffdb8a"
                filter="url(#glow-node)"
              />
            </g>
          );
        })}

        {/* Node circles */}
        {NODES.map((node) => {
          const nodeReveal = interpolate(frame, [120, 200], [0, 1], {
            extrapolateRight: 'clamp', extrapolateLeft: 'clamp'
          });
          const pulse = 0.6 + 0.4 * Math.sin(time * 2.5 + node.id * 0.9);
          const ringPulse = 0.4 + 0.6 * Math.sin(time * 1.8 + node.id * 1.2);
          const isMain = node.label === 'major';
          const isMajor = node.label === 'hub' || node.label === 'origin';
          return (
            <g key={`node-${node.id}`} opacity={nodeReveal}>
              {/* Outer ring pulse */}
              <circle
                cx={node.x} cy={node.y}
                r={node.size * (2 + ringPulse)}
                fill="none"
                stroke="#ff6a00"
                strokeWidth="1.5"
                opacity={0.3 * ringPulse}
              />
              {/* Glow */}
              <circle
                cx={node.x} cy={node.y}
                r={node.size * 2}
                fill="#ff6a00"
                opacity={0.15 * pulse}
                filter="url(#glow-node)"
              />
              {/* Core dot */}
              <circle
                cx={node.x} cy={node.y}
                r={node.size}
                fill={isMain ? '#ffe566' : isMajor ? '#ffb347' : '#ff8c00'}
                opacity={0.9 * pulse}
                filter="url(#glow-node)"
              />
              {/* Center bright */}
              <circle
                cx={node.x} cy={node.y}
                r={node.size * 0.4}
                fill="#ffffff"
                opacity={0.7 * pulse}
              />
            </g>
          );
        })}

        {/* Sparkle stars in the background */}
        {SPARKLES.map((s) => {
          const sparkOpacity = interpolate(frame, [20, 80], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
          const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(time * s.speed + s.phase));
          return (
            <circle
              key={`sparkle-${s.id}`}
              cx={s.x} cy={s.y}
              r={s.size}
              fill="#ff8c00"
              opacity={twinkle * 0.15 * sparkOpacity}
            />
          );
        })}

        {/* Animated energy wave rings from major hub */}
        {[0, 1, 2].map((ring) => {
          const ringProgress = ((time * 0.4 + ring * 0.33) % 1);
          const ringRadius = interpolate(ringProgress, [0, 1], [10, 200]);
          const ringOpacity = interpolate(ringProgress, [0, 0.3, 1], [0, 0.5, 0]) * pipelineReveal;
          return (
            <circle
              key={`wave-${ring}`}
              cx={1400} cy={680}
              r={ringRadius}
              fill="none"
              stroke="#ff6a00"
              strokeWidth="3"
              opacity={ringOpacity}
            />
          );
        })}

        {/* Secondary energy rings from node 2300 */}
        {[0, 1, 2].map((ring) => {
          const ringProgress = ((time * 0.35 + ring * 0.33 + 0.15) % 1);
          const ringRadius = interpolate(ringProgress, [0, 1], [10, 160]);
          const ringOpacity = interpolate(ringProgress, [0, 0.3, 1], [0, 0.4, 0]) * pipelineReveal;
          return (
            <circle
              key={`wave2-${ring}`}
              cx={2300} cy={650}
              r={ringRadius}
              fill="none"
              stroke="#ffb347"
              strokeWidth="2"
              opacity={ringOpacity}
            />
          );
        })}

        {/* Vignette overlay */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.7" />
        </radialGradient>
        <rect width="3840" height="2160" fill="url(#vignette)" />

        {/* Top-bottom gradient fade */}
        <linearGradient id="topFade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.5" />
          <stop offset="10%" stopColor="transparent" />
          <stop offset="90%" stopColor="transparent" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
        </linearGradient>
        <rect width="3840" height="2160" fill="url(#topFade)" />
      </svg>
    </div>
  );
};