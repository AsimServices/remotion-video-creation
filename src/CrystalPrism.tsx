import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const CrystalPrism: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const rotation = interpolate(frame, [0, durationInFrames], [0, 360]);
  const pulse = Math.sin(frame * 0.05) * 0.5 + 0.5;
  const slowWave = Math.sin(frame * 0.02);

  const cx = width / 2;
  const cy = height / 2;

  const prismSize = 180;
  const angle = (rotation * Math.PI) / 180;

  const topX = cx + Math.cos(angle + Math.PI / 2) * prismSize * 0.6;
  const topY = cy + Math.sin(angle + Math.PI / 2) * prismSize * 0.6;
  const leftX = cx + Math.cos(angle + Math.PI / 2 + (2 * Math.PI) / 3) * prismSize;
  const leftY = cy + Math.sin(angle + Math.PI / 2 + (2 * Math.PI) / 3) * prismSize;
  const rightX = cx + Math.cos(angle + Math.PI / 2 - (2 * Math.PI) / 3) * prismSize;
  const rightY = cy + Math.sin(angle + Math.PI / 2 - (2 * Math.PI) / 3) * prismSize;

  const rainbowColors = [
    { color: '#ff0000', offset: 0 },
    { color: '#ff6600', offset: 0.15 },
    { color: '#ffff00', offset: 0.30 },
    { color: '#00ff00', offset: 0.45 },
    { color: '#00ffff', offset: 0.60 },
    { color: '#0066ff', offset: 0.75 },
    { color: '#9900ff', offset: 0.90 },
    { color: '#ff00ff', offset: 1.0 },
  ];

  const numBands = 24;
  const bands = Array.from({ length: numBands }, (_, i) => {
    const t = i / numBands;
    const bandAngle = angle + Math.PI * 0.3 + t * Math.PI * 1.2;
    const length = 600 + Math.sin(frame * 0.03 + t * 2) * 80;
    const bandWidth = 8 + Math.sin(frame * 0.04 + t * 1.5) * 3;
    const hue = (t * 360 + frame * 0.8) % 360;
    const alpha = (0.3 + Math.sin(frame * 0.06 + t * 3) * 0.2) * pulse * 0.8;
    const startX = cx + Math.cos(angle + Math.PI / 2 - (2 * Math.PI) / 3) * prismSize * 0.8;
    const startY = cy + Math.sin(angle + Math.PI / 2 - (2 * Math.PI) / 3) * prismSize * 0.8;
    const endX = startX + Math.cos(bandAngle) * length;
    const endY = startY + Math.sin(bandAngle) * length;
    return { startX, startY, endX, endY, bandWidth, hue, alpha };
  });

  const incidentBands = Array.from({ length: 8 }, (_, i) => {
    const t = i / 8;
    const srcX = cx - 700 + Math.sin(frame * 0.02) * 20;
    const srcY = cy - 80 + t * 160;
    const refX = (topX + rightX) / 2;
    const refY = (topY + rightY) / 2;
    const alpha = 0.15 + t * 0.05;
    return { srcX, srcY, refX, refY, alpha };
  });

  const particles = Array.from({ length: 60 }, (_, i) => {
    const seed = i * 137.508;
    const orbitRadius = 250 + (i % 5) * 60;
    const orbitSpeed = 0.01 + (i % 4) * 0.005;
    const orbitAngle = seed + frame * orbitSpeed;
    const px = cx + Math.cos(orbitAngle) * orbitRadius * (0.5 + Math.sin(seed) * 0.5);
    const py = cy + Math.sin(orbitAngle) * orbitRadius * 0.4;
    const size = 1 + (i % 4);
    const hue = (seed + frame * 0.5) % 360;
    const brightness = 0.4 + Math.sin(frame * 0.08 + seed) * 0.3;
    return { px, py, size, hue, brightness };
  });

  const glowRings = Array.from({ length: 5 }, (_, i) => {
    const ringRadius = 100 + i * 60 + slowWave * 20;
    const ringOpacity = (0.15 - i * 0.02) * pulse;
    const hue = (i * 60 + frame * 0.5) % 360;
    return { ringRadius, ringOpacity, hue };
  });

  return (
    <div style={{ width, height, background: '#030308', opacity, overflow: 'hidden', position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {rainbowColors.map((rc, i) => (
            <radialGradient key={`rg${i}`} id={`rglow${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={rc.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={rc.color} stopOpacity="0" />
            </radialGradient>
          ))}
          <radialGradient id="prismGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#aaddff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0033aa" stopOpacity="0.2" />
          </radialGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.3 * pulse} />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="face1" x1={`${topX}`} y1={`${topY}`} x2={`${rightX}`} y2={`${rightY}`} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#88ccff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0044ff" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="face2" x1={`${topX}`} y1={`${topY}`} x2={`${leftX}`} y2={`${leftY}`} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#ccffee" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00aaff" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="face3" x1={`${leftX}`} y1={`${leftY}`} x2={`${rightX}`} y2={`${rightY}`} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#001133" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#002266" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#003388" stopOpacity="0.4" />
          </linearGradient>
          <filter id="blur1">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background deep glow */}
        <ellipse cx={cx} cy={cy} rx={500} ry={350} fill="url(#centerGlow)" />

        {/* Glow rings */}
        {glowRings.map((ring, i) => (
          <circle
            key={`ring${i}`}
            cx={cx}
            cy={cy}
            r={ring.ringRadius}
            fill="none"
            stroke={`hsla(${ring.hue}, 100%, 70%, ${ring.ringOpacity})`}
            strokeWidth="2"
            filter="url(#blur1)"
          />
        ))}

        {/* Incident light beam */}
        {incidentBands.map((band, i) => (
          <line
            key={`inc${i}`}
            x1={band.srcX}
            y1={band.srcY}
            x2={band.refX}
            y2={band.refY}
            stroke={`rgba(200,220,255,${band.alpha})`}
            strokeWidth="3"
            filter="url(#blur2)"
          />
        ))}

        {/* Rainbow light bands (refracted) - blurred background */}
        {bands.map((band, i) => (
          <line
            key={`bandbg${i}`}
            x1={band.startX}
            y1={band.startY}
            x2={band.endX}
            y2={band.endY}
            stroke={`hsla(${band.hue}, 100%, 65%, ${band.alpha * 0.5})`}
            strokeWidth={band.bandWidth * 3}
            filter="url(#blur1)"
          />
        ))}

        {/* Rainbow light bands (sharp) */}
        {bands.map((band, i) => (
          <line
            key={`band${i}`}
            x1={band.startX}
            y1={band.startY}
            x2={band.endX}
            y2={band.endY}
            stroke={`hsla(${band.hue}, 100%, 75%, ${band.alpha})`}
            strokeWidth={band.bandWidth}
          />
        ))}

        {/* Prism faces - back (bottom base) */}
        <polygon
          points={`${leftX},${leftY} ${rightX},${rightY} ${topX},${topY}`}
          fill="url(#face3)"
          stroke="rgba(0,100,200,0.3)"
          strokeWidth="1"
        />

        {/* Prism face 1 (right) */}
        <polygon
          points={`${topX},${topY} ${rightX},${rightY} ${cx},${cy}`}
          fill="url(#face1)"
          stroke="rgba(100,200,255,0.6)"
          strokeWidth="1.5"
          filter="url(#glow)"
        />

        {/* Prism face 2 (left) */}
        <polygon
          points={`${topX},${topY} ${leftX},${leftY} ${cx},${cy}`}
          fill="url(#face2)"
          stroke="rgba(150,220,255,0.5)"
          strokeWidth="1.5"
        />

        {/* Prism face 3 (bottom) */}
        <polygon
          points={`${leftX},${leftY} ${rightX},${rightY} ${cx},${cy}`}
          fill="rgba(0,20,60,0.5)"
          stroke="rgba(50,150,255,0.4)"
          strokeWidth="1"
        />

        {/* Inner refraction shimmer */}
        {Array.from({ length: 6 }, (_, i) => {
          const t = i / 6;
          const shimmerHue = (t * 360 + frame * 2) % 360;
          const shimmerAlpha = 0.15 + Math.sin(frame * 0.07 + i) * 0.08;
          const midX = (topX + leftX + rightX) / 3;
          const midY = (topY + leftY + rightY) / 3;
          const edgeX = topX + (leftX - topX) * t;
          const edgeY = topY + (leftY - topY) * t;
          return (
            <line
              key={`shim${i}`}
              x1={midX}
              y1={midY}
              x2={edgeX}
              y2={edgeY}
              stroke={`hsla(${shimmerHue}, 100%, 80%, ${shimmerAlpha})`}
              strokeWidth="2"
            />
          );
        })}

        {/* Prism edge highlight */}
        <line
          x1={topX} y1={topY} x2={leftX} y2={leftY}
          stroke={`rgba(200,230,255,${0.6 + pulse * 0.3})`}
          strokeWidth="2.5"
          filter="url(#glow)"
        />
        <line
          x1={topX} y1={topY} x2={rightX} y2={rightY}
          stroke={`rgba(150,200,255,${0.5 + pulse * 0.3})`}
          strokeWidth="2.5"
          filter="url(#glow)"
        />
        <line
          x1={leftX} y1={leftY} x2={rightX} y2={rightY}
          stroke={`rgba(100,180,255,${0.3 + pulse * 0.2})`}
          strokeWidth="2"
        />

        {/* Floating particles */}
        {particles.map((p, i) => (
          <circle
            key={`p${i}`}
            cx={p.px}
            cy={p.py}
            r={p.size}
            fill={`hsla(${p.hue}, 100%, 80%, ${p.brightness})`}
            filter="url(#blur2)"
          />
        ))}

        {/* Apex glow */}
        <circle
          cx={topX}
          cy={topY}
          r={20 + pulse * 10}
          fill={`rgba(255,255,255,${0.1 + pulse * 0.15})`}
          filter="url(#blur1)"
        />
        <circle
          cx={topX}
          cy={topY}
          r={6}
          fill={`rgba(255,255,255,${0.7 + pulse * 0.3})`}
          filter="url(#glow)"
        />

        {/* Corner sparkles */}
        {[{ x: leftX, y: leftY }, { x: rightX, y: rightY }].map((pt, i) => (
          <circle
            key={`spark${i}`}
            cx={pt.x}
            cy={pt.y}
            r={4 + Math.sin(frame * 0.1 + i * 2) * 2}
            fill={`rgba(180,220,255,${0.5 + pulse * 0.3})`}
            filter="url(#glow)"
          />
        ))}

        {/* Ambient light scatter */}
        {Array.from({ length: 12 }, (_, i) => {
          const scatterAngle = (i / 12) * Math.PI * 2 + frame * 0.01;
          const scatterR = 300 + Math.sin(frame * 0.03 + i) * 50;
          const sx = cx + Math.cos(scatterAngle) * scatterR;
          const sy = cy + Math.sin(scatterAngle) * scatterR;
          const hue = (i * 30 + frame * 0.3) % 360;
          return (
            <circle
              key={`sc${i}`}
              cx={sx}
              cy={sy}
              r={3}
              fill={`hsla(${hue}, 100%, 70%, 0.2)`}
              filter="url(#blur2)"
            />
          );
        })}
      </svg>
    </div>
  );
};