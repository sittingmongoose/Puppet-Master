"""DG6B guard table adapter_resolved: Schema occurrence: the closed resolved payload adapter.

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


def AR01_resolved_adapter(value, context):
    return 'adapter_schema' if value['errors'] != 0 else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('AR01_resolved_adapter', g.Invariant('/errors', 'the closed resolved payload adapter reports no error'), 'adapter_schema', AR01_resolved_adapter),
    ])

    def check(value):
        table.require('AR01_resolved_adapter', value, context)
        return True
    return g.Case(table, check, context)
