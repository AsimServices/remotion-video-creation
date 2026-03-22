import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 2731 + 137) % 3840,
  y: (i * 1337 + 251) % 2160,
  size: ((i * 17) % 3) + 1,
  opacity: ((i * 13) % 7) / 10 + 0.3,
}));

const CONTINENTS = [
  {
    id: 'north-america',
    color: '#00e5ff',
    glowColor: '#00e5ff',
    paths: [
      'M 480 320 L 560 290 L 620 300 L 660 340 L 680 400 L 700 440 L 680 500 L 640 560 L 580 580 L 520 560 L 480 500 L 450 440 L 440 380 Z',
      'M 580 580 L 640 570 L 680 600 L 700 650 L 680 700 L 640 720 L 600 700 L 570 650 Z',
    ],
    delay: 0,
  },
  {
    id: 'south-america',
    color: '#69ff47',
    glowColor: '#69ff47',
    paths: [
      'M 540 740 L 590 720 L 640 730 L 670 780 L 680 850 L 660 930 L 630 1000 L 590 1050 L 550 1060 L 510 1040 L 490 980 L 480 900 L 490 820 L 510 770 Z',
    ],
    delay: 30,
  },
  {
    id: 'europe',
    color: '#ff6b35',
    glowColor: '#ff6b35',
    paths: [
      'M 920 240 L 980 220 L 1040 230 L 1080 260 L 1100 300 L 1080 340 L 1040 360 L 980 370 L 930 350 L 900 310 L 910 270 Z',
      'M 980 370 L 1020 360 L 1060 380 L 1080 420 L 1060 450 L 1020 460 L 980 440 L 960 400 Z',
    ],
    delay: 60,
  },
  {
    id: 'africa',
    color: '#ffd700',
    glowColor: '#ffd700',
    paths: [
      'M 960 460 L 1040 440 L 1100 460 L 1140 520 L 1160 600 L 1150 700 L 1120 800 L 1070 870 L 1010 900 L 950 880 L 910 810 L 890 720 L 880 620 L 900 530 Z',
    ],
    delay: 90,
  },
  {
    id: 'asia',
    color: '#ff3cac',
    glowColor: '#ff3cac',
    paths: [
      'M 1140 180 L 1300 150 L 1500 160 L 1650 200 L 1780 240 L 1860 300 L 1880 380 L 1840 450 L 1760 490 L 1640 500 L 1500 480 L 1380 460 L 1260 450 L 1160 420 L 1100 360 L 1100 290 Z',
      'M 1500 480 L 1580 490 L 1640 540 L 1660 610 L 1620 660 L 1560 670 L 1500 640 L 1470 580 Z',
    ],
    delay: 120,
  },
  {
    id: 'australia',
    color: '#bf00ff',
    glowColor: '#bf00ff',
    paths: [
      'M 1580 820 L 1680 800 L 1780 820 L 1840 880 L 1860 960 L 1820 1040 L 1740 1090 L 1640 1100 L 1560 1060 L 1520 980 L 1520 900 Z',
    ],
    delay: 150,
  },
];

const ORBIT_PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  angle: (i * 360) / 60,
  radius: 850 + ((i * 37) % 120),
  size: ((i * 7) % 4) + 2,
  speed: 0.3 + ((i * 13) % 10) / 20,
  opacity: 0.3 + ((i * 11) % 6) / 10,
}));

const GRID_LINES_LAT = Array.from({ length: 12 }, (_, i) => i);
const GRID_LINES_LON = Array.from({ length: 24 }, (_, i) => i);

export const DarkSpinningEarth: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const cx = width / 2;
  const cy = height / 2;
  const earthRadius = 720;

  const rotation = (frame * 0.25) % 360;
  const rotationRad = (rotation * Math.PI) / 180;

  const ambientPulse = Math.sin(frame * 0.04) * 0.5 + 0.5;

  return (
    <div style={{ width, height, background: '#000008', position: 'relative', overflow: 'hidden', opacity: globalOpacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="earthGrad" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#0d2b4a" />
            <stop offset="40%" stopColor="#071830" />
            <stop offset="100%" stopColor="#010810" />
          </radialGradient>
          <radialGradient id="atmosphereGrad" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="transparent" />
            <stop offset="85%" stopColor="#0a3d6b" stopOpacity="0.3" />
            <stop offset="95%" stopColor="#1a6bb5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#4db8ff" stopOpacity="0.15" />
          </radialGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a6bb5" stopOpacity="0" />
            <stop offset="70%" stopColor="#1a6bb5" stopOpacity="0" />
            <stop offset="90%" stopColor="#1a6bb5" stopOpacity={0.2 + ambientPulse * 0.1} />
            <stop offset="100%" stopColor="#4db8ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="specularGrad" cx="35%" cy="30%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#4db8ff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <clipPath id="earthClip">
            <circle cx={cx} cy={cy} r={earthRadius} />
          </clipPath>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="outerGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="40" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Stars */}
        {STARS.map((star, i) => (
          <circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="white"
            opacity={star.opacity * (0.6 + Math.sin(frame * 0.05 + i) * 0.4)}
          />
        ))}

        {/* Outer atmospheric glow */}
        <circle
          cx={cx}
          cy={cy}
          r={earthRadius + 90}
          fill="none"
          stroke="#1a6bb5"
          strokeWidth="80"
          opacity={0.08 + ambientPulse * 0.04}
          filter="url(#outerGlow)"
        />
        <circle
          cx={cx}
          cy={cy}
          r={earthRadius + 50}
          fill="none"
          stroke="#4db8ff"
          strokeWidth="40"
          opacity={0.12 + ambientPulse * 0.06}
        />

        {/* Earth base */}
        <circle cx={cx} cy={cy} r={earthRadius} fill="url(#earthGrad)" />

        {/* Ocean shimmer */}
        <g clipPath="url(#earthClip)">
          {Array.from({ length: 8 }, (_, i) => {
            const shimmerY = cy - earthRadius + (i / 8) * earthRadius * 2;
            const shimmerOpacity = Math.sin(frame * 0.03 + i * 0.8) * 0.03 + 0.02;
            return (
              <ellipse
                key={i}
                cx={cx + Math.sin(frame * 0.02 + i) * 100}
                cy={shimmerY}
                rx={earthRadius * 0.8}
                ry={30}
                fill="#4db8ff"
                opacity={shimmerOpacity}
              />
            );
          })}
        </g>

        {/* Grid lines */}
        <g clipPath="url(#earthClip)" opacity="0.08">
          {GRID_LINES_LAT.map((i) => {
            const lat = -90 + (i * 180) / 12;
            const latRad = (lat * Math.PI) / 180;
            const y = cy + Math.sin(latRad) * earthRadius;
            const rx = Math.cos(latRad) * earthRadius;
            return (
              <ellipse
                key={i}
                cx={cx}
                cy={y}
                rx={rx}
                ry={rx * 0.1}
                fill="none"
                stroke="#4db8ff"
                strokeWidth="1.5"
              />
            );
          })}
          {GRID_LINES_LON.map((i) => {
            const lon = (i * 360) / 24 + rotation;
            const lonRad = (lon * Math.PI) / 180;
            const rx = Math.abs(Math.cos(lonRad)) * earthRadius;
            const skewX = Math.sin(lonRad) * earthRadius;
            return (
              <ellipse
                key={i}
                cx={cx + skewX * 0.05}
                cy={cy}
                rx={rx * 0.05 + 2}
                ry={earthRadius}
                fill="none"
                stroke="#4db8ff"
                strokeWidth="1.5"
              />
            );
          })}
        </g>

        {/* Continents */}
        {CONTINENTS.map((continent) => {
          const brightStart = continent.delay;
          const brightEnd = continent.delay + 80;
          const brightness = interpolate(
            frame,
            [brightStart, brightEnd, brightEnd + 60, durationInFrames - 80],
            [0, 1, 1, 0.6],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const pulse = Math.sin(frame * 0.06 + continent.delay * 0.05) * 0.15 + 0.85;
          const finalBrightness = brightness * pulse;

          const continentOffset = Math.sin(rotationRad + continent.delay * 0.01) * 60;

          return (
            <g key={continent.id} clipPath="url(#earthClip)">
              <g transform={`translate(${continentOffset}, 0)`} filter="url(#softGlow)">
                {continent.paths.map((path, pi) => (
                  <path
                    key={pi}
                    d={path}
                    fill={continent.color}
                    opacity={finalBrightness * 0.9}
                    transform={`translate(${cx - 1920}, ${cy - 1080})`}
                  />
                ))}
                {continent.paths.map((path, pi) => (
                  <path
                    key={`stroke-${pi}`}
                    d={path}
                    fill="none"
                    stroke={continent.color}
                    strokeWidth="3"
                    opacity={finalBrightness}
                    transform={`translate(${cx - 1920}, ${cy - 1080})`}
                  />
                ))}
              </g>
            </g>
          );
        })}

        {/* Specular highlight */}
        <circle cx={cx} cy={cy} r={earthRadius} fill="url(#specularGrad)" />

        {/* Atmosphere overlay */}
        <circle cx={cx} cy={cy} r={earthRadius} fill="url(#atmosphereGrad)" />
        <circle cx={cx} cy={cy} r={earthRadius} fill="url(#glowGrad)" />

        {/* Night side shadow */}
        <clipPath id="nightClip">
          <circle cx={cx} cy={cy} r={earthRadius} />
        </clipPath>
        <g clipPath="url(#nightClip)">
          <ellipse
            cx={cx + earthRadius * 0.3}
            cy={cy}
            rx={earthRadius * 0.85}
            ry={earthRadius}
            fill="#000010"
            opacity="0.55"
          />
        </g>

        {/* Orbit ring particles */}
        {ORBIT_PARTICLES.map((p, i) => {
          const angle = ((p.angle + frame * p.speed * 0.5) % 360) * (Math.PI / 180);
          const px = cx + Math.cos(angle) * p.radius;
          const py = cy + Math.sin(angle) * p.radius * 0.35;
          const isVisible = Math.sin(angle) < 0.3;
          const continentColor = CONTINENTS[i % CONTINENTS.length].color;
          return (
            <circle
              key={i}
              cx={px}
              cy={py}
              r={p.size}
              fill={continentColor}
              opacity={isVisible ? p.opacity * (0.5 + ambientPulse * 0.5) : 0.05}
              filter={isVisible ? "url(#glow)" : undefined}
            />
          );
        })}

        {/* Orbit ring */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={900}
          ry={315}
          fill="none"
          stroke="#4db8ff"
          strokeWidth="1"
          opacity="0.12"
        />

        {/* Market coverage arcs */}
        {CONTINENTS.map((continent, i) => {
          const brightness = interpolate(
            frame,
            [continent.delay, continent.delay + 80],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const arcAngle = (i * 60) * (Math.PI / 180);
          const arcR = earthRadius + 30 + i * 18;
          const arcLength = brightness * 80;
          const x1 = cx + Math.cos(arcAngle) * arcR;
          const y1 = cy + Math.sin(arcAngle) * arcR * 0.35;
          const x2 = cx + Math.cos(arcAngle + arcLength * 0.01) * arcR;
          const y2 = cy + Math.sin(arcAngle + arcLength * 0.01) * arcR * 0.35;

          return (
            <g key={continent.id}>
              <path
                d={`M ${x1} ${y1} A ${arcR} ${arcR * 0.35} 0 0 1 ${x2} ${y2}`}
                fill="none"
                stroke={continent.color}
                strokeWidth="3"
                opacity={brightness * 0.8}
                filter="url(#glow)"
              />
              <circle
                cx={x1}
                cy={y1}
                r={5 + brightness * 6}
                fill={continent.color}
                opacity={brightness * 0.9}
                filter="url(#glow)"
              />
            </g>
          );
        })}

        {/* Connection lines from continents to orbit */}
        {CONTINENTS.map((continent, i) => {
          const brightness = interpolate(
            frame,
            [continent.delay + 40, continent.delay + 100],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const pulse = Math.sin(frame * 0.08 + i * 1.2) * 0.3 + 0.7;
          const lineAngle = (i * 60 + 15) * (Math.PI / 180);
          const innerR = earthRadius * 0.6;
          const outerR = earthRadius + 60 + i * 20;
          return (
            <line
              key={continent.id}
              x1={cx + Math.cos(lineAngle) * innerR}
              y1={cy + Math.sin(lineAngle) * innerR * 0.5}
              x2={cx + Math.cos(lineAngle) * outerR}
              y2={cy + Math.sin(lineAngle) * outerR * 0.35}
              stroke={continent.color}
              strokeWidth="1.5"
              opacity={brightness * pulse * 0.6}
              strokeDasharray="8 6"
            />
          );
        })}
      </svg>
    </div>
  );
};