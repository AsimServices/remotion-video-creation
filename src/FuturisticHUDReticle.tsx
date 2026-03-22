import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const FuturisticHUDReticle: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const cx = width / 2;
  const cy = height / 2;

  const outerRot = (frame * 0.3) % 360;
  const innerRot = (-frame * 0.6) % 360;
  const middleRot = (frame * 0.15) % 360;

  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.08);
  const pulse2 = 0.5 + 0.5 * Math.sin(frame * 0.13 + 1.2);

  const scanLine = (frame * 2) % 300;

  const dataValues = [
    Math.floor(Math.sin(frame * 0.07) * 50 + 500),
    Math.floor(Math.cos(frame * 0.09) * 30 + 120),
    Math.floor(Math.sin(frame * 0.05) * 20 + 74),
    Math.floor(Math.cos(frame * 0.11) * 15 + 98),
  ];

  const cornerBracketSize = 40;
  const reticleR = 120;

  const corners = [
    { x: cx - reticleR, y: cy - reticleR, rx: 1, ry: 1 },
    { x: cx + reticleR, y: cy - reticleR, rx: -1, ry: 1 },
    { x: cx + reticleR, y: cy + reticleR, rx: -1, ry: -1 },
    { x: cx - reticleR, y: cy + reticleR, rx: 1, ry: -1 },
  ];

  const rings = [200, 160, 130, 100, 70];

  const hexPoints = (r: number, cx: number, cy: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');

  return (
    <div style={{ width, height, background: '#020810', position: 'relative', overflow: 'hidden', opacity }}>
      {/* Ambient grid */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0a1a2e" strokeWidth="1" />
          </pattern>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#001830" stopOpacity="1" />
            <stop offset="100%" stopColor="#020810" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00eeff" stopOpacity={0.15 * pulse} />
            <stop offset="100%" stopColor="#00eeff" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowStrong">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowSoft">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="reticleClip">
            <rect x={cx - reticleR} y={cy - reticleR} width={reticleR * 2} height={reticleR * 2} />
          </clipPath>
        </defs>

        <rect width={width} height={height} fill="url(#bgGlow)" />
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Center ambient glow */}
        <circle cx={cx} cy={cy} r={350} fill="url(#centerGlow)" />

        {/* Outer decorative rings */}
        {rings.map((r, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#00eeff"
            strokeWidth={i === 0 ? 0.5 : 0.3}
            strokeOpacity={0.08 + i * 0.02}
            strokeDasharray={i % 2 === 0 ? '4 8' : 'none'}
          />
        ))}

        {/* Rotating outer hex */}
        <g transform={`rotate(${outerRot}, ${cx}, ${cy})`} filter="url(#glow)">
          <polygon
            points={hexPoints(220, cx, cy)}
            fill="none"
            stroke="#00eeff"
            strokeWidth="1"
            strokeOpacity="0.15"
            strokeDasharray="10 20"
          />
        </g>

        {/* Middle dashed ring */}
        <g transform={`rotate(${middleRot}, ${cx}, ${cy})`} filter="url(#glowSoft)">
          <circle
            cx={cx}
            cy={cy}
            r={180}
            fill="none"
            stroke="#00aaff"
            strokeWidth="1"
            strokeOpacity="0.25"
            strokeDasharray="3 15"
          />
        </g>

        {/* Inner rotating ring */}
        <g transform={`rotate(${innerRot}, ${cx}, ${cy})`} filter="url(#glow)">
          <circle
            cx={cx}
            cy={cy}
            r={145}
            fill="none"
            stroke="#00ffcc"
            strokeWidth="1.5"
            strokeOpacity="0.4"
            strokeDasharray="20 10 5 10"
          />
        </g>

        {/* Main reticle circle */}
        <circle
          cx={cx}
          cy={cy}
          r={reticleR}
          fill="none"
          stroke="#00eeff"
          strokeWidth="1.5"
          strokeOpacity="0.8"
          filter="url(#glow)"
        />

        {/* Scan line inside reticle */}
        <line
          x1={cx - reticleR}
          y1={cy - reticleR + scanLine}
          x2={cx + reticleR}
          y2={cy - reticleR + scanLine}
          stroke="#00eeff"
          strokeWidth="1"
          strokeOpacity={0.6 * (1 - scanLine / 300)}
          clipPath="url(#reticleClip)"
          filter="url(#glow)"
        />

        {/* Crosshairs */}
        <line x1={cx - reticleR - 20} y1={cy} x2={cx - 15} y2={cy} stroke="#00eeff" strokeWidth="1" strokeOpacity="0.7" filter="url(#glowSoft)" />
        <line x1={cx + 15} y1={cy} x2={cx + reticleR + 20} y2={cy} stroke="#00eeff" strokeWidth="1" strokeOpacity="0.7" filter="url(#glowSoft)" />
        <line x1={cx} y1={cy - reticleR - 20} x2={cx} y2={cy - 15} stroke="#00eeff" strokeWidth="1" strokeOpacity="0.7" filter="url(#glowSoft)" />
        <line x1={cx} y1={cy + 15} x2={cx} y2={cy + reticleR + 20} stroke="#00eeff" strokeWidth="1" strokeOpacity="0.7" filter="url(#glowSoft)" />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={4} fill="#00eeff" fillOpacity={0.6 + 0.4 * pulse} filter="url(#glowStrong)" />
        <circle cx={cx} cy={cy} r={2} fill="#ffffff" fillOpacity={0.9} />

        {/* Corner brackets - rotating slowly */}
        {corners.map((c, i) => {
          const rot = (i % 2 === 0 ? outerRot : -outerRot) * 0.1;
          return (
            <g key={i} transform={`rotate(${rot}, ${cx}, ${cy})`} filter="url(#glow)">
              <line
                x1={c.x}
                y1={c.y}
                x2={c.x + c.rx * cornerBracketSize}
                y2={c.y}
                stroke="#00eeff"
                strokeWidth="2.5"
                strokeOpacity="0.9"
              />
              <line
                x1={c.x}
                y1={c.y}
                x2={c.x}
                y2={c.y + c.ry * cornerBracketSize}
                stroke="#00eeff"
                strokeWidth="2.5"
                strokeOpacity="0.9"
              />
              {/* Corner accent dot */}
              <circle cx={c.x} cy={c.y} r={3} fill="#00eeff" fillOpacity="0.9" />
            </g>
          );
        })}

        {/* Tick marks around reticle */}
        {Array.from({ length: 36 }, (_, i) => {
          const angle = (Math.PI * 2 * i) / 36;
          const isLarge = i % 9 === 0;
          const isMed = i % 3 === 0;
          const tickLen = isLarge ? 14 : isMed ? 8 : 4;
          const r1 = reticleR + 3;
          const r2 = r1 + tickLen;
          return (
            <line
              key={i}
              x1={cx + r1 * Math.cos(angle)}
              y1={cy + r1 * Math.sin(angle)}
              x2={cx + r2 * Math.cos(angle)}
              y2={cy + r2 * Math.sin(angle)}
              stroke="#00eeff"
              strokeWidth={isLarge ? 1.5 : 0.8}
              strokeOpacity={isLarge ? 0.9 : 0.4}
            />
          );
        })}

        {/* Data readout panels */}
        {/* Top-left panel */}
        <g transform={`translate(${cx - 380}, ${cy - 200})`} filter="url(#glowSoft)">
          <rect x={0} y={0} width={160} height={90} fill="#001830" fillOpacity="0.7" stroke="#00eeff" strokeWidth="0.8" strokeOpacity="0.4" />
          <rect x={0} y={0} width={160} height={14} fill="#00eeff" fillOpacity="0.08" />
          <line x1={0} y1={14} x2={160} y2={14} stroke="#00eeff" strokeWidth="0.5" strokeOpacity="0.5" />
          {/* Data bars */}
          {[0, 1, 2, 3].map(j => (
            <g key={j}>
              <rect x={8} y={22 + j * 17} width={80} height={7} fill="#001020" rx={1} />
              <rect
                x={8} y={22 + j * 17}
                width={dataValues[j] % 80}
                height={7}
                fill="#00eeff"
                fillOpacity={0.5 + 0.3 * pulse2}
                rx={1}
              />
            </g>
          ))}
        </g>

        {/* Bottom-right panel */}
        <g transform={`translate(${cx + 220}, ${cy + 110})`} filter="url(#glowSoft)">
          <rect x={0} y={0} width={160} height={80} fill="#001830" fillOpacity="0.7" stroke="#00ffcc" strokeWidth="0.8" strokeOpacity="0.4" />
          <rect x={0} y={0} width={160} height={14} fill="#00ffcc" fillOpacity="0.08" />
          <line x1={0} y1={14} x2={160} y2={14} stroke="#00ffcc" strokeWidth="0.5" strokeOpacity="0.5" />
          {[0, 1, 2].map(j => (
            <g key={j}>
              <rect x={8} y={22 + j * 19} width={100} height={6} fill="#001020" rx={1} />
              <rect
                x={8} y={22 + j * 19}
                width={(dataValues[j] * 1.3) % 100}
                height={6}
                fill="#00ffcc"
                fillOpacity={0.4 + 0.4 * pulse}
                rx={1}
              />
            </g>
          ))}
        </g>

        {/* Bottom-left small panel */}
        <g transform={`translate(${cx - 380}, ${cy + 130})`} filter="url(#glowSoft)">
          <rect x={0} y={0} width={120} height={60} fill="#001830" fillOpacity="0.7" stroke="#00aaff" strokeWidth="0.8" strokeOpacity="0.4" />
          {/* Mini bars */}
          {Array.from({ length: 8 }, (_, k) => {
            const barH = 20 + 20 * Math.abs(Math.sin(frame * 0.05 + k * 0.7));
            return (
              <rect
                key={k}
                x={8 + k * 13}
                y={60 - 8 - barH}
                width={9}
                height={barH}
                fill="#00aaff"
                fillOpacity={0.3 + 0.3 * pulse}
                rx={1}
              />
            );
          })}
        </g>

        {/* Top-right small panel */}
        <g transform={`translate(${cx + 240}, ${cy - 200})`} filter="url(#glowSoft)">
          <rect x={0} y={0} width={110} height={80} fill="#001830" fillOpacity="0.7" stroke="#ff4466" strokeWidth="0.8" strokeOpacity="0.4" />
          <rect x={0} y={0} width={110} height={14} fill="#ff4466" fillOpacity="0.08" />
          <line x1={0} y1={14} x2={110} y2={14} stroke="#ff4466" strokeWidth="0.5" strokeOpacity="0.5" />
          {/* Radar-like arc */}
          <circle cx={55} cy={55} r={22} fill="none" stroke="#ff4466" strokeWidth="0.5" strokeOpacity="0.3" />
          <line
            x1={55} y1={55}
            x2={55 + 22 * Math.cos(frame * 0.08)}
            y2={55 + 22 * Math.sin(frame * 0.08)}
            stroke="#ff4466"
            strokeWidth="1.5"
            strokeOpacity="0.8"
            filter="url(#glow)"
          />
          <circle cx={55} cy={55} r={3} fill="#ff4466" fillOpacity="0.8" />
          {/* Blip */}
          <circle
            cx={55 + 15 * Math.cos(frame * 0.03)}
            cy={55 + 15 * Math.sin(frame * 0.03)}
            r={2.5}
            fill="#ff4466"
            fillOpacity={pulse}
            filter="url(#glow)"
          />
        </g>

        {/* Connecting lines from panels to reticle */}
        <line x1={cx - 220} y1={cy - 155} x2={cx - reticleR - 5} y2={cy - reticleR + 10} stroke="#00eeff" strokeWidth="0.5" strokeOpacity="0.25" strokeDasharray="4 6" />
        <line x1={cx + 220} y1={cy + 150} x2={cx + reticleR + 5} y2={cy + reticleR - 10} stroke="#00ffcc" strokeWidth="0.5" strokeOpacity="0.25" strokeDasharray="4 6" />

        {/* Pulsing outer glow ring */}
        <circle
          cx={cx}
          cy={cy}
          r={reticleR + 8}
          fill="none"
          stroke="#00eeff"
          strokeWidth={4 * pulse}
          strokeOpacity={0.08 * pulse}
          filter="url(#glowStrong)"
        />

        {/* Animated dashes rotating around reticle */}
        <g transform={`rotate(${outerRot * 2}, ${cx}, ${cy})`}>
          <circle
            cx={cx}
            cy={cy}
            r={reticleR - 10}
            fill="none"
            stroke="#00ffcc"
            strokeWidth="1"
            strokeOpacity="0.25"
            strokeDasharray="5 55"
          />
        </g>

        {/* Extra decorative tiny diamonds at cardinal crosshair ends */}
        {[
          [cx - reticleR - 20, cy],
          [cx + reticleR + 20, cy],
          [cx, cy - reticleR - 20],
          [cx, cy + reticleR + 20],
        ].map(([dx, dy], i) => (
          <g key={i} transform={`translate(${dx}, ${dy}) rotate(45)`}>
            <rect x={-4} y={-4} width={8} height={8} fill="none" stroke="#00eeff" strokeWidth="1" strokeOpacity="0.7" />
          </g>
        ))}
      </svg>
    </div>
  );
};