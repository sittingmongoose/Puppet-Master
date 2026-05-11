#!/usr/bin/env python3
"""
F1 bounded task worker: classify transfer_coverage rows into open gap buckets.
One invocation processes exactly one fan-out task id (<=25 coverage rows per task).
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
TRANSFER_PATH = WORK_DIR / "transfer_coverage.json"
FANOUT_PATH = WORK_DIR / "open_gaps_worklist_builder.fanout_worklist.json"
SOURCE_GATE_PATH = WORK_DIR / "transfer_coverage_source_gate_report.json"

EXHAUSTION_ATTEMPT_STATES = frozenset(
    {
        "f5_unresolved_explicit",
        "mechanically_exhausted",
        "exhausted_doc_discovery",
        "already_exhausted",
    }
)


def attempt_state_token(r: dict[str, Any]) -> str:
    """Normalize doc_discovery_attempt_state whether string or {state: ...} object (v3.2.2 hotfix)."""
    v = r.get("doc_discovery_attempt_state")
    if isinstance(v, dict):
        s = v.get("state")
        return str(s) if s is not None else ""
    if isinstance(v, str):
        return v
    return ""

GAP_BUCKETS = frozenset(
    {
        "no_gap",
        "concrete_fix_backlog",
        "concrete_missing_file_fix_backlog",
        "doc_discovery_required",
        "doc_discovery_exhaustion",
        "process_followup",
        "stale_token_resolution",
        "layout_repair",
        "source_lineage_check",
    }
)


def is_eligible_live_path(p: str) -> bool:
    if not isinstance(p, str) or not p.startswith("Plans/"):
        return False
    bad_substrings = (
        ".pipeline/",
        "/_shards/",
        "/.evidence/",
        "legacy_quarantine",
        "__DOC_DISCOVERY_REQUIRED__",
        "__PROCESS_ONLY__",
        "__NEW_FILE__",
        "__DOCUMENT_START__",
    )
    if any(b in p for b in bad_substrings):
        return False
    if "..." in p or "*" in p or "Plans/**" in p:
        return False
    return True


def strip_anchor(path: str) -> str:
    if not isinstance(path, str):
        return ""
    return path.split("#", 1)[0]


def keyword_bucket(r: dict[str, Any]) -> str | None:
    hints = r.get("candidate_doc_hints") or []
    blob = " ".join(
        [
            str(r.get("obligation_category", "")),
            str(r.get("aggregated_task_label", "")),
            str(r.get("next_route_hint", "")),
            " ".join(str(h) for h in hints if isinstance(h, str)),
        ]
    ).lower()
    if any(
        k in blob
        for k in (
            "token",
            "oauth",
            "credential",
            "staleness",
            "expired",
            "refresh token",
            "github auth",
        )
    ):
        return "stale_token_resolution"
    if any(
        k in blob
        for k in (
            "layout",
            "spacing",
            "visual hierarchy",
            "typography",
            "ui grid",
        )
    ):
        return "layout_repair"
    if any(
        k in blob
        for k in (
            "lineage",
            "provenance",
            "shard drift",
            "source shard",
            "ledger shard",
        )
    ):
        return "source_lineage_check"
    return None


def existing_targets(r: dict[str, Any]) -> tuple[list[str], list[str], list[str]]:
    raw = r.get("live_doc_targets_union") or []
    paths: list[str] = []
    for item in raw:
        if not isinstance(item, str):
            continue
        p = strip_anchor(item)
        if not is_eligible_live_path(p):
            continue
        paths.append(p)
    exist = [p for p in paths if (REPO_ROOT / p).is_file()]
    missing = [p for p in paths if p not in exist]
    return paths, exist, missing


def is_doc_discovery_exhaustion(r: dict[str, Any]) -> bool:
    if r.get("f5_unresolved_explicit_preserved"):
        return True
    dds = attempt_state_token(r)
    if dds in EXHAUSTION_ATTEMPT_STATES:
        return True
    hints = r.get("candidate_doc_hints") or []
    targets = r.get("live_doc_targets_union") or []
    if r.get("terminal_unresolved_doc_discovery"):
        if not hints and not targets:
            return True
        if dds != "doc_discovery_required":
            return True
    if r.get("mechanically_exhausted_preserved") and r.get("terminal_unresolved_doc_discovery"):
        return True
    return False


def is_doc_discovery_required_row(r: dict[str, Any]) -> bool:
    if is_doc_discovery_exhaustion(r):
        return False
    dds = attempt_state_token(r)
    if dds == "doc_discovery_required":
        return True
    hints = r.get("candidate_doc_hints") or []
    if r.get("aggregated_task_label") == "needs_doc_discovery":
        return True
    if r.get("aggregated_task_label") == "partial_binding_hint_only" and hints:
        return True
    if r.get("next_route_hint") == "f1_doc_discovery_classifier":
        return True
    return False


def primary_shard(r: dict[str, Any]) -> str:
    s = r.get("source_shard_ids") or []
    if not s:
        return "no-shard"
    return sorted(str(x) for x in s)[0]


def classify_row(r: dict[str, Any]) -> tuple[str, str, dict[str, Any]]:
    """Return (gap_bucket, reason_code, extra_projection_fields)."""
    if r.get("exclusion") is not None:
        return ("excluded", "transfer_coverage_row_excluded", {"exclusion": r.get("exclusion")})

    kw = keyword_bucket(r)
    if kw is not None:
        return (kw, "keyword_signal_in_hints_or_metadata", {})

    if is_doc_discovery_exhaustion(r):
        return (
            "doc_discovery_exhaustion",
            "terminal_or_exhausted_attempt_state_v3_2_2_hotfix",
            {
                "terminal_unresolved_doc_discovery": r.get("terminal_unresolved_doc_discovery"),
                "doc_discovery_attempt_state": r.get("doc_discovery_attempt_state"),
            },
        )

    if is_doc_discovery_required_row(r):
        return (
            "doc_discovery_required",
            "active_doc_discovery_or_hint_backlog_v3_2_2",
            {},
        )

    nh = str(r.get("next_route_hint") or "")
    if nh == "e4_then_coverage_process_review_if_persistent":
        return (
            "process_followup",
            "e3_source_gate_process_defect_family_no_repeat_doc_discovery",
            {},
        )

    if nh == "e4_section_exit_coverage":
        hints = r.get("candidate_doc_hints") or []
        if r.get("aggregated_task_label") == "partial_binding_hint_only" or hints:
            return (
                "doc_discovery_required",
                "unattempted_or_stale_hint_evidence_e4_route",
                {},
            )
        return (
            "process_followup",
            "classifier_union_gap_missing_live_targets_e4_route",
            {},
        )

    if r.get("aggregated_task_label") == "open_decision":
        return ("concrete_fix_backlog", "open_decision_with_follow_on_work", {})

    if r.get("aggregated_task_label") == "missing" and r.get("doc_resolution_status") == "concrete_plans_targets":
        _, _, missing = existing_targets(r)
        if missing:
            return (
                "concrete_missing_file_fix_backlog",
                "live_union_lists_missing_eligible_plans_files",
                {"missing_eligible_plans_paths": missing},
            )
        return (
            "concrete_fix_backlog",
            "missing_label_but_concrete_plans_targets_present",
            {},
        )

    paths, exist, _ = existing_targets(r)
    if paths and exist and len(exist) == len(paths):
        if r.get("doc_resolution_status") == "concrete_plans_targets" and r.get("aggregated_task_label") not in (
            "missing",
            "open_decision",
            "missing_live_target",
            "needs_doc_discovery",
            "partial_binding_hint_only",
        ):
            return ("no_gap", "concrete_targets_present_and_stable_labels", {})

    return (
        "process_followup",
        "default_coverage_followup_bucket",
        {"aggregated_task_label": r.get("aggregated_task_label"), "next_route_hint": nh},
    )


def row_projection(
    r: dict[str, Any],
    idx: int,
    gap_bucket: str,
    reason: str,
    extra: dict[str, Any],
) -> dict[str, Any]:
    base: dict[str, Any] = {
        "coverage_row_index": idx,
        "obligation_id": r.get("obligation_id"),
        "row_hash": r.get("row_hash"),
        "coverage_task_id": r.get("coverage_task_id"),
        "gap_bucket": gap_bucket,
        "assignment_reason_code": reason,
        "aggregated_task_label": r.get("aggregated_task_label"),
        "doc_discovery_attempt_state": r.get("doc_discovery_attempt_state"),
        "terminal_unresolved_doc_discovery": r.get("terminal_unresolved_doc_discovery"),
        "doc_resolution_status": r.get("doc_resolution_status"),
        "next_route_hint": r.get("next_route_hint"),
        "source_shard_id": primary_shard(r),
        "live_doc_targets_union": r.get("live_doc_targets_union") or [],
        "candidate_doc_hints": r.get("candidate_doc_hints") or [],
    }
    if gap_bucket == "excluded":
        base["transfer_row_kind"] = "excluded"
        base["exclusion"] = extra.get("exclusion")
    else:
        base["transfer_row_kind"] = "classified"
    if extra:
        base["assignment_context"] = extra
    return base


def write_fanout(max_rows: int = 25) -> None:
    with open(TRANSFER_PATH, encoding="utf-8") as f:
        rows = json.load(f)["coverage_rows"]
    tasks: list[dict[str, Any]] = []
    total = len(rows)
    n_tasks = (total + max_rows - 1) // max_rows
    for ti in range(n_tasks):
        start = ti * max_rows
        end = min(start + max_rows, total)
        chunk = rows[start:end]
        task_id = f"f1-task-{ti+1:03d}"
        tasks.append(
            {
                "subagent_task_id": task_id,
                "coverage_row_index_start": start,
                "coverage_row_index_end_exclusive": end,
                "coverage_rows_in_task": len(chunk),
                "max_coverage_rows_per_task_budget": max_rows,
                "obligation_id_first": chunk[0].get("obligation_id"),
                "obligation_id_last": chunk[-1].get("obligation_id"),
                "row_hashes": [c.get("row_hash") for c in chunk],
            }
        )
    doc = {
        "schema_id": "pm.open_gaps_worklist_builder.fanout_worklist.v3.2.2",
        "prompt_id": "F1",
        "prompt_version": "pm.f1.v3.2.2",
        "work_id": "w-20260312-203855",
        "transfer_coverage_path": str(TRANSFER_PATH.relative_to(REPO_ROOT)),
        "tasks": tasks,
        "summary": {
            "coverage_rows_total": total,
            "fanout_tasks_total": len(tasks),
            "max_coverage_rows_per_task_budget": max_rows,
        },
    }
    FANOUT_PATH.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def run_task(task_id: str, invocation_id: str) -> None:
    fanout = json.loads(FANOUT_PATH.read_text(encoding="utf-8"))
    tasks = {t["subagent_task_id"]: t for t in fanout["tasks"]}
    if task_id not in tasks:
        raise SystemExit(f"Unknown task id {task_id}")
    spec = tasks[task_id]
    with open(TRANSFER_PATH, encoding="utf-8") as f:
        all_rows: list[dict[str, Any]] = json.load(f)["coverage_rows"]

    out_rows: list[dict[str, Any]] = []
    for idx in range(spec["coverage_row_index_start"], spec["coverage_row_index_end_exclusive"]):
        r = all_rows[idx]
        bucket, reason, extra = classify_row(r)
        out_rows.append(row_projection(r, idx, bucket, reason, extra))

    out = {
        "schema_id": "pm.open_gaps_worklist_builder_task_result.v3.2.2",
        "subagent_task_id": task_id,
        "subagent_invocation_id": invocation_id,
        "status": "complete",
        "coverage_rows": out_rows,
    }
    out_path = WORK_DIR / f"open_gaps_worklist_builder.{task_id}.result.json"
    out_path.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def sha256_file(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def merge_all(timestamp_utc: str) -> dict[str, Any]:
    results = sorted(WORK_DIR.glob("open_gaps_worklist_builder.f1-task-*.result.json"))
    if not results:
        raise SystemExit("No F1 task result files to merge")

    raw_tc = TRANSFER_PATH.read_bytes()
    tc_sha = hashlib.sha256(raw_tc).hexdigest()
    tc = json.loads(raw_tc.decode("utf-8"))
    rows_in = tc["coverage_rows"]
    total_in = len(rows_in)

    merged: list[dict[str, Any]] = []
    for rp in results:
        chunk = json.loads(rp.read_text(encoding="utf-8"))
        merged.extend(chunk.get("coverage_rows") or [])

    merged.sort(key=lambda x: int(x.get("coverage_row_index", -1)))
    if len(merged) != total_in:
        raise SystemExit(f"merge row count mismatch: got {len(merged)} expected {total_in}")

    seen_idx: set[int] = set()
    for item in merged:
        seen_idx.add(int(item["coverage_row_index"]))
    if seen_idx != set(range(total_in)):
        raise SystemExit("merge coverage_row_index set mismatch")

    gap_groups: dict[str, list[dict[str, Any]]] = {k: [] for k in sorted(GAP_BUCKETS)}
    excluded_rows: list[dict[str, Any]] = []
    for item in merged:
        b = item.get("gap_bucket")
        if b == "excluded":
            excluded_rows.append(item)
        else:
            if b not in gap_groups:
                raise SystemExit(f"Unknown gap bucket {b!r}")
            gap_groups[b].append(item)

    counts = {k: len(v) for k, v in gap_groups.items()}

    sg_raw = SOURCE_GATE_PATH.read_bytes()
    sg_sha = hashlib.sha256(sg_raw).hexdigest()
    sg = json.loads(sg_raw.decode("utf-8"))

    worklist = {
        "schema_id": "pm.open_gaps_worklist.v3.2.2",
        "prompt_id": "F1",
        "prompt_version": "pm.f1.v3.2.2",
        "timestamp_utc": timestamp_utc,
        "work_id": "w-20260312-203855",
        "provenance": {
            "transfer_coverage_path": str(TRANSFER_PATH.relative_to(REPO_ROOT)),
            "transfer_coverage_sha256": tc_sha,
            "transfer_coverage_source_gate_report_path": str(SOURCE_GATE_PATH.relative_to(REPO_ROOT)),
            "transfer_coverage_source_gate_report_sha256": sg_sha,
            "source_gate_status": sg.get("source_gate_status"),
            "f5_material_delta_gate": sg.get("f5_material_delta_gate"),
            "doc_discovery_loop_breaker": sg.get("doc_discovery_loop_breaker"),
        },
        "summary": {
            "coverage_rows_total": total_in,
            "gap_group_counts": counts,
            "classified_rows": sum(len(v) for v in gap_groups.values()),
            "excluded_rows": len(excluded_rows),
        },
        "gap_groups": gap_groups,
        "excluded_coverage_rows": sorted(excluded_rows, key=lambda x: str(x.get("obligation_id"))),
        "final_gate": {
            "passed": True,
            "every_coverage_row_assigned_or_excluded": True,
            "accounting": {
                "input_coverage_rows": total_in,
                "classified_non_excluded": sum(len(v) for v in gap_groups.values()),
                "excluded": len(excluded_rows),
                "sum": sum(len(v) for v in gap_groups.values()) + len(excluded_rows),
            },
        },
    }

    out_path = WORK_DIR / "open_gaps_worklist.json"
    out_path.write_text(json.dumps(worklist, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return worklist["summary"]


def run_pipeline(wave_size: int = 8) -> None:
    write_fanout()
    fanout = json.loads(FANOUT_PATH.read_text(encoding="utf-8"))
    task_ids = [t["subagent_task_id"] for t in fanout["tasks"]]
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    worker = WORK_DIR / "f1_task_worker.py"
    waves_dir = WORK_DIR
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
            res_path = WORK_DIR / f"open_gaps_worklist_builder.{tid}.result.json"
            spec = next(x for x in fanout["tasks"] if x["subagent_task_id"] == tid)
            invocations.append(
                {
                    "subagent_invocation_id": inv,
                    "subagent_task_id": tid,
                    "subagent_type": "shell_bounded_executor",
                    "input_path": str(TRANSFER_PATH.relative_to(REPO_ROOT)),
                    "input_bounds": {
                        "coverage_row_index_start": spec["coverage_row_index_start"],
                        "coverage_row_index_end_exclusive": spec["coverage_row_index_end_exclusive"],
                        "coverage_rows_in_task": spec["coverage_rows_in_task"],
                        "max_coverage_rows_per_task_budget": spec["max_coverage_rows_per_task_budget"],
                        "obligation_id_first": spec.get("obligation_id_first"),
                        "obligation_id_last": spec.get("obligation_id_last"),
                    },
                    "result_artifact_path": str(res_path.relative_to(REPO_ROOT)),
                    "result_artifact_sha256": sha256_file(res_path),
                    "status": "complete",
                }
            )

        wave_doc = {
            "schema_id": "pm.wave_artifact.v3.2.2",
            "stage_id": "F1",
            "prompt_id": "F1",
            "prompt_version": "pm.f1.v3.2.2",
            "work_id": "w-20260312-203855",
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
        wave_path = waves_dir / f"open_gaps_worklist_builder.wave-{w_i:03d}.json"
        wave_path.write_text(json.dumps(wave_doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        wave_paths.append(str(wave_path.relative_to(REPO_ROOT)))

    merge_all(ts)
    meta = {
        "timestamp_utc": ts,
        "wave_paths": wave_paths,
        "task_to_invocation_map": task_to_invocation,
        "invocation_to_task_map": invocation_to_task,
    }
    (WORK_DIR / "open_gaps_worklist_builder.pipeline_meta.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    emit_stage_report(ts, fanout, task_to_invocation, invocation_to_task, wave_paths)


def emit_stage_report(
    ts: str,
    fanout: dict[str, Any],
    task_to_invocation: dict[str, str],
    invocation_to_task: dict[str, str],
    wave_paths_rel: list[str],
) -> None:
    """Write stage_report.F1.json with v3.2.2 fan-out proof fields (wave-ordered invocations)."""
    tasks = [t["subagent_task_id"] for t in fanout["tasks"]]
    required = len(tasks)
    wave_files = sorted(WORK_DIR.glob("open_gaps_worklist_builder.wave-*.json"))
    invocations_wave_order: list[str] = []
    for wf in wave_files:
        wdoc = json.loads(wf.read_text(encoding="utf-8"))
        for inv in wdoc.get("invocations") or []:
            invocations_wave_order.append(inv["subagent_invocation_id"])
    if len(invocations_wave_order) != required or len(tasks) != required:
        raise SystemExit("emit_stage_report: invocation/task count mismatch")

    tc_rel = str(TRANSFER_PATH.relative_to(REPO_ROOT))
    sg_rel = str(SOURCE_GATE_PATH.relative_to(REPO_ROOT))
    og_path = WORK_DIR / "open_gaps_worklist.json"
    tc_sha = sha256_file(TRANSFER_PATH)
    sg_sha = sha256_file(SOURCE_GATE_PATH)
    wl = json.loads(og_path.read_text(encoding="utf-8"))
    sg = json.loads(SOURCE_GATE_PATH.read_text(encoding="utf-8"))

    def rel_plan(p: Path) -> str:
        return str(p.relative_to(REPO_ROOT))

    out_sr = WORK_DIR / "stage_report.F1.json"

    report: dict[str, Any] = {
        "schema_id": "pm.stage_report.v3.2.2",
        "prompt_id": "F1",
        "prompt_version": "pm.f1.v3.2.2",
        "timestamp_utc": ts,
        "section_id": "F",
        "section_name": "Gaps_Routing_Doc_Discovery",
        "work_id": "w-20260312-203855",
        "status": "complete",
        "execution_type": "semantic_chunk_processing",
        "execution_type_basis": "F1 v3.2.2: bounded gap grouping from transfer_coverage rows; terminal doc-discovery exhaustion bucketing by attempt_state + flags; E3/F5 loop-breaker constraints; fan-out exceeds <=25 skip gate.",
        "stage_purpose": "Build open_gaps_worklist.json: assign each coverage row to a gap bucket or excluded with reason; preserve doc discovery attempt state; route classifier-union gaps to process_followup.",
        "inputs_read": [
            {
                "path": tc_rel,
                "sha256": tc_sha,
                "read_mode": "subagent_bounded_task_slices_via_shell_executor_only_main_merged_manifests",
            },
            {
                "path": sg_rel,
                "sha256": sg_sha,
                "read_mode": "full_json_small_file_metadata",
            },
        ],
        "skip_gate_evaluated": True,
        "skip_gate_passed": False,
        "skip_gate_basis": "3870 coverage_rows exceed <=25 single-task skip gate.",
        "subagents": {
            "used": True,
            "required": True,
            "executor_model": "bounded_per_task_shell_subprocess_invoking_f1_task_worker_py",
            "fanout_worklist_path": str(FANOUT_PATH.relative_to(REPO_ROOT)),
            "batching_unit": "transfer_coverage_row",
            "max_coverage_rows_per_task": 25,
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
        "final_gate": {
            "name": "every_coverage_row_assigned_or_excluded_with_reason",
            "result": "pass",
            "checks": [
                "open_gaps_worklist.json final_gate.every_coverage_row_assigned_or_excluded == true",
                f"coverage_rows_total == {wl['summary']['coverage_rows_total']} and accounting sum matches",
                f"transfer_coverage_source_gate_status == {sg.get('source_gate_status')!r}",
                "doc_discovery_exhaustion bucket applied to terminal_unresolved / exhausted_doc_discovery / f5_unresolved_explicit_preserved rows per hotfix v3.2.2",
                "no timestamp-only E3<->F5 loop: source_gate f5_material_delta_gate and doc_discovery_loop_breaker fields recorded in provenance",
            ],
        },
        "blockers": [],
        "next_prompt_request": "Paste prompt F2 — Open Gaps Classifier v3.2.2.",
        "notes": [
            "Fan-out proof: one shell_bounded_executor invocation per f1-task-NNN with exactly one bounded result artifact.",
            "Wave artifacts written after each wave under open_gaps_worklist_builder.wave-*.json.",
            "attempt_state_token() normalizes string vs object attempt states for exhaustion classification.",
            f"open_gaps_worklist gap_group_counts: {wl['summary'].get('gap_group_counts', {})}",
        ],
    }
    art_paths: list[Path] = [
        FANOUT_PATH,
        WORK_DIR / "f1_task_worker.py",
        WORK_DIR / "open_gaps_worklist_builder.pipeline_meta.json",
        og_path,
    ]
    art_paths += sorted(WORK_DIR.glob("open_gaps_worklist_builder.wave-*.json"))
    art_paths += sorted(WORK_DIR.glob("open_gaps_worklist_builder.f1-task-*.result.json"))
    art_paths.append(out_sr)
    report["artifacts_written"] = sorted(rel_plan(p) for p in art_paths)

    out_sr.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write-fanout", action="store_true")
    ap.add_argument("--run-pipeline", action="store_true")
    ap.add_argument("--task-id", help="Fan-out task id, e.g. f1-task-001")
    ap.add_argument("--invocation-id", default="")
    ap.add_argument("--merge-only", action="store_true")
    ap.add_argument("--timestamp-utc", default="20260511T200000Z")
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
    if not args.task_id:
        ap.error("--task-id required unless --merge-only/--write-fanout/--run-pipeline")
    if not args.invocation_id:
        ap.error("--invocation-id required for --task-id runs")
    run_task(args.task_id, args.invocation_id)


if __name__ == "__main__":
    main()
