#!/usr/bin/env python3
"""Shared controls for Audit 005 cross-shard same-owner reconciliation."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from macro_v2_common import AUDIT_ID, ROOT, load_obj, sha


CROSS_ROOT = ROOT / "master/cross_shard"
CROSS_OUTPUT_ROOT = ROOT / "cross_shard_v1"
CROSS_EPOCH = "cross-shard-epoch-0001"
CROSS_BATCH = "cross-shard-batch-0001"
CROSS_ATTEMPT = "attempt-0001"
CROSS_CONCURRENCY = 32
MAX_PACKET_BYTES = 750_000
SOL_CONTROLLER = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"
LUNA_CONTROLLER = "019f5078-6501-7223-b52f-2251010bdc41"


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
        row = json.loads(line)
        if not isinstance(row, dict):
            raise RuntimeError(f"non-object JSONL row:{path}:{line_number}")
        rows.append(row)
    return rows


def digest_strings(values: list[str]) -> str:
    return sha(json.dumps(sorted(values), separators=(",", ":"), ensure_ascii=False).encode())


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
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object", "additionalProperties": False,
        "required": [
            "audit_id", "schema_version", "phase", "assignment_id", "attempt_id", "task_thread_id",
            "model", "reasoning_effort", "status", "input_binding", "coverage", "decisions", "self_attestation",
        ],
        "properties": {
            "audit_id": {"const": AUDIT_ID},
            "schema_version": {"const": "cross-shard-result-v1"},
            "phase": {"const": "cross_shard_same_owner_candidate_discovery"},
            "assignment_id": {"type": "string"},
            "attempt_id": {"const": CROSS_ATTEMPT},
            "task_thread_id": {"type": "string", "minLength": 1},
            "model": {"const": "gpt-5.6-sol"},
            "reasoning_effort": {"const": "xhigh"},
            "status": {"const": "completed"},
            "input_binding": {
                "type": "object", "additionalProperties": False,
                "required": ["packet_id", "packet_sha256", "anchor_refs_digest", "comparator_refs_digest"],
                "properties": {
                    "packet_id": {"type": "string"},
                    "packet_sha256": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
                    "anchor_refs_digest": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
                    "comparator_refs_digest": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
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
                "required": [
                    "every_anchor_decided_once", "every_comparator_considered_for_each_anchor",
                    "merge_candidates_require_same_authority_and_lifecycle", "distinct_boundaries_preserved",
                    "same_owner_domain_only", "no_external_or_peer_inputs_used",
                ],
                "properties": {key: {"const": True} for key in [
                    "every_anchor_decided_once", "every_comparator_considered_for_each_anchor",
                    "merge_candidates_require_same_authority_and_lifecycle", "distinct_boundaries_preserved",
                    "same_owner_domain_only", "no_external_or_peer_inputs_used",
                ]},
            },
        },
    }
