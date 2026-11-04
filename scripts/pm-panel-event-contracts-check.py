#!/usr/bin/env python3
"""DG6A current panel contracts: static synthetic oracles, never native/admission proof."""
import base64
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


def load(path):
    return json.loads((ROOT / path).read_text())


def payload_errors(value, schema):
    found = list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(value))
    if not found:
        project = value['project_id']
        partition = 'app' if project is None else 'project~' + base64.urlsafe_b64encode(project.encode()).decode().rstrip('=')
        if value['scope_partition'] != partition:
            found.append('scope mismatch')
        if project is None:
            key = 'application@1:' + value['server_id'].encode().hex() + ':' + value['interaction_transaction_id'].encode().hex()
            if value['idempotency_key'] != key:
                found.append('CV-366 application idempotency key mismatch')
        if value['origin'] == 'home_workspace' and (project is None or value['workspace_tab_id'] is None):
            found.append('missing original Home context')
        if value['new_host_revision'] != value['prior_host_revision'] + 1:
            found.append('not host revision successor')
    return found


def identity(value, event_type):
    return hashlib.sha256(packed([value['storage_instance_id'], value['server_id'], value['scope_partition'],
                                 value['app_session_id'], event_type, value['idempotency_key']])).hexdigest()


def checkpoint_errors(value, schema, original_context):
    found = shared.checkpoint_errors(value, schema, original_context)
    if not found:
        project = value['project_id']
        expected = 'app' if project is None else 'project~' + base64.urlsafe_b64encode(project.encode()).decode().rstrip('=')
        if value['scope_partition'] != expected:
            found.append('checkpoint scope mismatch')
    return found


def operation_errors(value, schema, payload_schema, event_type):
    found = list(Draft202012Validator(schema).iter_errors(value))
    if len(packed(value)) > 16384:
        found.append('operation too large')
    if found:
        return found
    payload = value['payload']
    found += payload_errors(payload, payload_schema)
    command = value['original_command']
    if value['request_digest'] != request_digest(command, payload):
        found.append('frozen command digest mismatch')
    for key in command:
        if key in payload and command[key] != payload[key]:
            found.append('frozen command/payload ' + key)
    if command.get('target_window', command.get('window_id')) != payload['window_id']:
        found.append('frozen command window mismatch')
    for key in ('storage_instance_id', 'server_id', 'project_id', 'scope_partition', 'app_session_id', 'idempotency_key'):
        if value[key] != payload[key]:
            found.append('operation/payload ' + key)
    digest = identity(payload, event_type)
    if value['operation_digest'] != digest or value['event_id'] != 'evt_' + event_type.replace('.', '_') + '_' + digest:
        found.append('original identity mismatch')
    for name, host_key, revision_key in [('prior_host_snapshot', 'source_host', 'prior_host_revision'),
                                         ('candidate_host_snapshot', 'target_host', 'new_host_revision')]:
        snapshot = value[name]
        if (snapshot['app_session_id'], snapshot['host'], snapshot['host_revision']) != (
                payload['app_session_id'], payload[host_key], payload[revision_key]):
            found.append('original host snapshot mismatch')
        if snapshot['window_id'] != (payload['window_id'] if snapshot['host'] == 'detached_window' else None):
            found.append('original window mismatch')
    if value['state'] in ('committed', 'settled'):
        for field, payload_field in [('owner_commit_ref', 'owner_commit_ref'), ('result_ref', 'command_result_ref'),
                                      ('dispatch_receipt_ref', 'dispatch_receipt_ref')]:
            if value[field] != payload[payload_field]:
                found.append('original result/receipt mismatch')
    return found


def request_digest(command, payload):
    return hashlib.sha256(packed(dict(original_command=command, candidate_payload=payload))).hexdigest()


def protocol_errors(context, original_operation):
    """Synthetic evidence joins; real authority/OS proofs remain native obligations."""
    original_payload = original_operation['payload']
    errors = []
    errors += shared.writer_policy_errors(context['replay_policy'])
    if context['admitted'] is not True:
        errors.append('family absent')
    if context['desktop'] is not True:
        errors.append('unsupported web')
    if context['source_verified'] is not True:
        errors.append('unverified source')
    if context['receipt_event_id'] != context['original_event_id']:
        errors.append('wrong original receipt')
    if context['original_event_id'] != original_operation['event_id']:
        errors.append('forged original event identity')
    if context['session'] != original_payload['app_session_id']:
        errors.append('prior session cannot act')
    if context['window'] != original_payload['window_id']:
        errors.append('wrong window')
    if request_digest(context['retry_command'], context['retry_payload']) != original_operation['request_digest']:
        errors.append('retry changed')
    if context['publication_state'] != 'current' or context['cursor'] > context['frontier']:
        errors.append('unavailable publication/cursor')
    return errors


def historical_panel_page(request, expected, family, payload_schema, historical_schema, cp_schema):
    # V1 remains read-only; its original generic/layout semantics never enter v2 validation.
    schemas = {(payload_schema['properties']['schema_id']['const'], '2.0.0'): payload_schema,
               (historical_schema['properties']['schema_id']['const'], '1.0.0'): historical_schema}
    return shared.historical_page(request, expected, schemas, cp_schema, checkpoint_errors, family['event_type'])


def main():
    count = 0
    admitted = {row['event_type'] for row in load('Plans/event_family_registry.json')['families']}
    registry = load('Plans/storage_value_registry.json')
    for family in load('Plans/panel_event_contracts/manifest.json')['families']:
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
        assert payload_errors(fixture['historical_v1'], schema)
        assert list(Draft202012Validator(historical).iter_errors(fixture['payload_cases'][0]['value']))
        count += 3
        op_schema = load(f"Plans/panel_event_contracts/{family['operation']}.schema.json")
        cp_schema = load(f"Plans/panel_event_contracts/{family['checkpoint']}.schema.json")
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
        altered['request_digest'] = hashlib.sha256(packed(altered['original_command'])).hexdigest()
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
        assert not checkpoint_errors(checkpoint, cp_schema, operation)
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
        for field, bad_value in [('scope_partition', 'app'), ('storage_instance_id', 'foreign')]:
            altered = copy.deepcopy(checkpoint)
            altered[field] = bad_value
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
        bad['event_refs'] = ['event_' + str(i) + '_' + 'a' * 64 for i in range(1000)]
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
    print(json.dumps(dict(status='pass', families=2, cases=count, admission='ABSENT', native='NOT_RUN', retention='PENDING_RETENTION_DECISION')))


if __name__ == '__main__':
    main()
