"""Exercise d06/not_published through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

import pm_goal_dg_ca3_cases as workflow
from pm_goal_dg_ca_oracles import Suite


def fixture(directory, negative):
    world, route = workflow.until(Suite(directory), "terminal_succeeded")
    route.terminal_succeeded()
    world.root = world.storage.root
    if negative:
        route.wf_run["d06"]["phase"] = "prepared"
    return world, route.read_retained_success, (), {}


if __name__ == "__main__":
    main({'c3-retained-d06-phase': ('scripts/pm_goal_dg_ca3_native.py', 1105, 'd06/not_published', fixture)})
