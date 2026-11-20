"""C12-SR: restore_point.applied complete branch-from-restore boundary.

Owner clauses: SP-2202 (order, identity, result custody, replay, withdrawal),
ACD-086 / UCC-126 (results branched | refused | failed, source preservation,
reason tokens), ATS K37 `restore_point.applied` set and ATS-2202.

A boundary record (`case['sr']`) holds one command scenario: the canonical point
and source snapshot before it, and every run (first execution, replay,
conflicting replay, a deliberate second key, crash and resume) with the trace,
commit row, result, appended events, created branches, point and source after.
Expected values are derived here from the independent inputs (request, gate,
point seen at admission, prior runs) by the owner rules; predicates only compare.
Refused vs failed is not owner-assigned per reason, so a non-branched outcome is
compared as `not_branched`; reasons are compared exactly only where UCC-126
names the token. Native execution remains NOT_RUN.
"""
import copy

import pm_s3bo_oracles as w
import pm_s3bo_sr_common as s

LANE = 'sr'
APP = 'restore_point.applied'
FAMILIES = (APP,)
ROOT = s.schema_root(s.APPLICATION_SCHEMA_PATH, 'application_commit')
POINT_ID = 'rpc_' + '1' * 64
HASH = 'a' * 64
FULL = ['admission_preflight', 'reserve_pending', 'materialize', 'record_materialization',
        'barrier_append', 'first_receipt', 'publish_result']
RESUME = {
    'reserve_pending': ['resume_pending', 'materialize', 'record_materialization', 'barrier_append',
                        'first_receipt', 'publish_result'],
    'materialize': ['resume_pending', 'adopt_materialization', 'record_materialization', 'barrier_append',
                    'first_receipt', 'publish_result'],
    'record_materialization': ['resume_obligation', 'barrier_append', 'first_receipt', 'publish_result'],
    'barrier_append': ['resume_obligation', 'resolve_original_receipt', 'publish_result'],
    'first_receipt': ['resume_obligation', 'resolve_original_receipt', 'publish_result'],
}
# UCC-126 names these reason tokens exactly; other preconditions only require
# a non-empty reason (the owner gives no token).
TOKENS = {'storage_read_only': 'storage_read_only', 'storage_io_exhausted': 'storage_io_exhausted',
          'operation_in_progress': 'operation_in_progress',
          'source_content': 'source_deleted_content_unavailable', 'conflict': 'idempotency_conflict'}
GATE = {'writer_cutoff': False, 'family': 'registered', 'storage': 'writer', 'permission': 'allowed',
        'hold': False, 'operation_in_progress': False, 'source_content': 'available',
        'reserve_transaction': 'committed'}

ROWS = [
    ('sr_app_result', 'sr_applied', 'equal', 'Only an admitted first execution or its resumption returns branched; every failed precondition returns refused or failed.'),
    ('sr_app_reason', 'sr_applied', 'equal', 'A non-branched result carries the exact UCC-126 reason token where one is named, otherwise a non-empty reason; branched carries none.'),
    ('sr_app_record', 'sr_applied', 'equal', 'The commit row records exactly the step reached: absent before step 2, pending through step 3, branched from step 4, terminal for a step-2 refusal.'),
    ('sr_app_events', 'sr_applied', 'equal', 'Exactly one restore_point.applied is appended per application, only by the step-5 append of a branched row.'),
    ('sr_app_branches', 'sr_applied', 'equal', 'Materialization creates exactly the reserved thread/branch pair once; a resumed step adopts its own creation.'),
    ('sr_app_targets', 'sr_applied', 'equal', 'An execution returns the reserved target pair only for branched, never for refused or failed.'),
    ('sr_app_order', 'sr_applied', 'equal', 'Steps run in the exact SP-2202 order for the run kind; the result is published only after the first receipt.'),
    ('sr_app_replay', 'sr_applied', 'equal', 'Replay returns the recorded result, targets and original receipt, and the commit row is unchanged.'),
    ('sr_app_request', 'sr_applied_custody', 'equal', 'The commit row holds the exact normalized request, its RFC 8785 digest and the authenticated actor.'),
    ('sr_app_identity', 'sr_applied_custody', 'equal', 'application_id, event_id and the EventRecord key follow the rpa_ recipe of the request key; a new key is a new application.'),
    ('sr_app_preflight', 'sr_applied_custody', 'equal', 'The recorded preflight binds the admitted point hash and protecting-ref digest.'),
    ('sr_app_event_join', 'sr_applied_custody', 'equal', 'The frozen event joins the reserved targets, envelope thread, point identity and hashes, and source refs.'),
    ('sr_app_obligation', 'sr_applied_custody', 'equal', 'Every appended event is byte-identical to the frozen obligation of its application, and the first is the stored EventRecord.'),
    ('sr_app_receipt', 'sr_applied_custody', 'equal', "The row names its event's own SP-286 custody key and the result returns that event's original receipt."),
    ('sr_app_schema', 'sr_applied_custody', 'error', 'Every commit row validates against the complete closed application_commit schema.'),
    ('sr_app_time', 'sr_applied_custody', 'error', 'Commit-row timestamps use shared date_time with the Storage UTC-Z profile.'),
    ('sr_app_protect', 'sr_applied_effects', 'equal', 'Only the step-4 record adds application:<application_id> to the protecting refs; nothing else changes them.'),
    ('sr_app_point', 'sr_applied_effects', 'equal', 'Application never consumes or transitions the restore point; every other point field is unchanged.'),
    ('sr_app_source', 'sr_applied_effects', 'equal', 'Every run leaves the source thread, branch, worktree, files, Git index, queue and safe points unchanged.'),
    ('sr_app_conflict', 'sr_applied_effects', 'equal', 'A different request digest under one key is idempotency_conflict and the original row is unchanged.'),
]


def ids(project, key):
    digest = w.sha(w.lp('restore_point.applied/apply/v1', project, key))
    return 'rpa_' + digest, 'er_rpa_' + digest


def payload(p, project):
    p.update(restore_point_id=POINT_ID, source_thread_ref='thread-source', source_branch_ref='branch-source',
             new_thread_id='thread-new-A', new_branch_id='branch-new-A',
             expected_record_hash=HASH, observed_record_hash=HASH)


def point():
    return {'project_id': w.PROJECT, 'restore_point_id': POINT_ID, 'record_ref': 'rp:' + w.PROJECT + ':' + POINT_ID,
            'record_sha256': HASH, 'status': 'available', 'source_thread_id': 'thread-source',
            'source_branch_id': 'branch-source', 'source_message_id': 'message-A',
            'protecting_refs': ['source-lineage:message-A']}


def request(key='request-A', **changes):
    value = {'command_id': 'cmd.chat.branch_from_restore', 'project_id': w.PROJECT, 'restore_point_id': POINT_ID,
             'source_thread_id': 'thread-source', 'expected_restore_point_sha256': HASH, 'new_thread_title': None,
             'idempotency_key': key, 'actor_ref': 'actor-A'}
    value.update(changes)
    return value


def companion(req, seen, state, result, reserved=None, reason=None, materialized=False):
    app_id, event_id = ids(req['project_id'], req['idempotency_key'])
    value = {'schema_id': 'pm.storage_value.restore_point_application_commit.v1', 'schema_version': '1.0.0',
             'storage_instance_id': w.STORE, 'project_id': req['project_id'],
             'scope_partition': w.partition(req['project_id']), 'application_id': app_id,
             'restore_point_id': req['restore_point_id'], 'source_thread_id': req['source_thread_id'],
             'command_request': copy.deepcopy(req), 'command_request_sha256': s.jcs_sha(req),
             'actor_ref': req['actor_ref'],
             'preflight': {'record_sha256': seen['record_sha256'], 'status': 'available', 'permission': 'allowed',
                           'writer_posture': 'writer', 'protecting_refs_sha256': s.jcs_sha(seen['protecting_refs'])},
             'reserved_new_thread_id': None, 'reserved_new_branch_id': None, 'state': state, 'result': result,
             'reason_code': reason, 'materialized_at_utc': None, 'frozen_append_input_sha256': None,
             'event_id': None, 'append_receipt_ref': None, 'admitted_at_utc': w.TIME, 'terminal_at_utc': None,
             'redaction_profile': 'ids_hashes_refs_only'}
    if reserved:
        value['reserved_new_thread_id'], value['reserved_new_branch_id'] = reserved
    if result == 'branched':
        value.update(materialized_at_utc=w.TIME, frozen_append_input_sha256='f' * 64, event_id=event_id,
                     append_receipt_ref=s.custody_key(event_id), terminal_at_utc=w.TIME)
    elif result in ('refused', 'failed'):
        value.update(terminal_at_utc=w.TIME)
    return value


def application_event(stored, req, reserved, sequence):
    """The frozen EventRecord of an application; the main key is the stored event itself."""
    app_id, event_id = ids(req['project_id'], req['idempotency_key'])
    if app_id == stored['payload']['application_id']:
        return copy.deepcopy(stored)
    event = copy.deepcopy(stored)
    event.update(event_id=event_id, idempotency_key=app_id, thread_id=reserved[0], sequence_id=sequence)
    event['payload'].update(application_id=app_id, new_thread_id=reserved[0], new_branch_id=reserved[1])
    return event


def receipt_for(base_receipt, event):
    value = copy.deepcopy(base_receipt)
    value.update(event_id=event['event_id'], sequence_id=event['sequence_id'])
    return value


def result_value(kind, reserved=None, receipt=None, reason=None):
    if kind is None:
        return None
    return {'result': kind, 'reason_code': reason,
            'new_thread_id': reserved[0] if kind == 'branched' else None,
            'new_branch_id': reserved[1] if kind == 'branched' else None,
            'receipt': copy.deepcopy(receipt) if kind == 'branched' else None}


def with_ref(refs, app_id):
    return list(refs) + ['application:' + app_id]


def failing(run):
    """The single failed SP-2202 step-1 / UCC-126 precondition, from inputs only."""
    gate, req, seen = run['gate'], run['request'], run['point_seen']
    if gate['writer_cutoff']:
        return 'writer_cutoff'
    if gate['family'] != 'registered':
        return 'family'
    if gate['storage'] == 'read_only':
        return 'storage_read_only'
    if gate['storage'] == 'io_exhausted':
        return 'storage_io_exhausted'
    if seen is None:
        return 'point_missing'
    if seen['project_id'] != req['project_id']:
        return 'project'
    if seen['status'] != 'available':
        return 'status'
    if req['expected_restore_point_sha256'] != seen['record_sha256']:
        return 'hash'
    if req['source_thread_id'] != seen['source_thread_id']:
        return 'source_thread'
    if gate['permission'] != 'allowed':
        return 'permission'
    if gate['hold']:
        return 'hold'
    if gate['operation_in_progress']:
        return 'operation_in_progress'
    if gate['source_content'] != 'available':
        return 'source_content'
    return None


def scenario_runs(case):
    sr = case.get('sr')
    if not isinstance(sr, dict) or not isinstance(sr.get('runs'), list):
        return None
    return sr['runs']


# ---------------------------------------------------------------- expectations

def expect(case, i):
    """Expected protocol outcome of run i from independent inputs and prior runs."""
    sr = case['sr']; run = sr['runs'][i]; kind = run['kind']
    prior = sr['runs'][run['of']] if 'of' in run else None
    app_id, event_id = ids(run['request']['project_id'], run['request']['idempotency_key'])
    reserved = run.get('reserved')
    seen_refs = run['point_seen']['protecting_refs'] if run['point_seen'] is not None else None
    out = {'kind': kind, 'app_id': app_id, 'event_id': event_id, 'reserved': reserved}
    if kind == 'execute':
        fail = failing(run)
        if fail:
            out.update(result='not_branched', reason=TOKENS.get(fail), record='absent', events=0, branches=[],
                       trace=['admission_preflight', 'publish_result'], protect=copy.deepcopy(seen_refs), targets=(None, None))
        elif run['gate']['reserve_transaction'] != 'committed':
            out.update(result='not_branched', reason='storage_io_exhausted', record='not_branched', events=0,
                       branches=[], trace=['admission_preflight', 'reserve_terminal', 'publish_result'],
                       protect=list(seen_refs), targets=(None, None))
        elif run.get('crash_at'):
            at = run['crash_at']; n = FULL.index(at)
            out.update(result=None, reason=None,
                       record=None if n < FULL.index('record_materialization') else 'branched',
                       events=1 if n >= FULL.index('barrier_append') else 0,
                       branches=[list(reserved)] if n >= FULL.index('materialize') else [],
                       trace=FULL[:n + 1] + ['crash'],
                       protect=with_ref(seen_refs, app_id) if n >= FULL.index('record_materialization') else list(seen_refs),
                       targets=None)
        else:
            out.update(result='branched', reason=None, record='branched', events=1, branches=[list(reserved)],
                       trace=list(FULL), protect=with_ref(seen_refs, app_id), targets=tuple(reserved))
    elif kind == 'resume':
        at = prior['crash_at']; n = FULL.index(at)
        out.update(result='branched', reason=None, record='branched',
                   events=1 if n < FULL.index('barrier_append') else 0,
                   branches=[list(reserved)] if at == 'reserve_pending' else [],
                   trace=list(RESUME[at]),
                   protect=with_ref(seen_refs, app_id) if n < FULL.index('record_materialization') else list(seen_refs),
                   targets=tuple(reserved))
    elif kind == 'replay':
        recorded = prior.get('companion_after')
        trace = ['dedupe_lookup', 'publish_result'] if recorded is not None else ['admission_preflight', 'publish_result']
        out.update(events=0, branches=[], trace=trace, protect=list(seen_refs))
    elif kind == 'conflict':
        out.update(events=0, branches=[], trace=['dedupe_lookup', 'refuse_conflict'], protect=list(seen_refs))
    return out


def mapped(result):
    if not isinstance(result, dict):
        return None
    if result.get('result') in ('refused', 'failed'):
        return 'not_branched'
    return result.get('result')


def recorded(companion_value):
    if companion_value is None:
        return 'absent'
    if not isinstance(companion_value, dict):
        return 'malformed'
    if companion_value.get('result') in ('refused', 'failed'):
        return 'not_branched'
    return companion_value.get('result')


def recorded_result(sr, row):
    """The command result a replay must return: the row's recorded result and, for
    branched, the reserved targets and the event's independently held first receipt."""
    if not isinstance(row, dict):
        return None
    if row.get('result') == 'branched':
        return result_value('branched', (row.get('reserved_new_thread_id'), row.get('reserved_new_branch_id')),
                            sr.get('receipts', {}).get(row.get('event_id')))
    return result_value(row.get('result'), reason=row.get('reason_code'))


def application_origin(case, i):
    """The run whose step 4 recorded this run's application obligation."""
    runs = case['sr']['runs']; run = runs[i]
    if run['kind'] == 'resume':
        prior = runs[run['of']]
        return prior if FULL.index(prior['crash_at']) >= FULL.index('record_materialization') else run
    return run


# ---------------------------------------------------------------- operands

def operands(case, put, common):
    runs = scenario_runs(case)
    if runs is None:
        put('sr_app_schema', ['boundary record missing'])
        return
    sr = case['sr']
    expected = [expect(case, i) for i in range(len(runs))]
    executes = [i for i, r in enumerate(runs) if r['kind'] in ('execute', 'resume')]
    put('sr_app_result', [mapped(runs[i]['result']) for i in executes], [expected[i]['result'] for i in executes])
    left = []; right = []
    for i in executes:
        res = runs[i]['result']
        if expected[i]['result'] == 'not_branched':
            token = expected[i]['reason']
            reason = res.get('reason_code') if isinstance(res, dict) else None
            left.append(reason if token else bool(reason)); right.append(token if token else True)
        elif isinstance(res, dict):
            left.append(res.get('reason_code')); right.append(None)
    put('sr_app_reason', left, right)
    put('sr_app_record', [recorded(runs[i].get('companion_after')) for i in executes],
        [expected[i]['record'] for i in executes])
    put('sr_app_events', [len(r.get('events_appended', [])) for r in runs], [e['events'] for e in expected])
    put('sr_app_branches', [r.get('branches_created') for r in runs], [e['branches'] for e in expected])
    left = []; right = []
    for i in executes:
        res = runs[i]['result']
        if expected[i]['targets'] is None:
            left.append(res); right.append(None)
        else:
            left.append((res.get('new_thread_id'), res.get('new_branch_id')) if isinstance(res, dict) else None)
            right.append(expected[i]['targets'])
    put('sr_app_targets', left, right)
    put('sr_app_order', [r.get('trace') for r in runs], [e['trace'] for e in expected])
    left = []; right = []
    for i, r in enumerate(runs):
        if r['kind'] != 'replay':
            continue
        prior = runs[r['of']]; row = prior.get('companion_after')
        left.append((r.get('result'), r.get('companion_after')))
        right.append((recorded_result(sr, row), row))
    put('sr_app_replay', left, right)
    # Custody rows: rows written or advanced by an execution/resumption.
    left = []; right = []
    for i in executes:
        row = runs[i].get('companion_after')
        if not isinstance(row, dict):
            continue
        req = runs[i]['request']
        left.append((row.get('command_request'), row.get('command_request_sha256'), row.get('actor_ref'),
                     row.get('project_id'), row.get('restore_point_id'), row.get('source_thread_id')))
        right.append((req, s.jcs_sha(req), req['actor_ref'], req['project_id'], req['restore_point_id'],
                      req['source_thread_id']))
    put('sr_app_request', left, right)
    left = []; right = []
    for i, r in enumerate(runs):
        row = r.get('companion_after')
        if r['kind'] in ('execute', 'resume') and isinstance(row, dict):
            left.append(('row', row.get('application_id'), row.get('event_id')))
            right.append(('row', expected[i]['app_id'],
                          expected[i]['event_id'] if row.get('result') == 'branched' else None))
        for event in r.get('events_appended', []):
            payload_value = event.get('payload', {}) if isinstance(event, dict) else {}
            app_id, event_id = ids(r['request']['project_id'], r['request']['idempotency_key'])
            left.append(('event', event.get('event_id'), event.get('idempotency_key'), payload_value.get('application_id')))
            right.append(('event', event_id, app_id, app_id))
    put('sr_app_identity', left, right)
    left = []; right = []
    for i in executes:
        row = runs[i].get('companion_after')
        if not isinstance(row, dict):
            continue
        origin = runs[runs[i]['of']] if runs[i]['kind'] == 'resume' else runs[i]
        seen = origin['point_seen']
        preflight = row.get('preflight') or {}
        left.append((preflight.get('record_sha256'), preflight.get('protecting_refs_sha256')))
        right.append((seen['record_sha256'], s.jcs_sha(seen['protecting_refs'])) if seen is not None else None)
    put('sr_app_preflight', left, right)
    left = []; right = []
    for i, r in enumerate(runs):
        frozen = r.get('obligation_event')
        if frozen is None:
            continue
        row = r.get('companion_after') or {}
        seen = (runs[r['of']] if r['kind'] == 'resume' else r)['point_seen']
        p = frozen.get('payload', {})
        left.append((p.get('new_thread_id'), p.get('new_branch_id'), frozen.get('thread_id'), p.get('restore_point_id'),
                     p.get('project_id'), p.get('expected_record_hash'), p.get('observed_record_hash'),
                     p.get('source_thread_ref'), p.get('source_branch_ref')))
        right.append((row.get('reserved_new_thread_id'), row.get('reserved_new_branch_id'), row.get('reserved_new_thread_id'),
                      seen['restore_point_id'], seen['project_id'], r['request']['expected_restore_point_sha256'],
                      seen['record_sha256'], seen['source_thread_id'], seen['source_branch_id']))
    put('sr_app_event_join', left, right)
    left = []; right = []
    for i, r in enumerate(runs):
        source = application_origin(case, i) if r['kind'] in ('execute', 'resume') else runs[r['of']]
        frozen = source.get('obligation_event')
        if frozen is None:
            continue  # an append with no recorded obligation is owned by sr_app_events
        for event in r.get('events_appended', []):
            left.append(s.physical_hex(event)); right.append(s.physical_hex(frozen))
    stored_app = case['stored_event']['payload'].get('application_id')
    first = next((r['obligation_event'] for r in runs if r.get('obligation_event') is not None
                  and ids(r['request']['project_id'], r['request']['idempotency_key'])[0] == stored_app), None)
    if first is not None:
        left.append(s.physical_hex(first)); right.append(s.physical_hex(case['stored_event']))
    put('sr_app_obligation', left, right)
    left = []; right = []
    receipts = sr.get('receipts', {})
    for i in executes:
        row = runs[i].get('companion_after'); res = runs[i].get('result')
        if isinstance(row, dict) and row.get('result') == 'branched':
            left.append(row.get('append_receipt_ref')); right.append(s.custody_key(expected[i]['event_id']))
        if isinstance(res, dict) and res.get('result') == 'branched':
            left.append(res.get('receipt')); right.append(receipts.get(expected[i]['event_id']))
    put('sr_app_receipt', left, right)
    put('sr_app_schema', [e for r in runs for e in s.keyword_errors(ROOT, r.get('companion_after'))])
    put('sr_app_time', [e for r in runs for e in s.time_errors(r.get('companion_after'),
                        ('admitted_at_utc', 'materialized_at_utc', 'terminal_at_utc'), w.STORAGE_UTC_Z)])
    put('sr_app_protect', [((r.get('point_after') or {}).get('protecting_refs')) for r in runs],
        [e['protect'] for e in expected])
    strip = lambda pt: {k: v for k, v in pt.items() if k != 'protecting_refs'} if isinstance(pt, dict) else pt
    put('sr_app_point', [strip(r.get('point_after')) for r in runs], [strip(r['point_seen']) for r in runs])
    put('sr_app_source', [r.get('source_after') for r in runs], [sr['source_before']] * len(runs))
    left = []; right = []
    for r in runs:
        if r['kind'] != 'conflict':
            continue
        prior = runs[r['of']]
        res = r.get('result') or {}
        left.append((res.get('result'), res.get('reason_code'), r.get('companion_after')))
        right.append(('refused', TOKENS['conflict'], prior.get('companion_after')))
    put('sr_app_conflict', left, right)


# ---------------------------------------------------------------- fixtures

def run_record(kind, req, gate, seen, **extra):
    value = {'kind': kind, 'request': copy.deepcopy(req), 'gate': copy.deepcopy(gate),
             'point_seen': copy.deepcopy(seen)}
    value.update(extra)
    return value


def simulate(case, run, prior=None):
    """Fixture constructor: the owner-conforming presented outcome of a run.

    Builds what a conforming implementation would present; the checker never
    calls it. Negatives then change exactly one presented value.
    """
    sr = case['sr']; stored = case['stored_event']
    req = run['request']; seen = run['point_seen']
    app_id, event_id = ids(req['project_id'], req['idempotency_key'])
    reserved = run.get('reserved')
    after = copy.deepcopy(seen) if seen is not None else None
    run.update(events_appended=[], branches_created=[], source_after=copy.deepcopy(sr['source_before']),
               obligation_event=None)
    kind = run['kind']
    if kind == 'execute':
        fail = failing(run)
        if fail:
            run.update(trace=['admission_preflight', 'publish_result'], companion_after=None,
                       result=result_value('refused' if fail != 'storage_io_exhausted' else 'failed',
                                           reason=TOKENS.get(fail, fail + '_refused')))
        elif run['gate']['reserve_transaction'] != 'committed':
            run.update(trace=['admission_preflight', 'reserve_terminal', 'publish_result'],
                       companion_after=companion(req, seen, 'settled', 'failed', reason='storage_io_exhausted'),
                       result=result_value('failed', reason='storage_io_exhausted'))
        else:
            event = application_event(stored, req, reserved, sr['next_sequence'])
            receipt = receipt_for(case['original_receipt'], event)
            sr['receipts'][event_id] = copy.deepcopy(receipt)
            at = run.get('crash_at'); n = FULL.index(at) if at else len(FULL)
            if n < FULL.index('record_materialization'):
                run['companion_after'] = companion(req, seen, 'pending', None, reserved=reserved)
            else:
                run['companion_after'] = companion(req, seen, 'settled', 'branched', reserved=reserved)
                run['obligation_event'] = copy.deepcopy(event)
                after['protecting_refs'] = with_ref(after['protecting_refs'], app_id)
            if n >= FULL.index('materialize'):
                run['branches_created'] = [list(reserved)]
            if n >= FULL.index('barrier_append'):
                run['events_appended'] = [copy.deepcopy(event)]
            run['trace'] = FULL[:n + 1] + ['crash'] if at else list(FULL)
            run['result'] = None if at else result_value('branched', reserved, receipt)
    elif kind == 'resume':
        at = prior['crash_at']; n = FULL.index(at)
        event = application_event(stored, req, reserved, sr['next_sequence'])
        receipt = sr['receipts'][event_id]
        run['companion_after'] = companion(req, prior['point_seen'], 'settled', 'branched', reserved=reserved)
        if n < FULL.index('record_materialization'):
            run['obligation_event'] = copy.deepcopy(event)
            after['protecting_refs'] = with_ref(after['protecting_refs'], app_id)
        if at == 'reserve_pending':
            run['branches_created'] = [list(reserved)]
        if n < FULL.index('barrier_append'):
            run['events_appended'] = [copy.deepcopy(event)]
        run['trace'] = list(RESUME[at])
        run['result'] = result_value('branched', reserved, receipt)
    elif kind == 'replay':
        run['companion_after'] = copy.deepcopy(prior.get('companion_after'))
        run['result'] = copy.deepcopy(prior.get('result'))
        run['trace'] = ['dedupe_lookup', 'publish_result'] if prior.get('companion_after') is not None \
            else ['admission_preflight', 'publish_result']
    elif kind == 'conflict':
        run['companion_after'] = copy.deepcopy(prior.get('companion_after'))
        run['result'] = result_value('refused', reason=TOKENS['conflict'])
        run['trace'] = ['dedupe_lookup', 'refuse_conflict']
    run['point_after'] = after
    return run


def scenario(case, runs):
    """Attach a boundary record whose runs are simulated in order."""
    case['sr'] = {'family': APP, 'point_before': point(), 'source_before': copy.deepcopy(case['native_before']),
                  'receipts': {}, 'next_sequence': 42, 'runs': []}
    current = point()
    for spec in runs:
        run = copy.deepcopy(spec)
        if run.get('point_seen', 'chain') == 'chain':
            run['point_seen'] = copy.deepcopy(current)
        prior = case['sr']['runs'][run['of']] if 'of' in run else None
        simulate(case, run, prior)
        if run['point_seen'] is not None and run.get('point_after') is not None and run['point_seen'] == current:
            current = copy.deepcopy(run['point_after'])
        case['sr']['runs'].append(run)
        if run['kind'] == 'execute' and run.get('reserved') and run['request']['idempotency_key'] != 'request-A':
            case['sr']['next_sequence'] += 1
    return case


RESERVED_A = ('thread-new-A', 'branch-new-A')
RESERVED_B = ('thread-new-B', 'branch-new-B')


def branched_runs():
    a = request(); b = request('request-B')
    changed = request(new_thread_title='other title')
    return [
        {'kind': 'execute', 'request': a, 'gate': GATE, 'reserved': RESERVED_A},
        {'kind': 'replay', 'request': a, 'gate': GATE, 'of': 0, 'reserved': RESERVED_A},
        {'kind': 'conflict', 'request': changed, 'gate': GATE, 'of': 0, 'reserved': RESERVED_A},
        {'kind': 'execute', 'request': b, 'gate': GATE, 'reserved': RESERVED_B},
    ]


def augment(control):
    scenario(control, branched_runs())


PRECONDITIONS = [
    ('writer-cutoff', {'gate': {'writer_cutoff': True}}),
    ('missing-family', {'gate': {'family': 'missing'}}),
    ('storage-read-only', {'gate': {'storage': 'read_only'}}),
    ('storage-io-exhausted', {'gate': {'storage': 'io_exhausted'}}),
    ('point-missing', {'point_seen': None}),
    ('wrong-project', {'point': {'project_id': 'project-other'}}),
    ('status-expired', {'point': {'status': 'expired'}}),
    ('status-deleted', {'point': {'status': 'deleted'}}),
    ('status-corrupt', {'point': {'status': 'corrupt'}}),
    ('expected-hash-mismatch', {'request': {'expected_restore_point_sha256': 'b' * 64}}),
    ('wrong-source-thread', {'request': {'source_thread_id': 'thread-other'}}),
    ('permission-denied', {'gate': {'permission': 'denied'}}),
    ('hold', {'gate': {'hold': True}}),
    ('operation-in-progress', {'gate': {'operation_in_progress': True}}),
    ('source-content-deleted', {'gate': {'source_content': 'deleted'}}),
]
CRASHES = ['reserve_pending', 'materialize', 'record_materialization', 'barrier_append', 'first_receipt']


def refused_runs(change):
    gate = dict(GATE, **change.get('gate', {}))
    req = request(**change.get('request', {}))
    run = {'kind': 'execute', 'request': req, 'gate': gate, 'reserved': RESERVED_A}
    if 'point_seen' in change:
        run['point_seen'] = None
    elif 'point' in change:
        run['point_seen'] = dict(point(), **change['point'])
    # Replay of a refusal that wrote no row re-runs admission on unchanged
    # inputs and must return the same no-event result (ACD-086, ATS K37).
    again = dict(run, replay_of=0)
    return [run, again]


def row_copies(value, app_id):
    """Every run snapshot of one commit row (the same stored object)."""
    return [i for i, r in enumerate(value['sr']['runs'])
            if isinstance(r.get('companion_after'), dict) and r['companion_after'].get('application_id') == app_id]


def mutate_row(control, row, key_path, replacement, label, app_id=None):
    import pm_s3bo_cases as c
    value = copy.deepcopy(control['value'])
    app_id = app_id or ids(w.PROJECT, 'request-A')[0]
    copies = row_copies(value, app_id)
    for i in copies:
        c.set_path(value, ('sr', 'runs', i, 'companion_after') + tuple(key_path), replacement)
    return c.negative(control, row, label, value, {'commit_row': app_id, 'copies': copies, 'path': list(key_path),
                                                   'replacement': repr(replacement)[:160]})


def cases():
    import pm_s3bo_cases as c
    controls = []; negatives = []
    base = w.build(APP)
    main = s.control(APP, 'sr/branched', base)
    controls.append(main)
    R = lambda i, *path: ('sr', 'runs', i) + path
    for row, path, replacement, label in [
            ('sr_app_targets', R(0, 'result', 'new_branch_id'), 'branch-new-B', 'result-wrong-target'),
            ('sr_app_order', R(0, 'trace'), FULL[:5] + ['publish_result', 'first_receipt'], 'result-before-receipt'),
            ('sr_app_order', R(0, 'trace'), FULL[:3] + ['barrier_append', 'record_materialization'] + FULL[5:], 'append-before-record'),
            ('sr_app_order', R(0, 'trace'), [FULL[0], FULL[2], FULL[1]] + FULL[3:], 'materialize-before-reserve'),
            ('sr_app_replay', R(1, 'result', 'receipt', 'sequence_id'), 99, 'replay-other-receipt'),
            ('sr_app_replay', R(1, 'result', 'new_thread_id'), 'thread-new-B', 'replay-changed-target'),
            ('sr_app_events', R(1, 'events_appended'), [base['stored_event']], 'replay-duplicate-append'),
            ('sr_app_branches', R(1, 'branches_created'), [list(RESERVED_A)], 'replay-second-branch'),
            ('sr_app_identity', R(3, 'companion_after', 'application_id'), ids(w.PROJECT, 'request-A')[0], 'reused-application-id'),
            ('sr_app_receipt', R(0, 'result', 'receipt', 'byte_offset'), 1024, 'result-receipt'),
            ('sr_app_protect', R(0, 'point_after', 'protecting_refs'), ['source-lineage:message-A'], 'missing-application-ref'),
            ('sr_app_protect', R(1, 'point_after', 'protecting_refs'), ['source-lineage:message-A'], 'replay-releases-ref'),
            ('sr_app_point', R(0, 'point_after', 'status'), 'expired', 'point-consumed'),
            ('sr_app_point', R(0, 'point_after', 'record_sha256'), 'c' * 64, 'point-rewritten'),
            ('sr_app_conflict', R(2, 'companion_after', 'command_request', 'new_thread_title'), 'other title', 'conflict-overwrites'),
            ('sr_app_conflict', R(2, 'result', 'result'), 'branched', 'conflict-branches')]:
        negatives.append(c.mutate(main, row, path, replacement, label))
    for row, key_path, replacement, label in [
            ('sr_app_request', ('command_request_sha256',), 'c' * 64, 'request-digest'),
            ('sr_app_request', ('actor_ref',), 'actor-other', 'request-actor'),
            ('sr_app_request', ('command_request', 'new_thread_title'), 'other title', 'request-substituted'),
            ('sr_app_preflight', ('preflight', 'protecting_refs_sha256'), 'c' * 64, 'preflight-refs'),
            ('sr_app_preflight', ('preflight', 'record_sha256'), 'c' * 64, 'preflight-hash'),
            ('sr_app_receipt', ('append_receipt_ref',), s.custody_key('other-event'), 'receipt-custody-key'),
            ('sr_app_schema', ('extra',), 'message-body', 'commit-extra'),
            ('sr_app_schema', ('redaction_profile',), 'no_secrets', 'commit-redaction'),
            ('sr_app_schema', ('state',), 'pending', 'branched-row-pending'),
            ('sr_app_time', ('materialized_at_utc',), '2026-11-14T12:00:00+00:00', 'commit-time-offset'),
            ('sr_app_time', ('admitted_at_utc',), '2026-11-14t12:00:00z', 'commit-time-lowercase')]:
        negatives.append(mutate_row(main, row, key_path, replacement, label))
    for key in ('thread', 'branch', 'worktree', 'files', 'index', 'queue', 'safe_points'):
        negatives.append(c.mutate(main, 'sr_app_source', R(0, 'source_after', key), 'modified-source', 'source-' + key))
    # Event joins on the second application (not the stored event): change the
    # frozen obligation and the appended copy together.
    for field, replacement in [('observed_record_hash', 'b' * 64), ('new_branch_id', 'branch-other'),
                               ('source_thread_ref', 'thread-other'), ('restore_point_id', 'rpc_' + '2' * 64)]:
        value = copy.deepcopy(main['value'])
        for path in (R(3, 'obligation_event', 'payload', field), R(3, 'events_appended', 0, 'payload', field)):
            c.set_path(value, path, replacement)
        negatives.append(c.negative(main, 'sr_app_event_join', 'event-join-' + field, value,
                                    {'paths': 'obligation and appended copy of application B', 'field': field}))
    value = copy.deepcopy(main['value'])
    for path in (R(3, 'obligation_event', 'thread_id'), R(3, 'events_appended', 0, 'thread_id')):
        c.set_path(value, path, 'thread-source')
    negatives.append(c.negative(main, 'sr_app_event_join', 'envelope-source-thread', value,
                                {'paths': 'envelope thread set to the source thread on both copies'}))
    negatives.append(c.mutate(main, 'sr_app_obligation', R(3, 'events_appended', 0, 'actor_ref'), 'actor-other', 'appended-differs-from-obligation'))
    negatives.append(c.mutate(main, 'sr_app_obligation', R(0, 'obligation_event', 'correlation_id'), 'correlation-other', 'obligation-differs-from-stored'))
    value = copy.deepcopy(main['value'])
    for path in (R(3, 'obligation_event', 'idempotency_key'), R(3, 'events_appended', 0, 'idempotency_key')):
        c.set_path(value, path, 'request-B')
    negatives.append(c.negative(main, 'sr_app_identity', 'event-key-not-application-id', value,
                                {'paths': 'EventRecord key set to the raw request key on both copies'}))
    # Every refused/failed precondition: the control, then a branched claim.
    for label, change in PRECONDITIONS:
        value = w.build(APP)
        scenario(value, refused_runs(change))
        control = s.control(APP, 'sr/refused/' + label, value)
        controls.append(control)
        negatives.append(c.mutate(control, 'sr_app_result', ('sr', 'runs', 0, 'result', 'result'), 'branched', 'claims-branched'))
        negatives.append(c.mutate(control, 'sr_app_source', ('sr', 'runs', 1, 'source_after', 'queue'), ['dequeued'], 'replay-mutates-queue'))
        if label in ('storage-read-only', 'storage-io-exhausted', 'operation-in-progress', 'source-content-deleted'):
            negatives.append(c.mutate(control, 'sr_app_reason', ('sr', 'runs', 0, 'result', 'reason_code'), 'permission_denied', 'wrong-reason-token'))
        else:
            negatives.append(c.mutate(control, 'sr_app_reason', ('sr', 'runs', 0, 'result', 'reason_code'), '', 'empty-reason'))
        if label != 'point-missing':
            negatives.append(c.mutate(control, 'sr_app_record', ('sr', 'runs', 0, 'companion_after'),
                                      companion(value['sr']['runs'][0]['request'], value['sr']['runs'][0]['point_seen'],
                                                'settled', 'refused', reason='refused'),
                                      'preflight-refusal-writes-row'))
        negatives.append(c.mutate(control, 'sr_app_events', ('sr', 'runs', 0, 'events_appended'), [value['stored_event']], 'refusal-appends'))
        negatives.append(c.mutate(control, 'sr_app_targets', ('sr', 'runs', 0, 'result', 'new_thread_id'), 'thread-new-A', 'refusal-returns-target'))
    # A refusal decided inside the step-2 transaction: terminal row, no IDs.
    value = w.build(APP)
    scenario(value, [{'kind': 'execute', 'request': request(), 'gate': dict(GATE, reserve_transaction='io_exhausted'),
                      'reserved': RESERVED_A},
                     {'kind': 'replay', 'request': request(), 'gate': GATE, 'of': 0, 'reserved': RESERVED_A}])
    control = s.control(APP, 'sr/failed-at-reserve', value)
    controls.append(control)
    negatives.append(c.mutate(control, 'sr_app_replay', ('sr', 'runs', 1, 'result', 'result'), 'branched', 'replay-branches-after-failure'))
    negatives.append(mutate_row(control, 'sr_app_schema', ('reserved_new_thread_id',), 'thread-new-A', 'failed-row-with-target'))
    negatives.append(mutate_row(control, 'sr_app_schema', ('terminal_at_utc',), None, 'failed-row-without-terminal-time'))
    # Crash at every step, then the owner resumption.
    for at in CRASHES:
        value = w.build(APP)
        scenario(value, [{'kind': 'execute', 'request': request(), 'gate': GATE, 'reserved': RESERVED_A, 'crash_at': at},
                         {'kind': 'resume', 'request': request(), 'gate': GATE, 'of': 0, 'reserved': RESERVED_A}])
        control = s.control(APP, 'sr/crash-after-' + at, value)
        controls.append(control)
        negatives.append(c.mutate(control, 'sr_app_result', ('sr', 'runs', 1, 'result', 'result'), 'failed', 'resume-fails'))
        negatives.append(c.mutate(control, 'sr_app_order', ('sr', 'runs', 1, 'trace'),
                                  value['sr']['runs'][1]['trace'][:-1][:-1] + ['publish_result', value['sr']['runs'][1]['trace'][-2]],
                                  'resume-publishes-early'))
        if at in ('reserve_pending', 'materialize'):
            negatives.append(c.mutate(control, 'sr_app_branches', ('sr', 'runs', 1, 'branches_created'),
                                      [['thread-new-C', 'branch-new-C']] if at == 'reserve_pending' else [list(RESERVED_A)],
                                      'resume-second-branch'))
            negatives.append(c.mutate(control, 'sr_app_events', ('sr', 'runs', 0, 'events_appended'),
                                      [value['stored_event']], 'append-before-record'))
        else:
            negatives.append(c.mutate(control, 'sr_app_events', ('sr', 'runs', 1, 'events_appended'),
                                      [value['stored_event']] * (2 if at == 'record_materialization' else 1), 'resume-reappends'))
        negatives.append(c.mutate(control, 'sr_app_protect', ('sr', 'runs', 1, 'point_after', 'protecting_refs'),
                                  ['source-lineage:message-A', 'application:' + ids(w.PROJECT, 'request-A')[0]] * 2, 'duplicate-protecting-ref'))
    return controls, negatives


def corpus_slots(control):
    """Every commit-row timestamp copy of each application, changed together."""
    runs = scenario_runs(control['value']) or []
    by_app = {}
    for i, r in enumerate(runs):
        row = r.get('companion_after')
        if isinstance(row, dict):
            for key in ('admitted_at_utc', 'materialized_at_utc', 'terminal_at_utc'):
                if row.get(key) is not None:
                    by_app.setdefault((row['application_id'], key, row.get('state'), row.get('result')), []).append(
                        ('sr', 'runs', i, 'companion_after', key))
    groups = {}
    for (app_id, key, _state, _result), paths in by_app.items():
        groups.setdefault((app_id, key), []).extend(paths)
    for (app_id, key), paths in groups.items():
        yield {'paths': paths, 'kind': 'datetime', 'row': 'sr_app_time', 'profile': w.STORAGE_UTC_Z,
               'type_rows': ['sr_app_schema', 'sr_app_time']}
