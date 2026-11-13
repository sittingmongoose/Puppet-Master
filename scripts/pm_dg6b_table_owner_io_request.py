"""DG6B guard table owner_io_request: Schema occurrence: the Persona owner request.

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


def OQ01_owner_request(value, context):
    return 'source_io_schema' if value['errors'] != 0 else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('OQ01_owner_request', g.Invariant('/errors', 'the owner request passes its persona_<verb>_request_v2 schema'), 'source_io_schema', OQ01_owner_request),
    ])

    def check(value):
        table.require('OQ01_owner_request', value, context)
        return True
    return g.Case(table, check, context)
