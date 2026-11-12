#!/usr/bin/env python3
"""DF fix round 1: an attempted negative for every guard row the gated tool leaves without one,
and pair proofs for the rows that duplicate another guard or a schema keyword.

Usage: python3 scripts/pm-filesafe-unproved-attempts.py [--out DIR] [--only ROW]...

Attempts. Each is built from a named valid seed by the p2a builder
(scripts/pm-filesafe-p2a-cases.py: one fact changes, every copy that is not the
defect moves with it) and run through the complete boundary under the
observation recorder. An attempt confirms its row's report proof when its first
refusing (phase, rows) is the cited earlier refusal. When the target row itself
refuses first and alone, the row is reachable and needs a witness: the script
reports REACHABLE and exits 1.

Pair proofs (FIX-ROUND check 11, 21:48Z and 03:56Z clarifications). A duplicate
set is one invariant (same field, same predicate) enforced at two or more
sites. Each site is cut per predicate: a guard row is swapped to always-pass in
the recorder's row table (as the suite builder's complete-boundary flip does);
a schema keyword is removed from exactly the schema node that refused, in the
cached registry document and in every fresh load of that document. The proof
holds when the negative is refused with every site present, stays refused by
the remaining site(s) when any one site is cut, and is accepted when every site
is cut. Nothing here edits a checker, a table or a schema file.
"""
import argparse
import copy
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_filesafe_event_authority as A  # noqa: E402
import pm_filesafe_event_contracts as C  # noqa: E402
import pm_filesafe_p2a_cases as P  # noqa: E402
import pm_filesafe_p2a_specs as S  # noqa: E402
import pm_filesafe_schema_graph as SG  # noqa: E402
import pm_filesafe_tables as tables  # noqa: E402

_spec = importlib.util.spec_from_file_location('pm_filesafe_p2a_builder', ROOT / 'scripts/pm-filesafe-p2a-cases.py')
B = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(B)

CD, GR, PD = 'filesafe.command_denied', 'filesafe.destructive_override_granted', 'filesafe.policy_degraded'
CR, RS = 'safe_point.created', 'safe_point.restored'
CLEAN, FAILED, SKIPPED, REFUSED, RECOVERY = ('original_application_1', 'original_application_6', 'original_application_7',
                                             'original_application_8', 'original_application_9')


# ----------------------------------------------------------------- case builders
def mat(family, seed, change, keep=(), kind='materialization'):
    case = B.materialize_case(family, B.seeds(family)[seed], 'attempt', change, keep, kind=kind)
    case['seed'] = seed
    return case


def proto(family, seed, actions, change=None, keep=()):
    edits = mat(family, seed, change, keep)['edits'] if change else []
    steps = [{'action': a} for a in actions]
    return dict(kind='protocol', family=family, positive_index=B.seeds(family)[seed], seed=seed, edits=edits,
                steps=steps, target_step=len(steps) - 1)


def tx(c):
    return S.records(c)['restore_transaction']


def eq(c):
    return S.records(c)['equality_result']


def setter(get, key, value):
    def change(c, b):
        get(c)[key] = value
    return change


def sync_post(c):
    from pm_event_numbers import qualified_jcs
    import hashlib
    post = S.records(c)['post_restore_manifest']
    posth = hashlib.sha256(qualified_jcs(post)).hexdigest()
    tx(c)['post_restore_state_sha256'] = eq(c)['post_restore_manifest_sha256'] = S.payload(c)['post_restore_state_sha256'] = posth
    eq(c)['scm_equal_target'] = post['scm'] == S.records(c)['snapshot_manifest']['scm']
    eq(c)['scm_equal_pre_restore'] = post['scm'] == S.records(c)['pre_restore_manifest']['scm']


def post_as(which):
    def change(c, b):
        S.records(c)['post_restore_manifest'] = copy.deepcopy(S.records(c)[which])
        sync_post(c)
    return change


def post_other(c, b):
    post = copy.deepcopy(S.records(c)['pre_restore_manifest'])
    post['entries'][0]['ignored'] = not post['entries'][0]['ignored']
    post['entries'][0]['authorized_write_set'] = True
    S.records(c)['post_restore_manifest'] = post
    sync_post(c)


def scope_field(where, key, value):
    def change(c, b):
        node = S.payload(c)['authorized_scope'] if where == 'granted' else S.req(c)['requested_scope']
        node[key] = value
    return change


def other_scope(where):
    def change(c, b):
        app = copy.deepcopy(C.contract_positive(GR, 1)['authorized_scope'])
        if where == 'granted':
            S.payload(c)['authorized_scope'] = app
        else:
            S.req(c)['requested_scope'] = app
    return change


def drop_worktree(*keys):
    def change(c, b):
        for key in keys:
            S.payload(c).pop(key)
            c['source']['native_project_record'].pop(key, None)
    return change


def project_body(value):
    def change(c, b):
        role = next(m for m in c['source']['body_members'] if m['role'] == A.context(CR)[0]['original_project_body_role'])
        if value is None:
            b['bodies'].pop(role['ref'])
        else:
            b['bodies'][role['ref']] = value
    return change


def descriptor(transform):
    def change(c, b):
        c['event']['payload_ref'] = transform(c['event']['payload_ref'])
    return change


def scm_absent_keep_id(c, b):
    for key in ('worktree_path', 'branch_name', 'HEAD_sha'):
        S.payload(c).pop(key, None)
    S.records(c)['snapshot_manifest']['scm'] = None
    S.records(c)['safe_point_record']['scm'] = None
    S.propagate_target_manifest(B, CR, c)


def body_with_extra(role):
    def change(c, b):
        import hashlib
        member = next(m for m in c['source']['body_members'] if m['role'] == role)
        value = copy.deepcopy(S.records(c)[role])
        value['extra_field'] = 1
        raw = B.encode_body(value, A.context(CR)[0]['application_body_codecs'][role])
        b['bodies'][member['ref']] = raw.hex()
        member['sha256'] = hashlib.sha256(raw).hexdigest()
    return change


def operation_kind(kind, **fields):
    def change(c, b):
        tx(c)['operations'][0]['operation_kind'] = kind
        tx(c)['operations'][0].update(fields)
    return change


# ----------------------------------------------------------------- attempts
# (target row, attempt label, case factory, expected first refusal (phase, rows), report proof)
def attempts():
    out = []

    def add(row, label, factory, first, proof):
        out.append(dict(row=row, label=label, factory=factory, first=first, proof=proof))

    app_scope = lambda: other_scope('granted')
    add('SU01_kind', 'granted scope kind changed (authorized_scope from the application positive)',
        lambda: mat(GR, 'original_project_0', app_scope()), ('override_scope_kind', ['OS01_kind']),
        'scripts/pm_filesafe_event_contracts.py:128 (semantic, on authorized_scope) and scripts/pm_filesafe_event_authority.py:610 '
        '(override_scope_semantic on the requested scope) tie both scope kinds to the payload scope kind before '
        'override_subset (scripts/pm_filesafe_event_contracts.py:65)')
    add('SU01_kind', 'requested scope kind changed', lambda: mat(GR, 'original_project_0', other_scope('requested')),
        ('override_scope_kind', ['OS01_kind']), 'as above')
    add('SU02_project', 'granted project_id changed', lambda: mat(GR, 'original_project_0', scope_field('granted', 'project_id', 'p-other')),
        ('override_scope_root', ['OS02_project']), 'OS02 ties both project_ids to the payload scope project_id first')
    add('SU02_project', 'requested project_id changed', lambda: mat(GR, 'original_project_0', scope_field('requested', 'project_id', 'p-other')),
        ('override_scope_root', ['OS02_project']), 'as above')
    for row, key, os_row in (('SU06_server', 'server_id', 'OS05_server'), ('SU07_computer', 'computer_id', 'OS06_computer'),
                             ('SU08_thread', 'thread_id', 'OS07_thread'), ('SU09_run', 'run_id', 'OS08_run'),
                             ('SU10_host', 'host_id', 'OS09_host'), ('SU11_environment', 'environment_id', 'OS10_environment')):
        for where in ('granted', 'requested'):
            add(row, f'{where} {key} changed', lambda where=where, key=key: mat(GR, 'original_application_1', scope_field(where, key, key + '-other')),
                ('override_scope_application', [os_row]), f'{os_row} ties the granted and the requested {key} to the same execution value first')
    add('ME01_scope_kind', 'event scope_kind changed alone', lambda: mat(CD, 'original_project_0', setter(lambda c: c['event'], 'scope_kind', 'application')),
        ('mat_schema', ['MS01_schema']), 'Plans/event_record.schema.json couples scope_kind with project_id nullness')
    add('ME01_scope_kind', 'event scope_kind and its schema-coupled project_id changed',
        lambda: mat(CD, 'original_project_0', lambda c, b: c['event'].update(scope_kind='application', project_id=None)),
        ('mat_envelope_kind', ['ME01_scope_kind']),
        'masked: ME02_project (mat_envelope_subject) refuses the same coupled project_id; ME01 never refuses alone')
    add('MX02_run', 'execution-context run_id empty in every copy', lambda: mat(GR, 'original_project_0', lambda c, b: S.set_ctx(c, 'run_id', '')),
        ('mat_schema', ['MS01_schema']), 'schema minLength on every run_id copy')
    add('MX02_run', 'execution-context run_id null in request and result contexts only',
        lambda: mat(GR, 'original_project_0', lambda c, b: (S.req(c)['execution_context'].__setitem__('run_id', None),
                                                           S.payload(c)['execution_context'].__setitem__('run_id', None))),
        ('payload_scope', ['PS03_run_copy']), 'PS03 joins the payload run_id copy to the context run_id first')
    add('MK04_worktree_path', 'payload worktree_path absent (the native record requires it)',
        lambda: mat(CR, 'original_project_0', lambda c, b: S.payload(c).pop('worktree_path')),
        ('payload_worktree', ['PW01_path']), 'PW01 (scripts/pm_filesafe_event_contracts.py:141) refuses an absent path first; '
        'the native project record schema requires worktree_path, so MJ04 also refuses the join')
    add('MK05_branch', 'branch_name absent from payload and native record',
        lambda: mat(CR, 'original_project_0', drop_worktree('branch_name')), ('payload_worktree', ['PW02_branch']),
        'duplicate of PW02 (pair proof below)')
    add('MK06_head', 'HEAD_sha absent from payload and native record',
        lambda: mat(CR, 'original_project_0', drop_worktree('HEAD_sha')), ('payload_worktree', ['PW03_head']),
        'duplicate of PW03 (pair proof below)')
    add('MD01_enforcement', 'authoritative_enforcement_intact false', lambda: mat(PD, 'original_project_0', setter(S.payload, 'authoritative_enforcement_intact', False)),
        ('mat_schema', ['MS01_schema']), 'schema const true on the result (pair proof below)')
    add('MJ02_body_present', 'native Project body missing from the bank', lambda: mat(CR, 'original_project_0', project_body(None), keep=('native_body',)),
        ('mat_body_member', ['MB02_present']), 'duplicate of MB02 for the same member (pair proof below)')
    add('MJ02_body_present', 'native Project body stored as an integer', lambda: mat(CR, 'original_project_0', project_body(5), keep=('native_body',)),
        ('mat_body_member', ['MB02_present']), 'as above')
    add('MO03_commitment', 'accepted_source_sha256 wrong in the candidate and the selected bank copy',
        lambda: mat(CD, 'original_project_0', setter(lambda c: c['source'], 'accepted_source_sha256', '0' * 64), keep=('source_commitment',)),
        ('selected_source_commitment', ['SS03_commitment']), 'duplicate of SS03 through the exact join SS04 (pair proof below)')
    add('MO03_commitment', 'accepted_source_sha256 wrong in the candidate only',
        lambda: mat(CD, 'original_project_0', setter(lambda c: c['source'], 'accepted_source_sha256', '0' * 64), keep=('source_commitment', 'bank_source')),
        ('selected_source_join', ['SS04_join']), 'SS04 refuses a candidate that differs from the selected source')
    add('MG01_issued_before_expiry', 'issued_at equal to expires_at', lambda: mat(GR, 'original_project_0', lambda c, b: S.payload(c).__setitem__('issued_at', S.payload(c)['expires_at'])),
        ('payload_grant_window', ['PG01_window']), 'duplicate of PG01 (pair proof below)')
    add('MT11_durability_state', 'first receipt durability_state pending', lambda: mat(CD, 'original_project_0', setter(lambda c: c['custody']['first_append_receipt'], 'durability_state', 'pending')),
        ('mat_schema', ['MS01_schema']), 'duplicate of the receipt schema const (pair proof below)')
    add('IR08_durability_state', 'issued first receipt durability_state pending',
        lambda: mat(CD, 'original_project_0', setter(lambda c: c['custody']['first_append_receipt'], 'durability_state', 'pending'), kind='issued'),
        ('issued_schema', ['IS05_schema']), 'duplicate of the receipt schema const (pair proof below)')
    add('AB01_role', 'snapshot_blobs member dropped', lambda: mat(CR, CLEAN, lambda c, b: c['source'].__setitem__(
        'body_members', [m for m in c['source']['body_members'] if m['role'] != 'snapshot_blobs'])),
        ('mat_schema', ['MS01_schema']), 'body_members minItems, then MB01 (role set equals the required roles) refuse first')
    add('AB03_schema', 'snapshot_blobs body schema-invalid, record unchanged',
        lambda: mat(CR, CLEAN, body_with_extra('snapshot_blobs'), keep=('application_bodies',)),
        ('app_body_schema', ['AB03_schema']), 'masked: AB04 refuses the body that differs from its record; a coherent record '
        'and body are refused first by mat_schema on the same schema fragment')
    add('AB03_schema', 'snapshot_blobs record and body both schema-invalid',
        lambda: mat(CR, CLEAN, lambda c, b: S.records(c)['snapshot_blobs'].__setitem__('extra_field', 1)),
        ('mat_schema', ['MS01_schema']), 'as above')
    add('AF08_entry_address', 'entry payload_id changed', lambda: mat(CR, CLEAN, lambda c, b: (
        next(e for e in S.records(c)['snapshot_manifest']['entries'] if e['present'] and e['kind'] == 'file').__setitem__('payload_id', 'blake3:' + '0' * 64),
        S.propagate_target_manifest(B, CR, c))),
        ('app_entry_blob_match', ['AF01_one_blob']), 'the blob is selected by payload_id equality (scripts/pm_filesafe_event_authority.py:370), so AF08 sees only equal ids')
    for row, field in (('SP03_node_id', 'node_id'), ('SP04_attempt_id', 'attempt_id')):
        add(row, f'safe-point record {field} set', lambda field=field: mat(CR, CLEAN, setter(lambda c: S.records(c)['safe_point_record'], field, field + '-x')),
            ('mat_schema', ['MS01_schema']), 'schema type null on the record field (pair proof below)')
    add('CS02_no_worktree_id', 'SCM-absent capture that keeps worktree_id', lambda: mat(CR, CLEAN, scm_absent_keep_id),
        ('payload_worktree', ['PW01_path', 'PW02_branch', 'PW03_head']), 'PW01-PW03 refuse a worktree_id without path, branch and HEAD first')
    add('TR04_node_id', 'restore transaction node_id set', lambda: mat(RS, CLEAN, setter(tx, 'node_id', 'node-x')),
        ('mat_schema', ['MS01_schema']), 'schema type null on restore_transaction.node_id')
    add('TR04_node_id', 'result node_id set', lambda: mat(RS, CLEAN, setter(S.payload, 'node_id', 'node-x')),
        ('mat_request_subject', ['MQ01_subject']), 'MQ01, ME05 and MA01 refuse an application result node_id first')
    add('TR05_attempt_id', 'restore transaction attempt_id set', lambda: mat(RS, CLEAN, setter(tx, 'attempt_id', 'attempt-x')),
        ('mat_schema', ['MS01_schema']), 'schema type null on restore_transaction.attempt_id')
    add('OK02_before_presence', 'create operation relabelled replace', lambda: mat(RS, 'fix2.valid_create_missing', operation_kind('replace')),
        ('mat_schema', ['MS01_schema']), 'the operation schema ties operation_kind to expected_before_type nullness')
    add('OK02_before_presence', 'create operation relabelled replace with a before type and digest',
        lambda: mat(RS, 'fix2.valid_create_missing', operation_kind('replace', expected_before_type='file', expected_before_sha256='b' * 64)),
        ('app_operation_subject', ['OP03_before_sha256', 'OP05_before_type']), 'OP03/OP05 tie the before fields to the absent pre-restore entry first')
    add('OK03_target_presence', 'delete operation relabelled replace', lambda: mat(RS, 'fix2.valid_delete_missing', operation_kind('replace')),
        ('mat_schema', ['MS01_schema']), 'the operation schema ties operation_kind to target_type nullness')
    add('JC03_lease', 'mutation_lease_ref empty', lambda: mat(RS, CLEAN, setter(tx, 'mutation_lease_ref', '')),
        ('mat_schema', ['MS01_schema']), 'schema minLength (pair proof below)')
    add('OQ02_post_is_target', 'restored_clean post manifest equal to the pre manifest', lambda: mat(RS, CLEAN, post_as('pre_restore_manifest')),
        ('payload_restore', ['PR01_clean_target']), 'PR01 joins the result post digest to the target first; TM and the result joins carry it')
    add('OQ03_scm_target', 'restored_clean scm_equal_target false', lambda: mat(RS, CLEAN, setter(eq, 'scm_equal_target', False)),
        ('app_equality_scm', ['EQ06_scm_target']), 'EQ06 ties the flag to the recomputed SCM equality first')
    add('OQ06_post_is_pre', 'restore_failed post manifest equal to the target', lambda: mat(RS, FAILED, post_as('snapshot_manifest')),
        ('payload_restore', ['PR02_unchanged']), 'PR02 first')
    add('OQ07_scm_pre', 'restore_failed scm_equal_pre_restore false', lambda: mat(RS, FAILED, setter(eq, 'scm_equal_pre_restore', False)),
        ('app_equality_scm', ['EQ07_scm_pre']), 'EQ07 first')
    add('OQ09_target_is_pre', 'restore_skipped target digest differs from pre',
        lambda: mat(RS, SKIPPED, lambda c, b: (tx(c).update(target_state_sha256='a' * 64, target_manifest_sha256='a' * 64),
                                              S.payload(c).__setitem__('target_state_sha256', 'a' * 64))),
        ('payload_restore', ['PR03_skipped_target']), 'PR03 first')
    add('OQ10_pre_is_post', 'restore_skipped post manifest differs from pre', lambda: mat(RS, SKIPPED, post_other),
        ('payload_restore', ['PR04_skipped_after']), 'PR04 first')
    add('OQ13_post_is_pre', 'restore_refused post manifest equal to the target', lambda: mat(RS, REFUSED, post_as('snapshot_manifest')),
        ('payload_restore', ['PR02_unchanged']), 'PR02 first')
    add('OQ17_holds', 'restore_recovery_required hold_refs empty in every copy',
        lambda: mat(RS, RECOVERY, lambda c, b: (tx(c).__setitem__('hold_refs', []), eq(c).__setitem__('hold_refs', []),
                                               S.records(c)['safe_point_record'].__setitem__('hold_refs', []))),
        ('mat_schema', ['MS01_schema']), 'schema minItems (pair proof below)')
    import json as _json
    ref = 'fix3.sp337_reference.project'
    for label, transform in (
            ('byte_size NaN', lambda r: r.replace('"byte_size":%d' % _json.loads(r)['byte_size'], '"byte_size":NaN')),
            ('byte_size Infinity', lambda r: r.replace('"byte_size":%d' % _json.loads(r)['byte_size'], '"byte_size":Infinity')),
            ('media_type lone surrogate', lambda r: r.replace('"application/json"', '"\\ud800"')),
            ('extra lone-surrogate key', lambda r: r[:-1] + ',"\\ud800":1}'),
            ('payload_id lone surrogate', lambda r: r.replace(_json.loads(r)['payload_id'], _json.loads(r)['payload_id'][:-1] + '\\ud800'))):
        add('DJ03_other', 'descriptor ' + label, lambda transform=transform: mat(CD, ref, descriptor(transform), keep=('payload',)),
            ('payload_ref_descriptor', None), 'the descriptor schema (EP04/EP03a) refuses every non-finite, key and string-domain form first')
    add('AJ01_binary64', 'manifest record entry length 2**53+1, body unchanged',
        lambda: mat(CR, CLEAN, lambda c, b: S.records(c)['snapshot_manifest']['entries'][0].__setitem__('length', 2 ** 53 + 1), keep=('application_bodies',)),
        ('app_body_check', ['AB04_value']), 'masked: a record no RFC 8785 body can encode always differs from its body (AB04); '
        'the coherent rebuild cannot encode it at all')
    add('AJ02_decimal', 'manifest record entry length 1.5, body unchanged',
        lambda: mat(CR, CLEAN, lambda c, b: S.records(c)['snapshot_manifest']['entries'][0].__setitem__('length', 1.5), keep=('application_bodies',)),
        ('mat_schema', ['MS01_schema']), 'the manifest schema admits integers only; a body cannot carry another number')
    surrogate = lambda c, b: S.records(c)['snapshot_manifest']['entries'][0]['identity'].__setitem__('permission_snapshot_ref', '\ud800')
    add('AJ03_other', 'manifest record string with a lone surrogate, coherent rebuild', lambda: mat(CR, CLEAN, surrogate),
        ('builder', None), 'no body and no source commitment can encode a lone surrogate')
    add('AJ03_other', 'manifest record string with a lone surrogate, bodies and commitment unchanged',
        lambda: mat(CR, CLEAN, surrogate, keep=('application_bodies', 'source_commitment', 'bank_source')),
        ('selected_source_join', ['SS04_join']), 'the caller source differs from the selected source first; AB04 and AJ03 follow')
    add('AJ01_binary64', 'manifest record entry length 2**53+1, coherent rebuild',
        lambda: mat(CR, CLEAN, lambda c, b: S.records(c)['snapshot_manifest']['entries'][0].__setitem__('length', 2 ** 53 + 1)),
        ('builder', None), 'qualified RFC 8785 cannot encode the manifest body (jcs_binary64)')
    for row in ('CI02_retry_stable', 'CI03_family_distinct', 'CI04_operation_distinct'):
        add(row, 'identity self-check on every contract positive of every family', None, ('none', None),
            'declared UNPROVABLE (scripts/pm_filesafe_guard_suites.py:51): a pure function recomputed on the same input')
    add('BD02_commitment', 'read_body after the source commitment is wrong in both copies',
        lambda: proto(CD, 'original_project_0', ('read_body',), setter(lambda c: c['source'], 'accepted_source_sha256', '0' * 64), keep=('source_commitment',)),
        ('selected_source_commitment', ['SS03_commitment']), 'duplicate of SS03 through the exact join SS04 (pair proof below)')
    add('RB02_pending', 'rebuild after owner_commit, writer and reader withdrawal',
        lambda: proto(CD, 'original_project_0', ('owner_commit', 'withdraw_writer', 'withdraw_reader', 'rebuild')),
        ('proto_rebuild_gate', ['RB01_reader_fence']), 'WR02 refuses the reader withdrawal while pending, so rebuild meets RB01 first (pair proof below)')
    add('RB02_pending', 'owner_commit again after a terminal original and both withdrawals',
        lambda: proto(CD, 'original_project_0', ('owner_commit', 'prepare', 'append', 'receipt', 'terminal', 'withdraw_writer',
                                                 'withdraw_reader', 'owner_commit')),
        ('proto_commit_fence', ['PC01_writer']), 'PC01 refuses a new owner commit once the writer is fenced, so pending stays false')
    return out


# ----------------------------------------------------------------- running
def recorded(case):
    previous = tables.RECORDER
    tables.RECORDER = records = []
    try:
        try:
            outcome = P.run(case)
        except Exception as error:  # an untracked failure is reported, never counted as a refusal
            outcome = 'UNTRACKED:' + type(error).__name__ + ':' + str(error)[:160]
    finally:
        tables.RECORDER = previous
    if case['kind'] == 'protocol':
        steps, current = [], []
        for record in records:
            if record is tables.STEP:
                current = []
                steps.append(current)
            else:
                current.append(record)
        records = steps[case['target_step']] if len(steps) > case['target_step'] else []
    refused = [(r[0], [row for row, _ in r[2]]) for r in records if r is not tables.STEP and r[2]]
    return outcome, refused


def selfcheck_attempt():
    """CI02-CI04: run the identity self-check observation on every contract positive of every family."""
    observations = refusals = 0
    for row in json.loads((ROOT / 'Plans/filesafe_event_contract_fixtures.json').read_text())['families']:
        family = row['event_type']
        for payload in row['positive_payloads']:
            other = copy.deepcopy(payload)
            other['operation_id'] += '2'
            found = tables.refusals('contract_identity_selfcheck', {
                'first': list(C.identity(family, payload)), 'retry': list(C.identity(family, copy.deepcopy(payload))),
                'event_id': C.identity(family, payload)[1], 'other_family_event_id': C.identity(family + '.other', payload)[1],
                'other_operation': list(C.identity(family, other))})
            observations += 1
            refusals += bool(found)
    return observations, refusals


def run_attempt(item):
    if item['row'] in ('CI02_retry_stable', 'CI03_family_distinct', 'CI04_operation_distinct'):
        observations, refusals = selfcheck_attempt()
        return dict(row=item['row'], attempt=item['label'], kind='selfcheck', outcome=f'{observations} observations, {refusals} refused',
                    first_refusal=None, all_refusals=[], expected_first=list(item['first']), proof=item['proof'],
                    status='confirmed' if observations and not refusals else 'REACHABLE')
    try:
        case = item['factory']()
    except Exception as error:  # the coherent builder itself cannot encode the defect
        status = 'confirmed' if item['first'][0] == 'builder' else 'MISMATCH'
        return dict(row=item['row'], attempt=item['label'], kind='builder', outcome='BUILD_REFUSED:' + type(error).__name__ + ':' + str(error)[:120],
                    first_refusal=None, all_refusals=[], expected_first=list(item['first']), proof=item['proof'], status=status)
    outcome, refused = recorded(case)
    first = refused[0] if refused else None
    reachable = first is not None and first[1] == [item['row']]
    phase, rows = item['first']
    confirmed = first is not None and first[0] == phase and (rows is None or first[1] == rows)
    if item['first'][1] == [item['row']]:
        # A masked attempt: the target refuses first in its own table, and a second, unrelated row refuses too.
        reachable = len(refused) < 2
        confirmed = confirmed and len(refused) >= 2
    return dict(row=item['row'], attempt=item['label'], kind=case['kind'], family=case.get('family'), seed=case.get('seed'),
                outcome=outcome if isinstance(outcome, (list, str)) else str(outcome), first_refusal=first,
                all_refusals=refused[:6], expected_first=list(item['first']), proof=item['proof'],
                status='REACHABLE' if reachable else ('confirmed' if confirmed else 'MISMATCH'))


class Cuts:
    """Per-predicate cuts of guard rows and schema keywords, restored on exit."""

    def __init__(self, family, case, cuts):
        self.family, self.case, self.cuts = family, case, cuts
        self.rows, self.nodes, self.loads = {}, [], []

    def __enter__(self):
        for cut in self.cuts:
            if cut[0] == 'row':
                _, phase, row = cut
                entries = tables.rows(phase)
                assert row in [n for n, _, _ in entries], (phase, row)
                self.rows.setdefault(phase, entries)
                current = tables._ROWS[phase]
                tables._ROWS[phase] = [(n, (lambda value, context: None) if n == row else p, c) for n, p, c in current]
            else:
                _, document, pointer, keyword = cut
                docs = SG.context(self.family)[1]
                node = resolve(docs[document], pointer)
                assert keyword in node, (document, pointer, keyword)
                self.nodes.append((node, keyword, node.pop(keyword)))
                self.loads.append((document, pointer, keyword))
        if self.loads:
            self.original_load = A.load
            loads = list(self.loads)

            def load(path, _original=self.original_load):
                value = _original(path)
                for document, pointer, keyword in loads:
                    if path == document:
                        resolve(value, pointer).pop(keyword, None)
                return value
            A.load = load
        return self

    def __exit__(self, *exc):
        for phase, entries in self.rows.items():
            tables._ROWS[phase] = entries
        for node, keyword, value in reversed(self.nodes):
            node[keyword] = value
        if self.loads:
            A.load = self.original_load
        A.context.cache_clear()


def resolve(document, pointer):
    node = document
    for part in pointer.lstrip('#/').split('/'):
        if part:
            part = part.replace('~1', '/').replace('~0', '~')
            node = node[int(part)] if isinstance(node, list) else node[part]
    return node


def accepted(case, outcome):
    if case['kind'] == 'protocol':
        return isinstance(outcome, list) and outcome and outcome[-1] == case['success']
    return outcome == []


def schema_site(family, case, instance_path, keyword, root='materialization'):
    """The (document, pointer) of the schema node whose keyword refuses instance_path, found by identity."""
    base = P.seed(family, case['positive_index'])
    candidate = copy.deepcopy(base['candidate'])
    P.apply_edits(candidate, [e for e in case['edits'] if e['target'] == 'candidate'])
    validator = A.context(family)[1](root)
    found = []

    def walk(error):
        if error.context:
            for item in error.context:
                walk(item)
        if error.validator == keyword and '/'.join(map(str, error.absolute_path)) == instance_path:
            found.append(error.schema)
    for error in validator.iter_errors(candidate):
        walk(error)
    docs = SG.context(family)[1]
    sites = []
    for target in found:
        for document, value in docs.items():
            pointer = locate(value, target)
            if pointer is not None and (document, pointer) not in sites:
                sites.append((document, pointer))
    return sites


def locate(node, target, pointer='#'):
    if node is target:
        return pointer
    if isinstance(node, dict):
        items = node.items()
    elif isinstance(node, list):
        items = enumerate(node)
    else:
        return None
    for key, value in items:
        found = locate(value, target, f"{pointer}/{str(key).replace('~', '~0').replace('/', '~1')}")
        if found is not None:
            return found
    return None


def pairs():
    """(name, family, case factory, sites, success) — sites are row cuts or schema keyword specs."""
    out = []
    out.append(('MG01_issued_before_expiry', GR, lambda: mat(GR, 'original_project_0', lambda c, b: S.payload(c).__setitem__('issued_at', S.payload(c)['expires_at'])),
                [('row', 'payload_grant_window', 'PG01_window'), ('row', 'mat_grant_order', 'MG01_issued_before_expiry')], None))
    commitment = setter(lambda c: c['source'], 'accepted_source_sha256', '0' * 64)
    out.append(('MO03_commitment', CD, lambda: mat(CD, 'original_project_0', commitment, keep=('source_commitment',)),
                [('row', 'selected_source_commitment', 'SS03_commitment'), ('row', 'mat_source_commitment', 'MO03_commitment')], None))
    out.append(('BD02_commitment', CD, lambda: proto(CD, 'original_project_0', ('read_body',), commitment, keep=('source_commitment',)),
                [('row', 'selected_source_commitment', 'SS03_commitment'), ('row', 'proto_body_commitment', 'BD02_commitment')],
                'original_history_no_effect'))
    pending = setter(lambda c: c['custody']['first_append_receipt'], 'durability_state', 'pending')
    receipt_const = ('schema', 'custody/first_append_receipt/durability_state', 'const')
    out.append(('MT11_durability_state', CD, lambda: mat(CD, 'original_project_0', pending),
                [receipt_const, ('row', 'mat_receipt_state', 'MT11_durability_state')], None))
    out.append(('IR08_durability_state', CD, lambda: mat(CD, 'original_project_0', pending, kind='issued'),
                [receipt_const, ('row', 'issued_receipt_state', 'IR08_durability_state')], None))
    out.append(('RB02_pending', CD, lambda: proto(CD, 'original_project_0', ('owner_commit', 'withdraw_writer', 'withdraw_reader', 'rebuild')),
                [('row', 'proto_withdraw_reader', 'WR02_pending'), ('row', 'proto_rebuild_pending', 'RB02_pending')],
                'retained_survivors_verified'))
    out.append(('MJ02_body_present', CR, lambda: mat(CR, 'original_project_0', project_body(None), keep=('native_body',)),
                [('row', 'mat_body_member', 'MB02_present'), ('row', 'mat_project_body_present', 'MJ02_body_present')], None))
    out.append(('MK05_branch', CR, lambda: mat(CR, 'original_project_0', drop_worktree('branch_name')),
                [('row', 'payload_worktree', 'PW02_branch'), ('row', 'mat_capture_worktree_rest', 'MK05_branch')], None))
    out.append(('MK06_head', CR, lambda: mat(CR, 'original_project_0', drop_worktree('HEAD_sha')),
                [('row', 'payload_worktree', 'PW03_head'), ('row', 'mat_capture_worktree_rest', 'MK06_head')], None))
    out.append(('JC03_lease', RS, lambda: mat(RS, CLEAN, setter(tx, 'mutation_lease_ref', '')),
                [('schema', 'source/application_records/restore_transaction/mutation_lease_ref', 'minLength'),
                 ('row', 'app_journal_lease', 'JC03_lease')], None))
    out.append(('OQ17_holds', RS, lambda: mat(RS, RECOVERY, lambda c, b: (tx(c).__setitem__('hold_refs', []), eq(c).__setitem__('hold_refs', []),
                                                                       S.records(c)['safe_point_record'].__setitem__('hold_refs', []))),
                [('schema', 'source/application_records/safe_point_record/hold_refs', 'minItems'),
                 ('schema', 'source/application_records/restore_transaction/hold_refs', 'minItems'),
                 ('row', 'app_outcome_recovery_holds', 'OQ17_holds')], None))
    for row, field in (('SP03_node_id', 'node_id'), ('SP04_attempt_id', 'attempt_id')):
        out.append((row, CR, lambda field=field: mat(CR, CLEAN, setter(lambda c: S.records(c)['safe_point_record'], field, field + '-x')),
                    [('schema', f'source/application_records/safe_point_record/{field}', 'type'), ('row', 'app_safe_point_ids', row)], None))
    out.append(('MD01_enforcement', PD, lambda: mat(PD, 'original_project_0', setter(S.payload, 'authoritative_enforcement_intact', False)),
                # One const node: the source result, the inline event payload and the Result root all $ref it.
                [('schema', 'source/original_result/authoritative_enforcement_intact', 'const'),
                 ('row', 'mat_policy_degraded', 'MD01_enforcement')], None))
    return out


def concrete_sites(family, case, sites):
    """Resolve schema keyword specs to (document, pointer, keyword) cuts on the refusing nodes."""
    out = []
    for site in sites:
        if site[0] == 'row':
            out.append([site])
            continue
        nodes = schema_site(family, case, site[1], site[2])
        out.append([('schema', document, pointer, site[2]) for document, pointer in nodes])
    # One schema node is one site: a node that two specs reach (a shared $ref) is cut once.
    seen, merged = set(), []
    for group in out:
        fresh = [c for c in group if c[0] == 'row' or (c[1], c[2], c[3]) not in seen]
        seen.update((c[1], c[2], c[3]) for c in group if c[0] == 'schema')
        if fresh or not group:
            merged.append(fresh)
    return merged


def run_pair(name, family, factory, sites, success):
    case = factory()
    if success is not None:
        case['success'] = success
    groups = concrete_sites(family, case, sites)
    labels = [' + '.join(c[1] + ':' + c[2] if c[0] == 'row' else f'{c[1]}#{c[2].lstrip("#")}:{c[3]}' for c in g) or '(no refusing schema node)'
              for g in groups]
    result = dict(row=name, family=family, kind=case['kind'], seed=case.get('seed'), sites=labels, vectors=[])
    ok = all(groups)

    def vector(label, cut_groups):
        flat = [c for g in cut_groups for c in g]
        with Cuts(family, case, flat):
            outcome, refused = recorded(case)
        return dict(cut=label, outcome=outcome if isinstance(outcome, (list, str)) else str(outcome),
                    accepted=bool(accepted(case, outcome)), first_refusal=refused[0] if refused else None)

    base = vector('none', [])
    ok = ok and not base['accepted']
    result['vectors'].append(base)
    for index, label in enumerate(labels):
        alone = vector('only ' + label, [groups[index]])
        ok = ok and not alone['accepted']
        result['vectors'].append(alone)
    joint = vector('all sites', groups)
    ok = ok and joint['accepted']
    result['vectors'].append(joint)
    result['status'] = 'proved' if ok else 'NOT_PROVED'
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--out', type=Path)
    parser.add_argument('--only', action='append')
    args = parser.parse_args()
    fix_spec = importlib.util.spec_from_file_location('df_fix_cases', ROOT / 'scripts/pm-filesafe-fix1-cases.py')
    fix = importlib.util.module_from_spec(fix_spec)
    fix_spec.loader.exec_module(fix)
    report = dict(schema_id='pm.filesafe.unproved_attempts.v1', attempts=[], pairs=[],
                  entailments=[fix.os01_pair_proof()])
    for item in attempts():
        if args.only and item['row'] not in args.only:
            continue
        report['attempts'].append(run_attempt(item))
    for name, family, factory, sites, success in pairs():
        if args.only and name not in args.only:
            continue
        report['pairs'].append(run_pair(name, family, factory, sites, success))
    bad = [a for a in report['attempts'] if a['status'] != 'confirmed'] + [p for p in report['pairs'] if p['status'] != 'proved']
    report['summary'] = dict(attempts=len(report['attempts']), confirmed=sum(a['status'] == 'confirmed' for a in report['attempts']),
                             reachable=sorted({a['row'] for a in report['attempts'] if a['status'] == 'REACHABLE'}),
                             mismatched=sorted({a['row'] for a in report['attempts'] if a['status'] == 'MISMATCH'}),
                             rows_attempted=len({a['row'] for a in report['attempts']}),
                             pairs=len(report['pairs']), pairs_proved=sum(p['status'] == 'proved' for p in report['pairs']),
                             pairs_not_proved=[p['row'] for p in report['pairs'] if p['status'] != 'proved'])
    text = json.dumps(report, indent=1, ensure_ascii=True, default=str) + '\n'
    if args.out:
        args.out.mkdir(parents=True, exist_ok=True)
        (args.out / 'unproved-attempts.json').write_text(text)
    print(json.dumps(report['summary'], indent=1))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
