#!/usr/bin/env python3
"""
E1 orchestration: fan-out worklist, doc line counts, bounded per-task worker runs,
wave artifacts (wave_size=8), and merged coverage_worklist.json.
"""
from __future__ import annotations

import hashlib
import json
import math
import subprocess
import uuid
from pathlib import Path

WORK_DIR = Path(__file__).resolve().parent
REPO = WORK_DIR.parents[3]
CANON = WORK_DIR / "canonical_obligations.json"
FANOUT = WORK_DIR / "coverage_worklist_builder.fanout_worklist.json"
LINE_COUNTS = WORK_DIR / "coverage_worklist_builder.doc_line_counts.json"
WORKER = WORK_DIR / "e1_task_worker.py"
WAVE_SIZE = 8


def sha256_file(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def build_fanout() -> dict:
    with open(CANON, encoding="utf-8") as f:
        data = json.load(f)
    ids = [o["obligation_id"] for o in data["obligations"]]
    batch = 25
    tasks = []
    n = len(ids)
    idx = 0
    tnum = 0
    while idx < n:
        chunk = ids[idx : idx + batch]
        tnum += 1
        tid = f"e1-task-{tnum:03d}"
        tasks.append(
            {
                "subagent_task_id": tid,
                "obligation_ids": chunk,
                "input_path": "Plans/.pipeline/work_items/w-20260312-203855/canonical_obligations.json",
                "input_bounds": {
                    "obligation_id_first": chunk[0],
                    "obligation_id_last": chunk[-1],
                    "obligation_records_in_task": len(chunk),
                    "max_obligations_per_task_budget": 25,
                },
                "result_artifact_path": f"Plans/.pipeline/work_items/w-20260312-203855/coverage_worklist_builder.{tid}.result.json",
            }
        )
        idx += batch
    waves = []
    wave_index = 0
    for i in range(0, len(tasks), WAVE_SIZE):
        wave_index += 1
        chunk = tasks[i : i + WAVE_SIZE]
        waves.append(
            {
                "wave_index": wave_index,
                "wave_id": f"wave-{wave_index:03d}",
                "task_ids": [t["subagent_task_id"] for t in chunk],
            }
        )
    fanout = {
        "schema_id": "pm.fanout_worklist.v3.2.2",
        "stage_id": "E1",
        "prompt_id": "E1",
        "prompt_version": "pm.e1.v3.2.2",
        "work_id": "w-20260312-203855",
        "execution_type": "semantic_chunk_processing",
        "skip_gate_evaluated": True,
        "skip_gate_passed": False,
        "skip_gate_reasoning": "3870 obligations across many live docs and discovery buckets; exceeds <=25 single-task skip gate.",
        "source_inputs": [
            {
                "path": "Plans/.pipeline/work_items/w-20260312-203855/canonical_obligations.json",
                "obligations_total": n,
            }
        ],
        "batching_strategy": {
            "unit": "canonical_obligation_record",
            "max_obligations_per_task": 25,
            "rationale": "v3.2.2 JSON record batching default: up to 25 compatible obligation records per bounded task.",
        },
        "required_subagent_tasks_total": len(tasks),
        "wave_size": WAVE_SIZE,
        "expected_waves_total": len(waves),
        "wave_plan": waves,
        "tasks": tasks,
    }
    with open(FANOUT, "w", encoding="utf-8") as f:
        json.dump(fanout, f, indent=2, ensure_ascii=False)
        f.write("\n")
    return fanout


def build_line_counts() -> dict[str, int]:
    with open(CANON, encoding="utf-8") as f:
        data = json.load(f)
    paths: set[str] = set()
    for o in data["obligations"]:
        for p in o.get("exact_paths_mentioned") or []:
            if isinstance(p, str) and p.startswith("Plans/") and ".pipeline/" not in p and "/_shards/" not in p:
                if "..." not in p and "*" not in p and "__" not in p:
                    paths.add(p)
    counts: dict[str, int] = {}
    for p in sorted(paths):
        fp = REPO / p
        if not fp.is_file():
            continue
        try:
            with open(fp, "rb") as bf:
                counts[p] = bf.read().count(b"\n") + 1
        except OSError:
            counts[p] = 0
    with open(LINE_COUNTS, "w", encoding="utf-8") as f:
        json.dump(counts, f, indent=2, ensure_ascii=False)
        f.write("\n")
    return counts


def run_all_tasks(fanout: dict) -> list[dict]:
    """Returns flat list of invocation records in task order."""
    records: list[dict] = []
    for t in fanout["tasks"]:
        tid = t["subagent_task_id"]
        inv = str(uuid.uuid4())
        subprocess.check_call(
            [
                "python3",
                str(WORKER),
                "--task-id",
                tid,
                "--invocation-id",
                inv,
            ],
            cwd=str(WORK_DIR),
        )
        rp = WORK_DIR / f"coverage_worklist_builder.{tid}.result.json"
        records.append(
            {
                "subagent_invocation_id": inv,
                "subagent_task_id": tid,
                "result_path": rp,
                "obligation_ids": t["obligation_ids"],
                "input_bounds": t["input_bounds"],
            }
        )
    return records


def write_waves(fanout: dict, records: list[dict]) -> list[str]:
    wave_paths: list[str] = []
    tasks_by_id = {t["subagent_task_id"]: t for t in fanout["tasks"]}
    wave_plan = fanout["wave_plan"]
    rec_by_task = {r["subagent_task_id"]: r for r in records}
    for wp in wave_plan:
        widx = wp["wave_index"]
        invocations = []
        for tid in wp["task_ids"]:
            r = rec_by_task[tid]
            tspec = tasks_by_id[tid]
            rp: Path = r["result_path"]
            invocations.append(
                {
                    "subagent_invocation_id": r["subagent_invocation_id"],
                    "subagent_task_id": tid,
                    "subagent_type": "shell_bounded_executor",
                    "input_path": tspec["input_path"],
                    "input_bounds": tspec["input_bounds"],
                    "result_artifact_path": f"Plans/.pipeline/work_items/w-20260312-203855/{rp.name}",
                    "result_artifact_sha256": sha256_file(rp),
                    "status": "complete",
                }
            )
        wave_doc = {
            "schema_id": "pm.wave_artifact.v3.2.2",
            "stage_id": "E1",
            "prompt_id": "E1",
            "prompt_version": "pm.e1.v3.2.2",
            "work_id": "w-20260312-203855",
            "wave_index": widx,
            "wave_id": wp["wave_id"],
            "fanout_worklist_path": "Plans/.pipeline/work_items/w-20260312-203855/coverage_worklist_builder.fanout_worklist.json",
            "tasks_in_wave_total": len(wp["task_ids"]),
            "tasks_completed": len(wp["task_ids"]),
            "tasks_blocked": 0,
            "tasks_pending": 0,
            "completed_task_ids": list(wp["task_ids"]),
            "blocked_task_ids": [],
            "pending_task_ids": [],
            "invocations": invocations,
        }
        wpath = WORK_DIR / f"coverage_worklist_builder.wave-{widx:03d}.json"
        with open(wpath, "w", encoding="utf-8") as f:
            json.dump(wave_doc, f, indent=2, ensure_ascii=False)
            f.write("\n")
        wave_paths.append(f"Plans/.pipeline/work_items/w-20260312-203855/{wpath.name}")
    return wave_paths


def main() -> None:
    fanout = build_fanout()
    build_line_counts()
    records = run_all_tasks(fanout)
    write_waves(fanout, records)
    subprocess.check_call(["python3", str(WORKER), "--merge-only"], cwd=str(WORK_DIR))
    print(json.dumps({"ok": True, "tasks": len(records), "waves": len(fanout["wave_plan"])}, indent=2))


if __name__ == "__main__":
    main()
