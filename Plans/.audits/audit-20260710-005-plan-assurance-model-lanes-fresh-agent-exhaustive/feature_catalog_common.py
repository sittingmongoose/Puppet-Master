#!/usr/bin/env python3
"""Shared fail-closed helpers for Audit 005 feature-catalog synthesis."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any

from macro_v2_common import AUDIT_ID, MACRO_ROOT, ROOT, load_obj, sha


CATALOG_ROOT = ROOT / "master/feature_catalog"
CATALOG_OUTPUT_ROOT = ROOT / "feature_catalog_v1"
CATALOG_EPOCH = "catalog-epoch-0001"
CATALOG_ATTEMPT = "attempt-0001"
# Keeps the complete catalog in one 24-worker wave while remaining well below
# the model context ceiling after prompt/schema overhead.
MAX_PACKET_BYTES = 200_000
MAX_CATALOG_CONCURRENCY = 24

OWNER_DOMAINS = [
    "agents_models_providers",
    "automation_scheduling_notifications",
    "collaboration_chat_communication",
    "cross_cutting_platform",
    "data_contracts_interchange",
    "gui_ux_accessibility",
    "installation_updates_recovery",
    "observability_testing_evaluation",
    "orchestration_runtime_execution",
    "permissions_security_privacy",
    "planning_specification_governance",
    "source_control_workspace_code",
    "storage_artifacts_history",
    "tools_integrations_mcp",
    "usage_costs_quotas",
    "work_nodes_tasks_goals",
]

FEATURE_KINDS = [
    "cross_cutting_concern",
    "data_model",
    "feature",
    "governance_control",
    "gui_surface",
    "integration",
    "system",
    "tool",
    "workflow",
]

SPEC_STATES = [
    "contradictory",
    "partially_specified",
    "under_specified",
    "unknown",
    "well_specified",
]

RISK_LEVELS = ["low", "medium", "high", "critical"]


def canonical_json(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def write_obj(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(canonical_json(value))


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(b"".join(canonical_json(row) for row in rows))


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            raise RuntimeError(f"blank JSONL line:{path}:{line_number}")
        value = json.loads(line)
        if not isinstance(value, dict):
            raise RuntimeError(f"non-object JSONL row:{path}:{line_number}")
        rows.append(value)
    return rows


def digest_strings(values: list[str]) -> str:
    return sha(json.dumps(sorted(values), separators=(",", ":"), ensure_ascii=False).encode())


def active_complete_macro_coverage() -> tuple[Path, dict[str, Any], dict[str, Any]]:
    """Return the active coverage only after the complete live chain verifies."""
    pointer_path = MACRO_ROOT / "live/ACTIVE.json"
    if not pointer_path.is_file():
        raise RuntimeError("macro ACTIVE pointer missing")
    pointer = load_obj(pointer_path)
    coverage_path = ROOT / str(pointer.get("coverage_ref"))
    if not coverage_path.is_file():
        raise RuntimeError("active macro coverage missing")
    coverage_bytes = coverage_path.read_bytes()
    if sha(coverage_bytes) != pointer.get("coverage_sha256"):
        raise RuntimeError("active macro coverage hash mismatch")
    coverage = json.loads(coverage_bytes)
    process = subprocess.run(
        ["python3", "verify_macro_live.py"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if process.returncode != 0 or not process.stdout.strip():
        raise RuntimeError(f"macro live verification failed:{process.stderr}")
    live = json.loads(process.stdout)
    if live.get("status") != "pass" or live.get("errors") != []:
        raise RuntimeError(f"macro live chain invalid:{live}")
    required_complete = (
        coverage.get("complete") is True
        and coverage.get("covered_micro_windows") == coverage.get("micro_window_total") == 1269
        and coverage.get("pending_micro_windows") == 0
        and live.get("covered_micro_windows") == 1269
        and live.get("pending_micro_windows") == 0
        and live.get("active_coverage_sha256") == pointer.get("coverage_sha256")
    )
    if not required_complete:
        raise RuntimeError("feature catalog requires complete 1269-window macro coverage")
    return coverage_path, coverage, pointer


def credited_result_records(coverage: dict[str, Any]) -> list[dict[str, Any]]:
    """Select exactly the committed credited outcomes and bind every result byte."""
    expected = set(coverage.get("credited_assignment_ids", []))
    if len(expected) != coverage.get("credited_macro_assignments"):
        raise RuntimeError("credited assignment cardinality mismatch")
    selected: dict[str, dict[str, Any]] = {}
    for outcome_path in sorted((MACRO_ROOT / "transactions").glob("*/outcomes/*.json")):
        outcome = load_obj(outcome_path)
        if outcome.get("status") != "credited":
            continue
        assignment_id = outcome.get("assignment_id")
        if not isinstance(assignment_id, str) or assignment_id in selected:
            raise RuntimeError(f"duplicate or invalid credited outcome:{assignment_id}")
        if outcome.get("dual_mechanical_validation_confirmed") is not True:
            raise RuntimeError(f"credited outcome lacks dual validation:{assignment_id}")
        if outcome.get("fresh_identity_confirmed") is not True or outcome.get("coverage_credit", 0) <= 0:
            raise RuntimeError(f"credited outcome lacks fresh positive credit:{assignment_id}")
        payload = outcome.get("result_payload")
        if not isinstance(payload, dict) or payload.get("exists") is not True:
            raise RuntimeError(f"credited outcome payload missing:{assignment_id}")
        payload_path = ROOT / str(payload.get("path"))
        if not payload_path.is_file():
            raise RuntimeError(f"credited payload path missing:{assignment_id}")
        payload_bytes = payload_path.read_bytes()
        if sha(payload_bytes) != payload.get("sha256") or len(payload_bytes) != payload.get("bytes"):
            raise RuntimeError(f"credited payload byte binding mismatch:{assignment_id}")
        result = json.loads(payload_bytes)
        if (
            result.get("audit_id") != AUDIT_ID
            or result.get("assignment_id") != assignment_id
            or result.get("status") != "completed"
        ):
            raise RuntimeError(f"credited result identity mismatch:{assignment_id}")
        selected[assignment_id] = {
            "assignment_id": assignment_id,
            "outcome_ref": outcome_path.relative_to(ROOT).as_posix(),
            "outcome_sha256": sha(outcome_path.read_bytes()),
            "result_ref": payload_path.relative_to(ROOT).as_posix(),
            "result_sha256": sha(payload_bytes),
            "result": result,
        }
    if set(selected) != expected:
        missing = sorted(expected - set(selected))[:5]
        extra = sorted(set(selected) - expected)[:5]
        raise RuntimeError(f"credited result selection does not equal active coverage:missing={missing}:extra={extra}")
    return [selected[assignment_id] for assignment_id in sorted(selected)]


def catalog_result_schema() -> dict[str, Any]:
    string_array = {"type": "array", "items": {"type": "string", "minLength": 1}, "uniqueItems": True}
    feature = {
        "type": "object",
        "additionalProperties": False,
        "required": [
            "feature_id", "title", "summary", "feature_kind", "owner_domain", "secondary_domains",
            "aliases", "atom_ids", "source_documents", "source_unit_refs", "risk_level", "spec_state",
            "gap_summary", "research_questions", "scenario_requirements", "cross_packet_terms", "confidence",
        ],
        "properties": {
            "feature_id": {"type": "string", "pattern": "^FLOCAL-[0-9]{4}$"},
            "title": {"type": "string", "minLength": 1},
            "summary": {"type": "string", "minLength": 1},
            "feature_kind": {"enum": FEATURE_KINDS},
            "owner_domain": {"enum": OWNER_DOMAINS},
            "secondary_domains": {"type": "array", "items": {"enum": OWNER_DOMAINS}, "uniqueItems": True},
            "aliases": string_array,
            "atom_ids": string_array,
            "source_documents": string_array,
            "source_unit_refs": string_array,
            "risk_level": {"enum": RISK_LEVELS},
            "spec_state": {"enum": SPEC_STATES},
            "gap_summary": {"type": "string"},
            "research_questions": {"type": "array", "minItems": 1, "items": {"type": "string", "minLength": 1}, "uniqueItems": True},
            "scenario_requirements": {"type": "array", "minItems": 1, "items": {"type": "string", "minLength": 1}, "uniqueItems": True},
            "cross_packet_terms": string_array,
            "confidence": {"type": "number", "minimum": 0, "maximum": 1},
        },
    }
    relationship = {
        "type": "object",
        "additionalProperties": False,
        "required": ["source_feature_id", "target_feature_id", "relationship_type", "evidence_atom_ids", "rationale"],
        "properties": {
            "source_feature_id": {"type": "string"},
            "target_feature_id": {"type": "string"},
            "relationship_type": {"enum": ["depends_on", "duplicates", "extends", "governs", "interacts_with", "is_surface_of", "potential_conflict"]},
            "evidence_atom_ids": string_array,
            "rationale": {"type": "string", "minLength": 1},
        },
    }
    family_assignment = {
        "type": "object",
        "additionalProperties": False,
        "required": ["family_key", "feature_ids"],
        "properties": {
            "family_key": {"type": "string", "minLength": 1},
            "feature_ids": {"type": "array", "minItems": 1, "items": {"type": "string"}, "uniqueItems": True},
        },
    }
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "additionalProperties": False,
        "required": [
            "audit_id", "schema_version", "phase", "assignment_id", "attempt_id", "task_thread_id",
            "model", "reasoning_effort", "status", "input_binding", "coverage", "features",
            "relationships", "family_key_assignments", "self_attestation",
        ],
        "properties": {
            "audit_id": {"const": AUDIT_ID},
            "schema_version": {"const": "feature-catalog-result-v1"},
            "phase": {"const": "feature_catalog_normalization"},
            "assignment_id": {"type": "string"},
            "attempt_id": {"const": CATALOG_ATTEMPT},
            "task_thread_id": {"type": "string", "minLength": 1},
            "model": {"const": "gpt-5.6-sol"},
            "reasoning_effort": {"const": "xhigh"},
            "status": {"const": "completed"},
            "input_binding": {
                "type": "object", "additionalProperties": False,
                "required": ["packet_id", "packet_sha256", "atom_ids_digest", "family_keys_digest"],
                "properties": {
                    "packet_id": {"type": "string"}, "packet_sha256": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
                    "atom_ids_digest": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
                    "family_keys_digest": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
                },
            },
            "coverage": {
                "type": "object", "additionalProperties": False,
                "required": ["assigned_atom_count", "assigned_atom_ids", "assigned_family_key_count", "assigned_family_keys"],
                "properties": {
                    "assigned_atom_count": {"type": "integer", "minimum": 1}, "assigned_atom_ids": string_array,
                    "assigned_family_key_count": {"type": "integer", "minimum": 0}, "assigned_family_keys": string_array,
                },
            },
            "features": {"type": "array", "minItems": 1, "items": feature},
            "relationships": {"type": "array", "items": relationship},
            "family_key_assignments": {"type": "array", "items": family_assignment},
            "self_attestation": {
                "type": "object", "additionalProperties": False,
                "required": ["all_atoms_partitioned_once", "all_family_keys_mapped", "distinct_features_not_collapsed", "gaps_and_non_gaps_preserved", "research_deferred_not_omitted", "no_peer_or_external_inputs_used"],
                "properties": {key: {"const": True} for key in [
                    "all_atoms_partitioned_once", "all_family_keys_mapped", "distinct_features_not_collapsed",
                    "gaps_and_non_gaps_preserved", "research_deferred_not_omitted", "no_peer_or_external_inputs_used",
                ]},
            },
        },
    }
