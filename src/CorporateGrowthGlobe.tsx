import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const TERRITORIES = Array.from({ length: 48 }, (_, i) => ({
  lat: ((i * 137.508) % 160) - 80,
  lng: ((i * 97.3) % 360) - 180,
  size: ((i % 5) + 2) * 8,
  pulseOffset: (i * 23) % 60,
  connectionTarget: (i + 3) % 48,
  glowColor: i % 3 === 0 ? '#00f5ff' : i % 3 === 1 ? '#7c3aed' : '#06ffa5',
  revealFrame: Math.floor((i / 48) * 400) + 30,
}));

const GRID_LINES_LAT = Array.from({ length: 13 }, (_, i) => ({
  lat: i * 15 - 90,
}));

const GRID_LINES_LNG = Array.from({ length: 24 }, (_, i) => ({
  lng: i * 15 - 180,
}));

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  angle: (i * 137.508) % 360,
  radius: ((i * 73) % 40) + 5,
  speed: ((i * 17) % 30) + 10,
  size: ((i % 4) + 1) * 2,
  color: i % 4 === 0 ? '#00f5ff' : i % 4 === 1 ? '#7c3aed' : i % 4 === 2 ? '#06ffa5' : '#fff',
  orbitTilt: ((i * 43) % 60) - 30,
}));

function latLngToXY(lat: number, lng: number, rotationDeg: number, cx: number, cy: number, r: number) {
  const adjustedLng = lng + rotationDeg;
  const x = cx + r * Math.cos((lat * Math.PI) / 180) * Math.sin((adjustedLng * Math.PI) / 180);
  const y = cy - r * Math.sin((lat * Math.PI) / 180);
  const z = Math.cos((lat * Math.PI) / 180) * Math.cos((adjustedLng * Math.PI) / 180);
  return { x, y, z };
}

function isVisible(z: number) {
  return z > 0;
}

export const CorporateGrowthGlobe: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const rotation = interpolate(frame, [0, durationInFrames], [0, 360]);
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.32;

  const globePulse = 1 + Math.sin((frame / 30) * Math.PI) * 0.008;

  return (
    <div style={{ width, height, background: '#020408', opacity, position: 'relative', overflow: 'hidden' }}>
      {/* Deep space background */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0a0f1e" />
            <stop offset="60%" stopColor="#050810" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>
          <radialGradient id="globeGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#0d2040" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#060d1f" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#020810" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="glowOuter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a4080" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#0a1a40" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#020408" stopOpacity="0" />
          </radialGradient>
          <filter id="glow1">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="20" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="40" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="globeClip">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>

        <rect width={width} height={height} fill="url(#bgGrad)" />

        {/* Starfield */}
        {Array.from({ length: 200 }, (_, i) => {
          const sx = (i * 1731 + 500) % width;
          const sy = (i * 1337 + 200) % height;
          const ss = ((i % 3) + 1) * 1.5;
          const twinkle = 0.4 + 0.6 * Math.abs(Math.sin((frame / 60 + i * 0.3) * Math.PI));
          return (
            <circle key={`star-${i}`} cx={sx} cy={sy} r={ss} fill="white" opacity={twinkle * 0.6} />
          );
        })}

        {/* Outer atmospheric glow */}
        <circle cx={cx} cy={cy} r={r * 1.25} fill="url(#glowOuter)" />
        <circle cx={cx} cy={cy} r={r * 1.12} fill="none" stroke="#1a6090" strokeWidth="2" opacity="0.3" />
        <circle cx={cx} cy={cy} r={r * 1.08} fill="none" stroke="#00f5ff" strokeWidth="1" opacity={0.15 + 0.1 * Math.sin(frame / 45)} />

        {/* Atmosphere ring */}
        <circle
          cx={cx} cy={cy} r={r * 1.04}
          fill="none"
          stroke="#00aaff"
          strokeWidth={r * 0.04}
          opacity={0.08 + 0.04 * Math.sin(frame / 30)}
          filter="url(#softGlow)"
        />

        {/* Globe base */}
        <circle cx={cx} cy={cy} r={r * globePulse} fill="url(#globeGrad)" />

        {/* Grid lines - latitude */}
        {GRID_LINES_LAT.map((line, i) => {
          const points: string[] = [];
          for (let lng = -180; lng <= 180; lng += 3) {
            const { x, y, z } = latLngToXY(line.lat, lng, rotation, cx, cy, r);
            if (isVisible(z)) {
              points.push(`${x},${y}`);
            }
          }
          if (points.length < 2) return null;
          return (
            <polyline
              key={`lat-${i}`}
              points={points.join(' ')}
              fill="none"
              stroke="#1a4070"
              strokeWidth="1.5"
              opacity={0.5}
              clipPath="url(#globeClip)"
            />
          );
        })}

        {/* Grid lines - longitude */}
        {GRID_LINES_LNG.map((line, i) => {
          const points: string[] = [];
          for (let lat = -90; lat <= 90; lat += 3) {
            const { x, y, z } = latLngToXY(lat, line.lng, rotation, cx, cy, r);
            if (isVisible(z)) {
              points.push(`${x},${y}`);
            }
          }
          if (points.length < 2) return null;
          return (
            <polyline
              key={`lng-${i}`}
              points={points.join(' ')}
              fill="none"
              stroke="#1a4070"
              strokeWidth="1.5"
              opacity={0.5}
              clipPath="url(#globeClip)"
            />
          );
        })}

        {/* Territory connections */}
        {TERRITORIES.map((t, i) => {
          if (frame < t.revealFrame) return null;
          const target = TERRITORIES[t.connectionTarget];
          if (frame < target.revealFrame) return null;

          const p1 = latLngToXY(t.lat, t.lng, rotation, cx, cy, r);
          const p2 = latLngToXY(target.lat, target.lng, rotation, cx, cy, r);

          if (!isVisible(p1.z) || !isVisible(p2.z)) return null;

          const progressFade = interpolate(frame, [t.revealFrame, t.revealFrame + 30], [0, 1], { extrapolateRight: 'clamp' });
          const arcMidX = (p1.x + p2.x) / 2;
          const arcMidY = (p1.y + p2.y) / 2 - Math.abs(p2.x - p1.x) * 0.3;
          const dashOffset = -(frame * 4) % 60;

          return (
            <path
              key={`conn-${i}`}
              d={`M ${p1.x} ${p1.y} Q ${arcMidX} ${arcMidY} ${p2.x} ${p2.y}`}
              fill="none"
              stroke={t.glowColor}
              strokeWidth="2"
              strokeDasharray="8,6"
              strokeDashoffset={dashOffset}
              opacity={progressFade * 0.6}
              filter="url(#glow1)"
              clipPath="url(#globeClip)"
            />
          );
        })}

        {/* Territories */}
        {TERRITORIES.map((t, i) => {
          if (frame < t.revealFrame) return null;
          const { x, y, z } = latLngToXY(t.lat, t.lng, rotation, cx, cy, r);
          if (!isVisible(z)) return null;

          const progressFade = interpolate(frame, [t.revealFrame, t.revealFrame + 40], [0, 1], { extrapolateRight: 'clamp' });
          const pulse = 1 + 0.3 * Math.sin(((frame + t.pulseOffset) / 25) * Math.PI);
          const ringPulse = 1 + 0.5 * Math.abs(Math.sin(((frame + t.pulseOffset) / 40) * Math.PI));

          return (
            <g key={`territory-${i}`} opacity={progressFade}>
              {/* Outer glow ring */}
              <circle cx={x} cy={y} r={t.size * 1.8 * ringPulse} fill={t.glowColor} opacity={0.08} filter="url(#softGlow)" />
              {/* Pulse ring */}
              <circle cx={x} cy={y} r={t.size * pulse} fill="none" stroke={t.glowColor} strokeWidth="2" opacity={0.4} />
              {/* Main dot */}
              <circle cx={x} cy={y} r={t.size * 0.5} fill={t.glowColor} opacity={0.9} filter="url(#glow1)" />
              {/* Inner bright core */}
              <circle cx={x} cy={y} r={t.size * 0.2} fill="white" opacity={0.95} />
            </g>
          );
        })}

        {/* Orbiting particles */}
        {PARTICLES.map((p, i) => {
          const angle = ((frame * 360) / (p.speed * 30) + p.angle) % 360;
          const tilt = p.orbitTilt * Math.PI / 180;
          const a = (angle * Math.PI) / 180;
          const orbitR = r * (0.9 + p.radius / 100);
          const px = cx + orbitR * Math.cos(a) * Math.cos(tilt);
          const py = cy + orbitR * (Math.sin(a) * 0.4 + Math.cos(a) * Math.sin(tilt) * 0.3);
          const pz = Math.sin(a) * Math.cos(tilt);
          if (pz < 0) return null;
          return (
            <circle key={`particle-${i}`} cx={px} cy={py} r={p.size} fill={p.color} opacity={0.5 * pz} filter="url(#glow1)" />
          );
        })}

        {/* Globe shine overlay */}
        <ellipse
          cx={cx - r * 0.25}
          cy={cy - r * 0.3}
          rx={r * 0.35}
          ry={r * 0.22}
          fill="white"
          opacity="0.04"
        />

        {/* Equator highlight */}
        {(() => {
          const points: string[] = [];
          for (let lng = -180; lng <= 180; lng += 2) {
            const { x, y, z } = latLngToXY(0, lng, rotation, cx, cy, r);
            if (isVisible(z)) points.push(`${x},${y}`);
          }
          return (
            <polyline
              points={points.join(' ')}
              fill="none"
              stroke="#00f5ff"
              strokeWidth="2"
              opacity={0.25}
              filter="url(#glow1)"
              clipPath="url(#globeClip)"
            />
          );
        })()}

        {/* Counter display - circular progress ring */}
        {(() => {
          const revealed = TERRITORIES.filter(t => frame >= t.revealFrame).length;
          const totalReveal = TERRITORIES.length;
          const progress = revealed / totalReveal;
          const ringR = r * 1.35;
          const circumference = 2 * Math.PI * ringR;
          const dashOffset = circumference * (1 - progress);
          return (
            <circle
              cx={cx}
              cy={cy}
              r={ringR}
              fill="none"
              stroke="#00f5ff"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              opacity={0.5}
              transform={`rotate(-90, ${cx}, ${cy})`}
              filter="url(#glow1)"
            />
          );
        })()}

        {/* Data streams - radial lines */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30 + frame * 0.5) % 360;
          const rad = (angle * Math.PI) / 180;
          const x1 = cx + (r * 1.1) * Math.cos(rad);
          const y1 = cy + (r * 1.1) * Math.sin(rad);
          const x2 = cx + (r * 1.4) * Math.cos(rad);
          const y2 = cy + (r * 1.4) * Math.sin(rad);
          const streamOpacity = 0.15 + 0.15 * Math.abs(Math.sin((frame / 30 + i * 0.5) * Math.PI));
          return (
            <line
              key={`stream-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#00f5ff"
              strokeWidth="2"
              opacity={streamOpacity}
              filter="url(#glow1)"
            />
          );
        })}

        {/* Corner accent lines */}
        <line x1={0} y1={0} x2={width * 0.1} y2={0} stroke="#00f5ff" strokeWidth="3" opacity="0.4" />
        <line x1={0} y1={0} x2={0} y2={height * 0.1} stroke="#00f5ff" strokeWidth="3" opacity="0.4" />
        <line x1={width} y1={0} x2={width * 0.9} y2={0} stroke="#00f5ff" strokeWidth="3" opacity="0.4" />
        <line x1={width} y1={0} x2={width} y2={height * 0.1} stroke="#00f5ff" strokeWidth="3" opacity="0.4" />
        <line x1={0} y1={height} x2={width * 0.1} y2={height} stroke="#00f5ff" strokeWidth="3" opacity="0.4" />
        <line x1={0} y1={height} x2={0} y2={height * 0.9} stroke="#00f5ff" strokeWidth="3" opacity="0.4" />
        <line x1={width} y1={height} x2={width * 0.9} y2={height} stroke="#00f5ff" strokeWidth="3" opacity="0.4" />
        <line x1={width} y1={height} x2={width} y2={height * 0.9} stroke="#00f5ff" strokeWidth="3" opacity="0.4" />
      </svg>
    </div>
  );
};