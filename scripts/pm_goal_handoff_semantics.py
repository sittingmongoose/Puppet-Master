"""GRS-047 static handoff joins; no native execution or readiness authority."""
from typing import Any


def goal_handoff_semantic_failures(definition_name: str, value: Any) -> list[str]:
    """Join independently schema-validated records without cross-domain ordering."""
    if definition_name not in ("GoalHandoffCommandRequest", "GoalHandoffCommandRoundTrip"):
        return []
    if not isinstance(value, dict):
        return ["goal_handoff.invalid_record"]
    request = value if definition_name == "GoalHandoffCommandRequest" else value.get("request")
    if not isinstance(request, dict):
        return ["goal_handoff.invalid_record"]
    failures = []
    if request.get("command_id") == "cmd.goal.resume_here":
        payload = request.get("payload")
        if (not isinstance(payload, dict) or "current_host_id" not in request
                or payload.get("current_host_id") != request["current_host_id"]):
            failures.append("goal_handoff.resume_current_host")
    if definition_name == "GoalHandoffCommandRequest":
        return failures
    result = value.get("result")
    if not isinstance(result, dict):
        return failures + ["goal_handoff.invalid_record"]
    identity_fields = ("command_id", "operation", "command_instance_id", "goal_id",
                       "goal_run_id", "project_id", "source_location_id", "current_host_id")
    if any(field not in request or field not in result or request[field] != result[field]
           for field in identity_fields):
        failures.append("goal_handoff.request_result_identity")
    generation_fields = ("expected_goal_generation", "expected_topology_generation", "expected_source_generation")
    if any(field not in request or field not in result or request[field] != result[field]
           for field in generation_fields):
        failures.append("goal_handoff.request_generation_echo")
    if (not isinstance(request.get("return_context"), dict)
            or not isinstance(result.get("return_context"), dict)
            or request["return_context"] != result["return_context"]):
        failures.append("goal_handoff.exact_return_context")
    # output.resulting_generation has no adjudicated domain here. It is not
    # ordered against Goal, topology, source, or caller-return generations.
    return failures
