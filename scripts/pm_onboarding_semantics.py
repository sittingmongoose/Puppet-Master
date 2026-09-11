"""Static Onboarding phase and Settings Transfer joins, not owner authority.

Native callers must authenticate references and current owner records. Supplied
fixture snapshots exercise value relationships without granting that authority.
"""

from __future__ import annotations

from datetime import datetime
import copy
from typing import Any


def settings_draft_semantic_failures(definition: str, value: Any) -> list[str]:
    if not isinstance(value, dict):
        return []
    kind = value.get("record_type")
    if kind not in {"settings_transfer_draft_preview", "settings_transfer_draft_rebind"}:
        return []
    failures = []
    ids = value["exact_setting_ids"]
    if ids != sorted(ids):
        failures.append("settings_transfer_ids_not_sorted")
    if kind == "settings_transfer_draft_preview":
        if set(ids) != set(value["proposed_values_by_setting_id"]):
            failures.append("settings_transfer_values_not_exact_preview_ids")
        if set(ids) & set(value["explicit_choice_setting_ids"]):
            failures.append("settings_transfer_overwrites_explicit_choices")
        if set(ids) & {row["setting_id"] for row in value["excluded_settings"]}:
            failures.append("settings_transfer_copies_excluded_id")
        if not ids and value["availability"]["state"] == "available":
            failures.append("settings_transfer_empty_preview_claims_eligible")
        if datetime.fromisoformat(value["created_at_utc"].replace("Z", "+00:00")) >= datetime.fromisoformat(value["expires_at_utc"].replace("Z", "+00:00")):
            failures.append("settings_transfer_expiry_not_after_creation")
    elif value["destination_project_id"] == value["source_project_id"]:
        failures.append("settings_transfer_draft_rebound_to_source_project")
    return failures


def settings_draft_join_failures(request, preview, *, resolved_preview_ref, source_revision,
                                 eligible_setting_ids, rebind=None, confirmed_draft=None):
    """Join already schema-valid, resolved owner snapshots; never apply values."""
    failures = []
    if request["source_project_id"] != preview["source_project_id"]:
        failures.append("settings_transfer_source_project_mismatch")
    if request["expected_source_revision"] != preview["source_revision"] or preview["source_revision"] != source_revision:
        failures.append("settings_transfer_source_revision_stale")
    for field in ("destination_draft", "selector_ids", "explicit_choice_setting_ids"):
        if request[field] != preview[field]:
            failures.append("settings_transfer_" + field + "_mismatch")
    if resolved_preview_ref != preview["preview_id"]:
        failures.append("settings_transfer_preview_reference_mismatch")
    permitted = set(eligible_setting_ids) - set(request["explicit_choice_setting_ids"])
    permitted -= {row["setting_id"] for row in preview["excluded_settings"]}
    if set(preview["exact_setting_ids"]) != permitted:
        failures.append("settings_transfer_owner_eligible_set_mismatch")
    if rebind is not None:
        if confirmed_draft != preview["destination_draft"]:
            failures.append("settings_transfer_unconfirmed_or_changed_draft")
        for field in ("destination_draft", "source_project_id", "source_revision", "exact_setting_ids"):
            if rebind[field] != preview[field]:
                failures.append("settings_transfer_rebind_" + field + "_mismatch")
        if rebind["draft_preview_ref"] != resolved_preview_ref or rebind["draft_preview_sha256"] != preview["preview_sha256"]:
            failures.append("settings_transfer_rebind_preview_mismatch")
    return sorted(set(failures))


def project_commit_binding_failures(binding, result, *, resolved_result_ref, request=None):
    """Bind an already schema-valid Project-owned result; no owner work runs."""
    from pm_ui_command_response import owner_result_digest

    failures = []
    if binding["project_action_result_ref"] != resolved_result_ref:
        failures.append("project_commit_result_reference_mismatch")
    if binding["project_action_result_sha256"] != owner_result_digest(result):
        failures.append("project_commit_result_digest_mismatch")
    for source, target in (("command_id", "action_id"), ("command_instance_id", "command_instance_id"),
                           ("project_id", "project_id"), ("project_revision", "project_revision"),
                           ("registry_revision", "resulting_registry_revision"),
                           ("lifecycle", "lifecycle"), ("persistence_disposition", "persistence_disposition")):
        if binding[source] != result[target]:
            failures.append("project_commit_" + source + "_mismatch")
    if result["outcome"] not in {"accepted", "no_change"} or result["error_code"] is not None:
        failures.append("project_commit_owner_result_not_successful")
    if not set(binding["terminal_receipt_refs"]) <= set(result["receipt_refs"]):
        failures.append("project_commit_terminal_receipt_mismatch")
    if resolved_result_ref not in binding["required_owner_result_refs"]:
        failures.append("project_commit_result_not_in_required_owner_set")
    rebind, settings_result = binding["settings_transfer_rebind_ref"], binding["settings_transfer_result_ref"]
    if (rebind is None) != (settings_result is None):
        failures.append("project_commit_settings_result_pair_incomplete")
    if settings_result is not None and settings_result not in binding["required_owner_result_refs"]:
        failures.append("project_commit_settings_result_not_in_required_owner_set")
    if request is not None:
        for source, target in (("command_id", "action_id"), ("command_instance_id", "command_instance_id"), ("idempotency_key", "idempotency_key")):
            if binding[source] != request[target]:
                failures.append("project_commit_request_" + source + "_mismatch")
        if result["return_context"] != request["return_context"]:
            failures.append("project_commit_return_context_mismatch")
        setup = request.get("onboarding_setup_binding", {})
        for field in ("setup_plan_ref", "reviewed_setup_plan_revision", "approved_setup_plan_sha256",
                      "project_draft_ref", "project_draft_revision", "commit_authorization_ref"):
            if binding[field] != setup.get(field):
                failures.append("project_commit_confirmed_" + field + "_mismatch")
        if setup.get("settings_transfer_draft_preview_ref") is not None and settings_result is None:
            failures.append("project_commit_selected_settings_copy_unsettled")
    return sorted(set(failures))


def onboarding_semantic_failures(definition: str, value: Any) -> list[str]:
    """Check schema-valid local values; refs are not authenticated by this check."""
    if not isinstance(value, dict):
        return []
    failures = []

    def state(row):
        if row.get("review_confirmation") == "person_confirmed_reviewed_plan":
            if row["reviewed_setup_plan_revision"] != row["queued_setup_plan_revision"]:
                failures.append("onboarding_reviewed_revision_not_current_draft")
        disposition = row["project_disposition"]
        committed = disposition == "committed"
        binding = row["project_commit_binding"]
        stage = row["stage"]
        if committed:
            for source, target in (("setup_plan_ref", "queued_setup_plan_ref"),
                                   ("reviewed_setup_plan_revision", "reviewed_setup_plan_revision"),
                                   ("approved_setup_plan_sha256", "approved_setup_plan_sha256"),
                                   ("project_draft_ref", "project_draft_ref"),
                                   ("project_draft_revision", "project_draft_revision")):
                if binding[source] != row[target]:
                    failures.append("onboarding_commit_" + source + "_mismatch")
            if "project_id" in row and row["project_id"] != binding["project_id"]:
                failures.append("onboarding_committed_project_identity_mismatch")
        elif disposition != "not_applicable":
            if row.get("project_id") is not None:
                failures.append("onboarding_uncommitted_draft_claims_project_identity")
            if any(row[field] in {"active", "ready", "skipped"}
                   for field in ("provider_phase_status", "free_models_phase_status")):
                failures.append("onboarding_provider_phase_before_project_commit")
        if stage == "ready" and row["path_kind"] == "guided_setup" and disposition not in {"committed", "deferred"}:
            failures.append("onboarding_ready_without_commit_or_explicit_project_defer")
        for phase in ("provider", "free_models"):
            if row[phase + "_phase_status"] == "ready" and not row[phase + "_owner_result_refs"]:
                failures.append("onboarding_" + phase + "_ready_without_owner_result")
        branch = row["active_branch"]
        if branch is not None:
            if branch["return_stage"] != stage:
                failures.append("onboarding_branch_return_stage_mismatch")
            if branch["continuation_generation"] != row["continuation_generation"]:
                failures.append("onboarding_branch_generation_mismatch")
            phase = branch["owner_phase"]
            if phase in {"read_only_preflight", "selected_source_auth"}:
                if stage not in {"first_project", "source_control_setup", "server_storage_client", "remote_access_setup", "review_setup_plan"} or not branch["precommit_authorization_ref"]:
                    failures.append("onboarding_precommit_branch_not_authorized")
                if branch["project_commit_ref"] is not None:
                    failures.append("onboarding_precommit_branch_claims_commit")
            elif phase == "project_commit":
                if stage not in {"review_setup_plan", "automatic_preparation"} or row["review_confirmation"] != "person_confirmed_reviewed_plan":
                    failures.append("onboarding_project_branch_without_review_commit")
            elif phase in {"postcommit_provider", "postcommit_free_models"}:
                expected = "provider_setup" if phase == "postcommit_provider" else "free_models_setup"
                if stage != expected or not committed or branch["project_commit_ref"] != binding["binding_id"]:
                    failures.append("onboarding_provider_branch_without_exact_commit")
            else:
                failures.append("onboarding_active_owner_branch_without_phase")
            if branch["owner_command_id"] != branch["pending_owner_action_id"]:
                failures.append("onboarding_branch_owner_command_mismatch")

    if "queued_setup_plan_ref" in value and "project_disposition" in value:
        state(value)
    if definition == "onboarding_session" and value["setup_draft"] is not None:
        from pm_ui_command_response import owner_result_digest

        draft = value["setup_draft"]
        if (draft["settings_transfer"]["mode"] == "copy_from_project"
                and (value.get("project_commit_binding") or {}).get("command_id") == "cmd.project.open"):
            failures.append("onboarding_settings_copy_cannot_mutate_opened_existing_project")
        for field in ("project_draft_ref", "project_draft_revision"):
            if draft[field] != value[field]:
                failures.append("onboarding_persisted_draft_" + field + "_mismatch")
        if value["review_confirmation"] == "person_confirmed_reviewed_plan" and owner_result_digest(draft) != value["approved_setup_plan_sha256"]:
            failures.append("onboarding_persisted_draft_approved_bytes_mismatch")
        if (draft["journey"] == "connect_existing") != (value["path_kind"] == "connect_existing"):
            failures.append("onboarding_persisted_draft_path_mismatch")
    nested = value.get("continuation_snapshot")
    if isinstance(nested, dict):
        state(nested)
        for field in ("onboarding_session_id", "revision", "continuation_generation", "return_focus_id"):
            if nested[field] != value[field]:
                failures.append("onboarding_result_snapshot_" + field + "_mismatch")
    returned = value.get("return_context")
    if isinstance(returned, dict):
        state(returned)
        for field in ("onboarding_session_id", "stage", "simple_path_selection", "path_kind", "queued_setup_plan_ref",
                      "queued_setup_plan_revision", "reviewed_setup_plan_revision", "approved_setup_plan_sha256",
                      "project_id", "project_draft_ref", "project_draft_revision", "project_disposition",
                      "project_commit_binding", "provider_phase_status", "free_models_phase_status", "active_branch",
                      "continuation_generation"):
            if returned[field] != value[field]:
                failures.append("onboarding_return_" + field + "_mismatch")
        if returned["expected_revision"] != value["revision"]:
            failures.append("onboarding_return_expected_revision_mismatch")
    if definition == "onboarding_action_request":
        action, context, stage = value["action_id"], value["local_context"], value["stage"]
        if action != "ui.onboarding.open_owner_flow":
            if any(context[field] is not None for field in ("owner_phase", "owner_command_id", "precommit_authorization_ref", "project_commit_ref")):
                failures.append("onboarding_local_action_claims_owner_authorization")
            if context["setup_commit_binding"] is not None and not (action == "ui.onboarding.next" and stage == "review_setup_plan"):
                failures.append("onboarding_local_action_claims_setup_commit")
        if context["branch_kind"] == "provider" and stage != "provider_setup":
            failures.append("onboarding_provider_action_before_project_phase")
        if context["branch_kind"] == "free-models" and stage != "free_models_setup":
            failures.append("onboarding_free_models_action_outside_own_phase")
    if definition == "onboarding_action_result":
        if value["production_receipt_ref"] is not None:
            failures.append("onboarding_local_result_claims_production_receipt")
        if value["status"] == "applied" and value["action_id"] == "ui.onboarding.open_owner_flow":
            if nested["active_branch"] is None:
                failures.append("onboarding_owner_flow_missing_active_branch")
            elif nested["active_branch"]["owner_operation_id"] != value["owner_operation_ref"]:
                failures.append("onboarding_owner_operation_mismatch")
    if definition == "onboarding_legacy_migration_receipt":
        if value["source_record_count"] != sum(value[k] for k in ("accepted_record_count", "stale_record_count", "dropped_record_count", "quarantined_record_count")):
            failures.append("onboarding_migration_source_dispositions_not_exact")
        count = value["accepted_record_count"] + value["stale_record_count"]
        if sum(value["mapped_stage_counts"].values()) != count or sum(value["mapped_path_counts"].values()) != count:
            failures.append("onboarding_migration_stage_path_counts_not_exact")
        if value["committed_resume_count"] > count:
            failures.append("onboarding_migration_committed_resume_exceeds_mapped_rows")
        if value["terminal_status"] == "committed" and value["quarantined_record_count"]:
            failures.append("onboarding_migration_committed_hides_quarantine")
    if definition == "automatic_preparation_owner_projection":
        completed, total = value["completed_units"], value["total_units"]
        if completed is not None and total is not None and completed > total:
            failures.append("onboarding_progress_exceeds_measured_total")
    return sorted(set(failures))


def onboarding_precommit_join_failures(request, authorization, owner_request, current, *,
                                        resolved_authorization_ref, resolved_owner_request_ref,
                                        selected_source, now):
    """Join resolved snapshots; the caller must authenticate owner/permission refs.

    No general authentication, Connection.add, or Project command is synthesized.
    The owner request must itself pass its canonical schema and permission gates.
    """
    from pm_ui_command_response import owner_result_digest

    failures = []
    context = request["local_context"]
    if context["precommit_authorization_ref"] != resolved_authorization_ref or authorization["authorization_id"] != resolved_authorization_ref:
        failures.append("onboarding_precommit_authorization_reference_mismatch")
    for field in ("owner_phase", "owner_command_id"):
        if context[field] != authorization[field]:
            failures.append("onboarding_precommit_" + field + "_mismatch")
    for field in ("onboarding_session_id", "continuation_generation"):
        if request[field] != current[field] or authorization[field] != current[field]:
            failures.append("onboarding_precommit_" + field + "_stale")
    if request["expected_revision"] != current["revision"] or authorization["expected_revision"] != current["revision"]:
        failures.append("onboarding_precommit_revision_stale")
    for field in ("project_draft_ref", "project_draft_revision"):
        if authorization[field] != current[field]:
            failures.append("onboarding_precommit_" + field + "_stale")
    if authorization["selected_source_ref"] != selected_source["source_ref"] or context["selection_ref"] != selected_source["source_ref"]:
        failures.append("onboarding_precommit_selected_source_mismatch")
    for field in ("provider_id", "route_id"):
        if authorization["selected_" + field] != selected_source.get(field):
            failures.append("onboarding_precommit_selected_" + field + "_mismatch")
        if authorization["owner_phase"] == "selected_source_auth" and owner_request.get(field) != selected_source.get(field):
            failures.append("onboarding_precommit_owner_" + field + "_mismatch")
    if authorization["owner_request_ref"] != resolved_owner_request_ref or authorization["owner_request_sha256"] != owner_result_digest(owner_request):
        failures.append("onboarding_precommit_owner_request_mismatch")
    if owner_request.get("command_id", owner_request.get("action_id")) != authorization["owner_command_id"]:
        failures.append("onboarding_precommit_owner_command_mismatch")
    for owner_field, fence_field in (("home_server_id", "server_id"), ("execution_host_id", "execution_host_id"),
                                    ("execution_environment_id", "execution_environment_id"), ("initiating_client_id", "initiating_client_id")):
        if owner_field in owner_request and owner_request[owner_field] != authorization[fence_field]:
            failures.append("onboarding_precommit_" + fence_field + "_mismatch")
    if owner_request.get("project_id") is not None or current.get("project_commit_binding") is not None:
        failures.append("onboarding_precommit_not_uncommitted_no_project_context")
    permission_ref = owner_request.get("permission_snapshot_ref", owner_request.get("permission", {}).get("permission_snapshot_ref"))
    if permission_ref != authorization["permission_snapshot_ref"]:
        failures.append("onboarding_precommit_permission_snapshot_mismatch")
    if authorization["owner_command_id"] == "cmd.forge.repository.list":
        scope = owner_request.get("repository_list_scope")
        if not isinstance(scope, dict):
            failures.append("onboarding_precommit_forge_account_list_scope_missing")
        else:
            for field, fence in (("onboarding_session_id", "onboarding_session_id"), ("project_draft_ref", "project_draft_ref"),
                                 ("project_draft_revision", "project_draft_revision"), ("selected_source_ref", "selected_source_ref"),
                                 ("source_provider_id", "selected_provider_id"), ("source_route_id", "selected_route_id"),
                                 ("precommit_authorization_ref", "authorization_id"), ("server_id", "server_id"),
                                 ("execution_host_id", "execution_host_id"), ("execution_environment_id", "execution_environment_id"),
                                 ("initiating_client_id", "initiating_client_id"), ("return_focus_id", "return_focus_id")):
                if scope.get(field) != authorization[fence]:
                    failures.append("onboarding_precommit_forge_" + field + "_mismatch")
            if owner_request.get("capability_snapshot_ref") != authorization["capability_snapshot_ref"]:
                failures.append("onboarding_precommit_forge_capability_snapshot_mismatch")
            if owner_request.get("provider") != selected_source.get("forge_provider"):
                failures.append("onboarding_precommit_forge_provider_mismatch")
            if owner_request.get("account_id") != selected_source.get("account_id"):
                failures.append("onboarding_precommit_forge_account_mismatch")
            for field in ("account_generation", "account_verification_ref", "account_container_ref"):
                if scope.get(field) != selected_source.get(field):
                    failures.append("onboarding_precommit_forge_" + field + "_mismatch")
    if authorization["owner_phase"] == "selected_source_auth":
        if owner_request.get("payload", {}).get("human_confirmation_ref") != authorization["consent_ref"]:
            failures.append("onboarding_precommit_source_consent_mismatch")
        bootstrap = owner_request.get("payload", {}).get("first_time_source_auth")
        if bootstrap is not None:
            for field, fence in (("selected_source_ref", "selected_source_ref"), ("onboarding_session_ref", "onboarding_session_id"),
                                 ("project_draft_ref", "project_draft_ref"), ("project_draft_revision", "project_draft_revision"),
                                 ("source_authorization_ref", "authorization_id"), ("route_capability_snapshot_ref", "capability_snapshot_ref")):
                if bootstrap[field] != authorization[fence]:
                    failures.append("onboarding_source_bootstrap_" + field + "_mismatch")
    if request["return_focus_id"] != authorization["return_focus_id"]:
        failures.append("onboarding_precommit_return_focus_mismatch")
    if datetime.fromisoformat(authorization["expires_at_utc"].replace("Z", "+00:00")) <= now:
        failures.append("onboarding_precommit_authorization_expired")
    return sorted(set(failures))


def onboarding_action_join_failures(current, request, result):
    """Check local request/result causality against the prior session snapshot."""
    failures = []
    for field in ("onboarding_session_id", "continuation_generation"):
        if request[field] != current[field] or result[field] != current[field]:
            failures.append("onboarding_action_" + field + "_mismatch")
    for field in ("action_id", "action_instance_id"):
        if request[field] != result[field]:
            failures.append("onboarding_action_result_" + field + "_mismatch")
    if request["expected_revision"] != current["revision"] or request["stage"] != current["stage"] or result["stage_before"] != current["stage"]:
        failures.append("onboarding_action_current_state_mismatch")
    expected_revision = current["revision"] + int(result["onboarding_session_written"])
    if result["revision"] != expected_revision:
        failures.append("onboarding_action_result_revision_mismatch")
    if result["status"] == "applied":
        after = result["continuation_snapshot"]
        if current["project_disposition"] == "committed" and after is not None:
            if after["project_commit_binding"] != current["project_commit_binding"] or after["project_disposition"] != "committed":
                failures.append("onboarding_navigation_discards_committed_project")
            if after["stage"] not in {"automatic_preparation", "provider_setup", "free_models_setup", "ready"}:
                failures.append("onboarding_navigation_reenters_precommit_draft")
        if request["stage"] == "review_setup_plan" and request["action_id"] == "ui.onboarding.next":
            setup = request["local_context"]["setup_commit_binding"]
            for field, source in (("setup_plan_ref", "queued_setup_plan_ref"), ("reviewed_setup_plan_revision", "queued_setup_plan_revision"),
                                  ("project_draft_ref", "project_draft_ref"), ("project_draft_revision", "project_draft_revision")):
                if setup[field] != current[source]:
                    failures.append("onboarding_confirmed_" + field + "_mismatch")
            if after["approved_setup_plan_sha256"] != setup["approved_setup_plan_sha256"]:
                failures.append("onboarding_confirmed_plan_hash_mismatch")
    return sorted(set(failures))


def onboarding_storage_value_schema(onboarding, project, settings):
    """Deterministic inline bundle of existing owner definitions for one family.

    Registry inline schemas cannot depend on network resolution. Merge the one
    reusable durable-field mixin into the root, then namespace every reachable
    local/foreign definition without changing its validation semantics.
    """
    sources = {"onboarding": onboarding, "project": project, "settings": settings}
    by_uri = {schema["$id"]: name for name, schema in sources.items()}
    root = copy.deepcopy(onboarding["$defs"]["onboarding_session"])
    common = onboarding["$defs"]["onboarding_durable_setup_state_fields"]
    for name, definition in common["properties"].items():
        if name in root["properties"] and root["properties"][name] != definition:
            raise ValueError("onboarding_storage_mixin_property_conflict:" + name)
        root["properties"][name] = copy.deepcopy(definition)
    root["required"] = list(dict.fromkeys(root["required"] + common["required"]))
    root["allOf"] = [rule for rule in root["allOf"]
                     if rule != {"$ref": "#/$defs/onboarding_durable_setup_state_fields"}]
    root["allOf"] += copy.deepcopy(common["allOf"])
    root.pop("unevaluatedProperties", None)
    root["additionalProperties"] = False
    pending, bundled = set(), {}

    def rewrite(value, namespace):
        if isinstance(value, list):
            return [rewrite(child, namespace) for child in value]
        if not isinstance(value, dict):
            return value
        out = {}
        for key, child in value.items():
            if key != "$ref":
                out[key] = rewrite(child, namespace)
                continue
            if child.startswith("#/$defs/"):
                target_namespace, name = namespace, child.removeprefix("#/$defs/")
            else:
                uri, separator, pointer = child.partition("#/$defs/")
                if not separator or uri not in by_uri:
                    raise ValueError("onboarding_storage_unbound_owner_ref:" + child)
                target_namespace, name = by_uri[uri], pointer
            if name not in sources[target_namespace]["$defs"]:
                raise ValueError("onboarding_storage_missing_owner_definition:" + child)
            pending.add((target_namespace, name))
            out[key] = "#/$defs/" + target_namespace + "__" + name
        return out

    root = rewrite(root, "onboarding")
    while pending:
        namespace, name = min(pending)
        pending.remove((namespace, name))
        key = namespace + "__" + name
        if key not in bundled:
            bundled[key] = rewrite(sources[namespace]["$defs"][name], namespace)
    return {"$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": "https://puppetmaster.local/schemas/storage_value/onboarding_state/2.0.0/onboarding_state.schema.json",
            **root, "$defs": dict(sorted(bundled.items()))}
