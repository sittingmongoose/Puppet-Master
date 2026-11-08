#!/usr/bin/env python3
"""Sweep part 2A single-row witnesses for DCH guard-table rows.

The first guard-tool collection found table rows that no existing negative
reached first. Each witness here starts from an accepted fixture case of the
family and changes exactly one contract fact; dependent copies the changed
fact does not observe are left untouched, and copies it does observe are
changed together so that only the target row refuses. Every case is asserted
by the complete ordinary checker (pm_dch_events.main) or the Stop checker
(pm_dch_stop.main); the guard tool then uses its first refusal as that row's
negative. Rows whose own boundary is a standalone function (test_joins,
archive_joins, checkpoint_joins) are witnessed by calling that function
directly: at the full oracle boundary the payload/checkpoint schemas also
refuse these values (defence in depth).
"""
import copy
import json
from pathlib import Path
from jsonschema import Draft202012Validator
from pm_dch_formats import FormatChecker
from pm_dch_round5_oracles import Case

ROOT = Path(__file__).resolve().parents[1]
FOREIGN_STORE = '00000000-0000-4000-8000-000000000099'
OTHER_GENERATION = 'eig_' + 'c' * 64
OTHER_DATASET = 'event_record_index.v2@eig_' + 'd' * 64
TOO_LARGE = 1 << 64


def changed(value, path, replacement):
    result = copy.deepcopy(value)
    target = result
    for key in path[:-1]:
        target = target[key]
    target[path[-1]] = copy.deepcopy(replacement)
    return result


def cases(m, Case=Case):
    rows = json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']
    fs = json.loads((ROOT/'Plans/dch_event_contract_fixtures.json').read_text())
    cs = json.loads((ROOT/'Plans/dch_checkpoint_fixtures.json').read_text())
    selected = getattr(m, 'SELECTED_FAMILY', None)
    out = []

    def add(name, surface, *args, expected=False):
        out.append(Case(name, surface, tuple(copy.deepcopy(args)), expected))
    for row in rows:
        event = row['event_type']
        if selected and event != selected:
            continue
        payload_schema = json.loads((ROOT/row['payload_schema_ref']).read_text())
        c = next(c for c in cs if c['event_type'] == event)
        prefix = event + '/table-witness/'
        # rn_recipe: a non-string provenance Store with a string digest (RN02 alone).
        add(prefix+'RN02_store_type', 'recipe', {'storage_instance_id': 0, 'source_value_sha256': 'c' * 64})
        # ty_a / ty_b: a non-string map key; a string at an array slot.
        f0 = next(f for f in fs if f['event_type'] == event)
        add(prefix+'TY01_key_type', 'types', {'payload': {**copy.deepcopy(f0['valid']), 1: 'x'}})
        add(prefix+'TY06_array_type', 'types', {**copy.deepcopy(c['valid']), 'projection_refs': 'pmref:fixture:not-an-array'})
        for f in [f for f in fs if f['event_type'] == event]:
            p = prefix + f['edition'] + '/'
            # rb_route: an inline body with a value outside the MessagePack domain.
            record = copy.deepcopy(f['record'])
            record['payload']['probe'] = TOO_LARGE
            add(p+'RB01_body_encodable', 'resolve', record, None)
            # hr_encode: a retained record whose producer integer has no encoding.
            record = {**copy.deepcopy(f['record']), 'producer_sequence_id': TOO_LARGE}
            add(p+'HR01_record_encodable', 'history', record, row, f['historical_source'], payload_schema)
            # rt_schema_file: a retained original naming a family with no payload schema.
            original = {**copy.deepcopy(f['record']), 'event_type': 'chat.unknown_family'}
            add(p+'RT06_original_schema', 'retry', original, original, True, f['historical_source'],
                expected='invalid_input_type')
            # rt_original: the incoming retry violates only the EventRecord edition.
            retry = {**copy.deepcopy(f['record']), 'persisted_at_utc': 'not-a-time'}
            add(p+'RT07_retry_envelope', 'retry', f['record'], retry, True, f['historical_source'],
                expected='invalid_input_type')
            scope = f['valid']['scope']
            if f['edition'] == 'application':
                for name, key, value in [('SC01_app_partition', 'scope_partition', 'other'),
                                         ('SC02_app_project_id', 'project_id', 'p1'),
                                         ('SC03_app_home_server', 'project_home_server_id', 'server1'),
                                         ('SC04_app_named_plan', 'named_plan_id', 'plan1')]:
                    add(p+name, 'scope', {**copy.deepcopy(scope), key: value})
            else:
                for name, key, value in [('SC05_scope_kind', 'scope_kind', 'server'),
                                         ('SC06_project_id_string', 'project_id', 1),
                                         ('SC07_project_id_nonempty', 'project_id', ''),
                                         ('SC08_partition_prefix', 'scope_partition', 'cDE'),
                                         ('SC10_partition_decodes', 'scope_partition', 'project~a'),
                                         ('SC11_project_id_utf8', 'project_id', '\ud800')]:
                    add(p+name, 'scope', {**copy.deepcopy(scope), key: value})
            if 'test_source' in f and event.endswith('_failed'):
                base_payload, base_source = f['valid'], f['test_source']
                for name, payload_changes, outcome_changes in [
                        ('TJ13_exit_nonzero', {'exit_code': 0}, {'exit_code': 0}),
                        ('TJ14_exit_no_error_ref', {'error_ref': 'pmref:fixture:error'}, {'error_ref': 'pmref:fixture:error'}),
                        ('TJ15_terminal_kind', {'test_outcome': 'unsupported', 'exit_code': None},
                         {'kind': 'unsupported', 'exit_code': None}),
                        ('TJ16_nonexit_no_code', {'test_outcome': 'timeout', 'exit_code': 2}, {'kind': 'timeout', 'exit_code': 2}),
                        ('TJ17_process_error_ref', {'test_outcome': 'process_error', 'exit_code': None},
                         {'kind': 'process_error', 'exit_code': None})]:
                    payload = {**copy.deepcopy(base_payload), **payload_changes}
                    source = copy.deepcopy(base_source)
                    source['outcome'].update(outcome_changes)
                    add(p+name, 'test_direct', payload, source, event)
            if 'archive_source' in f:
                base_payload, base_source = f['valid'], f['archive_source']
                revision = base_source['before']['revision']
                for name, target, value in [
                        ('AR01_manual_origin', ('payload', 'archive_origin'), 'retention_policy'),
                        ('AR02_command_id', ('payload', 'command_id'), 'cmd.chat.other'),
                        ('AR10_payload_state', ('payload', 'state'), 'active'),
                        ('AR13_expected_revision', ('payload', 'expected_thread_revision'), revision + 7),
                        ('AR15_committed_revision', ('payload', 'committed_thread_revision'), revision + 9),
                        ('AR18_payload_copies', ('payload', 'thread_id'), 'thr_01ARZ3NDEKTSV4RRFFQ69G5FAX'),
                        ('AR19_before_copies', ('source', 'before', 'thread_id'), 'thr_01ARZ3NDEKTSV4RRFFQ69G5FAX')]:
                    combined = changed({'payload': base_payload, 'source': base_source}, target, value)
                    add(p+name, 'archive_direct', combined['payload'], combined['source'])
                combined = changed(changed({'payload': base_payload, 'source': base_source},
                                           ('payload', 'previous_state'), 'creating'), ('source', 'before', 'state'), 'creating')
                add(p+'AR08_before_state', 'archive_direct', combined['payload'], combined['source'])
        # Checkpoint joins, from the accepted checkpoint fixture.
        value, source, key = c['valid'], c['source'], c['key']
        generation = value['source_token']['generation_id']
        node_path = ('source', 'checkpoint', 'generations', generation)
        base = {'value': value, 'source': source}
        prefix = event + '/checkpoint/table-witness/'

        def checkpoint(name, *changes):
            combined = base
            for path, replacement in changes:
                combined = changed(combined, path, replacement)
            add(prefix+name, 'checkpoint_direct', combined['value'], combined['source'], row, key)
        checkpoint('CP01_checkpoint_schema', (('value', 'consumer_id'), 'sibling'))
        checkpoint('CP02_generation_node', (('value', 'source_token', 'generation_id'), OTHER_GENERATION),
                   (('source', 'publication', 'source_token', 'generation_id'), OTHER_GENERATION))
        checkpoint('CP03_sequence_type', (('source', 'index_row', 'sequence_id'),
                                          float(source['event_record']['sequence_id'])))
        checkpoint('CP07_root_store', (('source', 'checkpoint', 'storage_instance_id'), FOREIGN_STORE))
        checkpoint('CP11_source_key', (('source', 'checkpoint_key'), 'other'))
        checkpoint('CP16_token_selection', (('value', 'source_token', 'source_selection', 'current_bytes_sha256'), 'c' * 64),
                   (('source', 'publication', 'source_token', 'source_selection', 'current_bytes_sha256'), 'c' * 64))
        checkpoint('CP18_token_dataset', (('value', 'source_token', 'index_dataset_name'), OTHER_DATASET),
                   (('source', 'publication', 'source_token', 'index_dataset_name'), OTHER_DATASET))
        checkpoint('CP19_node_dataset', (node_path + ('index_dataset_name',), OTHER_DATASET))
        checkpoint('CP24_index_sequence', (('source', 'index_row', 'sequence_id'), source['event_record']['sequence_id'] + 1))
        checkpoint('CP26_index_partition', (('source', 'index_row', 'scope_partition'), 'other'))
    return out


def evaluate(m, c, envelope):
    a = c.args
    if c.surface == 'recipe':
        return m.record_number_rule(*a) is not None
    if c.surface == 'types':
        return m.input_types_valid(*a)
    if c.surface == 'resolve':
        return m.resolve_body(*a) is not None
    if c.surface == 'scope':
        return m.valid_scope_partition(*a)
    if c.surface == 'retry':
        return m.retry_outcome(*a)
    if c.surface == 'history':
        return m.historical_read_valid(a[0], a[1], a[2], envelope, Draft202012Validator(a[3], format_checker=FormatChecker()))
    if c.surface == 'test_direct':
        return m.test_joins(*a)
    if c.surface == 'archive_direct':
        return m.archive_joins(*a)
    if c.surface == 'checkpoint_direct':
        return m.checkpoint_joins(*a)
    raise ValueError(c.surface)


def stop_cases(fixture):
    """(id, name, surface, input, expected) Stop witnesses, each from one accepted base."""
    bases = fixture['bases']
    out = []

    def add(name, surface, base_id, changes, expected=False, value_kind=None):
        data = copy.deepcopy(bases[base_id])
        for path, replacement in changes:
            data = changed(data, path, replacement)
        case = {'id': 'DCH9-W' + str(len(out) + 1).zfill(3), 'name': 'table-witness/' + name, 'surface': surface,
                'input': data, 'expected': expected}
        if value_kind:
            case['value_kind'] = value_kind
        out.append(case)
    inline, ref = 'DCH9-0136', 'DCH9-0137'
    add('SV01_record_object', 'transport', inline, [(('record',), ['not', 'a', 'record'])], value_kind='request')
    add('SV03_store_descriptor', 'transport', inline, [(('storage_instance',), 'not-a-uuid')], value_kind='request')
    add('SV04_inline_encodable', 'transport', inline, [(('record', 'payload', 'probe'), TOO_LARGE)], value_kind='request')
    add('SV07_payload_empty', 'transport', ref, [(('record', 'payload'), {'probe': 'x'})], value_kind='request')
    add('SV08_source_object', 'transport', ref, [(('source',), ['not', 'a', 'source'])], value_kind='request')
    add('SV09_source_body_object', 'transport', ref, [(('source', 'body'), ['not', 'a', 'body'])], value_kind='request')
    add('SV10_body_encodable', 'transport', ref, [(('source', 'body', 'probe'), TOO_LARGE)], value_kind='request')
    add('SV19_scope_copy', 'transport', ref, [(('source', 'scope', 'server_id'), 'other_server')], value_kind='request')
    current, history = 'DCH9-0001', 'DCH9-0094'
    add('RQ01_historical_type', 'request', current, [(('historical',), 'false')])
    add('RQ02_store_descriptor', 'request', current, [(('context', 'storage_instance_id'), 'not-a-uuid')])
    add('RQ03_request_schema', 'request', current, [(('record', 'payload', 'unexpected'), True)])
    add('RQ04_envelope_schema', 'request', current, [(('record', 'schema_version'), '9.0.0')])
    base = bases[history]
    record = {**copy.deepcopy(base['record']), 'replay_policy': 'append_once'}
    import pm_dch_stop as stop
    add('RQ14_replay_policy', 'request', history, [(('record',), record),
                                                    (('context', 'source_value_sha256'), stop.commitment(record))])
    add('OC01_outcome_schema', 'outcome', 'DCH9-0260', [(('value', 'unexpected'), True)])
    index = 'DCH9-0667'
    token = bases[index]['token']
    generation = token['generation_id']
    node = ('source', 'checkpoint', 'generations', generation)
    add('IX01_token_fields', 'index', index, [(('token', 'extra'), 'x')])
    add('IX04_source_store', 'index', index, [(('source', 'storage_instance_id'), FOREIGN_STORE)])
    add('IX05_root_store', 'index', index, [(('source', 'checkpoint', 'storage_instance_id'), FOREIGN_STORE)])
    add('IX08_source_key', 'index', index, [(('source', 'checkpoint_key'), 'other')])
    add('IX10_row_ref', 'index', index, [(('source', 'index_row', 'checkpoint_ref'), 'other')])
    add('IX11_current_generation', 'index', index, [(('source', 'checkpoint', 'current_generation_id'), OTHER_GENERATION)])
    add('IX12_node_current', 'index', index, [(node + ('state',), 'retired')])
    add('IX17_current_selection', 'index', index,
        [(('source', 'current_source_selection', 'current_bytes_sha256'), 'c' * 64)])
    add('IX19_node_dataset', 'index', index, [(node + ('index_dataset_name',), OTHER_DATASET)])
    add('IX20_source_dataset', 'index', index, [(('source', 'dataset_name'), OTHER_DATASET)])
    return out
