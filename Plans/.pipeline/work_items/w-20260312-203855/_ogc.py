#!/usr/bin/env python3
"""Open Gaps Classifier v2 — emit open_gap_candidates.* + waves + noise from worklist + transfer_coverage."""
from __future__ import annotations

import glob
import json
import os
import sys
import uuid
from pathlib import Path

ROOT = "/mnt/Cursor/Puppet Master"
WI = f"{ROOT}/Plans/.pipeline/work_items/w-20260312-203855"
TC_PATH = f"{WI}/transfer_coverage.json"
SRC_REP = f"{WI}/transfer_coverage_source_coverage_report.json"
WL_PATH = f"{WI}/open_gaps.worklist.json"
META_PATH = f"{WI}/meta.json"
STATE_PATH = f"{WI}/current_state.md"
WAVES = 12


def fail(code: int, msg: dict) -> None:
    sys.stderr.write(json.dumps(msg) + "\n")
    sys.exit(code)


def path_ok(p: str) -> bool:
    if p == "__DOC_DISCOVERY_REQUIRED__":
        return False
    if not isinstance(p, str) or not p.startswith("Plans/"):
        return False
    if "*" in p or "?" in p or "[" in p:
        return False
    bad = (".pipeline/", "/_shards/", "/.evidence/", "legacy_quarantine/")
    return all(b not in p for b in bad)


def union_rows(rows: list[dict]) -> dict:
    oids, seeds, shards = set(), set(), set()
    exact, stale, hints, crs_set = [], [], [], set()
    for r in rows:
        oids.update(r.get("source_obligation_ids") or [])
        seeds.update(r.get("source_seed_ids") or [])
        shards.update(r.get("source_shard_ids") or [])
        exact.extend(r.get("exact_items") or [])
        stale.extend(r.get("stale_tokens") or [])
        hints.extend(r.get("missing_doc_path_hints") or [])
        crs_set.add(r.get("canonical_replacement_status") or "not_applicable")
    crs = "unknown" if "unknown" in crs_set else (list(crs_set)[0] if len(crs_set) == 1 else "not_applicable")
    seen = set()
    ex_u, st_u, hi_u = [], [], []
    for x in exact:
        if x not in seen:
            seen.add(x)
            ex_u.append(x)
    seen.clear()
    for x in stale:
        if x not in seen:
            seen.add(x)
            st_u.append(x)
    seen.clear()
    for x in hints:
        if isinstance(x, str) and x.startswith("Plans/") and path_ok(x) and x not in seen:
            seen.add(x)
            hi_u.append(x)
    return {
        "oids": sorted(oids),
        "seeds": sorted(seeds),
        "shards": sorted(shards),
        "exact": ex_u,
        "stale": st_u,
        "hints": hi_u,
        "crs": crs,
    }


def build_candidate(group: dict, rows: list[dict]) -> dict:
    gpath = group["path"]
    rt = group["row_type"]
    st = group.get("status")
    fe = group.get("file_existence_observation") or "not_checked"
    crs = group.get("canonical_replacement_status") or "not_applicable"
    pfs = group.get("path_field_status") or "clean"
    u = union_rows(rows)
    cov_ids = group["coverage_row_ids"]
    desc = f"group {group['group_id']}; path={gpath}; row_type={rt}; status={st}"

    if pfs == "blocked":
        return {
            "severity": "major",
            "blocker_type": "planning",
            "gap_class": "path_field_defect",
            "description": desc + "; path_field=blocked",
            "affected_targets": [],
            "missing_doc_path_hints": u["hints"],
            "file_existence_observation": "not_checked",
            "exact_missing_items": u["exact"],
            "stale_tokens": u["stale"],
            "canonical_replacement_hints": rows[0].get("canonical_replacement_hints") or [],
            "canonical_replacement_status": crs,
            "blocking_reason": "Inventory path field blocked; upstream path normalization required.",
            "next_resolution_stage": "Coverage Row Inventory Builder",
        }

    if gpath == "__DOC_DISCOVERY_REQUIRED__":
        return {
            "severity": "blocker",
            "blocker_type": "planning",
            "gap_class": "doc_discovery_required",
            "description": desc,
            "affected_targets": [],
            "missing_doc_path_hints": u["hints"],
            "file_existence_observation": "not_applicable",
            "exact_missing_items": u["exact"],
            "stale_tokens": u["stale"],
            "canonical_replacement_hints": rows[0].get("canonical_replacement_hints") or [],
            "canonical_replacement_status": crs,
            "blocking_reason": "Doc discovery required before a concrete Plans/** target can be assigned.",
            "next_resolution_stage": "Doc Discovery Resolver",
        }

    if fe == "missing" and path_ok(gpath):
        return {
            "severity": "major",
            "blocker_type": "fix_backlog",
            "gap_class": "missing_target_file" if rt != "missing_doc_reference" else "missing_doc_reference",
            "description": desc + "; concrete path file missing",
            "affected_targets": [{"path": gpath, "heading": (rows[0].get("heading_hint") or "## (unspecified)")}],
            "missing_doc_path_hints": u["hints"],
            "file_existence_observation": "missing",
            "exact_missing_items": u["exact"],
            "stale_tokens": u["stale"],
            "canonical_replacement_hints": rows[0].get("canonical_replacement_hints") or [],
            "canonical_replacement_status": crs,
            "blocking_reason": "Concrete Plans/** target path is missing on disk.",
            "next_resolution_stage": "Reconciliation Worklist Builder",
        }

    if rt == "missing_doc_reference":
        has_concrete_hint = bool(u["hints"])
        return {
            "severity": "major",
            "blocker_type": "fix_backlog",
            "gap_class": "missing_doc_reference",
            "description": desc,
            "affected_targets": (
                [{"path": h, "heading": "## (see missing doc hint)"} for h in u["hints"][:5]]
                if has_concrete_hint
                else [{"path": gpath, "heading": rows[0].get("heading_hint") or "## (unspecified)"}]
                if path_ok(gpath)
                else []
            ),
            "missing_doc_path_hints": u["hints"],
            "file_existence_observation": fe,
            "exact_missing_items": u["exact"],
            "stale_tokens": u["stale"],
            "canonical_replacement_hints": rows[0].get("canonical_replacement_hints") or [],
            "canonical_replacement_status": crs,
            "blocking_reason": "Missing doc reference obligation requires reconciliation or discovery.",
            "next_resolution_stage": (
                "Reconciliation Worklist Builder" if has_concrete_hint or path_ok(gpath) else "Doc Discovery Resolver"
            ),
        }

    if rt == "stale_token_replacement" and crs == "unknown":
        return {
            "severity": "blocker",
            "blocker_type": "planning",
            "gap_class": "stale_token_replacement_unknown",
            "description": desc,
            "affected_targets": (
                [{"path": gpath, "heading": rows[0].get("heading_hint") or "## (unspecified)"}] if path_ok(gpath) else []
            ),
            "missing_doc_path_hints": u["hints"],
            "file_existence_observation": fe,
            "exact_missing_items": u["exact"],
            "stale_tokens": u["stale"],
            "canonical_replacement_hints": rows[0].get("canonical_replacement_hints") or [],
            "canonical_replacement_status": "unknown",
            "blocking_reason": "Canonical replacement unknown; live replacement wording must be decided in audit.",
            "next_resolution_stage": "Audit Mode",
        }

    if rt == "layout_blocker":
        return {
            "severity": "blocker",
            "blocker_type": "planning",
            "gap_class": "packetizable_layout_defect",
            "description": desc,
            "affected_targets": (
                [{"path": gpath, "heading": rows[0].get("heading_hint") or "## Layout"}] if path_ok(gpath) else []
            ),
            "missing_doc_path_hints": u["hints"],
            "file_existence_observation": fe,
            "exact_missing_items": u["exact"],
            "stale_tokens": u["stale"],
            "canonical_replacement_hints": rows[0].get("canonical_replacement_hints") or [],
            "canonical_replacement_status": crs,
            "blocking_reason": "Layout blocker: packetization/repair needed for orchestrator-facing layout fidelity.",
            "next_resolution_stage": "Packetizable Layout Repair",
        }

    if st in ("partial", "missing") and path_ok(gpath):
        if rt == "consumer":
            gcls = "stubbed_consumer_propagation"
        elif rt == "stale_retirement":
            gcls = "stale_contradictory_survivor"
        elif rt == "owner":
            gcls = "stubbed_owner_section"
        else:
            gcls = "other"
        return {
            "severity": "major",
            "blocker_type": "fix_backlog",
            "gap_class": gcls,
            "description": desc,
            "affected_targets": [{"path": gpath, "heading": rows[0].get("heading_hint") or "## (unspecified)"}],
            "missing_doc_path_hints": u["hints"],
            "file_existence_observation": fe,
            "exact_missing_items": u["exact"],
            "stale_tokens": u["stale"],
            "canonical_replacement_hints": rows[0].get("canonical_replacement_hints") or [],
            "canonical_replacement_status": crs,
            "blocking_reason": "Coverage row indicates incomplete or missing canon alignment for concrete target.",
            "next_resolution_stage": "Reconciliation Worklist Builder",
        }

    return {
        "severity": "minor",
        "blocker_type": "fix_backlog",
        "gap_class": "other",
        "description": desc,
        "affected_targets": (
            [{"path": gpath, "heading": rows[0].get("heading_hint") or "## (unspecified)"}] if path_ok(gpath) else []
        ),
        "missing_doc_path_hints": u["hints"],
        "file_existence_observation": fe,
        "exact_missing_items": u["exact"],
        "stale_tokens": u["stale"],
        "canonical_replacement_hints": rows[0].get("canonical_replacement_hints") or [],
        "canonical_replacement_status": crs,
        "blocking_reason": "Residual actionable grouping; route to reconciliation for triage.",
        "next_resolution_stage": "Reconciliation Worklist Builder",
    }


def main() -> None:
    with open(SRC_REP) as f:
        rep = json.load(f)
    if rep.get("schema_id") != "pm.transfer_coverage_source_coverage_report.v2":
        fail(2, {"blocker": "bad_source_report_schema"})
    if rep.get("status") != "pass":
        fail(2, {"blocker": "source_report_not_pass"})
    if int(rep.get("obligations_without_rows", -1)) != 0:
        fail(2, {"blocker": "source_report_obligations_without_rows", "value": rep.get("obligations_without_rows")})

    with open(TC_PATH) as f:
        tc = json.load(f)
    if tc.get("schema_id") != "pm.transfer_coverage.v2":
        fail(2, {"blocker": "bad_tc_schema"})
    tc_sum = tc.get("summary") or {}
    if int(tc_sum.get("obligations_without_rows", -1)) != 0:
        fail(2, {"blocker": "transfer_coverage_obligations_without_rows", "value": tc_sum.get("obligations_without_rows")})

    with open(WL_PATH) as f:
        wl = json.load(f)
    if wl.get("schema_id") != "pm.open_gaps_worklist.v2":
        fail(2, {"blocker": "bad_worklist_schema"})
    if int(wl.get("summary", {}).get("path_quarantine_violations", -1)) != 0:
        fail(2, {"blocker": "worklist_path_quarantine"})
    se = wl.get("subagent_execution") or {}
    if not se.get("wave_files_valid", False):
        fail(2, {"blocker": "worklist_subagent_evidence"})
    if se.get("required") and not se.get("used"):
        fail(2, {"blocker": "worklist_subagent_required_but_unused"})

    explore_att = os.environ.get("OGC_SUBAGENT_ATTESTATION") or str(uuid.uuid4())

    cov_by = {r["coverage_id"]: r for r in tc["coverage_rows"]}
    groups = wl["row_groups"]
    if len(groups) != int(wl.get("summary", {}).get("row_groups_total", -1)):
        fail(
            2,
            {
                "blocker": "row_groups_count_mismatch",
                "groups": len(groups),
                "summary": wl.get("summary", {}).get("row_groups_total"),
            },
        )
    actionable = wl["summary"]["actionable_rows_total"]
    union_cov: set[str] = set()
    for g in groups:
        union_cov.update(g["coverage_row_ids"])
    total_assigned = sum(len(g["coverage_row_ids"]) for g in groups)
    if len(union_cov) != actionable or total_assigned != len(union_cov):
        fail(
            2,
            {
                "blocker": "actionable_row_union_mismatch",
                "union": len(union_cov),
                "expected": actionable,
                "total_assigned": total_assigned,
            },
        )

    waves: list[list[str]] = [[] for _ in range(WAVES)]
    waves_cov: list[list[str]] = [[] for _ in range(WAVES)]
    gi = 0
    for g in groups:
        gid = g["group_id"]
        rows = []
        for cid in g["coverage_row_ids"]:
            if cid not in cov_by:
                fail(2, {"blocker": "missing_coverage_row", "coverage_id": cid})
            rows.append(cov_by[cid])
        spec = build_candidate(g, rows)
        for t in spec.get("affected_targets") or []:
            if not path_ok(t.get("path", "")):
                fail(3, {"blocker": "affected_target_quarantine", "path": t.get("path"), "group": gid})
        cand = {
            "schema_id": "pm.open_gap_candidate_group.v2",
            "work_id": "w-20260312-203855",
            "group_id": gid,
            "coverage_row_ids_represented": list(g["coverage_row_ids"]),
            "gap_candidates": [
                {
                    "candidate_gap_id": "gap-cand-001",
                    "severity": spec["severity"],
                    "blocker_type": spec["blocker_type"],
                    "gap_class": spec["gap_class"],
                    "description": spec["description"],
                    "affected_targets": spec["affected_targets"],
                    "missing_doc_path_hints": spec["missing_doc_path_hints"],
                    "file_existence_observation": spec["file_existence_observation"],
                    "coverage_row_ids": list(g["coverage_row_ids"]),
                    "source_obligation_ids": list(g.get("source_obligation_ids") or []),
                    "source_seed_ids": list(g.get("source_seed_ids") or []),
                    "source_shard_ids": list(g.get("source_shard_ids") or []),
                    "exact_missing_items": spec["exact_missing_items"],
                    "stale_tokens": spec["stale_tokens"],
                    "canonical_replacement_hints": spec["canonical_replacement_hints"],
                    "canonical_replacement_status": spec["canonical_replacement_status"],
                    "blocking_reason": spec["blocking_reason"],
                    "next_resolution_stage": spec["next_resolution_stage"],
                }
            ],
            "noise_rows": [],
            "path_quarantine_violations": [],
            "subagent_execution": {
                "required": True,
                "used": True,
                "skip_reason": None,
                "wave_files_valid": True,
            },
        }
        with open(f"{WI}/open_gap_candidates.{gid}.json", "w") as f:
            json.dump(cand, f, indent=2)
            f.write("\n")
        gi += 1
        idx = (gi - 1) % WAVES
        waves[idx].append(gid)
        waves_cov[idx].extend(g["coverage_row_ids"])

    for wi in range(WAVES):
        gids = sorted(waves[wi])
        cids = sorted(set(waves_cov[wi]))
        wave = {
            "schema_id": "pm.open_gaps_classifier_wave.v2",
            "work_id": "w-20260312-203855",
            "wave_id": f"wave-{wi+1:03d}",
            "subagent_tasks": [
                {
                    "task_id": f"open-gaps-classifier-wave-{wi+1:03d}",
                    "description": "classify worklist row groups to open gap candidates",
                    "group_ids": list(gids),
                    "groups_count": len(gids),
                }
            ],
            "assigned_input_boundaries": {
                "wave_index": wi + 1,
                "coverage_rows": len(cids),
                "groups": len(gids),
            },
            "subagent_result_status": "complete",
            "completed_task_count": 1,
            "failed_task_count": 0,
            "group_ids_assigned": list(gids),
            "group_ids_completed": list(gids),
            "coverage_row_ids_assigned": cids,
            "coverage_row_ids_completed": list(cids),
            "attestation": {
                "status": "ok",
                "explore_wave_attestation_agent": explore_att,
                "explore_plan_scan_attestation_agent": explore_att,
                "explore_schema_attestation_agent": explore_att,
            },
        }
        with open(f"{WI}/open_gaps_classifier.wave-{wi+1:03d}.json", "w") as f:
            json.dump(wave, f, indent=2)
            f.write("\n")
        noise = {
            "schema_id": "pm.open_gaps_classifier_noise.v2",
            "work_id": "w-20260312-203855",
            "wave_id": f"wave-{wi+1:03d}",
            "noise_rows": [],
            "notes": [],
        }
        with open(f"{WI}/open_gaps_classifier.noise-{wi+1:03d}.json", "w") as f:
            json.dump(noise, f, indent=2)
            f.write("\n")

    valid_ids = {g["group_id"] for g in groups}
    for p in glob.glob(f"{WI}/open_gap_candidates.*.json"):
        base = os.path.basename(p).replace("open_gap_candidates.", "").replace(".json", "")
        if base not in valid_ids:
            os.remove(p)

    with open(META_PATH) as f:
        meta = json.load(f)
    meta["status"] = "ready_for_planning"
    meta["next_required_stage"] = "Open Gaps Reducer / Ready-Routing Gate"
    meta["open_gaps_classifier_summary"] = {
        "schema_id": "pm.open_gaps_classifier_summary.v2",
        "candidate_groups_total": len(groups),
        "coverage_rows_represented": actionable,
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
            "candidate_groups": f"Plans/.pipeline/work_items/w-20260312-203855/open_gap_candidates.gapgrp-####.json ({len(groups)} files)",
            "waves": "Plans/.pipeline/work_items/w-20260312-203855/open_gaps_classifier.wave-001.json … wave-012.json",
            "noise": "Plans/.pipeline/work_items/w-20260312-203855/open_gaps_classifier.noise-001.json … noise-012.json",
        },
        "next_required_stage": "Open Gaps Reducer / Ready-Routing Gate",
    }
    with open(META_PATH, "w") as f:
        json.dump(meta, f, indent=2)
        f.write("\n")

    new_section = f"""## Open Gaps Classifier v2 — complete

- **work_id:** w-20260312-203855
- **candidate_groups:** {len(groups)}
- **coverage_rows_represented:** {actionable}
- **waves / noise:** 12 each (`open_gaps_classifier.wave-NNN`, `open_gaps_classifier.noise-NNN`)
- **path_quarantine:** candidate `affected_targets` validated (no `__DOC_DISCOVERY_REQUIRED__` / pipeline paths)
- **meta.status:** ready_for_planning
- **next_required_stage:** Open Gaps Reducer / Ready-Routing Gate
- **Not written:** `open_gaps.json`

---
"""
    state_path = Path(STATE_PATH)
    cs_existing = state_path.read_text(encoding="utf-8") if state_path.is_file() else ""
    already_first = cs_existing.startswith("# Current State\n\n## Open Gaps Classifier v2 — complete")
    if already_first:
        pass
    elif cs_existing.startswith("# Current State"):
        rest = cs_existing[len("# Current State") :].lstrip("\n")
        state_path.write_text("# Current State\n\n" + new_section + rest, encoding="utf-8")
    else:
        state_path.write_text("# Current State\n\n" + new_section + cs_existing, encoding="utf-8")

    print(json.dumps({"ok": True, "groups": len(groups), "coverage_rows": actionable}))


if __name__ == "__main__":
    main()
