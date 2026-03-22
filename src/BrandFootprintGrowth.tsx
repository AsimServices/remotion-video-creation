import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// World map path approximation using simple continent shapes
const CONTINENTS = [
  // North America
  "M 280 180 L 340 160 L 400 150 L 450 160 L 480 200 L 500 240 L 490 280 L 470 320 L 440 360 L 420 400 L 400 440 L 380 460 L 360 480 L 340 490 L 320 470 L 300 440 L 280 400 L 260 360 L 250 320 L 240 280 L 250 240 L 260 210 Z",
  // South America
  "M 340 520 L 380 500 L 420 510 L 450 540 L 460 580 L 450 630 L 430 680 L 400 720 L 370 750 L 340 760 L 310 740 L 290 700 L 280 660 L 290 610 L 300 570 L 310 540 Z",
  // Europe
  "M 620 140 L 680 120 L 740 130 L 780 150 L 800 180 L 790 210 L 760 230 L 720 240 L 680 250 L 640 240 L 610 220 L 600 190 L 605 165 Z",
  // Africa
  "M 640 280 L 700 260 L 760 270 L 800 300 L 820 350 L 820 420 L 800 490 L 760 550 L 720 600 L 680 630 L 640 620 L 610 580 L 590 520 L 590 450 L 600 380 L 615 330 Z",
  // Asia
  "M 820 100 L 920 80 L 1060 90 L 1180 110 L 1280 130 L 1340 160 L 1360 200 L 1320 240 L 1260 260 L 1200 270 L 1140 260 L 1080 270 L 1020 280 L 960 300 L 900 290 L 840 270 L 800 240 L 790 200 L 800 160 Z",
  // Australia
  "M 1080 520 L 1160 500 L 1240 510 L 1280 550 L 1280 610 L 1240 650 L 1180 660 L 1110 650 L 1070 610 L 1060 560 Z",
];

// Store locations (lon/lat converted to approximate screen positions on 1920x1080)
// Format: [x, y, continent_region, appearance_order]
const STORE_LOCATIONS = Array.from({ length: 120 }, (_, i) => {
  const seed1 = (i * 1731 + 37) % 1000;
  const seed2 = (i * 1337 + 91) % 1000;
  const seed3 = (i * 997 + 113) % 7;

  const regions = [
    { cx: 350, cy: 320, rx: 140, ry: 160 }, // North America
    { cx: 380, cy: 630, rx: 80, ry: 120 },  // South America
    { cx: 700, cy: 190, rx: 100, ry: 80 },  // Europe
    { cx: 700, cy: 450, rx: 130, ry: 170 }, // Africa
    { cx: 1050, cy: 200, rx: 280, ry: 160 }, // Asia
    { cx: 1170, cy: 580, rx: 100, ry: 70 }, // Australia
    { cx: 750, cy: 320, rx: 60, ry: 80 },   // Middle East
  ];

  const region = regions[seed3];
  const angle = (seed1 / 1000) * Math.PI * 2;
  const dist1 = seed1 / 1000;
  const dist2 = seed2 / 1000;

  const x = region.cx + Math.cos(angle) * region.rx * dist1;
  const y = region.cy + Math.sin(angle) * region.ry * dist2;

  return {
    x: Math.max(100, Math.min(1820, x)),
    y: Math.max(60, Math.min(1020, y)),
    size: 4 + (i % 5) * 2,
    hue: 180 + (seed1 % 60),
    delay: (i / 120) * 0.75,
    pulseOffset: (i * 0.3) % (Math.PI * 2),
  };
});

// Connection lines between nearby stores
const CONNECTIONS = Array.from({ length: 60 }, (_, i) => {
  const a = i % 120;
  const b = (i * 7 + 13) % 120;
  return { from: a, to: b, delay: 0.3 + (i / 60) * 0.5 };
});

// Ripple rings
const RIPPLES = Array.from({ length: 30 }, (_, i) => {
  const storeIdx = (i * 4) % 120;
  return {
    storeIdx,
    delay: 0.1 + (i / 30) * 0.8,
    duration: 0.15,
  };
});

export const BrandFootprintGrowth: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const scaleX = width / 1920;
  const scaleY = height / 1080;

  const progress = frame / durationInFrames;

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const masterOpacity = Math.min(fadeIn, fadeOut);

  // Pulsing glow intensity
  const pulseBase = Math.sin(frame * 0.05) * 0.5 + 0.5;

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at center, #050d1a 0%, #020508 100%)',
        overflow: 'hidden',
        opacity: masterOpacity,
        position: 'relative',
      }}
    >
      {/* Background star field */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {Array.from({ length: 200 }, (_, i) => {
          const sx = ((i * 1973) % 1920) * scaleX;
          const sy = ((i * 1511) % 1080) * scaleY;
          const ssize = ((i % 3) + 0.5) * scaleX;
          const sop = 0.1 + (i % 5) * 0.08;
          return (
            <circle
              key={`star-${i}`}
              cx={sx}
              cy={sy}
              r={ssize}
              fill="white"
              opacity={sop * (0.5 + Math.sin(frame * 0.02 + i * 0.3) * 0.3)}
            />
          );
        })}
      </svg>

      {/* Main SVG layer */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 1920 1080"
        style={{ position: 'absolute', top: 0, left: 0 }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softBlur">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Globe grid lines */}
        {Array.from({ length: 13 }, (_, i) => {
          const x = 100 + i * 140;
          const gridOp = 0.06 + pulseBase * 0.02;
          return (
            <line
              key={`vgrid-${i}`}
              x1={x} y1={60} x2={x} y2={1020}
              stroke="#1a4060"
              strokeWidth="0.8"
              opacity={gridOp}
            />
          );
        })}
        {Array.from({ length: 7 }, (_, i) => {
          const y = 60 + i * 140;
          const gridOp = 0.06 + pulseBase * 0.02;
          return (
            <line
              key={`hgrid-${i}`}
              x1={100} y1={y} x2={1820} y2={y}
              stroke="#1a4060"
              strokeWidth="0.8"
              opacity={gridOp}
            />
          );
        })}

        {/* Continent shapes */}
        {CONTINENTS.map((d, i) => (
          <g key={`continent-${i}`}>
            {/* Continent glow */}
            <path
              d={d}
              fill="#0a2540"
              stroke="#0d3a5c"
              strokeWidth="2"
              opacity={0.6}
              filter="url(#softBlur)"
            />
            {/* Continent surface */}
            <path
              d={d}
              fill="#071a2e"
              stroke="#1a5080"
              strokeWidth="1.5"
              opacity={0.9}
            />
          </g>
        ))}

        {/* Connection lines between stores */}
        {CONNECTIONS.map((conn, i) => {
          const showThreshold = conn.delay;
          if (progress < showThreshold) return null;

          const lineProgress = interpolate(
            progress,
            [showThreshold, showThreshold + 0.08],
            [0, 1],
            { extrapolateRight: 'clamp' }
          );

          const storeA = STORE_LOCATIONS[conn.from];
          const storeB = STORE_LOCATIONS[conn.to];

          const dx = storeB.x - storeA.x;
          const dy = storeB.y - storeA.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 500) return null;

          const ex = storeA.x + dx * lineProgress;
          const ey = storeA.y + dy * lineProgress;

          const lineOp = interpolate(
            progress,
            [showThreshold, showThreshold + 0.08, 0.95, 1.0],
            [0, 0.3, 0.15, 0],
            { extrapolateRight: 'clamp' }
          );

          return (
            <line
              key={`conn-${i}`}
              x1={storeA.x}
              y1={storeA.y}
              x2={ex}
              y2={ey}
              stroke={`hsl(${190 + (i % 40)}, 80%, 60%)`}
              strokeWidth="0.8"
              opacity={lineOp}
            />
          );
        })}

        {/* Ripple effects */}
        {RIPPLES.map((ripple, i) => {
          const store = STORE_LOCATIONS[ripple.storeIdx];
          const showThreshold = ripple.delay;
          if (progress < showThreshold) return null;

          const rippleProgress = ((progress - showThreshold) % 0.3) / 0.3;
          const rippleR = interpolate(rippleProgress, [0, 1], [0, 60]);
          const rippleOp = interpolate(rippleProgress, [0, 0.3, 1], [0.8, 0.4, 0]);

          return (
            <circle
              key={`ripple-${i}`}
              cx={store.x}
              cy={store.y}
              r={rippleR}
              fill="none"
              stroke={`hsl(${store.hue}, 90%, 70%)`}
              strokeWidth="1.5"
              opacity={rippleOp}
            />
          );
        })}

        {/* Store location dots */}
        {STORE_LOCATIONS.map((store, i) => {
          const showThreshold = store.delay;
          if (progress < showThreshold) return null;

          const dotProgress = interpolate(
            progress,
            [showThreshold, showThreshold + 0.04],
            [0, 1],
            { extrapolateRight: 'clamp' }
          );

          const dotScale = interpolate(
            dotProgress,
            [0, 0.5, 1],
            [0, 1.4, 1]
          );

          const pulseFactor = 1 + Math.sin(frame * 0.08 + store.pulseOffset) * 0.15;
          const finalScale = dotScale * pulseFactor;

          const dotOp = dotProgress * (0.8 + pulseBase * 0.2);

          return (
            <g key={`store-${i}`} transform={`translate(${store.x}, ${store.y}) scale(${finalScale})`}>
              {/* Outer glow ring */}
              <circle
                r={store.size * 3}
                fill={`hsl(${store.hue}, 100%, 60%)`}
                opacity={0.08 * dotOp}
                filter="url(#softBlur)"
              />
              {/* Mid glow */}
              <circle
                r={store.size * 1.8}
                fill={`hsl(${store.hue}, 90%, 65%)`}
                opacity={0.2 * dotOp}
              />
              {/* Core dot */}
              <circle
                r={store.size}
                fill={`hsl(${store.hue}, 100%, 75%)`}
                opacity={dotOp}
                filter="url(#glow)"
              />
              {/* Bright center */}
              <circle
                r={store.size * 0.4}
                fill="white"
                opacity={0.9 * dotOp}
              />
            </g>
          );
        })}

        {/* Animated scan line effect */}
        {(() => {
          const scanX = interpolate(
            progress,
            [0, 1],
            [100, 1820],
            { extrapolateRight: 'clamp' }
          );
          return (
            <g>
              <line
                x1={scanX}
                y1={60}
                x2={scanX}
                y2={1020}
                stroke="#00e5ff"
                strokeWidth="2"
                opacity={0.15}
              />
              <rect
                x={scanX - 40}
                y={60}
                width={40}
                height={960}
                fill="url(#glowGrad)"
                opacity={0.08}
              />
            </g>
          );
        })()}

        {/* Corner decorative elements */}
        {[
          [100, 60], [1820, 60], [100, 1020], [1820, 1020]
        ].map(([cx, cy], i) => (
          <g key={`corner-${i}`}>
            <circle cx={cx} cy={cy} r={20} fill="none" stroke="#00e5ff" strokeWidth="1.5" opacity={0.3} />
            <circle cx={cx} cy={cy} r={5} fill="#00e5ff" opacity={0.5} />
            <line x1={cx - 30} y1={cy} x2={cx + 30} y2={cy} stroke="#00e5ff" strokeWidth="0.8" opacity={0.2} />
            <line x1={cx} y1={cy - 30} x2={cx} y2={cy + 30} stroke="#00e5ff" strokeWidth="0.8" opacity={0.2} />
          </g>
        ))}

        {/* Global pulse overlay */}
        <ellipse
          cx={960}
          cy={540}
          rx={900}
          ry={500}
          fill="none"
          stroke="#00e5ff"
          strokeWidth="1"
          opacity={0.04 + pulseBase * 0.04}
        />
        <ellipse
          cx={960}
          cy={540}
          rx={700}
          ry={380}
          fill="none"
          stroke="#00e5ff"
          strokeWidth="0.8"
          opacity={0.03 + pulseBase * 0.03}
        />

        {/* Progress arc */}
        {(() => {
          const arcProgress = interpolate(progress, [0, 0.9], [0, 1], { extrapolateRight: 'clamp' });
          const circumference = 2 * Math.PI * 480;
          const dashOffset = circumference * (1 - arcProgress);
          return (
            <circle
              cx={960}
              cy={540}
              r={480}
              fill="none"
              stroke="#00e5ff"
              strokeWidth="1.5"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              opacity={0.15}
              transform="rotate(-90 960 540)"
            />
          );
        })()}
      </svg>

      {/* Vignette overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};