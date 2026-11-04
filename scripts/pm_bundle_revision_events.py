#!/usr/bin/env python3
"""Static contract oracles for unadmitted Deep Plan bundle revision events. No native proof."""
import copy
import hashlib
import json
from pathlib import Path
from datetime import datetime, timezone
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]


def identity(payload):
    parts = [payload[k] for k in ('event_type', 'project_id', 'thread_id', 'bundle_id', 'revision_id', 'phase_sequence')]
    digest = hashlib.sha256(json.dumps(parts, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
    return 'evt_bundle_revision_' + digest, payload['event_type'] + ':' + digest


def validate(row, payload, envelope, previous):
    Draft202012Validator(json.loads((ROOT / row['schema']).read_text()), format_checker=FormatChecker()).validate(payload)
    assert payload["ts"].endswith("Z"), "UTC timestamp"
    try:
        datetime.fromisoformat(payload["ts"].replace("Z", "+00:00"))
    except ValueError as exc:
        raise AssertionError("invalid timestamp") from exc
    event_id, key = identity(payload)
    assert envelope['event_id'] == event_id and envelope['idempotency_key'] == key, 'identity'
    assert envelope['scope_kind'] == 'project', 'scope'
    for field in ('project_id', 'thread_id'):
        assert envelope[field] == payload[field], field
    assert envelope['correlation_id'] == payload['revision_id'], 'correlation'
    assert envelope['causation_event_id'] == payload['predecessor_event_id'], 'causation'
    assert envelope['run_id'] is None and envelope['attempt_id'] is None, 'runtime_scope'
    assert envelope['redaction_profile'] == 'secret_refs_only', 'redaction'
    assert envelope['replay_policy'] == 'dedupe_by_idempotency_key', 'replay'
    phase = row['phase']
    if phase == 'requested':
        assert previous is None and payload['predecessor_event_id'] is None and payload['phase_sequence'] == 0, 'request_predecessor'
    else:
        assert previous is not None, 'missing_predecessor'
        expected = 'requested' if phase == 'started' else 'started'
        assert previous['event_type'] in (["bundle.revision_requested", "bundle.revision_interrupted"] if phase == 'started' else ["bundle.revision_started"]), 'phase_order'
        assert payload['phase_sequence'] == previous['phase_sequence'] + 1, 'phase_sequence'
        assert payload['predecessor_event_id'] == previous['event_id'], 'predecessor_identity'
        for field in ('project_id', 'thread_id', 'bundle_id', 'revision_id', 'annotation_ids',
                      'requested_revision_capability', 'effective_revision_capability', 'permission_snapshot_id'):
            assert payload[field] == previous[field], 'predecessor_' + field


def main():
    fixtures = json.loads((ROOT / 'Plans/bundle_revision_event_fixtures.json').read_text())
    checks = 0
    for row in fixtures['families']:
        payload = row['positive']
        eid, key = identity(payload)
        envelope = dict(event_id=eid, idempotency_key=key, scope_kind='project', project_id=payload['project_id'],
                        thread_id=payload['thread_id'], correlation_id=payload['revision_id'],
                        causation_event_id=payload['predecessor_event_id'], run_id=None, attempt_id=None,
                        redaction_profile='secret_refs_only', replay_policy='dedupe_by_idempotency_key')
        previous = None if row['phase'] == 'requested' else dict(payload, event_id='evt-predecessor',
                    event_type='bundle.revision_' + ('requested' if row['phase'] == 'started' else 'started'), phase_sequence=payload['phase_sequence']-1)
        validate(row, payload, envelope, previous)
        checks += 1
        mutations = []
        for field in payload:
            p = copy.deepcopy(payload); del p[field]; mutations.append((p, envelope, previous))
        for field, value in [('unknown', True), ('annotation_ids', []), ('annotation_ids', ['a', 'a']),
                             ('effective_revision_capability', 'unvalidated'), ('schema_version', '2.0.0'), ('phase_sequence', -1),
                             ('event_type', 'bundle.revision_sibling'), ('ts', 'yesterday')]:
            p = copy.deepcopy(payload); p[field] = value; mutations.append((p, envelope, previous))
        for field, value in [('event_id', 'wrong'), ('idempotency_key', 'wrong'), ('scope_kind', 'application'),
                             ('project_id', 'other'), ('thread_id', 'other'), ('correlation_id', 'other'),
                             ('causation_event_id', 'other'), ('run_id', 'run'), ('attempt_id', 'attempt'),
                             ('redaction_profile', 'no_secrets'), ('replay_policy', 'effectful')]:
            e = copy.deepcopy(envelope); e[field] = value; mutations.append((payload, e, previous))
        if previous:
            for field in ('event_type', 'event_id', 'project_id', 'thread_id', 'bundle_id', 'revision_id',
                          'requested_revision_capability', 'effective_revision_capability', 'permission_snapshot_id'):
                p = copy.deepcopy(previous); p[field] = 'wrong'; mutations.append((payload, envelope, p))
            p = copy.deepcopy(previous); p['annotation_ids'] = ['other']; mutations.append((payload, envelope, p))
            mutations.append((payload, envelope, None))
        else:
            mutations.append((payload, envelope, payload))
        for p, e, prev in mutations:
            try:
                validate(row, p, e, prev)
            except Exception as exc:
                # Schema violations and semantic assertion failures are expected negative outcomes.
                from jsonschema.exceptions import ValidationError
                if not isinstance(exc, (AssertionError, ValidationError)):
                    raise
            else:
                raise AssertionError('negative accepted: ' + row['event_type'] + ' ' + repr((p,e,prev)))
            checks += 1
        if row['phase'] == 'started':
            resumed = dict(payload, phase_sequence=3)
            prior = dict(previous, event_type='bundle.revision_interrupted', phase_sequence=2)
            resumed_id, resumed_key = identity(resumed)
            validate(row, resumed, dict(envelope, event_id=resumed_id, idempotency_key=resumed_key), prior)
            checks += 1
        for name in (row['semantic_owner'], row['payload_owner'], row['storage_owner']):
            assert name in '\n'.join((ROOT / doc).read_text() for doc in
                                     ['Plans/assistant-chat-design.md', 'Plans/Contracts_V0.md', 'Plans/storage-plan.md'])
        assert row['retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
        print(row['event_type'] + ': PASS (static shape/identity/joins/order only)')
    from pm_dcw_event_oracles import run
    full_checks = run(validate)
    checks += full_checks
    assert all(x['execution_status'] == 'NOT_RUN' for x in fixtures['native_oracles'])
    print(json.dumps({'status': 'PASS', 'checks': checks, 'native': 'NOT_RUN', 'admission': 'ABSENT'}))


if __name__ == '__main__':
    main()
