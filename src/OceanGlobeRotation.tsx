import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NUM_STARS = 200;
const STARS = Array.from({ length: NUM_STARS }, (_, i) => ({
  x: (i * 2371 + 137) % 3840,
  y: (i * 1733 + 251) % 2160,
  size: ((i * 97) % 4) + 1,
  opacity: ((i * 53) % 60 + 40) / 100,
}));

const NUM_OCEAN_PATCHES = 60;
const OCEAN_PATCHES = Array.from({ length: NUM_OCEAN_PATCHES }, (_, i) => ({
  angleOffset: (i * 137.5) % 360,
  latOffset: ((i * 73) % 180) - 90,
  size: ((i * 41) % 120) + 40,
  opacity: ((i * 29) % 40 + 15) / 100,
  speed: ((i * 17) % 30 + 10) / 100,
  depth: ((i * 61) % 3),
}));

const NUM_CLOUD_PATCHES = 30;
const CLOUD_PATCHES = Array.from({ length: NUM_CLOUD_PATCHES }, (_, i) => ({
  angleOffset: (i * 113.7) % 360,
  lat: ((i * 89) % 140) - 70,
  width: ((i * 43) % 200) + 80,
  height: ((i * 37) % 60) + 20,
  opacity: ((i * 23) % 35 + 10) / 100,
  speed: ((i * 19) % 20 + 5) / 100,
}));

const NUM_LAND_MASSES = 12;
const LAND_MASSES = Array.from({ length: NUM_LAND_MASSES }, (_, i) => ({
  angleOffset: (i * 89.3) % 360,
  lat: ((i * 67) % 120) - 60,
  rx: ((i * 53) % 90) + 40,
  ry: ((i * 47) % 60) + 30,
  opacity: ((i * 31) % 30 + 45) / 100,
  speed: ((i * 13) % 20 + 8) / 100,
}));

function projectToSphere(
  angleDeg: number,
  latDeg: number,
  cx: number,
  cy: number,
  R: number
): { x: number; y: number; visible: boolean; scale: number } {
  const lon = (angleDeg % 360) * (Math.PI / 180);
  const lat = latDeg * (Math.PI / 180);
  const x3 = Math.cos(lat) * Math.cos(lon);
  const y3 = Math.sin(lat);
  const z3 = Math.cos(lat) * Math.sin(lon);
  const visible = z3 > -0.15;
  const scale = 0.4 + 0.6 * ((z3 + 1) / 2);
  const px = cx + x3 * R;
  const py = cy - y3 * R;
  return { x: px, y: py, visible, scale };
}

export const OceanGlobeRotation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const masterOpacity = Math.min(fadeIn, fadeOut);

  const cx = width / 2;
  const cy = height / 2;
  const R = Math.min(width, height) * 0.38;

  const rotationDeg = (frame / durationInFrames) * 360 * 1.5;
  const slowPulse = Math.sin(frame * 0.015) * 0.5 + 0.5;
  const rimPulse = 0.7 + 0.3 * Math.sin(frame * 0.02);

  const gradientId = 'oceanGrad';
  const rimGlowId = 'rimGlow';
  const atmosphereId = 'atmosphereGrad';
  const specularId = 'specularGrad';
  const deepOceanId = 'deepOcean';
  const shadowId = 'shadowGrad';

  return (
    <div style={{ width, height, background: '#000', overflow: 'hidden', opacity: masterOpacity }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          {/* Deep space background */}
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#060a14" />
            <stop offset="60%" stopColor="#020408" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          {/* Ocean base gradient */}
          <radialGradient id={gradientId} cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#1a4a7a" />
            <stop offset="25%" stopColor="#0d2e52" />
            <stop offset="55%" stopColor="#071a35" />
            <stop offset="80%" stopColor="#040f20" />
            <stop offset="100%" stopColor="#020810" />
          </radialGradient>

          {/* Deep ocean overlay */}
          <radialGradient id={deepOceanId} cx="60%" cy="65%" r="50%">
            <stop offset="0%" stopColor="#0a2540" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#010810" stopOpacity="0.8" />
          </radialGradient>

          {/* Atmospheric rim glow */}
          <radialGradient id={rimGlowId} cx="50%" cy="50%" r="50%">
            <stop offset="75%" stopColor="transparent" stopOpacity="0" />
            <stop offset="88%" stopColor="#1a6aaa" stopOpacity={0.15 * rimPulse} />
            <stop offset="94%" stopColor="#3a9ae8" stopOpacity={0.45 * rimPulse} />
            <stop offset="98%" stopColor="#60c4ff" stopOpacity={0.7 * rimPulse} />
            <stop offset="100%" stopColor="#90d8ff" stopOpacity={0.85 * rimPulse} />
          </radialGradient>

          {/* Atmosphere haze */}
          <radialGradient id={atmosphereId} cx="50%" cy="50%" r="50%">
            <stop offset="80%" stopColor="transparent" stopOpacity="0" />
            <stop offset="90%" stopColor="#1a5580" stopOpacity={0.1 * rimPulse} />
            <stop offset="96%" stopColor="#2a80c0" stopOpacity={0.3 * rimPulse} />
            <stop offset="100%" stopColor="#40aaee" stopOpacity={0.6 * rimPulse} />
          </radialGradient>

          {/* Specular highlight */}
          <radialGradient id={specularId} cx="33%" cy="28%" r="35%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="40%" stopColor="#aaddff" stopOpacity="0.06" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Night side shadow */}
          <radialGradient id={shadowId} cx="72%" cy="55%" r="52%">
            <stop offset="0%" stopColor="#000010" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#00000a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          <clipPath id="globeClip">
            <circle cx={cx} cy={cy} r={R} />
          </clipPath>

          {/* Outer atmosphere glow filter */}
          <filter id="atmosphereBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* Background */}
        <rect x={0} y={0} width={width} height={height} fill="url(#bgGrad)" />

        {/* Stars */}
        {STARS.map((star, i) => (
          <circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="white"
            opacity={star.opacity * (0.6 + 0.4 * Math.sin(frame * 0.03 + i * 0.5))}
          />
        ))}

        {/* Outer atmosphere glow ring */}
        <circle
          cx={cx}
          cy={cy}
          r={R * 1.08}
          fill="none"
          stroke="#2a7ab8"
          strokeWidth={R * 0.06}
          opacity={0.18 * rimPulse}
          filter="url(#atmosphereBlur)"
        />
        <circle
          cx={cx}
          cy={cy}
          r={R * 1.04}
          fill="none"
          stroke="#4aaae0"
          strokeWidth={R * 0.03}
          opacity={0.28 * rimPulse}
          filter="url(#atmosphereBlur)"
        />

        {/* Globe body */}
        <circle cx={cx} cy={cy} r={R} fill={`url(#${gradientId})`} />

        {/* Globe contents clipped */}
        <g clipPath="url(#globeClip)">
          {/* Deep ocean overlay */}
          <circle cx={cx} cy={cy} r={R} fill={`url(#${deepOceanId})`} />

          {/* Ocean surface shimmer patches */}
          {OCEAN_PATCHES.filter(p => p.depth === 0).map((patch, i) => {
            const currentAngle = patch.angleOffset + rotationDeg * (1 + patch.speed * 0.2);
            const proj = projectToSphere(currentAngle, patch.latOffset, cx, cy, R * 0.95);
            if (!proj.visible) return null;
            const shimmerOpacity = patch.opacity * proj.scale * (0.7 + 0.3 * Math.sin(frame * 0.04 + i * 0.7));
            return (
              <ellipse
                key={i}
                cx={proj.x}
                cy={proj.y}
                rx={patch.size * proj.scale}
                ry={patch.size * proj.scale * 0.5}
                fill="#1a5a9a"
                opacity={shimmerOpacity}
              />
            );
          })}

          {/* Land masses */}
          {LAND_MASSES.map((land, i) => {
            const currentAngle = land.angleOffset + rotationDeg * (1 + land.speed * 0.1);
            const proj = projectToSphere(currentAngle, land.lat, cx, cy, R * 0.97);
            if (!proj.visible) return null;
            const alpha = land.opacity * proj.scale * (0.8 + 0.2 * Math.sin(frame * 0.02 + i));
            return (
              <ellipse
                key={i}
                cx={proj.x}
                cy={proj.y}
                rx={land.rx * proj.scale}
                ry={land.ry * proj.scale * 0.6}
                fill="#1a3a22"
                opacity={alpha}
              />
            );
          })}

          {/* Secondary land details */}
          {LAND_MASSES.map((land, i) => {
            const currentAngle = land.angleOffset + 15 + rotationDeg * (1 + land.speed * 0.1);
            const proj = projectToSphere(currentAngle, land.lat * 0.8 + 5, cx, cy, R * 0.97);
            if (!proj.visible) return null;
            const alpha = land.opacity * 0.7 * proj.scale;
            return (
              <ellipse
                key={`l2-${i}`}
                cx={proj.x}
                cy={proj.y}
                rx={land.rx * 0.5 * proj.scale}
                ry={land.ry * 0.4 * proj.scale}
                fill="#1e4228"
                opacity={alpha}
              />
            );
          })}

          {/* Mid-depth ocean details */}
          {OCEAN_PATCHES.filter(p => p.depth === 1).map((patch, i) => {
            const currentAngle = patch.angleOffset + rotationDeg * (1 + patch.speed * 0.15);
            const proj = projectToSphere(currentAngle, patch.latOffset, cx, cy, R * 0.95);
            if (!proj.visible) return null;
            const shimmerOpacity = patch.opacity * proj.scale * 0.6;
            return (
              <ellipse
                key={`od-${i}`}
                cx={proj.x}
                cy={proj.y}
                rx={patch.size * 0.7 * proj.scale}
                ry={patch.size * 0.35 * proj.scale}
                fill="#0d3a6a"
                opacity={shimmerOpacity}
              />
            );
          })}

          {/* Cloud patches */}
          {CLOUD_PATCHES.map((cloud, i) => {
            const currentAngle = cloud.angleOffset + rotationDeg * (1 + cloud.speed * 0.3);
            const proj = projectToSphere(currentAngle, cloud.lat, cx, cy, R * 0.99);
            if (!proj.visible) return null;
            const cloudOpacity = cloud.opacity * proj.scale * (0.8 + 0.2 * Math.sin(frame * 0.025 + i * 0.8));
            return (
              <ellipse
                key={`cl-${i}`}
                cx={proj.x}
                cy={proj.y}
                rx={cloud.width * proj.scale * 0.5}
                ry={cloud.height * proj.scale * 0.3}
                fill="white"
                opacity={cloudOpacity}
              />
            );
          })}

          {/* Ocean surface top-layer shimmer */}
          {OCEAN_PATCHES.filter(p => p.depth === 2).map((patch, i) => {
            const currentAngle = patch.angleOffset + rotationDeg * (1 + patch.speed * 0.25);
            const proj = projectToSphere(currentAngle, patch.latOffset, cx, cy, R * 0.98);
            if (!proj.visible) return null;
            const shimmerOpacity = patch.opacity * proj.scale * (0.4 + 0.6 * Math.sin(frame * 0.06 + i));
            return (
              <ellipse
                key={`os-${i}`}
                cx={proj.x}
                cy={proj.y}
                rx={patch.size * 0.4 * proj.scale}
                ry={patch.size * 0.2 * proj.scale}
                fill="#3a8ad0"
                opacity={shimmerOpacity * 0.4}
              />
            );
          })}

          {/* Specular ocean glints */}
          {Array.from({ length: 20 }, (_, i) => {
            const glintAngle = (i * 181.3) % 360 + rotationDeg * 1.05;
            const glintLat = ((i * 71) % 80) - 40;
            const proj = projectToSphere(glintAngle, glintLat, cx, cy, R * 0.97);
            if (!proj.visible || proj.scale < 0.7) return null;
            const glintOpacity = 0.6 * proj.scale * (0.5 + 0.5 * Math.sin(frame * 0.08 + i * 1.3));
            return (
              <ellipse
                key={`gl-${i}`}
                cx={proj.x}
                cy={proj.y}
                rx={12 * proj.scale}
                ry={5 * proj.scale}
                fill="white"
                opacity={glintOpacity * 0.3}
              />
            );
          })}

          {/* Night side overlay */}
          <circle cx={cx} cy={cy} r={R} fill={`url(#${shadowId})`} />

          {/* Specular highlight */}
          <circle cx={cx} cy={cy} r={R} fill={`url(#${specularId})`} />
        </g>

        {/* Rim glow (outside clip) */}
        <circle cx={cx} cy={cy} r={R} fill={`url(#${rimGlowId})`} />

        {/* Atmosphere outer layer */}
        <circle
          cx={cx}
          cy={cy}
          r={R * 1.015}
          fill={`url(#${atmosphereId})`}
        />

        {/* Fine rim light line */}
        <circle
          cx={cx}
          cy={cy}
          r={R * 1.002}
          fill="none"
          stroke="#70c8ff"
          strokeWidth={R * 0.004}
          opacity={0.5 * rimPulse}
          filter="url(#softGlow)"
        />

        {/* Secondary atmospheric corona */}
        <circle
          cx={cx}
          cy={cy}
          r={R * 1.012}
          fill="none"
          stroke="#3088cc"
          strokeWidth={R * 0.008}
          opacity={0.25 * rimPulse * (0.8 + 0.2 * slowPulse)}
          filter="url(#atmosphereBlur)"
        />

        {/* Polar ice cap glow - north */}
        {(() => {
          const northProj = projectToSphere(rotationDeg * 0.5, 78, cx, cy, R * 0.95);
          if (!northProj.visible) return null;
          return (
            <ellipse
              cx={northProj.x}
              cy={northProj.y}
              rx={60 * northProj.scale}
              ry={30 * northProj.scale}
              fill="white"
              opacity={0.25 * northProj.scale}
            />
          );
        })()}

        {/* Polar ice cap - south */}
        {(() => {
          const southProj = projectToSphere(rotationDeg * 0.5, -82, cx, cy, R * 0.95);
          if (!southProj.visible) return null;
          return (
            <ellipse
              cx={southProj.x}
              cy={southProj.y}
              rx={80 * southProj.scale}
              ry={35 * southProj.scale}
              fill="white"
              opacity={0.3 * southProj.scale}
            />
          );
        })()}

        {/* Subtle vignette */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
          <stop offset="50%" stopColor="transparent" stopOpacity="0" />
          <stop offset="100%" stopColor="#000005" stopOpacity="0.7" />
        </radialGradient>
        <rect x={0} y={0} width={width} height={height} fill="url(#vignette)" />
      </svg>
    </div>
  );
};