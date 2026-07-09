#!/usr/bin/env python3
"""check_settings_data.py — sidecar/pm_settings_data.json parses, has categories
+ settings keys, every settings[].tier in {simple, advanced}; assembled file
contains exactly one PM_SETTINGS_DATA assignment. Exit 0 = pass."""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
BUILD = HERE.parent


def main():
    assembled = Path(sys.argv[1]) if len(sys.argv) > 1 else BUILD / "PMConcept6.assembled.html"
    side = BUILD / "sidecar" / "pm_settings_data.json"
    fails = []
    try:
        data = json.loads(side.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"check_settings_data: FAIL — sidecar does not parse: {e}")
        sys.exit(1)
    for key in ("categories", "settings"):
        if key not in data:
            fails.append(f"sidecar missing top-level key {key!r}")
    bad = [s.get("id", "?") for s in data.get("settings", [])
           if s.get("tier") not in ("simple", "advanced")]
    if bad:
        fails.append(f"{len(bad)} setting(s) with tier not in {{simple,advanced}}: {bad[:10]}")
    n = assembled.read_text(encoding="utf-8").count("window.PM_SETTINGS_DATA = {")
    if n != 1:
        fails.append(f"assembled contains {n} PM_SETTINGS_DATA assignments (want 1)")
    if fails:
        print("check_settings_data: FAIL")
        for x in fails:
            print("  -", x)
        sys.exit(1)
    print(f"check_settings_data: OK ({len(data['categories'])} categories, {len(data['settings'])} settings, all tiers valid, 1 assignment in assembled)")


if __name__ == "__main__":
    main()
