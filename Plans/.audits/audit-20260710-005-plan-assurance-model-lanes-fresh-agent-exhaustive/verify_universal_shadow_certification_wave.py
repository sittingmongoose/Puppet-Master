#!/usr/bin/env python3
"""Fail-closed prelaunch verifier for the universal shadow-certification candidate."""

from __future__ import annotations

import json
import subprocess
from collections import Counter
from pathlib import Path

from prepare_universal_shadow_certification_wave import (
    SCRIPT_NAMES, STATUS, activation_contract, architecture, controls, intent,
    packet_models, static_files,
)
from universal_shadow_certification_common import (
    ASSIGNMENT_COUNT, AUDIT_ROOT, FEATURE_COUNT, FEATURES_PER_ASSIGNMENT,
    NAMESPACE, OUTPUT_ROOT, PACKET_CEILING_BYTES, V9_REF, V9_SHA256, WAVE_ID,
    canonical_json, digest_values, load_jsonl, load_object, reconstruct_source_snapshot,
    root_hash, sha_file,
)


def main() -> None:
    errors: list[str] = []
    try:
        snapshot = reconstruct_source_snapshot()
        packets, expected_manifest, expected_registry = packet_models()
        expected_static = static_files()
        manifest = load_jsonl(NAMESPACE / "batch_manifest.jsonl")
        registry = load_jsonl(NAMESPACE / "packet_registry.jsonl")
        authority = load_object(NAMESPACE / "batch_authority.json")
        seal = load_object(NAMESPACE / "launch_seal.json")
        local = load_object(NAMESPACE / "validation/local_candidate_report.json")
    except Exception as exc:
        print(json.dumps({"status": "fail", "errors": ["load:%s:%s" % (type(exc).__name__, exc)]}, indent=2))
        raise SystemExit(1)
    if manifest != expected_manifest:
        errors.append("manifest-determinism")
    if registry != expected_registry:
        errors.append("registry-determinism")
    for path, expected in expected_static.items():
        if not path.is_file() or path.read_bytes() != expected:
            errors.append("static-artifact-drift:%s" % path.relative_to(NAMESPACE))
    packet_sizes: list[int] = []
    all_refs: list[str] = []
    domain_spans: list[int] = []
    source_spans: list[int] = []
    for index, (packet, row) in enumerate(zip(packets, manifest), 1):
        packet_path = NAMESPACE / row["packet_ref"]
        expected_raw = canonical_json(packet)
        if not packet_path.is_file() or packet_path.read_bytes() != expected_raw:
            errors.append("packet-determinism:%s" % row["assignment_id"])
            continue
        packet_sizes.append(len(expected_raw))
        if len(expected_raw) > PACKET_CEILING_BYTES or row["packet_bytes"] != len(expected_raw) or row["packet_sha256"] != sha_file(packet_path):
            errors.append("packet-byte-hash-ceiling:%s" % row["assignment_id"])
        if packet["feature_count"] != FEATURES_PER_ASSIGNMENT or len(packet["feature_refs"]) != FEATURES_PER_ASSIGNMENT:
            errors.append("packet-not-243:%s" % row["assignment_id"])
        domain_spans.append(len(packet["owner_domain_counts"]))
        source_spans.append(len(packet["source_assignment_counts"]))
        if domain_spans[-1] != 16 or source_spans[-1] != 24:
            errors.append("packet-cross-balance:%s" % row["assignment_id"])
        if packet["feature_refs_digest"] != digest_values(packet["feature_refs"]):
            errors.append("packet-coverage-digest:%s" % row["assignment_id"])
        all_refs.extend(packet["feature_refs"])
        intent_path = NAMESPACE / row["intent_ref"]
        if not intent_path.is_file() or load_object(intent_path) != intent(row):
            errors.append("intent-determinism:%s" % row["assignment_id"])
        output = Path(row["output_directory"])
        if not output.is_dir() or any(output.iterdir()):
            errors.append("output-zero-state:%s" % row["assignment_id"])
        if intent_path.with_name("dispatch_receipt.json").exists():
            errors.append("receipt-exists:%s" % row["assignment_id"])
    if len(all_refs) != len(set(all_refs)) or len(all_refs) != FEATURE_COUNT:
        errors.append("global-3888-partition")
    if len(manifest) != ASSIGNMENT_COUNT or len(registry) != ASSIGNMENT_COUNT or len(packet_sizes) != ASSIGNMENT_COUNT:
        errors.append("candidate-cardinality")
    if authority.get("status") != STATUS or seal.get("status") != STATUS or local.get("status") != STATUS:
        errors.append("blocked-status")
    if any(value is not False for value in (authority.get("activation_authorized"), seal.get("activation_authorized"), local.get("activation_authorized"))):
        errors.append("activation-not-false")
    if any(value != 0 for value in (authority.get("certification_credit"), seal.get("certification_credit"), local.get("certification_credit"))):
        errors.append("prelaunch-credit")
    try:
        expected_controls = controls()
        for path, expected in expected_controls.items():
            if not path.is_file() or path.read_bytes() != expected:
                errors.append("control-determinism:%s" % path.relative_to(NAMESPACE))
    except Exception as exc:
        errors.append("control-recompute:%s:%s" % (type(exc).__name__, exc))
    if not (AUDIT_ROOT / V9_REF).is_file() or sha_file(AUDIT_ROOT / V9_REF) != V9_SHA256:
        errors.append("v9-binding")
    for name in SCRIPT_NAMES:
        path = AUDIT_ROOT / name
        if not path.is_file() or authority.get("script_sha256", {}).get(name) != sha_file(path):
            errors.append("script-binding:%s" % name)
    forbidden = []
    forbidden.extend(NAMESPACE.glob("activation/**/*"))
    forbidden.extend(NAMESPACE.glob("**/dispatch_receipt.json"))
    forbidden.extend(NAMESPACE.glob("**/result.json"))
    forbidden.extend(NAMESPACE.glob("runtime/native_capture.json"))
    if [path for path in forbidden if path.is_file()]:
        errors.append("forbidden-live-artifact")
    output_dirs = sorted(OUTPUT_ROOT.glob("A005ERSC-*/attempts/attempt-0001"))
    if len(output_dirs) != ASSIGNMENT_COUNT or any(not path.is_dir() or any(path.iterdir()) for path in output_dirs):
        errors.append("output-directory-set")
    tests = subprocess.run(["python3", "-B", "test_universal_shadow_certification_validator.py"], cwd=AUDIT_ROOT, text=True, capture_output=True, check=False)
    try:
        test_report = json.loads(tests.stdout)
    except Exception:
        test_report = {"status": "fail", "passed": 0, "total": 0}
    if tests.returncode != 0 or test_report.get("status") != "pass" or test_report.get("total", 0) < 100 or test_report.get("passed") != test_report.get("total"):
        errors.append("strict-test-harness")
    report = {
        "audit_id": AUDIT_ROOT.name,
        "verifier": "universal-shadow-certification-prelaunch-v1",
        "wave_id": WAVE_ID,
        "status": "pass" if not errors else "fail",
        "activation_status": STATUS,
        "errors": sorted(set(errors)),
        "counts": {"assignments": len(manifest), "packets": len(packet_sizes), "intents": sum(1 for row in manifest if (NAMESPACE / row["intent_ref"]).is_file()), "features": len(all_refs), "unique_features": len(set(all_refs)), "source_results": len(snapshot["source_result_hashes"]), "owner_domains": len(snapshot["source_domain_counts"]), "empty_outputs": len(output_dirs), "receipts": len(list(NAMESPACE.glob("**/dispatch_receipt.json"))), "results": len(list(OUTPUT_ROOT.glob("**/result.json"))), "activation_files": len([path for path in NAMESPACE.glob("activation/**/*") if path.is_file()])},
        "packet_bytes": {"min": min(packet_sizes) if packet_sizes else 0, "max": max(packet_sizes) if packet_sizes else 0, "total": sum(packet_sizes), "hard_ceiling": PACKET_CEILING_BYTES},
        "features_per_assignment": sorted(set(row["feature_count"] for row in manifest)),
        "owner_domains_per_packet": sorted(set(domain_spans)),
        "source_assignments_per_packet": sorted(set(source_spans)),
        "coverage_digest": digest_values(all_refs),
        "strict_tests": {"passed": test_report.get("passed", 0), "total": test_report.get("total", 0)},
        "remaining_gate": "independent Luna prelaunch report satisfying activation_contract.json",
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()

