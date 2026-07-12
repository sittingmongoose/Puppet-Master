#!/usr/bin/env python3
"""Shared, fail-closed controls for Audit 005 reverse-orientation shadow review."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from macro_v2_common import AUDIT_ID, ROOT, sha


SHADOW_ROOT = ROOT / "master/cross_shard_shadow"
SHADOW_OUTPUT_ROOT = ROOT / "cross_shard_shadow_v1"
SHADOW_EPOCH = "cross-shard-shadow-epoch-0001"
SHADOW_BATCH = "cross-shard-shadow-batch-0001"
SHADOW_ATTEMPT = "attempt-0001"
SHADOW_CONCURRENCY = 40
TEMPORARY_PRE_RESET_TARGET = 40
HARD_CAP = 48
MAX_PACKET_BYTES = 750_000
SOL_CONTROLLER = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"
LUNA_CONTROLLER = "019f5078-6501-7223-b52f-2251010bdc41"
POLICY_REF = "master/coordination/CONCURRENCY_POLICY_V2.json"
POLICY_SHA256 = "ba8c30503482de271c135c7c9e0f5134f12dd5f7ca66938c913e4465ea6515de"
ORIENTATION = "primary_right_as_shadow_anchor"


def canonical_json(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def write_obj(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(canonical_json(value))


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(b"".join(canonical_json(row) for row in rows))


def load_obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise RuntimeError(f"not an object:{path}")
    return value


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            raise RuntimeError(f"blank JSONL line:{path}:{line_number}")
        row = json.loads(line)
        if not isinstance(row, dict):
            raise RuntimeError(f"non-object JSONL row:{path}:{line_number}")
        rows.append(row)
    return rows


def digest_strings(values: list[str]) -> str:
    return sha(json.dumps(sorted(values), separators=(",", ":"), ensure_ascii=False).encode())


def compact_feature(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "provisional_feature_ref": row["provisional_feature_ref"],
        "title": row["title"],
        "summary": row["summary"],
        "feature_kinds": row["feature_kinds"],
        "aliases": row["aliases"],
        "local_feature_count": len(row["local_feature_refs"]),
        "source_documents": row["source_documents"],
        "source_unit_refs": row["source_unit_refs"],
        "risk_level": row["risk_level"],
        "spec_state": row["spec_state"],
        "gap_summary": row["gap_summary"],
        "cross_domain_terms": row["cross_domain_terms"],
        "confidence": row["confidence"],
    }


def result_schema() -> dict[str, Any]:
    strings = {"type": "array", "items": {"type": "string", "minLength": 1}, "uniqueItems": True}
    decision = {
        "type": "object", "additionalProperties": False,
        "required": [
            "anchor_provisional_feature_ref", "compared_against_count", "merge_candidate_refs",
            "related_but_distinct_refs", "rationale", "confidence",
        ],
        "properties": {
            "anchor_provisional_feature_ref": {"type": "string", "minLength": 1},
            "compared_against_count": {"type": "integer", "minimum": 1},
            "merge_candidate_refs": strings,
            "related_but_distinct_refs": strings,
            "rationale": {"type": "string", "minLength": 1},
            "confidence": {"type": "number", "minimum": 0, "maximum": 1},
        },
    }
    attestations = [
        "every_anchor_decided_once", "every_comparator_considered_for_each_anchor",
        "strict_merge_equivalence_applied", "umbrella_member_and_adjacency_kept_distinct",
        "reverse_orientation_verified", "same_owner_domain_only", "no_external_or_peer_inputs_used",
    ]
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object", "additionalProperties": False,
        "required": [
            "audit_id", "schema_version", "phase", "assignment_id", "attempt_id", "task_thread_id",
            "model", "reasoning_effort", "status", "input_binding", "coverage", "decisions", "self_attestation",
        ],
        "properties": {
            "audit_id": {"const": AUDIT_ID},
            "schema_version": {"const": "cross-shard-shadow-result-v1"},
            "phase": {"const": "cross_shard_reverse_orientation_shadow_candidate_discovery"},
            "assignment_id": {"type": "string", "pattern": "^A005CSS-[0-9]{4}$"},
            "attempt_id": {"const": SHADOW_ATTEMPT},
            "task_thread_id": {"type": "string", "minLength": 1},
            "model": {"const": "gpt-5.6-sol"},
            "reasoning_effort": {"const": "xhigh"},
            "status": {"const": "completed"},
            "input_binding": {
                "type": "object", "additionalProperties": False,
                "required": [
                    "packet_id", "packet_sha256", "anchor_refs_digest", "comparator_refs_digest",
                    "orientation", "anchor_owner_assignment_id", "comparator_owner_assignment_id",
                ],
                "properties": {
                    "packet_id": {"type": "string", "pattern": "^CSSPKT-[0-9]{4}$"},
                    "packet_sha256": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
                    "anchor_refs_digest": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
                    "comparator_refs_digest": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
                    "orientation": {"const": ORIENTATION},
                    "anchor_owner_assignment_id": {"type": "string", "minLength": 1},
                    "comparator_owner_assignment_id": {"type": "string", "minLength": 1},
                },
            },
            "coverage": {
                "type": "object", "additionalProperties": False,
                "required": ["anchor_count", "anchor_refs", "comparator_count", "comparator_refs"],
                "properties": {
                    "anchor_count": {"type": "integer", "minimum": 1},
                    "anchor_refs": strings,
                    "comparator_count": {"type": "integer", "minimum": 1},
                    "comparator_refs": strings,
                },
            },
            "decisions": {"type": "array", "minItems": 1, "items": decision},
            "self_attestation": {
                "type": "object", "additionalProperties": False,
                "required": attestations,
                "properties": {key: {"const": True} for key in attestations},
            },
        },
    }

