import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const RotatingIcosahedron: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const t = frame / 30;
  const rotX = t * 0.4;
  const rotY = t * 0.7;
  const rotZ = t * 0.2;

  // Icosahedron vertices
  const phi = (1 + Math.sqrt(5)) / 2;
  const rawVertices: [number, number, number][] = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
  ];

  // Normalize
  const norm = Math.sqrt(1 + phi * phi);
  const vertices: [number, number, number][] = rawVertices.map(([x, y, z]) => [x / norm, y / norm, z / norm]);

  // Icosahedron edges
  const edges: [number, number][] = [
    [0,1],[0,5],[0,7],[0,10],[0,11],
    [1,5],[1,7],[1,8],[1,9],
    [2,3],[2,4],[2,10],[2,11],[2,6],
    [3,4],[3,6],[3,8],[3,9],
    [4,5],[4,9],[4,11],
    [5,9],[5,11],
    [6,7],[6,8],[6,10],
    [7,8],[7,10],
    [8,9],[10,11],
  ];

  const rotateX = (v: [number, number, number], a: number): [number, number, number] => {
    const [x, y, z] = v;
    return [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
  };
  const rotateY = (v: [number, number, number], a: number): [number, number, number] => {
    const [x, y, z] = v;
    return [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
  };
  const rotateZ = (v: [number, number, number], a: number): [number, number, number] => {
    const [x, y, z] = v;
    return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z];
  };

  const scale = Math.min(width, height) * 0.32;
  const cx = width / 2;
  const cy = height / 2;

  const project = (v: [number, number, number]): { x: number; y: number; z: number } => {
    let p = rotateX(v, rotX);
    p = rotateY(p, rotY);
    p = rotateZ(p, rotZ);
    const fov = 3.5;
    const zOff = 3;
    const perspective = fov / (fov + p[2] + zOff);
    return { x: cx + p[0] * scale * perspective, y: cy + p[1] * scale * perspective, z: p[2] };
  };

  const projected = vertices.map(project);

  // Pulse glow
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.5);
  const glowRadius = 10 + pulse * 8;
  const vertexRadius = 5 + pulse * 3;

  // Edge colors based on depth
  const getEdgeColor = (z1: number, z2: number) => {
    const avgZ = (z1 + z2) / 2;
    const normalized = (avgZ + 1) / 2;
    const r = Math.round(80 + normalized * 120);
    const g = Math.round(160 + normalized * 80);
    const b = Math.round(255);
    return `rgb(${r},${g},${b})`;
  };

  const sortedEdges = [...edges].sort((a, b) => {
    const zA = (projected[a[0]].z + projected[a[1]].z) / 2;
    const zB = (projected[b[0]].z + projected[b[1]].z) / 2;
    return zA - zB;
  });

  const sortedVertices = [...projected.map((p, i) => ({ ...p, i }))]
    .sort((a, b) => a.z - b.z);

  return (
    <div style={{ width, height, background: '#020408', opacity, position: 'relative', overflow: 'hidden' }}>
      {/* Background stars */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>
          <filter id="edgeBlur">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
          <filter id="vertexGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect width={width} height={height} fill="url(#bgGlow)" />
        {Array.from({ length: 120 }).map((_, i) => {
          const sx = ((i * 137.5 + 50) % width);
          const sy = ((i * 97.3 + 30) % height);
          const sr = 0.5 + (i % 3) * 0.5;
          const sa = 0.3 + (i % 5) * 0.14;
          return <circle key={i} cx={sx} cy={sy} r={sr} fill="white" opacity={sa} />;
        })}

        {/* Center ambient glow */}
        <ellipse cx={cx} cy={cy} rx={scale * 1.1} ry={scale * 1.1}
          fill="none" stroke={`rgba(0,120,255,${0.04 + pulse * 0.04})`}
          strokeWidth={scale * 0.8} />

        {/* Edges (back layer) */}
        {sortedEdges.map(([a, b], i) => {
          const pa = projected[a];
          const pb = projected[b];
          const avgZ = (pa.z + pb.z) / 2;
          const normalized = (avgZ + 1) / 2;
          const edgeOpacity = 0.3 + normalized * 0.6;
          const color = getEdgeColor(pa.z, pb.z);
          return (
            <g key={i}>
              <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke={color} strokeWidth={1} opacity={edgeOpacity * 0.4} filter="url(#edgeBlur)" />
              <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke={color} strokeWidth={1.5} opacity={edgeOpacity} />
            </g>
          );
        })}

        {/* Vertices */}
        {sortedVertices.map(({ x, y, z, i }) => {
          const normalized = (z + 1) / 2;
          const vOpacity = 0.5 + normalized * 0.5;
          const vColor = `rgb(${Math.round(100 + normalized * 155)},${Math.round(200 + normalized * 55)},255)`;
          return (
            <g key={i}>
              {/* Outer glow */}
              <circle cx={x} cy={y} r={glowRadius} fill={vColor} opacity={0.12 * vOpacity} filter="url(#strongGlow)" />
              {/* Mid glow */}
              <circle cx={x} cy={y} r={vertexRadius * 1.4} fill={vColor} opacity={0.3 * vOpacity} filter="url(#vertexGlow)" />
              {/* Core */}
              <circle cx={x} cy={y} r={vertexRadius} fill={vColor} opacity={vOpacity} />
              {/* Bright center */}
              <circle cx={x} cy={y} r={vertexRadius * 0.4} fill="white" opacity={vOpacity * 0.9} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};