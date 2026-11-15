"""C12-SL: storage.deletion_lifecycle_changed complete deletion boundary.

Owner clauses: Thread/project deletion and SP-2200 in Plans/storage-plan.md
(ordinary graph, failure ingress, fail-closed admission order, producer order
(1)-(5), identity and ordinal, replay, consumer, withdrawal, numbers/times),
CV-319's dual-scope rule, the storage_deletion_record registry schema, and the
K37 deletion oracles in Plans/Automated_Testing_System.md.

The boundary record (`case['sl']`) holds the deletion's independently held
facts and every run: the two opening handlers and the registry-only removal,
each admitted or refused coordinator transition with its owner facts (hold
evaluation, scope/reachability, tombstone and hide receipts, writer and
maintenance posture, successor generation), crash cuts with resumption,
replay/conflict/dedupe/replay-only requests, passive history and canonical
reads, withdrawal and backup restore. Expected outcomes are derived here from
those inputs by the owner rules; the presented outcomes are the fixture's.

Open owner point (reported, not decided by this lane): the owner text says a
retry of a `failed` deletion "revalidates ... before a graph-valid successor"
and "creates no fixed bypass from failed to purge_pending or purged", but no
edge out of `failed` is listed. RETRY_SUCCESSOR records the provisional
reading (`logically_hidden`: the hide is kept and re-proved); the question is
in drafts/PNC019/c12-sl/REPORT.md. Native execution remains NOT_RUN.
"""
import copy

import pm_s3bo_oracles as w
import pm_s3bo_sl_common as s

LANE = 'sl'
DEL = 'storage.deletion_lifecycle_changed'
FAMILIES = (DEL,)
GRAPH = (('initial', 'requested'), ('requested', 'logically_hidden'), ('logically_hidden', 'held'),
         ('logically_hidden', 'purge_pending'), ('held', 'purge_pending'), ('purge_pending', 'purged'),
         ('requested', 'failed'), ('logically_hidden', 'failed'), ('purge_pending', 'failed'))
RETRY_SUCCESSOR = 'logically_hidden'
HIDDEN = ('logically_hidden', 'held', 'purge_pending', 'purged')
REVALIDATION = ['holds', 'tombstone', 'scope', 'writer', 'purge_authority']
STAGES = ('schema', 'record', 'scope', 'holds', 'tombstone', 'authority', 'generation')
STEP = ['admission', 'record_cas_and_obligation', 'barrier_append', 'first_receipt']
EFFECT = {'logically_hidden': ['projection_hide'], 'purge_pending': ['purge_dispatch']}
BACKUP_SECONDS = 30 * 86400
DAY = 86400
REQUESTED_AT = '2026-11-14T12:00:00Z'
DEADLINE = '2026-11-15T12:00:00Z'
RECORD_SCHEMA = next(r['value_schema'] for r in w.read_json('Plans/storage_value_registry.json')['families']
                     if r['family_id'] == 'storage_deletion_record')
PAYLOAD_SCHEMA = w.schema_for(DEL)

ROWS = [
    ('sl_del_decision', 'sl_deletion', 'equal', 'Each coordinator step is admitted or refused at the first failing stage of the fixed admission order: edge and payload conditional, durable record state, scope and reachability, holds, tombstone and hide, writer and maintenance authority, verified committed successor generation.'),
    ('sl_del_zero', 'sl_deletion', 'equal', 'A refused step appends nothing and leaves the record, projections, checkpoints, purge/compaction dispatch and holds unchanged.'),
    ('sl_del_record', 'sl_deletion', 'equal', 'An admitted step CASes the record to the new state, appends the event to event_refs and records the current blockers, hide receipt and generation.'),
    ('sl_del_order', 'sl_deletion', 'equal', 'Admission, record CAS with the frozen obligation, barrier append and first receipt precede the dependent effect and the command result.'),
    ('sl_del_effects', 'sl_deletion', 'equal', 'The dependent effect is exactly projection hide for logically_hidden and purge dispatch for purge_pending; no step clears a hold.'),
    ('sl_del_payload', 'sl_deletion', 'equal', 'The payload carries the state, current blockers, deadline, tombstone, scope ref, generation only for purge states and failure reason only for failed.'),
    ('sl_del_identity', 'sl_deletion', 'equal', 'Each event id and key follows the SP-2200 recipe over deletion_id and the 1-based event_refs ordinal.'),
    ('sl_del_envelope', 'sl_deletion', 'equal', 'A thread deletion names the deleted thread, Project-data deletion has null thread; Project id null exactly when the payload omits it; run and attempt null.'),
    ('sl_del_retry', 'sl_deletion', 'equal', 'A retry after failed reuses deletion_id and the request key, takes the next ordinal, revalidates every authority first and never bypasses to purge_pending or purged.'),
    ('sl_del_replay', 'sl_deletion', 'equal', 'Same identity and digest returns the original receipt and result; a different digest conflicts; unavailable dedupe and projector_replay_only refuse with zero effects.'),
    ('sl_del_resume', 'sl_deletion', 'equal', 'A crash before the append resumes the same obligation once; after the commit frame it resolves the original receipt and never appends, hides, purges or re-evaluates holds again.'),
    ('sl_del_handler', 'sl_deletion', 'equal', 'Handlers only submit; remove-from-list is a registry tombstone only; Project-data deletion needs its separate confirmation.'),
    ('sl_del_reader', 'sl_deletion', 'equal', 'History is available only with complete coverage and a verified token, otherwise unavailable; canonical readers use the deletion record, never the event.'),
    ('sl_del_withdrawal', 'sl_deletion', 'equal', 'Withdrawal resolves durable obligations by their original receipt, fences the rest, keeps every record, tombstone and receipt and never deletes, restores or un-hides.'),
    ('sl_del_restore', 'sl_deletion', 'equal', 'Restore replays tombstones before visibility, never shows a deleted subject and keeps backup bytes at most 30 days unless held.'),
    ('sl_del_deadline', 'sl_deletion', 'less_equal', 'A thread deletion purge deadline is no later than 24 hours after the request.'),
    ('sl_del_numbers', 'sl_deletion', 'error', 'Generation slots use shared current_integer with minimum 0.'),
    ('sl_del_time', 'sl_deletion', 'error', 'The request time uses Storage UTC-Z and the payload deadline uses the EventRecord profile.'),
]


# ---------------------------------------------------------------- owner rules

def ids(deletion, ordinal):
    scope = deletion['scope_partition']
    component = DEL + ':' + deletion['deletion_id'] + ':' + str(ordinal)
    key = ('application@1:' if scope == 'app' else 'storage-deletion@1:') + w.SERVER.encode().hex() + ':' + component.encode().hex()
    eid = 'er_del_' + w.sha(w.lp('storage.deletion_lifecycle_changed/event/v1', w.STORE.encode().hex(), scope, component))
    return eid, key


def edge_ok(run, before_state):
    to = run['to']
    if run['kind'] == 'retry':
        return before_state == 'failed' and to == RETRY_SUCCESSOR
    return (before_state, to) in GRAPH


def stage(run, record):
    """SP-237 fail-closed admission order over independently held facts; None when admitted."""
    f = run['facts']; to = run['to']; before = record['purge_state'] if record else 'initial'
    if not edge_ok(run, before) or (to == 'failed') != bool(f.get('failure_reason')) or f.get('payload_secret'):
        return 'schema'
    if run['seen'] != before or f.get('obligation_pending'):
        return 'record'
    if f['reachability'] != 'exact' or not f['scope_current']:
        return 'scope'
    if (to == 'held' and not f['holds']) or (to in ('purge_pending', 'purged') and f['holds']):
        return 'holds'
    if not f['tombstone'] or (to in HIDDEN and not f['hide']):
        return 'tombstone'
    if not f['writer'] or f.get('storage_mode', 'normal') != 'normal' or not f.get('family_authority', True) \
            or (to in ('purge_pending', 'purged') and not f['maintenance']):
        return 'authority'
    succ = f.get('successor')
    if to == 'purged' and not (isinstance(succ, dict) and succ.get('verified') is True and succ.get('committed') is True
                               and s.int_ok(succ.get('generation')) and succ.get('selected_by', 'current') == 'current'):
        return 'generation'
    return None


def generation_of(run):
    succ = run['facts'].get('successor') or {}
    if run['to'] == 'purged':
        return succ.get('generation')
    if run['to'] == 'purge_pending':
        return run['facts'].get('pending_generation')
    return None


def expected_payload(deletion, run):
    p = {'schema_version': '1.0.0', 'deletion_id': deletion['deletion_id'], 'deletion_scope_ref': deletion['deletion_scope_ref'],
         'state': run['to'], 'actor_ref': deletion['actor_ref'], 'hold_blockers': list(run['facts']['holds']),
         'purge_deadline_utc': deletion['purge_deadline_utc'], 'tombstone_ref': deletion['tombstone_ref']}
    if deletion['project_id'] is not None:
        p['project_id'] = deletion['project_id']
    if generation_of(run) is not None:
        p['compaction_generation'] = generation_of(run)
    if run['to'] == 'failed':
        p['failure_reason'] = run['facts']['failure_reason']
    return p


def expected_record(deletion, record, run, event_id):
    after = copy.deepcopy(record) if record else new_record(deletion)
    after['purge_state'] = run['to']
    after['event_refs'] = list(after['event_refs']) + [event_id]
    after['hold_blocker_refs'] = list(run['facts']['holds'])
    after['compaction_generation'] = generation_of(run) if run['to'] in ('purge_pending', 'purged') else None
    if run['to'] == 'logically_hidden':
        after['logical_hide_receipt_ref'] = run['facts']['hide_receipt']
    return after


def new_record(deletion):
    return {'schema_id': 'pm.storage_value.storage_deletion_record.v1', 'schema_version': '1.0.0',
            'deletion_id': deletion['deletion_id'], 'scope': copy.deepcopy(deletion['record_scope']),
            'requested_by_actor_ref': deletion['actor_ref'], 'requested_at_utc': deletion['requested_at_utc'],
            'reason': 'user requested deletion', 'hold_blocker_refs': [], 'logical_hide_receipt_ref': deletion['tombstone_ref'],
            'purge_state': 'requested', 'compaction_generation': None, 'blob_disposition': 'purge_with_scope',
            'backup_disposition': 'expire_30d_unless_held', 'event_refs': [], 'redaction_profile': 'no_secrets'}


def expected_trace(to):
    return STEP + EFFECT.get(to, []) + ['result']


def expected_envelope(deletion):
    return (deletion['scope_kind_envelope'], deletion['project_id'], deletion['thread_id'], None, None,
            'dedupe_by_idempotency_key', DEL)


# ---------------------------------------------------------------- operands

def _transitions(runs):
    return [(i, r) for i, r in enumerate(runs) if r['kind'] in ('transition', 'retry')]


def _numbers(runs):
    slots = []
    for i, r in enumerate(runs):
        if r['kind'] not in ('transition', 'retry', 'crash'):
            continue
        succ = r['facts'].get('successor')
        if isinstance(succ, dict):
            slots.append(('run%d/successor' % i, succ.get('generation'), 0, None))
        slots.append(('run%d/pending' % i, r['facts'].get('pending_generation'), 0, None))
        for e in r.get('events_appended') or []:
            slots.append(('run%d/event' % i, (e.get('payload') or {}).get('compaction_generation'), 0, None))
        rec = r.get('record_after')
        if isinstance(rec, dict):
            slots.append(('run%d/record' % i, rec.get('compaction_generation'), 0, None))
    return s.number_errors(slots)


def _times(deletion, runs):
    slots = [('requested_at', deletion.get('requested_at_utc'), w.STORAGE_UTC_Z),
             ('deadline', deletion.get('purge_deadline_utc'), w.EVENT_RECORD)]
    for i, r in enumerate(runs):
        rec = r.get('record_after')
        if isinstance(rec, dict):
            slots.append(('run%d/requested_at' % i, rec.get('requested_at_utc'), w.STORAGE_UTC_Z))
        for e in r.get('events_appended') or []:
            slots.append(('run%d/deadline' % i, (e.get('payload') or {}).get('purge_deadline_utc'), w.EVENT_RECORD))
    return s.date_errors(slots)


def operands(case, put, common):
    runs = s.runs_of(case, DEL)
    if runs is None:
        put('sl_del_decision', ['boundary record missing'], [])
        return
    deletion = case['sl']['deletion']
    numbers = _numbers(runs); times = _times(deletion, runs)
    put('sl_del_numbers', numbers); put('sl_del_time', times)
    ok = not numbers and not times
    if not ok:
        return  # every other row of this family is inapplicable until the shared number/time rows pass
    trans = _transitions(runs)
    # Decision, zero effect, record, order, effects, payload, identity, envelope.
    left = []; right = []; zl = []; zr = []; rl = []; rr = []; ol = []; orr = []; el = []; er = []
    pl = []; pr = []; il = []; ir = []; vl = []; vr = []
    for i, r in trans:
        before = r.get('record_before')
        want = stage(r, before) if ok else None
        left.append((i, r.get('decision'), r.get('stage'))); right.append((i, 'refused' if want else 'appended', want))
        if want:
            zl.append((i, len(r.get('events_appended') or []), s.cj(r.get('record_after')), r.get('effects'), r.get('trace')))
            zr.append((i, 0, s.cj(before), [], ['admission', 'refuse']))
            continue
        ordinal = len((before or {}).get('event_refs', [])) + 1
        eid, key = ids(deletion, ordinal)
        rl.append((i, s.cj(r.get('record_after')))); rr.append((i, s.cj(expected_record(deletion, before, r, eid))))
        ol.append((i, r.get('trace'))); orr.append((i, expected_trace(r['to'])))
        el.append((i, r.get('effects'))); er.append((i, EFFECT.get(r['to'], [])))
        events = r.get('events_appended') or []
        pl.append((i, len(events), [s.cj(e.get('payload')) for e in events]))
        pr.append((i, 1, [s.cj(expected_payload(deletion, r))]))
        il.append((i, [(e.get('event_id'), e.get('idempotency_key')) for e in events])); ir.append((i, [(eid, key)]))
        vl.append((i, [(e.get('scope_kind'), e.get('project_id'), e.get('thread_id'), e.get('run_id'), e.get('attempt_id'),
                        e.get('replay_policy'), e.get('event_type')) for e in events]))
        vr.append((i, [expected_envelope(deletion)] * len(events)))
        ir[-1] = (i, [(eid, key)] * len(events))
    put('sl_del_decision', left, right, ok)
    put('sl_del_zero', zl, zr, ok); put('sl_del_record', rl, rr, ok); put('sl_del_order', ol, orr, ok)
    put('sl_del_effects', el, er, ok); put('sl_del_payload', pl, pr, ok); put('sl_del_identity', il, ir, ok)
    put('sl_del_envelope', vl, vr, ok)
    # Retry identity, ordinal and revalidation.
    left = []; right = []
    for i, r in enumerate(runs):
        if r['kind'] != 'retry':
            continue
        before = r.get('record_before') or {}
        ordinal = len(before.get('event_refs', [])) + 1
        left.append((i, r.get('deletion_id'), r.get('request_key'), r.get('ordinal'), r.get('revalidated')))
        right.append((i, deletion['deletion_id'], deletion['request_key'], ordinal, REVALIDATION))
    put('sl_del_retry', left, right, ok)
    # Replay, conflict, unavailable dedupe and projector_replay_only.
    left = []; right = []
    for i, r in enumerate(runs):
        if r['kind'] != 'replay':
            continue
        original = runs[r['of']]
        cand = r.get('candidate') or {}
        if cand.get('replay_policy') == 'projector_replay_only':
            want = ({'kind': 'refused', 'reason_code': 'replay_only_not_appendable'}, ['reject_replay_only'])
        elif not r['facts']['dedupe_available']:
            want = ({'kind': 'refused', 'reason_code': 'dedupe_unavailable'}, ['dedupe_lookup', 'refuse'])
        elif s.cj(w.semantic(cand)) == s.cj(w.semantic((original.get('events_appended') or [{}])[0])):
            want = (original.get('result'), ['dedupe_lookup', 'return_original'])
        else:
            want = ({'kind': 'refused', 'reason_code': 'idempotency_conflict'}, ['dedupe_lookup', 'refuse'])
        left.append((i, s.cj(r.get('result')), r.get('trace'), len(r.get('events_appended') or []), r.get('effects')))
        right.append((i, s.cj(want[0]), want[1], 0, []))
    put('sl_del_replay', left, right, ok)
    # Crash cuts and resumption.
    left = []; right = []
    for i, r in enumerate(runs):
        if r['kind'] != 'resume':
            continue
        crash = runs[r['of']]; at = crash['crash_at']
        durable = STEP.index(at) >= STEP.index('barrier_append')
        to = crash['to']
        trace = ['resume_obligation'] + (['resolve_original_receipt'] if durable else ['barrier_append', 'first_receipt']) + EFFECT.get(to, []) + ['result']
        appended = (crash.get('events_appended') or []) + (r.get('events_appended') or [])
        left.append((i, r.get('trace'), len(appended), [s.physical_hex(e) for e in appended], r.get('effects'),
                     (crash.get('effects') or []) + (r.get('effects') or [])))
        right.append((i, trace, 1, [s.physical_hex(crash.get('obligation'))], EFFECT.get(to, []), EFFECT.get(to, [])))
    put('sl_del_resume', left, right, ok)
    # Handlers.
    left = []; right = []
    for i, r in enumerate(runs):
        if r['kind'] != 'submit':
            continue
        cmd = r['command']
        if cmd == 'cmd.chat.delete':
            want = ({'scope': 'thread', 'thread_id': deletion['thread_id'], 'project_id': deletion['project_id']}, False)
        elif cmd == 'cmd.project.delete_data' and r['facts'].get('confirmed') is True and deletion['project_id'] is not None:
            want = ({'scope': 'project_data', 'thread_id': None, 'project_id': deletion['project_id']}, False)
        elif cmd == 'remove_project_from_list':
            want = (None, True)
        else:
            want = (None, False)
        left.append((i, r.get('submitted'), r.get('registry_tombstone'), len(r.get('events_appended') or []), r.get('effects'), r.get('record_created')))
        right.append((i, want[0], want[1], 0, [], False))
    put('sl_del_handler', left, right, ok)
    # Passive history and canonical readers.
    left = []; right = []
    for i, r in enumerate(runs):
        if r['kind'] == 'history_read':
            f = r['facts']
            want = {'status': 'available', 'event_ids': [e for e in f['source_event_ids'] if e in f['family_event_ids']]} \
                if f['coverage_complete'] and f['token_verified'] else {'status': 'unavailable', 'event_ids': None}
            left.append((i, r.get('result'), r.get('effects'))); right.append((i, want, []))
        elif r['kind'] == 'canonical_read':
            rec = r['facts']['record']
            left.append((i, r.get('result'), r.get('effects')))
            right.append((i, {'authority': 'storage_deletion_record', 'state': rec['purge_state'],
                              'hide_ref': rec['logical_hide_receipt_ref']}, []))
    put('sl_del_reader', left, right, ok)
    # Withdrawal.
    left = []; right = []
    for i, r in enumerate(runs):
        if r['kind'] != 'withdraw':
            continue
        f = r['facts']
        want = [[o['event_id'], 'resolve_original_receipt' if o['commit_frame_durable'] else 'fence'] for o in f['obligations']]
        left.append((i, r.get('trace'), r.get('obligations'), r.get('kept'), r.get('content_effects'), r.get('reader')))
        right.append((i, ['writer_cutoff', 'drain_obligations', 'fence_reader'], want, f['custody'], [], 'fenced_tokens_invalidated'))
    put('sl_del_withdrawal', left, right, ok)
    # Backup restore.
    left = []; right = []
    for i, r in enumerate(runs):
        if r['kind'] != 'restore':
            continue
        f = r['facts']
        visible = [x for x in f['backup_subjects'] if x not in f['tombstoned_subjects']]
        retained = f['held'] or f['backup_age_seconds'] <= BACKUP_SECONDS
        left.append((i, r.get('trace'), r.get('visible'), r.get('backup_bytes_retained'), r.get('kept')))
        right.append((i, ['restore_boundary', 'replay_tombstones', 'visibility'], visible, retained, ['writer_cutoff', 'original_results']))
    put('sl_del_restore', left, right, ok)
    # Deadline (thread deletions).
    if ok and deletion['thread_id'] is not None:
        put('sl_del_deadline', s.utc(deletion['purge_deadline_utc']).timestamp(), s.utc(deletion['requested_at_utc']).timestamp() + DAY)


# ---------------------------------------------------------------- fixture constructor

def facts(**change):
    value = {'reachability': 'exact', 'scope_current': True, 'holds': [], 'tombstone': True, 'hide': True,
             'hide_receipt': 'hide-receipt-A', 'writer': True, 'maintenance': True, 'successor': None,
             'pending_generation': None, 'failure_reason': None, 'obligation_pending': False}
    value.update(change)
    return value


def deletion_of(case, scope):
    src = case['source']; project = src['project_id']
    partition = w.partition(project)
    did = 'del_' + w.sha(w.lp('storage.deletion/request/v1', partition, src['request_key']))
    thread = src['thread_id'] if scope == 'thread' else None
    record_scope = {'scope_kind': 'thread', 'project_id': project, 'thread_id': thread} if scope == 'thread' else \
        {'scope_kind': 'project', 'project_id': project}
    return {'deletion_id': did, 'request_key': src['request_key'], 'scope': scope, 'project_id': project,
            'thread_id': thread, 'scope_partition': partition, 'scope_kind_envelope': 'project' if project else 'application',
            'actor_ref': 'actor-A', 'deletion_scope_ref': ('thread:' + thread) if thread else ('project:' + str(project)),
            'tombstone_ref': 'tombstone-A', 'requested_at_utc': REQUESTED_AT, 'purge_deadline_utc': DEADLINE,
            'record_scope': record_scope}


def simulate(case, run, record):
    """Owner-conforming presented outcome of one run (fixture constructor, never called by the checker)."""
    deletion = case['sl']['deletion']; base = case['stored_event']
    kind = run['kind']
    run.setdefault('events_appended', []); run.setdefault('effects', [])
    if kind in ('transition', 'retry', 'crash'):
        run['record_before'] = copy.deepcopy(record)
        why = stage(run, record)
        if kind == 'retry':
            ordinal = len((record or {}).get('event_refs', [])) + 1
            run.update(deletion_id=deletion['deletion_id'], request_key=deletion['request_key'], ordinal=ordinal,
                       revalidated=list(REVALIDATION))
        if why:
            run.update(decision='refused', stage=why, record_after=copy.deepcopy(record), trace=['admission', 'refuse'])
            return record
        ordinal = len((record or {}).get('event_refs', [])) + 1
        eid, key = ids(deletion, ordinal)
        after = expected_record(deletion, record, run, eid)
        env = dict(scope_kind=deletion['scope_kind_envelope'], project_id=deletion['project_id'], thread_id=deletion['thread_id'],
                   run_id=None, attempt_id=None, sequence_id=41 + ordinal)
        frozen = s.event(base, expected_payload(deletion, run), eid, key, **env)
        run['obligation'] = copy.deepcopy(frozen)
        receipt = dict(copy.deepcopy(case['receipt']), event_id=eid, sequence_id=41 + ordinal)
        if kind == 'crash':
            n = STEP.index(run['crash_at'])
            run.update(trace=STEP[:n + 1] + ['crash'], record_after=after)
            if n >= STEP.index('barrier_append'):
                run['events_appended'] = [copy.deepcopy(frozen)]
            run['receipt'] = receipt
            return after
        run.update(decision='appended', stage=None, record_after=after, trace=expected_trace(run['to']),
                   events_appended=[copy.deepcopy(frozen)], effects=list(EFFECT.get(run['to'], [])),
                   receipt=receipt, result={'kind': 'transition_recorded', 'receipt': receipt})
        return after
    if kind == 'resume':
        crash = case['sl']['runs'][run['of']]
        durable = STEP.index(crash['crash_at']) >= STEP.index('barrier_append')
        run['trace'] = ['resume_obligation'] + (['resolve_original_receipt'] if durable else ['barrier_append', 'first_receipt']) \
            + EFFECT.get(crash['to'], []) + ['result']
        run['events_appended'] = [] if durable else [copy.deepcopy(crash['obligation'])]
        run['effects'] = list(EFFECT.get(crash['to'], []))
        return record
    if kind == 'replay':
        original = case['sl']['runs'][run['of']]
        cand = run['candidate']
        if cand.get('replay_policy') == 'projector_replay_only':
            run.update(result={'kind': 'refused', 'reason_code': 'replay_only_not_appendable'}, trace=['reject_replay_only'])
        elif not run['facts']['dedupe_available']:
            run.update(result={'kind': 'refused', 'reason_code': 'dedupe_unavailable'}, trace=['dedupe_lookup', 'refuse'])
        elif w.semantic(cand) == w.semantic(original['events_appended'][0]):
            run.update(result=copy.deepcopy(original['result']), trace=['dedupe_lookup', 'return_original'])
        else:
            run.update(result={'kind': 'refused', 'reason_code': 'idempotency_conflict'}, trace=['dedupe_lookup', 'refuse'])
        return record
    if kind == 'submit':
        cmd = run['command']
        run.update(record_created=False, registry_tombstone=cmd == 'remove_project_from_list', submitted=None)
        if cmd == 'cmd.chat.delete':
            run['submitted'] = {'scope': 'thread', 'thread_id': deletion['thread_id'], 'project_id': deletion['project_id']}
        elif cmd == 'cmd.project.delete_data' and run['facts'].get('confirmed') is True and deletion['project_id'] is not None:
            run['submitted'] = {'scope': 'project_data', 'thread_id': None, 'project_id': deletion['project_id']}
        return record
    if kind == 'history_read':
        f = run['facts']
        run['result'] = {'status': 'available', 'event_ids': [e for e in f['source_event_ids'] if e in f['family_event_ids']]} \
            if f['coverage_complete'] and f['token_verified'] else {'status': 'unavailable', 'event_ids': None}
        return record
    if kind == 'canonical_read':
        run['facts']['record'] = copy.deepcopy(record)
        run['result'] = {'authority': 'storage_deletion_record', 'state': record['purge_state'], 'hide_ref': record['logical_hide_receipt_ref']}
        return record
    if kind == 'withdraw':
        run.update(trace=['writer_cutoff', 'drain_obligations', 'fence_reader'], content_effects=[],
                   obligations=[[o['event_id'], 'resolve_original_receipt' if o['commit_frame_durable'] else 'fence'] for o in run['facts']['obligations']],
                   kept=copy.deepcopy(run['facts']['custody']), reader='fenced_tokens_invalidated')
        return record
    if kind == 'restore':
        f = run['facts']
        run.update(trace=['restore_boundary', 'replay_tombstones', 'visibility'],
                   visible=[x for x in f['backup_subjects'] if x not in f['tombstoned_subjects']],
                   backup_bytes_retained=f['held'] or f['backup_age_seconds'] <= BACKUP_SECONDS,
                   kept=['writer_cutoff', 'original_results'])
        return record
    raise ValueError(kind)


def scenario(case, scope, specs):
    case['sl'] = {'family': DEL, 'deletion': deletion_of(case, scope), 'runs': []}
    record = None
    for spec in specs:
        run = copy.deepcopy(spec); run.setdefault('facts', facts())
        if run['kind'] in ('transition', 'retry', 'crash'):
            run.setdefault('seen', record['purge_state'] if record else 'initial')
        case['sl']['runs'].append(run)
        record = simulate(case, run, record)
    return case


def T(to, **change):
    return {'kind': 'transition', 'to': to, 'facts': facts(**change)}


GEN = {'generation': 4, 'verified': True, 'committed': True}


def happy(scope):
    """Opening, every ordinary edge, passive and canonical reads, replay variants, withdrawal and restore."""
    specs = [{'kind': 'submit', 'command': 'cmd.chat.delete' if scope == 'thread' else 'cmd.project.delete_data', 'facts': {'confirmed': True}},
             T('requested'), T('logically_hidden'), T('purge_pending', pending_generation=4), T('purged', successor=GEN)]
    specs += [{'kind': 'canonical_read', 'consumer': c, 'facts': {}} for c in ('navigation_hide', 'compaction', 'tombstone_replay')]
    return specs


def tail(case):
    """Reads, replay variants, withdrawal and restore after the deletion runs (they need the appended ids)."""
    runs = case['sl']['runs']
    appended = [i for i, r in enumerate(runs) if r.get('decision') == 'appended']
    first = appended[0]; event = runs[first]['events_appended'][0]
    family_ids = [runs[i]['events_appended'][0]['event_id'] for i in appended]
    source_ids = ['other-family-event'] + family_ids[:2] + ['other-family-event-2'] + family_ids[2:]
    moved = dict(copy.deepcopy(event), sequence_id=99, observed_at_utc='2026-11-14T13:00:00Z')
    changed = copy.deepcopy(event); changed['payload']['actor_ref'] = 'actor-B'
    history = lambda complete, token, ids_: {'coverage_complete': complete, 'token_verified': token,
                                             'source_event_ids': ids_, 'family_event_ids': family_ids}
    specs = [{'label': 'history', 'kind': 'history_read', 'facts': history(True, True, source_ids)},
             {'label': 'history-partial', 'kind': 'history_read', 'facts': history(False, True, source_ids[:2])},
             {'label': 'history-token', 'kind': 'history_read', 'facts': history(True, False, source_ids)},
             {'label': 'replay', 'kind': 'replay', 'of': first, 'candidate': copy.deepcopy(event), 'facts': {'dedupe_available': True}},
             {'label': 'replay-moved', 'kind': 'replay', 'of': first, 'candidate': moved, 'facts': {'dedupe_available': True}},
             {'label': 'conflict', 'kind': 'replay', 'of': first, 'candidate': changed, 'facts': {'dedupe_available': True}},
             {'label': 'dedupe-unavailable', 'kind': 'replay', 'of': first, 'candidate': copy.deepcopy(event), 'facts': {'dedupe_available': False}},
             {'label': 'replay-only', 'kind': 'replay', 'of': first, 'candidate': dict(copy.deepcopy(event), replay_policy='projector_replay_only'),
              'facts': {'dedupe_available': True}},
             {'label': 'withdraw', 'kind': 'withdraw', 'facts': {'obligations': [{'event_id': 'pending-durable', 'commit_frame_durable': True},
                                                                                {'event_id': 'pending-open', 'commit_frame_durable': False}],
                                                                'custody': {'records': 1, 'tombstones': 1, 'receipts': len(family_ids)}}},
             {'label': 'restore', 'kind': 'restore', 'facts': {'backup_subjects': ['thread-A', 'thread-B'], 'tombstoned_subjects': ['thread-A'],
                                                              'held': False, 'backup_age_seconds': BACKUP_SECONDS}},
             {'label': 'restore-old', 'kind': 'restore', 'facts': {'backup_subjects': ['thread-A'], 'tombstoned_subjects': ['thread-A'],
                                                                  'held': False, 'backup_age_seconds': BACKUP_SECONDS + 1}},
             {'label': 'restore-held', 'kind': 'restore', 'facts': {'backup_subjects': ['thread-A'], 'tombstoned_subjects': ['thread-A'],
                                                                   'held': True, 'backup_age_seconds': BACKUP_SECONDS * 3}}]
    record = runs[appended[-1]]['record_after']
    for spec in specs:
        run = copy.deepcopy(spec); runs.append(run); simulate(case, run, record)
    return case


def label_index(value, label):
    return next(i for i, r in enumerate(value['sl']['runs']) if r.get('label') == label)


def augment(control):
    """The common control carries one complete thread (app) or Project-data (project) deletion."""
    scope = 'thread' if control['source']['project_id'] is None else 'project_data'
    tail(scenario(control, scope, happy(scope)))


REFUSALS = [
    ('requested-to-purge-pending', 'requested', T('purge_pending'), 'schema'),
    ('hidden-to-purged', 'logically_hidden', T('purged', successor=GEN), 'schema'),
    ('failed-without-reason', 'logically_hidden', T('failed'), 'schema'),
    ('reason-on-hidden', 'requested', T('logically_hidden', failure_reason='x'), 'schema'),
    ('stale-view', 'logically_hidden', dict(T('purge_pending'), seen='requested'), 'record'),
    ('obligation-pending', 'logically_hidden', T('purge_pending', obligation_pending=True), 'record'),
    ('ambiguous-reachability', 'logically_hidden', T('purge_pending', reachability='ambiguous'), 'scope'),
    ('cross-project', 'requested', T('logically_hidden', reachability='cross_project'), 'scope'),
    ('scope-not-current', 'logically_hidden', T('purge_pending', scope_current=False), 'scope'),
    ('purge-with-blocker', 'logically_hidden', T('purge_pending', holds=['hold-A']), 'holds'),
    ('held-without-blocker', 'logically_hidden', T('held'), 'holds'),
    ('missing-tombstone', 'requested', T('logically_hidden', tombstone=False), 'tombstone'),
    ('missing-hide', 'requested', T('logically_hidden', hide=False), 'tombstone'),
    ('no-writer', 'requested', T('logically_hidden', writer=False), 'authority'),
    ('no-maintenance', 'logically_hidden', T('purge_pending', maintenance=False), 'authority'),
    ('ui-purge-without-generation', 'purge_pending', T('purged'), 'generation'),
    ('secret-in-tombstone', 'requested', T('logically_hidden', payload_secret=True), 'schema'),
    ('viewer-storage', 'requested', T('logically_hidden', storage_mode='viewer'), 'authority'),
    ('blocked-storage', 'logically_hidden', T('purge_pending', storage_mode='blocked'), 'authority'),
    ('retention-authority-unavailable', 'logically_hidden', T('purge_pending', family_authority=False), 'authority'),
    ('mtime-selected-generation', 'purge_pending', T('purged', successor=dict(GEN, selected_by='newest_mtime')), 'generation'),
    ('unverified-generation', 'purge_pending', T('purged', successor={'generation': 4, 'verified': False, 'committed': True}), 'generation'),
    ('uncommitted-generation', 'purge_pending', T('purged', successor={'generation': 4, 'verified': True, 'committed': False}), 'generation'),
]
PATHS = {'requested': [T('requested')], 'logically_hidden': [T('requested'), T('logically_hidden')],
         'purge_pending': [T('requested'), T('logically_hidden'), T('purge_pending')]}


def cases():
    import pm_s3bo_cases as c
    controls = []; negatives = []
    R = lambda i, *path: ('sl', 'runs', i) + path

    def build(label, project, scope, specs, with_tail=False):
        value = w.build(DEL, project); scenario(value, scope, specs)
        if with_tail:
            tail(value)
        control = s.control(DEL, label, value); controls.append(control)
        return control, value

    # Complete Project-data deletion through the held branch, with the canonical and tail reads.
    held, hv = build('project-held', w.PROJECT, 'project_data',
                     [{'kind': 'submit', 'command': 'cmd.project.delete_data', 'facts': {'confirmed': True}},
                      T('requested'), T('logically_hidden'), T('held', holds=['hold-A', 'hold-B']),
                      T('purge_pending'), T('purged', successor=GEN)]
                     + [{'label': c_, 'kind': 'canonical_read', 'consumer': c_, 'facts': {}}
                        for c_ in ('navigation_hide', 'compaction', 'tombstone_replay')], True)
    runs = hv['sl']['runs']; A = lambda label: label_index(hv, label)
    deletion = hv['sl']['deletion']
    for row, path, replacement, label in [
            ('sl_del_decision', R(3, 'decision'), 'refused', 'held-refused'),
            ('sl_del_record', R(3, 'record_after', 'hold_blocker_refs'), [], 'held-drops-blockers'),
            ('sl_del_record', R(5, 'record_after', 'compaction_generation'), 3, 'purged-other-generation'),
            ('sl_del_record', R(2, 'record_after', 'logical_hide_receipt_ref'), 'tombstone-A', 'hide-receipt-not-recorded'),
            ('sl_del_record', R(4, 'record_after', 'event_refs'), runs[3]['record_after']['event_refs'], 'event-not-in-event-refs'),
            ('sl_del_order', R(2, 'trace'), STEP[:2] + ['projection_hide', 'barrier_append', 'first_receipt', 'result'], 'hide-before-append'),
            ('sl_del_order', R(4, 'trace'), STEP[:3] + ['purge_dispatch', 'first_receipt', 'result'], 'purge-before-receipt'),
            ('sl_del_order', R(1, 'trace'), ['record_cas_and_obligation', 'admission'] + STEP[2:] + ['result'], 'cas-before-admission'),
            ('sl_del_order', R(5, 'trace'), STEP + ['result', 'first_receipt'], 'result-before-receipt'),
            ('sl_del_effects', R(3, 'effects'), ['hold_clear'], 'step-clears-hold'),
            ('sl_del_effects', R(4, 'effects'), [], 'purge-not-dispatched'),
            ('sl_del_effects', R(5, 'effects'), ['purge_dispatch'], 'second-purge-dispatch'),
            ('sl_del_payload', R(3, 'events_appended', 0, 'payload', 'hold_blockers'), ['hold-A'], 'payload-hides-blocker'),
            ('sl_del_payload', R(5, 'events_appended', 0, 'payload', 'compaction_generation'), 5, 'payload-other-generation'),
            ('sl_del_payload', R(2, 'events_appended', 0, 'payload', 'tombstone_ref'), 'tombstone-B', 'payload-other-tombstone'),
            ('sl_del_payload', R(3, 'events_appended', 0, 'payload', 'compaction_generation'), 4, 'held-carries-generation'),
            ('sl_del_payload', R(1, 'events_appended'), [runs[1]['events_appended'][0]] * 2, 'duplicate-append'),
            ('sl_del_identity', R(4, 'events_appended', 0, 'event_id'), ids(deletion, 3)[0], 'reused-ordinal'),
            ('sl_del_identity', R(4, 'events_appended', 0, 'idempotency_key'), 'application@1:' + ids(deletion, 4)[1].split(':', 1)[1], 'application-key-format'),
            ('sl_del_envelope', R(2, 'events_appended', 0, 'thread_id'), 'thread-A', 'project-data-names-thread'),
            ('sl_del_envelope', R(2, 'events_appended', 0, 'run_id'), 'run-A', 'run-not-null'),
            ('sl_del_envelope', R(2, 'events_appended', 0, 'project_id'), None, 'project-event-null-project'),
            ('sl_del_handler', R(0, 'events_appended'), [runs[1]['events_appended'][0]], 'handler-appends'),
            ('sl_del_handler', R(0, 'effects'), ['purge_dispatch'], 'handler-purges'),
            ('sl_del_handler', R(0, 'record_created'), True, 'handler-writes-record'),
            ('sl_del_reader', R(A('history-partial'), 'result'), {'status': 'available', 'event_ids': []}, 'partial-coverage-empty-history'),
            ('sl_del_reader', R(A('history-token'), 'result', 'status'), 'available', 'unverified-token-discloses'),
            ('sl_del_reader', R(A('history'), 'result', 'event_ids'), runs[A('history')]['result']['event_ids'] + ['other-family-event'], 'other-family-in-history'),
            ('sl_del_reader', R(A('history'), 'effects'), ['checkpoint_advance'], 'reader-advances-checkpoint'),
            ('sl_del_reader', R(A('navigation_hide'), 'result', 'authority'), 'event_record', 'navigation-reads-event'),
            ('sl_del_reader', R(A('compaction'), 'result', 'state'), 'logically_hidden', 'compaction-reads-stale-state'),
            ('sl_del_reader', R(A('tombstone_replay'), 'effects'), ['purge_dispatch'], 'tombstone-replay-dispatches'),
            ('sl_del_replay', R(A('replay'), 'events_appended'), [runs[1]['events_appended'][0]], 'replay-appends'),
            ('sl_del_replay', R(A('replay-moved'), 'result'), {'kind': 'refused', 'reason_code': 'idempotency_conflict'}, 'storage-fields-conflict'),
            ('sl_del_replay', R(A('conflict'), 'result'), runs[1]['result'], 'changed-digest-replays'),
            ('sl_del_replay', R(A('dedupe-unavailable'), 'result', 'reason_code'), 'idempotency_conflict', 'dedupe-unavailable-as-conflict'),
            ('sl_del_replay', R(A('replay-only'), 'trace'), ['dedupe_lookup', 'reject_replay_only'], 'replay-only-after-lookup'),
            ('sl_del_replay', R(A('replay'), 'effects'), ['projection_hide'], 'replay-repeats-hide'),
            ('sl_del_withdrawal', R(A('withdraw'), 'obligations', 0, 1), 'fence', 'durable-obligation-fenced'),
            ('sl_del_withdrawal', R(A('withdraw'), 'obligations', 1, 1), 'append', 'open-obligation-appended'),
            ('sl_del_withdrawal', R(A('withdraw'), 'content_effects'), ['unhide'], 'withdrawal-unhides'),
            ('sl_del_withdrawal', R(A('withdraw'), 'kept', 'tombstones'), 0, 'withdrawal-drops-tombstone'),
            ('sl_del_withdrawal', R(A('withdraw'), 'reader'), 'active', 'reader-not-fenced'),
            ('sl_del_withdrawal', R(A('withdraw'), 'trace'), ['drain_obligations', 'writer_cutoff', 'fence_reader'], 'drain-before-cutoff'),
            ('sl_del_restore', R(A('restore'), 'visible'), ['thread-A', 'thread-B'], 'restore-shows-deleted'),
            ('sl_del_restore', R(A('restore'), 'trace'), ['restore_boundary', 'visibility', 'replay_tombstones'], 'visible-before-replay'),
            ('sl_del_restore', R(A('restore-old'), 'backup_bytes_retained'), True, 'backup-kept-past-30d'),
            ('sl_del_restore', R(A('restore-held'), 'backup_bytes_retained'), False, 'held-backup-dropped'),
            ('sl_del_restore', R(A('restore'), 'backup_bytes_retained'), False, 'backup-dropped-at-30d'),
            ('sl_del_restore', R(A('restore'), 'kept'), ['original_results'], 'restore-drops-cutoff')]:
        negatives.append(c.mutate(held, row, path, replacement, label))
    # Thread deletion in a Project with failure, retry and a second purge failure.
    retry, rv = build('thread-failed-retry', w.PROJECT, 'thread',
                      [{'kind': 'submit', 'command': 'cmd.chat.delete', 'facts': {}},
                       T('requested'), T('logically_hidden'), T('failed', failure_reason='purge worker crashed'),
                       {'kind': 'retry', 'to': RETRY_SUCCESSOR, 'facts': facts()},
                       T('purge_pending', pending_generation=None), T('failed', failure_reason='compaction lease lost'),
                       {'kind': 'retry', 'to': RETRY_SUCCESSOR, 'facts': facts()},
                       T('purge_pending', pending_generation=7), T('purged', successor={'generation': 7, 'verified': True, 'committed': True}),
                       {'kind': 'submit', 'command': 'remove_project_from_list', 'facts': {}},
                       {'kind': 'submit', 'command': 'cmd.project.delete_data', 'facts': {'confirmed': False}}])
    for row, path, replacement, label in [
            ('sl_del_retry', R(4, 'ordinal'), 3, 'retry-reuses-failed-ordinal'),
            ('sl_del_retry', R(4, 'deletion_id'), 'del_' + 'e' * 64, 'retry-new-lifecycle'),
            ('sl_del_retry', R(4, 'request_key'), 'request-retry-A', 'retry-new-request-identity'),
            ('sl_del_retry', R(7, 'revalidated'), ['holds', 'tombstone', 'scope', 'writer'], 'retry-skips-purge-authority'),
            ('sl_del_retry', R(7, 'revalidated'), [], 'retry-without-revalidation'),
            ('sl_del_payload', R(3, 'events_appended', 0, 'payload', 'failure_reason'), 'other reason', 'failure-reason-substituted'),
            ('sl_del_record', R(6, 'record_after', 'purge_state'), 'purge_pending', 'failure-not-recorded'),
            ('sl_del_envelope', R(2, 'events_appended', 0, 'thread_id'), None, 'thread-deletion-null-thread'),
            ('sl_del_handler', R(10, 'registry_tombstone'), False, 'remove-from-list-not-registry'),
            ('sl_del_handler', R(10, 'submitted'), {'scope': 'project_data', 'thread_id': None, 'project_id': w.PROJECT}, 'remove-from-list-deletes'),
            ('sl_del_handler', R(11, 'submitted'), {'scope': 'project_data', 'thread_id': None, 'project_id': w.PROJECT}, 'unconfirmed-project-delete'),
            ]:
        negatives.append(c.mutate(retry, row, path, replacement, label))
    # Shared number and date-time calls at the boundary slots, every copy changed together.
    def copies(value, label, row, change, defect):
        changed = copy.deepcopy(value); change(changed)
        negatives.append(c.negative(held, row, label, changed, defect))
    def gen(v, x):
        r = v['sl']['runs'][5]; r['facts']['successor']['generation'] = x; r['record_after']['compaction_generation'] = x
        r['events_appended'][0]['payload']['compaction_generation'] = x
    def req(v, x):
        v['sl']['deletion']['requested_at_utc'] = x
        for r in v['sl']['runs']:
            if isinstance(r.get('record_after'), dict):
                r['record_after']['requested_at_utc'] = x
    def ddl(v, x):
        v['sl']['deletion']['purge_deadline_utc'] = x
        for r in v['sl']['runs']:
            for e in r.get('events_appended') or []:
                e['payload']['purge_deadline_utc'] = x
    copies(hv, 'generation-negative', 'sl_del_numbers', lambda v: gen(v, -1), {'copies': 'fact, record, payload', 'value': -1})
    copies(hv, 'generation-boolean', 'sl_del_numbers', lambda v: gen(v, True), {'copies': 'fact, record, payload', 'value': True})
    copies(hv, 'generation-fraction', 'sl_del_numbers', lambda v: gen(v, 4.5), {'copies': 'fact, record, payload', 'value': 4.5})
    copies(hv, 'request-offset', 'sl_del_time', lambda v: req(v, '2026-11-14T12:00:00+00:00'), {'copies': 'deletion and records', 'profile': 'storage_utc_z'})
    copies(hv, 'request-impossible', 'sl_del_time', lambda v: req(v, '2026-02-30T12:00:00Z'), {'copies': 'deletion and records'})
    copies(hv, 'deadline-impossible', 'sl_del_time', lambda v: ddl(v, '2026-02-30T12:00:00Z'), {'copies': 'deletion and payloads'})
    late = copy.deepcopy(rv); late['sl']['deletion']['purge_deadline_utc'] = '2026-11-15T12:00:01Z'
    for r in late['sl']['runs']:
        for e in r.get('events_appended') or []:
            e['payload']['purge_deadline_utc'] = '2026-11-15T12:00:01Z'
    negatives.append(c.negative(retry, 'sl_del_deadline', 'deadline-past-24h', late, {'copies': 'deletion and every event payload', 'value': '24h + 1 s'}))
    # Retry bypass and a held-to-failed attempt are refusals at the edge stage.
    bypass, bv = build('retry-bypass', None, 'thread',
                       [T('requested'), T('logically_hidden'), T('failed', failure_reason='hide index unavailable'),
                        {'kind': 'retry', 'to': 'purge_pending', 'facts': facts()},
                        {'kind': 'retry', 'to': 'purged', 'facts': facts(successor=GEN)}])
    negatives.append(c.mutate(bypass, 'sl_del_decision', R(3, 'decision'), 'appended', 'retry-bypass-admitted'))
    negatives.append(c.mutate(bypass, 'sl_del_zero', R(4, 'trace'), STEP + ['result'], 'retry-bypass-runs-steps'))
    for label, path_state, spec, want in REFUSALS:
        specs = PATHS[path_state] + [spec]
        control, value = build('refuse-' + label, None, 'thread', specs)
        i = len(specs) - 1
        negatives.append(c.mutate(control, 'sl_del_decision', R(i, 'stage'), 'record' if want != 'record' else 'scope', 'other-stage'))
        negatives.append(c.mutate(control, 'sl_del_zero', R(i, 'effects'), ['purge_dispatch'] if want != 'tombstone' else ['projection_hide'], 'refusal-effect'))
    held_failed, _ = build('held-to-failed', None, 'thread',
                           [T('requested'), T('logically_hidden'), T('held', holds=['hold-A']), T('failed', failure_reason='x', holds=['hold-A'])])
    negatives.append(c.mutate(held_failed, 'sl_del_zero', R(3, 'record_after', 'purge_state'), 'failed', 'held-recorded-failed'))
    purged_out, _ = build('out-of-purged', None, 'thread',
                          [T('requested'), T('logically_hidden'), T('purge_pending'), T('purged', successor=GEN), T('failed', failure_reason='x')])
    negatives.append(c.mutate(purged_out, 'sl_del_zero', R(4, 'events_appended'), [{'event_id': 'x'}], 'purged-successor-appends'))
    # Crash cuts at each step of the hide and the purge transitions.
    for to, path in (('logically_hidden', PATHS['requested']), ('purge_pending', PATHS['logically_hidden'])):
        for at in STEP[1:]:
            specs = path + [{'kind': 'crash', 'to': to, 'crash_at': at, 'facts': facts()}, {'kind': 'resume', 'of': len(path), 'facts': {}}]
            control, value = build('crash-' + to + '-' + at, None, 'thread', specs)
            i = len(path) + 1
            negatives.append(c.mutate(control, 'sl_del_resume', R(i, 'events_appended'), [copy.deepcopy(value['sl']['runs'][i - 1]['obligation'])] * (1 if at == 'barrier_append' or at == 'first_receipt' else 2), 'resume-second-append'))
            negatives.append(c.mutate(control, 'sl_del_resume', R(i, 'effects'), EFFECT[to] * 2, 'resume-repeats-effect'))
            negatives.append(c.mutate(control, 'sl_del_resume', R(i, 'trace'), ['admission'] + value['sl']['runs'][i]['trace'], 'resume-reruns-admission'))
            if at == 'record_cas_and_obligation':
                frozen = copy.deepcopy(value['sl']['runs'][i - 1]['obligation']); frozen['occurred_at_utc'] = '2026-11-14T12:30:00Z'
                negatives.append(c.mutate(control, 'sl_del_resume', R(i, 'events_appended'), [frozen], 'resume-recaptures-obligation'))
    return controls, negatives


def corpus_slots(control):
    """The generation copies of the purge step and, for Project-data deletions, the request time and deadline copies.

    A thread deletion's deadline is bounded by its request time (sl_del_deadline),
    so moving either slot alone there would be an owner-bound refusal rather than
    a pure slot-domain case; the Project-data controls carry the date-time corpus.
    """
    value = control['value']; runs = s.runs_of(value, DEL) or []
    for i, r in enumerate(runs):
        if r.get('decision') == 'appended' and r['to'] == 'purged':
            yield {'paths': [('sl', 'runs', i, 'facts', 'successor', 'generation'),
                             ('sl', 'runs', i, 'record_after', 'compaction_generation'),
                             ('sl', 'runs', i, 'events_appended', 0, 'payload', 'compaction_generation')],
                   'kind': 'integer', 'row': 'sl_del_numbers', 'bounds': {'minimum': 0}, 'downstream': False,
                   'container_row': 'sl_del_numbers', 'null_rows': ['sl_del_decision', 'sl_del_zero']}
            break
    if not runs or value['sl']['deletion']['thread_id'] is not None:
        return
    deadline = [('sl', 'deletion', 'purge_deadline_utc')] + [('sl', 'runs', i, 'events_appended', j, 'payload', 'purge_deadline_utc')
                                                            for i, r in enumerate(runs) for j, _e in enumerate(r.get('events_appended') or [])]
    yield {'paths': deadline, 'kind': 'datetime', 'row': 'sl_del_time', 'profile': w.EVENT_RECORD, 'type_rows': ['sl_del_time']}
    requested = [('sl', 'deletion', 'requested_at_utc')] + [('sl', 'runs', i, 'record_after', 'requested_at_utc')
                                                            for i, r in enumerate(runs) if isinstance(r.get('record_after'), dict)]
    yield {'paths': requested, 'kind': 'datetime', 'row': 'sl_del_time', 'profile': w.STORAGE_UTC_Z, 'type_rows': ['sl_del_time']}


def evidence(out):
    """Constructor self-check: every owner-derived payload and record validates under its complete schema."""
    import pm_s3bo_cases as c
    controls, _ = c.cases(); checked = 0; bad = []
    for control in controls:
        runs = s.runs_of(control['value'], DEL)
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
                    bad.append((control['id'], i, 'record'))
    return {'status': 'pass' if checked and not bad else 'fail', 'family': DEL, 'checked': checked, 'schema_failures': bad,
            'meaning': 'Every presented control payload and deletion record keeps the complete registered schema; the equality rows then compare exact owner-derived values.'}
