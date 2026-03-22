import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const TorusKnotNeon: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const t = frame / durationInFrames;
  const rotationY = t * Math.PI * 4;
  const rotationX = t * Math.PI * 2.5;
  const rotationZ = t * Math.PI * 1.3;

  const cx = width / 2;
  const cy = height / 2;

  // Torus knot parametric: p=2, q=3
  const p = 2;
  const q = 3;
  const R = 200;
  const r = 80;
  const tubeRadius = 6;

  const numPoints = 300;
  const numStrands = 5;

  const project = (x: number, y: number, z: number) => {
    // Rotate around Y
    let x1 = x * Math.cos(rotationY) + z * Math.sin(rotationY);
    let y1 = y;
    let z1 = -x * Math.sin(rotationY) + z * Math.cos(rotationY);

    // Rotate around X
    let x2 = x1;
    let y2 = y1 * Math.cos(rotationX) - z1 * Math.sin(rotationX);
    let z2 = y1 * Math.sin(rotationX) + z1 * Math.cos(rotationX);

    // Rotate around Z
    let x3 = x2 * Math.cos(rotationZ) - y2 * Math.sin(rotationZ);
    let y3 = x2 * Math.sin(rotationZ) + y2 * Math.cos(rotationZ);
    let z3 = z2;

    const fov = 900;
    const depth = fov + z3;
    const scale = fov / depth;
    return { sx: cx + x3 * scale, sy: cy + y3 * scale, scale, depth: z3 };
  };

  const neonColors = [
    '#ff00ff',
    '#00ffff',
    '#ff6600',
    '#00ff88',
    '#8844ff',
  ];

  const glowColors = [
    'rgba(255,0,255,0.3)',
    'rgba(0,255,255,0.3)',
    'rgba(255,102,0,0.3)',
    'rgba(0,255,136,0.3)',
    'rgba(136,68,255,0.3)',
  ];

  const renderStrands = () => {
    const strands: React.ReactElement[] = [];

    for (let s = 0; s < numStrands; s++) {
      const phaseOffset = (s / numStrands) * Math.PI * 2;
      const colorMain = neonColors[s % neonColors.length];
      const colorGlow = glowColors[s % glowColors.length];

      const points: { sx: number; sy: number; scale: number; depth: number }[] = [];

      for (let i = 0; i <= numPoints; i++) {
        const theta = (i / numPoints) * Math.PI * 2;
        const phi = (q / p) * theta + phaseOffset;

        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        const cosPhi = Math.cos(phi);
        const sinPhi = Math.sin(phi);

        const x = (R + r * cosPhi) * cosTheta;
        const y = (R + r * cosPhi) * sinTheta;
        const z = r * sinPhi;

        points.push(project(x, y, z));
      }

      // Build path string
      let pathD = '';
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        if (i === 0) {
          pathD += `M ${pt.sx.toFixed(2)} ${pt.sy.toFixed(2)}`;
        } else {
          pathD += ` L ${pt.sx.toFixed(2)} ${pt.sy.toFixed(2)}`;
        }
      }

      // Glow layer (thick, blurred)
      strands.push(
        <path
          key={`glow-${s}`}
          d={pathD}
          stroke={colorGlow}
          strokeWidth={tubeRadius * 4}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'blur(8px)' }}
        />
      );

      // Core layer
      strands.push(
        <path
          key={`core-${s}`}
          d={pathD}
          stroke={colorMain}
          strokeWidth={tubeRadius * 0.8}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.95}
        />
      );

      // Inner bright highlight
      strands.push(
        <path
          key={`highlight-${s}`}
          d={pathD}
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={tubeRadius * 0.25}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    }

    return strands;
  };

  // Animated particles along knot
  const renderParticles = () => {
    const particles: React.ReactElement[] = [];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      const offset = (i / particleCount);
      const theta = ((offset + t * 1.5) % 1) * Math.PI * 2;
      const phi = (q / p) * theta;

      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);

      const x = (R + r * cosPhi) * cosTheta;
      const y = (R + r * cosPhi) * sinTheta;
      const z = r * sinPhi;

      const proj = project(x, y, z);
      const depthFactor = interpolate(proj.depth, [-300, 300], [0.4, 1.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      const color = neonColors[i % neonColors.length];
      const size = 4 * proj.scale * depthFactor;

      particles.push(
        <circle
          key={`particle-${i}`}
          cx={proj.sx}
          cy={proj.sy}
          r={size}
          fill={color}
          opacity={0.9}
          style={{ filter: `blur(${1.5 * depthFactor}px)` }}
        />
      );
    }

    return particles;
  };

  // Background stars
  const stars = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < 200; i++) {
      arr.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        r: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.6 + 0.2,
      });
    }
    return arr;
  }, []);

  return (
    <div
      style={{
        width,
        height,
        background: '#04020a',
        overflow: 'hidden',
        position: 'relative',
        opacity,
      }}
    >
      {/* Stars */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {stars.map((star, i) => {
          const twinkle = 0.5 + 0.5 * Math.sin(frame * 0.05 + i * 0.3);
          return (
            <circle
              key={i}
              cx={star.x}
              cy={star.y}
              r={star.r}
              fill="white"
              opacity={star.opacity * twinkle}
            />
          );
        })}
      </svg>

      {/* Ambient glow in center */}
      <div
        style={{
          position: 'absolute',
          left: cx - 300,
          top: cy - 300,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(80,0,120,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main torus knot */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#glow)">
          {renderStrands()}
        </g>
        {renderParticles()}
      </svg>
    </div>
  );
};