"""Exercise M/capture/domain_withdrawn through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main
from pm_goal_dg_ca_owners import uid
from pm_goal_dg_cb_c5_cases import run
from pm_goal_dg_cb_migration import migration_world, selector
from pm_goal_dg_cb_owners import legacy_goal


def fixture(directory, negative):
    world = migration_world(directory)
    first = legacy_goal(world)
    run(world, first)
    second = legacy_goal(world)
    world.root = world.storage.root
    if negative:
        cutoff = world.binding.cutoff_write(uid("TEST_ONLY:stage9-withdrawal"), uid("TEST_ONLY:stage9-migration"))
        world.write([cutoff])
    # Use the original recapture path with the same migration's exclusion held.
    # The refusal then keeps the starting bytes, including the existing exclusion.
    target = selector(second)
    world.coordinator.acquire_exclusion(second, target["migration_id"])
    return world, world.coordinator.capture, (target,), {}


if __name__ == "__main__":
    main({'cb-writer-domain': ('scripts/pm_goal_dg_cb_migration.py', 313, 'M/capture/domain_withdrawn', fixture)})
