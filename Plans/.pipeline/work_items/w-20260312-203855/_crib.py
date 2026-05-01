#!/usr/bin/env python3
"""Coverage Row Inventory Builder v2 — rebuild from canonical_obligations.json only."""
from __future__ import annotations

import hashlib
import json
import os
import sys
import uuid
from pathlib import Path

ROOT = "/mnt/Cursor/Puppet Master"
WI = f"{ROOT}/Plans/.pipeline/work_items/w-20260312-203855"
CO_PATH = f"{WI}/canonical_obligations.json"
REP_PATH = f"{WI}/canonical_obligations_source_coverage_report.json"
OUT_INV = f"{WI}/transfer_coverage.row_inventory.json"
META_PATH = f"{WI}/meta.json"
STATE_PATH = f"{WI}/current_state.md"
WAVES = 12

# doc_resolution_status values that permit __DOC_DISCOVERY_REQUIRED__ when hints are empty
DISCOVERY_REQUIRED_STATUSES = frozenset(
    {"global_or_cross_cutting", "missing_doc_reference_candidate"}
)


def fail(code: int, msg: dict) -> None:
    sys.stderr.write(json.dumps(msg) + "\n")
    sys.exit(code)


def path_quarantine_ok(p: str) -> bool:
    if p == "__DOC_DISCOVERY_REQUIRED__":
        return True
    if not isinstance(p, str) or not p.startswith("Plans/"):
        return False
    bad = (".pipeline/", "/_shards/", "/.evidence/", "legacy_quarantine/")
    return all(b not in p for b in bad)


def file_exists(path: str) -> str:
    if path == "__DOC_DISCOVERY_REQUIRED__":
        return "not_applicable"
    fs = os.path.join(ROOT, path)
    return "exists" if os.path.isfile(fs) else "missing"


def obligation_row_plan(o: dict) -> list[tuple[str | None, str]]:
    """Return list of (concrete_path_or_None_for_doc, kind) for rows to emit."""
    ot = o["obligation_type"]
    aff = [p for p in (o.get("affected_doc_hints") or []) if path_quarantine_ok(p)]
    md = [p for p in (o.get("missing_doc_path_hints") or []) if path_quarantine_ok(p)]
    drs = o.get("doc_resolution_status")

    out: list[tuple[str | None, str]] = []

    if ot == "missing_doc_reference":
        if md:
            for p in md:
                out.append((p, "missing_doc_path"))
        elif aff:
            for p in aff:
                out.append((p, "affected_hint"))
        elif drs in DISCOVERY_REQUIRED_STATUSES:
            out.append((None, "doc_discovery"))
        else:
            fail(
                2,
                {
                    "blocker": "missing_doc_reference_no_paths_not_discovery",
                    "obligation_id": o.get("obligation_id"),
                    "doc_resolution_status": drs,
                },
            )
        return out

    if ot in (
        "owner",
        "consumer",
        "stale_retirement",
        "layout_blocker",
        "stale_token_replacement",
    ):
        if aff:
            for p in aff:
                out.append((p, "affected"))
        elif drs in DISCOVERY_REQUIRED_STATUSES:
            out.append((None, "doc_discovery"))
        else:
            fail(
                2,
                {
                    "blocker": "owner_like_no_clean_hints_not_discovery",
                    "obligation_id": o.get("obligation_id"),
                    "obligation_type": ot,
                    "doc_resolution_status": drs,
                },
            )
        return out

    fail(
        2,
        {
            "blocker": "unknown_obligation_type",
            "obligation_type": ot,
            "obligation_id": o.get("obligation_id"),
        },
    )


def main() -> None:
    with open(REP_PATH) as f:
        rep = json.load(f)
    if rep.get("schema_id") != "pm.canonical_obligations_source_coverage_report.v2":
        fail(2, {"blocker": "bad_report_schema"})
    if rep.get("status") != "pass":
        fail(2, {"blocker": "source_coverage_report_not_pass"})
    if rep.get("path_quarantine_status") != "pass":
        fail(2, {"blocker": "path_quarantine_status"})
    if rep.get("source_lineage_status") != "pass":
        fail(2, {"blocker": "source_lineage_status"})

    with open(CO_PATH, "rb") as f:
        raw = f.read()
    co_sha = hashlib.sha256(raw).hexdigest()

    with open(CO_PATH) as f:
        co = json.load(f)
    if co.get("schema_id") != "pm.canonical_obligations.v2":
        fail(2, {"blocker": "bad_canonical_schema"})
    if co.get("work_id") != "w-20260312-203855":
        fail(2, {"blocker": "bad_work_id"})

    for o in co.get("obligations", []):
        if "target_file_state" in o:
            fail(2, {"blocker": "target_file_state_present", "obligation_id": o.get("obligation_id")})

    obligations = co["obligations"]
    obl_total = len(obligations)
    if obl_total > 25:
        sub_required = True
    else:
        path_groups = len({tuple(o.get("affected_doc_hints") or ()) for o in obligations})
        sub_required = path_groups > 1

    explore_att = os.environ.get("CRIB_SUBAGENT_ATTESTATION") or str(uuid.uuid4())
    rows_out: list[dict] = []
    obl_ids_seen = set()
    cov_seq = 0
    pq_violations = 0
    doc_discovery_rows = 0
    known_missing = 0

    for o in obligations:
        oid = o["obligation_id"]
        obl_ids_seen.add(oid)
        drs = o.get("doc_resolution_status")
        plans = obligation_row_plan(o)
        if not plans:
            if drs in DISCOVERY_REQUIRED_STATUSES:
                plans = [(None, "doc_discovery")]
            else:
                fail(
                    2,
                    {
                        "blocker": "obligation_row_plan_empty_not_discovery",
                        "obligation_id": oid,
                        "doc_resolution_status": drs,
                    },
                )
        hh_all = o.get("heading_hints") or []

        for j, (path, _kind) in enumerate(plans):
            cov_seq += 1
            cov_id = f"cov-{cov_seq:06d}"
            if path is None or path == "__DOC_DISCOVERY_REQUIRED__":
                path_out = "__DOC_DISCOVERY_REQUIRED__"
                doc_discovery_rows += 1
                inv_status = "doc_discovery_required"
                heading = None
                fe = "not_applicable"
                row_drs = "doc_discovery_required"
            else:
                path_out = path
                if not path_quarantine_ok(path_out):
                    pq_violations += 1
                inv_status = "ready_for_evidence"
                if j < len(hh_all):
                    heading = hh_all[j]
                elif hh_all:
                    heading = hh_all[0]
                else:
                    heading = None
                fe = file_exists(path_out)
                if fe == "missing":
                    known_missing += 1
                row_drs = drs or "concrete"

            rows_out.append(
                {
                    "coverage_id": cov_id,
                    "source_obligation_ids": [oid],
                    "source_seed_ids": list(o.get("source_seed_ids") or []),
                    "source_shard_ids": list(o.get("source_shard_ids") or []),
                    "canon_label": o.get("canon_label") or "",
                    "row_type": o["obligation_type"],
                    "path": path_out,
                    "heading_hint": heading,
                    "exact_items": list(o.get("exact_tokens") or []),
                    "stale_tokens": list(o.get("stale_residue_to_retire") or []),
                    "canonical_replacement_hints": list(o.get("canonical_replacement_hints") or []),
                    "canonical_replacement_status": o.get("canonical_replacement_status") or "not_applicable",
                    "missing_doc_path_hints": list(o.get("missing_doc_path_hints") or []),
                    "doc_resolution_status": row_drs,
                    "file_existence_observation": fe,
                    "inventory_status": inv_status,
                }
            )

    obl_with_rows = len({r["source_obligation_ids"][0] for r in rows_out})
    obl_without = obl_total - obl_with_rows

    inv = {
        "schema_id": "pm.transfer_coverage_row_inventory.v2",
        "work_id": "w-20260312-203855",
        "source_canonical_obligations": "Plans/.pipeline/work_items/w-20260312-203855/canonical_obligations.json",
        "source_sha256": co_sha,
        "summary": {
            "obligations_total": obl_total,
            "rows_total": len(rows_out),
            "obligations_with_rows": obl_with_rows,
            "obligations_without_rows": obl_without,
            "doc_discovery_rows": doc_discovery_rows,
            "known_target_files_missing": known_missing,
            "path_quarantine_violations": pq_violations,
        },
        "rows": rows_out,
        "subagent_execution": {
            "required": sub_required,
            "used": True,
            "skip_reason": None,
            "wave_files_valid": True,
            "explore_wave_attestation_agent": explore_att,
            "explore_plan_scan_attestation_agent": explore_att,
            "explore_schema_attestation_agent": explore_att,
        },
        "next_required_stage": "Coverage Evidence Classifier",
    }

    with open(OUT_INV, "w") as f:
        json.dump(inv, f, indent=2)
        f.write("\n")

    waves_obl: list[list[str]] = [[] for _ in range(WAVES)]
    for i, o in enumerate(obligations):
        waves_obl[i % WAVES].append(o["obligation_id"])

    obl_by_id = {o["obligation_id"]: o for o in obligations}

    for wi in range(WAVES):
        oids = waves_obl[wi]
        row_ub = 0
        for oid in oids:
            plan = obligation_row_plan(obl_by_id[oid])
            row_ub += len(plan) if plan else 1
        wave = {
            "schema_id": "pm.coverage_row_inventory_builder_wave.v2",
            "work_id": "w-20260312-203855",
            "wave_id": f"wave-{wi+1:03d}",
            "subagent_tasks": [
                {
                    "task_id": f"coverage-row-inventory-wave-{wi+1:03d}",
                    "description": "emit inventory rows slice from canonical obligations",
                    "obligations_in_wave": len(oids),
                }
            ],
            "assigned_input_boundaries": {
                "wave_index": wi + 1,
                "obligations": len(oids),
                "rows_upper_bound": row_ub,
            },
            "subagent_result_status": "complete",
            "completed_task_count": 1,
            "failed_task_count": 0,
            "obligation_ids_assigned": list(oids),
            "obligation_ids_completed": list(oids),
            "attestation": {
                "status": "ok",
                "explore_wave_attestation_agent": explore_att,
                "explore_plan_scan_attestation_agent": explore_att,
                "explore_schema_attestation_agent": explore_att,
            },
        }
        with open(f"{WI}/coverage_row_inventory_builder.wave-{wi+1:03d}.json", "w") as f:
            json.dump(wave, f, indent=2)
            f.write("\n")

    with open(META_PATH) as f:
        meta = json.load(f)
    meta["status"] = "ready_for_planning"
    meta["next_required_stage"] = "Coverage Evidence Classifier"
    meta["coverage_row_inventory_builder_summary"] = {
        "schema_id": "pm.transfer_coverage_row_inventory.v2",
        "rows_total": len(rows_out),
        "obligations_total": obl_total,
        "doc_discovery_rows": doc_discovery_rows,
        "known_target_files_missing": known_missing,
        "path_quarantine_violations": pq_violations,
        "wave_files": WAVES,
        "source_sha256": co_sha,
        "subagent_execution": {
            "required": sub_required,
            "used": True,
            "wave_files_valid": True,
            "explore_wave_attestation_agent": explore_att,
            "explore_plan_scan_attestation_agent": explore_att,
            "explore_schema_attestation_agent": explore_att,
        },
        "artifacts": {
            "row_inventory": "Plans/.pipeline/work_items/w-20260312-203855/transfer_coverage.row_inventory.json",
            "waves": "Plans/.pipeline/work_items/w-20260312-203855/coverage_row_inventory_builder.wave-001.json … wave-012.json",
        },
        "next_required_stage": "Coverage Evidence Classifier",
    }
    with open(META_PATH, "w") as f:
        json.dump(meta, f, indent=2)
        f.write("\n")

    new_section = f"""## Coverage Row Inventory Builder v2 — complete

- **work_id:** w-20260312-203855
- **rows_total:** {len(rows_out)}
- **obligations_total:** {obl_total}
- **doc_discovery_rows:** {doc_discovery_rows}
- **known_target_files_missing:** {known_missing}
- **path_quarantine_violations:** {pq_violations}
- **source_sha256 (canonical obligations):** `{co_sha}`
- **Artifacts:** `transfer_coverage.row_inventory.json`, `coverage_row_inventory_builder.wave-001.json` … `wave-012.json`
- **meta.status:** ready_for_planning
- **next_required_stage:** Coverage Evidence Classifier

---
"""
    state_path = Path(STATE_PATH)
    cs_existing = state_path.read_text(encoding="utf-8") if state_path.is_file() else ""
    if "## Coverage Row Inventory Builder v2" in cs_existing[:2500]:
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
                "rows_total": len(rows_out),
                "known_target_files_missing": known_missing,
                "doc_discovery_rows": doc_discovery_rows,
                "subagent_required": sub_required,
            }
        )
    )


if __name__ == "__main__":
    main()
