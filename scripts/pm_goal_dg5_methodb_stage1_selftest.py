#!/usr/bin/env python3
"""The original reader proof must reject three deliberately incomplete runs."""
import argparse
import json
from pathlib import Path
import subprocess
import sys

from pm_goal_dg5_methodb_stage1 import require, sweep, write

TRIALS = {
    'row': 'complete-call validity check failed',
    'clause': 'individual rule cut/restoration failed',
    'inventory': 'exact rule coverage incomplete',
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--matrix', type=Path, required=True)
    parser.add_argument('--case', type=Path, required=True)
    parser.add_argument('--enabled', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    enabled = json.loads((args.enabled / 'result.json').read_bytes())
    require(enabled['status'] == 'READY_FOR_MATRIX', 'enabled reader example did not pass')
    row = json.loads(args.case.read_bytes())['row']
    require(row == enabled['row'], 'enabled example is from a different validation row')
    args.out.mkdir(parents=True)
    script = Path(__file__).with_name('pm_goal_dg5_methodb_stage1.py')
    outcomes = []
    for disabled, expected in TRIALS.items():
        output = args.out / disabled
        command = [sys.executable, '-B', str(script), '--matrix', str(args.matrix),
                   '--case', str(args.case), '--out', str(output), '--disable', disabled]
        run = subprocess.run(command, capture_output=True, text=True)
        (args.out / f'{disabled}.log').write_text(run.stdout + run.stderr)
        refusal = json.loads((output / sweep.table_id([row]) / 'result.json').read_bytes())
        okay = bool(run.returncode == 1 and refusal['status'] == 'NOT_COVERED' and expected in refusal['reason'])
        outcomes.append(dict(disabled=disabled, expected=expected, exit_code=run.returncode,
                             actual=refusal['reason'], refused=okay))
        print(f'{disabled}: {"refused" if okay else "unexpected verdict"}', flush=True)
    write(args.out / 'selftests.json', outcomes)
    require(all(trial['refused'] for trial in outcomes), 'a disabled check survived')


if __name__ == '__main__':
    main()
