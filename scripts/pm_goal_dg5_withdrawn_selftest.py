#!/usr/bin/env python3
"""Withdrawn/UNSOUND written proofs (AMEND1-MATRIX review F7, FINAL-LIST-113.r6).

1. The loader refuses a proof whose key is on the data list, even when a definition is
   present (fixture module injected on sys.path).
2. The real proof table carries none of the withdrawn keys.
3. The data file is complete enough to act on: every entry names a row, a module and the
   ruling source, and no row is listed twice.
4. TOOLBATCH-AMEND1-FIX F6: a withdrawn key supplied through the runtime table -- an
   imported PROOFS, an alias mutation, or a helper-function mutation (the reviewer's
   probes 4c, 4d, 4e) -- refuses too, not only a definition the source parse can see.

Run: python3 -B scripts/pm_goal_dg5_withdrawn_selftest.py
"""
import json
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
DATA = ROOT / 'scripts/pm_goal_dg5_withdrawn_proofs.json'


def entries():
    data = json.loads(DATA.read_text())
    return data, data['keys']


def check_data(data, keys):
    assert keys, 'withdrawn list is empty'
    assert data.get('ruling'), data.get('ruling')
    rows = [entry['row'] for entry in keys]
    assert len(rows) == len(set(rows)), 'a row is listed twice'
    for entry in keys:
        assert entry.get('row') and entry.get('module') and entry.get('ruling'), entry


def check_fixture(keys):
    """A fixture definition for a withdrawn key loads on the old head, refuses on this one."""
    import pm_goal_dg5_justified as justified
    row = keys[0]['row']
    with tempfile.TemporaryDirectory(prefix='dg5-withdrawn-') as td:
        (Path(td) / 'pm_goal_dg5_proofs_cf.py').write_text(
            'PROOFS = {\n'
            '    %r: dict(kind=\'entailment\', families=[\'goal.updated\'], depends_on=[],\n'
            '            sites=[(\'scripts/pm_goal_test_storage.py\', 518)], argument=\'fixture\'),\n'
            '}\n' % row)
        sys.path.insert(0, td)
        try:
            try:
                table = justified.written_proofs()
            except SystemExit as error:
                message = str(error)
                assert row in message, message
                assert 'withdrawn' in message.lower() and keys[0]['ruling'] in message, message
            else:
                raise AssertionError(f'withdrawn key loaded instead of refused: {row} '
                                     f'(table keys {len(table)})')
        finally:
            sys.path.remove(td)
            sys.modules.pop('pm_goal_dg5_proofs_cf', None)


def check_runtime_bypass(keys):
    """The reviewer's probes 4c/4d/4e: each loaded the withdrawn key on 6822b99ec0
    because the forked loader checked only parsed key occurrences, not the runtime
    PROOFS table. Each must refuse on this head."""
    import pm_goal_dg5_justified as justified
    row = 'dg5/site/pm_goal_test_storage.py:440'
    assert any(entry['row'] == row for entry in keys), row
    proof = ('dict(kind=\'entailment\', families=[\'goal.updated\'], depends_on=[],\n'
             '         sites=[(\'scripts/pm_goal_test_storage.py\', 440)], argument=\'fixture\')')
    forms = {
        '4c_adv_alias_mutation': 'PROOFS = {}\n_alias = PROOFS\n_alias[%r] = %s\n' % (row, proof),
        '4d_adv_imported_proofs': 'from _helper_withdrawn import PROOFS\n',
        '4e_adv_helper_func_mutation': 'PROOFS = {}\ndef _fill(d):\n    d[%r] = %s\n_fill(PROOFS)\n' % (row, proof),
    }
    for tag, source in forms.items():
        with tempfile.TemporaryDirectory(prefix='dg5-withdrawn-') as td:
            (Path(td) / 'pm_goal_dg5_proofs_cf.py').write_text(source)
            if tag == '4d_adv_imported_proofs':
                (Path(td) / '_helper_withdrawn.py').write_text(
                    'PROOFS = {\n    %r: %s,\n}\n' % (row, proof))
            sys.path.insert(0, td)
            try:
                try:
                    table = justified.written_proofs()
                except SystemExit as error:
                    message = str(error)
                    assert row in message, (tag, message)
                    assert 'withdrawn' in message.lower(), (tag, message)
                else:
                    raise AssertionError(f'{tag}: withdrawn key loaded instead of refused: {row} '
                                         f'(table keys {len(table)}, has_440={row in table})')
            finally:
                sys.path.remove(td)
                sys.modules.pop('pm_goal_dg5_proofs_cf', None)
                sys.modules.pop('_helper_withdrawn', None)


def check_table(keys):
    import pm_goal_dg5_justified as justified
    table = justified.written_proofs()
    withdrawn = {entry['row'] for entry in keys}
    leaked = sorted(set(table) & withdrawn)
    assert not leaked, f'withdrawn keys in the loaded table: {leaked}'
    return len(table)


def main():
    data, keys = entries()
    check_data(data, keys)
    check_fixture(keys)
    check_runtime_bypass(keys)
    size = check_table(keys)
    print(f'pm_goal_dg5_withdrawn_selftest: PASS ({len(keys)} withdrawn keys, table {size})')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
