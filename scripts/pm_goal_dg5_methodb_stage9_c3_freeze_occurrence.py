"""Exercise C3/freeze_event/accepted_occurrence through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

from copy import deepcopy

import pm_goal_dg_ca3_cases as workflow
from pm_goal_dg_ca_oracles import Suite


def fixture(directory, negative):
    world, route = workflow.until(Suite(directory), "freeze_event")
    world.root = world.storage.root
    if negative:
        table = "goal_cancel_progress"
        epoch = route.progress["progress_epoch"]
        key = route.progress_key(epoch)
        head_key = route.key(table) + ":head"
        progress = deepcopy(route.progress)
        progress["cancellation_receipt"]["accepted_at"] = "1999-01-01T00:00:00.000Z"
        head = route._head(epoch, progress)
        world.write([
            world.put(table, key, route.wrap("StorageProgress", progress),
                      expected=world.cell(table, key)["version"]),
            world.put(table, head_key, route.wrap("StorageProgress", head),
                      expected=world.cell(table, head_key)["version"]),
        ])
        route.progress = progress
    return world, route.freeze_event, (), {}


if __name__ == "__main__":
    main({'c3-freeze-occurrence': ('scripts/pm_goal_dg_ca3_route.py', 918, 'C3/freeze_event/accepted_occurrence', fixture)})
