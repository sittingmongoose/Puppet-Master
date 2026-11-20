#!/usr/bin/env python3
"""Original shared adapter calls on the current Goal started checker source."""

import argparse
from pathlib import Path

import pm_goal_dg5_methodb_stage7 as pilot
import pm_goal_dg_s_oracles as source
import pm_goal_guard_tables as tables

FAMILY = 'goal_run.started'
ADAPTERS = pilot.ADAPTERS
A = source.A


def start_world(directory):
    return source.ST.StartWorld(source.Suite(directory).tmp(), source.edition('v3')).build_owners()


def registry_role_type(directory, negative):
    world = start_world(directory)
    owner = A.TestOwner(A.OwnerRegistry(), owner_id='TEST_ONLY:stage7-new-owner')
    role = '' if negative else owner.role
    return world, world.registry.register, (owner, role), {}


def registry_duplicate(directory, negative):
    world = start_world(directory)
    owner = world.owners['native']
    if not negative:
        owner = A.TestOwner(A.OwnerRegistry(), owner_id='TEST_ONLY:stage7-new-owner')
    return world, world.registry.register, (owner, owner.role), {}


CASES = {
    'registry-duplicate': (ADAPTERS, 322, 'registry/duplicate_id', registry_duplicate),
    'registry-role-type': (ADAPTERS, 321, 'registry/role_type', registry_role_type),
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
