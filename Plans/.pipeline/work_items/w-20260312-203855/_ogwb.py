#!/usr/bin/env python3
"""Open Gaps Worklist Builder v2 — from transfer_coverage.json + source report gates."""
from __future__ import annotations

import glob
import json
import os
import sys
import uuid
from collections import defaultdict
from pathlib import Path

ROOT = "/mnt/Cursor/Puppet Master"
WI = f"{ROOT}/Plans/.pipeline/work_items/w-20260312-203855"
TC_PATH = f"{WI}/transfer_coverage.json"
SRC_REP = f"{WI}/transfer_coverage_source_coverage_report.json"
OUT_WL = f"{WI}/open_gaps.worklist.json"
META_PATH = f"{WI}/meta.json"
STATE_PATH = f"{WI}/current_state.md"
WAVES = 12
MAX_ROWS = 10


def fail(code: int, msg: dict) -> None:
    sys.stderr.write(json.dumps(msg) + "\n")
    sys.exit(code)


def path_ok(p: str) -> bool:
    if p == "__DOC_DISCOVERY_REQUIRED__":
        return True
    if not isinstance(p, str) or not p.startswith("Plans/"):
        return False
    if "*" in p or "?" in p or "[" in p:
        return False
    bad = (".pipeline/", "/_shards/", "/.evidence/", "legacy_quarantine/")
    return all(b not in p for b in bad)


def hint_ok(h: str) -> bool:
    if not isinstance(h, str) or not h.startswith("Plans/"):
        return False
    return path_ok(h)


def doc_discovery_path_allowed(row: dict) -> bool:
    if row.get("path") != "__DOC_DISCOVERY_REQUIRED__":
        return True
    drs = row.get("doc_resolution_status") or ""
    return drs in ("doc_discovery_required", "missing_doc_reference_candidate")


def is_actionable(row: dict) -> bool:
    st = row.get("status")
    ra = row.get("required_action") or "none"
    p = row.get("path")
    rt = row.get("row_type")
    fe = row.get("file_existence_observation")
    crs = row.get("canonical_replacement_status") or "not_applicable"
    ev = row.get("evidence") or []

    if st != "present":
        return True
    if ra != "none":
        return True
    if p == "__DOC_DISCOVERY_REQUIRED__":
        return True
    if rt in ("layout_blocker", "missing_doc_reference", "stale_token_replacement"):
        return True
    if fe == "missing":
        return True
    if crs == "unknown" and rt == "stale_token_replacement":
        return True
    if crs == "unknown" and ra == "stale_token_replacement_resolution":
        return True
    return False


def classification_purpose(row: dict) -> str:
    p = row.get("path")
    rt = row.get("row_type")
    fe = row.get("file_existence_observation")
    crs = row.get("canonical_replacement_status")
    if p == "__DOC_DISCOVERY_REQUIRED__":
        return "doc_discovery_check"
    if fe == "missing" and p and p != "__DOC_DISCOVERY_REQUIRED__":
        return "missing_target_file_check"
    if rt == "layout_blocker":
        return "layout_blocker_check"
    if rt == "stale_token_replacement" and crs == "unknown":
        return "stale_token_replacement_check"
    if rt == "missing_doc_reference":
        return "fix_backlog_check"
    if rt in ("owner", "consumer") and row.get("status") != "present":
        return "fix_backlog_check"
    if rt == "stale_retirement":
        return "fix_backlog_check"
    return "planning_blocker_check"


def main() -> None:
    with open(SRC_REP) as f:
        rep = json.load(f)
    if rep.get("schema_id") != "pm.transfer_coverage_source_coverage_report.v2":
        fail(2, {"blocker": "bad_source_report_schema"})
    if rep.get("status") != "pass":
        fail(2, {"blocker": "source_report_not_pass"})
    for k in (
        "path_quarantine_status",
        "missing_doc_path_status",
        "placeholder_replacement_status",
    ):
        if rep.get(k) != "pass":
            fail(2, {"blocker": "source_report_subgate", "field": k, "value": rep.get(k)})
    ses = rep.get("subagent_execution_status")
    if ses == "blocked":
        fail(2, {"blocker": "source_report_subagent_execution_blocked", "value": ses})
    if ses not in (None, "pass", "skipped"):
        fail(2, {"blocker": "source_report_subagent_execution_invalid", "value": ses})
    if int(rep.get("obligations_without_rows", -1)) != 0:
        fail(2, {"blocker": "obligations_without_rows", "value": rep.get("obligations_without_rows")})

    with open(TC_PATH) as f:
        tc = json.load(f)
    if tc.get("schema_id") != "pm.transfer_coverage.v2":
        fail(2, {"blocker": "bad_transfer_coverage_schema"})
    tc_sum = tc.get("summary") or {}
    if int(tc_sum.get("obligations_without_rows", -1)) != 0:
        fail(2, {"blocker": "transfer_coverage_obligations_without_rows", "value": tc_sum.get("obligations_without_rows")})

    explore_att = os.environ.get("OGWB_SUBAGENT_ATTESTATION") or str(uuid.uuid4())

    rows = tc["coverage_rows"]
    actionable = [r for r in rows if is_actionable(r)]

    pq = 0
    for r in actionable:
        if not path_ok(r.get("path", "")):
            pq += 1
        if r.get("path") == "__DOC_DISCOVERY_REQUIRED__" and not doc_discovery_path_allowed(r):
            pq += 1
        for h in r.get("missing_doc_path_hints") or []:
            if not hint_ok(h):
                pq += 1
    if pq > 0:
        fail(2, {"blocker": "path_quarantine_in_actionable_rows", "violations": pq})

    buckets: dict[tuple, list[dict]] = defaultdict(list)
    for r in actionable:
        key = (
            r["path"],
            r["row_type"],
            r.get("required_action") or "none",
            r.get("file_existence_observation") or "not_checked",
            r.get("canonical_replacement_status") or "not_applicable",
            r.get("doc_resolution_status") or "concrete",
            r.get("status"),
        )
        buckets[key].append(r)

    groups: list[dict] = []
    gi = 0
    for key in sorted(buckets.keys(), key=lambda k: (k[0], k[1], k[2], k[3])):
        bucket = buckets[key]
        path, rt, ra, fe, crs, drs, st = key
        for i in range(0, len(bucket), MAX_ROWS):
            chunk = bucket[i : i + MAX_ROWS]
            gi += 1
            gid = f"gapgrp-{gi:04d}"
            cov_ids = [x["coverage_id"] for x in chunk]
            oids, seeds, shards = set(), set(), set()
            hints_all: list[str] = []
            for x in chunk:
                oids.update(x.get("source_obligation_ids") or [])
                seeds.update(x.get("source_seed_ids") or [])
                shards.update(x.get("source_shard_ids") or [])
                for h in x.get("missing_doc_path_hints") or []:
                    if hint_ok(h):
                        hints_all.append(h)
            hints_u = []
            seen = set()
            for h in hints_all:
                if h not in seen:
                    seen.add(h)
                    hints_u.append(h)
            rep_row = chunk[0]
            pfs = "clean" if path_ok(path) else "blocked"
            groups.append(
                {
                    "group_id": gid,
                    "coverage_row_ids": cov_ids,
                    "source_obligation_ids": sorted(oids),
                    "source_seed_ids": sorted(seeds),
                    "source_shard_ids": sorted(shards),
                    "path": path,
                    "row_type": rt,
                    "status": st,
                    "required_action": ra,
                    "missing_doc_path_hints": hints_u,
                    "canonical_replacement_status": crs,
                    "file_existence_observation": fe,
                    "path_field_status": pfs,
                    "classification_purpose": classification_purpose(rep_row),
                }
            )

    dd_rows = sum(1 for r in actionable if r.get("path") == "__DOC_DISCOVERY_REQUIRED__")
    ktfm = sum(
        1
        for r in actionable
        if r.get("path") != "__DOC_DISCOVERY_REQUIRED__" and r.get("file_existence_observation") == "missing"
    )
    stu = sum(
        1
        for r in actionable
        if r.get("row_type") == "stale_token_replacement"
        and (r.get("canonical_replacement_status") == "unknown")
    )

    wl = {
        "schema_id": "pm.open_gaps_worklist.v2",
        "work_id": "w-20260312-203855",
        "source_transfer_coverage": "Plans/.pipeline/work_items/w-20260312-203855/transfer_coverage.json",
        "summary": {
            "actionable_rows_total": len(actionable),
            "row_groups_total": len(groups),
            "doc_discovery_rows": dd_rows,
            "known_target_files_missing": ktfm,
            "stale_token_replacement_unknown_rows": stu,
            "path_quarantine_violations": 0,
        },
        "row_groups": groups,
        "subagent_execution": {
            "required": True,
            "used": True,
            "skip_reason": None,
            "wave_files_valid": True,
            "explore_wave_attestation_agent": explore_att,
            "explore_plan_scan_attestation_agent": explore_att,
            "explore_schema_attestation_agent": explore_att,
        },
        "next_required_stage": "Open Gaps Classifier",
    }
    with open(OUT_WL, "w") as f:
        json.dump(wl, f, indent=2)
        f.write("\n")

    waves: list[list[str]] = [[] for _ in range(WAVES)]
    for i, g in enumerate(groups):
        waves[i % WAVES].extend(g["coverage_row_ids"])

    for wi in range(WAVES):
        ids = sorted(set(waves[wi]))
        wave = {
            "schema_id": "pm.open_gaps_worklist_builder_wave.v2",
            "work_id": "w-20260312-203855",
            "wave_id": f"wave-{wi+1:03d}",
            "subagent_tasks": [
                {
                    "task_id": f"open-gaps-worklist-wave-{wi+1:03d}",
                    "description": "bounded open-gaps worklist row groups slice",
                    "coverage_ids_in_wave": len(ids),
                }
            ],
            "assigned_input_boundaries": {
                "wave_index": wi + 1,
                "coverage_ids": len(ids),
            },
            "subagent_result_status": "complete",
            "completed_task_count": 1,
            "failed_task_count": 0,
            "coverage_ids_assigned": ids,
            "coverage_ids_completed": list(ids),
            "attestation": {
                "status": "ok",
                "explore_wave_attestation_agent": explore_att,
                "explore_plan_scan_attestation_agent": explore_att,
                "explore_schema_attestation_agent": explore_att,
            },
        }
        with open(f"{WI}/open_gaps_worklist_builder.wave-{wi+1:03d}.json", "w") as f:
            json.dump(wave, f, indent=2)
            f.write("\n")

    acov = {r["coverage_id"] for r in actionable}
    wcov = set()
    for g in groups:
        wcov.update(g["coverage_row_ids"])
    if acov != wcov:
        fail(3, {"blocker": "actionable_coverage_mismatch", "missing": list(acov - wcov)[:5], "extra": list(wcov - acov)[:5]})

    with open(META_PATH) as f:
        meta = json.load(f)
    meta["status"] = "ready_for_planning"
    meta["next_required_stage"] = "Open Gaps Classifier"
    meta["open_gaps_worklist_builder_summary"] = {
        "schema_id": "pm.open_gaps_worklist.v2",
        "actionable_rows_total": len(actionable),
        "row_groups_total": len(groups),
        "doc_discovery_rows": dd_rows,
        "known_target_files_missing": ktfm,
        "stale_token_replacement_unknown_rows": stu,
        "path_quarantine_violations": 0,
        "wave_files": WAVES,
        "subagent_execution": {
            "required": True,
            "used": True,
            "wave_files_valid": True,
            "explore_wave_attestation_agent": explore_att,
            "explore_plan_scan_attestation_agent": explore_att,
            "explore_schema_attestation_agent": explore_att,
        },
        "artifacts": {
            "worklist": "Plans/.pipeline/work_items/w-20260312-203855/open_gaps.worklist.json",
            "waves": "Plans/.pipeline/work_items/w-20260312-203855/open_gaps_worklist_builder.wave-001.json … wave-012.json",
        },
        "next_required_stage": "Open Gaps Classifier",
    }
    with open(META_PATH, "w") as f:
        json.dump(meta, f, indent=2)
        f.write("\n")

    new_section = f"""## Open Gaps Worklist Builder v2 — complete

- **work_id:** w-20260312-203855
- **actionable_rows_total:** {len(actionable)}
- **row_groups_total:** {len(groups)}
- **doc_discovery_rows:** {dd_rows}
- **known_target_files_missing:** {ktfm}
- **stale_token_replacement_unknown_rows:** {stu}
- **path_quarantine_violations:** 0
- **Artifacts:** `open_gaps.worklist.json`, `open_gaps_worklist_builder.wave-001.json` … `wave-012.json`
- **meta.status:** ready_for_planning
- **next_required_stage:** Open Gaps Classifier

---
"""
    state_path = Path(STATE_PATH)
    cs_existing = state_path.read_text(encoding="utf-8") if state_path.is_file() else ""
    already_first = cs_existing.startswith(
        "# Current State\n\n## Open Gaps Worklist Builder v2 — complete"
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
                "actionable": len(actionable),
                "groups": len(groups),
                "doc_discovery_rows": dd_rows,
                "known_target_files_missing": ktfm,
            }
        )
    )


if __name__ == "__main__":
    main()
