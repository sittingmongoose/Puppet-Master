"""Finite SIR-024 transfer/remove composition, not a secret handler or native authority proof.

All resolvers operate under authentic owner custody. Mandatory admission verifies
the original human/active Client, the actual family permission decision and the
SIR dispatch mapping. Preview proof resolves the actual attachment original and
verifies per-mechanism adapter portability, destination reauthentication and
secret-exclusion evidence. Apply proof verifies the current human approval bound
to the exact preview content, idempotent replay, and — only on the existing
encrypted user-controlled recovery-envelope transport — separate adapter and
protected-owner authorization, never a Backup/BRS grant. Remove proof verifies
explicit ownership, dependency, active-work and data-disposition facts as
owner-issued evidence. Final disclosure independently checks current
authorization without reexecuting. These interfaces return list[str] failures,
not caller-supplied allow Booleans, and every mutating effect stays
native-unproved.
"""
from copy import deepcopy
from datetime import datetime
from functools import lru_cache
import hashlib
import json
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

SCHEMA = 'Plans/credential_transfer_remove_contracts.schema.json'
PREVIEW = 'cmd.credential_attachment.transfer.preview'
APPLY = 'cmd.credential_attachment.transfer.apply'
REMOVE = 'cmd.credential_source.remove'
COMMANDS = (PREVIEW, APPLY, REMOVE)
REQUEST_DEF = {PREVIEW: 'preview_request', APPLY: 'apply_request', REMOVE: 'remove_request'}
RESULT_DEF = {PREVIEW: 'preview_result', APPLY: 'apply_result', REMOVE: 'remove_result'}
BRS_SCHEMA_ID_PREFIX = 'pm.backup_restore_system.'
DIMENSIONS = ('provider_id', 'profile_ref', 'server_id', 'project_id', 'execution_host_id', 'execution_environment_id', 'repository_ref')
LOCATIONAL = ('execution_host_id', 'execution_environment_id')
ENVELOPE = 'encrypted_user_controlled_recovery_envelope_ref_only'
COMMAND_ACTIONS = {PREVIEW: 'transfer_preview', APPLY: 'transfer_apply', REMOVE: 'remove'}

RECORD_SCHEMA_IDS = {
    'dispatch_binding': 'pm.sir.credential_transfer_remove_dispatch.v1',
    'preview_request': 'pm.credential.transfer_preview.request.v1',
    'apply_request': 'pm.credential.transfer_apply.request.v1',
    'remove_request': 'pm.credential.source_remove.request.v1',
    'preview_result': 'pm.credential.transfer_preview.result.v1',
    'apply_result': 'pm.credential.transfer_apply.result.v1',
    'remove_result': 'pm.credential.source_remove.result.v1',
    'preview_record': 'pm.credential.transfer_preview.plan.v1',
    'transfer_approval': 'pm.credential.transfer_approval.v1',
    'envelope_admission': 'pm.credential.transfer_envelope_admission.v1',
    'destination_attachment': 'pm.credential.destination_attachment.v1',
    'transfer_effect_receipt': 'pm.credential.transfer_effect_receipt.v1',
    'removal_effect_receipt': 'pm.credential.source_removal_receipt.v1',
    'attachment_original': 'pm.credential.attachment_original.v1',
    'source_original': 'pm.credential.source_original.v1',
    'availability': 'pm.shared_integration_runtime.expansion_contracts.v1',
    'disabled_reason': 'pm.shared_integration_runtime.expansion_contracts.v1',
    'command_error': 'pm.shared_integration_runtime.expansion_contracts.v1',
    'permission_decision': 'pm.shared_integration_runtime.expansion_contracts.v1',
}
FAMILY_RECORD_KINDS = {
    'availability': 'integration_credential_command_availability',
    'disabled_reason': 'integration_credential_command_disabled_reason',
    'command_error': 'integration_credential_command_error',
    'permission_decision': 'integration_credential_permission_decision',
}


@lru_cache(maxsize=None)
def validator(definition, canon_root=None):
    root = Path(canon_root) if canon_root else Path(__file__).resolve().parents[1]
    own = Path(__file__).resolve().parents[1]
    documents = [json.loads(p.read_text()) for p in (root / 'Plans').glob('*.schema.json')]
    companion_path = root / SCHEMA
    if not companion_path.is_file():
        companion_path = own / SCHEMA
    companion = json.loads(companion_path.read_text())
    if all(d.get('$id') != companion.get('$id') for d in documents):
        documents.append(companion)
    registry = Registry().with_resources((d['$id'], Resource.from_contents(d)) for d in documents if '$id' in d)
    return Draft202012Validator({'$ref': companion['$id'] + '#/$defs/' + definition}, registry=registry, format_checker=FormatChecker())


def structural_failures(definition, value, *, canon_root=None):
    return [e.message for e in validator(definition, str(canon_root) if canon_root else None).iter_errors(value)]


def instant(value):
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


def canonical_request_digest(value):
    """Bounded canonical digest of the typed request bytes; the native digest
    contract stays mandatory and unproved."""
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()


def scope_failures(label, requested, actual, destination=None):
    """Effective/evaluated scope can never widen the requested scope; null is
    never a wildcard; a transferred scope binds its Host/Environment to the
    exact selected destination."""
    errors = []
    for name, scope in (('requested', requested), ('actual', actual)):
        if scope['expires_at_utc'] is not None and instant(scope['expires_at_utc']) <= instant(scope['issued_at_utc']):
            errors.append(label + '_scope_time')
    if destination is not None:
        for key, value in (('execution_host_id', destination['execution_host_id']), ('execution_environment_id', destination['execution_environment_id'])):
            if actual[key] != value:
                errors.append(label + '_destination_scope_' + key)
    for key in DIMENSIONS:
        if key in LOCATIONAL and destination is not None:
            continue
        if actual[key] != requested[key]:
            errors.append(label + '_scope_identity')
    for key in ('operation_refs', 'capability_refs'):
        if not set(actual[key]) <= set(requested[key]):
            errors.append(label + '_scope_' + key)
    if instant(actual['issued_at_utc']) < instant(requested['issued_at_utc']):
        errors.append(label + '_scope_issued_widening')
    end = requested['expires_at_utc']
    stop = actual['expires_at_utc']
    if end is not None and (stop is None or instant(stop) > instant(end)):
        errors.append(label + '_scope_expiry_widening')
    return errors


def unknown_effect(*states):
    return any(state in ('unknown', 'recovery_required') for state in states)


def response_failures(bundle, *, resolve_record, canonical_digest,
                      verify_original_admission, verify_preview_portability,
                      verify_transfer_authorization, verify_envelope_admission,
                      verify_removal_facts, check_current_disclosure, canon_root=None):
    """Join the authentic SIR original binding, existing family
    authority/permission/result/error records and the typed transfer/remove
    originals through owner-resolved facts only. Copied refs, caller-provided
    witnesses, self-consistent fake originals, stale generations, wrong
    destination, mismatched subject, unproved portability, missing approval,
    mismatched removal dependency/disposition, fabricated success and unknown
    effects mislabelled failed/success reject here."""
    saved = deepcopy(bundle)
    errors = []
    cache = {}
    live = {}
    request = None
    callbacks = (resolve_record, canonical_digest, verify_original_admission, verify_preview_portability,
                 verify_transfer_authorization, verify_envelope_admission, verify_removal_facts, check_current_disclosure)
    if not all(callable(c) for c in callbacks):
        return ['transfer_remove_dependencies_missing']

    def raw(ref):
        if ref not in cache:
            value = resolve_record(ref)
            live[ref] = value
            cache[ref] = deepcopy(value)
        return deepcopy(cache[ref])

    def read(kind, ref):
        value = raw(ref)
        expected = RECORD_SCHEMA_IDS.get(kind)
        got = value.get('schema_id') if isinstance(value, dict) else None
        if got != expected:
            raise ValueError('record_kind:' + kind + ':' + str(got))
        if kind in FAMILY_RECORD_KINDS and value.get('record_kind') != FAMILY_RECORD_KINDS[kind]:
            raise ValueError('record_kind:' + kind)
        if structural_failures(kind, value, canon_root=canon_root):
            raise ValueError(kind + '_schema')
        return value

    def checked(callback, label, *values):
        args = deepcopy(values)
        before = deepcopy(args)
        try:
            result = callback(*args)
            if not isinstance(result, list) or not all(isinstance(e, str) and e for e in result):
                return [label + '_invalid_response']
            return (['transfer_remove_' + label + '_inputs_mutated'] if args != before else []) + [label + ':' + e for e in result]
        except Exception:
            return [label + '_unavailable']

    try:
        case = saved['case']
        command = case['command_id']
        if command not in COMMANDS:
            return ['transfer_remove_command']
        original = read('dispatch_binding', case['original_binding_ref'])
        if original['command_id'] != command:
            errors.append('transfer_remove_binding_command')
        request = read(REQUEST_DEF[command], original['request_ref'])
        authority = request['authority']
        selection = request['selection']
        result = read(RESULT_DEF[command], case['result_ref']) if case.get('result_ref') is not None else None
        error = read('command_error', case['error_ref']) if case.get('error_ref') is not None else None
        if (result is None) == (error is None):
            errors.append('transfer_remove_response_arity')
        permission = read('permission_decision', original['permission_decision_ref'])
        digest_args = deepcopy(request)
        digest = canonical_digest(digest_args)
        if not isinstance(digest, str) or len(digest) != 64:
            errors.append('transfer_remove_digest_contract')
        elif digest != original['payload_sha256']:
            errors.append('transfer_remove_original_digest')
        if digest_args != request:
            errors.append('transfer_remove_digest_mutated')
        if original['arguments'] != request:
            errors.append('transfer_remove_original_arguments')
        for key in ('request_id', 'invocation_id', 'idempotency_key', 'actor_ref', 'permission_snapshot_ref', 'return_context_ref'):
            if original[key] != authority[key]:
                errors.append('transfer_remove_original_' + key)
        for key in ('command_id', 'action', 'sole_handler_target', 'permission_snapshot_ref', 'confirmation_ref'):
            if permission[key] != authority[key]:
                errors.append('transfer_remove_permission_' + key)
        if permission['decision_id'] != original['permission_decision_ref']:
            errors.append('transfer_remove_permission_ref')
        response = result['owner_result'] if result is not None else error
        for key in ('command_id', 'action', 'sole_handler_target'):
            if response[key] != authority[key]:
                errors.append('transfer_remove_response_' + key)
        if result is not None:
            for key in ('request_id', 'invocation_id'):
                if response[key] != authority[key]:
                    errors.append('transfer_remove_response_' + key)
        else:
            if error['request_id'] != authority['request_id']:
                errors.append('transfer_remove_response_request_id')
        if instant(original['accepted_at_utc']) < instant(authority['requested_at_utc']):
            errors.append('transfer_remove_operation_time')
        replayed = case['replayed']
        if replayed and case.get('original_dispatch_id') != original['dispatch_id']:
            errors.append('transfer_remove_replay_dispatch')
        admitted = permission['decision'] == 'admitted'
        if not admitted and result is not None and response['outcome'] == 'succeeded':
            errors.append('transfer_remove_unadmitted_success')
        errors += checked(verify_original_admission, 'original_admission', request, original, permission)
        attachment = source = None
        if command in (PREVIEW, APPLY):
            attachment = read('attachment_original', selection['attachment_source_ref'])
            if authority['target_refs']['attachment_ref'] != attachment['attachment_ref']:
                errors.append('transfer_remove_target_subject')
        if command == REMOVE:
            source = read('source_original', selection['source_source_ref'])
            if authority['target_refs']['source_ref'] != source['source_ref']:
                errors.append('transfer_remove_target_subject')

        if command == PREVIEW:
            preview = read('preview_record', result['preview_ref'])
            if result['original_request_ref'] != original['request_ref'] or preview['original_request_ref'] != original['request_ref']:
                errors.append('transfer_remove_original_ref')
            if preview['attachment_ref'] != attachment['attachment_ref'] or preview['attachment_generation'] != attachment['attachment_generation']:
                errors.append('preview_subject')
            if preview['destination'] != selection['destination']:
                errors.append('preview_destination')
            errors += scope_failures('preview', selection['requested_scope'], preview['evaluated_scope'], preview['destination'])
            if preview['observed_source_owner_generation'] != attachment['owner_generation'] or preview['attachment_generation'] != attachment['attachment_generation']:
                errors.append('preview_stale')
            destination = selection['destination']
            if preview['observed_destination_owner_generation'] != destination['expected_destination_owner_generation'] or preview['observed_destination_topology_generation'] != destination['expected_destination_topology_generation']:
                errors.append('preview_stale_destination')
            if result['preview_content_sha256'] != preview['preview_content_sha256']:
                errors.append('preview_content_mismatch')
            for mechanism in ('reference_transfer', 'encrypted_envelope_transfer'):
                evidence = preview[mechanism]
                if evidence['eligible'] and not evidence['adapter_portability_proven']:
                    errors.append('transfer_portability_unproved')
            owner = result['owner_result']
            if owner['requested_state'] != original['request_ref'] or owner['effective_state'] != result['preview_ref']:
                errors.append('transfer_remove_state_referent')
            if result['preview_ref'] not in owner['receipt_refs']:
                errors.append('preview_result_receipt')
            errors += checked(verify_preview_portability, 'preview_portability', request, original, attachment, preview)

        elif command == APPLY:
            preview = read('preview_record', selection['approved_preview_ref'])
            approval = read('transfer_approval', selection['approval_ref'])
            transport = authority['portable_secret_transport']
            admission = read('envelope_admission', selection['envelope_admission_ref']) if selection['envelope_admission_ref'] is not None else None
            if result is not None and result['original_request_ref'] != original['request_ref']:
                errors.append('transfer_remove_original_ref')
            if preview['attachment_ref'] != attachment['attachment_ref'] or preview['attachment_generation'] != attachment['attachment_generation']:
                errors.append('transfer_subject_mismatch')
            if selection['approved_preview_content_sha256'] != preview['preview_content_sha256']:
                errors.append('transfer_preview_content_mismatch')
            if preview['observed_source_owner_generation'] != attachment['owner_generation'] or preview['attachment_generation'] != attachment['attachment_generation']:
                errors.append('transfer_preview_stale')
            if approval['preview_ref'] != selection['approved_preview_ref'] or approval['preview_content_sha256'] != preview['preview_content_sha256']:
                errors.append('transfer_approval_preview')
            if approval['attachment_ref'] != attachment['attachment_ref']:
                errors.append('transfer_subject_mismatch')
            if approval['actor_ref'] != authority['actor_ref']:
                errors.append('transfer_approval_actor')
            if approval['permission_decision_ref'] != original['permission_decision_ref']:
                errors.append('transfer_approval_permission')
            if not admitted or permission['confirmation_ref'] != selection['approval_ref']:
                errors.append('transfer_approval_missing')
            if instant(approval['decided_at_utc']) < instant(permission['decided_at_utc']):
                errors.append('transfer_approval_time')
            if selection['destination'] != preview['destination']:
                errors.append('transfer_destination_mismatch')
            if preview['observed_destination_owner_generation'] != selection['destination']['expected_destination_owner_generation'] or preview['observed_destination_topology_generation'] != selection['destination']['expected_destination_topology_generation']:
                errors.append('preview_stale_destination')
            errors += scope_failures('transfer', selection['requested_scope'], preview['evaluated_scope'], selection['destination'])
            mechanism = preview['encrypted_envelope_transfer'] if transport == ENVELOPE else preview['reference_transfer']
            if not mechanism['eligible']:
                errors.append('transfer_mechanism_not_eligible')
            if mechanism['eligible'] and not mechanism['adapter_portability_proven']:
                errors.append('transfer_portability_unproved')
            if transport == ENVELOPE:
                if admission is None:
                    errors.append('transfer_envelope_required')
                else:
                    if admission['attachment_ref'] != attachment['attachment_ref'] or admission['attachment_generation'] != attachment['attachment_generation']:
                        errors.append('transfer_subject_mismatch')
                    try:
                        authorization = raw(admission['protected_owner_authorization_receipt_ref'])
                    except Exception:
                        authorization = None
                        errors.append('transfer_envelope_authorization_unresolved')
                    if isinstance(authorization, dict):
                        schema_id = authorization.get('schema_id', '')
                        if schema_id.startswith(BRS_SCHEMA_ID_PREFIX) or 'backup_id' in authorization:
                            errors.append('transfer_envelope_brs_authority')
                    errors += checked(verify_envelope_admission, 'envelope_admission', request, original, approval, admission)
            elif admission is not None:
                errors.append('transfer_envelope_unnecessary')
            errors += checked(verify_preview_portability, 'preview_portability', request, original, attachment, preview)
            errors += checked(verify_transfer_authorization, 'transfer_authorization', request, original, approval, permission)
            if result is not None:
                receipt = read('transfer_effect_receipt', result['effect_receipt_ref'])
                if receipt['original_request_ref'] != original['request_ref'] or receipt['original_binding_ref'] != case['original_binding_ref']:
                    errors.append('transfer_remove_original_ref')
                if receipt['approval_ref'] != selection['approval_ref'] or receipt['preview_ref'] != selection['approved_preview_ref'] or receipt['preview_content_sha256'] != preview['preview_content_sha256']:
                    errors.append('transfer_receipt_binding')
                if receipt['attachment_ref'] != attachment['attachment_ref'] or receipt['attachment_generation'] != attachment['attachment_generation']:
                    errors.append('transfer_subject_mismatch')
                if receipt['idempotency_key'] != authority['idempotency_key']:
                    errors.append('transfer_idempotency')
                if (receipt['replay_of_dispatch_id'] is not None) != replayed or (replayed and receipt['replay_of_dispatch_id'] != original['dispatch_id']):
                    errors.append('transfer_replay_new_effect')
                owner = result['owner_result']
                if owner['requested_state'] != original['request_ref'] or owner['effective_state'] != result['effect_receipt_ref']:
                    errors.append('transfer_remove_state_referent')
                if result['effect_receipt_ref'] not in owner['receipt_refs']:
                    errors.append('transfer_result_receipt')
                success = owner['outcome'] == 'succeeded'
                states = (receipt['source_attachment_effect_state'], receipt['destination_attachment_effect_state'])
                unknown = unknown_effect(*states) or unknown_effect(owner['outcome']) or unknown_effect((receipt['owner_error'] or {}).get('effect_state', 'none'))
                if unknown and success:
                    errors.append('transfer_unknown_success')
                if success and (states != ('known_applied', 'known_applied') or receipt['destination_attachment_ref'] is None or receipt['effective_scope'] is None or receipt['failure_ref'] is not None):
                    errors.append('transfer_success_truth')
                issued = None
                if receipt['destination_attachment_ref'] is not None:
                    issued = read('destination_attachment', receipt['destination_attachment_ref'])
                    if receipt['destination_attachment_generation'] != issued['attachment_generation']:
                        errors.append('transfer_issued_generation')
                if success:
                    if issued is None:
                        errors.append('transfer_success_truth')
                    else:
                        if issued['attachment_ref'] != attachment['attachment_ref'] or issued['registration_receipt_ref'] != result['effect_receipt_ref'] or issued['original_request_ref'] != original['request_ref']:
                            errors.append('transfer_issued_binding')
                        if issued['destination'] != selection['destination']:
                            errors.append('transfer_destination_mismatch')
                        errors += scope_failures('transfer_effect', selection['requested_scope'], issued['effective_scope'], selection['destination'])
                if not success and receipt['failure_ref'] is None and receipt['owner_error'] is None:
                    errors.append('transfer_failure_evidence')
                owner_error = receipt['owner_error']
                if (owner_error is None) != success:
                    errors.append('transfer_owner_error_presence')
                if owner_error is not None:
                    for key in ('command_id', 'action', 'request_id', 'sole_handler_target'):
                        if owner_error[key] != authority[key]:
                            errors.append('transfer_owner_error_' + key)
                    if owner_error['return_settlement'] != owner['return_settlement']:
                        errors.append('transfer_owner_error_return')
                    if not instant(original['accepted_at_utc']) <= instant(owner_error['occurred_at_utc']) <= instant(receipt['completed_at_utc']):
                        errors.append('transfer_owner_error_time')
                    if unknown_effect(owner_error['effect_state']) and success:
                        errors.append('transfer_unknown_success')
                if receipt['effective_scope'] is not None:
                    errors += scope_failures('transfer_effect', selection['requested_scope'], receipt['effective_scope'], selection['destination'])
                if instant(receipt['completed_at_utc']) < instant(original['accepted_at_utc']):
                    errors.append('transfer_operation_time')
            if error is not None:
                if permission['decision'] != 'admitted' and error['effect_state'] == 'known_applied':
                    errors.append('transfer_unadmitted_effect')

        elif command == REMOVE:
            if source['status'] != 'registered':
                errors.append('remove_source_not_registered')
            if result is not None:
                result_original = result['original_request_ref']
                receipt = read('removal_effect_receipt', result['effect_receipt_ref'])
                if result_original != original['request_ref'] or receipt['original_request_ref'] != original['request_ref'] or receipt['original_binding_ref'] != case['original_binding_ref']:
                    errors.append('transfer_remove_original_ref')
                if receipt['source_ref'] != source['source_ref'] or receipt['source_generation'] != source['source_generation']:
                    errors.append('remove_subject')
                if receipt['storage_owner_ref'] != source['storage_owner_ref']:
                    errors.append('remove_storage_owner')
                if receipt['storage_owner_admission_ref'] != selection['storage_owner_admission_ref'] or receipt['data_disposition_evidence_ref'] != selection['data_disposition_evidence_ref']:
                    errors.append('remove_disposition_mismatch')
                wanted = sorted(selection['dependent_attachment_refs'])
                reported = sorted(item['attachment_ref'] for item in receipt['dependent_attachment_effects'])
                if wanted != reported:
                    errors.append('remove_dependency_mismatch')
                if len(selection['lease_disposition_refs']) != len(selection['active_lease_refs']):
                    errors.append('remove_dependency_mismatch')
                wanted_leases = sorted(selection['active_lease_refs'])
                reported_leases = sorted(item['lease_ref'] for item in receipt['active_lease_dispositions'])
                if wanted_leases != reported_leases:
                    errors.append('remove_dependency_mismatch')
                for item in receipt['active_lease_dispositions']:
                    if item['disposition_ref'] not in selection['lease_disposition_refs']:
                        errors.append('remove_dependency_mismatch')
                if receipt['idempotency_key'] != authority['idempotency_key']:
                    errors.append('remove_idempotency')
                if (receipt['replay_of_dispatch_id'] is not None) != replayed or (replayed and receipt['replay_of_dispatch_id'] != original['dispatch_id']):
                    errors.append('remove_replay_new_effect')
                owner = result['owner_result']
                if owner['requested_state'] != original['request_ref'] or owner['effective_state'] != result['effect_receipt_ref']:
                    errors.append('transfer_remove_state_referent')
                if result['effect_receipt_ref'] not in owner['receipt_refs']:
                    errors.append('transfer_result_receipt')
                success = owner['outcome'] == 'succeeded'
                dependent_states = tuple(item['effect_state'] for item in receipt['dependent_attachment_effects'])
                lease_states = tuple(item['terminal_disposition'] for item in receipt['active_lease_dispositions'])
                unknown = unknown_effect(receipt['source_registration_effect_state'], receipt['stored_data_effect_state']) or unknown_effect(*dependent_states) or unknown_effect(*lease_states) or any(state in ('quarantined', 'manual_recovery_required') for state in lease_states) or unknown_effect(owner['outcome']) or unknown_effect((receipt['owner_error'] or {}).get('effect_state', 'none'))
                if unknown and success:
                    errors.append('remove_unknown_success')
                if success and (receipt['source_registration_effect_state'] != 'known_applied' or receipt['failure_ref'] is not None or any(state in ('quarantined', 'manual_recovery_required') for state in lease_states)):
                    errors.append('remove_success_truth')
                if not success and receipt['failure_ref'] is None and receipt['owner_error'] is None:
                    errors.append('remove_failure_evidence')
                owner_error = receipt['owner_error']
                if (owner_error is None) != success:
                    errors.append('remove_owner_error_presence')
                if owner_error is not None:
                    for key in ('command_id', 'action', 'request_id', 'sole_handler_target'):
                        if owner_error[key] != authority[key]:
                            errors.append('remove_owner_error_' + key)
                    if owner_error['return_settlement'] != owner['return_settlement']:
                        errors.append('remove_owner_error_return')
                    if not instant(original['accepted_at_utc']) <= instant(owner_error['occurred_at_utc']) <= instant(receipt['completed_at_utc']):
                        errors.append('remove_owner_error_time')
                if instant(receipt['completed_at_utc']) < instant(original['accepted_at_utc']):
                    errors.append('remove_operation_time')
                errors += checked(verify_removal_facts, 'removal_facts', request, original, source, receipt)
            if error is not None:
                if error['code'] == 'dependency_active' and not selection['dependent_attachment_refs'] and not selection['active_lease_refs']:
                    errors.append('remove_dependency_mismatch')
        settlement = None
        if result is not None:
            settlement = result['owner_result']['return_settlement']
        if error is not None:
            settlement = error['return_settlement']
        if settlement is not None:
            if settlement['return_context_ref'] != original['return_context_ref']:
                errors.append('transfer_remove_return_ref')
            if settlement['settlement'] == 'restored' and original['caller_return_ref'] is None:
                errors.append('transfer_remove_fabricated_restored_caller')
    except Exception as exc:
        errors.append('transfer_remove_unavailable:' + (str(exc) if isinstance(exc, ValueError) else type(exc).__name__))
    if request is not None:
        disclosed = result['owner_result'] if result is not None else error
        errors += checked(check_current_disclosure, 'final_disclosure', request, disclosed)
    if bundle != saved or any(live[ref] != value for ref, value in cache.items()):
        errors.append('transfer_remove_inputs_mutated')
    return sorted(set(errors))


def availability_failures(bundle, *, resolve_record, canon_root=None):
    """Availability/permission evidence as selected by the existing SIR grammar:
    handler_unavailable with no native evidence and the exact owner disabled
    reason; a fabricated available state cannot be expressed."""
    saved = deepcopy(bundle)
    errors = []
    cache = {}
    live = {}

    def read(kind, ref):
        if ref not in cache:
            value = resolve_record(ref)
            live[ref] = value
            cache[ref] = deepcopy(value)
        value = deepcopy(cache[ref])
        expected = RECORD_SCHEMA_IDS.get(kind)
        if (value.get('schema_id') if isinstance(value, dict) else None) != expected or value.get('record_kind') != FAMILY_RECORD_KINDS[kind]:
            raise ValueError('record_kind:' + kind)
        if structural_failures(kind, value, canon_root=canon_root):
            raise ValueError(kind + '_schema')
        return value

    try:
        case = saved['case']
        command = case['command_id']
        if command not in COMMANDS:
            return ['transfer_remove_command']
        availability = read('availability', case['availability_ref'])
        disabled = read('disabled_reason', case['disabled_reason_ref'])
        action = COMMAND_ACTIONS[command]
        for record, label in ((availability, 'availability'), (disabled, 'disabled_reason')):
            if record['command_id'] != command or record['action'] != action:
                errors.append('transfer_remove_' + label + '_command')
    except Exception as exc:
        errors.append('transfer_remove_unavailable:' + (str(exc) if isinstance(exc, ValueError) else type(exc).__name__))
    if bundle != saved or any(live[ref] != value for ref, value in cache.items()):
        errors.append('transfer_remove_inputs_mutated')
    return sorted(set(errors))


def case_failures(value, *, resolve_record, canonical_digest,
                  verify_original_admission, verify_preview_portability,
                  verify_transfer_authorization, verify_envelope_admission,
                  verify_removal_facts, check_current_disclosure, canon_root=None):
    if value.get('case', {}).get('case_kind') == 'availability_evidence':
        return availability_failures(value, resolve_record=resolve_record, canon_root=canon_root)
    return response_failures(value, resolve_record=resolve_record, canonical_digest=canonical_digest,
                             verify_original_admission=verify_original_admission,
                             verify_preview_portability=verify_preview_portability,
                             verify_transfer_authorization=verify_transfer_authorization,
                             verify_envelope_admission=verify_envelope_admission,
                             verify_removal_facts=verify_removal_facts,
                             check_current_disclosure=check_current_disclosure, canon_root=canon_root)


def fixture_dependencies(value):
    """Synthetic fixture dependencies only: all native proof remains NOT_RUN."""
    records = deepcopy(value['records'])

    def resolve(ref):
        return records[ref]

    return dict(resolve_record=resolve, canonical_digest=canonical_request_digest,
                verify_original_admission=lambda *_: [],
                verify_preview_portability=lambda *_: [],
                verify_transfer_authorization=lambda *_: [],
                verify_envelope_admission=lambda *_: [],
                verify_removal_facts=lambda *_: [],
                check_current_disclosure=lambda *_: [])


def credential_transfer_remove_semantic_failures(definition_name, value, *, canon_root=None):
    if definition_name != 'fixture_case':
        return []
    return case_failures(value, canon_root=canon_root, **fixture_dependencies(value))
