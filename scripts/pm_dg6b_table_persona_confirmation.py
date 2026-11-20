"""DG6B guard table persona_confirmation: Persona delete confirmation.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('confirmation_current',)


def PF01_confirmation(value, context):
    return 'confirmation' if value['confirmation_current'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('PF01_confirmation', g.Invariant('/confirmation_current', 'is exactly True'), 'confirmation', PF01_confirmation),
    ])

    def check(value):
        table.require('PF01_confirmation', value, context)
        return True
    return g.Case(table, check, context)
