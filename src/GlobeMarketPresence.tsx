import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const MARKET_DOTS = Array.from({ length: 120 }, (_, i) => ({
  lat: ((i * 137.508) % 180) - 90,
  lng: ((i * 198.431) % 360) - 180,
  size: ((i % 8) + 3),
  appearFrame: Math.floor((i / 120) * 480) + 20,
  pulseOffset: (i * 23) % 60,
  region: i % 6,
  brightness: 0.6 + (i % 4) * 0.1,
}));

const CONTINENTS = [
  // North America
  { points: "M 180,200 L 220,180 L 260,175 L 280,195 L 285,220 L 275,255 L 255,275 L 235,290 L 210,310 L 195,305 L 185,285 L 175,265 L 170,240 Z", color: "#1a3a2a" },
  // South America
  { points: "M 230,320 L 255,310 L 270,330 L 275,360 L 270,400 L 255,430 L 240,450 L 225,440 L 215,415 L 218,385 L 220,355 Z", color: "#1a3a2a" },
  // Europe
  { points: "M 440,155 L 470,145 L 500,150 L 510,165 L 505,185 L 490,195 L 465,200 L 445,195 L 435,175 Z", color: "#1a3a2a" },
  // Africa
  { points: "M 455,220 L 490,215 L 510,230 L 515,265 L 510,310 L 495,350 L 475,375 L 455,365 L 440,340 L 438,305 L 440,265 L 445,240 Z", color: "#1a3a2a" },
  // Asia
  { points: "M 520,140 L 600,130 L 680,145 L 710,165 L 720,195 L 700,220 L 665,240 L 630,250 L 590,245 L 555,230 L 530,210 L 515,185 Z", color: "#1a3a2a" },
  // Australia
  { points: "M 660,320 L 700,310 L 730,325 L 735,355 L 720,375 L 690,380 L 665,365 L 655,340 Z", color: "#1a3a2a" },
];

const GRID_LINES_LAT = Array.from({ length: 13 }, (_, i) => i * 15 - 90);
const GRID_LINES_LNG = Array.from({ length: 25 }, (_, i) => i * 15 - 180);

const GLOW_RINGS = Array.from({ length: 5 }, (_, i) => ({
  radius: 340 + i * 18,
  opacity: 0.03 + i * 0.015,
}));

function latLngToXY(lat: number, lng: number, cx: number, cy: number, r: number) {
  const x = cx + (lng / 180) * r;
  const y = cy - (lat / 90) * (r * 0.5);
  return { x, y };
}

function lngToX(lng: number, cx: number, r: number) {
  return cx + (lng / 180) * r;
}

function latToY(lat: number, cy: number, r: number) {
  return cy - (lat / 90) * (r * 0.5);
}

const REGION_COLORS = [
  '#00ff88',
  '#00aaff',
  '#ff6644',
  '#ffcc00',
  '#aa44ff',
  '#ff44aa',
];

export const GlobeMarketPresence: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const progress = frame / durationInFrames;
  const globeRotation = interpolate(frame, [0, durationInFrames], [0, 360]);

  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.38;

  const scaleX = width / 860;
  const scaleY = height / 540;

  // Pulse animation
  const pulse = Math.sin(frame * 0.15) * 0.5 + 0.5;

  // Connection lines between dots that are active
  const activeDots = MARKET_DOTS.filter(d => frame >= d.appearFrame);

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 50% 40%, #050f18 0%, #020508 60%, #000000 100%)',
        overflow: 'hidden',
        opacity,
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#002244" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#001122" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="centerGlow" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#0066aa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000011" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="1" />
            <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
          </radialGradient>
          <filter id="blur1">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="blur3">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <clipPath id="globeClip">
            <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.5} />
          </clipPath>
          <radialGradient id="atmosphereGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#0088ff" stopOpacity="0.15" />
            <stop offset="70%" stopColor="#002266" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#0044aa" stopOpacity="0.0" />
          </radialGradient>
        </defs>

        {/* Outer glow rings */}
        {GLOW_RINGS.map((ring, i) => (
          <ellipse
            key={`ring-${i}`}
            cx={cx}
            cy={cy}
            rx={ring.radius * (width / 1920)}
            ry={ring.radius * 0.5 * (height / 1080)}
            fill="none"
            stroke="#0044aa"
            strokeWidth={1}
            opacity={ring.opacity * (0.5 + pulse * 0.5)}
          />
        ))}

        {/* Globe base ellipse */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={r}
          ry={r * 0.5}
          fill="url(#globeGlow)"
        />

        {/* Atmosphere */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={r * 1.02}
          ry={r * 0.52}
          fill="url(#atmosphereGrad)"
        />

        {/* Continent fills */}
        <g
          transform={`translate(${cx - 430 * scaleX}, ${cy - 270 * scaleY}) scale(${scaleX}, ${scaleY})`}
          clipPath="url(#globeClip)"
        >
          {CONTINENTS.map((continent, i) => (
            <polygon
              key={`continent-${i}`}
              points={continent.points}
              fill={continent.color}
              stroke="#2a5a3a"
              strokeWidth={1.5}
              opacity={0.85}
            />
          ))}
        </g>

        {/* Grid lines */}
        <g clipPath="url(#globeClip)" opacity={0.12}>
          {GRID_LINES_LAT.map((lat, i) => {
            const y = latToY(lat, cy, r);
            const maxLng = 90 * Math.cos((lat * Math.PI) / 90);
            const x1 = lngToX(-maxLng, cx, r);
            const x2 = lngToX(maxLng, cx, r);
            return (
              <line
                key={`lat-${i}`}
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke="#00aaff"
                strokeWidth={0.8}
              />
            );
          })}
          {GRID_LINES_LNG.map((lng, i) => {
            const x = lngToX(lng, cx, r);
            const y1 = latToY(-90, cy, r);
            const y2 = latToY(90, cy, r);
            return (
              <line
                key={`lng-${i}`}
                x1={x}
                y1={y1}
                x2={x}
                y2={y2}
                stroke="#00aaff"
                strokeWidth={0.8}
              />
            );
          })}
        </g>

        {/* Connection lines between dots */}
        {activeDots.slice(0, Math.min(activeDots.length, 60)).map((dot, i) => {
          if (i % 7 !== 0) return null;
          const nextDot = activeDots[(i + 13) % activeDots.length];
          if (!nextDot) return null;
          const { x: x1, y: y1 } = latLngToXY(dot.lat, dot.lng, cx, cy, r);
          const { x: x2, y: y2 } = latLngToXY(nextDot.lat, nextDot.lng, cx, cy, r);
          const lineProgress = interpolate(
            frame,
            [dot.appearFrame, dot.appearFrame + 30],
            [0, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          );
          const lineOpacity = lineProgress * 0.15;
          return (
            <line
              key={`line-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={REGION_COLORS[dot.region]}
              strokeWidth={0.8 * Math.min(width / 1920, height / 1080)}
              opacity={lineOpacity}
            />
          );
        })}

        {/* Market dots - blurred glow layer */}
        <g filter="url(#blur2)">
          {MARKET_DOTS.map((dot, i) => {
            if (frame < dot.appearFrame) return null;
            const { x, y } = latLngToXY(dot.lat, dot.lng, cx, cy, r);
            const appearProgress = interpolate(
              frame,
              [dot.appearFrame, dot.appearFrame + 20],
              [0, 1],
              { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
            );
            const pulseFactor = Math.sin((frame + dot.pulseOffset) * 0.12) * 0.4 + 0.8;
            const dotSize = dot.size * 2.5 * pulseFactor * Math.min(width / 1920, height / 1080);
            return (
              <circle
                key={`glow-${i}`}
                cx={x}
                cy={y}
                r={dotSize}
                fill={REGION_COLORS[dot.region]}
                opacity={appearProgress * 0.5 * dot.brightness}
              />
            );
          })}
        </g>

        {/* Market dots - sharp layer */}
        {MARKET_DOTS.map((dot, i) => {
          if (frame < dot.appearFrame) return null;
          const { x, y } = latLngToXY(dot.lat, dot.lng, cx, cy, r);
          const appearProgress = interpolate(
            frame,
            [dot.appearFrame, dot.appearFrame + 20],
            [0, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          );
          const pulseFactor = Math.sin((frame + dot.pulseOffset) * 0.12) * 0.25 + 0.95;
          const dotSize = dot.size * 0.9 * pulseFactor * Math.min(width / 1920, height / 1080);

          return (
            <g key={`dot-${i}`} opacity={appearProgress}>
              {/* Ripple ring */}
              <circle
                cx={x}
                cy={y}
                r={dotSize * (2 + ((frame - dot.appearFrame) % 40) / 40 * 3)}
                fill="none"
                stroke={REGION_COLORS[dot.region]}
                strokeWidth={0.7}
                opacity={Math.max(0, 0.5 - ((frame - dot.appearFrame) % 40) / 40 * 0.5)}
              />
              {/* Core dot */}
              <circle
                cx={x}
                cy={y}
                r={dotSize}
                fill={REGION_COLORS[dot.region]}
                opacity={dot.brightness}
              />
              {/* White center highlight */}
              <circle
                cx={x - dotSize * 0.25}
                cy={y - dotSize * 0.25}
                r={dotSize * 0.35}
                fill="white"
                opacity={0.7}
              />
            </g>
          );
        })}

        {/* Globe edge glow */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={r}
          ry={r * 0.5}
          fill="none"
          stroke="#0066cc"
          strokeWidth={3}
          opacity={0.4}
          filter="url(#blur1)"
        />
        <ellipse
          cx={cx}
          cy={cy}
          rx={r * 1.005}
          ry={r * 0.505}
          fill="none"
          stroke="#0044aa"
          strokeWidth={8}
          opacity={0.15}
          filter="url(#blur2)"
        />

        {/* Rotating highlight sweep */}
        <defs>
          <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.04" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse
          cx={cx}
          cy={cy}
          rx={r * 0.6}
          ry={r * 0.48}
          fill="url(#sweepGrad)"
          transform={`rotate(${globeRotation * 0.3}, ${cx}, ${cy})`}
          clipPath="url(#globeClip)"
        />

        {/* Count display - shown as visual progress arc */}
        <g>
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const arcR = r * 1.15;
            const ax = cx + Math.cos(angle) * arcR;
            const ay = cy + Math.sin(angle) * arcR * 0.5;
            const segProgress = interpolate(
              frame,
              [i * 40, i * 40 + 40],
              [0, 1],
              { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
            );
            const sizeS = 6 * Math.min(width / 1920, height / 1080);
            return (
              <circle
                key={`arc-${i}`}
                cx={ax}
                cy={ay}
                r={sizeS}
                fill="#00ff88"
                opacity={segProgress * 0.6}
              />
            );
          })}
        </g>

        {/* Stars in background */}
        {Array.from({ length: 80 }, (_, i) => {
          const sx = (i * 1731 + 500) % width;
          const sy = (i * 1337 + 200) % height;
          const starSize = (i % 3) + 1;
          const twinkle = Math.sin(frame * 0.05 + i * 0.8) * 0.3 + 0.4;
          return (
            <circle
              key={`star-${i}`}
              cx={sx}
              cy={sy}
              r={starSize * 0.4 * Math.min(width / 1920, height / 1080)}
              fill="white"
              opacity={twinkle * 0.5}
            />
          );
        })}

        {/* Center glow overlay */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={r * 0.4}
          ry={r * 0.2}
          fill="url(#centerGlow)"
          opacity={0.5}
        />

      </svg>
    </div>
  );
};