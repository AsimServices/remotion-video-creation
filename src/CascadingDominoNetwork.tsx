import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITIES = [
  { id: 0, name: 'Tokyo', x: 0.78, y: 0.32, connections: [1, 2, 14] },
  { id: 1, name: 'Seoul', x: 0.76, y: 0.29, connections: [0, 2, 14] },
  { id: 2, name: 'Beijing', x: 0.74, y: 0.28, connections: [1, 3, 0] },
  { id: 3, name: 'Delhi', x: 0.67, y: 0.35, connections: [2, 4, 15] },
  { id: 4, name: 'Dubai', x: 0.61, y: 0.37, connections: [3, 5, 15] },
  { id: 5, name: 'Moscow', x: 0.58, y: 0.22, connections: [4, 6, 16] },
  { id: 6, name: 'Istanbul', x: 0.56, y: 0.30, connections: [5, 7, 4] },
  { id: 7, name: 'Cairo', x: 0.55, y: 0.38, connections: [6, 8, 4] },
  { id: 8, name: 'Nairobi', x: 0.57, y: 0.48, connections: [7, 9, 17] },
  { id: 9, name: 'Johannesburg', x: 0.56, y: 0.58, connections: [8, 17] },
  { id: 10, name: 'London', x: 0.465, y: 0.22, connections: [11, 6, 5] },
  { id: 11, name: 'Paris', x: 0.48, y: 0.25, connections: [10, 12, 6] },
  { id: 12, name: 'Berlin', x: 0.50, y: 0.22, connections: [11, 5, 10] },
  { id: 13, name: 'Lagos', x: 0.47, y: 0.45, connections: [7, 8, 11] },
  { id: 14, name: 'Shanghai', x: 0.76, y: 0.33, connections: [0, 2, 1] },
  { id: 15, name: 'Mumbai', x: 0.66, y: 0.40, connections: [3, 4, 7] },
  { id: 16, name: 'St. Petersburg', x: 0.57, y: 0.19, connections: [5, 12, 10] },
  { id: 17, name: 'Cape Town', x: 0.54, y: 0.62, connections: [9, 8] },
  { id: 18, name: 'New York', x: 0.27, y: 0.27, connections: [19, 20, 10] },
  { id: 19, name: 'Chicago', x: 0.24, y: 0.25, connections: [18, 20, 21] },
  { id: 20, name: 'Washington', x: 0.27, y: 0.28, connections: [18, 11, 21] },
  { id: 21, name: 'Toronto', x: 0.25, y: 0.24, connections: [18, 19, 22] },
  { id: 22, name: 'Mexico City', x: 0.21, y: 0.37, connections: [19, 23, 21] },
  { id: 23, name: 'Sao Paulo', x: 0.31, y: 0.55, connections: [22, 24, 13] },
  { id: 24, name: 'Buenos Aires', x: 0.29, y: 0.62, connections: [23] },
  { id: 25, name: 'Los Angeles', x: 0.16, y: 0.30, connections: [19, 22, 26] },
  { id: 26, name: 'Vancouver', x: 0.16, y: 0.22, connections: [25, 21, 27] },
  { id: 27, name: 'Anchorage', x: 0.12, y: 0.18, connections: [26, 1] },
  { id: 28, name: 'Sydney', x: 0.83, y: 0.60, connections: [29, 14, 0] },
  { id: 29, name: 'Melbourne', x: 0.82, y: 0.63, connections: [28] },
  { id: 30, name: 'Singapore', x: 0.75, y: 0.46, connections: [14, 15, 28] },
  { id: 31, name: 'Bangkok', x: 0.73, y: 0.41, connections: [30, 3, 14] },
];

const TRIGGER_FRAMES: Record<number, number> = {};
(() => {
  const visited = new Set<number>();
  const queue: Array<{ id: number; frame: number }> = [{ id: 0, frame: 30 }];
  while (queue.length > 0) {
    const item = queue.shift()!;
    if (visited.has(item.id)) continue;
    visited.add(item.id);
    TRIGGER_FRAMES[item.id] = item.frame;
    const city = CITIES[item.id];
    city.connections.forEach((connId, idx) => {
      if (!visited.has(connId)) {
        queue.push({ id: connId, frame: item.frame + 18 + (idx % 3) * 6 });
      }
    });
  }
})();

const STAR_COUNT = 300;
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  x: (i * 2473 + 137) % 3840,
  y: (i * 1931 + 89) % 2160,
  size: ((i * 17) % 4) + 1,
  brightness: ((i * 53) % 60) + 40,
}));

const PULSE_RINGS = Array.from({ length: CITIES.length }, (_, i) => ({
  delay: (i * 7) % 15,
}));

export const CascadingDominoNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const cx = (ratio: number) => ratio * width;
  const cy = (ratio: number) => ratio * height;
  const baseNodeR = width * 0.005;

  const cityStates = CITIES.map((city) => {
    const triggerFrame = TRIGGER_FRAMES[city.id] ?? 9999;
    const sinceActive = frame - triggerFrame;
    const active = sinceActive >= 0;
    const activationProgress = active
      ? interpolate(sinceActive, [0, 30], [0, 1], { extrapolateRight: 'clamp' })
      : 0;
    return { active, activationProgress, sinceActive, triggerFrame };
  });

  const connectionLines: JSX.Element[] = [];
  const drawn = new Set<string>();

  CITIES.forEach((city) => {
    city.connections.forEach((connId) => {
      const key = [Math.min(city.id, connId), Math.max(city.id, connId)].join('-');
      if (drawn.has(key)) return;
      drawn.add(key);

      const other = CITIES[connId];
      const stateA = cityStates[city.id];
      const stateB = cityStates[connId];

      const startTrigger = Math.min(TRIGGER_FRAMES[city.id] ?? 9999, TRIGGER_FRAMES[connId] ?? 9999);
      const endTrigger = Math.max(TRIGGER_FRAMES[city.id] ?? 9999, TRIGGER_FRAMES[connId] ?? 9999);
      const lineProgress = interpolate(
        frame,
        [startTrigger, endTrigger + 20],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );

      const bothActive = stateA.active && stateB.active;
      const lineOpacity = bothActive
        ? interpolate(stateB.activationProgress + stateA.activationProgress, [0, 2], [0.1, 0.55])
        : lineProgress * 0.3;

      const x1 = cx(city.x);
      const y1 = cy(city.y);
      const x2 = cx(other.x);
      const y2 = cy(other.y);

      const midX = (x1 + x2) / 2 + ((city.id * 37 + connId * 19) % 60 - 30) * (width / 3840) * 8;
      const midY = (y1 + y2) / 2 + ((city.id * 29 + connId * 41) % 60 - 30) * (height / 2160) * 8;

      const pulsePhase = ((frame + city.id * 13 + connId * 7) % 60) / 60;
      const pulseOpacity = bothActive ? 0.15 + 0.25 * Math.sin(pulsePhase * Math.PI * 2) : 0;

      connectionLines.push(
        <g key={key}>
          <path
            d={`M${x1},${y1} Q${midX},${midY} ${x2},${y2}`}
            fill="none"
            stroke={`rgba(80,180,255,${lineOpacity})`}
            strokeWidth={width * 0.00035}
          />
          {bothActive && (
            <path
              d={`M${x1},${y1} Q${midX},${midY} ${x2},${y2}`}
              fill="none"
              stroke={`rgba(120,220,255,${pulseOpacity})`}
              strokeWidth={width * 0.0007}
              strokeDasharray={`${width * 0.02} ${width * 0.04}`}
              strokeDashoffset={-frame * width * 0.004}
            />
          )}
        </g>
      );
    });
  });

  return (
    <div style={{ width, height, background: '#020810', overflow: 'hidden', opacity: globalOpacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Stars */}
        {STARS.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star.x}
            cy={star.y}
            r={star.size * 0.5 * (width / 3840)}
            fill={`rgba(200,220,255,${star.brightness / 100})`}
          />
        ))}

        {/* Globe outline circles */}
        {[0.38, 0.44, 0.50].map((r, i) => (
          <ellipse
            key={`globe-ring-${i}`}
            cx={width * 0.5}
            cy={height * 0.5}
            rx={width * r}
            ry={height * r * 0.55}
            fill="none"
            stroke={`rgba(30,70,120,${0.12 - i * 0.03})`}
            strokeWidth={width * 0.0005}
          />
        ))}

        {/* Latitude/longitude grid lines */}
        {Array.from({ length: 7 }, (_, i) => {
          const ratio = (i + 1) / 8;
          return (
            <line
              key={`lat-${i}`}
              x1={0}
              y1={height * ratio}
              x2={width}
              y2={height * ratio}
              stroke="rgba(30,60,100,0.08)"
              strokeWidth={width * 0.0003}
            />
          );
        })}
        {Array.from({ length: 11 }, (_, i) => {
          const ratio = (i + 1) / 12;
          return (
            <line
              key={`lon-${i}`}
              x1={width * ratio}
              y1={0}
              x2={width * ratio}
              y2={height}
              stroke="rgba(30,60,100,0.08)"
              strokeWidth={width * 0.0003}
            />
          );
        })}

        {/* Connection lines */}
        {connectionLines}

        {/* City nodes */}
        {CITIES.map((city, idx) => {
          const state = cityStates[idx];
          const x = cx(city.x);
          const y = cy(city.y);
          const pulse = PULSE_RINGS[idx];

          const glowR = baseNodeR * (1 + state.activationProgress * 4);
          const coreR = baseNodeR * (0.4 + state.activationProgress * 0.8);

          const ringProgress1 = state.active
            ? ((state.sinceActive + pulse.delay * 3) % 90) / 90
            : 0;
          const ringOpacity1 = state.active
            ? interpolate(ringProgress1, [0, 0.5, 1], [0.7, 0.3, 0])
            : 0;
          const ringR1 = baseNodeR * 1.5 + ringProgress1 * baseNodeR * 8;

          const ringProgress2 = state.active
            ? ((state.sinceActive + 30 + pulse.delay * 3) % 90) / 90
            : 0;
          const ringOpacity2 = state.active
            ? interpolate(ringProgress2, [0, 0.5, 1], [0.5, 0.2, 0])
            : 0;
          const ringR2 = baseNodeR * 1.5 + ringProgress2 * baseNodeR * 8;

          const color = state.active
            ? `rgba(${Math.round(80 + state.activationProgress * 120)},${Math.round(160 + state.activationProgress * 60)},255,1)`
            : 'rgba(40,80,140,0.6)';

          const glowColor = state.active
            ? `rgba(100,180,255,${state.activationProgress * 0.4})`
            : 'rgba(40,80,140,0.1)';

          const burstProgress = interpolate(state.sinceActive, [0, 25], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const burstOpacity = state.active
            ? interpolate(state.sinceActive, [0, 8, 25], [0, 0.9, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
            : 0;

          return (
            <g key={`city-${idx}`}>
              {/* Burst flash */}
              <circle
                cx={x}
                cy={y}
                r={baseNodeR * 3 * burstProgress}
                fill={`rgba(180,230,255,${burstOpacity})`}
              />

              {/* Pulse rings */}
              <circle
                cx={x}
                cy={y}
                r={ringR1}
                fill="none"
                stroke={`rgba(80,180,255,${ringOpacity1})`}
                strokeWidth={width * 0.0006}
              />
              <circle
                cx={x}
                cy={y}
                r={ringR2}
                fill="none"
                stroke={`rgba(100,200,255,${ringOpacity2})`}
                strokeWidth={width * 0.0004}
              />

              {/* Glow */}
              <circle cx={x} cy={y} r={glowR} fill={glowColor} />

              {/* Core */}
              <circle cx={x} cy={y} r={coreR} fill={color} />

              {/* Inner bright dot */}
              {state.active && (
                <circle
                  cx={x}
                  cy={y}
                  r={coreR * 0.4}
                  fill={`rgba(220,240,255,${state.activationProgress})`}
                />
              )}

              {/* Domino lines radiating outward at activation */}
              {state.active &&
                Array.from({ length: 6 }, (_, k) => {
                  const angle = (k / 6) * Math.PI * 2 + idx * 0.3;
                  const rayProgress = interpolate(state.sinceActive, [0, 20], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  });
                  const rayLen = rayProgress * baseNodeR * 6;
                  const rayOpacity = interpolate(state.sinceActive, [0, 5, 20, 40], [0, 0.8, 0.6, 0], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  });
                  return (
                    <line
                      key={`ray-${idx}-${k}`}
                      x1={x + Math.cos(angle) * coreR}
                      y1={y + Math.sin(angle) * coreR}
                      x2={x + Math.cos(angle) * (coreR + rayLen)}
                      y2={y + Math.sin(angle) * (coreR + rayLen)}
                      stroke={`rgba(140,210,255,${rayOpacity})`}
                      strokeWidth={width * 0.0006}
                    />
                  );
                })}
            </g>
          );
        })}

        {/* Global ambient glow overlay */}
        <radialGradient id="ambientGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(20,60,120,0.0)" />
          <stop offset="100%" stopColor="rgba(0,5,20,0.5)" />
        </radialGradient>
        <rect x={0} y={0} width={width} height={height} fill="url(#ambientGlow)" />

        {/* Scanline effect */}
        {Array.from({ length: 30 }, (_, i) => (
          <line
            key={`scan-${i}`}
            x1={0}
            y1={(height / 30) * i}
            x2={width}
            y2={(height / 30) * i}
            stroke="rgba(0,20,60,0.04)"
            strokeWidth={height / 60}
          />
        ))}
      </svg>
    </div>
  );
};