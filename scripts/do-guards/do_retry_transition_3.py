"""DO guard suite `retry_transition_3` (sweep part 2A). OSI-699 static transition oracle (retry_allowed): a retry is allowed exactly when no row refuses.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def transition_attempt_increment(value, context):
    if value['context_type_errors']:
        return None
    transition = value['context']
    return ('retry_current_transition' if transition['attempt_number'] != transition['prior_attempt_number'] + 1
            else None)


ROWS = (
    ('transition_attempt_increment', '/context/attempt_number', 'is prior_attempt_number + 1',
     'retry_current_transition', transition_attempt_increment, ('context', 'context_type_errors'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('transition_attempt_increment', g.Invariant('/context/attempt_number', 'is prior_attempt_number + 1'), 'retry_current_transition', transition_attempt_increment),
    ])
    context = None

    def check(complete):
        table.require('transition_attempt_increment', complete, context)
        return True
    return g.Case(table, check, context)
