#!/usr/bin/env python3
"""Measure one calibration session from its Claude Code transcript.

usage: measure.py <session name, e.g. T1A> [--projects ~/.claude-t3/party/projects]

Finds the transcript whose first user message carries `Session marker: PILOT-CAL-<name>`, then reports wall time,
tokens (summed once per assistant message id), turns, tool calls, browser-check runs by kind, characters read back by
kind, the final verdict lines, and any command that reached outside the session directory.
"""
import glob, json, os, re, sys
from datetime import datetime

def find(name, root):
    marker = f"Session marker: PILOT-CAL-{name}."
    for f in glob.glob(os.path.join(root, "*", "*.jsonl")):
        try:
            with open(f, errors="replace") as fh:
                head = "".join(line for i, line in zip(range(40), fh))
        except OSError: continue
        # a session's own transcript starts with the marker; the lead's holds it much later, in its delegate call
        if marker in head: return f
    return None

def main():
    name = sys.argv[1]
    root = os.path.expanduser(sys.argv[sys.argv.index("--projects") + 1] if "--projects" in sys.argv else "~/.claude-t3/party/projects")
    f = find(name, root)
    if not f: print(json.dumps({"session": name, "error": "no transcript found"})); return
    sdir = f"/pilot/sessions/{name}"
    usage, order, tools, uses, runs = {}, [], {}, {}, {"task": 0, "scratch": 0, "list": 0, "other": 0}
    read = {"total_chars": 0, "listing_chars": 0, "run_output_chars": 0, "scratch_file_chars": 0, "kit_docs_chars": 0, "images": 0, "other_chars": 0}
    outside, ts, final, model = [], [], "", None
    for line in open(f, errors="replace"):
        try: d = json.loads(line)
        except ValueError: continue
        if d.get("timestamp") and d.get("type") in ("user", "assistant"): ts.append(d["timestamp"])
        if d.get("type") == "assistant":
            m = d["message"]; mid = m.get("id"); model = m.get("model") or model
            if mid not in usage: order.append(mid)
            usage[mid] = m.get("usage") or usage.get(mid) or {}
            for c in m.get("content", []):
                if c.get("type") == "text" and c.get("text", "").strip(): final = c["text"].strip()
                if c.get("type") == "tool_use":
                    tools[c["name"]] = tools.get(c["name"], 0) + 1; uses[c["id"]] = c
                    arg = json.dumps(c.get("input", {}))
                    if c["name"] == "Bash":
                        cmd = c["input"].get("command", "")
                        for m2 in re.finditer(r"browser-check run ([^\s;&|]+)", cmd):
                            k = m2.group(1); runs["task" if "checks/" in k else "scratch" if "scratch/" in k else "list" if "tools/list" in k else "other"] += 1
                    for p in re.findall(r"/home/[^/\s]+/[^\s\"'\\]+", arg):
                        if sdir not in p and "/tmp/" not in p: outside.append(p[:160])
                    if re.search(r"page\.(html|json)", arg) and re.search(r"\b(cat|head|tail|grep|rg|sed|awk|less|Read|strings|python3?|node)\b", arg + c["name"]):
                        if c["name"] in ("Read", "Grep") or re.search(r"(cat|head|tail|grep|rg|sed|awk|less|strings)\s[^|;]*page\.(html|json)", arg): outside.append("reads the page source: " + arg[:140])
        if d.get("type") == "user" and isinstance(d.get("message", {}).get("content"), list):
            for c in d["message"]["content"]:
                if c.get("type") != "tool_result": continue
                u = uses.get(c.get("tool_use_id"), {}); arg = json.dumps(u.get("input", {}))
                parts = c.get("content") if isinstance(c.get("content"), list) else [{"type": "text", "text": str(c.get("content", ""))}]
                for x in parts:
                    if x.get("type") == "image": read["images"] += 1; continue
                    n = len(x.get("text", "")); read["total_chars"] += n
                    kind = ("listing_chars" if "listing.txt" in arg and "browser-check run" not in arg else "kit_docs_chars" if re.search(r"KIT\.md|TASK\.md|browser-check guide", arg) else
                            "run_output_chars" if "browser-check run" in arg else "scratch_file_chars" if "scratch/" in arg or u.get("name") == "Read" else "other_chars")
                    read[kind] += n
    t = lambda s: datetime.fromisoformat(s.replace("Z", "+00:00"))
    tot = {k: sum(u.get(k, 0) or 0 for u in usage.values()) for k in ("input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens", "output_tokens")}
    verdict = re.search(r"VERDICT:\s*(MEETS|DOES_NOT_MEET)", final)
    out = {"session": name, "transcript": os.path.basename(f), "model": model, "wall_seconds": round((t(ts[-1]) - t(ts[0])).total_seconds()) if ts else None,
           "turns": len(order), "tokens": {**tot, "total": sum(tot.values())}, "tool_calls": tools, "tool_calls_total": sum(tools.values()),
           "browser_check_runs": runs, "read_back": read, "stated_verdict": verdict.group(1) if verdict else None, "final_message": final[-400:], "outside_session_dir": sorted(set(outside))[:12]}
    print(json.dumps(out, indent=1))

if __name__ == "__main__":
    main()
