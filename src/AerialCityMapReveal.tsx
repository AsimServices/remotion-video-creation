import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITY_MARKERS = Array.from({ length: 48 }, (_, i) => ({
  x: (i * 1733 + 200) % 3600 + 120,
  y: (i * 1237 + 150) % 1800 + 180,
  size: ((i * 7) % 6) + 4,
  delay: (i * 13) % 120,
  pulseSpeed: 0.8 + ((i * 3) % 5) * 0.15,
  brightness: 0.6 + ((i * 11) % 4) * 0.1,
  connectionTarget: (i * 17 + 3) % 48,
}));

const GRID_LINES_H = Array.from({ length: 18 }, (_, i) => ({
  y: (i / 17) * 2160,
  opacity: 0.03 + (i % 3 === 0 ? 0.04 : 0),
}));

const GRID_LINES_V = Array.from({ length: 32 }, (_, i) => ({
  x: (i / 31) * 3840,
  opacity: 0.03 + (i % 4 === 0 ? 0.04 : 0),
}));

const CONTINENT_PATHS = [
  // North America
  "M 480 520 L 560 480 L 700 460 L 780 500 L 820 560 L 800 640 L 740 680 L 680 700 L 620 680 L 560 620 L 500 580 Z",
  // South America
  "M 620 780 L 680 760 L 740 800 L 760 880 L 740 980 L 700 1060 L 660 1100 L 620 1060 L 600 980 L 590 880 Z",
  // Europe
  "M 1680 420 L 1780 400 L 1860 420 L 1900 460 L 1880 520 L 1820 540 L 1760 520 L 1700 500 L 1660 460 Z",
  // Africa
  "M 1780 580 L 1860 560 L 1940 600 L 1980 700 L 1960 820 L 1900 920 L 1840 960 L 1780 920 L 1740 820 L 1740 700 Z",
  // Asia
  "M 2100 380 L 2400 340 L 2700 360 L 2900 420 L 2980 500 L 2960 600 L 2880 660 L 2700 680 L 2500 660 L 2300 640 L 2120 580 L 2060 500 Z",
  // Australia
  "M 2780 900 L 2920 880 L 3040 920 L 3080 1020 L 3040 1120 L 2920 1140 L 2800 1100 L 2760 1000 Z",
];

const GLOW_RINGS = Array.from({ length: 6 }, (_, i) => ({
  delay: i * 20,
  maxRadius: 120 + i * 30,
}));

const STAR_PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  x: (i * 1847) % 3840,
  y: (i * 1123) % 2160,
  size: 1 + (i % 3),
  twinkleOffset: (i * 7) % 60,
}));

export const AerialCityMapReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const masterOpacity = fadeIn * fadeOut;

  // Phase 1: zoom in on single marker (0-150), Phase 2: pull back (150-400), Phase 3: full map (400-600)
  const zoomScale = interpolate(frame, [0, 150, 350, durationInFrames], [6, 5, 1.2, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const focusX = interpolate(frame, [0, 150, 350, durationInFrames], [2160, 2160, 1920, 1920], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const focusY = interpolate(frame, [0, 150, 350, durationInFrames], [1080, 1080, 1080, 1080], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateX = width / 2 - focusX * zoomScale;
  const translateY = height / 2 - focusY * zoomScale;

  // Markers reveal
  const markerReveal = interpolate(frame, [200, 420], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // Connection lines reveal
  const connectionReveal = interpolate(frame, [300, 500], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Continent opacity
  const continentOpacity = interpolate(frame, [150, 320], [0, 0.25], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Focus marker pulse
  const focusPulsePhase = (frame * 0.08) % (Math.PI * 2);
  const focusPulseScale = 1 + Math.sin(focusPulsePhase) * 0.3;
  const focusGlowOpacity = 0.4 + Math.sin(focusPulsePhase) * 0.3;

  // Focus marker ring expansions
  const ringProgress = (frame % 90) / 90;

  return (
    <div
      style={{
        width,
        height,
        background: '#03050f',
        overflow: 'hidden',
        opacity: masterOpacity,
        position: 'relative',
      }}
    >
      {/* Deep space background */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0a0f2e" />
            <stop offset="100%" stopColor="#01020a" />
          </radialGradient>
          <radialGradient id="focusGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#bgGlow)" />

        {/* Stars */}
        {STAR_PARTICLES.map((star, i) => {
          const twinkle = 0.3 + Math.abs(Math.sin((frame * 0.03 + star.twinkleOffset) * 0.5)) * 0.5;
          return (
            <circle
              key={`star-${i}`}
              cx={star.x}
              cy={star.y}
              r={star.size * 0.5}
              fill="#ffffff"
              opacity={twinkle * 0.4}
            />
          );
        })}
      </svg>

      {/* Main zoomable world map layer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          transform: `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`,
          transformOrigin: '0 0',
        }}
      >
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <radialGradient id="markerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="1" />
              <stop offset="60%" stopColor="#00d4ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="focusMarkerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00ffcc" stopOpacity="1" />
              <stop offset="50%" stopColor="#00d4ff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
            </radialGradient>
            <filter id="bloomFilter">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="softBloom">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid overlay */}
          {GRID_LINES_H.map((line, i) => (
            <line
              key={`gh-${i}`}
              x1={0} y1={line.y}
              x2={width} y2={line.y}
              stroke="#1a3a6a"
              strokeWidth="1"
              opacity={line.opacity}
            />
          ))}
          {GRID_LINES_V.map((line, i) => (
            <line
              key={`gv-${i}`}
              x1={line.x} y1={0}
              x2={line.x} y2={height}
              stroke="#1a3a6a"
              strokeWidth="1"
              opacity={line.opacity}
            />
          ))}

          {/* Continent silhouettes */}
          {CONTINENT_PATHS.map((path, i) => (
            <path
              key={`cont-${i}`}
              d={path}
              fill="#0d2a4a"
              stroke="#1a5a8a"
              strokeWidth="2"
              opacity={continentOpacity}
            />
          ))}

          {/* Connection lines between markers */}
          {CITY_MARKERS.slice(0, 24).map((marker, i) => {
            const target = CITY_MARKERS[marker.connectionTarget];
            const lineOpacity = connectionReveal * marker.brightness * 0.3;
            const animatedOffset = (frame * 2 + i * 15) % 200;
            return (
              <g key={`conn-${i}`}>
                <line
                  x1={marker.x} y1={marker.y}
                  x2={target.x} y2={target.y}
                  stroke="#00d4ff"
                  strokeWidth="0.8"
                  opacity={lineOpacity * 0.4}
                />
                <line
                  x1={marker.x} y1={marker.y}
                  x2={target.x} y2={target.y}
                  stroke="#00ffcc"
                  strokeWidth="1.5"
                  opacity={lineOpacity}
                  strokeDasharray="20 180"
                  strokeDashoffset={-animatedOffset}
                />
              </g>
            );
          })}

          {/* Secondary city markers */}
          {CITY_MARKERS.map((marker, i) => {
            if (i === 0) return null; // focus marker handled separately
            const pulse = Math.sin((frame * 0.06 * marker.pulseSpeed + marker.delay * 0.1) % (Math.PI * 2));
            const currentOpacity = markerReveal * marker.brightness;
            const glowR = marker.size * (2 + pulse * 0.8);

            return (
              <g key={`marker-${i}`} opacity={currentOpacity}>
                <circle cx={marker.x} cy={marker.y} r={glowR * 3} fill="url(#markerGlow)" opacity={0.4} />
                <circle
                  cx={marker.x} cy={marker.y}
                  r={glowR}
                  fill="none"
                  stroke="#00d4ff"
                  strokeWidth="1"
                  opacity={0.5 + pulse * 0.3}
                />
                <circle cx={marker.x} cy={marker.y} r={marker.size * 0.5} fill="#00d4ff" opacity={0.9} />
                <circle cx={marker.x} cy={marker.y} r={marker.size * 0.25} fill="#ffffff" opacity={0.95} />
              </g>
            );
          })}

          {/* Focus marker - central pulsing city (index 0 position: 2160, 1080) */}
          <g>
            {/* Expanding rings */}
            {GLOW_RINGS.map((ring, i) => {
              const ringPhase = ((ringProgress + ring.delay / 120) % 1);
              const ringR = ringPhase * ring.maxRadius;
              const ringOpacity = (1 - ringPhase) * 0.7;
              return (
                <circle
                  key={`ring-${i}`}
                  cx={2160} cy={1080}
                  r={ringR}
                  fill="none"
                  stroke="#00ffcc"
                  strokeWidth="2"
                  opacity={ringOpacity}
                />
              );
            })}

            {/* Outer glow */}
            <circle cx={2160} cy={1080} r={80 * focusPulseScale} fill="url(#focusMarkerGlow)" opacity={focusGlowOpacity} />

            {/* Bloom effect ring */}
            <circle
              cx={2160} cy={1080}
              r={30 * focusPulseScale}
              fill="none"
              stroke="#00ffcc"
              strokeWidth="3"
              opacity={0.8}
              filter="url(#bloomFilter)"
            />

            {/* Inner bright core */}
            <circle cx={2160} cy={1080} r={16} fill="#00d4ff" opacity={0.95} />
            <circle cx={2160} cy={1080} r={8} fill="#00ffee" opacity={1} />
            <circle cx={2160} cy={1080} r={3} fill="#ffffff" opacity={1} />

            {/* Cross-hair lines */}
            {[0, 90, 180, 270].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const len = 60 + Math.sin(focusPulsePhase) * 10;
              const innerLen = 25;
              return (
                <line
                  key={`ch-${i}`}
                  x1={2160 + Math.cos(rad) * innerLen}
                  y1={1080 + Math.sin(rad) * innerLen}
                  x2={2160 + Math.cos(rad) * len}
                  y2={1080 + Math.sin(rad) * len}
                  stroke="#00ffcc"
                  strokeWidth="2"
                  opacity={0.8}
                />
              );
            })}
          </g>

          {/* Atmospheric glow overlay centered on focus point */}
          <radialGradient id="atmosphereGlow" cx="50%" cy="50%" r="40%">
            <stop offset="0%" stopColor="#001a3a" stopOpacity="0" />
            <stop offset="60%" stopColor="#001a3a" stopOpacity="0" />
            <stop offset="100%" stopColor="#000510" stopOpacity="0.6" />
          </radialGradient>
        </svg>
      </div>

      {/* Vignette overlay */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="40%" stopColor="transparent" />
            <stop offset="100%" stopColor="#000508" stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#vignette)" />
      </svg>

      {/* Scan line effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0, 212, 255, 0.008) 3px,
            rgba(0, 212, 255, 0.008) 4px
          )`,
          pointerEvents: 'none',
        }}
      />

      {/* Horizontal scan sweep */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          background: `linear-gradient(
            to bottom,
            transparent ${((frame * 1.5) % 120) - 5}%,
            rgba(0, 212, 255, 0.04) ${((frame * 1.5) % 120)}%,
            transparent ${((frame * 1.5) % 120) + 2}%
          )`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};