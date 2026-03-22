import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const MERIDIAN_COUNT = 12;
const PARALLEL_COUNT = 8;
const STAR_COUNT = 200;

const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  x: (i * 2731 + 500) % 3840,
  y: (i * 1337 + 200) % 2160,
  r: ((i * 17) % 3) + 0.5,
  opacity: ((i * 43) % 60 + 30) / 100,
}));

export const SpinningGlobe: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const rotation = interpolate(frame, [0, durationInFrames], [0, Math.PI * 4]);
  const wobble = Math.sin(frame * 0.015) * 0.08;
  const tiltAngle = Math.PI / 6 + wobble;

  const cx = width / 2;
  const cy = height / 2;
  const R = Math.min(width, height) * 0.32;

  const project = (lat: number, lon: number) => {
    const x = Math.cos(lat) * Math.sin(lon);
    const y = Math.sin(lat);
    const z = Math.cos(lat) * Math.cos(lon);

    const cosT = Math.cos(tiltAngle);
    const sinT = Math.sin(tiltAngle);
    const y2 = y * cosT - z * sinT;
    const z2 = y * sinT + z * cosT;

    return {
      sx: x * R + cx,
      sy: y2 * R + cy,
      z: z2,
    };
  };

  const buildMeridian = (lonBase: number, segments = 80) => {
    const points: { sx: number; sy: number; z: number }[] = [];
    for (let i = 0; i <= segments; i++) {
      const lat = (i / segments) * Math.PI - Math.PI / 2;
      const lon = lonBase + rotation;
      points.push(project(lat, lon));
    }
    return points;
  };

  const buildParallel = (lat: number, segments = 120) => {
    const points: { sx: number; sy: number; z: number }[] = [];
    for (let i = 0; i <= segments; i++) {
      const lon = (i / segments) * Math.PI * 2 + rotation;
      points.push(project(lat, lon));
    }
    return points;
  };

  const segmentsToPath = (points: { sx: number; sy: number; z: number }[], onlyFront: boolean) => {
    let d = '';
    let penDown = false;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const visible = onlyFront ? p.z >= -0.05 : p.z < 0.05;
      if (visible) {
        if (!penDown) {
          d += `M ${p.sx.toFixed(2)} ${p.sy.toFixed(2)} `;
          penDown = true;
        } else {
          d += `L ${p.sx.toFixed(2)} ${p.sy.toFixed(2)} `;
        }
      } else {
        penDown = false;
      }
    }
    return d;
  };

  const meridianLines = Array.from({ length: MERIDIAN_COUNT }, (_, i) => {
    const lonBase = (i / MERIDIAN_COUNT) * Math.PI;
    return buildMeridian(lonBase);
  });

  const parallelLines = Array.from({ length: PARALLEL_COUNT }, (_, i) => {
    const lat = ((i + 1) / (PARALLEL_COUNT + 1)) * Math.PI - Math.PI / 2;
    return buildParallel(lat);
  });

  const equator = buildParallel(0);

  const pulseFront = 0.55 + Math.sin(frame * 0.04) * 0.08;
  const pulseBack = 0.18 + Math.sin(frame * 0.04 + Math.PI) * 0.04;

  const glowR1 = R * (1.02 + Math.sin(frame * 0.03) * 0.015);
  const glowR2 = R * (1.08 + Math.sin(frame * 0.025 + 1) * 0.02);

  return (
    <svg
      width={width}
      height={height}
      style={{ background: '#060608', display: 'block', opacity: globalOpacity }}
    >
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#0d0e18" />
          <stop offset="100%" stopColor="#020204" />
        </radialGradient>
        <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3a4a7a" stopOpacity="0.0" />
          <stop offset="70%" stopColor="#2a3a6a" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#1a2a5a" stopOpacity="0.35" />
        </radialGradient>
        <radialGradient id="innerGlow" cx="40%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="18" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="lineGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="globeClip">
          <circle cx={cx} cy={cy} r={R} />
        </clipPath>
      </defs>

      {/* Background */}
      <rect width={width} height={height} fill="url(#bgGrad)" />

      {/* Stars */}
      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#ffffff"
          opacity={s.opacity * (0.6 + Math.sin(frame * 0.02 + i) * 0.2)}
        />
      ))}

      {/* Outer atmospheric glow rings */}
      <circle cx={cx} cy={cy} r={glowR2} fill="none" stroke="#2a3d7a" strokeWidth={R * 0.055} opacity={0.18} />
      <circle cx={cx} cy={cy} r={glowR1} fill="none" stroke="#3a5090" strokeWidth={R * 0.04} opacity={0.25} />

      {/* Globe fill */}
      <circle cx={cx} cy={cy} r={R} fill="url(#globeGlow)" />
      <circle cx={cx} cy={cy} r={R} fill="url(#innerGlow)" />

      {/* Back meridians (dimmed) */}
      <g clipPath="url(#globeClip)" opacity={pulseBack} filter="url(#lineGlow)">
        {meridianLines.map((pts, i) => (
          <path
            key={`bm-${i}`}
            d={segmentsToPath(pts, false)}
            fill="none"
            stroke="#8899cc"
            strokeWidth={1.2}
            opacity={0.55}
          />
        ))}
        {parallelLines.map((pts, i) => (
          <path
            key={`bp-${i}`}
            d={segmentsToPath(pts, false)}
            fill="none"
            stroke="#8899cc"
            strokeWidth={1.0}
            opacity={0.45}
          />
        ))}
        <path
          d={segmentsToPath(equator, false)}
          fill="none"
          stroke="#aabbdd"
          strokeWidth={1.6}
          opacity={0.6}
        />
      </g>

      {/* Front meridians (bright) */}
      <g clipPath="url(#globeClip)" opacity={pulseFront} filter="url(#lineGlow)">
        {meridianLines.map((pts, i) => (
          <path
            key={`fm-${i}`}
            d={segmentsToPath(pts, true)}
            fill="none"
            stroke="#ddeeff"
            strokeWidth={1.6}
          />
        ))}
        {parallelLines.map((pts, i) => (
          <path
            key={`fp-${i}`}
            d={segmentsToPath(pts, true)}
            fill="none"
            stroke="#ccddf0"
            strokeWidth={1.3}
          />
        ))}
        <path
          d={segmentsToPath(equator, true)}
          fill="none"
          stroke="#ffffff"
          strokeWidth={2.2}
        />
      </g>

      {/* Outline circle */}
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke="#e8f0ff"
        strokeWidth={2.5}
        opacity={0.85}
        filter="url(#softGlow)"
      />

      {/* Specular highlight */}
      <ellipse
        cx={cx - R * 0.28}
        cy={cy - R * 0.3}
        rx={R * 0.18}
        ry={R * 0.1}
        fill="#ffffff"
        opacity={0.06}
        transform={`rotate(-30, ${cx - R * 0.28}, ${cy - R * 0.3})`}
      />
    </svg>
  );
};