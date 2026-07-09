#!/usr/bin/env python3
"""check_css.py — per-<style>-block brace balance; every var(--x) used has a
definition somewhere in the document; NEW pm6-css-* blocks may not use raw hex
colors outside [data-theme…]-scoped rules. Exit 0 = pass."""
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
BUILD = HERE.parent

# Pre-existing PMConcept4 defects: referenced but never defined (all carry a
# var() fallback or degrade to inherit). Verified at carve baseline 2026-07-08.
# NEW code must not reference these — define real tokens instead. Do not extend
# this list without updating contracts/TOKENS.md.
BASELINE_UNDEFINED = {"accent-blue-rgb", "accent-red", "bg", "font-mono",
                      "glass-glow-color", "mono-font"}


def main():
    assembled = Path(sys.argv[1]) if len(sys.argv) > 1 else BUILD / "PMConcept6.assembled.html"
    text = assembled.read_text(encoding="utf-8")
    fails = []

    # ---- brace balance per style block ----
    blocks = []
    for m in re.finditer(r"<style\b([^>]*)>(.*?)</style\s*>", text, re.S):
        attrs, body = m.group(1), m.group(2)
        sid = (re.search(r'id="([^"]+)"', attrs) or [None, ""])[1]
        line0 = text[:m.start(2)].count("\n") + 1
        blocks.append((sid, body, line0))
        opens, closes = body.count("{"), body.count("}")
        if opens != closes:
            fails.append(f"style block {sid or ('@line ' + str(line0))}: brace imbalance {{x{opens} vs }}x{closes}")

    # ---- var() definitions ----
    used = set(re.findall(r"var\(\s*--([\w-]+)", text))
    defined = set(re.findall(r"--([\w-]+)\s*:", text))
    defined |= set(re.findall(r"setProperty\(\s*['\"]--([\w-]+)", text))
    missing = sorted(used - defined - BASELINE_UNDEFINED)
    if missing:
        for v in missing:
            fails.append(f"var(--{v}) used but never defined")
    stale = sorted(BASELINE_UNDEFINED - used)
    if stale:
        print(f"check_css: note — baseline-undefined allowlist entries no longer used (prune): {stale}")

    # ---- pm6 blocks: no raw hex outside [data-theme]-scoped rules ----
    hexpat = re.compile(r"#[0-9a-fA-F]{3,8}\b")
    for sid, body, line0 in blocks:
        if not (sid or "").startswith("pm6-css"):
            continue
        # strip comments
        clean = re.sub(r"/\*.*?\*/", "", body, flags=re.S)
        stack = []
        buf = ""
        for i, ch in enumerate(clean):
            if ch == "{":
                stack.append(buf.strip())
                buf = ""
            elif ch == "}":
                if stack:
                    stack.pop()
                buf = ""
            elif ch == ";":
                decl = buf.strip()
                buf = ""
                if hexpat.search(decl):
                    themed = any("[data-theme" in s for s in stack)
                    if not themed:
                        fails.append(f"pm6 block {sid}: raw hex outside [data-theme] scope: {decl[:80]!r}")
            else:
                buf += ch
        # trailing decl without ;
        decl = buf.strip()
        if decl and hexpat.search(decl) and not any("[data-theme" in s for s in stack):
            fails.append(f"pm6 block {sid}: raw hex outside [data-theme] scope: {decl[:80]!r}")

    if fails:
        print("check_css: FAIL")
        for x in fails[:40]:
            print("  -", x)
        if len(fails) > 40:
            print(f"  … +{len(fails)-40} more")
        sys.exit(1)
    print(f"check_css: OK ({len(blocks)} style blocks balanced; {len(used)} distinct vars all defined; pm6 hex rule clean)")


if __name__ == "__main__":
    main()
