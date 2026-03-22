import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Pre-computed deterministic "random" values
const CABLE_ROUTES = [
  // [x1, y1, x2, y2, color, speed, offset]
  { x1: 0.08, y1: 0.42, x2: 0.35, y2: 0.38, color: '#00d4ff', speed: 0.8, offset: 0 },
  { x1: 0.35, y1: 0.38, x2: 0.55, y2: 0.35, color: '#00d4ff', speed: 0.9, offset: 20 },
  { x1: 0.55, y1: 0.35, x2: 0.78, y2: 0.32, color: '#00d4ff', speed: 0.7, offset: 40 },
  { x1: 0.78, y1: 0.32, x2: 0.95, y2: 0.30, color: '#00d4ff', speed: 1.0, offset: 10 },
  { x1: 0.08, y1: 0.42, x2: 0.25, y2: 0.65, color: '#ff6b35', speed: 0.6, offset: 15 },
  { x1: 0.25, y1: 0.65, x2: 0.42, y2: 0.72, color: '#ff6b35', speed: 0.75, offset: 35 },
  { x1: 0.42, y1: 0.72, x2: 0.55, y2: 0.70, color: '#ff6b35', speed: 0.8, offset: 50 },
  { x1: 0.35, y1: 0.38, x2: 0.42, y2: 0.72, color: '#a855f7', speed: 0.65, offset: 25 },
  { x1: 0.55, y1: 0.35, x2: 0.55, y2: 0.70, color: '#a855f7', speed: 0.9, offset: 45 },
  { x1: 0.78, y1: 0.32, x2: 0.75, y2: 0.62, color: '#a855f7', speed: 0.7, offset: 5 },
  { x1: 0.75, y1: 0.62, x2: 0.55, y2: 0.70, color: '#a855f7', speed: 0.85, offset: 60 },
  { x1: 0.08, y1: 0.42, x2: 0.05, y2: 0.65, color: '#00ff9d', speed: 0.5, offset: 30 },
  { x1: 0.95, y1: 0.30, x2: 0.92, y2: 0.55, color: '#00ff9d', speed: 0.8, offset: 70 },
  { x1: 0.20, y1: 0.28, x2: 0.35, y2: 0.38, color: '#ffdd00', speed: 0.9, offset: 12 },
  { x1: 0.60, y1: 0.55, x2: 0.75, y2: 0.62, color: '#ffdd00', speed: 0.7, offset: 55 },
];

const NODES = [
  { x: 0.08, y: 0.42, size: 18, label: 'NY' },
  { x: 0.35, y: 0.38, size: 16, label: 'LON' },
  { x: 0.55, y: 0.35, size: 15, label: 'FRA' },
  { x: 0.78, y: 0.32, size: 17, label: 'SIN' },
  { x: 0.95, y: 0.30, size: 16, label: 'TOK' },
  { x: 0.25, y: 0.65, size: 14, label: 'RIO' },
  { x: 0.42, y: 0.72, size: 14, label: 'JNB' },
  { x: 0.55, y: 0.70, size: 14, label: 'SYD' },
  { x: 0.75, y: 0.62, size: 15, label: 'MUM' },
  { x: 0.92, y: 0.55, size: 13, label: 'PER' },
  { x: 0.05, y: 0.65, size: 12, label: 'BUE' },
  { x: 0.20, y: 0.28, size: 13, label: 'REY' },
  { x: 0.60, y: 0.55, size: 13, label: 'DXB' },
];

const PACKETS = Array.from({ length: 80 }, (_, i) => ({
  routeIndex: i % CABLE_ROUTES.length,
  speed: 0.4 + ((i * 137) % 100) / 150,
  offset: (i * 73) % 100,
  size: 3 + (i % 5),
  brightness: 0.6 + (i % 4) * 0.1,
}));

const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 1337 + 200) % 2160,
  size: 1 + (i % 3),
  opacity: 0.1 + (i % 5) * 0.06,
}));

const GRID_LINES_H = Array.from({ length: 12 }, (_, i) => i);
const GRID_LINES_V = Array.from({ length: 20 }, (_, i) => i);

// Bezier curve helper
function cubicBezierPoint(t: number, p0x: number, p0y: number, p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number) {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0x + 3 * mt * mt * t * p1x + 3 * mt * t * t * p2x + t * t * t * p3x,
    y: mt * mt * mt * p0y + 3 * mt * mt * t * p1y + 3 * mt * t * t * p2y + t * t * t * p3y,
  };
}

function getCurvePoints(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cp1x = x1 + dx * 0.35;
  const cp1y = y1 - Math.abs(dy) * 0.3 - Math.abs(dx) * 0.1;
  const cp2x = x2 - dx * 0.35;
  const cp2y = y2 - Math.abs(dy) * 0.3 - Math.abs(dx) * 0.1;
  return { cp1x, cp1y, cp2x, cp2y };
}

function getCurvePathD(x1: number, y1: number, x2: number, y2: number, W: number, H: number) {
  const { cp1x, cp1y, cp2x, cp2y } = getCurvePoints(x1, y1, x2, y2);
  return `M ${x1 * W} ${y1 * H} C ${cp1x * W} ${cp1y * H} ${cp2x * W} ${cp2y * H} ${x2 * W} ${y2 * H}`;
}

export const DigitalDataPacketStreams: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const time = frame / 30;

  // Pulse for nodes
  const nodePulse = Math.sin(time * 3) * 0.3 + 0.7;

  return (
    <div style={{ width, height, background: '#020408', overflow: 'hidden', position: 'relative', opacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {/* Glow filters */}
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-strong" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="16" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-node" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="bg-gradient" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>
        </defs>

        {/* Background gradient */}
        <rect width={width} height={height} fill="url(#bg-gradient)" />

        {/* Stars */}
        {STARS.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="white"
            opacity={star.opacity * (0.5 + Math.sin(time * 0.5 + i * 0.3) * 0.5)}
          />
        ))}

        {/* Grid overlay - longitude/latitude style */}
        {GRID_LINES_H.map((i) => (
          <line
            key={`gh-${i}`}
            x1={0}
            y1={(i / 11) * height}
            x2={width}
            y2={(i / 11) * height}
            stroke="#0d2a4a"
            strokeWidth={1}
            opacity={0.4}
          />
        ))}
        {GRID_LINES_V.map((i) => (
          <line
            key={`gv-${i}`}
            x1={(i / 19) * width}
            y1={0}
            x2={(i / 19) * width}
            y2={height}
            stroke="#0d2a4a"
            strokeWidth={1}
            opacity={0.4}
          />
        ))}

        {/* Continent silhouettes (simplified abstract shapes) */}
        {/* North America */}
        <path
          d="M 200 300 Q 350 250 500 320 Q 600 380 550 520 Q 480 600 380 580 Q 280 540 240 460 Q 180 400 200 300 Z"
          fill="#0a1e35"
          opacity={0.6}
          stroke="#1a3a5c"
          strokeWidth={1}
        />
        {/* South America */}
        <path
          d="M 380 700 Q 450 650 520 680 Q 560 740 540 840 Q 510 920 460 940 Q 400 930 370 860 Q 340 780 380 700 Z"
          fill="#0a1e35"
          opacity={0.6}
          stroke="#1a3a5c"
          strokeWidth={1}
        />
        {/* Europe */}
        <path
          d="M 1100 200 Q 1250 180 1380 220 Q 1450 260 1420 340 Q 1380 400 1280 410 Q 1160 400 1100 340 Q 1060 280 1100 200 Z"
          fill="#0a1e35"
          opacity={0.6}
          stroke="#1a3a5c"
          strokeWidth={1}
        />
        {/* Africa */}
        <path
          d="M 1200 450 Q 1350 420 1460 480 Q 1540 560 1520 700 Q 1490 820 1380 860 Q 1260 870 1180 780 Q 1120 680 1140 560 Q 1150 490 1200 450 Z"
          fill="#0a1e35"
          opacity={0.6}
          stroke="#1a3a5c"
          strokeWidth={1}
        />
        {/* Asia */}
        <path
          d="M 1500 150 Q 1800 120 2200 180 Q 2600 250 2800 320 Q 2900 400 2800 500 Q 2600 560 2300 540 Q 2000 520 1700 480 Q 1500 440 1460 360 Q 1440 260 1500 150 Z"
          fill="#0a1e35"
          opacity={0.6}
          stroke="#1a3a5c"
          strokeWidth={1}
        />
        {/* Australia */}
        <path
          d="M 2200 1200 Q 2400 1160 2550 1220 Q 2640 1280 2620 1380 Q 2580 1460 2460 1480 Q 2320 1480 2220 1400 Q 2160 1330 2200 1200 Z"
          fill="#0a1e35"
          opacity={0.6}
          stroke="#1a3a5c"
          strokeWidth={1}
        />

        {/* Ocean glow areas */}
        <ellipse cx={width * 0.5} cy={height * 0.45} rx={width * 0.4} ry={height * 0.3} fill="#020e1f" opacity={0.5} />

        {/* Cable routes - base glow */}
        {CABLE_ROUTES.map((route, i) => {
          const { cp1x, cp1y, cp2x, cp2y } = getCurvePoints(route.x1, route.y1, route.x2, route.y2);
          const pathD = `M ${route.x1 * width} ${route.y1 * height} C ${cp1x * width} ${cp1y * height} ${cp2x * width} ${cp2y * height} ${route.x2 * width} ${route.y2 * height}`;
          const pulseOpacity = 0.3 + Math.sin(time * 2 + i * 0.5) * 0.15;
          return (
            <g key={`cable-${i}`}>
              {/* Outer glow */}
              <path
                d={pathD}
                fill="none"
                stroke={route.color}
                strokeWidth={6}
                opacity={pulseOpacity * 0.4}
                filter="url(#glow-blue)"
              />
              {/* Core line */}
              <path
                d={pathD}
                fill="none"
                stroke={route.color}
                strokeWidth={2}
                opacity={pulseOpacity + 0.2}
              />
            </g>
          );
        })}

        {/* Data packets racing along routes */}
        {PACKETS.map((packet, i) => {
          const route = CABLE_ROUTES[packet.routeIndex];
          const { cp1x, cp1y, cp2x, cp2y } = getCurvePoints(route.x1, route.y1, route.x2, route.y2);

          const rawT = ((frame * packet.speed * 0.015 + packet.offset * 0.01) % 1 + 1) % 1;
          const t = rawT;

          const pos = cubicBezierPoint(
            t,
            route.x1 * width, route.y1 * height,
            cp1x * width, cp1y * height,
            cp2x * width, cp2y * height,
            route.x2 * width, route.y2 * height
          );

          // Trail packets
          const trailPositions = [0.04, 0.08, 0.12].map((delta) => {
            const tTrail = ((t - delta) + 1) % 1;
            return cubicBezierPoint(
              tTrail,
              route.x1 * width, route.y1 * height,
              cp1x * width, cp1y * height,
              cp2x * width, cp2y * height,
              route.x2 * width, route.y2 * height
            );
          });

          return (
            <g key={`packet-${i}`}>
              {/* Trail */}
              {trailPositions.map((trailPos, ti) => (
                <circle
                  key={`trail-${ti}`}
                  cx={trailPos.x}
                  cy={trailPos.y}
                  r={packet.size * (1 - (ti + 1) * 0.25)}
                  fill={route.color}
                  opacity={packet.brightness * (0.4 - ti * 0.12)}
                />
              ))}
              {/* Main packet glow */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={packet.size * 2.5}
                fill={route.color}
                opacity={packet.brightness * 0.25}
                filter="url(#glow-soft)"
              />
              {/* Main packet core */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={packet.size}
                fill="white"
                opacity={packet.brightness * 0.9}
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={packet.size * 0.5}
                fill={route.color}
                opacity={1}
              />
            </g>
          );
        })}

        {/* Network nodes */}
        {NODES.map((node, i) => {
          const nx = node.x * width;
          const ny = node.y * height;
          const pulse = Math.sin(time * 3 + i * 1.2) * 0.5 + 0.5;
          const ringScale = 1 + pulse * 0.6;
          const nodeColors = ['#00d4ff', '#ff6b35', '#a855f7', '#00ff9d', '#ffdd00'];
          const color = nodeColors[i % nodeColors.length];

          return (
            <g key={`node-${i}`}>
              {/* Outer pulsing ring */}
              <circle
                cx={nx}
                cy={ny}
                r={node.size * 2.5 * ringScale}
                fill="none"
                stroke={color}
                strokeWidth={2}
                opacity={0.3 * (1 - pulse * 0.5)}
                filter="url(#glow-node)"
              />
              {/* Second ring */}
              <circle
                cx={nx}
                cy={ny}
                r={node.size * 1.8}
                fill="none"
                stroke={color}
                strokeWidth={2}
                opacity={0.5}
              />
              {/* Node glow */}
              <circle
                cx={nx}
                cy={ny}
                r={node.size * 1.5}
                fill={color}
                opacity={0.2}
                filter="url(#glow-strong)"
              />
              {/* Node core */}
              <circle
                cx={nx}
                cy={ny}
                r={node.size * 0.7}
                fill={color}
                opacity={0.8 + pulse * 0.2}
              />
              <circle
                cx={nx}
                cy={ny}
                r={node.size * 0.35}
                fill="white"
                opacity={0.9}
              />
              {/* Cross hairs */}
              <line x1={nx - node.size * 2} y1={ny} x2={nx + node.size * 2} y2={ny}
                stroke={color} strokeWidth={1} opacity={0.4} />
              <line x1={nx} y1={ny - node.size * 2} x2={nx} y2={ny + node.size * 2}
                stroke={color} strokeWidth={1} opacity={0.4} />
            </g>
          );
        })}

        {/* Central scanning line effect */}
        {[0, 1, 2].map((scanIdx) => {
          const scanProgress = ((time * 0.08 + scanIdx * 0.33) % 1);
          const scanX = scanProgress * width;
          const scanOpacity = Math.sin(scanProgress * Math.PI) * 0.12;
          return (
            <line
              key={`scan-${scanIdx}`}
              x1={scanX}
              y1={0}
              x2={scanX}
              y2={height}
              stroke="#00d4ff"
              strokeWidth={2}
              opacity={scanOpacity}
              filter="url(#glow-blue)"
            />
          );
        })}

        {/* Corner decorations */}
        {[
          { x: 40, y: 40, rx: 1, ry: 1 },
          { x: width - 40, y: 40, rx: -1, ry: 1 },
          { x: 40, y: height - 40, rx: 1, ry: -1 },
          { x: width - 40, y: height - 40, rx: -1, ry: -1 },
        ].map((corner, i) => (
          <g key={`corner-${i}`}>
            <line x1={corner.x} y1={corner.y} x2={corner.x + corner.rx * 80} y2={corner.y}
              stroke="#00d4ff" strokeWidth={2} opacity={0.6} />
            <line x1={corner.x} y1={corner.y} x2={corner.x} y2={corner.y + corner.ry * 80}
              stroke="#00d4ff" strokeWidth={2} opacity={0.6} />
            <circle cx={corner.x} cy={corner.y} r={4} fill="#00d4ff" opacity={0.8} />
          </g>
        ))}

        {/* Global activity pulse from center of Atlantic */}
        {[1, 2, 3].map((ring) => {
          const ringProgress = ((time * 0.15 + ring * 0.33) % 1);
          const ringRadius = ringProgress * width * 0.55;
          const ringOpacity = (1 - ringProgress) * 0.06;
          return (
            <circle
              key={`ring-${ring}`}
              cx={width * 0.45}
              cy={height * 0.4}
              r={ringRadius}
              fill="none"
              stroke="#00d4ff"
              strokeWidth={2}
              opacity={ringOpacity}
            />
          );
        })}
      </svg>
    </div>
  );
};