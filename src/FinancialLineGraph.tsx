import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const FinancialLineGraph: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const drawProgress = interpolate(frame, [30, durationInFrames - 60], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  const paddingLeft = 80;
  const paddingRight = 80;
  const paddingTop = 100;
  const paddingBottom = 120;
  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;

  const dataPoints = [
    { x: 0.0, y: 0.55 },
    { x: 0.04, y: 0.50 },
    { x: 0.08, y: 0.58 },
    { x: 0.12, y: 0.45 },
    { x: 0.16, y: 0.52 },
    { x: 0.20, y: 0.40 },
    { x: 0.24, y: 0.35 },
    { x: 0.28, y: 0.42 },
    { x: 0.32, y: 0.38 },
    { x: 0.36, y: 0.30 },
    { x: 0.40, y: 0.25 },
    { x: 0.44, y: 0.32 },
    { x: 0.48, y: 0.28 },
    { x: 0.52, y: 0.20 },
    { x: 0.56, y: 0.15 },
    { x: 0.60, y: 0.22 },
    { x: 0.64, y: 0.18 },
    { x: 0.68, y: 0.12 },
    { x: 0.72, y: 0.08 },
    { x: 0.76, y: 0.14 },
    { x: 0.80, y: 0.10 },
    { x: 0.84, y: 0.06 },
    { x: 0.88, y: 0.12 },
    { x: 0.92, y: 0.08 },
    { x: 0.96, y: 0.04 },
    { x: 1.00, y: 0.02 },
  ];

  const toSvgX = (nx: number) => paddingLeft + nx * graphWidth;
  const toSvgY = (ny: number) => paddingTop + ny * graphHeight;

  const getInterpolatedPoints = (progress: number) => {
    if (progress <= 0) return [];
    const totalLength = dataPoints.length - 1;
    const currentIndex = progress * totalLength;
    const floorIndex = Math.floor(currentIndex);
    const fraction = currentIndex - floorIndex;

    const points = dataPoints.slice(0, floorIndex + 1).map(p => ({
      x: toSvgX(p.x),
      y: toSvgY(p.y),
    }));

    if (floorIndex < dataPoints.length - 1) {
      const p0 = dataPoints[floorIndex];
      const p1 = dataPoints[floorIndex + 1];
      points.push({
        x: toSvgX(p0.x + fraction * (p1.x - p0.x)),
        y: toSvgY(p0.y + fraction * (p1.y - p0.y)),
      });
    }

    return points;
  };

  const visiblePoints = getInterpolatedPoints(drawProgress);

  const buildPath = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y} ${cpx} ${curr.y} ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const buildAreaPath = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) return '';
    let d = buildPath(points);
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    d += ` L ${lastPoint.x} ${paddingTop + graphHeight}`;
    d += ` L ${firstPoint.x} ${paddingTop + graphHeight}`;
    d += ' Z';
    return d;
  };

  const pathD = buildPath(visiblePoints);
  const areaD = buildAreaPath(visiblePoints);
  const tipPoint = visiblePoints.length > 0 ? visiblePoints[visiblePoints.length - 1] : null;

  const glowPulse = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.6, 1.0]);
  const glowRadius = interpolate(Math.sin(frame * 0.1), [-1, 1], [14, 22]);

  const numGridLines = 6;
  const gridLines = Array.from({ length: numGridLines + 1 }, (_, i) => i / numGridLines);

  return (
    <div
      style={{
        width,
        height,
        background: 'linear-gradient(135deg, #050a14 0%, #080e1e 50%, #060c18 100%)',
        opacity,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background subtle grid glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 80%, rgba(0,180,255,0.04) 0%, transparent 70%)',
        }}
      />

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00b4ff" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#00e5ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00ffcc" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.0" />
          </linearGradient>
          <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="tipGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="graphClip">
            <rect x={paddingLeft} y={paddingTop} width={graphWidth} height={graphHeight} />
          </clipPath>
        </defs>

        {/* Grid horizontal lines */}
        {gridLines.map((t, i) => {
          const y = paddingTop + t * graphHeight;
          return (
            <line
              key={i}
              x1={paddingLeft}
              y1={y}
              x2={paddingLeft + graphWidth}
              y2={y}
              stroke="rgba(0,180,255,0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Grid vertical lines */}
        {Array.from({ length: 11 }, (_, i) => i / 10).map((t, i) => {
          const x = paddingLeft + t * graphWidth;
          return (
            <line
              key={i}
              x1={x}
              y1={paddingTop}
              x2={x}
              y2={paddingTop + graphHeight}
              stroke="rgba(0,180,255,0.05)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axes */}
        <line
          x1={paddingLeft}
          y1={paddingTop}
          x2={paddingLeft}
          y2={paddingTop + graphHeight}
          stroke="rgba(0,180,255,0.3)"
          strokeWidth="1.5"
        />
        <line
          x1={paddingLeft}
          y1={paddingTop + graphHeight}
          x2={paddingLeft + graphWidth}
          y2={paddingTop + graphHeight}
          stroke="rgba(0,180,255,0.3)"
          strokeWidth="1.5"
        />

        {/* Area fill */}
        {areaD && (
          <path
            d={areaD}
            fill="url(#areaGradient)"
            clipPath="url(#graphClip)"
          />
        )}

        {/* Shadow/glow line behind */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#00e5ff"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#strongGlow)"
            opacity="0.3"
            clipPath="url(#graphClip)"
          />
        )}

        {/* Main line */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glowFilter)"
            clipPath="url(#graphClip)"
          />
        )}

        {/* Tip glow circles */}
        {tipPoint && (
          <>
            <circle
              cx={tipPoint.x}
              cy={tipPoint.y}
              r={glowRadius * 1.8}
              fill="rgba(0,229,255,0.04)"
            />
            <circle
              cx={tipPoint.x}
              cy={tipPoint.y}
              r={glowRadius}
              fill="rgba(0,229,255,0.10)"
            />
            <circle
              cx={tipPoint.x}
              cy={tipPoint.y}
              r={glowRadius * 0.5}
              fill="rgba(0,229,255,0.25)"
              filter="url(#tipGlow)"
            />
            <circle
              cx={tipPoint.x}
              cy={tipPoint.y}
              r={5}
              fill="#00ffee"
              opacity={glowPulse}
              filter="url(#tipGlow)"
            />
            <circle
              cx={tipPoint.x}
              cy={tipPoint.y}
              r={2.5}
              fill="#ffffff"
            />

            {/* Vertical drop line from tip */}
            <line
              x1={tipPoint.x}
              y1={tipPoint.y}
              x2={tipPoint.x}
              y2={paddingTop + graphHeight}
              stroke="rgba(0,229,255,0.15)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          </>
        )}

        {/* Axis tick marks */}
        {gridLines.map((t, i) => {
          const y = paddingTop + t * graphHeight;
          return (
            <line
              key={i}
              x1={paddingLeft - 6}
              y1={y}
              x2={paddingLeft}
              y2={y}
              stroke="rgba(0,180,255,0.3)"
              strokeWidth="1"
            />
          );
        })}
        {Array.from({ length: 11 }, (_, i) => i / 10).map((t, i) => {
          const x = paddingLeft + t * graphWidth;
          return (
            <line
              key={i}
              x1={x}
              y1={paddingTop + graphHeight}
              x2={x}
              y2={paddingTop + graphHeight + 6}
              stroke="rgba(0,180,255,0.3)"
              strokeWidth="1"
            />
          );
        })}
      </svg>
    </div>
  );
};