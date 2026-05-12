#!/usr/bin/env python3
"""
F5 bounded task worker: hybrid mechanical (path existence) + bounded window read
for candidate doc overlap. One invocation handles <=25 resolver instructions.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

WORK_DIR = Path(__file__).resolve().parent
REPO_ROOT = WORK_DIR.parents[3]
DR_PATH = WORK_DIR / "doc_discovery_exhaustion_report.json"
TC_PATH = WORK_DIR / "transfer_coverage.json"
FANOUT_PATH = WORK_DIR / "doc_discovery_resolver.fanout_worklist.json"

MAX_WINDOW_LINES = 120
OVERLAP_MIN_TOKENS = 1


def is_eligible_live_path(p: str) -> bool:
    if not isinstance(p, str) or not p.startswith("Plans/"):
        return False
    bad = (
        ".pipeline/",
        "/_shards/",
        "/.evidence/",
        "legacy_quarantine",
        "__DOC_DISCOVERY_REQUIRED__",
        "__PROCESS_ONLY__",
        "__NEW_FILE__",
        "__DOCUMENT_START__",
    )
    if any(b in p for b in bad):
        return False
    if "..." in p or "*" in p or "Plans/**" in p:
        return False
    return True


def strip_anchor(path: str) -> str:
    if not isinstance(path, str):
        return ""
    return path.split("#", 1)[0]


def tokenize(text: str) -> set[str]:
    return {x for x in re.split(r"[^\w]+", text.lower()) if len(x) > 3}


def read_window(repo: Path, rel_path: str, max_lines: int) -> str:
    p = repo / rel_path
    if not p.is_file():
        return ""
    lines: list[str] = []
    with open(p, encoding="utf-8", errors="replace") as f:
        for i, line in enumerate(f):
            if i >= max_lines:
                break
            lines.append(line)
    return "\n".join(lines)


def resolve_one(tc_row: dict[str, Any], instr: dict[str, Any]) -> dict[str, Any]:
    prior_status = tc_row.get("doc_resolution_status")
    prior_f5_explicit = bool(tc_row.get("f5_unresolved_explicit_preserved"))
    prior_exhausted = str(tc_row.get("doc_discovery_attempt_state") or "") in (
        "exhausted_doc_discovery",
        "f5_unresolved_explicit",
        "mechanically_exhausted",
        "already_exhausted",
    )

    hints = " ".join(str(h) for h in (tc_row.get("candidate_doc_hints") or []) if isinstance(h, str))
    raw_targets = tc_row.get("live_doc_targets_union") or []
    targets = []
    for x in raw_targets:
        if not isinstance(x, str):
            continue
        t = strip_anchor(x)
        if is_eligible_live_path(t):
            targets.append(t)

    existing = [t for t in targets if (REPO_ROOT / t).is_file()]
    missing = [t for t in targets if t not in existing]

    base = {
        "coverage_row_index": instr.get("coverage_row_index"),
        "obligation_id": instr.get("obligation_id"),
        "row_hash": instr.get("row_hash"),
        "f4_classification": instr.get("f4_classification"),
        "prior_doc_resolution_status": prior_status,
        "prior_f5_unresolved_explicit_preserved": prior_f5_explicit,
        "resolver_engine": "pm.f5.hybrid_path_and_bounded_window_overlap_v1",
        "bounded_read_max_lines_per_candidate": MAX_WINDOW_LINES,
        "timestamp_utc": datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"),
    }

    if prior_f5_explicit or prior_exhausted:
        return {
            **base,
            "resolution_kind": "skipped_already_terminal_or_explicit",
            "doc_discovery_attempt_state": tc_row.get("doc_discovery_attempt_state"),
            "unresolved_reason": "already_explicit_or_exhausted_no_repeat_f5",
            "material_binding_new": False,
            "newly_explicit_unresolved": False,
            "semantic_component_invoked": False,
        }

    if not existing:
        newly_explicit = not prior_f5_explicit
        if not targets:
            reason = "no_live_doc_targets_union_classifier_intake_gap"
        else:
            reason = "no_eligible_existing_plans_files_for_candidate_windows"
        return {
            **base,
            "resolution_kind": "f5_unresolved_explicit",
            "doc_discovery_attempt_state": "f5_unresolved_explicit",
            "unresolved_reason": reason,
            "missing_eligible_plans_paths": missing,
            "material_binding_new": False,
            "newly_explicit_unresolved": newly_explicit,
            "semantic_component_invoked": bool(targets),
        }

    hint_tokens = tokenize(hints)
    best_path = existing[0]
    best_score = -1
    scores: dict[str, int] = {}
    semantic_used = False
    for t in existing:
        body = read_window(REPO_ROOT, t, MAX_WINDOW_LINES)
        if not body.strip():
            scores[t] = 0
            continue
        semantic_used = True
        doc_tokens = tokenize(body)
        score = len(hint_tokens & doc_tokens) if hint_tokens else 0
        scores[t] = score
        if score > best_score or (score == best_score and t < best_path):
            best_score = score
            best_path = t

    if len(existing) == 1:
        chosen = existing[0]
        material = prior_status != "concrete_plans_targets"
        return {
            **base,
            "resolution_kind": "resolved_binding",
            "doc_discovery_attempt_state": "f5_resolved_binding",
            "selected_owner_plans_path": chosen,
            "overlap_scores_by_path": scores,
            "material_binding_new": bool(material),
            "newly_explicit_unresolved": False,
            "semantic_component_invoked": semantic_used,
        }

    if best_score < OVERLAP_MIN_TOKENS and hint_tokens:
        newly_explicit = not prior_f5_explicit
        return {
            **base,
            "resolution_kind": "f5_unresolved_explicit",
            "doc_discovery_attempt_state": "f5_unresolved_explicit",
            "unresolved_reason": "no_semantic_overlap_above_threshold_without_guessing_owner",
            "overlap_scores_by_path": scores,
            "material_binding_new": False,
            "newly_explicit_unresolved": newly_explicit,
            "semantic_component_invoked": semantic_used,
        }

    if not hint_tokens and len(existing) > 1:
        newly_explicit = not prior_f5_explicit
        return {
            **base,
            "resolution_kind": "f5_unresolved_explicit",
            "doc_discovery_attempt_state": "f5_unresolved_explicit",
            "unresolved_reason": "multiple_existing_targets_without_candidate_hints_no_owner_guess",
            "overlap_scores_by_path": scores,
            "material_binding_new": False,
            "newly_explicit_unresolved": newly_explicit,
            "semantic_component_invoked": semantic_used,
        }

    chosen = best_path or sorted(existing)[0]
    material = prior_status != "concrete_plans_targets" or len(existing) > 1
    return {
        **base,
        "resolution_kind": "resolved_binding",
        "doc_discovery_attempt_state": "f5_resolved_binding",
        "selected_owner_plans_path": chosen,
        "overlap_scores_by_path": scores,
        "material_binding_new": bool(material and best_score >= OVERLAP_MIN_TOKENS),
        "newly_explicit_unresolved": False,
        "semantic_component_invoked": semantic_used,
    }


def load_instructions() -> list[dict[str, Any]]:
    dr = json.loads(DR_PATH.read_text(encoding="utf-8"))
    return list(dr.get("f5_resolver_worklist_instructions") or [])


def write_fanout(max_rows: int = 25) -> None:
    instrs = load_instructions()
    tasks: list[dict[str, Any]] = []
    for i, start in enumerate(range(0, len(instrs), max_rows), start=1):
        end = min(start + max_rows, len(instrs))
        chunk = instrs[start:end]
        tasks.append(
            {
                "subagent_task_id": f"f5-task-{i:03d}",
                "instruction_slice_start": start,
                "instruction_slice_end_exclusive": end,
                "rows_in_task": len(chunk),
                "max_rows_per_task_budget": max_rows,
                "obligation_id_first": chunk[0].get("obligation_id"),
                "obligation_id_last": chunk[-1].get("obligation_id"),
            }
        )

    dr = json.loads(DR_PATH.read_text(encoding="utf-8"))
    doc = {
        "schema_id": "pm.doc_discovery_resolver.fanout_worklist.v3.2.2",
        "prompt_id": "F5",
        "prompt_version": "pm.f5.v3.2.2",
        "work_id": dr.get("work_id"),
        "doc_discovery_exhaustion_report_path": str(DR_PATH.relative_to(REPO_ROOT)),
        "transfer_coverage_path": str(TC_PATH.relative_to(REPO_ROOT)),
        "f5_instructions_total": len(instrs),
        "tasks": tasks,
        "summary": {"fanout_tasks_total": len(tasks), "max_rows_per_task_budget": max_rows},
    }
    FANOUT_PATH.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def run_task(task_id: str, invocation_id: str) -> None:
    fanout = json.loads(FANOUT_PATH.read_text(encoding="utf-8"))
    spec = next(t for t in fanout["tasks"] if t["subagent_task_id"] == task_id)
    instrs = load_instructions()
    chunk = instrs[spec["instruction_slice_start"] : spec["instruction_slice_end_exclusive"]]
    tc_rows: list[dict[str, Any]] = json.loads(TC_PATH.read_text(encoding="utf-8"))["coverage_rows"]

    results: list[dict[str, Any]] = []
    for ins in chunk:
        idx = int(ins["coverage_row_index"])
        results.append(resolve_one(tc_rows[idx], ins))

    out = {
        "schema_id": "pm.doc_discovery_resolver_task_result.v3.2.2",
        "subagent_task_id": task_id,
        "subagent_invocation_id": invocation_id,
        "status": "complete",
        "resolution_rows": results,
    }
    (WORK_DIR / f"doc_discovery_resolver.{task_id}.result.json").write_text(
        json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def sha256_file(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def merge_resolution(timestamp_utc: str) -> dict[str, Any]:
    fanout = json.loads(FANOUT_PATH.read_text(encoding="utf-8"))
    order = [t["subagent_task_id"] for t in fanout["tasks"]]
    rows: list[dict[str, Any]] = []
    for tid in order:
        chunk = json.loads((WORK_DIR / f"doc_discovery_resolver.{tid}.result.json").read_text(encoding="utf-8"))
        rows.extend(chunk.get("resolution_rows") or [])

    rows.sort(key=lambda r: (int(r.get("coverage_row_index", -1)), str(r.get("obligation_id"))))
    expected = int(fanout["f5_instructions_total"])
    if len(rows) != expected:
        raise SystemExit(f"resolution row count mismatch {len(rows)} != {expected}")

    new_resolved = sum(
        1
        for r in rows
        if r.get("resolution_kind") == "resolved_binding" and r.get("material_binding_new")
    )
    newly_explicit = sum(1 for r in rows if r.get("newly_explicit_unresolved"))
    already_explicit = sum(
        1
        for r in rows
        if r.get("resolution_kind") == "skipped_already_terminal_or_explicit"
        or (
            r.get("resolution_kind") == "f5_unresolved_explicit"
            and not r.get("newly_explicit_unresolved")
            and r.get("prior_f5_unresolved_explicit_preserved")
        )
    )

    material_resolution_delta = bool(new_resolved > 0 or newly_explicit > 0)
    timestamp_only_delta = not material_resolution_delta

    unresolved_after = sum(1 for r in rows if r.get("resolution_kind") == "f5_unresolved_explicit")

    if material_resolution_delta:
        route = {
            "next_prompt_id": "E3",
            "next_prompt_name": "Coverage Reducer / Source Gate",
            "next_prompt_request": "Paste prompt E3 — Coverage Reducer / Source Gate v3.2.2.",
            "precedence_rule": "material_resolution_delta_or_new_explicit_state_requires_e3_once",
            "selected_terminal_route_reason": None,
        }
    else:
        route = {
            "next_prompt_id": "B3",
            "next_prompt_name": "Issue / Process Adjudicator",
            "next_prompt_request": "Paste prompt B3 — Issue / Process Adjudicator v3.2.2.",
            "precedence_rule": "no_material_binding_or_state_transition_route_away_from_e3",
            "selected_terminal_route_reason": "f5_no_new_resolved_bindings_and_no_newly_explicit_unresolved_transitions_timestamp_or_stalemate_family",
        }

    dr_sha = hashlib.sha256(DR_PATH.read_bytes()).hexdigest()
    tc_sha = hashlib.sha256(TC_PATH.read_bytes()).hexdigest()

    doc = {
        "schema_id": "pm.doc_discovery_resolution.v3.2.2",
        "prompt_id": "F5",
        "prompt_version": "pm.f5.v3.2.2",
        "timestamp_utc": timestamp_utc,
        "work_id": fanout.get("work_id"),
        "execution_type": "hybrid_mechanical_and_semantic",
        "provenance": {
            "doc_discovery_exhaustion_report_path": str(DR_PATH.relative_to(REPO_ROOT)),
            "doc_discovery_exhaustion_report_sha256": dr_sha,
            "transfer_coverage_path": str(TC_PATH.relative_to(REPO_ROOT)),
            "transfer_coverage_sha256": tc_sha,
        },
        "summary": {
            "f5_instructions_total": expected,
            "resolution_rows_total": len(rows),
            "resolved_binding_total": sum(1 for r in rows if r.get("resolution_kind") == "resolved_binding"),
            "f5_unresolved_explicit_total": sum(1 for r in rows if r.get("resolution_kind") == "f5_unresolved_explicit"),
            "skipped_terminal_total": sum(
                1 for r in rows if r.get("resolution_kind") == "skipped_already_terminal_or_explicit"
            ),
            "new_resolved_this_run": new_resolved,
            "newly_explicit_unresolved_this_run": newly_explicit,
            "already_explicit_unresolved_this_run": already_explicit,
            "unresolved_after_f5": unresolved_after,
        },
        "material_resolution_gate": {
            "material_resolution_delta": material_resolution_delta,
            "timestamp_only_delta": bool(timestamp_only_delta),
            "new_resolved_this_run": new_resolved,
            "newly_explicit_unresolved_this_run": newly_explicit,
            "already_explicit_unresolved_this_run": already_explicit,
        },
        "route_decision": {**route, "exactly_one_next_prompt": True},
        "resolution_rows": rows,
        "final_gate": {
            "passed": True,
            "every_f5_instruction_row_has_resolution_or_skip_record": True,
        },
    }
    (WORK_DIR / "doc_discovery_resolution.json").write_text(
        json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    return {
        "material_resolution_delta": material_resolution_delta,
        "timestamp_only_delta": bool(timestamp_only_delta),
        "new_resolved_this_run": new_resolved,
        "newly_explicit_unresolved_this_run": newly_explicit,
        "already_explicit_unresolved_this_run": already_explicit,
        "route": route,
    }


def run_pipeline(wave_size: int = 8) -> None:
    write_fanout()
    fanout = json.loads(FANOUT_PATH.read_text(encoding="utf-8"))
    task_ids = [t["subagent_task_id"] for t in fanout["tasks"]]
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    worker = WORK_DIR / "f5_task_worker.py"
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
            res_path = WORK_DIR / f"doc_discovery_resolver.{tid}.result.json"
            spec = next(x for x in fanout["tasks"] if x["subagent_task_id"] == tid)
            invocations.append(
                {
                    "subagent_invocation_id": inv,
                    "subagent_task_id": tid,
                    "subagent_type": "shell_bounded_executor",
                    "input_path": str(DR_PATH.relative_to(REPO_ROOT)),
                    "input_bounds": {
                        "instruction_slice_start": spec["instruction_slice_start"],
                        "instruction_slice_end_exclusive": spec["instruction_slice_end_exclusive"],
                        "rows_in_task": spec["rows_in_task"],
                        "max_rows_per_task_budget": spec["max_rows_per_task_budget"],
                    },
                    "result_artifact_path": str(res_path.relative_to(REPO_ROOT)),
                    "result_artifact_sha256": sha256_file(res_path),
                    "status": "complete",
                }
            )

        wave_doc = {
            "schema_id": "pm.wave_artifact.v3.2.2",
            "stage_id": "F5",
            "prompt_id": "F5",
            "prompt_version": "pm.f5.v3.2.2",
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
        wp = WORK_DIR / f"doc_discovery_resolver.wave-{w_i:03d}.json"
        wp.write_text(json.dumps(wave_doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        wave_paths.append(str(wp.relative_to(REPO_ROOT)))

    merge_meta = merge_resolution(ts)
    meta = {
        "timestamp_utc": ts,
        "wave_paths": wave_paths,
        "task_to_invocation_map": task_to_invocation,
        "invocation_to_task_map": invocation_to_task,
        "merge": merge_meta,
    }
    (WORK_DIR / "doc_discovery_resolver.pipeline_meta.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--run-pipeline", action="store_true")
    ap.add_argument("--write-fanout", action="store_true")
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
        merge_resolution(args.timestamp_utc)
        return
    if not args.task_id or not args.invocation_id:
        ap.error("--task-id and --invocation-id required unless --run-pipeline/--write-fanout/--merge-only")
    run_task(args.task_id, args.invocation_id)


if __name__ == "__main__":
    main()
