import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { id: 0, x: 0.12, y: 0.38, name: 'NYC' },
  { id: 1, x: 0.22, y: 0.55, name: 'BOG' },
  { id: 2, x: 0.28, y: 0.72, name: 'SAO' },
  { id: 3, x: 0.42, y: 0.28, name: 'LON' },
  { id: 4, x: 0.48, y: 0.32, name: 'PAR' },
  { id: 5, x: 0.50, y: 0.22, name: 'STO' },
  { id: 6, x: 0.55, y: 0.36, name: 'CAI' },
  { id: 7, x: 0.62, y: 0.30, name: 'MOW' },
  { id: 8, x: 0.60, y: 0.52, name: 'DXB' },
  { id: 9, x: 0.68, y: 0.42, name: 'DEL' },
  { id: 10, x: 0.75, y: 0.35, name: 'BEI' },
  { id: 11, x: 0.80, y: 0.44, name: 'SHA' },
  { id: 12, x: 0.82, y: 0.55, name: 'HKG' },
  { id: 13, x: 0.86, y: 0.48, name: 'TKY' },
  { id: 14, x: 0.88, y: 0.65, name: 'SYD' },
  { id: 15, x: 0.70, y: 0.60, name: 'SIN' },
  { id: 16, x: 0.15, y: 0.30, name: 'CHI' },
  { id: 17, x: 0.08, y: 0.42, name: 'MIA' },
  { id: 18, x: 0.05, y: 0.28, name: 'LAX' },
  { id: 19, x: 0.52, y: 0.62, name: 'JNB' },
];

const CONNECTIONS = [
  [0, 3], [0, 16], [0, 4], [3, 4], [3, 7], [4, 6], [6, 8],
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14],
  [14, 15], [15, 12], [7, 10], [0, 17], [17, 18], [18, 0],
  [1, 2], [2, 19], [19, 6], [5, 7], [5, 3], [8, 15], [16, 0],
  [0, 1], [3, 19], [11, 13], [9, 15],
];

const PARTICLES = Array.from({ length: CONNECTIONS.length }, (_, i) => ({
  offset: (i * 137.5) % 1,
  speed: 0.4 + ((i * 73) % 60) / 100,
  delay: (i * 23) % 90,
}));

const STARS = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 1337 + 200) % 2160,
  r: ((i * 97) % 4) + 1,
  twinkle: (i * 53) % 60,
}));

const CITY_PULSE_OFFSETS = Array.from({ length: 20 }, (_, i) => (i * 37) % 60);

function getArcPath(x1: number, y1: number, x2: number, y2: number, w: number, h: number): string {
  const px1 = x1 * w;
  const py1 = y1 * h;
  const px2 = x2 * w;
  const py2 = y2 * h;
  const mx = (px1 + px2) / 2;
  const my = (py1 + py2) / 2;
  const dx = px2 - px1;
  const dy = py2 - py1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const curve = len * 0.18;
  const nx = -dy / len;
  const ny = dx / len;
  const cx = mx + nx * curve;
  const cy = my + ny * curve - len * 0.06;
  return `M ${px1} ${py1} Q ${cx} ${cy} ${px2} ${py2}`;
}

function getPointOnQuadratic(x1: number, y1: number, x2: number, y2: number, w: number, h: number, t: number) {
  const px1 = x1 * w;
  const py1 = y1 * h;
  const px2 = x2 * w;
  const py2 = y2 * h;
  const mx = (px1 + px2) / 2;
  const my = (py1 + py2) / 2;
  const dx = px2 - px1;
  const dy = py2 - py1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const curve = len * 0.18;
  const nx = -dy / len;
  const ny = dx / len;
  const cx = mx + nx * curve;
  const cy = my + ny * curve - len * 0.06;
  const x = (1 - t) * (1 - t) * px1 + 2 * (1 - t) * t * cx + t * t * px2;
  const y = (1 - t) * (1 - t) * py1 + 2 * (1 - t) * t * cy + t * t * py2;
  return { x, y };
}

export const GlobalNetworkAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div style={{ width, height, background: '#020408', position: 'relative', overflow: 'hidden', opacity: globalOpacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>
          <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="1" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
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
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width={width} height={height} fill="url(#bgGlow)" />

        {/* Stars */}
        {STARS.map((star, i) => {
          const twinkle = Math.sin((frame + star.twinkle) * 0.05) * 0.4 + 0.6;
          return (
            <circle
              key={`star-${i}`}
              cx={star.x}
              cy={star.y}
              r={star.r}
              fill="white"
              opacity={twinkle * 0.5}
            />
          );
        })}

        {/* Globe hint circle */}
        <ellipse
          cx={width * 0.5}
          cy={height * 0.47}
          rx={width * 0.44}
          ry={height * 0.42}
          fill="none"
          stroke="#0a2040"
          strokeWidth="1"
          opacity="0.4"
        />
        <ellipse
          cx={width * 0.5}
          cy={height * 0.47}
          rx={width * 0.44}
          ry={height * 0.42}
          fill="none"
          stroke="#0d3060"
          strokeWidth="0.5"
          opacity="0.3"
          filter="url(#blur1)"
        />

        {/* Latitude lines */}
        {[0.25, 0.37, 0.50, 0.63, 0.75].map((ly, i) => (
          <line
            key={`lat-${i}`}
            x1={width * 0.06}
            y1={height * ly}
            x2={width * 0.94}
            y2={height * ly}
            stroke="#0d2040"
            strokeWidth="0.5"
            opacity="0.3"
          />
        ))}

        {/* Connection arcs */}
        {CONNECTIONS.map(([a, b], ci) => {
          const cityA = CITIES[a];
          const cityB = CITIES[b];
          const activity = Math.sin((frame + ci * 17) * 0.03) * 0.5 + 0.5;
          return (
            <path
              key={`arc-${ci}`}
              d={getArcPath(cityA.x, cityA.y, cityB.x, cityB.y, width, height)}
              fill="none"
              stroke={`rgba(0, 180, 255, ${0.08 + activity * 0.12})`}
              strokeWidth={1 + activity * 2}
            />
          );
        })}

        {/* Glowing arc overlays */}
        {CONNECTIONS.map(([a, b], ci) => {
          const cityA = CITIES[a];
          const cityB = CITIES[b];
          const activity = Math.sin((frame + ci * 17) * 0.03) * 0.5 + 0.5;
          return (
            <path
              key={`arc-glow-${ci}`}
              d={getArcPath(cityA.x, cityA.y, cityB.x, cityB.y, width, height)}
              fill="none"
              stroke={`rgba(0, 200, 255, ${0.03 + activity * 0.07})`}
              strokeWidth={4 + activity * 6}
              filter="url(#blur1)"
            />
          );
        })}

        {/* Traveling particles on connections */}
        {CONNECTIONS.map(([a, b], ci) => {
          const cityA = CITIES[a];
          const cityB = CITIES[b];
          const p = PARTICLES[ci];
          const t = ((frame * p.speed * 0.01 + p.offset) % 1 + 1) % 1;
          const pos = getPointOnQuadratic(cityA.x, cityA.y, cityB.x, cityB.y, width, height, t);
          const activity = Math.sin((frame + ci * 17) * 0.03) * 0.5 + 0.5;
          const particleOpacity = 0.5 + activity * 0.5;

          // Trail particles
          const trailCount = 4;
          return (
            <g key={`particle-group-${ci}`}>
              {Array.from({ length: trailCount }, (_, ti) => {
                const trailT = ((t - (ti + 1) * 0.02 + 1) % 1 + 1) % 1;
                const trailPos = getPointOnQuadratic(cityA.x, cityA.y, cityB.x, cityB.y, width, height, trailT);
                return (
                  <circle
                    key={`trail-${ti}`}
                    cx={trailPos.x}
                    cy={trailPos.y}
                    r={3 - ti * 0.5}
                    fill="#00d4ff"
                    opacity={particleOpacity * (1 - ti * 0.25) * 0.4}
                  />
                );
              })}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={5}
                fill="#00eeff"
                opacity={particleOpacity}
                filter="url(#blur1)"
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={3}
                fill="white"
                opacity={particleOpacity * 0.9}
              />
            </g>
          );
        })}

        {/* City nodes */}
        {CITIES.map((city, ci) => {
          const cx = city.x * width;
          const cy = city.y * height;
          const pulseOffset = CITY_PULSE_OFFSETS[ci];
          
          // Count connections
          const connectionCount = CONNECTIONS.filter(([a, b]) => a === city.id || b === city.id).length;
          const baseSize = 6 + connectionCount * 2.5;

          // Breathing animation
          const breathPhase = Math.sin((frame + pulseOffset) * 0.06);
          const breathScale = 1 + breathPhase * 0.15;

          // Activity from nearby particles
          const activityLevel = CONNECTIONS.reduce((acc, [a, b], cni) => {
            if (a === city.id || b === city.id) {
              const p = PARTICLES[cni];
              const t = ((frame * p.speed * 0.01 + p.offset) % 1 + 1) % 1;
              const proximity = Math.max(0, 1 - Math.abs(t - 0) * 10, 1 - Math.abs(t - 1) * 10);
              return acc + proximity;
            }
            return acc;
          }, 0);

          const glowIntensity = Math.min(1, activityLevel * 0.5 + 0.3 + breathPhase * 0.2);

          // Pulse rings
          const pulsePhase1 = (frame + pulseOffset) % 90 / 90;
          const pulsePhase2 = ((frame + pulseOffset + 45) % 90) / 90;

          return (
            <g key={`city-${ci}`}>
              {/* Outer ambient glow */}
              <circle
                cx={cx}
                cy={cy}
                r={baseSize * breathScale * 4}
                fill={`rgba(0, 180, 255, ${glowIntensity * 0.08})`}
                filter="url(#blur2)"
              />

              {/* Pulse ring 1 */}
              <circle
                cx={cx}
                cy={cy}
                r={baseSize * (1 + pulsePhase1 * 3)}
                fill="none"
                stroke={`rgba(0, 200, 255, ${(1 - pulsePhase1) * 0.5})`}
                strokeWidth={1.5}
              />

              {/* Pulse ring 2 */}
              <circle
                cx={cx}
                cy={cy}
                r={baseSize * (1 + pulsePhase2 * 3)}
                fill="none"
                stroke={`rgba(0, 200, 255, ${(1 - pulsePhase2) * 0.3})`}
                strokeWidth={1}
              />

              {/* Core glow */}
              <circle
                cx={cx}
                cy={cy}
                r={baseSize * breathScale * 1.8}
                fill={`rgba(0, 160, 255, ${glowIntensity * 0.3})`}
                filter="url(#blur1)"
              />

              {/* Node body */}
              <circle
                cx={cx}
                cy={cy}
                r={baseSize * breathScale}
                fill={`rgba(0, 30, 60, 0.9)`}
                stroke={`rgba(0, 200, 255, ${0.6 + glowIntensity * 0.4})`}
                strokeWidth={2}
              />

              {/* Inner dot */}
              <circle
                cx={cx}
                cy={cy}
                r={baseSize * breathScale * 0.35}
                fill={`rgba(0, 220, 255, ${0.8 + glowIntensity * 0.2})`}
              />
            </g>
          );
        })}

        {/* Global overlay vignette */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="#020408" stopOpacity="0.7" />
        </radialGradient>
        <rect width={width} height={height} fill="url(#vignette)" />

        {/* Ambient global pulse */}
        {[0, 1, 2].map((ri) => {
          const globalPulse = ((frame + ri * 100) % 300) / 300;
          return (
            <circle
              key={`global-pulse-${ri}`}
              cx={width * 0.5}
              cy={height * 0.47}
              r={width * 0.05 + globalPulse * width * 0.45}
              fill="none"
              stroke={`rgba(0, 160, 255, ${(1 - globalPulse) * 0.04})`}
              strokeWidth={2}
            />
          );
        })}
      </svg>
    </div>
  );
};