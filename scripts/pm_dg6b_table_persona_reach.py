"""DG6B guard table persona_reach: Application-scope selection reach.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('reach_allows_no_project',)


def PX01_reach(value, context):
    return 'reach' if value['reach_allows_no_project'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('PX01_reach', g.Invariant('/reach_allows_no_project', 'is exactly True'), 'reach', PX01_reach),
    ])

    def check(value):
        table.require('PX01_reach', value, context)
        return True
    return g.Case(table, check, context)
