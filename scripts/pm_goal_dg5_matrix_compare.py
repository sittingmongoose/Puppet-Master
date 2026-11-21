#!/usr/bin/env python3
"""Compare two DG5 coverage matrices of one proof directory, built at two source revisions (review (d)).

The matrix re-binds every cited source line to the working tree it runs in
(pm_goal_dg5_justified._bind reads the current file at the recorded line). A
ledger recorded at an older source, matrixed at a newer one, therefore quotes
whatever now sits at the recorded line of any file the newer revision edited.
This check accepts exactly that, and nothing else:

  allowed   the top-level `rule` text; the new per-row `closed_by` field and the
            family `closed_by` tally (KILLED_CODE apart, addendum 1); and, inside
            a row's `justification`, the `source` and `file_sha256` of a bound
            frame or site whose `path` is one of the --shifted files (by default
            scripts/pm_goal_dg5_boundaries.py, the bridge this branch edits),
            with its `path`, `line` and `function` unchanged
  refused   anything else: a status, reason, kill count, witness, cut,
            restoration, justification kind, dependency or any other field, or a
            row present in only one matrix

Every family's status tally must be equal. Exit 0 when only allowed
differences exist (they are listed as expected line-shift differences), 1
otherwise. Use it whenever a matrix built at this branch is compared with one
built before it.

Usage: python3 scripts/pm_goal_dg5_matrix_compare.py BEFORE.json AFTER.json [--shifted PATH ...] [--out REPORT.json]
       python3 scripts/pm_goal_dg5_matrix_compare.py --self-test
"""
import argparse
import copy
import json
from pathlib import Path
import sys

DEFAULT_SHIFTED = ('scripts/pm_goal_dg5_boundaries.py',)
BOUND_KEYS = ('source', 'file_sha256')


def _strip_shift(value, shifted, notes, where):
    """A copy of `value` with the allowed line-shift fields of bound shifted-file entries blanked."""
    if isinstance(value, dict):
        out = {}
        bound = value.get('path') in shifted and 'line' in value
        for key, item in value.items():
            if bound and key in BOUND_KEYS:
                out[key] = '<line-shift>'
                notes.append(dict(where=where + '/' + key, path=value['path'], line=value['line']))
                continue
            out[key] = _strip_shift(item, shifted, notes, where + '/' + str(key))
        return out
    if isinstance(value, list):
        return [_strip_shift(item, shifted, notes, f'{where}/{index}') for index, item in enumerate(value)]
    return value


def compare(before, after, shifted=DEFAULT_SHIFTED):
    shifted = set(shifted)
    refused, expected = [], []
    families = sorted(set(before.get('families', {})) | set(after.get('families', {})))
    for family in families:
        a, b = before['families'].get(family), after['families'].get(family)
        if a is None or b is None:
            refused.append(dict(family=family, what='family present in one matrix only'))
            continue
        if a.get('status') != b.get('status'):
            refused.append(dict(family=family, what='status tally moved', before=a.get('status'), after=b.get('status')))
        rows_a = {m['row']: m for m in a['matrix']}
        rows_b = {m['row']: m for m in b['matrix']}
        for name in sorted(set(rows_a) ^ set(rows_b)):
            refused.append(dict(family=family, row=name, what='row present in one matrix only'))
        for name in sorted(set(rows_a) & set(rows_b)):
            ra, rb = copy.deepcopy(rows_a[name]), copy.deepcopy(rows_b[name])
            rb.pop('closed_by', None)
            if ra == rb:
                continue
            notes_a, notes_b = [], []
            ja = _strip_shift(ra.pop('justification', None), shifted, notes_a, 'justification')
            jb = _strip_shift(rb.pop('justification', None), shifted, notes_b, 'justification')
            if ra != rb:
                keys = sorted(k for k in set(ra) | set(rb) if ra.get(k) != rb.get(k))
                refused.append(dict(family=family, row=name, what='row fields moved', fields=keys))
                continue
            if ja != jb:
                refused.append(dict(family=family, row=name, what='justification moved beyond a shifted-file quote'))
                continue
            positions_a = [(n['where'], n['path'], n['line']) for n in notes_a]
            positions_b = [(n['where'], n['path'], n['line']) for n in notes_b]
            if positions_a != positions_b:
                refused.append(dict(family=family, row=name, what='bound shifted-file positions differ'))
                continue
            expected.append(dict(family=family, row=name, status=rows_b[name]['status'],
                                 shifted=sorted({(n['path'], n['line']) for n in notes_b})))
    return dict(ok=not refused, refused=refused, expected_line_shift=expected,
                counts=dict(expected_line_shift=len(expected), refused=len(refused)))


def self_test():
    frame = dict(path='scripts/pm_goal_dg5_boundaries.py', line=830, function='evaluate', source='old', file_sha256='a')
    other = dict(path='scripts/pm_goal_test_storage.py', line=10, function='x', source='s', file_sha256='b')
    row = dict(row='r', status='CLOSED_BY_PROOF', reason='presence', kills={'CUT_EXCEPTION': 1},
               justification=dict(kind='presence', raising_frames=[other, frame]))
    base = dict(rule='old', families={'f': dict(status={'CLOSED_BY_PROOF': 1}, matrix=[row])})

    def variant(edit):
        out = copy.deepcopy(base)
        out['rule'] = 'new'
        out['families']['f']['matrix'][0]['closed_by'] = None
        edit(out['families']['f'])
        return out

    def shift(f):
        f['matrix'][0]['justification']['raising_frames'][1].update(source='new', file_sha256='c')

    def status(f):
        shift(f)
        f['matrix'][0]['status'] = 'OPEN'
        f['status'] = {'OPEN': 1}

    def kind(f):
        f['matrix'][0]['justification']['kind'] = 'entailment'

    def other_file(f):
        f['matrix'][0]['justification']['raising_frames'][0].update(source='moved')

    def moved_line(f):
        f['matrix'][0]['justification']['raising_frames'][1].update(line=831, source='new')

    cases = [('line_shift_only', shift, True), ('status_moves', status, False), ('kind_moves', kind, False),
             ('other_file_quote_moves', other_file, False), ('bound_line_moves', moved_line, False)]
    rows = []
    for name, edit, expected in cases:
        result = compare(base, variant(edit))
        rows.append(dict(case=name, expected_ok=expected, ok=result['ok'], passed=result['ok'] == expected))
    return dict(status='pass' if all(r['passed'] for r in rows) else 'fail', cases=rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('before', nargs='?', type=Path)
    parser.add_argument('after', nargs='?', type=Path)
    parser.add_argument('--shifted', action='append')
    parser.add_argument('--out', type=Path)
    parser.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    if args.self_test:
        report = self_test()
        print(json.dumps(report, indent=1))
        return 0 if report['status'] == 'pass' else 1
    report = compare(json.loads(args.before.read_text()), json.loads(args.after.read_text()),
                     tuple(args.shifted or DEFAULT_SHIFTED))
    report.update(before=str(args.before), after=str(args.after), shifted=list(args.shifted or DEFAULT_SHIFTED))
    if args.out:
        args.out.write_text(json.dumps(report, indent=1) + '\n')
    print(json.dumps(dict(ok=report['ok'], counts=report['counts'], refused=report['refused'][:10]), indent=1))
    return 0 if report['ok'] else 1


if __name__ == '__main__':
    sys.exit(main())
