"""DO guard suite `board_project_source_3` (sweep part 2A). Board source, Project scope: the adapter source joins to the payload.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def project_message_source(value, context):
    return 'message_source' if value['source'].get('message_ids') != value['payload_message_ids'] else None


ROWS = (
    ('project_message_source', '/source/message_ids', "equal the payload's message ids",
     'message_source', project_message_source, ('source', 'payload_message_ids'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('project_message_source', g.Invariant('/source/message_ids', "equal the payload's message ids"), 'message_source', project_message_source),
    ])
    context = None

    def check(complete):
        table.require('project_message_source', complete, context)
        return True
    return g.Case(table, check, context)
