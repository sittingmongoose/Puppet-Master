#!/usr/bin/env python3
"""Build Audit 005's high-throughput, accuracy-preserving macro-review epoch."""

from __future__ import annotations

import argparse
import json
import os
import shutil
from collections import defaultdict
from pathlib import Path
from typing import Any

from macro_v2_common import (
    ATTESTATION_KEYS,
    AUDIT_ID,
    CONTEXT_LINES,
    COVERAGE_KEYS,
    DIMENSIONS,
    EVIDENCE_KEYS,
    GLOBAL_CONCURRENCY,
    ITEM_KEYS,
    ITEM_TYPES,
    MACRO_ROOT,
    MAX_BUNDLE_TOKENS,
    MAX_BUNDLE_WINDOWS,
    REPO,
    ROOT,
    SEGMENT_KEYS,
    SOURCE_KEYS,
    SYNTHESIS_KEYS,
    TOP_KEYS,
    TOTAL_MICRO_WINDOWS,
    load_jsonl,
    load_obj,
    result_schema,
    root_hash,
    sha,
    source_unit_refs,
    write_jsonl,
    write_obj,
)


def legacy_credited_seed_windows(source_epoch: Path) -> tuple[set[str], list[dict[str, Any]]]:
    old_rows = {row["assignment_id"]: row for row in load_jsonl(source_epoch / "manifests/assignment_manifest.jsonl")}
    roles: dict[str, dict[str, tuple[Path, dict[str, Any]]]] = defaultdict(dict)
    for credit_path in sorted((ROOT / "master/credits").glob("**/credit.json")):
        credit = load_obj(credit_path)
        assignment = old_rows.get(credit.get("assignment_id"))
        if assignment is None:
            continue
        roles[assignment["window_id"]][assignment["role"]] = (credit_path, credit)
    required = {"exact_behavior", "adversarial_negative_space"}
    seeded = {window_id for window_id, values in roles.items() if set(values) == required}
    evidence: list[dict[str, Any]] = []
    for window_id in sorted(seeded):
        role_rows = []
        for role in sorted(required):
            path, credit = roles[window_id][role]
            role_rows.append({
                "role": role,
                "assignment_id": credit["assignment_id"],
                "attempt_id": credit["attempt_id"],
                "credit_ref": path.relative_to(ROOT).as_posix(),
                "credit_sha256": sha(path.read_bytes()),
                "result_sha256": credit["result_sha256"],
            })
        evidence.append({"window_id": window_id, "basis": "dual_validated_epoch_0013_roles", "role_credits": role_rows})
    return seeded, evidence


def active_coverage_seed(coverage_ref: str) -> tuple[set[str], list[dict[str, Any]], dict[str, Any]]:
    """Bind a successor epoch to the already committed active micro-window coverage."""
    pointer_path = MACRO_ROOT / "live/ACTIVE.json"
    if not pointer_path.is_file():
        raise RuntimeError("ACTIVE coverage pointer missing")
    pointer = load_obj(pointer_path)
    coverage_path = ROOT / coverage_ref
    if pointer.get("coverage_ref") != coverage_ref:
        raise RuntimeError("requested coverage seed is not the active coverage")
    coverage_bytes = coverage_path.read_bytes()
    coverage_sha = sha(coverage_bytes)
    if pointer.get("coverage_sha256") != coverage_sha:
        raise RuntimeError("active coverage seed hash mismatch")
    coverage = json.loads(coverage_bytes)
    seeded = set(coverage.get("covered_window_ids", []))
    if len(seeded) != coverage.get("covered_micro_windows"):
        raise RuntimeError("active coverage seed cardinality mismatch")
    pointer_ref = pointer_path.relative_to(ROOT).as_posix()
    pointer_sha = sha(pointer_path.read_bytes())
    evidence = [
        {
            "window_id": window_id,
            "basis": "active_validated_macro_coverage",
            "coverage_ref": coverage_ref,
            "coverage_sha256": coverage_sha,
            "active_pointer_ref": pointer_ref,
            "active_pointer_sha256": pointer_sha,
            "covered_window_ids_digest": coverage["covered_window_ids_digest"],
        }
        for window_id in sorted(seeded)
    ]
    lineage = {
        "coverage_ref": coverage_ref,
        "coverage_sha256": coverage_sha,
        "active_pointer_ref": pointer_ref,
        "active_pointer_sha256": pointer_sha,
        "covered_window_ids_digest": coverage["covered_window_ids_digest"],
        "covered_micro_windows": len(seeded),
        "transaction_batch_id": coverage.get("transaction_batch_id"),
    }
    return seeded, evidence, lineage


def pack_windows(rows: list[dict[str, Any]], seeded: set[str]) -> list[list[dict[str, Any]]]:
    by_document: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        by_document[row["document_path"]].append(row)
    bundles: list[list[dict[str, Any]]] = []
    for document_path in sorted(by_document):
        ordered = sorted(by_document[document_path], key=lambda row: (row["core_line_start"], row["window_id"]))
        current: list[dict[str, Any]] = []
        tokens = 0
        previous_end: int | None = None
        for row in ordered:
            if row["window_id"] in seeded:
                if current:
                    bundles.append(current)
                    current = []
                    tokens = 0
                previous_end = None
                continue
            contiguous = previous_end is None or row["core_line_start"] == previous_end + 1
            if current and (
                not contiguous
                or tokens + row["token_estimate"] > MAX_BUNDLE_TOKENS
                or len(current) >= MAX_BUNDLE_WINDOWS
            ):
                bundles.append(current)
                current = []
                tokens = 0
            current.append(row)
            tokens += row["token_estimate"]
            previous_end = row["core_line_end"]
        if current:
            bundles.append(current)
    return bundles


def numbered_excerpt(document_path: str, first: int, last: int) -> tuple[str, list[list[int]]]:
    source = (REPO / document_path).read_text(encoding="utf-8").splitlines(keepends=True)
    start = max(1, first - CONTEXT_LINES)
    end = min(len(source), last + CONTEXT_LINES)
    text = "".join(f"L{line_no:08d}\t{source[line_no - 1]}" for line_no in range(start, end + 1))
    context: list[list[int]] = []
    if start < first:
        context.append([start, first - 1])
    if last < end:
        context.append([last + 1, end])
    return text, context


def source_root(scope_rows: list[dict[str, Any]]) -> str:
    records = []
    for row in sorted((row for row in scope_rows if row["disposition"] == "blind_initial"), key=lambda row: row["path"]):
        path = REPO / row["path"]
        current = sha(path.read_bytes())
        if current != row["source_sha256"]:
            raise RuntimeError(f"canonical source changed since structural epoch: {row['path']}")
        records.append(f"{row['path']}\0{current}\0{path.stat().st_size}\n")
    return sha("".join(records).encode())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--epoch", default="epoch-0015")
    parser.add_argument("--source-epoch", default="epoch-0013")
    parser.add_argument("--coverage-ref")
    args = parser.parse_args()

    source_epoch = ROOT / "master/frozen" / args.source_epoch
    staging = MACRO_ROOT / "staging" / args.epoch
    final = MACRO_ROOT / "frozen" / args.epoch
    if not source_epoch.is_dir():
        raise RuntimeError(f"missing source epoch: {source_epoch}")
    if staging.exists() or final.exists():
        raise RuntimeError("refusing to overwrite macro epoch")
    staging.mkdir(parents=True)

    scope_rows = load_jsonl(source_epoch / "manifests/source_scope.jsonl")
    micro_rows = load_jsonl(source_epoch / "manifests/window_manifest.jsonl")
    if len(micro_rows) != TOTAL_MICRO_WINDOWS:
        raise RuntimeError("unexpected structural micro-window count")
    canonical_root = source_root(scope_rows)
    if args.coverage_ref:
        seeded, seed_evidence, coverage_lineage = active_coverage_seed(args.coverage_ref)
    else:
        seeded, seed_evidence = legacy_credited_seed_windows(source_epoch)
        coverage_lineage = None
    bundles = pack_windows(micro_rows, seeded)
    remaining_ids = {row["window_id"] for row in micro_rows} - seeded
    packed_ids = [row["window_id"] for bundle in bundles for row in bundle]
    if len(packed_ids) != len(set(packed_ids)) or set(packed_ids) != remaining_ids:
        raise RuntimeError("macro packing does not exactly cover remaining micro-windows")

    attempt_id = f"attempt-{int(args.epoch.rsplit('-', 1)[1]):04d}"
    assignments: list[dict[str, Any]] = []
    macro_manifest: list[dict[str, Any]] = []
    capsule_registry: list[dict[str, Any]] = []
    per_doc_seq: dict[str, int] = defaultdict(int)

    for sequence, bundle in enumerate(bundles, 1):
        document_path = bundle[0]["document_path"]
        if any(row["document_path"] != document_path for row in bundle):
            raise RuntimeError("cross-document macro bundle")
        per_doc_seq[document_path] += 1
        epoch_serial = int(args.epoch.rsplit("-", 1)[1])
        bundle_id = f"MACRO{epoch_serial}-{bundle[0]['doc_id'].removeprefix('DOC-')}-{per_doc_seq[document_path]:04d}"
        assignment_id = f"A005M{epoch_serial}-{sequence:06d}-INTEGRATED-{bundle_id}"
        first, last = bundle[0]["core_line_start"], bundle[-1]["core_line_end"]
        excerpt, context_ranges = numbered_excerpt(document_path, first, last)
        excerpt_bytes = excerpt.encode()
        if len(excerpt_bytes) > 300_000:
            raise RuntimeError(f"macro excerpt exceeds 300KB: {bundle_id}")
        excerpt_sha = sha(excerpt_bytes)
        excerpt_rel = f"capsules/source/{excerpt_sha[:2]}/{excerpt_sha}.txt"
        excerpt_path = staging / excerpt_rel
        if not excerpt_path.exists():
            excerpt_path.parent.mkdir(parents=True, exist_ok=True)
            excerpt_path.write_bytes(excerpt_bytes)

        segments = []
        for row in bundle:
            segment = {
                "window_id": row["window_id"],
                "core_range": [row["core_line_start"], row["core_line_end"]],
                "core_sha256": row["core_sha256"],
                "token_estimate": row["token_estimate"],
                "plan_unit_ids": row.get("plan_unit_ids", []),
                "semantic_block_ids": row.get("semantic_block_ids", []),
                "structural_paths": row.get("structural_paths", []),
            }
            segment["required_source_unit_refs"] = source_unit_refs(segment)
            if not segment["required_source_unit_refs"]:
                raise RuntimeError(f"micro-window has no auditable source unit: {row['window_id']}")
            segments.append(segment)

        capsule = {
            "audit_id": AUDIT_ID,
            "schema_version": "macro-context-capsule-v2",
            "phase": "blind_macro_window_review",
            "assignment_id": assignment_id,
            "attempt_id": attempt_id,
            "bundle_id": bundle_id,
            "document_path": document_path,
            "source_sha256": bundle[0]["source_sha256"],
            "bundle_core_range": [first, last],
            "context_ranges": context_ranges,
            "token_estimate": sum(row["token_estimate"] for row in bundle),
            "micro_window_ids": [row["window_id"] for row in bundle],
            "segments": segments,
            "required_dimensions": DIMENSIONS,
            "source_excerpt_ref": excerpt_rel,
            "source_excerpt_sha256": excerpt_sha,
            "source_excerpt_line_format": "L######## followed by a tab and exact canonical source text",
            "review_instructions": (
                "Read every assigned core line and account for every required_source_unit_ref. Apply both exact-behavior "
                "and adversarial-negative-space lenses across every required dimension. Extract concise feature, behavior, "
                "contract, state, authority, consumer, GUI, failure/recovery, oracle, gap, unknown, and explicit-non-gap "
                "items with exact source evidence. Do not merely paraphrase headings or copy unit refs. Each segment must "
                "name its complete required_source_unit_refs list and at least one item. Write exactly one regular JSON "
                "payload inside the assigned output directory; result.json is recommended but the filename is not semantic. "
                "Do not write a terminal seal. Return PMR1 only after the JSON payload is fully written."
            ),
            "blindness": {
                "prior_audits": "forbidden",
                "peer_results": "forbidden",
                "unrelated_sources": "forbidden",
                "external_research": "deferred_to_feature_research_phase",
            },
            "result_schema_ref": "schemas/macro_review_result.schema.json",
            "result_contract": {
                "schema_version": "macro-review-result-v1",
                "no_unlisted_keys_at_any_object_level": True,
                "top_keys": sorted(TOP_KEYS),
                "source_binding_keys": sorted(SOURCE_KEYS),
                "coverage_keys": sorted(COVERAGE_KEYS),
                "segment_keys": sorted(SEGMENT_KEYS),
                "item_keys": sorted(ITEM_KEYS),
                "evidence_keys": sorted(EVIDENCE_KEYS),
                "synthesis_keys": sorted(SYNTHESIS_KEYS),
                "attestation_keys": sorted(ATTESTATION_KEYS),
                "item_type_enum": sorted(ITEM_TYPES),
                "severity_enum": ["info", "low", "medium", "high", "critical"],
                "confidence_type": "number_0_to_1",
                "builder_discretion_type": "boolean",
                "required_dimensions_exact_order": DIMENSIONS,
                "segment_item_union_must_equal_item_ids": True,
                "item_source_unit_union_must_equal_assigned_refs": True,
            },
        }
        capsule_rel = f"capsules/assignments/{assignment_id}.json"
        capsule_path = staging / capsule_rel
        write_obj(capsule_path, capsule)
        capsule_sha = sha(capsule_path.read_bytes())
        output_directory = f"macro_v2/assignments/{assignment_id}/attempts/{attempt_id}"
        assignment = {
            "audit_id": AUDIT_ID,
            "schema_version": "macro-assignment-v1",
            "assignment_id": assignment_id,
            "attempt_id": attempt_id,
            "bundle_id": bundle_id,
            "document_path": document_path,
            "source_sha256": bundle[0]["source_sha256"],
            "micro_window_ids": capsule["micro_window_ids"],
            "micro_window_count": len(bundle),
            "bundle_core_range": [first, last],
            "token_estimate": capsule["token_estimate"],
            "capsule_ref": capsule_rel,
            "capsule_sha256": capsule_sha,
            "source_excerpt_ref": excerpt_rel,
            "source_excerpt_sha256": excerpt_sha,
            "result_schema_ref": "schemas/macro_review_result.schema.json",
            "output_directory": output_directory,
            "model": "gpt-5.6-sol",
            "reasoning_effort": "xhigh",
            "fresh_child_required": True,
            "coverage_credit_before_validation": 0,
        }
        assignments.append(assignment)
        macro_manifest.append({
            "bundle_id": bundle_id,
            "assignment_id": assignment_id,
            "document_path": document_path,
            "source_sha256": assignment["source_sha256"],
            "core_range": [first, last],
            "micro_window_ids": assignment["micro_window_ids"],
            "micro_window_count": len(bundle),
            "token_estimate": assignment["token_estimate"],
        })
        capsule_registry.append({
            "assignment_id": assignment_id,
            "capsule_ref": capsule_rel,
            "capsule_sha256": capsule_sha,
            "source_excerpt_ref": excerpt_rel,
            "source_excerpt_sha256": excerpt_sha,
        })

    if not assignments:
        raise RuntimeError("successor epoch has no pending assignments")
    # A successor/retry epoch can contain fewer assignments than the normal
    # production concurrency.  Select a maximally document-diverse pilot, then
    # fill any remaining slots deterministically.  Requiring exactly 24 here
    # made small closure epochs impossible even though their entire assignment
    # set is the correct pilot.
    pilot_target = min(GLOBAL_CONCURRENCY, len(assignments))
    pilot: list[str] = []
    seen_docs: set[str] = set()
    pilot_candidates = sorted(
        assignments,
        key=lambda row: (-row["token_estimate"], row["document_path"], row["assignment_id"]),
    )
    for row in pilot_candidates:
        if row["document_path"] in seen_docs:
            continue
        pilot.append(row["assignment_id"])
        seen_docs.add(row["document_path"])
        if len(pilot) == pilot_target:
            break
    if len(pilot) < pilot_target:
        selected = set(pilot)
        for row in pilot_candidates:
            if row["assignment_id"] in selected:
                continue
            pilot.append(row["assignment_id"])
            selected.add(row["assignment_id"])
            if len(pilot) == pilot_target:
                break
    if len(pilot) != pilot_target:
        raise RuntimeError("unable to choose complete bounded pilot")

    write_jsonl(staging / "manifests/source_scope.jsonl", scope_rows)
    write_jsonl(staging / "manifests/micro_window_manifest.jsonl", micro_rows)
    write_jsonl(staging / "manifests/seeded_windows.jsonl", seed_evidence)
    write_jsonl(staging / "manifests/macro_manifest.jsonl", macro_manifest)
    write_jsonl(staging / "manifests/assignment_manifest.jsonl", assignments)
    write_jsonl(staging / "manifests/capsule_registry.jsonl", capsule_registry)
    write_obj(staging / "manifests/pilot_assignment_ids.json", {"assignment_ids": pilot})
    if coverage_lineage is not None:
        write_obj(staging / "lineage/coverage_seed.json", coverage_lineage)
    write_obj(staging / "schemas/macro_review_result.schema.json", result_schema())
    write_obj(staging / "protocols/architecture.json", {
        "audit_id": AUDIT_ID,
        "schema_version": "macro-architecture-v3",
        "source_structural_epoch": args.source_epoch,
        "coverage_basis": "canonical_structural_micro_windows",
        "micro_window_total": len(micro_rows),
        "seeded_validated_micro_windows": len(seeded),
        "remaining_micro_windows": len(remaining_ids),
        "macro_assignment_total": len(assignments),
        "global_semantic_concurrency": GLOBAL_CONCURRENCY,
        "direct_fresh_children_from_reusable_sol_controller": True,
        "cohort_dispatcher_layer_removed": True,
        "integrated_exact_and_adversarial_role": True,
        "leaf_written_terminal_seal_removed": True,
        "collector_seals_native_terminal_payload": True,
        "result_filename_is_nonsemantic": True,
        "independent_luna_mechanical_validation": True,
        "mandatory_later_external_research_per_synthesized_feature": True,
        "complete_strict_nested_result_schema": True,
        "exact_result_contract_embedded_in_each_capsule": True,
        "shadow_review_policy": {
            "minimum_random_rate": 0.15,
            "all_critical_and_high_risk_bundles": True,
            "adaptive_expansion_on_recall_miss": True,
        },
    })
    write_obj(staging / "protocols/batch_policy.json", {
        "global_concurrency": GLOBAL_CONCURRENCY,
        "batch_size": GLOBAL_CONCURRENCY,
        "max_bundle_tokens": MAX_BUNDLE_TOKENS,
        "max_bundle_micro_windows": MAX_BUNDLE_WINDOWS,
        "fresh_child_per_assignment": True,
        "followup_reuse": False,
        "checkpoint_valid_assignments_independently": True,
        "invalid_or_missing_payload_zero_credit": True,
        "retry_requires_new_attempt_and_identity": True,
        "result_contract": "exactly_one_regular_json_file_in_output_directory",
        "terminal_contract": "native_completed_PMR1_plus_collector_hash_receipt",
        "adaptive_rules": {
            "shrink_bundle_token_cap_if_failure_rate_above": 0.10,
            "expand_shadow_sample_if_semantic_recall_miss_above": 0.05,
            "never_expand_concurrency_above": GLOBAL_CONCURRENCY,
        },
    })

    manifest_files = sorted(path for path in staging.rglob("*") if path.is_file())
    payload_root = root_hash(manifest_files, staging)
    authority = {
        "audit_id": AUDIT_ID,
        "schema_version": "macro-epoch-authority-v2",
        "epoch_id": args.epoch,
        "status": "CANDIDATE_PENDING_INDEPENDENT_VALIDATION",
        "source_structural_epoch": args.source_epoch,
        "canonical_source_root_sha256": canonical_root,
        "payload_root_sha256": payload_root,
        "micro_window_total": len(micro_rows),
        "seeded_micro_window_count": len(seeded),
        "remaining_micro_window_count": len(remaining_ids),
        "macro_assignment_count": len(assignments),
        "pilot_assignment_count": len(pilot),
        "old_assignment_credits_preserved": len(list((ROOT / "master/credits").glob("**/credit.json"))),
        "old_lineage_mutated": False,
        "canonical_plan_writes_authorized": False,
    }
    if coverage_lineage is not None:
        authority.update({
            "coverage_seed_ref": f"master/macro/frozen/{args.epoch}/lineage/coverage_seed.json",
            "coverage_seed_sha256": sha((staging / "lineage/coverage_seed.json").read_bytes()),
            "coverage_seed_source_ref": coverage_lineage["coverage_ref"],
            "coverage_seed_source_sha256": coverage_lineage["coverage_sha256"],
            "coverage_seed_active_pointer_sha256": coverage_lineage["active_pointer_sha256"],
        })
    write_obj(staging / "authority.json", authority)
    seal_inputs = sorted(path for path in staging.rglob("*") if path.is_file())
    launch_seal = {
        "audit_id": AUDIT_ID,
        "schema_version": "macro-launch-seal-v1",
        "epoch_id": args.epoch,
        "status": "PRELAUNCH_CANDIDATE_ZERO_NEW_COVERAGE",
        "authority_sha256": sha((staging / "authority.json").read_bytes()),
        "sealed_payload_root_sha256": root_hash(seal_inputs, staging),
        "canonical_source_root_sha256": canonical_root,
        "coverage_credit_before_validation": 0,
    }
    write_obj(staging / "launch_seal.json", launch_seal)

    final.parent.mkdir(parents=True, exist_ok=True)
    os.replace(staging, final)
    for assignment in assignments:
        (ROOT / assignment["output_directory"]).mkdir(parents=True, exist_ok=True)

    if coverage_lineage is None:
        baseline = {
        "audit_id": AUDIT_ID,
        "schema_version": "macro-coverage-v1",
        "epoch_id": args.epoch,
        "snapshot_serial": "0000",
        "micro_window_total": len(micro_rows),
        "seeded_micro_windows": len(seeded),
        "macro_credited_micro_windows": 0,
        "covered_micro_windows": len(seeded),
        "pending_micro_windows": len(micro_rows) - len(seeded),
        "macro_assignment_total": len(assignments),
        "credited_macro_assignments": 0,
        "quarantined_attempts": 0,
        "complete": False,
        "covered_window_ids": sorted(seeded),
        "credited_assignment_ids": [],
        "covered_window_ids_digest": sha(json.dumps(sorted(seeded), separators=(",", ":")).encode()),
        "credited_assignment_ids_digest": sha(b"[]"),
        "current_phase": "macro_v2_prelaunch",
        }
        write_obj(MACRO_ROOT / "live/coverage.snapshot-0000.json", baseline, immutable=True)
        migration = {
        "audit_id": AUDIT_ID,
        "schema_version": "macro-v2-migration-authority-v1",
        "status": "PRESERVE_OLD_LINEAGE_REBASE_FUTURE_COVERAGE",
        "old_coverage_ref": "master/live/coverage_state.snapshot-0015.json",
        "old_assignment_credits_preserved": 63,
        "old_fully_dual_reviewed_windows_seeded": len(seeded),
        "new_epoch_ref": f"master/macro/frozen/{args.epoch}",
        "new_epoch_launch_seal_sha256": sha((final / "launch_seal.json").read_bytes()),
        "coverage_unit": "canonical_structural_micro_window",
        "new_macro_assignment_count": len(assignments),
        "expected_assignment_reduction_ratio": 2538 / len(assignments),
        "concurrency": GLOBAL_CONCURRENCY,
        "canonical_plan_writes_authorized": False,
        "old_runner_outputs_mutated": False,
        }
        write_obj(MACRO_ROOT / "authorities/macro-v2-migration.json", migration, immutable=True)
    print(json.dumps({
        "status": "built_candidate",
        "epoch_id": args.epoch,
        "seeded_micro_windows": len(seeded),
        "remaining_micro_windows": len(remaining_ids),
        "macro_assignments": len(assignments),
        "production_batches_at_24": (len(assignments) + GLOBAL_CONCURRENCY - 1) // GLOBAL_CONCURRENCY,
        "max_bundle_tokens": max(row["token_estimate"] for row in assignments),
        "max_bundle_windows": max(row["micro_window_count"] for row in assignments),
        "expected_assignment_reduction_ratio": 2538 / len(assignments),
        "canonical_source_root_sha256": canonical_root,
        "launch_seal_sha256": sha((final / "launch_seal.json").read_bytes()),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
