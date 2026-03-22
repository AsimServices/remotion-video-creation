import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const PCBCircuitPulses: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const pcbGreen = '#0a1a0a';
  const traceColor = '#1a4a1a';
  const litColor = '#00ff88';
  const pulseColor = '#88ffcc';
  const viaColor = '#ccaa00';
  const componentColor = '#2a3a2a';

  // Define circuit traces
  const traces = [
    // Horizontal main bus
    { id: 't1', path: 'M 50 200 L 800 200', delay: 0, duration: 60 },
    { id: 't2', path: 'M 50 400 L 1870 400', delay: 20, duration: 80 },
    { id: 't3', path: 'M 50 600 L 1870 600', delay: 40, duration: 80 },
    { id: 't4', path: 'M 50 800 L 900 800', delay: 10, duration: 70 },
    { id: 't5', path: 'M 200 880 L 1700 880', delay: 60, duration: 70 },
    // Vertical traces
    { id: 't6', path: 'M 200 50 L 200 1030', delay: 5, duration: 90 },
    { id: 't7', path: 'M 500 50 L 500 1030', delay: 25, duration: 90 },
    { id: 't8', path: 'M 800 50 L 800 1030', delay: 35, duration: 90 },
    { id: 't9', path: 'M 1100 50 L 1100 1030', delay: 45, duration: 90 },
    { id: 't10', path: 'M 1400 50 L 1400 1030', delay: 55, duration: 90 },
    { id: 't11', path: 'M 1700 50 L 1700 1030', delay: 65, duration: 90 },
    // Diagonal/angled traces
    { id: 't12', path: 'M 200 200 L 500 400', delay: 30, duration: 50 },
    { id: 't13', path: 'M 800 400 L 1100 200', delay: 50, duration: 50 },
    { id: 't14', path: 'M 1100 600 L 1400 800', delay: 70, duration: 50 },
    { id: 't15', path: 'M 500 600 L 800 800', delay: 15, duration: 50 },
    { id: 't16', path: 'M 1400 400 L 1700 200', delay: 80, duration: 50 },
    { id: 't17', path: 'M 1400 600 L 1700 880', delay: 90, duration: 50 },
    // Short connectors
    { id: 't18', path: 'M 500 200 L 500 400', delay: 28, duration: 30 },
    { id: 't19', path: 'M 800 200 L 800 400', delay: 38, duration: 30 },
    { id: 't20', path: 'M 1100 400 L 1100 600', delay: 48, duration: 30 },
    { id: 't21', path: 'M 1400 200 L 1400 400', delay: 58, duration: 30 },
    { id: 't22', path: 'M 200 400 L 200 600', delay: 8, duration: 30 },
    { id: 't23', path: 'M 200 600 L 200 800', delay: 12, duration: 30 },
    { id: 't24', path: 'M 500 600 L 500 800', delay: 32, duration: 30 },
    { id: 't25', path: 'M 800 600 L 800 800', delay: 42, duration: 30 },
    { id: 't26', path: 'M 1100 600 L 1100 880', delay: 52, duration: 30 },
    { id: 't27', path: 'M 1700 400 L 1700 600', delay: 68, duration: 30 },
    { id: 't28', path: 'M 1700 600 L 1700 880', delay: 72, duration: 30 },
    { id: 't29', path: 'M 900 800 L 1100 880', delay: 62, duration: 40 },
    { id: 't30', path: 'M 200 880 L 200 800', delay: 63, duration: 25 },
  ];

  // Vias (connection points)
  const vias = [
    { x: 200, y: 200 }, { x: 500, y: 200 }, { x: 800, y: 200 }, { x: 1100, y: 200 }, { x: 1400, y: 200 }, { x: 1700, y: 200 },
    { x: 200, y: 400 }, { x: 500, y: 400 }, { x: 800, y: 400 }, { x: 1100, y: 400 }, { x: 1400, y: 400 }, { x: 1700, y: 400 },
    { x: 200, y: 600 }, { x: 500, y: 600 }, { x: 800, y: 600 }, { x: 1100, y: 600 }, { x: 1400, y: 600 }, { x: 1700, y: 600 },
    { x: 200, y: 800 }, { x: 500, y: 800 }, { x: 800, y: 800 }, { x: 1100, y: 800 }, { x: 1400, y: 800 },
    { x: 200, y: 880 }, { x: 500, y: 880 }, { x: 800, y: 880 }, { x: 1100, y: 880 }, { x: 1700, y: 880 },
  ];

  // Components (IC chips, resistors, capacitors)
  const components = [
    { type: 'ic', x: 580, y: 260, w: 200, h: 120 },
    { type: 'ic', x: 880, y: 440, w: 180, h: 100 },
    { type: 'ic', x: 1180, y: 260, w: 160, h: 120 },
    { type: 'cap', x: 340, y: 500, w: 40, h: 60 },
    { type: 'cap', x: 660, y: 680, w: 40, h: 60 },
    { type: 'cap', x: 960, y: 700, w: 40, h: 60 },
    { type: 'res', x: 1240, y: 500, w: 70, h: 25 },
    { type: 'res', x: 1540, y: 300, w: 70, h: 25 },
    { type: 'res', x: 1540, y: 700, w: 70, h: 25 },
    { type: 'ic', x: 280, y: 640, w: 120, h: 80 },
    { type: 'ic', x: 1480, y: 460, w: 140, h: 80 },
  ];

  // Pulse particles along traces
  const pulses = [
    { traceId: 't2', speed: 0.008, offset: 0, color: litColor },
    { traceId: 't3', speed: 0.006, offset: 0.3, color: pulseColor },
    { traceId: 't6', speed: 0.007, offset: 0.1, color: litColor },
    { traceId: 't8', speed: 0.009, offset: 0.5, color: pulseColor },
    { traceId: 't10', speed: 0.005, offset: 0.7, color: litColor },
    { traceId: 't11', speed: 0.008, offset: 0.2, color: pulseColor },
    { traceId: 't5', speed: 0.007, offset: 0.6, color: litColor },
    { traceId: 't1', speed: 0.010, offset: 0.4, color: pulseColor },
    { traceId: 't4', speed: 0.006, offset: 0.8, color: litColor },
  ];

  // Helper to get path length approximation for simple lines
  const getLinePoints = (pathStr: string) => {
    const match = pathStr.match(/M\s*([\d.]+)\s+([\d.]+)\s+L\s*([\d.]+)\s+([\d.]+)/);
    if (!match) return null;
    return {
      x1: parseFloat(match[1]), y1: parseFloat(match[2]),
      x2: parseFloat(match[3]), y2: parseFloat(match[4]),
    };
  };

  const getPulsePosition = (pathStr: string, t: number) => {
    const pts = getLinePoints(pathStr);
    if (!pts) return null;
    return {
      x: pts.x1 + (pts.x2 - pts.x1) * t,
      y: pts.y1 + (pts.y2 - pts.y1) * t,
    };
  };

  return (
    <div style={{ width, height, background: pcbGreen, overflow: 'hidden', opacity: globalOpacity, position: 'relative' }}>
      {/* PCB substrate texture */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse at 20% 30%, #0d2a0d 0%, transparent 60%),
          radial-gradient(ellipse at 80% 70%, #0b2010 0%, transparent 60%),
          radial-gradient(ellipse at 50% 50%, #081508 0%, transparent 80%)
        `,
      }} />

      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          {/* Glow filters */}
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-soft">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-via">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="pulse-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Grid pattern */}
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#0f2a0f" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* PCB grid */}
        <rect width={width} height={height} fill="url(#grid)" opacity={0.6} />

        {/* Board edge */}
        <rect x="20" y="20" width={width - 40} height={height - 40}
          fill="none" stroke="#1a3a1a" strokeWidth="3" rx="4" />
        <rect x="25" y="25" width={width - 50} height={height - 50}
          fill="none" stroke="#0f2a0f" strokeWidth="1" rx="3" />

        {/* Corner mounting holes */}
        {[[60, 60], [width - 60, 60], [60, height - 60], [width - 60, height - 60]].map(([cx, cy], i) => (
          <g key={`hole-${i}`}>
            <circle cx={cx} cy={cy} r={18} fill="#050e05" stroke="#1a3a1a" strokeWidth="2" />
            <circle cx={cx} cy={cy} r={8} fill="#0a0a0a" stroke="#2a4a2a" strokeWidth="1.5" />
          </g>
        ))}

        {/* Base traces (unlit) */}
        {traces.map((trace) => (
          <path
            key={`base-${trace.id}`}
            d={trace.path}
            fill="none"
            stroke={traceColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}

        {/* Lit traces with progressive reveal */}
        {traces.map((trace) => {
          const startFrame = trace.delay * 3;
          const endFrame = startFrame + trace.duration * 3;
          const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp'
          });
          if (progress <= 0) return null;

          // Pulse animation for lit traces
          const pulsePhase = Math.sin((frame - startFrame) * 0.05 + trace.delay) * 0.5 + 0.5;
          const traceOpacity = interpolate(pulsePhase, [0, 1], [0.6, 1]);
          const glowIntensity = interpolate(pulsePhase, [0, 1], [2, 5]);

          return (
            <path
              key={`lit-${trace.id}`}
              d={trace.path}
              fill="none"
              stroke={litColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="10000"
              strokeDashoffset={`${10000 * (1 - progress)}`}
              opacity={traceOpacity}
              filter="url(#glow-soft)"
            />
          );
        })}

        {/* Secondary glow layer for lit traces */}
        {traces.map((trace) => {
          const startFrame = trace.delay * 3;
          const endFrame = startFrame + trace.duration * 3;
          const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp'
          });
          if (progress <= 0) return null;
          return (
            <path
              key={`glow-${trace.id}`}
              d={trace.path}
              fill="none"
              stroke={litColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="10000"
              strokeDashoffset={`${10000 * (1 - progress)}`}
              opacity={0.15}
              filter="url(#glow-strong)"
            />
          );
        })}

        {/* Vias */}
        {vias.map((via, i) => {
          const litProgress = interpolate(frame, [i * 8 + 20, i * 8 + 60], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp'
          });
          const pulseScale = 1 + Math.sin(frame * 0.08 + i * 0.7) * 0.15 * litProgress;
          return (
            <g key={`via-${i}`}>
              <circle cx={via.x} cy={via.y} r={9 * pulseScale} fill="#112211" stroke={viaColor} strokeWidth="2" opacity={0.7 + litProgress * 0.3} />
              <circle cx={via.x} cy={via.y} r={4} fill={litProgress > 0.5 ? viaColor : '#332200'} filter={litProgress > 0.5 ? "url(#glow-via)" : undefined} opacity={litProgress > 0.5 ? 1 : 0.3} />
              <circle cx={via.x} cy={via.y} r={9 * pulseScale} fill="none" stroke={viaColor} strokeWidth="1" opacity={litProgress * 0.4} filter="url(#glow-via)" />
            </g>
          );
        })}

        {/* Components */}
        {components.map((comp, i) => {
          const litFrame = i * 25 + 60;
          const litProgress = interpolate(frame, [litFrame, litFrame + 40], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp'
          });
          const glowOpacity = litProgress * (0.5 + Math.sin(frame * 0.06 + i) * 0.2);

          if (comp.type === 'ic') {
            const pins = Math.floor(comp.w / 25);
            return (
              <g key={`comp-${i}`}>
                {/* IC body */}
                <rect x={comp.x} y={comp.y} width={comp.w} height={comp.h}
                  fill={componentColor} stroke={litProgress > 0.5 ? litColor : '#2a4a2a'}
                  strokeWidth={litProgress > 0.5 ? 1.5 : 1} rx="3" opacity={0.9} />
                {/* IC inner border */}
                <rect x={comp.x + 5} y={comp.y + 5} width={comp.w - 10} height={comp.h - 10}
                  fill="none" stroke="#1a3a1a" strokeWidth="1" rx="2" />
                {/* Pin 1 indicator */}
                <circle cx={comp.x + 12} cy={comp.y + 12} r={4}
                  fill={litProgress > 0.5 ? litColor : '#1a3a1a'} opacity={litProgress > 0.5 ? 0.8 : 0.5} />
                {/* Top/bottom pins */}
                {Array.from({ length: pins }).map((_, pi) => (
                  <g key={`pin-${pi}`}>
                    <rect x={comp.x + 15 + pi * 22} y={comp.y - 8} width="8" height="10"
                      fill={litProgress > 0.3 ? traceColor : '#0f1f0f'} stroke={litProgress > 0.3 ? litColor : '#1a3a1a'} strokeWidth="0.5" rx="1" opacity={0.8} />
                    <rect x={comp.x + 15 + pi * 22} y={comp.y + comp.h - 2} width="8" height="10"
                      fill={litProgress > 0.3 ? traceColor : '#0f1f0f'} stroke={litProgress > 0.3 ? litColor : '#1a3a1a'} strokeWidth="0.5" rx="1" opacity={0.8} />
                  </g>
                ))}
                {/* Glow overlay */}
                <rect x={comp.x} y={comp.y} width={comp.w} height={comp.h}
                  fill={litColor} rx="3" opacity={glowOpacity * 0.08} filter="url(#glow-soft)" />
              </g>
            );
          } else if (comp.type === 'cap') {
            return (
              <g key={`comp-${i}`}>
                <rect x={comp.x - comp.w / 2} y={comp.y - comp.h / 2} width={comp.w} height={comp.h}
                  fill={componentColor} stroke={litProgress > 0.5 ? litColor : '#2a4a2a'} strokeWidth="1" rx="4" />
                <line x1={comp.x - comp.w / 2} y1={comp.y} x2={comp.x + comp.w / 2} y2={comp.y}
                  stroke={litProgress > 0.5 ? litColor : '#1a3a1a'} strokeWidth="1.5" opacity={0.6} />
                <rect x={comp.x - comp.w / 2} y={comp.y - comp.h / 2} width={comp.w} height={comp.h}
                  fill={litColor} rx="4" opacity={glowOpacity * 0.1} />
              </g>
            );
          } else {
            return (
              <g key={`comp-${i}`}>
                <rect x={comp.x - comp.w / 2} y={comp.y - comp.h / 2} width={comp.w} height={comp.h}
                  fill={componentColor} stroke={litProgress > 0.5 ? litColor : '#2a4a2a'} strokeWidth="1" rx="3" />
                {[0.25, 0.5, 0.75].map((band, bi) => (
                  <line key={bi}
                    x1={comp.x - comp.w / 2 + comp.w * band} y1={comp.y - comp.h / 2}
                    x2={comp.x - comp.w / 2 + comp.w * band} y2={comp.y + comp.h / 2}
                    stroke={bi === 1 ? viaColor : litColor} strokeWidth="3" opacity={litProgress * 0.6} />
                ))}
              </g>
            );
          }
        })}

        {/* Pulse particles traveling along traces */}
        {pulses.map((pulse, i) => {
          const trace = traces.find(t => t.id === pulse.traceId);
          if (!trace) return null;

          const traceStartFrame = trace.delay * 3;
          const traceEndFrame = traceStartFrame + trace.duration * 3;
          const traceReady = interpolate(frame, [traceStartFrame, traceEndFrame], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp'
          });
          if (traceReady < 0.9) return null;

          // Multiple pulses per trace
          return [0, 0.4, 0.75].map((phaseOffset, pi) => {
            const t = ((frame * pulse.speed + pulse.offset + phaseOffset) % 1);
            const pos = getPulsePosition(trace.path, t);
            if (!pos) return null;

            const pulseOpacity = 0.7 + Math.sin(frame * 0.1 + i + pi) * 0.3;

            return (
              <g key={`pulse-${i}-${pi}`} filter="url(#pulse-glow)">
                <circle cx={pos.x} cy={pos.y} r={5} fill={pulse.color} opacity={pulseOpacity} />
                <circle cx={pos.x} cy={pos.y} r={10} fill={pulse.color} opacity={pulseOpacity * 0.3} />
                <circle cx={pos.x} cy={pos.y} r={2} fill="white" opacity={pulseOpacity * 0.8} />
              </g>
            );
          });
        })}

        {/* Global ambient scan line */}
        {(() => {
          const scanY = interpolate(frame % 120, [0, 120], [0, height]);
          return (
            <rect x={0} y={scanY - 2} width={width} height={4}
              fill={litColor} opacity={0.04} />
          );
        })()}

        {/* Corner accent LEDs */}
        {[[100, 100], [width - 100, 100], [100, height - 100], [width - 100, height - 100]].map(([cx, cy], i) => {
          const ledPhase = Math.sin(frame * 0.1 + i * 1.5) * 0.5 + 0.5;
          return (
            <g key={`led-${i}`} filter="url(#glow-via)">
              <circle cx={cx} cy={cy} r={6} fill={i % 2 === 0 ? litColor : '#ff4400'} opacity={0.5 + ledPhase * 0.5} />
              <circle cx={cx} cy={cy} r={12} fill={i % 2 === 0 ? litColor : '#ff4400'} opacity={(0.5 + ledPhase * 0.5) * 0.2} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};