#!/usr/bin/env python3
"""Static DG6B contract oracles; no native execution or admission."""
import copy
import datetime
import hashlib
import json
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
ROOT = Path(__file__).resolve().parents[1]

def identity(name, payload, scope_key):
    preimage = [name, payload['storage_instance_id'], scope_key, payload['operation_id'], payload['revision']]
    digest = hashlib.sha256(json.dumps(preimage, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
    return 'evt_' + name.replace('.', '_') + '_' + digest, name + ':' + digest

def semantic(name, payload, scope_key, event_id, original=None):
    if name.startswith('auth.github.') and scope_key != 'application':
        raise ValueError('scope')
    if identity(name, payload, scope_key)[0] != event_id:
        raise ValueError('identity')
    if original is not None and original != payload:
        raise ValueError('original_payload_conflict')
    if name == 'auth.github.token.polling':
        previous = payload['previous_interval_seconds']
        expected = previous + 5 if payload['outcome'] == 'slow_down' else previous
        if payload['poll_interval_seconds'] != expected:
            raise ValueError('cadence')

FORMAT = FormatChecker()

@FORMAT.checks("date-time", raises=(ValueError, TypeError))
def utc_datetime(value):
    if not isinstance(value, str) or not value.endswith("Z"):
        return False
    datetime.datetime.fromisoformat(value[:-1] + "+00:00")
    return True

def run():
    schema = json.loads((ROOT / 'Plans/dg6b_event_contracts.schema.json').read_text())
    fixtures = json.loads((ROOT / 'Plans/dg6b_event_contract_fixtures.json').read_text())
    expected = {'auth.github.authenticated', 'auth.github.device_code.issued', 'auth.github.disconnected',
                'auth.github.failed', 'auth.github.token.polling', 'plugin.hook.blocked', 'plugin.hook.error',
                'plugin.hook.invoked', 'plugin.load_failed', 'plugin.loaded', 'plugin.permission.override',
                'plugin.tool.collision', 'plugin.tool.registered'}
    assert {r['event_type'] for r in fixtures['families']} == expected
    results = []
    for row in fixtures['families']:
        name, p = row['event_type'], row['valid']
        slug = name.replace('.', '_')
        validator = Draft202012Validator(schema['$defs'][slug], format_checker=FORMAT)
        validator.validate(p)
        for bad in row['invalid']:
            assert list(validator.iter_errors(bad)), (name, 'accepted negative', bad)
        eid, idem = identity(name, p, 'application')
        assert (eid, idem) == (row['expected_event_id'], row['expected_idempotency_key'])
        semantic(name, p, 'application', eid)
        semantic(name, copy.deepcopy(p), 'application', eid, original=p)
        assert identity(name, copy.deepcopy(p), 'application') == (eid, idem)
        probes = [('identity', lambda: semantic(name, p, 'application', 'other'))]
        changed = {**p, 'ts': '2026-11-04T12:01:00Z'}
        probes.append(('original_payload_conflict', lambda: semantic(name, changed, 'application', eid, original=p)))
        if name.startswith('auth.'):
            probes.append(('scope', lambda: semantic(name, p, 'project:other', eid)))
        else:
            # Same operation in another source scope cannot have the original identity.
            probes.append(('identity', lambda: semantic(name, p, 'project:other', eid)))
        if name == 'auth.github.token.polling':
            bad = {**p, 'poll_interval_seconds': p['previous_interval_seconds']}
            validator.validate(bad)  # schema-valid relational negative
            probes.append(('cadence', lambda: semantic(name, bad, 'application', eid)))
        for reason, call in probes:
            try:
                call()
            except ValueError as exc:
                assert str(exc) == reason, (name, str(exc), reason)
            else:
                raise AssertionError((name, 'accepted semantic negative', reason))
        results.append({'event_type': name, 'payload_negatives': len(row['invalid']),
                        'relational_negatives': len(probes), 'event_id_vector': eid, 'status': 'pass'})
    # Prepared contract gate must not be confused with event registry membership.
    registry = json.loads((ROOT / 'Plans/event_family_registry.json').read_text())
    assert not expected.intersection(r['event_type'] for r in registry['families'])
    values = json.loads((ROOT / 'Plans/storage_value_registry.json').read_text())
    for name in expected:
        slug = name.replace('.', '_')
        value = next(r for r in values['families'] if r['family_id'] == slug + '_operation')
        assert value['retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
        Draft202012Validator.check_schema(value['value_schema'])
    return {'status': 'pass', 'native_execution': 'NOT_RUN', 'rows': results}

if __name__ == '__main__':
    print(json.dumps(run(), indent=2))
