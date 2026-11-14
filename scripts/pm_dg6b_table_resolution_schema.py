"""DG6B guard table resolution_schema: Schema occurrence: the frozen selection resolution.

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


def RS01_resolution(value, context):
    return 'resolution_schema' if value['errors'] != 0 else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('RS01_resolution', g.Invariant('/errors', 'the resolution passes persona_selected_resolution'), 'resolution_schema', RS01_resolution),
    ])

    def check(value):
        table.require('RS01_resolution', value, context)
        return True
    return g.Case(table, check, context)
