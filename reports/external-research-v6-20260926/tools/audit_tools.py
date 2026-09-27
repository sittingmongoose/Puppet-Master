#!/usr/bin/env python3
"""Post-hoc mechanical audit of one stage's native tool calls (no model).

Reports tool-call counts, source reads per handle (case/sources/Sxxx.txt), repeat reads, searches,
web/network or shell use, and any path outside the stage workspace. Reads the app's own logs:
Muse session.jsonl (assistant_tool_calls_committed) or zcode rollout model-io.jsonl (tool_use blocks).
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

WEB = re.compile(r"web|fetch|browse|search_web|http", re.I)
SHELL = re.compile(r"shell|bash|exec|command|terminal", re.I)
HANDLE = re.compile(r"sources/(S\d{3})\.txt")


def muse_calls(path):
    calls, responses = [], set()
    for line in open(path, encoding="utf-8"):
        o = json.loads(line)
        ev = (o.get("payload") or {}).get("event")
        if isinstance(ev, dict) and ev.get("kind") == "assistant_tool_calls_committed":
            responses.add(ev.get("response_id"))
            for c in ev.get("tool_calls", []):
                try:
                    args = json.loads(c.get("args") or "{}")
                except ValueError:
                    args = {"_raw": c.get("args")}
                calls.append((c.get("name"), args))
    return calls, len(responses)


def zcode_calls(path):
    calls, ids, web_server = [], set(), 0
    for line in open(path, encoding="utf-8"):
        o = json.loads(line)
        resp = o.get("response") or {}
        ids.add(resp.get("responseId") or o.get("requestId"))
        web_server += int((((resp.get("providerMetadata") or {}).get("anthropic") or {}).get("usage") or {})
                          .get("server_tool_use", {}).get("web_search_requests") or 0)
        for c in resp.get("toolCalls") or []:
            calls.append((c.get("name"), c.get("input") or {}))
    if web_server:
        calls.append(("server_web_search_requests", {"count": web_server}))
    return calls, len(ids)


def paths_in(args):
    out = []
    for k, v in (args or {}).items():
        if isinstance(v, str) and (k.lower() in {"path", "file_path", "filepath", "file", "paths", "dir", "directory", "cwd"} or v.startswith("/")):
            out.append(v)
        elif isinstance(v, list):
            out += [x for x in v if isinstance(x, str) and ("/" in x or x.endswith(".txt") or x.endswith(".md"))]
    return out


def audit(app, log, workspace):
    calls, responses = (muse_calls if app == "muse" else zcode_calls)(log)
    ws = str(Path(workspace).resolve())
    names = Counter(n for n, _ in calls)
    reads = Counter()
    outside, web, shell = [], [], []
    for name, args in calls:
        for p in paths_in(args):
            if p.startswith("/") and not p.startswith(ws):
                outside.append({"tool": name, "path": p})
            m = HANDLE.search(p)
            if m and re.search(r"read|view|open|cat", name or "", re.I):
                reads[m.group(1)] += 1
        if name and WEB.search(name):
            web.append({"tool": name, "args": str(args)[:200]})
        if name and SHELL.search(name) and not re.search(r"read|grep|glob", name, re.I):
            shell.append({"tool": name, "args": str(args)[:300]})
    return {"log": str(log), "tool_calls": len(calls), "tool_call_names": dict(names),
            "responses_seen_in_log": responses, "source_read_calls": sum(reads.values()),
            "unique_sources_read": len(reads), "repeat_source_reads": sum(c - 1 for c in reads.values()),
            "reads_per_source": dict(sorted(reads.items())), "web_tool_calls": web, "shell_calls": shell,
            "paths_outside_workspace": outside}


if __name__ == "__main__":
    app, log, ws = sys.argv[1:4]
    print(json.dumps(audit(app, log, ws), indent=1))
