import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 2731 + 137) % 3840,
  y: (i * 1933 + 421) % 2160,
  r: ((i * 17) % 4) + 1,
  brightness: ((i * 53) % 80) + 20,
  twinkleOffset: (i * 37) % 100,
}));

const REFLECTION_STARS = Array.from({ length: 120 }, (_, i) => ({
  angle: ((i * 137.508) % 360) * (Math.PI / 180),
  dist: ((i * 89) % 85) + 5,
  size: ((i * 23) % 3) + 1,
  brightness: ((i * 61) % 60) + 40,
  twinkleOffset: (i * 41) % 100,
}));

const LATITUDE_LINES = Array.from({ length: 9 }, (_, i) => i);
const LONGITUDE_LINES = Array.from({ length: 12 }, (_, i) => i);

const CONTINENTS = [
  { cx: -0.3, cy: 0.15, rx: 0.18, ry: 0.22 },
  { cx: 0.05, cy: 0.1, rx: 0.12, ry: 0.2 },
  { cx: 0.35, cy: -0.05, rx: 0.22, ry: 0.18 },
  { cx: -0.1, cy: -0.3, rx: 0.1, ry: 0.12 },
  { cx: 0.4, cy: 0.3, rx: 0.08, ry: 0.1 },
  { cx: -0.5, cy: -0.1, rx: 0.06, ry: 0.09 },
];

export const ChromeMetallicEarth: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const rotation = (frame / durationInFrames) * 360 * 1.5;
  const wobble = Math.sin(frame * 0.02) * 3;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.32;

  const gradId = 'metalGrad';
  const reflGradId = 'reflGrad';
  const rimGradId = 'rimGrad';
  const atmosphereGradId = 'atmGrad';
  const starReflGradId = 'starReflGrad';
  const noiseId = 'noiseFilter';

  return (
    <div style={{ width, height, background: '#000', position: 'relative', overflow: 'hidden', opacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id={noiseId} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
            <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="blended" />
            <feComposite in="blended" in2="SourceGraphic" operator="in" />
          </filter>

          <radialGradient id={gradId} cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#f0f4f8" stopOpacity="1" />
            <stop offset="20%" stopColor="#c8d8e8" stopOpacity="1" />
            <stop offset="45%" stopColor="#7090a8" stopOpacity="1" />
            <stop offset="70%" stopColor="#304858" stopOpacity="1" />
            <stop offset="90%" stopColor="#101820" stopOpacity="1" />
            <stop offset="100%" stopColor="#050a0f" stopOpacity="1" />
          </radialGradient>

          <radialGradient id={reflGradId} cx="62%" cy="68%" r="55%">
            <stop offset="0%" stopColor="#a0c8e0" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#406080" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000820" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={starReflGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="60%" stopColor="#7090b0" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#203050" stopOpacity="0.5" />
          </radialGradient>

          <radialGradient id={atmosphereGradId} cx="50%" cy="50%" r="50%">
            <stop offset="80%" stopColor="transparent" stopOpacity="0" />
            <stop offset="90%" stopColor="#2060a0" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4090d0" stopOpacity="0.6" />
          </radialGradient>

          <radialGradient id={rimGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#e8f0f8" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#8090a0" stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          <clipPath id="sphereClip">
            <circle cx={cx} cy={cy} r={radius} />
          </clipPath>
        </defs>

        {/* Deep space background gradient */}
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#0a0e18" />
          <stop offset="100%" stopColor="#000005" />
        </radialGradient>
        <rect width={width} height={height} fill="url(#bgGrad)" />

        {/* Background stars */}
        {STARS.map((s, i) => {
          const twinkle = Math.sin((frame + s.twinkleOffset * 3) * 0.05) * 0.4 + 0.6;
          return (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill={`rgba(200, 220, 255, ${(s.brightness / 100) * twinkle})`}
            />
          );
        })}

        {/* Subtle nebula clouds */}
        {[0, 1, 2].map(i => (
          <ellipse
            key={`nebula-${i}`}
            cx={(i * 1200 + 400) % width}
            cy={(i * 800 + 300) % height}
            rx={400 + i * 150}
            ry={200 + i * 100}
            fill={`rgba(${40 + i * 15}, ${20 + i * 10}, ${80 + i * 20}, 0.06)`}
            transform={`rotate(${30 + i * 45}, ${(i * 1200 + 400) % width}, ${(i * 800 + 300) % height})`}
          />
        ))}

        {/* Earth sphere base */}
        <circle cx={cx} cy={cy} r={radius} fill="url(#metalGrad)" />

        {/* Sphere surface details with clipping */}
        <g clipPath="url(#sphereClip)">
          {/* Dark ocean base */}
          <circle cx={cx} cy={cy} r={radius} fill="#0d1a26" />

          {/* Chrome metallic surface */}
          <circle cx={cx} cy={cy} r={radius} fill="url(#metalGrad)" />

          {/* Latitude grid lines */}
          {LATITUDE_LINES.map((i) => {
            const latAngle = ((i - 4) / 8) * Math.PI * 0.9;
            const latY = cy + Math.sin(latAngle) * radius;
            const latR = Math.cos(latAngle) * radius;
            if (latR <= 0) return null;
            return (
              <ellipse
                key={`lat-${i}`}
                cx={cx}
                cy={latY}
                rx={latR}
                ry={latR * 0.15}
                fill="none"
                stroke="rgba(100, 160, 200, 0.18)"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Longitude grid lines with rotation */}
          {LONGITUDE_LINES.map((i) => {
            const lonAngle = (i / 12) * Math.PI * 2 + (rotation * Math.PI) / 180;
            const cosA = Math.cos(lonAngle);
            const sinA = Math.sin(lonAngle);
            return (
              <ellipse
                key={`lon-${i}`}
                cx={cx}
                cy={cy}
                rx={Math.abs(cosA) * radius}
                ry={radius}
                fill="none"
                stroke="rgba(100, 160, 200, 0.15)"
                strokeWidth="1.5"
                transform={`rotate(${Math.atan2(sinA, cosA) * 0 }, ${cx}, ${cy})`}
              />
            );
          })}

          {/* Rotating continent-like shapes */}
          {CONTINENTS.map((cont, i) => {
            const rotRad = (rotation * Math.PI) / 180;
            const rotX = cont.cx * Math.cos(rotRad) - cont.cy * 0 * Math.sin(rotRad);
            const screenX = cx + rotX * radius;
            const screenY = cy + cont.cy * radius;
            const visibilityFactor = Math.cos(rotRad + cont.cx * 3);
            if (visibilityFactor < -0.2) return null;
            const scaleX = Math.abs(visibilityFactor);
            return (
              <ellipse
                key={`cont-${i}`}
                cx={screenX}
                cy={screenY}
                rx={cont.rx * radius * scaleX}
                ry={cont.ry * radius * 0.85}
                fill={`rgba(40, 120, 80, ${Math.max(0, visibilityFactor) * 0.6})`}
                stroke={`rgba(80, 160, 120, ${Math.max(0, visibilityFactor) * 0.3})`}
                strokeWidth="2"
              />
            );
          })}

          {/* Metallic sheen overlay */}
          <circle cx={cx} cy={cy} r={radius} fill="url(#starReflGrad)" />

          {/* Reflection of stars on sphere surface */}
          {REFLECTION_STARS.map((s, i) => {
            const rotRad = (rotation * Math.PI) / 180;
            const twinkle = Math.sin((frame + s.twinkleOffset * 2) * 0.08) * 0.5 + 0.5;
            const adjustedAngle = s.angle + rotRad * 0.3;
            const starX = cx + Math.cos(adjustedAngle) * (s.dist / 100) * radius;
            const starY = cy + Math.sin(adjustedAngle) * (s.dist / 100) * radius * 0.9;
            const distFromCenter = s.dist / 100;
            const edgeFade = 1 - distFromCenter * distFromCenter;
            return (
              <circle
                key={`rs-${i}`}
                cx={starX}
                cy={starY}
                r={s.size * 1.5}
                fill={`rgba(200, 230, 255, ${(s.brightness / 100) * twinkle * edgeFade * 0.7})`}
              />
            );
          })}

          {/* Specular highlight primary */}
          <ellipse
            cx={cx - radius * 0.28}
            cy={cy - radius * 0.3}
            rx={radius * 0.22}
            ry={radius * 0.16}
            fill="rgba(255, 255, 255, 0.55)"
            transform={`rotate(-25, ${cx - radius * 0.28}, ${cy - radius * 0.3})`}
          />

          {/* Specular highlight secondary */}
          <ellipse
            cx={cx - radius * 0.15}
            cy={cy - radius * 0.22}
            rx={radius * 0.08}
            ry={radius * 0.05}
            fill="rgba(255, 255, 255, 0.75)"
            transform={`rotate(-25, ${cx - radius * 0.15}, ${cy - radius * 0.22})`}
          />

          {/* Second reflection area - bottom right */}
          <ellipse
            cx={cx + radius * 0.45}
            cy={cy + radius * 0.55}
            rx={radius * 0.18}
            ry={radius * 0.1}
            fill="rgba(120, 180, 240, 0.2)"
            transform={`rotate(20, ${cx + radius * 0.45}, ${cy + radius * 0.55})`}
          />

          {/* Dark terminator shadow */}
          <ellipse
            cx={cx + radius * 0.6}
            cy={cy}
            rx={radius * 0.7}
            ry={radius}
            fill="rgba(0, 5, 15, 0.75)"
          />

          {/* Metallic reflection gradient overlay */}
          <circle cx={cx} cy={cy} r={radius} fill="url(#reflGrad)" />
        </g>

        {/* Atmosphere glow */}
        <circle
          cx={cx}
          cy={cy}
          r={radius * 1.04}
          fill="none"
          stroke="rgba(80, 150, 230, 0.4)"
          strokeWidth={radius * 0.04}
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius * 1.07}
          fill="none"
          stroke="rgba(60, 120, 200, 0.15)"
          strokeWidth={radius * 0.04}
        />

        {/* Atmosphere radial */}
        <circle cx={cx} cy={cy} r={radius * 1.1} fill="url(#atmGrad)" />

        {/* Outer rim light */}
        <circle
          cx={cx - radius * 0.01}
          cy={cy - radius * 0.01}
          r={radius}
          fill="none"
          stroke="rgba(180, 220, 255, 0.3)"
          strokeWidth="4"
        />

        {/* Shadow cast below sphere */}
        <ellipse
          cx={cx + width * 0.04}
          cy={cy + radius * 1.15}
          rx={radius * 0.65}
          ry={radius * 0.06}
          fill="rgba(0, 0, 0, 0.5)"
        />

        {/* Lens flare elements */}
        {[
          { offset: -radius * 2.2, size: radius * 0.06, alpha: 0.35 },
          { offset: -radius * 1.5, size: radius * 0.03, alpha: 0.25 },
          { offset: -radius * 0.7, size: radius * 0.015, alpha: 0.2 },
          { offset: radius * 0.5, size: radius * 0.04, alpha: 0.15 },
          { offset: radius * 1.3, size: radius * 0.025, alpha: 0.12 },
        ].map((flare, i) => {
          const flareX = cx - radius * 0.28 + flare.offset * Math.cos(-25 * Math.PI / 180);
          const flareY = cy - radius * 0.3 + flare.offset * Math.sin(-25 * Math.PI / 180);
          return (
            <circle
              key={`flare-${i}`}
              cx={flareX}
              cy={flareY}
              r={flare.size}
              fill={`rgba(200, 230, 255, ${flare.alpha})`}
            />
          );
        })}

        {/* Rotating highlight streak */}
        <g clipPath="url(#sphereClip)">
          <ellipse
            cx={cx - radius * 0.1}
            cy={cy - radius * 0.35}
            rx={radius * 0.45}
            ry={radius * 0.04}
            fill="rgba(255, 255, 255, 0.12)"
            transform={`rotate(${-30 + wobble}, ${cx}, ${cy})`}
          />
        </g>
      </svg>
    </div>
  );
};