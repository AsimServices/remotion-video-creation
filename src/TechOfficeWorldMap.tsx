import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const OFFICES = [
  { x: 0.13, y: 0.38, label: 'New York', size: 22, delay: 0 },
  { x: 0.21, y: 0.55, label: 'São Paulo', size: 16, delay: 18 },
  { x: 0.47, y: 0.28, label: 'London', size: 20, delay: 36 },
  { x: 0.52, y: 0.26, label: 'Amsterdam', size: 14, delay: 45 },
  { x: 0.55, y: 0.30, label: 'Frankfurt', size: 14, delay: 50 },
  { x: 0.60, y: 0.28, label: 'Warsaw', size: 12, delay: 55 },
  { x: 0.57, y: 0.36, label: 'Dubai', size: 18, delay: 62 },
  { x: 0.67, y: 0.40, label: 'Mumbai', size: 17, delay: 70 },
  { x: 0.76, y: 0.33, label: 'Singapore', size: 16, delay: 80 },
  { x: 0.82, y: 0.37, label: 'Shanghai', size: 19, delay: 88 },
  { x: 0.87, y: 0.30, label: 'Tokyo', size: 20, delay: 95 },
  { x: 0.85, y: 0.55, label: 'Sydney', size: 15, delay: 105 },
  { x: 0.09, y: 0.32, label: 'San Francisco', size: 21, delay: 112 },
  { x: 0.49, y: 0.24, label: 'Paris', size: 15, delay: 120 },
  { x: 0.56, y: 0.22, label: 'Stockholm', size: 12, delay: 128 },
];

const CONNECTIONS = [
  [0, 1], [0, 2], [0, 12], [2, 3], [2, 4], [2, 5], [2, 13],
  [3, 4], [4, 5], [2, 6], [6, 7], [7, 8], [8, 9], [9, 10],
  [10, 11], [0, 9], [12, 0], [13, 14], [6, 8], [1, 6],
];

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  x: (i * 1731 + 200) % 100,
  y: (i * 1337 + 100) % 100,
  size: ((i * 7) % 3) + 1,
  speed: ((i * 13) % 40) + 10,
  opacity: ((i * 17) % 50) / 100 + 0.1,
}));

const GRID_COLS = 40;
const GRID_ROWS = 22;

// World map outline approximated as SVG path segments
const MAP_CONTINENTS = [
  // North America
  "M 480 140 L 520 120 L 560 125 L 600 140 L 620 170 L 610 200 L 590 230 L 560 250 L 530 260 L 500 280 L 480 300 L 460 280 L 440 250 L 430 220 L 440 190 L 460 165 Z",
  // South America
  "M 530 310 L 560 300 L 580 320 L 585 360 L 570 400 L 550 430 L 525 445 L 510 420 L 505 380 L 510 340 Z",
  // Europe
  "M 820 100 L 860 95 L 890 105 L 900 130 L 880 145 L 855 150 L 840 140 L 825 125 Z",
  // Africa
  "M 840 200 L 880 195 L 910 210 L 920 250 L 910 300 L 890 340 L 860 360 L 830 355 L 815 320 L 810 270 L 820 230 Z",
  // Asia
  "M 920 90 L 1000 85 L 1100 100 L 1160 130 L 1180 160 L 1150 190 L 1100 200 L 1050 195 L 1000 185 L 960 170 L 930 150 L 915 120 Z",
  // Australia
  "M 1250 370 L 1300 360 L 1340 370 L 1360 400 L 1345 430 L 1310 440 L 1275 430 L 1255 405 Z",
];

function getOfficePos(office: typeof OFFICES[0], width: number, height: number) {
  return {
    x: office.x * width,
    y: office.y * height,
  };
}

export const TechOfficeWorldMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const scaleX = width / 1920;
  const scaleY = height / 1080;

  const globalFadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const globalFadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const globalOpacity = Math.min(globalFadeIn, globalFadeOut);

  const pulsePhase = (frame / 60) * Math.PI * 2;
  const slowPulse = (frame / 120) * Math.PI * 2;

  return (
    <div style={{ width, height, background: '#050a0f', position: 'relative', overflow: 'hidden', opacity: globalOpacity }}>
      
      {/* Background gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, #0a1628 0%, #050a0f 70%)',
      }} />

      {/* Grid overlay */}
      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
        <defs>
          <pattern id="grid" width={width / GRID_COLS} height={height / GRID_ROWS} patternUnits="userSpaceOnUse">
            <path
              d={`M ${width / GRID_COLS} 0 L 0 0 0 ${height / GRID_ROWS}`}
              fill="none"
              stroke="#0d2233"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" opacity="0.7" />
      </svg>

      {/* Map SVG layer */}
      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height} viewBox="0 0 1920 1080">
        
        {/* Continent shapes - stylized */}
        {MAP_CONTINENTS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="#0a1e30"
            stroke="#0e3050"
            strokeWidth="1.5"
            opacity="0.8"
          />
        ))}

        {/* Latitude / Longitude lines */}
        {[0.2, 0.35, 0.5, 0.65, 0.8].map((yFrac, i) => (
          <line
            key={`lat-${i}`}
            x1={0} y1={yFrac * 1080}
            x2={1920} y2={yFrac * 1080}
            stroke="#0e2840"
            strokeWidth="0.8"
            opacity="0.5"
          />
        ))}
        {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((xFrac, i) => (
          <line
            key={`lon-${i}`}
            x1={xFrac * 1920} y1={0}
            x2={xFrac * 1920} y2={1080}
            stroke="#0e2840"
            strokeWidth="0.8"
            opacity="0.5"
          />
        ))}

        {/* Connection lines between offices */}
        {CONNECTIONS.map(([fromIdx, toIdx], ci) => {
          const from = OFFICES[fromIdx];
          const to = OFFICES[toIdx];
          const maxDelay = Math.max(from.delay, to.delay);
          const appear = interpolate(frame, [maxDelay + 20, maxDelay + 60], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          if (appear === 0) return null;

          const fx = from.x * 1920;
          const fy = from.y * 1080;
          const tx = to.x * 1920;
          const ty = to.y * 1080;

          // Curved control point
          const cx = (fx + tx) / 2;
          const cy = Math.min(fy, ty) - 60;

          const pathD = `M ${fx} ${fy} Q ${cx} ${cy} ${tx} ${ty}`;

          // Animated dash offset for "traveling" data effect
          const dashOffset = -((frame * 3) % 200);

          return (
            <g key={`conn-${ci}`} opacity={appear * 0.6}>
              {/* Base line */}
              <path
                d={pathD}
                fill="none"
                stroke="#00aaff"
                strokeWidth="0.8"
                opacity="0.3"
              />
              {/* Animated dash */}
              <path
                d={pathD}
                fill="none"
                stroke="#00ddff"
                strokeWidth="1.5"
                strokeDasharray="12 180"
                strokeDashoffset={dashOffset + ci * 30}
                opacity="0.9"
              />
            </g>
          );
        })}

        {/* Office markers */}
        {OFFICES.map((office, i) => {
          const appear = interpolate(frame, [office.delay, office.delay + 30], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          if (appear === 0) return null;

          const ox = office.x * 1920;
          const oy = office.y * 1080;
          const baseSize = office.size;

          const ring1Scale = 1 + 0.5 * Math.sin(pulsePhase + i * 0.8);
          const ring2Scale = 1 + 0.8 * Math.sin(pulsePhase + i * 0.8 + Math.PI);
          const ring1Opacity = (0.5 + 0.5 * Math.sin(pulsePhase + i * 0.8 + Math.PI)) * appear;
          const ring2Opacity = (0.3 + 0.3 * Math.sin(pulsePhase + i * 0.8)) * appear;

          // Classify by size: HQ vs regional vs local
          const isHQ = baseSize >= 20;
          const isRegional = baseSize >= 15 && baseSize < 20;

          const coreColor = isHQ ? '#ff6b35' : isRegional ? '#00ddff' : '#00ffaa';
          const glowColor = isHQ ? '#ff4400' : isRegional ? '#0088ff' : '#00cc88';

          return (
            <g key={`office-${i}`} opacity={appear}>
              {/* Outer pulse ring 2 */}
              <circle
                cx={ox} cy={oy}
                r={baseSize * 2.5 * ring2Scale}
                fill="none"
                stroke={coreColor}
                strokeWidth="0.8"
                opacity={ring2Opacity * 0.5}
              />
              {/* Outer pulse ring 1 */}
              <circle
                cx={ox} cy={oy}
                r={baseSize * 1.8 * ring1Scale}
                fill="none"
                stroke={coreColor}
                strokeWidth="1.2"
                opacity={ring1Opacity * 0.7}
              />
              {/* Glow halo */}
              <circle
                cx={ox} cy={oy}
                r={baseSize * 1.2}
                fill={glowColor}
                opacity="0.15"
              />
              {/* Core dot */}
              <circle
                cx={ox} cy={oy}
                r={baseSize * 0.5}
                fill={coreColor}
                opacity="0.95"
              />
              {/* Inner bright core */}
              <circle
                cx={ox} cy={oy}
                r={baseSize * 0.2}
                fill="white"
                opacity="0.9"
              />
              {/* Crosshair lines for HQ */}
              {isHQ && (
                <>
                  <line x1={ox - baseSize * 1.5} y1={oy} x2={ox - baseSize * 0.6} y2={oy}
                    stroke={coreColor} strokeWidth="1" opacity="0.7" />
                  <line x1={ox + baseSize * 0.6} y1={oy} x2={ox + baseSize * 1.5} y2={oy}
                    stroke={coreColor} strokeWidth="1" opacity="0.7" />
                  <line x1={ox} y1={oy - baseSize * 1.5} x2={ox} y2={oy - baseSize * 0.6}
                    stroke={coreColor} strokeWidth="1" opacity="0.7" />
                  <line x1={ox} y1={oy + baseSize * 0.6} x2={ox} y2={oy + baseSize * 1.5}
                    stroke={coreColor} strokeWidth="1" opacity="0.7" />
                </>
              )}
            </g>
          );
        })}

        {/* Scanning line effect */}
        <rect
          x={0}
          y={((frame * 2.5) % (1080 + 40)) - 20}
          width={1920}
          height={3}
          fill="url(#scanGrad)"
          opacity="0.15"
        />
        <defs>
          <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="#00ddff" />
            <stop offset="70%" stopColor="#00ddff" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

      </svg>

      {/* Floating particles */}
      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
        {PARTICLES.map((p, i) => {
          const py = ((p.y + (frame / p.speed) * 5) % 100);
          return (
            <circle
              key={i}
              cx={`${p.x}%`}
              cy={`${py}%`}
              r={p.size * scaleX}
              fill="#00aaff"
              opacity={p.opacity * globalOpacity}
            />
          );
        })}
      </svg>

      {/* Bottom bar: data readout aesthetic */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.03,
        left: width * 0.05,
        right: width * 0.05,
        height: height * 0.003,
        background: 'linear-gradient(90deg, transparent, #00ddff44, #00ddff88, #00ddff44, transparent)',
        borderRadius: 2,
      }} />

      {/* Corner brackets - top left */}
      <svg style={{ position: 'absolute', top: height * 0.04, left: width * 0.04 }} width={80 * scaleX} height={80 * scaleY}>
        <path d={`M ${30 * scaleX} ${5 * scaleY} L ${5 * scaleX} ${5 * scaleY} L ${5 * scaleX} ${30 * scaleY}`}
          fill="none" stroke="#00ddff" strokeWidth={2 * scaleX} opacity="0.6" />
      </svg>
      {/* Corner brackets - top right */}
      <svg style={{ position: 'absolute', top: height * 0.04, right: width * 0.04 }} width={80 * scaleX} height={80 * scaleY}>
        <path d={`M ${50 * scaleX} ${5 * scaleY} L ${75 * scaleX} ${5 * scaleY} L ${75 * scaleX} ${30 * scaleY}`}
          fill="none" stroke="#00ddff" strokeWidth={2 * scaleX} opacity="0.6" />
      </svg>
      {/* Corner brackets - bottom left */}
      <svg style={{ position: 'absolute', bottom: height * 0.04, left: width * 0.04 }} width={80 * scaleX} height={80 * scaleY}>
        <path d={`M ${30 * scaleX} ${75 * scaleY} L ${5 * scaleX} ${75 * scaleY} L ${5 * scaleX} ${50 * scaleY}`}
          fill="none" stroke="#00ddff" strokeWidth={2 * scaleX} opacity="0.6" />
      </svg>
      {/* Corner brackets - bottom right */}
      <svg style={{ position: 'absolute', bottom: height * 0.04, right: width * 0.04 }} width={80 * scaleX} height={80 * scaleY}>
        <path d={`M ${50 * scaleX} ${75 * scaleY} L ${75 * scaleX} ${75 * scaleY} L ${75 * scaleX} ${50 * scaleY}`}
          fill="none" stroke="#00ddff" strokeWidth={2 * scaleX} opacity="0.6" />
      </svg>

      {/* Vignette overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, #050a0f99 100%)',
        pointerEvents: 'none',
      }} />

      {/* Data counter overlay boxes */}
      {[
        { x: 0.06, y: 0.12, val: Math.min(15, Math.floor(frame / 20)) },
        { x: 0.82, y: 0.12, val: Math.min(5, Math.floor(frame / 40)) },
        { x: 0.82, y: 0.75, val: Math.min(48, Math.floor(frame / 8)) },
      ].map((item, i) => {
        const boxOpacity = interpolate(frame, [i * 40, i * 40 + 30], [0, 1], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        }) * globalOpacity;
        const barWidth = interpolate(frame, [i * 40 + 30, i * 40 + 90], [0, 100], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });
        return (
          <div key={i} style={{
            position: 'absolute',
            left: item.x * width,
            top: item.y * height,
            width: 160 * scaleX,
            opacity: boxOpacity,
          }}>
            <div style={{
              border: `1px solid #00ddff44`,
              background: '#00ddff08',
              padding: `${6 * scaleY}px ${10 * scaleX}px`,
              borderRadius: 3,
            }}>
              <div style={{
                width: '100%',
                height: 2 * scaleY,
                background: '#0a1e30',
                borderRadius: 1,
                overflow: 'hidden',
                marginTop: 4 * scaleY,
              }}>
                <div style={{
                  width: `${barWidth}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #00aaff, #00ffaa)',
                  borderRadius: 1,
                }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};