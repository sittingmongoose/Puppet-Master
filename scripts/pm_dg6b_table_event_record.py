"""DG6B guard table event_record: Schema occurrence: the canonical EventRecord envelope.

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


def ER01_event_record(value, context):
    return 'event_record_schema' if value['errors'] != 0 else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('ER01_event_record', g.Invariant('/errors', 'Plans/event_record.schema.json reports no error'), 'event_record_schema', ER01_event_record),
    ])

    def check(value):
        table.require('ER01_event_record', value, context)
        return True
    return g.Case(table, check, context)
