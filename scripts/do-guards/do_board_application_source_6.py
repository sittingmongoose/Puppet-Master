"""DO guard suite `board_application_source_6` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def application_source_storage_instance_id(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'source_storage_instance_id' if value['source']['storage_instance_id'] != value['payload']['storage_instance_id'] else None


ROWS = (
    ('application_source_storage_instance_id', '/source/storage_instance_id', "equals the payload's",
     'source_storage_instance_id', application_source_storage_instance_id, ('source', 'payload', 'board_branch', 'application_shape_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('application_source_storage_instance_id', g.Invariant('/source/storage_instance_id', "equals the payload's"), 'source_storage_instance_id', application_source_storage_instance_id),
    ])
    context = None

    def check(complete):
        table.require('application_source_storage_instance_id', complete, context)
        return True
    return g.Case(table, check, context)
