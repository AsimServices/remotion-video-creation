import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const WatercolorBlobs: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const t = frame / durationInFrames;

  const blobs = [
    {
      cx: width * (0.2 + 0.15 * Math.sin(t * Math.PI * 2 * 0.7 + 0.0)),
      cy: height * (0.3 + 0.12 * Math.cos(t * Math.PI * 2 * 0.5 + 1.0)),
      rx: 260 + 80 * Math.sin(t * Math.PI * 2 * 1.1 + 0.5),
      ry: 200 + 70 * Math.cos(t * Math.PI * 2 * 0.9 + 0.2),
      rot: 30 * Math.sin(t * Math.PI * 2 * 0.6),
      color: 'rgba(255, 182, 193, 0.18)',
      blur: 60 + 20 * Math.sin(t * Math.PI * 2 * 0.8),
    },
    {
      cx: width * (0.75 + 0.12 * Math.cos(t * Math.PI * 2 * 0.6 + 2.0)),
      cy: height * (0.25 + 0.10 * Math.sin(t * Math.PI * 2 * 0.7 + 0.5)),
      rx: 220 + 90 * Math.cos(t * Math.PI * 2 * 1.3 + 1.0),
      ry: 180 + 60 * Math.sin(t * Math.PI * 2 * 0.8 + 0.8),
      rot: -20 * Math.cos(t * Math.PI * 2 * 0.5),
      color: 'rgba(173, 216, 230, 0.18)',
      blur: 55 + 25 * Math.cos(t * Math.PI * 2 * 0.7),
    },
    {
      cx: width * (0.5 + 0.18 * Math.sin(t * Math.PI * 2 * 0.4 + 1.5)),
      cy: height * (0.6 + 0.13 * Math.cos(t * Math.PI * 2 * 0.55 + 2.0)),
      rx: 300 + 100 * Math.sin(t * Math.PI * 2 * 0.9 + 2.0),
      ry: 230 + 80 * Math.cos(t * Math.PI * 2 * 1.1 + 0.3),
      rot: 15 * Math.sin(t * Math.PI * 2 * 0.75),
      color: 'rgba(216, 191, 216, 0.17)',
      blur: 70 + 30 * Math.sin(t * Math.PI * 2 * 0.65),
    },
    {
      cx: width * (0.3 + 0.14 * Math.cos(t * Math.PI * 2 * 0.55 + 3.0)),
      cy: height * (0.7 + 0.11 * Math.sin(t * Math.PI * 2 * 0.45 + 1.2)),
      rx: 200 + 70 * Math.cos(t * Math.PI * 2 * 1.2 + 0.7),
      ry: 160 + 55 * Math.sin(t * Math.PI * 2 * 0.85 + 1.5),
      rot: -25 * Math.sin(t * Math.PI * 2 * 0.65),
      color: 'rgba(255, 218, 185, 0.17)',
      blur: 50 + 20 * Math.cos(t * Math.PI * 2 * 0.9),
    },
    {
      cx: width * (0.82 + 0.10 * Math.sin(t * Math.PI * 2 * 0.65 + 0.8)),
      cy: height * (0.68 + 0.12 * Math.cos(t * Math.PI * 2 * 0.5 + 2.5)),
      rx: 240 + 85 * Math.sin(t * Math.PI * 2 * 0.75 + 1.3),
      ry: 190 + 65 * Math.cos(t * Math.PI * 2 * 1.0 + 0.6),
      rot: 40 * Math.cos(t * Math.PI * 2 * 0.55),
      color: 'rgba(144, 238, 144, 0.13)',
      blur: 65 + 25 * Math.sin(t * Math.PI * 2 * 0.8),
    },
    {
      cx: width * (0.55 + 0.16 * Math.cos(t * Math.PI * 2 * 0.35 + 0.4)),
      cy: height * (0.45 + 0.14 * Math.sin(t * Math.PI * 2 * 0.6 + 3.2)),
      rx: 180 + 75 * Math.cos(t * Math.PI * 2 * 1.4 + 2.1),
      ry: 150 + 50 * Math.sin(t * Math.PI * 2 * 0.7 + 1.8),
      rot: -35 * Math.sin(t * Math.PI * 2 * 0.45),
      color: 'rgba(255, 160, 122, 0.14)',
      blur: 58 + 22 * Math.cos(t * Math.PI * 2 * 1.1),
    },
    {
      cx: width * (0.15 + 0.09 * Math.sin(t * Math.PI * 2 * 0.8 + 2.2)),
      cy: height * (0.5 + 0.10 * Math.cos(t * Math.PI * 2 * 0.65 + 0.9)),
      rx: 160 + 60 * Math.sin(t * Math.PI * 2 * 1.05 + 1.6),
      ry: 130 + 45 * Math.cos(t * Math.PI * 2 * 0.95 + 0.4),
      rot: 20 * Math.cos(t * Math.PI * 2 * 0.7),
      color: 'rgba(135, 206, 250, 0.15)',
      blur: 48 + 18 * Math.sin(t * Math.PI * 2 * 0.75),
    },
    {
      cx: width * (0.65 + 0.13 * Math.cos(t * Math.PI * 2 * 0.45 + 1.7)),
      cy: height * (0.85 + 0.08 * Math.sin(t * Math.PI * 2 * 0.55 + 2.8)),
      rx: 270 + 95 * Math.cos(t * Math.PI * 2 * 0.85 + 0.1),
      ry: 210 + 75 * Math.sin(t * Math.PI * 2 * 1.15 + 1.0),
      rot: -10 * Math.sin(t * Math.PI * 2 * 0.6),
      color: 'rgba(221, 160, 221, 0.16)',
      blur: 72 + 28 * Math.cos(t * Math.PI * 2 * 0.6),
    },
  ];

  const layeredBlobs = [
    ...blobs,
    {
      cx: width * (0.5 + 0.20 * Math.sin(t * Math.PI * 2 * 0.3 + 0.6)),
      cy: height * (0.5 + 0.15 * Math.cos(t * Math.PI * 2 * 0.35 + 1.4)),
      rx: 350 + 120 * Math.sin(t * Math.PI * 2 * 0.5 + 0.9),
      ry: 280 + 100 * Math.cos(t * Math.PI * 2 * 0.55 + 2.2),
      rot: 50 * Math.cos(t * Math.PI * 2 * 0.4),
      color: 'rgba(255, 228, 225, 0.08)',
      blur: 90 + 40 * Math.sin(t * Math.PI * 2 * 0.5),
    },
  ];

  return (
    <div
      style={{
        width,
        height,
        background: '#0a0a0f',
        position: 'relative',
        overflow: 'hidden',
        opacity,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {layeredBlobs.map((blob, i) => (
            <filter key={`blur-${i}`} id={`blur-${i}`} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation={blob.blur} />
            </filter>
          ))}
          {layeredBlobs.map((blob, i) => {
            const turbFreq = 0.004 + i * 0.001;
            const turbOctaves = 3;
            const displacementScale = 80 + i * 10;
            return (
              <filter key={`distort-${i}`} id={`distort-${i}`} x="-80%" y="-80%" width="260%" height="260%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency={`${turbFreq + 0.001 * Math.sin(t * Math.PI * 2 * 0.3 + i)} ${turbFreq + 0.001 * Math.cos(t * Math.PI * 2 * 0.25 + i)}`}
                  numOctaves={turbOctaves}
                  seed={i * 3 + Math.floor(t * 10)}
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale={displacementScale * (0.8 + 0.4 * Math.sin(t * Math.PI * 2 * 0.4 + i * 0.7))}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            );
          })}
        </defs>

        {layeredBlobs.map((blob, i) => {
          const dissolveOpacity =
            0.7 + 0.3 * Math.sin(t * Math.PI * 2 * (0.3 + i * 0.07) + i * 1.1);
          return (
            <ellipse
              key={`blob-${i}`}
              cx={blob.cx}
              cy={blob.cy}
              rx={blob.rx}
              ry={blob.ry}
              fill={blob.color}
              filter={`url(#distort-${i})`}
              opacity={dissolveOpacity}
              transform={`rotate(${blob.rot}, ${blob.cx}, ${blob.cy})`}
              style={{ mixBlendMode: 'screen' }}
            />
          );
        })}

        {layeredBlobs.map((blob, i) => {
          const glowOpacity =
            0.5 + 0.3 * Math.cos(t * Math.PI * 2 * (0.25 + i * 0.06) + i * 0.9);
          return (
            <ellipse
              key={`glow-${i}`}
              cx={blob.cx + 10 * Math.sin(t * Math.PI * 2 * 0.2 + i)}
              cy={blob.cy + 8 * Math.cos(t * Math.PI * 2 * 0.25 + i)}
              rx={blob.rx * 0.6}
              ry={blob.ry * 0.6}
              fill={blob.color.replace(/[\d.]+\)$/, '0.25)')}
              filter={`url(#blur-${i})`}
              opacity={glowOpacity}
              transform={`rotate(${blob.rot * 0.8}, ${blob.cx}, ${blob.cy})`}
              style={{ mixBlendMode: 'screen' }}
            />
          );
        })}
      </svg>

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse at ${50 + 10 * Math.sin(t * Math.PI * 2 * 0.15)}% ${50 + 8 * Math.cos(t * Math.PI * 2 * 0.12)}%, rgba(15,10,25,0) 30%, rgba(5,5,10,0.55) 100%)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};