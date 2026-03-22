import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NODE_COUNT = 80;
const NODES = Array.from({ length: NODE_COUNT }, (_, i) => {
  const lat = ((i * 137.508) % 160) - 80;
  const lon = ((i * 222.614) % 360) - 180;
  const size = ((i * 31 + 7) % 8) + 3;
  const pulse = ((i * 17) % 20) / 20;
  return { lat, lon, size, pulse };
});

const CONNECTIONS: [number, number][] = [];
for (let i = 0; i < NODE_COUNT; i++) {
  for (let j = i + 1; j < NODE_COUNT; j++) {
    const dx = NODES[i].lon - NODES[j].lon;
    const dy = NODES[i].lat - NODES[j].lat;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 55 && CONNECTIONS.length < 200) {
      CONNECTIONS.push([i, j]);
    }
  }
}

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  connectionIndex: i % CONNECTIONS.length,
  offset: (i * 0.137) % 1,
  speed: 0.003 + ((i * 7) % 10) * 0.0005,
}));

function latLonToXY(lat: number, lon: number, w: number, h: number) {
  const x = ((lon + 180) / 360) * w;
  const y = ((90 - lat) / 180) * h;
  return { x, y };
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export const WorldNetworkAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const buildProgress = interpolate(frame, [30, durationInFrames - 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const totalConnections = CONNECTIONS.length;
  const visibleConnections = Math.floor(easeInOut(buildProgress) * totalConnections);

  const mapW = width;
  const mapH = height;

  const glowIntensity = interpolate(frame, [0, durationInFrames * 0.4, durationInFrames], [0.4, 1, 0.7], {});

  return (
    <div style={{ width, height, background: '#020510', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity }}>

        {/* Deep space background gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, #050d2a 0%, #020510 70%)',
        }} />

        {/* Subtle grid lines */}
        <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <pattern id="grid" width={mapW / 24} height={mapH / 12} patternUnits="userSpaceOnUse">
              <path d={`M ${mapW / 24} 0 L 0 0 0 ${mapH / 12}`} fill="none" stroke="#0d2a4a" strokeWidth="0.5" opacity="0.5" />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />

          {/* Longitude lines */}
          {Array.from({ length: 13 }, (_, i) => {
            const x = (i / 12) * mapW;
            return <line key={`lon-${i}`} x1={x} y1={0} x2={x} y2={mapH} stroke="#0a1f38" strokeWidth="0.8" opacity="0.6" />;
          })}
          {/* Latitude lines */}
          {Array.from({ length: 7 }, (_, i) => {
            const y = (i / 6) * mapH;
            return <line key={`lat-${i}`} x1={0} y1={y} x2={mapW} y2={y} stroke="#0a1f38" strokeWidth="0.8" opacity="0.6" />;
          })}

          {/* Equator highlight */}
          <line x1={0} y1={mapH / 2} x2={mapW} y2={mapH / 2} stroke="#0d3060" strokeWidth="1.5" opacity="0.8" />

          {/* Connection lines */}
          {CONNECTIONS.slice(0, visibleConnections).map(([a, b], idx) => {
            const posA = latLonToXY(NODES[a].lat, NODES[a].lon, mapW, mapH);
            const posB = latLonToXY(NODES[b].lat, NODES[b].lon, mapW, mapH);
            const progress = Math.min(1, (buildProgress * totalConnections - idx) / 1);
            const clampedProgress = Math.max(0, Math.min(1, progress));
            const dist = Math.sqrt((posB.x - posA.x) ** 2 + (posB.y - posA.y) ** 2);
            const normalizedDist = Math.min(dist / 400, 1);
            const alpha = interpolate(clampedProgress, [0, 1], [0, 0.6]) * (1 - normalizedDist * 0.4);
            const hue = interpolate(idx / totalConnections, [0, 0.5, 1], [190, 220, 260]);
            return (
              <line
                key={`conn-${idx}`}
                x1={posA.x} y1={posA.y}
                x2={posB.x} y2={posB.y}
                stroke={`hsla(${hue}, 90%, 65%, ${alpha})`}
                strokeWidth={interpolate(clampedProgress, [0, 1], [0, 1.2])}
              />
            );
          })}

          {/* Moving particles along connections */}
          {PARTICLES.map((particle, idx) => {
            const connIdx = particle.connectionIndex;
            if (connIdx >= visibleConnections) return null;
            const [a, b] = CONNECTIONS[connIdx];
            const posA = latLonToXY(NODES[a].lat, NODES[a].lon, mapW, mapH);
            const posB = latLonToXY(NODES[b].lat, NODES[b].lon, mapW, mapH);
            const t = (particle.offset + frame * particle.speed) % 1;
            const x = posA.x + (posB.x - posA.x) * t;
            const y = posA.y + (posB.y - posA.y) * t;
            const alpha = Math.sin(t * Math.PI) * 0.9;
            return (
              <circle key={`p-${idx}`} cx={x} cy={y} r={3} fill={`rgba(100, 220, 255, ${alpha})`}>
              </circle>
            );
          })}

          {/* Network nodes */}
          {NODES.map((node, idx) => {
            const pos = latLonToXY(node.lat, node.lon, mapW, mapH);
            const nodeProgress = interpolate(buildProgress, [idx / NODE_COUNT * 0.6, idx / NODE_COUNT * 0.6 + 0.1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const pulsePhase = (frame / 30 + node.pulse * Math.PI * 2) % (Math.PI * 2);
            const pulseScale = 1 + Math.sin(pulsePhase) * 0.3;
            const pulseAlpha = 0.3 + Math.sin(pulsePhase) * 0.2;
            const r = node.size * nodeProgress;
            if (nodeProgress === 0) return null;
            return (
              <g key={`node-${idx}`}>
                {/* Outer glow ring */}
                <circle
                  cx={pos.x} cy={pos.y}
                  r={r * 3 * pulseScale}
                  fill="none"
                  stroke={`rgba(80, 200, 255, ${pulseAlpha * glowIntensity})`}
                  strokeWidth="1"
                />
                {/* Glow fill */}
                <circle
                  cx={pos.x} cy={pos.y}
                  r={r * 2}
                  fill={`rgba(60, 180, 255, ${0.15 * glowIntensity})`}
                />
                {/* Core */}
                <circle
                  cx={pos.x} cy={pos.y}
                  r={r}
                  fill={`rgba(120, 220, 255, ${0.9 * nodeProgress})`}
                />
                {/* Bright center */}
                <circle
                  cx={pos.x} cy={pos.y}
                  r={r * 0.4}
                  fill={`rgba(220, 245, 255, ${nodeProgress})`}
                />
              </g>
            );
          })}

          {/* Defs for glow filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Vignette overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(2,5,16,0.85) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Top glow accent */}
        <div style={{
          position: 'absolute',
          top: -height * 0.1,
          left: '10%',
          width: '80%',
          height: height * 0.4,
          background: `radial-gradient(ellipse, rgba(30, 120, 255, ${0.08 * glowIntensity}) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Bottom glow accent */}
        <div style={{
          position: 'absolute',
          bottom: -height * 0.1,
          left: '20%',
          width: '60%',
          height: height * 0.3,
          background: `radial-gradient(ellipse, rgba(0, 200, 255, ${0.06 * glowIntensity}) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Horizontal scan line effect */}
        {Array.from({ length: 5 }, (_, i) => {
          const scanY = ((frame * 2 + i * (height / 5)) % height);
          return (
            <div key={`scan-${i}`} style={{
              position: 'absolute',
              left: 0, right: 0,
              top: scanY,
              height: 2,
              background: 'linear-gradient(to right, transparent, rgba(0,180,255,0.05), transparent)',
              pointerEvents: 'none',
            }} />
          );
        })}
      </div>
    </div>
  );
};