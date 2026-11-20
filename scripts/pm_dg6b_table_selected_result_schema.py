"""DG6B guard table selected_result_schema: Schema occurrence: the persona.select owner result.

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


def SR01_selected_result(value, context):
    return 'selected_result_schema' if value['errors'] != 0 else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('SR01_selected_result', g.Invariant('/errors', 'the selection result passes persona_select_result_v2'), 'selected_result_schema', SR01_selected_result),
    ])

    def check(value):
        table.require('SR01_selected_result', value, context)
        return True
    return g.Case(table, check, context)
