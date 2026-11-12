"""DG6B guard table payload_types: Schema occurrence: the family payload type shape at relational helpers.

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


def PT01_payload_types(value, context):
    return 'payload_types' if value['errors'] != 0 else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('PT01_payload_types', g.Invariant('/errors', 'the family payload type shape reports no error'), 'payload_types', PT01_payload_types),
    ])

    def check(value):
        table.require('PT01_payload_types', value, context)
        return True
    return g.Case(table, check, context)
