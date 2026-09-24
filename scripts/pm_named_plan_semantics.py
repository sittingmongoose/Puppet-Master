"""NPLAN/CV-333 static request/response joins; no runtime family or retry policy.

Inputs are the actual normalized owner records. Exact original-request replay
proof does not decide how a differently delivered retry should be normalized.
Opaque refs are not resolved here and string prefixes convey no receipt class.
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator

VALIDATION_DEFINITION = "named_plan_action_response_validation"
VALIDATION_SCHEMA_ID = "pm.named_plan.action_response_validation.v1"
REQUEST_DEFINITION = "named_plan_action_request"
RESULT_DEFINITION = "named_plan_action_result"
ERROR_DEFINITION = "named_plan_action_error"


@lru_cache(maxsize=4)
def _validator(definition: str) -> Draft202012Validator:
    schema = json.loads((Path(__file__).resolve().parents[1] /
                         "Plans/named_plan_system_contracts.schema.json").read_text())
    return Draft202012Validator({
        "$schema": schema["$schema"], "$defs": schema["$defs"],
        "$ref": "#/$defs/" + definition,
    })


def _response_definition(value: dict[str, Any]) -> str:
    if value.get("schema_id") == "pm.named_plan.action_error.v1":
        return ERROR_DEFINITION
    return RESULT_DEFINITION


def _pair_failures(request: Any, response: Any) -> list[str]:
    if not isinstance(request, dict) or not _validator(REQUEST_DEFINITION).is_valid(request):
        return ["named_plan.request_schema_invalid"]
    if not isinstance(response, dict) or not _validator(_response_definition(response)).is_valid(response):
        return ["named_plan.response_schema_invalid"]
    failures = []
    for field in ("command_id", "command_instance_id", "project_id"):
        if request[field] != response[field]:
            failures.append("named_plan.response_" + field + "_mismatch")
    # Create allocates identity. Failure/error can retain an unresolved null
    # target; any nonnull target must not silently identify a different Plan.
    if (request["named_plan_id"] is not None and response["named_plan_id"] is not None
            and request["named_plan_id"] != response["named_plan_id"]):
        failures.append("named_plan.response_named_plan_id_mismatch")
    return failures


def named_plan_action_join_failures(
    request: Any, response: Any, *, original_request: Any = None,
    original_result: Any = None,
) -> list[str]:
    """Validate records separately, then their bounded normalized identity join.

    A stale error can return newer currentness. Return route and result route
    have different roles. Neither is equated to a request expectation here.
    """
    failures = _pair_failures(request, response)
    if failures:
        return failures
    if not response.get("replayed", False):
        if original_request is not None or original_result is not None:
            return ["named_plan.unexpected_replay_evidence"]
        return []
    if original_request is None or original_result is None:
        return ["named_plan.replay_original_pair_missing"]
    # The first original must be a valid result, not a typed error or another
    # replay marker. Typed errors have no replay marker in the existing schema.
    if (not isinstance(original_result, dict)
            or not _validator(RESULT_DEFINITION).is_valid(original_result)
            or original_result["replayed"] is not False):
        return ["named_plan.replay_original_result_not_first_result"]
    failures = ["named_plan.original_" + code.removeprefix("named_plan.")
                for code in _pair_failures(original_request, original_result)]
    if failures:
        return failures
    if original_request != request:
        failures.append("named_plan.replay_original_normalized_request_mismatch")
    if response != {**original_result, "replayed": True}:
        failures.append("named_plan.replay_original_result_mismatch")
    return failures


def named_plan_semantic_failures(definition_name: str, value: Any) -> list[str]:
    """Aggregate entrypoint for a non-runtime, closed validation-only input."""
    if definition_name != VALIDATION_DEFINITION:
        if (definition_name != "<root>" or not isinstance(value, dict)
                or value.get("schema_id") != VALIDATION_SCHEMA_ID):
            return []
    if not _validator(VALIDATION_DEFINITION).is_valid(value):
        return ["named_plan.validation_input_invalid"]
    return named_plan_action_join_failures(
        value["request"], value["response"],
        original_request=value["original_request"],
        original_result=value["original_result"],
    )
