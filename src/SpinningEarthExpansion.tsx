import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 2731 + 137) % 3840,
  y: (i * 1999 + 73) % 2160,
  size: ((i * 17) % 3) + 1,
  opacity: ((i * 53) % 60 + 40) / 100,
}));

const CONTINENTS = [
  // North America
  { path: 'M 420,340 L 460,310 L 520,295 L 570,300 L 590,330 L 610,350 L 600,390 L 570,420 L 540,450 L 510,470 L 490,460 L 460,430 L 440,400 L 420,370 Z', cx: 510, cy: 380 },
  // South America
  { path: 'M 490,490 L 520,475 L 560,480 L 590,510 L 610,550 L 615,600 L 600,650 L 570,680 L 540,690 L 510,670 L 490,630 L 480,580 L 475,530 Z', cx: 545, cy: 580 },
  // Europe
  { path: 'M 650,280 L 690,260 L 730,255 L 760,265 L 780,285 L 770,310 L 740,330 L 700,340 L 665,330 L 645,310 Z', cx: 715, cy: 295 },
  // Africa
  { path: 'M 650,350 L 695,335 L 740,340 L 775,365 L 790,410 L 795,460 L 790,510 L 770,555 L 735,580 L 695,585 L 660,560 L 640,510 L 630,455 L 630,400 Z', cx: 713, cy: 460 },
  // Asia
  { path: 'M 790,230 L 860,210 L 950,215 L 1020,230 L 1070,260 L 1080,300 L 1060,340 L 1010,360 L 950,370 L 880,360 L 820,340 L 790,310 L 775,270 Z', cx: 927, cy: 290 },
  // Australia
  { path: 'M 950,480 L 1000,465 L 1050,470 L 1090,490 L 1100,530 L 1085,565 L 1045,585 L 995,580 L 960,555 L 945,515 Z', cx: 1022, cy: 525 },
];

const GRID_LINES_LAT = Array.from({ length: 9 }, (_, i) => i);
const GRID_LINES_LON = Array.from({ length: 13 }, (_, i) => i);

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  angle: (i * 137.5) % 360,
  radius: ((i * 89) % 60) + 30,
  speed: ((i * 43) % 30) + 15,
  size: ((i * 17) % 4) + 2,
  hue: (i * 23) % 60 + 160,
}));

export const SpinningEarthExpansion: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const masterOpacity = Math.min(fadeIn, fadeOut);

  const cx = width / 2;
  const cy = height / 2;
  const R = Math.min(width, height) * 0.36;

  const earthRotation = (frame * 0.4) % 360;
  const axialTilt = 23.5;

  const progressRatio = frame / durationInFrames;
  const lightSweepAngle = interpolate(frame, [0, durationInFrames], [-200, 560]);

  const glowPulse = 0.7 + 0.3 * Math.sin(frame * 0.08);
  const atmosphereGlow = 0.4 + 0.2 * Math.sin(frame * 0.05);

  const scaleFactor = width / 3840;

  return (
    <div style={{ width, height, background: '#020408', overflow: 'hidden', opacity: masterOpacity }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          {/* Space background gradient */}
          <radialGradient id="spaceGrad" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#0a0f1e" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>

          {/* Earth ocean gradient */}
          <radialGradient id="oceanGrad" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#1a4a7a" />
            <stop offset="40%" stopColor="#0d3060" />
            <stop offset="100%" stopColor="#061830" />
          </radialGradient>

          {/* Atmosphere glow */}
          <radialGradient id="atmosphereGrad" cx="50%" cy="50%" r="55%">
            <stop offset="82%" stopColor="transparent" stopOpacity="0" />
            <stop offset="90%" stopColor="#4a90d9" stopOpacity={0.15 * atmosphereGlow} />
            <stop offset="95%" stopColor="#60b0ff" stopOpacity={0.25 * atmosphereGlow} />
            <stop offset="100%" stopColor="#80c8ff" stopOpacity={0.05} />
          </radialGradient>

          {/* Specular highlight */}
          <radialGradient id="specularGrad" cx="35%" cy="30%" r="40%">
            <stop offset="0%" stopColor="white" stopOpacity="0.15" />
            <stop offset="50%" stopColor="white" stopOpacity="0.05" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Terminator shadow */}
          <radialGradient id="shadowGrad" cx="72%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#000010" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#000010" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#000010" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Light sweep gradient */}
          <linearGradient id="lightSweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ffaa" stopOpacity="0" />
            <stop offset="30%" stopColor="#00ffaa" stopOpacity="0" />
            <stop offset="45%" stopColor="#40ffcc" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#80ffdd" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#40ffcc" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#00ffaa" stopOpacity="0" />
            <stop offset="100%" stopColor="#00ffaa" stopOpacity="0" />
          </linearGradient>

          {/* Continent lit gradient */}
          <linearGradient id="continentLitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a9e6a" />
            <stop offset="50%" stopColor="#2d7a4a" />
            <stop offset="100%" stopColor="#1a5a30" />
          </linearGradient>

          {/* Continent glow gradient */}
          <linearGradient id="continentGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="0" />
            <stop offset="40%" stopColor="#00ff88" stopOpacity="0" />
            <stop offset="50%" stopColor="#00ff88" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#00ff88" stopOpacity="0" />
            <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
          </linearGradient>

          {/* Globe clip */}
          <clipPath id="globeClip">
            <circle cx={cx} cy={cy} r={R} />
          </clipPath>

          {/* Glow filter */}
          <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={scaleFactor * 20} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Soft glow */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={scaleFactor * 8} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Ring glow */}
          <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={scaleFactor * 30} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Space background */}
        <rect width={width} height={height} fill="url(#spaceGrad)" />

        {/* Stars */}
        {STARS.map((star, i) => {
          const twinkle = 0.5 + 0.5 * Math.sin(frame * 0.05 + i * 0.7);
          return (
            <circle
              key={i}
              cx={star.x}
              cy={star.y}
              r={star.size * scaleFactor}
              fill="white"
              opacity={star.opacity * twinkle}
            />
          );
        })}

        {/* Outer glow ring around Earth */}
        <circle
          cx={cx}
          cy={cy}
          r={R * 1.18}
          fill="none"
          stroke="#1a6aaa"
          strokeWidth={scaleFactor * 80}
          opacity={0.12 * glowPulse}
          filter="url(#ringGlow)"
        />
        <circle
          cx={cx}
          cy={cy}
          r={R * 1.08}
          fill="none"
          stroke="#2a8aee"
          strokeWidth={scaleFactor * 40}
          opacity={0.15 * glowPulse}
          filter="url(#ringGlow)"
        />

        {/* Earth base - ocean */}
        <circle cx={cx} cy={cy} r={R} fill="url(#oceanGrad)" />

        {/* Earth content clipped to globe */}
        <g clipPath="url(#globeClip)">

          {/* Latitude grid lines */}
          <g opacity="0.12">
            {GRID_LINES_LAT.map((i) => {
              const lat = (i / 8) * 160 - 80;
              const yOff = Math.sin((lat * Math.PI) / 180) * R;
              const lineR = Math.cos((lat * Math.PI) / 180) * R;
              if (lineR <= 0) return null;
              return (
                <ellipse
                  key={`lat-${i}`}
                  cx={cx}
                  cy={cy + yOff}
                  rx={lineR}
                  ry={lineR * 0.15}
                  fill="none"
                  stroke="#4a9aee"
                  strokeWidth={scaleFactor * 1.5}
                />
              );
            })}

            {/* Longitude grid lines */}
            {GRID_LINES_LON.map((i) => {
              const lon = (i / 12) * 360;
              const angle = ((lon + earthRotation) % 360) - 180;
              const xOff = Math.sin((angle * Math.PI) / 180) * R;
              return (
                <ellipse
                  key={`lon-${i}`}
                  cx={cx + xOff * 0.2}
                  cy={cy}
                  rx={Math.abs(Math.cos((angle * Math.PI) / 180)) * R}
                  ry={R}
                  fill="none"
                  stroke="#4a9aee"
                  strokeWidth={scaleFactor * 1.5}
                />
              );
            })}
          </g>

          {/* Continents - rendered as transformed shapes */}
          {CONTINENTS.map((cont, idx) => {
            const worldScale = R / 600;
            const baseX = cont.cx - 760;
            const baseY = cont.cy - 430;
            const rotRad = (earthRotation * Math.PI) / 180;
            const cosR = Math.cos(rotRad);
            const sinR = Math.sin(rotRad);
            const rotX = baseX * cosR - baseY * 0;
            const xPos = cx + rotX * worldScale * 1.5;

            const lightNorm = ((lightSweepAngle - (cont.cx - 760) * 0.3) % 360 + 360) % 360;
            const isLit = lightNorm > 90 && lightNorm < 270;
            const litAmount = Math.max(0, Math.sin(((lightNorm - 90) / 180) * Math.PI));

            const continentColor = `rgb(${Math.round(30 + litAmount * 50)}, ${Math.round(100 + litAmount * 80)}, ${Math.round(40 + litAmount * 30)})`;
            const continentOpacity = 0.5 + litAmount * 0.5;

            const scaleAmt = worldScale * 1.55;
            const offsetX = cx - 760 * scaleAmt;
            const offsetY = cy - 430 * scaleAmt;
            const contRotX = cont.cx * scaleAmt + offsetX;
            const dispX = ((baseX * cosR) * worldScale * 1.5 + cx) - contRotX;

            return (
              <g key={idx}>
                <path
                  d={cont.path}
                  fill={continentColor}
                  opacity={continentOpacity}
                  transform={`translate(${cx - 760 * scaleAmt + dispX}, ${cy - 430 * scaleAmt}) scale(${scaleAmt})`}
                  stroke="#2a6a3a"
                  strokeWidth={scaleFactor * 0.8}
                />
                {litAmount > 0.3 && (
                  <path
                    d={cont.path}
                    fill="none"
                    opacity={litAmount * 0.7}
                    transform={`translate(${cx - 760 * scaleAmt + dispX}, ${cy - 430 * scaleAmt}) scale(${scaleAmt})`}
                    stroke={`rgba(0, 255, 160, ${litAmount * 0.6})`}
                    strokeWidth={scaleFactor * 2}
                    filter="url(#softGlow)"
                  />
                )}
              </g>
            );
          })}

          {/* Light sweep wave across globe */}
          <rect
            x={cx - R + (lightSweepAngle / 360) * R * 2 - R * 0.3}
            y={cy - R}
            width={R * 0.6}
            height={R * 2}
            fill="url(#lightSweepGrad)"
            opacity={0.4}
          />

          {/* City light dots - appearing as expansion progresses */}
          {Array.from({ length: 50 }, (_, i) => {
            const angle = (i * 137.5 + earthRotation * 0.3) % 360;
            const lat = ((i * 73) % 140) - 70;
            const lonRad = (angle * Math.PI) / 180;
            const latRad = (lat * Math.PI) / 180;
            const dotX = cx + Math.cos(latRad) * Math.sin(lonRad) * R * 0.98;
            const dotY = cy - Math.sin(latRad) * R * 0.98;
            const lightNorm = ((lightSweepAngle - angle * 0.5) % 360 + 360) % 360;
            const litAmount = Math.max(0, Math.sin(((Math.max(0, lightNorm - 90)) / 180) * Math.PI));
            const threshold = (i / 50);
            if (progressRatio < threshold) return null;
            return (
              <g key={`city-${i}`}>
                <circle
                  cx={dotX}
                  cy={dotY}
                  r={scaleFactor * 6}
                  fill="#ffdd44"
                  opacity={0.3 + litAmount * 0.7}
                />
                <circle
                  cx={dotX}
                  cy={dotY}
                  r={scaleFactor * 14}
                  fill="#ffaa00"
                  opacity={0.15 * glowPulse}
                  filter="url(#softGlow)"
                />
              </g>
            );
          })}

          {/* Atmosphere inner glow */}
          <circle cx={cx} cy={cy} r={R} fill="url(#atmosphereGrad)" />

          {/* Night side shadow (terminator) */}
          <circle cx={cx} cy={cy} r={R} fill="url(#shadowGrad)" />

          {/* Specular highlight */}
          <circle cx={cx} cy={cy} r={R} fill="url(#specularGrad)" />
        </g>

        {/* Atmosphere halo outside globe */}
        <circle
          cx={cx}
          cy={cy}
          r={R * 1.04}
          fill="none"
          stroke="#60aaff"
          strokeWidth={scaleFactor * 18}
          opacity={0.18 * atmosphereGlow}
        />
        <circle
          cx={cx}
          cy={cy}
          r={R * 1.02}
          fill="none"
          stroke="#80ccff"
          strokeWidth={scaleFactor * 8}
          opacity={0.25 * atmosphereGlow}
        />

        {/* Orbital rings */}
        {[1.25, 1.45, 1.65].map((rMult, idx) => {
          const orbitAngle = frame * (0.5 - idx * 0.12) + idx * 60;
          const dotX = cx + Math.cos((orbitAngle * Math.PI) / 180) * R * rMult;
          const dotY = cy + Math.sin((orbitAngle * Math.PI) / 180) * R * rMult * 0.35;
          const ringOpacity = 0.08 + idx * 0.03;
          return (
            <g key={`orbit-${idx}`}>
              <ellipse
                cx={cx}
                cy={cy}
                rx={R * rMult}
                ry={R * rMult * 0.35}
                fill="none"
                stroke="#2a6aaa"
                strokeWidth={scaleFactor * 1.5}
                opacity={ringOpacity}
                strokeDasharray={`${scaleFactor * 30} ${scaleFactor * 15}`}
              />
              <circle
                cx={dotX}
                cy={dotY}
                r={scaleFactor * (12 - idx * 2)}
                fill={`hsl(${190 + idx * 30}, 80%, 70%)`}
                opacity={0.8}
                filter="url(#softGlow)"
              />
            </g>
          );
        })}

        {/* Progress arc */}
        {(() => {
          const arcProgress = interpolate(frame, [30, durationInFrames - 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const arcR = R * 1.85;
          const startAngle = -90;
          const endAngle = startAngle + arcProgress * 360;
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          const x1 = cx + arcR * Math.cos(startRad);
          const y1 = cy + arcR * Math.sin(startRad);
          const x2 = cx + arcR * Math.cos(endRad);
          const y2 = cy + arcR * Math.sin(endRad);
          const largeArc = arcProgress > 0.5 ? 1 : 0;

          return (
            <g>
              {/* Track */}
              <circle cx={cx} cy={cy} r={arcR} fill="none" stroke="#0a2040" strokeWidth={scaleFactor * 8} />
              {/* Progress */}
              {arcProgress > 0 && (
                <path
                  d={`M ${x1} ${y1} A ${arcR} ${arcR} 0 ${largeArc} 1 ${x2} ${y2}`}
                  fill="none"
                  stroke="#00ffaa"
                  strokeWidth={scaleFactor * 6}
                  strokeLinecap="round"
                  opacity={0.8}
                  filter="url(#softGlow)"
                />
              )}
              {/* Leading dot */}
              <circle
                cx={x2}
                cy={y2}
                r={scaleFactor * 16}
                fill="#00ffaa"
                opacity={0.9}
                filter="url(#glowFilter)"
              />
              {/* Tick marks */}
              {Array.from({ length: 36 }, (_, i) => {
                const tickAngle = ((i * 10) - 90) * Math.PI / 180;
                const inner = arcR - scaleFactor * 15;
                const outer = arcR + scaleFactor * 15;
                const tx1 = cx + inner * Math.cos(tickAngle);
                const ty1 = cy + inner * Math.sin(tickAngle);
                const tx2 = cx + outer * Math.cos(tickAngle);
                const ty2 = cy + outer * Math.sin(tickAngle);
                const tickProgress = i / 36;
                return (
                  <line
                    key={`tick-${i}`}
                    x1={tx1} y1={ty1} x2={tx2} y2={ty2}
                    stroke={tickProgress <= arcProgress ? '#00ffaa' : '#0a3060'}
                    strokeWidth={scaleFactor * (i % 3 === 0 ? 3 : 1.5)}
                    opacity={tickProgress <= arcProgress ? 0.8 : 0.3}
                  />
                );
              })}
            </g>
          );
        })()}

        {/* Expansion particles */}
        {PARTICLES.map((p, i) => {
          const particleProgress = progressRatio;
          if (i / PARTICLES.length > particleProgress * 1.2) return null;
          const t = (frame * (p.speed / 500) + i * 0.13) % 1;
          const pAngle = (p.angle + frame * 0.3) * Math.PI / 180;
          const pR = R * 1.1 + t * R * 0.5;
          const px = cx + Math.cos(pAngle) * pR;
          const py = cy + Math.sin(pAngle) * pR * 0.7;
          const pOpacity = (1 - t) * 0.7;
          return (
            <circle
              key={`part-${i}`}
              cx={px}
              cy={py}
              r={p.size * scaleFactor * (1 + t)}
              fill={`hsl(${p.hue}, 90%, 70%)`}
              opacity={pOpacity}
            />
          );
        })}

        {/* Central lens flare on light sweep */}
        <circle
          cx={cx + Math.cos((lightSweepAngle * Math.PI) / 180) * R * 0.3}
          cy={cy}
          r={scaleFactor * 60}
          fill="radial"
          opacity={0.08 * glowPulse}
          filter="url(#glowFilter)"
          style={{ fill: '#ffffff' }}
        />
      </svg>
    </div>
  );
};