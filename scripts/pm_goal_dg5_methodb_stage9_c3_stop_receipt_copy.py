"""Exercise C3/commit_receipt/stop_receipt_custody through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

from copy import deepcopy

import pm_goal_dg_ca3_cases as workflow
from pm_goal_dg_ca_oracles import Suite


def store_selected_progress(world, route, progress):
    table = "goal_cancel_progress"
    epoch = progress["progress_epoch"]
    key, head_key = route.progress_key(epoch), route.key(table) + ":head"
    world.write([
        world.put(table, key, route.wrap("StorageProgress", progress), expected=world.cell(table, key)["version"]),
        world.put(table, head_key, route.wrap("StorageProgress", route._head(epoch, progress)),
                  expected=world.cell(table, head_key)["version"]),
    ])
    route.progress = progress


def fixture(directory, negative):
    world, route = workflow.until(Suite(directory), "commit_receipt")
    world.root = world.storage.root
    if negative:
        progress = deepcopy(route.progress)
        progress["stop_receipt"]["committed_at"] = "1999-01-01T00:00:00.000Z"
        store_selected_progress(world, route, progress)
    return world, route.commit_receipt, (), {}


if __name__ == "__main__":
    main({'c3-stop-receipt-copy': ('scripts/pm_goal_dg_ca3_route.py', 742, 'C3/commit_receipt/stop_receipt_custody', fixture)})
