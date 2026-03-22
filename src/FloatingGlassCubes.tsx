import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CUBE_COUNT = 28;

const CUBES = Array.from({ length: CUBE_COUNT }, (_, i) => ({
  x: (i * 1731 + 200) % 1920,
  y: (i * 1337 + 150) % 1080,
  size: 40 + (i * 47) % 120,
  depth: 0.2 + (i * 0.031) % 0.8,
  speedX: ((i * 17) % 20 - 10) * 0.01,
  speedY: ((i * 13) % 16 - 8) * 0.01,
  rotationSpeed: ((i * 7) % 20 - 10) * 0.02,
  initialRotation: (i * 47) % 360,
  hue: (i * 37 + 180) % 360,
  opacity: 0.15 + (i * 0.023) % 0.35,
}));

function project(x: number, y: number, size: number, depth: number, frame: number, w: number, h: number) {
  const parallaxX = x + frame * 0.3 * depth;
  const parallaxY = y + frame * 0.12 * depth;
  const wrappedX = ((parallaxX % (w + size * 2)) + w + size * 2) % (w + size * 2) - size;
  const wrappedY = ((parallaxY % (h + size * 2)) + h + size * 2) % (h + size * 2) - size;
  return { px: wrappedX, py: wrappedY };
}

function GlassCubeFace({
  points,
  hue,
  opacity,
  faceIndex,
}: {
  points: string;
  hue: number;
  opacity: number;
  faceIndex: number;
}) {
  const lightness = [0.6, 0.45, 0.3, 0.5, 0.25, 0.55][faceIndex % 6];
  return (
    <polygon
      points={points}
      fill={`hsla(${hue}, 80%, ${lightness * 100}%, ${opacity * 0.6})`}
      stroke={`hsla(${hue + 20}, 90%, 85%, ${opacity * 0.9})`}
      strokeWidth="1"
    />
  );
}

function drawCube(
  cx: number,
  cy: number,
  size: number,
  rotX: number,
  rotY: number,
  hue: number,
  opacity: number,
  depth: number
) {
  const s = size / 2;
  const verts3D = [
    [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
    [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s],
  ];

  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);

  const project3D = ([x, y, z]: number[]) => {
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    const x2 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;
    const fov = 600 + depth * 200;
    const scale = fov / (fov + z2 + 200);
    return [cx + x2 * scale, cy + y1 * scale];
  };

  const projected = verts3D.map(project3D);

  const faces = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [0, 1, 5, 4],
    [2, 3, 7, 6],
    [0, 3, 7, 4],
    [1, 2, 6, 5],
  ];

  return faces.map((face, fi) => {
    const pts = face.map((vi) => projected[vi].join(',')).join(' ');
    return (
      <GlassCubeFace
        key={fi}
        points={pts}
        hue={hue}
        opacity={opacity}
        faceIndex={fi}
      />
    );
  });
}

export const FloatingGlassCubes: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const bgGradient = `radial-gradient(ellipse at 40% 50%, #0d1a2e 0%, #050a12 60%, #020408 100%)`;

  return (
    <div style={{ width, height, background: bgGradient, overflow: 'hidden', position: 'relative', opacity: globalOpacity }}>
      {/* Ambient glow layers */}
      <div style={{
        position: 'absolute',
        width: 600, height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(50,100,255,0.06) 0%, transparent 70%)',
        left: '20%', top: '10%',
        transform: `translate(${Math.sin(frame * 0.008) * 60}px, ${Math.cos(frame * 0.006) * 40}px)`,
      }} />
      <div style={{
        position: 'absolute',
        width: 500, height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(180,50,255,0.05) 0%, transparent 70%)',
        right: '15%', bottom: '20%',
        transform: `translate(${Math.cos(frame * 0.007) * 50}px, ${Math.sin(frame * 0.009) * 35}px)`,
      }} />

      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Back cubes (low depth) first */}
        {[...CUBES]
          .sort((a, b) => a.depth - b.depth)
          .map((cube, i) => {
            const { px, py } = project(cube.x, cube.y, cube.size, cube.depth, frame, width, height);
            const rotX = (frame * cube.rotationSpeed * 0.015 + cube.initialRotation * 0.01745);
            const rotY = (frame * cube.rotationSpeed * 0.011 + cube.initialRotation * 0.00873);
            const scale = 0.4 + cube.depth * 0.9;
            const actualSize = cube.size * scale;

            return (
              <g key={i} filter="url(#glow)" style={{ opacity: cube.depth * 0.8 + 0.2 }}>
                {drawCube(px, py, actualSize, rotX, rotY, cube.hue, cube.opacity, cube.depth)}
              </g>
            );
          })}
      </svg>

      {/* Scanline overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};