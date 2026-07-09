#!/usr/bin/env python3
"""check_original.py — Concepts/PMConcept4.html sha256 must equal
checks/pmconcept4.sha256 (source must never be modified). Exit 0 = pass."""
import hashlib
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
BUILD = HERE.parent
ORIGINAL = BUILD.parent / "PMConcept4.html"


def main():
    want = (HERE / "pmconcept4.sha256").read_text(encoding="utf-8").split()[0].strip()
    got = hashlib.sha256(ORIGINAL.read_bytes()).hexdigest()
    if got != want:
        print(f"check_original: FAIL — PMConcept4.html sha256 {got} != recorded {want}. THE SOURCE WAS MODIFIED.")
        sys.exit(1)
    print(f"check_original: OK (PMConcept4.html sha256 {got[:16]}… matches record)")


if __name__ == "__main__":
    main()
