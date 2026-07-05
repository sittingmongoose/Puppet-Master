#!/usr/bin/env python3
"""Validate Puppet Master implementation-buildability readiness artifacts."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"
READINESS_DIR = PLANS / ".implementation_readiness"
BLOCKERS_PATH = READINESS_DIR / "readiness_blockers.jsonl"
MATRIX_PATH = READINESS_DIR / "readiness_matrix.json"
REPORT_PATH = READINESS_DIR / "buildability_gate_report.json"
NODE_READINESS_PATH = PLANS / ".plan_index/node_readiness_report.json"

REQUIRED_FAMILIES = [
    "contract_materialization",
    "persistence_materialization",
    "gui_wiring",
    "security_boundary",
    "runtime_lifecycle",
    "provider_stream",
    "behavioral_acceptance",
    "structural_integrity",
    "owner_routing",
    "currentness",
    "clean_room_harness",
]

REQUIRED_FALSE_PROOF_GUARDS = [
    "schema_existence_is_not_buildability",
    "validator_pass_is_not_buildability",
    "source_preservation_is_not_behavioral_acceptance",
    "semantic_closure_is_not_buildability",
    "wiring_json_existence_is_not_command_execution",
]

OWNER_DOCS = [
    "Plans/Planning_Wizard.md",
    "Plans/Plan_Document_System.md",
    "Plans/Plan_To_Node_Compilation.md",
    "Plans/Progression_Gates.md",
    "Plans/UI_Wiring_Rules.md",
    "Plans/bootstrap/Codex_Prompts.md",
    "Plans/.plan_index/node_readiness_report.json",
    "scripts/pm-implementation-readiness.py",
    "scripts/pm-plans-verify.py",
]


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def rel(path: Path) -> str:
    return path.resolve().relative_to(ROOT).as_posix()


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if not line.strip():
            continue
        row = json.loads(line)
        if not isinstance(row, dict):
            raise ValueError(f"{rel(path)}:{line_no} row is not an object")
        row.setdefault("_line", line_no)
        rows.append(row)
    return rows


def public_row(row: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in row.items() if not key.startswith("_")}


def source_hashes() -> dict[str, str]:
    paths = [BLOCKERS_PATH, MATRIX_PATH, *[ROOT / path for path in OWNER_DOCS]]
    hashes: dict[str, str] = {}
    for path in paths:
        if path.exists() and path.is_file():
            hashes[rel(path)] = sha256_file(path)
    return dict(sorted(hashes.items()))


def node_readiness_snapshot() -> dict[str, Any]:
    if not NODE_READINESS_PATH.exists():
        return {
            "available": False,
            "status": "missing",
            "hard_disabled": True,
            "hard_disabled_reason": "node_readiness_report_missing",
            "owner_doc": "Plans/Plan_To_Node_Compilation.md",
        }
    report = read_json(NODE_READINESS_PATH)
    runtime = report.get("runtime_enablement_status", {}) if isinstance(report, dict) else {}
    hard_disabled = (
        report.get("status") == "blocked_runtime_certification_incomplete"
        or runtime.get("runtime_blocked_by_ref") == "PNC-019"
        or runtime.get("executable_lifecycle_certification_complete") is False
    )
    return {
        "available": True,
        "status": report.get("status"),
        "status_reason": report.get("status_reason"),
        "runtime_enabled": runtime.get("runtime_enabled"),
        "runtime_blocked_by_ref": runtime.get("runtime_blocked_by_ref"),
        "executable_lifecycle_certification_complete": runtime.get("executable_lifecycle_certification_complete"),
        "hard_disabled": bool(hard_disabled),
        "hard_disabled_reason": "PNC-019 executable lifecycle certification is incomplete"
        if hard_disabled
        else None,
        "owner_doc": "Plans/Plan_To_Node_Compilation.md",
        "source": "Plans/.plan_index/node_readiness_report.json",
    }


def build_report(*, generated_at_utc: str | None = None) -> dict[str, Any]:
    blockers = [public_row(row) for row in load_jsonl(BLOCKERS_PATH)]
    matrix = read_json(MATRIX_PATH)
    open_blockers = [row for row in blockers if row.get("status") not in {"closed", "accepted_risk"}]
    open_by_family: dict[str, list[dict[str, Any]]] = {family: [] for family in REQUIRED_FAMILIES}
    for row in open_blockers:
        family = str(row.get("blocker_family", ""))
        open_by_family.setdefault(family, []).append(row)

    family_summary: list[dict[str, Any]] = []
    disabled_reasons: list[dict[str, Any]] = []
    for family in REQUIRED_FAMILIES:
        rows = open_by_family.get(family, [])
        owner_docs = sorted({doc for row in rows for doc in row.get("owner_docs", [])})
        family_summary.append(
            {
                "blocker_family": family,
                "status": "blocked" if rows else "clear",
                "open_blocker_ids": [str(row.get("blocker_id")) for row in rows],
                "owner_docs": owner_docs,
            }
        )
        if rows:
            disabled_reasons.append(
                {
                    "code": f"buildability_blocked.{family}",
                    "blocker_family": family,
                    "blocker_ids": [str(row.get("blocker_id")) for row in rows],
                    "owner_docs": owner_docs,
                    "message": (
                        "Approve And Build is disabled because implementation buildability requires "
                        f"{family} evidence in the exact owner docs listed here."
                    ),
                }
            )

    node_snapshot = node_readiness_snapshot()
    hard_disabled_reasons: list[dict[str, Any]] = []
    if node_snapshot.get("hard_disabled"):
        hard_disabled_reasons.append(
            {
                "code": "hard_disabled.PNC-019",
                "plan_unit_id": "PNC-019",
                "owner_docs": ["Plans/Plan_To_Node_Compilation.md"],
                "source": "Plans/.plan_index/node_readiness_report.json",
                "message": "PNC-019 blocks runtime buildability until executable lifecycle certification evidence exists.",
            }
        )

    buildability_gate_passed = not open_blockers and not hard_disabled_reasons
    return {
        "schema_id": "pm.implementation_readiness.buildability_gate_report.v1",
        "generated_at_utc": generated_at_utc or utc_now(),
        "validation_status_semantics": (
            "The validator passes when this report is current and truthful; buildability_gate_passed "
            "is the product gate used by Planning Wizard."
        ),
        "buildability_gate_passed": buildability_gate_passed,
        "buildability_status": "pass" if buildability_gate_passed else "blocked",
        "captured_plan_complete_buildable_ladder": [
            {
                "state": "captured",
                "sufficient_for_buildability": False,
                "rule": "Captured source, ledger atoms, or preserved lineage are not plan-complete and are not buildable.",
            },
            {
                "state": "plan_complete",
                "sufficient_for_buildability": False,
                "rule": "Plan-complete docs and green validators are necessary preconditions only.",
            },
            {
                "state": "buildable",
                "sufficient_for_buildability": True,
                "rule": "Buildability requires concrete schemas, command wiring, security boundaries, behavioral acceptance, and clean-room lifecycle evidence.",
            },
        ],
        "false_proof_guardrails": matrix.get("false_proof_guardrails", []),
        "required_proof_dimensions": matrix.get("required_proof_dimensions", []),
        "family_summary": family_summary,
        "node_readiness": node_snapshot,
        "approve_and_build_gate": {
            "command_id": "cmd.planning_wizard.approve_and_build",
            "enabled": buildability_gate_passed,
            "disabled": not buildability_gate_passed,
            "disabled_reason_projection": "state.planning_wizard.final_review.approve_and_build.disabled_reason",
            "disabled_reasons": disabled_reasons,
            "hard_disabled_reasons": hard_disabled_reasons,
            "must_list_blocker_families": True,
            "must_list_exact_owner_docs": True,
        },
        "remaining_open_blockers": open_blockers,
        "source_hashes": source_hashes(),
    }


def validate() -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    for path in [BLOCKERS_PATH, MATRIX_PATH, REPORT_PATH]:
        if not path.exists():
            failures.append({"path": rel(path), "error": "missing_implementation_readiness_artifact"})
    if failures:
        return validation_report(failures, None)

    try:
        blockers = load_jsonl(BLOCKERS_PATH)
    except Exception as exc:  # noqa: BLE001
        failures.append({"path": rel(BLOCKERS_PATH), "error": "jsonl_parse_failed", "detail": str(exc)})
        blockers = []

    family_rows: dict[str, list[dict[str, Any]]] = {family: [] for family in REQUIRED_FAMILIES}
    required_fields = [
        "schema_id",
        "blocker_id",
        "blocker_family",
        "status",
        "severity",
        "owner_docs",
        "blocked_surfaces",
        "blocked_false_proofs",
        "required_evidence",
        "acceptance_to_close",
    ]
    blocker_ids: set[str] = set()
    for row in blockers:
        row_path = f"{rel(BLOCKERS_PATH)}:{row.get('_line')}"
        for field in required_fields:
            if field not in row:
                failures.append({"path": row_path, "error": "missing_blocker_field", "field": field})
        blocker_id = str(row.get("blocker_id", ""))
        if blocker_id in blocker_ids:
            failures.append({"path": row_path, "error": "duplicate_blocker_id", "blocker_id": blocker_id})
        blocker_ids.add(blocker_id)
        family = str(row.get("blocker_family", ""))
        if family not in REQUIRED_FAMILIES:
            failures.append({"path": row_path, "error": "unknown_blocker_family", "blocker_family": family})
        else:
            family_rows[family].append(row)
        for list_field in ["owner_docs", "blocked_surfaces", "blocked_false_proofs", "required_evidence", "acceptance_to_close"]:
            value = row.get(list_field)
            if not isinstance(value, list) or not value:
                failures.append({"path": row_path, "error": "empty_or_invalid_list_field", "field": list_field})
        for owner_doc in row.get("owner_docs", []):
            owner_path = ROOT / str(owner_doc)
            if not owner_path.exists():
                failures.append({"path": row_path, "error": "missing_owner_doc", "owner_doc": owner_doc})

    for family in REQUIRED_FAMILIES:
        if not family_rows.get(family):
            failures.append({"path": rel(BLOCKERS_PATH), "error": "missing_required_blocker_family", "blocker_family": family})

    try:
        matrix = read_json(MATRIX_PATH)
    except Exception as exc:  # noqa: BLE001
        failures.append({"path": rel(MATRIX_PATH), "error": "json_parse_failed", "detail": str(exc)})
        matrix = {}
    matrix_families = [row.get("blocker_family") for row in matrix.get("families", []) if isinstance(row, dict)]
    if matrix_families != REQUIRED_FAMILIES:
        failures.append(
            {
                "path": rel(MATRIX_PATH),
                "error": "blocker_family_order_or_membership_mismatch",
                "expected": REQUIRED_FAMILIES,
                "actual": matrix_families,
            }
        )
    guardrails = matrix.get("false_proof_guardrails", [])
    for guard in REQUIRED_FALSE_PROOF_GUARDS:
        if guard not in guardrails:
            failures.append({"path": rel(MATRIX_PATH), "error": "missing_false_proof_guardrail", "guardrail": guard})

    try:
        actual_report = read_json(REPORT_PATH)
    except Exception as exc:  # noqa: BLE001
        failures.append({"path": rel(REPORT_PATH), "error": "json_parse_failed", "detail": str(exc)})
        actual_report = {}

    if actual_report:
        expected = build_report(generated_at_utc=actual_report.get("generated_at_utc"))
        if actual_report != expected:
            failures.append(
                {
                    "path": rel(REPORT_PATH),
                    "error": "buildability_gate_report_stale_or_not_canonical",
                    "repair_command": "python3 scripts/pm-implementation-readiness.py generate",
                }
            )
        gate = actual_report.get("approve_and_build_gate", {})
        disabled_reasons = gate.get("disabled_reasons", [])
        for family in REQUIRED_FAMILIES:
            if not any(isinstance(reason, dict) and reason.get("blocker_family") == family for reason in disabled_reasons):
                failures.append({"path": rel(REPORT_PATH), "error": "approve_and_build_disabled_reason_missing_family", "blocker_family": family})
        hard_reasons = gate.get("hard_disabled_reasons", [])
        if not any(isinstance(reason, dict) and reason.get("plan_unit_id") == "PNC-019" for reason in hard_reasons):
            failures.append({"path": rel(REPORT_PATH), "error": "pnc019_hard_disabled_reason_missing"})
        if actual_report.get("buildability_gate_passed") is True and blockers:
            failures.append({"path": rel(REPORT_PATH), "error": "buildability_passed_with_registered_blockers"})

    return validation_report(failures, actual_report)


def validation_report(failures: list[dict[str, Any]], gate_report: dict[str, Any] | None) -> dict[str, Any]:
    open_blocker_count = 0
    buildability_gate_passed = None
    buildability_status = None
    if gate_report:
        open_blocker_count = len(gate_report.get("remaining_open_blockers", []))
        buildability_gate_passed = gate_report.get("buildability_gate_passed")
        buildability_status = gate_report.get("buildability_status")
    return {
        "schema_id": "pm.implementation_readiness.validation_report.v1",
        "generated_at_utc": utc_now(),
        "status": "pass" if not failures else "fail",
        "failures": failures,
        "buildability_gate_passed": buildability_gate_passed,
        "buildability_status": buildability_status,
        "open_blocker_count": open_blocker_count,
        "required_blocker_families": REQUIRED_FAMILIES,
        "validator_semantics": "pass means readiness artifacts are current; it does not mean buildability_gate_passed is true",
    }


def cmd_generate(args: argparse.Namespace) -> int:
    report = build_report()
    write_json(REPORT_PATH, report)
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0


def cmd_validate(args: argparse.Namespace) -> int:
    report = validate()
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["status"] == "pass" else 1


def main() -> int:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("generate", help="Regenerate buildability_gate_report.json from registry inputs.").set_defaults(func=cmd_generate)
    subparsers.add_parser("validate", help="Validate readiness artifacts without asserting implementation buildability.").set_defaults(func=cmd_validate)
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
