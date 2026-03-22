import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const DonutChartAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const cx = width / 2;
  const cy = height / 2;
  const outerR = 280;
  const innerR = 160;

  const segments = [
    { value: 0.22, color: '#FF6B6B', label: 'A' },
    { value: 0.18, color: '#FFE66D', label: 'B' },
    { value: 0.15, color: '#4ECDC4', label: 'C' },
    { value: 0.20, color: '#A29BFE', label: 'D' },
    { value: 0.12, color: '#FD79A8', label: 'E' },
    { value: 0.13, color: '#55EFC4', label: 'F' },
  ];

  const gap = 0.012;
  const totalAnimation = durationInFrames - 100;
  const segmentDelay = 18;
  const segmentDuration = 55;

  const getArcPath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  };

  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  const getDonutSegmentPath = (cx: number, cy: number, outerR: number, innerR: number, startAngle: number, endAngle: number) => {
    const o1 = polarToCartesian(cx, cy, outerR, startAngle);
    const o2 = polarToCartesian(cx, cy, outerR, endAngle);
    const i1 = polarToCartesian(cx, cy, innerR, endAngle);
    const i2 = polarToCartesian(cx, cy, innerR, startAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${o1.x} ${o1.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${i2.x} ${i2.y} Z`;
  };

  let cumulativeAngle = -Math.PI / 2;
  const segmentData = segments.map((seg, i) => {
    const startAngle = cumulativeAngle + gap;
    const totalAngle = seg.value * 2 * Math.PI - gap * 2;
    const endAngle = startAngle + totalAngle;
    cumulativeAngle += seg.value * 2 * Math.PI;
    const midAngle = (startAngle + endAngle) / 2;
    const fillProgress = interpolate(
      frame,
      [50 + i * segmentDelay, 50 + i * segmentDelay + segmentDuration],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const animatedEndAngle = startAngle + totalAngle * fillProgress;
    const dotR = outerR + 22;
    const dotPos = polarToCartesian(cx, cy, dotR, midAngle);
    return { ...seg, startAngle, endAngle, animatedEndAngle, totalAngle, fillProgress, midAngle, dotPos };
  });

  const pulseScale = 1 + 0.015 * Math.sin(frame * 0.08);

  return (
    <div style={{ width, height, background: '#0D0D0D', position: 'relative', overflow: 'hidden', opacity }}>
      {/* Background glow rings */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {[380, 340, 300].map((r, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={`rgba(255,255,255,${0.03 - i * 0.008})`}
            strokeWidth={1}
          />
        ))}
      </svg>

      {/* Main donut chart */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <g transform={`translate(0,0) scale(${pulseScale})`} style={{ transformOrigin: `${cx}px ${cy}px` }}>
          {/* Shadow/glow layer */}
          {segmentData.map((seg, i) => (
            seg.fillProgress > 0 && (
              <path
                key={`glow-${i}`}
                d={getDonutSegmentPath(cx, cy, outerR + 8, innerR - 8, seg.startAngle, seg.animatedEndAngle)}
                fill="none"
                stroke={seg.color}
                strokeWidth={6}
                opacity={0.18 * seg.fillProgress}
                style={{ filter: `blur(8px)` }}
              />
            )
          ))}

          {/* Gray background track */}
          {segmentData.map((seg, i) => (
            <path
              key={`track-${i}`}
              d={getDonutSegmentPath(cx, cy, outerR, innerR, seg.startAngle, seg.endAngle)}
              fill="rgba(255,255,255,0.04)"
            />
          ))}

          {/* Colored segments */}
          {segmentData.map((seg, i) => (
            seg.fillProgress > 0 && (
              <path
                key={`seg-${i}`}
                d={getDonutSegmentPath(cx, cy, outerR, innerR, seg.startAngle, seg.animatedEndAngle)}
                fill={seg.color}
                opacity={0.92}
              />
            )
          ))}

          {/* Highlight top edge */}
          {segmentData.map((seg, i) => (
            seg.fillProgress > 0 && (
              <path
                key={`highlight-${i}`}
                d={getArcPath(cx, cy, outerR - 2, seg.startAngle, seg.animatedEndAngle)}
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={2}
                strokeLinecap="round"
              />
            )
          ))}

          {/* Segment end dot indicator */}
          {segmentData.map((seg, i) => {
            if (seg.fillProgress <= 0 || seg.fillProgress >= 0.98) return null;
            const dotPos = polarToCartesian(cx, cy, (outerR + innerR) / 2, seg.animatedEndAngle);
            return (
              <circle
                key={`dot-${i}`}
                cx={dotPos.x}
                cy={dotPos.y}
                r={7}
                fill={seg.color}
                stroke="white"
                strokeWidth={2.5}
                opacity={0.95}
              />
            );
          })}
        </g>

        {/* Center decorative circles */}
        <circle cx={cx} cy={cy} r={innerR - 10} fill="#0D0D0D" />
        <circle cx={cx} cy={cy} r={innerR - 10} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={innerR - 30} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />

        {/* Center pulsing dot */}
        <circle
          cx={cx}
          cy={cy}
          r={8 + 3 * Math.sin(frame * 0.1)}
          fill="rgba(255,255,255,0.12)"
        />
        <circle cx={cx} cy={cy} r={5} fill="rgba(255,255,255,0.5)" />

        {/* Outer color dot indicators */}
        {segmentData.map((seg, i) => {
          const dotR2 = outerR + 30;
          const pos = polarToCartesian(cx, cy, dotR2, seg.midAngle);
          return (
            <circle
              key={`outer-dot-${i}`}
              cx={pos.x}
              cy={pos.y}
              r={6}
              fill={seg.color}
              opacity={seg.fillProgress}
              style={{ filter: `drop-shadow(0 0 6px ${seg.color})` }}
            />
          );
        })}

        {/* Decorative tick marks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
          const isMajor = i % 5 === 0;
          const r1 = outerR + 45;
          const r2 = outerR + (isMajor ? 58 : 52);
          const p1 = polarToCartesian(cx, cy, r1, angle);
          const p2 = polarToCartesian(cx, cy, r2, angle);
          return (
            <line
              key={`tick-${i}`}
              x1={p1.x} y1={p1.y}
              x2={p2.x} y2={p2.y}
              stroke={`rgba(255,255,255,${isMajor ? 0.2 : 0.08})`}
              strokeWidth={isMajor ? 1.5 : 1}
            />
          );
        })}
      </svg>

      {/* Particle sparkles */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        {segmentData.map((seg, si) =>
          Array.from({ length: 5 }).map((_, pi) => {
            const seed = si * 100 + pi * 17;
            const t = ((frame * 0.7 + seed * 20) % 120) / 120;
            const spreadAngle = seg.midAngle + (pi - 2) * 0.15;
            const radius = interpolate(t, [0, 1], [innerR + 20, outerR + 60]);
            const pOpacity = interpolate(t, [0, 0.2, 0.7, 1], [0, 0.9, 0.6, 0]) * seg.fillProgress;
            const pos = polarToCartesian(cx, cy, radius, spreadAngle);
            const pSize = 1.5 + (pi % 3) * 1.2;
            return (
              <circle
                key={`spark-${si}-${pi}`}
                cx={pos.x}
                cy={pos.y}
                r={pSize}
                fill={seg.color}
                opacity={pOpacity}
              />
            );
          })
        )}
      </svg>
    </div>
  );
};