"""Finite Doctor source joins, not native query execution or authority issuance.

All resolver callbacks retrieve actual original owner records. Every validation
callback returns a list of failures (empty only on success); booleans and absent
callbacks fail closed. Callers hold the native admission/source fences. Static
test doubles cannot provide those fences, authentication or physical custody.
"""
from datetime import datetime
from functools import lru_cache
import json
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from referencing.exceptions import Unresolvable


@lru_cache(maxsize=1)
def _schemas():
    plans = Path(__file__).resolve().parents[1] / 'Plans'
    schemas = [json.loads((plans / name).read_text()) for name in (
        'doctor_contracts.schema.json', 'doctor_query_controller_contracts.schema.json',
        'backup_restore_system_contracts.schema.json')]
    return schemas[1], Registry().with_resources((s['$id'], Resource.from_contents(s)) for s in schemas)


def structural_errors(definition, value):
    schema, registry = _schemas()
    return [e.message for e in Draft202012Validator(
        {'$schema': schema['$schema'], '$ref': schema['$id'] + '#/$defs/' + definition},
        registry=registry, format_checker=FormatChecker()).iter_errors(value)]


def _time(value):
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


def _check(callback, label, *args):
    try:
        errors = callback(*args)
    except (KeyError, TypeError, ValueError, OSError, Unresolvable):
        return [label + '_unavailable']
    if not isinstance(errors, list) or not all(isinstance(x, str) and x for x in errors):
        return [label + '_invalid_response']
    return [label + ':' + x for x in errors]


def doctor_query_semantic_failures(definition, value):
    errors = []
    if definition == 'doctor_batch_request':
        ids = [m['member_id'] for m in value['members']]
        identities = [(m['descriptor']['check_id'], json.dumps(m['target'], sort_keys=True)) for m in value['members']]
        if len(ids) != len(set(ids)) or len(identities) != len(set(identities)):
            errors.append('duplicate_selected_member')
        if _time(value['deadline_utc']) <= _time(value['requested_at_utc']):
            errors.append('invalid_batch_deadline')
        for member in value['members']:
            if member['target']['kind'] not in member['descriptor']['target_kinds']:
                errors.append('descriptor_target_kind_mismatch')
            scope, target = value['scope'], member['target']
            if scope['kind'] in ('server', 'project') and target['server_id'] != scope['server_id']:
                errors.append('selected_target_outside_server_scope')
            if scope['kind'] == 'project' and target['project_id'] != scope['project_id']:
                errors.append('selected_target_outside_project_scope')
    elif definition == 'doctor_read_admission':
        if _time(value['expires_at_utc']) <= _time(value['evaluated_at_utc']):
            errors.append('invalid_admission_lifetime')
        if value['decision'] != 'allow' and value['reason_ref'] is None:
            errors.append('refusal_reason_missing')
    elif definition == 'doctor_owner_query_request':
        if _time(value['deadline_utc']) <= _time(value['dispatched_at_utc']):
            errors.append('invalid_query_deadline')
    elif definition == 'doctor_owner_query_result':
        if _time(value['finished_at_utc']) < _time(value['started_at_utc']):
            errors.append('query_time_reversed')
    elif definition == 'doctor_batch_result':
        ids = [o['member_id'] for o in value['outcomes']]
        if len(ids) != len(set(ids)):
            errors.append('duplicate_member_outcome')
        controls = [c['control_id'] for c in value['controls']]
        if len(controls) != len(set(controls)):
            errors.append('duplicate_control')
        if _time(value['finished_at_utc']) < _time(value['started_at_utc']):
            errors.append('batch_time_reversed')
        if not value['outcomes'] and value['status'] != 'no_applicable_checks':
            errors.append('empty_batch_not_health')
        if value['outcomes'] and value['status'] == 'no_applicable_checks':
            errors.append('nonempty_no_applicable_checks')
        all_completed = bool(value['outcomes']) and all(o['status'] == 'completed' for o in value['outcomes'])
        if (value['status'] == 'completed') != all_completed:
            errors.append('batch_completion_mismatch')
        for outcome in value['outcomes']:
            if outcome['status'] == 'completed' and any(outcome[k] is None for k in ('query_ref', 'result_ref', 'finding_ref')):
                errors.append('completed_member_missing_source')
            if outcome['result_ref'] is not None and outcome['query_ref'] is None:
                errors.append('result_without_original_query')
            if outcome['status'] == 'cancelled' and outcome['query_ref'] is not None and outcome['result_ref'] is None:
                errors.append('started_cancellation_missing_owner_result')
            if outcome['status'] in ('unsupported', 'deferred', 'skipped') and outcome['query_ref'] is not None:
                errors.append('unstarted_disposition_has_query')
        for control in value['controls']:
            if not (_time(value['started_at_utc']) <= _time(control['recorded_at_utc']) <= _time(value['finished_at_utc'])):
                errors.append('control_outside_batch_lifetime')
            if control['action'] in ('stop_scheduling', 'detach_viewer'):
                if control['member_id'] is not None or control['query_ref'] is not None or control['outcome'] not in ('applied', 'refused'):
                    errors.append('global_control_wrong_shape')
            elif control['member_id'] is None or control['query_ref'] is None or control['outcome'] == 'applied':
                errors.append('cancel_control_wrong_shape')
    return errors


def validate_doctor_batch(batch_id, result_id, *, resolve_record, resolve_descriptor,
        verify_frozen_selection, validate_owner_value, verify_read_admission,
        verify_owner_read, verify_member_disposition, verify_batch_controls,
        check_current_disclosure):
    """Resolve original batch and actual outcome; no caller-provided facts authority.

    resolve_record(kind, ref) retrieves actual owner-issued records; kinds are
    doctor_batch_request/result, doctor_owner_query_request/result,
    doctor_read_admission, owner_request, owner_result. Opaque ref != record ID
    is allowed only by this authentic resolver. resolve_descriptor(check, rev)
    retrieves that actual immutable registry edition, not latest.

    verify_frozen_selection(batch) authenticates actor/scope, exact original
    registry/applicability population and bounded budget, including empty sets.
    validate_owner_value(schema_ref, value) resolves the REAL descriptor-admitted
    schema and fully validates the actual record; nonexistent schemas fail.
    verify_read_admission(batch, member, query, decision) authenticates historical
    Permissions issuance and dispatch-time read/audit/current authority, plus
    FileSafe/storage/network/cost restrictions; no fabricated executor snapshot.
    verify_owner_read(batch, member, query, owner_request, result, owner_result)
    authenticates actual query/result derivation, exact target/schema, read-only
    adapter, governor/shared work, source generation and redaction. It must not
    replace missing owner adapters with a generic successfully shaped payload.
    verify_member_disposition(batch, member, outcome, query, result, finding) authenticates
    applicability/support, normalized finding, present owner/cache/descriptor
    currentness and nonexecution/cancellation/error evidence. Missing interfaces
    cannot be laundered as unsupported; completed read is not healthy by itself.
    verify_batch_controls(batch, result, queries) authenticates original control
    boundaries, shared-work cancellation truth, detach independence and result
    derivation. check_current_disclosure(batch, result) runs LAST under native
    fence and may refuse disclosure without rewriting historical admission.
    """
    try:
        batch = resolve_record('doctor_batch_request', batch_id)
        result = resolve_record('doctor_batch_result', result_id)
    except (KeyError, TypeError, ValueError, OSError):
        return ['original_batch_or_result_unavailable']
    errors = structural_errors('doctor_batch_request', batch) + structural_errors('doctor_batch_result', result)
    if errors:
        return ['invalid_shape'] + errors
    errors += doctor_query_semantic_failures('doctor_batch_request', batch)
    errors += doctor_query_semantic_failures('doctor_batch_result', result)
    if batch['batch_id'] != batch_id or result['batch_id'] != batch_id or result['result_id'] != result_id:
        errors.append('original_batch_result_identity')
    if _time(result['started_at_utc']) < _time(batch['requested_at_utc']):
        errors.append('batch_result_before_request')
    members = {m['member_id']: m for m in batch['members']}
    if set(members) != {o['member_id'] for o in result['outcomes']}:
        errors.append('not_exact_frozen_membership')
    errors += _check(verify_frozen_selection, 'frozen_selection', batch)
    queries = {}
    for outcome in result['outcomes']:
        if outcome['member_id'] not in members:
            continue
        member = members[outcome['member_id']]
        descriptor = member['descriptor']
        try:
            actual_descriptor = resolve_descriptor(descriptor['check_id'], descriptor['descriptor_revision'])
        except (KeyError, TypeError, ValueError, OSError):
            errors.append('descriptor_unavailable')
            continue
        if actual_descriptor != descriptor:
            errors.append('descriptor_original_mismatch')
        query = query_result = None
        if outcome['query_ref'] is not None:
            try:
                query = resolve_record('doctor_owner_query_request', outcome['query_ref'])
                decision = resolve_record('doctor_read_admission', query['admission_ref'])
            except (KeyError, TypeError, ValueError, OSError):
                errors.append('query_or_admission_unavailable')
                continue
            bad = structural_errors('doctor_owner_query_request', query) + structural_errors('doctor_read_admission', decision)
            if bad:
                errors += ['invalid_query_or_admission'] + bad
                continue
            errors += doctor_query_semantic_failures('doctor_owner_query_request', query)
            errors += doctor_query_semantic_failures('doctor_read_admission', decision)
            if query['query_id'] in queries:
                errors.append('query_reused_for_two_members')
            queries[query['query_id']] = query
            for record in (query, decision):
                if record['batch_id'] != batch_id or record['member_id'] != member['member_id']:
                    errors.append('query_member_identity')
            for key, expected in [('query_id', query['query_id']), ('actor_ref', batch['actor_ref']),
                    ('scope', batch['scope']), ('target', member['target']),
                    ('descriptor_revision', descriptor['descriptor_revision']),
                    ('expected_owner_generation', member['expected_owner_generation']),
                    ('expected_cache_generation', member['expected_cache_generation']),
                    ('permission_class', descriptor['permission_class']),
                    ('redaction_profile_ref', descriptor['redaction_profile_ref'])]:
                if decision[key] != expected:
                    errors.append('admission_' + key)
            dispatch = _time(query['dispatched_at_utc'])
            if decision['decision'] != 'allow' or not (_time(decision['evaluated_at_utc']) <= dispatch < _time(decision['expires_at_utc'])):
                errors.append('query_without_valid_admission')
            if not (_time(batch['requested_at_utc']) <= dispatch < _time(batch['deadline_utc'])):
                errors.append('query_outside_batch_deadline')
            duration_ms = (_time(query['deadline_utc']) - dispatch).total_seconds() * 1000
            if _time(query['deadline_utc']) > _time(batch['deadline_utc']) or duration_ms > descriptor['timeout_ms']:
                errors.append('query_exceeds_descriptor_budget')
            if descriptor['support_state'] != 'active':
                errors.append('query_on_inactive_descriptor')
            errors += _check(verify_read_admission, 'read_admission', batch, member, query, decision)
            try:
                owner_request = resolve_record('owner_request', query['owner_request_ref'])
            except (KeyError, TypeError, ValueError, OSError):
                errors.append('actual_owner_request_unavailable')
                continue
            if query['owner_request_schema_ref'] != descriptor['request_schema_ref']:
                errors.append('owner_request_schema_mismatch')
            request_errors = _check(validate_owner_value, 'owner_request_shape', descriptor['request_schema_ref'], owner_request)
            errors += request_errors
            if request_errors:
                continue
            if isinstance(owner_request, dict) and owner_request.get('schema_id') == 'pm.backup_restore_system.repository_read_request.v1':
                for key, expected in [('query_id', query['query_id']), ('repository_id', member['target']['identity_ref']),
                        ('server_id', member['target']['server_id'])]:
                    if owner_request.get(key) != expected:
                        errors.append('owner_read_' + key)
            owner_result = None
            if outcome['result_ref'] is not None:
                try:
                    query_result = resolve_record('doctor_owner_query_result', outcome['result_ref'])
                except (KeyError, TypeError, ValueError, OSError):
                    errors.append('query_result_unavailable')
                    continue
                bad = structural_errors('doctor_owner_query_result', query_result)
                if bad:
                    errors += ['invalid_query_result'] + bad
                    continue
                errors += doctor_query_semantic_failures('doctor_owner_query_result', query_result)
                for key in ('query_id', 'batch_id', 'member_id'):
                    if query_result[key] != query[key]:
                        errors.append('query_result_' + key)
                if query_result['owner_result_schema_ref'] != descriptor['result_schema_ref']:
                    errors.append('owner_result_schema_mismatch')
                if _time(query_result['started_at_utc']) < dispatch or _time(query_result['finished_at_utc']) > _time(result['finished_at_utc']):
                    errors.append('query_result_time_outside_batch')
                if outcome['status'] == 'completed' and (query_result['status'] != 'completed' or query_result['observed_owner_generation'] != member['expected_owner_generation']):
                    errors.append('completed_member_unproved')
                if outcome['status'] == 'completed' and _time(query_result['finished_at_utc']) > _time(query['deadline_utc']):
                    errors.append('completed_member_after_deadline')
                if outcome['status'] == 'cancelled' and query_result['status'] != 'cancelled':
                    errors.append('cancelled_member_without_owner_cancellation')
                if query_result['owner_result_ref'] is not None:
                    try:
                        owner_result = resolve_record('owner_result', query_result['owner_result_ref'])
                    except (KeyError, TypeError, ValueError, OSError):
                        errors.append('actual_owner_result_unavailable')
                        continue
                    errors += _check(validate_owner_value, 'owner_result_shape', descriptor['result_schema_ref'], owner_result)
                    if isinstance(owner_request, dict) and owner_request.get('schema_id') == 'pm.backup_restore_system.repository_read_request.v1':
                        if not isinstance(owner_result, dict):
                            errors.append('invalid_backup_owner_result')
                        else:
                            for key in ('repository_binding_id', 'repository_id', 'server_id'):
                                if owner_result.get(key) != owner_request[key]:
                                    errors.append('backup_read_result_' + key)
                            if owner_result.get('currentness_ref') != owner_request['expected_currentness_ref']:
                                errors.append('backup_read_currentness_mismatch')
            errors += _check(verify_owner_read, 'owner_read', batch, member, query, owner_request, query_result, owner_result)
        finding = None
        if outcome['finding_ref'] is not None:
            try:
                finding = resolve_record('doctor_finding_projection', outcome['finding_ref'])
            except (KeyError, TypeError, ValueError, OSError):
                errors.append('finding_unavailable')
                continue
            bad = structural_errors('doctor_finding_projection', finding)
            if bad:
                errors += ['invalid_finding'] + bad
                continue
            for key, expected in [('check_id', descriptor['check_id']), ('descriptor_revision', descriptor['descriptor_revision']),
                    ('owner_doc_ref', descriptor['owner_doc_ref']), ('target_kind', member['target']['kind']),
                    ('target_id', member['target']['identity_ref']), ('project_id', member['target']['project_id']),
                    ('check_cost_class', descriptor['cost_class'])]:
                if finding[key] != expected:
                    errors.append('finding_' + key)
            if outcome['status'] == 'completed':
                if finding['owner_generation'] != member['expected_owner_generation'] or finding['cache_generation'] != member['expected_cache_generation']:
                    errors.append('finding_generation_mismatch')
                if query_result and finding['last_known_result_ref'] != query_result['owner_result_ref']:
                    errors.append('finding_actual_result_mismatch')
            if outcome['status'] in ('failed', 'cancelled', 'stale') and finding['status'] == 'healthy':
                errors.append('uncompleted_member_cannot_claim_health')
        errors += _check(verify_member_disposition, 'member_disposition', batch, member, outcome, query, query_result, finding)
    for control in result['controls']:
        if control['action'] == 'stop_scheduling' and control['outcome'] == 'applied':
            if any(_time(q['dispatched_at_utc']) > _time(control['recorded_at_utc']) for q in queries.values()):
                errors.append('query_started_after_scheduling_stop')
        if control['action'] == 'cancel_member':
            matches = [o for o in result['outcomes'] if o['member_id'] == control['member_id'] and o['query_ref'] == control['query_ref']]
            if len(matches) != 1:
                errors.append('control_wrong_member_query')
            elif control['outcome'] == 'owner_cancelled' and matches[0]['status'] != 'cancelled':
                errors.append('control_cancellation_not_owner_terminal')
    errors += _check(verify_batch_controls, 'batch_controls', batch, result, queries)
    errors += _check(check_current_disclosure, 'current_disclosure', batch, result)
    return errors
