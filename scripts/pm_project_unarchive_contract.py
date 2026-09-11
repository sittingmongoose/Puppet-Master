"""Read-only fixture oracle for PJCT-002's registry-only unarchive contract.

This does not dispatch a command, authorize a caller, write a registry, authenticate
readback, or certify a native handler. It checks supplied typed snapshots and their
cross-record relationships; real permission, storage, receipt and restart evidence
are still required. No Project mutation implementation lives in this module.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from jsonschema import Draft202012Validator


COMMAND = "cmd.project.unarchive"
MUTABLE_PROJECT_FIELDS = frozenset({
    "lifecycle", "updated_at_utc", "revision", "currentness_sha256",
})


def validate_transition(
    schema: dict[str, Any],
    request: dict[str, Any],
    result: dict[str, Any],
    before_project: dict[str, Any],
    after_project: dict[str, Any],
    before_registry: dict[str, Any],
    after_registry: dict[str, Any],
    *,
    original_request: dict[str, Any] | None = None,
    original_result: dict[str, Any] | None = None,
) -> list[str]:
    """Reject a schema-valid but semantically inconsistent fixture transition."""

    failures: list[str] = []
    records = [
        ("request", "project_action_request", request),
        ("result", "project_action_result", result),
        ("before_project", "project_record", before_project),
        ("after_project", "project_record", after_project),
    ]
    if original_request is not None:
        records.append(("original_request", "project_action_request", original_request))
    if original_result is not None:
        records.append(("original_result", "project_action_result", original_result))
    for label, definition, instance in records:
        selected = {"$defs": schema["$defs"], "$ref": f"#/$defs/{definition}"}
        for error in Draft202012Validator(selected).iter_errors(instance):
            pointer = "/".join(str(part) for part in error.absolute_path)
            failures.append(f"{label}:{pointer}:schema_violation")
    fence_schema = {
        "type": "object", "additionalProperties": False,
        "required": ["revision", "currentness_sha256"],
        "properties": {
            "revision": {"type": "integer", "minimum": 0},
            "currentness_sha256": schema["$defs"]["sha256"],
        },
    }
    for label, instance in (("before_registry", before_registry), ("after_registry", after_registry)):
        if not Draft202012Validator(fence_schema).is_valid(instance):
            failures.append(f"{label}:invalid_fence")
    if failures:
        return failures

    def require(condition: bool, code: str) -> None:
        if not condition:
            failures.append(code)

    require(request["action_id"] == result["action_id"] == COMMAND, "wrong_command")
    require(request["command_instance_id"] == result["command_instance_id"], "wrong_command_instance")
    require(request["return_context"] == result["return_context"], "wrong_return_context")
    require(request["project_id"] == before_project["project_id"] == after_project["project_id"], "project_identity_changed")

    if result["replayed"]:
        require(before_project == after_project and before_registry == after_registry, "replay_mutated_state")
        require(original_request is not None and original_result is not None, "replay_missing_original_binding")
        if original_request is not None and original_result is not None:
            require(request == original_request, "replay_binding_changed")
            require(not original_result["replayed"], "replay_original_is_not_original")
            require(original_result["outcome"] in {"accepted", "no_change"}, "replay_original_not_committed_or_no_change")
            require(
                {key: value for key, value in result.items() if key != "replayed"}
                == {key: value for key, value in original_result.items() if key != "replayed"},
                "replay_original_result_changed",
            )
            require(original_result["return_context"] == original_request["return_context"], "replay_original_return_mismatch")
            require(original_result["command_instance_id"] == original_request["command_instance_id"], "replay_original_instance_mismatch")
            require(original_result["project_id"] == original_request["project_id"], "replay_original_project_mismatch")
        return failures

    successful = result["outcome"] in {"accepted", "no_change"}
    if successful:
        require(request["expected_registry_revision"] == before_registry["revision"], "stale_registry_revision")
        require(request["expected_registry_currentness_sha256"] == before_registry["currentness_sha256"], "stale_registry_currentness")
        require(request["expected_project_revision"] == before_project["revision"], "stale_project_revision")
        require(request["expected_project_currentness_sha256"] == before_project["currentness_sha256"], "stale_project_currentness")
        require(result["project_id"] == after_project["project_id"], "result_project_mismatch")
        require(result["project_revision"] == after_project["revision"], "result_project_revision_mismatch")
        require(result["project_currentness_sha256"] == after_project["currentness_sha256"], "result_project_currentness_mismatch")
        require(result["lifecycle"] == after_project["lifecycle"] == "listed", "result_not_listed_readback")
    require(result["resulting_registry_revision"] == after_registry["revision"], "result_registry_revision_mismatch")
    require(result["resulting_registry_currentness_sha256"] == after_registry["currentness_sha256"], "result_registry_currentness_mismatch")

    if result["outcome"] == "accepted":
        require(before_project["lifecycle"] == "archived", "archive_state_required")
        require(after_project["revision"] == before_project["revision"] + 1, "project_revision_not_once")
        require(after_registry["revision"] == before_registry["revision"] + 1, "registry_revision_not_once")
        require(after_project["currentness_sha256"] != before_project["currentness_sha256"], "project_currentness_not_advanced")
        require(after_registry["currentness_sha256"] != before_registry["currentness_sha256"], "registry_currentness_not_advanced")
        for field in set(before_project) | set(after_project):
            if field not in MUTABLE_PROJECT_FIELDS:
                require(before_project.get(field) == after_project.get(field), f"forbidden_project_change:{field}")
        try:
            before_time = datetime.fromisoformat(before_project["updated_at_utc"].replace("Z", "+00:00"))
            after_time = datetime.fromisoformat(after_project["updated_at_utc"].replace("Z", "+00:00"))
            require(before_time.utcoffset() is not None and after_time.utcoffset() is not None and after_time >= before_time, "updated_time_regressed")
        except (TypeError, ValueError):
            failures.append("invalid_updated_timestamp")
    else:
        require(before_project == after_project and before_registry == after_registry, "non_committing_result_mutated_state")
        if result["outcome"] == "no_change":
            require(before_project["lifecycle"] == "listed", "no_change_requires_listed")
    return failures
