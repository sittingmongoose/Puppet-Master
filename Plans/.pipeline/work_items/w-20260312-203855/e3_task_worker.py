#!/usr/bin/env python3
"""E3 bounded reducer task: build transfer_coverage rows for <=25 obligations."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

WORK_DIR = Path(__file__).resolve().parent
CANON = WORK_DIR / "canonical_obligations.json"
WL = WORK_DIR / "coverage_worklist.json"
E2_GLOB = "coverage_classifications/coverage.e2-task-*.json"


def stable_row_hash(payload: dict[str, Any]) -> str:
    s = json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def load_e2_index() -> dict[str, dict[str, Any]]:
    """obligation_id -> {obligation row from E2, task meta}."""
    out: dict[str, dict[str, Any]] = {}
    for p in sorted((WORK_DIR / "coverage_classifications").glob("coverage.e2-task-*.json")):
        d = json.loads(p.read_text(encoding="utf-8"))
        for task_row in d.get("classifications") or []:
            ct_id = task_row.get("coverage_task_id")
            for obl in task_row.get("obligation_classifications") or []:
                oid = obl.get("obligation_id")
                if not oid:
                    continue
                out[oid] = {
                    "obligation_e2": obl,
                    "aggregated_task_label": task_row.get("aggregated_coverage_label"),
                    "doc_resolution_status": task_row.get("doc_resolution_status"),
                    "coverage_task_id": ct_id,
                    "source_shard_id": task_row.get("source_shard_id"),
                    "candidate_docs": task_row.get("candidate_docs") or [],
                }
    return out


def load_worklist_indexes() -> tuple[dict[str, Any], dict[str, Any], list[dict]]:
    wl = json.loads(WL.read_text(encoding="utf-8"))
    obl_to_ct: dict[str, dict[str, Any]] = {}
    ct_by_id: dict[str, dict[str, Any]] = {}
    for ct in wl.get("coverage_tasks") or []:
        cid = ct["coverage_task_id"]
        ct_by_id[cid] = ct
        for oid in ct.get("obligation_ids") or []:
            obl_to_ct[oid] = {
                "coverage_task_id": cid,
                "live_doc_targets_union": ct.get("live_doc_targets_union") or [],
                "preserved_candidate_hints": ct.get("preserved_candidate_hints") or [],
                "doc_resolution_status": ct.get("doc_resolution_status"),
                "source_shard_id": ct.get("source_shard_id"),
            }
    excluded = wl.get("excluded_obligations") or []
    return obl_to_ct, ct_by_id, excluded


def terminal_unresolved(
    wl_meta: dict[str, Any] | None,
    e2_meta: dict[str, Any] | None,
    obl: dict[str, Any],
) -> bool:
    """True only for exhausted doc-discovery style rows: no targets, no hints, no paths to bind."""
    if not wl_meta:
        return False
    st = wl_meta.get("doc_resolution_status") or ""
    if st != "unresolved_no_live_target":
        return False
    targets = list(wl_meta.get("live_doc_targets_union") or [])
    hints = wl_meta.get("preserved_candidate_hints") or []
    paths = obl.get("exact_paths_mentioned") or []
    if targets or hints:
        return False
    if paths:
        return False
    return True


def doc_discovery_state(
    obl: dict[str, Any],
    wl_meta: dict[str, Any] | None,
    e2_meta: dict[str, Any] | None,
    is_excluded: bool,
    exclusion: dict[str, Any] | None,
) -> str:
    if is_excluded:
        return "excluded_at_source_gate"
    if terminal_unresolved(wl_meta, e2_meta, obl):
        return "exhausted_doc_discovery"
    if wl_meta and wl_meta.get("doc_resolution_status") == "unresolved_no_live_target":
        return "unresolved_source_hint_gap_not_terminal_exhaustion"
    if wl_meta and wl_meta.get("doc_resolution_status") == "doc_discovery":
        return "doc_discovery_required"
    if e2_meta and e2_meta.get("aggregated_task_label") == "needs_doc_discovery":
        return "doc_discovery_required"
    return "no_doc_discovery_loop"


def next_route_hint(
    obl: dict[str, Any],
    wl_meta: dict[str, Any] | None,
    e2obl: dict[str, Any] | None,
    terminal: bool,
    is_excluded: bool,
) -> str:
    if is_excluded:
        return "excluded_no_further_doc_discovery"
    if terminal:
        return "b3_or_b1_or_manual_decision_terminal_doc_discovery"
    # concrete paths but missing evidence -> process defect, not F-loop
    paths = [p for p in (obl.get("exact_paths_mentioned") or []) if isinstance(p, str) and p.startswith("Plans/")]
    if paths and e2obl and e2obl.get("classification") == "missing" and wl_meta and wl_meta.get(
        "doc_resolution_status"
    ) == "concrete_plans_targets":
        return "e4_then_coverage_process_review_if_persistent"
    if wl_meta and wl_meta.get("doc_resolution_status") == "doc_discovery":
        return "f1_doc_discovery_classifier"
    return "e4_section_exit_coverage"


def build_row(
    obl: dict[str, Any],
    wl_meta: dict[str, Any] | None,
    e2_meta: dict[str, Any] | None,
    is_excluded: bool,
    exclusion: dict[str, Any] | None,
) -> dict[str, Any]:
    oid = obl["obligation_id"]
    e2obl = (e2_meta or {}).get("obligation_e2") if e2_meta else None
    rh_payload = {
        "obligation_id": oid,
        "source_block_ids": sorted(obl.get("source_block_ids") or []),
        "source_group_ids": sorted(obl.get("source_group_ids") or []),
        "exact_paths_mentioned": sorted(obl.get("exact_paths_mentioned") or []),
    }
    row_hash = stable_row_hash(rh_payload)
    term = terminal_unresolved(wl_meta, e2_meta, obl)
    hints_flat: list[str] = []
    if wl_meta:
        for h in wl_meta.get("preserved_candidate_hints") or []:
            if h.get("obligation_id") == oid:
                for dh in h.get("doc_hints") or []:
                    ex = dh.get("hint_excerpt")
                    if ex:
                        hints_flat.append(str(ex)[:400])

    row: dict[str, Any] = {
        "record_kind": "obligation_excluded" if is_excluded else "obligation_coverage",
        "obligation_id": oid,
        "row_hash": row_hash,
        "source_shard_ids": obl.get("source_shard_ids") or [],
        "source_block_ids": obl.get("source_block_ids") or [],
        "source_group_ids": obl.get("source_group_ids") or [],
        "ledger_line_ranges": obl.get("source_line_ranges") or [],
        "exact_paths_mentioned": obl.get("exact_paths_mentioned") or [],
        "candidate_doc_hints": hints_flat[:25],
        "live_doc_targets_union": (wl_meta or {}).get("live_doc_targets_union") or [],
        "coverage_task_id": (wl_meta or {}).get("coverage_task_id"),
        "obligation_category": obl.get("obligation_category"),
        "obligation_level_classification": (e2obl or {}).get("classification"),
        "best_evidence_score": (e2obl or {}).get("best_evidence_score"),
        "aggregated_task_label": (e2_meta or {}).get("aggregated_task_label"),
        "doc_resolution_status": (wl_meta or {}).get("doc_resolution_status"),
        "doc_discovery_attempt_state": doc_discovery_state(obl, wl_meta, e2_meta, is_excluded, exclusion),
        "terminal_unresolved_doc_discovery": term,
        "f5_unresolved_explicit_preserved": False,
        "mechanically_exhausted_preserved": bool(term),
        "next_route_hint": next_route_hint(obl, wl_meta, e2obl, term, is_excluded),
        "exclusion": exclusion if is_excluded else None,
    }
    if is_excluded and exclusion:
        row["exclusion_reason"] = exclusion.get("exclusion_reason")
        row["exclusion_source_shard_id"] = exclusion.get("source_shard_id")
    return row


def run_task(task_id: str, invocation_id: str, obligation_ids: list[str]) -> None:
    canon = json.loads(CANON.read_text(encoding="utf-8"))
    by_id = {o["obligation_id"]: o for o in canon["obligations"]}
    e2_idx = load_e2_index()
    obl_to_ct, _ct_by_id, excluded = load_worklist_indexes()
    ex_by_id = {e["obligation_id"]: e for e in excluded}

    rows: list[dict[str, Any]] = []
    for oid in obligation_ids:
        is_ex = oid in ex_by_id
        obl = by_id.get(oid)
        if not obl:
            rows.append(
                {
                    "record_kind": "obligation_missing_canonical",
                    "obligation_id": oid,
                    "row_hash": stable_row_hash({"obligation_id": oid}),
                    "error": "obligation not found in canonical_obligations.json",
                }
            )
            continue
        wl_meta = obl_to_ct.get(oid)
        e2_meta = e2_idx.get(oid)
        rows.append(
            build_row(
                obl,
                wl_meta,
                e2_meta,
                is_ex,
                ex_by_id.get(oid) if is_ex else None,
            )
        )

    out = {
        "schema_id": "pm.transfer_coverage_reducer_task_result.v3.2.2",
        "subagent_task_id": task_id,
        "subagent_invocation_id": invocation_id,
        "status": "complete",
        "rows": rows,
    }
    outp = WORK_DIR / f"transfer_coverage_reducer.{task_id}.result.json"
    outp.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def merge_results() -> dict[str, Any]:
    parts = sorted(WORK_DIR.glob("transfer_coverage_reducer.e3-task-*.result.json"))
    rows: list[dict[str, Any]] = []
    for p in parts:
        rows.extend(json.loads(p.read_text(encoding="utf-8")).get("rows") or [])
    canon = json.loads(CANON.read_text(encoding="utf-8"))
    expected = {o["obligation_id"] for o in canon["obligations"]}
    got = {r["obligation_id"] for r in rows if r.get("obligation_id")}
    missing = sorted(expected - got)
    extra = sorted(got - expected)
    return {"rows": rows, "missing": missing, "extra": extra, "expected": len(expected), "got": len(got)}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--task-id")
    ap.add_argument("--invocation-id", default="")
    ap.add_argument("--merge-only", action="store_true")
    args = ap.parse_args()
    if args.merge_only:
        m = merge_results()
        print(json.dumps({"merge_preview": {k: m[k] for k in ("missing", "extra", "expected", "got")}}, indent=2))
        return
    if not args.task_id or not args.invocation_id:
        raise SystemExit("need --task-id and --invocation-id")
    fan = json.loads((WORK_DIR / "transfer_coverage_reducer.fanout_worklist.json").read_text(encoding="utf-8"))
    spec = {t["subagent_task_id"]: t for t in fan["tasks"]}[args.task_id]
    run_task(args.task_id, args.invocation_id, spec["obligation_ids"])


if __name__ == "__main__":
    main()
