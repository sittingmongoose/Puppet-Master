"""Exercise M/read_result/manifest_unavailable through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main
from pm_goal_dg5_methodb_stage9_cb_blocked_unpublished import fixture as blocked_result
from pm_goal_dg_cb_migration import PART


def fixture(directory, negative):
    world, read, args, kwargs = blocked_result(directory, False)
    selector, = args
    if negative:
        scope = world.coordinator.scope_of(selector)
        parts = world.coordinator.manifest_parts_of(scope, selector["migration_id"])
        world.write([dict(table=PART, key=key, expected=world.cell(PART, key)["version"], delete=True)
                     for key, _ in parts])
    return world, read, args, kwargs


if __name__ == "__main__":
    main({'cb-manifest-unavailable': ('scripts/pm_goal_dg_cb_migration.py', 837, 'M/read_result/manifest_unavailable', fixture)})
