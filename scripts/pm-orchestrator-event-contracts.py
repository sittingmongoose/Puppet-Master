#!/usr/bin/env python3
"""DO static contract checks; no admission or native runtime proof."""
import copy
import hashlib
import json
from pathlib import Path
from datetime import datetime
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
UTC_FORMAT = FormatChecker()
@UTC_FORMAT.checks('date-time', raises=(ValueError, TypeError))
def utc(value):
    if not isinstance(value, str) or not value.endswith('Z'):
        return False
    datetime.fromisoformat(value.replace('Z', '+00:00'))
    return True

def identity(family, payload):
    partition = 'app'
    if payload['scope'] == 'project':
        import base64
        partition = 'project~' + base64.urlsafe_b64encode(payload['project_id'].encode()).decode().rstrip('=')
    parts = ['ea-do-v1', partition, payload['server_id'], payload['thread_id'], payload['run_id'], family, payload['operation_id'], payload['occurrence']]
    # Vector values are ASCII strings/positive integers, identical in RFC8785.
    digest = hashlib.sha256(json.dumps(parts, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()
    return 'do1:' + digest, 'evt_do_' + digest

def main():
    schema = json.loads((ROOT / 'Plans/orchestrator_event_payloads.schema.json').read_text())
    fixtures = json.loads((ROOT / 'Plans/orchestrator_event_contract_fixtures.json').read_text())
    owner = (ROOT / 'Plans/orchestrator-subagent-integration.md').read_text()
    registry = json.loads((ROOT / 'Plans/event_family_registry.json').read_text())
    admitted = {f['event_type'] for f in registry['families']}
    checks = 0
    for contract in fixtures['contracts']:
        family = contract['event_type']
        assert family not in admitted, ('unexpected_admission', family)
        section = owner.split('### ' + contract['unit'] + ' — ' + family + '\n', 1)[1].split('\n### ', 1)[0]
        for token in [contract['reader'], contract['policy'], contract['producer'], contract['predicate'], 'SP-278', 'SP-286', 'none_required', 'withdrawal', 'NOT_RUN']:
            assert token in section, (family, token)
        checks += 1
    for case in fixtures['valid_payloads']:
        definition = schema['$defs'][case['definition']]
        Draft202012Validator.check_schema(definition)
        validator = Draft202012Validator(definition, format_checker=UTC_FORMAT)
        payload = case['payload']
        validator.validate(payload)
        checks += 1
        negatives = []
        for field in definition['required']:
            bad = copy.deepcopy(payload)
            del bad[field]
            negatives.append(bad)
        for field, value in [('unknown_field', 'x'), ('schema_version', '2.0.0'), ('scope', 'foreign'), ('occurrence', 0), ('occurred_at_utc', 'yesterday')]:
            bad = copy.deepcopy(payload); bad[field] = value; negatives.append(bad)
        bad = copy.deepcopy(payload)
        if case['scope'] == 'project':
            del bad['project_id']
        else:
            bad['project_id'] = 'invented-project'
        negatives.append(bad)
        for bad in negatives:
            assert list(validator.iter_errors(bad)), (case['event_type'], bad)
            checks += 1
        baseline = identity(case['event_type'], payload)
        assert identity(case['event_type'], copy.deepcopy(payload)) == baseline
        for field in ['operation_id', 'occurrence', 'server_id', 'thread_id', 'run_id']:
            bad = copy.deepcopy(payload)
            bad[field] = bad[field] + 1 if field == 'occurrence' else bad[field] + '-other'
            assert identity(case['event_type'], bad) != baseline
            checks += 1
        assert identity(case['event_type'] + '.sibling', payload) != baseline
        checks += 1
    print(json.dumps({'status': 'pass', 'families': len(fixtures['contracts']), 'checks': checks, 'native': 'NOT_RUN'}))

if __name__ == '__main__':
    main()
