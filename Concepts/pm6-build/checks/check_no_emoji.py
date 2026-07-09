#!/usr/bin/env python3
"""check_no_emoji.py — ban emoji ranges U+1F000-1FAFF, U+FE0F, U+2600-26FF,
U+2700-27BF, U+2B00-2BFF minus the PARTS.md allowlist glyphs; report any other
char >= U+2190 as a warning. Exit 1 only on banned-range violations."""
import sys
import unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
BUILD = HERE.parent

# PARTS.md allowed typographic glyphs
ALLOW = set("→←✓✕✖➜⚠▾▸▲▼●⋮↳↧")

BANNED = [(0x1F000, 0x1FAFF), (0xFE0F, 0xFE0F), (0x2600, 0x26FF),
          (0x2700, 0x27BF), (0x2B00, 0x2BFF)]


def banned(cp):
    return any(a <= cp <= b for a, b in BANNED)


def main():
    assembled = Path(sys.argv[1]) if len(sys.argv) > 1 else BUILD / "PMConcept6.assembled.html"
    text = assembled.read_text(encoding="utf-8")
    viol, warn = [], []
    for i, ln in enumerate(text.split("\n"), 1):
        for j, ch in enumerate(ln, 1):
            cp = ord(ch)
            if cp < 0x2190 or ch in ALLOW:
                continue
            try:
                nm = unicodedata.name(ch)
            except ValueError:
                nm = "?"
            rec = (i, j, ch, f"U+{cp:04X}", nm)
            (viol if banned(cp) else warn).append(rec)
    if warn:
        agg = {}
        for i, j, ch, u, nm in warn:
            agg.setdefault((ch, u, nm), []).append(i)
        print(f"check_no_emoji: {len(warn)} WARNING glyph(s) >= U+2190 outside allowlist (not banned ranges):")
        for (ch, u, nm), ll in sorted(agg.items(), key=lambda x: x[0][1]):
            print(f"  ~ {ch!r} {u} {nm} x{len(ll)} (lines {ll[:8]}{'…' if len(ll) > 8 else ''})")
    if viol:
        print(f"check_no_emoji: FAIL — {len(viol)} banned emoji glyph(s):")
        for i, j, ch, u, nm in viol[:40]:
            print(f"  - line {i} col {j}: {ch!r} {u} {nm}")
        sys.exit(1)
    print(f"check_no_emoji: OK (0 banned glyphs; {len(warn)} warnings)")


if __name__ == "__main__":
    main()
