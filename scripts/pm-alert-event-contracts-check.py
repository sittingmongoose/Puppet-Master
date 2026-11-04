#!/usr/bin/env python3
"""Static DG6A payload/custody oracle; grants no admission or native proof."""
import copy
import json
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]

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

def main():
    count = 0
    registry = load('Plans/event_family_registry.json')
    # Exact serialized event name cannot appear as an admitted event_type.
    admitted = {x.get('event_type') for x in registry['families']}
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
                valid = not list(Draft202012Validator(value_schema).iter_errors(case['value']))
                assert valid == case['valid'], (family['event_type'], key, case['name'])
                count += 1
        assert family['event_type'] not in admitted
        for key in ('operation', 'checkpoint'):
            row = next(x for x in load('Plans/storage_value_registry.json')['families'] if x['family_id'] == family[key])
            assert row['retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
            external = load(row['value_schema_ref'])
            assert row['value_schema'] == {k:v for k,v in external.items() if k != '$schema'}
        text = (ROOT / 'Plans/storage-plan.md').read_text().split(f"### {family['sp']} -", 1)[1].split('\n### ', 1)[0]
        for required in ('SP-278', 'SP-286', 'CV-339', 'storage.first_append_receipt.resolve.v2', 'PENDING_RETENTION_DECISION', family['handler'], family['event_type']):
            assert required in text, (family['event_type'], required)
    print(json.dumps({'status':'pass','cases':count,'families':4,'admission':'ABSENT','native':'NOT_RUN','retention':'PENDING_RETENTION_DECISION'}))

if __name__ == '__main__':
    main()
