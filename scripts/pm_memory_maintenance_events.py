#!/usr/bin/env python3
"""Static DMEM contract model. Synthetic custody/transactions; native NOT_RUN."""
from copy import deepcopy
from functools import lru_cache
from pathlib import Path
import hashlib
import importlib.util
import json
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
OP_NAMES = ('dedup_sweep', 'index_lexical_rebuild', 'index_semantic_rebuild', 'verification_sweep')
_CODEC_SPEC = importlib.util.spec_from_file_location('_dmem_binding_codec', ROOT / 'scripts/pm_event_index_binding.py')
_CODEC = importlib.util.module_from_spec(_CODEC_SPEC)
_CODEC_SPEC.loader.exec_module(_CODEC)


def within_value_cap(value):
    return len(_CODEC.binding_bytes(value)) <= 16384



def load(path):
    return json.loads((ROOT / path).read_text())


def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True,
                                    separators=(',', ':')).encode('utf-8')).hexdigest()


def identity(event_type, instance, project, operation):
    h = digest(['pm.memory.maintenance.event.v1', instance, project, operation, event_type])
    return 'evt_mem_' + h, 'memory-maintenance:' + h


def operation_name(event):
    return event.removeprefix('memory.').rsplit('.', 1)[0].replace('.', '_')


def result_ref(row):
    return 'memresult_' + digest(['pm.memory.maintenance.result_ref.v1', row['storage_instance_id'],
                                  row['project_id'], row['operation_id']])


def event_type(row, phase):
    commands = {'cmd.chat.memory.dedup_sweep': 'dedup_sweep',
                'cmd.chat.memory.rebuild_lexical_index': 'index.lexical.rebuild',
                'cmd.chat.memory.rebuild_semantic_index': 'index.semantic.rebuild',
                'cmd.chat.memory.verification_sweep': 'verification_sweep'}
    return 'memory.' + commands[row['command_id']] + '.' + phase


@lru_cache(maxsize=None)
def validator(path, definition):
    schema = load(path)['$defs'][definition]
    return Draft202012Validator(schema, format_checker=FormatChecker())


def valid_target(target, row):
    kind = 'lexical' if 'lexical' in row['command_id'] else 'semantic'
    if not validator('Plans/memory_maintenance_rebuild_target.schema.json', kind + '_target').is_valid(target):
        return False
    files = target['artifacts']
    names = [x['relative_name'] for x in files]
    if names != sorted(set(names)) or target['manifest_sha256'] != digest(files):
        return False
    h = digest(['pm.memory.maintenance.target.v1', row['storage_instance_id'], row['project_id'],
                row['operation_id'], kind, row['source_revision_sha256'], target['manifest_sha256']])
    return target['source_revision_sha256'] == row['source_revision_sha256'] and target['target_id'] == 'memtarget_' + h


def valid_selector(value, row):
    if value is None:
        return True
    kind = 'lexical' if 'lexical' in row['command_id'] else 'semantic'
    if not validator('Plans/memory_maintenance_rebuild_target.schema.json', kind + '_selector').is_valid(value) or not within_value_cap(value):
        return False
    if any(value[k] != row[k] for k in ('storage_instance_id', 'project_id')):
        return False
    source = {**row, 'operation_id': value['operation_id'],
              'source_revision_sha256': value['target']['source_revision_sha256']}
    return valid_target(value['target'], source)


def result_digest(row):
    target = row.get('prepared_target')
    return digest(['pm.memory.maintenance.result.v1', row['storage_instance_id'], row['project_id'],
                   row['operation_id'], row['command_id'], row['source_revision_sha256'], row['status'],
                   target['target_id'] if target else None])


def valid_operation(row, name):
    if not validator('Plans/memory_maintenance_operation.schema.json', name).is_valid(row) or not within_value_cap(row):
        return False
    for suffix, field in [('started', 'started_event_id'), ('completed', 'completed_event_id')]:
        if row[field] is not None and row[field] != identity(event_type(row, suffix), row['storage_instance_id'],
                                                          row['project_id'], row['operation_id'])[0]:
            return False
    if row.get('prepared_target') is not None and not valid_target(row['prepared_target'], row):
        return False
    if row['phase'] == 'prepared':
        # Reserve terminal custody before swapping: success must still fit after both receipt ids and outcome exist.
        terminal = {**row, 'phase': 'completed', 'status': 'succeeded',
                    'completed_occurred_at_utc': '0' * 64, 'result_ref': result_ref(row),
                    'result_sha256': '0' * 64,
                    'completed_event_id': identity(event_type(row, 'completed'), row['storage_instance_id'],
                                                   row['project_id'], row['operation_id'])[0]}
        if not within_value_cap(terminal):
            return False

    if row['status'] is not None:
        if row['result_ref'] != result_ref(row) or row['result_sha256'] != result_digest(row):
            return False
    return True


def payload_from(row, suffix):
    payload = {k: row[k] for k in ('project_id', 'operation_id', 'source_revision_sha256', 'command_id')}
    payload.update(schema_version='1.0.0', event_type=event_type(row, suffix),
                   occurred_at_utc=row[suffix + '_occurred_at_utc'])
    if suffix == 'completed':
        payload.update({k: row[k] for k in ('started_event_id', 'status', 'result_ref', 'result_sha256')})
    return payload


def full_value(row, suffix):
    event = event_type(row, suffix)
    event_id, key = identity(event, row['storage_instance_id'], row['project_id'], row['operation_id'])
    # Complete synthetic envelope. This deliberately does not impersonate a native AppendReceipt codec.
    return {'event_id': event_id, 'event_type': event, 'idempotency_key': key,
            'scope_kind': 'project', 'project_id': row['project_id'], 'correlation_id': row['operation_id'],
            'causation_event_id': row['started_event_id'] if suffix == 'completed' else None,
            'payload_ref': None, 'payload': payload_from(row, suffix)}


def retained(value):
    return {'full_value': deepcopy(value), 'full_value_sha256': digest(value), 'durability': 'full_flush'}


def original_matches(original, value):
    return (isinstance(original, dict) and set(original) == {'full_value', 'full_value_sha256', 'durability'}
            and original['durability'] == 'full_flush' and original['full_value'] == value
            and original['full_value_sha256'] == digest(value))


def accept(payload, contract, context):
    """Validate a candidate against concrete custody as well as the original boundary checks."""
    try:
        event = contract['event_type']; name = operation_name(event)
        if not validator('Plans/memory_maintenance_event_payloads.schema.json', event.replace('.', '_')).is_valid(payload):
            return False
        if not payload['occurred_at_utc'].endswith('Z'):
            return False
        if not context['admitted'] or context['withdrawn'] or not context['permission']:
            return False
        if any(payload[k] != context[k] for k in ('project_id', 'operation_id', 'source_revision_sha256')):
            return False
        if not context['request_matches'] or not context['current_source']:
            return False
        row = context['operation']
        if not valid_operation(row, name) or row['request_sha256'] != context['request_sha256']:
            return False
        suffix = event.rsplit('.', 1)[1]
        if payload != payload_from(row, suffix):
            return False
        originals = context['originals']
        if suffix == 'completed':
            if not (context['started_receipt'] and context['effect_settled'] and context['original_full_value']):
                return False
            if row['phase'] not in ('effect_committed', 'completed') or payload['started_event_id'] != context['started_event_id']:
                return False
            if not original_matches(originals.get(event_type(row, 'started')), full_value(row, 'started')):
                return False
        elif not context['acceptance_durable']:
            return False
        original = originals.get(event)
        if original is not None and not original_matches(original, full_value(row, suffix)):
            return False
        if row['phase'] == 'completed' and suffix == 'completed' and original is None:
            return False
        return True
    except (KeyError, TypeError, ValueError):
        return False


class Refusal(ValueError):
    pass


def require(test, reason):
    if not test:
        raise Refusal(reason)


def selected_value(row):
    kind = row['prepared_target']['index_kind']
    return {'schema_id': 'pm.storage_value.memory_index_' + kind + '_selector.v1',
            'schema_version': '1.0.0', 'storage_instance_id': row['storage_instance_id'],
            'project_id': row['project_id'], 'operation_id': row['operation_id'],
            'target': deepcopy(row['prepared_target'])}


def custody(state, suffix):
    row = state['operation']
    return original_matches(state['originals'].get(event_type(row, suffix)), full_value(row, suffix))


def effect_fences(state):
    row = state['operation']
    require(state['permission'] and not state['withdrawn'], 'permission_or_withdrawal')
    require(row['source_revision_sha256'] == state['current_source_revision_sha256'], 'source_changed')
    require(custody(state, 'started'), 'start_receipt_missing')


def target_fences(state):
    row = state['operation']; target = row.get('prepared_target')
    require(target is not None and valid_target(target, row), 'target_invalid')
    require(state['durable_artifacts'] == target['artifacts'], 'artifact_mismatch')
    effect_fences(state)


def transition(before, action):
    """An atomic static transition. A refusal publishes none of the tentative state."""
    state = deepcopy(before); row = state['operation']; op = action['op']; output = None
    name = operation_name(event_type(row, 'started'))
    require(valid_operation(row, name), 'invalid_operation')
    require(row['request_sha256'] == state['request_sha256'], 'request_changed')
    if name.startswith('index_'):
        require(valid_selector(state['selector'], row), 'invalid_selector')
    if op in ('advance_started', 'prepare', 'swap', 'settle', 'advance_completed'):
        require(action['expected_operation'] == row, 'operation_cas_conflict')
    if op in ('append_started', 'append_completed'):
        suffix = op.removeprefix('append_')
        require(state['permission'] and not state['withdrawn'], 'permission_or_withdrawal')
        require(row['phase'] == ('accepted' if suffix == 'started' else 'effect_committed'), 'wrong_phase')
        if suffix == 'completed':
            require(custody(state, 'started'), 'start_receipt_missing')
        value = full_value(row, suffix)
        require(action['value'] == value, 'original_value_changed')
        event = event_type(row, suffix)
        if event in state['originals']:
            require(original_matches(state['originals'][event], value), 'original_value_changed')
        else:
            state['originals'][event] = retained(value)
        state['volatile'] = {'response': deepcopy(value)}
        output = value
    elif op == 'advance_started':
        require(row['phase'] == 'accepted' and custody(state, 'started'), 'start_receipt_missing')
        row.update(phase='started', started_event_id=full_value(row, 'started')['event_id'])
    elif op == 'prepare':
        require(row['phase'] == 'started' and name.startswith('index_'), 'wrong_phase')
        effect_fences(state)
        target = action['target']
        require(valid_target(target, row) and state['durable_artifacts'] == target['artifacts'], 'target_invalid')
        prior = digest(state['selector']) if state['selector'] is not None else None
        require(target['prior_selector_sha256'] == prior, 'prior_selector_mismatch')
        row.update(phase='prepared', prepared_target=deepcopy(target))
    elif op == 'swap':
        require(row['phase'] == 'prepared', 'wrong_phase')
        target_fences(state)
        prior = digest(state['selector']) if state['selector'] is not None else None
        require(prior == row['prepared_target']['prior_selector_sha256'], 'selector_cas_conflict')
        require(state['effect_count'] == 0 and state['swap_count'] == 0, 'repeated_effect')
        state['selector'] = selected_value(row)
        state['effect_count'] += 1; state['swap_count'] += 1
    elif op == 'settle':
        require(row['phase'] in ('started', 'prepared'), 'wrong_phase')
        require(custody(state, 'started'), 'start_receipt_missing')
        require(action['status'] in ('succeeded', 'failed'), 'outcome_invalid')
        if name.startswith('index_'):
            if action['status'] == 'succeeded':
                target_fences(state)
                require(state['selector'] == selected_value(row), 'selected_target_mismatch')
                require(state['effect_count'] == state['swap_count'] == 1, 'effect_count_mismatch')
            else:
                require(state['effect_count'] == state['swap_count'] == 0, 'committed_effect_cannot_fail')
        elif action['status'] == 'succeeded':
            effect_fences(state)
            require(state['effect_count'] == 0, 'repeated_effect')
            state['effect_count'] = 1
        else:
            require(state['effect_count'] == 0, 'committed_effect_cannot_fail')
        row.update(phase='effect_committed', status=action['status'],
                   completed_occurred_at_utc=action['completed_occurred_at_utc'], result_ref=result_ref(row))
        row['result_sha256'] = result_digest(row)
    elif op == 'advance_completed':
        require(row['phase'] == 'effect_committed' and custody(state, 'completed'), 'terminal_receipt_missing')
        row.update(phase='completed', completed_event_id=full_value(row, 'completed')['event_id'])
    elif op in ('retry', 'replay'):
        require(state['permission'] and not state['withdrawn'], 'permission_or_withdrawal')
        suffix = action['event_type'].rsplit('.', 1)[1]
        require(action['event_type'] == event_type(row, suffix) and custody(state, suffix), 'original_missing')
        output = deepcopy(state['originals'][action['event_type']]['full_value'])
        require(action['value'] == output, 'original_value_changed')
    elif op == 'crash':
        state['volatile'] = None
    elif op == 'recover':
        # Restart uses only durable originals and the frozen selected target, never a replacement candidate.
        if row['phase'] == 'accepted':
            require(custody(state, 'started'), 'start_receipt_missing')
            state, _ = transition(state, {'op': 'advance_started', 'expected_operation': deepcopy(row)})
        elif row['phase'] == 'prepared':
            target_fences(state)
            if state['selector'] != selected_value(row):
                state, _ = transition(state, {'op': 'swap', 'expected_operation': deepcopy(row)})
            state, _ = transition(state, {'op': 'settle', 'expected_operation': deepcopy(state['operation']),
                                         'status': 'succeeded', 'completed_occurred_at_utc': action['completed_occurred_at_utc']})
        elif row['phase'] == 'effect_committed':
            state, _ = transition(state, {'op': 'append_completed', 'value': full_value(row, 'completed')})
            state, _ = transition(state, {'op': 'advance_completed', 'expected_operation': deepcopy(state['operation'])})
        elif row['phase'] == 'completed':
            require(custody(state, 'completed'), 'terminal_receipt_missing')
            output = deepcopy(state['originals'][event_type(row, 'completed')]['full_value'])
        # started with no committed effect remains pending; no outcome is guessed.
    else:
        raise Refusal('unknown_action')
    require(valid_operation(state['operation'], name), 'invalid_operation_after')
    return state, output


def patch(value, edits):
    value = deepcopy(value)
    for edit in edits:
        target = value
        for key in edit['path'][:-1]:
            target = target[key]
        if edit.get('delete'):
            del target[edit['path'][-1]]
        else:
            target[edit['path'][-1]] = deepcopy(edit['value'])
    return value


def run_stateful(fixtures, families):
    counts = {}; schema_count = 0; trace_count = 0
    for case in fixtures['operation_cases']:
        result = valid_operation(case['value'], case['definition'])
        schema_result = validator('Plans/memory_maintenance_operation.schema.json', case['definition']).is_valid(case['value'])
        assert result == case['valid'], case['name']
        if 'schema_valid' in case:
            assert schema_result == case['schema_valid'], case['name']
        schema_count += 1
    for family in fixtures['stateful_families']:
        event = family['event_type']; assert event in families
        states = family['states']; counts[event] = 0
        names = [case['name'] for case in family['traces']]
        required = {'start-append-crash-recover', 'start-row-crash', 'effect-terminal-crash-convergence',
                    'terminal-append-crash-recover', 'terminal-row-crash', 'lost-ack-retry-replay-no-effects',
                    'stale-operation-cas', 'stale-terminal-cas', 'repeated-effect-refused',
                    'terminal-before-start', 'advance-before-receipt', 'changed-original-terminal',
                    'changed-retry-clock', 'changed-request', 'permission-refusal', 'withdrawal-refusal',
                    'settled-failure-original', 'failed-retry-no-effect', 'changed-retained-full-value',
                    'lost-retained-full-value'}
        required |= ({'prepare-swap-crash-convergence', 'prepared-recovery-selects-once',
                      'unprepared-swap', 'repeated-swap-refused', 'unselected-success-refused',
                      'stale-source-before-swap', 'missing-artifact-after-swap',
                      'intervening-selector-never-overwritten', 'exact-existing-selector-cas',
                      'existing-selector-post-swap-crash', 'foreign-selector-custody',
                      'unsorted-artifacts', 'duplicate-artifacts'} if '.index.' in event
                     else {'atomic-effect-no-repeat', 'stale-source-before-effect', 'repeated-unsettled-effect'})
        assert len(names) == len(set(names))
        assert {event + ':' + n for n in required} <= set(names), event
        assert all(n.startswith(event + ':') for n in names), event
        for case in family['traces']:
            state = patch(states[case['initial']], case.get('edits', []))
            for step in case['steps']:
                before = deepcopy(state); action = deepcopy(step['action'])
                if 'expected_state' in action:
                    action['expected_operation'] = deepcopy(states[action.pop('expected_state')]['operation'])
                try:
                    after, output = transition(state, action)
                except Refusal as e:
                    assert step.get('refusal') == str(e), (event, case['name'], str(e), step)
                    assert state == before, (event, case['name'], 'refusal mutated state')
                else:
                    assert 'refusal' not in step, (event, case['name'], 'expected refusal')
                    assert after == states[step['after']], (event, case['name'], action['op'], 'wrong durable state')
                    assert output == step.get('output'), (event, case['name'], 'wrong original result')
                    state = after
                counts[event] += 1
            trace_count += 1
    assert set(counts) == set(families)
    return counts, schema_count, trace_count


def main():
    contracts = load('Plans/memory_maintenance_contracts.json'); fixtures = load('Plans/memory_maintenance_event_fixtures.json')
    registered = {x['event_type'] for x in load('Plans/event_family_registry.json')['families']}
    assert len(contracts['families']) == 8 and len(contracts['blocked_rows']) == 4
    assert not registered.intersection(x['event_type'] for x in contracts['families'])
    for filename in ('event_payloads', 'operation', 'rebuild_target'):
        Draft202012Validator.check_schema(load('Plans/memory_maintenance_' + filename + '.schema.json'))
    families = {x['event_type']: x for x in contracts['families']}; counts = {}
    for case in fixtures['cases']:
        event = case['event_type']; result = accept(case['payload'], families[event], case['context'])
        assert result == case['accepted'], case['name']
        counts[event] = counts.get(event, 0) + 1
        if case.get('retry'):
            args = (event, 'storage-1', case['payload']['project_id'], case['payload']['operation_id'])
            assert identity(*args) == tuple(case['expected_identity'])
            assert identity(*args) != identity(event, 'storage-2', args[2], args[3])
            assert identity(*args) != identity(event, args[1], 'other-project', args[3])
    assert set(counts) == set(families)
    stateful, schema_count, trace_count = run_stateful(fixtures, families)
    values = load('Plans/storage_value_registry.json')['families']; ops = load('Plans/memory_maintenance_operation.schema.json')
    target_schemas = load('Plans/memory_maintenance_rebuild_target.schema.json')['$defs']
    own_values = [v for v in values if v['family_id'] in ['memory_' + n + '_operation' for n in OP_NAMES]
                  or v['family_id'] in ['memory_index_lexical_selector', 'memory_index_semantic_selector']]
    assert len(own_values) == 6
    for value in own_values:
        assert value['retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
        assert value['status'] == 'deferred_not_build_blocking'
        assert value['value_schema'] == {**ops['$defs'], **target_schemas}[value['value_schema_ref'].rsplit('/', 1)[1]]
    for contract in families.values():
        assert contract['membership'] == 'ABSENT' and contract['retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
        for path in [contract['semantic_owner'], contract['storage_owner'], contract['payload_owner']]:
            filename, unit = path.split('#'); assert 'plan_unit_id: ' + unit in (ROOT / filename).read_text()
        filename, unit = contract['storage_owner'].split('#')
        section = (ROOT / filename).read_text().split('### ' + unit + ' - ', 1)[1].split('\n### ', 1)[0]
        for token in ('SP-278', 'SP-286', 'CV-339', contract['consumer_id'], contract['event_type']):
            assert token in section
    print(json.dumps({'status': 'pass', 'families': counts, 'boundary_cases': sum(counts.values()),
                      'operation_cases': schema_count, 'stateful_traces': trace_count, 'stateful_steps': stateful,
                      'native': 'NOT_RUN', 'admission': 'ABSENT', 'retention': 'PENDING_RETENTION_DECISION'}, indent=2))


if __name__ == '__main__':
    main()
