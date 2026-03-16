---
name: remotion
description: Create, edit, and render programmatic videos using Remotion (React-based video framework). Use when the user wants to build a video with code, animate components over time, render MP4/GIF/WebM, or use Remotion Studio. Covers scaffolding, compositions, animation hooks, sequences, media, and rendering.
argument-hint: [task or description of video to create]
allowed-tools: Read Write Edit Bash Glob Grep
---

# Remotion Video Skill

You are an expert in Remotion — a framework for creating videos programmatically with React. A Remotion video is a **React component that is a function of the current frame number**. Remotion renders each frame by running headless Chromium.

## Core Mental Model

- Video = a function of time (frame number)
- `useCurrentFrame()` returns the current frame (0-indexed)
- `fps` × `durationInSeconds` = `durationInFrames`
- All animation is derived from the frame number — no timers, no `useEffect` for animation

---

## Project Setup

### Scaffold a new project
```bash
npx create-video@latest
```
Choose a template when prompted (blank, hello-world, etc.).

### Install into an existing React project
```bash
npm install remotion
```

### Start the studio
```bash
npx remotion studio
# or
npm run dev  # if package.json has this script
```

---

## Project Structure

```
my-video/
├── src/
│   ├── Root.tsx          # Registers all compositions — entry point
│   ├── MyComposition.tsx # A video composition component
│   └── index.ts          # Calls registerRoot(Root)
├── public/               # Static assets (images, audio, video)
├── package.json
└── remotion.config.ts    # Optional config
```

### Root.tsx — register compositions
```tsx
import { Composition } from 'remotion';
import { MyVideo } from './MyComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyVideo"
        component={MyVideo}
        durationInFrames={150}   // 5 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ text: 'Hello World' }}
      />
    </>
  );
};
```

### index.ts — entry point
```ts
import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);
```

---

## Key Hooks

### `useCurrentFrame()`
Returns the current frame number (0-indexed). The entire animation derives from this.

```tsx
import { useCurrentFrame } from 'remotion';

const MyComp: React.FC = () => {
  const frame = useCurrentFrame();
  return <div>Frame: {frame}</div>;
};
```

### `useVideoConfig()`
Returns `{ fps, durationInFrames, width, height, id }` of the parent composition.

```tsx
import { useVideoConfig } from 'remotion';

const MyComp: React.FC = () => {
  const { fps, durationInFrames, width, height } = useVideoConfig();
  return <div>{width}x{height} @ {fps}fps</div>;
};
```

---

## Animation Primitives

### `interpolate()` — keyframe animation
Maps an input value from one range to another. Core of most animations.

```tsx
import { interpolate, useCurrentFrame } from 'remotion';

const frame = useCurrentFrame();

// Fade in over the first 30 frames (1 second at 30fps)
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});

// Slide in from left: x goes from -200 to 0 over frames 0-20
const translateX = interpolate(frame, [0, 20], [-200, 0], {
  extrapolateRight: 'clamp',
});
```

**Extrapolation options:** `'extend'` (default), `'clamp'`, `'wrap'`, `'identity'`

**With easing:**
```tsx
import { interpolate, Easing } from 'remotion';

const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: 'clamp',
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
});
```

### `spring()` — physics-based animation
Produces smooth, natural-feeling animations with configurable spring physics.

```tsx
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const scale = spring({
  frame,
  fps,
  from: 0,
  to: 1,
  config: {
    stiffness: 100,   // higher = faster/stiffer (default: 100)
    damping: 10,      // higher = less oscillation (default: 10)
    mass: 1,          // higher = slower (default: 1)
  },
  delay: 10,          // delay in frames before spring starts
  durationInFrames: 60,  // optional: clamp spring to N frames
});

return <div style={{ transform: `scale(${scale})` }}>Pop!</div>;
```

---

## Layout Components

### `<AbsoluteFill>`
A `position: absolute; inset: 0` div. Standard container for composition layers.

```tsx
import { AbsoluteFill } from 'remotion';

const MyComp: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#0B0B0B' }}>
    <h1>Hello</h1>
  </AbsoluteFill>
);
```

### `<Sequence>` — time-shift children
Children see `frame = 0` when the outer frame reaches `from`. Children unmount after `durationInFrames`.

```tsx
import { Sequence } from 'remotion';

const Timeline: React.FC = () => (
  <AbsoluteFill>
    {/* Title appears at frame 0, lasts 60 frames */}
    <Sequence from={0} durationInFrames={60}>
      <Title />
    </Sequence>

    {/* Body appears at frame 30 (overlaps with title) */}
    <Sequence from={30} durationInFrames={90}>
      <Body />
    </Sequence>

    {/* Outro appears at frame 120 */}
    <Sequence from={120}>
      <Outro />
    </Sequence>
  </AbsoluteFill>
);
```

---

## Media Components

### `<Img>` — images that wait to load
Use `<Img>` instead of `<img>` — Remotion waits for the image to load before rendering the frame.

```tsx
import { Img, staticFile } from 'remotion';

// From public/ folder
<Img src={staticFile('logo.png')} style={{ width: 200 }} />

// From URL
<Img src="https://example.com/photo.jpg" style={{ width: 400 }} />
```

### `<Audio>` — synchronized audio
```tsx
import { Audio, staticFile } from 'remotion';

<Audio
  src={staticFile('music.mp3')}
  volume={0.8}         // 0 to 1
  startFrom={30}       // skip first 30 frames of the audio
  endAt={150}          // stop at frame 150 of the audio
/>
```

### `<OffthreadVideo>` — video files (preferred over `<Html5Video>`)
```tsx
import { OffthreadVideo, staticFile } from 'remotion';

<OffthreadVideo
  src={staticFile('clip.mp4')}
  style={{ width: '100%' }}
  volume={0.5}
  muted={false}
/>
```

### `staticFile()` — reference assets in `public/`
```tsx
import { staticFile } from 'remotion';

const src = staticFile('images/photo.jpg');   // → /public/images/photo.jpg
```

---

## TypeScript & Props

### Typed composition props
```tsx
type MyVideoProps = {
  text: string;
  color: string;
  durationInSec: number;
};

export const MyVideo: React.FC<MyVideoProps> = ({ text, color }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: color }}>
      <h1>{text}</h1>
    </AbsoluteFill>
  );
};
```

### Schema validation with Zod (enables visual props editor in Studio)
```tsx
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const mySchema = z.object({
  text: z.string(),
  color: zColor(),
});

// In Root.tsx:
<Composition
  id="MyVideo"
  component={MyVideo}
  schema={mySchema}
  defaultProps={{ text: 'Hello', color: '#ffffff' }}
  durationInFrames={150}
  fps={30}
  width={1920}
  height={1080}
/>
```

---

## Common Animation Patterns

### Fade in
```tsx
const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
<div style={{ opacity }}>Content</div>
```

### Fade out (last 30 frames)
```tsx
const { durationInFrames } = useVideoConfig();
const opacity = interpolate(
  frame,
  [durationInFrames - 30, durationInFrames],
  [1, 0],
  { extrapolateLeft: 'clamp' }
);
```

### Slide in from bottom
```tsx
const translateY = interpolate(frame, [0, 30], [100, 0], {
  extrapolateRight: 'clamp',
  easing: Easing.out(Easing.cubic),
});
<div style={{ transform: `translateY(${translateY}px)` }}>Slide</div>
```

### Pop in with spring
```tsx
const scale = spring({ frame, fps, from: 0, to: 1, config: { damping: 8 } });
<div style={{ transform: `scale(${scale})` }}>Pop</div>
```

### Typewriter effect
```tsx
const charsToShow = Math.floor(interpolate(frame, [0, 60], [0, text.length], {
  extrapolateRight: 'clamp',
}));
<span>{text.slice(0, charsToShow)}</span>
```

---

## Transitions (`@remotion/transitions`)

```bash
npm install @remotion/transitions
```

```tsx
import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={springTiming({ config: { damping: 200 } })}
  />
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

Available presentations: `fade`, `slide`, `wipe`, `flip`, `clockWipe`, `none`

---

## Rendering

### Render to file (CLI)
```bash
# Render a composition
npx remotion render src/index.ts MyVideo out/video.mp4

# Render as GIF
npx remotion render src/index.ts MyVideo out/video.gif --codec=gif

# Render with custom props
npx remotion render src/index.ts MyVideo out/video.mp4 --props='{"text":"Custom"}'

# Render specific frames
npx remotion render src/index.ts MyVideo out/video.mp4 --frames=0-60

# Still image
npx remotion still src/index.ts MyVideo out/frame.png --frame=30
```

### Render programmatically (Node.js/SSR)
```ts
import { renderMedia, selectComposition } from '@remotion/renderer';

const comp = await selectComposition({
  serveUrl: 'http://localhost:3000',
  id: 'MyVideo',
  inputProps: { text: 'Hello' },
});

await renderMedia({
  composition: comp,
  serveUrl: 'http://localhost:3000',
  codec: 'h264',
  outputLocation: 'out/video.mp4',
});
```

---

## Remotion Lambda (AWS — fastest, scalable)

```bash
npm install @remotion/lambda
npx remotion lambda policies validate
npx remotion lambda sites create src/index.ts --site-name=my-site
npx remotion lambda render my-site MyVideo
```

---

## Useful Packages

| Package | Purpose |
|---|---|
| `remotion` | Core — hooks, Composition, Sequence, interpolate, spring |
| `@remotion/player` | Embed video in web apps (Next.js, Vite, etc.) |
| `@remotion/transitions` | Scene transitions (fade, slide, wipe, flip) |
| `@remotion/noise` | Perlin noise for organic movement |
| `@remotion/shapes` | SVG shape primitives (circle, rect, star, etc.) |
| `@remotion/paths` | SVG path animation and manipulation |
| `@remotion/motion-blur` | Camera motion blur effect |
| `@remotion/gif` | GIF output support |
| `@remotion/fonts` | Google Fonts loader |
| `@remotion/three` | React Three Fiber (3D) integration |
| `@remotion/lottie` | Lottie animation support |
| `@remotion/zod-types` | Zod types for props validation |
| `@remotion/media-utils` | Audio/video analysis (waveforms, duration) |
| `@remotion/renderer` | Node.js SSR rendering API |
| `@remotion/lambda` | AWS Lambda cloud rendering |

---

## Embedding in a Web App (`@remotion/player`)

```bash
npm install @remotion/player
```

```tsx
import { Player } from '@remotion/player';
import { MyVideo } from './MyComposition';

export const App: React.FC = () => (
  <Player
    component={MyVideo}
    durationInFrames={150}
    fps={30}
    compositionWidth={1920}
    compositionHeight={1080}
    inputProps={{ text: 'Hello from Player' }}
    controls
    loop
    autoPlay
    style={{ width: '100%' }}
  />
);
```

---

## Instructions for Claude

When the user invokes this skill:

1. **Understand the video goal**: Ask what the video should show if not clear from `$ARGUMENTS`.
2. **Scaffold if needed**: If no Remotion project exists, run `npx create-video@latest` or set up manually.
3. **Design the composition**: Plan scenes using `<Sequence>` blocks on a mental timeline.
4. **Write the components**: Use `useCurrentFrame()`, `interpolate()`, and `spring()` for all animation. No `setTimeout`, no `useEffect` for animation.
5. **Reference assets correctly**: Always use `staticFile()` for files in `public/`.
6. **Render**: Guide the user to run `npx remotion studio` for preview or `npx remotion render` for output.
7. **Type everything**: Use TypeScript and typed props. Add Zod schemas when props need Studio editing.
8. **Keep it composable**: Break videos into small focused components. Use `<Sequence>` for timing, `<AbsoluteFill>` for layers.

### Common pitfalls to avoid
- Never use `Math.random()` or `Date.now()` inside render — makes frames non-deterministic
- Never use CSS transitions/animations — Remotion controls time, not the browser
- Always clamp `interpolate()` to avoid values outside the expected range
- Use `<Img>` not `<img>`, `<OffthreadVideo>` not `<video>` inside compositions
- `useCurrentFrame()` inside a `<Sequence>` returns the *relative* frame (starts at 0)
