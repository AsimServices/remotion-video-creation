import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { F16Jet } from './F16Jet';

// ── Color Palette ────────────────────────────────────────────────────────────
const COLORS = {
  bg: '#020810',
  ocean: '#061020',
  gridLine: '#0a2a4a',
  hudCyan: '#00e5ff',
  hudGreen: '#00ff88',
  trailOrange: '#ff6600',
  trailYellow: '#ffaa00',
  originGreen: '#00ff88',
  targetRed: '#ff3333',
  targetOrange: '#ff6600',
  white: '#f0f4f8',
  muted: '#4a6a8a',
  gold: '#ffd700',
};

// ── Scene Timing ─────────────────────────────────────────────────────────────
const FPS = 30;
const S1_START = 0;    const S1_END = 120;   // 4s — Mission Briefing title
const S2_START = 80;   const S2_END = 210;   // ~4.3s — Map reveal + origin marker
const S3_START = 180;  const S3_END = 720;   // 18s — Flight animation
const S4_START = 690;  const S4_END = 840;   // 5s — Arrival + mission complete
const S5_START = 810;  const S5_END = 930;   // 4s — Stats summary + fade out
export const TOTAL_FRAMES = 930; // 31 seconds

// ── Map Projection ───────────────────────────────────────────────────────────
const MAP_LON_MIN = 15;
const MAP_LON_MAX = 85;
const MAP_LAT_MIN = 5;
const MAP_LAT_MAX = 50;

function lonLatToXY(lon: number, lat: number, w: number, h: number): [number, number] {
  const x = ((lon - MAP_LON_MIN) / (MAP_LON_MAX - MAP_LON_MIN)) * w;
  const y = ((MAP_LAT_MAX - lat) / (MAP_LAT_MAX - MAP_LAT_MIN)) * h;
  return [x, y];
}

// ── Locations ────────────────────────────────────────────────────────────────
const ISLAMABAD = { lon: 73.05, lat: 33.69, name: 'ISLAMABAD', country: 'PAKISTAN' };
const TEL_AVIV  = { lon: 34.78, lat: 32.08, name: 'TEL AVIV',  country: 'ISRAEL' };

// ── Flight Path Waypoints (Islamabad → Iran → Iraq → Jordan → Tel Aviv) ─────
const WAYPOINTS: [number, number][] = [
  [ISLAMABAD.lon, ISLAMABAD.lat],
  [66, 33.5],   // Eastern Iran
  [58, 33],     // Central Iran
  [50, 33.5],   // Western Iran / Iraq border
  [44, 33],     // Central Iraq
  [39, 32.5],   // Western Iraq / Jordan
  [TEL_AVIV.lon, TEL_AVIV.lat],
];

// Distance approx ~3,200 km
const FLIGHT_DISTANCE_KM = 3200;

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
      [78, 10], [75, 8], [73, 10], [72, 16], [68.5, 23.5],
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
      [26, 41], [30, 43], [36, 42], [40, 42.5], [44.5, 39.5],
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
    name: 'Israel',
    fill: '#0a0a2a',
    stroke: '#3a3aaa',
    points: [
      [34.2, 31.5], [35.2, 33], [35.8, 33], [35.5, 31.5],
      [35, 29.5], [34.2, 29.5], [34.2, 31.5],
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

// ── Radar Sweep ──────────────────────────────────────────────────────────────
const RadarSweep: React.FC<{ cx: number; cy: number; radius: number; frame: number }> = ({
  cx, cy, radius, frame,
}) => {
  const angle = (frame * 3) % 360;
  const rad = (angle * Math.PI) / 180;
  const endX = cx + Math.cos(rad) * radius;
  const endY = cy + Math.sin(rad) * radius;
  return (
    <g>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke={COLORS.hudCyan} strokeWidth={1.5} opacity={0.2} />
      <circle cx={cx} cy={cy} r={radius * 0.66} fill="none" stroke={COLORS.hudCyan} strokeWidth={1} opacity={0.15} />
      <circle cx={cx} cy={cy} r={radius * 0.33} fill="none" stroke={COLORS.hudCyan} strokeWidth={1} opacity={0.1} />
      <line x1={cx} y1={cy} x2={endX} y2={endY} stroke={COLORS.hudCyan} strokeWidth={2} opacity={0.6} />
      <circle cx={cx} cy={cy} r={4} fill={COLORS.hudCyan} opacity={0.8} />
    </g>
  );
};

// ── Afterburner Effect ───────────────────────────────────────────────────────
const Afterburner: React.FC<{ x: number; y: number; heading: number; frame: number; intensity: number; size: number }> = ({
  x, y, heading, frame, intensity, size,
}) => {
  const rad = ((heading + 180) * Math.PI) / 180; // opposite of heading
  const flicker = 0.7 + 0.3 * Math.sin(frame * 0.8);
  const flames = [
    { len: size * 1.8, width: size * 0.25, color: '#ff4400', op: 0.4 * intensity * flicker },
    { len: size * 1.4, width: size * 0.18, color: '#ff8800', op: 0.5 * intensity * flicker },
    { len: size * 1.0, width: size * 0.12, color: '#ffcc00', op: 0.6 * intensity * flicker },
    { len: size * 0.6, width: size * 0.08, color: '#ffffff', op: 0.7 * intensity * flicker },
  ];
  return (
    <g>
      {flames.map((f, i) => {
        const ex = x + Math.cos(rad) * f.len;
        const ey = y + Math.sin(rad) * f.len;
        return (
          <line key={i} x1={x} y1={y} x2={ex} y2={ey}
            stroke={f.color} strokeWidth={f.width} strokeLinecap="round" opacity={f.op}
          />
        );
      })}
    </g>
  );
};

// ── Scene 1: Mission Briefing ────────────────────────────────────────────────
const SceneMissionBriefing: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const titleOp = fadeIn(frame, 15, 30) * fadeOut(frame, S1_END - S1_START, 25);
  const lineOp = fadeIn(frame, 5, 20);
  const scanlineY = interpolate(frame, [0, S1_END - S1_START], [0, height], {
    extrapolateRight: 'clamp',
  });

  const subtitleOp = fadeIn(frame, 40, 25) * fadeOut(frame, S1_END - S1_START, 25);
  const coordsOp = fadeIn(frame, 60, 20) * fadeOut(frame, S1_END - S1_START, 25);

  const scaleT = spring({ frame, fps, config: { stiffness: 60, damping: 14 }, delay: 15 });

  return (
    <AbsoluteFill>
      {/* Scanline effect */}
      <div style={{
        position: 'absolute', left: 0, top: scanlineY, width: '100%', height: 2,
        background: `linear-gradient(90deg, transparent, ${COLORS.hudCyan}44, transparent)`,
        pointerEvents: 'none',
      }} />

      {/* Horizontal accent lines */}
      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
        <line x1={width * 0.15} y1={height * 0.38} x2={width * 0.85} y2={height * 0.38}
          stroke={COLORS.hudCyan} strokeWidth={1} opacity={lineOp * 0.3} />
        <line x1={width * 0.15} y1={height * 0.62} x2={width * 0.85} y2={height * 0.62}
          stroke={COLORS.hudCyan} strokeWidth={1} opacity={lineOp * 0.3} />
      </svg>

      {/* Title */}
      <div style={{
        position: 'absolute', top: height * 0.40, width: '100%',
        textAlign: 'center', opacity: titleOp,
        transform: `scale(${scaleT})`,
      }}>
        <div style={{
          color: COLORS.white, fontSize: width * 0.045, fontFamily: 'sans-serif',
          fontWeight: 900, letterSpacing: 12, textTransform: 'uppercase',
          textShadow: `0 0 40px ${COLORS.hudCyan}88, 0 0 80px ${COLORS.hudCyan}44`,
        }}>
          MISSION BRIEFING
        </div>
      </div>

      {/* Subtitle */}
      <div style={{
        position: 'absolute', top: height * 0.50, width: '100%',
        textAlign: 'center', opacity: subtitleOp,
      }}>
        <div style={{
          color: COLORS.hudCyan, fontSize: width * 0.018, fontFamily: 'monospace',
          letterSpacing: 8,
        }}>
          F-16 FIGHTING FALCON — COMBAT SORTIE
        </div>
      </div>

      {/* Coordinates */}
      <div style={{
        position: 'absolute', top: height * 0.56, width: '100%',
        textAlign: 'center', opacity: coordsOp,
      }}>
        <div style={{
          color: COLORS.muted, fontSize: width * 0.012, fontFamily: 'monospace',
          letterSpacing: 4,
        }}>
          ORIGIN: {ISLAMABAD.lat.toFixed(2)}°N {ISLAMABAD.lon.toFixed(2)}°E &nbsp;→&nbsp; TARGET: {TEL_AVIV.lat.toFixed(2)}°N {TEL_AVIV.lon.toFixed(2)}°E
        </div>
      </div>

      {/* Corner brackets */}
      <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width={width} height={height}>
        {/* Top-left */}
        <path d={`M ${width*0.12} ${height*0.36} L ${width*0.12} ${height*0.34} L ${width*0.14} ${height*0.34}`}
          fill="none" stroke={COLORS.hudCyan} strokeWidth={2} opacity={lineOp * 0.5} />
        {/* Top-right */}
        <path d={`M ${width*0.88} ${height*0.36} L ${width*0.88} ${height*0.34} L ${width*0.86} ${height*0.34}`}
          fill="none" stroke={COLORS.hudCyan} strokeWidth={2} opacity={lineOp * 0.5} />
        {/* Bottom-left */}
        <path d={`M ${width*0.12} ${height*0.64} L ${width*0.12} ${height*0.66} L ${width*0.14} ${height*0.66}`}
          fill="none" stroke={COLORS.hudCyan} strokeWidth={2} opacity={lineOp * 0.5} />
        {/* Bottom-right */}
        <path d={`M ${width*0.88} ${height*0.64} L ${width*0.88} ${height*0.66} L ${width*0.86} ${height*0.66}`}
          fill="none" stroke={COLORS.hudCyan} strokeWidth={2} opacity={lineOp * 0.5} />
      </svg>
    </AbsoluteFill>
  );
};

// ── Scene 2: Map Reveal ──────────────────────────────────────────────────────
const SceneMapReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const mapOp = fadeIn(frame, 0, 40);
  const markerOp = fadeIn(frame, 50, 25);
  const labelScale = spring({ frame, fps, config: { stiffness: 80, damping: 12 }, delay: 55 });

  const [pakX, pakY] = lonLatToXY(ISLAMABAD.lon, ISLAMABAD.lat, width, height);
  const pulseR = 12 + 6 * Math.sin(frame * 0.12);

  return (
    <AbsoluteFill>
      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height} opacity={mapOp}>
        {/* Grid lines */}
        {[20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80].map((lon) => {
          const [x] = lonLatToXY(lon, 30, width, height);
          return <line key={`v${lon}`} x1={x} y1={0} x2={x} y2={height}
            stroke={COLORS.gridLine} strokeWidth={1} opacity={0.3} />;
        })}
        {[10, 15, 20, 25, 30, 35, 40, 45].map((lat) => {
          const [, y] = lonLatToXY(35, lat, width, height);
          return <line key={`h${lat}`} x1={0} y1={y} x2={width} y2={y}
            stroke={COLORS.gridLine} strokeWidth={1} opacity={0.3} />;
        })}

        {/* Country polygons */}
        {COUNTRIES.map((c) => {
          const pts = c.points.map(([lon, lat]) => lonLatToXY(lon, lat, width, height).join(',')).join(' ');
          return (
            <g key={c.name}>
              <polygon points={pts} fill={c.fill} stroke={c.stroke} strokeWidth={1.5} opacity={0.9} />
              {/* Country label */}
              {(() => {
                const cx = c.points.reduce((s, [lon, lat]) => s + lonLatToXY(lon, lat, width, height)[0], 0) / c.points.length;
                const cy = c.points.reduce((s, [lon, lat]) => s + lonLatToXY(lon, lat, width, height)[1], 0) / c.points.length;
                return (
                  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                    fill="rgba(255,255,255,0.35)" fontSize={Math.max(12, width * 0.01)}
                    fontFamily="sans-serif" fontWeight="600" letterSpacing={2}>
                    {c.name.toUpperCase()}
                  </text>
                );
              })()}
            </g>
          );
        })}

        {/* Origin marker: Islamabad */}
        <g opacity={markerOp}>
          <circle cx={pakX} cy={pakY} r={pulseR} fill="none" stroke={COLORS.originGreen} strokeWidth={2} opacity={0.4} />
          <circle cx={pakX} cy={pakY} r={pulseR * 0.6} fill="none" stroke={COLORS.originGreen} strokeWidth={1.5} opacity={0.6} />
          <circle cx={pakX} cy={pakY} r={8} fill={COLORS.originGreen} opacity={0.9} />
          <circle cx={pakX} cy={pakY} r={4} fill={COLORS.white} />
        </g>
      </svg>

      {/* Islamabad label */}
      <div style={{
        position: 'absolute',
        left: pakX + 20, top: pakY - 45,
        opacity: markerOp, transform: `scale(${labelScale})`, transformOrigin: 'left center',
      }}>
        <div style={{
          color: COLORS.originGreen, fontSize: width * 0.016, fontFamily: 'sans-serif',
          fontWeight: 800, letterSpacing: 3,
        }}>
          {ISLAMABAD.name}
        </div>
        <div style={{
          color: COLORS.muted, fontSize: width * 0.009, fontFamily: 'monospace', marginTop: 2,
        }}>
          {ISLAMABAD.country} — {ISLAMABAD.lat.toFixed(2)}°N {ISLAMABAD.lon.toFixed(2)}°E
        </div>
        <div style={{
          color: COLORS.trailOrange, fontSize: width * 0.01, fontFamily: 'monospace', marginTop: 4,
          letterSpacing: 2,
        }}>
          ▶ F-16 LAUNCH SITE
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: Flight Animation ────────────────────────────────────────────────
const SceneFlight: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const duration = S3_END - S3_START;

  // Flight progress with easing
  const rawT = interpolate(frame, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  // Ease-in-out for more realistic flight
  const flightT = rawT < 0.1
    ? interpolate(rawT, [0, 0.1], [0, 0.1], { extrapolateRight: 'clamp' }) // takeoff acceleration
    : rawT > 0.9
      ? interpolate(rawT, [0.9, 1], [0.9, 1], { extrapolateRight: 'clamp' }) // approach deceleration
      : rawT;

  const [planeLon, planeLat] = interpolatePath(flightT);
  const [planeX, planeY] = lonLatToXY(planeLon, planeLat, width, height);
  const heading = getHeading(flightT, width, height);

  const [pakX, pakY] = lonLatToXY(ISLAMABAD.lon, ISLAMABAD.lat, width, height);
  const [tlvX, tlvY] = lonLatToXY(TEL_AVIV.lon, TEL_AVIV.lat, width, height);

  const planeScale = spring({ frame, fps, config: { stiffness: 100, damping: 12 }, delay: 0 });

  // Trail points
  const trailSteps = 100;
  const trailPts: string[] = [];
  for (let i = 0; i <= trailSteps; i++) {
    const t = (i / trailSteps) * flightT;
    const [lon, lat] = interpolatePath(t);
    const [x, y] = lonLatToXY(lon, lat, width, height);
    trailPts.push(`${x},${y}`);
  }

  // Destination marker fades in as plane approaches
  const destOp = fadeIn(frame, duration * 0.6, 40);
  const destPulse = 1 + 0.3 * Math.sin(frame * 0.15);

  // Speed calculation (visual)
  const speedKnots = Math.round(interpolate(flightT, [0, 0.05, 0.15, 0.85, 0.95, 1], [0, 200, 520, 520, 300, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  }));
  const altitudeFt = Math.round(interpolate(flightT, [0, 0.08, 0.2, 0.8, 0.92, 1], [0, 15000, 35000, 35000, 18000, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  }));
  const distanceCovered = Math.round(flightT * FLIGHT_DISTANCE_KM);
  const distanceRemaining = FLIGHT_DISTANCE_KM - distanceCovered;

  const afterburnerIntensity = interpolate(flightT, [0, 0.05, 0.15, 0.85, 0.95, 1], [0, 1, 0.7, 0.7, 0.3, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
        {/* Grid */}
        {[20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80].map((lon) => {
          const [x] = lonLatToXY(lon, 30, width, height);
          return <line key={`v${lon}`} x1={x} y1={0} x2={x} y2={height}
            stroke={COLORS.gridLine} strokeWidth={1} opacity={0.25} />;
        })}
        {[10, 15, 20, 25, 30, 35, 40, 45].map((lat) => {
          const [, y] = lonLatToXY(35, lat, width, height);
          return <line key={`h${lat}`} x1={0} y1={y} x2={width} y2={y}
            stroke={COLORS.gridLine} strokeWidth={1} opacity={0.25} />;
        })}

        {/* Country polygons */}
        {COUNTRIES.map((c) => {
          const pts = c.points.map(([lon, lat]) => lonLatToXY(lon, lat, width, height).join(',')).join(' ');
          return (
            <g key={c.name}>
              <polygon points={pts} fill={c.fill} stroke={c.stroke} strokeWidth={1.5} opacity={0.85} />
              {(() => {
                const cx = c.points.reduce((s, [lon, lat]) => s + lonLatToXY(lon, lat, width, height)[0], 0) / c.points.length;
                const cy = c.points.reduce((s, [lon, lat]) => s + lonLatToXY(lon, lat, width, height)[1], 0) / c.points.length;
                return (
                  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                    fill="rgba(255,255,255,0.3)" fontSize={Math.max(12, width * 0.009)}
                    fontFamily="sans-serif" fontWeight="600" letterSpacing={1.5}>
                    {c.name.toUpperCase()}
                  </text>
                );
              })()}
            </g>
          );
        })}

        {/* Ghost flight path (dashed) */}
        <polyline
          points={WAYPOINTS.map(([lon, lat]) => lonLatToXY(lon, lat, width, height).join(',')).join(' ')}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={2} strokeDasharray="10 8"
        />

        {/* Animated trail glow */}
        <defs>
          <linearGradient id="flightTrail" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLORS.trailOrange} stopOpacity={0} />
            <stop offset="50%" stopColor={COLORS.trailOrange} stopOpacity={0.3} />
            <stop offset="80%" stopColor={COLORS.trailYellow} stopOpacity={0.6} />
            <stop offset="100%" stopColor={COLORS.white} stopOpacity={0.9} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Trail */}
        {flightT > 0 && (
          <>
            <polyline points={trailPts.join(' ')} fill="none"
              stroke={COLORS.trailOrange} strokeWidth={4} strokeLinecap="round" opacity={0.15}
              filter="url(#glow)" />
            <polyline points={trailPts.join(' ')} fill="none"
              stroke="url(#flightTrail)" strokeWidth={3} strokeLinecap="round" />
          </>
        )}

        {/* Origin marker */}
        <g>
          <circle cx={pakX} cy={pakY} r={8} fill={COLORS.originGreen} opacity={0.7} />
          <circle cx={pakX} cy={pakY} r={4} fill={COLORS.white} />
        </g>

        {/* Destination marker */}
        <g opacity={destOp}>
          <circle cx={tlvX} cy={tlvY} r={16 * destPulse} fill="none"
            stroke={COLORS.targetRed} strokeWidth={2} opacity={0.3} />
          <circle cx={tlvX} cy={tlvY} r={10 * destPulse} fill="none"
            stroke={COLORS.targetRed} strokeWidth={1.5} opacity={0.5} />
          <circle cx={tlvX} cy={tlvY} r={8} fill={COLORS.targetRed} opacity={0.8} />
          <circle cx={tlvX} cy={tlvY} r={4} fill={COLORS.white} />
        </g>

        {/* Afterburner flames */}
        {flightT > 0.01 && flightT < 0.99 && (
          <Afterburner x={planeX} y={planeY} heading={heading} frame={frame}
            intensity={afterburnerIntensity} size={width * 0.035} />
        )}

        {/* Exhaust glow */}
        {flightT > 0.01 && flightT < 0.99 && (
          <>
            <circle cx={planeX} cy={planeY} r={30} fill={COLORS.trailOrange} opacity={0.06 * afterburnerIntensity} />
            <circle cx={planeX} cy={planeY} r={16} fill={COLORS.trailYellow} opacity={0.1 * afterburnerIntensity} />
          </>
        )}
      </svg>

      {/* F-16 Jet */}
      {flightT > 0.005 && flightT < 0.995 && (
        <div style={{
          position: 'absolute', left: planeX, top: planeY,
          transform: `translate(-50%, -50%) rotate(${heading}deg) scale(${planeScale})`,
          filter: `drop-shadow(0 0 12px ${COLORS.trailOrange}) drop-shadow(0 0 24px ${COLORS.targetOrange}88)`,
        }}>
          <F16Jet size={Math.round(width * 0.05)} color="#e0e0e0" />
        </div>
      )}

      {/* Destination label */}
      <div style={{
        position: 'absolute', left: tlvX - 120, top: tlvY - 55,
        opacity: destOp, textAlign: 'right',
      }}>
        <div style={{
          color: COLORS.targetRed, fontSize: width * 0.016, fontFamily: 'sans-serif',
          fontWeight: 800, letterSpacing: 3,
        }}>
          {TEL_AVIV.name}
        </div>
        <div style={{
          color: COLORS.muted, fontSize: width * 0.009, fontFamily: 'monospace', marginTop: 2,
        }}>
          {TEL_AVIV.country} — {TEL_AVIV.lat.toFixed(2)}°N {TEL_AVIV.lon.toFixed(2)}°E
        </div>
      </div>

      {/* Origin label (small) */}
      <div style={{
        position: 'absolute', left: pakX + 15, top: pakY - 30, opacity: 0.7,
      }}>
        <div style={{
          color: COLORS.originGreen, fontSize: width * 0.011, fontFamily: 'sans-serif',
          fontWeight: 700, letterSpacing: 2,
        }}>
          {ISLAMABAD.name}
        </div>
      </div>

      {/* ── HUD Overlay ──────────────────────────────────────────────────── */}
      {/* Top-left: Flight data */}
      <div style={{
        position: 'absolute', top: height * 0.04, left: width * 0.025,
        color: COLORS.hudCyan, fontSize: width * 0.012, fontFamily: 'monospace',
        opacity: 0.9, lineHeight: 1.8,
      }}>
        <div style={{ color: COLORS.white, fontWeight: 700, fontSize: width * 0.013, marginBottom: 6, letterSpacing: 3 }}>
          ◈ F-16C FIGHTING FALCON
        </div>
        <div>▸ SPD: {speedKnots} KTS</div>
        <div>▸ ALT: {altitudeFt.toLocaleString()} FT</div>
        <div>▸ HDG: {((Math.round(heading) + 360) % 360).toString().padStart(3, '0')}°</div>
        <div>▸ POS: {planeLat.toFixed(2)}°N {planeLon.toFixed(2)}°E</div>
      </div>

      {/* Top-right: Mission data */}
      <div style={{
        position: 'absolute', top: height * 0.04, right: width * 0.025,
        color: COLORS.hudCyan, fontSize: width * 0.012, fontFamily: 'monospace',
        opacity: 0.9, lineHeight: 1.8, textAlign: 'right',
      }}>
        <div style={{ color: COLORS.gold, fontWeight: 700, fontSize: width * 0.013, marginBottom: 6, letterSpacing: 3 }}>
          MISSION STATUS ◈
        </div>
        <div>DIST COVERED: {distanceCovered.toLocaleString()} KM</div>
        <div>REMAINING: {distanceRemaining.toLocaleString()} KM</div>
        <div>PROGRESS: {Math.round(flightT * 100)}%</div>
        <div style={{ color: flightT > 0.95 ? COLORS.originGreen : COLORS.trailOrange }}>
          STATUS: {flightT > 0.95 ? 'APPROACHING TARGET' : flightT > 0.05 ? 'EN ROUTE' : 'LAUNCHING'}
        </div>
      </div>

      {/* Bottom-center: Progress bar */}
      <div style={{
        position: 'absolute', bottom: height * 0.05, left: '50%',
        transform: 'translateX(-50%)', width: width * 0.5, textAlign: 'center',
      }}>
        <div style={{
          width: '100%', height: 4, background: 'rgba(255,255,255,0.1)',
          borderRadius: 2, overflow: 'hidden',
        }}>
          <div style={{
            width: `${flightT * 100}%`, height: '100%',
            background: `linear-gradient(90deg, ${COLORS.originGreen}, ${COLORS.hudCyan}, ${COLORS.trailOrange})`,
            borderRadius: 2, transition: 'none',
          }} />
        </div>
        <div style={{
          color: COLORS.muted, fontSize: width * 0.009, fontFamily: 'monospace',
          marginTop: 6, letterSpacing: 3,
        }}>
          ISLAMABAD ——— {Math.round(flightT * 100)}% ——— TEL AVIV
        </div>
      </div>

      {/* Bottom-left: Radar */}
      <svg style={{ position: 'absolute', bottom: height * 0.12, left: width * 0.03, pointerEvents: 'none' }}
        width={120} height={120}>
        <RadarSweep cx={60} cy={60} radius={55} frame={frame} />
        {/* Plane blip on radar */}
        <circle cx={60 + (flightT - 0.5) * 80} cy={60} r={3} fill={COLORS.originGreen} opacity={0.9} />
      </svg>
    </AbsoluteFill>
  );
};

// ── Scene 4: Arrival ─────────────────────────────────────────────────────────
const SceneArrival: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const flashOp = interpolate(frame, [0, 8, 25], [0, 0.3, 0], {
    extrapolateRight: 'clamp',
  });

  const titleOp = fadeIn(frame, 20, 30);
  const titleScale = spring({ frame, fps, config: { stiffness: 70, damping: 12 }, delay: 20 });

  const subtitleOp = fadeIn(frame, 45, 25);
  const checkOp = fadeIn(frame, 60, 20);
  const overallFade = fadeOut(frame, S4_END - S4_START, 30);

  const [tlvX, tlvY] = lonLatToXY(TEL_AVIV.lon, TEL_AVIV.lat, width, height);

  // Expanding rings at destination
  const ring1 = (frame * 1.5) % 60;
  const ring2 = ((frame * 1.5) + 20) % 60;
  const ring3 = ((frame * 1.5) + 40) % 60;

  return (
    <AbsoluteFill>
      {/* White flash */}
      <div style={{
        position: 'absolute', inset: 0, background: 'white',
        opacity: flashOp, pointerEvents: 'none',
      }} />

      {/* Map background (static) */}
      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height} opacity={0.4 * overallFade}>
        {COUNTRIES.map((c) => {
          const pts = c.points.map(([lon, lat]) => lonLatToXY(lon, lat, width, height).join(',')).join(' ');
          return <polygon key={c.name} points={pts} fill={c.fill} stroke={c.stroke} strokeWidth={1} opacity={0.6} />;
        })}

        {/* Expanding rings at Tel Aviv */}
        {[ring1, ring2, ring3].map((r, i) => (
          <circle key={i} cx={tlvX} cy={tlvY} r={r * 3}
            fill="none" stroke={COLORS.targetRed} strokeWidth={2}
            opacity={Math.max(0, 1 - r / 60) * 0.5} />
        ))}
        <circle cx={tlvX} cy={tlvY} r={10} fill={COLORS.targetRed} opacity={0.9} />
      </svg>

      {/* MISSION COMPLETE text */}
      <div style={{
        position: 'absolute', top: height * 0.35, width: '100%',
        textAlign: 'center', opacity: titleOp * overallFade,
        transform: `scale(${titleScale})`,
      }}>
        <div style={{
          color: COLORS.originGreen, fontSize: width * 0.05, fontFamily: 'sans-serif',
          fontWeight: 900, letterSpacing: 10,
          textShadow: `0 0 40px ${COLORS.originGreen}66, 0 0 80px ${COLORS.originGreen}33`,
        }}>
          MISSION COMPLETE
        </div>
      </div>

      <div style={{
        position: 'absolute', top: height * 0.47, width: '100%',
        textAlign: 'center', opacity: subtitleOp * overallFade,
      }}>
        <div style={{
          color: COLORS.hudCyan, fontSize: width * 0.018, fontFamily: 'monospace',
          letterSpacing: 6,
        }}>
          F-16 HAS REACHED TEL AVIV, ISRAEL
        </div>
      </div>

      <div style={{
        position: 'absolute', top: height * 0.54, width: '100%',
        textAlign: 'center', opacity: checkOp * overallFade,
      }}>
        <div style={{
          color: COLORS.gold, fontSize: width * 0.022, fontFamily: 'sans-serif',
          fontWeight: 700,
        }}>
          ✦ TARGET REACHED ✦
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 5: Stats Summary ───────────────────────────────────────────────────
const SceneStats: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const stats = [
    { label: 'DISTANCE', value: '3,200 KM', delay: 10 },
    { label: 'ROUTE', value: 'PAK → IRN → IRQ → ISR', delay: 20 },
    { label: 'AIRCRAFT', value: 'F-16C FIGHTING FALCON', delay: 30 },
    { label: 'ORIGIN', value: 'ISLAMABAD, PAKISTAN', delay: 40 },
    { label: 'DESTINATION', value: 'TEL AVIV, ISRAEL', delay: 50 },
  ];

  const overallFade = fadeOut(frame, S5_END - S5_START, 30);

  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ opacity: overallFade }}>
        <div style={{
          color: COLORS.white, fontSize: width * 0.028, fontFamily: 'sans-serif',
          fontWeight: 900, letterSpacing: 6, textAlign: 'center', marginBottom: height * 0.04,
          textShadow: `0 0 30px ${COLORS.hudCyan}44`,
        }}>
          SORTIE SUMMARY
        </div>

        {stats.map((s, i) => {
          const op = fadeIn(frame, s.delay, 20);
          const scale = spring({ frame, fps, config: { stiffness: 90, damping: 13 }, delay: s.delay });
          return (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              width: width * 0.4, margin: '0 auto',
              padding: `${height * 0.012}px 0`,
              borderBottom: `1px solid rgba(255,255,255,0.08)`,
              opacity: op, transform: `scale(${scale})`, transformOrigin: 'left center',
            }}>
              <span style={{
                color: COLORS.muted, fontSize: width * 0.013, fontFamily: 'monospace',
                letterSpacing: 3,
              }}>
                {s.label}
              </span>
              <span style={{
                color: COLORS.hudCyan, fontSize: width * 0.014, fontFamily: 'monospace',
                fontWeight: 600,
              }}>
                {s.value}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Starfield Background ─────────────────────────────────────────────────────
const Starfield: React.FC = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const stars = Array.from({ length: 200 }, (_, i) => ({
    x: ((i * 137.508 + 23) % 100) / 100 * width,
    y: ((i * 97.31 + 11) % 100) / 100 * height,
    r: 0.4 + (i % 4) * 0.35,
    phase: (i * 43) % 628,
  }));

  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width={width} height={height}>
      {stars.map((s, i) => {
        const twinkle = 0.2 + 0.6 * Math.abs(Math.sin(frame * 0.02 + s.phase));
        return <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={twinkle} />;
      })}
    </svg>
  );
};

// ── Letterbox Bars ───────────────────────────────────────────────────────────
const Letterbox: React.FC = () => {
  const { width, height } = useVideoConfig();
  const barH = height * 0.04;
  return (
    <>
      <div style={{
        position: 'absolute', top: 0, left: 0, width, height: barH,
        background: 'linear-gradient(180deg, #000000 60%, transparent)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width, height: barH,
        background: 'linear-gradient(0deg, #000000 60%, transparent)', pointerEvents: 'none',
      }} />
    </>
  );
};

// ── Vignette ─────────────────────────────────────────────────────────────────
const Vignette: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
  }} />
);

// ── Main Composition ─────────────────────────────────────────────────────────
export const F16IslamabadToTelAviv: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Persistent layers */}
      <Starfield />

      {/* Scene 1: Mission Briefing */}
      <Sequence from={S1_START} durationInFrames={S1_END - S1_START}>
        <SceneMissionBriefing />
      </Sequence>

      {/* Scene 2: Map Reveal + Origin Marker */}
      <Sequence from={S2_START} durationInFrames={S2_END - S2_START}>
        <SceneMapReveal />
      </Sequence>

      {/* Scene 3: Flight Animation */}
      <Sequence from={S3_START} durationInFrames={S3_END - S3_START}>
        <SceneFlight />
      </Sequence>

      {/* Scene 4: Arrival */}
      <Sequence from={S4_START} durationInFrames={S4_END - S4_START}>
        <SceneArrival />
      </Sequence>

      {/* Scene 5: Stats Summary */}
      <Sequence from={S5_START} durationInFrames={S5_END - S5_START}>
        <SceneStats />
      </Sequence>

      {/* Persistent overlays */}
      <Vignette />
      <Letterbox />
    </AbsoluteFill>
  );
};
