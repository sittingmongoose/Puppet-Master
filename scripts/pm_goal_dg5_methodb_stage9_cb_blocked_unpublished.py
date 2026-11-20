"""Exercise M/read_result/blocked_unpublished through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main
from pm_goal_dg_cb_c5_cases import plan_bound, run
from pm_goal_dg_cb_migration import RESULT, migration_world
from pm_goal_dg_cb_owners import legacy_goal


def fixture(directory, negative):
    world = migration_world(directory)
    scope = legacy_goal(world)
    plan_bound(world, scope, schedules=0, consents=0)
    world.workflows.attach(scope)
    selector, _, result = run(world, scope)
    world.root = world.storage.root
    if result["disposition"] != "blocked_unresolved":
        raise ValueError("fixture failed to reach the original blocked result")
    if negative:
        migration_id = result["migration_id"]
        key = world.coordinator.result_key(scope, migration_id)
        member = world.coordinator.manifest_parts_of(scope, migration_id)[0][1]["members"][0]
        cell = world.cell(RESULT, key)
        stored = dict(cell["value"], published_members=[member])
        world.write([world.put(RESULT, key, stored, expected=cell["version"])])
    return world, world.coordinator.read_result, (selector,), {}


if __name__ == "__main__":
    main({'cb-blocked-unpublished': ('scripts/pm_goal_dg_cb_migration.py', 861, 'M/read_result/blocked_unpublished', fixture)})
