#!/usr/bin/env python3
"""assemble.py — concatenate parts in manifest.json order into
pm6-build/PMConcept6.assembled.html, regenerating part 28 (js-settings-data)
from sidecar/pm_settings_data.json, then run the checks/ suite.

Gates:
  --gate g0  initial round-trip gate: assembled must be byte-identical to
             PMConcept6.working.html; structure/js/original hard-fail, all
             other checks report-only.
  --gate g1  work-in-progress gate: vocab + no_emoji report-only, rest hard.
  --gate g2  everything hard-fails.
  --gate g3  g2 + on success copy assembled -> Concepts/PMConcept6.html.
"""
import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CHECKS = HERE / "checks"
PARTS = HERE / "parts"
ASSEMBLED = HERE / "PMConcept6.assembled.html"
WORKING = HERE / "PMConcept6.working.html"
SIDECAR = HERE / "sidecar" / "pm_settings_data.json"
SHIP = HERE.parent / "PMConcept6.html"

CHECK_ORDER = ["check_original", "check_structure", "check_js", "check_css",
               "check_ids", "check_hooks", "check_settings_data",
               "check_no_emoji", "check_vocab"]

HARD = {
    "g0": {"check_original", "check_structure", "check_js"},
    "g1": {"check_original", "check_structure", "check_js", "check_css",
           "check_ids", "check_hooks", "check_settings_data"},
    "g2": set(CHECK_ORDER),
    "g3": set(CHECK_ORDER),
}


def sha256s(s):
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def regen_settings_part(content):
    """Rebuild part 28 from the sidecar. If the sidecar is unmodified (re-minified
    body sha256 == _meta.original_minified_sha256), keep the part's byte-original
    line so G0 round-trips exactly."""
    side = json.loads(SIDECAR.read_text(encoding="utf-8"))
    meta = side.pop("_meta", {})
    mini = json.dumps(side, separators=(",", ":"), ensure_ascii=False)
    lines = content.splitlines(keepends=True)
    if len(lines) < 2 or not lines[1].startswith("window.PM_SETTINGS_DATA = "):
        sys.exit("ERROR: part 28 shape unexpected (want script-open line + assignment line)")
    if meta.get("original_minified_sha256") == sha256s(mini):
        return content  # sidecar untouched -> byte-original round-trip
    body = mini.replace("</", "<\\/")
    eol = "\n" if lines[1].endswith("\n") else ""
    lines[1] = "window.PM_SETTINGS_DATA = " + body + ";" + eol
    return "".join(lines)


def main():
    global ASSEMBLED
    ap = argparse.ArgumentParser()
    ap.add_argument("--gate", choices=["g0", "g1", "g2", "g3"], default="g1")
    ap.add_argument("--out", help="alternate output path (parallel-safe; use during Wave iteration)")
    args = ap.parse_args()
    gate = args.gate
    if args.out:
        if gate == "g3":
            sys.exit("ERROR: --out cannot be combined with the ship gate g3")
        ASSEMBLED = Path(args.out)

    manifest = json.loads((HERE / "manifest.json").read_text(encoding="utf-8"))
    chunks = []
    for e in manifest["parts"]:
        p = PARTS / e["file"]
        if not p.exists():
            sys.exit(f"ERROR: missing part {e['file']}")
        content = p.read_text(encoding="utf-8")
        if e["file"] == "28-js-settings-data.part.html":
            content = regen_settings_part(content)
        chunks.append(content)
    out = "".join(chunks)
    ASSEMBLED.write_text(out, encoding="utf-8")
    print(f"assembled: {ASSEMBLED.name} ({out.count(chr(10))} lines, sha256 {sha256s(out)[:16]}…) from {len(chunks)} parts [gate {gate}]")

    hard_fail = False

    # G0 byte-identity invariant
    if gate == "g0":
        same = ASSEMBLED.read_bytes() == WORKING.read_bytes()
        print(f"[G0] byte-identity vs working copy: {'IDENTICAL' if same else 'DIFFERS'}")
        if not same:
            hard_fail = True

    results = []
    for name in CHECK_ORDER:
        r = subprocess.run([sys.executable, str(CHECKS / (name + ".py")), str(ASSEMBLED)],
                           capture_output=True, text=True)
        ok = r.returncode == 0
        hard = name in HARD[gate]
        status = "PASS" if ok else ("FAIL" if hard else "REPORT")
        results.append((name, status))
        print(f"\n=== {name} [{'hard' if hard else 'report'}] -> {status} ===")
        sys.stdout.write(r.stdout)
        if r.stderr.strip():
            sys.stdout.write(r.stderr)
        if not ok and hard:
            hard_fail = True

    print("\n" + "=" * 56)
    print(f"gate {gate} summary:")
    for name, status in results:
        print(f"  {name:<22} {status}")
    if hard_fail:
        print(f"gate {gate}: FAIL")
        sys.exit(1)
    print(f"gate {gate}: PASS")

    if gate == "g3":
        SHIP.write_text(out, encoding="utf-8")
        print(f"g3: copied assembled -> {SHIP}")


if __name__ == "__main__":
    main()
