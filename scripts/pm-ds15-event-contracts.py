#!/usr/bin/env python3
"""Static DS15 schema/oracle checks; never Event admission or native proof."""
import copy
import json
from pathlib import Path
import jsonschema

ROOT = Path(__file__).resolve().parents[1]
def read(path):
    return json.loads((ROOT / path).read_text())

def main():
    contracts = read('Plans/ds15_event_contracts.json')
    fixtures = read('Plans/ds15_event_contract_fixtures.json')
    registry = read('Plans/event_family_registry.json')
    values = read('Plans/storage_value_registry.json')['families']
    count = 0
    for c in contracts:
        name = c['event_type']
        assert name not in json.dumps(registry), name + ' unexpectedly admitted'
        schema = read(c['payload_schema_ref'])
        jsonschema.Draft202012Validator.check_schema(schema)
        validator = jsonschema.Draft202012Validator(schema)
        f = next(f for f in fixtures if f['event_type'] == name)
        validator.validate(f['positive'])
        count += 1
        for case in f['negative']:
            bad = copy.deepcopy(f['positive'])
            if case['mutation'] == 'missing_field':
                bad.pop(case['field'])
            else:
                bad[case['field']] = case['value']
            assert list(validator.iter_errors(bad)), (name, case)
            count += 1
        cp = read(c['checkpoint_schema_ref'])
        jsonschema.Draft202012Validator.check_schema(cp)
        token = cp['$defs']['read_token']
        assert len(token['required']) == 9
        assert 'redb_snapshot_id' not in token['properties']
        assert cp['additionalProperties'] is False
        assert cp['properties']['consumer_id']['const'] == c['consumer']
        row = next(v for v in values if v['value_schema_ref'] == c['checkpoint_schema_ref'])
        assert row['key_shape'] == c['checkpoint_key']
        assert row['value_schema'] == cp
        assert row['retention_policy_ref'] == c['checkpoint_retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
        for key in ('semantic_owner', 'storage_owner', 'payload_owner', 'oracle_owner'):
            path, unit = c[key].split('#')
            assert unit in (ROOT / path).read_text()
        text = (ROOT / 'Plans/newtools.md').read_text()
        start = text.index('### ' + c['semantic_owner'].split('#')[1] + ' ')
        end = text.find('\n### ', start + 1)
        own = text[start:end if end != -1 else len(text)]
        own = json.loads(own.split('```yaml\n', 1)[1].split('\n```', 1)[0])['canonical_text']
        for word in (name, c['consumer'], c['checkpoint_key'], c['idempotency_recipe'], 'SP-278', 'SP-286', 'CV-339', 'withdrawal', 'NOT_RUN'):
            assert word in own, (name, word)
    print(json.dumps({'status': 'pass', 'families': len(contracts), 'payload_oracles': count, 'native_execution': 'NOT_RUN'}))

if __name__ == '__main__':
    main()
