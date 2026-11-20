"""Exercise maintenance/restore_epoch/numrule/integer_type through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

from pm_goal_dg_cb_migration import migration_world
from pm_goal_dg_cb_owners import MAINTENANCE


def maintenance_fixture(directory, negative, field, method):
    world = migration_world(directory)
    world.root = world.storage.root
    if negative:
        key = world.maintenance.key()
        cell = world.cell(MAINTENANCE, key)
        state = dict(cell["value"])
        state[field] = float(state[field])
        world.write([world.put(MAINTENANCE, key, state, expected=cell["version"])])
    return world, getattr(world.maintenance, method), (), {}


def fixture(directory, negative):
    return maintenance_fixture(directory, negative, "restore_epoch", "restore")


if __name__ == "__main__":
    main({'cb-maintenance-restore-number': ('scripts/pm_goal_dg_cb_owners.py', 1648, 'maintenance/restore_epoch/numrule/integer_type', fixture)}, row='dg5/maintenance/restore_epoch/number')
