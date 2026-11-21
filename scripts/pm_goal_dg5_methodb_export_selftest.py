#!/usr/bin/env python3
"""Unit trials of the Method B export's origin rules and source check (DG5 addenda 6 and 8).

Real exceptions through real frames. Generated modules in a temporary folder: an owner-like module (validation
site and validator raise) and a Method B harness module (file name prefix pm_goal_dg5_methodb_) with observers.
The own-guard check is the stock one (pm_goal_dg5_boundaries.row_code_check) on a non-site (schema) row.

  listed_observer          site -> listed pure observer -> owner raise: own (the observer is transparent)
  unlisted_observer        the same pass-through observer, not on PURE_OBSERVERS: not own (fails closed)
  editing_observer         an observer that writes the document before calling the validator, even if its name is
                           'observe': not own (review REAL 1)
  changed_observer         a listed observer whose source changed after listing (new sha256): not own
  raw_origin_opaque        the listed case with bridge.refusal_origin alone: not own
  harness_raise_opaque     the observer raises the refusal itself: not own, raised_in_harness
  no_export_no_state       a trial record without the export: after_state() None
  export_fields            an exported record carries store digest, owner state ('not requested') and sites
  source_clean             fixed_judge_source on declared + the 13 judge files, clean tree: accepted
  source_phase_table       ... plus an untracked pm_goal_dg5_methodb_pilot_phase_<16 hex>.py: accepted
  source_untracked_py      ... plus any other untracked .py: stopped (review tool note 3)
  source_dirty_owner       ... plus an uncommitted edit to an owner file: stopped (review tool note 3)

Usage: python3 -B scripts/pm_goal_dg5_methodb_export_selftest.py --out RESULT.json
"""
import argparse
import importlib.util
import json
from pathlib import Path
import subprocess
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
        return owner.validate(value)        # a pass-through observer

    def other_observe(value):
        return owner.validate(value)        # the same, never listed

    def editing(value):
        def observe(value):
            value['extra'] = 1              # writes the defect into the owner's document
            return owner.validate(value)
        return observe(value)

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


def refusal(owner, observer, value=None):
    owner.VALIDATE[0] = observer
    try:
        owner.site({'extra': 1} if value is None else value)
    except owner.Refusal as error:
        return error
    raise AssertionError('no refusal')


def judged(error, site):
    origin = export.origin(error, error.code, sites=[site])
    return origin, bridge.row_code_check(ROW, error.code, origin, [(ROW, list(site))])


def source_trials(folder):
    """fixed_judge_source on a throwaway repository: declared commit, then the 13 judge files at their pins."""
    rows = []
    repo = folder / 'source'
    git = lambda *a: subprocess.run(['git', '-C', str(repo), *a], check=True, capture_output=True, text=True).stdout
    repo.mkdir()
    git('init', '-q')
    git('config', 'user.email', 'selftest@example.invalid')
    git('config', 'user.name', 'selftest')
    (repo / 'scripts').mkdir()
    (repo / 'scripts' / 'pm_goal_dg_selftest_owner.py').write_text('X = 1\n')
    for path in export.JUDGE_FIX:
        (repo / path).parent.mkdir(parents=True, exist_ok=True)
        (repo / path).write_text('old judge\n')
    git('add', '-A')
    git('commit', '-q', '-m', 'declared')
    declared = git('rev-parse', 'HEAD').strip()
    stock = subprocess.run(['git', '-C', str(bridge.ROOT), 'cat-file', '-e', export.STOCK_JUDGE], capture_output=True)
    if stock.returncode:
        return [dict(case='source_trials', passed=False, why='the stock judge commit is not in this repository')]
    for path in export.JUDGE_FIX:
        (repo / path).write_bytes(subprocess.check_output(['git', '-C', str(bridge.ROOT), 'show',
                                                           export.STOCK_JUDGE + ':' + path]))
    git('add', '-A')
    git('commit', '-q', '-m', 'the fixed judge')

    def attempt(name, expect_ok):
        try:
            export.fixed_judge_source(repo, declared)
            ok, why = True, None
        except ValueError as error:
            ok, why = False, str(error)[-200:]
        rows.append(dict(case=name, accepted=ok, why=why, passed=ok == expect_ok))

    attempt('source_clean', True)
    (repo / 'scripts' / 'pm_goal_dg5_methodb_pilot_phase_0123456789abcdef.py').write_text('TABLE = 1\n')
    attempt('source_phase_table', True)
    extra = repo / 'scripts' / 'pm_goal_dg5_methodb_planted.py'
    extra.write_text('PLANTED = 1\n')
    attempt('source_untracked_py', False)
    extra.rename(folder / 'planted.py.moved')
    (repo / 'scripts' / 'pm_goal_dg_selftest_owner.py').write_text('X = 2\n')
    attempt('source_dirty_owner', False)
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    folder = Path(tempfile.mkdtemp(prefix='dg5-export-selftest-'))
    owner, owner_path = load(folder, 'selftest_export_owner', OWNER)
    harness, _ = load(folder, 'pm_goal_dg5_methodb_selftest_harness', HARNESS)
    site_line = next(n for n, t in enumerate(OWNER.splitlines(), 1) if 'validation site' in t)
    site = (str(owner_path.resolve()), site_line)
    key = (Path(harness.observe.__code__.co_filename).name, harness.observe.__code__.co_qualname,
           export._source_sha256(harness.observe.__code__))
    saved = dict(export.PURE_OBSERVERS)
    export.PURE_OBSERVERS[key] = 'selftest: pass-through observer'
    editing_inner = [c for c in harness.editing.__code__.co_consts if hasattr(c, 'co_qualname')][0]
    export.PURE_OBSERVERS[(Path(editing_inner.co_filename).name, 'observe',
                           export._source_sha256(editing_inner))] = 'selftest: a name match must not be enough'
    rows = []
    try:
        error = refusal(owner, harness.observe)
        origin, check = judged(error, site)
        rows.append(dict(case='listed_observer', passed=check['own'] is True and origin['harness_frames'] == 1,
                         check=check))
        raw = bridge.refusal_origin(error, error.code)
        rows.append(dict(case='raw_origin_opaque', passed=bridge.row_code_check(ROW, error.code, raw,
                                                                                [(ROW, list(site))])['own'] is False))
        error = refusal(owner, harness.other_observe)
        origin, check = judged(error, site)
        rows.append(dict(case='unlisted_observer', passed=check['own'] is False and origin['opaque_harness_frames'],
                         check=check))
        error = refusal(owner, harness.editing, value={})
        origin, check = judged(error, site)
        rows.append(dict(case='editing_observer', passed=check['own'] is False, check=check,
                         note='the inner writing observe is listed by qualname "observe" with a different module '
                              'qualname (editing.<locals>.observe), and the outer editing frame is unlisted'))
        export.PURE_OBSERVERS.pop(key)
        export.PURE_OBSERVERS[(key[0], key[1], '0' * 64)] = 'selftest: the listed source is not this source'
        error = refusal(owner, harness.observe)
        origin, check = judged(error, site)
        rows.append(dict(case='changed_observer', passed=check['own'] is False, check=check))
        export.PURE_OBSERVERS[key] = 'selftest: pass-through observer'
        error = refusal(owner, harness.observe_and_raise)
        origin, check = judged(error, site)
        rows.append(dict(case='harness_raise_opaque', passed=check['own'] is False and origin['raised_in_harness'],
                         check=check))
        bare = export.evaluate_result(dict(code='x', errors=[ROW]), [ROW])
        rows.append(dict(case='no_export_no_state', passed=sweep.after_state(bare) is None and 'refusal_code' not in bare))
        record = dict(code='x', observations=[dict(site=list(site), errors=[1])])
        export.export(record, after=[['storage/x', 'ab', 1]], family='goal_run.started', world=object(),
                      refusing_sites=[(ROW, site)])
        result = export.evaluate_result(record, [ROW])
        state = sweep.after_state(result)
        rows.append(dict(case='export_fields', passed=bool(state) and state['store_sha256'] ==
                         sweep.digest([['storage/x', 'ab', 1]]) and state['owner_reason'] == 'not requested' and
                         result['refusing_sites'] == [(ROW, list(site))]))
        rows += source_trials(folder)
    finally:
        export.PURE_OBSERVERS.clear()
        export.PURE_OBSERVERS.update(saved)
    status = 'pass' if all(r['passed'] for r in rows) else 'fail'
    args.out.write_text(json.dumps(dict(status=status, cases=rows), indent=1, default=str) + '\n')
    for r in rows:
        print('PASS' if r['passed'] else 'FAIL', r['case'], (r.get('check') or {}).get('why') or r.get('why') or '')
    print(status)
    return 0 if status == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
