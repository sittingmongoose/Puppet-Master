"""DO guard suite `append_join_3` (sweep part 2A). Append: the envelope joins to the payload and the recomputed identity.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def event_join_scope_kind(value, context):
    if value['payload_schema_valid'] is not True:
        return None
    return 'event_join_scope_kind' if value['event'].get('scope_kind') != value['expected_event']['scope_kind'] else None


ROWS = (
    ('event_join_scope_kind', '/event/scope_kind', "equals the payload's scope",
     'event_join_scope_kind', event_join_scope_kind, ('event', 'expected_event', 'payload_schema_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('event_join_scope_kind', g.Invariant('/event/scope_kind', "equals the payload's scope"), 'event_join_scope_kind', event_join_scope_kind),
    ])
    context = None

    def check(complete):
        table.require('event_join_scope_kind', complete, context)
        return True
    return g.Case(table, check, context)
