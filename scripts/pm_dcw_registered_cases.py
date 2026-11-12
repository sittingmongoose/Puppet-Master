"""B1 mixed-source witnesses; every capture retains nonmatching registered rows."""
import copy

import pm_dcw_event_oracles as m
from pm_dcw_index_fixtures import snapshot


def registered_original():
    frames = m.load('Plans/event_index_consumer_adoption_fixtures.json')['positive']['both_full_owner_joins']['generic']['current_source']['frames']
    return copy.deepcopy(next(f['event'] for f in frames if f['event']['event_type'] == 'run.started'))


def mixed(row, historical=False, mutate=None):
    value = copy.deepcopy(row['positive'])
    originals = list(value['authority']['events'].values())
    event = registered_original()
    # The only capture adaptation is Storage's source-order sequence. Project,
    # identity, payload and timestamps remain the genuine owner's v2 original.
    event['sequence_id'] = max(e['sequence_id'] for e in originals) + 1
    if historical:
        event['payload_schema_id'] = 'https://puppetmaster.local/schemas/event_payloads/run_started/1.0.0'
        event['payload'] = {k: event['payload'][k] for k in
                            ('run_id', 'project_id', 'runtime_mode', 'ts', 'requested_effective_snapshot_ref')}
        # This separate synthetic v1 reader witness does not claim native old
        # admission, nor replace or upgrade the genuine v2 original above.
    if mutate:
        mutate(event)
    value['index'], value['reader'] = snapshot(originals + [event], value['authority']['storage_instance_id'],
                                              value['authority']['recovery_epoch'])
    return value


def cases(row):
    result = []
    variants = [
        ('registered_run_started_v2', False, None, 'accept'),
        ('registered_run_started_v1_reader', True, None, 'accept'),
        ('registered_schema_id', False, lambda e: e.update(payload_schema_id='urn:pm:unsupported-run-started'), 'index_source_dispatch'),
        ('registered_payload_version', False, lambda e: e['payload'].update(schema_version='9.0.0'), 'index_source_payload'),
        ('registered_payload_body', False, lambda e: e['payload'].update(unknown_field=True), 'index_source_payload'),
        ('registered_unknown_version_id', False, lambda e: e.update(payload_schema_id='https://puppetmaster.local/schemas/event_payloads/run_started/0.0.0'), 'index_source_dispatch'),
        ('registered_historical_payload', True, lambda e: e['payload'].update(unknown_field=True), 'index_source_payload'),
    ]
    for name, historical, mutation, expected in variants:
        value = mixed(row, historical, mutation)
        for operation in ('read', 'rebuild', 'compatibility_read'):
            scenario = copy.deepcopy(value)
            if operation == 'compatibility_read':
                scenario['event']['replay_policy'] = 'projector_replay_only'
            result.append(dict(case_id='round9_' + name + '_' + operation,
                               operation=operation, expected=expected, _value=scenario))
    return result
