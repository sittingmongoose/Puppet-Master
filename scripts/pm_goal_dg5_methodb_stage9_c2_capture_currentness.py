"""Exercise C2/capture_source/expected_currentness through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

from pm_goal_dg_ca_assignment import assigned_world
from pm_goal_dg_ca_c2 import BoundPlanCancel


def fixture(directory, negative):
    world = assigned_world(directory)
    route = BoundPlanCancel(world, state="active")
    request = route.user_request()
    if negative:
        current = request["expected_currentness_hash"]
        request["expected_currentness_hash"] = ("1" if current[0] == "0" else "0") + current[1:]
    route.dispatch(request)
    world.root = world.storage.root
    return world, route.capture_source, (), {}


if __name__ == "__main__":
    main({'c2-capture-currentness': ('scripts/pm_goal_dg_ca_c2.py', 582, 'C2/capture_source/expected_currentness', fixture)})
