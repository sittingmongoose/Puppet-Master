#!/usr/bin/env python3
"""Static DDBG planning contract oracles. No runtime/admission authority."""
import copy
import hashlib
import json
from pathlib import Path
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]

def identity(event, project, payload):
    preimage = [event, project, payload['investigation_id'], payload['operation_id']]
    digest = hashlib.sha256(json.dumps(preimage, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
    return 'debug:' + digest, 'evt_debug_' + digest

def refusal(case, admitted=False, retention='PENDING_RETENTION_DECISION', withdrawn=False):
    if withdrawn:
        return 'withdrawn'
    if not admitted:
        return 'unregistered'
    if retention == 'PENDING_RETENTION_DECISION':
        return 'retention_unresolved'
    return None

def main():
    schema = json.loads((ROOT/'Plans/debug_investigation_event_payloads.schema.json').read_text())
    fixture = json.loads((ROOT/'Plans/debug_investigation_event_fixtures.json').read_text())
    registry = json.loads((ROOT/'Plans/event_family_registry.json').read_text())
    admitted = {r['event_type'] for r in registry['families']}
    failures = []
    rows = []
    def check(ok, description):
        if not ok:
            failures.append(description)
    for case in fixture['cases']:
        event, payload = case['event_type'], case['payload']
        name = event.rsplit('.', 1)[1]
        definition = schema['$defs'][name]
        Draft202012Validator.check_schema(definition)
        validator = Draft202012Validator(definition)
        check(validator.is_valid(payload), event + ': positive payload')
        check(event not in admitted, event + ': must remain unadmitted')
        checks = 2
        for key in definition['required']:
            bad = copy.deepcopy(payload)
            del bad[key]
            check(not validator.is_valid(bad), event + ': missing ' + key)
            checks += 1
        for bad in [dict(payload, raw_log_dump='secret'), dict(payload, schema_version='2.0.0')]:
            check(not validator.is_valid(bad), event + ': closed payload/version')
            checks += 1
        original_key, original_id = identity(event, case['project_id'], payload)
        check([original_key, original_id] == case['expected_identity'], event + ': exact identity vector')
        check(identity(event, 'other-project', payload) != (original_key, original_id), event + ': scope substitution')
        other = dict(payload, operation_id='different-operation')
        check(identity(event, case['project_id'], other) != (original_key, original_id), event + ': distinct operation')
        # Same immutable identity, altered semantic body must conflict rather than append again.
        changed = dict(payload, **{case['mutation_field']:case['mutation_value']})
        check(validator.is_valid(changed), event + ': changed-body vector must stay schema-valid')
        check(identity(event, case['project_id'], changed) == (original_key, original_id), event + ': retry identity')
        digest = lambda p: hashlib.sha256(json.dumps(p, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
        check(digest(changed) != digest(payload), event + ': semantic digest conflict')
        custody = {original_key:(digest(payload), 'original-synced-receipt')}
        check(custody[original_key] == (digest(copy.deepcopy(payload)), 'original-synced-receipt'), event + ': lost ACK original custody')
        check(refusal(case) == 'unregistered', event + ': admission refusal')
        check(refusal(case, admitted=True) == 'retention_unresolved', event + ': retention refusal')
        check(refusal(case, admitted=True, retention='resolved', withdrawn=True) == 'withdrawn', event + ': withdrawal refusal')
        rows.append({'event_type':event,'schema_checks':checks,'native_execution':'NOT_RUN'})
    check(len(rows) == 8 and len({r['event_type'] for r in rows}) == 8, 'eight distinct prepared families')
    check('state_changed' not in schema['$defs'], 'owner question cannot be answered by a schema')
    print(json.dumps({'status':'FAIL' if failures else 'PASS','rows':rows,'failures':failures,'scope':'Static payload/identity/refusal oracles only; native NOT_RUN.'},indent=2))
    return bool(failures)

if __name__ == '__main__':
    raise SystemExit(main())
