"""DO guard suite `project_input_type_1` (sweep part 2A). Project original input adapter: exact types (OSI-247/299/301; project_original_input_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def project_source_scope_type(value, context):
    return 'project_original_input_type' if type(value['source']['scope']) is not str else None


def project_source_storage_instance_id_type(value, context):
    return 'project_original_input_type' if type(value['source']['storage_instance_id']) is not str else None


def project_source_server_id_type(value, context):
    return 'project_original_input_type' if type(value['source']['server_id']) is not str else None


def project_source_thread_id_type(value, context):
    return 'project_original_input_type' if type(value['source']['thread_id']) is not str else None


def project_source_crew_id_type(value, context):
    return 'project_original_input_type' if type(value['source']['crew_id']) is not str else None


ROWS = (
    ('project_source_scope_type', '/source/scope', 'is a string',
     'project_original_input_type', project_source_scope_type, ('source',), 'project_type'),
    ('project_source_storage_instance_id_type', '/source/storage_instance_id', 'is a string',
     'project_original_input_type', project_source_storage_instance_id_type, ('source',), 'project_type'),
    ('project_source_server_id_type', '/source/server_id', 'is a string',
     'project_original_input_type', project_source_server_id_type, ('source',), 'project_type'),
    ('project_source_thread_id_type', '/source/thread_id', 'is a string',
     'project_original_input_type', project_source_thread_id_type, ('source',), 'project_type'),
    ('project_source_crew_id_type', '/source/crew_id', 'is a string',
     'project_original_input_type', project_source_crew_id_type, ('source',), 'project_type'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('project_source_scope_type', g.Invariant('/source/scope', 'is a string'), 'project_original_input_type', project_source_scope_type),
        g.Guard('project_source_storage_instance_id_type', g.Invariant('/source/storage_instance_id', 'is a string'), 'project_original_input_type', project_source_storage_instance_id_type),
        g.Guard('project_source_server_id_type', g.Invariant('/source/server_id', 'is a string'), 'project_original_input_type', project_source_server_id_type),
        g.Guard('project_source_thread_id_type', g.Invariant('/source/thread_id', 'is a string'), 'project_original_input_type', project_source_thread_id_type),
        g.Guard('project_source_crew_id_type', g.Invariant('/source/crew_id', 'is a string'), 'project_original_input_type', project_source_crew_id_type),
    ])
    context = None

    def check(complete):
        table.require('project_source_scope_type', complete, context)
        table.require('project_source_storage_instance_id_type', complete, context)
        table.require('project_source_server_id_type', complete, context)
        table.require('project_source_thread_id_type', complete, context)
        table.require('project_source_crew_id_type', complete, context)
        return True
    return g.Case(table, check, context)
