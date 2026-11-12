"""DG6B guard table operation_size: SP-337 physical operation value limit.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('size',)


def OV01_operation_limit(value, context):
    return 'operation_value_too_large' if value['size'] > 16384 else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('OV01_operation_limit', g.Invariant('/value', 'the physical operation value is at most 16384 canonical bytes'), 'operation_value_too_large', OV01_operation_limit),
    ])

    def check(value):
        table.require('OV01_operation_limit', value, context)
        return True
    return g.Case(table, check, context)
