import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const MosaicFlipTiles: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const rows = 6;
  const cols = 8;
  const tileWidth = width / cols;
  const tileHeight = height / rows;

  const overallOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const tiles: React.ReactNode[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      const startOffset = index * 5; // stagger start
      const flipDuration = 30; // frames for flip
      const progress = frame - startOffset;

      const rotationY = interpolate(
        progress,
        [0, flipDuration],
        [0, 180],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );

      const rotationZ = interpolate(
        progress,
        [0, flipDuration / 2, flipDuration],
        [0, 10, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );

      const hue1 = (index * 40) % 360;
      const hue2 = (hue1 + 180) % 360;
      const colorFront = `hsl(${hue1}, 70%, 50%)`;
      const colorBack = `hsl(${hue2}, 70%, 50%)`;

      const tileStyle: React.CSSProperties = {
        position: 'absolute',
        width: tileWidth,
        height: tileHeight,
        top: row * tileHeight,
        left: col * tileWidth,
        perspective: 800,
      };

      const innerStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transform: `rotateY(${rotationY}deg) rotateZ(${rotationZ}deg)`,
      };

      const faceBase: React.CSSProperties = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        borderRadius: 8,
      };

      const frontStyle: React.CSSProperties = {
        ...faceBase,
        background: colorFront,
      };

      const backStyle: React.CSSProperties = {
        ...faceBase,
        background: colorBack,
        transform: 'rotateY(180deg)',
      };

      tiles.push(
        <div key={index} style={tileStyle}>
          <div style={innerStyle}>
            <div style={frontStyle} />
            <div style={backStyle} />
          </div>
        </div>
      );
    }
  }

  const containerStyle: React.CSSProperties = {
    width,
    height,
    backgroundColor: '#111',
    position: 'relative',
    overflow: 'hidden',
    opacity: overallOpacity,
  };

  return <div style={containerStyle}>{tiles}</div>;
};