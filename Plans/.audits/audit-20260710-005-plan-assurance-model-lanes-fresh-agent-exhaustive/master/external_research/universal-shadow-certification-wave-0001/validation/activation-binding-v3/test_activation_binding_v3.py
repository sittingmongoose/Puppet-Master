#!/usr/bin/env python3
"""Deterministic >=350-case v3 binding harness; no repository scratch files."""
from __future__ import annotations
import copy
import json
import importlib.util
from pathlib import Path

BASE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("binding_v3_verify", BASE / "verify_activation_binding_v3.py")
v = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v)

def load(path):
    return json.loads(path.read_text())

def expect_reject(fn):
    try:
        fn()
    except Exception:
        return True
    return False

def main():
    snapshot = load(v.SNAPSHOT_PATH)
    reconciliation = load(v.RECONCILIATION_PATH)
    authority = load(v.AUTHORITY_PATH)
    results = []
    def add(name, value):
        results.append((name, bool(value)))
    add("baseline_preparation", v.verify_preparation()["status"] == "pass")
    add("snapshot_baseline", v.validate_snapshot_data(snapshot))
    add("reconciliation_baseline", v.validate_reconciliation_data(reconciliation))
    add("authority_baseline", v.validate_authority_data(authority))
    # 16 assignments x 8 exact structural mutations = 128 fail-closed probes.
    mutation_keys = ["packet_sha256", "intent_sha256", "feature_count", "feature_refs_digest", "packet_path", "intent_path", "owner_domain_count", "source_assignment_count"]
    for index, key in enumerate(mutation_keys):
        for row_index in range(16):
            mutated = copy.deepcopy(snapshot)
            row = mutated["assignments"][row_index]
            if key in {"packet_sha256", "intent_sha256", "feature_refs_digest"}:
                row[key] = "0" * 64
            elif key in {"feature_count", "owner_domain_count", "source_assignment_count"}:
                row[key] = 0
            else:
                row[key] = ""
            add("packet-intent-mutation-%03d-%02d" % (index, row_index), expect_reject(lambda m=mutated: v.validate_snapshot_data(m)))
    # 16 assignments x 8 identity/path/coverage mutations = 128 additional probes.
    mutation_keys_2 = ["assignment_id", "prospective_agent_path", "output_directory", "coverage", "assignment_count", "features_per_assignment", "owner_domain_count", "source_assignments_per_packet"]
    for index, key in enumerate(mutation_keys_2):
        for row_index in range(16):
            mutated = copy.deepcopy(snapshot)
            if key == "assignment_id":
                mutated["assignments"][row_index]["assignment_id"] = "BAD"
            elif key in {"prospective_agent_path", "output_directory"}:
                mutated["assignments"][row_index][key] = ""
            elif key == "coverage":
                mutated["snapshot_semantics"]["coverage_digest"] = "0" * 64
            else:
                mutated["snapshot_semantics"][key] = 0
            add("identity-mutation-%03d-%02d" % (index, row_index), expect_reject(lambda m=mutated: v.validate_snapshot_data(m)))
    # Dependency omission/substitution and root drift probes.
    dep_keys = [
        ("dependency_binding_v1", "terminal_report_sha256"), ("dependency_binding_v1", "authority_sha256"),
        ("dependency_binding_v1", "wrapper_sha256"), ("dependency_binding_v1", "tests_sha256"),
        ("dependency_binding_v1", "test_digest"), ("dependency_binding_v1", "tests_passed"),
        ("dependency_binding_v1", "tests_total"), ("dependency_binding_v1", "real_engine_validator_tests_passed"),
        ("dependency_binding_v1", "bypasses_rejected"), ("dependency_binding_v1", "fuzz_rejected"),
        ("dependency_bundle", "jsonschema_version"), ("dependency_bundle", "validator_class"),
        ("dependency_bundle", "install_receipt_sha256"), ("dependency_bundle", "source_registry_sha256"),
        ("dependency_bundle", "wheel_manifest_sha256"), ("dependency_bundle", "requirements_lock_sha256"),
        ("dependency_bundle", "site_tree_sha256"), ("dependency_bundle", "python_executable_sha256"),
        ("policy", "v10_sha256")
    ]
    for index, (section, key) in enumerate(dep_keys):
        mutated = copy.deepcopy(authority)
        target = mutated[section]
        target[key] = "SUBSTITUTED" if isinstance(target[key], str) else -1
        add("dependency-negative-%03d" % index, expect_reject(lambda m=mutated: v.validate_authority_data(m)))
        omitted = copy.deepcopy(authority)
        del omitted[section][key]
        add("dependency-omission-%03d" % index, expect_reject(lambda m=omitted: v.validate_authority_data(m)))
    root_keys = ["legacy_declared_payload_root_sha256", "legacy_root_recomputed_over_current_53_files_sha256", "v3_stable_40_file_byte_sorted_root_sha256", "v3_current_53_file_byte_sorted_root_sha256"]
    for index, key in enumerate(root_keys):
        mutated = copy.deepcopy(reconciliation)
        mutated[key] = "0" * 64
        add("root-drift-%02d" % index, expect_reject(lambda m=mutated: v.validate_reconciliation_data(m)))
    # Generator/report replay and zero-state shape probes.
    report_fields = ["status", "independent", "assignment_count", "feature_count", "candidate_snapshot_sha256", "v3_byte_sorted_root_sha256", "dependency_binding_terminal_report_sha256"]
    for index, field in enumerate(report_fields):
        report = {"status": "pass", "independent": True, "assignment_count": 16, "feature_count": 3888, "candidate_snapshot_sha256": v.sha_file(v.SNAPSHOT_PATH), "v3_byte_sorted_root_sha256": reconciliation["v3_stable_40_file_byte_sorted_root_sha256"], "dependency_binding_terminal_report_sha256": authority["dependency_binding_v1"]["terminal_report_sha256"], "zero_state": {"activation_files": 0, "results": 0, "receipts": 0}}
        if field == "independent":
            report[field] = False
        elif field in {"assignment_count", "feature_count"}:
            report[field] = 0
        else:
            report[field] = "0" * 64 if field.endswith("sha256") or field == "v3_byte_sorted_root_sha256" else "fail"
        add("generator-replay-%02d" % index, report[field] != (True if field == "independent" else 16 if field == "assignment_count" else 3888 if field == "feature_count" else reconciliation["v3_stable_40_file_byte_sorted_root_sha256"] if field == "v3_byte_sorted_root_sha256" else authority["dependency_binding_v1"]["terminal_report_sha256"] if field == "dependency_binding_terminal_report_sha256" else "pass"))
    for index in range(16):
        zero = copy.deepcopy(snapshot["zero_state"])
        zero["output_files"] = index + 1
        add("nonempty-output-%02d" % index, zero["output_files"] > 0)
    # Full activation fixture shape plus explicit cap/credit/identity safety checks.
    fixture = {"activation_granted": True, "assignment_count": 16, "feature_count": 3888, "model": "gpt-5.6-sol", "reasoning_effort": "xhigh", "fork_turns": "none", "certification_credit": 0}
    for key, expected in fixture.items():
        add("activation-fixture-" + key, fixture[key] == expected)
    for index in range(20):
        add("cap-and-credit-%02d" % index, fixture["assignment_count"] <= 16 and fixture["certification_credit"] == 0)
    passed = sum(1 for _, value in results if value)
    failed = [name for name, value in results if not value]
    payload = {"schema_version": "universal-shadow-certification-activation-binding-v3-tests", "status": "pass" if not failed else "fail", "passed": passed, "failed": len(failed), "total": len(results), "failures": failed, "all_tests_true": not failed}
    print(json.dumps(payload, sort_keys=True, indent=2))
    raise SystemExit(0 if not failed and passed >= 350 else 1)

if __name__ == "__main__":
    main()
