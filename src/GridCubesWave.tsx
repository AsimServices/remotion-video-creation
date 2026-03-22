import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const GridCubesWave: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames, width, height } = useVideoConfig();

	// Fade in/out
	const fadeIn = interpolate(frame, [0, 50], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const fadeOut = interpolate(
		frame,
		[durationInFrames - 50, durationInFrames],
		[1, 0],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}
	);
	const opacity = Math.min(fadeIn, fadeOut);

	// Grid settings
	const cols = Math.max(1, Math.floor(width / 120));
	const rows = Math.max(1, Math.floor(height / 120));
	const cubeBaseSize = Math.min(width / cols, height / rows) * 0.8;
	const xGap = (width - cols * cubeBaseSize) / (cols + 1);
	const yGap = (height - rows * cubeBaseSize) / (rows + 1);

	// Wave parameters
	const waveSpeed = width / durationInFrames; // pixels per frame
	const wavePos = frame * waveSpeed; // horizontal position of wave front
	const waveWidth = width * 0.2; // influence width

	const cubes: JSX.Element[] = [];

	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const cx = xGap + c * (cubeBaseSize + xGap) + cubeBaseSize / 2;
			const cy = yGap + r * (cubeBaseSize + yGap) + cubeBaseSize / 2;

			// Distance from wave front
			const distance = Math.abs(cx - wavePos);
			const influence = Math.max(0, 1 - distance / waveWidth);

			// Breathing scale using sine wave + wave influence
			const breath = Math.sin((frame + c * 3 + r * 5) / 8);
			const scale = 0.8 + 0.2 * breath * influence;

			const cubeStyle: React.CSSProperties = {
				position: 'absolute',
				width: cubeBaseSize,
				height: cubeBaseSize,
				left: cx - cubeBaseSize / 2,
				top: cy - cubeBaseSize / 2,
				background: 'linear-gradient(135deg, #222, #444)',
				borderRadius: 8,
				transform: `scale(${scale}) rotateX(30deg) rotateY(30deg)`,
				transformOrigin: 'center',
				boxShadow: '0 8px 16px rgba(0,0,0,0.6)',
			};

			cubes.push(<div key={`r${r}c${c}`} style={cubeStyle} />);
		}
	}

	const containerStyle: React.CSSProperties = {
		position: 'relative',
		width,
		height,
		backgroundColor: '#111',
		overflow: 'hidden',
		opacity,
	};

	return <div style={containerStyle}>{cubes}</div>;
};