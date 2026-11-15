"""C12-SR: safe_point.recovery_unavailable complete episode boundary.

Owner clauses: SP-2204 (FileSafe durability-unit emitter, commit-then-append,
own first receipt as establishing receipt, sru_ identity, read-time disclosure,
withdrawal never releases), Storage "Recovery-unavailable event, receipt, and
release", Contracts "recovery-unavailable command and result contracts",
FileSafe "Known-37 corruption evidence and recovery-unavailable owner
completion", Executor "Known-37 run-start and recovery-unavailable admission",
ATS P01..P10 / N01..N15 and ATS-2204.

A boundary record (`case['sr']`) holds the Executor episode facts, FileSafe's
classification, the isolated-successor precondition, the establishment trace
(with crash and resumption), the anchor, and every later run: locate and
abandon commands (success, each refusal, replay, conflicting replay), replan
and successor releases, non-release triggers, restore/retry while unavailable,
re-detection and the UI projection of each domain result. Expected values come
from those inputs by the owner rules; predicates compare. Native NOT_RUN.
"""
import copy

import pm_s3bo_oracles as w
import pm_s3bo_sr_common as s

LANE = 'sr'
SRU = 'safe_point.recovery_unavailable'
FAMILIES = (SRU,)
REGISTRY = {f['family_id']: f for f in w.read_json('Plans/storage_value_registry.json')['families']}
# The registry's inline value schemas carry no $id; a base URI naming their exact
# registry pointer is added for the validator registry only (no keyword changes).
ANCHOR_SCHEMA = dict(REGISTRY['recovery_anchor_record']['value_schema'],
                     **{'$id': 'https://puppetmaster.local/Plans/storage_value_registry.json/families/recovery_anchor_record/value_schema'})
RECEIPT_SCHEMA = dict(REGISTRY['recovery_unavailable_resolution_receipt']['value_schema'],
                      **{'$id': 'https://puppetmaster.local/Plans/storage_value_registry.json/families/recovery_unavailable_resolution_receipt/value_schema'})
ANCHOR = 'anchor-A'
ANCHOR_REF = 'recovery_anchor_record.v1:' + w.PROJECT + ':' + ANCHOR
BASE_ACTIONS = ['open_details', 'locate_and_verify_recovery', 'replan', 'abandon_recovery']
FRESH_ACTIONS = ['open_details', 'locate_and_verify_recovery', 'replan', 'start_fresh_attempt', 'abandon_recovery']
REASONS = ('snapshot_missing', 'snapshot_corrupt', 'snapshot_scope_unsupported', 'snapshot_identity_stale',
           'snapshot_unanchored')
ESTABLISH = ['filesafe_classify', 'durability_commit', 'barrier_append', 'first_receipt', 'offer_actions']
RESUME = {'durability_commit': ['resume_obligation', 'barrier_append', 'first_receipt', 'offer_actions'],
          'barrier_append': ['resume_obligation', 'resolve_original_receipt', 'offer_actions']}
CONFIRMATION = 'abandon_recovery_and_preserve_local_work'
TRIGGERS = ('age', 'exit', 'archive', 'completion', 'worktree_unbinding', 'compaction', 'retention_pressure',
            'cleanup', 'withdrawal')
SUCCESS = ('applied', 'replayed')

ROWS = [
    ('sr_sru_order', 'sr_recovery', 'equal', 'Establishment runs classify, durability commit, barrier append, first receipt, then offers actions; resumption never reclassifies.'),
    ('sr_sru_reason', 'sr_recovery', 'equal', "The payload reason is FileSafe's classification, one of the five; recovery and re-detection never change it."),
    ('sr_sru_actions', 'sr_recovery', 'equal', 'The action array is the exact owner order, with start_fresh_attempt only when the isolated baseline predicate holds; the UI offers it unchanged.'),
    ('sr_sru_attempt', 'sr_recovery', 'equal', 'Pre-attempt surfaces omit or null attempt_id; post-attempt surfaces carry the exact prior attempt everywhere.'),
    ('sr_sru_anchor', 'sr_recovery', 'equal', 'The anchor joins the episode facts, names this event as set_event_ref and is recovery_unavailable until a release.'),
    ('sr_sru_episode', 'sr_recovery', 'equal', 'The payload carries the Executor episode facts, the anchor key and preserved local work exactly.'),
    ('sr_sru_events', 'sr_recovery', 'equal', 'One episode appends exactly one event, after the durability commit; no resolution appends any EventRecord.'),
    ('sr_sru_identity', 'sr_recovery', 'equal', 'event_id and the EventRecord key follow the sru_ recipe of the anchor; re-detection mints nothing.'),
    ('sr_sru_outcome', 'sr_recovery_release', 'equal', 'A command succeeds only with every owner admission and verification or confirmation satisfied; anything else is a nonsuccess.'),
    ('sr_sru_receipt_reason', 'sr_recovery_release', 'equal', 'A nonsuccess carries the exact owner reason token where one is named, otherwise a non-null reason; success carries none.'),
    ('sr_sru_release', 'sr_recovery_release', 'equal', 'The anchor releases only by its three closed reasons, each only after its own durable evidence.'),
    ('sr_sru_snapshots', 'sr_recovery_release', 'equal', 'Before refs equal the admitted anchor set; locate success records the verified set; abandonment and nonsuccess preserve it.'),
    ('sr_sru_replay', 'sr_recovery_release', 'equal', 'Replay of the same request and key returns the original receipt byte-for-byte with no second transition.'),
    ('sr_sru_conflict', 'sr_recovery_release', 'equal', 'A different request digest under one key is invalid_args and never overwrites the original receipt.'),
    ('sr_sru_no_release', 'sr_recovery_release', 'equal', 'Age, exit, archive, completion, unbinding, compaction, pressure, cleanup and withdrawal never release; restore and retry refuse.'),
    ('sr_sru_effects', 'sr_recovery_release', 'empty', 'No resolution performs cleanup, deletion, abort_run, worktree detachment or a higher-level terminal transition.'),
    ('sr_sru_receipt_join', 'sr_recovery_custody', 'equal', 'Each receipt binds the episode, anchor, command, key, request digest, actor and source or confirmation refs.'),
    ('sr_sru_receipt_schema', 'sr_recovery_custody', 'error', 'Every resolution receipt validates against the complete closed receipt schema, all allOf/oneOf branches intact.'),
    ('sr_sru_anchor_schema', 'sr_recovery_custody', 'error', 'Every anchor snapshot validates against the complete closed recovery_anchor_record schema.'),
    ('sr_sru_numbers', 'sr_recovery_custody', 'error', 'Anchor and receipt blocked_sequence use shared current_integer with their owner minimum.'),
    ('sr_sru_time', 'sr_recovery_custody', 'error', 'Receipt completed_at_utc uses shared date_time with the Storage UTC-Z profile.'),
    ('sr_sru_ui', 'sr_recovery_custody', 'equal', 'The UI shows success only for an applied or replayed domain result with a committed receipt.'),
    ('sr_sru_stored', 'sr_recovery_custody', 'equal', 'The establishing event of the default episode is the independently stored EventRecord.'),
]


def ids(project, anchor_id):
    digest = w.sha(w.lp('safe_point.recovery_unavailable/establish/v1', project, anchor_id))
    return 'er_sru_' + digest, 'sru_' + digest


def payload(p, project):
    p.update(safe_point_id='safe-point-A', run_id='run-A', node_id='node-A', blocked_sequence=7,
             snapshot_refs=['snapshot-A', 'snapshot-B'], anchor_ref=ANCHOR_REF,
             recovery_unavailable_reason_code='snapshot_missing', allowed_action_ids=list(BASE_ACTIONS))


def episode(attempt=None):
    return {'project_id': w.PROJECT, 'run_id': 'run-A', 'node_id': 'node-A', 'blocked_sequence': 7,
            'safe_point_id': 'safe-point-A', 'snapshot_refs': ['snapshot-A', 'snapshot-B'],
            'attempt_id': attempt, 'anchor_id': ANCHOR}


def anchor_value(ep, event_id, state='recovery_unavailable', release=None, release_ref=None):
    return {'schema_id': 'pm.storage_value.recovery_anchor_record.v1', 'schema_version': '1.0.0',
            'anchor_id': ep['anchor_id'], 'project_id': ep['project_id'], 'blocked_sequence': ep['blocked_sequence'],
            'run_id': ep['run_id'], 'node_id': ep['node_id'], 'attempt_id': ep['attempt_id'],
            'safe_point_id': ep['safe_point_id'], 'snapshot_refs': list(ep['snapshot_refs']), 'anchor_state': state,
            'set_event_ref': event_id, 'release_event_ref': release_ref, 'release_reason': release,
            'redaction_profile': 'no_secrets'}


def expected_actions(sr):
    return list(FRESH_ACTIONS) if sr['successor']['isolated_baseline'] else list(BASE_ACTIONS)


def episode_event(case, sr):
    """The establishing EventRecord: the stored one for the default episode."""
    ep = sr['episode']; event_id, key = ids(ep['project_id'], ep['anchor_id'])
    if sr.get('main'):
        return copy.deepcopy(case['stored_event'])
    event = copy.deepcopy(case['stored_event'])
    event.update(event_id=event_id, idempotency_key=key, attempt_id=ep['attempt_id'])
    p = event['payload']
    p.update(recovery_unavailable_reason_code=sr['classification']['reason'], allowed_action_ids=expected_actions(sr),
             receipt_ref=s.custody_key(event_id))
    if ep['attempt_id'] is not None:
        p['attempt_id'] = ep['attempt_id']
    return event


def request(sr, command, key='request-A', **changes):
    ep = sr['episode']
    value = {'command_id': command, 'project_id': ep['project_id'], 'run_id': ep['run_id'], 'node_id': ep['node_id'],
             'blocked_sequence': ep['blocked_sequence'], 'safe_point_id': ep['safe_point_id'], 'anchor_ref': ANCHOR_REF,
             'expected_snapshot_refs': list(ep['snapshot_refs']),
             'expected_recovery_unavailable_reason_code': sr['classification']['reason'],
             'actor_ref': 'actor-A', 'idempotency_key': key}
    if ep['attempt_id'] is not None:
        value['attempt_id'] = ep['attempt_id']
    if command == 'cmd.runtime.locate_and_verify_recovery':
        value['recovery_source_ref'] = 'filesafe.recovery_source:verified-A'
    else:
        value.update(confirmation=CONFIRMATION, confirmation_ref='confirmation:actor-A:1',
                     preserved_local_work_acknowledged=True)
    value.update(changes)
    return value


CHECKS = {'permission': 'allowed', 'storage': 'writer', 'source_normalized': True, 'source_found': True,
          'identity_match': True, 'owner_verified': True}
VERIFIED = {'snapshot_refs': ['snapshot-A', 'snapshot-B', 'snapshot-C'], 'manifest_sha256': 'e' * 64,
            'evidence_ref': 'filesafe.verification:A'}


# ---------------------------------------------------------------- expectations

def failing(sr, run, anchor):
    """The single failed owner precondition of a command run (inputs only)."""
    req = run['request']; checks = run['checks']; ep = sr['episode']
    if checks['storage'] == 'read_only':
        return 'storage_read_only'
    if checks['storage'] == 'io_exhausted':
        return 'storage_io_exhausted'
    if checks['permission'] != 'allowed':
        return 'permission_denied'
    if anchor is None or anchor.get('anchor_state') != 'recovery_unavailable':
        return 'blocked_state_required'
    current = (ep['project_id'], ep['run_id'], ep['node_id'], ep['blocked_sequence'], ep['safe_point_id'], ANCHOR_REF,
               list(anchor['snapshot_refs']), sr['classification']['reason'], ep['attempt_id'])
    presented = (req.get('project_id'), req.get('run_id'), req.get('node_id'), req.get('blocked_sequence'),
                 req.get('safe_point_id'), req.get('anchor_ref'), req.get('expected_snapshot_refs'),
                 req.get('expected_recovery_unavailable_reason_code'), req.get('attempt_id'))
    if presented != current:
        return 'stale_projection'
    if req['command_id'] == 'cmd.runtime.locate_and_verify_recovery':
        if not checks['source_normalized']:
            return 'source_not_normalized'
        if not checks['source_found']:
            return 'recovery_source_not_found'
        if not checks['identity_match']:
            return 'recovery_source_identity_mismatch'
        if not checks['owner_verified']:
            return 'recovery_source_not_verified'
    else:
        if req.get('confirmation') != CONFIRMATION or not req.get('confirmation_ref'):
            return 'explicit_confirmation_required'
        if req.get('preserved_local_work_acknowledged') is not True:
            return 'preserved_local_work_acknowledgement_required'
    return None


# Exact receipt-enum tokens whose condition the owner names; a raw/unnormalized
# source has no named token and only requires a non-null locate reason.
EXACT = {'storage_read_only', 'storage_io_exhausted', 'permission_denied', 'blocked_state_required',
         'stale_projection', 'recovery_source_not_found', 'recovery_source_identity_mismatch',
         'recovery_source_not_verified', 'explicit_confirmation_required',
         'preserved_local_work_acknowledgement_required'}


def expect_run(sr, run):
    """Expected (result, anchor_after) of a resolution run from inputs and anchor_before."""
    kind = run['kind']; anchor = run['anchor_before']; out = {'anchor': copy.deepcopy(anchor)}
    if kind in ('locate', 'abandon'):
        fail = failing(sr, run, anchor)
        if fail:
            out.update(outcome='nonsuccess', reason=fail if fail in EXACT else None, release=None)
        else:
            reason = 'resolved' if kind == 'locate' else 'abandoned_by_user'
            out.update(outcome='success', reason=None, release=reason)
            out['anchor'] = dict(anchor, anchor_state='released', release_reason=reason,
                                 release_event_ref=run['receipt_key'])
    elif kind == 'replan':
        if run['replan']['admitted'] and run['replan']['recorded'] and anchor['anchor_state'] == 'recovery_unavailable':
            out['anchor'] = dict(anchor, anchor_state='released', release_reason='resolved',
                                 release_event_ref=run['replan']['record_ref'])
    elif kind == 'successor':
        member = 'start_fresh_attempt' in expected_actions(sr)
        if member and run['successor']['distinct'] and run['successor']['successor_receipt'] \
                and run['successor']['baseline_receipt'] and anchor['anchor_state'] == 'recovery_unavailable':
            out['anchor'] = dict(anchor, anchor_state='released', release_reason='superseded_with_verified_successor',
                                 release_event_ref=run['successor']['receipt_ref'])
    elif kind == 'restore_retry':
        out.update(outcome='nonsuccess')
    return out


def receipt_for(sr, run, outcome, reason, anchor_before, anchor_after):
    ep = sr['episode']; req = run['request']; locate = req['command_id'] == 'cmd.runtime.locate_and_verify_recovery'
    success = outcome in SUCCESS
    return {'schema_id': 'pm.storage_value.recovery_unavailable_resolution_receipt.v1', 'schema_version': '1.0.0',
            'receipt_id': run['receipt_id'], 'project_id': ep['project_id'], 'anchor_id': ep['anchor_id'],
            'anchor_ref': ANCHOR_REF, 'safe_point_id': ep['safe_point_id'], 'run_id': ep['run_id'],
            'node_id': ep['node_id'], 'blocked_sequence': ep['blocked_sequence'], 'attempt_id': ep['attempt_id'],
            'command_id': req['command_id'], 'idempotency_key': req['idempotency_key'],
            'canonical_request_sha256': s.jcs_sha(req),
            'resolution_kind': 'owner_verified_recovery' if locate else 'abandoned_by_user',
            'outcome': outcome, 'reason_code': reason, 'actor_ref': req['actor_ref'],
            'confirmation_ref': None if locate else (req.get('confirmation_ref') if success else None),
            'recovery_source_ref': req.get('recovery_source_ref') if locate and success else None,
            'before_anchor_state': 'recovery_unavailable', 'after_anchor_state': anchor_after['anchor_state'],
            'release_reason': anchor_after['release_reason'] if success else None,
            'before_snapshot_refs': list(anchor_before['snapshot_refs']),
            'after_snapshot_refs': list(VERIFIED['snapshot_refs']) if locate and success else list(anchor_before['snapshot_refs']),
            'verified_manifest_sha256': VERIFIED['manifest_sha256'] if locate and success else None,
            'verification_evidence_ref': VERIFIED['evidence_ref'] if locate and success else None,
            'cleanup_performed': False, 'completed_at_utc': w.TIME, 'redaction_profile': 'no_secrets'}


def runs_of(case):
    sr = case.get('sr')
    if not isinstance(sr, dict) or not isinstance(sr.get('runs'), list) or not isinstance(sr.get('establish'), dict):
        return None
    return sr['runs']


# ---------------------------------------------------------------- operands

def operands(case, put, common):
    runs = runs_of(case)
    if runs is None:
        put('sr_sru_anchor_schema', ['boundary record missing'])
        return
    sr = case['sr']; ep = sr['episode']; est = sr['establish']; resume = sr.get('resume')
    event_id, key = ids(ep['project_id'], ep['anchor_id'])
    crash = est.get('crash_at')
    expect_est = ESTABLISH[:ESTABLISH.index(crash) + 1] + ['crash'] if crash else list(ESTABLISH)
    left = [est.get('trace')]; right = [expect_est]
    if crash:
        left.append((resume or {}).get('trace')); right.append(RESUME[crash])
    for r in runs:
        if r['kind'] == 'redetect':
            left.append(r.get('trace')); right.append(['filesafe_classify', 'resolve_existing_anchor'])
    put('sr_sru_order', left, right)
    appended = list(est.get('events_appended', [])) + list((resume or {}).get('events_appended', []))
    reason = sr['classification']['reason']
    put('sr_sru_reason', [e.get('payload', {}).get('recovery_unavailable_reason_code') for e in appended]
        + [r.get('reason_after') for r in runs if r['kind'] == 'redetect'],
        [reason] * len(appended) + [reason for r in runs if r['kind'] == 'redetect'])
    actions = expected_actions(sr)
    offered = [est.get('actions_offered')] + ([resume.get('actions_offered')] if crash else [])
    want_offered = [None if crash else actions] + ([actions] if crash else [])
    put('sr_sru_actions', [e.get('payload', {}).get('allowed_action_ids') for e in appended] + offered,
        [actions] * len(appended) + want_offered)
    attempt = ep['attempt_id']
    left = []; right = []
    for e in appended:
        p = e.get('payload', {})
        left.append(('event', 'attempt_id' in p, p.get('attempt_id'), e.get('attempt_id')))
        right.append(('event', attempt is not None, attempt, attempt))
    for name, anchor in anchors(sr):
        left.append(('anchor', name, anchor.get('attempt_id') if isinstance(anchor, dict) else None))
        right.append(('anchor', name, attempt))
    for i, r in enumerate(runs):
        # Requests are inputs: a request with a wrong attempt branch is a stale
        # admission (sr_sru_outcome / sr_sru_receipt_reason), not an output defect.
        if isinstance(r.get('receipt'), dict):
            left.append(('receipt', i, r['receipt'].get('attempt_id'))); right.append(('receipt', i, attempt))
    put('sr_sru_attempt', left, right)
    anchor = est.get('anchor_after')
    want = strip_attempt(anchor_value(ep, event_id)); want.pop('redaction_profile')
    # Owner-derived fields only: extra keys and the redaction enum are the schema row's.
    put('sr_sru_anchor', {k: anchor.get(k, 'absent') for k in want} if isinstance(anchor, dict) else anchor, want)
    left = []; right = []
    for e in appended:
        p = e.get('payload', {})
        left.append((p.get('project_id'), p.get('run_id'), p.get('node_id'), p.get('blocked_sequence'), p.get('safe_point_id'),
                     p.get('snapshot_refs'), p.get('anchor_ref'), p.get('preserved_local_work'), e.get('run_id'), e.get('node_id')))
        right.append((ep['project_id'], ep['run_id'], ep['node_id'], ep['blocked_sequence'], ep['safe_point_id'],
                      ep['snapshot_refs'], ANCHOR_REF, sr['classification']['preserved_local_work'], ep['run_id'], ep['node_id']))
    put('sr_sru_episode', left, right)
    est_events = len(est.get('events_appended', []))
    left = [est_events, len((resume or {}).get('events_appended', [])) if crash else 0]
    right = [1 if (not crash or ESTABLISH.index(crash) >= ESTABLISH.index('barrier_append')) else 0,
             1 if crash == 'durability_commit' else 0]
    left += [len(r.get('events_appended', [])) for r in runs]; right += [0] * len(runs)
    put('sr_sru_events', left, right)
    left = [(e.get('event_id'), e.get('idempotency_key')) for e in appended]; right = [(event_id, key)] * len(appended)
    for r in runs:
        if r['kind'] == 'redetect':
            left.append(r.get('minted')); right.append([])
    put('sr_sru_identity', left, right)
    # Resolution runs.
    expected = [expect_run(sr, r) for r in runs]
    commands = [i for i, r in enumerate(runs) if r['kind'] in ('locate', 'abandon')]
    put('sr_sru_outcome', [success_of(runs[i].get('result')) for i in commands], [expected[i]['outcome'] for i in commands])
    left = []; right = []
    for i in commands:
        res = runs[i].get('result') or {}
        if expected[i]['outcome'] == 'success':
            left.append(res.get('reason_code')); right.append(None)
        elif expected[i]['reason']:
            left.append(res.get('reason_code')); right.append(expected[i]['reason'])
        else:
            left.append(res.get('reason_code') is not None); right.append(True)
    put('sr_sru_receipt_reason', left, right)
    release_kinds = [i for i, r in enumerate(runs) if r['kind'] in ('locate', 'abandon', 'replan', 'successor')]
    # Anchors are compared by their complete canonical Storage value bytes (as the
    # common copy-join rows compare event copies): same equality, compact operands.
    put('sr_sru_release', [s.physical_hex(runs[i].get('anchor_after')) for i in release_kinds],
        [s.physical_hex(expected[i]['anchor']) for i in release_kinds])
    left = []; right = []
    for i in commands:
        receipt = runs[i].get('receipt')
        if not isinstance(receipt, dict):
            continue
        before = runs[i]['anchor_before']['snapshot_refs']
        success = expected[i]['outcome'] == 'success' and runs[i]['kind'] == 'locate'
        left.append((receipt.get('before_snapshot_refs'), receipt.get('after_snapshot_refs')))
        right.append((before, VERIFIED['snapshot_refs'] if success else before))
    put('sr_sru_snapshots', left, right)
    left = []; right = []
    for r in runs:
        if r['kind'] == 'replay':
            prior = runs[r['of']]
            left.append((s.physical_hex(r.get('receipt')), r.get('anchor_after')))
            right.append((s.physical_hex(prior.get('receipt')), r['anchor_before']))
    put('sr_sru_replay', left, right)
    left = []; right = []
    for r in runs:
        if r['kind'] == 'conflict':
            prior = runs[r['of']]
            left.append(((r.get('result') or {}).get('reason_code'), s.physical_hex(r.get('stored_receipt')), r.get('anchor_after')))
            right.append(('invalid_args', s.physical_hex(prior.get('receipt')), r['anchor_before']))
    put('sr_sru_conflict', left, right)
    left = []; right = []
    for i, r in enumerate(runs):
        if r['kind'] in ('trigger', 'restore_retry', 'redetect'):
            left.append(s.physical_hex(r.get('anchor_after'))); right.append(s.physical_hex(r['anchor_before']))
        if r['kind'] == 'restore_retry':
            left.append(success_of(r.get('result'))); right.append('nonsuccess')
    put('sr_sru_no_release', left, right)
    put('sr_sru_effects', [effect for r in runs for effect in r.get('effects', [])], [])
    left = []; right = []
    for i in commands:
        receipt = runs[i].get('receipt')
        if not isinstance(receipt, dict):
            continue
        req = runs[i]['request']; success = expected[i]['outcome'] == 'success'
        locate = req['command_id'] == 'cmd.runtime.locate_and_verify_recovery'
        left.append(tuple(receipt.get(k) for k in ('project_id', 'anchor_id', 'anchor_ref', 'safe_point_id', 'run_id', 'node_id',
                                                   'blocked_sequence', 'command_id', 'idempotency_key',
                                                   'canonical_request_sha256', 'actor_ref', 'confirmation_ref',
                                                   'recovery_source_ref', 'verified_manifest_sha256', 'verification_evidence_ref',
                                                   'outcome', 'after_anchor_state', 'release_reason'))[:15]
                    + ('success' if receipt.get('outcome') in SUCCESS else 'nonsuccess',
                       receipt.get('after_anchor_state'), receipt.get('release_reason')))
        right.append((ep['project_id'], ep['anchor_id'], ANCHOR_REF, ep['safe_point_id'], ep['run_id'], ep['node_id'],
                      ep['blocked_sequence'], req['command_id'], req['idempotency_key'], s.jcs_sha(req), req['actor_ref'],
                      req.get('confirmation_ref') if success and not locate else None,
                      req.get('recovery_source_ref') if success and locate else None,
                      VERIFIED['manifest_sha256'] if success and locate else None,
                      VERIFIED['evidence_ref'] if success and locate else None,
                      'success' if success else 'nonsuccess',
                      'released' if success else 'recovery_unavailable', expected[i]['release'] if success else None))
    receipts = [r['receipt'] for r in runs if isinstance(r.get('receipt'), dict)]
    numbers = []
    for receipt in receipts:
        numbers += s.integer_errors(receipt, [('blocked_sequence', 0, None)])
    for _name, value in anchors(sr):
        numbers += s.integer_errors(value, [('blocked_sequence', 0, None)])
    put('sr_sru_numbers', numbers)
    # An unadmitted integer is refused by the shared number row first.
    put('sr_sru_receipt_join', left if not numbers else [], right if not numbers else [], applies=not numbers)
    put('sr_sru_receipt_schema', [e for r in receipts for e in s.keyword_errors(RECEIPT_SCHEMA, r)] if not numbers else [],
        applies=not numbers)
    put('sr_sru_anchor_schema', [e for _n, a in anchors(sr) for e in s.keyword_errors(ANCHOR_SCHEMA, a)] if not numbers else [],
        applies=not numbers)
    put('sr_sru_time', [e for r in receipts for e in s.time_errors(r, ('completed_at_utc',), w.STORAGE_UTC_Z)])
    left = []; right = []
    for r in runs:
        if r['kind'] == 'ui':
            domain = r['domain_result']
            ok = domain.get('outcome') in SUCCESS and domain.get('receipt_state') == 'committed'
            left.append(r.get('ui_status')); right.append('success' if ok else 'not_success')
    put('sr_sru_ui', left, right)
    if sr.get('main') and appended:
        put('sr_sru_stored', s.physical_hex(appended[0]), s.physical_hex(case['stored_event']))


def strip_attempt(anchor):
    return {k: v for k, v in anchor.items() if k != 'attempt_id'} if isinstance(anchor, dict) else anchor


def anchors(sr):
    out = []
    if isinstance(sr['establish'].get('anchor_after'), dict):
        out.append(('established', sr['establish']['anchor_after']))
    for i, r in enumerate(sr['runs']):
        if isinstance(r.get('anchor_after'), dict) and r['anchor_after'] is not r.get('anchor_before'):
            out.append(('run-' + str(i), r['anchor_after']))
    return out


def success_of(result):
    if not isinstance(result, dict):
        return None
    return 'success' if result.get('outcome') in SUCCESS else 'nonsuccess'


# ---------------------------------------------------------------- fixtures

def simulate_run(case, sr, run):
    """Fixture constructor of the owner-conforming presented run (the checker never calls it)."""
    kind = run['kind']; anchor = run['anchor_before']
    run.update(events_appended=[], effects=[], anchor_after=copy.deepcopy(anchor))
    if kind in ('locate', 'abandon'):
        out = expect_run(sr, run); fail = failing(sr, run, anchor)
        if out['outcome'] == 'success':
            outcome = 'applied'; reason = None
        else:
            outcome = 'failed_recoverable' if fail == 'storage_io_exhausted' else 'refused'
            reason = fail if fail in EXACT else 'invalid_args'
        run['anchor_after'] = copy.deepcopy(out['anchor'])
        # The receipt records a command admitted against a recovery_unavailable
        # anchor (before_anchor_state const); storage failures and a released
        # anchor leave no committed receipt.
        unrecorded = fail in ('storage_read_only', 'storage_io_exhausted', 'blocked_state_required')
        receipt = None if unrecorded else receipt_for(sr, run, outcome, reason, anchor, run['anchor_after'])
        run['receipt'] = receipt
        run['result'] = {'outcome': outcome, 'reason_code': reason, 'anchor_state': run['anchor_after']['anchor_state'],
                         'release_reason': run['anchor_after']['release_reason'] if outcome in SUCCESS else None,
                         'receipt_state': 'not_committed' if receipt is None else 'committed', 'cleanup_performed': False}
    elif kind == 'replay':
        prior = sr['runs'][run['of']]
        run['receipt'] = copy.deepcopy(prior['receipt'])
        run['result'] = dict(copy.deepcopy(prior['result']), outcome='replayed')
    elif kind == 'conflict':
        prior = sr['runs'][run['of']]
        run['stored_receipt'] = copy.deepcopy(prior['receipt'])
        run['result'] = {'outcome': 'refused', 'reason_code': 'invalid_args'}
    elif kind in ('replan', 'successor'):
        run['anchor_after'] = copy.deepcopy(expect_run(sr, run)['anchor'])
    elif kind == 'restore_retry':
        run['result'] = {'outcome': 'refused', 'reason_code': 'blocked_state_required'}
    elif kind == 'redetect':
        run.update(trace=['filesafe_classify', 'resolve_existing_anchor'], minted=[],
                   reason_after=sr['classification']['reason'])
    elif kind == 'ui':
        domain = run['domain_result']
        ok = domain.get('outcome') in SUCCESS and domain.get('receipt_state') == 'committed'
        run['ui_status'] = 'success' if ok else 'not_success'
    return run


def scenario(case, runs, attempt=None, reason='snapshot_missing', isolated=False, crash_at=None, main=False):
    sr = {'family': SRU, 'episode': episode(attempt), 'classification': {'reason': reason, 'preserved_local_work': True},
          'successor': {'isolated_baseline': isolated}, 'main': main, 'runs': []}
    case['sr'] = sr
    ep = sr['episode']; event_id, _key = ids(ep['project_id'], ep['anchor_id'])
    event = episode_event(case, sr)
    anchor = anchor_value(ep, event_id)
    est = {'anchor_after': copy.deepcopy(anchor)}
    if crash_at:
        n = ESTABLISH.index(crash_at)
        est.update(crash_at=crash_at, trace=ESTABLISH[:n + 1] + ['crash'], actions_offered=None,
                   events_appended=[copy.deepcopy(event)] if n >= ESTABLISH.index('barrier_append') else [])
        sr['resume'] = {'trace': list(RESUME[crash_at]), 'actions_offered': expected_actions(sr),
                        'events_appended': [copy.deepcopy(event)] if crash_at == 'durability_commit' else []}
    else:
        est.update(trace=list(ESTABLISH), actions_offered=expected_actions(sr), events_appended=[copy.deepcopy(event)])
    sr['establish'] = est
    current = copy.deepcopy(anchor)
    for i, spec in enumerate(runs):
        run = copy.deepcopy(spec)
        run['anchor_before'] = copy.deepcopy(current)
        if run['kind'] in ('locate', 'abandon') and 'request' not in run:
            command = 'cmd.runtime.locate_and_verify_recovery' if run['kind'] == 'locate' else 'cmd.runtime.abandon_recovery'
            run['request'] = request(sr, command, run.pop('key', 'request-' + str(i)), **run.pop('changes', {}))
        if run['kind'] in ('locate', 'abandon'):
            run['checks'] = dict(CHECKS, **run.get('checks', {}))
            run.setdefault('receipt_id', 'receipt-' + str(i))
            run['receipt_key'] = 'recovery_unavailable_resolution_receipt.v1:' + w.PROJECT + ':' + ANCHOR + ':' + run['receipt_id']
        if run['kind'] in ('replay', 'conflict'):
            prior = sr['runs'][run['of']]
            run['request'] = copy.deepcopy(prior['request'])
            if run['kind'] == 'conflict':
                run['request']['actor_ref'] = 'actor-B'
        simulate_run(case, sr, run)
        sr['runs'].append(run)
        current = copy.deepcopy(run['anchor_after'])
    return case


def ui(outcome, state):
    return {'kind': 'ui', 'domain_result': {'outcome': outcome, 'receipt_state': state}}


def main_runs():
    return [{'kind': 'trigger', 'trigger': t} for t in TRIGGERS] + [
        {'kind': 'restore_retry', 'action': 'restore'}, {'kind': 'restore_retry', 'action': 'retry'},
        {'kind': 'redetect'},
        {'kind': 'locate', 'key': 'request-denied', 'checks': dict(CHECKS, permission='denied')},
        ui('refused', 'committed'), ui('failed_recoverable', 'not_committed'),
        {'kind': 'locate', 'key': 'request-A'},
        {'kind': 'replay', 'of': 15}, {'kind': 'conflict', 'of': 15},
        ui('applied', 'committed'), ui('applied', 'not_committed'), ui('replayed', 'committed'),
        {'kind': 'abandon', 'key': 'request-after-release'}]


def augment(control):
    scenario(control, main_runs(), main=True)


LOCATE_FAILURES = [
    ('storage-read-only', {'checks': {'storage': 'read_only'}}),
    ('storage-io-exhausted', {'checks': {'storage': 'io_exhausted'}}),
    ('stale-blocked-sequence', {'changes': {'blocked_sequence': 6}}),
    ('stale-snapshot-set', {'changes': {'expected_snapshot_refs': ['snapshot-A']}}),
    ('stale-reason', {'changes': {'expected_recovery_unavailable_reason_code': 'snapshot_corrupt'}}),
    ('stale-anchor', {'changes': {'anchor_ref': 'recovery_anchor_record.v1:project-A:anchor-B'}}),
    ('pre-attempt-with-attempt', {'changes': {'attempt_id': 'attempt-synthesized'}}),
    ('raw-path-source', {'checks': {'source_normalized': False}, 'changes': {'recovery_source_ref': '/home/user/snapshot.tar'}}),
    ('source-not-found', {'checks': {'source_found': False}}),
    ('source-identity-mismatch', {'checks': {'identity_match': False}}),
    ('source-not-verified', {'checks': {'owner_verified': False}}),
]
ABANDON_FAILURES = [
    ('no-confirmation', {'changes': {'confirmation': None}}),
    ('wrong-confirmation', {'changes': {'confirmation': 'abort_run'}}),
    ('no-confirmation-ref', {'changes': {'confirmation_ref': None}}),
    ('no-acknowledgement', {'changes': {'preserved_local_work_acknowledged': False}}),
    ('abandon-permission-denied', {'checks': {'permission': 'denied'}}),
]


def mutate_receipt(control, row, receipt_id, key, replacement, label):
    """Change one field of a stored receipt in every presented copy (original, replay, conflict)."""
    import pm_s3bo_cases as c
    value = copy.deepcopy(control['value']); copies = []
    for i, r in enumerate(value['sr']['runs']):
        for slot in ('receipt', 'stored_receipt'):
            if isinstance(r.get(slot), dict) and r[slot].get('receipt_id') == receipt_id:
                r[slot][key] = copy.deepcopy(replacement); copies.append([i, slot])
    return c.negative(control, row, label, value, {'receipt': receipt_id, 'copies': copies, 'field': key,
                                                   'replacement': repr(replacement)[:160]})


def cases():
    import pm_s3bo_cases as c
    controls = []; negatives = []
    base = w.build(SRU)
    main = s.control(SRU, 'sr/episode', base)
    controls.append(main)
    R = lambda i, *path: ('sr', 'runs', i) + path
    E = lambda *path: ('sr', 'establish') + path
    stored = base['stored_event']
    for row, path, replacement, label in [
            ('sr_sru_order', E('trace'), ['filesafe_classify', 'barrier_append', 'durability_commit', 'first_receipt', 'offer_actions'], 'append-before-anchor-commit'),
            ('sr_sru_order', E('trace'), ['filesafe_classify', 'durability_commit', 'barrier_append', 'offer_actions', 'first_receipt'], 'actions-before-receipt'),
            ('sr_sru_order', R(11, 'trace'), ['filesafe_classify', 'reclassify_newer_state'], 'redetect-reclassifies'),
            ('sr_sru_reason', R(11, 'reason_after'), 'snapshot_corrupt', 'redetect-changes-reason'),
            ('sr_sru_actions', E('actions_offered'), ['open_details', 'replan', 'locate_and_verify_recovery', 'abandon_recovery'], 'ui-reorders'),
            ('sr_sru_actions', E('actions_offered'), FRESH_ACTIONS, 'ui-adds-fresh-attempt'),
            ('sr_sru_anchor', E('anchor_after', 'set_event_ref'), 'er_sru_' + 'f' * 64, 'anchor-other-event'),
            ('sr_sru_anchor', E('anchor_after', 'snapshot_refs'), ['snapshot-A'], 'anchor-snapshot-set'),
            ('sr_sru_anchor', E('anchor_after', 'anchor_state'), 'open', 'anchor-not-unavailable'),
            ('sr_sru_events', E('events_appended'), [stored, stored], 'second-establishing-append'),
            ('sr_sru_events', R(15, 'events_appended'), [stored], 'resolution-appends-event'),
            ('sr_sru_identity', R(11, 'minted'), ['anchor-B'], 'redetect-mints-anchor'),
            ('sr_sru_outcome', R(12, 'result', 'outcome'), 'applied', 'denied-locate-applies'),
            ('sr_sru_receipt_reason', R(12, 'result', 'reason_code'), 'stale_projection', 'denied-wrong-token'),
            ('sr_sru_release', R(15, 'anchor_after', 'release_reason'), 'abandoned_by_user', 'locate-wrong-release'),
            ('sr_sru_release', R(12, 'anchor_after', 'anchor_state'), 'released', 'refusal-releases'),
            ('sr_sru_release', R(21, 'anchor_after', 'anchor_state'), 'recovery_unavailable', 'release-undone'),
            ('sr_sru_replay', R(16, 'receipt', 'completed_at_utc'), '2026-11-15T00:00:00Z', 'replay-new-receipt'),
            ('sr_sru_replay', R(16, 'anchor_after', 'release_reason'), 'abandoned_by_user', 'replay-second-transition'),
            ('sr_sru_conflict', R(17, 'stored_receipt', 'actor_ref'), 'actor-B', 'conflict-overwrites'),
            ('sr_sru_conflict', R(17, 'result', 'reason_code'), None, 'conflict-accepted'),
            ('sr_sru_no_release', R(9, 'result', 'outcome'), 'applied', 'restore-while-unavailable'),
            ('sr_sru_no_release', R(10, 'result', 'outcome'), 'applied', 'retry-while-unavailable'),
            ('sr_sru_effects', R(15, 'effects'), ['cleanup'], 'locate-cleans-up'),
            ('sr_sru_numbers', R(12, 'receipt', 'blocked_sequence'), True, 'receipt-sequence-boolean'),
            ('sr_sru_ui', R(13, 'ui_status'), 'success', 'refused-shown-success'),
            ('sr_sru_ui', R(19, 'ui_status'), 'success', 'uncommitted-shown-success'),
            ('sr_sru_stored', E('events_appended', 0, 'correlation_id'), 'correlation-other', 'established-differs-from-stored')]:
        negatives.append(c.mutate(main, row, path, replacement, label))
    for row, key, replacement, label in [
            ('sr_sru_receipt_join', 'canonical_request_sha256', 'c' * 64, 'receipt-digest'),
            ('sr_sru_receipt_join', 'recovery_source_ref', 'filesafe.recovery_source:other', 'receipt-source'),
            ('sr_sru_receipt_join', 'anchor_ref', 'recovery_anchor_record.v1:project-A:anchor-B', 'receipt-other-anchor'),
            ('sr_sru_receipt_schema', 'extra', 'snapshot-bytes', 'receipt-extra'),
            ('sr_sru_receipt_schema', 'cleanup_performed', True, 'receipt-cleanup'),
            ('sr_sru_time', 'completed_at_utc', '2026-11-14T12:00:00+00:00', 'receipt-time-offset'),
            ('sr_sru_snapshots', 'after_snapshot_refs', ['snapshot-A', 'snapshot-B'], 'locate-keeps-old-set')]:
        negatives.append(mutate_receipt(main, row, 'receipt-15', key, replacement, label))
    for i, trigger in enumerate(TRIGGERS):
        negatives.append(c.mutate(main, 'sr_sru_no_release', R(i, 'anchor_after', 'anchor_state'), 'released', trigger + '-releases'))
    # Every reason (P03), post-attempt (P02/N02), isolated successor (P08/N05).
    for reason in REASONS:
        value = w.build(SRU); scenario(value, [], reason=reason)
        control = s.control(SRU, 'sr/reason/' + reason, value); controls.append(control)
        negatives.append(c.mutate(control, 'sr_sru_reason', E('events_appended', 0, 'payload', 'recovery_unavailable_reason_code'),
                                  REASONS[(REASONS.index(reason) + 1) % 5], 'reason-not-classified'))
        if reason == 'snapshot_corrupt':
            negatives.append(c.mutate(control, 'sr_sru_attempt', E('events_appended', 0, 'payload', 'attempt_id'),
                                      'attempt-synthesized', 'pre-attempt-event-attempt'))
    value = w.build(SRU)
    scenario(value, [{'kind': 'locate', 'key': 'request-post'}, {'kind': 'abandon', 'key': 'request-post-2'}], attempt='attempt-1')
    control = s.control(SRU, 'sr/post-attempt', value); controls.append(control)
    for path, replacement, label in [(E('events_appended', 0, 'payload', 'attempt_id'), 'attempt-2', 'event-other-attempt'),
                                     (E('events_appended', 0, 'attempt_id'), None, 'envelope-attempt-missing'),
                                     (('sr', 'establish', 'anchor_after', 'attempt_id'), None, 'anchor-attempt-null')]:
        negatives.append(c.mutate(control, 'sr_sru_attempt', path, replacement, label))
    negatives.append(mutate_receipt(control, 'sr_sru_attempt', control['value']['sr']['runs'][0]['receipt']['receipt_id'],
                                    'attempt_id', None, 'receipt-attempt-null'))
    for key, replacement, label in [('extra', 'snapshot-bytes', 'anchor-extra'), ('redaction_profile', 'raw', 'anchor-redaction')]:
        value = copy.deepcopy(main['value'])
        value['sr']['establish']['anchor_after'][key] = replacement
        for r in value['sr']['runs']:
            for slot in ('anchor_before', 'anchor_after'):
                r[slot][key] = replacement
        negatives.append(c.negative(main, 'sr_sru_anchor_schema', label, value, {'anchor_snapshots': 'every snapshot', 'field': key}))
    negatives.append(c.mutate(main, 'sr_sru_attempt', E('anchor_after', 'attempt_id'), 'attempt-synthesized', 'pre-attempt-anchor-attempt'))
    value = w.build(SRU)
    scenario(value, [{'kind': 'successor', 'successor': {'distinct': True, 'successor_receipt': True, 'baseline_receipt': False,
                                                         'receipt_ref': 'successor-receipt:A'}},
                     {'kind': 'successor', 'successor': {'distinct': True, 'successor_receipt': True, 'baseline_receipt': True,
                                                         'receipt_ref': 'successor-receipt:A'}}], isolated=True)
    control = s.control(SRU, 'sr/isolated-successor', value); controls.append(control)
    negatives.append(c.mutate(control, 'sr_sru_release', R(0, 'anchor_after', 'anchor_state'), 'released', 'release-before-baseline-receipt'))
    negatives.append(c.mutate(control, 'sr_sru_release', R(1, 'anchor_after', 'release_reason'), 'resolved', 'successor-wrong-reason'))
    negatives.append(c.mutate(control, 'sr_sru_actions', E('events_appended', 0, 'payload', 'allowed_action_ids'), BASE_ACTIONS, 'fresh-member-dropped'))
    value = w.build(SRU)
    scenario(value, [{'kind': 'successor', 'successor': {'distinct': True, 'successor_receipt': True, 'baseline_receipt': True,
                                                         'receipt_ref': 'successor-receipt:A'}}])
    control = s.control(SRU, 'sr/successor-not-member', value); controls.append(control)
    negatives.append(c.mutate(control, 'sr_sru_release', R(0, 'anchor_after', 'anchor_state'), 'released', 'fresh-without-membership'))
    value = w.build(SRU)
    scenario(value, [{'kind': 'replan', 'replan': {'admitted': True, 'recorded': False, 'record_ref': 'replan:A'}},
                     {'kind': 'replan', 'replan': {'admitted': True, 'recorded': True, 'record_ref': 'replan:A'}}])
    control = s.control(SRU, 'sr/replan', value); controls.append(control)
    negatives.append(c.mutate(control, 'sr_sru_release', R(0, 'anchor_after', 'anchor_state'), 'released', 'replan-release-before-record'))
    # Abandonment: refusals, success, replay.
    value = w.build(SRU)
    runs = [{'kind': 'abandon', 'key': 'abandon-' + label, **change} for label, change in ABANDON_FAILURES]
    runs += [{'kind': 'abandon', 'key': 'abandon-ok'}, {'kind': 'replay', 'of': len(ABANDON_FAILURES)}]
    scenario(value, runs)
    control = s.control(SRU, 'sr/abandon', value); controls.append(control)
    ok = len(ABANDON_FAILURES)
    for i, (label, _change) in enumerate(ABANDON_FAILURES):
        negatives.append(c.mutate(control, 'sr_sru_outcome', R(i, 'result', 'outcome'), 'applied', label + '-applies'))
    rid = value['sr']['runs'][ok]['receipt']['receipt_id']
    negatives.append(mutate_receipt(control, 'sr_sru_snapshots', rid, 'after_snapshot_refs', ['snapshot-A'], 'abandon-drops-snapshots'))
    negatives.append(mutate_receipt(control, 'sr_sru_receipt_join', rid, 'confirmation_ref', 'confirmation:other', 'abandon-other-confirmation'))
    for effect in ('abort_run', 'snapshot_deletion', 'worktree_detach', 'goal_run_terminal', 'cleanup'):
        negatives.append(c.mutate(control, 'sr_sru_effects', R(ok, 'effects'), [effect], 'abandon-' + effect))
    negatives.append(c.mutate(control, 'sr_sru_receipt_reason', R(0, 'result', 'reason_code'), 'invalid_args', 'missing-confirmation-token'))
    # Every locate refusal.
    for label, change in LOCATE_FAILURES:
        value = w.build(SRU); scenario(value, [{'kind': 'locate', 'key': 'locate-' + label, **change}])
        control = s.control(SRU, 'sr/locate/' + label, value); controls.append(control)
        negatives.append(c.mutate(control, 'sr_sru_outcome', R(0, 'result', 'outcome'), 'applied', 'applies'))
        negatives.append(c.mutate(control, 'sr_sru_release', R(0, 'anchor_after', 'anchor_state'), 'released', 'releases'))
        if label not in ('raw-path-source',):
            negatives.append(c.mutate(control, 'sr_sru_receipt_reason', R(0, 'result', 'reason_code'), 'internal_error', 'wrong-token'))
        if isinstance(value['sr']['runs'][0].get('receipt'), dict):
            negatives.append(c.mutate(control, 'sr_sru_snapshots', R(0, 'receipt', 'after_snapshot_refs'), VERIFIED['snapshot_refs'], 'nonsuccess-records-verified-set'))
    # Crash after the durability commit and after the append (SP-2204 step order).
    for at in ('durability_commit', 'barrier_append'):
        value = w.build(SRU); scenario(value, [], crash_at=at)
        control = s.control(SRU, 'sr/crash-after-' + at, value); controls.append(control)
        negatives.append(c.mutate(control, 'sr_sru_order', ('sr', 'resume', 'trace'), ['filesafe_classify'] + RESUME[at][1:], 'resume-reclassifies'))
        negatives.append(c.mutate(control, 'sr_sru_events', ('sr', 'resume', 'events_appended'),
                                  [value['sr']['establish']['anchor_after']] and [stored] * (2 if at == 'durability_commit' else 1), 'resume-reappends'))
        negatives.append(c.mutate(control, 'sr_sru_actions', ('sr', 'establish', 'actions_offered'), BASE_ACTIONS, 'actions-before-receipt'))
        negatives.append(c.mutate(control, 'sr_sru_reason', ('sr', 'resume', 'events_appended', 0, 'payload', 'recovery_unavailable_reason_code'),
                                  'snapshot_corrupt', 'resume-changes-reason') if at == 'durability_commit' else
                         c.mutate(control, 'sr_sru_anchor', ('sr', 'establish', 'anchor_after', 'anchor_state'), 'released', 'crash-releases-anchor'))
    # Episode facts (P01, Executor Known-37 admission): on an episode whose
    # establishing event is constructed here, so the stored-event join is not touched.
    control = next(x for x in controls if x['id'] == SRU + '/sr/reason/snapshot_missing')
    for path, replacement, label in [(E('events_appended', 0, 'payload', 'run_id'), 'run-other', 'payload-other-run'),
                                     (E('events_appended', 0, 'payload', 'node_id'), 'node-other', 'payload-other-node'),
                                     (E('events_appended', 0, 'payload', 'blocked_sequence'), 6, 'payload-stale-blocked-sequence'),
                                     (E('events_appended', 0, 'payload', 'snapshot_refs'), ['snapshot-A'], 'payload-partial-snapshot-set'),
                                     (E('events_appended', 0, 'payload', 'safe_point_id'), 'safe-point-other', 'payload-other-safe-point'),
                                     (E('events_appended', 0, 'payload', 'anchor_ref'), 'recovery_anchor_record.v1:project-A:anchor-B', 'payload-other-anchor'),
                                     (E('events_appended', 0, 'run_id'), 'run-other', 'envelope-other-run')]:
        negatives.append(c.mutate(control, 'sr_sru_episode', path, replacement, label))
    return controls, negatives


def corpus_slots(control):
    sr = control['value'].get('sr') or {}
    paths = {}
    for i, r in enumerate(sr.get('runs', [])):
        for slot in ('receipt', 'stored_receipt'):
            if isinstance(r.get(slot), dict):
                paths.setdefault(('time', r[slot]['receipt_id']), []).append(('sr', 'runs', i, slot, 'completed_at_utc'))
    for (_kind, _receipt), group in paths.items():
        yield {'paths': group, 'kind': 'datetime', 'row': 'sr_sru_time', 'profile': w.STORAGE_UTC_Z,
               'type_rows': ['sr_sru_receipt_schema', 'sr_sru_time']}
