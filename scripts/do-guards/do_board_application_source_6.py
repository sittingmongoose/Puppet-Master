"""DO guard suite `board_application_source_6` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def application_source_storage_instance_id(value, context):
    return 'source_storage_instance_id' if value['source']['storage_instance_id'] != value['payload']['storage_instance_id'] else None


def application_source_server_id(value, context):
    return 'source_server_id' if value['source']['server_id'] != value['payload']['server_id'] else None


def application_wrapper_storage_instance_id(value, context):
    return 'source_storage_instance_id' if value['wrapper']['storage_instance_id'] != value['payload']['storage_instance_id'] else None


def application_wrapper_server_id(value, context):
    return 'source_server_id' if value['wrapper']['server_id'] != value['payload']['server_id'] else None


def source_operation_join(value, context):
    return 'source_original_join' if value['source']['original_operation_id'] != value['payload']['operation_id'] else None


ROWS = (
    ('application_source_storage_instance_id', '/source/storage_instance_id', "equals the payload's",
     'source_storage_instance_id', application_source_storage_instance_id, ('source', 'payload'), None),
    ('application_source_server_id', '/source/server_id', "equals the payload's",
     'source_server_id', application_source_server_id, ('source', 'payload'), None),
    ('application_wrapper_storage_instance_id', '/wrapper/storage_instance_id', "equals the payload's",
     'source_storage_instance_id', application_wrapper_storage_instance_id, ('wrapper', 'payload'), None),
    ('application_wrapper_server_id', '/wrapper/server_id', "equals the payload's",
     'source_server_id', application_wrapper_server_id, ('wrapper', 'payload'), None),
    ('source_operation_join', '/source/original_operation_id', "equals the payload's operation_id",
     'source_original_join', source_operation_join, ('source', 'payload'), 'original_join'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('application_source_storage_instance_id', g.Invariant('/source/storage_instance_id', "equals the payload's"), 'source_storage_instance_id', application_source_storage_instance_id),
        g.Guard('application_source_server_id', g.Invariant('/source/server_id', "equals the payload's"), 'source_server_id', application_source_server_id),
        g.Guard('application_wrapper_storage_instance_id', g.Invariant('/wrapper/storage_instance_id', "equals the payload's"), 'source_storage_instance_id', application_wrapper_storage_instance_id),
        g.Guard('application_wrapper_server_id', g.Invariant('/wrapper/server_id', "equals the payload's"), 'source_server_id', application_wrapper_server_id),
        g.Guard('source_operation_join', g.Invariant('/source/original_operation_id', "equals the payload's operation_id"), 'source_original_join', source_operation_join),
    ])
    context = None

    def check(complete):
        table.require('application_source_storage_instance_id', complete, context)
        table.require('application_source_server_id', complete, context)
        table.require('application_wrapper_storage_instance_id', complete, context)
        table.require('application_wrapper_server_id', complete, context)
        table.require('source_operation_join', complete, context)
        return True
    return g.Case(table, check, context)
