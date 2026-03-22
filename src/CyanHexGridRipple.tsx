import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const CyanHexGridRipple: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames, width, height } = useVideoConfig();

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
	const overallOpacity = fadeIn * fadeOut;

	const maxRadius = Math.hypot(width, height) / 2;
	const rippleRadius =
		((Math.sin((2 * Math.PI * frame) / durationInFrames) + 1) / 2) *
		maxRadius;

	const s = 60; // side length of hexagon
	const h = Math.sqrt(3) * s;
	const hexPath = `M ${s} 0 L ${s / 2} ${h / 2} L ${-s / 2} ${h / 2} L ${-s} 0 L ${-s /
		2} ${-h / 2} L ${s / 2} ${-h / 2} Z`;
	const patternWidth = s * 3;
	const patternHeight = h;

	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			style={{ opacity: overallOpacity, backgroundColor: '#010101' }}
		>
			<defs>
				<filter id="glow">
					<feGaussianBlur stdDeviation="4" result="coloredBlur" />
					<feMerge>
						<feMergeNode in="coloredBlur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
				<pattern
					id="hexPattern"
					width={patternWidth}
					height={patternHeight}
					patternUnits="userSpaceOnUse"
				>
					<path d={hexPath} fill="cyan" />
				</pattern>
				<mask id="rippleMask">
					<rect width={width} height={height} fill="black" />
					<circle
						cx={width / 2}
						cy={height / 2}
						r={rippleRadius}
						fill="white"
					/>
				</mask>
			</defs>
			<rect width={width} height={height} fill="#010101" />
			<rect
				width={width}
				height={height}
				fill="url(#hexPattern)"
				opacity={0.3}
				filter="url(#glow)"
			/>
			<rect
				width={width}
				height={height}
				fill="url(#hexPattern)"
				opacity={0.8}
				filter="url(#glow)"
				mask="url(#rippleMask)"
			/>
		</svg>
	);
};