import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CITY_NODES_LEFT = Array.from({ length: 40 }, (_, i) => ({
  x: ((i * 1373 + 200) % 700) + 50,
  y: ((i * 937 + 150) % 500) + 100,
  size: ((i * 17) % 12) + 4,
  delay: (i * 7) % 60,
  pulseSpeed: ((i * 13) % 30) + 20,
}));

const CITY_NODES_RIGHT = Array.from({ length: 40 }, (_, i) => ({
  x: ((i * 1571 + 100) % 700) + 50,
  y: ((i * 1123 + 200) % 500) + 100,
  size: ((i * 19) % 12) + 4,
  delay: (i * 11) % 60,
  pulseSpeed: ((i * 17) % 30) + 20,
}));

const CONNECTIONS_LEFT = Array.from({ length: 30 }, (_, i) => ({
  x1: ((i * 1231) % 700) + 50,
  y1: ((i * 873) % 500) + 100,
  x2: (((i + 3) * 1373) % 700) + 50,
  y2: (((i + 5) * 937) % 500) + 100,
  delay: (i * 9) % 80,
}));

const CONNECTIONS_RIGHT = Array.from({ length: 30 }, (_, i) => ({
  x1: ((i * 1451) % 700) + 50,
  y1: ((i * 1049) % 500) + 100,
  x2: (((i + 4) * 1571) % 700) + 50,
  y2: (((i + 6) * 1123) % 500) + 100,
  delay: (i * 13) % 80,
}));

const PARTICLES_LEFT = Array.from({ length: 60 }, (_, i) => ({
  startX: ((i * 1373) % 700) + 50,
  startY: ((i * 937) % 500) + 100,
  endX: (((i + 7) * 1231) % 700) + 50,
  endY: (((i + 11) * 873) % 500) + 100,
  delay: (i * 8) % 120,
  duration: ((i * 23) % 40) + 30,
}));

const PARTICLES_RIGHT = Array.from({ length: 60 }, (_, i) => ({
  startX: ((i * 1571) % 700) + 50,
  startY: ((i * 1123) % 500) + 100,
  endX: (((i + 9) * 1451) % 700) + 50,
  endY: (((i + 13) * 1049) % 500) + 100,
  delay: (i * 11) % 120,
  duration: ((i * 29) % 40) + 30,
}));

const MAP_REGIONS_LEFT = Array.from({ length: 8 }, (_, i) => ({
  x: ((i * 211) % 600) + 50,
  y: ((i * 173) % 400) + 100,
  w: ((i * 97) % 150) + 80,
  h: ((i * 113) % 100) + 50,
  opacity: ((i * 37) % 30 + 10) / 100,
}));

const MAP_REGIONS_RIGHT = Array.from({ length: 8 }, (_, i) => ({
  x: ((i * 239) % 600) + 50,
  y: ((i * 197) % 400) + 100,
  w: ((i * 103) % 150) + 80,
  h: ((i * 127) % 100) + 50,
  opacity: ((i * 41) % 30 + 10) / 100,
}));

export const MarketSharePulse: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  const halfW = width / 2;
  const panelH = height;

  // Market share oscillation
  const shareOscillation = Math.sin(frame * 0.015) * 0.12;
  const leftShare = 0.52 + shareOscillation;
  const rightShare = 1 - leftShare;

  // Divider pulse
  const dividerGlow = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.3, 1]);

  const renderGrid = (side: 'left' | 'right') => {
    const cols = 20;
    const rows = 12;
    const cellW = halfW / cols;
    const cellH = panelH / rows;
    return Array.from({ length: cols * rows }, (_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const dist = Math.sqrt(Math.pow(col - cols / 2, 2) + Math.pow(row - rows / 2, 2));
      const wave = Math.sin(frame * 0.04 - dist * 0.3 + (side === 'left' ? 0 : Math.PI)) * 0.5 + 0.5;
      const opacity = wave * 0.06 + 0.02;
      return (
        <rect
          key={`grid-${side}-${i}`}
          x={col * cellW}
          y={row * cellH}
          width={cellW - 1}
          height={cellH - 1}
          fill={side === 'left' ? `rgba(0, 160, 255, ${opacity})` : `rgba(255, 80, 0, ${opacity})`}
        />
      );
    });
  };

  const renderMapRegions = (regions: typeof MAP_REGIONS_LEFT, side: 'left' | 'right') => {
    return regions.map((r, i) => {
      const pulse = Math.sin(frame * 0.03 + i * 0.7) * 0.5 + 0.5;
      const color = side === 'left' ? `rgba(0, 160, 255, ${r.opacity + pulse * 0.08})` : `rgba(255, 80, 0, ${r.opacity + pulse * 0.08})`;
      return (
        <rect
          key={`region-${side}-${i}`}
          x={r.x * (halfW / 800)}
          y={r.y * (panelH / 700)}
          width={r.w * (halfW / 800)}
          height={r.h * (panelH / 700)}
          rx={8}
          fill={color}
          stroke={side === 'left' ? `rgba(0, 200, 255, 0.15)` : `rgba(255, 120, 0, 0.15)`}
          strokeWidth={1}
        />
      );
    });
  };

  const renderConnections = (connections: typeof CONNECTIONS_LEFT, side: 'left' | 'right') => {
    return connections.map((c, i) => {
      const progress = ((frame - c.delay + 600) % 80) / 80;
      const opacity = progress < 0.5
        ? interpolate(progress, [0, 0.5], [0, 0.4])
        : interpolate(progress, [0.5, 1], [0.4, 0]);
      const color = side === 'left' ? `rgba(0, 200, 255, ${opacity})` : `rgba(255, 120, 30, ${opacity})`;
      return (
        <line
          key={`conn-${side}-${i}`}
          x1={c.x1 * (halfW / 800)}
          y1={c.y1 * (panelH / 700)}
          x2={c.x2 * (halfW / 800)}
          y2={c.y2 * (panelH / 700)}
          stroke={color}
          strokeWidth={1.5}
        />
      );
    });
  };

  const renderCityNodes = (nodes: typeof CITY_NODES_LEFT, side: 'left' | 'right', share: number) => {
    return nodes.map((n, i) => {
      const pulse = Math.sin((frame - n.delay) * (0.1 / (n.pulseSpeed / 20))) * 0.5 + 0.5;
      const baseSize = n.size * (halfW / 800) * (0.8 + share * 0.4);
      const pulseSize = baseSize * (1 + pulse * 0.6);
      const coreColor = side === 'left' ? '#00d4ff' : '#ff6020';
      const glowColor = side === 'left' ? 'rgba(0,200,255,0.15)' : 'rgba(255,100,0,0.15)';
      const cx = n.x * (halfW / 800);
      const cy = n.y * (panelH / 700);
      return (
        <g key={`node-${side}-${i}`}>
          <circle cx={cx} cy={cy} r={pulseSize * 2.5} fill={glowColor} />
          <circle cx={cx} cy={cy} r={pulseSize} fill={coreColor} opacity={0.7 + pulse * 0.3} />
          <circle cx={cx} cy={cy} r={baseSize * 0.4} fill="white" opacity={0.9} />
        </g>
      );
    });
  };

  const renderParticles = (particles: typeof PARTICLES_LEFT, side: 'left' | 'right') => {
    return particles.map((p, i) => {
      const cycleFrame = (frame - p.delay + 600) % (p.duration + 60);
      if (cycleFrame > p.duration) return null;
      const t = cycleFrame / p.duration;
      const px = p.startX + (p.endX - p.startX) * t;
      const py = p.startY + (p.endY - p.startY) * t;
      const opacity = t < 0.2 ? t / 0.2 : t > 0.8 ? (1 - t) / 0.2 : 1;
      const color = side === 'left' ? `rgba(0, 220, 255, ${opacity * 0.9})` : `rgba(255, 100, 0, ${opacity * 0.9})`;
      return (
        <circle
          key={`particle-${side}-${i}`}
          cx={px * (halfW / 800)}
          cy={py * (panelH / 700)}
          r={3 * (halfW / 1920)}
          fill={color}
        />
      );
    });
  };

  const renderRipples = (side: 'left' | 'right', share: number) => {
    const ripples = Array.from({ length: 5 }, (_, i) => {
      const cx = side === 'left' ? halfW * 0.5 : halfW * 0.5;
      const cy = panelH * 0.5;
      const rippleFrame = (frame + i * 40) % 180;
      const radius = interpolate(rippleFrame, [0, 180], [0, Math.min(halfW, panelH) * 0.6 * share]);
      const opacity = interpolate(rippleFrame, [0, 180], [0.4, 0]);
      const color = side === 'left'
        ? `rgba(0, 180, 255, ${opacity})`
        : `rgba(255, 90, 0, ${opacity})`;
      return (
        <circle key={`ripple-${side}-${i}`} cx={cx} cy={cy} r={radius} fill="none" stroke={color} strokeWidth={2} />
      );
    });
    return ripples;
  };

  const barHeight = panelH * 0.06;
  const barY = panelH - barHeight - panelH * 0.04;

  return (
    <div style={{ width, height, background: '#050810', opacity: globalOpacity, overflow: 'hidden', position: 'relative' }}>

      {/* Left Panel - Brand A */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: halfW, height: panelH, overflow: 'hidden' }}>
        <svg width={halfW} height={panelH} style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <radialGradient id="bgGradLeft" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#001833" />
              <stop offset="100%" stopColor="#050810" />
            </radialGradient>
            <radialGradient id="glowLeft" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0,160,255,0.15)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>
          <rect width={halfW} height={panelH} fill="url(#bgGradLeft)" />
          <rect width={halfW} height={panelH} fill="url(#glowLeft)" />
          {renderGrid('left')}
          {renderMapRegions(MAP_REGIONS_LEFT, 'left')}
          {renderConnections(CONNECTIONS_LEFT, 'left')}
          {renderRipples('left', leftShare)}
          {renderCityNodes(CITY_NODES_LEFT, 'left', leftShare)}
          {renderParticles(PARTICLES_LEFT, 'left')}

          {/* Share bar */}
          <rect x={halfW * 0.1} y={barY} width={halfW * 0.8} height={barHeight} rx={barHeight / 2} fill="rgba(0,0,0,0.5)" />
          <rect
            x={halfW * 0.1}
            y={barY}
            width={halfW * 0.8 * leftShare}
            height={barHeight}
            rx={barHeight / 2}
            fill="rgba(0, 180, 255, 0.8)"
          />

          {/* Share percentage indicator dots */}
          {Array.from({ length: 10 }, (_, i) => {
            const dotX = halfW * 0.1 + (halfW * 0.8 / 10) * i + halfW * 0.04;
            const filled = (i + 1) / 10 <= leftShare;
            return (
              <circle
                key={`dot-left-${i}`}
                cx={dotX}
                cy={barY + barHeight / 2}
                r={barHeight * 0.35}
                fill={filled ? 'rgba(0,220,255,0.9)' : 'rgba(0,100,150,0.3)'}
              />
            );
          })}

          {/* Corner accent */}
          <line x1={0} y1={0} x2={halfW * 0.15} y2={0} stroke="rgba(0,200,255,0.6)" strokeWidth={3} />
          <line x1={0} y1={0} x2={0} y2={panelH * 0.08} stroke="rgba(0,200,255,0.6)" strokeWidth={3} />
          <line x1={halfW} y1={panelH} x2={halfW - halfW * 0.15} y2={panelH} stroke="rgba(0,200,255,0.3)" strokeWidth={2} />
          <line x1={halfW} y1={panelH} x2={halfW} y2={panelH - panelH * 0.08} stroke="rgba(0,200,255,0.3)" strokeWidth={2} />

          {/* Scanline overlay */}
          {Array.from({ length: 30 }, (_, i) => (
            <line
              key={`scan-left-${i}`}
              x1={0}
              y1={(i / 30) * panelH}
              x2={halfW}
              y2={(i / 30) * panelH}
              stroke="rgba(0,0,0,0.08)"
              strokeWidth={1}
            />
          ))}
        </svg>
      </div>

      {/* Right Panel - Brand B */}
      <div style={{ position: 'absolute', left: halfW, top: 0, width: halfW, height: panelH, overflow: 'hidden' }}>
        <svg width={halfW} height={panelH} style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <radialGradient id="bgGradRight" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#1a0800" />
              <stop offset="100%" stopColor="#050810" />
            </radialGradient>
            <radialGradient id="glowRight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,100,0,0.15)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>
          <rect width={halfW} height={panelH} fill="url(#bgGradRight)" />
          <rect width={halfW} height={panelH} fill="url(#glowRight)" />
          {renderGrid('right')}
          {renderMapRegions(MAP_REGIONS_RIGHT, 'right')}
          {renderConnections(CONNECTIONS_RIGHT, 'right')}
          {renderRipples('right', rightShare)}
          {renderCityNodes(CITY_NODES_RIGHT, 'right', rightShare)}
          {renderParticles(PARTICLES_RIGHT, 'right')}

          {/* Share bar */}
          <rect x={halfW * 0.1} y={barY} width={halfW * 0.8} height={barHeight} rx={barHeight / 2} fill="rgba(0,0,0,0.5)" />
          <rect
            x={halfW * 0.1}
            y={barY}
            width={halfW * 0.8 * rightShare}
            height={barHeight}
            rx={barHeight / 2}
            fill="rgba(255, 100, 0, 0.8)"
          />

          {Array.from({ length: 10 }, (_, i) => {
            const dotX = halfW * 0.1 + (halfW * 0.8 / 10) * i + halfW * 0.04;
            const filled = (i + 1) / 10 <= rightShare;
            return (
              <circle
                key={`dot-right-${i}`}
                cx={dotX}
                cy={barY + barHeight / 2}
                r={barHeight * 0.35}
                fill={filled ? 'rgba(255,160,0,0.9)' : 'rgba(150,60,0,0.3)'}
              />
            );
          })}

          {/* Corner accent */}
          <line x1={0} y1={0} x2={halfW * 0.15} y2={0} stroke="rgba(255,120,0,0.6)" strokeWidth={3} />
          <line x1={0} y1={0} x2={0} y2={panelH * 0.08} stroke="rgba(255,120,0,0.6)" strokeWidth={3} />
          <line x1={halfW} y1={panelH} x2={halfW - halfW * 0.15} y2={panelH} stroke="rgba(255,120,0,0.3)" strokeWidth={2} />
          <line x1={halfW} y1={panelH} x2={halfW} y2={panelH - panelH * 0.08} stroke="rgba(255,120,0,0.3)" strokeWidth={2} />

          {Array.from({ length: 30 }, (_, i) => (
            <line
              key={`scan-right-${i}`}
              x1={0}
              y1={(i / 30) * panelH}
              x2={halfW}
              y2={(i / 30) * panelH}
              stroke="rgba(0,0,0,0.08)"
              strokeWidth={1}
            />
          ))}
        </svg>
      </div>

      {/* Center Divider */}
      <div style={{
        position: 'absolute',
        left: halfW - 2,
        top: 0,
        width: 4,
        height: panelH,
        background: `linear-gradient(to bottom, transparent, rgba(200,200,255,${dividerGlow * 0.8}), transparent)`,
      }} />
      <div style={{
        position: 'absolute',
        left: halfW - 20,
        top: 0,
        width: 40,
        height: panelH,
        background: `linear-gradient(to right, transparent, rgba(180,180,255,${dividerGlow * 0.06}), transparent)`,
      }} />

      {/* Center pulse dot */}
      <div style={{
        position: 'absolute',
        left: halfW - 10,
        top: panelH / 2 - 10,
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: `rgba(220,220,255,${dividerGlow * 0.9})`,
        boxShadow: `0 0 ${30 * dividerGlow}px rgba(200,200,255,0.8)`,
      }} />
    </div>
  );
};