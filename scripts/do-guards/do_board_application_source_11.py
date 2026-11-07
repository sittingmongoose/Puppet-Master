"""DO guard suite `board_application_source_11` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def message_thread_id(value, context):
    return 'message_thread_id' if value['message']['thread_id'] != value['payload']['thread_id'] else None


def message_crew_id(value, context):
    return 'message_crew_id' if value['message']['crew_id'] != value['payload']['crew_id'] else None


def message_run_id(value, context):
    return 'message_run_id' if value['message']['run_id'] != value['payload']['run_id'] else None


def application_message_source(value, context):
    return 'message_source' if value['payload_message_ids'] != [value['message']['message_id']] else None


def wrapper_key_join(value, context):
    return 'wrapper_key_join' if value['wrapper_key'] != value['expected_wrapper_key'] else None


ROWS = (
    ('message_thread_id', '/source/original_input/thread_id', "equals the payload's",
     'message_thread_id', message_thread_id, ('message', 'payload'), None),
    ('message_crew_id', '/source/original_input/crew_id', "equals the payload's",
     'message_crew_id', message_crew_id, ('message', 'payload'), None),
    ('message_run_id', '/source/original_input/run_id', "equals the payload's",
     'message_run_id', message_run_id, ('message', 'payload'), None),
    ('application_message_source', '/payload/message_ids', "are exactly the original message's id",
     'message_source', application_message_source, ('payload_message_ids', 'message'), None),
    ('wrapper_key_join', '/wrapper_key', 'equals the application wrapper key recomputed from the wrapper and message',
     'wrapper_key_join', wrapper_key_join, ('wrapper_key', 'expected_wrapper_key'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('message_thread_id', g.Invariant('/source/original_input/thread_id', "equals the payload's"), 'message_thread_id', message_thread_id),
        g.Guard('message_crew_id', g.Invariant('/source/original_input/crew_id', "equals the payload's"), 'message_crew_id', message_crew_id),
        g.Guard('message_run_id', g.Invariant('/source/original_input/run_id', "equals the payload's"), 'message_run_id', message_run_id),
        g.Guard('application_message_source', g.Invariant('/payload/message_ids', "are exactly the original message's id"), 'message_source', application_message_source),
        g.Guard('wrapper_key_join', g.Invariant('/wrapper_key', 'equals the application wrapper key recomputed from the wrapper and message'), 'wrapper_key_join', wrapper_key_join),
    ])
    context = None

    def check(complete):
        table.require('message_thread_id', complete, context)
        table.require('message_crew_id', complete, context)
        table.require('message_run_id', complete, context)
        table.require('application_message_source', complete, context)
        table.require('wrapper_key_join', complete, context)
        return True
    return g.Case(table, check, context)
