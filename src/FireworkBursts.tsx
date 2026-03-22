import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface Particle {
  angle: number;
  speed: number;
  size: number;
  color: string;
  trail: number;
}

interface Firework {
  x: number;
  y: number;
  launchFrame: number;
  particles: Particle[];
  burstDuration: number;
}

const generateParticles = (count: number, colors: string[]): Particle[] => {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      angle: (i / count) * Math.PI * 2 + (Math.random() * 0.3 - 0.15),
      speed: 2.5 + Math.random() * 4,
      size: 2 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      trail: 0.3 + Math.random() * 0.7,
    });
  }
  return particles;
};

const colorPalettes = [
  ['#ff6b6b', '#ff8e53', '#ffcc02'],
  ['#a29bfe', '#6c5ce7', '#fd79a8'],
  ['#00cec9', '#55efc4', '#81ecec'],
  ['#fdcb6e', '#e17055', '#d63031'],
  ['#74b9ff', '#0984e3', '#a29bfe'],
  ['#ff7675', '#fd79a8', '#fdcb6e'],
  ['#00b894', '#00cec9', '#55efc4'],
  ['#e84393', '#ff6b9d', '#c44dff'],
];

const fireworkDefinitions: Omit<Firework, 'particles'>[] = [
  { x: 0.2, y: 0.25, launchFrame: 10, burstDuration: 80 },
  { x: 0.75, y: 0.20, launchFrame: 35, burstDuration: 90 },
  { x: 0.5, y: 0.15, launchFrame: 60, burstDuration: 85 },
  { x: 0.15, y: 0.45, launchFrame: 90, burstDuration: 80 },
  { x: 0.8, y: 0.40, launchFrame: 115, burstDuration: 90 },
  { x: 0.35, y: 0.30, launchFrame: 145, burstDuration: 85 },
  { x: 0.65, y: 0.25, launchFrame: 170, burstDuration: 80 },
  { x: 0.5, y: 0.45, launchFrame: 200, burstDuration: 90 },
  { x: 0.25, y: 0.20, launchFrame: 230, burstDuration: 85 },
  { x: 0.7, y: 0.35, launchFrame: 260, burstDuration: 80 },
  { x: 0.4, y: 0.15, launchFrame: 290, burstDuration: 90 },
  { x: 0.85, y: 0.25, launchFrame: 320, burstDuration: 85 },
  { x: 0.1, y: 0.35, launchFrame: 350, burstDuration: 80 },
  { x: 0.55, y: 0.30, launchFrame: 380, burstDuration: 90 },
  { x: 0.3, y: 0.40, launchFrame: 410, burstDuration: 85 },
  { x: 0.75, y: 0.15, launchFrame: 440, burstDuration: 80 },
  { x: 0.45, y: 0.22, launchFrame: 470, burstDuration: 90 },
  { x: 0.2, y: 0.30, launchFrame: 500, burstDuration: 85 },
];

const fireworks: Firework[] = fireworkDefinitions.map((def, i) => ({
  ...def,
  particles: generateParticles(60 + (i % 3) * 20, colorPalettes[i % colorPalettes.length]),
}));

const seededRandom = (seed: number) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

export const FireworkBursts: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const starCount = 120;
  const stars = Array.from({ length: starCount }, (_, i) => ({
    x: seededRandom(i * 7 + 1) * width,
    y: seededRandom(i * 7 + 2) * height,
    r: seededRandom(i * 7 + 3) * 1.5 + 0.3,
    twinkle: seededRandom(i * 7 + 4) * Math.PI * 2,
    speed: seededRandom(i * 7 + 5) * 0.05 + 0.02,
  }));

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000005 100%)',
        overflow: 'hidden',
        position: 'relative',
        opacity: globalOpacity,
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {colorPalettes.map((palette, pi) =>
            palette.map((color, ci) => (
              <radialGradient
                key={`grad-${pi}-${ci}`}
                id={`glow-${pi}-${ci}`}
                cx="50%"
                cy="50%"
                r="50%"
              >
                <stop offset="0%" stopColor={color} stopOpacity="1" />
                <stop offset="40%" stopColor={color} stopOpacity="0.6" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </radialGradient>
            ))
          )}
        </defs>

        {/* Stars */}
        {stars.map((star, i) => {
          const twinkleOp = 0.4 + 0.6 * Math.abs(Math.sin(frame * star.speed + star.twinkle));
          return (
            <circle
              key={`star-${i}`}
              cx={star.x}
              cy={star.y}
              r={star.r}
              fill="white"
              opacity={twinkleOp * 0.8}
            />
          );
        })}

        {/* Ground reflections */}
        <rect
          x={0}
          y={height * 0.85}
          width={width}
          height={height * 0.15}
          fill="url(#groundGrad)"
          opacity={0.15}
        />

        {/* Fireworks */}
        {fireworks.map((fw, fwIndex) => {
          const localFrame = frame - fw.launchFrame;

          if (localFrame < -20 || localFrame > fw.burstDuration + 30) return null;

          const bx = fw.x * width;
          const by = fw.y * height;

          // Launch trail
          const launchProgress = interpolate(localFrame, [-20, 0], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const launchStartY = height * 0.95;
          const trailY = launchStartY + (by - launchStartY) * launchProgress;
          const trailOpacity = interpolate(localFrame, [-20, -5, 0], [0, 0.8, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          // Burst
          const burstProgress = interpolate(localFrame, [0, fw.burstDuration], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const burstOpacity = interpolate(
            burstProgress,
            [0, 0.05, 0.3, 1],
            [0, 1, 0.9, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const flashOpacity = interpolate(
            burstProgress,
            [0, 0.02, 0.08, 0.15],
            [0, 1, 0.6, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const palette = colorPalettes[fwIndex % colorPalettes.length];

          return (
            <g key={`fw-${fwIndex}`}>
              {/* Launch trail */}
              {localFrame < 0 && (
                <g>
                  <line
                    x1={bx}
                    y1={launchStartY}
                    x2={bx + (seededRandom(fwIndex * 3) - 0.5) * 20}
                    y2={trailY}
                    stroke={palette[0]}
                    strokeWidth="2"
                    opacity={trailOpacity}
                    strokeLinecap="round"
                  />
                  <circle
                    cx={bx}
                    cy={trailY}
                    r="4"
                    fill={palette[0]}
                    opacity={trailOpacity}
                  />
                </g>
              )}

              {/* Flash at burst point */}
              {localFrame >= 0 && (
                <circle
                  cx={bx}
                  cy={by}
                  r={60 * flashOpacity}
                  fill={palette[0]}
                  opacity={flashOpacity * 0.8}
                />
              )}

              {/* Particles */}
              {localFrame >= 0 &&
                fw.particles.map((p, pi) => {
                  const easeOut = 1 - Math.pow(1 - burstProgress, 2.5);
                  const gravity = burstProgress * burstProgress * 120;
                  const dist = p.speed * easeOut * 200;
                  const px = bx + Math.cos(p.angle) * dist;
                  const py = by + Math.sin(p.angle) * dist + gravity;

                  const particleOpacity =
                    burstOpacity *
                    interpolate(
                      burstProgress,
                      [0, 0.1, 0.6, 1],
                      [0, 1, 0.8, 0],
                      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                    );

                  const size = p.size * (1 - burstProgress * 0.5);

                  // Trail points
                  const trailLen = 4;
                  const trailPoints = Array.from({ length: trailLen }, (_, ti) => {
                    const trailProgress = Math.max(0, burstProgress - (ti + 1) * 0.04);
                    const trailEase = 1 - Math.pow(1 - trailProgress, 2.5);
                    const trailGravity = trailProgress * trailProgress * 120;
                    const tDist = p.speed * trailEase * 200;
                    return {
                      x: bx + Math.cos(p.angle) * tDist,
                      y: by + Math.sin(p.angle) * tDist + trailGravity,
                      op: (1 - (ti + 1) / trailLen) * particleOpacity * 0.5,
                    };
                  });

                  return (
                    <g key={`p-${pi}`}>
                      {trailPoints.map((tp, ti) => (
                        <line
                          key={`trail-${ti}`}
                          x1={ti === 0 ? px : trailPoints[ti - 1].x}
                          y1={ti === 0 ? py : trailPoints[ti - 1].y}
                          x2={tp.x}
                          y2={tp.y}
                          stroke={p.color}
                          strokeWidth={size * 0.7}
                          opacity={tp.op}
                          strokeLinecap="round"
                        />
                      ))}
                      <circle cx={px} cy={py} r={size} fill={p.color} opacity={particleOpacity} />
                      <circle
                        cx={px}
                        cy={py}
                        r={size * 2.5}
                        fill={p.color}
                        opacity={particleOpacity * 0.3}
                      />
                    </g>
                  );
                })}

              {/* Ground reflection */}
              {localFrame >= 0 &&
                fw.particles.slice(0, 20).map((p, pi) => {
                  const easeOut = 1 - Math.pow(1 - burstProgress, 2.5);
                  const gravity = burstProgress * burstProgress * 120;
                  const dist = p.speed * easeOut * 200;
                  const px = bx + Math.cos(p.angle) * dist;
                  const py = by + Math.sin(p.angle) * dist + gravity;
                  const reflY = height - (py - height * 0.85) * 0.3;
                  const reflOp =
                    burstOpacity * 0.15 * interpolate(burstProgress, [0, 0.3, 1], [0, 1, 0]);

                  if (reflY > height * 0.85) {
                    return (
                      <circle
                        key={`refl-${pi}`}
                        cx={px}
                        cy={reflY}
                        r={p.size * 0.8}
                        fill={p.color}
                        opacity={reflOp}
                      />
                    );
                  }
                  return null;
                })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};