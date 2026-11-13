"""Static contract oracles for unadmitted Deep Plan bundle revision events. No native proof."""
import pm_dcw_event_oracles as m
import pm_event_datetime as event_datetime
import copy
import hashlib
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def identity(payload):
    parts = [payload[k] for k in ('event_type', 'project_id', 'thread_id', 'bundle_id', 'revision_id', 'phase_sequence')]
    from pm_dcw_event_oracles import canonical_json
    digest = hashlib.sha256(canonical_json(parts)).hexdigest()
    return ('evt_bundle_revision_' + digest, payload['event_type'] + ':' + digest)

def validate(row, payload, envelope, previous):
    m.check_schema(row['schema'], payload)
    m.guard_rows.enforce('L001', {'site': 'L001', 'code': 'UTC timestamp', 'v0': payload['ts'].endswith('Z')})
    try:
        event_datetime.date_time(payload['ts'], profile=event_datetime.EVENT_RECORD)
    except event_datetime.Refusal:
        m.guard_rows.enforce('LE001', {'site': 'LE001', 'code': 'invalid timestamp', 'v0': 'refused'})
    else:
        m.guard_rows.enforce('LE001', {'site': 'LE001', 'code': 'invalid timestamp', 'v0': None})
    event_id, key = identity(payload)
    m.guard_rows.enforce('L002', {'site': 'L002', 'code': 'identity', 'v0': envelope['event_id'], 'v1': event_id})
    m.guard_rows.enforce('L003', {'site': 'L003', 'code': 'identity', 'v0': envelope['idempotency_key'], 'v1': key})
    m.guard_rows.enforce('L004', {'site': 'L004', 'code': 'scope', 'v0': envelope['scope_kind']})
    for field in ('project_id', 'thread_id'):
        m.guard_rows.enforce('L005', {'site': 'L005', 'code': field, 'v0': envelope[field], 'v1': payload[field]})
    m.guard_rows.enforce('L006', {'site': 'L006', 'code': 'correlation', 'v0': envelope['correlation_id'], 'v1': payload['revision_id']})
    m.guard_rows.enforce('L007', {'site': 'L007', 'code': 'causation', 'v0': envelope['causation_event_id'], 'v1': payload['predecessor_event_id']})
    m.guard_rows.enforce('L008', {'site': 'L008', 'code': 'runtime_scope', 'v0': envelope['run_id']})
    m.guard_rows.enforce('L009', {'site': 'L009', 'code': 'runtime_scope', 'v0': envelope['attempt_id']})
    m.guard_rows.enforce('L010', {'site': 'L010', 'code': 'redaction', 'v0': envelope['redaction_profile']})
    if m.PASSIVE.get():
        m.guard_rows.enforce('H002', {'site':'H002','code':'replay','v0':envelope['replay_policy']})
    else:
        m.guard_rows.enforce('L011', {'site': 'L011', 'code': 'replay', 'v0': envelope['replay_policy']})
    phase = row['phase']
    if phase == 'requested':
        m.guard_rows.enforce('L012', {'site': 'L012', 'code': 'request_predecessor', 'v0': previous})
        m.guard_rows.enforce('L013', {'site': 'L013', 'code': 'request_predecessor', 'v0': payload['predecessor_event_id']})
        m.guard_rows.enforce('L014', {'site': 'L014', 'code': 'request_predecessor', 'v0': payload['phase_sequence']})
    else:
        m.guard_rows.enforce('L015', {'site': 'L015', 'code': 'missing_predecessor', 'v0': previous})
        expected = 'requested' if phase == 'started' else 'started'
        m.guard_rows.enforce('L016', {'site': 'L016', 'code': 'phase_order', 'v0': previous['event_type'], 'v1': ['bundle.revision_requested', 'bundle.revision_interrupted'] if phase == 'started' else ['bundle.revision_started']})
        m.guard_rows.enforce('L017', {'site': 'L017', 'code': 'phase_sequence', 'v0': type(previous['phase_sequence']).__name__})
        m.guard_rows.enforce('L018', {'site': 'L018', 'code': 'phase_sequence', 'v0': payload['phase_sequence'], 'v1': previous['phase_sequence']})
        m.guard_rows.enforce('L019', {'site': 'L019', 'code': 'predecessor_identity', 'v0': payload['predecessor_event_id'], 'v1': previous['event_id']})
        for field in ('project_id', 'thread_id', 'bundle_id', 'revision_id', 'annotation_ids', 'requested_revision_capability', 'effective_revision_capability', 'permission_snapshot_id'):
            m.guard_rows.enforce('L020', {'site': 'L020', 'code': 'predecessor_' + field, 'v0': payload[field], 'v1': previous[field]})

def main(family=None):
    fixtures = json.loads((ROOT / 'Plans/bundle_revision_event_fixtures.json').read_text())
    checks = 0
    for row in (r for r in fixtures['families'] if family is None or r['event_type'] == family):
        payload = row['positive']
        eid, key = identity(payload)
        envelope = dict(event_id=eid, idempotency_key=key, scope_kind='project', project_id=payload['project_id'], thread_id=payload['thread_id'], correlation_id=payload['revision_id'], causation_event_id=payload['predecessor_event_id'], run_id=None, attempt_id=None, redaction_profile='secret_refs_only', replay_policy='dedupe_by_idempotency_key')
        previous = None if row['phase'] == 'requested' else dict(payload, event_id='evt-predecessor', event_type='bundle.revision_' + ('requested' if row['phase'] == 'started' else 'started'), phase_sequence=payload['phase_sequence'] - 1)
        validate(row, payload, envelope, previous)
        checks += 1
        mutations = []
        for field in payload:
            p = copy.deepcopy(payload)
            del p[field]
            mutations.append((p, envelope, previous))
        for field, value in [('unknown', True), ('annotation_ids', []), ('annotation_ids', ['a', 'a']), ('effective_revision_capability', 'unvalidated'), ('schema_version', '2.0.0'), ('phase_sequence', -1), ('event_type', 'bundle.revision_sibling'), ('ts', 'yesterday')]:
            p = copy.deepcopy(payload)
            p[field] = value
            e = copy.deepcopy(envelope)
            prev = copy.deepcopy(previous)
            e['event_id'], e['idempotency_key'] = identity(p)
            if prev is not None and field in ('annotation_ids', 'effective_revision_capability'):
                prev[field] = copy.deepcopy(value)
            mutations.append((p, e, prev))
        for field, value in [('event_id', 'wrong'), ('idempotency_key', 'wrong'), ('scope_kind', 'application'), ('project_id', 'other'), ('thread_id', 'other'), ('correlation_id', 'other'), ('causation_event_id', 'other'), ('run_id', 'run'), ('attempt_id', 'attempt'), ('redaction_profile', 'no_secrets'), ('replay_policy', 'effectful')]:
            e = copy.deepcopy(envelope)
            e[field] = value
            mutations.append((payload, e, previous))
        if previous:
            for field in ('event_type', 'event_id', 'project_id', 'thread_id', 'bundle_id', 'revision_id', 'requested_revision_capability', 'effective_revision_capability', 'permission_snapshot_id'):
                p = copy.deepcopy(previous)
                p[field] = 'wrong'
                mutations.append((payload, envelope, p))
            p = copy.deepcopy(previous)
            p['annotation_ids'] = ['other']
            mutations.append((payload, envelope, p))
            mutations.append((payload, envelope, None))
        else:
            mutations.append((payload, envelope, payload))
        for p, e, prev in mutations:
            try:
                validate(row, p, e, prev)
            except Exception as exc:
                from jsonschema.exceptions import ValidationError
                if not isinstance(exc, (AssertionError, ValidationError, m.Refusal)):
                    raise
            else:
                raise AssertionError('negative accepted: ' + row['event_type'] + ' ' + repr((p, e, prev)))
            checks += 1
        if row['phase'] == 'started':
            resumed = dict(payload, phase_sequence=3)
            prior = dict(previous, event_type='bundle.revision_interrupted', phase_sequence=2)
            resumed_id, resumed_key = identity(resumed)
            validate(row, resumed, dict(envelope, event_id=resumed_id, idempotency_key=resumed_key), prior)
            checks += 1
        for name in (row['semantic_owner'], row['payload_owner'], row['storage_owner']):
            assert name in '\n'.join(((ROOT / doc).read_text() for doc in ['Plans/assistant-chat-design.md', 'Plans/Contracts_V0.md', 'Plans/storage-plan.md']))
        assert row['retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
        print(row['event_type'] + ': PASS (static shape/identity/joins/order only)')
    from pm_dcw_event_oracles import run
    full_checks = run(validate, family)
    checks += full_checks
    assert all((x['execution_status'] == 'NOT_RUN' for x in fixtures['native_oracles']))
    print(json.dumps({'status': 'PASS', 'checks': checks, 'native': 'NOT_RUN', 'admission': 'ABSENT'}))
if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family')
    main(parser.parse_args().family)
