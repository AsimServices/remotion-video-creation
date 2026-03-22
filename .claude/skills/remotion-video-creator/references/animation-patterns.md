# Animation Patterns Reference

Copy-paste ready patterns for common Remotion animations.

---

## Typewriter Text

```tsx
const TypeWriter: React.FC<{ text: string; startFrame: number; durationFrames?: number }> = ({
  text, startFrame, durationFrames = 60,
}) => {
  const frame = useCurrentFrame();
  const chars = Math.floor(
    Math.min(text.length, Math.max(0,
      interpolate(frame, [startFrame, startFrame + durationFrames], [0, text.length])
    ))
  );
  return <span>{text.slice(0, chars)}</span>;
};
```

---

## Animated Number Counter

```tsx
const Counter: React.FC<{ from: number; to: number; startFrame: number; duration?: number; prefix?: string; suffix?: string }> = ({
  from, to, startFrame, duration = 60, prefix = '', suffix = '',
}) => {
  const frame = useCurrentFrame();
  const value = Math.round(
    Math.min(to, Math.max(from,
      interpolate(frame, [startFrame, startFrame + duration], [from, to], {
        easing: Easing.out(Easing.cubic),
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    ))
  );
  return <span>{prefix}{value.toLocaleString()}{suffix}</span>;
};
```

---

## SVG Path Drawing (stroke-dashoffset technique)

```tsx
const DrawingPath: React.FC<{ d: string; color: string; length: number; startFrame: number; duration?: number }> = ({
  d, color, length, startFrame, duration = 60,
}) => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, Math.max(0, interpolate(frame, [startFrame, startFrame + duration], [0, 1])));
  const offset = length * (1 - progress);
  return (
    <path
      d={d}
      stroke={color}
      strokeWidth={4}
      fill="none"
      strokeDasharray={length}
      strokeDashoffset={offset}
      strokeLinecap="round"
    />
  );
};
```

---

## Progress Bar

```tsx
const ProgressBar: React.FC<{ percent: number; color: string; startFrame: number; duration?: number; height?: number }> = ({
  percent, color, startFrame, duration = 45, height = 12,
}) => {
  const frame = useCurrentFrame();
  const w = Math.min(percent, Math.max(0, interpolate(frame, [startFrame, startFrame + duration], [0, percent], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })));
  return (
    <div style={{ width: '100%', height, background: `${color}22`, borderRadius: height }}>
      <div style={{ width: `${w}%`, height: '100%', background: color, borderRadius: height,
        boxShadow: `0 0 12px ${color}` }} />
    </div>
  );
};
```

---

## Strikethrough Animation

```tsx
const Strikethrough: React.FC<{ children: React.ReactNode; startFrame: number; color?: string }> = ({
  children, startFrame, color = '#EF4444',
}) => {
  const frame = useCurrentFrame();
  const w = Math.min(100, Math.max(0, interpolate(frame, [startFrame, startFrame + 25], [0, 100])));
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      <div style={{
        position: 'absolute', left: 0, top: '52%',
        height: 10, width: `${w}%`,
        background: color, borderRadius: 5,
        boxShadow: `0 0 20px ${color}88`,
      }} />
    </div>
  );
};
```

---

## Bar Chart Reveal (vertical bars)

```tsx
type Bar = { label: string; value: number; color: string };

const BarChart: React.FC<{ bars: Bar[]; maxValue: number; startFrame: number; height?: number }> = ({
  bars, maxValue, startFrame, height = 400,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, height }}>
      {bars.map((bar, i) => {
        const pct = Math.min(bar.value / maxValue, Math.max(0,
          interpolate(frame, [startFrame + i * 10, startFrame + i * 10 + 40], [0, bar.value / maxValue], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          })
        ));
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 48, color: bar.color, fontWeight: 700 }}>{bar.value}</div>
            <div style={{
              width: 80, height: height * pct,
              background: `linear-gradient(to top, ${bar.color}, ${bar.color}88)`,
              borderRadius: '8px 8px 0 0',
              boxShadow: `0 0 20px ${bar.color}44`,
            }} />
            <div style={{ fontSize: 44, color: '#94A3B8' }}>{bar.label}</div>
          </div>
        );
      })}
    </div>
  );
};
```

---

## Flowing Particle Connection Between Two Points

```tsx
const FLOW_OFFSETS = [0, 1/5, 2/5, 3/5, 4/5];

const FlowLine: React.FC<{ x1: number; y1: number; x2: number; y2: number; color: string; opacity: number }> = ({
  x1, y1, x2, y2, color, opacity,
}) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={3} opacity={opacity * 0.5} strokeDasharray="16 8" />
      {FLOW_OFFSETS.map((offset, i) => {
        const t = ((frame * 0.015 + offset) % 1 + 1) % 1;
        const px = x1 + (x2 - x1) * t;
        const py = y1 + (y2 - y1) * t;
        const pOp = opacity * Math.abs(Math.sin(t * Math.PI));
        return <circle key={i} cx={px} cy={py} r={7} fill={color} opacity={pOp} />;
      })}
    </g>
  );
};
```

---

## Staggered List Reveal

```tsx
const StaggerList: React.FC<{ items: string[]; startFrame: number; stagger?: number; color?: string }> = ({
  items, startFrame, stagger = 15, color = '#94A3B8',
}) => {
  const frame = useCurrentFrame();
  return (
    <div>
      {items.map((item, i) => {
        const delay = startFrame + i * stagger;
        const op = Math.min(1, Math.max(0, interpolate(frame, [delay, delay + 15], [0, 1])));
        const x = interpolate(frame, [delay, delay + 20], [-60, 0], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });
        return (
          <div key={i} style={{ opacity: op, transform: `translateX(${x}px)`,
            display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 60, color }}>{item}</span>
          </div>
        );
      })}
    </div>
  );
};
```

---

## Pulsing Glow Ring

```tsx
const PulseRing: React.FC<{ cx: number; cy: number; r: number; color: string }> = ({ cx, cy, r, color }) => {
  const frame = useCurrentFrame();
  const pulse = r + 15 * Math.abs(Math.sin(frame * 0.05));
  return (
    <>
      <circle cx={cx} cy={cy} r={pulse + 30} fill={`${color}11`} />
      <circle cx={cx} cy={cy} r={pulse} fill="none" stroke={color} strokeWidth={3} opacity={0.4} />
      <circle cx={cx} cy={cy} r={r} fill="#061728" stroke={color} strokeWidth={4} />
    </>
  );
};
```
