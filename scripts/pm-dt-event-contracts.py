#!/usr/bin/env python3
"""Static DT draft checks. Never admits an event or claims native evidence."""
import copy
import hashlib
import json
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
ROOT = Path(__file__).resolve().parents[1]
def load(path):
    return json.loads((ROOT / path).read_text())
def canonical(value):
    # Identity vectors are arrays of UTF-8 strings or integers, with no floating numbers.
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()
def identity(contract, payload, partition='project~fixture'):
    values = [contract['event_type'], partition] + [payload[k] for k in contract['identity_fields']]
    key = 'dt:' + hashlib.sha256(canonical(values)).hexdigest()
    return key, 'evt_dt_' + hashlib.sha256(key.encode()).hexdigest()
def append_model(seen, key, digest, result):
    if key in seen:
        old_digest, original = seen[key]
        return ('original', original) if old_digest == digest else ('idempotency_conflict', None)
    seen[key] = (digest, result)
    return 'appended', result

def main():
    contracts = load('Plans/dt_event_contracts.json')['families']
    schemas = load('Plans/dt_event_contracts.schema.json')['$defs']
    fixtures = {f['event_type']: f for f in load('Plans/dt_event_contract_fixtures.json')['families']}
    registered = {f['event_type'] for f in load('Plans/event_family_registry.json')['families']}
    checks = 0
    failures = []
    def check(ok, text):
        nonlocal checks
        checks += 1
        if not ok:
            failures.append(text)
    for c in contracts:
        name = c['event_type']
        slug = name.replace('.', '_')
        schema = schemas[slug]
        Draft202012Validator.check_schema(schema)
        validator = Draft202012Validator(schema, format_checker=FormatChecker())
        p = fixtures[name]['valid_payload']
        check(not list(validator.iter_errors(p)), name + ': positive payload')
        check(name not in registered, name + ': draft remains absent')
        for key in fixtures[name]['required_field_negatives']:
            negative = copy.deepcopy(p)
            del negative[key]
            check(bool(list(validator.iter_errors(negative))), name + ': missing ' + key)
        negative = dict(p, unexpected='refused')
        check(bool(list(validator.iter_errors(negative))), name + ': unknown field')
        check(bool(list(validator.iter_errors(dict(p, schema_id='wrong-family')))), name + ': wrong schema')
        check(bool(list(validator.iter_errors(dict(p, schema_version='2.0.0')))), name + ': future version')
        key, event_id = identity(c, p)
        check(identity(c, copy.deepcopy(p)) == (key, event_id), name + ': stable retry identity')
        check(identity(c, p, 'app') != (key, event_id), name + ': partition isolation')
        negative = copy.deepcopy(p)
        subject = c['identity_fields'][0]
        negative[subject] = str(negative[subject]) + '-other'
        check(identity(c, negative) != (key, event_id), name + ': distinct subject')
        seen = {}
        digest = hashlib.sha256(canonical(p)).hexdigest()
        check(append_model(seen, key, digest, event_id) == ('appended', event_id), name + ': first append model')
        check(append_model(seen, key, digest, 'second') == ('original', event_id) and len(seen) == 1, name + ': lost ack model')
        check(append_model(seen, key, 'changed-semantic-digest', 'second') == ('idempotency_conflict', None), name + ': conflict model')
        cp = schemas[slug + '_checkpoint']
        Draft202012Validator.check_schema(cp)
        check(cp['additionalProperties'] is False, name + ': closed checkpoint')
        check(len(cp['properties']['index_read_token']['required']) == 9, name + ': nine-field token')
        token_validator = Draft202012Validator(cp['properties']['index_read_token'])
        check(bool(list(token_validator.iter_errors({'redb_snapshot_id': 'forbidden'}))), name + ': transient snapshot rejected')
        check(cp['properties']['consumer_id']['const'] == c['consumer_id'], name + ': consumer binding')
        check(cp['properties']['event_type']['const'] == name, name + ': exact filter')
        check(fixtures[name]['native_execution'] == 'NOT_RUN', name + ': native boundary')
    print(json.dumps({'status': 'pass' if not failures else 'fail', 'families': len(contracts), 'checks': checks, 'failures': failures, 'native_execution': 'NOT_RUN'}, indent=2))
    return bool(failures)
if __name__ == '__main__':
    raise SystemExit(main())
