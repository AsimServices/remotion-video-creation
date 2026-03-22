import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CONTINENT_PATCHES = Array.from({ length: 48 }, (_, i) => ({
  cx: ((i * 1731 + 200) % 800) - 400,
  cy: ((i * 1337 + 100) % 500) - 250,
  rx: ((i * 97) % 60) + 20,
  ry: ((i * 113) % 40) + 10,
  opacity: ((i * 73) % 40) / 100 + 0.3,
  lat: ((i * 1337) % 180) - 90,
  lon: ((i * 1731) % 360) - 180,
}));

const CAUSTIC_SPOTS = Array.from({ length: 30 }, (_, i) => ({
  x: ((i * 2311) % 700) - 350,
  y: ((i * 1777) % 700) - 350,
  r: ((i * 83) % 60) + 10,
  intensity: ((i * 59) % 60) / 100 + 0.2,
  speed: ((i * 37) % 30) / 100 + 0.02,
  phase: (i * 137) % 628,
}));

const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 3731) % 3840,
  y: (i * 2337) % 2160,
  r: ((i * 47) % 3) + 0.5,
  brightness: ((i * 83) % 60) / 100 + 0.3,
}));

const ATMOSPHERE_RINGS = Array.from({ length: 6 }, (_, i) => ({
  r: 420 + i * 18,
  opacity: 0.12 - i * 0.015,
  blur: i * 3 + 2,
}));

export const GlassSphereEarth: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 50, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  const rotation = (frame / 300) * Math.PI * 2;
  const rotDeg = (frame / 300) * 360;

  const cx = width / 2;
  const cy = height / 2;
  const R = 420;

  const glowPulse = interpolate(Math.sin(frame * 0.04), [-1, 1], [0.7, 1.0]);
  const causticShift = frame * 0.008;

  return (
    <div style={{ width, height, background: '#000408', position: 'relative', overflow: 'hidden', opacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          {/* Deep space gradient */}
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#020d1a" />
            <stop offset="60%" stopColor="#010810" />
            <stop offset="100%" stopColor="#000204" />
          </radialGradient>

          {/* Earth sphere gradient */}
          <radialGradient id="sphereGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#1a4a6e" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#0d2b45" stopOpacity="0.95" />
            <stop offset="80%" stopColor="#071828" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#030d18" stopOpacity="1" />
          </radialGradient>

          {/* Glass reflection */}
          <radialGradient id="glassReflect" cx="30%" cy="25%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="30%" stopColor="#cce8ff" stopOpacity="0.12" />
            <stop offset="70%" stopColor="#88ccff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Continent glow */}
          <radialGradient id="continentGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3aff9a" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#2ae8aa" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0aff66" stopOpacity="0" />
          </radialGradient>

          {/* Atmosphere glow */}
          <radialGradient id="atmosphereGrad" cx="50%" cy="50%" r="50%">
            <stop offset="75%" stopColor="#1a9fff" stopOpacity="0" />
            <stop offset="88%" stopColor="#44aaff" stopOpacity="0.25" />
            <stop offset="95%" stopColor="#88ccff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#aaddff" stopOpacity="0" />
          </radialGradient>

          {/* Caustic light gradient */}
          <radialGradient id="causticGrad" cx="40%" cy="20%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#88ddff" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Outer rim light */}
          <radialGradient id="rimGrad" cx="50%" cy="50%" r="50%">
            <stop offset="82%" stopColor="transparent" />
            <stop offset="90%" stopColor="#2255aa" stopOpacity="0.4" />
            <stop offset="96%" stopColor="#4488dd" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#88aaff" stopOpacity="0" />
          </radialGradient>

          {/* Continent clip */}
          <clipPath id="sphereClip">
            <circle cx={cx} cy={cy} r={R} />
          </clipPath>

          {/* Blur filters */}
          <filter id="atmosphereBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="continentBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="causticBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="sphereShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="30" />
          </filter>
        </defs>

        {/* Background */}
        <rect width={width} height={height} fill="url(#bgGrad)" />

        {/* Stars */}
        <g filter="url(#starGlow)">
          {STARS.map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill={`rgba(200,220,255,${s.brightness * opacity})`}
            />
          ))}
        </g>

        {/* Subtle nebula */}
        <ellipse cx={cx - 600} cy={cy + 400} rx={800} ry={300}
          fill="none"
          stroke="#1a3355"
          strokeWidth="1"
          opacity={0.08 * opacity}
          filter="url(#sphereShadow)"
        />

        {/* Drop shadow beneath sphere */}
        <ellipse cx={cx + 60} cy={cy + R * 0.85} rx={R * 0.7} ry={R * 0.15}
          fill="#0033aa"
          opacity={0.12 * opacity}
          filter="url(#sphereShadow)"
        />

        {/* Atmosphere outer glow */}
        <circle cx={cx} cy={cy} r={R + 60}
          fill="url(#atmosphereGrad)"
          opacity={glowPulse * opacity}
          filter="url(#atmosphereBlur)"
        />

        {/* Sphere base */}
        <circle cx={cx} cy={cy} r={R} fill="url(#sphereGrad)" opacity={opacity} />

        {/* Rotating continents */}
        <g clipPath="url(#sphereClip)" opacity={opacity}>
          {/* Ocean base inside sphere */}
          <circle cx={cx} cy={cy} r={R} fill="#061422" />

          {/* Rotating continent group */}
          <g transform={`translate(${cx},${cy}) rotate(${rotDeg})`}>
            {/* Deep ocean texture lines */}
            {Array.from({ length: 12 }, (_, i) => {
              const y = -R + (i / 11) * R * 2;
              const hw = Math.sqrt(Math.max(0, R * R - y * y));
              return (
                <line key={i} x1={-hw} y1={y} x2={hw} y2={y}
                  stroke="#0a2035" strokeWidth="1.5" opacity="0.5" />
              );
            })}

            {/* Continent patches */}
            {CONTINENT_PATCHES.map((p, i) => {
              const lonRad = (p.lon * Math.PI) / 180;
              const latRad = (p.lat * Math.PI) / 180;
              const projX = Math.cos(latRad) * Math.sin(lonRad) * R;
              const projY = -Math.sin(latRad) * R;
              const depthZ = Math.cos(latRad) * Math.cos(lonRad);
              const visible = depthZ > -0.2;
              if (!visible) return null;
              const visScale = Math.max(0, depthZ) * 0.8 + 0.2;
              return (
                <g key={i}>
                  <ellipse
                    cx={projX} cy={projY}
                    rx={p.rx * visScale} ry={p.ry * visScale}
                    fill={`rgba(30,180,100,${p.opacity * visScale * glowPulse})`}
                    filter="url(#continentBlur)"
                  />
                  <ellipse
                    cx={projX} cy={projY}
                    rx={p.rx * visScale * 0.6} ry={p.ry * visScale * 0.6}
                    fill={`rgba(80,255,160,${p.opacity * visScale * 0.7})`}
                  />
                </g>
              );
            })}

            {/* Polar ice caps */}
            <ellipse cx={0} cy={-R * 0.85} rx={R * 0.25} ry={R * 0.1}
              fill="rgba(200,240,255,0.35)" filter="url(#continentBlur)" />
            <ellipse cx={0} cy={R * 0.88} rx={R * 0.3} ry={R * 0.08}
              fill="rgba(200,240,255,0.28)" filter="url(#continentBlur)" />
          </g>

          {/* Caustic light patterns */}
          <g filter="url(#causticBlur)" opacity={0.6 * glowPulse}>
            {CAUSTIC_SPOTS.map((c, i) => {
              const t = causticShift + c.phase;
              const px = cx + c.x * 0.5 + Math.cos(t * c.speed * 3.7) * 30;
              const py = cy + c.y * 0.5 + Math.sin(t * c.speed * 2.9) * 25;
              const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
              if (dist > R) return null;
              return (
                <ellipse
                  key={i}
                  cx={px} cy={py}
                  rx={c.r} ry={c.r * 0.5}
                  fill={`rgba(150,230,255,${c.intensity * 0.4})`}
                  transform={`rotate(${(i * 37 + frame * 0.3) % 180},${px},${py})`}
                />
              );
            })}
          </g>
        </g>

        {/* Atmosphere rings */}
        {ATMOSPHERE_RINGS.map((ring, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={ring.r}
            fill="none"
            stroke="#44aaff"
            strokeWidth={4 - i * 0.4}
            opacity={ring.opacity * glowPulse * opacity}
            filter="url(#atmosphereBlur)"
          />
        ))}

        {/* Glass rim effect */}
        <circle cx={cx} cy={cy} r={R}
          fill="url(#rimGrad)"
          opacity={opacity * 0.9}
        />

        {/* Main glass reflection highlight */}
        <circle cx={cx} cy={cy} r={R}
          fill="url(#glassReflect)"
          opacity={opacity}
        />

        {/* Secondary small specular */}
        <ellipse cx={cx + R * 0.22} cy={cy - R * 0.38}
          rx={R * 0.06} ry={R * 0.035}
          fill="rgba(255,255,255,0.55)"
          opacity={opacity}
          transform={`rotate(-30,${cx + R * 0.22},${cy - R * 0.38})`}
        />

        {/* Tertiary micro specular */}
        <ellipse cx={cx - R * 0.28} cy={cy - R * 0.45}
          rx={R * 0.025} ry={R * 0.012}
          fill="rgba(255,255,255,0.4)"
          opacity={opacity}
        />

        {/* Caustic projection on background */}
        <g filter="url(#causticBlur)" opacity={0.15 * opacity}>
          {CAUSTIC_SPOTS.slice(0, 10).map((c, i) => {
            const t = causticShift + c.phase;
            const px = cx + R * 1.3 + c.x * 0.3 + Math.cos(t * c.speed * 2) * 20;
            const py = cy + c.y * 0.3 + Math.sin(t * c.speed * 1.8) * 20;
            return (
              <ellipse key={i} cx={px} cy={py}
                rx={c.r * 1.5} ry={c.r * 0.6}
                fill={`rgba(100,200,255,${c.intensity * 0.5})`}
                transform={`rotate(${(i * 53) % 90},${px},${py})`}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};