import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CONTINENTS = [
  { id: 'north_america', cx: 0.18, cy: 0.38, rx: 0.10, ry: 0.08, label: 'NA' },
  { id: 'south_america', cx: 0.25, cy: 0.62, rx: 0.07, ry: 0.10, label: 'SA' },
  { id: 'europe', cx: 0.47, cy: 0.28, rx: 0.06, ry: 0.06, label: 'EU' },
  { id: 'africa', cx: 0.49, cy: 0.52, rx: 0.07, ry: 0.12, label: 'AF' },
  { id: 'asia', cx: 0.65, cy: 0.32, rx: 0.14, ry: 0.10, label: 'AS' },
  { id: 'australia', cx: 0.75, cy: 0.65, rx: 0.07, ry: 0.06, label: 'AU' },
  { id: 'antarctica', cx: 0.50, cy: 0.88, rx: 0.12, ry: 0.04, label: 'AN' },
];

const ARC_TARGETS = [
  { tx: 0.18, ty: 0.38, delay: 0, color: '#FFD700' },
  { tx: 0.25, ty: 0.62, delay: 20, color: '#FFC200' },
  { tx: 0.47, ty: 0.28, delay: 40, color: '#FFE066' },
  { tx: 0.49, ty: 0.52, delay: 60, color: '#FFAA00' },
  { tx: 0.65, ty: 0.32, delay: 80, color: '#FFD700' },
  { tx: 0.75, ty: 0.65, delay: 100, color: '#FFC200' },
  { tx: 0.50, ty: 0.88, delay: 120, color: '#FFE066' },
];

const SOURCE = { x: 0.50, y: 0.50 };

const PARTICLES = Array.from({ length: 120 }, (_, i) => ({
  angle: (i * 137.508) % 360,
  radius: 20 + (i * 47) % 180,
  size: 1.5 + (i % 5) * 0.6,
  speed: 0.4 + (i % 7) * 0.08,
  opacity: 0.3 + (i % 4) * 0.15,
  orbitOffset: (i * 23) % 100,
}));

const GRID_LINES_H = Array.from({ length: 18 }, (_, i) => i);
const GRID_LINES_V = Array.from({ length: 32 }, (_, i) => i);

const RIPPLES = Array.from({ length: 5 }, (_, i) => ({
  delay: i * 50,
  maxRadius: 200 + i * 80,
}));

function getBezierPoint(t: number, x0: number, y0: number, x1: number, y1: number, x2: number, y2: number) {
  const mt = 1 - t;
  return {
    x: mt * mt * x0 + 2 * mt * t * x1 + t * t * x2,
    y: mt * mt * y0 + 2 * mt * t * y1 + t * t * y2,
  };
}

function getArcControlPoint(sx: number, sy: number, tx: number, ty: number) {
  const mx = (sx + tx) / 2;
  const my = (sy + ty) / 2;
  const dx = tx - sx;
  const dy = ty - sy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / dist;
  const ny = dx / dist;
  const bend = dist * 0.45;
  return { cpx: mx + nx * bend, cpy: my + ny * bend };
}

export const GoldBusinessExpansionArcs: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const masterOpacity = Math.min(fadeIn, fadeOut);

  const sx = SOURCE.x * width;
  const sy = SOURCE.y * height;

  const pulseScale = 1 + 0.15 * Math.sin(frame * 0.12);
  const pulseOpacity = 0.6 + 0.4 * Math.sin(frame * 0.12);

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 50% 50%, #0a0800 0%, #000000 100%)',
        position: 'relative',
        overflow: 'hidden',
        opacity: masterOpacity,
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sourceGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#FFA500" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FF6600" stopOpacity="0" />
          </radialGradient>
          <filter id="blur1">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="blur3">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <linearGradient id="arcGrad0" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#FFD700" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFE566" stopOpacity="0.8" />
          </linearGradient>
          {ARC_TARGETS.map((t, i) => (
            <linearGradient key={i} id={`arcGrad${i}`} x1={`${SOURCE.x * 100}%`} y1={`${SOURCE.y * 100}%`} x2={`${t.tx * 100}%`} y2={`${t.ty * 100}%`} gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor={t.color} stopOpacity="0.2" />
              <stop offset="50%" stopColor={t.color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={t.color} stopOpacity="0.6" />
            </linearGradient>
          ))}
        </defs>

        {/* Background glow */}
        <ellipse
          cx={sx}
          cy={sy}
          rx={width * 0.45}
          ry={height * 0.45}
          fill="url(#goldGlow)"
          filter="url(#blur3)"
          opacity={0.6}
        />

        {/* Grid */}
        {GRID_LINES_H.map((i) => {
          const y = (i / 17) * height;
          const gridOpacity = 0.04 + 0.02 * Math.sin(frame * 0.05 + i * 0.4);
          return (
            <line
              key={`gh${i}`}
              x1={0} y1={y} x2={width} y2={y}
              stroke="#FFD700"
              strokeWidth={0.5}
              opacity={gridOpacity}
            />
          );
        })}
        {GRID_LINES_V.map((i) => {
          const x = (i / 31) * width;
          const gridOpacity = 0.04 + 0.02 * Math.sin(frame * 0.05 + i * 0.3);
          return (
            <line
              key={`gv${i}`}
              x1={x} y1={0} x2={x} y2={height}
              stroke="#FFD700"
              strokeWidth={0.5}
              opacity={gridOpacity}
            />
          );
        })}

        {/* Continents */}
        {CONTINENTS.map((c) => {
          const cx = c.cx * width;
          const cy = c.cy * height;
          const rx = c.rx * width;
          const ry = c.ry * height;
          const pulse = 1 + 0.04 * Math.sin(frame * 0.08 + c.cx * 10);
          return (
            <g key={c.id}>
              <ellipse
                cx={cx} cy={cy}
                rx={rx * pulse} ry={ry * pulse}
                fill="#1a1200"
                stroke="#3a2a00"
                strokeWidth={2}
                opacity={0.85}
              />
              <ellipse
                cx={cx} cy={cy}
                rx={rx * pulse * 0.85} ry={ry * pulse * 0.85}
                fill="#201500"
                opacity={0.6}
              />
            </g>
          );
        })}

        {/* Expansion arcs */}
        {ARC_TARGETS.map((target, i) => {
          const arcStart = 80 + target.delay;
          const arcDuration = 90;
          const arcProgress = interpolate(frame, [arcStart, arcStart + arcDuration], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          if (arcProgress <= 0) return null;

          const tx = target.tx * width;
          const ty = target.ty * height;
          const { cpx, cpy } = getArcControlPoint(sx, sy, tx, ty);

          // Build partial path using bezier approximation
          const steps = 60;
          const maxStep = Math.floor(arcProgress * steps);
          const points: { x: number; y: number }[] = [];
          for (let s = 0; s <= maxStep; s++) {
            const t2 = s / steps;
            points.push(getBezierPoint(t2, sx, sy, cpx, cpy, tx, ty));
          }

          let pathD = '';
          if (points.length > 1) {
            pathD = `M ${points[0].x} ${points[0].y}`;
            for (let p = 1; p < points.length; p++) {
              pathD += ` L ${points[p].x} ${points[p].y}`;
            }
          }

          // Traveling dot position
          const dotPos = getBezierPoint(arcProgress, sx, sy, cpx, cpy, tx, ty);

          // Target glow when arc reaches
          const targetReached = arcProgress >= 0.95;
          const targetPulse = targetReached ? 1 + 0.2 * Math.sin(frame * 0.15 + i) : 0;

          return (
            <g key={`arc${i}`}>
              {/* Glow trail */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke={target.color}
                  strokeWidth={6}
                  opacity={0.15}
                  filter="url(#blur2)"
                />
              )}
              {/* Main arc */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke={target.color}
                  strokeWidth={2}
                  opacity={0.85}
                  strokeLinecap="round"
                />
              )}
              {/* Traveling dot */}
              <circle
                cx={dotPos.x}
                cy={dotPos.y}
                r={8}
                fill={target.color}
                opacity={0.95}
                filter="url(#blur2)"
              />
              <circle
                cx={dotPos.x}
                cy={dotPos.y}
                r={4}
                fill="#FFFFFF"
                opacity={0.9}
              />
              {/* Target burst */}
              {targetReached && (
                <>
                  <circle
                    cx={tx} cy={ty}
                    r={25 + targetPulse * 15}
                    fill="none"
                    stroke={target.color}
                    strokeWidth={2}
                    opacity={0.5 - targetPulse * 0.2}
                    filter="url(#blur2)"
                  />
                  <circle
                    cx={tx} cy={ty}
                    r={12}
                    fill={target.color}
                    opacity={0.7 + targetPulse * 0.1}
                    filter="url(#blur1)"
                  />
                  <circle
                    cx={tx} cy={ty}
                    r={5}
                    fill="#FFFFFF"
                    opacity={0.95}
                  />
                </>
              )}
            </g>
          );
        })}

        {/* Ripples from source */}
        {RIPPLES.map((r, i) => {
          const rippleFrame = (frame - r.delay);
          if (rippleFrame < 0) return null;
          const rippleCycle = (rippleFrame % 120) / 120;
          const rippleRadius = rippleCycle * r.maxRadius;
          const rippleOpacity = (1 - rippleCycle) * 0.5;
          return (
            <circle
              key={`ripple${i}`}
              cx={sx} cy={sy}
              r={rippleRadius}
              fill="none"
              stroke="#FFD700"
              strokeWidth={1.5}
              opacity={rippleOpacity}
            />
          );
        })}

        {/* Orbiting particles */}
        {PARTICLES.map((p, i) => {
          const angle = (p.angle + frame * p.speed * 0.8 + p.orbitOffset) * (Math.PI / 180);
          const radiusX = p.radius * (width / 1920);
          const radiusY = p.radius * 0.6 * (height / 1080);
          const px = sx + Math.cos(angle) * radiusX;
          const py = sy + Math.sin(angle) * radiusY;
          const twinkle = 0.5 + 0.5 * Math.sin(frame * 0.15 + i * 0.7);
          return (
            <circle
              key={`particle${i}`}
              cx={px} cy={py}
              r={p.size}
              fill="#FFD700"
              opacity={p.opacity * twinkle * 0.6}
            />
          );
        })}

        {/* Source point */}
        <circle
          cx={sx} cy={sy}
          r={50 * pulseScale}
          fill="url(#sourceGlow)"
          filter="url(#blur3)"
          opacity={0.7}
        />
        <circle
          cx={sx} cy={sy}
          r={22}
          fill="#FFD700"
          opacity={0.9}
          filter="url(#blur1)"
        />
        <circle
          cx={sx} cy={sy}
          r={12}
          fill="#FFE566"
          opacity={1}
          filter="url(#blur2)"
        />
        <circle
          cx={sx} cy={sy}
          r={6}
          fill="#FFFFFF"
          opacity={pulseOpacity}
        />

        {/* Outer ring decorations */}
        {[60, 80, 110].map((radius, idx) => {
          const rot = frame * (0.2 + idx * 0.1) * (idx % 2 === 0 ? 1 : -1);
          const dashLen = 12 + idx * 4;
          const gapLen = 8 + idx * 6;
          return (
            <circle
              key={`ring${idx}`}
              cx={sx} cy={sy}
              r={radius}
              fill="none"
              stroke="#FFD700"
              strokeWidth={1.5 - idx * 0.3}
              strokeDasharray={`${dashLen} ${gapLen}`}
              strokeDashoffset={rot}
              opacity={0.35 - idx * 0.08}
            />
          );
        })}
      </svg>
    </div>
  );
};