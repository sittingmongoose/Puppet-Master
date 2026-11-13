"""DO guard suite `append_join_5` (sweep part 2A). Append: the envelope joins to the payload and the recomputed identity.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def event_scope_partition(value, context):
    if value['payload_schema_valid'] is not True:
        return None
    return 'scope_partition' if value['scope_partition'] != value['expected_scope_partition'] else None


ROWS = (
    ('event_scope_partition', '/scope_partition', 'equals the partition recomputed from the payload scope',
     'scope_partition', event_scope_partition, ('scope_partition', 'expected_scope_partition', 'payload_schema_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('event_scope_partition', g.Invariant('/scope_partition', 'equals the partition recomputed from the payload scope'), 'scope_partition', event_scope_partition),
    ])
    context = None

    def check(complete):
        table.require('event_scope_partition', complete, context)
        return True
    return g.Case(table, check, context)
