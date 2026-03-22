import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const FireworkBurst: React.FC = () => {
	const frame = useCurrentFrame();
	const { width, height, durationInFrames } = useVideoConfig();

	// Overall fade in/out
	const overallOpacity = interpolate(
		frame,
		[0, 50, durationInFrames - 50, durationInFrames],
		[0, 1, 1, 0],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}
	);

	// Settings
	const burstInterval = 150; // frames between bursts
	const particlesPerBurst = 80;
	const particleSpeed = 4; // pixels per frame
	const particleLife = 80; // frames

	// Simple deterministic pseudo‑random generator
	const rand = (seed: number) => {
		const x = Math.sin(seed) * 10000;
		return x - Math.floor(x);
	};

	const bursts: JSX.Element[] = [];

	const totalBursts = Math.ceil(durationInFrames / burstInterval) + 1;

	for (let b = 0; b < totalBursts; b++) {
		const burstStart = b * burstInterval;
		const timeSinceBurst = frame - burstStart;

		if (timeSinceBurst < 0 || timeSinceBurst > particleLife) {
			continue; // not yet started or already finished
		}

		// Random center for each burst
		const centerX = rand(b * 12 + 7) * width;
		const centerY = rand(b * 23 + 13) * height;

		for (let p = 0; p < particlesPerBurst; p++) {
			// Angle with slight random offset
			const baseAngle = (2 * Math.PI * p) / particlesPerBurst;
			const angleOffset = (rand(b * 1000 + p) - 0.5) * 0.2;
			const angle = baseAngle + angleOffset;

			const distance = particleSpeed * timeSinceBurst;
			const x = centerX + Math.cos(angle) * distance;
			const y = centerY + Math.sin(angle) * distance;

			const lifeProgress = timeSinceBurst / particleLife;
			const particleOpacity = (1 - lifeProgress) * overallOpacity;

			const size = 6; // particle size in px

			bursts.push(
				<div
					key={`b${b}-p${p}`}
					style={{
						position: 'absolute',
						left: x,
						top: y,
						width: size,
						height: size,
						borderRadius: '50%',
						background: 'radial-gradient(circle, rgba(255,255,255,1), rgba(255,255,255,0))',
						transform: 'translate(-50%, -50%)',
						opacity: particleOpacity,
						pointerEvents: 'none',
					}}
				/>
			);
		}
	}

	return (
		<div
			style={{
				width,
				height,
				backgroundColor: '#0a0a0a',
				overflow: 'hidden',
				position: 'relative',
			}}
		>
			{bursts}
		</div>
	);
};