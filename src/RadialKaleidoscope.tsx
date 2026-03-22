import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const RadialKaleidoscope: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const cx = width / 2;
  const cy = height / 2;
  const numSegments = 12;
  const numLayers = 6;
  const angleStep = (Math.PI * 2) / numSegments;

  const globalRotation = (frame / durationInFrames) * Math.PI * 4;
  const pulseScale = 1 + 0.08 * Math.sin(frame * 0.05);

  const layers = Array.from({ length: numLayers }, (_, li) => {
    const layerProgress = li / numLayers;
    const baseRadius = (height * 0.52 * (li + 1)) / numLayers;
    const innerRadius = (height * 0.52 * li) / numLayers;
    const layerRotation = globalRotation * (li % 2 === 0 ? 1 : -1) * (1 + layerProgress * 0.5);
    const phaseShift = (frame * 0.03) + li * 0.8;

    return Array.from({ length: numSegments }, (_, si) => {
      const angle = si * angleStep + layerRotation;
      const nextAngle = angle + angleStep;
      const midAngle = angle + angleStep / 2;

      const hue1 = ((frame * 1.2 + li * 55 + si * 22) % 360);
      const hue2 = ((frame * 1.2 + li * 55 + si * 22 + 60) % 360);
      const saturation = 85 + 15 * Math.sin(phaseShift + si * 0.5);
      const lightness1 = 45 + 20 * Math.sin(phaseShift + li * 1.1);
      const lightness2 = 55 + 15 * Math.cos(phaseShift + si * 0.7);

      const r = baseRadius * pulseScale * (1 + 0.05 * Math.sin(phaseShift + si * 0.9));
      const ri = innerRadius * pulseScale * (1 + 0.04 * Math.cos(phaseShift + si * 1.1));

      const x1o = cx + Math.cos(angle) * r;
      const y1o = cy + Math.sin(angle) * r;
      const x2o = cx + Math.cos(nextAngle) * r;
      const y2o = cy + Math.sin(nextAngle) * r;
      const xMidO = cx + Math.cos(midAngle) * r * 1.12;
      const yMidO = cy + Math.sin(midAngle) * r * 1.12;

      const x1i = cx + Math.cos(angle) * ri;
      const y1i = cy + Math.sin(angle) * ri;
      const x2i = cx + Math.cos(nextAngle) * ri;
      const y2i = cy + Math.sin(nextAngle) * ri;

      const gradId = `grad_${li}_${si}`;
      const petalGradId = `petal_${li}_${si}`;

      return { x1o, y1o, x2o, y2o, xMidO, yMidO, x1i, y1i, x2i, y2i, hue1, hue2, saturation, lightness1, lightness2, gradId, petalGradId, angle, midAngle, r, ri };
    });
  });

  return (
    <div style={{ width, height, background: '#050508', overflow: 'hidden', opacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {layers.map((layer, li) =>
            layer.map((seg, si) => (
              <React.Fragment key={`defs_${li}_${si}`}>
                <radialGradient id={seg.gradId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor={`hsl(${seg.hue1},${seg.saturation}%,${seg.lightness1}%)`} stopOpacity="0.95" />
                  <stop offset="100%" stopColor={`hsl(${seg.hue2},${seg.saturation}%,${seg.lightness2}%)`} stopOpacity="0.6" />
                </radialGradient>
                <linearGradient id={seg.petalGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={`hsl(${(seg.hue1 + 30) % 360},${seg.saturation}%,${seg.lightness1 + 10}%)`} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={`hsl(${(seg.hue2 + 60) % 360},${seg.saturation}%,${seg.lightness2}%)`} stopOpacity="0.5" />
                </linearGradient>
              </React.Fragment>
            ))
          )}
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softglow">
            <feGaussianBlur stdDeviation="18" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dark radial base */}
        <circle cx={cx} cy={cy} r={height * 0.55} fill="radial-gradient" opacity={0.4} />

        {layers.map((layer, li) =>
          layer.map((seg, si) => (
            <g key={`seg_${li}_${si}`} filter={li > 3 ? 'url(#glow)' : undefined}>
              <path
                d={`M ${seg.x1i} ${seg.y1i} L ${seg.x1o} ${seg.y1o} Q ${seg.xMidO} ${seg.yMidO} ${seg.x2o} ${seg.y2o} L ${seg.x2i} ${seg.y2i} Z`}
                fill={`url(#${seg.gradId})`}
                stroke={`hsl(${seg.hue1},${seg.saturation}%,${seg.lightness1 + 20}%)`}
                strokeWidth={0.5}
                opacity={0.82}
              />
            </g>
          ))
        )}

        {/* Center mandala petals */}
        {Array.from({ length: 16 }, (_, i) => {
          const angle = (i / 16) * Math.PI * 2 + globalRotation * 1.5;
          const innerR = 28 + 10 * Math.sin(frame * 0.07 + i);
          const outerR = 90 + 30 * Math.cos(frame * 0.05 + i * 0.4);
          const x1 = cx + Math.cos(angle) * innerR;
          const y1 = cy + Math.sin(angle) * innerR;
          const x2 = cx + Math.cos(angle) * outerR;
          const y2 = cy + Math.sin(angle) * outerR;
          const cpx = cx + Math.cos(angle + Math.PI / 16) * outerR * 1.2;
          const cpy = cy + Math.sin(angle + Math.PI / 16) * outerR * 1.2;
          const hue = (frame * 2 + i * 22.5) % 360;
          return (
            <path
              key={`petal_${i}`}
              d={`M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`}
              stroke={`hsl(${hue},100%,70%)`}
              strokeWidth={2.5}
              fill="none"
              opacity={0.7}
              filter="url(#glow)"
            />
          );
        })}

        {/* Center core glow */}
        <circle cx={cx} cy={cy} r={55 + 12 * Math.sin(frame * 0.08)} fill={`hsl(${(frame * 2) % 360},100%,70%)`} opacity={0.18} filter="url(#softglow)" />
        <circle cx={cx} cy={cy} r={28 + 6 * Math.sin(frame * 0.1)} fill={`hsl(${(frame * 3 + 60) % 360},100%,80%)`} opacity={0.55} filter="url(#glow)" />
        <circle cx={cx} cy={cy} r={10} fill="white" opacity={0.9} />

        {/* Outer ring accent */}
        {Array.from({ length: 24 }, (_, i) => {
          const angle = (i / 24) * Math.PI * 2 - globalRotation * 0.7;
          const r = height * 0.485;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          const hue = (frame * 1.5 + i * 15) % 360;
          const size = 4 + 3 * Math.abs(Math.sin(frame * 0.06 + i * 0.5));
          return (
            <circle
              key={`dot_${i}`}
              cx={x}
              cy={y}
              r={size}
              fill={`hsl(${hue},100%,75%)`}
              opacity={0.75}
              filter="url(#glow)"
            />
          );
        })}
      </svg>
    </div>
  );
};