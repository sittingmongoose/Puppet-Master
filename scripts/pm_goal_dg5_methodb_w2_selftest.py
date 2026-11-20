#!/usr/bin/env python3
"""Check that the Goal started row runner refuses incomplete validation evidence."""
import argparse
import json
from pathlib import Path
import subprocess
import sys

from pm_goal_dg5_methodb_w2 import require, stage, write


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('matrix', 'reference', 'case', 'enabled', 'out'):
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    case = json.loads(args.case.read_bytes())
    row = case['row']
    enabled = json.loads((args.enabled / 'result.json').read_bytes())
    require(enabled['row'] == row and enabled['status'] == 'READY_FOR_MATRIX',
            'the enabled example must have passed for the same row')
    args.out.mkdir(parents=True)
    shortened = args.out / 'missing-root-case.json'
    write(shortened, dict(case, fixtures=case['fixtures'][:-1]))
    trials = {
        'row': 'complete-call validity check failed',
        'clause': 'individual rule disable or restoration failed',
        'inventory': 'exact rule inventory differs from the fresh walk',
        'missing-root': 'declaration omits or repeats an exact root',
    }
    script = Path(__file__).with_name('pm_goal_dg5_methodb_w2.py')
    results = []
    for label, expected in trials.items():
        out = args.out / label
        case_path = str(shortened if label == 'missing-root' else args.case)
        command = [sys.executable, '-B', str(script), '--matrix', str(args.matrix), '--reference', str(args.reference),
                   '--case', case_path, '--out', str(out)]
        if label != 'missing-root':
            command.extend(('--disable', label))
        proc = subprocess.run(command, capture_output=True, text=True)
        (args.out / f'{label}.log').write_text(proc.stdout + proc.stderr)
        result = out / stage.sweep.table_id([row]) / 'result.json'
        if label == 'missing-root':
            detail = proc.stderr
            status = 'NOT_COVERED' if not result.exists() else 'UNEXPECTED_REPORT'
        else:
            report = json.loads(result.read_bytes())
            detail, status = report.get('reason', ''), report['status']
        passed = proc.returncode == 1 and status == 'NOT_COVERED' and expected in detail
        results.append(dict(trial=label, expected=expected, exit_code=proc.returncode, detail=detail,
                            caught=passed))
        print(label, 'refused' if passed else 'unexpected verdict', flush=True)
    write(args.out / 'selftests.json', results)
    require(all(result['caught'] for result in results), 'an incomplete proof got through')


if __name__ == '__main__':
    main()
