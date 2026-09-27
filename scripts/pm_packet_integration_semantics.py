#!/usr/bin/env python3
"""Computed nested-record semantics for the packet-integration completion wave.

Covers the Project recovery/resume round trip, the Forge CI/delete request /
result / availability joins, and the Commands & Shortcuts linked-record checks.
Every rule compares actual record fields; client-carriable attestation booleans
(``join_checks``) are never read and grant no authority.

Static contract checks only. Nothing here proves a native handler, dispatcher,
filesystem write, permission enforcement, provider behavior, or readiness.
"""

from __future__ import annotations

import json

from pm_ui_command_response import owner_result_digest
from pm_forge_packet_semantics import forge_packet_semantic_failures
from typing import Any


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def canonical_result_digest(record: Any) -> str:
    """Existing CV-333 RFC 8785 oracle; its numeric fixture profile is integer-only."""
    return owner_result_digest(record)


# ---------------------------------------------------------------------------
# Project System: creation_recovery_resume_round_trip
# ---------------------------------------------------------------------------

PROJECT_SCHEMA_REL = "Plans/project_system_contracts.schema.json"
PROJECT_ROUND_TRIP_DEF = "creation_recovery_resume_round_trip"
PROJECT_ROUND_TRIP_SCHEMA_ID = "pm.project.creation_recovery_resume_round_trip.v1"

# The seventeen codes in the owner schema's expected_semantic_outcome enum.
PROJECT_OWNER_FAILURE_CODES = frozenset({
    "resume_original_command_mismatch",
    "resume_original_instance_mismatch",
    "resume_original_idempotency_mismatch",
    "resume_original_operation_mismatch",
    "resume_reviewed_draft_mismatch",
    "resume_forge_result_ref_mismatch",
    "resume_forge_receipt_ref_mismatch",
    "resume_repository_binding_mismatch",
    "resume_composition_revision_stale",
    "resume_composition_hash_mismatch",
    "resume_settled_effects_mismatch",
    "resume_remaining_effects_mismatch",
    "resume_settled_remaining_overlap",
    "resume_remote_effect_not_verified",
    "resume_original_result_identity_mismatch",
    "resume_original_result_not_rejected_terminal",
    "resume_concurrent_active_attempt",
})

# Second-review additions in the owner enum (19 codes): recovery-key
# equality and the canonical original-result digest join. A self-claim that
# matches only one of instance/key is the existing concurrent-attempt
# failure per the owner x-invariant. The two *_unresolved codes are emitted
# only when schema-required retained fields are absent (schema drift),
# reporting the precise missing field instead of a false proof.
PROJECT_SECOND_REVIEW_CODES = frozenset({
    "resume_recovery_ref_mismatch",
    "resume_original_result_digest_mismatch",
    "resume_original_result_ref_unresolved",
    "resume_original_result_digest_unresolved",
})

PROJECT_ROUND_TRIP_COMPARISON_CODE = "project_round_trip_expected_outcome_mismatch"


def project_round_trip_computed_failures(value: Any) -> list[str]:
    """Recompute round-trip failures from actual nested fields.

    Never reads ``join_checks``. Total: missing or mistyped fields fail
    closed with the code of the join they break.
    """

    bundle = _as_dict(value)
    retained = _as_dict(bundle.get("retained_context"))
    candidate = _as_dict(bundle.get("candidate_request"))
    binding = _as_dict(candidate.get("creation_recovery_resume_binding"))
    original = _as_dict(bundle.get("original_terminal_result"))

    failures: set[str] = set()

    if binding.get("recovery_ref") != retained.get("recovery_id"):
        failures.add("resume_recovery_ref_mismatch")
    if binding.get("original_command_id") != retained.get("original_command_id"):
        failures.add("resume_original_command_mismatch")
    if binding.get("original_command_instance_id") != retained.get("original_command_instance_id"):
        failures.add("resume_original_instance_mismatch")
    if binding.get("original_idempotency_key") != retained.get("original_idempotency_key"):
        failures.add("resume_original_idempotency_mismatch")
    if binding.get("original_operation_ref") != retained.get("original_operation_ref"):
        failures.add("resume_original_operation_mismatch")
    if binding.get("reviewed_setup_binding") != retained.get("reviewed_setup_binding"):
        failures.add("resume_reviewed_draft_mismatch")
    if binding.get("forge_create_result_ref") != retained.get("forge_create_result_ref"):
        failures.add("resume_forge_result_ref_mismatch")
    if binding.get("forge_create_receipt_ref") != retained.get("forge_create_receipt_ref"):
        failures.add("resume_forge_receipt_ref_mismatch")
    if binding.get("repository_binding") != retained.get("repository_binding"):
        failures.add("resume_repository_binding_mismatch")
    if binding.get("recovery_composition_revision") != retained.get("composition_revision"):
        failures.add("resume_composition_revision_stale")
    if binding.get("recovery_composition_sha256") != retained.get("composition_sha256"):
        failures.add("resume_composition_hash_mismatch")

    settled_names = binding.get("settled_effect_names")
    settled_effects = retained.get("settled_effects")
    if (
        not isinstance(settled_names, list)
        or not isinstance(settled_effects, dict)
        or set(settled_names) != set(settled_effects)
    ):
        failures.add("resume_settled_effects_mismatch")

    binding_remaining = binding.get("remaining_effects")
    retained_remaining = retained.get("remaining_effects")
    if (
        not isinstance(binding_remaining, list)
        or not isinstance(retained_remaining, list)
        or set(binding_remaining) != set(retained_remaining)
    ):
        failures.add("resume_remaining_effects_mismatch")

    if (
        isinstance(settled_names, list)
        and isinstance(binding_remaining, list)
        and set(settled_names) & set(binding_remaining)
    ):
        failures.add("resume_settled_remaining_overlap")

    if retained.get("remote_effect_state") != "verified_created":
        failures.add("resume_remote_effect_not_verified")

    if (
        original.get("action_id") != retained.get("original_command_id")
        or original.get("command_instance_id") != retained.get("original_command_instance_id")
    ):
        failures.add("resume_original_result_identity_mismatch")
    if original.get("outcome") != "rejected" or original.get("project_id") is not None:
        failures.add("resume_original_result_not_rejected_terminal")

    claim = retained.get("active_resume_claim")
    if claim is not None:
        # Both attempt fields must match: a self-claim matching only one of
        # instance/key is a concurrent active attempt per owner x-invariant.
        if not isinstance(claim, dict):
            failures.add("resume_concurrent_active_attempt")
        elif (
            claim.get("attempt_command_instance_id") != candidate.get("command_instance_id")
            or claim.get("attempt_idempotency_key") != candidate.get("idempotency_key")
        ):
            failures.add("resume_concurrent_active_attempt")

    retained_ref = retained.get("original_terminal_result_ref")
    retained_sha = retained.get("original_terminal_result_sha256")
    if not isinstance(retained_ref, str) or not retained_ref:
        failures.add("resume_original_result_ref_unresolved")
    elif not isinstance(retained_sha, str) or not retained_sha:
        failures.add("resume_original_result_digest_unresolved")
    elif canonical_result_digest(original) != retained_sha:
        failures.add("resume_original_result_digest_mismatch")

    return sorted(failures)


def project_round_trip_comparison_failures(value: Any) -> list[str]:
    """Compare recomputed failures against the bundle's expected outcome.

    Round trips live in ``valid[]`` for structural validity but may express
    semantic rejection, so acceptance is ``computed == expected``, never
    ``computed is empty``.
    """

    bundle = _as_dict(value)
    expected = _as_dict(bundle.get("expected_semantic_outcome"))
    computed = project_round_trip_computed_failures(bundle)
    expected_failures = expected.get("semantic_failures")
    if (
        not isinstance(expected_failures, list)
        or sorted(expected_failures) != computed
        or expected.get("accepted") != (not computed)
    ):
        return [PROJECT_ROUND_TRIP_COMPARISON_CODE]
    return []


# ---------------------------------------------------------------------------
# Forge Integration: per-record joins (main pack and sibling packs)
# ---------------------------------------------------------------------------

FORGE_SCHEMA_REL = "Plans/forge_integration_contracts.schema.json"
FORGE_MAIN_FIXTURE_REL = "Plans/forge_integration_contract_fixtures.json"

_FORGE_CI_COMMANDS = frozenset({
    "cmd.forge.repository.delete",
    "cmd.forge.pipeline.artifact.download",
    "cmd.forge.pipeline.secret.set",
    "cmd.forge.pipeline.secret.remove",
    "cmd.forge.pipeline.variable.set",
    "cmd.forge.pipeline.variable.remove",
})

# Narrow tripwire, not a secret detector: obvious secret-bearing shapes that
# must never appear in a plain variable value. Anything subtler is out of
# static scope and stays a native/owner obligation.
_FORGE_SECRET_LIKE_MARKERS = (
    "BEGIN PRIVATE KEY",
    "BEGIN RSA PRIVATE KEY",
    "BEGIN OPENSSH PRIVATE KEY",
    "BEGIN PGP PRIVATE",
    "ghp_",
    "gho_",
    "AKIA",
    "xoxb-",
    "xoxp-",
    "sk-live-",
    "sk-ant-",
)


def _forge_request_failures(value: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    currentness = _as_dict(value.get("currentness"))
    if value.get("expected_binding_generation") != currentness.get("binding_generation"):
        failures.append("forge_binding_generation_stale")

    confirmation = value.get("confirmation")
    if isinstance(confirmation, dict):
        permission = _as_dict(value.get("permission"))
        if permission.get("target_binding_sha256") != confirmation.get("target_binding_sha256"):
            failures.append("forge_confirmation_target_mismatch")

    command_id = value.get("command_id")
    target = _as_dict(value.get("target"))
    target_kind = target.get("target_kind")

    if command_id == "cmd.forge.repository.delete":
        if not target.get("verified_create_result_ref") or not target.get("verified_create_receipt_ref"):
            failures.append("forge_delete_missing_verified_create")

    if command_id == "cmd.forge.pipeline.artifact.download" or target_kind == "pipeline_artifact":
        if (
            not target.get("pipeline_id")
            or not target.get("automation_run_id")
            or not target.get("remote_artifact_record_ref")
            or not target.get("pipeline_artifact_id")
            or not target.get("expected_digest")
        ):
            failures.append("forge_artifact_run_identity_incomplete")
        disposition = target.get("artifact_disposition")
        if disposition == "download":
            if not target.get("download_destination_ref") or target.get("artifact_import_handoff_ref") is not None:
                failures.append("forge_artifact_disposition_mismatch")
        elif disposition == "import":
            if not target.get("artifact_import_handoff_ref") or target.get("download_destination_ref") is not None:
                failures.append("forge_artifact_disposition_mismatch")

    if target_kind in {"hosted_secret", "hosted_variable"}:
        if not target.get("hosted_setting_scope_ref"):
            failures.append("forge_secret_scope_missing")

    if command_id == "cmd.forge.pipeline.secret.set":
        if not target.get("secret_broker_ref"):
            failures.append("forge_secret_broker_missing")
    if command_id in {"cmd.forge.pipeline.secret.remove", "cmd.forge.pipeline.variable.set",
                      "cmd.forge.pipeline.variable.remove"}:
        if target.get("secret_broker_ref") is not None:
            failures.append("forge_secret_broker_misrouted")
    if command_id in {"cmd.forge.pipeline.secret.set", "cmd.forge.pipeline.secret.remove"}:
        if target.get("variable_value") is not None:
            failures.append("forge_secret_inline_value_present")
    if command_id == "cmd.forge.pipeline.variable.set":
        variable_value = target.get("variable_value")
        if isinstance(variable_value, str) and any(
            marker in variable_value for marker in _FORGE_SECRET_LIKE_MARKERS
        ):
            failures.append("forge_variable_value_secret_like")

    if command_id == "cmd.forge.pipeline.open_in_browser":
        destination = target.get("official_destination_kind")
        if destination == "automation_run_artifacts":
            if not target.get("pipeline_id") or not target.get("automation_run_id"):
                failures.append("forge_official_destination_binding_invalid")
            if target.get("hosted_setting_scope_ref") is not None:
                failures.append("forge_official_destination_binding_invalid")
        elif destination == "hosted_service_settings":
            if not target.get("hosted_setting_scope_ref"):
                failures.append("forge_official_destination_binding_invalid")
            if target.get("pipeline_id") is not None or target.get("automation_run_id") is not None:
                failures.append("forge_official_destination_binding_invalid")
        elif destination == "automation_service_overview":
            if (
                target.get("pipeline_id") is not None
                or target.get("automation_run_id") is not None
                or target.get("job_id") is not None
                or target.get("hosted_setting_scope_ref") is not None
            ):
                failures.append("forge_official_destination_binding_invalid")
        else:
            failures.append("forge_official_destination_binding_invalid")

    handoff = value.get("browser_handoff")
    if isinstance(handoff, dict) and target.get("official_page_route_ref") is not None:
        # Route equality only, and only for official-page navigation targets.
        # A null target route (e.g. a connection reauthorize auth session)
        # leaves the handoff route standalone. The allowed origin is an
        # opaque profile-approved ref and is NEVER equated with the API host.
        if handoff.get("official_page_route_ref") != target.get("official_page_route_ref"):
            failures.append("forge_browser_handoff_route_mismatch")

    return sorted(set(failures))


def _forge_result_failures(value: dict[str, Any]) -> list[str]:
    if value.get("outcome") != "effect_unknown":
        return []
    error = _as_dict(value.get("error"))
    availability = _as_dict(value.get("availability"))
    reason_codes = availability.get("reason_codes")
    error_actions = error.get("recovery_action_ids")
    top_actions = value.get("recovery_action_ids")
    allowed_actions = availability.get("allowed_action_ids")
    coherent = (
        isinstance(error.get("code"), str)
        and isinstance(reason_codes, list)
        and error["code"] in reason_codes
        and isinstance(error_actions, list)
        and isinstance(top_actions, list)
        and isinstance(allowed_actions, list)
        and set(error_actions) == set(top_actions) == set(allowed_actions)
        and error.get("retry_disposition") == "after_reconciliation"
        and error.get("effect_state") == "unknown"
        and value.get("terminal_provider_result_ref") is None
        and value.get("receipt_ref") is None
        and value.get("event_refs") == []
    )
    if coherent:
        return []
    return ["forge_effect_unknown_not_reconciliation_only"]


def _forge_availability_failures(value: dict[str, Any]) -> list[str]:
    currentness = _as_dict(value.get("currentness"))
    if value.get("expected_binding_generation") != currentness.get("binding_generation"):
        return ["forge_binding_generation_stale"]
    return []


def _forge_error_record_failures(value: dict[str, Any]) -> list[str]:
    error = _as_dict(value.get("error"))
    if error.get("effect_state") == "unknown" and error.get("retry_disposition") != "after_reconciliation":
        return ["forge_error_retry_misrouted"]
    return []


def forge_semantic_failures(definition_name: str, value: Any) -> list[str]:
    """Evaluate Forge per-record joins JSON Schema cannot express.

    Runs on the main pack and every sibling pack: only universal internal
    joins, never main-pack census or cross-record linkage.
    """

    if not isinstance(value, dict):
        return []
    if definition_name == "command_request":
        return _forge_request_failures(value)
    if definition_name == "command_result":
        return _forge_result_failures(value)
    if definition_name == "command_availability":
        return _forge_availability_failures(value)
    if definition_name == "command_error_record":
        return _forge_error_record_failures(value)
    return forge_packet_semantic_failures(definition_name, value)


# Main-pack-only census: the ten new CI/delete fixture identities from the
# owner repair. Presence is checked against schema-valid positives; a case
# that is present but schema-invalid is reported as unevaluable (owner
# mid-flight), never as a semantic pass.
FORGE_MAIN_PACK_CENSUS_CASES = (
    "command_request_forge_repository_delete",
    "command_request_forge_pipeline_artifact_download",
    "command_request_forge_pipeline_artifact_import",
    "command_request_forge_pipeline_secret_set",
    "command_request_forge_pipeline_secret_remove",
    "command_request_forge_pipeline_variable_set",
    "command_request_forge_pipeline_variable_remove",
    "command_request_forge_pipeline_open_in_browser_service_settings",
    "command_result_repository_delete_effect_unknown",
    "command_availability_pipeline_artifact_download_unsupported",
)


def validate_forge_main_pack(
    all_by_name: dict[str, Any],
    valid_names: set[str] | frozenset[str],
) -> list[dict[str, Any]]:
    """Main-pack census plus broker one-use. Never run on sibling packs."""

    findings: list[dict[str, Any]] = []
    for case_name in FORGE_MAIN_PACK_CENSUS_CASES:
        if case_name in valid_names:
            continue
        if case_name in all_by_name:
            findings.append({
                "code": "forge_pack_census_unevaluable_schema_invalid",
                "case": case_name,
                "detail": "present but schema-invalid; owner fixture repair still pending",
            })
        else:
            findings.append({"code": "forge_pack_census_gap", "case": case_name})

    seen_brokers: dict[str, str] = {}
    for name in sorted(valid_names):
        value = all_by_name.get(name)
        if not isinstance(value, dict):
            continue
        if value.get("command_id") != "cmd.forge.pipeline.secret.set":
            continue
        broker = _as_dict(value.get("target")).get("secret_broker_ref")
        if not isinstance(broker, str) or not broker:
            continue
        if broker in seen_brokers:
            findings.append({
                "code": "forge_pack_secret_broker_reused",
                "broker_ref": broker,
                "cases": [seen_brokers[broker], name],
            })
        else:
            seen_brokers[broker] = name
    return findings


# ---------------------------------------------------------------------------
# Commands & Shortcuts
# ---------------------------------------------------------------------------

COMMANDS_SCHEMA_REL = "Plans/commands_shortcuts_contracts.schema.json"
COMMANDS_MAIN_FIXTURE_REL = "Plans/commands_shortcuts_contract_fixtures.json"

# (control_label, field) admission map for commands.update. Provenance: the
# nine hero-sheet owner_action ControlRoute rows plus the owner semantic
# accept notes; the Text/enabled rejection is sem_label_binding_reject.
# The owner should promote this to a schema/x-map companion; until then the
# semantic check pins it against drift.
COMMANDS_LABEL_FIELD_BINDING = {
    "Text": "template",
    "Arguments hint": "arguments_hint",
    "One line": "description",
    "Scope": "scope",
    "Persona": "overrides",
    "Mode": "overrides",
    "Model": "overrides",
    "Permissions profile": "overrides",
    "Enabled": "enabled",
}

_COMMANDS_FORBIDDEN_ALIAS_PREFIXES = (
    "cmd.user_command.",
    "cmd.keybinding.",
    "cmd.commands.custom.",
    "cmd.shortcuts.",
)

# Documentary string fields excluded from the alias-resurrection scan.
_COMMANDS_DOCUMENTARY_KEYS = frozenset({"reason", "notes", "note", "detail"})


def commands_semantic_failures(definition_name: str, value: Any) -> list[str]:
    """Evaluate Commands single-record joins JSON Schema cannot express."""

    if not isinstance(value, dict):
        return []
    if definition_name == "DeleteRequest":
        confirmation = _as_dict(value.get("confirmation"))
        target = _as_dict(value.get("target"))
        if confirmation.get("confirmed_name") != target.get("name"):
            return ["cmdsc_confirmed_name_mismatch"]
        return []
    if definition_name == "ImportCommitRequest":
        confirmation = _as_dict(value.get("confirmation"))
        if confirmation.get("confirmed_plan_hash") != value.get("plan_hash"):
            return ["cmdsc_confirmed_plan_mismatch"]
        return []
    if definition_name == "PreviewResult":
        if (
            value.get("outcome") != "preview_only"
            or value.get("persisted") is not False
            or value.get("submitted") is not False
            or value.get("executed") is not False
        ):
            return ["cmdsc_preview_has_side_effect"]
        return []
    if definition_name == "ActionError":
        if value.get("automatic_retry_permitted") is not False:
            return ["cmdsc_error_write_incoherent"]
        wrote = value.get("wrote")
        if value.get("error_id") == "recovery_required":
            if wrote is not True:
                return ["cmdsc_error_write_incoherent"]
        elif wrote is not False:
            return ["cmdsc_error_write_incoherent"]
        return []
    if definition_name == "UpdateRequest":
        failures: list[str] = []
        expected_field = COMMANDS_LABEL_FIELD_BINDING.get(value.get("control_label"))
        if expected_field is None or value.get("field") != expected_field:
            failures.append("cmdsc_label_field_mismatch")
        if value.get("field") == "scope":
            # A scope change is a file relocation: the destination keeps the
            # source name, takes the requested scope, and must differ.
            target = _as_dict(value.get("target"))
            dest = _as_dict(value.get("destination_target"))
            if (
                not isinstance(dest.get("scope"), str)
                or not isinstance(dest.get("name"), str)
                or dest.get("name") != target.get("name")
                or dest.get("scope") != value.get("value")
                or dest == target
            ):
                failures.append("cmdsc_scope_destination_mismatch")
        return failures
    return []


class _Unevaluable(Exception):
    def __init__(self, reason: str) -> None:
        super().__init__(reason)
        self.reason = reason


def _commands_records_by_request(records: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    grouped: dict[str, list[dict[str, Any]]] = {}
    for record in records:
        request_id = record.get("request_id")
        if isinstance(request_id, str) and request_id:
            grouped.setdefault(request_id, []).append(record)
    return grouped


def _check_preview_side_effect_free(records: list[dict[str, Any]], _ctx: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    for record in records:
        kind = record.get("record_kind")
        if kind == "commands_shortcuts_action_result" and record.get("action_id") == "commands.preview":
            if (
                record.get("outcome") != "preview_only"
                or record.get("persisted") is not False
                or record.get("submitted") is not False
                or record.get("executed") is not False
            ):
                failures.append("cmdsc_preview_has_side_effect")
        elif kind == "commands_shortcuts_action_request" and record.get("action_id") == "commands.preview":
            if "permission_snapshot_id" in record or "idempotency_key" in record:
                failures.append("cmdsc_preview_carries_effect_keys")
    for _request_id, group in _commands_records_by_request(records).items():
        kinds = {(item.get("record_kind"), item.get("action_id"), item.get("outcome")) for item in group}
        has_preview_request = any(
            kind == "commands_shortcuts_action_request" and action == "commands.preview"
            for kind, action, _outcome in kinds
        )
        mutated_answers = [
            (kind, action, outcome)
            for kind, action, outcome in kinds
            if kind == "commands_shortcuts_action_result" and outcome == "mutated"
        ]
        if has_preview_request and mutated_answers:
            failures.append("cmdsc_preview_lineage_mutated")
    return sorted(set(failures))


def _check_confirmed_name(records: list[dict[str, Any]], _ctx: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    for record in records:
        if record.get("action_id") != "commands.delete":
            continue
        if record.get("record_kind") != "commands_shortcuts_action_request":
            continue
        confirmation = _as_dict(record.get("confirmation"))
        target = _as_dict(record.get("target"))
        if confirmation.get("confirmed_name") != target.get("name"):
            failures.append("cmdsc_confirmed_name_mismatch")
    return failures


def _import_entry_signature(entry: Any) -> tuple[str, str, str] | None:
    if not isinstance(entry, dict):
        return None
    target = _as_dict(entry.get("target"))
    scope, name, intent = target.get("scope"), target.get("name"), entry.get("intent")
    if not all(isinstance(part, str) for part in (scope, name, intent)):
        return None
    return (scope, name, intent)


def _check_confirmed_plan(records: list[dict[str, Any]], _ctx: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    plans: dict[str, dict[str, Any]] = {}
    for record in records:
        if (
            record.get("record_kind") == "commands_shortcuts_action_result"
            and record.get("action_id") == "commands.import_preview"
        ):
            plan_id = record.get("plan_id")
            if isinstance(plan_id, str):
                if plan_id in plans:
                    failures.append("cmdsc_duplicate_plan_identity")
                plans[plan_id] = record
    preview_requests = {r.get("request_id"): r for r in records if r.get("record_kind") == "commands_shortcuts_action_request" and r.get("action_id") == "commands.import_preview"}
    for plan in plans.values():
        witness = plan.get("reviewed_plan")
        if not isinstance(witness, dict):
            failures.append("cmdsc_reviewed_plan_missing")
            continue
        try:
            if canonical_result_digest(witness) != plan.get("plan_hash"):
                failures.append("cmdsc_reviewed_plan_digest_mismatch")
        except (TypeError, ValueError):
            failures.append("cmdsc_reviewed_plan_unhashable")
        summary = [{"target": e.get("target"), "intent": e.get("intent")} for e in witness.get("entries", [])]
        if summary != plan.get("entries") or witness.get("list_generation") != plan.get("list_generation"):
            failures.append("cmdsc_plan_summary_mismatch")
        preview = preview_requests.get(plan.get("request_id"))
        if preview is None:
            raise _Unevaluable("import_preview_request_absent")
        if any(preview.get(k) != witness.get(k) for k in ("actor_ref", "project_id")) or _as_dict(preview.get("picked_file")).get("sha256") != witness.get("picked_file_sha256"):
            failures.append("cmdsc_preview_plan_binding_mismatch")
    for record in records:
        if (
            record.get("record_kind") != "commands_shortcuts_action_request"
            or record.get("action_id") != "commands.import_commit"
        ):
            continue
        confirmation = _as_dict(record.get("confirmation"))
        if confirmation.get("confirmed_plan_hash") != record.get("plan_hash"):
            failures.append("cmdsc_confirmed_plan_mismatch")
        plan = plans.get(record.get("plan_id")) if isinstance(record.get("plan_id"), str) else None
        if plan is None:
            failures.append("cmdsc_reviewed_plan_missing")
            continue
        if record.get("plan_hash") != plan.get("plan_hash"):
            failures.append("cmdsc_plan_hash_changed")
            continue
        commit_entries = record.get("entries")
        plan_entries = plan.get("entries")
        if not isinstance(commit_entries, list) or not isinstance(plan_entries, list):
            failures.append("cmdsc_plan_manifest_missing")
            continue
        witness = _as_dict(plan.get("reviewed_plan"))
        if commit_entries != witness.get("entries"):
            failures.append("cmdsc_plan_manifest_changed")
        if any(record.get(k) != witness.get(k) for k in ("actor_ref", "project_id")) or record.get("expected_list_generation") != witness.get("list_generation"):
            failures.append("cmdsc_commit_plan_binding_mismatch")
        # Entry internal coherence: the reviewed draft names its own target.
        for entry in commit_entries:
            if not isinstance(entry, dict):
                failures.append("cmdsc_plan_entry_draft_mismatch")
                continue
            draft = entry.get("draft_content")
            target = entry.get("target")
            if (
                not isinstance(draft, dict)
                or not isinstance(target, dict)
                or draft.get("name") != target.get("name")
            ):
                failures.append("cmdsc_plan_entry_draft_mismatch")
    # Applied-manifest correspondence: the commit result's applied files must
    # be exactly the committed entry targets bound to the request project.
    commit_requests = {
        record["request_id"]: record
        for record in records
        if record.get("record_kind") == "commands_shortcuts_action_request"
        and record.get("action_id") == "commands.import_commit"
        and isinstance(record.get("request_id"), str)
    }
    for record in records:
        if (
            record.get("record_kind") != "commands_shortcuts_action_result"
            or record.get("action_id") != "commands.import_commit"
        ):
            continue
        request = commit_requests.get(record.get("request_id"))
        if request is None:
            continue
        applied = record.get("applied")
        entries = request.get("entries")
        project_id = request.get("project_id")
        if not isinstance(applied, list) or not isinstance(entries, list):
            failures.append("cmdsc_applied_manifest_mismatch")
            continue
        expected_refs: set[str] = set()
        buildable = True
        for entry in entries:
            target = _as_dict(entry.get("target")) if isinstance(entry, dict) else {}
            scope, name = target.get("scope"), target.get("name")
            if scope == "project" and isinstance(name, str) and isinstance(project_id, str):
                expected_refs.add(f"command_file:project:{project_id}:{name}")
            elif scope == "global" and isinstance(name, str):
                expected_refs.add(f"command_file:global:{name}")
            else:
                buildable = False
        actual_refs = {
            item.get("file_ref") for item in applied if isinstance(item, dict)
        }
        if (
            not buildable
            or len(applied) != len(entries)
            or any(not isinstance(ref, str) for ref in actual_refs)
            or actual_refs != expected_refs
        ):
            failures.append("cmdsc_applied_manifest_mismatch")
    return sorted(set(failures))


def _check_reset_counts(records: list[dict[str, Any]], _ctx: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    requests = [
        record for record in records
        if record.get("record_kind") == "commands_shortcuts_action_request"
        and record.get("action_id") == "commands.reset_all"
    ]
    results = [
        record for record in records
        if record.get("record_kind") == "commands_shortcuts_action_result"
        and record.get("action_id") == "commands.reset_all"
    ]
    for result in results:
        removed = result.get("removed_file_refs")
        if not isinstance(removed, list):
            failures.append("cmdsc_reset_counts_mismatch")
            continue
        if result.get("shortcuts_restored") is not True or result.get("prefs_restored") is not True:
            failures.append("cmdsc_reset_restore_flags_unset")
        for request in requests:
            if request.get("request_id") != result.get("request_id"):
                continue
            confirmation = _as_dict(request.get("confirmation"))
            if confirmation.get("confirmed_command_count") != len(removed):
                failures.append("cmdsc_reset_counts_mismatch")
    return sorted(set(failures))


def _check_stale_projection(records: list[dict[str, Any]], ctx: dict[str, Any]) -> list[str]:
    failures = []
    for record in records:
        if record.get("record_kind") == "commands_shortcuts_action_error" and record.get("error_id") == "stale_projection":
            if record.get("wrote") is not False or record.get("automatic_retry_permitted") is not False:
                failures.append("cmdsc_stale_write_or_retry")
    requests = {r.get("request_id"): r for r in records if r.get("record_kind") == "commands_shortcuts_action_request"}
    for result in records:
        if result.get("record_kind") != "commands_shortcuts_action_result" or result.get("outcome") != "mutated":
            continue
        request = requests.get(result.get("request_id"))
        if request is None:
            raise _Unevaluable("stale_request_absent")
        ref = _as_dict(ctx.get("case")).get("pre_dispatch_projection_ref")
        witness = _as_dict(ctx["all_by_name"].get(ref))
        if witness.get("record_kind") != "commands_shortcuts_generation_witness" or witness.get("observed_phase") != "before_dispatch" or witness not in records:
            raise _Unevaluable("current_generation_witness_absent")
        if witness.get("request_id") != request.get("request_id") or witness.get("project_id") != request.get("project_id"):
            failures.append("cmdsc_generation_witness_binding_mismatch")
        elif witness.get("list_generation") != request.get("expected_list_generation"):
            failures.append("cmdsc_stale_write_accepted")
    return sorted(set(failures))


def _check_stale_root(records: list[dict[str, Any]], _ctx: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    for record in records:
        if record.get("record_kind") != "commands_shortcuts_action_error":
            continue
        if record.get("error_id") == "stale_project_root":
            if record.get("wrote") is not False or record.get("automatic_retry_permitted") is not False:
                failures.append("cmdsc_stale_write_or_retry")
    return failures


def _parse_command_file_ref(file_ref: Any) -> tuple[str, str | None, str] | None:
    if not isinstance(file_ref, str):
        return None
    parts = file_ref.split(":")
    if len(parts) == 3 and parts[0] == "command_file" and parts[1] == "global" and parts[2]:
        return ("global", None, parts[2])
    if (
        len(parts) == 4
        and parts[0] == "command_file"
        and parts[1] == "project"
        and parts[2]
        and parts[3]
    ):
        return ("project", parts[2], parts[3])
    return None


def _expected_file_endpoint(request: dict[str, Any]) -> dict[str, Any]:
    """The file identity a successful result must attest.

    Ordinary mutations attest the source target under the source root; a
    scope move attests the destination target under the destination root,
    with provenance back to the source file.
    """

    if request.get("action_id") == "commands.update" and request.get("field") == "scope":
        dest = _as_dict(request.get("destination_target"))
        return {
            "scope": dest.get("scope"),
            "name": dest.get("name"),
            "project_id": request.get("project_id"),
            "root_generation": request.get("expected_destination_root_generation"),
            "root_fingerprint": request.get("expected_destination_root_fingerprint"),
            "moved_from": _source_file_ref(request),
            "is_move": True,
        }
    target = _as_dict(request.get("target"))
    return {
        "scope": target.get("scope"),
        "name": target.get("name"),
        "project_id": request.get("project_id"),
        "root_generation": request.get("expected_root_generation"),
        "root_fingerprint": request.get("expected_root_fingerprint"),
        "moved_from": None,
        "is_move": False,
    }


def _source_file_ref(request: dict[str, Any]) -> str | None:
    target = _as_dict(request.get("target"))
    scope, name = target.get("scope"), target.get("name")
    if scope == "global" and isinstance(name, str):
        return f"command_file:global:{name}"
    if scope == "project" and isinstance(name, str) and isinstance(request.get("project_id"), str):
        return f"command_file:project:{request['project_id']}:{name}"
    return None


def _check_action_result_binding(records: list[dict[str, Any]], _ctx: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    requests = {
        record["request_id"]: record
        for record in records
        if record.get("record_kind") == "commands_shortcuts_action_request"
        and isinstance(record.get("request_id"), str)
    }
    for record in records:
        if record.get("record_kind") != "commands_shortcuts_action_result":
            continue
        request = requests.get(record.get("request_id"))
        if request is None:
            continue
        if record.get("action_id") != request.get("action_id"):
            failures.append("cmdsc_action_result_binding_mismatch")
        endpoint = _expected_file_endpoint(request)
        if "file_ref" in record or isinstance(endpoint["scope"], str):
            parsed = _parse_command_file_ref(record.get("file_ref"))
            if (
                parsed is None
                or not isinstance(endpoint["scope"], str)
                or not isinstance(endpoint["name"], str)
                or parsed[0] != endpoint["scope"]
                or parsed[2] != endpoint["name"]
            ):
                failures.append("cmdsc_result_file_target_mismatch")
        for root_field in ("root_generation", "root_fingerprint"):
            if root_field not in record:
                continue
            expected = endpoint[root_field]
            if expected is not None and record[root_field] != expected:
                failures.append("cmdsc_result_root_binding_mismatch")
        if "moved_from" in record:
            if endpoint["is_move"]:
                expected_from = endpoint["moved_from"]
                if not isinstance(expected_from, str) or record["moved_from"] != expected_from:
                    failures.append("cmdsc_move_provenance_mismatch")
            elif record["moved_from"] is not None:
                failures.append("cmdsc_move_provenance_mismatch")
    return sorted(set(failures))


def _idempotency_signature(record: dict[str, Any]) -> str:
    # Same key must mean same effective request: every field that can change
    # the mutation outcome is signed, including project binding, all CAS
    # generations, content hashes, confirmation, and permission snapshot.
    # Only the envelope discriminators and the per-request identity are
    # excluded: two requests sharing a key always carry distinct request_ids.
    payload = {
        key: value
        for key, value in record.items()
        if key not in {"schema_id", "record_kind", "request_id"}
    }
    return canonical_result_digest(payload)


def _check_idempotency(records: list[dict[str, Any]], _ctx: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    by_key: dict[str, list[dict[str, Any]]] = {}
    for record in records:
        if record.get("record_kind") != "commands_shortcuts_action_request":
            continue
        key = record.get("idempotency_key")
        if isinstance(key, str) and key:
            by_key.setdefault(key, []).append(record)
    for _key, group in by_key.items():
        signatures = {_idempotency_signature(record) for record in group}
        if len(signatures) > 1:
            failures.append("cmdsc_idempotency_conflict")
    results_by_request = _commands_records_by_request([
        record for record in records
        if record.get("record_kind") == "commands_shortcuts_action_result"
    ])
    for group in by_key.values():
        fresh_writes = 0
        for request in group:
            for result in results_by_request.get(request.get("request_id"), []):
                if result.get("outcome") == "mutated" and result.get("replayed") is not True:
                    fresh_writes += 1
        if fresh_writes > 1:
            failures.append("cmdsc_idempotency_replay_missing")
    return sorted(set(failures))


def _check_denied_no_write(records: list[dict[str, Any]], _ctx: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    denied_ids: set[str] = set()
    for record in records:
        if record.get("record_kind") != "commands_shortcuts_action_error":
            continue
        if record.get("error_id") in {"filesafe_denied", "permission_snapshot_stale", "permission_denied"}:
            if record.get("wrote") is not False or record.get("automatic_retry_permitted") is not False:
                failures.append("cmdsc_denied_write_or_retry")
            request_id = record.get("request_id")
            if isinstance(request_id, str):
                denied_ids.add(request_id)
    for record in records:
        if record.get("record_kind") != "commands_shortcuts_action_result":
            continue
        if record.get("request_id") in denied_ids and record.get("outcome") == "mutated":
            failures.append("cmdsc_denied_then_wrote")
    return sorted(set(failures))


def _check_collision_warns(records: list[dict[str, Any]], ctx: dict[str, Any]) -> list[str]:
    schema = _as_dict(ctx.get("schema"))
    defs = _as_dict(schema.get("$defs"))
    disabled = _as_dict(defs.get("disabled_reason"))
    reasons = disabled.get("enum")
    if not isinstance(reasons, list):
        raise _Unevaluable("disabled_reason_enum_absent")
    if any("collision" in str(reason) for reason in reasons):
        return ["cmdsc_collision_blocks_write"]
    transaction_routes = [
        record for record in records
        if record.get("record_kind") == "commands_shortcuts_control_route"
        and record.get("route_via") == "settings_transaction"
    ]
    if records and not transaction_routes:
        return ["cmdsc_shortcut_route_missing"]
    return []


def _check_label_binding(records: list[dict[str, Any]], _ctx: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    for record in records:
        if (
            record.get("record_kind") != "commands_shortcuts_action_request"
            or record.get("action_id") != "commands.update"
        ):
            continue
        expected = COMMANDS_LABEL_FIELD_BINDING.get(record.get("control_label"))
        if expected is None or record.get("field") != expected:
            failures.append("cmdsc_label_field_mismatch")
    return failures


def _check_hint_round_trip(records: list[dict[str, Any]], _ctx: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    drafts: list[Any] = []
    for record in records:
        if isinstance(record.get("draft_content"), dict):
            drafts.append(record["draft_content"])
        entries = record.get("entries")
        if isinstance(entries, list):
            for entry in entries:
                if isinstance(entry, dict) and isinstance(entry.get("draft_content"), dict):
                    drafts.append(entry["draft_content"])
    for draft in drafts:
        if "arguments_hint" not in draft or not isinstance(draft.get("arguments_hint"), str):
            failures.append("cmdsc_arguments_hint_dropped")
    return failures


def _check_project_identity(records: list[dict[str, Any]], _ctx: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    requests = {
        record["request_id"]: record
        for record in records
        if record.get("record_kind") == "commands_shortcuts_action_request"
        and isinstance(record.get("request_id"), str)
    }
    for record in records:
        if record.get("record_kind") != "commands_shortcuts_action_result":
            continue
        if "file_ref" not in record:
            continue
        request = requests.get(record.get("request_id"))
        if request is None:
            continue
        endpoint = _expected_file_endpoint(request)
        parsed = _parse_command_file_ref(record.get("file_ref"))
        if (
            parsed is None
            or not isinstance(endpoint["scope"], str)
            or not isinstance(endpoint["name"], str)
        ):
            failures.append("cmdsc_project_identity_unbound")
            continue
        scope, project, name = parsed
        if scope != endpoint["scope"] or name != endpoint["name"]:
            failures.append("cmdsc_project_identity_collision")
            continue
        if endpoint["scope"] == "project":
            if project != endpoint["project_id"]:
                failures.append("cmdsc_project_identity_collision")
        for root_field in ("root_generation", "root_fingerprint"):
            if root_field not in record:
                continue
            expected = endpoint[root_field]
            if expected is not None and record[root_field] != expected:
                failures.append("cmdsc_result_root_binding_mismatch")
    return sorted(set(failures))


def _iter_scanned_strings(node: Any, documentary: bool = False) -> Any:
    if isinstance(node, dict):
        for key, child in node.items():
            child_documentary = documentary or key in _COMMANDS_DOCUMENTARY_KEYS
            if isinstance(key, str) and not child_documentary:
                yield f"key:{key}", key
            yield from _iter_scanned_strings(child, child_documentary)
    elif isinstance(node, list):
        for child in node:
            yield from _iter_scanned_strings(child, documentary)
    elif isinstance(node, str) and not documentary:
        yield "value", node


def scan_commands_alias_tokens(schema: Any, fixtures: Any) -> list[str]:
    """Alias scan over the admitted contract surface.

    Covers the owner schema, every ``valid[]`` record, and accept-verdict
    semantic inline records. Structural ``invalid[]`` counterexamples and
    reject-verdict inline records legitimately contain forbidden spellings
    as the rejected content, so they are out of scan scope by design.
    Documentary strings (reason/notes/note/detail) are excluded everywhere.
    Returns ``surface:token`` hits for resurrected ``cmd.*`` spellings.
    """

    surfaces: list[tuple[str, Any]] = [("schema", schema)]
    fixture_doc = _as_dict(fixtures)
    valid = fixture_doc.get("valid")
    if isinstance(valid, list):
        surfaces.append(("valid", valid))
    cases = fixture_doc.get("semantic_cases")
    if isinstance(cases, list):
        for case in cases:
            if not isinstance(case, dict) or case.get("verdict") != "accept":
                continue
            inline = case.get("records")
            if isinstance(inline, list):
                surfaces.append(("sem_accept", inline))
    hits: list[str] = []
    for label, document in surfaces:
        for _kind, text in _iter_scanned_strings(document):
            for prefix in _COMMANDS_FORBIDDEN_ALIAS_PREFIXES:
                if prefix in text:
                    hits.append(f"{label}:{prefix.rstrip('.')}")
                    break
    return sorted(set(hits))


def _check_no_alias(records: list[dict[str, Any]], ctx: dict[str, Any]) -> list[str]:
    del records
    hits = scan_commands_alias_tokens(ctx.get("schema"), ctx.get("fixtures"))
    if hits:
        return ["cmdsc_cmd_alias_resurrected"]
    return []


_COMMANDS_SEMANTIC_CHECKS = {
    "cmdsc_preview_side_effect_free": _check_preview_side_effect_free,
    "cmdsc_confirmed_name_matches_target": _check_confirmed_name,
    "cmdsc_confirmed_plan_matches": _check_confirmed_plan,
    "cmdsc_reset_counts_match": _check_reset_counts,
    "cmdsc_stale_projection_rejected": _check_stale_projection,
    "cmdsc_stale_project_root_rejected": _check_stale_root,
    "cmdsc_action_result_binding": _check_action_result_binding,
    "cmdsc_idempotency_conflict": _check_idempotency,
    "cmdsc_permission_filesafe_denied_no_write": _check_denied_no_write,
    "cmdsc_shortcut_collision_warns": _check_collision_warns,
    "cmdsc_action_label_binding": _check_label_binding,
    "cmdsc_arguments_hint_round_trip": _check_hint_round_trip,
    "cmdsc_project_identity_bound": _check_project_identity,
    "cmdsc_no_cmd_alias_resurrection": _check_no_alias,
}


def commands_census_action_ids(schema: Any) -> list[str]:
    """Derive the admitted local-action enum from the owner schema itself."""

    defs = _as_dict(_as_dict(schema).get("$defs"))
    census = _as_dict(defs.get("census_action_id"))
    enum = census.get("enum")
    if not isinstance(enum, list) or not enum or not all(isinstance(item, str) for item in enum):
        raise ValueError("commands_census_action_enum_missing")
    return list(enum)


def evaluate_commands_semantic_case(
    case: dict[str, Any],
    *,
    schema: Any,
    fixtures: Any,
    all_by_name: dict[str, Any],
) -> tuple[list[str] | None, str | None]:
    """Evaluate one owner semantic case.

    Returns ``(failures, unevaluable_reason)``: exactly one is non-None.
    Unknown checks fail closed as findings via the raised ValueError.
    """

    check_name = case.get("check")
    check = _COMMANDS_SEMANTIC_CHECKS.get(check_name) if isinstance(check_name, str) else None
    if check is None:
        raise ValueError(f"unknown_commands_semantic_check:{check_name}")
    records: list[dict[str, Any]] = []
    for ref in case.get("record_refs", []) or []:
        if ref not in all_by_name or not isinstance(all_by_name[ref], dict):
            return None, f"record_ref_unresolvable:{ref}"
        records.append(all_by_name[ref])
    inline = case.get("records", []) or []
    if not isinstance(inline, list):
        return None, "inline_records_not_a_list"
    for record in inline:
        if not isinstance(record, dict):
            return None, "inline_record_not_an_object"
        records.append(record)
    try:
        return (
            check(records, {"schema": schema, "fixtures": fixtures, "all_by_name": all_by_name, "case": case}),
            None,
        )
    except _Unevaluable as exc:
        return None, exc.reason


def validate_commands_main_pack(
    schema: Any,
    fixtures: Any,
    all_by_name: dict[str, Any],
    valid_names: set[str] | frozenset[str],
) -> list[dict[str, Any]]:
    """Owner semantic cases plus the ControlRoute census. Main pair only."""

    findings: list[dict[str, Any]] = []
    cases = _as_dict(fixtures).get("semantic_cases")
    if not isinstance(cases, list):
        return [{"code": "commands_pack_semantic_cases_missing"}]
    for case in cases:
        if not isinstance(case, dict):
            findings.append({"code": "commands_semantic_case_not_an_object"})
            continue
        case_id = case.get("case_id", "unnamed")
        try:
            failures, unevaluable = evaluate_commands_semantic_case(
                case, schema=schema, fixtures=fixtures, all_by_name=all_by_name
            )
        except ValueError as exc:
            findings.append({
                "code": "commands_semantic_case_failed_closed",
                "case": case_id,
                "detail": str(exc),
            })
            continue
        if unevaluable is not None:
            findings.append({
                "code": "commands_semantic_case_unevaluable",
                "case": case_id,
                "check": case.get("check"),
                "detail": unevaluable,
            })
            continue
        assert failures is not None
        verdict = case.get("verdict")
        if verdict == "accept" and failures:
            findings.append({
                "code": "commands_semantic_case_failed",
                "case": case_id,
                "check": case.get("check"),
                "verdict": verdict,
                "semantic_failures": failures,
            })
        elif verdict == "reject" and not failures:
            findings.append({
                "code": "commands_semantic_case_failed",
                "case": case_id,
                "check": case.get("check"),
                "verdict": verdict,
                "detail": "expected rejection not proven",
            })
        elif verdict not in {"accept", "reject"}:
            findings.append({
                "code": "commands_semantic_case_failed_closed",
                "case": case_id,
                "detail": f"unknown_verdict:{verdict}",
            })

    try:
        admitted = set(commands_census_action_ids(schema))
    except ValueError as exc:
        findings.append({"code": "commands_pack_census_unevaluable", "detail": str(exc)})
        return findings
    routed: set[str] = set()
    for name in valid_names:
        record = all_by_name.get(name)
        if not isinstance(record, dict):
            continue
        if record.get("record_kind") != "commands_shortcuts_control_route":
            continue
        if record.get("route_via") != "owner_action":
            continue
        action_id = record.get("action_id")
        if isinstance(action_id, str):
            routed.add(action_id)
    if routed != admitted:
        findings.append({
            "code": "commands_pack_census_gap",
            "missing": sorted(admitted - routed),
            "extra": sorted(routed - admitted),
        })
    return findings


# ---------------------------------------------------------------------------
# Onboarding plan consumers: projection/retained-context pairs (§4)
# ---------------------------------------------------------------------------

ONBOARDING_SCHEMA_REL = "Plans/product_onboarding_contracts.schema.json"
ONBOARDING_MAIN_FIXTURE_REL = "Plans/product_onboarding_contract_fixtures.json"
PROJECT_MAIN_FIXTURE_REL = "Plans/project_system_contract_fixtures.json"


def onboarding_projection_pair_comparison(
    projection: Any,
    retained: Any,
    original_result: Any,
) -> tuple[list[str], list[str]]:
    """Compare a recovery projection against its retained owner context.

    Returns ``(failures, unevaluable)``. The ``currentness`` block is a
    transport echo: every verifiable match is recomputed from actual fields
    and no ``true`` boolean grants authority. Echoes without a retained
    counterpart (session, target, revision, continuation, generation) are
    session-held and intentionally not asserted here.
    """

    view = _as_dict(projection)
    context = _as_dict(retained)
    failures: list[str] = []
    unevaluable: list[str] = []

    if view.get("recovery_ref") != context.get("recovery_id"):
        failures.append("onbrec_recovery_ref_mismatch")
    if view.get("recovery_composition_revision") != context.get("composition_revision"):
        failures.append("onbrec_composition_revision_mismatch")
    if view.get("recovery_composition_sha256") != context.get("composition_sha256"):
        failures.append("onbrec_composition_hash_mismatch")
    if view.get("reviewed_setup_binding") != context.get("reviewed_setup_binding"):
        failures.append("onbrec_reviewed_draft_mismatch")
    if view.get("original_command_id") != context.get("original_command_id"):
        failures.append("onbrec_original_command_mismatch")
    if view.get("original_operation_ref") != context.get("original_operation_ref"):
        failures.append("onbrec_original_operation_mismatch")
    if view.get("original_terminal_result_ref") != context.get("original_terminal_result_ref"):
        failures.append("onbrec_original_result_ref_mismatch")

    if not isinstance(original_result, dict) or not original_result:
        unevaluable.append("original_result_bytes_absent")
    else:
        recomputed = canonical_result_digest(original_result)
        if view.get("original_terminal_result_sha256") != recomputed:
            failures.append("onbrec_original_result_digest_mismatch")
        if context.get("original_terminal_result_sha256") != recomputed:
            failures.append("onbrec_owner_digest_stale")

    if view.get("forge_create_result_ref") != context.get("forge_create_result_ref"):
        failures.append("onbrec_forge_result_ref_mismatch")
    if view.get("forge_create_receipt_ref") != context.get("forge_create_receipt_ref"):
        failures.append("onbrec_forge_receipt_ref_mismatch")
    if view.get("repository_binding") != context.get("repository_binding"):
        failures.append("onbrec_repository_binding_mismatch")
    if view.get("remote_effect_state") != context.get("remote_effect_state"):
        failures.append("onbrec_remote_effect_mismatch")

    view_settled = view.get("settled_effect_names")
    context_settled = context.get("settled_effects")
    if (
        not isinstance(view_settled, list)
        or not isinstance(context_settled, dict)
        or set(view_settled) != set(context_settled)
    ):
        failures.append("onbrec_settled_effects_mismatch")
    view_remaining = view.get("remaining_effects")
    context_remaining = context.get("remaining_effects")
    if (
        not isinstance(view_remaining, list)
        or not isinstance(context_remaining, list)
        or set(view_remaining) != set(context_remaining)
    ):
        failures.append("onbrec_remaining_effects_mismatch")
    if (
        isinstance(view_settled, list)
        and isinstance(view_remaining, list)
        and set(view_settled) & set(view_remaining)
    ):
        failures.append("onbrec_settled_remaining_overlap")

    view_claim = view.get("active_resume_claim")
    context_claim = context.get("active_resume_claim")
    if (view_claim is None) != (context_claim is None):
        failures.append("onbrec_claim_presence_mismatch")
    elif isinstance(view_claim, dict) and isinstance(context_claim, dict):
        for field in ("attempt_command_instance_id", "attempt_idempotency_key", "claim_generation"):
            if view_claim.get(field) != context_claim.get(field):
                failures.append("onbrec_claim_identity_mismatch")
                break
    elif view_claim is not None or context_claim is not None:
        failures.append("onbrec_claim_identity_mismatch")
    if view.get("observation_kind") == "authorized_resume_attempt" and isinstance(view_claim, dict):
        if (
            view.get("resume_attempt_command_instance_id") != view_claim.get("attempt_command_instance_id")
            or view.get("resume_attempt_idempotency_key") != view_claim.get("attempt_idempotency_key")
        ):
            failures.append("onbrec_claim_attempt_incoherent")

    if view.get("route_availability") != context.get("route_availability"):
        failures.append("onbrec_availability_diverged")

    retained_binding = _as_dict(context.get("reviewed_setup_binding"))
    if (
        view.get("reviewed_setup_plan_revision") != retained_binding.get("reviewed_setup_plan_revision")
        or view.get("approved_setup_plan_sha256") != retained_binding.get("approved_setup_plan_sha256")
    ):
        failures.append("onbrec_plan_echo_mismatch")

    return sorted(set(failures)), sorted(set(unevaluable))


def _resolve_project_pair_side(project_fixtures: Any, scenario: dict[str, Any]) -> tuple[Any, Any, str | None]:
    """Resolve (retained_context, original_result_or_None, unevaluable)."""

    cases = _as_dict(project_fixtures).get("valid")
    by_name = {}
    if isinstance(cases, list):
        for case in cases:
            if isinstance(case, dict) and isinstance(case.get("name"), str):
                value = case.get("value", case.get("record", case.get("instance")))
                by_name[case["name"]] = (case.get("definition"), value)
    project_case = scenario.get("project_case")
    if not isinstance(project_case, str) or project_case not in by_name:
        return None, None, f"project_case_unresolvable:{project_case}"
    definition, value = by_name[project_case]
    if not isinstance(value, dict):
        return None, None, f"project_case_not_an_object:{project_case}"
    side = scenario.get("project_side")
    if side == "round_trip":
        if definition != PROJECT_ROUND_TRIP_DEF:
            return None, None, f"project_case_not_a_round_trip:{project_case}"
        retained = value.get("retained_context")
        original = value.get("original_terminal_result")
        if not isinstance(retained, dict):
            return None, None, f"retained_context_absent:{project_case}"
        if not isinstance(original, dict):
            return None, None, f"original_result_absent:{project_case}"
        return retained, original, None
    if side == "standalone_context":
        if definition != "project_creation_recovery_context":
            return None, None, f"project_case_not_a_context:{project_case}"
        original_case = scenario.get("original_result_case")
        original_definition, original = by_name.get(original_case, (None, None))
        if original_definition != "project_action_result" or not isinstance(original, dict):
            return None, None, f"original_result_case_unresolvable:{original_case}"
        if original.get("command_instance_id") != value.get("original_command_instance_id") or original.get("action_id") != value.get("original_command_id"):
            return None, None, f"original_result_identity_mismatch:{original_case}"
        return value, original, None
    return None, None, f"unknown_project_side:{side}"


def validate_onboarding_recovery_pairs(
    onboarding_fixtures: Any,
    project_fixtures: Any,
    onboarding_by_name: dict[str, Any],
) -> list[dict[str, Any]]:
    """Evaluate paired projection/context scenarios. Onboarding pair only."""

    findings: list[dict[str, Any]] = []
    scenarios = _as_dict(onboarding_fixtures).get("paired_recovery_scenarios")
    if not isinstance(scenarios, list):
        return [{"code": "onboarding_recovery_scenarios_missing"}]
    for scenario in scenarios:
        if not isinstance(scenario, dict):
            findings.append({"code": "onboarding_recovery_scenario_not_an_object"})
            continue
        scenario_id = scenario.get("scenario_id", "unnamed")
        projection_case = scenario.get("projection_case")
        projection = onboarding_by_name.get(projection_case) if isinstance(projection_case, str) else None
        if not isinstance(projection, dict):
            findings.append({
                "code": "onboarding_recovery_pair_unevaluable",
                "scenario": scenario_id,
                "detail": f"projection_case_unresolvable:{projection_case}",
            })
            continue
        retained, original, problem = _resolve_project_pair_side(project_fixtures, scenario)
        if problem is not None:
            findings.append({
                "code": "onboarding_recovery_pair_unevaluable",
                "scenario": scenario_id,
                "detail": problem,
            })
            continue
        failures, unevaluable = onboarding_projection_pair_comparison(projection, retained, original)
        if unevaluable:
            findings.append({
                "code": "onboarding_recovery_pair_unevaluable",
                "scenario": scenario_id,
                "detail": ";".join(unevaluable),
            })
        if failures:
            findings.append({
                "code": "onboarding_recovery_pair_mismatch",
                "scenario": scenario_id,
                "semantic_failures": failures,
            })
    return findings
