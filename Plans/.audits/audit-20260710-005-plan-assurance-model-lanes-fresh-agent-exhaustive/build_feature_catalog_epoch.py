#!/usr/bin/env python3
"""Build one bounded, complete feature-catalog normalization epoch."""

from __future__ import annotations

import json
import os
from collections import defaultdict
from pathlib import Path
from typing import Any

from feature_catalog_common import (
    CATALOG_ATTEMPT,
    CATALOG_EPOCH,
    CATALOG_OUTPUT_ROOT,
    CATALOG_ROOT,
    MAX_CATALOG_CONCURRENCY,
    MAX_PACKET_BYTES,
    OWNER_DOMAINS,
    active_complete_macro_coverage,
    canonical_json,
    catalog_result_schema,
    credited_result_records,
    digest_strings,
    write_jsonl,
    write_obj,
)
from macro_v2_common import AUDIT_ID, ROOT, root_hash, sha


def atom_id(assignment_id: str, item_id: str) -> str:
    return "ATOM-" + sha(f"{assignment_id}\0{item_id}".encode())[:20].upper()


def compact_result(record: dict[str, Any], atom_rows: list[dict[str, Any]]) -> dict[str, Any]:
    result = record["result"]
    return {
        "assignment_id": record["assignment_id"],
        "document_path": result["source_binding"]["document_path"],
        "source_sha256": result["source_binding"]["source_sha256"],
        "feature_family_keys": result["synthesis"]["feature_family_keys"],
        "cross_document_questions": result["synthesis"]["cross_document_questions"],
        "research_seed_queries": result["synthesis"]["research_queries"],
        "atoms": [
            {
                "atom_id": atom["atom_id"],
                "item_id": atom["item_id"],
                "item_type": atom["item"]["item_type"],
                "title": atom["item"]["title"],
                "statement": atom["item"]["statement"],
                "severity": atom["item"]["severity"],
                "builder_discretion": atom["item"]["builder_discretion"],
                "gap_kind": atom["item"]["gap_kind"],
                "source_unit_refs": atom["item"]["source_unit_refs"],
                "micro_window_ids": atom["micro_window_ids"],
            }
            for atom in atom_rows
        ],
    }


def packet_value(packet_id: str, records: list[dict[str, Any]]) -> dict[str, Any]:
    atoms = [atom for record in records for atom in record["atoms"]]
    atom_ids = [atom["atom_id"] for atom in atoms]
    family_keys = sorted({key for record in records for key in record["feature_family_keys"]})
    documents = sorted({record["document_path"] for record in records})
    assignment_id = "A005C-" + packet_id.rsplit("-", 1)[1]
    return {
        "audit_id": AUDIT_ID,
        "schema_version": "feature-catalog-packet-v1",
        "epoch_id": CATALOG_EPOCH,
        "phase": "feature_catalog_normalization",
        "packet_id": packet_id,
        "assignment_id": assignment_id,
        "attempt_id": CATALOG_ATTEMPT,
        "document_paths": documents,
        "atom_count": len(atom_ids),
        "atom_ids": sorted(atom_ids),
        "atom_ids_digest": digest_strings(atom_ids),
        "family_key_count": len(family_keys),
        "family_keys": family_keys,
        "family_keys_digest": digest_strings(family_keys),
        "source_results": records,
        "owner_domain_enum": OWNER_DOMAINS,
        "result_schema_ref": "schemas/feature_catalog_result.schema.json",
        "instructions": {
            "objective": (
                "Normalize every assigned validated audit atom into an exhaustive local inventory of distinct Puppet Master "
                "features, systems, tools, workflows, GUI surfaces, integrations, data models, governance controls, or "
                "cross-cutting concerns. Preserve under-specification, contradictions, unknowns, and explicit non-gaps."
            ),
            "partition_rule": "Every atom_id must appear in exactly one feature.atom_ids array; no omission or duplication.",
            "family_key_rule": "Every assigned raw family key must have exactly one family_key_assignments row and at least one mapped feature.",
            "split_merge_rule": (
                "Split concepts with distinct lifecycle, authority, consumers, or failure semantics. Merge only true synonyms "
                "describing the same product concept; record aliases and relationships instead of collapsing uncertainty."
            ),
            "research_rule": (
                "Do not browse in this phase. Give every normalized feature at least one concrete external-research question "
                "for the mandatory next phase; do not treat absence of seed queries as permission to omit research."
            ),
            "scenario_rule": "Give every feature at least one falsifiable scenario requirement for later certification.",
            "cross_packet_rule": "Use cross_packet_terms for likely synonyms, owners, consumers, and seams outside this packet.",
            "output_rule": "Write exactly one strict-schema JSON payload in the assigned output directory and then return PMR1.",
        },
    }


def main() -> None:
    staging = CATALOG_ROOT / "staging" / CATALOG_EPOCH
    final = CATALOG_ROOT / "frozen" / CATALOG_EPOCH
    if staging.exists() or final.exists():
        raise RuntimeError("refusing to overwrite feature-catalog epoch")
    coverage_path, coverage, pointer = active_complete_macro_coverage()
    records = credited_result_records(coverage)
    staging.mkdir(parents=True)

    all_atoms: list[dict[str, Any]] = []
    compact_records: list[dict[str, Any]] = []
    family_sources: list[dict[str, Any]] = []
    atom_ids_seen: set[str] = set()
    result_ids_seen: set[str] = set()

    for record in records:
        result = record["result"]
        assignment_id = record["assignment_id"]
        if assignment_id in result_ids_seen:
            raise RuntimeError(f"duplicate result assignment:{assignment_id}")
        result_ids_seen.add(assignment_id)
        document_path = result["source_binding"]["document_path"]
        item_to_windows: dict[str, list[str]] = defaultdict(list)
        for segment in result["segments"]:
            for item_id_value in segment["item_ids"]:
                item_to_windows[item_id_value].append(segment["window_id"])
        items = result["items"]
        if set(item_to_windows) != {item["item_id"] for item in items}:
            raise RuntimeError(f"result segment/item closure mismatch:{assignment_id}")
        result_atoms: list[dict[str, Any]] = []
        for item in items:
            identifier = atom_id(assignment_id, item["item_id"])
            if identifier in atom_ids_seen:
                raise RuntimeError(f"atom id collision:{identifier}")
            atom_ids_seen.add(identifier)
            atom = {
                "audit_id": AUDIT_ID,
                "schema_version": "feature-catalog-atom-v1",
                "atom_id": identifier,
                "assignment_id": assignment_id,
                "item_id": item["item_id"],
                "document_path": document_path,
                "source_sha256": result["source_binding"]["source_sha256"],
                "micro_window_ids": sorted(item_to_windows[item["item_id"]]),
                "feature_family_keys": result["synthesis"]["feature_family_keys"],
                "result_ref": record["result_ref"],
                "result_sha256": record["result_sha256"],
                "outcome_ref": record["outcome_ref"],
                "outcome_sha256": record["outcome_sha256"],
                "item": item,
            }
            all_atoms.append(atom)
            result_atoms.append(atom)
        compact_records.append(compact_result(record, result_atoms))
        for key in result["synthesis"]["feature_family_keys"]:
            family_sources.append({
                "family_key": key,
                "assignment_id": assignment_id,
                "document_path": document_path,
                "result_sha256": record["result_sha256"],
            })

    compact_records.sort(key=lambda row: (row["document_path"], row["assignment_id"]))
    all_atoms.sort(key=lambda row: row["atom_id"])
    family_sources.sort(key=lambda row: (row["family_key"], row["document_path"], row["assignment_id"]))
    if len(all_atoms) != sum(len(record["result"]["items"]) for record in records):
        raise RuntimeError("atom inventory cardinality mismatch")

    packet_records: list[list[dict[str, Any]]] = []
    current: list[dict[str, Any]] = []
    for record in compact_records:
        sequence = len(packet_records) + 1
        candidate = packet_value(f"CATPKT-{sequence:04d}", current + [record])
        candidate_bytes = len(canonical_json(candidate))
        if current and candidate_bytes > MAX_PACKET_BYTES:
            packet_records.append(current)
            current = [record]
            single = packet_value(f"CATPKT-{len(packet_records)+1:04d}", current)
            if len(canonical_json(single)) > MAX_PACKET_BYTES:
                raise RuntimeError(f"single compact result exceeds packet cap:{record['assignment_id']}")
        else:
            current.append(record)
    if current:
        packet_records.append(current)
    if not 1 <= len(packet_records) <= MAX_CATALOG_CONCURRENCY:
        raise RuntimeError(f"catalog packet count must fit one 24-worker wave:{len(packet_records)}")

    assignments: list[dict[str, Any]] = []
    packet_registry: list[dict[str, Any]] = []
    assigned_atoms: list[str] = []
    for sequence, rows in enumerate(packet_records, 1):
        packet_id = f"CATPKT-{sequence:04d}"
        packet = packet_value(packet_id, rows)
        packet_ref = f"packets/{packet_id}.json"
        packet_path = staging / packet_ref
        write_obj(packet_path, packet)
        packet_sha = sha(packet_path.read_bytes())
        assignment_id = packet["assignment_id"]
        output_directory = CATALOG_OUTPUT_ROOT / assignment_id / "attempts" / CATALOG_ATTEMPT
        assignment = {
            "audit_id": AUDIT_ID,
            "schema_version": "feature-catalog-assignment-v1",
            "epoch_id": CATALOG_EPOCH,
            "assignment_id": assignment_id,
            "attempt_id": CATALOG_ATTEMPT,
            "packet_id": packet_id,
            "packet_ref": packet_ref,
            "packet_sha256": packet_sha,
            "packet_bytes": len(packet_path.read_bytes()),
            "atom_ids": packet["atom_ids"],
            "atom_count": packet["atom_count"],
            "atom_ids_digest": packet["atom_ids_digest"],
            "family_keys": packet["family_keys"],
            "family_key_count": packet["family_key_count"],
            "family_keys_digest": packet["family_keys_digest"],
            "document_paths": packet["document_paths"],
            "result_schema_ref": "schemas/feature_catalog_result.schema.json",
            "output_directory": output_directory.relative_to(ROOT).as_posix(),
            "model": "gpt-5.6-sol",
            "reasoning_effort": "xhigh",
            "fresh_child_required": True,
            "coverage_credit_before_validation": 0,
        }
        assignments.append(assignment)
        packet_registry.append({
            "assignment_id": assignment_id,
            "packet_id": packet_id,
            "packet_ref": packet_ref,
            "packet_sha256": packet_sha,
            "packet_bytes": assignment["packet_bytes"],
            "atom_count": assignment["atom_count"],
            "family_key_count": assignment["family_key_count"],
        })
        assigned_atoms.extend(packet["atom_ids"])

    if sorted(assigned_atoms) != sorted(atom_ids_seen) or len(assigned_atoms) != len(set(assigned_atoms)):
        raise RuntimeError("packet atom partition is not exact")

    write_jsonl(staging / "manifests/atom_ledger.jsonl", all_atoms)
    write_jsonl(staging / "manifests/family_key_sources.jsonl", family_sources)
    write_jsonl(staging / "manifests/assignment_manifest.jsonl", assignments)
    write_jsonl(staging / "manifests/packet_registry.jsonl", packet_registry)
    write_obj(staging / "schemas/feature_catalog_result.schema.json", catalog_result_schema())
    lineage = {
        "audit_id": AUDIT_ID,
        "schema_version": "feature-catalog-lineage-v1",
        "macro_coverage_ref": coverage_path.relative_to(ROOT).as_posix(),
        "macro_coverage_sha256": sha(coverage_path.read_bytes()),
        "macro_active_pointer_ref": (CATALOG_ROOT.parent / "macro/live/ACTIVE.json").relative_to(ROOT).as_posix(),
        "macro_active_pointer_sha256": sha((CATALOG_ROOT.parent / "macro/live/ACTIVE.json").read_bytes()),
        "covered_window_ids_digest": coverage["covered_window_ids_digest"],
        "credited_assignment_ids_digest": coverage["credited_assignment_ids_digest"],
        "credited_result_count": len(records),
        "atom_count": len(all_atoms),
        "atom_ids_digest": digest_strings(sorted(atom_ids_seen)),
        "raw_family_key_mentions": len(family_sources),
        "unique_family_keys": len({row["family_key"] for row in family_sources}),
    }
    write_obj(staging / "lineage/macro_coverage.json", lineage)
    write_obj(staging / "protocols/architecture.json", {
        "audit_id": AUDIT_ID,
        "schema_version": "feature-catalog-architecture-v1",
        "objective": "one-wave exhaustive semantic normalization before global merge and universal research",
        "packet_count": len(assignments),
        "max_packet_bytes": MAX_PACKET_BYTES,
        "max_concurrency": MAX_CATALOG_CONCURRENCY,
        "all_validated_atoms_partitioned_exactly_once": True,
        "all_raw_family_keys_mapped": True,
        "external_research_deferred_one_phase_not_optional": True,
        "fresh_sol_xhigh_child_per_packet": True,
        "canonical_plan_writes_authorized": False,
    })
    payload_files = sorted(path for path in staging.rglob("*") if path.is_file())
    authority = {
        "audit_id": AUDIT_ID,
        "schema_version": "feature-catalog-authority-v1",
        "epoch_id": CATALOG_EPOCH,
        "status": "CANDIDATE_PENDING_INDEPENDENT_VALIDATION",
        "payload_root_sha256": root_hash(payload_files, staging),
        "macro_coverage_sha256": lineage["macro_coverage_sha256"],
        "credited_result_count": len(records),
        "atom_count": len(all_atoms),
        "atom_ids_digest": lineage["atom_ids_digest"],
        "unique_family_key_count": lineage["unique_family_keys"],
        "assignment_count": len(assignments),
        "coverage_credit_before_validation": 0,
        "canonical_plan_writes_authorized": False,
    }
    write_obj(staging / "authority.json", authority)
    seal_inputs = sorted(path for path in staging.rglob("*") if path.is_file())
    write_obj(staging / "launch_seal.json", {
        "audit_id": AUDIT_ID,
        "schema_version": "feature-catalog-launch-seal-v1",
        "epoch_id": CATALOG_EPOCH,
        "status": "PRELAUNCH_CANDIDATE_ZERO_CREDIT",
        "authority_sha256": sha((staging / "authority.json").read_bytes()),
        "sealed_payload_root_sha256": root_hash(seal_inputs, staging),
        "macro_coverage_sha256": lineage["macro_coverage_sha256"],
        "coverage_credit_before_validation": 0,
    })

    final.parent.mkdir(parents=True, exist_ok=True)
    os.replace(staging, final)
    for assignment in assignments:
        (ROOT / assignment["output_directory"]).mkdir(parents=True, exist_ok=True)
    print(json.dumps({
        "status": "built_candidate",
        "epoch_id": CATALOG_EPOCH,
        "credited_results": len(records),
        "atoms": len(all_atoms),
        "unique_family_keys": lineage["unique_family_keys"],
        "assignments": len(assignments),
        "max_packet_bytes": max(row["packet_bytes"] for row in assignments),
        "authority_sha256": sha((final / "authority.json").read_bytes()),
        "launch_seal_sha256": sha((final / "launch_seal.json").read_bytes()),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
