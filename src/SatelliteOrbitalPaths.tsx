import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const SatelliteOrbitalPaths: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const cx = width / 2;
  const cy = height / 2;
  const globeR = 200;

  const t = frame / 30;

  // Globe wireframe latitude/longitude lines
  const latLines: React.ReactNode[] = [];
  const numLat = 9;
  for (let i = 0; i < numLat; i++) {
    const lat = -80 + (i * 160) / (numLat - 1);
    const latRad = (lat * Math.PI) / 180;
    const r = globeR * Math.cos(latRad);
    const y = globeR * Math.sin(latRad);
    latLines.push(
      <ellipse
        key={`lat-${i}`}
        cx={cx}
        cy={cy + y}
        rx={r}
        ry={r * 0.35}
        fill="none"
        stroke="rgba(100,180,255,0.25)"
        strokeWidth="0.8"
      />
    );
  }

  const lonLines: React.ReactNode[] = [];
  const numLon = 12;
  const globeRotation = t * 8;
  for (let i = 0; i < numLon; i++) {
    const angle = (i * 180) / numLon + globeRotation;
    const angleRad = (angle * Math.PI) / 180;
    const rx = globeR * Math.abs(Math.cos(angleRad));
    const skewX = Math.sin(angleRad) * 15;
    lonLines.push(
      <ellipse
        key={`lon-${i}`}
        cx={cx}
        cy={cy}
        rx={rx < 2 ? 2 : rx}
        ry={globeR}
        fill="none"
        stroke="rgba(100,180,255,0.2)"
        strokeWidth="0.8"
        transform={`skewX(${skewX})`}
      />
    );
  }

  // Satellites with orbital paths
  const satellites = [
    { a: 340, b: 120, tiltDeg: 30, speed: 0.4, color: '#00ffff', trailColor: 'rgba(0,255,255,0.3)', size: 6 },
    { a: 290, b: 100, tiltDeg: -55, speed: 0.6, color: '#ff6060', trailColor: 'rgba(255,96,96,0.3)', size: 5 },
    { a: 380, b: 140, tiltDeg: 70, speed: 0.25, color: '#aaff88', trailColor: 'rgba(170,255,136,0.25)', size: 7 },
    { a: 260, b: 90, tiltDeg: 15, speed: 0.8, color: '#ffdd44', trailColor: 'rgba(255,221,68,0.3)', size: 5 },
    { a: 320, b: 110, tiltDeg: -80, speed: 0.5, color: '#cc88ff', trailColor: 'rgba(204,136,255,0.3)', size: 6 },
  ];

  const renderOrbitEllipse = (sat: typeof satellites[0], idx: number) => {
    const tiltRad = (sat.tiltDeg * Math.PI) / 180;
    return (
      <ellipse
        key={`orbit-${idx}`}
        cx={cx}
        cy={cy}
        rx={sat.a}
        ry={sat.b}
        fill="none"
        stroke={sat.trailColor}
        strokeWidth="1.5"
        strokeDasharray="6 4"
        transform={`rotate(${sat.tiltDeg}, ${cx}, ${cy})`}
      />
    );
  };

  const renderSatellite = (sat: typeof satellites[0], idx: number) => {
    const angle = t * sat.speed * Math.PI * 2 + idx * 1.3;
    const tiltRad = (sat.tiltDeg * Math.PI) / 180;

    const lx = sat.a * Math.cos(angle);
    const ly = sat.b * Math.sin(angle);

    const rx = lx * Math.cos(tiltRad) - ly * Math.sin(tiltRad);
    const ry = lx * Math.sin(tiltRad) + ly * Math.cos(tiltRad);

    const sx = cx + rx;
    const sy = cy + ry;

    const glowSize = sat.size + 8 + Math.sin(t * 3 + idx) * 2;

    // Trail points
    const trailPoints: { x: number; y: number }[] = [];
    const trailLen = 30;
    for (let k = 1; k <= trailLen; k++) {
      const pa = angle - k * 0.04;
      const plx = sat.a * Math.cos(pa);
      const ply = sat.b * Math.sin(pa);
      const prx = plx * Math.cos(tiltRad) - ply * Math.sin(tiltRad);
      const pry = plx * Math.sin(tiltRad) + ply * Math.cos(tiltRad);
      trailPoints.push({ x: cx + prx, y: cy + pry });
    }

    return (
      <g key={`sat-${idx}`}>
        {trailPoints.map((p, k) => (
          <circle
            key={k}
            cx={p.x}
            cy={p.y}
            r={sat.size * 0.4 * (1 - k / trailLen)}
            fill={sat.color}
            opacity={(1 - k / trailLen) * 0.5}
          />
        ))}
        {/* Glow */}
        <circle cx={sx} cy={sy} r={glowSize} fill={sat.color} opacity={0.12} />
        <circle cx={sx} cy={sy} r={glowSize * 0.6} fill={sat.color} opacity={0.2} />
        {/* Core */}
        <circle cx={sx} cy={sy} r={sat.size} fill={sat.color} opacity={0.95} />
        {/* Solar panels */}
        <rect
          x={sx - sat.size * 3}
          y={sy - sat.size * 0.4}
          width={sat.size * 2}
          height={sat.size * 0.8}
          fill={sat.color}
          opacity={0.7}
          transform={`rotate(${angle * 40}, ${sx}, ${sy})`}
        />
        <rect
          x={sx + sat.size}
          y={sy - sat.size * 0.4}
          width={sat.size * 2}
          height={sat.size * 0.8}
          fill={sat.color}
          opacity={0.7}
          transform={`rotate(${angle * 40}, ${sx}, ${sy})`}
        />
      </g>
    );
  };

  // Stars
  const stars: React.ReactNode[] = [];
  const numStars = 200;
  for (let i = 0; i < numStars; i++) {
    const seed1 = Math.sin(i * 127.1) * 43758.5453;
    const seed2 = Math.sin(i * 311.7) * 43758.5453;
    const seed3 = Math.sin(i * 74.3) * 43758.5453;
    const sx = ((seed1 - Math.floor(seed1)) * width);
    const sy = ((seed2 - Math.floor(seed2)) * height);
    const sr = (seed3 - Math.floor(seed3)) * 1.8 + 0.3;
    const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.8 + i * 0.4));
    stars.push(
      <circle key={`star-${i}`} cx={sx} cy={sy} r={sr} fill="white" opacity={twinkle * 0.8} />
    );
  }

  // Globe glow
  const globeGlow = 0.4 + 0.1 * Math.sin(t * 0.5);

  return (
    <div style={{ width, height, background: '#03040a', overflow: 'hidden', opacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="globeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0a2a4a" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#051830" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#020c18" stopOpacity="0.3" />
          </radialGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a6aff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1a6aff" stopOpacity="0" />
          </radialGradient>
          <filter id="blur4">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <clipPath id="globeClip">
            <circle cx={cx} cy={cy} r={globeR} />
          </clipPath>
        </defs>

        {/* Stars */}
        {stars}

        {/* Globe outer glow */}
        <circle cx={cx} cy={cy} r={globeR + 60} fill="url(#glowGrad)" opacity={globeGlow} filter="url(#blur4)" />

        {/* Orbit ellipses */}
        {satellites.map((sat, idx) => renderOrbitEllipse(sat, idx))}

        {/* Globe base */}
        <circle cx={cx} cy={cy} r={globeR} fill="url(#globeGrad)" />

        {/* Globe wireframe */}
        <g clipPath="url(#globeClip)">
          {latLines}
          {lonLines}
        </g>

        {/* Globe border */}
        <circle cx={cx} cy={cy} r={globeR} fill="none" stroke="rgba(100,180,255,0.5)" strokeWidth="1.5" />

        {/* Globe highlight */}
        <ellipse
          cx={cx - globeR * 0.25}
          cy={cy - globeR * 0.3}
          rx={globeR * 0.35}
          ry={globeR * 0.2}
          fill="rgba(180,220,255,0.06)"
        />

        {/* Satellites */}
        {satellites.map((sat, idx) => renderSatellite(sat, idx))}

        {/* Center glow pulse */}
        <circle
          cx={cx}
          cy={cy}
          r={globeR * (1.05 + 0.03 * Math.sin(t * 1.5))}
          fill="none"
          stroke="rgba(80,160,255,0.15)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};