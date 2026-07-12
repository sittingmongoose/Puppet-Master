#!/usr/bin/env python3
"""Draft 2020-12-first postrun validator for Audit 005 shadow certification.

This validator deliberately has no schema-validation fallback.  The complete
immutable result schema is validated with jsonschema.Draft202012Validator and a
FormatChecker before any semantic, receipt, native-identity, or coverage check.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import sys
from pathlib import Path
from typing import Any, Optional

HERE = Path(__file__).resolve().parent
WAVE_ROOT = HERE.parents[1]
AUDIT_ROOT = HERE.parents[4]
sys.path.insert(0, str(AUDIT_ROOT))

from universal_shadow_certification_common import (  # noqa: E402
    ASSIGNMENT_COUNT, ATTEMPT_ID, AUDIT_ID, CONTROLLER_THREAD_ID, EFFORT,
    FEATURE_COUNT, FEATURES_PER_ASSIGNMENT, MODEL, OUTPUT_ROOT, WAVE_ID,
    digest_values, load_jsonl, load_object, receipt_contract, sha_file,
    validate_result_document,
)

SCHEMA_PATH = WAVE_ROOT / "schemas/result.schema.json"
MANIFEST_PATH = WAVE_ROOT / "batch_manifest.jsonl"
CAPTURE_PATH = WAVE_ROOT / "runtime/native_capture-v2.json"
ENGINE_DISTRIBUTION = "jsonschema"
ENGINE_CLASS = "jsonschema.Draft202012Validator"
ENGINE_META_SCHEMA_ID = "https://json-schema.org/draft/2020-12/schema"


def sha_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def engine_status(expected_version: Optional[str] = None) -> dict[str, Any]:
    try:
        import jsonschema
        from jsonschema import Draft202012Validator, FormatChecker
        version = importlib.metadata.version(ENGINE_DISTRIBUTION)
        meta_id = Draft202012Validator.META_SCHEMA.get("$id")
        if meta_id != ENGINE_META_SCHEMA_ID:
            raise RuntimeError("draft-meta-schema-id-mismatch:%s" % meta_id)
        if expected_version is not None and version != expected_version:
            raise RuntimeError("schema-engine-version-drift:%s!=%s" % (version, expected_version))
        return {
            "available": True,
            "distribution": ENGINE_DISTRIBUTION,
            "library_version": version,
            "validator_class": ENGINE_CLASS,
            "meta_schema_id": meta_id,
            "format_checker": "%s.FormatChecker" % jsonschema.__name__,
            "error": None,
            "validator": Draft202012Validator,
            "format_checker_class": FormatChecker,
        }
    except Exception as exc:
        return {
            "available": False,
            "distribution": ENGINE_DISTRIBUTION,
            "library_version": None,
            "validator_class": ENGINE_CLASS,
            "meta_schema_id": ENGINE_META_SCHEMA_ID,
            "format_checker": "jsonschema.FormatChecker",
            "error": "%s:%s" % (type(exc).__name__, exc),
            "validator": None,
            "format_checker_class": None,
        }


def _path_string(parts: Any) -> str:
    return "$" + "".join("[%d]" % part if isinstance(part, int) else ".%s" % part for part in parts)


def complete_schema_errors(document: Any, schema: dict[str, Any], engine: dict[str, Any]) -> list[dict[str, Any]]:
    if not engine.get("available"):
        return [{
            "code": "schema_engine_unavailable",
            "instance_path": "$",
            "schema_path": "$",
            "validator": None,
            "message": engine.get("error"),
        }]
    validator_class = engine["validator"]
    format_checker_class = engine["format_checker_class"]
    try:
        validator_class.check_schema(schema)
        validator = validator_class(schema, format_checker=format_checker_class())
        found = list(validator.iter_errors(document))
    except Exception as exc:
        return [{
            "code": "schema_engine_failure",
            "instance_path": "$",
            "schema_path": "$",
            "validator": None,
            "message": "%s:%s" % (type(exc).__name__, exc),
        }]
    rows = [{
        "code": "draft202012_schema_violation",
        "instance_path": _path_string(error.absolute_path),
        "schema_path": _path_string(error.absolute_schema_path),
        "validator": error.validator,
        "message": error.message,
    } for error in found]
    return sorted(rows, key=lambda row: (row["instance_path"], row["schema_path"], str(row["validator"]), row["message"]))


def _load_capture(path: Path) -> tuple[dict[str, Any], list[str]]:
    if not path.is_file():
        return {}, ["native-capture-v2-missing"]
    try:
        value = load_object(path)
    except Exception as exc:
        return {}, ["native-capture-v2-parse:%s:%s" % (type(exc).__name__, exc)]
    errors: list[str] = []
    expected_top = {"audit_id", "schema_version", "wave_id", "attempt_id", "controller_thread_id", "controller_turn_id", "leaves"}
    if set(value) != expected_top:
        errors.append("native-capture-v2-top-key-set")
    if value.get("audit_id") != AUDIT_ID or value.get("wave_id") != WAVE_ID or value.get("attempt_id") != ATTEMPT_ID or value.get("controller_thread_id") != CONTROLLER_THREAD_ID:
        errors.append("native-capture-v2-identity")
    leaves = value.get("leaves", [])
    if not isinstance(leaves, list) or len(leaves) != ASSIGNMENT_COUNT:
        errors.append("native-capture-v2-cardinality")
        return value, errors
    required_leaf = {"assignment_id", "agent_path", "native_child_thread_id", "native_child_turn_id", "native_child_turn_status", "terminal_response_prefix"}
    for row in leaves:
        if not isinstance(row, dict) or set(row) != required_leaf:
            errors.append("native-capture-v2-leaf-key-set")
    for field in ("assignment_id", "agent_path", "native_child_thread_id", "native_child_turn_id"):
        values = [row.get(field) for row in leaves if isinstance(row, dict)]
        if len(values) != len(set(values)):
            errors.append("native-capture-v2-duplicate:%s" % field)
    return value, sorted(set(errors))


def validate_postrun_v2(namespace: Path = WAVE_ROOT, capture_path: Path = CAPTURE_PATH, expected_engine_version: Optional[str] = None) -> dict[str, Any]:
    global_errors: list[str] = []
    assignment_reports: list[dict[str, Any]] = []
    engine = engine_status(expected_engine_version)
    public_engine = {key: value for key, value in engine.items() if key not in {"validator", "format_checker_class"}}
    try:
        schema_raw = (namespace / "schemas/result.schema.json").read_bytes()
        schema = json.loads(schema_raw)
        manifest = load_jsonl(namespace / "batch_manifest.jsonl")
        contract = load_object(namespace / "receipt_contract.json")
    except Exception as exc:
        return {
            "status": "fail_closed", "global_errors": ["load:%s:%s" % (type(exc).__name__, exc)],
            "schema_engine": public_engine, "assignments": [], "certification_credit": 0,
        }
    if not engine.get("available"):
        global_errors.append("schema-engine-unavailable")
    if sha_bytes(schema_raw) != "d0aad92e52ece20c3164535b2a9fa7a780e57f49343cd7a1ba9ad96d28eec0b1":
        global_errors.append("immutable-result-schema-hash")
    if len(manifest) != ASSIGNMENT_COUNT:
        global_errors.append("manifest-cardinality")
    if contract != receipt_contract():
        global_errors.append("receipt-contract-drift")
    capture, capture_errors = _load_capture(capture_path)
    global_errors.extend(capture_errors)
    capture_by_id = {row.get("assignment_id"): row for row in capture.get("leaves", []) if isinstance(row, dict)}

    all_refs: list[str] = []
    for assignment in manifest:
        aid = assignment.get("assignment_id")
        errors: list[str] = []
        schema_errors: list[dict[str, Any]] = []
        packet_path = namespace / assignment.get("packet_ref", "")
        intent_path = namespace / assignment.get("intent_ref", "")
        receipt_path = intent_path.with_name("dispatch_receipt.json")
        output_dir = Path(assignment.get("output_directory", ""))
        result_path = output_dir / "result.json"
        packet: Optional[dict[str, Any]] = None
        result: Optional[dict[str, Any]] = None

        if not result_path.is_file():
            errors.append("result-missing")
        else:
            try:
                result = load_object(result_path)
            except Exception as exc:
                errors.append("result-parse:%s:%s" % (type(exc).__name__, exc))
        # Complete Draft 2020-12 validation is always first.  No semantic check
        # below executes unless the schema engine is available and finds zero errors.
        if result is not None:
            schema_errors = complete_schema_errors(result, schema, engine)
            if schema_errors:
                errors.append("complete-draft202012-schema-validation")
        elif not engine.get("available"):
            schema_errors = complete_schema_errors({}, schema, engine)

        if result is not None and not schema_errors:
            if not packet_path.is_file() or sha_file(packet_path) != assignment.get("packet_sha256"):
                errors.append("packet-missing-or-hash")
            else:
                try:
                    packet = load_object(packet_path)
                except Exception as exc:
                    errors.append("packet-parse:%s:%s" % (type(exc).__name__, exc))
            if packet is not None:
                errors.extend(validate_result_document(result, assignment, packet))
            if not intent_path.is_file():
                errors.append("intent-missing")
            if not output_dir.is_dir() or sorted(path.name for path in output_dir.iterdir()) != ["result.json"]:
                errors.append("output-confinement")
            if not receipt_path.is_file():
                errors.append("receipt-missing")
                receipt: dict[str, Any] = {}
            else:
                try:
                    receipt = load_object(receipt_path)
                except Exception as exc:
                    receipt = {}
                    errors.append("receipt-parse:%s:%s" % (type(exc).__name__, exc))
            required_receipt = set(contract.get("required_keys", []))
            if set(receipt) != required_receipt:
                errors.append("receipt-exact-key-set")
            expected_receipt = {
                "audit_id": AUDIT_ID,
                "schema_version": "external-research-universal-shadow-certification-dispatch-receipt-v1",
                "wave_id": WAVE_ID,
                "assignment_id": aid,
                "attempt_id": ATTEMPT_ID,
                "controller_thread_id": CONTROLLER_THREAD_ID,
                "model": MODEL,
                "reasoning_effort": EFFORT,
                "fresh_child": True,
                "fork_turns": "none",
                "packet_sha256": assignment.get("packet_sha256"),
                "output_directory": assignment.get("output_directory"),
            }
            for key, expected in expected_receipt.items():
                if receipt.get(key) != expected:
                    errors.append("receipt-binding:%s" % key)
            if intent_path.is_file() and receipt.get("dispatch_intent_sha256") != sha_file(intent_path):
                errors.append("receipt-intent-hash")
            if receipt.get("result_sha256") != sha_file(result_path):
                errors.append("receipt-result-hash")
            if receipt.get("agent_path") != assignment.get("prospective_agent_path") or receipt.get("task_thread_id") != receipt.get("agent_path"):
                errors.append("receipt-agent-path")
            native = capture_by_id.get(aid, {})
            if native.get("agent_path") != assignment.get("prospective_agent_path"):
                errors.append("capture-agent-path")
            if native.get("native_child_thread_id") != receipt.get("native_child_thread_id"):
                errors.append("receipt-capture-native-thread")
            if native.get("native_child_turn_status") != "completed" or not str(native.get("terminal_response_prefix", "")).startswith("PMR1"):
                errors.append("capture-terminal-pmr1")
        all_refs.extend(assignment.get("feature_refs", []))
        assignment_reports.append({
            "assignment_id": aid,
            "state": "eligible" if not errors and not schema_errors else "rejected",
            "errors": sorted(set(errors)),
            "schema_error_count": len(schema_errors),
            "schema_errors": schema_errors,
        })

    expected_ids = ["A005ERSC-%04d" % index for index in range(1, ASSIGNMENT_COUNT + 1)]
    if [row.get("assignment_id") for row in manifest] != expected_ids:
        global_errors.append("manifest-assignment-order")
    if len(all_refs) != FEATURE_COUNT or len(set(all_refs)) != FEATURE_COUNT:
        global_errors.append("global-feature-coverage")
    if any(len(row.get("feature_refs", [])) != FEATURES_PER_ASSIGNMENT for row in manifest):
        global_errors.append("per-assignment-feature-cardinality")
    eligible = [row["assignment_id"] for row in assignment_reports if row["state"] == "eligible"]
    rejected = [row["assignment_id"] for row in assignment_reports if row["state"] == "rejected"]
    status = "pass" if not global_errors and len(eligible) == ASSIGNMENT_COUNT else "fail_closed"
    return {
        "audit_id": AUDIT_ID,
        "schema_version": "external-research-universal-shadow-certification-postrun-validation-v2",
        "validator": "universal-shadow-certification-postrun-v2",
        "wave_id": WAVE_ID,
        "status": status,
        "schema_engine": public_engine,
        "schema_sha256": sha_bytes(schema_raw),
        "global_errors": sorted(set(global_errors)),
        "counts": {
            "assignments": len(manifest), "eligible": len(eligible), "rejected": len(rejected),
            "features": len(all_refs), "unique_features": len(set(all_refs)),
            "receipts": sum(1 for row in manifest if (namespace / row.get("intent_ref", "")).with_name("dispatch_receipt.json").is_file()),
            "results": sum(1 for row in manifest if (Path(row.get("output_directory", "")) / "result.json").is_file()),
            "native_capture_rows": len(capture.get("leaves", [])) if isinstance(capture.get("leaves", []), list) else 0,
        },
        "eligible_assignment_ids": eligible,
        "eligible_assignment_ids_digest": digest_values(eligible),
        "rejected_assignment_ids": rejected,
        "assignments": assignment_reports,
        "eligible_feature_count": FEATURE_COUNT if status == "pass" else 0,
        "certification_credit": 0,
        "promotion_credit": 0,
        "merge_credit": 0,
        "spec_edit_credit": 0,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--namespace", type=Path, default=WAVE_ROOT)
    parser.add_argument("--native-capture", type=Path, default=CAPTURE_PATH)
    parser.add_argument("--expected-jsonschema-version")
    parser.add_argument("--write-report", type=Path)
    args = parser.parse_args()
    report = validate_postrun_v2(args.namespace.resolve(), args.native_capture.resolve(), args.expected_jsonschema_version)
    text = json.dumps(report, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
    if args.write_report:
        args.write_report.write_text(text, encoding="utf-8")
    print(text, end="")
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()

