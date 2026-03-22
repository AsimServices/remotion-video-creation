import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const CosmicStardustStream: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const numParticles = 320;
  const numNebulae = 8;
  const numStars = 200;

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed + 1) * 43758.5453123;
    return x - Math.floor(x);
  };

  const backgroundStars = Array.from({ length: numStars }, (_, i) => {
    const x = seededRandom(i * 7.1) * width;
    const y = seededRandom(i * 3.7) * height;
    const size = seededRandom(i * 5.3) * 1.8 + 0.4;
    const twinkle = Math.sin(frame * 0.05 + seededRandom(i * 2.9) * Math.PI * 2);
    const opacity = 0.3 + 0.5 * ((twinkle + 1) / 2);
    return { x, y, size, opacity };
  });

  const arcProgress = interpolate(frame, [0, durationInFrames], [0, 1]);

  const getArcPosition = (t: number, offset: number = 0) => {
    const adjustedT = (t + offset) % 1;
    const cx = width * 0.5;
    const cy = height * 1.2;
    const rx = width * 0.85;
    const ry = height * 1.1;
    const angle = Math.PI + adjustedT * Math.PI;
    return {
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
      angle: angle,
    };
  };

  const particles = Array.from({ length: numParticles }, (_, i) => {
    const spread = seededRandom(i * 11.3) * 0.18 - 0.09;
    const speedVariance = 0.5 + seededRandom(i * 6.7) * 1.0;
    const t = ((arcProgress * speedVariance + seededRandom(i * 4.1)) % 1);
    const pos = getArcPosition(t, spread * 0.1);

    const perp = pos.angle + Math.PI / 2;
    const perpOffset = (seededRandom(i * 8.9) - 0.5) * 120;
    const depthOffset = seededRandom(i * 2.3);

    const x = pos.x + Math.cos(perp) * perpOffset;
    const y = pos.y + Math.sin(perp) * perpOffset;

    const size = seededRandom(i * 9.1) * 3.5 + 0.5;
    const brightness = seededRandom(i * 13.7);

    const colorType = seededRandom(i * 17.3);
    let color;
    if (colorType < 0.3) {
      color = `hsla(${200 + brightness * 40}, 90%, ${70 + brightness * 30}%, `;
    } else if (colorType < 0.6) {
      color = `hsla(${260 + brightness * 50}, 85%, ${65 + brightness * 35}%, `;
    } else if (colorType < 0.8) {
      color = `hsla(${180 + brightness * 30}, 95%, ${80 + brightness * 20}%, `;
    } else {
      color = `hsla(${40 + brightness * 20}, 100%, ${85 + brightness * 15}%, `;
    }

    const trailLength = 3 + seededRandom(i * 19.1) * 8;
    const opacity = (0.4 + brightness * 0.6) * (1 - Math.abs(perpOffset) / 120);

    return { x, y, size, color, trailLength, opacity, depthOffset, t };
  });

  const nebulae = Array.from({ length: numNebulae }, (_, i) => {
    const t = (i / numNebulae + arcProgress * 0.3) % 1;
    const pos = getArcPosition(t);
    const perp = pos.angle + Math.PI / 2;
    const spreadX = (seededRandom(i * 23.1) - 0.5) * 200;
    const spreadY = (seededRandom(i * 31.7) - 0.5) * 100;
    return {
      x: pos.x + Math.cos(perp) * spreadX + Math.sin(perp) * spreadY,
      y: pos.y + Math.sin(perp) * spreadX + Math.cos(perp) * spreadY,
      r: 80 + seededRandom(i * 7.9) * 140,
      hue: 200 + seededRandom(i * 5.3) * 100,
      opacity: 0.04 + seededRandom(i * 11.1) * 0.08,
    };
  });

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 50% 50%, #05050f 0%, #010108 60%, #000004 100%)',
        overflow: 'hidden',
        opacity: globalOpacity,
        position: 'relative',
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {nebulae.map((n, i) => (
            <radialGradient key={`ng-${i}`} id={`nebula-${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={`hsl(${n.hue}, 80%, 60%)`} stopOpacity={n.opacity * 3} />
              <stop offset="40%" stopColor={`hsl(${n.hue + 20}, 70%, 50%)`} stopOpacity={n.opacity} />
              <stop offset="100%" stopColor={`hsl(${n.hue}, 60%, 40%)`} stopOpacity={0} />
            </radialGradient>
          ))}
          <radialGradient id="streamGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a0c8ff" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#4040ff" stopOpacity={0} />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {backgroundStars.map((s, i) => (
          <circle key={`star-${i}`} cx={s.x} cy={s.y} r={s.size} fill="white" opacity={s.opacity * 0.7} />
        ))}

        {nebulae.map((n, i) => (
          <ellipse
            key={`neb-${i}`}
            cx={n.x}
            cy={n.y}
            rx={n.r}
            ry={n.r * 0.6}
            fill={`url(#nebula-${i})`}
          />
        ))}

        {(() => {
          const pathPoints = [];
          for (let i = 0; i <= 100; i++) {
            const t = i / 100;
            const p = getArcPosition(t);
            pathPoints.push(`${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`);
          }
          const pathD = pathPoints.join(' ');
          return (
            <>
              <path d={pathD} stroke="rgba(100,160,255,0.03)" strokeWidth={160} fill="none" />
              <path d={pathD} stroke="rgba(140,100,255,0.05)" strokeWidth={80} fill="none" />
              <path d={pathD} stroke="rgba(180,220,255,0.04)" strokeWidth={40} fill="none" />
            </>
          );
        })()}

        {particles
          .filter(p => p.depthOffset < 0.5)
          .map((p, i) => (
            <circle
              key={`pb-${i}`}
              cx={p.x}
              cy={p.y}
              r={p.size * 0.7}
              fill={`${p.color}${p.opacity * 0.5})`}
            />
          ))}

        {particles
          .filter(p => p.depthOffset >= 0.5)
          .map((p, i) => (
            <g key={`pf-${i}`} filter="url(#glow)">
              <circle
                cx={p.x}
                cy={p.y}
                r={p.size}
                fill={`${p.color}${p.opacity})`}
              />
              {p.size > 2 && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={p.size * 2.5}
                  fill={`${p.color}${p.opacity * 0.15})`}
                />
              )}
            </g>
          ))}

        {Array.from({ length: 60 }, (_, i) => {
          const t = ((arcProgress * 1.2 + seededRandom(i * 13.3)) % 1);
          const pos = getArcPosition(t);
          const perp = pos.angle + Math.PI / 2;
          const offset = (seededRandom(i * 7.7) - 0.5) * 60;
          const x = pos.x + Math.cos(perp) * offset;
          const y = pos.y + Math.sin(perp) * offset;
          const size = seededRandom(i * 3.1) * 2 + 1;
          const pulse = 0.5 + 0.5 * Math.sin(frame * 0.1 + seededRandom(i * 9.9) * Math.PI * 2);
          const hue = 200 + seededRandom(i * 21.1) * 80;
          return (
            <g key={`bright-${i}`} filter="url(#softGlow)">
              <circle
                cx={x}
                cy={y}
                r={size * (1 + pulse * 0.5)}
                fill={`hsla(${hue}, 100%, 90%, ${0.6 + pulse * 0.4})`}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};