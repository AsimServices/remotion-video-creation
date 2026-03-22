import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { name: 'Lagos', lat: 6.5244, lng: 3.3792 },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { name: 'Nairobi', lat: -1.2921, lng: 36.8219 },
  { name: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
  { name: 'Casablanca', lat: 33.5731, lng: -7.5898 },
  { name: 'Accra', lat: 5.6037, lng: -0.1870 },
  { name: 'Dar es Salaam', lat: -6.7924, lng: 39.2083 },
  { name: 'Addis Ababa', lat: 9.0320, lng: 38.7469 },
  { name: 'Kigali', lat: -1.9441, lng: 30.0619 },
  { name: 'Luanda', lat: -8.8400, lng: 13.2894 },
  { name: 'Abidjan', lat: 5.3600, lng: -4.0083 },
  { name: 'Kinshasa', lat: -4.3217, lng: 15.3222 },
  { name: 'Maputo', lat: -25.9692, lng: 32.5732 },
  { name: 'Dakar', lat: 14.7167, lng: -17.4677 },
  { name: 'Kampala', lat: 0.3476, lng: 32.5825 },
];

const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 1337 + 200) % 2160,
  size: ((i * 17) % 3) + 1,
  brightness: ((i * 31) % 60) + 40,
}));

const GRID_LINES = Array.from({ length: 24 }, (_, i) => i);

function latLngToSphere(lat: number, lng: number, rotationY: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180 + rotationY) * (Math.PI / 180);
  const x = Math.sin(phi) * Math.cos(theta);
  const y = Math.cos(phi);
  const z = Math.sin(phi) * Math.sin(theta);
  return { x, y, z };
}

function projectSphere(x: number, y: number, z: number, cx: number, cy: number, radius: number) {
  return {
    px: cx + x * radius,
    py: cy - y * radius,
    visible: z < 0,
  };
}

export const EarthAfricaZoom: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const phase1End = 180;
  const phase2End = 380;

  const earthRotation = interpolate(frame, [0, phase1End], [0, -17], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  });

  const spinRotation = interpolate(frame, [0, phase1End], [200, 20], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });

  const zoomScale = interpolate(frame, [phase1End, phase2End], [1, 2.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  });

  const cx = width / 2;
  const cy = height / 2;
  const baseRadius = Math.min(width, height) * 0.32;
  const radius = baseRadius * zoomScale;

  const glowIntensity = interpolate(frame, [phase1End, phase2End, durationInFrames - 50], [0.3, 1, 0.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const markerScale = interpolate(frame, [phase2End, phase2End + 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const continentPath = `
    M 0.18 -0.52
    C 0.15 -0.55 0.10 -0.57 0.05 -0.58
    C -0.02 -0.59 -0.08 -0.57 -0.12 -0.53
    C -0.18 -0.48 -0.20 -0.42 -0.22 -0.35
    C -0.24 -0.28 -0.23 -0.22 -0.20 -0.15
    C -0.18 -0.10 -0.22 -0.05 -0.24 0.02
    C -0.26 0.10 -0.25 0.18 -0.22 0.26
    C -0.18 0.36 -0.12 0.44 -0.05 0.50
    C 0.02 0.56 0.08 0.58 0.12 0.55
    C 0.18 0.50 0.20 0.42 0.22 0.34
    C 0.24 0.25 0.22 0.16 0.20 0.08
    C 0.18 0.02 0.20 -0.04 0.22 -0.10
    C 0.24 -0.18 0.24 -0.26 0.22 -0.34
    C 0.20 -0.42 0.18 -0.48 0.18 -0.52 Z
  `;

  const africaOutline = [
    [0.05, -0.55], [0.14, -0.52], [0.20, -0.45], [0.22, -0.38],
    [0.20, -0.30], [0.22, -0.22], [0.24, -0.14], [0.24, -0.06],
    [0.22, 0.04], [0.20, 0.12], [0.22, 0.20], [0.22, 0.30],
    [0.18, 0.40], [0.12, 0.50], [0.06, 0.56], [-0.02, 0.58],
    [-0.10, 0.54], [-0.16, 0.46], [-0.20, 0.36], [-0.22, 0.26],
    [-0.24, 0.16], [-0.24, 0.06], [-0.22, -0.02], [-0.20, -0.10],
    [-0.22, -0.18], [-0.22, -0.28], [-0.20, -0.36], [-0.16, -0.44],
    [-0.10, -0.52], [-0.04, -0.57], [0.05, -0.55],
  ];

  const africaD = africaOutline.map((p, i) => {
    const [lngN, latN] = p;
    const lat = latN * 90;
    const lng = lngN * 90 + 20;
    const sp = latLngToSphere(lat, lng, spinRotation);
    const proj = projectSphere(sp.x, sp.y, sp.z, cx, cy, radius);
    return `${i === 0 ? 'M' : 'L'} ${proj.px} ${proj.py}`;
  }).join(' ') + ' Z';

  return (
    <div style={{ width, height, background: '#000308', position: 'relative', overflow: 'hidden', opacity }}>
      {/* Stars */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {STARS.map((star, i) => {
          const twinkle = Math.sin(frame * 0.05 + i * 0.7) * 0.3 + 0.7;
          return (
            <circle
              key={i}
              cx={star.x}
              cy={star.y}
              r={star.size}
              fill={`rgba(200, 220, 255, ${(star.brightness / 100) * twinkle})`}
            />
          );
        })}
      </svg>

      {/* Globe glow outer */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0066cc" stopOpacity={0.0} />
            <stop offset="60%" stopColor="#0044aa" stopOpacity={0.15 * glowIntensity} />
            <stop offset="85%" stopColor="#0022aa" stopOpacity={0.35 * glowIntensity} />
            <stop offset="100%" stopColor="#001166" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="globeSurface" cx="38%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#1a3a6e" stopOpacity={0.9} />
            <stop offset="40%" stopColor="#0d2244" stopOpacity={0.95} />
            <stop offset="100%" stopColor="#060e22" stopOpacity={1} />
          </radialGradient>
          <radialGradient id="africaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity={0.3 * glowIntensity} />
            <stop offset="100%" stopColor="#00aa44" stopOpacity={0} />
          </radialGradient>
          <filter id="blur1">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <clipPath id="globeClip">
            <circle cx={cx} cy={cy} r={radius} />
          </clipPath>
        </defs>

        {/* Atmosphere glow */}
        <circle cx={cx} cy={cy} r={radius * 1.12} fill="url(#globeGlow)" />
        <circle cx={cx} cy={cy} r={radius * 1.04} fill="none" stroke="#1155cc" strokeWidth={radius * 0.015} opacity={0.4 * glowIntensity} />

        {/* Globe base */}
        <circle cx={cx} cy={cy} r={radius} fill="url(#globeSurface)" />

        {/* Grid lines */}
        <g clipPath="url(#globeClip)">
          {GRID_LINES.map((i) => {
            const lat = -90 + i * 15;
            const points = Array.from({ length: 73 }, (_, j) => {
              const lng = -180 + j * 5;
              const sp = latLngToSphere(lat, lng, spinRotation);
              const proj = projectSphere(sp.x, sp.y, sp.z, cx, cy, radius);
              return proj.visible ? null : `${proj.px},${proj.py}`;
            }).filter(Boolean);

            const lngLines = Array.from({ length: 73 }, (_, j) => {
              const lngV = -180 + i * 15;
              const latV = -90 + j * 2.5;
              const sp = latLngToSphere(latV, lngV, spinRotation);
              const proj = projectSphere(sp.x, sp.y, sp.z, cx, cy, radius);
              return proj.visible ? null : `${proj.px},${proj.py}`;
            }).filter(Boolean);

            return (
              <g key={i}>
                {points.length > 2 && (
                  <polyline
                    points={points.join(' ')}
                    fill="none"
                    stroke="#1a3a6e"
                    strokeWidth={1.5}
                    opacity={0.4}
                  />
                )}
                {lngLines.length > 2 && (
                  <polyline
                    points={lngLines.join(' ')}
                    fill="none"
                    stroke="#1a3a6e"
                    strokeWidth={1.5}
                    opacity={0.4}
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* Africa continent */}
        <g clipPath="url(#globeClip)">
          <path
            d={africaD}
            fill="#0a2a1a"
            stroke="#00cc66"
            strokeWidth={3}
            opacity={0.85}
          />
          <path
            d={africaD}
            fill="none"
            stroke="#00ff88"
            strokeWidth={6}
            opacity={0.3 * glowIntensity}
            filter="url(#blur2)"
          />
        </g>

        {/* Globe highlight */}
        <circle
          cx={cx - radius * 0.25}
          cy={cy - radius * 0.28}
          r={radius * 0.35}
          fill="none"
          stroke="white"
          strokeWidth={radius * 0.02}
          opacity={0.06}
        />

        {/* City markers */}
        {CITIES.map((city, i) => {
          const sp = latLngToSphere(city.lat, city.lng, spinRotation);
          const proj = projectSphere(sp.x, sp.y, sp.z, cx, cy, radius);
          if (proj.visible) return null;

          const pulse1 = Math.sin(frame * 0.08 + i * 0.9) * 0.5 + 0.5;
          const pulse2 = Math.sin(frame * 0.06 + i * 1.3 + 1) * 0.5 + 0.5;
          const markerOpacity = markerScale * (0.6 + pulse1 * 0.4);
          const ringRadius1 = (12 + pulse1 * 20) * (radius / baseRadius) * markerScale;
          const ringRadius2 = (20 + pulse2 * 30) * (radius / baseRadius) * markerScale;
          const dotRadius = 5 * (radius / baseRadius) * markerScale;

          return (
            <g key={city.name}>
              <circle
                cx={proj.px}
                cy={proj.py}
                r={ringRadius2}
                fill="none"
                stroke="#00ff88"
                strokeWidth={1.5}
                opacity={markerOpacity * 0.3}
              />
              <circle
                cx={proj.px}
                cy={proj.py}
                r={ringRadius1}
                fill="none"
                stroke="#00ffaa"
                strokeWidth={2}
                opacity={markerOpacity * 0.5}
              />
              <circle
                cx={proj.px}
                cy={proj.py}
                r={dotRadius}
                fill="#00ff88"
                opacity={markerOpacity * 0.9}
              />
              <circle
                cx={proj.px}
                cy={proj.py}
                r={dotRadius * 2}
                fill="#00ff88"
                opacity={markerOpacity * 0.2}
                filter="url(#blur1)"
              />
            </g>
          );
        })}

        {/* Terminator shadow */}
        <g clipPath="url(#globeClip)">
          <circle
            cx={cx + radius * 0.5}
            cy={cy}
            r={radius * 1.1}
            fill="rgba(0,0,0,0.45)"
          />
        </g>
      </svg>

      {/* Scan line overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width, height,
        background: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,20,60,0.03) 3px, rgba(0,20,60,0.03) 4px)`,
        pointerEvents: 'none',
      }} />
    </div>
  );
};