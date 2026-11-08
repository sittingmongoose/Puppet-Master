"""DG6A guard table panel_scope: a panel checkpoint's scope partition derivation.

Method B guard rows (scripts/pm_guard_isolation.py) for the scope tail of
scripts/pm-panel-event-contracts-check.py::checkpoint_errors, after the
shared alert checkpoint guard passes. The checker derives whether
scope_partition is exactly 'app' for a null project or the project-derived
partition otherwise; the predicate reads only that observation. The shared
schema/size/token/foreign-context refusals ahead of this phase earn no
credit from it.
"""
import pm_guard_isolation as g

FIELDS = ('scope_partition_exact',)


def PS01_scope_partition_exact(value, context):
    return 'checkpoint scope mismatch' if value['scope_partition_exact'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('PS01_scope_partition_exact', g.Invariant('/scope_partition_exact', 'scope_partition is exactly the partition derived from project_id'), 'checkpoint scope mismatch', PS01_scope_partition_exact),
    ])

    def check(value):
        table.require('PS01_scope_partition_exact', value, context)
        return True
    return g.Case(table, check, context)
