#!/usr/bin/env python3
"""Unit trials of the Method B export's origin rules (DG5 addendum 6).

Real exceptions through real frames: two generated modules in a temporary folder, an owner-like module
(validation site and validator raise) and a Method B harness observer module (file name prefix
pm_goal_dg5_methodb_), and the stock own-guard check (pm_goal_dg5_boundaries.row_code_check) on a
non-site (schema) row.

  transparent_observer   owner site -> harness observer -> owner raise: own True with the export's origin
                         (the observer frame is transparent), verified at the row's refusing site
  raw_origin_opaque      the same refusal with bridge.refusal_origin alone: own False (the observer frame
                         stops the walk), so the export's rule is what decides
  harness_raise_opaque   the observer raises the refusal itself (innermost frame is the harness): own False,
                         raised_in_harness True
  no_export_no_state     a trial record without the export gives no store_after_sha256: after_state() None
  export_fields          a record exported with export.export carries the store digest, the owner state
                         ('not requested' outside a judged trial) and the refusing sites, and evaluate_result
                         hands them to the collector's after_state()

Usage: python3 -B scripts/pm_goal_dg5_methodb_export_selftest.py --out RESULT.json
"""
import argparse
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import textwrap

import pm_goal_dg5_boundaries as bridge
import pm_goal_dg5_methodb_export as export
import pm_goal_guard_sweep as sweep

OWNER = textwrap.dedent('''
    class Refusal(Exception):
        def __init__(self, code):
            super().__init__(code)
            self.code = code

    VALIDATE = [None]

    def validate(value):
        if 'extra' in value:
            raise Refusal('selftest_export/doc/schema/:additionalProperties')
        return value

    def site(value):
        return VALIDATE[0](value)   # the owner's validation site (row dg5/selftest_export/doc/schema)
    ''')
HARNESS = textwrap.dedent('''
    import selftest_export_owner as owner

    def observe(value):
        return owner.validate(value)        # a pass-through observer, as the Method B harnesses patch in

    def observe_and_raise(value):
        raise owner.Refusal('selftest_export/doc/schema/:additionalProperties')
    ''')
ROW = 'dg5/selftest_export/doc/schema'


def load(folder, name, text):
    path = folder / (name + '.py')
    path.write_text(text)
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module, path


def refusal(owner, observer):
    owner.VALIDATE[0] = observer
    try:
        owner.site({'extra': 1})
    except owner.Refusal as error:
        return error
    raise AssertionError('no refusal')


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    folder = Path(tempfile.mkdtemp(prefix='dg5-export-selftest-'))
    owner, owner_path = load(folder, 'selftest_export_owner', OWNER)
    harness, _ = load(folder, 'pm_goal_dg5_methodb_selftest_harness', HARNESS)
    site_line = next(n for n, t in enumerate(OWNER.splitlines(), 1) if 'validation site' in t)
    sites = [(ROW, [str(owner_path.resolve()), site_line])]
    rows = []

    error = refusal(owner, harness.observe)
    code = error.code
    with_rule = export.origin(error, code)
    check = bridge.row_code_check(ROW, code, with_rule, sites)
    observer = [f for f in with_rule['frames'] if f[0].endswith('pm_goal_dg5_methodb_selftest_harness.py')]
    rows.append(dict(case='transparent_observer', passed=check['own'] is True and len(observer) == 1 and observer[0][4]
                     and not with_rule['raised_in_harness'], check=check))
    raw = bridge.refusal_origin(error, code)
    check = bridge.row_code_check(ROW, code, raw, sites)
    rows.append(dict(case='raw_origin_opaque', passed=check['own'] is False, check=check))

    error = refusal(owner, harness.observe_and_raise)
    origin = export.origin(error, error.code)
    check = bridge.row_code_check(ROW, error.code, origin, sites)
    raiser = origin['frames'][-1]
    rows.append(dict(case='harness_raise_opaque', passed=check['own'] is False and origin['raised_in_harness'] is True
                     and raiser[0].endswith('pm_goal_dg5_methodb_selftest_harness.py') and raiser[4] is False,
                     check=check))

    bare = export.evaluate_result(dict(code=code, errors=[ROW]), [ROW])
    rows.append(dict(case='no_export_no_state', passed=sweep.after_state(bare) is None and 'refusal_code' not in bare,
                     result=bare))

    record = dict(code=code, refusal_origin=with_rule, observations=[dict(site=sites[0][1], errors=[1])])
    export.export(record, after=[['storage/x', 'ab', 1]], family='goal_run.started', world=object(),
                  refusing_sites=[(ROW, tuple(sites[0][1]))])
    result = export.evaluate_result(record, [ROW])
    state = sweep.after_state(result)
    rows.append(dict(case='export_fields', passed=bool(state) and state['store_sha256'] == sweep.digest([['storage/x', 'ab', 1]])
                     and state['owner_reason'] == 'not requested' and result['refusal_code'] == code
                     and result['refusing_sites'] == [(ROW, sites[0][1])], result=result))

    status = 'pass' if all(r['passed'] for r in rows) else 'fail'
    args.out.write_text(json.dumps(dict(status=status, cases=rows), indent=1, default=str) + '\n')
    for r in rows:
        print('PASS' if r['passed'] else 'FAIL', r['case'])
    print(status)
    return 0 if status == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
