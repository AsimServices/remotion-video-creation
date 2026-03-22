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

// ─── Color palette ────────────────────────────────────────────────────────────
const BG = '#050810';
const CYAN = '#00d4ff';
const PURPLE = '#8b5cf6';
const ORANGE = '#ff6b35';
const GREEN = '#10b981';

// ─── Neural network layout ────────────────────────────────────────────────────
const NN_LAYERS = [6, 8, 8, 4];
const NN_LAYER_X = [0.12, 0.38, 0.62, 0.88];

type NNNode = { x: number; y: number };
type NNConn = { x1: number; y1: number; x2: number; y2: number; li: number; ci: number; total: number };

function buildNodes(w: number, h: number): NNNode[][] {
  return NN_LAYERS.map((count, li) => {
    const x = NN_LAYER_X[li] * w;
    return Array.from({ length: count }, (_, ni) => ({
      x,
      y: h * (0.1 + (ni / Math.max(count - 1, 1)) * 0.8),
    }));
  });
}

function buildConns(nodes: NNNode[][]): NNConn[] {
  const out: NNConn[] = [];
  for (let li = 0; li < nodes.length - 1; li++) {
    const from = nodes[li];
    const to = nodes[li + 1];
    let ci = 0;
    const total = from.length * to.length;
    for (const f of from)
      for (const t of to)
        out.push({ x1: f.x, y1: f.y, x2: t.x, y2: t.y, li, ci: ci++, total });
  }
  return out;
}

// ─── Neural Network SVG ───────────────────────────────────────────────────────
const NeuralNet: React.FC<{ w: number; h: number; activationProgress: number; showFlow?: boolean }> = ({
  w, h, activationProgress, showFlow = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nodes = buildNodes(w, h);
  const conns = buildConns(nodes);
  const numL = NN_LAYERS.length - 1;

  return (
    <svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }}>
      <defs>
        <filter id="nnG" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Connections */}
      {conns.map((c, i) => {
        const threshold = (c.li / numL) * 0.78 + (c.ci / c.total) * 0.2 * (1 / numL);
        const active = activationProgress > threshold;
        const brightness = active ? Math.min(1, (activationProgress - threshold) / 0.1) : 0;
        const speed = 0.55 + (i % 5) * 0.09;
        const dotT = ((frame / fps * speed + i * 0.07) % 1);
        const dotX = c.x1 + (c.x2 - c.x1) * dotT;
        const dotY = c.y1 + (c.y2 - c.y1) * dotT;

        return (
          <g key={i}>
            <line x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
              stroke={active ? CYAN : 'rgba(255,255,255,0.05)'}
              strokeWidth={active ? 1.2 : 0.4}
              opacity={active ? brightness * 0.72 : 0.4} />
            {showFlow && active && (
              <circle cx={dotX} cy={dotY} r={2.5} fill={CYAN} opacity={brightness * 0.9} />
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((layer, li) =>
        layer.map((nd, ni) => {
          const nodeT = (li / (NN_LAYERS.length - 1)) * 0.78;
          const active = activationProgress > nodeT;
          const nodeB = active ? Math.min(1, (activationProgress - nodeT) / 0.08) : 0;
          const pulse = active ? 0.5 + 0.5 * Math.sin((frame / fps * 2.5 + li * 0.9 + ni * 0.42) * Math.PI) : 0;
          const r = 5 + nodeB * 5 + pulse * 2.5;
          const color = li === 0 ? GREEN : li === NN_LAYERS.length - 1 ? ORANGE : CYAN;

          return (
            <g key={`${li}-${ni}`}>
              {active && <circle cx={nd.x} cy={nd.y} r={r * 2.8} fill={color} opacity={0.07 + pulse * 0.07} />}
              <circle cx={nd.x} cy={nd.y} r={r}
                fill={active ? color : 'rgba(255,255,255,0.08)'}
                stroke={active ? color : 'rgba(255,255,255,0.18)'}
                strokeWidth={1.5}
                opacity={active ? 0.85 + pulse * 0.15 : 0.3}
                filter={active ? 'url(#nnG)' : undefined} />
            </g>
          );
        })
      )}
    </svg>
  );
};

// ─── Background elements ──────────────────────────────────────────────────────
const Starfield: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }}>
      {Array.from({ length: 160 }, (_, i) => {
        const x = ((i * 137.508) % 1) * w;
        const y = ((i * 97.314) % 1) * h;
        const r = 0.35 + (i % 4) * 0.3;
        const tw = 0.15 + 0.55 * Math.abs(Math.sin((frame / 70 + i * 0.47) * Math.PI));
        return <circle key={i} cx={x} cy={y} r={r} fill="white" opacity={tw} />;
      })}
    </svg>
  );
};

const Grid: React.FC<{ w: number; h: number; opacity: number }> = ({ w, h, opacity }) => (
  <svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0, opacity }}>
    {Array.from({ length: 24 }, (_, i) => (
      <line key={`v${i}`} x1={(i / 23) * w} y1={0} x2={(i / 23) * w} y2={h}
        stroke={CYAN} strokeWidth={0.3} opacity={0.1} />
    ))}
    {Array.from({ length: 14 }, (_, i) => (
      <line key={`h${i}`} x1={0} y1={(i / 13) * h} x2={w} y2={(i / 13) * h}
        stroke={CYAN} strokeWidth={0.3} opacity={0.1} />
    ))}
  </svg>
);

// ─── Reusable scene badge ─────────────────────────────────────────────────────
const SceneBadge: React.FC<{ num: string; title: string; color: string }> = ({ num, title, color }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', top: '4.5%', left: '50%', transform: 'translateX(-50%)',
      opacity: op, textAlign: 'center',
    }}>
      <span style={{
        color, fontFamily: 'monospace', fontSize: '1.3vw', letterSpacing: '0.3em',
        fontWeight: 'bold', textShadow: `0 0 24px ${color}`,
      }}>
        {num} / {title}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 1 — INTRO TITLE CARD
// ─────────────────────────────────────────────────────────────────────────────
const SceneIntro: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const frame = useCurrentFrame();
  const titleOp = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 35], [80, 0], {
    extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
  });
  const subtitleOp = interpolate(frame, [28, 55], [0, 1], { extrapolateRight: 'clamp' });
  const nnOp = interpolate(frame, [8, 45], [0, 1], { extrapolateRight: 'clamp' });
  const nnProg = interpolate(frame, [20, 115], [0, 0.45], { extrapolateRight: 'clamp' });
  const lineW = interpolate(frame, [35, 80], [0, 560], { extrapolateRight: 'clamp' });

  const sub = 'Intelligent Systems That Work For You';
  const chars = Math.floor(interpolate(frame, [40, 105], [0, sub.length], { extrapolateRight: 'clamp' }));

  const tagItems = ['MACHINE LEARNING', 'NEURAL NETWORKS', 'PROCESS AUTOMATION', 'DECISION INTELLIGENCE'];
  const tagOp = interpolate(frame, [70, 90], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <Grid w={w} h={h} opacity={nnOp * 0.4} />
      <div style={{ position: 'absolute', inset: 0, opacity: nnOp }}>
        <NeuralNet w={w} h={h} activationProgress={nnProg} />
      </div>

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `translateY(${titleY}px)`, opacity: titleOp, textAlign: 'center' }}>
          {/* Main title */}
          <div style={{
            fontSize: `${w * 0.068}px`, fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 900,
            letterSpacing: '0.12em',
            background: `linear-gradient(135deg, ${CYAN} 0%, ${PURPLE} 50%, ${ORANGE} 100%)`,
            WebkitBackgroundClip: 'text', color: 'transparent',
            textTransform: 'uppercase', lineHeight: 1.1,
          }}>
            AI AUTOMATION
          </div>

          {/* Animated divider line */}
          <div style={{
            width: lineW, height: 2,
            background: `linear-gradient(90deg, transparent, ${CYAN}, ${PURPLE}, transparent)`,
            margin: '22px auto',
            boxShadow: `0 0 16px ${CYAN}66`,
          }} />

          {/* Typewriter subtitle */}
          <div style={{
            fontSize: `${w * 0.017}px`, fontFamily: 'monospace', letterSpacing: '0.22em',
            color: 'rgba(255,255,255,0.65)', opacity: subtitleOp, minHeight: '1.5em',
          }}>
            {sub.slice(0, chars)}
            {chars < sub.length && (
              <span style={{ opacity: frame % 28 < 14 ? 1 : 0 }}>▌</span>
            )}
          </div>

          {/* Tag pills */}
          <div style={{
            display: 'flex', gap: 16, marginTop: 36, justifyContent: 'center', opacity: tagOp, flexWrap: 'wrap',
          }}>
            {tagItems.map((tag, i) => (
              <div key={i} style={{
                border: `1px solid ${[CYAN, PURPLE, GREEN, ORANGE][i]}55`,
                color: [CYAN, PURPLE, GREEN, ORANGE][i],
                padding: '6px 14px', borderRadius: 4, fontFamily: 'monospace',
                fontSize: `${w * 0.009}px`, letterSpacing: '0.2em',
                background: `${[CYAN, PURPLE, GREEN, ORANGE][i]}0d`,
              }}>
                {tag}
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 2 — DATA INGESTION
// ─────────────────────────────────────────────────────────────────────────────
const DATA_STREAMS = [
  { y: 0.22, color: GREEN, label: '▸ SENSOR & METRICS', type: 'REAL-TIME DATA' },
  { y: 0.50, color: CYAN, label: '▸ LANGUAGE & TEXT', type: 'NLP PIPELINE' },
  { y: 0.78, color: PURPLE, label: '▸ EVENTS & LOGS', type: 'EVENT STREAM' },
];

const SceneData: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [115, 135], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const op = Math.min(fadeIn, fadeOut);
  const nnProg = interpolate(frame, [10, 80], [0.28, 0.56], { extrapolateRight: 'clamp' });
  const inputX = NN_LAYER_X[0] * w;
  const statsOp = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' });
  const counter = Math.floor((frame * 28470 + 1_300_000) % 9_999_999);

  return (
    <AbsoluteFill style={{ opacity: op }}>
      <Grid w={w} h={h} opacity={0.22} />
      <NeuralNet w={w} h={h} activationProgress={nnProg} />

      {/* Particle streams */}
      <svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }}>
        {DATA_STREAMS.map((stream, si) => {
          const sy = stream.y * h;
          return (
            <g key={si}>
              {/* Guide line */}
              <line x1={0} y1={sy} x2={inputX} y2={sy}
                stroke={stream.color} strokeWidth={1} opacity={0.1} strokeDasharray="5 10" />

              {/* Flowing particles */}
              {Array.from({ length: 16 }, (_, pi) => {
                const speed = 0.45 + (pi % 5) * 0.11;
                const t = ((frame / fps * speed + pi / 16 + si * 0.35) % 1);
                const px = t * inputX;
                const wob = Math.sin((frame / fps * 4 + pi * 1.73 + si * 2.09) * Math.PI) * h * 0.022;
                const py = sy + wob;
                const sz = 2.5 + (pi % 3) * 1.1;
                const alpha = Math.sin(t * Math.PI) * 0.92;
                return (
                  <g key={pi}>
                    <circle cx={px} cy={py} r={sz * 2.2} fill={stream.color} opacity={alpha * 0.14} />
                    <circle cx={px} cy={py} r={sz} fill={stream.color} opacity={alpha} />
                  </g>
                );
              })}

              {/* Labels */}
              <text x={16} y={sy - 15} fill={stream.color}
                fontSize={w * 0.011} fontFamily="monospace" letterSpacing={2} opacity={0.88}>{stream.label}</text>
              <text x={16} y={sy + 24} fill={stream.color}
                fontSize={w * 0.009} fontFamily="monospace" opacity={0.38}>[{stream.type}]</text>
            </g>
          );
        })}
      </svg>

      <SceneBadge num="01" title="DATA INGESTION" color={CYAN} />

      {/* Stats panel */}
      <div style={{
        position: 'absolute', bottom: '6%', right: '3%', opacity: statsOp,
        color: `${CYAN}99`, fontSize: `${w * 0.011}px`, fontFamily: 'monospace',
        textAlign: 'right', lineHeight: 1.9,
      }}>
        <div>◈ PIPELINE: <span style={{ color: GREEN }}>ACTIVE</span></div>
        <div>▶ EVENTS: {counter.toLocaleString()}</div>
        <div>⟳ THROUGHPUT: {((frame % 30) * 134 + 8_200).toLocaleString()} /s</div>
        <div>⬡ SOURCES: {DATA_STREAMS.length} streams</div>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 3 — AI PROCESSING
// ─────────────────────────────────────────────────────────────────────────────
const PATTERNS = [
  'PATTERN #1847: Market Anomaly — 94.2% Confidence',
  'PATTERN #2391: Customer Churn Signal Detected',
  'PATTERN #3072: System Bottleneck — Auto-scaling',
  'PATTERN #4156: Optimization Opportunity Found',
  'PATTERN #5203: Fraud Attempt — Blocked',
];

const SceneProcessing: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [115, 135], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const op = Math.min(fadeIn, fadeOut);
  const nnProg = interpolate(frame, [0, 135], [0.45, 1.0], { extrapolateRight: 'clamp' });
  const scanX = interpolate(frame, [0, 135], [0, w], { extrapolateRight: 'clamp' });
  const statsOp = interpolate(frame, [20, 42], [0, 1], { extrapolateRight: 'clamp' });

  const cycleLen = 28;
  const patternIdx = Math.floor(frame / cycleLen) % PATTERNS.length;
  const chars = Math.floor(((frame % cycleLen) / cycleLen) * PATTERNS[patternIdx].length);
  const accuracy = (94.2 + Math.sin(frame / 18) * 1.4).toFixed(1);

  return (
    <AbsoluteFill style={{ opacity: op }}>
      <Grid w={w} h={h} opacity={0.18} />
      <NeuralNet w={w} h={h} activationProgress={nnProg} showFlow />

      {/* Sweep scan line */}
      <svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="scanG" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={CYAN} stopOpacity={0} />
            <stop offset="85%" stopColor={CYAN} stopOpacity={0.5} />
            <stop offset="100%" stopColor={CYAN} stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={scanX} height={h} fill="url(#scanG)" opacity={0.055} />
        <line x1={scanX} y1={0} x2={scanX} y2={h} stroke={CYAN} strokeWidth={2} opacity={0.55} />
      </svg>

      <SceneBadge num="02" title="AI PROCESSING" color={PURPLE} />

      {/* Pattern recognition ticker */}
      <div style={{
        position: 'absolute', bottom: '7%', left: '50%', transform: 'translateX(-50%)',
        background: `${CYAN}0e`, border: `1px solid ${CYAN}33`, borderRadius: 6,
        padding: '10px 30px', color: CYAN, fontSize: `${w * 0.012}px`,
        fontFamily: 'monospace', letterSpacing: '0.14em', whiteSpace: 'nowrap',
        boxShadow: `0 0 24px ${CYAN}1a`,
        opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        ◈ {PATTERNS[patternIdx].slice(0, chars)}
        {chars < PATTERNS[patternIdx].length && '▌'}
      </div>

      {/* Model stats */}
      <div style={{
        position: 'absolute', top: '14%', right: '3%', opacity: statsOp,
        color: `${PURPLE}cc`, fontSize: `${w * 0.011}px`, fontFamily: 'monospace',
        lineHeight: 2.1, textAlign: 'right',
      }}>
        <div>MODEL: TRANSFORMER-XL</div>
        <div>ACCURACY: <span style={{ color: GREEN }}>{accuracy}%</span></div>
        <div>LATENCY: {(12 + (frame % 9)).toFixed(0)}ms</div>
        <div>LAYERS: {NN_LAYERS.join(' → ')}</div>
        <div>PARAMS: 175B</div>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 4 — AUTOMATED OUTPUTS
// ─────────────────────────────────────────────────────────────────────────────
const OUTPUTS = [
  { icon: '⚡', label: 'CODE DEPLOYED', value: 'v2.4.1 → Production', color: CYAN, tx: 0.03, ty: 0.09 },
  { icon: '📊', label: 'REPORTS GENERATED', value: '156 analytics reports', color: PURPLE, tx: 0.54, ty: 0.09 },
  { icon: '✉️', label: 'CAMPAIGNS SENT', value: '12,847 personalized emails', color: GREEN, tx: 0.03, ty: 0.41 },
  { icon: '🔔', label: 'ANOMALIES FLAGGED', value: '23 threats blocked', color: ORANGE, tx: 0.54, ty: 0.41 },
  { icon: '📅', label: 'WORKFLOWS TRIGGERED', value: '89 processes automated', color: CYAN, tx: 0.03, ty: 0.73 },
  { icon: '🤖', label: 'DECISIONS MADE', value: '1,204 predictions / min', color: PURPLE, tx: 0.54, ty: 0.73 },
];

const SceneOutputs: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [115, 135], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const op = Math.min(fadeIn, fadeOut);
  const nnFade = interpolate(frame, [35, 75], [1, 0.12], { extrapolateRight: 'clamp' });

  const cardW = w * 0.41;
  const cardH = h * 0.195;
  const ox = w * 0.5 - cardW / 2;
  const oy = h * 0.5 - cardH / 2;

  return (
    <AbsoluteFill style={{ opacity: op }}>
      <Grid w={w} h={h} opacity={0.12} />
      <div style={{ opacity: nnFade, position: 'absolute', inset: 0 }}>
        <NeuralNet w={w} h={h} activationProgress={1} showFlow />
      </div>

      {OUTPUTS.map((item, i) => {
        const delay = i * 8;
        const s = spring({ frame: frame - delay, fps, from: 0, to: 1, config: { damping: 15, stiffness: 145 } });
        const tx = item.tx * w;
        const ty = item.ty * h;
        const cx = ox + (tx - ox) * s;
        const cy = oy + (ty - oy) * s;
        const PERCENT_VALUES = [88, 73, 95, 61, 82, 79];

        return (
          <div key={i} style={{
            position: 'absolute', left: cx, top: cy, width: cardW, height: cardH,
            background: `linear-gradient(135deg, rgba(5,8,22,0.97), rgba(10,14,32,0.92))`,
            border: `1.5px solid ${item.color}44`,
            borderRadius: 10, padding: '16px 20px',
            boxShadow: `0 0 28px ${item.color}2a, 0 0 60px ${item.color}0e`,
            opacity: s,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: `${w * 0.024}px` }}>{item.icon}</span>
              <span style={{
                color: item.color, fontSize: `${w * 0.0105}px`, fontFamily: 'monospace',
                letterSpacing: '0.14em', fontWeight: 'bold',
              }}>{item.label}</span>
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.82)', fontSize: `${w * 0.014}px`,
              fontFamily: 'sans-serif', fontWeight: 600, marginBottom: 12,
            }}>{item.value}</div>
            {/* Progress bar */}
            <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${PERCENT_VALUES[i]}%`,
                background: `linear-gradient(90deg, ${item.color}66, ${item.color})`,
                borderRadius: 2,
              }} />
            </div>
            <div style={{ color: `${item.color}88`, fontSize: `${w * 0.009}px`, fontFamily: 'monospace', marginTop: 5 }}>
              {PERCENT_VALUES[i]}% efficiency
            </div>
          </div>
        );
      })}

      <SceneBadge num="03" title="AUTOMATED ACTIONS" color={ORANGE} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 5 — THE LEARNING LOOP
// ─────────────────────────────────────────────────────────────────────────────
const LOOP_STEPS = [
  { label: 'COLLECT', sub: 'Data from all sources', color: GREEN, angle: 270 },
  { label: 'ANALYZE', sub: 'Pattern recognition', color: CYAN, angle: 0 },
  { label: 'ACT', sub: 'Trigger automations', color: ORANGE, angle: 90 },
  { label: 'LEARN', sub: 'Model self-improvement', color: PURPLE, angle: 180 },
];

const SceneLoop: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [95, 120], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const op = Math.min(fadeIn, fadeOut);

  const cx = w * 0.5;
  const cy = h * 0.5;
  const R = Math.min(w, h) * 0.28;
  const dotAngle = ((frame / fps * 72) % 360); // one lap = 5s
  const dotRad = ((dotAngle - 90) * Math.PI) / 180;
  const dotX = cx + R * Math.cos(dotRad);
  const dotY = cy + R * Math.sin(dotRad);
  const centerOp = interpolate(frame, [35, 60], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: op }}>
      <svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <marker id="arrMk" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <polygon points="0 0, 7 2.5, 0 5" fill="rgba(255,255,255,0.25)" />
          </marker>
          <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1.5} />

        {/* Arc connectors between nodes */}
        {LOOP_STEPS.map((node, i) => {
          const next = LOOP_STEPS[(i + 1) % LOOP_STEPS.length];
          const a1 = (node.angle - 90) * Math.PI / 180;
          const a2 = (next.angle - 90) * Math.PI / 180;
          const x1 = cx + R * Math.cos(a1);
          const y1 = cy + R * Math.sin(a1);
          const x2 = cx + R * Math.cos(a2);
          const y2 = cy + R * Math.sin(a2);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={node.color} strokeWidth={1.5} opacity={0.22}
              strokeDasharray="6 9" markerEnd="url(#arrMk)" />
          );
        })}

        {/* Travelling dot */}
        <circle cx={dotX} cy={dotY} r={28} fill={CYAN} opacity={0.08} filter="url(#dotGlow)" />
        <circle cx={dotX} cy={dotY} r={14} fill={CYAN} opacity={0.2} />
        <circle cx={dotX} cy={dotY} r={8} fill={CYAN} opacity={0.95} />

        {/* Loop nodes */}
        {LOOP_STEPS.map((node, i) => {
          const rad = (node.angle - 90) * Math.PI / 180;
          const nx = cx + R * Math.cos(rad);
          const ny = cy + R * Math.sin(rad);
          const pop = spring({ frame: frame - i * 8, fps, from: 0, to: 1, config: { damping: 13, stiffness: 115 } });
          const pulse = 0.7 + 0.3 * Math.sin((frame / fps * 1.5 + i * 1.57) * Math.PI);
          const nr = 32 * pop;

          const labelY = node.angle === 270 ? ny - nr - 18 : node.angle === 90 ? ny + nr + 32 : ny - 10;
          const subY = node.angle === 270 ? ny - nr - 40 : node.angle === 90 ? ny + nr + 56 : ny + 14;
          const labelAnchor = node.angle === 0 ? 'start' : node.angle === 180 ? 'end' : 'middle';
          const labelX = node.angle === 0 ? nx + nr + 12 : node.angle === 180 ? nx - nr - 12 : nx;

          return (
            <g key={i}>
              <circle cx={nx} cy={ny} r={nr * 1.9} fill={node.color} opacity={0.06 * pop} />
              <circle cx={nx} cy={ny} r={nr * pulse * 0.55} fill={node.color} opacity={0.11 * pop} />
              <circle cx={nx} cy={ny} r={nr}
                fill={BG} stroke={node.color} strokeWidth={2.5} opacity={pop} />
              <text x={labelX} y={labelY}
                textAnchor={node.angle === 0 ? 'start' as const : node.angle === 180 ? 'end' as const : 'middle' as const}
                fill={node.color} fontSize={w * 0.014} fontFamily="monospace"
                fontWeight="bold" letterSpacing={2} opacity={pop}>{node.label}</text>
              <text x={node.angle === 0 ? nx + nr + 12 : node.angle === 180 ? nx - nr - 12 : nx}
                y={subY}
                textAnchor={node.angle === 0 ? 'start' as const : node.angle === 180 ? 'end' as const : 'middle' as const}
                fill="rgba(255,255,255,0.4)"
                fontSize={w * 0.009} fontFamily="sans-serif" opacity={pop}>{node.sub}</text>
            </g>
          );
        })}

        {/* Center */}
        <text x={cx} y={cy - 14} textAnchor="middle"
          fill="white" fontSize={w * 0.022} fontFamily="monospace"
          fontWeight="bold" letterSpacing={4} opacity={centerOp}>CONTINUOUS</text>
        <text x={cx} y={cy + 22} textAnchor="middle"
          fill={CYAN} fontSize={w * 0.017} fontFamily="monospace"
          letterSpacing={5} opacity={centerOp}>IMPROVEMENT</text>
      </svg>

      <SceneBadge num="04" title="THE LEARNING LOOP" color={GREEN} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 6 — END CARD
// ─────────────────────────────────────────────────────────────────────────────
const SceneEnd: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const scale = spring({ frame, fps, from: 0.84, to: 1, config: { damping: 22, stiffness: 90 } });
  const subOp = interpolate(frame, [50, 75], [0, 1], { extrapolateRight: 'clamp' });
  const ringOp = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: 'clamp' });
  const lineW = interpolate(frame, [48, 78], [0, 480], { extrapolateRight: 'clamp' });

  const tag = 'AUTOMATE. LEARN. EVOLVE.';
  const tagChars = Math.floor(interpolate(frame, [12, 58], [0, tag.length], { extrapolateRight: 'clamp' }));

  return (
    <AbsoluteFill style={{ opacity: fadeIn, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Radial glow background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 50%, ${PURPLE}2e 0%, ${CYAN}12 38%, transparent 68%)`,
      }} />

      {/* Decorative rings */}
      <svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0, opacity: ringOp }}>
        {[380, 490, 600, 710].map((r, i) => (
          <circle key={i} cx={w / 2} cy={h / 2} r={r}
            fill="none"
            stroke={[CYAN, PURPLE, ORANGE, CYAN][i]}
            strokeWidth={0.6}
            opacity={0.12 - i * 0.02}
            strokeDasharray="4 22" />
        ))}
        {/* Cross lines */}
        <line x1={w * 0.5} y1={h * 0.04} x2={w * 0.5} y2={h * 0.28}
          stroke={CYAN} strokeWidth={0.5} opacity={0.18} />
        <line x1={w * 0.5} y1={h * 0.72} x2={w * 0.5} y2={h * 0.96}
          stroke={CYAN} strokeWidth={0.5} opacity={0.18} />
      </svg>

      {/* Main content */}
      <div style={{ transform: `scale(${scale})`, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Tagline with gradient */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '1.2em' }}>
          <span style={{
            fontSize: `${w * 0.056}px`, fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 900,
            letterSpacing: '0.1em',
            background: `linear-gradient(135deg, ${CYAN}, ${PURPLE}, ${ORANGE})`,
            WebkitBackgroundClip: 'text', color: 'transparent', lineHeight: 1,
          }}>
            {tag.slice(0, tagChars)}
          </span>
          {tagChars < tag.length && (
            <span style={{ color: CYAN, fontSize: `${w * 0.056}px`, fontWeight: 900 }}>▌</span>
          )}
        </div>

        {/* Divider */}
        <div style={{
          width: lineW, height: 1.5,
          background: `linear-gradient(90deg, transparent, ${CYAN}, ${PURPLE}, transparent)`,
          margin: '28px auto',
          boxShadow: `0 0 14px ${CYAN}55`,
        }} />

        {/* Subtitle */}
        <div style={{
          color: 'rgba(255,255,255,0.4)', fontSize: `${w * 0.013}px`,
          fontFamily: 'monospace', letterSpacing: '0.28em', opacity: subOp,
        }}>
          THE FUTURE OF WORK IS INTELLIGENT AUTOMATION
        </div>

        {/* Tech stack pills */}
        <div style={{
          display: 'flex', gap: 14, marginTop: 32, justifyContent: 'center',
          opacity: interpolate(frame, [68, 85], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          {['MACHINE LEARNING', 'DEEP LEARNING', 'REINFORCEMENT LEARNING', 'LLMs'].map((item, i) => (
            <div key={i} style={{
              color: [CYAN, PURPLE, GREEN, ORANGE][i],
              border: `1px solid ${[CYAN, PURPLE, GREEN, ORANGE][i]}44`,
              background: `${[CYAN, PURPLE, GREEN, ORANGE][i]}0d`,
              padding: '5px 12px', borderRadius: 3, fontFamily: 'monospace',
              fontSize: `${w * 0.009}px`, letterSpacing: '0.18em',
            }}>{item}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPOSITION — 660 frames / 22s @ 30fps
// ─────────────────────────────────────────────────────────────────────────────
export const AIAutomationVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: w, height: h, durationInFrames } = useVideoConfig();
  const bgFade = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* Persistent starfield */}
      <div style={{ opacity: bgFade }}>
        <Starfield w={w} h={h} />
      </div>

      {/* Scene 1: Intro */}
      <Sequence from={0} durationInFrames={120}>
        <SceneIntro w={w} h={h} />
      </Sequence>

      {/* Scene 2: Data Ingestion */}
      <Sequence from={100} durationInFrames={150}>
        <SceneData w={w} h={h} />
      </Sequence>

      {/* Scene 3: AI Processing */}
      <Sequence from={230} durationInFrames={160}>
        <SceneProcessing w={w} h={h} />
      </Sequence>

      {/* Scene 4: Automated Outputs */}
      <Sequence from={360} durationInFrames={150}>
        <SceneOutputs w={w} h={h} />
      </Sequence>

      {/* Scene 5: Learning Loop */}
      <Sequence from={480} durationInFrames={120}>
        <SceneLoop w={w} h={h} />
      </Sequence>

      {/* Scene 6: End Card */}
      <Sequence from={570} durationInFrames={90}>
        <SceneEnd w={w} h={h} />
      </Sequence>

      {/* Progress bar */}
      <svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        <rect x={0} y={h - 3} width={(frame / (durationInFrames - 1)) * w} height={3}
          fill={`url(#pgGrad)`} opacity={0.55} />
        <defs>
          <linearGradient id="pgGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={CYAN} />
            <stop offset="50%" stopColor={PURPLE} />
            <stop offset="100%" stopColor={ORANGE} />
          </linearGradient>
        </defs>
      </svg>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.62) 100%)',
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};
