import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NUM_SATELLITES = 12;
const NUM_CITIES = 8;
const NUM_ORBITS = 4;

const SATELLITES = Array.from({ length: NUM_SATELLITES }, (_, i) => ({
  orbitIndex: i % NUM_ORBITS,
  orbitRadius: 280 + (i % NUM_ORBITS) * 120,
  orbitTilt: (i * 23) % 60 - 30,
  orbitOffset: (i * 137) % 360,
  speed: 0.3 + ((i * 7) % 10) * 0.07,
  size: 6 + (i % 4) * 2,
  colorIndex: i % 5,
}));

const CITIES = Array.from({ length: NUM_CITIES }, (_, i) => ({
  x: 200 + (i * 431) % 3440,
  y: 600 + (i * 317) % 960,
  size: 12 + (i % 4) * 6,
  pulseOffset: (i * 45) % 360,
  nameOffset: i * 45,
}));

const ORBIT_COLORS = ['#00d4ff', '#7b61ff', '#ff6b35', '#00ff9d'];
const SAT_COLORS = ['#00d4ff', '#7b61ff', '#ff6b35', '#00ff9d', '#ffd700'];
const CITY_COLORS = ['#ff6b6b', '#ffd700', '#00ff9d', '#7b61ff', '#00d4ff', '#ff6b35', '#e040fb', '#40c4ff'];

const SIGNAL_PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  satIndex: i % NUM_SATELLITES,
  cityIndex: i % NUM_CITIES,
  offset: (i * 73) % 100,
  delay: (i * 17) % 80,
}));

const STARS = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731) % 3840,
  y: (i * 1337) % 2160,
  size: (i % 3) + 1,
  opacity: 0.2 + (i % 5) * 0.15,
}));

const GRID_LINES_H = Array.from({ length: 20 }, (_, i) => i);
const GRID_LINES_V = Array.from({ length: 36 }, (_, i) => i);

export const SatelliteNetworkAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const cx = width / 2;
  const cy = height / 2 - 100;

  const getSatPosition = (sat: typeof SATELLITES[0], f: number) => {
    const angle = ((f * sat.speed + sat.orbitOffset) * Math.PI) / 180;
    const tiltRad = (sat.orbitTilt * Math.PI) / 180;
    const x = cx + Math.cos(angle) * sat.orbitRadius * 1.8;
    const y = cy + Math.sin(angle) * sat.orbitRadius * Math.cos(tiltRad) * 0.6;
    return { x, y };
  };

  return (
    <div style={{ width, height, background: '#030912', opacity: globalOpacity, overflow: 'hidden', position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#0a1628" stopOpacity="1" />
            <stop offset="100%" stopColor="#030912" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a3a6e" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#0d1f3c" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#030912" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
          </radialGradient>
          {SAT_COLORS.map((color, i) => (
            <radialGradient key={i} id={`satGlow${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          ))}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="cityGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="20" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background gradient */}
        <rect width={width} height={height} fill="url(#bgGlow)" />

        {/* Stars */}
        {STARS.map((star, i) => {
          const twinkle = interpolate(
            (frame * 0.5 + i * 7) % 60,
            [0, 30, 60],
            [star.opacity, star.opacity * 0.3, star.opacity]
          );
          return (
            <circle key={i} cx={star.x} cy={star.y} r={star.size} fill="white" opacity={twinkle} />
          );
        })}

        {/* Grid overlay */}
        {GRID_LINES_H.map((i) => (
          <line
            key={`h${i}`}
            x1={0} y1={(i / 20) * height}
            x2={width} y2={(i / 20) * height}
            stroke="#00d4ff" strokeWidth="0.5" opacity="0.04"
          />
        ))}
        {GRID_LINES_V.map((i) => (
          <line
            key={`v${i}`}
            x1={(i / 36) * width} y1={0}
            x2={(i / 36) * width} y2={height}
            stroke="#00d4ff" strokeWidth="0.5" opacity="0.04"
          />
        ))}

        {/* Earth sphere */}
        <ellipse
          cx={cx} cy={cy}
          rx={520} ry={320}
          fill="url(#earthGlow)"
          opacity={0.7}
        />
        <ellipse
          cx={cx} cy={cy}
          rx={500} ry={300}
          fill="none"
          stroke="#1a4a8a"
          strokeWidth="1.5"
          opacity={0.4}
        />
        {/* Earth surface lines */}
        {Array.from({ length: 8 }, (_, i) => {
          const lat = -3 + i * (6 / 8);
          return (
            <ellipse
              key={i}
              cx={cx} cy={cy + lat * 50}
              rx={500 * Math.cos(lat * 0.5)}
              ry={30 * Math.cos(lat * 0.3)}
              fill="none" stroke="#2a5a9a" strokeWidth="0.8" opacity="0.25"
            />
          );
        })}
        {Array.from({ length: 12 }, (_, i) => {
          const lon = (i / 12) * Math.PI * 2;
          const x1 = cx + Math.cos(lon) * 500;
          const y1 = cy - 300;
          const x2 = cx + Math.cos(lon + Math.PI) * 500;
          const y2 = cy + 300;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} Q ${cx + Math.cos(lon + Math.PI / 2) * 520} ${cy} ${x2} ${y2}`}
              fill="none" stroke="#2a5a9a" strokeWidth="0.8" opacity="0.2"
            />
          );
        })}

        {/* Orbit ellipses */}
        {Array.from({ length: NUM_ORBITS }, (_, oi) => {
          const r = 280 + oi * 120;
          const tilt = (oi * 23 - 30) * Math.PI / 180;
          const pulse = interpolate((frame * 0.5 + oi * 30) % 60, [0, 30, 60], [0.15, 0.35, 0.15]);
          return (
            <ellipse
              key={oi}
              cx={cx} cy={cy}
              rx={r * 1.8}
              ry={r * Math.cos(tilt) * 0.6}
              fill="none"
              stroke={ORBIT_COLORS[oi]}
              strokeWidth="1"
              strokeDasharray="8 16"
              opacity={pulse}
            />
          );
        })}

        {/* Signal lines from satellites to cities */}
        {SIGNAL_PARTICLES.map((sp, i) => {
          const sat = SATELLITES[sp.satIndex];
          const city = CITIES[sp.cityIndex];
          const satPos = getSatPosition(sat, frame);
          const progress = ((frame + sp.delay * 3) % 90) / 90;
          const opacity = interpolate(progress, [0, 0.1, 0.8, 1], [0, 0.6, 0.6, 0]);
          const px = satPos.x + (city.x - satPos.x) * progress;
          const py = satPos.y + (city.y - satPos.y) * progress;

          const dist = Math.hypot(city.x - satPos.x, city.y - satPos.y);
          const visible = dist < 1200;

          if (!visible) return null;

          return (
            <g key={i} opacity={opacity * 0.5}>
              <line
                x1={satPos.x} y1={satPos.y}
                x2={city.x} y2={city.y}
                stroke={SAT_COLORS[sat.colorIndex]}
                strokeWidth="0.5"
                opacity={0.08}
              />
              <circle cx={px} cy={py} r={3} fill={SAT_COLORS[sat.colorIndex]} filter="url(#glow)" />
            </g>
          );
        })}

        {/* Active beam lines */}
        {SATELLITES.map((sat, si) => {
          const satPos = getSatPosition(sat, frame);
          const cityIdx = si % NUM_CITIES;
          const city = CITIES[cityIdx];
          const beamStrength = interpolate(
            (frame * 0.8 + si * 25) % 120,
            [0, 20, 60, 100, 120],
            [0, 0.8, 1, 0.8, 0]
          );
          return (
            <line
              key={si}
              x1={satPos.x} y1={satPos.y}
              x2={city.x} y2={city.y}
              stroke={SAT_COLORS[sat.colorIndex]}
              strokeWidth={1.5}
              opacity={beamStrength * 0.4}
              filter="url(#glow)"
            />
          );
        })}

        {/* Cities */}
        {CITIES.map((city, ci) => {
          const pulsePhase = (frame * 0.8 + city.pulseOffset) % 120;
          const pulseScale = interpolate(pulsePhase, [0, 60, 120], [1, 2.5, 1]);
          const pulseOpacity = interpolate(pulsePhase, [0, 60, 120], [0.8, 0, 0.8]);
          const innerPulse = interpolate(
            (frame * 0.5 + city.pulseOffset + 30) % 80,
            [0, 40, 80],
            [1, 1.5, 1]
          );
          const color = CITY_COLORS[ci];

          return (
            <g key={ci}>
              {/* Outer pulse ring */}
              <circle
                cx={city.x} cy={city.y}
                r={city.size * pulseScale}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                opacity={pulseOpacity * 0.5}
              />
              {/* Secondary pulse */}
              <circle
                cx={city.x} cy={city.y}
                r={city.size * 1.8}
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity={0.3}
              />
              {/* Glow halo */}
              <circle
                cx={city.x} cy={city.y}
                r={city.size * 2}
                fill={color}
                opacity={0.08}
                filter="url(#cityGlow)"
              />
              {/* Core */}
              <circle
                cx={city.x} cy={city.y}
                r={city.size * innerPulse}
                fill={color}
                opacity={0.9}
                filter="url(#strongGlow)"
              />
              <circle
                cx={city.x} cy={city.y}
                r={city.size * 0.5}
                fill="white"
                opacity={0.95}
              />
              {/* Cross marker */}
              <line x1={city.x - 20} y1={city.y} x2={city.x + 20} y2={city.y} stroke={color} strokeWidth="1" opacity="0.5" />
              <line x1={city.x} y1={city.y - 20} x2={city.x} y2={city.y + 20} stroke={color} strokeWidth="1" opacity="0.5" />
            </g>
          );
        })}

        {/* Satellites */}
        {SATELLITES.map((sat, si) => {
          const pos = getSatPosition(sat, frame);
          const color = SAT_COLORS[sat.colorIndex];
          const rotAngle = (frame * sat.speed * 2 + sat.orbitOffset) % 360;

          return (
            <g key={si} transform={`translate(${pos.x}, ${pos.y})`}>
              {/* Satellite glow */}
              <circle r={sat.size * 4} fill={color} opacity={0.08} filter="url(#cityGlow)" />
              {/* Body */}
              <rect
                x={-sat.size} y={-sat.size * 0.4}
                width={sat.size * 2} height={sat.size * 0.8}
                fill={color}
                opacity={0.9}
                transform={`rotate(${rotAngle})`}
                filter="url(#glow)"
              />
              {/* Solar panels */}
              <rect
                x={-sat.size * 3.5} y={-sat.size * 1.2}
                width={sat.size * 2.5} height={sat.size * 2.4}
                fill={color}
                opacity={0.5}
                transform={`rotate(${rotAngle})`}
              />
              <rect
                x={sat.size} y={-sat.size * 1.2}
                width={sat.size * 2.5} height={sat.size * 2.4}
                fill={color}
                opacity={0.5}
                transform={`rotate(${rotAngle})`}
              />
              {/* Core dot */}
              <circle r={sat.size * 0.5} fill="white" opacity={0.9} />
            </g>
          );
        })}

        {/* Central network hub glow */}
        <circle
          cx={cx} cy={cy}
          r={interpolate((frame * 0.5) % 60, [0, 30, 60], [60, 100, 60])}
          fill="url(#centerGlow)"
          opacity={0.4}
        />

        {/* Scan line effect */}
        {(() => {
          const scanY = ((frame * 3) % (height + 200)) - 100;
          return (
            <rect
              x={0} y={scanY}
              width={width} height={3}
              fill="#00d4ff"
              opacity={0.04}
            />
          );
        })()}

        {/* Corner frame decorations */}
        {[
          [0, 0, 1, 1],
          [width, 0, -1, 1],
          [0, height, 1, -1],
          [width, height, -1, -1],
        ].map(([x, y, sx, sy], i) => (
          <g key={i} transform={`translate(${x}, ${y}) scale(${sx}, ${sy})`}>
            <line x1={0} y1={0} x2={120} y2={0} stroke="#00d4ff" strokeWidth="2" opacity={0.5} />
            <line x1={0} y1={0} x2={0} y2={120} stroke="#00d4ff" strokeWidth="2" opacity={0.5} />
            <circle cx={0} cy={0} r={8} fill="none" stroke="#00d4ff" strokeWidth="2" opacity={0.5} />
            <circle cx={0} cy={0} r={3} fill="#00d4ff" opacity={0.7} />
          </g>
        ))}

        {/* Data rings around earth */}
        {Array.from({ length: 3 }, (_, i) => {
          const angle = ((frame * (0.2 + i * 0.1)) % 360) * Math.PI / 180;
          const r = 560 + i * 80;
          const dashOffset = frame * (1 + i * 0.5);
          return (
            <ellipse
              key={i}
              cx={cx} cy={cy}
              rx={r * 1.8}
              ry={r * 0.35}
              fill="none"
              stroke={ORBIT_COLORS[i]}
              strokeWidth="0.8"
              strokeDasharray={`4 ${20 + i * 10}`}
              strokeDashoffset={-dashOffset}
              opacity={0.15}
            />
          );
        })}
      </svg>
    </div>
  );
};