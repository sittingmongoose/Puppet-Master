#!/usr/bin/env python3
"""
F4 bounded task worker: classify doc-discovery gap rows as unattempted, stale, or exhausted;
mark F5 eligibility per v3.2.2 hotfix (candidate evidence required).
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
OG_PATH = WORK_DIR / "open_gaps.json"
TC_PATH = WORK_DIR / "transfer_coverage.json"
FANOUT_PATH = WORK_DIR / "doc_discovery_exhaustion_gate.fanout_worklist.json"

DOC_GAP_GROUPS = frozenset({"doc_discovery_required", "doc_discovery_exhaustion"})


def load_doc_discovery_rows() -> list[dict[str, Any]]:
    og = json.loads(OG_PATH.read_text(encoding="utf-8"))
    return [r for r in og.get("gap_records") or [] if r.get("gap_group_id") in DOC_GAP_GROUPS]


def classify_row(gr: dict[str, Any], tr: dict[str, Any]) -> dict[str, Any]:
    gid = str(gr.get("gap_group_id") or "")
    prior = gr.get("prior_resolver_state") or {}
    dds = prior.get("doc_discovery_attempt_state")
    hints = list(gr.get("candidate_doc_hints") or tr.get("candidate_doc_hints") or [])
    targets = list(gr.get("live_doc_targets_union") or tr.get("live_doc_targets_union") or [])
    has_candidate_evidence = bool(hints) or bool(targets)
    f5_explicit = bool(prior.get("f5_unresolved_explicit_preserved") or tr.get("f5_unresolved_explicit_preserved"))
    terminal = bool(prior.get("terminal_unresolved_doc_discovery") or tr.get("terminal_unresolved_doc_discovery"))

    if gid == "doc_discovery_exhaustion":
        lane = "exhausted"
    elif gid == "doc_discovery_required":
        if dds == "doc_discovery_required":
            lane = "unattempted"
        elif dds == "no_doc_discovery_loop":
            lane = "stale"
        else:
            lane = "stale"
    else:
        lane = "exhausted"

    # Hotfix: F5 only with candidate evidence; never for exhausted-only / terminal no-evidence / f5_explicit timestamp-only refresh
    if lane == "exhausted" or f5_explicit:
        f5_eligible = False
        f5_ineligible_reason = "exhausted_or_f5_unresolved_explicit_no_repeat_f5_timestamp_only"
    elif not has_candidate_evidence:
        f5_eligible = False
        f5_ineligible_reason = "no_candidate_doc_hints_and_no_live_doc_targets_union_terminal_style"
    elif lane in ("unattempted", "stale") and has_candidate_evidence:
        f5_eligible = True
        f5_ineligible_reason = None
    else:
        f5_eligible = False
        f5_ineligible_reason = "lane_not_eligible_for_f5"

    if f5_explicit and lane != "exhausted":
        lane = "exhausted"
        f5_eligible = False
        f5_ineligible_reason = "f5_unresolved_explicit_forced_exhausted_lane"

    adjudication_hint = "b3_process_classifier_source_lineage"
    if not has_candidate_evidence and terminal:
        adjudication_hint = "b3_terminal_no_classifier_union"
    elif "research" in str(prior.get("next_route_hint", "")).lower() or "design" in str(gr.get("unresolved_reason", "")).lower():
        adjudication_hint = "b1_research_mode_candidate"

    out = {
        "record_kind": "doc_discovery_exhaustion_gate_row",
        "coverage_row_index": gr.get("coverage_row_index"),
        "obligation_id": gr.get("obligation_id"),
        "row_hash": gr.get("row_hash"),
        "gap_group_id": gid,
        "f4_classification": lane,
        "f5_eligible": f5_eligible,
        "f5_ineligible_reason": f5_ineligible_reason,
        "has_candidate_evidence": has_candidate_evidence,
        "candidate_doc_hints": hints,
        "live_doc_targets_union": targets,
        "prior_resolver_state": prior,
        "terminal_unresolved_doc_discovery": terminal,
        "adjudication_hint": adjudication_hint,
    }
    return out


def write_fanout(max_rows: int = 25) -> None:
    doc_rows = load_doc_discovery_rows()
    tc = json.loads(TC_PATH.read_text(encoding="utf-8"))["coverage_rows"]
    tasks: list[dict[str, Any]] = []
    for i, start in enumerate(range(0, len(doc_rows), max_rows), start=1):
        end = min(start + max_rows, len(doc_rows))
        chunk = doc_rows[start:end]
        tasks.append(
            {
                "subagent_task_id": f"f4-task-{i:03d}",
                "slice_start": start,
                "slice_end_exclusive": end,
                "rows_in_task": len(chunk),
                "max_rows_per_task_budget": max_rows,
                "coverage_row_index_first": chunk[0].get("coverage_row_index"),
                "coverage_row_index_last": chunk[-1].get("coverage_row_index"),
                "obligation_id_first": chunk[0].get("obligation_id"),
                "obligation_id_last": chunk[-1].get("obligation_id"),
            }
        )

    og = json.loads(OG_PATH.read_text(encoding="utf-8"))
    doc = {
        "schema_id": "pm.doc_discovery_exhaustion_gate.fanout_worklist.v3.2.2",
        "prompt_id": "F4",
        "prompt_version": "pm.f4.v3.2.2",
        "work_id": og.get("work_id"),
        "open_gaps_path": str(OG_PATH.relative_to(REPO_ROOT)),
        "transfer_coverage_path": str(TC_PATH.relative_to(REPO_ROOT)),
        "doc_discovery_rows_total": len(doc_rows),
        "tasks": tasks,
        "summary": {
            "fanout_tasks_total": len(tasks),
            "max_rows_per_task_budget": max_rows,
        },
    }
    FANOUT_PATH.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def run_task(task_id: str, invocation_id: str) -> None:
    fanout = json.loads(FANOUT_PATH.read_text(encoding="utf-8"))
    spec = next(t for t in fanout["tasks"] if t["subagent_task_id"] == task_id)
    doc_rows = load_doc_discovery_rows()
    tc = json.loads(TC_PATH.read_text(encoding="utf-8"))["coverage_rows"]
    chunk = doc_rows[spec["slice_start"] : spec["slice_end_exclusive"]]

    classified: list[dict[str, Any]] = []
    for gr in chunk:
        idx = int(gr["coverage_row_index"])
        classified.append(classify_row(gr, tc[idx]))

    out = {
        "schema_id": "pm.doc_discovery_exhaustion_gate_task_result.v3.2.2",
        "subagent_task_id": task_id,
        "subagent_invocation_id": invocation_id,
        "status": "complete",
        "classified_rows": classified,
    }
    (WORK_DIR / f"doc_discovery_exhaustion_gate.{task_id}.result.json").write_text(
        json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def sha256_file(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def decide_next_prompt(rows: list[dict[str, Any]]) -> dict[str, Any]:
    f5_n = sum(1 for r in rows if r.get("f5_eligible"))
    un = sum(1 for r in rows if r.get("f4_classification") == "unattempted")
    st = sum(1 for r in rows if r.get("f4_classification") == "stale")
    ex = sum(1 for r in rows if r.get("f4_classification") == "exhausted")

    if f5_n > 0:
        return {
            "next_prompt_id": "F5",
            "next_prompt_name": "Doc Discovery Resolver",
            "precedence_rule": "f5_only_when_unattempted_or_stale_with_candidate_evidence",
            "next_prompt_request": "Paste prompt F5 — Doc Discovery Resolver v3.2.2.",
            "f5_eligible_rows_total": f5_n,
            "counts": {"unattempted": un, "stale": st, "exhausted": ex},
        }

    if ex > 0 or (un == 0 and st == 0):
        b3_n = sum(1 for r in rows if r.get("adjudication_hint", "").startswith("b3"))
        if b3_n >= len(rows) // 2:
            return {
                "next_prompt_id": "B3",
                "next_prompt_name": "Issue / Process Adjudicator",
                "precedence_rule": "terminal_exhausted_or_no_f5_eligible_rows_process_classifier_family",
                "next_prompt_request": "Paste prompt B3 — Issue / Process Adjudicator v3.2.2.",
                "f5_eligible_rows_total": 0,
                "counts": {"unattempted": un, "stale": st, "exhausted": ex},
            }
        return {
            "next_prompt_id": "B1",
            "next_prompt_name": "Research Mode",
            "precedence_rule": "terminal_rows_research_design_collaboration_hint",
            "next_prompt_request": "Paste prompt B1 — Research Mode v3.2.2.",
            "f5_eligible_rows_total": 0,
            "counts": {"unattempted": un, "stale": st, "exhausted": ex},
        }

    return {
        "next_prompt_id": "manual_decision",
        "next_prompt_name": "manual_decision",
        "precedence_rule": "ambiguous_doc_discovery_state_requires_operator",
        "next_prompt_request": "manual_decision",
        "f5_eligible_rows_total": 0,
        "counts": {"unattempted": un, "stale": st, "exhausted": ex},
    }


def merge_report(timestamp_utc: str) -> dict[str, Any]:
    fanout = json.loads(FANOUT_PATH.read_text(encoding="utf-8"))
    task_order = [t["subagent_task_id"] for t in fanout["tasks"]]
    rows: list[dict[str, Any]] = []
    for tid in task_order:
        chunk = json.loads((WORK_DIR / f"doc_discovery_exhaustion_gate.{tid}.result.json").read_text(encoding="utf-8"))
        rows.extend(chunk.get("classified_rows") or [])

    rows.sort(key=lambda r: (int(r.get("coverage_row_index", -1)), str(r.get("obligation_id"))))
    expected = int(fanout["doc_discovery_rows_total"])
    if len(rows) != expected:
        raise SystemExit(f"classified row count mismatch: got {len(rows)} expected {expected}")

    un = sum(1 for r in rows if r.get("f4_classification") == "unattempted")
    st = sum(1 for r in rows if r.get("f4_classification") == "stale")
    ex = sum(1 for r in rows if r.get("f4_classification") == "exhausted")
    if un + st + ex != len(rows):
        raise SystemExit("classification bucket sum mismatch")

    f5_eligible_rows = [r for r in rows if r.get("f5_eligible")]
    f5_instructions = [
        {
            "coverage_row_index": r.get("coverage_row_index"),
            "obligation_id": r.get("obligation_id"),
            "row_hash": r.get("row_hash"),
            "f4_classification": r.get("f4_classification"),
            "instruction": "bounded_doc_discovery_resolver_attempt_with_preserved_candidate_evidence",
        }
        for r in f5_eligible_rows
    ]

    route = decide_next_prompt(rows)

    og_sha = hashlib.sha256(OG_PATH.read_bytes()).hexdigest()
    tc_sha = hashlib.sha256(TC_PATH.read_bytes()).hexdigest()

    report = {
        "schema_id": "pm.doc_discovery_exhaustion_report.v3.2.2",
        "prompt_id": "F4",
        "prompt_version": "pm.f4.v3.2.2",
        "timestamp_utc": timestamp_utc,
        "work_id": fanout.get("work_id"),
        "provenance": {
            "open_gaps_path": str(OG_PATH.relative_to(REPO_ROOT)),
            "open_gaps_sha256": og_sha,
            "transfer_coverage_path": str(TC_PATH.relative_to(REPO_ROOT)),
            "transfer_coverage_sha256": tc_sha,
        },
        "summary": {
            "doc_discovery_rows_total": len(rows),
            "classified_unattempted": un,
            "classified_stale": st,
            "classified_exhausted": ex,
            "f5_eligible_rows_total": len(f5_eligible_rows),
        },
        "doc_discovery_loop_breaker": {
            "f5_requested_only_with_candidate_evidence": True,
            "do_not_route_terminal_exhausted_to_f5": True,
            "notes": [
                "Hotfix v3.2.2: F4 is terminal when eligible resolver work is gone; exhausted rows do not receive F5 instructions.",
            ],
        },
        "f5_resolver_worklist_instructions": f5_instructions,
        "classified_rows": rows,
        "route_decision": {
            **route,
            "exactly_one_next_prompt": True,
        },
        "final_gate": {
            "passed": True,
            "every_doc_discovery_row_classified_unattempted_stale_or_exhausted": True,
        },
    }
    out_path = WORK_DIR / "doc_discovery_exhaustion_report.json"
    out_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return {"summary": report["summary"], "route": route}


def run_pipeline(wave_size: int = 8) -> None:
    write_fanout()
    fanout = json.loads(FANOUT_PATH.read_text(encoding="utf-8"))
    task_ids = [t["subagent_task_id"] for t in fanout["tasks"]]
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    worker = WORK_DIR / "f4_task_worker.py"
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
            res_path = WORK_DIR / f"doc_discovery_exhaustion_gate.{tid}.result.json"
            spec = next(x for x in fanout["tasks"] if x["subagent_task_id"] == tid)
            invocations.append(
                {
                    "subagent_invocation_id": inv,
                    "subagent_task_id": tid,
                    "subagent_type": "shell_bounded_executor",
                    "input_path": str(OG_PATH.relative_to(REPO_ROOT)),
                    "input_bounds": {
                        "slice_start": spec["slice_start"],
                        "slice_end_exclusive": spec["slice_end_exclusive"],
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
            "stage_id": "F4",
            "prompt_id": "F4",
            "prompt_version": "pm.f4.v3.2.2",
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
        wave_path = WORK_DIR / f"doc_discovery_exhaustion_gate.wave-{w_i:03d}.json"
        wave_path.write_text(json.dumps(wave_doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        wave_paths.append(str(wave_path.relative_to(REPO_ROOT)))

    merge_meta = merge_report(ts)
    meta = {
        "timestamp_utc": ts,
        "wave_paths": wave_paths,
        "task_to_invocation_map": task_to_invocation,
        "invocation_to_task_map": invocation_to_task,
        "merge": merge_meta,
    }
    (WORK_DIR / "doc_discovery_exhaustion_gate.pipeline_meta.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--run-pipeline", action="store_true")
    ap.add_argument("--write-fanout", action="store_true")
    ap.add_argument("--merge-only", action="store_true")
    ap.add_argument("--task-id", default="")
    ap.add_argument("--invocation-id", default="")
    ap.add_argument("--timestamp-utc", default="20260511T230000Z")
    args = ap.parse_args()
    if args.run_pipeline:
        run_pipeline()
        return
    if args.write_fanout:
        write_fanout()
        return
    if args.merge_only:
        merge_report(args.timestamp_utc)
        return
    if not args.task_id or not args.invocation_id:
        ap.error("--task-id and --invocation-id required unless --run-pipeline/--write-fanout/--merge-only")
    run_task(args.task_id, args.invocation_id)


if __name__ == "__main__":
    main()
