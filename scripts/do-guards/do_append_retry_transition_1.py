"""DO guard suite `append_retry_transition_1` (sweep part 2A). Append: the current OSI-699 transition verdict (its clauses are the RETRY_TRANSITION table).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def retry_transition_allowed(value, context):
    if value['family'] != 'subagent.retried':
        return None
    return 'retry_current_transition' if value['retry_transition_allowed'] is not True else None


ROWS = (
    ('retry_transition_allowed', '/producer_context', 'is an allowed current retry transition (RETRY_TRANSITION rows)',
     'retry_current_transition', retry_transition_allowed, ('family', 'retry_transition_allowed'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('retry_transition_allowed', g.Invariant('/producer_context', 'is an allowed current retry transition (RETRY_TRANSITION rows)'), 'retry_current_transition', retry_transition_allowed),
    ])
    context = None

    def check(complete):
        table.require('retry_transition_allowed', complete, context)
        return True
    return g.Case(table, check, context)
