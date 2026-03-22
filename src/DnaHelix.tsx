import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const DnaHelix: React.FC = () => {
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

	const radius = Math.min(width, height) * 0.2;
	const verticalLength = height * 0.8;
	const turns = 3;
	const angle = interpolate(frame, [0, durationInFrames], [0, Math.PI * 2]);

	const pointCount = 30;
	const points = Array.from({ length: pointCount }, (_, i) => {
		const t = i / (pointCount - 1);
		const y = height / 2 + (t - 0.5) * verticalLength;
		const sin1 = Math.sin(2 * Math.PI * turns * t + angle);
		const sin2 = Math.sin(2 * Math.PI * turns * t + angle + Math.PI);
		const x1 = width / 2 + sin1 * radius;
		const x2 = width / 2 + sin2 * radius;
		return { x1, x2, y };
	});

	return (
		<div
			style={{
				width,
				height,
				backgroundColor: '#0a0a0a',
				overflow: 'hidden',
			}}
		>
			<svg width={width} height={height} style={{ opacity }}>
				{/* Rungs */}
				{points.map((p, idx) => (
					<line
						key={`rung-${idx}`}
						x1={p.x1}
						y1={p.y}
						x2={p.x2}
						y2={p.y}
						stroke="#ff6f61"
						strokeWidth={2}
					/>
				))}
				{/* Strands */}
				{points.map((p, idx) => (
					<React.Fragment key={`strand-${idx}`}>
						<circle cx={p.x1} cy={p.y} r={6} fill="#ff6f61" />
						<circle cx={p.x2} cy={p.y} r={6} fill="#ff6f61" />
						{idx < points.length - 1 && (
							<>
								<line
									x1={p.x1}
									y1={p.y}
									x2={points[idx + 1].x1}
									y2={points[idx + 1].y}
									stroke="#ff6f61"
									strokeWidth={2}
								/>
								<line
									x1={p.x2}
									y1={p.y}
									x2={points[idx + 1].x2}
									y2={points[idx + 1].y}
									stroke="#ff6f61"
									strokeWidth={2}
								/>
							</>
						)}
					</React.Fragment>
				))}
			</svg>
		</div>
	);
};