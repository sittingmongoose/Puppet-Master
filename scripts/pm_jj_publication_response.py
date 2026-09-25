"""Exact-ACT039 SIR/JJ publication joins; trusted resolvers are not native proof.

The authenticated dispatcher produces the original binding. Native code must
authenticate resolved records and implement the existing canonical digest.
"""
from copy import deepcopy
from datetime import datetime
import json
from pathlib import Path
import re
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Resource
from pm_jj_publication_selected import publication_failures
from pm_full_thread_semantics import full_thread_semantic_failures

COMMANDS = frozenset(('cmd.jujutsu.git.push',))
BINDING = {'path': 'Plans/jj_publication_selected.schema.json', 'json_pointer': '#/$defs/result',
           'schema_id': 'pm.jujutsu.publication_selected.result.v1'}
SCHEMA = 'Plans/sir_jj_publication_dispatch.schema.json'


def binding_shape_failures(value, *, registry, definition='dispatch_binding'):
    schema = json.loads((Path(__file__).resolve().parents[1] / SCHEMA).read_text())
    registry = registry.with_resource(schema['$id'], Resource.from_contents(schema))
    return [str(e.message) for e in Draft202012Validator({'$ref':schema['$id']+'#/$defs/'+definition}, registry=registry,
                          format_checker=FormatChecker()).iter_errors(value)]


def response_failures(response, outcome, owner_result, owner_request, normalized_request,
                      original_binding_ref, delivery_return_context, *, resolve_record, canonical_request_digest,
                      canon_root, registry):
    inputs = (response, outcome, owner_result, owner_request, normalized_request, original_binding_ref, delivery_return_context)
    saved = deepcopy(inputs)
    response, outcome, result, request, normalized, binding_ref, delivery = saved
    if not callable(resolve_record) or not callable(canonical_request_digest):
        return ['jj_publication_response_owner_dependencies_missing']
    errors, records, live = [], {}, {}
    def read(ref):
        if ref not in records:
            live[ref] = resolve_record(ref)
            records[ref] = deepcopy(live[ref])
        return deepcopy(records[ref])
    try:
        original = read(binding_ref)
        if binding_shape_failures(original, registry=registry):
            errors.append('jj_publication_dispatch_binding_schema')
        else:
            if binding_shape_failures(delivery, registry=registry, definition='delivery_return_context'):
                errors.append('jj_publication_delivery_return_schema')
            elif delivery != original['return_context']:
                errors.append('jj_publication_delivery_original_return_mismatch')
            errors += full_thread_semantic_failures('IdentityEnvelope', original['identity'])
            if original['arguments'] != request:
                errors.append('jj_publication_dispatch_original_arguments')
            errors += publication_failures(request, result, resolve_record=read, canon_root=canon_root)
            if not errors:
                authority, owner = request['authority'], result['owner_result']
                context = read(authority['repository_context_ref'])
                identity = original['identity']
                if identity['scope_kind'] != 'project' or any(identity.get(k) != context['lineage'][k] for k in ('project_id','project_home_server_id','execution_host_id','execution_environment_id','source_location_id','topology_generation')):
                    errors.append('jj_publication_response_context_identity')
                if 'return_context' in authority and authority['return_context'] != original['return_context']:
                    errors.append('jj_publication_response_owner_return_context')
                if authority['command_id'] not in COMMANDS or authority['command_id'] != response['command_id']:
                    errors.append('jj_publication_response_command')
                if original['identity'] != outcome['identity'] or original['identity'] != response['owner_identity']:
                    errors.append('jj_publication_response_original_identity')
                if authority['command_instance_id'] != original['identity'].get('command_instance_id'):
                    errors.append('jj_publication_response_instance')
                if owner['operation_id'] != original['identity']['operation_id'] or owner['operation_id'] != response['operation_id']:
                    errors.append('jj_publication_response_operation')
                if any(v != original['request_ref'] for v in (result['original_request_ref'], response['request_ref'], normalized.get('request_ref'))):
                    errors.append('jj_publication_response_original_ref')
                if authority['idempotency_key'] != original['idempotency_key'] or outcome['idempotency_key'] != original['idempotency_key']:
                    errors.append('jj_publication_response_idempotency')
                if authority['permission']['permission_snapshot_ref'] != original['permission_snapshot_ref']:
                    errors.append('jj_publication_response_original_permission')
                dispatch = response['original_dispatch_id'] if response['replayed'] else response['dispatch_id']
                if dispatch != original['dispatch_id']:
                    errors.append('jj_publication_response_original_dispatch')
                for field in ('dispatch_frame_id', 'target_generation', 'payload_sha256'):
                    if outcome[field] != original[field] or normalized.get(field) != original[field]:
                        errors.append('jj_publication_response_original_' + field)
                digest_input = deepcopy(request)
                try:
                    digest = canonical_request_digest(digest_input)
                    if not isinstance(digest, str) or re.fullmatch('[0-9a-f]{64}', digest) is None:
                        errors.append('jj_publication_response_digest_contract')
                    elif digest != original['payload_sha256']:
                        errors.append('jj_publication_response_original_payload')
                except Exception:
                    errors.append('jj_publication_response_digest_unavailable')
                if digest_input != request:
                    errors.append('jj_publication_response_digest_input_mutated')
                if datetime.fromisoformat(original['accepted_at_utc'].replace('Z','+00:00')) < datetime.fromisoformat(authority['requested_at_utc'].replace('Z','+00:00')):
                    errors.append('jj_publication_dispatch_before_request')
                if datetime.fromisoformat(owner['completed_at_utc'].replace('Z','+00:00')) < datetime.fromisoformat(original['accepted_at_utc'].replace('Z','+00:00')):
                    errors.append('jj_publication_owner_result_before_admission')
                if owner['outcome'] == 'degraded':
                    errors.append('jj_publication_response_degraded_unsupported')
                elif owner['outcome'] == 'accepted':
                    if outcome['outcome'] not in ('accepted', 'acknowledged', 'executing') or outcome['result_receipt_ref'] is not None:
                        errors.append('jj_publication_response_acceptance_not_terminal')
                    if owner['receipt_ref'] is not None and owner['receipt_ref'] != outcome['acknowledgement_receipt_ref']:
                        errors.append('jj_publication_response_progress_receipt')
                else:
                    expected = {'succeeded':'succeeded','blocked':'rejected','failed':'failed','cancelled':'cancelled',
                                'recovery_required':'terminal_unknown','effect_unknown':'terminal_unknown'}[owner['outcome']]
                    unresolved = (owner['error'] or {}).get('effect_state') == 'unknown'
                    unresolved = unresolved or any(read(t['observation_ref'])['outcome'] == 'outcome_unknown' for t in result['target_results'])
                    if unresolved:
                        expected = 'terminal_unknown'
                    if outcome['outcome'] != expected or response['result_status'] == 'no_op':
                        errors.append('jj_publication_response_outcome')
                    if owner['receipt_ref'] != outcome['result_receipt_ref']:
                        errors.append('jj_publication_response_terminal_receipt')
                if owner['observable_work_id'] is not None:
                    work = read(owner['observable_work_id'])
                    root_schema = json.loads((Path(canon_root) / 'Plans/full_thread_runtime_contracts.schema.json').read_text())
                    validator = Draft202012Validator({'$ref':root_schema['$id']+'#/$defs/ObservableWorkRecord'},registry=registry,format_checker=FormatChecker())
                    if not validator.is_valid(work):
                        errors.append('jj_publication_response_work_schema')
                    else:
                        errors += full_thread_semantic_failures('ObservableWorkRecord',work)
                        if work['observable_work_id'] != owner['observable_work_id'] or work['identity'] != original['identity']:
                            errors.append('jj_publication_response_actual_work_identity')
                elif owner['outcome'] == 'accepted':
                    errors.append('jj_publication_response_accepted_work_missing')
    except Exception as exc:
        errors.append('jj_publication_response_unresolved:' + type(exc).__name__)
    if any(live[ref] != value for ref, value in records.items()):
        errors.append('jj_publication_response_owner_record_mutated')
    if inputs != saved:
        errors.append('jj_publication_response_inputs_mutated')
    return sorted(set(errors))


def fixture_dependencies(value, *, ui_module):
    """Synthetic fixture reader and existing static digest; never native proof."""
    records = deepcopy(value['records'])
    return {'resolve_owner_record': lambda ref: deepcopy(records[ref]),
            'canonical_request_digest': ui_module.owner_result_digest}


def jj_publication_dispatch_semantic_failures(definition, value, *, ui_module=None):
    if definition == 'dispatch_binding':
        return full_thread_semantic_failures('IdentityEnvelope', value['identity'])
    if definition != 'fixture_case':
        return []
    if ui_module is None:
        import pm_ui_command_response as ui_module
    return ui_module.response_bundle_failures(value['bundle'], **fixture_dependencies(value, ui_module=ui_module))
