"""Actual Onboarding v3 choice producer and coordinator-only v2 migration.

All owner resolution, authorization, hashing and schema validation dependencies
are injected. Native callers must authenticate these dependencies. Secondary test
maps never constitute permission or production execution evidence.
"""
from __future__ import annotations
import copy
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Callable, Mapping


NORMAL_DESTINATION_FIELDS = (
    "forge", "forge_provider_variant", "forge_instance_url", "forge_instance_profile",
    "forge_account_action", "forge_account_ref", "repository_owner_scope",
    "repository_container", "repository_project",
)
NORMAL_PROJECT_SELECTION_FIELDS = (
    "project_mode", "project_name", "project_source_ref", "backup_source_ref",
    "project_transport", "backup_transport", "local_location_mode", "local_location",
    "server_mode", "server_ref", "server_connection_mode", "client_mode",
    "storage_mode", "storage_transport", "storage_location",
)


@dataclass(frozen=True)
class ResolvedForgeDestinationState:
    """Current authenticated owner resolution, never a caller-authority carrier.

    Selected normal values are resolution inputs, not provider IDs. Native owner
    resolution must authenticate account verification/generation, exact provider
    hierarchy and host/instance/connection, and bind the reviewed draft and expiry.
    No universal vendor key/name/URL conversion is performed here. In particular,
    a Data Center project key and stable project ref are distinct native roles;
    Azure organization/collection selection and destination project are distinct.
    These scalar facts come from current owner resources, not the output subject.
    """
    selected_account_ref: str
    selected_container: str
    selected_project: str
    approved_draft_sha256: str
    expires_at_utc: str
    provider: str
    provider_variant: str
    normalized_host: str
    instance_profile_ref: str
    connection_ref: str | None
    account_id: str
    account_generation: int
    account_verification_ref: str
    account_container_ref: str
    container_kind: str
    namespace_external_id: str
    parent_container_external_id: str | None
    provider_project_id: str | None
    connection_id: str | None


@dataclass(frozen=True)
class AzureExistingProjectState:
    """Authenticated current Azure hierarchy, resolved from provider resources.

    These independent owner facts are not parsed from URLs/names, copied from a
    request, or authorization carried by serialized UI data. Opaque selection
    refs remain distinct from provider external IDs and the resolved project GUID.
    """
    organization_or_collection_ref: str
    organization_or_collection_external_id: str
    project_ref: str
    project_namespace_external_id: str
    provider_project_id: str


@dataclass(frozen=True)
class CreationProducerOwnerState:
    """Independently authenticated current state; never request/deserialized UI data.

    destination_selection binds exact selected normal values to subject after the
    Forge owner resolves provider hierarchy/variant/host/account. This deliberately
    does not infer vendor normalization from a URL or a guessed variant table.
    approved_draft_sha256 and authorization refs derive from the actual Project/
    Permissions owner, not from computing a digest of whatever caller supplied.
    """
    session_ref: str
    session_revision: int
    continuation_generation: int
    project_request_ref: str
    project_request_sha256: str
    expected_project_action_id: str
    approved_draft_sha256: str
    commit_authorization_ref: str
    consent_ref: str
    project_permission_ref: str
    actor_ref: str
    owner_operation_ref: str
    initiating_client_id: str
    server_id: str
    project_home_server_ref: str
    project_source_ref: str
    project_source_location_ref: str
    project_repository_ref: str | None
    execution_host_id: str
    execution_environment_id: str
    return_context_ref: str
    return_focus_id: str
    invocation_token: str
    now_utc: str
    approval_expires_at_utc: str
    destination_selection: Mapping[str, Any]
    project_selection: Mapping[str, Any]
    subject: Mapping[str, Any]
    option_context: Any
    options_selection_id: str
    azure_existing_project: AzureExistingProjectState | None = None
    resolved_destination: ResolvedForgeDestinationState | None = None


@dataclass(frozen=True)
class MigrationOwnerState:
    """Storage coordinator's independently authenticated source/owner snapshot."""
    source_session_ref: str
    source_session_sha256: str
    source_revision: int
    source_continuation_generation: int
    target_session_ref: str
    migration_id: str
    storage_migration_receipt_ref: str
    migrated_at_utc: str
    owner_chain_state: str  # no_commit | committed | pending | effect_unknown
    historical_owner_chain_ref: str | None
    project_request_ref: str | None
    project_request_sha256: str | None
    owner_operation_ref: str | None
    project_result_ref: str | None


def _utc(value):
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None or parsed.utcoffset() != timezone.utc.utcoffset(parsed):
        raise ValueError("UTC required")
    return parsed


def _read(resolve, validate, owner, definition, ref, errors, code):
    try:
        value = resolve(owner, definition, ref)
        if validate(owner, definition, value):
            errors.append(code + "_schema")
            return None
        return value
    except (KeyError, ValueError, TypeError, OSError):
        errors.append(code + "_unresolved")
        return None


def _result(status, errors=(), *, choices=None, approval=None, subject=None):
    return dict(status=status, errors=sorted(set(errors)), choices=choices,
                approval_binding=approval, subject=subject)


def produce_onboarding_repository_creation_choices(session_ref, *, resolve_record,
        resolve_current_owner_state, validate_record, digest_record, validate_options,
        session_semantic_failures):
    """Produce real Forge choices from an actual approved Session + Project request.

    Does not dispatch or mutate anything. Returns no choices on pending/blocked or
    not-applicable paths. Native caller feeds returned choices/approval/subject to
    the existing Forge owner preview and v2 request path, never a second create.
    """
    errors = []
    session = _read(resolve_record, validate_record, "onboarding", "onboarding_session_v3", session_ref,
                    errors, "producer_session")
    if session is None:
        return _result("blocked", errors)
    errors += list(session_semantic_failures(session))
    if errors:
        return _result("blocked", errors)
    draft = session["setup_draft"]
    if draft is None:
        return _result("not_applicable")
    if session["draft_format_disposition"] != "current_v3":
        return _result("blocked", ["producer_historical_draft_not_admitted"])
    if (draft["online_mode"] != "new" or draft["journey"] == "connect_existing"
            or draft["project_mode"] == "later" or session["project_disposition"] in {"deferred", "not_applicable"}):
        return _result("not_applicable")
    selection = draft["repository_creation_selection"]
    for key in ("path_selection", "source_template_selection", "git_transport_selection", "provider_options_selection"):
        if selection[key]["state"] == "unresolved":
            errors.append("producer_unresolved:" + key)
    if errors:
        return _result("pending", errors)
    azure = selection["azure_team_project_selection"]
    if draft["forge"] == "azure_devops" and azure is None:
        return _result("pending", ["producer_unresolved:azure_team_project_selection"])
    if azure is not None and azure["mode"] == "create":
        # No fake operation/result carrier. The distinct Azure owner contract is
        # still a separate companion; its completion must rebind/review the real
        # existing team project before this repository producer can proceed.
        return _result("pending", ["producer_azure_team_project_owner_operation_required"])
    try:
        state = resolve_current_owner_state(session_ref)
        if not isinstance(state, CreationProducerOwnerState):
            return _result("blocked", ["producer_owner_state_type"])
    except (KeyError, ValueError, TypeError, OSError):
        return _result("blocked", ["producer_current_owner_state_unresolved"])

    def equal(a, b, code):
        if a != b:
            errors.append("producer_" + code)

    equal(session_ref, state.session_ref, "session_reference")
    equal(session["revision"], state.session_revision, "session_revision")
    equal(session["continuation_generation"], state.continuation_generation, "continuation_generation")
    if session["stage"] not in {"review_setup_plan", "automatic_preparation"}:
        errors.append("producer_not_in_project_commit_phase")
    if session["status"] != "active":
        errors.append("producer_session_not_active")
    if session["project_disposition"] != "draft" or session["project_id"] is not None:
        errors.append("producer_requires_uncommitted_project_draft")
    if session["review_confirmation"] != "person_confirmed_reviewed_plan" or not draft["review_confirmed"]:
        errors.append("producer_review_unconfirmed")
    for field in ("project_draft_ref", "project_draft_revision"):
        equal(draft[field], session[field], "draft_" + field)
    equal(session["queued_setup_plan_revision"], session["reviewed_setup_plan_revision"], "reviewed_revision")
    try:
        draft_digest = digest_record(draft)
        equal(draft_digest, session["approved_setup_plan_sha256"], "session_draft_hash")
        equal(draft_digest, state.approved_draft_sha256, "owner_approved_draft_hash")
        if _utc(state.now_utc) >= _utc(state.approval_expires_at_utc):
            errors.append("producer_approval_expired")
    except (ValueError, TypeError, OverflowError):
        return _result("blocked", errors + ["producer_digest_or_time_domain"])
    request = _read(resolve_record, validate_record, "project", "project_action_request", state.project_request_ref,
                    errors, "producer_project_request")
    if request is None:
        return _result("blocked", errors)
    equal(digest_record(request), state.project_request_sha256, "project_request_hash")
    equal(request["action_id"], state.expected_project_action_id, "project_action")
    if request["action_id"] not in {"cmd.project.new_local", "cmd.project.new_github_repo", "cmd.project.add_existing"}:
        errors.append("producer_project_action_not_creation_chain")
    equal(request["source_surface"], "onboarding", "project_source_surface")
    equal(request["actor_ref"], state.actor_ref, "actor")
    equal(request["permission_snapshot_ref"], state.project_permission_ref, "project_permission")
    # PJCT-008: Home Server reference is owner-resolved, never equated to Server ID.
    equal(request["project_home_server_ref"], state.project_home_server_ref, "project_home_server_ref")
    equal(request["source_ref"], state.project_source_ref, "project_source_ref")
    equal(request["source_location_ref"], state.project_source_location_ref, "project_source_location_ref")
    equal(request["repository_ref"], state.project_repository_ref, "project_repository_ref")
    equal(request["display_name"], draft["project_name"], "project_display_name")
    if request["project_id"] is not None or request["expected_project_revision"] is not None or request["expected_project_currentness_sha256"] is not None:
        errors.append("producer_precommit_request_claims_project")
    if draft["project_mode"] == "new":
        if request["action_id"] not in {"cmd.project.new_local", "cmd.project.new_github_repo"}:
            errors.append("producer_project_mode_action")
    elif request["action_id"] != "cmd.project.add_existing":
        errors.append("producer_project_mode_action")
    if request["action_id"] == "cmd.project.new_github_repo" and draft["forge"] != "github":
        errors.append("producer_github_parent_other_provider")
    setup = request.get("onboarding_setup_binding")
    if setup is None:
        return _result("blocked", errors + ["producer_project_setup_binding_missing"])
    for source, target in (("setup_plan_ref", "queued_setup_plan_ref"), ("reviewed_setup_plan_revision", "reviewed_setup_plan_revision"),
                            ("approved_setup_plan_sha256", "approved_setup_plan_sha256"), ("project_draft_ref", "project_draft_ref"),
                            ("project_draft_revision", "project_draft_revision")):
        equal(setup[source], session[target], "project_setup_" + source)
    equal(setup["commit_authorization_ref"], state.commit_authorization_ref, "commit_authorization")
    transfer = draft["settings_transfer"]
    for source, target in (("settings_transfer_draft_preview_ref", "draft_preview_ref"),
                            ("settings_transfer_draft_preview_sha256", "draft_preview_sha256")):
        equal(setup[source], transfer[target], "project_setup_" + source)
    if setup["preflight_validation_ref"] not in draft["preflight_result_refs"]:
        errors.append("producer_preflight_not_in_approved_draft")
    route = request["return_context"]
    equal(route["caller_context_ref"], state.return_context_ref, "project_return_ref")
    equal(route["invocation_token"], state.invocation_token, "invocation_token")
    equal(route["focus_id"], state.return_focus_id, "project_return_focus")
    equal(route["expected_caller_revision"], session["revision"], "project_return_revision")
    equal(route["continuation_generation"], session["continuation_generation"], "project_return_generation")
    returned = _read(resolve_record, validate_record, "onboarding", "onboarding_return_context", state.return_context_ref,
                     errors, "producer_return_context")
    if returned is not None:
        for field, expected in (("return_context_id", state.return_context_ref), ("onboarding_session_id", session["onboarding_session_id"]),
                                ("expected_revision", session["revision"]), ("continuation_generation", session["continuation_generation"]),
                                ("initiating_client_id", state.initiating_client_id), ("server_id", state.server_id),
                                ("execution_host_id", state.execution_host_id), ("execution_environment_id", state.execution_environment_id),
                                ("return_focus_id", state.return_focus_id), ("owner_operation_id", state.owner_operation_ref),
                                ("approved_setup_plan_sha256", draft_digest), ("project_draft_ref", draft["project_draft_ref"]),
                                ("project_draft_revision", draft["project_draft_revision"]), ("stage", session["stage"])):
            equal(returned[field], expected, "return_" + field)
        if session["return_context"] is not None:
            equal(session["return_context"], returned, "session_return_context")
    branch = session["active_branch"]
    if branch is None or branch["owner_phase"] != "project_commit":
        errors.append("producer_current_project_owner_operation_missing")
    else:
        for field, expected in (("owner_operation_id", state.owner_operation_ref), ("initiating_client_id", state.initiating_client_id),
                                ("owner_command_id", request["action_id"]), ("pending_owner_action_id", request["action_id"]),
                                ("branch_kind", "project"), ("target_ref", draft["project_draft_ref"]),
                                ("expected_revision", session["revision"]),
                                ("continuation_generation", session["continuation_generation"])):
            equal(branch[field], expected, "branch_" + field)
    equal(set(state.destination_selection), set(NORMAL_DESTINATION_FIELDS), "destination_selection_roster")
    for field in NORMAL_DESTINATION_FIELDS:
        equal(draft[field], state.destination_selection.get(field), "destination_" + field)
    equal(set(state.project_selection), set(NORMAL_PROJECT_SELECTION_FIELDS), "project_selection_roster")
    for field in NORMAL_PROJECT_SELECTION_FIELDS:
        equal(draft[field], state.project_selection.get(field), "selected_" + field)
    if validate_record("forge", "repository_creation_subject", state.subject):
        errors.append("producer_resolved_subject_schema")
    else:
        equal(state.subject["provider"], draft["forge"], "subject_provider")
        if not draft["forge_account_ref"] or not draft["repository_container"]:
            errors.append("producer_verified_destination_selection_required")
        resolved = state.resolved_destination
        if not isinstance(resolved, ResolvedForgeDestinationState):
            errors.append("producer_destination_resolution_missing")
        else:
            equal(draft["forge_account_ref"], resolved.selected_account_ref, "subject_account")
            equal(draft["repository_container"], resolved.selected_container, "subject_container")
            equal(draft["repository_project"], resolved.selected_project, "subject_project")
            equal(draft_digest, resolved.approved_draft_sha256, "destination_review_hash")
            try:
                if _utc(resolved.expires_at_utc) <= _utc(state.now_utc):
                    errors.append("producer_destination_resolution_expired")
            except (TypeError, ValueError, AttributeError):
                errors.append("producer_destination_resolution_time_invalid")
            mapped_subject = {name: getattr(resolved, name) for name in (
                "provider", "provider_variant", "normalized_host", "instance_profile_ref",
                "connection_ref", "account_id", "account_generation", "account_verification_ref",
                "account_container_ref", "container_kind", "namespace_external_id",
                "parent_container_external_id", "provider_project_id", "connection_id")}
            if validate_record("forge", "repository_creation_subject", mapped_subject):
                errors.append("producer_destination_resolution_schema")
            for field, expected in mapped_subject.items():
                equal(state.subject[field], expected, "resolved_subject_" + field)
        if azure is not None:
            hierarchy = state.azure_existing_project
            if not isinstance(hierarchy, AzureExistingProjectState):
                errors.append("producer_azure_existing_project_unresolved")
            else:
                equal(draft["repository_container"], hierarchy.organization_or_collection_ref,
                      "azure_organization_or_collection")
                equal(draft["repository_project"], hierarchy.project_ref, "azure_selected_project")
                equal(azure["existing_project_ref"], hierarchy.project_ref, "azure_existing_project")
                # The selected project ref and actual Forge container ref may
                # differ. The authenticated destination mapping above binds
                # the actual container; Azure hierarchy binds its native IDs.
                equal(state.subject["parent_container_external_id"], hierarchy.organization_or_collection_external_id,
                      "azure_parent_external_id")
                equal(state.subject["namespace_external_id"], hierarchy.project_namespace_external_id,
                      "azure_project_namespace")
                equal(state.subject["provider_project_id"], hierarchy.provider_project_id, "azure_project_guid")
    if errors:
        return _result("blocked", errors)

    chosen = selection["provider_options_selection"]
    context = state.option_context
    for field in ("provider", "provider_variant", "normalized_host"):
        equal(getattr(context, field), state.subject[field], "option_subject_" + field)
    equal(context.instance_id, state.subject["instance_profile_ref"], "option_subject_instance")
    equal(context.now_utc, _utc(state.now_utc), "option_current_time")
    catalog = _read(resolve_record, validate_record, "forge", "creation_field_catalog", context.catalog_ref,
                    errors, "producer_option_catalog")
    if catalog is None:
        return _result("blocked", errors)
    binding = chosen["catalog_binding"]
    if binding is not None:
        for field, expected in (("catalog_ref", context.catalog_ref), ("catalog_revision", context.catalog_revision),
                                ("catalog_sha256", digest_record(catalog))):
            equal(binding[field], expected, "selected_" + field)
    source_choices = chosen["choices"]
    if len({x["field_id"] for x in source_choices}) != len(source_choices):
        errors.append("producer_duplicate_option_field")
    descriptors = {d["field_id"]: d for d in catalog["fields"]}
    option_fields = []
    for item in source_choices:
        descriptor = descriptors.get(item["field_id"])
        if descriptor is None:
            errors.append("producer_unknown_option_field:" + item["field_id"])
            continue
        equal(item["category"], descriptor["category"], "option_category:" + item["field_id"])
        option_fields.append({key: descriptor[key] for key in ("field_id", "category", "owner_ref", "effect_phase", "capability_ref", "permission_ref")}
                             | {"value": copy.deepcopy(item["value"])})
    options = dict(schema_id="pm.forge.creation_option_selections.v1", selection_id=state.options_selection_id,
                   provider=context.provider, provider_variant=context.provider_variant, normalized_host=context.normalized_host,
                   instance_id=context.instance_id, catalog_ref=context.catalog_ref, catalog_revision=context.catalog_revision,
                   catalog_sha256=digest_record(catalog), fields=option_fields)
    errors += list(validate_options(options, resolve_catalog=lambda ref: resolve_record("forge", "creation_field_catalog", ref),
                                    digest_record=digest_record, context=context))
    path = selection["path_selection"]
    template = selection["source_template_selection"]
    choices = dict(schema_id="pm.forge.repository_creation_choices.v1",
                   repository_name=draft["repository_name"], repository_description=draft["repository_description"],
                   provider_slug_or_path=path["value"] if path["state"] == "explicit" else None,
                   visibility="inherit_project" if draft["forge"] == "azure_devops" else draft["repository_visibility"],
                   existing_or_create="create", source_template_ref=template["ref"] if template["state"] == "selected" else None,
                   initialization_policy=dict(initialize_readme=draft["repository_initialize_readme"], gitignore_selection=draft["repository_gitignore"],
                                              license_selection=draft["repository_license"], preserve_existing_source_history=True),
                   requested_git_transport=selection["git_transport_selection"]["value"], default_branch=draft["repository_default_branch"],
                   provider_options=options)
    if validate_record("forge", "repository_creation_choices", choices):
        errors.append("producer_actual_forge_choices_schema")
    approval = dict(kind="onboarding_project_commit", approval_ref=state.commit_authorization_ref,
                    source_ref=draft["project_draft_ref"], source_revision=draft["project_draft_revision"], source_sha256=draft_digest,
                    consent_ref=state.consent_ref, owner_operation_ref=state.owner_operation_ref,
                    onboarding_session_ref=session_ref, reviewed_plan_ref=setup["setup_plan_ref"], reviewed_plan_sha256=draft_digest,
                    project_setup_binding_ref=state.project_request_ref + "#/onboarding_setup_binding")
    if validate_record("forge", "repository_creation_approval_binding", approval):
        errors.append("producer_actual_forge_approval_schema")
    if errors:
        return _result("blocked", errors)
    return _result("ready", choices=choices, approval=approval, subject=copy.deepcopy(state.subject))


def unresolved_creation_selection():
    return dict(path_selection=dict(state="unresolved", value=None), source_template_selection=dict(state="unresolved", ref=None),
                git_transport_selection=dict(state="unresolved", value=None),
                provider_options_selection=dict(state="unresolved", catalog_binding=None, choices=[]), azure_team_project_selection=None)


def migrate_v2_session(source_ref, *, resolve_record, resolve_migration_owner_state,
        validate_record, digest_record, session_semantic_failures, project_commit_binding_failures):
    """Coordinator-only pure copy-forward. Never writes, dispatches or replays.

    Returns typed target and per-row domain disposition referencing the existing
    sole Storage receipt. Unknown/unsupported owner state blocks, not defaults.
    """
    errors = []
    source = _read(resolve_record, validate_record, "onboarding", "onboarding_session", source_ref,
                   errors, "migration_source")
    if source is None:
        return dict(status="blocked", errors=errors, target=None, disposition=None)
    errors += list(session_semantic_failures(source))
    try:
        state = resolve_migration_owner_state(source_ref)
        if not isinstance(state, MigrationOwnerState):
            raise TypeError("migration state type")
        _utc(state.migrated_at_utc)
    except (KeyError, ValueError, TypeError, OSError):
        return dict(status="blocked", errors=sorted(set(errors + ["migration_current_owner_state_unresolved"])), target=None, disposition=None)
    def equal(a, b, code):
        if a != b:
            errors.append("migration_" + code)
    equal(source_ref, state.source_session_ref, "source_ref")
    equal(digest_record(source), state.source_session_sha256, "source_hash")
    equal(source["revision"], state.source_revision, "source_revision")
    equal(source["continuation_generation"], state.source_continuation_generation, "source_generation")
    if state.owner_chain_state not in {"no_commit", "committed", "pending", "effect_unknown"}:
        errors.append("migration_owner_chain_classification")
    retained = state.owner_chain_state in {"committed", "pending", "effect_unknown"}
    branch = source["active_branch"]
    committed = source["project_disposition"] == "committed"
    pending = branch is not None and branch["owner_phase"] == "project_commit"
    if committed != (state.owner_chain_state == "committed"):
        errors.append("migration_committed_classification_mismatch")
    if pending and state.owner_chain_state == "no_commit":
        errors.append("migration_pending_owner_work_would_be_dropped")
    if branch is not None and not pending and state.owner_chain_state == "no_commit":
        # The coordinator cannot cancel, forget or relabel an unrelated auth,
        # list/copy or other owner operation. Keep its original v2 row intact;
        # after the actual owner settles/reconciles it, resolve a fresh source.
        errors.append("migration_nonproject_owner_work_requires_settlement")
    if state.owner_chain_state in {"pending", "effect_unknown"} and not pending:
        errors.append("migration_pending_owner_reference_missing")
    if retained:
        if state.historical_owner_chain_ref is None or source["setup_draft"] is None:
            errors.append("migration_retained_lineage_missing")
        if source["setup_draft"] is not None:
            equal(digest_record(source["setup_draft"]), source["approved_setup_plan_sha256"], "retained_approved_bytes")
        if source["review_confirmation"] != "person_confirmed_reviewed_plan":
            errors.append("migration_retained_review_missing")
        request = _read(resolve_record, validate_record, "project", "project_action_request", state.project_request_ref,
                        errors, "migration_project_request")
        if request is not None:
            equal(digest_record(request), state.project_request_sha256, "project_request_hash")
            setup = request.get("onboarding_setup_binding", {})
            for left, right in (("setup_plan_ref", "queued_setup_plan_ref"), ("reviewed_setup_plan_revision", "reviewed_setup_plan_revision"),
                                ("approved_setup_plan_sha256", "approved_setup_plan_sha256"), ("project_draft_ref", "project_draft_ref"),
                                ("project_draft_revision", "project_draft_revision")):
                equal(setup.get(left), source[right], "retained_setup_" + left)
            if pending:
                equal(branch["owner_operation_id"], state.owner_operation_ref, "pending_operation")
                equal(branch["owner_command_id"], request["action_id"], "pending_command")
            if committed:
                binding = source["project_commit_binding"]
                result = _read(resolve_record, validate_record, "project", "project_action_result", state.project_result_ref,
                               errors, "migration_project_result")
                if result is not None:
                    errors += list(project_commit_binding_failures(binding, result, resolved_result_ref=state.project_result_ref, request=request))
    if errors:
        return dict(status="blocked", errors=sorted(set(errors)), target=None, disposition=None)
    target = copy.deepcopy(source)
    target.update(schema_id="pm.product_onboarding.session.v3", schema_version="3.0.0",
                  draft_format_disposition="retained_owner_chain_v2" if retained else "current_v3",
                  historical_owner_chain_ref=state.historical_owner_chain_ref if retained else None)
    if retained:
        disposition = "retained_committed" if committed else "retained_reconciling"
        # This changes only the storage envelope; original owner revision,
        # generation, branch and return context are immutable historical bytes.
        # Observation/resumption is still independently owner-revalidated; this
        # record is explicitly excluded from new creation admission above.
    else:
        target.update(revision=source["revision"] + 1,
                      continuation_generation=source["continuation_generation"] + 1,
                      updated_at_utc=state.migrated_at_utc)
        target["return_context"] = None  # Not a new Client approval.
        if target["status"] == "deferred":
            target["status"] = "interrupted"
        target["active_branch"] = None
        target.update(review_confirmation="unconfirmed", reviewed_setup_plan_revision=None, approved_setup_plan_sha256=None,
                      automatic_preparation_currentness_ref=None)
        draft = target["setup_draft"]
        if draft is None:
            disposition = "no_draft"
        else:
            disposition = "new_review_required"
            draft.update(schema_id="pm.product_onboarding.setup_plan.v3", project_draft_revision=draft["project_draft_revision"] + 1,
                         review_confirmed=False)
            needs_create = draft["online_mode"] == "new" and draft["journey"] == "new_or_local" and draft["project_mode"] != "later"
            draft["repository_creation_selection"] = unresolved_creation_selection() if needs_create else None
            target["project_draft_revision"] = draft["project_draft_revision"]
            target["queued_setup_plan_revision"] += 1
            target["stage"] = "review_setup_plan"
            target["status"] = source["status"] if source["status"] in {"skipped", "cancelled"} else "interrupted"
    if validate_record("onboarding", "onboarding_session_v3", target):
        errors.append("migration_target_schema")
    errors += list(session_semantic_failures(target))
    row = dict(schema_id="pm.product_onboarding.draft_format_migration.v1", migration_id=state.migration_id,
               storage_migration_receipt_ref=state.storage_migration_receipt_ref, source_session_ref=source_ref,
               source_session_sha256=digest_record(source), source_schema_id=source["schema_id"], target_session_ref=state.target_session_ref,
               target_session_sha256=digest_record(target), target_schema_id=target["schema_id"],
               source_key_shape="onboarding_state.v3:{onboarding_session_id}", target_key_shape="onboarding_state.v4:{onboarding_session_id}",
               disposition=disposition, historical_owner_chain_ref=state.historical_owner_chain_ref if retained else None,
               retained_draft_sha256=digest_record(source["setup_draft"]) if retained else None,
               owner_work_replayed=False, emits_peer_storage_receipt=False, migrated_at_utc=state.migrated_at_utc)
    if validate_record("onboarding", "onboarding_draft_format_migration", row):
        errors.append("migration_disposition_schema")
    if errors:
        return dict(status="blocked", errors=sorted(set(errors)), target=None, disposition=None)
    return dict(status="migrated", errors=[], target=target, disposition=row)
