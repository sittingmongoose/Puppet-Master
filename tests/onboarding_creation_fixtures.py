"""Deterministic secondary fixtures; maps do not grant native owner authority."""
import copy
import json
import os
import subprocess
from functools import lru_cache
from dataclasses import replace
from datetime import datetime
from pathlib import Path
from jsonschema import Draft202012Validator
from referencing import Registry, Resource

from pm_onboarding_creation import (
    CreationProducerOwnerState, ResolvedForgeDestinationState, MigrationOwnerState, NORMAL_DESTINATION_FIELDS, NORMAL_PROJECT_SELECTION_FIELDS,
    produce_onboarding_repository_creation_choices, migrate_v2_session,
)
from pm_ui_command_response import owner_result_digest
from pm_onboarding_semantics import onboarding_semantic_failures, project_commit_binding_failures
from pm_forge_creation_options import CreationOptionContext, validate_creation_options

PINNED_OWNER_BASE = "0cff5434017d2cdf94aa0362bdf11e4df819c3b5"


@lru_cache(maxsize=8)
def _baseline_record(repository, file):
    raw = subprocess.check_output(["git", "-C", repository, "show", PINNED_OWNER_BASE + ":Plans/" + file], text=True)
    return json.loads(raw)


class FixtureHarness:
    def __init__(self, root):
        self.root = Path(root)
        self.original = self.load("product_onboarding_contracts.schema.json")
        self.schemas = {key: self.load(file + "_contracts.schema.json") for key, file in (
            ("onboarding", "product_onboarding"), ("project", "project_system"),
            ("settings", "settings_system"), ("forge", "forge_integration"))}
        assert "onboarding_session_v3" in self.schemas["onboarding"]["$defs"]
        self.registry = Registry().with_resources((s["$id"], Resource.from_contents(s)) for s in self.schemas.values())
        self.records = {}
        self.owner = None
        self.migration_owner = None

    def load(self, file):
        return json.loads((self.root / "Plans" / file).read_text())

    def baseline(self, file):
        # External projection probes pass the authoritative repository explicitly;
        # normal canonical tests use their actual git worktree, never parent cwd.
        repository = os.environ.get("PM_CANON_BASELINE_ROOT", str(self.root))
        return copy.deepcopy(_baseline_record(repository, file))

    def fixture(self, file, name):
        return copy.deepcopy(next(r["value"] for r in self.load(file)["valid"] if r["name"] == name))

    def validate(self, owner, definition, value):
        s = self.schemas[owner]
        schema = {"$schema": s["$schema"], "$ref": s["$id"] + "#/$defs/" + definition}
        return sorted("/".join(map(str, e.absolute_path)) + ":" + e.message
                      for e in Draft202012Validator(schema, registry=self.registry,
                          format_checker=Draft202012Validator.FORMAT_CHECKER).iter_errors(value))

    def resolve(self, owner, definition, ref):
        return self.records[(owner, definition, ref)]

    def produce(self):
        return produce_onboarding_repository_creation_choices(self.session_ref,
            resolve_record=self.resolve, resolve_current_owner_state=lambda ref: self.owner,
            validate_record=self.validate, digest_record=owner_result_digest,
            validate_options=validate_creation_options,
            session_semantic_failures=lambda value: onboarding_semantic_failures("onboarding_session", value))

    def migrate(self):
        return migrate_v2_session(self.source_ref,
            resolve_record=self.resolve, resolve_migration_owner_state=lambda ref: self.migration_owner,
            validate_record=self.validate, digest_record=owner_result_digest,
            session_semantic_failures=lambda value: onboarding_semantic_failures("onboarding_session", value),
            project_commit_binding_failures=project_commit_binding_failures)

    def refresh_review(self):
        """Fixture-only simulation of a separately reapproved source; not runtime."""
        digest = owner_result_digest(self.session["setup_draft"])
        self.session["approved_setup_plan_sha256"] = digest
        self.request["onboarding_setup_binding"]["approved_setup_plan_sha256"] = digest
        self.returned["approved_setup_plan_sha256"] = digest
        if self.owner.resolved_destination is not None:
            self.owner = replace(self.owner, resolved_destination=replace(self.owner.resolved_destination,
                approved_draft_sha256=digest))
        self.owner = replace(self.owner, approved_draft_sha256=digest,
                             project_request_sha256=owner_result_digest(self.request))


def creation_fixture(root):
    h = FixtureHarness(root)
    h.session_ref = "onboarding:creation-producer:session:1"
    session = h.fixture("product_onboarding_contract_fixtures.json", "valid.session.active_without_branch")
    source = h.fixture("product_onboarding_contract_fixtures.json", "valid.session.deferred_with_active_branch")
    composition = h.fixture("forge_integration_contract_fixtures.json", "creation_v2_actual_composition")
    h.composition = composition
    subject = copy.deepcopy(composition["request"]["repository_creation_intent"]["subject"])
    actual_choices = composition["request"]["repository_creation_intent"]["choices"]
    catalog = copy.deepcopy(composition["resolved_catalog"])
    draft = session["setup_draft"]
    draft.update(schema_id="pm.product_onboarding.setup_plan.v3", project_name="Producer Project",
                 online_mode="new", forge="gitlab", forge_provider_variant="hosted",
                 forge_instance_url="https://gitlab.com", forge_instance_profile=None,
                 forge_account_action="already_connected", forge_account_ref=subject["account_id"],
                 repository_owner_scope="organization", repository_container=subject["account_container_ref"],
                 repository_name=actual_choices["repository_name"], repository_description=actual_choices["repository_description"],
                 repository_visibility="private", repository_initialize_readme=True, repository_gitignore="none",
                 review_confirmed=True, preflight_result_refs=["preflight:creation-producer:1"],
                 repository_creation_selection={
                     "path_selection": {"state": "explicit", "value": actual_choices["provider_slug_or_path"]},
                     "source_template_selection": {"state": "none", "ref": None},
                     "git_transport_selection": {"state": "selected", "value": "https"},
                     "provider_options_selection": {"state": "selected", "catalog_binding": {
                         "catalog_ref": catalog["catalog_id"], "catalog_revision": catalog["catalog_revision"],
                         "catalog_sha256": owner_result_digest(catalog)}, "choices": [
                             {k: copy.deepcopy(f[k]) for k in ("field_id", "category", "value")}
                             for f in actual_choices["provider_options"]["fields"]]},
                     "azure_team_project_selection": None})
    session.update(schema_id="pm.product_onboarding.session.v3", schema_version="3.0.0",
                   onboarding_session_id=h.session_ref, stage="review_setup_plan", revision=7,
                   continuation_generation=3, review_confirmation="person_confirmed_reviewed_plan",
                   reviewed_setup_plan_revision=session["queued_setup_plan_revision"],
                   approved_setup_plan_sha256=owner_result_digest(draft),
                   draft_format_disposition="current_v3", historical_owner_chain_ref=None)
    branch = copy.deepcopy(source["active_branch"])
    branch.update(branch_kind="project", branch_step="commit", selection_ref=None,
                  target_ref=draft["project_draft_ref"], expected_revision=session["revision"],
                  continuation_generation=session["continuation_generation"], owner_operation_id="operation:creation-producer:1",
                  owner_branch_ref="branch:creation-producer:1", return_stage=session["stage"],
                  return_focus_id="onboarding.review_setup_plan.commit", pending_owner_action_id="cmd.project.new_local",
                  owner_phase="project_commit", owner_command_id="cmd.project.new_local", project_commit_ref=None)
    session["active_branch"] = branch
    returned = copy.deepcopy(source["return_context"])
    # All durable shared state comes from the actual session, never a second draft.
    for key in h.original["$defs"]["onboarding_durable_setup_state_fields"]["properties"]:
        returned[key] = copy.deepcopy(session[key])
    returned.update(return_context_id="return:creation-producer:1", onboarding_session_id=h.session_ref,
                    stage=session["stage"], simple_path_selection=session["simple_path_selection"], project_id=None,
                    server_id="server:resolved:1", owner_operation_id=branch["owner_operation_id"],
                    expected_revision=session["revision"], continuation_generation=session["continuation_generation"],
                    return_focus_id=branch["return_focus_id"])
    session["return_context"] = returned
    request = h.fixture("project_system_contract_fixtures.json", "command_project_new_local_from_onboarding")
    request.update(display_name=draft["project_name"], command_instance_id="command:creation-producer:1")
    setup = request["onboarding_setup_binding"]
    setup.update(approved_setup_plan_sha256=session["approved_setup_plan_sha256"],
                 preflight_validation_ref=draft["preflight_result_refs"][0])
    request["return_context"].update(caller_context_ref=returned["return_context_id"],
        expected_caller_revision=session["revision"], continuation_generation=session["continuation_generation"],
        focus_id=returned["return_focus_id"])
    facts = copy.deepcopy(composition["execution_snapshot"]["option_context"])
    facts["now_utc"] = datetime.fromisoformat(facts["now_utc"].replace("Z", "+00:00"))
    for key in ("admitted_capability_refs", "admitted_permission_refs"):
        facts[key] = frozenset(facts[key])
    for key in ("allowed_effects", "admitted_resource_refs"):
        facts[key] = frozenset(tuple(x) for x in facts[key])
    h.owner = CreationProducerOwnerState(
        session_ref=h.session_ref, session_revision=session["revision"], continuation_generation=session["continuation_generation"],
        project_request_ref="request:creation-producer:1", project_request_sha256=owner_result_digest(request),
        expected_project_action_id=request["action_id"], approved_draft_sha256=session["approved_setup_plan_sha256"],
        commit_authorization_ref=setup["commit_authorization_ref"], consent_ref="consent:creation-producer:1",
        project_permission_ref=request["permission_snapshot_ref"], actor_ref=request["actor_ref"],
        owner_operation_ref=branch["owner_operation_id"], initiating_client_id=returned["initiating_client_id"],
        server_id=returned["server_id"], project_home_server_ref=request["project_home_server_ref"],
        project_source_ref=request["source_ref"], project_source_location_ref=request["source_location_ref"],
        project_repository_ref=request["repository_ref"], execution_host_id=returned["execution_host_id"],
        execution_environment_id=returned["execution_environment_id"], return_context_ref=returned["return_context_id"],
        return_focus_id=returned["return_focus_id"], invocation_token=request["return_context"]["invocation_token"],
        now_utc="2026-09-24T12:00:00Z", approval_expires_at_utc="2026-09-25T00:00:00Z",
        destination_selection={k: copy.deepcopy(draft[k]) for k in NORMAL_DESTINATION_FIELDS}, subject=subject,
        project_selection={k: copy.deepcopy(draft[k]) for k in NORMAL_PROJECT_SELECTION_FIELDS},
        option_context=CreationOptionContext(**facts), options_selection_id="selection:creation-producer:1")
    h.session, h.request, h.returned, h.catalog = session, request, returned, catalog
    h.records.update({("onboarding", "onboarding_session_v3", h.session_ref): session,
        ("project", "project_action_request", h.owner.project_request_ref): request,
        ("onboarding", "onboarding_return_context", h.owner.return_context_ref): returned,
        ("forge", "creation_field_catalog", catalog["catalog_id"]): catalog})
    h.owner = replace(h.owner, resolved_destination=ResolvedForgeDestinationState(
        selected_account_ref=draft["forge_account_ref"], selected_container=draft["repository_container"],
        selected_project=draft["repository_project"], approved_draft_sha256=owner_result_digest(draft),
        expires_at_utc=h.owner.approval_expires_at_utc, **copy.deepcopy(subject)))
    return h


def migration_fixture(root, name="valid.session.active_without_branch", classification="no_commit"):
    h = FixtureHarness(root)
    source = h.fixture("product_onboarding_contract_fixtures.json", name)
    h.source_ref = "onboarding:migration-producer:source:1"
    request = h.fixture("project_system_contract_fixtures.json", "command_project_new_local_from_onboarding")
    request_ref, result_ref = None, None
    if classification == "committed":
        binding = source["project_commit_binding"]
        result = h.fixture("project_system_contract_fixtures.json", "project_setup_commit_requires_actual_listed_result")
        request.update(action_id=binding["command_id"], command_instance_id=binding["command_instance_id"],
                       idempotency_key=binding["idempotency_key"], return_context=copy.deepcopy(result["return_context"]))
        for key in ("setup_plan_ref", "reviewed_setup_plan_revision", "approved_setup_plan_sha256", "project_draft_ref",
                    "project_draft_revision", "commit_authorization_ref"):
            request["onboarding_setup_binding"][key] = binding[key]
        request_ref, result_ref = "request:migration-producer:committed:1", binding["project_action_result_ref"]
        h.records[("project", "project_action_result", result_ref)] = result
    h.source, h.request = source, request
    h.records[("onboarding", "onboarding_session", h.source_ref)] = source
    if request_ref:
        h.records[("project", "project_action_request", request_ref)] = request
    h.migration_owner = MigrationOwnerState(
        source_session_ref=h.source_ref, source_session_sha256=owner_result_digest(source), source_revision=source["revision"],
        source_continuation_generation=source["continuation_generation"], target_session_ref="onboarding:migration-producer:target:1",
        migration_id="migration:onboarding-format:1", storage_migration_receipt_ref="storage-migration:coordinator:1",
        migrated_at_utc="2026-09-24T12:00:00Z", owner_chain_state=classification,
        historical_owner_chain_ref="lineage:project-owner:1" if classification != "no_commit" else None,
        project_request_ref=request_ref, project_request_sha256=owner_result_digest(request) if request_ref else None,
        owner_operation_ref=(source["active_branch"] or {}).get("owner_operation_id"), project_result_ref=result_ref)
    return h



def azure_existing_creation_fixture(root, variant="azure_devops_services"):
    from pm_onboarding_creation import AzureExistingProjectState
    h = creation_fixture(root)
    genuine = h.fixture("product_onboarding_contract_fixtures.json", "valid.setup_plan.git_with_azure_project_visibility")
    draft = h.session["setup_draft"]
    for key in NORMAL_DESTINATION_FIELDS:
        draft[key] = copy.deepcopy(genuine[key])
    draft.update(repository_visibility=None, repository_ref="")
    if variant == "azure_devops_server":
        draft.update(forge_provider_variant="self_managed", forge_instance_url="https://ado.example.test/collection")
    selection = draft["repository_creation_selection"]
    selection.update(provider_options_selection={"state": "none", "catalog_binding": None, "choices": []},
        azure_team_project_selection={"mode": "existing", "existing_project_ref": genuine["repository_project"],
            "project_name": None, "visibility": None, "process_template_ref": None, "version_control": "git"})
    host = "dev.azure.com" if variant == "azure_devops_services" else "ado.example.test"
    hierarchy = AzureExistingProjectState(
        organization_or_collection_ref=genuine["repository_container"],
        organization_or_collection_external_id="azure-organization-native:example",
        project_ref=genuine["repository_project"],
        project_namespace_external_id="azure-project-native:example",
        provider_project_id="aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee")
    subject = copy.deepcopy(h.owner.subject)
    subject.update(provider="azure_devops", provider_variant=variant, normalized_host=host,
        account_id=genuine["forge_account_ref"], account_container_ref="resolved-project-container:azure:1", container_kind="project",
        namespace_external_id=hierarchy.project_namespace_external_id,
        parent_container_external_id=hierarchy.organization_or_collection_external_id,
        provider_project_id=hierarchy.provider_project_id)
    catalog = h.catalog
    catalog.update(provider="azure_devops", provider_variant=variant, normalized_host=host,
                   category_inventory=["existing_team_project", "inherited_project_visibility"])
    descriptor = copy.deepcopy(catalog["fields"][0])
    catalog["fields"] = [{**copy.deepcopy(descriptor), "field_id": "fixture-azure-" + category,
        "category": category, "supported": False, "required_selection": False}
        for category in catalog["category_inventory"]]
    # Actual descriptors preserve complete source-category coverage. No optional
    # effect is requested here, and fixture unsupported metadata grants no effect.
    context = replace(h.owner.option_context, provider="azure_devops", provider_variant=variant, normalized_host=host)
    h.owner = replace(h.owner, subject=subject, option_context=context, azure_existing_project=hierarchy,
                      destination_selection={k: copy.deepcopy(draft[k]) for k in NORMAL_DESTINATION_FIELDS})
    h.owner = replace(h.owner, resolved_destination=ResolvedForgeDestinationState(
        selected_account_ref=draft["forge_account_ref"], selected_container=draft["repository_container"],
        selected_project=draft["repository_project"], approved_draft_sha256=owner_result_digest(draft),
        expires_at_utc=h.owner.approval_expires_at_utc, **copy.deepcopy(subject)))
    h.refresh_review()
    return h


def provider_identity_creation_fixture(root, provider):
    """Fixture-native resolved identities, not a vendor-normalization table.

    Each row is one admitted owner result with provider-appropriate hierarchy;
    production must obtain such facts from the actual current provider owner.
    """
    from pm_forge_creation_options import PROVIDER_CATEGORIES
    if provider == "azure_devops":
        h = azure_existing_creation_fixture(root)
        h.session["setup_draft"]["forge_account_ref"] = "account-selection:azure:1"
        subject = {**h.owner.subject, "account_id": "azure-principal-native:1"}
    else:
        h = creation_fixture(root)
        # Normal UI variant and selected opaque ref are intentionally not the
        # native Forge variant or native key/ID. No values are derived by parsing.
        variants = {
            "github": ("hosted", "github_cloud", "github.com", "organization", "org-selection:github:1", "github-org-native:245", None, None, ""),
            "gitlab": ("hosted", "gitlab_com", "gitlab.com", "group", "group-selection:gitlab:1", "9385", None, None, ""),
            "bitbucket_cloud": ("cloud", "bitbucket_cloud", "bitbucket.org", "workspace", "workspace-selection:bb:1", "{11111111-2222-4333-8444-555555555555}", None, "cloud-project-native:87", "optional-project-selection:bb:87"),
            "bitbucket_data_center": ("data_center", "bitbucket_data_center", "bbdc.example.test", "project", "project-selection:bbdc:1", "ENG", None, "73", ""),
            "forgejo": ("forgejo_self_managed", "forgejo_self_managed", "forgejo.example.test", "organization", "organization-selection:forgejo:1", "119", None, None, ""),
            "gitea": ("gitea_self_managed", "gitea_self_managed", "gitea.example.test", "organization", "organization-selection:gitea:1", "246", None, None, ""),
            "cursor_origin": ("preview", "preview", "origin.cursor.com", "organization", "team-selection:origin:1", "origin-team-native:9", None, None, ""),
        }
        ui_variant, native_variant, host, kind, selected_container, namespace, parent, project, selected_project = variants[provider]
        draft = h.session["setup_draft"]
        draft.update(forge=provider, forge_provider_variant=ui_variant, forge_instance_url="https://" + host,
            forge_account_ref="account-selection:" + provider + ":1", repository_container=selected_container,
            repository_project=selected_project, forge_instance_profile=None, repository_visibility="private")
        if provider in ("forgejo", "gitea"):
            source_name = ("valid.setup_plan.jujutsu_with_forgejo_api_disabled_git_ready_external_automation"
                if provider == "forgejo" else "valid.setup_plan.git_with_gitea_registered_oauth_and_distinct_instance")
            genuine = h.fixture("product_onboarding_contract_fixtures.json", source_name)
            draft["forge_instance_profile"] = copy.deepcopy(genuine["forge_instance_profile"])
            draft["forge_instance_url"] = genuine["forge_instance_url"]
            draft["forge_instance_profile"]["api_state_ref"] = "api-state:" + provider + ":team:available"
        draft["repository_creation_selection"].update(provider_options_selection={"state": "none", "catalog_binding": None, "choices": []}, azure_team_project_selection=None)
        subject = {**h.owner.subject, "provider": provider, "provider_variant": native_variant,
            "normalized_host": host, "account_id": "provider-account-native:" + provider + ":1",
            "account_container_ref": "resolved-container:" + provider + ":1", "container_kind": kind,
            "namespace_external_id": namespace, "parent_container_external_id": parent, "provider_project_id": project}
        descriptor = copy.deepcopy(h.catalog["fields"][0])
        h.catalog.update(provider=provider, provider_variant=native_variant, normalized_host=host,
            category_inventory=list(PROVIDER_CATEGORIES[provider]), fields=[{
                **copy.deepcopy(descriptor), "field_id": "fixture-" + provider + "-" + category,
                "category": category, "supported": False, "required_selection": False}
                for category in PROVIDER_CATEGORIES[provider]])
        h.owner = replace(h.owner, option_context=replace(h.owner.option_context,
            provider=provider, provider_variant=native_variant, normalized_host=host))
    draft = h.session["setup_draft"]
    h.owner = replace(h.owner, subject=subject,
        destination_selection={k: copy.deepcopy(draft[k]) for k in NORMAL_DESTINATION_FIELDS},
        resolved_destination=ResolvedForgeDestinationState(
            selected_account_ref=draft["forge_account_ref"], selected_container=draft["repository_container"],
            selected_project=draft["repository_project"], approved_draft_sha256=owner_result_digest(draft),
            expires_at_utc=h.owner.approval_expires_at_utc, **copy.deepcopy(subject)))
    h.refresh_review()
    return h
