import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const MoltenGoldLavaLamp: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const t = frame / 30;

  const blobs = [
    {
      id: 0,
      baseX: width * 0.3,
      baseY: height * 0.8,
      rx: 110,
      ry: 130,
      speedY: 0.18,
      phaseX: 0,
      phaseY: 0,
      ampX: 80,
      ampY: 350,
      color: '#FFD700',
    },
    {
      id: 1,
      baseX: width * 0.6,
      baseY: height * 0.75,
      rx: 90,
      ry: 110,
      speedY: 0.22,
      phaseX: 1.2,
      phaseY: 0.5,
      ampX: 60,
      ampY: 320,
      color: '#FFA500',
    },
    {
      id: 2,
      baseX: width * 0.45,
      baseY: height * 0.85,
      rx: 130,
      ry: 150,
      speedY: 0.14,
      phaseX: 2.4,
      phaseY: 1.1,
      ampX: 70,
      ampY: 380,
      color: '#FFB300',
    },
    {
      id: 3,
      baseX: width * 0.25,
      baseY: height * 0.9,
      rx: 80,
      ry: 95,
      speedY: 0.27,
      phaseX: 3.6,
      phaseY: 2.2,
      ampX: 50,
      ampY: 300,
      color: '#FFCC00',
    },
    {
      id: 4,
      baseX: width * 0.7,
      baseY: height * 0.8,
      rx: 100,
      ry: 120,
      speedY: 0.2,
      phaseX: 0.8,
      phaseY: 3.1,
      ampX: 90,
      ampY: 340,
      color: '#FF8C00',
    },
    {
      id: 5,
      baseX: width * 0.5,
      baseY: height * 0.7,
      rx: 70,
      ry: 85,
      speedY: 0.3,
      phaseX: 4.2,
      phaseY: 1.7,
      ampX: 55,
      ampY: 290,
      color: '#FFD040',
    },
    {
      id: 6,
      baseX: width * 0.38,
      baseY: height * 0.95,
      rx: 150,
      ry: 160,
      speedY: 0.1,
      phaseX: 5.0,
      phaseY: 0.3,
      ampX: 100,
      ampY: 400,
      color: '#FFC200',
    },
    {
      id: 7,
      baseX: width * 0.62,
      baseY: height * 0.88,
      rx: 85,
      ry: 100,
      speedY: 0.25,
      phaseX: 2.0,
      phaseY: 4.2,
      ampX: 65,
      ampY: 310,
      color: '#FFE066',
    },
  ];

  const computedBlobs = blobs.map((b) => {
    const cycleT = (t * b.speedY + b.phaseY) % (2 * Math.PI * 2);
    const rise = (cycleT / (2 * Math.PI)) % 1;
    const cx = b.baseX + b.ampX * Math.sin(t * 0.4 + b.phaseX);
    const cy = b.baseY - rise * b.ampY + 60 * Math.sin(t * 0.6 + b.phaseX);
    const squeeze = 1 + 0.15 * Math.sin(t * 1.2 + b.id);
    const rx = b.rx * (1 / squeeze);
    const ry = b.ry * squeeze;
    return { ...b, cx, cy, rx, ry };
  });

  const gradientId = (id: number) => `blobGrad${id}`;
  const glowId = (id: number) => `glow${id}`;

  return (
    <div
      style={{
        width,
        height,
        background: '#0a0600',
        overflow: 'hidden',
        opacity: globalOpacity,
        position: 'relative',
      }}
    >
      {/* Background warm glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 100%, rgba(180,80,0,0.35) 0%, rgba(10,6,0,0) 70%)`,
        }}
      />
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          {computedBlobs.map((b) => (
            <radialGradient
              key={gradientId(b.id)}
              id={gradientId(b.id)}
              cx="40%"
              cy="35%"
              r="60%"
            >
              <stop offset="0%" stopColor="#FFF5C0" stopOpacity="1" />
              <stop offset="35%" stopColor={b.color} stopOpacity="1" />
              <stop offset="100%" stopColor="#8B4500" stopOpacity="0.9" />
            </radialGradient>
          ))}
          {computedBlobs.map((b) => (
            <filter key={glowId(b.id)} id={glowId(b.id)} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="18" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          ))}
          <filter id="masterBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <filter id="blobMerge" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="28" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -10"
              result="merged"
            />
          </filter>
          <filter id="shineFilter">
            <feGaussianBlur stdDeviation="6" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* Ambient glow layer */}
        <g filter="url(#masterBlur)" opacity="0.5">
          {computedBlobs.map((b) => (
            <ellipse
              key={`glow-${b.id}`}
              cx={b.cx}
              cy={b.cy}
              rx={b.rx * 1.8}
              ry={b.ry * 1.8}
              fill={b.color}
              opacity="0.3"
            />
          ))}
        </g>

        {/* Main metaball group with merge effect */}
        <g filter="url(#blobMerge)">
          {computedBlobs.map((b) => (
            <ellipse
              key={`blob-${b.id}`}
              cx={b.cx}
              cy={b.cy}
              rx={b.rx}
              ry={b.ry}
              fill={`url(#${gradientId(b.id)})`}
            />
          ))}
        </g>

        {/* Highlight specular dots */}
        {computedBlobs.map((b) => (
          <ellipse
            key={`shine-${b.id}`}
            cx={b.cx - b.rx * 0.25}
            cy={b.cy - b.ry * 0.3}
            rx={b.rx * 0.25}
            ry={b.ry * 0.18}
            fill="rgba(255,255,220,0.55)"
            filter="url(#shineFilter)"
          />
        ))}

        {/* Bottom pool */}
        <ellipse
          cx={width / 2}
          cy={height - 60}
          rx={width * 0.38}
          ry={80 + 20 * Math.sin(t * 0.3)}
          fill="url(#blobGrad6)"
          opacity="0.85"
          filter="url(#blobMerge)"
        />

        {/* Rim highlight at bottom */}
        <ellipse
          cx={width / 2}
          cy={height - 55}
          rx={width * 0.36}
          ry={30}
          fill="rgba(255,220,50,0.18)"
          filter="url(#shineFilter)"
        />
      </svg>

      {/* Top vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.6) 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Side vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.7) 100%)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};