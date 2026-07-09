#!/usr/bin/env python3
"""rename_vocab.py — stage-0 mechanical vocab renames per contracts/PARTS.md §Vocab.

Operates in place on pm6-build/PMConcept6.working.html. Idempotent: a second run
reports 0 replacements for every pattern. NEVER run against PMConcept4.html.

Exclusions (spans masked before any replacement runs):
  "tier":"simple / "tier":"advanced  (PM_SETTINGS_DATA schema field)
  AuroraPhase / getAuroraPhase / chattier
"""
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
TARGET = HERE / "PMConcept6.working.html"

# (label, kind, pattern, replacement) — kind: 'plain' = str.replace, 'regex' = re.sub
RENAMES = [
    # identifiers (CSS+HTML+JS), all contexts
    ("orch-tier- -> orch-lane-",              "plain", "orch-tier-", "orch-lane-"),
    # plural sibling of the same identifier family (orch-tiers-layout/-toolbar/-main
    # span frozen part 08 + part 17); \btiers\b gate would hard-fail them at G2
    ("orch-tiers- -> orch-lanes-",            "plain", "orch-tiers-", "orch-lanes-"),
    ('data-tier= -> data-lane=',              "plain", "data-tier=", "data-lane="),
    ("interview-phase-step -> interview-node-step", "plain", "interview-phase-step", "interview-node-step"),
    # visible copy — most specific first so shorter patterns don't mangle longer ones
    ("Multi-Pass Review Process -> Auditor review loop", "plain",
     "Multi-Pass Review Process", "Auditor review loop"),
    ("Multi-Pass Review -> Auditor review loop", "plain",
     "Multi-Pass Review", "Auditor review loop"),
    # orchestrator UI copy "1 pass" -> "audit loop"; word-boundary so
    # "1/1 passing" (js-main terminal feed) is NOT touched
    ('"1 pass" -> "audit loop"',              "regex", r"\b1 pass\b", "audit loop"),
    # Pass 1 / Pass 2 wizard copy (2 known occurrences, inspected; rewritten sensibly)
    ("Enable Document Validation (Pass 1) -> (audit loop 1)", "plain",
     "Enable Document Validation (Pass 1)", "Enable Document Validation (audit loop 1)"),
    ("Enable Canonical Alignment (Pass 2) -> (audit loop 2)", "plain",
     "Enable Canonical Alignment (Pass 2)", "Enable Canonical Alignment (audit loop 2)"),
]

EXCLUSION_PATTERNS = [
    r'"tier":"simple', r'"tier":"advanced', r"getAuroraPhase", r"AuroraPhase", r"chattier",
]


def mask_exclusions(text):
    """Replace excluded spans with NUL-padded placeholders; return (masked, spans)."""
    spans = []
    def stash(m):
        spans.append(m.group(0))
        return "\x00" + str(len(spans) - 1).zfill(6) + "\x00"
    masked = re.sub("|".join(EXCLUSION_PATTERNS), stash, text)
    return masked, spans


def unmask(text, spans):
    return re.sub("\x00(\\d{6})\x00", lambda m: spans[int(m.group(1))], text)


def main():
    if not TARGET.exists():
        sys.exit(f"ERROR: {TARGET} not found. Run: cp ../PMConcept4.html {TARGET.name} first.")
    text = TARGET.read_text(encoding="utf-8")
    masked, spans = mask_exclusions(text)

    print(f"rename_vocab.py — target: {TARGET}")
    print(f"exclusion spans protected: {len(spans)}")
    print("-" * 72)
    total = 0
    for label, kind, pat, rep in RENAMES:
        if kind == "plain":
            n = masked.count(pat)
            masked = masked.replace(pat, rep)
        else:
            masked, n = re.subn(pat, rep, masked)
        total += n
        print(f"{n:6d}  {label}")
    print("-" * 72)
    print(f"{total:6d}  TOTAL replacements")

    out = unmask(masked, spans)
    assert "\x00" not in out, "unmask failed"
    if out != text:
        TARGET.write_text(out, encoding="utf-8")
        print("written (file modified).")
    else:
        print("no changes (already renamed — idempotent).")


if __name__ == "__main__":
    main()
