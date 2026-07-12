#!/usr/bin/env python3
"""Pinned-runtime read-only verifier for C2 compatibility preparation."""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker

import c2_closure_core_v32 as core


NS = Path(__file__).resolve().parents[1]
GATE = NS.parent
AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
SITE = AUDIT / "master/dependencies/jsonschema-draft202012-v1/site-packages"
BASELINE = AUDIT / "master/external_research/universal-shadow-certification-wave-0001/retry-attempt-0002-v30/verification-v2/test_retry_attempt_0002_v30_v3.py"
EXPECTED_SCOPE = {
    "activation_authorized": False, "launch_authorized": False, "credit": 0, "spawn": "none", "spawn_count": 0,
    "result_count": 0, "receipt_count": 0, "runtime_native_capture_rows": 0, "activation_transactions": 0,
}
EXPECTED_ZERO_STATE = {
    "launches": 0, "reviewers": 0, "controllers": 0, "semantic_children": 0, "activations": 0,
    "generator_invocations": 0, "receipts": 0, "results": 0, "captures": 0, "checkpoints": 0,
    "promotion": 0, "canonical_reads": 0, "canonical_writes": 0, "credit": 0,
}
EXPECTED_INVOCATIONS = {
    "launches": 0, "reviewers": 0, "controllers": 0, "semantic_children": 0,
    "activations": 0, "generators": 0, "capture_writers": 0,
}
EXPECTED_PRODUCTION_ZERO = {
    "report_present": False, "capture_present": False, "checkpoint_present": False,
    "future_reviewer_authority_present": False, "future_capture_authority_present": False,
    "future_native_binding_present": False,
}
EXPECTED_TEST_PRODUCTION_ZERO = {
    **EXPECTED_PRODUCTION_ZERO,
    "reviewer_invocations": 0, "capture_writer_invocations": 0, "generator_invocations": 0,
}
EXPECTED_AUTHORITY_STATE = {
    "reviewer_authority_present": False, "capture_authority_present": False, "native_binding_present": False,
    "reviewer_invocation_authorized": False, "capture_writer_invocation_authorized": False,
    "activation_authorized": False, "launch_authorized": False,
}
EXPECTED_WRITER_POLICY = {
    "capture_tool_present": True, "capture_tool_invoked": False, "future_writer_present": False,
    "future_reviewer_present": False, "future_generator_present": False,
    "external_append_only_reviewer_authority_required": True,
    "external_append_only_capture_authority_required": True,
}
EXPECTED_NAMESPACE_FILES = (
    "AUTHORITY_C2_COMPATIBILITY_V32.json",
    "DEDUP_PRECHECK_C2.json",
    "PRIOR_C2_INVOCATION_BASELINE.json",
    "READINESS_BLOCKED_C2_V32.json",
    "TERMINAL_PREPARATION_C2_V32.json",
    "TEST_EVIDENCE_C2_V32.json",
    "TOOL_SEAL_C2_V32.json",
    "fixtures/sessions/controller.jsonl",
    "fixtures/sessions/reviewer.jsonl",
    "fixtures/valid-c2-atomic8-prelaunch-report.json",
    "fixtures/valid-c2-fresh-native-binding.json",
    "schemas/c2_atomic8_prelaunch_report_v32.schema.json",
    "schemas/c2_fresh_native_binding_v32.schema.json",
    "schemas/c2_future_capture_authority_v32.schema.json",
    "schemas/c2_future_reviewer_authority_v32.schema.json",
    "tools/c2_closure_core_v32.py",
    "tools/capture_c2_controller_native_v32.py",
    "tools/test_c2_compatibility_v32.py",
    "tools/verify_c2_compatibility_preparation_v32.py",
)
EXPECTED_SEALED_FILES = tuple(
    relative for relative in EXPECTED_NAMESPACE_FILES
    if relative not in {"TOOL_SEAL_C2_V32.json", "READINESS_BLOCKED_C2_V32.json", "TERMINAL_PREPARATION_C2_V32.json"}
)


def isolated_env() -> dict[str, str]:
    return {
        "HOME": os.environ.get("HOME", "/Users/jaredsmacbookair"),
        "PATH": str(core.PINNED_PYTHON.parent) + os.pathsep + "/usr/bin:/bin",
        "PYTHONPATH": str(SITE) + os.pathsep + str(NS / "tools"),
        "PYTHONNOUSERSITE": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONHASHSEED": "0",
        "LC_ALL": "C",
        "TZ": "UTC",
    }


def run_json(script: Path) -> tuple[int, dict[str, Any], str, str]:
    process = subprocess.run([str(core.PINNED_PYTHON), "-S", "-B", str(script)], cwd=AUDIT, env=isolated_env(), capture_output=True, check=False)
    try:
        document = json.loads(process.stdout)
    except (UnicodeDecodeError, json.JSONDecodeError):
        document = {"status": "unparseable"}
    return process.returncode, document, core.sha_bytes(process.stdout), process.stderr.decode("utf-8", "replace")[-4000:]


def main() -> int:
    run_tests = "--run-tests" in sys.argv[1:]
    run_baseline = "--run-baseline" in sys.argv[1:]
    errors: list[str] = []
    errors.extend(core.validate_runtime(AUDIT))

    authority_item, authority = core.stable_json(NS / "AUTHORITY_C2_COMPATIBILITY_V32.json", NS)
    core.require(errors, "authority-schema", authority.get("schema_version") == "a005-c2-controller-native-compatibility-closure-v32-authority-v1")
    try:
        live = core.verify_preparation(authority, audit_root=AUDIT, gate_root=GATE, namespace=NS)
    except core.ClosureError as exc:
        errors.extend(exc.codes)
        live = {}

    report_item, report = core.stable_json(NS / authority["future"]["exact_report_fixture_path"], NS)
    report_schema = json.loads(core.stable_read(NS / authority["future"]["report_schema_path"], NS).raw)
    errors.extend("fixture-report:" + item for item in core.schema_errors(report, report_schema))
    core.require(errors, "fixture-report-hash", report_item.sha256 == authority["future"]["exact_report_sha256"])
    binding_item, binding = core.stable_json(NS / authority["future"]["valid_native_binding_fixture_path"], NS)
    binding_schema = json.loads(core.stable_read(NS / authority["future"]["native_binding_schema_path"], NS).raw)
    binding_errors, parent_raw, parent_rows, child, child_raw, child_rows = core.validate_native_binding(binding, binding_schema, session_root=NS, fixture_root=NS)
    errors.extend("fixture-binding:" + item for item in binding_errors)
    core.require(errors, "fixture-binding-hash", binding_item.sha256 == authority["future"]["valid_native_binding_fixture_sha256"])
    evidence = core.FutureEvidence(report_item, report, binding_item, binding, parent_raw, parent_rows, child, child_raw, child_rows)
    checkpoint_raw, capture_raw, capture = core.build_checkpoint_capture(authority, evidence)
    capture_schema = json.loads(core.stable_read(GATE / authority["future"]["capture_output_schema_relative_to_gate"], GATE).raw)
    capture_schema_errors = ["fixture-capture:" + "/".join(map(str, item.absolute_path)) + ":" + item.validator for item in Draft202012Validator(capture_schema, format_checker=FormatChecker()).iter_errors(capture)]
    errors.extend(capture_schema_errors)

    seal_item, seal = core.stable_json(NS / "TOOL_SEAL_C2_V32.json", NS)
    tests_item, tests = core.stable_json(NS / "TEST_EVIDENCE_C2_V32.json", NS)
    readiness_item, readiness = core.stable_json(NS / "READINESS_BLOCKED_C2_V32.json", NS)
    terminal_item, terminal = core.stable_json(NS / "TERMINAL_PREPARATION_C2_V32.json", NS)
    try:
        census_rows, census_path_digest = core.closed_world_census(NS, AUDIT, EXPECTED_NAMESPACE_FILES)
    except core.ClosureError as exc:
        errors.extend(exc.codes)
        census_rows, census_path_digest = (), ""
    core.require(errors, "tool-seal-schema", seal.get("schema_version") == "a005-c2-compatibility-tool-seal-v1")
    core.require(errors, "tool-seal-status", seal.get("status") == "PASS_SEALED_PREPARATION_ONLY_ZERO_AUTHORITY_ZERO_INVOCATION")
    core.require(errors, "tool-seal-file-set", set(seal.get("file_hashes", {})) == set(EXPECTED_SEALED_FILES))
    for relative in EXPECTED_SEALED_FILES:
        expected = seal.get("file_hashes", {}).get(relative)
        item = core.stable_read(NS / relative, NS)
        core.require(errors, "tool-seal-drift:" + relative, item.sha256 == expected)
    core.require(errors, "tool-seal-runtime", seal.get("runtime") == authority["runtime"])
    core.require(errors, "tool-seal-scope", seal.get("scope") == EXPECTED_SCOPE)
    core.require(errors, "tool-seal-zero-state", seal.get("zero_state") == EXPECTED_ZERO_STATE)
    core.require(errors, "tool-seal-invocations", seal.get("invocations") == EXPECTED_INVOCATIONS)
    core.require(errors, "tool-seal-production-zero", seal.get("production_zero") == EXPECTED_PRODUCTION_ZERO)
    core.require(errors, "tool-seal-authority-state", seal.get("authority_state") == EXPECTED_AUTHORITY_STATE)
    core.require(errors, "tool-seal-writer-policy", seal.get("writer_policy") == EXPECTED_WRITER_POLICY)
    expected_test_binding = {"path": "TEST_EVIDENCE_C2_V32.json", "sha256": tests_item.sha256, "passed": 2085, "failed": 0}
    core.require(errors, "tool-seal-test-binding", seal.get("test_evidence") == expected_test_binding)
    errors.extend(core.validate_scope(seal.get("scope", {})))
    core.require(errors, "test-schema", tests.get("schema_version") == "a005-c2-compatibility-closure-test-evidence-v1")
    core.require(errors, "test-status", tests.get("status") == "PASS_PREPARATION_TESTS_PRODUCTION_ZERO")
    core.require(errors, "test-count", tests.get("new_c2_suite", {}).get("passed") == 1260 and tests.get("new_c2_suite", {}).get("failed") == 0)
    core.require(errors, "test-grand-total", tests.get("grand_total", {}).get("passed") == 2085 and tests.get("grand_total", {}).get("failed") == 0)
    core.require(errors, "test-production-zero", tests.get("production_zero") == EXPECTED_TEST_PRODUCTION_ZERO)
    core.require(errors, "test-scope-exact", tests.get("scope") == EXPECTED_SCOPE)
    errors.extend(core.validate_scope(tests.get("scope", {})))
    core.require(errors, "readiness-schema", readiness.get("schema_version") == "a005-c2-compatibility-readiness-blocked-v1")
    core.require(errors, "readiness-status", readiness.get("status") == "BLOCKED_PREPARATION_ONLY_FUTURE_ONE_REVIEWER_AND_CAPTURE_AUTHORITIES_ABSENT")
    core.require(errors, "readiness-authority", readiness.get("authority_sha256") == authority_item.sha256)
    core.require(errors, "readiness-tool-seal", readiness.get("tool_seal_sha256") == seal_item.sha256)
    core.require(errors, "readiness-test-evidence", readiness.get("test_evidence_sha256") == tests_item.sha256)
    core.require(errors, "readiness-dedup", readiness.get("dedup_precheck_sha256") == authority["dedup_precheck"]["sha256"] and readiness.get("equivalent_terminal_count_before_creation") == 0)
    core.require(errors, "readiness-scope-exact", readiness.get("scope") == EXPECTED_SCOPE)
    core.require(errors, "readiness-zero-state", readiness.get("zero_state") == EXPECTED_ZERO_STATE)
    core.require(errors, "readiness-invocations", readiness.get("invocations") == EXPECTED_INVOCATIONS)
    core.require(errors, "readiness-production-zero", readiness.get("production_zero") == EXPECTED_PRODUCTION_ZERO)
    core.require(errors, "readiness-authority-state", readiness.get("authority_state") == EXPECTED_AUTHORITY_STATE)
    errors.extend(core.validate_scope(readiness.get("scope", {})))
    expected_terminal = {
        "authority_sha256": authority_item.sha256,
        "tool_seal_sha256": seal_item.sha256,
        "test_evidence_sha256": tests_item.sha256,
        "readiness_blocked_sha256": readiness_item.sha256,
        "dedup_precheck_sha256": authority["dedup_precheck"]["sha256"],
        "prior_invocation_baseline_sha256": authority["prior_invocation_baseline"]["sha256"],
    }
    core.require(errors, "terminal-schema", terminal.get("schema_version") == "a005-c2-compatibility-terminal-preparation-v1")
    core.require(errors, "terminal-status", terminal.get("status") == "PASS_PREPARATION_ONLY_BLOCKED_NO_REVIEWER_NO_CAPTURE_NO_ACTIVATION")
    for key, value in expected_terminal.items():
        core.require(errors, "terminal-binding:" + key, terminal.get(key) == value)
    core.require(errors, "terminal-dedup", terminal.get("equivalent_terminal_count_before_creation") == 0 and terminal.get("exact_target_namespace") == authority["namespace"])
    expected_census = {
        "closed_world": True, "lexical_no_follow": True, "unexpected_entries_allowed": False,
        "expected_file_count": len(EXPECTED_NAMESPACE_FILES),
        "expected_path_set_sha256": core.sha_bytes(("\n".join(sorted(EXPECTED_NAMESPACE_FILES)) + "\n").encode()),
    }
    core.require(errors, "terminal-census-policy", terminal.get("namespace_census") == expected_census)
    core.require(errors, "terminal-census-live-count", len(census_rows) == len(EXPECTED_NAMESPACE_FILES))
    core.require(errors, "terminal-census-live-paths", census_path_digest == expected_census["expected_path_set_sha256"])
    core.require(errors, "terminal-scope-exact", terminal.get("scope") == EXPECTED_SCOPE)
    core.require(errors, "terminal-zero-state", terminal.get("zero_state") == EXPECTED_ZERO_STATE)
    core.require(errors, "terminal-invocations", terminal.get("invocations") == EXPECTED_INVOCATIONS)
    core.require(errors, "terminal-production-zero", terminal.get("production_zero") == EXPECTED_PRODUCTION_ZERO)
    core.require(errors, "terminal-authority-state", terminal.get("authority_state") == EXPECTED_AUTHORITY_STATE)
    errors.extend(core.validate_scope(terminal.get("scope", {})))

    new_result = {"run": False, "passed": 1260, "failed": 0, "stdout_sha256": tests["new_c2_suite"]["stdout_sha256"]}
    if run_tests:
        code, document, stdout_hash, stderr = run_json(NS / "tools/test_c2_compatibility_v32.py")
        new_result = {"run": True, "passed": document.get("passed"), "failed": document.get("failed"), "stdout_sha256": stdout_hash}
        if code != 0 or stderr or document.get("status") != "pass" or document.get("passed") != 1260 or stdout_hash != tests["new_c2_suite"]["stdout_sha256"]:
            errors.append("live-new-tests")
    baseline_result = {"run": False, "passed": 825, "failed": 0, "stdout_sha256": tests["preserved_v30_suite"]["stdout_sha256"]}
    if run_baseline:
        code, document, stdout_hash, stderr = run_json(BASELINE)
        baseline_result = {"run": True, "passed": document.get("tests", {}).get("passed"), "failed": document.get("tests", {}).get("failed"), "stdout_sha256": stdout_hash}
        if code != 0 or stderr or document.get("status") != "pass" or document.get("tests", {}).get("passed") != 825 or stdout_hash != tests["preserved_v30_suite"]["stdout_sha256"]:
            errors.append("live-baseline")

    result = {
        "schema_version": "a005-c2-compatibility-preparation-verifier-result-v1",
        "status": "pass_preparation_only_blocked_future_one_reviewer_and_capture_authorities_required" if not errors else "fail_closed",
        "errors": sorted(set(errors)),
        "dedup": {"equivalent_terminal_count_before_creation": 0, "foreign_equivalent_terminals_now": live.get("foreign_equivalent_terminals", [])},
        "c2_source_transaction_digest": core.SOURCE_DIGEST,
        "c2_exact_future_report_sha256": core.REPORT_SHA,
        "prior_postrun_report_sha256": "0b414ed2b896c6da66007ffd2215643b979dd7f9b8de32791eb7eff61b5f857f",
        "prior_postrun_native_capture_sha256": "9e1bfede92341bf4e42f39a305fd39a6fa1c54d7c5c22566f23258b12130c92d",
        "prior_postrun_native_checkpoint_sha256": "9a0b17c263a317e7e5b53fa721b049e0ba355b161d2703c24df7c9347eb49cd7",
        "synthetic_future_output": {"capture_sha256": core.sha_bytes(capture_raw), "checkpoint_sha256": core.sha_bytes(checkpoint_raw), "schema_errors": len(capture_schema_errors), "written": False},
        "namespace_census": {"file_count": len(census_rows), "path_set_sha256": census_path_digest, "closed_world": not any(code.startswith("census-") for code in errors)},
        "tests": {"new_c2": new_result, "preserved_v30": baseline_result, "grand_total_passed": 2085},
        "production_zero": {"report_present": False, "capture_present": False, "checkpoint_present": False, "future_authorities_present": False},
        "invocations": {"reviewers": 0, "controllers": 0, "semantic_children": 0, "generators": 0, "capture_writers": 0},
        "activation_authorized": False,
        "launch_authorized": False,
        "credit": 0,
    }
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
