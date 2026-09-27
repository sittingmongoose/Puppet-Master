#!/usr/bin/env python3
import json
from pathlib import Path
LAB = Path("/home/sittingmongoose/PM-Experiments/external-research-v6-20260926")
m = json.loads((LAB / "ledger/r1-meter.json").read_text())
qc = json.loads((LAB / "ledger/quote-check-v2-diagnostic.json").read_text())
rows, per = [], {}
def tok(s):
    t = s["tokens"] or {}
    if "inputTokens" in t and "cacheReadTokens" in t:
        return t.get("inputTokens", 0), t.get("cacheReadTokens", 0), t.get("outputTokens", 0), t.get("reasoningTokens", 0)
    return None
for slot in ("M-control", "M-candidate", "Z-candidate", "Z-control"):
    v = m[slot]; a = v["arm"]; st = v["stages"]
    per[slot] = {}
    for n in ("s1", "s2"):
        s = st[n]; i, c, o, r = tok(s)
        tr = s.get("tracing") or {}
        per[slot][n] = {"span": s["elapsed_seconds"], "resp": s["native_responses"], "child": tr.get("attempts_terminal_children"),
                        "in": i, "cache": c, "uncached": i - c, "out": o, "reason": r,
                        "reads": s["audit"]["source_read_calls"], "uniq": s["audit"]["unique_sources_read"],
                        "rep": s["audit"]["repeat_source_reads"], "tools": s["audit"]["tool_calls"]}
    per[slot]["arm_active"] = a.get("arm_span_seconds") or a.get("arm_active_span_seconds")
    per[slot]["fault_wait"] = a.get("fault_wait_seconds") or 0
L = ["| slot | stage | span s | parent resp | Muse child calls | input tok | cache-read | uncached in | output | reasoning | tool calls | source reads | unique | repeats |",
     "|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|"]
for slot, d in per.items():
    for n in ("s1", "s2"):
        x = d[n]
        L.append(f"| {slot} | {n} | {x['span']:.0f} | {x['resp']} | {x['child'] if x['child'] is not None else 'n/a'} | {x['in']:,} | {x['cache']:,} | {x['uncached']:,} | {x['out']:,} | {x['reason']:,} | {x['tools']} | {x['reads']} | {x['uniq']} | {x['rep']} |")
L.append("")
L.append("| slot | arm active span s | fault wait s (excluded) | parent resp | total input | total uncached | total output |")
L.append("|---|---:|---:|---:|---:|---:|---:|")
for slot, d in per.items():
    L.append(f"| {slot} | {d['arm_active']:.0f} | {d['fault_wait']:.0f} | {d['s1']['resp']+d['s2']['resp']} | {d['s1']['in']+d['s2']['in']:,} | {d['s1']['uncached']+d['s2']['uncached']:,} | {d['s1']['out']+d['s2']['out']:,} |")
L.append("")
L.append("| pair | metric | control | candidate | candidate/control |")
L.append("|---|---|---:|---:|---:|")
for app, c, k in (("Muse", "M-control", "M-candidate"), ("zcode", "Z-control", "Z-candidate")):
    for label, f in (("stage-2 span s", lambda d: d["s2"]["span"]), ("stage-2 parent responses", lambda d: d["s2"]["resp"]),
                     ("stage-2 source reads", lambda d: d["s2"]["reads"]), ("stage-2 uncached input", lambda d: d["s2"]["uncached"]),
                     ("stage-2 output tokens", lambda d: d["s2"]["out"]), ("arm active span s", lambda d: d["arm_active"]),
                     ("arm parent responses", lambda d: d["s1"]["resp"] + d["s2"]["resp"]),
                     ("arm uncached input", lambda d: d["s1"]["uncached"] + d["s2"]["uncached"]),
                     ("arm output tokens", lambda d: d["s1"]["out"] + d["s2"]["out"])):
        cv, kv = f(per[c]), f(per[k])
        L.append(f"| {app} | {label} | {cv:,.0f} | {kv:,.0f} | {kv / cv:.2f} |")
L.append("")
L.append("Stage-1 quote fidelity (post-hoc corrected diagnostic): " + "; ".join(f"{s}: {v}" for s, v in qc.items()))
(LAB / "ledger/r1-economics.md").write_text("\n".join(L) + "\n")
(LAB / "ledger/r1-economics.json").write_text(json.dumps(per, indent=1) + "\n")
print("\n".join(L))
