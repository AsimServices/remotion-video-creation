import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';

// ── Palette ────────────────────────────────────────────────────────────────────
const C = {
  bg: '#020B18',
  bgMid: '#061728',
  linkedin: '#0A66C2',
  linkedinGlow: '#1E88E5',
  purple: '#7C3AED',
  purpleGlow: '#A78BFA',
  green: '#10B981',
  greenGlow: '#34D399',
  gold: '#F59E0B',
  goldGlow: '#FCD34D',
  orange: '#F97316',
  white: '#F8FAFC',
  muted: '#64748B',
  light: '#94A3B8',
};

// ── Scene timing @ 30fps ────────────────────────────────────────────────────────
// Scene 1: Hook           0  → 120  (4s)
// Scene 2: Problem        120 → 255 (4.5s)
// Scene 3: System         255 → 405 (5s)
// Scene 4: Pipeline       405 → 555 (5s)
// Scene 5: ROI            555 → 675 (4s)
// Scene 6: CTA            675 → 780 (3.5s)
export const TOTAL_FRAMES = 780;

// ── Helpers ────────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const fadeIn = (frame: number, start: number, duration = 30) =>
  clamp(interpolate(frame, [start, start + duration], [0, 1]), 0, 1);
const fadeOut = (frame: number, end: number, duration = 20) =>
  clamp(interpolate(frame, [end - duration, end], [1, 0]), 0, 1);
const slideUp = (frame: number, start: number, fps: number, dist = 80) =>
  interpolate(
    spring({ frame, fps, from: dist, to: 0, config: { stiffness: 90, damping: 14 }, delay: start }),
    [0, dist],
    [dist, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

// ── Animated grid background ───────────────────────────────────────────────────
const GridBg: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const { width, height } = useVideoConfig();
  const cols = 20, rows = 11;
  return (
    <svg
      style={{ position: 'absolute', inset: 0 }}
      width={width}
      height={height}
    >
      <defs>
        <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.linkedin} stopOpacity={opacity * 1.5} />
          <stop offset="50%" stopColor={C.linkedin} stopOpacity={opacity} />
          <stop offset="100%" stopColor={C.linkedin} stopOpacity={opacity * 0.3} />
        </linearGradient>
      </defs>
      {Array.from({ length: cols + 1 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={(i / cols) * width} y1={0}
          x2={(i / cols) * width} y2={height}
          stroke="url(#gridFade)" strokeWidth={1}
        />
      ))}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={0} y1={(i / rows) * height}
          x2={width} y2={(i / rows) * height}
          stroke={C.linkedin} strokeWidth={1} opacity={opacity}
        />
      ))}
    </svg>
  );
};

// ── Floating particles ─────────────────────────────────────────────────────────
const PTCLS = Array.from({ length: 50 }, (_, i) => ({
  x: ((i * 97 + 23) % 100) / 100,
  y: ((i * 61 + 11) % 100) / 100,
  r: 1.5 + (i % 5) * 0.8,
  sp: 0.25 + (i % 7) * 0.12,
  ph: (i * 43) % 628,
  color: i % 4 === 0 ? C.linkedin : i % 4 === 1 ? C.purple : i % 4 === 2 ? C.green : C.gold,
}));

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const globalOp = fadeIn(frame, 0, 60);
  return (
    <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
      {PTCLS.map((p, i) => {
        const x = ((p.x * width + Math.sin(frame * p.sp * 0.018 + p.ph) * 80) % width + width) % width;
        const y = ((p.y * height - frame * p.sp * 0.35) % height + height) % height;
        const pulse = 0.3 + 0.5 * Math.abs(Math.sin(frame * 0.025 + p.ph));
        return (
          <circle key={i} cx={x} cy={y} r={p.r} fill={p.color} opacity={globalOp * pulse} />
        );
      })}
    </svg>
  );
};

// ── Gradient radial glow ───────────────────────────────────────────────────────
const RadialGlow: React.FC<{ cx: string; cy: string; color: string; opacity: number; size?: string }> = ({
  cx, cy, color, opacity, size = '60%',
}) => (
  <div
    style={{
      position: 'absolute',
      left: cx,
      top: cy,
      transform: 'translate(-50%, -50%)',
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
      opacity,
    }}
  />
);

// ── Glass card ─────────────────────────────────────────────────────────────────
const GlassCard: React.FC<{
  style?: React.CSSProperties;
  accent?: string;
  children: React.ReactNode;
}> = ({ style, accent = C.linkedin, children }) => (
  <div
    style={{
      background: 'rgba(6, 23, 40, 0.85)',
      backdropFilter: 'blur(24px)',
      border: `2px solid ${accent}44`,
      borderRadius: 32,
      boxShadow: `0 0 60px ${accent}22, inset 0 1px 0 ${accent}33`,
      ...style,
    }}
  >
    {children}
  </div>
);

// ── Gradient text ──────────────────────────────────────────────────────────────
const GradText: React.FC<{ from: string; to: string; style?: React.CSSProperties; children: React.ReactNode }> = ({
  from, to, style, children,
}) => (
  <span
    style={{
      background: `linear-gradient(135deg, ${from}, ${to})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      ...style,
    }}
  >
    {children}
  </span>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOOK
// ═══════════════════════════════════════════════════════════════════════════════
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "90 MINUTES" → crosses out, "0 MANUAL WORK" appears
  const titleScale = spring({ frame, fps, from: 0.7, to: 1, config: { stiffness: 80, damping: 14 } });
  const titleOp = fadeIn(frame, 0, 20);

  // Strikethrough at frame 55
  const strikeW = interpolate(frame, [55, 80], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const subtitleOp = fadeIn(frame, 65, 25);
  const subtitleY = interpolate(
    spring({ frame, fps, from: 40, to: 0, config: { stiffness: 80, damping: 14 }, delay: 65 }),
    [0, 40], [0, 40], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const taglineOp = fadeIn(frame, 85, 20);

  const sceneOp = fadeOut(frame, 120, 15);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: sceneOp,
      }}
    >
      <RadialGlow cx="50%" cy="45%" color={C.linkedin} opacity={0.6} size="70%" />

      <div style={{ textAlign: 'center', opacity: titleOp, transform: `scale(${titleScale})` }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div
            style={{
              fontSize: 220,
              fontWeight: 900,
              letterSpacing: -6,
              lineHeight: 1,
              color: C.white,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            90 <span style={{ color: C.linkedin }}>MINUTES</span>
          </div>
          {/* Strikethrough line */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '52%',
              height: 14,
              width: `${strikeW}%`,
              background: `linear-gradient(90deg, ${C.orange}, ${C.gold})`,
              borderRadius: 7,
              boxShadow: `0 0 30px ${C.orange}88`,
            }}
          />
        </div>

        <div style={{ fontSize: 90, color: C.light, fontWeight: 400, marginTop: 20, letterSpacing: 12 }}>
          A DAY ON LINKEDIN
        </div>
      </div>

      {/* "→ 0 MANUAL WORK" */}
      <div
        style={{
          marginTop: 60,
          opacity: subtitleOp,
          transform: `translateY(${subtitleY}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 40,
        }}
      >
        <div style={{ fontSize: 100, color: C.green, fontWeight: 300 }}>→</div>
        <GradText
          from={C.green}
          to={C.greenGlow}
          style={{ fontSize: 160, fontWeight: 900, letterSpacing: -4 }}
        >
          ZERO MANUAL WORK
        </GradText>
      </div>

      {/* Tagline */}
      <div
        style={{
          marginTop: 50,
          opacity: taglineOp,
          fontSize: 64,
          color: C.light,
          letterSpacing: 8,
          fontWeight: 300,
        }}
      >
        LinkedIn Automation with Make.com + Apify
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2 — PROBLEM
// ═══════════════════════════════════════════════════════════════════════════════
const MANUAL_STEPS = [
  { icon: '👁', label: 'Browse 15–20 competitor profiles' },
  { icon: '📸', label: 'Screenshot high-performing posts' },
  { icon: '📝', label: 'Paraphrase them in Notion' },
  { icon: '📋', label: 'Paste into Buffer one by one' },
  { icon: '🙏', label: 'Pray the algorithm liked you' },
];

const ProblemStep: React.FC<{ icon: string; label: string; index: number; startFrame: number }> = ({
  icon, label, index, startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = startFrame + index * 18;

  const op = fadeIn(frame, delay, 15);
  const x = interpolate(
    spring({ frame, fps, from: -120, to: 0, config: { stiffness: 90, damping: 15 }, delay }),
    [-120, 0], [-120, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 36,
        opacity: op,
        transform: `translateX(${x}px)`,
        padding: '28px 48px',
        background: 'rgba(255,80,60,0.07)',
        border: '2px solid rgba(255,80,60,0.2)',
        borderRadius: 20,
        marginBottom: 20,
      }}
    >
      <span style={{ fontSize: 64 }}>{icon}</span>
      <span style={{ fontSize: 64, color: '#EF4444', fontWeight: 700 }}>Step {index + 1}.</span>
      <span style={{ fontSize: 60, color: C.light }}>{label}</span>
    </div>
  );
};

const SceneProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const sceneOp = fadeOut(frame, 135, 15);
  const headerOp = fadeIn(frame, 0, 20);

  // "60% drop" stat appears at frame 90
  const statOp = fadeIn(frame, 80, 20);
  const statScale = spring({
    frame, fps: 30, from: 0.5, to: 1,
    config: { stiffness: 120, damping: 12 }, delay: 80,
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '120px 240px',
        opacity: sceneOp,
      }}
    >
      <RadialGlow cx="80%" cy="20%" color="#EF4444" opacity={0.3} size="50%" />

      <div style={{ opacity: headerOp, marginBottom: 60 }}>
        <div style={{ fontSize: 80, color: C.muted, letterSpacing: 10, fontWeight: 300, marginBottom: 16 }}>
          THE OLD WAY
        </div>
        <GradText from="#EF4444" to="#F97316" style={{ fontSize: 130, fontWeight: 900, letterSpacing: -3 }}>
          The LinkedIn Hamster Wheel
        </GradText>
      </div>

      <div style={{ display: 'flex', gap: 80, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {MANUAL_STEPS.map((s, i) => (
            <ProblemStep key={i} icon={s.icon} label={s.label} index={i} startFrame={8} />
          ))}
        </div>

        {/* Stat callout */}
        <GlassCard
          accent="#EF4444"
          style={{
            padding: '60px 70px',
            opacity: statOp,
            transform: `scale(${statScale})`,
            textAlign: 'center',
            minWidth: 600,
          }}
        >
          <div style={{ fontSize: 200, fontWeight: 900, color: '#EF4444', lineHeight: 1 }}>60%</div>
          <div style={{ fontSize: 65, color: C.light, marginTop: 20 }}>impressions drop</div>
          <div style={{ fontSize: 55, color: C.muted, marginTop: 12 }}>if you miss one week</div>
          <div
            style={{
              marginTop: 48,
              padding: '28px 40px',
              background: 'rgba(239,68,68,0.1)',
              borderRadius: 16,
              fontSize: 55,
              color: '#FCA5A5',
              fontStyle: 'italic',
            }}
          >
            "The problem wasn't effort.<br />It was architecture."
          </div>
        </GlassCard>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 3 — SYSTEM REVEAL
// ═══════════════════════════════════════════════════════════════════════════════
const WorkflowCard: React.FC<{
  number: number;
  title: string;
  subtitle: string;
  bullets: string[];
  accent: string;
  delay: number;
}> = ({ number, title, subtitle, bullets, accent, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const op = fadeIn(frame, delay, 20);
  const y = interpolate(
    spring({ frame, fps, from: 80, to: 0, config: { stiffness: 80, damping: 13 }, delay }),
    [0, 80], [0, 80], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <GlassCard
      accent={accent}
      style={{
        flex: 1,
        padding: '70px 70px',
        opacity: op,
        transform: `translateY(${y}px)`,
      }}
    >
      {/* Number badge */}
      <div
        style={{
          width: 110,
          height: 110,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 70,
          fontWeight: 900,
          color: C.white,
          marginBottom: 40,
          boxShadow: `0 0 40px ${accent}66`,
        }}
      >
        {number}
      </div>

      <div style={{ fontSize: 55, color: C.muted, letterSpacing: 6, fontWeight: 300, marginBottom: 16 }}>
        WORKFLOW {number}
      </div>
      <div style={{ fontSize: 85, fontWeight: 800, color: C.white, marginBottom: 16, lineHeight: 1.1 }}>
        {title}
      </div>
      <div style={{ fontSize: 60, color: accent, marginBottom: 48 }}>{subtitle}</div>

      {bullets.map((b, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 24,
            opacity: fadeIn(frame, delay + 20 + i * 12, 15),
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: accent,
              boxShadow: `0 0 12px ${accent}`,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 58, color: C.light }}>{b}</span>
        </div>
      ))}
    </GlassCard>
  );
};

const SceneSystem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = fadeIn(frame, 0, 20);
  const headerScale = spring({ frame, fps, from: 0.8, to: 1, config: { stiffness: 80, damping: 14 } });
  const sceneOp = fadeOut(frame, 150, 15);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '100px 200px',
        opacity: sceneOp,
      }}
    >
      <RadialGlow cx="50%" cy="30%" color={C.purple} opacity={0.5} size="60%" />

      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 80,
          opacity: headerOp,
          transform: `scale(${headerScale})`,
        }}
      >
        <div style={{ fontSize: 72, color: C.muted, letterSpacing: 12, fontWeight: 300, marginBottom: 20 }}>
          THE SOLUTION
        </div>
        <GradText from={C.linkedin} to={C.purple} style={{ fontSize: 155, fontWeight: 900, letterSpacing: -4 }}>
          2 Workflows. 1 Pipeline.
        </GradText>
        <div style={{ fontSize: 68, color: C.light, marginTop: 20 }}>
          100% automated LinkedIn content engine
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', gap: 60 }}>
        <WorkflowCard
          number={1}
          title="Scrape & Store"
          subtitle="Apify → Make.com → Google Sheets"
          accent={C.linkedin}
          delay={25}
          bullets={[
            'Scrapes competitor posts daily at 7am',
            'Fetches 100 posts per run via JSON',
            'URN-based deduplication — no bloat',
            'Auto-populating content database',
          ]}
        />
        <WorkflowCard
          number={2}
          title="Schedule & Post"
          subtitle="Google Sheets → Make.com → LinkedIn API"
          accent={C.purple}
          delay={50}
          bullets={[
            'Hourly trigger checks scheduled posts',
            'Exact timestamp matching — to the minute',
            'Posts via LinkedIn API automatically',
            'You schedule once, system handles rest',
          ]}
        />
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 4 — PIPELINE FLOW
// ═══════════════════════════════════════════════════════════════════════════════
type PipeNode = { id: string; label: string; sublabel: string; color: string; x: number; y: number };

const PIPE_NODES: PipeNode[] = [
  { id: 'apify',   label: 'Apify',        sublabel: 'Web Scraper',    color: C.orange,   x: 0.12, y: 0.50 },
  { id: 'make',    label: 'Make.com',     sublabel: 'Automation Hub', color: C.purple,   x: 0.38, y: 0.35 },
  { id: 'sheets',  label: 'Google Sheets',sublabel: 'Database',       color: C.green,    x: 0.63, y: 0.50 },
  { id: 'linkedin',label: 'LinkedIn API', sublabel: 'Publisher',      color: C.linkedin, x: 0.88, y: 0.35 },
];

const PIPE_CONNECTIONS = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 1 },
  { from: 1, to: 3 },
];

// Flowing particles on a line — deterministic
const FLOW_PARTICLES = Array.from({ length: 6 }, (_, i) => i / 6);

const PipelineSVG: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const nodeR = 100;

  const nodePositions = PIPE_NODES.map((n) => ({
    ...n,
    cx: n.x * width,
    cy: n.y * height,
  }));

  // Animate node appearance
  const nodeScales = nodePositions.map((_, i) =>
    spring({ frame, fps: 30, from: 0, to: 1, config: { stiffness: 90, damping: 12 }, delay: i * 20 })
  );

  return (
    <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
      <defs>
        {PIPE_NODES.map((n) => (
          <radialGradient key={n.id} id={`ng_${n.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={n.color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={n.color} stopOpacity={0} />
          </radialGradient>
        ))}
      </defs>

      {/* Connection lines */}
      {PIPE_CONNECTIONS.map((conn, ci) => {
        const from = nodePositions[conn.from];
        const to = nodePositions[conn.to];
        const lineOp = clamp(interpolate(frame, [ci * 15 + 20, ci * 15 + 50], [0, 0.6]), 0, 0.6);

        return (
          <g key={ci}>
            <line
              x1={from.cx} y1={from.cy}
              x2={to.cx} y2={to.cy}
              stroke={from.color}
              strokeWidth={4}
              opacity={lineOp}
              strokeDasharray="20 10"
            />
            {/* Animated flow particles */}
            {FLOW_PARTICLES.map((offset, pi) => {
              const progress = ((frame * 0.015 + offset + ci * 0.25) % 1 + 1) % 1;
              const px = from.cx + (to.cx - from.cx) * progress;
              const py = from.cy + (to.cy - from.cy) * progress;
              const pOp = lineOp * 0.9 * Math.abs(Math.sin(progress * Math.PI));
              return (
                <circle key={pi} cx={px} cy={py} r={8} fill={from.color} opacity={pOp}>
                  <animate />
                </circle>
              );
            })}
          </g>
        );
      })}

      {/* Nodes */}
      {nodePositions.map((n, i) => {
        const s = nodeScales[i];
        const pulseR = nodeR + 20 * Math.abs(Math.sin(frame * 0.04 + i));
        return (
          <g key={n.id} transform={`translate(${n.cx}, ${n.cy}) scale(${s})`}>
            {/* Glow */}
            <circle cx={0} cy={0} r={pulseR + 60} fill={`url(#ng_${n.id})`} />
            {/* Outer ring */}
            <circle cx={0} cy={0} r={nodeR + 8} fill="none" stroke={n.color} strokeWidth={3} opacity={0.4} />
            {/* Node body */}
            <circle cx={0} cy={0} r={nodeR} fill={C.bgMid} stroke={n.color} strokeWidth={4} />
          </g>
        );
      })}
    </svg>
  );
};

const ScenePipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const headerOp = fadeIn(frame, 0, 20);
  const sceneOp = fadeOut(frame, 150, 15);

  const nodePositions = PIPE_NODES.map((n) => ({
    ...n,
    cx: n.x * width,
    cy: n.y * height,
  }));

  const nodeScales = PIPE_NODES.map((_, i) =>
    spring({ frame, fps: 30, from: 0, to: 1, config: { stiffness: 90, damping: 12 }, delay: i * 20 })
  );

  return (
    <AbsoluteFill style={{ opacity: sceneOp }}>
      <RadialGlow cx="50%" cy="50%" color={C.linkedin} opacity={0.3} size="80%" />
      <PipelineSVG />

      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: headerOp,
        }}
      >
        <div style={{ fontSize: 68, color: C.muted, letterSpacing: 12, fontWeight: 300 }}>THE ENGINE</div>
        <GradText from={C.green} to={C.linkedin} style={{ fontSize: 140, fontWeight: 900, letterSpacing: -3 }}>
          End-to-End Pipeline
        </GradText>
      </div>

      {/* Node labels */}
      {nodePositions.map((n, i) => {
        const s = nodeScales[i];
        const labelOp = clamp(interpolate(frame, [i * 20 + 20, i * 20 + 40], [0, 1]), 0, 1);
        const isTop = n.y < 0.5;
        return (
          <div
            key={n.id}
            style={{
              position: 'absolute',
              left: n.cx,
              top: isTop ? n.cy * height - 200 : n.cy * height + 130,
              transform: `translateX(-50%) scale(${s})`,
              textAlign: 'center',
              opacity: labelOp,
            }}
          >
            <div style={{ fontSize: 75, fontWeight: 800, color: n.color }}>{n.label}</div>
            <div style={{ fontSize: 52, color: C.muted }}>{n.sublabel}</div>
          </div>
        );
      })}

      {/* Bottom: "Only 1 manual step" callout */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: fadeIn(frame, 100, 20),
        }}
      >
        <GlassCard
          accent={C.gold}
          style={{
            display: 'inline-block',
            padding: '36px 80px',
          }}
        >
          <span style={{ fontSize: 64, color: C.gold, fontWeight: 700 }}>⚡ Only 1 manual step remaining:</span>
          <span style={{ fontSize: 60, color: C.light }}> Review & adapt content to your voice</span>
        </GlassCard>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 5 — ROI / COST
// ═══════════════════════════════════════════════════════════════════════════════
const CostCard: React.FC<{
  label: string;
  amount: string;
  note: string;
  accent: string;
  delay: number;
  isWinner?: boolean;
}> = ({ label, amount, note, accent, delay, isWinner }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const op = fadeIn(frame, delay, 20);
  const scale = spring({ frame, fps, from: 0.7, to: isWinner ? 1.05 : 0.95, config: { stiffness: 80, damping: 12 }, delay });

  return (
    <GlassCard
      accent={accent}
      style={{
        flex: 1,
        padding: '80px 70px',
        opacity: op,
        transform: `scale(${scale})`,
        textAlign: 'center',
      }}
    >
      {isWinner && (
        <div
          style={{
            fontSize: 50,
            color: accent,
            fontWeight: 700,
            letterSpacing: 6,
            marginBottom: 30,
            background: `${accent}22`,
            borderRadius: 12,
            padding: '14px 32px',
            display: 'inline-block',
          }}
        >
          ✓ THIS SYSTEM
        </div>
      )}
      <div style={{ fontSize: 68, color: C.muted, letterSpacing: 8, fontWeight: 300, marginBottom: 24 }}>
        {label}
      </div>
      <GradText from={accent} to={accent + 'CC'} style={{ fontSize: 190, fontWeight: 900, lineHeight: 1 }}>
        {amount}
      </GradText>
      <div style={{ fontSize: 62, color: C.light, marginTop: 20 }}>per month</div>
      <div
        style={{
          marginTop: 40,
          padding: '28px 36px',
          background: `${accent}11`,
          borderRadius: 16,
          fontSize: 55,
          color: C.muted,
        }}
      >
        {note}
      </div>
    </GlassCard>
  );
};

const SceneROI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = fadeIn(frame, 0, 20);
  const sceneOp = fadeOut(frame, 120, 15);

  const vsScale = spring({ frame, fps, from: 0, to: 1, config: { stiffness: 100, damping: 10 }, delay: 40 });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '100px 200px',
        opacity: sceneOp,
      }}
    >
      <RadialGlow cx="20%" cy="50%" color={C.green} opacity={0.4} size="50%" />
      <RadialGlow cx="80%" cy="50%" color="#EF4444" opacity={0.3} size="50%" />

      <div style={{ textAlign: 'center', opacity: headerOp, marginBottom: 80 }}>
        <div style={{ fontSize: 68, color: C.muted, letterSpacing: 12, fontWeight: 300, marginBottom: 16 }}>
          THE MATH
        </div>
        <GradText from={C.gold} to={C.green} style={{ fontSize: 145, fontWeight: 900, letterSpacing: -3 }}>
          ROI is Undeniable
        </GradText>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 60 }}>
        <CostCard
          label="Make.com + Apify"
          amount="$5–25"
          note="Apify $5–15 + Make.com free or $9/mo + Google Sheets free"
          accent={C.green}
          delay={20}
          isWinner
        />

        <div
          style={{
            fontSize: 200,
            fontWeight: 900,
            color: C.muted,
            transform: `scale(${vsScale})`,
            flexShrink: 0,
          }}
        >
          VS
        </div>

        <CostCard
          label="Virtual Assistant"
          amount="$300–800"
          note="Manual scheduling, research, and posting — every month"
          accent="#EF4444"
          delay={40}
        />
      </div>

      {/* Savings callout */}
      <div
        style={{
          marginTop: 60,
          textAlign: 'center',
          opacity: fadeIn(frame, 90, 20),
        }}
      >
        <GlassCard
          accent={C.gold}
          style={{ display: 'inline-block', padding: '36px 100px' }}
        >
          <span style={{ fontSize: 72, color: C.gold, fontWeight: 700 }}>
            Save up to{' '}
          </span>
          <GradText from={C.gold} to={C.green} style={{ fontSize: 90, fontWeight: 900 }}>
            $775/month
          </GradText>
          <span style={{ fontSize: 72, color: C.gold, fontWeight: 700 }}>
            {' '}while posting 5×/week consistently
          </span>
        </GlassCard>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 6 — CTA / BRAND
// ═══════════════════════════════════════════════════════════════════════════════
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = fadeIn(frame, 0, 30);
  const logoScale = spring({ frame, fps, from: 0, to: 1, config: { stiffness: 70, damping: 14 } });
  const ctaOp = fadeIn(frame, 30, 25);
  const ctaY = interpolate(
    spring({ frame, fps, from: 60, to: 0, config: { stiffness: 80, damping: 14 }, delay: 30 }),
    [0, 60], [0, 60], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const bulletOp1 = fadeIn(frame, 50, 15);
  const bulletOp2 = fadeIn(frame, 65, 15);
  const bulletOp3 = fadeIn(frame, 80, 15);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: bgOp,
      }}
    >
      {/* Full-bleed gradient background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${C.bg} 0%, #071428 50%, #0A1A30 100%)`,
        }}
      />
      <GridBg opacity={0.12} />
      <RadialGlow cx="50%" cy="50%" color={C.linkedin} opacity={0.5} size="80%" />
      <Particles />

      {/* Brand logo area */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          textAlign: 'center',
          marginBottom: 60,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 28,
            padding: '28px 60px',
            background: `linear-gradient(135deg, ${C.linkedin}22, ${C.purple}22)`,
            border: `3px solid ${C.linkedin}55`,
            borderRadius: 24,
            boxShadow: `0 0 80px ${C.linkedin}33`,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${C.linkedin}, ${C.purple})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
            }}
          >
            ⚡
          </div>
          <span style={{ fontSize: 68, fontWeight: 700, color: C.white, letterSpacing: 2 }}>
            Rising Automation
          </span>
        </div>
      </div>

      {/* Main CTA */}
      <div
        style={{
          textAlign: 'center',
          opacity: ctaOp,
          transform: `translateY(${ctaY}px)`,
        }}
      >
        <GradText
          from={C.white}
          to={C.linkedinGlow}
          style={{ fontSize: 175, fontWeight: 900, lineHeight: 1, letterSpacing: -4 }}
        >
          Build Your LinkedIn Engine
        </GradText>
        <div style={{ fontSize: 75, color: C.light, marginTop: 24, fontWeight: 300 }}>
          Consistent posting. Zero manual work. Full automation.
        </div>
      </div>

      {/* Value bullets */}
      <div style={{ marginTop: 70, display: 'flex', gap: 50 }}>
        {[
          { op: bulletOp1, color: C.linkedin, icon: '🔗', text: 'Make.com + Apify + Sheets' },
          { op: bulletOp2, color: C.green, icon: '⏱', text: '2–3 hours to set up' },
          { op: bulletOp3, color: C.gold, icon: '💡', text: 'Custom builds available' },
        ].map((b, i) => (
          <div
            key={i}
            style={{
              opacity: b.op,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '28px 44px',
              background: `${b.color}11`,
              border: `2px solid ${b.color}44`,
              borderRadius: 20,
            }}
          >
            <span style={{ fontSize: 60 }}>{b.icon}</span>
            <span style={{ fontSize: 58, color: C.light, fontWeight: 500 }}>{b.text}</span>
          </div>
        ))}
      </div>

      {/* Domain */}
      <div
        style={{
          marginTop: 60,
          fontSize: 62,
          color: C.linkedin,
          fontWeight: 600,
          opacity: fadeIn(frame, 90, 20),
          letterSpacing: 3,
        }}
      >
        rising-automation.com
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT COMPOSITION
// ═══════════════════════════════════════════════════════════════════════════════
export const LinkedInAutomationBrand: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{ background: C.bg, fontFamily: 'system-ui, -apple-system, "Segoe UI", Helvetica, sans-serif' }}
    >
      {/* Persistent bg layers */}
      <GridBg />
      <Particles />

      {/* Scene 1 — Hook (0→120) */}
      <Sequence from={0} durationInFrames={120}>
        <SceneHook />
      </Sequence>

      {/* Scene 2 — Problem (120→255) */}
      <Sequence from={120} durationInFrames={135}>
        <SceneProblem />
      </Sequence>

      {/* Scene 3 — System (255→405) */}
      <Sequence from={255} durationInFrames={150}>
        <SceneSystem />
      </Sequence>

      {/* Scene 4 — Pipeline (405→555) */}
      <Sequence from={405} durationInFrames={150}>
        <ScenePipeline />
      </Sequence>

      {/* Scene 5 — ROI (555→675) */}
      <Sequence from={555} durationInFrames={120}>
        <SceneROI />
      </Sequence>

      {/* Scene 6 — CTA (675→780) */}
      <Sequence from={675} durationInFrames={105}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
