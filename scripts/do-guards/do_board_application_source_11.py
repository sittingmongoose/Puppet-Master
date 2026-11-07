"""DO guard suite `board_application_source_11` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def source_scope_join(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'source_original_join' if value['source']['scope'] != value['message']['scope'] else None


def wrapper_scope_join(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'source_original_join' if value['wrapper']['scope'] != value['message']['scope'] else None


ROWS = (
    ('source_scope_join', '/source/scope', "equals the original message's",
     'source_original_join', source_scope_join, ('source', 'message', 'board_branch', 'application_shape_valid'), 'original_join'),
    ('wrapper_scope_join', '/wrapper/scope', "equals the original message's",
     'source_original_join', wrapper_scope_join, ('wrapper', 'message', 'board_branch', 'application_shape_valid'), 'original_join'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('source_scope_join', g.Invariant('/source/scope', "equals the original message's"), 'source_original_join', source_scope_join),
        g.Guard('wrapper_scope_join', g.Invariant('/wrapper/scope', "equals the original message's"), 'source_original_join', wrapper_scope_join),
    ])
    context = None

    def check(complete):
        table.require('source_scope_join', complete, context)
        table.require('wrapper_scope_join', complete, context)
        return True
    return g.Case(table, check, context)
