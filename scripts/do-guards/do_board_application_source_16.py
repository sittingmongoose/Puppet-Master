"""DO guard suite `board_application_source_16` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def application_message_source(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'message_source' if value['payload_message_ids'] != [value['message']['message_id']] else None


def wrapper_key_join(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'wrapper_key_join' if value['wrapper_key'] != value['expected_wrapper_key'] else None


ROWS = (
    ('application_message_source', '/payload/message_ids', "are exactly the original message's id",
     'message_source', application_message_source, ('payload_message_ids', 'message', 'board_branch', 'application_shape_valid'), None),
    ('wrapper_key_join', '/wrapper_key', 'equals the application wrapper key recomputed from the wrapper and message',
     'wrapper_key_join', wrapper_key_join, ('wrapper_key', 'expected_wrapper_key', 'board_branch', 'application_shape_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('application_message_source', g.Invariant('/payload/message_ids', "are exactly the original message's id"), 'message_source', application_message_source),
        g.Guard('wrapper_key_join', g.Invariant('/wrapper_key', 'equals the application wrapper key recomputed from the wrapper and message'), 'wrapper_key_join', wrapper_key_join),
    ])
    context = None

    def check(complete):
        table.require('application_message_source', complete, context)
        table.require('wrapper_key_join', complete, context)
        return True
    return g.Case(table, check, context)
