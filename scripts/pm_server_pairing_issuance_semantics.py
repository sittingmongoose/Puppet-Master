"""Finite Server pairing metadata joins, not a token generator or dispatcher.

Resolvers/proof adapters belong to actual owners, not an authority map supplied
by a requester. Fabricated fixture adapters below demonstrate relationships only.
No raw material, usable handle, QR bytes or secret-bearing URL is returned here.
"""
from datetime import datetime
from functools import lru_cache
import json
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource


@lru_cache(maxsize=1)
def schemas():
    root = Path(__file__).resolve().parents[1] / 'Plans'
    docs = [json.loads((root / p).read_text()) for p in (
        'server_pairing_issuance_contracts.schema.json', 'server_system_contracts.schema.json')]
    return docs, Registry().with_resources((s['$id'], Resource.from_contents(s)) for s in docs)


def structural_errors(definition, value):
    docs, registry = schemas()
    schema = docs[1] if definition in ('pairing_run', 'pairing_receipt', 'client_trust_record') else docs[0]
    return [e.message for e in Draft202012Validator(
        {'$schema': schema['$schema'], '$ref': schema['$id'] + '#/$defs/' + definition},
        registry=registry, format_checker=FormatChecker()).iter_errors(value)]


def time(value):
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


def proof(callback, label, *args):
    try:
        result = callback(*args)
    except (KeyError, ValueError, TypeError, OSError):
        return [label + '_unavailable']
    if not isinstance(result, list) or any(not isinstance(x, str) or not x for x in result):
        return [label + '_invalid_response']
    return [label + ':' + x for x in result]


def state_errors(value):
    errors = []
    if not time(value['issued_at_utc']) < time(value['expires_at_utc']):
        errors.append('invalid_invitation_lifetime')
    if time(value['updated_at_utc']) < time(value['issued_at_utc']):
        errors.append('invalid_invitation_time')
    if value['terminal_at_utc'] is not None and not time(value['issued_at_utc']) <= time(value['terminal_at_utc']) <= time(value['updated_at_utc']):
        errors.append('invalid_invitation_terminal_time')
    if value['state'] == 'expired' and time(value['terminal_at_utc']) < time(value['expires_at_utc']):
        errors.append('premature_expiry')
    return errors


def validate_issuance_result(result_ref, *, resolve_record, verify_original_admission,
        verify_transition, verify_pairing_completion, check_current_disclosure):
    """Historical original-result validation; never replay an effect.

    resolve_record(kind, ref) retrieves original immutable values of kinds
    result/request/state/pairing_run/pairing_receipt/client_trust_record.
    Admission authenticates original actor/Server claim or trusted authority,
    policy/audience generations, rate limits, time/lifetime, idempotency and
    exact before-currentness. Transition authenticates actual native allocation,
    token generation/digest, atomic current-generation retirement/publication,
    single-use exclusion, no-effect refusal and fenced unknown recovery, plus
    original nonsecret result custody. Never infer those facts from equal refs.
    Completion validates real approved trust issuance and confirmation, including
    protected original material consumption (manual_url keeps its legacy null
    material field), ClientAccessPolicy semantics and immutable effect evidence.
    Final disclosure rechecks source custody and current permission AFTER helpers.
    All callbacks return failure lists, not permission booleans. Native owner
    adapters and durable fences are prerequisites, not provided by this oracle.
    """
    def read(kind, ref, definition):
        value = resolve_record(kind, ref)
        if structural_errors(definition, value):
            raise ValueError('invalid original owner value')
        return value
    try:
        result = read('result', result_ref, 'issuance_result')
        request = read('request', result['request_ref'], 'issuance_request')
        before = None if result['before_state_ref'] is None else read('state', result['before_state_ref'], 'invitation_state')
        after = None if result['after_state_ref'] is None else read('state', result['after_state_ref'], 'invitation_state')
    except (KeyError, ValueError, TypeError, OSError):
        return ['original_pairing_source_unavailable']
    errors = []
    def eq(a, b, label):
        if a != b:
            errors.append(label)
    eq(result_ref, result['result_ref'], 'result_identity')
    eq(request['request_ref'], result['request_ref'], 'request_identity')
    eq(request['operation_id'], result['operation_id'], 'operation_identity')
    settled = time(result['settled_at_utc'])
    if settled < time(request['requested_at_utc']):
        errors.append('result_before_request')
    scope = ('server_id', 'server_fingerprint', 'audience', 'client_access_policy_id', 'policy_generation')
    for state, reference in ((before, result['before_state_ref']), (after, result['after_state_ref'])):
        if state is None:
            continue
        errors += state_errors(state)
        eq(state['state_ref'], reference, 'state_identity')
        for key in scope:
            eq(state[key], request[key], 'state_' + key)
        if time(state['updated_at_utc']) > settled:
            errors.append('state_after_result')
    action, outcome = request['action'], result['outcome']
    if action == 'issue':
        if before is not None:
            errors.append('issue_has_predecessor')
    elif before is None:
        errors.append('missing_predecessor')
    if before is not None:
        eq(before['pairing_session_id'], request['pairing_session_id'], 'request_session')
        eq(before['generation'], request['expected_generation'], 'request_generation')
        eq(before['currentness_ref'], request['expected_currentness_ref'], 'request_currentness')
    expected = {'issue': 'issued', 'replace': 'replaced', 'cancel': 'cancelled', 'consume': 'consumed', 'expire': 'expired'}
    if outcome not in ('blocked', 'recovery_required'):
        eq(outcome, expected[action], 'action_outcome')
        if after is not None:
            target = 'active' if action in ('issue', 'replace') else outcome
            eq(after['state'], target, 'result_state')
            if action in ('issue', 'replace') and not time(request['requested_at_utc']) <= time(after['issued_at_utc']) <= settled < time(after['expires_at_utc']):
                errors.append('issuance_not_fresh')
        if before is not None and after is not None:
            eq(after['pairing_session_id'], before['pairing_session_id'], 'replacement_session')
            if action == 'replace':
                if before['state'] not in ('active', 'cancelled', 'expired'):
                    errors.append('unreplaceable_invitation')
                if after['generation'] <= before['generation'] or after['pairing_material_sha256'] == before['pairing_material_sha256']:
                    errors.append('replacement_reuses_material_or_generation')
                if after['currentness_ref'] == before['currentness_ref']:
                    errors.append('replacement_reuses_currentness')
            else:
                for key in ('generation', 'pairing_material_sha256', 'issued_at_utc', 'expires_at_utc'):
                    eq(after[key], before[key], 'terminal_rewrites_' + key)
                eq(before['state'], 'active', 'terminal_from_inactive')
                if not time(request['requested_at_utc']) <= time(after['terminal_at_utc']) <= time(after['updated_at_utc']) <= settled:
                    errors.append('terminal_before_request')
                if time(after['updated_at_utc']) < time(before['updated_at_utc']):
                    errors.append('terminal_time_regression')
                if action in ('cancel', 'consume') and settled >= time(before['expires_at_utc']):
                    errors.append('effect_after_expiry')
    elif outcome == 'blocked':
        eq(after, before, 'blocked_has_effect')
    elif after is not None and after['state'] != 'recovery_required':
        errors.append('uncertain_state_not_fenced')
    errors += proof(verify_original_admission, 'original_admission', request, before, result)
    errors += proof(verify_transition, 'owner_transition', request, before, after, result)
    if outcome == 'consumed' and before is not None and after is not None:
        try:
            run = read('pairing_run', request['pairing_run_ref'], 'pairing_run')
            receipt = read('pairing_receipt', run['receipt_ref'], 'pairing_receipt')
            trust = read('client_trust_record', receipt['client_trust_id'], 'client_trust_record')
            eq(after['consumed_pairing_run_ref'], request['pairing_run_ref'], 'consumption_run_ref')
            for key in ('server_id', 'pairing_session_id'):
                eq(run[key], before[key], 'pairing_run_' + key)
                eq(receipt[key], before[key], 'pairing_receipt_' + key)
            eq(run['pairing_generation'], before['generation'], 'pairing_run_generation')
            eq(run['state'], 'complete', 'pairing_not_complete')
            eq(run['explicit_approval'], True, 'pairing_not_approved')
            eq(receipt['pairing_outcome'], 'paired', 'receipt_not_paired')
            eq(receipt['receipt_id'], run['receipt_ref'], 'pairing_receipt_identity')
            eq(receipt['terminal_status'], 'succeeded', 'pairing_receipt_not_successful')
            eq(trust['state'], 'active', 'trust_not_active_at_issuance')
            eq(trust['server_id'], before['server_id'], 'trust_server')
            eq(trust['client_id'], run['candidate_client_id'], 'trust_client')
            eq(receipt['client_id'], run['candidate_client_id'], 'receipt_client')
            eq(trust['client_trust_id'], receipt['client_trust_id'], 'trust_identity')
            for key in ('policy_generation', 'trust_generation'):
                eq(receipt[key], trust[key], 'receipt_trust_' + key)
            for value in (receipt, trust):
                eq(value['client_access_policy_id'], before['client_access_policy_id'], 'pairing_access_policy')
                eq(value['policy_generation'], before['policy_generation'], 'pairing_policy_generation')
                eq(value['verified_fingerprint'], before['server_fingerprint'], 'pairing_fingerprint')
            eq(run['requested_access_policy_id'], before['client_access_policy_id'], 'run_access_policy')
            eq(run['expected_server_fingerprint'], before['server_fingerprint'], 'expected_fingerprint')
            eq(run['observed_server_fingerprint'], before['server_fingerprint'], 'observed_fingerprint')
            for value in (run, receipt):
                if run['method'] in ('qr', 'short_code') or value['pairing_material_sha256'] is not None:
                    eq(value['pairing_material_sha256'], before['pairing_material_sha256'], 'consumed_material')
            if run['method'] not in ('qr', 'short_code', 'manual_url'):
                errors.append('unrelated_pairing_method')
            if not time(before['issued_at_utc']) <= time(run['started_at_utc']) <= time(run['terminal_at_utc']) <= settled:
                errors.append('pairing_completion_time')
            if time(run['terminal_at_utc']) >= time(run['expires_at_utc']):
                errors.append('pairing_run_expired')
            if not time(receipt['started_at_utc']) <= time(receipt['completed_at_utc']) <= settled:
                errors.append('pairing_receipt_time')
            if not time(run['started_at_utc']) <= time(trust['issued_at_utc']) <= time(run['terminal_at_utc']):
                errors.append('trust_issuance_time')
            if trust['expires_at_utc'] is not None and time(trust['expires_at_utc']) <= time(run['terminal_at_utc']):
                errors.append('trust_expired_at_pairing')
            errors += proof(verify_pairing_completion, 'pairing_completion', request, before, run, receipt, trust, result)
        except (KeyError, ValueError, TypeError, OSError):
            errors.append('pairing_completion_unavailable')
    errors += proof(check_current_disclosure, 'current_disclosure', request, before, after, result)
    return sorted(set(errors))


def validate_protected_display(request_ref, *, resolve_display_request,
        resolve_current_invitation, now_utc, verify_protected_read, final_display_fence):
    """Metadata admission only; never returns token bytes or serializable handles.

    Protected-read owner verifies actual requesting Client/audience/access policy,
    live process/channel, protected source and screenshot/log exclusions. Its
    final fence re-resolves actual current authority after all helpers, covering
    replacement/consumption/revocation/restore races. Native material emission must
    stay in the same protected owner fence; this function is not a bearer permit.
    """
    try:
        request = resolve_display_request(request_ref)
        if structural_errors('protected_display_request', request):
            return ['invalid_display_request']
        state = resolve_current_invitation(request['server_id'], request['pairing_session_id'])
        if structural_errors('invitation_state', state):
            return ['invalid_current_invitation']
        now = time(now_utc)
        if now.tzinfo is None:
            return ['invalid_owner_time']
    except (KeyError, ValueError, TypeError, OSError):
        return ['protected_source_unavailable']
    errors = state_errors(state)
    if request['request_ref'] != request_ref:
        errors.append('display_request_identity')
    for key in ('server_id', 'server_fingerprint', 'pairing_session_id', 'audience', 'client_access_policy_id', 'policy_generation'):
        if request[key] != state[key]:
            errors.append('display_' + key)
    if request['expected_generation'] != state['generation']:
        errors.append('display_generation')
    if state['state'] != 'active' or not time(state['issued_at_utc']) <= now < time(state['expires_at_utc']):
        errors.append('invitation_not_displayable')
    if time(request['requested_at_utc']) > now or time(state['updated_at_utc']) > now:
        errors.append('display_time')
    if errors:
        return sorted(set(errors))
    errors += proof(verify_protected_read, 'protected_read', request, state)
    errors += proof(final_display_fence, 'display_fence', request, state)
    return sorted(set(errors))


def fixture_dependencies(value):
    """Explicit metadata-only doubles. Never configure these as native adapters."""
    records = {('request', value['request']['request_ref']): value['request'],
               ('result', value['result']['result_ref']): value['result']}
    for state in (value['before'], value['after']):
        if state is not None:
            records[('state', state['state_ref'])] = state
    return dict(resolve_record=lambda kind, ref: records[(kind, ref)],
        verify_original_admission=lambda *args: [], verify_transition=lambda *args: [],
        verify_pairing_completion=lambda *args: [], check_current_disclosure=lambda *args: [])


def pairing_issuance_semantic_failures(definition, value):
    if definition == 'invitation_state':
        return state_errors(value)
    if definition != 'issuance_fixture':
        return []
    if structural_errors(definition, value):
        return ['invalid_issuance_fixture']
    return validate_issuance_result(value['result']['result_ref'], **fixture_dependencies(value))
