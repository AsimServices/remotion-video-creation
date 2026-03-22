import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  AbsoluteFill,
  Sequence,
} from 'remotion';
import { F16Jet } from './F16Jet';

// ─────────────────────────────────────────────────────────────────────────────
// Map viewport: we show roughly 20°E–80°E, 10°N–50°N
// This covers Pakistan and Israel nicely in a widescreen frame.
// ─────────────────────────────────────────────────────────────────────────────
const MAP_LON_MIN = 18;
const MAP_LON_MAX = 82;
const MAP_LAT_MIN = 8;
const MAP_LAT_MAX = 52;

function lonLatToXY(
  lon: number,
  lat: number,
  width: number,
  height: number
): [number, number] {
  const x = ((lon - MAP_LON_MIN) / (MAP_LON_MAX - MAP_LON_MIN)) * width;
  // Lat increases upward on Earth, downward in screen coords
  const y = ((MAP_LAT_MAX - lat) / (MAP_LAT_MAX - MAP_LAT_MIN)) * height;
  return [x, y];
}

// ─── Key geographic locations ─────────────────────────────────────────────────
const PAKISTAN_LON = 69.3;
const PAKISTAN_LAT = 30.3; // Karachi area / central Pakistan

const ISRAEL_LON = 34.8;
const ISRAEL_LAT = 31.5; // Tel Aviv / Jerusalem

// ─── Intermediate waypoints for a realistic flight arc ────────────────────────
// Pakistan → Iran → Iraq → Jordan → Israel (rough great-circle path)
const WAYPOINTS: [number, number][] = [
  [PAKISTAN_LON, PAKISTAN_LAT],
  [62, 32], // Iran
  [49, 33], // Iraq / Persian Gulf
  [42, 32], // Eastern Jordan
  [ISRAEL_LON, ISRAEL_LAT],
];

/** Linear interpolation along the multi-segment waypoint path (t: 0–1) */
function interpolatePath(t: number): [number, number] {
  const segments = WAYPOINTS.length - 1;
  const scaledT = t * segments;
  const segIdx = Math.min(Math.floor(scaledT), segments - 1);
  const segT = scaledT - segIdx;
  const [lon0, lat0] = WAYPOINTS[segIdx];
  const [lon1, lat1] = WAYPOINTS[segIdx + 1];
  return [lon0 + (lon1 - lon0) * segT, lat0 + (lat1 - lat0) * segT];
}

/** Returns heading angle in degrees (screen coords: right = 0°, clockwise) */
function getHeading(t: number, width: number, height: number): number {
  const delta = 0.005;
  const [x0, y0] = lonLatToXY(...interpolatePath(Math.max(0, t - delta)), width, height);
  const [x1, y1] = lonLatToXY(...interpolatePath(Math.min(1, t + delta)), width, height);
  return Math.atan2(y1 - y0, x1 - x0) * (180 / Math.PI);
}

// ─── Country outlines (simplified polygons in [lon, lat] pairs) ───────────────
const COUNTRIES: {
  name: string;
  fill: string;
  stroke: string;
  points: [number, number][];
}[] = [
  {
    name: 'Pakistan',
    fill: '#1a5276',
    stroke: '#2e86c1',
    points: [
      [61.5, 35.5], [71, 36.5], [74.5, 37], [77, 35.5], [74, 32],
      [73.5, 28], [71, 24.5], [68.5, 23.5], [63, 25], [60.5, 29],
      [60.8, 33], [61.5, 35.5],
    ],
  },
  {
    name: 'Iran',
    fill: '#117a65',
    stroke: '#1abc9c',
    points: [
      [44.5, 39.5], [48, 40], [50, 39], [53.5, 37.5], [55, 36.5],
      [58, 37], [60.5, 36.5], [61.5, 35.5], [60.8, 33], [60.5, 29],
      [57, 25.5], [55, 24.5], [52.5, 26.5], [50, 28], [48, 30.5],
      [44.5, 33], [44.5, 36], [44.5, 39.5],
    ],
  },
  {
    name: 'Iraq',
    fill: '#784212',
    stroke: '#e67e22',
    points: [
      [38.5, 33.5], [40, 36.5], [43, 37.5], [44.5, 38], [46, 36.5],
      [48, 34.5], [48.5, 31], [47, 29.5], [44, 29.5], [42, 31.5],
      [40, 32], [38.5, 33.5],
    ],
  },
  {
    name: 'Saudi Arabia',
    fill: '#6e2f1a',
    stroke: '#cb4335',
    points: [
      [36.5, 29.5], [38.5, 33.5], [40, 32], [42, 31.5], [44, 29.5],
      [47, 29.5], [55, 24], [57, 22], [55, 20], [50, 19],
      [44, 18.5], [40, 20], [37, 22], [36, 26], [36.5, 29.5],
    ],
  },
  {
    name: 'Jordan',
    fill: '#5d4037',
    stroke: '#8d6e63',
    points: [
      [34.8, 29.5], [36.5, 29.5], [38.5, 33.5], [36.5, 33],
      [35.5, 32.5], [34.8, 31], [34.8, 29.5],
    ],
  },
  {
    name: 'Syria',
    fill: '#4a235a',
    stroke: '#9b59b6',
    points: [
      [35.5, 32.5], [36.5, 33], [38.5, 33.5], [40, 32], [42, 31.5],
      [41, 36.5], [38.5, 37], [36.5, 36.5], [35.5, 35.5], [35.5, 32.5],
    ],
  },
  {
    name: 'Turkey',
    fill: '#1b4f72',
    stroke: '#2980b9',
    points: [
      [26, 41], [30, 43], [36, 42], [40, 42.5], [44.5, 39.5],
      [44.5, 36], [41, 36.5], [38.5, 37], [36.5, 36.5], [35.5, 35.5],
      [35.5, 36.5], [32, 36.5], [26, 36.5], [26, 41],
    ],
  },
  {
    name: 'Afghanistan',
    fill: '#1d4e1d',
    stroke: '#27ae60',
    points: [
      [61.5, 35.5], [63, 37], [66, 38], [69.5, 38], [71, 38.5],
      [74.5, 37], [71, 36.5], [61.5, 35.5],
    ],
  },
  {
    name: 'Israel',
    fill: '#1565c0',
    stroke: '#42a5f5',
    points: [
      [34.2, 31.5], [35.2, 33], [35.8, 33], [35.5, 31.5],
      [35, 29.5], [34.2, 29.5], [34.2, 31.5],
    ],
  },
];

// ─── Main Component ────────────────────────────────────────────────────────────
export const MapAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames, fps } = useVideoConfig();

  // Phase timing
  const INTRO_FRAMES = fps * 1;       // 1s: map fades in
  const FLY_START = fps * 1.5;        // flight starts
  const FLY_END = durationInFrames - fps * 1; // flight ends 1s before video ends
  const FLY_FRAMES = FLY_END - FLY_START;

  // Map fade-in
  const mapOpacity = interpolate(frame, [0, INTRO_FRAMES], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Flight progress (0 → 1)
  const flightT = interpolate(frame, [FLY_START, FLY_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Current plane position
  const [planeLon, planeLat] = interpolatePath(flightT);
  const [planeX, planeY] = lonLatToXY(planeLon, planeLat, width, height);
  const heading = getHeading(flightT, width, height);

  // Label fade-ins
  const pakistanLabelOpacity = interpolate(frame, [INTRO_FRAMES, INTRO_FRAMES + 20], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const israelLabelOpacity = interpolate(frame, [FLY_END - 30, FLY_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Build trail: list of past plane positions
  const trailPoints: [number, number][] = [];
  const trailSteps = 80;
  for (let i = 0; i <= trailSteps; i++) {
    const t = (i / trailSteps) * flightT;
    const [lon, lat] = interpolatePath(t);
    const [x, y] = lonLatToXY(lon, lat, width, height);
    trailPoints.push([x, y]);
  }
  const trailPolyline = trailPoints.map((p) => p.join(',')).join(' ');

  // Destination marker pulse
  const [israelX, israelY] = lonLatToXY(ISRAEL_LON, ISRAEL_LAT, width, height);
  const [pakX, pakY] = lonLatToXY(PAKISTAN_LON, PAKISTAN_LAT, width, height);

  const pulseScale = 1 + 0.4 * Math.sin((frame / fps) * Math.PI * 2);

  // Plane scale: starts small, grows to full size
  const planeScale = interpolate(frame, [FLY_START, FLY_START + 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0e1a' }}>
      {/* ── Starfield background ─────────────────────────────────────────── */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {Array.from({ length: 120 }).map((_, i) => {
          const sx = ((i * 137.5) % 1) * width;
          const sy = ((i * 97.3) % 1) * height;
          const r = 0.5 + (i % 3) * 0.4;
          const op = 0.3 + (i % 5) * 0.1;
          return <circle key={i} cx={sx} cy={sy} r={r} fill="white" opacity={op} />;
        })}
      </svg>

      {/* ── Map SVG ──────────────────────────────────────────────────────── */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, opacity: mapOpacity }}
      >
        {/* Grid lines */}
        {[20, 30, 40, 50, 60, 70, 80].map((lon) => {
          const [x] = lonLatToXY(lon, 30, width, height);
          return (
            <line
              key={`lon-${lon}`}
              x1={x} y1={0} x2={x} y2={height}
              stroke="#1c2e4a" strokeWidth={1} opacity={0.5}
            />
          );
        })}
        {[10, 20, 30, 40, 50].map((lat) => {
          const [, y] = lonLatToXY(35, lat, width, height);
          return (
            <line
              key={`lat-${lat}`}
              x1={0} y1={y} x2={width} y2={y}
              stroke="#1c2e4a" strokeWidth={1} opacity={0.5}
            />
          );
        })}

        {/* Country polygons */}
        {COUNTRIES.map((c) => {
          const pts = c.points
            .map(([lon, lat]) => lonLatToXY(lon, lat, width, height).join(','))
            .join(' ');
          return (
            <g key={c.name}>
              <polygon
                points={pts}
                fill={c.fill}
                stroke={c.stroke}
                strokeWidth={1.5}
                opacity={0.85}
              />
            </g>
          );
        })}

        {/* Country name labels */}
        {COUNTRIES.map((c) => {
          // compute centroid from all polygon points
          const cx =
            c.points.reduce((s, [lon, lat]) => s + lonLatToXY(lon, lat, width, height)[0], 0) /
            c.points.length;
          const cy =
            c.points.reduce((s, [lon, lat]) => s + lonLatToXY(lon, lat, width, height)[1], 0) /
            c.points.length;
          return (
            <text
              key={`label-${c.name}`}
              x={cx} y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize={Math.max(10, width * 0.009)}
              fontFamily="sans-serif"
              fontWeight="600"
              letterSpacing={1}
            >
              {c.name.toUpperCase()}
            </text>
          );
        })}

        {/* ── Origin marker: Pakistan ──────────────────────────────────── */}
        <g opacity={pakistanLabelOpacity}>
          <circle cx={pakX} cy={pakY} r={8} fill="#27ae60" opacity={0.9} />
          <circle cx={pakX} cy={pakY} r={4} fill="white" />
          <text
            x={pakX + 14} y={pakY - 10}
            fill="#2ecc71"
            fontSize={width * 0.014}
            fontFamily="sans-serif"
            fontWeight="bold"
          >
            PAKISTAN
          </text>
          <text
            x={pakX + 14} y={pakY + 10}
            fill="rgba(255,255,255,0.6)"
            fontSize={width * 0.01}
            fontFamily="sans-serif"
          >
            F-16 Launch Site
          </text>
        </g>

        {/* ── Destination marker: Israel ───────────────────────────────── */}
        <g opacity={israelLabelOpacity}>
          <circle
            cx={israelX} cy={israelY}
            r={12 * pulseScale}
            fill="none"
            stroke="#e74c3c"
            strokeWidth={2}
            opacity={0.5}
          />
          <circle cx={israelX} cy={israelY} r={8} fill="#e74c3c" opacity={0.9} />
          <circle cx={israelX} cy={israelY} r={4} fill="white" />
          <text
            x={israelX - 14} y={israelY - 14}
            textAnchor="end"
            fill="#e74c3c"
            fontSize={width * 0.014}
            fontFamily="sans-serif"
            fontWeight="bold"
          >
            ISRAEL
          </text>
        </g>

        {/* ── Flight path ghost line ───────────────────────────────────── */}
        {(() => {
          const ghostPts = WAYPOINTS.map(([lon, lat]) =>
            lonLatToXY(lon, lat, width, height).join(',')
          ).join(' ');
          return (
            <polyline
              points={ghostPts}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={2}
              strokeDasharray="8 8"
            />
          );
        })()}

        {/* ── Animated trail ──────────────────────────────────────────── */}
        {flightT > 0 && (
          <polyline
            points={trailPolyline}
            fill="none"
            stroke="url(#trailGrad)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Gradient definition for trail */}
        <defs>
          <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff6600" stopOpacity={0} />
            <stop offset="60%" stopColor="#ff9900" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.9} />
          </linearGradient>
        </defs>

        {/* ── Exhaust/flame glow at plane tail ────────────────────────── */}
        {flightT > 0 && flightT < 1 && (
          <>
            <circle cx={planeX} cy={planeY} r={20} fill="#ff4400" opacity={0.08} />
            <circle cx={planeX} cy={planeY} r={10} fill="#ff8800" opacity={0.15} />
          </>
        )}
      </svg>

      {/* ── F-16 Jet (HTML div, rotated) ─────────────────────────────────── */}
      {flightT > 0 && flightT < 1 && (
        <div
          style={{
            position: 'absolute',
            left: planeX,
            top: planeY,
            transform: `translate(-50%, -50%) rotate(${heading}deg) scale(${planeScale})`,
            filter: 'drop-shadow(0 0 8px #ff8800) drop-shadow(0 0 16px #ff4400)',
          }}
        >
          <F16Jet size={Math.round(width * 0.045)} color="#e8e8e8" />
        </div>
      )}

      {/* ── Title overlay ──────────────────────────────────────────────────── */}
      <Sequence from={0} durationInFrames={60}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingBottom: height * 0.05,
          }}
        >
          <div
            style={{
              color: 'white',
              fontSize: width * 0.025,
              fontFamily: 'sans-serif',
              fontWeight: 800,
              letterSpacing: 4,
              textTransform: 'uppercase',
              opacity: interpolate(frame, [0, 20, 50, 60], [0, 1, 1, 0], {
                extrapolateRight: 'clamp',
              }),
              textShadow: '0 0 20px rgba(255,150,0,0.8)',
            }}
          >
            F-16 MISSION
          </div>
          <div
            style={{
              color: '#aaa',
              fontSize: width * 0.012,
              fontFamily: 'sans-serif',
              letterSpacing: 6,
              marginTop: 8,
              opacity: interpolate(frame, [0, 20, 50, 60], [0, 1, 1, 0], {
                extrapolateRight: 'clamp',
              }),
            }}
          >
            PAKISTAN → ISRAEL
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ── HUD status text ────────────────────────────────────────────────── */}
      {flightT > 0 && (
        <div
          style={{
            position: 'absolute',
            top: height * 0.04,
            left: width * 0.03,
            color: '#4fc3f7',
            fontSize: width * 0.011,
            fontFamily: 'monospace',
            opacity: 0.85,
          }}
        >
          <div>◈ TRACKING: F-16 FIGHTER JET</div>
          <div style={{ marginTop: 6 }}>
            ▶ PROGRESS: {Math.round(flightT * 100)}%
          </div>
          <div style={{ marginTop: 6 }}>
            ✈ HDG: {Math.round(heading + 360) % 360}°
          </div>
          <div style={{ marginTop: 6 }}>
            ⬡ LON: {planeLon.toFixed(1)}° | LAT: {planeLat.toFixed(1)}°
          </div>
        </div>
      )}

      {/* ── Vignette overlay ───────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
