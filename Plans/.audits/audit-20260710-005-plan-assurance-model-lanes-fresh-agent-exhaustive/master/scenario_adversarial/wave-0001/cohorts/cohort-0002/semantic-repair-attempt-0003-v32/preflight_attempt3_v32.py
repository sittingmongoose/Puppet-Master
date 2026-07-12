#!/usr/bin/env python3
"""Frozen-result_errors preflight and exclusive attempt3 result writer."""
from __future__ import annotations

import argparse
import importlib.util
import importlib.metadata
import json
import os
import sys
from pathlib import Path
from typing import Any

sys.dont_write_bytecode = True
import attempt3_common as common

from jsonschema import Draft202012Validator

_FROZEN: Any | None = None


def runtime_errors() -> list[str]:
    errors = []
    if tuple(sys.version_info[:3]) != (3, 12, 13):
        errors.append("attempt3-runtime:python-version")
    if Path(sys.executable).resolve() != common.AUDIT_PYTHON.resolve():
        errors.append("attempt3-runtime:python-executable")
    if importlib.metadata.version("jsonschema") != "4.26.0":
        errors.append("attempt3-runtime:jsonschema-version")
    if f"{Draft202012Validator.__module__}.{Draft202012Validator.__name__}" != "jsonschema.validators.Draft202012Validator":
        errors.append("attempt3-runtime:validator-class")
    if not sys.flags.no_site or not sys.flags.no_user_site or not sys.flags.dont_write_bytecode:
        errors.append("attempt3-runtime:flags")
    if os.environ.get("PYTHONPATH") != str(common.JSONSCHEMA_SITE) or os.environ.get("PYTHONNOUSERSITE") != "1" or os.environ.get("PYTHONDONTWRITEBYTECODE") != "1":
        errors.append("attempt3-runtime:environment")
    return errors


def frozen_module() -> Any:
    global _FROZEN
    if _FROZEN is not None:
        return _FROZEN
    observed = common.file_binding(common.FROZEN_VALIDATOR)["raw_sha256"]
    if observed != common.FROZEN_VALIDATOR_SHA:
        raise ValueError("frozen-validator-sha256:" + observed)
    spec = importlib.util.spec_from_file_location("attempt3_frozen_result_errors_v31_1", common.FROZEN_VALIDATOR)
    if spec is None or spec.loader is None:
        raise ValueError("frozen-validator-import-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    _FROZEN = module
    return module


def attempt3_binding_errors(result: dict[str, Any], assignment_id: str) -> list[str]:
    row = common.attempt3_row(assignment_id)
    errors = [
        "attempt3-schema:" + "/".join(str(part) for part in error.absolute_path) + ":" + error.message
        for error in Draft202012Validator(common.load(common.RESULT_SCHEMA)).iter_errors(result)
    ]
    expected = {
        "schema_version": "scenario-adversarial-semantic-repair-result-v32-v1",
        "assignment_id": assignment_id,
        "attempt_id": common.ATTEMPT_ID,
        "task_thread_id": common.attempt3_agent_path(assignment_id),
        "model": "gpt-5.6-sol",
        "reasoning_effort": "ultra",
    }
    for key, value in expected.items():
        if result.get(key) != value:
            errors.append("attempt3-binding:" + key)
    input_binding = result.get("input_binding", {})
    for key, value in {
        "packet_id": row["packet_id"],
        "packet_sha256": row["packet_sha256"],
        "feature_refs_digest": row["feature_refs_digest"],
        "candidate_evidence_label": row["candidate_evidence_label"],
    }.items():
        if not isinstance(input_binding, dict) or input_binding.get(key) != value:
            errors.append("attempt3-input-binding:" + key)
    return sorted(set(errors))


def compatibility_projection(result: dict[str, Any], assignment_id: str) -> dict[str, Any]:
    """Change only frozen attempt-binding fields after true attempt3 validation."""
    projected = json.loads(json.dumps(result))
    replacements = {
        "schema_version": "scenario-adversarial-semantic-repair-result-v31-v1",
        "attempt_id": "attempt-0002",
        "task_thread_id": f"/root/sol_controller_v29/a005_scenario_adversarial_{assignment_id[-4:]}_semantic_repair_attempt_0002_ultra_v31",
    }
    projected.update(replacements)
    changed = {key for key in set(result) | set(projected) if result.get(key) != projected.get(key)}
    if changed != set(replacements):
        raise ValueError("compatibility-projection-field-set:" + ",".join(sorted(changed)))
    for key in result:
        if key not in replacements and projected[key] != result[key]:
            raise ValueError("compatibility-projection-masked:" + key)
    return projected


def question_mapping_errors(result: dict[str, Any], assignment_id: str) -> list[str]:
    packet = common.load(common.obligation_packet_path(assignment_id))
    obligations = {row["provisional_feature_ref"]: row for row in packet["features"]}
    certifications = {row.get("provisional_feature_ref"): row for row in result.get("feature_certifications", []) if isinstance(row, dict)}
    errors: list[str] = []
    if packet.get("question_count") != common.QUESTION_COUNTS[assignment_id]:
        errors.append("attempt3-question-mapping:packet-question-count")
    for feature_ref, obligation in obligations.items():
        certification = certifications.get(feature_ref, {})
        dimensions = certification.get("dimensions", {}) if isinstance(certification, dict) else {}
        for question in obligation["question_to_scenario_mapping"]:
            dimension = dimensions.get(question["required_dimension"], {}) if isinstance(dimensions, dict) else {}
            scenarios = dimension.get("scenarios", []) if isinstance(dimension, dict) else []
            prefix = question["required_scenario_prefix"]
            if not isinstance(scenarios, list) or sum(1 for scenario in scenarios if isinstance(scenario, str) and scenario.startswith(prefix)) != 1:
                errors.append(f"attempt3-question-mapping:{feature_ref}:{question['question_id']}")
    return sorted(set(errors))


def result_errors(result: dict[str, Any], assignment_id: str) -> list[str]:
    environment_errors = runtime_errors()
    if environment_errors:
        return environment_errors
    if assignment_id not in common.ASSIGNMENTS:
        return ["attempt3:unknown-assignment"]
    errors = attempt3_binding_errors(result, assignment_id)
    if errors:
        return errors
    errors.extend(question_mapping_errors(result, assignment_id))
    if errors:
        return sorted(set(errors))
    projected = compatibility_projection(result, assignment_id)
    errors.extend("frozen:" + error for error in frozen_module().result_errors(projected, assignment_id))
    return sorted(set(errors))


def exclusive_result_write(result: dict[str, Any], assignment_id: str) -> dict[str, Any]:
    output = common.output_directory(assignment_id)
    if common.output_inventory(output):
        raise ValueError("attempt3-output-not-empty")
    raw = common.json_bytes(result)
    destination = output / "result.json"
    common.write_exclusive(destination, raw, 0o444)
    written = common.load(destination)
    postwrite_errors = result_errors(written, assignment_id)
    if postwrite_errors:
        raise RuntimeError("postwrite-validator-errors:" + json.dumps(postwrite_errors, sort_keys=True))
    return {"path": str(destination), "byte_count": len(raw), "raw_sha256": common.sha_bytes(raw)}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--assignment-id", required=True, choices=common.ASSIGNMENTS)
    parser.add_argument("--candidate", required=True)
    parser.add_argument("--exclusive-write", action="store_true")
    args = parser.parse_args()
    candidate_path = Path(args.candidate).expanduser().resolve()
    output = common.output_directory(args.assignment_id).resolve()
    if candidate_path == output or output in candidate_path.parents:
        raise SystemExit("candidate-must-remain-outside-attempt3-output")
    try:
        result = common.load(candidate_path)
        if not isinstance(result, dict):
            raise ValueError("candidate-root-not-object")
        errors = result_errors(result, args.assignment_id)
    except Exception as exc:
        print(json.dumps({"status": "fail_closed", "assignment_id": args.assignment_id, "error": type(exc).__name__ + ":" + str(exc)}, indent=2, sort_keys=True))
        raise SystemExit(1)
    report: dict[str, Any] = {
        "status": "pass" if not errors else "fail_closed",
        "assignment_id": args.assignment_id,
        "frozen_validator_sha256": common.FROZEN_VALIDATOR_SHA,
        "runtime": {"python": sys.executable, "python_version": ".".join(str(value) for value in sys.version_info[:3]), "jsonschema_version": importlib.metadata.version("jsonschema"), "validator_class": f"{Draft202012Validator.__module__}.{Draft202012Validator.__name__}", "no_site": bool(sys.flags.no_site), "no_user_site": bool(sys.flags.no_user_site), "dont_write_bytecode": bool(sys.flags.dont_write_bytecode)},
        "function": "result_errors",
        "error_count": len(errors),
        "errors": errors,
        "exclusive_write_requested": args.exclusive_write,
        "result_write": None,
        "terminal_response_authorized": None,
    }
    if errors:
        print(json.dumps(report, indent=2, sort_keys=True))
        raise SystemExit(1)
    if args.exclusive_write:
        try:
            report["result_write"] = exclusive_result_write(result, args.assignment_id)
            report["terminal_response_authorized"] = "PMR1"
        except Exception as exc:
            report["status"] = "fail_closed"
            report["write_error"] = type(exc).__name__ + ":" + str(exc)
            print(json.dumps(report, indent=2, sort_keys=True))
            raise SystemExit(1)
    print(json.dumps(report, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
