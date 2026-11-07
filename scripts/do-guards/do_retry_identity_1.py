"""DO guard suite `retry_identity_1` (sweep part 2A). Retry: the candidate names the original identity.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def retry_same_scope_kind(value, context):
    if value['candidate_shape_valid'] is not True or value['original_shape_valid'] is not True:
        return None
    return 'different_identity' if value['original']['scope_kind'] != value['candidate']['scope_kind'] else None


def retry_same_project_id(value, context):
    if value['candidate_shape_valid'] is not True or value['original_shape_valid'] is not True:
        return None
    return 'different_identity' if value['original']['project_id'] != value['candidate']['project_id'] else None


def retry_same_event_type(value, context):
    if value['candidate_shape_valid'] is not True or value['original_shape_valid'] is not True:
        return None
    return 'different_identity' if value['original']['event_type'] != value['candidate']['event_type'] else None


def retry_same_idempotency_key(value, context):
    if value['candidate_shape_valid'] is not True or value['original_shape_valid'] is not True:
        return None
    return 'different_identity' if value['original']['idempotency_key'] != value['candidate']['idempotency_key'] else None


def retry_same_event_id(value, context):
    if value['candidate_shape_valid'] is not True or value['original_shape_valid'] is not True:
        return None
    return 'different_identity' if value['original']['event_id'] != value['candidate']['event_id'] else None


ROWS = (
    ('retry_same_scope_kind', '/candidate/scope_kind', "equals the original's",
     'different_identity', retry_same_scope_kind, ('original', 'candidate', 'original_shape_valid', 'candidate_shape_valid'), None),
    ('retry_same_project_id', '/candidate/project_id', "equals the original's",
     'different_identity', retry_same_project_id, ('original', 'candidate', 'original_shape_valid', 'candidate_shape_valid'), None),
    ('retry_same_event_type', '/candidate/event_type', "equals the original's",
     'different_identity', retry_same_event_type, ('original', 'candidate', 'original_shape_valid', 'candidate_shape_valid'), None),
    ('retry_same_idempotency_key', '/candidate/idempotency_key', "equals the original's",
     'different_identity', retry_same_idempotency_key, ('original', 'candidate', 'original_shape_valid', 'candidate_shape_valid'), None),
    ('retry_same_event_id', '/candidate/event_id', "equals the original's",
     'different_identity', retry_same_event_id, ('original', 'candidate', 'original_shape_valid', 'candidate_shape_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('retry_same_scope_kind', g.Invariant('/candidate/scope_kind', "equals the original's"), 'different_identity', retry_same_scope_kind),
        g.Guard('retry_same_project_id', g.Invariant('/candidate/project_id', "equals the original's"), 'different_identity', retry_same_project_id),
        g.Guard('retry_same_event_type', g.Invariant('/candidate/event_type', "equals the original's"), 'different_identity', retry_same_event_type),
        g.Guard('retry_same_idempotency_key', g.Invariant('/candidate/idempotency_key', "equals the original's"), 'different_identity', retry_same_idempotency_key),
        g.Guard('retry_same_event_id', g.Invariant('/candidate/event_id', "equals the original's"), 'different_identity', retry_same_event_id),
    ])
    context = None

    def check(complete):
        table.require('retry_same_scope_kind', complete, context)
        table.require('retry_same_project_id', complete, context)
        table.require('retry_same_event_type', complete, context)
        table.require('retry_same_idempotency_key', complete, context)
        table.require('retry_same_event_id', complete, context)
        return True
    return g.Case(table, check, context)
