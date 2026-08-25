#!/usr/bin/env python3
"""Concatenate scratchpad/waves/dataparts/*.js into 5.6 Pro/data.js.

The parts are only an authoring buffer so a crashed agent resumes instead of
restarting; data.js is the artifact of record. Ordering is lexical on the
numeric prefix. data.js is written with the newline style it already has on
disk (LF here -- build.py is the thing that owns CRLF on the deliverables).
"""
import pathlib, sys

HERE = pathlib.Path(__file__).resolve().parent
PARTS = HERE / "dataparts"
TARGET = pathlib.Path("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/data.js")

chunks = []
for p in sorted(PARTS.glob("*.js")):
    t = p.read_text(encoding="utf-8")
    if not t.strip():
        continue
    chunks.append(t.rstrip("\n") + "\n")

out = "\n".join(chunks)
TARGET.write_text(out, encoding="utf-8", newline="\n")
# Report BYTES, not len(out). len() counts characters, and this file carries
# 189 multi-byte UTF-8 chars (·, —, −, ’, →, …) worth 264 extra bytes -- which
# looks exactly like someone else edited the file behind you. Do not remove.
size = TARGET.stat().st_size
print(f"data.js  {size:,} bytes ({len(out):,} chars)  from {len(chunks)} parts")
