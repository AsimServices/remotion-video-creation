import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const DigitalCounterMilestone: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const milestone = 1000000;
  const countProgress = interpolate(frame, [50, durationInFrames - 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const eased = countProgress < 0.8
    ? countProgress / 0.8 * 0.7
    : 0.7 + (countProgress - 0.8) / 0.2 * 0.3;
  const currentCount = Math.floor(eased * milestone);

  const digits = currentCount.toString().padStart(7, '0');

  const nearMilestone = countProgress > 0.85;
  const atMilestone = countProgress >= 1.0;

  const glowIntensity = nearMilestone
    ? interpolate(countProgress, [0.85, 1.0], [0, 1], { extrapolateRight: 'clamp' })
    : 0;

  const pulsePhase = atMilestone
    ? interpolate(frame, [durationInFrames - 60, durationInFrames - 10], [0, Math.PI * 8], { extrapolateRight: 'clamp' })
    : 0;
  const pulse = atMilestone ? 0.5 + 0.5 * Math.sin(pulsePhase) : glowIntensity;

  const primaryColor = atMilestone ? `rgba(0, 255, 180, ${0.9 + pulse * 0.1})` : '#00e5ff';
  const glowColor = atMilestone ? `rgba(0, 255, 180, ${pulse * 0.9})` : `rgba(0, 229, 255, ${glowIntensity * 0.7})`;

  const numParticles = 24;
  const particles = Array.from({ length: numParticles }, (_, i) => {
    const angle = (i / numParticles) * Math.PI * 2;
    const speed = 0.8 + (i % 5) * 0.3;
    const particleProgress = atMilestone
      ? interpolate(frame, [durationInFrames - 60, durationInFrames - 20], [0, 1], { extrapolateRight: 'clamp' })
      : 0;
    const radius = particleProgress * speed * 320;
    const px = width / 2 + Math.cos(angle) * radius;
    const py = height / 2 + Math.sin(angle) * radius;
    const particleOpacity = interpolate(particleProgress, [0, 0.3, 1], [0, 1, 0]);
    return { px, py, particleOpacity };
  });

  const ringScale = atMilestone
    ? interpolate(frame, [durationInFrames - 60, durationInFrames - 30], [0.5, 2.5], { extrapolateRight: 'clamp' })
    : 1;
  const ringOpacity = atMilestone
    ? interpolate(frame, [durationInFrames - 60, durationInFrames - 20], [1, 0], { extrapolateRight: 'clamp' })
    : 0;

  const scanlineY = interpolate(frame, [0, durationInFrames], [0, height * 2]) % height;

  return (
    <div style={{ width, height, background: '#050a0f', overflow: 'hidden', position: 'relative', opacity }}>
      {/* Grid background */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(0,229,255,0.06)" strokeWidth="1" />
          </pattern>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={glowColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />
        <rect width={width} height={height} fill="url(#centerGlow)" />
        {/* Scanline */}
        <rect x={0} y={scanlineY} width={width} height={2} fill="rgba(0,229,255,0.04)" />
        {/* Horizontal accent lines */}
        <line x1={0} y1={height * 0.25} x2={width} y2={height * 0.25} stroke="rgba(0,229,255,0.08)" strokeWidth="1" />
        <line x1={0} y1={height * 0.75} x2={width} y2={height * 0.75} stroke="rgba(0,229,255,0.08)" strokeWidth="1" />
      </svg>

      {/* Explosion ring */}
      {atMilestone && (
        <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, opacity: ringOpacity }}>
          <circle
            cx={width / 2}
            cy={height / 2}
            r={200 * ringScale}
            fill="none"
            stroke={primaryColor}
            strokeWidth={4 / ringScale}
          />
          <circle
            cx={width / 2}
            cy={height / 2}
            r={280 * ringScale}
            fill="none"
            stroke={primaryColor}
            strokeWidth={2 / ringScale}
            strokeOpacity={0.5}
          />
        </svg>
      )}

      {/* Particles */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {particles.map((p, i) => (
          <circle key={i} cx={p.px} cy={p.py} r={3 + (i % 3)} fill={primaryColor} opacity={p.particleOpacity} />
        ))}
      </svg>

      {/* Counter display */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
      }}>
        {/* Digit boxes */}
        <div style={{ display: 'flex', gap: 8 }}>
          {digits.split('').map((digit, i) => {
            const isCommaPos = (digits.length - 1 - i) % 3 === 0 && i !== digits.length - 1;
            return (
              <React.Fragment key={i}>
                <div style={{
                  position: 'relative',
                  width: 100,
                  height: 140,
                  background: 'rgba(0, 229, 255, 0.04)',
                  border: `1px solid rgba(0, 229, 255, ${0.2 + glowIntensity * 0.5})`,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 ${20 + pulse * 40}px ${glowColor}, inset 0 0 ${10 + pulse * 20}px rgba(0,229,255,0.05)`,
                  overflow: 'hidden',
                }}>
                  {/* Top highlight */}
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: 2,
                    background: `rgba(0,229,255,${0.3 + pulse * 0.5})`,
                  }} />
                  {/* Bottom highlight */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    height: 1,
                    background: `rgba(0,229,255,${0.1 + pulse * 0.2})`,
                  }} />
                  {/* Middle separator */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0, right: 0,
                    height: 1,
                    background: `rgba(0,229,255,${0.05 + pulse * 0.1})`,
                  }} />
                  <span style={{
                    fontFamily: '"Courier New", Courier, monospace',
                    fontSize: 88,
                    fontWeight: 'bold',
                    color: primaryColor,
                    textShadow: `0 0 ${10 + pulse * 30}px ${glowColor}, 0 0 ${40 + pulse * 60}px ${glowColor}`,
                    lineHeight: 1,
                    letterSpacing: -2,
                  }}>
                    {digit}
                  </span>
                </div>
                {isCommaPos && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    paddingBottom: 12,
                    color: `rgba(0, 229, 255, ${0.4 + pulse * 0.4})`,
                    fontSize: 48,
                    fontFamily: '"Courier New", Courier, monospace',
                    fontWeight: 'bold',
                    textShadow: `0 0 ${10 + pulse * 20}px ${glowColor}`,
                  }}>
                    ,
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{
          width: 740,
          height: 4,
          background: 'rgba(0,229,255,0.1)',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: `${countProgress * 100}%`,
            background: `linear-gradient(90deg, rgba(0,229,255,0.3), ${primaryColor})`,
            boxShadow: `0 0 ${8 + pulse * 16}px ${glowColor}`,
            transition: 'width 0.05s',
          }} />
        </div>

        {/* Bottom tick marks */}
        <div style={{ display: 'flex', gap: 12 }}>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{
              width: 60,
              height: 4,
              background: i / 10 < countProgress ? primaryColor : 'rgba(0,229,255,0.1)',
              borderRadius: 2,
              boxShadow: i / 10 < countProgress ? `0 0 ${6 + pulse * 10}px ${glowColor}` : 'none',
            }} />
          ))}
        </div>
      </div>

      {/* Corner decorations */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        {[
          [40, 40, 0],
          [width - 40, 40, 90],
          [width - 40, height - 40, 180],
          [40, height - 40, 270],
        ].map(([cx, cy, rot], i) => (
          <g key={i} transform={`translate(${cx},${cy}) rotate(${rot})`}>
            <line x1={0} y1={0} x2={40} y2={0} stroke={`rgba(0,229,255,${0.3 + pulse * 0.3})`} strokeWidth={2} />
            <line x1={0} y1={0} x2={0} y2={40} stroke={`rgba(0,229,255,${0.3 + pulse * 0.3})`} strokeWidth={2} />
          </g>
        ))}
      </svg>
    </div>
  );
};