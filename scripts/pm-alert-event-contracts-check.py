#!/usr/bin/env python3
"""Static DG6A payload/custody oracle; grants no admission or native proof."""
import copy
import importlib.util
import json
import sys
from pathlib import Path
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

def checkpoint_errors(value, schema):
    found = list(Draft202012Validator(schema).iter_errors(value))
    if len(packed(value)) > 16384:
        found.append('checkpoint exceeds 16384 encoded bytes')
    if not found:
        token = value['index_read_token']
        if not (value['storage_instance_id'] == token['storage_instance_id'] == token['source_selection']['storage_instance_id']):
            found.append('foreign Storage token')
    return found

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

def history_page(events, event_type, project_id, after, frontier):
    """Static reference oracle for bounded read-through; not native source authentication."""
    result, scanned, cursor = [], 0, after
    for event in events:
        seq = event['sequence_id']
        if not after < seq <= frontier:
            continue
        match = event['event_type'] == event_type and event['project_id'] == project_id
        candidate = result + [event['event_ref']] if match else result
        # A small response-metadata allowance here; the writer measures the complete response.
        if scanned == 256 or len(candidate) > 64 or len(packed(candidate)) + 4096 > 16384:
            break
        result, scanned, cursor = candidate, scanned + 1, seq
    return result, cursor, cursor == frontier

def main():
    count = 0
    registry = load('Plans/event_family_registry.json')
    # Exact serialized event name cannot appear as an admitted event_type.
    admitted = {x.get('event_type') for x in registry['families']}
    values = load('Plans/storage_value_registry.json')
    for family in load('Plans/alert_event_contracts/manifest.json')['families']:
        schema = load(family['payload_schema'])
        Draft202012Validator.check_schema(schema)
        fixtures = load(f"Plans/alert_event_contracts/{family['slug']}.fixtures.json")
        for case in fixtures['payload_cases']:
            actual = not errors(case['payload'], schema, case['guard'])
            assert actual == case['valid'], (family['event_type'], case['name'], actual)
            count += 1
        for key in ('operation', 'checkpoint'):
            path = f"Plans/alert_event_contracts/{family[key]}.schema.json"
            value_schema = load(path)
            Draft202012Validator.check_schema(value_schema)
            for case in fixtures[key + '_cases']:
                valid = not (checkpoint_errors(case['value'], value_schema) if key == 'checkpoint'
                             else list(Draft202012Validator(value_schema).iter_errors(case['value'])))
                assert valid == case['valid'], (family['event_type'], key, case['name'])
                count += 1
            if key == 'checkpoint':
                baseline = copy.deepcopy(fixtures['checkpoint_cases'][0]['value'])
                regression = copy.deepcopy(baseline)
                regression['event_refs'] = ['event_' + str(i) + '_' + 'a' * 64 for i in range(1000)]
                assert len(packed(regression)) > 16384 and checkpoint_errors(regression, value_schema)
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
                    assert (not checkpoint_errors(value, value_schema)) == case['valid'], case['name']
                    count += 1
                for case in fixtures['read_through_cases']:
                    events = [{'sequence_id': i + 1, 'event_type': family['event_type'] if i < case['matches'] else 'other',
                               'project_id': 'fixture', 'event_ref': 'event_' + str(i) + '_' + 'a' * 64}
                              for i in range(case['matches'] + case.get('nonmatches', 0))]
                    cursor, refs, complete = 0, [], False
                    while not complete:
                        page, next_cursor, complete = history_page(events, family['event_type'], 'fixture', cursor, len(events))
                        assert next_cursor > cursor
                        assert len(page) <= 64 and len(packed(page)) + 4096 <= 16384
                        refs += page
                        cursor = next_cursor
                    assert len(refs) == len(set(refs)) == case['expected_matches']
                    assert len(packed(baseline)) < 16384 and 'event_refs' not in baseline
                    count += 1
            group = 'event_log' if key == 'checkpoint' else 'coordination_and_storage'
            row = next(x for x in values['families'] if x['family_id'] == family[key])
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
        assert not profile_errors(values, fid, 'redb', 'settings_and_layout')
        missing = copy.deepcopy(values)
        del missing['storage_profile']['family_profiles'][fid]
        assert profile_errors(missing, fid, 'redb', 'settings_and_layout')
        count += 2
    print(json.dumps({'status':'pass','cases':count,'families':4,'admission':'ABSENT','native':'NOT_RUN','retention':'PENDING_RETENTION_DECISION'}))

if __name__ == '__main__':
    main()
