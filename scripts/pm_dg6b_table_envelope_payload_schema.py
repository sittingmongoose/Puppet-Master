"""DG6B guard table envelope_payload_schema: Schema occurrence: the inline EventRecord payload body.

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


def EP01_envelope_payload(value, context):
    return 'payload_schema' if value['errors'] != 0 else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('EP01_envelope_payload', g.Invariant('/errors', 'the inline envelope payload passes the family payload schema'), 'payload_schema', EP01_envelope_payload),
    ])

    def check(value):
        table.require('EP01_envelope_payload', value, context)
        return True
    return g.Case(table, check, context)
