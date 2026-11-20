"""DG6B guard table resolution_source: Recovered resolution equals the frozen source resolution.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('logical_digest', 'expected_digest')


def RJ01_resolution_source(value, context):
    return 'resolution_source_join' if value['logical_digest'] != value['expected_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('RJ01_resolution_source', g.Invariant('/logical', 'equals the source resolution (exact typed bytes)'), 'resolution_source_join', RJ01_resolution_source),
    ])

    def check(value):
        table.require('RJ01_resolution_source', value, context)
        return True
    return g.Case(table, check, context)
