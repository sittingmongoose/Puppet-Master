#!/usr/bin/env python3
"""E3 mechanical draft: build reducer slice input bundles + draft coverage_rows (local worker)."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

BASE = Path(__file__).resolve().parent


def sha256_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def row_hash(canonical: dict[str, Any]) -> str:
    payload = {
        "obligation_id": canonical["obligation_id"],
        "obligation_category": canonical.get("obligation_category"),
        "exact_paths_mentioned": canonical.get("exact_paths_mentioned") or [],
        "source_shard_ids": canonical.get("source_shard_ids") or [],
        "source_block_ids": canonical.get("source_block_ids") or [],
        "source_line_ranges": canonical.get("source_line_ranges") or [],
        "exact_excerpt": canonical.get("exact_excerpt") or "",
    }
    return hashlib.sha256(
        json.dumps(payload, sort_keys=True, ensure_ascii=False).encode("utf-8")
    ).hexdigest()


def ledger_line_ranges(canonical: dict[str, Any]) -> list[dict[str, int]]:
    out: list[dict[str, int]] = []
    for r in canonical.get("source_line_ranges") or []:
        out.append(
            {
                "start_line": int(r["start_line"]),
                "end_line": int(r["end_line"]),
            }
        )
    return out


def score_from_e2(cls_row: dict[str, Any]) -> float:
    c = cls_row.get("classification") or ""
    unc = (cls_row.get("uncertainty") or "medium").lower()
    umul = {"high": 0.85, "medium": 1.0, "low": 1.05}.get(unc, 1.0)
    spans = cls_row.get("evidence_spans") or []
    if c == "present":
        base = 0.78 if spans else 0.55
    elif c == "partial":
        base = 0.52
    elif c == "missing":
        base = 0.12
    elif c in ("needs_doc_discovery",):
        base = 0.28
    elif c in ("source_hint_gap",):
        base = 0.08
    elif c in ("process_only",):
        base = 0.4
    elif c in ("open_decision",):
        base = 0.35
    else:
        base = 0.45
    return max(0.0, min(0.99, round(base * umul, 4)))


def aggregated_label(
    doc_res: str,
    cls: str,
    live_union: list[str],
    cand: list[str],
) -> str:
    if doc_res == "shard_only_pending_live_path_binding" and not live_union:
        return "no_live_doc_targets_in_classifier_union"
    if cls in ("present", "partial") and live_union:
        return "bounded_window_phrase_match"
    if cls == "needs_doc_discovery" and (cand or live_union):
        return "doc_discovery_candidate_union"
    if cls == "open_decision":
        return "open_decision_row"
    if cls == "process_only":
        return "process_only_row"
    return "coverage_reducer_default"


def terminal_shard_gap(
    doc_res: str,
    live_union: list[str],
    cand: list[str],
    cls: str,
) -> bool:
    if doc_res != "shard_only_pending_live_path_binding":
        return False
    if live_union or cand:
        return False
    if cls in ("source_hint_gap", "needs_doc_discovery"):
        return True
    return False


def next_route(
    cls: str,
    terminal: bool,
    doc_res: str,
    live_union: list[str],
    cand: list[str],
) -> str:
    if terminal:
        return "b3_issue_process_adjudicator"
    if cls == "open_decision":
        return "manual_decision"
    if cls == "needs_doc_discovery" and (cand or live_union):
        return "f1_open_gaps_classifier"
    if cls in ("present", "partial", "missing", "process_only", "source_hint_gap"):
        if doc_res == "shard_only_pending_live_path_binding" and not live_union:
            return "b3_issue_process_adjudicator"
        return "e4_section_exit_coverage"
    return "e4_section_exit_coverage"


def doc_discovery_state(cls: str, terminal: bool, cand: list[str], live_union: list[str]) -> str:
    if terminal:
        return "doc_discovery_exhaustion"
    if cls == "needs_doc_discovery" and (cand or live_union):
        return "doc_discovery_required"
    return "no_doc_discovery_loop"


def build_row(
    canonical: dict[str, Any],
    task: dict[str, Any],
    cls_row: dict[str, Any],
    slice_id: str,
) -> dict[str, Any]:
    oid = canonical["obligation_id"]
    doc_res = task.get("doc_resolution_status") or ""
    live_union = list(task.get("live_doc_targets_union") or [])
    cand = list(task.get("candidate_doc_hints") or [])
    cls = cls_row.get("classification") or "missing"
    term = terminal_shard_gap(doc_res, live_union, cand, cls)
    agg = aggregated_label(doc_res, cls, live_union, cand)
    nd = doc_discovery_state(cls, term, cand, live_union)
    olc = cls
    if term and cls == "source_hint_gap":
        olc = "needs_doc_discovery"

    return {
        "record_kind": "obligation_coverage",
        "obligation_id": oid,
        "row_hash": row_hash(canonical),
        "source_shard_ids": list(canonical.get("source_shard_ids") or []),
        "source_block_ids": list(canonical.get("source_block_ids") or []),
        "source_group_ids": list(canonical.get("source_group_ids") or []),
        "ledger_line_ranges": ledger_line_ranges(canonical),
        "exact_paths_mentioned": list(canonical.get("exact_paths_mentioned") or []),
        "candidate_doc_hints": cand,
        "live_doc_targets_union": live_union,
        "coverage_task_id": cls_row.get("coverage_task_id") or task.get("coverage_task_id"),
        "obligation_category": canonical.get("obligation_category") or "unknown",
        "obligation_level_classification": olc,
        "best_evidence_score": score_from_e2(cls_row),
        "aggregated_task_label": agg,
        "doc_resolution_status": doc_res,
        "doc_discovery_attempt_state": nd,
        "terminal_unresolved_doc_discovery": term,
        "f5_unresolved_explicit_preserved": False,
        "mechanically_exhausted_preserved": False,
        "next_route_hint": next_route(cls, term, doc_res, live_union, cand),
        "exclusion": None,
        "e3_reducer_slice_id": slice_id,
    }


def main() -> None:
    wl = json.loads((BASE / "coverage_worklist.json").read_text())
    co = json.loads((BASE / "canonical_obligations.json").read_text())
    man = json.loads((BASE / "coverage_classification_slices.json").read_text())

    cov_dir = BASE / "coverage_classifications"
    obl_to_task: dict[str, dict[str, Any]] = {}
    for t in wl["coverage_tasks"]:
        tid = t["coverage_task_id"]
        for oid in t.get("obligation_ids") or []:
            obl_to_task[oid] = t

    obl_to_cls: dict[str, dict[str, Any]] = {}
    for p in sorted(cov_dir.glob("coverage.*.json")):
        doc = json.loads(p.read_text())
        for row in doc.get("obligation_classifications") or []:
            obl_to_cls[row["obligation_id"]] = row

    canon_by_id = {o["obligation_id"]: o for o in co["obligations"]}
    canon_order = [o["obligation_id"] for o in co["obligations"]]

    slices_out: list[dict[str, Any]] = []
    (BASE / "coverage_reducer_slices").mkdir(parents=True, exist_ok=True)

    for s in man["slices"]:
        sid = s["slice_id"]
        reducer_sid = f"e3-{sid}"
        oids = s["obligation_ids"]
        draft_rows: list[dict[str, Any]] = []
        missing: list[str] = []
        for oid in oids:
            if oid not in canon_by_id:
                missing.append(oid)
                continue
            if oid not in obl_to_task:
                missing.append(oid)
                continue
            if oid not in obl_to_cls:
                missing.append(oid)
                continue
            draft_rows.append(
                build_row(canon_by_id[oid], obl_to_task[oid], obl_to_cls[oid], reducer_sid)
            )
        if missing:
            raise SystemExit(f"slice {sid} missing data for: {missing[:8]} ...")

        out_path = BASE / "coverage_reducer_slices" / f"reducer.{sid}.json"
        bundle = {
            "schema_id": "pm.coverage_reducer_slice_input.v3.2.3",
            "prompt_id": "E3",
            "prompt_version": "pm.e3.v3.2.3",
            "work_id": wl["work_id"],
            "slice_id": sid,
            "subagent_task_id": f"e3-{sid}",
            "source": {
                "canonical_obligations_sha256": co.get("_sha256")
                or sha256_bytes((BASE / "canonical_obligations.json").read_bytes()),
                "coverage_worklist_sha256": sha256_bytes(
                    (BASE / "coverage_worklist.json").read_bytes()
                ),
            },
            "f5_loop_breaker_context": {
                "active_doc_discovery_resolution_json_in_work_item_root": False,
                "material_resolution_delta_evaluated": "skipped_no_active_doc_discovery_resolution_json",
                "note": "No doc_discovery_resolution.json in work item root; do not consume archive F5.",
            },
            "obligation_ids": oids,
            "draft_coverage_rows": draft_rows,
            "subagent_instructions": (
                "Validate draft_coverage_rows against E3 v3.2.3 hotfix (terminal shard gap, "
                "no timestamp-only F5 loop). Replace this file with pm.coverage_reducer_slice.v3.2.3 "
                "output: copy validated rows to coverage_rows; set slice_summary.validation_notes."
            ),
        }
        out_path.write_text(json.dumps(bundle, indent=2) + "\n")

        slices_out.append(
            {
                "slice_id": sid,
                "subagent_task_id": f"e3-{sid}",
                "source_e2_slice_id": s.get("source_e1_slice_id"),
                "obligation_record_count": len(oids),
                "coverage_task_ids": s.get("coverage_task_ids"),
                "input_output_path": f"Plans/.pipeline/work_items/{wl['work_id']}/coverage_reducer_slices/reducer.{sid}.json",
            }
        )

    manifest = {
        "schema_id": "pm.coverage_reducer_slices.v3.2.3",
        "prompt_id": "E3",
        "prompt_version": "pm.e3.v3.2.3",
        "work_id": wl["work_id"],
        "execution_type": "semantic_chunk_processing",
        "slices_total": len(slices_out),
        "required_subagent_tasks_total": len(slices_out),
        "source": {
            "canonical_obligations_sha256": sha256_bytes(
                (BASE / "canonical_obligations.json").read_bytes()
            ),
            "coverage_worklist_sha256": sha256_bytes(
                (BASE / "coverage_worklist.json").read_bytes()
            ),
            "stage_report_e2_path": f"Plans/.pipeline/work_items/{wl['work_id']}/stage_report.E2.json",
        },
        "slices": slices_out,
        "canonical_obligation_order_path": f"Plans/.pipeline/work_items/{wl['work_id']}/canonical_obligations.json",
        "canonical_obligation_ids_total": len(canon_order),
    }
    (BASE / "coverage_reducer_slices.json").write_text(json.dumps(manifest, indent=2) + "\n")

    print("slices", len(slices_out), "canonical", len(canon_order), "classifications", len(obl_to_cls))


if __name__ == "__main__":
    main()
