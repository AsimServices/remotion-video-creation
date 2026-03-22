import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const SpinningTorusKnot: React.FC = () => {
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
	const opacity = Math.min(fadeIn, fadeOut);

	const numPoints = 200;
	const R = 200;
	const r = 80;
	const focalLength = 500;

	const basePoints = useMemo(() => {
		const points = [];
		for (let i = 0; i <= numPoints; i++) {
			const t = (i / numPoints) * Math.PI * 2 * 3; // 3 turns for richer knot
			const x = (R + r * Math.cos(3 * t)) * Math.cos(2 * t);
			const y = (R + r * Math.cos(3 * t)) * Math.sin(2 * t);
			const z = r * Math.sin(3 * t);
			points.push({ x, y, z });
		}
		return points;
	}, []);

	const angleY = (frame / durationInFrames) * Math.PI * 2; // full rotation over duration
	const angleX = (frame / durationInFrames) * Math.PI; // half rotation

	const transformed = basePoints.map((p) => {
		// rotate around Y
		const cosY = Math.cos(angleY);
		const sinY = Math.sin(angleY);
		const x1 = p.x * cosY + p.z * sinY;
		const z1 = -p.x * sinY + p.z * cosY;
		// rotate around X
		const cosX = Math.cos(angleX);
		const sinX = Math.sin(angleX);
		const y1 = p.y * cosX - z1 * sinX;
		const z2 = p.y * sinX + z1 * cosX;
		// perspective projection
		const scale = focalLength / (focalLength + z2);
		const x2 = x1 * scale + width / 2;
		const y2 = y1 * scale + height / 2;
		return { x: x2, y: y2 };
	});

	const lines = [];
	for (let i = 0; i < transformed.length - 1; i++) {
		const p1 = transformed[i];
		const p2 = transformed[i + 1];
		lines.push(
			<line
				key={i}
				x1={p1.x}
				y1={p1.y}
				x2={p2.x}
				y2={p2.y}
				stroke="#0ff"
				strokeWidth={2}
				strokeLinecap="round"
				style={{
					filter:
						'drop-shadow(0 0 6px #0ff) drop-shadow(0 0 12px #0ff) drop-shadow(0 0 18px #0ff)',
				}}
			/>
		);
	}

	return (
		<div
			style={{
				width,
				height,
				backgroundColor: '#020202',
				overflow: 'hidden',
				opacity,
			}}
		>
			<svg
				width={width}
				height={height}
				viewBox={`0 0 ${width} ${height}`}
				style={{ display: 'block' }}
			>
				{lines}
			</svg>
		</div>
	);
};