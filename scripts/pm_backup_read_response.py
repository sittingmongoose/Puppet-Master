"""Terminal-page-only Backup / SIR / common UI static composition.

New typed original and receipt are proposed owners, not native producer proof.
Trusted native resolvers, canonical digest and read proof callbacks are required.
"""
from copy import deepcopy
from datetime import datetime
import re
from pm_backup_bounded_reads import structural_failures, validate_read_result

COMMANDS = frozenset(('cmd.backup.destination.discover','cmd.backup.browse'))
BINDING = {'path':'Plans/backup_bounded_read_contracts.schema.json',
           'json_pointer':'#/$defs/result','schema_id':'pm.backup.bounded_read_result.v1'}


def response_failures(bundle, *, resolve_record, canonical_request_digest,
                      verify_original_admission, verify_page_source,
                      verify_source_custody, check_current_disclosure, canon_root):
    saved = deepcopy(bundle)
    errors, cache, live = [], {}, {}
    if not all(callable(c) for c in (resolve_record,canonical_request_digest,
            verify_original_admission,verify_page_source,verify_source_custody,check_current_disclosure)):
        return ['backup_read_response_dependencies_missing']
    def read(ref):
        if ref not in cache:
            value = resolve_record(ref)
            live[ref],cache[ref] = value,deepcopy(value)
        return deepcopy(cache[ref])
    request = None
    try:
        response,outcome,result,normalized = (saved[k] for k in ('response','outcome','owner_result','normalized_request'))
        original = read(saved['original_binding_ref'])
        if structural_failures('dispatch_binding',original,canon_root=canon_root):
            errors.append('backup_read_dispatch_schema')
        else:
            request = read(original['request_ref'])
            if structural_failures('request',request,canon_root=canon_root) or structural_failures('result',result,canon_root=canon_root):
                errors.append('backup_read_owner_schema')
            else:
                if request != original['arguments'] or request != saved.get('owner_request'):
                    errors.append('backup_read_original_arguments')
                if 'delivery_return_context' not in saved:
                    errors.append('backup_read_delivery_missing')
                elif structural_failures('delivery_return_context',saved['delivery_return_context'],canon_root=canon_root):
                    errors.append('backup_read_delivery_schema')
                elif saved['delivery_return_context'] != original['return_context']:
                    errors.append('backup_read_delivery_original')
                errors += validate_read_result(original['request_ref'],result,
                    resolve_record=lambda kind,ref: read(ref),
                    verify_original_admission=verify_original_admission,
                    verify_page_source=verify_page_source,
                    verify_source_custody=verify_source_custody,
                    check_current_disclosure=check_current_disclosure,canon_root=canon_root)
                receipt=read(result['receipt_ref'])
                if structural_failures('read_receipt',receipt,canon_root=canon_root):
                    errors.append('backup_read_receipt_schema')
                else:
                    if receipt['original_binding_ref'] != saved['original_binding_ref']:
                        errors.append('backup_read_original_binding')
                    if original['identity'] != outcome['identity'] or original['identity'] != response['owner_identity']:
                        errors.append('backup_read_response_identity')
                    if response['operation_id'] != request['operation_id']:
                        errors.append('backup_read_response_operation')
                    if any(v != original['request_ref'] for v in (response['request_ref'],normalized.get('request_ref'),result['original_request_ref'])):
                        errors.append('backup_read_response_original_ref')
                    if response['command_id'] != request['command_id'] or response['command_instance_id'] != request['command_instance_id']:
                        errors.append('backup_read_response_command')
                    dispatch = response['original_dispatch_id'] if response['replayed'] else response['dispatch_id']
                    if dispatch != original['dispatch_id']:
                        errors.append('backup_read_response_dispatch')
                    for key in ('payload_sha256','idempotency_key','dispatch_frame_id','target_generation'):
                        if original[key] != normalized.get(key) or original[key] != outcome[key]:
                            errors.append('backup_read_response_'+key)
                    digest_input=deepcopy(request)
                    digest=canonical_request_digest(digest_input)
                    if not isinstance(digest,str) or re.fullmatch('[0-9a-f]{64}',digest) is None:
                        errors.append('backup_read_digest_contract')
                    elif digest != original['payload_sha256']:
                        errors.append('backup_read_original_payload')
                    if digest_input != request:
                        errors.append('backup_read_digest_mutation')
                    expected = {'completed':'succeeded','partial':'failed','unavailable':'failed','failed':'failed','cancelled':'cancelled'}[result['outcome']]
                    if outcome['outcome'] != expected or response['result_status'] == 'no_op':
                        errors.append('backup_read_response_outcome')
                    if result['receipt_ref'] != outcome['result_receipt_ref'] or response['receipt_ref'] != result['receipt_ref']:
                        errors.append('backup_read_response_receipt')
                    if outcome['error_ref'] != receipt['failure_ref'] or response['error'] != receipt['error']:
                        errors.append('backup_read_response_error')
                    observed=datetime.fromisoformat(receipt['observed_at_utc'].replace('Z','+00:00'))
                    if any(datetime.fromisoformat(value.replace('Z','+00:00')) < observed for value in (outcome['observed_at'],response['ts'])):
                        errors.append('backup_read_response_before_receipt')
                    if response['event_refs']:
                        errors.append('backup_read_unadmitted_event')
    except Exception as exc:
        errors.append('backup_read_response_unavailable:'+type(exc).__name__)
    if request is not None:
        args=deepcopy((request,saved.get('owner_result')));before=deepcopy(args)
        try:
            final=check_current_disclosure(*args)
            if not isinstance(final,list) or not all(isinstance(e,str) and e for e in final):
                errors.append('backup_read_final_disclosure_invalid_response')
            else: errors += ['backup_read_final_disclosure:'+e for e in final]
            if args != before: errors.append('backup_read_final_disclosure_mutated')
        except Exception:
            errors.append('backup_read_final_disclosure_unavailable')
    if bundle != saved or any(live[k] != v for k,v in cache.items()):
        errors.append('backup_read_response_inputs_mutated')
    return sorted(set(errors))


def fixture_dependencies(value, ui_module):
    """Synthetic static dependencies only, never native authority proof."""
    records=deepcopy(value['records'])
    return dict(resolve_owner_record=lambda ref: records[ref],
        canonical_request_digest=ui_module.owner_result_digest,
        backup_read_admission=lambda *_: [],backup_page_source=lambda *_: [],
        backup_source_custody=lambda *_: [],backup_current_disclosure=lambda *_: [])
