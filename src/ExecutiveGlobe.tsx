import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const LATITUDE_RINGS = Array.from({ length: 13 }, (_, i) => ({
  lat: -90 + i * 15,
  opacity: i === 6 ? 1 : 0.4 + (i % 3) * 0.15,
  strokeWidth: i === 6 ? 3 : 1.5,
}));

const LONGITUDE_LINES = Array.from({ length: 24 }, (_, i) => ({
  angle: i * 15,
  opacity: 0.2 + (i % 4) * 0.05,
}));

const REGIONS = [
  { cx: 0.52, cy: 0.38, rx: 0.08, ry: 0.06, label: 'EU', delay: 0 },
  { cx: 0.22, cy: 0.42, rx: 0.09, ry: 0.07, label: 'NA', delay: 40 },
  { cx: 0.78, cy: 0.44, rx: 0.1, ry: 0.07, label: 'AS', delay: 80 },
  { cx: 0.5, cy: 0.65, rx: 0.06, ry: 0.05, label: 'AF', delay: 120 },
  { cx: 0.28, cy: 0.62, rx: 0.06, ry: 0.05, label: 'SA', delay: 160 },
  { cx: 0.82, cy: 0.68, rx: 0.05, ry: 0.04, label: 'OC', delay: 200 },
];

const STARS = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 1337 + 200) % 2160,
  r: ((i * 97) % 4) + 1,
  opacity: 0.3 + (i % 5) * 0.12,
  twinkleSeed: (i * 53) % 100,
}));

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  angle: (i * 360) / 60,
  radius: 0.32 + (i % 5) * 0.015,
  speed: 0.3 + (i % 7) * 0.08,
  size: ((i * 37) % 6) + 3,
  opacity: 0.4 + (i % 4) * 0.12,
}));

const ARC_PATHS = [
  { x1: 0.22, y1: 0.42, x2: 0.52, y2: 0.38, delay: 60 },
  { x1: 0.52, y1: 0.38, x2: 0.78, y2: 0.44, delay: 90 },
  { x1: 0.22, y1: 0.42, x2: 0.28, y2: 0.62, delay: 120 },
  { x1: 0.78, y1: 0.44, x2: 0.82, y2: 0.68, delay: 150 },
  { x1: 0.52, y1: 0.38, x2: 0.5, y2: 0.65, delay: 180 },
];

function projectLatLng(lat: number, lng: number, cx: number, cy: number, r: number) {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const x = cx + r * Math.cos(latRad) * Math.sin(lngRad);
  const y = cy - r * Math.sin(latRad);
  return { x, y };
}

function getLatitudeRingEllipse(lat: number, cx: number, cy: number, r: number) {
  const latRad = (lat * Math.PI) / 180;
  const radiusX = r * Math.cos(latRad);
  const centerY = cy - r * Math.sin(latRad);
  return { radiusX, centerY };
}

export const ExecutiveGlobe: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const masterOpacity = Math.min(fadeIn, fadeOut);

  const rotation = interpolate(frame, [0, durationInFrames], [0, 360]);
  const rotationRad = (rotation * Math.PI) / 180;

  const cx = width / 2;
  const cy = height / 2;
  const globeR = Math.min(width, height) * 0.36;

  const goldColor = '#D4AF37';
  const goldLight = '#F5E07A';
  const goldDark = '#A8860C';
  const accentBlue = '#4FC3F7';
  const accentCyan = '#00E5FF';

  const atmospherePulse = 0.85 + 0.15 * Math.sin((frame * Math.PI * 2) / 90);

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 50% 50%, #0a0d1a 0%, #020408 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, opacity: masterOpacity }}
      >
        <defs>
          <radialGradient id="globeGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#1a2744" stopOpacity="1" />
            <stop offset="50%" stopColor="#0d1a35" stopOpacity="1" />
            <stop offset="100%" stopColor="#060e20" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="atmosphereGrad" cx="50%" cy="50%" r="50%">
            <stop offset="80%" stopColor="#1a3a6e" stopOpacity="0" />
            <stop offset="95%" stopColor="#2255aa" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3399ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={goldColor} stopOpacity="0" />
            <stop offset="70%" stopColor={goldColor} stopOpacity="0.04" />
            <stop offset="100%" stopColor={goldColor} stopOpacity="0.18" />
          </radialGradient>
          <radialGradient id="specularGrad" cx="35%" cy="30%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <clipPath id="globeClip">
            <circle cx={cx} cy={cy} r={globeR} />
          </clipPath>
          <filter id="goldGlow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="regionGlow">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="particleGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Stars */}
        {STARS.map((s, i) => {
          const twinkle = 0.5 + 0.5 * Math.sin((frame * Math.PI * 2) / 60 + s.twinkleSeed);
          return (
            <circle
              key={`star-${i}`}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="white"
              opacity={s.opacity * (0.7 + 0.3 * twinkle)}
            />
          );
        })}

        {/* Outer glow ring */}
        <circle
          cx={cx}
          cy={cy}
          r={globeR * 1.12 * atmospherePulse}
          fill="none"
          stroke={goldColor}
          strokeWidth="2"
          opacity="0.08"
        />
        <circle
          cx={cx}
          cy={cy}
          r={globeR * 1.06 * atmospherePulse}
          fill="none"
          stroke={goldColor}
          strokeWidth="1"
          opacity="0.12"
        />

        {/* Atmosphere halo */}
        <circle cx={cx} cy={cy} r={globeR * 1.05} fill="url(#atmosphereGrad)" opacity="0.9" />

        {/* Globe body */}
        <circle cx={cx} cy={cy} r={globeR} fill="url(#globeGrad)" />

        {/* Grid lines clipped to globe */}
        <g clipPath="url(#globeClip)">
          {/* Longitude lines */}
          {LONGITUDE_LINES.map((line, i) => {
            const angleOffset = rotationRad + (line.angle * Math.PI) / 180;
            const points: string[] = [];
            for (let lat = -85; lat <= 85; lat += 5) {
              const latRad = (lat * Math.PI) / 180;
              const x = cx + globeR * Math.cos(latRad) * Math.sin(angleOffset);
              const y = cy - globeR * Math.sin(latRad);
              points.push(`${x},${y}`);
            }
            const cosAngle = Math.cos(angleOffset);
            const isVisible = cosAngle > -0.2;
            return (
              <polyline
                key={`lon-${i}`}
                points={points.join(' ')}
                fill="none"
                stroke={goldColor}
                strokeWidth="0.8"
                opacity={isVisible ? line.opacity * (0.5 + 0.5 * cosAngle) : 0}
              />
            );
          })}

          {/* Latitude rings */}
          {LATITUDE_RINGS.map((ring, i) => {
            const { radiusX, centerY } = getLatitudeRingEllipse(ring.lat, cx, cy, globeR);
            const isEquator = ring.lat === 0;
            const pulse = isEquator ? 1 + 0.04 * Math.sin((frame * Math.PI * 2) / 60) : 1;
            return (
              <ellipse
                key={`lat-${i}`}
                cx={cx}
                cy={centerY}
                rx={radiusX * pulse}
                ry={globeR * 0.08}
                fill="none"
                stroke={isEquator ? goldLight : goldColor}
                strokeWidth={ring.strokeWidth * (isEquator ? 1.5 : 1)}
                opacity={ring.opacity}
                filter={isEquator ? 'url(#goldGlow)' : undefined}
              />
            );
          })}

          {/* Tropic rings highlighted */}
          {[23.5, -23.5, 66.5, -66.5].map((lat, i) => {
            const { radiusX, centerY } = getLatitudeRingEllipse(lat, cx, cy, globeR);
            const pulse = 1 + 0.06 * Math.sin((frame * Math.PI * 2) / 75 + i * 1.2);
            return (
              <ellipse
                key={`tropic-${i}`}
                cx={cx}
                cy={centerY}
                rx={radiusX * pulse}
                ry={globeR * 0.08}
                fill="none"
                stroke={goldDark}
                strokeWidth="1.5"
                strokeDasharray="12 8"
                opacity="0.5"
              />
            );
          })}
        </g>

        {/* Globe outer edge */}
        <circle
          cx={cx}
          cy={cy}
          r={globeR}
          fill="none"
          stroke={goldColor}
          strokeWidth="2.5"
          opacity="0.7"
        />

        {/* Specular highlight */}
        <circle cx={cx} cy={cy} r={globeR} fill="url(#specularGrad)" />
        <circle cx={cx} cy={cy} r={globeR} fill="url(#glowGrad)" />

        {/* Regional highlights */}
        {REGIONS.map((region, i) => {
          const pulseProgress = Math.max(0, frame - region.delay) / 90;
          const localFrame = frame - region.delay;
          if (localFrame < 0) return null;

          const baseX = region.cx * width;
          const baseY = region.cy * height;

          const dist = Math.sqrt(
            Math.pow(baseX - cx, 2) + Math.pow(baseY - cy, 2)
          );
          const onGlobe = dist < globeR * 0.95;
          if (!onGlobe) return null;

          const pulseA = 0.5 + 0.5 * Math.sin((frame * Math.PI * 2) / 80 + i * 1.3);
          const pulseB = 0.5 + 0.5 * Math.sin((frame * Math.PI * 2) / 55 + i * 0.8 + 2);

          const rxPx = region.rx * width;
          const ryPy = region.ry * height;

          const entryOpacity = interpolate(localFrame, [0, 40], [0, 1], { extrapolateRight: 'clamp' });

          const outerPulse = 1 + 0.25 * pulseA;
          const innerPulse = 1 + 0.1 * pulseB;

          return (
            <g key={`region-${i}`} opacity={entryOpacity} filter="url(#regionGlow)">
              {/* Outer glow ring */}
              <ellipse
                cx={baseX}
                cy={baseY}
                rx={rxPx * outerPulse * 1.6}
                ry={ryPy * outerPulse * 1.6}
                fill="none"
                stroke={accentCyan}
                strokeWidth="1.5"
                opacity={0.15 * pulseA}
              />
              {/* Mid ring */}
              <ellipse
                cx={baseX}
                cy={baseY}
                rx={rxPx * innerPulse * 1.2}
                ry={ryPy * innerPulse * 1.2}
                fill="none"
                stroke={accentBlue}
                strokeWidth="2"
                opacity={0.3 * pulseB}
              />
              {/* Core fill */}
              <ellipse
                cx={baseX}
                cy={baseY}
                rx={rxPx * 0.8}
                ry={ryPy * 0.8}
                fill={accentCyan}
                opacity={0.08 + 0.06 * pulseA}
              />
              {/* Center dot */}
              <circle
                cx={baseX}
                cy={baseY}
                r={8 + 4 * pulseB}
                fill={goldLight}
                opacity={0.8 + 0.2 * pulseA}
              />
              <circle
                cx={baseX}
                cy={baseY}
                r={4}
                fill="white"
                opacity="0.9"
              />
            </g>
          );
        })}

        {/* Arc connections between regions */}
        {ARC_PATHS.map((arc, i) => {
          const localFrame = frame - arc.delay;
          if (localFrame < 0) return null;

          const x1 = arc.x1 * width;
          const y1 = arc.y1 * height;
          const x2 = arc.x2 * width;
          const y2 = arc.y2 * height;

          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2 - 120;

          const dashProgress = interpolate(localFrame, [0, 80], [0, 1], { extrapolateRight: 'clamp' });
          const pathLength = 800;
          const dashOffset = pathLength * (1 - dashProgress);

          const pulse = 0.5 + 0.5 * Math.sin((frame * Math.PI * 2) / 70 + i * 1.5);
          const arcOpacity = interpolate(localFrame, [0, 40], [0, 0.7], { extrapolateRight: 'clamp' }) * (0.5 + 0.5 * pulse);

          return (
            <g key={`arc-${i}`}>
              <path
                d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                fill="none"
                stroke={goldColor}
                strokeWidth="2"
                strokeDasharray={`${pathLength}`}
                strokeDashoffset={dashOffset}
                opacity={arcOpacity}
              />
              {/* Moving dot along path */}
              {dashProgress > 0.1 && (
                <circle
                  cx={x1 + (x2 - x1) * dashProgress}
                  cy={y1 + (y2 - y1) * dashProgress - 120 * Math.sin(dashProgress * Math.PI)}
                  r="6"
                  fill={goldLight}
                  opacity={0.9 * pulse}
                />
              )}
            </g>
          );
        })}

        {/* Orbiting particles */}
        {PARTICLES.map((p, i) => {
          const angle = rotationRad * p.speed + (p.angle * Math.PI) / 180;
          const orbitR = globeR * p.radius;
          const x = cx + orbitR * Math.cos(angle);
          const y = cy + orbitR * 0.3 * Math.sin(angle);
          const zDepth = Math.cos(angle);
          const isInFront = zDepth > 0;

          return (
            <circle
              key={`particle-${i}`}
              cx={x}
              cy={y}
              r={p.size * (0.6 + 0.4 * Math.abs(zDepth))}
              fill={isInFront ? goldLight : goldDark}
              opacity={p.opacity * (0.3 + 0.7 * Math.abs(zDepth))}
              filter="url(#particleGlow)"
            />
          );
        })}

        {/* Equatorial gold band accent */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={globeR + 8}
          ry={globeR * 0.08 + 4}
          fill="none"
          stroke={goldColor}
          strokeWidth="4"
          opacity={0.15 + 0.1 * Math.sin((frame * Math.PI * 2) / 80)}
          filter="url(#goldGlow)"
        />

        {/* Corner decorative elements */}
        {[
          { x: 120, y: 120 },
          { x: width - 120, y: 120 },
          { x: 120, y: height - 120 },
          { x: width - 120, y: height - 120 },
        ].map((corner, i) => {
          const pulse = 1 + 0.1 * Math.sin((frame * Math.PI * 2) / 90 + i * Math.PI / 2);
          return (
            <g key={`corner-${i}`}>
              <circle
                cx={corner.x}
                cy={corner.y}
                r={30 * pulse}
                fill="none"
                stroke={goldColor}
                strokeWidth="1.5"
                opacity="0.3"
              />
              <circle
                cx={corner.x}
                cy={corner.y}
                r={15}
                fill="none"
                stroke={goldColor}
                strokeWidth="2.5"
                opacity="0.5"
              />
              <circle
                cx={corner.x}
                cy={corner.y}
                r={5}
                fill={goldColor}
                opacity="0.7"
              />
            </g>
          );
        })}

        {/* Top gradient fade */}
        <defs>
          <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020408" stopOpacity="0.6" />
            <stop offset="20%" stopColor="#020408" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="80%" stopColor="#020408" stopOpacity="0" />
            <stop offset="100%" stopColor="#020408" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={width} height={height} fill="url(#topFade)" />
        <rect x="0" y="0" width={width} height={height} fill="url(#bottomFade)" />
      </svg>
    </div>
  );
};