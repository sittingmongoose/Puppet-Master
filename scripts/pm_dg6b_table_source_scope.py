"""DG6B guard table source_scope: Schema occurrence: the source WorkflowScopeV2 with strict identifier ends.

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


def SC01_source_scope(value, context):
    return 'scope' if value['errors'] != 0 else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('SC01_source_scope', g.Invariant('/errors', 'the source scope passes WorkflowScopeV2 with formats'), 'scope', SC01_source_scope),
    ])

    def check(value):
        table.require('SC01_source_scope', value, context)
        return True
    return g.Case(table, check, context)
