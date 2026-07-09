#!/usr/bin/env python3
"""check_structure.py — tag balance global + per-part delta vs manifest.lock;
single <body>; </html> last. Exit 0 = pass."""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
BUILD = HERE.parent
TAGS = ["div", "span", "style", "script", "template"]


def tag_deltas(text):
    return {t: len(re.findall(r"<%s\b" % t, text)) - len(re.findall(r"</%s\b" % t, text))
            for t in TAGS}


def main():
    assembled = Path(sys.argv[1]) if len(sys.argv) > 1 else BUILD / "PMConcept6.assembled.html"
    lock = json.loads((BUILD / "manifest.lock").read_text(encoding="utf-8"))
    manifest = json.loads((BUILD / "manifest.json").read_text(encoding="utf-8"))
    text = assembled.read_text(encoding="utf-8")
    fails = []

    # global balance vs lock
    cur = tag_deltas(text)
    ref = lock["global"]["deltas"]
    for t in TAGS:
        if cur[t] != ref[t]:
            fails.append(f"global {t} delta {cur[t]} != lock {ref[t]}")

    # single <body>
    nb = len(re.findall(r"<body\b", text))
    if nb != lock["global"].get("body_open_count", 1):
        fails.append(f"<body> count {nb} != {lock['global'].get('body_open_count', 1)}")

    # </html> last non-whitespace content
    tail = text.rstrip()
    if not tail.endswith("</html>"):
        fails.append("</html> is not the last content in the file")

    # per-part deltas vs lock
    for e in manifest["parts"]:
        f = e["file"]
        p = BUILD / "parts" / f
        if not p.exists():
            fails.append(f"missing part file: {f}")
            continue
        d = tag_deltas(p.read_text(encoding="utf-8"))
        want = lock["parts"][f]["deltas"]
        for t in TAGS:
            if d[t] != want[t]:
                fails.append(f"part {f}: {t} delta {d[t]} != lock {want[t]}")

    if fails:
        print("check_structure: FAIL")
        for x in fails:
            print("  -", x)
        sys.exit(1)
    print(f"check_structure: OK (global deltas {cur}, body x{nb}, </html> last, {len(manifest['parts'])} parts match lock)")


if __name__ == "__main__":
    main()
