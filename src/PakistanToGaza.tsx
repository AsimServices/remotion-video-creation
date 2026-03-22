import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

// ── Color Palette ────────────────────────────────────────────────────────────
const COLORS = {
  bg: '#010a14',
  ocean: '#041220',
  land: '#0a2a1a',
  gridLine: '#0a2040',
  pathCyan: '#00ccff',
  pathGlow: '#0088cc',
  originGreen: '#00ff88',
  originGlow: '#00cc66',
  destGold: '#ffd700',
  destGlow: '#ffaa00',
  hudCyan: '#00e5ff',
  white: '#f0f4f8',
  muted: '#4a6a8a',
  planeWhite: '#e8f0ff',
  trailCyan: '#00bbff',
};

// ── Scene Timing ─────────────────────────────────────────────────────────────
const S1_START = 0;   const S1_END = 120;   // 4s — Title card
const S2_START = 90;  const S2_END = 210;   // 4s — Map reveal + origin
const S3_START = 180; const S3_END = 720;   // 18s — Flight animation
const S4_START = 690; const S4_END = 840;   // 5s — Arrival
const S5_START = 810; const S5_END = 930;   // 4s — Closing
export const TOTAL_FRAMES = 930; // 31 seconds

// ── Map Projection ───────────────────────────────────────────────────────────
const MAP_LON_MIN = 25;
const MAP_LON_MAX = 80;
const MAP_LAT_MIN = 15;
const MAP_LAT_MAX = 42;

function lonLatToXY(lon: number, lat: number, w: number, h: number): [number, number] {
  const x = ((lon - MAP_LON_MIN) / (MAP_LON_MAX - MAP_LON_MIN)) * w;
  const y = ((MAP_LAT_MAX - lat) / (MAP_LAT_MAX - MAP_LAT_MIN)) * h;
  return [x, y];
}

// ── Locations ────────────────────────────────────────────────────────────────
const PAKISTAN = { lon: 67.0, lat: 30.0, name: 'PAKISTAN', city: 'Islamabad' };
const GAZA = { lon: 34.47, lat: 31.35, name: 'GAZA', city: 'Gaza Strip' };

// ── Flight Path Waypoints (curved route over Iran, Iraq, Jordan) ─────────
const WAYPOINTS: [number, number][] = [
  [PAKISTAN.lon, PAKISTAN.lat],
  [62, 31.5],    // Eastern Iran
  [56, 32.5],    // Central Iran
  [50, 33],      // Western Iran
  [45, 33],      // Iraq
  [40, 32.5],    // Western Iraq
  [37, 32],      // Jordan
  [GAZA.lon, GAZA.lat],
];

const FLIGHT_DISTANCE_KM = 3800;

function interpolatePath(t: number): [number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  const segments = WAYPOINTS.length - 1;
  const scaledT = clamped * segments;
  const segIdx = Math.min(Math.floor(scaledT), segments - 1);
  const segT = scaledT - segIdx;
  const [lon0, lat0] = WAYPOINTS[segIdx];
  const [lon1, lat1] = WAYPOINTS[segIdx + 1];
  return [lon0 + (lon1 - lon0) * segT, lat0 + (lat1 - lat0) * segT];
}

function getHeading(t: number, w: number, h: number): number {
  const d = 0.004;
  const [x0, y0] = lonLatToXY(...interpolatePath(Math.max(0, t - d)), w, h);
  const [x1, y1] = lonLatToXY(...interpolatePath(Math.min(1, t + d)), w, h);
  return Math.atan2(y1 - y0, x1 - x0) * (180 / Math.PI);
}

// ── Country Outlines ─────────────────────────────────────────────────────────
const COUNTRIES: { name: string; fill: string; stroke: string; points: [number, number][] }[] = [
  {
    name: 'Pakistan',
    fill: '#0a2a1a',
    stroke: '#1a6a3a',
    points: [
      [61.5, 35.5], [71, 36.5], [74.5, 37], [77, 35.5], [74, 32],
      [73.5, 28], [71, 24.5], [68.5, 23.5], [63, 25], [60.5, 29],
      [60.8, 33], [61.5, 35.5],
    ],
  },
  {
    name: 'India',
    fill: '#0a1a2a',
    stroke: '#1a3a5a',
    points: [
      [77, 35.5], [80, 32], [82, 28], [84, 22], [80, 16],
      [78, 15], [75, 15.5], [73, 17], [72, 20], [68.5, 23.5],
      [71, 24.5], [73.5, 28], [74, 32], [77, 35.5],
    ],
  },
  {
    name: 'Iran',
    fill: '#0a1a1a',
    stroke: '#1a4a4a',
    points: [
      [44.5, 39.5], [48, 40], [50, 39], [53.5, 37.5], [55, 36.5],
      [58, 37], [60.5, 36.5], [61.5, 35.5], [60.8, 33], [60.5, 29],
      [57, 25.5], [55, 24.5], [52.5, 26.5], [50, 28], [48, 30.5],
      [44.5, 33], [44.5, 36], [44.5, 39.5],
    ],
  },
  {
    name: 'Iraq',
    fill: '#1a1a0a',
    stroke: '#4a4a1a',
    points: [
      [38.5, 33.5], [40, 36.5], [43, 37.5], [44.5, 38], [46, 36.5],
      [48, 34.5], [48.5, 31], [47, 29.5], [44, 29.5], [42, 31.5],
      [40, 32], [38.5, 33.5],
    ],
  },
  {
    name: 'Saudi Arabia',
    fill: '#1a0a0a',
    stroke: '#4a1a1a',
    points: [
      [36.5, 29.5], [38.5, 33.5], [40, 32], [42, 31.5], [44, 29.5],
      [47, 29.5], [55, 24], [57, 22], [55, 20], [50, 19],
      [44, 18.5], [40, 20], [37, 22], [36, 26], [36.5, 29.5],
    ],
  },
  {
    name: 'Jordan',
    fill: '#1a150a',
    stroke: '#5a4a2a',
    points: [
      [34.8, 29.5], [36.5, 29.5], [38.5, 33.5], [36.5, 33],
      [35.5, 32.5], [34.8, 31], [34.8, 29.5],
    ],
  },
  {
    name: 'Syria',
    fill: '#1a0a1a',
    stroke: '#4a1a4a',
    points: [
      [35.5, 32.5], [36.5, 33], [38.5, 33.5], [40, 32], [42, 31.5],
      [41, 36.5], [38.5, 37], [36.5, 36.5], [35.5, 35.5], [35.5, 32.5],
    ],
  },
  {
    name: 'Turkey',
    fill: '#0a1a2a',
    stroke: '#1a3a5a',
    points: [
      [26, 41], [30, 42], [36, 42], [40, 42], [44.5, 39.5],
      [44.5, 36], [41, 36.5], [38.5, 37], [36.5, 36.5], [35.5, 35.5],
      [35.5, 36.5], [32, 36.5], [26, 36.5], [26, 41],
    ],
  },
  {
    name: 'Afghanistan',
    fill: '#0a1a0a',
    stroke: '#1a4a1a',
    points: [
      [61.5, 35.5], [63, 37], [66, 38], [69.5, 38], [71, 38.5],
      [74.5, 37], [71, 36.5], [61.5, 35.5],
    ],
  },
  {
    name: 'Egypt',
    fill: '#1a1a0a',
    stroke: '#5a5a1a',
    points: [
      [25, 31.5], [29, 31.5], [34.2, 29.5], [34.2, 22],
      [31, 22], [25, 22], [25, 31.5],
    ],
  },
  {
    name: 'Palestine/Gaza',
    fill: '#1a2a0a',
    stroke: '#4a8a2a',
    points: [
      [34.0, 31.8], [35.2, 33], [35.8, 33], [35.5, 31.5],
      [35, 29.5], [34.2, 29.5], [34.0, 31.8],
    ],
  },
  {
    name: 'UAE',
    fill: '#0a1a1a',
    stroke: '#1a4a4a',
    points: [
      [51, 24], [55, 24.5], [56, 24], [56.5, 22.5],
      [55, 22], [52.5, 22.5], [51, 24],
    ],
  },
  {
    name: 'Oman',
    fill: '#0a1a1a',
    stroke: '#1a3a3a',
    points: [
      [55, 24.5], [57, 25.5], [60, 22], [59, 20],
      [57, 17], [55, 20], [55, 22], [56.5, 22.5],
      [56, 24], [55, 24.5],
    ],
  },
  {
    name: 'Lebanon',
    fill: '#0a1a0a',
    stroke: '#2a5a2a',
    points: [
      [35.5, 33.2], [36.5, 34.5], [36, 33.5], [35.5, 33],
      [35.2, 33], [35.5, 33.2],
    ],
  },
];

// ── Animation Helpers ────────────────────────────────────────────────────────
const fadeIn = (frame: number, start: number, dur = 30) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

const fadeOut = (frame: number, end: number, dur = 20) =>
  interpolate(frame, [end - dur, end], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

// ── Plane SVG Component ──────────────────────────────────────────────────────
const PlaneSVG: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Fuselage */}
    <ellipse cx="32" cy="32" rx="6" ry="24" fill={color} opacity={0.95} />
    {/* Wings */}
    <path d="M32 22 L58 34 L56 38 L32 30 Z" fill={color} opacity={0.85} />
    <path d="M32 22 L6 34 L8 38 L32 30 Z" fill={color} opacity={0.85} />
    {/* Tail */}
    <path d="M32 54 L42 60 L40 56 L32 52 Z" fill={color} opacity={0.8} />
    <path d="M32 54 L22 60 L24 56 L32 52 Z" fill={color} opacity={0.8} />
    {/* Nose highlight */}
    <ellipse cx="32" cy="12" rx="3" ry="5" fill="#ffffff" opacity={0.3} />
    {/* Window line */}
    <rect x="30" y="16" width="4" height="8" rx="2" fill="#00ccff" opacity={0.4} />
  </svg>
);

// ── Grid Background ──────────────────────────────────────────────────────────
const GridBg: React.FC<{ w: number; h: number; opacity: number }> = ({ w, h, opacity }) => {
  const cols = 24;
  const rows = 14;
  return (
    <g>
      {Array.from({ length: cols + 1 }, (_, i) => (
        <line key={`v${i}`}
          x1={(i / cols) * w} y1={0} x2={(i / cols) * w} y2={h}
          stroke={COLORS.gridLine} strokeWidth={1} opacity={opacity} />
      ))}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <line key={`h${i}`}
          x1={0} y1={(i / rows) * h} x2={w} y2={(i / rows) * h}
          stroke={COLORS.gridLine} strokeWidth={1} opacity={opacity} />
      ))}
    </g>
  );
};

// ── Pulsing Marker ───────────────────────────────────────────────────────────
const PulsingMarker: React.FC<{
  cx: number; cy: number; color: string; glowColor: string;
  frame: number; label: string; sublabel: string; showLabel: boolean;
}> = ({ cx, cy, color, glowColor, frame, label, sublabel, showLabel }) => {
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.08);
  const ringScale = 1 + pulse * 0.6;
  return (
    <g>
      {/* Outer glow rings */}
      <circle cx={cx} cy={cy} r={40 * ringScale} fill="none" stroke={glowColor} strokeWidth={2} opacity={0.15 + pulse * 0.1} />
      <circle cx={cx} cy={cy} r={25 * ringScale} fill="none" stroke={glowColor} strokeWidth={2.5} opacity={0.25 + pulse * 0.15} />
      {/* Glow */}
      <circle cx={cx} cy={cy} r={18} fill={glowColor} opacity={0.15 + pulse * 0.1} />
      {/* Core dot */}
      <circle cx={cx} cy={cy} r={10} fill={color} opacity={0.95} />
      <circle cx={cx} cy={cy} r={5} fill="#ffffff" opacity={0.8} />
      {/* Label */}
      {showLabel && (
        <>
          <text x={cx} y={cy - 55} textAnchor="middle" fill={color}
            fontSize={42} fontWeight={800} fontFamily="Arial, sans-serif"
            style={{ letterSpacing: '4px' }}>
            {label}
          </text>
          <text x={cx} y={cy - 20} textAnchor="middle" fill={COLORS.muted}
            fontSize={28} fontWeight={400} fontFamily="Arial, sans-serif">
            {sublabel}
          </text>
        </>
      )}
    </g>
  );
};

// ── Scene 1: Title Card ──────────────────────────────────────────────────────
const SceneTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const opacity = fadeIn(frame, 0, 40) * fadeOut(frame, S1_END - S1_START, 25);

  const titleSpring = spring({ frame, fps, config: { stiffness: 60, damping: 14 } });
  const subtitleOp = fadeIn(frame, 30, 30);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Background gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 40%, #0a2040 0%, ${COLORS.bg} 70%)`,
      }} />

      {/* Plane icon at top */}
      <div style={{
        position: 'absolute', top: height * 0.22, left: '50%',
        transform: `translate(-50%, -50%) scale(${titleSpring}) rotate(-45deg)`,
      }}>
        <PlaneSVG size={280} color={COLORS.pathCyan} />
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', top: height * 0.42, width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        transform: `scale(${0.7 + titleSpring * 0.3})`,
      }}>
        <span style={{
          fontSize: 160, fontWeight: 900, fontFamily: 'Arial, sans-serif',
          background: `linear-gradient(135deg, ${COLORS.originGreen}, ${COLORS.pathCyan})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', letterSpacing: '-3px',
        }}>
          PAKISTAN
        </span>
        <span style={{
          fontSize: 80, fontWeight: 300, color: COLORS.muted,
          marginTop: -10, letterSpacing: '12px',
        }}>
          ──── TO ────
        </span>
        <span style={{
          fontSize: 160, fontWeight: 900, fontFamily: 'Arial, sans-serif',
          background: `linear-gradient(135deg, ${COLORS.destGold}, ${COLORS.destGlow})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', letterSpacing: '-3px', marginTop: -10,
        }}>
          GAZA
        </span>
      </div>

      {/* Subtitle */}
      <div style={{
        position: 'absolute', bottom: height * 0.18, width: '100%',
        textAlign: 'center', opacity: subtitleOp,
      }}>
        <span style={{
          fontSize: 52, fontWeight: 400, color: COLORS.muted,
          letterSpacing: '8px', fontFamily: 'Arial, sans-serif',
        }}>
          FLIGHT PATH ANIMATION
        </span>
      </div>

      {/* Distance badge */}
      <div style={{
        position: 'absolute', bottom: height * 0.08, width: '100%',
        textAlign: 'center', opacity: subtitleOp,
      }}>
        <span style={{
          fontSize: 38, fontWeight: 700, color: COLORS.pathCyan,
          letterSpacing: '6px', fontFamily: 'monospace',
          padding: '12px 40px', border: `2px solid ${COLORS.pathCyan}44`,
          borderRadius: 12, background: `${COLORS.pathCyan}08`,
        }}>
          {FLIGHT_DISTANCE_KM.toLocaleString()} KM
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: Map Reveal ──────────────────────────────────────────────────────
const SceneMapReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const opacity = fadeIn(frame, 0, 30);

  const mapSpring = spring({ frame, fps, config: { stiffness: 50, damping: 16 } });
  const markerOp = fadeIn(frame, 40, 30);

  const [pkX, pkY] = lonLatToXY(PAKISTAN.lon, PAKISTAN.lat, width, height);
  const [gzX, gzY] = lonLatToXY(GAZA.lon, GAZA.lat, width, height);

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        {/* Grid */}
        <GridBg w={width} h={height} opacity={0.06 * mapSpring} />

        {/* Countries */}
        {COUNTRIES.map((c) => {
          const pts = c.points.map(([lon, lat]) => lonLatToXY(lon, lat, width, height).join(',')).join(' ');
          return (
            <polygon key={c.name} points={pts}
              fill={c.fill} stroke={c.stroke} strokeWidth={2}
              opacity={mapSpring * 0.9} />
          );
        })}

        {/* Origin marker — Pakistan */}
        <g opacity={markerOp}>
          <PulsingMarker cx={pkX} cy={pkY} color={COLORS.originGreen} glowColor={COLORS.originGlow}
            frame={frame} label="PAKISTAN" sublabel="Origin" showLabel />
        </g>

        {/* Destination marker — Gaza */}
        <g opacity={markerOp}>
          <PulsingMarker cx={gzX} cy={gzY} color={COLORS.destGold} glowColor={COLORS.destGlow}
            frame={frame} label="GAZA" sublabel="Destination" showLabel />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ── Scene 3: Flight Animation ────────────────────────────────────────────────
const SceneFlight: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const sceneDur = S3_END - S3_START;

  const flightProgress = interpolate(frame, [30, sceneDur - 30], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const [planeLon, planeLat] = interpolatePath(flightProgress);
  const [planeX, planeY] = lonLatToXY(planeLon, planeLat, width, height);
  const heading = getHeading(flightProgress, width, height);

  const [pkX, pkY] = lonLatToXY(PAKISTAN.lon, PAKISTAN.lat, width, height);
  const [gzX, gzY] = lonLatToXY(GAZA.lon, GAZA.lat, width, height);

  // Build the flight path SVG data drawn so far
  const pathSteps = 200;
  const drawnSteps = Math.floor(flightProgress * pathSteps);
  let pathD = '';
  for (let i = 0; i <= drawnSteps; i++) {
    const t = i / pathSteps;
    const [lon, lat] = interpolatePath(t);
    const [px, py] = lonLatToXY(lon, lat, width, height);
    pathD += (i === 0 ? `M${px},${py}` : ` L${px},${py}`);
  }

  // Full path (dimmed)
  let fullPathD = '';
  for (let i = 0; i <= pathSteps; i++) {
    const t = i / pathSteps;
    const [lon, lat] = interpolatePath(t);
    const [px, py] = lonLatToXY(lon, lat, width, height);
    fullPathD += (i === 0 ? `M${px},${py}` : ` L${px},${py}`);
  }

  // Trail dots behind the plane
  const trailDots = Array.from({ length: 30 }, (_, i) => {
    const trailT = flightProgress - (i + 1) * 0.008;
    if (trailT < 0) return null;
    const [lon, lat] = interpolatePath(trailT);
    const [tx, ty] = lonLatToXY(lon, lat, width, height);
    const op = 0.6 * (1 - i / 30);
    const r = 4 * (1 - i / 30);
    return { tx, ty, op, r, i };
  }).filter(Boolean);

  // Distance covered
  const distCovered = Math.round(flightProgress * FLIGHT_DISTANCE_KM);

  // Altitude simulation (climb, cruise, descend)
  const altKm = flightProgress < 0.1
    ? interpolate(flightProgress, [0, 0.1], [0, 11], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : flightProgress > 0.9
      ? interpolate(flightProgress, [0.9, 1], [11, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      : 11;

  const fadeOp = fadeIn(frame, 0, 20) * fadeOut(frame, sceneDur, 20);

  const planeScale = spring({ frame: Math.max(0, frame - 20), fps, config: { stiffness: 100, damping: 12 } });

  return (
    <AbsoluteFill style={{ opacity: fadeOp }}>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        {/* Grid */}
        <GridBg w={width} h={height} opacity={0.05} />

        {/* Countries */}
        {COUNTRIES.map((c) => {
          const pts = c.points.map(([lon, lat]) => lonLatToXY(lon, lat, width, height).join(',')).join(' ');
          return (
            <polygon key={c.name} points={pts}
              fill={c.fill} stroke={c.stroke} strokeWidth={2} opacity={0.85} />
          );
        })}

        {/* Full path (dim dashed) */}
        <path d={fullPathD} fill="none" stroke={COLORS.pathCyan} strokeWidth={3}
          strokeDasharray="12,8" opacity={0.15} />

        {/* Drawn path (bright) */}
        {pathD && (
          <>
            <path d={pathD} fill="none" stroke={COLORS.pathCyan} strokeWidth={5} opacity={0.8}
              strokeLinecap="round" strokeLinejoin="round" />
            <path d={pathD} fill="none" stroke={COLORS.pathGlow} strokeWidth={12} opacity={0.2}
              strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}

        {/* Trail dots */}
        {trailDots.map((dot) => dot && (
          <circle key={dot.i} cx={dot.tx} cy={dot.ty} r={dot.r}
            fill={COLORS.trailCyan} opacity={dot.op} />
        ))}

        {/* Origin marker */}
        <PulsingMarker cx={pkX} cy={pkY} color={COLORS.originGreen} glowColor={COLORS.originGlow}
          frame={frame} label="PAKISTAN" sublabel="" showLabel />

        {/* Destination marker */}
        <PulsingMarker cx={gzX} cy={gzY} color={COLORS.destGold} glowColor={COLORS.destGlow}
          frame={frame} label="GAZA" sublabel="" showLabel />
      </svg>

      {/* Plane */}
      <div style={{
        position: 'absolute',
        left: planeX, top: planeY,
        transform: `translate(-50%, -50%) rotate(${heading - 90}deg) scale(${planeScale})`,
        filter: `drop-shadow(0 0 20px ${COLORS.pathCyan})`,
      }}>
        <PlaneSVG size={110} color={COLORS.planeWhite} />
      </div>

      {/* HUD — top left: distance */}
      <div style={{
        position: 'absolute', top: 60, left: 80,
        fontFamily: 'monospace', color: COLORS.hudCyan,
      }}>
        <div style={{ fontSize: 36, opacity: 0.6, letterSpacing: '4px' }}>DISTANCE</div>
        <div style={{ fontSize: 72, fontWeight: 900, marginTop: 4 }}>
          {distCovered.toLocaleString()} <span style={{ fontSize: 36, opacity: 0.6 }}>KM</span>
        </div>
      </div>

      {/* HUD — top right: altitude */}
      <div style={{
        position: 'absolute', top: 60, right: 80,
        fontFamily: 'monospace', color: COLORS.hudCyan, textAlign: 'right',
      }}>
        <div style={{ fontSize: 36, opacity: 0.6, letterSpacing: '4px' }}>ALTITUDE</div>
        <div style={{ fontSize: 72, fontWeight: 900, marginTop: 4 }}>
          {altKm.toFixed(1)} <span style={{ fontSize: 36, opacity: 0.6 }}>KM</span>
        </div>
      </div>

      {/* HUD — bottom: progress bar */}
      <div style={{
        position: 'absolute', bottom: 80, left: 200, right: 200,
        height: 8, background: `${COLORS.pathCyan}22`, borderRadius: 4,
      }}>
        <div style={{
          width: `${flightProgress * 100}%`, height: '100%',
          background: `linear-gradient(90deg, ${COLORS.originGreen}, ${COLORS.pathCyan}, ${COLORS.destGold})`,
          borderRadius: 4, boxShadow: `0 0 20px ${COLORS.pathCyan}66`,
        }} />
      </div>

      {/* Progress labels */}
      <div style={{
        position: 'absolute', bottom: 100, left: 200,
        fontFamily: 'monospace', fontSize: 30, color: COLORS.originGreen, fontWeight: 700,
      }}>
        PKR
      </div>
      <div style={{
        position: 'absolute', bottom: 100, right: 200,
        fontFamily: 'monospace', fontSize: 30, color: COLORS.destGold, fontWeight: 700,
      }}>
        GAZA
      </div>
      <div style={{
        position: 'absolute', bottom: 40, left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'monospace', fontSize: 34, color: COLORS.white, fontWeight: 700,
        opacity: 0.7,
      }}>
        {Math.round(flightProgress * 100)}%
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: Arrival ─────────────────────────────────────────────────────────
const SceneArrival: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const opacity = fadeIn(frame, 0, 20) * fadeOut(frame, S4_END - S4_START, 25);

  const [gzX, gzY] = lonLatToXY(GAZA.lon, GAZA.lat, width, height);

  const arrivalSpring = spring({ frame, fps, config: { stiffness: 60, damping: 12 } });
  const ringExpand = frame * 1.5;

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <GridBg w={width} h={height} opacity={0.04} />

        {COUNTRIES.map((c) => {
          const pts = c.points.map(([lon, lat]) => lonLatToXY(lon, lat, width, height).join(',')).join(' ');
          return (
            <polygon key={c.name} points={pts}
              fill={c.fill} stroke={c.stroke} strokeWidth={2} opacity={0.7} />
          );
        })}

        {/* Full flight path */}
        {(() => {
          let d = '';
          for (let i = 0; i <= 200; i++) {
            const t = i / 200;
            const [lon, lat] = interpolatePath(t);
            const [px, py] = lonLatToXY(lon, lat, width, height);
            d += (i === 0 ? `M${px},${py}` : ` L${px},${py}`);
          }
          return <path d={d} fill="none" stroke={COLORS.pathCyan} strokeWidth={4} opacity={0.5} />;
        })()}

        {/* Arrival rings */}
        {[1, 2, 3].map((r) => (
          <circle key={r} cx={gzX} cy={gzY}
            r={ringExpand * r * 0.8}
            fill="none" stroke={COLORS.destGold} strokeWidth={3}
            opacity={Math.max(0, 0.6 - ringExpand * r * 0.003)} />
        ))}

        {/* Gaza marker big */}
        <circle cx={gzX} cy={gzY} r={20} fill={COLORS.destGold} opacity={0.95} />
        <circle cx={gzX} cy={gzY} r={10} fill="#ffffff" opacity={0.9} />
      </svg>

      {/* Arrived text */}
      <div style={{
        position: 'absolute', top: height * 0.15, width: '100%',
        textAlign: 'center',
        transform: `scale(${0.5 + arrivalSpring * 0.5})`,
      }}>
        <div style={{
          fontSize: 140, fontWeight: 900, fontFamily: 'Arial, sans-serif',
          background: `linear-gradient(135deg, ${COLORS.destGold}, ${COLORS.destGlow})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', letterSpacing: '-2px',
        }}>
          ARRIVED IN GAZA
        </div>
        <div style={{
          fontSize: 60, fontWeight: 400, color: COLORS.muted,
          marginTop: 20, letterSpacing: '6px',
        }}>
          DESTINATION REACHED
        </div>
      </div>

      {/* Plane parked at destination */}
      <div style={{
        position: 'absolute', left: gzX, top: gzY - 70,
        transform: `translate(-50%, -50%) rotate(-45deg) scale(${arrivalSpring})`,
        filter: `drop-shadow(0 0 30px ${COLORS.destGold})`,
      }}>
        <PlaneSVG size={120} color={COLORS.planeWhite} />
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 5: Stats Summary ───────────────────────────────────────────────────
const SceneStats: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const opacity = fadeIn(frame, 0, 20) * fadeOut(frame, S5_END - S5_START, 30);

  const stats = [
    { label: 'TOTAL DISTANCE', value: `${FLIGHT_DISTANCE_KM.toLocaleString()} KM`, color: COLORS.pathCyan },
    { label: 'CRUISE ALTITUDE', value: '11 KM', color: COLORS.originGreen },
    { label: 'COUNTRIES CROSSED', value: '5', color: COLORS.destGold },
  ];

  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 50%, #0a2040 0%, ${COLORS.bg} 70%)`,
      }} />

      {/* Title */}
      <div style={{
        position: 'absolute', top: height * 0.15, width: '100%', textAlign: 'center',
      }}>
        <span style={{
          fontSize: 90, fontWeight: 900, fontFamily: 'Arial, sans-serif',
          color: COLORS.white, letterSpacing: '-2px',
        }}>
          FLIGHT SUMMARY
        </span>
      </div>

      {/* Stats cards */}
      <div style={{
        position: 'absolute', top: height * 0.35, width: '100%',
        display: 'flex', justifyContent: 'center', gap: 80,
      }}>
        {stats.map((stat, i) => {
          const cardSpring = spring({
            frame: Math.max(0, frame - i * 10),
            fps,
            config: { stiffness: 80, damping: 13 },
          });
          return (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '60px 80px', borderRadius: 32,
              background: 'rgba(6, 23, 40, 0.85)',
              border: `2px solid ${stat.color}44`,
              boxShadow: `0 0 40px ${stat.color}22`,
              transform: `translateY(${(1 - cardSpring) * 60}px)`,
              opacity: cardSpring,
            }}>
              <span style={{
                fontSize: 34, fontWeight: 400, color: COLORS.muted,
                letterSpacing: '6px', marginBottom: 20,
              }}>
                {stat.label}
              </span>
              <span style={{
                fontSize: 80, fontWeight: 900, color: stat.color,
                fontFamily: 'monospace',
              }}>
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Pakistan → Gaza label */}
      <div style={{
        position: 'absolute', bottom: height * 0.12, width: '100%',
        textAlign: 'center',
      }}>
        <span style={{
          fontSize: 50, fontWeight: 700, fontFamily: 'Arial, sans-serif',
          background: `linear-gradient(90deg, ${COLORS.originGreen}, ${COLORS.pathCyan}, ${COLORS.destGold})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', letterSpacing: '8px',
        }}>
          PAKISTAN ✈ GAZA
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── Main Composition ─────────────────────────────────────────────────────────
export const PakistanToGaza: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Sequence from={S1_START} durationInFrames={S1_END - S1_START}>
        <SceneTitle />
      </Sequence>
      <Sequence from={S2_START} durationInFrames={S2_END - S2_START}>
        <SceneMapReveal />
      </Sequence>
      <Sequence from={S3_START} durationInFrames={S3_END - S3_START}>
        <SceneFlight />
      </Sequence>
      <Sequence from={S4_START} durationInFrames={S4_END - S4_START}>
        <SceneArrival />
      </Sequence>
      <Sequence from={S5_START} durationInFrames={S5_END - S5_START}>
        <SceneStats />
      </Sequence>
    </AbsoluteFill>
  );
};
