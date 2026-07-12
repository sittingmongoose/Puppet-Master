#!/usr/bin/env python3
"""Build a blocked, append-only final aggregate Audit005 closure preparation."""
from __future__ import annotations

import hashlib
import json
import pathlib
import subprocess
from datetime import datetime, timezone
from typing import Any


REPO = pathlib.Path("/Users/jaredsmacbookair/Documents/PuppetMaster")
AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
AUDIT = REPO / "Plans/.audits" / AUDIT_ID
MASTER = AUDIT / "master"
HERE = pathlib.Path(__file__).resolve().parent
HERE_REL = HERE.relative_to(REPO).as_posix()
SHA_PATTERN = "^[0-9a-f]{64}$"

SOURCE_SCOPE_REL = (
    "Plans/.audits/" + AUDIT_ID +
    "/master/macro/frozen/epoch-0016/manifests/source_scope.jsonl"
)

EXPECTED_CHANGED_CANONICAL = [
    "Plans/FinalGUISpec.md",
    "Plans/PRD_Builder.md",
    "Plans/Planning_Wizard.md",
]

DERIVED_INTEGRITY_PATHS = [
    "Plans/.implementation_readiness/buildability_gate_report.json",
    "Plans/.implementation_readiness/pnc019_certification_receipt.json",
    "Plans/.plan_index/acceptance_units.jsonl",
    "Plans/.plan_index/coverage_report.json",
    "Plans/.plan_index/dependencies.json",
    "Plans/.plan_index/doc_cards.json",
    "Plans/.plan_index/node_readiness_report.json",
    "Plans/.plan_index/plan_units.jsonl",
    "Plans/.plan_migration/pds-20260611-002-atomize-planunits/batch_report.jsonl",
    "Plans/.plan_migration/pds-20260611-002-atomize-planunits/final_validation_summary.json",
    "Plans/Spec_Lock.json",
    "Plans/auto_decisions.jsonl",
]

EVIDENCE: dict[str, tuple[str, str]] = {
    "legacy_primary": (
        f"Plans/.audits/{AUDIT_ID}/master/validation/live-coverage/snapshot-0015-primary.json",
        "legacy 63-of-2538 micro-assignment projection",
    ),
    "legacy_coverage": (
        f"Plans/.audits/{AUDIT_ID}/master/live/coverage_state.snapshot-0015.json",
        "legacy live coverage payload preserved without mutation",
    ),
    "macro_active": (
        f"Plans/.audits/{AUDIT_ID}/master/macro/live/ACTIVE.json",
        "current frozen-macro active pointer",
    ),
    "macro_coverage": (
        f"Plans/.audits/{AUDIT_ID}/master/macro/transactions/macro-batch-0012/coverage.snapshot-0012.json",
        "complete frozen-macro semantic-window coverage",
    ),
    "macro_luna": (
        f"Plans/.audits/{AUDIT_ID}/master/macro/validation/macro-batch-0012/luna-postcheckpoint.json",
        "independent frozen-macro checkpoint",
    ),
    "macro_source_scope": (
        SOURCE_SCOPE_REL,
        "frozen 135-document source scope",
    ),
    "feature_active": (
        f"Plans/.audits/{AUDIT_ID}/master/feature_catalog/live/ACTIVE.json",
        "feature catalog active pointer",
    ),
    "feature_independent": (
        f"Plans/.audits/{AUDIT_ID}/master/feature_catalog/validation/catalog-batch-0001/independent-postcheckpoint.json",
        "independent feature catalog checkpoint",
    ),
    "owner_active": (
        f"Plans/.audits/{AUDIT_ID}/master/owner_merge/live/ACTIVE.json",
        "owner merge active pointer",
    ),
    "owner_luna": (
        f"Plans/.audits/{AUDIT_ID}/master/owner_merge/validation/owner-merge-batch-0001/luna-postrun.json",
        "independent owner merge checkpoint",
    ),
    "cross_shard_active": (
        f"Plans/.audits/{AUDIT_ID}/master/cross_shard/live/ACTIVE.json",
        "cross-shard primary checkpoint pointer",
    ),
    "cross_shard_primary_luna": (
        f"Plans/.audits/{AUDIT_ID}/master/cross_shard/validation/cross-shard-batch-0001/luna-postrun.json",
        "cross-shard primary fail-closed semantic findings",
    ),
    "cross_shard_shadow_luna": (
        f"Plans/.audits/{AUDIT_ID}/master/cross_shard_shadow/validation/cross-shard-shadow-batch-0001/luna-postrun.json",
        "cross-shard shadow five-edge semantic quarantine",
    ),
    "cross_cutting_research_luna": (
        f"Plans/.audits/{AUDIT_ID}/master/external_research/sprint-wave-0001/retry-attempt-0007/validation/luna-independent-cumulative-postrun.json",
        "cross-cutting research exact 8-of-8 independent checkpoint",
    ),
    "universal_research_primary": (
        f"Plans/.audits/{AUDIT_ID}/master/external_research/universal-wave-0001/validation/primary-postrun.json",
        "universal research 24-of-24 primary checkpoint",
    ),
    "shadow_v7_preparation": (
        f"Plans/.audits/{AUDIT_ID}/master/external_research/universal-shadow-certification-wave-0001/validation/activation-binding-v7-atomic8/terminal-preparation-report-v7-atomic8.json",
        "historical certification atomic8 preparation only",
    ),
    "shadow_retry_cohort_1": (
        f"Plans/.audits/{AUDIT_ID}/master/external_research/universal-shadow-certification-wave-0001/retry-attempt-0002-v30/cohort-0001/readiness.json",
        "current universal shadow cohort 1 blocked retry preparation",
    ),
    "shadow_retry_cohort_2": (
        f"Plans/.audits/{AUDIT_ID}/master/external_research/universal-shadow-certification-wave-0001/retry-attempt-0002-v30/cohort-0002/readiness.json",
        "current universal shadow cohort 2 blocked retry preparation",
    ),
    "scenario_v1_preparation": (
        f"Plans/.audits/{AUDIT_ID}/master/scenario_adversarial/wave-0001/postrun-validator-v1/terminal-preparation-report.json",
        "historical scenario terminal preparation only",
    ),
    "scenario_cohort_1": (
        f"Plans/.audits/{AUDIT_ID}/master/scenario_adversarial/wave-0001/checkpoints/scenario-cohort-0001-checkpoint-v1.json",
        "scenario cohort 1 independent checkpoint",
    ),
    "scenario_cohort_2": (
        f"Plans/.audits/{AUDIT_ID}/master/scenario_adversarial/wave-0001/postrun-validator-v29-ultra/independent-execution/cohort-0002-luna-postrun.json",
        "scenario cohort 2 independent six-rejection authority",
    ),
    "scenario_late_readiness": (
        f"Plans/.audits/{AUDIT_ID}/master/scenario_adversarial/wave-0001/late-cohorts-0003-0004-activation-preparation-v31-ultra/readiness.json",
        "scenario cohorts 3 and 4 blocked aggregate preparation",
    ),
    "scenario_cohort_3_readiness": (
        f"Plans/.audits/{AUDIT_ID}/master/scenario_adversarial/wave-0001/cohorts/cohort-0003/activation-transaction-v31-ultra-atomic8-preparation/readiness.json",
        "scenario cohort 3 blocked atomic8 preparation",
    ),
    "scenario_cohort_4_readiness": (
        f"Plans/.audits/{AUDIT_ID}/master/scenario_adversarial/wave-0001/cohorts/cohort-0004/activation-transaction-v31-ultra-atomic8-preparation/readiness.json",
        "scenario cohort 4 blocked atomic8 preparation",
    ),
    "cross_domain_aggregate": (
        f"Plans/.audits/{AUDIT_ID}/master/cross_domain_seams/wave-0001/window-sharding-v2/validation/postrun-v1/aggregate-seam-checkpoint-after-repair-v2.json",
        "cross-domain seam exact 64-of-64 aggregate checkpoint",
    ),
    "cross_domain_independent": (
        f"Plans/.audits/{AUDIT_ID}/master/cross_domain_seams/wave-0001/window-sharding-v2/validation/postrun-v1/independent-seam-checkpoint.json",
        "cross-domain seam independent checkpoint",
    ),
    "live_delta_binding": (
        f"Plans/.audits/{AUDIT_ID}/master/final_live_head_delta/final-live-head-delta-0002/source_scope_binding.json",
        "current live-head delta source-scope binding only",
    ),
    "live_delta_binding_check": (
        f"Plans/.audits/{AUDIT_ID}/master/final_live_head_delta/final-live-head-delta-0002/source_scope_binding_receipt.json",
        "non-activation live-head binding check",
    ),
    "policy_v31": (
        f"Plans/.audits/{AUDIT_ID}/master/coordination/CONCURRENCY_POLICY_V31.json",
        "preserved prior pacing-policy lineage",
    ),
    "policy_v32": (
        f"Plans/.audits/{AUDIT_ID}/master/coordination/CONCURRENCY_POLICY_V32.json",
        "prospective active no-execution pacing policy",
    ),
}

EXPECTED_PINNED_HASHES = {
    "scenario_v1_preparation": "188b4ebce79cefef6463315ea12097bd1c17b974618363c2f448baba1075fa27",
    "shadow_v7_preparation": "6a31474c4e6943e812776739cf87a7efeeba6cda1937bc0a94d645cf145839e1",
    "policy_v31": "95de3fd798c857751cc6b031d62a4a7a40abe931f9fa1e49590cff0fec6257b5",
    "policy_v32": "4826ade4c38db47ee184b34e5d7b7bd5ba6cabeecc9baa686cb9d99eeff8a3ed",
}

GENERATED = [
    "source_scope_observation.jsonl",
    "current_live_head_observation.json",
    "pointer_authority_map.json",
    "lane_checkpoint_inventory.json",
    "unresolved_inventory.json",
    "no_canonical_write_attestation.json",
    "aggregate_checkpoint.schema.json",
    "closure_manifest.schema.json",
    "AUTHORITY.json",
    "closure_manifest.candidate.json",
    "readiness.json",
    "hash_bundle.json",
]


def canonical_bytes(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def sha_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha_file(path: pathlib.Path) -> str:
    return sha_bytes(path.read_bytes())


def dump(path: pathlib.Path, value: Any) -> None:
    if path.exists():
        raise SystemExit(f"refusing overwrite: {path}")
    if path.parent != HERE:
        raise SystemExit(f"write escaped namespace: {path}")
    path.write_bytes(canonical_bytes(value))


def dump_jsonl(path: pathlib.Path, rows: list[dict[str, Any]]) -> None:
    if path.exists():
        raise SystemExit(f"refusing overwrite: {path}")
    if path.parent != HERE:
        raise SystemExit(f"write escaped namespace: {path}")
    path.write_bytes(b"".join(canonical_bytes(row) for row in rows))


def load_json(rel: str) -> dict[str, Any]:
    return json.loads((REPO / rel).read_text())


def evidence_row(key: str) -> dict[str, Any]:
    rel, role = EVIDENCE[key]
    path = REPO / rel
    if not path.is_file():
        raise SystemExit(f"missing evidence: {rel}")
    return {
        "evidence_id": key,
        "path": rel,
        "sha256": sha_file(path),
        "byte_count": path.stat().st_size,
        "role": role,
    }


def git_head_bytes(rel: str) -> bytes:
    return subprocess.run(
        ["git", "show", f"HEAD:{rel}"],
        cwd=REPO,
        check=True,
        capture_output=True,
    ).stdout


def object_schema(properties: dict[str, Any], required: list[str] | None = None) -> dict[str, Any]:
    return {
        "type": "object",
        "additionalProperties": False,
        "required": required or list(properties),
        "properties": properties,
    }


def ref_schema(nullable: bool = False) -> dict[str, Any]:
    base = object_schema({
        "ref": {"type": "string", "minLength": 1},
        "sha256": {"type": "string", "pattern": SHA_PATTERN},
    })
    return {"oneOf": [base, {"type": "null"}]} if nullable else base


def closure_schema() -> dict[str, Any]:
    zero = object_schema({
        key: {"const": 0}
        for key in ("launches", "activations", "results", "receipts", "native_capture_rows", "credit", "canonical_plan_writes")
    })
    lane = object_schema({
        "lane_id": {"type": "string", "pattern": "^[a-z0-9_]+$"},
        "closure_gate": {"type": "boolean"},
        "status": {"enum": [
            "lineage_only_superseded",
            "satisfied",
            "satisfied_frozen_scope",
            "satisfied_checkpoint_zero_promotion",
            "blocking",
        ]},
        "aggregate_credit_granted": {"const": 0},
        "evidence": {"type": "array", "minItems": 1, "uniqueItems": True, "items": ref_schema()},
    })
    schema = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": "urn:puppetmaster:audit005:final-aggregate-closure-manifest:v1",
        **object_schema({
            "schema_version": {"const": "audit005-final-aggregate-closure-manifest-v1"},
            "manifest_kind": {"enum": ["blocked_preparation", "terminal_audit_closure"]},
            "audit_id": {"const": AUDIT_ID},
            "transaction_id": {"type": "string", "pattern": "^final-aggregate-certification-[a-z0-9-]+$"},
            "status": {"enum": ["BLOCKED_UNRESOLVED_PREREQUISITES", "PASS_CERTIFIED"]},
            "closure_authorized": {"type": "boolean"},
            "issued": {"type": "boolean"},
            "authority": ref_schema(),
            "pointer_taxonomy": object_schema({
                "legacy": object_schema({
                    "authority_type": {"const": "legacy_micro_assignment_projection"},
                    "ref": {"type": "string"},
                    "sha256": {"type": "string", "pattern": SHA_PATTERN},
                    "disposition": {"const": "SUPERSEDED_LINEAGE_ONLY_NOT_AGGREGATE_PROGRESS_AUTHORITY"},
                    "credited_assignments": {"const": 63},
                    "assignment_total": {"const": 2538},
                    "pending_assignments": {"const": 2475},
                    "mutated": {"const": False},
                }),
                "frozen_macro": object_schema({
                    "authority_type": {"const": "frozen_macro_coverage_head"},
                    "active_ref": {"type": "string"},
                    "active_sha256": {"type": "string", "pattern": SHA_PATTERN},
                    "coverage_ref": {"type": "string"},
                    "coverage_sha256": {"type": "string", "pattern": SHA_PATTERN},
                    "source_scope_ref": {"type": "string"},
                    "source_scope_sha256": {"type": "string", "pattern": SHA_PATTERN},
                    "status": {"const": "complete_on_frozen_source_scope"},
                    "covered_micro_windows": {"const": 1269},
                    "micro_window_total": {"const": 1269},
                    "credited_macro_assignments": {"const": 256},
                }),
                "current_live_head": object_schema({
                    "authority_type": {"const": "current_live_head_delta_state"},
                    "status": {"enum": ["delta_certification_required", "delta_certified"]},
                    "observation_ref": {"type": "string"},
                    "observation_sha256": {"type": "string", "pattern": SHA_PATTERN},
                    "source_scope_rows": {"const": 135},
                    "changed_canonical_count": {"const": 3},
                    "changed_canonical_paths": {
                        "type": "array", "minItems": 3, "maxItems": 3, "uniqueItems": True,
                        "items": {"enum": EXPECTED_CHANGED_CANONICAL},
                    },
                    "derived_integrity_count": {"const": 12},
                    "delta_certification": ref_schema(nullable=True),
                }),
            }),
            "lane_checkpoints": {"type": "array", "minItems": 14, "maxItems": 14, "items": lane},
            "unresolved": object_schema({
                "inventory_ref": {"type": "string"},
                "inventory_sha256": {"type": "string", "pattern": SHA_PATTERN},
                "count": {"type": "integer", "minimum": 0},
                "blocker_ids": {"type": "array", "uniqueItems": True, "items": {"type": "string"}},
            }),
            "no_canonical_write": object_schema({
                "attestation_ref": {"type": "string"},
                "attestation_sha256": {"type": "string", "pattern": SHA_PATTERN},
                "attested": {"const": True},
                "canonical_plan_writes": {"const": 0},
            }),
            "independent_checkpoint": object_schema({
                "present": {"type": "boolean"},
                "checkpoint": ref_schema(nullable=True),
                "status": {"oneOf": [{"enum": ["PASS", "FAIL_CLOSED"]}, {"type": "null"}]},
                "fresh_direct": {"type": "boolean"},
                "model": {"oneOf": [{"const": "gpt-5.6-luna"}, {"type": "null"}]},
                "reasoning_effort": {"oneOf": [{"const": "max"}, {"type": "null"}]},
            }),
            "preparation_only_lineage": {
                "type": "array", "minItems": 2, "maxItems": 2, "uniqueItems": True,
                "items": object_schema({
                    "ref": {"type": "string"},
                    "sha256": {"type": "string", "pattern": SHA_PATTERN},
                    "classification": {"const": "PREPARATION_ONLY_NOT_CLOSURE_EVIDENCE"},
                }),
            },
            "current_pacing_policy": object_schema({
                "current": ref_schema(),
                "current_role": {"const": "PROSPECTIVE_ACTIVE_NO_EXECUTION_UNSEALED"},
                "sealed": {"type": "boolean"},
                "seal_evidence": ref_schema(nullable=True),
                "prior_lineage": ref_schema(),
                "prior_lineage_mutated": {"const": False},
            }),
            "durable_hash_bundle": object_schema({
                "ref": {"type": "string"},
                "bundle_root_sha256": {"oneOf": [{"type": "string", "pattern": SHA_PATTERN}, {"type": "null"}]},
            }),
            "zero_state": zero,
        }),
        "allOf": [
            {
                "if": {"properties": {"manifest_kind": {"const": "blocked_preparation"}}},
                "then": {
                    "properties": {
                        "status": {"const": "BLOCKED_UNRESOLVED_PREREQUISITES"},
                        "closure_authorized": {"const": False},
                        "issued": {"const": False},
                        "unresolved": {"properties": {"count": {"minimum": 1}}},
                        "independent_checkpoint": {
                            "properties": {
                                "present": {"const": False}, "checkpoint": {"type": "null"},
                                "status": {"type": "null"}, "fresh_direct": {"const": False},
                                "model": {"type": "null"}, "reasoning_effort": {"type": "null"},
                            }
                        },
                        "durable_hash_bundle": {"properties": {"bundle_root_sha256": {"type": "null"}}},
                    }
                },
            },
            {
                "if": {"properties": {"manifest_kind": {"const": "terminal_audit_closure"}}},
                "then": {
                    "properties": {
                        "status": {"const": "PASS_CERTIFIED"},
                        "closure_authorized": {"const": True},
                        "issued": {"const": True},
                        "unresolved": {
                            "properties": {"count": {"const": 0}, "blocker_ids": {"maxItems": 0}}
                        },
                        "pointer_taxonomy": {
                            "properties": {"current_live_head": {
                                "properties": {
                                    "status": {"const": "delta_certified"},
                                    "delta_certification": ref_schema(),
                                }
                            }}
                        },
                        "independent_checkpoint": {
                            "properties": {
                                "present": {"const": True}, "checkpoint": ref_schema(),
                                "status": {"const": "PASS"}, "fresh_direct": {"const": True},
                                "model": {"const": "gpt-5.6-luna"}, "reasoning_effort": {"const": "max"},
                            }
                        },
                        "current_pacing_policy": {
                            "properties": {"sealed": {"const": True}, "seal_evidence": ref_schema()}
                        },
                        "durable_hash_bundle": {
                            "properties": {"bundle_root_sha256": {"type": "string", "pattern": SHA_PATTERN}}
                        },
                    }
                },
            },
        ],
    }
    return schema


def checkpoint_schema() -> dict[str, Any]:
    zero_side_effects = object_schema({
        key: {"const": 0}
        for key in ("launches", "activations", "result_writes", "receipt_writes", "native_capture_writes", "credit_side_effects", "canonical_plan_writes")
    })
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": "urn:puppetmaster:audit005:final-aggregate-independent-checkpoint:v1",
        **object_schema({
            "schema_version": {"const": "audit005-final-aggregate-independent-checkpoint-v1"},
            "audit_id": {"const": AUDIT_ID},
            "status": {"enum": ["PASS", "FAIL_CLOSED"]},
            "reviewer": object_schema({
                "reviewer_id": {"type": "string", "minLength": 1},
                "agent_path": {"type": "string", "pattern": "^/root/"},
                "native_thread_id": {"type": "string", "minLength": 1},
                "model": {"const": "gpt-5.6-luna"},
                "reasoning_effort": {"const": "max"},
                "fresh_direct": {"const": True},
                "fork_turns": {"const": "none"},
                "descendants": {"const": 0},
                "followups": {"const": 0},
                "retries": {"const": 0},
            }),
            "manifest": ref_schema(),
            "hash_bundle": object_schema({
                "ref": {"type": "string"},
                "raw_sha256": {"type": "string", "pattern": SHA_PATTERN},
                "bundle_root_sha256": {"type": "string", "pattern": SHA_PATTERN},
            }),
            "recomputed": object_schema({
                "legacy_supersession_valid": {"type": "boolean"},
                "frozen_macro_complete": {"type": "boolean"},
                "current_live_head_delta_certified": {"type": "boolean"},
                "all_closure_gates_satisfied": {"type": "boolean"},
                "current_pacing_policy_sealed": {"type": "boolean"},
                "unresolved_count": {"type": "integer", "minimum": 0},
                "blocker_ids": {"type": "array", "uniqueItems": True, "items": {"type": "string"}},
                "hash_errors": {"type": "array", "uniqueItems": True, "items": {"type": "string"}},
                "schema_errors": {"type": "array", "uniqueItems": True, "items": {"type": "string"}},
            }),
            "side_effects": zero_side_effects,
        }),
        "allOf": [{
            "if": {"properties": {"status": {"const": "PASS"}}},
            "then": {"properties": {"recomputed": {"properties": {
                "legacy_supersession_valid": {"const": True},
                "frozen_macro_complete": {"const": True},
                "current_live_head_delta_certified": {"const": True},
                "all_closure_gates_satisfied": {"const": True},
                "current_pacing_policy_sealed": {"const": True},
                "unresolved_count": {"const": 0},
                "blocker_ids": {"maxItems": 0},
                "hash_errors": {"maxItems": 0},
                "schema_errors": {"maxItems": 0},
            }}}},
        }],
    }


def main() -> None:
    if any((HERE / name).exists() for name in GENERATED):
        raise SystemExit("append-only namespace already generated")

    observed_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    external = [evidence_row(key) for key in EVIDENCE]
    evidence_by_id = {row["evidence_id"]: row for row in external}
    for key, expected in EXPECTED_PINNED_HASHES.items():
        if evidence_by_id[key]["sha256"] != expected:
            raise SystemExit(f"pinned evidence drift: {key}")

    source_scope_path = REPO / SOURCE_SCOPE_REL
    source_scope_rows = [json.loads(line) for line in source_scope_path.read_text().splitlines() if line.strip()]
    if len(source_scope_rows) != 135:
        raise SystemExit("unexpected frozen source scope cardinality")
    observations: list[dict[str, Any]] = []
    for ordinal, row in enumerate(source_scope_rows, 1):
        rel = row["path"]
        live_path = REPO / rel
        if not live_path.is_file():
            raise SystemExit(f"missing live source: {rel}")
        live_sha = sha_file(live_path)
        observations.append({
            "ordinal": ordinal,
            "path": rel,
            "source_id": row["source_id"],
            "frozen_source_sha256": row["source_sha256"],
            "live_source_sha256": live_sha,
            "live_byte_count": live_path.stat().st_size,
            "changed_since_frozen_macro": live_sha != row["source_sha256"],
            "role": "canonical_source_observation_read_only",
        })
    changed = sorted(row["path"] for row in observations if row["changed_since_frozen_macro"])
    if changed != EXPECTED_CHANGED_CANONICAL:
        raise SystemExit(f"unexpected current canonical delta: {changed}")
    dump_jsonl(HERE / "source_scope_observation.jsonl", observations)

    derived_rows = []
    for rel in DERIVED_INTEGRITY_PATHS:
        live = REPO / rel
        if not live.is_file():
            raise SystemExit(f"missing derived integrity file: {rel}")
        head_bytes = git_head_bytes(rel)
        derived_rows.append({
            "path": rel,
            "role": "derived_integrity_join_evidence_not_canonical_semantic_assignment",
            "git_head_sha256": sha_bytes(head_bytes),
            "live_sha256": sha_file(live),
            "live_byte_count": live.stat().st_size,
            "changed_from_git_head": head_bytes != live.read_bytes(),
        })
    if len(derived_rows) != 12 or not all(row["changed_from_git_head"] for row in derived_rows):
        raise SystemExit("derived integrity delta is not exact 12-of-12")
    canonical_digest = sha_bytes(b"".join(
        f"{row['path']}\0{row['live_source_sha256']}\n".encode()
        for row in sorted(observations, key=lambda item: item["path"])
    ))
    delta_digest = sha_bytes(canonical_bytes({
        "canonical": [{"path": row["path"], "sha256": row["live_source_sha256"]} for row in observations if row["changed_since_frozen_macro"]],
        "derived": [{"path": row["path"], "sha256": row["live_sha256"]} for row in derived_rows],
    }))
    live_head = {
        "schema_version": "audit005-current-live-head-observation-v1",
        "audit_id": AUDIT_ID,
        "observed_at_utc": observed_at,
        "authority_type": "current_live_head_delta_state",
        "status": "BLOCKED_DELTA_CERTIFICATION_REQUIRED",
        "frozen_source_scope": {
            "ref": SOURCE_SCOPE_REL,
            "sha256": sha_file(source_scope_path),
            "rows": 135,
        },
        "canonical_source_observation": {
            "ref": f"{HERE_REL}/source_scope_observation.jsonl",
            "sha256": sha_file(HERE / "source_scope_observation.jsonl"),
            "live_scope_digest": canonical_digest,
            "unchanged_count": 132,
            "changed_count": 3,
            "changed_paths": changed,
            "changed_rows": [row for row in observations if row["changed_since_frozen_macro"]],
        },
        "derived_integrity_observation": {
            "count": 12,
            "changed_count": 12,
            "rows": derived_rows,
        },
        "combined_delta_file_count": 15,
        "combined_delta_digest": delta_digest,
        "semantic_delta_certification_present": False,
        "semantic_delta_certification_ref": None,
        "canonical_files_written_by_preparation": 0,
    }
    dump(HERE / "current_live_head_observation.json", live_head)

    legacy = load_json(EVIDENCE["legacy_primary"][0])
    legacy_coverage = load_json(EVIDENCE["legacy_coverage"][0])
    macro_active = load_json(EVIDENCE["macro_active"][0])
    macro_coverage = load_json(EVIDENCE["macro_coverage"][0])
    macro_luna = load_json(EVIDENCE["macro_luna"][0])
    if (legacy.get("credited_assignments"), legacy.get("pending_assignments")) != (63, 2475):
        raise SystemExit("legacy projection counts drifted")
    if legacy_coverage.get("accepted_assignments") != 63 or legacy_coverage.get("substantive_coverage_credit") != 63:
        raise SystemExit("legacy coverage registry cardinality drifted")
    if not (
        macro_coverage.get("complete") is True
        and macro_coverage.get("covered_micro_windows") == 1269
        and macro_coverage.get("micro_window_total") == 1269
        and macro_coverage.get("credited_macro_assignments") == 256
        and macro_luna.get("status") == "pass"
    ):
        raise SystemExit("frozen macro head is not exact complete state")

    pointer_map = {
        "schema_version": "audit005-aggregate-pointer-authority-map-v1",
        "audit_id": AUDIT_ID,
        "status": "BLOCKED_TYPED_AUTHORITY_CHAIN_CURRENT_LIVE_DELTA_UNCERTIFIED",
        "supersession_semantics": "append_only_authority_supersession_without_predecessor_mutation",
        "legacy": {
            "authority_type": "legacy_micro_assignment_projection",
            "ref": evidence_by_id["legacy_primary"]["path"],
            "sha256": evidence_by_id["legacy_primary"]["sha256"],
            "coverage_payload_ref": evidence_by_id["legacy_coverage"]["path"],
            "coverage_payload_sha256": evidence_by_id["legacy_coverage"]["sha256"],
            "credited_assignments": 63,
            "assignment_total": 2538,
            "pending_assignments": 2475,
            "disposition": "SUPERSEDED_LINEAGE_ONLY_NOT_AGGREGATE_PROGRESS_AUTHORITY",
            "mutated": False,
            "aggregate_progress_credit": 0,
        },
        "frozen_macro": {
            "authority_type": "frozen_macro_coverage_head",
            "active_ref": evidence_by_id["macro_active"]["path"],
            "active_sha256": evidence_by_id["macro_active"]["sha256"],
            "coverage_ref": evidence_by_id["macro_coverage"]["path"],
            "coverage_sha256": evidence_by_id["macro_coverage"]["sha256"],
            "independent_checkpoint_ref": evidence_by_id["macro_luna"]["path"],
            "independent_checkpoint_sha256": evidence_by_id["macro_luna"]["sha256"],
            "source_scope_ref": SOURCE_SCOPE_REL,
            "source_scope_sha256": sha_file(source_scope_path),
            "status": "complete_on_frozen_source_scope",
            "covered_micro_windows": 1269,
            "micro_window_total": 1269,
            "credited_macro_assignments": 256,
            "pending_micro_windows": 0,
            "not_current_live_head_authority": True,
        },
        "current_live_head": {
            "authority_type": "current_live_head_delta_state",
            "observation_ref": f"{HERE_REL}/current_live_head_observation.json",
            "observation_sha256": sha_file(HERE / "current_live_head_observation.json"),
            "status": "delta_certification_required",
            "source_scope_rows": 135,
            "changed_canonical_count": 3,
            "changed_canonical_paths": changed,
            "derived_integrity_count": 12,
            "combined_delta_file_count": 15,
            "delta_certification": None,
            "aggregate_closure_authority": False,
        },
        "authority_order": [
            "legacy_micro_assignment_projection:lineage_only",
            "frozen_macro_coverage_head:complete_on_frozen_source_scope",
            "current_live_head_delta_state:blocked_until_delta_certified",
        ],
        "old_artifacts_mutated": False,
        "closure_credit": 0,
    }
    dump(HERE / "pointer_authority_map.json", pointer_map)

    def refs(*keys: str) -> list[dict[str, str]]:
        return [{"ref": evidence_by_id[key]["path"], "sha256": evidence_by_id[key]["sha256"]} for key in keys]

    lanes = [
        {"lane_id": "legacy_micro_projection", "closure_gate": False, "status": "lineage_only_superseded", "aggregate_credit_granted": 0, "evidence": refs("legacy_primary", "legacy_coverage"), "finding": "63/2538 remains immutable lineage and is not aggregate progress authority"},
        {"lane_id": "frozen_macro_semantic_coverage", "closure_gate": True, "status": "satisfied_frozen_scope", "aggregate_credit_granted": 0, "evidence": refs("macro_active", "macro_coverage", "macro_luna"), "finding": "1269/1269 micro windows and 256 macro assignments complete on the frozen scope"},
        {"lane_id": "current_live_head_delta", "closure_gate": True, "status": "blocking", "aggregate_credit_granted": 0, "evidence": refs("live_delta_binding", "live_delta_binding_check"), "finding": "3 canonical semantic files plus 12 derived joins remain uncertified at the live head"},
        {"lane_id": "feature_catalog", "closure_gate": True, "status": "satisfied", "aggregate_credit_granted": 0, "evidence": refs("feature_active", "feature_independent"), "finding": "6091 atoms map to 4131 local features"},
        {"lane_id": "owner_merge", "closure_gate": True, "status": "satisfied", "aggregate_credit_granted": 0, "evidence": refs("owner_active", "owner_luna"), "finding": "4131 local features map to 3888 provisional features"},
        {"lane_id": "cross_shard_adjudication", "closure_gate": True, "status": "blocking", "aggregate_credit_granted": 0, "evidence": refs("cross_shard_active", "cross_shard_primary_luna", "cross_shard_shadow_luna"), "finding": "5 merge-candidate edges remain semantically quarantined"},
        {"lane_id": "cross_cutting_research", "closure_gate": True, "status": "satisfied", "aggregate_credit_granted": 0, "evidence": refs("cross_cutting_research_luna"), "finding": "fresh independent cumulative checkpoint is exact 8/8"},
        {"lane_id": "universal_research_primary", "closure_gate": True, "status": "satisfied", "aggregate_credit_granted": 0, "evidence": refs("universal_research_primary"), "finding": "primary universal research is 24/24 over 3888 features"},
        {"lane_id": "universal_research_shadow_certification", "closure_gate": True, "status": "blocking", "aggregate_credit_granted": 0, "evidence": refs("shadow_v7_preparation", "shadow_retry_cohort_1", "shadow_retry_cohort_2"), "finding": "16 corrected retry assignments remain blocked behind fresh independent gates"},
        {"lane_id": "scenario_cohort_0001", "closure_gate": True, "status": "satisfied_checkpoint_zero_promotion", "aggregate_credit_granted": 0, "evidence": refs("scenario_cohort_1"), "finding": "cohort 0001 checkpoint is exact 8/8 over 823 features"},
        {"lane_id": "scenario_cohort_0002", "closure_gate": True, "status": "blocking", "aggregate_credit_granted": 0, "evidence": refs("scenario_v1_preparation", "scenario_cohort_2"), "finding": "cohort 0002 is fail-closed with 2 eligible and 6 rejected"},
        {"lane_id": "scenario_cohorts_0003_0004", "closure_gate": True, "status": "blocking", "aggregate_credit_granted": 0, "evidence": refs("scenario_late_readiness", "scenario_cohort_3_readiness", "scenario_cohort_4_readiness"), "finding": "16 atomic assignments covering 2248 features remain preparation-only and unactivated"},
        {"lane_id": "cross_domain_seams", "closure_gate": True, "status": "satisfied_checkpoint_zero_promotion", "aggregate_credit_granted": 0, "evidence": refs("cross_domain_aggregate", "cross_domain_independent"), "finding": "exact 64/64 seam checkpoint is ready with zero promotion"},
        {"lane_id": "aggregate_independent_verifier", "closure_gate": True, "status": "blocking", "aggregate_credit_granted": 0, "evidence": refs("policy_v32"), "finding": "fresh final aggregate checkpoint is absent and V32 is prospective active but unsealed"},
    ]
    lane_inventory = {
        "schema_version": "audit005-final-aggregate-lane-inventory-v1",
        "audit_id": AUDIT_ID,
        "status": "BLOCKED_MIXED_SATISFIED_AND_UNRESOLVED_GATES",
        "lane_count": len(lanes),
        "closure_gate_count": sum(row["closure_gate"] for row in lanes),
        "blocking_lane_count": sum(row["status"] == "blocking" for row in lanes),
        "lanes": lanes,
        "aggregate_credit_granted": 0,
    }
    dump(HERE / "lane_checkpoint_inventory.json", lane_inventory)

    blockers = [
        {"blocker_id": "A005-AGG-B001", "lane_id": "current_live_head_delta", "state": "BLOCKED_DELTA_CERTIFICATION_REQUIRED", "evidence": refs("live_delta_binding", "live_delta_binding_check"), "facts": {"changed_canonical_files": 3, "derived_integrity_files": 12, "semantic_packets": 0, "results": 0, "receipts": 0, "native_capture_rows": 0, "credit": 0}, "satisfaction_condition": "fresh independently checkpointed semantic delta review plus affected joins for the exact bound live hashes"},
        {"blocker_id": "A005-AGG-B002", "lane_id": "cross_shard_adjudication", "state": "FAIL_CLOSED_FIVE_SEMANTICALLY_QUARANTINED_EDGES", "evidence": refs("cross_shard_primary_luna", "cross_shard_shadow_luna"), "facts": {"quarantined_candidate_edges": 5, "merge_promotion_credit": 0}, "satisfaction_condition": "append-only adjudication of all five exact edges with primary and fresh independent agreement"},
        {"blocker_id": "A005-AGG-B003", "lane_id": "universal_research_shadow_certification", "state": "BLOCKED_RETRY_PREPARATION_ONLY", "evidence": refs("shadow_v7_preparation", "shadow_retry_cohort_1", "shadow_retry_cohort_2"), "facts": {"assignments": 16, "features": 3888, "activation_transactions": 0, "results": 0, "receipts": 0, "native_capture_rows": 0, "credit": 0}, "satisfaction_condition": "corrected atomic8 cohorts pass all required fresh independent gates, execute, and receive terminal independent certification"},
        {"blocker_id": "A005-AGG-B004", "lane_id": "scenario_cohort_0002", "state": "FAIL_CLOSED_EXACT_SIX_ASSIGNMENT_REPAIR_REQUIRED", "evidence": refs("scenario_v1_preparation", "scenario_cohort_2"), "facts": {"eligible": 2, "rejected": 6, "credit": 0}, "satisfaction_condition": "exact six-assignment repair and fresh independent terminal checkpoint"},
        {"blocker_id": "A005-AGG-B005", "lane_id": "scenario_cohorts_0003_0004", "state": "BLOCKED_PREPARATION_ONLY_ZERO_STATE", "evidence": refs("scenario_late_readiness", "scenario_cohort_3_readiness", "scenario_cohort_4_readiness"), "facts": {"assignments": 16, "features": 2248, "activation_transactions": 0, "results": 0, "receipts": 0, "native_capture_rows": 0, "credit": 0}, "satisfaction_condition": "cohort 0002 closes first, then separate sealed atomic8 transactions and fresh independent checkpoints close cohorts 0003 and 0004"},
        {"blocker_id": "A005-AGG-B006", "lane_id": "aggregate_independent_verifier", "state": "PROSPECTIVE_V32_ACTIVE_NO_EXECUTION_POLICY_UNSEALED", "evidence": refs("policy_v31", "policy_v32"), "facts": {"current_policy_sha256": EXPECTED_PINNED_HASHES["policy_v32"], "prior_lineage_sha256": EXPECTED_PINNED_HASHES["policy_v31"], "sealed": False, "seal_evidence": None, "activation_credit": 0}, "satisfaction_condition": "a later append-only authority seals the applicable pacing/activation policy without mutating V31 lineage"},
        {"blocker_id": "A005-AGG-B007", "lane_id": "aggregate_independent_verifier", "state": "FINAL_FRESH_INDEPENDENT_AGGREGATE_CHECKPOINT_ABSENT", "evidence": refs("policy_v32"), "facts": {"checkpoint_present": False, "launches": 0, "results": 0, "receipts": 0, "native_capture_rows": 0, "credit": 0}, "satisfaction_condition": "after every prior blocker is closed, a fresh direct Luna/max verifier recomputes the entire closure manifest and durable hash bundle"},
    ]
    unresolved = {
        "schema_version": "audit005-final-aggregate-unresolved-inventory-v1",
        "audit_id": AUDIT_ID,
        "status": "BLOCKED_EXACT_UNRESOLVED_INVENTORY",
        "blocker_count": len(blockers),
        "blocker_ids": [row["blocker_id"] for row in blockers],
        "blockers": blockers,
        "preparation_only_nonclosure_pins": [
            {"ref": evidence_by_id["scenario_v1_preparation"]["path"], "sha256": evidence_by_id["scenario_v1_preparation"]["sha256"], "classification": "PREPARATION_ONLY_NOT_CLOSURE_EVIDENCE", "mutated": False},
            {"ref": evidence_by_id["shadow_v7_preparation"]["path"], "sha256": evidence_by_id["shadow_v7_preparation"]["sha256"], "classification": "PREPARATION_ONLY_NOT_CLOSURE_EVIDENCE", "mutated": False},
        ],
        "policy_lineage": {
            "current": {"ref": evidence_by_id["policy_v32"]["path"], "sha256": evidence_by_id["policy_v32"]["sha256"], "role": "PROSPECTIVE_ACTIVE_NO_EXECUTION_UNSEALED", "sealed": False, "seal_evidence": None},
            "prior": {"ref": evidence_by_id["policy_v31"]["path"], "sha256": evidence_by_id["policy_v31"]["sha256"], "role": "PRESERVED_LINEAGE", "mutated": False},
        },
        "closure_authorized": False,
        "aggregate_credit": 0,
    }
    dump(HERE / "unresolved_inventory.json", unresolved)

    no_write = {
        "schema_version": "audit005-final-aggregate-no-canonical-write-attestation-v1",
        "audit_id": AUDIT_ID,
        "status": "ATTESTED_PREPARATION_SCOPE_ONLY",
        "writer_task": "/root/sol_controller_v29/v31_final_audit_closure_prep",
        "authorized_write_root": HERE_REL,
        "canonical_plan_write_authorized": False,
        "canonical_plan_writes": 0,
        "existing_audit_artifacts_mutated": 0,
        "preexisting_live_delta_observed_only": True,
        "source_scope_observation_ref": f"{HERE_REL}/source_scope_observation.jsonl",
        "source_scope_observation_sha256": sha_file(HERE / "source_scope_observation.jsonl"),
        "current_live_head_observation_ref": f"{HERE_REL}/current_live_head_observation.json",
        "current_live_head_observation_sha256": sha_file(HERE / "current_live_head_observation.json"),
        "observed_live_source_scope_digest": canonical_digest,
        "observed_live_delta_digest": delta_digest,
        "changed_canonical_paths": changed,
        "attested": True,
    }
    dump(HERE / "no_canonical_write_attestation.json", no_write)

    dump(HERE / "aggregate_checkpoint.schema.json", checkpoint_schema())
    dump(HERE / "closure_manifest.schema.json", closure_schema())

    authority = {
        "schema_version": "audit005-final-aggregate-certification-prep-authority-v1",
        "audit_id": AUDIT_ID,
        "transaction_id": "final-aggregate-certification-prep-0001",
        "status": "BLOCKED_PREPARATION_ONLY_UNRESOLVED_GATES",
        "authority_role": "schema_validator_and_closure_manifest_preparation_only",
        "write_scope": HERE_REL,
        "append_only": True,
        "canonical_plan_writes_authorized": False,
        "existing_artifact_mutation_authorized": False,
        "legacy_63_of_2538_pointer_mutated": False,
        "legacy_pointer_superseded_for_aggregate_progress": True,
        "typed_authority_chain_ref": f"{HERE_REL}/pointer_authority_map.json",
        "typed_authority_chain_sha256": sha_file(HERE / "pointer_authority_map.json"),
        "lane_inventory_ref": f"{HERE_REL}/lane_checkpoint_inventory.json",
        "lane_inventory_sha256": sha_file(HERE / "lane_checkpoint_inventory.json"),
        "unresolved_inventory_ref": f"{HERE_REL}/unresolved_inventory.json",
        "unresolved_inventory_sha256": sha_file(HERE / "unresolved_inventory.json"),
        "no_canonical_write_attestation_ref": f"{HERE_REL}/no_canonical_write_attestation.json",
        "no_canonical_write_attestation_sha256": sha_file(HERE / "no_canonical_write_attestation.json"),
        "schemas": {
            "closure_manifest": {"ref": f"{HERE_REL}/closure_manifest.schema.json", "sha256": sha_file(HERE / "closure_manifest.schema.json"), "engine": "jsonschema.Draft202012Validator"},
            "independent_checkpoint": {"ref": f"{HERE_REL}/aggregate_checkpoint.schema.json", "sha256": sha_file(HERE / "aggregate_checkpoint.schema.json"), "engine": "jsonschema.Draft202012Validator"},
        },
        "logic": {
            "builder": {"ref": f"{HERE_REL}/build_prep.py", "sha256": sha_file(HERE / "build_prep.py")},
            "verifier": {"ref": f"{HERE_REL}/verify_final_aggregate_closure_prep.py", "sha256": sha_file(HERE / "verify_final_aggregate_closure_prep.py")},
            "tests": {"ref": f"{HERE_REL}/test_final_aggregate_closure_prep.py", "sha256": sha_file(HERE / "test_final_aggregate_closure_prep.py")},
        },
        "policy_binding": {
            "current": {"ref": evidence_by_id["policy_v32"]["path"], "sha256": evidence_by_id["policy_v32"]["sha256"], "role": "PROSPECTIVE_ACTIVE_NO_EXECUTION_UNSEALED", "sealed": False},
            "prior_lineage": {"ref": evidence_by_id["policy_v31"]["path"], "sha256": evidence_by_id["policy_v31"]["sha256"], "mutated": False},
        },
        "preparation_only_pins": unresolved["preparation_only_nonclosure_pins"],
        "blocker_count": len(blockers),
        "closure_manifest_issuance_authorized": False,
        "independent_checkpoint_present": False,
        "hash_bundle_ref": f"{HERE_REL}/hash_bundle.json",
        "zero_state": {"launches": 0, "activations": 0, "results": 0, "receipts": 0, "native_capture_rows": 0, "credit": 0, "canonical_plan_writes": 0},
    }
    dump(HERE / "AUTHORITY.json", authority)

    candidate_lanes = [
        {key: row[key] for key in ("lane_id", "closure_gate", "status", "aggregate_credit_granted", "evidence")}
        for row in lanes
    ]
    candidate = {
        "schema_version": "audit005-final-aggregate-closure-manifest-v1",
        "manifest_kind": "blocked_preparation",
        "audit_id": AUDIT_ID,
        "transaction_id": "final-aggregate-certification-prep-0001",
        "status": "BLOCKED_UNRESOLVED_PREREQUISITES",
        "closure_authorized": False,
        "issued": False,
        "authority": {"ref": f"{HERE_REL}/AUTHORITY.json", "sha256": sha_file(HERE / "AUTHORITY.json")},
        "pointer_taxonomy": {
            "legacy": {key: pointer_map["legacy"][key] for key in ("authority_type", "ref", "sha256", "disposition", "credited_assignments", "assignment_total", "pending_assignments", "mutated")},
            "frozen_macro": {key: pointer_map["frozen_macro"][key] for key in ("authority_type", "active_ref", "active_sha256", "coverage_ref", "coverage_sha256", "source_scope_ref", "source_scope_sha256", "status", "covered_micro_windows", "micro_window_total", "credited_macro_assignments")},
            "current_live_head": {key: pointer_map["current_live_head"][key] for key in ("authority_type", "status", "observation_ref", "observation_sha256", "source_scope_rows", "changed_canonical_count", "changed_canonical_paths", "derived_integrity_count", "delta_certification")},
        },
        "lane_checkpoints": candidate_lanes,
        "unresolved": {
            "inventory_ref": f"{HERE_REL}/unresolved_inventory.json",
            "inventory_sha256": sha_file(HERE / "unresolved_inventory.json"),
            "count": len(blockers),
            "blocker_ids": [row["blocker_id"] for row in blockers],
        },
        "no_canonical_write": {
            "attestation_ref": f"{HERE_REL}/no_canonical_write_attestation.json",
            "attestation_sha256": sha_file(HERE / "no_canonical_write_attestation.json"),
            "attested": True,
            "canonical_plan_writes": 0,
        },
        "independent_checkpoint": {"present": False, "checkpoint": None, "status": None, "fresh_direct": False, "model": None, "reasoning_effort": None},
        "preparation_only_lineage": [
            {key: row[key] for key in ("ref", "sha256", "classification")}
            for row in unresolved["preparation_only_nonclosure_pins"]
        ],
        "current_pacing_policy": {
            "current": {"ref": evidence_by_id["policy_v32"]["path"], "sha256": evidence_by_id["policy_v32"]["sha256"]},
            "current_role": "PROSPECTIVE_ACTIVE_NO_EXECUTION_UNSEALED",
            "sealed": False,
            "seal_evidence": None,
            "prior_lineage": {"ref": evidence_by_id["policy_v31"]["path"], "sha256": evidence_by_id["policy_v31"]["sha256"]},
            "prior_lineage_mutated": False,
        },
        "durable_hash_bundle": {"ref": f"{HERE_REL}/hash_bundle.json", "bundle_root_sha256": None},
        "zero_state": {"launches": 0, "activations": 0, "results": 0, "receipts": 0, "native_capture_rows": 0, "credit": 0, "canonical_plan_writes": 0},
    }
    dump(HERE / "closure_manifest.candidate.json", candidate)

    readiness = {
        "schema_version": "audit005-final-aggregate-certification-readiness-v1",
        "audit_id": AUDIT_ID,
        "transaction_id": "final-aggregate-certification-prep-0001",
        "status": "PASS_BLOCKED_PREPARATION_COMPLETE_CLOSURE_FORBIDDEN",
        "structural_preparation_complete": True,
        "ready_for_closure": False,
        "closure_manifest_issuance_authorized": False,
        "authority_ref": f"{HERE_REL}/AUTHORITY.json",
        "authority_sha256": sha_file(HERE / "AUTHORITY.json"),
        "candidate_manifest_ref": f"{HERE_REL}/closure_manifest.candidate.json",
        "candidate_manifest_sha256": sha_file(HERE / "closure_manifest.candidate.json"),
        "unresolved_inventory_ref": f"{HERE_REL}/unresolved_inventory.json",
        "unresolved_inventory_sha256": sha_file(HERE / "unresolved_inventory.json"),
        "blocker_count": len(blockers),
        "blocker_ids": [row["blocker_id"] for row in blockers],
        "typed_authority_distinction_present": True,
        "legacy_pointer_superseded_without_mutation": True,
        "frozen_macro_complete_not_current_live_head": True,
        "current_live_head_delta_certified": False,
        "preparation_only_pins_excluded_from_closure": True,
        "current_v32_policy_sealed": False,
        "fresh_independent_aggregate_checkpoint_present": False,
        "schema_engine": "jsonschema.Draft202012Validator",
        "strong_negative_tests_required": True,
        "hash_bundle_ref": f"{HERE_REL}/hash_bundle.json",
        "zero_state": authority["zero_state"],
    }
    dump(HERE / "readiness.json", readiness)

    core_names = [
        "build_prep.py",
        "verify_final_aggregate_closure_prep.py",
        "test_final_aggregate_closure_prep.py",
        "source_scope_observation.jsonl",
        "current_live_head_observation.json",
        "pointer_authority_map.json",
        "lane_checkpoint_inventory.json",
        "unresolved_inventory.json",
        "no_canonical_write_attestation.json",
        "aggregate_checkpoint.schema.json",
        "closure_manifest.schema.json",
        "AUTHORITY.json",
        "closure_manifest.candidate.json",
        "readiness.json",
    ]
    core_members = [{
        "path": f"{HERE_REL}/{name}",
        "sha256": sha_file(HERE / name),
        "byte_count": (HERE / name).stat().st_size,
    } for name in core_names]
    root_payload = {"core_members": core_members, "external_evidence": external}
    bundle = {
        "schema_version": "audit005-final-aggregate-durable-hash-bundle-v1",
        "audit_id": AUDIT_ID,
        "transaction_id": "final-aggregate-certification-prep-0001",
        "status": "DURABLE_APPEND_ONLY_PREPARATION_BUNDLE_BLOCKED_NOT_CLOSURE",
        "hash_algorithm": "sha256",
        "bundle_root_algorithm": "sha256(canonical-json({core_members,external_evidence}))",
        "core_members": core_members,
        "external_evidence": external,
        "bundle_root_sha256": sha_bytes(canonical_bytes(root_payload)),
        "self_inclusion": False,
        "closure_manifest_issued": False,
        "aggregate_credit": 0,
    }
    dump(HERE / "hash_bundle.json", bundle)
    print(json.dumps({
        "status": readiness["status"],
        "namespace": HERE_REL,
        "blockers": len(blockers),
        "hash_bundle_sha256": sha_file(HERE / "hash_bundle.json"),
        "bundle_root_sha256": bundle["bundle_root_sha256"],
        "canonical_writes": 0,
        "launches": 0,
        "results": 0,
        "receipts": 0,
        "native_capture_rows": 0,
        "credit": 0,
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
