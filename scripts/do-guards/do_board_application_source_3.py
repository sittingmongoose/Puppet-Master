"""DO guard suite `board_application_source_3` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def source_scope_application_thread_mismatch(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'application_thread_mismatch' if 'application_thread_mismatch' in value['source_scope_failures'] else None


def source_scope_wrapper_record_scope_mismatch(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'wrapper_record_scope_mismatch' if 'wrapper_record_scope_mismatch' in value['source_scope_failures'] else None


def source_scope_wrapper_record_server_id_mismatch(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'wrapper_record_server_id_mismatch' if 'wrapper_record_server_id_mismatch' in value['source_scope_failures'] else None


def source_scope_wrapper_record_storage_instance_id_mismatch(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'wrapper_record_storage_instance_id_mismatch' if 'wrapper_record_storage_instance_id_mismatch' in value['source_scope_failures'] else None


def wrapper_scope_application_scope_identity(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'application_scope_identity' if 'application_scope_identity' in value['wrapper_scope_failures'] else None


ROWS = (
    ('source_scope_application_thread_mismatch', '/source', 'has no application_thread_mismatch (the shared scope_failures helper)',
     'application_thread_mismatch', source_scope_application_thread_mismatch, ('source_scope_failures', 'board_branch', 'application_shape_valid'), None),
    ('source_scope_wrapper_record_scope_mismatch', '/source', 'has no wrapper_record_scope_mismatch (the shared scope_failures helper)',
     'wrapper_record_scope_mismatch', source_scope_wrapper_record_scope_mismatch, ('source_scope_failures', 'board_branch', 'application_shape_valid'), None),
    ('source_scope_wrapper_record_server_id_mismatch', '/source', 'has no wrapper_record_server_id_mismatch (the shared scope_failures helper)',
     'wrapper_record_server_id_mismatch', source_scope_wrapper_record_server_id_mismatch, ('source_scope_failures', 'board_branch', 'application_shape_valid'), None),
    ('source_scope_wrapper_record_storage_instance_id_mismatch', '/source', 'has no wrapper_record_storage_instance_id_mismatch (the shared scope_failures helper)',
     'wrapper_record_storage_instance_id_mismatch', source_scope_wrapper_record_storage_instance_id_mismatch, ('source_scope_failures', 'board_branch', 'application_shape_valid'), None),
    ('wrapper_scope_application_scope_identity', '/wrapper', 'has no application_scope_identity (the shared scope_failures helper)',
     'application_scope_identity', wrapper_scope_application_scope_identity, ('wrapper_scope_failures', 'board_branch', 'application_shape_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('source_scope_application_thread_mismatch', g.Invariant('/source', 'has no application_thread_mismatch (the shared scope_failures helper)'), 'application_thread_mismatch', source_scope_application_thread_mismatch),
        g.Guard('source_scope_wrapper_record_scope_mismatch', g.Invariant('/source', 'has no wrapper_record_scope_mismatch (the shared scope_failures helper)'), 'wrapper_record_scope_mismatch', source_scope_wrapper_record_scope_mismatch),
        g.Guard('source_scope_wrapper_record_server_id_mismatch', g.Invariant('/source', 'has no wrapper_record_server_id_mismatch (the shared scope_failures helper)'), 'wrapper_record_server_id_mismatch', source_scope_wrapper_record_server_id_mismatch),
        g.Guard('source_scope_wrapper_record_storage_instance_id_mismatch', g.Invariant('/source', 'has no wrapper_record_storage_instance_id_mismatch (the shared scope_failures helper)'), 'wrapper_record_storage_instance_id_mismatch', source_scope_wrapper_record_storage_instance_id_mismatch),
        g.Guard('wrapper_scope_application_scope_identity', g.Invariant('/wrapper', 'has no application_scope_identity (the shared scope_failures helper)'), 'application_scope_identity', wrapper_scope_application_scope_identity),
    ])
    context = None

    def check(complete):
        table.require('source_scope_application_thread_mismatch', complete, context)
        table.require('source_scope_wrapper_record_scope_mismatch', complete, context)
        table.require('source_scope_wrapper_record_server_id_mismatch', complete, context)
        table.require('source_scope_wrapper_record_storage_instance_id_mismatch', complete, context)
        table.require('wrapper_scope_application_scope_identity', complete, context)
        return True
    return g.Case(table, check, context)
