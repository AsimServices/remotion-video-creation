import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NUM_COLUMNS = 48;
const CHARS_PER_COLUMN = 36;
const FONT_SIZE = 22;
const CHAR_HEIGHT = 28;

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}

function getBit(col: number, row: number, offset: number): string {
  const val = seededRandom(col * 1000 + row + offset * 0.01);
  return val > 0.5 ? '1' : '0';
}

export const BinaryCodeColumns: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const colWidth = width / NUM_COLUMNS;

  const streakCols = [3, 8, 15, 22, 29, 37, 44];
  const streakColors = ['#00ffcc', '#00aaff', '#ff00ff', '#00ff88', '#ff6600', '#00ffff', '#ff0099'];

  return (
    <div
      style={{
        width,
        height,
        background: '#050508',
        overflow: 'hidden',
        position: 'relative',
        opacity,
      }}
    >
      {/* Background glow layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(0,255,100,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {Array.from({ length: NUM_COLUMNS }).map((_, col) => {
        const speed = 0.6 + seededRandom(col * 77) * 1.2;
        const phaseOffset = seededRandom(col * 33) * CHARS_PER_COLUMN;
        const scrollOffset = (frame * speed + phaseOffset) % CHARS_PER_COLUMN;

        const isStreakCol = streakCols.includes(col);
        const streakIndex = streakCols.indexOf(col);

        const streakSpeed = 1.4 + seededRandom(col * 55) * 2.0;
        const streakPhase = seededRandom(col * 99) * CHARS_PER_COLUMN * 2;
        const streakProgress = ((frame * streakSpeed + streakPhase) % (CHARS_PER_COLUMN * 1.8)) / CHARS_PER_COLUMN;
        const streakHeadRow = streakProgress * CHARS_PER_COLUMN;
        const streakLength = 10 + seededRandom(col * 44) * 8;
        const streakColor = isStreakCol ? streakColors[streakIndex] : '#39ff14';

        const x = col * colWidth + colWidth / 2;

        return (
          <div
            key={col}
            style={{
              position: 'absolute',
              left: x - colWidth / 2,
              top: 0,
              width: colWidth,
              height: height + CHAR_HEIGHT,
              overflow: 'hidden',
            }}
          >
            {Array.from({ length: CHARS_PER_COLUMN + 2 }).map((_, row) => {
              const yPos = (row - scrollOffset + CHARS_PER_COLUMN) % CHARS_PER_COLUMN;
              const screenY = yPos * CHAR_HEIGHT - CHAR_HEIGHT;

              const distFromHead = streakHeadRow - row;
              const inStreak = distFromHead >= 0 && distFromHead < streakLength;

              let charColor = '#1a4d1a';
              let charOpacity = 0.35 + seededRandom(col * 100 + row) * 0.25;
              let charGlow = 'none';
              let fontWeight = '400';
              let charScale = 1;

              if (inStreak) {
                const t = 1 - distFromHead / streakLength;
                if (distFromHead < 1) {
                  charColor = '#ffffff';
                  charOpacity = 1;
                  charGlow = `0 0 12px #fff, 0 0 24px ${streakColor}, 0 0 40px ${streakColor}`;
                  fontWeight = '700';
                  charScale = 1.15;
                } else {
                  const alpha = Math.pow(t, 0.6);
                  charColor = streakColor;
                  charOpacity = alpha * 0.9 + 0.1;
                  charGlow = `0 0 ${6 + alpha * 12}px ${streakColor}, 0 0 ${14 + alpha * 20}px ${streakColor}80`;
                  fontWeight = alpha > 0.5 ? '600' : '400';
                  charScale = 1 + alpha * 0.08;
                }
              } else if (isStreakCol) {
                charColor = '#22aa44';
                charOpacity = 0.5 + seededRandom(col * 200 + row) * 0.2;
              }

              const bitChar = getBit(col, row, frame * 0.3 + col);

              return (
                <div
                  key={row}
                  style={{
                    position: 'absolute',
                    top: screenY,
                    left: 0,
                    width: colWidth,
                    height: CHAR_HEIGHT,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: FONT_SIZE * charScale,
                    fontFamily: 'monospace',
                    fontWeight,
                    color: charColor,
                    opacity: charOpacity,
                    textShadow: charGlow,
                    userSelect: 'none',
                    transform: charScale !== 1 ? `scale(${charScale})` : undefined,
                    transition: 'none',
                  }}
                >
                  {bitChar}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Scanline overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 3px,
            rgba(0,0,0,0.08) 3px,
            rgba(0,0,0,0.08) 4px
          )`,
          pointerEvents: 'none',
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};