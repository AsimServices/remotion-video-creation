import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface Particle {
  angle: number;
  speed: number;
  size: number;
  color: string;
  trailLength: number;
  decay: number;
}

interface Firework {
  x: number;
  y: number;
  launchFrame: number;
  particles: Particle[];
  explosionDuration: number;
  coreColor: string;
}

const generateParticles = (count: number, colors: string[]): Particle[] => {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      angle: (i / count) * Math.PI * 2 + (Math.random() * 0.3 - 0.15),
      speed: 2 + Math.random() * 5,
      size: 1.5 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      trailLength: 3 + Math.floor(Math.random() * 8),
      decay: 0.92 + Math.random() * 0.05,
    });
  }
  return particles;
};

const colorPalettes: string[][] = [
  ['#ff4466', '#ff88aa', '#ffccdd', '#ffffff'],
  ['#44aaff', '#88ccff', '#aaddff', '#ffffff'],
  ['#ffdd44', '#ffee88', '#ffffcc', '#ffffff'],
  ['#44ffaa', '#88ffcc', '#ccffee', '#ffffff'],
  ['#cc44ff', '#dd88ff', '#eeccff', '#ffffff'],
  ['#ff8844', '#ffaa88', '#ffddcc', '#ffffff'],
  ['#44ffff', '#88ffff', '#ccffff', '#ffffff'],
  ['#ff44ff', '#ff88ff', '#ffccff', '#ffffff'],
];

const seed = (n: number) => {
  const x = Math.sin(n + 1) * 10000;
  return x - Math.floor(x);
};

const generateFireworks = (count: number, durationInFrames: number): Firework[] => {
  const fireworks: Firework[] = [];
  for (let i = 0; i < count; i++) {
    const palette = colorPalettes[Math.floor(seed(i * 7) * colorPalettes.length)];
    fireworks.push({
      x: 0.1 + seed(i * 3) * 0.8,
      y: 0.1 + seed(i * 5) * 0.65,
      launchFrame: 30 + Math.floor(seed(i * 11) * (durationInFrames - 120)),
      particles: generateParticles(60 + Math.floor(seed(i * 13) * 60), palette),
      explosionDuration: 60 + Math.floor(seed(i * 17) * 40),
      coreColor: palette[palette.length - 1],
    });
  }
  return fireworks;
};

export const ExplodingFireworkBursts: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const fireworks = React.useMemo(() => generateFireworks(18, durationInFrames), [durationInFrames]);

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 50% 100%, #0a0a1a 0%, #000005 100%)',
        overflow: 'hidden',
        opacity: globalOpacity,
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {fireworks.map((fw, fi) =>
            fw.particles.map((p, pi) => (
              <radialGradient key={`grad-${fi}-${pi}`} id={`grad-${fi}-${pi}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={p.color} stopOpacity="1" />
                <stop offset="60%" stopColor={p.color} stopOpacity="0.6" />
                <stop offset="100%" stopColor={p.color} stopOpacity="0" />
              </radialGradient>
            ))
          )}
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Stars background */}
        {Array.from({ length: 80 }).map((_, i) => {
          const sx = seed(i * 2.3) * width;
          const sy = seed(i * 3.7) * height;
          const sr = 0.5 + seed(i * 5.1) * 1.2;
          const twinkle = Math.sin(frame * 0.05 + i * 2.1) * 0.4 + 0.6;
          return (
            <circle
              key={`star-${i}`}
              cx={sx}
              cy={sy}
              r={sr}
              fill="#ffffff"
              opacity={twinkle * 0.7}
            />
          );
        })}

        {fireworks.map((fw, fi) => {
          const localFrame = frame - fw.launchFrame;
          if (localFrame < 0 || localFrame > fw.explosionDuration + 20) return null;

          const cx = fw.x * width;
          const cy = fw.y * height;

          const burstProgress = Math.max(0, Math.min(1, localFrame / 15));
          const fadeProgress = localFrame > fw.explosionDuration
            ? 1 - (localFrame - fw.explosionDuration) / 20
            : 1;

          const coreRadius = interpolate(burstProgress, [0, 0.3, 1], [0, 20, 8]);
          const coreOpacity = interpolate(burstProgress, [0, 0.2, 0.6, 1], [0, 1, 0.8, 0.2]) * fadeProgress;

          // Flash ring
          const flashRadius = interpolate(burstProgress, [0, 0.4, 1], [0, 80, 120]);
          const flashOpacity = interpolate(burstProgress, [0, 0.1, 0.5, 1], [0, 0.8, 0.3, 0]) * fadeProgress;

          return (
            <g key={`fw-${fi}`}>
              {/* Flash */}
              <circle
                cx={cx}
                cy={cy}
                r={flashRadius}
                fill={fw.coreColor}
                opacity={flashOpacity * 0.15}
              />

              {/* Particles */}
              {fw.particles.map((p, pi) => {
                const t = Math.max(0, localFrame);
                const decay = Math.pow(p.decay, t);
                const px = cx + Math.cos(p.angle) * p.speed * t * decay;
                const py = cy + Math.sin(p.angle) * p.speed * t * decay + 0.03 * t * t;
                const particleOpacity =
                  interpolate(t, [0, 5, fw.explosionDuration * 0.5, fw.explosionDuration], [0, 1, 0.8, 0]) *
                  fadeProgress;

                const trailPoints: string[] = [];
                for (let ti = 0; ti <= p.trailLength; ti++) {
                  const tt = Math.max(0, t - ti * 1.5);
                  const tdecay = Math.pow(p.decay, tt);
                  const tx = cx + Math.cos(p.angle) * p.speed * tt * tdecay;
                  const ty = cy + Math.sin(p.angle) * p.speed * tt * tdecay + 0.03 * tt * tt;
                  trailPoints.push(`${tx},${ty}`);
                }

                return (
                  <g key={`p-${fi}-${pi}`} opacity={particleOpacity}>
                    {trailPoints.length > 1 && (
                      <polyline
                        points={trailPoints.join(' ')}
                        fill="none"
                        stroke={p.color}
                        strokeWidth={p.size * 0.5}
                        strokeLinecap="round"
                        opacity={0.4}
                      />
                    )}
                    <circle
                      cx={px}
                      cy={py}
                      r={p.size * decay}
                      fill={`url(#grad-${fi}-${pi})`}
                    />
                    <circle
                      cx={px}
                      cy={py}
                      r={p.size * decay * 0.4}
                      fill="#ffffff"
                      opacity={0.9}
                    />
                  </g>
                );
              })}

              {/* Core */}
              <circle
                cx={cx}
                cy={cy}
                r={coreRadius * 2}
                fill={fw.coreColor}
                opacity={coreOpacity * 0.3}
              />
              <circle
                cx={cx}
                cy={cy}
                r={coreRadius}
                fill="url(#coreGlow)"
                opacity={coreOpacity}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};