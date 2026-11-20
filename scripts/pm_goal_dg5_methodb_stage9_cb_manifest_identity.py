"""Exercise M/read_result/manifest_identity through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main
from pm_goal_dg5_methodb_stage9_cb_blocked_unpublished import fixture as blocked_result
from pm_goal_dg_ca_owners import short_id
from pm_goal_dg_cb_migration import PART


def change_first_part(directory, negative, change):
    world, read, args, kwargs = blocked_result(directory, False)
    selector, = args
    if negative:
        scope = world.coordinator.scope_of(selector)
        key, part = world.coordinator.manifest_parts_of(scope, selector["migration_id"])[0]
        cell = world.cell(PART, key)
        world.write([world.put(PART, key, change(part), expected=cell["version"])])
    return world, read, args, kwargs


def fixture(directory, negative):
    return change_first_part(directory, negative,
                             lambda part: dict(part, scope=dict(part["scope"], goal_id=short_id("goal"))))


if __name__ == "__main__":
    main({'cb-manifest-identity': ('scripts/pm_goal_dg_cb_migration.py', 840, 'M/read_result/manifest_identity', fixture)})
