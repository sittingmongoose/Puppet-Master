#!/usr/bin/env python3
"""Validate Puppet Master implementation-buildability readiness artifacts."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
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
DEPENDENCIES_INDEX_PATH = PLANS / ".plan_index/dependencies.json"
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
    "Plans/00-plans-index.md",
    "Plans/Executor_Protocol.md",
    "Plans/Contracts_V0.md",
    "Plans/storage-plan.md",
    "Plans/orchestrator-subagent-integration.md",
    "Plans/Prompt_Pipeline.md",
    "Plans/event_record.schema.json",
    "Plans/execution_unit_context.schema.json",
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

EXECUTION_UNIT_CONTEXT_SCHEMA_PATH = PLANS / "execution_unit_context.schema.json"
EXECUTION_UNIT_CONTEXT_SCHEMA_ID = "pm.execution_unit_context"
EXECUTION_UNIT_CONTEXT_SCHEMA_VERSION = "1.0.0"
EXECUTION_UNIT_CONTEXT_REQUIRED_FIELDS = [
    "schema_id",
    "schema_version",
    "execution_unit_type",
    "execution_unit_id",
    "run_id",
    "node_id",
    "attempt_id",
    "execution_role",
    "operational_identity",
    "requested_account_binding",
    "approval_scope_key",
    "created_at_utc",
]
EXECUTION_UNIT_CONTEXT_CONSUMER_DOCS = [
    PLANS / "Prompt_Pipeline.md",
    PLANS / "Contracts_V0.md",
    PLANS / "storage-plan.md",
    PLANS / "orchestrator-subagent-integration.md",
    PLANS / "Plan_To_Node_Compilation.md",
    PLANS / "Planning_Wizard.md",
]
EXECUTION_UNIT_CONTEXT_FIELD_CLAIM_DOCS = [
    PLANS / "Executor_Protocol.md",
    *EXECUTION_UNIT_CONTEXT_CONSUMER_DOCS,
]
EXECUTION_UNIT_CONTEXT_FORBIDDEN_CONSUMER_PATTERNS = [
    "#### execution_unit_context canonical record",
    "execution_unit_context {\n",
    "`execution_unit_context` is the authoritative runtime snapshot packet",
    "The canonical replacement execution-context object reconciles node-native keys",
]
EXECUTION_UNIT_CONTEXT_SPEC_LOCK_PATHS = [
    "Plans/execution_unit_context.schema.json",
    "scripts/pm-plan-index.py",
]
EXECUTION_UNIT_CONTEXT_FIELD_CLAIM_RE = re.compile(
    r"(?<![/A-Za-z0-9_-])execution_unit_context\.([A-Za-z_][A-Za-z0-9_]*)\b"
)
EXECUTION_UNIT_CONTEXT_FIELDS_INCLUDING_RE = re.compile(
    r"\bexecution_unit_context\b[^.\n]{0,220}\bfields?\b[^.\n]{0,120}\b(?:including|include|as|through)\b(?P<body>[^.\n]+)",
    re.IGNORECASE,
)
EXECUTION_UNIT_CONTEXT_FIELD_TOKEN_RE = re.compile(r"\b[a-z][a-z0-9_]*\b")
EXECUTION_UNIT_CONTEXT_FIELD_TOKEN_STOPWORDS = {
    "and",
    "or",
    "the",
    "through",
    "including",
    "include",
    "as",
    "from",
    "in",
    "into",
    "with",
    "without",
    "rather",
    "than",
    "field",
    "fields",
    "schema",
    "owned",
    "owner",
    "executor",
    "contract",
    "packet",
    "payload",
    "context",
    "refs",
    "ref",
    "safe",
    "point",
    "source",
    "control",
    "worktree",
    "binding",
    "details",
    "live",
    "branch",
    "head",
    "dirty",
    "state",
    "mode",
}
EXECUTION_UNIT_CONTEXT_NON_NORMATIVE_MARKERS = [
    "compatibility",
    "source-lineage",
    "source lineage",
    "example",
    "non-normative",
    "preserved_exact_tokens",
    "stale_retired",
    "retired",
]
EXECUTION_UNIT_CONTEXT_NEGATIVE_CLAIM_MARKERS = [
    "must not",
    "does not",
    "do not",
    "not an execution_unit_context field",
    "not stored in execution_unit_context",
    "outside execution_unit_context",
    "outside the packet",
    "rather than in execution_unit_context",
    "derived from",
]

EVENT_RECORD_SCHEMA_PATH = PLANS / "event_record.schema.json"
EVENT_RECORD_SCHEMA_ID = "pm.event.v0"
EVENT_RECORD_SCHEMA_VERSION = "1.0.0"
EVENT_RECORD_REQUIRED_FIELDS = [
    "schema_id",
    "schema_version",
    "event_id",
    "event_type",
    "project_id",
    "thread_id",
    "run_id",
    "node_id",
    "attempt_id",
    "actor_ref",
    "requested_account_ref",
    "effective_account_ref",
    "occurred_at_utc",
    "observed_at_utc",
    "persisted_at_utc",
    "sequence_id",
    "producer_sequence_id",
    "correlation_id",
    "causation_event_id",
    "parent_event_id",
    "idempotency_key",
    "payload_schema_id",
    "payload",
    "payload_ref",
    "redaction_profile",
    "replay_policy",
    "migration",
]
EVENT_RECORD_CONSUMER_DOCS = [
    PLANS / "Executor_Protocol.md",
    PLANS / "Plan_To_Node_Compilation.md",
    PLANS / "Planning_Wizard.md",
    PLANS / "Plugins_System.md",
    PLANS / "Runtime_Artifacts_Panel.md",
]
EVENT_RECORD_SPEC_LOCK_PATHS = [
    "Plans/event_record.schema.json",
    "scripts/pm-implementation-readiness.py",
]
EVENT_RECORD_FORBIDDEN_CONSUMER_PATTERNS = [
    "EventRecord fields include",
    "EventRecord required fields",
    "EventRecord {",
]
EVENT_RECORD_LOCAL_DEFINITION_FIELD_TOKENS = {
    "schema",
    "timestamp",
    "ts",
    "seq",
    "type",
    "event_type",
    "plugin_id",
    "source",
    "run_id",
    "thread_id",
    "payload",
}
EVENT_RECORD_LOCAL_DEFINITION_ALLOWED_MARKERS = (
    "legacy",
    "source-lineage",
    "source lineage",
    "compatibility",
    "non-normative",
    "stale",
    "example",
)
SECRET_MATERIAL_KEY_RE = re.compile(
    r"(?:^|_)(?:secret|token|password|credential|api_key|oauth|refresh_token)(?:_|$)",
    re.IGNORECASE,
)


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
    dependency_summary = report.get("dependency_graph_summary", {}) if isinstance(report, dict) else {}
    build_order_available = dependency_summary.get("build_order_available") is True
    true_cycle_component_count = int(dependency_summary.get("true_cycle_component_count") or 0)
    lifecycle_complete = runtime.get("executable_lifecycle_certification_complete") is True
    hard_disabled = (
        report.get("status") == "blocked_runtime_certification_incomplete"
        or runtime.get("runtime_blocked_by_ref") == "PNC-019"
        or not lifecycle_complete
        or not build_order_available
        or true_cycle_component_count > 0
    )
    if true_cycle_component_count > 0:
        hard_disabled_reason = "node-readiness dependency graph has true cycles"
    elif not build_order_available:
        hard_disabled_reason = "node-readiness build order is unavailable"
    elif hard_disabled:
        hard_disabled_reason = "PNC-019 executable lifecycle certification is incomplete"
    else:
        hard_disabled_reason = None
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
        "build_order_available": build_order_available,
        "true_cycle_component_count": true_cycle_component_count,
        "hard_disabled": bool(hard_disabled),
        "hard_disabled_reason": hard_disabled_reason,
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
    pnc019_hard_disabled = (
        node_snapshot.get("runtime_blocked_by_ref") == "PNC-019"
        or node_snapshot.get("executable_lifecycle_certification_complete") is not True
    )
    if pnc019_hard_disabled:
        hard_disabled_reasons.append(
            {
                "code": "hard_disabled.PNC-019",
                "plan_unit_id": "PNC-019",
                "owner_docs": ["Plans/Plan_To_Node_Compilation.md"],
                "source": "Plans/.plan_index/node_readiness_report.json",
                "message": "PNC-019 blocks runtime buildability until executable lifecycle certification evidence exists.",
            }
        )
    graph_order_blocked = node_snapshot.get("build_order_available") is not True
    graph_cycle_count = int(node_snapshot.get("true_cycle_component_count") or 0)
    if graph_order_blocked or graph_cycle_count > 0:
        hard_disabled_reasons.append(
            {
                "code": "hard_disabled.node_readiness_build_order",
                "owner_docs": ["Plans/Plan_To_Node_Compilation.md", "Plans/Plan_Document_System.md"],
                "source": "Plans/.plan_index/node_readiness_report.json",
                "message": "Node-readiness buildability requires an acyclic PlanUnit dependency graph with an available build order.",
                "build_order_available": not graph_order_blocked,
                "true_cycle_component_count": graph_cycle_count,
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
    pnc019_expected = (
        node_readiness.get("runtime_blocked_by_ref") == "PNC-019"
        or node_readiness.get("executable_lifecycle_certification_complete") is not True
    )
    if pnc019_expected and not pnc019_present:
        failures.append({"path": path, "error": "pnc019_hard_disabled_reason_missing"})
    if not pnc019_expected and pnc019_present:
        failures.append({"path": path, "error": "pnc019_hard_disabled_reason_present_after_node_unblocked"})
    graph_reason_present = any(
        isinstance(reason, dict) and reason.get("code") == "hard_disabled.node_readiness_build_order"
        for reason in hard_reasons
    )
    graph_reason_expected = (
        node_hard_disabled
        and (
            node_readiness.get("build_order_available") is not True
            or int(node_readiness.get("true_cycle_component_count") or 0) > 0
        )
    )
    if graph_reason_expected and not graph_reason_present:
        failures.append({"path": path, "error": "node_readiness_build_order_hard_disabled_reason_missing"})
    if not graph_reason_expected and graph_reason_present:
        failures.append({"path": path, "error": "node_readiness_build_order_hard_disabled_reason_unexpected"})

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
        if node_readiness.get("build_order_available") is not True:
            failures.append({"path": path, "error": "buildability_passed_without_node_readiness_build_order"})
        if int(node_readiness.get("true_cycle_component_count") or 0) > 0:
            failures.append({"path": path, "error": "buildability_passed_with_node_readiness_dependency_cycles"})
        if current_hashes is not None and actual_report.get("source_hashes") != current_hashes:
            failures.append({"path": path, "error": "buildability_passed_with_stale_source_hashes"})

    return failures


def dependency_graph_failures(node_report: dict[str, Any]) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    summary = node_report.get("dependency_graph_summary", {}) if isinstance(node_report, dict) else {}
    if not isinstance(summary, dict):
        return [{"path": rel(NODE_READINESS_PATH), "error": "dependency_graph_summary_missing_or_invalid"}]

    true_cycle_count = int(summary.get("true_cycle_component_count") or 0)
    if true_cycle_count > 0:
        failures.append(
            {
                "path": rel(NODE_READINESS_PATH),
                "error": "node_readiness_dependency_graph_true_cycles",
                "true_cycle_component_count": true_cycle_count,
            }
        )
    if summary.get("build_order_available") is not True:
        failures.append(
            {
                "path": rel(NODE_READINESS_PATH),
                "error": "node_readiness_build_order_unavailable",
                "build_order_blocked_node_count": summary.get("build_order_blocked_node_count"),
            }
        )

    if DEPENDENCIES_INDEX_PATH.exists():
        try:
            deps = read_json(DEPENDENCIES_INDEX_PATH)
        except Exception as exc:  # noqa: BLE001
            failures.append({"path": rel(DEPENDENCIES_INDEX_PATH), "error": "json_parse_failed", "detail": str(exc)})
            return failures
        bootstrap_cycle_components = [
            component
            for component in deps.get("cycle_components", [])
            if isinstance(component, dict)
            and any(plan_unit_id in {"PNC-019", "PNC-022"} for plan_unit_id in component.get("plan_unit_ids", []))
        ]
        if bootstrap_cycle_components:
            failures.append(
                {
                    "path": rel(DEPENDENCIES_INDEX_PATH),
                    "error": "pnc019_bootstrap_authority_dependency_cycle",
                    "cycle_components": bootstrap_cycle_components,
                }
            )
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
    failures.extend(dependency_graph_failures(node_report))
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
        dependency_summary = node_report.get("dependency_graph_summary", {}) if isinstance(node_report, dict) else {}
        expected_node_fields = {
            "bootstrap_authorized": runtime.get("bootstrap_authorized"),
            "certification_harness_specified": runtime.get("certification_harness_specified"),
            "ordinary_product_worknodes_allowed": runtime.get("ordinary_product_worknodes_allowed"),
            "executable_lifecycle_certification_complete": runtime.get("executable_lifecycle_certification_complete"),
            "runtime_enabled": runtime.get("runtime_enabled"),
            "build_order_available": dependency_summary.get("build_order_available") is True,
            "true_cycle_component_count": int(dependency_summary.get("true_cycle_component_count") or 0),
        }
        for field, expected in expected_node_fields.items():
            if report_node.get(field) != expected:
                failures.append(
                    {
                        "path": rel(REPORT_PATH),
                        "error": "buildability_report_node_readiness_field_mismatch",
                        "field": field,
                        "expected": expected,
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


def line_no_for_index(text: str, index: int) -> int:
    return text.count("\n", 0, index) + 1


def execution_unit_context_marker_window(text: str, start: int, end: int) -> str:
    return text[max(0, start - 700) : min(len(text), end + 700)].lower()


def is_allowed_execution_unit_context_claim_context(text: str, start: int, end: int) -> bool:
    window = execution_unit_context_marker_window(text, start, end)
    return any(marker in window for marker in EXECUTION_UNIT_CONTEXT_NON_NORMATIVE_MARKERS) or any(
        marker in window for marker in EXECUTION_UNIT_CONTEXT_NEGATIVE_CLAIM_MARKERS
    )


def execution_unit_context_field_claim_failures_for_text(
    *,
    path_label: str,
    text: str,
    schema_fields: set[str],
) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    for match in EXECUTION_UNIT_CONTEXT_FIELD_CLAIM_RE.finditer(text):
        field = match.group(1)
        if field in schema_fields or is_allowed_execution_unit_context_claim_context(text, match.start(), match.end()):
            continue
        failures.append(
            {
                "path": f"{path_label}:{line_no_for_index(text, match.start())}",
                "error": "execution_unit_context_field_claim_absent_from_schema",
                "field": field,
            }
        )

    for match in EXECUTION_UNIT_CONTEXT_FIELDS_INCLUDING_RE.finditer(text):
        if is_allowed_execution_unit_context_claim_context(text, match.start(), match.end()):
            continue
        body = match.group("body")
        tokens = {
            token
            for token in EXECUTION_UNIT_CONTEXT_FIELD_TOKEN_RE.findall(body)
            if token not in EXECUTION_UNIT_CONTEXT_FIELD_TOKEN_STOPWORDS
        }
        for field in sorted(tokens - schema_fields):
            failures.append(
                {
                    "path": f"{path_label}:{line_no_for_index(text, match.start())}",
                    "error": "execution_unit_context_field_claim_absent_from_schema",
                    "field": field,
                }
            )
    return failures


def execution_unit_context_spec_lock_failures() -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    spec_lock_path = PLANS / "Spec_Lock.json"
    try:
        spec_lock = read_json(spec_lock_path)
    except Exception as exc:  # noqa: BLE001
        return [{"path": rel(spec_lock_path), "error": "json_parse_failed", "detail": str(exc)}]
    files = spec_lock.get("canonical_ssot_hashes", {}).get("files", [])
    if not isinstance(files, list):
        return [{"path": rel(spec_lock_path), "error": "spec_lock_canonical_ssot_files_missing"}]
    by_path = {row.get("path"): row for row in files if isinstance(row, dict)}
    for path in EXECUTION_UNIT_CONTEXT_SPEC_LOCK_PATHS:
        entry = by_path.get(path)
        if not isinstance(entry, dict):
            failures.append(
                {
                    "path": rel(spec_lock_path),
                    "error": "execution_unit_context_spec_lock_registration_missing",
                    "required_path": path,
                }
            )
            continue
        target = ROOT / path
        if not target.exists():
            failures.append({"path": path, "error": "execution_unit_context_spec_lock_registered_path_missing"})
            continue
        current_hash = sha256_file(target)
        if entry.get("sha256") != current_hash:
            failures.append(
                {
                    "path": rel(spec_lock_path),
                    "error": "execution_unit_context_spec_lock_hash_stale",
                    "required_path": path,
                    "expected": current_hash,
                    "actual": entry.get("sha256"),
                }
            )
    return failures


def event_record_secret_key_failures(value: Any, *, path_label: str, pointer: str = "$") -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    if isinstance(value, dict):
        for key, child in value.items():
            child_pointer = f"{pointer}.{key}"
            if SECRET_MATERIAL_KEY_RE.search(str(key)):
                failures.append(
                    {
                        "path": path_label,
                        "error": "event_record_secret_material_key",
                        "pointer": child_pointer,
                        "field": key,
                    }
                )
            failures.extend(event_record_secret_key_failures(child, path_label=path_label, pointer=child_pointer))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            failures.extend(
                event_record_secret_key_failures(child, path_label=path_label, pointer=f"{pointer}[{index}]")
            )
    return failures


def event_record_instance_failures(record: Any, *, path_label: str) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    if not isinstance(record, dict):
        return [{"path": path_label, "error": "event_record_not_object"}]
    for field in EVENT_RECORD_REQUIRED_FIELDS:
        if field not in record:
            failures.append({"path": path_label, "error": "event_record_missing_required_field", "field": field})
    if record.get("schema_id") != EVENT_RECORD_SCHEMA_ID:
        failures.append(
            {
                "path": path_label,
                "error": "event_record_schema_id_mismatch",
                "expected": EVENT_RECORD_SCHEMA_ID,
                "actual": record.get("schema_id"),
            }
        )
    if record.get("schema_version") != EVENT_RECORD_SCHEMA_VERSION:
        failures.append(
            {
                "path": path_label,
                "error": "event_record_schema_version_mismatch",
                "expected": EVENT_RECORD_SCHEMA_VERSION,
                "actual": record.get("schema_version"),
            }
        )
    failures.extend(event_record_secret_key_failures(record, path_label=path_label))
    return failures


def event_record_spec_lock_failures() -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    spec_lock_path = PLANS / "Spec_Lock.json"
    try:
        spec_lock = read_json(spec_lock_path)
    except Exception as exc:  # noqa: BLE001
        return [{"path": rel(spec_lock_path), "error": "json_parse_failed", "detail": str(exc)}]
    schema_versions = spec_lock.get("schema_versions", {})
    if not isinstance(schema_versions, dict) or schema_versions.get("event_record") != EVENT_RECORD_SCHEMA_ID:
        failures.append(
            {
                "path": rel(spec_lock_path),
                "error": "event_record_schema_version_registration_missing",
                "expected": EVENT_RECORD_SCHEMA_ID,
                "actual": schema_versions.get("event_record") if isinstance(schema_versions, dict) else None,
            }
        )
    files = spec_lock.get("canonical_ssot_hashes", {}).get("files", [])
    if not isinstance(files, list):
        return [{"path": rel(spec_lock_path), "error": "spec_lock_canonical_ssot_files_missing"}]
    by_path = {row.get("path"): row for row in files if isinstance(row, dict)}
    for path in EVENT_RECORD_SPEC_LOCK_PATHS:
        entry = by_path.get(path)
        if not isinstance(entry, dict):
            failures.append(
                {
                    "path": rel(spec_lock_path),
                    "error": "event_record_spec_lock_registration_missing",
                    "required_path": path,
                }
            )
            continue
        target = ROOT / path
        if not target.exists():
            failures.append({"path": path, "error": "event_record_spec_lock_registered_path_missing"})
            continue
        current_hash = sha256_file(target)
        if entry.get("sha256") != current_hash:
            failures.append(
                {
                    "path": rel(spec_lock_path),
                    "error": "event_record_spec_lock_hash_stale",
                    "required_path": path,
                    "expected": current_hash,
                    "actual": entry.get("sha256"),
                }
            )
    return failures


def event_record_consumer_allows_local_shape(lines: list[str], index: int) -> bool:
    start = max(0, index - 2)
    end = min(len(lines), index + 3)
    context = " ".join(lines[start:end]).lower()
    return any(marker in context for marker in EVENT_RECORD_LOCAL_DEFINITION_ALLOWED_MARKERS)


def event_record_consumer_local_definition_failures(path: Path, text: str) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    lines = text.splitlines()
    for index, line in enumerate(lines):
        normalized = line.replace("`", "").lower()
        has_event_record_context = "eventrecord" in normalized
        has_type_value_claim = bool(re.search(r"\btype\s+value\s+is\s+exactly\b", normalized))
        if not has_event_record_context and not has_type_value_claim:
            continue

        tokens = {
            token
            for token in EVENT_RECORD_LOCAL_DEFINITION_FIELD_TOKENS
            if re.search(rf"\b{re.escape(token)}\b", normalized)
        }
        matched_patterns: list[str] = []
        if "eventrecord-shaped" in normalized:
            matched_patterns.append("eventrecord_shaped_tuple")
        if re.search(r"eventrecord[^\n]*\([^)]*\bschema\b[^)]*\bts\b[^)]*\bseq\b[^)]*\btype\b", normalized):
            matched_patterns.append("eventrecord_legacy_parenthesized_tuple")
        if re.search(r"eventrecord[^\n]*\btimestamp\b[^\n]*\bplugin_id\b[^\n]*\bevent_type\b[^\n]*\bpayload\b", normalized):
            matched_patterns.append("eventrecord_plugin_tuple")
        if has_type_value_claim:
            matched_patterns.append("eventrecord_type_field_claim")
        if has_event_record_context and len(tokens) >= 4:
            matched_patterns.append("eventrecord_local_field_tuple")

        if not matched_patterns:
            continue
        if event_record_consumer_allows_local_shape(lines, index):
            continue
        failures.append(
            {
                "path": f"{rel(path)}:{index + 1}",
                "error": "event_record_consumer_local_definition",
                "patterns": sorted(set(matched_patterns)),
                "field_tokens": sorted(tokens),
            }
        )
    return failures


def event_record_contract_failures(actual_report: dict[str, Any]) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    contracts_path = PLANS / "Contracts_V0.md"
    if not contracts_path.exists():
        failures.append({"path": rel(contracts_path), "error": "contracts_v0_missing"})
    else:
        contracts_text = contracts_path.read_text(encoding="utf-8")
        for marker in ["### 1.2 EventRecord", "`pm.event.v0`", "Plans/event_record.schema.json"]:
            if marker not in contracts_text:
                failures.append(
                    {
                        "path": rel(contracts_path),
                        "error": "event_record_contract_marker_missing",
                        "marker": marker,
                    }
                )

    schema_path = EVENT_RECORD_SCHEMA_PATH
    if not schema_path.exists():
        return failures + [{"path": rel(schema_path), "error": "event_record_schema_missing"}]
    try:
        schema = read_json(schema_path)
    except Exception as exc:  # noqa: BLE001
        return failures + [{"path": rel(schema_path), "error": "json_parse_failed", "detail": str(exc)}]

    if schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
        failures.append({"path": rel(schema_path), "error": "event_record_schema_not_draft_2020_12"})
    if schema.get("type") != "object":
        failures.append({"path": rel(schema_path), "error": "event_record_schema_type_not_object"})
    if schema.get("additionalProperties") is not False:
        failures.append({"path": rel(schema_path), "error": "event_record_schema_top_level_not_closed"})
    if schema.get("required") != EVENT_RECORD_REQUIRED_FIELDS:
        failures.append(
            {
                "path": rel(schema_path),
                "error": "event_record_required_fields_mismatch",
                "expected": EVENT_RECORD_REQUIRED_FIELDS,
                "actual": schema.get("required"),
            }
        )
    properties = schema.get("properties", {})
    if not isinstance(properties, dict):
        failures.append({"path": rel(schema_path), "error": "event_record_properties_missing_or_invalid"})
        properties = {}
    for field in EVENT_RECORD_REQUIRED_FIELDS:
        if field not in properties:
            failures.append({"path": rel(schema_path), "error": "event_record_required_property_missing", "field": field})
    if "type" in properties:
        failures.append({"path": rel(schema_path), "error": "event_record_legacy_type_property_persisted"})
    schema_id = properties.get("schema_id", {}) if isinstance(properties.get("schema_id"), dict) else {}
    if schema_id.get("const") != EVENT_RECORD_SCHEMA_ID:
        failures.append(
            {
                "path": rel(schema_path),
                "error": "event_record_schema_id_const_mismatch",
                "expected": EVENT_RECORD_SCHEMA_ID,
                "actual": schema_id.get("const"),
            }
        )
    schema_version = properties.get("schema_version", {}) if isinstance(properties.get("schema_version"), dict) else {}
    if schema_version.get("const") != EVENT_RECORD_SCHEMA_VERSION:
        failures.append(
            {
                "path": rel(schema_path),
                "error": "event_record_schema_version_const_mismatch",
                "expected": EVENT_RECORD_SCHEMA_VERSION,
                "actual": schema_version.get("const"),
            }
        )
    for field in ["redaction_profile", "replay_policy"]:
        value = properties.get(field, {})
        enum = value.get("enum") if isinstance(value, dict) else None
        if not isinstance(enum, list) or not enum:
            failures.append({"path": rel(schema_path), "error": "event_record_closed_enum_missing", "field": field})
    payload = properties.get("payload", {}) if isinstance(properties.get("payload"), dict) else {}
    if payload.get("type") != "object":
        failures.append({"path": rel(schema_path), "error": "event_record_payload_dispatch_not_object"})
    migration = properties.get("migration", {}) if isinstance(properties.get("migration"), dict) else {}
    migration_ref = migration.get("$ref")
    defs = schema.get("$defs", {}) if isinstance(schema.get("$defs"), dict) else {}
    migration_def = defs.get("migration", {}) if isinstance(defs.get("migration"), dict) else {}
    if migration_ref != "#/$defs/migration":
        failures.append({"path": rel(schema_path), "error": "event_record_migration_not_ref"})
    if migration_def.get("additionalProperties") is not False:
        failures.append({"path": rel(schema_path), "error": "event_record_migration_not_closed"})

    for key in properties:
        if SECRET_MATERIAL_KEY_RE.search(str(key)):
            failures.append({"path": rel(schema_path), "error": "event_record_secret_material_property", "field": key})

    for consumer_path in EVENT_RECORD_CONSUMER_DOCS:
        if not consumer_path.exists():
            failures.append({"path": rel(consumer_path), "error": "event_record_consumer_doc_missing"})
            continue
        text = consumer_path.read_text(encoding="utf-8")
        if "Plans/Contracts_V0.md#EventRecord" not in text and "Contracts_V0.md §1.2" not in text:
            failures.append({"path": rel(consumer_path), "error": "event_record_consumer_contract_ref_missing"})
        for pattern in EVENT_RECORD_FORBIDDEN_CONSUMER_PATTERNS:
            if pattern in text:
                failures.append(
                    {
                        "path": rel(consumer_path),
                        "error": "event_record_consumer_local_definition",
                        "pattern": pattern,
                    }
                )
        failures.extend(event_record_consumer_local_definition_failures(consumer_path, text))

    failures.extend(event_record_spec_lock_failures())

    if actual_report.get("buildability_gate_passed") is True:
        failures.append({"path": rel(REPORT_PATH), "error": "tier0c_event_record_unexpected_buildability_pass"})

    return failures


def execution_unit_context_contract_failures(actual_report: dict[str, Any]) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    schema_path = EXECUTION_UNIT_CONTEXT_SCHEMA_PATH
    if not schema_path.exists():
        return [{"path": rel(schema_path), "error": "execution_unit_context_schema_missing"}]

    try:
        schema = read_json(schema_path)
    except Exception as exc:  # noqa: BLE001
        return [{"path": rel(schema_path), "error": "json_parse_failed", "detail": str(exc)}]

    if schema.get("type") != "object":
        failures.append({"path": rel(schema_path), "error": "execution_unit_context_schema_type_not_object"})
    if schema.get("additionalProperties") is not False:
        failures.append({"path": rel(schema_path), "error": "execution_unit_context_schema_not_closed"})
    if schema.get("required") != EXECUTION_UNIT_CONTEXT_REQUIRED_FIELDS:
        failures.append(
            {
                "path": rel(schema_path),
                "error": "execution_unit_context_required_fields_mismatch",
                "expected": EXECUTION_UNIT_CONTEXT_REQUIRED_FIELDS,
                "actual": schema.get("required"),
            }
        )

    properties = schema.get("properties", {})
    if not isinstance(properties, dict):
        failures.append({"path": rel(schema_path), "error": "execution_unit_context_properties_missing_or_invalid"})
        properties = {}
    schema_fields = set(properties)
    for field in EXECUTION_UNIT_CONTEXT_REQUIRED_FIELDS:
        if field not in properties:
            failures.append({"path": rel(schema_path), "error": "execution_unit_context_required_property_missing", "field": field})

    schema_id = properties.get("schema_id", {}) if isinstance(properties.get("schema_id"), dict) else {}
    if schema_id.get("const") != EXECUTION_UNIT_CONTEXT_SCHEMA_ID:
        failures.append(
            {
                "path": rel(schema_path),
                "error": "execution_unit_context_schema_id_const_mismatch",
                "expected": EXECUTION_UNIT_CONTEXT_SCHEMA_ID,
                "actual": schema_id.get("const"),
            }
        )
    schema_version = properties.get("schema_version", {}) if isinstance(properties.get("schema_version"), dict) else {}
    if schema_version.get("const") != EXECUTION_UNIT_CONTEXT_SCHEMA_VERSION:
        failures.append(
            {
                "path": rel(schema_path),
                "error": "execution_unit_context_schema_version_const_mismatch",
                "expected": EXECUTION_UNIT_CONTEXT_SCHEMA_VERSION,
                "actual": schema_version.get("const"),
            }
        )

    for field in ["execution_unit_type", "execution_role", "requested_account_binding"]:
        value = properties.get(field, {})
        enum = value.get("enum") if isinstance(value, dict) else None
        if not isinstance(enum, list) or not enum:
            failures.append({"path": rel(schema_path), "error": "execution_unit_context_closed_enum_missing", "field": field})

    defs = schema.get("$defs", {})
    operational_identity = defs.get("operational_identity", {}) if isinstance(defs, dict) else {}
    if not isinstance(operational_identity, dict) or operational_identity.get("additionalProperties") is not False:
        failures.append({"path": rel(schema_path), "error": "execution_unit_context_operational_identity_not_closed"})
    identity_properties = operational_identity.get("properties", {}) if isinstance(operational_identity, dict) else {}
    identity_kind = identity_properties.get("identity_kind", {}) if isinstance(identity_properties, dict) else {}
    if not isinstance(identity_kind.get("enum"), list) or not identity_kind.get("enum"):
        failures.append({"path": rel(schema_path), "error": "execution_unit_context_identity_kind_enum_missing"})

    for consumer_path in EXECUTION_UNIT_CONTEXT_CONSUMER_DOCS:
        if not consumer_path.exists():
            failures.append({"path": rel(consumer_path), "error": "execution_unit_context_consumer_doc_missing"})
            continue
        text = consumer_path.read_text(encoding="utf-8")
        for pattern in EXECUTION_UNIT_CONTEXT_FORBIDDEN_CONSUMER_PATTERNS:
            if pattern in text:
                failures.append(
                    {
                        "path": rel(consumer_path),
                        "error": "execution_unit_context_consumer_local_definition",
                        "pattern": pattern,
                    }
                )
        start = 0
        while True:
            index = text.find("execution_unit_context", start)
            if index == -1:
                break
            window = text[index : index + 800]
            if "Required fields:" in window and "`run_id`" in window and "`node_id`" in window and "`attempt_id`" in window:
                failures.append(
                    {
                        "path": rel(consumer_path),
                        "error": "execution_unit_context_consumer_required_field_list",
                    }
                )
                break
            start = index + len("execution_unit_context")

    for claim_path in EXECUTION_UNIT_CONTEXT_FIELD_CLAIM_DOCS:
        if not claim_path.exists():
            failures.append({"path": rel(claim_path), "error": "execution_unit_context_field_claim_doc_missing"})
            continue
        failures.extend(
            execution_unit_context_field_claim_failures_for_text(
                path_label=rel(claim_path),
                text=claim_path.read_text(encoding="utf-8"),
                schema_fields=schema_fields,
            )
        )

    failures.extend(execution_unit_context_spec_lock_failures())

    if actual_report.get("buildability_gate_passed") is True:
        failures.append({"path": rel(REPORT_PATH), "error": "tier0b_execution_unit_context_unexpected_buildability_pass"})

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


def fixture_node_snapshot(
    *,
    hard_disabled: bool,
    build_order_available: bool = True,
    true_cycle_component_count: int = 0,
) -> dict[str, Any]:
    graph_blocked = not build_order_available or true_cycle_component_count > 0
    if hard_disabled:
        return {
            "available": True,
            "status": "blocked_runtime_certification_incomplete",
            "status_reason": "fixture blocked",
            "runtime_enabled": False,
            "runtime_blocked_by_ref": "PNC-019",
            "executable_lifecycle_certification_complete": False,
            "build_order_available": build_order_available,
            "true_cycle_component_count": true_cycle_component_count,
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
        "build_order_available": build_order_available,
        "true_cycle_component_count": true_cycle_component_count,
        "hard_disabled": graph_blocked,
        "hard_disabled_reason": "node-readiness build order is unavailable" if graph_blocked else None,
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
            "expected_graph_reason": False,
            "expected_buildability_gate_passed": True,
        },
        {
            "name": "all_blockers_closed_build_order_unavailable",
            "statuses": {family: "closed" for family in REQUIRED_FAMILIES},
            "node_hard_disabled": False,
            "build_order_available": False,
            "true_cycle_component_count": 1,
            "expected_open_count": 0,
            "expected_disabled_count": 0,
            "expected_pnc019": False,
            "expected_graph_reason": True,
            "expected_buildability_gate_passed": False,
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
            node_snapshot=fixture_node_snapshot(
                hard_disabled=scenario["node_hard_disabled"],
                build_order_available=scenario.get("build_order_available", True),
                true_cycle_component_count=scenario.get("true_cycle_component_count", 0),
            ),
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
            "graph_hard_reason": any(
                reason.get("code") == "hard_disabled.node_readiness_build_order" for reason in hard_reasons
            )
            == scenario.get("expected_graph_reason", False),
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
    fixture_schema_fields = {"schema_id", "schema_version", "worktree_id", "working_directory"}
    field_claim_checks = {
        "valid_schema_fields": not execution_unit_context_field_claim_failures_for_text(
            path_label="self-test:valid_schema_fields",
            text="execution_unit_context fields including working_directory and worktree_id.",
            schema_fields=fixture_schema_fields,
        ),
        "invalid_normative_fields": {
            failure["field"]
            for failure in execution_unit_context_field_claim_failures_for_text(
                path_label="self-test:invalid_normative_fields",
                text="execution_unit_context fields including working_directory, worktree_branch, and is_worktree.",
                schema_fields=fixture_schema_fields,
            )
        }
        == {"worktree_branch", "is_worktree"},
        "source_lineage_example_allowed": not execution_unit_context_field_claim_failures_for_text(
            path_label="self-test:source_lineage_example_allowed",
            text=(
                "Compatibility/source-lineage example only, non-normative: "
                "execution_unit_context.primary_language is a preserved old snippet."
            ),
            schema_fields=fixture_schema_fields,
        ),
    }
    if not all(field_claim_checks.values()):
        failures.append(
            {
                "scenario": "execution_unit_context_field_claims",
                "checks": field_claim_checks,
            }
        )
    base_event_record = {
        "schema_id": EVENT_RECORD_SCHEMA_ID,
        "schema_version": EVENT_RECORD_SCHEMA_VERSION,
        "event_id": "evt_fixture_001",
        "event_type": "run.started",
        "project_id": "project_fixture",
        "thread_id": None,
        "run_id": "run_fixture",
        "node_id": None,
        "attempt_id": None,
        "actor_ref": "actor:fixture",
        "requested_account_ref": None,
        "effective_account_ref": None,
        "occurred_at_utc": "2026-07-06T00:00:00Z",
        "observed_at_utc": "2026-07-06T00:00:00Z",
        "persisted_at_utc": "2026-07-06T00:00:00Z",
        "sequence_id": 1,
        "producer_sequence_id": None,
        "correlation_id": "corr_fixture",
        "causation_event_id": None,
        "parent_event_id": None,
        "idempotency_key": "idem_fixture",
        "payload_schema_id": "pm.event_payload.run.started.v1",
        "payload": {"status": "started"},
        "payload_ref": None,
        "redaction_profile": "no_secrets",
        "replay_policy": "dedupe_by_idempotency_key",
        "migration": {
            "migrated_from_schema_id": None,
            "migrated_from_schema_version": None,
            "migration_id": None,
            "compatibility_event_type": None,
        },
    }
    missing_schema_version_record = dict(base_event_record)
    missing_schema_version_record.pop("schema_version")
    secret_record = dict(base_event_record)
    secret_record["payload"] = {"api_key": "do-not-store"}
    event_record_checks = {
        "valid_event_record": not event_record_instance_failures(
            base_event_record,
            path_label="self-test:valid_event_record",
        ),
        "missing_schema_version_rejected": any(
            failure.get("field") == "schema_version"
            for failure in event_record_instance_failures(
                missing_schema_version_record,
                path_label="self-test:missing_schema_version",
            )
        ),
        "secret_payload_rejected": any(
            failure.get("error") == "event_record_secret_material_key"
            for failure in event_record_instance_failures(secret_record, path_label="self-test:secret_payload")
        ),
        "consumer_local_tuple_rejected": bool(
            event_record_consumer_local_definition_failures(
                Path("self-test/EventRecordConsumer.md"),
                "EventRecord entries include timestamp, plugin_id, event_type, payload, and source.",
            )
        ),
        "legacy_consumer_tuple_allowed": not event_record_consumer_local_definition_failures(
            Path("self-test/EventRecordConsumer.md"),
            (
                "Legacy/source-lineage compatibility note only, non-normative: "
                "EventRecord entries include timestamp, plugin_id, event_type, payload, and source."
            ),
        ),
    }
    if not all(event_record_checks.values()):
        failures.append(
            {
                "scenario": "event_record_envelope",
                "checks": event_record_checks,
            }
        )
    return {
        "schema_id": "pm.implementation_readiness.self_test_report.v1",
        "generated_at_utc": utc_now(),
        "status": "pass" if not failures else "fail",
        "scenarios": results,
        "field_claim_checks": field_claim_checks,
        "event_record_checks": event_record_checks,
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
        failures.extend(event_record_contract_failures(actual_report))
        failures.extend(execution_unit_context_contract_failures(actual_report))

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
