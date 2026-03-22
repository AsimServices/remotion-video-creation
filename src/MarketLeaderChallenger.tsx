import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const WORLD_PATHS = [
  // North America
  "M 320 280 L 280 260 L 250 270 L 220 290 L 200 320 L 210 350 L 240 370 L 260 400 L 280 420 L 300 430 L 320 420 L 340 400 L 360 380 L 370 360 L 380 340 L 370 310 L 350 290 Z",
  // South America
  "M 340 460 L 310 450 L 290 470 L 280 500 L 285 540 L 300 580 L 320 610 L 340 630 L 360 620 L 380 590 L 385 550 L 375 510 L 360 480 Z",
  // Europe
  "M 580 220 L 560 210 L 540 220 L 530 240 L 540 260 L 560 270 L 590 265 L 610 250 L 620 235 L 605 220 Z",
  // Africa
  "M 570 290 L 545 280 L 525 295 L 515 325 L 520 370 L 535 410 L 555 445 L 580 460 L 605 450 L 620 420 L 625 380 L 620 340 L 610 305 L 590 285 Z",
  // Asia
  "M 640 200 L 620 195 L 600 205 L 590 225 L 600 250 L 620 270 L 650 280 L 690 275 L 720 260 L 750 250 L 770 230 L 760 210 L 730 200 L 700 195 Z",
  // Australia
  "M 760 420 L 740 410 L 720 420 L 715 445 L 725 470 L 750 485 L 780 480 L 800 460 L 800 435 L 785 420 Z",
];

const DOTS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 1731 + 137) % 960,
  y: (i * 1337 + 97) % 540,
  size: ((i * 7) % 3) + 1,
  opacity: ((i * 13) % 40 + 20) / 100,
  speed: ((i * 17) % 30 + 20) / 10,
}));

const LEADER_RINGS = Array.from({ length: 8 }, (_, i) => ({
  delay: i * 40,
  maxRadius: 200 + (i % 3) * 30,
}));

const CHALLENGER_RINGS = Array.from({ length: 8 }, (_, i) => ({
  delay: i * 40 + 20,
  maxRadius: 160 + (i % 3) * 25,
}));

const GRID_LINES_H = Array.from({ length: 12 }, (_, i) => ({
  y: (i / 11) * 540,
  opacity: i % 3 === 0 ? 0.15 : 0.05,
}));

const GRID_LINES_V = Array.from({ length: 20 }, (_, i) => ({
  x: (i / 19) * 960,
  opacity: i % 4 === 0 ? 0.15 : 0.05,
}));

const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  x: (i * 2531) % 960,
  y: (i * 1873) % 540,
  vx: (((i * 31) % 20) - 10) / 10,
  vy: (((i * 23) % 20) - 10) / 10,
  size: ((i * 5) % 2) + 1,
  hue: (i * 37) % 360,
}));

export const MarketLeaderChallenger: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const scale = width / 960;

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const leaderX = 300;
  const leaderY = 340;
  const challengerX = 650;
  const challengerY = 260;

  const battleProgress = interpolate(frame, [100, 400], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const leaderPulseBase = Math.sin(frame * 0.08) * 0.15 + 1;
  const challengerPulseBase = Math.sin(frame * 0.1 + 1) * 0.15 + 1;

  const leaderDominance = interpolate(frame, [0, 200, 400, 600], [1, 1.2, 0.9, 0.95], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const challengerGrowth = interpolate(frame, [0, 150, 350, 600], [0.6, 0.8, 1.1, 1.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const mapShift = interpolate(frame, [0, durationInFrames], [0, -20]);

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at center, #0a0e1a 0%, #050810 60%, #020408 100%)',
        overflow: 'hidden',
        opacity: globalOpacity,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 960 540`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <radialGradient id="leaderGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0088cc" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#004488" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="challengerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#cc3300" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#661100" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bgGlow1" cx="30%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#001133" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bgGlow2" cx="70%" cy="40%" r="40%">
            <stop offset="0%" stopColor="#220011" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <filter id="blur4">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="blur8">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background glows */}
        <rect x="0" y="0" width="960" height="540" fill="url(#bgGlow1)" />
        <rect x="0" y="0" width="960" height="540" fill="url(#bgGlow2)" />

        {/* Grid lines */}
        {GRID_LINES_H.map((line, i) => (
          <line key={`h${i}`} x1="0" y1={line.y} x2="960" y2={line.y} stroke="#334466" strokeWidth="0.5" opacity={line.opacity} />
        ))}
        {GRID_LINES_V.map((line, i) => (
          <line key={`v${i}`} x1={line.x + mapShift} y1="0" x2={line.x + mapShift} y2="540" stroke="#334466" strokeWidth="0.5" opacity={line.opacity} />
        ))}

        {/* World dots */}
        {DOTS.map((dot, i) => {
          const animOpacity = dot.opacity * (0.5 + 0.5 * Math.sin(frame * 0.02 + i * 0.5));
          return (
            <circle
              key={`dot${i}`}
              cx={dot.x}
              cy={dot.y}
              r={dot.size * 0.6}
              fill="#1a3055"
              opacity={animOpacity}
            />
          );
        })}

        {/* World map paths */}
        {WORLD_PATHS.map((path, i) => (
          <g key={`region${i}`}>
            <path
              d={path}
              fill="#0d1f35"
              stroke="#1a4070"
              strokeWidth="1"
              opacity="0.7"
            />
            <path
              d={path}
              fill="none"
              stroke="#2a6090"
              strokeWidth="0.5"
              opacity="0.4"
            />
          </g>
        ))}

        {/* Particles */}
        {PARTICLES.map((p, i) => {
          const px = (p.x + p.vx * frame * 0.5) % 960;
          const py = (p.y + p.vy * frame * 0.3) % 540;
          const particleOp = 0.3 + 0.2 * Math.sin(frame * 0.05 + i);
          const isLeaderParticle = i % 3 !== 0;
          return (
            <circle
              key={`p${i}`}
              cx={px < 0 ? px + 960 : px}
              cy={py < 0 ? py + 540 : py}
              r={p.size * 0.7}
              fill={isLeaderParticle ? '#004488' : '#441100'}
              opacity={particleOp}
            />
          );
        })}

        {/* Leader pulse rings */}
        {LEADER_RINGS.map((ring, i) => {
          const ringFrame = (frame - ring.delay + durationInFrames) % 120;
          const progress = ringFrame / 120;
          const radius = progress * ring.maxRadius * leaderDominance;
          const ringOpacity = interpolate(progress, [0, 0.3, 1], [0, 0.6, 0]) * battleProgress;
          return (
            <circle
              key={`lr${i}`}
              cx={leaderX}
              cy={leaderY}
              r={radius}
              fill="none"
              stroke="#00d4ff"
              strokeWidth={interpolate(progress, [0, 0.5, 1], [3, 1.5, 0.5])}
              opacity={ringOpacity}
              filter="url(#blur2)"
            />
          );
        })}

        {/* Leader glow area */}
        <circle
          cx={leaderX}
          cy={leaderY}
          r={120 * leaderDominance}
          fill="url(#leaderGlow)"
          opacity={0.3 * battleProgress}
          filter="url(#blur8)"
        />

        {/* Challenger pulse rings */}
        {CHALLENGER_RINGS.map((ring, i) => {
          const ringFrame = (frame - ring.delay + durationInFrames) % 100;
          const progress = ringFrame / 100;
          const radius = progress * ring.maxRadius * challengerGrowth;
          const ringOpacity = interpolate(progress, [0, 0.3, 1], [0, 0.55, 0]) * battleProgress;
          return (
            <circle
              key={`cr${i}`}
              cx={challengerX}
              cy={challengerY}
              r={radius}
              fill="none"
              stroke="#ff6b35"
              strokeWidth={interpolate(progress, [0, 0.5, 1], [3, 1.5, 0.5])}
              opacity={ringOpacity}
              filter="url(#blur2)"
            />
          );
        })}

        {/* Challenger glow area */}
        <circle
          cx={challengerX}
          cy={challengerY}
          r={100 * challengerGrowth}
          fill="url(#challengerGlow)"
          opacity={0.25 * battleProgress}
          filter="url(#blur8)"
        />

        {/* Collision zone between leader and challenger */}
        {battleProgress > 0.3 && (() => {
          const collisionX = (leaderX + challengerX) / 2;
          const collisionY = (leaderY + challengerY) / 2;
          const collisionPulse = Math.sin(frame * 0.15) * 0.5 + 0.5;
          const collisionIntensity = interpolate(battleProgress, [0.3, 0.7], [0, 1], { extrapolateRight: 'clamp' });
          return (
            <g>
              <circle
                cx={collisionX}
                cy={collisionY}
                r={40 + collisionPulse * 20}
                fill="none"
                stroke="#aa55ff"
                strokeWidth="1"
                opacity={0.4 * collisionIntensity}
                filter="url(#blur4)"
              />
              <circle
                cx={collisionX}
                cy={collisionY}
                r={20 + collisionPulse * 10}
                fill="#aa55ff"
                opacity={0.08 * collisionIntensity}
                filter="url(#blur4)"
              />
            </g>
          );
        })()}

        {/* Leader core */}
        <circle
          cx={leaderX}
          cy={leaderY}
          r={22 * leaderDominance * leaderPulseBase}
          fill="#003355"
          opacity="0.9"
        />
        <circle
          cx={leaderX}
          cy={leaderY}
          r={18 * leaderDominance * leaderPulseBase}
          fill="#0066aa"
          opacity="0.9"
          filter="url(#glow)"
        />
        <circle
          cx={leaderX}
          cy={leaderY}
          r={10 * leaderDominance * leaderPulseBase}
          fill="#00d4ff"
          opacity="0.95"
          filter="url(#glow)"
        />
        <circle
          cx={leaderX}
          cy={leaderY}
          r={5}
          fill="#ffffff"
          opacity="1"
        />

        {/* Leader orbit rings */}
        {[30, 50, 75].map((r, i) => {
          const orbitOp = 0.25 + 0.1 * Math.sin(frame * 0.05 + i);
          return (
            <circle
              key={`lorbit${i}`}
              cx={leaderX}
              cy={leaderY}
              r={r * leaderDominance}
              fill="none"
              stroke="#00aadd"
              strokeWidth="0.8"
              strokeDasharray={`${r * 0.3} ${r * 0.15}`}
              opacity={orbitOp}
            />
          );
        })}

        {/* Challenger core */}
        <circle
          cx={challengerX}
          cy={challengerY}
          r={18 * challengerGrowth * challengerPulseBase}
          fill="#331100"
          opacity="0.9"
        />
        <circle
          cx={challengerX}
          cy={challengerY}
          r={14 * challengerGrowth * challengerPulseBase}
          fill="#993300"
          opacity="0.9"
          filter="url(#glow)"
        />
        <circle
          cx={challengerX}
          cy={challengerY}
          r={8 * challengerGrowth * challengerPulseBase}
          fill="#ff6b35"
          opacity="0.95"
          filter="url(#glow)"
        />
        <circle
          cx={challengerX}
          cy={challengerY}
          r={4}
          fill="#ffcc99"
          opacity="1"
        />

        {/* Challenger orbit rings */}
        {[25, 42, 62].map((r, i) => {
          const orbitOp = 0.2 + 0.1 * Math.sin(frame * 0.06 + i + 2);
          return (
            <circle
              key={`corbit${i}`}
              cx={challengerX}
              cy={challengerY}
              r={r * challengerGrowth}
              fill="none"
              stroke="#ff6633"
              strokeWidth="0.8"
              strokeDasharray={`${r * 0.3} ${r * 0.15}`}
              opacity={orbitOp}
            />
          );
        })}

        {/* Connection line between nodes */}
        {battleProgress > 0.2 && (() => {
          const lineOpacity = interpolate(battleProgress, [0.2, 0.6], [0, 0.4], { extrapolateRight: 'clamp' });
          const dashOffset = -frame * 2;
          return (
            <line
              x1={leaderX}
              y1={leaderY}
              x2={challengerX}
              y2={challengerY}
              stroke="#8844cc"
              strokeWidth="0.8"
              strokeDasharray="8 6"
              strokeDashoffset={dashOffset}
              opacity={lineOpacity}
            />
          );
        })()}

        {/* Secondary market nodes */}
        {[
          { x: 420, y: 380, color: '#00aaff', size: 0.5 },
          { x: 200, y: 280, color: '#00ccee', size: 0.4 },
          { x: 520, y: 200, color: '#0088bb', size: 0.35 },
          { x: 730, y: 380, color: '#ff8844', size: 0.45 },
          { x: 820, y: 280, color: '#ff5511', size: 0.35 },
        ].map((node, i) => {
          const nodePulse = Math.sin(frame * 0.07 + i * 1.3) * 0.2 + 1;
          const nodeDelay = i * 60;
          const nodeProgress = interpolate(frame - nodeDelay, [0, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const ringFrame2 = (frame - nodeDelay) % 90;
          const ringProg2 = ringFrame2 / 90;
          const ringOp2 = interpolate(ringProg2, [0, 0.4, 1], [0, 0.5, 0]) * nodeProgress;
          return (
            <g key={`snode${i}`} opacity={nodeProgress}>
              <circle
                cx={node.x}
                cy={node.y}
                r={50 * node.size * ringProg2}
                fill="none"
                stroke={node.color}
                strokeWidth="1"
                opacity={ringOp2}
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={10 * node.size * nodePulse}
                fill={node.color}
                opacity="0.4"
                filter="url(#blur2)"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={5 * node.size * nodePulse}
                fill={node.color}
                opacity="0.8"
              />
              <circle cx={node.x} cy={node.y} r={2 * node.size} fill="#ffffff" opacity="0.9" />
            </g>
          );
        })}

        {/* Scanlines effect */}
        {Array.from({ length: 27 }, (_, i) => (
          <line
            key={`scan${i}`}
            x1="0"
            y1={i * 20}
            x2="960"
            y2={i * 20}
            stroke="#aaccff"
            strokeWidth="0.3"
            opacity="0.03"
          />
        ))}

        {/* Corner markers */}
        {[
          { x: 20, y: 20 },
          { x: 940, y: 20 },
          { x: 20, y: 520 },
          { x: 940, y: 520 },
        ].map((corner, i) => {
          const dx = i % 2 === 0 ? 1 : -1;
          const dy = i < 2 ? 1 : -1;
          return (
            <g key={`corner${i}`} opacity="0.4">
              <line x1={corner.x} y1={corner.y} x2={corner.x + dx * 15} y2={corner.y} stroke="#334466" strokeWidth="1.5" />
              <line x1={corner.x} y1={corner.y} x2={corner.x} y2={corner.y + dy * 15} stroke="#334466" strokeWidth="1.5" />
            </g>
          );
        })}

        {/* Global overlay vignette */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.7" />
        </radialGradient>
        <rect x="0" y="0" width="960" height="540" fill="url(#vignette)" />
      </svg>
    </div>
  );
};