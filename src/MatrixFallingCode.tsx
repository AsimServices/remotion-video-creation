import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()アイウエオカキクケコサシスセソタチツテトナニヌネノ';

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function getChar(seed: number): string {
  const idx = Math.floor(seededRandom(seed) * CHARS.length);
  return CHARS[idx];
}

export const MatrixFallingCode: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const colWidth = 22;
  const numCols = Math.ceil(width / colWidth);
  const charHeight = 22;
  const numRows = Math.ceil(height / charHeight) + 20;

  const columns = Array.from({ length: numCols }, (_, colIdx) => {
    const colSeed = colIdx * 1000;
    const speed = 0.3 + seededRandom(colSeed + 1) * 0.7;
    const offset = seededRandom(colSeed + 2) * durationInFrames;
    const trailLength = 8 + Math.floor(seededRandom(colSeed + 3) * 16);
    const startDelay = seededRandom(colSeed + 4) * 40;

    const adjustedFrame = frame - startDelay;
    const headRow = ((adjustedFrame * speed + offset) % (numRows + trailLength)) - trailLength;

    const chars = Array.from({ length: trailLength + 2 }, (_, rowOffset) => {
      const row = Math.floor(headRow) - rowOffset;
      if (row < 0 || row >= numRows) return null;
      const charSeed = colIdx * 100000 + row * 17 + Math.floor(frame / 4);
      const c = getChar(charSeed);
      return { row, char: c, offset: rowOffset };
    });

    return { colIdx, chars, trailLength };
  });

  return (
    <div
      style={{
        width,
        height,
        background: '#000000',
        overflow: 'hidden',
        position: 'relative',
        opacity,
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: '16px',
        fontWeight: 'bold',
      }}
    >
      {/* Scanline overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,200,0.015) 2px, rgba(0,255,200,0.015) 4px)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* Glow vignette */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none',
          zIndex: 9,
        }}
      />

      {columns.map(({ colIdx, chars, trailLength }) =>
        chars.map((item) => {
          if (!item) return null;
          const { row, char, offset } = item;
          const isHead = offset === 0;
          const isNearHead = offset <= 2;

          let color: string;
          let textShadow: string;
          let alpha: number;

          if (isHead) {
            color = '#ffffff';
            textShadow = '0 0 8px #00ffcc, 0 0 16px #00ffcc, 0 0 32px #00ffcc';
            alpha = 1;
          } else if (isNearHead) {
            const t = offset / 2;
            const g = Math.floor(interpolate(t, [0, 1], [255, 180]));
            color = `rgb(0, ${g}, 180)`;
            textShadow = '0 0 6px #00ffaa, 0 0 12px #00cc88';
            alpha = 1;
          } else {
            const t = offset / trailLength;
            alpha = interpolate(t, [0, 1], [0.9, 0.05]);
            const g = Math.floor(interpolate(t, [0, 1], [220, 80]));
            color = `rgba(0, ${g}, 120, ${alpha})`;
            textShadow = alpha > 0.4 ? '0 0 4px #00ff88' : 'none';
          }

          return (
            <span
              key={`${colIdx}-${row}`}
              style={{
                position: 'absolute',
                left: colIdx * colWidth,
                top: row * charHeight,
                width: colWidth,
                height: charHeight,
                color,
                textShadow,
                opacity: alpha,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
                lineHeight: 1,
              }}
            >
              {char}
            </span>
          );
        })
      )}
    </div>
  );
};