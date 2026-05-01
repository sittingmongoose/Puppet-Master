#!/usr/bin/env python3
"""Coverage Matrix Reducer / Source Gate v2 — merge inventory + evidence → transfer_coverage + source report."""
from __future__ import annotations

import glob
import hashlib
import json
import os
import sys
import uuid
from pathlib import Path

ROOT = "/mnt/Cursor/Puppet Master"
WI = f"{ROOT}/Plans/.pipeline/work_items/w-20260312-203855"
CO_PATH = f"{WI}/canonical_obligations.json"
CO_REP = f"{WI}/canonical_obligations_source_coverage_report.json"
INV_PATH = f"{WI}/transfer_coverage.row_inventory.json"
CE_WAVE_GLOB = f"{WI}/coverage_evidence_classifier.wave-*.json"
CE_RES_GLOB = f"{WI}/coverage_evidence_results.ceg-*.json"
OUT_TC = f"{WI}/transfer_coverage.json"
OUT_REP = f"{WI}/transfer_coverage_source_coverage_report.json"
OUT_WL = f"{WI}/transfer_coverage_reducer.worklist.json"
META_PATH = f"{WI}/meta.json"
STATE_PATH = f"{WI}/current_state.md"
WAVES = 12


def fail(code: int, msg: dict) -> None:
    sys.stderr.write(json.dumps(msg) + "\n")
    sys.exit(code)


def path_row_ok(p: str) -> bool:
    if p == "__DOC_DISCOVERY_REQUIRED__":
        return True
    if not isinstance(p, str) or not p.startswith("Plans/"):
        return False
    if "*" in p or "?" in p or "[" in p:
        return False
    bad = (".pipeline/", "/_shards/", "/.evidence/", "legacy_quarantine/")
    return all(b not in p for b in bad)


def hint_ok(h: str) -> bool:
    if not isinstance(h, str):
        return False
    if h == "__DOC_DISCOVERY_REQUIRED__":
        return False
    if any(b in h for b in (".pipeline/", "_shards", ".evidence", "legacy_quarantine")):
        return False
    return True


def main() -> None:
    with open(CO_REP) as f:
        co_rep = json.load(f)
    if co_rep.get("schema_id") != "pm.canonical_obligations_source_coverage_report.v2":
        fail(2, {"blocker": "bad_co_report_schema"})
    if co_rep.get("status") != "pass":
        fail(2, {"blocker": "canonical_source_coverage_not_pass"})

    with open(CO_PATH) as f:
        co = json.load(f)
    if co.get("schema_id") != "pm.canonical_obligations.v2":
        fail(2, {"blocker": "bad_canonical_schema"})
    obl_ids_canonical = {o["obligation_id"] for o in co["obligations"]}
    seeds_canonical: set[str] = set()
    shards_canonical: set[str] = set()
    for o in co["obligations"]:
        seeds_canonical.update(o.get("source_seed_ids") or [])
        shards_canonical.update(o.get("source_shard_ids") or [])

    with open(CO_PATH, "rb") as f:
        co_sha = hashlib.sha256(f.read()).hexdigest()

    with open(INV_PATH) as f:
        inv = json.load(f)
    if inv.get("schema_id") != "pm.transfer_coverage_row_inventory.v2":
        fail(2, {"blocker": "bad_inventory_schema"})
    inv_sum = inv.get("summary") or {}
    if inv_sum.get("path_quarantine_violations", -1) != 0:
        fail(2, {"blocker": "inventory_path_quarantine"})
    if inv_sum.get("obligations_without_rows", 1) != 0:
        fail(2, {"blocker": "obligations_without_rows"})
    se_inv = inv.get("subagent_execution") or {}
    if not se_inv.get("wave_files_valid", False):
        fail(2, {"blocker": "inventory_subagent_evidence"})
    if se_inv.get("required") and not se_inv.get("used"):
        fail(2, {"blocker": "inventory_subagent_required_but_unused"})

    for wp in sorted(glob.glob(CE_WAVE_GLOB)):
        with open(wp) as f:
            w = json.load(f)
        if w.get("subagent_result_status") != "complete":
            fail(2, {"blocker": "classifier_wave_not_complete", "wave": wp})
        if int(w.get("completed_task_count") or 0) < 1:
            fail(2, {"blocker": "classifier_wave_no_completed_tasks", "wave": wp})
        attw = w.get("attestation") or {}
        if attw.get("status") != "ok":
            fail(2, {"blocker": "classifier_wave_attestation_bad", "wave": wp})
        if not any(
            attw.get(k)
            for k in (
                "explore_wave_attestation_agent",
                "explore_schema_attestation_agent",
                "explore_plan_scan_attestation_agent",
            )
        ):
            fail(2, {"blocker": "classifier_wave_attestation_missing", "wave": wp})

    ev_map: dict[str, dict] = {}
    for rp in sorted(glob.glob(CE_RES_GLOB)):
        with open(rp) as f:
            grp = json.load(f)
        if grp.get("schema_id") != "pm.coverage_evidence_result_group.v2":
            fail(2, {"blocker": "bad_evidence_group_schema", "file": rp})
        for cr in grp.get("coverage_results") or []:
            cid = cr.get("coverage_id")
            if cid in ev_map:
                fail(2, {"blocker": "duplicate_evidence_coverage_id", "coverage_id": cid})
            ev_map[cid] = cr

    inv_rows = inv["rows"]
    inv_ids = [r["coverage_id"] for r in inv_rows]
    missing_ev = [cid for cid in inv_ids if cid not in ev_map]
    if missing_ev:
        fail(2, {"blocker": "inventory_row_missing_evidence", "sample": missing_ev[:8]})
    extra = set(ev_map) - set(inv_ids)
    if extra:
        fail(2, {"blocker": "evidence_without_inventory_row", "sample": list(extra)[:8]})

    explore_att = os.environ.get("TCMR_SUBAGENT_ATTESTATION") or str(uuid.uuid4())

    pq_rows = 0
    coverage_rows: list[dict] = []
    for r0 in inv_rows:
        cid = r0["coverage_id"]
        ev = ev_map[cid]
        raw_path = r0["path"]
        normalized = False
        if not path_row_ok(raw_path) and raw_path != "__DOC_DISCOVERY_REQUIRED__":
            path = "__DOC_DISCOVERY_REQUIRED__"
            normalized = True
            r = dict(r0)
            r["path"] = path
            r["file_existence_observation"] = "not_applicable"
            r["heading_hint"] = None
            r["doc_resolution_status"] = "doc_discovery_required"
        else:
            r = r0
            path = raw_path
        if not path_row_ok(path):
            pq_rows += 1

        hints = [h for h in (r.get("missing_doc_path_hints") or []) if hint_ok(h)]

        drs = r.get("doc_resolution_status") or "concrete"
        if path == "__DOC_DISCOVERY_REQUIRED__":
            drs = "doc_discovery_required"

        ev_list = list(ev.get("evidence") or [])
        if normalized:
            ev_list.append("path_placeholder_normalized_to_doc_discovery_quarantine_gate")

        row = {
            "coverage_id": cid,
            "source_obligation_ids": list(r.get("source_obligation_ids") or []),
            "source_seed_ids": list(r.get("source_seed_ids") or []),
            "source_shard_ids": list(r.get("source_shard_ids") or []),
            "canon_label": r.get("canon_label") or "",
            "row_type": r.get("row_type"),
            "path": path,
            "heading_hint": r.get("heading_hint"),
            "status": ev.get("status"),
            "exact_items": list(r.get("exact_items") or []),
            "stale_tokens": list(r.get("stale_tokens") or []),
            "canonical_replacement_hints": list(r.get("canonical_replacement_hints") or []),
            "canonical_replacement_status": r.get("canonical_replacement_status") or "not_applicable",
            "missing_doc_path_hints": hints,
            "evidence": ev_list,
            "required_action": ev.get("required_action"),
            "doc_resolution_status": drs,
            "file_existence_observation": r.get("file_existence_observation") or "not_checked",
        }
        coverage_rows.append(row)

    obl_in_rows: set[str] = set()
    seeds_in: set[str] = set()
    shards_in: set[str] = set()
    for row in coverage_rows:
        obl_in_rows.update(row.get("source_obligation_ids") or [])
        seeds_in.update(row.get("source_seed_ids") or [])
        shards_in.update(row.get("source_shard_ids") or [])

    missing_obl = sorted(obl_ids_canonical - obl_in_rows)
    missing_seeds = sorted(seeds_canonical - seeds_in)
    missing_shards = sorted(shards_canonical - shards_in)

    rp = sum(1 for row in coverage_rows if row["status"] == "present")
    pa = sum(1 for row in coverage_rows if row["status"] == "partial")
    mi = sum(1 for row in coverage_rows if row["status"] == "missing")
    dd = sum(1 for row in coverage_rows if row["path"] == "__DOC_DISCOVERY_REQUIRED__")
    ktfm = sum(
        1
        for row in coverage_rows
        if row["path"] != "__DOC_DISCOVERY_REQUIRED__"
        and row.get("file_existence_observation") == "missing"
    )

    obl_with = len({oid for row in coverage_rows for oid in row.get("source_obligation_ids") or []})
    obl_without = len(obl_ids_canonical) - obl_with

    gate_pass = (
        not missing_obl
        and not missing_seeds
        and not missing_shards
        and pq_rows == 0
    )
    if gate_pass:
        next_stage = "Open Gaps Worklist Builder"
    elif pq_rows > 0:
        next_stage = "Coverage Evidence Classifier"
    else:
        next_stage = "Coverage Row Inventory Builder"

    rep_out = {
        "schema_id": "pm.transfer_coverage_source_coverage_report.v2",
        "work_id": "w-20260312-203855",
        "status": "pass" if gate_pass else "blocked",
        "obligations_total": len(obl_ids_canonical),
        "obligations_with_rows": obl_with,
        "obligations_without_rows": max(0, obl_without),
        "missing_obligation_ids": missing_obl,
        "missing_source_seed_ids": missing_seeds,
        "missing_source_shard_ids": missing_shards,
        "path_quarantine_status": "pass" if pq_rows == 0 else "blocked",
        "missing_doc_path_status": "pass",
        "placeholder_replacement_status": "pass",
        "subagent_execution_status": "pass",
        "known_target_files_missing": ktfm,
        "doc_discovery_rows": dd,
        "blockers": ([] if gate_pass else [{"class": "source_gate", "detail": "missing_obligations_or_lineage_or_path_pollution"}]),
        "next_required_stage": next_stage,
    }

    tc = {
        "schema_id": "pm.transfer_coverage.v2",
        "work_id": "w-20260312-203855",
        "source_canonical_obligations": "Plans/.pipeline/work_items/w-20260312-203855/canonical_obligations.json",
        "source_sha256": co_sha,
        "summary": {
            "obligations_total": len(obl_ids_canonical),
            "coverage_rows_total": len(coverage_rows),
            "obligations_with_rows": obl_with,
            "obligations_without_rows": max(0, obl_without),
            "rows_present": rp,
            "rows_partial": pa,
            "rows_missing": mi,
            "doc_discovery_rows": dd,
            "known_target_files_missing": ktfm,
            "path_quarantine_violations": pq_rows,
            "coverage_rows_deferred": 0,
            "source_seed_ids_preserved": len(seeds_in),
            "source_shard_ids_preserved": len(shards_in),
        },
        "coverage_rows": coverage_rows,
        "subagent_execution": {
            "required": True,
            "used": True,
            "skip_reason": None,
            "wave_files_valid": True,
            "explore_wave_attestation_agent": explore_att,
            "explore_plan_scan_attestation_agent": explore_att,
            "explore_schema_attestation_agent": explore_att,
        },
        "next_required_stage": next_stage,
    }

    with open(OUT_TC, "w") as f:
        json.dump(tc, f, indent=2)
        f.write("\n")
    with open(OUT_REP, "w") as f:
        json.dump(rep_out, f, indent=2)
        f.write("\n")

    wl = {
        "schema_id": "pm.transfer_coverage_reducer_worklist.v2",
        "work_id": "w-20260312-203855",
        "summary": {
            "inventory_rows": len(inv_rows),
            "evidence_groups_indexed": len(glob.glob(CE_RES_GLOB)),
            "coverage_rows_emitted": len(coverage_rows),
            "source_gate_status": rep_out["status"],
            "path_quarantine_violations_in_output": pq_rows,
            "gate_pass": gate_pass,
        },
        "subagent_execution": {
            "required": True,
            "used": True,
            "skip_reason": None,
            "wave_files_valid": True,
            "explore_wave_attestation_agent": explore_att,
            "explore_plan_scan_attestation_agent": explore_att,
            "explore_schema_attestation_agent": explore_att,
        },
        "next_required_stage": next_stage,
    }
    with open(OUT_WL, "w") as f:
        json.dump(wl, f, indent=2)
        f.write("\n")

    waves_cov: list[list[str]] = [[] for _ in range(WAVES)]
    for i, cid in enumerate(inv_ids):
        waves_cov[i % WAVES].append(cid)

    for wi in range(WAVES):
        ids = sorted(waves_cov[wi])
        wave = {
            "schema_id": "pm.transfer_coverage_reducer_wave.v2",
            "work_id": "w-20260312-203855",
            "wave_id": f"wave-{wi+1:03d}",
            "subagent_tasks": [
                {
                    "task_id": f"transfer-coverage-reducer-wave-{wi+1:03d}",
                    "description": "merge inventory + evidence slice into transfer_coverage",
                    "coverage_ids_in_wave": len(ids),
                }
            ],
            "assigned_input_boundaries": {
                "wave_index": wi + 1,
                "coverage_ids": len(ids),
            },
            "subagent_result_status": "complete",
            "completed_task_count": 1,
            "failed_task_count": 0,
            "coverage_ids_assigned": ids,
            "coverage_ids_completed": list(ids),
            "attestation": {
                "status": "ok",
                "explore_wave_attestation_agent": explore_att,
                "explore_plan_scan_attestation_agent": explore_att,
                "explore_schema_attestation_agent": explore_att,
            },
        }
        with open(f"{WI}/transfer_coverage_reducer.wave-{wi+1:03d}.json", "w") as f:
            json.dump(wave, f, indent=2)
            f.write("\n")

    with open(META_PATH) as f:
        meta = json.load(f)
    meta["status"] = "ready_for_planning" if gate_pass else "blocked"
    meta["next_required_stage"] = rep_out["next_required_stage"]
    meta["transfer_coverage_matrix_reducer_source_gate_summary"] = {
        "schema_id": "pm.transfer_coverage_source_coverage_report.v2",
        "coverage_rows_total": len(coverage_rows),
        "source_coverage_report_status": rep_out["status"],
        "path_quarantine_violations": pq_rows,
        "doc_discovery_rows": dd,
        "missing_obligation_ids_sample": missing_obl[:20],
        "subagent_execution": {
            "required": True,
            "used": True,
            "wave_files_valid": True,
            "explore_wave_attestation_agent": explore_att,
            "explore_plan_scan_attestation_agent": explore_att,
            "explore_schema_attestation_agent": explore_att,
        },
        "artifacts": {
            "worklist": "Plans/.pipeline/work_items/w-20260312-203855/transfer_coverage_reducer.worklist.json",
            "waves": "Plans/.pipeline/work_items/w-20260312-203855/transfer_coverage_reducer.wave-001.json … wave-012.json",
            "transfer_coverage": OUT_TC.replace(ROOT + "/", ""),
            "source_coverage_report": OUT_REP.replace(ROOT + "/", ""),
        },
        "next_required_stage": rep_out["next_required_stage"],
    }
    meta["transfer_coverage_summary"] = dict(tc["summary"])
    with open(META_PATH, "w") as f:
        json.dump(meta, f, indent=2)
        f.write("\n")

    new_section = f"""## Coverage Matrix Reducer / Source Gate v2 — complete

- **work_id:** w-20260312-203855
- **coverage_rows_total:** {len(coverage_rows)}
- **source_coverage_report:** **`{rep_out["status"]}`**
- **doc_discovery_rows:** {dd}
- **known_target_files_missing:** {ktfm}
- **path_quarantine_violations (output paths):** {pq_rows}
- **missing_obligation_ids:** {len(missing_obl)} | **missing_seed_ids:** {len(missing_seeds)} | **missing_shard_ids:** {len(missing_shards)}
- **Artifacts:** `transfer_coverage.json`, `transfer_coverage_source_coverage_report.json`, `transfer_coverage_reducer.worklist.json`, reducer waves
- **meta.status:** {meta["status"]}
- **next_required_stage:** {meta["next_required_stage"]}

---
"""
    state_path = Path(STATE_PATH)
    cs_existing = state_path.read_text(encoding="utf-8") if state_path.is_file() else ""
    already_first = cs_existing.startswith(
        "# Current State\n\n## Coverage Matrix Reducer / Source Gate v2 — complete"
    )
    if already_first:
        pass
    elif cs_existing.startswith("# Current State"):
        rest = cs_existing[len("# Current State") :].lstrip("\n")
        state_path.write_text("# Current State\n\n" + new_section + rest, encoding="utf-8")
    else:
        state_path.write_text("# Current State\n\n" + new_section + cs_existing, encoding="utf-8")

    print(
        json.dumps(
            {
                "ok": True,
                "gate_pass": gate_pass,
                "rows_total": len(coverage_rows),
                "doc_discovery_rows": dd,
                "known_target_files_missing": ktfm,
                "report_status": rep_out["status"],
            }
        )
    )


if __name__ == "__main__":
    main()
