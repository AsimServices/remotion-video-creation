import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const NeonOrbsBleed: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const t = frame / durationInFrames;
  const slowT = frame * 0.008;

  const orbs = [
    {
      x: width * 0.3 + Math.sin(slowT * 0.7 + 0.0) * width * 0.18,
      y: height * 0.4 + Math.cos(slowT * 0.5 + 0.5) * height * 0.18,
      r: 280 + Math.sin(slowT * 0.9 + 1.0) * 60,
      color1: 'rgba(255,0,200,0.9)',
      color2: 'rgba(255,0,200,0.0)',
      pulse: Math.sin(slowT * 1.3 + 0.0) * 0.15 + 0.85,
    },
    {
      x: width * 0.65 + Math.sin(slowT * 0.6 + 1.2) * width * 0.17,
      y: height * 0.55 + Math.cos(slowT * 0.8 + 2.0) * height * 0.15,
      r: 260 + Math.cos(slowT * 1.1 + 0.3) * 55,
      color1: 'rgba(0,120,255,0.9)',
      color2: 'rgba(0,120,255,0.0)',
      pulse: Math.sin(slowT * 1.1 + 1.5) * 0.15 + 0.85,
    },
    {
      x: width * 0.5 + Math.cos(slowT * 0.55 + 2.5) * width * 0.14,
      y: height * 0.3 + Math.sin(slowT * 0.75 + 0.8) * height * 0.2,
      r: 200 + Math.sin(slowT * 1.2 + 2.0) * 45,
      color1: 'rgba(200,0,255,0.85)',
      color2: 'rgba(200,0,255,0.0)',
      pulse: Math.cos(slowT * 1.4 + 0.7) * 0.12 + 0.88,
    },
    {
      x: width * 0.25 + Math.sin(slowT * 0.65 + 3.0) * width * 0.12,
      y: height * 0.7 + Math.cos(slowT * 0.9 + 1.5) * height * 0.12,
      r: 180 + Math.cos(slowT * 0.8 + 1.0) * 40,
      color1: 'rgba(0,200,255,0.85)',
      color2: 'rgba(0,200,255,0.0)',
      pulse: Math.sin(slowT * 1.6 + 2.0) * 0.12 + 0.88,
    },
    {
      x: width * 0.75 + Math.cos(slowT * 0.7 + 0.5) * width * 0.13,
      y: height * 0.25 + Math.sin(slowT * 0.6 + 2.8) * height * 0.16,
      r: 220 + Math.sin(slowT * 1.0 + 0.5) * 50,
      color1: 'rgba(255,20,180,0.8)',
      color2: 'rgba(255,20,180,0.0)',
      pulse: Math.cos(slowT * 1.2 + 3.0) * 0.1 + 0.9,
    },
    {
      x: width * 0.8 + Math.sin(slowT * 0.5 + 1.8) * width * 0.1,
      y: height * 0.75 + Math.cos(slowT * 0.7 + 0.3) * height * 0.1,
      r: 170 + Math.cos(slowT * 1.3 + 1.8) * 35,
      color1: 'rgba(30,80,255,0.85)',
      color2: 'rgba(30,80,255,0.0)',
      pulse: Math.sin(slowT * 1.5 + 1.0) * 0.1 + 0.9,
    },
  ];

  const particles: Array<{ cx: number; cy: number; r: number; c: string; op: number }> = [];
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2 + slowT * (i % 2 === 0 ? 0.3 : -0.25) + i * 0.4;
    const dist = (80 + (i % 5) * 60) + Math.sin(slowT * 1.2 + i) * 30;
    const baseX = i < 30 ? orbs[0].x : orbs[1].x;
    const baseY = i < 30 ? orbs[0].y : orbs[1].y;
    const cx = baseX + Math.cos(angle) * dist;
    const cy = baseY + Math.sin(angle) * dist;
    const isMagenta = i % 3 !== 0;
    const c = isMagenta ? `rgba(255,0,${180 + (i % 3) * 25},` : `rgba(0,${100 + (i % 4) * 20},255,`;
    const op = (0.3 + Math.sin(slowT * 2 + i * 0.5) * 0.2) * opacity;
    particles.push({ cx, cy, r: 2 + (i % 4), c, op });
  }

  const numStreaks = 14;
  const streaks = Array.from({ length: numStreaks }, (_, i) => {
    const progress = ((frame * 0.4 + i * (durationInFrames / numStreaks)) % durationInFrames) / durationInFrames;
    const startOrb = orbs[i % 2];
    const endOrb = orbs[(i % 2) + 2];
    const x = interpolate(progress, [0, 1], [startOrb.x, endOrb.x]);
    const y = interpolate(progress, [0, 1], [startOrb.y, endOrb.y]);
    const isMag = i % 2 === 0;
    return { x, y, isMag, progress };
  });

  return (
    <div style={{ width, height, background: '#050308', overflow: 'hidden', position: 'relative', opacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {orbs.map((orb, i) => (
            <radialGradient key={`grad-${i}`} id={`grad-${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={orb.color1} />
              <stop offset="55%" stopColor={orb.color1.replace('0.9', '0.35').replace('0.85', '0.3').replace('0.8', '0.25')} />
              <stop offset="100%" stopColor={orb.color2} />
            </radialGradient>
          ))}
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(180,0,255,0.6)" />
            <stop offset="50%" stopColor="rgba(100,0,200,0.2)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <filter id="blur-heavy">
            <feGaussianBlur stdDeviation="28" />
          </filter>
          <filter id="blur-mid">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <filter id="blur-light">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="16" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Deep background ambient */}
        <ellipse
          cx={width / 2 + Math.sin(slowT * 0.2) * 80}
          cy={height / 2 + Math.cos(slowT * 0.15) * 60}
          rx={width * 0.6}
          ry={height * 0.55}
          fill="url(#centerGlow)"
          filter="url(#blur-heavy)"
          opacity={0.4}
        />

        {/* Main orb blobs - heavy blur layer */}
        {orbs.map((orb, i) => (
          <ellipse
            key={`blob-heavy-${i}`}
            cx={orb.x}
            cy={orb.y}
            rx={orb.r * orb.pulse * 1.4}
            ry={orb.r * orb.pulse * 1.1}
            fill={`url(#grad-${i})`}
            filter="url(#blur-heavy)"
            opacity={0.65}
          />
        ))}

        {/* Main orb blobs - mid blur layer */}
        {orbs.map((orb, i) => (
          <ellipse
            key={`blob-mid-${i}`}
            cx={orb.x}
            cy={orb.y}
            rx={orb.r * orb.pulse}
            ry={orb.r * orb.pulse * 0.85}
            fill={`url(#grad-${i})`}
            filter="url(#blur-mid)"
            opacity={0.8}
          />
        ))}

        {/* Core bright centers */}
        {orbs.map((orb, i) => (
          <ellipse
            key={`core-${i}`}
            cx={orb.x}
            cy={orb.y}
            rx={orb.r * 0.22 * orb.pulse}
            ry={orb.r * 0.22 * orb.pulse}
            fill={orb.color1}
            filter="url(#glow-strong)"
            opacity={0.95}
          />
        ))}

        {/* Streak trails between orbs */}
        {streaks.map((s, i) => (
          <circle
            key={`streak-${i}`}
            cx={s.x}
            cy={s.y}
            r={6 + (i % 3) * 3}
            fill={s.isMag ? 'rgba(255,0,200,0.7)' : 'rgba(0,120,255,0.7)'}
            filter="url(#blur-mid)"
            opacity={interpolate(s.progress, [0, 0.1, 0.9, 1], [0, 0.8, 0.8, 0])}
          />
        ))}

        {/* Floating particles */}
        {particles.map((p, i) => (
          <circle
            key={`particle-${i}`}
            cx={p.cx}
            cy={p.cy}
            r={p.r}
            fill={`${p.c}${p.op})`}
            filter="url(#blur-light)"
          />
        ))}

        {/* Bleed connection lines */}
        {[
          { x1: orbs[0].x, y1: orbs[0].y, x2: orbs[1].x, y2: orbs[1].y, c1: 'rgba(255,0,200', c2: 'rgba(0,120,255' },
          { x1: orbs[2].x, y1: orbs[2].y, x2: orbs[3].x, y2: orbs[3].y, c1: 'rgba(200,0,255', c2: 'rgba(0,200,255' },
          { x1: orbs[4].x, y1: orbs[4].y, x2: orbs[5].x, y2: orbs[5].y, c1: 'rgba(255,20,180', c2: 'rgba(30,80,255' },
        ].map((line, i) => {
          const bleedId = `bleed-${i}`;
          const bleedOpacity = 0.18 + Math.sin(slowT * 0.7 + i) * 0.08;
          return (
            <g key={`bleed-group-${i}`}>
              <defs>
                <linearGradient id={bleedId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={`${line.c1},0.9)`} />
                  <stop offset="50%" stopColor={`rgba(200,50,255,0.6)`} />
                  <stop offset="100%" stopColor={`${line.c2},0.9)`} />
                </linearGradient>
              </defs>
              <line
                x1={line.x1} y1={line.y1}
                x2={line.x2} y2={line.y2}
                stroke={`url(#${bleedId})`}
                strokeWidth={22}
                strokeLinecap="round"
                filter="url(#blur-mid)"
                opacity={bleedOpacity}
              />
              <line
                x1={line.x1} y1={line.y1}
                x2={line.x2} y2={line.y2}
                stroke={`url(#${bleedId})`}
                strokeWidth={4}
                strokeLinecap="round"
                filter="url(#blur-light)"
                opacity={bleedOpacity * 1.8}
              />
            </g>
          );
        })}

        {/* Scanline flicker overlay */}
        {Array.from({ length: 8 }, (_, i) => {
          const scanY = ((frame * 1.8 + i * (height / 8)) % height);
          return (
            <rect
              key={`scan-${i}`}
              x={0}
              y={scanY}
              width={width}
              height={2}
              fill="rgba(255,255,255,0.015)"
            />
          );
        })}
      </svg>
    </div>
  );
};