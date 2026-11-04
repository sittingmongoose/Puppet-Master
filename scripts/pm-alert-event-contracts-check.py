#!/usr/bin/env python3
"""Static DG6A payload/custody oracle; grants no admission or native proof."""
import copy
import hashlib
import importlib.util
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
_spec = importlib.util.spec_from_file_location('pm_dg6a_readiness_codec', ROOT / 'scripts/pm-implementation-readiness.py')
_codec = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = _codec
_spec.loader.exec_module(_codec)

def load(path):
    return json.loads((ROOT / path).read_text())

def errors(payload, schema, guard):
    found = list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(payload))
    found += writer_policy_errors(guard.get('replay_policy', 'dedupe_by_idempotency_key'))
    if not found:
        if payload['result_revision'] != payload['prior_revision'] + 1:
            found.append('non-successor')
        if not guard['current'] or not guard['allowed'] or not guard['committed']:
            found.append('uncommitted/stale/refused')
        if payload.get('snooze_until', '9999') <= payload['ts']:
            found.append('expired snooze')
        if payload['command_id'] in ('cmd.alert.snooze', 'cmd.alert.mute_rule') and guard['protected']:
            found.append('protected interruption')
    return found

def packed(value):
    return _codec.canonical_messagepack_bytes(value)

def schema_ref_errors(schema):
    """Resolve every local reference, including unused definitions and optional leaves."""
    found = []
    def visit(node):
        if isinstance(node, dict):
            if '$ref' in node:
                ref, target = node['$ref'], schema
                try:
                    if ref != '#':
                        if not ref.startswith('#/'):
                            raise ValueError('unsupported non-local reference')
                        for part in unquote(ref[2:]).split('/'):
                            part = part.replace('~1', '/').replace('~0', '~')
                            target = target[int(part)] if isinstance(target, list) else target[part]
                    if not isinstance(target, (dict, bool)):
                        raise ValueError('target is not a schema')
                except (KeyError, IndexError, TypeError, ValueError):
                    found.append('unresolved schema reference: ' + str(ref))
            for child in node.values():
                visit(child)
        elif isinstance(node, list):
            for child in node:
                visit(child)
    visit(schema)
    return found

def check_schema(schema):
    Draft202012Validator.check_schema(schema)
    assert not schema_ref_errors(schema), schema_ref_errors(schema)

def operation_errors(value, schema):
    found = list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(value))
    if len(packed(value)) > 16384:
        found.append('operation exceeds 16384 encoded bytes')
    if found:
        return found
    payload, command = value['payload'], value['original_command']
    event_type = schema['properties']['schema_id']['const'].removeprefix('pm.storage_value.').removesuffix('_operation.v1').replace('alert_', 'alert.', 1)
    h = hashlib.sha256(packed([value['storage_instance_id'], value['project_id'], event_type,
                               value['idempotency_key']])).hexdigest()
    if value['operation_digest'] != h:
        found.append('operation identity digest mismatch')
    if value['event_id'] != 'evt_' + event_type.replace('.', '_') + '_' + h:
        found.append('event identity mismatch')
    if value['request_digest'] != request_digest(command, payload):
        found.append('frozen command digest mismatch')
    for key in command:
        if command[key] != payload.get(key):
            found.append('original command/payload ' + key)
    for key in ('project_id', 'idempotency_key'):
        if value[key] != payload[key]:
            found.append('operation/payload ' + key)
    if payload['result_revision'] != payload['prior_revision'] + 1:
        found.append('non-successor')
    prior, candidate = value['prior_owner_state'], value['candidate_owner_state']
    rule = event_type == 'alert.rule_muted'
    subject, source = ('alert_rule_id', 'alert_rule_ref') if rule else ('alert_id', 'alert_record_ref')
    state_key = 'mute_state' if rule else 'acknowledgement_state'
    prefix = 'mute_state' if rule else ('acknowledgement_state' if event_type == 'alert.acknowledged' else 'alert_state')
    for name, snapshot, revision, state in [('prior', prior, 'prior_revision', 'prior_' + prefix),
                                             ('candidate', candidate, 'result_revision', 'result_' + prefix)]:
        for field, expected in [('project_id', payload['project_id']), (subject, payload[subject]),
                                 ('source_record_ref', payload[source]), ('revision', payload[revision]),
                                 (state_key, payload[state])]:
            if snapshot[field] != expected:
                found.append(name + ' owner ' + field)
    if rule:
        if candidate['root_cause_ref'] != prior['root_cause_ref']:
            found.append('candidate owner root_cause_ref')
        if candidate['mute_expires_at'] != payload.get('mute_expires_at'):
            found.append('candidate owner mute_expires_at')
    else:
        expected_unread = False if event_type == 'alert.acknowledged' else prior['unread']
        expected_visible = prior['inbox_visible'] if event_type == 'alert.acknowledged' else False
        expected_snooze = payload['snooze_until'] if event_type == 'alert.snoozed' else prior['snooze_until']
        for field, expected in [('unread', expected_unread), ('inbox_visible', expected_visible), ('snooze_until', expected_snooze)]:
            if candidate[field] != expected:
                found.append('candidate owner ' + field)
    if payload.get('snooze_until', '9999') <= payload['ts']:
        found.append('expired snooze')
    return found


def request_digest(command, payload):
    return hashlib.sha256(packed(dict(original_command=command, candidate_payload=payload))).hexdigest()


def isolated_cases(kind, owner, family, fixture):
    spec = importlib.util.spec_from_file_location('dg6a_guard_vectors', ROOT / 'scripts/pm-dg6a-guard-check.py')
    helper = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(helper)
    return helper.vectors(kind, owner, family, fixture)


def protocol_errors(context, original):
    """Current retry evidence; the retained historical reader never calls this."""
    found = writer_policy_errors(context['replay_policy'])
    for field in ('admitted', 'allowed', 'current', 'source_verified'):
        if not context[field]:
            found.append(field)
    if context['receipt_event_id'] != original['event_id']:
        found.append('wrong original receipt')
    if request_digest(context['retry_command'], context['retry_payload']) != original['request_digest']:
        found.append('idempotency_conflict')
    return found

def operation_size_cases(original, schema, cases):
    for case in cases:
        value = copy.deepcopy(original)
        value.update(state='committed', owner_commit_ref='x', result_ref='original', dispatch_receipt_ref='original')
        target = case['encoded_bytes']
        for _ in range(4):
            ref = value['owner_commit_ref']
            delta = target - len(packed(value))
            value['owner_commit_ref'] = ref + 'x' * delta if delta >= 0 else ref[:delta]
        assert len(packed(value)) == target
        # Ensure an oversized negative reaches the physical guard with a valid shape.
        assert not list(Draft202012Validator(schema).iter_errors(value))
        assert (not operation_errors(value, schema)) == case['valid'], case['name']
    value = copy.deepcopy(original)
    value.update(state='committed', owner_commit_ref='x' * 17000, result_ref='original', dispatch_receipt_ref='original')
    assert not list(Draft202012Validator(schema).iter_errors(value))
    assert operation_errors(value, schema), 'oversized owner snapshots accepted'
    return len(cases) + 1

def checkpoint_errors(value, schema, original_context):
    """Join the synthetic checkpoint to independently supplied original-event context.

    Internal token agreement alone cannot authenticate its Storage instance. Native
    source authentication remains a separate NOT_RUN obligation.
    """
    found = list(Draft202012Validator(schema).iter_errors(value))
    if len(packed(value)) > 16384:
        found.append('checkpoint exceeds 16384 encoded bytes')
    if not found:
        token = value['index_read_token']
        if not (value['storage_instance_id'] == token['storage_instance_id'] == token['source_selection']['storage_instance_id']):
            found.append('foreign Storage token')
        for field in ('storage_instance_id', 'project_id', 'server_id', 'scope_partition'):
            if field in value and field in original_context and value[field] != original_context[field]:
                found.append('foreign original-event context: ' + field)
    return found

def checkpoint_context_cases(value, schema, original_context, checker=checkpoint_errors):
    count = 0
    foreign = '00000000-0000-4000-8000-000000000002'
    for coherent in (False, True):
        altered = copy.deepcopy(value)
        altered['index_read_token']['storage_instance_id'] = foreign
        if coherent:
            altered['storage_instance_id'] = foreign
            altered['index_read_token']['source_selection']['storage_instance_id'] = foreign
        assert checker(altered, schema, original_context), 'foreign checkpoint accepted'
        count += 1
    return count

def profile_errors(registry, fid, kind, group):
    profile = registry['storage_profile']['family_profiles'].get(fid)
    if not profile:
        return ['missing profile']
    expected_file = 'derived' if kind == 'redb_checkpoint' else 'canonical'
    if profile['redb_file'] != expected_file or profile['storage_group'] != group:
        return ['wrong physical binding']
    if not 1 <= profile.get('max_value_bytes', 0) <= 16384:
        return ['missing/oversized maximum']
    return []

def writer_policy_errors(policy):
    if policy == 'projector_replay_only':
        return ['replay_only_not_appendable']
    return [] if policy == 'dedupe_by_idempotency_key' else ['unsupported current writer policy']

def producer_cases(fixtures, event_type, payload):
    """Exercise the canonical partition codec and EventRecord semantic preimage.

    This is static coverage of existing owners, never an admitted EventRecord writer.
    """
    count = 0
    partition = _codec.scope_partition('project', payload['project_id'])
    for case in fixtures['partition_cases']:
        assert (case['value'] == partition) == case['valid'], case['name']
        count += 1
    record = dict(event_type=event_type, scope_kind='project', project_id=payload['project_id'],
                  thread_id=None, run_id=None, node_id=None, attempt_id=None,
                  actor_ref=payload['actor_ref'], requested_account_ref=None, effective_account_ref=None,
                  occurred_at_utc=payload.get('ts', payload.get('settled_at_utc')), producer_sequence_id=None,
                  correlation_id=payload['correlation_id'], causation_event_id=None, parent_event_id=None,
                  idempotency_key=payload['idempotency_key'], payload_schema_id=payload['schema_id'],
                  payload=payload, payload_ref=None, redaction_profile='secret_refs_only', migration=None,
                  sequence_id=1, observed_at_utc='2026-11-04T18:00:00Z', persisted_at_utc='2026-11-04T18:00:00Z')
    original = _codec.event_producer_semantic_digest(record)
    for case in fixtures['semantic_digest_cases']:
        retry = copy.deepcopy(record)
        retry.update(case['envelope_changes'])
        retry['payload'].update(case['payload_changes'])
        assert (original == _codec.event_producer_semantic_digest(retry)) == case['same_digest'], case['name']
        count += 1
    return count

def history_page(events, event_type, project_id, after, frontier, publication_id, index_read_token):
    """Static reference oracle for bounded read-through; not native source authentication."""
    def response(refs, cursor):
        return dict(publication_id=publication_id, index_read_token=index_read_token,
                    after_sequence_id=cursor, event_refs=refs, complete=cursor == frontier)
    if after > frontier or len(packed(response([], after))) > 16384:
        raise ValueError('unpageable metadata or invalid cursor')
    result, scanned, cursor = [], 0, after
    for event in events:
        seq = event['sequence_id']
        if not after < seq <= frontier:
            continue
        match = event['event_type'] == event_type and event['project_id'] == project_id
        candidate = result + [event['event_ref']] if match else result
        if scanned == 256 or len(candidate) > 64:
            break
        if len(packed(response(candidate, seq))) > 16384:
            if not result:
                raise ValueError('individually unpageable ref/metadata')
            break
        result, scanned, cursor = candidate, scanned + 1, seq
    return response(result, cursor)

class HistoryUnavailable(ValueError):
    def __init__(self, guards):
        self.guards = guards
        super().__init__('historical read unavailable: ' + ', '.join(guards))


def historical_guards(request, expected, payload_schemas, cp_schema, cp_checker):
    """Synthetic retained-original evidence, independent of current writer predicates.

    Expected event/receipt/source/publication are separately supplied fixture evidence,
    never reconstructed from the candidate being checked. This is not native auth.
    Each guard owns one distinct binding so its negative can be isolated and killed.
    """
    cp, event = request['checkpoint'], request['event']
    original = expected['event']
    publication = {k: v for k, v in cp.items() if k != 'state'}
    expected_publication = {k: v for k, v in expected['checkpoint'].items() if k != 'state'}
    identity_fields = set(original) - {'payload', 'receipt', 'source_selection', 'state', 'valid_when_written'}
    payload = event['payload']
    schema = payload_schemas.get((payload.get('schema_id'), payload.get('schema_version')))
    payload_valid = schema is not None and not list(
        Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(payload))
    return {
        'checkpoint_publication': cp['state'] == 'current',
        'checkpoint_original': not cp_checker(cp, cp_schema, original) and publication == expected_publication,
        'event_publication': event['state'] == 'current',
        'event_original': set(event) == set(original) and all(event[k] == original[k] for k in identity_fields),
        'historical_payload': payload_valid and payload == original['payload'],
        'original_receipt': event['receipt'] == original['receipt'],
        'original_source': event['source_selection'] == original['source_selection'],
        'original_admission': original['valid_when_written'] is True and event['valid_when_written'] is True,
        'current_permission': all(request['disclosure'][key] is True for key in
                                  ('permission_allowed', 'membership_allowed', 'source_access_allowed')),
        'source_retained': request['disclosure']['deleted'] is False,
        'current_withdrawal': request['disclosure']['withdrawn'] is False,
    }


def historical_page(request, expected, payload_schemas, cp_schema, cp_checker, event_type):
    """Admit the actual checkpoint and original before feeding refs to byte paging."""
    def validate():
        guards = historical_guards(request, expected, payload_schemas, cp_schema, cp_checker)
        failed = [name for name, valid in guards.items() if not valid]
        if failed:
            raise HistoryUnavailable(failed)
    validate()
    cp, event = request['checkpoint'], request['event']
    # The gate has already authenticated exact family/scope membership. Pass its
    # accepted ref into paging; the byte helper is not a second authority filter.
    accepted = dict(sequence_id=event['sequence_id'], event_type=event_type,
                    project_id=expected['event']['project_id'], event_ref=event['event_ref'])
    response = history_page([accepted], event_type, expected['event']['project_id'], request['after_sequence_id'],
                            cp['through_sequence_id'], cp['publication_id'], cp['index_read_token'])
    # Returning a helper must not bypass current permission/deletion/publication fences.
    validate()
    return response


def history_request(fixture, checkpoint):
    history = fixture['history']
    return dict(checkpoint=copy.deepcopy(checkpoint), event=copy.deepcopy(history['event']),
                disclosure=copy.deepcopy(history['disclosure']), live=copy.deepcopy(history['live']),
                after_sequence_id=0)


def history_patch(request, case):
    parent = request
    for key in case['path'][:-1]:
        parent = parent[key]
    parent[case['path'][-1]] = copy.deepcopy(case['value'])


def changed_leaves(left, right):
    if isinstance(left, dict) and isinstance(right, dict) and left.keys() == right.keys():
        return sum(changed_leaves(left[k], right[k]) for k in left)
    return int(left != right)


def historical_reader_cases(fixture, checkpoint, reader, observations=None):
    """Check 10 composition and check 11 one-defect/guard-weakening witnesses."""
    base = history_request(fixture, checkpoint)
    expected = fixture['history']['expected']
    original = expected['event']
    assert original['state'] == expected['checkpoint']['state'] == 'current'
    assert original['receipt']['event_id'] == original['event_id']
    assert original['receipt']['sequence_id'] == original['sequence_id']
    assert original['receipt']['storage_instance_id'] == original['storage_instance_id']
    assert original['source_selection'] == expected['checkpoint']['index_read_token']['source_selection']
    assert 0 < original['sequence_id'] <= expected['checkpoint']['through_sequence_id']
    before = copy.deepcopy(base)
    response = reader(base, expected)
    assert response['event_refs'] == [original['event_ref']] and response['complete']
    assert base == before, 'historical read mutated its inputs'
    # Keep the ACTUAL checkpoint baseline above, including exact-16-KiB positives.
    # Isolated negatives use a separately declared compact publication witness:
    # changing "current" to "withdrawn" must not ALSO exceed the physical cap.
    # This alternate synthetic ref is supplied by the fixture, not by the candidate.
    base = copy.deepcopy(base)
    expected = copy.deepcopy(expected)
    case_ref = fixture['history']['case_checkpoint_ref']
    base['checkpoint']['index_read_token']['checkpoint_ref'] = case_ref
    expected['checkpoint']['index_read_token']['checkpoint_ref'] = case_ref
    assert reader(base, expected)['event_refs'] == [original['event_ref']]
    count = 2
    for case in fixture['history']['cases']:
        request = copy.deepcopy(base)
        history_patch(request, case)
        assert changed_leaves(base, request) == 1, ('non-isolated history case', case['name'])
        if case['valid']:
            assert reader(request, expected)['event_refs'] == [original['event_ref']], case['name']
        else:
            try:
                reader(request, expected)
            except HistoryUnavailable as error:
                assert error.guards == [case['guard']], (case['name'], error.guards)
            else:
                raise AssertionError(('historical negative accepted', case['name']))
            # Deliberately weaken precisely its owning guard, then use the SAME
            # reader and pagination entry point. Every negative must now disclose.
            complete_guards = historical_guards
            def weakened(*args):
                guards = complete_guards(*args)
                del guards[case['guard']]
                return guards
            try:
                globals()['historical_guards'] = weakened
                page = reader(request, expected)
                assert page['event_refs'] == [request['event']['event_ref']], case['name']
            finally:
                globals()['historical_guards'] = complete_guards
            count += 1
        if observations is not None:
            observations.append(dict(name=case['name'], valid=case['valid'], changed_leaves=1,
                                     guard=case.get('guard'), isolated_rejection=not case['valid'],
                                     weakened_guard_discloses=not case['valid'], passed=True))
        assert checkpoint == before['checkpoint'], 'reader changed persisted checkpoint'
        count += 1
    # Model access/deletion/withdrawal changing while the read helper returns.
    for section, field, denied, guard in [('disclosure', 'permission_allowed', False, 'current_permission'),
                                          ('disclosure', 'deleted', True, 'source_retained'),
                                          ('disclosure', 'withdrawn', True, 'current_withdrawal'),
                                          ('checkpoint', 'state', 'withdrawn', 'checkpoint_publication'),
                                          ('event', 'state', 'staged', 'event_publication')]:
        request = copy.deepcopy(base)
        byte_pager = history_page
        def returning_helper(*args):
            page = byte_pager(*args)
            request[section][field] = denied
            return page
        try:
            globals()['history_page'] = returning_helper
            try:
                reader(request, expected)
            except HistoryUnavailable as error:
                assert error.guards == [guard], (field, error.guards)
            else:
                raise AssertionError(('disclosed after returning helper revoked access', field))
            assert changed_leaves(base, request) == 1
            complete_guards = historical_guards
            def weakened(*args):
                guards = complete_guards(*args)
                del guards[guard]
                return guards
            try:
                globals()['historical_guards'] = weakened
                assert reader(request, expected)['event_refs'] == [original['event_ref']]
            finally:
                globals()['historical_guards'] = complete_guards
        finally:
            globals()['history_page'] = byte_pager
        if observations is not None:
            observations.append(dict(name='after_helper_' + section + '_' + field, valid=False, changed_leaves=1, guard=guard,
                                     isolated_rejection=True, weakened_guard_discloses=True, passed=True))
        count += 2
    return count


def historical_alert_page(request, expected, family, payload_schema, cp_schema):
    # Each manifest row selects only its own historical payload schema and family.
    schemas = {(payload_schema['properties']['schema_id']['const'], '1.0.0'): payload_schema}
    return historical_page(request, expected, schemas, cp_schema, checkpoint_errors, family['event_type'])

def trailing_lf_cases(value, schema):
    """Each currently present patterned leaf gets an independent trailing-LF regression."""
    count = 0
    def resolve(contract):
        while '$ref' in contract:
            ref = contract['$ref']
            assert ref.startswith('#/')
            contract = schema
            for part in ref[2:].split('/'):
                contract = contract[part.replace('~1', '/').replace('~0', '~')]
        return contract
    def visit(node, contract, path):
        nonlocal count
        contract = resolve(contract)
        if isinstance(node, dict):
            for key, child in node.items():
                visit(child, contract.get('properties', {}).get(key, {}), path + [key])
        elif isinstance(node, list):
            for i, child in enumerate(node):
                visit(child, contract.get('items', {}), path + [i])
        elif isinstance(node, str) and 'pattern' in contract:
            altered = copy.deepcopy(value)
            parent = altered
            for key in path[:-1]:
                parent = parent[key]
            # A full checker must refuse LF on every identifier, including embedded tokens.
            parent[path[-1]] = node + '\n'
            assert list(Draft202012Validator(schema).iter_errors(altered)), ('trailing LF accepted', path)
            count += 1
    visit(value, schema, [])
    return count

def pattern_leaf_cases(schema):
    """Exercise every pattern, including identifiers absent from the positive sample."""
    count = 0
    def visit(node):
        nonlocal count
        if isinstance(node, dict):
            if 'pattern' in node:
                validator = Draft202012Validator(node)
                samples = ('fixture', 'pmref:test:fixture', 'a' * 64, 'eig_' + 'a' * 64)
                sample = next((s for s in samples if re.fullmatch(node['pattern'], s) and not list(validator.iter_errors(s))), None)
                assert sample is not None, ('missing pattern positive', node)
                assert list(validator.iter_errors(sample + '\n')), ('trailing LF accepted', node)
                count += 2
            for child in node.values():
                visit(child)
        elif isinstance(node, list):
            for child in node:
                visit(child)
    visit(schema)
    return count

def history_response_cases(checkpoint, schema, event_type, project_id, original_context):
    """Complete-byte boundaries with real closed checkpoint metadata; no fixed allowance."""
    large = copy.deepcopy(checkpoint)
    ref = large['index_read_token']['checkpoint_ref']
    for _ in range(3):
        ref += 'x' * max(0, 16384 - len(packed(large)))
        large['index_read_token']['checkpoint_ref'] = ref
        delta = 16384 - len(packed(large))
        if delta < 0:
            ref = ref[:delta]
            large['index_read_token']['checkpoint_ref'] = ref
    assert len(packed(large)) == 16384 and not checkpoint_errors(large, schema, original_context)
    events = [dict(sequence_id=i + 1, event_type=event_type, project_id=project_id,
                   event_ref='event_' + str(i) + '_' + 'a' * 64) for i in range(64)]
    cursor, seen = 0, []
    while cursor < 64:
        page = history_page(events, event_type, project_id, cursor, 64,
                            large['publication_id'], large['index_read_token'])
        assert len(packed(page)) <= 16384 and page['after_sequence_id'] > cursor
        if cursor == 0:
            assert len(page['event_refs']) < 64
        cursor = page['after_sequence_id']
        seen += page['event_refs']
    assert seen == [event['event_ref'] for event in events]
    single = events[:1]
    for _ in range(3):
        page = history_page(single, event_type, project_id, 0, 1,
                            checkpoint['publication_id'], checkpoint['index_read_token'])
        single[0]['event_ref'] += 'x' * max(0, 16384 - len(packed(page)))
        size = len(packed(dict(page, event_refs=[single[0]['event_ref']])))
        if size > 16384:
            single[0]['event_ref'] = single[0]['event_ref'][:16384 - size]
    page = history_page(single, event_type, project_id, 0, 1,
                        checkpoint['publication_id'], checkpoint['index_read_token'])
    assert len(packed(page)) == 16384 and page['complete']
    single[0]['event_ref'] += 'x'
    for publication, token, source in [
            (checkpoint['publication_id'], checkpoint['index_read_token'], single),
            ('x' * 16384, checkpoint['index_read_token'], []),
            (checkpoint['publication_id'], dict(checkpoint['index_read_token'], checkpoint_ref='x' * 16384), [])]:
        try:
            history_page(source, event_type, project_id, 0, len(source), publication, token)
        except ValueError:
            pass
        else:
            raise AssertionError('unpageable metadata/ref accepted')
    return 5

def main():
    count = 0
    for path in (ROOT / 'Plans/alert_event_contracts').glob('*.schema.json'):
        check_schema(json.loads(path.read_text()))
    registry = load('Plans/event_family_registry.json')
    # Exact serialized event name cannot appear as an admitted event_type.
    admitted = {x.get('event_type') for x in registry['families']}
    values = load('Plans/storage_value_registry.json')
    for family in load('Plans/alert_event_contracts/manifest.json')['families']:
        schema = load(family['payload_schema'])
        check_schema(schema)
        fixtures = load(f"Plans/alert_event_contracts/{family['slug']}.fixtures.json")
        count += isolated_cases('alert', sys.modules[__name__], family, fixtures)
        original_context = fixtures['operation_cases'][0]['value']
        count += producer_cases(fixtures, family['event_type'], original_context['payload'])
        for case in fixtures['writer_policy_cases']:
            assert (not writer_policy_errors(case['policy'])) == case['valid']
            guard = dict(fixtures['payload_cases'][0]['guard'], replay_policy=case['policy'])
            assert (not errors(fixtures['payload_cases'][0]['payload'], schema, guard)) == case['valid']
            count += 1
        count += trailing_lf_cases(fixtures['payload_cases'][0]['payload'], schema)
        count += pattern_leaf_cases(schema)
        for case in fixtures['payload_cases']:
            actual = not errors(case['payload'], schema, case['guard'])
            assert actual == case['valid'], (family['event_type'], case['name'], actual)
            count += 1
        for key in ('operation', 'checkpoint'):
            path = f"Plans/alert_event_contracts/{family[key]}.schema.json"
            value_schema = load(path)
            check_schema(value_schema)
            count += pattern_leaf_cases(value_schema)
            count += trailing_lf_cases(fixtures[key + '_cases'][0]['value'], value_schema)
            for case in fixtures[key + '_cases']:
                valid = not (checkpoint_errors(case['value'], value_schema, original_context) if key == 'checkpoint'
                             else operation_errors(case['value'], value_schema))
                assert valid == case['valid'], (family['event_type'], key, case['name'])
                count += 1
            if key == 'operation':
                count += operation_size_cases(original_context, value_schema, fixtures['operation_size_cases'])
            if key == 'checkpoint':
                baseline = copy.deepcopy(fixtures['checkpoint_cases'][0]['value'])
                count += historical_reader_cases(fixtures, baseline, lambda request, expected:
                    historical_alert_page(request, expected, family, schema, value_schema))
                for case in fixtures['history']['cases']:
                    if case['valid'] and case['path'][0] == 'live':
                        request = history_request(fixtures, baseline)
                        history_patch(request, case)
                        original_payload = request['event']['payload']
                        guard = dict(fixtures['payload_cases'][0]['guard'], current=request['live']['current'] and
                                     request['live']['owner_revision'] == original_payload['prior_revision'])
                        assert errors(original_payload, schema, guard), ('live writer should refuse', case['name'])
                        count += 1
                count += checkpoint_context_cases(baseline, value_schema, original_context)
                regression = copy.deepcopy(baseline)
                regression['event_refs'] = ['event_' + str(i) + '_' + 'a' * 64 for i in range(1000)]
                assert len(packed(regression)) > 16384 and checkpoint_errors(regression, value_schema, original_context)
                count += 1
                for case in fixtures['checkpoint_size_cases']:
                    value = copy.deepcopy(baseline)
                    # Vary a legitimate ref, keeping the complete closed token and all joins.
                    target = case['encoded_bytes']
                    value['index_read_token']['checkpoint_ref'] = 'x'
                    value['index_read_token']['checkpoint_ref'] = 'x' * (target - len(packed(value)) + 1)
                    # MessagePack string header changes at 32/256 bytes.
                    delta = target - len(packed(value))
                    value['index_read_token']['checkpoint_ref'] += 'x' * max(delta, 0)
                    if delta < 0:
                        value['index_read_token']['checkpoint_ref'] = value['index_read_token']['checkpoint_ref'][:delta]
                    assert len(packed(value)) == target
                    assert (not checkpoint_errors(value, value_schema, original_context)) == case['valid'], case['name']
                    count += 1
                for case in fixtures['read_through_cases']:
                    events = [{'sequence_id': i + 1, 'event_type': family['event_type'] if i < case['matches'] else 'other',
                               'project_id': 'fixture', 'event_ref': 'event_' + str(i) + '_' + 'a' * 64}
                              for i in range(case['matches'] + case.get('nonmatches', 0))]
                    cursor, refs, complete = 0, [], False
                    while not complete:
                        response = history_page(events, family['event_type'], 'fixture', cursor, len(events),
                                                baseline['publication_id'], baseline['index_read_token'])
                        page, next_cursor, complete = response['event_refs'], response['after_sequence_id'], response['complete']
                        assert next_cursor > cursor
                        assert len(page) <= 64 and len(packed(response)) <= 16384
                        refs += page
                        cursor = next_cursor
                    assert len(refs) == len(set(refs)) == case['expected_matches']
                    assert len(packed(baseline)) < 16384 and 'event_refs' not in baseline
                    count += 1
                count += history_response_cases(baseline, value_schema, family['event_type'], 'fixture', original_context)
            group = 'event_log' if key == 'checkpoint' else 'coordination_and_storage'
            row = next(x for x in values['families'] if x['family_id'] == family[key])
            check_schema(row['value_schema'])
            assert not profile_errors(values, family[key], row['storage_kind'], group)
            missing = copy.deepcopy(values)
            del missing['storage_profile']['family_profiles'][family[key]]
            assert profile_errors(missing, family[key], row['storage_kind'], group) == ['missing profile']
            count += 2
        assert family['event_type'] not in admitted
        for key in ('operation', 'checkpoint'):
            row = next(x for x in load('Plans/storage_value_registry.json')['families'] if x['family_id'] == family[key])
            assert row['retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
            external = load(row['value_schema_ref'])
            assert row['value_schema'] == {k:v for k,v in external.items() if k != '$schema'}
        text = (ROOT / 'Plans/storage-plan.md').read_text().split(f"### {family['sp']} -", 1)[1].split('\n### ', 1)[0]
        for required in ('SP-278', 'SP-286', 'CV-339', 'storage.first_append_receipt.resolve.v2', 'PENDING_RETENTION_DECISION', family['handler'], family['event_type']):
            assert required in text, (family['event_type'], required)
    for fid in ('shared_alert_state', 'shared_alert_rule_state'):
        row = next(row for row in values['families'] if row['family_id'] == fid)
        check_schema(row['value_schema'])
        assert not profile_errors(values, fid, 'redb', 'settings_and_layout')
        missing = copy.deepcopy(values)
        del missing['storage_profile']['family_profiles'][fid]
        assert profile_errors(missing, fid, 'redb', 'settings_and_layout')
        count += 2
    print(json.dumps({'status':'pass','cases':count,'families':4,'admission':'ABSENT','native':'NOT_RUN','retention':'PENDING_RETENTION_DECISION'}))

if __name__ == '__main__':
    main()
