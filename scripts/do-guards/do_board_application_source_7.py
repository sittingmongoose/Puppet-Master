"""DO guard suite `board_application_source_7` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def source_thread_join(value, context):
    return 'source_original_join' if value['source']['thread_id'] != value['payload']['thread_id'] else None


def source_scope_join(value, context):
    return 'source_original_join' if value['source']['scope'] != value['message']['scope'] else None


def wrapper_scope_join(value, context):
    return 'source_original_join' if value['wrapper']['scope'] != value['message']['scope'] else None


def wrapper_record_join(value, context):
    return 'source_original_join' if value['typed_wrapper_record'] != value['typed_message'] else None


def source_input_digest(value, context):
    return 'source_input_digest' if value['source']['original_input_semantic_sha256'] != value['expected_input_digest'] else None


ROWS = (
    ('source_thread_join', '/source/thread_id', "equals the payload's",
     'source_original_join', source_thread_join, ('source', 'payload'), 'original_join'),
    ('source_scope_join', '/source/scope', "equals the original message's",
     'source_original_join', source_scope_join, ('source', 'message'), 'original_join'),
    ('wrapper_scope_join', '/wrapper/scope', "equals the original message's",
     'source_original_join', wrapper_scope_join, ('wrapper', 'message'), 'original_join'),
    ('wrapper_record_join', '/wrapper/record', 'is a typed copy of the original message',
     'source_original_join', wrapper_record_join, ('typed_wrapper_record', 'typed_message'), 'original_join'),
    ('source_input_digest', '/source/original_input_semantic_sha256', 'equals the accepted_source semantic hash of the original message',
     'source_input_digest', source_input_digest, ('source', 'expected_input_digest'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('source_thread_join', g.Invariant('/source/thread_id', "equals the payload's"), 'source_original_join', source_thread_join),
        g.Guard('source_scope_join', g.Invariant('/source/scope', "equals the original message's"), 'source_original_join', source_scope_join),
        g.Guard('wrapper_scope_join', g.Invariant('/wrapper/scope', "equals the original message's"), 'source_original_join', wrapper_scope_join),
        g.Guard('wrapper_record_join', g.Invariant('/wrapper/record', 'is a typed copy of the original message'), 'source_original_join', wrapper_record_join),
        g.Guard('source_input_digest', g.Invariant('/source/original_input_semantic_sha256', 'equals the accepted_source semantic hash of the original message'), 'source_input_digest', source_input_digest),
    ])
    context = None

    def check(complete):
        table.require('source_thread_join', complete, context)
        table.require('source_scope_join', complete, context)
        table.require('wrapper_scope_join', complete, context)
        table.require('wrapper_record_join', complete, context)
        table.require('source_input_digest', complete, context)
        return True
    return g.Case(table, check, context)
