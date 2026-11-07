"""DO guard suite `append_retry_source_1` (sweep part 2A). Append: subagent.retried payload copies of the transition source (predicate_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def retry_source_retry_cause(value, context):
    if value['family'] != 'subagent.retried':
        return None
    producer = value['producer_context']
    return 'retry_payload_source_predicate' if value['payload']['retry_cause'] != producer.get('retry_cause') else None


def retry_source_prior_attempt_number(value, context):
    if value['family'] != 'subagent.retried':
        return None
    producer = value['producer_context']
    return ('retry_payload_source_predicate' if value['payload']['prior_attempt_number'] != producer.get('prior_attempt_number')
            else None)


def retry_source_attempt_number(value, context):
    if value['family'] != 'subagent.retried':
        return None
    producer = value['producer_context']
    return 'retry_payload_source_predicate' if value['payload']['attempt_number'] != producer.get('attempt_number') else None


def retry_source_child_run_id(value, context):
    if value['family'] != 'subagent.retried':
        return None
    producer = value['producer_context']
    return 'retry_payload_source_predicate' if value['payload']['child_run_id'] != producer.get('child_run_id') else None


def retry_source_parent_run_id(value, context):
    if value['family'] != 'subagent.retried':
        return None
    producer = value['producer_context']
    return 'retry_payload_source_predicate' if value['payload']['parent_run_id'] != producer.get('parent_run_id') else None


ROWS = (
    ('retry_source_retry_cause', '/logical_payload/retry_cause', "equals the producer context's (subagent.retried)",
     'retry_payload_source_predicate', retry_source_retry_cause, ('family', 'payload', 'producer_context'), 'retry_source'),
    ('retry_source_prior_attempt_number', '/logical_payload/prior_attempt_number', "equals the producer context's (subagent.retried)",
     'retry_payload_source_predicate', retry_source_prior_attempt_number, ('family', 'payload', 'producer_context'), 'retry_source'),
    ('retry_source_attempt_number', '/logical_payload/attempt_number', "equals the producer context's (subagent.retried)",
     'retry_payload_source_predicate', retry_source_attempt_number, ('family', 'payload', 'producer_context'), 'retry_source'),
    ('retry_source_child_run_id', '/logical_payload/child_run_id', "equals the producer context's (subagent.retried)",
     'retry_payload_source_predicate', retry_source_child_run_id, ('family', 'payload', 'producer_context'), 'retry_source'),
    ('retry_source_parent_run_id', '/logical_payload/parent_run_id', "equals the producer context's (subagent.retried)",
     'retry_payload_source_predicate', retry_source_parent_run_id, ('family', 'payload', 'producer_context'), 'retry_source'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('retry_source_retry_cause', g.Invariant('/logical_payload/retry_cause', "equals the producer context's (subagent.retried)"), 'retry_payload_source_predicate', retry_source_retry_cause),
        g.Guard('retry_source_prior_attempt_number', g.Invariant('/logical_payload/prior_attempt_number', "equals the producer context's (subagent.retried)"), 'retry_payload_source_predicate', retry_source_prior_attempt_number),
        g.Guard('retry_source_attempt_number', g.Invariant('/logical_payload/attempt_number', "equals the producer context's (subagent.retried)"), 'retry_payload_source_predicate', retry_source_attempt_number),
        g.Guard('retry_source_child_run_id', g.Invariant('/logical_payload/child_run_id', "equals the producer context's (subagent.retried)"), 'retry_payload_source_predicate', retry_source_child_run_id),
        g.Guard('retry_source_parent_run_id', g.Invariant('/logical_payload/parent_run_id', "equals the producer context's (subagent.retried)"), 'retry_payload_source_predicate', retry_source_parent_run_id),
    ])
    context = None

    def check(complete):
        table.require('retry_source_retry_cause', complete, context)
        table.require('retry_source_prior_attempt_number', complete, context)
        table.require('retry_source_attempt_number', complete, context)
        table.require('retry_source_child_run_id', complete, context)
        table.require('retry_source_parent_run_id', complete, context)
        return True
    return g.Case(table, check, context)
