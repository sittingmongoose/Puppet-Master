"""C12-SL: storage.value_quarantine_changed complete quarantine boundary.

Owner clauses: Invalid-value quarantine (closed edges, resettable-only reset,
fail-closed authority state, unknown schema stays recovery_blocked, risk
classes, indefinite unresolved critical items and cap pressure, protected raw
export, DL-068 disposal and record retirement), SP-2201 (producer order
(1)-(5), identity with occurrence and re-detection, replay, custody and
redaction, backup/restore, consumer, withdrawal, numbers/times), SP-2211
(E8-5 B, already executed by the common quarantine_delete rows), the
storage_quarantine_record registry schema and the K37 quarantine oracles.

The boundary record (`case['sl']`) holds the quarantined value's independently
held facts and every run: detection, re-detection and re-occurrence, securing,
each class/evidence resolution branch, purge and record retirement, audit,
cap pressure, disclosure and export, backup restore, crash cuts with
resumption, withdrawal and replay variants. Expected outcomes are derived here
from those inputs by the owner rules.

Obligation (SP-2201, C12-SL2): the record CAS stores the frozen EventRecord's
producer fields in the record's `event_obligation` member; the barrier append
adds the Storage-assigned sequence_id, observed_at_utc and persisted_at_utc.
Native execution remains NOT_RUN.
"""
import copy

import pm_s3bo_oracles as w
import pm_s3bo_sl_common as s

LANE = 'sl'
QTN = 'storage.value_quarantine_changed'
FAMILIES = (QTN,)
RESOLVED = ('migrated', 'rebuilt', 'reset_to_default', 'restored')
GRAPH = [('detected', 'secured')] + [('secured', x) for x in RESOLVED + ('recovery_blocked',)] + [(x, 'purged') for x in RESOLVED]
CLASS_STATES = {'Q-CRITICAL': ('migrated', 'restored', 'recovery_blocked'),
                'Q-RESETTABLE': ('migrated', 'reset_to_default', 'restored', 'recovery_blocked'),
                'Q-DERIVED': ('migrated', 'rebuilt', 'restored', 'recovery_blocked'),
                'Q-MIRROR': ('migrated', 'rebuilt', 'restored', 'recovery_blocked')}
EVIDENCE = {'migrated': 'upgrader', 'rebuilt': 'rebuild_source', 'reset_to_default': 'owner_default', 'restored': 'recovery_source'}
LIVE = {'migrated': ['live_key_migrate'], 'rebuilt': ['live_key_rebuild'], 'reset_to_default': ['live_key_reset'],
        'restored': ['live_key_restore'], 'purged': ['dl068_raw_disposal']}
CUSTODY = ['raw_bin_write', 'custody_manifest_write', 'fsync_file_and_parent']
STEP = ['admission', 'record_cas_and_obligation', 'barrier_append', 'first_receipt']
POLICIES = {p['policy_id']: p for p in w.read_json('Plans/storage_value_registry.json')['retention_policies']}
RECORD_SCHEMA = next(r['value_schema'] for r in w.read_json('Plans/storage_value_registry.json')['families']
                     if r['family_id'] == 'storage_quarantine_record')
PAYLOAD_SCHEMA = w.schema_for(QTN)
DETECTED_AT = '2026-11-14T12:00:00Z'
RESOLVED_AT = '2026-11-14T12:30:00Z'
SOURCE_UNAVAILABLE = 'Source evidence unavailable'

ROWS = [
    ('sl_qtn_detect', 'sl_quarantine', 'equal', 'Detection mints the qtn_ identity with occurrence one plus the matching purged records; a re-detection of an open record resolves to it and mints nothing.'),
    ('sl_qtn_decision', 'sl_quarantine', 'equal', 'Each transition is admitted or refused at the first failing stage: closed edge and risk-class state, durable record state, synchronized raw custody, the outcome evidence, the Q policy cleanup clock, holds, then dependencies.'),
    ('sl_qtn_zero', 'sl_quarantine', 'equal', 'A refused transition appends nothing and leaves the record, the live key and the raw custody unchanged.'),
    ('sl_qtn_record', 'sl_quarantine', 'equal', 'An admitted transition CASes the record state and appends its transition receipt continuing from detected, with the resolution output bound to the resolved bytes, and stores the frozen obligation in event_obligation: owner identity, payload and envelope, and the producer fields the append sends.'),
    ('sl_qtn_order', 'sl_quarantine', 'equal', 'Raw bytes and the manifest are synchronized before the record CAS; CAS, barrier append and first receipt precede the live-key effect or disposal.'),
    ('sl_qtn_effects', 'sl_quarantine', 'equal', 'The live-key effect is exactly that of the resolution; purged disposes the raw content once; securing and recovery_blocked touch nothing.'),
    ('sl_qtn_payload', 'sl_quarantine', 'equal', 'The payload carries the record identity, source ref, schemas, raw custody hash and ref, risk class, state and transition receipt.'),
    ('sl_qtn_identity', 'sl_quarantine', 'equal', 'Each event id and key follows the SP-2201 recipe over quarantine_id and the state.'),
    ('sl_qtn_envelope', 'sl_quarantine', 'equal', 'The envelope names a thread only when the quarantined value belongs to it; Project id null exactly when the payload omits it.'),
    ('sl_qtn_retire', 'sl_quarantine', 'equal', 'Operational records retire only after the purge, its event and first receipt settle and every dependency is released; the audit shows the purge with Source evidence unavailable and opens nothing.'),
    ('sl_qtn_cap', 'sl_quarantine', 'equal', 'Cap pressure never evicts an unresolved item, and for Q-CRITICAL blocks new mutation-capable writes.'),
    ('sl_qtn_disclosure', 'sl_quarantine', 'equal', 'A viewer without read access to the source sees only that a value was quarantined; raw bytes leave only through permitted protected explicit export.'),
    ('sl_qtn_restore', 'sl_quarantine', 'equal', 'Restore brings back the raw custody with the record or reports it unavailable, and never re-runs a live-key effect.'),
    ('sl_qtn_resume', 'sl_quarantine', 'equal', 'A crash resumes the obligation stored in the record or resolves the original receipt; it never re-copies raw bytes over another capture, repeats a live-key effect, purges twice or appends twice.'),
    ('sl_qtn_withdrawal', 'sl_quarantine', 'equal', 'Withdrawal resolves or fences pending obligations, keeps record, raw custody and receipts and never releases, resets or purges a value.'),
    ('sl_qtn_replay', 'sl_quarantine', 'equal', 'Same identity and digest returns the original result; a different digest conflicts; unavailable dedupe and projector_replay_only refuse with zero effects.'),
    ('sl_qtn_numbers', 'sl_quarantine', 'error', 'The byte length and the occurrence use shared current_integer with minimum 0 and 1.'),
    ('sl_qtn_time', 'sl_quarantine', 'error', 'Detection time uses Storage UTC-Z; transition times use the EventRecord profile.'),
]


# ---------------------------------------------------------------- owner rules

def qid(value, occurrence):
    return 'qtn_' + w.sha(w.lp('storage.value_quarantine/detect/v1', w.STORE.encode().hex(), value['source_family_id'],
                               value['source_locator_ref'], value['raw_sha256'], str(occurrence)))


def ids(value, quarantine_id, state):
    scope = value['scope_partition']
    component = QTN + ':' + quarantine_id + ':' + state
    key = ('application@1:' if scope == 'app' else 'storage-quarantine@1:') + w.SERVER.encode().hex() + ':' + component.encode().hex()
    return 'er_qtn_' + w.sha(w.lp('storage.value_quarantine_changed/event/v1', w.STORE.encode().hex(), scope, component)), key


def matching(value, records):
    return [r for r in records if (r['source_family_id'], r['source_locator_ref'], r['raw_sha256'])
            == (value['source_family_id'], value['source_locator_ref'], value['raw_sha256'])]


def detection(value, run):
    """SP-2201 identity: an open matching record absorbs the re-detection; otherwise mint occurrence purged + 1."""
    same = matching(value, run['facts']['existing'])
    open_ = [r for r in same if r['state'] != 'purged']
    if open_:
        return {'resolution': 'existing', 'quarantine_id': open_[0]['quarantine_id'], 'occurrence': open_[0]['occurrence'], 'events': 0}
    occurrence = sum(r['state'] == 'purged' for r in same) + 1
    return {'resolution': 'minted', 'quarantine_id': qid(value, occurrence), 'occurrence': occurrence, 'events': 1}


def cleanup_permitted(value, f):
    policy = POLICIES[value['risk_class']]
    return (s.utc(f['now_utc']) - s.utc(f['resolved_at_utc'])).total_seconds() >= policy['ttl_seconds']


def lawful_paths(value, f):
    """Class-permitted resolutions whose owner evidence is present (unknown schema has no upgrader path)."""
    out = []
    for state in RESOLVED:
        if state not in CLASS_STATES[value['risk_class']] or not f.get(EVIDENCE[state]):
            continue
        if state == 'migrated' and not f.get('schema_known'):
            continue
        out.append(state)
    return out


def stage(value, run, record):
    f = run['facts']; to = run['to']; before = record['state']
    if (before, to) not in GRAPH or (to != 'purged' and to not in CLASS_STATES[value['risk_class']] and to != 'secured') \
            or f.get('payload_secret'):
        return 'schema'
    if run['seen'] != before:
        return 'record'
    if to == 'secured' and not (f['raw_written'] and f['manifest_written'] and f['fsynced']):
        return 'custody'
    if to in RESOLVED and to not in lawful_paths(value, f):
        return 'evidence'
    if to == 'recovery_blocked' and lawful_paths(value, f):
        return 'evidence'
    if to == 'purged':
        if not f['resolution_receipt']:
            return 'custody'
        if not cleanup_permitted(value, f):
            return 'policy'
        if f['holds']:
            return 'holds'
        if f['dependencies']:
            return 'dependencies'
    return None


def expected_receipt(value, record, run, event_id):
    to = run['to']
    f = run['facts']
    output = value['raw_sha256'] if to in ('secured', 'recovery_blocked') else (
        w.sha(bytes.fromhex(f['resolved_value_hex'])) if to in RESOLVED else f['purge_output_sha256'])
    return {'receipt_ref': f['receipt_ref'], 'from_state': record['state'], 'to_state': to,
            'actor_ref': 'storage.value_quarantine.coordinator.v1', 'reason': f['reason'],
            'input_sha256': value['raw_sha256'], 'output_sha256': output, 'event_refs': [event_id],
            'occurred_at_utc': run['facts'].get('occurred_at_utc', RESOLVED_AT)}


def expected_record(value, record, run, event_id):
    after = copy.deepcopy(record)
    after['state'] = run['to']
    after['transition_receipts'] = list(after['transition_receipts']) + [expected_receipt(value, record, run, event_id)]
    after['related_event_refs'] = list(after['related_event_refs']) + [event_id]
    return after


def new_record(value, quarantine_id, event_id):
    return {'schema_id': 'pm.storage_value.storage_quarantine_record.v1', 'schema_version': '1.0.0', 'storage_instance_id': w.STORE,
            'quarantine_id': quarantine_id, 'source_family_id': value['source_family_id'], 'source_locator_ref': value['source_locator_ref'],
            'expected_schema_id': value['expected_schema_id'], 'expected_schema_version': '1.0.0',
            'observed_schema_id': value['observed_schema_id'], 'observed_schema_version': '0.9.0', 'error_code': 'schema_mismatch',
            'raw_sha256': value['raw_sha256'], 'raw_custody_ref': value['raw_custody_ref'], 'custody_manifest_ref': 'manifest-A',
            'custody_manifest_sha256': 'b' * 64, 'byte_length': value['byte_length'], 'detected_at_utc': value['detected_at_utc'],
            'risk_class': value['risk_class'], 'state': 'detected', 'retention_policy_ref': value['risk_class'],
            'transition_receipts': [], 'related_event_refs': [event_id], 'redaction_profile': 'redacted_refs_only'}


def expected_payload(value, quarantine_id, state, f):
    p = {'schema_version': '1.0.0', 'quarantine_id': quarantine_id, 'source_ref': value['source_locator_ref'],
         'expected_schema_id': value['expected_schema_id'], 'observed_schema_id': value['observed_schema_id'],
         'raw_bytes_hash': value['raw_sha256'], 'raw_bytes_ref': value['raw_custody_ref'], 'risk_class': value['risk_class'],
         'state': state, 'actor_ref': 'storage.value_quarantine.coordinator.v1', 'reason': f['reason'], 'receipt_ref': f['receipt_ref']}
    if value['project_id'] is not None:
        p['project_id'] = value['project_id']
    return p


def expected_trace(to):
    return (['admission'] + CUSTODY if to in ('detected', 'secured') else ['admission']) + STEP[1:] + LIVE.get(to, []) + ['result']


def envelope_of(value):
    return (value['scope_kind'], value['project_id'], value['thread_id'], None, None, 'dedupe_by_idempotency_key', QTN)


# ---------------------------------------------------------------- operands

def operands(case, put, common):
    runs = s.runs_of(case, QTN)
    if runs is None:
        put('sl_qtn_detect', ['boundary record missing'], [])
        return
    value = case['sl']['value']
    numbers = s.number_errors([('byte_length', value.get('byte_length'), 0, None)]
                              + [('run%d/byte_length' % i, (r.get('record_after') or {}).get('byte_length'), 0, None)
                                 for i, r in enumerate(runs) if isinstance(r.get('record_after'), dict)], required=True) + s.number_errors([('run%d/occurrence' % i, x.get('occurrence'), 1, None) for i, r in enumerate(runs)
                                 if r['kind'] == 'detect' for x in r['facts']['existing']])
    times = s.date_errors([('detected_at', value.get('detected_at_utc'), w.STORAGE_UTC_Z)]
                          + [('run%d/detected_at' % i, (r.get('record_after') or {}).get('detected_at_utc'), w.STORAGE_UTC_Z)
                             for i, r in enumerate(runs) if isinstance(r.get('record_after'), dict)]
                          + [('run%d/transition' % i, r['facts'].get('occurred_at_utc'), w.EVENT_RECORD)
                             for i, r in enumerate(runs) if r['kind'] == 'transition']
                          + [('run%d/receipt%d' % (i, j), x.get('occurred_at_utc'), w.EVENT_RECORD) for i, r in enumerate(runs)
                             if isinstance(r.get('record_after'), dict) for j, x in enumerate(r['record_after'].get('transition_receipts') or [])])
    put('sl_qtn_numbers', numbers); put('sl_qtn_time', times)
    ok = not numbers and not times
    if not ok:
        return  # every other row of this family is inapplicable until the shared number/time rows pass
    rows = {k: ([], []) for k in ('detect', 'decision', 'zero', 'record', 'order', 'effects', 'payload', 'identity', 'envelope',
                                  'retire', 'cap', 'disclosure', 'restore', 'resume', 'withdrawal', 'replay')}
    def add(row, i, left, right):
        rows[row][0].append((i,) + tuple(left)); rows[row][1].append((i,) + tuple(right))
    states = {}
    for i, r in enumerate(runs):
        k = r['kind']
        if k == 'detect':
            want = detection(value, r)
            add('detect', i, (r.get('resolution'), r.get('quarantine_id'), r.get('occurrence'), len(r.get('events_appended') or [])),
                (want['resolution'], want['quarantine_id'], want['occurrence'], want['events']))
            if want['resolution'] == 'minted':
                eid, key = ids(value, want['quarantine_id'], 'detected')
                add('order', i, (r.get('trace'),), (expected_trace('detected'),))
                events = r.get('events_appended') or []
                rest, ob = s.record_split(r.get('record_after'))
                add('record', i, (rest, s.obligation_owner(ob), s.obligation_rest(ob)),
                    (s.record_split(new_record(value, want['quarantine_id'], eid))[0],
                     (eid, key, s.cj(expected_payload(value, want['quarantine_id'], 'detected', r['facts'])), envelope_of(value)),
                     s.obligation_rest(s.producer_part(events[0]) if events else None)))
                add('payload', i, ([s.cj(e.get('payload')) for e in events],),
                    ([s.cj(expected_payload(value, want['quarantine_id'], 'detected', r['facts']))] * max(1, len(events)),))
                add('identity', i, ([(e.get('event_id'), e.get('idempotency_key')) for e in events],), ([(eid, key)] * len(events),))
                add('envelope', i, ([(e.get('scope_kind'), e.get('project_id'), e.get('thread_id'), e.get('run_id'), e.get('attempt_id'),
                                      e.get('replay_policy'), e.get('event_type')) for e in events],), ([envelope_of(value)] * len(events),))
                add('effects', i, (r.get('live_key_effects'),), ([],))
            else:
                add('zero', i, (s.cj(r.get('record_after')), r.get('live_key_effects')), (s.cj(r['facts'].get('open_record')), []))
            for e in r.get('events_appended') or []:
                states.setdefault((e.get('payload') or {}).get('quarantine_id'), []).append((e.get('payload') or {}).get('state'))
        elif k == 'transition':
            before = r['record_before']; want = stage(value, r, before) if ok else None
            add('decision', i, (r.get('decision'), r.get('stage')), ('refused' if want else 'appended', want))
            if want:
                add('zero', i, (len(r.get('events_appended') or []), s.cj(r.get('record_after')), r.get('live_key_effects'), r.get('raw_after')),
                    (0, s.cj(before), [], r['facts']['raw_before']))
                continue
            eid, key = ids(value, before['quarantine_id'], r['to'])
            events = r.get('events_appended') or []
            rest, ob = s.record_split(r.get('record_after'))
            add('record', i, (rest, s.obligation_owner(ob), s.obligation_rest(ob)),
                (s.record_split(expected_record(value, before, r, eid))[0],
                 (eid, key, s.cj(expected_payload(value, before['quarantine_id'], r['to'], r['facts'])), envelope_of(value)),
                 s.obligation_rest(s.producer_part(events[0]) if events else None)))
            add('order', i, (r.get('trace'),), (expected_trace(r['to']),))
            raw_after = {} if r['to'] == 'purged' else r['facts']['raw_before']
            add('effects', i, (r.get('live_key_effects'), r.get('raw_after')), (LIVE.get(r['to'], []), raw_after))
            add('payload', i, (len(events), [s.cj(e.get('payload')) for e in events]),
                (1, [s.cj(expected_payload(value, before['quarantine_id'], r['to'], r['facts']))]))
            add('identity', i, ([(e.get('event_id'), e.get('idempotency_key')) for e in events],), ([(eid, key)] * len(events),))
            add('envelope', i, ([(e.get('scope_kind'), e.get('project_id'), e.get('thread_id'), e.get('run_id'), e.get('attempt_id'),
                                  e.get('replay_policy'), e.get('event_type')) for e in events],), ([envelope_of(value)] * len(events),))
            for e in events:
                states.setdefault((e.get('payload') or {}).get('quarantine_id'), []).append((e.get('payload') or {}).get('state'))
        elif k == 'retire':
            f = r['facts']; go = f['purge_event_settled'] and f['purge_receipt_settled'] and not f['dependencies']
            add('retire', i, (r.get('retired'), r.get('kept')), (go, [] if go else ['custody_manifest', 'operation_journal', 'quarantine_index']))
        elif k == 'audit':
            f = r['facts']
            add('retire', i, (r.get('result'), r.get('effects')),
                ({'purge_event': f['purge_event_id'], 'first_receipt': f['purge_receipt_ref'], 'source': SOURCE_UNAVAILABLE,
                  'raw_opened': False, 'new_audit_record': False}, []))
        elif k == 'cap':
            f = r['facts']; policy = POLICIES[f['risk_class']]
            unresolved = [x['quarantine_id'] for x in f['records'] if x['state'] not in RESOLVED]
            over = len(f['records']) >= f['cap']
            add('cap', i, ([x for x in (r.get('evicted') or []) if x in unresolved], r.get('new_writes')),
                ([], 'blocked' if over and policy['overflow_action'] == 'fail_closed' else 'allowed'))
            if policy['overflow_action'] == 'fail_closed':
                add('cap', i, (r.get('evicted'),), ([],))
        elif k == 'disclose':
            f = r['facts']; full = f['source_readable'] and f['scope_ok'] and f['access_rechecked']
            add('disclosure', i, (r.get('disclosed'),), (value['metadata'] if full else {'quarantined': True},))
        elif k == 'export':
            f = r['facts']; raw = f['surface'] == 'protected_explicit' and f['permission']
            add('disclosure', i, (r.get('raw_included'),), (raw,))
        elif k == 'restore':
            f = r['facts']
            add('restore', i, (r.get('record_restored'), r.get('raw'), r.get('live_key_effects')),
                (True, 'restored' if f['backup_has_raw'] else 'unavailable', []))
        elif k == 'resume':
            crash = runs[r['of']]; at = crash['crash_at']; to = crash['to']
            durable = STEP.index(at) >= STEP.index('barrier_append')
            appended = (crash.get('events_appended') or []) + (r.get('events_appended') or [])
            stored = s.record_split(crash.get('record_after'))[1]
            add('resume', i, (r.get('trace'), len(appended), [s.physical_hex(s.producer_part(e)) for e in appended],
                              (crash.get('live_key_effects') or []) + (r.get('live_key_effects') or []), r.get('raw_custody_sha256')),
                (['resume_obligation'] + (['resolve_original_receipt'] if durable else ['barrier_append', 'first_receipt']) + LIVE.get(to, []) + ['result'],
                 1, [s.physical_hex(stored)], LIVE.get(to, []), value['raw_sha256']))
        elif k == 'withdraw':
            f = r['facts']
            add('withdrawal', i, (r.get('trace'), r.get('obligations'), r.get('kept'), r.get('state_changes'), r.get('reader')),
                (['writer_cutoff', 'drain_obligations', 'fence_reader'],
                 [[o['event_id'], 'resolve_original_receipt' if o['commit_frame_durable'] else 'fence'] for o in f['obligations']],
                 ['record', 'raw_custody', 'receipts'], [], 'fenced_tokens_invalidated'))
        elif k == 'replay':
            original = runs[r['of']]; cand = r.get('candidate') or {}
            if cand.get('replay_policy') == 'projector_replay_only':
                want = ({'kind': 'refused', 'reason_code': 'replay_only_not_appendable'}, ['reject_replay_only'])
            elif not r['facts']['dedupe_available']:
                want = ({'kind': 'refused', 'reason_code': 'dedupe_unavailable'}, ['dedupe_lookup', 'refuse'])
            elif s.cj(w.semantic(cand)) == s.cj(w.semantic((original.get('events_appended') or [{}])[0])):
                want = (original.get('result'), ['dedupe_lookup', 'return_original'])
            else:
                want = ({'kind': 'refused', 'reason_code': 'idempotency_conflict'}, ['dedupe_lookup', 'refuse'])
            add('replay', i, (s.cj(r.get('result')), r.get('trace'), len(r.get('events_appended') or []), r.get('live_key_effects')),
                (s.cj(want[0]), want[1], 0, []))
    for name, (left, right) in rows.items():
        put('sl_qtn_' + name, left, right, ok)


# ---------------------------------------------------------------- fixture constructor

def value_of(case, risk_class, thread):
    src = case['source']; project = src['project_id']
    meta = {'quarantine_id': None, 'state': None, 'source_family_id': src['source_family_id'], 'risk_class': risk_class,
            'error_code': 'schema_mismatch'}
    return {'source_family_id': src['source_family_id'], 'source_locator_ref': src['source_locator_ref'], 'raw_sha256': src['raw_sha256'],
            'risk_class': risk_class, 'project_id': project, 'thread_id': 'thread-A' if thread else None,
            'scope_partition': w.partition(project), 'scope_kind': 'project' if project else 'application',
            'expected_schema_id': 'pm.storage_value.example.v1', 'observed_schema_id': 'pm.storage_value.example.v0',
            'raw_custody_ref': 'quarantine/raw/locator-A/raw.bin', 'byte_length': 3, 'detected_at_utc': DETECTED_AT, 'metadata': meta}


def facts(**change):
    value = {'raw_written': True, 'manifest_written': True, 'fsynced': True, 'schema_known': True, 'upgrader': False,
             'rebuild_source': False, 'owner_default': False, 'recovery_source': False, 'resolution_receipt': True,
             'resolved_at_utc': RESOLVED_AT, 'now_utc': '2027-12-01T00:00:00Z', 'holds': [], 'dependencies': [],
             'raw_before': {'raw:locator-A': '726177'}, 'resolved_value_hex': b'corrected'.hex(),
             'purge_output_sha256': w.sha(b''), 'occurred_at_utc': RESOLVED_AT}
    value.update(change)
    return value


def simulate(case, run, record):
    """Owner-conforming presented outcome of one run (fixture constructor, never called by the checker)."""
    value = case['sl']['value']; base = case['stored_event']; k = run['kind']
    run.setdefault('events_appended', []); run.setdefault('live_key_effects', [])
    def make_event(quarantine_id, state, n):
        eid, key = ids(value, quarantine_id, state)
        env = dict(scope_kind=value['scope_kind'], project_id=value['project_id'], thread_id=value['thread_id'],
                   run_id=None, attempt_id=None, sequence_id=60 + n)
        return s.event(base, expected_payload(value, quarantine_id, state, run['facts']), eid, key, **env)
    count = sum(len(r.get('events_appended') or []) for r in case['sl']['runs'])
    if k == 'detect':
        d = detection(value, run)
        run.update(resolution=d['resolution'], quarantine_id=d['quarantine_id'], occurrence=d['occurrence'])
        if d['resolution'] == 'existing':
            run['facts']['open_record'] = copy.deepcopy(record)
            run['record_after'] = copy.deepcopy(record)
            return record
        e = make_event(d['quarantine_id'], 'detected', count)
        created = new_record(value, d['quarantine_id'], e['event_id']); created[s.OBLIGATION] = s.producer_part(copy.deepcopy(e))
        run.update(events_appended=[e], trace=expected_trace('detected'), record_after=created,
                   result={'kind': 'quarantined', 'event_id': e['event_id']})
        return run['record_after']
    if k in ('transition', 'crash'):
        run['record_before'] = copy.deepcopy(record); run['seen'] = run.get('seen', record['state'])
        why = stage(value, run, record)
        if why:
            run.update(decision='refused', stage=why, record_after=copy.deepcopy(record), trace=['admission', 'refuse'],
                       raw_after=copy.deepcopy(run['facts']['raw_before']))
            return record
        e = make_event(record['quarantine_id'], run['to'], count)
        after = expected_record(value, record, run, e['event_id'])
        after[s.OBLIGATION] = s.producer_part(copy.deepcopy(e))
        if k == 'crash':
            n = STEP.index(run['crash_at'])
            run.update(trace=['admission'] + STEP[1:n + 1] + ['crash'], record_after=after)
            if n >= STEP.index('barrier_append'):
                run['events_appended'] = [copy.deepcopy(e)]
            return after
        run.update(decision='appended', stage=None, record_after=after, trace=expected_trace(run['to']), events_appended=[e],
                   live_key_effects=list(LIVE.get(run['to'], [])),
                   raw_after={} if run['to'] == 'purged' else copy.deepcopy(run['facts']['raw_before']),
                   result={'kind': 'transition_recorded', 'event_id': e['event_id']})
        return after
    if k == 'resume':
        crash = case['sl']['runs'][run['of']]; durable = STEP.index(crash['crash_at']) >= STEP.index('barrier_append')
        run.update(trace=['resume_obligation'] + (['resolve_original_receipt'] if durable else ['barrier_append', 'first_receipt'])
                   + LIVE.get(crash['to'], []) + ['result'],
                   events_appended=[] if durable else [dict(copy.deepcopy(crash['record_after'][s.OBLIGATION]),
                                                            sequence_id=base['sequence_id'],
                                                            observed_at_utc=base['observed_at_utc'],
                                                            persisted_at_utc=base['persisted_at_utc'])],
                   live_key_effects=list(LIVE.get(crash['to'], [])), raw_custody_sha256=value['raw_sha256'])
        return record
    if k == 'retire':
        f = run['facts']; go = f['purge_event_settled'] and f['purge_receipt_settled'] and not f['dependencies']
        run.update(retired=go, kept=[] if go else ['custody_manifest', 'operation_journal', 'quarantine_index'])
        return record
    if k == 'audit':
        f = run['facts']
        run.update(result={'purge_event': f['purge_event_id'], 'first_receipt': f['purge_receipt_ref'], 'source': SOURCE_UNAVAILABLE,
                           'raw_opened': False, 'new_audit_record': False}, effects=[])
        return record
    if k == 'cap':
        f = run['facts']; policy = POLICIES[f['risk_class']]; over = len(f['records']) >= f['cap']
        resolved = [x['quarantine_id'] for x in f['records'] if x['state'] in RESOLVED]
        run.update(evicted=[] if policy['overflow_action'] == 'fail_closed' else (resolved[:1] if over else []),
                   new_writes='blocked' if over and policy['overflow_action'] == 'fail_closed' else 'allowed')
        return record
    if k == 'disclose':
        f = run['facts']
        run['disclosed'] = copy.deepcopy(value['metadata']) if f['source_readable'] and f['scope_ok'] and f['access_rechecked'] else {'quarantined': True}
        return record
    if k == 'export':
        run['raw_included'] = run['facts']['surface'] == 'protected_explicit' and run['facts']['permission']
        return record
    if k == 'restore':
        run.update(record_restored=True, raw='restored' if run['facts']['backup_has_raw'] else 'unavailable')
        return record
    if k == 'withdraw':
        run.update(trace=['writer_cutoff', 'drain_obligations', 'fence_reader'], kept=['record', 'raw_custody', 'receipts'], state_changes=[],
                   obligations=[[o['event_id'], 'resolve_original_receipt' if o['commit_frame_durable'] else 'fence'] for o in run['facts']['obligations']],
                   reader='fenced_tokens_invalidated')
        return record
    if k == 'replay':
        original = case['sl']['runs'][run['of']]; cand = run['candidate']
        if cand.get('replay_policy') == 'projector_replay_only':
            run.update(result={'kind': 'refused', 'reason_code': 'replay_only_not_appendable'}, trace=['reject_replay_only'])
        elif not run['facts']['dedupe_available']:
            run.update(result={'kind': 'refused', 'reason_code': 'dedupe_unavailable'}, trace=['dedupe_lookup', 'refuse'])
        elif w.semantic(cand) == w.semantic(original['events_appended'][0]):
            run.update(result=copy.deepcopy(original['result']), trace=['dedupe_lookup', 'return_original'])
        else:
            run.update(result={'kind': 'refused', 'reason_code': 'idempotency_conflict'}, trace=['dedupe_lookup', 'refuse'])
        return record
    raise ValueError(k)


def scenario(case, risk_class, specs, thread=False):
    case['sl'] = {'family': QTN, 'value': value_of(case, risk_class, thread), 'runs': []}
    record = None
    for spec in specs:
        run = copy.deepcopy(spec); run.setdefault('facts', facts())
        if run.pop('existing_from_record', False):
            run['facts']['existing'] = [dict(quarantine_id=record['quarantine_id'], state=record['state'], occurrence=1,
                                             **{k: record[k] for k in ('source_family_id', 'source_locator_ref', 'raw_sha256')})]
        case['sl']['runs'].append(run)
        record = simulate(case, run, record)
    return case


def D(existing=()):
    return {'kind': 'detect', 'facts': {'existing': list(existing), 'receipt_ref': 'qtn-receipt:detected', 'reason': 'schema_mismatch'}}


def T(to, **change):
    change.setdefault('receipt_ref', 'qtn-receipt:' + to); change.setdefault('reason', 'owner ' + to)
    return {'kind': 'transition', 'to': to, 'facts': facts(**change)}


def P(to):
    """A lawful prior step to `to`, with only that outcome's evidence."""
    return T(to, **({EVIDENCE[to]: True} if to in EVIDENCE else {}))


def augment(control):
    """The common control carries one detected, secured and migrated value with its tail runs."""
    scenario(control, 'Q-CRITICAL', [D(), T('secured'), T('migrated', upgrader=True)])
    tail(control)


def tail(case):
    runs = case['sl']['runs']
    first = next(i for i, r in enumerate(runs) if r.get('events_appended'))
    event = runs[first]['events_appended'][0]
    changed = copy.deepcopy(event); changed['payload']['reason'] = 'other reason'
    specs = [{'label': 'disclose-full', 'kind': 'disclose', 'facts': {'source_readable': True, 'scope_ok': True, 'access_rechecked': True}},
             {'label': 'disclose-no-source', 'kind': 'disclose', 'facts': {'source_readable': False, 'scope_ok': True, 'access_rechecked': True}},
             {'label': 'disclose-stale-access', 'kind': 'disclose', 'facts': {'source_readable': True, 'scope_ok': True, 'access_rechecked': False}},
             {'label': 'export-protected', 'kind': 'export', 'facts': {'surface': 'protected_explicit', 'permission': True}},
             {'label': 'export-routine', 'kind': 'export', 'facts': {'surface': 'routine', 'permission': True}},
             {'label': 'export-unpermitted', 'kind': 'export', 'facts': {'surface': 'protected_explicit', 'permission': False}},
             {'label': 'restore', 'kind': 'restore', 'facts': {'backup_has_raw': True}},
             {'label': 'restore-missing-raw', 'kind': 'restore', 'facts': {'backup_has_raw': False}},
             {'label': 'withdraw', 'kind': 'withdraw', 'facts': {'obligations': [{'event_id': 'pending-durable', 'commit_frame_durable': True},
                                                                                {'event_id': 'pending-open', 'commit_frame_durable': False}]}},
             {'label': 'replay', 'kind': 'replay', 'of': first, 'candidate': copy.deepcopy(event), 'facts': {'dedupe_available': True}},
             {'label': 'replay-moved', 'kind': 'replay', 'of': first, 'candidate': dict(copy.deepcopy(event), sequence_id=99,
                                                                                         persisted_at_utc='2026-11-14T13:00:00Z'), 'facts': {'dedupe_available': True}},
             {'label': 'conflict', 'kind': 'replay', 'of': first, 'candidate': changed, 'facts': {'dedupe_available': True}},
             {'label': 'dedupe-unavailable', 'kind': 'replay', 'of': first, 'candidate': copy.deepcopy(event), 'facts': {'dedupe_available': False}},
             {'label': 'replay-only', 'kind': 'replay', 'of': first, 'candidate': dict(copy.deepcopy(event), replay_policy='projector_replay_only'),
              'facts': {'dedupe_available': True}}]
    record = [r for r in runs if isinstance(r.get('record_after'), dict)][-1]['record_after']
    for spec in specs:
        run = copy.deepcopy(spec); runs.append(run); record = simulate(case, run, record)
    return case


def label_index(value, label):
    return next(i for i, r in enumerate(value['sl']['runs']) if r.get('label') == label)


def cap_records(n, resolved):
    return [{'quarantine_id': 'qtn_cap_%d' % i, 'state': 'migrated' if i < resolved else 'secured'} for i in range(n)]


def cases():
    import pm_s3bo_cases as c
    controls = []; negatives = []
    R = lambda i, *path: ('sl', 'runs', i) + path

    def build(label, project, risk, specs, thread=False, with_tail=False):
        value = w.build(QTN, project); scenario(value, risk, specs, thread)
        if with_tail:
            tail(value)
        control = s.control(QTN, label, value); controls.append(control)
        return control, value

    # Resettable value in a thread of a Project: detect, secure, reset, purge, retire, audit and the tail.
    life, lv = build('resettable-lifecycle', w.PROJECT, 'Q-RESETTABLE',
                     [D(), T('secured'), dict(D(), label='redetect', existing_from_record=True), T('reset_to_default', owner_default=True), T('purged'),
                      {'label': 'retire-blocked', 'kind': 'retire', 'facts': {'purge_event_settled': True, 'purge_receipt_settled': True, 'dependencies': ['backup:B1']}},
                      {'label': 'retire', 'kind': 'retire', 'facts': {'purge_event_settled': True, 'purge_receipt_settled': True, 'dependencies': []}},
                      {'label': 'retire-unsettled', 'kind': 'retire', 'facts': {'purge_event_settled': True, 'purge_receipt_settled': False, 'dependencies': []}},
                      {'label': 'audit', 'kind': 'audit', 'facts': {'purge_event_id': 'er_qtn_purge', 'purge_receipt_ref': 'receipt:purge'}}],
                     thread=True, with_tail=True)
    runs = lv['sl']['runs']; A = lambda label: label_index(lv, label); value = lv['sl']['value']
    qid1 = runs[0]['quarantine_id']
    for row, path, replacement, label in [
            ('sl_qtn_detect', R(0, 'occurrence'), 2, 'forged-occurrence'),
            ('sl_qtn_detect', R(0, 'quarantine_id'), qid(value, 2), 'second-identity'),
            ('sl_qtn_detect', R(A('redetect'), 'resolution'), 'minted', 'redetect-mints'),
            ('sl_qtn_detect', R(A('redetect'), 'events_appended'), [runs[0]['events_appended'][0]], 'redetect-appends'),
            ('sl_qtn_zero', R(A('redetect'), 'live_key_effects'), ['live_key_reset'], 'redetect-mutates-live-key'),
            ('sl_qtn_decision', R(3, 'decision'), 'refused', 'reset-refused'),
            ('sl_qtn_record', R(1, 'record_after', 'state'), 'detected', 'state-not-cased'),
            ('sl_qtn_record', R(3, 'record_after', 'transition_receipts', 1, 'output_sha256'), value['raw_sha256'], 'output-not-resolved-bytes'),
            ('sl_qtn_record', R(3, 'record_after', 'transition_receipts', 1, 'from_state'), 'detected', 'receipt-discontinuity'),
            ('sl_qtn_record', R(0, 'record_after', 'risk_class'), 'Q-MIRROR', 'record-other-class'),
            ('sl_qtn_order', R(0, 'trace'), ['admission', 'record_cas_and_obligation'] + CUSTODY + STEP[2:] + ['result'], 'cas-before-raw-custody'),
            ('sl_qtn_order', R(1, 'trace'), ['admission', 'raw_bin_write', 'fsync_file_and_parent', 'custody_manifest_write'] + STEP[1:] + ['result'], 'fsync-before-manifest'),
            ('sl_qtn_order', R(3, 'trace'), ['admission', 'record_cas_and_obligation', 'live_key_reset', 'barrier_append', 'first_receipt', 'result'], 'live-key-before-receipt'),
            ('sl_qtn_order', R(4, 'trace'), ['admission', 'record_cas_and_obligation', 'dl068_raw_disposal', 'barrier_append', 'first_receipt', 'result'], 'dispose-before-receipt'),
            ('sl_qtn_effects', R(1, 'live_key_effects'), ['live_key_reset'], 'secure-mutates-live-key'),
            ('sl_qtn_effects', R(3, 'live_key_effects'), ['live_key_migrate'], 'other-live-effect'),
            ('sl_qtn_effects', R(4, 'raw_after'), {'raw:locator-A': '726177'}, 'purge-keeps-raw'),
            ('sl_qtn_effects', R(0, 'live_key_effects'), ['live_key_reset'], 'detect-mutates-live-key'),
            ('sl_qtn_payload', R(3, 'events_appended', 0, 'payload', 'raw_bytes_hash'), 'c' * 64, 'payload-other-raw-hash'),
            ('sl_qtn_payload', R(3, 'events_appended', 0, 'payload', 'risk_class'), 'Q-DERIVED', 'payload-other-class'),
            ('sl_qtn_payload', R(1, 'events_appended', 0, 'payload', 'raw_bytes_ref'), 'routine-export/locator-A', 'payload-raw-ref-substituted'),
            ('sl_qtn_payload', R(4, 'events_appended'), [runs[4]['events_appended'][0]] * 2, 'duplicate-append'),
            ('sl_qtn_identity', R(3, 'events_appended', 0, 'event_id'), ids(value, qid1, 'secured')[0], 'state-reuses-identity'),
            ('sl_qtn_envelope', R(3, 'events_appended', 0, 'thread_id'), None, 'thread-value-null-thread'),
            ('sl_qtn_envelope', R(1, 'events_appended', 0, 'project_id'), None, 'project-value-null-project'),
            ('sl_qtn_retire', R(A('retire-blocked'), 'retired'), True, 'retire-despite-backup'),
            ('sl_qtn_retire', R(A('retire-unsettled'), 'kept'), [], 'retire-before-receipt'),
            ('sl_qtn_retire', R(A('retire'), 'retired'), False, 'records-kept-forever'),
            ('sl_qtn_retire', R(A('audit'), 'result', 'source'), 'restored', 'audit-reconstructs-source'),
            ('sl_qtn_retire', R(A('audit'), 'result', 'raw_opened'), True, 'audit-opens-bytes'),
            ('sl_qtn_retire', R(A('audit'), 'result', 'new_audit_record'), True, 'audit-creates-record'),
            ('sl_qtn_disclosure', R(A('disclose-no-source'), 'disclosed'), copy.deepcopy(value['metadata']), 'unreadable-source-disclosed'),
            ('sl_qtn_disclosure', R(A('disclose-stale-access'), 'disclosed'), copy.deepcopy(value['metadata']), 'access-not-rechecked'),
            ('sl_qtn_disclosure', R(A('disclose-full'), 'disclosed'), {'quarantined': True}, 'reader-over-redacts'),
            ('sl_qtn_disclosure', R(A('export-routine'), 'raw_included'), True, 'routine-export-raw'),
            ('sl_qtn_disclosure', R(A('export-unpermitted'), 'raw_included'), True, 'unpermitted-export'),
            ('sl_qtn_restore', R(A('restore-missing-raw'), 'raw'), 'restored', 'missing-raw-claimed'),
            ('sl_qtn_restore', R(A('restore'), 'live_key_effects'), ['live_key_reset'], 'restore-reruns-live-key'),
            ('sl_qtn_withdrawal', R(A('withdraw'), 'state_changes'), ['released'], 'withdrawal-releases'),
            ('sl_qtn_withdrawal', R(A('withdraw'), 'kept'), ['record', 'receipts'], 'withdrawal-drops-raw'),
            ('sl_qtn_withdrawal', R(A('withdraw'), 'obligations', 0, 1), 'fence', 'durable-obligation-fenced'),
            ('sl_qtn_withdrawal', R(A('withdraw'), 'reader'), 'active', 'reader-not-fenced'),
            ('sl_qtn_replay', R(A('replay'), 'live_key_effects'), ['live_key_reset'], 'replay-repeats-live-key'),
            ('sl_qtn_replay', R(A('replay-moved'), 'result'), {'kind': 'refused', 'reason_code': 'idempotency_conflict'}, 'storage-fields-conflict'),
            ('sl_qtn_replay', R(A('conflict'), 'result'), runs[0]['result'], 'changed-digest-replays'),
            ('sl_qtn_replay', R(A('dedupe-unavailable'), 'events_appended'), [runs[0]['events_appended'][0]], 'dedupe-unavailable-appends'),
            ('sl_qtn_replay', R(A('replay-only'), 'trace'), ['dedupe_lookup', 'reject_replay_only'], 'replay-only-after-lookup'),
            ('sl_qtn_record', R(0, 'record_after', s.OBLIGATION, 'event_id'), ids(value, qid1, 'secured')[0], 'detect-obligation-other-identity'),
            ('sl_qtn_record', R(3, 'record_after', s.OBLIGATION, 'payload', 'state'), 'secured', 'obligation-other-state'),
            ('sl_qtn_record', R(1, 'record_after', s.OBLIGATION, 'occurred_at_utc'), '2026-11-14T12:45:00Z', 'obligation-not-the-appended-event'),
            ('sl_qtn_record', R(4, 'record_after', s.OBLIGATION), None, 'obligation-not-stored')]:
        negatives.append(c.mutate(life, row, path, replacement, label))
    # Numbers and times at every copy.
    def copies(label, row, change, defect):
        changed = copy.deepcopy(lv); change(changed); negatives.append(c.negative(life, row, label, changed, defect))
    def length(v, x):
        v['sl']['value']['byte_length'] = x
        for r in v['sl']['runs']:
            if isinstance(r.get('record_after'), dict):
                r['record_after']['byte_length'] = x
            for key in ('open_record',):
                if isinstance(r['facts'].get(key), dict):
                    r['facts'][key]['byte_length'] = x
            if isinstance(r.get('record_before'), dict):
                r['record_before']['byte_length'] = x
    def detected(v, x):
        v['sl']['value']['detected_at_utc'] = x
        for r in v['sl']['runs']:
            for key in ('record_after', 'record_before'):
                if isinstance(r.get(key), dict):
                    r[key]['detected_at_utc'] = x
            if isinstance(r['facts'].get('open_record'), dict):
                r['facts']['open_record']['detected_at_utc'] = x
    copies('byte-length-negative', 'sl_qtn_numbers', lambda v: length(v, -1), {'copies': 'value and records', 'value': -1})
    copies('byte-length-boolean', 'sl_qtn_numbers', lambda v: length(v, True), {'copies': 'value and records', 'value': True})
    copies('detected-offset', 'sl_qtn_time', lambda v: detected(v, '2026-11-14T12:00:00+00:00'), {'copies': 'value and records', 'profile': 'storage_utc_z'})
    copies('detected-impossible', 'sl_qtn_time', lambda v: detected(v, '2026-02-30T12:00:00Z'), {'copies': 'value and records'})
    # Re-occurrence after purge takes occurrence two; a forged occurrence-one record is refused.
    purged = {'quarantine_id': 'qtn_old', 'state': 'purged', 'occurrence': 1}
    reoccur, rv = build('reoccurrence', None, 'Q-DERIVED',
                        [D([dict(purged, source_family_id='stored-family', source_locator_ref='locator-A', raw_sha256=w.sha(b'raw'))]),
                         T('secured'), T('rebuilt', rebuild_source=True)])
    negatives.append(c.mutate(reoccur, 'sl_qtn_detect', R(0, 'occurrence'), 1, 'reoccurrence-reuses-occurrence'))
    negatives.append(c.mutate(reoccur, 'sl_qtn_numbers', R(0, 'facts', 'existing', 0, 'occurrence'), 0, 'purged-occurrence-zero'))
    # Resolution branches by class and evidence, with every refusal stage.
    for label, risk, path, spec, want in [
            ('critical-migrate', 'Q-CRITICAL', ['secured'], T('migrated', upgrader=True), None),
            ('critical-restore', 'Q-CRITICAL', ['secured'], T('restored', recovery_source=True), None),
            ('critical-blocked', 'Q-CRITICAL', ['secured'], T('recovery_blocked'), None),
            ('mirror-rebuild', 'Q-MIRROR', ['secured'], T('rebuilt', rebuild_source=True), None),
            ('derived-migrate', 'Q-DERIVED', ['secured'], T('migrated', upgrader=True), None),
            ('critical-reset', 'Q-CRITICAL', ['secured'], T('reset_to_default', owner_default=True), 'schema'),
            ('critical-rebuild', 'Q-CRITICAL', ['secured'], T('rebuilt', rebuild_source=True), 'schema'),
            ('derived-reset', 'Q-DERIVED', ['secured'], T('reset_to_default', owner_default=True), 'schema'),
            ('resettable-rebuild', 'Q-RESETTABLE', ['secured'], T('rebuilt', rebuild_source=True), 'schema'),
            ('detected-resolution', 'Q-RESETTABLE', [], T('reset_to_default', owner_default=True), 'schema'),
            ('blocked-to-purged', 'Q-CRITICAL', ['secured', 'recovery_blocked'], T('purged'), 'schema'),
            ('purged-outgoing', 'Q-RESETTABLE', ['secured', 'reset_to_default', 'purged'], T('secured'), 'schema'),
            ('stale-view', 'Q-RESETTABLE', ['secured'], dict(T('reset_to_default', owner_default=True), seen='detected'), 'record'),
            ('unsynced-raw', 'Q-CRITICAL', [], T('secured', fsynced=False), 'custody'),
            ('secret-in-payload', 'Q-CRITICAL', [], T('secured', payload_secret=True), 'schema'),
            ('no-manifest', 'Q-CRITICAL', [], T('secured', manifest_written=False), 'custody'),
            ('unknown-schema-migrate', 'Q-CRITICAL', ['secured'], T('migrated', upgrader=True, schema_known=False), 'evidence'),
            ('migrate-without-upgrader', 'Q-CRITICAL', ['secured'], T('migrated'), 'evidence'),
            ('default-unknown-content', 'Q-RESETTABLE', ['secured'], T('reset_to_default'), 'evidence'),
            ('blocked-despite-path', 'Q-CRITICAL', ['secured'], T('recovery_blocked', recovery_source=True), 'evidence'),
            ('unknown-schema-blocked', 'Q-CRITICAL', ['secured'], T('recovery_blocked', upgrader=True, schema_known=False), None),
            ('purge-unreceipted', 'Q-RESETTABLE', ['secured', 'reset_to_default'], T('purged', resolution_receipt=False), 'custody'),
            ('purge-before-ttl', 'Q-RESETTABLE', ['secured', 'reset_to_default'], T('purged', now_utc='2026-12-14T12:29:59Z'), 'policy'),
            ('purge-at-ttl', 'Q-RESETTABLE', ['secured', 'reset_to_default'], T('purged', now_utc='2026-12-14T12:30:00Z'), None),
            ('purge-held', 'Q-CRITICAL', ['secured', 'migrated'], T('purged', holds=['hold-A']), 'holds'),
            ('purge-dependency', 'Q-CRITICAL', ['secured', 'migrated'], T('purged', dependencies=['live-ref:A']), 'dependencies')]:
        prior = [D()] + [P(x) for x in path]
        control, value_ = build('branch-' + label, None, risk, prior + [spec])
        i = len(prior)
        if want is None:
            negatives.append(c.mutate(control, 'sl_qtn_decision', R(i, 'decision'), 'refused', 'lawful-refused'))
        else:
            negatives.append(c.mutate(control, 'sl_qtn_decision', R(i, 'stage'), 'record' if want != 'record' else 'custody', 'other-stage'))
            negatives.append(c.mutate(control, 'sl_qtn_zero', R(i, 'live_key_effects'), LIVE.get(spec['to'], ['live_key_reset']), 'refusal-effect'))
            negatives.append(c.mutate(control, 'sl_qtn_zero', R(i, 'raw_after'), {}, 'refusal-purges'))
    # Cap pressure.
    cap, cv = build('cap-pressure', None, 'Q-CRITICAL',
                    [D(), {'label': 'cap-critical', 'kind': 'cap', 'facts': {'risk_class': 'Q-CRITICAL', 'cap': 3, 'records': cap_records(3, 1)}},
                     {'label': 'cap-mirror', 'kind': 'cap', 'facts': {'risk_class': 'Q-MIRROR', 'cap': 3, 'records': cap_records(3, 1)}},
                     {'label': 'cap-under', 'kind': 'cap', 'facts': {'risk_class': 'Q-CRITICAL', 'cap': 4, 'records': cap_records(3, 1)}}])
    A2 = lambda label: label_index(cv, label)
    negatives.append(c.mutate(cap, 'sl_qtn_cap', R(A2('cap-critical'), 'new_writes'), 'allowed', 'critical-cap-allows-writes'))
    negatives.append(c.mutate(cap, 'sl_qtn_cap', R(A2('cap-critical'), 'evicted'), ['qtn_cap_0'], 'critical-cap-evicts'))
    negatives.append(c.mutate(cap, 'sl_qtn_cap', R(A2('cap-mirror'), 'evicted'), ['qtn_cap_2'], 'unresolved-evicted'))
    negatives.append(c.mutate(cap, 'sl_qtn_cap', R(A2('cap-under'), 'new_writes'), 'blocked', 'blocked-under-cap'))
    # Crash cuts for securing and for a migration.
    for to, prior in (('secured', [D()]), ('migrated', [D(), T('secured')])):
        for at in STEP[1:]:
            specs = prior + [dict(T(to, upgrader=True), kind='crash', crash_at=at), {'kind': 'resume', 'of': len(prior), 'facts': {}}]
            control, value_ = build('crash-' + to + '-' + at, None, 'Q-CRITICAL', specs)
            i = len(prior) + 1; crashed = value_['sl']['runs'][i - 1]
            sent = (crashed['events_appended'] or value_['sl']['runs'][i]['events_appended'])[0]
            negatives.append(c.mutate(control, 'sl_qtn_resume', R(i, 'events_appended'), [copy.deepcopy(sent)] * (2 if at == 'record_cas_and_obligation' else 1), 'resume-second-append'))
            negatives.append(c.mutate(control, 'sl_qtn_resume', R(i, 'raw_custody_sha256'), w.sha(b'other capture'), 'resume-recopies-raw'))
            negatives.append(c.mutate(control, 'sl_qtn_resume', R(i, 'trace'), ['admission'] + value_['sl']['runs'][i]['trace'], 'resume-reruns-admission'))
            if to == 'migrated':
                negatives.append(c.mutate(control, 'sl_qtn_resume', R(i, 'live_key_effects'), LIVE[to] * 2, 'resume-repeats-live-key'))
    return controls, negatives


def corpus_slots(control):
    """The byte length and the detection time at every copy, and each transition time with its receipt copy."""
    value = control['value']; runs = s.runs_of(value, QTN)
    if not runs:
        return
    def record_paths(key):
        out = [('sl', 'value', key)]
        for i, r in enumerate(runs):
            for name in ('record_after', 'record_before'):
                if isinstance(r.get(name), dict):
                    out.append(('sl', 'runs', i, name, key))
            if isinstance(r['facts'].get('open_record'), dict):
                out.append(('sl', 'runs', i, 'facts', 'open_record', key))
        return out
    yield {'paths': record_paths('byte_length'), 'kind': 'integer', 'row': 'sl_qtn_numbers', 'bounds': {'minimum': 0},
           'downstream': False, 'container_row': 'sl_qtn_numbers'}
    yield {'paths': record_paths('detected_at_utc'), 'kind': 'datetime', 'row': 'sl_qtn_time', 'profile': w.STORAGE_UTC_Z,
           'type_rows': ['sl_qtn_time']}


def evidence(out):
    """Constructor self-check: every presented control payload and quarantine record keeps its complete schema."""
    import pm_s3bo_cases as c
    controls, _ = c.cases(); checked = 0; bad = []
    for control in controls:
        runs = s.runs_of(control['value'], QTN)
        if runs is None:
            continue
        for i, r in enumerate(runs):
            for e in r.get('events_appended') or []:
                checked += 1
                if s.keyword_errors(PAYLOAD_SCHEMA, e['payload']):
                    bad.append((control['id'], i, 'payload'))
            if isinstance(r.get('record_after'), dict):
                checked += 1
                if s.keyword_errors(RECORD_SCHEMA, r['record_after']):
                    bad.append((control['id'], i, 'record', s.keyword_errors(RECORD_SCHEMA, r['record_after'])[:3]))
    return {'status': 'pass' if checked and not bad else 'fail', 'family': QTN, 'checked': checked, 'schema_failures': bad,
            'meaning': 'Every presented control payload and quarantine record keeps the complete registered schema; the equality rows compare exact owner-derived values.'}
