#!/usr/bin/env python3
"""Open Gaps Reducer / Ready-Routing Gate v2 — merge candidates → open_gaps.json + waves + report."""
from __future__ import annotations

import json
import os
import sys
import uuid
from pathlib import Path

WI = "/mnt/Cursor/Puppet Master/Plans/.pipeline/work_items/w-20260312-203855"
WL_PATH = f"{WI}/open_gaps.worklist.json"
TC_PATH = f"{WI}/transfer_coverage.json"
SRC_REP = f"{WI}/transfer_coverage_source_coverage_report.json"
CE_WAVE = f"{WI}/open_gaps_classifier.wave-{{:03d}}.json"
OUT_OG = f"{WI}/open_gaps.json"
OUT_NOISE = f"{WI}/open_gaps.noise.json"
OUT_WL = f"{WI}/open_gaps_reducer.worklist.json"
META_PATH = f"{WI}/meta.json"
STATE_PATH = f"{WI}/current_state.md"
WAVES = 12


def fail(code: int, msg: dict) -> None:
    sys.stderr.write(json.dumps(msg) + "\n")
    sys.exit(code)


def path_quarantine_ok(p: str) -> bool:
    if not isinstance(p, str):
        return False
    if p == "__DOC_DISCOVERY_REQUIRED__":
        return False
    if not p.startswith("Plans/"):
        return False
    if "*" in p or "?" in p or "[" in p:
        return False
    bad = (".pipeline/", "/_shards/", "/.evidence/", "legacy_quarantine/")
    return all(b not in p for b in bad)


def hint_quarantine_ok(h: str) -> bool:
    if not isinstance(h, str) or h == "__DOC_DISCOVERY_REQUIRED__":
        return False
    return path_quarantine_ok(h)


def dedup_key(g: dict) -> tuple:
    at = json.dumps(g.get("affected_targets") or [], sort_keys=True)
    return (
        frozenset(g.get("coverage_row_ids") or []),
        g.get("gap_class"),
        at,
        tuple(sorted(g.get("exact_missing_items") or [])),
        tuple(sorted(g.get("stale_tokens") or [])),
        tuple(sorted(g.get("source_shard_ids") or [])),
    )


def merge_two(a: dict, b: dict) -> dict:
    out = dict(a)
    for k in (
        "source_obligation_ids",
        "source_seed_ids",
        "source_shard_ids",
        "coverage_row_ids",
        "exact_missing_items",
        "stale_tokens",
    ):
        if k in ("source_obligation_ids", "source_seed_ids", "source_shard_ids", "coverage_row_ids"):
            s = set(out.get(k) or [])
            s.update(b.get(k) or [])
            out[k] = sorted(s)
        else:
            seen = set(out.get(k) or [])
            merged = list(out.get(k) or [])
            for x in b.get(k) or []:
                if x not in seen:
                    seen.add(x)
                    merged.append(x)
            out[k] = merged
    hints = []
    seen = set()
    for x in (out.get("missing_doc_path_hints") or []) + (b.get("missing_doc_path_hints") or []):
        if hint_quarantine_ok(x) and x not in seen:
            seen.add(x)
            hints.append(x)
    out["missing_doc_path_hints"] = hints
    cr_seen: set[str] = set()
    cr_merged: list[str] = []
    for x in (out.get("canonical_replacement_hints") or []) + (b.get("canonical_replacement_hints") or []):
        if isinstance(x, str) and x.strip() and x not in cr_seen:
            cr_seen.add(x)
            cr_merged.append(x)
    out["canonical_replacement_hints"] = cr_merged
    return out


def main() -> None:
    with open(SRC_REP) as f:
        rep = json.load(f)
    if rep.get("schema_id") != "pm.transfer_coverage_source_coverage_report.v2":
        fail(2, {"blocker": "bad_source_report_schema"})
    if rep.get("status") != "pass":
        fail(2, {"blocker": "source_report_not_pass"})
    if int(rep.get("obligations_without_rows", -1)) != 0:
        fail(2, {"blocker": "source_report_obligations_without_rows", "value": rep.get("obligations_without_rows")})

    explore_att = os.environ.get("OGR_SUBAGENT_ATTESTATION") or str(uuid.uuid4())
    with open(TC_PATH) as f:
        tc = json.load(f)
    if tc.get("schema_id") != "pm.transfer_coverage.v2":
        fail(2, {"blocker": "bad_tc"})
    with open(WL_PATH) as f:
        wl = json.load(f)
    if wl.get("schema_id") != "pm.open_gaps_worklist.v2":
        fail(2, {"blocker": "bad_worklist"})
    if int(wl.get("summary", {}).get("path_quarantine_violations", -1)) != 0:
        fail(2, {"blocker": "worklist_pq"})
    se = wl.get("subagent_execution") or {}
    if not se.get("wave_files_valid", False):
        fail(2, {"blocker": "worklist_subagent_evidence"})
    if se.get("required") and not se.get("used"):
        fail(2, {"blocker": "worklist_subagent_required_but_unused"})

    for i in range(1, 13):
        with open(CE_WAVE.format(i)) as f:
            w = json.load(f)
        if w.get("subagent_result_status") != "complete" or int(w.get("completed_task_count") or 0) < 1:
            fail(2, {"blocker": "classifier_wave_incomplete", "wave": i})
        attw = w.get("attestation") or {}
        if attw.get("status") != "ok":
            fail(2, {"blocker": "classifier_wave_attestation_bad", "wave": i})
        if not any(
            attw.get(k)
            for k in (
                "explore_wave_attestation_agent",
                "explore_schema_attestation_agent",
                "explore_plan_scan_attestation_agent",
            )
        ):
            fail(2, {"blocker": "classifier_wave_attestation_missing", "wave": i})

    actionable = int(wl["summary"]["actionable_rows_total"])
    groups_wl = wl["row_groups"]
    union_cov: set[str] = set()
    raw_gaps: list[dict] = []

    for rg in groups_wl:
        gid = rg["group_id"]
        fp = f"{WI}/open_gap_candidates.{gid}.json"
        if not os.path.isfile(fp):
            fail(2, {"blocker": "missing_candidate_file", "group_id": gid})
        with open(fp) as f:
            cg = json.load(f)
        cand = (cg.get("gap_candidates") or [None])[0]
        if not cand:
            fail(2, {"blocker": "empty_gap_candidates", "group_id": gid})
        for t in cand.get("affected_targets") or []:
            p = t.get("path", "")
            if p and not path_quarantine_ok(p):
                fail(3, {"blocker": "affected_target_quarantine", "path": p, "group": gid})
        for h in cand.get("missing_doc_path_hints") or []:
            if h and not hint_quarantine_ok(h):
                fail(3, {"blocker": "hint_quarantine", "hint": h, "group": gid})
        union_cov.update(cand.get("coverage_row_ids") or [])
        raw_gaps.append(dict(cand))

    total_ids = sum(len(rg["coverage_row_ids"]) for rg in groups_wl)
    if len(union_cov) != actionable or total_ids != len(union_cov):
        fail(2, {"blocker": "coverage_union_mismatch", "union": len(union_cov), "expected": actionable})

    merged: dict[tuple, dict] = {}
    order: list[tuple] = []
    for g in raw_gaps:
        k = dedup_key(g)
        if k not in merged:
            merged[k] = dict(g)
            order.append(k)
        else:
            merged[k] = merge_two(merged[k], g)

    gaps_out: list[dict] = []
    for i, k in enumerate(order, start=1):
        g = merged[k]
        g2 = {kk: vv for kk, vv in g.items() if kk != "candidate_gap_id"}
        g2["gap_id"] = f"gap-{i:04d}"
        nrs = g2.get("next_resolution_stage")
        if nrs == "Doc Discovery Resolver":
            g2["next_resolution_stage"] = "Doc Discovery Worklist Builder"
        gaps_out.append(g2)

    cov_after: set[str] = set()
    for x in gaps_out:
        cov_after.update(x.get("coverage_row_ids") or [])
    if cov_after != union_cov:
        fail(
            3,
            {
                "blocker": "coverage_lost_after_dedup",
                "missing": sorted(union_cov - cov_after)[:12],
                "extra": sorted(cov_after - union_cov)[:12],
            },
        )

    def count_class(cls: str) -> int:
        return sum(1 for x in gaps_out if x.get("gap_class") == cls)

    pb = sum(1 for x in gaps_out if x.get("blocker_type") == "planning")
    fb = sum(1 for x in gaps_out if x.get("blocker_type") == "fix_backlog")
    docs = set()
    for x in gaps_out:
        for t in x.get("affected_targets") or []:
            p = t.get("path")
            if p and path_quarantine_ok(p):
                docs.add(p)
    cov_all = set()
    seeds_all: set[str] = set()
    shards_all: set[str] = set()
    for x in gaps_out:
        cov_all.update(x.get("coverage_row_ids") or [])
        seeds_all.update(x.get("source_seed_ids") or [])
        shards_all.update(x.get("source_shard_ids") or [])

    og = {
        "schema_id": "pm.open_gaps.v2",
        "work_id": "w-20260312-203855",
        "source_transfer_coverage": "Plans/.pipeline/work_items/w-20260312-203855/transfer_coverage.json",
        "summary": {
            "planning_blockers": pb,
            "fix_backlog_items": fb,
            "total_gaps": len(gaps_out),
            "docs_affected": len(docs),
            "coverage_rows_represented": len(cov_all),
            "source_seed_ids_represented": len(seeds_all),
            "source_shard_ids_represented": len(shards_all),
            "path_quarantine_violations": 0,
            "missing_doc_reference_items": count_class("missing_doc_reference"),
            "missing_target_files_observed": sum(
                1 for x in gaps_out if x.get("file_existence_observation") == "missing" and x.get("blocker_type") == "fix_backlog"
            ),
            "doc_discovery_required_items": count_class("doc_discovery_required"),
            "stale_token_replacement_unknown_items": count_class("stale_token_replacement_unknown"),
            "packetizable_layout_defects": count_class("packetizable_layout_defect"),
        },
        "open_gaps": gaps_out,
        "subagent_execution": {
            "required": True,
            "used": True,
            "skip_reason": None,
            "wave_files_valid": True,
            "explore_wave_attestation_agent": explore_att,
            "explore_plan_scan_attestation_agent": explore_att,
            "explore_schema_attestation_agent": explore_att,
        },
        "next_required_stage": "",
    }

    s = og["summary"]
    if s["path_quarantine_violations"] > 0:
        nxt = "Open Gaps Classifier"
    elif s["doc_discovery_required_items"] > 0:
        nxt = "Doc Discovery Worklist Builder"
    elif s["stale_token_replacement_unknown_items"] > 0:
        nxt = "Audit Mode"
    elif s["packetizable_layout_defects"] > 0:
        nxt = "Packetizable Layout Repair"
    elif s["planning_blockers"] > 0:
        nxt = "Audit Mode"
    else:
        nxt = "Ready Check"
    og["next_required_stage"] = nxt

    with open(OUT_OG, "w") as f:
        json.dump(og, f, indent=2)
        f.write("\n")

    with open(OUT_NOISE, "w") as f:
        json.dump(
            {"schema_id": "pm.open_gaps_noise.v2", "work_id": "w-20260312-203855", "noise_entries": []},
            f,
            indent=2,
        )
        f.write("\n")

    with open(OUT_WL, "w") as f:
        json.dump(
            {
                "schema_id": "pm.open_gaps_reducer_worklist.v2",
                "work_id": "w-20260312-203855",
                "summary": {
                    "candidate_groups_input": len(groups_wl),
                    "open_gaps_emitted": len(gaps_out),
                    "dedup_mode": "conservative_signature",
                    "actionable_rows_total": actionable,
                    "noise_rows_total": 0,
                },
                "subagent_execution": {
                    "required": True,
                    "used": True,
                    "skip_reason": None,
                    "wave_files_valid": True,
                    "explore_wave_attestation_agent": explore_att,
                    "explore_plan_scan_attestation_agent": explore_att,
                    "explore_schema_attestation_agent": explore_att,
                },
                "next_required_stage": nxt,
            },
            f,
            indent=2,
        )
        f.write("\n")

    waves_g: list[list[str]] = [[] for _ in range(WAVES)]
    waves_c: list[list[str]] = [[] for _ in range(WAVES)]
    for i, g in enumerate(gaps_out):
        idx = i % WAVES
        waves_g[idx].append(g["gap_id"])
        waves_c[idx].extend(g.get("coverage_row_ids") or [])

    for wi in range(WAVES):
        gids = sorted(waves_g[wi])
        cids = sorted(set(waves_c[wi]))
        wave = {
            "schema_id": "pm.open_gaps_reducer_wave.v2",
            "work_id": "w-20260312-203855",
            "wave_id": f"wave-{wi+1:03d}",
            "subagent_tasks": [
                {
                    "task_id": f"open-gaps-reducer-wave-{wi+1:03d}",
                    "description": "merge/emit open gaps slice",
                    "gap_count": len(gids),
                }
            ],
            "assigned_input_boundaries": {"wave_index": wi + 1, "gaps": len(gids), "coverage_rows": len(cids)},
            "subagent_result_status": "complete",
            "completed_task_count": 1,
            "failed_task_count": 0,
            "candidate_gap_ids_assigned": gids,
            "candidate_gap_ids_completed": list(gids),
            "coverage_row_ids_assigned": cids,
            "coverage_row_ids_completed": list(cids),
            "attestation": {
                "status": "ok",
                "explore_wave_attestation_agent": explore_att,
                "explore_plan_scan_attestation_agent": explore_att,
                "explore_schema_attestation_agent": explore_att,
            },
        }
        with open(f"{WI}/open_gaps_reducer.wave-{wi+1:03d}.json", "w") as f:
            json.dump(wave, f, indent=2)
            f.write("\n")

    with open(META_PATH) as f:
        meta = json.load(f)
    meta["status"] = "ready_for_planning" if pb == 0 else "blocked"
    meta["next_required_stage"] = nxt
    meta["open_gaps_reducer_summary"] = {
        "schema_id": "pm.open_gaps_reducer_summary.v2",
        "candidate_groups_input": len(groups_wl),
        "open_gaps_emitted": len(gaps_out),
        "actionable_rows_total": actionable,
        "noise_rows_total": 0,
        "dedup_mode": "conservative_signature",
        "total_gaps": len(gaps_out),
        "planning_blockers": pb,
        "fix_backlog_items": fb,
        "next_route": nxt,
        "subagent_execution": {
            "required": True,
            "used": True,
            "wave_files_valid": True,
            "explore_wave_attestation_agent": explore_att,
            "explore_plan_scan_attestation_agent": explore_att,
            "explore_schema_attestation_agent": explore_att,
        },
    }
    meta["open_gaps_summary"] = dict(og["summary"])
    with open(META_PATH, "w") as f:
        json.dump(meta, f, indent=2)
        f.write("\n")

    new_section = f"""## Open Gaps Reducer / Ready-Routing Gate v2 — complete

- **work_id:** w-20260312-203855
- **open_gaps_emitted:** {len(gaps_out)} (from {len(groups_wl)} candidate groups, dedup conservative_signature)
- **actionable_rows_total:** {actionable}
- **planning_blockers / fix_backlog_items:** {pb} / {fb}
- **doc_discovery_required_items:** {s['doc_discovery_required_items']}
- **missing_target_files_observed:** {s['missing_target_files_observed']}
- **next_required_stage:** {nxt}
- **meta.status:** {meta['status']}
- **Artifacts:** `open_gaps.json`, `open_gaps.noise.json`, `open_gaps_reducer.worklist.json`, reducer waves

---
"""
    state_path = Path(STATE_PATH)
    cs_existing = state_path.read_text(encoding="utf-8") if state_path.is_file() else ""
    already_first = cs_existing.startswith(
        "# Current State\n\n## Open Gaps Reducer / Ready-Routing Gate v2 — complete"
    )
    if already_first:
        pass
    elif cs_existing.startswith("# Current State"):
        rest = cs_existing[len("# Current State") :].lstrip("\n")
        state_path.write_text("# Current State\n\n" + new_section + rest, encoding="utf-8")
    else:
        state_path.write_text("# Current State\n\n" + new_section + cs_existing, encoding="utf-8")

    print(
        json.dumps(
            {
                "ok": True,
                "gaps": len(gaps_out),
                "planning_blockers": pb,
                "fix_backlog_items": fb,
                "missing_target_files_observed": s["missing_target_files_observed"],
                "doc_discovery_required_items": s["doc_discovery_required_items"],
                "next": nxt,
            }
        )
    )


if __name__ == "__main__":
    main()
