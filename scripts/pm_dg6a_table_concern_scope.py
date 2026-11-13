"""DG6A guard table concern_scope: a concern checkpoint's project partition derivation.

Method B guard rows (scripts/pm_guard_isolation.py) for the scope tail of
scripts/pm-concern-created-contracts-check.py::checkpoint_errors, after the
shared alert checkpoint guard passes. The checker derives whether
scope_partition is exactly the project-derived partition; the predicate
reads only that observation. The shared schema/size/token/foreign-context
refusals ahead of this phase earn no credit from it.
"""
import pm_guard_isolation as g

FIELDS = ('scope_partition_exact',)


def CS01_scope_partition_exact(value, context):
    return 'Project checkpoint partition mismatch' if value['scope_partition_exact'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('CS01_scope_partition_exact', g.Invariant('/scope_partition_exact', 'scope_partition is exactly the partition derived from project_id'), 'Project checkpoint partition mismatch', CS01_scope_partition_exact),
    ])

    def check(value):
        table.require('CS01_scope_partition_exact', value, context)
        return True
    return g.Case(table, check, context)
