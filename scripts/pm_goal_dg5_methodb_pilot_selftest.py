#!/usr/bin/env python3
"""Acceptance checks and fault injection for the two-row Method B pilot."""
import argparse
import json
from pathlib import Path
import subprocess
import sys

from pm_goal_dg5_methodb_pilot import PRODUCER, REQUEST

TRIALS = (
    ('request', 'request-row', 'exact complete-call verdict failed'),
    ('producer', 'producer-row', 'exact complete-call verdict failed'),
    ('request', 'clause-cut', 'own clause cut/restoration failed'),
    ('request', 'inventory', 'inventory drift'),
    ('producer', 'producer-forwarding', 'producer forwarding premise changed'),
)


def require(condition, reason):
    if not condition:
        raise SystemExit(reason)


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--matrix', required=True, type=Path)
    cli.add_argument('--verified', required=True, type=Path, help='output of the enabled two-row run')
    cli.add_argument('--out', required=True, type=Path)
    args = cli.parse_args()
    enabled = json.loads((args.verified / 'summary.json').read_text())
    gates = json.loads((args.verified / 'proof/tables/summary.json').read_text())
    require(enabled['results'][REQUEST]['status'] == 'CLOSED' and
            enabled['results'][PRODUCER]['status'] == 'OPEN' and
            {tuple(table['proved']) for table in gates if table['status'] == 'PASS'} == {(REQUEST,), (PRODUCER,)},
            'enabled proof did not reach the expected real checker outcomes')
    args.out.mkdir(parents=True)
    script = Path(__file__).with_name('pm_goal_dg5_methodb_pilot.py')
    records = []
    for row, disabled, expected in TRIALS:
        command = [sys.executable, '-B', str(script), '--matrix', str(args.matrix),
                   '--out', str(args.out / disabled), '--only', row, '--disable', disabled]
        result = subprocess.run(command, capture_output=True, text=True)
        (args.out / (disabled + '.log')).write_text(result.stdout + result.stderr)
        refused = result.returncode == 1 and expected in result.stderr
        records.append(dict(row=row, disabled=disabled, expected=expected, returncode=result.returncode,
                            refused=refused))
        print(f'{disabled}: {"refused" if refused else "unexpected verdict"}', flush=True)
    (args.out / 'selftests.json').write_text(json.dumps(records, indent=2) + '\n')
    require(all(trial['refused'] for trial in records), 'a disabled proof survived')


if __name__ == '__main__':
    main()
