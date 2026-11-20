"""Exercise lease/revision/numrule/integer_type through the original lease caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

import pm_goal_dg_ca_c4_cases as assignment
from pm_goal_dg_ca_assignment import LEASE_TABLE
from pm_goal_dg_ca_oracles import Suite


def fixture(directory, negative):
    world, route = assignment.until(Suite(directory), "reserve_append_assignment")
    storage = world.storage
    world.root = storage.root
    lease = storage.ensure_lease(0)
    key = storage.lease_key()
    if negative:
        cell = world.cell(LEASE_TABLE, key)
        changed = dict(lease["record"], lease_revision=float(lease["record"]["lease_revision"]))
        world.write([world.put(LEASE_TABLE, key, dict(lease, record=changed), expected=cell["version"])])
    sequence = lease["record"]["current_lease"]["last_sequence_id"] + 1
    return world, storage.ensure_lease, (sequence,), {}


if __name__ == "__main__":
    main({'lease-revision': ('scripts/pm_goal_dg_ca_assignment.py', 125, 'lease/revision/numrule/integer_type', fixture)}, row='dg5/lease/revision/number')
