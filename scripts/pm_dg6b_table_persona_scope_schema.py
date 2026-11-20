"""DG6B guard table persona_scope_schema: Schema occurrence: the Persona payload WorkflowScopeV2 key input.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('errors',)


def PSS01_payload_scope(value, context):
    return 'scope' if value['errors'] != 0 else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('PSS01_payload_scope', g.Invariant('/errors', 'the payload scope passes strict WorkflowScopeV2'), 'scope', PSS01_payload_scope),
    ])

    def check(value):
        table.require('PSS01_payload_scope', value, context)
        return True
    return g.Case(table, check, context)
