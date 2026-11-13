"""DG6B guard table auth_scope: GitHub auth families are application scoped.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('scope_kind',)


def AU01_application(value, context):
    return 'scope' if value['scope_kind'] != 'application' else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('AU01_application', g.Invariant('/scope/scope_kind', 'is application'), 'scope', AU01_application),
    ])

    def check(value):
        table.require('AU01_application', value, context)
        return True
    return g.Case(table, check, context)
