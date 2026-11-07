"""DG6B guard table hook_block: Only execution-flow hooks may block.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('hook_name',)


def HB01_execution_hook(value, context):
    return 'observation_only_hook' if value['hook_name'] not in ('pre_tool_invoke', 'pre_attempt_start', 'pre_node_dispatch') else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('HB01_execution_hook', g.Invariant('/hook_name', 'is pre_tool_invoke, pre_attempt_start or pre_node_dispatch'), 'observation_only_hook', HB01_execution_hook),
    ])

    def check(value):
        table.require('HB01_execution_hook', value, context)
        return True
    return g.Case(table, check, context)
