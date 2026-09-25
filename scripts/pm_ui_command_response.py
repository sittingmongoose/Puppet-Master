"""Static central response/outcome/typed-result join oracle; no dispatcher exists.

The fixture harness supplies already-resolved request and record identities.
Native implementations must authenticate those resolutions and owner receipts;
shape validation or a caller-provided reference never grants that authority.
"""

from __future__ import annotations

from copy import deepcopy
from functools import lru_cache
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Resource

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))
from pm_full_thread_semantics import command_outcome_binding_failures, full_thread_semantic_failures
from pm_evidence_command_semantics import request_digest

RESPONSE_SCHEMA = "Plans/ui_command_response.schema.json"
OUTCOME_SCHEMA = "Plans/full_thread_runtime_contracts.schema.json"
SHARED_SCHEMA = "Plans/shared_runtime_command_contracts.schema.json"
BROWSER_SCHEMA = "Plans/section15_browser_program_contracts.schema.json"
SERVER_SCHEMA = "Plans/server_system_contracts.schema.json"
SOURCE_CONTROL_SCHEMA = "Plans/source_control_contracts.schema.json"
from pm_credential_source_add import COMMAND as CREDENTIAL_SOURCE_COMMAND, BINDING as CREDENTIAL_SOURCE_BINDING
from pm_backup_read_response import COMMANDS as BACKUP_READ_COMMANDS, BINDING as BACKUP_READ_BINDING
JJ_PUBLICATION_COMMANDS = frozenset(("cmd.jujutsu.git.push",))
JJ_PUBLICATION_BINDING = {"path":"Plans/jj_publication_selected.schema.json", "json_pointer":"#/$defs/result", "schema_id":"pm.jujutsu.publication_selected.result.v1"}
FORGE_LOG_COMMAND = "cmd.forge.pipeline.open_logs"
FORGE_LOG_BINDING = {"path":"Plans/forge_log_selection_contracts.schema.json", "json_pointer":"#/$defs/result", "schema_id":"pm.forge.log_selection.result.v1"}

from pm_git_pull_response import COMMANDS as GIT_PULL_COMMANDS, BINDING as GIT_PULL_BINDING
FORGE_REVIEW_COMMANDS = frozenset(("cmd.forge.review.approve", "cmd.forge.review.request_changes"))
FORGE_REVIEW_BINDING = {"path": "Plans/forge_review_decisions.schema.json", "json_pointer": "#/$defs/result", "schema_id": "pm.forge.review_decision.result.v1"}
GIT_THREE_COMMANDS = frozenset(("cmd.git.commit", "cmd.source_control.stash.create", "cmd.source_control.branch.create"))
GIT_THREE_BINDING = {"path": "Plans/git_selected_three.schema.json", "json_pointer": "#/$defs/result", "schema_id": "pm.source_control.git_selected.result.v1"}


@lru_cache(maxsize=None)
def module(name: str, filename: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / filename)
    loaded = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(loaded)
    return loaded


def contracts():
    return module("pm_response_contract_owners", "pm-new-contracts-verify.py")


@lru_cache(maxsize=None)
def schema(path: str) -> dict[str, Any]:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


@lru_cache(maxsize=1)
def registry():
    value = schema(RESPONSE_SCHEMA)
    return contracts().offline_schema_registry().with_resource(value["$id"], Resource.from_contents(value))


def owner_result_digest(value: dict[str, Any]) -> str:
    # Reuse the existing integer/string-only Case L canonical-JSON oracle.
    # General native RFC 8785 numeric coverage is not proved by this fixture.
    owner = module("pm_response_case_l_bytes", "pm-implementation-readiness.py")
    return hashlib.sha256(owner.jcs_bytes(value)).hexdigest()


def structural_failures(path: str, value: Any, pointer: str = "#") -> list[str]:
    doc = schema(path)
    selected = doc if pointer == "#" else {"$ref": pointer}
    validator = contracts().validator_for(doc, selected, registry())
    validator = validator.evolve(format_checker=FormatChecker())
    return [error.message for error in validator.iter_errors(value)]


def response_bundle_failures(bundle: dict[str, Any], *, resolve_owner_record=None,
                             canonical_request_digest=None, backup_read_admission=None,
                             backup_page_source=None, backup_source_custody=None,
                             backup_current_disclosure=None, forge_log_dependencies=None, credential_source_dependencies=None, forge_cancel_dependencies=None, forge_reply_dependencies=None, backup_lifecycle_dependencies=None, backup_delete_dependencies=None, forge_comment_dependencies=None, backup_export_dependencies=None, backup_rotation_dependencies=None, backup_reencrypt_dependencies=None, restore_preview_dependencies=None, forge_list_query_dependencies=None, forge_retry_dependencies=None, forge_run_dependencies=None, forge_create_selected_dependencies=None) -> list[str]:
    """Existing static bundle; Git-three additionally requires actual owner readers.

    Both callbacks are trusted native contracts, not issuer/caller authentication
    performed here. No new normalized-request caller or lineage fields exist.
    """
    response = bundle.get("response") or {}
    result = bundle.get("owner_result") or {}
    git_three = (response.get("command_id") in GIT_THREE_COMMANDS
                 or result.get("schema_id") == GIT_THREE_BINDING["schema_id"])
    forge_review = (response.get("command_id") in FORGE_REVIEW_COMMANDS
                    or result.get("schema_id") == FORGE_REVIEW_BINDING["schema_id"])
    backup_read = (response.get("command_id") in BACKUP_READ_COMMANDS
                   or result.get("schema_id") == BACKUP_READ_BINDING["schema_id"])
    jj_publication = (response.get("command_id") in JJ_PUBLICATION_COMMANDS
                      or result.get("schema_id") == JJ_PUBLICATION_BINDING["schema_id"])
    forge_log = (response.get("command_id") == FORGE_LOG_COMMAND
                 or result.get("schema_id") == FORGE_LOG_BINDING["schema_id"])
    credential_source = (response.get('command_id') == CREDENTIAL_SOURCE_COMMAND or result.get('schema_id') == CREDENTIAL_SOURCE_BINDING['schema_id'])
    forge_cancel = response.get('command_id') == 'cmd.forge.pipeline.cancel' or result.get('schema_id') == 'pm.forge.cancel_selected.result.v1'
    forge_reply = response.get('command_id') == 'cmd.forge.review.thread.reply' or result.get('schema_id') == 'pm.forge.thread_reply.result.v1'
    backup_lifecycle = response.get('command_id') in ('cmd.backup.destination.test','cmd.backup.destination.remove') or result.get('schema_id') == 'pm.backup.destination_lifecycle.result.v1'
    backup_delete = response.get('command_id') == 'cmd.backup.delete' or result.get('schema_id') == 'pm.backup.selected_delete.result.v1'
    git_pull = (response.get("command_id") in GIT_PULL_COMMANDS or result.get("schema_id") == GIT_PULL_BINDING["schema_id"])
    forge_comment = response.get('command_id') == 'cmd.forge.review.comment' or result.get('schema_id') == 'pm.forge.review_comment.result.v1'
    backup_export = response.get('command_id') == 'cmd.backup.export' or result.get('schema_id') == 'pm.backup.portable_export.result.v1'
    backup_rotation = response.get('command_id') == 'cmd.backup.recovery_key.rotate' or result.get('schema_id') == 'pm.backup.key_rotation.result.v1'
    backup_reencrypt = response.get('command_id') == 'cmd.backup.recovery_key.reencrypt' or result.get('schema_id') == 'pm.backup.reencrypt.result.v1'
    selected_preview = response.get('command_id') == 'cmd.restore.preview' or result.get('schema_id') == 'pm.restore.selected_preview.result.v1'
    forge_list_query = response.get('command_id') in ('cmd.forge.repository.list','cmd.forge.pipeline.list') or result.get('schema_id') == 'pm.forge.list_query.result.v1'
    forge_retry = response.get('command_id') == 'cmd.forge.pipeline.retry' or result.get('schema_id') == 'pm.forge.retry_selected.result.v1'
    forge_run = response.get('command_id') == 'cmd.forge.pipeline.run' or result.get('schema_id') == 'pm.forge.run_selected.result.v1'
    forge_create_selected = response.get('command_id') == 'cmd.forge.review.create' or result.get('schema_id') == 'pm.forge.review_create_selected.result.v1'
    if not git_three and not forge_review and not backup_read and not jj_publication and not forge_log and not credential_source and not forge_cancel and not forge_reply and not backup_lifecycle and not backup_delete and not git_pull and not forge_comment and not backup_export and not backup_rotation and not backup_reencrypt and not selected_preview and not forge_list_query and not forge_retry and not forge_run and not forge_create_selected:
        return _response_bundle_failures(bundle)
    snapshot = deepcopy(bundle)
    failures = _response_bundle_failures(snapshot, resolve_owner_record=resolve_owner_record,
                                         canonical_request_digest=canonical_request_digest,
                                         backup_read_admission=backup_read_admission,
                                         backup_page_source=backup_page_source,
                                         backup_source_custody=backup_source_custody,
                                         backup_current_disclosure=backup_current_disclosure,
                                         forge_log_dependencies=forge_log_dependencies, forge_list_query_dependencies=forge_list_query_dependencies, restore_preview_dependencies=restore_preview_dependencies, backup_reencrypt_dependencies=backup_reencrypt_dependencies, backup_rotation_dependencies=backup_rotation_dependencies, backup_export_dependencies=backup_export_dependencies, forge_comment_dependencies=forge_comment_dependencies, backup_delete_dependencies=backup_delete_dependencies, backup_lifecycle_dependencies=backup_lifecycle_dependencies, forge_reply_dependencies=forge_reply_dependencies, forge_cancel_dependencies=forge_cancel_dependencies, forge_create_selected_dependencies=forge_create_selected_dependencies, forge_run_dependencies=forge_run_dependencies, forge_retry_dependencies=forge_retry_dependencies,
                                         credential_source_dependencies=credential_source_dependencies)
    if bundle != snapshot:
        failures.append("git_pull_bundle_mutated_during_resolution" if git_pull else "credential_bundle_mutated_during_resolution" if credential_source else "backup_read_bundle_mutated_during_resolution" if backup_read else "jj_publication_bundle_mutated_during_resolution" if jj_publication else "forge_log_bundle_mutated_during_resolution" if forge_log else "forge_bundle_mutated_during_resolution" if forge_review else "git3_bundle_mutated_during_resolution")
    return sorted(set(failures))


def _response_bundle_failures(bundle: dict[str, Any], *, resolve_owner_record=None,
                              canonical_request_digest=None, backup_read_admission=None,
                              backup_page_source=None, backup_source_custody=None,
                              backup_current_disclosure=None, forge_log_dependencies=None, credential_source_dependencies=None, forge_cancel_dependencies=None, forge_reply_dependencies=None, backup_lifecycle_dependencies=None, backup_delete_dependencies=None, forge_comment_dependencies=None, backup_export_dependencies=None, backup_rotation_dependencies=None, backup_reencrypt_dependencies=None, restore_preview_dependencies=None, forge_list_query_dependencies=None, forge_retry_dependencies=None, forge_run_dependencies=None, forge_create_selected_dependencies=None) -> list[str]:
    """Validate independently owned records and then their exact binding.

    normalized_request is a fixture snapshot of the authenticated dispatcher
    request binding, not a new product request/envelope or actor assertion.
    """
    response = bundle.get("response")
    if structural_failures(RESPONSE_SCHEMA, response):
        return ["response_schema"]
    request = bundle.get("normalized_request", {})
    failures: list[str] = replay_failures(response, bundle.get("original_response"))
    for field in ("request_ref", "command_id", "command_instance_id"):
        if response[field] != request.get(field):
            failures.append("response_request_" + field + "_mismatch")
    outcome, owner_result = bundle.get("outcome"), bundle.get("owner_result")
    if response["command_id"] == FORGE_LOG_COMMAND:
        if response["response_kind"] != "owner_operation" or response.get("owner_result_schema_ref") != FORGE_LOG_BINDING:
            failures.append("forge_log_owner_binding")
    if response.get('command_id') == 'cmd.forge.pipeline.cancel':
        if response['response_kind'] != 'owner_operation' or response.get('owner_result_schema_ref') != {'path':'Plans/forge_cancel_selected_contracts.schema.json','json_pointer':'#/$defs/result','schema_id':'pm.forge.cancel_selected.result.v1'}:
            failures.append('forge_cancel_owner_binding')
    if response.get('command_id') == 'cmd.forge.review.thread.reply':
        if response['response_kind'] != 'owner_operation' or response.get('owner_result_schema_ref') != {'path':'Plans/forge_thread_reply_contracts.schema.json','json_pointer':'#/$defs/result','schema_id':'pm.forge.thread_reply.result.v1'}:
            failures.append('forge_reply_owner_binding')
    if response.get('command_id') in ('cmd.backup.destination.test','cmd.backup.destination.remove'):
        if response['response_kind'] != 'owner_operation' or response.get('owner_result_schema_ref') != {'path':'Plans/backup_destination_lifecycle_contracts.schema.json','json_pointer':'#/$defs/result','schema_id':'pm.backup.destination_lifecycle.result.v1'}:
            failures.append('backup_lifecycle_owner_binding')
    if response.get('command_id') == 'cmd.backup.delete':
        if response['response_kind'] != 'owner_operation' or response.get('owner_result_schema_ref') != {'path':'Plans/backup_selected_delete_contracts.schema.json','json_pointer':'#/$defs/result','schema_id':'pm.backup.selected_delete.result.v1'}:
            failures.append('backup_delete_owner_binding')
    if response.get('command_id') == 'cmd.forge.review.comment':
        if response['response_kind'] != 'owner_operation' or response.get('owner_result_schema_ref') != {'path':'Plans/forge_review_comment_contracts.schema.json','json_pointer':'#/$defs/result','schema_id':'pm.forge.review_comment.result.v1'}:
            failures.append('forge_comment_owner_binding')
    if response.get('command_id') == 'cmd.backup.export':
        if response['response_kind'] != 'owner_operation' or response.get('owner_result_schema_ref') != {'path':'Plans/backup_portable_export_contracts.schema.json','json_pointer':'#/$defs/result','schema_id':'pm.backup.portable_export.result.v1'}:
            failures.append('backup_export_owner_binding')
    if response.get('command_id') == 'cmd.backup.recovery_key.rotate':
        if response['response_kind'] != 'owner_operation' or response.get('owner_result_schema_ref') != {'path':'Plans/backup_key_rotation_contracts.schema.json','json_pointer':'#/$defs/result','schema_id':'pm.backup.key_rotation.result.v1'}:
            failures.append('backup_rotation_owner_binding')
    if response.get('command_id') == 'cmd.backup.recovery_key.reencrypt':
        if response['response_kind'] != 'owner_operation' or response.get('owner_result_schema_ref') != {'path':'Plans/backup_reencrypt_contracts.schema.json','json_pointer':'#/$defs/result','schema_id':'pm.backup.reencrypt.result.v1'}:
            failures.append('backup_reencrypt_owner_binding')
    if response.get('command_id') == 'cmd.restore.preview':
        if response['response_kind'] != 'owner_operation' or response.get('owner_result_schema_ref') != {'path':'Plans/restore_selected_preview_contracts.schema.json','json_pointer':'#/$defs/result','schema_id':'pm.restore.selected_preview.result.v1'}:
            failures.append('restore_preview_owner_binding')
    if response.get('command_id') in ('cmd.forge.repository.list','cmd.forge.pipeline.list'):
        if response['response_kind'] != 'owner_operation' or response.get('owner_result_schema_ref') != {'path':'Plans/forge_list_query_contracts.schema.json','json_pointer':'#/$defs/result','schema_id':'pm.forge.list_query.result.v1'}:
            failures.append('forge_list_query_owner_binding')
    if response.get('command_id') == 'cmd.forge.pipeline.retry':
        if response['response_kind'] != 'owner_operation' or response.get('owner_result_schema_ref') != {'path':'Plans/forge_retry_selected_contracts.schema.json','json_pointer':'#/$defs/result','schema_id':'pm.forge.retry_selected.result.v1'}:
            failures.append('forge_retry_owner_binding')
    if response.get('command_id') == 'cmd.forge.pipeline.run':
        if response['response_kind'] != 'owner_operation' or response.get('owner_result_schema_ref') != {'path':'Plans/forge_run_selected_contracts.schema.json','json_pointer':'#/$defs/result','schema_id':'pm.forge.run_selected.result.v1'}:
            failures.append('forge_run_owner_binding')
    if response.get('command_id') == 'cmd.forge.review.create':
        if response['response_kind'] != 'owner_operation' or response.get('owner_result_schema_ref') != {'path':'Plans/forge_review_create_selected_contracts.schema.json','json_pointer':'#/$defs/result','schema_id':'pm.forge.review_create_selected.result.v1'}:
            failures.append('forge_create_selected_owner_binding')
    if response["response_kind"] != "owner_operation":
        if outcome is not None or owner_result is not None:
            failures.append("non_operation_has_owner_records")
        if any(request.get(field) is not None for field in ("operation_id", "owner_identity")):
            failures.append("non_operation_fabricated_scope")
        if response["response_kind"] == "local_projection":
            commands = schema(SHARED_SCHEMA)["$defs"]["canonical_command_id"]["enum"]
            scm_commands = schema(SOURCE_CONTROL_SCHEMA)["$defs"]["source_control_command_id"]["enum"]
            if response["command_id"] in commands or response["command_id"] in scm_commands or response["command_id"] in GIT_THREE_COMMANDS or response["command_id"] in FORGE_REVIEW_COMMANDS or response["command_id"] == CREDENTIAL_SOURCE_COMMAND or response["command_id"] in BACKUP_READ_COMMANDS or response["command_id"] in JJ_PUBLICATION_COMMANDS or response["command_id"] in GIT_PULL_COMMANDS:
                failures.append("durable_command_disguised_as_local_projection")
        return sorted(set(failures))
    if structural_failures(OUTCOME_SCHEMA, outcome, "#/$defs/CommandOutcomeRecord"):
        return sorted(set(failures + ["outcome_schema"]))
    failures.extend(full_thread_semantic_failures("CommandOutcomeRecord", outcome))
    failures.extend(command_outcome_binding_failures(response, outcome, bundle.get("resolved_outcome_ref")))
    if response["owner_identity"] != outcome["identity"]:
        failures.append("response_outcome_scope_mismatch")
    if response["operation_id"] != request.get("operation_id") or response["owner_identity"] != request.get("owner_identity"):
        failures.append("response_request_operation_scope_mismatch")
    for field in ("payload_sha256", "idempotency_key", "target_generation", "dispatch_frame_id"):
        if outcome[field] != request.get(field):
            failures.append("outcome_request_" + field + "_mismatch")
    expected = {
        "accepted": ("accepted", {"pending"}),
        "acknowledged": ("accepted", {"pending"}),
        "executing": ("accepted", {"pending"}),
        "succeeded": ("accepted", {"succeeded", "no_op"}),
        "failed": ("accepted", {"failed"}),
        "cancelled": ("accepted", {"cancelled"}),
        "rejected": ("rejected", {None}),
        "terminal_unknown": ("accepted", {"recovery_required"}),
    }[outcome["outcome"]]
    if response["ack_status"] != expected[0] or response["result_status"] not in expected[1]:
        failures.append("acknowledgement_is_not_terminal_success")
    if outcome["outcome"] in {"accepted", "acknowledged", "executing"}:
        if outcome["result_receipt_ref"] is not None:
            failures.append("nonterminal_outcome_has_terminal_receipt")
        if response["receipt_ref"] not in (None, outcome["acknowledgement_receipt_ref"]):
            failures.append("pending_response_receipt_mismatch")
    elif response["receipt_ref"] != outcome["result_receipt_ref"]:
        failures.append("terminal_response_receipt_mismatch")
    for field in ("owner_result_ref", "owner_result_schema_ref"):
        if response[field] != outcome[field]:
            failures.append("outcome_" + field + "_mismatch")
    if response["command_id"] == CREDENTIAL_SOURCE_COMMAND and response["owner_result_schema_ref"] != CREDENTIAL_SOURCE_BINDING:
        failures.append("credential_owner_result_binding")
    if response["command_id"] in BACKUP_READ_COMMANDS and response["owner_result_schema_ref"] != BACKUP_READ_BINDING:
        failures.append("backup_read_owner_result_binding")
    if response["command_id"] in JJ_PUBLICATION_COMMANDS and response["owner_result_schema_ref"] != JJ_PUBLICATION_BINDING:
        failures.append("jj_publication_owner_result_binding")
    if response["command_id"] in GIT_PULL_COMMANDS and response["owner_result_schema_ref"] != GIT_PULL_BINDING:
        failures.append("git_pull_owner_result_binding")
    if response["command_id"] in FORGE_REVIEW_COMMANDS and response["owner_result_schema_ref"] != FORGE_REVIEW_BINDING:
        failures.append("forge_review_owner_result_binding")
    if response["command_id"] in GIT_THREE_COMMANDS and response["owner_result_schema_ref"] != GIT_THREE_BINDING:
        failures.append("git3_owner_result_binding")
    if response["owner_result_ref"] is None:
        if owner_result is not None:
            failures.append("unbound_owner_result")
    else:
        if response["owner_result_ref"] != bundle.get("resolved_owner_result_ref"):
            failures.append("owner_result_reference_mismatch")
        binding = response["owner_result_schema_ref"]
        if response["command_id"] in schema(SOURCE_CONTROL_SCHEMA)["$defs"]["source_control_command_id"]["enum"]:
            if binding != {"path": SOURCE_CONTROL_SCHEMA,
                           "json_pointer": "#/$defs/source_control_command_result",
                           "schema_id": "pm.source_control.command_result.v1"}:
                failures.append("scm_owner_result_binding")
        allowed = {path for path, _ in contracts().CONTRACT_PAIRS}
        if binding["path"] not in allowed:
            failures.append("unadmitted_owner_result_schema")
        elif not isinstance(owner_result, dict) or not resolvable_owner_result(binding, owner_result):
            failures.append("owner_result_schema")
        else:
            if owner_result.get("schema_id", owner_result.get("record_type")) != binding["schema_id"]:
                failures.append("owner_result_schema_identity_mismatch")
            definition = binding["json_pointer"].rsplit("/", 1)[-1] if binding["json_pointer"] != "#" else "<root>"
            failures.extend(contracts().contract_semantic_failures(binding["path"], definition, owner_result))
            try:
                if outcome["owner_result_sha256"] != owner_result_digest(owner_result):
                    failures.append("owner_result_digest_mismatch")
            except (TypeError, ValueError):
                failures.append("owner_result_outside_digest_oracle_domain")
            # Dispatch on the typed record, not merely its containing file:
            # each owner file also contains other results, errors and aliases.
            if owner_result.get("schema_id") == "pm.shared_runtime.command_result.v1":
                failures.extend(shared_owner_failures(response, outcome, owner_result))
            elif owner_result.get("record_kind") == "browser_command_result":
                failures.extend(browser_owner_failures(response, outcome, owner_result))
            elif owner_result.get("schema_id") == CREDENTIAL_SOURCE_BINDING["schema_id"]:
                from pm_credential_source_add import response_failures as credential_source_response_failures
                dependencies = credential_source_dependencies if isinstance(credential_source_dependencies, dict) else {}
                failures.extend(credential_source_response_failures(bundle,
                    resolve_record=resolve_owner_record, canonical_request_digest=canonical_request_digest,
                    verify_original_admission=dependencies.get('verify_original_admission'),
                    verify_secure_interaction=dependencies.get('verify_secure_interaction'),
                    verify_scope_authority=dependencies.get('verify_scope_authority'),
                    check_current_disclosure=dependencies.get('check_current_disclosure'),canon_root=ROOT))
            elif owner_result.get("schema_id") == BACKUP_READ_BINDING["schema_id"]:
                from pm_backup_read_response import response_failures as backup_read_response_failures
                failures.extend(backup_read_response_failures(bundle,
                    resolve_record=resolve_owner_record, canonical_request_digest=canonical_request_digest,
                    verify_original_admission=backup_read_admission, verify_page_source=backup_page_source,
                    verify_source_custody=backup_source_custody, check_current_disclosure=backup_current_disclosure,
                    canon_root=ROOT))
            elif owner_result.get("schema_id") == JJ_PUBLICATION_BINDING["schema_id"]:
                if "delivery_return_context" not in bundle:
                    failures.append("jj_publication_delivery_owner_value_missing")
                from pm_jj_publication_response import response_failures as jj_publication_response_failures
                failures.extend(jj_publication_response_failures(
                    response, outcome, owner_result, bundle.get("owner_request"), request,
                    bundle.get("original_binding_ref"), bundle.get("delivery_return_context"),
                    resolve_record=resolve_owner_record, canonical_request_digest=canonical_request_digest,
                    canon_root=ROOT, registry=registry()))
            elif owner_result.get("schema_id") == FORGE_LOG_BINDING["schema_id"]:
                from pm_forge_log_selection_semantics import response_failures as log_response_failures
                failures.extend(log_response_failures(bundle, forge_log_dependencies))
            elif owner_result.get('schema_id') == 'pm.forge.cancel_selected.result.v1':
                from pm_forge_cancel_selected_semantics import response_failures as cancel_response_failures
                failures.extend(cancel_response_failures(bundle, forge_cancel_dependencies))
            elif owner_result.get('schema_id') == 'pm.forge.thread_reply.result.v1':
                from pm_forge_thread_reply_semantics import response_failures as reply_response_failures
                failures.extend(reply_response_failures(bundle, forge_reply_dependencies))
            elif owner_result.get('schema_id') == 'pm.backup.destination_lifecycle.result.v1':
                from pm_backup_destination_lifecycle import response_failures as lifecycle_response_failures
                failures.extend(lifecycle_response_failures(bundle, backup_lifecycle_dependencies))
            elif owner_result.get('schema_id') == 'pm.backup.selected_delete.result.v1':
                from pm_backup_selected_delete import response_failures as delete_response_failures
                failures.extend(delete_response_failures(bundle, backup_delete_dependencies))
            elif owner_result.get("schema_id") == GIT_PULL_BINDING["schema_id"]:
                if "delivery_return_context" not in bundle:
                    failures.append("git_pull_delivery_owner_value_missing")
                from pm_git_pull_response import response_failures as git_pull_response_failures
                failures.extend(git_pull_response_failures(
                    response, outcome, owner_result, bundle.get("owner_request"), request,
                    bundle.get("original_binding_ref"), bundle.get("delivery_return_context"),
                    resolve_record=resolve_owner_record, canonical_request_digest=canonical_request_digest,
                    canon_root=ROOT, registry=registry()))
            elif owner_result.get('schema_id') == 'pm.forge.review_comment.result.v1':
                from pm_forge_review_comment_semantics import response_failures as comment_response_failures
                failures.extend(comment_response_failures(bundle, forge_comment_dependencies))
            elif owner_result.get('schema_id') == 'pm.backup.portable_export.result.v1':
                from pm_backup_portable_export import response_failures as export_response_failures
                failures.extend(export_response_failures(bundle, backup_export_dependencies))
            elif owner_result.get('schema_id') == 'pm.backup.key_rotation.result.v1':
                from pm_backup_key_rotation import response_failures as rotation_response_failures
                failures.extend(rotation_response_failures(bundle, backup_rotation_dependencies))
            elif owner_result.get('schema_id') == 'pm.backup.reencrypt.result.v1':
                from pm_backup_reencrypt import response_failures as reencrypt_response_failures
                failures.extend(reencrypt_response_failures(bundle, backup_reencrypt_dependencies))
            elif owner_result.get('schema_id') == 'pm.restore.selected_preview.result.v1':
                from pm_restore_selected_preview import response_failures as preview_response_failures
                failures.extend(preview_response_failures(bundle, restore_preview_dependencies))
            elif owner_result.get('schema_id') == 'pm.forge.list_query.result.v1':
                from pm_forge_list_query import response_failures as list_response_failures
                failures.extend(list_response_failures(bundle, forge_list_query_dependencies))
            elif owner_result.get('schema_id') == 'pm.forge.retry_selected.result.v1':
                from pm_forge_retry_selected_semantics import response_failures as retry_response_failures
                failures.extend(retry_response_failures(bundle, forge_retry_dependencies))
            elif owner_result.get('schema_id') == 'pm.forge.run_selected.result.v1':
                from pm_forge_run_selected_semantics import response_failures as run_response_failures
                failures.extend(run_response_failures(bundle, forge_run_dependencies))
            elif owner_result.get('schema_id') == 'pm.forge.review_create_selected.result.v1':
                from pm_forge_review_create_selected_semantics import response_failures as create_response_failures
                failures.extend(create_response_failures(bundle, forge_create_selected_dependencies))
            elif owner_result.get("schema_id") == FORGE_REVIEW_BINDING["schema_id"]:
                if "delivery_return_context" not in bundle:
                    failures.append("forge_delivery_owner_value_missing")
                from pm_forge_review_response import response_failures as forge_response_failures
                failures.extend(forge_response_failures(
                    response, outcome, owner_result, bundle.get("owner_request"), request,
                    bundle.get("original_binding_ref"), bundle.get("delivery_return_context"),
                    resolve_record=resolve_owner_record, canonical_request_digest=canonical_request_digest,
                    canon_root=ROOT, registry=registry()))
            elif owner_result.get("schema_id") == GIT_THREE_BINDING["schema_id"]:
                from pm_git_selected_response import response_failures as git_three_response_failures
                failures.extend(git_three_response_failures(
                    response, outcome, owner_result, bundle.get("owner_request"), request,
                    resolve_record=resolve_owner_record,
                    canonical_request_digest=canonical_request_digest, canon_root=ROOT))
            elif owner_result.get("schema_id") == "pm.source_control.command_result.v1":
                failures.extend(source_control_owner_failures(response, outcome, owner_result, bundle.get("owner_request")))
            elif owner_result.get("record_type") in {"server.command.result.v1", "server.owner_command.result.v1"}:
                failures.extend(server_owner_failures(response, outcome, owner_result))
            elif owner_result.get("record_kind") in {"TestingSessionCommandResult", "ArtifactRecordingCommandResult"}:
                failures.extend(evidence_owner_failures(response, outcome, owner_result, bundle.get("owner_request")))
            elif response["command_id"] == "cmd.project.new_github_repo":
                from pm_project_forge_contract import response_failures as forge_response_failures
                failures.extend(forge_response_failures(response, outcome, owner_result, bundle.get("owner_request"), bundle.get("owner_snapshot")))
            for field in ("command_id", "command_instance_id", "operation_id"):
                if field in owner_result and owner_result[field] != response[field]:
                    failures.append("typed_owner_" + field + "_mismatch")
    return sorted(set(failures))


def replay_failures(response, original):
    failures = []
    if response["replayed"]:
        if not isinstance(original, dict) or structural_failures(RESPONSE_SCHEMA, original):
            failures.append("replay_original_response_missing")
        else:
            if response["original_dispatch_id"] != original["dispatch_id"]:
                failures.append("replay_original_dispatch_mismatch")
            stable = ("command_id", "command_instance_id", "request_ref", "response_kind", "operation_id",
                      "owner_identity", "command_outcome_ref", "owner_result_ref", "owner_result_schema_ref",
                      "ack_status", "result_status", "receipt_ref", "event_refs", "error")
            if any(response[field] != original[field] for field in stable):
                failures.append("replay_changed_original_result_identity")
    return sorted(set(failures))


def resolvable_owner_result(binding, owner_result):
    """Unknown definitions or unresolvable refs reject; no network fallback."""
    pointer = binding["json_pointer"]
    if pointer != "#" and pointer.rsplit("/", 1)[-1] not in schema(binding["path"]).get("$defs", {}):
        return False
    try:
        return not structural_failures(binding["path"], owner_result, pointer)
    except Exception:  # Invalid schema resolution is a fail-closed contract input.
        return False


def shared_owner_failures(response, outcome, owner_result):
    failures = command_outcome_binding_failures(owner_result, outcome, response["command_outcome_ref"])
    expected = {
        "accepted": {"accepted", "acknowledged", "executing"}, "no_change": {"succeeded"},
        "blocked": {"rejected"}, "failed": {"failed"}, "cancelled": {"cancelled"},
        "recovery_required": {"terminal_unknown"},
    }.get(owner_result.get("outcome"), set())
    if outcome["outcome"] not in expected:
        failures.append("shared_owner_outcome_mismatch")
    if (owner_result.get("outcome") == "no_change") != (response["result_status"] == "no_op"):
        failures.append("shared_owner_no_change_mismatch")
    terminal = owner_result.get("terminal_owner_result_ref")
    if owner_result.get("outcome") == "accepted" and terminal is not None:
        failures.append("accepted_cannot_claim_terminal_owner_result")
    if owner_result.get("outcome") in {"no_change", "cancelled"} and terminal is None:
        failures.append("shared_owner_terminal_receipt_missing")
    if terminal is not None and (terminal != outcome["result_receipt_ref"] or terminal not in owner_result["receipt_refs"]):
        failures.append("shared_owner_terminal_receipt_mismatch")
    if owner_result.get("replayed") and owner_result.get("original_operation_id") != owner_result.get("operation_id"):
        failures.append("replayed_result_minted_new_operation_id")
    return failures


def server_owner_failures(response, outcome, owner_result):
    failures = []
    if owner_result["command_id"] != response["command_id"] or owner_result["command_instance_id"] != response["command_instance_id"]:
        failures.append("server_owner_command_mismatch")
    if owner_result["server_id"] != outcome["identity"]["server_id"]:
        failures.append("server_owner_scope_mismatch")
    expected = {"accepted": {"accepted", "acknowledged", "executing"}, "succeeded": {"succeeded"}, "no_change": {"succeeded"}}[owner_result["status"]]
    if outcome["outcome"] not in expected or (owner_result["status"] == "no_change") != (response["result_status"] == "no_op"):
        failures.append("server_owner_outcome_mismatch")
    if owner_result["status"] != "accepted" and owner_result["receipt_id"] != outcome["result_receipt_ref"]:
        failures.append("server_owner_result_receipt_mismatch")
    return failures


def evidence_owner_failures(response, outcome, owner_result, owner_request):
    failures = []
    family, prefix = ("testing_session", "TestingSession") if owner_result["record_kind"] == "TestingSessionCommandResult" else ("artifact_recording", "ArtifactRecording")
    path = "Plans/" + family + "_command_contracts.schema.json"
    if structural_failures(path, owner_request, "#/$defs/" + prefix + "CommandRequest"):
        return ["evidence_owner_request_schema"]
    failures.extend(contracts().contract_semantic_failures(path, prefix + "CommandRequest", owner_request))
    if any(owner_request[field] != owner_result[field] for field in ("command_id", "command_instance_id", "context")):
        failures.append("evidence_owner_request_result_mismatch")
    if request_digest(owner_request) != outcome["payload_sha256"] or owner_request["idempotency"]["idempotency_key"] != outcome["idempotency_key"]:
        failures.append("evidence_owner_request_outcome_binding_mismatch")
    expected = {"accepted": {"accepted", "acknowledged", "executing"}, "completed": {"succeeded"},
                "no_change": {"succeeded"}, "blocked": {"rejected"}, "failed": {"failed"},
                "cancelled": {"cancelled"}, "effect_unknown": {"terminal_unknown"}}
    if outcome["outcome"] not in expected[owner_result["status"]]:
        failures.append("evidence_owner_outcome_mismatch")
    if (owner_result["status"] == "no_change") != (response["result_status"] == "no_op"):
        failures.append("evidence_owner_no_change_mismatch")
    keys = {"project_id": "project_id", "home_server_id": "project_home_server_id",
            "execution_host_id": "execution_host_id", "execution_environment_id": "execution_environment_id",
            "source_location_id": "source_location_id", "thread_id": "thread_id",
            "attempt_id": "attempt_id", "topology_generation": "topology_generation"}
    if any(owner_result["context"][source] != outcome["identity"].get(target) for source, target in keys.items()):
        failures.append("evidence_owner_scope_mismatch")
    if owner_result["request_binding_sha256"] != outcome["payload_sha256"]:
        failures.append("evidence_owner_payload_mismatch")
    if owner_result["receipt_ref"] != outcome["result_receipt_ref"]:
        failures.append("evidence_owner_receipt_mismatch")
    if owner_result["replayed"] and not response["replayed"]:
        failures.append("evidence_owner_replay_not_projected")
    return failures


def source_control_owner_failures(response, outcome, owner_result, owner_request):
    """Consume SCS-003's exact request/scope and terminal receipt contract.

    The normalized request/hash and retained records are fixture resolutions.
    This does not authenticate policy, receipt storage or backend execution.
    """
    if structural_failures(SOURCE_CONTROL_SCHEMA, owner_request, "#/$defs/source_control_command_request"):
        return ["scm_owner_request_schema"]
    failures = []
    scope = owner_result["scope"]
    if scope["command_id"] != response["command_id"]:
        failures.append("scm_owner_command_mismatch")
    if (owner_request["scope"] != scope
            or owner_request["command_instance_id"] != owner_result["command_instance_id"]
            or owner_request["idempotency_key"] != outcome["idempotency_key"]):
        failures.append("scm_owner_request_binding_mismatch")
    if (owner_request.get("return_context") != owner_result.get("return_context")
            or ("return_context" in owner_request) != ("return_context" in owner_result)):
        failures.append("scm_owner_return_context_mismatch")
    lineage, identity = scope["lineage"], outcome["identity"]
    fields = ("project_id", "project_home_server_id", "execution_host_id",
              "execution_environment_id", "source_location_id", "topology_generation")
    if (identity["scope_kind"] != "project"
            or any(lineage[field] != identity.get(field) for field in fields)
            or any(lineage.get(source) != identity.get(target)
                   for source, target in (("plan_id", "named_plan_id"), ("goal_id", "goal_id")))):
        failures.append("scm_owner_scope_mismatch")
    expected = {"succeeded": "succeeded", "blocked": "rejected", "failed": "failed",
                "cancelled": "cancelled", "recovery_required": "terminal_unknown",
                "effect_unknown": "terminal_unknown"}[owner_result["outcome"]]
    if owner_result["effect_state"] == "effect_unknown":
        expected = "terminal_unknown"
    # no_effect can describe a successful read; it is not a no-change verdict.
    if outcome["outcome"] != expected or response["result_status"] == "no_op":
        failures.append("scm_owner_outcome_mismatch")
    if owner_result["operation_receipt_ref"] != outcome["result_receipt_ref"]:
        failures.append("scm_owner_receipt_mismatch")
    return failures


def browser_owner_failures(response, outcome, owner_result):
    failures = []
    if owner_result.get("record_kind") != "browser_command_result":
        return ["browser_owner_not_command_result"]
    scope = owner_result["scope"]
    if scope.get("command_id") != response["command_id"] or owner_result["command_instance_id"] != response["command_instance_id"]:
        failures.append("browser_owner_command_mismatch")
    expected = {"succeeded": "succeeded", "blocked": "rejected", "failed": "failed",
                "cancelled": "cancelled", "effect_unknown": "terminal_unknown"}[owner_result["outcome"]]
    if outcome["outcome"] != expected or response["result_status"] == "no_op":
        failures.append("browser_owner_outcome_mismatch")
    if owner_result["effect_state"] == "effect_unknown" and outcome["outcome"] != "terminal_unknown":
        failures.append("browser_unknown_effects_laundered")
    lineage = scope.get("lineage", {})
    identity = outcome["identity"]
    keys = {"project_id": "project_id", "home_server_id": "project_home_server_id",
            "execution_host_id": "execution_host_id", "execution_environment_id": "execution_environment_id",
            "source_location_id": "source_location_id", "thread_id": "thread_id"}
    if any(lineage.get(source) != identity.get(target) for source, target in keys.items()):
        failures.append("browser_owner_scope_mismatch")
    if outcome["result_receipt_ref"] is not None and outcome["result_receipt_ref"] not in owner_result["result_refs"]:
        failures.append("browser_owner_result_receipt_mismatch")
    return failures
