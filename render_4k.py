#!/usr/bin/env python3
"""
render_4k.py
────────────
Re-renders every composition registered in src/Root.tsx at 4K (3840×2160)
and saves the output to out/4k/<composition-id>.mp4

Usage:
  python render_4k.py                        # render all compositions
  python render_4k.py --only RadarSweep      # render a single composition
  python render_4k.py --skip F16MissionMap   # skip specific compositions
  python render_4k.py --concurrency 4        # limit parallel Chromium instances
  python render_4k.py --dry-run              # print what would be rendered, no action
"""

import argparse
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
ROOT_TSX   = SCRIPT_DIR / "src" / "Root.tsx"
OUT_DIR    = SCRIPT_DIR / "out" / "4k"
LOG_FILE   = SCRIPT_DIR / "render_4k.log"

# ── Logging ────────────────────────────────────────────────────────────────────

def log(msg: str, level: str = "INFO"):
    ts   = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] [{level}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")

# ── Parse composition IDs from Root.tsx ───────────────────────────────────────

def get_composition_ids() -> list[str]:
    """Extract every id="..." value from Composition blocks in Root.tsx."""
    content = ROOT_TSX.read_text(encoding="utf-8")
    ids = re.findall(r'id=["\']([A-Za-z0-9_]+)["\']', content)
    return ids

# ── Render one composition ─────────────────────────────────────────────────────

def render(comp_id: str, concurrency: int, dry_run: bool) -> bool:
    output_path = OUT_DIR / f"{comp_id}.mp4"

    if output_path.exists():
        log(f"  [Skip] {comp_id} already exists at {output_path.name}")
        return True

    cmd = [
        "npx", "remotion", "render",
        "src/index.ts",
        comp_id,
        str(output_path),
        f"--concurrency={concurrency}",
        "--gl=angle",              # ANGLE: GPU-accelerated Chromium rendering (NVIDIA on Windows)
        "--enable-multiprocess-on-linux=false",  # not needed on Windows, harmless
    ]

    log(f"  [Render] {comp_id} → {output_path.name}")

    if dry_run:
        log(f"  [DRY RUN] Would run: {' '.join(cmd)}")
        return True

    env    = {**os.environ, "CI": "true"}
    result = subprocess.run(
        cmd,
        cwd=str(SCRIPT_DIR),
        env=env,
        capture_output=False,
        shell=sys.platform.startswith("win"),
    )

    if result.returncode == 0:
        size_mb = output_path.stat().st_size / (1024 * 1024)
        log(f"  [Done] ✓ {comp_id} → {size_mb:.1f} MB")
        return True
    else:
        log(f"  [Error] ✗ {comp_id} failed (exit {result.returncode})", "ERROR")
        return False

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Render all Remotion compositions at 4K.")
    parser.add_argument("--only",        type=str, default=None, help="Render only this composition ID.")
    parser.add_argument("--skip",        type=str, default=None, help="Comma-separated IDs to skip.")
    parser.add_argument("--concurrency", type=int, default=16,   help="Remotion --concurrency value (default 16 for GPU).")
    parser.add_argument("--dry-run",     action="store_true",    help="Print plan without rendering.")
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    skip_set = set(s.strip() for s in args.skip.split(",")) if args.skip else set()

    all_ids = get_composition_ids()
    if not all_ids:
        log("No compositions found in Root.tsx — is the file correct?", "ERROR")
        sys.exit(1)

    if args.only:
        if args.only not in all_ids:
            log(f"Composition '{args.only}' not found in Root.tsx.", "ERROR")
            log(f"Available: {', '.join(all_ids)}")
            sys.exit(1)
        queue = [args.only]
    else:
        queue = [cid for cid in all_ids if cid not in skip_set]

    log("=" * 60)
    log(f"  render_4k.py — 4K Batch Renderer")
    log(f"  Output folder  : {OUT_DIR}")
    log(f"  Compositions   : {len(queue)}")
    log(f"  Concurrency    : {args.concurrency}")
    log(f"  Dry run        : {args.dry_run}")
    log("=" * 60)

    succeeded = 0
    failed    = 0
    skipped   = 0

    for n, comp_id in enumerate(queue, 1):
        log(f"\n[{n}/{len(queue)}] {comp_id}")

        output_path = OUT_DIR / f"{comp_id}.mp4"
        if output_path.exists() and not args.dry_run:
            log(f"  [Skip] Already rendered — delete the file to re-render.")
            skipped += 1
            continue

        ok = render(comp_id, args.concurrency, args.dry_run)
        if ok:
            succeeded += 1
        else:
            failed += 1

    log(f"\n{'=' * 60}")
    log(f"  DONE — {succeeded} rendered, {skipped} skipped, {failed} failed")
    log(f"  Output: {OUT_DIR}")
    log(f"{'=' * 60}")


if __name__ == "__main__":
    main()
