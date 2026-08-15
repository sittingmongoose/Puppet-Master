#!/usr/bin/env python3
"""Validate Puppet Master implementation-buildability readiness artifacts."""

from __future__ import annotations

import argparse
import base64
import hashlib
import importlib.util
import json
import re
import struct
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

def _load_pnc019_currentness():
    """Load the governed helper from this script's directory."""
    module_name = "pm_pnc019_currentness"
    helper_path = Path(__file__).resolve().with_name("pm_pnc019_currentness.py")
    existing = sys.modules.get(module_name)
    if existing is not None:
        existing_path = getattr(existing, "__file__", None)
        if existing_path is None or Path(existing_path).resolve() != helper_path:
            raise ImportError(f"{module_name} is already loaded from a different path")
        return existing

    spec = importlib.util.spec_from_file_location(module_name, helper_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"unable to load governed helper: {helper_path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    try:
        spec.loader.exec_module(module)
    except BaseException:
        if sys.modules.get(module_name) is module:
            del sys.modules[module_name]
        raise
    return module


_pnc019_currentness = _load_pnc019_currentness()
EVENT_FAMILY_BULK_REGISTRATION_ALLOWED = _pnc019_currentness.EVENT_FAMILY_BULK_REGISTRATION_ALLOWED
EVENT_FAMILY_DENOMINATOR_STATUS = _pnc019_currentness.EVENT_FAMILY_DENOMINATOR_STATUS
EVENT_FAMILY_EVIDENCE_CURRENTNESS = _pnc019_currentness.EVENT_FAMILY_EVIDENCE_CURRENTNESS
EVENT_FAMILY_EVIDENCE_REFS = _pnc019_currentness.EVENT_FAMILY_EVIDENCE_REFS
EVENT_FAMILY_QUARANTINED_ROW_COUNT = _pnc019_currentness.EVENT_FAMILY_QUARANTINED_ROW_COUNT
EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT = _pnc019_currentness.EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT
EVENT_FAMILY_REGISTRY_SCHEMA_ID = _pnc019_currentness.EVENT_FAMILY_REGISTRY_SCHEMA_ID
EVENT_FAMILY_REGISTRY_SCHEMA_VERSION = _pnc019_currentness.EVENT_FAMILY_REGISTRY_SCHEMA_VERSION
REQUIRED_PNC019_SOURCE_HASH_PATHS = _pnc019_currentness.REQUIRED_PNC019_SOURCE_HASH_PATHS
pnc019_event_authority_clearance_failures = _pnc019_currentness.pnc019_event_authority_clearance_failures
pnc019_event_authority_failures_for_registry = _pnc019_currentness.pnc019_event_authority_failures_for_registry
pnc019_source_hash_failures = _pnc019_currentness.pnc019_source_hash_failures


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
PNC019_CURRENTNESS_HELPER_PATH = ROOT / "scripts/pm_pnc019_currentness.py"
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
PNC019_EXECUTABLE_BLOCKER_FAMILIES_BY_ID = {
    "IRB-005": "runtime_lifecycle",
    "IRB-011": "clean_room_harness",
}
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
    "Plans/storage_recovery_contracts.schema.json",
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
    "Plans/Commands_System.md",
    "Plans/assistant-chat-design.md",
    "Plans/FinalGUISpec.md",
    "Plans/WorktreeGitImprovement.md",
    "Plans/Orchestrator_Page.md",
    "Plans/event_record.schema.json",
    "Plans/event_family_registry.schema.json",
    "Plans/event_family_registry.json",
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
    "tests/fixtures/event_record/legacy_normalization/golden/event_envelope_v1_to_event_record_v2.json",
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
EVENT_RECORD_SCHEMA_VERSION = "2.0.0"
EVENT_RECORD_COMPATIBILITY_SCHEMA_VERSION = "1.0.0"
EVENT_RECORD_COMPATIBILITY_READER_DEF = "event_record_1_0_0_compatibility_reader"
EVENT_RECORD_SCOPE_KINDS = ["application", "project"]
EVENT_RECORD_REDACTION_PROFILES = ["no_secrets", "redacted", "secret_refs_only"]
EVENT_RECORD_REPLAY_POLICIES = [
    "append_once",
    "dedupe_by_event_id",
    "dedupe_by_idempotency_key",
    "projector_replay_only",
]
EVENT_RECORD_REQUIRED_FIELDS = [
    "schema_id",
    "schema_version",
    "scope_kind",
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
EVENT_RECORD_COMPATIBILITY_REQUIRED_FIELDS = [
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
EVENT_FAMILY_REGISTRY_PATH = PLANS / "event_family_registry.json"
EVENT_FAMILY_REGISTRY_SCHEMA_PATH = PLANS / "event_family_registry.schema.json"
EVENT_FAMILY_REGISTRY_SCHEMA_URI = (
    "https://puppetmaster.local/schemas/event_family_registry/1.0.0/event_family_registry.schema.json"
)
EVENT_FAMILY_GOAL_OWNER_SCHEMA_PATH = PLANS / "goal_runtime_events.schema.json"
EVENT_FAMILY_GOAL_PAYLOAD_SCHEMA_REFS = {
    "goal.created": "Plans/event_payloads/goal_runtime/goal_created.schema.json",
    "goal.scheduled": "Plans/event_payloads/goal_runtime/goal_scheduled.schema.json",
    "goal.progressed": "Plans/event_payloads/goal_runtime/goal_progressed.schema.json",
    "goal.tool_check_recorded": "Plans/event_payloads/goal_runtime/goal_tool_check_recorded.schema.json",
    "goal.updated": "Plans/event_payloads/goal_runtime/goal_updated.schema.json",
    "goal.replanned": "Plans/event_payloads/goal_runtime/goal_replanned.schema.json",
    "goal.child_status_changed": "Plans/event_payloads/goal_runtime/goal_child_status_changed.schema.json",
    "goal.evidence_captured": "Plans/event_payloads/goal_runtime/goal_evidence_captured.schema.json",
    "goal.verification_decided": "Plans/event_payloads/goal_runtime/goal_verification_decided.schema.json",
    "goal.receipt_recorded": "Plans/event_payloads/goal_runtime/goal_receipt_recorded.schema.json",
    "goal.completed": "Plans/event_payloads/goal_runtime/goal_completed.schema.json",
    "goal.degraded": "Plans/event_payloads/goal_runtime/goal_degraded.schema.json",
    "goal.stopped": "Plans/event_payloads/goal_runtime/goal_stopped.schema.json",
    "goal.blocked": "Plans/event_payloads/goal_runtime/goal_blocked.schema.json",
    "goal.cancelled": "Plans/event_payloads/goal_runtime/goal_cancelled.schema.json",
    "goal_run.started": "Plans/event_payloads/goal_runtime/goal_run_started.schema.json",
    "goal_run.replanned": "Plans/event_payloads/goal_runtime/goal_run_replanned.schema.json",
    "goal_run.blocked": "Plans/event_payloads/goal_runtime/goal_run_blocked.schema.json",
    "goal_run.certified": "Plans/event_payloads/goal_runtime/goal_run_certified.schema.json",
    "goal_run.cancelled": "Plans/event_payloads/goal_runtime/goal_run_cancelled.schema.json",
    "goal_run.stopped": "Plans/event_payloads/goal_runtime/goal_run_stopped.schema.json",
}
EVENT_FAMILY_LEGACY_FIXTURE_PATH = (
    ROOT
    / "tests/fixtures/event_record/legacy_normalization/golden/event_envelope_v1_to_event_record_v2.json"
)
EVENT_FAMILY_REQUIRED_SCOPE_POLICIES = {
    "storage.boot_recovery": "application_only",
    "storage.integrity_detected": "application_only",
    "storage.recovery_applied": "application_only",
    "storage.compaction_lifecycle_changed": "application_only",
    "platform.capability_evaluated": "application_or_project",
    "storage.retention_hold_changed": "application_or_project",
    "storage.value_quarantine_changed": "application_or_project",
    "storage.deletion_lifecycle_changed": "application_or_project",
    "seglog.event_appended": "inherits_referenced_event",
    "run.started": "project_only",
    "safe_point.recovery_unavailable": "project_only",
    "restore_point.created": "project_only",
    "restore_point.applied": "project_only",
    "restore_point.expired": "project_only",
    "restore_point.deleted": "project_only",
    "restore_point.corrupt": "project_only",
}

STORAGE_VALUE_REGISTRY_SCHEMA_PATH = PLANS / "storage_value_registry.schema.json"
STORAGE_VALUE_REGISTRY_PATH = PLANS / "storage_value_registry.json"
SHARED_RUNTIME_CONTRACTS_SCHEMA_PATH = PLANS / "shared_runtime_contracts.schema.json"
STORAGE_RECOVERY_CONTRACTS_SCHEMA_PATH = PLANS / "storage_recovery_contracts.schema.json"
CASE_L_COMMAND_CATALOG_PATH = PLANS / "UI_Command_Catalog.md"
CASE_L_WIRING_MATRIX_PATH = PLANS / "Wiring_Matrix.production.json"
CASE_L_UI_WIRING_RULES_PATH = PLANS / "UI_Wiring_Rules.md"
CASE_L_COMMAND_SYSTEM_PATH = PLANS / "Commands_System.md"
CASE_L_STORAGE_OWNER_PATH = PLANS / "storage-plan.md"
CASE_L_CONTRACTS_OWNER_PATH = PLANS / "Contracts_V0.md"
CASE_L_COMMAND_SURFACE_PATHS = [
    PLANS / "UI_Command_Catalog.md",
    PLANS / "Wiring_Matrix.production.json",
    PLANS / "UI_Wiring_Rules.md",
    PLANS / "Commands_System.md",
    PLANS / "assistant-chat-design.md",
    PLANS / "FinalGUISpec.md",
    PLANS / "WorktreeGitImprovement.md",
    PLANS / "Executor_Protocol.md",
    PLANS / "Orchestrator_Page.md",
]
CASE_L_MIGRATION_PHASES = [
    "preflight",
    "backup_in_progress",
    "backup_verified",
    "applying",
    "pre_stamp_verified",
    "stamp_committed",
    "post_stamp_verifying",
    "committed",
    "restore_required",
    "restoring",
    "rolled_back",
    "blocked",
]
CASE_L_PREFLIGHT_REQUIRED_FIELDS = [
    "outcome",
    "reason_code",
    "filesystem_ref",
    "free_bytes",
    "required_free_bytes",
    "backup_bytes",
    "staging_bytes",
    "reserve_bytes",
    "checked_at_utc",
]
CASE_L_PREFLIGHT_ASSERTIONS = [
    {
        "id": "reserve_formula",
        "expression": "reserve_bytes == max(268435456, ceil(0.10 * (backup_bytes + staging_bytes)))",
    },
    {
        "id": "required_free_formula",
        "expression": "required_free_bytes == backup_bytes + staging_bytes + reserve_bytes",
    },
    {
        "id": "ready_space_pairing",
        "expression": "outcome != 'ready' or free_bytes >= required_free_bytes",
    },
    {
        "id": "blocked_space_pairing",
        "expression": "outcome != 'blocked' or free_bytes < required_free_bytes",
    },
]
CASE_L_PROGRESS_ASSERTIONS = [
    {"id": "step_bounds", "expression": "0 <= completed_steps <= total_steps"},
    {
        "id": "byte_bounds_when_present",
        "expression": "bytes_done is absent or 0 <= bytes_done <= bytes_total",
    },
]
CASE_L_FALLBACK_COMMAND_HANDLERS = {
    "cmd.storage.fallback.keep_logical_root": "handlers::storage::fallback_keep_logical_root",
    "cmd.storage.fallback.fork_new_instance": "handlers::storage::fallback_fork_new_instance",
    "cmd.storage.fallback.export_both": "handlers::storage::fallback_export_both",
}
CASE_L_FALLBACK_CONFIRMATIONS = {
    "cmd.storage.fallback.keep_logical_root": "retain_fallback_and_select_logical",
    "cmd.storage.fallback.fork_new_instance": "create_inactive_candidate_without_switch",
    "cmd.storage.fallback.export_both": "encrypt_exact_bytes_and_retain_sources",
}
CASE_L_FALLBACK_CAS_FIELDS = [
    "expected_storage_instance_id",
    "expected_logical_root_fingerprint",
    "expected_root_generation",
    "expected_fallback_branch_id",
    "expected_fallback_base_ref",
    "expected_logical_head_sha256",
    "expected_fallback_head_sha256",
    "expected_bootstrap_binding_sha256",
]
CASE_L_FALLBACK_COMMON_REQUEST_FIELDS = [
    "command_id",
    "idempotency_key",
    "actor_ref",
    "confirmation",
    *CASE_L_FALLBACK_CAS_FIELDS,
]
CASE_L_FALLBACK_EXPORT_REQUEST_FIELDS = ["destination_ref", "encryption_key_ref"]
CASE_L_FALLBACK_RESULT_FIELDS = [
    "command_id",
    "idempotency_key",
    "outcome",
    "reason_code",
    "storage_access_mode",
    "storage_mode_reason",
    "active_bootstrap_binding_sha256",
    "logical_head_sha256",
    "fallback_head_sha256",
    "retained_logical_root_ref",
    "retained_fallback_root_ref",
    "binding_changed",
    "cleanup_performed",
    "owner_receipt_ref",
    "candidate_binding",
    "export_custody",
]
CASE_L_FALLBACK_RESULT_OUTCOMES = ["applied", "replayed", "refused", "failed_recoverable"]
CASE_L_FALLBACK_CANDIDATE_BINDING_FIELDS = [
    "storage_instance_id",
    "parent_storage_instance_id",
    "parent_fallback_branch_id",
    "candidate_binding_ref",
    "candidate_bootstrap_binding_sha256",
    "candidate_binding_state",
]
CASE_L_FALLBACK_EXPORT_CUSTODY_FIELDS = [
    "destination_ref",
    "package_ref",
    "manifest_ref",
    "encryption_algorithm",
    "encryption_key_ref",
    "logical_bytes",
    "logical_sha256",
    "fallback_bytes",
    "fallback_sha256",
    "verified_at_utc",
]
CASE_L_FALLBACK_RECEIPT = "StorageFallbackResolutionReceipt"
CASE_L_FALLBACK_RECEIPT_FIELDS = [
    "receipt_id",
    "command_id",
    "idempotency_key",
    "canonical_request_sha256",
    "disposition",
    "outcome",
    "reason_code",
    "actor_ref",
    "observed_cas",
    "before_active_bootstrap_binding_sha256",
    "after_active_bootstrap_binding_sha256",
    "before_logical_head_sha256",
    "after_logical_head_sha256",
    "before_fallback_head_sha256",
    "after_fallback_head_sha256",
    "retained_logical_root_ref",
    "retained_fallback_root_ref",
    "resulting_storage_instance_id",
    "candidate_binding_ref",
    "candidate_bootstrap_binding_sha256",
    "export_package_ref",
    "export_manifest_ref",
    "encryption_key_ref",
    "binding_changed",
    "cleanup_performed",
    "completed_at_utc",
]
CASE_L_FALLBACK_RETIRED_SUCCESS_OUTCOMES = [
    "kept_logical_root",
    "fork_candidate_created",
    "exported",
]
CASE_L_RESTORE_COMMAND_IDS = [
    "cmd.runtime.restore_safe_point_then_retry",
    "cmd.orchestrator.safe_point_retry",
    "cmd.orchestrator.restore_safe_point_then_retry",
]
CASE_L_RESTORE_HANDLER = "handlers::runtime::restore_safe_point_then_retry"
CASE_L_RESTORE_EVENT = "safe_point.restored"
CASE_L_RESTORE_WRAPPER_FIELDS = [
    "project_id",
    "run_id",
    "node_id",
    "blocked_sequence",
    "attempt_id",
    "safe_point_id",
    "repo_id",
    "worktree_id",
    "baseline_target",
    "permission_snapshot_id",
]
STORAGE_VALUE_REGISTRY_SCHEMA_ID = "pm.storage_value_registry.v2"
STORAGE_VALUE_REGISTRY_SCHEMA_VERSION = "2.0.0"
STORAGE_VALUE_REGISTRY_SCHEMA_URI = (
    "https://puppetmaster.local/schemas/storage_value_registry/2.0.0/storage_value_registry.schema.json"
)
STORAGE_VALUE_REGISTRY_EXPECTED_FAMILY_COUNT = 59
STORAGE_VALUE_REGISTRY_EXPECTED_RETENTION_POLICY_COUNT = 24
STORAGE_VALUE_REGISTRY_EXPECTED_STATUS_COUNTS = {
    "materialized": 41,
    "deferred_not_build_blocking": 17,
    "compatibility_alias": 1,
}
STORAGE_VALUE_REGISTRY_EXPECTED_TIER_COUNTS = {
    "tier_0_launch_critical": 16,
    "later_gui_or_feature_projection": 42,
    "migration_only": 1,
}
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
    "migration_receipt",
    "safe_point_record",
    "safe_point_restore_transaction",
    "requested_effective_runtime",
    "recovery_unavailable_resolution_receipt",
]
STORAGE_VALUE_REQUIRED_MVP_FAMILIES = [
    "migration_receipt",
    "editor_buffer_recovery_state",
    "editor_workspace_state",
    "hotreload_state",
    "onboarding_state",
    "safe_point_record",
    "safe_point_restore_transaction",
    "restore_point_record",
    "event_id_dedupe_index",
    "event_idempotency_dedupe_index",
    "event_dedupe_checkpoint",
    "retention_hold_record",
    "recovery_anchor_record",
    "storage_maintenance_operation",
    "storage_quarantine_record",
    "storage_deletion_record",
    "requested_effective_runtime",
    "recovery_unavailable_resolution_receipt",
    "home_workspace_layout",
    "permission_snapshot_record",
    "provider_dispatch_admission_receipt",
]
STORAGE_VALUE_EVENT_IDENTITY_CONTRACT = {
    "event_schema_id": "pm.event.v0",
    "writer_schema_version": "2.0.0",
    "scope_partition_application": "app",
    "scope_partition_project_formula": "project~{base64url_no_pad(UTF8(project_id))}",
    "event_id_uniqueness": "app_data_root_lifetime_global",
    "idempotency_uniqueness": "app_data_root_lifetime_scope_partition_event_type",
    "event_record_index_family_id": "event_record_index",
    "event_id_dedupe_family_id": "event_id_dedupe_index",
    "idempotency_dedupe_family_id": "event_idempotency_dedupe_index",
    "dedupe_checkpoint_family_id": "event_dedupe_checkpoint",
    "dedupe_outage_result": "dedupe_unavailable_no_append",
    "projector_replay_only_append_result": "replay_only_not_appendable",
}
STORAGE_VALUE_REQUIRED_KEY_SHAPES = {
    "event_record_index": "event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}",
    "safe_point_record": "sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}",
    "safe_point_restore_transaction": (
        "safe_point_restore_transaction.v1:{project_id}:{restore_transaction_id}"
    ),
    "restore_point_record": "rp:{project_id}:{restore_point_id}",
    "event_id_dedupe_index": "event_id_dedupe.v1:{sha256_utf8(event_id)}",
    "event_idempotency_dedupe_index": (
        "event_idempotency_dedupe.v1:{scope_partition}:{sha256_utf8(event_type)}:"
        "{sha256_utf8(idempotency_key)}"
    ),
    "event_dedupe_checkpoint": "event_dedupe_checkpoint.v1:{storage_instance_id}",
    "retention_hold_record": "retention_hold_record.v1:{scope_partition}:{hold_id}",
    "recovery_anchor_record": "recovery_anchor_record.v1:{project_id}:{anchor_id}",
    "storage_maintenance_operation": "storage_maintenance_operation.v1:{storage_instance_id}:{operation_id}",
    "storage_quarantine_record": "storage_quarantine_record.v1:{storage_instance_id}:{quarantine_id}",
    "storage_deletion_record": "storage_deletion_record.v1:{scope_partition}:{deletion_id}",
    "permission_snapshot_record": "permission_snapshot_record.v1:{project_id}:{snapshot_id}",
    "provider_dispatch_admission_receipt": (
        "provider_dispatch_admission_receipt.v1:{project_id}:{receipt_id}"
    ),
}
STORAGE_VALUE_REQUIRED_STORAGE_KINDS = {
    "event_record_index": "redb_index",
    "safe_point_record": "redb",
    "safe_point_restore_transaction": "redb",
    "restore_point_record": "redb",
    "event_id_dedupe_index": "redb_index",
    "event_idempotency_dedupe_index": "redb_index",
    "event_dedupe_checkpoint": "redb_checkpoint",
    "retention_hold_record": "redb_and_seglog",
    "recovery_anchor_record": "redb_and_seglog",
    "storage_maintenance_operation": "redb",
    "storage_quarantine_record": "redb",
    "storage_deletion_record": "redb_and_seglog",
    "permission_snapshot_record": "redb",
    "provider_dispatch_admission_receipt": "redb",
}
STORAGE_VALUE_REQUIRED_RECOVERY_AUTHORITIES = {
    "event_record_index": "derived_rebuildable",
    "safe_point_record": "required_recovery_anchor",
    "safe_point_restore_transaction": "required_recovery_anchor",
    "restore_point_record": "canonical_non_rebuildable",
    "event_id_dedupe_index": "derived_rebuildable",
    "event_idempotency_dedupe_index": "derived_rebuildable",
    "event_dedupe_checkpoint": "derived_rebuildable",
    "retention_hold_record": "canonical_dual_homed",
    "recovery_anchor_record": "required_recovery_anchor",
    "storage_maintenance_operation": "canonical_non_rebuildable",
    "storage_quarantine_record": "required_recovery_anchor",
    "storage_deletion_record": "canonical_dual_homed",
    "permission_snapshot_record": "canonical_non_rebuildable",
    "provider_dispatch_admission_receipt": "canonical_non_rebuildable",
}
SHARED_RUNTIME_STORAGE_PRIMITIVE_DEFS = [
    "non_empty_string",
    "nullable_non_empty_string",
    "timestamp",
    "nullable_timestamp",
    "sha256",
    "non_secret_ref",
    "nullable_non_secret_ref",
    "ref_list",
]
SHARED_RUNTIME_STORAGE_FAMILIES = {
    "permission_snapshot_record": {
        "value_schema_ref": "Plans/shared_runtime_contracts.schema.json#/$defs/permission_snapshot_record",
        "retention_policy_ref": "RP-AUTHORITY-INDEFINITE",
    },
    "provider_dispatch_admission_receipt": {
        "value_schema_ref": "Plans/shared_runtime_contracts.schema.json#/$defs/provider_dispatch_admission_receipt",
        "retention_policy_ref": "RP-RUNTIME-365D",
    },
}
STORAGE_VALUE_REGISTRY_SPEC_LOCK_PATHS = [
    "Plans/shared_runtime_contracts.schema.json",
    "Plans/storage_recovery_contracts.schema.json",
    "Plans/storage_value_registry.schema.json",
    "Plans/storage_value_registry.json",
    "Plans/.implementation_readiness/non_executable_closure_evidence.schema.json",
    "Plans/.implementation_readiness/non_executable_closure_evidence.json",
    "scripts/pm-implementation-readiness.py",
    "scripts/pm-shared-runtime-contracts.py",
    "scripts/pm-shared-runtime-storage-materialize.py",
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


def effective_open_blockers_from(
    blockers: list[dict[str, Any]],
    *,
    pnc019_certification_current: bool,
) -> list[dict[str, Any]]:
    effective: list[dict[str, Any]] = []
    for row in blockers:
        blocker_id = str(row.get("blocker_id", ""))
        blocker_family = str(row.get("blocker_family", ""))
        certification_reopens_blocker = (
            not pnc019_certification_current
            and PNC019_EXECUTABLE_BLOCKER_FAMILIES_BY_ID.get(blocker_id) == blocker_family
        )
        if not is_open_blocker(row) and not certification_reopens_blocker:
            continue

        projected = dict(row)
        if certification_reopens_blocker and not is_open_blocker(row):
            projected.pop("closed_at_utc", None)
            projected.update(
                {
                    "status": "open",
                    "closure_scope": "reopened_until_current_pnc019_executable_lifecycle_certification",
                    "effective_reopen_reason": "pnc019_certification_not_current",
                    "summary": (
                        f"{blocker_id} {blocker_family} is effectively open because the governed "
                        "PNC-019 certification receipt is not current."
                    ),
                    "notes": (
                        "The blocker registry preserves the historical closure row, but this generated "
                        "currentness projection reopens it until the executable certification receipt "
                        "passes with current source bindings and Event Authority evidence."
                    ),
                }
            )
        effective.append(projected)
    return effective


def report_effectively_opens_blocker(
    actual_report: dict[str, Any],
    *,
    blocker_id: str,
    blocker_family: str,
) -> bool:
    rows = actual_report.get("remaining_open_blockers", [])
    return isinstance(rows, list) and any(
        isinstance(row, dict)
        and row.get("blocker_id") == blocker_id
        and row.get("blocker_family") == blocker_family
        for row in rows
    )


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
    pnc019_certification_current: bool,
    hash_map: dict[str, str],
    generated_at_utc: str | None = None,
) -> dict[str, Any]:
    open_blockers = effective_open_blockers_from(
        blockers,
        pnc019_certification_current=pnc019_certification_current,
    )
    node_snapshot = dict(node_snapshot)
    if not pnc019_certification_current:
        node_snapshot.update(
            {
                "status": "blocked_runtime_certification_incomplete",
                "runtime_enabled": False,
                "runtime_blocked_by_ref": "PNC-019",
                "executable_lifecycle_certification_complete": False,
                "ordinary_product_worknodes_allowed": False,
                "hard_disabled": True,
                "hard_disabled_reason": "PNC-019 executable lifecycle certification is incomplete",
            }
        )
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
    pnc019_certification_current = not pnc019_certification_receipt_failures()
    return build_report_from_inputs(
        blockers=[public_row(row) for row in load_jsonl(BLOCKERS_PATH)],
        matrix=read_json(MATRIX_PATH),
        node_snapshot=node_readiness_snapshot(),
        pnc019_certification_current=pnc019_certification_current,
        hash_map=source_hashes(),
        generated_at_utc=generated_at_utc,
    )


def gate_semantic_failures(
    *,
    actual_report: dict[str, Any],
    blockers: list[dict[str, Any]],
    pnc019_certification_current: bool,
    current_hashes: dict[str, str] | None,
    path: str,
) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    public_blockers = [public_row(row) for row in blockers]
    open_blockers = effective_open_blockers_from(
        public_blockers,
        pnc019_certification_current=pnc019_certification_current,
    )
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
    scope_kind = record.get("scope_kind")
    if "scope_kind" in record and scope_kind not in EVENT_RECORD_SCOPE_KINDS:
        failures.append(
            {
                "path": path_label,
                "error": "event_record_scope_kind_not_closed_enum",
                "allowed": EVENT_RECORD_SCOPE_KINDS,
                "actual": scope_kind,
            }
        )
    project_id = record.get("project_id")
    if scope_kind == "application" and project_id is not None:
        failures.append(
            {
                "path": path_label,
                "error": "event_record_application_scope_requires_null_project_id",
                "actual": project_id,
            }
        )
    if scope_kind == "project" and (not isinstance(project_id, str) or not project_id):
        failures.append(
            {
                "path": path_label,
                "error": "event_record_project_scope_requires_non_empty_project_id",
                "actual": project_id,
            }
        )
    for field, allowed in [
        ("redaction_profile", EVENT_RECORD_REDACTION_PROFILES),
        ("replay_policy", EVENT_RECORD_REPLAY_POLICIES),
    ]:
        if field in record and record.get(field) not in allowed:
            failures.append(
                {
                    "path": path_label,
                    "error": "event_record_closed_enum_mismatch",
                    "field": field,
                    "allowed": allowed,
                    "actual": record.get(field),
                }
            )
    failures.extend(event_record_secret_key_failures(record, path_label=path_label))
    return failures


def event_record_v1_compatibility_instance_failures(record: Any, *, path_label: str) -> list[dict[str, Any]]:
    try:
        schema = read_json(EVENT_RECORD_SCHEMA_PATH)
    except Exception as exc:  # noqa: BLE001
        return [{"path": path_label, "error": "event_record_schema_unavailable", "detail": str(exc)}]
    defs = schema.get("$defs", {}) if isinstance(schema.get("$defs"), dict) else {}
    compatibility_reader = defs.get(EVENT_RECORD_COMPATIBILITY_READER_DEF)
    if not isinstance(compatibility_reader, dict):
        return [{"path": path_label, "error": "event_record_v1_compatibility_reader_missing"}]
    compatibility_schema = {"$defs": defs, **compatibility_reader}
    failures = draft202012_schema_failures(record, compatibility_schema, path_label=path_label)
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
        for marker in [
            "### 1.2 EventRecord",
            "`pm.event.v0`",
            "Plans/event_record.schema.json",
            "`schema_version = 2.0.0`",
            "`scope_kind`",
        ]:
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
    expected_schema_uri = "https://puppetmaster.local/schemas/event_record/2.0.0/event_record.schema.json"
    if schema.get("$id") != expected_schema_uri:
        failures.append(
            {
                "path": rel(schema_path),
                "error": "event_record_schema_uri_mismatch",
                "expected": expected_schema_uri,
                "actual": schema.get("$id"),
            }
        )
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
    if set(properties) != set(EVENT_RECORD_REQUIRED_FIELDS):
        failures.append(
            {
                "path": rel(schema_path),
                "error": "event_record_property_set_mismatch",
                "expected": sorted(EVENT_RECORD_REQUIRED_FIELDS),
                "actual": sorted(properties),
            }
        )
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
    for field, expected_enum in [
        ("scope_kind", EVENT_RECORD_SCOPE_KINDS),
        ("redaction_profile", EVENT_RECORD_REDACTION_PROFILES),
        ("replay_policy", EVENT_RECORD_REPLAY_POLICIES),
    ]:
        value = properties.get(field, {})
        enum = value.get("enum") if isinstance(value, dict) else None
        if enum != expected_enum:
            failures.append(
                {
                    "path": rel(schema_path),
                    "error": "event_record_closed_enum_mismatch",
                    "field": field,
                    "expected": expected_enum,
                    "actual": enum,
                }
            )
    project_id = properties.get("project_id", {}) if isinstance(properties.get("project_id"), dict) else {}
    if project_id.get("$ref") != "#/$defs/nullable_non_empty_string":
        failures.append({"path": rel(schema_path), "error": "event_record_project_id_not_nullable_ref"})
    expected_scope_conditionals = [
        {
            "if": {"properties": {"scope_kind": {"const": "application"}}, "required": ["scope_kind"]},
            "then": {"properties": {"project_id": {"type": "null"}}},
        },
        {
            "if": {"properties": {"scope_kind": {"const": "project"}}, "required": ["scope_kind"]},
            "then": {"properties": {"project_id": {"$ref": "#/$defs/non_empty_string"}}},
        },
    ]
    if schema.get("allOf") != expected_scope_conditionals:
        failures.append(
            {
                "path": rel(schema_path),
                "error": "event_record_scope_conditionals_mismatch",
                "expected": expected_scope_conditionals,
                "actual": schema.get("allOf"),
            }
        )
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

    compatibility_reader = (
        defs.get(EVENT_RECORD_COMPATIBILITY_READER_DEF, {})
        if isinstance(defs.get(EVENT_RECORD_COMPATIBILITY_READER_DEF), dict)
        else {}
    )
    compatibility_properties = (
        compatibility_reader.get("properties", {})
        if isinstance(compatibility_reader.get("properties"), dict)
        else {}
    )
    if compatibility_reader.get("type") != "object" or compatibility_reader.get("additionalProperties") is not False:
        failures.append({"path": rel(schema_path), "error": "event_record_v1_compatibility_reader_not_closed"})
    if compatibility_reader.get("required") != EVENT_RECORD_COMPATIBILITY_REQUIRED_FIELDS:
        failures.append(
            {
                "path": rel(schema_path),
                "error": "event_record_v1_compatibility_required_fields_mismatch",
                "expected": EVENT_RECORD_COMPATIBILITY_REQUIRED_FIELDS,
                "actual": compatibility_reader.get("required"),
            }
        )
    if set(compatibility_properties) != set(EVENT_RECORD_COMPATIBILITY_REQUIRED_FIELDS):
        failures.append(
            {
                "path": rel(schema_path),
                "error": "event_record_v1_compatibility_property_set_mismatch",
                "expected": sorted(EVENT_RECORD_COMPATIBILITY_REQUIRED_FIELDS),
                "actual": sorted(compatibility_properties),
            }
        )
    compatibility_schema_id = (
        compatibility_properties.get("schema_id", {})
        if isinstance(compatibility_properties.get("schema_id"), dict)
        else {}
    )
    compatibility_schema_version = (
        compatibility_properties.get("schema_version", {})
        if isinstance(compatibility_properties.get("schema_version"), dict)
        else {}
    )
    compatibility_project_id = (
        compatibility_properties.get("project_id", {})
        if isinstance(compatibility_properties.get("project_id"), dict)
        else {}
    )
    if compatibility_schema_id.get("const") != EVENT_RECORD_SCHEMA_ID:
        failures.append({"path": rel(schema_path), "error": "event_record_v1_compatibility_schema_id_mismatch"})
    if compatibility_schema_version.get("const") != EVENT_RECORD_COMPATIBILITY_SCHEMA_VERSION:
        failures.append({"path": rel(schema_path), "error": "event_record_v1_compatibility_schema_version_mismatch"})
    if compatibility_project_id.get("$ref") != "#/$defs/non_empty_string":
        failures.append({"path": rel(schema_path), "error": "event_record_v1_compatibility_project_id_not_required"})
    if "scope_kind" in compatibility_properties:
        failures.append({"path": rel(schema_path), "error": "event_record_v1_compatibility_scope_kind_added"})
    for field, expected_enum in [
        ("redaction_profile", EVENT_RECORD_REDACTION_PROFILES),
        ("replay_policy", EVENT_RECORD_REPLAY_POLICIES),
    ]:
        value = compatibility_properties.get(field, {})
        enum = value.get("enum") if isinstance(value, dict) else None
        if enum != expected_enum:
            failures.append(
                {
                    "path": rel(schema_path),
                    "error": "event_record_v1_compatibility_closed_enum_mismatch",
                    "field": field,
                    "expected": expected_enum,
                    "actual": enum,
                }
            )
    compatibility_migration = (
        compatibility_properties.get("migration", {})
        if isinstance(compatibility_properties.get("migration"), dict)
        else {}
    )
    if compatibility_migration.get("$ref") != "#/$defs/migration":
        failures.append({"path": rel(schema_path), "error": "event_record_v1_compatibility_migration_not_ref"})

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

    failures.extend(event_family_registry_contract_failures(include_residuals=True))
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
        if "anyOf" in node:
            branches = node.get("anyOf")
            if not isinstance(branches, list) or not branches:
                fail(pointer, "anyOf", {"detail": "branches missing"})
                return
            branch_results: list[list[dict[str, Any]]] = []
            for branch in branches:
                before = len(failures)
                validate_node(value, branch, pointer)
                branch_results.append(failures[before:])
                del failures[before:]
            if not any(not result for result in branch_results):
                fail(pointer, "anyOf", {"branch_error_count": [len(result) for result in branch_results]})

        if "oneOf" in node:
            branches = node.get("oneOf")
            if not isinstance(branches, list) or not branches:
                fail(pointer, "oneOf", {"detail": "branches missing"})
                return
            matching = 0
            for branch in branches:
                before = len(failures)
                validate_node(value, branch, pointer)
                branch_failures = failures[before:]
                del failures[before:]
                if not branch_failures:
                    matching += 1
            if matching != 1:
                fail(pointer, "oneOf", {"matching_branch_count": matching})

        if "not" in node:
            before = len(failures)
            validate_node(value, node.get("not"), pointer)
            matched_forbidden = len(failures) == before
            del failures[before:]
            if matched_forbidden:
                fail(pointer, "not")

        all_of = node.get("allOf")
        if all_of is not None:
            if not isinstance(all_of, list) or not all_of:
                fail(pointer, "allOf", {"detail": "branches missing"})
            else:
                for branch in all_of:
                    validate_node(value, branch, pointer)

        if_schema = node.get("if")
        if if_schema is not None:
            before = len(failures)
            validate_node(value, if_schema, pointer)
            condition_matched = len(failures) == before
            del failures[before:]
            selected = node.get("then") if condition_matched else node.get("else")
            if selected is not None:
                validate_node(value, selected, pointer)

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
            max_length = node.get("maxLength")
            if isinstance(max_length, int) and len(value) > max_length:
                fail(pointer, "maxLength", {"maxLength": max_length})
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
            maximum = node.get("maximum")
            if isinstance(maximum, (int, float)) and value > maximum:
                fail(pointer, "maximum", {"maximum": maximum, "actual": value})

        if isinstance(value, list):
            min_items = node.get("minItems")
            if isinstance(min_items, int) and len(value) < min_items:
                fail(pointer, "minItems", {"minItems": min_items, "actual": len(value)})
            max_items = node.get("maxItems")
            if isinstance(max_items, int) and len(value) > max_items:
                fail(pointer, "maxItems", {"maxItems": max_items, "actual": len(value)})
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
            min_properties = node.get("minProperties")
            if isinstance(min_properties, int) and len(value) < min_properties:
                fail(pointer, "minProperties", {"minProperties": min_properties, "actual": len(value)})
            required = node.get("required")
            if isinstance(required, list):
                for field in required:
                    if field not in value:
                        fail(pointer, "required", {"missing": field})
            dependent_required = node.get("dependentRequired")
            if isinstance(dependent_required, dict):
                for trigger, dependents in dependent_required.items():
                    if trigger not in value or not isinstance(dependents, list):
                        continue
                    for dependent in dependents:
                        if dependent not in value:
                            fail(
                                pointer,
                                "dependentRequired",
                                {"trigger": trigger, "missing": dependent},
                            )
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


def jcs_bytes(value: Any) -> bytes:
    """Canonical JSON for the integer/string-only Case L legacy oracle."""
    def reject_non_jcs_number(item: Any, pointer: str = "$") -> None:
        if isinstance(item, float):
            raise ValueError(f"floating point value is forbidden at {pointer}")
        if isinstance(item, dict):
            for key, child in item.items():
                if not isinstance(key, str):
                    raise ValueError(f"non-string object key at {pointer}")
                reject_non_jcs_number(child, f"{pointer}/{json_pointer_escape(key)}")
        elif isinstance(item, list):
            for index, child in enumerate(item):
                reject_non_jcs_number(child, f"{pointer}/{index}")

    reject_non_jcs_number(value)
    return json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        allow_nan=False,
    ).encode("utf-8")


def canonical_messagepack_bytes(value: Any) -> bytes:
    """Encode the closed fixture domain using canonical shortest MessagePack forms."""
    def length_prefix(length: int, fix_base: int, fix_limit: int, code16: int, code32: int) -> bytes:
        if length <= fix_limit:
            return bytes([fix_base | length])
        if length <= 0xFFFF:
            return bytes([code16]) + struct.pack(">H", length)
        return bytes([code32]) + struct.pack(">I", length)

    if value is None:
        return b"\xc0"
    if value is False:
        return b"\xc2"
    if value is True:
        return b"\xc3"
    if isinstance(value, int) and not isinstance(value, bool):
        if 0 <= value <= 0x7F:
            return bytes([value])
        if -32 <= value < 0:
            return bytes([value & 0xFF])
        if 0 <= value <= 0xFF:
            return b"\xcc" + struct.pack(">B", value)
        if 0 <= value <= 0xFFFF:
            return b"\xcd" + struct.pack(">H", value)
        if 0 <= value <= 0xFFFFFFFF:
            return b"\xce" + struct.pack(">I", value)
        if 0 <= value <= 0xFFFFFFFFFFFFFFFF:
            return b"\xcf" + struct.pack(">Q", value)
        if -0x80 <= value < -32:
            return b"\xd0" + struct.pack(">b", value)
        if -0x8000 <= value < -0x80:
            return b"\xd1" + struct.pack(">h", value)
        if -0x80000000 <= value < -0x8000:
            return b"\xd2" + struct.pack(">i", value)
        if -0x8000000000000000 <= value < -0x80000000:
            return b"\xd3" + struct.pack(">q", value)
        raise ValueError("integer outside MessagePack range")
    if isinstance(value, float):
        raise ValueError("floating point values are forbidden in the legacy fixture")
    if isinstance(value, str):
        encoded = value.encode("utf-8")
        length = len(encoded)
        if length <= 31:
            return bytes([0xA0 | length]) + encoded
        if length <= 0xFF:
            return b"\xd9" + struct.pack(">B", length) + encoded
        if length <= 0xFFFF:
            return b"\xda" + struct.pack(">H", length) + encoded
        return b"\xdb" + struct.pack(">I", length) + encoded
    if isinstance(value, list):
        prefix = length_prefix(len(value), 0x90, 15, 0xDC, 0xDD)
        return prefix + b"".join(canonical_messagepack_bytes(item) for item in value)
    if isinstance(value, dict):
        ordered = sorted(value.items(), key=lambda item: item[0].encode("utf-8"))
        prefix = length_prefix(len(ordered), 0x80, 15, 0xDE, 0xDF)
        return prefix + b"".join(
            canonical_messagepack_bytes(key) + canonical_messagepack_bytes(child)
            for key, child in ordered
        )
    raise ValueError(f"unsupported MessagePack value type: {type(value).__name__}")


def canonical_utc_timestamp(value: str) -> str:
    match = re.fullmatch(
        r"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,9}))?Z",
        value,
    )
    if not match:
        raise ValueError("legacy timestamp must be unambiguous UTC RFC 3339")
    datetime.strptime(match.group(1), "%Y-%m-%dT%H:%M:%S")
    return f"{match.group(1)}.{(match.group(2) or '').ljust(9, '0')}Z"


def utc_timestamp_from_ns(value: int) -> str:
    if not isinstance(value, int) or isinstance(value, bool) or value < 0:
        raise ValueError("observed_timestamp_ns must be a nonnegative integer")
    seconds, nanos = divmod(value, 1_000_000_000)
    base = datetime.fromtimestamp(seconds, timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
    return f"{base}.{nanos:09d}Z"


def json_pointer_value(document: Any, pointer: str) -> Any:
    if pointer == "":
        return document
    if not isinstance(pointer, str) or not pointer.startswith("/"):
        raise ValueError(f"invalid JSON Pointer: {pointer!r}")
    current = document
    for raw in pointer[1:].split("/"):
        token = raw.replace("~1", "/").replace("~0", "~")
        if isinstance(current, dict) and token in current:
            current = current[token]
        elif isinstance(current, list) and token.isdigit() and int(token) < len(current):
            current = current[int(token)]
        else:
            raise KeyError(pointer)
    return current


def event_family_payload_schema(family: dict[str, Any]) -> tuple[dict[str, Any] | None, str | None]:
    inline = family.get("payload_schema")
    if isinstance(inline, dict):
        return inline, inline.get("$id")
    ref = family.get("payload_schema_ref")
    if not isinstance(ref, dict):
        return None, None
    raw_path = ref.get("path")
    if not isinstance(raw_path, str) or not raw_path:
        return None, None
    path = ROOT / raw_path
    if not path.exists():
        return None, None
    try:
        schema: Any = read_json(path)
        pointer = ref.get("json_pointer", "#")
        if pointer not in {"#", ""}:
            if not isinstance(pointer, str) or not pointer.startswith("#/"):
                return None, None
            schema = resolve_local_schema_ref(schema, pointer[1:])
        if not isinstance(schema, dict):
            return None, None
        return schema, schema.get("$id") or schema.get("schema_id")
    except Exception:  # noqa: BLE001 - converted to a deterministic structural failure.
        return None, None


def event_family_active_schema_ids_match(
    family: dict[str, Any],
    resolved_schema_id: str | None,
) -> bool:
    row_schema_id = family.get("payload_schema_id")
    if not isinstance(row_schema_id, str) or not row_schema_id:
        return False
    ref = family.get("payload_schema_ref")
    if isinstance(ref, dict) and ref.get("schema_id") != row_schema_id:
        return False
    return resolved_schema_id == row_schema_id


def event_family_legacy_payload_schema(
    family: dict[str, Any],
    payload: Any,
) -> tuple[dict[str, Any] | None, str | None, str | None]:
    active_schema, active_schema_id = event_family_payload_schema(family)
    if active_schema is None:
        return None, None, "event_payload_schema_unregistered"
    if not event_family_active_schema_ids_match(family, active_schema_id):
        return None, None, "event_payload_schema_id_mismatch"
    if not draft202012_schema_failures(
        payload,
        active_schema,
        path_label="legacy-payload:active-schema",
    ):
        return active_schema, active_schema_id, None

    defs = active_schema.get("$defs", {})
    if not isinstance(defs, dict):
        return None, None, "legacy_payload_schema_invalid"
    matches: list[tuple[dict[str, Any], str]] = []
    for name in sorted(defs):
        reader = defs[name]
        if (
            not name.endswith("_compatibility_reader")
            or not isinstance(reader, dict)
            or reader.get("additionalProperties") is not False
        ):
            continue
        reader_id = reader.get("$id")
        if not isinstance(reader_id, str) or not reader_id:
            continue
        reader_schema = {"$defs": defs, **reader}
        if not draft202012_schema_failures(
            payload,
            reader_schema,
            path_label=f"legacy-payload:$defs/{name}",
        ):
            matches.append((reader_schema, reader_id))
    if len(matches) == 1:
        return matches[0][0], matches[0][1], None
    if len(matches) > 1:
        return None, None, "legacy_payload_schema_ambiguous"
    return None, None, "legacy_payload_schema_invalid"


def event_family_registry_data_failures(
    registry: Any,
    schema: Any,
    *,
    path_label: str,
    include_residuals: bool,
) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    if not isinstance(registry, dict):
        return [{"path": path_label, "error": "event_family_registry_not_object"}]
    if not isinstance(schema, dict):
        return [{"path": rel(EVENT_FAMILY_REGISTRY_SCHEMA_PATH), "error": "event_family_registry_schema_not_object"}]
    if schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
        failures.append({"path": rel(EVENT_FAMILY_REGISTRY_SCHEMA_PATH), "error": "event_family_registry_schema_not_draft_2020_12"})
    if schema.get("$id") != EVENT_FAMILY_REGISTRY_SCHEMA_URI:
        failures.append(
            {
                "path": rel(EVENT_FAMILY_REGISTRY_SCHEMA_PATH),
                "error": "event_family_registry_schema_uri_mismatch",
                "expected": EVENT_FAMILY_REGISTRY_SCHEMA_URI,
                "actual": schema.get("$id"),
            }
        )
    try:
        from jsonschema import Draft202012Validator

        Draft202012Validator.check_schema(schema)
        schema_errors = sorted(
            Draft202012Validator(schema).iter_errors(registry),
            key=lambda error: list(error.absolute_path),
        )
        for error in schema_errors:
            failures.append(
                {
                    "path": path_label,
                    "error": "event_family_registry_schema_validation_failed",
                    "pointer": "/" + "/".join(str(part) for part in error.absolute_path),
                    "detail": error.message,
                }
            )
    except ImportError as exc:
        failures.append(
            {
                "path": rel(Path(__file__).resolve()),
                "error": "event_family_registry_draft_2020_12_validator_unavailable",
                "detail": str(exc),
            }
        )
    except Exception as exc:  # noqa: BLE001
        failures.append(
            {
                "path": rel(EVENT_FAMILY_REGISTRY_SCHEMA_PATH),
                "error": "event_family_registry_schema_invalid",
                "detail": str(exc),
            }
        )

    if registry.get("schema_id") != EVENT_FAMILY_REGISTRY_SCHEMA_ID:
        failures.append({"path": path_label, "error": "event_family_registry_schema_id_mismatch"})
    if registry.get("schema_version") != EVENT_FAMILY_REGISTRY_SCHEMA_VERSION:
        failures.append({"path": path_label, "error": "event_family_registry_schema_version_mismatch"})
    if registry.get("unknown_event_disposition") != "quarantine_without_checkpoint_advance":
        failures.append({"path": path_label, "error": "event_family_registry_unknown_disposition_mismatch"})

    families = registry.get("families", [])
    if not isinstance(families, list):
        return failures + [{"path": path_label, "error": "event_family_registry_families_not_array"}]
    if len(families) != EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT:
        failures.append(
            {
                "path": path_label,
                "error": "event_family_registry_kernel_row_count_mismatch",
                "expected": EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT,
                "actual": len(families),
            }
        )
    family_ids: set[str] = set()
    canonical_types: dict[str, str] = {}
    alias_types: dict[str, str] = {}
    goal_rows = 0
    open_array_item_count = 0

    def count_open_items(value: Any) -> int:
        count = 0
        if isinstance(value, dict):
            if "items" in value and value.get("items") == {}:
                count += 1
            count += sum(count_open_items(child) for child in value.values())
        elif isinstance(value, list):
            count += sum(count_open_items(child) for child in value)
        return count

    for index, family in enumerate(families):
        row_path = f"{path_label}:families/{index}"
        if not isinstance(family, dict):
            failures.append({"path": row_path, "error": "event_family_registry_row_not_object"})
            continue
        family_id = family.get("family_id")
        event_type = family.get("event_type")
        if not isinstance(family_id, str) or not family_id:
            failures.append({"path": row_path, "error": "event_family_registry_family_id_missing"})
        elif family_id in family_ids:
            failures.append({"path": row_path, "error": "event_family_registry_duplicate_family_id", "family_id": family_id})
        else:
            family_ids.add(family_id)
        if not isinstance(event_type, str) or not event_type:
            failures.append({"path": row_path, "error": "event_family_registry_event_type_missing"})
        elif any(token in event_type for token in ("*", "?", "[", "]")):
            failures.append({"path": row_path, "error": "event_family_registry_non_exact_selector", "event_type": event_type})
        elif event_type in canonical_types:
            failures.append(
                {
                    "path": row_path,
                    "error": "event_family_registry_duplicate_event_type",
                    "event_type": event_type,
                    "prior_family_id": canonical_types[event_type],
                }
            )
        else:
            canonical_types[event_type] = str(family_id)

        for owner_field in ("semantic_owner_doc", "payload_owner_doc"):
            owner_ref = family.get(owner_field)
            owner_path = ROOT / str(owner_ref).split("#", 1)[0]
            if not isinstance(owner_ref, str) or not owner_ref or not owner_path.exists():
                failures.append({"path": row_path, "error": "event_family_registry_owner_ref_missing", "field": owner_field, "actual": owner_ref})

        payload_schema, resolved_schema_id = event_family_payload_schema(family)
        if payload_schema is None:
            failures.append({"path": row_path, "error": "event_payload_schema_unregistered", "event_type": event_type})
        else:
            expected_schema_id = family.get("payload_schema_id")
            payload_schema_ref = family.get("payload_schema_ref")
            referenced_schema_id = (
                payload_schema_ref.get("schema_id")
                if isinstance(payload_schema_ref, dict)
                else None
            )
            if not event_family_active_schema_ids_match(family, resolved_schema_id):
                failures.append(
                    {
                        "path": row_path,
                        "error": "event_payload_schema_id_mismatch",
                        "event_type": event_type,
                        "expected": expected_schema_id,
                        "referenced": referenced_schema_id,
                        "resolved": resolved_schema_id,
                    }
                )
            ref_path = (
                payload_schema_ref.get("path")
                if isinstance(payload_schema_ref, dict)
                else None
            )
            if event_type in EVENT_FAMILY_GOAL_PAYLOAD_SCHEMA_REFS:
                goal_rows += 1
                expected_ref_path = EVENT_FAMILY_GOAL_PAYLOAD_SCHEMA_REFS[event_type]
                if ref_path != expected_ref_path:
                    failures.append(
                        {
                            "path": row_path,
                            "error": "event_family_registry_goal_payload_ref_mismatch",
                            "event_type": event_type,
                            "expected": expected_ref_path,
                            "actual": ref_path,
                        }
                    )
            elif (
                isinstance(ref_path, str)
                and ref_path.startswith("Plans/event_payloads/goal_runtime/")
            ):
                failures.append(
                    {
                        "path": row_path,
                        "error": "event_family_registry_unknown_goal_payload_ref",
                        "event_type": event_type,
                        "actual": ref_path,
                    }
                )
            if isinstance(family.get("payload_schema"), dict):
                open_array_item_count += count_open_items(family["payload_schema"])

        legacy = family.get("legacy", {}) if isinstance(family.get("legacy"), dict) else {}
        aliases = legacy.get("aliases", []) if isinstance(legacy.get("aliases"), list) else []
        for alias in aliases:
            if not isinstance(alias, dict):
                failures.append({"path": row_path, "error": "event_family_registry_alias_not_object"})
                continue
            alias_type = alias.get("alias_event_type")
            canonical = alias.get("canonical_event_type")
            if canonical != event_type:
                failures.append({"path": row_path, "error": "event_family_registry_alias_wrong_target", "alias": alias_type})
            if alias_type in alias_types:
                failures.append({"path": row_path, "error": "event_family_registry_duplicate_alias", "alias": alias_type})
            else:
                alias_types[str(alias_type)] = str(event_type)
        pointers = legacy.get("identity_json_pointers", {})
        if not isinstance(pointers, dict):
            failures.append({"path": row_path, "error": "event_family_registry_identity_pointers_not_object"})
        else:
            for pointer_list in pointers.values():
                for pointer in pointer_list if isinstance(pointer_list, list) else []:
                    if not isinstance(pointer, str) or not pointer.startswith("/"):
                        failures.append({"path": row_path, "error": "event_family_registry_invalid_identity_pointer", "pointer": pointer})
        inherited_pointer = legacy.get("referenced_event_id_pointer")
        if family.get("scope_policy") == "inherits_referenced_event":
            if not isinstance(inherited_pointer, str) or not inherited_pointer.startswith("/"):
                failures.append({"path": row_path, "error": "event_family_registry_inherited_pointer_missing"})
        elif inherited_pointer is not None:
            failures.append({"path": row_path, "error": "event_family_registry_unexpected_inherited_pointer"})
        redaction = legacy.get("redaction", {}) if isinstance(legacy.get("redaction"), dict) else {}
        mode = redaction.get("mode")
        transform_id = redaction.get("transform_id")
        transform_version = redaction.get("transform_version")
        if mode == "reject_unhandled_secrets" and (transform_id is not None or transform_version is not None):
            failures.append({"path": row_path, "error": "event_family_registry_reject_mode_has_transform"})
        if mode == "versioned_transform" and not (
            isinstance(transform_id, str) and transform_id and isinstance(transform_version, str) and transform_version
        ):
            failures.append({"path": row_path, "error": "event_family_registry_transform_incomplete"})

    for alias_type, target in alias_types.items():
        if alias_type in canonical_types:
            failures.append(
                {
                    "path": path_label,
                    "error": "event_family_registry_alias_canonical_collision",
                    "alias": alias_type,
                    "canonical_target": target,
                }
            )
        if target in alias_types:
            failures.append({"path": path_label, "error": "event_family_registry_alias_chain", "alias": alias_type})
    for event_type, scope_policy in EVENT_FAMILY_REQUIRED_SCOPE_POLICIES.items():
        family = next((row for row in families if isinstance(row, dict) and row.get("event_type") == event_type), None)
        if not family:
            failures.append({"path": path_label, "error": "event_family_registry_required_kernel_type_missing", "event_type": event_type})
        elif family.get("scope_policy") != scope_policy:
            failures.append(
                {
                    "path": path_label,
                    "error": "event_family_registry_scope_policy_mismatch",
                    "event_type": event_type,
                    "expected": scope_policy,
                    "actual": family.get("scope_policy"),
                }
            )
    try:
        goal_schema = read_json(EVENT_FAMILY_GOAL_OWNER_SCHEMA_PATH)
        goal_types = set(goal_schema.get("properties", {}).get("event_name", {}).get("enum", []))
        registered_goal_refs = {
            row.get("event_type"): row.get("payload_schema_ref", {}).get("path")
            for row in families
            if isinstance(row, dict)
            and row.get("event_type") in EVENT_FAMILY_GOAL_PAYLOAD_SCHEMA_REFS
        }
        if (
            goal_types != set(EVENT_FAMILY_GOAL_PAYLOAD_SCHEMA_REFS)
            or registered_goal_refs != EVENT_FAMILY_GOAL_PAYLOAD_SCHEMA_REFS
            or goal_rows != len(EVENT_FAMILY_GOAL_PAYLOAD_SCHEMA_REFS)
        ):
            failures.append(
                {
                    "path": path_label,
                    "error": "event_family_registry_goal_kernel_membership_mismatch",
                    "expected": sorted(goal_types),
                    "actual": sorted(registered_goal_refs),
                    "expected_refs": EVENT_FAMILY_GOAL_PAYLOAD_SCHEMA_REFS,
                    "actual_refs": registered_goal_refs,
                }
            )
    except Exception as exc:  # noqa: BLE001
        failures.append({"path": rel(EVENT_FAMILY_GOAL_OWNER_SCHEMA_PATH), "error": "event_family_goal_schema_unavailable", "detail": str(exc)})

    if include_residuals:
        failures.extend(
            pnc019_event_authority_failures_for_registry(
                registry,
                path_label=path_label,
            )
        )
    return failures


def scope_partition(scope_kind: str, project_id: str | None) -> str:
    if scope_kind == "application":
        return "app"
    assert isinstance(project_id, str) and project_id
    encoded = base64.urlsafe_b64encode(project_id.encode("utf-8")).decode("ascii").rstrip("=")
    return f"project~{encoded}"


def event_producer_semantic_digest(record: dict[str, Any]) -> str:
    fields = [
        "event_type", "scope_kind", "project_id", "thread_id", "run_id", "node_id",
        "attempt_id", "actor_ref", "requested_account_ref", "effective_account_ref",
        "occurred_at_utc", "producer_sequence_id", "correlation_id", "causation_event_id",
        "parent_event_id", "idempotency_key", "payload_schema_id", "payload", "payload_ref",
        "redaction_profile", "migration",
    ]
    return hashlib.sha256(jcs_bytes({field: record[field] for field in fields})).hexdigest()


def normalized_legacy_case(
    case: dict[str, Any],
    registry: dict[str, Any],
) -> tuple[dict[str, Any] | None, str | None, dict[str, Any] | None]:
    envelope = case.get("legacy_envelope", {})
    source = case.get("source", {})
    if not isinstance(envelope, dict) or not isinstance(source, dict):
        return None, "legacy_envelope_invalid", None
    event_type = envelope.get("type")
    families = [
        row for row in registry.get("families", [])
        if isinstance(row, dict) and row.get("event_type") == event_type
    ]
    if not families:
        alias_matches = []
        for row in registry.get("families", []):
            if not isinstance(row, dict):
                continue
            for alias in row.get("legacy", {}).get("aliases", []):
                if isinstance(alias, dict) and alias.get("alias_event_type") == event_type:
                    alias_matches.append(row)
        if not alias_matches:
            reason = "unregistered_legacy_alias" if case.get("expect_alias_lookup") else "unknown_event_family"
            return None, reason, None
        families = alias_matches
    if len(families) != 1:
        return None, "event_family_overlap", None
    family = families[0]
    canonical_type = family.get("event_type")
    try:
        canonical_ts = canonical_utc_timestamp(str(envelope.get("ts")))
    except Exception:
        raw_ts = str(envelope.get("ts", ""))
        if re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?", raw_ts):
            return None, "legacy_timestamp_ambiguous", None
        return None, "legacy_timestamp_invalid", None
    sequence_id = envelope.get("seq")
    if not isinstance(sequence_id, int) or isinstance(sequence_id, bool) or sequence_id < 0:
        return None, "legacy_sequence_invalid", None
    header_sequence_id = source.get("header_sequence_id")
    if header_sequence_id is not None and header_sequence_id != sequence_id:
        return None, "legacy_sequence_conflict", None
    payload = envelope.get("payload")
    if event_record_secret_key_failures(payload, path_label="legacy-payload"):
        return None, "legacy_secret_unhandled", None
    payload_schema, selected_payload_schema_id, payload_schema_error = (
        event_family_legacy_payload_schema(family, payload)
    )
    if payload_schema_error:
        return None, payload_schema_error, None
    if (
        payload_schema is None
        or not isinstance(selected_payload_schema_id, str)
        or not selected_payload_schema_id
        or draft202012_schema_failures(payload, payload_schema, path_label="legacy-payload")
    ):
        return None, "legacy_payload_schema_invalid", None

    legacy = family.get("legacy", {})
    identity_pointers = legacy.get("identity_json_pointers", {})
    header_identity = source.get("identity_headers", {}) if isinstance(source.get("identity_headers"), dict) else {}
    identities: dict[str, Any] = {}
    for identity_name in [
        "project_id", "thread_id", "run_id", "node_id", "attempt_id", "actor_ref",
        "requested_account_ref", "effective_account_ref", "correlation_id", "causation_event_id",
        "parent_event_id", "payload_ref",
    ]:
        candidates: list[Any] = []
        if identity_name in header_identity:
            candidates.append(header_identity[identity_name])
        for pointer in identity_pointers.get(identity_name, []):
            try:
                candidates.append(json_pointer_value({"payload": payload, "extensions": case.get("admitted_extensions", {})}, pointer))
            except (KeyError, ValueError):
                continue
        distinct = []
        for candidate in candidates:
            if candidate is not None and candidate not in distinct:
                distinct.append(candidate)
        if len(distinct) > 1:
            return None, "legacy_identity_conflict", None
        identities[identity_name] = distinct[0] if distinct else None

    project_id = identities.get("project_id")
    if project_id in {"default", "__app__"}:
        return None, "legacy_project_scope_sentinel", None
    policy = family.get("scope_policy")
    if policy == "application_only":
        if project_id is not None:
            return None, "legacy_scope_conflict", None
        scope_kind = "application"
    elif policy == "project_only":
        if not isinstance(project_id, str) or not project_id:
            return None, "legacy_project_scope_missing", None
        scope_kind = "project"
    elif policy == "application_or_project":
        scope_kind = "project" if isinstance(project_id, str) and project_id else "application"
        if scope_kind == "application":
            project_id = None
    elif policy == "inherits_referenced_event":
        pointer = legacy.get("referenced_event_id_pointer")
        try:
            referenced_event_id = json_pointer_value({"payload": payload}, pointer)
        except Exception:  # noqa: BLE001
            return None, "legacy_referenced_event_missing", None
        scope_candidates = case.get("referenced_event_scopes", {}).get(referenced_event_id, [])
        if len(scope_candidates) != 1:
            return None, "legacy_referenced_event_scope_conflict", None
        scope_entry = scope_candidates[0]
        scope_kind = scope_entry.get("scope_kind")
        project_id = scope_entry.get("project_id")
    else:
        return None, "unknown_scope_policy", None

    extensions = case.get("admitted_extensions", {})
    if not isinstance(extensions, dict):
        return None, "legacy_extensions_invalid", None
    legacy_object = {
        "ts": canonical_ts,
        "seq": sequence_id,
        "type": event_type,
        "payload": payload,
        "extensions": extensions,
    }
    legacy_jcs = jcs_bytes(legacy_object)
    legacy_digest = hashlib.sha256(legacy_jcs).hexdigest()
    event_id = f"legacy-event-v1:{legacy_digest}"
    try:
        observed_at = utc_timestamp_from_ns(source["observed_timestamp_ns"])
    except Exception:
        observed_at = canonical_ts
    normalized = {
        "schema_id": EVENT_RECORD_SCHEMA_ID,
        "schema_version": EVENT_RECORD_SCHEMA_VERSION,
        "scope_kind": scope_kind,
        "event_id": event_id,
        "event_type": canonical_type,
        "project_id": project_id,
        "thread_id": identities.get("thread_id"),
        "run_id": identities.get("run_id"),
        "node_id": identities.get("node_id"),
        "attempt_id": identities.get("attempt_id"),
        "actor_ref": identities.get("actor_ref") or "pm.actor_ref/legacy-unknown",
        "requested_account_ref": identities.get("requested_account_ref"),
        "effective_account_ref": identities.get("effective_account_ref"),
        "occurred_at_utc": canonical_ts,
        "observed_at_utc": observed_at,
        "persisted_at_utc": observed_at,
        "sequence_id": sequence_id,
        "producer_sequence_id": None,
        "correlation_id": identities.get("correlation_id") or event_id,
        "causation_event_id": identities.get("causation_event_id"),
        "parent_event_id": identities.get("parent_event_id"),
        "idempotency_key": f"legacy-envelope-v1:{legacy_digest}",
        "payload_schema_id": selected_payload_schema_id,
        "payload": payload,
        "payload_ref": identities.get("payload_ref"),
        "redaction_profile": "no_secrets",
        "replay_policy": "projector_replay_only",
        "migration": {
            "migrated_from_schema_id": "pm.event.envelope_v1",
            "migrated_from_schema_version": None,
            "migration_id": "event-envelope-v1-to-event-record-v2@1",
            "compatibility_event_type": event_type,
        },
    }
    source_bytes = bytes.fromhex(str(source.get("bytes_hex", "")))
    source_sha = hashlib.sha256(source_bytes).hexdigest()
    source_locator = {
        "segment_generation": source.get("segment_generation"),
        "segment_name": source.get("segment_name"),
        "byte_offset": source.get("byte_offset"),
        "sequence_id": sequence_id,
    }
    publication_locator = {
        "manifest_generation": source.get("segment_generation"),
        "recovery_epoch": 0,
        "survivor_prefix_sha256": source_sha,
        "checkpoint_ref": f"legacy-normalization:{source.get('segment_generation')}:{sequence_id}",
        "compaction_translation_manifest_ref": None,
    }
    partition = scope_partition(scope_kind, project_id)
    index_value = {
        "schema_id": "pm.storage_value.event_record_index.v2",
        "schema_version": "2.0.0",
        "scope_kind": scope_kind,
        "project_id": project_id,
        "scope_partition": partition,
        "sequence_id": sequence_id,
        "event_id": event_id,
        "event_type": canonical_type,
        "source_locator": source_locator,
        "publication_locator": publication_locator,
        "payload_sha256": hashlib.sha256(jcs_bytes(payload)).hexdigest(),
        "producer_semantic_digest": event_producer_semantic_digest(normalized),
        "idempotency_key": normalized["idempotency_key"],
        "correlation_id": normalized["correlation_id"],
        "causation_event_id": normalized["causation_event_id"],
        "persisted_at_utc": normalized["persisted_at_utc"],
        "redaction_profile": normalized["redaction_profile"],
        "source_schema_id": "pm.event.envelope_v1",
        "source_schema_version": None,
        "projector_replay_only": True,
    }
    projection_effect = {
        "projection_id": f"legacy-normalization:{family.get('family_id')}",
        "event_id": event_id,
        "event_type": canonical_type,
        "scope_partition": partition,
        "sequence_id": sequence_id,
        "payload_sha256": index_value["payload_sha256"],
    }
    derived = {
        "canonical_ts": canonical_ts,
        "legacy_jcs_utf8_hex": legacy_jcs.hex(),
        "legacy_digest": legacy_digest,
        "normalized_event_record": normalized,
        "normalized_event_record_canonical_json_utf8_hex": jcs_bytes(normalized).hex(),
        "normalized_event_record_messagepack_hex": canonical_messagepack_bytes(normalized).hex(),
        "event_record_index_key": (
            f"event_record_index.v2:{partition}:{sequence_id:020d}:{event_id}"
        ),
        "event_record_index_value": index_value,
        "event_record_index_messagepack_hex": canonical_messagepack_bytes(index_value).hex(),
        "projection_effect": projection_effect,
        "projection_digest_sha256": hashlib.sha256(jcs_bytes(projection_effect)).hexdigest(),
        "projection_effect_count_after_first_apply": 1,
        "projection_effect_count_after_repeat": 1,
        "source_sha256_after": source_sha,
        "append_count_delta": 0,
        "tail_sequence_delta": 0,
    }
    return normalized, None, derived


def evaluate_legacy_negative_case(
    negative: dict[str, Any],
    positive_cases: dict[str, dict[str, Any]],
    registry: dict[str, Any],
    registry_schema: dict[str, Any],
) -> str | None:
    kind = negative.get("mutation", {}).get("kind")

    def clone(value: Any) -> Any:
        return json.loads(json.dumps(value))

    candidate_registry = clone(registry)
    project_case = clone(positive_cases["legacy_project_run_started"])
    app_case = clone(positive_cases["legacy_app_storage_boot_recovery"])

    if kind == "unknown_event_type":
        project_case["legacy_envelope"]["type"] = "unknown.persisted_event"
        return normalized_legacy_case(project_case, candidate_registry)[1]
    if kind == "unregistered_alias":
        project_case["legacy_envelope"]["type"] = "RunStarted"
        project_case["expect_alias_lookup"] = True
        return normalized_legacy_case(project_case, candidate_registry)[1]
    if kind == "duplicate_canonical_row":
        row = next(row for row in candidate_registry["families"] if row["event_type"] == "run.started")
        duplicate = clone(row)
        duplicate["family_id"] = "event-family-run-started-duplicate"
        candidate_registry["families"].append(duplicate)
        return normalized_legacy_case(project_case, candidate_registry)[1]
    if kind in {"duplicate_alias", "alias_canonical_collision"}:
        row = next(row for row in candidate_registry["families"] if row["event_type"] == "goal_run.started")
        if kind == "duplicate_alias":
            row["legacy"]["aliases"].append(clone(row["legacy"]["aliases"][0]))
            expected_error = "event_family_registry_duplicate_alias"
            quarantine_reason = "event_family_alias_duplicate"
        else:
            row["legacy"]["aliases"][0]["alias_event_type"] = "run.started"
            expected_error = "event_family_registry_alias_canonical_collision"
            quarantine_reason = "event_family_alias_canonical_collision"
        structural = event_family_registry_data_failures(
            candidate_registry,
            registry_schema,
            path_label="self-test:event-family-registry",
            include_residuals=False,
        )
        return quarantine_reason if any(failure.get("error") == expected_error for failure in structural) else None
    if kind in {"missing_payload_schema", "payload_schema_id_mismatch"}:
        row = next(row for row in candidate_registry["families"] if row["event_type"] == "run.started")
        if kind == "missing_payload_schema":
            row.pop("payload_schema", None)
            row.pop("payload_schema_ref", None)
        else:
            row["payload_schema_id"] = "https://puppetmaster.local/schemas/event_payloads/wrong/1.0.0"
        return normalized_legacy_case(project_case, candidate_registry)[1]
    if kind == "application_project_identity":
        app_case["source"]["identity_headers"] = {"project_id": "project-not-admitted"}
        return normalized_legacy_case(app_case, candidate_registry)[1]
    if kind == "project_missing_identity":
        row = next(row for row in candidate_registry["families"] if row["event_type"] == "run.started")
        row["legacy"]["identity_json_pointers"].pop("project_id", None)
        return normalized_legacy_case(project_case, candidate_registry)[1]
    if kind == "project_sentinel_identity":
        project_case["legacy_envelope"]["payload"]["project_id"] = "__app__"
        return normalized_legacy_case(project_case, candidate_registry)[1]
    if kind == "identity_conflict":
        project_case["source"]["identity_headers"] = {"project_id": "project-conflicting"}
        return normalized_legacy_case(project_case, candidate_registry)[1]
    if kind == "sequence_conflict":
        project_case["source"]["header_sequence_id"] += 1
        return normalized_legacy_case(project_case, candidate_registry)[1]
    if kind == "invalid_timestamp":
        project_case["legacy_envelope"]["ts"] = "not-a-timestamp"
        return normalized_legacy_case(project_case, candidate_registry)[1]
    if kind == "ambiguous_timestamp":
        project_case["legacy_envelope"]["ts"] = "2026-07-18T04:01:02.3"
        return normalized_legacy_case(project_case, candidate_registry)[1]
    if kind == "raw_secret_payload":
        project_case["legacy_envelope"]["payload"]["api_key"] = "raw-secret-forbidden"
        return normalized_legacy_case(project_case, candidate_registry)[1]
    if kind in {"missing_referenced_event", "referenced_scope_conflict"}:
        row = next(row for row in candidate_registry["families"] if row["event_type"] == "seglog.event_appended")
        payload = {
            "seq": 10,
            "type": "run.started",
            "event_ref": "event:referenced-001",
            "segment_ref": "segment:0001",
            "ts": "2026-07-18T04:00:00.000000000Z",
        }
        inherited_case = clone(project_case)
        inherited_case["legacy_envelope"] = {
            "ts": "2026-07-18T04:00:00Z",
            "seq": 10,
            "type": row["event_type"],
            "payload": payload,
        }
        inherited_case["source"]["header_sequence_id"] = 10
        if kind == "missing_referenced_event":
            row["legacy"]["referenced_event_id_pointer"] = "/payload/missing_event_ref"
        else:
            inherited_case["referenced_event_scopes"] = {
                "event:referenced-001": [
                    {"scope_kind": "application", "project_id": None},
                    {"scope_kind": "project", "project_id": "project-legacy-001"},
                ]
            }
        return normalized_legacy_case(inherited_case, candidate_registry)[1]
    return None


def event_family_legacy_fixture_failures(
    fixture: Any,
    registry: dict[str, Any],
    *,
    path_label: str,
) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    if not isinstance(fixture, dict):
        return [{"path": path_label, "error": "event_legacy_fixture_not_object"}]
    expected_root = {
        "schema_id": "pm.event_record.legacy_normalization_fixture.v1",
        "schema_version": "1.0.0",
        "event_record_schema_id": EVENT_RECORD_SCHEMA_ID,
        "event_record_schema_version": EVENT_RECORD_SCHEMA_VERSION,
        "registry_schema_id": EVENT_FAMILY_REGISTRY_SCHEMA_ID,
        "registry_revision": registry.get("registry_revision"),
    }
    for field, expected in expected_root.items():
        if fixture.get(field) != expected:
            failures.append({"path": path_label, "error": "event_legacy_fixture_root_mismatch", "field": field, "expected": expected, "actual": fixture.get(field)})
    cases = fixture.get("cases", [])
    required_case_ids = {"legacy_app_storage_boot_recovery", "legacy_project_run_started"}
    case_by_id = {case.get("case_id"): case for case in cases if isinstance(case, dict)}
    if set(case_by_id) != required_case_ids:
        failures.append({"path": path_label, "error": "event_legacy_fixture_positive_case_membership_mismatch", "expected": sorted(required_case_ids), "actual": sorted(str(key) for key in case_by_id)})
    event_schema = read_json(EVENT_RECORD_SCHEMA_PATH)
    storage_registry = read_json(STORAGE_VALUE_REGISTRY_PATH)
    event_index_family = next(row for row in storage_registry["families"] if row.get("family_id") == "event_record_index")
    for case_id, case in case_by_id.items():
        source = case.get("source", {})
        try:
            source_bytes = bytes.fromhex(source.get("bytes_hex", ""))
            source_document = json.loads(source_bytes.decode("utf-8"))
        except Exception as exc:  # noqa: BLE001
            failures.append({"path": path_label, "error": "event_legacy_source_bytes_invalid", "case_id": case_id, "detail": str(exc)})
            continue
        if source_document != case.get("legacy_envelope"):
            failures.append({"path": path_label, "error": "event_legacy_source_envelope_mismatch", "case_id": case_id})
        source_sha = hashlib.sha256(source_bytes).hexdigest()
        if source.get("sha256") != source_sha:
            failures.append({"path": path_label, "error": "event_legacy_source_hash_mismatch", "case_id": case_id, "expected": source_sha, "actual": source.get("sha256")})
        normalized, reason, derived = normalized_legacy_case(case, registry)
        if reason or normalized is None or derived is None:
            failures.append({"path": path_label, "error": "event_legacy_positive_quarantined", "case_id": case_id, "reason": reason})
            continue
        expected = case.get("expected")
        if expected != derived:
            failures.append({"path": path_label, "error": "event_legacy_expected_recomputation_mismatch", "case_id": case_id})
        failures.extend(event_record_instance_failures(normalized, path_label=f"{path_label}:{case_id}:normalized"))
        failures.extend(draft202012_schema_failures(normalized, event_schema, path_label=f"{path_label}:{case_id}:normalized"))
        failures.extend(
            draft202012_schema_failures(
                derived["event_record_index_value"],
                event_index_family["value_schema"],
                path_label=f"{path_label}:{case_id}:event_record_index",
            )
        )
        source_locator = derived["event_record_index_value"]["source_locator"]
        publication_locator = derived["event_record_index_value"]["publication_locator"]
        if source_locator["sequence_id"] != derived["event_record_index_value"]["sequence_id"]:
            failures.append({"path": path_label, "error": "event_legacy_index_outer_inner_sequence_mismatch", "case_id": case_id})
        if source_locator["segment_generation"] != publication_locator["manifest_generation"]:
            failures.append({"path": path_label, "error": "event_legacy_index_generation_mismatch", "case_id": case_id})

    required_negative_reasons = {
        "unknown_event_family",
        "unregistered_legacy_alias",
        "event_family_overlap",
        "event_family_alias_duplicate",
        "event_family_alias_canonical_collision",
        "event_payload_schema_unregistered",
        "event_payload_schema_id_mismatch",
        "legacy_scope_conflict",
        "legacy_project_scope_missing",
        "legacy_project_scope_sentinel",
        "legacy_identity_conflict",
        "legacy_sequence_conflict",
        "legacy_timestamp_invalid",
        "legacy_timestamp_ambiguous",
        "legacy_secret_unhandled",
        "legacy_referenced_event_missing",
        "legacy_referenced_event_scope_conflict",
    }
    negative_cases = fixture.get("negative_cases", [])
    actual_reasons = {
        case.get("expected", {}).get("quarantine_reason")
        for case in negative_cases
        if isinstance(case, dict)
    }
    if actual_reasons != required_negative_reasons:
        failures.append({"path": path_label, "error": "event_legacy_negative_reason_matrix_mismatch", "expected": sorted(required_negative_reasons), "actual": sorted(str(reason) for reason in actual_reasons)})
    registry_schema = read_json(EVENT_FAMILY_REGISTRY_SCHEMA_PATH)
    for negative in negative_cases:
        if not isinstance(negative, dict):
            failures.append({"path": path_label, "error": "event_legacy_negative_not_object"})
            continue
        expected = negative.get("expected", {})
        if expected.get("checkpoint_advance_delta") != 0 or expected.get("append_count_delta") != 0 or expected.get("projection_effect_count") != 0:
            failures.append({"path": path_label, "error": "event_legacy_negative_mutation_oracle_mismatch", "case_id": negative.get("case_id")})
        if not isinstance(negative.get("mutation"), dict) or not negative.get("mutation", {}).get("kind"):
            failures.append({"path": path_label, "error": "event_legacy_negative_mutation_missing", "case_id": negative.get("case_id")})
            continue
        actual_reason = evaluate_legacy_negative_case(
            negative,
            case_by_id,
            registry,
            registry_schema,
        )
        if actual_reason != expected.get("quarantine_reason"):
            failures.append(
                {
                    "path": path_label,
                    "error": "event_legacy_negative_reason_recomputation_mismatch",
                    "case_id": negative.get("case_id"),
                    "expected": expected.get("quarantine_reason"),
                    "actual": actual_reason,
                }
            )
    return failures


def event_family_registry_contract_failures(*, include_residuals: bool) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    try:
        schema = read_json(EVENT_FAMILY_REGISTRY_SCHEMA_PATH)
    except Exception as exc:  # noqa: BLE001
        return [{"path": rel(EVENT_FAMILY_REGISTRY_SCHEMA_PATH), "error": "json_parse_failed", "detail": str(exc)}]
    try:
        registry = read_json(EVENT_FAMILY_REGISTRY_PATH)
    except Exception as exc:  # noqa: BLE001
        return [{"path": rel(EVENT_FAMILY_REGISTRY_PATH), "error": "json_parse_failed", "detail": str(exc)}]
    failures.extend(
        event_family_registry_data_failures(
            registry,
            schema,
            path_label=rel(EVENT_FAMILY_REGISTRY_PATH),
            include_residuals=include_residuals,
        )
    )
    if not EVENT_FAMILY_LEGACY_FIXTURE_PATH.exists():
        failures.append({"path": rel(EVENT_FAMILY_LEGACY_FIXTURE_PATH), "error": "event_legacy_fixture_missing"})
    else:
        try:
            fixture = read_json(EVENT_FAMILY_LEGACY_FIXTURE_PATH)
            failures.extend(
                event_family_legacy_fixture_failures(
                    fixture,
                    registry,
                    path_label=rel(EVENT_FAMILY_LEGACY_FIXTURE_PATH),
                )
            )
        except Exception as exc:  # noqa: BLE001
            failures.append({"path": rel(EVENT_FAMILY_LEGACY_FIXTURE_PATH), "error": "event_legacy_fixture_validation_exception", "detail": str(exc)})
    return failures


CASE_L_SAFE_POINT_ALIASES = {
    "safe_point.sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}": "coordinator_copy_forward",
    "safe_point:<safe_point_id>": "lookup_only",
}
CASE_L_RESTORE_OUTCOMES = [
    None,
    "restored_clean",
    "restore_failed",
    "restore_skipped",
    "restore_refused",
    "restore_recovery_required",
]
CASE_L_RESTORE_CONFLICT_REASONS = [
    None,
    "worktree_path_mismatch",
    "branch_mismatch",
    "head_mismatch",
    "baseline_stale",
    "snapshot_missing",
    "snapshot_corrupt",
    "snapshot_scope_unsupported",
    "target_path_conflict",
    "restore_conflict",
    "concurrent_edit_conflict",
    "historical_commit_missing",
    "restore_recovery_required",
    "canonicalization_failed",
    "permission_denied",
]
CASE_L_TRANSLATION_OUTCOMES = {"translated", "expired", "deleted"}
CASE_L_QUARANTINE_RISK_STATES = {
    "Q-CRITICAL": {"detected", "secured", "migrated", "restored", "recovery_blocked", "purged"},
    "Q-RESETTABLE": {"detected", "secured", "migrated", "reset_to_default", "restored", "recovery_blocked", "purged"},
    "Q-DERIVED": {"detected", "secured", "migrated", "rebuilt", "restored", "recovery_blocked", "purged"},
    "Q-MIRROR": {"detected", "secured", "migrated", "rebuilt", "restored", "recovery_blocked", "purged"},
}


def event_index_context_failures(
    value: dict[str, Any],
    *,
    current_segment_generation: int,
    current_manifest_generation: int,
    translation_results: dict[str, str] | None = None,
) -> list[str]:
    failures: list[str] = []
    source = value.get("source_locator", {})
    publication = value.get("publication_locator", {})
    if source.get("sequence_id") != value.get("sequence_id"):
        failures.append("event_index_outer_inner_sequence_mismatch")
    if source.get("segment_generation") != current_segment_generation:
        failures.append("event_index_source_generation_not_current")
    if publication.get("manifest_generation") != current_manifest_generation:
        failures.append("event_index_publication_manifest_not_current")
    translation_ref = publication.get("compaction_translation_manifest_ref")
    if translation_ref is not None:
        outcome = (translation_results or {}).get(str(translation_ref))
        if outcome not in CASE_L_TRANSLATION_OUTCOMES:
            failures.append("event_index_translation_not_committed_or_unknown_outcome")
    return failures


def quarantine_transition_context_failures(
    value: dict[str, Any],
    *,
    policy_elapsed: bool,
    active_hold_count: int,
    prior_transition_receipts: list[dict[str, Any]] | None = None,
) -> list[str]:
    failures: list[str] = []
    risk = value.get("risk_class")
    state = value.get("state")
    receipts = value.get("transition_receipts", [])
    if risk not in CASE_L_QUARANTINE_RISK_STATES:
        failures.append("quarantine_unknown_risk_fails_critical")
    elif state not in CASE_L_QUARANTINE_RISK_STATES[risk]:
        failures.append("quarantine_state_invalid_for_risk")
    if value.get("retention_policy_ref") != risk:
        failures.append("quarantine_risk_policy_mismatch")
    if state == "detected":
        if receipts:
            failures.append("quarantine_detected_has_transition_receipts")
    else:
        if not isinstance(receipts, list) or not receipts:
            failures.append("quarantine_live_state_missing_transition_receipts")
        else:
            if receipts[0].get("from_state") != "detected":
                failures.append("quarantine_first_transition_not_detected")
            for previous, current in zip(receipts, receipts[1:]):
                if previous.get("to_state") != current.get("from_state"):
                    failures.append("quarantine_transition_receipts_discontinuous")
            if receipts[-1].get("to_state") != state:
                failures.append("quarantine_current_state_not_last_receipt_state")
    if prior_transition_receipts is not None:
        if receipts[: len(prior_transition_receipts)] != prior_transition_receipts:
            failures.append("quarantine_transition_history_not_append_only")
    if state == "purged":
        if not policy_elapsed:
            failures.append("quarantine_purge_before_policy_expiry")
        if active_hold_count != 0:
            failures.append("quarantine_purge_while_held")
        if len(receipts) < 3 or receipts[-2].get("to_state") not in {
            "migrated", "rebuilt", "reset_to_default", "restored"
        }:
            failures.append("quarantine_purge_without_resolved_predecessor")
    return failures


def storage_case_l_registry_failures(registry: dict[str, Any], *, path_label: str) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    families = registry.get("families", [])
    by_family = {
        row.get("family_id"): row
        for row in families
        if isinstance(row, dict) and isinstance(row.get("family_id"), str)
    }

    event_index = by_family.get("event_record_index", {})
    event_schema = event_index.get("value_schema", {}) if isinstance(event_index.get("value_schema"), dict) else {}
    event_required = event_schema.get("required", [])
    for field in ("source_locator", "publication_locator"):
        if field not in event_required or field not in event_schema.get("properties", {}):
            failures.append({"path": path_label, "error": "case_l_event_index_locator_missing", "field": field})
    for retired_field in ("segment_ref", "byte_offset"):
        if retired_field in event_required or retired_field in event_schema.get("properties", {}):
            failures.append({"path": path_label, "error": "case_l_event_index_retired_scalar_locator_present", "field": retired_field})
    expected_source_required = ["segment_generation", "segment_name", "byte_offset", "sequence_id"]
    actual_source_required = event_schema.get("properties", {}).get("source_locator", {}).get("required")
    if actual_source_required != expected_source_required:
        failures.append({"path": path_label, "error": "case_l_event_index_source_locator_mismatch", "expected": expected_source_required, "actual": actual_source_required})
    expected_publication_required = [
        "manifest_generation", "recovery_epoch", "survivor_prefix_sha256", "checkpoint_ref",
        "compaction_translation_manifest_ref",
    ]
    actual_publication_required = event_schema.get("properties", {}).get("publication_locator", {}).get("required")
    if actual_publication_required != expected_publication_required:
        failures.append({"path": path_label, "error": "case_l_event_index_publication_locator_mismatch", "expected": expected_publication_required, "actual": actual_publication_required})
    event_owner_text = " ".join(str(event_index.get(field, "")) for field in ("replay_behavior", "migration"))
    for token in ("CURRENT", "complete target-generation", "guessed offset", "retired physical locator"):
        if token not in event_owner_text:
            failures.append({"path": path_label, "error": "case_l_event_index_authority_marker_missing", "marker": token})

    for family_id, family in by_family.items():
        aliases = family.get("compatibility_key_shapes", [])
        disposition = family.get("migration_disposition", {})
        alias_dispositions = disposition.get("alias_dispositions", []) if isinstance(disposition, dict) else []
        if aliases:
            keys = [entry.get("key_shape") for entry in alias_dispositions if isinstance(entry, dict)]
            if len(keys) != len(set(keys)) or len(keys) != len(aliases) or set(keys) != set(aliases):
                failures.append({"path": path_label, "error": "case_l_alias_disposition_not_one_to_one", "family_id": family_id})
        elif alias_dispositions:
            failures.append({"path": path_label, "error": "case_l_alias_disposition_without_alias", "family_id": family_id})
    safe_point = by_family.get("safe_point_record", {})
    safe_mapping = {
        entry.get("key_shape"): entry.get("disposition")
        for entry in safe_point.get("migration_disposition", {}).get("alias_dispositions", [])
        if isinstance(entry, dict)
    }
    if safe_mapping != CASE_L_SAFE_POINT_ALIASES:
        failures.append({"path": path_label, "error": "case_l_safe_point_alias_disposition_mismatch", "expected": CASE_L_SAFE_POINT_ALIASES, "actual": safe_mapping})

    restore = by_family.get("safe_point_restore_transaction", {})
    restore_properties = restore.get("value_schema", {}).get("properties", {})
    if restore_properties.get("restore_outcome", {}).get("enum") != CASE_L_RESTORE_OUTCOMES:
        failures.append({"path": path_label, "error": "case_l_restore_outcome_vocabulary_mismatch"})
    if restore_properties.get("conflict_reason_code", {}).get("enum") != CASE_L_RESTORE_CONFLICT_REASONS:
        failures.append({"path": path_label, "error": "case_l_restore_conflict_reason_vocabulary_mismatch"})
    if "conflict_reason_code" not in restore.get("value_schema", {}).get("required", []):
        failures.append({"path": path_label, "error": "case_l_restore_conflict_reason_not_required_present"})

    quarantine = by_family.get("storage_quarantine_record", {})
    quarantine_required = quarantine.get("value_schema", {}).get("required", [])
    for field in ("raw_custody_ref", "custody_manifest_ref", "custody_manifest_sha256", "transition_receipts"):
        if field not in quarantine_required:
            failures.append({"path": path_label, "error": "case_l_quarantine_required_field_missing", "field": field})
    if quarantine.get("restore_disposition", {}).get("mutation_fence_on_unresolved") is not True:
        failures.append({"path": path_label, "error": "case_l_quarantine_unresolved_fence_not_fail_closed"})
    policies = {
        row.get("policy_id"): row
        for row in registry.get("retention_policies", [])
        if isinstance(row, dict)
    }
    if policies.get("Q-CRITICAL", {}).get("overflow_action") != "fail_closed":
        failures.append({"path": path_label, "error": "case_l_quarantine_critical_cap_not_fail_closed"})
    return failures


def json_without_comments(value: Any) -> Any:
    """Return JSON data with only JSON Schema annotation keys named $comment removed."""
    if isinstance(value, dict):
        return {
            key: json_without_comments(child)
            for key, child in value.items()
            if key != "$comment"
        }
    if isinstance(value, list):
        return [json_without_comments(child) for child in value]
    return value


def migration_preflight_context_failures(value: Any, schema: dict[str, Any], *, path_label: str) -> list[dict[str, Any]]:
    failures = draft202012_schema_failures(value, schema, path_label=path_label)
    if not isinstance(value, dict):
        return failures
    numeric_fields = [
        "free_bytes",
        "required_free_bytes",
        "backup_bytes",
        "staging_bytes",
        "reserve_bytes",
    ]
    if not all(isinstance(value.get(field), int) and not isinstance(value.get(field), bool) for field in numeric_fields):
        return failures
    backup_bytes = value["backup_bytes"]
    staging_bytes = value["staging_bytes"]
    expected_reserve = max(268435456, (backup_bytes + staging_bytes + 9) // 10)
    expected_required = backup_bytes + staging_bytes + expected_reserve
    if value["reserve_bytes"] != expected_reserve:
        failures.append(
            {
                "path": path_label,
                "error": "case_l_preflight_reserve_formula_mismatch",
                "expected": expected_reserve,
                "actual": value["reserve_bytes"],
            }
        )
    if value["required_free_bytes"] != expected_required:
        failures.append(
            {
                "path": path_label,
                "error": "case_l_preflight_required_free_formula_mismatch",
                "expected": expected_required,
                "actual": value["required_free_bytes"],
            }
        )
    if value.get("outcome") == "ready" and value["free_bytes"] < value["required_free_bytes"]:
        failures.append({"path": path_label, "error": "case_l_preflight_ready_with_insufficient_space"})
    if value.get("outcome") == "blocked" and value["free_bytes"] >= value["required_free_bytes"]:
        failures.append({"path": path_label, "error": "case_l_preflight_blocked_with_sufficient_space"})
    return failures


def migration_progress_context_failures(value: Any, schema: dict[str, Any], *, path_label: str) -> list[dict[str, Any]]:
    failures = draft202012_schema_failures(value, schema, path_label=path_label)
    if not isinstance(value, dict):
        return failures
    completed_steps = value.get("completed_steps")
    total_steps = value.get("total_steps")
    if (
        isinstance(completed_steps, int)
        and not isinstance(completed_steps, bool)
        and isinstance(total_steps, int)
        and not isinstance(total_steps, bool)
        and completed_steps > total_steps
    ):
        failures.append({"path": path_label, "error": "case_l_progress_steps_exceed_total"})
    if "bytes_done" in value and "bytes_total" in value:
        bytes_done = value.get("bytes_done")
        bytes_total = value.get("bytes_total")
        if (
            isinstance(bytes_done, int)
            and not isinstance(bytes_done, bool)
            and isinstance(bytes_total, int)
            and not isinstance(bytes_total, bool)
            and bytes_done > bytes_total
        ):
            failures.append({"path": path_label, "error": "case_l_progress_bytes_exceed_total"})
    return failures


def case_l_storage_contract_fixture_results(sidecar: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, int]]:
    failures: list[dict[str, Any]] = []
    defs = sidecar.get("$defs", {}) if isinstance(sidecar.get("$defs"), dict) else {}
    preflight_schema = defs.get("migration_preflight_result", {})
    progress_schema = defs.get("migration_progress_snapshot", {})
    progress_validation_schema = {"$defs": defs, **progress_schema}

    small_ready = {
        "outcome": "ready",
        "reason_code": None,
        "filesystem_ref": "filesystem:primary",
        "free_bytes": 268438456,
        "required_free_bytes": 268438456,
        "backup_bytes": 1000,
        "staging_bytes": 2000,
        "reserve_bytes": 268435456,
        "checked_at_utc": "2026-07-18T04:00:00Z",
    }
    small_blocked = {**small_ready, "outcome": "blocked", "reason_code": "blocked_insufficient_space", "free_bytes": 268438455}
    large_ready = {
        **small_ready,
        "backup_bytes": 1_000_000_000,
        "staging_bytes": 2_000_000_000,
        "reserve_bytes": 300_000_000,
        "required_free_bytes": 3_300_000_000,
        "free_bytes": 3_300_000_000,
    }
    progress_base = {
        "migration_id": "migration-1",
        "journal_ref": "journal:migration-1",
        "phase": "preflight",
        "stable_step_label": "Checking free space",
        "completed_steps": 0,
        "total_steps": 8,
        "cancellable": True,
        "updated_at_utc": "2026-07-18T04:00:00Z",
    }
    positives = [
        ("preflight_ready_boundary", "preflight", small_ready),
        ("preflight_blocked_insufficient_space", "preflight", small_blocked),
        ("preflight_percentage_reserve_branch", "preflight", large_ready),
        ("progress_preflight_cancellable", "progress", progress_base),
        (
            "progress_applying_not_cancellable",
            "progress",
            {**progress_base, "phase": "applying", "cancellable": False, "preflight_result": small_ready, "completed_steps": 4, "bytes_done": 10, "bytes_total": 20},
        ),
        (
            "progress_committed_terminal_receipt",
            "progress",
            {**progress_base, "phase": "committed", "cancellable": False, "preflight_result": small_ready, "completed_steps": 8, "terminal_receipt_ref": "migration_receipt:migration-1"},
        ),
    ]
    for case_id, kind, value in positives:
        case_failures = (
            migration_preflight_context_failures(value, preflight_schema, path_label=f"self-test:{case_id}")
            if kind == "preflight"
            else migration_progress_context_failures(value, progress_validation_schema, path_label=f"self-test:{case_id}")
        )
        if case_failures:
            failures.append({"path": rel(STORAGE_RECOVERY_CONTRACTS_SCHEMA_PATH), "error": "case_l_positive_fixture_rejected", "case_id": case_id, "failures": case_failures})

    negatives: list[tuple[str, str, dict[str, Any]]] = [
        ("ready_with_blocked_reason", "preflight", {**small_ready, "reason_code": "blocked_insufficient_space"}),
        ("blocked_with_null_reason", "preflight", {**small_blocked, "reason_code": None}),
        ("ready_with_insufficient_space", "preflight", {**small_ready, "free_bytes": small_ready["required_free_bytes"] - 1}),
        ("blocked_with_sufficient_space", "preflight", {**small_blocked, "free_bytes": small_blocked["required_free_bytes"]}),
        ("wrong_reserve_formula", "preflight", {**small_ready, "reserve_bytes": 268435457, "required_free_bytes": 268438457, "free_bytes": 268438457}),
        ("wrong_required_free_formula", "preflight", {**small_ready, "required_free_bytes": small_ready["required_free_bytes"] + 1, "free_bytes": small_ready["required_free_bytes"] + 1}),
        ("unknown_phase", "progress", {**progress_base, "phase": "estimating"}),
        ("unpaired_bytes", "progress", {**progress_base, "bytes_done": 1}),
        ("bytes_overrun", "progress", {**progress_base, "bytes_done": 2, "bytes_total": 1}),
        ("steps_overrun", "progress", {**progress_base, "completed_steps": 9}),
        ("post_preflight_cancellable", "progress", {**progress_base, "phase": "applying", "cancellable": True, "preflight_result": small_ready}),
        ("forbidden_eta", "progress", {**progress_base, "eta_seconds": 1}),
        ("forbidden_percentage", "progress", {**progress_base, "percentage": 50}),
        ("committed_without_terminal_receipt", "progress", {**progress_base, "phase": "committed", "cancellable": False, "preflight_result": small_ready, "completed_steps": 8}),
    ]
    for case_id, kind, value in negatives:
        case_failures = (
            migration_preflight_context_failures(value, preflight_schema, path_label=f"self-test:{case_id}")
            if kind == "preflight"
            else migration_progress_context_failures(value, progress_validation_schema, path_label=f"self-test:{case_id}")
        )
        if not case_failures:
            failures.append({"path": rel(STORAGE_RECOVERY_CONTRACTS_SCHEMA_PATH), "error": "case_l_negative_fixture_unexpectedly_valid", "case_id": case_id})
    return failures, {"positive_cases": len(positives), "negative_cases": len(negatives)}


def case_l_storage_contract_data_failures(
    sidecar: Any,
    storage_registry: Any,
    event_registry: Any,
    *,
    path_label: str,
) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    if not isinstance(sidecar, dict):
        return [{"path": path_label, "error": "storage_recovery_contracts_not_object"}]
    if sidecar.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
        failures.append({"path": path_label, "error": "storage_recovery_contracts_not_draft_2020_12"})
    try:
        from jsonschema import Draft202012Validator

        Draft202012Validator.check_schema(sidecar)
    except ImportError as exc:
        failures.append({"path": rel(Path(__file__).resolve()), "error": "storage_recovery_draft_2020_12_validator_unavailable", "detail": str(exc)})
    except Exception as exc:  # noqa: BLE001
        failures.append({"path": path_label, "error": "storage_recovery_contracts_schema_invalid", "detail": str(exc)})

    defs = sidecar.get("$defs", {}) if isinstance(sidecar.get("$defs"), dict) else {}
    expected_defs = {"migration_preflight_result", "migration_progress_snapshot"}
    if set(defs) != expected_defs:
        failures.append({"path": path_label, "error": "storage_recovery_definition_set_mismatch", "expected": sorted(expected_defs), "actual": sorted(defs)})
    expected_dispatch = [
        {"$ref": "#/$defs/migration_preflight_result"},
        {"$ref": "#/$defs/migration_progress_snapshot"},
    ]
    if sidecar.get("oneOf") != expected_dispatch:
        failures.append({"path": path_label, "error": "storage_recovery_definition_dispatch_mismatch"})

    preflight = defs.get("migration_preflight_result", {}) if isinstance(defs.get("migration_preflight_result"), dict) else {}
    if preflight.get("required") != CASE_L_PREFLIGHT_REQUIRED_FIELDS:
        failures.append({"path": path_label, "error": "migration_preflight_required_fields_mismatch", "expected": CASE_L_PREFLIGHT_REQUIRED_FIELDS, "actual": preflight.get("required")})
    if set(preflight.get("properties", {})) != set(CASE_L_PREFLIGHT_REQUIRED_FIELDS):
        failures.append({"path": path_label, "error": "migration_preflight_property_set_mismatch"})
    preflight_properties = preflight.get("properties", {}) if isinstance(preflight.get("properties"), dict) else {}
    if preflight_properties.get("outcome", {}).get("enum") != ["ready", "blocked"]:
        failures.append({"path": path_label, "error": "migration_preflight_outcome_vocabulary_mismatch"})
    if preflight_properties.get("reason_code", {}).get("enum") != [None, "blocked_insufficient_space"]:
        failures.append({"path": path_label, "error": "migration_preflight_reason_vocabulary_mismatch"})
    if preflight.get("x-puppet-master-assertions") != CASE_L_PREFLIGHT_ASSERTIONS:
        failures.append({"path": path_label, "error": "migration_preflight_assertion_set_mismatch"})

    progress = defs.get("migration_progress_snapshot", {}) if isinstance(defs.get("migration_progress_snapshot"), dict) else {}
    progress_properties = progress.get("properties", {}) if isinstance(progress.get("properties"), dict) else {}
    if progress_properties.get("phase", {}).get("enum") != CASE_L_MIGRATION_PHASES:
        failures.append({"path": path_label, "error": "migration_progress_phase_set_mismatch", "expected": CASE_L_MIGRATION_PHASES, "actual": progress_properties.get("phase", {}).get("enum")})
    if progress.get("dependentRequired") != {"bytes_done": ["bytes_total"], "bytes_total": ["bytes_done"]}:
        failures.append({"path": path_label, "error": "migration_progress_byte_pairing_mismatch"})
    if progress.get("x-puppet-master-assertions") != CASE_L_PROGRESS_ASSERTIONS:
        failures.append({"path": path_label, "error": "migration_progress_assertion_set_mismatch"})
    progress_text = " ".join(str(progress.get(field, "")) for field in ("title", "description"))
    if "derived only" not in progress_text or "not a receipt" not in progress_text:
        failures.append({"path": path_label, "error": "migration_progress_journal_derived_non_receipt_marker_missing"})
    lowered_property_names = {str(name).lower() for name in progress_properties}
    if any("eta" in name or "percent" in name for name in lowered_property_names):
        failures.append({"path": path_label, "error": "migration_progress_eta_or_percentage_property_present"})

    fixture_failures, _counts = case_l_storage_contract_fixture_results(sidecar)
    failures.extend(fixture_failures)

    if not isinstance(storage_registry, dict):
        failures.append({"path": rel(STORAGE_VALUE_REGISTRY_PATH), "error": "storage_registry_not_object_for_l032"})
    else:
        migration_rows = [
            row for row in storage_registry.get("families", [])
            if isinstance(row, dict) and row.get("family_id") == "migration_receipt"
        ]
        if len(migration_rows) != 1:
            failures.append({"path": rel(STORAGE_VALUE_REGISTRY_PATH), "error": "migration_receipt_authority_count_mismatch", "expected": 1, "actual": len(migration_rows)})
        else:
            migration_row = migration_rows[0]
            inline = migration_row.get("value_schema", {}).get("properties", {}).get("preflight_result")
            if not isinstance(inline, dict):
                failures.append({"path": rel(STORAGE_VALUE_REGISTRY_PATH), "error": "migration_receipt_preflight_projection_missing"})
            elif json_without_comments(inline) != json_without_comments(preflight):
                failures.append({"path": rel(STORAGE_VALUE_REGISTRY_PATH), "error": "migration_receipt_preflight_projection_semantic_mismatch", "ignored_keys": ["$comment"]})
            if isinstance(inline, dict) and any(key == "$ref" for key in _iter_json_keys(inline)):
                failures.append({"path": rel(STORAGE_VALUE_REGISTRY_PATH), "error": "migration_receipt_preflight_projection_contains_external_or_local_ref"})
            if migration_row.get("value_schema_id") != "pm.storage_value.migration_receipt.v1":
                failures.append({"path": rel(STORAGE_VALUE_REGISTRY_PATH), "error": "migration_receipt_schema_authority_mismatch"})
            authority_text = " ".join(str(migration_row.get(field, "")) for field in ("migration", "legacy_canonical_crosswalk_status", "replay_behavior"))
            for marker in ("sole terminal durable query authority", "derived only from the durable migration journal", "neither a receipt nor a storage family"):
                if marker not in authority_text:
                    failures.append({"path": rel(STORAGE_VALUE_REGISTRY_PATH), "error": "migration_receipt_authority_marker_missing", "marker": marker})
        peer_progress_rows = [
            row.get("family_id") for row in storage_registry.get("families", [])
            if isinstance(row, dict) and "migration_progress" in str(row.get("family_id", ""))
        ]
        if peer_progress_rows:
            failures.append({"path": rel(STORAGE_VALUE_REGISTRY_PATH), "error": "migration_progress_snapshot_registered_as_storage_family", "family_ids": peer_progress_rows})
    if isinstance(event_registry, dict):
        event_progress_rows = [
            row.get("event_type") for row in event_registry.get("families", [])
            if isinstance(row, dict)
            and ("migration_progress_snapshot" in str(row.get("event_type", "")) or "migration_progress_snapshot" in str(row.get("family_id", "")))
        ]
        if event_progress_rows:
            failures.append({"path": rel(EVENT_FAMILY_REGISTRY_PATH), "error": "migration_progress_snapshot_invented_as_event_family", "event_types": event_progress_rows})
    return failures


def _iter_json_keys(value: Any):
    if isinstance(value, dict):
        for key, child in value.items():
            yield key
            yield from _iter_json_keys(child)
    elif isinstance(value, list):
        for child in value:
            yield from _iter_json_keys(child)


def command_table_row_count(catalog_text: str, command_id: str) -> int:
    return len(re.findall(rf"^\| `{re.escape(command_id)}` \|", catalog_text, flags=re.MULTILINE))


def command_table_rows(catalog_text: str, command_id: str) -> list[str]:
    return re.findall(rf"^\| `{re.escape(command_id)}` \|.*$", catalog_text, flags=re.MULTILINE)


def _bounded_text(text: str, start_marker: str, end_marker: str) -> str:
    start = text.find(start_marker)
    if start < 0:
        return ""
    end = text.find(end_marker, start + len(start_marker))
    if end < 0:
        return ""
    return text[start:end]


def _backticked_fields_between(text: str, start_marker: str, end_marker: str) -> list[str]:
    bounded = _bounded_text(text, start_marker, end_marker)
    if not bounded:
        return []
    body = bounded[len(start_marker):]
    return re.findall(r"`([a-z][a-z0-9_]*)`", body)


def _plain_fields_between(text: str, start_marker: str, end_marker: str = ";") -> list[str]:
    bounded = _bounded_text(text, start_marker, end_marker)
    if not bounded:
        return []
    body = bounded[len(start_marker):]
    fields: list[str] = []
    for item in body.split(","):
        item = re.sub(r"^\s*and\s+", "", item.strip())
        match = re.match(r"([a-z][a-z0-9_]*)", item)
        if match:
            fields.append(match.group(1))
    return fields


def _markdown_table_cells(row: str) -> list[str]:
    if not row.startswith("|") or not row.endswith("|"):
        return []
    return [cell.strip() for cell in row[1:-1].split("|")]


def _english_list(items: list[str]) -> str:
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    return ", ".join(items[:-1]) + f", and {items[-1]}"


def _case_l_expected_wiring_request_declaration(command_id: str) -> str:
    variant = {
        "cmd.storage.fallback.keep_logical_root": "keep",
        "cmd.storage.fallback.fork_new_instance": "fork",
        "cmd.storage.fallback.export_both": "export",
    }[command_id]
    field_tokens = [
        f"command_id={command_id}",
        "idempotency_key",
        "actor_ref",
        f"confirmation={CASE_L_FALLBACK_CONFIRMATIONS[command_id]}",
        *CASE_L_FALLBACK_CAS_FIELDS,
    ]
    if command_id.endswith("export_both"):
        field_tokens.extend(CASE_L_FALLBACK_EXPORT_REQUEST_FIELDS)
        closure = "no other request field is allowed"
    else:
        closure = "no additional variant fields are allowed"
    return (
        f"Typed input consumes the closed StorageFallbackDispositionRequest {variant} variant exactly: "
        f"{_english_list(field_tokens)}; {closure}"
    )


def case_l_fallback_owner_consumer_failures(
    catalog_text: str,
    wiring: Any,
    commands_text: str,
    storage_owner_text: str,
    contracts_owner_text: str,
    *,
    path_label: str,
) -> list[dict[str, Any]]:
    """Prove the three L-011 consumers equal the live Storage/Contracts owner envelope."""
    failures: list[dict[str, Any]] = []
    entries = wiring.get("entries", {}) if isinstance(wiring, dict) and isinstance(wiring.get("entries"), dict) else {}

    contracts_section = _bounded_text(
        contracts_owner_text,
        "### Storage fallback divergence command envelopes",
        "### Storage compatibility and migration status envelope",
    )
    storage_section = _bounded_text(
        storage_owner_text,
        "#### Approved fallback-divergence disposition owner contract",
        "### Case L-5. EventRecord persistence, legacy normalization, and dedupe",
    )
    if not contracts_section:
        failures.append({"path": rel(CASE_L_CONTRACTS_OWNER_PATH), "error": "l011_contracts_owner_section_missing"})
    if not storage_section:
        failures.append({"path": rel(CASE_L_STORAGE_OWNER_PATH), "error": "l011_storage_owner_section_missing"})

    owner_common_fields = _backticked_fields_between(contracts_section, "Common required fields are ", ".")
    if owner_common_fields != CASE_L_FALLBACK_COMMON_REQUEST_FIELDS:
        failures.append(
            {
                "path": rel(CASE_L_CONTRACTS_OWNER_PATH),
                "error": "l011_owner_common_request_fields_mismatch",
                "expected": CASE_L_FALLBACK_COMMON_REQUEST_FIELDS,
                "actual": owner_common_fields,
            }
        )
    owner_result_fields = _backticked_fields_between(
        contracts_section,
        "`StorageFallbackDispositionResult` is closed with required fields ",
        ". `outcome",
    )
    if owner_result_fields != CASE_L_FALLBACK_RESULT_FIELDS:
        failures.append(
            {
                "path": rel(CASE_L_CONTRACTS_OWNER_PATH),
                "error": "l011_owner_result_fields_mismatch",
                "expected": CASE_L_FALLBACK_RESULT_FIELDS,
                "actual": owner_result_fields,
            }
        )

    owner_variants: dict[str, tuple[str, str]] = {}
    for line in contracts_section.splitlines():
        match = re.match(
            r"^\| `(cmd\.storage\.fallback\.(?:keep_logical_root|fork_new_instance|export_both))` "
            r"\| ([^|]+?) \| `([a-z_]+)` \|$",
            line,
        )
        if match:
            owner_variants[match.group(1)] = (match.group(2).strip(), match.group(3))
    expected_owner_variants = {
        "cmd.storage.fallback.keep_logical_root": ("common fields only", CASE_L_FALLBACK_CONFIRMATIONS["cmd.storage.fallback.keep_logical_root"]),
        "cmd.storage.fallback.fork_new_instance": ("common fields only", CASE_L_FALLBACK_CONFIRMATIONS["cmd.storage.fallback.fork_new_instance"]),
        "cmd.storage.fallback.export_both": ("common fields plus `destination_ref`, `encryption_key_ref`", CASE_L_FALLBACK_CONFIRMATIONS["cmd.storage.fallback.export_both"]),
    }
    if owner_variants != expected_owner_variants:
        failures.append(
            {
                "path": rel(CASE_L_CONTRACTS_OWNER_PATH),
                "error": "l011_owner_request_variants_mismatch",
                "expected": expected_owner_variants,
                "actual": owner_variants,
            }
        )

    candidate_fields = _plain_fields_between(contracts_section, "non-null closed `candidate_binding = {", "}`.")
    if candidate_fields != CASE_L_FALLBACK_CANDIDATE_BINDING_FIELDS:
        failures.append(
            {
                "path": rel(CASE_L_CONTRACTS_OWNER_PATH),
                "error": "l011_owner_candidate_binding_fields_mismatch",
                "expected": CASE_L_FALLBACK_CANDIDATE_BINDING_FIELDS,
                "actual": candidate_fields,
            }
        )
    export_custody_fields = _plain_fields_between(contracts_section, "non-null closed `export_custody = {", "}`.")
    if export_custody_fields != CASE_L_FALLBACK_EXPORT_CUSTODY_FIELDS:
        failures.append(
            {
                "path": rel(CASE_L_CONTRACTS_OWNER_PATH),
                "error": "l011_owner_export_custody_fields_mismatch",
                "expected": CASE_L_FALLBACK_EXPORT_CUSTODY_FIELDS,
                "actual": export_custody_fields,
            }
        )
    owner_receipt_fields = _backticked_fields_between(
        contracts_section,
        f"`{CASE_L_FALLBACK_RECEIPT}` is closed and requires ",
        "; nullable variant fields remain required-present.",
    )
    if owner_receipt_fields != CASE_L_FALLBACK_RECEIPT_FIELDS:
        failures.append(
            {
                "path": rel(CASE_L_CONTRACTS_OWNER_PATH),
                "error": "l011_owner_receipt_fields_mismatch",
                "expected": CASE_L_FALLBACK_RECEIPT_FIELDS,
                "actual": owner_receipt_fields,
            }
        )

    owner_markers = [
        "`outcome = applied | replayed | refused | failed_recoverable`",
        "Keep-logical success has `binding_changed=true`, both candidate/export fields null",
        "Fork success has `binding_changed=false`, export null, and non-null closed `candidate_binding",
        "The active binding is unchanged.",
        "Export success has `binding_changed=false`, candidate null, and non-null closed `export_custody",
        "Both source heads and active binding are unchanged.",
        "Refused/failed results set both variant objects null",
        f"`{CASE_L_FALLBACK_RECEIPT}` is closed",
        "The receipt is durable owner audit/query evidence only: it is not an EventRecord payload",
    ]
    for marker in owner_markers:
        if marker not in contracts_section:
            failures.append({"path": rel(CASE_L_CONTRACTS_OWNER_PATH), "error": "l011_contracts_owner_marker_missing", "marker": marker})
    storage_markers = [
        "`PD-PROBE-L011-01 A/A/A/A/A`",
        "common typed input envelope in `Plans/Contracts_V0.md#storage-fallback-divergence-command-envelopes`",
        "Validate the closed command variant and required fields; reject wrong-variant or unexpected fields.",
        "Every SHA-256 value is lowercase 64-hex.",
        "leaves the active bootstrap binding byte-for-byte unchanged",
        "leaves divergence/authority selection unchanged",
        "The typed result is `applied | replayed | refused | failed_recoverable`.",
        f"`{CASE_L_FALLBACK_RECEIPT}` is the sole durable audit record",
        "These actions emit no `EventRecord`",
    ]
    for command_id in CASE_L_FALLBACK_COMMAND_HANDLERS:
        storage_markers.append(f"`{command_id}`")
    for field in CASE_L_FALLBACK_CAS_FIELDS:
        storage_markers.append(f"`{field}`")
    for marker in storage_markers:
        if marker not in storage_section:
            failures.append({"path": rel(CASE_L_STORAGE_OWNER_PATH), "error": "l011_storage_owner_marker_missing", "marker": marker})
    for retired in CASE_L_FALLBACK_RETIRED_SUCCESS_OUTCOMES:
        if re.search(rf"\b{re.escape(retired)}\b", contracts_section + storage_section):
            failures.append({"path": path_label, "error": "l011_owner_retired_success_outcome_present", "outcome": retired})

    commands_ownership_clause = (
        "Each disposition consumes the storage/Contracts-owned shared closed "
        "`StorageFallbackDispositionRequest` envelope, including its exact command-specific `confirmation`, "
        "full eight-component CAS set, lowercase 64-hex hashes, actor/idempotency identity, and sole storage handler; "
        "`Plans/UI_Command_Catalog.md` registers and consumes that envelope and the closed "
        "`StorageFallbackDispositionResult` but does not own either payload."
    )
    if commands_ownership_clause not in commands_text:
        failures.append(
            {
                "path": rel(CASE_L_COMMAND_SYSTEM_PATH),
                "error": "l011_commands_owner_consumer_relationship_mismatch",
                "expected": commands_ownership_clause,
            }
        )

    catalog_block = _bounded_text(
        catalog_text,
        "The three divergence dispositions consume the Contracts-owned closed `StorageFallbackDispositionRequest` exactly.",
        "The catalog consumes the owner enums without aliases:",
    )
    if not catalog_block:
        failures.append({"path": rel(CASE_L_COMMAND_CATALOG_PATH), "error": "l011_catalog_owner_consumption_block_missing"})
        catalog_request_text = ""
        catalog_result_text = ""
    else:
        result_start = catalog_block.find("Every command consumes the same closed `StorageFallbackDispositionResult`.")
        if result_start < 0:
            failures.append({"path": rel(CASE_L_COMMAND_CATALOG_PATH), "error": "l011_catalog_result_consumption_block_missing"})
            catalog_request_text = catalog_block
            catalog_result_text = ""
        else:
            catalog_request_text = catalog_block[:result_start]
            catalog_result_text = catalog_block[result_start:]

    catalog_common_fields = _backticked_fields_between(catalog_request_text, "Common required fields are ", ".")
    if catalog_common_fields != owner_common_fields or catalog_common_fields != CASE_L_FALLBACK_COMMON_REQUEST_FIELDS:
        failures.append(
            {
                "path": rel(CASE_L_COMMAND_CATALOG_PATH),
                "error": "l011_catalog_common_request_not_owner_equal",
                "expected": CASE_L_FALLBACK_COMMON_REQUEST_FIELDS,
                "actual": catalog_common_fields,
            }
        )
    catalog_result_fields = _backticked_fields_between(catalog_result_text, "Its required fields are ", ";")
    if catalog_result_fields != owner_result_fields or catalog_result_fields != CASE_L_FALLBACK_RESULT_FIELDS:
        failures.append(
            {
                "path": rel(CASE_L_COMMAND_CATALOG_PATH),
                "error": "l011_catalog_result_not_owner_equal",
                "expected": CASE_L_FALLBACK_RESULT_FIELDS,
                "actual": catalog_result_fields,
            }
        )
    catalog_markers = [
        "Keep and fork allow only those common fields.",
        "Export adds only `destination_ref` and `encryption_key_ref`; additional or wrong-variant fields are invalid.",
        "`outcome` is exactly `applied | replayed | refused | failed_recoverable`.",
        "both variant fields are required-present and nullable",
        "Keep success has `binding_changed = true` and both variants null.",
        "Fork success has `binding_changed = false`, `export_custody = null`, and only the closed inactive `candidate_binding`; the active bootstrap binding is unchanged.",
        "Export success has `binding_changed = false`, `candidate_binding = null`, and only the closed output `export_custody`; its `manifest_ref` is custody evidence produced by the owner, never request input, and the active binding and both source heads remain unchanged.",
        "Refused/failed_recoverable results set both variants null, claim no binding change or cleanup",
        "`cleanup_performed` is always false, and both root refs remain retained.",
        f"`{CASE_L_FALLBACK_RECEIPT}` is the sole durable audit artifact.",
        "MUST NOT emit or imply `storage.fallback_reconciled`",
    ]
    for marker in catalog_markers:
        if marker not in catalog_block:
            failures.append({"path": rel(CASE_L_COMMAND_CATALOG_PATH), "error": "l011_catalog_owner_equality_marker_missing", "marker": marker})
    if "confirmation_strength" in catalog_block:
        failures.append({"path": rel(CASE_L_COMMAND_CATALOG_PATH), "error": "l011_confirmation_strength_substituted"})
    for forbidden in ("manifest_ref", "package_ref", "export_custody", "candidate_binding", "owner_receipt_ref"):
        if forbidden in catalog_request_text:
            failures.append({"path": rel(CASE_L_COMMAND_CATALOG_PATH), "error": "l011_request_side_result_or_custody_field", "field": forbidden})
    for retired in CASE_L_FALLBACK_RETIRED_SUCCESS_OUTCOMES:
        if re.search(rf"\b{re.escape(retired)}\b", catalog_block):
            failures.append({"path": rel(CASE_L_COMMAND_CATALOG_PATH), "error": "l011_retired_success_outcome_present", "outcome": retired})

    allowed_fallback_commands = set(CASE_L_FALLBACK_COMMAND_HANDLERS) | {"cmd.storage.fallback.return_fast_forward"}
    catalog_fallback_commands = set(re.findall(r"^\| `(cmd\.storage\.fallback\.[^`]+)` \|", catalog_text, flags=re.MULTILINE))
    wiring_fallback_commands = {
        str(row.get("ui_command_id"))
        for row in entries.values()
        if isinstance(row, dict) and str(row.get("ui_command_id", "")).startswith("cmd.storage.fallback.")
    }
    for actual, source_path in (
        (catalog_fallback_commands, rel(CASE_L_COMMAND_CATALOG_PATH)),
        (wiring_fallback_commands, rel(CASE_L_WIRING_MATRIX_PATH)),
    ):
        if actual != allowed_fallback_commands:
            failures.append({"path": source_path, "error": "l011_fallback_command_set_mismatch", "expected": sorted(allowed_fallback_commands), "actual": sorted(actual)})
    if "cmd.storage.fallback.resolve_divergence" in catalog_text or "cmd.storage.fallback.resolve_divergence" in wiring_fallback_commands:
        failures.append({"path": path_label, "error": "l011_unapproved_generic_divergence_command_present"})

    for command_id, handler in CASE_L_FALLBACK_COMMAND_HANDLERS.items():
        expected_key = command_id.removeprefix("cmd.")
        expected_confirmation = CASE_L_FALLBACK_CONFIRMATIONS[command_id]
        expected_request_fields = list(CASE_L_FALLBACK_COMMON_REQUEST_FIELDS)
        if command_id.endswith("export_both"):
            expected_request_fields.extend(CASE_L_FALLBACK_EXPORT_REQUEST_FIELDS)

        catalog_rows = command_table_rows(catalog_text, command_id)
        if len(catalog_rows) != 1:
            failures.append({"path": rel(CASE_L_COMMAND_CATALOG_PATH), "error": "l011_fallback_catalog_row_count_mismatch", "command_id": command_id, "actual": len(catalog_rows)})
        else:
            catalog_row = catalog_rows[0]
            catalog_cells = _markdown_table_cells(catalog_row)
            if len(catalog_cells) != 5:
                failures.append(
                    {
                        "path": rel(CASE_L_COMMAND_CATALOG_PATH),
                        "error": "l011_catalog_primary_row_shape_mismatch",
                        "command_id": command_id,
                        "actual_cell_count": len(catalog_cells),
                    }
                )
                catalog_args_cell = ""
                catalog_effect_cell = ""
            else:
                catalog_args_cell = catalog_cells[1]
                catalog_effect_cell = catalog_cells[3]
            variant = {
                "cmd.storage.fallback.keep_logical_root": "keep",
                "cmd.storage.fallback.fork_new_instance": "fork",
                "cmd.storage.fallback.export_both": "export",
            }[command_id]
            if command_id.endswith("export_both"):
                variant_declaration = "common fields plus only `destination_ref` and `encryption_key_ref`"
                action = "direct recovery-shell export action"
            else:
                variant_declaration = "common fields only"
                action = "direct recovery-shell action"
            expected_catalog_args_cell = (
                f"Closed `StorageFallbackDispositionRequest` {variant} variant: {variant_declaration}, "
                f"with `command_id = \"{command_id}\"` and `confirmation = \"{expected_confirmation}\"`; {action}"
            )
            expected_catalog_effect_cell = {
                "cmd.storage.fallback.keep_logical_root": (
                    "Dispatches only `handlers::storage::fallback_keep_logical_root`; consumes "
                    "`StorageFallbackDispositionResult`, retains both roots, and writes "
                    "`StorageFallbackResolutionReceipt` without an EventRecord."
                ),
                "cmd.storage.fallback.fork_new_instance": (
                    "Dispatches only `handlers::storage::fallback_fork_new_instance`; consumes "
                    "`StorageFallbackDispositionResult`, returns only the inactive candidate binding without changing "
                    "active bootstrap selection, retains both roots, and writes `StorageFallbackResolutionReceipt` "
                    "without an EventRecord."
                ),
                "cmd.storage.fallback.export_both": (
                    "Dispatches only `handlers::storage::fallback_export_both`; consumes "
                    "`StorageFallbackDispositionResult`, returns output `export_custody` for the encrypted exact-byte "
                    "package, retains both roots until separate cleanup, and writes `StorageFallbackResolutionReceipt` "
                    "without an EventRecord."
                ),
            }[command_id]
            if catalog_args_cell != expected_catalog_args_cell:
                failures.append(
                    {
                        "path": rel(CASE_L_COMMAND_CATALOG_PATH),
                        "error": "l011_catalog_primary_args_cell_not_owner_equal",
                        "command_id": command_id,
                        "expected": expected_catalog_args_cell,
                        "actual": catalog_args_cell,
                    }
                )
            if catalog_effect_cell != expected_catalog_effect_cell:
                failures.append(
                    {
                        "path": rel(CASE_L_COMMAND_CATALOG_PATH),
                        "error": "l011_catalog_primary_effect_cell_not_owner_equal",
                        "command_id": command_id,
                        "expected": expected_catalog_effect_cell,
                        "actual": catalog_effect_cell,
                    }
                )
            for marker in (
                "StorageFallbackDispositionRequest",
                "StorageFallbackDispositionResult",
                CASE_L_FALLBACK_RECEIPT,
                expected_confirmation,
                "without an EventRecord",
            ):
                if marker not in catalog_row:
                    failures.append({"path": rel(CASE_L_COMMAND_CATALOG_PATH), "error": "l011_catalog_primary_row_not_owner_equal", "command_id": command_id, "marker": marker})
            if "confirmation_strength" in catalog_row:
                failures.append({"path": rel(CASE_L_COMMAND_CATALOG_PATH), "error": "l011_confirmation_strength_substituted", "command_id": command_id})

        rows = [
            (key, row) for key, row in entries.items()
            if isinstance(row, dict) and row.get("ui_command_id") == command_id
        ]
        if len(rows) != 1:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_reverse_wiring_count_mismatch", "command_id": command_id, "actual": len(rows)})
            continue
        key, row = rows[0]
        if key != expected_key:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_production_row_key_mismatch", "command_id": command_id, "expected": expected_key, "actual": key})
        if row.get("handler_location") != handler:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_sole_handler_mismatch", "command_id": command_id, "expected": handler, "actual": row.get("handler_location")})
        if row.get("expected_event_types") != []:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_invented_event", "command_id": command_id, "actual": row.get("expected_event_types")})
        effect = row.get("effect_contract", {}) if isinstance(row.get("effect_contract"), dict) else {}
        if effect.get("effect_kind") != "receipt" or effect.get("receipt_or_event_refs") != [CASE_L_FALLBACK_RECEIPT]:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_receipt_only_effect_mismatch", "command_id": command_id, "expected": [CASE_L_FALLBACK_RECEIPT], "actual": effect.get("receipt_or_event_refs")})
        effect_text = json.dumps(effect, sort_keys=True)
        for marker in ("StorageFallbackDispositionResult", CASE_L_FALLBACK_RECEIPT):
            if marker not in effect_text:
                failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_effect_owner_marker_missing", "command_id": command_id, "marker": marker})
        if "no EventRecord" not in effect_text and "emits no storage.fallback_reconciled or generic command event" not in effect_text:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_effect_owner_marker_missing", "command_id": command_id, "marker": "no EventRecord"})

        acceptance = row.get("acceptance_checks") if isinstance(row.get("acceptance_checks"), list) else []
        if len(acceptance) < 7 or not all(isinstance(item, str) for item in acceptance):
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_acceptance_shape_missing", "command_id": command_id})
            continue
        request_text = acceptance[0]
        expected_request_declaration = _case_l_expected_wiring_request_declaration(command_id)
        if request_text != expected_request_declaration:
            failures.append(
                {
                    "path": rel(CASE_L_WIRING_MATRIX_PATH),
                    "error": "l011_fallback_request_declaration_not_owner_equal",
                    "command_id": command_id,
                    "expected": expected_request_declaration,
                    "actual": request_text,
                }
            )
        request_fields = _plain_fields_between(request_text, "exactly: ", ";")
        if request_fields != expected_request_fields:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_request_fields_not_owner_equal", "command_id": command_id, "expected": expected_request_fields, "actual": request_fields})
        if "StorageFallbackDispositionRequest" not in request_text:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_request_type_missing", "command_id": command_id})
        command_match = re.search(r"\bcommand_id=([^,; ]+)", request_text)
        confirmation_match = re.search(r"\bconfirmation=([^,; ]+)", request_text)
        if not command_match or command_match.group(1) != command_id:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_request_command_id_mismatch", "command_id": command_id})
        if not confirmation_match or confirmation_match.group(1) != expected_confirmation:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_confirmation_missing_or_wrong", "command_id": command_id, "expected": expected_confirmation, "actual": confirmation_match.group(1) if confirmation_match else None})
        if "confirmation_strength" in request_text:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_confirmation_strength_substituted", "command_id": command_id})
        request_forbidden = {"manifest_ref", "package_ref", "export_custody", "candidate_binding", "owner_receipt_ref", "retained_logical_root_ref", "retained_fallback_root_ref"}
        for forbidden in sorted(request_forbidden):
            if re.search(rf"\b{re.escape(forbidden)}\b", request_text):
                failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_request_side_result_or_custody_field", "command_id": command_id, "field": forbidden})
        if command_id.endswith("export_both"):
            if "no other request field is allowed" not in request_text:
                failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_export_request_not_closed", "command_id": command_id})
        elif "no additional variant fields are allowed" not in request_text:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_common_request_variant_not_closed", "command_id": command_id})

        cas_text = acceptance[1]
        for field in CASE_L_FALLBACK_CAS_FIELDS:
            if field not in request_text:
                failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_cas_field_missing", "command_id": command_id, "field": field})
        for marker in ("lowercase 64-hex", "revalidates every CAS component"):
            if marker not in cas_text:
                failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_cas_or_lowercase_rule_missing", "command_id": command_id, "marker": marker})

        result_text = acceptance[3]
        result_fields = _plain_fields_between(result_text, "with exactly the required fields ", ";")
        if result_fields != owner_result_fields or result_fields != CASE_L_FALLBACK_RESULT_FIELDS:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_result_fields_not_owner_equal", "command_id": command_id, "expected": CASE_L_FALLBACK_RESULT_FIELDS, "actual": result_fields})
        if "StorageFallbackDispositionResult" not in result_text or "both variants are required-present nullable" not in result_text:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_closed_result_type_or_nullable_variants_missing", "command_id": command_id})
        outcome_phrase = "outcome is exactly " + ", ".join(CASE_L_FALLBACK_RESULT_OUTCOMES[:-1]) + ", or " + CASE_L_FALLBACK_RESULT_OUTCOMES[-1]
        if outcome_phrase not in result_text:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_result_outcome_vocabulary_mismatch", "command_id": command_id, "expected": CASE_L_FALLBACK_RESULT_OUTCOMES})

        variant_text = acceptance[4]
        common_variant_markers = [
            "reason_code=null",
            "non-null owner_receipt_ref",
            "cleanup_performed=false",
            "both retained root refs",
            "refused or failed_recoverable sets both variants null",
            "claims no binding change",
        ]
        variant_markers = {
            "cmd.storage.fallback.keep_logical_root": ["binding_changed=true", "candidate_binding=null", "export_custody=null"],
            "cmd.storage.fallback.fork_new_instance": ["binding_changed=false", "closed inactive candidate_binding only", "export_custody=null", "unchanged active bootstrap binding"],
            "cmd.storage.fallback.export_both": ["binding_changed=false", "candidate_binding=null", "closed output export_custody including manifest_ref", "unchanged active binding and source heads", "custody verification"],
        }
        for marker in common_variant_markers + variant_markers[command_id]:
            if marker not in variant_text:
                failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_result_variant_invariant_missing", "command_id": command_id, "marker": marker})
        if command_id != "cmd.storage.fallback.keep_logical_root" and "binding_changed=true" in variant_text:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_active_binding_change_forbidden", "command_id": command_id})
        if command_id == "cmd.storage.fallback.fork_new_instance" and re.search(r"\bexport_custody=(?!null\b)", variant_text):
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_wrong_result_variant_non_null", "command_id": command_id, "variant": "export_custody"})
        if command_id == "cmd.storage.fallback.export_both" and re.search(r"\bcandidate_binding=(?!null\b)", variant_text):
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_wrong_result_variant_non_null", "command_id": command_id, "variant": "candidate_binding"})

        row_text = json.dumps(row, sort_keys=True)
        for marker in ("Replay returns the same StorageFallbackDispositionResult", CASE_L_FALLBACK_RECEIPT, "Both roots remain retained"):
            if marker not in row_text and not (marker == "Both roots remain retained" and "both roots are retained" in row_text):
                failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_fallback_contract_marker_missing", "command_id": command_id, "marker": marker})
        for retired in CASE_L_FALLBACK_RETIRED_SUCCESS_OUTCOMES:
            if re.search(rf"\b{re.escape(retired)}\b", row_text):
                failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_retired_success_outcome_present", "command_id": command_id, "outcome": retired})
        evidence_text = str(row.get("evidence_required", ""))
        for marker in ("Required future evidence only", "does not assert that the planned handler or fallback runtime exists"):
            if marker not in evidence_text:
                failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l011_future_evidence_boundary_missing", "command_id": command_id, "marker": marker})

    if len(set(CASE_L_FALLBACK_COMMAND_HANDLERS.values())) != 3:
        failures.append({"path": path_label, "error": "l011_fallback_handlers_not_distinct"})
    return failures


def case_l_command_data_failures(
    catalog_text: str,
    wiring: Any,
    surface_texts: dict[str, str],
    storage_owner_text: str,
    contracts_owner_text: str,
    *,
    path_label: str,
) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    entries = wiring.get("entries", {}) if isinstance(wiring, dict) and isinstance(wiring.get("entries"), dict) else {}

    def command_entries(command_id: str) -> list[dict[str, Any]]:
        return [
            row for row in entries.values()
            if isinstance(row, dict) and row.get("ui_command_id") == command_id
        ]

    failures.extend(
        case_l_fallback_owner_consumer_failures(
            catalog_text,
            wiring,
            surface_texts.get(rel(CASE_L_COMMAND_SYSTEM_PATH), ""),
            storage_owner_text,
            contracts_owner_text,
            path_label=path_label,
        )
    )

    # L-020: one canonical command, one wrapper, and one compatibility alias.
    for surface_path, text in surface_texts.items():
        if "retry_scope" in text:
            failures.append({"path": surface_path, "error": "l020_retry_scope_present"})
        if "handlers::orchestrator::safe_point_retry" in text or "handlers::orchestrator::restore_safe_point_then_retry" in text:
            failures.append({"path": surface_path, "error": "l020_peer_orchestrator_handler_present"})
    restore_rows: dict[str, dict[str, Any]] = {}
    for command_id in CASE_L_RESTORE_COMMAND_IDS:
        rows = command_entries(command_id)
        if len(rows) != 1:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l020_restore_reverse_wiring_count_mismatch", "command_id": command_id, "actual": len(rows)})
            continue
        restore_rows[command_id] = rows[0]
        row = rows[0]
        if row.get("handler_location") != CASE_L_RESTORE_HANDLER:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l020_restore_sole_handler_mismatch", "command_id": command_id})
        if row.get("expected_event_types") != [CASE_L_RESTORE_EVENT]:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l020_restore_event_mismatch", "command_id": command_id})
        effect = row.get("effect_contract", {}) if isinstance(row.get("effect_contract"), dict) else {}
        if effect.get("effect_kind") != "event" or effect.get("receipt_or_event_refs") != [CASE_L_RESTORE_EVENT]:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l020_restore_effect_mismatch", "command_id": command_id})
    if len(restore_rows) == 3:
        canonical = restore_rows["cmd.runtime.restore_safe_point_then_retry"]
        for command_id, row in restore_rows.items():
            for field in ("handler_location", "expected_event_types", "state_selector", "disabled_reason_projection"):
                if row.get(field) != canonical.get(field):
                    failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l020_restore_structured_contract_not_equal", "command_id": command_id, "field": field})
            effect = row.get("effect_contract", {})
            canonical_effect = canonical.get("effect_contract", {})
            for field in ("effect_kind", "receipt_or_event_refs"):
                if effect.get(field) != canonical_effect.get(field):
                    failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l020_restore_effect_contract_not_equal", "command_id": command_id, "field": field})
        for wrapper_id in CASE_L_RESTORE_COMMAND_IDS[1:]:
            row_text = json.dumps(restore_rows[wrapper_id], sort_keys=True)
            for marker in ("identical", "permission_snapshot_id", "validates", "consumes", "idempotency", "admission"):
                if marker not in row_text:
                    failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "l020_wrapper_transform_or_equivalence_marker_missing", "command_id": wrapper_id, "marker": marker})
        wrapper_authority_text = "\n".join(command_table_rows(catalog_text, "cmd.orchestrator.safe_point_retry"))
        for field in CASE_L_RESTORE_WRAPPER_FIELDS:
            if field not in wrapper_authority_text:
                failures.append({"path": rel(CASE_L_COMMAND_CATALOG_PATH), "error": "l020_wrapper_input_field_missing", "command_id": "cmd.orchestrator.safe_point_retry", "field": field})
        alias_authority_text = "\n".join(command_table_rows(catalog_text, "cmd.orchestrator.restore_safe_point_then_retry"))
        for marker in ("same wrapper input", "identical"):
            if marker not in alias_authority_text:
                failures.append({"path": rel(CASE_L_COMMAND_CATALOG_PATH), "error": "l020_alias_input_transform_marker_missing", "marker": marker})

    # PGF-010: branched-only exactly-once application and live-derived ghost checks.
    branch_id = "cmd.chat.branch_from_restore"
    if command_table_row_count(catalog_text, branch_id) != 1:
        failures.append({"path": rel(CASE_L_COMMAND_CATALOG_PATH), "error": "pgf010_branch_catalog_row_count_mismatch"})
    branch_rows = command_entries(branch_id)
    if len(branch_rows) != 1:
        failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "pgf010_branch_reverse_wiring_count_mismatch", "actual": len(branch_rows)})
    else:
        row = branch_rows[0]
        if row.get("handler_location") != "handlers::chat::branch_from_restore":
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "pgf010_branch_sole_handler_mismatch"})
        if row.get("expected_event_types") != ["restore_point.applied"]:
            failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "pgf010_branch_event_mismatch"})
        row_text = json.dumps(row, sort_keys=True)
        for marker in (
            "only branched",
            "exactly one restore_point.applied",
            "Replay",
            "without a duplicate",
            "Refused and failed return no target IDs and emit no restore_point.applied",
            "source thread",
            "source branch",
            "source worktree",
            "Git/index state",
            "queue",
            "runtime safe points",
        ):
            if marker not in row_text:
                failures.append({"path": rel(CASE_L_WIRING_MATRIX_PATH), "error": "pgf010_branch_contract_marker_missing", "marker": marker})
    uiw_text = surface_texts.get(rel(CASE_L_UI_WIRING_RULES_PATH), "")
    commands_text = surface_texts.get(rel(CASE_L_COMMAND_SYSTEM_PATH), "")
    for text, source_path, markers in [
        (uiw_text, rel(CASE_L_UI_WIRING_RULES_PATH), ("derived fresh from current normative `cmd.*` references", "current catalog membership", "current production handler/reverse coverage", "does not maintain an example list")),
        (commands_text, rel(CASE_L_COMMAND_SYSTEM_PATH), ("live registration", "catalog/wiring mismatch", "hand-maintained ghost-command example")),
    ]:
        for marker in markers:
            if marker not in text:
                failures.append({"path": source_path, "error": "pgf010_live_derived_ghost_marker_missing", "marker": marker})
    return failures


def pnc019_case_l_preflight_source_failures() -> list[dict[str, Any]]:
    try:
        text = PNC019_CERTIFICATION_HARNESS_PATH.read_text(encoding="utf-8")
        helper_text = PNC019_CURRENTNESS_HELPER_PATH.read_text(encoding="utf-8")
    except Exception as exc:  # noqa: BLE001
        return [{"path": rel(PNC019_CERTIFICATION_HARNESS_PATH), "error": "pnc019_case_l_preflight_source_unavailable", "detail": str(exc)}]
    failures: list[dict[str, Any]] = []
    start = text.find("def certification_preflight_failures(")
    end = text.find("\ndef cmd_run(", start)
    cmd_end = text.find("\ndef main(", end)
    if start < 0 or end < 0 or cmd_end < 0:
        return [{"path": rel(PNC019_CERTIFICATION_HARNESS_PATH), "error": "pnc019_case_l_preflight_missing"}]
    preflight_body = text[start:end]
    cmd_body = text[end:cmd_end]
    for marker in (
        "validate-case-l-non-event-materialization",
        "pnc019_event_authority_clearance_failures(ROOT)",
    ):
        if marker not in preflight_body:
            failures.append({"path": rel(PNC019_CERTIFICATION_HARNESS_PATH), "error": "pnc019_case_l_preflight_marker_missing", "marker": marker})
    for marker in (
        "event_denominator_unresolved",
        "event_family_contract_depth_unresolved",
        "event_authority_audit_failures",
        "quarantined_row_count",
        "denominator_status",
        "bulk_registration_allowed",
        "evidence_currentness",
        "evidence_refs",
    ):
        if marker not in helper_text:
            failures.append({"path": rel(PNC019_CURRENTNESS_HELPER_PATH), "error": "pnc019_case_l_preflight_marker_missing", "marker": marker})
    for marker in (
        "Plans/.audits/event-authority-2026-08-13-currentness",
        "GROUP_ARTIFACT_MANIFEST.json",
        "KEEP_QUARANTINED_NO_REGISTRY_OR_CHECKPOINT_ADVANCE",
        "scripts/pm_pnc019_currentness.py",
    ):
        if marker not in helper_text:
            failures.append({"path": rel(PNC019_CURRENTNESS_HELPER_PATH), "error": "pnc019_event_authority_evidence_marker_missing", "marker": marker})
    if "REQUIRED_PNC019_SOURCE_HASH_PATHS" not in text:
        failures.append({"path": rel(PNC019_CERTIFICATION_HARNESS_PATH), "error": "pnc019_shared_source_hash_contract_not_consumed"})
    preflight_call = cmd_body.find("certification_preflight_failures()")
    receipt_build = cmd_body.find("CertificationHarness().receipt()")
    receipt_write = cmd_body.find("write_json(")
    if preflight_call < 0 or receipt_build < 0 or preflight_call > receipt_build:
        failures.append({"path": rel(PNC019_CERTIFICATION_HARNESS_PATH), "error": "pnc019_case_l_preflight_not_before_harness"})
    if "return 1" not in cmd_body[:receipt_build]:
        failures.append({"path": rel(PNC019_CERTIFICATION_HARNESS_PATH), "error": "pnc019_case_l_preflight_does_not_fail_closed"})
    if 0 <= receipt_write < receipt_build:
        failures.append({"path": rel(PNC019_CERTIFICATION_HARNESS_PATH), "error": "pnc019_writes_receipt_before_case_l_preflight"})
    return failures


def case_l_non_event_materialization_failures() -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    required_json = [
        STORAGE_RECOVERY_CONTRACTS_SCHEMA_PATH,
        STORAGE_VALUE_REGISTRY_PATH,
        EVENT_FAMILY_REGISTRY_PATH,
        CASE_L_WIRING_MATRIX_PATH,
    ]
    loaded: dict[Path, Any] = {}
    for path in required_json:
        try:
            loaded[path] = read_json(path)
        except Exception as exc:  # noqa: BLE001
            failures.append({"path": rel(path), "error": "json_parse_failed", "detail": str(exc)})
    surface_texts: dict[str, str] = {}
    for path in CASE_L_COMMAND_SURFACE_PATHS:
        try:
            surface_texts[rel(path)] = path.read_text(encoding="utf-8")
        except Exception as exc:  # noqa: BLE001
            failures.append({"path": rel(path), "error": "case_l_command_surface_unavailable", "detail": str(exc)})
    owner_texts: dict[Path, str] = {}
    for path in (CASE_L_STORAGE_OWNER_PATH, CASE_L_CONTRACTS_OWNER_PATH):
        try:
            owner_texts[path] = path.read_text(encoding="utf-8")
        except Exception as exc:  # noqa: BLE001
            failures.append({"path": rel(path), "error": "case_l_fallback_owner_surface_unavailable", "detail": str(exc)})
    if all(path in loaded for path in required_json[:3]):
        failures.extend(
            case_l_storage_contract_data_failures(
                loaded[STORAGE_RECOVERY_CONTRACTS_SCHEMA_PATH],
                loaded[STORAGE_VALUE_REGISTRY_PATH],
                loaded[EVENT_FAMILY_REGISTRY_PATH],
                path_label=rel(STORAGE_RECOVERY_CONTRACTS_SCHEMA_PATH),
            )
        )
    if (
        CASE_L_WIRING_MATRIX_PATH in loaded
        and rel(CASE_L_COMMAND_CATALOG_PATH) in surface_texts
        and CASE_L_STORAGE_OWNER_PATH in owner_texts
        and CASE_L_CONTRACTS_OWNER_PATH in owner_texts
    ):
        failures.extend(
            case_l_command_data_failures(
                surface_texts[rel(CASE_L_COMMAND_CATALOG_PATH)],
                loaded[CASE_L_WIRING_MATRIX_PATH],
                surface_texts,
                owner_texts[CASE_L_STORAGE_OWNER_PATH],
                owner_texts[CASE_L_CONTRACTS_OWNER_PATH],
                path_label="case-l-non-event-command-materialization",
            )
        )
    failures.extend(pnc019_case_l_preflight_source_failures())
    return failures


def case_l_non_event_materialization_self_test_checks() -> dict[str, bool]:
    sidecar = read_json(STORAGE_RECOVERY_CONTRACTS_SCHEMA_PATH)
    storage_registry = read_json(STORAGE_VALUE_REGISTRY_PATH)
    event_registry = read_json(EVENT_FAMILY_REGISTRY_PATH)
    wiring = read_json(CASE_L_WIRING_MATRIX_PATH)
    catalog_text = CASE_L_COMMAND_CATALOG_PATH.read_text(encoding="utf-8")
    storage_owner_text = CASE_L_STORAGE_OWNER_PATH.read_text(encoding="utf-8")
    contracts_owner_text = CASE_L_CONTRACTS_OWNER_PATH.read_text(encoding="utf-8")
    surface_texts = {rel(path): path.read_text(encoding="utf-8") for path in CASE_L_COMMAND_SURFACE_PATHS}

    def clone(value: Any) -> Any:
        return json.loads(json.dumps(value))

    checks: dict[str, bool] = {}
    checks["case_l_non_event_live_materialization_valid"] = not case_l_non_event_materialization_failures()
    fixture_failures, fixture_counts = case_l_storage_contract_fixture_results(sidecar)
    checks["l032_six_positive_fourteen_negative_self_tests"] = not fixture_failures and fixture_counts == {"positive_cases": 6, "negative_cases": 14}

    wrong_defs = clone(sidecar)
    wrong_defs["$defs"]["invented_peer"] = {"type": "object"}
    checks["l032_extra_definition_rejected"] = any(
        failure.get("error") == "storage_recovery_definition_set_mismatch"
        for failure in case_l_storage_contract_data_failures(wrong_defs, storage_registry, event_registry, path_label="self-test:l032-extra-def")
    )
    drifted_registry = clone(storage_registry)
    migration_row = next(row for row in drifted_registry["families"] if row.get("family_id") == "migration_receipt")
    migration_row["value_schema"]["properties"]["preflight_result"]["properties"]["free_bytes"]["minimum"] = 1
    checks["l032_registry_semantic_drift_rejected"] = any(
        failure.get("error") == "migration_receipt_preflight_projection_semantic_mismatch"
        for failure in case_l_storage_contract_data_failures(sidecar, drifted_registry, event_registry, path_label="self-test:l032-registry-drift")
    )
    comment_only_registry = clone(storage_registry)
    comment_inline = next(row for row in comment_only_registry["families"] if row.get("family_id") == "migration_receipt")["value_schema"]["properties"]["preflight_result"]
    comment_inline["$comment"] = "Different annotation text is ignored; no semantic keyword is ignored."
    checks["l032_registry_comment_only_difference_allowed"] = not any(
        failure.get("error") == "migration_receipt_preflight_projection_semantic_mismatch"
        for failure in case_l_storage_contract_data_failures(sidecar, comment_only_registry, event_registry, path_label="self-test:l032-comment-only")
    )

    missing_fallback = clone(wiring)
    missing_key = next(key for key, row in missing_fallback["entries"].items() if row.get("ui_command_id") == "cmd.storage.fallback.export_both")
    del missing_fallback["entries"][missing_key]
    checks["l011_missing_reverse_wiring_rejected"] = any(
        failure.get("error") == "l011_fallback_reverse_wiring_count_mismatch"
        for failure in case_l_command_data_failures(catalog_text, missing_fallback, surface_texts, storage_owner_text, contracts_owner_text, path_label="self-test:l011-missing-wiring")
    )
    duplicate_handler = clone(wiring)
    fork_row = next(row for row in duplicate_handler["entries"].values() if row.get("ui_command_id") == "cmd.storage.fallback.fork_new_instance")
    fork_row["handler_location"] = "handlers::storage::fallback_keep_logical_root"
    checks["l011_nonsole_handler_rejected"] = any(
        failure.get("error") == "l011_fallback_sole_handler_mismatch"
        for failure in case_l_command_data_failures(catalog_text, duplicate_handler, surface_texts, storage_owner_text, contracts_owner_text, path_label="self-test:l011-handler")
    )

    def l011_mutation_failures(
        mutated_catalog: str,
        mutated_wiring: Any,
        label: str,
        *,
        mutated_surface_texts: dict[str, str] | None = None,
        mutated_contracts_owner_text: str | None = None,
    ) -> list[dict[str, Any]]:
        return case_l_command_data_failures(
            mutated_catalog,
            mutated_wiring,
            mutated_surface_texts if mutated_surface_texts is not None else surface_texts,
            storage_owner_text,
            mutated_contracts_owner_text if mutated_contracts_owner_text is not None else contracts_owner_text,
            path_label=f"self-test:{label}",
        )

    def mutate_l011_acceptance(command_id: str, index: int, old: str, new: str) -> Any:
        mutated = clone(wiring)
        row = next(row for row in mutated["entries"].values() if row.get("ui_command_id") == command_id)
        assert old in row["acceptance_checks"][index]
        row["acceptance_checks"][index] = row["acceptance_checks"][index].replace(old, new, 1)
        return mutated

    keep_id = "cmd.storage.fallback.keep_logical_root"
    fork_id = "cmd.storage.fallback.fork_new_instance"
    export_id = "cmd.storage.fallback.export_both"

    catalog_primary_extra_mutations = {
        keep_id: (
            "Closed `StorageFallbackDispositionRequest` keep variant: common fields only, with",
            "Closed `StorageFallbackDispositionRequest` keep variant: common fields plus `destination_ref`, with",
        ),
        fork_id: (
            "Closed `StorageFallbackDispositionRequest` fork variant: common fields only, with",
            "Closed `StorageFallbackDispositionRequest` fork variant: common fields plus `unexpected_ref`, with",
        ),
        export_id: (
            "Closed `StorageFallbackDispositionRequest` export variant: common fields plus only "
            "`destination_ref` and `encryption_key_ref`, with",
            "Closed `StorageFallbackDispositionRequest` export variant: common fields plus only "
            "`destination_ref`, `encryption_key_ref`, and `unexpected_ref`, with",
        ),
    }
    for command_id, (old, new) in catalog_primary_extra_mutations.items():
        mutated_catalog = catalog_text.replace(old, new, 1)
        assert mutated_catalog != catalog_text
        variant = command_id.rsplit(".", 1)[-1]
        checks[f"l011_catalog_primary_{variant}_unknown_extra_field_rejected"] = any(
            failure.get("error") == "l011_catalog_primary_args_cell_not_owner_equal"
            and failure.get("command_id") == command_id
            for failure in l011_mutation_failures(
                mutated_catalog,
                wiring,
                f"l011-catalog-primary-extra-{variant}",
            )
        )

    commands_key = rel(CASE_L_COMMAND_SYSTEM_PATH)
    catalog_owned_surfaces = dict(surface_texts)
    catalog_owned_surfaces[commands_key] = catalog_owned_surfaces[commands_key].replace(
        "storage/Contracts-owned shared closed `StorageFallbackDispositionRequest`",
        "catalog-owned shared closed `StorageFallbackDispositionRequest`",
        1,
    )
    assert catalog_owned_surfaces[commands_key] != surface_texts[commands_key]
    checks["l011_commands_catalog_owned_regression_rejected"] = any(
        failure.get("error") == "l011_commands_owner_consumer_relationship_mismatch"
        for failure in l011_mutation_failures(
            catalog_text,
            wiring,
            "l011-commands-catalog-owned",
            mutated_surface_texts=catalog_owned_surfaces,
        )
    )

    for command_id in (keep_id, fork_id, export_id):
        unexpected_suffix = clone(wiring)
        unexpected_suffix_row = next(
            row for row in unexpected_suffix["entries"].values()
            if row.get("ui_command_id") == command_id
        )
        unexpected_suffix_row["acceptance_checks"][0] += " unexpected_ref is also admitted"
        variant = command_id.rsplit(".", 1)[-1]
        checks[f"l011_wiring_{variant}_unexpected_request_suffix_rejected"] = any(
            failure.get("error") == "l011_fallback_request_declaration_not_owner_equal"
            and failure.get("command_id") == command_id
            for failure in l011_mutation_failures(
                catalog_text,
                unexpected_suffix,
                f"l011-wiring-unexpected-suffix-{variant}",
            )
        )

    def backticked_english_list(fields: list[str]) -> str:
        return _english_list([f"`{field}`" for field in fields])

    receipt_fields_text = backticked_english_list(CASE_L_FALLBACK_RECEIPT_FIELDS)
    assert receipt_fields_text in contracts_owner_text
    for omitted_field in CASE_L_FALLBACK_RECEIPT_FIELDS:
        remaining_fields_text = backticked_english_list(
            [field for field in CASE_L_FALLBACK_RECEIPT_FIELDS if field != omitted_field]
        )
        omitted_receipt_contracts = contracts_owner_text.replace(
            receipt_fields_text,
            remaining_fields_text,
            1,
        )
        assert omitted_receipt_contracts != contracts_owner_text
        checks[f"l011_receipt_omission_{omitted_field}_rejected"] = any(
            failure.get("error") == "l011_owner_receipt_fields_mismatch"
            and omitted_field not in failure.get("actual", [])
            for failure in l011_mutation_failures(
                catalog_text,
                wiring,
                f"l011-receipt-omission-{omitted_field}",
                mutated_contracts_owner_text=omitted_receipt_contracts,
            )
        )

    catalog_confirmation_strength = catalog_text.replace(
        'confirmation = "retain_fallback_and_select_logical"',
        'confirmation_strength = "strong"',
        1,
    )
    checks["l011_confirmation_strength_substitution_rejected"] = any(
        failure.get("error") == "l011_confirmation_strength_substituted"
        for failure in l011_mutation_failures(catalog_confirmation_strength, wiring, "l011-confirmation-strength")
    )
    missing_confirmation = mutate_l011_acceptance(
        keep_id,
        0,
        "confirmation=retain_fallback_and_select_logical, ",
        "",
    )
    checks["l011_missing_command_confirmation_rejected"] = any(
        failure.get("error") == "l011_fallback_confirmation_missing_or_wrong"
        for failure in l011_mutation_failures(catalog_text, missing_confirmation, "l011-missing-confirmation")
    )
    wrong_confirmation = mutate_l011_acceptance(
        fork_id,
        0,
        "confirmation=create_inactive_candidate_without_switch",
        "confirmation=retain_fallback_and_select_logical",
    )
    checks["l011_wrong_command_confirmation_rejected"] = any(
        failure.get("error") == "l011_fallback_confirmation_missing_or_wrong"
        for failure in l011_mutation_failures(catalog_text, wrong_confirmation, "l011-wrong-confirmation")
    )
    missing_actor = mutate_l011_acceptance(keep_id, 0, "actor_ref, ", "")
    checks["l011_missing_actor_ref_rejected"] = any(
        failure.get("error") == "l011_fallback_request_fields_not_owner_equal"
        for failure in l011_mutation_failures(catalog_text, missing_actor, "l011-missing-actor")
    )
    checks["l011_each_missing_cas_component_rejected"] = all(
        any(
            failure.get("error") in {"l011_fallback_request_fields_not_owner_equal", "l011_fallback_cas_field_missing"}
            for failure in l011_mutation_failures(
                catalog_text,
                mutate_l011_acceptance(export_id, 0, f"{field}, ", ""),
                f"l011-missing-cas-{field}",
            )
        )
        for field in CASE_L_FALLBACK_CAS_FIELDS
    )
    request_manifest = mutate_l011_acceptance(export_id, 0, "; no other request field", ", manifest_ref; no other request field")
    checks["l011_export_request_manifest_ref_rejected"] = any(
        failure.get("error") == "l011_request_side_result_or_custody_field"
        and failure.get("field") == "manifest_ref"
        for failure in l011_mutation_failures(catalog_text, request_manifest, "l011-request-manifest")
    )
    request_custody = mutate_l011_acceptance(export_id, 0, "; no other request field", ", export_custody; no other request field")
    checks["l011_request_side_custody_rejected"] = any(
        failure.get("error") == "l011_request_side_result_or_custody_field"
        and failure.get("field") == "export_custody"
        for failure in l011_mutation_failures(catalog_text, request_custody, "l011-request-custody")
    )
    for command_id, retired_outcome in zip(
        (keep_id, fork_id, export_id),
        CASE_L_FALLBACK_RETIRED_SUCCESS_OUTCOMES,
    ):
        invented_outcome = mutate_l011_acceptance(
            command_id,
            3,
            "applied, replayed, refused, or failed_recoverable",
            f"{retired_outcome}, replayed, refused, or failed_recoverable",
        )
        checks[f"l011_invented_{retired_outcome}_outcome_rejected"] = any(
            failure.get("error") in {"l011_fallback_result_outcome_vocabulary_mismatch", "l011_retired_success_outcome_present"}
            for failure in l011_mutation_failures(catalog_text, invented_outcome, f"l011-outcome-{retired_outcome}")
        )
    omitted_result_field = mutate_l011_acceptance(
        keep_id,
        3,
        "active_bootstrap_binding_sha256, ",
        "",
    )
    checks["l011_omitted_required_result_field_rejected"] = any(
        failure.get("error") == "l011_fallback_result_fields_not_owner_equal"
        for failure in l011_mutation_failures(catalog_text, omitted_result_field, "l011-result-field")
    )
    fork_wrong_variant = mutate_l011_acceptance(fork_id, 4, "export_custody=null", "export_custody=non_null")
    checks["l011_fork_nonnull_export_variant_rejected"] = any(
        failure.get("error") == "l011_fallback_wrong_result_variant_non_null"
        for failure in l011_mutation_failures(catalog_text, fork_wrong_variant, "l011-fork-wrong-variant")
    )
    export_wrong_variant = mutate_l011_acceptance(export_id, 4, "candidate_binding=null", "candidate_binding=non_null")
    checks["l011_export_nonnull_candidate_variant_rejected"] = any(
        failure.get("error") == "l011_fallback_wrong_result_variant_non_null"
        for failure in l011_mutation_failures(catalog_text, export_wrong_variant, "l011-export-wrong-variant")
    )
    fork_binding_change = mutate_l011_acceptance(fork_id, 4, "binding_changed=false", "binding_changed=true")
    checks["l011_fork_active_binding_change_rejected"] = any(
        failure.get("error") == "l011_fallback_active_binding_change_forbidden"
        for failure in l011_mutation_failures(catalog_text, fork_binding_change, "l011-fork-binding-change")
    )
    export_binding_change = mutate_l011_acceptance(export_id, 4, "binding_changed=false", "binding_changed=true")
    checks["l011_export_active_binding_change_rejected"] = any(
        failure.get("error") == "l011_fallback_active_binding_change_forbidden"
        for failure in l011_mutation_failures(catalog_text, export_binding_change, "l011-export-binding-change")
    )
    generic_receipt = clone(wiring)
    generic_receipt_row = next(row for row in generic_receipt["entries"].values() if row.get("ui_command_id") == keep_id)
    generic_receipt_row["effect_contract"]["receipt_or_event_refs"] = ["storage_owner_receipt_ref"]
    checks["l011_generic_receipt_placeholder_rejected"] = any(
        failure.get("error") == "l011_fallback_receipt_only_effect_mismatch"
        for failure in l011_mutation_failures(catalog_text, generic_receipt, "l011-generic-receipt")
    )
    invented_event = clone(wiring)
    invented_event_row = next(row for row in invented_event["entries"].values() if row.get("ui_command_id") == keep_id)
    invented_event_row["expected_event_types"] = ["storage.fallback_reconciled"]
    checks["l011_invented_event_rejected"] = any(
        failure.get("error") == "l011_fallback_invented_event"
        for failure in l011_mutation_failures(catalog_text, invented_event, "l011-invented-event")
    )
    retry_scope_surfaces = dict(surface_texts)
    retry_scope_surfaces[rel(PLANS / "Executor_Protocol.md")] += "\nretry_scope\n"
    checks["l020_retry_scope_rejected_across_nine_surfaces"] = any(
        failure.get("error") == "l020_retry_scope_present"
        for failure in case_l_command_data_failures(catalog_text, wiring, retry_scope_surfaces, storage_owner_text, contracts_owner_text, path_label="self-test:l020-retry-scope")
    )
    peer_effect = clone(wiring)
    alias_row = next(row for row in peer_effect["entries"].values() if row.get("ui_command_id") == "cmd.orchestrator.restore_safe_point_then_retry")
    alias_row["effect_contract"]["receipt_or_event_refs"] = []
    checks["l020_peer_effect_rejected"] = any(
        failure.get("error") in {"l020_restore_effect_mismatch", "l020_restore_effect_contract_not_equal"}
        for failure in case_l_command_data_failures(catalog_text, peer_effect, surface_texts, storage_owner_text, contracts_owner_text, path_label="self-test:l020-peer-effect")
    )
    branch_no_event = clone(wiring)
    branch_row = next(row for row in branch_no_event["entries"].values() if row.get("ui_command_id") == "cmd.chat.branch_from_restore")
    branch_row["expected_event_types"] = []
    checks["pgf010_missing_branched_event_rejected"] = any(
        failure.get("error") == "pgf010_branch_event_mismatch"
        for failure in case_l_command_data_failures(catalog_text, branch_no_event, surface_texts, storage_owner_text, contracts_owner_text, path_label="self-test:pgf010-event")
    )
    stale_ghost_surfaces = dict(surface_texts)
    stale_ghost_surfaces[rel(CASE_L_UI_WIRING_RULES_PATH)] = "hand maintained list"
    checks["pgf010_stale_ghost_oracle_rejected"] = any(
        failure.get("error") == "pgf010_live_derived_ghost_marker_missing"
        for failure in case_l_command_data_failures(catalog_text, wiring, stale_ghost_surfaces, storage_owner_text, contracts_owner_text, path_label="self-test:pgf010-ghost")
    )
    checks["pnc019_case_l_preflight_source_fail_closed"] = not pnc019_case_l_preflight_source_failures()
    return checks


def case_l_verification_self_test_checks() -> dict[str, bool]:
    registry = read_json(STORAGE_VALUE_REGISTRY_PATH)
    event_registry = read_json(EVENT_FAMILY_REGISTRY_PATH)
    event_registry_schema = read_json(EVENT_FAMILY_REGISTRY_SCHEMA_PATH)
    legacy_fixture = read_json(EVENT_FAMILY_LEGACY_FIXTURE_PATH)

    def clone(value: Any) -> Any:
        return json.loads(json.dumps(value))

    checks: dict[str, bool] = {}
    structural_event_failures = event_family_registry_data_failures(
        event_registry,
        event_registry_schema,
        path_label="self-test:event-family-registry",
        include_residuals=False,
    )
    checks["event_family_registry_39_row_kernel_structurally_valid"] = not structural_event_failures
    goal_owner_types = set(
        read_json(EVENT_FAMILY_GOAL_OWNER_SCHEMA_PATH)
        .get("properties", {})
        .get("event_name", {})
        .get("enum", [])
    )
    actual_goal_refs = {
        row.get("event_type"): row.get("payload_schema_ref", {}).get("path")
        for row in event_registry.get("families", [])
        if isinstance(row, dict) and row.get("event_type") in goal_owner_types
    }
    checks["event_family_registry_v2_exact_goal_refs_match_owner_enum"] = (
        event_registry.get("schema_id") == EVENT_FAMILY_REGISTRY_SCHEMA_ID
        and event_registry.get("schema_version") == EVENT_FAMILY_REGISTRY_SCHEMA_VERSION
        and goal_owner_types == set(EVENT_FAMILY_GOAL_PAYLOAD_SCHEMA_REFS)
        and actual_goal_refs == EVENT_FAMILY_GOAL_PAYLOAD_SCHEMA_REFS
    )
    checks["event_legacy_two_positive_full_negative_matrix_recomputes"] = not event_family_legacy_fixture_failures(
        legacy_fixture,
        event_registry,
        path_label="self-test:event-legacy-fixture",
    )
    positive_cases = {
        case.get("case_id"): case
        for case in legacy_fixture.get("cases", [])
        if isinstance(case, dict)
    }
    selected_positive_schema_ids = {}
    for case_id, case in positive_cases.items():
        normalized, reason, _derived = normalized_legacy_case(case, event_registry)
        selected_positive_schema_ids[case_id] = (
            normalized.get("payload_schema_id")
            if reason is None and isinstance(normalized, dict)
            else reason
        )
    checks["event_legacy_both_positive_compatibility_readers_selected"] = (
        selected_positive_schema_ids
        == {
            "legacy_app_storage_boot_recovery": "https://puppetmaster.local/schemas/event_payloads/storage_boot_recovery/1.0.0",
            "legacy_project_run_started": "https://puppetmaster.local/schemas/event_payloads/run_started/1.0.0",
        }
    )
    run_started_case = positive_cases["legacy_project_run_started"]
    run_started_row = next(
        row for row in event_registry["families"] if row.get("event_type") == "run.started"
    )
    run_started_schema, _run_started_schema_id = event_family_payload_schema(run_started_row)
    assert isinstance(run_started_schema, dict)
    no_reader_registry = clone(event_registry)
    no_reader_row = next(
        row for row in no_reader_registry["families"] if row.get("event_type") == "run.started"
    )
    no_reader_schema = clone(run_started_schema)
    no_reader_schema["$defs"] = {
        name: value
        for name, value in no_reader_schema.get("$defs", {}).items()
        if not name.endswith("_compatibility_reader")
    }
    no_reader_row["payload_schema"] = no_reader_schema
    no_reader_row.pop("payload_schema_ref", None)
    checks["event_legacy_zero_compatibility_reader_match_fails_closed"] = (
        normalized_legacy_case(run_started_case, no_reader_registry)[1]
        == "legacy_payload_schema_invalid"
    )
    ambiguous_reader_registry = clone(event_registry)
    ambiguous_reader_row = next(
        row for row in ambiguous_reader_registry["families"] if row.get("event_type") == "run.started"
    )
    ambiguous_reader_schema = clone(run_started_schema)
    compatibility_reader = clone(
        ambiguous_reader_schema["$defs"]["run_started_1_0_0_compatibility_reader"]
    )
    compatibility_reader["$id"] = (
        "https://puppetmaster.local/schemas/event_payloads/run_started/1.0.0-ambiguous"
    )
    ambiguous_reader_schema["$defs"]["run_started_ambiguous_compatibility_reader"] = (
        compatibility_reader
    )
    ambiguous_reader_row["payload_schema"] = ambiguous_reader_schema
    ambiguous_reader_row.pop("payload_schema_ref", None)
    checks["event_legacy_multiple_compatibility_reader_matches_fail_closed"] = (
        normalized_legacy_case(run_started_case, ambiguous_reader_registry)[1]
        == "legacy_payload_schema_ambiguous"
    )
    residual_failures = event_family_registry_data_failures(
        event_registry,
        event_registry_schema,
        path_label="self-test:event-family-registry-residual",
        include_residuals=True,
    )
    checks["event_denominator_residual_remains_fail_closed"] = any(
        failure.get("error") == "event_denominator_unresolved"
        and failure.get("registered_kernel_rows") == 39
        and failure.get("quarantined_row_count") == 252
        and failure.get("denominator_status") == "UNKNOWN_OPEN"
        and failure.get("bulk_registration_allowed") is False
        and failure.get("evidence_currentness")
        == "live_rehashed_fail_closed_currentness_audit"
        and failure.get("evidence_refs") == EVENT_FAMILY_EVIDENCE_REFS
        and failure.get("corpus_complete") is False
        and failure.get("disposition")
        == "unknown_or_unregistered_event_types_quarantine_without_checkpoint_advance"
        for failure in residual_failures
    )
    checks["event_contract_depth_residual_remains_fail_closed"] = any(
        failure.get("error") == "event_family_contract_depth_unresolved"
        and failure.get("registered_kernel_rows") == 39
        and failure.get("contract_depth_complete") is False
        for failure in residual_failures
    )
    missing_event_row = clone(event_registry)
    missing_event_row["families"] = [
        row for row in missing_event_row["families"] if row.get("event_type") != "run.started"
    ]
    checks["event_missing_required_row_rejected"] = any(
        failure.get("error") in {
            "event_family_registry_kernel_row_count_mismatch",
            "event_family_registry_required_kernel_type_missing",
        }
        for failure in event_family_registry_data_failures(
            missing_event_row,
            event_registry_schema,
            path_label="self-test:event-missing-row",
            include_residuals=False,
        )
    )
    bad_scope_registry = clone(event_registry)
    next(row for row in bad_scope_registry["families"] if row.get("event_type") == "run.started")["scope_policy"] = "application_only"
    checks["event_bad_scope_policy_rejected"] = any(
        failure.get("error") == "event_family_registry_scope_policy_mismatch"
        for failure in event_family_registry_data_failures(
            bad_scope_registry,
            event_registry_schema,
            path_label="self-test:event-bad-scope",
            include_residuals=False,
        )
    )

    checks["storage_case_l_live_registry_semantics_valid"] = not storage_case_l_registry_failures(
        registry,
        path_label="self-test:storage-case-l",
    )
    checks["pnc019_generation_qualified_event_index_consumer_valid"] = not pnc019_event_index_consumer_failures()
    families = {row["family_id"]: row for row in registry["families"]}
    hash_value = "a" * 64
    event_index_value = {
        "schema_id": "pm.storage_value.event_record_index.v2",
        "schema_version": "2.0.0",
        "scope_kind": "project",
        "project_id": "project-1",
        "scope_partition": "project~cHJvamVjdC0x",
        "sequence_id": 42,
        "event_id": "event-42",
        "event_type": "run.started",
        "source_locator": {
            "segment_generation": 7,
            "segment_name": "segment-0007.closed",
            "byte_offset": 128,
            "sequence_id": 42,
        },
        "publication_locator": {
            "manifest_generation": 7,
            "recovery_epoch": 3,
            "survivor_prefix_sha256": hash_value,
            "checkpoint_ref": "checkpoint:event-projector:7",
            "compaction_translation_manifest_ref": None,
        },
        "payload_sha256": hash_value,
        "producer_semantic_digest": hash_value,
        "idempotency_key": "run.started:42",
        "correlation_id": "correlation-1",
        "causation_event_id": None,
        "persisted_at_utc": "2026-07-18T03:00:00Z",
        "redaction_profile": "no_secrets",
        "source_schema_id": EVENT_RECORD_SCHEMA_ID,
        "source_schema_version": EVENT_RECORD_SCHEMA_VERSION,
        "projector_replay_only": False,
    }
    event_index_schema = families["event_record_index"]["value_schema"]
    checks["l015_generation_qualified_value_valid"] = not draft202012_schema_failures(
        event_index_value,
        event_index_schema,
        path_label="self-test:l015-valid",
    ) and not event_index_context_failures(
        event_index_value,
        current_segment_generation=7,
        current_manifest_generation=7,
    )
    missing_source_locator = clone(event_index_value)
    missing_source_locator.pop("source_locator")
    checks["l015_missing_source_locator_rejected"] = bool(
        draft202012_schema_failures(
            missing_source_locator,
            event_index_schema,
            path_label="self-test:l015-missing-source-locator",
        )
    )
    retired_scalar_locator = clone(event_index_value)
    retired_scalar_locator.pop("source_locator")
    retired_scalar_locator.pop("publication_locator")
    retired_scalar_locator["segment_ref"] = "segment:retired"
    retired_scalar_locator["byte_offset"] = 128
    checks["l015_retired_scalar_locator_rejected"] = bool(
        draft202012_schema_failures(
            retired_scalar_locator,
            event_index_schema,
            path_label="self-test:l015-retired-scalar-locator",
        )
    )
    mismatched_sequence = clone(event_index_value)
    mismatched_sequence["source_locator"]["sequence_id"] = 41
    checks["l015_outer_inner_sequence_mismatch_rejected"] = bool(
        event_index_context_failures(
            mismatched_sequence,
            current_segment_generation=7,
            current_manifest_generation=7,
        )
    )
    stale_generation = clone(event_index_value)
    stale_generation["source_locator"]["segment_generation"] = 6
    checks["l015_current_generation_mismatch_rejected"] = bool(
        event_index_context_failures(
            stale_generation,
            current_segment_generation=7,
            current_manifest_generation=7,
        )
    )
    stale_manifest = clone(event_index_value)
    stale_manifest["publication_locator"]["manifest_generation"] = 6
    checks["l015_current_manifest_mismatch_rejected"] = bool(
        event_index_context_failures(
            stale_manifest,
            current_segment_generation=7,
            current_manifest_generation=7,
        )
    )
    checks["l015_translation_outcomes_closed"] = all(
        not event_index_context_failures(
            {
                **clone(event_index_value),
                "publication_locator": {
                    **clone(event_index_value["publication_locator"]),
                    "compaction_translation_manifest_ref": "translation:1",
                },
            },
            current_segment_generation=7,
            current_manifest_generation=7,
            translation_results={"translation:1": outcome},
        )
        for outcome in CASE_L_TRANSLATION_OUTCOMES
    ) and bool(
        event_index_context_failures(
            {
                **clone(event_index_value),
                "publication_locator": {
                    **clone(event_index_value["publication_locator"]),
                    "compaction_translation_manifest_ref": "translation:1",
                },
            },
            current_segment_generation=7,
            current_manifest_generation=7,
            translation_results={"translation:1": "guessed"},
        )
    )

    safe_alias_bad = clone(registry)
    safe_family = next(row for row in safe_alias_bad["families"] if row.get("family_id") == "safe_point_record")
    safe_family["migration_disposition"]["alias_dispositions"].pop()
    checks["l021_missing_alias_disposition_rejected"] = any(
        failure.get("error") == "case_l_alias_disposition_not_one_to_one"
        for failure in storage_case_l_registry_failures(safe_alias_bad, path_label="self-test:l021-missing")
    )
    safe_alias_duplicate = clone(registry)
    safe_family = next(row for row in safe_alias_duplicate["families"] if row.get("family_id") == "safe_point_record")
    safe_family["migration_disposition"]["alias_dispositions"].append(
        clone(safe_family["migration_disposition"]["alias_dispositions"][0])
    )
    checks["l021_duplicate_alias_disposition_rejected"] = any(
        failure.get("error") == "case_l_alias_disposition_not_one_to_one"
        for failure in storage_case_l_registry_failures(safe_alias_duplicate, path_label="self-test:l021-duplicate")
    )
    safe_alias_extra = clone(registry)
    safe_family = next(row for row in safe_alias_extra["families"] if row.get("family_id") == "safe_point_record")
    safe_family["migration_disposition"]["alias_dispositions"].append(
        {"key_shape": "safe_point:unknown", "disposition": "lookup_only"}
    )
    checks["l021_extra_alias_disposition_rejected"] = any(
        failure.get("error") == "case_l_alias_disposition_not_one_to_one"
        for failure in storage_case_l_registry_failures(safe_alias_extra, path_label="self-test:l021-extra")
    )
    safe_alias_swapped = clone(registry)
    safe_family = next(row for row in safe_alias_swapped["families"] if row.get("family_id") == "safe_point_record")
    for entry in safe_family["migration_disposition"]["alias_dispositions"]:
        entry["disposition"] = "lookup_only" if entry["disposition"] == "coordinator_copy_forward" else "coordinator_copy_forward"
    checks["l021_swapped_safe_point_alias_modes_rejected"] = any(
        failure.get("error") == "case_l_safe_point_alias_disposition_mismatch"
        for failure in storage_case_l_registry_failures(safe_alias_swapped, path_label="self-test:l021-swapped")
    )
    safe_alias_unknown_mode = clone(registry)
    safe_family = next(row for row in safe_alias_unknown_mode["families"] if row.get("family_id") == "safe_point_record")
    safe_family["migration_disposition"]["alias_dispositions"][0]["disposition"] = "unknown"
    checks["l021_unknown_alias_disposition_rejected"] = any(
        failure.get("error") == "case_l_safe_point_alias_disposition_mismatch"
        for failure in storage_case_l_registry_failures(safe_alias_unknown_mode, path_label="self-test:l021-unknown-mode")
    )

    restore_schema = families["safe_point_restore_transaction"]["value_schema"]
    restore_base = {
        property_name: (
            property_schema.get("const")
            if "const" in property_schema
            else None
        )
        for property_name, property_schema in restore_schema["properties"].items()
    }
    restore_base.update(
        {
            "restore_transaction_id": "restore-txn-1", "project_id": "project-1",
            "safe_point_id": "safe-point-1", "canonical_safe_point_key": "sp:run-1:node-1:attempt-1:safe-point-1",
            "run_id": "run-1", "node_id": "node-1", "attempt_id": "attempt-1",
            "target_manifest_ref": "manifest:target", "target_manifest_sha256": hash_value,
            "target_state_sha256": hash_value, "pre_restore_manifest_ref": "manifest:pre",
            "pre_restore_manifest_sha256": hash_value, "pre_restore_state_sha256": hash_value,
            "operations": [], "phase": "prepared", "operation_cursor": 0,
            "mutation_lease_ref": "lease:1", "hold_refs": ["hold:1"],
            "started_at_utc": "2026-07-18T03:00:00Z", "updated_at_utc": "2026-07-18T03:00:00Z",
            "restart_count": 0, "restore_outcome": None, "conflict_reason_code": None,
            "post_restore_state_sha256": None, "recovered_after_restart": False,
            "result_event_ref": None, "redaction_profile": "no_secrets",
        }
    )
    checks["l024_all_14_reason_tokens_and_null_valid"] = all(
        not draft202012_schema_failures(
            {**restore_base, "conflict_reason_code": reason},
            restore_schema,
            path_label="self-test:l024-reason",
        )
        for reason in CASE_L_RESTORE_CONFLICT_REASONS
    )
    checks["l024_restored_with_conflicts_rejected"] = bool(
        draft202012_schema_failures(
            {**restore_base, "restore_outcome": "restored_with_conflicts"},
            restore_schema,
            path_label="self-test:l024-forbidden-outcome",
        )
    )
    checks["l024_unknown_reason_rejected"] = bool(
        draft202012_schema_failures(
            {**restore_base, "conflict_reason_code": "unknown_reason"},
            restore_schema,
            path_label="self-test:l024-unknown-reason",
        )
    )
    missing_reason = clone(restore_base)
    missing_reason.pop("conflict_reason_code")
    checks["l024_required_present_reason_rejected_when_missing"] = bool(
        draft202012_schema_failures(
            missing_reason,
            restore_schema,
            path_label="self-test:l024-missing-reason",
        )
    )

    quarantine_schema = families["storage_quarantine_record"]["value_schema"]
    def transition(from_state: str, to_state: str, suffix: str) -> dict[str, Any]:
        return {
            "receipt_ref": f"receipt:{suffix}", "from_state": from_state, "to_state": to_state,
            "actor_ref": "actor:storage", "reason": f"transition-{suffix}",
            "input_sha256": hash_value, "output_sha256": hash_value,
            "event_refs": [f"event:{suffix}"], "occurred_at_utc": "2026-07-18T03:00:00Z",
        }
    def quarantine(risk: str, state: str, receipts: list[dict[str, Any]]) -> dict[str, Any]:
        return {
            "schema_id": "pm.storage_value.storage_quarantine_record.v1", "schema_version": "1.0.0",
            "storage_instance_id": "storage-1", "quarantine_id": "quarantine-1",
            "source_family_id": "event_record_index", "source_locator_ref": "event:event-42",
            "expected_schema_id": "pm.storage_value.event_record_index.v2", "expected_schema_version": "2.0.0",
            "observed_schema_id": None, "observed_schema_version": None, "error_code": "schema_invalid",
            "raw_sha256": hash_value, "raw_custody_ref": "custody:raw", "custody_manifest_ref": "custody:manifest",
            "custody_manifest_sha256": hash_value, "byte_length": 128, "detected_at_utc": "2026-07-18T03:00:00Z",
            "risk_class": risk, "state": state, "retention_policy_ref": risk,
            "transition_receipts": receipts, "related_event_refs": ["event:q1"], "redaction_profile": "no_secrets",
        }
    resolved = quarantine(
        "Q-CRITICAL", "migrated",
        [transition("detected", "secured", "1"), transition("secured", "migrated", "2")],
    )
    purged = clone(resolved)
    purged["state"] = "purged"
    purged["transition_receipts"].append(transition("migrated", "purged", "3"))
    checks["l033_receipt_continuity_and_current_state_valid"] = not draft202012_schema_failures(
        resolved,
        quarantine_schema,
        path_label="self-test:l033-valid",
    ) and not quarantine_transition_context_failures(
        resolved,
        policy_elapsed=False,
        active_hold_count=1,
    )
    discontinuous = clone(resolved)
    discontinuous["transition_receipts"][1]["from_state"] = "detected"
    checks["l033_discontinuous_history_rejected"] = bool(
        quarantine_transition_context_failures(
            discontinuous,
            policy_elapsed=False,
            active_hold_count=1,
        )
    )
    wrong_first = clone(resolved)
    wrong_first["transition_receipts"][0]["from_state"] = "secured"
    checks["l033_first_receipt_must_start_at_detected"] = bool(
        quarantine_transition_context_failures(
            wrong_first,
            policy_elapsed=False,
            active_hold_count=1,
        )
    )
    wrong_final = clone(resolved)
    wrong_final["state"] = "restored"
    checks["l033_final_receipt_must_equal_current_state"] = bool(
        quarantine_transition_context_failures(
            wrong_final,
            policy_elapsed=False,
            active_hold_count=1,
        )
    )
    rewritten = clone(purged)
    rewritten["transition_receipts"][0]["reason"] = "rewritten-history"
    checks["l033_history_append_only_rewrite_rejected"] = bool(
        quarantine_transition_context_failures(
            rewritten,
            policy_elapsed=True,
            active_hold_count=0,
            prior_transition_receipts=resolved["transition_receipts"],
        )
    )
    checks["l033_purge_requires_elapsed_policy_and_no_hold"] = (
        not quarantine_transition_context_failures(
            purged,
            policy_elapsed=True,
            active_hold_count=0,
            prior_transition_receipts=resolved["transition_receipts"],
        )
        and bool(quarantine_transition_context_failures(purged, policy_elapsed=False, active_hold_count=0))
        and bool(quarantine_transition_context_failures(purged, policy_elapsed=True, active_hold_count=1))
    )
    critical_reset = quarantine(
        "Q-CRITICAL", "reset_to_default",
        [transition("detected", "secured", "1"), transition("secured", "reset_to_default", "2")],
    )
    checks["l033_critical_reset_rejected"] = bool(
        draft202012_schema_failures(
            critical_reset,
            quarantine_schema,
            path_label="self-test:l033-critical-reset",
        )
    )
    missing_custody = clone(resolved)
    missing_custody.pop("raw_custody_ref")
    checks["l033_missing_custody_rejected"] = bool(
        draft202012_schema_failures(
            missing_custody,
            quarantine_schema,
            path_label="self-test:l033-missing-custody",
        )
    )
    risk_policy_mismatch = clone(resolved)
    risk_policy_mismatch["retention_policy_ref"] = "Q-DERIVED"
    checks["l033_risk_policy_mismatch_rejected"] = bool(
        draft202012_schema_failures(
            risk_policy_mismatch,
            quarantine_schema,
            path_label="self-test:l033-risk-policy-mismatch",
        )
    )
    false_fence = clone(registry)
    next(row for row in false_fence["families"] if row.get("family_id") == "storage_quarantine_record")["restore_disposition"]["mutation_fence_on_unresolved"] = False
    checks["l033_false_unresolved_fence_rejected"] = any(
        failure.get("error") == "case_l_quarantine_unresolved_fence_not_fail_closed"
        for failure in storage_case_l_registry_failures(false_fence, path_label="self-test:l033-false-fence")
    )
    critical_cap = clone(registry)
    next(row for row in critical_cap["retention_policies"] if row.get("policy_id") == "Q-CRITICAL")["overflow_action"] = "evict_oldest"
    checks["l033_critical_cap_eviction_rejected"] = any(
        failure.get("error") == "case_l_quarantine_critical_cap_not_fail_closed"
        for failure in storage_case_l_registry_failures(critical_cap, path_label="self-test:l033-critical-cap")
    )
    checks.update(case_l_non_event_materialization_self_test_checks())
    return checks


def storage_value_registry_data_failures(
    registry: Any,
    *,
    path_label: str,
    required_launch_families: list[str] | None = None,
    required_mvp_families: list[str] | None = None,
) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    required_launch_families = required_launch_families or STORAGE_VALUE_REQUIRED_LAUNCH_FAMILIES
    required_mvp_families = required_mvp_families or STORAGE_VALUE_REQUIRED_MVP_FAMILIES
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
    critical_id_values = [value for value in critical_ids if isinstance(value, str)]
    if len(critical_id_values) != len(critical_ids):
        failures.append({"path": path_label, "error": "storage_value_registry_critical_ids_invalid"})
    duplicate_critical_ids = sorted(
        {family_id for family_id in critical_id_values if critical_id_values.count(family_id) > 1}
    )
    if duplicate_critical_ids:
        failures.append(
            {
                "path": path_label,
                "error": "storage_value_registry_duplicate_critical_family_id",
                "family_ids": duplicate_critical_ids,
            }
        )
    if set(critical_id_values) != set(required_launch_families):
        failures.append(
            {
                "path": path_label,
                "error": "storage_value_registry_critical_family_membership_mismatch",
                "expected": required_launch_families,
                "actual": critical_ids,
            }
        )

    mvp_ids = registry.get("mvp_required_family_ids", [])
    if not isinstance(mvp_ids, list):
        failures.append({"path": path_label, "error": "storage_value_registry_mvp_required_ids_invalid"})
        mvp_ids = []
    mvp_id_values = [value for value in mvp_ids if isinstance(value, str)]
    if len(mvp_id_values) != len(mvp_ids):
        failures.append({"path": path_label, "error": "storage_value_registry_mvp_required_ids_invalid"})
    duplicate_mvp_ids = sorted({family_id for family_id in mvp_id_values if mvp_id_values.count(family_id) > 1})
    if duplicate_mvp_ids:
        failures.append(
            {
                "path": path_label,
                "error": "storage_value_registry_duplicate_mvp_required_family_id",
                "family_ids": duplicate_mvp_ids,
            }
        )
    if set(mvp_id_values) != set(required_mvp_families):
        failures.append(
            {
                "path": path_label,
                "error": "storage_value_registry_mvp_required_family_membership_mismatch",
                "expected": required_mvp_families,
                "actual": mvp_ids,
            }
        )

    identity_contract = registry.get("event_record_identity_contract")
    if identity_contract != STORAGE_VALUE_EVENT_IDENTITY_CONTRACT:
        failures.append(
            {
                "path": path_label,
                "error": "storage_value_registry_event_identity_contract_mismatch",
                "expected": STORAGE_VALUE_EVENT_IDENTITY_CONTRACT,
                "actual": identity_contract,
            }
        )

    retention_policies = registry.get("retention_policies", [])
    if not isinstance(retention_policies, list):
        failures.append({"path": path_label, "error": "storage_value_registry_retention_policies_invalid"})
        retention_policies = []
    if len(retention_policies) != STORAGE_VALUE_REGISTRY_EXPECTED_RETENTION_POLICY_COUNT:
        failures.append(
            {
                "path": path_label,
                "error": "storage_value_registry_retention_policy_count_mismatch",
                "expected": STORAGE_VALUE_REGISTRY_EXPECTED_RETENTION_POLICY_COUNT,
                "actual": len(retention_policies),
            }
        )
    retention_by_id: dict[str, dict[str, Any]] = {}
    for index, retention_policy in enumerate(retention_policies, start=1):
        policy_path = f"{path_label}:retention_policies[{index}]"
        if not isinstance(retention_policy, dict):
            failures.append({"path": policy_path, "error": "storage_value_registry_retention_policy_not_object"})
            continue
        policy_id = str(retention_policy.get("policy_id", ""))
        if not policy_id:
            failures.append({"path": policy_path, "error": "storage_value_registry_retention_policy_id_missing"})
        elif policy_id in retention_by_id:
            failures.append(
                {
                    "path": policy_path,
                    "error": "storage_value_registry_duplicate_retention_policy_id",
                    "policy_id": policy_id,
                }
            )
        else:
            retention_by_id[policy_id] = retention_policy

    families = registry.get("families", [])
    if not isinstance(families, list) or not families:
        return failures + [{"path": path_label, "error": "storage_value_registry_families_missing_or_invalid"}]
    if len(families) != STORAGE_VALUE_REGISTRY_EXPECTED_FAMILY_COUNT:
        failures.append(
            {
                "path": path_label,
                "error": "storage_value_registry_family_count_mismatch",
                "expected": STORAGE_VALUE_REGISTRY_EXPECTED_FAMILY_COUNT,
                "actual": len(families),
            }
        )

    row_required_fields = [
        "family_id",
        "storage_kind",
        "status",
        "tier",
        "key_shape",
        "compatibility_key_shapes",
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
        "migration_disposition",
        "restore_disposition",
        "retention_compaction",
        "retention_policy_ref",
        "redaction_no_secret_rule",
        "legacy_canonical_crosswalk_status",
        "recovery_disposition",
    ]
    by_family: dict[str, dict[str, Any]] = {}
    canonical_key_owners: dict[str, str] = {}
    compatibility_key_owners: dict[str, str] = {}
    status_counts: dict[str, int] = {}
    tier_counts: dict[str, int] = {}
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

        status = str(family.get("status", ""))
        tier = str(family.get("tier", ""))
        status_counts[status] = status_counts.get(status, 0) + 1
        tier_counts[tier] = tier_counts.get(tier, 0) + 1

        for field in row_required_fields:
            if field not in family:
                failures.append({"path": row_path, "error": "storage_value_registry_family_field_missing", "field": field})

        canonical_keys = [part.strip() for part in str(family.get("key_shape", "")).split("|") if part.strip()]
        if not canonical_keys:
            failures.append({"path": row_path, "error": "storage_value_registry_canonical_key_missing"})
        for key_shape in canonical_keys:
            prior_owner = canonical_key_owners.get(key_shape)
            if prior_owner is not None:
                failures.append(
                    {
                        "path": row_path,
                        "error": "storage_value_registry_duplicate_canonical_key",
                        "key_shape": key_shape,
                        "family_id": family_id,
                        "prior_family_id": prior_owner,
                    }
                )
            else:
                canonical_key_owners[key_shape] = family_id

        compatibility_shapes = family.get("compatibility_key_shapes", [])
        if not isinstance(compatibility_shapes, list):
            failures.append({"path": row_path, "error": "storage_value_registry_compatibility_keys_invalid"})
            compatibility_shapes = []
        for raw_alias in compatibility_shapes:
            aliases = [part.strip() for part in str(raw_alias).split("|") if part.strip()]
            if not aliases:
                failures.append({"path": row_path, "error": "storage_value_registry_compatibility_key_empty"})
            for alias in aliases:
                prior_owner = compatibility_key_owners.get(alias)
                if prior_owner is not None:
                    failures.append(
                        {
                            "path": row_path,
                            "error": "storage_value_registry_duplicate_compatibility_key",
                            "key_shape": alias,
                            "family_id": family_id,
                            "prior_family_id": prior_owner,
                        }
                    )
                else:
                    compatibility_key_owners[alias] = family_id

        retention_policy_ref = str(family.get("retention_policy_ref", ""))
        if retention_policy_ref not in retention_by_id:
            failures.append(
                {
                    "path": row_path,
                    "error": "storage_value_registry_retention_policy_ref_unknown",
                    "family_id": family_id,
                    "retention_policy_ref": retention_policy_ref,
                }
            )

        for field in ["migration_disposition", "restore_disposition", "recovery_disposition"]:
            if not isinstance(family.get(field), dict):
                failures.append(
                    {
                        "path": row_path,
                        "error": "storage_value_registry_structured_disposition_missing",
                        "family_id": family_id,
                        "field": field,
                    }
                )

        migration_disposition = (
            family.get("migration_disposition", {}) if isinstance(family.get("migration_disposition"), dict) else {}
        )
        if compatibility_shapes and migration_disposition.get("compatibility_keys_read_only") is not True:
            failures.append(
                {
                    "path": row_path,
                    "error": "storage_value_registry_compatibility_key_not_read_only",
                    "family_id": family_id,
                }
            )

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
        optional_fields = family.get("optional_fields", [])
        nullable_fields = family.get("nullable_fields", [])
        if isinstance(required_fields, list) and isinstance(optional_fields, list) and isinstance(nullable_fields, list):
            unregistered_nullable = set(nullable_fields) - set(required_fields) - set(optional_fields)
            if unregistered_nullable:
                failures.append(
                    {
                        "path": row_path,
                        "error": "storage_value_registry_nullable_field_not_registered",
                        "family_id": family_id,
                        "fields": sorted(unregistered_nullable),
                    }
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
            if schema_required != required_fields:
                failures.append(
                    {
                        "path": row_path,
                        "error": "storage_value_registry_required_fields_schema_mismatch",
                        "family_id": family_id,
                        "expected": required_fields,
                        "actual": schema_required,
                    }
                )
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

    if status_counts != STORAGE_VALUE_REGISTRY_EXPECTED_STATUS_COUNTS:
        failures.append(
            {
                "path": path_label,
                "error": "storage_value_registry_status_counts_mismatch",
                "expected": STORAGE_VALUE_REGISTRY_EXPECTED_STATUS_COUNTS,
                "actual": status_counts,
            }
        )
    if tier_counts != STORAGE_VALUE_REGISTRY_EXPECTED_TIER_COUNTS:
        failures.append(
            {
                "path": path_label,
                "error": "storage_value_registry_tier_counts_mismatch",
                "expected": STORAGE_VALUE_REGISTRY_EXPECTED_TIER_COUNTS,
                "actual": tier_counts,
            }
        )

    for key_shape, alias_owner in compatibility_key_owners.items():
        canonical_owner = canonical_key_owners.get(key_shape)
        if canonical_owner is not None:
            failures.append(
                {
                    "path": path_label,
                    "error": "storage_value_registry_compatibility_key_collides_with_canonical",
                    "key_shape": key_shape,
                    "family_id": alias_owner,
                    "canonical_family_id": canonical_owner,
                }
            )

    for family_id, family in by_family.items():
        row_path = f"{path_label}:families/{family_id}"
        recovery_disposition = (
            family.get("recovery_disposition", {}) if isinstance(family.get("recovery_disposition"), dict) else {}
        )
        for source_family_id in recovery_disposition.get("source_family_ids", []):
            if source_family_id not in by_family:
                failures.append(
                    {
                        "path": row_path,
                        "error": "storage_value_registry_recovery_source_family_missing",
                        "family_id": family_id,
                        "source_family_id": source_family_id,
                    }
                )
        restore_disposition = (
            family.get("restore_disposition", {}) if isinstance(family.get("restore_disposition"), dict) else {}
        )
        transaction_family_id = restore_disposition.get("transaction_family_id")
        if transaction_family_id is not None and transaction_family_id not in by_family:
            failures.append(
                {
                    "path": row_path,
                    "error": "storage_value_registry_restore_transaction_family_missing",
                    "family_id": family_id,
                    "transaction_family_id": transaction_family_id,
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
        if family.get("tier") != "tier_0_launch_critical":
            failures.append(
                {
                    "path": path_label,
                    "error": "storage_value_registry_critical_family_tier_mismatch",
                    "family_id": family_id,
                    "expected": "tier_0_launch_critical",
                    "actual": family.get("tier"),
                }
            )

    for family_id in required_mvp_families:
        family = by_family.get(family_id)
        if not family:
            failures.append(
                {
                    "path": path_label,
                    "error": "storage_value_registry_mvp_required_family_missing",
                    "family_id": family_id,
                }
            )
            continue
        if family.get("status") != "materialized":
            failures.append(
                {
                    "path": path_label,
                    "error": "storage_value_registry_mvp_required_family_not_materialized",
                    "family_id": family_id,
                    "status": family.get("status"),
                }
            )
        expected_tier = "tier_0_launch_critical" if family_id in required_launch_families else "later_gui_or_feature_projection"
        if family.get("tier") != expected_tier:
            failures.append(
                {
                    "path": path_label,
                    "error": "storage_value_registry_mvp_required_family_tier_mismatch",
                    "family_id": family_id,
                    "expected": expected_tier,
                    "actual": family.get("tier"),
                }
            )

    for family_id, expected_key_shape in STORAGE_VALUE_REQUIRED_KEY_SHAPES.items():
        family = by_family.get(family_id)
        if not family:
            failures.append(
                {
                    "path": path_label,
                    "error": "storage_value_registry_semantic_family_missing",
                    "family_id": family_id,
                }
            )
            continue
        if family.get("key_shape") != expected_key_shape:
            failures.append(
                {
                    "path": path_label,
                    "error": "storage_value_registry_semantic_key_shape_mismatch",
                    "family_id": family_id,
                    "expected": expected_key_shape,
                    "actual": family.get("key_shape"),
                }
            )
        expected_storage_kind = STORAGE_VALUE_REQUIRED_STORAGE_KINDS[family_id]
        if family.get("storage_kind") != expected_storage_kind:
            failures.append(
                {
                    "path": path_label,
                    "error": "storage_value_registry_semantic_storage_kind_mismatch",
                    "family_id": family_id,
                    "expected": expected_storage_kind,
                    "actual": family.get("storage_kind"),
                }
            )
        expected_authority = STORAGE_VALUE_REQUIRED_RECOVERY_AUTHORITIES[family_id]
        recovery_disposition = (
            family.get("recovery_disposition", {}) if isinstance(family.get("recovery_disposition"), dict) else {}
        )
        if recovery_disposition.get("authority_class") != expected_authority:
            failures.append(
                {
                    "path": path_label,
                    "error": "storage_value_registry_semantic_recovery_authority_mismatch",
                    "family_id": family_id,
                    "expected": expected_authority,
                    "actual": recovery_disposition.get("authority_class"),
                }
            )

    try:
        shared_runtime_schema = read_json(SHARED_RUNTIME_CONTRACTS_SCHEMA_PATH)
        shared_runtime_defs = shared_runtime_schema["$defs"]
    except Exception as exc:  # noqa: BLE001
        failures.append(
            {
                "path": path_label,
                "error": "shared_runtime_storage_schema_authority_unavailable",
                "detail": str(exc),
            }
        )
        shared_runtime_defs = {}
    for family_id, expected in SHARED_RUNTIME_STORAGE_FAMILIES.items():
        family = by_family.get(family_id)
        row_path = f"{path_label}:families/{family_id}"
        if not family:
            failures.append(
                {
                    "path": row_path,
                    "error": "shared_runtime_storage_family_missing",
                }
            )
            continue
        for field_name, expected_value in expected.items():
            if family.get(field_name) != expected_value:
                failures.append(
                    {
                        "path": row_path,
                        "error": "shared_runtime_storage_family_owner_contract_mismatch",
                        "field": field_name,
                        "expected": expected_value,
                        "actual": family.get(field_name),
                    }
                )
        value_schema = family.get("value_schema")
        owner_definition = shared_runtime_defs.get(family_id)
        if isinstance(value_schema, dict) and isinstance(owner_definition, dict):
            inline_definition = {
                key: value
                for key, value in value_schema.items()
                if key not in {"$schema", "$id", "$defs"}
            }
            if inline_definition != owner_definition:
                failures.append(
                    {
                        "path": row_path,
                        "error": "shared_runtime_storage_inline_definition_drift",
                        "family_id": family_id,
                    }
                )
            expected_defs = {
                name: shared_runtime_defs.get(name)
                for name in SHARED_RUNTIME_STORAGE_PRIMITIVE_DEFS
            }
            if value_schema.get("$defs") != expected_defs:
                failures.append(
                    {
                        "path": row_path,
                        "error": "shared_runtime_storage_inline_primitive_defs_drift",
                        "family_id": family_id,
                    }
                )
        else:
            failures.append(
                {
                    "path": row_path,
                    "error": "shared_runtime_storage_inline_or_owner_definition_missing",
                    "family_id": family_id,
                }
            )
    normalized_family_ids = {
        "".join(character for character in family_id.casefold() if character.isalnum())
        for family_id in by_family
    }
    if "providerrequestpermit" in normalized_family_ids:
        failures.append(
            {
                "path": path_label,
                "error": "provider_request_permit_persisted_as_second_family",
            }
        )

    safe_point = by_family.get("safe_point_record", {})
    expected_safe_point_aliases = [
        "safe_point.sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}",
        "safe_point:<safe_point_id>",
    ]
    if safe_point.get("compatibility_key_shapes") != expected_safe_point_aliases:
        failures.append(
            {
                "path": path_label,
                "error": "storage_value_registry_safe_point_aliases_mismatch",
                "expected": expected_safe_point_aliases,
                "actual": safe_point.get("compatibility_key_shapes"),
            }
        )

    event_family_contracts = {
        "event_record_index": ("pm.storage_value.event_record_index.v2", "2.0.0", "RP-EVENT-INDEX-SOURCE"),
        "event_id_dedupe_index": (
            "pm.storage_value.event_id_dedupe_index.v1",
            "1.0.0",
            "RP-EVENT-IDENTITY-APPROOT",
        ),
        "event_idempotency_dedupe_index": (
            "pm.storage_value.event_idempotency_dedupe_index.v1",
            "1.0.0",
            "RP-EVENT-IDENTITY-APPROOT",
        ),
        "event_dedupe_checkpoint": (
            "pm.storage_value.event_dedupe_checkpoint.v1",
            "1.0.0",
            "RP-EVENT-IDENTITY-APPROOT",
        ),
    }
    for family_id, (expected_schema_id, expected_version, expected_retention) in event_family_contracts.items():
        family = by_family.get(family_id, {})
        if family.get("value_schema_id") != expected_schema_id or family.get("schema_version") != expected_version:
            failures.append(
                {
                    "path": path_label,
                    "error": "storage_value_registry_event_family_schema_mismatch",
                    "family_id": family_id,
                    "expected_schema_id": expected_schema_id,
                    "actual_schema_id": family.get("value_schema_id"),
                    "expected_schema_version": expected_version,
                    "actual_schema_version": family.get("schema_version"),
                }
            )
        if family.get("retention_policy_ref") != expected_retention:
            failures.append(
                {
                    "path": path_label,
                    "error": "storage_value_registry_event_family_retention_mismatch",
                    "family_id": family_id,
                    "expected": expected_retention,
                    "actual": family.get("retention_policy_ref"),
                }
            )
    failures.extend(storage_case_l_registry_failures(registry, path_label=path_label))
    return failures


def pnc019_event_index_consumer_failures() -> list[dict[str, Any]]:
    try:
        text = PNC019_CERTIFICATION_HARNESS_PATH.read_text(encoding="utf-8")
    except Exception as exc:  # noqa: BLE001
        return [{"path": rel(PNC019_CERTIFICATION_HARNESS_PATH), "error": "pnc019_event_index_consumer_unavailable", "detail": str(exc)}]
    start = text.find("    def append_event(")
    end = text.find("\n    def approved_plan_pack(", start)
    if start < 0 or end < 0:
        return [{"path": rel(PNC019_CERTIFICATION_HARNESS_PATH), "error": "pnc019_append_event_consumer_missing"}]
    body = text[start:end]
    failures: list[dict[str, Any]] = []
    for marker in [
        '"source_locator"', '"segment_generation"', '"segment_name"', '"byte_offset"',
        '"sequence_id": event["sequence_id"]', '"publication_locator"', '"manifest_generation"',
        '"recovery_epoch"', '"survivor_prefix_sha256"', '"checkpoint_ref"',
        '"compaction_translation_manifest_ref": None',
    ]:
        if marker not in body:
            failures.append({"path": rel(PNC019_CERTIFICATION_HARNESS_PATH), "error": "pnc019_generation_qualified_event_index_marker_missing", "marker": marker})
    for retired_marker in ['"segment_ref":']:
        if retired_marker in body:
            failures.append({"path": rel(PNC019_CERTIFICATION_HARNESS_PATH), "error": "pnc019_retired_event_index_locator_present", "marker": retired_marker})
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
            if schema.get("$id") != STORAGE_VALUE_REGISTRY_SCHEMA_URI:
                failures.append(
                    {
                        "path": rel(STORAGE_VALUE_REGISTRY_SCHEMA_PATH),
                        "error": "storage_value_registry_schema_uri_mismatch",
                        "expected": STORAGE_VALUE_REGISTRY_SCHEMA_URI,
                        "actual": schema.get("$id"),
                    }
                )
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
            schema_version = (
                properties.get("schema_version", {}) if isinstance(properties.get("schema_version"), dict) else {}
            )
            if schema_version.get("const") != STORAGE_VALUE_REGISTRY_SCHEMA_VERSION:
                failures.append(
                    {
                        "path": rel(STORAGE_VALUE_REGISTRY_SCHEMA_PATH),
                        "error": "storage_value_registry_schema_version_const_mismatch",
                        "expected": STORAGE_VALUE_REGISTRY_SCHEMA_VERSION,
                        "actual": schema_version.get("const"),
                    }
                )
            defs = schema.get("$defs", {}) if isinstance(schema.get("$defs"), dict) else {}
            family_def = defs.get("family", {}) if isinstance(defs.get("family"), dict) else {}
            required_family_fields = family_def.get("required", [])
            for field in [
                "compatibility_key_shapes",
                "migration_disposition",
                "restore_disposition",
                "retention_policy_ref",
                "recovery_disposition",
            ]:
                if field not in required_family_fields:
                    failures.append(
                        {
                            "path": rel(STORAGE_VALUE_REGISTRY_SCHEMA_PATH),
                            "error": "storage_value_registry_schema_structured_family_field_missing",
                            "field": field,
                        }
                    )
            for def_name in [
                "retention_policy",
                "recovery_disposition",
                "migration_disposition",
                "restore_disposition",
            ]:
                definition = defs.get(def_name, {}) if isinstance(defs.get(def_name), dict) else {}
                if definition.get("type") != "object" or definition.get("additionalProperties") is not False:
                    failures.append(
                        {
                            "path": rel(STORAGE_VALUE_REGISTRY_SCHEMA_PATH),
                            "error": "storage_value_registry_schema_structured_definition_not_closed",
                            "definition": def_name,
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
    failures.extend(pnc019_event_index_consumer_failures())
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

    failures.extend(
        pnc019_source_hash_failures(
            ROOT,
            receipt.get("source_hashes"),
            path_label=path_label,
        )
    )
    failures.extend(
        pnc019_event_authority_clearance_failures(
            ROOT,
            path_label=rel(EVENT_FAMILY_REGISTRY_PATH),
        )
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
            if not pnc019_certified and not report_effectively_opens_blocker(
                actual_report,
                blocker_id=str(row.get("blocker_id", "")),
                blocker_family=family,
            ):
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


def executable_blocker_closure_failures(
    actual_report: dict[str, Any],
    blockers: list[dict[str, Any]],
    *,
    pnc019_certified: bool,
) -> list[dict[str, Any]]:
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
            if not pnc019_certified and not report_effectively_opens_blocker(
                actual_report,
                blocker_id=blocker_id,
                blocker_family=family,
            ):
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
        "blocker_id": next(
            (
                blocker_id
                for blocker_id, blocker_family in PNC019_EXECUTABLE_BLOCKER_FAMILIES_BY_ID.items()
                if blocker_family == family
            ),
            f"FIXTURE-IRB-{index:03d}",
        ),
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
            "ordinary_product_worknodes_allowed": False,
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
        "ordinary_product_worknodes_allowed": True,
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
            "pnc019_certification_current": False,
            "expected_open_count": len(REQUIRED_FAMILIES),
            "expected_disabled_count": len(REQUIRED_FAMILIES),
            "expected_pnc019": True,
            "expected_buildability_gate_passed": False,
        },
        {
            "name": "one_blocker_closed",
            "statuses": {REQUIRED_FAMILIES[0]: "closed"},
            "node_hard_disabled": True,
            "pnc019_certification_current": False,
            "expected_open_count": len(REQUIRED_FAMILIES) - 1,
            "expected_disabled_count": len(REQUIRED_FAMILIES) - 1,
            "expected_pnc019": True,
            "expected_buildability_gate_passed": False,
        },
        {
            "name": "all_blockers_closed_pnc019_blocked",
            "statuses": {family: "closed" for family in REQUIRED_FAMILIES},
            "node_hard_disabled": False,
            "pnc019_certification_current": False,
            "expected_open_count": 2,
            "expected_disabled_count": 2,
            "expected_open_ids": ["IRB-005", "IRB-011"],
            "expected_disabled_families": ["runtime_lifecycle", "clean_room_harness"],
            "expected_pnc019": True,
            "expected_buildability_gate_passed": False,
        },
        {
            "name": "all_blockers_closed_pnc019_unblocked",
            "statuses": {family: "closed" for family in REQUIRED_FAMILIES},
            "node_hard_disabled": False,
            "pnc019_certification_current": True,
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
            "pnc019_certification_current": True,
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
            pnc019_certification_current=scenario["pnc019_certification_current"],
            hash_map=fixture_hashes,
            generated_at_utc="2026-07-05T00:00:00Z",
        )
        scenario_failures = gate_semantic_failures(
            actual_report=report,
            blockers=blockers,
            pnc019_certification_current=scenario["pnc019_certification_current"],
            current_hashes=fixture_hashes,
            path=f"self-test:{scenario['name']}",
        )
        disabled_reasons = report["approve_and_build_gate"]["disabled_reasons"]
        hard_reasons = report["approve_and_build_gate"]["hard_disabled_reasons"]
        open_blocker_ids = [row.get("blocker_id") for row in report["remaining_open_blockers"]]
        source_status_by_id = {str(row.get("blocker_id")): str(row.get("status")) for row in blockers}
        effectively_reopened_rows = [
            row
            for row in report["remaining_open_blockers"]
            if source_status_by_id.get(str(row.get("blocker_id"))) in CLOSED_BLOCKER_STATUSES
        ]
        disabled_families = [reason.get("blocker_family") for reason in disabled_reasons]
        node_readiness = report["node_readiness"]
        checks = {
            "open_blocker_count": report["open_blocker_count"] == scenario["expected_open_count"],
            "disabled_reason_count": len(disabled_reasons) == scenario["expected_disabled_count"],
            "effective_open_blocker_ids": open_blocker_ids == scenario.get("expected_open_ids", open_blocker_ids),
            "effective_reopened_blocker_projection": all(
                row.get("status") == "open"
                and row.get("effective_reopen_reason") == "pnc019_certification_not_current"
                and "closed_at_utc" not in row
                for row in effectively_reopened_rows
            ),
            "effective_disabled_families": disabled_families
            == scenario.get("expected_disabled_families", disabled_families),
            "pnc019_hard_reason": any(reason.get("plan_unit_id") == "PNC-019" for reason in hard_reasons)
            == scenario["expected_pnc019"],
            "graph_hard_reason": any(
                reason.get("code") == "hard_disabled.node_readiness_build_order" for reason in hard_reasons
            )
            == scenario.get("expected_graph_reason", False),
            "buildability_gate_passed": report["buildability_gate_passed"]
            == scenario["expected_buildability_gate_passed"],
            "pnc019_fail_closed_projection": scenario["pnc019_certification_current"]
            or (
                node_readiness.get("status") == "blocked_runtime_certification_incomplete"
                and node_readiness.get("executable_lifecycle_certification_complete") is False
                and node_readiness.get("runtime_enabled") is False
                and node_readiness.get("ordinary_product_worknodes_allowed") is False
                and node_readiness.get("runtime_blocked_by_ref") == "PNC-019"
                and node_readiness.get("hard_disabled") is True
            ),
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
                "open_blocker_ids": open_blocker_ids,
                "disabled_reason_count": len(disabled_reasons),
                "disabled_families": disabled_families,
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
        "scope_kind": "project",
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
    missing_scope_kind_record = dict(base_event_record)
    missing_scope_kind_record.pop("scope_kind")
    invalid_scope_kind_record = dict(base_event_record)
    invalid_scope_kind_record["scope_kind"] = "global"
    application_scope_record = dict(base_event_record)
    application_scope_record["scope_kind"] = "application"
    application_scope_record["project_id"] = None
    application_with_project_record = dict(application_scope_record)
    application_with_project_record["project_id"] = "fake-application-project"
    project_without_project_record = dict(base_event_record)
    project_without_project_record["project_id"] = None
    invalid_redaction_record = dict(base_event_record)
    invalid_redaction_record["redaction_profile"] = "raw"
    invalid_replay_record = dict(base_event_record)
    invalid_replay_record["replay_policy"] = "timestamp_order"
    compatibility_v1_record = dict(base_event_record)
    compatibility_v1_record.pop("scope_kind")
    compatibility_v1_record["schema_version"] = EVENT_RECORD_COMPATIBILITY_SCHEMA_VERSION
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
        "missing_scope_kind_rejected": any(
            failure.get("field") == "scope_kind"
            for failure in event_record_instance_failures(
                missing_scope_kind_record,
                path_label="self-test:missing_scope_kind",
            )
        ),
        "scope_kind_closed_enum_rejected": any(
            failure.get("error") == "event_record_scope_kind_not_closed_enum"
            for failure in event_record_instance_failures(
                invalid_scope_kind_record,
                path_label="self-test:invalid_scope_kind",
            )
        ),
        "valid_application_scope": not event_record_instance_failures(
            application_scope_record,
            path_label="self-test:valid_application_scope",
        ),
        "application_scope_project_id_rejected": any(
            failure.get("error") == "event_record_application_scope_requires_null_project_id"
            for failure in event_record_instance_failures(
                application_with_project_record,
                path_label="self-test:application_with_project",
            )
        ),
        "project_scope_null_project_id_rejected": any(
            failure.get("error") == "event_record_project_scope_requires_non_empty_project_id"
            for failure in event_record_instance_failures(
                project_without_project_record,
                path_label="self-test:project_without_project",
            )
        ),
        "redaction_profile_closed_enum_rejected": any(
            failure.get("field") == "redaction_profile"
            for failure in event_record_instance_failures(
                invalid_redaction_record,
                path_label="self-test:invalid_redaction_profile",
            )
        ),
        "replay_policy_closed_enum_rejected": any(
            failure.get("field") == "replay_policy"
            for failure in event_record_instance_failures(
                invalid_replay_record,
                path_label="self-test:invalid_replay_policy",
            )
        ),
        "v1_compatibility_reader_accepts_frozen_shape": not event_record_v1_compatibility_instance_failures(
            compatibility_v1_record,
            path_label="self-test:v1_compatibility_reader",
        ),
        "v1_shape_rejected_by_current_writer": any(
            failure.get("error") in {
                "event_record_missing_required_field",
                "event_record_schema_version_mismatch",
            }
            for failure in event_record_instance_failures(
                compatibility_v1_record,
                path_label="self-test:v1_rejected_by_current_writer",
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
    storage_registry_fixture = read_json(STORAGE_VALUE_REGISTRY_PATH)

    def clone_storage_registry_fixture() -> dict[str, Any]:
        return json.loads(json.dumps(storage_registry_fixture))

    def storage_fixture_family(fixture: dict[str, Any], family_id: str) -> dict[str, Any]:
        return next(row for row in fixture["families"] if row.get("family_id") == family_id)

    def defer_storage_fixture_family(fixture: dict[str, Any], family_id: str) -> None:
        family = storage_fixture_family(fixture, family_id)
        family["status"] = "deferred_not_build_blocking"
        family["deferred_owner"] = "Plans/storage-plan.md"
        family["deferred_reason"] = "self-test deferred"
        family["reopen_condition"] = "self-test reopen"

    missing_schema_version_fixture = clone_storage_registry_fixture()
    missing_schema_version_family = storage_fixture_family(missing_schema_version_fixture, "approved_plan_pack")
    missing_schema_version_family["required_fields"].remove("schema_version")
    missing_schema_version_family["value_schema"]["required"].remove("schema_version")

    secret_field_fixture = clone_storage_registry_fixture()
    secret_field_family = storage_fixture_family(secret_field_fixture, "approved_plan_pack")
    secret_field_family["required_fields"].append("api_key")
    secret_field_family["value_schema"]["required"].append("api_key")
    secret_field_family["value_schema"]["properties"]["api_key"] = {"type": "string"}

    family_count_fixture = clone_storage_registry_fixture()
    family_count_fixture["families"] = [
        row for row in family_count_fixture["families"] if row.get("family_id") != "permission_snapshot_record"
    ]

    critical_membership_fixture = clone_storage_registry_fixture()
    critical_membership_fixture["critical_family_ids"].remove("safe_point_restore_transaction")

    mvp_membership_fixture = clone_storage_registry_fixture()
    mvp_membership_fixture["mvp_required_family_ids"].remove("storage_deletion_record")

    reordered_membership_fixture = clone_storage_registry_fixture()
    reordered_membership_fixture["critical_family_ids"].reverse()
    reordered_membership_fixture["mvp_required_family_ids"].reverse()

    critical_materialization_fixture = clone_storage_registry_fixture()
    defer_storage_fixture_family(critical_materialization_fixture, "approved_plan_pack")

    critical_tier_fixture = clone_storage_registry_fixture()
    storage_fixture_family(critical_tier_fixture, "approved_plan_pack")["tier"] = "later_gui_or_feature_projection"

    duplicate_canonical_key_fixture = clone_storage_registry_fixture()
    storage_fixture_family(duplicate_canonical_key_fixture, "plan_compile_run")["key_shape"] = (
        storage_fixture_family(duplicate_canonical_key_fixture, "approved_plan_pack")["key_shape"]
    )

    alias_collision_fixture = clone_storage_registry_fixture()
    storage_fixture_family(alias_collision_fixture, "editor_workspace_state")["compatibility_key_shapes"].append(
        storage_fixture_family(alias_collision_fixture, "approved_plan_pack")["key_shape"]
    )

    duplicate_alias_fixture = clone_storage_registry_fixture()
    safe_point_aliases = storage_fixture_family(duplicate_alias_fixture, "safe_point_record")[
        "compatibility_key_shapes"
    ]
    safe_point_aliases.append(safe_point_aliases[0])

    unknown_retention_fixture = clone_storage_registry_fixture()
    storage_fixture_family(unknown_retention_fixture, "terminal_workspace_state")["retention_policy_ref"] = (
        "RP-NOT-REGISTERED"
    )

    unstructured_retention_fixture = clone_storage_registry_fixture()
    unstructured_retention_fixture["retention_policies"][0]["additional_cardinality_limits"] = (
        "not-a-structured-array"
    )

    unstructured_recovery_fixture = clone_storage_registry_fixture()
    storage_fixture_family(unstructured_recovery_fixture, "permission_snapshot_record")["recovery_disposition"] = (
        "rebuild somehow"
    )

    collapsed_restore_keys_fixture = clone_storage_registry_fixture()
    safe_point_key = STORAGE_VALUE_REQUIRED_KEY_SHAPES["safe_point_record"]
    storage_fixture_family(collapsed_restore_keys_fixture, "safe_point_restore_transaction")["key_shape"] = safe_point_key
    storage_fixture_family(collapsed_restore_keys_fixture, "restore_point_record")["key_shape"] = safe_point_key

    event_index_v1_fixture = clone_storage_registry_fixture()
    event_index_v1 = storage_fixture_family(event_index_v1_fixture, "event_record_index")
    event_index_v1["value_schema_id"] = "pm.storage_value.event_record_index.v1"
    event_index_v1["schema_version"] = "1.0.0"

    missing_dedupe_checkpoint_fixture = clone_storage_registry_fixture()
    missing_dedupe_checkpoint_fixture["families"] = [
        row
        for row in missing_dedupe_checkpoint_fixture["families"]
        if row.get("family_id") != "event_dedupe_checkpoint"
    ]

    operational_family_checks: dict[str, bool] = {}
    for family_id in [
        "retention_hold_record",
        "recovery_anchor_record",
        "storage_maintenance_operation",
        "storage_quarantine_record",
        "storage_deletion_record",
    ]:
        fixture = clone_storage_registry_fixture()
        defer_storage_fixture_family(fixture, family_id)
        operational_family_checks[family_id] = any(
            failure.get("error") == "storage_value_registry_mvp_required_family_not_materialized"
            and failure.get("family_id") == family_id
            for failure in storage_value_registry_data_failures(
                fixture,
                path_label=f"self-test:operational_family_deferred:{family_id}",
            )
        )
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
                critical_materialization_fixture,
                path_label="self-test:required_family_deferred",
            )
        ),
        "family_count_rejected": any(
            failure.get("error") == "storage_value_registry_family_count_mismatch"
            for failure in storage_value_registry_data_failures(
                family_count_fixture,
                path_label="self-test:family_count",
            )
        ),
        "critical_membership_rejected": any(
            failure.get("error") == "storage_value_registry_critical_family_membership_mismatch"
            for failure in storage_value_registry_data_failures(
                critical_membership_fixture,
                path_label="self-test:critical_membership",
            )
        ),
        "mvp_membership_rejected": any(
            failure.get("error") == "storage_value_registry_mvp_required_family_membership_mismatch"
            for failure in storage_value_registry_data_failures(
                mvp_membership_fixture,
                path_label="self-test:mvp_membership",
            )
        ),
        "membership_is_order_independent": not storage_value_registry_data_failures(
            reordered_membership_fixture,
            path_label="self-test:reordered_membership",
        ),
        "critical_tier_rejected": any(
            failure.get("error") == "storage_value_registry_critical_family_tier_mismatch"
            for failure in storage_value_registry_data_failures(
                critical_tier_fixture,
                path_label="self-test:critical_tier",
            )
        ),
        "duplicate_canonical_key_rejected": any(
            failure.get("error") == "storage_value_registry_duplicate_canonical_key"
            for failure in storage_value_registry_data_failures(
                duplicate_canonical_key_fixture,
                path_label="self-test:duplicate_canonical_key",
            )
        ),
        "alias_canonical_collision_rejected": any(
            failure.get("error") == "storage_value_registry_compatibility_key_collides_with_canonical"
            for failure in storage_value_registry_data_failures(
                alias_collision_fixture,
                path_label="self-test:alias_collision",
            )
        ),
        "duplicate_compatibility_alias_rejected": any(
            failure.get("error") == "storage_value_registry_duplicate_compatibility_key"
            for failure in storage_value_registry_data_failures(
                duplicate_alias_fixture,
                path_label="self-test:duplicate_compatibility_alias",
            )
        ),
        "unknown_retention_policy_rejected": any(
            failure.get("error") == "storage_value_registry_retention_policy_ref_unknown"
            for failure in storage_value_registry_data_failures(
                unknown_retention_fixture,
                path_label="self-test:unknown_retention_policy",
            )
        ),
        "unstructured_retention_policy_rejected": any(
            failure.get("keyword") == "type"
            for failure in draft202012_schema_failures(
                unstructured_retention_fixture,
                read_json(STORAGE_VALUE_REGISTRY_SCHEMA_PATH),
                path_label="self-test:unstructured_retention_policy",
            )
        ),
        "unstructured_recovery_rejected": any(
            failure.get("error") == "storage_value_registry_structured_disposition_missing"
            and failure.get("field") == "recovery_disposition"
            for failure in storage_value_registry_data_failures(
                unstructured_recovery_fixture,
                path_label="self-test:unstructured_recovery",
            )
        ),
        "safe_point_restore_keys_remain_distinct": {
            failure.get("family_id")
            for failure in storage_value_registry_data_failures(
                collapsed_restore_keys_fixture,
                path_label="self-test:collapsed_restore_keys",
            )
            if failure.get("error") == "storage_value_registry_semantic_key_shape_mismatch"
        }
        == {"safe_point_restore_transaction", "restore_point_record"},
        "event_record_index_v1_rejected": any(
            failure.get("error") == "storage_value_registry_event_family_schema_mismatch"
            and failure.get("family_id") == "event_record_index"
            for failure in storage_value_registry_data_failures(
                event_index_v1_fixture,
                path_label="self-test:event_record_index_v1",
            )
        ),
        "missing_dedupe_checkpoint_rejected": any(
            failure.get("error") == "storage_value_registry_semantic_family_missing"
            and failure.get("family_id") == "event_dedupe_checkpoint"
            for failure in storage_value_registry_data_failures(
                missing_dedupe_checkpoint_fixture,
                path_label="self-test:missing_dedupe_checkpoint",
            )
        ),
        "operational_categories_required": all(operational_family_checks.values()),
    }
    if not all(storage_registry_checks.values()):
        failures.append(
            {
                "scenario": "storage_value_registry",
                "checks": storage_registry_checks,
            }
        )
    case_l_verification_checks = case_l_verification_self_test_checks()
    if not all(case_l_verification_checks.values()):
        failures.append(
            {
                "scenario": "case_l_verification_integration",
                "checks": case_l_verification_checks,
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
        "case_l_verification_checks": case_l_verification_checks,
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
                pnc019_certification_current=pnc019_certified,
                current_hashes=source_hashes(),
                path=rel(REPORT_PATH),
            )
        )
        failures.extend(pnc019_bootstrap_authority_failures(actual_report))
        failures.extend(event_record_contract_failures(actual_report, pnc019_certified=pnc019_certified))
        failures.extend(storage_value_registry_contract_failures(actual_report, pnc019_certified=pnc019_certified))
        failures.extend(case_l_non_event_materialization_failures())
        failures.extend(non_executable_closure_evidence_failures(actual_report, blockers, pnc019_certified=pnc019_certified))
        failures.extend(execution_unit_context_contract_failures(actual_report, pnc019_certified=pnc019_certified))
        failures.extend(
            executable_blocker_closure_failures(
                actual_report,
                blockers,
                pnc019_certified=pnc019_certified,
            )
        )

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


def cmd_validate_case_l(args: argparse.Namespace) -> int:
    failures = case_l_non_event_materialization_failures()
    fixture_counts = {"positive_cases": 0, "negative_cases": 0}
    try:
        _fixture_failures, fixture_counts = case_l_storage_contract_fixture_results(
            read_json(STORAGE_RECOVERY_CONTRACTS_SCHEMA_PATH)
        )
    except Exception:
        pass
    report = {
        "schema_id": "pm.implementation_readiness.case_l_non_event_validation_report.v1",
        "generated_at_utc": utc_now(),
        "status": "pass" if not failures else "fail",
        "failures": failures,
        "fixture_counts": fixture_counts,
        "event_authority_boundary": {
            "registered_kernel_rows": EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT,
            "quarantined_row_count": EVENT_FAMILY_QUARANTINED_ROW_COUNT,
            "denominator_status": EVENT_FAMILY_DENOMINATOR_STATUS,
            "bulk_registration_allowed": EVENT_FAMILY_BULK_REGISTRATION_ALLOWED,
            "evidence_currentness": EVENT_FAMILY_EVIDENCE_CURRENTNESS,
            "evidence_refs": EVENT_FAMILY_EVIDENCE_REFS,
            "complete_denominator_known": False,
            "contract_depth_complete": False,
            "disposition": "excluded_from_this_non_event_pass_and_still_fail_closed",
        },
        "claim_boundary": "Static non-event materialization validation only; not runtime, certification, buildability, governance, or Case L closure.",
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["status"] == "pass" else 1


def main() -> int:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("generate", help="Regenerate buildability_gate_report.json from registry inputs.").set_defaults(func=cmd_generate)
    subparsers.add_parser("validate", help="Validate readiness artifacts without asserting implementation buildability.").set_defaults(func=cmd_validate)
    subparsers.add_parser("self-test", help="Run in-memory fixture checks for blocker closure gate semantics.").set_defaults(func=cmd_self_test)
    subparsers.add_parser("validate-case-l", help="Validate approved Case L non-event materialization without claiming buildability.").set_defaults(func=cmd_validate_case_l)
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
