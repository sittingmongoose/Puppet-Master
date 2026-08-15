#!/usr/bin/env python3
"""Build and validate the Remaining Runtime Integration v2 disposition.

This is a canon-custody register.  It separates accepted specification closure
from implementation truth, which remains not_started for every row.  It does
not create WorkNodes, admit events, update PNC-019, or certify runtime behavior.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]
REGISTER_PATH = ROOT / "Plans/runtime_integration_disposition.json"
SCHEMA_PATH = ROOT / "Plans/runtime_integration_disposition.schema.json"
CLOSED_AT = "2026-08-14T00:00:00Z"

CANON_REPAIR_IDS = {
    "SET-012", "SET-013", "PROV-002", "PROV-007", "PROV-010", "PROV-011",
    "PROV-012", "PROV-017", "PROV-022", "CTX-001", "CTX-013", "CTX-016",
    "AGT-003", "AGT-009", "AGT-010", "AGT-011", "AGT-012", "AGT-014",
    "AGT-016", "AGT-020", "CHAT-018", "CHAT-019", "CHAT-020", "PRM-001",
    "PRM-004", "PROC-008", "MGR-020", "ONB-001", "ONB-004", "ONB-005",
    "ONB-011", "ONB-012", "ONB-013", "ONB-018", "ONB-019", "ONB-020",
    "ONB-022", "ONB-023", "ONB-024", "ONB-025", "ONB-026",
}

IMPLEMENTATION_ONLY_IDS = {
    "AGT-002", "AGT-006", "AGT-007", "AGT-008", "AGT-015", "AGT-017",
    "CHAT-016", "CHAT-017",
}

# Primary owner and exact accepted PlanUnit/heading for the 49 audited rows.
AUDITED_OWNER_ANCHORS: dict[str, tuple[str, str, str]] = {
    "SET-012": ("Plans/FinalGUISpec.md", "F3-510", "plan_unit"),
    "SET-013": ("Plans/FinalGUISpec.md", "F3-511", "plan_unit"),
    "PROV-002": ("Plans/CLI_Bridged_Providers.md", "CBP-029", "plan_unit"),
    "PROV-007": ("Plans/Shared_Integration_Runtime.md", "SIR-003", "plan_unit"),
    "PROV-010": ("Plans/Shared_Integration_Runtime.md", "SIR-003", "plan_unit"),
    "PROV-011": ("Plans/CLI_Bridged_Providers.md", "CBP-029", "plan_unit"),
    "PROV-012": ("Plans/Shared_Integration_Runtime.md", "SIR-003", "plan_unit"),
    "PROV-017": ("Plans/Models_System.md", "MS-137", "plan_unit"),
    "PROV-022": ("Plans/Models_System.md", "MS-137", "plan_unit"),
    "CTX-001": ("Plans/Prompt_Pipeline.md", "PP-082", "plan_unit"),
    "CTX-013": ("Plans/Personas.md", "P-056", "plan_unit"),
    "CTX-016": ("Plans/Prompt_Pipeline.md", "PP-082", "plan_unit"),
    "AGT-002": ("Plans/Goal_Runtime_System.md", "GRS-044", "plan_unit"),
    "AGT-003": ("Plans/Goal_Runtime_System.md", "GRS-046", "plan_unit"),
    "AGT-006": ("Plans/orchestrator-subagent-integration.md", "OSI-434", "plan_unit"),
    "AGT-007": ("Plans/orchestrator-subagent-integration.md", "OSI-434", "plan_unit"),
    "AGT-008": ("Plans/orchestrator-subagent-integration.md", "OSI-434", "plan_unit"),
    "AGT-009": ("Plans/orchestrator-subagent-integration.md", "OSI-435", "plan_unit"),
    "AGT-010": ("Plans/orchestrator-subagent-integration.md", "OSI-435", "plan_unit"),
    "AGT-011": ("Plans/orchestrator-subagent-integration.md", "OSI-435", "plan_unit"),
    "AGT-012": ("Plans/assistant-chat-design.md", "ACD-447", "plan_unit"),
    "AGT-014": ("Plans/Shared_Integration_Runtime.md", "SIR-007", "plan_unit"),
    "AGT-015": ("Plans/WorktreeGitImprovement.md", "W-080", "plan_unit"),
    "AGT-016": ("Plans/Shared_Integration_Runtime.md", "SIR-007", "plan_unit"),
    "AGT-017": ("Plans/Automated_Testing_System.md", "ATS-032", "plan_unit"),
    "AGT-020": ("Plans/Shared_Integration_Runtime.md", "SIR-010", "plan_unit"),
    "CHAT-016": ("Plans/assistant-chat-design.md", "ACD-445", "plan_unit"),
    "CHAT-017": ("Plans/assistant-chat-design.md", "ACD-445", "plan_unit"),
    "CHAT-018": ("Plans/assistant-chat-design.md", "ACD-447", "plan_unit"),
    "CHAT-019": ("Plans/assistant-chat-design.md", "ACD-447", "plan_unit"),
    "CHAT-020": ("Plans/assistant-chat-design.md", "ACD-447", "plan_unit"),
    "PRM-001": ("Plans/Prompt_Pipeline.md", "PP-082", "plan_unit"),
    "PRM-004": ("Plans/Prompt_Pipeline.md", "PP-082", "plan_unit"),
    "PROC-008": (
        "Plans/00-plans-index.md",
        "Remaining Runtime supersession register (PROC-008, 2026-08-14)",
        "heading",
    ),
    "MGR-020": ("Plans/MiscPlan.md", "M-084", "plan_unit"),
    "ONB-001": ("Plans/Section15_MVP_Promoted_Features_Spec.md", "SMPFS-146", "plan_unit"),
    "ONB-004": ("Plans/Section15_MVP_Promoted_Features_Spec.md", "SMPFS-146", "plan_unit"),
    "ONB-005": ("Plans/Section15_MVP_Promoted_Features_Spec.md", "SMPFS-146", "plan_unit"),
    "ONB-011": ("Plans/Section15_MVP_Promoted_Features_Spec.md", "SMPFS-146", "plan_unit"),
    "ONB-012": ("Plans/Section15_MVP_Promoted_Features_Spec.md", "SMPFS-146", "plan_unit"),
    "ONB-013": ("Plans/Section15_MVP_Promoted_Features_Spec.md", "SMPFS-146", "plan_unit"),
    "ONB-018": ("Plans/newtools.md", "N2-151", "plan_unit"),
    "ONB-019": ("Plans/newtools.md", "N2-151", "plan_unit"),
    "ONB-020": ("Plans/newtools.md", "N2-151", "plan_unit"),
    "ONB-022": ("Plans/newtools.md", "N2-151", "plan_unit"),
    "ONB-023": ("Plans/newtools.md", "N2-151", "plan_unit"),
    "ONB-024": ("Plans/newtools.md", "N2-151", "plan_unit"),
    "ONB-025": ("Plans/newtools.md", "N2-151", "plan_unit"),
    "ONB-026": ("Plans/newtools.md", "N2-151", "plan_unit"),
}


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def file_sha256(relative_path: str) -> str:
    path = ROOT / relative_path.split("#", 1)[0]
    return hashlib.sha256(path.read_bytes()).hexdigest()


def anchor(path: str, identity: str, kind: str) -> dict[str, str]:
    plain_path = path.split("#", 1)[0]
    return {
        "path": plain_path,
        "anchor_or_plan_unit_id": identity,
        "anchor_kind": kind,
        "owner_file_sha256": file_sha256(plain_path),
    }


def classify_legacy_anchor(path: str, identity: str) -> tuple[str, str]:
    plain_path = path.split("#", 1)[0]
    text = (ROOT / plain_path).read_text(encoding="utf-8")
    if f"plan_unit_id: {identity}" in text:
        return identity, "plan_unit"
    if identity in text:
        return identity, "heading"
    if plain_path.endswith(".json"):
        return "$", "json_pointer"
    return f"sha256:{file_sha256(plain_path)}", "accepted_owner_file_custody"


def status_for(item: dict[str, Any]) -> str:
    item_id = item["item_id"]
    if item_id in IMPLEMENTATION_ONLY_IDS:
        return "implementation_only_deferral"
    disposition = item["disposition"]
    return {
        "adopt_here": "canon_closed",
        "adapt_existing_owner": "canon_closed",
        "already_covered_with_evidence": "already_covered_exact",
        "return_named_owner": "returned_to_accepted_owner",
        "reject_or_defer_with_owner": "rejected_with_reason",
    }[disposition]


def transform_item(source: dict[str, Any]) -> dict[str, Any]:
    item = {
        key: source[key]
        for key in (
            "item_id", "title", "requirement", "category", "packet_links",
            "source_decision_status", "disposition", "canonical_owner", "evidence",
            "required_impacts", "disposition_reason",
        )
    }
    item_id = item["item_id"]
    if item_id == "AGT-012":
        item["disposition"] = "adapt_existing_owner"
        item["disposition_reason"] = (
            "Assistant Chat ACD-447 adapts the existing owner to close model/Persona branch and sibling re-answer semantics; earlier restore-point-only evidence was not exact."
        )

    owner = dict(item["canonical_owner"])
    owner["supporting"] = list(owner.get("supporting", []))
    if item_id in AUDITED_OWNER_ANCHORS:
        new_primary = AUDITED_OWNER_ANCHORS[item_id][0]
        old_primary = owner["primary"]
        owner["primary"] = new_primary
        if old_primary != new_primary and old_primary not in owner["supporting"]:
            owner["supporting"].insert(0, old_primary)
    owner["supporting"] = [
        value for index, value in enumerate(owner["supporting"])
        if value != owner["primary"] and value not in owner["supporting"][:index]
    ]
    item["canonical_owner"] = owner

    exact_anchors: list[dict[str, str]] = []
    if item_id in AUDITED_OWNER_ANCHORS:
        path, identity, kind = AUDITED_OWNER_ANCHORS[item_id]
        exact_anchors.append(anchor(path, identity, kind))
    else:
        for legacy in source.get("evidence", {}).get("exact_live_plan_anchors", []):
            path = legacy["path"]
            identity, kind = classify_legacy_anchor(path, legacy["anchor_or_plan_unit_id"])
            exact_anchors.append(anchor(path, identity, kind))

    primary_path = owner["primary"].split("#", 1)[0]
    if not any(value["path"] == primary_path for value in exact_anchors):
        if primary_path.endswith(".json"):
            exact_anchors.insert(0, anchor(primary_path, "$", "json_pointer"))
        else:
            digest = file_sha256(primary_path)
            exact_anchors.insert(0, anchor(primary_path, f"sha256:{digest}", "accepted_owner_file_custody"))

    evidence = {
        "source_packet": list(source["evidence"]["source_packet"]),
        "live_plans": list(dict.fromkeys([owner["primary"], *source["evidence"].get("live_plans", [])])),
        "exact_live_plan_anchors": exact_anchors,
        "implementation_evidence": [],
    }
    item["evidence"] = evidence

    implementation_only = item_id in IMPLEMENTATION_ONLY_IDS
    repaired = item_id in CANON_REPAIR_IDS
    if repaired or implementation_only:
        acceptance = "accepted_by_plan_unit"
    elif any(value["anchor_kind"] in {"plan_unit", "heading", "json_pointer"} for value in exact_anchors):
        acceptance = "accepted_by_existing_owner_evidence"
    else:
        acceptance = "accepted_owner_route"
    if implementation_only:
        reason = (
            "Canonical owner, semantics, and acceptance contract are adequate; only future executable implementation and runtime evidence remain, outside this pre-WorkNode stage."
        )
    elif repaired:
        reason = (
            "The audited canon defect was repaired in the named accepted owner and is bound to the exact PlanUnit or heading recorded here."
        )
    elif item["disposition"] == "return_named_owner":
        reason = (
            "The requirement is accepted and routed to the concrete existing owner without creating a parallel shared-runtime owner."
        )
    else:
        reason = (
            "Current owner canon or the accepted shared integration seam closes this row; executable work remains not started."
        )
    item["canon_closure"] = {
        "status": status_for(item),
        "closed_at": CLOSED_AT,
        "reason": reason,
        "owner_acceptance_status": acceptance,
        "canon_repair_required_at_baseline": repaired,
        "implementation_only": implementation_only,
        "product_decision_required": False,
    }
    item["implementation_status"] = "not_started"
    item["unresolved_conflicts"] = []
    item["external_handoffs"] = []
    return item


def build(source: dict[str, Any]) -> dict[str, Any]:
    items = [transform_item(item) for item in source["items"]]
    dispositions = Counter(item["disposition"] for item in items)
    canon_statuses = Counter(item["canon_closure"]["status"] for item in items)
    owner_acceptance = Counter(item["canon_closure"]["owner_acceptance_status"] for item in items)
    semantic_anchor_rows = sum(
        any(anchor_row["anchor_kind"] != "accepted_owner_file_custody" for anchor_row in item["evidence"]["exact_live_plan_anchors"])
        for item in items
    )
    result = {
        "$schema": "Plans/runtime_integration_disposition.schema.json",
        "schema_id": "pm.runtime_integration_disposition.v2",
        "schema_version": "2.0.0",
        "register_id": "runtime-integration-disposition-corrected-2026-08-13",
        "stage": "canonical_specification_closure_pre_worknodes",
        "generated_at": CLOSED_AT,
        "authority_note": (
            "Canon disposition, accepted-owner routing, and source/evidence custody only. Every implementation remains not_started. This register creates no WorkNode, runtime handler, Event Authority, migration execution, buildability, or certification proof."
        ),
        "source_packet": {
            "packet_name": "PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13",
            "revision": "corrected-2026-08-13",
            "archive_basename": "PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13.zip",
            "archive_sha256": "8ec8184b055c0f3ddfc03c2848dde6f6e27c1abb067c2f08cdb5f4bde081053b",
            "packet_root": "PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/",
            "source_index_ref": "reports/shared-runtime-integration-2026-08-13/PACKET_SOURCE_INDEX.json",
            "source_hashes_sha256": dict(source["source_packet"]["source_hashes_sha256"]),
        },
        "custody_ref": "reports/shared-runtime-integration-2026-08-13/CANON_CLOSURE_CUSTODY.json",
        "allowed_dispositions": [
            "adopt_here", "adapt_existing_owner", "already_covered_with_evidence",
            "return_named_owner", "reject_or_defer_with_owner",
        ],
        "allowed_canon_statuses": [
            "canon_closed", "already_covered_exact", "returned_to_accepted_owner",
            "implementation_only_deferral", "rejected_with_reason", "product_decision_required",
        ],
        "allowed_implementation_statuses": ["not_started"],
        "closure_audit": {
            "accountability_rows": 163,
            "canon_repair_rows": 41,
            "implementation_only_rows": 8,
            "prior_valid_rows": 114,
            "unresolved_non_pnc_canon_defects": 0,
            "product_decisions_required": 0,
            "implementation_started_rows": 0,
            "native_runtime_proof_rows": 0,
            "pnc_event_authority_excluded": True,
        },
        "external_handoffs": [{
            "owner_lane": "PNC-019/Event Authority",
            "status": "excluded_not_adjudicated",
            "reason": "Event registration, compaction event semantics, checkpoint advance, and PNC currentness remain owned by the separate PNC/Event Authority lane.",
            "handoff_ref": "reports/shared-runtime-integration-2026-08-13/PNC_HANDOFF.md",
        }],
        "validation_summary": {
            "accountability_rows": len(items),
            "unique_item_ids": len({item["item_id"] for item in items}),
            "disposition_counts": dict(sorted(dispositions.items())),
            "canon_status_counts": dict(sorted(canon_statuses.items())),
            "implementation_status_counts": {"not_started": len(items)},
            "owner_acceptance_counts": dict(sorted(owner_acceptance.items())),
            "rows_with_exact_owner_custody": len(items),
            "rows_with_semantic_owner_anchors": semantic_anchor_rows,
            "rows_with_source_packet_pointers": sum(bool(item["evidence"]["source_packet"]) for item in items),
            "unresolved_conflict_rows": 0,
            "product_decision_rows": 0,
            "native_runtime_proof_rows": 0,
        },
        "items": items,
    }
    return result


def validate(register: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    schema = read_json(SCHEMA_PATH)
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    failures.extend(
        f"schema:{'/'.join(map(str, error.absolute_path))}:{error.message}"
        for error in sorted(validator.iter_errors(register), key=lambda error: list(error.absolute_path))
    )
    items = register.get("items", [])
    ids = [item.get("item_id") for item in items]
    if len(items) != 163 or len(set(ids)) != 163:
        failures.append("accountability_denominator_or_uniqueness_failed")
    if set(ids) & CANON_REPAIR_IDS != CANON_REPAIR_IDS or set(ids) & IMPLEMENTATION_ONLY_IDS != IMPLEMENTATION_ONLY_IDS:
        failures.append("audited_41_or_8_id_set_missing")
    if any(item.get("implementation_status") != "not_started" for item in items):
        failures.append("implementation_status_not_fail_closed")
    if any(item.get("unresolved_conflicts") for item in items):
        failures.append("non_pnc_unresolved_conflict_remains")
    if any(item.get("evidence", {}).get("implementation_evidence") for item in items):
        failures.append("implementation_evidence_must_be_empty")
    for item in items:
        primary = item["canonical_owner"]["primary"].split("#", 1)[0]
        primary_path = ROOT / primary
        if not primary_path.is_file():
            failures.append(f"{item['item_id']}:missing_primary_owner:{primary}")
            continue
        anchors = item["evidence"]["exact_live_plan_anchors"]
        if not any(value["path"] == primary for value in anchors):
            failures.append(f"{item['item_id']}:primary_owner_has_no_exact_anchor")
        for value in anchors:
            path = ROOT / value["path"]
            if not path.is_file():
                failures.append(f"{item['item_id']}:missing_anchor_path:{value['path']}")
                continue
            if hashlib.sha256(path.read_bytes()).hexdigest() != value["owner_file_sha256"]:
                failures.append(f"{item['item_id']}:owner_file_hash_stale:{value['path']}")
            text = path.read_text(encoding="utf-8")
            if value["anchor_kind"] == "plan_unit" and f"plan_unit_id: {value['anchor_or_plan_unit_id']}" not in text:
                failures.append(f"{item['item_id']}:plan_unit_anchor_missing:{value['anchor_or_plan_unit_id']}")
            if value["anchor_kind"] == "heading" and value["anchor_or_plan_unit_id"] not in text:
                failures.append(f"{item['item_id']}:heading_anchor_missing:{value['anchor_or_plan_unit_id']}")
    by_id = {item["item_id"]: item for item in items}
    if by_id.get("AGT-012", {}).get("disposition") != "adapt_existing_owner":
        failures.append("AGT-012_not_reclassified_to_adapt")
    if {item["item_id"] for item in items if item["canon_closure"]["implementation_only"]} != IMPLEMENTATION_ONLY_IDS:
        failures.append("implementation_only_set_not_exact")
    if {item["item_id"] for item in items if item["canon_closure"]["canon_repair_required_at_baseline"]} != CANON_REPAIR_IDS:
        failures.append("canon_repair_set_not_exact")
    return failures


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=("apply", "validate"))
    args = parser.parse_args()
    source = read_json(REGISTER_PATH)
    register = build(source) if args.mode == "apply" else source
    failures = validate(register)
    if failures:
        print(json.dumps({"status": "fail", "failures": failures}, indent=2))
        return 1
    if args.mode == "apply":
        REGISTER_PATH.write_text(json.dumps(register, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({
        "status": "pass",
        "rows": len(register["items"]),
        "canon_repair_rows": 41,
        "implementation_only_rows": 8,
        "implementation_status": "not_started",
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
