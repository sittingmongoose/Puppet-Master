"""C12-SR: restore_point.expired complete expiry boundary and the DL-076 refrozen package.

Owner clauses: SP-275 (exact eligibility: inclusive released_at + 7,776,000 s,
count pressure > 2,048 with rank 0 of the eligible set, all eleven protecting-ref
classes enumerated and clear, exact policy row, nonempty release evidence;
rpe_ identity over the original record hash; E1 atomic status + pending intent,
E2 barrier append of the frozen input, E3 receipt + result; no rollback after
E1; same identity/digest replays, a different digest fails closed), ATS
RSE-P01/P02 and RSE-N01..N03, DL-076 (stored checkpoint token is the nine-field
durable projection; the live read joins its own snapshot).

The boundary record (`case['sr']`) holds the canonical point, the owner's
eligibility evidence and every run (eligible expiry, each ineligible branch,
crash after E1 with resumption, replay, conflicting replay, policy inference).
The SP-275 package refrozen for DL-076 (v6) is authenticated and replayed by
evidence(). Native execution remains NOT_RUN.
"""
import copy
import datetime
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

import pm_s3bo_oracles as w
import pm_s3bo_sr_common as s

LANE = 'sr'
EXP = 'restore_point.expired'
FAMILIES = (EXP,)
POINT_ID = 'rpc_' + '3' * 64
HASH = 'a9af7d872cba522a25686c7e1182ee3913343494cae0c0a59832b181ff9ced20'
TTL = 7776000
CAP = 2048
POLICY = 'RP-RESTOREPOINT-90D-AFTER-RELEASE'
CLASSES = ('descendant_branch', 'application', 'preserve', 'legal_hold', 'in_flight_application', 'source_lineage',
           'live_ref', 'backup', 'rollback', 'recovery_anchor', 'maintenance')
FULL = ['eligibility', 'e1_status_and_intent', 'e2_barrier_append', 'e2_first_receipt', 'e3_receipt_and_result', 'publish']
RESUME = ['resume_pending_intent', 'e2_barrier_append', 'e2_first_receipt', 'e3_receipt_and_result', 'publish']
RELEASED = '2026-09-13T17:00:00Z'
PACKAGE = Path('/mnt/Cursor/PM-Experiments/ea-c12-sr-expiry-refreeze-20261114/event-authority-step08-restore-expired-20260911/v6')
PACKAGE_MANIFEST_SHA256 = '366c1dbcdd4dc510f3213ef36edfc29201cb4cc92d795fc3fa6573b60ffac41b'
PRIOR_MANIFEST_SHA256 = 'b458da5c7684dc7a4dcfc8f3f38bc7b09722ca0f1d3136dd34602d2f40038654'

ROWS = [
    ('sr_exp_eligible', 'sr_expired', 'equal', 'Expiry happens exactly when the point is available, hash-authenticated, at or after the inclusive boundary, every protecting class is clear, the policy is the exact row and evidence is present.'),
    ('sr_exp_events', 'sr_expired', 'equal', 'One expiry appends exactly one restore_point.expired by E2; refusals, replay and resumption after E2 append nothing.'),
    ('sr_exp_order', 'sr_expired', 'equal', 'Steps run eligibility, E1, E2 append, first receipt, E3, publish; a resumption continues from the pending intent.'),
    ('sr_exp_point', 'sr_expired', 'equal', 'E1 moves only available to expired; nothing rolls back, rewrites the record hash or clears a hold.'),
    ('sr_exp_identity', 'sr_expired', 'equal', 'expiry_id, event_id and the EventRecord key follow the rpe_ recipe over project, point and original record hash.'),
    ('sr_exp_payload', 'sr_expired', 'equal', 'The payload joins the original hash, the exact policy row and the frozen admission release-evidence list.'),
    ('sr_exp_evidence', 'sr_expired', 'equal', "The commit's eligibility is the owner's complete evaluation: selection, release fact and all eleven protecting classes."),
    ('sr_exp_resume', 'sr_expired', 'equal', 'Recovery after E1 resolves the same identity with the frozen input unchanged; it never recaptures or substitutes a result.'),
    ('sr_exp_replay', 'sr_expired_custody', 'equal', 'Same identity and digest returns the original result; a different digest fails closed with no transition.'),
]


def ids(project, point_id, record_hash):
    digest = w.sha(w.lp('restore_point.expired/expiry/v1', project, point_id, record_hash))
    return 'rpe_' + digest, 'er_rpe_' + digest


def payload(p, project):
    p.update(restore_point_id=POINT_ID, prior_hash=HASH, ref_release_evidence_refs=['release-evidence:A'])


def envelope(event):
    expiry_id, event_id = ids(event['project_id'], POINT_ID, HASH)
    event['event_id'], event['idempotency_key'] = event_id, expiry_id


def utc(text):
    return datetime.datetime.fromisoformat(text.replace('Z', '+00:00'))


def point():
    return {'project_id': w.PROJECT, 'restore_point_id': POINT_ID, 'status': 'available', 'record_sha256': HASH,
            'hold_refs': [], 'hash_authenticated': True}


def evaluation(**changes):
    value = {'policy_source': 'registered_row', 'policy_id': POLICY, 'policy_version': '1.0.0',
             'selection_kind': 'reference_release_ttl', 'released_at_utc': RELEASED,
             'evaluated_at_utc': '2026-12-12T17:00:00Z', 'logical_point_count_before': 20, 'rank': None,
             'blockers': {k: 0 for k in CLASSES}, 'enumeration_complete': {k: True for k in CLASSES},
             'release_evidence_refs': ['release-evidence:A']}
    for key, change in changes.items():
        if key in ('blockers', 'enumeration_complete'):
            value[key] = dict(value[key], **change)
        else:
            value[key] = change
    return value


def eligible(seen, ev):
    """SP-275 exact eligibility over independent inputs."""
    if seen['status'] != 'available' or not seen['hash_authenticated']:
        return False
    if ev['policy_source'] != 'registered_row' or ev['policy_id'] != POLICY or ev['policy_version'] != '1.0.0':
        return False
    if utc(ev['evaluated_at_utc']) < utc(ev['released_at_utc']) + datetime.timedelta(seconds=TTL):
        return False
    if any(ev['blockers'][k] != 0 or not ev['enumeration_complete'][k] for k in CLASSES):
        return False
    if not ev['release_evidence_refs']:
        return False
    if ev['selection_kind'] == 'oldest_eligible_count_pressure':
        return ev['logical_point_count_before'] > CAP and ev['rank'] == 0
    return ev['rank'] is None


def commit_eligibility(ev):
    return {'policy_id': ev['policy_id'], 'policy_version': ev['policy_version'],
            'selection': {'selection_kind': ev['selection_kind'], 'released_at_utc': ev['released_at_utc'],
                          'evaluated_at_utc': ev['evaluated_at_utc'],
                          'logical_point_count_before': ev['logical_point_count_before'],
                          'selected_oldest_eligible_rank': ev['rank']},
            'hold_evaluations': [{'ref_kind': k, 'active_blocker_count': ev['blockers'][k],
                                  'enumeration_complete': ev['enumeration_complete'][k]} for k in CLASSES],
            'ref_release_evidence': list(ev['release_evidence_refs'])}


def runs_of(case):
    sr = case.get('sr')
    if not isinstance(sr, dict) or not isinstance(sr.get('runs'), list):
        return None
    return sr['runs']


def expect(case, i):
    sr = case['sr']; run = sr['runs'][i]; seen = run['point_seen']; kind = run['kind']
    expiry_id, event_id = ids(seen['project_id'], seen['restore_point_id'], seen['record_sha256'])
    out = {'expiry_id': expiry_id, 'event_id': event_id}
    if kind == 'expire':
        ok = eligible(seen, run['evaluation'])
        at = run.get('crash_at')
        if not ok:
            out.update(decision='not_expired', events=0, trace=['eligibility', 'refuse'], status=seen['status'])
        elif at:
            n = FULL.index(at)
            out.update(decision=None, events=1 if n >= FULL.index('e2_barrier_append') else 0,
                       trace=FULL[:n + 1] + ['crash'], status='expired')
        else:
            out.update(decision='expired', events=1, trace=list(FULL), status='expired')
    elif kind == 'resume':
        prior = sr['runs'][run['of']]; n = FULL.index(prior['crash_at'])
        out.update(decision='expired', events=0 if n >= FULL.index('e2_barrier_append') else 1,
                   trace=RESUME if n < FULL.index('e2_barrier_append') else ['resume_pending_intent', 'resolve_original_receipt', 'e3_receipt_and_result', 'publish'],
                   status='expired')
    elif kind in ('replay', 'conflict'):
        out.update(events=0, trace=['dedupe_lookup', 'return_original' if kind == 'replay' else 'refuse_conflict'],
                   status=seen['status'])
    return out


def operands(case, put, common):
    runs = runs_of(case)
    if runs is None:
        put('sr_exp_eligible', ['boundary record missing'], [])
        return
    sr = case['sr']; expected = [expect(case, i) for i in range(len(runs))]
    executes = [i for i, r in enumerate(runs) if r['kind'] in ('expire', 'resume')]
    put('sr_exp_eligible', [runs[i].get('decision') for i in executes], [expected[i]['decision'] for i in executes])
    put('sr_exp_events', [len(r.get('events_appended', [])) for r in runs], [e['events'] for e in expected])
    put('sr_exp_order', [r.get('trace') for r in runs], [e['trace'] for e in expected])
    left = []; right = []
    for r, e in zip(runs, expected):
        after = r.get('point_after') or {}; seen = r['point_seen']
        left.append((after.get('status'), after.get('record_sha256'), after.get('hold_refs'), after.get('restore_point_id')))
        right.append((e['status'], seen['record_sha256'], seen['hold_refs'], seen['restore_point_id']))
    put('sr_exp_point', left, right)
    left = []; right = []
    for i, r in enumerate(runs):
        commit = r.get('commit_after')
        if r['kind'] in ('expire', 'resume') and isinstance(commit, dict):
            left.append(('commit', commit.get('expiry_id'), commit.get('event_id')))
            right.append(('commit', expected[i]['expiry_id'], expected[i]['event_id']))
        for event in r.get('events_appended', []):
            left.append(('event', event.get('event_id'), event.get('idempotency_key')))
            right.append(('event', expected[i]['event_id'], expected[i]['expiry_id']))
    put('sr_exp_identity', left, right)
    left = []; right = []
    for i, r in enumerate(runs):
        frozen = r.get('frozen_input')
        if frozen is None:
            continue
        p = frozen.get('payload', {}); seen = r['point_seen']; ev = (runs[r['of']] if r['kind'] == 'resume' else r)['evaluation']
        left.append((p.get('prior_hash'), p.get('retention_policy_ref'), p.get('ref_release_evidence_refs'), p.get('project_id'),
                     frozen.get('project_id'), p.get('restore_point_id'), p.get('status')))
        right.append((seen['record_sha256'], ev['policy_id'], ev['release_evidence_refs'], seen['project_id'],
                      seen['project_id'], seen['restore_point_id'], 'expired'))
    put('sr_exp_payload', left, right)
    left = []; right = []
    for i, r in enumerate(runs):
        commit = r.get('commit_after')
        if r['kind'] == 'expire' and isinstance(commit, dict):
            left.append(commit.get('eligibility')); right.append(commit_eligibility(r['evaluation']))
    put('sr_exp_evidence', left, right)
    left = []; right = []
    for r in runs:
        if r['kind'] != 'resume':
            continue
        prior = runs[r['of']]
        left.append((s.physical_hex(r.get('frozen_input')), (r.get('commit_after') or {}).get('expiry_id'),
                     (r.get('result') or {}).get('kind')))
        right.append((s.physical_hex(prior.get('frozen_input')), (prior.get('commit_after') or {}).get('expiry_id'),
                      'expired_original'))
    put('sr_exp_resume', left, right)
    left = []; right = []
    for r in runs:
        if r['kind'] in ('replay', 'conflict'):
            prior = runs[r['of']]
            want = prior.get('result') if r['kind'] == 'replay' else {'kind': 'refused', 'reason_code': 'idempotency_conflict'}
            left.append((r.get('result'), r.get('commit_after'))); right.append((want, prior.get('commit_after')))
    put('sr_exp_replay', left, right)


def simulate(case, run, prior=None):
    """Fixture constructor of the owner-conforming presented run (never called by the checker)."""
    seen = run['point_seen']; kind = run['kind']; stored = case['stored_event']
    expiry_id, event_id = ids(seen['project_id'], seen['restore_point_id'], seen['record_sha256'])
    run.update(events_appended=[], point_after=copy.deepcopy(seen), commit_after=copy.deepcopy(prior.get('commit_after')) if prior else None,
               frozen_input=None, result=None)
    if kind == 'expire':
        if not eligible(seen, run['evaluation']):
            run.update(trace=['eligibility', 'refuse'], decision='not_expired',
                       result={'kind': 'not_eligible', 'reason_code': 'expiry_not_eligible'})
            return run
        frozen = copy.deepcopy(stored)
        frozen['payload'].update(ref_release_evidence_refs=list(run['evaluation']['release_evidence_refs']))
        at = run.get('crash_at'); n = FULL.index(at) if at else len(FULL)
        run['frozen_input'] = frozen
        run['point_after']['status'] = 'expired'
        run['commit_after'] = {'expiry_id': expiry_id, 'event_id': event_id, 'state': 'pending_append' if n < FULL.index('e3_receipt_and_result') else 'committed',
                               'eligibility': commit_eligibility(run['evaluation'])}
        if n >= FULL.index('e2_barrier_append'):
            run['events_appended'] = [copy.deepcopy(frozen)]
        run['trace'] = FULL[:n + 1] + ['crash'] if at else list(FULL)
        run['decision'] = None if at else 'expired'
        run['result'] = None if at else {'kind': 'expired_original', 'receipt': copy.deepcopy(case['original_receipt'])}
    elif kind == 'resume':
        n = FULL.index(prior['crash_at'])
        run['frozen_input'] = copy.deepcopy(prior['frozen_input'])
        run['commit_after'] = dict(copy.deepcopy(prior['commit_after']), state='committed')
        if n < FULL.index('e2_barrier_append'):
            run['events_appended'] = [copy.deepcopy(prior['frozen_input'])]
            run['trace'] = list(RESUME)
        else:
            run['trace'] = ['resume_pending_intent', 'resolve_original_receipt', 'e3_receipt_and_result', 'publish']
        run['decision'] = 'expired'
        run['result'] = {'kind': 'expired_original', 'receipt': copy.deepcopy(case['original_receipt'])}
    elif kind == 'replay':
        run.update(trace=['dedupe_lookup', 'return_original'], result=copy.deepcopy(prior['result']))
    elif kind == 'conflict':
        run.update(trace=['dedupe_lookup', 'refuse_conflict'], result={'kind': 'refused', 'reason_code': 'idempotency_conflict'})
    return run


def scenario(case, runs):
    case['sr'] = {'family': EXP, 'runs': []}
    current = point()
    for spec in runs:
        run = copy.deepcopy(spec)
        if 'point_seen' not in run:
            run['point_seen'] = copy.deepcopy(current)
        prior = case['sr']['runs'][run['of']] if 'of' in run else None
        simulate(case, run, prior)
        case['sr']['runs'].append(run)
        current = copy.deepcopy(run['point_after'])
    return case


def augment(control):
    scenario(control, [{'kind': 'expire', 'evaluation': evaluation()},
                       {'kind': 'replay', 'of': 0}, {'kind': 'conflict', 'of': 0}])


BOUNDARY = '2026-12-12T17:00:00Z'  # released 2026-09-13T17:00:00Z + 7,776,000 s (90 days)
BRANCHES = [
    ('inclusive-boundary', {}, True),
    ('one-second-early', {'evaluated_at_utc': '2026-12-12T16:59:59Z'}, False),
    ('count-pressure-rank0', {'selection_kind': 'oldest_eligible_count_pressure', 'logical_point_count_before': 2049, 'rank': 0}, True),
    ('count-at-cap', {'selection_kind': 'oldest_eligible_count_pressure', 'logical_point_count_before': 2048, 'rank': 0}, False),
    ('count-pressure-younger', {'selection_kind': 'oldest_eligible_count_pressure', 'logical_point_count_before': 2049, 'rank': 1}, False),
    ('count-pressure-before-age', {'selection_kind': 'oldest_eligible_count_pressure', 'logical_point_count_before': 4000, 'rank': 0,
                                   'evaluated_at_utc': '2026-11-01T00:00:00Z'}, False),
    ('no-release-evidence', {'release_evidence_refs': []}, False),
    ('policy-inferred-from-prefix', {'policy_source': 'inferred_from_prefix'}, False),
    ('policy-inferred-from-mtime', {'policy_source': 'inferred_from_mtime'}, False),
] + [('blocker-' + k, {'blockers': {k: 1}}, False) for k in CLASSES] + [
    ('enumeration-incomplete-legal-hold', {'enumeration_complete': {'legal_hold': False}}, False)]


def cases():
    import pm_s3bo_cases as c
    controls = []; negatives = []
    base = w.build(EXP)
    main = s.control(EXP, 'sr/expiry', base)
    controls.append(main)
    R = lambda i, *path: ('sr', 'runs', i) + path
    for row, path, replacement, label in [
            ('sr_exp_eligible', R(0, 'decision'), 'not_expired', 'eligible-not-expired'),
            ('sr_exp_events', R(1, 'events_appended'), [base['stored_event']], 'replay-appends'),
            ('sr_exp_order', R(0, 'trace'), ['eligibility', 'e2_barrier_append', 'e1_status_and_intent'] + FULL[3:], 'append-before-e1'),
            ('sr_exp_order', R(0, 'trace'), FULL[:4] + ['publish', 'e3_receipt_and_result'], 'publish-before-e3'),
            ('sr_exp_point', R(0, 'point_after', 'record_sha256'), 'f' * 64, 'hash-rewritten'),
            ('sr_exp_point', R(0, 'point_after', 'status'), 'deleted', 'wrong-terminal'),
            ('sr_exp_replay', R(1, 'result', 'receipt', 'sequence_id'), 99, 'replay-other-result'),
            ('sr_exp_replay', R(2, 'result', 'reason_code'), None, 'conflict-accepted'),
            ('sr_exp_replay', R(2, 'commit_after', 'state'), 'pending_append', 'conflict-reopens')]:
        negatives.append(c.mutate(main, row, path, replacement, label))
    # One stored expiry commit, presented by every run that reads it.
    for row, key_path, replacement, label in [
            ('sr_exp_identity', ('expiry_id',), 'rpe_' + 'e' * 64, 'second-expiry-identity'),
            ('sr_exp_evidence', ('eligibility', 'hold_evaluations', 3, 'active_blocker_count'), 1, 'commit-hides-active-hold'),
            ('sr_exp_evidence', ('eligibility', 'selection', 'evaluated_at_utc'), '2026-12-13T00:00:00Z', 'commit-other-evaluation'),
            ('sr_exp_evidence', ('eligibility', 'ref_release_evidence'), [], 'commit-drops-release-evidence')]:
        value = copy.deepcopy(main['value'])
        for r in value['sr']['runs']:
            if isinstance(r.get('commit_after'), dict):
                c.set_path(r['commit_after'], key_path, replacement)
        negatives.append(c.negative(main, row, label, value, {'commit_copies': 'every run', 'path': list(key_path)}))
    for field, replacement in [('prior_hash', 'f' * 64), ('ref_release_evidence_refs', ['release-evidence:inferred'])]:
        value = copy.deepcopy(main['value'])
        for path in (R(0, 'frozen_input', 'payload', field), R(0, 'events_appended', 0, 'payload', field)):
            c.set_path(value, path, replacement)
        negatives.append(c.negative(main, 'sr_exp_payload', 'payload-' + field, value, {'copies': 'frozen input and appended event', 'field': field}))
    for label, change, ok in BRANCHES:
        value = w.build(EXP); scenario(value, [{'kind': 'expire', 'evaluation': evaluation(**change)}])
        control = s.control(EXP, 'sr/' + label, value); controls.append(control)
        if ok:
            negatives.append(c.mutate(control, 'sr_exp_eligible', R(0, 'decision'), 'not_expired', 'eligible-refused'))
        else:
            negatives.append(c.mutate(control, 'sr_exp_eligible', R(0, 'decision'), 'expired', 'ineligible-expired'))
            negatives.append(c.mutate(control, 'sr_exp_point', R(0, 'point_after', 'status'), 'expired', 'ineligible-status-change'))
            negatives.append(c.mutate(control, 'sr_exp_events', R(0, 'events_appended'), [value['stored_event']], 'ineligible-appends'))
    for label, point_change in [('status-deleted', {'status': 'deleted'}), ('status-corrupt', {'status': 'corrupt'}),
                                ('hash-unauthenticated', {'hash_authenticated': False}),
                                ('already-expired', {'status': 'expired'})]:
        value = w.build(EXP); scenario(value, [{'kind': 'expire', 'evaluation': evaluation(), 'point_seen': dict(point(), **point_change)}])
        control = s.control(EXP, 'sr/' + label, value); controls.append(control)
        negatives.append(c.mutate(control, 'sr_exp_eligible', R(0, 'decision'), 'expired', 'nonavailable-expired'))
        negatives.append(c.mutate(control, 'sr_exp_point', R(0, 'point_after', 'status'),
                                  'expired' if point_change.get('status', 'available') == 'available' else 'available', 'status-rewritten'))
    for at in ('e1_status_and_intent', 'e2_barrier_append', 'e2_first_receipt'):
        value = w.build(EXP)
        scenario(value, [{'kind': 'expire', 'evaluation': evaluation(), 'crash_at': at}, {'kind': 'resume', 'of': 0}])
        control = s.control(EXP, 'sr/crash-after-' + at, value); controls.append(control)
        negatives.append(c.mutate(control, 'sr_exp_point', R(1, 'point_after', 'status'), 'available', 'rollback-to-available'))
        negatives.append(c.mutate(control, 'sr_exp_resume', R(1, 'frozen_input', 'occurred_at_utc'), '2026-12-13T00:00:00Z', 'resume-recaptures'))
        negatives.append(c.mutate(control, 'sr_exp_resume', R(1, 'result', 'kind'), 'refused', 'resume-substitutes-refusal'))
        negatives.append(c.mutate(control, 'sr_exp_events', R(1, 'events_appended'),
                                  [value['stored_event']] * (2 if at == 'e1_status_and_intent' else 1), 'resume-duplicate-append'))
    # SP-275 closed value shapes (expiry_commit, checkpoint with the DL-076
    # durable token) through the common auxiliary schema boundary.
    fixtures = w.read_json('Plans/restore_point_expired_contract_fixtures.json')
    schema = w.read_json('Plans/restore_point_expired_contracts.schema.json')
    prior = None
    for item in fixtures['value_shape_cases']:
        value = w.build(EXP)
        value['auxiliary'] = {'schema': dict(schema, **{'$ref': '#/$defs/' + item['definition']}), 'value': copy.deepcopy(item['value'])}
        identifier = EXP + '/sr/value-shape/' + item['id']
        if item['valid']:
            prior = identifier; controls.append({'id': identifier, 'value': value, 'boundary': 'append'})
        else:
            negatives.append(dict(id=identifier, family=EXP, control=prior, target='auxiliary_schema',
                                  code=c.code('auxiliary_schema'), defect={'owner_fixture': item['id']}, value=value))
    return controls, negatives


def evidence(out):
    """Authenticate the DL-076 refrozen package and replay its validator on a scratch copy."""
    result = {'package': str(PACKAGE), 'pinned_manifest_sha256': PACKAGE_MANIFEST_SHA256,
              'prior_manifest_sha256': PRIOR_MANIFEST_SHA256}
    manifest_path = PACKAGE / 'manifest.json'
    actual = hashlib.sha256(manifest_path.read_bytes()).hexdigest() if manifest_path.exists() else None
    result['manifest_sha256'] = actual
    if actual != PACKAGE_MANIFEST_SHA256:
        result['status'] = 'fail'; result['error'] = 'v6 manifest missing or changed'
        return result
    manifest = json.loads(manifest_path.read_text())
    bad = [f['path'] for f in manifest['files'] if hashlib.sha256((PACKAGE / f['path']).read_bytes()).hexdigest() != f['sha256']]
    result['verified_files'] = len(manifest['files']) - len(bad)
    result['changed_files'] = bad
    if manifest['prior_immutable_manifest']['sha256'] != PRIOR_MANIFEST_SHA256 or bad:
        result['status'] = 'fail'; return result
    replay = Path(out) / 'expiry-v6-replay'
    if replay.exists():
        shutil.rmtree(replay)
    shutil.copytree(PACKAGE.parent, replay, ignore=shutil.ignore_patterns('__pycache__'))
    runs = {}
    for script in ('validate_v6.py', 'check_fidelity_v6.py'):
        run = subprocess.run([sys.executable, '-B', script], cwd=replay / 'v6', capture_output=True, text=True, timeout=1800)
        runs[script] = {'returncode': run.returncode, 'tail': (run.stdout + run.stderr)[-1500:]}
    produced = json.loads((replay / 'v6' / 'v6-static-validation.json').read_text())
    joined = json.loads((replay / 'v6' / 'joined-v6-fixtures.json').read_text())
    frozen = json.loads((PACKAGE / 'joined-v6-fixtures.json').read_text())
    stored_tokens = [x['id'] for x in joined if 'redb_snapshot_id' in x['value'].get('checkpoint', {}).get('generic_read_token', {})]
    result.update(runs=runs, validation={k: produced.get(k) for k in ('status', 'joined_cases', 'positive', 'schema_valid_negatives',
                                                                       'generation_cases', 'independent_exact_post_E1_hold_repro')},
                  replay_equals_frozen_fixtures=joined == frozen, stored_tokens_with_snapshot_id=stored_tokens)
    shutil.rmtree(replay)
    ok = all(r['returncode'] == 0 for r in runs.values()) and joined == frozen and not stored_tokens \
        and produced.get('status') == 'PASS_STATIC_ONLY'
    result['status'] = 'pass' if ok else 'fail'
    return result
