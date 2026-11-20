"""DG6B guard table persona_source_trust: Persona import source verification.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('source_verified',)


def PV01_source_verified(value, context):
    return 'source_trust' if value['source_verified'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('PV01_source_verified', g.Invariant('/source_verified', 'is exactly True'), 'source_trust', PV01_source_verified),
    ])

    def check(value):
        table.require('PV01_source_verified', value, context)
        return True
    return g.Case(table, check, context)
