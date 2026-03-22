import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const FACILITIES = Array.from({ length: 48 }, (_, i) => ({
  x: ((i * 1731 + 320) % 3400) + 220,
  y: ((i * 1337 + 180) % 1800) + 180,
  size: ((i * 47) % 18) + 12,
  pulseOffset: (i * 37) % 60,
  pulseSpeed: 0.6 + ((i * 13) % 10) * 0.08,
  intensity: 0.5 + ((i * 29) % 10) * 0.05,
  tier: i % 3,
}));

const GRID_LINES_H = Array.from({ length: 22 }, (_, i) => ({
  y: (i / 21) * 2160,
  opacity: 0.03 + (i % 3) * 0.01,
}));

const GRID_LINES_V = Array.from({ length: 38 }, (_, i) => ({
  x: (i / 37) * 3840,
  opacity: 0.03 + (i % 3) * 0.01,
}));

const REGION_BLOBS = Array.from({ length: 12 }, (_, i) => ({
  cx: ((i * 2137 + 500) % 3200) + 320,
  cy: ((i * 1709 + 300) % 1700) + 230,
  rx: 180 + ((i * 67) % 280),
  ry: 120 + ((i * 53) % 200),
  rotation: (i * 31) % 180,
  colorShift: (i * 23) % 40,
}));

const CONNECTION_PAIRS = Array.from({ length: 30 }, (_, i) => ({
  from: (i * 7) % 48,
  to: (i * 11 + 5) % 48,
  delay: (i * 19) % 90,
  speed: 0.4 + ((i * 13) % 8) * 0.1,
}));

export const HealthcareFacilityCoverageMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const mapShift = interpolate(frame, [0, durationInFrames], [0, -60], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const mapShiftY = interpolate(frame, [0, durationInFrames], [0, -30], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ width, height, background: '#080f0a', overflow: 'hidden', position: 'relative', opacity: globalOpacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0d1f12" />
            <stop offset="100%" stopColor="#050c07" />
          </radialGradient>
          <radialGradient id="pulseGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="20" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="regionBlur">
            <feGaussianBlur stdDeviation="60" />
          </filter>
        </defs>

        <rect width={width} height={height} fill="url(#bgGrad)" />

        {/* Grid lines */}
        <g transform={`translate(${mapShift}, ${mapShiftY})`}>
          {GRID_LINES_H.map((line, i) => (
            <line
              key={`h${i}`}
              x1={0} y1={line.y}
              x2={width + 100} y2={line.y}
              stroke="#22c55e"
              strokeWidth={0.8}
              opacity={line.opacity}
            />
          ))}
          {GRID_LINES_V.map((line, i) => (
            <line
              key={`v${i}`}
              x1={line.x} y1={0}
              x2={line.x} y2={height + 100}
              stroke="#22c55e"
              strokeWidth={0.8}
              opacity={line.opacity}
            />
          ))}
        </g>

        {/* Region coverage blobs */}
        <g transform={`translate(${mapShift}, ${mapShiftY})`} filter="url(#regionBlur)">
          {REGION_BLOBS.map((blob, i) => {
            const pulse = Math.sin(frame * 0.015 + i * 0.8) * 0.5 + 0.5;
            const opacity = 0.04 + pulse * 0.06;
            return (
              <ellipse
                key={`blob${i}`}
                cx={blob.cx}
                cy={blob.cy}
                rx={blob.rx + pulse * 40}
                ry={blob.ry + pulse * 30}
                fill={`hsl(${140 + blob.colorShift}, 60%, 45%)`}
                opacity={opacity}
                transform={`rotate(${blob.rotation}, ${blob.cx}, ${blob.cy})`}
              />
            );
          })}
        </g>

        {/* Connection lines between facilities */}
        <g transform={`translate(${mapShift}, ${mapShiftY})`}>
          {CONNECTION_PAIRS.map((pair, i) => {
            const fromFac = FACILITIES[pair.from];
            const toFac = FACILITIES[pair.to];
            const progress = ((frame * pair.speed + pair.delay) % 120) / 120;
            const lineOpacity = 0.08 + Math.sin(frame * 0.02 + i * 0.5) * 0.04;
            const dashLen = 80;
            const dashGap = 200;
            const dx = toFac.x - fromFac.x;
            const dy = toFac.y - fromFac.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const dashOffset = -progress * (dashLen + dashGap);
            return (
              <line
                key={`conn${i}`}
                x1={fromFac.x} y1={fromFac.y}
                x2={toFac.x} y2={toFac.y}
                stroke="#4ade80"
                strokeWidth={0.8}
                opacity={lineOpacity}
                strokeDasharray={`${dashLen} ${dashGap}`}
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </g>

        {/* Facility markers */}
        <g transform={`translate(${mapShift}, ${mapShiftY})`}>
          {FACILITIES.map((fac, i) => {
            const t = frame * fac.pulseSpeed * 0.05 + fac.pulseOffset;
            const pulse1 = (Math.sin(t) * 0.5 + 0.5);
            const pulse2 = (Math.sin(t * 1.3 + 1.2) * 0.5 + 0.5);

            const outerR = fac.size * (2.5 + pulse1 * 2.0);
            const midR = fac.size * (1.5 + pulse2 * 1.0);
            const innerR = fac.size * 0.6;

            const outerOpacity = fac.intensity * (0.15 + pulse1 * 0.25);
            const midOpacity = fac.intensity * (0.3 + pulse2 * 0.3);
            const innerOpacity = 0.85 + pulse1 * 0.15;

            const tierColor = fac.tier === 0 ? '#4ade80' : fac.tier === 1 ? '#86efac' : '#22c55e';
            const tierGlow = fac.tier === 0 ? 8 : fac.tier === 1 ? 12 : 6;

            return (
              <g key={`fac${i}`} filter="url(#glow)">
                {/* Outermost pulse ring */}
                <circle
                  cx={fac.x} cy={fac.y} r={outerR}
                  fill="none"
                  stroke={tierColor}
                  strokeWidth={1.2}
                  opacity={outerOpacity}
                />
                {/* Mid pulse ring */}
                <circle
                  cx={fac.x} cy={fac.y} r={midR}
                  fill="none"
                  stroke={tierColor}
                  strokeWidth={1.8}
                  opacity={midOpacity}
                />
                {/* Soft fill pulse */}
                <circle
                  cx={fac.x} cy={fac.y} r={midR}
                  fill={tierColor}
                  opacity={outerOpacity * 0.3}
                />
                {/* Core dot */}
                <circle
                  cx={fac.x} cy={fac.y} r={innerR}
                  fill={tierColor}
                  opacity={innerOpacity}
                />
                {/* Cross marker for tier-0 (major) */}
                {fac.tier === 0 && (
                  <>
                    <line
                      x1={fac.x - innerR * 1.8} y1={fac.y}
                      x2={fac.x + innerR * 1.8} y2={fac.y}
                      stroke={tierColor} strokeWidth={2} opacity={0.9}
                    />
                    <line
                      x1={fac.x} y1={fac.y - innerR * 1.8}
                      x2={fac.x} y2={fac.y + innerR * 1.8}
                      stroke={tierColor} strokeWidth={2} opacity={0.9}
                    />
                  </>
                )}
              </g>
            );
          })}
        </g>

        {/* Ambient radial overlay */}
        <radialGradient id="ambientOverlay" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#0d2a15" stopOpacity="0" />
          <stop offset="100%" stopColor="#030807" stopOpacity="0.7" />
        </radialGradient>
        <rect width={width} height={height} fill="url(#ambientOverlay)" />

        {/* Subtle scanline overlay */}
        <g opacity={0.025}>
          {Array.from({ length: 54 }, (_, i) => (
            <line
              key={`scan${i}`}
              x1={0} y1={(i / 53) * height}
              x2={width} y2={(i / 53) * height}
              stroke="#4ade80"
              strokeWidth={1}
            />
          ))}
        </g>

        {/* Corner frame accents */}
        {[
          [0, 0, 1, 1],
          [width, 0, -1, 1],
          [0, height, 1, -1],
          [width, height, -1, -1],
        ].map(([cx, cy, sx, sy], i) => (
          <g key={`corner${i}`} opacity={0.35}>
            <line x1={cx as number} y1={cy as number} x2={(cx as number) + (sx as number) * 160} y2={cy as number} stroke="#4ade80" strokeWidth={2} />
            <line x1={cx as number} y1={cy as number} x2={cx as number} y2={(cy as number) + (sy as number) * 160} stroke="#4ade80" strokeWidth={2} />
            <circle cx={(cx as number) + (sx as number) * 12} cy={(cy as number) + (sy as number) * 12} r={4} fill="#4ade80" opacity={0.6} />
          </g>
        ))}

        {/* Breathing vignette */}
        {(() => {
          const breathe = Math.sin(frame * 0.02) * 0.5 + 0.5;
          return (
            <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
              <stop offset="40%" stopColor="transparent" stopOpacity="0" />
              <stop offset="100%" stopColor="#020705" stopOpacity={0.55 + breathe * 0.1} />
            </radialGradient>
          );
        })()}
        <rect width={width} height={height} fill="url(#vignette)" />
      </svg>
    </div>
  );
};