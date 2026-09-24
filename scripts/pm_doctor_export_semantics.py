"""Static joins for N2-155 Doctor report export; no export or runtime authority."""
from typing import Any


def doctor_export_semantic_failures(definition_name: str, value: Any) -> list[str]:
    """Enforce joins that JSON Schema's x-semantic-invariants cannot execute.

    Schema validation remains mandatory before this cross-record check. Echoed
    request generations are identities, not numerical comparisons with the
    separately unadjudicated output.resulting_generation domain.
    """
    if definition_name != "DoctorReportExportCommandRoundTrip":
        return []
    if not isinstance(value, dict):
        return ["doctor_export.invalid_round_trip"]
    request, result = value.get("request"), value.get("result")
    if not isinstance(request, dict) or not isinstance(result, dict):
        return ["doctor_export.invalid_round_trip"]
    failures = []
    identity_fields = ("command_id", "operation", "command_instance_id", "doctor_report_id", "project_id")
    if any(field not in request or field not in result or request[field] != result[field]
           for field in identity_fields):
        failures.append("doctor_export.request_result_identity")
    generation_fields = ("expected_registry_generation", "expected_projection_generation")
    if any(field not in request or field not in result or request[field] != result[field]
           for field in generation_fields):
        failures.append("doctor_export.request_generation_echo")
    if (not isinstance(request.get("return_context"), dict)
            or not isinstance(result.get("return_context"), dict)
            or request["return_context"] != result["return_context"]):
        failures.append("doctor_export.exact_return_context")
    return failures
