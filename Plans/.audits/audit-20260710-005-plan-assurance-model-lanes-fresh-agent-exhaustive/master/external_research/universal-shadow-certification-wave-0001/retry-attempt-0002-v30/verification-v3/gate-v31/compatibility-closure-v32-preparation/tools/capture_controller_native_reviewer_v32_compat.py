#!/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3
"""Future-only C1 capture closure writer; preparation leaves it authorization-blocked.

Do not invoke this tool during V32 preparation.  A later append-only
``CLOSURE_INVOCATION_AUTHORITY_V32.json`` must bind the sealed preparation
terminal and this exact tool before the fixed V31-compatible outputs can be
created once.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

DEPENDENCY_SITE = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive/master/dependencies/jsonschema-draft202012-v1/site-packages")
sys.path.insert(0, str(DEPENDENCY_SITE))
from jsonschema import Draft202012Validator, FormatChecker

import closure_core_v32 as core


PREP = Path(__file__).resolve().parents[1]
GATE = PREP.parent
AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
SESSIONS = Path("/Users/jaredsmacbookair/.codex/sessions")
AUTHORITY_PATH = PREP / "AUTHORITY_COMPATIBILITY_V32.json"
TERMINAL_PATH = PREP / "TERMINAL_PREPARATION_V32.json"
CAPTURE_SCHEMA_PATH = GATE / "schemas/controller_native_reviewer_capture_v31.schema.json"


def load_authority() -> dict:
    _, authority = core.load_stable_json(AUTHORITY_PATH, PREP)
    return authority


def validate_future_authorization(authority: dict) -> None:
    path = PREP / authority["production"]["future_authority_path"]
    item, document = core.load_stable_json(path, PREP)
    terminal = core.stable_regular_read(TERMINAL_PATH, PREP)
    tool = core.stable_regular_read(Path(__file__).resolve(), PREP)
    expected = {
        "schema_version": "a005-c1-v32-compatible-closure-invocation-authority-v1",
        "status": "AUTHORIZE_C1_NATIVE_CAPTURE_CLOSURE_ONLY",
        "slot_id": "c1-atomic8-prelaunch",
        "preparation_terminal_sha256": terminal.sha256,
        "closure_tool_sha256": tool.sha256,
        "report_sha256": authority["report"]["sha256"],
        "reviewer_native_thread_id": authority["identity"]["reviewer_native_thread_id"],
        "capture_relative_path": authority["production"]["capture_relative_path"],
        "checkpoint_relative_path": authority["production"]["checkpoint_relative_path"],
        "activation_authorized": False,
        "launch_authorized": False,
        "credit": 0,
    }
    if document != expected or item.raw != core.pretty(expected):
        raise core.ClosureError("future-authority-semantic-or-canonical")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--slot", required=True, choices=["c1-atomic8-prelaunch"])
    args = parser.parse_args()
    authority = load_authority()
    if args.slot != authority["report"]["slot_id"]:
        raise core.ClosureError("slot-mismatch")
    validate_future_authorization(authority)
    evidence = core.verify_live(
        authority,
        audit_root=AUDIT,
        gate_root=GATE,
        prep_root=PREP,
        session_root=SESSIONS,
        require_future_authority_absent=False,
    )
    checkpoint_raw, capture_raw, capture = core.build_checkpoint_and_capture(authority, evidence)
    semantic_errors = core.validate_capture_document(capture, authority, checkpoint_raw)
    schema = json.loads(core.stable_regular_read(CAPTURE_SCHEMA_PATH, GATE).raw)
    schema_errors = ["schema:" + "/".join(map(str, error.absolute_path)) + ":" + error.validator for error in Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(capture)]
    if semantic_errors or schema_errors:
        raise core.ClosureError(semantic_errors + schema_errors)
    capture_path = GATE / authority["production"]["capture_relative_path"]
    checkpoint_path = GATE / authority["production"]["checkpoint_relative_path"]
    capture_item, checkpoint_item = core.write_closure_pair(capture_path, checkpoint_path, GATE, capture_raw, checkpoint_raw)
    print(json.dumps({
        "status": "captured_proof_only_v31_compatible_v32_supersession",
        "slot_id": args.slot,
        "native_thread_id": authority["identity"]["reviewer_native_thread_id"],
        "report_sha256": authority["report"]["sha256"],
        "checkpoint_sha256": checkpoint_item.sha256,
        "capture_sha256": capture_item.sha256,
        "activation_authorized": False,
        "launch_authorized": False,
        "credit": 0,
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
