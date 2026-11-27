"""Exercise M/read_result/result_identity through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main
from pm_goal_dg_ca_owners import short_id
from pm_goal_dg_cb_c5_cases import run
from pm_goal_dg_cb_migration import RESULT, migration_world
from pm_goal_dg_cb_owners import legacy_goal


def fixture(directory, negative):
    world = migration_world(directory)
    scope = legacy_goal(world)
    selector, _, result = run(world, scope)
    world.root = world.storage.root
    if negative:
        key = world.coordinator.result_key(scope, result["migration_id"])
        cell = world.cell(RESULT, key)
        stored = cell["value"]
        foreign_scope = dict(stored["scope"], goal_id=short_id("goal"))
        world.write([world.put(RESULT, key, dict(stored, scope=foreign_scope), expected=cell["version"])])
    return world, world.coordinator.read_result, (selector,), {}


if __name__ == "__main__":
    main({'cb-result-identity': ('scripts/pm_goal_dg_cb_migration.py', 834, 'M/read_result/result_identity', fixture)})
