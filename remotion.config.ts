import { Config } from '@remotion/cli/config';

// ── GPU: ANGLE renderer for Chromium frame rendering ─────────────────────────
// Forces Chromium to use ANGLE (Direct3D11-backed OpenGL) on Windows.
// All SVG, CSS, canvas, and WebGL rendering runs on the NVIDIA GPU instead
// of the CPU software rasterizer — significantly faster per-frame rendering.
Config.setChromiumOpenGlRenderer('angle');

// ── Concurrency: more parallel Chromium instances ────────────────────────────
// GPU-accelerated rendering sustains higher concurrency than CPU-only.
// Lower this (e.g. 8) if you see out-of-memory errors during heavy renders.
Config.setConcurrency(16);

// NOTE: Remotion bundles its own FFmpeg compiled without h264_nvenc/hevc_nvenc.
// NVENC hardware encoding is therefore NOT available through Remotion's pipeline.
// The GPU acceleration above (ANGLE) applies to the frame rendering step only.
// The encoding step always uses Remotion's bundled libx264 (CPU).
