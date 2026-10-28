#!/usr/bin/env python3
"""Build a self-contained HTML file of the Pip-in-the-chat concept, for sharing.

Writes OUTDIR/pip-chat.html: this folder's index.html with the 5.6 Pro chat carried inside its frame (srcdoc), and
Pip's layer (pip-chat.css, the logo kit, the onboarding's sound.js, pip-chat.js) inlined into that chat, so the file
opens by double-click with no server and no network. The chat's own bundle is already self-contained.

    python3 tools/build_standalone.py OUTDIR
"""
import html
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent.parent
CHAT = HERE.parent / "5.6 Pro" / "index.html"
PARTS = [
    ("style", HERE / "pip-chat.css"),
    ("script", HERE.parent.parent / "Icon-Concepts" / "Opus5.5icon" / "pm-logo.js"),
    ("script", HERE.parent.parent / "onboarding" / "opus-5.5-pip" / "sound.js"),
    ("script", HERE / "pip-chat.js"),
]


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    out = pathlib.Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    chat = CHAT.read_text(encoding="utf-8")
    layer = ""
    for tag, path in PARTS:
        body = path.read_text(encoding="utf-8")
        if f"</{tag}" in body:
            sys.exit(f"build_standalone: {path.name} contains a closing {tag} tag")
        layer += f"<{tag}>\n{body}\n</{tag}>\n"
    cut = chat.rfind("</body>")
    if cut < 0:
        sys.exit("build_standalone: the chat bundle has no </body>")
    chat = chat[:cut] + layer + chat[cut:]
    chat, n = re.subn(r"<html\b", '<html data-pip-chat="on"', chat, count=1)
    if n != 1:
        sys.exit("build_standalone: the chat bundle has no <html> tag")
    host = (HERE / "index.html").read_text(encoding="utf-8")
    frame = 'src="../5.6%20Pro/index.html"'
    if frame not in host:
        sys.exit("build_standalone: index.html no longer frames ../5.6%20Pro/index.html")
    host = host.replace(frame, 'srcdoc="' + html.escape(chat, quote=True) + '"')
    target = out / "pip-chat.html"
    target.write_text(host, encoding="utf-8")
    print(f"{target} ({target.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
