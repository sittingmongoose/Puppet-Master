"""C12-SS: seglog.event_appended complete producer, settlement and reader boundary, and the DL-076 refrozen package.

Owner clauses (SP-270, SP-2210, DL-076): exactly one observability obligation
per newly committed native original after the adoption floor, never for a
seglog.event_appended original, a projector_replay_only original, a pre-floor,
compatibility, import or relocated record; source-first order (original frame
and watermark proved, metadata admitted and appended with its own synced
receipt, then the canonical settlement prefix, then the disposable checkpoint),
an unproved source leaving the obligation pending; identity_digest =
SHA256(RFC 8785 [storage_instance_id, original.event_id]) for event_id and
idempotency_key; the payload mapping (seq, type, event_ref, original segment
ref, ts = original persisted time, no writer_id) and envelope bindings (inherited
scope, null joins, the append-observer actor, copied correlation, causation and
parent = the original, producer_sequence_id = original sequence, metadata
sequence strictly later); retry returns the original result, a conflicting
digest is idempotency_conflict and unavailable authority dedupe_unavailable; a
metadata failure never rewrites the original result or receipt; and the
reader, which stores only the nine-field durable token (DL-076; the
stored-snapshot negative of SP-2210) and discloses under the live token of its
own read, reports source_removed and source_unavailable honestly and follows no
metadata-about-metadata chain. evidence() authenticates and replays the SP-270
package refrozen for DL-076 (v5). Native execution remains NOT_RUN.
"""
import copy
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

import pm_s3bo_oracles as w
import pm_s3bo_sr_common as sr
import pm_s3bo_ss_common as s

LANE = 'ss'
SEG = 'seglog.event_appended'
FAMILIES = (SEG,)
FIXTURES = w.read_json('Plans/seglog_append_observability_contract_fixtures.json')
READER_ROOT = sr.schema_root('Plans/seglog_append_observability_contracts.schema.json', 'reader_checkpoint')
ACTOR = 'storage.append_observer:' + w.STORE + ':v1'
STEPS = ['prove_original_frame', 'prove_original_watermark', 'admit_metadata', 'append_metadata', 'metadata_receipt',
         'advance_settlement_prefix', 'commit_producer_checkpoint']
PACKAGE = Path('/mnt/Cursor/PM-Experiments/ea-c12-ss-seglog-refreeze-20261114/event-authority-step08-seglog-appended-20260911/v5')
PACKAGE_MANIFEST_SHA256 = '8284857eaef00eaec19b333c4fc5c5ae5cbf696872b52b8efabd73c8e8e04ac2'
PRIOR_MANIFEST_SHA256 = '1dbd8542840086c1741d55cc2ada0edbc4b3c02affa552c60d4f13321251a171'
PLANS_SCHEMA = 'Plans/seglog_append_observability_contracts.schema.json'

ROWS = [
    ('ss_seg_obligation', 'ss_seglog', 'equal', 'Each original is emitted, skipped for its exact SP-270 reason, left pending, replayed or refused as SP-270 decides.'),
    ('ss_seg_events', 'ss_seglog', 'equal', 'Exactly one metadata append per emitted native original; skips, pending, replay and refusals append none.'),
    ('ss_seg_order', 'ss_seglog', 'equal', 'Original frame and watermark, metadata admission, append and receipt, then canonical prefix, then disposable checkpoint.'),
    ('ss_seg_identity', 'ss_seglog', 'equal', 'event_id and idempotency_key use SHA-256 of RFC 8785 [storage_instance_id, original.event_id].'),
    ('ss_seg_payload', 'ss_seglog', 'equal', 'The payload maps seq, type, event_ref, the original segment ref and the original persisted time, with no writer_id.'),
    ('ss_seg_envelope', 'ss_seglog', 'equal', 'The envelope inherits scope, binds the observer actor and original lineage, and its sequence is strictly later.'),
    ('ss_seg_original', 'ss_seglog', 'equal', 'The original result and receipt are never rewritten or replaced by metadata, whatever observability does.'),
    ('ss_seg_retry', 'ss_seglog', 'equal', 'Same identity and digest returns the original result; a conflicting digest or unavailable authority refuses.'),
    ('ss_seg_reader', 'ss_seglog_custody', 'equal', 'The reader stores the nine-field durable token, discloses under the live token of its read and reports sources honestly.'),
    ('ss_seg_schema', 'ss_seglog_custody', 'error', 'Every stored reader checkpoint keeps every keyword of the closed SP-270 schema, so a stored redb_snapshot_id refuses.'),
    ('ss_seg_time', 'ss_seglog_custody', 'error', 'Metadata first-receipt acknowledgements use the EventRecord date_time profile (E5-2).'),
]


def digest_of(original_id):
    return s.jcs_sha([w.STORE, original_id])


def metadata_for(original, append_result):
    d = digest_of(original['event_id'])
    return {'event_id': 'evt_seglog_appended_' + d, 'idempotency_key': 'seglog.event_appended:' + d,
            'payload': {'seq': original['sequence_id'], 'type': original['event_type'], 'event_ref': original['event_id'],
                        'segment_ref': append_result['segment_ref'], 'ts': original['persisted_at_utc']},
            'scope_kind': original['scope_kind'], 'project_id': original['project_id'], 'thread_id': None, 'run_id': None, 'node_id': None,
            'attempt_id': None, 'actor_ref': ACTOR, 'requested_account_ref': None, 'effective_account_ref': None,
            'occurred_at_utc': original['persisted_at_utc'], 'correlation_id': original['correlation_id'],
            'causation_event_id': original['event_id'], 'parent_event_id': original['event_id'],
            'producer_sequence_id': original['sequence_id'], 'payload_ref': None, 'redaction_profile': 'no_secrets',
            'replay_policy': 'dedupe_by_idempotency_key', 'event_type': SEG,
            'migration': {k: None for k in ('migrated_from_schema_id', 'migrated_from_schema_version', 'migration_id', 'compatibility_event_type')}}


ENVELOPE = ('scope_kind', 'project_id', 'thread_id', 'run_id', 'node_id', 'attempt_id', 'actor_ref', 'requested_account_ref',
            'effective_account_ref', 'occurred_at_utc', 'correlation_id', 'causation_event_id', 'parent_event_id', 'producer_sequence_id',
            'payload_ref', 'redaction_profile', 'replay_policy', 'event_type', 'migration')


# ---------------------------------------------------------------- owner model (checker side)
def decide(ss, item):
    original = item['original']
    if original['event_type'] == SEG:
        return 'skip:metadata_source'
    if original['replay_policy'] == 'projector_replay_only':
        return 'skip:projector_replay_only'
    if item['provenance'] != 'native':
        return 'skip:' + item['provenance']
    floor = ss['floor_sequence_id']
    if floor is not None and original['sequence_id'] <= floor:
        return 'skip:pre_floor'
    if not (item['frame_proved'] and item['watermark_synced']):
        return 'pending:source_unproved'
    if item['dedupe'] == 'same':
        return 'replayed'
    if item['dedupe'] == 'conflict':
        return 'refused:idempotency_conflict'
    if item['dedupe'] == 'unavailable':
        return 'refused:dedupe_unavailable'
    if item['sink'] != 'ok':
        return 'pending:metadata_failed'
    if item.get('crash_at'):
        return 'crashed:' + item['crash_at']
    return 'emitted'


def expected_trace(decision, item):
    if decision.startswith('skip:'):
        return ['verify_provenance', 'non_emitting_skip']
    if decision == 'pending:source_unproved':
        return ['prove_original_frame', 'pending']
    if decision in ('replayed', 'refused:idempotency_conflict', 'refused:dedupe_unavailable'):
        return STEPS[:3] + ['dedupe_lookup', {'replayed': 'return_original', 'refused:idempotency_conflict': 'refuse_conflict',
                                              'refused:dedupe_unavailable': 'refuse_unavailable'}[decision]]
    if decision == 'pending:metadata_failed':
        return STEPS[:4] + ['pending']
    if decision.startswith('crashed:'):
        return STEPS[:STEPS.index(item['crash_at']) + 1] + ['crash']
    return list(STEPS)


def expected_events(decision, item):
    if decision == 'emitted':
        return 1
    if decision.startswith('crashed:'):
        return 1 if STEPS.index(item['crash_at']) >= STEPS.index('append_metadata') else 0
    return 0


def expected_reader(ss):
    r = ss['reader']; results = []; complete = True
    for source in r['sources']:
        meta = source['metadata']; p = meta['payload']
        if meta['payload']['type'] == SEG:
            results.append([meta['event_id'], 'inspected_one_hop']); continue
        if source['original_status'] == 'removed_proven':
            results.append([meta['event_id'], 'source_removed'])
        elif source['original_status'] != 'present':
            results.append([meta['event_id'], 'source_unavailable']); complete = False
        else:
            orig = source['original']
            ok = (orig['event_id'] == p['event_ref'] and orig['sequence_id'] == p['seq'] and orig['event_type'] == p['type']
                  and meta['sequence_id'] > orig['sequence_id'] and orig['scope_kind'] == meta['scope_kind'] and orig['project_id'] == meta['project_id'])
            results.append([meta['event_id'], 'joined' if ok else 'source_unavailable'])
            complete = complete and ok
    token = dict(r['durable_token'], redb_snapshot_id=r['snapshot'])
    return {'stored_token': copy.deepcopy(r['durable_token']), 'disclosure': {'token': token, 'results': results,
                                                                              'coverage_complete': complete,
                                                                              'health': 'healthy' if complete else 'degraded'},
            'durable_effects': ['seglog_observability_reader_checkpoint'], 'dispatched': []}


def operands(case, put, common):
    ss = case.get('ss')
    if not isinstance(ss, dict) or not isinstance(ss.get('items'), list):
        put('ss_seg_obligation', ['boundary record missing'], [])
        return
    put = s.typed_put(put)
    times = [(('items', n, 'metadata_receipt'), it['metadata_receipt'].get('acknowledged_at_utc'))
             for n, it in enumerate(ss['items']) if isinstance(it.get('metadata_receipt'), dict)]
    time_errors = s.time_errors(times, w.EVENT_RECORD)
    put('ss_seg_time', time_errors)
    reader = ss.get('reader')
    schema = [e for e in sr.keyword_errors(READER_ROOT, reader['checkpoint'])] if isinstance(reader, dict) else []
    put('ss_seg_schema', schema)
    if time_errors:
        return
    items = ss['items']; decisions = [decide(ss, it) for it in items]
    put('ss_seg_obligation', [it.get('decision') for it in items], decisions)
    put('ss_seg_events', [len(it.get('appended', [])) for it in items], [expected_events(d, it) for d, it in zip(decisions, items)])
    put('ss_seg_order', [it.get('trace') for it in items], [expected_trace(d, it) for d, it in zip(decisions, items)])
    id_l = []; id_r = []; pay_l = []; pay_r = []; env_l = []; env_r = []
    for d, it in zip(decisions, items):
        meta = it.get('metadata')
        if not isinstance(meta, dict) or not (d == 'emitted' or d == 'replayed' or d.startswith('crashed:')):
            continue
        want = metadata_for(it['original'], it['append_result'])
        id_l.append([meta.get('event_id'), meta.get('idempotency_key')]); id_r.append([want['event_id'], want['idempotency_key']])
        pay_l.append(meta.get('payload')); pay_r.append(want['payload'])
        env_l.append([meta.get(k) for k in ENVELOPE] + [isinstance(meta.get('sequence_id'), int) and meta['sequence_id'] > it['original']['sequence_id']])
        env_r.append([want[k] for k in ENVELOPE] + [True])
    put('ss_seg_identity', id_l, id_r)
    put('ss_seg_payload', pay_l, pay_r)
    put('ss_seg_envelope', env_l, env_r)
    put('ss_seg_original', [[it.get('original_result_after'), it.get('original_receipt_after')] for it in items],
        [[it['append_result'], it['original_receipt']] for it in items])
    left = []; right = []
    for d, it in zip(decisions, items):
        if d in ('replayed', 'refused:idempotency_conflict', 'refused:dedupe_unavailable'):
            left.append(it.get('response'))
            right.append({'status': 'original_result', 'result': it['prior_metadata_result']} if d == 'replayed' else
                         {'status': 'refused', 'reason': d.split(':', 1)[1]})
    put('ss_seg_retry', left, right)
    if isinstance(reader, dict) and not schema:
        put('ss_seg_reader', {'stored_token': reader['checkpoint'].get('index_read_token'), 'disclosure': reader.get('disclosure'),
                              'durable_effects': reader.get('durable_effects'), 'dispatched': reader.get('dispatched')}, expected_reader(ss))


# ---------------------------------------------------------------- fixture constructor (never called by the checker)
def original_event(case, n, **changes):
    event = copy.deepcopy(w.build('storage.boot_recovery')['stored_event'])
    event.update(event_id='evt-original-' + str(n), sequence_id=20 + n, persisted_at_utc='2026-11-14T12:00:' + str(10 + n) + 'Z',
                 observed_at_utc='2026-11-14T12:00:' + str(10 + n) + 'Z', correlation_id='correlation-original-' + str(n))
    event.update(changes)
    return event


def item_spec(case, n, want, **changes):
    original = original_event(case, n, **changes.pop('original', {}))
    result = {'event_id': original['event_id'], 'sequence_id': original['sequence_id'], 'segment_ref': 'seg-000003-' + str(original['sequence_id']).zfill(20) + '.active',
              'byte_offset': 1024 * n}
    spec = {'want': want, 'original': original, 'append_result': result, 'original_receipt': s.receipt_for(original, offset=1024 * n),
            'provenance': 'native', 'frame_proved': True, 'watermark_synced': True, 'dedupe': 'absent', 'sink': 'ok'}
    spec.update(changes)
    return spec


def simulate(case, spec):
    item = copy.deepcopy(spec); want = item.pop('want')
    item['decision'] = want; item['appended'] = []
    item['original_result_after'] = copy.deepcopy(item['append_result']); item['original_receipt_after'] = copy.deepcopy(item['original_receipt'])
    meta = metadata_for(item['original'], item['append_result'])
    seq = item['original']['sequence_id'] + item.get('gap', 1) + 40
    meta.update(schema_id='pm.event.v0', schema_version='2.0.0', payload_schema_id=w.FAMILY[SEG]['payload_schema_id'], sequence_id=seq,
                observed_at_utc='2026-11-14T12:01:00Z', persisted_at_utc='2026-11-14T12:01:00Z')
    if want.startswith('skip:'):
        item['trace'] = ['verify_provenance', 'non_emitting_skip']
    elif want == 'pending:source_unproved':
        item['trace'] = ['prove_original_frame', 'pending']
    elif want in ('replayed', 'refused:idempotency_conflict', 'refused:dedupe_unavailable'):
        last = {'replayed': 'return_original', 'refused:idempotency_conflict': 'refuse_conflict', 'refused:dedupe_unavailable': 'refuse_unavailable'}[want]
        item['trace'] = STEPS[:3] + ['dedupe_lookup', last]
        prior = {'event_id': meta['event_id'], 'sequence_id': seq, 'segment_ref': 'seg-000003-' + str(seq).zfill(20) + '.active', 'byte_offset': 9000}
        item['prior_metadata_result'] = prior
        item['response'] = {'status': 'original_result', 'result': copy.deepcopy(prior)} if want == 'replayed' else {'status': 'refused', 'reason': want.split(':', 1)[1]}
        if want == 'replayed':
            item['metadata'] = meta
    elif want == 'pending:metadata_failed':
        item['trace'] = STEPS[:4] + ['pending']
    elif want.startswith('crashed:'):
        at = item['crash_at']; item['trace'] = STEPS[:STEPS.index(at) + 1] + ['crash']; item['metadata'] = meta
        if STEPS.index(at) >= STEPS.index('append_metadata'):
            item['appended'] = [copy.deepcopy(meta)]
    else:
        item['trace'] = list(STEPS); item['metadata'] = meta; item['appended'] = [copy.deepcopy(meta)]
        item['metadata_receipt'] = s.receipt_for(meta, offset=4096)
    return item


def reader_record(case, items):
    template = copy.deepcopy(next(x['value'] for x in FIXTURES['value_shape_cases'] if x['id'] == 'app_retained_reader_checkpoint'))
    durable = copy.deepcopy(template['index_read_token'])
    sources = []
    for it in items:
        if it.get('metadata') is None or not it.get('appended'):
            continue
        sources.append({'metadata': copy.deepcopy(it['appended'][0]), 'original_status': 'present', 'original': copy.deepcopy(it['original'])})
    return {'checkpoint': template, 'durable_token': durable, 'snapshot': 'synthetic-same-redb-snapshot:read-7', 'sources': sources}


def present_reader(case, statuses=None):
    r = case['ss']['reader']; results = []; complete = True
    for n, source in enumerate(r['sources']):
        status = (statuses or {}).get(n, 'joined')
        if source['metadata']['payload']['type'] == SEG:
            status = 'inspected_one_hop'
        results.append([source['metadata']['event_id'], status])
        complete = complete and status != 'source_unavailable'
    r['disclosure'] = {'token': dict(r['durable_token'], redb_snapshot_id=r['snapshot']), 'results': results, 'coverage_complete': complete,
                       'health': 'healthy' if complete else 'degraded'}
    r['durable_effects'] = ['seglog_observability_reader_checkpoint']; r['dispatched'] = []


def scenario(case, specs, floor=None):
    case['ss'] = {'family': SEG, 'floor_sequence_id': floor, 'items': []}
    for spec in specs:
        case['ss']['items'].append(simulate(case, spec(case) if callable(spec) else spec))
    case['ss']['reader'] = reader_record(case, case['ss']['items'])
    present_reader(case)
    return case


def augment(control):
    scenario(control, [lambda c: item_spec(c, 1, 'emitted'), lambda c: item_spec(c, 2, 'emitted', gap=3)], floor=10)


def cases():
    import pm_s3bo_cases as c
    controls = []; negatives = []
    main = s.control(SEG, 'main', w.build(SEG)); controls.append(main)
    I = lambda n, *path: ('ss', 'items', n) + path
    RD = ('ss', 'reader')
    m0 = main['value']['ss']['items'][0]['metadata']
    for row, path, replacement, label in [
            ('ss_seg_obligation', I(0, 'decision'), 'skip:pre_floor', 'native-skipped'),
            ('ss_seg_events', I(0, 'appended'), [m0, m0], 'two-metadata-appends'),
            ('ss_seg_order', I(0, 'trace'), STEPS[2:4] + STEPS[:2] + STEPS[4:], 'metadata-before-source-proof'),
            ('ss_seg_order', I(0, 'trace'), STEPS[:5] + ['commit_producer_checkpoint', 'advance_settlement_prefix'], 'checkpoint-before-prefix'),
            ('ss_seg_identity', I(0, 'metadata', 'event_id'), 'evt_seglog_appended_' + w.sha(b'other'), 'identity-other-digest'),
            ('ss_seg_identity', I(1, 'metadata', 'idempotency_key'), 'seglog.event_appended:' + w.sha((w.STORE + 'evt-original-2').encode()), 'key-not-jcs'),
            ('ss_seg_payload', I(0, 'metadata', 'payload', 'ts'), '2026-11-14T12:01:00Z', 'ts-is-metadata-time'),
            ('ss_seg_payload', I(0, 'metadata', 'payload', 'writer_id'), 'process-7', 'invented-writer-id'),
            ('ss_seg_payload', I(1, 'metadata', 'payload', 'segment_ref'), 'seg-today-locator', 'segment-ref-current-locator'),
            ('ss_seg_envelope', I(0, 'metadata', 'occurred_at_utc'), main['value']['ss']['items'][0]['original']['occurred_at_utc'].replace('12:00:00', '11:59:00'), 'occurred-at-original-occurrence'),
            ('ss_seg_envelope', I(0, 'metadata', 'thread_id'), 'thread-A', 'copied-thread-join'),
            ('ss_seg_envelope', I(0, 'metadata', 'actor_ref'), 'actor-A', 'user-actor'),
            ('ss_seg_envelope', I(1, 'metadata', 'sequence_id'), 20, 'metadata-before-original'),
            ('ss_seg_original', I(0, 'original_receipt_after', 'sequence_id'), 63, 'original-receipt-replaced'),
            ('ss_seg_reader', RD + ('disclosure', 'token', 'redb_snapshot_id'), 'synthetic-same-redb-snapshot:stored', 'disclosure-not-read-snapshot'),
            ('ss_seg_reader', RD + ('dispatched',), ['original_action_replay'], 'metadata-replays-original-action'),
            ('ss_seg_reader', RD + ('durable_effects',), ['seglog_observability_reader_checkpoint', 'event_record_index_checkpoint'], 'reader-writes-generic-checkpoint'),
            ('ss_seg_reader', RD + ('checkpoint', 'index_read_token', 'frontier_revision'), 1, 'stored-token-not-generic-token'),
            ('ss_seg_schema', RD + ('checkpoint', 'index_read_token', 'redb_snapshot_id'), 'synthetic-same-redb-snapshot:read-7', 'stored-snapshot-negative'),
            ('ss_seg_schema', RD + ('checkpoint', 'extra'), 'payload-copy', 'reader-extra-member'),
            ('ss_seg_time', I(0, 'metadata_receipt', 'acknowledged_at_utc'), '2026-02-30T00:00:00Z', 'metadata-receipt-impossible-day')]:
        negatives.append(c.mutate(main, row, path, replacement, label))
    # Non-emitting skips with their exact reasons (no recursion, replay-only, provenance, floor).
    for label, want, changes in [('metadata-source', 'skip:metadata_source', {'original': {'event_type': SEG}}),
                                 ('replay-only-original', 'skip:projector_replay_only', {'original': {'replay_policy': 'projector_replay_only'}}),
                                 ('pre-floor', 'skip:pre_floor', {'original': {'sequence_id': 9}}),
                                 ('compatibility-read', 'skip:compatibility', {'provenance': 'compatibility'}),
                                 ('import-inspection', 'skip:import', {'provenance': 'import'}),
                                 ('physical-relocation', 'skip:relocation', {'provenance': 'relocation'})]:
        value = scenario(w.build(SEG), [lambda c, ch=changes, wt=want: item_spec(c, 3, wt, **copy.deepcopy(ch))], floor=10)
        control = s.control(SEG, label, value); controls.append(control)
        negatives.append(c.mutate(control, 'ss_seg_obligation', I(0, 'decision'), 'emitted', label + '-emitted'))
        negatives.append(c.mutate(control, 'ss_seg_events', I(0, 'appended'), [metadata_for(value['ss']['items'][0]['original'], value['ss']['items'][0]['append_result'])], label + '-appends'))
    # Pending, replay and refusals.
    for label, want, changes in [('frame-unproved', 'pending:source_unproved', {'frame_proved': False}),
                                 ('watermark-unsynced', 'pending:source_unproved', {'watermark_synced': False}),
                                 ('metadata-failure', 'pending:metadata_failed', {'sink': 'fail'}),
                                 ('replay-same-digest', 'replayed', {'dedupe': 'same'}),
                                 ('conflicting-digest', 'refused:idempotency_conflict', {'dedupe': 'conflict'}),
                                 ('dedupe-unavailable', 'refused:dedupe_unavailable', {'dedupe': 'unavailable'})]:
        value = scenario(w.build(SEG), [lambda c, ch=changes, wt=want: item_spec(c, 4, wt, **copy.deepcopy(ch))], floor=10)
        control = s.control(SEG, label, value); controls.append(control)
        negatives.append(c.mutate(control, 'ss_seg_obligation', I(0, 'decision'), 'emitted', label + '-emitted'))
        if want == 'replayed':
            negatives.append(c.mutate(control, 'ss_seg_retry', I(0, 'response', 'result', 'sequence_id'), 99, 'replay-new-result'))
        elif want.startswith('refused:'):
            negatives.append(c.mutate(control, 'ss_seg_retry', I(0, 'response'), {'status': 'original_result', 'result': value['ss']['items'][0]['prior_metadata_result']}, label + '-accepted'))
        else:
            negatives.append(c.mutate(control, 'ss_seg_original', I(0, 'original_result_after', 'segment_ref'), 'metadata-segment', label + '-rewrites-original'))
    # Crash cuts: before and after the metadata append.
    for at in ('admit_metadata', 'metadata_receipt', 'advance_settlement_prefix'):
        value = scenario(w.build(SEG), [lambda c, a=at: item_spec(c, 5, 'crashed:' + a, crash_at=a)], floor=10)
        control = s.control(SEG, 'crash-after-' + at, value); controls.append(control)
        negatives.append(c.mutate(control, 'ss_seg_events', I(0, 'appended'), [] if STEPS.index(at) >= STEPS.index('append_metadata') else
                                  [value['ss']['items'][0]['metadata']], 'crash-' + at + '-append-count'))
    # Reader honesty: proven removal, unexplained absence, and a one-hop historical metadata-about-metadata record.
    value = scenario(w.build(SEG), [lambda c: item_spec(c, 1, 'emitted'), lambda c: item_spec(c, 2, 'emitted')], floor=10)
    value['ss']['reader']['sources'][0]['original_status'] = 'removed_proven'
    value['ss']['reader']['sources'][1]['original_status'] = 'missing_unexplained'
    present_reader(value, {0: 'source_removed', 1: 'source_unavailable'})
    control = s.control(SEG, 'reader-removed-and-unavailable', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_seg_reader', RD + ('disclosure', 'results', 1, 1), 'source_removed', 'unexplained-absence-as-removed'))
    negatives.append(c.mutate(control, 'ss_seg_reader', RD + ('disclosure', 'coverage_complete'), True, 'incomplete-claims-complete'))
    value = scenario(w.build(SEG), [lambda c: item_spec(c, 1, 'emitted')], floor=10)
    hop = copy.deepcopy(value['ss']['reader']['sources'][0]); hop['metadata']['payload']['type'] = SEG; hop['metadata']['event_id'] = 'evt_seglog_appended_' + 'b' * 64
    value['ss']['reader']['sources'].append(hop); present_reader(value)
    control = s.control(SEG, 'reader-one-hop', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_seg_reader', RD + ('disclosure', 'results', 1, 1), 'joined', 'follows-metadata-chain'))
    # Project-scope original: the metadata inherits the exact project scope.
    value = scenario(w.build(SEG), [lambda c: item_spec(c, 6, 'emitted', original={'scope_kind': 'project', 'project_id': w.PROJECT})], floor=10)
    control = s.control(SEG, 'project-original', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_seg_envelope', I(0, 'metadata', 'project_id'), None, 'project-scope-dropped'))
    # SP-270 closed value shapes through the common auxiliary schema boundary.
    schema = w.read_json(PLANS_SCHEMA); prior = None
    for item in FIXTURES['value_shape_cases']:
        value = w.build(SEG)
        value['auxiliary'] = {'schema': dict(schema, **{'$ref': '#/$defs/' + item['definition']}), 'value': copy.deepcopy(item['value'])}
        identifier = SEG + '/ss/value-shape/' + item['id']
        if item['valid']:
            prior = identifier; controls.append({'id': identifier, 'value': value, 'boundary': 'append'})
        else:
            negatives.append(dict(id=identifier, family=SEG, control=prior, target='auxiliary_schema', code=c.code('auxiliary_schema'),
                                  defect={'owner_fixture': item['id']}, value=value))
    return controls, negatives


def corpus_slots(control):
    ss = control['value'].get('ss') or {}
    for n, it in enumerate(ss.get('items', [])):
        if isinstance(it.get('metadata_receipt'), dict):
            yield {'paths': [('ss', 'items', n, 'metadata_receipt', 'acknowledged_at_utc')], 'kind': 'datetime', 'row': 'ss_seg_time',
                   'profile': w.EVENT_RECORD, 'type_rows': ['ss_seg_time']}


def evidence(out):
    """Authenticate the DL-076 refrozen SP-270 package (v5) and replay it on a scratch copy."""
    result = {'package': str(PACKAGE), 'pinned_manifest_sha256': PACKAGE_MANIFEST_SHA256, 'prior_manifest_sha256': PRIOR_MANIFEST_SHA256}
    manifest_path = PACKAGE / 'manifest.json'
    actual = hashlib.sha256(manifest_path.read_bytes()).hexdigest() if manifest_path.exists() else None
    result['manifest_sha256'] = actual
    if actual != PACKAGE_MANIFEST_SHA256:
        result.update(status='fail', error='v5 manifest missing or changed'); return result
    manifest = json.loads(manifest_path.read_text())
    bad = [f['path'] for f in manifest['files'] if hashlib.sha256((PACKAGE / f['path']).read_bytes()).hexdigest() != f['sha256']]
    plans_sha = hashlib.sha256((w.ROOT / PLANS_SCHEMA).read_bytes()).hexdigest()
    result.update(verified_files=len(manifest['files']) - len(bad), changed_files=bad,
                  plans_schema_matches_pin=plans_sha == manifest['results']['fidelity-v5.json']['plans_schema_sha256'])
    if manifest['prior_immutable_manifest']['sha256'] != PRIOR_MANIFEST_SHA256 or bad:
        result['status'] = 'fail'; return result
    replay = Path(out) / 'seglog-v5-replay'
    if replay.exists():
        shutil.rmtree(replay)
    shutil.copytree(PACKAGE.parent, replay, ignore=shutil.ignore_patterns('__pycache__'))
    runs = {}
    for script in ('check_v5_regressions.py', 'check_fidelity_v5.py'):
        run = subprocess.run([sys.executable, '-B', script], cwd=replay / 'v5', capture_output=True, text=True, timeout=1800)
        runs[script] = {'returncode': run.returncode, 'tail': (run.stdout + run.stderr)[-1200:]}
    regenerated = {f['path']: hashlib.sha256((replay / 'v5' / f['path']).read_bytes()).hexdigest() == f['sha256'] for f in manifest['files']}
    fidelity = json.loads((replay / 'v5' / 'fidelity-v5.json').read_text())
    joined = json.loads((replay / 'v5' / 'joined-fixtures.json').read_text())
    stored = [k for k, b in joined['positive'].items() if 'redb_snapshot_id' in b['reader']['index_read_token']]
    result.update(runs=runs, replay_byte_identical=all(regenerated.values()), replay_mismatches=[k for k, ok in regenerated.items() if not ok],
                  fidelity=fidelity, positives=len(joined['positive']), schema_valid_negatives=len(joined['negative']),
                  stored_snapshot_negatives=[n['id'] for n in joined['stored_snapshot_negative']], stored_tokens_with_snapshot_id=stored,
                  results={k: v.get('status') for k, v in manifest['results'].items()})
    shutil.rmtree(replay)
    ok = all(r['returncode'] == 0 for r in runs.values()) and result['replay_byte_identical'] and not stored \
        and fidelity.get('status') == 'PASS' and result['plans_schema_matches_pin']
    result['status'] = 'pass' if ok else 'fail'
    return result
