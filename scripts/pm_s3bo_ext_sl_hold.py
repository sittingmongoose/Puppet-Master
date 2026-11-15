"""C12-SL: storage.retention_hold_changed complete legal-hold boundary.

Owner clauses: Holds and recovery anchors (union, never automatic clear), the
Legal-hold transition custody and passive history section with SP-288
(protected command admission, legal_hold-only producer, scope and lifetime,
HoldV2 phases with one set and at most one clear, the hold-transition binding,
evt_hold_ identity, logical receipt, OwnerResult, immutable set/clear cores,
same-row SIR custody and its non-regressing acknowledgement, pending
admission -> barrier append -> terminal publication, first-receipt crash cuts,
whole-row restore without first-mint, legacy v1 admission, passive history and
original command replay), SP-2208 (fresh admission after a verified restore),
SIR-047, CV-333 and the K37 retention-hold oracles.

The identity recipes are cross-checked against the owner fixtures in
Plans/storage_retention_hold_contract_fixtures.json by evidence(). The
boundary record (`case['sl']`) holds the hold's independently held request,
target and SIR facts and every run. Expected outcomes are derived here from
those inputs by the owner rules. Native execution remains NOT_RUN.
"""
import copy

import pm_s3bo_oracles as w
import pm_s3bo_sl_common as s

LANE = 'sl'
HOLD = 'storage.retention_hold_changed'
FAMILIES = (HOLD,)
DOMAIN = 'pm.storage.legal_hold_transition.v2'
FIXTURES = w.read_json('Plans/storage_retention_hold_contract_fixtures.json')
PROTECTIVE = ('set_pending', 'held', 'clear_pending')
PROGRESS = {'accepted': 0, 'acknowledged': 1, 'executing': 2}
STAGES = ('arguments', 'writer', 'versions', 'sir', 'restore', 'permission', 'reason', 'target', 'expected_hash', 'preimage')
PENDING = ['capture_fence', 'authenticate_sir_and_storage', 'derive_intent', 'admit_pending_row']
FINISH = ['reauthenticate', 'capture_acknowledgement', 'barrier_append', 'first_receipt', 'stage_result',
          'terminal_commit', 'readback', 'publish']
PAYLOAD_SCHEMA = w.schema_for(HOLD)

ROWS = [
    ('sl_hold_admission', 'sl_hold', 'equal', 'Each command is refused at the first failing admission condition (writer, installed versions, authenticated SIR, post-restore acceptance, permission, reason, resolved target with canonical refs and exact scope, expected core hash, set absence or active legal-hold preimage); otherwise it replays, conflicts, stays pending or commits.'),
    ('sl_hold_zero', 'sl_hold', 'equal', 'A refusal, conflict or replay appends nothing, leaves the whole hold row unchanged and takes no hold action.'),
    ('sl_hold_identity', 'sl_hold', 'equal', 'Transition id, evt_hold_ event id, idempotency key and logical receipt follow the SP-288 recipes over the original request, target and preimage core.'),
    ('sl_hold_event', 'sl_hold', 'equal', 'The appended EventRecord equals the original producer intent: action, actor, reason, accepted time, held-target policy, anchor and affected refs, receipt, Project only for Project scope.'),
    ('sl_hold_core', 'sl_hold', 'equal', 'Set creates the immutable set core; clear preserves every set field and adds only its clear fields and event; other holds are untouched.'),
    ('sl_hold_phase', 'sl_hold', 'equal', 'Phases run set_pending -> held and clear_pending -> cleared, pending stays protective, a cleared id is terminal, one set and at most one clear.'),
    ('sl_hold_result', 'sl_hold', 'equal', 'The OwnerResult binds command, key, action, status, event, receipt and committed core hash, and SIR success is published only after committed readback.'),
    ('sl_hold_order', 'sl_hold', 'equal', 'Fence capture and pending admission precede acknowledgement capture, the single barrier append, first receipt, terminal commit, readback and publication.'),
    ('sl_hold_sir', 'sl_hold', 'equal', 'A later SIR observation advances only the current source, never regresses progress or time, keeps the original source, and an unacknowledged command cannot append.'),
    ('sl_hold_union', 'sl_hold', 'equal', 'A target is protected while any set_pending, held or clear_pending hold names it; clearing one hold never releases another and nothing clears automatically.'),
    ('sl_hold_resume', 'sl_hold', 'equal', 'After first-receipt issuance the original receipt finishes the operation without another append; ambiguous existence and failed commits stay pending and protective with no success.'),
    ('sl_hold_restore', 'sl_hold', 'equal', 'A restored pending intent resolves only an exact surviving receipt and never first-mints; a new operation needs a command accepted after the post-restore session opened.'),
    ('sl_hold_history', 'sl_hold', 'equal', 'History reports current protection from the same-snapshot row, not from a historical set event, returns unavailable for a missing slot and has no effect.'),
    ('sl_hold_legacy', 'sl_hold', 'equal', 'A legacy v1 legal hold is admitted with its original core hash and a null original set receipt; its later clear emits only the clear event.'),
    ('sl_hold_numbers', 'sl_hold', 'error', 'First-receipt integer slots use shared storage_uint64.'),
    ('sl_hold_time', 'sl_hold', 'error', 'SIR capture times use the EventRecord date-time profile.'),
]


# ---------------------------------------------------------------- owner rules

def partition(args):
    return w.partition(args.get('project_id') if args['scope_kind'] == 'project' else None)


def hold_key(args):
    return 'retention_hold_record.v1:' + partition(args) + ':' + args['hold_id']


def transition_id(request, target, preimage):
    return 'hold-transition:' + s.bdig({'domain': DOMAIN, 'request': request, 'target': target,
                                       'preimage_core_sha256': s.hmp(preimage) if preimage is not None else None})


def receipt_ref(args):
    return 'pm.storage.hold_receipt.v2:' + s.sha(hold_key(args).encode()) + ':' + args['action']


def ids_of(request, target, preimage):
    tid = transition_id(request, target, preimage)
    return {'transition_id': tid, 'event_id': 'evt_hold_' + tid.split(':', 1)[1],
            'idempotency_key': HOLD + ':' + tid, 'receipt_ref': receipt_ref(request['arguments'])}


def expected_event(base, request, target, preimage):
    a = request['arguments']; i = ids_of(request, target, preimage)
    e = {k: None for k in w.read_json('Plans/event_record.schema.json')['required']}
    e.update(schema_id='pm.event.v0', schema_version='2.0.0', event_id=i['event_id'], event_type=HOLD, scope_kind=a['scope_kind'],
             project_id=a.get('project_id'), actor_ref=request['actor_ref'], occurred_at_utc=request['accepted_at_utc'],
             correlation_id=request['command_instance_id'], idempotency_key=i['idempotency_key'],
             payload_schema_id=w.FAMILY[HOLD]['payload_schema_id'], redaction_profile='no_secrets', replay_policy='dedupe_by_idempotency_key',
             migration={k: None for k in ('migrated_from_schema_id', 'migrated_from_schema_version', 'migration_id', 'compatibility_event_type')})
    p = {'schema_version': '1.0.0', 'hold_id': a['hold_id'], 'scope_ref': target['scope_ref'], 'action': a['action'],
         'actor_ref': request['actor_ref'], 'reason': a['reason'], 'occurred_at_utc': request['accepted_at_utc'],
         'policy_ref': target['policy_ref'], 'anchor_ref': target['anchor_ref'],
         'affected_semantic_refs': list(target['affected_semantic_refs']), 'receipt_ref': i['receipt_ref']}
    if a['scope_kind'] == 'project':
        p['project_id'] = a['project_id']
    e['payload'] = p
    for k in ('sequence_id', 'observed_at_utc', 'persisted_at_utc'):
        e.pop(k, None)
    return e


def after_core(request, target, preimage, event_id):
    a = request['arguments']
    if a['action'] == 'set':
        core = {'schema_id': 'pm.storage_value.retention_hold_record.v1', 'schema_version': '1.0.0', 'hold_id': a['hold_id'],
                'hold_kind': 'legal_hold', 'scope': copy.deepcopy(target['scope']), 'set_by_actor_ref': request['actor_ref'],
                'set_reason': a['reason'], 'set_at_utc': request['accepted_at_utc'], 'cleared_by_actor_ref': None,
                'clear_reason': None, 'cleared_at_utc': None, 'event_refs': [], 'redaction_profile': 'no_secrets'}
    else:
        core = copy.deepcopy(preimage)
        core.update(cleared_by_actor_ref=request['actor_ref'], clear_reason=a['reason'], cleared_at_utc=request['accepted_at_utc'])
    core['event_refs'] = list(core['event_refs']) + [event_id]
    return core


def pending_core(request, target, preimage):
    """set_pending carries the set core without a promised event ref; clear_pending keeps the active core."""
    if request['arguments']['action'] == 'set':
        core = after_core(request, target, None, 'x'); core['event_refs'] = []
        return core
    return copy.deepcopy(preimage)


def owner_result(request, target, preimage, core):
    a = request['arguments']; i = ids_of(request, target, preimage)
    return {'schema_id': 'pm.storage.legal_hold_result.v1', 'schema_version': '1.0.0', 'command_instance_id': request['command_instance_id'],
            'hold_key': hold_key(a), 'hold_id': a['hold_id'], 'action': a['action'], 'status': 'held' if a['action'] == 'set' else 'cleared',
            'event_ref': i['event_id'], 'receipt_ref': i['receipt_ref'], 'core_sha256': s.hmp(core)}


def active(core):
    clear = [core.get(k) for k in ('cleared_by_actor_ref', 'clear_reason', 'cleared_at_utc')]
    return all(x is None for x in clear)


def target_ok(args, target):
    if not isinstance(target, dict) or target['scope_ref'] != args['semantic_scope_ref']:
        return False
    refs = target['affected_semantic_refs']
    if refs != sorted(set(refs), key=lambda x: x.encode()):
        return False
    scope = target['scope']
    if args['scope_kind'] == 'application':
        return 'project_id' not in args and scope.get('project_id') is None and all(v is None for k, v in scope.items() if k != 'scope_kind')
    return bool(args.get('project_id')) and scope.get('project_id') == args['project_id']


def outcome(row, run):
    """(decision, stage) over independently held facts; decision is refused|replayed|pending|committed."""
    f = run['facts']; request = run['request']; a = request['arguments']; target = f['target']
    if a.get('action') not in ('set', 'clear'):
        return 'refused', 'arguments'
    for name, good in (('writer', f['writer']), ('versions', f['versions']), ('sir', f['sir']),
                       ('restore', not f.get('post_restore') or f.get('accepted_after_session') is True),
                       ('permission', f['permission']), ('reason', isinstance(a.get('reason'), str) and a['reason'] != ''),
                       ('target', target_ok(a, target))):
        if not good:
            return 'refused', name
    core = row.get('core')
    if 'expected_hold_sha256' in a and (core is None or a['expected_hold_sha256'] != s.hmp(core)):
        return 'refused', 'expected_hash'
    slot = row.get(a['action'])
    if slot is not None:
        return ('replayed', None) if s.cj(slot['request']) == s.cj(request) else ('refused', 'idempotency_conflict')
    if a['action'] == 'set':
        if row.get('phase') is not None or not f.get('absence_proven'):
            return 'refused', 'preimage'
    else:
        if (row.get('phase') != 'held' or core is None or core.get('hold_kind') != 'legal_hold' or not active(core)
                or core['scope'] != target['scope'] or core['hold_id'] != a['hold_id']):
            return 'refused', 'preimage'
    return ('pending', None) if f['ack'] == 'accepted' else ('committed', None)


def committed_row(row, request, target, preimage):
    a = request['arguments']; i = ids_of(request, target, preimage)
    out = copy.deepcopy(row)
    core = after_core(request, target, preimage, i['event_id'])
    out['phase'] = 'held' if a['action'] == 'set' else 'cleared'
    out['core'] = core
    out[a['action']] = {'request': copy.deepcopy(request), 'transition_id': i['transition_id'], 'event_id': i['event_id'],
                        'receipt_ref': i['receipt_ref'], 'state': 'committed', 'preimage_sha256': s.hmp(preimage) if preimage else None}
    return out


def pending_row(row, request, target, preimage):
    a = request['arguments']; i = ids_of(request, target, preimage)
    out = copy.deepcopy(row)
    out['phase'] = 'set_pending' if a['action'] == 'set' else 'clear_pending'
    out['core'] = pending_core(request, target, preimage)
    out[a['action']] = {'request': copy.deepcopy(request), 'transition_id': i['transition_id'], 'event_id': None,
                        'receipt_ref': i['receipt_ref'], 'state': 'pending', 'preimage_sha256': s.hmp(preimage) if preimage else None}
    return out


def producer_view(event):
    """The producer-intent members other than Storage-assigned fields and the identity members (owned by sl_hold_identity)."""
    out = {k: copy.deepcopy(v) for k, v in event.items() if k not in ('sequence_id', 'observed_at_utc', 'persisted_at_utc', 'event_id', 'idempotency_key')}
    if isinstance(out.get('payload'), dict):
        out['payload'].pop('receipt_ref', None)
    return out


# ---------------------------------------------------------------- operands

def _numbers(runs):
    slots = []
    for i, r in enumerate(runs):
        rc = r.get('receipt')
        if isinstance(rc, dict):
            for key in ('sequence_id', 'segment_generation', 'byte_offset'):
                slots.append(('run%d/receipt/%s' % (i, key), rc.get(key)))
    out = []
    for label, value in slots:
        error = w.caught(w.storage_uint64, value)
        if error:
            out.append((label, error))
    return out


def _times(runs):
    slots = []
    for i, r in enumerate(runs):
        if r['kind'] == 'observe':
            for side in ('old', 'new'):
                slots.append(('run%d/%s' % (i, side), r['facts'][side].get('captured_at_utc'), w.EVENT_RECORD))
    return s.date_errors(slots)


def operands(case, put, common):
    runs = s.runs_of(case, HOLD)
    if runs is None:
        put('sl_hold_admission', ['boundary record missing'], [])
        return
    base = case['sl']['base_event']
    numbers = _numbers(runs); times = _times(runs)
    put('sl_hold_numbers', numbers); put('sl_hold_time', times)
    ok = not numbers and not times
    if not ok:
        return  # every other row of this family is inapplicable until the shared number/time rows pass
    rows = {k: ([], []) for k in ('admission', 'zero', 'identity', 'event', 'core', 'phase', 'result', 'order', 'sir', 'union',
                                  'resume', 'restore', 'history', 'legacy')}
    def add(row, i, left, right):
        rows[row][0].append((i,) + tuple(left)); rows[row][1].append((i,) + tuple(right))
    for i, r in enumerate(runs):
        k = r['kind']; before = r.get('row_before')
        if k == 'command':
            decision, why = outcome(before, r) if ok else (None, None)
            add('admission', i, (r.get('decision'), r.get('stage')), (decision, why))
            request = r['request']; target = r['facts']['target']; preimage = before.get('core') if request['arguments']['action'] == 'clear' else None
            if decision in ('refused', 'replayed'):
                slot = before.get(request['arguments']['action'])
                want_result = None if decision == 'refused' else slot.get('result')
                add('zero', i, (len(r.get('events_appended') or []), s.cj(r.get('row_after')), s.cj(r.get('result')), r.get('hold_actions')),
                    (0, s.cj(before), s.cj(want_result), []))
                continue
            i_ = ids_of(request, target, preimage)
            if decision == 'pending':
                add('phase', i, (s.cj(r.get('row_after')),), (s.cj(pending_row(before, request, target, preimage)),))
                add('order', i, (r.get('trace'),), (PENDING,))
                add('sir', i, (len(r.get('events_appended') or []), r.get('sir_success')), (0, False))
                continue
            want_row = committed_row(before, request, target, preimage)
            events = r.get('events_appended') or []
            add('identity', i, ([(e.get('event_id'), e.get('idempotency_key'), (e.get('payload') or {}).get('receipt_ref')) for e in events],
                                (r.get('row_after') or {}).get(request['arguments']['action'], {}).get('transition_id')),
                ([(i_['event_id'], i_['idempotency_key'], i_['receipt_ref'])] * len(events), i_['transition_id']))
            add('event', i, (len(events), [s.cj(producer_view(e)) for e in events]),
                (1, [s.cj(producer_view(expected_event(base, request, target, preimage)))]))
            add('core', i, (s.cj((r.get('row_after') or {}).get('core')),), (s.cj(want_row['core']),))
            row_after = copy.deepcopy(r.get('row_after') or {})
            add('phase', i, (row_after.get('phase'), sorted(k_ for k_ in ('set', 'clear') if row_after.get(k_))),
                (want_row['phase'], sorted(k_ for k_ in ('set', 'clear') if want_row.get(k_))))
            add('result', i, (s.cj(r.get('result')), r.get('sir_success')), (s.cj(owner_result(request, target, preimage, want_row['core'])), True))
            add('order', i, (r.get('trace'),), (PENDING + FINISH,))
        elif k == 'finish':
            prior = runs[r['of']]; request = prior['request']; target = prior['facts']['target']
            preimage = prior['row_before'].get('core') if request['arguments']['action'] == 'clear' else None
            want_row = committed_row(prior['row_before'], request, target, preimage)
            add('phase', i, (s.cj(r.get('row_after')),), (s.cj(want_row),))
            add('order', i, (r.get('trace'),), (FINISH,))
            add('result', i, (s.cj(r.get('result')), r.get('sir_success')), (s.cj(owner_result(request, target, preimage, want_row['core'])), True))
            add('sir', i, (r.get('ack_seen'),), (r['facts']['ack'] in ('acknowledged', 'executing'),))
        elif k == 'observe':
            f = r['facts']; old = f['old']; new = f['new']
            fine = PROGRESS[new['progress']] >= PROGRESS[old['progress']] and s.utc(new['captured_at_utc']) >= s.utc(old['captured_at_utc']) if ok else True
            want = {'original_source': old['original'], 'current_source': new if fine else old['current']}
            add('sir', i, (r.get('decision'), s.cj(r.get('capsule_after'))), ('advanced' if fine else 'refused', s.cj(want)))
        elif k == 'union':
            f = r['facts']
            want = {t: any(h['phase'] in PROTECTIVE and t in h['targets'] for h in f['holds']) for t in f['targets']}
            add('union', i, (r.get('protected'),), (want,))
        elif k == 'auto_clear':
            add('union', i, (r.get('decision'), s.cj(r.get('row_after')), len(r.get('events_appended') or [])), ('refused', s.cj(before), 0))
        elif k == 'resume':
            crash = runs[r['of']]; at = crash['crash_at']; request = crash['request']; target = crash['facts']['target']
            preimage = crash['row_before'].get('core') if request['arguments']['action'] == 'clear' else None
            appended = (crash.get('events_appended') or []) + (r.get('events_appended') or [])
            if FINISH.index(at) >= FINISH.index('first_receipt'):
                want = (['resolve_original_receipt', 'stage_result', 'terminal_commit', 'readback', 'publish'], 1,
                        s.cj(committed_row(crash['row_before'], request, target, preimage)), True)
            else:
                want = (['reconcile_pending', 'keep_pending'], len(crash.get('events_appended') or []),
                        s.cj(pending_row(crash['row_before'], request, target, preimage)), False)
            add('resume', i, (r.get('trace'), len(appended), s.cj(r.get('row_after')), r.get('sir_success')), want)
        elif k == 'restore':
            f = r['facts']; prior = runs[r['of']]; request = prior['request']; target = prior['facts']['target']
            preimage = prior['row_before'].get('core') if request['arguments']['action'] == 'clear' else None
            want_row = committed_row(prior['row_before'], request, target, preimage) if f['surviving_receipt'] else \
                pending_row(prior['row_before'], request, target, preimage)
            add('restore', i, (r.get('decision'), s.cj(r.get('row_after')), len(r.get('events_appended') or [])),
                ('resolved_original' if f['surviving_receipt'] else 'pending_unavailable', s.cj(want_row), 0))
        elif k == 'history':
            f = r['facts']
            want = {'status': 'unavailable'} if not f['slot_available'] else \
                {'status': 'available', 'event_id': f['event_id'], 'action': f['action'], 'currently_protected': f['snapshot_phase'] in PROTECTIVE}
            add('history', i, (r.get('result'), r.get('effects')), (want, []))
        elif k == 'legacy_admit':
            f = r['facts']
            good = f['edge_supported'] and f['backup_core_sha256'] == s.hmp(f['v1_core']) and f['v1_core']['hold_kind'] == 'legal_hold' and active(f['v1_core'])
            want = {'phase': 'held', 'core': f['v1_core'], 'legacy': {'kind': 'legacy_admitted_v1_protection',
                                                                       'original_core_sha256': s.hmp(f['v1_core']), 'original_set_receipt': None,
                                                                       'migration_receipt_ref': f['migration_receipt_ref']}} if good else None
            add('legacy', i, (r.get('decision'), s.cj(r.get('row_after'))), ('admitted' if good else 'refused', s.cj(want if good else before)))
        elif k == 'legacy_clear_check':
            prior = runs[r['of']]
            legacy = (prior.get('row_after') or {}).get('legacy') or {}
            add('legacy', i, (legacy.get('kind'), legacy.get('original_set_receipt', 'missing')), ('legacy_admitted_v1_protection', None))
    for name, (left, right) in rows.items():
        put('sl_hold_' + name, left, right, ok)


# ---------------------------------------------------------------- fixture constructor

def templates(scope):
    name = 'native_held' if scope == 'application' else 'project_held'
    t = FIXTURES['base_values'][name]['set_custody']['transition']
    return copy.deepcopy(t['request']), copy.deepcopy(t['target'])


def request_for(scope, action, n, **args):
    request, _target = templates(scope)
    request['request_ref'] = 'request:%s:%d' % (action, n); request['command_instance_id'] = 'command:%s:%d' % (action, n)
    request['idempotency_key'] = 'command-idem:%s:%d' % (action, n); request['dispatch_id'] = 'dispatch:%s:%d' % (action, n)
    request['identity']['command_instance_id'] = request['command_instance_id']
    request['accepted_at_utc'] = '2026-09-12T0%d:00:00Z' % min(n, 9)
    request['arguments']['action'] = action
    request['arguments'].update(args)
    for key in [k for k, v in args.items() if v is None]:
        request['arguments'].pop(key)
    return request


def facts(scope, **change):
    _request, target = templates(scope)
    value = {'writer': True, 'versions': True, 'sir': True, 'permission': True, 'target': target, 'ack': 'acknowledged',
             'absence_proven': True}
    value.update(change)
    return value


def simulate(case, run, row):
    """Owner-conforming presented outcome of one run (fixture constructor, never called by the checker)."""
    k = run['kind']; base = case['sl']['base_event']
    run['row_before'] = copy.deepcopy(row)
    run.setdefault('events_appended', []); run.setdefault('hold_actions', [])
    if k in ('command', 'crash'):
        decision, why = outcome(row, run)
        request = run['request']; target = run['facts']['target']; a = request['arguments']
        preimage = row.get('core') if a['action'] == 'clear' else None
        if decision in ('refused', 'replayed'):
            slot = row.get(a['action'])
            run.update(decision=decision, stage=why, row_after=copy.deepcopy(row), sir_success=False,
                       result=None if decision == 'refused' else copy.deepcopy(slot.get('result')))
            return row
        if k == 'crash':
            run['row_after'] = pending_row(row, request, target, preimage)
            if FINISH.index(run['crash_at']) >= FINISH.index('barrier_append'):
                e = expected_event(base, request, target, preimage); e.update(sequence_id=70, observed_at_utc=w.TIME, persisted_at_utc=w.TIME)
                run['events_appended'] = [e]
            run['trace'] = PENDING + FINISH[:FINISH.index(run['crash_at']) + 1] + ['crash']
            return run['row_after']
        if decision == 'pending':
            run.update(decision='pending', stage=None, row_after=pending_row(row, request, target, preimage), trace=list(PENDING), sir_success=False, result=None)
            return run['row_after']
        after = committed_row(row, request, target, preimage)
        e = expected_event(base, request, target, preimage); e.update(sequence_id=70, observed_at_utc=w.TIME, persisted_at_utc=w.TIME)
        result = owner_result(request, target, preimage, after['core'])
        after[a['action']]['result'] = copy.deepcopy(result)
        run.update(decision='committed', stage=None, row_after=after, events_appended=[e], trace=PENDING + FINISH, sir_success=True, result=result,
                   receipt={'event_id': e['event_id'], 'sequence_id': 70, 'segment_generation': 11, 'byte_offset': 0})
        return after
    if k == 'finish':
        prior = case['sl']['runs'][run['of']]; request = prior['request']; target = prior['facts']['target']
        preimage = prior['row_before'].get('core') if request['arguments']['action'] == 'clear' else None
        after = committed_row(prior['row_before'], request, target, preimage)
        run.update(row_after=after, trace=list(FINISH), sir_success=True, result=owner_result(request, target, preimage, after['core']),
                   ack_seen=run['facts']['ack'] in ('acknowledged', 'executing'))
        return after
    if k == 'observe':
        f = run['facts']; old = f['old']; new = f['new']
        fine = PROGRESS[new['progress']] >= PROGRESS[old['progress']] and s.utc(new['captured_at_utc']) >= s.utc(old['captured_at_utc'])
        run.update(decision='advanced' if fine else 'refused',
                   capsule_after={'original_source': old['original'], 'current_source': new if fine else old['current']})
        return row
    if k == 'union':
        f = run['facts']
        run['protected'] = {t: any(h['phase'] in PROTECTIVE and t in h['targets'] for h in f['holds']) for t in f['targets']}
        return row
    if k == 'auto_clear':
        run.update(decision='refused', row_after=copy.deepcopy(row))
        return row
    if k == 'resume':
        crash = case['sl']['runs'][run['of']]; request = crash['request']; target = crash['facts']['target']
        preimage = crash['row_before'].get('core') if request['arguments']['action'] == 'clear' else None
        if FINISH.index(crash['crash_at']) >= FINISH.index('first_receipt'):
            run.update(trace=['resolve_original_receipt', 'stage_result', 'terminal_commit', 'readback', 'publish'],
                       row_after=committed_row(crash['row_before'], request, target, preimage), sir_success=True)
        else:
            run.update(trace=['reconcile_pending', 'keep_pending'], row_after=pending_row(crash['row_before'], request, target, preimage), sir_success=False)
        return run['row_after']
    if k == 'restore':
        f = run['facts']; prior = case['sl']['runs'][run['of']]; request = prior['request']; target = prior['facts']['target']
        preimage = prior['row_before'].get('core') if request['arguments']['action'] == 'clear' else None
        if f['surviving_receipt']:
            run.update(decision='resolved_original', row_after=committed_row(prior['row_before'], request, target, preimage))
        else:
            run.update(decision='pending_unavailable', row_after=pending_row(prior['row_before'], request, target, preimage))
        return run['row_after']
    if k == 'history':
        f = run['facts']
        run.update(result={'status': 'unavailable'} if not f['slot_available'] else
                   {'status': 'available', 'event_id': f['event_id'], 'action': f['action'], 'currently_protected': f['snapshot_phase'] in PROTECTIVE},
                   effects=[])
        return row
    if k == 'legacy_admit':
        f = run['facts']
        good = f['edge_supported'] and f['backup_core_sha256'] == s.hmp(f['v1_core']) and f['v1_core']['hold_kind'] == 'legal_hold' and active(f['v1_core'])
        if good:
            after = {'phase': 'held', 'core': copy.deepcopy(f['v1_core']),
                     'legacy': {'kind': 'legacy_admitted_v1_protection', 'original_core_sha256': s.hmp(f['v1_core']),
                                'original_set_receipt': None, 'migration_receipt_ref': f['migration_receipt_ref']}}
            run.update(decision='admitted', row_after=after)
            return after
        run.update(decision='refused', row_after=copy.deepcopy(row))
        return row
    if k == 'legacy_clear_check':
        return row
    if k == 'seed_row':
        run['row_after'] = copy.deepcopy(run['facts']['row'])
        return run['row_after']
    raise ValueError(k)


def scenario(case, scope, specs):
    stored = case['stored_event']
    case['sl'] = {'family': HOLD, 'scope': scope, 'base_event': {k: v for k, v in stored.items()}, 'runs': []}
    row = {'phase': None, 'core': None, 'set': None, 'clear': None}
    for spec in specs:
        run = copy.deepcopy(spec); run.setdefault('facts', {})
        case['sl']['runs'].append(run)
        row = simulate(case, run, row)
    return case


def C(scope, action, n, facts_change=None, **args):
    return {'kind': 'command', 'request': request_for(scope, action, n, **args), 'facts': facts(scope, **(facts_change or {}))}


def augment(control):
    scope = 'project' if control['source']['project_id'] else 'application'
    scenario(control, scope, [C(scope, 'set', 1), C(scope, 'clear', 2)])


def label_index(value, label):
    return next(i for i, r in enumerate(value['sl']['runs']) if r.get('label') == label)


def v1_core():
    core = copy.deepcopy(FIXTURES['base_values']['legacy_core'])
    return core.get('core', core)


def cases():
    import pm_s3bo_cases as c
    controls = []; negatives = []
    R = lambda i, *path: ('sl', 'runs', i) + path

    def build(label, project, scope, specs):
        value = w.build(HOLD, project); scenario(value, scope, specs)
        control = s.control(HOLD, label, value); controls.append(control)
        return control, value

    app = 'application'; prj = 'project'
    # Set then clear, replay, conflict, a refused second clear, history, union and automatic-clear attempts.
    main, mv = build('set-clear', None, app,
                     [C(app, 'set', 1), C(app, 'set', 1), C(app, 'set', 3), C(app, 'clear', 2),
                      dict(C(app, 'clear', 4), label='second-clear'), dict(C(app, 'set', 5), label='reuse-cleared'),
                      {'label': 'auto-clear-timeout', 'kind': 'auto_clear', 'facts': {'reason': 'timeout'}},
                      {'label': 'history-set', 'kind': 'history', 'facts': {'slot_available': True, 'event_id': 'evt_hold_set', 'action': 'set', 'snapshot_phase': 'cleared'}},
                      {'label': 'history-missing', 'kind': 'history', 'facts': {'slot_available': False}},
                      {'label': 'union', 'kind': 'union', 'facts': {'targets': ['semantic:held-target', 'semantic:other'],
                                                                     'holds': [{'hold_id': 'legal-1', 'phase': 'cleared', 'targets': ['semantic:held-target']},
                                                                               {'hold_id': 'legal-2', 'phase': 'held', 'targets': ['semantic:held-target']},
                                                                               {'hold_id': 'legal-3', 'phase': 'clear_pending', 'targets': ['semantic:other']}]}},
                      {'label': 'union-released', 'kind': 'union', 'facts': {'targets': ['semantic:held-target'],
                                                                              'holds': [{'hold_id': 'legal-1', 'phase': 'cleared', 'targets': ['semantic:held-target']}]}}])
    runs = mv['sl']['runs']; A = lambda label: label_index(mv, label)
    other = copy.deepcopy(runs[0]['events_appended'][0])
    for row, path, replacement, label in [
            ('sl_hold_admission', R(0, 'decision'), 'pending', 'acknowledged-left-pending'),
            ('sl_hold_admission', R(2, 'stage'), 'preimage', 'conflict-misreported'),
            ('sl_hold_zero', R(1, 'events_appended'), [other], 'replay-second-event'),
            ('sl_hold_zero', R(1, 'result'), None, 'replay-loses-result'),
            ('sl_hold_zero', R(2, 'row_after', 'phase'), 'set_pending', 'conflict-mutates-row'),
            ('sl_hold_zero', R(A('second-clear'), 'hold_actions'), ['clear'], 'second-clear-acts'),
            ('sl_hold_identity', R(0, 'events_appended', 0, 'event_id'), 'evt_hold_' + 'e' * 64, 'event-id-not-binding'),
            ('sl_hold_identity', R(3, 'events_appended', 0, 'payload', 'receipt_ref'), runs[0]['events_appended'][0]['payload']['receipt_ref'], 'clear-uses-set-receipt'),
            ('sl_hold_identity', R(3, 'row_after', 'clear', 'transition_id'), runs[0]['row_after']['set']['transition_id'], 'clear-reuses-set-transition'),
            ('sl_hold_event', R(0, 'events_appended', 0, 'payload', 'policy_ref'), 'RP-AUTHORITY-INDEFINITE', 'policy-conflated-with-hold-row'),
            ('sl_hold_event', R(0, 'events_appended', 0, 'occurred_at_utc'), '2026-09-12T05:00:00Z', 'occurrence-not-acceptance'),
            ('sl_hold_event', R(0, 'events_appended', 0, 'correlation_id'), 'dispatch:set:1', 'correlation-not-command-instance'),
            ('sl_hold_event', R(3, 'events_appended', 0, 'payload', 'affected_semantic_refs'), [], 'affected-refs-dropped'),
            ('sl_hold_event', R(0, 'events_appended', 0, 'thread_id'), 'thread-A', 'metadata-command-thread'),
            ('sl_hold_core', R(3, 'row_after', 'core', 'set_reason'), 'rewritten reason', 'clear-rewrites-set-fields'),
            ('sl_hold_core', R(3, 'row_after', 'core', 'clear_reason'), None, 'partial-clear-fields'),
            ('sl_hold_core', R(0, 'row_after', 'core', 'event_refs'), [], 'set-core-without-event'),
            ('sl_hold_phase', R(3, 'row_after', 'phase'), 'held', 'cleared-still-held'),
            ('sl_hold_phase', R(0, 'row_after', 'clear'), {'request': {}, 'state': 'committed'}, 'set-creates-clear-slot'),
            ('sl_hold_result', R(0, 'result', 'status'), 'cleared', 'set-result-cleared'),
            ('sl_hold_result', R(3, 'result', 'core_sha256'), runs[0]['result']['core_sha256'], 'result-binds-old-core'),
            ('sl_hold_order', R(0, 'trace'), PENDING + ['barrier_append', 'reauthenticate', 'capture_acknowledgement'] + FINISH[3:], 'append-before-reauthentication'),
            ('sl_hold_order', R(3, 'trace'), PENDING + FINISH[:4] + ['publish', 'stage_result', 'terminal_commit', 'readback'], 'publish-before-commit'),
            ('sl_hold_union', R(A('union'), 'protected', 'semantic:held-target'), False, 'clearing-one-releases-other'),
            ('sl_hold_union', R(A('union'), 'protected', 'semantic:other'), False, 'clear-pending-unprotected'),
            ('sl_hold_union', R(A('union-released'), 'protected', 'semantic:held-target'), True, 'cleared-still-protects'),
            ('sl_hold_union', R(A('auto-clear-timeout'), 'decision'), 'cleared', 'timeout-clears'),
            ('sl_hold_history', R(A('history-set'), 'result', 'currently_protected'), True, 'historical-set-claims-protection'),
            ('sl_hold_history', R(A('history-missing'), 'result'), {'status': 'available', 'event_id': None, 'action': None, 'currently_protected': False}, 'missing-slot-reads-clear'),
            ('sl_hold_history', R(A('history-set'), 'effects'), ['checkpoint_advance'], 'history-advances-checkpoint')]:
        negatives.append(c.mutate(main, row, path, replacement, label))
    # Every admission refusal, in order, on a fresh application row.
    _req, target = templates(app)
    unsorted = dict(copy.deepcopy(target), affected_semantic_refs=['semantic:z', 'semantic:a'])
    project_target = templates(prj)[1]
    for label, spec, want in [
            ('no-writer', C(app, 'set', 1, {'writer': False}), 'writer'),
            ('no-versions', C(app, 'set', 1, {'versions': False}), 'versions'),
            ('unauthenticated-sir', C(app, 'set', 1, {'sir': False}), 'sir'),
            ('pre-restore-command', C(app, 'set', 1, {'post_restore': True, 'accepted_after_session': False}), 'restore'),
            ('no-permission', C(app, 'set', 1, {'permission': False}), 'permission'),
            ('empty-reason', C(app, 'set', 1, reason=''), 'reason'),
            ('unresolved-target', C(app, 'set', 1, {'target': None}), 'target'),
            ('other-scope-ref', C(app, 'set', 1, semantic_scope_ref='application:other'), 'target'),
            ('unsorted-affected-refs', C(app, 'set', 1, {'target': unsorted}), 'target'),
            ('application-with-project-target', C(app, 'set', 1, {'target': project_target}), 'target'),
            ('expected-hash-on-absent', C(app, 'set', 1, expected_hold_sha256='a' * 64), 'expected_hash'),
            ('absence-unproven', C(app, 'set', 1, {'absence_proven': False}), 'preimage'),
            ('clear-absent', C(app, 'clear', 1), 'preimage'),
            ('post-restore-fresh', C(app, 'set', 1, {'post_restore': True, 'accepted_after_session': True}), None),
            ('unknown-action', C(app, 'release', 1), 'arguments')]:
        control, value = build('admission-' + label, None, app, [spec])
        if want:
            negatives.append(c.mutate(control, 'sl_hold_admission', R(0, 'stage'), 'writer' if want != 'writer' else 'sir', 'other-stage'))
            negatives.append(c.mutate(control, 'sl_hold_zero', R(0, 'hold_actions'), ['set'], 'refusal-sets-hold'))
        else:
            negatives.append(c.mutate(control, 'sl_hold_admission', R(0, 'decision'), 'refused', 'fresh-refused'))
    # Clear refusals over an existing hold: wrong expected hash, other kind, wrong scope; and a correct expected hash.
    set1 = C(app, 'set', 1)
    for label, clear, want in [
            ('clear-expected-hash', C(app, 'clear', 2, expected_hold_sha256='b' * 64), 'expected_hash'),
            ('clear-exact-expected-hash', None, None)]:
        if clear is None:
            probe = w.build(HOLD); scenario(probe, app, [set1])
            clear = C(app, 'clear', 2, expected_hold_sha256=s.hmp(probe['sl']['runs'][0]['row_after']['core']))
        control, value = build(label, None, app, [set1, clear])
        if want:
            negatives.append(c.mutate(control, 'sl_hold_zero', R(1, 'row_after', 'phase'), 'cleared', 'mismatched-hash-clears'))
        else:
            negatives.append(c.mutate(control, 'sl_hold_admission', R(1, 'stage'), 'expected_hash', 'exact-hash-refused'))
    # A clear naming a hold of another kind (preserved_run) is not this producer's.
    other = v1_core(); other = dict(other, hold_kind='preserved_run', hold_id='legal-1', scope=copy.deepcopy(target['scope']))
    kind, kv = build('clear-other-kind', None, app, [{'kind': 'seed_row', 'facts': {'row': {'phase': 'held', 'core': other, 'set': None, 'clear': None}}},
                                                     C(app, 'clear', 2)])
    negatives.append(c.mutate(kind, 'sl_hold_zero', R(1, 'row_after', 'phase'), 'cleared', 'other-kind-cleared'))
    negatives.append(c.mutate(kind, 'sl_hold_admission', R(1, 'stage'), 'target', 'other-kind-misreported'))
    # Project hold: set and clear with the Project joins.
    proj, pv = build('project-set-clear', w.PROJECT, prj, [C(prj, 'set', 1), C(prj, 'clear', 2)])
    negatives.append(c.mutate(proj, 'sl_hold_event', R(0, 'events_appended', 0, 'payload', 'project_id'), 'project:other', 'payload-other-project'))
    negatives.append(c.mutate(proj, 'sl_hold_event', R(1, 'events_appended', 0, 'project_id'), None, 'envelope-drops-project'))
    # Unacknowledged command: pending stays protective, then a finish after acknowledgement.
    pend, ppv = build('pending-then-finish', None, app,
                      [C(app, 'set', 1, {'ack': 'accepted'}),
                       {'label': 'observe', 'kind': 'observe', 'facts': {'old': {'progress': 'accepted', 'captured_at_utc': '2026-09-12T03:00:00Z',
                                                                                 'original': {'progress': 'accepted'}, 'current': {'progress': 'accepted'}},
                                                                         'new': {'progress': 'acknowledged', 'captured_at_utc': '2026-09-12T03:05:00Z'}}},
                       {'label': 'regress', 'kind': 'observe', 'facts': {'old': {'progress': 'executing', 'captured_at_utc': '2026-09-12T03:05:00Z',
                                                                                 'original': {'progress': 'accepted'}, 'current': {'progress': 'executing'}},
                                                                         'new': {'progress': 'acknowledged', 'captured_at_utc': '2026-09-12T03:06:00Z'}}},
                       {'label': 'time-regress', 'kind': 'observe', 'facts': {'old': {'progress': 'acknowledged', 'captured_at_utc': '2026-09-12T03:05:00Z',
                                                                                      'original': {'progress': 'accepted'}, 'current': {'progress': 'acknowledged'}},
                                                                              'new': {'progress': 'executing', 'captured_at_utc': '2026-09-12T03:04:59Z'}}},
                       {'label': 'finish', 'kind': 'finish', 'of': 0, 'facts': {'ack': 'acknowledged'}},
                       {'label': 'restored', 'kind': 'restore', 'of': 0, 'facts': {'surviving_receipt': False}},
                       {'label': 'restored-receipt', 'kind': 'restore', 'of': 0, 'facts': {'surviving_receipt': True}}])
    B = lambda label: label_index(ppv, label)
    for row, path, replacement, label in [
            ('sl_hold_phase', R(0, 'row_after', 'phase'), None, 'pending-unprotected'),
            ('sl_hold_phase', R(0, 'row_after', 'core', 'event_refs'), ['evt_hold_promised'], 'pending-promises-event'),
            ('sl_hold_sir', R(0, 'events_appended'), [copy.deepcopy(runs[0]['events_appended'][0])], 'unacknowledged-appends'),
            ('sl_hold_sir', R(0, 'sir_success'), True, 'pending-reports-success'),
            ('sl_hold_sir', R(B('observe'), 'capsule_after', 'original_source'), {'progress': 'acknowledged'}, 'original-source-rewritten'),
            ('sl_hold_sir', R(B('regress'), 'decision'), 'advanced', 'progress-regresses'),
            ('sl_hold_sir', R(B('time-regress'), 'decision'), 'advanced', 'capture-time-regresses'),
            ('sl_hold_sir', R(B('finish'), 'ack_seen'), False, 'finish-without-acknowledgement'),
            ('sl_hold_order', R(B('finish'), 'trace'), ['barrier_append'] + FINISH, 'finish-appends-before-reauthentication'),
            ('sl_hold_result', R(B('finish'), 'sir_success'), False, 'finished-without-publication'),
            ('sl_hold_restore', R(B('restored'), 'decision'), 'resolved_original', 'restored-pending-first-mints'),
            ('sl_hold_restore', R(B('restored'), 'events_appended'), [copy.deepcopy(runs[0]['events_appended'][0])], 'restored-pending-appends'),
            ('sl_hold_restore', R(B('restored-receipt'), 'row_after', 'phase'), 'set_pending', 'surviving-receipt-ignored')]:
        negatives.append(c.mutate(pend, row, path, replacement, label))
    # Crash cuts: append ambiguity, issued receipt, failed terminal commit.
    for at in ('barrier_append', 'first_receipt', 'terminal_commit'):
        crash = dict(C(app, 'set', 1), kind='crash', crash_at=at)
        control, value = build('crash-' + at, None, app, [crash, {'kind': 'resume', 'of': 0}])
        negatives.append(c.mutate(control, 'sl_hold_resume', R(1, 'events_appended'), [copy.deepcopy(runs[0]['events_appended'][0])], 'resume-second-append'))
        issued = FINISH.index(at) >= FINISH.index('first_receipt')
        negatives.append(c.mutate(control, 'sl_hold_resume', R(1, 'sir_success'), not issued, 'resume-success-misreported'))
        if not issued:
            negatives.append(c.mutate(control, 'sl_hold_resume', R(1, 'row_after', 'phase'), None, 'ambiguous-drops-protection'))
    # Legacy v1 protection admitted, then cleared; and a refused admission with a mismatched backup hash.
    core = v1_core()
    leg, lv = build('legacy-admit-clear', None, app,
                    [{'kind': 'legacy_admit', 'facts': {'v1_core': core, 'edge_supported': True, 'backup_core_sha256': s.hmp(core),
                                                         'migration_receipt_ref': 'migration-receipt:A'}},
                     C(app, 'clear', 2, hold_id=core['hold_id']),
                     {'kind': 'legacy_clear_check', 'of': 1},
                     {'label': 'legacy-bad-hash', 'kind': 'legacy_admit', 'facts': {'v1_core': core, 'edge_supported': True, 'backup_core_sha256': 'c' * 64,
                                                                                     'migration_receipt_ref': 'migration-receipt:B'}}])
    negatives.append(c.mutate(leg, 'sl_hold_legacy', R(0, 'row_after', 'legacy', 'original_set_receipt'), 'pm.storage.hold_receipt.v2:invented:set', 'invented-set-receipt'))
    negatives.append(c.mutate(leg, 'sl_hold_legacy', R(3, 'decision'), 'admitted', 'mismatched-backup-admitted'))
    negatives.append(c.mutate(leg, 'sl_hold_legacy', R(1, 'row_after', 'legacy', 'original_set_receipt'), 'pm.storage.hold_receipt.v2:invented:set', 'clear-invents-set-receipt'))
    # Number and time slots at every copy.
    def copies(label, row, change, defect, control=main, value=mv):
        changed = copy.deepcopy(value); change(changed); negatives.append(c.negative(control, row, label, changed, defect))
    def seq(v, x):
        v['sl']['runs'][0]['receipt']['sequence_id'] = x
    def cap(v, x):
        f = v['sl']['runs'][B('observe')]['facts']; f['old']['captured_at_utc'] = x; f['new']['captured_at_utc'] = x
    copies('receipt-sequence-boolean', 'sl_hold_numbers', lambda v: seq(v, True), {'value': True})
    copies('receipt-sequence-above-u64', 'sl_hold_numbers', lambda v: seq(v, 1 << 64), {'value': '2^64'})
    copies('capture-impossible', 'sl_hold_time', lambda v: cap(v, '2026-02-30T00:00:00Z'), {'copies': 'old and new capture'}, pend, ppv)
    return controls, negatives


def corpus_slots(control):
    value = control['value']; runs = s.runs_of(value, HOLD)
    if not runs:
        return
    for i, r in enumerate(runs):
        if isinstance(r.get('receipt'), dict):
            yield {'paths': [('sl', 'runs', i, 'receipt', 'sequence_id')], 'kind': 'integer', 'row': 'sl_hold_numbers',
                   'bounds': {'minimum': 0, 'maximum': (1 << 64) - 1}, 'downstream': False, 'container_row': 'sl_hold_numbers'}
            break
    for i, r in enumerate(runs):
        if r['kind'] == 'observe' and r.get('label') == 'observe':
            yield {'paths': [('sl', 'runs', i, 'facts', 'old', 'captured_at_utc'), ('sl', 'runs', i, 'facts', 'new', 'captured_at_utc')],
                   'kind': 'datetime', 'row': 'sl_hold_time', 'profile': w.EVENT_RECORD, 'type_rows': ['sl_hold_time']}


def evidence(out):
    """Owner fixture cross-check of the recipes, plus a schema self-check of every presented control value."""
    import pm_s3bo_cases as c
    recipes = []
    for name, value in FIXTURES['base_values'].items():
        for slot in ('set_custody', 'clear_transition'):
            x = value.get(slot) if isinstance(value, dict) else None
            t = (x or {}).get('transition') if slot == 'set_custody' else x
            if not isinstance(t, dict) or 'request' not in t:
                continue
            pre = t.get('preimage_core'); i = ids_of(t['request'], t['target'], pre)
            recipes.append({'fixture': name, 'slot': slot, 'transition_id': i['transition_id'] == t['transition_id'],
                            'receipt_ref': i['receipt_ref'] == t['receipt_ref'],
                            'event_id': i['event_id'] == (t.get('event') or t['producer_intent'])['event_id'],
                            'result_core': (t.get('owner_result') is None) or t['owner_result']['core_sha256'] == s.hmp(t['after_core'])})
    controls, _ = c.cases(); checked = 0; bad = []
    root = w.read_json('Plans/storage_retention_hold_contracts.schema.json')
    core_schema = dict(root, **{'$ref': '#/$defs/HoldCoreV1'}); result_schema = dict(root, **{'$ref': '#/$defs/OwnerResult'})
    for control in controls:
        runs = s.runs_of(control['value'], HOLD)
        if runs is None:
            continue
        for i, r in enumerate(runs):
            for e in r.get('events_appended') or []:
                checked += 1
                if s.keyword_errors(PAYLOAD_SCHEMA, e['payload']):
                    bad.append((control['id'], i, 'payload'))
            core = (r.get('row_after') or {}).get('core')
            if isinstance(core, dict):
                checked += 1
                if s.keyword_errors(core_schema, core):
                    bad.append((control['id'], i, 'core'))
            if isinstance(r.get('result'), dict) and r['result'].get('schema_id') == 'pm.storage.legal_hold_result.v1':
                checked += 1
                if s.keyword_errors(result_schema, r['result']):
                    bad.append((control['id'], i, 'result'))
    ok = recipes and all(all(v for k, v in x.items() if k not in ('fixture', 'slot')) for x in recipes) and checked and not bad
    return {'status': 'pass' if ok else 'fail', 'family': HOLD, 'recipe_reproductions': recipes, 'checked': checked, 'schema_failures': bad}
