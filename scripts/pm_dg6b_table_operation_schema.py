"""DG6B guard table operation_schema: Schema occurrence: the physical operation value.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('errors',)


def OP01_operation(value, context):
    return 'operation_schema' if value['errors'] != 0 else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('OP01_operation', g.Invariant('/errors', 'the physical operation value passes <family>_operation'), 'operation_schema', OP01_operation),
    ])

    def check(value):
        table.require('OP01_operation', value, context)
        return True
    return g.Case(table, check, context)
