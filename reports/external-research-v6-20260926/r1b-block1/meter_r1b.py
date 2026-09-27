#!/usr/bin/env python3
"""R1b candidate-lane metering (code only). Unknown stays unknown: Muse reminder-child tokens are not exposed."""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
LAB = HERE.parent.parent
sys.path.insert(0, str(HERE.parent))
from audit_tools import audit  # noqa: E402
from meter import muse_trace  # noqa: E402


def zcode_tool_result_bytes(rollout):
    """Bytes of tool-result messages, each counted once by absolute conversation index (the rollout logs a mix of
    full and delta message lists: request.messages with messagesKind/messageOffset)."""
    seen = {}
    for line in open(rollout, encoding="utf-8"):
        rq = (json.loads(line).get("request") or {})
        off = rq.get("messageOffset") or 0
        for i, m in enumerate(rq.get("messages") or []):
            if m.get("role") == "tool":
                c = m.get("content")
                seen[off + i] = len((c if isinstance(c, str) else json.dumps(c, ensure_ascii=False)).encode())
    return {"tool_results": len(seen), "bytes": sum(seen.values()),
            "note": "tool-result text delivered to the model, each counted once; spilled artifacts count by what was returned"}


def main():
    out = {}
    for arm in sorted((LAB / "r1b/runs").iterdir()):
        rec = json.loads((arm / "arm-receipt.json").read_text()) if (arm / "arm-receipt.json").exists() else {}
        nat = json.loads((arm / "native/receipt.json").read_text()) if (arm / "native/receipt.json").exists() else {}
        app = rec.get("app")
        row = {k: rec.get(k) for k in ("slot", "package", "app", "variant", "outcome", "outcome_detail", "process_exit", "last_native_stop",
                                       "active_span_seconds", "goal_span_seconds", "host_prep_seconds", "assembly_seconds", "native_responses",
                                       "model_id", "effort_effective", "blocks", "delivered_sha256")}
        a = rec.get("assembly") or {}
        row["assembly"] = {k: a.get(k) for k in ("by_status", "complete", "carrier_defects", "unknown_ids", "decision_entries")}
        if rec.get("bundle_summary"):
            b = rec["bundle_summary"]
            row["bundle"] = {"bytes": (arm / "host/bundle/evidence-bundle.md").stat().st_size, "delivered_lines": b.get("delivered_lines"),
                             "cited_lines": b.get("cited_lines"), "sources": b.get("sources")}
        if app == "muse":
            c = nat.get("counters") or {}
            row["tokens"] = {k: c.get(k) for k in ("inputTokens", "cacheReadTokens", "outputTokens", "reasoningTokens", "cacheWriteTokens")}
            row["tokens"]["uncached_input"] = (c.get("inputTokens") or 0) - (c.get("cacheReadTokens") or 0)
            row["usage_window_after"] = ((nat.get("usage_read_after") or {}).get("usage"))
            if (arm / "native/muse-msp.jsonl").exists() and nat.get("session_id"):
                t = muse_trace(nat["session_id"], arm / "native/muse-msp.jsonl")
                row["muse_calls"] = {"parent": t["attempts_terminal_parent"], "reminder_children": t["attempts_terminal_children"],
                                     "child_models": t["child_models"], "child_tokens": "unknown (not exposed)"}
            log = arm / "native/muse-session.jsonl"
            row["tool_result_bytes"] = "unavailable (not exposed in one Muse log)"
        else:
            u = nat.get("usage_totals") or {}
            row["tokens"] = dict(u, uncached_input=(u.get("inputTokens") or 0) - (u.get("cacheReadTokens") or 0))
            row["request_status_counts"] = nat.get("request_status_counts")
            log = arm / "native/zcode-model-io.jsonl"
            row["tool_result_bytes"] = zcode_tool_result_bytes(log) if log.exists() else "unavailable"
        au = audit(app, log, arm / "ws") if log.exists() else {"missing_log": str(log)}
        row["audit"] = {k: au.get(k) for k in ("tool_calls", "tool_call_names", "source_read_calls", "unique_sources_read",
                                               "repeat_source_reads", "web_tool_calls", "shell_calls", "paths_outside_workspace")}
        out[arm.name] = row
    (LAB / "r1b/r1b-meter.json").write_text(json.dumps(out, indent=1, default=str) + "\n")
    for k, r in out.items():
        print(k, r["outcome"], "span", r["active_span_seconds"], "resp", r["native_responses"], "reads", r["audit"].get("source_read_calls"),
              "uncached", r["tokens"].get("uncached_input"), "out", r["tokens"].get("outputTokens"), "asm", r["assembly"].get("by_status"))


if __name__ == "__main__":
    main()
