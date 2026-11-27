"""Exercise C3/terminal_unsettled/phase through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

import pm_goal_dg_ca3_cases as workflow
from pm_goal_dg_ca_oracles import Suite
from pm_goal_dg_ca_owners import uid


def fixture(directory, negative):
    world, route = workflow.until(Suite(directory), "prepare")
    world.permissions.revoke(route.cancel_decision)
    world.root = world.storage.root
    if negative:
        # The original selected progress is intact. Only the cached copy differs.
        route.progress = dict(route.progress, resolution_owner_ref=uid("TEST_ONLY:detached-resolution-owner"))
    return world, route.terminal_unsettled, ("no_effect",), {}


if __name__ == "__main__":
    main({'c3-progress-copy': ('scripts/pm_goal_dg_ca3_route.py', 364, 'C3/terminal_unsettled/phase', fixture)})
