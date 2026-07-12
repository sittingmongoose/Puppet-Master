#!/usr/bin/env python3
"""Fail-closed verifier for the Audit005 final aggregate closure preparation."""
from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
from typing import Any

from jsonschema import Draft202012Validator


REPO = pathlib.Path("/Users/jaredsmacbookair/Documents/PuppetMaster")
AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
HERE = pathlib.Path(__file__).resolve().parent
HERE_REL = HERE.relative_to(REPO).as_posix()
EXPECTED_CHANGED = ["Plans/FinalGUISpec.md", "Plans/PRD_Builder.md", "Plans/Planning_Wizard.md"]
EXPECTED_LANES = {
    "legacy_micro_projection": "lineage_only_superseded",
    "frozen_macro_semantic_coverage": "satisfied_frozen_scope",
    "current_live_head_delta": "blocking",
    "feature_catalog": "satisfied",
    "owner_merge": "satisfied",
    "cross_shard_adjudication": "blocking",
    "cross_cutting_research": "satisfied",
    "universal_research_primary": "satisfied",
    "universal_research_shadow_certification": "blocking",
    "scenario_cohort_0001": "satisfied_checkpoint_zero_promotion",
    "scenario_cohort_0002": "blocking",
    "scenario_cohorts_0003_0004": "blocking",
    "cross_domain_seams": "satisfied_checkpoint_zero_promotion",
    "aggregate_independent_verifier": "blocking",
}
EXPECTED_BLOCKERS = [f"A005-AGG-B{i:03d}" for i in range(1, 8)]
PINNED = {
    "scenario": "188b4ebce79cefef6463315ea12097bd1c17b974618363c2f448baba1075fa27",
    "certification": "6a31474c4e6943e812776739cf87a7efeeba6cda1937bc0a94d645cf145839e1",
    "v31": "95de3fd798c857751cc6b031d62a4a7a40abe931f9fa1e49590cff0fec6257b5",
    "v32": "4826ade4c38db47ee184b34e5d7b7bd5ba6cabeecc9baa686cb9d99eeff8a3ed",
}


def canonical_bytes(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def sha_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha_file(path: pathlib.Path) -> str:
    return sha_bytes(path.read_bytes())


def load(name: str) -> Any:
    return json.loads((HERE / name).read_text())


def rows(name: str) -> list[dict[str, Any]]:
    return [json.loads(line) for line in (HERE / name).read_text().splitlines() if line.strip()]


def schema_errors(schema: dict[str, Any], instance: dict[str, Any]) -> list[str]:
    return sorted(error.message for error in Draft202012Validator(schema).iter_errors(instance))


def ref_error(ref: str, expected_sha: str, label: str) -> list[str]:
    path = REPO / ref
    if not path.is_file():
        return [f"missing-ref:{label}:{ref}"]
    actual = sha_file(path)
    return [] if actual == expected_sha else [f"hash:{label}:{actual}"]


def manifest_errors(manifest: dict[str, Any], bundle: dict[str, Any] | None = None) -> list[str]:
    errors = [f"schema:{message}" for message in schema_errors(load("closure_manifest.schema.json"), manifest)]
    if manifest.get("audit_id") != AUDIT_ID:
        errors.append("audit-id")
    taxonomy = manifest.get("pointer_taxonomy", {})
    legacy = taxonomy.get("legacy", {})
    frozen = taxonomy.get("frozen_macro", {})
    current = taxonomy.get("current_live_head", {})
    if legacy.get("disposition") != "SUPERSEDED_LINEAGE_ONLY_NOT_AGGREGATE_PROGRESS_AUTHORITY" or legacy.get("mutated") is not False:
        errors.append("legacy-supersession")
    if (legacy.get("credited_assignments"), legacy.get("assignment_total"), legacy.get("pending_assignments")) != (63, 2538, 2475):
        errors.append("legacy-counts")
    if (frozen.get("covered_micro_windows"), frozen.get("micro_window_total"), frozen.get("credited_macro_assignments")) != (1269, 1269, 256):
        errors.append("frozen-macro-counts")
    if frozen.get("status") != "complete_on_frozen_source_scope":
        errors.append("frozen-macro-status")
    if current.get("status") != "delta_certification_required" or current.get("delta_certification") is not None:
        errors.append("current-live-head-status")
    if current.get("changed_canonical_paths") != EXPECTED_CHANGED or current.get("changed_canonical_count") != 3 or current.get("derived_integrity_count") != 12:
        errors.append("current-live-head-scope")
    lane_rows = manifest.get("lane_checkpoints", [])
    lane_ids = [row.get("lane_id") for row in lane_rows if isinstance(row, dict)]
    if len(lane_ids) != len(set(lane_ids)):
        errors.append("duplicate-lane")
    observed_lanes = {row.get("lane_id"): row.get("status") for row in lane_rows if isinstance(row, dict)}
    if observed_lanes != EXPECTED_LANES:
        errors.append("lane-state-map")
    for row in lane_rows:
        if not isinstance(row, dict):
            continue
        if row.get("aggregate_credit_granted") != 0:
            errors.append(f"lane-credit:{row.get('lane_id')}")
        for index, item in enumerate(row.get("evidence", [])):
            if isinstance(item, dict) and isinstance(item.get("ref"), str) and isinstance(item.get("sha256"), str):
                errors.extend(ref_error(item["ref"], item["sha256"], f"lane:{row.get('lane_id')}:{index}"))
    unresolved = manifest.get("unresolved", {})
    if unresolved.get("count") != 7 or unresolved.get("blocker_ids") != EXPECTED_BLOCKERS:
        errors.append("unresolved-state")
    if manifest.get("manifest_kind") != "blocked_preparation" or manifest.get("status") != "BLOCKED_UNRESOLVED_PREREQUISITES":
        errors.append("blocked-manifest-state")
    if manifest.get("closure_authorized") is not False or manifest.get("issued") is not False:
        errors.append("closure-authority")
    checkpoint = manifest.get("independent_checkpoint", {})
    if checkpoint != {"present": False, "checkpoint": None, "status": None, "fresh_direct": False, "model": None, "reasoning_effort": None}:
        errors.append("independent-checkpoint-zero")
    if any(value != 0 for value in manifest.get("zero_state", {}).values()):
        errors.append("zero-state")
    no_write = manifest.get("no_canonical_write", {})
    if no_write.get("attested") is not True or no_write.get("canonical_plan_writes") != 0:
        errors.append("no-canonical-write")
    lineage = manifest.get("preparation_only_lineage", [])
    if [row.get("sha256") for row in lineage if isinstance(row, dict)] != [PINNED["scenario"], PINNED["certification"]]:
        errors.append("preparation-only-pins")
    if any(row.get("classification") != "PREPARATION_ONLY_NOT_CLOSURE_EVIDENCE" for row in lineage if isinstance(row, dict)):
        errors.append("preparation-only-classification")
    pacing = manifest.get("current_pacing_policy", {})
    if pacing.get("current", {}).get("sha256") != PINNED["v32"] or pacing.get("prior_lineage", {}).get("sha256") != PINNED["v31"]:
        errors.append("policy-lineage")
    if pacing.get("sealed") is not False or pacing.get("seal_evidence") is not None or pacing.get("prior_lineage_mutated") is not False:
        errors.append("policy-unsealed-state")
    for label, item in (
        ("authority", manifest.get("authority", {})),
        ("unresolved", {"ref": unresolved.get("inventory_ref"), "sha256": unresolved.get("inventory_sha256")}),
        ("no-write", {"ref": no_write.get("attestation_ref"), "sha256": no_write.get("attestation_sha256")}),
        ("legacy", {"ref": legacy.get("ref"), "sha256": legacy.get("sha256")}),
        ("frozen-active", {"ref": frozen.get("active_ref"), "sha256": frozen.get("active_sha256")}),
        ("frozen-coverage", {"ref": frozen.get("coverage_ref"), "sha256": frozen.get("coverage_sha256")}),
        ("frozen-scope", {"ref": frozen.get("source_scope_ref"), "sha256": frozen.get("source_scope_sha256")}),
        ("live-observation", {"ref": current.get("observation_ref"), "sha256": current.get("observation_sha256")}),
        ("policy-v32", pacing.get("current", {})),
        ("policy-v31", pacing.get("prior_lineage", {})),
    ):
        if isinstance(item.get("ref"), str) and isinstance(item.get("sha256"), str):
            errors.extend(ref_error(item["ref"], item["sha256"], label))
        else:
            errors.append(f"malformed-ref:{label}")
    if bundle is not None:
        expected_authority = bundle["authority"]
        expected_unresolved = bundle["unresolved"]
        expected_no_write = bundle["no_write"]
        if manifest.get("authority", {}).get("sha256") != sha_file(HERE / "AUTHORITY.json") or manifest.get("authority", {}).get("ref") != f"{HERE_REL}/AUTHORITY.json":
            errors.append("authority-binding")
        if unresolved.get("inventory_sha256") != sha_file(HERE / "unresolved_inventory.json") or unresolved.get("inventory_ref") != f"{HERE_REL}/unresolved_inventory.json":
            errors.append("unresolved-binding")
        if no_write.get("attestation_sha256") != sha_file(HERE / "no_canonical_write_attestation.json") or no_write.get("attestation_ref") != f"{HERE_REL}/no_canonical_write_attestation.json":
            errors.append("no-write-binding")
        if expected_authority.get("closure_manifest_issuance_authorized") is not False or expected_unresolved.get("closure_authorized") is not False or expected_no_write.get("canonical_plan_writes") != 0:
            errors.append("supporting-authority-state")
    return sorted(set(errors))


def load_bundle() -> dict[str, Any]:
    return {
        "authority": load("AUTHORITY.json"),
        "manifest": load("closure_manifest.candidate.json"),
        "pointer_map": load("pointer_authority_map.json"),
        "lanes": load("lane_checkpoint_inventory.json"),
        "unresolved": load("unresolved_inventory.json"),
        "no_write": load("no_canonical_write_attestation.json"),
        "readiness": load("readiness.json"),
        "hash_bundle": load("hash_bundle.json"),
        "live_head": load("current_live_head_observation.json"),
        "scope_rows": rows("source_scope_observation.jsonl"),
    }


def static_errors(bundle: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    for name in ("closure_manifest.schema.json", "aggregate_checkpoint.schema.json"):
        try:
            Draft202012Validator.check_schema(load(name))
        except Exception as exc:  # pragma: no cover - diagnostic path
            errors.append(f"invalid-schema:{name}:{exc}")
    errors.extend(manifest_errors(bundle["manifest"], bundle))
    authority = bundle["authority"]
    if authority.get("status") != "BLOCKED_PREPARATION_ONLY_UNRESOLVED_GATES" or authority.get("blocker_count") != 7:
        errors.append("authority-status")
    if authority.get("legacy_pointer_superseded_for_aggregate_progress") is not True or authority.get("legacy_63_of_2538_pointer_mutated") is not False:
        errors.append("authority-supersession")
    if authority.get("closure_manifest_issuance_authorized") is not False or authority.get("independent_checkpoint_present") is not False:
        errors.append("authority-closure")
    if any(value != 0 for value in authority.get("zero_state", {}).values()):
        errors.append("authority-zero-state")
    pointer = bundle["pointer_map"]
    if pointer.get("legacy", {}).get("sha256") != bundle["manifest"]["pointer_taxonomy"]["legacy"]["sha256"]:
        errors.append("pointer-map-legacy")
    if pointer.get("frozen_macro", {}).get("coverage_sha256") != bundle["manifest"]["pointer_taxonomy"]["frozen_macro"]["coverage_sha256"]:
        errors.append("pointer-map-macro")
    if pointer.get("current_live_head", {}).get("observation_sha256") != bundle["manifest"]["pointer_taxonomy"]["current_live_head"]["observation_sha256"]:
        errors.append("pointer-map-live")
    lanes = bundle["lanes"]
    if lanes.get("lane_count") != 14 or lanes.get("blocking_lane_count") != 6:
        errors.append("lane-inventory-counts")
    if {row.get("lane_id"): row.get("status") for row in lanes.get("lanes", [])} != EXPECTED_LANES:
        errors.append("lane-inventory-map")
    unresolved = bundle["unresolved"]
    if unresolved.get("blocker_count") != 7 or unresolved.get("blocker_ids") != EXPECTED_BLOCKERS:
        errors.append("unresolved-inventory-counts")
    if unresolved.get("closure_authorized") is not False or unresolved.get("aggregate_credit") != 0:
        errors.append("unresolved-authority")
    no_write = bundle["no_write"]
    if no_write.get("canonical_plan_writes") != 0 or no_write.get("existing_audit_artifacts_mutated") != 0 or no_write.get("attested") is not True:
        errors.append("no-write-attestation")
    scope_rows = bundle["scope_rows"]
    if len(scope_rows) != 135:
        errors.append("source-scope-count")
    changed = sorted(row.get("path") for row in scope_rows if row.get("changed_since_frozen_macro"))
    if changed != EXPECTED_CHANGED:
        errors.append("source-scope-delta")
    for row in scope_rows:
        path = REPO / str(row.get("path"))
        if not path.is_file() or sha_file(path) != row.get("live_source_sha256"):
            errors.append(f"live-source-drift:{row.get('path')}")
    live_head = bundle["live_head"]
    if live_head.get("combined_delta_file_count") != 15 or live_head.get("semantic_delta_certification_present") is not False:
        errors.append("live-head-state")
    derived = live_head.get("derived_integrity_observation", {}).get("rows", [])
    if len(derived) != 12 or not all(row.get("changed_from_git_head") for row in derived):
        errors.append("derived-integrity-state")
    for row in derived:
        path = REPO / str(row.get("path"))
        if not path.is_file() or sha_file(path) != row.get("live_sha256"):
            errors.append(f"derived-live-drift:{row.get('path')}")
    hash_bundle = bundle["hash_bundle"]
    for member in hash_bundle.get("core_members", []):
        errors.extend(ref_error(member.get("path", ""), member.get("sha256", ""), "core-member"))
        path = REPO / member.get("path", "")
        if path.is_file() and path.stat().st_size != member.get("byte_count"):
            errors.append(f"bytes:core-member:{member.get('path')}")
    for member in hash_bundle.get("external_evidence", []):
        errors.extend(ref_error(member.get("path", ""), member.get("sha256", ""), f"external:{member.get('evidence_id')}") )
    root_payload = {"core_members": hash_bundle.get("core_members"), "external_evidence": hash_bundle.get("external_evidence")}
    if sha_bytes(canonical_bytes(root_payload)) != hash_bundle.get("bundle_root_sha256"):
        errors.append("bundle-root")
    if hash_bundle.get("closure_manifest_issued") is not False or hash_bundle.get("aggregate_credit") != 0:
        errors.append("hash-bundle-closure-state")
    forbidden_names = {"result.json", "dispatch_receipt.json", "native_capture.json"}
    forbidden_dirs = {"dispatch", "results", "receipts", "runtime", "capture"}
    for path in HERE.rglob("*"):
        if path.is_symlink():
            errors.append(f"symlink:{path.relative_to(HERE)}")
        if path.is_file() and path.name in forbidden_names:
            errors.append(f"forbidden-file:{path.relative_to(HERE)}")
        if path.is_dir() and path.name in forbidden_dirs:
            errors.append(f"forbidden-dir:{path.relative_to(HERE)}")
    return sorted(set(errors))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-report", action="store_true")
    args = parser.parse_args()
    bundle = load_bundle()
    errors = static_errors(bundle)
    report = {
        "schema_version": "audit005-final-aggregate-prep-validation-report-v1",
        "status": "pass" if not errors else "fail_closed",
        "error_count": len(errors),
        "errors": errors,
        "counts": {
            "source_scope_rows": len(bundle["scope_rows"]),
            "changed_canonical_files": sum(row.get("changed_since_frozen_macro") is True for row in bundle["scope_rows"]),
            "derived_integrity_files": len(bundle["live_head"]["derived_integrity_observation"]["rows"]),
            "lanes": len(bundle["lanes"]["lanes"]),
            "blockers": bundle["unresolved"]["blocker_count"],
            "core_hash_members": len(bundle["hash_bundle"]["core_members"]),
            "external_evidence_members": len(bundle["hash_bundle"]["external_evidence"]),
        },
        "hash_bundle_sha256": sha_file(HERE / "hash_bundle.json"),
        "bundle_root_sha256": bundle["hash_bundle"]["bundle_root_sha256"],
        "closure_authorized": False,
        "launches": 0,
        "results": 0,
        "receipts": 0,
        "native_capture_rows": 0,
        "credit": 0,
        "canonical_plan_writes": 0,
    }
    if args.write_report:
        target = HERE / "validation_report.json"
        if target.exists():
            raise SystemExit("refusing overwrite: validation_report.json")
        target.write_bytes(canonical_bytes(report))
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
