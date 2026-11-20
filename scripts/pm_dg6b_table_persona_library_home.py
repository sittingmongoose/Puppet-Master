"""DG6B guard table persona_library_home: A library home is written in application scope.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('home_kind', 'scope_kind')


def PL01_library_home_scope(value, context):
    return 'home_scope' if value['home_kind'] == 'library' and value['scope_kind'] != 'application' else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('PL01_library_home_scope', g.Invariant('/home_kind', 'a library home has application scope'), 'home_scope', PL01_library_home_scope),
    ])

    def check(value):
        table.require('PL01_library_home_scope', value, context)
        return True
    return g.Case(table, check, context)
