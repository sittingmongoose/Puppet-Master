"""DG6B guard table persona_home: A Project home lives in its Project scope.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('home_kind', 'scope_kind', 'home_project_id', 'project_id')


def PH01_project_home_scope(value, context):
    return 'home_scope' if value['home_kind'] == 'project' and value['scope_kind'] != 'project' else None


def PH02_project_home_id(value, context):
    return 'home_scope' if value['home_kind'] == 'project' and value['scope_kind'] == 'project' and value['home_project_id'] != value['project_id'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('PH01_project_home_scope', g.Invariant('/home_kind', 'a Project home has Project scope'), 'home_scope', PH01_project_home_scope),
        g.Guard('PH02_project_home_id', g.Invariant('/home_project_id', 'a Project home names the scope Project (Project scope)'), 'home_scope', PH02_project_home_id),
    ])

    def check(value):
        table.require('PH01_project_home_scope', value, context)
        table.require('PH02_project_home_id', value, context)
        return True
    return g.Case(table, check, context)
