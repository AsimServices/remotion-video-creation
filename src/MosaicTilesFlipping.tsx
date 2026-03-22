import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

const COLS = 16;
const ROWS = 9;
const PHASE_DURATION = 80;  // frames per flip cycle
const STAGGER = 4;           // frames between each diagonal step
const GAP = 4;               // px gap between tiles

export const MosaicTilesFlipping: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const tileW = width / COLS;
  const tileH = height / ROWS;

  // Global fade in / fade out
  const globalOpacity = interpolate(
    frame,
    [0, 40, durationInFrames - 40, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: '#0d0d0d',
        position: 'relative',
        overflow: 'hidden',
        opacity: globalOpacity,
      }}
    >
      {[...Array(ROWS * COLS)].map((_, index) => {
        const row = Math.floor(index / COLS);
        const col = index % COLS;

        // Diagonal wave stagger: top-left tiles start first
        const tileDelay = (row + col) * STAGGER;
        const adjustedFrame = Math.max(0, frame - tileDelay);

        const phase = Math.floor(adjustedFrame / PHASE_DURATION);
        const phaseFrame = adjustedFrame % PHASE_DURATION;

        // Flip: 0° → 180° over first 65% of each phase, hold the rest
        const flipAngle = interpolate(
          phaseFrame,
          [0, PHASE_DURATION * 0.65],
          [0, 180],
          {
            extrapolateRight: 'clamp',
            easing: Easing.inOut(Easing.cubic),
          }
        );

        // Scale squish at the midpoint for depth feel
        const scaleY = interpolate(
          phaseFrame,
          [0, PHASE_DURATION * 0.325, PHASE_DURATION * 0.65],
          [1, 0.88, 1],
          { extrapolateRight: 'clamp' }
        );

        // Slight Z-axis tilt that alternates direction each phase
        const zTilt = interpolate(
          phaseFrame,
          [0, PHASE_DURATION * 0.325, PHASE_DURATION * 0.65],
          [0, (phase % 2 === 0 ? 1 : -1) * 4, 0],
          { extrapolateRight: 'clamp' }
        );

        // Unique hue offset per tile position
        const tileOffset = (row * 7 + col * 13) % 360;

        // Front face = current phase color, back face = next phase color
        const frontHue = (phase * 52 + tileOffset) % 360;
        const backHue = ((phase + 1) * 52 + tileOffset) % 360;

        const frontColor = `hsl(${frontHue}, 88%, 52%)`;
        const backColor = `hsl(${backHue}, 88%, 52%)`;

        // Subtle brightness boost at the flip midpoint (edge-on flash)
        const edgeBrightness = interpolate(
          phaseFrame,
          [0, PHASE_DURATION * 0.28, PHASE_DURATION * 0.35, PHASE_DURATION * 0.65],
          [1, 1.4, 1.4, 1],
          { extrapolateRight: 'clamp' }
        );

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: row * tileH + GAP / 2,
              left: col * tileW + GAP / 2,
              width: tileW - GAP,
              height: tileH - GAP,
              perspective: 600,
            }}
          >
            {/* 3D flip container */}
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transform: `rotateY(${flipAngle}deg) rotateZ(${zTilt}deg) scaleY(${scaleY})`,
                filter: `brightness(${edgeBrightness})`,
              }}
            >
              {/* Front face */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: frontColor,
                  backfaceVisibility: 'hidden',
                  borderRadius: 3,
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                }}
              />
              {/* Back face — rotated 180° so it faces forward when flipped */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: backColor,
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  borderRadius: 3,
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
