import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const ENERGY_LINES = Array.from({ length: 40 }, (_, i) => ({
  x1: 50 + (i * 1731) % 420,
  y1: 50 + (i * 1337) % 320,
  x2: 50 + ((i + 7) * 1973) % 420,
  y2: 50 + ((i + 3) * 1511) % 320,
  hue: (i * 47) % 60 + 20,
  delay: (i * 13) % 80,
  speed: 0.5 + (i % 5) * 0.3,
}));

const NODES = Array.from({ length: 28 }, (_, i) => ({
  x: 80 + (i * 1873) % 360,
  y: 60 + (i * 1231) % 280,
  r: 2 + (i % 4) * 1.5,
  delay: (i * 17) % 100,
  hue: (i * 53) % 80 + 10,
}));

const PULSE_RINGS = Array.from({ length: 8 }, (_, i) => ({
  x: 120 + (i * 2311) % 280,
  y: 80 + (i * 1789) % 240,
  delay: (i * 30) % 120,
  size: 8 + (i % 4) * 5,
}));

const STAR_FIELD = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 1931) % 3840,
  y: (i * 1301) % 2160,
  r: 0.5 + (i % 3) * 0.8,
  brightness: 0.3 + (i % 5) * 0.14,
}));

const MIDDLE_EAST_PATH = `
  M 200 180 L 220 160 L 260 155 L 290 165 L 310 175 L 330 165 L 350 170 L 370 180
  L 380 195 L 370 210 L 360 225 L 345 235 L 330 245 L 310 250 L 295 260
  L 280 270 L 265 280 L 255 290 L 245 300 L 235 310 L 225 320
  L 215 310 L 205 295 L 195 275 L 190 255 L 192 235 L 195 215 L 200 200 Z
`;

const GULF_PATH = `
  M 295 260 L 310 250 L 325 255 L 335 268 L 340 282 L 332 292
  L 320 298 L 308 295 L 298 285 L 293 272 L 295 260 Z
`;

const ARABIAN_PENINSULA = `
  M 280 270 L 295 260 L 310 250 L 330 245 L 345 248 L 358 260
  L 365 278 L 368 298 L 362 318 L 350 335 L 335 348 L 318 355
  L 302 350 L 288 338 L 278 320 L 272 300 L 275 285 L 280 270 Z
`;

export const CorporateGlobeMiddleEast: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const zoomProgress = interpolate(frame, [0, durationInFrames * 0.6], [0, 1], {
    extrapolateRight: 'clamp',
    easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  });

  const globeScale = interpolate(zoomProgress, [0, 1], [0.18, 1.0]);
  const globeX = interpolate(zoomProgress, [0, 1], [width / 2, width / 2]);
  const globeY = interpolate(zoomProgress, [0, 1], [height / 2, height / 2]);

  const mapViewX = interpolate(zoomProgress, [0, 1], [width / 2 - 260, width / 2 - 260]);
  const mapViewY = interpolate(zoomProgress, [0, 1], [height / 2 - 200, height / 2 - 200]);
  const mapScale = interpolate(zoomProgress, [0, 1], [2, 5.5]);

  const globeOpacity = interpolate(zoomProgress, [0.5, 0.85], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const mapOpacity = interpolate(zoomProgress, [0.55, 0.85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const globeRotation = interpolate(frame, [0, durationInFrames], [0, 180]);
  const ambientPulse = Math.sin(frame * 0.05) * 0.5 + 0.5;
  const slowPulse = Math.sin(frame * 0.02) * 0.5 + 0.5;

  const MAP_W = 520;
  const MAP_H = 400;
  const MAP_SCALE = 4.5;

  return (
    <div style={{ width, height, background: '#000308', overflow: 'hidden', position: 'relative', opacity }}>
      {/* Star field */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {STAR_FIELD.map((star, i) => (
          <circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill={`rgba(180, 210, 255, ${star.brightness * (0.6 + 0.4 * Math.sin(frame * 0.03 + i))})`}
          />
        ))}
      </svg>

      {/* Deep space nebula glow */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `radial-gradient(ellipse 60% 60% at 50% 50%, rgba(10, 30, 80, ${0.3 + ambientPulse * 0.1}) 0%, transparent 70%)`,
      }} />

      {/* Globe */}
      <div style={{
        position: 'absolute',
        left: globeX,
        top: globeY,
        transform: `translate(-50%, -50%) scale(${globeScale})`,
        opacity: globeOpacity,
      }}>
        <svg width={900} height={900} viewBox="-450 -450 900 900">
          <defs>
            <radialGradient id="globeGrad" cx="35%" cy="35%">
              <stop offset="0%" stopColor="#0a2a6e" />
              <stop offset="40%" stopColor="#061535" />
              <stop offset="100%" stopColor="#020810" />
            </radialGradient>
            <radialGradient id="globeGlow" cx="50%" cy="50%">
              <stop offset="60%" stopColor="transparent" />
              <stop offset="100%" stopColor="rgba(30, 120, 255, 0.4)" />
            </radialGradient>
            <clipPath id="globeClip">
              <circle cx="0" cy="0" r="420" />
            </clipPath>
            <filter id="globeBloom">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Globe body */}
          <circle cx="0" cy="0" r="420" fill="url(#globeGrad)" />

          {/* Grid lines */}
          <g clipPath="url(#globeClip)" opacity="0.25">
            {Array.from({ length: 18 }, (_, i) => {
              const angle = (i * 20 + globeRotation) % 360;
              const rad = (angle * Math.PI) / 180;
              return (
                <ellipse
                  key={`lon-${i}`}
                  cx="0" cy="0"
                  rx={Math.abs(Math.cos(rad)) * 420}
                  ry="420"
                  fill="none"
                  stroke="rgba(50, 150, 255, 0.6)"
                  strokeWidth="1"
                />
              );
            })}
            {Array.from({ length: 9 }, (_, i) => (
              <ellipse
                key={`lat-${i}`}
                cx="0" cy={(i - 4) * 93}
                rx={Math.sqrt(Math.max(0, 420 * 420 - ((i - 4) * 93) ** 2))}
                ry={Math.sqrt(Math.max(0, 420 * 420 - ((i - 4) * 93) ** 2)) * 0.15}
                fill="none"
                stroke="rgba(50, 150, 255, 0.6)"
                strokeWidth="1"
              />
            ))}
          </g>

          {/* Atmosphere glow */}
          <circle cx="0" cy="0" r="420" fill="url(#globeGlow)" />
          <circle cx="0" cy="0" r="430" fill="none" stroke="rgba(60, 160, 255, 0.5)" strokeWidth="12" />
          <circle cx="0" cy="0" r="445" fill="none" stroke="rgba(30, 100, 255, 0.2)" strokeWidth="20" />

          {/* Highlight */}
          <ellipse cx="-100" cy="-120" rx="120" ry="80"
            fill="rgba(100, 180, 255, 0.08)" />

          {/* Middle East indicator */}
          <g clipPath="url(#globeClip)">
            <circle cx="60" cy="20" r="30"
              fill="none"
              stroke={`rgba(255, 180, 50, ${0.5 + ambientPulse * 0.5})`}
              strokeWidth="2"
            />
            <circle cx="60" cy="20" r="50"
              fill="none"
              stroke={`rgba(255, 150, 30, ${0.2 + ambientPulse * 0.3})`}
              strokeWidth="1"
            />
            <circle cx="60" cy="20" r="8"
              fill={`rgba(255, 200, 50, ${0.6 + ambientPulse * 0.4})`}
            />
          </g>
        </svg>
      </div>

      {/* Map layer */}
      <div style={{
        position: 'absolute',
        left: mapViewX,
        top: mapViewY,
        opacity: mapOpacity,
        transform: `scale(${mapScale})`,
        transformOrigin: 'center center',
      }}>
        <svg width={MAP_W * MAP_SCALE} height={MAP_H * MAP_SCALE}
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          style={{ display: 'block' }}>
          <defs>
            <radialGradient id="mapBg" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#020c20" />
              <stop offset="100%" stopColor="#010810" />
            </radialGradient>
            <filter id="lineGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="nodeGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="strongGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect width={MAP_W} height={MAP_H} fill="url(#mapBg)" />

          {/* Ocean subtle texture */}
          {Array.from({ length: 20 }, (_, i) => (
            <line
              key={`ocean-${i}`}
              x1="0" y1={i * 22}
              x2={MAP_W} y2={i * 22}
              stroke="rgba(10, 40, 80, 0.3)"
              strokeWidth="0.5"
            />
          ))}

          {/* Land masses - Middle East region */}
          <g opacity="0.7">
            <path d={MIDDLE_EAST_PATH}
              fill="rgba(15, 35, 60, 0.9)"
              stroke="rgba(30, 80, 150, 0.5)"
              strokeWidth="0.8"
            />
            <path d={ARABIAN_PENINSULA}
              fill="rgba(18, 40, 65, 0.9)"
              stroke="rgba(30, 80, 150, 0.5)"
              strokeWidth="0.8"
            />
            <path d={GULF_PATH}
              fill="rgba(5, 20, 45, 0.8)"
              stroke="rgba(20, 60, 120, 0.4)"
              strokeWidth="0.5"
            />
          </g>

          {/* Energy infrastructure lines */}
          <g filter="url(#lineGlow)">
            {ENERGY_LINES.map((line, i) => {
              const progress = interpolate(
                frame,
                [line.delay + 60, line.delay + 120, durationInFrames - 50],
                [0, 1, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              );
              const flowOffset = ((frame * line.speed * 0.5) % 60);
              const pulseAlpha = 0.5 + 0.5 * Math.sin(frame * 0.08 + i * 0.7);

              return (
                <g key={`line-${i}`} opacity={progress}>
                  <line
                    x1={line.x1} y1={line.y1}
                    x2={line.x2} y2={line.y2}
                    stroke={`hsla(${line.hue}, 100%, 50%, 0.15)`}
                    strokeWidth="2"
                  />
                  <line
                    x1={line.x1} y1={line.y1}
                    x2={line.x2} y2={line.y2}
                    stroke={`hsla(${line.hue}, 100%, 70%, ${0.5 * pulseAlpha})`}
                    strokeWidth="0.8"
                    strokeDasharray="8 20"
                    strokeDashoffset={-flowOffset}
                  />
                  <line
                    x1={line.x1} y1={line.y1}
                    x2={line.x2} y2={line.y2}
                    stroke={`hsla(${line.hue}, 100%, 90%, ${0.8 * pulseAlpha})`}
                    strokeWidth="0.3"
                  />
                </g>
              );
            })}
          </g>

          {/* Pulse rings */}
          {PULSE_RINGS.map((ring, i) => {
            const ringProgress = interpolate(
              frame,
              [ring.delay + 80, ring.delay + 140],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            const cycleFrame = (frame - ring.delay) % 90;
            const ringScale = interpolate(cycleFrame, [0, 90], [0, 2.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const ringAlpha = interpolate(cycleFrame, [0, 45, 90], [0.9, 0.5, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

            return (
              <g key={`ring-${i}`} opacity={ringProgress} filter="url(#nodeGlow)">
                <circle
                  cx={ring.x} cy={ring.y}
                  r={ring.size * ringScale}
                  fill="none"
                  stroke={`rgba(255, 180, 50, ${ringAlpha})`}
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Energy nodes */}
          <g filter="url(#nodeGlow)">
            {NODES.map((node, i) => {
              const nodeProgress = interpolate(
                frame,
                [node.delay + 70, node.delay + 110],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              );
              const nodePulse = 0.6 + 0.4 * Math.sin(frame * 0.1 + i * 1.3);

              return (
                <g key={`node-${i}`} opacity={nodeProgress}>
                  <circle
                    cx={node.x} cy={node.y}
                    r={node.r * 2.5}
                    fill={`hsla(${node.hue}, 100%, 60%, ${0.15 * nodePulse})`}
                  />
                  <circle
                    cx={node.x} cy={node.y}
                    r={node.r}
                    fill={`hsla(${node.hue}, 100%, 80%, ${nodePulse})`}
                  />
                </g>
              );
            })}
          </g>

          {/* Major hub indicators */}
          {[
            { x: 310, y: 245, label: 'hub1' },
            { x: 280, y: 290, label: 'hub2' },
            { x: 245, y: 200, label: 'hub3' },
            { x: 340, y: 280, label: 'hub4' },
          ].map((hub, i) => {
            const hubProgress = interpolate(
              frame, [100 + i * 20, 140 + i * 20], [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            const hubPulse = 0.5 + 0.5 * Math.sin(frame * 0.07 + i * 0.9);
            return (
              <g key={hub.label} filter="url(#strongGlow)" opacity={hubProgress}>
                <circle cx={hub.x} cy={hub.y} r={16} fill="none"
                  stroke={`rgba(255, 220, 80, ${0.3 * hubPulse})`} strokeWidth="1" />
                <circle cx={hub.x} cy={hub.y} r={10} fill="none"
                  stroke={`rgba(255, 200, 50, ${0.6 * hubPulse})`} strokeWidth="1.5" />
                <circle cx={hub.x} cy={hub.y} r={4}
                  fill={`rgba(255, 240, 100, ${hubPulse})`} />
                <circle cx={hub.x} cy={hub.y} r={2}
                  fill="rgba(255, 255, 200, 1)" />
              </g>
            );
          })}

          {/* Scan line effect */}
          <rect
            x="0"
            y={interpolate(frame % 150, [0, 150], [-10, MAP_H + 10])}
            width={MAP_W}
            height="4"
            fill={`rgba(50, 200, 255, ${0.08 + slowPulse * 0.05})`}
          />

          {/* Corner brackets */}
          {[
            [10, 10, 1, 1], [MAP_W - 10, 10, -1, 1],
            [10, MAP_H - 10, 1, -1], [MAP_W - 10, MAP_H - 10, -1, -1]
          ].map(([cx, cy, sx, sy], i) => (
            <g key={`corner-${i}`} opacity={interpolate(frame, [60, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
              <line x1={cx as number} y1={cy as number} x2={(cx as number) + (sx as number) * 20} y2={cy as number}
                stroke="rgba(50, 200, 255, 0.8)" strokeWidth="1.5" />
              <line x1={cx as number} y1={cy as number} x2={cx as number} y2={(cy as number) + (sy as number) * 20}
                stroke="rgba(50, 200, 255, 0.8)" strokeWidth="1.5" />
            </g>
          ))}

          {/* Map border glow */}
          <rect x="0" y="0" width={MAP_W} height={MAP_H}
            fill="none"
            stroke={`rgba(30, 120, 255, ${0.3 + slowPulse * 0.2})`}
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Outer vignette */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.7) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Top ambient glow bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '20%',
        right: '20%',
        height: '2px',
        background: `rgba(30, 150, 255, ${0.3 + ambientPulse * 0.3})`,
        boxShadow: `0 0 40px 10px rgba(30, 150, 255, ${0.2 + ambientPulse * 0.2})`,
      }} />
    </div>
  );
};