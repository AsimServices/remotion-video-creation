import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Pre-computed star field
const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 2731 + 17) % 3840,
  y: (i * 1337 + 53) % 2160,
  size: ((i * 7) % 4) + 1,
  opacity: ((i * 13) % 60 + 40) / 100,
}));

// Pre-computed aurora particles
const AURORA = Array.from({ length: 80 }, (_, i) => ({
  x: (i * 891 + 200) % 3840,
  y: (i * 613 + 100) % 800,
  size: ((i * 23) % 40) + 10,
  hue: (i * 37) % 120 + 120,
  opacity: ((i * 11) % 40 + 10) / 100,
}));

// North America simplified coastline path points (normalized 0-1)
const NA_COASTLINE_SEGMENTS = [
  // West coast
  { x1: 0.18, y1: 0.12, x2: 0.15, y2: 0.25 },
  { x1: 0.15, y1: 0.25, x2: 0.12, y2: 0.38 },
  { x1: 0.12, y1: 0.38, x2: 0.11, y2: 0.50 },
  { x1: 0.11, y1: 0.50, x2: 0.14, y2: 0.62 },
  { x1: 0.14, y1: 0.62, x2: 0.19, y2: 0.72 },
  // Gulf coast
  { x1: 0.19, y1: 0.72, x2: 0.28, y2: 0.76 },
  { x1: 0.28, y1: 0.76, x2: 0.36, y2: 0.74 },
  { x1: 0.36, y1: 0.74, x2: 0.42, y2: 0.78 },
  // East coast
  { x1: 0.42, y1: 0.78, x2: 0.48, y2: 0.68 },
  { x1: 0.48, y1: 0.68, x2: 0.52, y2: 0.55 },
  { x1: 0.52, y1: 0.55, x2: 0.54, y2: 0.42 },
  { x1: 0.54, y1: 0.42, x2: 0.52, y2: 0.28 },
  { x1: 0.52, y1: 0.28, x2: 0.48, y2: 0.18 },
  // Canada north
  { x1: 0.48, y1: 0.18, x2: 0.40, y2: 0.10 },
  { x1: 0.40, y1: 0.10, x2: 0.30, y2: 0.08 },
  { x1: 0.30, y1: 0.08, x2: 0.18, y2: 0.12 },
  // Interior borders
  { x1: 0.22, y1: 0.45, x2: 0.50, y2: 0.45 },
  { x1: 0.22, y1: 0.35, x2: 0.48, y2: 0.35 },
  // Mexico
  { x1: 0.19, y1: 0.72, x2: 0.22, y2: 0.82 },
  { x1: 0.22, y1: 0.82, x2: 0.28, y2: 0.88 },
  { x1: 0.28, y1: 0.88, x2: 0.36, y2: 0.90 },
  { x1: 0.36, y1: 0.90, x2: 0.42, y2: 0.85 },
  { x1: 0.42, y1: 0.85, x2: 0.42, y2: 0.78 },
];

// City dots on North America
const CITIES = [
  { x: 0.44, y: 0.38, name: 'ny' },
  { x: 0.35, y: 0.46, name: 'chi' },
  { x: 0.14, y: 0.42, name: 'la' },
  { x: 0.15, y: 0.32, name: 'sf' },
  { x: 0.40, y: 0.52, name: 'dal' },
  { x: 0.42, y: 0.28, name: 'bos' },
  { x: 0.38, y: 0.28, name: 'mon' },
  { x: 0.26, y: 0.20, name: 'van' },
  { x: 0.30, y: 0.55, name: 'hou' },
  { x: 0.45, y: 0.45, name: 'phi' },
];

export const SpinningEarthZoom: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const masterOpacity = Math.min(fadeIn, fadeOut);

  // Phase 1: spinning (0-250), Phase 2: deceleration (250-400), Phase 3: zoom focus (400-600)
  const spinPhase = Math.min(frame, 250);
  const spinSpeed = interpolate(frame, [0, 250, 400], [8, 8, 0], { extrapolateRight: 'clamp' });
  
  // Cumulative rotation
  const baseRotation = interpolate(frame, [0, 250], [0, 250 * 8], { extrapolateRight: 'clamp' });
  const decelRotation = interpolate(frame, [250, 400], [0, 180], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const totalRotation = (baseRotation + decelRotation) % 360;

  // Zoom: camera zooms in on North America
  const zoomScale = interpolate(frame, [380, 520], [1, 2.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Pan toward North America
  const panX = interpolate(frame, [380, 520], [0, -width * 0.18], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const panY = interpolate(frame, [380, 520], [0, -height * 0.08], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Neon coastline glow intensity
  const neonIntensity = interpolate(frame, [400, 480], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // City pulse
  const cityPulse = interpolate(
    (frame % 60) / 60,
    [0, 0.5, 1],
    [0.6, 1.0, 0.6]
  );

  const cx = width / 2;
  const cy = height / 2;
  const earthRadius = Math.min(width, height) * 0.35;

  // Grid lines for globe
  const latLines = [-60, -45, -30, -15, 0, 15, 30, 45, 60, 75];
  const lonLines = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <div
      style={{
        width,
        height,
        background: '#000008',
        overflow: 'hidden',
        opacity: masterOpacity,
        position: 'relative',
      }}
    >
      {/* Star field */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {STARS.map((star, i) => (
          <circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="white"
            opacity={star.opacity}
          />
        ))}
        {/* Aurora borealis */}
        {AURORA.map((a, i) => (
          <ellipse
            key={i}
            cx={a.x}
            cy={a.y}
            rx={a.size * 6}
            ry={a.size * 2}
            fill={`hsla(${a.hue}, 100%, 60%, ${a.opacity * neonIntensity * 0.5})`}
          />
        ))}
      </svg>

      {/* Main globe container with zoom/pan */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          transform: `translate(${panX}px, ${panY}px) scale(${zoomScale})`,
          transformOrigin: `${cx + width * 0.1}px ${cy}px`,
        }}
      >
        <svg width={width} height={height}>
          <defs>
            {/* Deep space gradient for ocean */}
            <radialGradient id="oceanGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#0a2a5e" />
              <stop offset="40%" stopColor="#061840" />
              <stop offset="100%" stopColor="#020a1a" />
            </radialGradient>

            {/* Land gradient */}
            <radialGradient id="landGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#1a4a2a" />
              <stop offset="60%" stopColor="#0d2e18" />
              <stop offset="100%" stopColor="#051208" />
            </radialGradient>

            {/* Atmosphere glow */}
            <radialGradient id="atmosGrad" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor="transparent" />
              <stop offset="92%" stopColor="rgba(30,120,255,0.15)" />
              <stop offset="96%" stopColor="rgba(60,160,255,0.3)" />
              <stop offset="100%" stopColor="rgba(100,200,255,0.05)" />
            </radialGradient>

            {/* Globe clip */}
            <clipPath id="globeClip">
              <circle cx={cx} cy={cy} r={earthRadius} />
            </clipPath>

            {/* Neon glow filter */}
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur1" />
              <feGaussianBlur stdDeviation="20" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Soft glow filter */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* City glow */}
            <filter id="cityGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Specular highlight */}
            <radialGradient id="specularGrad" cx="30%" cy="30%" r="50%">
              <stop offset="0%" stopColor="rgba(200,220,255,0.3)" />
              <stop offset="50%" stopColor="rgba(100,150,255,0.1)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Outer space glow */}
          <circle cx={cx} cy={cy} r={earthRadius * 1.15} fill="rgba(20,60,150,0.08)" />
          <circle cx={cx} cy={cy} r={earthRadius * 1.08} fill="rgba(30,80,200,0.12)" />

          {/* Earth base - ocean */}
          <circle cx={cx} cy={cy} r={earthRadius} fill="url(#oceanGrad)" />

          {/* Globe grid lines - clipped to sphere */}
          <g clipPath="url(#globeClip)" opacity="0.15">
            {/* Latitude lines - approximate as ellipses */}
            {latLines.map((lat, i) => {
              const latRad = (lat * Math.PI) / 180;
              const cosLat = Math.cos(latRad);
              const sinLat = Math.sin(latRad);
              const ry = earthRadius * Math.abs(cosLat);
              const yOffset = cy + earthRadius * sinLat;
              return (
                <ellipse
                  key={`lat-${i}`}
                  cx={cx}
                  cy={yOffset}
                  rx={earthRadius * cosLat}
                  ry={ry * 0.25}
                  fill="none"
                  stroke="rgba(100,180,255,0.4)"
                  strokeWidth="1"
                />
              );
            })}
            {/* Longitude lines - vertical ellipses that rotate with globe */}
            {lonLines.map((lon, i) => {
              const adjustedLon = ((lon + totalRotation) % 360) - 180;
              const xOffset = cx + earthRadius * Math.sin((adjustedLon * Math.PI) / 180);
              const scaleX = Math.abs(Math.cos((adjustedLon * Math.PI) / 180));
              return (
                <ellipse
                  key={`lon-${i}`}
                  cx={xOffset}
                  cy={cy}
                  rx={earthRadius * scaleX * 0.05}
                  ry={earthRadius}
                  fill="none"
                  stroke="rgba(100,180,255,0.3)"
                  strokeWidth="1"
                />
              );
            })}
          </g>

          {/* Continents - simplified shapes rotating with globe */}
          <g clipPath="url(#globeClip)">
            {/* Continent rendering using longitude-based projection */}
            {Array.from({ length: 360 }, (_, i) => {
              const lon = ((i + totalRotation) % 360) - 180;
              const x = cx + earthRadius * Math.sin((lon * Math.PI) / 180);
              const scale = Math.cos((lon * Math.PI) / 180);
              if (scale <= 0) return null;

              // Draw continent strips (simplified land masses)
              const strips = [];

              // North America band (lon -170 to -50)
              const naLon = lon;
              if (naLon >= -170 && naLon <= -50) {
                const latStart = naLon < -80 ? 0.2 : naLon < -100 ? 0.1 : 0.15;
                const latEnd = naLon < -80 ? 0.7 : naLon < -100 ? 0.65 : 0.75;
                strips.push({ latStart, latEnd, color: '#1a5a2a' });
              }

              // South America band (lon -80 to -35)
              if (naLon >= -80 && naLon <= -35) {
                strips.push({ latStart: 0.6, latEnd: 0.95, color: '#1a5a22' });
              }

              // Europe/Africa band (lon -15 to 55)
              if (naLon >= -15 && naLon <= 55) {
                if (naLon >= -15 && naLon <= 40) {
                  strips.push({ latStart: 0.1, latEnd: 0.45, color: '#1a5a28' }); // Europe
                }
                if (naLon >= -20 && naLon <= 55) {
                  strips.push({ latStart: 0.38, latEnd: 0.85, color: '#2a6a30' }); // Africa
                }
              }

              // Asia band (lon 25 to 145)
              if (naLon >= 25 && naLon <= 145) {
                strips.push({ latStart: 0.05, latEnd: 0.55, color: '#1a5a28' });
              }

              // Australia (lon 113 to 155)
              if (naLon >= 113 && naLon <= 155) {
                strips.push({ latStart: 0.68, latEnd: 0.88, color: '#1e5a22' });
              }

              return strips.map((strip, si) => {
                const yTop = cy - earthRadius + strip.latStart * 2 * earthRadius;
                const yBot = cy - earthRadius + strip.latEnd * 2 * earthRadius;
                return (
                  <rect
                    key={`cont-${i}-${si}`}
                    x={x - 2}
                    y={yTop}
                    width={4 * scale + 1}
                    height={yBot - yTop}
                    fill={strip.color}
                    opacity={scale}
                  />
                );
              });
            })}
          </g>

          {/* North America highlight overlay - fades in during zoom */}
          <g clipPath="url(#globeClip)" opacity={neonIntensity * 0.6}>
            {/* Highlight the North America region with cyan tint */}
            {Array.from({ length: 120 }, (_, i) => {
              const lon = ((-170 + i) + totalRotation) % 360 - 180;
              const x = cx + earthRadius * Math.sin((lon * Math.PI) / 180);
              const scale = Math.cos((lon * Math.PI) / 180);
              if (scale <= 0) return null;
              const naLon = -170 + i;
              if (naLon < -170 || naLon > -50) return null;
              return (
                <rect
                  key={`na-hl-${i}`}
                  x={x - 3}
                  y={cy - earthRadius * 0.7}
                  width={6 * scale}
                  height={earthRadius * 1.2}
                  fill="rgba(0,200,255,0.15)"
                  opacity={scale}
                />
              );
            })}
          </g>

          {/* Atmosphere */}
          <circle cx={cx} cy={cy} r={earthRadius} fill="url(#atmosGrad)" />
          <circle
            cx={cx}
            cy={cy}
            r={earthRadius}
            fill="none"
            stroke="rgba(80,160,255,0.4)"
            strokeWidth="3"
          />

          {/* Specular highlight */}
          <circle cx={cx} cy={cy} r={earthRadius} fill="url(#specularGrad)" clipPath="url(#globeClip)" />

          {/* North America Neon Coastline */}
          <g
            transform={`translate(${cx - earthRadius * 0.5}, ${cy - earthRadius * 0.6}) scale(${earthRadius * 1.1}, ${earthRadius * 1.1})`}
            opacity={neonIntensity}
            filter="url(#neonGlow)"
          >
            {NA_COASTLINE_SEGMENTS.map((seg, i) => {
              const animOffset = interpolate(
                frame,
                [400 + i * 3, 440 + i * 3],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              );
              return (
                <line
                  key={`coast-${i}`}
                  x1={seg.x1}
                  y1={seg.y1}
                  x2={seg.x2}
                  y2={seg.y2}
                  stroke={`rgba(0,255,220,${animOffset})`}
                  strokeWidth={0.008}
                  strokeLinecap="round"
                />
              );
            })}
            {/* Secondary glow layer */}
            {NA_COASTLINE_SEGMENTS.map((seg, i) => (
              <line
                key={`coast-glow-${i}`}
                x1={seg.x1}
                y1={seg.y1}
                x2={seg.x2}
                y2={seg.y2}
                stroke={`rgba(0,180,255,${neonIntensity * 0.5})`}
                strokeWidth={0.015}
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* City dots on North America */}
          <g
            transform={`translate(${cx - earthRadius * 0.5}, ${cy - earthRadius * 0.6}) scale(${earthRadius * 1.1}, ${earthRadius * 1.1})`}
            opacity={neonIntensity}
            filter="url(#cityGlow)"
          >
            {CITIES.map((city, i) => {
              const cityAppear = interpolate(
                frame,
                [460 + i * 8, 490 + i * 8],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              );
              return (
                <g key={`city-${i}`}>
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={0.012 * cityPulse}
                    fill="rgba(255,220,50,0)"
                    stroke="rgba(255,220,50,0.4)"
                    strokeWidth={0.006}
                    opacity={cityAppear}
                  />
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={0.006}
                    fill="rgba(255,240,100,1)"
                    opacity={cityAppear * cityPulse}
                  />
                </g>
              );
            })}
          </g>

          {/* Terminator line (day/night boundary) */}
          <g clipPath="url(#globeClip)">
            <ellipse
              cx={cx + earthRadius * 0.3}
              cy={cy}
              rx={earthRadius * 0.15}
              ry={earthRadius}
              fill="rgba(0,0,10,0.5)"
            />
          </g>

          {/* Outer atmosphere rings */}
          <circle
            cx={cx}
            cy={cy}
            r={earthRadius * 1.02}
            fill="none"
            stroke="rgba(60,140,255,0.15)"
            strokeWidth="8"
          />
          <circle
            cx={cx}
            cy={cy}
            r={earthRadius * 1.05}
            fill="none"
            stroke="rgba(40,100,220,0.08)"
            strokeWidth="12"
          />

          {/* Scan line effect during zoom */}
          {neonIntensity > 0 && (
            <g clipPath="url(#globeClip)" opacity={neonIntensity * 0.3}>
              {Array.from({ length: 20 }, (_, i) => {
                const scanY = cy - earthRadius + ((i / 20) * 2 * earthRadius);
                return (
                  <line
                    key={`scan-${i}`}
                    x1={cx - earthRadius}
                    y1={scanY}
                    x2={cx + earthRadius}
                    y2={scanY}
                    stroke="rgba(0,200,255,0.1)"
                    strokeWidth="1"
                  />
                );
              })}
            </g>
          )}

          {/* Vignette overlay */}
          <radialGradient id="vignetteGrad" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,8,0.7)" />
          </radialGradient>
          <rect x={0} y={0} width={width} height={height} fill="url(#vignetteGrad)" />
        </svg>
      </div>
    </div>
  );
};