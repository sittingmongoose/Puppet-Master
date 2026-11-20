"""DG6B guard table checkpoint_schema: Schema occurrence: the durable read token.

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


def CK01_read_token(value, context):
    return 'checkpoint_schema' if value['errors'] != 0 else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('CK01_read_token', g.Invariant('/errors', 'the durable read token passes the live-only-free read_token schema'), 'checkpoint_schema', CK01_read_token),
    ])

    def check(value):
        table.require('CK01_read_token', value, context)
        return True
    return g.Case(table, check, context)
