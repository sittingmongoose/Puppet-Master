"""DG6B guard table cadence: Device-flow poll cadence.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('poll_interval_seconds', 'expected_interval_seconds')


def CD01_poll_interval(value, context):
    return 'cadence' if value['poll_interval_seconds'] != value['expected_interval_seconds'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('CD01_poll_interval', g.Invariant('/poll_interval_seconds', 'is previous+5 after slow_down, otherwise previous'), 'cadence', CD01_poll_interval),
    ])

    def check(value):
        table.require('CD01_poll_interval', value, context)
        return True
    return g.Case(table, check, context)
