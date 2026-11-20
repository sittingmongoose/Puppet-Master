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


def _rec(i, label, outcome, target=None, kill=None, sig=0):
    errors = [target] if target and outcome == 'exact_expected' else []
    return dict(id=i, family=FAM, label=label, sig=sig, outcome=outcome, target=target, valid=None,
                kill=kill, errors=errors, input_sha256='f' * 64, restoration_errors=list(errors),
                cut_errors=[], site_cuts=None, cut_exception_site=None)


def _proof(base, rows, ledger, specs, tables):
    (base / 'tables').mkdir(parents=True, exist_ok=True)
    with gzip.open(base / 'ledger.json.gz', 'wt') as h:
        json.dump(ledger, h)
    with gzip.open(base / 'signatures.json.gz', 'wt') as h:
        json.dump([[]], h)   # no accepted call evaluates any candidate row (controls 0)
    (base / 'family-rows.json').write_text(json.dumps({FAM: sorted(rows)}))
    (base / 'collection.json').write_text(json.dumps(dict(rows=rows, calls=len(ledger), failures=[])))
    (base / 'tables/rows.json').write_text(json.dumps(specs))
    (base / 'tables/summary.json').write_text(json.dumps(tables))
    (base / 'source-bindings.json').write_text(json.dumps(dict(files={OA: _sha(OA), ST: _sha(ST)})))
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

        write_report(second, {first_id: dict(cls='KILLED')})
        root = merged(first, second)
        assert root['error'] is None and root['uncovered'] == 0, root

        for verify in (dict(failed=1), dict(unverifiable=1), dict(sampled=dict(mismatch=1))):
            write_report(second, {first_id: dict(cls='KILLED')}, verify=verify)
            root = merged(first, second)
            assert root['error'] and root['uncovered_clauses'] == [first_id], root
            assert merged(second)['error'], verify


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
    m = {x['row']: x for x in fam['matrix']}
    assert m[ok]['status'] == 'CLOSED_BY_PROOF' and m[ok]['reason'] == 'witness_bound_not_run', m[ok]
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


def main():
    check_classifier()
    check_closure_reports()
    check_matrix()
    print('pm_goal_dg5_matrix_selftest: PASS')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
