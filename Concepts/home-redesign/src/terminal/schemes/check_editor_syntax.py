#!/usr/bin/env python3
"""check_editor_syntax.py - gates for schemes/editor-syntax.json (D27).

Reads the scheme catalog (schemes/*.json family files) and checks every
editor-syntax.json entry: 34 schemes, one of each catalog id, all 17 token
keys, lowercase #rrggbb values, and the WCAG 2.x contrast floors against each
scheme's own background (4.5:1 for text tokens, 3:1 for comments; the PM High
Contrast schemes need 7:1 for every token). Entries whose source colour was
lightness-adjusted to meet a floor carry an "adjusted" key and the token names
are printed on their line. Exits 0 only when everything passes ("ALL OK").
"""

import json
import os
import sys

TOKENS = ["kw", "str", "num", "com", "fn", "ty", "var", "prop", "op", "pun",
          "tag", "attr", "esc", "mac", "link", "head", "code"]
EXPECTED_SCHEMES = 34


def here(name):
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), name)


def srgb_lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hx):
    h = hx[1:]
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * srgb_lin(r) + 0.7152 * srgb_lin(g) + 0.0722 * srgb_lin(b)


def contrast(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def is_hex(v):
    return (isinstance(v, str) and len(v) == 7 and v.startswith("#")
            and v == v.lower()
            and all(c in "0123456789abcdef" for c in v[1:]))


def floors_for(scheme_id):
    return (7.0, 7.0) if scheme_id.startswith("pm-high-contrast") else (4.5, 3.0)


def main():
    problems = []
    lines = []

    family = {}
    catalog_dir = os.path.dirname(os.path.abspath(__file__))
    for name in sorted(os.listdir(catalog_dir)):
        if not name.endswith(".json") or name == "editor-syntax.json":
            continue
        doc = json.load(open(os.path.join(catalog_dir, name)))
        for s in doc.get("schemes", []):
            family[s["id"]] = s
    if len(family) != EXPECTED_SCHEMES:
        problems.append(f"catalog holds {len(family)} schemes, expected {EXPECTED_SCHEMES}")

    editor = json.load(open(here("editor-syntax.json")))
    if list(editor.get("tokens", [])) != TOKENS:
        problems.append(f"editor-syntax tokens list mismatch: {editor.get('tokens')}")
    got = sorted(editor.get("schemes", {}))
    want = sorted(family)
    if got != want:
        problems.append(f"editor-syntax scheme ids mismatch: only-editor={sorted(set(got) - set(want))} only-catalog={sorted(set(want) - set(got))}")

    for sid, entry in sorted(editor.get("schemes", {}).items()):
        notes = []
        if sid not in family:
            problems.append(f"{sid}: not in the catalog")
            continue
        if not entry.get("source"):
            problems.append(f"{sid}: missing source")
        missing = [t for t in TOKENS if t not in entry]
        if missing:
            problems.append(f"{sid}: missing token keys {','.join(missing)}")
            lines.append(f"{sid} FAIL missing {','.join(missing)}")
            continue
        bad_hex = [t for t in TOKENS if not is_hex(entry[t])]
        if bad_hex:
            problems.append(f"{sid}: not lowercase #rrggbb: {','.join(bad_hex)}")
            lines.append(f"{sid} FAIL bad hex {','.join(bad_hex)}")
            continue
        text_floor, com_floor = floors_for(sid)
        bg = family[sid]["colors"]["background"]
        fails = []
        for t in TOKENS:
            floor = com_floor if t == "com" else text_floor
            r = contrast(entry[t], bg)
            if r < floor:
                fails.append((t, r, floor))
        if fails:
            for t, r, floor in fails:
                problems.append(f"{sid}.{t}: {r:.2f}:1 on {bg}, floor {floor:.1f}")
            lines.append(f"{sid} FAIL " + "; ".join(f"{t} {r:.2f}:1 < {floor:.1f}" for t, r, floor in fails))
        else:
            adjusted = entry.get("adjusted")
            suffix = f" (adjusted: {', '.join(adjusted)})" if adjusted else ""
            lines.append(f"{sid} ok{suffix}")

    for line in lines:
        print(line)
    if problems:
        print("FAILURES:")
        for p in problems:
            print(f"  {p}")
        return 1
    print("ALL OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
