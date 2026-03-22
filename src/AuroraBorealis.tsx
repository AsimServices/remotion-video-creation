import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AuroraBorealis: React.FC = () => {
	const frame = useCurrentFrame();
	const { width, height, durationInFrames } = useVideoConfig();

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
	const opacity = fadeIn * fadeOut;

	const generatePath = (
		baseY: number,
		amplitude: number,
		frequency: number,
		phase: number
	) => {
		const points: string[] = [];
		const step = 20; // pixel step for x
		for (let x = 0; x <= width; x += step) {
			const y =
				baseY +
				amplitude *
					Math.sin(
						((x / width) * Math.PI * 2 * frequency) + phase
					);
			points.push(`${x},${y}`);
		}
		// close the shape to bottom
		points.push(`${width},${height}`);
		points.push(`0,${height}`);
		return `M${points[0]} ${points
			.slice(1)
			.map((p) => `L${p}`)
			.join(' ')} Z`;
	};

	const layers = [
		{
			color: 'rgba(80,255,150,0.4)',
			baseY: height * 0.6,
			amplitude: 80,
			frequency: 1.5,
			phaseSpeed: 0.02,
		},
		{
			color: 'rgba(120,200,255,0.3)',
			baseY: height * 0.7,
			amplitude: 100,
			frequency: 1.2,
			phaseSpeed: -0.015,
		},
		{
			color: 'rgba(200,120,255,0.2)',
			baseY: height * 0.8,
			amplitude: 120,
			frequency: 1.0,
			phaseSpeed: 0.01,
		},
	];

	return (
		<div
			style={{
				position: 'relative',
				width,
				height,
				backgroundColor: '#01010a',
				overflow: 'hidden',
				opacity,
			}}
		>
			<svg
				width={width}
				height={height}
				style={{ position: 'absolute', top: 0, left: 0 }}
			>
				{layers.map((layer, i) => {
					const phase = frame * layer.phaseSpeed;
					const d = generatePath(
						layer.baseY,
						layer.amplitude,
						layer.frequency,
						phase
					);
					return (
						<path
							key={i}
							d={d}
							fill={layer.color}
						/>
					);
				})}
			</svg>
		</div>
	);
};