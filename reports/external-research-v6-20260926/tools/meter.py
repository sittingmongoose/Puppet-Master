#!/usr/bin/env python3
"""Post-hoc candidate-lane metering and audit for all R1 slots (code only, no model)."""
import glob
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from audit_tools import audit

LAB = Path("/home/sittingmongoose/PM-Experiments/external-research-v6-20260926")
TRACE = Path.home() / ".local/share/muse/local-tracing/bootstrap"


def muse_trace(session_id, msp_log):
    """Count physical provider attempts in the host's tracing log, split parent vs reminder children."""
    children, parent_runs = set(), set()
    for line in open(msp_log, encoding="utf-8", errors="replace"):
        try:
            o = json.loads(line)
        except ValueError:
            continue
        p = o.get("params") or {}
        it = p.get("item") or {}
        if it.get("kind") == "reminderChild" and it.get("childSessionId"):
            children.add(it["childSessionId"])
        if o.get("method") in ("turn/started", "turn/completed") and p.get("turnId"):
            parent_runs.add(p["turnId"])
    logs = [f for f in glob.glob(str(TRACE / "cli-*.log")) if session_id in open(f, errors="replace").read()]
    res = {"trace_logs": logs, "reminder_child_sessions": len(children), "parent_run_ids": len(parent_runs),
           "attempts_terminal_parent": 0, "attempts_terminal_children": 0, "attempts_terminal_other": 0,
           "terminal_outcomes": {}, "child_models": {}}
    for f in logs:
        for line in open(f, errors="replace"):
            if 'event="model.attempt.lifecycle"' not in line or 'phase="terminal"' not in line:
                continue
            rid = re.search(r'run_id="?([0-9a-f-]+)"?', line)
            rid = rid.group(1) if rid else None
            out = re.search(r'outcome="([a-z_]+)"', line)
            res["terminal_outcomes"][out.group(1) if out else "?"] = res["terminal_outcomes"].get(out.group(1) if out else "?", 0) + 1
            model = re.search(r'model="([^"]+)"', line)
            if rid in children:
                res["attempts_terminal_children"] += 1
                m = model.group(1) if model else "?"
                res["child_models"][m] = res["child_models"].get(m, 0) + 1
            elif rid in parent_runs:
                res["attempts_terminal_parent"] += 1
            else:
                res["attempts_terminal_other"] += 1
    return res


def stage(slot_dir, name, app):
    d = slot_dir / name
    if not (d / "receipt.json").exists():
        return None
    r = json.loads((d / "receipt.json").read_text())
    ws = slot_dir / ("ws1" if name == "s1" else "ws2")
    row = {k: r.get(k) for k in ("label", "session_id", "model_id", "provider_id", "effort_effective", "goal_submitted_utc",
                                 "end_utc", "elapsed_seconds", "native_responses", "stop_reason", "goal_status_final",
                                 "driver_error", "prompt_sha256")}
    if app == "muse":
        c = r.get("counters", {})
        row["tokens"] = {k: c.get(k) for k in ("prompt_tokens", "inputTokens", "outputTokens", "reasoningTokens",
                                                 "cacheReadTokens", "cacheWriteTokens", "cachedTokens")}
        row["usage_window_after"] = r.get("usage_read_after")
        if (d / "muse-msp.jsonl").exists() and r.get("session_id"):
            row["tracing"] = muse_trace(r["session_id"], d / "muse-msp.jsonl")
        log = d / "muse-session.jsonl"
    else:
        row["tokens"] = r.get("usage_totals")
        row["request_status_counts"] = r.get("request_status_counts")
        log = d / "zcode-model-io.jsonl"
    row["audit"] = audit(app, log, ws) if log.exists() else {"missing_log": str(log)}
    return row


def main():
    out = {}
    for slot_dir in sorted((LAB / "runs").iterdir()):
        arm = slot_dir / "arm-receipt.json"
        app = "muse" if slot_dir.name.startswith("M-") else "zcode"
        rec = json.loads(arm.read_text()) if arm.exists() else {"incomplete": True}
        out[slot_dir.name] = {"arm": {k: rec.get(k) for k in ("arm_start_utc", "arm_end_utc", "arm_span_seconds", "arm_active_span_seconds",
                                                              "arm_span_seconds_including_fault_wait", "fault_wait_seconds", "runner_version",
                                                              "arm_native_responses", "designated_final",
                                                              "designated_final_sha256", "assignments_dispatched",
                                                              "host_bundle")},
                              "stages": {n: stage(slot_dir, n, app) for n in ("s1", "s2")}}
    (LAB / "ledger/r1-meter.json").write_text(json.dumps(out, indent=1, default=str) + "\n")
    for slot, v in out.items():
        a = v["arm"]
        print(slot, "span", a.get("arm_span_seconds") or a.get("arm_active_span_seconds"), "parent_resp", a.get("arm_native_responses"), "final", bool(a.get("designated_final")))
        for n, s in v["stages"].items():
            if s:
                au = s["audit"]
                print("  ", n, s["stop_reason"], s["elapsed_seconds"], "resp", s["native_responses"],
                      "reads", au.get("source_read_calls"), "uniq", au.get("unique_sources_read"),
                      "repeat", au.get("repeat_source_reads"), "web", len(au.get("web_tool_calls", [])),
                      "shell", len(au.get("shell_calls", [])), "outside", len(au.get("paths_outside_workspace", [])),
                      "children", (s.get("tracing") or {}).get("attempts_terminal_children"))


if __name__ == "__main__":
    main()
