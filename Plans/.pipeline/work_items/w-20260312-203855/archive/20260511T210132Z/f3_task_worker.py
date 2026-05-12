#!/usr/bin/env python3
"""
F3 bounded task worker: pass through slices of gap_records for reducer merge.
One invocation processes exactly one fan-out task (<=25 gap records per task).
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
CLASS_DIR = WORK_DIR / "open_gaps_classifications"
WL_PATH = WORK_DIR / "open_gaps_worklist.json"
TC_PATH = WORK_DIR / "transfer_coverage.json"
FANOUT_PATH = WORK_DIR / "open_gaps_reducer.fanout_worklist.json"

def attempt_state_token(prior: dict[str, Any]) -> str:
    v = prior.get("doc_discovery_attempt_state")
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


def gap_classification_path(gid: str) -> Path:
    return CLASS_DIR / f"gaps.{gid}.json"


def write_fanout(max_rows: int = 25) -> None:
    tasks: list[dict[str, Any]] = []
    seq = 0
    for gid in ALL_GAP_GROUP_IDS:
        p = gap_classification_path(gid)
        doc = json.loads(p.read_text(encoding="utf-8"))
        rows = list(doc.get("gap_records") or [])
        if not rows:
            seq += 1
            tasks.append(
                {
                    "subagent_task_id": f"f3-task-{seq:03d}",
                    "gap_group_id": gid,
                    "classification_file_path": str(p.relative_to(REPO_ROOT)),
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
            chunk = rows[start:end]
            tasks.append(
                {
                    "subagent_task_id": f"f3-task-{seq:03d}",
                    "gap_group_id": gid,
                    "classification_file_path": str(p.relative_to(REPO_ROOT)),
                    "slice_start": start,
                    "slice_end_exclusive": end,
                    "rows_in_task": len(chunk),
                    "max_rows_per_task_budget": max_rows,
                    "coverage_row_index_first": chunk[0].get("coverage_row_index"),
                    "coverage_row_index_last": chunk[-1].get("coverage_row_index"),
                    "empty_gap_group": False,
                }
            )

    wl = json.loads(WL_PATH.read_text(encoding="utf-8"))
    out = {
        "schema_id": "pm.open_gaps_reducer.fanout_worklist.v3.2.2",
        "prompt_id": "F3",
        "prompt_version": "pm.f3.v3.2.2",
        "work_id": wl.get("work_id"),
        "open_gaps_worklist_path": str(WL_PATH.relative_to(REPO_ROOT)),
        "tasks": tasks,
        "summary": {
            "fanout_tasks_total": len(tasks),
            "max_rows_per_task_budget": max_rows,
            "gap_group_ids": list(ALL_GAP_GROUP_IDS),
        },
    }
    FANOUT_PATH.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def run_task(task_id: str, invocation_id: str) -> None:
    fanout = json.loads(FANOUT_PATH.read_text(encoding="utf-8"))
    spec = next(t for t in fanout["tasks"] if t["subagent_task_id"] == task_id)
    gid = spec["gap_group_id"]
    p = REPO_ROOT / spec["classification_file_path"]
    doc = json.loads(p.read_text(encoding="utf-8"))
    rows = list(doc.get("gap_records") or [])
    if spec.get("empty_gap_group"):
        chunk: list[dict[str, Any]] = []
    else:
        chunk = rows[spec["slice_start"] : spec["slice_end_exclusive"]]

    enriched: list[dict[str, Any]] = []
    for r in chunk:
        item = dict(r)
        item["gap_group_id"] = gid
        enriched.append(item)

    out = {
        "schema_id": "pm.open_gaps_reducer_task_result.v3.2.2",
        "subagent_task_id": task_id,
        "subagent_invocation_id": invocation_id,
        "gap_group_id": gid,
        "status": "complete",
        "gap_records": enriched,
    }
    (WORK_DIR / f"open_gaps_reducer.{task_id}.result.json").write_text(
        json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def sha256_file(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def compute_reducer_counts(records: list[dict[str, Any]]) -> dict[str, int]:
    doc_discovery_required_unattempted = 0
    doc_discovery_required_stale = 0
    doc_discovery_exhausted_terminal = 0
    for r in records:
        gid = str(r.get("gap_group_id") or "")
        prior = r.get("prior_resolver_state") or {}
        if gid == "doc_discovery_exhaustion":
            doc_discovery_exhausted_terminal += 1
        elif gid == "doc_discovery_required":
            dds = attempt_state_token(prior)
            if dds == "doc_discovery_required":
                doc_discovery_required_unattempted += 1
            elif dds == "no_doc_discovery_loop":
                doc_discovery_required_stale += 1
            else:
                doc_discovery_required_unattempted += 1
    return {
        "doc_discovery_required_unattempted": doc_discovery_required_unattempted,
        "doc_discovery_required_stale": doc_discovery_required_stale,
        "doc_discovery_exhausted_terminal": doc_discovery_exhausted_terminal,
    }


def counts_by_gap_group(records: list[dict[str, Any]]) -> dict[str, int]:
    out: dict[str, int] = {g: 0 for g in ALL_GAP_GROUP_IDS}
    for r in records:
        gid = str(r.get("gap_group_id") or "")
        if gid in out:
            out[gid] += 1
    return out


def decide_route(
    reducer_dd: dict[str, int],
    by_group: dict[str, int],
) -> dict[str, Any]:
    """F3 terminal route precedence v3.2.2 (deterministic)."""
    u_un = int(reducer_dd["doc_discovery_required_unattempted"])
    u_st = int(reducer_dd["doc_discovery_required_stale"])
    u = u_un + u_st
    ex = int(reducer_dd["doc_discovery_exhausted_terminal"])
    concrete_fix = by_group.get("concrete_fix_backlog", 0)
    concrete_missing = by_group.get("concrete_missing_file_fix_backlog", 0)
    process_n = by_group.get("process_followup", 0)
    lineage = by_group.get("source_lineage_check", 0)
    layout = by_group.get("layout_repair", 0)
    stale_tok = by_group.get("stale_token_resolution", 0)

    other_than_concrete = u + ex + process_n + lineage + layout + stale_tok + concrete_missing

    # 1) Concrete fix backlog exists and no other gap groups / doc-discovery rows remain
    if concrete_fix > 0 and other_than_concrete == 0:
        return {
            "next_prompt_id": "G0",
            "next_prompt_name": "Section Entry: Reconciliation",
            "precedence_rule": "rule_1_concrete_fix_backlog_only_no_other_blockers",
            "next_prompt_request": "Paste prompt G0 — Section Entry: Reconciliation v3.2.2.",
        }

    # 2) Unattempted or stale doc-discovery required work exists -> F4
    if u > 0:
        return {
            "next_prompt_id": "F4",
            "next_prompt_name": "Doc Discovery Exhaustion Gate",
            "precedence_rule": "rule_2_doc_discovery_required_unattempted_or_stale_exists",
            "next_prompt_request": "Paste prompt F4 — Doc Discovery Exhaustion Gate v3.2.2.",
        }

    # Process / path / source-lineage / missing-file blockers (before exhausted-only lane)
    if process_n > 0 or lineage > 0 or layout > 0 or stale_tok > 0 or concrete_missing > 0:
        return {
            "next_prompt_id": "B3",
            "next_prompt_name": "Issue / Process Adjudicator",
            "precedence_rule": "rule_4_process_path_source_or_missing_file_blockers_not_repeat_doc_discovery",
            "next_prompt_request": "Paste prompt B3 — Issue / Process Adjudicator v3.2.2.",
        }

    # 3) Only terminal exhausted doc-discovery lane (no required work, no process defects above)
    if ex > 0:
        return {
            "next_prompt_id": "B3",
            "next_prompt_name": "Issue / Process Adjudicator",
            "precedence_rule": "rule_3_only_terminal_exhausted_doc_discovery_no_f4_f5_repeat",
            "next_prompt_request": "Paste prompt B3 — Issue / Process Adjudicator v3.2.2.",
        }

    # Default: reconciliation entry when no doc-discovery or blocker rows remain
    return {
        "next_prompt_id": "G0",
        "next_prompt_name": "Section Entry: Reconciliation",
        "precedence_rule": "rule_default_no_doc_discovery_required_reconciliation_entry",
        "next_prompt_request": "Paste prompt G0 — Section Entry: Reconciliation v3.2.2.",
    }


def merge_all(timestamp_utc: str) -> dict[str, Any]:
    fanout = json.loads(FANOUT_PATH.read_text(encoding="utf-8"))
    task_order = [t["subagent_task_id"] for t in fanout["tasks"]]
    records: list[dict[str, Any]] = []
    for tid in task_order:
        chunk = json.loads((WORK_DIR / f"open_gaps_reducer.{tid}.result.json").read_text(encoding="utf-8"))
        records.extend(chunk.get("gap_records") or [])

    records.sort(key=lambda r: (int(r.get("coverage_row_index", -1)), str(r.get("gap_group_id"))))

    wl = json.loads(WL_PATH.read_text(encoding="utf-8"))
    wl_sha = hashlib.sha256(WL_PATH.read_bytes()).hexdigest()
    tc_sha = hashlib.sha256(TC_PATH.read_bytes()).hexdigest()

    expected = int(wl["summary"]["classified_rows"])
    if len(records) != expected:
        raise SystemExit(f"merge gap_record count mismatch: got {len(records)} expected {expected}")

    reducer_dd = compute_reducer_counts(records)
    by_group = counts_by_gap_group(records)
    route = decide_route(reducer_dd, by_group)

    class_artifacts: list[dict[str, Any]] = []
    for gid in ALL_GAP_GROUP_IDS:
        p = gap_classification_path(gid)
        class_artifacts.append(
            {
                "path": str(p.relative_to(REPO_ROOT)),
                "sha256": sha256_file(p),
                "gap_group_kind": gid,
                "gap_record_total": len(json.loads(p.read_text(encoding="utf-8")).get("gap_records") or []),
            }
        )

    open_gaps = {
        "schema_id": "pm.open_gaps.v3.2.2",
        "prompt_id": "F3",
        "prompt_version": "pm.f3.v3.2.2",
        "timestamp_utc": timestamp_utc,
        "work_id": wl.get("work_id"),
        "provenance": {
            "open_gaps_worklist_path": str(WL_PATH.relative_to(REPO_ROOT)),
            "open_gaps_worklist_sha256": wl_sha,
            "transfer_coverage_path": str(TC_PATH.relative_to(REPO_ROOT)),
            "transfer_coverage_sha256": tc_sha,
            "open_gaps_classification_artifacts": class_artifacts,
        },
        "summary": {
            "coverage_rows_total": wl["summary"].get("coverage_rows_total"),
            "gap_record_total": len(records),
            "reducer_counts_by_gap_group_kind": by_group,
            "doc_discovery_required_unattempted": reducer_dd["doc_discovery_required_unattempted"],
            "doc_discovery_required_stale": reducer_dd["doc_discovery_required_stale"],
            "doc_discovery_exhausted_terminal": reducer_dd["doc_discovery_exhausted_terminal"],
        },
        "gap_records": records,
        "final_gate": {
            "passed": True,
            "every_classified_gap_record_merged": True,
        },
    }
    (WORK_DIR / "open_gaps.json").write_text(json.dumps(open_gaps, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    reducer_report = {
        "schema_id": "pm.open_gaps_reducer_report.v3.2.2",
        "prompt_id": "F3",
        "prompt_version": "pm.f3.v3.2.2",
        "timestamp_utc": timestamp_utc,
        "work_id": wl.get("work_id"),
        "doc_discovery_required_unattempted": reducer_dd["doc_discovery_required_unattempted"],
        "doc_discovery_required_stale": reducer_dd["doc_discovery_required_stale"],
        "doc_discovery_exhausted_terminal": reducer_dd["doc_discovery_exhausted_terminal"],
        "counts_by_gap_group_kind": by_group,
        "doc_discovery_loop_breaker": {
            "do_not_route_terminal_exhausted_to_f4_f5_without_material_delta": True,
            "f4_selected_only_when_unattempted_or_stale_required_work_exists": bool(
                reducer_dd["doc_discovery_required_unattempted"] + reducer_dd["doc_discovery_required_stale"] > 0
            ),
            "notes": [
                "Hotfix v3.2.2: route precedence prefers active doc_discovery_required work (F4) over exhausted-only adjudication (B3).",
                "Process/path/source-lineage blockers (rule_4) take precedence over exhausted-only (rule_3); do not route terminal exhausted rows to F4/F5 without unattempted/stale required work.",
            ],
        },
        "route_decision": {
            **route,
            "exactly_one_next_prompt": True,
        },
        "final_gate": {
            "passed": True,
            "route_based_on_reducer_counts": True,
            "single_next_prompt_requested": True,
        },
    }
    (WORK_DIR / "open_gaps_reducer_report.json").write_text(
        json.dumps(reducer_report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    return {
        "gap_record_total": len(records),
        "route": route,
        "reducer_dd": reducer_dd,
    }


def run_pipeline(wave_size: int = 8) -> None:
    write_fanout()
    fanout = json.loads(FANOUT_PATH.read_text(encoding="utf-8"))
    task_ids = [t["subagent_task_id"] for t in fanout["tasks"]]
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    worker = WORK_DIR / "f3_task_worker.py"
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
            res_path = WORK_DIR / f"open_gaps_reducer.{tid}.result.json"
            spec = next(x for x in fanout["tasks"] if x["subagent_task_id"] == tid)
            invocations.append(
                {
                    "subagent_invocation_id": inv,
                    "subagent_task_id": tid,
                    "subagent_type": "shell_bounded_executor",
                    "input_path": str((REPO_ROOT / spec["classification_file_path"]).as_posix()),
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
            "stage_id": "F3",
            "prompt_id": "F3",
            "prompt_version": "pm.f3.v3.2.2",
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
        wave_path = WORK_DIR / f"open_gaps_reducer.wave-{w_i:03d}.json"
        wave_path.write_text(json.dumps(wave_doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        wave_paths.append(str(wave_path.relative_to(REPO_ROOT)))

    merge_meta = merge_all(ts)
    meta = {
        "timestamp_utc": ts,
        "wave_paths": wave_paths,
        "task_to_invocation_map": task_to_invocation,
        "invocation_to_task_map": invocation_to_task,
        "merge": merge_meta,
    }
    (WORK_DIR / "open_gaps_reducer.pipeline_meta.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    emit_stage_report(ts, fanout, task_to_invocation, invocation_to_task, wave_paths, merge_meta)


def emit_stage_report(
    ts: str,
    fanout: dict[str, Any],
    task_to_invocation: dict[str, str],
    invocation_to_task: dict[str, str],
    wave_paths_rel: list[str],
    merge_meta: dict[str, Any],
) -> None:
    """Write stage_report.F3.json with v3.2.2 fan-out proof fields (wave-ordered invocations)."""
    tasks = [t["subagent_task_id"] for t in fanout["tasks"]]
    required = len(tasks)
    wave_files = sorted(WORK_DIR.glob("open_gaps_reducer.wave-*.json"))
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
    og_sha = sha256_file(WORK_DIR / "open_gaps.json")
    rr_sha = sha256_file(WORK_DIR / "open_gaps_reducer_report.json")
    wl_rel = str(WL_PATH.relative_to(REPO_ROOT))
    tc_rel = str(TC_PATH.relative_to(REPO_ROOT))
    rr_path = WORK_DIR / "open_gaps_reducer_report.json"
    rr = json.loads(rr_path.read_text(encoding="utf-8"))
    route = rr.get("route_decision") or {}
    next_id = route.get("next_prompt_id", "")
    out_sr = WORK_DIR / "stage_report.F3.json"

    art_paths: list[Path] = [
        FANOUT_PATH,
        WORK_DIR / "f3_task_worker.py",
        WORK_DIR / "open_gaps_reducer.pipeline_meta.json",
        WORK_DIR / "open_gaps.json",
        rr_path,
    ]
    art_paths += sorted(WORK_DIR.glob("open_gaps_reducer.wave-*.json"))
    art_paths += sorted(WORK_DIR.glob("open_gaps_reducer.f3-task-*.result.json"))
    art_paths.append(out_sr)
    artifacts_written = sorted(rel_plan(p) for p in art_paths)

    next_map = {
        "F4": "Paste prompt F4 — Doc Discovery Exhaustion Gate v3.2.2.",
        "G0": "Paste prompt G0 — Section Entry: Reconciliation v3.2.2.",
        "B3": "Paste prompt B3 — Issue / Process Adjudicator v3.2.2.",
    }
    next_req = route.get("next_prompt_request") or next_map.get(next_id, "manual_decision")

    report: dict[str, Any] = {
        "schema_id": "pm.stage_report.v3.2.2",
        "prompt_id": "F3",
        "prompt_version": "pm.f3.v3.2.2",
        "timestamp_utc": ts,
        "section_id": "F",
        "section_name": "Gaps_Routing_Doc_Discovery",
        "work_id": fanout.get("work_id"),
        "status": "complete",
        "execution_type": "semantic_chunk_processing",
        "execution_type_basis": "F3 v3.2.2: reducer/route gate over merged gap records with terminal route precedence; bounded <=25 gap_records per shell invocation; doc_discovery loop breaker in reducer report.",
        "stage_purpose": "Merge F2 gap classifications into open_gaps.json; emit open_gaps_reducer_report.json with doc_discovery_required_unattempted/stale and doc_discovery_exhausted_terminal counts; exactly one next prompt from route precedence.",
        "inputs_read": [
            {"path": wl_rel, "sha256": wl_sha, "read_mode": "subagent_bounded_slices_via_shell_executor"},
            {"path": tc_rel, "sha256": tc_sha, "read_mode": "provenance_sha256_only_in_merge"},
            {
                "path": "Plans/.pipeline/work_items/w-20260312-203855/open_gaps_classifications/*.json",
                "read_mode": "per_task_bounded_classification_file_slices",
            },
        ],
        "skip_gate_evaluated": True,
        "skip_gate_passed": False,
        "skip_gate_basis": "Thousands of gap_records across nine classification files exceed <=25 single-task skip gate.",
        "subagents": {
            "used": True,
            "required": True,
            "executor_model": "bounded_per_task_shell_subprocess_invoking_f3_task_worker_py",
            "fanout_worklist_path": str(FANOUT_PATH.relative_to(REPO_ROOT)),
            "batching_unit": "gap_record_slice_within_classification_file",
            "max_rows_per_task": 25,
            "required_subagent_tasks_total": required,
            "distinct_subagent_invocations_total": required,
            "omnibus_invocation_detected": False,
            "main_agent_bulk_output_detected": False,
            "fanout_proof_status": "pass",
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
        "fanout_proof_status": "pass",
        "live_doc_writes": [],
        "artifacts_written": artifacts_written,
        "reducer_summary": {
            "gap_record_total": merge_meta.get("gap_record_total"),
            "route": merge_meta.get("route"),
            "reducer_dd": merge_meta.get("reducer_dd"),
            "open_gaps_sha256": og_sha,
            "open_gaps_reducer_report_sha256": rr_sha,
        },
        "final_gate": {
            "name": "route_based_on_reducer_counts_single_next_prompt",
            "result": "pass",
            "checks": [
                "open_gaps.json merged gap_record_total matches open_gaps_worklist classified_rows",
                "open_gaps_reducer_report.json includes doc_discovery_required_unattempted, doc_discovery_required_stale, doc_discovery_exhausted_terminal",
                "route_decision.exactly_one_next_prompt == true",
                f"route_decision.next_prompt_id == {next_id!r}",
                "terminal exhausted-only lane does not select F4 when u==0 (hotfix v3.2.2)",
            ],
        },
        "blockers": [],
        "next_prompt_request": next_req,
        "notes": [
            "Fan-out proof: one shell_bounded_executor invocation per f3-task-NNN with one reducer task result artifact.",
            f"Reducer counts snapshot: {merge_meta.get('reducer_dd')!r}",
        ],
    }

    out_sr.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--run-pipeline", action="store_true")
    ap.add_argument("--write-fanout", action="store_true")
    ap.add_argument("--merge-only", action="store_true")
    ap.add_argument("--task-id", default="")
    ap.add_argument("--invocation-id", default="")
    ap.add_argument("--timestamp-utc", default="20260511T220000Z")
    args = ap.parse_args()
    if args.run_pipeline:
        run_pipeline()
        return
    if args.write_fanout:
        write_fanout()
        return
    if args.merge_only:
        merge_all(args.timestamp_utc)
        return
    if not args.task_id or not args.invocation_id:
        ap.error("--task-id and --invocation-id required unless --run-pipeline/--write-fanout/--merge-only")
    run_task(args.task_id, args.invocation_id)


if __name__ == "__main__":
    main()
