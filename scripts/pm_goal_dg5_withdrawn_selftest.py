#!/usr/bin/env python3
"""Withdrawn/UNSOUND written proofs (AMEND1-MATRIX review F7, FINAL-LIST-113.r6).

1. The loader refuses a proof whose key is on the data list, even when a definition is
   present (fixture module injected on sys.path).
2. The real proof table carries none of the withdrawn keys.
3. The data file is complete enough to act on: every entry names a row, a module and the
   ruling source, and no row is listed twice.

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
    size = check_table(keys)
    print(f'pm_goal_dg5_withdrawn_selftest: PASS ({len(keys)} withdrawn keys, table {size})')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
