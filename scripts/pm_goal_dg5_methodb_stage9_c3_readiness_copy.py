"""Exercise C3/latch_and_reserve/readiness_custody through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

import pm_goal_dg_ca3_cases as workflow
from pm_goal_dg_ca_oracles import Suite


def fixture(directory, negative):
    world, route = workflow.until(Suite(directory), "latch_and_reserve")
    world.root = world.storage.root
    if negative:
        original = route.readiness["goal_argument_sha256"]
        first = "1" if original[0] == "0" else "0"
        route.readiness = dict(route.readiness, goal_argument_sha256=first + original[1:])
    return world, route.latch_and_reserve, (), {}


if __name__ == "__main__":
    main({'c3-readiness-copy': ('scripts/pm_goal_dg_ca3_route.py', 639, 'C3/latch_and_reserve/readiness_custody', fixture)})
