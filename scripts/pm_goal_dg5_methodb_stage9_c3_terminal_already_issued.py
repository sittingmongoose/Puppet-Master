"""Exercise C3/terminal_succeeded/already_issued through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

import pm_goal_dg_ca3_cases as workflow
from pm_goal_dg_ca_oracles import Suite
from pm_goal_dg5_methodb_stage9_c1_terminal_already_issued import retain_original_terminal_times


def fixture(directory, negative):
    world, route = workflow.until(Suite(directory), "terminal_succeeded")
    world.root = world.storage.root
    if negative:
        retain_original_terminal_times(world, route.terminal_succeeded)
    return world, route.terminal_succeeded, (), {}


if __name__ == "__main__":
    main({'c3-terminal-already-issued': ('scripts/pm_goal_dg_ca3_route.py', 1260, 'C3/terminal_succeeded/already_issued', fixture)})
