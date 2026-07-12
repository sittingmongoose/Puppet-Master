#!/usr/bin/env python3
"""Independent local reconstruction of the Audit 005 feature-catalog epoch."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

from feature_catalog_common import (
    CATALOG_EPOCH,
    CATALOG_ROOT,
    MAX_CATALOG_CONCURRENCY,
    MAX_PACKET_BYTES,
    active_complete_macro_coverage,
    catalog_result_schema,
    credited_result_records,
    digest_strings,
    load_jsonl,
)
from macro_v2_common import AUDIT_ID, ROOT, load_obj, root_hash, sha


def expected_atom_id(assignment_id: str, item_id: str) -> str:
    return "ATOM-" + sha(f"{assignment_id}\0{item_id}".encode())[:20].upper()


def main() -> None:
    epoch = CATALOG_ROOT / "frozen" / CATALOG_EPOCH
    errors: list[str] = []
    try:
        authority = load_obj(epoch / "authority.json")
        seal = load_obj(epoch / "launch_seal.json")
        lineage = load_obj(epoch / "lineage/macro_coverage.json")
        architecture = load_obj(epoch / "protocols/architecture.json")
        assignments = load_jsonl(epoch / "manifests/assignment_manifest.jsonl")
        registry = load_jsonl(epoch / "manifests/packet_registry.jsonl")
        atoms = load_jsonl(epoch / "manifests/atom_ledger.jsonl")
        family_sources = load_jsonl(epoch / "manifests/family_key_sources.jsonl")
        coverage_path, coverage, pointer = active_complete_macro_coverage()
        result_records = credited_result_records(coverage)
    except Exception as exc:
        report = {"status": "fail", "errors": [f"load:{type(exc).__name__}:{exc}"]}
        print(json.dumps(report, indent=2, sort_keys=True))
        raise SystemExit(1)

    if authority.get("audit_id") != AUDIT_ID or authority.get("epoch_id") != CATALOG_EPOCH:
        errors.append("authority identity mismatch")
    if authority.get("status") != "CANDIDATE_PENDING_INDEPENDENT_VALIDATION":
        errors.append("authority status mismatch")
    if seal.get("status") != "PRELAUNCH_CANDIDATE_ZERO_CREDIT" or seal.get("coverage_credit_before_validation") != 0:
        errors.append("launch seal status/credit mismatch")
    if seal.get("authority_sha256") != sha((epoch / "authority.json").read_bytes()):
        errors.append("launch seal authority hash mismatch")
    payload_files = sorted(
        path for path in epoch.rglob("*")
        if path.is_file() and path.name not in {"authority.json", "launch_seal.json"}
    )
    if authority.get("payload_root_sha256") != root_hash(payload_files, epoch):
        errors.append("authority payload root mismatch")
    sealed_files = sorted(path for path in epoch.rglob("*") if path.is_file() and path.name != "launch_seal.json")
    if seal.get("sealed_payload_root_sha256") != root_hash(sealed_files, epoch):
        errors.append("launch sealed payload root mismatch")

    coverage_sha = sha(coverage_path.read_bytes())
    if authority.get("macro_coverage_sha256") != coverage_sha or seal.get("macro_coverage_sha256") != coverage_sha:
        errors.append("active macro coverage binding mismatch")
    if lineage.get("macro_coverage_ref") != coverage_path.relative_to(ROOT).as_posix() or lineage.get("macro_coverage_sha256") != coverage_sha:
        errors.append("lineage macro coverage mismatch")
    if lineage.get("macro_active_pointer_sha256") != sha((CATALOG_ROOT.parent / "macro/live/ACTIVE.json").read_bytes()):
        errors.append("lineage active pointer mismatch")
    if lineage.get("covered_window_ids_digest") != coverage.get("covered_window_ids_digest"):
        errors.append("lineage covered-window digest mismatch")
    if lineage.get("credited_assignment_ids_digest") != coverage.get("credited_assignment_ids_digest"):
        errors.append("lineage credited-assignment digest mismatch")

    atom_by_id: dict[str, dict] = {}
    for atom in atoms:
        identifier = atom.get("atom_id")
        if not isinstance(identifier, str) or identifier in atom_by_id:
            errors.append(f"duplicate/invalid atom id:{identifier}")
            continue
        atom_by_id[identifier] = atom
    expected_atoms: dict[str, dict] = {}
    expected_family_sources: list[dict] = []
    for record in result_records:
        result = record["result"]
        item_to_windows: dict[str, list[str]] = {}
        for segment in result["segments"]:
            for item_id in segment["item_ids"]:
                item_to_windows.setdefault(item_id, []).append(segment["window_id"])
        for item in result["items"]:
            identifier = expected_atom_id(record["assignment_id"], item["item_id"])
            expected_atoms[identifier] = {
                "assignment_id": record["assignment_id"],
                "item_id": item["item_id"],
                "document_path": result["source_binding"]["document_path"],
                "source_sha256": result["source_binding"]["source_sha256"],
                "micro_window_ids": sorted(item_to_windows[item["item_id"]]),
                "feature_family_keys": result["synthesis"]["feature_family_keys"],
                "result_ref": record["result_ref"],
                "result_sha256": record["result_sha256"],
                "outcome_ref": record["outcome_ref"],
                "outcome_sha256": record["outcome_sha256"],
                "item": item,
            }
        for key in result["synthesis"]["feature_family_keys"]:
            expected_family_sources.append({
                "family_key": key,
                "assignment_id": record["assignment_id"],
                "document_path": result["source_binding"]["document_path"],
                "result_sha256": record["result_sha256"],
            })
    if set(atom_by_id) != set(expected_atoms):
        errors.append("atom ledger id set mismatch")
    for identifier in sorted(set(atom_by_id) & set(expected_atoms)):
        observed = dict(atom_by_id[identifier])
        observed.pop("audit_id", None)
        observed.pop("schema_version", None)
        expected = dict(expected_atoms[identifier])
        expected["atom_id"] = identifier
        if observed != expected:
            errors.append(f"atom ledger semantic mismatch:{identifier}")
    expected_family_sources.sort(key=lambda row: (row["family_key"], row["document_path"], row["assignment_id"]))
    if family_sources != expected_family_sources:
        errors.append("family-key source ledger mismatch")

    if authority.get("credited_result_count") != len(result_records) or lineage.get("credited_result_count") != len(result_records):
        errors.append("credited result count mismatch")
    if authority.get("atom_count") != len(atoms) or lineage.get("atom_count") != len(atoms):
        errors.append("atom count mismatch")
    atom_digest = digest_strings(sorted(atom_by_id))
    if authority.get("atom_ids_digest") != atom_digest or lineage.get("atom_ids_digest") != atom_digest:
        errors.append("atom digest mismatch")
    unique_family_keys = {row["family_key"] for row in family_sources}
    if authority.get("unique_family_key_count") != len(unique_family_keys) or lineage.get("unique_family_keys") != len(unique_family_keys):
        errors.append("unique family-key count mismatch")

    assignment_by_id = {row.get("assignment_id"): row for row in assignments}
    registry_by_id = {row.get("assignment_id"): row for row in registry}
    if len(assignment_by_id) != len(assignments) or len(registry_by_id) != len(registry):
        errors.append("assignment/registry identity duplication")
    if set(assignment_by_id) != set(registry_by_id):
        errors.append("assignment/registry id mismatch")
    if not 1 <= len(assignments) <= MAX_CATALOG_CONCURRENCY:
        errors.append("assignment count outside one-wave bound")
    assigned_atom_ids: list[str] = []
    for assignment_id, assignment in sorted(assignment_by_id.items()):
        packet_path = epoch / str(assignment.get("packet_ref"))
        if not packet_path.is_file():
            errors.append(f"packet missing:{assignment_id}")
            continue
        packet_bytes = packet_path.read_bytes()
        packet = json.loads(packet_bytes)
        if sha(packet_bytes) != assignment.get("packet_sha256") or len(packet_bytes) != assignment.get("packet_bytes"):
            errors.append(f"packet byte binding mismatch:{assignment_id}")
        if len(packet_bytes) > MAX_PACKET_BYTES:
            errors.append(f"packet exceeds byte cap:{assignment_id}")
        packet_atom_ids = packet.get("atom_ids", [])
        packet_family_keys = packet.get("family_keys", [])
        if packet.get("assignment_id") != assignment_id or packet.get("packet_id") != assignment.get("packet_id"):
            errors.append(f"packet identity mismatch:{assignment_id}")
        if packet.get("atom_count") != len(packet_atom_ids) or packet_atom_ids != sorted(packet_atom_ids):
            errors.append(f"packet atom ordering/count mismatch:{assignment_id}")
        if packet.get("atom_ids_digest") != digest_strings(packet_atom_ids):
            errors.append(f"packet atom digest mismatch:{assignment_id}")
        if packet.get("family_key_count") != len(packet_family_keys) or packet_family_keys != sorted(set(packet_family_keys)):
            errors.append(f"packet family-key ordering/count mismatch:{assignment_id}")
        if packet.get("family_keys_digest") != digest_strings(packet_family_keys):
            errors.append(f"packet family-key digest mismatch:{assignment_id}")
        compact_atoms = [atom for record in packet.get("source_results", []) for atom in record.get("atoms", [])]
        if sorted(atom.get("atom_id") for atom in compact_atoms) != packet_atom_ids:
            errors.append(f"packet compact atom closure mismatch:{assignment_id}")
        compact_keys = sorted({key for record in packet.get("source_results", []) for key in record.get("feature_family_keys", [])})
        if compact_keys != packet_family_keys:
            errors.append(f"packet compact family closure mismatch:{assignment_id}")
        assigned_atom_ids.extend(packet_atom_ids)
        if registry_by_id.get(assignment_id, {}).get("packet_sha256") != assignment.get("packet_sha256"):
            errors.append(f"registry packet hash mismatch:{assignment_id}")
        output = ROOT / str(assignment.get("output_directory"))
        if not output.is_dir() or any(output.iterdir()):
            errors.append(f"prelaunch output not empty:{assignment_id}")
    if len(assigned_atom_ids) != len(set(assigned_atom_ids)) or set(assigned_atom_ids) != set(atom_by_id):
        errors.append("packet atom partition is not exact")

    if load_obj(epoch / "schemas/feature_catalog_result.schema.json") != catalog_result_schema():
        errors.append("published result schema differs from executable contract")
    if architecture.get("packet_count") != len(assignments) or architecture.get("max_packet_bytes") != MAX_PACKET_BYTES:
        errors.append("architecture sizing mismatch")
    if architecture.get("all_validated_atoms_partitioned_exactly_once") is not True or architecture.get("all_raw_family_keys_mapped") is not True:
        errors.append("architecture closure guarantees missing")

    report = {
        "audit_id": AUDIT_ID,
        "checker": "feature_catalog_epoch_independent_v1",
        "epoch_id": CATALOG_EPOCH,
        "status": "pass" if not errors else "fail",
        "errors": sorted(set(errors)),
        "counts": {
            "credited_results": len(result_records),
            "atoms": len(atoms),
            "raw_family_key_mentions": len(family_sources),
            "unique_family_keys": len(unique_family_keys),
            "assignments": len(assignments),
        },
        "macro_coverage_sha256": coverage_sha,
        "atom_ids_digest": atom_digest,
        "authority_sha256": sha((epoch / "authority.json").read_bytes()),
        "launch_seal_sha256": sha((epoch / "launch_seal.json").read_bytes()),
        "packet_bytes_max": max((row.get("packet_bytes", 0) for row in assignments), default=0),
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
