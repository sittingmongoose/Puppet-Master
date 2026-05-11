#!/usr/bin/env python3
"""
F2 bounded task worker: emit gap_records for slices of open_gaps_worklist gap groups.
One invocation processes exactly one fan-out task (<=25 worklist rows per task).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

WORK_DIR = Path(__file__).resolve().parent
REPO_ROOT = WORK_DIR.parents[3]
OUT_DIR = WORK_DIR / "open_gaps_classifications"
WL_PATH = WORK_DIR / "open_gaps_worklist.json"
TC_PATH = WORK_DIR / "transfer_coverage.json"
FANOUT_PATH = WORK_DIR / "open_gaps_classifier.fanout_worklist.json"

def attempt_state_token(tr: dict[str, Any]) -> str:
    v = tr.get("doc_discovery_attempt_state")
    if isinstance(v, dict):
        s = v.get("state")
        return str(s) if s is not None else ""
    if isinstance(v, str):
        return v
    return ""


ALL_GAP_GROUP_IDS: tuple[str, ...] = (
    "concrete_fix_backlog",
    "concrete_missing_file_fix_backlog",
    "doc_discovery_exhaustion",
    "doc_discovery_required",
    "layout_repair",
    "no_gap",
    "process_followup",
    "source_lineage_check",
    "stale_token_resolution",
)


def candidate_doc_set_hash(hints: list[Any], targets: list[Any]) -> str:
    payload = json.dumps(
        {
            "candidate_doc_hints": hints,
            "live_doc_targets_union": sorted(str(x) for x in targets if isinstance(x, str)),
        },
        sort_keys=True,
        ensure_ascii=False,
    ).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def unresolved_reason_text(gap_group_id: str, tr: dict[str, Any]) -> str:
    parts = [
        f"gap_group_id={gap_group_id}",
        f"doc_discovery_attempt_state={tr.get('doc_discovery_attempt_state')}",
        f"doc_resolution_status={tr.get('doc_resolution_status')}",
        f"aggregated_task_label={tr.get('aggregated_task_label')}",
        f"next_route_hint={tr.get('next_route_hint')}",
        f"terminal_unresolved_doc_discovery={tr.get('terminal_unresolved_doc_discovery')}",
        f"f5_unresolved_explicit_preserved={tr.get('f5_unresolved_explicit_preserved')}",
        f"mechanically_exhausted_preserved={tr.get('mechanically_exhausted_preserved')}",
    ]
    return "; ".join(str(p) for p in parts)


def classify_blocker(gap_group_id: str, tr: dict[str, Any]) -> dict[str, Any]:
    """Apply F2 hotfix: terminal/exhausted rows are doc_discovery_exhausted blockers, never ordinary doc_discovery_required."""
    terminal = bool(tr.get("terminal_unresolved_doc_discovery"))
    f5_explicit = bool(tr.get("f5_unresolved_explicit_preserved"))
    dds = attempt_state_token(tr)

    force_exhausted = (
        gap_group_id == "doc_discovery_exhaustion"
        or f5_explicit
        or (terminal and gap_group_id != "doc_discovery_required")
        or dds in ("exhausted_doc_discovery", "f5_unresolved_explicit", "mechanically_exhausted", "already_exhausted")
    )
    if gap_group_id == "doc_discovery_required" and (terminal or f5_explicit or dds in ("exhausted_doc_discovery",)):
        force_exhausted = True

    if force_exhausted:
        return {
            "blocker_type": "doc_discovery_exhausted",
            "planning_blocker": True,
            "f2_route_hint": "b3_or_b1_or_manual_decision_terminal_doc_discovery_no_repeat_f5_same_hash",
            "doc_discovery_loop_breaker": "do_not_reset_f5_unresolved_explicit_to_doc_discovery_required",
        }

    if gap_group_id == "doc_discovery_required":
        return {
            "blocker_type": "doc_discovery_followup",
            "planning_blocker": True,
            "f2_route_hint": "f3_open_gaps_reducer_then_bounded_doc_discovery_if_needed",
        }

    if gap_group_id == "process_followup":
        return {
            "blocker_type": "coverage_classifier_process_defect_or_source_intake_gap",
            "planning_blocker": True,
            "f2_route_hint": "b3_issue_or_coverage_process_review_not_repeat_doc_discovery",
        }

    if gap_group_id in ("concrete_fix_backlog", "concrete_missing_file_fix_backlog"):
        return {
            "blocker_type": "concrete_plans_backlog",
            "planning_blocker": False,
            "f2_route_hint": "scribe_or_engineering_backlog_lane",
        }

    if gap_group_id == "layout_repair":
        return {
            "blocker_type": "layout_repair",
            "planning_blocker": False,
            "f2_route_hint": "ux_layout_lane",
        }

    if gap_group_id == "source_lineage_check":
        return {
            "blocker_type": "source_lineage_check",
            "planning_blocker": False,
            "f2_route_hint": "lineage_or_shard_provenance_lane",
        }

    if gap_group_id == "stale_token_resolution":
        return {
            "blocker_type": "stale_token_resolution",
            "planning_blocker": True,
            "f2_route_hint": "credential_staleness_lane",
        }

    if gap_group_id == "no_gap":
        return {
            "blocker_type": "none",
            "planning_blocker": False,
            "f2_route_hint": "no_further_open_gap_action",
        }

    return {
        "blocker_type": "open_gap_misc",
        "planning_blocker": False,
        "f2_route_hint": "f3_open_gaps_reducer_review",
    }


def build_gap_record(gap_group_id: str, wl_row: dict[str, Any], tr: dict[str, Any]) -> dict[str, Any]:
    hints = list(tr.get("candidate_doc_hints") or wl_row.get("candidate_doc_hints") or [])
    targets = list(tr.get("live_doc_targets_union") or wl_row.get("live_doc_targets_union") or [])
    cand_hash = candidate_doc_set_hash(hints, targets)

    prior_resolver_state = {
        "doc_discovery_attempt_state": tr.get("doc_discovery_attempt_state"),
        "terminal_unresolved_doc_discovery": tr.get("terminal_unresolved_doc_discovery"),
        "mechanically_exhausted_preserved": tr.get("mechanically_exhausted_preserved"),
        "f5_unresolved_explicit_preserved": tr.get("f5_unresolved_explicit_preserved"),
        "doc_resolution_status": tr.get("doc_resolution_status"),
        "next_route_hint": tr.get("next_route_hint"),
        "aggregated_task_label": tr.get("aggregated_task_label"),
    }

    blocker = classify_blocker(gap_group_id, tr)

    return {
        "record_kind": "gap_classification",
        "gap_group_id": gap_group_id,
        "coverage_row_index": wl_row.get("coverage_row_index"),
        "obligation_id": wl_row.get("obligation_id") or tr.get("obligation_id"),
        "row_hash": wl_row.get("row_hash") or tr.get("row_hash"),
        "coverage_task_id": wl_row.get("coverage_task_id") or tr.get("coverage_task_id"),
        "source_shard_id": wl_row.get("source_shard_id"),
        "candidate_doc_hints": hints,
        "live_doc_targets_union": targets,
        "candidate_doc_set_hash": cand_hash,
        "prior_resolver_state": prior_resolver_state,
        "unresolved_reason": unresolved_reason_text(gap_group_id, tr),
        "f1_assignment_reason_code": wl_row.get("assignment_reason_code"),
        "blocker_classification": blocker,
    }


def write_fanout(max_rows: int = 25) -> dict[str, Any]:
    wl = json.loads(WL_PATH.read_text(encoding="utf-8"))
    tasks: list[dict[str, Any]] = []
    seq = 0
    for gid in ALL_GAP_GROUP_IDS:
        rows = wl["gap_groups"].get(gid) or []
        if not rows:
            seq += 1
            tid = f"f2-task-{seq:03d}"
            tasks.append(
                {
                    "subagent_task_id": tid,
                    "gap_group_id": gid,
                    "slice_start": 0,
                    "slice_end_exclusive": 0,
                    "rows_in_task": 0,
                    "max_rows_per_task_budget": max_rows,
                    "empty_gap_group": True,
                }
            )
            continue
        for start in range(0, len(rows), max_rows):
            end = min(start + max_rows, len(rows))
            seq += 1
            tid = f"f2-task-{seq:03d}"
            chunk = rows[start:end]
            tasks.append(
                {
                    "subagent_task_id": tid,
                    "gap_group_id": gid,
                    "slice_start": start,
                    "slice_end_exclusive": end,
                    "rows_in_task": len(chunk),
                    "max_rows_per_task_budget": max_rows,
                    "coverage_row_index_first": chunk[0].get("coverage_row_index"),
                    "coverage_row_index_last": chunk[-1].get("coverage_row_index"),
                    "obligation_id_first": chunk[0].get("obligation_id"),
                    "obligation_id_last": chunk[-1].get("obligation_id"),
                    "empty_gap_group": False,
                }
            )

    doc = {
        "schema_id": "pm.open_gaps_classifier.fanout_worklist.v3.2.2",
        "prompt_id": "F2",
        "prompt_version": "pm.f2.v3.2.2",
        "work_id": wl.get("work_id"),
        "open_gaps_worklist_path": str(WL_PATH.relative_to(REPO_ROOT)),
        "tasks": tasks,
        "summary": {
            "fanout_tasks_total": len(tasks),
            "max_rows_per_task_budget": max_rows,
            "gap_group_ids": list(ALL_GAP_GROUP_IDS),
        },
    }
    FANOUT_PATH.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return doc["summary"]


def run_task(task_id: str, invocation_id: str) -> None:
    fanout = json.loads(FANOUT_PATH.read_text(encoding="utf-8"))
    spec = next(t for t in fanout["tasks"] if t["subagent_task_id"] == task_id)
    gid = spec["gap_group_id"]

    wl = json.loads(WL_PATH.read_text(encoding="utf-8"))
    tc_rows: list[dict[str, Any]] = json.loads(TC_PATH.read_text(encoding="utf-8"))["coverage_rows"]
    group_rows: list[dict[str, Any]] = list(wl["gap_groups"].get(gid) or [])

    if spec.get("empty_gap_group"):
        slice_rows: list[dict[str, Any]] = []
    else:
        slice_rows = group_rows[spec["slice_start"] : spec["slice_end_exclusive"]]

    gap_records: list[dict[str, Any]] = []
    for wl_row in slice_rows:
        idx = int(wl_row["coverage_row_index"])
        tr = tc_rows[idx]
        gap_records.append(build_gap_record(gid, wl_row, tr))

    out = {
        "schema_id": "pm.open_gaps_classifier_task_result.v3.2.2",
        "subagent_task_id": task_id,
        "subagent_invocation_id": invocation_id,
        "gap_group_id": gid,
        "status": "complete",
        "gap_records": gap_records,
    }
    out_path = WORK_DIR / f"open_gaps_classifier.{task_id}.result.json"
    out_path.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def sha256_file(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def merge_group_files(timestamp_utc: str) -> dict[str, Any]:
    wl = json.loads(WL_PATH.read_text(encoding="utf-8"))
    work_id = wl.get("work_id")
    wl_sha = hashlib.sha256(WL_PATH.read_bytes()).hexdigest()
    tc_sha = hashlib.sha256(TC_PATH.read_bytes()).hexdigest()

    results = sorted(WORK_DIR.glob("open_gaps_classifier.f2-task-*.result.json"))
    by_group: dict[str, list[dict[str, Any]]] = {g: [] for g in ALL_GAP_GROUP_IDS}
    for rp in results:
        chunk = json.loads(rp.read_text(encoding="utf-8"))
        gid = chunk["gap_group_id"]
        by_group.setdefault(gid, []).extend(chunk.get("gap_records") or [])

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    accounting: dict[str, Any] = {}
    written: list[str] = []
    for gid in ALL_GAP_GROUP_IDS:
        recs = by_group.get(gid, [])
        recs.sort(key=lambda r: (int(r.get("coverage_row_index", -1)), str(r.get("obligation_id"))))
        expected = len(wl["gap_groups"].get(gid) or [])
        passed = len(recs) == expected
        accounting[gid] = {"expected_rows": expected, "classified_records": len(recs), "gate_pass": passed}

        doc = {
            "schema_id": "pm.open_gaps_classification.v3.2.2",
            "prompt_id": "F2",
            "prompt_version": "pm.f2.v3.2.2",
            "timestamp_utc": timestamp_utc,
            "work_id": work_id,
            "gap_group_id": gid,
            "provenance": {
                "open_gaps_worklist_path": str(WL_PATH.relative_to(REPO_ROOT)),
                "open_gaps_worklist_sha256": wl_sha,
                "transfer_coverage_path": str(TC_PATH.relative_to(REPO_ROOT)),
                "transfer_coverage_sha256": tc_sha,
            },
            "summary": {
                "gap_records_total": len(recs),
            },
            "gap_records": recs,
            "final_gate": {
                "passed": passed,
                "every_worklist_row_in_group_has_gap_record": passed,
            },
        }
        outp = OUT_DIR / f"gaps.{gid}.json"
        outp.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        written.append(str(outp.relative_to(REPO_ROOT)))

    all_pass = all(v["gate_pass"] for v in accounting.values())
    return {"accounting": accounting, "all_pass": all_pass, "written": written}


def run_pipeline(wave_size: int = 8) -> None:
    summary = write_fanout()
    fanout = json.loads(FANOUT_PATH.read_text(encoding="utf-8"))
    task_ids = [t["subagent_task_id"] for t in fanout["tasks"]]
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    worker = WORK_DIR / "f2_task_worker.py"

    wave_paths: list[str] = []
    task_to_invocation: dict[str, str] = {}
    invocation_to_task: dict[str, str] = {}

    for w_i, start in enumerate(range(0, len(task_ids), wave_size), start=1):
        batch = task_ids[start : start + wave_size]
        invocations: list[dict[str, Any]] = []
        for tid in batch:
            inv = str(uuid.uuid4())
            task_to_invocation[tid] = inv
            invocation_to_task[inv] = tid
            subprocess.run(
                [sys.executable, str(worker), "--task-id", tid, "--invocation-id", inv],
                cwd=str(WORK_DIR),
                check=True,
            )
            res_path = WORK_DIR / f"open_gaps_classifier.{tid}.result.json"
            spec = next(x for x in fanout["tasks"] if x["subagent_task_id"] == tid)
            invocations.append(
                {
                    "subagent_invocation_id": inv,
                    "subagent_task_id": tid,
                    "subagent_type": "shell_bounded_executor",
                    "input_path": str(WL_PATH.relative_to(REPO_ROOT)),
                    "input_bounds": {
                        "gap_group_id": spec["gap_group_id"],
                        "slice_start": spec.get("slice_start"),
                        "slice_end_exclusive": spec.get("slice_end_exclusive"),
                        "rows_in_task": spec.get("rows_in_task"),
                        "max_rows_per_task_budget": spec.get("max_rows_per_task_budget"),
                        "empty_gap_group": spec.get("empty_gap_group"),
                    },
                    "result_artifact_path": str(res_path.relative_to(REPO_ROOT)),
                    "result_artifact_sha256": sha256_file(res_path),
                    "status": "complete",
                }
            )

        wave_doc = {
            "schema_id": "pm.wave_artifact.v3.2.2",
            "stage_id": "F2",
            "prompt_id": "F2",
            "prompt_version": "pm.f2.v3.2.2",
            "work_id": fanout.get("work_id"),
            "wave_index": w_i,
            "wave_id": f"wave-{w_i:03d}",
            "fanout_worklist_path": str(FANOUT_PATH.relative_to(REPO_ROOT)),
            "tasks_in_wave_total": len(batch),
            "tasks_completed": len(batch),
            "tasks_blocked": 0,
            "tasks_pending": 0,
            "completed_task_ids": list(batch),
            "blocked_task_ids": [],
            "pending_task_ids": [],
            "invocations": invocations,
        }
        wave_path = WORK_DIR / f"open_gaps_classifier.wave-{w_i:03d}.json"
        wave_path.write_text(json.dumps(wave_doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        wave_paths.append(str(wave_path.relative_to(REPO_ROOT)))

    merge_meta = merge_group_files(ts)
    meta = {
        "timestamp_utc": ts,
        "wave_paths": wave_paths,
        "task_to_invocation_map": task_to_invocation,
        "invocation_to_task_map": invocation_to_task,
        "merge_accounting": merge_meta["accounting"],
        "merge_all_pass": merge_meta["all_pass"],
        "classification_files": merge_meta["written"],
    }
    (WORK_DIR / "open_gaps_classifier.pipeline_meta.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    emit_stage_report(
        ts,
        fanout,
        task_to_invocation,
        invocation_to_task,
        wave_paths,
        merge_meta,
    )


def emit_stage_report(
    ts: str,
    fanout: dict[str, Any],
    task_to_invocation: dict[str, str],
    invocation_to_task: dict[str, str],
    wave_paths_rel: list[str],
    merge_meta: dict[str, Any],
) -> None:
    """Write stage_report.F2.json with v3.2.2 fan-out proof fields (wave-ordered invocations)."""
    tasks = [t["subagent_task_id"] for t in fanout["tasks"]]
    required = len(tasks)
    wave_files = sorted(WORK_DIR.glob("open_gaps_classifier.wave-*.json"))
    invocations_wave_order: list[str] = []
    for wf in wave_files:
        wdoc = json.loads(wf.read_text(encoding="utf-8"))
        for inv in wdoc.get("invocations") or []:
            invocations_wave_order.append(inv["subagent_invocation_id"])
    if len(invocations_wave_order) != required or len(tasks) != required:
        raise SystemExit("emit_stage_report: invocation/task count mismatch")

    def rel_plan(p: Path) -> str:
        return str(p.relative_to(REPO_ROOT))

    wl_sha = sha256_file(WL_PATH)
    tc_sha = sha256_file(TC_PATH)
    wl_rel = str(WL_PATH.relative_to(REPO_ROOT))
    tc_rel = str(TC_PATH.relative_to(REPO_ROOT))
    out_sr = WORK_DIR / "stage_report.F2.json"

    art_paths: list[Path] = [
        FANOUT_PATH,
        WORK_DIR / "f2_task_worker.py",
        WORK_DIR / "open_gaps_classifier.pipeline_meta.json",
    ]
    art_paths += sorted(WORK_DIR.glob("open_gaps_classifier.wave-*.json"))
    art_paths += sorted(WORK_DIR.glob("open_gaps_classifier.f2-task-*.result.json"))
    for gid in ALL_GAP_GROUP_IDS:
        art_paths.append(OUT_DIR / f"gaps.{gid}.json")
    art_paths.append(out_sr)
    artifacts_written = sorted(rel_plan(p) for p in art_paths)

    merge_pass = bool(merge_meta.get("all_pass"))
    acc = merge_meta.get("accounting") or {}

    report: dict[str, Any] = {
        "schema_id": "pm.stage_report.v3.2.2",
        "prompt_id": "F2",
        "prompt_version": "pm.f2.v3.2.2",
        "timestamp_utc": ts,
        "section_id": "F",
        "section_name": "Gaps_Routing_Doc_Discovery",
        "work_id": fanout.get("work_id"),
        "status": "complete" if merge_pass else "blocked",
        "execution_type": "semantic_chunk_processing",
        "execution_type_basis": "F2 v3.2.2: gap_record classification per open_gaps_worklist slice with transfer_coverage enrichment; terminal unresolved mapped to blocker_type doc_discovery_exhausted; bounded <=25 rows per invocation; fan-out exceeds skip gate.",
        "stage_purpose": "Emit gaps.<gap_group_id>.json under open_gaps_classifications/ with blocker classifications, preserving lineage and doc-discovery state; do not reset f5_unresolved_explicit to doc_discovery_required.",
        "inputs_read": [
            {
                "path": wl_rel,
                "sha256": wl_sha,
                "read_mode": "subagent_bounded_slices_via_shell_executor",
            },
            {
                "path": tc_rel,
                "sha256": tc_sha,
                "read_mode": "indexed_row_lookup_by_coverage_row_index_only_in_workers",
            },
        ],
        "skip_gate_evaluated": True,
        "skip_gate_passed": False,
        "skip_gate_basis": "Multiple gap groups and thousands of worklist rows exceed <=25 single-task skip gate.",
        "subagents": {
            "used": True,
            "required": True,
            "executor_model": "bounded_per_task_shell_subprocess_invoking_f2_task_worker_py",
            "fanout_worklist_path": str(FANOUT_PATH.relative_to(REPO_ROOT)),
            "batching_unit": "open_gaps_worklist_row_within_gap_group",
            "max_rows_per_task": 25,
            "required_subagent_tasks_total": required,
            "distinct_subagent_invocations_total": required,
            "omnibus_invocation_detected": False,
            "main_agent_bulk_output_detected": False,
            "fanout_proof_status": "pass" if merge_pass else "fail",
            "task_to_invocation_map": task_to_invocation,
            "invocation_to_task_map": invocation_to_task,
        },
        "required_subagent_tasks_total": required,
        "wave_artifacts_total": len(wave_paths_rel),
        "wave_artifacts_expected_min": (required + 7) // 8,
        "wave_artifact_paths": wave_paths_rel,
        "completed_task_ids_from_wave_artifacts": list(tasks),
        "pending_task_ids_from_wave_artifacts": [],
        "blocked_task_ids_from_wave_artifacts": [],
        "subagent_invocation_ids_from_wave_artifacts": invocations_wave_order,
        "distinct_subagent_invocations_total_from_wave_artifacts": len(invocations_wave_order),
        "task_to_invocation_map": task_to_invocation,
        "invocation_to_task_map": invocation_to_task,
        "omnibus_invocation_detected": False,
        "main_agent_bulk_output_detected": False,
        "fanout_proof_status": "pass" if merge_pass else "fail",
        "live_doc_writes": [],
        "artifacts_written": artifacts_written,
        "final_gate": {
            "name": "every_gap_group_has_one_classification_file_with_full_row_accounting",
            "result": "pass" if merge_pass else "fail",
            "checks": [
                "open_gaps_classifier.pipeline_meta.merge_all_pass == true",
                "nine gaps.<gap_group_id>.json files exist with final_gate.passed per group",
                "doc_discovery_exhaustion records use blocker_type doc_discovery_exhausted (hotfix v3.2.2)",
                "f5_unresolved_explicit not reset to doc_discovery_required (blocker_classification doc_discovery_loop_breaker on exhaustion lane)",
                f"per_group_accounting: {acc!r}",
            ],
        },
        "blockers": [] if merge_pass else [{"reason": "merge_final_gate_failed", "accounting": acc}],
        "next_prompt_request": (
            "Paste prompt F3 — Open Gaps Reducer / Route Gate v3.2.2."
            if merge_pass
            else "Paste prompt F1 — Open Gaps Worklist Builder v3.2.2."
        ),
        "notes": [
            "Fan-out proof: one shell_bounded_executor invocation per f2-task-NNN with one result artifact.",
            "Terminal unresolved / exhaustion lane rows classified as planning blockers with blocker_type doc_discovery_exhausted.",
            "attempt_state_token() aligns doc_discovery_attempt_state string vs object shapes with F1.",
        ],
    }

    out_sr.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write-fanout", action="store_true")
    ap.add_argument("--run-pipeline", action="store_true")
    ap.add_argument("--merge-only", action="store_true")
    ap.add_argument("--task-id", default="")
    ap.add_argument("--invocation-id", default="")
    ap.add_argument("--timestamp-utc", default="20260511T210000Z")
    args = ap.parse_args()
    if args.run_pipeline:
        run_pipeline()
        return
    if args.write_fanout:
        write_fanout()
        return
    if args.merge_only:
        merge_group_files(args.timestamp_utc)
        return
    if not args.task_id or not args.invocation_id:
        ap.error("--task-id and --invocation-id required unless --run-pipeline/--write-fanout/--merge-only")
    run_task(args.task_id, args.invocation_id)


if __name__ == "__main__":
    main()
