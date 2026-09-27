#!/usr/bin/env python3
"""R1b reviewer: separate Claude Code process, Opus 5.5, --effort xhigh requested; tools pinned to
Read/Grep/Glob/Write/Edit (no subagents, web or MCP); records argv, init tools/effort fields; host validates JSON."""
import hashlib, json, subprocess, sys, time
from pathlib import Path
ws, prompt_file = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
log = ws.parent / f"{ws.name}-stream.jsonl"
cmd = ["claude", "-p", prompt_file.read_text(), "--model", "claude-opus-5-5", "--effort", "xhigh", "--restricted",
       "--tools", "Read,Grep,Glob,Write,Edit", "--strict-mcp-config", "--output-format", "stream-json", "--verbose",
       "--permission-mode", "acceptEdits", "--no-session-persistence"]
t0 = time.time(); ids = set(); stop = None; init = {}; result = {}
with log.open("w") as out:
    p = subprocess.Popen(cmd, cwd=ws, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    for line in p.stdout:
        out.write(line); out.flush()
        try: o = json.loads(line)
        except ValueError: continue
        if o.get("type") == "system" and o.get("subtype") == "init":
            init = {k: o.get(k) for k in ("model", "effort", "tools", "permissionMode")}
        if o.get("type") == "assistant":
            ids.add((o.get("message") or {}).get("id"))
        if o.get("type") == "result":
            result = {k: o.get(k) for k in ("subtype", "is_error", "duration_ms", "num_turns", "total_cost_usd", "modelUsage")}
        if time.time() - t0 > 2700 or len(ids) >= 160:
            stop = "cap_seconds" if time.time() - t0 > 2700 else "cap_responses"; p.terminate(); break
    p.wait(timeout=60)
validation = {}
for f in ("grades.json", "review.md"):
    path = ws / "out" / f
    entry = {"exists": path.exists()}
    if path.exists():
        entry["sha256"] = hashlib.sha256(path.read_bytes()).hexdigest()
        if f.endswith(".json"):
            try: json.loads(path.read_text()); entry["json_valid"] = True
            except ValueError as exc: entry["json_valid"] = False; entry["json_error"] = str(exc)
    validation[f] = entry
res = {"workspace": str(ws), "argv_without_prompt": [c for c in cmd if c != cmd[2]], "effort_requested": "xhigh",
       "init_reported": init, "elapsed_seconds": round(time.time() - t0, 1), "distinct_responses": len(ids),
       "stop": stop, "returncode": p.returncode, "result": result, "host_validation": validation, "stream_log": str(log)}
(ws.parent / f"{ws.name}-receipt.json").write_text(json.dumps(res, indent=1) + "\n")
print(json.dumps({k: res[k] for k in ("elapsed_seconds", "distinct_responses", "stop", "host_validation")}))
