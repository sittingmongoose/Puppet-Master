#!/usr/bin/env python3
"""Run one independent Opus 5.5 xhigh reviewer as a separate Claude Code process (clean context).

claude -p --model claude-opus-5-5 --effort xhigh --restricted (file tools confined to the review workspace,
no Bash/WebFetch, user/project settings ignored). Caps: 2700 s, 160 distinct model responses (message ids).
"""
import json, subprocess, sys, time
from pathlib import Path
ws, prompt_file = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
log = ws.parent / f"{ws.name}-stream.jsonl"
prompt = prompt_file.read_text()
cmd = ["claude", "-p", prompt, "--model", "claude-opus-5-5", "--effort", "xhigh", "--restricted",
       "--output-format", "stream-json", "--verbose", "--permission-mode", "acceptEdits",
       "--allowedTools", "Read Grep Glob Write Edit", "--no-session-persistence"]
t0 = time.time(); ids = set(); stop = None
with log.open("w") as out:
    p = subprocess.Popen(cmd, cwd=ws, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    for line in p.stdout:
        out.write(line); out.flush()
        try: o = json.loads(line)
        except ValueError: continue
        if o.get("type") == "assistant":
            ids.add((o.get("message") or {}).get("id"))
        if time.time() - t0 > 2700 or len(ids) >= 160:
            stop = "cap_seconds" if time.time() - t0 > 2700 else "cap_responses"; p.terminate(); break
    p.wait(timeout=60)
res = {"workspace": str(ws), "elapsed_seconds": round(time.time() - t0, 1), "distinct_responses": len(ids),
       "stop": stop, "returncode": p.returncode, "stream_log": str(log)}
(ws.parent / f"{ws.name}-receipt.json").write_text(json.dumps(res, indent=1) + "\n")
print(json.dumps(res))
