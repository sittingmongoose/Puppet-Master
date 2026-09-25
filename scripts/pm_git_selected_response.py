"""Git-three static central response composition, not native authentication.

resolve_record supplies authentic retained owner values; canonical_request_digest
implements the existing native canonical digest contract. These are explicit
trusted-input prerequisites, not authentication established by this adapter.
"""
from copy import deepcopy
import re

from pm_git_selected_three import result_failures, shape_failures

COMMANDS = frozenset(('cmd.git.commit', 'cmd.source_control.stash.create',
                      'cmd.source_control.branch.create'))
SCHEMA = 'Plans/git_selected_three.schema.json'
BINDING = {'path': SCHEMA, 'json_pointer': '#/$defs/result',
           'schema_id': 'pm.source_control.git_selected.result.v1'}


def response_failures(response, outcome, owner_result, owner_request, normalized_request,
                      *, resolve_record, canonical_request_digest, canon_root):
    """Compose actual original/retained values; never infer current authority."""
    inputs = (response, outcome, owner_result, owner_request, normalized_request)
    snapshots = deepcopy(inputs)
    response, outcome, result, request, normalized = snapshots
    if not callable(resolve_record) or not callable(canonical_request_digest):
        return ['git3_response_owner_dependencies_missing']
    failures = []
    if shape_failures('request', request, canon_root=canon_root):
        return ['git3_response_original_schema']
    if shape_failures('result', result, canon_root=canon_root):
        return ['git3_response_result_schema']
    records = {}

    def read(ref):
        if ref not in records:
            records[ref] = deepcopy(resolve_record(ref))
        return deepcopy(records[ref])

    failures += result_failures(request, result, resolve_record=read, canon_root=canon_root)
    if failures:
        if inputs != snapshots:
            failures.append('git3_response_inputs_mutated')
        return failures
    context = read(request['repository_context_ref'])
    receipt = read(result['operation_receipt_ref'])
    if response['command_id'] not in COMMANDS or request['command_id'] != response['command_id']:
        failures.append('git3_response_command')
    if request['command_instance_id'] != response['command_instance_id']:
        failures.append('git3_response_instance')
    if result['original_request_ref'] != response['request_ref'] or result['original_request_ref'] != normalized.get('request_ref'):
        failures.append('git3_response_original_ref')
    if request['idempotency_key'] != outcome['idempotency_key']:
        failures.append('git3_response_idempotency')
    digest_input = deepcopy(request)
    try:
        digest = canonical_request_digest(digest_input)
        if not isinstance(digest, str) or re.fullmatch('[0-9a-f]{64}', digest) is None:
            failures.append('git3_response_digest_contract')
        elif digest != outcome['payload_sha256'] or digest != normalized.get('payload_sha256'):
            failures.append('git3_response_original_payload')
    except Exception:
        failures.append('git3_response_digest_unavailable')
    if digest_input != request:
        failures.append('git3_response_digest_input_mutated')
    lineage, identity = context['lineage'], outcome['identity']
    fields = ('project_id', 'project_home_server_id', 'execution_host_id',
              'execution_environment_id', 'source_location_id', 'topology_generation')
    if (identity['scope_kind'] != 'project'
            or any(lineage[field] != identity.get(field) for field in fields)
            or any(lineage.get(source) != identity.get(target)
                   for source, target in (('plan_id', 'named_plan_id'), ('goal_id', 'goal_id')))):
        failures.append('git3_response_context_identity')
    if receipt['operation_id'] != response['operation_id'] or receipt['operation_id'] != identity['operation_id']:
        failures.append('git3_response_operation')
    if result['operation_receipt_ref'] != outcome['result_receipt_ref']:
        failures.append('git3_response_receipt')
    expected = {'succeeded': 'succeeded', 'blocked': 'rejected', 'failed': 'failed',
                'cancelled': 'cancelled', 'recovery_required': 'terminal_unknown',
                'effect_unknown': 'terminal_unknown'}[receipt['outcome']]
    if result['native_effect_ref'] is not None and read(result['native_effect_ref'])['completion'] == 'unknown':
        expected = 'terminal_unknown'
    if outcome['outcome'] != expected or response['result_status'] == 'no_op':
        failures.append('git3_response_outcome')
    if inputs != snapshots:
        failures.append('git3_response_inputs_mutated')
    return failures
