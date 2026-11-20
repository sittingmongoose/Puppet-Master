#!/usr/bin/env python3
"""Original Goal started checker fixtures for selected batch 10 rows."""
import argparse
from pathlib import Path

import pm_goal_dg_s_oracles as source
import pm_goal_dg5_methodb_stage7 as pilot
import pm_goal_guard_sweep as sweep
import pm_goal_guard_tables as tables

FAMILY = 'goal_run.started'
READERS = 'scripts/pm_goal_dg_s_readers.py'
START = 'scripts/pm_goal_dg_s_start.py'
WORLD = 'scripts/pm_goal_dg_s_world.py'
S = source.S
W = source.W
R = source.R


def selector(directory, negative):
    suite = source.Suite(directory)
    world, handles = source.new_world(suite)
    acquired, _ = world.start.acquire_all(handles)
    selected = acquired['d01_current']['workflow']['head']['current_body']
    if negative:
        selected = dict(selected, stage7_extra='x')
    return world, W.resolve_selector, (world.storage, selected, 'start/d01_head_body'), {}


CASES = {
    'selector': (WORLD, 458, 'start/d01_head_body/selector_type', selector),
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('case', choices=CASES)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--leave-enabled', action='store_true')
    args = parser.parse_args()
    pilot.run(args.case, args.out.resolve(), leave_enabled=args.leave_enabled, cases=CASES, family=FAMILY)


if __name__ == '__main__':
    main()
