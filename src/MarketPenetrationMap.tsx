import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { name: 'London', x: 0.48, y: 0.18, size: 14, delay: 0 },
  { name: 'Paris', x: 0.495, y: 0.22, size: 12, delay: 15 },
  { name: 'Berlin', x: 0.515, y: 0.19, size: 11, delay: 28 },
  { name: 'Madrid', x: 0.465, y: 0.26, size: 10, delay: 40 },
  { name: 'Rome', x: 0.515, y: 0.27, size: 10, delay: 52 },
  { name: 'Amsterdam', x: 0.495, y: 0.175, size: 9, delay: 60 },
  { name: 'Brussels', x: 0.49, y: 0.195, size: 8, delay: 68 },
  { name: 'Vienna', x: 0.525, y: 0.21, size: 9, delay: 75 },
  { name: 'Warsaw', x: 0.535, y: 0.185, size: 9, delay: 82 },
  { name: 'Stockholm', x: 0.515, y: 0.13, size: 9, delay: 88 },
  { name: 'Oslo', x: 0.505, y: 0.12, size: 8, delay: 94 },
  { name: 'Helsinki', x: 0.535, y: 0.115, size: 8, delay: 100 },
  { name: 'Copenhagen', x: 0.51, y: 0.155, size: 8, delay: 106 },
  { name: 'Zurich', x: 0.505, y: 0.225, size: 8, delay: 112 },
  { name: 'Prague', x: 0.525, y: 0.2, size: 8, delay: 118 },
  { name: 'Budapest', x: 0.535, y: 0.215, size: 8, delay: 124 },
  { name: 'Bucharest', x: 0.55, y: 0.235, size: 8, delay: 130 },
  { name: 'Kyiv', x: 0.56, y: 0.2, size: 9, delay: 136 },
  { name: 'Moscow', x: 0.58, y: 0.155, size: 13, delay: 142 },
  { name: 'Istanbul', x: 0.555, y: 0.26, size: 11, delay: 150 },
  { name: 'Athens', x: 0.535, y: 0.275, size: 9, delay: 158 },
  { name: 'Lisbon', x: 0.455, y: 0.265, size: 9, delay: 164 },
  { name: 'Dublin', x: 0.455, y: 0.165, size: 8, delay: 170 },
  { name: 'Edinburgh', x: 0.465, y: 0.145, size: 7, delay: 176 },
  { name: 'Minsk', x: 0.555, y: 0.175, size: 8, delay: 182 },
  { name: 'Riga', x: 0.535, y: 0.145, size: 7, delay: 188 },
  { name: 'Tallinn', x: 0.54, y: 0.13, size: 7, delay: 194 },
  { name: 'Vilnius', x: 0.54, y: 0.155, size: 7, delay: 200 },
  { name: 'Sofia', x: 0.545, y: 0.245, size: 7, delay: 206 },
  { name: 'Zagreb', x: 0.525, y: 0.23, size: 7, delay: 212 },
  { name: 'Belgrade', x: 0.54, y: 0.235, size: 8, delay: 218 },
  { name: 'Sarajevo', x: 0.535, y: 0.245, size: 7, delay: 224 },
  { name: 'Skopje', x: 0.54, y: 0.258, size: 6, delay: 230 },
  { name: 'Tirana', x: 0.535, y: 0.265, size: 6, delay: 236 },
  { name: 'Tbilisi', x: 0.585, y: 0.255, size: 8, delay: 242 },
  { name: 'Baku', x: 0.6, y: 0.255, size: 8, delay: 248 },
  { name: 'Yerevan', x: 0.59, y: 0.26, size: 7, delay: 254 },
  { name: 'Ankara', x: 0.565, y: 0.26, size: 9, delay: 260 },
  { name: 'Nicosia', x: 0.565, y: 0.278, size: 6, delay: 266 },
  { name: 'Beirut', x: 0.57, y: 0.285, size: 8, delay: 272 },
  { name: 'Damascus', x: 0.575, y: 0.29, size: 8, delay: 278 },
  { name: 'Baghdad', x: 0.595, y: 0.29, size: 10, delay: 284 },
  { name: 'Tehran', x: 0.615, y: 0.27, size: 11, delay: 290 },
  { name: 'Riyadh', x: 0.59, y: 0.315, size: 10, delay: 296 },
  { name: 'Dubai', x: 0.62, y: 0.315, size: 10, delay: 302 },
  { name: 'Muscat', x: 0.63, y: 0.325, size: 8, delay: 308 },
  { name: 'Karachi', x: 0.645, y: 0.305, size: 11, delay: 314 },
  { name: 'Mumbai', x: 0.655, y: 0.33, size: 13, delay: 320 },
  { name: 'Delhi', x: 0.665, y: 0.29, size: 14, delay: 326 },
  { name: 'Kolkata', x: 0.685, y: 0.305, size: 11, delay: 332 },
  { name: 'Dhaka', x: 0.695, y: 0.305, size: 11, delay: 338 },
  { name: 'Yangon', x: 0.715, y: 0.315, size: 10, delay: 344 },
  { name: 'Bangkok', x: 0.72, y: 0.33, size: 12, delay: 350 },
  { name: 'KualaLumpur', x: 0.73, y: 0.355, size: 11, delay: 356 },
  { name: 'Singapore', x: 0.735, y: 0.365, size: 12, delay: 362 },
  { name: 'Jakarta', x: 0.735, y: 0.38, size: 13, delay: 368 },
  { name: 'Manila', x: 0.765, y: 0.34, size: 12, delay: 374 },
  { name: 'HoChiMinh', x: 0.74, y: 0.34, size: 11, delay: 380 },
  { name: 'Hanoi', x: 0.745, y: 0.315, size: 10, delay: 386 },
  { name: 'Guangzhou', x: 0.755, y: 0.3, size: 12, delay: 392 },
  { name: 'Shanghai', x: 0.775, y: 0.285, size: 14, delay: 398 },
  { name: 'Beijing', x: 0.77, y: 0.265, size: 14, delay: 404 },
  { name: 'Seoul', x: 0.795, y: 0.265, size: 13, delay: 410 },
  { name: 'Tokyo', x: 0.815, y: 0.265, size: 15, delay: 416 },
  { name: 'Osaka', x: 0.81, y: 0.275, size: 12, delay: 422 },
  { name: 'Taipei', x: 0.785, y: 0.295, size: 11, delay: 428 },
  { name: 'HongKong', x: 0.765, y: 0.305, size: 11, delay: 434 },
  { name: 'Ulaanbaatar', x: 0.75, y: 0.23, size: 8, delay: 440 },
  { name: 'Almaty', x: 0.665, y: 0.245, size: 9, delay: 446 },
  { name: 'Tashkent', x: 0.645, y: 0.255, size: 9, delay: 452 },
  { name: 'Kabul', x: 0.64, y: 0.275, size: 8, delay: 458 },
  { name: 'Islamabad', x: 0.65, y: 0.28, size: 9, delay: 462 },
  { name: 'Colombo', x: 0.665, y: 0.36, size: 8, delay: 466 },
  { name: 'Kathmandu', x: 0.675, y: 0.295, size: 7, delay: 470 },
  { name: 'Cairo', x: 0.545, y: 0.3, size: 13, delay: 476 },
  { name: 'Casablanca', x: 0.46, y: 0.29, size: 10, delay: 482 },
  { name: 'Tunis', x: 0.51, y: 0.285, size: 8, delay: 488 },
  { name: 'Algiers', x: 0.49, y: 0.285, size: 9, delay: 492 },
  { name: 'Tripoli', x: 0.52, y: 0.295, size: 8, delay: 496 },
  { name: 'Khartoum', x: 0.56, y: 0.34, size: 9, delay: 500 },
  { name: 'Addis', x: 0.575, y: 0.36, size: 10, delay: 504 },
  { name: 'Nairobi', x: 0.57, y: 0.385, size: 11, delay: 508 },
  { name: 'Lagos', x: 0.485, y: 0.365, size: 12, delay: 512 },
  { name: 'Accra', x: 0.475, y: 0.37, size: 10, delay: 516 },
  { name: 'Dakar', x: 0.45, y: 0.34, size: 9, delay: 520 },
  { name: 'Kinshasa', x: 0.525, y: 0.39, size: 11, delay: 524 },
  { name: 'Luanda', x: 0.52, y: 0.41, size: 10, delay: 528 },
  { name: 'Johannesburg', x: 0.545, y: 0.46, size: 12, delay: 532 },
  { name: 'CapeTown', x: 0.535, y: 0.48, size: 10, delay: 536 },
  { name: 'Maputo', x: 0.565, y: 0.46, size: 8, delay: 540 },
  { name: 'Dar', x: 0.575, y: 0.4, size: 9, delay: 544 },
  { name: 'Antananarivo', x: 0.595, y: 0.44, size: 8, delay: 548 },
  { name: 'NewYork', x: 0.24, y: 0.255, size: 15, delay: 20 },
  { name: 'LosAngeles', x: 0.15, y: 0.275, size: 14, delay: 35 },
  { name: 'Chicago', x: 0.215, y: 0.24, size: 13, delay: 48 },
  { name: 'Houston', x: 0.2, y: 0.285, size: 12, delay: 58 },
  { name: 'Toronto', x: 0.235, y: 0.225, size: 11, delay: 65 },
  { name: 'Montreal', x: 0.25, y: 0.215, size: 10, delay: 72 },
  { name: 'Vancouver', x: 0.135, y: 0.195, size: 10, delay: 78 },
  { name: 'Mexico', x: 0.195, y: 0.31, size: 12, delay: 85 },
  { name: 'Bogota', x: 0.245, y: 0.38, size: 11, delay: 95 },
  { name: 'Lima', x: 0.235, y: 0.42, size: 10, delay: 105 },
  { name: 'SaoPaulo', x: 0.295, y: 0.455, size: 14, delay: 115 },
  { name: 'BuenosAires', x: 0.27, y: 0.495, size: 12, delay: 125 },
  { name: 'Santiago', x: 0.245, y: 0.49, size: 10, delay: 135 },
  { name: 'Caracas', x: 0.265, y: 0.365, size: 9, delay: 145 },
  { name: 'Havana', x: 0.22, y: 0.305, size: 9, delay: 155 },
  { name: 'Miami', x: 0.225, y: 0.285, size: 10, delay: 162 },
  { name: 'Atlanta', x: 0.22, y: 0.27, size: 10, delay: 168 },
  { name: 'Denver', x: 0.175, y: 0.255, size: 9, delay: 174 },
  { name: 'Seattle', x: 0.145, y: 0.205, size: 9, delay: 180 },
  { name: 'SanFrancisco', x: 0.14, y: 0.26, size: 11, delay: 186 },
  { name: 'Phoenix', x: 0.16, y: 0.278, size: 9, delay: 192 },
  { name: 'Dallas', x: 0.195, y: 0.278, size: 10, delay: 198 },
  { name: 'Sydney', x: 0.845, y: 0.46, size: 13, delay: 300 },
  { name: 'Melbourne', x: 0.835, y: 0.475, size: 12, delay: 315 },
  { name: 'Brisbane', x: 0.865, y: 0.445, size: 10, delay: 330 },
  { name: 'Perth', x: 0.8, y: 0.455, size: 10, delay: 345 },
  { name: 'Auckland', x: 0.91, y: 0.49, size: 9, delay: 360 },
];

const CONNECTIONS = Array.from({ length: 60 }, (_, i) => ({
  from: i % CITIES.length,
  to: (i * 7 + 13) % CITIES.length,
  opacity: 0.15 + (i % 5) * 0.05,
}));

const PARTICLES = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 1337 + 200) % 2160,
  size: (i % 3) + 1,
  speed: 0.3 + (i % 5) * 0.15,
  phase: (i * 137) % 628,
}));

const PULSE_RINGS = Array.from({ length: 20 }, (_, i) => ({
  cityIndex: (i * 6) % CITIES.length,
  delay: (i * 30) % 400,
}));

export const MarketPenetrationMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const scaleX = width / 3840;
  const scaleY = height / 2160;

  const getCityProgress = (city: typeof CITIES[0]) => {
    const startFrame = 50 + city.delay;
    return interpolate(frame, [startFrame, startFrame + 25], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  };

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 50% 45%, #050d18 0%, #020810 60%, #010508 100%)',
        overflow: 'hidden',
        opacity: globalOpacity,
        position: 'relative',
      }}
    >
      {/* Deep background grid */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <radialGradient id="glowCenter" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#001a2e" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#000508" stopOpacity="0" />
          </radialGradient>
          <filter id="cityGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="20" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ringGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width={width} height={height} fill="url(#glowCenter)" />

        {/* Latitude/longitude grid lines */}
        {Array.from({ length: 12 }, (_, i) => {
          const y = (i / 11) * height * 0.85 + height * 0.05;
          return (
            <line
              key={`lat-${i}`}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke="#0a2540"
              strokeWidth={0.5}
              opacity={0.4}
            />
          );
        })}
        {Array.from({ length: 20 }, (_, i) => {
          const x = (i / 19) * width;
          return (
            <line
              key={`lon-${i}`}
              x1={x}
              y1={0}
              x2={x}
              y2={height}
              stroke="#0a2540"
              strokeWidth={0.5}
              opacity={0.3}
            />
          );
        })}

        {/* Background particles */}
        {PARTICLES.map((p, i) => {
          const shimmer = Math.sin(frame * p.speed * 0.05 + p.phase * 0.01) * 0.5 + 0.5;
          return (
            <circle
              key={`particle-${i}`}
              cx={p.x * scaleX}
              cy={p.y * scaleY}
              r={p.size * Math.min(scaleX, scaleY)}
              fill="#00ffff"
              opacity={shimmer * 0.08}
            />
          );
        })}

        {/* Connection lines between cities */}
        {CONNECTIONS.map((conn, i) => {
          const cityA = CITIES[conn.from];
          const cityB = CITIES[conn.to];
          const progressA = getCityProgress(cityA);
          const progressB = getCityProgress(cityB);
          const connOpacity = Math.min(progressA, progressB) * conn.opacity;
          if (connOpacity <= 0) return null;

          const x1 = cityA.x * width;
          const y1 = cityA.y * height;
          const x2 = cityB.x * width;
          const y2 = cityB.y * height;

          // Animated dash offset
          const dashOffset = -(frame * 3 + i * 20) % 200;

          return (
            <line
              key={`conn-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#00ffff"
              strokeWidth={0.8 * Math.min(scaleX, scaleY) * 5}
              strokeDasharray="8 16"
              strokeDashoffset={dashOffset}
              opacity={connOpacity}
            />
          );
        })}

        {/* Pulse rings */}
        {PULSE_RINGS.map((ring, i) => {
          const city = CITIES[ring.cityIndex];
          const cityProgress = getCityProgress(city);
          if (cityProgress <= 0) return null;

          const pulseFrame = (frame - ring.delay) % 120;
          const pulseProgress = Math.max(0, pulseFrame / 120);
          const pulseRadius = interpolate(pulseProgress, [0, 1], [0, city.size * 6]);
          const pulseOpacity = interpolate(pulseProgress, [0, 0.3, 1], [0.8, 0.5, 0]) * cityProgress;

          const cx = city.x * width;
          const cy = city.y * height;

          return (
            <circle
              key={`pulse-${i}`}
              cx={cx}
              cy={cy}
              r={pulseRadius * Math.min(scaleX, scaleY) * 5}
              fill="none"
              stroke="#00ffff"
              strokeWidth={1.5 * Math.min(scaleX, scaleY) * 5}
              opacity={pulseOpacity}
              filter="url(#ringGlow)"
            />
          );
        })}

        {/* Secondary pulse rings offset */}
        {PULSE_RINGS.map((ring, i) => {
          const city = CITIES[ring.cityIndex];
          const cityProgress = getCityProgress(city);
          if (cityProgress <= 0) return null;

          const pulseFrame = (frame - ring.delay + 40) % 120;
          const pulseProgress = Math.max(0, pulseFrame / 120);
          const pulseRadius = interpolate(pulseProgress, [0, 1], [0, city.size * 4]);
          const pulseOpacity = interpolate(pulseProgress, [0, 0.3, 1], [0.6, 0.3, 0]) * cityProgress;

          const cx = city.x * width;
          const cy = city.y * height;

          return (
            <circle
              key={`pulse2-${i}`}
              cx={cx}
              cy={cy}
              r={pulseRadius * Math.min(scaleX, scaleY) * 5}
              fill="none"
              stroke="#40e0d0"
              strokeWidth={1 * Math.min(scaleX, scaleY) * 5}
              opacity={pulseOpacity}
            />
          );
        })}

        {/* City dots */}
        {CITIES.map((city, i) => {
          const progress = getCityProgress(city);
          if (progress <= 0) return null;

          const cx = city.x * width;
          const cy = city.y * height;
          const baseSize = city.size * Math.min(scaleX, scaleY) * 5;

          const breathe = 1 + Math.sin(frame * 0.05 + i * 0.7) * 0.15;
          const dotSize = baseSize * progress * breathe;

          const hue = interpolate(i % 30, [0, 30], [180, 220]);
          const lightness = 60 + (i % 5) * 6;
          const color = `hsl(${hue}, 100%, ${lightness}%)`;

          return (
            <g key={`city-${i}`}>
              {/* Outer glow */}
              <circle
                cx={cx}
                cy={cy}
                r={dotSize * 3}
                fill={color}
                opacity={0.06 * progress}
              />
              {/* Mid glow */}
              <circle
                cx={cx}
                cy={cy}
                r={dotSize * 1.8}
                fill={color}
                opacity={0.15 * progress}
              />
              {/* Core dot */}
              <circle
                cx={cx}
                cy={cy}
                r={dotSize}
                fill={color}
                opacity={0.95 * progress}
                filter="url(#cityGlow)"
              />
              {/* Bright center */}
              <circle
                cx={cx}
                cy={cy}
                r={dotSize * 0.4}
                fill="white"
                opacity={0.8 * progress}
              />
            </g>
          );
        })}

        {/* Global spread glow overlay that intensifies over time */}
        {(() => {
          const totalActive = CITIES.filter(c => getCityProgress(c) > 0.5).length;
          const spreadOpacity = interpolate(totalActive, [0, CITIES.length], [0, 0.12]);
          return (
            <ellipse
              cx={width * 0.5}
              cy={height * 0.38}
              rx={width * 0.48}
              ry={height * 0.38}
              fill="#00cccc"
              opacity={spreadOpacity}
              filter="url(#softGlow)"
            />
          );
        })()}
      </svg>

      {/* Scanline overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,255,0.015) 3px, rgba(0,255,255,0.015) 4px)',
          pointerEvents: 'none',
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};