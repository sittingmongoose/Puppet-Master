"""DO guard suite `project_input_type_2` (sweep part 2A). Project original input adapter: exact types (OSI-247/299/301; project_original_input_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def project_source_run_id_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if type(value['source']['run_id']) is not str else None


def project_source_operation_id_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if type(value['source']['operation_id']) is not str else None


def project_source_project_id_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if type(value['source']['project_id']) is not str else None


def project_source_edition_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if type(value['source']['edition']) is not str else None


def project_source_interface_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if type(value['source']['interface']) is not str else None


ROWS = (
    ('project_source_run_id_type', '/source/run_id', 'is a string',
     'project_original_input_type', project_source_run_id_type, ('source', 'project_shape_valid'), 'project_type'),
    ('project_source_operation_id_type', '/source/operation_id', 'is a string',
     'project_original_input_type', project_source_operation_id_type, ('source', 'project_shape_valid'), 'project_type'),
    ('project_source_project_id_type', '/source/project_id', 'is a string',
     'project_original_input_type', project_source_project_id_type, ('source', 'project_shape_valid'), 'project_type'),
    ('project_source_edition_type', '/source/edition', 'is a string',
     'project_original_input_type', project_source_edition_type, ('source', 'project_shape_valid'), 'project_type'),
    ('project_source_interface_type', '/source/interface', 'is a string',
     'project_original_input_type', project_source_interface_type, ('source', 'project_shape_valid'), 'project_type'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('project_source_run_id_type', g.Invariant('/source/run_id', 'is a string'), 'project_original_input_type', project_source_run_id_type),
        g.Guard('project_source_operation_id_type', g.Invariant('/source/operation_id', 'is a string'), 'project_original_input_type', project_source_operation_id_type),
        g.Guard('project_source_project_id_type', g.Invariant('/source/project_id', 'is a string'), 'project_original_input_type', project_source_project_id_type),
        g.Guard('project_source_edition_type', g.Invariant('/source/edition', 'is a string'), 'project_original_input_type', project_source_edition_type),
        g.Guard('project_source_interface_type', g.Invariant('/source/interface', 'is a string'), 'project_original_input_type', project_source_interface_type),
    ])
    context = None

    def check(complete):
        table.require('project_source_run_id_type', complete, context)
        table.require('project_source_operation_id_type', complete, context)
        table.require('project_source_project_id_type', complete, context)
        table.require('project_source_edition_type', complete, context)
        table.require('project_source_interface_type', complete, context)
        return True
    return g.Case(table, check, context)
