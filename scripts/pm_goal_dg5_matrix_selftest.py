#!/usr/bin/env python3
"""Focused DG5 matrix regressions: the witness_bound_not_run class (lead ruling
state/RULING-single-vector-20261117.md, sha256 6b57a3e4...) and its standing negatives.

Run: python3 -B scripts/pm_goal_dg5_matrix_selftest.py
"""
import ast
import gzip
import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))

FAM = 'goal.updated'
OA = 'scripts/pm_goal_test_owner_adapters.py'   # a shared_refuse in an except branch
ST = 'scripts/pm_goal_test_storage.py'          # :1657 plain require (not a bad-branch site)


def _refuse_line():
    for i, text in enumerate((ROOT / OA).read_text().splitlines(), 1):
        if 'shared_refuse(' in text:
            return i
    raise AssertionError('no shared_refuse site in ' + OA)


def _sha(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


def _rec(i, label, outcome, target=None, kill=None, sig=0, cut_errors=None, codes=None):
    errors = [target] if target and outcome == 'exact_expected' else []
    # The judge marks every control valid=True (pm_goal_guard_sweep._judge); Amendment 1
    # condition 4 as fixed by TOOLBATCH F1 selects controls by that mark, not by outcome.
    record = dict(id=i, family=FAM, label=label, sig=sig, outcome=outcome, target=target,
                  valid=True if outcome in ('control', 'control_refused') else None,
                  kill=kill, errors=errors, input_sha256='f' * 64, restoration_errors=list(errors),
                  cut_errors=[] if cut_errors is None else cut_errors, site_cuts=None,
                  cut_exception_site=None)
    if codes is not None:
        record['refusal_code'] = codes['intact']
        record['killed_code_check'] = dict(
            verdict='KILLED_CODE', intact_code=codes['intact'], cut_code=codes['cut'],
            restoration_code=codes['intact'], different_code=True,
            own_guard=dict(own=True, code_matches=True, why=None))
    return record


def _proof(base, rows, ledger, specs, tables, failures=None, bindings=None, signatures=None):
    (base / 'tables').mkdir(parents=True, exist_ok=True)
    with gzip.open(base / 'ledger.json.gz', 'wt') as h:
        json.dump(ledger, h)
    with gzip.open(base / 'signatures.json.gz', 'wt') as h:
        json.dump([[]] if signatures is None else signatures, h)
    (base / 'family-rows.json').write_text(json.dumps({FAM: sorted(rows)}))
    (base / 'collection.json').write_text(json.dumps(
        dict(rows=rows, calls=len(ledger), failures=[] if failures is None else failures)))
    (base / 'tables/rows.json').write_text(json.dumps(specs))
    (base / 'tables/summary.json').write_text(json.dumps(tables))
    files = {OA: _sha(OA), ST: _sha(ST)}
    files.update(bindings or {})
    (base / 'source-bindings.json').write_text(json.dumps(dict(files=files)))
    return base


def check_classifier():
    import pm_goal_dg5_matrix as matrix
    src = (
        "def f(x):\n"
        "    try:\n"
        "        g(x)\n"
        "    except ValueError:\n"
        "        shared_require('bad', x)\n"          # line 5: except-branch require
        "    require('plain', x)\n"                     # line 6: plain require
        "    refuse('boom')\n"                          # line 7: unconditional refuse
        "class H:\n"
        "    def __reduce__(self):\n"
        "        shared_refuse('no')\n"                 # line 10: reduce handler
    )
    tree = ast.parse(src)
    assert matrix._classify(tree, 5) == 'except_branch_require'
    assert matrix._classify(tree, 6) is None
    assert matrix._classify(tree, 7) == 'unconditional_refuse'
    assert matrix._classify(tree, 10) == 'reduce_handler'


def check_closure_reports():
    import pm_goal_dg5_matrix as matrix

    row = 'dg5/test/schema'
    first_id = 'file:///frozen/inputs/Plans/contract.schema.json#/required'
    alias_id = 'https://puppetmaster.local/inputs/Plans/contract.schema.json#/required'
    with tempfile.TemporaryDirectory(prefix='dg5-closure-matrix-') as td:
        first = Path(td) / 'first.json'
        second = Path(td) / 'second.json'

        def write_report(path, clauses, **details):
            root = dict(rows=[row], families=[FAM], clauses=clauses, **details)
            path.write_text(json.dumps(dict(roots={'dg5:test': root})))

        def merged(*paths):
            return matrix.load_closure(paths)[row][0]

        write_report(first, {first_id: dict(cls='UNCOVERED')})
        write_report(second, {alias_id: dict(cls='UNCOVERED')})
        root = merged(first, second)
        assert root['error'] and set(root['uncovered_clauses']) == {first_id, alias_id}, root

        write_report(second, {})
        root = merged(first, second)
        assert root['error'] and root['uncovered_clauses'] == [first_id], root

        for details in ({}, {'verify': {'passed': 0}}):
            write_report(second, {first_id: dict(cls='KILLED')}, **details)
            root = merged(first, second)
            assert root['error'] is None and root['uncovered_clauses'] == [first_id], root

        write_report(second, {first_id: dict(cls='KILLED')}, verify=dict(passed=1, failed=0))
        root = merged(first, second)
        assert root['error'] is None and root['uncovered'] == 0, root

        for verify in (dict(failed=1), dict(unverifiable=1), dict(sampled=dict(mismatch=1))):
            write_report(second, {first_id: dict(cls='KILLED')}, verify=verify)
            root = merged(first, second)
            assert root['error'] and root['uncovered_clauses'] == [first_id], root
            assert merged(second)['error'], verify

        legacy = first_id.rsplit('/', 1)[0] + '/closed_members'
        separate = [first_id.rsplit('/', 1)[0] + '/' + keyword
                    for keyword in ('additionalProperties', 'unevaluatedProperties')]
        census = Path(td) / 'census.json'

        def pin(ids):
            return dict(identity='dg5-distinct-keywords-v1', count=len(ids),
                        sha256=hashlib.sha256('\n'.join(sorted(ids)).encode()).hexdigest())

        def write_census(ids):
            entry = dict(rows=[row], families=[FAM], clause_ids=ids, clause_inventory=pin(ids))
            census.write_text(json.dumps(dict(mode='assertion-inventory', roots={'dg5:test': entry})))

        write_report(first, {legacy: dict(cls='KILLED')}, verify=dict(passed=1))
        assert 'legacy closed_members' in merged(first)['error']
        write_census([legacy])
        assert matrix.load_closure([first], [census])[row][0]['error'] is None
        write_census(separate)
        assert matrix.load_closure([first], [census])[row][0]['error']
        assert matrix.load_closure([], [census])[row][0]['error']
        write_report(first, {x: dict(cls='KILLED') for x in separate},
                     verify=dict(passed=2), clause_inventory=pin(separate))
        assert matrix.load_closure([first], [census])[row][0]['error'] is None


def check_matrix():
    ok = 'dg5/site/pm_goal_test_owner_adapters.py:75'
    nowit = 'dg5/test/not_run_without_witness'
    fail = 'dg5/test/fail_table_with_witness'
    later = 'dg5/test/covered_later_only'
    dup = 'dg5/test/duplicate_set_only'
    req = 'dg5/site/pm_goal_test_storage.py:1657'
    normal = 'dg5/test/pass_table_killed'
    line = _refuse_line()
    rows = {ok: dict(sites=[[OA, line]]), nowit: dict(sites=[[OA, line]]), fail: dict(sites=[[OA, line]]),
            later: dict(sites=[[OA, line]]), dup: dict(sites=[[OA, line]]), req: dict(sites=[[ST, 1657]]),
            normal: dict(sites=[[OA, line]])}
    nr = lambda t, r: dict(table=t, status='NOT_RUN', rows=[r], reason='no control vector')
    specs = [dict(guard=ok, table='t-ok', status='UNPROVED'), dict(guard=nowit, table='t-nw', status='UNPROVED'),
             dict(guard=fail, table='t-fail', status='FAIL'), dict(guard=later, table='t-later', status='UNPROVED'),
             dict(guard=dup, table='t-dup', status='UNPROVED'), dict(guard=req, table='t-req', status='UNPROVED'),
             dict(guard=normal, table='t-pass', status='PASS')]
    tables = [nr('t-ok', ok), nr('t-nw', nowit), dict(table='t-fail', status='FAIL', rows=[fail]),
              nr('t-later', later), nr('t-dup', dup), nr('t-req', req),
              dict(table='t-pass', status='PASS', rows=[normal])]
    ledger = [_rec(0, 'case/control', 'control'),
              _rec(1, 'case/ok', 'exact_expected', ok, 'KILLED'),
              _rec(2, 'case/fail', 'exact_expected', fail, 'KILLED'),
              _rec(3, 'case/later', 'exact_expected', later, 'COVERED_LATER'),
              _rec(4, 'case/dup', 'exact_expected', dup, 'DUPLICATE_SET_KILLED'),
              _rec(5, 'case/req', 'exact_expected', req, 'KILLED'),
              _rec(6, 'case/normal', 'exact_expected', normal, 'KILLED')]
    with tempfile.TemporaryDirectory(prefix='dg5-matrix-selftest-') as td:
        proof = _proof(Path(td) / 'proof', rows, ledger, specs, tables)
        out = Path(td) / 'matrix.json'
        cmd = [sys.executable, '-B', 'scripts/pm_goal_dg5_matrix.py', str(proof),
               '--family', FAM, '--out', str(out)]
        r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
        assert r.returncode == 0, r.stderr[-2000:]
        fam = json.loads(out.read_text())['families'][FAM]
        row_proof = _proof(Path(td) / 'row-proof', {normal: rows[normal]},
                           [_rec(0, 'targeted/control', 'control'),
                            _rec(1, 'targeted/negative', 'exact_expected', normal, 'KILLED')],
                           [specs[-1]], [tables[-1]])
        r = subprocess.run(cmd + ['--row-proof', str(row_proof)], cwd=ROOT, capture_output=True, text=True)
        assert r.returncode == 0, r.stderr[-2000:]
        patched = {x['row']: x for x in json.loads(out.read_text())['families'][FAM]['matrix']}
        original = {x['row']: x for x in fam['matrix']}
        assert patched[ok]['justification']['replay'] == original[ok]['justification']['replay']
        assert patched[normal]['negative']['declared_attempts'] == original[normal]['negative']['declared_attempts'] + 1
    m = {x['row']: x for x in fam['matrix']}
    # G1 (WRONGFAM-GUARDS): a witness-bound-not-run row has no written entry text, so the
    # builder no longer self-marks it; it is PENDING_READ and only a review registry can close it.
    assert m[ok]['status'] == 'PENDING_READ' and m[ok]['reason'] == 'witness_bound_not_run: no written proof entry to read', m[ok]
    just = m[ok]['justification']
    assert just['kind'] == 'witness_bound_not_run'
    assert just['table_reasons'][0]['reason'] == 'no control vector'          # verbatim (ruling 3)
    assert just['structural'][0]['file_sha256'] == _sha(OA)                   # bound bytes (ruling 1)
    assert just['witness']['label'] == 'case/ok' and just['witness']['restoration']['same_refusal']
    assert fam['witness_bound_not_run'] == 1                                  # per-family count (ruling 7)
    assert m[nowit]['status'] == 'OPEN', m[nowit]                             # standing negative 1
    assert m[fail]['status'] == 'OPEN', m[fail]                               # standing negative 2
    assert m[later]['status'] == 'OPEN', m[later]                             # standing negative 3
    assert m[dup]['status'] == 'OPEN', m[dup]
    assert m[req]['status'] == 'OPEN', m[req]
    assert m[normal]['status'] == 'CLOSED', m[normal]                         # normal rule first (ruling 6)


def check_amendment1():
    """Amendment 1's condition 2 (KILLED_CODE with Addendum J2) and condition 4 (one exact
    declared known failure): the positive, the brief's refusals, the AMEND1-MATRIX
    review's F1-F5/F8 trials (01l, 01m, 05b, 05c, 05e, 06b, 06c, 06d, 07a), and the
    TOOLBATCH-AMEND1-FIX review's F1-F5 trials (M1a-c, M2a-c, M3a-e, M4b)."""
    line = _refuse_line()
    declared = [['source', 'unsupported_same_run_halts', 'reducer/unregistered_record']]
    other = ['source', 'another_case', 'reducer/unregistered_record']
    codes = dict(intact='Corrupt:magic', cut='Corrupt:prefix_crc')
    witness_label = 'adapter/dg5-shared/frame_fixture_decode:magic/decode_frame'

    def failure(entries):
        return dict(kind='source_failed', source='pm_goal_dg5_adapter', exit=1,
                    details=json.dumps(dict(status='fail', failures=entries)))

    def witness(name, i=1, label=witness_label, sig=0, killed=codes):
        return _rec(i, label, 'exact_expected', name, 'KILLED_CODE', sig=sig,
                    cut_errors=['dg5/site/pm_goal_test_storage.py:525'], codes=killed)

    def trial(td, tag, name, ledger, failures, declaration, reason='no control vector',
              signatures=None, sites=None):
        table = 't-' + tag
        site = (sites or [[OA, line]])[0]
        rows = {name: dict(sites=[site])}
        specs = [dict(guard=name, table=table, status='UNPROVED')]
        tables = [dict(table=table, status='NOT_RUN', rows=[name], reason=reason)]
        proof = _proof(Path(td) / tag, rows, ledger, specs, tables, failures=failures,
                       signatures=signatures)
        out = Path(td) / (tag + '.json')
        cmd = [sys.executable, '-B', 'scripts/pm_goal_dg5_matrix.py', str(proof),
               '--family', FAM, '--out', str(out)]
        if declaration is not None:
            path = Path(td) / (tag + '.known.json')
            path.write_text(json.dumps(declaration))
            cmd += ['--known-failure', str(path)]
        r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
        assert r.returncode == 0, (tag, r.stderr[-2000:])
        fam = json.loads(out.read_text())['families'][FAM]
        return fam, {x['row']: x for x in fam['matrix']}[name]

    with tempfile.TemporaryDirectory(prefix='dg5-matrix-amend1-') as td:
        # (a) KILLED_CODE meeting J2 + one declared known failure not touching the row.
        name = 'dg5/test/not_run_killed_code'
        fam, row = trial(td, 'amend1-ok', name,
                         [_rec(0, 'case/control', 'control'), witness(name)],
                         [failure([declared[0]])], declared)
        assert row['status'] == 'PENDING_READ' and row['reason'] == 'witness_bound_not_run: no written proof entry to read', row
        just = row['justification']
        assert just['kind'] == 'witness_bound_not_run', just
        assert just['witness']['kill'] == 'KILLED_CODE', just['witness']
        assert just['witness']['codes'] == dict(intact_code='Corrupt:magic',
                                                cut_code='Corrupt:prefix_crc',
                                                restoration_code='Corrupt:magic'), just['witness']
        assert just['known_failures'] == [declared[0]], just['known_failures']
        assert just['replay'][0]['known_failure']['entry'] == declared[0], just['replay'][0]
        assert just['replay'][0]['controls_exact'] is True, just['replay'][0]
        assert fam['witness_bound_not_run'] == 1, fam['status']

        # (b) a KILLED_CODE label without J2's conditions refuses.
        name = 'dg5/test/not_run_killed_code_without_j2'
        _, row = trial(td, 'amend1-no-j2', name,
                       [_rec(0, 'case/control', 'control'),
                        _rec(1, 'case/code', 'exact_expected', name, 'KILLED_CODE',
                             cut_errors=['dg5/site/pm_goal_test_storage.py:525'])],
                       [], declared)
        assert row['status'] == 'OPEN', row

        # (c) a second failure in the replay refuses.
        name = 'dg5/test/not_run_second_failure'
        _, row = trial(td, 'amend1-second', name,
                       [_rec(0, 'case/control', 'control'), witness(name)],
                       [failure([declared[0]]), failure([other])], declared)
        assert row['status'] == 'OPEN', row

        # (d) an undeclared failure refuses.
        name = 'dg5/test/not_run_undeclared_failure'
        _, row = trial(td, 'amend1-undeclared', name,
                       [_rec(0, 'case/control', 'control'), witness(name)],
                       [failure([other])], declared)
        assert row['status'] == 'OPEN', row

        # (e) a declared failure whose case is the row's own case refuses.
        name = 'dg5/test/not_run_touching_failure'
        touching = ['source', 'case/touching', 'reducer/unregistered_record']
        _, row = trial(td, 'amend1-touching', name,
                       [_rec(0, 'case/control', 'control'),
                        _rec(1, 'case/touching', 'exact_expected', name, 'KILLED_CODE',
                             cut_errors=['dg5/site/pm_goal_test_storage.py:525'], codes=codes)],
                       [failure([touching])], [touching])
        assert row['status'] == 'OPEN', row

        # (f) a control other than the known case that is not exact refuses.
        name = 'dg5/test/not_run_inexact_control'
        bad = _rec(2, 'case/other_control', 'control')
        bad['errors'] = ['dg5/test/elsewhere']
        _, row = trial(td, 'amend1-inexact', name,
                       [_rec(0, 'case/control', 'control'), bad, witness(name)],
                       [failure([declared[0]])], declared)
        assert row['status'] == 'OPEN', row

        # --- AMEND1-MATRIX review trials (each wrongly closed on 2d3c998212) ---

        # (g) 01l: J2 own_guard names a different row and code.
        name = 'dg5/test/review_01l_own_guard_wrong_row'
        bad = witness(name)
        bad['killed_code_check']['own_guard'].update(
            row='dg5/site/pm_goal_test_storage.py:999', code='Corrupt:other')
        _, row = trial(td, 'amend1-01l', name,
                       [_rec(0, 'case/control', 'control'), bad],
                       [failure([declared[0]])], declared)
        assert row['status'] == 'OPEN', row

        # (h) 01m: J2 cut_errors is the judge's exception string, with a cut exception site.
        name = 'dg5/test/review_01m_cut_errors_exception'
        bad = witness(name)
        bad['cut_errors'] = 'exception:RuntimeError'
        bad['cut_exception_site'] = dict(exception='RuntimeError', detail='TypeError: boom')
        _, row = trial(td, 'amend1-01m', name,
                       [_rec(0, 'case/control', 'control'), bad],
                       [failure([declared[0]])], declared)
        assert row['status'] == 'OPEN', row

        # (i) 05b: the declared case id is the witness's own case, bare in real format.
        name = 'dg5/test/review_05b_real_case_id'
        touches = ['dg5-shared', 'frame_fixture_decode:magic', 'Corrupt:unexpected']
        _, row = trial(td, 'amend1-05b', name,
                       [_rec(0, 'case/control', 'control'), witness(name)],
                       [failure([touches])], [touches])
        assert row['status'] == 'OPEN', row

        # (j) 05c: the declared case refused at the row in the ledger (component 'storage').
        name = 'dg5/test/review_05c_ledger_hits_row'
        probe = _rec(7, 'adapter/storage/custom_magic_probe/TestOwnerStorage.read_event',
                     'other_refusal', sig=1)
        probe['errors'] = [name]
        touches = ['storage', 'custom_magic_probe', 'Corrupt:unexpected']
        _, row = trial(td, 'amend1-05c', name,
                       [_rec(0, 'case/control', 'control'), probe, witness(name, sig=0)],
                       [failure([touches])], [touches],
                       signatures=[[], [name]], sites=[[ST, 197]])
        assert row['status'] == 'OPEN', row

        # (k) 05e: the declared code is the witness's cut code.
        name = 'dg5/test/review_05e_cut_code'
        touches = ['source', 'unrelated_case', 'Corrupt:prefix_crc']
        _, row = trial(td, 'amend1-05e', name,
                       [_rec(0, 'case/control', 'control'), witness(name)],
                       [failure([touches])], [touches])
        assert row['status'] == 'OPEN', row

        # (l) 06b: a real refused control (outcome 'control_refused') is still a control.
        name = 'dg5/test/review_06b_control_refused'
        bad = _rec(2, 'adapter/storage/other_control/TestOwnerStorage.append', 'control_refused')
        bad['errors'] = ['dg5/site/pm_goal_test_storage.py:1450']
        _, row = trial(td, 'amend1-06b', name,
                       [_rec(0, 'case/control', 'control'), bad, witness(name)],
                       [failure([declared[0]])], declared)
        assert row['status'] == 'OPEN', row

        # (m) 06c: a control whose label only contains the case as a substring is not exempt.
        name = 'dg5/test/review_06c_substring_collision'
        bad = _rec(2, 'adapter/source/unsupported_same_run_halts_other/GenericSource.acquire',
                   'control_refused')
        bad['errors'] = ['dg5/site/pm_goal_test_storage.py:1450']
        _, row = trial(td, 'amend1-06c', name,
                       [_rec(0, 'case/control', 'control'), bad, witness(name)],
                       [failure([declared[0]])], declared)
        assert row['status'] == 'OPEN', row

        # (n) 06d: the known case's own control refuses at this row.
        name = 'dg5/test/review_06d_exempt_case_hits_row'
        bad = _rec(2, 'adapter/source/unsupported_same_run_halts/GenericSource.project',
                   'control_refused')
        bad['errors'] = [name]
        _, row = trial(td, 'amend1-06d', name,
                       [_rec(0, 'case/control', 'control'), bad, witness(name)],
                       [failure([declared[0]])], declared)
        assert row['status'] == 'OPEN', row

        # (o) 07a: Amendment 1 does not apply to a 'no single-row vector' table.
        name = 'dg5/test/review_07a_no_single_row_vector'
        _, row = trial(td, 'amend1-07a', name,
                       [_rec(0, 'case/control', 'control'), witness(name)],
                       [failure([declared[0]])], declared, reason='no single-row vector')
        assert row['status'] == 'OPEN', row

        # --- TOOLBATCH-AMEND1-FIX review trials (each wrongly closed on 31794f52eb) ---

        # (p) M1a: a real-judge exception control (valid=True, generated=True, errors=None,
        # the shape pm_goal_guard_sweep.py:415-419 writes without appending a failure).
        name = 'dg5/test/review_M1a_control_exception_real_judge'
        exc = _rec(2, 'adapter/storage/exception_case/TestOwnerStorage.append', 'exception')
        exc.update(valid=True, generated=True, errors=None)
        _, row = trial(td, 'amend1-M1a', name,
                       [_rec(0, 'case/control', 'control'), exc, witness(name)],
                       [failure([declared[0]])], declared)
        assert row['status'] == 'OPEN', row

        # (q) M1b: a control with another outcome spelling ('control_failed') and errors.
        name = 'dg5/test/review_M1b_control_alt_outcome_spelling'
        bad = _rec(2, 'adapter/storage/alt_outcome_case/TestOwnerStorage.append', 'control_failed')
        bad.update(valid=True, errors=['dg5/site/pm_goal_test_storage.py:1450'])
        _, row = trial(td, 'amend1-M1b', name,
                       [_rec(0, 'case/control', 'control'), bad, witness(name)],
                       [failure([declared[0]])], declared)
        assert row['status'] == 'OPEN', row

        # (r) M1c: a refused control with empty errors is not exact.
        name = 'dg5/test/review_M1c_control_refused_empty_errors'
        bad = _rec(2, 'adapter/storage/empty_errors_case/TestOwnerStorage.append', 'control_refused')
        bad['errors'] = []
        _, row = trial(td, 'amend1-M1c', name,
                       [_rec(0, 'case/control', 'control'), bad, witness(name)],
                       [failure([declared[0]])], declared)
        assert row['status'] == 'OPEN', row

        # (s) M2a: the real declared case, but the refused control is in another component.
        name = 'dg5/test/review_M2a_case_id_other_component'
        bad = _rec(2, 'adapter/storage/unsupported_same_run_halts/TestOwnerStorage.append',
                   'control_refused')
        bad['errors'] = ['dg5/site/pm_goal_test_storage.py:1450']
        _, row = trial(td, 'amend1-M2a', name,
                       [_rec(0, 'case/control', 'control'), bad, witness(name)],
                       [failure([declared[0]])], declared)
        assert row['status'] == 'OPEN', row

        # (t) M2b: the declared case id matches only the control's entry segment.
        name = 'dg5/test/review_M2b_case_id_matches_entry_segment'
        touches = ['source', 'TestOwnerStorage.append', 'reducer/unregistered_record']
        bad = _rec(2, 'adapter/storage/unrelated_control/TestOwnerStorage.append', 'control_refused')
        bad['errors'] = ['dg5/site/pm_goal_test_storage.py:1450']
        _, row = trial(td, 'amend1-M2b', name,
                       [_rec(0, 'case/control', 'control'), bad, witness(name)],
                       [failure([touches])], [touches])
        assert row['status'] == 'OPEN', row

        # (u) M2c: the declared case id matches only the control's component segment.
        # The row site is storage:197: 'registration' occurs in the owner-adapters bytes.
        name = 'dg5/test/review_M2c_case_id_matches_comp_segment'
        touches = ['source', 'registration', 'reducer/unregistered_record']
        bad = _rec(2, 'adapter/registration/unrelated_control/Registry.register', 'control_refused')
        bad['errors'] = ['dg5/site/pm_goal_test_storage.py:1450']
        _, row = trial(td, 'amend1-M2c', name,
                       [_rec(0, 'case/control', 'control'), bad, witness(name)],
                       [failure([touches])], [touches], sites=[[ST, 197]])
        assert row['status'] == 'OPEN', row

        # (v) M3a: a second attempt's killed_code_check.restoration_code is the declared code.
        name = 'dg5/test/review_M3a_restoration_code_other_attempt'
        touches = ['source', 'unrelated_case', 'Corrupt:rest_only_drift']
        second = _rec(2, 'case/second_attempt', 'exact_expected', name, 'RESTORATION_FAILED')
        second['restoration_errors'] = []
        second['killed_code_check'] = dict(verdict='RESTORATION_FAILED',
                                           restoration_code='Corrupt:rest_only_drift')
        _, row = trial(td, 'amend1-M3a', name,
                       [_rec(0, 'case/control', 'control'), second, witness(name)],
                       [failure([touches])], [touches])
        assert row['status'] == 'OPEN', row

        # (w) M3b: the declared case's ledger record hits the row only in restoration_errors.
        name = 'dg5/test/review_M3b_case_ledger_restoration_errors'
        hit = _rec(2, 'adapter/source/unsupported_same_run_halts/GenericSource.acquire',
                   'control_refused')
        hit['errors'] = ['dg5/site/pm_goal_test_storage.py:1450']
        hit['restoration_errors'] = [name]
        _, row = trial(td, 'amend1-M3b', name,
                       [_rec(0, 'case/control', 'control'), hit, witness(name)],
                       [failure([declared[0]])], declared)
        assert row['status'] == 'OPEN', row

        # (x) M3c: the declared case's ledger record hits the row only in cut_errors.
        name = 'dg5/test/review_M3c_case_ledger_cut_errors'
        hit = _rec(2, 'adapter/source/unsupported_same_run_halts/GenericSource.acquire',
                   'control_refused')
        hit['errors'] = ['dg5/site/pm_goal_test_storage.py:1450']
        hit['restoration_errors'] = ['dg5/site/pm_goal_test_storage.py:1450']
        hit['cut_errors'] = [name]
        _, row = trial(td, 'amend1-M3c', name,
                       [_rec(0, 'case/control', 'control'), hit, witness(name)],
                       [failure([declared[0]])], declared)
        assert row['status'] == 'OPEN', row

        # (y) M3d: the declared case's ledger record emits the row's own code.
        name = 'dg5/test/review_M3d_case_ledger_emits_row_code'
        hit = _rec(2, 'adapter/source/unsupported_same_run_halts/GenericSource.acquire',
                   'control_refused')
        hit['errors'] = ['dg5/site/pm_goal_test_storage.py:1450']
        hit['restoration_errors'] = ['dg5/site/pm_goal_test_storage.py:1450']
        hit['refusal_code'] = 'Corrupt:magic'
        hit['killed_code_check'] = dict(verdict='KILLED_CODE', restoration_code='Corrupt:magic')
        _, row = trial(td, 'amend1-M3d', name,
                       [_rec(0, 'case/control', 'control'), hit, witness(name)],
                       [failure([declared[0]])], declared)
        assert row['status'] == 'OPEN', row

        # (z) M3e: a declared case id containing '/' is the witness's own multi-segment case.
        name = 'dg5/test/review_M3e_slash_case_id_witness'
        touches = ['dg5-shared', 'frame_fixture/magic', 'Corrupt:unexpected']
        _, row = trial(td, 'amend1-M3e', name,
                       [_rec(0, 'case/control', 'control'),
                        witness(name, label='adapter/dg5-shared/frame_fixture/magic/decode_frame')],
                       [failure([touches])], [touches])
        assert row['status'] == 'OPEN', row

        # (aa) M4b: a cited shared proof whose own table is 'no single-row vector' keeps the
        # unamended conditions even when every family table is 'no control vector'.
        name = 'dg5/test/review_M4b_shared_single_row_with_fam_no_control'
        fam_proof = _proof(Path(td) / 'amend1-M4b-fam', {name: dict(sites=[[OA, line]])},
                           [_rec(0, 'case/control', 'control')],
                           [dict(guard=name, table='t-M4b-fam', status='UNPROVED')],
                           [dict(table='t-M4b-fam', status='NOT_RUN', rows=[name],
                                 reason='no control vector')])
        shr_proof = _proof(Path(td) / 'amend1-M4b-shr', {name: dict(sites=[[OA, line]])},
                           [_rec(0, 'case/control', 'control'), witness(name)],
                           [dict(guard=name, table='t-M4b-shr', status='UNPROVED')],
                           [dict(table='t-M4b-shr', status='NOT_RUN', rows=[name],
                                 reason='no single-row vector')],
                           failures=[failure([declared[0]])])
        out = Path(td) / 'amend1-M4b.json'
        decl_path = Path(td) / 'amend1-M4b.known.json'
        decl_path.write_text(json.dumps(declared))
        r = subprocess.run([sys.executable, '-B', 'scripts/pm_goal_dg5_matrix.py',
                            str(fam_proof), '--family', FAM, '--shared-proof', str(shr_proof),
                            '--known-failure', str(decl_path), '--out', str(out)],
                           cwd=ROOT, capture_output=True, text=True)
        assert r.returncode == 0, r.stderr[-2000:]
        row = {x['row']: x for x in json.loads(out.read_text())['families'][FAM]['matrix']}[name]
        assert row['status'] == 'OPEN', row


def main():
    check_classifier()
    check_closure_reports()
    check_matrix()
    check_amendment1()
    print('pm_goal_dg5_matrix_selftest: PASS')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
