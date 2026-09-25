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
from pm_git_stash_apply_response import COMMANDS as GIT_STASH_APPLY_COMMANDS, BINDING as GIT_STASH_APPLY_BINDING
from pm_jj_recovery_response import COMMANDS as JJ_RECOVERY_COMMANDS, BINDING as JJ_RECOVERY_BINDING
from pm_source_control_selected_response import COMMANDS as SCM_SELECTED_COMMANDS, BINDING as SCM_SELECTED_BINDING
FORGE_REVIEW_COMMANDS = frozenset(("cmd.forge.review.approve", "cmd.forge.review.request_changes"))
FORGE_REVIEW_BINDING = {"path": "Plans/forge_review_decisions.schema.json", "json_pointer": "#/$defs/result", "schema_id": "pm.forge.review_decision.result.v1"}
GIT_THREE_COMMANDS = frozenset(("cmd.git.commit", "cmd.source_control.stash.create", "cmd.source_control.branch.create"))
GIT_THREE_BINDING = {"path": "Plans/git_selected_three.schema.json", "json_pointer": "#/$defs/result", "schema_id": "pm.source_control.git_selected.result.v1"}
USAGE_COMMANDS = frozenset(("cmd.usage.refresh", "cmd.usage.export"))
USAGE_SCHEMA_IDS = frozenset(("pm.usage.command_result.v1", "pm.usage.command_result.v2",
                              "pm.usage.ledger_query.result.v1"))
USAGE_REQUEST_SCHEMA_IDS = frozenset(("pm.usage.command_request.v1", "pm.usage.command_request.v2",
                                      "pm.usage.ledger_query.request.v1"))
LEDGER_SCHEMA_PATH = "Plans/usage_ledger_query_contracts.schema.json"
LEDGER_RESULT_SCHEMA_ID = "pm.usage.ledger_query.result.v1"
LEDGER_REQUEST_SCHEMA_ID = "pm.usage.ledger_query.request.v1"
LEDGER_RESULT_POINTER = "#/$defs/ledger_result"
LEDGER_REQUEST_POINTER = "#/$defs/ledger_request"
LEDGER_PROFILE = "usage_ledger_selection.v1"


def usage_binding_allowed(command_id: str, binding: Any) -> bool:
    if not isinstance(binding, dict):
        return False
    pointer = "#/$defs/usage_refresh_result" if command_id == "cmd.usage.refresh" else "#/$defs/usage_export_result" if command_id == "cmd.usage.export" else None
    if pointer is None:
        return False
    return binding in (
        {"path": "Plans/usage_command_contracts.schema.json", "json_pointer": pointer, "schema_id": "pm.usage.command_result.v1"},
        {"path": "Plans/usage_quota_command_contracts.schema.json", "json_pointer": pointer, "schema_id": "pm.usage.command_result.v2"},
        {"path": LEDGER_SCHEMA_PATH, "json_pointer": LEDGER_RESULT_POINTER, "schema_id": LEDGER_RESULT_SCHEMA_ID},
    )


def usage_request_pointer(command_id: str) -> str:
    return "#/$defs/usage_refresh_request" if command_id == "cmd.usage.refresh" else "#/$defs/usage_export_request"


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
                             backup_current_disclosure=None, forge_log_dependencies=None, credential_source_dependencies=None, forge_cancel_dependencies=None, forge_reply_dependencies=None, backup_lifecycle_dependencies=None, backup_delete_dependencies=None, forge_comment_dependencies=None, backup_export_dependencies=None, backup_rotation_dependencies=None, backup_reencrypt_dependencies=None, restore_preview_dependencies=None, forge_list_query_dependencies=None, forge_retry_dependencies=None, forge_run_dependencies=None, forge_create_selected_dependencies=None, forge_checkout_dependencies=None) -> list[str]:
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
    forge_checkout = response.get('command_id') == 'cmd.forge.review.checkout' or result.get('schema_id') == 'pm.forge.review_checkout_selected.result.v1'
    jj_recovery = (response.get("command_id") in JJ_RECOVERY_COMMANDS or result.get("schema_id") == JJ_RECOVERY_BINDING["schema_id"])
    scm_selected = (response.get("command_id") in SCM_SELECTED_COMMANDS
                    or result.get("schema_id") == SCM_SELECTED_BINDING["schema_id"])
    git_stash_apply = (response.get("command_id") in GIT_STASH_APPLY_COMMANDS
                       or result.get("schema_id") == GIT_STASH_APPLY_BINDING["schema_id"])
    usage = (response.get("command_id") in USAGE_COMMANDS or result.get("schema_id") in USAGE_SCHEMA_IDS)
    if not git_three and not forge_review and not backup_read and not jj_publication and not forge_log and not credential_source and not forge_cancel and not forge_reply and not backup_lifecycle and not backup_delete and not git_pull and not forge_comment and not backup_export and not backup_rotation and not backup_reencrypt and not selected_preview and not forge_list_query and not forge_retry and not forge_run and not forge_create_selected and not forge_checkout and not jj_recovery and not scm_selected and not git_stash_apply and not usage:
        return _response_bundle_failures(bundle)
    snapshot = deepcopy(bundle)
    failures = _response_bundle_failures(snapshot, resolve_owner_record=resolve_owner_record,
                                         canonical_request_digest=canonical_request_digest,
                                         backup_read_admission=backup_read_admission,
                                         backup_page_source=backup_page_source,
                                         backup_source_custody=backup_source_custody,
                                         backup_current_disclosure=backup_current_disclosure,
                                         forge_log_dependencies=forge_log_dependencies, forge_list_query_dependencies=forge_list_query_dependencies, restore_preview_dependencies=restore_preview_dependencies, backup_reencrypt_dependencies=backup_reencrypt_dependencies, backup_rotation_dependencies=backup_rotation_dependencies, backup_export_dependencies=backup_export_dependencies, forge_comment_dependencies=forge_comment_dependencies, backup_delete_dependencies=backup_delete_dependencies, backup_lifecycle_dependencies=backup_lifecycle_dependencies, forge_reply_dependencies=forge_reply_dependencies, forge_cancel_dependencies=forge_cancel_dependencies, forge_create_selected_dependencies=forge_create_selected_dependencies, forge_run_dependencies=forge_run_dependencies, forge_retry_dependencies=forge_retry_dependencies, forge_checkout_dependencies=forge_checkout_dependencies,
                                         credential_source_dependencies=credential_source_dependencies)
    if bundle != snapshot:
        failures.append("git_stash_apply_bundle_mutated_during_resolution" if git_stash_apply else "scm_selected_bundle_mutated_during_resolution" if scm_selected else "jj_recovery_bundle_mutated_during_resolution" if jj_recovery else "git_pull_bundle_mutated_during_resolution" if git_pull else "credential_bundle_mutated_during_resolution" if credential_source else "backup_read_bundle_mutated_during_resolution" if backup_read else "jj_publication_bundle_mutated_during_resolution" if jj_publication else "forge_log_bundle_mutated_during_resolution" if forge_log else "forge_bundle_mutated_during_resolution" if forge_review else "usage_bundle_mutated_during_resolution" if usage else "git3_bundle_mutated_during_resolution")
    return sorted(set(failures))


def _response_bundle_failures(bundle: dict[str, Any], *, resolve_owner_record=None,
                              canonical_request_digest=None, backup_read_admission=None,
                              backup_page_source=None, backup_source_custody=None,
                              backup_current_disclosure=None, forge_log_dependencies=None, credential_source_dependencies=None, forge_cancel_dependencies=None, forge_reply_dependencies=None, backup_lifecycle_dependencies=None, backup_delete_dependencies=None, forge_comment_dependencies=None, backup_export_dependencies=None, backup_rotation_dependencies=None, backup_reencrypt_dependencies=None, restore_preview_dependencies=None, forge_list_query_dependencies=None, forge_retry_dependencies=None, forge_run_dependencies=None, forge_create_selected_dependencies=None, forge_checkout_dependencies=None) -> list[str]:
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
    if response.get('command_id') == 'cmd.forge.review.checkout':
        if response['response_kind'] != 'owner_operation' or response.get('owner_result_schema_ref') != {'path':'Plans/forge_review_checkout_selected_contracts.schema.json','json_pointer':'#/$defs/result','schema_id':'pm.forge.review_checkout_selected.result.v1'}:
            failures.append('forge_checkout_owner_binding')
    if response.get("command_id") in USAGE_COMMANDS:
        if response["response_kind"] != "owner_operation" or not usage_binding_allowed(response["command_id"], response.get("owner_result_schema_ref")):
            failures.append("usage_owner_binding")
    if response["response_kind"] != "owner_operation":
        if outcome is not None or owner_result is not None:
            failures.append("non_operation_has_owner_records")
        if any(request.get(field) is not None for field in ("operation_id", "owner_identity")):
            failures.append("non_operation_fabricated_scope")
        if response["response_kind"] == "local_projection":
            commands = schema(SHARED_SCHEMA)["$defs"]["canonical_command_id"]["enum"]
            scm_commands = schema(SOURCE_CONTROL_SCHEMA)["$defs"]["source_control_command_id"]["enum"]
            if response["command_id"] in commands or response["command_id"] in scm_commands or response["command_id"] in GIT_THREE_COMMANDS or response["command_id"] in FORGE_REVIEW_COMMANDS or response["command_id"] == CREDENTIAL_SOURCE_COMMAND or response["command_id"] in BACKUP_READ_COMMANDS or response["command_id"] in JJ_PUBLICATION_COMMANDS or response["command_id"] in GIT_PULL_COMMANDS or response["command_id"] in JJ_RECOVERY_COMMANDS or response["command_id"] in GIT_STASH_APPLY_COMMANDS or response["command_id"] in USAGE_COMMANDS:
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
    if response["command_id"] in JJ_RECOVERY_COMMANDS and response["owner_result_schema_ref"] != JJ_RECOVERY_BINDING:
        failures.append("jj_recovery_owner_result_binding")
    if response["command_id"] in SCM_SELECTED_COMMANDS and response["owner_result_schema_ref"] != SCM_SELECTED_BINDING:
        failures.append("scm_selected_owner_result_binding")
    if response["command_id"] in GIT_STASH_APPLY_COMMANDS and response["owner_result_schema_ref"] != GIT_STASH_APPLY_BINDING:
        failures.append("git_stash_apply_owner_result_binding")
    if response["command_id"] in FORGE_REVIEW_COMMANDS and response["owner_result_schema_ref"] != FORGE_REVIEW_BINDING:
        failures.append("forge_review_owner_result_binding")
    if response["command_id"] in GIT_THREE_COMMANDS and response["owner_result_schema_ref"] != GIT_THREE_BINDING:
        failures.append("git3_owner_result_binding")
    if response["command_id"] in USAGE_COMMANDS and not usage_binding_allowed(response["command_id"], response["owner_result_schema_ref"]):
        failures.append("usage_owner_result_binding")
    if response["owner_result_ref"] is None:
        if owner_result is not None:
            failures.append("unbound_owner_result")
    else:
        if response["owner_result_ref"] != bundle.get("resolved_owner_result_ref"):
            failures.append("owner_result_reference_mismatch")
        binding = response["owner_result_schema_ref"]
        if response["command_id"] in schema(SOURCE_CONTROL_SCHEMA)["$defs"]["source_control_command_id"]["enum"]:
            historical = {"path": SOURCE_CONTROL_SCHEMA,
                          "json_pointer": "#/$defs/source_control_command_result",
                          "schema_id": "pm.source_control.command_result.v1"}
            successor = (response["command_id"] in SCM_SELECTED_COMMANDS
                         and binding == SCM_SELECTED_BINDING)
            if binding != historical and not successor:
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
            elif owner_result.get('schema_id') == 'pm.forge.review_checkout_selected.result.v1':
                from pm_forge_review_checkout_selected_semantics import response_failures as checkout_response_failures
                failures.extend(checkout_response_failures(bundle, forge_checkout_dependencies))
            elif owner_result.get("schema_id") == JJ_RECOVERY_BINDING["schema_id"]:
                if "delivery_return_context" not in bundle:
                    failures.append("jj_recovery_delivery_owner_value_missing")
                from pm_jj_recovery_response import response_failures as jj_recovery_response_failures
                failures.extend(jj_recovery_response_failures(
                    response, outcome, owner_result, bundle.get("owner_request"), request,
                    bundle.get("original_binding_ref"), bundle.get("delivery_return_context"),
                    resolve_record=resolve_owner_record, canonical_request_digest=canonical_request_digest,
                    canon_root=ROOT, registry=registry()))
            elif owner_result.get("schema_id") == GIT_STASH_APPLY_BINDING["schema_id"]:
                if "delivery_return_context" not in bundle:
                    failures.append("git_stash_apply_delivery_owner_value_missing")
                from pm_git_stash_apply_response import response_failures as git_stash_apply_response_failures
                failures.extend(git_stash_apply_response_failures(
                    response, outcome, owner_result, bundle.get("owner_request"), request,
                    bundle.get("original_binding_ref"), bundle.get("delivery_return_context"),
                    resolve_record=resolve_owner_record, canonical_request_digest=canonical_request_digest,
                    canon_root=ROOT, registry=registry()))
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
            elif owner_result.get("schema_id") == SCM_SELECTED_BINDING["schema_id"]:
                if "delivery_return_context" not in bundle:
                    failures.append("scm_selected_delivery_owner_value_missing")
                from pm_source_control_selected_response import response_failures as scm_selected_response_failures
                failures.extend(scm_selected_response_failures(
                    response, outcome, owner_result, bundle.get("owner_request"), request,
                    bundle.get("original_binding_ref"), bundle.get("delivery_return_context"),
                    resolve_record=resolve_owner_record, canonical_request_digest=canonical_request_digest,
                    canon_root=ROOT, registry=registry()))
            elif owner_result.get("schema_id") in USAGE_SCHEMA_IDS:
                failures.extend(usage_owner_failures(response, outcome, owner_result, bundle.get("owner_request"), request, bundle))
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


def usage_owner_failures(response, outcome, owner_result, owner_request, normalized_request, bundle):
    """Real central join for cmd.usage.refresh/export over actual owner grammar.

    Uses the existing v1 core-selection, v2 quota-aware, and DL-098 ledger
    request/result shapes, the Full Thread CommandOutcomeRecord, and the v2
    UICommandResponse. No new route, handler, or physical custody is invented;
    native source, permission, delivery, and disclosure proof remain with the
    owner validators. Full row/content recomputation stays with the owner
    validators; central joins independently owned records and their binding.
    """
    binding = response.get("owner_result_schema_ref") or {}
    owner_path = binding.get("path")
    if owner_path not in ("Plans/usage_command_contracts.schema.json", "Plans/usage_quota_command_contracts.schema.json",
                          LEDGER_SCHEMA_PATH):
        return ["usage_owner_binding"]
    if not isinstance(owner_request, dict):
        return ["usage_owner_request_missing"]
    if owner_path == LEDGER_SCHEMA_PATH:
        if structural_failures(owner_path, owner_request, LEDGER_REQUEST_POINTER):
            return ["usage_owner_request_schema"]
        return sorted(set(usage_ledger_failures(response, outcome, owner_result, owner_request,
                                                normalized_request, bundle)))
    if structural_failures(owner_path, owner_request, usage_request_pointer(response.get("command_id") or "")):
        return ["usage_owner_request_schema"]
    failures = []
    if owner_result.get("request") != owner_request:
        failures.append("usage_original_request_mismatch")
    expected_req_id = "pm.usage.command_request.v1" if owner_path == "Plans/usage_command_contracts.schema.json" else "pm.usage.command_request.v2"
    if owner_request.get("schema_id") != expected_req_id:
        failures.append("usage_owner_request_schema_identity_mismatch")
    for field in ("command_id", "command_instance_id"):
        if owner_request.get(field) != response.get(field) or owner_result.get(field) != response.get(field):
            failures.append("usage_owner_command_mismatch")
            break
    if owner_request.get("request_ref") != response.get("request_ref"):
        failures.append("usage_owner_request_ref_mismatch")
    if outcome.get("command_id") != response.get("command_id"):
        failures.append("usage_owner_command_mismatch")
    req_ident = owner_request.get("identity") or {}
    res_ident = owner_result.get("identity") or {}
    if req_ident != res_ident:
        failures.append("usage_owner_identity_mismatch")
    if res_ident != outcome.get("identity") or res_ident != response.get("owner_identity"):
        failures.append("usage_owner_scope_mismatch")
    if owner_result.get("operation_id") != req_ident.get("operation_id"):
        failures.append("usage_owner_operation_mismatch")
    if req_ident.get("command_instance_id") != owner_request.get("command_instance_id"):
        failures.append("usage_owner_instance_mismatch")
    if owner_request.get("idempotency_key") != outcome.get("idempotency_key"):
        failures.append("usage_owner_idempotency_mismatch")
    if req_ident.get("operation_generation") != outcome.get("target_generation"):
        failures.append("usage_owner_target_generation_mismatch")
    if owner_result.get("command_outcome_ref") != response.get("command_outcome_ref"):
        failures.append("usage_owner_outcome_ref_mismatch")
    if owner_result.get("caller") != owner_request.get("caller"):
        failures.append("usage_caller_substitution")
    elif bundle.get("current_panel_context_ref") is not None and (owner_request.get("caller") or {}).get("caller_context_ref") == bundle.get("current_panel_context_ref"):
        failures.append("usage_current_panel_substitution")
    if outcome.get("outcome") != owner_result.get("status"):
        failures.append("usage_owner_outcome_mismatch")
    if outcome.get("error_ref") != owner_result.get("error_ref"):
        failures.append("usage_owner_error_ref_mismatch")
    status = owner_result.get("status")
    if status == "succeeded" and owner_result.get("error_ref") is not None:
        failures.append("usage_succeeded_error_ref_present")
    if status == "succeeded" and response.get("error") is not None:
        failures.append("usage_succeeded_ui_error_present")
    if status == "cancelled" and response.get("error") is not None:
        failures.append("usage_cancelled_ui_error_present")
    if status == "failed":
        if owner_result.get("error_ref") is None or outcome.get("error_ref") is None:
            failures.append("usage_failed_error_ref_missing")
        if response.get("error") is None:
            failures.append("usage_failed_ui_error_missing")
    if status == "terminal_unknown" and response.get("error") is None:
        failures.append("usage_terminal_ui_error_missing")
    is_export = response.get("command_id") == "cmd.usage.export"
    if is_export:
        # Export shape already requires maxItems 0; this is defense in depth.
        if owner_result.get("route_outcomes"):
            failures.append("usage_export_route_effect")
        output = owner_result.get("output")
        if status == "succeeded" and (output is None or owner_result.get("projection") is None):
            failures.append("usage_export_no_output")
        if output is not None:
            view = output.get("view") or {}
            if view.get("query") != owner_request.get("query"):
                failures.append("usage_export_selection_mismatch")
            if view.get("export_scope") != owner_request.get("export_scope"):
                failures.append("usage_export_scope_mismatch")
            if view.get("profile") != (owner_request.get("query") or {}).get("profile"):
                failures.append("usage_export_profile_mismatch")
            if view.get("projection_ref") != owner_request.get("projection_ref"):
                failures.append("usage_export_projection_ref_mismatch")
            if view.get("projection_revision") != owner_request.get("projection_revision"):
                failures.append("usage_export_projection_revision_mismatch")
    else:
        # Refresh shape already requires output null; defense in depth.
        if owner_result.get("output") is not None:
            failures.append("usage_refresh_export_effect")
        routes = [row.get("route_ref") for row in (owner_result.get("route_outcomes") or [])]
        if len(set(routes)) != len(routes) or set(routes) != set(owner_request.get("provider_route_refs") or []):
            failures.append("usage_refresh_route_selection")
        if status == "succeeded" and (owner_result.get("projection") is None or any(row.get("status") != "completed" for row in (owner_result.get("route_outcomes") or []))):
            failures.append("usage_refresh_not_completed")
        projection = owner_result.get("projection")
        if projection is not None and projection.get("query") != owner_request.get("query"):
            failures.append("usage_refresh_projection_query_mismatch")
    if response.get("event_refs") != []:
        failures.append("usage_response_event_refs")
    return sorted(set(failures))


def usage_ledger_failures(response, outcome, owner_result, owner_request, normalized_request, bundle):
    """Real central join for the DL-098 ledger-profile branch of cmd.usage.*.

    Owner request/result shapes are already schema-validated by the caller.
    The ledger pair carries no operation envelope of its own, so the operation
    join is made through the independently owned outcome identity (instance,
    scope, idempotency, payload digest) while the selection join pins the
    original query, IDs, export mode, currentness, and caller to the result.
    """
    failures = []
    if owner_result.get("request") != owner_request:
        failures.append("usage_original_request_mismatch")
    if owner_request.get("schema_id") != LEDGER_REQUEST_SCHEMA_ID:
        failures.append("usage_owner_request_schema_identity_mismatch")
    for field in ("command_id", "command_instance_id"):
        if owner_request.get(field) != response.get(field) or owner_result.get(field) != response.get(field):
            failures.append("usage_owner_command_mismatch")
            break
    if owner_request.get("request_ref") != response.get("request_ref"):
        failures.append("usage_owner_request_ref_mismatch")
    if outcome.get("command_id") != response.get("command_id"):
        failures.append("usage_owner_command_mismatch")
    identity = outcome.get("identity") or {}
    if owner_request.get("command_instance_id") != identity.get("command_instance_id"):
        failures.append("usage_owner_instance_mismatch")
    query = owner_request.get("query") or {}
    if (query.get("scope_kind") != identity.get("scope_kind")
            or query.get("server_id") != identity.get("server_id")
            or query.get("project_id") != identity.get("project_id")):
        failures.append("usage_owner_scope_mismatch")
    if owner_request.get("idempotency_key") != outcome.get("idempotency_key"):
        failures.append("usage_owner_idempotency_mismatch")
    try:
        if outcome.get("payload_sha256") != owner_result_digest(owner_request):
            failures.append("usage_owner_payload_mismatch")
    except (TypeError, ValueError):
        failures.append("usage_owner_payload_mismatch")
    if owner_result.get("caller") != owner_request.get("caller"):
        failures.append("usage_caller_substitution")
    elif bundle.get("current_panel_context_ref") is not None and (owner_request.get("caller") or {}).get("caller_context_ref") == bundle.get("current_panel_context_ref"):
        failures.append("usage_current_panel_substitution")
    if outcome.get("outcome") != owner_result.get("status"):
        failures.append("usage_owner_outcome_mismatch")
    if outcome.get("error_ref") != owner_result.get("error_ref"):
        failures.append("usage_owner_error_ref_mismatch")
    status = owner_result.get("status")
    if status == "succeeded" and owner_result.get("error_ref") is not None:
        failures.append("usage_succeeded_error_ref_present")
    if status == "succeeded" and response.get("error") is not None:
        failures.append("usage_succeeded_ui_error_present")
    if status == "cancelled" and response.get("error") is not None:
        failures.append("usage_cancelled_ui_error_present")
    if status == "failed":
        if owner_result.get("error_ref") is None or outcome.get("error_ref") is None:
            failures.append("usage_failed_error_ref_missing")
        if response.get("error") is None:
            failures.append("usage_failed_ui_error_missing")
    if status not in ("succeeded", "failed", "cancelled", "rejected"):
        failures.append("usage_owner_outcome_mismatch")
    if status == "succeeded":
        if owner_result.get("result_receipt_ref") is None:
            failures.append("usage_owner_receipt_mismatch")
        elif owner_result.get("result_receipt_ref") != outcome.get("result_receipt_ref"):
            failures.append("usage_owner_receipt_mismatch")
    elif owner_result.get("result_receipt_ref") is not None:
        failures.append("usage_owner_receipt_mismatch")
    applied = owner_result.get("applied_query") or {}
    if applied != query:
        failures.append("usage_ledger_applied_query_mismatch")
    if applied.get("owner_revision") != query.get("owner_revision"):
        failures.append("usage_ledger_stale_revision")
    if owner_result.get("freshness") == "current" and applied != query:
        failures.append("usage_ledger_stale_currentness")
    selection = owner_result.get("selection") or {}
    requested = selection.get("requested_record_ids")
    if requested != query.get("requested_record_ids"):
        failures.append("usage_ledger_selection_mismatch")
    matched = owner_result.get("matched_record_ids") or []
    ordered = owner_result.get("ordered_record_ids") or []
    effective = selection.get("effective_record_ids") or []
    if any(rid not in set(matched) for rid in ordered):
        failures.append("usage_ledger_ordered_not_matched")
    if any(rid not in set(ordered) for rid in effective) or any(rid not in set(requested or []) for rid in effective):
        failures.append("usage_ledger_selection_mismatch")
    is_export = response.get("command_id") == "cmd.usage.export"
    export = owner_result.get("export")
    if not is_export and export is not None:
        failures.append("usage_refresh_export_effect")
    if is_export and status == "succeeded" and export is None:
        failures.append("usage_export_no_output")
    if status in ("failed", "cancelled", "rejected") and export is not None:
        failures.append("usage_terminal_export_present")
    if export is not None:
        if not is_export or export.get("mode") != owner_request.get("export_mode"):
            failures.append("usage_export_mode_mismatch")
        if export.get("total_match_count") != len(ordered):
            failures.append("usage_export_total_mismatch")
        export_rows = export.get("rows") or []
        export_ids = [row.get("usage_record_id") for row in export_rows]
        if export.get("mode") == "selected" and export_ids != effective:
            failures.append("usage_export_selected_identity")
        if export.get("mode") == "filtered" and export_ids != ordered:
            failures.append("usage_export_filtered_truncated")
            if len(export_rows) == export.get("drawn_viewport_row_count") < (export.get("total_match_count") or 0):
                failures.append("usage_export_viewport_dump")
        for row in export_rows:
            if row.get("row_kind") != "attempt_usage":
                failures.append("usage_quota_row_in_ledger_export")
                break
        if any(rid not in set(matched) for rid in export_ids):
            failures.append("usage_export_unknown_identity")
    page = owner_result.get("page")
    if status == "succeeded" and page is None:
        failures.append("usage_ledger_page_missing")
    if page is not None:
        total = len(ordered)
        if page.get("total_match_count") != total or page.get("offset", 0) + page.get("returned_count", 0) > total:
            failures.append("usage_ledger_page_dishonest")
        if page.get("returned_count", 0) > page.get("limit", 0):
            failures.append("usage_ledger_page_dishonest")
    if response.get("event_refs") != []:
        failures.append("usage_response_event_refs")
    return sorted(set(failures))
