#!/usr/bin/env python3
"""Future-only C2 capture closure writer; never dispatches a reviewer or launch."""
from __future__ import annotations

import json
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

import c2_closure_core_v32 as core


NS = Path(__file__).resolve().parents[1]
GATE = NS.parent
AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
SESSIONS = Path("/Users/jaredsmacbookair/.codex/sessions")


def main() -> int:
    runtime_errors = core.validate_runtime(AUDIT)
    if runtime_errors:
        raise core.ClosureError(runtime_errors)
    _, authority = core.stable_json(NS / "AUTHORITY_C2_COMPATIBILITY_V32.json", NS)
    core.verify_preparation(authority, audit_root=AUDIT, gate_root=GATE, namespace=NS, allow_future_inputs=True)

    terminal = core.stable_read(NS / "TERMINAL_PREPARATION_C2_V32.json", NS)
    tool = core.stable_read(Path(__file__).resolve(), NS)
    reviewer_auth, reviewer_document = core.stable_json(NS / "FUTURE_REVIEWER_INVOCATION_AUTHORITY_C2_V32.json", NS)
    capture_auth, capture_document = core.stable_json(NS / "FUTURE_CAPTURE_INVOCATION_AUTHORITY_C2_V32.json", NS)
    reviewer_schema = json.loads(core.stable_read(NS / authority["future"]["reviewer_authority_schema_path"], NS).raw)
    capture_schema = json.loads(core.stable_read(NS / authority["future"]["capture_authority_schema_path"], NS).raw)
    errors = core.schema_errors(reviewer_document, reviewer_schema) + core.schema_errors(capture_document, capture_schema)
    evidence = core.load_future_evidence(authority, audit_root=AUDIT, gate_root=GATE, namespace=NS, session_root=SESSIONS)
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

    checkpoint_raw, capture_raw, capture = core.build_checkpoint_capture(authority, evidence)
    output_schema = json.loads(core.stable_read(GATE / authority["future"]["capture_output_schema_relative_to_gate"], GATE).raw)
    output_errors = ["capture-schema:" + "/".join(map(str, error.absolute_path)) + ":" + error.validator for error in Draft202012Validator(output_schema, format_checker=FormatChecker()).iter_errors(capture)]
    if output_errors:
        raise core.ClosureError(output_errors)
    capture_path = GATE / core.CAPTURE_RELATIVE
    checkpoint_path = GATE / core.CHECKPOINT_RELATIVE
    capture_item, checkpoint_item = core.write_pair(capture_path, checkpoint_path, GATE, capture_raw, checkpoint_raw)
    print(json.dumps({
        "status": "captured_c2_controller_native_proof_only",
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
