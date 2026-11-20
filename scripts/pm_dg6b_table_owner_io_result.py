"""DG6B guard table owner_io_result: Schema occurrence: the Persona owner result.

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


def OR01_owner_result(value, context):
    return 'source_io_schema' if value['errors'] != 0 else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('OR01_owner_result', g.Invariant('/errors', 'the owner result passes its persona_<verb>_result_v2 schema'), 'source_io_schema', OR01_owner_result),
    ])

    def check(value):
        table.require('OR01_owner_result', value, context)
        return True
    return g.Case(table, check, context)
