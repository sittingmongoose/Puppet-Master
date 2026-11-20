"""Exercise C3/replay/operation through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

from copy import deepcopy

import pm_goal_dg_ca3_cases as workflow
from pm_goal_dg_ca_oracles import Suite
from pm_goal_dg_ca_owners import uid


def fixture(directory, negative):
    world, route = workflow.until(Suite(directory), "terminal_succeeded")
    route.terminal_succeeded()
    world.root = world.storage.root
    if negative:
        accept = world.sir.accept

        def read_other_operation(request):
            handle, accepted = accept(request)
            result = deepcopy(accepted)
            result["identity"]["operation_id"] = uid("TEST_ONLY:stage9-other-operation")
            return handle, result

        world.sir.accept = read_other_operation
    return world, route.replay, (deepcopy(route.request),), {}


if __name__ == "__main__":
    main({'c3-replay-operation': ('scripts/pm_goal_dg_ca3_route.py', 1344, 'C3/replay/operation', fixture)})
