#!/usr/bin/env python3
"""Future-only C2 supersession capture writer; never dispatches or activates."""
from __future__ import annotations

import copy
import importlib.util
import json
import os
import stat
import sys
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

V2 = Path(__file__).resolve().parents[1]
V1 = V2.parent
GATE = V1.parent
AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
SESSIONS = Path("/Users/jaredsmacbookair/.codex/sessions")
CORE_PATH = V1 / "tools/c2_closure_core_v32.py"
CORE_SPEC = importlib.util.spec_from_file_location("c2_closure_core_v32_frozen_supersession_v2_capture", CORE_PATH)
if CORE_SPEC is None or CORE_SPEC.loader is None:
    raise RuntimeError("frozen-v1-core-loader-unavailable")
core = importlib.util.module_from_spec(CORE_SPEC)
sys.modules[CORE_SPEC.name] = core
CORE_SPEC.loader.exec_module(core)
PREPARATION_FILES = (
    "AUTHORITY_C2_SUPERSESSION_V2.json", "DEDUP_PRECHECK_C2_SUPERSESSION_V2.json",
    "READINESS_BLOCKED_C2_SUPERSESSION_V2.json", "REJECTION_LINEAGE_V1.json",
    "TERMINAL_PREPARATION_C2_SUPERSESSION_V2.json", "TEST_EVIDENCE_C2_SUPERSESSION_V2.json",
    "TOOL_SEAL_C2_SUPERSESSION_V2.json", "tools/capture_c2_controller_native_supersession_v2.py",
    "tools/verify_c2_supersession_v2.py",
)
FUTURE_FILES = (
    "FUTURE_REVIEWER_INVOCATION_AUTHORITY_C2_SUPERSESSION_V2.json",
    "FUTURE_CAPTURE_INVOCATION_AUTHORITY_C2_SUPERSESSION_V2.json",
    "FRESH_NATIVE_BINDING_C2_SUPERSESSION_V2.json",
)


def verify_frozen_v1(lineage: dict[str, object]) -> None:
    errors: list[str] = []
    snapshot = lineage.get("current_post_replay_snapshot")
    if not isinstance(snapshot, dict) or not isinstance(snapshot.get("files"), list):
        raise core.ClosureError("v1-lineage-shape")
    files = snapshot["files"]
    for row in files:
        if not isinstance(row, dict) or not isinstance(row.get("path"), str):
            errors.append("v1-row-shape")
            continue
        relative = str(row["path"])
        try:
            item = core.stable_read(V1 / relative, V1)
            core.require(errors, "v1-hash:" + relative, item.sha256 == row["sha256"])
            core.require(errors, "v1-byte-count:" + relative, len(item.raw) == row["byte_count"])
            core.require(errors, "v1-mode:" + relative, stat.S_IMODE(item.stat.st_mode) == 0o444)
        except core.ClosureError as exc:
            errors.extend("v1:" + code + ":" + relative for code in exc.codes)
    core.require(errors, "v1-file-count", len(files) == snapshot["file_count"] == 19)
    digest = core.sha_bytes(json.dumps(files, sort_keys=True, separators=(",", ":")).encode())
    core.require(errors, "v1-inventory-digest", digest == snapshot.get("canonical_sorted_path_byte_count_sha256_digest") == "04810da2a9935e1fc5bcabc4e17853d53345494f59f4f0ca4f894c92ead205e5")
    if errors:
        raise core.ClosureError(errors)


def main() -> int:
    runtime_errors = core.validate_runtime(AUDIT)
    if runtime_errors or os.environ.get("PYTHONHASHSEED") != "0":
        raise core.ClosureError(runtime_errors + (["runtime-hash-seed"] if os.environ.get("PYTHONHASHSEED") != "0" else []))
    authority_item, v2_authority = core.stable_json(V2 / "AUTHORITY_C2_SUPERSESSION_V2.json", V2)
    lineage_item, lineage = core.stable_json(V2 / "REJECTION_LINEAGE_V1.json", V2)
    dedup_item, dedup = core.stable_json(V2 / "DEDUP_PRECHECK_C2_SUPERSESSION_V2.json", V2)
    tests_item, tests = core.stable_json(V2 / "TEST_EVIDENCE_C2_SUPERSESSION_V2.json", V2)
    seal_item, seal = core.stable_json(V2 / "TOOL_SEAL_C2_SUPERSESSION_V2.json", V2)
    readiness_item, readiness = core.stable_json(V2 / "READINESS_BLOCKED_C2_SUPERSESSION_V2.json", V2)
    terminal, terminal_document = core.stable_json(V2 / "TERMINAL_PREPARATION_C2_SUPERSESSION_V2.json", V2)
    tool = core.stable_read(Path(__file__).resolve(), V2)
    errors: list[str] = []
    core.require(errors, "authority-status", v2_authority.get("status") == "BLOCKED_SUPERSESSION_V2_PREPARATION_ONLY_FUTURE_ONE_REVIEWER_AND_CAPTURE_AUTHORITIES_ABSENT")
    core.require(errors, "authority-tool", v2_authority.get("future", {}).get("capture_tool_sha256") == tool.sha256)
    core.require(errors, "authority-runtime-hash-seed", v2_authority.get("root_replay_runtime_contract", {}).get("PYTHONHASHSEED") == "0")
    core.require(errors, "v1-lineage-hash", lineage_item.sha256 == v2_authority.get("v1_rejection_lineage_sha256"))
    core.require(errors, "lineage-status", lineage.get("status") == "IMMUTABLE_REJECTED_PREDECESSOR_BOUND_ZERO_CREDIT" and lineage.get("credit") == 0)
    core.require(errors, "dedup-hash", dedup_item.sha256 == v2_authority.get("dedup_precheck", {}).get("sha256"))
    core.require(errors, "dedup-status", dedup.get("status") == "PASS_ONE_REJECTED_SAME_BRANCH_PREDECESSOR_ZERO_TERMINAL_CREDIT_EQUIVALENTS")
    core.require(errors, "tests-status", tests.get("status") == "PASS_PRESEAL_TESTS_PRODUCTION_ZERO_ROOT_READ_ONLY_REPLAY_CONTRACT_PINNED")
    core.require(errors, "seal-status", seal.get("status") == "PASS_SEALED_SUPERSESSION_V2_PREPARATION_ONLY_ZERO_AUTHORITY_ZERO_INVOCATION")
    for relative, expected in seal.get("file_hashes", {}).items():
        item = core.stable_read(V2 / relative, V2)
        core.require(errors, "seal-drift:" + relative, item.sha256 == expected)
    core.require(errors, "readiness-status", readiness.get("status") == "BLOCKED_SUPERSESSION_V2_PREPARATION_ONLY_FUTURE_ONE_REVIEWER_AND_CAPTURE_AUTHORITIES_ABSENT")
    core.require(errors, "readiness-authority", readiness.get("authority_sha256") == authority_item.sha256)
    core.require(errors, "readiness-lineage", readiness.get("v1_rejection_lineage_sha256") == lineage_item.sha256)
    core.require(errors, "readiness-dedup", readiness.get("dedup_precheck_sha256") == dedup_item.sha256)
    core.require(errors, "readiness-tests", readiness.get("test_evidence_sha256") == tests_item.sha256)
    core.require(errors, "readiness-seal", readiness.get("tool_seal_sha256") == seal_item.sha256)
    core.require(errors, "terminal-status", terminal_document.get("status") == "PASS_SUPERSESSION_V2_PREPARATION_ONLY_BLOCKED_NO_REVIEWER_NO_CAPTURE_NO_ACTIVATION")
    core.require(errors, "terminal-authority", terminal_document.get("authority_sha256") == authority_item.sha256)
    core.require(errors, "terminal-lineage", terminal_document.get("v1_rejection_lineage_sha256") == lineage_item.sha256)
    core.require(errors, "terminal-dedup", terminal_document.get("dedup_precheck_sha256") == dedup_item.sha256)
    core.require(errors, "terminal-tests", terminal_document.get("test_evidence_sha256") == tests_item.sha256)
    core.require(errors, "terminal-seal", terminal_document.get("tool_seal_sha256") == seal_item.sha256)
    core.require(errors, "terminal-readiness", terminal_document.get("readiness_blocked_sha256") == readiness_item.sha256)
    if errors:
        raise core.ClosureError(errors)
    verify_frozen_v1(lineage)
    v1_files = tuple(str(row["path"]) for row in lineage["current_post_replay_snapshot"]["files"])
    expected_branch = v1_files + tuple("supersession-v2/" + relative for relative in PREPARATION_FILES + FUTURE_FILES)
    core.closed_world_census(V1, AUDIT, expected_branch)
    _, v1_authority = core.stable_json(V1 / "AUTHORITY_C2_COMPATIBILITY_V32.json", V1)
    core.verify_preparation(v1_authority, audit_root=AUDIT, gate_root=GATE, namespace=V1, allow_future_inputs=True)

    reviewer_auth, reviewer_document = core.stable_json(V2 / "FUTURE_REVIEWER_INVOCATION_AUTHORITY_C2_SUPERSESSION_V2.json", V2)
    capture_auth, capture_document = core.stable_json(V2 / "FUTURE_CAPTURE_INVOCATION_AUTHORITY_C2_SUPERSESSION_V2.json", V2)
    reviewer_schema = json.loads(core.stable_read(V1 / "schemas/c2_future_reviewer_authority_v32.schema.json", V1).raw)
    capture_schema = json.loads(core.stable_read(V1 / "schemas/c2_future_capture_authority_v32.schema.json", V1).raw)
    errors = core.schema_errors(reviewer_document, reviewer_schema) + core.schema_errors(capture_document, capture_schema)

    evidence_authority = copy.deepcopy(v1_authority)
    evidence_authority["future"]["native_binding_path"] = "supersession-v2/FRESH_NATIVE_BINDING_C2_SUPERSESSION_V2.json"
    evidence = core.load_future_evidence(evidence_authority, audit_root=AUDIT, gate_root=GATE, namespace=V1, session_root=SESSIONS)
    reviewer_id = evidence.binding_document["reviewer_native"]["native_thread_id"]
    core.require(errors, "reviewer-authority-terminal", reviewer_document.get("preparation_terminal_sha256") == terminal.sha256)
    core.require(errors, "capture-authority-terminal", capture_document.get("preparation_terminal_sha256") == terminal.sha256)
    core.require(errors, "capture-authority-tool", capture_document.get("capture_tool_sha256") == tool.sha256)
    core.require(errors, "capture-authority-reviewer-authority", capture_document.get("reviewer_authority_sha256") == reviewer_auth.sha256)
    core.require(errors, "capture-authority-report", capture_document.get("report_sha256") == evidence.report.sha256 == core.REPORT_SHA)
    core.require(errors, "capture-authority-binding", capture_document.get("native_binding_sha256") == evidence.binding.sha256)
    core.require(errors, "capture-authority-reviewer", capture_document.get("reviewer_native_thread_id") == reviewer_id)
    if errors:
        raise core.ClosureError(errors)

    checkpoint_raw, capture_raw, capture = core.build_checkpoint_capture(v1_authority, evidence)
    output_schema = json.loads(core.stable_read(GATE / v1_authority["future"]["capture_output_schema_relative_to_gate"], GATE).raw)
    output_errors = [
        "capture-schema:" + "/".join(map(str, error.absolute_path)) + ":" + error.validator
        for error in Draft202012Validator(output_schema, format_checker=FormatChecker()).iter_errors(capture)
    ]
    if output_errors:
        raise core.ClosureError(output_errors)
    capture_path = GATE / core.CAPTURE_RELATIVE
    checkpoint_path = GATE / core.CHECKPOINT_RELATIVE
    capture_item, checkpoint_item = core.write_pair(capture_path, checkpoint_path, GATE, capture_raw, checkpoint_raw)
    print(json.dumps({
        "status": "captured_c2_supersession_v2_controller_native_proof_only",
        "slot_id": core.SLOT_ID,
        "reviewer_native_thread_id": reviewer_id,
        "report_sha256": evidence.report.sha256,
        "capture_sha256": capture_item.sha256,
        "checkpoint_sha256": checkpoint_item.sha256,
        "activation_authorized": False,
        "launch_authorized": False,
        "credit": 0,
    }, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
