#!/usr/bin/env python3
"""Read-only verifier for the rejected-v1-bound C2 supersession-v2 preparation."""
from __future__ import annotations

import importlib.util
import json
import os
import stat
import subprocess
import sys
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker

V2 = Path(__file__).resolve().parents[1]
V1 = V2.parent
GATE = V1.parent
AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
SITE = AUDIT / "master/dependencies/jsonschema-draft202012-v1/site-packages"
BASELINE = AUDIT / "master/external_research/universal-shadow-certification-wave-0001/retry-attempt-0002-v30/verification-v2/test_retry_attempt_0002_v30_v3.py"
CORE_PATH = V1 / "tools/c2_closure_core_v32.py"
CORE_SPEC = importlib.util.spec_from_file_location("c2_closure_core_v32_frozen_supersession_v2", CORE_PATH)
if CORE_SPEC is None or CORE_SPEC.loader is None:
    raise RuntimeError("frozen-v1-core-loader-unavailable")
core = importlib.util.module_from_spec(CORE_SPEC)
sys.modules[CORE_SPEC.name] = core
CORE_SPEC.loader.exec_module(core)

EXPECTED_AUTHORITY_SHA = "d9a7720ea866b515906bdb897e77bb8fbd533da5a8d265563ebb8cd353d6171b"
EXPECTED_LINEAGE_SHA = "852f24483f20625886546afc530293411f5c95381858bdfd691e15182c720c58"
EXPECTED_DEDUP_SHA = "730cfaea576e8aa9b71d615be832a89f2a69109d5d76cd1cb25b50ed051fa135"
EXPECTED_TEST_EVIDENCE_SHA = "91ff46a457f1315e5de5b9a3fa0d352c09768692bc5679acc7de325927c2ce1e"
EXPECTED_CAPTURE_TOOL_SHA = "d6f74486332cd025eca6a725f7972e128b05d8e8fbbb45b9932dc34801e778da"
EXPECTED_V1_INVENTORY_DIGEST = "04810da2a9935e1fc5bcabc4e17853d53345494f59f4f0ca4f894c92ead205e5"
EXPECTED_SCOPE = {
    "activation_authorized": False, "activation_transactions": 0, "credit": 0, "launch_authorized": False,
    "receipt_count": 0, "result_count": 0, "runtime_native_capture_rows": 0, "spawn": "none", "spawn_count": 0,
}
EXPECTED_ZERO_STATE = {
    "activations": 0, "canonical_reads": 0, "canonical_writes": 0, "captures": 0, "checkpoints": 0,
    "controllers": 0, "credit": 0, "generator_invocations": 0, "launches": 0, "promotion": 0,
    "receipts": 0, "results": 0, "reviewers": 0, "semantic_children": 0,
}
EXPECTED_INVOCATIONS = {
    "activations": 0, "capture_writers": 0, "controllers": 0, "generators": 0,
    "launches": 0, "reviewers": 0, "semantic_children": 0,
}
EXPECTED_PRODUCTION_ZERO = {
    "capture_present": False, "checkpoint_present": False, "future_capture_authority_present": False,
    "future_native_binding_present": False, "future_reviewer_authority_present": False, "report_present": False,
}
EXPECTED_AUTHORITY_STATE = {
    "activation_authorized": False, "capture_authority_present": False,
    "capture_writer_invocation_authorized": False, "launch_authorized": False, "native_binding_present": False,
    "reviewer_authority_present": False, "reviewer_invocation_authorized": False,
}
EXPECTED_WRITER_POLICY = {
    "capture_tool_present": True, "capture_tool_invoked": False, "future_writer_present": False,
    "future_reviewer_present": False, "future_generator_present": False,
    "external_append_only_reviewer_authority_required": True,
    "external_append_only_capture_authority_required": True,
}
EXPECTED_RUNTIME = {
    "LC_ALL": "C", "PYTHONDONTWRITEBYTECODE": "1", "PYTHONHASHSEED": "0", "PYTHONNOUSERSITE": "1", "TZ": "UTC",
    "flags": ["-S", "-B"], "jsonschema_record_sha256": core.JSONSCHEMA_RECORD_SHA, "jsonschema_version": "4.26.0",
    "pinned_site_relative_to_audit": "master/dependencies/jsonschema-draft202012-v1/site-packages",
    "python_path": str(core.PINNED_PYTHON), "python_sha256": core.PYTHON_SHA, "python_version": "3.12.13",
}
EXPECTED_V1_ROWS = (
    ("AUTHORITY_C2_COMPATIBILITY_V32.json", 10778, "a6290ffa3734ac4301986107325a820b651d0f385079958a1df9ef6e4ddca45f"),
    ("DEDUP_PRECHECK_C2.json", 1238, "d5932b3bebe41af0dee788c3f29765f7d451582177494392212074bb4c036cff"),
    ("PRIOR_C2_INVOCATION_BASELINE.json", 5866, "81d473ad635ece863b2526d7473408413f740f0a351f0ab8775d4cb2790584b1"),
    ("READINESS_BLOCKED_C2_V32.json", 4033, "c62d76814ecccfafcf07121bb56e6c6d94238aead52a8b887e2f4fc190f8336f"),
    ("TERMINAL_PREPARATION_C2_V32.json", 4231, "9c009f970680cde50be5c6407c5f3ee37dd103ba4543642e13a028fc00cb2032"),
    ("TEST_EVIDENCE_C2_V32.json", 3228, "08389c81c8e85a0cf50b115299ca729bf59f163f0bad019d9f5f144bc8be5d8a"),
    ("TOOL_SEAL_C2_V32.json", 4559, "22414075c077d8ff4ba4ede930b4ec0e5bc43226f5d024c4c5f9990feae3de59"),
    ("fixtures/sessions/controller.jsonl", 2004, "105fe78a967372c39ea4984cc96890c8971284455e6c68732bfdaf9e17e29e3f"),
    ("fixtures/sessions/reviewer.jsonl", 1082, "8e527d65780b535e265da4890c1967d1c8bed5b442ca734428324a619531b78a"),
    ("fixtures/valid-c2-atomic8-prelaunch-report.json", 1509, "a916e52e5b8994cce2000df919c899718ce41b2f7abc15f9f5be71b7adc3619d"),
    ("fixtures/valid-c2-fresh-native-binding.json", 4829, "eb810239d9eb58e69181571232f3413e5592996aa07219fd8a372ee68db45b68"),
    ("schemas/c2_atomic8_prelaunch_report_v32.schema.json", 2948, "efb6424cad1f104ef3095983f005958b48ea81d3bb75d5da7bc3fb17eff08bd6"),
    ("schemas/c2_fresh_native_binding_v32.schema.json", 8932, "32f726cda0776dca22ebf8e297229e410236ad8d1eaeff24093fe86b0c2e6efc"),
    ("schemas/c2_future_capture_authority_v32.schema.json", 1711, "d4c45e398073bf632bfec27ae821c535073652fffa3680ea6ee07ffe3a7bdb26"),
    ("schemas/c2_future_reviewer_authority_v32.schema.json", 1840, "b5b5320ed1be04c85fdcf9fcd220928c6f951f102f77ab126620a2b2c7a52410"),
    ("tools/c2_closure_core_v32.py", 52726, "d63c9ff1996ba3faffae388055014af942aca77879e3f9fe785c88857b0c735e"),
    ("tools/capture_c2_controller_native_v32.py", 4000, "66a81caefe39af50719ac17dceea8bef3b11cdd75701c8c0e65f58423f87228c"),
    ("tools/test_c2_compatibility_v32.py", 21845, "4ce93a3d90521021f32f14ded52616306538df22c4350552dff144deb49d05ef"),
    ("tools/verify_c2_compatibility_preparation_v32.py", 16337, "301de5c424ab31843fa3ca340b8b71ed630566296dee6bf6a6c5886853021809"),
)
EXPECTED_V2_FILES = (
    "AUTHORITY_C2_SUPERSESSION_V2.json",
    "DEDUP_PRECHECK_C2_SUPERSESSION_V2.json",
    "READINESS_BLOCKED_C2_SUPERSESSION_V2.json",
    "REJECTION_LINEAGE_V1.json",
    "TERMINAL_PREPARATION_C2_SUPERSESSION_V2.json",
    "TEST_EVIDENCE_C2_SUPERSESSION_V2.json",
    "TOOL_SEAL_C2_SUPERSESSION_V2.json",
    "tools/capture_c2_controller_native_supersession_v2.py",
    "tools/verify_c2_supersession_v2.py",
)
EXPECTED_SEALED_FILES = tuple(
    relative for relative in EXPECTED_V2_FILES
    if relative not in {"TOOL_SEAL_C2_SUPERSESSION_V2.json", "READINESS_BLOCKED_C2_SUPERSESSION_V2.json", "TERMINAL_PREPARATION_C2_SUPERSESSION_V2.json"}
)
EXPECTED_BRANCH_FILES = tuple(path for path, _, _ in EXPECTED_V1_ROWS) + tuple("supersession-v2/" + path for path in EXPECTED_V2_FILES)
ROOT_REPLAY_HASHES = {
    "authority": "a6290ffa3734ac4301986107325a820b651d0f385079958a1df9ef6e4ddca45f",
    "readiness": "699ee3d75227d8efb1b03a482ff394cc81aa5c537f2f98c32f7f46f57fa1d520",
    "terminal": "e584e8925a3cde96947918a10077edb7c4850a58546fc8402c2bd8d02eafced2",
    "test_evidence": "08389c81c8e85a0cf50b115299ca729bf59f163f0bad019d9f5f144bc8be5d8a",
    "test_script": "4ce93a3d90521021f32f14ded52616306538df22c4350552dff144deb49d05ef",
    "tool_seal": "133f1669390fddcf42cead05a5a48c4d2c4b054df2044cb7c9b5bb57253e04dd",
    "verifier": "cfa01dd498fadc22e32c23ee7e43ae9cd600038dcca53393e5d6bc0d4293fa69",
}


def isolated_env() -> dict[str, str]:
    return {
        "HOME": os.environ.get("HOME", "/Users/jaredsmacbookair"),
        "PATH": str(core.PINNED_PYTHON.parent) + os.pathsep + "/usr/bin:/bin",
        "PYTHONPATH": str(SITE),
        "PYTHONNOUSERSITE": "1", "PYTHONDONTWRITEBYTECODE": "1", "PYTHONHASHSEED": "0",
        "LC_ALL": "C", "TZ": "UTC",
    }


def run_json(script: Path) -> tuple[int, dict[str, Any], str, str]:
    process = subprocess.run(
        [str(core.PINNED_PYTHON), "-S", "-B", str(script)],
        cwd=AUDIT, env=isolated_env(), capture_output=True, check=False,
    )
    try:
        document = json.loads(process.stdout)
    except (UnicodeDecodeError, json.JSONDecodeError):
        document = {"status": "unparseable"}
    return process.returncode, document, core.sha_bytes(process.stdout), process.stderr.decode("utf-8", "replace")[-4000:]


def expected_path_digest(paths: tuple[str, ...]) -> str:
    return core.sha_bytes(("\n".join(sorted(paths)) + "\n").encode())


def main() -> int:
    arguments = set(sys.argv[1:])
    run_tests = "--run-tests" in arguments
    run_baseline = "--run-baseline" in arguments
    errors: list[str] = []
    for unknown in sorted(arguments - {"--run-tests", "--run-baseline"}):
        errors.append("unknown-argument:" + unknown)
    core.require(errors, "partial-replay-flags", run_tests == run_baseline)
    errors.extend(core.validate_runtime(AUDIT))
    core.require(errors, "runtime-hash-seed-explicit", os.environ.get("PYTHONHASHSEED") == "0")
    core.require(errors, "core-module-path", Path(core.__file__).resolve() == (V1 / "tools/c2_closure_core_v32.py").resolve())

    authority_item, authority = core.stable_json(V2 / "AUTHORITY_C2_SUPERSESSION_V2.json", V2)
    lineage_item, lineage = core.stable_json(V2 / "REJECTION_LINEAGE_V1.json", V2)
    dedup_item, dedup = core.stable_json(V2 / "DEDUP_PRECHECK_C2_SUPERSESSION_V2.json", V2)
    tests_item, tests = core.stable_json(V2 / "TEST_EVIDENCE_C2_SUPERSESSION_V2.json", V2)
    seal_item, seal = core.stable_json(V2 / "TOOL_SEAL_C2_SUPERSESSION_V2.json", V2)
    readiness_item, readiness = core.stable_json(V2 / "READINESS_BLOCKED_C2_SUPERSESSION_V2.json", V2)
    terminal_item, terminal = core.stable_json(V2 / "TERMINAL_PREPARATION_C2_SUPERSESSION_V2.json", V2)

    core.require(errors, "authority-hash", authority_item.sha256 == EXPECTED_AUTHORITY_SHA)
    core.require(errors, "authority-schema", authority.get("schema_version") == "a005-c2-compatibility-supersession-v2-authority-v1")
    core.require(errors, "authority-status", authority.get("status") == "BLOCKED_SUPERSESSION_V2_PREPARATION_ONLY_FUTURE_ONE_REVIEWER_AND_CAPTURE_AUTHORITIES_ABSENT")
    core.require(errors, "authority-namespace", authority.get("namespace") == V2.relative_to(AUDIT).as_posix())
    core.require(errors, "authority-runtime", authority.get("root_replay_runtime_contract") == EXPECTED_RUNTIME)
    core.require(errors, "authority-lineage", authority.get("v1_rejection_lineage_sha256") == EXPECTED_LINEAGE_SHA)
    core.require(errors, "authority-dedup", authority.get("dedup_precheck", {}).get("sha256") == EXPECTED_DEDUP_SHA)
    core.require(errors, "authority-source", authority.get("c2_source", {}).get("source_transaction_digest") == core.SOURCE_DIGEST)
    core.require(errors, "authority-report", authority.get("future", {}).get("exact_report_sha256") == core.REPORT_SHA)
    core.require(errors, "authority-capture-tool", authority.get("future", {}).get("capture_tool_sha256") == EXPECTED_CAPTURE_TOOL_SHA)
    core.require(errors, "authority-v1-freeze", authority.get("v1_freeze") == {"byte_count": 153696, "canonical_inventory_digest": EXPECTED_V1_INVENTORY_DIGEST, "file_count": 19, "required_mode": "0444"})
    core.require(errors, "authority-scope", authority.get("scope") == EXPECTED_SCOPE)
    core.require(errors, "authority-zero", authority.get("zero_state") == EXPECTED_ZERO_STATE)
    core.require(errors, "authority-invocations", authority.get("invocations") == EXPECTED_INVOCATIONS)
    core.require(errors, "authority-production-zero", authority.get("production_zero") == EXPECTED_PRODUCTION_ZERO)
    errors.extend(core.validate_scope(authority.get("scope", {})))

    expected_rows = [{"byte_count": size, "path": path, "sha256": digest} for path, size, digest in EXPECTED_V1_ROWS]
    snapshot = lineage.get("current_post_replay_snapshot", {})
    root_replay = lineage.get("root_replayed_rejection", {})
    core.require(errors, "lineage-hash", lineage_item.sha256 == EXPECTED_LINEAGE_SHA)
    core.require(errors, "lineage-schema", lineage.get("schema_version") == "a005-c2-compatibility-v1-rejection-lineage-v1")
    core.require(errors, "lineage-status", lineage.get("status") == "IMMUTABLE_REJECTED_PREDECESSOR_BOUND_ZERO_CREDIT" and lineage.get("credit") == 0)
    core.require(errors, "lineage-current-files", snapshot.get("files") == expected_rows)
    core.require(errors, "lineage-current-cardinality", snapshot.get("file_count") == 19 and snapshot.get("byte_count") == 153696)
    core.require(errors, "lineage-current-digest", snapshot.get("canonical_sorted_path_byte_count_sha256_digest") == EXPECTED_V1_INVENTORY_DIGEST)
    core.require(errors, "lineage-current-mode", snapshot.get("file_mode_required") == "0444")
    core.require(errors, "lineage-root-hashes", root_replay.get("exact_hashes") == ROOT_REPLAY_HASHES)
    core.require(errors, "lineage-root-errors", root_replay.get("verifier_errors") == ["runtime-hash-seed", "tool-seal-drift:tools/verify_c2_compatibility_preparation_v32.py"])
    core.require(errors, "lineage-root-runtime-errors", root_replay.get("runtime_errors") == ["runtime-hash-seed"])
    core.require(errors, "lineage-root-tests", root_replay.get("new_c2_tests") == {"failed": 0, "passed": 1260})
    core.require(errors, "lineage-root-status", root_replay.get("overall_status") == "FAIL_CLOSED_ZERO_CREDIT")

    for relative, byte_count, digest in EXPECTED_V1_ROWS:
        try:
            item = core.stable_read(V1 / relative, V1)
            core.require(errors, "v1-hash:" + relative, item.sha256 == digest)
            core.require(errors, "v1-bytes:" + relative, len(item.raw) == byte_count)
            core.require(errors, "v1-mode:" + relative, stat.S_IMODE(item.stat.st_mode) == 0o444)
        except core.ClosureError as exc:
            errors.extend("v1:" + code + ":" + relative for code in exc.codes)

    core.require(errors, "dedup-hash", dedup_item.sha256 == EXPECTED_DEDUP_SHA)
    core.require(errors, "dedup-schema", dedup.get("schema_version") == "a005-c2-compatibility-supersession-v2-dedup-precheck-v1")
    core.require(errors, "dedup-status", dedup.get("status") == "PASS_ONE_REJECTED_SAME_BRANCH_PREDECESSOR_ZERO_TERMINAL_CREDIT_EQUIVALENTS")
    core.require(errors, "dedup-precreation", dedup.get("precreation_scan") == {"rejected_same_branch_predecessor_count": 1, "supersession_v2_terminal_present": False, "terminal_credit_equivalent_count": 0})
    core.require(errors, "dedup-foreign-zero", dedup.get("foreign_terminal_credit_equivalent_count") == 0)
    predecessor = dedup.get("rejected_same_branch_predecessor", {})
    core.require(errors, "dedup-predecessor-current", predecessor.get("current_frozen_terminal_sha256") == EXPECTED_V1_ROWS[4][2])
    core.require(errors, "dedup-predecessor-root", predecessor.get("root_replayed_terminal_sha256") == ROOT_REPLAY_HASHES["terminal"])
    _, v1_dedup = core.stable_json(V1 / "DEDUP_PRECHECK_C2.json", V1)
    statuses = v1_dedup["equivalence_predicate"]["terminal_status_alternatives"]
    try:
        foreign = core.scan_foreign_equivalent_terminals(AUDIT, V1, statuses)
    except core.ClosureError as exc:
        errors.extend(exc.codes)
        foreign = []
    core.require(errors, "dedup-live-foreign", foreign == [])

    _, v1_authority = core.stable_json(V1 / "AUTHORITY_C2_COMPATIBILITY_V32.json", V1)
    try:
        live = core.verify_preparation(v1_authority, audit_root=AUDIT, gate_root=GATE, namespace=V1)
    except core.ClosureError as exc:
        errors.extend("underlying:" + code for code in exc.codes)
        live = {}

    report_item, report = core.stable_json(V1 / "fixtures/valid-c2-atomic8-prelaunch-report.json", V1)
    report_schema = json.loads(core.stable_read(V1 / "schemas/c2_atomic8_prelaunch_report_v32.schema.json", V1).raw)
    errors.extend("synthetic-report:" + code for code in core.schema_errors(report, report_schema))
    binding_item, binding = core.stable_json(V1 / "fixtures/valid-c2-fresh-native-binding.json", V1)
    binding_schema = json.loads(core.stable_read(V1 / "schemas/c2_fresh_native_binding_v32.schema.json", V1).raw)
    binding_errors, parent_raw, parent_rows, child, child_raw, child_rows = core.validate_native_binding(binding, binding_schema, session_root=V1, fixture_root=V1)
    errors.extend("synthetic-binding:" + code for code in binding_errors)
    synthetic = core.FutureEvidence(report_item, report, binding_item, binding, parent_raw, parent_rows, child, child_raw, child_rows)
    checkpoint_raw, capture_raw, capture = core.build_checkpoint_capture(v1_authority, synthetic)
    capture_schema = json.loads(core.stable_read(GATE / "schemas/controller_native_reviewer_capture_v31.schema.json", GATE).raw)
    capture_errors = [
        "synthetic-capture:" + "/".join(map(str, error.absolute_path)) + ":" + error.validator
        for error in Draft202012Validator(capture_schema, format_checker=FormatChecker()).iter_errors(capture)
    ]
    errors.extend(capture_errors)
    core.require(errors, "synthetic-report-hash", report_item.sha256 == core.REPORT_SHA)
    core.require(errors, "synthetic-binding-hash", binding_item.sha256 == "eb810239d9eb58e69181571232f3413e5592996aa07219fd8a372ee68db45b68")

    for label, relative in authority["absence_gates"].items():
        path = GATE / relative if label.endswith("relative_to_gate") else V2 / relative
        core.require(errors, "absence:" + label, not os.path.lexists(path))
    for relative in ("FUTURE_REVIEWER_INVOCATION_AUTHORITY_C2_V32.json", "FUTURE_CAPTURE_INVOCATION_AUTHORITY_C2_V32.json", "FRESH_NATIVE_BINDING_C2_V32.json"):
        core.require(errors, "v1-future-absence:" + relative, not os.path.lexists(V1 / relative))

    try:
        v2_rows, v2_path_digest = core.closed_world_census(V2, AUDIT, EXPECTED_V2_FILES)
        branch_rows, branch_path_digest = core.closed_world_census(V1, AUDIT, EXPECTED_BRANCH_FILES)
    except core.ClosureError as exc:
        errors.extend(exc.codes)
        v2_rows, branch_rows, v2_path_digest, branch_path_digest = (), (), "", ""
    for relative in EXPECTED_V2_FILES:
        try:
            item = core.stable_read(V2 / relative, V2)
            core.require(errors, "v2-mode:" + relative, stat.S_IMODE(item.stat.st_mode) == 0o444)
        except core.ClosureError as exc:
            errors.extend("v2:" + code + ":" + relative for code in exc.codes)

    core.require(errors, "test-hash", tests_item.sha256 == EXPECTED_TEST_EVIDENCE_SHA)
    core.require(errors, "test-schema", tests.get("schema_version") == "a005-c2-compatibility-supersession-v2-test-evidence-v1")
    core.require(errors, "test-status", tests.get("status") == "PASS_PRESEAL_TESTS_PRODUCTION_ZERO_ROOT_READ_ONLY_REPLAY_CONTRACT_PINNED")
    core.require(errors, "test-new", tests.get("new_c2_suite", {}).get("passed") == 1260 and tests.get("new_c2_suite", {}).get("failed") == 0 and tests.get("new_c2_suite", {}).get("stdout_sha256") == "3a6807140a20a9de2f16eb4f6803f98afd4bcd838e8327c56ecc3b9f44524569")
    core.require(errors, "test-baseline", tests.get("preserved_v30_suite", {}).get("passed") == 825 and tests.get("preserved_v30_suite", {}).get("failed") == 0 and tests.get("preserved_v30_suite", {}).get("stdout_sha256") == "2533adc1664f4b1a9d3680626351cb1e6ea339dd7654ea3a373837821de4a343")
    core.require(errors, "test-total", tests.get("grand_total") == {"failed": 0, "passed": 2085, "total": 2085})
    core.require(errors, "test-production-zero", tests.get("production_zero") == EXPECTED_PRODUCTION_ZERO)
    core.require(errors, "test-invocations", tests.get("invocations") == EXPECTED_INVOCATIONS)
    core.require(errors, "test-zero", tests.get("zero_state") == EXPECTED_ZERO_STATE)
    core.require(errors, "test-scope", tests.get("scope") == EXPECTED_SCOPE)

    core.require(errors, "seal-schema", seal.get("schema_version") == "a005-c2-compatibility-supersession-v2-tool-seal-v1")
    core.require(errors, "seal-status", seal.get("status") == "PASS_SEALED_SUPERSESSION_V2_PREPARATION_ONLY_ZERO_AUTHORITY_ZERO_INVOCATION")
    core.require(errors, "seal-file-set", set(seal.get("file_hashes", {})) == set(EXPECTED_SEALED_FILES))
    for relative in EXPECTED_SEALED_FILES:
        item = core.stable_read(V2 / relative, V2)
        core.require(errors, "seal-drift:" + relative, item.sha256 == seal.get("file_hashes", {}).get(relative))
    core.require(errors, "seal-runtime", seal.get("runtime") == EXPECTED_RUNTIME)
    core.require(errors, "seal-v1-freeze", seal.get("v1_freeze") == {"byte_count": 153696, "file_count": 19, "inventory_digest": EXPECTED_V1_INVENTORY_DIGEST, "mode": "0444"})
    core.require(errors, "seal-test-binding", seal.get("test_evidence") == {"failed": 0, "passed": 2085, "path": "TEST_EVIDENCE_C2_SUPERSESSION_V2.json", "sha256": EXPECTED_TEST_EVIDENCE_SHA})
    core.require(errors, "seal-scope", seal.get("scope") == EXPECTED_SCOPE)
    core.require(errors, "seal-zero", seal.get("zero_state") == EXPECTED_ZERO_STATE)
    core.require(errors, "seal-invocations", seal.get("invocations") == EXPECTED_INVOCATIONS)
    core.require(errors, "seal-production-zero", seal.get("production_zero") == EXPECTED_PRODUCTION_ZERO)
    core.require(errors, "seal-authority-state", seal.get("authority_state") == EXPECTED_AUTHORITY_STATE)
    core.require(errors, "seal-writer-policy", seal.get("writer_policy") == EXPECTED_WRITER_POLICY)

    core.require(errors, "readiness-schema", readiness.get("schema_version") == "a005-c2-compatibility-supersession-v2-readiness-blocked-v1")
    core.require(errors, "readiness-status", readiness.get("status") == "BLOCKED_SUPERSESSION_V2_PREPARATION_ONLY_FUTURE_ONE_REVIEWER_AND_CAPTURE_AUTHORITIES_ABSENT")
    core.require(errors, "readiness-authority", readiness.get("authority_sha256") == authority_item.sha256)
    core.require(errors, "readiness-lineage", readiness.get("v1_rejection_lineage_sha256") == lineage_item.sha256)
    core.require(errors, "readiness-dedup", readiness.get("dedup_precheck_sha256") == dedup_item.sha256)
    core.require(errors, "readiness-tests", readiness.get("test_evidence_sha256") == tests_item.sha256)
    core.require(errors, "readiness-seal", readiness.get("tool_seal_sha256") == seal_item.sha256)
    core.require(errors, "readiness-predecessor-count", readiness.get("rejected_same_branch_predecessor_count") == 1 and readiness.get("terminal_credit_equivalent_count") == 0)
    core.require(errors, "readiness-scope", readiness.get("scope") == EXPECTED_SCOPE)
    core.require(errors, "readiness-zero", readiness.get("zero_state") == EXPECTED_ZERO_STATE)
    core.require(errors, "readiness-invocations", readiness.get("invocations") == EXPECTED_INVOCATIONS)
    core.require(errors, "readiness-production-zero", readiness.get("production_zero") == EXPECTED_PRODUCTION_ZERO)
    core.require(errors, "readiness-authority-state", readiness.get("authority_state") == EXPECTED_AUTHORITY_STATE)

    core.require(errors, "terminal-schema", terminal.get("schema_version") == "a005-c2-compatibility-supersession-v2-terminal-preparation-v1")
    core.require(errors, "terminal-status", terminal.get("status") == "PASS_SUPERSESSION_V2_PREPARATION_ONLY_BLOCKED_NO_REVIEWER_NO_CAPTURE_NO_ACTIVATION")
    expected_terminal_bindings = {
        "authority_sha256": authority_item.sha256, "v1_rejection_lineage_sha256": lineage_item.sha256,
        "dedup_precheck_sha256": dedup_item.sha256, "test_evidence_sha256": tests_item.sha256,
        "tool_seal_sha256": seal_item.sha256, "readiness_blocked_sha256": readiness_item.sha256,
    }
    for key, value in expected_terminal_bindings.items():
        core.require(errors, "terminal-binding:" + key, terminal.get(key) == value)
    expected_census = {
        "branch_expected_file_count": len(EXPECTED_BRANCH_FILES), "branch_expected_path_set_sha256": expected_path_digest(EXPECTED_BRANCH_FILES),
        "closed_world": True, "lexical_no_follow": True, "unexpected_entries_allowed": False,
        "v2_expected_file_count": len(EXPECTED_V2_FILES), "v2_expected_path_set_sha256": expected_path_digest(EXPECTED_V2_FILES),
    }
    core.require(errors, "terminal-census", terminal.get("namespace_census") == expected_census)
    core.require(errors, "terminal-census-live", len(v2_rows) == len(EXPECTED_V2_FILES) and len(branch_rows) == len(EXPECTED_BRANCH_FILES) and v2_path_digest == expected_census["v2_expected_path_set_sha256"] and branch_path_digest == expected_census["branch_expected_path_set_sha256"])
    core.require(errors, "terminal-namespace", terminal.get("exact_target_namespace") == authority["namespace"])
    core.require(errors, "terminal-predecessor-count", terminal.get("rejected_same_branch_predecessor_count") == 1 and terminal.get("terminal_credit_equivalent_count") == 0)
    core.require(errors, "terminal-root-replay-contract", terminal.get("root_read_only_replay_required_after_freeze") is True and terminal.get("persistent_replay_receipt_written") is False)
    core.require(errors, "terminal-scope", terminal.get("scope") == EXPECTED_SCOPE)
    core.require(errors, "terminal-zero", terminal.get("zero_state") == EXPECTED_ZERO_STATE)
    core.require(errors, "terminal-invocations", terminal.get("invocations") == EXPECTED_INVOCATIONS)
    core.require(errors, "terminal-production-zero", terminal.get("production_zero") == EXPECTED_PRODUCTION_ZERO)
    core.require(errors, "terminal-authority-state", terminal.get("authority_state") == EXPECTED_AUTHORITY_STATE)

    new_result = {"run": False, "passed": 1260, "failed": 0, "stdout_sha256": tests["new_c2_suite"]["stdout_sha256"]}
    baseline_result = {"run": False, "passed": 825, "failed": 0, "stdout_sha256": tests["preserved_v30_suite"]["stdout_sha256"]}
    if run_tests and run_baseline:
        code, document, stdout_hash, stderr = run_json(V1 / "tools/test_c2_compatibility_v32.py")
        new_result = {"run": True, "passed": document.get("passed"), "failed": document.get("failed"), "stdout_sha256": stdout_hash}
        if code != 0 or stderr or document.get("status") != "pass" or document.get("passed") != 1260 or document.get("failed") != 0 or stdout_hash != tests["new_c2_suite"]["stdout_sha256"] or document.get("runtime_errors") != []:
            errors.append("root-replay-new-tests")
        code, document, stdout_hash, stderr = run_json(BASELINE)
        baseline_result = {"run": True, "passed": document.get("tests", {}).get("passed"), "failed": document.get("tests", {}).get("failed"), "stdout_sha256": stdout_hash}
        if code != 0 or stderr or document.get("status") != "pass" or document.get("tests", {}).get("passed") != 825 or document.get("tests", {}).get("failed") != 0 or stdout_hash != tests["preserved_v30_suite"]["stdout_sha256"]:
            errors.append("root-replay-preserved-baseline")

    full_replay = run_tests and run_baseline
    result = {
        "schema_version": "a005-c2-compatibility-supersession-v2-verifier-result-v1",
        "status": ("pass_supersession_v2_preparation_only_root_replay_green" if full_replay else "pass_supersession_v2_preparation_only_replay_not_run") if not errors else "fail_closed",
        "errors": sorted(set(errors)),
        "runtime": {"python": "3.12.13", "jsonschema": "4.26.0", "PYTHONHASHSEED": os.environ.get("PYTHONHASHSEED"), "flags": ["-S", "-B"]},
        "v1_rejected_predecessor": {"file_count": 19, "byte_count": 153696, "inventory_digest": EXPECTED_V1_INVENTORY_DIGEST, "mode": "0444", "credit": 0},
        "dedup": {"rejected_same_branch_predecessor_count": 1, "terminal_credit_equivalent_count": 0, "foreign_equivalents": foreign},
        "census": {"v2_file_count": len(v2_rows), "branch_file_count": len(branch_rows), "v2_path_set_sha256": v2_path_digest, "branch_path_set_sha256": branch_path_digest},
        "underlying_c2": {"source_transaction_digest": core.SOURCE_DIGEST, "exact_future_report_sha256": core.REPORT_SHA, "empty_output_directories": live.get("empty_output_directories")},
        "synthetic_future_output": {"capture_sha256": core.sha_bytes(capture_raw), "checkpoint_sha256": core.sha_bytes(checkpoint_raw), "schema_errors": len(capture_errors), "written": False},
        "tests": {"new_c2": new_result, "preserved_v30": baseline_result, "grand_total_passed": 2085},
        "production_zero": EXPECTED_PRODUCTION_ZERO,
        "invocations": EXPECTED_INVOCATIONS,
        "activation_authorized": False, "launch_authorized": False, "credit": 0,
    }
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
