"""DO guard suite `board_application_source_10` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def source_operation_join(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'source_original_join' if value['source']['original_operation_id'] != value['payload']['operation_id'] else None


def source_thread_join(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'source_original_join' if value['source']['thread_id'] != value['payload']['thread_id'] else None


ROWS = (
    ('source_operation_join', '/source/original_operation_id', "equals the payload's operation_id",
     'source_original_join', source_operation_join, ('source', 'payload', 'board_branch', 'application_shape_valid'), 'original_join'),
    ('source_thread_join', '/source/thread_id', "equals the payload's",
     'source_original_join', source_thread_join, ('source', 'payload', 'board_branch', 'application_shape_valid'), 'original_join'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('source_operation_join', g.Invariant('/source/original_operation_id', "equals the payload's operation_id"), 'source_original_join', source_operation_join),
        g.Guard('source_thread_join', g.Invariant('/source/thread_id', "equals the payload's"), 'source_original_join', source_thread_join),
    ])
    context = None

    def check(complete):
        table.require('source_operation_join', complete, context)
        table.require('source_thread_join', complete, context)
        return True
    return g.Case(table, check, context)
