import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// ─── Constants ────────────────────────────────────────────────────────────────
const BG = '#03040c';
const HEX_RADIUS = 40;   // px at 1920-wide; scales with resolution
const RIPPLE_SPEED = 2.8;   // px per frame
const MAX_RADIUS = 750;     // px before fully faded
const FRONT_SIGMA = 52;     // sharpness of the bright leading ring
const TRAIL_SIGMA = 130;    // softness of the trailing inner glow

// ─── Ripple emitters: (nx, ny) normalized position, period (frames), phase ───
const SOURCES = [
  { nx: 0.18, ny: 0.32, period: 185, phase: -22  },
  { nx: 0.74, ny: 0.62, period: 215, phase: -88  },
  { nx: 0.50, ny: 0.14, period: 245, phase: -148 },
  { nx: 0.88, ny: 0.40, period: 198, phase: -58  },
  { nx: 0.14, ny: 0.74, period: 228, phase: -115 },
  { nx: 0.62, ny: 0.90, period: 258, phase: -178 },
  { nx: 0.38, ny: 0.55, period: 270, phase: -40  },
];

// ─── Pointy-top hexagon vertices ─────────────────────────────────────────────
function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
}

// ─── Build hex grid ───────────────────────────────────────────────────────────
interface Hex { cx: number; cy: number }

function buildGrid(W: number, H: number, r: number): Hex[] {
  const cw = Math.sqrt(3) * r;   // column width
  const rh = 1.5 * r;            // row height
  const cols = Math.ceil(W / cw) + 2;
  const rows = Math.ceil(H / rh) + 2;
  const out: Hex[] = [];
  for (let row = -1; row < rows; row++) {
    const offset = row % 2 !== 0 ? cw / 2 : 0;
    for (let col = -1; col < cols; col++) {
      out.push({ cx: col * cw + offset, cy: row * rh });
    }
  }
  return out;
}

// ─── Main composition ─────────────────────────────────────────────────────────
export const HoneycombRipple: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();

  const r = HEX_RADIUS * (W / 1920);
  const hexes = buildGrid(W, H, r);
  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });

  // ── Compute active ripples ──────────────────────────────────────────────────
  const ripples: { x: number; y: number; radius: number; fade: number }[] = [];
  for (const src of SOURCES) {
    const sx = src.nx * W;
    const sy = src.ny * H;
    for (let t = src.phase; t <= frame; t += src.period) {
      const age = frame - t;
      const radius = age * RIPPLE_SPEED;
      if (radius < MAX_RADIUS + TRAIL_SIGMA * 2) {
        ripples.push({ x: sx, y: sy, radius, fade: Math.max(0, 1 - radius / MAX_RADIUS) });
      }
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: fadeIn }}>
      <svg width={W} height={H} style={{ display: 'block' }}>
        <defs>
          {/*
            One shared bloom filter: applied to a <g> wrapping ALL hexes.
            feGaussianBlur creates a soft halo around bright hex edges,
            then feComposite adds original on top so edges stay sharp.
          */}
          <filter id="bloom" x="-8%" y="-8%" width="116%" height="116%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* All hexagons in one filtered group for a single bloom pass */}
        <g filter="url(#bloom)">
          {hexes.map(({ cx, cy }, idx) => {
            // ── Compute activation from all ripples ──────────────────────────
            let maxA = 0;

            for (const rp of ripples) {
              const dx = cx - rp.x;
              const dy = cy - rp.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const delta = dist - rp.radius;

              // Bright leading ring (peaks at delta=0, slightly asymmetric)
              const frontA = Math.exp(-(delta * delta) / (2 * FRONT_SIGMA * FRONT_SIGMA));

              // Soft trailing glow inside the already-passed zone
              const trailA = delta < -10
                ? Math.exp(-((delta + 10) ** 2) / (2 * TRAIL_SIGMA * TRAIL_SIGMA)) * 0.28
                : 0;

              const a = (frontA + trailA) * rp.fade;
              if (a > maxA) maxA = a;
            }

            const a = Math.min(1, maxA);

            // ── Derive colors ──────────────────────────────────────────────
            // Stroke: dim navy (#19294f) → bright cyan (#28c8ff)
            const sR = Math.round(25  + a * 15);
            const sG = Math.round(41  + a * 159);
            const sB = Math.round(79  + a * 176);
            const sOp = (0.2 + a * 0.72).toFixed(3);

            // Fill: near-black with slight blue → soft medium blue
            const fR = Math.round(4   + a * 10);
            const fG = Math.round(8   + a * 62);
            const fB = Math.round(20  + a * 148);
            const fOp = (0.35 + a * 0.18).toFixed(3);

            // Bloom halo fill (larger hex, very low opacity) — only when active
            const bloomed = a > 0.08;

            return (
              <g key={idx}>
                {/* Bloom halo: fills the full hex cell for a diffuse glow */}
                {bloomed && (
                  <polygon
                    points={hexPoints(cx, cy, r)}
                    fill={`rgba(10,130,230,${(a * 0.13).toFixed(3)})`}
                    stroke="none"
                  />
                )}

                {/* Main hex body: slightly inset for visible gap between cells */}
                <polygon
                  points={hexPoints(cx, cy, r * 0.91)}
                  fill={`rgba(${fR},${fG},${fB},${fOp})`}
                  stroke={`rgba(${sR},${sG},${sB},${sOp})`}
                  strokeWidth={1}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Radial vignette — darkens edges to keep focus central */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(0,0,0,0.65) 100%)',
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};
