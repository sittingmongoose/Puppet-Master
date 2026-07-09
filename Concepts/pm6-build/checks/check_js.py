#!/usr/bin/env python3
"""check_js.py — extract every <script> body from the assembled HTML and run
`node --check` on each. Exit 0 = all parse."""
import re
import subprocess
import sys
import tempfile
from pathlib import Path

NODE = "/usr/local/bin/node"
HERE = Path(__file__).resolve().parent
BUILD = HERE.parent


def main():
    assembled = Path(sys.argv[1]) if len(sys.argv) > 1 else BUILD / "PMConcept6.assembled.html"
    text = assembled.read_text(encoding="utf-8")
    fails = []
    n = 0
    for m in re.finditer(r"<script\b([^>]*)>(.*?)</script\s*>", text, re.S):
        attrs, body = m.group(1), m.group(2)
        if "src=" in attrs:
            continue
        if not body.strip():
            continue
        n += 1
        line0 = text[:m.start(2)].count("\n") + 1
        sid = (re.search(r'id="([^"]+)"', attrs) or [None, f"script#{n}@line{line0}"])[1]
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as tf:
            tf.write(body)
            tmp = tf.name
        r = subprocess.run([NODE, "--check", tmp], capture_output=True, text=True)
        Path(tmp).unlink(missing_ok=True)
        if r.returncode != 0:
            err = (r.stderr or r.stdout).strip().splitlines()
            # remap temp-file line numbers to document lines
            msg = "; ".join(err[:4])
            fails.append(f"{sid} (starts doc line {line0}): {msg}")
    if fails:
        print("check_js: FAIL")
        for x in fails:
            print("  -", x)
        sys.exit(1)
    print(f"check_js: OK ({n} script blocks parse clean)")


if __name__ == "__main__":
    main()
