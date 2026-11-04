#!/usr/bin/env python3
"""DG6A current panel contracts: static synthetic oracles, never native/admission proof."""
import base64
import copy
import hashlib
import importlib.util
import json
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
        if value['origin'] == 'home_workspace' and (project is None or value['workspace_tab_id'] is None):
            found.append('missing original Home context')
        if value['new_host_revision'] != value['prior_host_revision'] + 1:
            found.append('not host revision successor')
    return found


def identity(value, event_type):
    return hashlib.sha256(packed([value['storage_instance_id'], value['server_id'], value['scope_partition'],
                                 value['app_session_id'], event_type, value['idempotency_key']])).hexdigest()


def checkpoint_errors(value, schema):
    found = shared.checkpoint_errors(value, schema)
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
    if value['request_digest'] != hashlib.sha256(packed(command)).hexdigest():
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


def protocol_errors(context, original_payload, original_digest):
    """Synthetic evidence joins; real authority/OS proofs remain native obligations."""
    errors = []
    if not context['admitted']:
        errors.append('family absent')
    if not context['desktop']:
        errors.append('unsupported web')
    if not context['source_verified']:
        errors.append('unverified source')
    if context['receipt_event_id'] != context['original_event_id']:
        errors.append('wrong original receipt')
    if context['session'] != original_payload['app_session_id']:
        errors.append('prior session cannot act')
    if context['window'] != original_payload['window_id']:
        errors.append('wrong window')
    if hashlib.sha256(packed(context['retry_payload'])).hexdigest() != original_digest:
        errors.append('retry changed')
    if context['publication_state'] != 'current' or context['cursor'] > context['frontier']:
        errors.append('unavailable publication/cursor')
    return errors


def main():
    count = 0
    admitted = {row['event_type'] for row in load('Plans/event_family_registry.json')['families']}
    registry = load('Plans/storage_value_registry.json')
    for family in load('Plans/panel_event_contracts/manifest.json')['families']:
        slug, event = family['slug'], family['event_type']
        assert event not in admitted
        fixture = load(f'Plans/panel_event_contracts/{slug}.fixtures.json')
        schema = load(family['payload_schema'])
        Draft202012Validator.check_schema(schema)
        for case in fixture['payload_cases']:
            assert (not payload_errors(case['value'], schema)) == case['valid'], (event, case['name'])
            count += 1
        historical = load(f'Plans/event_payloads/{slug}.schema.json')
        assert not list(Draft202012Validator(historical).iter_errors(fixture['historical_v1']))
        assert payload_errors(fixture['historical_v1'], schema)
        assert list(Draft202012Validator(historical).iter_errors(fixture['payload_cases'][0]['value']))
        count += 3
        op_schema = load(f"Plans/panel_event_contracts/{family['operation']}.schema.json")
        cp_schema = load(f"Plans/panel_event_contracts/{family['checkpoint']}.schema.json")
        for value_schema in (op_schema, cp_schema):
            Draft202012Validator.check_schema(value_schema)
        operation = fixture['settled_operation']
        assert not operation_errors(operation, op_schema, schema, event)
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
        digest = hashlib.sha256(packed(payload)).hexdigest()
        context = dict(admitted=True, desktop=True, source_verified=True, receipt_event_id=operation['event_id'],
                       original_event_id=operation['event_id'], session=payload['app_session_id'], window=payload['window_id'],
                       retry_payload=payload, publication_state='current', cursor=0, frontier=1000)
        assert not protocol_errors(context, payload, digest)
        mutations = {'registry_absent': ('admitted', False), 'source_unverified': ('source_verified', False),
                     'wrong_original_receipt': ('receipt_event_id', 'foreign'), 'prior_session': ('session', 'ended'),
                     'wrong_window': ('window', 'foreign'), 'same_key_altered_payload': ('retry_payload', {**payload, 'actor_ref': 'foreign'}),
                     'withdrawn_publication': ('publication_state', 'withdrawn'), 'cursor_beyond_frontier': ('cursor', 1001),
                     'web_unsupported': ('desktop', False)}
        assert set(fixture['negative_protocol_cases']) <= mutations.keys()
        for name, (key, bad) in mutations.items():
            altered = copy.deepcopy(context)
            altered[key] = bad
            assert protocol_errors(altered, payload, digest), name
            count += 1
        for key, value_schema in [('operation', op_schema), ('checkpoint', cp_schema)]:
            fid = family[key]
            row = next(row for row in registry['families'] if row['family_id'] == fid)
            assert row['value_schema'] == {k: v for k, v in value_schema.items() if k != '$schema'}
            assert row['retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
            assert not shared.profile_errors(registry, fid, row['storage_kind'], 'settings_and_layout' if key == 'operation' else 'event_log')
            count += 1
        checkpoint = fixture['checkpoint']
        assert not checkpoint_errors(checkpoint, cp_schema)
        for field, bad_value in [('scope_partition', 'app'), ('storage_instance_id', 'foreign')]:
            altered = copy.deepcopy(checkpoint)
            altered[field] = bad_value
            assert checkpoint_errors(altered, cp_schema)
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
            assert (not checkpoint_errors(value, cp_schema)) == (target <= 16384)
            count += 1
        bad = copy.deepcopy(checkpoint)
        bad['event_refs'] = ['event_' + str(i) + '_' + 'a' * 64 for i in range(1000)]
        assert checkpoint_errors(bad, cp_schema)
        events = [dict(sequence_id=i + 1, event_type=event, project_id=payload['project_id'], event_ref='event_' + str(i))
                  for i in range(fixture['history_match_count'])]
        cursor, refs, complete = 0, [], False
        while not complete:
            page, new_cursor, complete = shared.history_page(events, event, payload['project_id'], cursor, len(events))
            assert new_cursor > cursor and len(page) <= 64
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
