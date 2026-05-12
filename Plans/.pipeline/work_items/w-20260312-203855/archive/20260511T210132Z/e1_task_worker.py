#!/usr/bin/env python3
"""
E1 bounded task worker: deterministic coverage slice from canonical_obligations.json.
One invocation processes exactly one fan-out task id (<=25 obligations per task).
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path
from typing import Any

WORK_DIR = Path(__file__).resolve().parent
# work_items/<id>/ -> parents[3] = repo root (Puppet Master)
REPO_ROOT = WORK_DIR.parents[3]
CANONICAL_PATH = WORK_DIR / "canonical_obligations.json"
FANOUT_PATH = WORK_DIR / "coverage_worklist_builder.fanout_worklist.json"
LINE_COUNTS_PATH = WORK_DIR / "coverage_worklist_builder.doc_line_counts.json"
RESULT_GLOB = "coverage_worklist_builder.task-*.result.json"

EXCLUDED_CATEGORIES = frozenset({"process_artifact_ref", "prompt_defect"})


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


def primary_shard(o: dict[str, Any]) -> str:
    s = o.get("source_shard_ids") or []
    if not s:
        return "no-shard"
    return sorted(s)[0]


def load_line_counts() -> dict[str, int]:
    if not LINE_COUNTS_PATH.is_file():
        return {}
    with open(LINE_COUNTS_PATH, encoding="utf-8") as f:
        return json.load(f)


def build_windows_for_path(path: str, total_lines: int, max_lines: int = 400) -> list[dict[str, Any]]:
    if total_lines <= 0:
        return []
    windows: list[dict[str, Any]] = []
    idx = 0
    start = 1
    while start <= total_lines:
        end = min(start + max_lines - 1, total_lines)
        windows.append(
            {
                "path": path,
                "line_start": start,
                "line_end": end,
                "window_index": idx,
                "total_lines_in_doc": total_lines,
                "max_lines_per_window": max_lines,
            }
        )
        idx += 1
        start = end + 1
    return windows


def classify_obligation(o: dict[str, Any], line_counts: dict[str, int]) -> dict[str, Any]:
    """Return dict with resolution bucket and paths."""
    cat = o.get("obligation_category") or ""
    if cat in EXCLUDED_CATEGORIES:
        return {"kind": "excluded_category", "category": cat}

    raw_paths = o.get("exact_paths_mentioned") or []
    eligible = [p for p in raw_paths if is_eligible_live_path(p)]
    existing = [p for p in eligible if (REPO_ROOT / p).is_file()]
    missing = [p for p in eligible if p not in existing]

    if eligible and not existing and missing:
        return {
            "kind": "doc_discovery",
            "candidate_paths": eligible,
            "missing_paths": missing,
        }

    if len(existing) == 1:
        return {"kind": "concrete_single", "paths": existing}

    if len(existing) > 1:
        return {"kind": "concrete_multi", "paths": sorted(set(existing))}

    # No eligible live paths — preserve hints from raw paths / notes
    if raw_paths:
        return {
            "kind": "doc_discovery",
            "candidate_paths": [p for p in raw_paths if isinstance(p, str)],
            "missing_paths": [],
        }

    notes = (o.get("notes") or "").strip()
    if notes:
        return {"kind": "doc_hint_only", "paths": []}

    return {"kind": "unresolved_no_live_target", "paths": []}


def run_task(task_id: str, invocation_id: str) -> None:
    with open(FANOUT_PATH, encoding="utf-8") as f:
        fanout = json.load(f)
    tasks = {t["subagent_task_id"]: t for t in fanout["tasks"]}
    if task_id not in tasks:
        raise SystemExit(f"Unknown task id {task_id}")
    spec = tasks[task_id]
    want_ids = spec["obligation_ids"]

    with open(CANONICAL_PATH, encoding="utf-8") as f:
        canon = json.load(f)
    by_id = {o["obligation_id"]: o for o in canon["obligations"]}

    line_counts = load_line_counts()

    excluded: list[dict[str, Any]] = []
    assignments: list[tuple[dict[str, Any], dict[str, Any]]] = []

    for oid in want_ids:
        o = by_id.get(oid)
        if o is None:
            excluded.append(
                {
                    "obligation_id": oid,
                    "exclusion_reason": "missing_obligation_record_in_canonical_json",
                    "source_shard_id": "unknown",
                }
            )
            continue
        cl = classify_obligation(o, line_counts)
        if cl["kind"] == "excluded_category":
            excluded.append(
                {
                    "obligation_id": oid,
                    "exclusion_reason": f"obligation_category_{cl['category']}_no_section_e_live_doc_coverage_sweep",
                    "obligation_category": cl["category"],
                    "source_shard_id": primary_shard(o),
                }
            )
            continue
        assignments.append((o, cl))

    # Group assignments into coverage_tasks by (shard, kind, paths_key)
    groups: dict[tuple[str, str, str], list[str]] = {}
    hints_preserved: dict[tuple[str, str, str], list[dict[str, Any]]] = {}

    for o, cl in assignments:
        oid = o["obligation_id"]
        ps = primary_shard(o)
        if cl["kind"] == "doc_hint_only":
            key = (ps, "doc_hint_only", "")
            groups.setdefault(key, []).append(oid)
            hints_preserved.setdefault(key, []).append(
                {
                    "obligation_id": oid,
                    "doc_hints": [
                        {
                            "hint_excerpt": (o.get("obligation_text") or "")[:500],
                            "truncated": len(o.get("obligation_text") or "") > 500,
                        }
                    ],
                }
            )
            continue

        if cl["kind"] == "doc_discovery":
            paths_key = "|".join(sorted(set(cl.get("candidate_paths") or [])))
            key = (ps, "doc_discovery", paths_key)
            groups.setdefault(key, []).append(oid)
            continue

        if cl["kind"] == "unresolved_no_live_target":
            key = (ps, "unresolved_no_live_target", "")
            groups.setdefault(key, []).append(oid)
            continue

        if cl["kind"] in ("concrete_single", "concrete_multi"):
            paths_key = "|".join(cl["paths"])
            key = (ps, "concrete_plans_targets", paths_key)
            groups.setdefault(key, []).append(oid)
            continue

        raise RuntimeError(f"Unhandled classification {cl}")

    coverage_tasks: list[dict[str, Any]] = []
    seq = int(task_id.split("-")[-1])
    gidx = 0
    for (ps, kind, paths_key), oids in sorted(groups.items()):
        gidx += 1
        ctid = f"cov-e1-{task_id}-g{gidx:03d}"
        paths = [p for p in paths_key.split("|") if p] if paths_key else []

        task: dict[str, Any] = {
            "coverage_task_id": ctid,
            "doc_resolution_status": kind,
            "source_shard_id": ps,
            "grouping_key": f"{ps}|{kind}|{paths_key}",
            "obligation_ids": sorted(set(oids)),
            "obligation_record_count": len(set(oids)),
            "max_obligations_per_task_budget": 25,
            "live_doc_targets_union": sorted(set(paths)) if paths else [],
            "live_doc_windows": [],
            "preserved_candidate_hints": hints_preserved.get((ps, "doc_hint_only", ""), []),
            "cross_target_notes": [],
        }

        if kind == "concrete_plans_targets" and paths:
            windows: list[dict[str, Any]] = []
            for p in paths:
                n = line_counts.get(p)
                if n is None:
                    n = 0
                    if (REPO_ROOT / p).is_file():
                        try:
                            with open(REPO_ROOT / p, "rb") as bf:
                                n = bf.read().count(b"\n") + 1
                        except OSError:
                            n = 0
                windows.extend(build_windows_for_path(p, n))
            task["live_doc_windows"] = windows

        coverage_tasks.append(task)

    out = {
        "schema_id": "pm.coverage_worklist_builder_task_result.v3.2.2",
        "subagent_task_id": task_id,
        "subagent_invocation_id": invocation_id,
        "status": "complete",
        "excluded_obligations": excluded,
        "coverage_tasks": coverage_tasks,
    }

    out_path = WORK_DIR / f"coverage_worklist_builder.{task_id}.result.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
        f.write("\n")


def merge_all() -> None:
    """Merge all task results into coverage_worklist.json + print accounting."""
    results = sorted(WORK_DIR.glob("coverage_worklist_builder.e1-task-*.result.json"))
    if not results:
        raise SystemExit("No task result files to merge")

    raw = CANONICAL_PATH.read_bytes()
    sha_ctx = __import__("hashlib").sha256(raw).hexdigest()
    canon = json.loads(raw.decode("utf-8"))
    total_in = len(canon["obligations"])

    excluded_all: list[dict[str, Any]] = []
    coverage_tasks: list[dict[str, Any]] = []
    for rp in results:
        with open(rp, encoding="utf-8") as f:
            chunk = json.load(f)
        excluded_all.extend(chunk.get("excluded_obligations") or [])
        coverage_tasks.extend(chunk.get("coverage_tasks") or [])

    assigned: set[str] = set()
    for t in coverage_tasks:
        for oid in t.get("obligation_ids") or []:
            assigned.add(oid)
    excluded_ids = {e["obligation_id"] for e in excluded_all}
    overlap = assigned & excluded_ids

    # Dedupe excluded list by obligation_id (last wins)
    ex_map: dict[str, dict[str, Any]] = {}
    for e in excluded_all:
        ex_map[e["obligation_id"]] = e
    excluded_unique = list(ex_map.values())

    assigned_only = assigned - excluded_ids
    accounted = len(assigned_only) + len(excluded_ids)
    final_gate_pass = accounted == total_in and not overlap

    worklist = {
        "schema_id": "pm.coverage_worklist.v3.2.2",
        "prompt_id": "E1",
        "prompt_version": "pm.e1.v3.2.2",
        "timestamp_utc": "20260511T200000Z",
        "work_id": "w-20260312-203855",
        "source": {
            "canonical_obligations_path": "Plans/.pipeline/work_items/w-20260312-203855/canonical_obligations.json",
            "canonical_obligations_sha256": sha_ctx,
            "obligation_count": total_in,
        },
        "budgets": {
            "max_obligations_per_coverage_task": 25,
            "max_lines_per_live_doc_window": 400,
        },
        "summary": {
            "coverage_task_total": len(coverage_tasks),
            "excluded_obligation_total": len(excluded_unique),
            "assigned_obligation_total": len(assigned_only),
            "live_doc_windows_total": sum(len(t.get("live_doc_windows") or []) for t in coverage_tasks),
            "distinct_live_doc_paths_referenced": len(
                {p for t in coverage_tasks for p in (t.get("live_doc_targets_union") or [])}
            ),
        },
        "final_gate": {
            "passed": final_gate_pass,
            "every_obligation_assigned_or_excluded": final_gate_pass,
            "accounting": {
                "input_obligations": total_in,
                "assigned": len(assigned_only),
                "excluded": len(excluded_unique),
                "sum": len(assigned_only) + len(excluded_unique),
                "overlap_assigned_and_excluded": len(overlap),
            },
        },
        "excluded_obligations": sorted(excluded_unique, key=lambda x: x["obligation_id"]),
        "coverage_tasks": coverage_tasks,
    }

    out_path = WORK_DIR / "coverage_worklist.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(worklist, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(
        json.dumps(
            {
                "merge_ok": final_gate_pass,
                "input_obligations": total_in,
                "assigned": len(assigned_only),
                "excluded": len(excluded_unique),
                "overlap": len(overlap),
            },
            indent=2,
        )
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--task-id", help="Fan-out task id, e.g. e1-task-001")
    ap.add_argument("--invocation-id", default="")
    ap.add_argument("--merge-only", action="store_true")
    args = ap.parse_args()
    if args.merge_only:
        merge_all()
        return
    if not args.task_id:
        ap.error("--task-id required unless --merge-only")
    if not args.invocation_id:
        ap.error("--invocation-id required for --task-id runs")
    run_task(args.task_id, args.invocation_id)


if __name__ == "__main__":
    main()
