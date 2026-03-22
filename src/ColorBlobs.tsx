import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// ─── Blob definitions ─────────────────────────────────────────────────────────
// Each blob has an independent Lissajous-like drift path

interface BlobDef {
  // base position [0..1] normalised to canvas
  bx: number;
  by: number;
  // drift radii in px
  rx: number;
  ry: number;
  // drift frequencies (cycles per 20s video)
  fx: number;
  fy: number;
  // phase offsets
  phx: number;
  phy: number;
  // size
  radiusX: number;
  radiusY: number;
  // color (CSS gradient stops)
  color: string;
  opacity: number;
  blur: number;
  // gentle scale breathe
  breatheAmp: number;
  breatheFreq: number;
  breathePhase: number;
}

const BLOBS: BlobDef[] = [
  // ── Blob 1 – large warm magenta, drifts upper-left ──────────────────────────
  {
    bx: 0.28, by: 0.35,
    rx: 340, ry: 220,
    fx: 0.18, fy: 0.13,
    phx: 0, phy: 0.8,
    radiusX: 520, radiusY: 480,
    color: '#e040fb',
    opacity: 0.55,
    blur: 120,
    breatheAmp: 0.07, breatheFreq: 0.22, breathePhase: 0,
  },
  // ── Blob 2 – large deep blue, drifts lower-right ────────────────────────────
  {
    bx: 0.72, by: 0.65,
    rx: 300, ry: 260,
    fx: 0.14, fy: 0.20,
    phx: 1.6, phy: 0.3,
    radiusX: 580, radiusY: 520,
    color: '#1565c0',
    opacity: 0.60,
    blur: 140,
    breatheAmp: 0.06, breatheFreq: 0.18, breathePhase: 1.1,
  },
  // ── Blob 3 – vibrant teal-cyan, centre ──────────────────────────────────────
  {
    bx: 0.50, by: 0.50,
    rx: 260, ry: 300,
    fx: 0.22, fy: 0.16,
    phx: 3.1, phy: 1.9,
    radiusX: 460, radiusY: 430,
    color: '#00bcd4',
    opacity: 0.48,
    blur: 110,
    breatheAmp: 0.08, breatheFreq: 0.26, breathePhase: 2.3,
  },
  // ── Blob 4 – amber-orange, lower-left ───────────────────────────────────────
  {
    bx: 0.22, by: 0.70,
    rx: 280, ry: 200,
    fx: 0.16, fy: 0.24,
    phx: 4.7, phy: 2.6,
    radiusX: 500, radiusY: 440,
    color: '#ff6f00',
    opacity: 0.42,
    blur: 130,
    breatheAmp: 0.05, breatheFreq: 0.20, breathePhase: 3.8,
  },
];

// ─── Main component ───────────────────────────────────────────────────────────

export const ColorBlobs: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const t = frame / durationInFrames; // 0 → 1

  const masterOpacity = interpolate(
    frame,
    [0, 60, durationInFrames - 60, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        width,
        height,
        overflow: 'hidden',
        position: 'relative',
        background: '#08060f',
      }}
    >
      {/* Render each blob as an absolutely positioned div with radial gradient + blur */}
      {BLOBS.map((b, i) => {
        const cx =
          b.bx * width +
          b.rx * Math.sin(t * Math.PI * 2 * b.fx + b.phx);
        const cy =
          b.by * height +
          b.ry * Math.cos(t * Math.PI * 2 * b.fy + b.phy);

        const breathe =
          1 + b.breatheAmp * Math.sin(t * Math.PI * 2 * b.breatheFreq + b.breathePhase);

        const rX = b.radiusX * breathe;
        const rY = b.radiusY * breathe;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: cx - rX,
              top: cy - rY,
              width: rX * 2,
              height: rY * 2,
              borderRadius: '50%',
              background: `radial-gradient(ellipse at 50% 50%, ${b.color} 0%, transparent 70%)`,
              opacity: b.opacity * masterOpacity,
              filter: `blur(${b.blur}px)`,
              mixBlendMode: 'screen',
              willChange: 'transform',
            }}
          />
        );
      })}

      {/* Subtle dark vignette on top */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 85% 75% at 50% 50%, transparent 30%, rgba(4,3,10,0.65) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
