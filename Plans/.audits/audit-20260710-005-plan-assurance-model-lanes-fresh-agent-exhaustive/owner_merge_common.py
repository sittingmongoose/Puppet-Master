#!/usr/bin/env python3
"""Shared controls for Audit 005 owner-domain feature merging."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from feature_catalog_common import OWNER_DOMAINS
from macro_v2_common import AUDIT_ID, ROOT, load_obj, sha


OWNER_ROOT = ROOT / "master/owner_merge"
OWNER_OUTPUT_ROOT = ROOT / "owner_merge_v1"
OWNER_EPOCH = "owner-merge-epoch-0001"
OWNER_ATTEMPT = "attempt-0001"
MAX_SHARD_FEATURES = 300
MAX_OWNER_CONCURRENCY = 24
# The fixed 24-way, same-owner partition has one 278-feature storage/history
# shard whose lossless compact payload is ~375 KiB.  Keep the semantic content
# intact and allow only a small ceiling above the measured maximum.
MAX_PACKET_BYTES = 400_000


def canonical_json(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def write_obj(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(canonical_json(value))


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(b"".join(canonical_json(row) for row in rows))


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows = []
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


def owner_merge_result_schema() -> dict[str, Any]:
    unique_strings = {"type": "array", "items": {"type": "string", "minLength": 1}, "uniqueItems": True}
    provisional = {
        "type": "object", "additionalProperties": False,
        "required": [
            "provisional_feature_id", "title", "summary", "owner_domain", "feature_kinds", "aliases",
            "local_feature_refs", "source_documents", "source_unit_refs", "risk_level", "spec_state",
            "gap_summary", "cross_domain_terms", "confidence",
        ],
        "properties": {
            "provisional_feature_id": {"type": "string", "pattern": "^PF-[0-9]{4}$"},
            "title": {"type": "string", "minLength": 1},
            "summary": {"type": "string", "minLength": 1},
            "owner_domain": {"enum": OWNER_DOMAINS},
            "feature_kinds": unique_strings,
            "aliases": unique_strings,
            "local_feature_refs": {"type": "array", "minItems": 1, "items": {"type": "string"}, "uniqueItems": True},
            "source_documents": unique_strings,
            "source_unit_refs": unique_strings,
            "risk_level": {"enum": ["low", "medium", "high", "critical"]},
            "spec_state": {"enum": ["well_specified", "partially_specified", "under_specified", "contradictory", "unknown"]},
            "gap_summary": {"type": "string"},
            "cross_domain_terms": unique_strings,
            "confidence": {"type": "number", "minimum": 0, "maximum": 1},
        },
    }
    membership = {
        "type": "object", "additionalProperties": False,
        "required": ["local_feature_ref", "provisional_feature_id", "merge_disposition", "rationale"],
        "properties": {
            "local_feature_ref": {"type": "string", "minLength": 1},
            "provisional_feature_id": {"type": "string", "minLength": 1},
            "merge_disposition": {"enum": ["singleton", "merged_synonym", "kept_distinct"]},
            "rationale": {"type": "string", "minLength": 1},
        },
    }
    relationship = {
        "type": "object", "additionalProperties": False,
        "required": ["source_provisional_feature_id", "target_provisional_feature_id", "relationship_type", "supporting_local_feature_refs", "rationale"],
        "properties": {
            "source_provisional_feature_id": {"type": "string"},
            "target_provisional_feature_id": {"type": "string"},
            "relationship_type": {"enum": ["depends_on", "extends", "interacts_with", "potential_conflict"]},
            "supporting_local_feature_refs": {"type": "array", "minItems": 1, "items": {"type": "string"}, "uniqueItems": True},
            "rationale": {"type": "string", "minLength": 1},
        },
    }
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object", "additionalProperties": False,
        "required": [
            "audit_id", "schema_version", "phase", "assignment_id", "attempt_id", "task_thread_id",
            "model", "reasoning_effort", "status", "input_binding", "coverage", "provisional_features",
            "local_feature_memberships", "relationships", "self_attestation",
        ],
        "properties": {
            "audit_id": {"const": AUDIT_ID},
            "schema_version": {"const": "owner-merge-result-v1"},
            "phase": {"const": "owner_domain_shard_merge"},
            "assignment_id": {"type": "string"},
            "attempt_id": {"const": OWNER_ATTEMPT},
            "task_thread_id": {"type": "string", "minLength": 1},
            "model": {"const": "gpt-5.6-sol"},
            "reasoning_effort": {"const": "xhigh"},
            "status": {"const": "completed"},
            "input_binding": {
                "type": "object", "additionalProperties": False,
                "required": ["packet_id", "packet_sha256", "local_feature_refs_digest"],
                "properties": {
                    "packet_id": {"type": "string"},
                    "packet_sha256": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
                    "local_feature_refs_digest": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
                },
            },
            "coverage": {
                "type": "object", "additionalProperties": False,
                "required": ["assigned_local_feature_count", "assigned_local_feature_refs"],
                "properties": {
                    "assigned_local_feature_count": {"type": "integer", "minimum": 1},
                    "assigned_local_feature_refs": {"type": "array", "minItems": 1, "items": {"type": "string"}, "uniqueItems": True},
                },
            },
            "provisional_features": {"type": "array", "minItems": 1, "items": provisional},
            "local_feature_memberships": {"type": "array", "minItems": 1, "items": membership},
            "relationships": {"type": "array", "items": relationship},
            "self_attestation": {
                "type": "object", "additionalProperties": False,
                "required": ["all_local_features_mapped_once", "only_true_synonyms_merged", "distinct_lifecycles_preserved", "gaps_and_non_gaps_preserved", "no_cross_domain_merge", "no_external_or_peer_inputs_used"],
                "properties": {key: {"const": True} for key in [
                    "all_local_features_mapped_once", "only_true_synonyms_merged", "distinct_lifecycles_preserved",
                    "gaps_and_non_gaps_preserved", "no_cross_domain_merge", "no_external_or_peer_inputs_used",
                ]},
            },
        },
    }
