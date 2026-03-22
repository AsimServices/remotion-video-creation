# Scene Templates Reference

Complete, copy-paste scene boilerplate. Each template is self-contained — it uses `useCurrentFrame()` relative to its `<Sequence>` start, so frame 0 inside a scene is always the beginning of that scene.

---

## Hook / Attention-Grab Scene

**Purpose:** First 3–5 seconds. Stop the scroll. One bold statement.

```tsx
const SceneHook: React.FC<{ headline: string; subtext: string; accent: string }> = ({
  headline, subtext, accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, from: 0.75, to: 1, config: { stiffness: 80, damping: 14 } });
  const op = Math.min(1, Math.max(0, interpolate(frame, [0, 20], [0, 1])));
  const subOp = Math.min(1, Math.max(0, interpolate(frame, [25, 45], [0, 1])));
  const subY = interpolate(
    spring({ frame, fps, from: 40, to: 0, config: { stiffness: 80, damping: 14 }, delay: 25 }),
    [0, 40], [0, 40], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const sceneOut = Math.min(1, Math.max(0, interpolate(frame, [90, 110], [1, 0])));

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', opacity: sceneOut }}>
      <RadialGlow cx="50%" cy="50%" color={accent} opacity={0.5} size="70%" />
      <div style={{ textAlign: 'center', opacity: op, transform: `scale(${scale})` }}>
        <div style={{ fontSize: 200, fontWeight: 900, color: '#F8FAFC', letterSpacing: -6, lineHeight: 1 }}>
          {headline}
        </div>
      </div>
      <div style={{ opacity: subOp, transform: `translateY(${subY}px)`, marginTop: 40,
        fontSize: 80, color: accent, fontWeight: 400, letterSpacing: 8 }}>
        {subtext}
      </div>
    </AbsoluteFill>
  );
};
```

---

## Problem / Pain Scene

**Purpose:** Show what's broken, frustrating, or inefficient. Creates emotional tension.

```tsx
const SceneProblem: React.FC<{ title: string; steps: Array<{ icon: string; text: string }>; statValue: string; statLabel: string }> = ({
  title, steps, statValue, statLabel,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = Math.min(1, Math.max(0, interpolate(frame, [0, 20], [0, 1])));
  const sceneOut = Math.min(1, Math.max(0, interpolate(frame, [115, 135], [1, 0])));
  const statScale = spring({ frame, fps, from: 0.5, to: 1, config: { stiffness: 120, damping: 12 }, delay: 70 });
  const statOp = Math.min(1, Math.max(0, interpolate(frame, [70, 90], [0, 1])));

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', padding: '120px 240px', opacity: sceneOut }}>
      <RadialGlow cx="75%" cy="25%" color="#EF4444" opacity={0.3} size="50%" />

      <div style={{ opacity: headerOp, marginBottom: 60 }}>
        <div style={{ fontSize: 72, color: '#64748B', letterSpacing: 10, fontWeight: 300, marginBottom: 16 }}>
          THE PROBLEM
        </div>
        <div style={{ fontSize: 130, fontWeight: 900, color: '#EF4444', letterSpacing: -3 }}>{title}</div>
      </div>

      <div style={{ display: 'flex', gap: 80, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {steps.map((step, i) => {
            const delay = 15 + i * 18;
            const stepOp = Math.min(1, Math.max(0, interpolate(frame, [delay, delay + 15], [0, 1])));
            const stepX = interpolate(frame, [delay, delay + 20], [-80, 0], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 32,
                opacity: stepOp, transform: `translateX(${stepX}px)`,
                padding: '24px 40px', marginBottom: 16,
                background: 'rgba(239,68,68,0.07)', border: '2px solid rgba(239,68,68,0.2)', borderRadius: 20 }}>
                <span style={{ fontSize: 60 }}>{step.icon}</span>
                <span style={{ fontSize: 60, color: '#94A3B8' }}>{step.text}</span>
              </div>
            );
          })}
        </div>

        {/* Stat callout */}
        <div style={{ padding: '60px 70px', background: 'rgba(6,23,40,0.85)',
          border: '2px solid rgba(239,68,68,0.4)', borderRadius: 32,
          opacity: statOp, transform: `scale(${statScale})`, textAlign: 'center', minWidth: 500 }}>
          <div style={{ fontSize: 200, fontWeight: 900, color: '#EF4444', lineHeight: 1 }}>{statValue}</div>
          <div style={{ fontSize: 65, color: '#94A3B8', marginTop: 16 }}>{statLabel}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

---

## Solution Reveal Scene

**Purpose:** Introduce the system, product, or approach. Dual-card layout works well here.

```tsx
type SolutionCard = { number: number; title: string; subtitle: string; bullets: string[]; accent: string };

const SceneSolution: React.FC<{ headline: string; cards: SolutionCard[] }> = ({ headline, cards }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = Math.min(1, Math.max(0, interpolate(frame, [0, 20], [0, 1])));
  const headerScale = spring({ frame, fps, from: 0.8, to: 1, config: { stiffness: 80, damping: 14 } });
  const sceneOut = Math.min(1, Math.max(0, interpolate(frame, [130, 150], [1, 0])));

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', padding: '100px 200px', opacity: sceneOut }}>
      <RadialGlow cx="50%" cy="30%" color="#7C3AED" opacity={0.5} size="60%" />

      <div style={{ textAlign: 'center', marginBottom: 80,
        opacity: headerOp, transform: `scale(${headerScale})` }}>
        <div style={{ fontSize: 68, color: '#64748B', letterSpacing: 12, fontWeight: 300, marginBottom: 20 }}>
          THE SOLUTION
        </div>
        <div style={{ fontSize: 155, fontWeight: 900, color: '#F8FAFC', letterSpacing: -4 }}>{headline}</div>
      </div>

      <div style={{ display: 'flex', gap: 60 }}>
        {cards.map((card, ci) => {
          const delay = 25 + ci * 25;
          const cardOp = Math.min(1, Math.max(0, interpolate(frame, [delay, delay + 20], [0, 1])));
          const cardY = interpolate(
            spring({ frame, fps, from: 80, to: 0, config: { stiffness: 80, damping: 13 }, delay }),
            [0, 80], [0, 80], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          return (
            <div key={ci} style={{ flex: 1, padding: '70px', background: 'rgba(6,23,40,0.85)',
              border: `2px solid ${card.accent}44`, borderRadius: 32,
              boxShadow: `0 0 60px ${card.accent}22`,
              opacity: cardOp, transform: `translateY(${cardY}px)` }}>
              <div style={{ width: 110, height: 110, borderRadius: '50%',
                background: `linear-gradient(135deg, ${card.accent}, ${card.accent}88)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 70, fontWeight: 900, color: '#F8FAFC', marginBottom: 40,
                boxShadow: `0 0 40px ${card.accent}66` }}>
                {card.number}
              </div>
              <div style={{ fontSize: 85, fontWeight: 800, color: '#F8FAFC', marginBottom: 16, lineHeight: 1.1 }}>
                {card.title}
              </div>
              <div style={{ fontSize: 60, color: card.accent, marginBottom: 48 }}>{card.subtitle}</div>
              {card.bullets.map((b, bi) => {
                const bOp = Math.min(1, Math.max(0,
                  interpolate(frame, [delay + 20 + bi * 12, delay + 35 + bi * 12], [0, 1])));
                return (
                  <div key={bi} style={{ display: 'flex', alignItems: 'center', gap: 20,
                    marginBottom: 24, opacity: bOp }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: card.accent,
                      boxShadow: `0 0 10px ${card.accent}`, flexShrink: 0 }} />
                    <span style={{ fontSize: 56, color: '#94A3B8' }}>{b}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
```

---

## Pipeline / Flow Diagram Scene

**Purpose:** Show how data, steps, or actors connect. Node graph with flowing particles.

```tsx
type FlowNode = { id: string; label: string; sublabel: string; color: string; x: number; y: number };
// x, y are 0–1 fractions of width/height

const ScenePipeline: React.FC<{ headline: string; nodes: FlowNode[]; connections: Array<[number, number]>; callout?: string }> = ({
  headline, nodes, connections, callout,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const headerOp = Math.min(1, Math.max(0, interpolate(frame, [0, 20], [0, 1])));
  const sceneOut = Math.min(1, Math.max(0, interpolate(frame, [130, 150], [1, 0])));

  const nodeScales = nodes.map((_, i) =>
    spring({ frame, fps, from: 0, to: 1, config: { stiffness: 90, damping: 12 }, delay: i * 20 })
  );

  const pts = nodes.map(n => ({ ...n, cx: n.x * width, cy: n.y * height }));
  const NODE_R = 100;
  const FLOW_OFFSETS = [0, 0.2, 0.4, 0.6, 0.8];

  return (
    <AbsoluteFill style={{ opacity: sceneOut }}>
      <RadialGlow cx="50%" cy="50%" color="#0A66C2" opacity={0.3} size="80%" />

      {/* Header */}
      <div style={{ position: 'absolute', top: 80, left: 0, right: 0,
        textAlign: 'center', opacity: headerOp }}>
        <div style={{ fontSize: 68, color: '#64748B', letterSpacing: 12, fontWeight: 300 }}>THE ENGINE</div>
        <div style={{ fontSize: 140, fontWeight: 900, color: '#F8FAFC', letterSpacing: -3 }}>{headline}</div>
      </div>

      {/* SVG layer — connections + nodes */}
      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
        {connections.map(([fi, ti], ci) => {
          const f = pts[fi]; const t = pts[ti];
          const lineOp = Math.min(0.6, Math.max(0, interpolate(frame, [ci * 15 + 20, ci * 15 + 50], [0, 0.6])));
          return (
            <g key={ci}>
              <line x1={f.cx} y1={f.cy} x2={t.cx} y2={t.cy}
                stroke={f.color} strokeWidth={4} opacity={lineOp} strokeDasharray="20 10" />
              {FLOW_OFFSETS.map((off, pi) => {
                const progress = ((frame * 0.015 + off + ci * 0.25) % 1 + 1) % 1;
                const px = f.cx + (t.cx - f.cx) * progress;
                const py = f.cy + (t.cy - f.cy) * progress;
                return <circle key={pi} cx={px} cy={py} r={8} fill={f.color}
                  opacity={lineOp * Math.abs(Math.sin(progress * Math.PI))} />;
              })}
            </g>
          );
        })}

        {pts.map((n, i) => {
          const s = nodeScales[i];
          const pulse = NODE_R + 18 * Math.abs(Math.sin(frame * 0.04 + i));
          return (
            <g key={n.id} transform={`translate(${n.cx}, ${n.cy}) scale(${s})`}>
              <circle cx={0} cy={0} r={pulse + 50} fill={n.color} opacity={0.08} />
              <circle cx={0} cy={0} r={NODE_R + 8} fill="none" stroke={n.color} strokeWidth={3} opacity={0.35} />
              <circle cx={0} cy={0} r={NODE_R} fill="#061728" stroke={n.color} strokeWidth={4} />
            </g>
          );
        })}
      </svg>

      {/* Node labels */}
      {pts.map((n, i) => {
        const s = nodeScales[i];
        const isTop = n.y < 0.5;
        const labelOp = Math.min(1, Math.max(0, interpolate(frame, [i * 20 + 20, i * 20 + 40], [0, 1])));
        return (
          <div key={n.id} style={{
            position: 'absolute',
            left: n.cx, top: isTop ? n.cy * height - 180 : n.cy * height + 130,
            transform: `translateX(-50%) scale(${s})`,
            textAlign: 'center', opacity: labelOp,
          }}>
            <div style={{ fontSize: 72, fontWeight: 800, color: n.color }}>{n.label}</div>
            <div style={{ fontSize: 52, color: '#64748B' }}>{n.sublabel}</div>
          </div>
        );
      })}

      {/* Optional callout bar */}
      {callout && (
        <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center',
          opacity: Math.min(1, Math.max(0, interpolate(frame, [100, 120], [0, 1]))) }}>
          <div style={{ display: 'inline-block', padding: '32px 72px',
            background: 'rgba(6,23,40,0.85)', border: '2px solid #F59E0B44', borderRadius: 20 }}>
            <span style={{ fontSize: 60, color: '#F59E0B', fontWeight: 700 }}>{callout}</span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
```

---

## ROI / Cost Comparison Scene

**Purpose:** Make the value proposition undeniable with a side-by-side comparison.

```tsx
const SceneROI: React.FC<{
  headline: string;
  winnerLabel: string; winnerAmount: string; winnerNote: string; winnerAccent: string;
  loserLabel: string; loserAmount: string; loserNote: string;
  savingsText: string;
}> = ({ headline, winnerLabel, winnerAmount, winnerNote, winnerAccent,
       loserLabel, loserAmount, loserNote, savingsText }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = Math.min(1, Math.max(0, interpolate(frame, [0, 20], [0, 1])));
  const sceneOut = Math.min(1, Math.max(0, interpolate(frame, [100, 120], [1, 0])));
  const vsScale = spring({ frame, fps, from: 0, to: 1, config: { stiffness: 100, damping: 10 }, delay: 40 });

  const makeCard = (label: string, amount: string, note: string, accent: string, delay: number, isWinner: boolean) => {
    const cardOp = Math.min(1, Math.max(0, interpolate(frame, [delay, delay + 20], [0, 1])));
    const cardScale = spring({ frame, fps, from: 0.7, to: isWinner ? 1.05 : 0.95,
      config: { stiffness: 80, damping: 12 }, delay });
    return (
      <div style={{ flex: 1, padding: '80px 70px', background: 'rgba(6,23,40,0.85)',
        border: `2px solid ${accent}44`, borderRadius: 32,
        opacity: cardOp, transform: `scale(${cardScale})`, textAlign: 'center' }}>
        {isWinner && (
          <div style={{ fontSize: 50, color: accent, fontWeight: 700, letterSpacing: 6,
            marginBottom: 30, background: `${accent}22`, borderRadius: 12,
            padding: '12px 28px', display: 'inline-block' }}>
            ✓ THIS SYSTEM
          </div>
        )}
        <div style={{ fontSize: 68, color: '#64748B', letterSpacing: 8, fontWeight: 300, marginBottom: 24 }}>{label}</div>
        <div style={{ fontSize: 190, fontWeight: 900, lineHeight: 1, color: accent }}>{amount}</div>
        <div style={{ fontSize: 62, color: '#94A3B8', marginTop: 20 }}>per month</div>
        <div style={{ marginTop: 40, padding: '24px 32px', background: `${accent}11`,
          borderRadius: 16, fontSize: 52, color: '#64748B' }}>{note}</div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', padding: '100px 200px', opacity: sceneOut }}>
      <div style={{ textAlign: 'center', opacity: headerOp, marginBottom: 80 }}>
        <div style={{ fontSize: 68, color: '#64748B', letterSpacing: 12, fontWeight: 300, marginBottom: 16 }}>THE MATH</div>
        <div style={{ fontSize: 145, fontWeight: 900, color: '#F8FAFC', letterSpacing: -3 }}>{headline}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 60 }}>
        {makeCard(winnerLabel, winnerAmount, winnerNote, winnerAccent, 20, true)}
        <div style={{ fontSize: 200, fontWeight: 900, color: '#64748B', transform: `scale(${vsScale})`, flexShrink: 0 }}>VS</div>
        {makeCard(loserLabel, loserAmount, loserNote, '#EF4444', 40, false)}
      </div>
      <div style={{ marginTop: 60, textAlign: 'center',
        opacity: Math.min(1, Math.max(0, interpolate(frame, [90, 110], [0, 1]))) }}>
        <div style={{ display: 'inline-block', padding: '32px 80px',
          background: 'rgba(6,23,40,0.85)', border: `2px solid ${winnerAccent}44`, borderRadius: 20 }}>
          <span style={{ fontSize: 72, color: winnerAccent, fontWeight: 700 }}>{savingsText}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

---

## CTA / Brand Close Scene

**Purpose:** Last scene. Brand identity + clear single call to action.

```tsx
const SceneCTA: React.FC<{
  brandName: string;
  headline: string;
  tagline: string;
  domain: string;
  bullets: Array<{ icon: string; text: string; color: string }>;
  accent: string;
}> = ({ brandName, headline, tagline, domain, bullets, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = Math.min(1, Math.max(0, interpolate(frame, [0, 30], [0, 1])));
  const logoScale = spring({ frame, fps, from: 0, to: 1, config: { stiffness: 70, damping: 14 } });
  const ctaOp = Math.min(1, Math.max(0, interpolate(frame, [30, 55], [0, 1])));
  const ctaY = interpolate(
    spring({ frame, fps, from: 60, to: 0, config: { stiffness: 80, damping: 14 }, delay: 30 }),
    [0, 60], [0, 60], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', opacity: bgOp }}>
      <GridBg opacity={0.12} />
      <RadialGlow cx="50%" cy="50%" color={accent} opacity={0.5} size="80%" />

      {/* Brand badge */}
      <div style={{ transform: `scale(${logoScale})`, textAlign: 'center', marginBottom: 56 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 24,
          padding: '24px 56px', background: `linear-gradient(135deg, ${accent}22, #7C3AED22)`,
          border: `3px solid ${accent}55`, borderRadius: 24,
          boxShadow: `0 0 80px ${accent}33` }}>
          <div style={{ width: 72, height: 72, borderRadius: 14,
            background: `linear-gradient(135deg, ${accent}, #7C3AED)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>⚡</div>
          <span style={{ fontSize: 68, fontWeight: 700, color: '#F8FAFC', letterSpacing: 2 }}>{brandName}</span>
        </div>
      </div>

      {/* Main CTA */}
      <div style={{ textAlign: 'center', opacity: ctaOp, transform: `translateY(${ctaY}px)` }}>
        <div style={{ fontSize: 175, fontWeight: 900, color: '#F8FAFC', lineHeight: 1, letterSpacing: -4 }}>
          {headline}
        </div>
        <div style={{ fontSize: 75, color: '#94A3B8', marginTop: 24, fontWeight: 300 }}>{tagline}</div>
      </div>

      {/* Bullet pills */}
      <div style={{ marginTop: 70, display: 'flex', gap: 48 }}>
        {bullets.map((b, i) => {
          const bOp = Math.min(1, Math.max(0, interpolate(frame, [50 + i * 15, 65 + i * 15], [0, 1])));
          return (
            <div key={i} style={{ opacity: bOp, display: 'flex', alignItems: 'center', gap: 18,
              padding: '26px 44px', background: `${b.color}11`,
              border: `2px solid ${b.color}44`, borderRadius: 20 }}>
              <span style={{ fontSize: 58 }}>{b.icon}</span>
              <span style={{ fontSize: 56, color: '#94A3B8', fontWeight: 500 }}>{b.text}</span>
            </div>
          );
        })}
      </div>

      {/* Domain */}
      <div style={{ marginTop: 56, fontSize: 62, color: accent, fontWeight: 600, letterSpacing: 3,
        opacity: Math.min(1, Math.max(0, interpolate(frame, [85, 105], [0, 1]))) }}>
        {domain}
      </div>
    </AbsoluteFill>
  );
};
```
