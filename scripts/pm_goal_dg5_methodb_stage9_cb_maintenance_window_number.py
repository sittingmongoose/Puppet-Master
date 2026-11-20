"""Exercise maintenance/epoch/numrule/integer_type through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

from pm_goal_dg5_methodb_stage9_cb_maintenance_restore_number import maintenance_fixture


def fixture(directory, negative):
    return maintenance_fixture(directory, negative, "maintenance_epoch", "maintenance_window")


if __name__ == "__main__":
    main({'cb-maintenance-window-number': ('scripts/pm_goal_dg_cb_owners.py', 1652, 'maintenance/epoch/numrule/integer_type', fixture)}, row='dg5/maintenance/epoch/number')
