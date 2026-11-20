"""DG6B guard table persona_cas_lease: Persona compare-and-set lease.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('cas_current',)


def PK01_cas_current(value, context):
    return 'cas' if value['cas_current'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('PK01_cas_current', g.Invariant('/cas_current', 'is exactly True'), 'cas', PK01_cas_current),
    ])

    def check(value):
        table.require('PK01_cas_current', value, context)
        return True
    return g.Case(table, check, context)
