"""DO guard suite `retry_transition_1` (sweep part 2A). OSI-699 static transition oracle (retry_allowed): a retry is allowed exactly when no row refuses.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def transition_context_types(value, context):
    return 'retry_current_transition' if value['context_type_errors'] else None


def transition_source_pair(value, context):
    if value['context_type_errors']:
        return None
    transition = value['context']
    cause, prior = transition['retry_cause'], transition['prior_state']
    allowed = ((cause == 'failure' and prior == 'failed') or (cause == 'blockage' and prior == 'blocked')
               or (cause == 'interruption' and (prior == 'running' or prior == 'awaiting_parent' or prior == 'blocked')))
    return 'retry_current_transition' if not allowed else None


def transition_interruption_fence(value, context):
    if value['context_type_errors']:
        return None
    transition = value['context']
    if transition['retry_cause'] != 'interruption':
        return None
    return 'retry_current_transition' if transition['interruption_fence'] is not True else None


def transition_not_superseded(value, context):
    if value['context_type_errors']:
        return None
    return 'retry_current_transition' if value['context']['prior_terminal_reason'] == 'superseded' else None


def transition_permission_current(value, context):
    if value['context_type_errors']:
        return None
    return 'retry_current_transition' if value['context']['permission_current'] is not True else None


ROWS = (
    ('transition_context_types', '/context', 'passes the RETRY_CONTEXT rows',
     'retry_current_transition', transition_context_types, ('context_type_errors',), None),
    ('transition_source_pair', '/context/retry_cause', 'with prior_state is failure/failed, blockage/blocked or interruption/running|awaiting_parent|blocked',
     'retry_current_transition', transition_source_pair, ('context', 'context_type_errors'), None),
    ('transition_interruption_fence', '/context/interruption_fence', 'is true for an interruption retry',
     'retry_current_transition', transition_interruption_fence, ('context', 'context_type_errors'), None),
    ('transition_not_superseded', '/context/prior_terminal_reason', "is not 'superseded'",
     'retry_current_transition', transition_not_superseded, ('context', 'context_type_errors'), None),
    ('transition_permission_current', '/context/permission_current', 'is true',
     'retry_current_transition', transition_permission_current, ('context', 'context_type_errors'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('transition_context_types', g.Invariant('/context', 'passes the RETRY_CONTEXT rows'), 'retry_current_transition', transition_context_types),
        g.Guard('transition_source_pair', g.Invariant('/context/retry_cause', 'with prior_state is failure/failed, blockage/blocked or interruption/running|awaiting_parent|blocked'), 'retry_current_transition', transition_source_pair),
        g.Guard('transition_interruption_fence', g.Invariant('/context/interruption_fence', 'is true for an interruption retry'), 'retry_current_transition', transition_interruption_fence),
        g.Guard('transition_not_superseded', g.Invariant('/context/prior_terminal_reason', "is not 'superseded'"), 'retry_current_transition', transition_not_superseded),
        g.Guard('transition_permission_current', g.Invariant('/context/permission_current', 'is true'), 'retry_current_transition', transition_permission_current),
    ])
    context = None

    def check(complete):
        table.require('transition_context_types', complete, context)
        table.require('transition_source_pair', complete, context)
        table.require('transition_interruption_fence', complete, context)
        table.require('transition_not_superseded', complete, context)
        table.require('transition_permission_current', complete, context)
        return True
    return g.Case(table, check, context)
