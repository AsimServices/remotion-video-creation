import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const OFFICES = [
  { id: 0, lat: 40.7128, lng: -74.006, label: 'HQ', isHQ: true },
  { id: 1, lat: 51.5074, lng: -0.1278, label: 'London' },
  { id: 2, lat: 48.8566, lng: 2.3522, label: 'Paris' },
  { id: 3, lat: 35.6762, lng: 139.6503, label: 'Tokyo' },
  { id: 4, lat: 22.3193, lng: 114.1694, label: 'Hong Kong' },
  { id: 5, lat: 1.3521, lng: 103.8198, label: 'Singapore' },
  { id: 6, lat: -33.8688, lng: 151.2093, label: 'Sydney' },
  { id: 7, lat: 55.7558, lng: 37.6173, label: 'Moscow' },
  { id: 8, lat: 19.4326, lng: -99.1332, label: 'Mexico City' },
  { id: 9, lat: -23.5505, lng: -46.6333, label: 'São Paulo' },
  { id: 10, lat: 28.6139, lng: 77.209, label: 'New Delhi' },
  { id: 11, lat: 37.5665, lng: 126.978, label: 'Seoul' },
  { id: 12, lat: -26.2041, lng: 28.0473, label: 'Johannesburg' },
  { id: 13, lat: 25.2048, lng: 55.2708, label: 'Dubai' },
  { id: 14, lat: 52.52, lng: 13.405, label: 'Berlin' },
];

const LAND_POLYGONS = [
  // North America
  'M 180,120 L 240,110 L 280,120 L 310,150 L 340,160 L 350,180 L 330,220 L 300,250 L 280,280 L 260,310 L 240,330 L 220,350 L 200,340 L 190,320 L 185,290 L 175,270 L 160,260 L 155,240 L 160,210 L 170,190 L 175,170 L 170,150 Z',
  // South America
  'M 250,360 L 280,350 L 310,360 L 330,390 L 340,430 L 335,470 L 320,510 L 300,540 L 270,560 L 250,550 L 235,520 L 230,490 L 235,460 L 240,430 L 245,400 Z',
  // Europe
  'M 450,100 L 490,95 L 530,100 L 555,110 L 570,125 L 565,145 L 545,155 L 520,160 L 500,165 L 475,160 L 455,145 L 445,130 L 440,115 Z',
  // Africa
  'M 460,190 L 510,185 L 555,195 L 580,220 L 590,255 L 585,295 L 570,335 L 545,370 L 510,395 L 475,400 L 445,385 L 425,355 L 415,320 L 415,285 L 420,250 L 430,220 Z',
  // Asia
  'M 570,100 L 650,90 L 730,95 L 810,100 L 870,115 L 900,135 L 920,160 L 910,185 L 880,200 L 840,210 L 800,220 L 760,225 L 720,230 L 680,235 L 640,240 L 600,235 L 565,220 L 545,200 L 540,175 L 545,150 L 555,125 Z',
  // Australia
  'M 750,360 L 800,350 L 850,355 L 885,375 L 895,405 L 880,435 L 845,455 L 800,460 L 760,450 L 735,425 L 730,395 L 740,370 Z',
];

const GRID_LINES = Array.from({ length: 18 }, (_, i) => i);
const MERIDIANS = Array.from({ length: 36 }, (_, i) => i);

const STAR_PARTICLES = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1731 + 500) % 3840,
  y: (i * 1337 + 200) % 2160,
  size: ((i * 13) % 3) + 1,
  opacity: ((i * 7) % 8 + 2) / 10,
  twinkleOffset: (i * 17) % 60,
}));

const ARC_COLORS = [
  '#00d4ff',
  '#0099ff',
  '#00ffcc',
  '#7b61ff',
  '#ff6b6b',
  '#ffcc00',
  '#ff61b6',
  '#00ff88',
  '#ff8c42',
  '#61d4ff',
  '#b06bff',
  '#ff4d94',
  '#4dffb0',
  '#ffd700',
];

function latLngToXY(lat: number, lng: number, cx: number, cy: number, rx: number, ry: number) {
  const x = cx + (lng / 180) * rx;
  const y = cy - (lat / 90) * ry;
  return { x, y };
}

function cubicBezierArc(
  x1: number, y1: number,
  x2: number, y2: number,
  bulge: number
): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / (dist || 1);
  const ny = dx / (dist || 1);
  const cpx = mx + nx * bulge;
  const cpy = my + ny * bulge;
  return `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`;
}

function getPointOnQuadratic(
  x1: number, y1: number,
  cpx: number, cpy: number,
  x2: number, y2: number,
  t: number
) {
  const mt = 1 - t;
  return {
    x: mt * mt * x1 + 2 * mt * t * cpx + t * t * x2,
    y: mt * mt * y1 + 2 * mt * t * cpy + t * t * y2,
  };
}

export const BusinessExpansionGlobe: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.38;
  const ry = height * 0.42;

  const globeRotationX = interpolate(frame, [0, durationInFrames], [0, 10], {});
  const globeRotationY = interpolate(frame, [0, durationInFrames], [0, 360], {});
  const globePulse = interpolate(
    Math.sin((frame / 30) * Math.PI * 2),
    [-1, 1], [0.98, 1.02]
  );

  const hq = OFFICES[0];
  const hqPos = latLngToXY(hq.lat, hq.lng, cx, cy, rx, ry);

  const arcStaggerDelay = 25;

  return (
    <div style={{ width, height, background: '#050510', overflow: 'hidden', opacity: globalOpacity }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          {/* Radial gradient for globe */}
          <radialGradient id="globeGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#0d1f4a" />
            <stop offset="50%" stopColor="#071230" />
            <stop offset="100%" stopColor="#020818" />
          </radialGradient>
          <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a3a8a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0a1840" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="#00aaff" stopOpacity="0.15" />
          </radialGradient>
          {/* Arc glow filter */}
          <filter id="arcGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="nodeGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="20" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="hqGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="25" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="globeClip">
            <ellipse cx={cx} cy={cy} rx={rx * globePulse} ry={ry * globePulse} />
          </clipPath>
          {/* Particle dot gradient */}
          {ARC_COLORS.map((color, i) => (
            <radialGradient key={`particleGrad${i}`} id={`particleGrad${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* Background stars */}
        {STAR_PARTICLES.map((star, i) => {
          const twinkle = interpolate(
            Math.sin(((frame + star.twinkleOffset) / 40) * Math.PI * 2),
            [-1, 1], [0.3, 1]
          );
          return (
            <circle
              key={`star${i}`}
              cx={star.x}
              cy={star.y}
              r={star.size}
              fill="white"
              opacity={star.opacity * twinkle * 0.6}
            />
          );
        })}

        {/* Outer ambient glow */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx * 1.3}
          ry={ry * 1.3}
          fill="url(#outerGlow)"
        />

        {/* Globe base */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx * globePulse}
          ry={ry * globePulse}
          fill="url(#globeGrad)"
        />

        {/* Globe atmospheric halo */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx * globePulse * 1.02}
          ry={ry * globePulse * 1.02}
          fill="none"
          stroke="#1a6fff"
          strokeWidth="3"
          opacity="0.3"
        />
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx * globePulse * 1.05}
          ry={ry * globePulse * 1.05}
          fill="none"
          stroke="#0044cc"
          strokeWidth="2"
          opacity="0.15"
        />

        {/* Globe glow */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx * globePulse}
          ry={ry * globePulse}
          fill="url(#globeGlow)"
        />

        {/* Grid lines - latitude */}
        <g clipPath="url(#globeClip)" opacity="0.2">
          {GRID_LINES.map((i) => {
            const lat = -85 + i * 10;
            const yPos = cy - (lat / 90) * ry;
            const progress = 1 - Math.abs(lat) / 90;
            const lineRx = rx * progress;
            return (
              <ellipse
                key={`lat${i}`}
                cx={cx}
                cy={yPos}
                rx={lineRx}
                ry={lineRx * 0.15}
                fill="none"
                stroke="#2255aa"
                strokeWidth="1"
              />
            );
          })}
          {/* Meridians */}
          {MERIDIANS.map((i) => {
            const lng = -175 + i * 10;
            const xPos = cx + (lng / 180) * rx;
            return (
              <line
                key={`lng${i}`}
                x1={xPos}
                y1={cy - ry}
                x2={xPos}
                y2={cy + ry}
                stroke="#2255aa"
                strokeWidth="1"
              />
            );
          })}
        </g>

        {/* Land masses */}
        <g clipPath="url(#globeClip)">
          {LAND_POLYGONS.map((path, i) => (
            <path
              key={`land${i}`}
              d={path}
              fill="#0d2d6e"
              stroke="#1a4499"
              strokeWidth="1.5"
              opacity="0.7"
            />
          ))}
        </g>

        {/* Equator line */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx * globePulse}
          ry={rx * globePulse * 0.1}
          fill="none"
          stroke="#1a6fff"
          strokeWidth="1.5"
          clipPath="url(#globeClip)"
          opacity="0.4"
        />

        {/* Arcs from HQ to each office */}
        {OFFICES.slice(1).map((office, idx) => {
          const arcIndex = idx;
          const color = ARC_COLORS[arcIndex % ARC_COLORS.length];
          const delay = 80 + arcIndex * arcStaggerDelay;
          const arcDuration = 80;
          const progress = interpolate(frame, [delay, delay + arcDuration], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const officePos = latLngToXY(office.lat, office.lng, cx, cy, rx, ry);
          const dx = officePos.x - hqPos.x;
          const dy = officePos.y - hqPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const bulge = -(dist * 0.5 + 200);

          const mx = (hqPos.x + officePos.x) / 2;
          const my = (hqPos.y + officePos.y) / 2;
          const nx = -dy / (dist || 1);
          const ny = dx / (dist || 1);
          const cpx = mx + nx * bulge;
          const cpy = my + ny * bulge;

          const arcPath = cubicBezierArc(hqPos.x, hqPos.y, officePos.x, officePos.y, bulge);

          // Dasharray for draw-on effect
          const pathLength = dist * 1.5 + Math.abs(bulge) * 0.8;
          const dashArray = pathLength;
          const dashOffset = pathLength * (1 - progress);

          // Animated particle along arc
          const particleT = ((frame - delay) / 60) % 1;
          const particlePos = progress > 0
            ? getPointOnQuadratic(hqPos.x, hqPos.y, cpx, cpy, officePos.x, officePos.y, Math.min(particleT, 1))
            : null;

          // Pulse rings at destination
          const pulseStart = delay + arcDuration;
          const pulseProgress = interpolate(frame, [pulseStart, pulseStart + 40], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const pulseOpacity = interpolate(pulseProgress, [0, 0.5, 1], [0, 0.8, 0]);
          const pulseScale = interpolate(pulseProgress, [0, 1], [1, 3]);

          return (
            <g key={`arc${idx}`}>
              {/* Arc glow */}
              <path
                d={arcPath}
                fill="none"
                stroke={color}
                strokeWidth="6"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                opacity="0.25"
                filter="url(#arcGlow)"
                strokeLinecap="round"
              />
              {/* Arc main */}
              <path
                d={arcPath}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                opacity={0.9 * progress}
                strokeLinecap="round"
              />

              {/* Moving particle */}
              {particlePos && progress > 0.05 && particleT < 0.98 && (
                <g>
                  <circle
                    cx={particlePos.x}
                    cy={particlePos.y}
                    r={18}
                    fill={`url(#particleGrad${arcIndex % ARC_COLORS.length})`}
                    opacity="0.6"
                  />
                  <circle
                    cx={particlePos.x}
                    cy={particlePos.y}
                    r={7}
                    fill={color}
                    opacity="0.95"
                    filter="url(#nodeGlow)"
                  />
                  <circle
                    cx={particlePos.x}
                    cy={particlePos.y}
                    r={3}
                    fill="white"
                    opacity="1"
                  />
                </g>
              )}

              {/* Destination pulse ring */}
              {pulseProgress > 0 && (
                <circle
                  cx={officePos.x}
                  cy={officePos.y}
                  r={20 * pulseScale}
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  opacity={pulseOpacity}
                />
              )}

              {/* Destination node */}
              {progress > 0.8 && (
                <g filter="url(#nodeGlow)">
                  <circle
                    cx={officePos.x}
                    cy={officePos.y}
                    r={16}
                    fill={color}
                    opacity="0.2"
                  />
                  <circle
                    cx={officePos.x}
                    cy={officePos.y}
                    r={8}
                    fill={color}
                    opacity="0.7"
                  />
                  <circle
                    cx={officePos.x}
                    cy={officePos.y}
                    r={4}
                    fill="white"
                    opacity="0.9"
                  />
                </g>
              )}
            </g>
          );
        })}

        {/* HQ Node - always visible */}
        <g filter="url(#hqGlow)">
          {[80, 50, 30, 18, 10].map((r, i) => {
            const pulse = interpolate(
              Math.sin(((frame + i * 15) / 30) * Math.PI * 2),
              [-1, 1], [0.7, 1.3]
            );
            const opacities = [0.06, 0.1, 0.2, 0.5, 0.9];
            const colors = ['#00d4ff', '#00aaff', '#0099ff', '#00ccff', 'white'];
            return (
              <circle
                key={`hq${i}`}
                cx={hqPos.x}
                cy={hqPos.y}
                r={r * pulse}
                fill={i < 3 ? colors[i] : 'none'}
                stroke={i >= 3 ? colors[i] : 'none'}
                strokeWidth={i === 3 ? 3 : 2}
                opacity={opacities[i]}
              />
            );
          })}
          <circle
            cx={hqPos.x}
            cy={hqPos.y}
            r={6}
            fill="#00ffff"
            opacity="1"
          />
        </g>

        {/* Rotating ring around globe */}
        {[0, 1, 2].map((ringIdx) => {
          const ringOffset = ringIdx * 120;
          const ringAngle = ((frame + ringOffset) * 0.4) % 360;
          const ringRadians = (ringAngle * Math.PI) / 180;
          const ringRx = rx * 1.08 + ringIdx * 15;
          const ringRy = ry * 0.08 + ringIdx * 5;
          const opacities = [0.3, 0.2, 0.12];
          const colors = ['#0066ff', '#00aaff', '#004488'];
          return (
            <ellipse
              key={`ring${ringIdx}`}
              cx={cx}
              cy={cy}
              rx={ringRx}
              ry={ringRy}
              fill="none"
              stroke={colors[ringIdx]}
              strokeWidth={3 - ringIdx}
              strokeDasharray={`${ringRx * 0.3} ${ringRx * 0.7}`}
              strokeDashoffset={-ringRx * (ringAngle / 360)}
              opacity={opacities[ringIdx]}
              transform={`rotate(${ringAngle * 0.5}, ${cx}, ${cy})`}
            />
          );
        })}

        {/* Globe border highlight */}
        <ellipse
          cx={cx - rx * 0.15}
          cy={cy - ry * 0.15}
          rx={rx * 0.55}
          ry={ry * 0.45}
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.06"
          clipPath="url(#globeClip)"
        />

        {/* Scanline overlay on globe */}
        <g clipPath="url(#globeClip)" opacity="0.04">
          {Array.from({ length: 40 }, (_, i) => (
            <line
              key={`scan${i}`}
              x1={cx - rx}
              y1={cy - ry + (i * ry * 2) / 40}
              x2={cx + rx}
              y2={cy - ry + (i * ry * 2) / 40}
              stroke="white"
              strokeWidth="2"
            />
          ))}
        </g>
      </svg>
    </div>
  );
};