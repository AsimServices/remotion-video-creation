import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NUM_STARS = 300;
const STARS = Array.from({ length: NUM_STARS }, (_, i) => ({
  x: (i * 2347 + 113) % 3840,
  y: (i * 1637 + 97) % 2160,
  size: ((i * 7) % 5) + 0.5,
  opacity: ((i * 13) % 80) / 100 + 0.2,
  twinkleOffset: (i * 41) % 100,
}));

const NUM_CONTINENTS = 12;
const CONTINENT_PATCHES = Array.from({ length: NUM_CONTINENTS }, (_, i) => ({
  latAngle: ((i * 137.5) % 180) - 90,
  lonAngle: (i * 97.3) % 360,
  rx: ((i * 53) % 40) + 15,
  ry: ((i * 37) % 28) + 10,
  opacity: ((i * 19) % 40) / 100 + 0.25,
}));

const NUM_RIM_DOTS = 80;
const RIM_DOTS = Array.from({ length: NUM_RIM_DOTS }, (_, i) => ({
  angle: (i / NUM_RIM_DOTS) * 360,
  size: ((i * 11) % 6) + 2,
  opacity: ((i * 17) % 60) / 100 + 0.1,
  rimDist: ((i * 7) % 10) + 2,
}));

const NUM_CLOUDS = 18;
const CLOUD_PATCHES = Array.from({ length: NUM_CLOUDS }, (_, i) => ({
  latAngle: ((i * 173.1) % 160) - 80,
  lonAngle: (i * 67.7) % 360,
  rx: ((i * 43) % 35) + 20,
  ry: ((i * 29) % 18) + 8,
  opacity: ((i * 23) % 30) / 100 + 0.08,
}));

export const DeepSpaceEarthRotation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const rotationDeg = (frame / durationInFrames) * 360 * 1.5;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.33;

  const gradId = 'earthGrad';
  const atmosGradId = 'atmosGrad';
  const glowGradId = 'glowGrad';
  const rimGradId = 'rimGrad';
  const nightGradId = 'nightGrad';
  const cloudGradId = 'cloudGrad';
  const starGlowId = 'starGlow';

  return (
    <div
      style={{
        width,
        height,
        background: '#000005',
        position: 'relative',
        overflow: 'hidden',
        opacity: globalOpacity,
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {/* Deep space background glow */}
          <radialGradient id={glowGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0a1a3a" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#020510" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#000005" stopOpacity="0" />
          </radialGradient>

          {/* Earth base color gradient */}
          <radialGradient id={gradId} cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#2a6fa0" />
            <stop offset="30%" stopColor="#1a4f7a" />
            <stop offset="65%" stopColor="#0e3055" />
            <stop offset="100%" stopColor="#061428" />
          </radialGradient>

          {/* Night side overlay */}
          <radialGradient id={nightGradId} cx="75%" cy="65%" r="55%">
            <stop offset="0%" stopColor="#000008" stopOpacity="0.92" />
            <stop offset="50%" stopColor="#00000a" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#000010" stopOpacity="0" />
          </radialGradient>

          {/* Atmosphere glow halo */}
          <radialGradient id={atmosGradId} cx="50%" cy="50%" r="50%">
            <stop offset="82%" stopColor="#0055cc" stopOpacity="0" />
            <stop offset="88%" stopColor="#1177ff" stopOpacity="0.22" />
            <stop offset="92%" stopColor="#55aaff" stopOpacity="0.38" />
            <stop offset="95%" stopColor="#88ccff" stopOpacity="0.45" />
            <stop offset="97%" stopColor="#aaddff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#cceeff" stopOpacity="0" />
          </radialGradient>

          {/* Rim light gradient */}
          <radialGradient id={rimGradId} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#88ccff" stopOpacity="0" />
            <stop offset="80%" stopColor="#55aaff" stopOpacity="0" />
            <stop offset="92%" stopColor="#77bbff" stopOpacity="0.55" />
            <stop offset="97%" stopColor="#aaddff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
          </radialGradient>

          {/* Cloud gradient */}
          <radialGradient id={cloudGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d4eeff" stopOpacity="1" />
            <stop offset="100%" stopColor="#a8d8ff" stopOpacity="0" />
          </radialGradient>

          {/* Star glow filter */}
          <filter id={starGlowId} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="earthGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="atmosBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="12" />
          </filter>

          <filter id="continentGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <clipPath id="earthClip">
            <circle cx={cx} cy={cy} r={radius} />
          </clipPath>
        </defs>

        {/* Stars */}
        <g filter={`url(#${starGlowId})`}>
          {STARS.map((star, i) => {
            const twinkle = Math.sin((frame + star.twinkleOffset * 2) * 0.05) * 0.3 + 0.7;
            return (
              <circle
                key={i}
                cx={star.x}
                cy={star.y}
                r={star.size}
                fill="#ffffff"
                opacity={star.opacity * twinkle}
              />
            );
          })}
        </g>

        {/* Deep space ambient glow behind Earth */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={radius * 2.2}
          ry={radius * 2.2}
          fill={`url(#${glowGradId})`}
        />

        {/* Subtle blue nebula backdrop */}
        <ellipse
          cx={cx - radius * 0.3}
          cy={cy - radius * 0.2}
          rx={radius * 1.8}
          ry={radius * 1.4}
          fill="#0a1e4a"
          opacity="0.12"
          filter="url(#atmosBlur)"
        />

        {/* Earth atmosphere outer glow (blurred) */}
        <circle
          cx={cx}
          cy={cy}
          r={radius * 1.08}
          fill="none"
          stroke="#1166ee"
          strokeWidth={radius * 0.06}
          opacity="0.18"
          filter="url(#atmosBlur)"
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius * 1.05}
          fill="none"
          stroke="#3388ff"
          strokeWidth={radius * 0.04}
          opacity="0.25"
          filter="url(#atmosBlur)"
        />

        {/* Earth base sphere */}
        <circle cx={cx} cy={cy} r={radius} fill={`url(#${gradId})`} filter="url(#earthGlow)" />

        {/* Continent patches rotating */}
        <g clipPath="url(#earthClip)" filter="url(#continentGlow)">
          {CONTINENT_PATCHES.map((c, i) => {
            const lonRad = ((c.lonAngle + rotationDeg) % 360) * (Math.PI / 180);
            const latRad = c.latAngle * (Math.PI / 180);
            const cosLat = Math.cos(latRad);
            const sinLat = Math.sin(latRad);
            const cosLon = Math.cos(lonRad);

            // Project to 2D
            const px = cx + radius * cosLat * Math.sin(lonRad);
            const py = cy - radius * sinLat;
            const visible = cosLat * cosLon;

            if (visible < -0.1) return null;

            const perspScale = (visible + 1) * 0.5 * 0.8 + 0.2;
            const landOpacity = c.opacity * perspScale * (visible > 0 ? 1 : 0.3);
            const rimProximity = 1 - Math.abs(visible);

            return (
              <ellipse
                key={i}
                cx={px}
                cy={py}
                rx={c.rx * perspScale * (radius / 500)}
                ry={c.ry * perspScale * (radius / 500)}
                fill={rimProximity > 0.7 ? '#3a8a4a' : '#2d7040'}
                stroke={rimProximity > 0.75 ? '#88ffaa' : '#44aa66'}
                strokeWidth={rimProximity > 0.75 ? 2.5 : 0.8}
                opacity={landOpacity}
              />
            );
          })}
        </g>

        {/* Ocean shimmer highlights rotating */}
        <g clipPath="url(#earthClip)">
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2 + (frame * 0.008);
            const dist = radius * 0.4;
            const hx = cx + Math.cos(angle) * dist * 0.6;
            const hy = cy + Math.sin(angle) * dist * 0.4;
            return (
              <ellipse
                key={i}
                cx={hx}
                cy={hy}
                rx={radius * 0.12}
                ry={radius * 0.06}
                fill="#66bbff"
                opacity={0.04 + (i % 3) * 0.015}
                transform={`rotate(${angle * 57.3}, ${hx}, ${hy})`}
              />
            );
          })}
        </g>

        {/* Cloud patches rotating slightly faster */}
        <g clipPath="url(#earthClip)">
          {CLOUD_PATCHES.map((c, i) => {
            const cloudRotOffset = rotationDeg * 1.08;
            const lonRad = ((c.lonAngle + cloudRotOffset) % 360) * (Math.PI / 180);
            const latRad = c.latAngle * (Math.PI / 180);
            const cosLat = Math.cos(latRad);
            const sinLat = Math.sin(latRad);
            const cosLon = Math.cos(lonRad);

            const px = cx + radius * cosLat * Math.sin(lonRad);
            const py = cy - radius * sinLat;
            const visible = cosLat * cosLon;

            if (visible < -0.15) return null;
            const perspScale = (visible + 1) * 0.5 * 0.85 + 0.15;

            return (
              <ellipse
                key={i}
                cx={px}
                cy={py}
                rx={c.rx * perspScale * (radius / 480)}
                ry={c.ry * perspScale * (radius / 480)}
                fill="#d8eeff"
                opacity={c.opacity * perspScale * (visible > 0 ? 1 : 0.2)}
              />
            );
          })}
        </g>

        {/* Night side shadow overlay */}
        <circle cx={cx} cy={cy} r={radius} fill={`url(#${nightGradId})`} clipPath="url(#earthClip)" />

        {/* Specular highlight */}
        <ellipse
          cx={cx - radius * 0.28}
          cy={cy - radius * 0.3}
          rx={radius * 0.22}
          ry={radius * 0.15}
          fill="#ffffff"
          opacity="0.07"
          clipPath="url(#earthClip)"
        />
        <ellipse
          cx={cx - radius * 0.32}
          cy={cy - radius * 0.35}
          rx={radius * 0.08}
          ry={radius * 0.05}
          fill="#ffffff"
          opacity="0.12"
          clipPath="url(#earthClip)"
        />

        {/* Atmosphere halo overlay on sphere */}
        <circle cx={cx} cy={cy} r={radius * 1.12} fill={`url(#${atmosGradId})`} />

        {/* Rim lighting */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#5599ff"
          strokeWidth={radius * 0.025}
          opacity="0.55"
          filter="url(#atmosBlur)"
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius * 0.998}
          fill="none"
          stroke="#88ccff"
          strokeWidth={radius * 0.008}
          opacity="0.7"
        />

        {/* Rim glow points from continent edges */}
        {RIM_DOTS.map((dot, i) => {
          const angleRad = ((dot.angle + rotationDeg * 0.3) % 360) * (Math.PI / 180);
          const rimR = radius + dot.rimDist * (radius / 500);
          const rx2 = cx + Math.cos(angleRad) * rimR;
          const ry2 = cy + Math.sin(angleRad) * rimR;

          const sunAngle = Math.cos(angleRad - Math.PI * 0.15);
          if (sunAngle < 0) return null;

          return (
            <circle
              key={i}
              cx={rx2}
              cy={ry2}
              r={dot.size * (radius / 800)}
              fill="#aaddff"
              opacity={dot.opacity * sunAngle}
            />
          );
        })}

        {/* Final outer atmosphere thin ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius * 1.04}
          fill="none"
          stroke="#44aaff"
          strokeWidth={radius * 0.003}
          opacity="0.45"
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius * 1.07}
          fill="none"
          stroke="#2266cc"
          strokeWidth={radius * 0.002}
          opacity="0.25"
        />
      </svg>
    </div>
  );
};