"""DO guard suite `board_application_source_9` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def application_wrapper_server_id(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'source_server_id' if value['wrapper']['server_id'] != value['payload']['server_id'] else None


ROWS = (
    ('application_wrapper_server_id', '/wrapper/server_id', "equals the payload's",
     'source_server_id', application_wrapper_server_id, ('wrapper', 'payload', 'board_branch', 'application_shape_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('application_wrapper_server_id', g.Invariant('/wrapper/server_id', "equals the payload's"), 'source_server_id', application_wrapper_server_id),
    ])
    context = None

    def check(complete):
        table.require('application_wrapper_server_id', complete, context)
        return True
    return g.Case(table, check, context)
