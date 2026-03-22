#!/usr/bin/env python3
"""
generate_videos.py
──────────────────
Reads video ideas from video_ideas.txt, calls the local LLM API to generate
a Remotion TSX component for each idea, registers it in src/Root.tsx, and
renders the video to out/<name>.mp4.

Usage:
  python generate_videos.py                  # process all pending ideas
  python generate_videos.py --dry-run        # print what would be done, no API calls
  python generate_videos.py --idea "Spiral"  # process a single idea inline

Local LLM endpoint: http://localhost:1234/api/v1/chat
Model:              deepseek-coder-v2-lite-instruct
"""

import argparse
import json
import os
import re
import subprocess
import sys
import time
import textwrap
from pathlib import Path
from datetime import datetime

import requests
from dotenv import load_dotenv

load_dotenv()

# ─── Paths ────────────────────────────────────────────────────────────────────

SCRIPT_DIR  = Path(__file__).parent.resolve()
IDEAS_FILE  = SCRIPT_DIR / "video_ideas.txt"
SRC_DIR     = SCRIPT_DIR / "src"
OUT_DIR     = SCRIPT_DIR / "out"
ROOT_TSX    = SRC_DIR / "Root.tsx"
LOG_FILE    = SCRIPT_DIR / "generate_videos.log"

# ─── LLM Config ───────────────────────────────────────────────────────────────

API_URL   = "https://api.anthropic.com/v1/messages"
LLM_MODEL = "claude-sonnet-4-6"
ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]

SYSTEM_PROMPT = textwrap.dedent("""\
You are an expert Remotion (React + TypeScript) animation developer.
Your only job is to generate a single self-contained Remotion TSX component file.

STRICT RULES — follow every one of them:
1. Output ONLY the raw TypeScript/TSX code. No markdown, no code fences, no explanations.
2. The component MUST be a named export (e.g. `export const MyComponent: React.FC = () => { ... }`).
3. The component name must be PascalCase, derived from the animation concept, no spaces or symbols.
4. Only use these imports – nothing else:
     import React from 'react';
     import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
5. Do NOT import any external libraries (no three.js, GSAP, etc.).
6. Do NOT render any text, labels, or titles anywhere in the output.
7. Use only SVG, HTML divs/canvas and inline styles for rendering.
8. The animation must:
   - Fade in during the first 50 frames.
   - Fade out during the last 50 frames.
   - Be 600 frames (20 s at 30 fps) long — but do NOT hardcode 600, use `durationInFrames` from `useVideoConfig()`.
   - Run at 3840×2160 (4K UHD) — use `width` and `height` from `useVideoConfig()`.
   - Be purely generative — no external assets or images.
9. Use a dark background (near black).
10. The animation should be visually rich, dynamic, and premium-looking.
11. Use `useCurrentFrame()` and `useVideoConfig()` for all timing — never Date.now() or setInterval.
12. NEVER use Math.random() anywhere inside the component function. Remotion renders each frame
    multiple times and Math.random() makes output non-deterministic, causing a render timeout crash.
    Instead, pre-compute all "random" values as a constant array OUTSIDE the component using a
    deterministic formula, e.g.:
      const ITEMS = Array.from({ length: 100 }, (_, i) => ({
        x: (i * 1731) % 1920,
        y: (i * 1337) % 1080,
        size: (i % 10) + 2,
      }));
    This must be declared at module level, not inside the component.
13. Do NOT use CSS transitions or CSS animations (transition:, animation:, @keyframes).
    All animation must be driven by useCurrentFrame() and interpolate() only.
14. Do NOT use useEffect, useState, useRef, or any React hooks other than useCurrentFrame()
    and useVideoConfig(). The component must be a pure function of the current frame.

Return ONLY the TSX source code. The very first line must be: import React from 'react';
""")

# ─── Logging ──────────────────────────────────────────────────────────────────

def log(msg: str, level: str = "INFO"):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] [{level}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")

# ─── Idea file helpers ────────────────────────────────────────────────────────

def read_pending_ideas() -> list[tuple[int, str]]:
    """Return list of (line_number, idea_text) for all unprocessed ideas."""
    if not IDEAS_FILE.exists():
        log(f"Ideas file not found: {IDEAS_FILE}", "ERROR")
        sys.exit(1)

    pending: list[tuple[int, str]] = []
    lines = IDEAS_FILE.read_text(encoding="utf-8").splitlines()
    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or stripped.upper().startswith("DONE:") or stripped.upper().startswith("FAILED:"):
            continue
        pending.append((i, stripped))
    return pending


def mark_idea(line_idx: int, status: str, suffix: str = ""):
    """Rewrite the ideas file, prefixing the given line with DONE: or FAILED:."""
    lines = IDEAS_FILE.read_text(encoding="utf-8").splitlines()
    original = lines[line_idx]
    lines[line_idx] = f"{status}: {original}{(' → ' + suffix) if suffix else ''}"
    IDEAS_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")

# ─── Name derivation ─────────────────────────────────────────────────────────

def idea_to_component_name(idea: str) -> str:
    """Convert an idea string to a valid PascalCase component name."""
    # Keep only alphanumeric + spaces, title-case each word
    words = re.sub(r"[^a-zA-Z0-9 ]", " ", idea).split()
    name = "".join(w.capitalize() for w in words if w)
    # Ensure starts with a letter
    if name and name[0].isdigit():
        name = "Anim" + name
    return name or "GeneratedAnimation"


def component_name_to_file(name: str) -> Path:
    return SRC_DIR / f"{name}.tsx"


def component_name_to_output(name: str) -> Path:
    # Convert PascalCase → kebab-case for filename
    kebab = re.sub(r"(?<!^)(?=[A-Z])", "-", name).lower()
    return OUT_DIR / f"{kebab}.mp4"

# ─── LLM call ────────────────────────────────────────────────────────────────

def call_llm(idea: str, retries: int = 3) -> str:
    """Call the Anthropic LLM API and return the generated TSX code string."""
    payload = {
        "model": LLM_MODEL,
        "max_tokens": 8192,
        "system": SYSTEM_PROMPT,
        "messages": [
            { "role": "user", "content": f"Generate a Remotion TSX animation component for the following concept:\n\n{idea}\n\nRemember: output ONLY raw TSX code, first line must be: import React from 'react';" }
        ]
    }

    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }

    for attempt in range(1, retries + 1):
        try:
            log(f"  [LLM] Calling API (attempt {attempt}/{retries})…")
            resp = requests.post(API_URL, data=json.dumps(payload), headers=headers, timeout=120)
            resp.raise_for_status()
            
            data = resp.json()
            
            text_parts = []
            for block in data.get("content", []):
                if block.get("type") == "text":
                    text_parts.append(block.get("text", ""))

            text = "".join(text_parts).strip()

            if not text:
                log("  [LLM] Empty response from Anthropic API.", "WARN")
                if attempt < retries:
                    time.sleep(3)
                    continue
                raise ValueError("Could not extract text from LLM response")

            return text

        except requests.RequestException as e:
            log(f"  [LLM] Request error: {e}", "WARN")
            if attempt < retries:
                time.sleep(5)
            else:
                raise

    raise RuntimeError("All LLM retries exhausted")

# ─── Code extraction ──────────────────────────────────────────────────────────

def extract_tsx_code(raw: str) -> str:
    """
    Strip markdown code fences if the model added them despite instructions.
    Returns clean TSX source.
    """
    # Remove wrappers like <|begin_of_box|> ... <|end_of_box|>
    raw = re.sub(r"<\|begin_of_box\|>", "", raw)
    raw = re.sub(r"<\|end_of_box\|>", "", raw)

    # Remove ```tsx ... ``` or ``` ... ``` wrappers
    fence_re = re.compile(r"```(?:tsx|typescript|ts)?\s*\n(.*?)```", re.DOTALL)
    m = fence_re.search(raw)
    if m:
        return m.group(1).strip()

    # If it accidentally starts with a preamble, find the import line
    lines = raw.splitlines()
    for i, line in enumerate(lines):
        if line.strip().startswith("import React"):
            return "\n".join(lines[i:]).strip()

    return raw.strip()


def extract_component_name(code: str) -> str | None:
    """Extract the exported component name from the TSX source."""
    # Match: export const SomeName: React.FC
    m = re.search(r"export\s+const\s+([A-Z][A-Za-z0-9]+)\s*:", code)
    if m:
        return m.group(1)
    # Fallback: export function SomeName
    m = re.search(r"export\s+(?:default\s+)?function\s+([A-Z][A-Za-z0-9]+)", code)
    if m:
        return m.group(1)
    return None

# ─── Root.tsx patching ───────────────────────────────────────────────────────

def patch_root_tsx(component_name: str):
    """Inject import + Composition entry into Root.tsx if not already present."""
    content = ROOT_TSX.read_text(encoding="utf-8")

    import_line = f"import {{ {component_name} }} from './{component_name}';"
    composition_block = textwrap.dedent(f"""\
      <Composition
        id=\"{component_name}\"
        component={{{component_name}}}
        durationInFrames={{600}}
        fps={{30}}
        width={{3840}}
        height={{2160}}
      />""")

    changed = False

    # Add import if missing
    if import_line not in content:
        # Insert before the RemotionRoot declaration
        content = content.replace(
            "export const RemotionRoot",
            f"{import_line}\n\nexport const RemotionRoot",
        )
        changed = True

    # Add Composition if missing
    if f'id="{component_name}"' not in content:
        # Insert before the closing </> tag
        content = content.replace(
            "    </>\n  );\n};",
            f"      {composition_block}\n    </>\n  );\n}};",
        )
        changed = True

    if changed:
        ROOT_TSX.write_text(content, encoding="utf-8")
        log(f"  [Root] Patched Root.tsx with {component_name}")
    else:
        log(f"  [Root] {component_name} already present in Root.tsx")

# ─── Renderer ────────────────────────────────────────────────────────────────

def render_video(component_name: str, output_path: Path) -> bool:
    """Run the Remotion render command. Returns True on success."""
    out_dir = output_path.parent
    out_dir.mkdir(parents=True, exist_ok=True)

    cmd = [
        "npx", "remotion", "render",
        "src/index.ts",
        component_name,
        str(output_path),
        "--gl=angle",   # GPU-accelerated Chromium rendering via ANGLE (NVIDIA on Windows)
    ]
    env = {**os.environ, "CI": "true"}

    log(f"  [Render] Running: {' '.join(cmd)}")
    result = subprocess.run(
        cmd,
        cwd=str(SCRIPT_DIR),
        env=env,
        capture_output=False,   # stream output to terminal
        shell=sys.platform.startswith('win')
    )

    if result.returncode == 0:
        size_mb = output_path.stat().st_size / (1024 * 1024)
        log(f"  [Render] ✓ Done → {output_path.name} ({size_mb:.1f} MB)")
        return True
    else:
        log(f"  [Render] ✗ Render failed (exit code {result.returncode})", "ERROR")
        return False

# ─── Single pipeline step ────────────────────────────────────────────────────

def process_idea(idea: str, dry_run: bool = False) -> tuple[bool, str]:
    """
    Full pipeline for one idea.
    Returns (success, component_name).
    """
    log(f"\n{'='*60}")
    log(f"IDEA: {idea}")
    log(f"{'='*60}")

    # Derive component name from idea
    component_name = idea_to_component_name(idea)
    tsx_path = component_name_to_file(component_name)
    output_path = component_name_to_output(component_name)

    log(f"  Component : {component_name}")
    log(f"  File      : {tsx_path.name}")
    log(f"  Output    : {output_path.name}")

    if dry_run:
        log("  [DRY RUN] Skipping API call and render.")
        return True, component_name

    # ── 1. Call LLM ──────────────────────────────────────────────────────────
    try:
        raw_response = call_llm(idea)
    except Exception as e:
        log(f"  [LLM] FAILED: {e}", "ERROR")
        return False, component_name

    # ── 2. Extract + validate code ────────────────────────────────────────────
    code = extract_tsx_code(raw_response)

    # If LLM used a different component name, honour it but warn
    detected_name = extract_component_name(code)
    if detected_name and detected_name != component_name:
        log(f"  [Code] LLM used component name '{detected_name}' — adopting it.")
        component_name = detected_name
        tsx_path = component_name_to_file(component_name)
        output_path = component_name_to_output(component_name)

    if "useCurrentFrame" not in code:
        log("  [Code] WARNING: generated code doesn't use useCurrentFrame(). Continuing anyway.", "WARN")

    log(f"  [Code] Extracted {len(code)} characters of TSX")

    # ── 3. Write component file ───────────────────────────────────────────────
    tsx_path.write_text(code, encoding="utf-8")
    log(f"  [File] Written → {tsx_path}")

    # ── 3b. Syntax-check with esbuild (fast, same tool the bundler uses) ──────
    check = subprocess.run(
        ["npx", "esbuild", "--bundle=false", str(tsx_path)],
        cwd=str(SCRIPT_DIR),
        capture_output=True,
        text=True,
        shell=sys.platform.startswith('win'),
    )
    if check.returncode != 0:
        log(f"  [Syntax] FAILED — generated code has syntax errors:", "ERROR")
        for line in check.stderr.strip().splitlines()[:10]:
            log(f"    {line}", "ERROR")
        log(f"  [Syntax] Removing broken file to protect the build.", "ERROR")
        tsx_path.unlink(missing_ok=True)
        return False, component_name
    log(f"  [Syntax] ✓ Syntax OK")

    # ── 4. Patch Root.tsx ─────────────────────────────────────────────────────
    patch_root_tsx(component_name)

    # ── 5. Render ─────────────────────────────────────────────────────────────
    success = render_video(component_name, output_path)
    return success, component_name

# ─── CLI ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Generate Remotion videos from a text file of ideas.")
    parser.add_argument("--dry-run", action="store_true", help="Parse ideas but skip API and render.")
    parser.add_argument("--idea", type=str, default=None, help="Process a single inline idea string.")
    parser.add_argument("--limit", type=int, default=None, help="Max number of ideas to process this run.")
    args = parser.parse_args()

    log("=" * 60)
    log("  generate_videos.py — Remotion Video Automation")
    log(f"  API  : {API_URL}")
    log(f"  Model: {LLM_MODEL}")
    log("=" * 60)

    if args.idea:
        # One-off inline idea
        success, name = process_idea(args.idea, dry_run=args.dry_run)
        sys.exit(0 if success else 1)

    # Batch mode: read from file
    pending = read_pending_ideas()
    if not pending:
        log("No pending ideas found in video_ideas.txt. All done!")
        sys.exit(0)

    log(f"Found {len(pending)} pending idea(s).")
    if args.limit:
        pending = pending[: args.limit]
        log(f"Processing only the first {args.limit} (--limit flag).")

    total = len(pending)
    succeeded = 0
    failed = 0

    for n, (line_idx, idea) in enumerate(pending, 1):
        log(f"\n[{n}/{total}] Processing…")
        success, comp_name = process_idea(idea, dry_run=args.dry_run)

        if not args.dry_run:
            if success:
                mark_idea(line_idx, "DONE", comp_name)
                succeeded += 1
            else:
                mark_idea(line_idx, "FAILED")
                failed += 1
        else:
            succeeded += 1

    log(f"\n{'='*60}")
    log(f"  FINISHED — {succeeded} succeeded, {failed} failed out of {total}.")
    log(f"{'='*60}")


if __name__ == "__main__":
    main()
