import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const WeavingLines: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const numLines = 18;
  const numCrossLines = 14;

  const generatePath = (
    index: number,
    totalLines: number,
    t: number,
    isVertical: boolean
  ): string => {
    const segments = 8;
    const points: [number, number][] = [];
    const basePos = (index / (totalLines - 1)) * (isVertical ? height : width);
    const amplitude = isVertical ? width * 0.04 : height * 0.04;
    const phaseOffset = (index * Math.PI * 2.3) / totalLines;
    const speedFactor = 0.4 + (index % 5) * 0.15;

    for (let s = 0; s <= segments; s++) {
      const progress = s / segments;
      const wave1 = Math.sin(progress * Math.PI * 3 + t * speedFactor + phaseOffset) * amplitude;
      const wave2 = Math.sin(progress * Math.PI * 5.7 + t * speedFactor * 0.7 + phaseOffset * 1.3) * amplitude * 0.5;
      const wave3 = Math.cos(progress * Math.PI * 2.1 + t * speedFactor * 1.2 + phaseOffset * 0.8) * amplitude * 0.3;
      const offset = wave1 + wave2 + wave3;

      if (isVertical) {
        const x = basePos + offset;
        const y = progress * height;
        points.push([x, y]);
      } else {
        const y = basePos + offset;
        const x = progress * width;
        points.push([x, y]);
      }
    }

    let d = `M ${points[0][0]},${points[0][1]}`;
    for (let i = 1; i < points.length - 1; i++) {
      const cx = (points[i][0] + points[i + 1][0]) / 2;
      const cy = (points[i][1] + points[i + 1][1]) / 2;
      d += ` Q ${points[i][0]},${points[i][1]} ${cx},${cy}`;
    }
    const last = points[points.length - 1];
    d += ` L ${last[0]},${last[1]}`;
    return d;
  };

  const t = (frame / durationInFrames) * Math.PI * 6;

  const getLineOpacity = (index: number, total: number, isVertical: boolean): number => {
    const base = 0.12 + (index % 4) * 0.06;
    const pulse = Math.sin(t * 0.8 + (index * Math.PI * 1.7) / total) * 0.06;
    const extraPulse = Math.sin(t * 1.3 + (index * Math.PI * 0.9) / total + (isVertical ? 1 : 2)) * 0.04;
    return Math.max(0.05, Math.min(0.55, base + pulse + extraPulse));
  };

  const getLineWidth = (index: number): number => {
    return index % 3 === 0 ? 0.8 : index % 3 === 1 ? 0.5 : 0.3;
  };

  return (
    <div style={{ width, height, background: '#000000', overflow: 'hidden', opacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softglow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {Array.from({ length: numLines }, (_, i) => (
          <path
            key={`v-${i}`}
            d={generatePath(i, numLines, t, true)}
            stroke="white"
            strokeWidth={getLineWidth(i)}
            fill="none"
            opacity={getLineOpacity(i, numLines, true)}
            filter={i % 5 === 0 ? 'url(#glow)' : undefined}
          />
        ))}

        {Array.from({ length: numCrossLines }, (_, i) => (
          <path
            key={`h-${i}`}
            d={generatePath(i, numCrossLines, t + Math.PI * 0.5, false)}
            stroke="white"
            strokeWidth={getLineWidth(i + 1)}
            fill="none"
            opacity={getLineOpacity(i, numCrossLines, false)}
            filter={i % 4 === 0 ? 'url(#softglow)' : undefined}
          />
        ))}

        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i / 6) * Math.PI * 2 + t * 0.15;
          const radiusX = width * 0.45;
          const radiusY = height * 0.45;
          const cx = width / 2;
          const cy = height / 2;
          const x1 = cx + Math.cos(angle) * radiusX * 0.1;
          const y1 = cy + Math.sin(angle) * radiusY * 0.1;
          const x2 = cx + Math.cos(angle + Math.PI) * radiusX;
          const y2 = cy + Math.sin(angle + Math.PI) * radiusY;
          const sweep = Math.sin(t * 0.6 + i * 1.1) * 0.15 + 0.85;
          const mx = cx + Math.cos(angle + Math.PI * sweep) * radiusX * 0.6;
          const my = cy + Math.sin(angle + Math.PI * sweep) * radiusY * 0.6;
          const op = 0.08 + Math.sin(t * 0.9 + i * 1.4) * 0.05;
          return (
            <path
              key={`d-${i}`}
              d={`M ${x1},${y1} Q ${mx},${my} ${x2},${y2}`}
              stroke="white"
              strokeWidth={0.6}
              fill="none"
              opacity={Math.max(0.03, op)}
              filter="url(#softglow)"
            />
          );
        })}
      </svg>
    </div>
  );
};