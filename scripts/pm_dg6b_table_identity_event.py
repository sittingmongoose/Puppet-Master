"""DG6B guard table identity_event: Event ID recomputed from the family identity recipe.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('event_id', 'expected_event_id')


def ID01_event_id(value, context):
    return 'identity' if value['event_id'] != value['expected_event_id'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('ID01_event_id', g.Invariant('/event_id', 'equals the recomputed family event_id'), 'identity', ID01_event_id),
    ])

    def check(value):
        table.require('ID01_event_id', value, context)
        return True
    return g.Case(table, check, context)
