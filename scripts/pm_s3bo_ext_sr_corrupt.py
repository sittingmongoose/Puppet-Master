"""C12-SR: restore_point.corrupt complete detection boundary.

Owner clauses: SP-2203 (emitter, attest-then-commit-then-append order, rpx_
identity, terminal serialization with deletion/expiry, custody, re-detection,
replay, readers report only), ACD "Immutable conversation restore-point
lifecycle - Known-37 completion" (fixed precedence and the four reason/evidence
pairs), FileSafe "Known-37 corruption evidence" (refs/hashes/lengths only,
missing is not corruption, indeterminate I/O is unknown), ATS
EA-OC-004-POS-01..06 / NEG-01..11 and ATS-2203, and the Storage v1-reader-to-v2
binding for MIG-RESTORE-POINT-CORRUPT-PAYLOAD-001@1.0.0.

A boundary record (`case['sr']`) holds the canonical point, the trusted record
hash and observed bytes hash, every referenced material's independent expected
and observed hash/length/scope, existing terminal commits, the FileSafe
attestation and every run (owner detection, re-detection, reader candidate,
replay, conflicting replay, post-corruption actions, v1 upgrade). Expected
outcomes come from those inputs by the owner precedence; predicates compare.
Native execution remains NOT_RUN.
"""
import copy

import pm_s3bo_oracles as w
import pm_s3bo_sr_common as s

LANE = 'sr'
COR = 'restore_point.corrupt'
FAMILIES = (COR,)
ROOT = s.schema_root(s.APPLICATION_SCHEMA_PATH, 'corruption_commit')
POINT_ID = 'rpc_' + '2' * 64
FIELDS = ('context_provenance_refs', 'attachment_refs', 'citation_refs')
KIND = {'record_hash_mismatch': 'record_hash_comparison', 'unreadable_record': 'record_decode_failure',
        'corrupt_referenced_material': 'referenced_material_integrity_check',
        'unsupported_content_scope': 'content_scope_validation'}
MATERIAL_KEYS = ('referenced_material_field', 'referenced_material_ref', 'expected_material_hash',
                 'observed_material_hash', 'expected_material_length', 'observed_material_length')
U64 = (1 << 64) - 1
EVENT_TRACE = ['filesafe_attest', 'reread_point', 'commit_pending', 'barrier_append', 'first_receipt',
               'publish_unavailable']
ATTEST = {'ref': 'filesafe.attestation:corrupt-A', 'evidence_ref': 'filesafe.evidence:corrupt-A'}

ROWS = [
    ('sr_cor_outcome', 'sr_corrupt', 'equal', 'Detection follows the fixed precedence: missing and indeterminate stop, then record hash, decode, material integrity, content scope; no fifth reason.'),
    ('sr_cor_events', 'sr_corrupt', 'equal', 'Exactly one corrupt event per point, appended only by the owner commit of a finding; readers, re-detection, replay and refusals append nothing.'),
    ('sr_cor_payload', 'sr_corrupt', 'equal', 'The appended payload carries the reason, its paired evidence kind and exactly the branch fields derived from the attested inputs.'),
    ('sr_cor_evidence', 'sr_corrupt', 'equal', 'The commit holds the complete attested FileSafe evidence for this point and material: refs, lowercase hashes and lengths only.'),
    ('sr_cor_order', 'sr_corrupt', 'equal', 'Steps run attest, re-read, commit, barrier append, first receipt, publish; stops and refusals end before any commit.'),
    ('sr_cor_identity', 'sr_corrupt', 'equal', 'corruption_id, event_id and the EventRecord key follow the rpx_ recipe of project and point.'),
    ('sr_cor_thread', 'sr_corrupt', 'equal', 'Envelope thread and commit source thread are the point source thread when the record is readable, else null.'),
    ('sr_cor_terminal', 'sr_corrupt', 'equal', 'A deletion or expiry commit excludes a corruption commit, and a settled corruption refuses later branch, delete and expire.'),
    ('sr_cor_once', 'sr_corrupt_custody', 'equal', 'Re-detection and replay resolve to the existing commit; the first reason stands and nothing is minted.'),
    ('sr_cor_status', 'sr_corrupt_custody', 'equal', 'The record bytes are never rewritten; readers project corrupt exactly when a settled corruption commit exists.'),
    ('sr_cor_reader', 'sr_corrupt_custody', 'equal', 'A reader that verifies a point only reports a candidate finding; it writes no commit.'),
    ('sr_cor_receipt', 'sr_corrupt_custody', 'equal', "The commit names its event's own SP-286 custody key and replay returns that original receipt."),
    ('sr_cor_conflict', 'sr_corrupt_custody', 'equal', 'Same identity with a different semantic digest is idempotency_conflict and the commit is unchanged.'),
    ('sr_cor_schema', 'sr_corrupt_custody', 'error', 'Every corruption commit validates against the complete closed corruption_commit schema.'),
    ('sr_cor_time', 'sr_corrupt_custody', 'error', 'Commit timestamps use shared date_time with the Storage UTC-Z profile.'),
    ('sr_cor_numbers', 'sr_corrupt_custody', 'error', 'Material lengths in commit evidence and appended payloads use shared current_integer with the exact 0..2^64-1 range.'),
    ('sr_cor_event_schema', 'sr_corrupt_upgrade', 'error', 'Every appended payload validates against the complete registered v2 payload schema, all oneOf branches intact.'),
    ('sr_cor_upgrade', 'sr_corrupt_upgrade', 'equal', 'A frozen v1 payload upgrades only with exactly one identity-matching evidence result, to the derived root v2 value; otherwise it quarantines.'),
    ('sr_cor_upgrade_source', 'sr_corrupt_upgrade', 'equal', 'Upgrade preserves the v1 source bytes and the semantic event count and appends nothing.'),
    ('sr_cor_stored', 'sr_corrupt_upgrade', 'equal', 'The first appended corruption event of the record-hash scenario is the independently stored EventRecord.'),
]


def ids(project, point_id):
    digest = w.sha(w.lp('restore_point.corrupt/corrupt/v1', project, point_id))
    return 'rpx_' + digest, 'er_rpx_' + digest


def payload(p, project):
    p.update(restore_point_id=POINT_ID, expected_hash='a' * 64, observed_hash='b' * 64,
             evidence_ref=ATTEST['evidence_ref'])


def envelope(event):
    event['thread_id'] = 'thread-source'


def point():
    return {'project_id': w.PROJECT, 'restore_point_id': POINT_ID, 'record_ref': 'rp:' + w.PROJECT + ':' + POINT_ID,
            'status': 'available', 'source_thread_id': 'thread-source',
            'context_provenance_refs': ['ctx-A', 'prov-A'], 'attachment_refs': ['att-A'], 'citation_refs': ['cit-A']}


def material(field, ref, **changes):
    value = {'field': field, 'ref': ref, 'present': True, 'io': 'ok', 'expected_hash': 'c' * 64,
             'expected_length': 128, 'observed_hash': 'c' * 64, 'observed_length': 128, 'scope': 'supported'}
    value.update(changes)
    return value


def inputs(**changes):
    value = {'record': {'present': True, 'io': 'ok', 'decodable': True, 'trusted_hash': 'a' * 64,
                        'observed_hash': 'a' * 64},
             'materials': [material('context_provenance_refs', 'ctx-A'), material('context_provenance_refs', 'prov-A'),
                           material('attachment_refs', 'att-A'), material('citation_refs', 'cit-A')],
             'terminal': []}
    for key, change in changes.items():
        if key == 'record':
            value['record'].update(change)
        elif key == 'material':
            index, update = change
            value['materials'][index].update(update)
        else:
            value[key] = change
    return value


def classify(state):
    """Owner precedence over independent inputs; returns (outcome, material)."""
    record = state['record']
    if record['io'] == 'indeterminate':
        return 'unknown', None
    if not record['present']:
        return 'missing', None
    if record['trusted_hash'] is not None and record['observed_hash'] != record['trusted_hash']:
        return 'record_hash_mismatch', None
    if not record['decodable']:
        return 'unreadable_record', None
    materials = state['materials']
    if any(m['io'] == 'indeterminate' for m in materials):
        return 'unknown', None
    if any(not m['present'] for m in materials):
        return 'missing', None
    for m in materials:
        if m['expected_hash'] != m['observed_hash'] or m['expected_length'] != m['observed_length']:
            return 'corrupt_referenced_material', m
    for m in materials:
        if m['scope'] != 'supported':
            return 'unsupported_content_scope', m
    return 'intact', None


def evidence_for(state, reason, m):
    record = state['record']
    value = {'reason_code': reason, 'evidence_kind': KIND[reason], 'evidence_ref': ATTEST['evidence_ref'],
             'expected_hash': None if reason == 'unreadable_record' else record['trusted_hash'],
             'observed_hash': record['observed_hash']}
    value.update({k: None for k in MATERIAL_KEYS})
    if m is not None:
        value.update(referenced_material_field=m['field'], referenced_material_ref=m['ref'])
        if reason == 'corrupt_referenced_material':
            value.update(expected_material_hash=m['expected_hash'], observed_material_hash=m['observed_hash'],
                         expected_material_length=m['expected_length'], observed_material_length=m['observed_length'])
    return value


def payload_for(evidence, point_value):
    value = {'schema_version': '2.0.0', 'restore_point_id': point_value['restore_point_id'],
             'project_id': point_value['project_id'], 'status': 'corrupt', 'reason_code': evidence['reason_code'],
             'expected_hash': evidence['expected_hash'], 'observed_hash': evidence['observed_hash'],
             'evidence_kind': evidence['evidence_kind'], 'evidence_ref': evidence['evidence_ref'],
             'occurred_at_utc': w.TIME}
    for key in MATERIAL_KEYS:
        if evidence[key] is not None:
            value[key] = evidence[key]
    return value


def commit_for(state, point_value, evidence, settled=True):
    corruption_id, event_id = ids(point_value['project_id'], point_value['restore_point_id'])
    readable = state['record']['present'] and state['record']['decodable']
    return {'schema_id': 'pm.storage_value.restore_point_corruption_commit.v1', 'schema_version': '1.0.0',
            'storage_instance_id': w.STORE, 'project_id': point_value['project_id'],
            'scope_partition': w.partition(point_value['project_id']), 'corruption_id': corruption_id,
            'restore_point_id': point_value['restore_point_id'],
            'source_thread_id': point_value['source_thread_id'] if readable else None,
            'before_status': 'available', 'after_status': 'corrupt', 'evidence': copy.deepcopy(evidence),
            'filesafe_attestation_ref': ATTEST['ref'], 'state': 'settled' if settled else 'pending',
            'frozen_append_input_sha256': 'f' * 64, 'event_id': event_id,
            'append_receipt_ref': s.custody_key(event_id) if settled else None,
            'committed_at_utc': w.TIME, 'settled_at_utc': w.TIME if settled else None,
            'redaction_profile': 'ids_hashes_refs_only'}


def event_for(case, state, point_value, evidence):
    corruption_id, event_id = ids(point_value['project_id'], point_value['restore_point_id'])
    event = copy.deepcopy(case['stored_event'])
    readable = state['record']['present'] and state['record']['decodable']
    event.update(event_id=event_id, idempotency_key=corruption_id,
                 thread_id=point_value['source_thread_id'] if readable else None)
    event['payload'] = payload_for(evidence, point_value)
    return event


# ---------------------------------------------------------------- expectations

def expect(case, i):
    sr = case['sr']; run = sr['runs'][i]; kind = run['kind']
    point_value = sr['point']; corruption_id, event_id = ids(point_value['project_id'], point_value['restore_point_id'])
    prior_commit = run.get('commit_before')
    out = {'event_id': event_id, 'corruption_id': corruption_id}
    if kind == 'detect':
        outcome, m = classify(run['state'])
        if prior_commit is not None:
            out.update(result=('existing', prior_commit['evidence']['reason_code']), events=0,
                       trace=['filesafe_attest', 'reread_point', 'resolve_existing'], commit=prior_commit)
        elif outcome in KIND and run['state']['terminal']:
            out.update(result=('terminal_exists', None), events=0,
                       trace=['filesafe_attest', 'reread_point', 'refuse_terminal'], commit=None)
        elif outcome in KIND:
            evidence = evidence_for(run['state'], outcome, m)
            out.update(result=('corrupt', outcome), events=1, trace=list(EVENT_TRACE),
                       evidence=evidence, payload=payload_for(evidence, point_value),
                       commit=None)
        else:
            out.update(result=({'missing': 'unavailable_missing', 'unknown': 'unknown_quarantined',
                                'intact': 'intact'}[outcome], None), events=0,
                       trace=['filesafe_attest', 'reread_point', 'stop'], commit=None)
    elif kind == 'reader':
        out.update(result=('candidate_reported', None), events=0, trace=['report_candidate'], commit=prior_commit)
    elif kind == 'replay':
        out.update(events=0, trace=['dedupe_lookup', 'return_original'], commit=prior_commit)
    elif kind == 'conflict':
        out.update(events=0, trace=['dedupe_lookup', 'refuse_conflict'], commit=prior_commit)
    elif kind == 'action':
        settled = prior_commit is not None and prior_commit.get('state') == 'settled'
        out.update(result=('refused', 'restore_point_corrupt') if settled else ('admitted', None), events=0,
                   trace=['admission', 'refuse_corrupt'] if settled else ['admission', 'admit'], commit=prior_commit)
    elif kind == 'upgrade':
        out.update(events=0, trace=None)
    return out


def upgrade_expected(run):
    """MIG-RESTORE-POINT-CORRUPT-PAYLOAD-001: derive v2 only from one matching evidence result."""
    v1 = run['v1_payload']
    if v1.get('reason_code') not in KIND:
        return None, 'restore_point_corrupt_v1_upgrade_unresolvable'
    if v1['reason_code'] == 'unreadable_record' and isinstance(v1.get('expected_hash'), str):
        return None, 'restore_point_corrupt_v1_upgrade_unresolvable'
    matching = [e for e in run['evidence_results']
                if e.get('project_id') == v1.get('project_id') and e.get('restore_point_id') == v1.get('restore_point_id')
                and e.get('evidence', {}).get('reason_code') == v1['reason_code']
                and e.get('evidence', {}).get('observed_hash') == v1.get('observed_hash')
                and (v1['reason_code'] == 'unreadable_record' or e.get('evidence', {}).get('expected_hash') == v1.get('expected_hash'))]
    if len(matching) != 1:
        return None, 'restore_point_corrupt_v1_upgrade_unresolvable'
    evidence = matching[0]['evidence']
    value = payload_for(evidence, {'restore_point_id': v1['restore_point_id'], 'project_id': v1['project_id']})
    value['occurred_at_utc'] = v1['occurred_at_utc']
    return value, None


# ---------------------------------------------------------------- operands

def runs_of(case):
    sr = case.get('sr')
    if not isinstance(sr, dict) or not isinstance(sr.get('runs'), list):
        return None
    return sr['runs']


def operands(case, put, common):
    runs = runs_of(case)
    if runs is None:
        put('sr_cor_schema', ['boundary record missing'])
        return
    sr = case['sr']; point_value = sr['point']
    expected = [expect(case, i) for i in range(len(runs))]
    payload_schema = w.schema_for(COR)
    detect = [i for i, r in enumerate(runs) if r['kind'] == 'detect']
    put('sr_cor_outcome', [tuple(runs[i].get('result') or ()) for i in detect], [expected[i]['result'] for i in detect])
    put('sr_cor_events', [len(r.get('events_appended', [])) for r in runs if r['kind'] != 'upgrade'],
        [e['events'] for r, e in zip(runs, expected) if r['kind'] != 'upgrade'])
    left = []; right = []
    for i in detect:
        if 'payload' not in expected[i]:
            continue
        want = dict(expected[i]['payload']); want.pop('occurred_at_utc', None)
        for event in runs[i].get('events_appended', []):
            p = event.get('payload', {}) if isinstance(event, dict) else {}
            left.append({k: p.get(k, 'absent') for k in want}); right.append(want)
            present = sorted(k for k in MATERIAL_KEYS if k in p)
            left.append(present); right.append(sorted(k for k in MATERIAL_KEYS if k in want))
    put('sr_cor_payload', left, right)
    left = []; right = []
    for i in detect:
        commit = runs[i].get('commit_after')
        if 'evidence' in expected[i] and isinstance(commit, dict):
            left.append((commit.get('evidence'), commit.get('filesafe_attestation_ref')))
            right.append((expected[i]['evidence'], ATTEST['ref']))
    put('sr_cor_evidence', left, right)
    put('sr_cor_order', [r.get('trace') for r in runs if r['kind'] != 'upgrade'],
        [e['trace'] for r, e in zip(runs, expected) if r['kind'] != 'upgrade'])
    left = []; right = []
    for i, r in enumerate(runs):
        commit = r.get('commit_after')
        if new_commit(r):
            left.append(('commit', commit.get('corruption_id'), commit.get('event_id')))
            right.append(('commit', expected[i]['corruption_id'], expected[i]['event_id']))
        for event in r.get('events_appended', []):
            left.append(('event', event.get('event_id'), event.get('idempotency_key')))
            right.append(('event', expected[i]['event_id'], expected[i]['corruption_id']))
    put('sr_cor_identity', left, right)
    left = []; right = []
    for i in detect:
        state = runs[i]['state']; readable = state['record']['present'] and state['record']['decodable']
        thread = point_value['source_thread_id'] if readable else None
        commit = runs[i].get('commit_after')
        if 'evidence' not in expected[i]:
            continue  # stops and refusals have no thread join; an append there is sr_cor_events
        if isinstance(commit, dict):
            left.append(('commit', commit.get('source_thread_id'))); right.append(('commit', thread))
        for event in runs[i].get('events_appended', []):
            left.append(('event', event.get('thread_id'))); right.append(('event', thread))
    put('sr_cor_thread', left, right)
    left = []; right = []
    for i, r in enumerate(runs):
        if r['kind'] == 'detect' and expected[i]['result'][0] == 'terminal_exists':
            left.append(('commit', r.get('commit_after'))); right.append(('commit', None))
        if r['kind'] == 'action':
            left.append(('action', tuple(r.get('result') or ()))); right.append(('action', expected[i]['result']))
    put('sr_cor_terminal', left, right)
    left = []; right = []
    for i, r in enumerate(runs):
        if r['kind'] in ('replay', 'action') or (r['kind'] == 'detect' and r.get('commit_before') is not None):
            left.append(r.get('commit_after')); right.append(r.get('commit_before'))
    put('sr_cor_once', left, right)
    left = []; right = []
    for r in runs:
        if r['kind'] == 'upgrade':
            continue
        commit = r.get('commit_after')
        settled = isinstance(commit, dict) and commit.get('state') == 'settled'
        left.append((r.get('record_after_hex'), r.get('status_projection')))
        right.append((sr['record_hex'], 'corrupt' if settled else point_value['status']))
    put('sr_cor_status', left, right)
    put('sr_cor_reader', [r.get('commit_after') for r in runs if r['kind'] == 'reader'],
        [r.get('commit_before') for r in runs if r['kind'] == 'reader'])
    left = []; right = []
    for i, r in enumerate(runs):
        commit = r.get('commit_after')
        if new_commit(r) and commit.get('state') == 'settled':
            left.append(commit.get('append_receipt_ref')); right.append(s.custody_key(expected[i]['event_id']))
        if r['kind'] == 'replay':
            left.append((r.get('result') or {}).get('receipt')); right.append(sr['receipts'].get(expected[i]['event_id']))
    put('sr_cor_receipt', left, right)
    left = []; right = []
    for r in runs:
        if r['kind'] == 'conflict':
            left.append(((r.get('result') or {}).get('reason_code'), r.get('commit_after')))
            right.append(('idempotency_conflict', r.get('commit_before')))
    put('sr_cor_conflict', left, right)
    commits = [r['commit_after'] for r in runs if new_commit(r)]
    numbers = []
    for commit in commits:
        numbers += s.integer_errors(commit.get('evidence'), [('expected_material_length', 0, U64),
                                                            ('observed_material_length', 0, U64)])
    for r in runs:
        for event in r.get('events_appended', []):
            numbers += s.integer_errors(event.get('payload'), [('expected_material_length', 0, U64),
                                                              ('observed_material_length', 0, U64)])
    put('sr_cor_numbers', numbers)
    put('sr_cor_schema', [e for commit in commits for e in s.keyword_errors(ROOT, commit)] if not numbers else [],
        applies=not numbers)
    put('sr_cor_time', [e for commit in commits for e in s.time_errors(commit, ('committed_at_utc', 'settled_at_utc'), w.STORAGE_UTC_Z)])
    produced = [event.get('payload') for r in runs for event in r.get('events_appended', [])]
    produced += [r.get('upgraded') for r in runs if r['kind'] == 'upgrade' and r.get('upgraded') is not None]
    put('sr_cor_event_schema', [e for value in produced for e in s.keyword_errors(payload_schema, value)] if not numbers else [],
        applies=not numbers)
    left = []; right = []; src_left = []; src_right = []
    for r in runs:
        if r['kind'] != 'upgrade':
            continue
        value, reason = upgrade_expected(r)
        left.append((r.get('upgraded'), r.get('quarantine_reason'))); right.append((value, reason))
        src_left.append((r.get('v1_after_hex'), len(r.get('events_appended', []))))
        src_right.append((s.physical_hex(r['v1_payload']), 0))
    put('sr_cor_upgrade', left, right)
    put('sr_cor_upgrade_source', src_left, src_right)
    if sr.get('main'):
        first = next((r['events_appended'][0] for r in runs if r['kind'] == 'detect' and r.get('events_appended')), None)
        put('sr_cor_stored', s.physical_hex(first), s.physical_hex(case['stored_event']))


def new_commit(run):
    """A commit written by this run: an owner detection with no prior commit."""
    return run['kind'] == 'detect' and run.get('commit_before') is None and isinstance(run.get('commit_after'), dict)


# ---------------------------------------------------------------- fixtures

def simulate(case, run):
    """Fixture constructor of the owner-conforming presented outcome (never called by the checker)."""
    sr = case['sr']; point_value = sr['point']; kind = run['kind']
    corruption_id, event_id = ids(point_value['project_id'], point_value['restore_point_id'])
    prior = run.get('commit_before')
    run.update(events_appended=[], record_after_hex=sr['record_hex'], commit_after=copy.deepcopy(prior))
    if kind == 'detect':
        outcome, m = classify(run['state'])
        if prior is not None:
            run.update(trace=['filesafe_attest', 'reread_point', 'resolve_existing'],
                       result=['existing', prior['evidence']['reason_code']])
        elif outcome in KIND and run['state']['terminal']:
            run.update(trace=['filesafe_attest', 'reread_point', 'refuse_terminal'], result=['terminal_exists', None])
        elif outcome in KIND:
            evidence = evidence_for(run['state'], outcome, m)
            if sr.get('main') and not sr.get('main_used'):
                event = case['stored_event']; sr['main_used'] = True
            else:
                event = event_for(case, run['state'], point_value, evidence)
            sr['receipts'][event_id] = dict(copy.deepcopy(case['original_receipt']), event_id=event['event_id'])
            run.update(trace=list(EVENT_TRACE), result=['corrupt', outcome], events_appended=[copy.deepcopy(event)],
                       commit_after=commit_for(run['state'], point_value, evidence))
        else:
            run.update(trace=['filesafe_attest', 'reread_point', 'stop'],
                       result=[{'missing': 'unavailable_missing', 'unknown': 'unknown_quarantined',
                                'intact': 'intact'}[outcome], None])
    elif kind == 'reader':
        run.update(trace=['report_candidate'], result=['candidate_reported', None])
    elif kind == 'replay':
        run.update(trace=['dedupe_lookup', 'return_original'],
                   result={'receipt': copy.deepcopy(sr['receipts'].get(event_id))})
    elif kind == 'conflict':
        run.update(trace=['dedupe_lookup', 'refuse_conflict'], result={'reason_code': 'idempotency_conflict'})
    elif kind == 'action':
        settled = prior is not None and prior.get('state') == 'settled'
        run.update(trace=['admission', 'refuse_corrupt'] if settled else ['admission', 'admit'],
                   result=['refused', 'restore_point_corrupt'] if settled else ['admitted', None])
    elif kind == 'upgrade':
        value, reason = upgrade_expected(run)
        run.update(upgraded=value, quarantine_reason=reason, v1_after_hex=s.physical_hex(run['v1_payload']))
    settled = isinstance(run['commit_after'], dict) and run['commit_after'].get('state') == 'settled'
    run['status_projection'] = 'corrupt' if settled else point_value['status']
    return run


def scenario(case, runs, main=False):
    point_value = point()
    case['sr'] = {'family': COR, 'point': point_value, 'record_hex': w.sha(w.lp(*map(str, sorted(point_value.items())))),
                  'receipts': {}, 'main': main, 'runs': []}
    commit = None
    for spec in runs:
        run = copy.deepcopy(spec)
        run['commit_before'] = copy.deepcopy(commit)
        simulate(case, run)
        if run['kind'] == 'detect' and run.get('commit_after') is not None:
            commit = copy.deepcopy(run['commit_after'])
        case['sr']['runs'].append(run)
    return case


def main_runs():
    corrupt = inputs(record={'observed_hash': 'b' * 64})
    later = inputs(record={'observed_hash': 'b' * 64}, material=(2, {'observed_hash': 'd' * 64}))
    return [{'kind': 'reader', 'state': corrupt},
            {'kind': 'detect', 'state': corrupt},
            {'kind': 'detect', 'state': later},
            {'kind': 'replay', 'state': corrupt},
            {'kind': 'conflict', 'state': corrupt},
            {'kind': 'action', 'action': 'branch', 'state': corrupt},
            {'kind': 'action', 'action': 'delete', 'state': corrupt},
            {'kind': 'action', 'action': 'expire', 'state': corrupt}]


def augment(control):
    scenario(control, main_runs(), main=True)


BRANCHES = [
    ('unreadable-record', {'record': {'trusted_hash': None, 'decodable': False}}),
    ('mismatch-over-decode', {'record': {'observed_hash': 'b' * 64, 'decodable': False}}),
    ('material-hash-context', {'material': (0, {'observed_hash': 'd' * 64})}),
    ('material-length-attachment', {'material': (2, {'observed_length': 129})}),
    ('material-hash-citation', {'material': (3, {'observed_hash': 'd' * 64, 'observed_length': 7})}),
    ('corrupt-over-unsupported', {'material': (2, {'observed_hash': 'd' * 64, 'scope': 'unsupported'})}),
    ('unsupported-scope', {'material': (1, {'scope': 'unsupported'})}),
    ('missing-record', {'record': {'present': False}}),
    ('missing-material', {'material': (2, {'present': False})}),
    ('indeterminate-record-io', {'record': {'io': 'indeterminate', 'observed_hash': 'b' * 64}}),
    ('indeterminate-material-io', {'material': (3, {'io': 'indeterminate', 'observed_hash': 'd' * 64})}),
    ('intact', {}),
    ('deletion-commit-exists', {'record': {'observed_hash': 'b' * 64}, 'terminal': ['deletion']}),
    ('expiry-commit-exists', {'record': {'observed_hash': 'b' * 64}, 'terminal': ['expiry']}),
]


def v1_payload(reason='record_hash_mismatch', **changes):
    value = {'schema_version': '1.0.0', 'restore_point_id': POINT_ID, 'project_id': w.PROJECT,
             'expected_hash': 'a' * 64, 'observed_hash': 'b' * 64, 'status': 'corrupt', 'reason_code': reason,
             'occurred_at_utc': w.TIME}
    value.update(changes)
    return value


def evidence_result(reason='record_hash_mismatch', **changes):
    state = inputs(record={'observed_hash': 'b' * 64})
    m = None
    if reason in ('corrupt_referenced_material', 'unsupported_content_scope'):
        state = inputs(material=(2, {'observed_hash': 'd' * 64}))
        state['record']['observed_hash'] = 'b' * 64; state['record']['trusted_hash'] = 'b' * 64
        m = state['materials'][2]
    evidence = evidence_for(state, reason, m)
    evidence.update(changes)
    return {'project_id': w.PROJECT, 'restore_point_id': POINT_ID, 'evidence': evidence}


UPGRADES = [
    ('upgrade-mismatch', v1_payload(), [evidence_result()]),
    ('upgrade-material', v1_payload('corrupt_referenced_material', expected_hash='b' * 64),
     [evidence_result('corrupt_referenced_material')]),
    ('upgrade-no-evidence', v1_payload(), []),
    ('upgrade-two-evidence', v1_payload(), [evidence_result(), evidence_result(evidence_ref='filesafe.evidence:other')]),
    ('upgrade-unreadable-with-hash', v1_payload('unreadable_record'), [evidence_result('unreadable_record')]),
    ('upgrade-fifth-reason', v1_payload('missing_material'), [evidence_result()]),
]


def cases():
    import pm_s3bo_cases as c
    controls = []; negatives = []
    base = w.build(COR)
    main = s.control(COR, 'sr/record-hash-mismatch', base)
    controls.append(main)
    R = lambda i, *path: ('sr', 'runs', i) + path
    commit_copies = [i for i, r in enumerate(base['sr']['runs']) if isinstance(r.get('commit_after'), dict)]

    def all_commits(value, key_path, replacement):
        for i, r in enumerate(value['sr']['runs']):
            for slot in ('commit_after', 'commit_before'):
                if isinstance(r.get(slot), dict):
                    c.set_path(value, ('sr', 'runs', i, slot) + tuple(key_path), replacement)
        return value

    for row, path, replacement, label in [
            ('sr_cor_outcome', R(1, 'result'), ['corrupt', 'unreadable_record'], 'wrong-reason'),
            ('sr_cor_outcome', R(1, 'result'), ['corrupt', 'missing_material'], 'fifth-reason'),
            ('sr_cor_events', R(0, 'events_appended'), [base['stored_event']], 'reader-appends'),
            ('sr_cor_events', R(2, 'events_appended'), [base['stored_event']], 'redetection-appends'),
            ('sr_cor_events', R(3, 'events_appended'), [base['stored_event']], 'replay-appends'),
            ('sr_cor_order', R(1, 'trace'), ['reread_point', 'filesafe_attest'] + EVENT_TRACE[2:], 'commit-before-attest'),
            ('sr_cor_order', R(1, 'trace'), EVENT_TRACE[:2] + ['barrier_append', 'commit_pending'] + EVENT_TRACE[4:], 'append-before-commit'),
            ('sr_cor_order', R(1, 'trace'), EVENT_TRACE[:4] + ['publish_unavailable', 'first_receipt'], 'publish-before-receipt'),
            ('sr_cor_terminal', R(5, 'result'), ['admitted', None], 'branch-after-corrupt'),
            ('sr_cor_terminal', R(6, 'result'), ['admitted', None], 'delete-after-corrupt'),
            ('sr_cor_terminal', R(7, 'result'), ['admitted', None], 'expire-after-corrupt'),
            ('sr_cor_outcome', R(2, 'result'), ['existing', 'corrupt_referenced_material'], 'redetection-changes-reason'),
            ('sr_cor_once', R(2, 'commit_after', 'evidence', 'reason_code'), 'corrupt_referenced_material', 'redetection-rewrites-commit'),
            ('sr_cor_once', R(6, 'commit_after', 'after_status'), 'deleted', 'delete-rewrites-commit'),
            ('sr_cor_stored', R(1, 'events_appended', 0, 'correlation_id'), 'correlation-other', 'appended-differs-from-stored'),
            ('sr_cor_status', R(1, 'record_after_hex'), 'f' * 64, 'record-rewritten'),
            ('sr_cor_status', R(0, 'status_projection'), 'corrupt', 'reader-projects-corrupt'),
            ('sr_cor_receipt', R(3, 'result', 'receipt', 'sequence_id'), 99, 'replay-other-receipt'),
            ('sr_cor_conflict', R(4, 'result', 'reason_code'), None, 'conflict-accepted')]:
        negatives.append(c.mutate(main, row, path, replacement, label))
    # Commit-row defects appear in every snapshot of the one stored row.
    for row, key_path, replacement, label in [
            ('sr_cor_identity', ('corruption_id',), 'rpx_' + 'e' * 64, 'second-corruption-id'),
            ('sr_cor_evidence', ('evidence', 'evidence_ref'), '/home/user/restore/record.bin', 'evidence-raw-path'),
            ('sr_cor_evidence', ('filesafe_attestation_ref',), 'reader:unattested', 'evidence-unattested'),
            ('sr_cor_evidence', ('evidence', 'observed_hash'), 'c' * 64, 'evidence-hash-other-point'),
            ('sr_cor_thread', ('source_thread_id',), 'thread-other', 'commit-thread'),
            ('sr_cor_receipt', ('append_receipt_ref',), s.custody_key('other-event'), 'commit-custody-key'),
            ('sr_cor_schema', ('extra',), 'record-body', 'commit-extra'),
            ('sr_cor_schema', ('after_status',), 'deleted', 'commit-after-status'),
            ('sr_cor_time', ('committed_at_utc',), '2026-11-14T12:00:00+00:00', 'commit-time-offset'),
            ('sr_cor_time', ('settled_at_utc',), '2026-11-14t12:00:00z', 'commit-time-lowercase')]:
        value = all_commits(copy.deepcopy(main['value']), key_path, replacement)
        negatives.append(c.negative(main, row, label, value, {'commit_copies': commit_copies, 'path': list(key_path),
                                                              'replacement': repr(replacement)[:160]}))
    value = copy.deepcopy(main['value'])
    value['sr']['runs'][0]['commit_after'] = copy.deepcopy(value['sr']['runs'][1]['commit_after'])
    value['sr']['runs'][0]['status_projection'] = 'corrupt'
    negatives.append(c.negative(main, 'sr_cor_reader', 'reader-commits', value,
                                {'reader': 'writes the corruption commit and projects it'}))
    # Every branch, precedence, stop and terminal-exclusion path.
    for label, change in BRANCHES:
        value = w.build(COR)
        scenario(value, [{'kind': 'detect', 'state': inputs(**change)}])
        control = s.control(COR, 'sr/' + label, value)
        controls.append(control)
        outcome, _m = classify(value['sr']['runs'][0]['state'])
        if outcome in KIND and not value['sr']['runs'][0]['state']['terminal']:
            others = [r for r in KIND if r != outcome]
            negatives.append(c.mutate(control, 'sr_cor_outcome', R(0, 'result'), ['corrupt', others[0]], 'wrong-branch'))
            ev = value['sr']['runs'][0]['events_appended'][0]['payload']
            for key in [k for k in MATERIAL_KEYS if k in ev][:2] or ['observed_hash']:
                replacement = 'e' * 64 if 'hash' in key else ('attachment_refs' if key == 'referenced_material_field' and ev[key] != 'attachment_refs'
                                                              else 'citation_refs' if key == 'referenced_material_field' else 'att-other')
                negatives.append(c.mutate(control, 'sr_cor_payload', R(0, 'events_appended', 0, 'payload', key), replacement, 'payload-' + key))
            negatives.append(c.mutate(control, 'sr_cor_event_schema', R(0, 'events_appended', 0, 'payload', 'extra'), 'raw-bytes', 'payload-extra'))
            negatives.append(c.mutate(control, 'sr_cor_identity', R(0, 'events_appended', 0, 'idempotency_key'), 'key-other', 'event-key'))
            if value['sr']['runs'][0]['state']['record']['decodable']:
                negatives.append(c.mutate(control, 'sr_cor_thread', R(0, 'events_appended', 0, 'thread_id'), None, 'readable-record-thread-null'))
            if outcome == 'corrupt_referenced_material':
                v2 = copy.deepcopy(value)
                run0 = v2['sr']['runs'][0]
                ref = run0['commit_after']['evidence']['referenced_material_ref']
                for m in run0['state']['materials']:
                    if m['ref'] == ref:
                        m['observed_length'] = True
                run0['commit_after']['evidence']['observed_material_length'] = True
                run0['events_appended'][0]['payload']['observed_material_length'] = True
                negatives.append(c.negative(control, 'sr_cor_numbers', 'material-length-boolean', v2,
                                            {'typed_input': 'observed_material_length Boolean in commit and payload copies'}))
            if outcome == 'unreadable_record':
                negatives.append(c.mutate(control, 'sr_cor_thread', R(0, 'events_appended', 0, 'thread_id'), 'thread-source', 'unreadable-thread-claimed'))
        else:
            negatives.append(c.mutate(control, 'sr_cor_outcome', R(0, 'result'), ['corrupt', 'record_hash_mismatch'], 'claims-corrupt'))
            negatives.append(c.mutate(control, 'sr_cor_events', R(0, 'events_appended'), [value['stored_event']], 'appends'))
            if value['sr']['runs'][0]['state']['terminal']:
                committed = commit_for(value['sr']['runs'][0]['state'], value['sr']['point'],
                                       evidence_for(value['sr']['runs'][0]['state'], 'record_hash_mismatch', None))
                v2 = copy.deepcopy(value)
                v2['sr']['runs'][0]['commit_after'] = committed
                v2['sr']['runs'][0]['status_projection'] = 'corrupt'
                negatives.append(c.negative(control, 'sr_cor_terminal', 'commit-despite-terminal', v2,
                                            {'terminal': value['sr']['runs'][0]['state']['terminal']}))
            else:
                negatives.append(c.mutate(control, 'sr_cor_order', R(0, 'trace'), list(EVENT_TRACE), 'continues-after-stop'))
    # MIG-RESTORE-POINT-CORRUPT-PAYLOAD-001 upgrades and their quarantines.
    for label, v1, evidence in UPGRADES:
        value = w.build(COR)
        scenario(value, [{'kind': 'upgrade', 'v1_payload': v1, 'evidence_results': evidence}])
        control = s.control(COR, 'sr/' + label, value)
        controls.append(control)
        if value['sr']['runs'][0]['upgraded'] is not None:
            negatives.append(c.mutate(control, 'sr_cor_upgrade', R(0, 'upgraded', 'evidence_ref'), 'filesafe.evidence:guessed', 'upgrade-guessed-evidence'))
            negatives.append(c.mutate(control, 'sr_cor_upgrade', R(0, 'upgraded', 'occurred_at_utc'), '2026-11-15T00:00:00Z', 'upgrade-rewrites-time'))
            negatives.append(c.mutate(control, 'sr_cor_upgrade_source', R(0, 'v1_after_hex'), 'ff', 'upgrade-mutates-v1'))
            negatives.append(c.mutate(control, 'sr_cor_upgrade_source', R(0, 'events_appended'), [value['stored_event']], 'upgrade-appends'))
        else:
            forged = payload_for(evidence_result()['evidence'], {'restore_point_id': POINT_ID, 'project_id': w.PROJECT})
            negatives.append(c.mutate(control, 'sr_cor_upgrade', R(0, 'upgraded'), forged, 'upgrade-despite-unresolvable'))
            negatives.append(c.mutate(control, 'sr_cor_upgrade', R(0, 'quarantine_reason'), 'quarantine_without_checkpoint_advance', 'wrong-quarantine-reason'))
    return controls, negatives


def corpus_slots(control):
    value = control['value']; runs = runs_of(value) or []
    commit_paths = {}
    for i, r in enumerate(runs):
        for slot in ('commit_after', 'commit_before'):
            commit = r.get(slot)
            if isinstance(commit, dict):
                for key in ('committed_at_utc', 'settled_at_utc'):
                    if commit.get(key) is not None:
                        commit_paths.setdefault(key, []).append(('sr', 'runs', i, slot, key))
                ev = commit.get('evidence') or {}
                for key in ('expected_material_length', 'observed_material_length'):
                    if ev.get(key) is not None:
                        commit_paths.setdefault(key, []).append(('sr', 'runs', i, slot, 'evidence', key))
        for j, event in enumerate(r.get('events_appended', [])):
            for key in ('expected_material_length', 'observed_material_length'):
                if key in event.get('payload', {}):
                    commit_paths.setdefault(key, []).append(('sr', 'runs', i, 'events_appended', j, 'payload', key))
                    ref = event['payload']['referenced_material_ref']
                    for k, m in enumerate(r['state']['materials']):
                        if m['ref'] == ref:
                            commit_paths[key].append(('sr', 'runs', i, 'state', 'materials', k, key.replace('_material', '')))
    for key, paths in commit_paths.items():
        if key.endswith('_at_utc'):
            yield {'paths': paths, 'kind': 'datetime', 'row': 'sr_cor_time', 'profile': w.STORAGE_UTC_Z,
               'type_rows': ['sr_cor_schema', 'sr_cor_time']}
        else:
            # The independent material input keeps its own value; the
            # material stays corrupt through its unequal hash either way.
            # Nullable in corruption_evidence; null only fails the material branch.
            yield {'paths': paths, 'kind': 'integer', 'row': 'sr_cor_numbers', 'bounds': {'minimum': 0, 'maximum': U64},
                   'null_rows': ['sr_cor_event_schema', 'sr_cor_payload', 'sr_cor_schema']}
