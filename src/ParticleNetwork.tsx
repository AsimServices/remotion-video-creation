import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// ─── Config ───────────────────────────────────────────────────────────────────
const BG = '#05050f';
const N = 100;

// ─── Deterministic particle definitions (never changes between frames) ────────
const DEFS = Array.from({ length: N }, (_, i) => ({
  // Starting position (normalized 0-1)
  x0: (i * 137.508) % 1,
  y0: (i * 97.314) % 1,
  // Drift velocity (pixels/frame, will be scaled by width/height)
  vx: ((i * 23.719) % 1 - 0.5) * 0.0012,  // normalized; multiply by W at runtime
  vy: ((i * 41.371) % 1 - 0.5) * 0.0012,
  // Wobble (gentle sine-wave deviation on top of linear drift)
  wobbleAmpX: ((i * 17.391) % 1) * 0.018,
  wobbleAmpY: ((i * 29.173) % 1) * 0.018,
  wobbleFreq: 0.04 + (i % 9) * 0.008,
  // Appearance
  r: 1.5 + (i % 5) * 0.55,
  color:
    i % 11 === 0 ? '#c4b5fd'   // lavender
    : i % 7 === 0 ? '#67e8f9'  // cyan
    : i % 13 === 0 ? '#86efac' // green
    : i % 17 === 0 ? '#fca5a5' // soft red
    : '#d4d4d4',               // neutral
  glowing: i % 8 === 0,
  pulseOffset: (i * 0.37) % 1,
}));

export const ParticleNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();

  const CONNECT_DIST = W * 0.135; // ~260px at 1920
  const t = frame / fps; // seconds elapsed

  // Fade-in over first 40 frames
  const fadeIn = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: 'clamp' });

  // ── Compute positions ──────────────────────────────────────────────────────
  const pos = DEFS.map((p) => {
    const wx = p.wobbleAmpX * W * Math.sin(p.wobbleFreq * t * Math.PI * 2);
    const wy = p.wobbleAmpY * H * Math.cos(p.wobbleFreq * t * Math.PI * 2 * 0.7);
    const x = ((p.x0 * W + p.vx * W * frame + wx) % W + W) % W;
    const y = ((p.y0 * H + p.vy * H * frame + wy) % H + H) % H;
    return { x, y };
  });

  // ── Build connection list ─────────────────────────────────────────────────
  const lines: { x1: number; y1: number; x2: number; y2: number; alpha: number }[] = [];
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const dx = pos[i].x - pos[j].x;
      const dy = pos[i].y - pos[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONNECT_DIST) {
        lines.push({
          x1: pos[i].x, y1: pos[i].y,
          x2: pos[j].x, y2: pos[j].y,
          alpha: (1 - dist / CONNECT_DIST) * 0.55,
        });
      }
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: fadeIn }}>
      <svg width={W} height={H} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {/* Soft glow filter for glowing dots */}
          <filter id="dotGlow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Subtle overall scene glow */}
          <filter id="sceneBloom" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        <g filter="url(#sceneBloom)">
          {lines.map((ln, i) => (
            <line
              key={i}
              x1={ln.x1} y1={ln.y1}
              x2={ln.x2} y2={ln.y2}
              stroke="white"
              strokeWidth={0.7}
              opacity={ln.alpha}
            />
          ))}
        </g>

        {/* Dots */}
        {DEFS.map((p, i) => {
          const { x, y } = pos[i];
          const pulse = 0.75 + 0.25 * Math.sin((t * (0.5 + p.pulseOffset * 0.8) + p.pulseOffset) * Math.PI * 2);
          const r = p.r * (p.glowing ? pulse : 1);

          return (
            <g key={i} filter={p.glowing ? 'url(#dotGlow)' : undefined}>
              {/* Halo for glowing dots */}
              {p.glowing && (
                <circle cx={x} cy={y} r={r * 3.5} fill={p.color} opacity={0.08 * pulse} />
              )}
              <circle cx={x} cy={y} r={r} fill={p.color} opacity={p.glowing ? 0.95 : 0.75} />
            </g>
          );
        })}
      </svg>

      {/* Very subtle radial vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)',
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};
