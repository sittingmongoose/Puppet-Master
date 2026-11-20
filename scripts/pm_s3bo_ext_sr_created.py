"""C12-SR: restore_point.created creation-custody boundary (ACD-465, SP-281).

Owner clauses: ACD-465 "Restore-point created native and historical consumers"
(three-barrier producer protocol, category-separated frozen capture, union and
set equalities, no manufactured split, rpc_ identity, crash recovery, native
completion predicate) and "Immutable capture hash and adoption"
(pm.restore_point.immutable_capture_sha256.v1 over the exact thirteen fields,
RFC 8785 UTF-8, lifecycle/hold independence), ATS RSC-P01..P03 / RSC-N01..N03,
and the owner hash vectors in Plans/restore_point_created_hash_vectors.json.

NOT closed here, and reported as an owner question: no owner text defines how
the creation owner selects conversation-history properties into the four
capture categories (the L05 source map, 2026-09-22, found no such constructor).
This module therefore checks that the event and record preserve the frozen
capture exactly as the pending companion holds it; it never constructs or
infers a category assignment, and it treats a category as lawfully empty only
when the frozen capture records it empty. Native execution remains NOT_RUN.
"""
import copy

import pm_s3bo_oracles as w
import pm_s3bo_sr_common as s

LANE = 'sr'
CRE = 'restore_point.created'
FAMILIES = (CRE,)
FIELDS = ['schema_id', 'schema_version', 'project_id', 'restore_point_id', 'source_thread_id', 'source_branch_id',
          'source_message_id', 'context_provenance_refs', 'attachment_refs', 'citation_refs', 'safe_point_id',
          'created_at_utc', 'redaction_profile']
VECTORS = w.read_json('Plans/restore_point_created_hash_vectors.json')
TRACE = ['admission', 'b1_point_and_pending_companion', 'b2_barrier_append', 'b2_first_receipt',
         'b3_commit_marker', 'publish_success']
RESUME = {'b1_point_and_pending_companion': ['resume_frozen_input', 'b2_barrier_append', 'b2_first_receipt', 'b3_commit_marker', 'publish_success'],
          'b2_barrier_append': ['resume_frozen_input', 'resolve_original_receipt', 'b3_commit_marker', 'publish_success'],
          'b2_first_receipt': ['resume_frozen_input', 'resolve_original_receipt', 'b3_commit_marker', 'publish_success'],
          'b3_commit_marker': ['return_original_result']}
CAPTURE = {'context_refs': ['ctx-A'], 'provenance_refs': ['prov-A', 'prov-B'], 'attachment_refs': ['att-A'],
           'citation_refs': []}

ROWS = [
    ('sr_cre_hash', 'sr_created', 'equal', 'record_sha256, the payload record_hash and the companion hash are the RFC 8785 SHA-256 of exactly the thirteen immutable fields.'),
    ('sr_cre_union', 'sr_created', 'equal', 'The unique union of context and provenance refs equals the canonical merged list; attachment and citation sets equal theirs.'),
    ('sr_cre_split', 'sr_created', 'equal', 'Each payload category is exactly the frozen capture category, in frozen order; no split is manufactured from the merged record field.'),
    ('sr_cre_identity', 'sr_created', 'equal', 'restore_point_id and event_id follow the rpc_ recipe of project and command idempotency key.'),
    ('sr_cre_joins', 'sr_created', 'equal', 'Payload source thread, branch, boundary, record ref, project, safe point and creation time join the canonical record.'),
    ('sr_cre_barriers', 'sr_created', 'equal', 'B1 writes point and pending companion together, B2 appends the frozen input unchanged, B3 marks committed; recovery resumes, never recaptures.'),
    ('sr_cre_events', 'sr_created', 'equal', 'One creation appends exactly one restore_point.created; retries after B2 and replays append nothing.'),
    ('sr_cre_completion', 'sr_created', 'equal', 'A point is complete only with a committed companion and matching event; pending or forged markers are unavailable.'),
]


def ids(project, key):
    digest = w.sha(w.lp('restore_point.created/create/v1', project, key))
    return 'rpc_' + digest, 'er_rpc_' + digest


POINT_ID, EVENT_ID = ids(w.PROJECT, 'request-A')


def record(**changes):
    value = {'schema_id': 'pm.storage_value.restore_point_record.v1', 'schema_version': '1.0.0', 'project_id': w.PROJECT,
             'restore_point_id': POINT_ID, 'source_thread_id': 'thread-source', 'source_branch_id': 'branch-source',
             'source_message_id': 'message-A',
             'context_provenance_refs': CAPTURE['context_refs'] + CAPTURE['provenance_refs'],
             'attachment_refs': list(CAPTURE['attachment_refs']), 'citation_refs': list(CAPTURE['citation_refs']),
             'safe_point_id': None, 'created_at_utc': w.TIME, 'redaction_profile': 'no_secrets', 'status': 'available',
             'hold_refs': []}
    value.update(changes)
    value['record_sha256'] = capture_hash(value)
    return value


def capture_hash(value):
    return s.jcs_sha({k: value[k] for k in FIELDS})


def payload(p, project):
    rec = record()
    p.update(restore_point_id=POINT_ID, project_id=w.PROJECT, source_thread_ref='thread-source',
             source_branch_ref='branch-source', message_boundary_ref='message-A',
             record_ref='rp:' + w.PROJECT + ':' + POINT_ID, record_hash=rec['record_sha256'],
             context_refs=list(CAPTURE['context_refs']), provenance_refs=list(CAPTURE['provenance_refs']),
             attachment_refs=list(CAPTURE['attachment_refs']), citation_refs=list(CAPTURE['citation_refs']),
             created_at_utc=w.TIME)


def envelope(event):
    event['event_id'] = EVENT_ID


def runs_of(case):
    sr = case.get('sr')
    if not isinstance(sr, dict) or not isinstance(sr.get('runs'), list):
        return None
    return sr['runs']


def expect(sr, i):
    run = sr['runs'][i]; kind = run['kind']
    if kind == 'create':
        at = run.get('crash_at')
        if at:
            n = TRACE.index(at)
            return {'events': 1 if n >= TRACE.index('b2_barrier_append') else 0, 'trace': TRACE[:n + 1] + ['crash'],
                    'completion': 'complete' if n >= TRACE.index('b3_commit_marker') else 'unavailable_in_progress'}
        return {'events': 1, 'trace': list(TRACE), 'completion': 'complete'}
    if kind == 'resume':
        at = sr['runs'][run['of']]['crash_at']
        return {'events': 1 if at == 'b1_point_and_pending_companion' else 0, 'trace': list(RESUME[at]),
                'completion': 'complete'}
    if kind == 'replay':
        return {'events': 0, 'trace': ['dedupe_lookup', 'return_original_result'], 'completion': 'complete'}
    if kind == 'conflict':
        return {'events': 0, 'trace': ['dedupe_lookup', 'refuse_conflict'], 'completion': 'complete'}
    if kind == 'read':
        companion = run['companion_seen']
        complete = companion is not None and companion.get('state') == 'committed' and companion.get('marker_valid') \
            and run.get('matching_event')
        return {'events': 0, 'trace': ['passive_read'],
                'completion': 'complete' if complete else ('integrity_unavailable' if companion and companion.get('state') == 'committed' else 'unavailable_in_progress')}
    return {'events': 0, 'trace': None, 'completion': None}


def operands(case, put, common):
    runs = runs_of(case)
    if runs is None:
        put('sr_cre_hash', ['boundary record missing'], [])
        return
    sr = case['sr']; rec = sr['record']; frozen = sr['frozen_capture']
    left = [rec.get('record_sha256'), sr['companion'].get('record_sha256')]; right = [capture_hash(rec)] * 2
    events = [e for r in runs for e in r.get('events_appended', [])]
    for e in events:
        left.append(e.get('payload', {}).get('record_hash')); right.append(capture_hash(rec))
    for vector in sr.get('vectors', []):
        left.append(capture_hash(vector['record'])); right.append(vector['expected_sha256'])
    put('sr_cre_hash', left, right)
    left = []; right = []
    for e in events:
        p = e.get('payload', {})
        union = list(dict.fromkeys(p.get('context_refs', []) + p.get('provenance_refs', [])))
        left.append((sorted(union), sorted(set(p.get('attachment_refs', []))), sorted(set(p.get('citation_refs', [])))))
        right.append((sorted(rec['context_provenance_refs']), sorted(rec['attachment_refs']), sorted(rec['citation_refs'])))
    put('sr_cre_union', left, right)
    left = []; right = []
    for e in events:
        p = e.get('payload', {})
        left.append(tuple(p.get(k) for k in ('context_refs', 'provenance_refs', 'attachment_refs', 'citation_refs')))
        right.append(tuple(frozen[k] for k in ('context_refs', 'provenance_refs', 'attachment_refs', 'citation_refs')))
    put('sr_cre_split', left, right)
    point_id, event_id = ids(sr['request']['project_id'], sr['request']['idempotency_key'])
    left = [(rec.get('restore_point_id'), sr['companion'].get('restore_point_id'))]; right = [(point_id, point_id)]
    for e in events:
        left.append((e.get('event_id'), e.get('payload', {}).get('restore_point_id'))); right.append((event_id, point_id))
    put('sr_cre_identity', left, right)
    left = []; right = []
    for e in events:
        p = e.get('payload', {})
        left.append((p.get('source_thread_ref'), p.get('source_branch_ref'), p.get('message_boundary_ref'), p.get('record_ref'),
                     p.get('project_id'), e.get('project_id'), 'safe_point_id' in p, p.get('safe_point_id'), p.get('created_at_utc')))
        right.append((rec['source_thread_id'], rec['source_branch_id'], rec['source_message_id'],
                      'rp:' + rec['project_id'] + ':' + rec['restore_point_id'], rec['project_id'], rec['project_id'],
                      rec['safe_point_id'] is not None, rec['safe_point_id'], rec['created_at_utc']))
    put('sr_cre_joins', left, right)
    expected = [expect(sr, i) for i in range(len(runs))]
    left = [r.get('trace') for r in runs]; right = [e['trace'] for e in expected]
    for r in runs:
        if r['kind'] == 'resume':
            prior = runs[r['of']]
            left.append(s.physical_hex(r.get('frozen_input'))); right.append(s.physical_hex(prior.get('frozen_input')))
    put('sr_cre_barriers', left, right)
    put('sr_cre_events', [len(r.get('events_appended', [])) for r in runs], [e['events'] for e in expected])
    put('sr_cre_completion', [r.get('completion') for r in runs], [e['completion'] for e in expected])


def simulate(case, sr, run):
    """Fixture constructor of the owner-conforming presented run (never called by the checker)."""
    kind = run['kind']; event = case['stored_event']
    run.update(events_appended=[])
    if kind == 'create':
        at = run.get('crash_at'); n = TRACE.index(at) if at else len(TRACE)
        run['frozen_input'] = copy.deepcopy(event)
        if n >= TRACE.index('b2_barrier_append'):
            run['events_appended'] = [copy.deepcopy(event)]
        run['trace'] = TRACE[:n + 1] + ['crash'] if at else list(TRACE)
        run['completion'] = 'complete' if n >= TRACE.index('b3_commit_marker') else 'unavailable_in_progress'
    elif kind == 'resume':
        prior = sr['runs'][run['of']]; at = prior['crash_at']
        run['frozen_input'] = copy.deepcopy(prior['frozen_input'])
        if at == 'b1_point_and_pending_companion':
            run['events_appended'] = [copy.deepcopy(prior['frozen_input'])]
        run['trace'] = list(RESUME[at]); run['completion'] = 'complete'
    elif kind == 'replay':
        run.update(trace=['dedupe_lookup', 'return_original_result'], completion='complete')
    elif kind == 'conflict':
        run.update(trace=['dedupe_lookup', 'refuse_conflict'], completion='complete')
    elif kind == 'read':
        run['trace'] = ['passive_read']
    return run


def scenario(case, runs, vectors=False):
    rec = record()
    sr = {'family': CRE, 'request': {'command_id': 'cmd.chat.create_restore_point', 'project_id': w.PROJECT,
                                     'thread_id': 'thread-source', 'source_message_id': 'message-A',
                                     'idempotency_key': 'request-A'},
          'record': rec, 'frozen_capture': copy.deepcopy(CAPTURE),
          'companion': {'restore_point_id': POINT_ID, 'record_sha256': rec['record_sha256'], 'state': 'committed'},
          'runs': []}
    if vectors:
        sr['vectors'] = copy.deepcopy(VECTORS['vectors'])
    case['sr'] = sr
    for spec in runs:
        run = copy.deepcopy(spec)
        simulate(case, sr, run)
        sr['runs'].append(run)
        if run['kind'] == 'read':
            run['completion'] = expect(sr, len(sr['runs']) - 1)['completion']
    return case


def augment(control):
    scenario(control, [{'kind': 'create'}, {'kind': 'replay'}, {'kind': 'conflict'},
                       {'kind': 'read', 'companion_seen': {'state': 'committed', 'marker_valid': True}, 'matching_event': True},
                       {'kind': 'read', 'companion_seen': {'state': 'pending_append', 'marker_valid': True}, 'matching_event': False},
                       {'kind': 'read', 'companion_seen': {'state': 'committed', 'marker_valid': False}, 'matching_event': True},
                       {'kind': 'read', 'companion_seen': None, 'matching_event': True}], vectors=True)


def cases():
    import pm_s3bo_cases as c
    controls = []; negatives = []
    base = w.build(CRE)
    main = s.control(CRE, 'sr/creation', base)
    controls.append(main)
    R = lambda i, *path: ('sr', 'runs', i) + path
    for row, path, replacement, label in [
            ('sr_cre_hash', ('sr', 'record', 'record_sha256'), 'f' * 64, 'record-hash-not-recipe'),
            ('sr_cre_hash', ('sr', 'companion', 'record_sha256'), 'f' * 64, 'companion-hash-mismatch'),
            ('sr_cre_hash', ('sr', 'vectors', 5, 'expected_sha256'), VECTORS['vectors'][0]['expected_sha256'], 'array-order-ignored'),
            ('sr_cre_hash', ('sr', 'vectors', 8, 'expected_sha256'), VECTORS['vectors'][0]['expected_sha256'], 'unicode-normalized'),
            ('sr_cre_events', R(1, 'events_appended'), [base['stored_event']], 'replay-appends'),
            ('sr_cre_barriers', R(0, 'trace'), ['admission', 'b2_barrier_append', 'b1_point_and_pending_companion'] + TRACE[3:], 'append-before-b1'),
            ('sr_cre_barriers', R(0, 'trace'), TRACE[:4] + ['publish_success', 'b3_commit_marker'], 'success-before-marker'),
            ('sr_cre_completion', R(4, 'completion'), 'complete', 'pending-companion-complete'),
            ('sr_cre_completion', R(5, 'completion'), 'complete', 'forged-marker-complete'),
            ('sr_cre_completion', R(6, 'completion'), 'complete', 'available-without-companion-complete')]:
        negatives.append(c.mutate(main, row, path, replacement, label))
    for field, replacement, row in [('record_hash', 'f' * 64, 'sr_cre_hash'), ('context_refs', ['ctx-A', 'prov-A'], 'sr_cre_split'),
                                    ('provenance_refs', ['prov-B', 'prov-A'], 'sr_cre_split'),
                                    ('citation_refs', ['cit-invented'], 'sr_cre_union'),
                                    ('attachment_refs', [], 'sr_cre_union'),
                                    ('source_branch_ref', 'branch-other', 'sr_cre_joins'),
                                    ('message_boundary_ref', 'message-B', 'sr_cre_joins'),
                                    ('safe_point_id', 'safe-point-invented', 'sr_cre_joins'),
                                    ('restore_point_id', 'rpc_' + 'e' * 64, 'sr_cre_identity')]:
        value = copy.deepcopy(main['value'])
        value['sr']['runs'][0]['events_appended'][0]['payload'][field] = replacement
        value['sr']['runs'][0]['frozen_input']['payload'][field] = replacement
        if row == 'sr_cre_union':
            value['sr']['frozen_capture'][field] = replacement  # the capture agrees; only the record disagrees
        negatives.append(c.negative(main, row, 'payload-' + field, value, {'copies': 'appended event and frozen input', 'field': field}))
    # A context/provenance split derived from the merged record field (the
    # frozen capture says context=[ctx-A], provenance=[prov-A, prov-B]).
    value = copy.deepcopy(main['value'])
    for slot in ('events_appended',):
        p = value['sr']['runs'][0][slot][0]['payload']
        p['context_refs'] = ['ctx-A', 'prov-A', 'prov-B']; p['provenance_refs'] = []
    negatives.append(c.negative(main, 'sr_cre_split', 'split-from-merged-field', value, {'manufactured': 'all merged refs as context'}))
    for at in ('b1_point_and_pending_companion', 'b2_barrier_append', 'b2_first_receipt', 'b3_commit_marker'):
        value = w.build(CRE); scenario(value, [{'kind': 'create', 'crash_at': at}, {'kind': 'resume', 'of': 0}])
        control = s.control(CRE, 'sr/crash-after-' + at, value); controls.append(control)
        negatives.append(c.mutate(control, 'sr_cre_barriers', R(1, 'frozen_input', 'payload', 'context_refs'), ['ctx-live-recaptured'], 'resume-recaptures'))
        negatives.append(c.mutate(control, 'sr_cre_events', R(1, 'events_appended'),
                                  [value['stored_event']] * (2 if at == 'b1_point_and_pending_companion' else 1), 'resume-duplicate-append'))
        if at != 'b3_commit_marker':
            negatives.append(c.mutate(control, 'sr_cre_completion', R(0, 'completion'), 'complete', 'crash-reports-complete'))
    # Lawful emptiness only from the frozen capture: an empty citation capture
    # is preserved; dropping a captured attachment is not emptiness.
    value = w.build(CRE); scenario(value, [{'kind': 'create'}])
    control = s.control(CRE, 'sr/empty-citations-preserved', value); controls.append(control)
    v2 = copy.deepcopy(value)
    v2['sr']['runs'][0]['events_appended'][0]['payload']['citation_refs'] = []
    v2['sr']['runs'][0]['events_appended'][0]['payload']['attachment_refs'] = []
    v2['sr']['frozen_capture']['attachment_refs'] = []
    negatives.append(c.negative(control, 'sr_cre_union', 'attachment-dropped-as-empty', v2,
                                {'capture': 'attachment omitted from frozen capture and event; record still holds it'}))
    return controls, negatives
