"""Exercise C3/freeze_event/scope_proof_settlement through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

from copy import deepcopy

import pm_goal_dg_ca3_cases as workflow
from pm_goal_dg_ca_oracles import Suite
from pm_goal_dg5_methodb_stage9_c3_stop_receipt_copy import store_selected_progress


def fixture(directory, negative):
    world, route = workflow.until(Suite(directory), "freeze_event")
    world.root = world.storage.root
    if negative:
        progress = deepcopy(route.progress)
        settlement = progress["owner_settlement"]
        original = settlement["original_scope_proof_sha256"]
        first = "1" if original[0] == "0" else "0"
        settlement["original_scope_proof_sha256"] = first + original[1:]
        store_selected_progress(world, route, progress)
    return world, route.freeze_event, (), {}


if __name__ == "__main__":
    main({'c3-settlement-proof-copy': ('scripts/pm_goal_dg_ca3_route.py', 900, 'C3/freeze_event/scope_proof_settlement', fixture)})
