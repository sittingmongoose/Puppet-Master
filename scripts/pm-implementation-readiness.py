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
CLOSURE_EVIDENCE_PATH = READINESS_DIR / "non_executable_closure_evidence.json"
CLOSURE_EVIDENCE_SCHEMA_PATH = READINESS_DIR / "non_executable_closure_evidence.schema.json"
PNC019_CERTIFICATION_RECEIPT_PATH = READINESS_DIR / "pnc019_certification_receipt.json"
PNC019_CERTIFICATION_RECEIPT_SCHEMA_PATH = READINESS_DIR / "pnc019_certification_receipt.schema.json"
PNC019_CERTIFICATION_HARNESS_PATH = ROOT / "scripts/pm-pnc019-certification-harness.py"
NODE_READINESS_PATH = PLANS / ".plan_index/node_readiness_report.json"
PLAN_UNITS_INDEX_PATH = PLANS / ".plan_index/plan_units.jsonl"
DEPENDENCIES_INDEX_PATH = PLANS / ".plan_index/dependencies.json"
PNC019_BOOTSTRAP_AUTHORITY_MODE = "pnc019_bootstrap_authority"
PNC019_BOOTSTRAP_SCOPE = "pnc019_certification_harness_only"
PNC019_CERTIFICATION_SCHEMA_ID = "pm.implementation_readiness.pnc019_certification_receipt.v1"
PNC019_CERTIFICATION_SCHEMA_VERSION = "1.0.0"

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
NON_EXECUTABLE_CLOSABLE_FAMILIES = [
    "contract_materialization",
    "persistence_materialization",
    "provider_stream",
    "security_boundary",
    "gui_wiring",
    "behavioral_acceptance",
    "structural_integrity",
    "owner_routing",
    "currentness",
]
EXECUTABLE_PROOF_FAMILIES = ["runtime_lifecycle", "clean_room_harness"]
CLOSURE_EVIDENCE_SCHEMA_ID = "pm.implementation_readiness.non_executable_closure_evidence.v1"
CLOSURE_EVIDENCE_SCHEMA_VERSION = "1.0.0"
REQUIRED_PNC019_POSITIVE_CASE_IDS = [
    "fresh_run",
    "duplicate_idempotency",
    "restart_resume",
    "cancellation",
    "stale_cas_rejection",
    "blocked_permission_security",
    "provider_degraded_error",
    "storage_replay_currentness",
    "no_evidence_test_rejection",
]
REQUIRED_PNC019_NEGATIVE_CASE_IDS = [
    "missing_schema_version",
    "invalid_event_record",
    "invalid_execution_unit_context",
    "invalid_storage_value",
    "raw_secret_credential",
    "provider_stream_missing_refs",
    "gui_disabled_bypass",
    "graph_cycle",
    "missing_behavioral_acceptance",
    "static_only_proof",
]
REQUIRED_PNC019_LIFECYCLE_STEPS = [
    "approved_plan_pack_intake",
    "plan_approved_event_record",
    "plan_compile_run_identity",
    "workgraph_draft",
    "worknode_request",
    "executor_intake",
    "activation_commit",
    "queued_entrypoint",
    "orchestrator_projection",
    "testing_receipt",
    "goal_receipt",
]
REQUIRED_PNC019_ARTIFACT_RECEIPTS = [
    "approved_plan_pack",
    "plan_approved_event",
    "plan_compile_run",
    "workgraph_draft",
    "worknode_request",
    "execution_unit_context",
    "executor_intake_report",
    "activation_receipt",
    "queued_entrypoint_receipt",
    "orchestrator_projection",
    "testing_receipt",
    "goal_receipt",
]
REQUIRED_PNC019_STORAGE_FAMILIES = [
    "approved_plan_pack",
    "plan_approved_outbox",
    "plan_compile_run",
    "compiler_wave_contract",
    "workgraph_draft",
    "worknode_request",
    "executor_intake_report",
    "attempt_receipt",
    "event_record_index",
    "blocked_projection",
    "goal_receipt",
]
REQUIRED_PNC019_SOURCE_HASH_PATHS = [
    "Plans/event_record.schema.json",
    "Plans/execution_unit_context.schema.json",
    "Plans/storage_value_registry.schema.json",
    "Plans/storage_value_registry.json",
    "Plans/Plan_To_Node_Compilation.md",
    "Plans/Planning_Wizard.md",
    "Plans/Executor_Protocol.md",
    "Plans/Goal_Runtime_System.md",
    "Plans/Orchestrator_Page.md",
    "Plans/Automated_Testing_System.md",
    "Plans/Progression_Gates.md",
    "scripts/pm-pnc019-certification-harness.py",
]
REQUIRED_PLANCOMPILE_ARTIFACT_KINDS = [
    "approved_plan_pack",
    "plan_compile_run",
    "compile_wave_contract",
    "workgraph_draft",
    "worknode_request",
    "executor_intake_report",
    "test_run_receipt",
    "goal_completion_receipt",
]
REQUIRED_PROVIDER_STREAM_EVENT_KINDS = [
    "request_started",
    "auth_state",
    "model_resolution",
    "text_delta",
    "tool_use",
    "tool_result",
    "usage_update",
    "diagnostic",
    "retry_scheduled",
    "quota_state",
    "degraded_state",
    "cancel_requested",
    "cancelled",
    "done",
    "error",
]
REQUIRED_PERSISTENCE_FIXTURE_IDS = [
    "persist.replay_restart.plan_compile_run",
    "persist.idempotent.duplicate_approve_and_build",
    "persist.transactional_outbox.plan_approved",
    "persist.currentness.cas_rejects_stale_pack",
    "persist.activation_testing_receipts.ref_only",
]
REQUIRED_SECURITY_FIXTURE_IDS = [
    "security.actor_identity.approval_scope",
    "security.credential_ref_only.provider_call",
    "security.provider_egress_ssrf.host_policy",
    "security.command_approval_replay.preflight_revision",
    "security.trust_destructive.plugin_container_worktree",
]

OWNER_DOCS = [
    "Plans/00-plans-index.md",
    "Plans/Executor_Protocol.md",
    "Plans/Contracts_V0.md",
    "Plans/storage-plan.md",
    "Plans/storage_value_registry.schema.json",
    "Plans/storage_value_registry.json",
    "Plans/.implementation_readiness/non_executable_closure_evidence.schema.json",
    "Plans/.implementation_readiness/non_executable_closure_evidence.json",
    "Plans/.implementation_readiness/pnc019_certification_receipt.schema.json",
    "Plans/.implementation_readiness/pnc019_certification_receipt.json",
    "Plans/orchestrator-subagent-integration.md",
    "Plans/Prompt_Pipeline.md",
    "Plans/CLI_Bridged_Providers.md",
    "Plans/Multi-Account.md",
    "Plans/Provider_OpenCode.md",
    "Plans/Provider_Stream_Mapping_External_Reference_A2A.md",
    "Plans/Permissions_System.md",
    "Plans/UI_Command_Catalog.md",
    "Plans/Wiring_Matrix.production.json",
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
    "scripts/pm-pnc019-certification-harness.py",
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

STORAGE_VALUE_REGISTRY_SCHEMA_PATH = PLANS / "storage_value_registry.schema.json"
STORAGE_VALUE_REGISTRY_PATH = PLANS / "storage_value_registry.json"
STORAGE_VALUE_REGISTRY_SCHEMA_ID = "pm.storage_value_registry.v1"
STORAGE_VALUE_REGISTRY_SCHEMA_VERSION = "1.0.0"
STORAGE_VALUE_REQUIRED_LAUNCH_FAMILIES = [
    "approved_plan_pack",
    "plan_approved_outbox",
    "plan_compile_run",
    "compiler_wave_contract",
    "workgraph_draft",
    "worknode_request",
    "executor_intake_report",
    "attempt_receipt",
    "event_record_index",
    "blocked_projection",
    "goal_receipt",
]
STORAGE_VALUE_REGISTRY_SPEC_LOCK_PATHS = [
    "Plans/storage_value_registry.schema.json",
    "Plans/storage_value_registry.json",
    "Plans/.implementation_readiness/non_executable_closure_evidence.schema.json",
    "Plans/.implementation_readiness/non_executable_closure_evidence.json",
    "scripts/pm-implementation-readiness.py",
    "scripts/pm-audit-closure.py",
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


def event_record_contract_failures(actual_report: dict[str, Any], *, pnc019_certified: bool) -> list[dict[str, Any]]:
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

    if actual_report.get("buildability_gate_passed") is True and not pnc019_certified:
        failures.append({"path": rel(REPORT_PATH), "error": "tier0c_event_record_unexpected_buildability_pass"})

    return failures


def storage_value_secret_key_allowed(key: str) -> bool:
    lowered = key.lower()
    if "redaction" in lowered or "no_secret" in lowered:
        return True
    return lowered.endswith(("_ref", "_refs", "_ref_id", "_profile", "_policy", "_hash"))


def storage_value_secret_key_failures(value: Any, *, path_label: str, pointer: str = "$") -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    if isinstance(value, dict):
        for key, child in value.items():
            key_str = str(key)
            child_pointer = f"{pointer}.{key_str}"
            if SECRET_MATERIAL_KEY_RE.search(key_str) and not storage_value_secret_key_allowed(key_str):
                failures.append(
                    {
                        "path": path_label,
                        "error": "storage_value_secret_material_key",
                        "pointer": child_pointer,
                        "field": key_str,
                    }
                )
            failures.extend(storage_value_secret_key_failures(child, path_label=path_label, pointer=child_pointer))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            failures.extend(
                storage_value_secret_key_failures(child, path_label=path_label, pointer=f"{pointer}[{index}]")
            )
    return failures


def storage_value_field_name_failures(fields: Any, *, path_label: str, field_list_name: str) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    if not isinstance(fields, list):
        failures.append({"path": path_label, "error": "storage_value_field_list_invalid", "field": field_list_name})
        return failures
    for field in fields:
        if not isinstance(field, str) or not field:
            failures.append({"path": path_label, "error": "storage_value_field_name_invalid", "field": field_list_name})
            continue
        if SECRET_MATERIAL_KEY_RE.search(field) and not storage_value_secret_key_allowed(field):
            failures.append(
                {
                    "path": path_label,
                    "error": "storage_value_secret_material_field",
                    "field": field,
                    "field_list": field_list_name,
                }
            )
    return failures


def storage_value_registry_spec_lock_failures() -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    spec_lock_path = PLANS / "Spec_Lock.json"
    try:
        spec_lock = read_json(spec_lock_path)
    except Exception as exc:  # noqa: BLE001
        return [{"path": rel(spec_lock_path), "error": "json_parse_failed", "detail": str(exc)}]
    schema_versions = spec_lock.get("schema_versions", {})
    if (
        not isinstance(schema_versions, dict)
        or schema_versions.get("storage_value_registry") != STORAGE_VALUE_REGISTRY_SCHEMA_ID
    ):
        failures.append(
            {
                "path": rel(spec_lock_path),
                "error": "storage_value_registry_schema_version_registration_missing",
                "expected": STORAGE_VALUE_REGISTRY_SCHEMA_ID,
                "actual": schema_versions.get("storage_value_registry") if isinstance(schema_versions, dict) else None,
            }
        )
    files = spec_lock.get("canonical_ssot_hashes", {}).get("files", [])
    if not isinstance(files, list):
        return [{"path": rel(spec_lock_path), "error": "spec_lock_canonical_ssot_files_missing"}]
    by_path = {row.get("path"): row for row in files if isinstance(row, dict)}
    for path in STORAGE_VALUE_REGISTRY_SPEC_LOCK_PATHS:
        entry = by_path.get(path)
        if not isinstance(entry, dict):
            failures.append(
                {
                    "path": rel(spec_lock_path),
                    "error": "storage_value_registry_spec_lock_registration_missing",
                    "required_path": path,
                }
            )
            continue
        target = ROOT / path
        if not target.exists():
            failures.append({"path": path, "error": "storage_value_registry_spec_lock_registered_path_missing"})
            continue
        current_hash = sha256_file(target)
        if entry.get("sha256") != current_hash:
            failures.append(
                {
                    "path": rel(spec_lock_path),
                    "error": "storage_value_registry_spec_lock_hash_stale",
                    "required_path": path,
                    "expected": current_hash,
                    "actual": entry.get("sha256"),
                }
            )
    return failures


def json_type_matches(value: Any, expected_type: str) -> bool:
    if expected_type == "object":
        return isinstance(value, dict)
    if expected_type == "array":
        return isinstance(value, list)
    if expected_type == "string":
        return isinstance(value, str)
    if expected_type == "boolean":
        return isinstance(value, bool)
    if expected_type == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if expected_type == "number":
        return (isinstance(value, int | float) and not isinstance(value, bool))
    if expected_type == "null":
        return value is None
    return False


def json_pointer_escape(token: str) -> str:
    return token.replace("~", "~0").replace("/", "~1")


def resolve_local_schema_ref(root_schema: dict[str, Any], ref: str) -> Any:
    if not ref.startswith("#/"):
        raise ValueError(f"unsupported non-local schema ref: {ref}")
    current: Any = root_schema
    for raw_part in ref[2:].split("/"):
        part = raw_part.replace("~1", "/").replace("~0", "~")
        if not isinstance(current, dict) or part not in current:
            raise KeyError(ref)
        current = current[part]
    return current


def draft202012_schema_failures(instance: Any, schema: Any, *, path_label: str) -> list[dict[str, Any]]:
    """Validate the Draft 2020-12 keywords used by PM readiness schemas."""
    failures: list[dict[str, Any]] = []
    if not isinstance(schema, dict):
        return [{"path": path_label, "error": "json_schema_not_object"}]
    root_schema = schema

    def fail(pointer: str, keyword: str, detail: dict[str, Any] | None = None) -> None:
        entry = {
            "path": path_label,
            "error": "draft_2020_12_schema_validation_failed",
            "pointer": pointer,
            "keyword": keyword,
        }
        if detail:
            entry.update(detail)
        failures.append(entry)

    def validate_node(value: Any, node: Any, pointer: str) -> None:
        if not isinstance(node, dict):
            return
        if "$ref" in node:
            try:
                target = resolve_local_schema_ref(root_schema, str(node["$ref"]))
            except Exception as exc:  # noqa: BLE001
                fail(pointer, "$ref", {"ref": node.get("$ref"), "detail": str(exc)})
                return
            validate_node(value, target, pointer)
            return

        expected_type = node.get("type")
        if expected_type is not None:
            allowed_types = expected_type if isinstance(expected_type, list) else [expected_type]
            if not any(isinstance(item, str) and json_type_matches(value, item) for item in allowed_types):
                fail(pointer, "type", {"expected": allowed_types, "actual_type": type(value).__name__})
                return

        if "const" in node and value != node["const"]:
            fail(pointer, "const", {"expected": node["const"], "actual": value})
        if "enum" in node:
            enum = node.get("enum")
            if isinstance(enum, list) and value not in enum:
                fail(pointer, "enum", {"allowed": enum, "actual": value})
        if isinstance(value, str):
            min_length = node.get("minLength")
            if isinstance(min_length, int) and len(value) < min_length:
                fail(pointer, "minLength", {"minLength": min_length})
            pattern = node.get("pattern")
            if isinstance(pattern, str) and re.search(pattern, value) is None:
                fail(pointer, "pattern", {"pattern": pattern, "actual": value})
            if node.get("format") == "date-time" and not re.match(
                r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$",
                value,
            ):
                fail(pointer, "format", {"format": "date-time", "actual": value})
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            minimum = node.get("minimum")
            if isinstance(minimum, (int, float)) and value < minimum:
                fail(pointer, "minimum", {"minimum": minimum, "actual": value})

        if isinstance(value, list):
            min_items = node.get("minItems")
            if isinstance(min_items, int) and len(value) < min_items:
                fail(pointer, "minItems", {"minItems": min_items, "actual": len(value)})
            if node.get("uniqueItems") is True:
                seen: set[str] = set()
                for item in value:
                    marker = json.dumps(item, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
                    if marker in seen:
                        fail(pointer, "uniqueItems")
                        break
                    seen.add(marker)
            if "items" in node:
                for index, item in enumerate(value):
                    validate_node(item, node["items"], f"{pointer}/{index}")

        if isinstance(value, dict):
            required = node.get("required")
            if isinstance(required, list):
                for field in required:
                    if field not in value:
                        fail(pointer, "required", {"missing": field})
            properties = node.get("properties")
            known_properties = set(properties) if isinstance(properties, dict) else set()
            if isinstance(properties, dict):
                for key, child_schema in properties.items():
                    if key in value:
                        validate_node(value[key], child_schema, f"{pointer}/{json_pointer_escape(str(key))}")
            if node.get("additionalProperties") is False:
                for key in value:
                    if key not in known_properties:
                        fail(f"{pointer}/{json_pointer_escape(str(key))}", "additionalProperties", {"field": key})

    validate_node(instance, schema, "$")
    return failures


def schema_document_instance_failures(
    *,
    schema_path: Path,
    instance_path: Path,
    schema_label: str,
    instance_label: str,
) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    try:
        schema = read_json(schema_path)
    except Exception as exc:  # noqa: BLE001
        return [{"path": schema_label, "error": "json_parse_failed", "detail": str(exc)}]
    try:
        instance = read_json(instance_path)
    except Exception as exc:  # noqa: BLE001
        return [{"path": instance_label, "error": "json_parse_failed", "detail": str(exc)}]
    if schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
        failures.append({"path": schema_label, "error": "json_schema_not_draft_2020_12"})
    failures.extend(draft202012_schema_failures(instance, schema, path_label=instance_label))
    return failures


def storage_value_registry_data_failures(
    registry: Any,
    *,
    path_label: str,
    required_launch_families: list[str] | None = None,
) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    required_launch_families = required_launch_families or STORAGE_VALUE_REQUIRED_LAUNCH_FAMILIES
    if not isinstance(registry, dict):
        return [{"path": path_label, "error": "storage_value_registry_not_object"}]
    if registry.get("schema_id") != STORAGE_VALUE_REGISTRY_SCHEMA_ID:
        failures.append(
            {
                "path": path_label,
                "error": "storage_value_registry_schema_id_mismatch",
                "expected": STORAGE_VALUE_REGISTRY_SCHEMA_ID,
                "actual": registry.get("schema_id"),
            }
        )
    if registry.get("schema_version") != STORAGE_VALUE_REGISTRY_SCHEMA_VERSION:
        failures.append(
            {
                "path": path_label,
                "error": "storage_value_registry_schema_version_mismatch",
                "expected": STORAGE_VALUE_REGISTRY_SCHEMA_VERSION,
                "actual": registry.get("schema_version"),
            }
        )
    policy = registry.get("buildability_gate_policy")
    if not isinstance(policy, dict):
        failures.append({"path": path_label, "error": "storage_value_registry_buildability_policy_missing"})
        policy = {}
    if policy.get("buildability_gate_passed_must_remain_false") is not True:
        failures.append({"path": path_label, "error": "storage_value_registry_buildability_false_policy_missing"})
    if policy.get("ordinary_product_worknodes_allowed") is not False:
        failures.append({"path": path_label, "error": "storage_value_registry_worknodes_allowed_policy_invalid"})
    if policy.get("ordinary_product_nodeseeds_allowed") is not False:
        failures.append({"path": path_label, "error": "storage_value_registry_nodeseeds_allowed_policy_invalid"})

    critical_ids = registry.get("critical_family_ids", [])
    if not isinstance(critical_ids, list):
        failures.append({"path": path_label, "error": "storage_value_registry_critical_ids_invalid"})
        critical_ids = []
    for family_id in required_launch_families:
        if family_id not in critical_ids:
            failures.append(
                {
                    "path": path_label,
                    "error": "storage_value_registry_critical_family_not_listed",
                    "family_id": family_id,
                }
            )

    families = registry.get("families", [])
    if not isinstance(families, list) or not families:
        return failures + [{"path": path_label, "error": "storage_value_registry_families_missing_or_invalid"}]

    row_required_fields = [
        "family_id",
        "storage_kind",
        "status",
        "tier",
        "key_shape",
        "value_schema_id",
        "value_schema_ref",
        "owner_doc",
        "producer",
        "consumers",
        "schema_version",
        "encoding",
        "required_fields",
        "optional_fields",
        "nullable_fields",
        "replay_behavior",
        "migration",
        "retention_compaction",
        "redaction_no_secret_rule",
        "legacy_canonical_crosswalk_status",
    ]
    by_family: dict[str, dict[str, Any]] = {}
    for index, family in enumerate(families, start=1):
        row_path = f"{path_label}:families[{index}]"
        if not isinstance(family, dict):
            failures.append({"path": row_path, "error": "storage_value_registry_family_not_object"})
            continue
        family_id = str(family.get("family_id", ""))
        if not family_id:
            failures.append({"path": row_path, "error": "storage_value_registry_family_id_missing"})
        elif family_id in by_family:
            failures.append({"path": row_path, "error": "storage_value_registry_duplicate_family_id", "family_id": family_id})
        else:
            by_family[family_id] = family

        for field in row_required_fields:
            if field not in family:
                failures.append({"path": row_path, "error": "storage_value_registry_family_field_missing", "field": field})

        owner_doc = str(family.get("owner_doc", ""))
        owner_path = ROOT / owner_doc.split("#", 1)[0]
        if not owner_doc or not owner_path.exists():
            failures.append({"path": row_path, "error": "storage_value_registry_family_owner_doc_missing", "owner_doc": owner_doc})

        for list_field in ["producer", "consumers"]:
            value = family.get(list_field)
            if not isinstance(value, list) or not value:
                failures.append({"path": row_path, "error": "storage_value_registry_family_list_empty", "field": list_field})

        required_fields = family.get("required_fields", [])
        failures.extend(
            storage_value_field_name_failures(required_fields, path_label=row_path, field_list_name="required_fields")
        )
        failures.extend(
            storage_value_field_name_failures(
                family.get("optional_fields", []),
                path_label=row_path,
                field_list_name="optional_fields",
            )
        )
        failures.extend(
            storage_value_field_name_failures(
                family.get("nullable_fields", []),
                path_label=row_path,
                field_list_name="nullable_fields",
            )
        )
        if "schema_version" not in required_fields:
            failures.append(
                {
                    "path": row_path,
                    "error": "storage_value_registry_persisted_value_missing_schema_version_requirement",
                    "family_id": family_id,
                }
            )

        status = family.get("status")
        value_schema = family.get("value_schema")
        if status == "materialized":
            if not isinstance(value_schema, dict):
                failures.append({"path": row_path, "error": "storage_value_registry_materialized_schema_missing"})
                continue
            if value_schema.get("type") != "object":
                failures.append({"path": row_path, "error": "storage_value_registry_value_schema_not_object"})
            if value_schema.get("additionalProperties") is not False:
                failures.append({"path": row_path, "error": "storage_value_registry_value_schema_not_closed"})
            schema_required = value_schema.get("required", [])
            if not isinstance(schema_required, list):
                failures.append({"path": row_path, "error": "storage_value_registry_value_schema_required_invalid"})
                schema_required = []
            for required_field in required_fields if isinstance(required_fields, list) else []:
                if required_field not in schema_required:
                    failures.append(
                        {
                            "path": row_path,
                            "error": "storage_value_registry_required_field_absent_from_value_schema",
                            "family_id": family_id,
                            "field": required_field,
                        }
                    )
            properties = value_schema.get("properties", {})
            if not isinstance(properties, dict):
                failures.append({"path": row_path, "error": "storage_value_registry_value_schema_properties_invalid"})
                properties = {}
            for required_field in schema_required:
                if required_field not in properties:
                    failures.append(
                        {
                            "path": row_path,
                            "error": "storage_value_registry_value_schema_required_property_missing",
                            "family_id": family_id,
                            "field": required_field,
                        }
                    )
            schema_id_property = properties.get("schema_id", {}) if isinstance(properties.get("schema_id"), dict) else {}
            if schema_id_property.get("const") != family.get("value_schema_id"):
                failures.append(
                    {
                        "path": row_path,
                        "error": "storage_value_registry_value_schema_id_const_mismatch",
                        "family_id": family_id,
                        "expected": family.get("value_schema_id"),
                        "actual": schema_id_property.get("const"),
                    }
                )
            schema_version_property = (
                properties.get("schema_version", {}) if isinstance(properties.get("schema_version"), dict) else {}
            )
            if schema_version_property.get("const") != family.get("schema_version"):
                failures.append(
                    {
                        "path": row_path,
                        "error": "storage_value_registry_value_schema_version_const_mismatch",
                        "family_id": family_id,
                        "expected": family.get("schema_version"),
                        "actual": schema_version_property.get("const"),
                    }
                )
            failures.extend(storage_value_secret_key_failures(value_schema, path_label=row_path))
        elif status == "deferred_not_build_blocking":
            for field in ["deferred_owner", "deferred_reason", "reopen_condition"]:
                if not family.get(field):
                    failures.append(
                        {
                            "path": row_path,
                            "error": "storage_value_registry_deferred_metadata_missing",
                            "family_id": family_id,
                            "field": field,
                        }
                    )
        elif status != "compatibility_alias":
            failures.append(
                {
                    "path": row_path,
                    "error": "storage_value_registry_unknown_family_status",
                    "family_id": family_id,
                    "status": status,
                }
            )

    for family_id in required_launch_families:
        family = by_family.get(family_id)
        if not family:
            failures.append({"path": path_label, "error": "storage_value_registry_required_family_missing", "family_id": family_id})
            continue
        if family.get("status") != "materialized":
            failures.append(
                {
                    "path": path_label,
                    "error": "storage_value_registry_required_family_not_materialized",
                    "family_id": family_id,
                    "status": family.get("status"),
                }
            )
    return failures


def storage_value_registry_contract_failures(actual_report: dict[str, Any], *, pnc019_certified: bool) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    if not STORAGE_VALUE_REGISTRY_SCHEMA_PATH.exists():
        failures.append({"path": rel(STORAGE_VALUE_REGISTRY_SCHEMA_PATH), "error": "storage_value_registry_schema_missing"})
    else:
        try:
            schema = read_json(STORAGE_VALUE_REGISTRY_SCHEMA_PATH)
        except Exception as exc:  # noqa: BLE001
            failures.append({"path": rel(STORAGE_VALUE_REGISTRY_SCHEMA_PATH), "error": "json_parse_failed", "detail": str(exc)})
            schema = {}
        if schema:
            if schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
                failures.append({"path": rel(STORAGE_VALUE_REGISTRY_SCHEMA_PATH), "error": "storage_value_registry_schema_not_draft_2020_12"})
            if schema.get("type") != "object":
                failures.append({"path": rel(STORAGE_VALUE_REGISTRY_SCHEMA_PATH), "error": "storage_value_registry_schema_type_not_object"})
            if schema.get("additionalProperties") is not False:
                failures.append({"path": rel(STORAGE_VALUE_REGISTRY_SCHEMA_PATH), "error": "storage_value_registry_schema_not_closed"})
            properties = schema.get("properties", {}) if isinstance(schema.get("properties"), dict) else {}
            schema_id = properties.get("schema_id", {}) if isinstance(properties.get("schema_id"), dict) else {}
            if schema_id.get("const") != STORAGE_VALUE_REGISTRY_SCHEMA_ID:
                failures.append(
                    {
                        "path": rel(STORAGE_VALUE_REGISTRY_SCHEMA_PATH),
                        "error": "storage_value_registry_schema_id_const_mismatch",
                        "expected": STORAGE_VALUE_REGISTRY_SCHEMA_ID,
                        "actual": schema_id.get("const"),
                    }
                )

    if not STORAGE_VALUE_REGISTRY_PATH.exists():
        return failures + [{"path": rel(STORAGE_VALUE_REGISTRY_PATH), "error": "storage_value_registry_missing"}]
    try:
        registry = read_json(STORAGE_VALUE_REGISTRY_PATH)
    except Exception as exc:  # noqa: BLE001
        return failures + [{"path": rel(STORAGE_VALUE_REGISTRY_PATH), "error": "json_parse_failed", "detail": str(exc)}]

    failures.extend(
        schema_document_instance_failures(
            schema_path=STORAGE_VALUE_REGISTRY_SCHEMA_PATH,
            instance_path=STORAGE_VALUE_REGISTRY_PATH,
            schema_label=rel(STORAGE_VALUE_REGISTRY_SCHEMA_PATH),
            instance_label=rel(STORAGE_VALUE_REGISTRY_PATH),
        )
    )
    failures.extend(storage_value_registry_data_failures(registry, path_label=rel(STORAGE_VALUE_REGISTRY_PATH)))
    failures.extend(storage_value_registry_spec_lock_failures())

    if actual_report.get("buildability_gate_passed") is True and not pnc019_certified:
        failures.append({"path": rel(REPORT_PATH), "error": "tier0c2_storage_value_registry_unexpected_buildability_pass"})

    return failures


def json_pointer_exists(document: Any, fragment: str) -> bool:
    if not fragment or fragment == "#":
        return True
    if not fragment.startswith("#/"):
        return False
    current = document
    for raw_token in fragment[2:].split("/"):
        token = raw_token.replace("~1", "/").replace("~0", "~")
        if isinstance(current, dict):
            if token not in current:
                return False
            current = current[token]
            continue
        if isinstance(current, list):
            if not token.isdigit():
                return False
            index = int(token)
            if index >= len(current):
                return False
            current = current[index]
            continue
        return False
    return True


def repo_ref_path_exists(ref: str) -> bool:
    if ref.startswith("python3 "):
        return True
    path_text, separator, fragment_text = ref.partition("#")
    if not path_text:
        return True
    if path_text.startswith("Plans/") or path_text.startswith("scripts/") or path_text.startswith("tests/"):
        target = ROOT / path_text
        if not target.exists():
            return False
        if separator and target.suffix == ".json":
            try:
                return json_pointer_exists(read_json(target), f"#{fragment_text}")
            except Exception:  # noqa: BLE001
                return False
        return True
    return True


def pnc019_ref_failures(refs: Any, *, path_label: str, field: str) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    if not isinstance(refs, list) or not refs:
        return [{"path": path_label, "error": "pnc019_evidence_refs_missing_or_invalid", "field": field}]
    for ref in refs:
        if not isinstance(ref, str) or not ref:
            failures.append({"path": path_label, "error": "pnc019_evidence_ref_invalid", "field": field, "ref": ref})
            continue
        if not repo_ref_path_exists(ref):
            failures.append({"path": path_label, "error": "pnc019_evidence_ref_missing", "field": field, "ref": ref})
    return failures


def pnc019_certification_receipt_failures() -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    for path in [PNC019_CERTIFICATION_HARNESS_PATH, PNC019_CERTIFICATION_RECEIPT_SCHEMA_PATH, PNC019_CERTIFICATION_RECEIPT_PATH]:
        if not path.exists():
            failures.append({"path": rel(path), "error": "pnc019_certification_artifact_missing"})
    if failures:
        return failures

    failures.extend(
        schema_document_instance_failures(
            schema_path=PNC019_CERTIFICATION_RECEIPT_SCHEMA_PATH,
            instance_path=PNC019_CERTIFICATION_RECEIPT_PATH,
            schema_label=rel(PNC019_CERTIFICATION_RECEIPT_SCHEMA_PATH),
            instance_label=rel(PNC019_CERTIFICATION_RECEIPT_PATH),
        )
    )
    try:
        receipt = read_json(PNC019_CERTIFICATION_RECEIPT_PATH)
    except Exception as exc:  # noqa: BLE001
        return failures + [{"path": rel(PNC019_CERTIFICATION_RECEIPT_PATH), "error": "json_parse_failed", "detail": str(exc)}]

    path_label = rel(PNC019_CERTIFICATION_RECEIPT_PATH)
    if receipt.get("schema_id") != PNC019_CERTIFICATION_SCHEMA_ID:
        failures.append(
            {
                "path": path_label,
                "error": "pnc019_certification_schema_id_mismatch",
                "expected": PNC019_CERTIFICATION_SCHEMA_ID,
                "actual": receipt.get("schema_id"),
            }
        )
    if receipt.get("schema_version") != PNC019_CERTIFICATION_SCHEMA_VERSION:
        failures.append(
            {
                "path": path_label,
                "error": "pnc019_certification_schema_version_mismatch",
                "expected": PNC019_CERTIFICATION_SCHEMA_VERSION,
                "actual": receipt.get("schema_version"),
            }
        )
    if receipt.get("certification_id") != "PNC-019":
        failures.append({"path": path_label, "error": "pnc019_certification_id_mismatch", "actual": receipt.get("certification_id")})
    if receipt.get("status") != "pass":
        failures.append({"path": path_label, "error": "pnc019_certification_status_not_pass", "actual": receipt.get("status")})

    generated_by = receipt.get("generated_by", {})
    if not isinstance(generated_by, dict) or generated_by.get("harness_path") != "scripts/pm-pnc019-certification-harness.py":
        failures.append({"path": path_label, "error": "pnc019_harness_path_missing_or_invalid"})
    scope_policy = receipt.get("scope_policy", {})
    if not isinstance(scope_policy, dict):
        failures.append({"path": path_label, "error": "pnc019_scope_policy_missing_or_invalid"})
        scope_policy = {}
    for field in ["harness_only_create_worknodes", "harness_only_create_nodeseeds", "ordinary_product_worknodes_allowed_by_harness"]:
        if scope_policy.get(field) is not False:
            failures.append(
                {
                    "path": path_label,
                    "error": "pnc019_harness_policy_overbroad",
                    "field": field,
                    "expected": False,
                    "actual": scope_policy.get(field),
                }
            )

    ordinary_counts = receipt.get("ordinary_product_artifact_counts", {})
    if not isinstance(ordinary_counts, dict):
        failures.append({"path": path_label, "error": "pnc019_ordinary_product_counts_missing_or_invalid"})
    else:
        for field in ["worknodes", "nodeseeds", "queues", "manifests", "runtime_launches", "production_build_tasks"]:
            if ordinary_counts.get(field) != 0:
                failures.append(
                    {
                        "path": path_label,
                        "error": "pnc019_ordinary_product_artifact_count_nonzero",
                        "field": field,
                        "actual": ordinary_counts.get(field),
                    }
                )

    positive_cases = receipt.get("positive_cases", [])
    negative_cases = receipt.get("negative_cases", [])
    if not isinstance(positive_cases, list):
        failures.append({"path": path_label, "error": "pnc019_positive_cases_missing_or_invalid"})
        positive_cases = []
    if not isinstance(negative_cases, list):
        failures.append({"path": path_label, "error": "pnc019_negative_cases_missing_or_invalid"})
        negative_cases = []

    positive_by_id = {case.get("case_id"): case for case in positive_cases if isinstance(case, dict)}
    negative_by_id = {case.get("case_id"): case for case in negative_cases if isinstance(case, dict)}
    for case_id in REQUIRED_PNC019_POSITIVE_CASE_IDS:
        case = positive_by_id.get(case_id)
        if not isinstance(case, dict):
            failures.append({"path": path_label, "error": "pnc019_positive_case_missing", "case_id": case_id})
            continue
        case_path = f"{path_label}#/positive_cases/{positive_cases.index(case)}"
        if case.get("status") != "pass" or case.get("executed") is not True:
            failures.append(
                {
                    "path": case_path,
                    "error": "pnc019_positive_case_not_passed_or_not_executed",
                    "case_id": case_id,
                    "status": case.get("status"),
                    "executed": case.get("executed"),
                }
            )
        failures.extend(pnc019_ref_failures(case.get("evidence_refs"), path_label=case_path, field="evidence_refs"))

    for case_id in REQUIRED_PNC019_NEGATIVE_CASE_IDS:
        case = negative_by_id.get(case_id)
        if not isinstance(case, dict):
            failures.append({"path": path_label, "error": "pnc019_negative_case_missing", "case_id": case_id})
            continue
        case_path = f"{path_label}#/negative_cases/{negative_cases.index(case)}"
        if case.get("status") != "pass" or case.get("executed") is not True or case.get("rejected") is not True:
            failures.append(
                {
                    "path": case_path,
                    "error": "pnc019_negative_case_not_rejected_or_not_executed",
                    "case_id": case_id,
                    "status": case.get("status"),
                    "executed": case.get("executed"),
                    "rejected": case.get("rejected"),
                }
            )
        if not case.get("expected_error"):
            failures.append({"path": case_path, "error": "pnc019_negative_case_expected_error_missing", "case_id": case_id})
        forbidden_counts = case.get("emitted_forbidden_artifact_counts", {})
        if not isinstance(forbidden_counts, dict):
            failures.append({"path": case_path, "error": "pnc019_negative_case_forbidden_counts_missing", "case_id": case_id})
        else:
            for field in ["plan_approved_events", "plan_compile_runs", "worknode_requests", "activation_receipts"]:
                if forbidden_counts.get(field) != 0:
                    failures.append(
                        {
                            "path": case_path,
                            "error": "pnc019_negative_case_forbidden_emission",
                            "case_id": case_id,
                            "field": field,
                            "actual": forbidden_counts.get(field),
                        }
                    )
        failures.extend(pnc019_ref_failures(case.get("evidence_refs"), path_label=case_path, field="evidence_refs"))

    trace_steps = [
        row.get("step_id")
        for row in receipt.get("lifecycle_trace", [])
        if isinstance(row, dict)
    ]
    if trace_steps != REQUIRED_PNC019_LIFECYCLE_STEPS:
        failures.append(
            {
                "path": path_label,
                "error": "pnc019_lifecycle_trace_order_mismatch",
                "expected": REQUIRED_PNC019_LIFECYCLE_STEPS,
                "actual": trace_steps,
            }
        )
    artifact_receipts = receipt.get("artifact_receipts", {})
    if not isinstance(artifact_receipts, dict):
        failures.append({"path": path_label, "error": "pnc019_artifact_receipts_missing_or_invalid"})
        artifact_receipts = {}
    for artifact_id in REQUIRED_PNC019_ARTIFACT_RECEIPTS:
        if artifact_id not in artifact_receipts:
            failures.append({"path": path_label, "error": "pnc019_required_artifact_receipt_missing", "artifact_id": artifact_id})

    storage_summary = receipt.get("storage_validation_summary", {})
    validated_family_ids = storage_summary.get("validated_family_ids", []) if isinstance(storage_summary, dict) else []
    for family_id in REQUIRED_PNC019_STORAGE_FAMILIES:
        if family_id not in validated_family_ids:
            failures.append({"path": path_label, "error": "pnc019_storage_family_not_validated", "family_id": family_id})

    source_hashes = receipt.get("source_hashes", {})
    if not isinstance(source_hashes, dict):
        failures.append({"path": path_label, "error": "pnc019_source_hashes_missing_or_invalid"})
        source_hashes = {}
    for path in REQUIRED_PNC019_SOURCE_HASH_PATHS:
        target = ROOT / path
        if not target.exists():
            failures.append({"path": path_label, "error": "pnc019_source_hash_path_missing", "source_path": path})
            continue
        expected = sha256_file(target)
        if source_hashes.get(path) != expected:
            failures.append(
                {
                    "path": path_label,
                    "error": "pnc019_source_hash_stale",
                    "source_path": path,
                    "expected": expected,
                    "actual": source_hashes.get(path),
                }
            )
    failures.extend(pnc019_ref_failures(receipt.get("evidence_refs"), path_label=path_label, field="evidence_refs"))
    return failures


def non_executable_closure_evidence_spec_lock_failures() -> list[dict[str, Any]]:
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
    for path in [
        "Plans/.implementation_readiness/non_executable_closure_evidence.schema.json",
        "Plans/.implementation_readiness/non_executable_closure_evidence.json",
        "scripts/pm-implementation-readiness.py",
    ]:
        entry = by_path.get(path)
        if not isinstance(entry, dict):
            failures.append(
                {
                    "path": rel(spec_lock_path),
                    "error": "non_executable_closure_spec_lock_registration_missing",
                    "required_path": path,
                }
            )
            continue
        target = ROOT / path
        if not target.exists():
            failures.append({"path": path, "error": "non_executable_closure_registered_path_missing"})
            continue
        current_hash = sha256_file(target)
        if entry.get("sha256") != current_hash:
            failures.append(
                {
                    "path": rel(spec_lock_path),
                    "error": "non_executable_closure_spec_lock_hash_stale",
                    "required_path": path,
                    "expected": current_hash,
                    "actual": entry.get("sha256"),
                }
            )
    return failures


def non_executable_closure_evidence_failures(
    actual_report: dict[str, Any],
    blockers: list[dict[str, Any]],
    *,
    pnc019_certified: bool,
) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    if not CLOSURE_EVIDENCE_SCHEMA_PATH.exists():
        failures.append({"path": rel(CLOSURE_EVIDENCE_SCHEMA_PATH), "error": "non_executable_closure_schema_missing"})
    if not CLOSURE_EVIDENCE_PATH.exists():
        return failures + [{"path": rel(CLOSURE_EVIDENCE_PATH), "error": "non_executable_closure_evidence_missing"}]

    if CLOSURE_EVIDENCE_SCHEMA_PATH.exists():
        failures.extend(
            schema_document_instance_failures(
                schema_path=CLOSURE_EVIDENCE_SCHEMA_PATH,
                instance_path=CLOSURE_EVIDENCE_PATH,
                schema_label=rel(CLOSURE_EVIDENCE_SCHEMA_PATH),
                instance_label=rel(CLOSURE_EVIDENCE_PATH),
            )
        )

    try:
        evidence = read_json(CLOSURE_EVIDENCE_PATH)
    except Exception as exc:  # noqa: BLE001
        return failures + [{"path": rel(CLOSURE_EVIDENCE_PATH), "error": "json_parse_failed", "detail": str(exc)}]

    if evidence.get("schema_id") != CLOSURE_EVIDENCE_SCHEMA_ID:
        failures.append(
            {
                "path": rel(CLOSURE_EVIDENCE_PATH),
                "error": "non_executable_closure_schema_id_mismatch",
                "expected": CLOSURE_EVIDENCE_SCHEMA_ID,
                "actual": evidence.get("schema_id"),
            }
        )
    if evidence.get("schema_version") != CLOSURE_EVIDENCE_SCHEMA_VERSION:
        failures.append(
            {
                "path": rel(CLOSURE_EVIDENCE_PATH),
                "error": "non_executable_closure_schema_version_mismatch",
                "expected": CLOSURE_EVIDENCE_SCHEMA_VERSION,
                "actual": evidence.get("schema_version"),
            }
        )
    if evidence.get("closed_blocker_families") != NON_EXECUTABLE_CLOSABLE_FAMILIES:
        failures.append(
            {
                "path": rel(CLOSURE_EVIDENCE_PATH),
                "error": "non_executable_closed_family_set_mismatch",
                "expected": NON_EXECUTABLE_CLOSABLE_FAMILIES,
                "actual": evidence.get("closed_blocker_families"),
            }
        )
    if evidence.get("remaining_blocker_families") != EXECUTABLE_PROOF_FAMILIES:
        failures.append(
            {
                "path": rel(CLOSURE_EVIDENCE_PATH),
                "error": "non_executable_remaining_family_set_mismatch",
                "expected": EXECUTABLE_PROOF_FAMILIES,
                "actual": evidence.get("remaining_blocker_families"),
            }
        )
    policy = evidence.get("buildability_policy", {}) if isinstance(evidence.get("buildability_policy"), dict) else {}
    if policy.get("buildability_gate_passed_must_remain_false") is not True:
        failures.append({"path": rel(CLOSURE_EVIDENCE_PATH), "error": "non_executable_closure_buildability_policy_missing"})
    for field, expected in {
        "ordinary_product_worknodes_allowed": False,
        "ordinary_product_nodeseeds_allowed": False,
        "pnc019_executable_lifecycle_certification_required": True,
    }.items():
        if policy.get(field) is not expected:
            failures.append(
                {
                    "path": rel(CLOSURE_EVIDENCE_PATH),
                    "error": "non_executable_closure_policy_field_invalid",
                    "field": field,
                    "expected": expected,
                    "actual": policy.get(field),
                }
            )

    forbidden_counts = evidence.get("forbidden_artifact_counts", {})
    if not isinstance(forbidden_counts, dict):
        failures.append({"path": rel(CLOSURE_EVIDENCE_PATH), "error": "forbidden_artifact_counts_missing"})
        forbidden_counts = {}
    for field in [
        "worknodes",
        "nodeseeds",
        "candidates",
        "queues",
        "manifests",
        "implementation_files",
        "runtime_launches",
        "production_build_tasks",
    ]:
        if forbidden_counts.get(field) != 0:
            failures.append(
                {
                    "path": rel(CLOSURE_EVIDENCE_PATH),
                    "error": "forbidden_artifact_count_nonzero",
                    "field": field,
                    "actual": forbidden_counts.get(field),
                }
            )

    records = evidence.get("closure_records", [])
    if not isinstance(records, list):
        failures.append({"path": rel(CLOSURE_EVIDENCE_PATH), "error": "closure_records_missing_or_invalid"})
        records = []
    records_by_family = {row.get("blocker_family"): row for row in records if isinstance(row, dict)}
    for family in NON_EXECUTABLE_CLOSABLE_FAMILIES:
        record = records_by_family.get(family)
        if not isinstance(record, dict):
            failures.append({"path": rel(CLOSURE_EVIDENCE_PATH), "error": "closure_record_missing", "blocker_family": family})
            continue
        for ref in record.get("evidence_refs", []):
            if not repo_ref_path_exists(str(ref)):
                failures.append(
                    {
                        "path": rel(CLOSURE_EVIDENCE_PATH),
                        "error": "closure_evidence_ref_missing",
                        "blocker_family": family,
                        "ref": ref,
                    }
                )
    for family in EXECUTABLE_PROOF_FAMILIES:
        if family in records_by_family:
            failures.append(
                {
                    "path": rel(CLOSURE_EVIDENCE_PATH),
                    "error": "executable_proof_family_must_not_have_non_executable_closure",
                    "blocker_family": family,
                }
            )

    artifact_rows = evidence.get("plancompile_artifact_payload_registry", [])
    artifact_kinds = {row.get("artifact_kind") for row in artifact_rows if isinstance(row, dict)}
    for artifact_kind in REQUIRED_PLANCOMPILE_ARTIFACT_KINDS:
        if artifact_kind not in artifact_kinds:
            failures.append(
                {
                    "path": rel(CLOSURE_EVIDENCE_PATH),
                    "error": "plancompile_artifact_payload_missing",
                    "artifact_kind": artifact_kind,
                }
            )
    for row in artifact_rows if isinstance(artifact_rows, list) else []:
        if not isinstance(row, dict):
            continue
        schema_ref = str(row.get("schema_ref", ""))
        if not repo_ref_path_exists(schema_ref):
            failures.append(
                {
                    "path": rel(CLOSURE_EVIDENCE_PATH),
                    "error": "plancompile_artifact_schema_ref_missing",
                    "artifact_kind": row.get("artifact_kind"),
                    "schema_ref": schema_ref,
                }
            )

    provider_contract = evidence.get("provider_stream_contract", {})
    if not isinstance(provider_contract, dict):
        failures.append({"path": rel(CLOSURE_EVIDENCE_PATH), "error": "provider_stream_contract_missing"})
        provider_contract = {}
    event_kinds = provider_contract.get("event_kinds", [])
    for event_kind in REQUIRED_PROVIDER_STREAM_EVENT_KINDS:
        if event_kind not in event_kinds:
            failures.append(
                {
                    "path": rel(CLOSURE_EVIDENCE_PATH),
                    "error": "provider_stream_event_kind_missing",
                    "event_kind": event_kind,
                }
            )
    owner_split = provider_contract.get("owner_split", {})
    if not isinstance(owner_split, dict) or not provider_contract.get("circular_owner_break"):
        failures.append({"path": rel(CLOSURE_EVIDENCE_PATH), "error": "provider_stream_owner_cycle_boundary_missing"})
    else:
        for owner_ref in owner_split.values():
            if not repo_ref_path_exists(str(owner_ref)):
                failures.append(
                    {
                        "path": rel(CLOSURE_EVIDENCE_PATH),
                        "error": "provider_stream_owner_ref_missing",
                        "ref": owner_ref,
                    }
                )

    fixture_ids = {
        row.get("fixture_id")
        for row in evidence.get("persistence_behavior_fixtures", [])
        if isinstance(row, dict)
    }
    for fixture_id in REQUIRED_PERSISTENCE_FIXTURE_IDS:
        if fixture_id not in fixture_ids:
            failures.append(
                {
                    "path": rel(CLOSURE_EVIDENCE_PATH),
                    "error": "persistence_fixture_missing",
                    "fixture_id": fixture_id,
                }
            )
    security_fixture_ids = {
        row.get("fixture_id")
        for row in evidence.get("security_boundary_fixtures", [])
        if isinstance(row, dict)
    }
    for fixture_id in REQUIRED_SECURITY_FIXTURE_IDS:
        if fixture_id not in security_fixture_ids:
            failures.append(
                {
                    "path": rel(CLOSURE_EVIDENCE_PATH),
                    "error": "security_fixture_missing",
                    "fixture_id": fixture_id,
                }
            )

    gui_contract = evidence.get("gui_wiring_contract", {})
    if not isinstance(gui_contract, dict):
        failures.append({"path": rel(CLOSURE_EVIDENCE_PATH), "error": "gui_wiring_contract_missing"})
        gui_contract = {}
    if gui_contract.get("command_id") != "cmd.planning_wizard.approve_and_build":
        failures.append({"path": rel(CLOSURE_EVIDENCE_PATH), "error": "gui_wiring_command_id_mismatch"})
    for field in ["state_selector", "disabled_reason_projection", "source_report", "handler_location"]:
        if not gui_contract.get(field):
            failures.append({"path": rel(CLOSURE_EVIDENCE_PATH), "error": "gui_wiring_field_missing", "field": field})
    if not isinstance(gui_contract.get("slint_bindings"), list) or len(gui_contract.get("slint_bindings", [])) < 3:
        failures.append({"path": rel(CLOSURE_EVIDENCE_PATH), "error": "gui_wiring_slint_bindings_incomplete"})
    if "hard_disabled.PNC-019" not in gui_contract.get("failure_projections", []):
        failures.append({"path": rel(CLOSURE_EVIDENCE_PATH), "error": "gui_wiring_pnc019_failure_projection_missing"})

    behavioral_contract = evidence.get("behavioral_acceptance_contract", {})
    if not isinstance(behavioral_contract, dict) or behavioral_contract.get("preservation_only_acceptance_allowed") is not False:
        failures.append({"path": rel(CLOSURE_EVIDENCE_PATH), "error": "behavioral_acceptance_preservation_only_not_rejected"})
    structural_contract = evidence.get("structural_integrity_contract", {})
    if not isinstance(structural_contract, dict) or "runtime_lifecycle and clean_room_harness remain open until executable evidence exists" not in structural_contract.get("required_checks", []):
        failures.append({"path": rel(CLOSURE_EVIDENCE_PATH), "error": "structural_integrity_executable_boundary_missing"})
    owner_contract = evidence.get("owner_routing_contract", {})
    if not isinstance(owner_contract, dict) or owner_contract.get("candidate_owners_allowed_for_closed_rows") is not False:
        failures.append({"path": rel(CLOSURE_EVIDENCE_PATH), "error": "owner_routing_candidate_owner_policy_missing"})
    currentness_contract = evidence.get("currentness_contract", {})
    if not isinstance(currentness_contract, dict) or currentness_contract.get("reject_stale_but_valid_json") is not True:
        failures.append({"path": rel(CLOSURE_EVIDENCE_PATH), "error": "currentness_stale_valid_json_rejection_missing"})

    for row in blockers:
        family = str(row.get("blocker_family", ""))
        status = str(row.get("status", "")).lower()
        row_path = f"{rel(BLOCKERS_PATH)}:{row.get('_line')}"
        if family in NON_EXECUTABLE_CLOSABLE_FAMILIES and status not in CLOSED_BLOCKER_STATUSES:
            failures.append(
                {
                    "path": row_path,
                    "error": "non_executable_family_not_closed_against_closure_evidence",
                    "blocker_family": family,
                    "closure_evidence": rel(CLOSURE_EVIDENCE_PATH),
                }
            )
        if family in EXECUTABLE_PROOF_FAMILIES and status in CLOSED_BLOCKER_STATUSES:
            if not pnc019_certified:
                failures.append(
                    {
                        "path": row_path,
                        "error": "executable_proof_family_closed_without_pnc019_evidence",
                        "blocker_family": family,
                    }
                )
        if status in CLOSED_BLOCKER_STATUSES and family in NON_EXECUTABLE_CLOSABLE_FAMILIES:
            refs = row.get("closure_evidence_refs", [])
            if not isinstance(refs, list) or rel(CLOSURE_EVIDENCE_PATH) not in [str(ref).split("#", 1)[0] for ref in refs]:
                failures.append(
                    {
                        "path": row_path,
                        "error": "closed_blocker_missing_non_executable_closure_evidence_ref",
                        "blocker_family": family,
                    }
                )
            for ref in refs if isinstance(refs, list) else []:
                if not repo_ref_path_exists(str(ref)):
                    failures.append(
                        {
                            "path": row_path,
                            "error": "closed_blocker_closure_evidence_ref_missing",
                            "blocker_family": family,
                            "ref": ref,
                        }
                    )

    if actual_report.get("buildability_gate_passed") is True and not pnc019_certified:
        failures.append({"path": rel(REPORT_PATH), "error": "non_executable_closure_unexpected_buildability_pass"})

    failures.extend(non_executable_closure_evidence_spec_lock_failures())
    return failures


def execution_unit_context_contract_failures(actual_report: dict[str, Any], *, pnc019_certified: bool) -> list[dict[str, Any]]:
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

    if actual_report.get("buildability_gate_passed") is True and not pnc019_certified:
        failures.append({"path": rel(REPORT_PATH), "error": "tier0b_execution_unit_context_unexpected_buildability_pass"})

    return failures


def executable_blocker_closure_failures(blockers: list[dict[str, Any]], *, pnc019_certified: bool) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    rows_by_id = {row.get("blocker_id"): row for row in blockers}
    for blocker_id, family in [("IRB-005", "runtime_lifecycle"), ("IRB-011", "clean_room_harness")]:
        row = rows_by_id.get(blocker_id)
        if not isinstance(row, dict):
            failures.append({"path": rel(BLOCKERS_PATH), "error": "pnc019_executable_blocker_missing", "blocker_id": blocker_id})
            continue
        row_path = f"{rel(BLOCKERS_PATH)}:{row.get('_line')}"
        status = str(row.get("status", "")).lower()
        if row.get("blocker_family") != family:
            failures.append(
                {
                    "path": row_path,
                    "error": "pnc019_executable_blocker_family_mismatch",
                    "blocker_id": blocker_id,
                    "expected": family,
                    "actual": row.get("blocker_family"),
                }
            )
        if pnc019_certified and status not in CLOSED_BLOCKER_STATUSES:
            failures.append(
                {
                    "path": row_path,
                    "error": "pnc019_certified_but_executable_blocker_not_closed",
                    "blocker_id": blocker_id,
                    "status": status,
                }
            )
        if status in CLOSED_BLOCKER_STATUSES:
            refs = row.get("closure_evidence_refs", [])
            if not isinstance(refs, list) or not refs:
                failures.append({"path": row_path, "error": "pnc019_closed_blocker_missing_closure_evidence_refs", "blocker_id": blocker_id})
                refs = []
            if rel(PNC019_CERTIFICATION_RECEIPT_PATH) not in {str(ref).split("#", 1)[0] for ref in refs}:
                failures.append(
                    {
                        "path": row_path,
                        "error": "pnc019_closed_blocker_missing_certification_receipt_ref",
                        "blocker_id": blocker_id,
                    }
                )
            for ref in refs:
                if not repo_ref_path_exists(str(ref)):
                    failures.append(
                        {
                            "path": row_path,
                            "error": "pnc019_closed_blocker_closure_evidence_ref_missing",
                            "blocker_id": blocker_id,
                            "ref": ref,
                        }
                    )
            if not pnc019_certified:
                failures.append(
                    {
                        "path": row_path,
                        "error": "pnc019_executable_blocker_closed_without_valid_certification_receipt",
                        "blocker_id": blocker_id,
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
    def fixture_storage_family(family_id: str, *, status: str = "materialized") -> dict[str, Any]:
        base = {
            "family_id": family_id,
            "storage_kind": "redb",
            "status": status,
            "tier": "tier_0_launch_critical" if status == "materialized" else "later_gui_or_feature_projection",
            "key_shape": f"{family_id}.v1:{{project_id}}:{{id}}",
            "value_schema_id": f"pm.storage_value.{family_id}.v1",
            "value_schema_ref": f"self-test:{family_id}",
            "owner_doc": "Plans/storage-plan.md",
            "producer": ["self-test producer"],
            "consumers": ["self-test consumer"],
            "schema_version": "1.0.0",
            "encoding": "messagepack_canonical",
            "required_fields": ["schema_id", "schema_version", "project_id"],
            "optional_fields": ["evidence_ref"],
            "nullable_fields": [],
            "replay_behavior": "self-test replay",
            "migration": "self-test migration",
            "retention_compaction": "self-test retention",
            "redaction_no_secret_rule": "self-test no-secret rule",
            "legacy_canonical_crosswalk_status": "self-test",
        }
        if status == "materialized":
            base["value_schema"] = {
                "type": "object",
                "additionalProperties": False,
                "required": ["schema_id", "schema_version", "project_id"],
                "properties": {
                    "schema_id": {"const": f"pm.storage_value.{family_id}.v1"},
                    "schema_version": {"const": "1.0.0"},
                    "project_id": {"type": "string"},
                    "evidence_ref": {"type": "string"},
                },
            }
        else:
            base.update(
                {
                    "deferred_owner": "Plans/storage-plan.md",
                    "deferred_reason": "self-test deferred",
                    "reopen_condition": "self-test reopen",
                }
            )
        return base

    storage_registry_fixture = {
        "$schema": "https://puppetmaster.local/schemas/storage_value_registry.schema.json",
        "schema_id": STORAGE_VALUE_REGISTRY_SCHEMA_ID,
        "schema_version": STORAGE_VALUE_REGISTRY_SCHEMA_VERSION,
        "generated_at_utc": "2026-07-06T00:00:00Z",
        "owner_doc": "Plans/storage-plan.md",
        "buildability_gate_policy": {
            "buildability_gate_passed_must_remain_false": True,
            "ordinary_product_worknodes_allowed": False,
            "ordinary_product_nodeseeds_allowed": False,
            "scope": "tier_0c_2_storage_value_contracts_only",
        },
        "critical_family_ids": list(STORAGE_VALUE_REQUIRED_LAUNCH_FAMILIES),
        "families": [fixture_storage_family(family_id) for family_id in STORAGE_VALUE_REQUIRED_LAUNCH_FAMILIES]
        + [fixture_storage_family("deferred_fixture", status="deferred_not_build_blocking")],
    }
    missing_schema_version_fixture = json.loads(json.dumps(storage_registry_fixture))
    missing_schema_version_fixture["families"][0]["required_fields"].remove("schema_version")
    missing_schema_version_fixture["families"][0]["value_schema"]["required"].remove("schema_version")
    secret_field_fixture = json.loads(json.dumps(storage_registry_fixture))
    secret_field_fixture["families"][0]["required_fields"].append("api_key")
    secret_field_fixture["families"][0]["value_schema"]["required"].append("api_key")
    secret_field_fixture["families"][0]["value_schema"]["properties"]["api_key"] = {"type": "string"}
    storage_registry_checks = {
        "valid_storage_value_registry": not storage_value_registry_data_failures(
            storage_registry_fixture,
            path_label="self-test:valid_storage_value_registry",
        ),
        "valid_storage_value_registry_draft_2020_12_schema": not draft202012_schema_failures(
            storage_registry_fixture,
            read_json(STORAGE_VALUE_REGISTRY_SCHEMA_PATH),
            path_label="self-test:valid_storage_value_registry_draft_2020_12_schema",
        ),
        "draft_2020_12_schema_rejects_missing_owner_doc": any(
            failure.get("keyword") == "required" and failure.get("missing") == "owner_doc"
            for failure in draft202012_schema_failures(
                {key: value for key, value in storage_registry_fixture.items() if key != "owner_doc"},
                read_json(STORAGE_VALUE_REGISTRY_SCHEMA_PATH),
                path_label="self-test:missing_owner_doc_storage_value_registry",
            )
        ),
        "missing_schema_version_rejected": any(
            failure.get("error") == "storage_value_registry_persisted_value_missing_schema_version_requirement"
            for failure in storage_value_registry_data_failures(
                missing_schema_version_fixture,
                path_label="self-test:missing_schema_version_storage_value_registry",
            )
        ),
        "secret_field_rejected": any(
            failure.get("error") == "storage_value_secret_material_field"
            for failure in storage_value_registry_data_failures(
                secret_field_fixture,
                path_label="self-test:secret_storage_value_registry",
            )
        ),
        "required_family_deferred_rejected": any(
            failure.get("error") == "storage_value_registry_required_family_not_materialized"
            for failure in storage_value_registry_data_failures(
                {
                    **storage_registry_fixture,
                    "families": [
                        fixture_storage_family(
                            STORAGE_VALUE_REQUIRED_LAUNCH_FAMILIES[0],
                            status="deferred_not_build_blocking",
                        )
                    ]
                    + [
                        fixture_storage_family(family_id)
                        for family_id in STORAGE_VALUE_REQUIRED_LAUNCH_FAMILIES[1:]
                    ],
                },
                path_label="self-test:required_family_deferred",
            )
        ),
    }
    if not all(storage_registry_checks.values()):
        failures.append(
            {
                "scenario": "storage_value_registry",
                "checks": storage_registry_checks,
            }
        )
    return {
        "schema_id": "pm.implementation_readiness.self_test_report.v1",
        "generated_at_utc": utc_now(),
        "status": "pass" if not failures else "fail",
        "scenarios": results,
        "field_claim_checks": field_claim_checks,
        "event_record_checks": event_record_checks,
        "storage_registry_checks": storage_registry_checks,
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
        pnc019_certification_failures = pnc019_certification_receipt_failures()
        pnc019_certified = not pnc019_certification_failures
        failures.extend(pnc019_certification_failures)
        failures.extend(
            gate_semantic_failures(
                actual_report=actual_report,
                blockers=blockers,
                current_hashes=source_hashes(),
                path=rel(REPORT_PATH),
            )
        )
        failures.extend(pnc019_bootstrap_authority_failures(actual_report))
        failures.extend(event_record_contract_failures(actual_report, pnc019_certified=pnc019_certified))
        failures.extend(storage_value_registry_contract_failures(actual_report, pnc019_certified=pnc019_certified))
        failures.extend(non_executable_closure_evidence_failures(actual_report, blockers, pnc019_certified=pnc019_certified))
        failures.extend(execution_unit_context_contract_failures(actual_report, pnc019_certified=pnc019_certified))
        failures.extend(executable_blocker_closure_failures(blockers, pnc019_certified=pnc019_certified))

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
