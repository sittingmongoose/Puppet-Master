"""DO guard suite `retry_context_1` (sweep part 2A). OSI-699 transition context: exact types (retry_context_errors).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def retry_context_object(value, context):
    return 'retry_context_type' if type(value['context']) is not dict else None


def retry_context_interruption_fence(value, context):
    transition = value['context']
    if type(transition) is not dict:
        return None
    return 'retry_context_type' if type(transition.get('interruption_fence')) is not bool else None


def retry_context_permission_current(value, context):
    transition = value['context']
    if type(transition) is not dict:
        return None
    return 'retry_context_type' if type(transition.get('permission_current')) is not bool else None


def retry_context_parent_ceiling_current(value, context):
    transition = value['context']
    if type(transition) is not dict:
        return None
    return 'retry_context_type' if type(transition.get('parent_ceiling_current')) is not bool else None


def retry_context_stop_latched(value, context):
    transition = value['context']
    if type(transition) is not dict:
        return None
    return 'retry_context_type' if type(transition.get('stop_latched')) is not bool else None


ROWS = (
    ('retry_context_object', '/context', 'is an object',
     'retry_context_type', retry_context_object, ('context',), 'retry_context_type'),
    ('retry_context_interruption_fence', '/context/interruption_fence', 'is a boolean',
     'retry_context_type', retry_context_interruption_fence, ('context',), 'retry_context_type'),
    ('retry_context_permission_current', '/context/permission_current', 'is a boolean',
     'retry_context_type', retry_context_permission_current, ('context',), 'retry_context_type'),
    ('retry_context_parent_ceiling_current', '/context/parent_ceiling_current', 'is a boolean',
     'retry_context_type', retry_context_parent_ceiling_current, ('context',), 'retry_context_type'),
    ('retry_context_stop_latched', '/context/stop_latched', 'is a boolean',
     'retry_context_type', retry_context_stop_latched, ('context',), 'retry_context_type'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('retry_context_object', g.Invariant('/context', 'is an object'), 'retry_context_type', retry_context_object),
        g.Guard('retry_context_interruption_fence', g.Invariant('/context/interruption_fence', 'is a boolean'), 'retry_context_type', retry_context_interruption_fence),
        g.Guard('retry_context_permission_current', g.Invariant('/context/permission_current', 'is a boolean'), 'retry_context_type', retry_context_permission_current),
        g.Guard('retry_context_parent_ceiling_current', g.Invariant('/context/parent_ceiling_current', 'is a boolean'), 'retry_context_type', retry_context_parent_ceiling_current),
        g.Guard('retry_context_stop_latched', g.Invariant('/context/stop_latched', 'is a boolean'), 'retry_context_type', retry_context_stop_latched),
    ])
    context = None

    def check(complete):
        table.require('retry_context_object', complete, context)
        table.require('retry_context_interruption_fence', complete, context)
        table.require('retry_context_permission_current', complete, context)
        table.require('retry_context_parent_ceiling_current', complete, context)
        table.require('retry_context_stop_latched', complete, context)
        return True
    return g.Case(table, check, context)
