"""C12-SS: storage.boot_recovery complete issuance, earliest-floor, post-restore and cardinality boundary.

Owner clauses (SP-291, SP-292, SP-2205, DL-083 count buckets): complete discovery
by all six source owners, every member with a nonempty result union; W and S
over the sorted unique work set and episode (RFC 8785 string trees, unsigned
numbers as decimal strings); event_id, idempotency_key, recovery_set_id and the
publish actor; no-work settles no_obligation with no event; a same episode
replays its original result, a later exact-W episode issues once with repeat_of
the earliest matching original event by original sequence; each issuance
advances a complete floor exactly once (revision, count, predecessor hash,
issued transition, Boot receipt-set hash) and publishes the anchor as the same
bytes, an unavailable floor only by revision; a restore whose image floor equals
the anchor keeps earliest completeness, an older or anchor-less restore leaves
the unavailable continuity_unavailable floor with the anchor never rolled back;
after a verified restore a Boot issuance first-mints only through SP-286 fresh
admission (new epoch, accepted after the session opened, new-epoch set id), a
restored pending intent never first-mints and a surviving exact receipt is
replayed; resolve_earliest answers the minimum original sequence, or unavailable;
the passive history reader stores no checkpoint and returns unavailable rather
than an empty history; and the app:storage_operational bucket (2,000,000,
fail-closed, compacting only expired unheld members, never another bucket).
Native execution remains NOT_RUN.
"""
import copy
import hashlib

import pm_s3bo_oracles as w
import pm_s3bo_sr_common as sr
import pm_s3bo_ss_common as s

LANE = 'ss'
BOOT = 'storage.boot_recovery'
FAMILIES = (BOOT,)
FIXTURES = w.read_json('Plans/storage_boot_custody_fixtures.json')
FLOOR_ROOT = w.read_json('Plans/storage_boot_history_floor.schema.json')
KINDS = ('migration', 'backup_restore', 'rotation_truncation', 'compaction', 'deletion_quarantine', 'root_relocation')
CAP = 2000000
BUCKETS = {('storage.boot_recovery', 'application'): 'app:storage_operational',
           ('storage.recovery_applied', 'application'): 'app:storage_operational',
           ('storage.compaction_lifecycle_changed', 'application'): 'app:storage_operational',
           ('platform.capability_evaluated', 'application'): 'app:platform_capability'}
SET_DOMAIN = b'pm.storage.boot_history.receipts.v1\x00'
ACTOR = 'storage.boot_recovery.publish.v1:' + w.STORE

ROWS = [
    ('ss_boot_outcome', 'ss_boot', 'equal', 'Each episode issues, replays, settles no_obligation or refuses exactly as SP-291, SP-292 and SP-2205 decide.'),
    ('ss_boot_events', 'ss_boot', 'equal', 'An issued episode appends exactly one Boot event; replay, no-work, refusal and restored pending intents append none.'),
    ('ss_boot_workset', 'ss_boot', 'equal', 'The payload work set is the sorted unique union of the captured members, and the epoch, manifest and segment are the episode values.'),
    ('ss_boot_identity', 'ss_boot', 'equal', 'W, S, event_id, idempotency_key, recovery_set_id and the publish actor follow SP-291 exactly.'),
    ('ss_boot_repeat', 'ss_boot', 'equal', 'repeat_of names the earliest matching original event by original sequence, and is absent for the first episode.'),
    ('ss_boot_floor', 'ss_boot', 'equal', 'Every floor transition is exact: one issuance step for a complete floor, revision only for an unavailable one, continuity after restore.'),
    ('ss_boot_anchor', 'ss_boot', 'equal', 'The external anchor equals the published complete floor, consumes its pending replacement and never rolls back.'),
    ('ss_boot_earliest', 'ss_boot', 'equal', 'resolve_earliest returns the minimum original sequence row for W with its original receipt, or unavailable.'),
    ('ss_boot_bucket', 'ss_boot_custody', 'equal', 'Application Boot records count in app:storage_operational: 2,000,000, fail-closed, compacting only expired unheld members.'),
    ('ss_boot_reader', 'ss_boot_custody', 'equal', 'The passive history reader stores no checkpoint and returns unavailable, not an empty history, when coverage does not verify.'),
    ('ss_boot_schema', 'ss_boot_custody', 'error', 'Every floor, pending and anchor value keeps every keyword of the closed SP-292 floor schema.'),
    ('ss_boot_time', 'ss_boot_custody', 'error', 'Boot first-receipt acknowledgements use the EventRecord date_time profile (E5-2).'),
]


def fixture(case_id):
    return copy.deepcopy(next(x['value'] for x in FIXTURES['value_shape_cases'] if x['id'] == case_id))


def mp_sha(value):
    return hashlib.sha256(w.storage_value_bytes(value, profile=w.EVENT_VALUE)).hexdigest()


def byte_sorted(items):
    return sorted(set(items), key=lambda x: x.encode())


def work_set(members):
    return (byte_sorted([i for m in members for i in m['integrity_ids']]), byte_sorted([i for m in members for i in m['recovery_ids']]),
            byte_sorted([m['kind'] for m in members]))


def digests(members, epoch, manifest_generation, segment):
    integrity, recovery, kinds = work_set(members)
    W = s.jcs_sha({'domain': 'pm.storage.boot_work_set.v1', 'storage_instance_id': w.STORE, 'integrity_ids': integrity,
                   'recovery_ids': recovery, 'interrupted_transaction_kinds': kinds})
    S = s.jcs_sha({'domain': 'pm.storage.boot_episode.v1', 'work_set_digest': W, 'recovery_epoch': str(epoch),
                   'manifest_generation': str(manifest_generation), 'active_segment_ref': segment})
    return W, S


def custody_key(event_id):
    return 'event_append_receipt_custody.v1:' + w.STORE + ':' + w.sha(event_id.encode())


def custody_value(event, receipt):
    return {'receipt': copy.deepcopy(receipt), 'original_segment_ref': 'segment:original-' + str(receipt['sequence_id']),
            'original_event_value_commitment': w.full_value_commitment(event)}


def receipt_set_sha(rows):
    """SP-292: Boot rows by original sequence, MP array of [receipt_key, sha256(custody value)]."""
    ordered = sorted(rows.items(), key=lambda kv: kv[1]['receipt']['sequence_id'])
    return hashlib.sha256(SET_DOMAIN + w.storage_value_bytes([[k, mp_sha(v)] for k, v in ordered], profile=w.EVENT_VALUE)).hexdigest()


def issued_floor(floor, rows, key):
    if floor['state'] != 'complete':
        return dict(copy.deepcopy(floor), revision=floor['revision'] + 1)
    after = copy.deepcopy(floor)
    after.update(revision=floor['revision'] + 1, boot_receipt_count=floor['boot_receipt_count'] + 1, previous_floor_sha256=mp_sha(floor),
                 boot_receipt_set_sha256=receipt_set_sha(rows),
                 last_transition={'kind': 'issued', 'receipt_key': key, 'receipt_custody_sha256': mp_sha(rows[key])})
    return after


def unavailable(revision):
    return {'schema_id': 'pm.storage.boot_history_floor.v1', 'schema_version': '1.0.0', 'storage_instance_id': w.STORE,
            'revision': revision, 'redaction_profile': 'no_secrets', 'state': 'unavailable', 'reason': 'continuity_unavailable'}


def intent_for(case, episode, rows, earliest_ok=True):
    """The frozen producer intent of an episode (fixture constructor and owner model share only the recipes)."""
    W, S = digests(episode['members'], episode['epoch'], episode['manifest_generation'], episode['segment'])
    integrity, recovery, kinds = work_set(episode['members'])
    event = copy.deepcopy(case['stored_event'])
    event.update(event_id='boot-recovery:v1:' + W + ':' + str(episode['epoch']) + ':' + S,
                 idempotency_key='boot-recovery:v1:' + W + ':' + str(episode['epoch']), actor_ref=ACTOR,
                 occurred_at_utc=episode['time'], correlation_id=episode['occurrence'], scope_kind='application', project_id=None,
                 causation_event_id=None, parent_event_id=None, producer_sequence_id=None)
    payload = {'schema_version': '2.0.0', 'recovery_set_id': 'pm.storage.recovery_set.v1:' + S, 'integrity_ids': integrity,
               'recovery_ids': recovery, 'interrupted_transaction_kinds': kinds, 'manifest_generation': episode['manifest_generation'],
               'recovery_epoch': episode['epoch'], 'active_segment_ref': episode['segment']}
    # The earliest matching original is known only while earliest completeness holds (SP-292, SP-2205).
    earlier = [v for k, v in rows.items() if v['event']['event_id'].startswith('boot-recovery:v1:' + W + ':')]
    if earlier and earliest_ok:
        payload['repeat_of'] = min(earlier, key=lambda v: v['receipt']['sequence_id'])['event']['event_id']
    event['payload'] = payload
    return event


# ---------------------------------------------------------------- owner model (checker side)
def admission(step, floor_state, rows):
    """SP-291/SP-292/SP-2205 decision for one issuance step over independent inputs."""
    e = step['episode']
    if not all(e['discovery'].get(k) == 'complete' for k in KINDS) or e.get('foreign_occurrence'):
        return 'refused_incomplete'
    if any(not (m['integrity_ids'] or m['recovery_ids']) for m in e['members']):
        return 'refused_incomplete'
    if not e['members']:
        return 'no_obligation'
    W, S = digests(e['members'], e['epoch'], e['manifest_generation'], e['segment'])
    event_id = 'boot-recovery:v1:' + W + ':' + str(e['epoch']) + ':' + S
    if custody_key(event_id) in rows:
        return 'replayed'
    restore = e.get('restore')
    if restore is not None:
        if restore['intent_epoch'] != restore['current_epoch'] or not (restore['accepted_at'] > restore['session_opened']) \
                or e['epoch'] != restore['current_epoch']:
            return 'refused_restored_pending'
    bucket = BUCKETS[(BOOT, 'application')]
    state = step['bucket_before'][bucket]
    if state['count'] >= CAP and state['expired_unheld'] == 0:
        return 'refused_capacity'
    return 'issued'


def bucket_after(before, bucket, admitted):
    after = copy.deepcopy(before)
    if not admitted:
        return after
    if after[bucket]['count'] < CAP:
        after[bucket]['count'] += 1
    else:
        after[bucket]['expired_unheld'] -= 1  # compact one expired unheld member; the new record takes its place
    return after


def model(case):
    """Expected state after every step, from the initial state and step inputs only."""
    bs = case['ss']; floor = copy.deepcopy(bs['initial']['floor']); anchor = copy.deepcopy(bs['initial']['anchor'])
    rows = copy.deepcopy(bs['initial']['rows']); out = []
    for step in bs['steps']:
        kind = step['kind']; exp = {'kind': kind}
        if kind == 'issue':
            decision = admission(step, floor, rows); exp['outcome'] = decision
            exp['events'] = 1 if decision == 'issued' else 0
            ok = floor['state'] == 'complete' and anchor == floor
            event = intent_for(case, step['episode'], rows, ok) if decision in ('issued', 'replayed') else None
            exp['bucket_after'] = bucket_after(step['bucket_before'], BUCKETS[(BOOT, 'application')], decision == 'issued')
            if decision == 'issued':
                event = dict(event, sequence_id=step['assigned_sequence'], observed_at_utc=step['episode']['time'],
                             persisted_at_utc=step['episode']['time'])
                receipt = s.receipt_for(event, offset=step['assigned_sequence'] * 2048, time=step['episode']['time'])
                key = custody_key(event['event_id'])
                rows[key] = dict(custody_value(event, receipt), event=event)
                floor = issued_floor(floor, {k: {x: y for x, y in v.items() if x != 'event'} for k, v in rows.items()}, key)
                if floor['state'] == 'complete':
                    anchor = copy.deepcopy(floor)
            if event is not None:
                exp['event'] = event if decision == 'issued' else rows[custody_key(event['event_id'])]['event']
        elif kind == 'restore':
            image = step['image']
            rows = copy.deepcopy(image['rows'])
            if anchor is not None and image['floor'] == anchor and image['floor']['state'] == 'complete':
                floor = copy.deepcopy(image['floor'])
            else:
                floor = unavailable(image['floor']['revision'])
        elif kind == 'earliest':
            matching = [v for v in rows.values() if v['event']['event_id'].startswith('boot-recovery:v1:' + step['work_set_digest'] + ':')]
            rows_only = {k: {x: y for x, y in v.items() if x != 'event'} for k, v in rows.items()}
            if floor['state'] != 'complete' or anchor != floor or floor['boot_receipt_set_sha256'] != receipt_set_sha(rows_only):
                exp['output'] = {'status': 'unavailable'}
            elif not matching:
                exp['output'] = {'status': 'none'}
            else:
                first = min(matching, key=lambda v: v['receipt']['sequence_id'])
                exp['output'] = {'status': 'resolved', 'receipt_key': custody_key(first['event']['event_id']),
                                 'event_id': first['event']['event_id'], 'first_append_receipt': first['receipt'],
                                 'original_segment_ref': first['original_segment_ref'],
                                 'original_event_value_commitment': first['original_event_value_commitment']}
        elif kind == 'history':
            if not step['coverage_verified']:
                exp['output'] = {'status': 'unavailable', 'stored_checkpoints': []}
            else:
                ordered = sorted(rows.values(), key=lambda v: v['receipt']['sequence_id'])
                exp['output'] = {'status': 'history', 'event_ids': [v['event']['event_id'] for v in ordered],
                                 'reader': 'reader.storage.boot_recovery_history@1.0.0', 'stored_checkpoints': [],
                                 'stored_token_fields': 0, 'token': copy.deepcopy(step['live_token'])}
        elif kind == 'admit':
            bucket = BUCKETS.get((step['event_type'], step['scope_kind'])) if step['scope_kind'] == 'application' else \
                ('project~' + w.partition(step['project_id']).split('~', 1)[1] if step.get('project_id') else None)
            if bucket is None:
                exp['outcome'] = 'quarantined'; exp['bucket_after'] = copy.deepcopy(step['bucket_before'])
            else:
                state = step['bucket_before'][bucket]
                ok = state['count'] < CAP or state['expired_unheld'] > 0
                exp['outcome'] = 'admitted:' + bucket if ok else 'refused_capacity:' + bucket
                exp['bucket_after'] = bucket_after(step['bucket_before'], bucket, ok)
        exp['floor'] = copy.deepcopy(floor); exp['anchor'] = copy.deepcopy(anchor)
        out.append(exp)
    return out


def operands(case, put, common):
    bs = case.get('ss')
    if not isinstance(bs, dict) or not isinstance(bs.get('steps'), list):
        put('ss_boot_outcome', ['boundary record missing'], [])
        return
    put = s.typed_put(put)
    receipts = []
    for n, step in enumerate(bs['steps']):
        if isinstance(step.get('receipt'), dict):
            receipts.append((('steps', n, 'receipt'), step['receipt'].get('acknowledged_at_utc')))
        out = step.get('output') or {}
        if isinstance(out.get('first_append_receipt'), dict):
            receipts.append((('steps', n, 'output'), out['first_append_receipt'].get('acknowledged_at_utc')))
    time_errors = s.time_errors(receipts, w.EVENT_RECORD)
    put('ss_boot_time', time_errors)
    values = []
    for n, step in enumerate(bs['steps']):
        for key in ('floor', 'anchor', 'pending'):
            if isinstance(step.get(key), dict):
                values.append((n, key, step[key]))
    schema = [[n, key] + e for n, key, v in values for e in w.schema_errors(FLOOR_ROOT, v) if e[-1] != 'format']
    put('ss_boot_schema', schema)
    malformed = {(x[0], x[1]) for x in schema}  # a schema-invalid value is owned by ss_boot_schema alone
    if time_errors:
        return
    expected = model(case)
    issues = [n for n, st in enumerate(bs['steps']) if st['kind'] == 'issue']
    put('ss_boot_outcome', [bs['steps'][n].get('outcome') for n in issues], [expected[n]['outcome'] for n in issues])
    put('ss_boot_events', [len(bs['steps'][n].get('appended', [])) for n in issues], [expected[n]['events'] for n in issues])
    ws_l = []; ws_r = []; id_l = []; id_r = []; rep_l = []; rep_r = []
    for n in issues:
        step = bs['steps'][n]; want = expected[n]; event = step.get('event')
        if 'event' not in want or not isinstance(event, dict):
            ws_l.append(event is None); ws_r.append('event' not in want); continue
        p = event.get('payload') or {}; e = step['episode']
        integrity, recovery, kinds = work_set(e['members'])
        ws_l.append([p.get('integrity_ids'), p.get('recovery_ids'), p.get('interrupted_transaction_kinds'), p.get('recovery_epoch'),
                     p.get('manifest_generation'), p.get('active_segment_ref')])
        ws_r.append([integrity, recovery, kinds, e['epoch'], e['manifest_generation'], e['segment']])
        # Identity derives from the presented work set, so a work-set defect is owned by ss_boot_workset alone.
        members = [{'kind': k, 'integrity_ids': [], 'recovery_ids': []} for k in (p.get('interrupted_transaction_kinds') or [])]
        if members:
            members[0]['integrity_ids'] = list(p.get('integrity_ids') or []); members[0]['recovery_ids'] = list(p.get('recovery_ids') or [])
        W, S = digests(members, p.get('recovery_epoch'), p.get('manifest_generation'), p.get('active_segment_ref'))
        id_l.append([event.get('event_id'), event.get('idempotency_key'), p.get('recovery_set_id'), event.get('actor_ref'),
                     event.get('scope_kind'), event.get('project_id'), event.get('correlation_id'), event.get('occurred_at_utc')])
        id_r.append(['boot-recovery:v1:' + W + ':' + str(p.get('recovery_epoch')) + ':' + S, 'boot-recovery:v1:' + W + ':' + str(p.get('recovery_epoch')),
                     'pm.storage.recovery_set.v1:' + S, ACTOR, 'application', None, e['occurrence'],
                     want['event']['occurred_at_utc']])
        rep_l.append(p.get('repeat_of')); rep_r.append(want['event']['payload'].get('repeat_of'))
    put('ss_boot_workset', ws_l, ws_r)
    put('ss_boot_identity', id_l, id_r)
    put('ss_boot_repeat', rep_l, rep_r)
    put('ss_boot_floor', [('schema',) if (n, 'floor') in malformed else st.get('floor') for n, st in enumerate(bs['steps'])],
        [('schema',) if (n, 'floor') in malformed else x['floor'] for n, x in enumerate(expected)])
    put('ss_boot_anchor', [[('schema',) if (n, 'anchor') in malformed else st.get('anchor'), ('schema',) if (n, 'pending') in malformed else st.get('pending')]
                           for n, st in enumerate(bs['steps'])],
        [[('schema',) if (n, 'anchor') in malformed else x['anchor'], ('schema',) if (n, 'pending') in malformed else None]
         for n, x in enumerate(expected)])
    lookups = [n for n, st in enumerate(bs['steps']) if st['kind'] == 'earliest']
    put('ss_boot_earliest', [bs['steps'][n].get('output') for n in lookups], [expected[n]['output'] for n in lookups])
    counted = [n for n, st in enumerate(bs['steps']) if 'bucket_before' in st]
    put('ss_boot_bucket', [[bs['steps'][n].get('bucket_after'), bs['steps'][n].get('outcome') if bs['steps'][n]['kind'] == 'admit' else None]
                           for n in counted],
        [[expected[n]['bucket_after'], expected[n]['outcome'] if bs['steps'][n]['kind'] == 'admit' else None] for n in counted])
    reads = [n for n, st in enumerate(bs['steps']) if st['kind'] == 'history']
    put('ss_boot_reader', [bs['steps'][n].get('output') for n in reads], [expected[n]['output'] for n in reads])


# ---------------------------------------------------------------- fixture constructor (never called by the checker)
def present(case, specs):
    """Presented steps from AUTHORED outcomes: issued/replayed/no_obligation/refused_*, restore kinds, outputs."""
    bs = case['ss']; floor = copy.deepcopy(bs['initial']['floor']); anchor = copy.deepcopy(bs['initial']['anchor'])
    rows = copy.deepcopy(bs['initial']['rows'])
    for spec in specs:
        step = copy.deepcopy(spec); want = step.pop('want', None); step.setdefault('appended', [])
        kind = step['kind']
        if kind == 'issue':
            step['outcome'] = want
            if want in ('issued', 'replayed'):
                event = intent_for(case, step['episode'], rows, floor['state'] == 'complete' and anchor == floor)
                if want == 'issued':
                    event.update(sequence_id=step['assigned_sequence'], observed_at_utc=step['episode']['time'],
                                 persisted_at_utc=step['episode']['time'])
                    receipt = s.receipt_for(event, offset=step['assigned_sequence'] * 2048, time=step['episode']['time'])
                    key = custody_key(event['event_id']); rows[key] = dict(custody_value(event, receipt), event=copy.deepcopy(event))
                    step['appended'] = [copy.deepcopy(event)]
                    floor = issued_floor(floor, {k: {x: y for x, y in v.items() if x != 'event'} for k, v in rows.items()}, key)
                    if floor['state'] == 'complete':
                        anchor = copy.deepcopy(floor)
                else:
                    original = rows[custody_key(event['event_id'])]
                    event = copy.deepcopy(original['event']); receipt = copy.deepcopy(original['receipt'])
                step['event'] = event; step['receipt'] = receipt
            bucket = BUCKETS[(BOOT, 'application')]
            step['bucket_after'] = copy.deepcopy(step['bucket_before'])
            if want == 'issued':
                state = step['bucket_after'][bucket]
                if state['count'] < CAP:
                    state['count'] += 1
                else:
                    state['expired_unheld'] -= 1
        elif kind == 'restore':
            rows = copy.deepcopy(step['image']['rows'])
            floor = copy.deepcopy(step['image']['floor']) if want == 'continuity_kept' else unavailable(step['image']['floor']['revision'])
        elif kind == 'earliest':
            step['output'] = want(rows) if callable(want) else want
        elif kind == 'history':
            step['output'] = want(rows, step) if callable(want) else want
        elif kind == 'admit':
            step['outcome'] = want
            step['bucket_after'] = copy.deepcopy(step['bucket_before'])
            if want.startswith('admitted:'):
                state = step['bucket_after'][want.split(':', 1)[1]]
                if state['count'] < CAP:
                    state['count'] += 1
                else:
                    state['expired_unheld'] -= 1
        step['floor'] = copy.deepcopy(floor); step['anchor'] = copy.deepcopy(anchor); step['pending'] = None
        bs['steps'].append(step)
    return case


def members():
    return copy.deepcopy(fixture('settled_control')['source_members'])


def episode(epoch=1, manifest=10, extra=None):
    intent = fixture('settled_control')['frozen']['producer_intent']
    e = {'members': members(), 'epoch': epoch, 'manifest_generation': manifest,
         'segment': intent['payload']['active_segment_ref'], 'occurrence': 'fixture:boot-occurrence:' + str(epoch),
         'time': '2026-09-11T22:00:0' + str(epoch) + 'Z', 'discovery': {k: 'complete' for k in KINDS}}
    e.update(extra or {})
    return e


def buckets(count=10, expired=0):
    return {'app:storage_operational': {'count': count, 'expired_unheld': expired, 'held': 3},
            'app:platform_capability': {'count': 5, 'expired_unheld': 0, 'held': 0},
            'project~' + w.partition(w.PROJECT).split('~', 1)[1]: {'count': 7, 'expired_unheld': 0, 'held': 0}}


def initial(case):
    birth = fixture('birth_floor')
    case['ss'] = {'family': BOOT, 'initial': {'floor': copy.deepcopy(birth), 'anchor': copy.deepcopy(birth), 'rows': {}}, 'steps': []}
    return case


def earliest_of(event_index):
    def build(rows):
        ordered = sorted(rows.values(), key=lambda v: v['receipt']['sequence_id'])
        first = ordered[event_index]
        return {'status': 'resolved', 'receipt_key': custody_key(first['event']['event_id']), 'event_id': first['event']['event_id'],
                'first_append_receipt': copy.deepcopy(first['receipt']), 'original_segment_ref': first['original_segment_ref'],
                'original_event_value_commitment': first['original_event_value_commitment']}
    return build


def history_ok(rows, step):
    ordered = sorted(rows.values(), key=lambda v: v['receipt']['sequence_id'])
    return {'status': 'history', 'event_ids': [v['event']['event_id'] for v in ordered], 'reader': 'reader.storage.boot_recovery_history@1.0.0',
            'stored_checkpoints': [], 'stored_token_fields': 0, 'token': copy.deepcopy(step['live_token'])}


def W_of(e):
    return digests(e['members'], e['epoch'], e['manifest_generation'], e['segment'])[0]


def main_specs(case):
    first = episode(1, 10); later = episode(2, 11)
    token = s.live_token(case)
    return [{'kind': 'issue', 'want': 'issued', 'episode': first, 'assigned_sequence': 1, 'bucket_before': buckets()},
            {'kind': 'issue', 'want': 'replayed', 'episode': copy.deepcopy(first), 'assigned_sequence': 2, 'bucket_before': buckets(11)},
            {'kind': 'issue', 'want': 'issued', 'episode': later, 'assigned_sequence': 5, 'bucket_before': buckets(11)},
            {'kind': 'earliest', 'want': earliest_of(0), 'work_set_digest': W_of(first)},
            {'kind': 'history', 'want': history_ok, 'coverage_verified': True, 'live_token': token}]


def augment(control):
    present(initial(control), main_specs(control))


def cases():
    import pm_s3bo_cases as c
    controls = []; negatives = []
    main = s.control(BOOT, 'main', w.build(BOOT)); controls.append(main)
    steps = main['value']['ss']['steps']
    S = lambda n, *path: ('ss', 'steps', n) + path
    later_event = steps[2]['event']
    for row, path, replacement, label in [
            ('ss_boot_outcome', S(1, 'outcome'), 'issued', 'replay-reported-fresh'),
            ('ss_boot_events', S(1, 'appended'), [steps[0]['event']], 'replay-appends'),
            ('ss_boot_events', S(2, 'appended'), [], 'later-episode-not-appended'),
            ('ss_boot_repeat', S(2, 'event', 'payload', 'repeat_of'), 'boot-recovery:v1:' + 'a' * 64 + ':0:' + 'a' * 64, 'repeat-of-guessed'),
            ('ss_boot_repeat', S(0, 'event', 'payload', 'repeat_of'), steps[0]['event']['event_id'], 'first-episode-self-repeat'),
            ('ss_boot_identity', S(0, 'event', 'actor_ref'), 'storage.boot_recovery.publish.v1:other', 'other-actor'),
            ('ss_boot_identity', S(2, 'event', 'occurred_at_utc'), '2026-09-12T00:00:00Z', 'retry-time'),
            ('ss_boot_identity', S(2, 'event', 'correlation_id'), 'fixture:boot-occurrence:1', 'copied-occurrence'),
            ('ss_boot_floor', S(0, 'floor', 'boot_receipt_count'), 2, 'count-advances-twice'),
            ('ss_boot_floor', S(2, 'floor', 'previous_floor_sha256'), 'f' * 64, 'predecessor-hash-guessed'),
            ('ss_boot_floor', S(1, 'floor', 'revision'), 2, 'replay-advances-floor'),
            ('ss_boot_floor', S(2, 'floor', 'birth', 'native_birth_id'), 'fixture-native-birth-2', 'birth-rewritten'),
            ('ss_boot_anchor', S(2, 'anchor'), copy.deepcopy(steps[0]['floor']), 'anchor-lags-floor'),
            ('ss_boot_anchor', S(2, 'pending'), copy.deepcopy(steps[2]['floor']), 'pending-not-consumed'),
            ('ss_boot_earliest', S(3, 'output', 'event_id'), later_event['event_id'], 'earliest-by-latest'),
            ('ss_boot_earliest', S(3, 'output', 'first_append_receipt', 'sequence_id'), 5, 'earliest-other-receipt'),
            ('ss_boot_reader', S(4, 'output', 'stored_checkpoints'), ['boot_recovery_history.v1:' + w.STORE], 'reader-stores-checkpoint'),
            ('ss_boot_reader', S(4, 'output', 'stored_token_fields'), 9, 'reader-stores-token'),
            ('ss_boot_bucket', S(0, 'bucket_after', 'app:platform_capability', 'count'), 6, 'boot-counts-platform-bucket'),
            ('ss_boot_bucket', S(1, 'bucket_after', 'app:storage_operational', 'count'), 12, 'replay-counts'),
            ('ss_boot_schema', S(0, 'floor', 'extra'), 'raw-journal', 'floor-extra-member'),
            ('ss_boot_schema', S(0, 'anchor', 'redaction_profile'), 'redacted', 'anchor-redaction'),
            ('ss_boot_time', S(0, 'receipt', 'acknowledged_at_utc'), '2026-02-30T00:00:00Z', 'receipt-impossible-day')]:
        negatives.append(c.mutate(main, row, path, replacement, label))
    # A work-set defect: the presented payload drops one recovery id (identity follows the presented set).
    value = copy.deepcopy(main['value']); event = value['ss']['steps'][0]['event']
    event['payload']['recovery_ids'] = event['payload']['recovery_ids'][1:]
    rebind_identity(event)
    negatives.append(c.negative(main, 'ss_boot_workset', 'payload-drops-recovery-id', value, {'payload': 'one member result missing'}))
    value = copy.deepcopy(main['value']); event = value['ss']['steps'][0]['event']
    event['payload']['interrupted_transaction_kinds'] = list(reversed(event['payload']['interrupted_transaction_kinds']))
    negatives.append(c.negative(main, 'ss_boot_workset', 'payload-unsorted-kinds', value, {'payload': 'kinds not UTF-8 byte sorted'}))
    value = copy.deepcopy(main['value']); event = value['ss']['steps'][0]['event']
    event['event_id'] = event['event_id'].rsplit(':', 1)[0] + ':' + 'c' * 64
    negatives.append(c.negative(main, 'ss_boot_identity', 'event-id-other-episode', value, {'event': 'S not recomputed'}))
    # No work, incomplete discovery, a foreign occurrence and an empty result union.
    for label, extra, want in [('no-work', {'members': []}, 'no_obligation'),
                               ('discovery-incomplete', {'discovery': dict({k: 'complete' for k in KINDS}, compaction='owner_missing')}, 'refused_incomplete'),
                               ('foreign-occurrence', {'foreign_occurrence': True}, 'refused_incomplete')]:
        value = present(initial(w.build(BOOT)), [{'kind': 'issue', 'want': want, 'episode': episode(1, 10, extra), 'assigned_sequence': 1,
                                                  'bucket_before': buckets()}])
        control = s.control(BOOT, label, value); controls.append(control)
        negatives.append(c.mutate(control, 'ss_boot_outcome', S(0, 'outcome'), 'issued', label + '-issued'))
    bad = episode(1, 10); bad['members'][0]['integrity_ids'] = []; bad['members'][0]['recovery_ids'] = []
    value = present(initial(w.build(BOOT)), [{'kind': 'issue', 'want': 'refused_incomplete', 'episode': bad, 'assigned_sequence': 1, 'bucket_before': buckets()}])
    control = s.control(BOOT, 'empty-result-union', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_boot_outcome', S(0, 'outcome'), 'issued', 'empty-union-issued'))
    # Restore paths (SP-2205): matching image keeps continuity; older image or no anchor leaves the floor unavailable.
    first = episode(1, 10); second = episode(2, 11)
    base = present(initial(w.build(BOOT)), [{'kind': 'issue', 'want': 'issued', 'episode': first, 'assigned_sequence': 1, 'bucket_before': buckets()}])
    # Image taken after the first issuance (matches the anchor).
    img_match = {'floor': copy.deepcopy(base['ss']['steps'][0]['floor']), 'rows': copy.deepcopy(rows_after(base))}
    restore = lambda epoch: {'intent_epoch': epoch, 'current_epoch': epoch, 'session_opened': 10, 'accepted_at': 11}
    value = present(initial(w.build(BOOT)), [
        {'kind': 'issue', 'want': 'issued', 'episode': first, 'assigned_sequence': 1, 'bucket_before': buckets()},
        {'kind': 'restore', 'want': 'continuity_kept', 'image': img_match},
        {'kind': 'issue', 'want': 'issued', 'episode': dict(second, restore=restore(2)), 'assigned_sequence': 7, 'bucket_before': buckets(11)},
        {'kind': 'earliest', 'want': earliest_of(0), 'work_set_digest': W_of(first)}])
    control = s.control(BOOT, 'restore-matching-image', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_boot_floor', S(1, 'floor'), unavailable(1), 'matching-restore-loses-continuity'))
    # Older image (birth floor, before the issuance): floor unavailable, anchor kept, later receipts advance only the revision.
    img_old = {'floor': fixture('birth_floor'), 'rows': {}}
    value = present(initial(w.build(BOOT)), [
        {'kind': 'issue', 'want': 'issued', 'episode': first, 'assigned_sequence': 1, 'bucket_before': buckets()},
        {'kind': 'restore', 'want': 'continuity_unavailable', 'image': img_old},
        {'kind': 'issue', 'want': 'refused_restored_pending', 'episode': dict(copy.deepcopy(first), restore={'intent_epoch': 1, 'current_epoch': 2,
                                                                                                             'session_opened': 10, 'accepted_at': 11}),
         'assigned_sequence': 6, 'bucket_before': buckets(11)},
        {'kind': 'issue', 'want': 'issued', 'episode': dict(second, restore=restore(2)), 'assigned_sequence': 7, 'bucket_before': buckets(11)},
        {'kind': 'earliest', 'want': {'status': 'unavailable'}, 'work_set_digest': W_of(first)}])
    control = s.control(BOOT, 'restore-older-image', value); controls.append(control)
    steps2 = value['ss']['steps']
    negatives.append(c.mutate(control, 'ss_boot_floor', S(1, 'floor'), fixture('birth_floor'), 'older-restore-claims-complete'))
    negatives.append(c.mutate(control, 'ss_boot_anchor', S(1, 'anchor'), fixture('birth_floor'), 'anchor-rolled-back'))
    negatives.append(c.mutate(control, 'ss_boot_outcome', S(2, 'outcome'), 'issued', 'restored-pending-first-mints'))
    negatives.append(c.mutate(control, 'ss_boot_events', S(2, 'appended'), [steps2[0]['appended'][0]], 'restored-pending-appends'))
    negatives.append(c.mutate(control, 'ss_boot_floor', S(3, 'floor', 'revision'), steps2[1]['floor']['revision'], 'later-receipt-not-counted'))
    negatives.append(c.mutate(control, 'ss_boot_earliest', S(4, 'output'), earliest_of(0)(rows_after(value)), 'earliest-after-older-restore'))
    # Fresh admission failures after a verified restore.
    for label, adm in [('accepted-before-session', {'intent_epoch': 2, 'current_epoch': 2, 'session_opened': 10, 'accepted_at': 9}),
                       ('old-epoch-capability', {'intent_epoch': 1, 'current_epoch': 2, 'session_opened': 10, 'accepted_at': 11})]:
        value = present(initial(w.build(BOOT)), [
            {'kind': 'issue', 'want': 'issued', 'episode': first, 'assigned_sequence': 1, 'bucket_before': buckets()},
            {'kind': 'restore', 'want': 'continuity_unavailable', 'image': img_old},
            {'kind': 'issue', 'want': 'refused_restored_pending', 'episode': dict(second, restore=adm), 'assigned_sequence': 7,
             'bucket_before': buckets(11)}])
        control = s.control(BOOT, 'restore-' + label, value); controls.append(control)
        negatives.append(c.mutate(control, 'ss_boot_outcome', S(2, 'outcome'), 'issued', label + '-issued'))
    # A surviving exact receipt after restore is replayed, never re-minted.
    value = present(initial(w.build(BOOT)), [
        {'kind': 'issue', 'want': 'issued', 'episode': first, 'assigned_sequence': 1, 'bucket_before': buckets()},
        {'kind': 'restore', 'want': 'continuity_kept', 'image': img_match},
        {'kind': 'issue', 'want': 'replayed', 'episode': dict(copy.deepcopy(first), restore={'intent_epoch': 1, 'current_epoch': 2,
                                                                                            'session_opened': 10, 'accepted_at': 11}),
         'assigned_sequence': 9, 'bucket_before': buckets(11)}])
    control = s.control(BOOT, 'restore-surviving-receipt', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_boot_outcome', S(2, 'outcome'), 'refused_restored_pending', 'surviving-receipt-refused'))
    # Cardinality (DL-083): full bucket with and without an expired unheld member; other buckets isolated.
    value = present(initial(w.build(BOOT)), [{'kind': 'issue', 'want': 'refused_capacity', 'episode': first, 'assigned_sequence': 1,
                                              'bucket_before': buckets(CAP, 0)}])
    control = s.control(BOOT, 'bucket-full', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_boot_outcome', S(0, 'outcome'), 'issued', 'full-bucket-issues'))
    negatives.append(c.mutate(control, 'ss_boot_bucket', S(0, 'bucket_after', 'app:storage_operational', 'held'), 2, 'full-bucket-evicts-held'))
    value = present(initial(w.build(BOOT)), [{'kind': 'issue', 'want': 'issued', 'episode': first, 'assigned_sequence': 1,
                                              'bucket_before': buckets(CAP, 1)}])
    control = s.control(BOOT, 'bucket-full-expired', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_boot_bucket', S(0, 'bucket_after', 'app:storage_operational', 'count'), CAP + 1, 'bucket-exceeds-cap'))
    platform_full = buckets(); platform_full['app:platform_capability']['count'] = CAP
    project = 'project~' + w.partition(w.PROJECT).split('~', 1)[1]
    value = present(initial(w.build(BOOT)), [
        {'kind': 'admit', 'want': 'admitted:app:storage_operational', 'event_type': 'storage.recovery_applied', 'scope_kind': 'application',
         'bucket_before': platform_full},
        {'kind': 'admit', 'want': 'admitted:app:storage_operational', 'event_type': 'storage.compaction_lifecycle_changed',
         'scope_kind': 'application', 'bucket_before': buckets(11)},
        {'kind': 'admit', 'want': 'refused_capacity:app:platform_capability', 'event_type': 'platform.capability_evaluated',
         'scope_kind': 'application', 'bucket_before': platform_full},
        {'kind': 'admit', 'want': 'admitted:' + project, 'event_type': 'platform.capability_evaluated', 'scope_kind': 'project',
         'project_id': w.PROJECT, 'bucket_before': buckets()},
        {'kind': 'admit', 'want': 'quarantined', 'event_type': 'storage.unknown_family', 'scope_kind': 'application', 'bucket_before': buckets()}])
    control = s.control(BOOT, 'bucket-assignment', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_boot_bucket', S(2, 'outcome'), 'admitted:app:storage_operational', 'platform-borrows-storage-room'))
    negatives.append(c.mutate(control, 'ss_boot_bucket', S(3, 'outcome'), 'admitted:app:platform_capability', 'project-record-in-app-bucket'))
    negatives.append(c.mutate(control, 'ss_boot_bucket', S(4, 'outcome'), 'admitted:app:storage_operational', 'unknown-defaulted-into-bucket'))
    # Passive history reader: unverified coverage is unavailable, never an empty history.
    value = present(initial(w.build(BOOT)), [{'kind': 'issue', 'want': 'issued', 'episode': first, 'assigned_sequence': 1, 'bucket_before': buckets()},
                                             {'kind': 'history', 'want': {'status': 'unavailable', 'stored_checkpoints': []},
                                              'coverage_verified': False, 'live_token': s.live_token(main['value'])}])
    control = s.control(BOOT, 'history-unverified', value); controls.append(control)
    negatives.append(c.mutate(control, 'ss_boot_reader', S(1, 'output'), {'status': 'history', 'event_ids': [],
                                                                          'reader': 'reader.storage.boot_recovery_history@1.0.0',
                                                                          'stored_checkpoints': [], 'stored_token_fields': 0,
                                                                          'token': s.live_token(main['value'])}, 'unverified-empty-history'))
    return controls, negatives


def rebind_identity(event):
    """Recompute the identity from the presented payload (so a work-set defect stays a work-set defect)."""
    p = event['payload']
    member = [{'kind': k, 'integrity_ids': [], 'recovery_ids': []} for k in p['interrupted_transaction_kinds']]
    member[0].update(integrity_ids=list(p['integrity_ids']), recovery_ids=list(p['recovery_ids']))
    W, S = digests(member, p['recovery_epoch'], p['manifest_generation'], p['active_segment_ref'])
    event.update(event_id='boot-recovery:v1:' + W + ':' + str(p['recovery_epoch']) + ':' + S,
                 idempotency_key='boot-recovery:v1:' + W + ':' + str(p['recovery_epoch']))
    p['recovery_set_id'] = 'pm.storage.recovery_set.v1:' + S


def rows_after(case):
    rows = {}
    for step in case['ss']['steps']:
        if step['kind'] == 'issue' and step.get('outcome') == 'issued':
            event = step['appended'][0]; rows[custody_key(event['event_id'])] = dict(custody_value(event, step['receipt']), event=copy.deepcopy(event))
        if step['kind'] == 'restore':
            rows = copy.deepcopy(step['image']['rows'])
    return rows


def corpus_slots(control):
    bs = control['value'].get('ss') or {}
    paths = [('ss', 'steps', n, 'receipt', 'acknowledged_at_utc') for n, st in enumerate(bs.get('steps', []))
             if isinstance(st.get('receipt'), dict) and st['kind'] == 'issue' and st.get('outcome') == 'issued'
             and not any(isinstance(x.get('output'), dict) and 'first_append_receipt' in x['output'] for x in bs['steps'])]
    for path in paths[:1]:
        yield {'paths': [path], 'kind': 'datetime', 'row': 'ss_boot_time', 'profile': w.EVENT_RECORD, 'type_rows': ['ss_boot_time']}
