---
name: remotion-video-creator
description: High-level guide for creating professional Remotion video components from scratch. Use when the user wants to create a new video, animate content, build a social media video, explainer video, or data visualization video using Remotion React components. Covers scene planning, component architecture, animation design, visual systems, 4K rendering, and Root.tsx registration.
argument-hint: [description of video to create, content source, or target platform]
allowed-tools: Read Write Edit Bash Glob Grep
---

# Remotion Video Creator Skill

A structured guide for turning a content brief or idea into a polished, rendered Remotion video component — from first concept to final MP4.

---

## How This Skill Works

1. **Analyze the request** → Determine video type, content, platform, duration
2. **Plan scenes** → Design a timeline using `<Sequence>` blocks
3. **Choose a visual system** → Colors, typography, animation style
4. **Build the component** → Write deterministic, frame-driven React/TSX
5. **Register in Root.tsx** → Add `<Composition>` entry
6. **Render video** → Type-check and render full MP4 directly

---

## Step 1 — Analyze the Request

Before writing a single line of code, answer these questions from the user's brief:

| Question | Why It Matters |
|---|---|
| **What is the content?** | Drives scene structure and messaging |
| **Who is the audience?** | Tone, complexity, visual style |
| **What platform?** | Aspect ratio, duration limits |
| **What is the goal?** | Engagement hook, brand awareness, explainer, CTA |
| **Is there a brand?** | Colors, logo, fonts |

### Platform Reference

| Platform | Resolution | Aspect Ratio | Max Duration |
|---|---|---|---|
| LinkedIn / YouTube | 3840×2160 (4K) | 16:9 | Any |
| Instagram Feed | 1080×1080 | 1:1 | 60s |
| Instagram / TikTok Reels | 1080×1920 | 9:16 | 90s |
| Twitter / X | 1920×1080 | 16:9 | 140s |
| YouTube Shorts | 1080×1920 | 9:16 | 60s |

**Default for social media branding: 3840×2160 @ 30fps**

---

## Step 2 — Determine Video Type

Choose one of the archetypes below. Load the matching guide from `references/` for deeper patterns.

```
User Request → Video Type Decision
─────────────────────────────────────────────────────────────────
"social media", "branding", "LinkedIn post"  → Brand Story Video
"explain how X works", "tutorial"            → Explainer Video
"stats", "data", "chart", "numbers"         → Data Visualization Video
"product launch", "announcement"            → Product Reveal Video
"showcase", "portfolio"                     → Showcase Video
"logo reveal", "intro"                      → Motion Brand ID
```

### Brand Story Video (most common)
- Hook → Problem → Solution → Proof → CTA
- Duration: 20–30 seconds (600–900 frames @ 30fps)
- Heavy typography, stat callouts, glassmorphism cards

### Explainer Video
- Concept intro → How it works (step by step) → Benefits → CTA
- Duration: 30–60 seconds
- Diagrams, icons, animated flow lines

### Data Visualization Video
- Title card → Chart/graph reveal → Insight callout → CTA
- Duration: 15–25 seconds
- Animated counters, bar/line charts, SVG paths

---

## Step 3 — Plan Scenes (Timeline First)

**Always plan the timeline BEFORE writing code.** Scenes are the atomic units of a video.

### Scene Planning Template

```
Total: [N] frames = [N/30] seconds @ 30fps

Scene 1: [Name]       frames 0–[n]       [n/30]s  — [what happens]
Scene 2: [Name]       frames [n]–[m]     [x]s     — [what happens]
Scene 3: [Name]       frames [m]–[p]     [x]s     — [what happens]
...
Scene N: CTA/Brand    frames [p]–[end]   [x]s     — brand + call to action
```

### Scene Timing Guidelines

| Scene Type | Recommended Duration |
|---|---|
| Hook / Attention grab | 3–5 seconds (90–150 frames) |
| Problem / Context | 4–6 seconds (120–180 frames) |
| Solution / System reveal | 4–6 seconds (120–180 frames) |
| Animated diagram / flow | 4–6 seconds (120–180 frames) |
| Stat / Proof callout | 3–4 seconds (90–120 frames) |
| CTA / Brand close | 3–4 seconds (90–120 frames) |

### Rules
- Every scene should have a clear purpose — cut anything that doesn't serve the message
- Scenes can overlap slightly for continuity (stagger `from` by 10–20 frames)
- Use `fadeOut` at the end of each scene for clean transitions
- The CTA scene always ends the video

---

## Step 4 — Design the Visual System

Define the visual language before any component. Copy this block at the top of every new video file.

### Color System

```tsx
// ── Brand Palette ─────────────────────────────────────────────
const COLORS = {
  bg: '#020B18',          // deep dark background
  bgMid: '#061728',       // slightly lighter layer

  // Primary accent — pick one brand color
  primary: '#0A66C2',     // LinkedIn Blue (change per project)
  primaryGlow: '#1E88E5',

  // Secondary accent
  secondary: '#7C3AED',   // Purple
  secondaryGlow: '#A78BFA',

  // Semantic
  success: '#10B981',     // Green — positive, growth
  warning: '#F59E0B',     // Gold — important, attention
  danger: '#EF4444',      // Red — problem, loss

  // Text
  white: '#F8FAFC',
  muted: '#64748B',
  light: '#94A3B8',
};
```

### Typography Scale (4K — 3840×2160)

| Role | Font Size | Weight | Letter Spacing |
|---|---|---|---|
| Hero stat / big number | 200–280px | 900 | -6 to -8 |
| Section headline | 130–160px | 900 | -3 to -4 |
| Card title | 80–100px | 800 | -2 |
| Body / bullets | 55–70px | 400–500 | 0 |
| Label / caption | 45–60px | 300 | 8–12 |

**Scale down by ~50% for 1920×1080.**

### Animation Style Guide

| Element | Animation | Config |
|---|---|---|
| Main headline | `spring` scale from 0.7→1 | `{ stiffness: 80, damping: 14 }` |
| Cards, panels | `spring` translateY from 80→0 | `{ stiffness: 80, damping: 13 }` |
| Fade in text | `interpolate` opacity 0→1 | 20–30 frame duration |
| Bullet items | Staggered `fadeIn`, 12–15f delay per item | cascade in |
| Icons / badges | `spring` scale from 0→1 | `{ stiffness: 120, damping: 10 }` |
| Scene exit | `interpolate` opacity 1→0 | last 15–20 frames |

---

## Step 5 — Build the Component

### File & Folder Convention

```
src/
└── [VideoName].tsx       # PascalCase, descriptive name
```

**Naming examples:** `LinkedInAutomationBrand.tsx`, `ProductLaunchReveal.tsx`, `Q4DataReport.tsx`

### Component Architecture

Every video file follows this structure — top to bottom:

```tsx
// 1. IMPORTS
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

// 2. COLOR CONSTANTS  — never hardcode hex inside JSX
const COLORS = { ... };

// 3. SCENE TIMING CONSTANTS  — single source of truth for all timings
const S1_START = 0;    const S1_END = 120;
const S2_START = 120;  const S2_END = 255;
// etc.
export const TOTAL_FRAMES = 780;

// 4. SHARED ANIMATION HELPERS  — reusable across scenes
const fadeIn = (frame: number, start: number, dur = 30) => ...
const fadeOut = (frame: number, end: number, dur = 20) => ...

// 5. REUSABLE UI COMPONENTS  — GlassCard, GradText, RadialGlow, etc.
const GlassCard: React.FC<{...}> = ({ ... }) => ( ... );

// 6. SCENE COMPONENTS  — one per scene block
const SceneHook: React.FC = () => { ... };
const SceneProblem: React.FC = () => { ... };
// etc.

// 7. ROOT EXPORT — assembles all scenes with <Sequence> timing
export const MyVideoName: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.bg }}>
    <Sequence from={S1_START} durationInFrames={S1_END - S1_START}>
      <SceneHook />
    </Sequence>
    <Sequence from={S2_START} durationInFrames={S2_END - S2_START}>
      <SceneProblem />
    </Sequence>
  </AbsoluteFill>
);
```

### The Golden Rules of Remotion Components

```
✅ DO                                    ❌ DON'T
────────────────────────────────────     ────────────────────────────────────
useCurrentFrame() for all animation      Math.random() — breaks determinism
interpolate() with extrapolate clamp     Date.now() — non-deterministic
spring() for natural motion              setTimeout / setInterval
<Img> for images                         <img> tag (won't wait to load)
<OffthreadVideo> for video files         <video> tag
staticFile() for public/ assets          Raw relative paths
Deterministic arrays (index-based)       Array.from({ length: N }, Math.random)
```

### Shared UI Primitives (Copy These Into Every Video)

**Radial glow (atmospheric depth):**
```tsx
const RadialGlow: React.FC<{ cx: string; cy: string; color: string; opacity: number; size?: string }> = ({
  cx, cy, color, opacity, size = '60%',
}) => (
  <div style={{
    position: 'absolute', left: cx, top: cy,
    transform: 'translate(-50%, -50%)',
    width: size, height: size, borderRadius: '50%',
    background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
    opacity,
  }} />
);
```

**Glassmorphism card:**
```tsx
const GlassCard: React.FC<{ style?: React.CSSProperties; accent?: string; children: React.ReactNode }> = ({
  style, accent = '#0A66C2', children,
}) => (
  <div style={{
    background: 'rgba(6, 23, 40, 0.85)',
    backdropFilter: 'blur(24px)',
    border: `2px solid ${accent}44`,
    borderRadius: 32,
    boxShadow: `0 0 60px ${accent}22, inset 0 1px 0 ${accent}33`,
    ...style,
  }}>
    {children}
  </div>
);
```

**Gradient text:**
```tsx
const GradText: React.FC<{ from: string; to: string; style?: React.CSSProperties; children: React.ReactNode }> = ({
  from, to, style, children,
}) => (
  <span style={{
    background: `linear-gradient(135deg, ${from}, ${to})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    ...style,
  }}>
    {children}
  </span>
);
```

**Animation helpers:**
```tsx
const fadeIn = (frame: number, start: number, duration = 30) =>
  Math.min(1, Math.max(0, interpolate(frame, [start, start + duration], [0, 1])));

const fadeOut = (frame: number, end: number, duration = 20) =>
  Math.min(1, Math.max(0, interpolate(frame, [end - duration, end], [1, 0])));
```

**Deterministic floating particles (no Math.random):**
```tsx
const PARTICLES = Array.from({ length: 50 }, (_, i) => ({
  x: ((i * 97 + 23) % 100) / 100,
  y: ((i * 61 + 11) % 100) / 100,
  r: 1.5 + (i % 5) * 0.8,
  speed: 0.25 + (i % 7) * 0.12,
  phase: (i * 43) % 628,
  color: i % 3 === 0 ? COLORS.primary : i % 3 === 1 ? COLORS.secondary : COLORS.success,
}));

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const globalOp = Math.min(1, Math.max(0, interpolate(frame, [0, 60], [0, 1])));
  return (
    <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
      {PARTICLES.map((p, i) => {
        const x = ((p.x * width + Math.sin(frame * p.speed * 0.018 + p.phase) * 80) % width + width) % width;
        const y = ((p.y * height - frame * p.speed * 0.35) % height + height) % height;
        const pulse = 0.3 + 0.5 * Math.abs(Math.sin(frame * 0.025 + p.phase));
        return <circle key={i} cx={x} cy={y} r={p.r} fill={p.color} opacity={globalOp * pulse} />;
      })}
    </svg>
  );
};
```

**Animated grid background:**
```tsx
const GridBg: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const { width, height } = useVideoConfig();
  const cols = 20, rows = 11;
  return (
    <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
      {Array.from({ length: cols + 1 }, (_, i) => (
        <line key={`v${i}`}
          x1={(i / cols) * width} y1={0} x2={(i / cols) * width} y2={height}
          stroke={COLORS.primary} strokeWidth={1} opacity={opacity} />
      ))}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <line key={`h${i}`}
          x1={0} y1={(i / rows) * height} x2={width} y2={(i / rows) * height}
          stroke={COLORS.primary} strokeWidth={1} opacity={opacity} />
      ))}
    </svg>
  );
};
```

---

## Step 6 — Register in Root.tsx

After writing the component, always add it to `src/Root.tsx`:

```tsx
// 1. Add import at the top with other imports
import { MyVideoName } from './MyVideoName';

// 2. Add <Composition> inside RemotionRoot before the closing </>
<Composition
  id="MyVideoName"
  component={MyVideoName}
  durationInFrames={TOTAL_FRAMES}   // import from the component file
  fps={30}
  width={3840}
  height={2160}
/>
```

**Registration checklist:**
- [ ] Import added at top of Root.tsx
- [ ] `<Composition>` block added inside `RemotionRoot`
- [ ] `id` matches the export name (PascalCase)
- [ ] `durationInFrames` matches `TOTAL_FRAMES` exported from component
- [ ] `width` and `height` match the target platform

---

## Step 7 — Type-check and Render

### TypeScript check

```bash
npx tsc --noEmit 2>&1 | grep "MyVideoName"
```

Zero output = clean. Fix any errors in the new file before rendering.

### Render full video directly

Do NOT render still images. Go straight to the full MP4 render:

```bash
# Standard 4K H.264 (social media compatible)
npx remotion render src/index.ts MyVideoName out/my_video_4k.mp4 --codec=h264

# Faster render (lower quality for review)
npx remotion render src/index.ts MyVideoName out/my_video_preview.mp4 --codec=h264 --scale=0.5

# Render a clip for debugging a specific scene
npx remotion render src/index.ts MyVideoName out/clip.mp4 --frames=120-255
```

---

## Patterns Reference

Load `references/animation-patterns.md` for copy-paste patterns covering:
- Typewriter text
- Animated stat counters
- SVG path drawing
- Progress bars
- Flowing particle connections
- Strikethrough animation
- Bar chart reveal
- Number count-up

Load `references/scene-templates.md` for complete scene boilerplate:
- Hook / attention-grab scene
- Problem/pain scene
- Solution reveal scene
- Pipeline/flow diagram scene
- ROI / cost comparison scene
- CTA / brand close scene

---

## Quality Checklist

Before delivering a video, verify:

**Correctness**
- [ ] No `Math.random()` or `Date.now()` inside render functions
- [ ] All `interpolate()` calls have `extrapolateLeft/Right: 'clamp'` where needed
- [ ] `useCurrentFrame()` is only called inside React components (not outside)
- [ ] `useVideoConfig()` is only called inside compositions (not inside SVG)
- [ ] TypeScript passes `npx tsc --noEmit` with zero errors in this file

**Visual quality**
- [ ] All scenes have entry animation (fade or spring in)
- [ ] All scenes have exit animation (fade out) — no hard cuts unless intentional
- [ ] Text is legible at target resolution
- [ ] Particle/background layers use `pointer-events: none`
- [ ] Radial glows are behind content layers (use `position: absolute` layering)

**Registration**
- [ ] Composition is registered in `Root.tsx`
- [ ] `durationInFrames` matches actual scene end frame
- [ ] `id` is unique across all compositions

**Rendering**
- [ ] Full video renders without errors (render MP4 directly — no stills)
- [ ] Output file exists in `out/` and is > 0 bytes

---

## Common Mistakes and Fixes

| Mistake | Symptom | Fix |
|---|---|---|
| `Math.random()` in render | Flickering / frame inconsistency | Replace with deterministic index math |
| No `clamp` on `interpolate` | Values go below 0 or above 1 | Add `extrapolateLeft: 'clamp', extrapolateRight: 'clamp'` |
| CSS `transition:` or `animation:` | Animation doesn't respect frame | Remove CSS animation — use `interpolate`/`spring` |
| `<img>` instead of `<Img>` | Image may not load before frame renders | Replace with `<Img>` from remotion |
| `useVideoConfig()` inside SVG child | Error: hook called outside component | Move to parent component, pass width/height as props |
| Missing `durationInFrames` on `<Sequence>` | Scene runs forever / overlaps next | Always specify `durationInFrames` unless it's the last scene |
| Scene component uses outer frame | All frames animate from wrong base | Frames inside `<Sequence>` are relative — `frame=0` is the scene start |
| Font too small for 4K | Unreadable text | Multiply 1080p font sizes by ×2 for 4K |

---

## Quick Reference: Spring Config Cheat Sheet

```tsx
// Snappy entrance (UI elements, cards)
{ stiffness: 100, damping: 14 }

// Bouncy pop (badges, icons, stats)
{ stiffness: 120, damping: 8 }

// Smooth, weighty (large headlines)
{ stiffness: 70, damping: 14 }

// Ultra-smooth, slow reveal
{ stiffness: 50, damping: 20 }

// No bounce, fast settle
{ stiffness: 200, damping: 30 }
```

---

## Decision Tree Summary

```
User gives a brief
      │
      ▼
Is the platform specified? ──── No ──→ Default to 4K 16:9 (3840×2160)
      │ Yes
      ▼
Map to platform resolution & aspect ratio
      │
      ▼
Identify video type (Brand / Explainer / Data / Product / Showcase)
      │
      ▼
Plan scene timeline (names, frame ranges, purpose of each scene)
      │
      ▼
Define color palette & typography scale
      │
      ▼
Write component file:
  1. Constants (colors, timings)
  2. Shared helpers (fadeIn, fadeOut)
  3. Shared UI (GlassCard, GradText, RadialGlow, Particles, GridBg)
  4. Scene components (one per scene)
  5. Root export with <Sequence> blocks
      │
      ▼
Register in Root.tsx (import + <Composition>)
      │
      ▼
Type-check: npx tsc --noEmit
      │
      ▼
Render full video directly: npx remotion render ... --codec=h264
(Do NOT render stills — go straight to MP4)
      │
      ▼
Report output path and file size to user ✓
```
