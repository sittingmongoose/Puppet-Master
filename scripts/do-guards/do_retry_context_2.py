"""DO guard suite `retry_context_2` (sweep part 2A). OSI-699 transition context: exact types (retry_context_errors).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def retry_context_deadline_expired(value, context):
    transition = value['context']
    if type(transition) is not dict:
        return None
    return 'retry_context_type' if type(transition.get('deadline_expired')) is not bool else None


def retry_context_same_child_lineage(value, context):
    transition = value['context']
    if type(transition) is not dict:
        return None
    return 'retry_context_type' if type(transition.get('same_child_lineage')) is not bool else None


def retry_context_attempt_number(value, context):
    transition = value['context']
    if type(transition) is not dict:
        return None
    number = transition.get('attempt_number')
    integral = type(number) is int or (type(number) is float and number % 1 == 0)
    return 'retry_context_type' if not integral else None


def retry_context_prior_attempt_number(value, context):
    transition = value['context']
    if type(transition) is not dict:
        return None
    number = transition.get('prior_attempt_number')
    integral = type(number) is int or (type(number) is float and number % 1 == 0)
    return 'retry_context_type' if not integral else None


def retry_context_retry_cause(value, context):
    transition = value['context']
    if type(transition) is not dict:
        return None
    return 'retry_context_type' if type(transition.get('retry_cause')) is not str else None


ROWS = (
    ('retry_context_deadline_expired', '/context/deadline_expired', 'is a boolean',
     'retry_context_type', retry_context_deadline_expired, ('context',), 'retry_context_type'),
    ('retry_context_same_child_lineage', '/context/same_child_lineage', 'is a boolean',
     'retry_context_type', retry_context_same_child_lineage, ('context',), 'retry_context_type'),
    ('retry_context_attempt_number', '/context/attempt_number', 'is a JSON integer',
     'retry_context_type', retry_context_attempt_number, ('context',), 'retry_context_type'),
    ('retry_context_prior_attempt_number', '/context/prior_attempt_number', 'is a JSON integer',
     'retry_context_type', retry_context_prior_attempt_number, ('context',), 'retry_context_type'),
    ('retry_context_retry_cause', '/context/retry_cause', 'is a string',
     'retry_context_type', retry_context_retry_cause, ('context',), 'retry_context_type'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('retry_context_deadline_expired', g.Invariant('/context/deadline_expired', 'is a boolean'), 'retry_context_type', retry_context_deadline_expired),
        g.Guard('retry_context_same_child_lineage', g.Invariant('/context/same_child_lineage', 'is a boolean'), 'retry_context_type', retry_context_same_child_lineage),
        g.Guard('retry_context_attempt_number', g.Invariant('/context/attempt_number', 'is a JSON integer'), 'retry_context_type', retry_context_attempt_number),
        g.Guard('retry_context_prior_attempt_number', g.Invariant('/context/prior_attempt_number', 'is a JSON integer'), 'retry_context_type', retry_context_prior_attempt_number),
        g.Guard('retry_context_retry_cause', g.Invariant('/context/retry_cause', 'is a string'), 'retry_context_type', retry_context_retry_cause),
    ])
    context = None

    def check(complete):
        table.require('retry_context_deadline_expired', complete, context)
        table.require('retry_context_same_child_lineage', complete, context)
        table.require('retry_context_attempt_number', complete, context)
        table.require('retry_context_prior_attempt_number', complete, context)
        table.require('retry_context_retry_cause', complete, context)
        return True
    return g.Case(table, check, context)
