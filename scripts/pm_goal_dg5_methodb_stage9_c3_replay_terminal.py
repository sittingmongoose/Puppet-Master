"""Exercise C3/replay/original_terminal through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

from copy import deepcopy

import pm_goal_dg_ca3_cases as workflow
from pm_goal_dg_ca_oracles import Suite


def fixture(directory, negative):
    world, route = workflow.until(Suite(directory), "terminal_succeeded")
    route.terminal_succeeded()
    world.root = world.storage.root
    if negative:
        table = "goal_cancel_terminal_audit"
        key = route.key(table)
        cell = world.cell(table, key)
        record = dict(cell["value"]["record"], kind="unknown")
        world.write([world.put(table, key, dict(cell["value"], record=record), expected=cell["version"])])
    return world, route.replay, (deepcopy(route.request),), {}


if __name__ == "__main__":
    main({'c3-replay-terminal': ('scripts/pm_goal_dg_ca3_route.py', 1347, 'C3/replay/original_terminal', fixture)})
