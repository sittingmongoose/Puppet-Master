"""Exercise M/capture/workflow_join through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main
from pm_goal_dg_ca_owners import sha, short_id
from pm_goal_dg_cb_migration import migration_world, selector
from pm_goal_dg_cb_owners import ORIGINS, decode_physical, legacy_goal, origin_key, physical, store_form


def fixture(directory, negative):
    world = migration_world(directory)
    scope = legacy_goal(world)
    run_id = world.workflows.attach(scope)
    world.root = world.storage.root
    if negative:
        family = "workflow_goal_run_control"
        key = world.workflows.keys(scope, run_id)["control"]
        cell = world.cell(family, key)
        codec, raw, record = decode_physical(cell["value"], "stage9/workflow")
        original_origin = world.cell(ORIGINS, origin_key(family, key, sha(raw)))["value"]
        record["record"]["identity"]["goal_id"] = short_id("goal")
        updated = store_form(record, codec)
        digest = sha(physical(updated)[1])
        changed_origin = dict(original_origin, issued_physical_sha256=digest)
        world.write([
            world.put(family, key, updated, expected=cell["version"]),
            world.put(ORIGINS, origin_key(family, key, digest), changed_origin),
        ])
    # Use the original recapture path with the same migration's exclusion held.
    # The refusal then keeps the starting bytes, including the existing exclusion.
    target = selector(scope)
    world.coordinator.acquire_exclusion(scope, target["migration_id"])
    return world, world.coordinator.capture, (target,), {}


if __name__ == "__main__":
    main({'cb-workflow-identity': ('scripts/pm_goal_dg_cb_migration.py', 510, 'M/capture/workflow_join', fixture)})
