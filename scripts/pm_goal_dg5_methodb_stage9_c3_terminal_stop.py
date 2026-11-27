"""Exercise C3/terminal_unsettled/no_effect_stop_unchanged through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

import pm_goal_dg_ca3_cases as workflow
from pm_goal_dg_ca_oracles import Suite


def fixture(directory, negative):
    world, route = workflow.until(Suite(directory), "prepare")
    world.root = world.storage.root
    if negative:
        # An original Stop after capture changes the saved owner observation.
        world.host_stop.manual(route.scope, "stop")
    world.permissions.revoke(route.cancel_decision)
    return world, route.terminal_unsettled, ("no_effect",), {}


if __name__ == "__main__":
    main({'c3-terminal-stop': ('scripts/pm_goal_dg_ca3_route.py', 1300, 'C3/terminal_unsettled/no_effect_stop_unchanged', fixture)})
