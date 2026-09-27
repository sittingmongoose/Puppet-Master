#!/usr/bin/env python3
"""R1b rev2 reviewer: separate Claude Code process, Opus 5.5, --effort xhigh requested; tools pinned to
Read/Grep/Glob/Write/Edit (no subagents, web or MCP). Records argv and the init-reported model/effort/tools
(requested effort is never reported as observed effective effort).

B7: the deadline is enforced by the main loop from a monotonic clock, independent of output: a reader thread
feeds a queue, silence or non-JSON lines cannot block the check, and on deadline or response cap the whole
process group is terminated and reaped. The receipt is written in `finally`. Assistant events without a message
id are counted separately. A missing or invalid grades.json makes the review FAILED_INCOMPLETE.
"""
import hashlib
import json
import os
import queue
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path

DEADLINE, RESPONSE_CAP = 2700, 160


def build_cmd(prompt):
    return ["claude", "-p", prompt, "--model", "claude-opus-5-5", "--effort", "xhigh", "--restricted",
            "--tools", "Read,Grep,Glob,Write,Edit", "--strict-mcp-config", "--output-format", "stream-json", "--verbose",
            "--permission-mode", "acceptEdits", "--no-session-persistence"]


def kill_group(proc):
    try:
        os.killpg(proc.pid, signal.SIGTERM)
    except (ProcessLookupError, PermissionError, OSError):
        proc.terminate()


def run(ws, prompt_file, popen=subprocess.Popen, clock=time.monotonic, killer=kill_group,
        deadline=DEADLINE, cap=RESPONSE_CAP, poll=1.0):
    ws, prompt_file = Path(ws).resolve(), Path(prompt_file).resolve()
    log = ws.parent / f"{ws.name}-stream.jsonl"
    cmd = build_cmd(prompt_file.read_text())
    t0 = clock()
    ids, no_id, non_json = set(), 0, 0
    stop, init, result, proc, rc, error = None, {}, {}, None, None, None
    try:
        proc = popen(cmd, cwd=ws, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, start_new_session=True)
        q = queue.Queue()

        def reader():
            for line in proc.stdout:
                q.put(line)
            q.put(None)
        threading.Thread(target=reader, daemon=True).start()
        with log.open("w") as out:
            while True:
                if clock() - t0 > deadline:
                    stop = "cap_seconds"
                    break
                if len(ids) >= cap:
                    stop = "cap_responses"
                    break
                try:
                    line = q.get(timeout=poll)
                except queue.Empty:
                    continue
                if line is None:
                    break
                out.write(line)
                out.flush()
                try:
                    o = json.loads(line)
                except ValueError:
                    non_json += 1
                    continue
                if o.get("type") == "system" and o.get("subtype") == "init":
                    init = {k: o.get(k) for k in ("model", "effort", "tools", "permissionMode")}
                elif o.get("type") == "assistant":
                    mid = (o.get("message") or {}).get("id")
                    if mid:
                        ids.add(mid)
                    else:
                        no_id += 1
                elif o.get("type") == "result":
                    result = {k: o.get(k) for k in ("subtype", "is_error", "duration_ms", "num_turns", "total_cost_usd", "modelUsage")}
        if stop:
            killer(proc)
        try:
            rc = proc.wait(timeout=30)
        except subprocess.TimeoutExpired:
            try:
                os.killpg(proc.pid, signal.SIGKILL)
            except OSError:
                proc.kill()
            rc = proc.wait(timeout=30)
    except Exception as exc:
        error = f"{type(exc).__name__}: {exc}"
        if proc is not None and proc.poll() is None:
            killer(proc)
    finally:
        validation, ok = {}, True
        for f in ("grades.json", "review.md"):
            path = ws / "out" / f
            entry = {"exists": path.exists()}
            if path.exists():
                entry["sha256"] = hashlib.sha256(path.read_bytes()).hexdigest()
                if f.endswith(".json"):
                    try:
                        json.loads(path.read_text())
                        entry["json_valid"] = True
                    except ValueError as exc:
                        entry["json_valid"], entry["json_error"], ok = False, str(exc), False
            else:
                ok = False
            validation[f] = entry
        native_failed = (not result) or bool(result.get("is_error")) or result.get("subtype") != "success"
        status = "FAILED_INCOMPLETE" if (error or stop or not ok or rc != 0 or native_failed) else "COMPLETED"
        res = {"workspace": str(ws), "argv_without_prompt": [c for i, c in enumerate(cmd) if i != 2],
               "effort_requested": "xhigh", "init_reported": init, "effective_effort_observed": init.get("effort"),
               "elapsed_seconds": round(clock() - t0, 1), "distinct_responses": len(ids),
               "assistant_events_without_id": no_id, "non_json_lines": non_json, "stop": stop, "returncode": rc,
               "error": error, "result": result, "native_terminal_failure": native_failed, "host_validation": validation, "review_status": status,
               "stream_log": str(log)}
        (ws.parent / f"{ws.name}-receipt.json").write_text(json.dumps(res, indent=1, default=str) + "\n")
    return res


if __name__ == "__main__":
    r = run(sys.argv[1], sys.argv[2])
    print(json.dumps({k: r[k] for k in ("review_status", "elapsed_seconds", "distinct_responses", "stop", "host_validation")}))
