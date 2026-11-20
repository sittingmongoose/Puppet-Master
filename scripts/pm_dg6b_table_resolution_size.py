"""DG6B guard table resolution_size: SP-337 resolution value limit.

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


def RZ01_resolution_limit(value, context):
    return 'resolution_value_too_large' if value['size'] > 16384 else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('RZ01_resolution_limit', g.Invariant('/value', 'the physical resolution value is at most 16384 canonical bytes'), 'resolution_value_too_large', RZ01_resolution_limit),
    ])

    def check(value):
        table.require('RZ01_resolution_limit', value, context)
        return True
    return g.Case(table, check, context)
