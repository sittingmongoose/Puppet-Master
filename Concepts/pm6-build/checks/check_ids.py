#!/usr/bin/env python3
"""check_ids.py — no NEW duplicate ids vs checks/baseline_dup_ids.json (computed
by carve.py from the carved baseline). A baseline dup may not grow its count.
Exit 0 = pass."""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
BUILD = HERE.parent


def main():
    assembled = Path(sys.argv[1]) if len(sys.argv) > 1 else BUILD / "PMConcept6.assembled.html"
    baseline = json.loads((HERE / "baseline_dup_ids.json").read_text(encoding="utf-8"))
    text = assembled.read_text(encoding="utf-8")
    ids = {}
    for m in re.finditer(r'\bid="([^"]+)"', text):
        ids[m.group(1)] = ids.get(m.group(1), 0) + 1
    fails = []
    for k, v in sorted(ids.items()):
        if v > 1:
            if k not in baseline:
                fails.append(f"NEW duplicate id \"{k}\" x{v}")
            elif v > baseline[k]:
                fails.append(f"baseline duplicate id \"{k}\" grew {baseline[k]} -> {v}")
    if fails:
        print("check_ids: FAIL")
        for x in fails:
            print("  -", x)
        sys.exit(1)
    print(f"check_ids: OK ({len(ids)} distinct ids; {len(baseline)} baseline dups unchanged; 0 new dups)")


if __name__ == "__main__":
    main()
