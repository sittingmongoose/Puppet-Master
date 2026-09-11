"""Read-only Project/GitHub handoff oracle. Resolved fixture snapshots are not authority.

This module never creates a repository, authorizes an actor, commits a Project,
resolves credentials, or proves native persistence. Runtime adapters must supply
authenticated owner receipts/readback for the same relationships checked here.
"""

from __future__ import annotations

from typing import Any

COMMAND = "cmd.project.new_github_repo"
SCHEMA = "Plans/project_system_contracts.schema.json"


def request_failures(request: dict[str, Any]) -> list[str]:
    import pm_ui_command_response as response

    if response.structural_failures(SCHEMA, request, "#/$defs/project_action_request"):
        return ["forge_request_schema"]
    failures = []
    if request["action_id"] != COMMAND:
        failures.append("forge_command")
    if any(request[field] is None for field in ("permission_snapshot_ref", "filesafe_evidence_ref")):
        failures.append("forge_missing_owner_gates")
    if any(request[field] is not None for field in ("project_id", "expected_project_revision", "expected_project_currentness_sha256")):
        failures.append("forge_premature_project")
    return failures


def intake_failures(request, snapshot):
    """snapshot is a retained, resolved owner intake, not an event payload."""
    import pm_ui_command_response as response

    failures = request_failures(request)
    if failures:
        return failures
    if not isinstance(snapshot, dict):
        return ["forge_missing_owner_snapshot"]
    if snapshot.get("request") != request or snapshot.get("request_sha256") != response.owner_result_digest(request):
        failures.append("forge_request_binding")
    for field in ("native_handler_available", "permission_allowed", "filesafe_allowed", "remote_side_effect_approved", "account_authorized", "intake_committed", "registry_current"):
        if snapshot.get(field) is not True:
            failures.append("forge_gate:" + field)
    if snapshot.get("account_realm") != "github_api" or not snapshot.get("account_ref"):
        failures.append("forge_account_realm")
    for field in ("account_ref", "admission_receipt_ref"):
        if response.structural_failures(SCHEMA, snapshot.get(field), "#/$defs/safe_ref"):
            failures.append("forge_intake_ref:" + field)
    for field in ("operation_id", "server_id"):
        if response.structural_failures(response.OUTCOME_SCHEMA, snapshot.get(field), "#/$defs/Id"):
            failures.append("forge_intake_identity:" + field)
    if not snapshot.get("operation_id") or not snapshot.get("admission_receipt_ref") or not snapshot.get("server_id"):
        failures.append("forge_intake_identity")
    if snapshot.get("resolved_home_server_ref") != request["project_home_server_ref"]:
        failures.append("forge_home_server_resolution")
    if snapshot.get("before_registry") != {"revision": request["expected_registry_revision"], "currentness_sha256": request["expected_registry_currentness_sha256"]}:
        failures.append("forge_registry_fence")
    # PJCT-007 remains the owner of confirmed-draft and Settings-copy semantics.
    if request["source_surface"] == "onboarding" and snapshot.get("verified_onboarding_setup_binding") != request["onboarding_setup_binding"]:
        failures.append("forge_onboarding_commit_binding")
    return failures


def result_failures(request, result, snapshot):
    import pm_ui_command_response as response

    failures = request_failures(request)
    if response.structural_failures(SCHEMA, result, "#/$defs/project_action_result"):
        return failures + ["forge_result_schema"]
    if failures:
        return failures
    if any(request[field] != result[field] for field in ("action_id", "command_instance_id", "return_context")):
        failures.append("forge_result_request_join")
    if not isinstance(snapshot, dict) or snapshot.get("settled_result") != result:
        return failures + ["forge_settlement_binding"]
    if snapshot.get("request") != request or snapshot.get("request_sha256") != response.owner_result_digest(request):
        failures.append("forge_request_binding")
    if result["replayed"]:
        original = snapshot.get("original_result")
        if not isinstance(original, dict) or original.get("replayed") is not False or original.get("outcome") != "accepted":
            failures.append("forge_missing_original_result")
        elif {**original, "replayed": True} != result:
            failures.append("forge_replay_changed_result")
        if snapshot.get("original_request") != request or type(snapshot.get("additional_effects")) is not int or snapshot["additional_effects"] != 0:
            failures.append("forge_replay_changed_binding_or_effects")
    if result["outcome"] == "accepted":
        failures += intake_failures(request, snapshot)
        project = snapshot.get("project")
        if response.structural_failures(SCHEMA, project, "#/$defs/project_record"):
            return failures + ["forge_project_readback_schema"]
        if result["persistence_disposition"] != "persisted" or result["lifecycle"] != "listed" or result["error_code"] is not None:
            failures.append("forge_not_committed_success")
        for field in ("project_id", "lifecycle"):
            if result[field] != project[field]:
                failures.append("forge_project_" + field)
        if result["project_revision"] != project["revision"] or result["project_currentness_sha256"] != project["currentness_sha256"]:
            failures.append("forge_project_fence")
        if project["registration_kind"] != "forge_created" or project["display_name"] != request["display_name"]:
            failures.append("forge_project_metadata")
        if project["project_home_server_ref"] != request["project_home_server_ref"] or request["source_location_ref"] not in project["source_location_refs"] or request["repository_ref"] not in project["repository_refs"]:
            failures.append("forge_project_source_binding")
        if snapshot.get("repository_ref") != request["repository_ref"] or snapshot.get("source_ref") != request["source_ref"]:
            failures.append("forge_repository_intent_binding")
        for field in ("repository_created_verified", "local_source_ready", "project_commit_verified", "readback_verified", "new_project_identity_verified"):
            if snapshot.get(field) is not True:
                failures.append("forge_gate:" + field)
        receipts = [snapshot.get(field) for field in ("repository_receipt_ref", "registration_receipt_ref", "readback_receipt_ref")]
        if any(not item or item not in result["receipt_refs"] for item in receipts) or len(set(receipts)) != 3:
            failures.append("forge_settlement_receipts")
        registry = {"revision": result["resulting_registry_revision"], "currentness_sha256": result["resulting_registry_currentness_sha256"]}
        if snapshot.get("after_registry") != registry or registry["revision"] != request["expected_registry_revision"] + 1 or registry["currentness_sha256"] == request["expected_registry_currentness_sha256"]:
            failures.append("forge_registry_commit")
    elif result["outcome"] in {"rejected", "cancelled"}:
        if any(result[field] is not None for field in ("project_id", "project_revision", "project_currentness_sha256", "lifecycle")) or snapshot.get("project") is not None:
            failures.append("forge_half_listed_project")
        if result["persistence_disposition"] not in {"not_attempted", "rolled_back"} or result["error_code"] is None:
            failures.append("forge_false_failure_disposition")
        if snapshot.get("registry_unchanged") is not True or snapshot.get("external_effects_settled") is not True:
            failures.append("forge_unresolved_effects_require_recovery")
        registry = {"revision": result["resulting_registry_revision"], "currentness_sha256": result["resulting_registry_currentness_sha256"]}
        if snapshot.get("before_registry") != registry or snapshot.get("after_registry") != registry:
            failures.append("forge_noncommit_registry_mutation")
    else:
        # A creation retry returns the original accepted result with replayed=true;
        # an unrelated existing repo is not a successful no-change creation.
        failures.append("forge_no_change_is_not_creation")
    return sorted(set(failures))


def response_failures(response_record, outcome, result, request, snapshot):
    import pm_ui_command_response as response

    failures = result_failures(request, result, snapshot)
    if failures:
        return failures
    if response_record["command_id"] != COMMAND or outcome["command_id"] != COMMAND:
        failures.append("forge_response_command")
    identity = outcome["identity"]
    if identity["scope_kind"] != "application" or any(identity.get(field) is not None for field in ("project_id", "project_home_server_id", "named_plan_id")):
        failures.append("forge_creation_operation_scope")
    if identity["server_id"] != snapshot.get("server_id") or identity["operation_id"] != snapshot.get("operation_id"):
        failures.append("forge_operation_identity")
    if outcome["payload_sha256"] != response.owner_result_digest(request) or outcome["idempotency_key"] != request["idempotency_key"]:
        failures.append("forge_outcome_request_binding")
    expected = {"accepted": ("succeeded", "succeeded"), "rejected": ("rejected", None), "cancelled": ("cancelled", "cancelled")}[result["outcome"]]
    if (outcome["outcome"], response_record["result_status"]) != expected:
        failures.append("forge_response_outcome")
    if outcome["result_receipt_ref"] not in result["receipt_refs"] or (result["outcome"] == "accepted" and outcome["result_receipt_ref"] != snapshot["registration_receipt_ref"]):
        failures.append("forge_response_receipt")
    return sorted(set(failures))
