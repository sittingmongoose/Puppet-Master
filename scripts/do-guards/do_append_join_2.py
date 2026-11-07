"""DO guard suite `append_join_2` (sweep part 2A). Append: the envelope joins to the payload and the recomputed identity.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def event_type_family(value, context):
    # A malformed identifier is `event_type_pattern`'s; a well-formed other family name is this row's.
    if value['event_type_pattern_valid'] is not True:
        return None
    return 'event_type_join' if value['event'].get('event_type') != value['family'] else None


def event_join_idempotency_key(value, context):
    return 'event_join_idempotency_key' if value['event'].get('idempotency_key') != value['expected_event']['idempotency_key'] else None


def event_join_event_id(value, context):
    return 'event_join_event_id' if value['event'].get('event_id') != value['expected_event']['event_id'] else None


def event_join_scope_kind(value, context):
    return 'event_join_scope_kind' if value['event'].get('scope_kind') != value['expected_event']['scope_kind'] else None


def event_join_project_id(value, context):
    return 'event_join_project_id' if value['event'].get('project_id') != value['expected_event']['project_id'] else None


ROWS = (
    ('event_type_family', '/event/event_type', "equals the case's family",
     'event_type_join', event_type_family, ('event', 'family', 'event_type_pattern_valid'), 'event_type_join'),
    ('event_join_idempotency_key', '/event/idempotency_key', 'equals the key recomputed from the payload',
     'event_join_idempotency_key', event_join_idempotency_key, ('event', 'expected_event'), None),
    ('event_join_event_id', '/event/event_id', 'equals the id recomputed from the payload',
     'event_join_event_id', event_join_event_id, ('event', 'expected_event'), None),
    ('event_join_scope_kind', '/event/scope_kind', "equals the payload's scope",
     'event_join_scope_kind', event_join_scope_kind, ('event', 'expected_event'), None),
    ('event_join_project_id', '/event/project_id', "equals the payload's project_id (or null)",
     'event_join_project_id', event_join_project_id, ('event', 'expected_event'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('event_type_family', g.Invariant('/event/event_type', "equals the case's family"), 'event_type_join', event_type_family),
        g.Guard('event_join_idempotency_key', g.Invariant('/event/idempotency_key', 'equals the key recomputed from the payload'), 'event_join_idempotency_key', event_join_idempotency_key),
        g.Guard('event_join_event_id', g.Invariant('/event/event_id', 'equals the id recomputed from the payload'), 'event_join_event_id', event_join_event_id),
        g.Guard('event_join_scope_kind', g.Invariant('/event/scope_kind', "equals the payload's scope"), 'event_join_scope_kind', event_join_scope_kind),
        g.Guard('event_join_project_id', g.Invariant('/event/project_id', "equals the payload's project_id (or null)"), 'event_join_project_id', event_join_project_id),
    ])
    context = None

    def check(complete):
        table.require('event_type_family', complete, context)
        table.require('event_join_idempotency_key', complete, context)
        table.require('event_join_event_id', complete, context)
        table.require('event_join_scope_kind', complete, context)
        table.require('event_join_project_id', complete, context)
        return True
    return g.Case(table, check, context)
