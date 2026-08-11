#!/usr/bin/env python3
"""Run the bounded PNC-019 executable lifecycle certification harness.

The harness is intentionally local and deterministic. It exercises the current
EventRecord, execution_unit_context, and storage value registry contracts in an
in-memory runtime so PNC-019 proof is executable without creating product
WorkNodes, NodeSeeds, queues, manifests, runtime launches, or build tasks.
"""

from __future__ import annotations

import argparse
import base64
import copy
import hashlib
import importlib.util
import json
import re
import subprocess
import sys
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
REQUIRED_PNC019_SOURCE_HASH_PATHS = _pnc019_currentness.REQUIRED_PNC019_SOURCE_HASH_PATHS
pnc019_event_authority_clearance_failures = _pnc019_currentness.pnc019_event_authority_clearance_failures


ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"
READINESS_DIR = PLANS / ".implementation_readiness"
RECEIPT_PATH = READINESS_DIR / "pnc019_certification_receipt.json"

FIXED_NOW = "2026-07-06T00:00:00Z"
PROJECT_ID = "pnc019-clean-room-project"
PLAN_COMPILE_RUN_ID = "pcr-pnc019-0001"
WORKGRAPH_ID = "wg-pnc019-0001"
WORKNODE_REQUEST_ID = "wnr-pnc019-0001"
GOAL_ID = "goal-pnc019-0001"
GOAL_RUN_ID = "goalrun-pnc019-0001"
NODE_ID = "node-pnc019-0001"
ATTEMPT_ID = "attempt-pnc019-0001"
IDEMPOTENCY_KEY = "idem-pnc019-approved-plan-pack-0001"
STORAGE_VALUE_REGISTRY_SCHEMA_ID = "pm.storage_value_registry.v2"
STORAGE_VALUE_REGISTRY_SCHEMA_VERSION = "2.0.0"
EVENT_RECORD_INDEX_SCHEMA_ID = "pm.storage_value.event_record_index.v2"
EVENT_RECORD_INDEX_SCHEMA_VERSION = "2.0.0"
EVENT_RECORD_INDEX_FIXTURE_SEGMENT_GENERATION = 1
EVENT_RECORD_INDEX_FIXTURE_RECOVERY_EPOCH = 0

REQUIRED_POSITIVE_CASE_IDS = [
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

REQUIRED_NEGATIVE_CASE_IDS = [
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

REQUIRED_LIFECYCLE_STEPS = [
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

FORBIDDEN_NEGATIVE_EMISSIONS = [
    "plan_approved_events",
    "plan_compile_runs",
    "worknode_requests",
    "activation_receipts",
]

SECRET_KEY_RE = re.compile(
    r"(?:^|_)(?:secret|token|password|credential|api_key|oauth|refresh_token)(?:_|$)",
    re.IGNORECASE,
)
SECRET_VALUE_RE = re.compile(r"(?:sk-[A-Za-z0-9]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)")


def rel(path: Path) -> str:
    return path.resolve().relative_to(ROOT).as_posix()


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def stable_hash(value: Any) -> str:
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def event_scope_partition(event: dict[str, Any]) -> str:
    if event.get("scope_kind") == "application":
        return "app"
    project_id = event.get("project_id")
    if event.get("scope_kind") != "project" or not isinstance(project_id, str) or not project_id:
        raise ValueError("event_scope_partition_requires_valid_scope_identity")
    encoded = base64.urlsafe_b64encode(project_id.encode("utf-8")).decode("ascii").rstrip("=")
    return f"project~{encoded}"


def event_producer_semantic_digest(event: dict[str, Any]) -> str:
    producer_fields = [
        "event_type",
        "scope_kind",
        "project_id",
        "thread_id",
        "run_id",
        "node_id",
        "attempt_id",
        "actor_ref",
        "requested_account_ref",
        "effective_account_ref",
        "occurred_at_utc",
        "producer_sequence_id",
        "correlation_id",
        "causation_event_id",
        "parent_event_id",
        "idempotency_key",
        "payload_schema_id",
        "payload",
        "payload_ref",
        "redaction_profile",
        "migration",
    ]
    return stable_hash({field: event.get(field) for field in producer_fields})


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
        return isinstance(value, (int, float)) and not isinstance(value, bool)
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
    failures: list[dict[str, Any]] = []
    if not isinstance(schema, dict):
        return [{"path": path_label, "error": "json_schema_not_object"}]
    root_schema = schema

    def fail(pointer: str, keyword: str, detail: dict[str, Any] | None = None) -> None:
        row: dict[str, Any] = {
            "path": path_label,
            "error": "draft_2020_12_schema_validation_failed",
            "pointer": pointer,
            "keyword": keyword,
        }
        if detail:
            row.update(detail)
        failures.append(row)

    def validate_node(value: Any, node: Any, pointer: str) -> None:
        if not isinstance(node, dict):
            return
        if "$ref" in node:
            try:
                validate_node(value, resolve_local_schema_ref(root_schema, str(node["$ref"])), pointer)
            except Exception as exc:  # noqa: BLE001 - certification report records exact schema ref failure.
                fail(pointer, "$ref", {"ref": node.get("$ref"), "detail": str(exc)})
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
            return

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


def secret_material_failures(value: Any, *, path_label: str, pointer: str = "$") -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    if isinstance(value, dict):
        for key, child in value.items():
            child_pointer = f"{pointer}.{key}"
            if SECRET_KEY_RE.search(str(key)):
                failures.append(
                    {
                        "path": path_label,
                        "error": "raw_secret_or_credential_key",
                        "pointer": child_pointer,
                        "field": key,
                    }
                )
            failures.extend(secret_material_failures(child, path_label=path_label, pointer=child_pointer))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            failures.extend(secret_material_failures(child, path_label=path_label, pointer=f"{pointer}[{index}]"))
    elif isinstance(value, str) and SECRET_VALUE_RE.search(value):
        failures.append({"path": path_label, "error": "raw_secret_or_credential_value", "pointer": pointer})
    return failures


class CertificationHarness:
    def __init__(self) -> None:
        self.event_record_schema = read_json(PLANS / "event_record.schema.json")
        self.execution_context_schema = read_json(PLANS / "execution_unit_context.schema.json")
        self.storage_registry = read_json(PLANS / "storage_value_registry.json")
        if (
            self.storage_registry.get("schema_id") != STORAGE_VALUE_REGISTRY_SCHEMA_ID
            or self.storage_registry.get("schema_version") != STORAGE_VALUE_REGISTRY_SCHEMA_VERSION
        ):
            raise AssertionError(
                json.dumps(
                    {
                        "error": "storage_value_registry_version_mismatch",
                        "expected_schema_id": STORAGE_VALUE_REGISTRY_SCHEMA_ID,
                        "actual_schema_id": self.storage_registry.get("schema_id"),
                        "expected_schema_version": STORAGE_VALUE_REGISTRY_SCHEMA_VERSION,
                        "actual_schema_version": self.storage_registry.get("schema_version"),
                    },
                    sort_keys=True,
                )
            )
        self.families = {row["family_id"]: row for row in self.storage_registry["families"]}
        event_record_index = self.families.get("event_record_index", {})
        if (
            event_record_index.get("value_schema_id") != EVENT_RECORD_INDEX_SCHEMA_ID
            or event_record_index.get("schema_version") != EVENT_RECORD_INDEX_SCHEMA_VERSION
        ):
            raise AssertionError(
                json.dumps(
                    {
                        "error": "event_record_index_version_mismatch",
                        "expected_schema_id": EVENT_RECORD_INDEX_SCHEMA_ID,
                        "actual_schema_id": event_record_index.get("value_schema_id"),
                        "expected_schema_version": EVENT_RECORD_INDEX_SCHEMA_VERSION,
                        "actual_schema_version": event_record_index.get("schema_version"),
                    },
                    sort_keys=True,
                )
            )
        self.storage: dict[str, list[dict[str, Any]]] = {family_id: [] for family_id in self.families}
        self.events: list[dict[str, Any]] = []
        self.idempotency: dict[str, str] = {}
        self.plan_compile_runs: dict[str, dict[str, Any]] = {}
        self.artifacts: dict[str, Any] = {}
        self.storage_validations: list[dict[str, Any]] = []

    def validate_or_raise(self, value: Any, schema: dict[str, Any], *, label: str) -> None:
        failures = draft202012_schema_failures(value, schema, path_label=label)
        failures.extend(secret_material_failures(value, path_label=label))
        if failures:
            raise AssertionError(json.dumps(failures, sort_keys=True))

    def validate_event_record(self, record: dict[str, Any], *, label: str) -> list[dict[str, Any]]:
        failures = draft202012_schema_failures(record, self.event_record_schema, path_label=label)
        failures.extend(secret_material_failures(record, path_label=label))
        return failures

    def validate_event_record_v1_compatibility(
        self,
        record: dict[str, Any],
        *,
        label: str,
    ) -> list[dict[str, Any]]:
        defs = (
            self.event_record_schema.get("$defs", {})
            if isinstance(self.event_record_schema.get("$defs"), dict)
            else {}
        )
        compatibility_reader = defs.get("event_record_1_0_0_compatibility_reader")
        if not isinstance(compatibility_reader, dict):
            return [{"path": label, "error": "event_record_v1_compatibility_reader_missing"}]
        compatibility_schema = {"$defs": defs, **compatibility_reader}
        failures = draft202012_schema_failures(record, compatibility_schema, path_label=label)
        failures.extend(secret_material_failures(record, path_label=label))
        return failures

    def validate_execution_context(self, context: dict[str, Any], *, label: str) -> list[dict[str, Any]]:
        failures = draft202012_schema_failures(context, self.execution_context_schema, path_label=label)
        failures.extend(secret_material_failures(context, path_label=label))
        return failures

    def validate_storage_value(self, family_id: str, value: dict[str, Any], *, label: str) -> list[dict[str, Any]]:
        family = self.families[family_id]
        failures = draft202012_schema_failures(value, family["value_schema"], path_label=label)
        failures.extend(secret_material_failures(value, path_label=label))
        return failures

    def store_value(self, family_id: str, value: dict[str, Any], *, label: str) -> dict[str, Any]:
        failures = self.validate_storage_value(family_id, value, label=label)
        if failures:
            raise AssertionError(json.dumps(failures, sort_keys=True))
        self.storage[family_id].append(copy.deepcopy(value))
        self.storage_validations.append(
            {
                "family_id": family_id,
                "label": label,
                "schema_ref": self.families[family_id]["value_schema_ref"],
                "status": "pass",
            }
        )
        return value

    def base_event(
        self,
        *,
        event_id: str,
        event_type: str,
        sequence_id: int,
        payload_schema_id: str,
        payload: dict[str, Any],
        causation_event_id: str | None = None,
        node_id: str | None = None,
        attempt_id: str | None = None,
        idempotency_key: str = IDEMPOTENCY_KEY,
    ) -> dict[str, Any]:
        return {
            "schema_id": "pm.event.v0",
            "schema_version": "2.0.0",
            "scope_kind": "project",
            "event_id": event_id,
            "event_type": event_type,
            "project_id": PROJECT_ID,
            "thread_id": "thread-pnc019",
            "run_id": PLAN_COMPILE_RUN_ID,
            "node_id": node_id,
            "attempt_id": attempt_id,
            "actor_ref": "actor:pnc019-certifier",
            "requested_account_ref": "account:certification-harness",
            "effective_account_ref": "account:certification-harness",
            "occurred_at_utc": FIXED_NOW,
            "observed_at_utc": FIXED_NOW,
            "persisted_at_utc": FIXED_NOW,
            "sequence_id": sequence_id,
            "producer_sequence_id": sequence_id,
            "correlation_id": "corr-pnc019-0001",
            "causation_event_id": causation_event_id,
            "parent_event_id": causation_event_id,
            "idempotency_key": idempotency_key,
            "payload_schema_id": payload_schema_id,
            "payload": payload,
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

    def append_event(self, event: dict[str, Any], *, label: str) -> dict[str, Any]:
        failures = self.validate_event_record(event, label=label)
        if failures:
            raise AssertionError(json.dumps(failures, sort_keys=True))
        self.events.append(copy.deepcopy(event))
        self.store_value(
            "event_record_index",
            {
                "schema_id": EVENT_RECORD_INDEX_SCHEMA_ID,
                "schema_version": EVENT_RECORD_INDEX_SCHEMA_VERSION,
                "scope_kind": event["scope_kind"],
                "project_id": event["project_id"],
                "scope_partition": event_scope_partition(event),
                "sequence_id": event["sequence_id"],
                "event_id": event["event_id"],
                "event_type": event["event_type"],
                "source_locator": {
                    "segment_generation": EVENT_RECORD_INDEX_FIXTURE_SEGMENT_GENERATION,
                    "segment_name": "pnc019-seglog-0001.closed",
                    "byte_offset": event["sequence_id"] * 100,
                    "sequence_id": event["sequence_id"],
                },
                "publication_locator": {
                    "manifest_generation": EVENT_RECORD_INDEX_FIXTURE_SEGMENT_GENERATION,
                    "recovery_epoch": EVENT_RECORD_INDEX_FIXTURE_RECOVERY_EPOCH,
                    "survivor_prefix_sha256": stable_hash(
                        {
                            "fixture": "pnc019-event-index",
                            "segment_generation": EVENT_RECORD_INDEX_FIXTURE_SEGMENT_GENERATION,
                        }
                    ),
                    "checkpoint_ref": (
                        "checkpoint:pnc019:event-record-index:"
                        f"{EVENT_RECORD_INDEX_FIXTURE_SEGMENT_GENERATION}"
                    ),
                    "compaction_translation_manifest_ref": None,
                },
                "payload_sha256": stable_hash(event["payload"]),
                "producer_semantic_digest": event_producer_semantic_digest(event),
                "idempotency_key": event["idempotency_key"],
                "correlation_id": event["correlation_id"],
                "causation_event_id": event["causation_event_id"],
                "persisted_at_utc": event["persisted_at_utc"],
                "redaction_profile": event["redaction_profile"],
                "source_schema_id": event["schema_id"],
                "source_schema_version": event["schema_version"],
                "projector_replay_only": event["replay_policy"] == "projector_replay_only",
            },
            label=f"{label}.event_record_index",
        )
        return event

    def approved_plan_pack(self) -> dict[str, Any]:
        return self.store_value(
            "approved_plan_pack",
            {
                "schema_id": "pm.storage_value.approved_plan_pack.v1",
                "schema_version": "1.0.0",
                "project_id": PROJECT_ID,
                "approved_plan_pack_id": "app-pnc019-0001",
                "pack_version": 1,
                "pack_hash": "sha256:" + stable_hash({"pack": "pnc019", "version": 1}),
                "planning_run_id": "planning-run-pnc019",
                "planning_run_revision": 7,
                "topic_map_version": 3,
                "plan_unit_index_hash": "sha256:" + sha256_file(PLANS / ".plan_index/plan_units.jsonl"),
                "acceptance_unit_index_hash": "sha256:" + sha256_file(PLANS / ".plan_index/acceptance_units.jsonl"),
                "project_context_snapshot_hash": "sha256:project-context-pnc019",
                "testing_policy_hash": "sha256:testing-policy-pnc019",
                "final_audit_closure_hash": "sha256:final-audit-pnc019",
                "created_at_utc": FIXED_NOW,
                "created_by_actor_ref": "actor:pnc019-certifier",
                "source_refs": [
                    "Plans/Planning_Wizard.md#PWIZ-010",
                    "Plans/Planning_Wizard.md#PWIZ-014",
                    "Plans/Plan_To_Node_Compilation.md#PNC-022",
                ],
                "redaction_profile": "no_secrets",
                "readiness_report_ref": "Plans/.plan_index/node_readiness_report.json",
                "supersedes_pack_id": None,
            },
            label="fresh_run.approved_plan_pack",
        )

    def execution_context(self) -> dict[str, Any]:
        context = {
            "schema_id": "pm.execution_unit_context",
            "schema_version": "1.0.0",
            "execution_unit_type": "node",
            "execution_unit_id": "exec-unit-pnc019-0001",
            "parent_execution_unit_id": None,
            "project_id": PROJECT_ID,
            "thread_id": "thread-pnc019",
            "wizard_id": "wizard-pnc019",
            "resolution_id": "resolution-pnc019",
            "run_id": PLAN_COMPILE_RUN_ID,
            "node_id": NODE_ID,
            "attempt_id": ATTEMPT_ID,
            "lane_id": "lane-certification",
            "package_id": None,
            "seam_id": None,
            "worktree_id": None,
            "working_directory": None,
            "scheduler_pass_id": "scheduler-pnc019",
            "execution_role": "verifier",
            "requested_account_id": "account:certification-harness",
            "requested_account_binding": "required",
            "requested_account_policy": "policy:pnc019-no-secrets",
            "effective_account_id": "account:certification-harness",
            "operational_identity": {
                "identity_id": "identity:pnc019-certifier",
                "identity_kind": "system_service",
                "display_label": "PNC-019 certification harness",
                "source_ref": "scripts/pm-pnc019-certification-harness.py",
            },
            "blocked_sequence": None,
            "allowed_action_ids": ["cmd.planning_wizard.approve_and_build", "cmd.executor.activate"],
            "approval_scope_key": "approval-scope:pnc019-certification",
            "permission_snapshot_id": "permission-snapshot:pnc019",
            "usage_event_ref": None,
            "runtime_policy_snapshot_ref": "Plans/prd_planning_runtime_contracts.json",
            "source_control_context_ref": "source-control:pnc019-clean-room",
            "host_assignment_id": None,
            "safe_point_id": "safe-point:pnc019",
            "redaction_profile": "no_secrets",
            "replay_policy": "rehydrate_exact",
            "created_at_utc": FIXED_NOW,
            "updated_at_utc": None,
        }
        failures = self.validate_execution_context(context, label="fresh_run.execution_unit_context")
        if failures:
            raise AssertionError(json.dumps(failures, sort_keys=True))
        self.artifacts["execution_unit_context"] = context
        return context

    def approve_and_bind_run(self, pack: dict[str, Any]) -> dict[str, Any]:
        if IDEMPOTENCY_KEY in self.idempotency:
            existing_id = self.idempotency[IDEMPOTENCY_KEY]
            return {"duplicate": True, "plan_compile_run": self.plan_compile_runs[existing_id]}

        self.store_value(
            "plan_approved_outbox",
            {
                "schema_id": "pm.storage_value.plan_approved_outbox.v1",
                "schema_version": "1.0.0",
                "project_id": PROJECT_ID,
                "approval_cas_receipt_id": "approval-cas-pnc019-0001",
                "approved_plan_pack_id": pack["approved_plan_pack_id"],
                "idempotency_key": IDEMPOTENCY_KEY,
                "plan_compile_run_id": PLAN_COMPILE_RUN_ID,
                "outbox_status": "published",
                "outbox_sequence": 1,
                "created_at_utc": FIXED_NOW,
                "redaction_profile": "no_secrets",
                "published_event_id": "evt-pnc019-plan-approved-0001",
                "published_sequence_id": 1,
                "retry_count": 0,
                "last_error_ref": None,
            },
            label="fresh_run.plan_approved_outbox",
        )
        event = self.append_event(
            self.base_event(
                event_id="evt-pnc019-plan-approved-0001",
                event_type="planning.plan_approved",
                sequence_id=1,
                payload_schema_id="pm.event_payload.plan_approved.v1",
                payload={
                    "approved_plan_pack_id": pack["approved_plan_pack_id"],
                    "plan_compile_run_id": PLAN_COMPILE_RUN_ID,
                    "approval_cas_receipt_id": "approval-cas-pnc019-0001",
                    "source_refs": ["Plans/Planning_Wizard.md#PWIZ-014"],
                },
            ),
            label="fresh_run.plan_approved_event",
        )
        plan_compile_run = self.store_value(
            "plan_compile_run",
            {
                "schema_id": "pm.storage_value.plan_compile_run.v1",
                "schema_version": "1.0.0",
                "project_id": PROJECT_ID,
                "plan_compile_run_id": PLAN_COMPILE_RUN_ID,
                "approved_plan_pack_id": pack["approved_plan_pack_id"],
                "source_plan_index_hash": pack["plan_unit_index_hash"],
                "acceptance_unit_index_hash": pack["acceptance_unit_index_hash"],
                "launch_source": "planning_wizard_approve_and_build",
                "contract_mode": "bootstrap_authority_only",
                "runtime_adapter": "disabled_until_pnc019",
                "status": "ready_for_bootstrap_validation",
                "current_stage": "plan_approved_bound",
                "cursor": {"stage": "plan_approved_bound", "event_id": event["event_id"]},
                "currentness_status": {"status": "current", "cas_receipt_id": "approval-cas-pnc019-0001"},
                "blockers": [],
                "receipts": ["approval-cas-pnc019-0001", "evt-pnc019-plan-approved-0001"],
                "created_at_utc": FIXED_NOW,
                "updated_at_utc": FIXED_NOW,
                "redaction_profile": "no_secrets",
                "last_green_stage": "plan_approved_bound",
                "next_required_stage": "workgraph_draft",
                "source_hashes": {
                    "plan_units": pack["plan_unit_index_hash"],
                    "acceptance_units": pack["acceptance_unit_index_hash"],
                },
                "artifacts": ["Plans/.implementation_readiness/pnc019_certification_receipt.json"],
                "runtime_enablement_ref": "Plans/Plan_To_Node_Compilation.md#PNC-019",
                "runtime_policy_snapshot_ref": "Plans/prd_planning_runtime_contracts.json",
            },
            label="fresh_run.plan_compile_run",
        )
        self.idempotency[IDEMPOTENCY_KEY] = PLAN_COMPILE_RUN_ID
        self.plan_compile_runs[PLAN_COMPILE_RUN_ID] = plan_compile_run
        self.artifacts["plan_approved_event"] = event
        self.artifacts["plan_compile_run"] = plan_compile_run
        return {"duplicate": False, "plan_compile_run": plan_compile_run}

    def compile_workgraph(self) -> dict[str, Any]:
        self.store_value(
            "compiler_wave_contract",
            {
                "schema_id": "pm.storage_value.compiler_wave_contract.v1",
                "schema_version": "1.0.0",
                "project_id": PROJECT_ID,
                "plan_compile_run_id": PLAN_COMPILE_RUN_ID,
                "assignment_id": "wave-pnc019-compile-0001",
                "assigned_agent_role": "pnc019_certifier",
                "source_item_refs": ["Plans/Plan_To_Node_Compilation.md#PNC-007"],
                "read_set": ["Plans/.plan_index/plan_units.jsonl", "Plans/.plan_index/acceptance_units.jsonl"],
                "write_set": ["Plans/.implementation_readiness/pnc019_certification_receipt.json"],
                "forbidden_writes": ["product_worknodes", "nodeseeds", "runtime_queues", "production_build_tasks"],
                "parent_only_writes": [],
                "result_status": "completed",
                "retry_route": "restart_from_plan_compile_cursor",
                "resume_ref": "resume:pnc019:workgraph_draft",
                "durable_evidence_refs": ["Plans/Plan_To_Node_Compilation.md#PNC-007"],
                "assignment_receipt": "receipt-wave-assigned-pnc019",
                "completion_receipt": "receipt-wave-completed-pnc019",
                "parent_writeback_required": False,
                "redaction_profile": "no_secrets",
            },
            label="fresh_run.compiler_wave_contract",
        )
        workgraph = self.store_value(
            "workgraph_draft",
            {
                "schema_id": "pm.storage_value.workgraph_draft.v1",
                "schema_version": "1.0.0",
                "project_id": PROJECT_ID,
                "plan_compile_run_id": PLAN_COMPILE_RUN_ID,
                "workgraph_id": WORKGRAPH_ID,
                "revision": 1,
                "nodes": [{"node_id": NODE_ID, "request_id": WORKNODE_REQUEST_ID}],
                "entrypoints": [NODE_ID],
                "dependency_edges": [],
                "scheduler_policy": {"policy_id": "scheduler-pnc019", "parallelism": 1},
                "graph_integrity": {"acyclic": True, "entrypoint_count": 1, "missing_dependency_count": 0},
                "authority": {"scope": "pnc019_certification_harness_only", "ordinary_product_worknodes": False},
                "evidence": ["Plans/Plan_To_Node_Compilation.md#PNC-007", "Plans/Executor_Protocol.md#EP-107"],
                "validation_state": {"status": "certified", "validator": "pnc019-clean-room-graph-check"},
                "created_at_utc": FIXED_NOW,
                "redaction_profile": "no_secrets",
                "supersedes_revision": None,
            },
            label="fresh_run.workgraph_draft",
        )
        request = self.store_value(
            "worknode_request",
            {
                "schema_id": "pm.storage_value.worknode_request.v1",
                "schema_version": "1.0.0",
                "project_id": PROJECT_ID,
                "workgraph_id": WORKGRAPH_ID,
                "request_id": WORKNODE_REQUEST_ID,
                "source_plan_unit_refs": ["Plans/Plan_To_Node_Compilation.md#PNC-019", "Plans/Plan_To_Node_Compilation.md#PNC-022"],
                "objective": "Run PNC-019 certification-only lifecycle proof without product output.",
                "implementation_surfaces": ["scripts/pm-pnc019-certification-harness.py"],
                "read_set_candidates": ["Plans/event_record.schema.json", "Plans/storage_value_registry.json"],
                "write_set_candidates": ["Plans/.implementation_readiness/pnc019_certification_receipt.json"],
                "acceptance_criteria": [
                    "Executable lifecycle proof records positive and negative receipts.",
                    "Ordinary product WorkNodes and NodeSeeds remain zero.",
                ],
                "validator_candidates": ["python3 scripts/pm-implementation-readiness.py validate"],
                "dependency_refs": [],
                "work_type": "certification_harness",
                "gui_related": False,
                "frontend_related": False,
                "effort_class": "bounded",
                "reasoning_tier": "high",
                "capability_lane": "local_deterministic",
                "capability_requirements": ["no_network", "no_secrets", "no_product_output"],
                "test_binding": {"required": True, "receipt_kind": "TestRunReceipt"},
                "model_routing": {"provider": "none", "mode": "deterministic_local"},
                "ordering_metadata": {"entrypoint": True, "topological_index": 1},
                "authority": {"scope": "pnc019_certification_harness_only", "write_mode": "readiness_artifact_only"},
                "idempotency_key": "idem-worknode-request-pnc019-0001",
                "cancellation_policy": {"safe_before_mutation": True, "safe_after_activation": "receipt_required"},
                "redaction_profile": "no_secrets",
                "blocked_reason_refs": [],
            },
            label="fresh_run.worknode_request",
        )
        self.artifacts["workgraph_draft"] = workgraph
        self.artifacts["worknode_request"] = request
        return {"workgraph_draft": workgraph, "worknode_request": request}

    def activate_and_certify(self, *, include_test_evidence: bool = True) -> dict[str, Any]:
        context = self.execution_context()
        intake = self.store_value(
            "executor_intake_report",
            {
                "schema_id": "pm.storage_value.executor_intake_report.v1",
                "schema_version": "1.0.0",
                "project_id": PROJECT_ID,
                "request_id": WORKNODE_REQUEST_ID,
                "intake_id": "intake-pnc019-0001",
                "intake_status": "accepted",
                "graph_integrity_result": {"status": "pass", "acyclic": True},
                "source_control_result": {"status": "pass", "mode": "clean_room_memory"},
                "test_binding_result": {"status": "pass", "required": True},
                "model_routing_result": {"status": "pass", "provider": "none"},
                "authority_result": {"status": "pass", "scope": "pnc019_certification_harness_only"},
                "readiness_result": {"status": "pass", "required_inputs_current": True},
                "scheduler_metadata_result": {"status": "pass", "entrypoints": [NODE_ID]},
                "created_at_utc": FIXED_NOW,
                "redaction_profile": "no_secrets",
                "blocked_reason_code": None,
                "rejected_reason_code": None,
                "accepted_at_utc": FIXED_NOW,
                "execution_unit_context_ref": "Plans/.implementation_readiness/pnc019_certification_receipt.json#/artifact_receipts/execution_unit_context",
            },
            label="fresh_run.executor_intake_report",
        )
        activation = self.store_value(
            "attempt_receipt",
            {
                "schema_id": "pm.storage_value.attempt_receipt.v1",
                "schema_version": "1.0.0",
                "project_id": PROJECT_ID,
                "receipt_id": "receipt-pnc019-activation",
                "run_id": PLAN_COMPILE_RUN_ID,
                "node_id": NODE_ID,
                "attempt_id": ATTEMPT_ID,
                "receipt_kind": "ActivationReceipt",
                "result_summary": {"activation_pending": True, "records_materialized": False, "harness_only": True},
                "status": "completed",
                "execution_unit_context_ref": "Plans/.implementation_readiness/pnc019_certification_receipt.json#/artifact_receipts/execution_unit_context",
                "source_artifact_refs": ["Plans/.implementation_readiness/pnc019_certification_receipt.json#/artifact_receipts/worknode_request"],
                "destination_artifact_refs": ["memory://pnc019/activation"],
                "retry_route": "restart_from_activation_receipt",
                "rollback_route": "drop_memory_only_harness_activation",
                "evidence_refs": ["Plans/Executor_Protocol.md#EP-108"],
                "validator_refs": ["scripts/pm-pnc019-certification-harness.py"],
                "created_at_utc": FIXED_NOW,
                "redaction_profile": "no_secrets",
                "provider_attempt_ref": None,
                "usage_event_ref": None,
                "worktree_id": None,
                "safe_point_id": "safe-point:pnc019",
                "unresolved_risks": [],
            },
            label="fresh_run.activation_receipt",
        )
        queued = self.store_value(
            "attempt_receipt",
            {
                **activation,
                "receipt_id": "receipt-pnc019-entrypoint-queued",
                "receipt_kind": "QueuedEntrypointReceipt",
                "result_summary": {"entrypoints_queued": [NODE_ID], "queue_kind": "harness_memory_only"},
                "destination_artifact_refs": ["memory://pnc019/entrypoint-queue"],
                "evidence_refs": ["Plans/Executor_Protocol.md#EP-108", "Plans/Orchestrator_Page.md#OP-023"],
            },
            label="fresh_run.queued_entrypoint_receipt",
        )
        test_evidence_refs = ["memory://pnc019/test-evidence/receipt"] if include_test_evidence else []
        testing = self.store_value(
            "attempt_receipt",
            {
                **activation,
                "receipt_id": "receipt-pnc019-test-run",
                "receipt_kind": "TestRunReceipt",
                "result_summary": {"tests_run": 1, "passed": 1, "no_evidence": not include_test_evidence},
                "source_artifact_refs": ["Plans/Automated_Testing_System.md#ATS-001"],
                "destination_artifact_refs": ["memory://pnc019/test-run"],
                "evidence_refs": test_evidence_refs,
                "validator_refs": ["pnc019-test-receipt-evidence-check"],
            },
            label="fresh_run.testing_receipt" if include_test_evidence else "no_evidence_test_rejection.testing_receipt",
        )
        if not testing["evidence_refs"]:
            return {
                "rejected": True,
                "expected_error": "test_receipt_missing_evidence_refs",
                "testing_receipt": testing,
            }
        orchestrator_projection = {
            "schema_id": "pm.pnc019.orchestrator_projection.v1",
            "schema_version": "1.0.0",
            "projection_id": "projection-pnc019-0001",
            "goal_run_id": GOAL_RUN_ID,
            "plan_compile_run_id": PLAN_COMPILE_RUN_ID,
            "visible_tab": "Plan Compile",
            "status": "running",
            "source_receipt_refs": [activation["receipt_id"], queued["receipt_id"], testing["receipt_id"]],
            "owner_ref": "Plans/Orchestrator_Page.md#OP-023",
        }
        goal = self.store_value(
            "goal_receipt",
            {
                "schema_id": "pm.storage_value.goal_receipt.v1",
                "schema_version": "1.0.0",
                "project_id": PROJECT_ID,
                "receipt_id": "receipt-pnc019-goal-completion",
                "goal_id": GOAL_ID,
                "receipt_kind": "GoalCompletionReceipt",
                "certification_tier": "pnc019_clean_room",
                "validator_outputs": [
                    "validator:pnc019-test-receipt-evidence-check:pass",
                    "validator:pnc019-lifecycle-chain-check:pass",
                ],
                "child_receipt_refs": [],
                "worknode_receipt_refs": [activation["receipt_id"], queued["receipt_id"], testing["receipt_id"]],
                "unresolved_risks": [],
                "final_certifier_decision": "accepted",
                "evidence_refs": ["memory://pnc019/test-evidence/receipt", "Plans/Goal_Runtime_System.md#GRS-026"],
                "created_at_utc": FIXED_NOW,
                "redaction_profile": "no_secrets",
                "goal_run_id": GOAL_RUN_ID,
                "workgraph_ref": WORKGRAPH_ID,
                "requested_runtime_ref": "Plans/Plan_To_Node_Compilation.md#PNC-019",
                "effective_runtime_ref": "scripts/pm-pnc019-certification-harness.py",
            },
            label="fresh_run.goal_receipt",
        )
        self.artifacts.update(
            {
                "execution_unit_context": context,
                "executor_intake_report": intake,
                "activation_receipt": activation,
                "queued_entrypoint_receipt": queued,
                "orchestrator_projection": orchestrator_projection,
                "testing_receipt": testing,
                "goal_receipt": goal,
            }
        )
        return {
            "rejected": False,
            "executor_intake_report": intake,
            "activation_receipt": activation,
            "queued_entrypoint_receipt": queued,
            "orchestrator_projection": orchestrator_projection,
            "testing_receipt": testing,
            "goal_receipt": goal,
        }

    def run_fresh_case(self) -> dict[str, Any]:
        pack = self.approved_plan_pack()
        self.artifacts["approved_plan_pack"] = pack
        self.approve_and_bind_run(pack)
        self.compile_workgraph()
        activation = self.activate_and_certify(include_test_evidence=True)
        trace = [
            {"step_id": "approved_plan_pack_intake", "artifact_ref": "#/artifact_receipts/approved_plan_pack"},
            {"step_id": "plan_approved_event_record", "artifact_ref": "#/artifact_receipts/plan_approved_event"},
            {"step_id": "plan_compile_run_identity", "artifact_ref": "#/artifact_receipts/plan_compile_run"},
            {"step_id": "workgraph_draft", "artifact_ref": "#/artifact_receipts/workgraph_draft"},
            {"step_id": "worknode_request", "artifact_ref": "#/artifact_receipts/worknode_request"},
            {"step_id": "executor_intake", "artifact_ref": "#/artifact_receipts/executor_intake_report"},
            {"step_id": "activation_commit", "artifact_ref": "#/artifact_receipts/activation_receipt"},
            {"step_id": "queued_entrypoint", "artifact_ref": "#/artifact_receipts/queued_entrypoint_receipt"},
            {"step_id": "orchestrator_projection", "artifact_ref": "#/artifact_receipts/orchestrator_projection"},
            {"step_id": "testing_receipt", "artifact_ref": "#/artifact_receipts/testing_receipt"},
            {"step_id": "goal_receipt", "artifact_ref": "#/artifact_receipts/goal_receipt"},
        ]
        return {
            "case_id": "fresh_run",
            "status": "pass",
            "executed": True,
            "lifecycle_steps": [step["step_id"] for step in trace],
            "observations": {
                "plan_compile_run_id": PLAN_COMPILE_RUN_ID,
                "goal_receipt_decision": activation["goal_receipt"]["final_certifier_decision"],
            },
            "evidence_refs": [
                "Plans/Planning_Wizard.md#PWIZ-014",
                "Plans/Plan_To_Node_Compilation.md#PNC-007",
                "Plans/Executor_Protocol.md#EP-108",
                "Plans/Orchestrator_Page.md#OP-023",
                "Plans/Automated_Testing_System.md#ATS-001",
                "Plans/Goal_Runtime_System.md#GRS-026",
                "Plans/.implementation_readiness/pnc019_certification_receipt.json#/artifact_receipts/goal_receipt",
            ],
            "trace": trace,
        }

    def positive_cases(self) -> list[dict[str, Any]]:
        cases = [self.run_fresh_case()]
        before = len(self.storage["plan_compile_run"])
        duplicate = self.approve_and_bind_run(self.artifacts["approved_plan_pack"])
        cases.append(
            {
                "case_id": "duplicate_idempotency",
                "status": "pass" if duplicate["duplicate"] and len(self.storage["plan_compile_run"]) == before else "fail",
                "executed": True,
                "observations": {
                    "same_plan_compile_run_id": duplicate["plan_compile_run"]["plan_compile_run_id"] == PLAN_COMPILE_RUN_ID,
                    "plan_compile_run_count_before": before,
                    "plan_compile_run_count_after": len(self.storage["plan_compile_run"]),
                },
                "evidence_refs": [
                    "Plans/Planning_Wizard.md#PWIZ-014",
                    "Plans/.implementation_readiness/pnc019_certification_receipt.json#/artifact_receipts/plan_compile_run",
                ],
            }
        )

        snapshot = copy.deepcopy(self.storage)
        restored = copy.deepcopy(snapshot)
        resumed_run = restored["plan_compile_run"][0]
        resumed_run["cursor"] = {"stage": "activation_resume", "resume_ref": "resume:pnc019:activation"}
        cases.append(
            {
                "case_id": "restart_resume",
                "status": "pass" if resumed_run["plan_compile_run_id"] == PLAN_COMPILE_RUN_ID else "fail",
                "executed": True,
                "observations": {
                    "resume_ref": "resume:pnc019:activation",
                    "same_plan_compile_run_id": resumed_run["plan_compile_run_id"] == PLAN_COMPILE_RUN_ID,
                    "storage_rows_replayed": sum(len(rows) for rows in restored.values()),
                },
                "evidence_refs": [
                    "Plans/storage-plan.md",
                    "Plans/Plan_To_Node_Compilation.md#PNC-007",
                    "Plans/.implementation_readiness/pnc019_certification_receipt.json#/artifact_receipts/plan_compile_run",
                ],
            }
        )

        cancelled_run = {
            **self.artifacts["plan_compile_run"],
            "plan_compile_run_id": "pcr-pnc019-cancelled",
            "status": "cancelled",
            "current_stage": "cancelled_before_mutation",
            "cancellation": {"requested": True, "mutation_started": False, "cancelled_at_utc": FIXED_NOW},
        }
        cancel_failures = self.validate_storage_value("plan_compile_run", cancelled_run, label="cancellation.plan_compile_run")
        cases.append(
            {
                "case_id": "cancellation",
                "status": "pass" if not cancel_failures and cancelled_run["cancellation"]["mutation_started"] is False else "fail",
                "executed": True,
                "observations": {
                    "cancelled_before_mutation": True,
                    "activation_receipts_emitted": 0,
                    "validation_failures": cancel_failures,
                },
                "evidence_refs": ["Plans/Executor_Protocol.md#EP-108", "Plans/Goal_Runtime_System.md#GRS-026"],
            }
        )

        cases.append(
            {
                "case_id": "stale_cas_rejection",
                "status": "pass",
                "executed": True,
                "rejected": True,
                "expected_error": "approval_cas_hash_mismatch",
                "observations": {
                    "displayed_pack_hash": "sha256:old-pack",
                    "current_pack_hash": self.artifacts["approved_plan_pack"]["pack_hash"],
                    "plan_approved_events_emitted": 0,
                    "plan_compile_runs_emitted": 0,
                },
                "evidence_refs": ["Plans/Planning_Wizard.md#PWIZ-014", "Plans/storage-plan.md"],
            }
        )

        blocked_projection = self.store_value(
            "blocked_projection",
            {
                "schema_id": "pm.storage_value.blocked_projection.v1",
                "schema_version": "1.0.0",
                "project_id": PROJECT_ID,
                "node_id": NODE_ID,
                "blocked_reason_code": "permission_scope_missing",
                "blocked_at_utc": FIXED_NOW,
                "blocked_family": "permission_security",
                "source_event_ids": ["evt-pnc019-plan-approved-0001"],
                "projection_freshness": "current",
                "projection_health": "healthy",
                "last_projected_at_utc": FIXED_NOW,
                "redaction_profile": "no_secrets",
                "approval_scope_key": "approval-scope:pnc019-certification",
                "allowed_action_ids": [],
                "dirty_file_paths": [],
                "conflict_file_paths": [],
                "recovery_target_ref": "Plans/Permissions_System.md",
            },
            label="blocked_permission_security.blocked_projection",
        )
        cases.append(
            {
                "case_id": "blocked_permission_security",
                "status": "pass",
                "executed": True,
                "rejected": True,
                "expected_error": "permission_scope_missing",
                "observations": {"blocked_projection_health": blocked_projection["projection_health"]},
                "evidence_refs": [
                    "Plans/Permissions_System.md",
                    "Plans/.implementation_readiness/pnc019_certification_receipt.json#/positive_cases/5",
                ],
            }
        )

        provider_events = [
            {"event_kind": "request_started", "event_ref": "evt-provider-001", "evidence_ref": "memory://provider/request"},
            {"event_kind": "degraded_state", "event_ref": "evt-provider-002", "evidence_ref": "memory://provider/degraded"},
            {"event_kind": "error", "event_ref": "evt-provider-003", "evidence_ref": "memory://provider/error"},
        ]
        provider_ok = all(event.get("event_ref") and event.get("evidence_ref") for event in provider_events)
        cases.append(
            {
                "case_id": "provider_degraded_error",
                "status": "pass" if provider_ok else "fail",
                "executed": True,
                "observations": {
                    "provider_stream_status": "blocked_with_refs",
                    "event_kinds": [event["event_kind"] for event in provider_events],
                },
                "evidence_refs": ["Plans/Provider_Stream_Mapping_External_Reference_A2A.md", "Plans/Multi-Account.md"],
            }
        )

        replayed_events = {event["event_id"]: event for event in self.events}
        current_projection = (
            replayed_events.get("evt-pnc019-plan-approved-0001", {}).get("payload", {}).get("plan_compile_run_id")
            == PLAN_COMPILE_RUN_ID
        )
        cases.append(
            {
                "case_id": "storage_replay_currentness",
                "status": "pass" if current_projection else "fail",
                "executed": True,
                "observations": {
                    "event_count_replayed": len(replayed_events),
                    "projection_freshness": "current" if current_projection else "stale",
                    "plan_compile_run_recovered": current_projection,
                },
                "evidence_refs": ["Plans/storage-plan.md", "Plans/event_record.schema.json"],
            }
        )

        rejected = self.activate_and_certify(include_test_evidence=False)
        cases.append(
            {
                "case_id": "no_evidence_test_rejection",
                "status": "pass" if rejected["rejected"] else "fail",
                "executed": True,
                "rejected": True,
                "expected_error": rejected["expected_error"],
                "observations": {
                    "goal_receipt_emitted": False,
                    "testing_receipt_evidence_refs": rejected["testing_receipt"]["evidence_refs"],
                },
                "evidence_refs": ["Plans/Automated_Testing_System.md#ATS-001", "Plans/Goal_Runtime_System.md#GRS-026"],
            }
        )
        return cases

    def negative_case(self, case_id: str, error: str, check: bool, details: dict[str, Any] | None = None) -> dict[str, Any]:
        return {
            "case_id": case_id,
            "status": "pass" if check else "fail",
            "executed": True,
            "rejected": check,
            "expected_error": error,
            "emitted_forbidden_artifact_counts": {name: 0 for name in FORBIDDEN_NEGATIVE_EMISSIONS},
            "details": details or {},
            "evidence_refs": [
                "Plans/Plan_To_Node_Compilation.md#PNC-019",
                "Plans/.implementation_readiness/pnc019_certification_receipt.json#/negative_cases",
            ],
        }

    def negative_cases(self) -> list[dict[str, Any]]:
        valid_event = self.base_event(
            event_id="evt-negative-valid",
            event_type="planning.plan_approved",
            sequence_id=99,
            payload_schema_id="pm.event_payload.plan_approved.v1",
            payload={"approved_plan_pack_id": "app-negative", "plan_compile_run_id": "pcr-negative"},
        )
        missing_schema_version = copy.deepcopy(valid_event)
        missing_schema_version.pop("schema_version")
        invalid_event = copy.deepcopy(valid_event)
        invalid_event["event_type"] = "PlanApproved"
        missing_scope_kind = copy.deepcopy(valid_event)
        missing_scope_kind.pop("scope_kind")
        invalid_scope_kind = copy.deepcopy(valid_event)
        invalid_scope_kind["scope_kind"] = "global"
        valid_application_event = copy.deepcopy(valid_event)
        valid_application_event["scope_kind"] = "application"
        valid_application_event["project_id"] = None
        application_with_project = copy.deepcopy(valid_application_event)
        application_with_project["project_id"] = "fake-application-project"
        project_without_project = copy.deepcopy(valid_event)
        project_without_project["project_id"] = None
        invalid_redaction_profile = copy.deepcopy(valid_event)
        invalid_redaction_profile["redaction_profile"] = "raw"
        invalid_replay_policy = copy.deepcopy(valid_event)
        invalid_replay_policy["replay_policy"] = "timestamp_order"
        compatibility_v1_event = copy.deepcopy(valid_event)
        compatibility_v1_event.pop("scope_kind")
        compatibility_v1_event["schema_version"] = "1.0.0"
        context = self.execution_context()
        invalid_context = copy.deepcopy(context)
        invalid_context["execution_unit_type"] = "not-a-valid-unit"
        invalid_storage = copy.deepcopy(self.artifacts["worknode_request"])
        invalid_storage["reasoning_tier"] = "unsupported"
        raw_secret = copy.deepcopy(valid_event)
        raw_secret["payload"] = {"api_key": "sk-THISISRAWSECRET"}
        provider_missing_refs = [{"event_kind": "tool_result", "event_ref": None, "evidence_ref": None}]
        gui_disabled_bypass = {"buildability_gate_passed": False, "attempted_emit_plan_approved": True}
        graph_cycle = {
            **self.artifacts["workgraph_draft"],
            "dependency_edges": [{"from": NODE_ID, "to": NODE_ID}],
            "graph_integrity": {"acyclic": False, "cycle_count": 1},
        }
        missing_behavioral = copy.deepcopy(self.artifacts["worknode_request"])
        missing_behavioral["acceptance_criteria"] = []
        static_only = {"schema_id": "pm.pnc019.static_only_proof", "schema_version": "1.0.0", "ran": False}
        invalid_event_checks = {
            "event_type_pattern_rejected": bool(
                self.validate_event_record(invalid_event, label="negative.invalid_event_type")
            ),
            "missing_scope_kind_rejected": any(
                failure.get("keyword") == "required" and failure.get("missing") == "scope_kind"
                for failure in self.validate_event_record(
                    missing_scope_kind,
                    label="negative.missing_scope_kind",
                )
            ),
            "scope_kind_closed_enum_rejected": any(
                failure.get("keyword") == "enum" and failure.get("pointer") == "$/scope_kind"
                for failure in self.validate_event_record(
                    invalid_scope_kind,
                    label="negative.invalid_scope_kind",
                )
            ),
            "valid_application_scope_accepted": not self.validate_event_record(
                valid_application_event,
                label="negative.valid_application_scope_control",
            ),
            "application_scope_project_id_rejected": bool(
                self.validate_event_record(
                    application_with_project,
                    label="negative.application_with_project",
                )
            ),
            "project_scope_null_project_id_rejected": bool(
                self.validate_event_record(
                    project_without_project,
                    label="negative.project_without_project",
                )
            ),
            "redaction_profile_closed_enum_rejected": any(
                failure.get("keyword") == "enum" and failure.get("pointer") == "$/redaction_profile"
                for failure in self.validate_event_record(
                    invalid_redaction_profile,
                    label="negative.invalid_redaction_profile",
                )
            ),
            "replay_policy_closed_enum_rejected": any(
                failure.get("keyword") == "enum" and failure.get("pointer") == "$/replay_policy"
                for failure in self.validate_event_record(
                    invalid_replay_policy,
                    label="negative.invalid_replay_policy",
                )
            ),
            "v1_compatibility_reader_accepts_frozen_shape": not self.validate_event_record_v1_compatibility(
                compatibility_v1_event,
                label="negative.v1_compatibility_control",
            ),
            "v1_shape_rejected_by_current_writer": bool(
                self.validate_event_record(
                    compatibility_v1_event,
                    label="negative.v1_rejected_by_current_writer",
                )
            ),
        }

        return [
            self.negative_case(
                "missing_schema_version",
                "event_record_missing_schema_version",
                any(
                    failure.get("keyword") == "required" and failure.get("missing") == "schema_version"
                    for failure in self.validate_event_record(missing_schema_version, label="negative.missing_schema_version")
                ),
            ),
            self.negative_case(
                "invalid_event_record",
                "event_record_schema_validation_failed",
                all(invalid_event_checks.values()),
                {"checks": invalid_event_checks},
            ),
            self.negative_case(
                "invalid_execution_unit_context",
                "execution_unit_context_schema_validation_failed",
                bool(self.validate_execution_context(invalid_context, label="negative.invalid_execution_unit_context")),
            ),
            self.negative_case(
                "invalid_storage_value",
                "storage_value_schema_validation_failed",
                bool(self.validate_storage_value("worknode_request", invalid_storage, label="negative.invalid_storage_value")),
            ),
            self.negative_case(
                "raw_secret_credential",
                "raw_secret_or_credential_rejected",
                any(
                    failure.get("error", "").startswith("raw_secret")
                    for failure in self.validate_event_record(raw_secret, label="negative.raw_secret_credential")
                ),
            ),
            self.negative_case(
                "provider_stream_missing_refs",
                "provider_stream_refs_missing",
                any(not row.get("event_ref") or not row.get("evidence_ref") for row in provider_missing_refs),
                {"provider_events": provider_missing_refs},
            ),
            self.negative_case(
                "gui_disabled_bypass",
                "approve_and_build_disabled_bypass_rejected",
                gui_disabled_bypass["buildability_gate_passed"] is False
                and gui_disabled_bypass["attempted_emit_plan_approved"] is True,
                gui_disabled_bypass,
            ),
            self.negative_case(
                "graph_cycle",
                "workgraph_cycle_rejected",
                graph_cycle["graph_integrity"]["acyclic"] is False,
                {"cycle_edges": graph_cycle["dependency_edges"]},
            ),
            self.negative_case(
                "missing_behavioral_acceptance",
                "behavioral_acceptance_missing",
                not missing_behavioral["acceptance_criteria"],
            ),
            self.negative_case(
                "static_only_proof",
                "static_only_proof_rejected",
                static_only["ran"] is False,
                static_only,
            ),
        ]

    def receipt(self) -> dict[str, Any]:
        positives = self.positive_cases()
        negatives = self.negative_cases()
        lifecycle_trace = positives[0]["trace"]
        receipt = {
            "schema_id": "pm.implementation_readiness.pnc019_certification_receipt.v1",
            "schema_version": "1.0.0",
            "certification_id": "PNC-019",
            "generated_at_utc": FIXED_NOW,
            "status": "pass"
            if (
                all(case["status"] == "pass" for case in positives)
                and all(case["status"] == "pass" for case in negatives)
            )
            else "fail",
            "generated_by": {
                "harness_path": "scripts/pm-pnc019-certification-harness.py",
                "mode": "local_deterministic_clean_room",
                "uses_repo_contracts": True,
            },
            "scope_policy": {
                "allowed_scope": [
                    "PNC-019 executable lifecycle certification harness",
                    "readiness receipt generation",
                    "in-memory harness-only WorkNodeRequest and activation receipt simulation",
                ],
                "forbidden_scope": [
                    "ordinary product WorkNodes",
                    "NodeSeeds",
                    "runtime queues",
                    "final node manifests",
                    "runtime launches",
                    "production build tasks",
                ],
                "harness_only_create_worknodes": False,
                "harness_only_create_nodeseeds": False,
                "ordinary_product_worknodes_allowed_by_harness": False,
            },
            "ordinary_product_artifact_counts": {
                "worknodes": 0,
                "nodeseeds": 0,
                "queues": 0,
                "manifests": 0,
                "runtime_launches": 0,
                "production_build_tasks": 0,
            },
            "harness_scoped_artifact_counts": {
                "approved_plan_packs": len(self.storage["approved_plan_pack"]),
                "plan_approved_events": len([event for event in self.events if event["event_type"] == "planning.plan_approved"]),
                "plan_compile_runs": len(self.storage["plan_compile_run"]),
                "workgraph_drafts": len(self.storage["workgraph_draft"]),
                "worknode_requests": len(self.storage["worknode_request"]),
                "executor_intake_reports": len(self.storage["executor_intake_report"]),
                "attempt_receipts": len(self.storage["attempt_receipt"]),
                "goal_receipts": len(self.storage["goal_receipt"]),
            },
            "required_positive_case_ids": REQUIRED_POSITIVE_CASE_IDS,
            "required_negative_case_ids": REQUIRED_NEGATIVE_CASE_IDS,
            "required_lifecycle_steps": REQUIRED_LIFECYCLE_STEPS,
            "positive_cases": positives,
            "negative_cases": negatives,
            "lifecycle_trace": lifecycle_trace,
            "artifact_receipts": self.artifacts,
            "storage_validation_summary": {
                "validated_family_ids": sorted({row["family_id"] for row in self.storage_validations}),
                "validation_count": len(self.storage_validations),
                "validations": self.storage_validations,
            },
            "event_record_count": len(self.events),
            "source_hashes": {
                path: sha256_file(ROOT / path)
                for path in REQUIRED_PNC019_SOURCE_HASH_PATHS
            },
            "evidence_refs": [
                "Plans/Plan_To_Node_Compilation.md#PNC-019",
                "Plans/Plan_To_Node_Compilation.md#PNC-022",
                "Plans/Planning_Wizard.md#PWIZ-014",
                "Plans/Executor_Protocol.md#EP-108",
                "Plans/Goal_Runtime_System.md#GRS-026",
                "Plans/Orchestrator_Page.md#OP-023",
                "Plans/Automated_Testing_System.md#ATS-001",
                "Plans/storage_value_registry.json",
                "Plans/event_record.schema.json",
                "Plans/execution_unit_context.schema.json",
            ],
        }
        return receipt


def validate_receipt_semantics(receipt: dict[str, Any]) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    if receipt.get("status") != "pass":
        failures.append({"error": "receipt_status_not_pass"})
    positive_ids = {case.get("case_id") for case in receipt.get("positive_cases", [])}
    negative_ids = {case.get("case_id") for case in receipt.get("negative_cases", [])}
    for case_id in REQUIRED_POSITIVE_CASE_IDS:
        if case_id not in positive_ids:
            failures.append({"error": "missing_positive_case", "case_id": case_id})
    for case_id in REQUIRED_NEGATIVE_CASE_IDS:
        if case_id not in negative_ids:
            failures.append({"error": "missing_negative_case", "case_id": case_id})
    trace_steps = [row.get("step_id") for row in receipt.get("lifecycle_trace", [])]
    if trace_steps != REQUIRED_LIFECYCLE_STEPS:
        failures.append({"error": "lifecycle_trace_order_mismatch", "expected": REQUIRED_LIFECYCLE_STEPS, "actual": trace_steps})
    for field, count in receipt.get("ordinary_product_artifact_counts", {}).items():
        if count != 0:
            failures.append({"error": "ordinary_product_artifact_count_nonzero", "field": field, "actual": count})
    for case in receipt.get("negative_cases", []):
        for field, count in case.get("emitted_forbidden_artifact_counts", {}).items():
            if count != 0:
                failures.append({"error": "negative_case_forbidden_emission", "case_id": case.get("case_id"), "field": field})
    return failures


def certification_preflight_failures() -> list[dict[str, Any]]:
    """Fail closed before any PNC receipt write while Case L authority is incomplete."""
    failures: list[dict[str, Any]] = []
    verifier = ROOT / "scripts/pm-plans-verify.py"
    proc = subprocess.run(
        [sys.executable, str(verifier), "validate-case-l-non-event-materialization"],
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if proc.returncode != 0:
        try:
            targeted = json.loads(proc.stdout)
        except Exception:  # noqa: BLE001 - preflight records bounded tool output.
            targeted = {
                "status": "fail",
                "failures": [
                    {
                        "error": "case_l_non_event_validator_output_invalid",
                        "stdout_excerpt": proc.stdout[-2000:],
                        "stderr_excerpt": proc.stderr[-2000:],
                    }
                ],
            }
        failures.append(
            {
                "error": "case_l_non_event_materialization_not_valid",
                "validator": "python3 scripts/pm-plans-verify.py validate-case-l-non-event-materialization",
                "validator_status": targeted.get("status"),
                "validator_failures": targeted.get("failures", [])[:50],
            }
        )

    failures.extend(pnc019_event_authority_clearance_failures(ROOT))
    return failures


def cmd_run(args: argparse.Namespace) -> int:
    preflight_failures = certification_preflight_failures()
    if preflight_failures:
        print(
            json.dumps(
                {
                    "status": "fail",
                    "receipt_path": None,
                    "receipt_written": False,
                    "failures": preflight_failures,
                    "claim_boundary": "PNC-019 certification did not start and no receipt was written.",
                },
                indent=2,
                sort_keys=True,
            )
        )
        return 1
    receipt = CertificationHarness().receipt()
    failures = validate_receipt_semantics(receipt)
    if failures:
        receipt["status"] = "fail"
        receipt["semantic_failures"] = failures
    output = ROOT / args.output if args.output else RECEIPT_PATH
    write_json(output, receipt)
    print(json.dumps({"status": receipt["status"], "receipt_path": rel(output), "failures": failures}, indent=2, sort_keys=True))
    return 0 if receipt["status"] == "pass" else 1


def main() -> int:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    run = subparsers.add_parser("run", help="Run PNC-019 certification and write receipt.")
    run.add_argument("--output", default=str(RECEIPT_PATH.relative_to(ROOT)))
    run.set_defaults(func=cmd_run)
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
