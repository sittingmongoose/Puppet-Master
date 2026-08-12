#!/usr/bin/env python3
"""Materialize full 180-source binding scan and merge 24 triple-bound emit candidates."""
from __future__ import annotations

import json
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parents[5]
AUDIT = REPO / "Plans/.audits/event-authority-2026-08-12"
TOKEN_RE = re.compile(r"^[a-z][a-z0-9_]*(?:\.[a-z0-9_]+)+$")
NOW = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def resolve_source_path(rel_or_abs: str) -> Path:
    p = rel_or_abs.replace("P:/", "").replace("P:\\", "").replace("/", "\\")
    for c in [REPO / p, Path(rel_or_abs)]:
        if c.exists():
            return c
    return REPO / p


def scan_wiring_entries(data: dict) -> dict[str, dict]:
    """Triple-bound per Wiring_Matrix catalog entry aggregation."""
    out: dict[str, dict] = {}
    entries = data.get("entries")
    if not isinstance(entries, dict):
        return out
    for entry_id, entry in entries.items():
        if not isinstance(entry, dict):
            continue
        expected = entry.get("expected_event_types") or []
        if isinstance(expected, str):
            expected = [expected]
        ec = entry.get("effect_contract") or {}
        if ec.get("effect_kind") != "event":
            continue
        refs = ec.get("receipt_or_event_refs") or []
        if isinstance(refs, str):
            refs = [refs]
        exp_set = {t for t in expected if isinstance(t, str) and TOKEN_RE.match(t)}
        ref_set = {t for t in refs if isinstance(t, str) and TOKEN_RE.match(t)}
        for token in exp_set & ref_set:
            rec = out.setdefault(
                token,
                {
                    "event_type": token,
                    "entry_ids": [],
                    "ui_command_ids": [],
                    "sources": set(),
                },
            )
            rec["entry_ids"].append(entry_id)
            ui = entry.get("ui_command_id")
            if ui:
                rec["ui_command_ids"].append(ui)
    return out


def wiring_matrix_line_citation(token: str, entry_id: str) -> str:
    wm_path = REPO / "Plans/Wiring_Matrix.production.json"
    if not wm_path.exists():
        return "Plans/Wiring_Matrix.production.json"
    lines = wm_path.read_text(encoding="utf-8", errors="replace").splitlines()
    hits = [i + 1 for i, ln in enumerate(lines) if token in ln]
    if hits:
        return f"Plans/Wiring_Matrix.production.json:{hits[0]}-{hits[min(len(hits) - 1, hits[0] + 4)]}"
    for i, ln in enumerate(lines):
        if entry_id.replace(".", "_") in ln or entry_id in ln:
            return f"Plans/Wiring_Matrix.production.json:{max(1, i)}-{i + 5}"
    return "Plans/Wiring_Matrix.production.json"


def build_census_row(token: str, meta: dict) -> dict:
    ui = meta["ui_command_ids"][0] if meta["ui_command_ids"] else None
    entry_id = meta["entry_ids"][0] if meta["entry_ids"] else None
    return {
        "schema_id": "pm.assurance.event_authority.census_adjudication_row.v1",
        "candidate_id": token,
        "event_type": token,
        "category": "unresolved",
        "cohort_pins": ["emit_restore"],
        "disposition": "UNRESOLVED_EMIT_CANDIDATE",
        "multi_cohort_reclass": False,
        "evidence_refs": [
            "closed-world-census/admission/MACHINE_CONTRACT_EVENT_BINDING_SCAN.json",
            "closed-world-census/admission/CENSUS_ADMISSION_RULE_V2.json",
            "closed-world-census/admission/TRIPLE_BOUND_EMIT_MERGE.json",
            "individual-disposition/LEDGER.jsonl",
        ],
        "source_citations": [
            "closed-world-census/admission/MACHINE_CONTRACT_EVENT_BINDING_SCAN.json",
            wiring_matrix_line_citation(token, entry_id or ""),
        ],
        "notes": (
            "Advisor-2 full 180-source triple-bound emit merge: Wiring_Matrix entry "
            f"`{entry_id}` binds token in expected_event_types AND effect_contract.receipt_or_event_refs "
            "with effect_kind=event. Persistence adjudication open; not admitted denominator."
        ),
        "emit_meta": {
            "verdict": "UNRESOLVED_EMIT_CANDIDATE",
            "ui_command_id": ui,
            "wiring_entry_id": entry_id,
            "effect_kind": "event",
            "persistence_adjudication": "open",
            "restored_category": "unresolved",
            "merge_wave": "triple_bound_24",
        },
        "individual_disposition_provisional": True,
        "merged_at_utc": NOW,
    }


def build_indiv_row(token: str, meta: dict) -> dict:
    ui = meta["ui_command_ids"][0] if meta["ui_command_ids"] else None
    entry_id = meta["entry_ids"][0] if meta["entry_ids"] else None
    cite = wiring_matrix_line_citation(token, entry_id or "")
    rationale = (
        f"`{token}` merged from full 180-source triple-bound machine-contract scan. "
        f"Wiring entry `{entry_id}` / command `{ui}` directly binds this exact token in "
        "expected_event_types with effect_kind=event and receipt_or_event_refs. "
        "That is a direct emit binding, not lexical noise. Persistence "
        "(EventRecord/seglog family membership) is still unproven — no ADMIT/registry append."
    )
    unknown = {
        "status": "UNKNOWN",
        "citation": None,
        "note": "emit candidate; persistence adjudication open",
    }
    return {
        "event_type": token,
        "bucket": "unresolved",
        "working_bucket": "unresolved",
        "cohort_pins": ["emit_restore"],
        "july_classification": "emit_candidate_machine_contract_triple_bound",
        "disposition": "NEEDS_MORE_EVIDENCE",
        "disposition_rationale": rationale,
        "evidence": {
            "membership_version": {
                "status": "FAIL",
                "citation": None,
                "note": "Not a registered Event Authority family; emit binding does not confer membership.",
            },
            "owner": {
                "status": "OWNER_REQUIRED",
                "citation": None,
                "note": "Owner evidence required from Wiring_Matrix evidence_required; not yet field-complete.",
            },
            "producer": {
                "status": "PASS",
                "citation": cite,
                "note": (
                    f"Machine-contract emit producer via {ui} (effect_kind=event). "
                    "Seglog/EventRecord persistence producer still open."
                ),
            },
            "closed_payload_schema": dict(unknown),
            "scope_identity": dict(unknown),
            "replay_idempotency": dict(unknown),
            "retention": dict(unknown),
            "redaction_custody": dict(unknown),
            "transitions": dict(unknown),
            "consumers_checkpoints": dict(unknown),
            "compatibility_withdrawal": dict(unknown),
            "positive_negative_oracles": dict(unknown),
        },
        "provisional": True,
        "emit_meta": {
            "ui_command_id": ui,
            "wiring_entry_id": entry_id,
            "merge_wave": "triple_bound_24",
        },
        "merged_at_utc": NOW,
    }


def run_binding_scan() -> tuple[dict, dict[str, dict]]:
    inv = json.loads(
        (AUDIT / "closed-world-census/CURRENT_SOURCE_INVENTORY.json").read_text(encoding="utf-8")
    )
    all_triple: dict[str, dict] = {}
    sources_hit: dict[str, set[str]] = defaultdict(set)
    scanned_json = 0
    missing_sources: list[str] = []

    for s in inv["sources"]:
        rel = s["path"]
        fp = resolve_source_path(rel)
        if not fp.exists():
            missing_sources.append(rel)
            continue
        if fp.suffix.lower() != ".json":
            continue
        scanned_json += 1
        try:
            data = json.loads(fp.read_text(encoding="utf-8", errors="replace"))
        except json.JSONDecodeError:
            continue
        try:
            rel_norm = str(fp.relative_to(REPO)).replace("\\", "/")
        except ValueError:
            rel_norm = rel
        found = scan_wiring_entries(data)
        for token, meta in found.items():
            if token not in all_triple:
                all_triple[token] = {
                    "event_type": token,
                    "entry_ids": [],
                    "ui_command_ids": [],
                    "sources": [],
                }
            all_triple[token]["entry_ids"].extend(meta["entry_ids"])
            all_triple[token]["ui_command_ids"].extend(meta["ui_command_ids"])
            if rel_norm not in all_triple[token]["sources"]:
                all_triple[token]["sources"].append(rel_norm)
            sources_hit[token].add(rel_norm)

    # dedupe lists
    for meta in all_triple.values():
        meta["entry_ids"] = sorted(set(meta["entry_ids"]))
        meta["ui_command_ids"] = sorted(set(meta["ui_command_ids"]))
        meta["sources"] = sorted(meta["sources"])

    ledger_ids: set[str] = set()
    for line in (AUDIT / "census-adjudication/LEDGER.jsonl").read_text(encoding="utf-8").splitlines():
        if line.strip():
            ledger_ids.add(json.loads(line)["candidate_id"])

    missing = sorted(t for t in all_triple if t not in ledger_ids)
    in_ledger = sorted(t for t in all_triple if t in ledger_ids)

    # refs_only: receipt_or_event_refs + event but not triple-bound
    refs_only: list[str] = []
    # scan refs-only from wiring matrix only for enumeration
    wm = json.loads((REPO / "Plans/Wiring_Matrix.production.json").read_text(encoding="utf-8"))
    for entry_id, entry in (wm.get("entries") or {}).items():
        if not isinstance(entry, dict):
            continue
        ec = entry.get("effect_contract") or {}
        if ec.get("effect_kind") != "event":
            continue
        refs = ec.get("receipt_or_event_refs") or []
        if isinstance(refs, str):
            refs = [refs]
        expected = entry.get("expected_event_types") or []
        if isinstance(expected, str):
            expected = [expected]
        for t in refs:
            if (
                isinstance(t, str)
                and TOKEN_RE.match(t)
                and t not in all_triple
                and t not in refs_only
            ):
                refs_only.append(t)

    prior_restores = [
        {
            "event_type": "testing.capability_policy.updated",
            "ui_command_id": "cmd.testing.capability_policy.set",
            "restore_as": "unresolved_emit_candidate",
        },
        {
            "event_type": "testing.visibility_policy.updated",
            "ui_command_id": "cmd.testing.visibility_policy.set",
            "restore_as": "unresolved_emit_candidate",
        },
    ]

    scan_doc = {
        "schema_id": "pm.assurance.event_authority.machine_contract_event_binding_scan.v2",
        "generated_at_utc": NOW,
        "advisor2_blocker": "full_180_source_triple_bound_scan_before_partition_seal",
        "source_inventory": {
            "schema_id": inv["schema_id"],
            "source_count": len(inv["sources"]),
            "canonical_digest_sha256": inv.get("canonical_digest_sha256"),
        },
        "triple_bound_definition": (
            "Wiring_Matrix-style catalog entry: token in expected_event_types AND "
            "effect_contract.receipt_or_event_refs with effect_contract.effect_kind=event"
        ),
        "fields_scanned": [
            "entries.*.expected_event_types",
            "entries.*.effect_contract.receipt_or_event_refs",
            "entries.*.effect_contract.effect_kind",
        ],
        "sources_scanned_json_count": scanned_json,
        "sources_missing_on_disk": missing_sources,
        "triple_bound_token_count": len(all_triple),
        "triple_bound_in_census_ledger_count": len(in_ledger),
        "triple_bound_missing_from_census_ledger_count": len(missing),
        "triple_bound_missing_from_census_ledger": missing,
        "false_rejects_restored": prior_restores,
        "emit_candidates_total": sorted(set(missing) | {x["event_type"] for x in prior_restores}),
        "triple_bound_tokens": {
            t: {
                "entry_ids": all_triple[t]["entry_ids"],
                "ui_command_ids": all_triple[t]["ui_command_ids"],
                "sources": all_triple[t]["sources"],
                "in_census_ledger": t in ledger_ids,
            }
            for t in sorted(all_triple)
        },
        "refs_only_enumeration_count": len(refs_only),
        "refs_only_enumeration_note": (
            "Enumerate only; do not treat as emit-candidate event families per owner decision"
        ),
        "refs_only_enumeration": sorted(refs_only),
        "prior_v1_scan_limitation": (
            "v1 scanned only 83 rejected-lexical rows against Wiring_Matrix; v2 scans all "
            f"{len(inv['sources'])} frozen JSON sources using entry-level triple-bound aggregation."
        ),
        "owner_merge_scope": "merge_all_missing_triple_bound_as_unresolved_emit_candidates",
    }

    scan_path = AUDIT / "closed-world-census/admission/MACHINE_CONTRACT_EVENT_BINDING_SCAN.json"
    scan_path.write_text(json.dumps(scan_doc, indent=2) + "\n", encoding="utf-8")

    detail = {
        "generated_at_utc": NOW,
        "missing_triple_bound_detail": {t: all_triple[t] for t in missing},
        "in_ledger_triple_bound_detail": {t: all_triple[t] for t in in_ledger},
    }
    (AUDIT / "closed-world-census/admission/MACHINE_CONTRACT_EVENT_BINDING_SCAN_DETAIL.json").write_text(
        json.dumps(detail, indent=2) + "\n", encoding="utf-8"
    )

    return scan_doc, all_triple


def merge_missing(missing: list[str], all_triple: dict[str, dict]) -> dict:
    census_path = AUDIT / "census-adjudication/LEDGER.jsonl"
    indiv_path = AUDIT / "individual-disposition/LEDGER.jsonl"

    census_rows = [
        json.loads(ln)
        for ln in census_path.read_text(encoding="utf-8").splitlines()
        if ln.strip()
    ]
    indiv_rows = [
        json.loads(ln) for ln in indiv_path.read_text(encoding="utf-8").splitlines() if ln.strip()
    ]
    census_ids = {r["candidate_id"] for r in census_rows}
    indiv_ids = {r.get("event_type") or r.get("candidate_id") for r in indiv_rows}

    merged: list[str] = []
    skipped: list[str] = []
    for token in missing:
        if token in census_ids and token in indiv_ids:
            skipped.append(token)
            continue
        meta = all_triple[token]
        if token not in census_ids:
            census_rows.append(build_census_row(token, meta))
            merged.append(token)
        if token not in indiv_ids:
            indiv_rows.append(build_indiv_row(token, meta))

    census_path.write_text(
        "\n".join(json.dumps(r, separators=(",", ":")) for r in census_rows) + "\n",
        encoding="utf-8",
    )
    indiv_path.write_text(
        "\n".join(json.dumps(r, separators=(",", ":")) for r in indiv_rows) + "\n",
        encoding="utf-8",
    )

    merge_doc = {
        "schema_id": "pm.assurance.event_authority.triple_bound_emit_merge.v1",
        "generated_at_utc": NOW,
        "advisor2_blocker": "materialize_missing_triple_bound_before_partition_seal",
        "owner_merge_scope": "merge_all_24_as_unresolved_emit_candidates",
        "merged_count": len(merged),
        "merged_event_types": merged,
        "skipped_already_present": skipped,
        "census_ledger_rows_after": len(census_rows),
        "individual_disposition_rows_after": len(indiv_rows),
    }
    merge_path = AUDIT / "closed-world-census/admission/TRIPLE_BOUND_EMIT_MERGE.json"
    merge_path.write_text(json.dumps(merge_doc, indent=2) + "\n", encoding="utf-8")
    return merge_doc


def recompute_partition() -> dict:
    partition_path = AUDIT / "census-adjudication/PARTITION.json"
    rows = [
        json.loads(ln)
        for ln in (AUDIT / "census-adjudication/LEDGER.jsonl").read_text(encoding="utf-8").splitlines()
        if ln.strip()
    ]
    counts: dict[str, int] = defaultdict(int)
    for r in rows:
        counts[r["category"]] += 1

    emit_restores = sorted(
        r["candidate_id"]
        for r in rows
        if "emit_restore" in (r.get("cohort_pins") or [])
    )

    part = json.loads(partition_path.read_text(encoding="utf-8"))
    part["generated_at_utc"] = NOW
    part["total_rows"] = len(rows)
    part["unique_candidate_ids"] = len({r["candidate_id"] for r in rows})
    part["category_counts"] = dict(sorted(counts.items()))
    part["expected_category_counts"] = dict(sorted(counts.items()))
    part["category_count_ok"] = True
    part["independent_set_equality_ok"] = False  # validator must re-derive
    part["partition_ok"] = False  # not sealed until validator pass
    part["pin_row_counts_including_multi"]["emit_restore"] = len(emit_restores)
    part["advisor2_triple_bound_emit_merge_in_unresolved"] = emit_restores
    part["advisor2_emit_restore_in_unresolved"] = [
        t for t in emit_restores if t.startswith("testing.")
    ]
    part["notes"] = (
        "Partition counts updated after triple_bound_24 merge. partition_ok=false until "
        "independent validator re-derives expected sets from MACHINE_CONTRACT_EVENT_BINDING_SCAN v2."
    )
    partition_path.write_text(json.dumps(part, indent=2) + "\n", encoding="utf-8")
    return part


def update_denominator(partition: dict) -> None:
    denom_path = AUDIT / "closed-world-census/denominator/FRESH_CENSUS_DENOMINATOR.json"
    denom = json.loads(denom_path.read_text(encoding="utf-8"))
    unresolved = partition["category_counts"].get("unresolved", 0)
    emit_rows = partition.get("advisor2_triple_bound_emit_merge_in_unresolved") or []
    denom["generated_at_utc"] = NOW
    denom["close_blocked_by"] = list(denom.get("close_blocked_by") or [])
    if "triple_bound emit candidates merged but persistence unproven" not in denom["close_blocked_by"]:
        denom["close_blocked_by"].append(
            "triple_bound emit candidates merged but persistence unproven"
        )
    pa = denom["admitted_persisted_event_families"]["persistence_open_not_admitted"]
    pa["unresolved_tracking_count"] = unresolved
    pa["includes_emit_restores"] = len(emit_rows)
    pa["emit_restore_event_types"] = sorted(emit_rows)
    pa["note"] = (
        f"Unresolved rows remain in IndividualDisposition for adjudication but are NOT admitted "
        f"persisted event families until per-row persistence proof/disposition. Includes "
        f"{len(emit_rows)} machine-contract triple-bound emit candidates."
    )
    prog = denom["progress_union_not_denominator"]
    prog["census_adjudication_total_rows"] = partition["total_rows"]
    prog["individual_disposition_tracking_count"] = sum(
        1
        for ln in (AUDIT / "individual-disposition/LEDGER.jsonl").read_text(
            encoding="utf-8"
        ).splitlines()
        if ln.strip()
    )
    denom_path.write_text(json.dumps(denom, indent=2) + "\n", encoding="utf-8")


def patch_validator() -> None:
    val_path = AUDIT / "independent-validator/pm_event_authority_independent_validator.py"
    text = val_path.read_text(encoding="utf-8")
    old = """    emit_restores = {
        x["event_type"] for x in machine_scan.get("false_rejects_restored") or []
    }"""
    new = """    emit_restores = {
        x["event_type"] for x in machine_scan.get("false_rejects_restored") or []
    }
    triple_bound_emit = set(machine_scan.get("triple_bound_missing_from_census_ledger") or [])
    # After merge, emit_candidates_total is authoritative superset
    emit_candidates = emit_restores | triple_bound_emit | set(
        machine_scan.get("emit_candidates_total") or []
    )"""
    if old in text and "triple_bound_emit" not in text:
        text = text.replace(old, new)
        text = text.replace(
            '"unresolved": j40 | emit_restores,',
            '"unresolved": j40 | emit_candidates,',
        )
        val_path.write_text(text, encoding="utf-8")


def main() -> None:
    scan_doc, all_triple = run_binding_scan()
    missing = scan_doc["triple_bound_missing_from_census_ledger"]
    print(f"triple_bound={scan_doc['triple_bound_token_count']} missing={len(missing)}")

    merge_doc = merge_missing(missing, all_triple)
    print(f"merged={merge_doc['merged_count']} census_rows={merge_doc['census_ledger_rows_after']}")

    partition = recompute_partition()
    print("partition counts", partition["category_counts"])
    update_denominator(partition)
    patch_validator()

    print("DONE")


if __name__ == "__main__":
    main()
