import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Pre-computed continent paths and properties (simplified SVG paths on a 800x400 equirectangular projection)
const CONTINENTS = [
  {
    id: 'north-america',
    color: '#00ff88',
    glowColor: '#00ff88',
    activateFrame: 60,
    // Simplified polygon points for North America
    points: [
      [120, 80], [180, 70], [220, 90], [240, 120], [230, 160], [210, 180],
      [190, 200], [170, 220], [150, 210], [130, 190], [110, 170], [100, 140],
      [105, 110], [120, 80]
    ],
  },
  {
    id: 'south-america',
    color: '#ffaa00',
    glowColor: '#ffaa00',
    activateFrame: 130,
    points: [
      [160, 240], [200, 230], [220, 260], [230, 300], [220, 340], [200, 370],
      [175, 380], [155, 360], [145, 320], [148, 280], [160, 240]
    ],
  },
  {
    id: 'europe',
    color: '#4488ff',
    glowColor: '#4488ff',
    activateFrame: 200,
    points: [
      [350, 70], [390, 65], [410, 80], [415, 100], [400, 115], [380, 120],
      [360, 115], [345, 100], [340, 85], [350, 70]
    ],
  },
  {
    id: 'africa',
    color: '#ff6644',
    glowColor: '#ff6644',
    activateFrame: 270,
    points: [
      [355, 140], [395, 130], [420, 150], [430, 200], [420, 260], [400, 300],
      [375, 310], [350, 290], [335, 240], [335, 190], [345, 160], [355, 140]
    ],
  },
  {
    id: 'asia',
    color: '#ff44aa',
    glowColor: '#ff44aa',
    activateFrame: 340,
    points: [
      [420, 60], [520, 50], [600, 70], [650, 100], [640, 140], [600, 160],
      [560, 170], [520, 160], [480, 150], [450, 130], [430, 110], [420, 85],
      [420, 60]
    ],
  },
  {
    id: 'australia',
    color: '#aaff44',
    glowColor: '#aaff44',
    activateFrame: 410,
    points: [
      [570, 250], [620, 240], [660, 255], [675, 280], [665, 310], [640, 325],
      [605, 320], [580, 300], [565, 275], [570, 250]
    ],
  },
];

// Pre-computed stars
const STARS = Array.from({ length: 300 }, (_, i) => ({
  x: (i * 2731 + 17) % 800,
  y: (i * 1337 + 53) % 400,
  size: ((i * 73) % 3) + 0.5,
  brightness: ((i * 137) % 100) / 100,
  twinkleOffset: (i * 47) % 100,
}));

// Pre-computed city dots along routes
const CITY_DOTS = Array.from({ length: 40 }, (_, i) => ({
  x: (i * 1873 + 200) % 750 + 25,
  y: (i * 1193 + 80) % 300 + 50,
  continent: i % 6,
  pulseOffset: (i * 23) % 60,
}));

// Pre-computed connection lines between cities
const CONNECTIONS = Array.from({ length: 20 }, (_, i) => ({
  x1: (i * 2137) % 750 + 25,
  y1: (i * 1571) % 300 + 50,
  x2: ((i * 2137 + 1300)) % 750 + 25,
  y2: ((i * 1571 + 900)) % 300 + 50,
  continent: i % 6,
  delay: (i * 7) % 30,
}));

// Pre-computed orbital particles
const ORBITAL_PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  angle: (i * 360) / 60,
  radius: 180 + ((i * 37) % 60),
  speed: 0.3 + ((i * 13) % 10) * 0.05,
  size: ((i * 7) % 4) + 1,
  colorIndex: i % 6,
}));

const CONTINENT_COLORS = ['#00ff88', '#ffaa00', '#4488ff', '#ff6644', '#ff44aa', '#aaff44'];

export const GlobeMarketAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 50, durationInFrames - 50, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Globe center and radius
  const cx = width / 2;
  const cy = height / 2;
  const globeR = Math.min(width, height) * 0.38;

  // Slow globe rotation
  const rotation = frame * 0.15;

  // Map scale for the equirectangular projection inside the globe
  const mapW = 800;
  const mapH = 400;

  // Calculate continent activation
  const getActivation = (activateFrame: number) => {
    return interpolate(frame, [activateFrame, activateFrame + 60], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  };

  // Scale factor from map coords to SVG
  const scaleX = (width * 0.75) / mapW;
  const scaleY = (height * 0.75) / mapH;
  const offsetX = width * 0.125;
  const offsetY = height * 0.125;

  const mapToSvg = (mx: number, my: number) => ({
    x: mx * scaleX + offsetX,
    y: my * scaleY + offsetY,
  });

  const pointsToPath = (pts: number[][]) => {
    return pts
      .map((p, i) => {
        const { x, y } = mapToSvg(p[0], p[1]);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ') + ' Z';
  };

  const allActivated = frame > 470;

  return (
    <div style={{ width, height, background: '#000008', overflow: 'hidden', position: 'relative' }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: 'absolute', top: 0, left: 0, opacity: globalOpacity }}
      >
        <defs>
          {/* Globe radial gradient */}
          <radialGradient id="globeGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#001a33" />
            <stop offset="60%" stopColor="#000a1a" />
            <stop offset="100%" stopColor="#000008" />
          </radialGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft glow filter */}
          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Strong glow */}
          <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="20" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip to globe circle */}
          <clipPath id="globeClip">
            <circle cx={cx} cy={cy} r={globeR} />
          </clipPath>

          {/* Continent glow filters */}
          {CONTINENTS.map((c) => (
            <filter key={`filter-${c.id}`} id={`glow-${c.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="12" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}

          {/* Outer atmosphere gradient */}
          <radialGradient id="atmosphereGrad" cx="50%" cy="50%" r="50%">
            <stop offset="75%" stopColor="transparent" />
            <stop offset="90%" stopColor="#001133" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0033aa" stopOpacity="0.15" />
          </radialGradient>

          {/* All-activated pulse */}
          <radialGradient id="pulseGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={allActivated ? interpolate(frame % 60, [0, 30, 60], [0.05, 0.15, 0.05]) : 0} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* ---- Background deep space ---- */}
        <rect x={0} y={0} width={width} height={height} fill="#000008" />

        {/* Stars */}
        {STARS.map((star, i) => {
          const twinkle = interpolate(
            (frame + star.twinkleOffset) % 80,
            [0, 40, 80],
            [0.3, 1, 0.3]
          );
          return (
            <circle
              key={`star-${i}`}
              cx={star.x * (width / 800)}
              cy={star.y * (height / 400)}
              r={star.size * (width / 3840)}
              fill="white"
              opacity={star.brightness * twinkle * 0.8}
            />
          );
        })}

        {/* ---- Globe body ---- */}
        {/* Outer atmosphere */}
        <circle
          cx={cx}
          cy={cy}
          r={globeR * 1.05}
          fill="url(#atmosphereGrad)"
          opacity={0.8}
        />

        {/* Globe base */}
        <circle cx={cx} cy={cy} r={globeR} fill="url(#globeGrad)" />

        {/* Latitude / longitude grid lines */}
        <g clipPath="url(#globeClip)" opacity={0.12}>
          {Array.from({ length: 18 }, (_, i) => {
            const angle = (i * 20 + rotation) % 360;
            const radA = (angle * Math.PI) / 180;
            return (
              <line
                key={`lon-${i}`}
                x1={cx + globeR * Math.cos(radA - Math.PI / 2)}
                y1={cy + globeR * Math.sin(radA - Math.PI / 2)}
                x2={cx - globeR * Math.cos(radA - Math.PI / 2)}
                y2={cy - globeR * Math.sin(radA - Math.PI / 2)}
                stroke="#2244aa"
                strokeWidth={1 * (width / 3840)}
              />
            );
          })}
          {Array.from({ length: 9 }, (_, i) => {
            const lat = ((i + 1) * 180) / 10;
            const r = globeR * Math.sin((lat * Math.PI) / 180);
            const yOff = globeR * Math.cos((lat * Math.PI) / 180);
            return (
              <ellipse
                key={`lat-${i}`}
                cx={cx}
                cy={cy + yOff - globeR * 0.5}
                rx={r}
                ry={r * 0.2}
                fill="none"
                stroke="#2244aa"
                strokeWidth={1 * (width / 3840)}
              />
            );
          })}
        </g>

        {/* ---- Continents (flat map, clipped to globe) ---- */}
        <g
          clipPath="url(#globeClip)"
          transform={`rotate(${rotation}, ${cx}, ${cy})`}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          {CONTINENTS.map((continent) => {
            const activation = getActivation(continent.activateFrame);
            if (activation <= 0) return null;

            const path = pointsToPath(continent.points);

            return (
              <g key={continent.id}>
                {/* Glow layer */}
                <path
                  d={path}
                  fill={continent.color}
                  opacity={activation * 0.5}
                  filter={`url(#glow-${continent.id})`}
                />
                {/* Main fill */}
                <path
                  d={path}
                  fill={continent.color}
                  opacity={activation * 0.85}
                />
                {/* Bright edge */}
                <path
                  d={path}
                  fill="none"
                  stroke={continent.color}
                  strokeWidth={3 * (width / 3840)}
                  opacity={activation}
                />
              </g>
            );
          })}

          {/* City dots */}
          {CITY_DOTS.map((dot, i) => {
            const contActivation = getActivation(CONTINENTS[dot.continent]?.activateFrame ?? 999);
            if (contActivation <= 0) return null;
            const pulse = interpolate(
              (frame + dot.pulseOffset) % 60,
              [0, 30, 60],
              [0.6, 1.0, 0.6]
            );
            const { x, y } = mapToSvg(dot.x, dot.y);
            const color = CONTINENT_COLORS[dot.continent];
            return (
              <circle
                key={`city-${i}`}
                cx={x}
                cy={y}
                r={4 * (width / 3840)}
                fill={color}
                opacity={contActivation * pulse}
                filter="url(#glow)"
              />
            );
          })}

          {/* Connection lines */}
          {CONNECTIONS.map((conn, i) => {
            const contActivation = getActivation(CONTINENTS[conn.continent]?.activateFrame ?? 999);
            if (contActivation <= 0) return null;
            const animProgress = interpolate(
              frame,
              [(CONTINENTS[conn.continent]?.activateFrame ?? 0) + conn.delay, (CONTINENTS[conn.continent]?.activateFrame ?? 0) + conn.delay + 40],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            const p1 = mapToSvg(conn.x1, conn.y1);
            const p2 = mapToSvg(conn.x2, conn.y2);
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2 - 60 * (width / 3840);
            const color = CONTINENT_COLORS[conn.continent];
            return (
              <path
                key={`conn-${i}`}
                d={`M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`}
                fill="none"
                stroke={color}
                strokeWidth={1.5 * (width / 3840)}
                strokeDasharray={`${400 * animProgress} 400`}
                opacity={contActivation * 0.6}
              />
            );
          })}
        </g>

        {/* Globe rim shine */}
        <circle
          cx={cx}
          cy={cy}
          r={globeR}
          fill="none"
          stroke="url(#atmosphereGrad)"
          strokeWidth={4 * (width / 3840)}
          opacity={0.6}
        />

        {/* Globe highlight (top-left shine) */}
        <ellipse
          cx={cx - globeR * 0.25}
          cy={cy - globeR * 0.3}
          rx={globeR * 0.35}
          ry={globeR * 0.2}
          fill="white"
          opacity={0.04}
        />

        {/* ---- Orbital ring ---- */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={globeR * 1.25}
          ry={globeR * 0.25}
          fill="none"
          stroke="#2255cc"
          strokeWidth={2 * (width / 3840)}
          opacity={0.35}
          transform={`rotate(-20, ${cx}, ${cy})`}
        />

        {/* Orbital particles */}
        {ORBITAL_PARTICLES.map((p, i) => {
          const angle = ((p.angle + frame * p.speed) % 360) * (Math.PI / 180);
          const rx = globeR * 1.25;
          const ry = globeR * 0.25;
          const px = cx + rx * Math.cos(angle);
          const py = cy + ry * Math.sin(angle);
          // Rotate by -20 deg
          const rotRad = (-20 * Math.PI) / 180;
          const rpx = cx + (px - cx) * Math.cos(rotRad) - (py - cy) * Math.sin(rotRad);
          const rpy = cy + (px - cx) * Math.sin(rotRad) + (py - cy) * Math.cos(rotRad);

          const numActivated = CONTINENTS.filter(c => frame >= c.activateFrame).length;
          const opacityBase = Math.min(numActivated / 6, 1);
          const color = CONTINENT_COLORS[p.colorIndex];

          return (
            <circle
              key={`orb-${i}`}
              cx={rpx}
              cy={rpy}
              r={p.size * (width / 3840)}
              fill={color}
              opacity={opacityBase * 0.7}
              filter="url(#softGlow)"
            />
          );
        })}

        {/* ---- Activation pulse rings ---- */}
        {CONTINENTS.map((continent) => {
          const act = getActivation(continent.activateFrame);
          if (act <= 0 || act >= 1) return null;
          const pulseProgress = act;
          const firstPt = continent.points[0];
          const { x: fx, y: fy } = mapToSvg(firstPt[0], firstPt[1]);

          // Center of continent (rough)
          const avgX = continent.points.reduce((s, p) => s + p[0], 0) / continent.points.length;
          const avgY = continent.points.reduce((s, p) => s + p[1], 0) / continent.points.length;
          const { x: ccx, y: ccy } = mapToSvg(avgX, avgY);

          const pulseR = pulseProgress * 200 * (width / 3840);
          const pulseOpacity = interpolate(pulseProgress, [0, 0.5, 1], [0.8, 0.5, 0]);

          return (
            <circle
              key={`pulse-${continent.id}`}
              cx={ccx}
              cy={ccy}
              r={pulseR}
              fill="none"
              stroke={continent.color}
              strokeWidth={3 * (width / 3840)}
              opacity={pulseOpacity}
              filter="url(#strongGlow)"
            />
          );
        })}

        {/* ---- All markets activated: global golden pulse ---- */}
        {allActivated && (
          <circle
            cx={cx}
            cy={cy}
            r={globeR * (1 + interpolate(frame % 120, [0, 60, 120], [0, 0.3, 0]))}
            fill="none"
            stroke="#ffdd55"
            strokeWidth={4 * (width / 3840)}
            opacity={interpolate(frame % 120, [0, 60, 120], [0, 0.6, 0])}
            filter="url(#strongGlow)"
          />
        )}

        {/* ---- Scanline overlay for premium feel ---- */}
        <rect
          x={0} y={0}
          width={width} height={height}
          fill="none"
          stroke="none"
          opacity={0.03}
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 4px)',
          }}
        />
      </svg>
    </div>
  );
};