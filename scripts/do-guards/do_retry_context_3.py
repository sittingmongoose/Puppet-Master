"""DO guard suite `retry_context_3` (sweep part 2A). OSI-699 transition context: exact types (retry_context_errors).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def retry_context_prior_state(value, context):
    transition = value['context']
    if type(transition) is not dict:
        return None
    return 'retry_context_type' if type(transition.get('prior_state')) is not str else None


def retry_context_operation_kind(value, context):
    transition = value['context']
    if type(transition) is not dict:
        return None
    return 'retry_context_type' if type(transition.get('operation_kind')) is not str else None


def retry_context_prior_terminal_reason(value, context):
    transition = value['context']
    if type(transition) is not dict:
        return None
    if 'prior_terminal_reason' not in transition:
        return 'retry_context_type'
    reason = transition['prior_terminal_reason']
    return 'retry_context_type' if reason is not None and type(reason) is not str else None


ROWS = (
    ('retry_context_prior_state', '/context/prior_state', 'is a string',
     'retry_context_type', retry_context_prior_state, ('context',), 'retry_context_type'),
    ('retry_context_operation_kind', '/context/operation_kind', 'is a string',
     'retry_context_type', retry_context_operation_kind, ('context',), 'retry_context_type'),
    ('retry_context_prior_terminal_reason', '/context/prior_terminal_reason', 'is present, a string or null',
     'retry_context_type', retry_context_prior_terminal_reason, ('context',), 'retry_context_type'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('retry_context_prior_state', g.Invariant('/context/prior_state', 'is a string'), 'retry_context_type', retry_context_prior_state),
        g.Guard('retry_context_operation_kind', g.Invariant('/context/operation_kind', 'is a string'), 'retry_context_type', retry_context_operation_kind),
        g.Guard('retry_context_prior_terminal_reason', g.Invariant('/context/prior_terminal_reason', 'is present, a string or null'), 'retry_context_type', retry_context_prior_terminal_reason),
    ])
    context = None

    def check(complete):
        table.require('retry_context_prior_state', complete, context)
        table.require('retry_context_operation_kind', complete, context)
        table.require('retry_context_prior_terminal_reason', complete, context)
        return True
    return g.Case(table, check, context)
