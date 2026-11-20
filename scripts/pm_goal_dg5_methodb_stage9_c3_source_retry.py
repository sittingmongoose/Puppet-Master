"""Exercise C3/capture_source/retry_conflict through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

from copy import deepcopy

import pm_goal_dg_ca3_cases as workflow
from pm_goal_dg_ca_oracles import Suite


def fixture(directory, negative):
    world, route = workflow.until(Suite(directory), "prepare")
    world.root = world.storage.root
    if negative:
        table = "goal_cancel_source_audit"
        key = route.key(table)
        cell = world.cell(table, key)
        stored = deepcopy(cell["value"])
        stored["record"]["request"]["expected_revision"] += 1
        world.write([world.put(table, key, stored, expected=cell["version"])])
    return world, route.capture_source, (), {}


if __name__ == "__main__":
    main({'c3-source-retry': ('scripts/pm_goal_dg_ca3_route.py', 382, 'C3/capture_source/retry_conflict', fixture)})
