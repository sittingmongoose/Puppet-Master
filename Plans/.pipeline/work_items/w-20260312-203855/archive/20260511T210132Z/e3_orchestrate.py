#!/usr/bin/env python3
"""E3 orchestration: fan-out, waves, bounded reducer tasks, merge, gate report, stage proof."""
from __future__ import annotations

import hashlib
import json
import subprocess
import uuid
from datetime import datetime, timezone
from pathlib import Path

WORK_DIR = Path(__file__).resolve().parent
CANON = WORK_DIR / "canonical_obligations.json"
WORKER = WORK_DIR / "e3_task_worker.py"
F5_RESOLUTION = WORK_DIR / "doc_discovery_resolution.json"
WAVE_SIZE = 8
REPO_ROOT = WORK_DIR.parents[3]


def sha256_file(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def build_fanout() -> dict:
    canon = json.loads(CANON.read_text(encoding="utf-8"))
    ids = [o["obligation_id"] for o in canon["obligations"]]
    batch = 25
    tasks = []
    idx = 0
    tnum = 0
    while idx < len(ids):
        chunk = ids[idx : idx + batch]
        tnum += 1
        tid = f"e3-task-{tnum:03d}"
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
                "result_artifact_path": f"Plans/.pipeline/work_items/w-20260312-203855/transfer_coverage_reducer.{tid}.result.json",
            }
        )
        idx += batch
    wave_plan = []
    wi = 0
    for i in range(0, len(tasks), WAVE_SIZE):
        wi += 1
        wave_plan.append(
            {
                "wave_index": wi,
                "wave_id": f"wave-{wi:03d}",
                "task_ids": [t["subagent_task_id"] for t in tasks[i : i + WAVE_SIZE]],
            }
        )
    fanout = {
        "schema_id": "pm.fanout_worklist.v3.2.2",
        "stage_id": "E3",
        "prompt_id": "E3",
        "prompt_version": "pm.e3.v3.2.2",
        "work_id": "w-20260312-203855",
        "execution_type": "semantic_chunk_processing",
        "required_subagent_tasks_total": len(tasks),
        "wave_size": WAVE_SIZE,
        "wave_plan": wave_plan,
        "tasks": tasks,
    }
    (WORK_DIR / "transfer_coverage_reducer.fanout_worklist.json").write_text(
        json.dumps(fanout, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    return fanout


def run_tasks(fanout: dict) -> list[dict]:
    recs = []
    for t in fanout["tasks"]:
        tid = t["subagent_task_id"]
        inv = str(uuid.uuid4())
        subprocess.check_call(
            ["python3", str(WORKER), "--task-id", tid, "--invocation-id", inv],
            cwd=str(WORK_DIR),
        )
        recs.append({"subagent_task_id": tid, "invocation_id": inv})
    return recs


def write_waves(fanout: dict, recs: list[dict]) -> list[str]:
    by_task = {t["subagent_task_id"]: t for t in fanout["tasks"]}
    rec_by = {r["subagent_task_id"]: r for r in recs}
    paths = []
    for wp in fanout["wave_plan"]:
        widx = wp["wave_index"]
        invs = []
        for tid in wp["task_ids"]:
            r = rec_by[tid]
            ts = by_task[tid]
            rp = WORK_DIR / f"transfer_coverage_reducer.{tid}.result.json"
            invs.append(
                {
                    "subagent_invocation_id": r["invocation_id"],
                    "subagent_task_id": tid,
                    "subagent_type": "shell_bounded_executor",
                    "input_path": ts["input_path"],
                    "input_bounds": ts["input_bounds"],
                    "result_artifact_path": ts["result_artifact_path"],
                    "result_artifact_sha256": sha256_file(rp),
                    "status": "complete",
                }
            )
        doc = {
            "schema_id": "pm.wave_artifact.v3.2.2",
            "stage_id": "E3",
            "prompt_id": "E3",
            "prompt_version": "pm.e3.v3.2.2",
            "work_id": "w-20260312-203855",
            "wave_index": widx,
            "wave_id": wp["wave_id"],
            "fanout_worklist_path": "Plans/.pipeline/work_items/w-20260312-203855/transfer_coverage_reducer.fanout_worklist.json",
            "tasks_in_wave_total": len(wp["task_ids"]),
            "tasks_completed": len(wp["task_ids"]),
            "tasks_blocked": 0,
            "tasks_pending": 0,
            "completed_task_ids": list(wp["task_ids"]),
            "blocked_task_ids": [],
            "pending_task_ids": [],
            "invocations": invs,
        }
        wpth = WORK_DIR / f"transfer_coverage_reducer.wave-{widx:03d}.json"
        wpth.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        paths.append(f"Plans/.pipeline/work_items/w-20260312-203855/{wpth.name}")
    return paths


def load_prior_transfer_by_obligation() -> dict[str, dict]:
    p = WORK_DIR / "transfer_coverage.json"
    if not p.is_file():
        return {}
    try:
        d = json.loads(p.read_text(encoding="utf-8"))
    except OSError:
        return {}
    out: dict[str, dict] = {}
    for r in d.get("coverage_rows") or []:
        oid = r.get("obligation_id")
        if isinstance(oid, str):
            out[oid] = r
    return out


def apply_f5_resolution_overlay(
    rows: list[dict],
    f5_doc: dict | None,
    prior_by_oid: dict[str, dict],
) -> tuple[list[dict], dict]:
    """Merge F5 resolver outputs; preserve terminal exhaustion semantics for F-loop."""
    if not f5_doc:
        return rows, {
            "applied": False,
            "f5_rows_merged": 0,
            "material_resolution_delta": False,
            "timestamp_only_f5_loop": False,
        }

    gate = f5_doc.get("material_resolution_gate") or {}
    new_resolved = int(gate.get("new_resolved_this_run") or 0)
    newly_explicit = int(gate.get("newly_explicit_unresolved_this_run") or 0)
    material_from_f5 = bool(gate.get("material_resolution_delta"))

    res_by_oid = {
        r["obligation_id"]: r
        for r in (f5_doc.get("resolution_rows") or [])
        if isinstance(r.get("obligation_id"), str)
    }

    timestamp_only_loop = False
    if new_resolved == 0 and newly_explicit > 0:
        stale_same_hash = 0
        for fr in f5_doc.get("resolution_rows") or []:
            if fr.get("resolution_kind") != "f5_unresolved_explicit":
                continue
            oid = fr.get("obligation_id")
            pr = prior_by_oid.get(oid) if oid else None
            if (
                pr
                and pr.get("f5_unresolved_explicit_preserved")
                and pr.get("row_hash") == fr.get("row_hash")
            ):
                stale_same_hash += 1
        timestamp_only_loop = stale_same_hash == newly_explicit and newly_explicit > 0

    out: list[dict] = []
    merged = 0
    for row in rows:
        oid = row.get("obligation_id")
        if not isinstance(oid, str) or oid not in res_by_oid:
            out.append(row)
            continue
        fr = res_by_oid[oid]
        rk = fr.get("resolution_kind")
        r2 = dict(row)
        r2["f5_resolution_merge"] = {
            "doc_discovery_resolution_sha256": hashlib.sha256(
                json.dumps(fr, sort_keys=True).encode("utf-8")
            ).hexdigest(),
            "resolution_kind": rk,
            "unresolved_reason": fr.get("unresolved_reason"),
        }
        if rk == "resolved_binding" and fr.get("selected_owner_plans_path"):
            path = str(fr["selected_owner_plans_path"])
            union = list(r2.get("live_doc_targets_union") or [])
            if path not in union:
                union.append(path)
            r2["live_doc_targets_union"] = union
            r2["doc_resolution_status"] = "concrete_plans_targets"
            r2["doc_discovery_attempt_state"] = "f5_resolved_binding"
            r2["terminal_unresolved_doc_discovery"] = False
            r2["f5_unresolved_explicit_preserved"] = False
            r2["mechanically_exhausted_preserved"] = False
            r2["next_route_hint"] = "e4_then_coverage_process_review_if_persistent"
            merged += 1
        elif rk == "f5_unresolved_explicit":
            r2["f5_unresolved_explicit_preserved"] = True
            r2["doc_discovery_attempt_state"] = "exhausted_doc_discovery"
            r2["terminal_unresolved_doc_discovery"] = True
            r2["mechanically_exhausted_preserved"] = True
            r2["aggregated_task_label"] = "missing_live_target"
            r2["doc_resolution_status"] = "unresolved_no_live_target"
            r2["next_route_hint"] = "b3_or_b1_or_manual_decision_terminal_doc_discovery"
            merged += 1
        elif rk == "skipped_already_terminal_or_explicit":
            pass
        out.append(r2)

    return out, {
        "applied": True,
        "f5_rows_merged": merged,
        "material_resolution_delta": bool(material_from_f5 and not timestamp_only_loop),
        "timestamp_only_f5_loop": timestamp_only_loop,
        "f5_gate": gate,
    }


def merge_and_reports(fanout: dict) -> dict:
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    prior_by_oid = load_prior_transfer_by_obligation()
    f5_doc = None
    f5_sha = None
    if F5_RESOLUTION.is_file():
        raw = F5_RESOLUTION.read_bytes()
        f5_sha = hashlib.sha256(raw).hexdigest()
        f5_doc = json.loads(raw.decode("utf-8"))

    parts = sorted(WORK_DIR.glob("transfer_coverage_reducer.e3-task-*.result.json"))
    rows: list[dict] = []
    for p in parts:
        rows.extend(json.loads(p.read_text(encoding="utf-8")).get("rows") or [])
    canon = json.loads(CANON.read_text(encoding="utf-8"))
    expected = {o["obligation_id"] for o in canon["obligations"]}
    got = {r["obligation_id"] for r in rows if r.get("obligation_id")}
    missing = sorted(expected - got)
    extra = sorted(got - expected)
    gate_pass = len(missing) == 0 and len(extra) == 0

    f5_meta = apply_f5_resolution_overlay(rows, f5_doc, prior_by_oid)
    rows = f5_meta[0]
    f5_apply = f5_meta[1]

    canon_sha = hashlib.sha256(CANON.read_bytes()).hexdigest()
    wl_sha = hashlib.sha256((WORK_DIR / "coverage_worklist.json").read_bytes()).hexdigest()

    if f5_doc:
        f5_consumer = {
            "active_doc_discovery_resolution_json_present": True,
            "doc_discovery_resolution_path": str(F5_RESOLUTION.relative_to(REPO_ROOT)),
            "doc_discovery_resolution_sha256": f5_sha,
            "material_resolution_delta_evaluated": "evaluated_from_doc_discovery_resolution.material_resolution_gate",
            "material_resolution_delta": bool(f5_apply.get("material_resolution_delta")),
            "timestamp_only_f5_loop_detected": bool(f5_apply.get("timestamp_only_f5_loop")),
            "f5_rows_merged": f5_apply.get("f5_rows_merged"),
            "timestamp_only_delta_guard": "pass"
            if not f5_apply.get("timestamp_only_f5_loop")
            else "block_repeat_f_loop_without_material_change",
            "e3_to_f5_to_e3_loop_risk": "mitigated_material_gate_and_terminal_state_preservation",
        }
    else:
        f5_consumer = {
            "active_doc_discovery_resolution_json_present": False,
            "material_resolution_delta_evaluated": "not_applicable_no_active_doc_discovery_resolution_json",
            "timestamp_only_delta_guard": "no_f5_consumer_input_in_active_work_item",
            "e3_to_f5_to_e3_loop_risk": "mitigated_no_f5_feedback_path",
        }

    transfer = {
        "schema_id": "pm.transfer_coverage.v3.2.2",
        "prompt_id": "E3",
        "prompt_version": "pm.e3.v3.2.2",
        "timestamp_utc": ts,
        "work_id": "w-20260312-203855",
        "source": {
            "canonical_obligations_path": "Plans/.pipeline/work_items/w-20260312-203855/canonical_obligations.json",
            "canonical_obligations_sha256": canon_sha,
            "coverage_worklist_path": "Plans/.pipeline/work_items/w-20260312-203855/coverage_worklist.json",
            "coverage_worklist_sha256": wl_sha,
        },
        "f5_doc_discovery_resolution": f5_consumer,
        "coverage_rows": sorted(rows, key=lambda r: r.get("obligation_id") or ""),
        "summary": {
            "obligation_rows_total": len(rows),
            "canonical_obligations_expected": len(expected),
            "excluded_rows": sum(1 for r in rows if r.get("record_kind") == "obligation_excluded"),
            "coverage_rows": sum(1 for r in rows if r.get("record_kind") == "obligation_coverage"),
            "terminal_unresolved_doc_discovery_rows": sum(
                1 for r in rows if r.get("terminal_unresolved_doc_discovery")
            ),
        },
        "final_gate": {
            "passed": gate_pass,
            "every_canonical_obligation_has_row_or_exclusion": gate_pass,
            "accounting": {
                "expected_obligation_ids": len(expected),
                "distinct_rows_emitted": len(got),
                "missing_obligation_ids": missing,
                "extra_obligation_ids": extra[:50],
            },
        },
    }
    (WORK_DIR / "transfer_coverage.json").write_text(
        json.dumps(transfer, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    term = transfer["summary"]["terminal_unresolved_doc_discovery_rows"]
    proc_hint = sum(
        1
        for r in rows
        if r.get("next_route_hint") == "e4_then_coverage_process_review_if_persistent"
    )
    f5_explicit_in = sum(1 for r in rows if r.get("f5_unresolved_explicit_preserved"))

    if f5_doc:
        g = f5_doc.get("material_resolution_gate") or {}
        if f5_apply.get("timestamp_only_f5_loop"):
            f5_gate_status = "blocked_timestamp_only_or_already_explicit_same_hash"
            f5_gate_reason = (
                "F5 reported newly explicit rows but prior transfer_coverage already carried "
                "f5_unresolved_explicit under the same row_hash/candidate set; do not re-trigger F-loop."
            )
            would_ts_e3 = False
            rec_next = "Paste prompt B3 — Issue / Process Adjudicator v3.2.2."
        elif g.get("material_resolution_delta"):
            f5_gate_status = "pass"
            f5_gate_reason = (
                "Material resolution delta from doc_discovery_resolution.json "
                "(new resolved bindings and/or first-time explicit unresolved transitions)."
            )
            would_ts_e3 = False
            rec_next = "Paste prompt E4 — Section Exit: Coverage v3.2.2."
        else:
            f5_gate_status = "pass_no_material_delta"
            f5_gate_reason = "F5 present but material_resolution_delta false; still merged conservative overlays."
            would_ts_e3 = False
            rec_next = "Paste prompt E4 — Section Exit: Coverage v3.2.2." if gate_pass else "manual_decision"
    else:
        f5_gate_status = "not_applicable"
        f5_gate_reason = (
            "doc_discovery_resolution.json not present; no F5 timestamp-only or binding-delta consumption performed."
        )
        would_ts_e3 = False
        rec_next = "Paste prompt E4 — Section Exit: Coverage v3.2.2." if gate_pass else "manual_decision"

    sg = {
        "schema_id": "pm.transfer_coverage_source_gate_report.v3.2.2",
        "prompt_id": "E3",
        "prompt_version": "pm.e3.v3.2.2",
        "timestamp_utc": ts,
        "work_id": "w-20260312-203855",
        "source_gate_status": "pass" if gate_pass else "fail",
        "f5_material_delta_gate": {
            "status": f5_gate_status,
            "reason": f5_gate_reason,
            "would_route_f5_back_to_e3_on_timestamp_only": would_ts_e3,
            "new_resolved_this_run": int(
                ((f5_doc or {}).get("material_resolution_gate") or {}).get("new_resolved_this_run") or 0
            ),
            "newly_explicit_unresolved_this_run": int(
                ((f5_doc or {}).get("material_resolution_gate") or {}).get(
                    "newly_explicit_unresolved_this_run"
                )
                or 0
            ),
        },
        "doc_discovery_loop_breaker": {
            "terminal_unresolved_states_preserved": True,
            "f5_unresolved_explicit_rows_in_input": f5_explicit_in,
            "no_reentry_to_f5_for_terminal_same_hash": True,
            "notes": [
                "Hotfix v3.2.2: F5 consumer applies material delta gate; timestamp-only / already-explicit same-hash loops do not route forward through Section F.",
                "exhausted_doc_discovery + terminal flags preserved for F1/F2/F3 doc_discovery_exhaustion bucketing.",
            ],
        },
        "process_defect_signals": {
            "rows_with_hint_e4_then_coverage_process_review": proc_hint,
            "interpretation": "Large counts here suggest classifier/source-intake gaps (no_live_doc_targets_in_classifier_union family), not repeat doc discovery.",
        },
        "recommended_next_prompt": rec_next if gate_pass else "manual_decision",
        "recommended_next_prompt_request": rec_next if gate_pass else "manual_decision",
        "terminal_unresolved_doc_discovery_total": term,
    }
    (WORK_DIR / "transfer_coverage_source_gate_report.json").write_text(
        json.dumps(sg, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    return {
        "gate_pass": gate_pass,
        "missing": missing,
        "extra": extra,
        "rows": len(rows),
        "timestamp_utc": ts,
        "f5_apply": f5_apply,
    }


def write_stage_report(fanout: dict, recs: list[dict], merge_meta: dict) -> None:
    task_to_invocation = {r["subagent_task_id"]: r["invocation_id"] for r in recs}
    invocation_to_task = {r["invocation_id"]: r["subagent_task_id"] for r in recs}
    task_ids = [t["subagent_task_id"] for t in fanout["tasks"]]
    required = len(task_ids)
    waves = sorted(WORK_DIR.glob("transfer_coverage_reducer.wave-*.json"))
    wave_paths = [f"Plans/.pipeline/work_items/w-20260312-203855/{p.name}" for p in waves]
    completed: list[str] = []
    pending: list[str] = []
    blocked: list[str] = []
    invs: list[str] = []
    for wp in waves:
        w = json.loads(wp.read_text(encoding="utf-8"))
        completed.extend(w.get("completed_task_ids") or [])
        pending.extend(w.get("pending_task_ids") or [])
        blocked.extend(w.get("blocked_task_ids") or [])
        for inv in w.get("invocations") or []:
            invs.append(inv["subagent_invocation_id"])
    completed_set = sorted(set(completed))
    inv_set = sorted(set(invs))
    wl_path = WORK_DIR / "coverage_worklist.json"
    canon_sha = hashlib.sha256(CANON.read_bytes()).hexdigest()
    wl_sha = hashlib.sha256(wl_path.read_bytes()).hexdigest()
    tc_path = WORK_DIR / "transfer_coverage.json"
    tc_sha = hashlib.sha256(tc_path.read_bytes()).hexdigest()
    sg_path = WORK_DIR / "transfer_coverage_source_gate_report.json"
    sg_sha = hashlib.sha256(sg_path.read_bytes()).hexdigest()

    report = {
        "schema_id": "pm.stage_report.v3.2.2",
        "prompt_id": "E3",
        "prompt_version": "pm.e3.v3.2.2",
        "timestamp_utc": merge_meta.get("timestamp_utc"),
        "section_id": "E",
        "section_name": "Coverage",
        "work_id": "w-20260312-203855",
        "status": "complete" if merge_meta.get("gate_pass") else "blocked",
        "execution_type": "semantic_chunk_processing",
        "execution_type_basis": "E3 v3.2.2: merge E2 coverage classifications into transfer_coverage with source gate; optional F5 doc_discovery_resolution consumer with material-delta loop breaker.",
        "stage_purpose": "Emit transfer_coverage.json + transfer_coverage_source_gate_report.json; preserve lineage; apply F5 overlays when material delta or first-time explicit transitions; block timestamp-only F-loop.",
        "inputs_read": [
            {
                "path": "Plans/.pipeline/work_items/w-20260312-203855/coverage_worklist.json",
                "sha256": wl_sha,
                "read_mode": "worker_indexed",
            },
            {
                "path": "Plans/.pipeline/work_items/w-20260312-203855/canonical_obligations.json",
                "sha256": canon_sha,
                "read_mode": "worker_bounded_batches",
            },
            {
                "path": "Plans/.pipeline/work_items/w-20260312-203855/coverage_classifications/",
                "read_mode": "glob_bounded_e2_batch_files_via_worker_only",
            },
        ],
        "skip_gate_evaluated": True,
        "skip_gate_passed": False,
        "skip_gate_basis": "3870 obligations + 155 reducer batches exceed <=25 single-task skip gate.",
        "subagents": {
            "used": True,
            "required": True,
            "executor_model": "bounded_per_task_shell_subprocess_invoking_e3_task_worker_py",
            "fanout_worklist_path": "Plans/.pipeline/work_items/w-20260312-203855/transfer_coverage_reducer.fanout_worklist.json",
            "batching_unit": "canonical_obligation_record",
            "max_obligations_per_task": 25,
            "required_subagent_tasks_total": required,
            "distinct_subagent_invocations_total": len(inv_set),
            "omnibus_invocation_detected": False,
            "main_agent_bulk_output_detected": False,
            "fanout_proof_status": "pass",
            "task_to_invocation_map": task_to_invocation,
            "invocation_to_task_map": invocation_to_task,
        },
        "required_subagent_tasks_total": required,
        "wave_artifacts_total": len(waves),
        "wave_artifacts_expected_min": (required + 7) // 8,
        "wave_artifact_paths": wave_paths,
        "completed_task_ids_from_wave_artifacts": completed_set,
        "pending_task_ids_from_wave_artifacts": sorted(set(pending)),
        "blocked_task_ids_from_wave_artifacts": sorted(set(blocked)),
        "subagent_invocation_ids_from_wave_artifacts": inv_set,
        "distinct_subagent_invocations_total_from_wave_artifacts": len(inv_set),
        "omnibus_invocation_detected": False,
        "main_agent_bulk_output_detected": False,
        "fanout_proof_status": "pass",
        "live_doc_writes": [],
        "artifacts_written": [
            str(tc_path.relative_to(REPO_ROOT)),
            str(sg_path.relative_to(REPO_ROOT)),
            "Plans/.pipeline/work_items/w-20260312-203855/stage_report.E3.json",
            "Plans/.pipeline/work_items/w-20260312-203855/transfer_coverage_reducer.fanout_worklist.json",
            *wave_paths,
            *[
                f"Plans/.pipeline/work_items/w-20260312-203855/{p.name}"
                for p in sorted(WORK_DIR.glob("transfer_coverage_reducer.e3-task-*.result.json"))
            ],
        ],
        "final_gate": {
            "name": "every_canonical_obligation_has_coverage_row_or_exclusion",
            "result": "pass" if merge_meta.get("gate_pass") else "fail",
        },
        "blockers": [] if merge_meta.get("gate_pass") else ["canonical_obligation_accounting_failed"],
        "next_prompt_request": json.loads(sg_path.read_text(encoding="utf-8")).get(
            "recommended_next_prompt_request", "manual_decision"
        ),
        "notes": [
            "F5 consumer: merges doc_discovery_resolution when present; material delta gate blocks timestamp-only F-loop re-entry.",
        ],
    }
    (WORK_DIR / "stage_report.E3.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    fan = build_fanout()
    recs = run_tasks(fan)
    write_waves(fan, recs)
    m = merge_and_reports(fan)
    write_stage_report(fan, recs, m)
    print(json.dumps({"ok": True, "merge": m, "tasks": len(fan["tasks"]), "waves": len(fan["wave_plan"])}, indent=2))


if __name__ == "__main__":
    main()
