"""DG6B guard table semantic_scope: Auth identity input scope key.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('scope_key',)


def SS01_application_key(value, context):
    return 'scope' if value['scope_key'] != 'application' else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('SS01_application_key', g.Invariant('/scope_key', 'is application'), 'scope', SS01_application_key),
    ])

    def check(value):
        table.require('SS01_application_key', value, context)
        return True
    return g.Case(table, check, context)
