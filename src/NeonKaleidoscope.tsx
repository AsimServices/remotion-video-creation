import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const NeonKaleidoscope: React.FC = () => {
	const frame = useCurrentFrame();
	const { width, height, durationInFrames } = useVideoConfig();

	const fadeIn = interpolate(frame, [0, 50], [0, 1], {
		extrapolateRight: 'clamp',
	});
	const fadeOut = interpolate(
		frame,
		[durationInFrames - 50, durationInFrames],
		[1, 0],
		{
			extrapolateLeft: 'clamp',
		}
	);
	const opacity = fadeIn * fadeOut;

	const sides = 6;
	const segmentCount = 12;
	const centerX = width / 2;
	const centerY = height / 2;

	const rotationSpeed = 0.02;
	const baseRadius = Math.min(width, height) * 0.25;
	const radius = baseRadius + 30 * Math.sin(frame * 0.1);

	const hue = (frame * 2) % 360;
	const stroke = `hsl(${hue}, 100%, 60%)`;

	const points = Array.from({ length: sides })
		.map((_, i) => {
			const angle = (Math.PI * 2 * i) / sides + frame * rotationSpeed;
			const x = centerX + radius * Math.cos(angle);
			const y = centerY + radius * Math.sin(angle);
			return `${x},${y}`;
		})
		.join(' ');

	const segments = Array.from({ length: segmentCount }).map((_, i) => {
		const angleDeg = (360 / segmentCount) * i;
		return (
			<g key={i} transform={`rotate(${angleDeg} ${centerX} ${centerY})`}>
				<polygon
					points={points}
					fill="none"
					stroke={stroke}
					strokeWidth={4}
					filter="url(#glow)"
				/>
			</g>
		);
	});

	return (
		<div
			style={{
				width,
				height,
				backgroundColor: '#111',
				overflow: 'hidden',
			}}
		>
			<svg width={width} height={height} style={{ opacity }}>
				<defs>
					<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="4" result="coloredBlur" />
						<feMerge>
							<feMergeNode in="coloredBlur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>
				{segments}
			</svg>
		</div>
	);
};