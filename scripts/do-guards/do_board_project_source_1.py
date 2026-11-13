"""DO guard suite `board_project_source_1` (sweep part 2A). Board source, Project scope: the adapter source joins to the payload.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def project_source_scope_join(value, context):
    if value['board_branch'] != 'project' or value['project_input_valid'] is not True:
        return None
    return 'source_scope' if value['source'].get('scope') != value['payload'].get('scope') else None


def project_source_storage_instance_id_join(value, context):
    if value['board_branch'] != 'project' or value['project_input_valid'] is not True:
        return None
    return 'source_storage_instance_id' if value['source'].get('storage_instance_id') != value['payload'].get('storage_instance_id') else None


def project_source_server_id_join(value, context):
    if value['board_branch'] != 'project' or value['project_input_valid'] is not True:
        return None
    return 'source_server_id' if value['source'].get('server_id') != value['payload'].get('server_id') else None


def project_source_thread_id_join(value, context):
    if value['board_branch'] != 'project' or value['project_input_valid'] is not True:
        return None
    return 'source_thread_id' if value['source'].get('thread_id') != value['payload'].get('thread_id') else None


def project_source_crew_id_join(value, context):
    if value['board_branch'] != 'project' or value['project_input_valid'] is not True:
        return None
    return 'source_crew_id' if value['source'].get('crew_id') != value['payload'].get('crew_id') else None


ROWS = (
    ('project_source_scope_join', '/source/scope', "equals the payload's",
     'source_scope', project_source_scope_join, ('source', 'payload', 'board_branch', 'project_input_valid'), None),
    ('project_source_storage_instance_id_join', '/source/storage_instance_id', "equals the payload's",
     'source_storage_instance_id', project_source_storage_instance_id_join, ('source', 'payload', 'board_branch', 'project_input_valid'), None),
    ('project_source_server_id_join', '/source/server_id', "equals the payload's",
     'source_server_id', project_source_server_id_join, ('source', 'payload', 'board_branch', 'project_input_valid'), None),
    ('project_source_thread_id_join', '/source/thread_id', "equals the payload's",
     'source_thread_id', project_source_thread_id_join, ('source', 'payload', 'board_branch', 'project_input_valid'), None),
    ('project_source_crew_id_join', '/source/crew_id', "equals the payload's",
     'source_crew_id', project_source_crew_id_join, ('source', 'payload', 'board_branch', 'project_input_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('project_source_scope_join', g.Invariant('/source/scope', "equals the payload's"), 'source_scope', project_source_scope_join),
        g.Guard('project_source_storage_instance_id_join', g.Invariant('/source/storage_instance_id', "equals the payload's"), 'source_storage_instance_id', project_source_storage_instance_id_join),
        g.Guard('project_source_server_id_join', g.Invariant('/source/server_id', "equals the payload's"), 'source_server_id', project_source_server_id_join),
        g.Guard('project_source_thread_id_join', g.Invariant('/source/thread_id', "equals the payload's"), 'source_thread_id', project_source_thread_id_join),
        g.Guard('project_source_crew_id_join', g.Invariant('/source/crew_id', "equals the payload's"), 'source_crew_id', project_source_crew_id_join),
    ])
    context = None

    def check(complete):
        table.require('project_source_scope_join', complete, context)
        table.require('project_source_storage_instance_id_join', complete, context)
        table.require('project_source_server_id_join', complete, context)
        table.require('project_source_thread_id_join', complete, context)
        table.require('project_source_crew_id_join', complete, context)
        return True
    return g.Case(table, check, context)
