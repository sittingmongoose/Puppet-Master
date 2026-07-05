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
PLAN_UNITS_INDEX_PATH = PLANS / ".plan_index/plan_units.jsonl"
PNC019_BOOTSTRAP_AUTHORITY_MODE = "pnc019_bootstrap_authority"
PNC019_BOOTSTRAP_SCOPE = "pnc019_certification_harness_only"

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

CLOSED_BLOCKER_STATUSES = {"closed", "accepted_risk"}

OWNER_DOCS = [
    "Plans/Planning_Wizard.md",
    "Plans/Plan_Document_System.md",
    "Plans/Plan_To_Node_Compilation.md",
    "Plans/Progression_Gates.md",
    "Plans/UI_Wiring_Rules.md",
    "Plans/bootstrap/Codex_Prompts.md",
    "Plans/.plan_index/node_readiness_report.json",
    "scripts/pm-plan-index.py",
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


def is_open_blocker(row: dict[str, Any]) -> bool:
    return str(row.get("status", "")).lower() not in CLOSED_BLOCKER_STATUSES


def open_blockers_from(blockers: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [row for row in blockers if is_open_blocker(row)]


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
    lifecycle_complete = runtime.get("executable_lifecycle_certification_complete") is True
    hard_disabled = (
        report.get("status") == "blocked_runtime_certification_incomplete"
        or runtime.get("runtime_blocked_by_ref") == "PNC-019"
        or not lifecycle_complete
    )
    return {
        "available": True,
        "status": report.get("status"),
        "status_reason": report.get("status_reason"),
        "bootstrap_authorized": runtime.get("bootstrap_authorized"),
        "bootstrap_authority_ref": runtime.get("bootstrap_authority_ref"),
        "certification_harness_specified": runtime.get("certification_harness_specified"),
        "runtime_enabled": runtime.get("runtime_enabled"),
        "runtime_blocked_by_ref": runtime.get("runtime_blocked_by_ref"),
        "executable_lifecycle_certification_complete": runtime.get("executable_lifecycle_certification_complete"),
        "ordinary_product_worknodes_allowed": runtime.get("ordinary_product_worknodes_allowed"),
        "hard_disabled": bool(hard_disabled),
        "hard_disabled_reason": "PNC-019 executable lifecycle certification is incomplete"
        if hard_disabled
        else None,
        "owner_doc": "Plans/Plan_To_Node_Compilation.md",
        "source": "Plans/.plan_index/node_readiness_report.json",
    }


def build_report_from_inputs(
    *,
    blockers: list[dict[str, Any]],
    matrix: dict[str, Any],
    node_snapshot: dict[str, Any],
    hash_map: dict[str, str],
    generated_at_utc: str | None = None,
) -> dict[str, Any]:
    open_blockers = open_blockers_from(blockers)
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

    lifecycle_complete = node_snapshot.get("executable_lifecycle_certification_complete") is True
    buildability_gate_passed = not open_blockers and not hard_disabled_reasons and lifecycle_complete
    return {
        "schema_id": "pm.implementation_readiness.buildability_gate_report.v1",
        "generated_at_utc": generated_at_utc or utc_now(),
        "validation_status_semantics": (
            "The validator passes when this report is current and truthful; buildability_gate_passed "
            "is the product gate used by Planning Wizard."
        ),
        "buildability_gate_passed": buildability_gate_passed,
        "buildability_status": "pass" if buildability_gate_passed else "blocked",
        "open_blocker_count": len(open_blockers),
        "buildability_pass_requirements": {
            "open_blocker_count_zero": len(open_blockers) == 0,
            "no_hard_disabled_reasons": not hard_disabled_reasons,
            "node_readiness_executable_lifecycle_certification_complete": lifecycle_complete,
            "source_hashes_current": True,
        },
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
        "source_hashes": hash_map,
    }


def build_report(*, generated_at_utc: str | None = None) -> dict[str, Any]:
    return build_report_from_inputs(
        blockers=[public_row(row) for row in load_jsonl(BLOCKERS_PATH)],
        matrix=read_json(MATRIX_PATH),
        node_snapshot=node_readiness_snapshot(),
        hash_map=source_hashes(),
        generated_at_utc=generated_at_utc,
    )


def gate_semantic_failures(
    *,
    actual_report: dict[str, Any],
    blockers: list[dict[str, Any]],
    current_hashes: dict[str, str] | None,
    path: str,
) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    public_blockers = [public_row(row) for row in blockers]
    open_blockers = open_blockers_from(public_blockers)
    open_families = {str(row.get("blocker_family", "")) for row in open_blockers}
    gate = actual_report.get("approve_and_build_gate", {})
    if not isinstance(gate, dict):
        return [{"path": path, "error": "approve_and_build_gate_missing_or_invalid"}]

    disabled_reasons = gate.get("disabled_reasons", [])
    if not isinstance(disabled_reasons, list):
        failures.append({"path": path, "error": "disabled_reasons_missing_or_invalid"})
        disabled_reasons = []
    disabled_families = {
        str(reason.get("blocker_family", ""))
        for reason in disabled_reasons
        if isinstance(reason, dict) and reason.get("blocker_family")
    }
    for family in sorted(open_families):
        if family not in disabled_families:
            failures.append(
                {"path": path, "error": "approve_and_build_disabled_reason_missing_open_family", "blocker_family": family}
            )
    for family in sorted(disabled_families - open_families):
        failures.append(
            {"path": path, "error": "approve_and_build_disabled_reason_for_closed_family", "blocker_family": family}
        )

    hard_reasons = gate.get("hard_disabled_reasons", [])
    if not isinstance(hard_reasons, list):
        failures.append({"path": path, "error": "hard_disabled_reasons_missing_or_invalid"})
        hard_reasons = []
    node_readiness = actual_report.get("node_readiness", {})
    if not isinstance(node_readiness, dict):
        failures.append({"path": path, "error": "node_readiness_missing_or_invalid"})
        node_readiness = {}
    node_hard_disabled = node_readiness.get("hard_disabled") is True
    pnc019_present = any(isinstance(reason, dict) and reason.get("plan_unit_id") == "PNC-019" for reason in hard_reasons)
    if node_hard_disabled and not pnc019_present:
        failures.append({"path": path, "error": "pnc019_hard_disabled_reason_missing"})
    if not node_hard_disabled and pnc019_present:
        failures.append({"path": path, "error": "pnc019_hard_disabled_reason_present_after_node_unblocked"})

    if actual_report.get("open_blocker_count") != len(open_blockers):
        failures.append(
            {
                "path": path,
                "error": "open_blocker_count_mismatch",
                "expected": len(open_blockers),
                "actual": actual_report.get("open_blocker_count"),
            }
        )

    if actual_report.get("buildability_gate_passed") is True:
        if open_blockers:
            failures.append({"path": path, "error": "buildability_passed_with_open_blockers"})
        if hard_reasons:
            failures.append({"path": path, "error": "buildability_passed_with_hard_disabled_reasons"})
        if node_readiness.get("executable_lifecycle_certification_complete") is not True:
            failures.append({"path": path, "error": "buildability_passed_without_executable_lifecycle_certification"})
        if current_hashes is not None and actual_report.get("source_hashes") != current_hashes:
            failures.append({"path": path, "error": "buildability_passed_with_stale_source_hashes"})

    return failures


def pnc019_bootstrap_authority_failures(actual_report: dict[str, Any]) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    if not NODE_READINESS_PATH.exists():
        failures.append({"path": rel(NODE_READINESS_PATH), "error": "node_readiness_report_missing"})
        return failures
    try:
        node_report = read_json(NODE_READINESS_PATH)
    except Exception as exc:  # noqa: BLE001
        failures.append({"path": rel(NODE_READINESS_PATH), "error": "json_parse_failed", "detail": str(exc)})
        return failures
    runtime = node_report.get("runtime_enablement_status", {}) if isinstance(node_report, dict) else {}
    if not isinstance(runtime, dict):
        failures.append({"path": rel(NODE_READINESS_PATH), "error": "runtime_enablement_status_missing_or_invalid"})
        runtime = {}

    required_fields = [
        "bootstrap_authorized",
        "compiler_contract_complete",
        "certification_harness_specified",
        "executable_lifecycle_certification_complete",
        "runtime_enabled",
        "ordinary_product_worknodes_allowed",
    ]
    for field in required_fields:
        if field not in runtime:
            failures.append({"path": rel(NODE_READINESS_PATH), "error": "runtime_readiness_field_missing", "field": field})
    if runtime.get("bootstrap_authorized") is not True:
        failures.append({"path": rel(NODE_READINESS_PATH), "error": "pnc019_bootstrap_authority_not_projected"})
    if runtime.get("certification_harness_specified") is not True:
        failures.append({"path": rel(NODE_READINESS_PATH), "error": "pnc019_certification_harness_not_specified"})
    if runtime.get("runtime_enabled") is True and runtime.get("executable_lifecycle_certification_complete") is not True:
        failures.append({"path": rel(NODE_READINESS_PATH), "error": "runtime_enabled_without_pnc019_certification"})
    if (
        runtime.get("ordinary_product_worknodes_allowed") is True
        and runtime.get("executable_lifecycle_certification_complete") is not True
    ):
        failures.append({"path": rel(NODE_READINESS_PATH), "error": "ordinary_product_worknodes_allowed_before_certification"})

    report_node = actual_report.get("node_readiness", {}) if isinstance(actual_report, dict) else {}
    if isinstance(report_node, dict):
        for field in [
            "bootstrap_authorized",
            "certification_harness_specified",
            "ordinary_product_worknodes_allowed",
            "executable_lifecycle_certification_complete",
            "runtime_enabled",
        ]:
            if report_node.get(field) != runtime.get(field):
                failures.append(
                    {
                        "path": rel(REPORT_PATH),
                        "error": "buildability_report_node_readiness_field_mismatch",
                        "field": field,
                        "expected": runtime.get(field),
                        "actual": report_node.get(field),
                    }
                )

    if not PLAN_UNITS_INDEX_PATH.exists():
        failures.append({"path": rel(PLAN_UNITS_INDEX_PATH), "error": "plan_unit_index_missing"})
        return failures
    try:
        plan_units = load_jsonl(PLAN_UNITS_INDEX_PATH)
    except Exception as exc:  # noqa: BLE001
        failures.append({"path": rel(PLAN_UNITS_INDEX_PATH), "error": "jsonl_parse_failed", "detail": str(exc)})
        return failures

    bootstrap_units = [
        unit
        for unit in plan_units
        if isinstance(unit.get("node_compile_hint"), dict)
        and unit["node_compile_hint"].get("mode") == PNC019_BOOTSTRAP_AUTHORITY_MODE
    ]
    if len(bootstrap_units) != 1:
        failures.append(
            {
                "path": rel(PLAN_UNITS_INDEX_PATH),
                "error": "pnc019_bootstrap_authority_missing_or_ambiguous",
                "count": len(bootstrap_units),
                "plan_unit_ids": [str(unit.get("plan_unit_id")) for unit in bootstrap_units],
            }
        )
    else:
        unit = bootstrap_units[0]
        hint = unit.get("node_compile_hint", {})
        expectations = {
            "plan_unit_id": "PNC-022",
            "owner_doc": "Plans/Plan_To_Node_Compilation.md",
            "bootstrap_authorized": True,
            "bootstrap_scope": PNC019_BOOTSTRAP_SCOPE,
            "certification_harness_specified": True,
            "executable_lifecycle_certification_complete": False,
            "runtime_enabled": False,
            "ordinary_product_worknodes_allowed": False,
            "create_worknodes": False,
            "create_nodeseeds": False,
        }
        for field, expected in expectations.items():
            actual = unit.get(field) if field in {"plan_unit_id", "owner_doc"} else hint.get(field)
            if actual != expected:
                failures.append(
                    {
                        "path": f"{rel(PLAN_UNITS_INDEX_PATH)}:{unit.get('_line')}",
                        "error": "pnc019_bootstrap_authority_overbroad_or_misclassified",
                        "field": field,
                        "expected": expected,
                        "actual": actual,
                    }
                )

    for unit in plan_units:
        hint = unit.get("node_compile_hint", {})
        if not isinstance(hint, dict) or hint.get("create_worknodes") is not True:
            continue
        harness_scoped = (
            unit.get("plan_unit_id") == "PNC-022"
            and hint.get("mode") == PNC019_BOOTSTRAP_AUTHORITY_MODE
            and hint.get("bootstrap_scope") == PNC019_BOOTSTRAP_SCOPE
            and hint.get("ordinary_product_worknodes_allowed") is False
        )
        if not harness_scoped and runtime.get("ordinary_product_worknodes_allowed") is not True:
            failures.append(
                {
                    "path": f"{rel(PLAN_UNITS_INDEX_PATH)}:{unit.get('_line')}",
                    "plan_unit_id": unit.get("plan_unit_id"),
                    "error": "ordinary_product_create_worknodes_before_pnc019_certification",
                }
            )
    return failures


def fixture_blocker(family: str, index: int, *, status: str = "open") -> dict[str, Any]:
    return {
        "schema_id": "pm.implementation_readiness.blocker.v1",
        "blocker_id": f"FIXTURE-IRB-{index:03d}",
        "blocker_family": family,
        "status": status,
        "severity": "hard_blocker",
        "summary": f"Fixture blocker for {family}.",
        "owner_docs": ["Plans/Planning_Wizard.md"],
        "blocked_surfaces": ["Planning Wizard Approve And Build"],
        "blocked_false_proofs": ["validator_pass"],
        "required_evidence": ["Fixture evidence requirement."],
        "acceptance_to_close": ["Fixture closure requirement."],
    }


def fixture_node_snapshot(*, hard_disabled: bool) -> dict[str, Any]:
    if hard_disabled:
        return {
            "available": True,
            "status": "blocked_runtime_certification_incomplete",
            "status_reason": "fixture blocked",
            "runtime_enabled": False,
            "runtime_blocked_by_ref": "PNC-019",
            "executable_lifecycle_certification_complete": False,
            "hard_disabled": True,
            "hard_disabled_reason": "PNC-019 executable lifecycle certification is incomplete",
            "owner_doc": "Plans/Plan_To_Node_Compilation.md",
            "source": "fixture/node_readiness_report.json",
        }
    return {
        "available": True,
        "status": "ready_for_node_compile",
        "status_reason": "fixture unblocked",
        "runtime_enabled": True,
        "runtime_blocked_by_ref": None,
        "executable_lifecycle_certification_complete": True,
        "hard_disabled": False,
        "hard_disabled_reason": None,
        "owner_doc": "Plans/Plan_To_Node_Compilation.md",
        "source": "fixture/node_readiness_report.json",
    }


def run_self_tests() -> dict[str, Any]:
    matrix = {
        "false_proof_guardrails": REQUIRED_FALSE_PROOF_GUARDS,
        "required_proof_dimensions": ["fixture_dimension"],
    }
    fixture_hashes = {"fixture/source": "fixture-hash"}
    scenarios = [
        {
            "name": "all_blockers_open",
            "statuses": {},
            "node_hard_disabled": True,
            "expected_open_count": len(REQUIRED_FAMILIES),
            "expected_disabled_count": len(REQUIRED_FAMILIES),
            "expected_pnc019": True,
            "expected_buildability_gate_passed": False,
        },
        {
            "name": "one_blocker_closed",
            "statuses": {REQUIRED_FAMILIES[0]: "closed"},
            "node_hard_disabled": True,
            "expected_open_count": len(REQUIRED_FAMILIES) - 1,
            "expected_disabled_count": len(REQUIRED_FAMILIES) - 1,
            "expected_pnc019": True,
            "expected_buildability_gate_passed": False,
        },
        {
            "name": "all_blockers_closed_pnc019_blocked",
            "statuses": {family: "closed" for family in REQUIRED_FAMILIES},
            "node_hard_disabled": True,
            "expected_open_count": 0,
            "expected_disabled_count": 0,
            "expected_pnc019": True,
            "expected_buildability_gate_passed": False,
        },
        {
            "name": "all_blockers_closed_pnc019_unblocked",
            "statuses": {family: "closed" for family in REQUIRED_FAMILIES},
            "node_hard_disabled": False,
            "expected_open_count": 0,
            "expected_disabled_count": 0,
            "expected_pnc019": False,
            "expected_buildability_gate_passed": True,
        },
    ]
    results: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []
    for scenario in scenarios:
        blockers = [
            fixture_blocker(family, index, status=scenario["statuses"].get(family, "open"))
            for index, family in enumerate(REQUIRED_FAMILIES, start=1)
        ]
        report = build_report_from_inputs(
            blockers=blockers,
            matrix=matrix,
            node_snapshot=fixture_node_snapshot(hard_disabled=scenario["node_hard_disabled"]),
            hash_map=fixture_hashes,
            generated_at_utc="2026-07-05T00:00:00Z",
        )
        scenario_failures = gate_semantic_failures(
            actual_report=report,
            blockers=blockers,
            current_hashes=fixture_hashes,
            path=f"self-test:{scenario['name']}",
        )
        disabled_reasons = report["approve_and_build_gate"]["disabled_reasons"]
        hard_reasons = report["approve_and_build_gate"]["hard_disabled_reasons"]
        checks = {
            "open_blocker_count": report["open_blocker_count"] == scenario["expected_open_count"],
            "disabled_reason_count": len(disabled_reasons) == scenario["expected_disabled_count"],
            "pnc019_hard_reason": any(reason.get("plan_unit_id") == "PNC-019" for reason in hard_reasons)
            == scenario["expected_pnc019"],
            "buildability_gate_passed": report["buildability_gate_passed"]
            == scenario["expected_buildability_gate_passed"],
            "semantic_failures_absent": not scenario_failures,
        }
        if not all(checks.values()):
            failures.append(
                {
                    "scenario": scenario["name"],
                    "checks": checks,
                    "semantic_failures": scenario_failures,
                }
            )
        results.append(
            {
                "scenario": scenario["name"],
                "status": "pass" if all(checks.values()) else "fail",
                "open_blocker_count": report["open_blocker_count"],
                "disabled_reason_count": len(disabled_reasons),
                "pnc019_hard_reason_present": any(reason.get("plan_unit_id") == "PNC-019" for reason in hard_reasons),
                "buildability_gate_passed": report["buildability_gate_passed"],
                "checks": checks,
            }
        )
    return {
        "schema_id": "pm.implementation_readiness.self_test_report.v1",
        "generated_at_utc": utc_now(),
        "status": "pass" if not failures else "fail",
        "scenarios": results,
        "failures": failures,
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
        failures.extend(
            gate_semantic_failures(
                actual_report=actual_report,
                blockers=blockers,
                current_hashes=source_hashes(),
                path=rel(REPORT_PATH),
            )
        )
        failures.extend(pnc019_bootstrap_authority_failures(actual_report))

    self_test_report = run_self_tests()
    if self_test_report["status"] != "pass":
        failures.append(
            {
                "path": rel(Path(__file__).resolve()),
                "error": "implementation_readiness_self_tests_failed",
                "failures": self_test_report["failures"],
            }
        )

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


def cmd_self_test(args: argparse.Namespace) -> int:
    report = run_self_tests()
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["status"] == "pass" else 1


def main() -> int:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("generate", help="Regenerate buildability_gate_report.json from registry inputs.").set_defaults(func=cmd_generate)
    subparsers.add_parser("validate", help="Validate readiness artifacts without asserting implementation buildability.").set_defaults(func=cmd_validate)
    subparsers.add_parser("self-test", help="Run in-memory fixture checks for blocker closure gate semantics.").set_defaults(func=cmd_self_test)
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
