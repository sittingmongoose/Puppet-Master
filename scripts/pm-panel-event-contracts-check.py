#!/usr/bin/env python3
"""DG6A current panel contracts: static synthetic oracles, never native/admission proof."""
import base64
import argparse
import copy
import hashlib
import importlib.util
import json
import sys
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('dg6a_alert_oracles', ROOT / 'scripts/pm-alert-event-contracts-check.py')
shared = importlib.util.module_from_spec(spec)
spec.loader.exec_module(shared)
packed = shared.packed
Draft202012Validator = shared.Draft202012Validator

# Sweep part 2A guard tables (Method B, scripts/pm_guard_isolation.py).
if str(ROOT / 'scripts') not in sys.path:
    sys.path.insert(0, str(ROOT / 'scripts'))
import pm_dg6a_table_panel_scope as _panel_scope_table  # noqa: E402
import pm_dg6a_tables as tables  # noqa: E402
import pm_dg6a_p2a_witnesses as p2a_witnesses  # noqa: E402

_PANEL_SCOPE_ROWS = [(name, guard.predicate) for name, guard in _panel_scope_table.case(None).table.guards.items()]
PANEL_SCOPE_RECORDER = None


def load(path):
    return shared.domain.loads((ROOT / path).read_text())


def payload_observation(value):
    """panel_payload FIELDS for a schema-accepted payload; derived only.

    Facts that do not apply (the CV-366 key of a project payload, Home context
    outside home_workspace) hold; the tab fact is read only after the project fact.
    """
    project = value['project_id']
    partition = 'app' if project is None else 'project~' + base64.urlsafe_b64encode(project.encode()).decode().rstrip('=')
    home = value['origin'] == 'home_workspace'
    application_key = True
    if project is None:
        key = 'application@1:' + value['server_id'].encode().hex() + ':' + value['interaction_transaction_id'].encode().hex()
        application_key = value['idempotency_key'] == key
    return dict(scope_exact=value['scope_partition'] == partition, application_key_exact=application_key,
                home_project=not home or project is not None,
                home_tab=not home or project is None or value['workspace_tab_id'] is not None,
                host_successor=value['new_host_revision'] == value['prior_host_revision'] + 1)


def payload_errors(value, schema):
    """Refuses only through sch_panel_payload and panel_payload rows."""
    found = list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(value))
    if tables.first('sch_panel_payload', schema_errors=len(found)):
        return found
    return tables.every('panel_payload', **payload_observation(value))


def identity(value, event_type):
    return hashlib.sha256(shared.semantic_packed([value['storage_instance_id'], value['server_id'], value['scope_partition'],
                                 value['app_session_id'], event_type, value['idempotency_key']])).hexdigest()


def panel_scope_observation(value):
    """The panel_scope table's FIELDS; project is a string or None post-schema."""
    project = value['project_id']
    expected = 'app' if project is None else 'project~' + base64.urlsafe_b64encode(project.encode()).decode().rstrip('=')
    return {'scope_partition_exact': bool(value['scope_partition'] == expected)}


def checkpoint_errors(value, schema, original_context):
    found = shared.checkpoint_errors(value, schema, original_context)
    if not found:
        # The scope tail refuses only through pm_dg6a_table_panel_scope.py.
        observed = panel_scope_observation(value)
        first = None
        for name, predicate in _PANEL_SCOPE_ROWS:
            code = predicate(observed, None)
            if code is not None:
                first = (name, code)
                break
        if PANEL_SCOPE_RECORDER is not None:
            PANEL_SCOPE_RECORDER.append((copy.deepcopy(observed), first))
        if first:
            found.append(first[1])
    return found


def checkpoint_scope_cases(checkpoint, schema, operation):
    """One-defect checkpoint-scope controls through the complete wrapper.

    The coherent negatives move the operation's scope_partition with the
    checkpoint's, so the shared foreign-context guard passes and only the
    scope derivation refuses; an incoherent scope is refused earlier there.
    """
    assert not checkpoint_errors(checkpoint, schema, operation)
    cases = (
        ('coherent_app_scope', 'app'),
        ('coherent_foreign_partition', 'project~AAAA'),
    )
    for name, scope in cases:
        value = copy.deepcopy(checkpoint)
        context = copy.deepcopy(operation)
        value['scope_partition'] = scope
        context['scope_partition'] = scope
        actual = checkpoint_errors(value, schema, context)
        assert actual == ['checkpoint scope mismatch'], (name, actual)
    return 1 + len(cases)


PANEL_OPERATION_PHASES = ('panel_request', 'panel_operation_joins', 'panel_command_keys', 'panel_command_keys_entailed',
                          'panel_identity', 'panel_host_prior', 'panel_host_candidate', 'panel_result_refs')


def operation_observation(value, event_type):
    """Facts of every PANEL_OPERATION_PHASES table for a schema- and size-accepted operation.

    Each original_command schema is closed (main checks the per-field rows cover
    every command field the payload also declares). Rows that do not apply hold:
    a field absent from the command or payload, result refs of a prepared operation.
    """
    payload, command = value['payload'], value['original_command']
    keys = {key: key not in command or key not in payload or not (command[key] != payload[key])
            for key in tables.fields('panel_command_keys') + tables.fields('panel_command_keys_entailed')}
    joins = {key: not (value[key] != payload[key]) for key in tables.fields('panel_operation_joins')[1:]}
    joins['window_exact'] = command.get('target_window', command.get('window_id')) == payload['window_id']
    digest = identity(payload, event_type)
    facts = {'panel_request': dict(request_digest_exact=value['request_digest'] == request_digest(command, payload)),
             'panel_command_keys': {k: keys[k] for k in tables.fields('panel_command_keys')},
             'panel_command_keys_entailed': {k: keys[k] for k in tables.fields('panel_command_keys_entailed')},
             'panel_operation_joins': joins,
             'panel_identity': dict(operation_digest_exact=value['operation_digest'] == digest,
                                    event_id_exact=value['event_id'] == 'evt_' + event_type.replace('.', '_') + '_' + digest)}
    for name, host_key, revision_key in [('prior', 'source_host', 'prior_host_revision'),
                                         ('candidate', 'target_host', 'new_host_revision')]:
        snapshot = value[name + '_host_snapshot']
        facts['panel_host_' + name] = dict(
            session_exact=snapshot['app_session_id'] == payload['app_session_id'],
            host_exact=snapshot['host'] == payload[host_key], revision_exact=snapshot['host_revision'] == payload[revision_key],
            window_exact=snapshot['window_id'] == (payload['window_id'] if snapshot['host'] == 'detached_window' else None))
    committed = value['state'] in ('committed', 'settled')
    facts['panel_result_refs'] = {field: not committed or not (value[field] != payload[payload_field]) for field, payload_field in
                                  [('owner_commit_ref', 'owner_commit_ref'), ('result_ref', 'command_result_ref'),
                                   ('dispatch_receipt_ref', 'dispatch_receipt_ref')]}
    return facts


def operation_errors(value, schema, payload_schema, event_type):
    """Refuses only through sch_panel_operation, panel_operation_size, the payload and PANEL_OPERATION_PHASES rows."""
    found = list(Draft202012Validator(schema).iter_errors(value))
    if tables.first('sch_panel_operation', schema_errors=len(found)):
        return found
    code = tables.first('panel_operation_size', encoded_bytes=len(packed(value)))
    if code:
        return [code]
    found = payload_errors(value['payload'], payload_schema)
    facts = operation_observation(value, event_type)
    for phase in PANEL_OPERATION_PHASES:
        found += tables.every(phase, **facts[phase])
    return found


def request_digest(command, payload):
    return hashlib.sha256(shared.semantic_packed(dict(original_command=command, candidate_payload=payload))).hexdigest()


def protocol_errors(context, original_operation):
    """Synthetic evidence joins; real authority/OS proofs remain native obligations.

    Refuses only through protocol_shape, writer_policy, panel_protocol,
    retry_*_panel, panel_publication and append_result rows.
    """
    shape = shared.protocol_shape(context, original_operation, 'panel')
    if shape:
        return [shape]
    original_payload = original_operation['payload']
    errors = []
    errors += shared.writer_policy_errors(context['replay_policy'])
    errors += tables.every('panel_protocol', admitted=context['admitted'] is True, desktop=context['desktop'] is True,
                           source_verified=context['source_verified'] is True,
                           receipt_exact=context['receipt_event_id'] == context['original_event_id'],
                           original_event_exact=context['original_event_id'] == original_operation['event_id'],
                           session_exact=context['session'] == original_payload['app_session_id'],
                           window_exact=context['window'] == original_payload['window_id'])
    errors += shared.retry_refusals('panel', context['retry_command'], context['retry_payload'], original_operation['request_digest'],
                                    original_operation, context.get('append_original'))
    publication_current = context['publication_state'] == 'current'
    # The cursor fact is derived only for a current publication (pre-table `or` order).
    cursor_valid = publication_current and not shared.cursor_errors(context['cursor'], context['frontier'])
    errors += tables.every('panel_publication', publication_current=publication_current, cursor_valid=cursor_valid)
    family = original_operation['schema_id'].removeprefix('pm.storage_value.').removesuffix('_operation.v1').replace('_', '.', 1)
    errors += shared.append_result_errors(original_operation, context.get('append_resolution'), context.get('append_original'), family)
    return errors


def historical_panel_page(request, expected, family, payload_schema, historical_schema, cp_schema):
    # V1 remains read-only; its original generic/layout semantics never enter v2 validation.
    schemas = {(payload_schema['properties']['schema_id']['const'], '2.0.0'): payload_schema,
               (historical_schema['properties']['schema_id']['const'], '1.0.0'): historical_schema}
    return shared.historical_page(request, expected, schemas, cp_schema, checkpoint_errors, family['event_type'])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--family', choices=[f['event_type'] for f in load('Plans/panel_event_contracts/manifest.json')['families']])
    selected = parser.parse_args().family
    count = 0
    admitted = {row['event_type'] for row in load('Plans/event_family_registry.json')['families']}
    registry = load('Plans/storage_value_registry.json')
    for family in load('Plans/panel_event_contracts/manifest.json')['families']:
        if selected and selected != family['event_type']:
            continue
        slug, event = family['slug'], family['event_type']
        assert event not in admitted
        fixture = load(f'Plans/panel_event_contracts/{slug}.fixtures.json')
        count += shared.isolated_cases('panel', sys.modules[__name__], family, fixture)
        schema = load(family['payload_schema'])
        shared.check_schema(schema)
        for case in fixture['writer_policy_cases']:
            assert (not shared.writer_policy_errors(case['policy'])) == case['valid']
            count += 1
        for case in fixture['payload_cases']:
            assert (not payload_errors(case['value'], schema)) == case['valid'], (event, case['name'])
            count += 1
        historical = load(f'Plans/event_payloads/{slug}.schema.json')
        shared.check_schema(historical)
        assert not list(Draft202012Validator(historical).iter_errors(fixture['historical_v1']))
        reader_version = dict(fixture['payload_cases'][0]['value'], schema_version='1.0.0')
        assert payload_errors(reader_version, schema)
        current_version = dict(fixture['historical_v1'], schema_version='2.0.0')
        assert list(Draft202012Validator(historical).iter_errors(current_version))
        count += 3
        op_schema = load(f"Plans/panel_event_contracts/{family['operation']}.schema.json")
        cp_schema = load(f"Plans/panel_event_contracts/{family['checkpoint']}.schema.json")
        count += shared.retained_revision_cases('panel', sys.modules[__name__], family, fixture,
            lambda request, expected: historical_panel_page(request, expected, family, schema, historical, cp_schema))
        for value_schema in (op_schema, cp_schema):
            shared.check_schema(value_schema)
            count += shared.pattern_leaf_cases(value_schema)
        operation = fixture['settled_operation']
        count += shared.producer_cases(fixture, event, operation['payload'])
        assert not operation_errors(operation, op_schema, schema, event)
        count += 1
        count += shared.trailing_lf_cases(operation, op_schema)
        for case in fixture['frozen_payload_negative_cases']:
            altered = copy.deepcopy(operation)
            altered['payload'][case['field']] = case['value']
            assert 'frozen command digest mismatch' in operation_errors(altered, op_schema, schema, event), case['name']
            count += 1
        altered = copy.deepcopy(operation)
        altered['request_digest'] = hashlib.sha256(shared.semantic_packed(altered['original_command'])).hexdigest()
        assert operation_errors(altered, op_schema, schema, event), 'old command-only digest'
        count += 1
        for field, bad in [('app_session_id', 'other-session'), ('original_append_result_ref', None), ('event_id', 'reminted')]:
            altered = copy.deepcopy(operation)
            altered[field] = bad
            assert operation_errors(altered, op_schema, schema, event), field
            count += 1
        altered = copy.deepcopy(operation)
        altered['original_command']['expected_layout_revision'] += 1
        assert operation_errors(altered, op_schema, schema, event)
        count += 1
        payload = operation['payload']
        context = dict(admitted=True, desktop=True, source_verified=True, replay_policy='dedupe_by_idempotency_key', receipt_event_id=operation['event_id'],
                       original_event_id=operation['event_id'], session=payload['app_session_id'], window=payload['window_id'],
                       retry_command=operation['original_command'], retry_payload=payload, publication_state='current', cursor=0, frontier=1000)
        context.update(shared.append_context(fixture, event))
        assert not protocol_errors(context, operation)
        mutations = {'replay_only_not_appendable': ('replay_policy', 'projector_replay_only'),
                     'registry_absent': ('admitted', False), 'source_unverified': ('source_verified', False),
                     'wrong_original_receipt': ('receipt_event_id', 'foreign'), 'prior_session': ('session', 'ended'),
                     'wrong_window': ('window', 'foreign'), 'same_key_altered_payload': ('retry_payload', {**payload, 'actor_ref': 'foreign'}),
                     'same_key_altered_command': ('retry_command', {**operation['original_command'], 'expected_layout_revision': 8}),
                     'withdrawn_publication': ('publication_state', 'withdrawn'), 'cursor_beyond_frontier': ('cursor', 1001),
                     'web_unsupported': ('desktop', False)}
        assert set(fixture['negative_protocol_cases']) <= mutations.keys()
        for name, (key, bad) in mutations.items():
            altered = copy.deepcopy(context)
            altered[key] = bad
            assert protocol_errors(altered, operation), name
            count += 1
        for key, value_schema in [('operation', op_schema), ('checkpoint', cp_schema)]:
            fid = family[key]
            row = next(row for row in registry['families'] if row['family_id'] == fid)
            shared.check_schema(row['value_schema'])
            assert row['value_schema'] == {k: v for k, v in value_schema.items() if k != '$schema'}
            assert row['retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
            assert not shared.profile_errors(registry, fid, row['storage_kind'], 'settings_and_layout' if key == 'operation' else 'event_log')
            count += 1
        checkpoint = fixture['checkpoint']
        count += checkpoint_scope_cases(checkpoint, cp_schema, operation)
        reader = lambda request, expected: historical_panel_page(request, expected, family, schema, historical, cp_schema)
        count += shared.historical_reader_cases(fixture, checkpoint, reader)
        legacy = dict(history=fixture['historical_history'])
        count += shared.historical_reader_cases(legacy, legacy['history']['expected']['checkpoint'], reader)
        for case in fixture['history']['cases']:
            if case['valid'] and case['path'][0] == 'live':
                request = shared.history_request(fixture, checkpoint)
                shared.history_patch(request, case)
                current = dict(context, session=request['live']['session'], window=request['live']['window'])
                assert protocol_errors(current, operation), ('live writer should refuse', case['name'])
                count += 1
        count += shared.checkpoint_context_cases(checkpoint, cp_schema, operation, checkpoint_errors)
        count += shared.trailing_lf_cases(checkpoint, cp_schema)
        count += shared.history_response_cases(checkpoint, cp_schema, event, payload['project_id'], operation)
        # Sweep part 2A one-defect witnesses for rows no earlier case refused alone.
        count += p2a_witnesses.panel_all(sys.modules[__name__], tables, family, fixture, schema, op_schema, cp_schema, context, reader)
        for field, bad_value in [('scope_partition', 'app'), ('storage_instance_id', 'foreign')]:
            altered = copy.deepcopy(checkpoint)
            altered[field] = bad_value
            if field == 'storage_instance_id':
                altered[field] = '00000000-0000-4000-8000-000000000002'
                altered['index_read_token'][field] = altered[field]
                altered['index_read_token']['source_selection'][field] = altered[field]
            assert checkpoint_errors(altered, cp_schema, operation)
            count += 1
        for target in fixture['size_boundaries']:
            value = copy.deepcopy(checkpoint)
            value['index_read_token']['checkpoint_ref'] = 'x' * (target - len(packed(value)) + len(value['index_read_token']['checkpoint_ref']))
            delta = target - len(packed(value))
            if delta < 0:
                value['index_read_token']['checkpoint_ref'] = value['index_read_token']['checkpoint_ref'][:delta]
            elif delta:
                value['index_read_token']['checkpoint_ref'] += 'x' * delta
            assert len(packed(value)) == target
            assert (not checkpoint_errors(value, cp_schema, operation)) == (target <= 16384)
            count += 1
        bad = copy.deepcopy(checkpoint)
        bad['event_refs'] = ['event_0']
        assert checkpoint_errors(bad, cp_schema, operation)
        events = [dict(sequence_id=i + 1, event_type=event, project_id=payload['project_id'], event_ref='event_' + str(i))
                  for i in range(fixture['history_match_count'])]
        cursor, refs, complete = 0, [], False
        while not complete:
            response = shared.history_page(events, event, payload['project_id'], cursor, len(events),
                                           checkpoint['publication_id'], checkpoint['index_read_token'])
            page, new_cursor, complete = response['event_refs'], response['after_sequence_id'], response['complete']
            assert new_cursor > cursor and len(page) <= 64
            assert len(packed(response)) <= 16384
            refs += page
            cursor = new_cursor
        assert len(refs) == len(set(refs)) == fixture['history_match_count']
        count += 2
        text = (ROOT / 'Plans/storage-plan.md').read_text().split(f"### {family['sp']} -", 1)[1].split('\n### ', 1)[0]
        for required in (event, family['handler'], 'SP-278', 'SP-286', 'CV-339', 'storage.first_append_receipt.resolve.v2',
                         'PENDING_RETENTION_DECISION', '16384', 'host_state_persisted=false'):
            assert required in text, (event, required)
    print(json.dumps(dict(status='pass', families=1 if selected else 2, cases=count, admission='ABSENT', native='NOT_RUN', retention='PENDING_RETENTION_DECISION')))


if __name__ == '__main__':
    main()
