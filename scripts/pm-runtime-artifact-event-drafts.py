#!/usr/bin/env python3
"""Static DR event-draft schema/identity/source-join oracles. Native execution NOT_RUN."""
import copy
import hashlib
import json
from pathlib import Path
import struct
import sys
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]

def identity(event, payload):
    members = [event, payload['project_id'], payload['artifact_id'], payload['schema_id']]
    encoded = [v.encode('utf-8', errors='strict') for v in members]
    return 'ra1:' + hashlib.sha256(b''.join(struct.pack('>I', len(v)) + v for v in encoded)).hexdigest()

def inspect(row, payload, source):
    """Bounded contract model only; does not authenticate native storage."""
    if source['withdrawn'] or not source['authorized']:
        return 'unavailable'
    if not source['source_valid'] or not source['receipt_valid']:
        return 'unavailable'
    if source['project_id'] != payload['project_id'] or source['event_type'] != row['event_type']:
        return 'identity_conflict'
    if source['original_payload'] != payload:
        return 'identity_conflict'
    return 'metadata_only' if source['body_deleted'] else 'metadata_and_authorized_refs'

def main():
    document = json.loads((ROOT / 'Plans/runtime_artifact_event_drafts.json').read_text())
    fixtures = json.loads((ROOT / 'Plans/runtime_artifact_event_drafts.fixtures.json').read_text())
    failures = []
    total = 0
    for row in document['rows']:
        event = row['event_type']
        if row['outcome'] == 'blocked on Jared':
            assert event == 'runtime_artifact.restore_point' and 'producer' not in row
            continue
        schema = json.loads((ROOT / row['payload_schema_ref']).read_text())
        assert schema['additionalProperties'] is False and schema['$id'] == row['payload_schema_id']
        Draft202012Validator.check_schema(schema)
        validator = Draft202012Validator(schema)
        payload = fixtures['positive_payloads'][event]
        cases = [(event + ':valid', not list(validator.iter_errors(payload)))]
        bad = copy.deepcopy(payload); bad['unexpected_event_extension'] = True
        cases.append((event + ':closed_root', bool(list(validator.iter_errors(bad)))))
        bad = copy.deepcopy(payload); bad['artifact_type'] = 'wrong_type'
        cases.append((event + ':wrong_type', bool(list(validator.iter_errors(bad)))))
        bad = copy.deepcopy(payload); del bad['artifact_id']
        cases.append((event + ':missing_identity', bool(list(validator.iter_errors(bad)))))
        for case in fixtures['source_cases']:
            source = dict(project_id=payload['project_id'], event_type=event, original_payload=copy.deepcopy(payload),
                          authorized=True, source_valid=True, receipt_valid=True, withdrawn=False, body_deleted=False)
            source.update(case['overrides'])
            cases.append((event + ':' + case['id'], inspect(row, payload, source) == case['expected']))
        # The same identity with a changed semantic value must conflict, not overwrite.
        source = dict(project_id=payload['project_id'], event_type=event, original_payload=copy.deepcopy(payload),
                      authorized=True, source_valid=True, receipt_valid=True, withdrawn=False, body_deleted=False)
        changed = copy.deepcopy(payload); changed['summary'] = 'changed semantic summary'
        cases.append((event + ':immutable_payload', identity(event, payload) == identity(event, changed) and inspect(row, changed, source) == 'identity_conflict'))
        other = copy.deepcopy(payload); other['project_id'] += '-other'
        cases.append((event + ':cross_project_identity', identity(event, payload) != identity(event, other)))
        # Abstract append oracle: immutable identity and semantic equality select one original result.
        ledger = {}
        def append(candidate, admission=True):
            if not admission:
                return 'withdrawn'
            key = identity(event, candidate)
            if key in ledger:
                original, receipt = ledger[key]
                return receipt if original == candidate else 'idempotency_conflict'
            receipt = {'event_id':'original-event', 'sequence_id':17, 'group_digest':'original-group'}
            ledger[key] = (copy.deepcopy(candidate), receipt)
            return receipt
        first = append(payload)
        replay = append(copy.deepcopy(payload))
        cases.append((event + ':lost_ack_exact_result', first is replay and len(ledger) == 1))
        cases.append((event + ':retry_conflict_no_append', append(changed) == 'idempotency_conflict' and len(ledger) == 1))
        cases.append((event + ':withdrawal_no_append', append(payload, False) == 'withdrawn' and len(ledger) == 1))
        for name, passed in cases:
            total += 1
            if not passed: failures.append(name)
    # Fixed external framing vector: ["a","bc","d","e"] differs from ["ab","c","d","e"].
    a = dict(project_id='bc',artifact_id='d',schema_id='e')
    b = dict(project_id='c',artifact_id='d',schema_id='e')
    assert identity('a',a) != identity('ab',b)
    print(json.dumps({'status':'pass' if not failures else 'fail','cases':total,'failures':failures,
                      'native_execution':'NOT_RUN','scope':'static schemas and bounded source-join model only'},indent=2))
    return bool(failures)

if __name__ == '__main__':
    sys.exit(main())
