import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 2731 + 317) % 3840,
  y: (i * 1937 + 211) % 2160,
  size: ((i * 73) % 4) + 1,
  opacity: ((i * 97) % 60 + 40) / 100,
  twinkleOffset: (i * 53) % 100,
}));

const LAT_LINES = 18;
const LON_LINES = 24;
const RADIUS = 800;

function project3D(
  x3: number,
  y3: number,
  z3: number,
  cx: number,
  cy: number,
  focalLength: number
): { x: number; y: number; scale: number; visible: boolean } {
  const z = z3 + focalLength;
  if (z <= 0) return { x: cx, y: cy, scale: 0, visible: false };
  const scale = focalLength / z;
  return {
    x: cx + x3 * scale,
    y: cy + y3 * scale,
    scale,
    visible: z3 > -RADIUS * 0.6,
  };
}

function rotateY(
  x: number,
  y: number,
  z: number,
  angle: number
): [number, number, number] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x * cos + z * sin, y, -x * sin + z * cos];
}

function rotateX(
  x: number,
  y: number,
  z: number,
  angle: number
): [number, number, number] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x, y * cos - z * sin, y * sin + z * cos];
}

export const GoldWireframeEarth: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const rotationY = (frame / durationInFrames) * Math.PI * 4;
  const rotationX = Math.sin(frame * 0.008) * 0.25;
  const focalLength = 4000;
  const cx = width / 2;
  const cy = height / 2;

  const SEGMENTS = 64;

  const latitudePaths: React.ReactElement[] = [];
  for (let li = 1; li < LAT_LINES; li++) {
    const phi = (li / LAT_LINES) * Math.PI;
    const y3d = RADIUS * Math.cos(phi);
    const r = RADIUS * Math.sin(phi);

    const points: Array<{ x: number; y: number; visible: boolean; z: number }> = [];
    for (let si = 0; si <= SEGMENTS; si++) {
      const theta = (si / SEGMENTS) * Math.PI * 2;
      let [x, yy, z] = [r * Math.cos(theta), y3d, r * Math.sin(theta)];
      [x, yy, z] = rotateY(x, yy, z, rotationY);
      [x, yy, z] = rotateX(x, yy, z, rotationX);
      const proj = project3D(x, yy, z, cx, cy, focalLength);
      points.push({ x: proj.x, y: proj.y, visible: z > -RADIUS * 0.05, z });
    }

    let d = '';
    let inPath = false;
    for (let si = 0; si < points.length; si++) {
      const pt = points[si];
      if (pt.visible) {
        if (!inPath) {
          d += `M ${pt.x} ${pt.y} `;
          inPath = true;
        } else {
          d += `L ${pt.x} ${pt.y} `;
        }
      } else {
        inPath = false;
      }
    }

    if (d) {
      const depth = (li / LAT_LINES - 0.5) * 2;
      const opacityMod = interpolate(Math.abs(depth), [0, 1], [1, 0.3]);
      latitudePaths.push(
        <path
          key={`lat-${li}`}
          d={d}
          stroke={`rgba(255, 215, 80, ${0.55 * opacityMod})`}
          strokeWidth={2.5}
          fill="none"
        />
      );
    }
  }

  const longitudePaths: React.ReactElement[] = [];
  for (let li = 0; li < LON_LINES; li++) {
    const theta = (li / LON_LINES) * Math.PI * 2;

    const points: Array<{ x: number; y: number; visible: boolean; z: number }> = [];
    for (let si = 0; si <= SEGMENTS; si++) {
      const phi = (si / SEGMENTS) * Math.PI;
      const y3d = RADIUS * Math.cos(phi);
      const r = RADIUS * Math.sin(phi);
      let [x, yy, z] = [r * Math.cos(theta), y3d, r * Math.sin(theta)];
      [x, yy, z] = rotateY(x, yy, z, rotationY);
      [x, yy, z] = rotateX(x, yy, z, rotationX);
      const proj = project3D(x, yy, z, cx, cy, focalLength);
      points.push({ x: proj.x, y: proj.y, visible: z > -RADIUS * 0.05, z });
    }

    let d = '';
    let inPath = false;
    for (let si = 0; si < points.length; si++) {
      const pt = points[si];
      if (pt.visible) {
        if (!inPath) {
          d += `M ${pt.x} ${pt.y} `;
          inPath = true;
        } else {
          d += `L ${pt.x} ${pt.y} `;
        }
      } else {
        inPath = false;
      }
    }

    if (d) {
      longitudePaths.push(
        <path
          key={`lon-${li}`}
          d={d}
          stroke={`rgba(255, 200, 50, 0.5)`}
          strokeWidth={2}
          fill="none"
        />
      );
    }
  }

  const glowPulse = interpolate(Math.sin(frame * 0.04), [-1, 1], [0.3, 0.7]);

  return (
    <div
      style={{
        width,
        height,
        background: '#000000',
        position: 'relative',
        overflow: 'hidden',
        opacity: globalOpacity,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <radialGradient id="sphereGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.08" />
            <stop offset="60%" stopColor="#FF8C00" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity={glowPulse * 0.15} />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <filter id="starBlur">
            <feGaussianBlur stdDeviation="1" />
          </filter>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Stars */}
        {STARS.map((star, i) => {
          const twinkle = interpolate(
            Math.sin(frame * 0.05 + star.twinkleOffset),
            [-1, 1],
            [0.3, 1]
          );
          return (
            <circle
              key={`star-${i}`}
              cx={star.x}
              cy={star.y}
              r={star.size}
              fill={`rgba(255, 255, 255, ${star.opacity * twinkle})`}
            />
          );
        })}

        {/* Outer ambient glow */}
        <circle
          cx={cx}
          cy={cy}
          r={RADIUS * 1.4}
          fill="url(#outerGlow)"
        />

        {/* Sphere fill glow */}
        <circle
          cx={cx}
          cy={cy}
          r={RADIUS}
          fill="url(#sphereGlow)"
        />

        {/* Wireframe lines */}
        <g filter="url(#glowFilter)">
          {latitudePaths}
          {longitudePaths}
        </g>

        {/* Equator highlight */}
        {(() => {
          const eqPoints: Array<{ x: number; y: number; visible: boolean; z: number }> = [];
          for (let si = 0; si <= SEGMENTS; si++) {
            const theta = (si / SEGMENTS) * Math.PI * 2;
            let [x, yy, z] = [RADIUS * Math.cos(theta), 0, RADIUS * Math.sin(theta)];
            [x, yy, z] = rotateY(x, yy, z, rotationY);
            [x, yy, z] = rotateX(x, yy, z, rotationX);
            const proj = project3D(x, yy, z, cx, cy, focalLength);
            eqPoints.push({ x: proj.x, y: proj.y, visible: z > -RADIUS * 0.05, z });
          }
          let d = '';
          let inPath = false;
          for (let si = 0; si < eqPoints.length; si++) {
            const pt = eqPoints[si];
            if (pt.visible) {
              if (!inPath) { d += `M ${pt.x} ${pt.y} `; inPath = true; }
              else { d += `L ${pt.x} ${pt.y} `; }
            } else { inPath = false; }
          }
          return d ? (
            <path
              d={d}
              stroke={`rgba(255, 240, 120, ${0.85 * glowPulse})`}
              strokeWidth={4}
              fill="none"
              filter="url(#glowFilter)"
            />
          ) : null;
        })()}

        {/* Sphere border circle */}
        <circle
          cx={cx}
          cy={cy}
          r={RADIUS}
          fill="none"
          stroke={`rgba(255, 200, 50, ${0.2 * glowPulse})`}
          strokeWidth={3}
        />
      </svg>
    </div>
  );
};