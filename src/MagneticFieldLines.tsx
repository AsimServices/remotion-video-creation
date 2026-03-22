import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const MagneticFieldLines: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const cx = width / 2;
  const cy = height / 2;
  const sphereRadius = 140;

  const t = frame / durationInFrames;
  const rotation = frame * 0.4;

  const numFieldLines = 32;
  const numParticles = 80;

  // Generate magnetic field line paths bending around the sphere
  const generateFieldLinePath = (lineIndex: number, totalLines: number) => {
    const angle = (lineIndex / totalLines) * Math.PI * 2;
    const startRadius = 520;
    const points: Array<[number, number]> = [];
    const steps = 80;

    for (let s = 0; s <= steps; s++) {
      const frac = s / steps;
      // Parametric starting position on a far circle
      const startX = cx + Math.cos(angle) * startRadius;
      const startY = cy + Math.sin(angle) * (startRadius * 0.6);

      // End on opposite side
      const endX = cx + Math.cos(angle + Math.PI) * startRadius;
      const endY = cy + Math.sin(angle + Math.PI) * (startRadius * 0.6);

      // Interpolate position
      const rawX = startX + (endX - startX) * frac;
      const rawY = startY + (endY - startY) * frac;

      // Compute distance from center
      const dx = rawX - cx;
      const dy = rawY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Bend field lines around sphere
      const influence = Math.max(0, 1 - dist / (sphereRadius * 3.5));
      const bendStrength = influence * influence * sphereRadius * 2.2;

      // Perpendicular to radial direction
      const perpX = -dy / (dist + 0.001);
      const perpY = dx / (dist + 0.001);

      // Animated oscillation
      const wave = Math.sin(frac * Math.PI * 2 + t * Math.PI * 4 + lineIndex * 0.3) * 8;

      const finalX = rawX + perpX * bendStrength + wave * perpX;
      const finalY = rawY + perpY * bendStrength + wave * perpY;

      // Push outside sphere if needed
      const fdx = finalX - cx;
      const fdy = finalY - cy;
      const fdist = Math.sqrt(fdx * fdx + fdy * fdy);
      if (fdist < sphereRadius + 4) {
        const scale = (sphereRadius + 4) / (fdist + 0.001);
        points.push([cx + fdx * scale, cy + fdy * scale]);
      } else {
        points.push([finalX, finalY]);
      }
    }

    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length - 2; i++) {
      const mx = (points[i][0] + points[i + 1][0]) / 2;
      const my = (points[i][1] + points[i + 1][1]) / 2;
      d += ` Q ${points[i][0]} ${points[i][1]} ${mx} ${my}`;
    }
    return d;
  };

  // Particle positions flowing along field lines
  const particles = Array.from({ length: numParticles }, (_, i) => {
    const lineIdx = i % numFieldLines;
    const offset = (i / numParticles + t * 1.2) % 1;
    const angle = (lineIdx / numFieldLines) * Math.PI * 2;
    const startRadius = 520;
    const frac = offset;

    const startX = cx + Math.cos(angle) * startRadius;
    const startY = cy + Math.sin(angle) * (startRadius * 0.6);
    const endX = cx + Math.cos(angle + Math.PI) * startRadius;
    const endY = cy + Math.sin(angle + Math.PI) * (startRadius * 0.6);

    const rawX = startX + (endX - startX) * frac;
    const rawY = startY + (endY - startY) * frac;

    const dx = rawX - cx;
    const dy = rawY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const influence = Math.max(0, 1 - dist / (sphereRadius * 3.5));
    const bendStrength = influence * influence * sphereRadius * 2.2;
    const perpX = -dy / (dist + 0.001);
    const perpY = dx / (dist + 0.001);
    const wave = Math.sin(frac * Math.PI * 2 + t * Math.PI * 4 + lineIdx * 0.3) * 8;

    let finalX = rawX + perpX * bendStrength + wave * perpX;
    let finalY = rawY + perpY * bendStrength + wave * perpY;

    const fdx = finalX - cx;
    const fdy = finalY - cy;
    const fdist = Math.sqrt(fdx * fdx + fdy * fdy);
    if (fdist < sphereRadius + 4) {
      const scale = (sphereRadius + 4) / (fdist + 0.001);
      finalX = cx + fdx * scale;
      finalY = cy + fdy * scale;
    }

    const edgeOpacity = interpolate(frac, [0, 0.1, 0.9, 1], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    return { x: finalX, y: finalY, opacity: edgeOpacity, size: 2.5 + (i % 3) };
  });

  // Aurora/glow rings
  const glowRings = Array.from({ length: 6 }, (_, i) => {
    const phase = (i / 6) * Math.PI * 2;
    const pulseScale = 1 + 0.08 * Math.sin(t * Math.PI * 4 + phase);
    const r = (sphereRadius + 30 + i * 28) * pulseScale;
    const alpha = interpolate(i, [0, 5], [0.18, 0.04]);
    return { r, alpha };
  });

  // Color palette cycling
  const hue1 = (t * 360 * 0.5) % 360;
  const hue2 = (hue1 + 160) % 360;
  const hue3 = (hue1 + 220) % 360;

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 50% 50%, #0a0a1a 0%, #020208 100%)',
        overflow: 'hidden',
        opacity: globalOpacity,
        position: 'relative',
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <radialGradient id="sphereGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`hsla(${hue1}, 80%, 70%, 0.15)`} />
            <stop offset="60%" stopColor={`hsla(${hue2}, 90%, 50%, 0.08)`} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`hsla(${hue3}, 60%, 15%, 0.3)`} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="blur1" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="blur2" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="outerClip">
            <rect x={0} y={0} width={width} height={height} />
          </clipPath>
        </defs>

        {/* Background glow */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={width * 0.5}
          ry={height * 0.5}
          fill="url(#bgGlow)"
        />

        {/* Glow rings around sphere */}
        {glowRings.map((ring, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={ring.r}
            fill="none"
            stroke={`hsla(${hue2}, 90%, 65%, ${ring.alpha})`}
            strokeWidth={3}
            filter="url(#blur1)"
          />
        ))}

        {/* Outer ambient field glow */}
        <circle
          cx={cx}
          cy={cy}
          r={sphereRadius * 3}
          fill="url(#sphereGlow)"
          filter="url(#blur2)"
        />

        {/* Field lines - blur layer */}
        <g filter="url(#blur1)" clipPath="url(#outerClip)">
          {Array.from({ length: numFieldLines }, (_, i) => {
            const progress = (i / numFieldLines + t * 0.15) % 1;
            const h = (hue1 + (i / numFieldLines) * 120) % 360;
            return (
              <path
                key={i}
                d={generateFieldLinePath(i, numFieldLines)}
                fill="none"
                stroke={`hsla(${h}, 90%, 65%, 0.25)`}
                strokeWidth={1.5}
              />
            );
          })}
        </g>

        {/* Field lines - sharp layer */}
        <g filter="url(#glow)" clipPath="url(#outerClip)">
          {Array.from({ length: numFieldLines }, (_, i) => {
            const h = (hue1 + (i / numFieldLines) * 120) % 360;
            const dashOffset = -(frame * 2 + i * 20);
            return (
              <path
                key={i}
                d={generateFieldLinePath(i, numFieldLines)}
                fill="none"
                stroke={`hsla(${h}, 95%, 75%, 0.6)`}
                strokeWidth={0.8}
                strokeDasharray="12 6"
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </g>

        {/* Flowing particles */}
        {particles.map((p, i) => {
          const h = (hue1 + (i / numParticles) * 180) % 360;
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={p.size}
              fill={`hsla(${h}, 100%, 80%, ${p.opacity})`}
              filter="url(#blur1)"
            />
          );
        })}

        {/* Invisible dark sphere - subtle rim */}
        <circle
          cx={cx}
          cy={cy}
          r={sphereRadius}
          fill="radial-gradient(circle, #050510 0%, #000000 100%)"
          style={{ fill: '#03030c' }}
        />
        <circle
          cx={cx}
          cy={cy}
          r={sphereRadius}
          fill="none"
          stroke={`hsla(${hue1}, 70%, 50%, 0.15)`}
          strokeWidth={2}
          filter="url(#blur1)"
        />

        {/* Sphere inner dark void */}
        <circle
          cx={cx}
          cy={cy}
          r={sphereRadius - 2}
          fill="#020208"
        />

        {/* Rotating pole markers */}
        {[0, 1].map((pole) => {
          const poleAngle = (rotation * Math.PI) / 180 + pole * Math.PI;
          const poleX = cx + Math.cos(poleAngle) * (sphereRadius - 12);
          const poleY = cy + Math.sin(poleAngle) * (sphereRadius - 12) * 0.4;
          const pulseR = 5 + 2 * Math.sin(t * Math.PI * 8 + pole * Math.PI);
          return (
            <circle
              key={pole}
              cx={poleX}
              cy={poleY}
              r={pulseR}
              fill={`hsla(${pole === 0 ? hue1 : hue2}, 100%, 75%, 0.85)`}
              filter="url(#glow)"
            />
          );
        })}

        {/* Equatorial ring */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={sphereRadius + 8}
          ry={12}
          fill="none"
          stroke={`hsla(${hue3}, 80%, 60%, 0.3)`}
          strokeWidth={1.5}
          transform={`rotate(${rotation * 0.3} ${cx} ${cy})`}
          filter="url(#blur1)"
        />
      </svg>
    </div>
  );
};