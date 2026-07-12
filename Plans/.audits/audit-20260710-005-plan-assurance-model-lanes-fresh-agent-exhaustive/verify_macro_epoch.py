#!/usr/bin/env python3
"""Independent reconstruction checks for an Audit 005 macro-review epoch."""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from macro_v2_common import (
    ATTESTATION_KEYS,
    AUDIT_ID,
    COVERAGE_KEYS,
    CONTEXT_LINES,
    DIMENSIONS,
    EVIDENCE_KEYS,
    GLOBAL_CONCURRENCY,
    ITEM_KEYS,
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
    canonical_json,
    load_jsonl,
    load_obj,
    root_hash,
    result_schema,
    sha,
    source_unit_refs,
)


def legacy_expected_seed_set(source_epoch: Path) -> set[str]:
    old = {row["assignment_id"]: row for row in load_jsonl(source_epoch / "manifests/assignment_manifest.jsonl")}
    roles: dict[str, set[str]] = defaultdict(set)
    for path in sorted((ROOT / "master/credits").glob("**/credit.json")):
        credit = load_obj(path)
        assignment = old.get(credit.get("assignment_id"))
        if assignment:
            roles[assignment["window_id"]].add(assignment["role"])
    return {
        window_id
        for window_id, values in roles.items()
        if values == {"exact_behavior", "adversarial_negative_space"}
    }


def expected_seed_set(
    epoch: Path, authority: dict[str, Any], source_epoch: Path, errors: list[str]
) -> tuple[set[str], dict[str, Any] | None]:
    if authority.get("schema_version") != "macro-epoch-authority-v2":
        return legacy_expected_seed_set(source_epoch), None
    lineage_path = epoch / "lineage/coverage_seed.json"
    if not lineage_path.is_file():
        errors.append("successor coverage lineage missing")
        return set(), None
    lineage = load_obj(lineage_path)
    if sha(lineage_path.read_bytes()) != authority.get("coverage_seed_sha256"):
        errors.append("successor coverage lineage hash mismatch")
    coverage_ref = lineage.get("coverage_ref")
    coverage_path = ROOT / str(coverage_ref)
    if not coverage_path.is_file():
        errors.append("successor coverage source missing")
        return set(), lineage
    coverage = load_obj(coverage_path)
    coverage_sha = sha(coverage_path.read_bytes())
    if coverage_sha != lineage.get("coverage_sha256") or coverage_sha != authority.get("coverage_seed_source_sha256"):
        errors.append("successor coverage source hash mismatch")
    seeded = set(coverage.get("covered_window_ids", []))
    if len(seeded) != coverage.get("covered_micro_windows") or len(seeded) != lineage.get("covered_micro_windows"):
        errors.append("successor coverage cardinality mismatch")
    expected_digest = sha(json.dumps(sorted(seeded), separators=(",", ":")).encode())
    if expected_digest != coverage.get("covered_window_ids_digest") or expected_digest != lineage.get("covered_window_ids_digest"):
        errors.append("successor covered-window digest mismatch")
    pointer_path = ROOT / str(lineage.get("active_pointer_ref"))
    if not pointer_path.is_file() or sha(pointer_path.read_bytes()) != lineage.get("active_pointer_sha256"):
        errors.append("successor active pointer hash mismatch")
    elif load_obj(pointer_path).get("coverage_ref") != coverage_ref:
        errors.append("successor active pointer target mismatch")
    if lineage.get("active_pointer_sha256") != authority.get("coverage_seed_active_pointer_sha256"):
        errors.append("authority active pointer lineage mismatch")
    return seeded, lineage


def strict_schema_issues(schema_path: Path) -> list[str]:
    issues: list[str] = []
    if schema_path.read_bytes() != canonical_json(result_schema()):
        issues.append("published result schema differs from executable strict contract")
    schema = load_obj(schema_path)
    expected_objects = {
        "root": (schema, TOP_KEYS),
        "source_binding": (schema.get("properties", {}).get("source_binding", {}), SOURCE_KEYS),
        "coverage": (schema.get("properties", {}).get("coverage", {}), COVERAGE_KEYS),
        "segment": (schema.get("properties", {}).get("segments", {}).get("items", {}), SEGMENT_KEYS),
        "item": (schema.get("properties", {}).get("items", {}).get("items", {}), ITEM_KEYS),
        "evidence": (
            schema.get("properties", {}).get("items", {}).get("items", {}).get("properties", {})
            .get("evidence", {}).get("items", {}),
            EVIDENCE_KEYS,
        ),
        "synthesis": (schema.get("properties", {}).get("synthesis", {}), SYNTHESIS_KEYS),
        "self_attestation": (schema.get("properties", {}).get("self_attestation", {}), ATTESTATION_KEYS),
    }
    for label, (node, keys) in expected_objects.items():
        if node.get("additionalProperties") is not False or set(node.get("required", [])) != keys:
            issues.append(f"strict nested schema mismatch:{label}")
    return issues


def canonical_root(scope: list[dict[str, Any]], errors: list[str]) -> str:
    records = []
    for row in sorted((row for row in scope if row.get("disposition") == "blind_initial"), key=lambda row: row["path"]):
        path = REPO / row["path"]
        if not path.is_file():
            errors.append(f"missing canonical source:{row['path']}")
            continue
        digest = sha(path.read_bytes())
        if digest != row.get("source_sha256"):
            errors.append(f"canonical source drift:{row['path']}")
        records.append(f"{row['path']}\0{digest}\0{path.stat().st_size}\n")
    return sha("".join(records).encode())


def excerpt_bytes(document_path: str, core_range: list[int]) -> bytes:
    lines = (REPO / document_path).read_text(encoding="utf-8").splitlines(keepends=True)
    first, last = core_range
    start = max(1, first - CONTEXT_LINES)
    end = min(len(lines), last + CONTEXT_LINES)
    return "".join(f"L{number:08d}\t{lines[number - 1]}" for number in range(start, end + 1)).encode()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--epoch", default="epoch-0015")
    parser.add_argument("--source-epoch", default="epoch-0013")
    args = parser.parse_args()
    epoch = MACRO_ROOT / "frozen" / args.epoch
    source_epoch = ROOT / "master/frozen" / args.source_epoch
    errors: list[str] = []

    required = [
        epoch / "authority.json",
        epoch / "launch_seal.json",
        epoch / "manifests/source_scope.jsonl",
        epoch / "manifests/micro_window_manifest.jsonl",
        epoch / "manifests/seeded_windows.jsonl",
        epoch / "manifests/macro_manifest.jsonl",
        epoch / "manifests/assignment_manifest.jsonl",
        epoch / "manifests/capsule_registry.jsonl",
        epoch / "manifests/pilot_assignment_ids.json",
        epoch / "protocols/architecture.json",
        epoch / "protocols/batch_policy.json",
        epoch / "schemas/macro_review_result.schema.json",
    ]
    for path in required:
        if not path.is_file():
            errors.append(f"missing required artifact:{path.relative_to(epoch)}")
    if errors:
        print(json.dumps({"status": "fail", "errors": errors}, indent=2, sort_keys=True))
        raise SystemExit(1)

    authority = load_obj(epoch / "authority.json")
    seal = load_obj(epoch / "launch_seal.json")
    scope = load_jsonl(epoch / "manifests/source_scope.jsonl")
    micro = load_jsonl(epoch / "manifests/micro_window_manifest.jsonl")
    seeded_rows = load_jsonl(epoch / "manifests/seeded_windows.jsonl")
    macros = load_jsonl(epoch / "manifests/macro_manifest.jsonl")
    assignments = load_jsonl(epoch / "manifests/assignment_manifest.jsonl")
    registry = load_jsonl(epoch / "manifests/capsule_registry.jsonl")
    pilot = load_obj(epoch / "manifests/pilot_assignment_ids.json").get("assignment_ids", [])
    architecture = load_obj(epoch / "protocols/architecture.json")
    policy = load_obj(epoch / "protocols/batch_policy.json")

    if len(micro) != TOTAL_MICRO_WINDOWS:
        errors.append(f"micro-window count:{len(micro)}")
    micro_by_id = {row.get("window_id"): row for row in micro}
    if len(micro_by_id) != len(micro):
        errors.append("duplicate micro-window ids")
    seed_set = {row.get("window_id") for row in seeded_rows}
    expected_seeds, coverage_lineage = expected_seed_set(epoch, authority, source_epoch, errors)
    if seed_set != expected_seeds:
        errors.append("seeded window set does not independently match dual credits")
    for row in seeded_rows:
        if coverage_lineage is not None:
            if row.get("basis") != "active_validated_macro_coverage":
                errors.append(f"invalid active seed basis:{row.get('window_id')}")
            for key in ("coverage_ref", "coverage_sha256", "active_pointer_ref", "active_pointer_sha256", "covered_window_ids_digest"):
                if row.get(key) != coverage_lineage.get(key):
                    errors.append(f"active seed lineage mismatch:{row.get('window_id')}:{key}")
        else:
            if row.get("basis") != "dual_validated_epoch_0013_roles":
                errors.append(f"invalid seed basis:{row.get('window_id')}")
            roles = row.get("role_credits")
            if not isinstance(roles, list) or {entry.get("role") for entry in roles} != {"exact_behavior", "adversarial_negative_space"}:
                errors.append(f"invalid seed roles:{row.get('window_id')}")
                continue
            for entry in roles:
                path = ROOT / str(entry.get("credit_ref"))
                if not path.is_file() or sha(path.read_bytes()) != entry.get("credit_sha256"):
                    errors.append(f"seed credit hash mismatch:{row.get('window_id')}:{entry.get('role')}")

    expected_assignment_count = authority.get("macro_assignment_count")
    if not isinstance(expected_assignment_count, int) or not expected_assignment_count:
        errors.append("authority macro assignment cardinality invalid")
    if len(assignments) != expected_assignment_count or len(macros) != expected_assignment_count or len(registry) != expected_assignment_count:
        errors.append("macro/assignment/registry cardinality disagrees with authority")
    assignment_by_id = {row.get("assignment_id"): row for row in assignments}
    macro_by_assignment = {row.get("assignment_id"): row for row in macros}
    registry_by_assignment = {row.get("assignment_id"): row for row in registry}
    if not (len(assignment_by_id) == len(assignments) == len(macro_by_assignment) == len(registry_by_assignment)):
        errors.append("assignment identity duplication or set mismatch")
    if set(assignment_by_id) != set(macro_by_assignment) or set(assignment_by_id) != set(registry_by_assignment):
        errors.append("assignment identity sets disagree")

    covered: list[str] = []
    prior_by_doc: dict[str, int] = {}
    for assignment_id in sorted(assignment_by_id):
        assignment = assignment_by_id[assignment_id]
        macro = macro_by_assignment.get(assignment_id, {})
        reg = registry_by_assignment.get(assignment_id, {})
        expected_attempt = f"attempt-{int(args.epoch.rsplit('-', 1)[1]):04d}"
        if assignment.get("audit_id") != AUDIT_ID or assignment.get("attempt_id") != expected_attempt:
            errors.append(f"assignment authority mismatch:{assignment_id}")
        if assignment.get("model") != "gpt-5.6-sol" or assignment.get("reasoning_effort") != "xhigh":
            errors.append(f"assignment model lane mismatch:{assignment_id}")
        window_ids = assignment.get("micro_window_ids")
        if not isinstance(window_ids, list) or not 1 <= len(window_ids) <= MAX_BUNDLE_WINDOWS:
            errors.append(f"invalid bundle window cardinality:{assignment_id}")
            continue
        if assignment.get("micro_window_count") != len(window_ids):
            errors.append(f"micro-window count field mismatch:{assignment_id}")
        if assignment.get("token_estimate", MAX_BUNDLE_TOKENS + 1) > MAX_BUNDLE_TOKENS:
            errors.append(f"bundle token cap exceeded:{assignment_id}")
        rows = [micro_by_id.get(window_id) for window_id in window_ids]
        if any(row is None for row in rows):
            errors.append(f"unknown micro-window:{assignment_id}")
            continue
        document_path = assignment.get("document_path")
        if any(row.get("document_path") != document_path for row in rows if row):
            errors.append(f"cross-document bundle:{assignment_id}")
        for before, after in zip(rows, rows[1:]):
            if after["core_line_start"] != before["core_line_end"] + 1:
                errors.append(f"noncontiguous bundle:{assignment_id}")
        expected_tokens = sum(row["token_estimate"] for row in rows)
        if assignment.get("token_estimate") != expected_tokens:
            errors.append(f"token estimate mismatch:{assignment_id}")
        expected_range = [rows[0]["core_line_start"], rows[-1]["core_line_end"]]
        if assignment.get("bundle_core_range") != expected_range:
            errors.append(f"core range mismatch:{assignment_id}")
        if macro.get("micro_window_ids") != window_ids or macro.get("bundle_id") != assignment.get("bundle_id"):
            errors.append(f"macro manifest mismatch:{assignment_id}")

        capsule_path = epoch / str(assignment.get("capsule_ref"))
        excerpt_path = epoch / str(assignment.get("source_excerpt_ref"))
        if not capsule_path.is_file() or sha(capsule_path.read_bytes()) != assignment.get("capsule_sha256"):
            errors.append(f"capsule hash mismatch:{assignment_id}")
            continue
        if not excerpt_path.is_file() or sha(excerpt_path.read_bytes()) != assignment.get("source_excerpt_sha256"):
            errors.append(f"excerpt hash mismatch:{assignment_id}")
            continue
        if excerpt_path.read_bytes() != excerpt_bytes(document_path, expected_range):
            errors.append(f"excerpt body mismatch:{assignment_id}")
        capsule = load_obj(capsule_path)
        if capsule.get("assignment_id") != assignment_id or capsule.get("micro_window_ids") != window_ids:
            errors.append(f"capsule identity mismatch:{assignment_id}")
        if capsule.get("required_dimensions") != DIMENSIONS:
            errors.append(f"capsule dimensions mismatch:{assignment_id}")
        contract = capsule.get("result_contract")
        if not isinstance(contract, dict) or contract.get("top_keys") != sorted(TOP_KEYS) or contract.get("item_keys") != sorted(ITEM_KEYS):
            errors.append(f"capsule exact result contract missing:{assignment_id}")
        capsule_segments = capsule.get("segments")
        if not isinstance(capsule_segments, list) or len(capsule_segments) != len(rows):
            errors.append(f"capsule segment cardinality:{assignment_id}")
        else:
            for segment, source in zip(capsule_segments, rows):
                if segment.get("window_id") != source["window_id"]:
                    errors.append(f"capsule segment order:{assignment_id}")
                if segment.get("required_source_unit_refs") != source_unit_refs(segment):
                    errors.append(f"capsule source-unit refs:{assignment_id}:{segment.get('window_id')}")
        if reg.get("capsule_sha256") != assignment.get("capsule_sha256") or reg.get("source_excerpt_sha256") != assignment.get("source_excerpt_sha256"):
            errors.append(f"capsule registry mismatch:{assignment_id}")
        output = ROOT / str(assignment.get("output_directory"))
        if not output.is_dir() or any(output.iterdir()):
            errors.append(f"prelaunch output is not empty:{assignment_id}")
        covered.extend(window_ids)

    if len(covered) != len(set(covered)):
        errors.append("micro-window assigned to multiple macro bundles")
    if set(covered) & seed_set:
        errors.append("seeded micro-window also assigned")
    if set(covered) | seed_set != set(micro_by_id):
        errors.append("seed plus macro assignments do not close micro-window universe")

    pilot_target = min(GLOBAL_CONCURRENCY, len(assignments))
    if not isinstance(pilot, list) or len(pilot) != pilot_target or len(pilot) != len(set(pilot)):
        errors.append(f"pilot assignment set is not {pilot_target} unique rows")
    elif any(assignment_id not in assignment_by_id for assignment_id in pilot):
        errors.append("pilot contains unknown assignment")
    else:
        candidates = sorted(
            assignments,
            key=lambda row: (-row["token_estimate"], row["document_path"], row["assignment_id"]),
        )
        expected: list[str] = []
        seen_docs: set[str] = set()
        for row in candidates:
            if row["document_path"] in seen_docs:
                continue
            expected.append(row["assignment_id"])
            seen_docs.add(row["document_path"])
            if len(expected) == pilot_target:
                break
        if len(expected) < pilot_target:
            selected = set(expected)
            for row in candidates:
                if row["assignment_id"] in selected:
                    continue
                expected.append(row["assignment_id"])
                selected.add(row["assignment_id"])
                if len(expected) == pilot_target:
                    break
        if pilot != expected:
            errors.append("pilot is not the deterministic maximally document-diverse set")

    if architecture.get("global_semantic_concurrency") != GLOBAL_CONCURRENCY:
        errors.append("architecture concurrency mismatch")
    if architecture.get("integrated_exact_and_adversarial_role") is not True:
        errors.append("integrated review role disabled")
    if architecture.get("leaf_written_terminal_seal_removed") is not True:
        errors.append("leaf terminal simplification missing")
    if policy.get("batch_size") != GLOBAL_CONCURRENCY or policy.get("global_concurrency") != GLOBAL_CONCURRENCY:
        errors.append("batch policy concurrency mismatch")
    if policy.get("max_bundle_tokens") != MAX_BUNDLE_TOKENS or policy.get("max_bundle_micro_windows") != MAX_BUNDLE_WINDOWS:
        errors.append("batch sizing policy mismatch")
    if policy.get("result_contract") != "exactly_one_regular_json_file_in_output_directory":
        errors.append("result contract mismatch")
    errors.extend(strict_schema_issues(epoch / "schemas/macro_review_result.schema.json"))

    current_source_root = canonical_root(scope, errors)
    if current_source_root != authority.get("canonical_source_root_sha256") or current_source_root != seal.get("canonical_source_root_sha256"):
        errors.append("canonical source root mismatch")
    payload_files = sorted(
        path for path in epoch.rglob("*")
        if path.is_file() and path.name not in {"authority.json", "launch_seal.json"}
    )
    if root_hash(payload_files, epoch) != authority.get("payload_root_sha256"):
        errors.append("authority payload root mismatch")
    sealed_files = sorted(path for path in epoch.rglob("*") if path.is_file() and path.name != "launch_seal.json")
    if root_hash(sealed_files, epoch) != seal.get("sealed_payload_root_sha256"):
        errors.append("launch sealed payload root mismatch")
    if sha((epoch / "authority.json").read_bytes()) != seal.get("authority_sha256"):
        errors.append("launch authority hash mismatch")
    if seal.get("coverage_credit_before_validation") != 0:
        errors.append("prelaunch seal grants coverage")

    report = {
        "audit_id": AUDIT_ID,
        "checker": "macro_epoch_independent_v2",
        "epoch_id": args.epoch,
        "status": "pass" if not errors else "fail",
        "errors": sorted(set(errors)),
        "counts": {
            "micro_windows": len(micro),
            "seeded_windows": len(seed_set),
            "assigned_windows": len(covered),
            "macro_assignments": len(assignments),
            "pilot_assignments": len(pilot) if isinstance(pilot, list) else 0,
        },
        "canonical_source_root_sha256": current_source_root,
        "authority_sha256": sha((epoch / "authority.json").read_bytes()),
        "launch_seal_sha256": sha((epoch / "launch_seal.json").read_bytes()),
        "coverage_seed_sha256": (
            sha((epoch / "lineage/coverage_seed.json").read_bytes())
            if (epoch / "lineage/coverage_seed.json").is_file() else None
        ),
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
