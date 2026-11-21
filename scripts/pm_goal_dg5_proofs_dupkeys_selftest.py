#!/usr/bin/env python3
"""Red-first trials of the written-proof duplicate-key refusal (TOOL-ISSUES T316, lead ruling
1121224233-9f91 (2): one definition per key, the loader refuses any duplicate, fail closed).

    python3 -B pm_goal_dg5_proofs_dupkeys_selftest.py --out RESULT.json

Each duplicate trial builds fixture proof modules in a temp dir, points PROOF_MODULES at them and runs
pm_goal_dg5_justified.written_proofs(). The unfixed loader (bc0d88706f) accepts every duplicate: Python
silently keeps the last dict-literal key, and the last module wins across modules. Those trials FAIL on
it (red first) and PASS on the fixed loader, which raises ProofDuplicateError before anything is
returned. Both forms the real duplicates take are covered: a repeated key within one dict literal
(plain, folded SITE-style keys, and PROOFS.update) and the same key across two modules. The
comprehension form (pm_goal_dg5_proofs_r.py over RETAINED.items()) is expanded, not refused: a control
loads it, a repeated source key is refused, and an unsupported comprehension source fails closed.
Controls: a duplicate-free folded-key module loads with the exact table, and the branch's real proof
table loads unchanged (82 keys).
"""
import argparse
import importlib
import json
from pathlib import Path
import sys
import tempfile

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import pm_goal_dg5_justified as justified  # noqa: E402

SITE_PATH = 'scripts/pm_goal_dg5_justified.py'   # a real path, so the loader's site binding reads bytes


def proof(argument):
    return dict(kind='code-selection', argument=argument, sites=[(SITE_PATH, 1)], depends_on=[])


def run_fixture(modules, names):
    """Run written_proofs() over fixture modules {name: source}; restore every global afterwards."""
    with tempfile.TemporaryDirectory(prefix='dg5-dupkeys-') as work:
        for name, source in modules.items():
            (Path(work) / ('pm_goal_dg5_proofs_' + name + '.py')).write_text(source)
        saved_modules = justified.PROOF_MODULES
        saved_path = list(sys.path)
        saved_cache = {k for k in sys.modules if k.startswith('pm_goal_dg5_proofs_')}
        try:
            sys.path.insert(0, work)
            importlib.invalidate_caches()
            justified.PROOF_MODULES = tuple(names)
            try:
                table = justified.written_proofs()
            except ValueError as error:
                return dict(refused=True, error=str(error), table=None)
            return dict(refused=False, error=None, table={k: v.get('argument') for k, v in table.items()})
        finally:
            justified.PROOF_MODULES = saved_modules
            sys.path[:] = saved_path
            for k in list(sys.modules):
                if k.startswith('pm_goal_dg5_proofs_') and k not in saved_cache:
                    del sys.modules[k]
            importlib.invalidate_caches()


def dict_source(entries, folded=False):
    head = "K = 'dg5/site/pm_goal_test_storage.py:'\n" if folded else ''
    body = ',\n'.join('    %s: %r' % (key, proof(arg)) for key, arg in entries)
    return head + 'PROOFS = {\n' + body + ',\n}\n'


def trials():
    rows = []

    def refuse_trial(name, modules, names, want):
        result = run_fixture(modules, names)
        ok = result['refused'] and want in (result['error'] or '')
        rows.append(dict(case=name, expected='refused: ' + want, result=result, passed=bool(ok)))

    def load_trial(name, modules, names, want_table):
        result = run_fixture(modules, names)
        ok = not result['refused'] and result['table'] == want_table
        rows.append(dict(case=name, expected='loaded with the exact table', result=result, passed=bool(ok)))

    key = "'dg5/site/pm_goal_test_storage.py:1'"
    # Form 1: a repeated dict-literal key (Python silently keeps the second).
    refuse_trial('dup_within_literal', {'dupw1': dict_source([(key, 'first'), (key, 'second')])},
                 ('dupw1',), 'defined more than once')
    # Form 1 with folded keys (SITE + '1'), as the real proofs_ca.py duplicates fold.
    refuse_trial('dup_within_folded',
                 {'dupw2': dict_source([("K + '1'", 'first'), ("K + '1'", 'second')], folded=True)},
                 ('dupw2',), 'defined more than once')
    # Form 2: the same key in two modules (the loader keeps the last module's).
    refuse_trial('dup_across_modules',
                 {'dupa1': dict_source([(key, 'from-a')]), 'dupb1': dict_source([(key, 'from-b')])},
                 ('dupa1', 'dupb1'), 'across')
    # Form 1 through PROOFS.update (the form pm_goal_dg5_proofs_s.py uses).
    refuse_trial('dup_update_form',
                 {'dupw3': "PROOFS = {\n    %s: %r,\n}\nPROOFS.update({\n    %s: %r,\n})\n"
                  % (key, proof('first'), key, proof('second'))},
                 ('dupw3',), 'defined more than once')
    # Fail closed: unanalyzable PROOFS forms are refused, never guessed.
    refuse_trial('dup_nonliteral_call', {'dupw4': 'PROOFS = dict()\n'}, ('dupw4',), 'non-literal')
    refuse_trial('dup_comprehension',
                 {'dupw5': "PROOFS = {k: %r for k in ('a', 'b')}\n" % proof('comp')},
                 ('dupw5',), 'non-literal')
    # The comprehension form proofs_r.py uses: expanded over a literal source dict bound once.
    load_trial('comprehension_control',
               {'dupc2': "SRC = {'a': 1, 'b': 2}\nK = 'dg5/site/pm_goal_test_storage.py:'\n"
                "PROOFS = {K + k: %r for k in SRC}\n" % proof('comp')},
               ('dupc2',), {'dg5/site/pm_goal_test_storage.py:a': 'comp',
                            'dg5/site/pm_goal_test_storage.py:b': 'comp'})
    refuse_trial('dup_comprehension_src',
                 {'dupc3': "SRC = {'a': 1, 'a': 2}\nK = 'dg5/site/pm_goal_test_storage.py:'\n"
                  "PROOFS = {K + k: %r for k in SRC}\n" % proof('comp')},
                 ('dupc3',), 'defined more than once')
    # Control: duplicate-free folded keys load with the exact table (no over-refusal).
    load_trial('clean_folded_control',
               {'dupc1': dict_source([("K + '1'", 'one'), ("K + '2'", 'two')], folded=True)},
               ('dupc1',), {'dg5/site/pm_goal_test_storage.py:1': 'one',
                            'dg5/site/pm_goal_test_storage.py:2': 'two'})
    # Control: the branch's real proof table loads unchanged.
    try:
        table = justified.written_proofs()
        result = dict(refused=False, error=None, key_count=len(table))
        ok = len(table) == 82
    except ValueError as error:
        result, ok = dict(refused=True, error=str(error), key_count=None), False
    rows.append(dict(case='real_table_loads', expected='loaded, 82 keys (the bc0d88706f table)',
                     result=result, passed=bool(ok)))
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    rows = trials()
    report = dict(status='pass' if all(r['passed'] for r in rows) else 'fail',
                  judge=dict(justified=justified.__file__), cases=rows)
    args.out.write_text(json.dumps(report, indent=1, default=str) + '\n')
    for row in rows:
        print(f"{'PASS' if row['passed'] else 'FAIL'} {row['case']}: expected {row['expected']}, "
              f"got {'refused' if row['result'].get('refused') else 'accepted'}"
              + (f" ({row['result'].get('error')})" if row['result'].get('error') else ''))
    print(report['status'])
    return 0 if report['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
