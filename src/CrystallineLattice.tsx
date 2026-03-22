import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface Node {
  x: number;
  y: number;
  z: number;
  id: number;
}

interface Edge {
  a: number;
  b: number;
}

const project = (x: number, y: number, z: number, cx: number, cy: number, fov: number) => {
  const scale = fov / (fov + z);
  return {
    px: cx + x * scale,
    py: cy + y * scale,
    scale,
  };
};

const generateLattice = (): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const size = 3;
  const spacing = 120;
  let id = 0;
  const grid: number[][][] = [];

  for (let ix = -size; ix <= size; ix++) {
    grid[ix + size] = [];
    for (let iy = -size; iy <= size; iy++) {
      grid[ix + size][iy + size] = [];
      for (let iz = -size; iz <= size; iz++) {
        nodes.push({ x: ix * spacing, y: iy * spacing, z: iz * spacing, id });
        grid[ix + size][iy + size][iz + size] = id;
        id++;
      }
    }
  }

  for (let ix = -size; ix <= size; ix++) {
    for (let iy = -size; iy <= size; iy++) {
      for (let iz = -size; iz <= size; iz++) {
        const current = grid[ix + size][iy + size][iz + size];
        if (ix < size) edges.push({ a: current, b: grid[ix + size + 1][iy + size][iz + size] });
        if (iy < size) edges.push({ a: current, b: grid[ix + size][iy + size + 1][iz + size] });
        if (iz < size) edges.push({ a: current, b: grid[ix + size][iy + size][iz + size + 1] });
      }
    }
  }

  return { nodes, edges };
};

const { nodes, edges } = generateLattice();

export const CrystallineLattice: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const rotX = frame * 0.007;
  const rotY = frame * 0.011;
  const rotZ = frame * 0.004;

  const pulse = Math.sin(frame * 0.04) * 0.5 + 0.5;

  const assembleProgress = interpolate(
    frame,
    [0, durationInFrames * 0.35, durationInFrames * 0.65, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const transformNode = (node: Node) => {
    let { x, y, z } = node;

    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    y = y1; z = z1;

    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const x1 = x * cosY + z * sinY;
    const z2 = -x * sinY + z * cosY;
    x = x1; z = z2;

    const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);
    const x2 = x * cosZ - y * sinZ;
    const y2 = x * sinZ + y * cosZ;
    x = x2; y = y2;

    return { x, y, z };
  };

  const cx = width / 2;
  const cy = height / 2;
  const fov = 900;

  const projectedNodes = nodes.map(node => {
    const { x, y, z } = transformNode(node);
    return project(x, y, z, cx, cy, fov);
  });

  const nodeVisibility = nodes.map(node => {
    const distFromCenter = Math.sqrt(node.x ** 2 + node.y ** 2 + node.z ** 2);
    const maxDist = Math.sqrt(3) * 3 * 120;
    const normDist = distFromCenter / maxDist;
    return interpolate(assembleProgress, [normDist * 0.6, Math.min(normDist * 0.6 + 0.3, 1)], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  });

  const sortedEdges = edges
    .map(edge => {
      const pa = projectedNodes[edge.a];
      const pb = projectedNodes[edge.b];
      const avgZ = (pa.scale + pb.scale) / 2;
      return { edge, avgZ };
    })
    .sort((a, b) => a.avgZ - b.avgZ);

  return (
    <div style={{ width, height, background: '#050810', overflow: 'hidden', opacity: globalOpacity, position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, #0a0f2a 0%, #050810 70%)',
      }} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowStrong">
            <feGaussianBlur stdDeviation="5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4af0ff" stopOpacity={0.15 * pulse} />
            <stop offset="100%" stopColor="#4af0ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx={cx} cy={cy} rx={400} ry={300} fill="url(#coreGlow)" />

        {sortedEdges.map(({ edge, avgZ }, i) => {
          const pa = projectedNodes[edge.a];
          const pb = projectedNodes[edge.b];
          const visA = nodeVisibility[edge.a];
          const visB = nodeVisibility[edge.b];
          const vis = Math.min(visA, visB);
          if (vis <= 0.01) return null;

          const depthFade = interpolate(avgZ, [0.2, 1.2], [0.15, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          const hue = interpolate(avgZ, [0.2, 1.2], [200, 280], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const lightness = interpolate(avgZ, [0.2, 1.2], [50, 90], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <line
              key={i}
              x1={pa.px} y1={pa.py}
              x2={pb.px} y2={pb.py}
              stroke={`hsl(${hue}, 90%, ${lightness}%)`}
              strokeWidth={avgZ * 1.2}
              strokeOpacity={vis * depthFade * (0.5 + pulse * 0.2)}
              filter="url(#glow)"
            />
          );
        })}

        {nodes.map((node, i) => {
          const proj = projectedNodes[i];
          const vis = nodeVisibility[i];
          if (vis <= 0.01) return null;

          const size = proj.scale * 5;
          const depthFade = interpolate(proj.scale, [0.2, 1.2], [0.2, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const hue = interpolate(proj.scale, [0.2, 1.2], [180, 300], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          const distFromCenter = Math.sqrt(node.x ** 2 + node.y ** 2 + node.z ** 2);
          const isCentral = distFromCenter < 50;

          return (
            <g key={i} filter={isCentral ? 'url(#glowStrong)' : 'url(#glow)'}>
              <circle
                cx={proj.px}
                cy={proj.py}
                r={size * 1.8}
                fill={`hsl(${hue}, 100%, 75%)`}
                opacity={vis * depthFade * 0.15}
              />
              <circle
                cx={proj.px}
                cy={proj.py}
                r={size * 0.6}
                fill={`hsl(${hue}, 100%, 90%)`}
                opacity={vis * depthFade * (0.7 + pulse * 0.3)}
              />
            </g>
          );
        })}

        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2 + frame * 0.005;
          const r = 350 + Math.sin(frame * 0.02 + i) * 30;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          const size = 3 + Math.sin(frame * 0.03 + i * 1.2) * 1.5;
          return (
            <circle
              key={`orbit-${i}`}
              cx={x} cy={y} r={size}
              fill={`hsl(${180 + i * 20}, 100%, 80%)`}
              opacity={0.6 * assembleProgress}
              filter="url(#glowStrong)"
            />
          );
        })}
      </svg>
    </div>
  );
};