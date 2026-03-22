import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const NUM_STARS = 200;
const STARS = Array.from({ length: NUM_STARS }, (_, i) => ({
  x: (i * 2731 + 137) % 3840,
  y: (i * 1933 + 271) % 2160,
  size: ((i * 17) % 4) + 1,
  opacity: ((i * 43) % 60 + 40) / 100,
  twinkleOffset: (i * 7) % 60,
}));

const NUM_LATTICE = 24;
const LATITUDE_LINES = Array.from({ length: NUM_LATTICE }, (_, i) => i);
const LONGITUDE_LINES = Array.from({ length: NUM_LATTICE }, (_, i) => i);

const NUM_PARTICLES = 30;
const PARTICLES = Array.from({ length: NUM_PARTICLES }, (_, i) => ({
  angle: (i * 360) / NUM_PARTICLES,
  radius: ((i * 113) % 200) + 100,
  size: ((i * 23) % 8) + 3,
  speed: ((i * 7) % 5) + 2,
  phaseOffset: (i * 19) % 60,
  orbitTilt: ((i * 31) % 40) - 20,
}));

const NUM_FACETS = 18;
const FACETS = Array.from({ length: NUM_FACETS }, (_, i) => ({
  angle: (i * 360) / NUM_FACETS,
  rInner: ((i * 47) % 80) + 180,
  rOuter: ((i * 61) % 120) + 350,
  opacity: ((i * 29) % 30 + 5) / 100,
  colorShift: (i * 17) % 60,
}));

export const FrostedCrystalGlobe: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const cx = width / 2;
  const cy = height / 2;
  const globeRadius = Math.min(width, height) * 0.28;

  const spinAngle = (frame / 300) * 360;
  const spinRad = (spinAngle * Math.PI) / 180;

  const pulsePhase = (frame / 90) * Math.PI * 2;
  const innerGlowIntensity = 0.5 + 0.25 * Math.sin(pulsePhase);
  const outerGlowIntensity = 0.3 + 0.15 * Math.sin(pulsePhase + 1);

  return (
    <div style={{ width, height, background: '#000408', overflow: 'hidden', opacity }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          {/* Deep space radial gradient */}
          <radialGradient id="spaceGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#020c1a" />
            <stop offset="60%" stopColor="#010810" />
            <stop offset="100%" stopColor="#000205" />
          </radialGradient>

          {/* Globe inner glow */}
          <radialGradient id="innerGlow" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor={`rgba(100,200,255,${0.85 * innerGlowIntensity})`} />
            <stop offset="25%" stopColor={`rgba(60,140,230,${0.7 * innerGlowIntensity})`} />
            <stop offset="55%" stopColor={`rgba(20,60,160,${0.5 * innerGlowIntensity})`} />
            <stop offset="80%" stopColor={`rgba(5,20,80,${0.3 * innerGlowIntensity})`} />
            <stop offset="100%" stopColor={`rgba(0,5,30,${0.1})`} />
          </radialGradient>

          {/* Frosted glass surface */}
          <radialGradient id="frostedSurface" cx="38%" cy="30%" r="75%">
            <stop offset="0%" stopColor="rgba(220,240,255,0.45)" />
            <stop offset="20%" stopColor="rgba(180,220,255,0.25)" />
            <stop offset="50%" stopColor="rgba(100,160,220,0.12)" />
            <stop offset="80%" stopColor="rgba(40,80,160,0.08)" />
            <stop offset="100%" stopColor="rgba(10,20,60,0.05)" />
          </radialGradient>

          {/* Outer atmospheric glow */}
          <radialGradient id="atmosphericGlow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="70%" stopColor="transparent" />
            <stop offset="85%" stopColor={`rgba(40,120,255,${0.15 * outerGlowIntensity})`} />
            <stop offset="95%" stopColor={`rgba(20,80,200,${0.25 * outerGlowIntensity})`} />
            <stop offset="100%" stopColor={`rgba(10,40,120,${0.35 * outerGlowIntensity})`} />
          </radialGradient>

          {/* Specular highlight */}
          <radialGradient id="specularHighlight" cx="33%" cy="28%" r="30%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="40%" stopColor="rgba(220,240,255,0.25)" />
            <stop offset="100%" stopColor="rgba(180,220,255,0)" />
          </radialGradient>

          {/* Secondary specular */}
          <radialGradient id="specular2" cx="72%" cy="68%" r="20%">
            <stop offset="0%" stopColor="rgba(180,220,255,0.2)" />
            <stop offset="100%" stopColor="rgba(180,220,255,0)" />
          </radialGradient>

          {/* Edge rim gradient */}
          <radialGradient id="rimLight" cx="50%" cy="50%" r="50%">
            <stop offset="80%" stopColor="transparent" />
            <stop offset="90%" stopColor={`rgba(80,160,255,${0.3 * outerGlowIntensity})`} />
            <stop offset="100%" stopColor={`rgba(40,100,200,${0.5 * outerGlowIntensity})`} />
          </radialGradient>

          {/* Bloom glow for external */}
          <radialGradient id="bloomGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`rgba(30,100,220,${0.12 * innerGlowIntensity})`} />
            <stop offset="50%" stopColor={`rgba(20,70,180,${0.08 * innerGlowIntensity})`} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          <clipPath id="globeClip">
            <circle cx={cx} cy={cy} r={globeRadius} />
          </clipPath>

          <filter id="blur1" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="blurStar" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="bloomFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="40" />
          </filter>
          <filter id="particleBlur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="rimFilter" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>

        {/* Background */}
        <rect width={width} height={height} fill="url(#spaceGrad)" />

        {/* Stars */}
        {STARS.map((star, i) => {
          const twinkle = 0.5 + 0.5 * Math.sin(((frame + star.twinkleOffset) / 40) * Math.PI * 2);
          const starOpacity = star.opacity * (0.6 + 0.4 * twinkle);
          return (
            <circle
              key={i}
              cx={star.x}
              cy={star.y}
              r={star.size}
              fill="white"
              opacity={starOpacity}
            />
          );
        })}

        {/* Bloom external glow */}
        <circle
          cx={cx}
          cy={cy}
          r={globeRadius * 1.8}
          fill="url(#bloomGlow)"
          filter="url(#bloomFilter)"
        />

        {/* Outer atmospheric halo */}
        <circle
          cx={cx}
          cy={cy}
          r={globeRadius * 1.15}
          fill="none"
          stroke={`rgba(40,120,255,${0.2 * outerGlowIntensity})`}
          strokeWidth={globeRadius * 0.12}
          filter="url(#rimFilter)"
        />

        {/* Main globe - inner glow base */}
        <circle cx={cx} cy={cy} r={globeRadius} fill="url(#innerGlow)" />

        {/* Latitude lines (spinning) */}
        <g clipPath="url(#globeClip)">
          {LATITUDE_LINES.map((_, i) => {
            const latFraction = (i + 1) / (NUM_LATTICE + 1);
            const latAngle = Math.acos(1 - 2 * latFraction);
            const latY = cy + globeRadius * Math.cos(latAngle);
            const latRad = globeRadius * Math.abs(Math.sin(latAngle));
            const latOpacity = 0.04 + 0.06 * Math.sin(latAngle);
            return (
              <ellipse
                key={`lat-${i}`}
                cx={cx}
                cy={latY}
                rx={latRad}
                ry={latRad * 0.15}
                fill="none"
                stroke={`rgba(140,200,255,${latOpacity})`}
                strokeWidth={1.5}
              />
            );
          })}

          {/* Longitude lines (spinning) */}
          {LONGITUDE_LINES.map((_, i) => {
            const longAngle = (i / NUM_LATTICE) * Math.PI + spinRad;
            const cosA = Math.cos(longAngle);
            const sinA = Math.sin(longAngle);
            const perspectiveScale = 0.15;
            const longOpacity = (0.5 + 0.5 * Math.abs(cosA)) * 0.08;

            const points: string[] = [];
            for (let t = 0; t <= 36; t++) {
              const theta = (t / 36) * Math.PI * 2;
              const x3d = Math.cos(theta) * cosA;
              const y3d = Math.sin(theta);
              const z3d = Math.cos(theta) * sinA;
              const px = cx + x3d * globeRadius;
              const py = cy + y3d * globeRadius;
              const pz = (z3d + 1) * perspectiveScale;
              const finalX = cx + (px - cx) * (1 + pz);
              const finalY = cy + (py - cy) * (1 + pz);
              points.push(`${finalX},${finalY}`);
            }

            return (
              <polyline
                key={`long-${i}`}
                points={points.join(' ')}
                fill="none"
                stroke={`rgba(120,190,255,${longOpacity})`}
                strokeWidth={1.5}
              />
            );
          })}

          {/* Frosted crystal facets */}
          {FACETS.map((facet, i) => {
            const angle = ((facet.angle + spinAngle * 0.3) * Math.PI) / 180;
            const x1 = cx + Math.cos(angle) * facet.rInner;
            const y1 = cy + Math.sin(angle) * facet.rInner;
            const x2 = cx + Math.cos(angle + 0.3) * facet.rOuter;
            const y2 = cy + Math.sin(angle + 0.3) * facet.rOuter;
            const x3 = cx + Math.cos(angle - 0.3) * facet.rOuter;
            const y3 = cy + Math.sin(angle - 0.3) * facet.rOuter;
            const blueShift = (facet.colorShift / 60);
            const r = Math.floor(100 + blueShift * 80);
            const g = Math.floor(160 + blueShift * 60);
            const b = 255;
            return (
              <polygon
                key={`facet-${i}`}
                points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
                fill={`rgba(${r},${g},${b},${facet.opacity})`}
                stroke={`rgba(180,220,255,${facet.opacity * 1.5})`}
                strokeWidth={0.8}
              />
            );
          })}

          {/* Internal light core */}
          <circle
            cx={cx}
            cy={cy}
            r={globeRadius * 0.35}
            fill={`rgba(80,180,255,${0.12 * innerGlowIntensity})`}
            filter="url(#blur1)"
          />
        </g>

        {/* Atmospheric rim glow */}
        <circle cx={cx} cy={cy} r={globeRadius} fill="url(#atmosphericGlow)" />

        {/* Rim light overlay */}
        <circle cx={cx} cy={cy} r={globeRadius} fill="url(#rimLight)" />

        {/* Frosted glass surface layer */}
        <circle cx={cx} cy={cy} r={globeRadius} fill="url(#frostedSurface)" />

        {/* Specular highlights */}
        <circle cx={cx} cy={cy} r={globeRadius} fill="url(#specularHighlight)" />
        <circle cx={cx} cy={cy} r={globeRadius} fill="url(#specular2)" />

        {/* Orbiting particles */}
        {PARTICLES.map((particle, i) => {
          const t = frame / 60;
          const speed = particle.speed * 0.02;
          const particleAngle = ((particle.angle + frame * speed * 10) * Math.PI) / 180;
          const tiltRad = (particle.orbitTilt * Math.PI) / 180;
          const cosT = Math.cos(tiltRad);
          const sinT = Math.sin(tiltRad);
          const px = particle.radius * Math.cos(particleAngle);
          const py = particle.radius * Math.sin(particleAngle) * cosT;
          const pz = particle.radius * Math.sin(particleAngle) * sinT;
          const screenX = cx + px;
          const screenY = cy + py;
          const depthOpacity = (pz / particle.radius + 1) * 0.5;
          const pulseOp = 0.5 + 0.5 * Math.sin((frame + particle.phaseOffset) / 20 * Math.PI);
          const isVisible = pz >= -particle.radius * 0.5;
          const particleOpacity = isVisible ? depthOpacity * pulseOp * 0.7 : 0;

          return (
            <circle
              key={`particle-${i}`}
              cx={screenX}
              cy={screenY}
              r={particle.size}
              fill={`rgba(140,210,255,${particleOpacity})`}
              filter="url(#particleBlur)"
            />
          );
        })}

        {/* Globe outline */}
        <circle
          cx={cx}
          cy={cy}
          r={globeRadius}
          fill="none"
          stroke={`rgba(100,180,255,${0.3 * outerGlowIntensity})`}
          strokeWidth={3}
        />
        <circle
          cx={cx}
          cy={cy}
          r={globeRadius}
          fill="none"
          stroke={`rgba(200,230,255,${0.15})`}
          strokeWidth={1.5}
          filter="url(#blur1)"
        />
      </svg>
    </div>
  );
};