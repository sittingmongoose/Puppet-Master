"""Exercise host_stop/manual_action through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

from pm_goal_dg_cb_migration import migration_world
from pm_goal_dg_cb_owners import legacy_goal


def fixture(directory, negative):
    world = migration_world(directory)
    scope = legacy_goal(world)
    world.host_stop.manual(scope, "stop")
    world.root = world.storage.root
    action = "birth" if negative else "resume"
    return world, world.host_stop.manual, (scope, action), {}


if __name__ == "__main__":
    main({'cb-host-manual-action': ('scripts/pm_goal_dg_cb_owners.py', 731, 'host_stop/manual_action', fixture)})
