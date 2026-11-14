"""DO guard suite `retry_transition_2` (sweep part 2A). OSI-699 static transition oracle (retry_allowed): a retry is allowed exactly when no row refuses.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def transition_parent_ceiling_current(value, context):
    if value['context_type_errors']:
        return None
    return 'retry_current_transition' if value['context']['parent_ceiling_current'] is not True else None


def transition_stop_not_latched(value, context):
    if value['context_type_errors']:
        return None
    return 'retry_current_transition' if value['context']['stop_latched'] is not False else None


def transition_deadline_not_expired(value, context):
    if value['context_type_errors']:
        return None
    return 'retry_current_transition' if value['context']['deadline_expired'] is not False else None


def transition_same_child_lineage(value, context):
    if value['context_type_errors']:
        return None
    return 'retry_current_transition' if value['context']['same_child_lineage'] is not True else None


def transition_operation_retry(value, context):
    if value['context_type_errors']:
        return None
    return 'retry_current_transition' if value['context']['operation_kind'] != 'retry' else None


ROWS = (
    ('transition_parent_ceiling_current', '/context/parent_ceiling_current', 'is true',
     'retry_current_transition', transition_parent_ceiling_current, ('context', 'context_type_errors'), None),
    ('transition_stop_not_latched', '/context/stop_latched', 'is false',
     'retry_current_transition', transition_stop_not_latched, ('context', 'context_type_errors'), None),
    ('transition_deadline_not_expired', '/context/deadline_expired', 'is false',
     'retry_current_transition', transition_deadline_not_expired, ('context', 'context_type_errors'), None),
    ('transition_same_child_lineage', '/context/same_child_lineage', 'is true',
     'retry_current_transition', transition_same_child_lineage, ('context', 'context_type_errors'), None),
    ('transition_operation_retry', '/context/operation_kind', "is 'retry'",
     'retry_current_transition', transition_operation_retry, ('context', 'context_type_errors'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('transition_parent_ceiling_current', g.Invariant('/context/parent_ceiling_current', 'is true'), 'retry_current_transition', transition_parent_ceiling_current),
        g.Guard('transition_stop_not_latched', g.Invariant('/context/stop_latched', 'is false'), 'retry_current_transition', transition_stop_not_latched),
        g.Guard('transition_deadline_not_expired', g.Invariant('/context/deadline_expired', 'is false'), 'retry_current_transition', transition_deadline_not_expired),
        g.Guard('transition_same_child_lineage', g.Invariant('/context/same_child_lineage', 'is true'), 'retry_current_transition', transition_same_child_lineage),
        g.Guard('transition_operation_retry', g.Invariant('/context/operation_kind', "is 'retry'"), 'retry_current_transition', transition_operation_retry),
    ])
    context = None

    def check(complete):
        table.require('transition_parent_ceiling_current', complete, context)
        table.require('transition_stop_not_latched', complete, context)
        table.require('transition_deadline_not_expired', complete, context)
        table.require('transition_same_child_lineage', complete, context)
        table.require('transition_operation_retry', complete, context)
        return True
    return g.Case(table, check, context)
