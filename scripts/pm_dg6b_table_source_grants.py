"""DG6B guard table source_grants: Event-writer admission and source access.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('writer_current', 'access_current')


def SG01_writer(value, context):
    return 'writer' if value['writer_current'] is not True else None


def SG02_access(value, context):
    return 'access' if value['access_current'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('SG01_writer', g.Invariant('/writer_current', 'is exactly True'), 'writer', SG01_writer),
        g.Guard('SG02_access', g.Invariant('/access_current', 'is exactly True'), 'access', SG02_access),
    ])

    def check(value):
        table.require('SG01_writer', value, context)
        table.require('SG02_access', value, context)
        return True
    return g.Case(table, check, context)
