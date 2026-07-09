#!/usr/bin/env python3
"""check_vocab.py — PARTS.md gate regexes + exclusions. Prints every match with
line number. Exit 1 if any match (assemble.py decides severity per gate)."""
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
BUILD = HERE.parent

EXCLUSIONS = [r'"tier":"simple', r'"tier":"advanced', r"getAuroraPhase",
              r"AuroraPhase", r"chattier", r"phase_history",
              # settings-engine reads of the fixed PM_SETTINGS_DATA schema field
              # (same rationale as the "tier":"simple|advanced" JSON exclusion;
              # check_settings_data REQUIRES settings[].tier to exist)
              r"\.tier\s*[!=]==?\s*'simple'"]

GATES = [
    ("tiers",            re.compile(r"\btiers?\b", re.I)),
    ("phases",           re.compile(r"\bphases?\b", re.I)),
    ("Pass 1/2/3",       re.compile(r"Pass [123]\b")),
    ("Compile Settings", re.compile(r"Compile Settings")),
    ("platform_specs",   re.compile(r"platform_specs")),
    ("Tauri",            re.compile(r"Tauri")),
    ("Gemini CLI",       re.compile(r"Gemini CLI")),
]


def main():
    assembled = Path(sys.argv[1]) if len(sys.argv) > 1 else BUILD / "PMConcept6.assembled.html"
    text = assembled.read_text(encoding="utf-8")
    masked = re.sub("|".join(EXCLUSIONS), lambda m: "\x01" * len(m.group(0)), text)
    lines = masked.split("\n")
    hits = []
    for name, pat in GATES:
        for i, ln in enumerate(lines, 1):
            for m in pat.finditer(ln):
                ctx = ln.strip()
                if len(ctx) > 100:
                    a = max(0, m.start() - 40)
                    ctx = "…" + ln[a:m.end() + 40].strip() + "…"
                hits.append((name, i, m.group(0), ctx))
    if hits:
        print(f"check_vocab: {len(hits)} gate-regex match(es)")
        by = {}
        for name, i, tok, ctx in hits:
            by.setdefault(name, []).append((i, tok, ctx))
        for name in by:
            print(f"  [{name}] x{len(by[name])}")
            for i, tok, ctx in by[name][:20]:
                print(f"    line {i}: {tok!r} | {ctx}")
            if len(by[name]) > 20:
                print(f"    … +{len(by[name])-20} more")
        sys.exit(1)
    print("check_vocab: OK (no gate-regex matches)")


if __name__ == "__main__":
    main()
