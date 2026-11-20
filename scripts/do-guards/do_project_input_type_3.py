"""DO guard suite `project_input_type_3` (sweep part 2A). Project original input adapter: exact types (OSI-247/299/301; project_original_input_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def project_source_message_schema_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if type(value['source']['message_schema']) is not str else None


def project_source_message_ids_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if type(value['source']['message_ids']) is not list else None


def project_source_message_ids_items(value, context):
    if value['project_shape_valid'] is not True:
        return None
    ids = value['source']['message_ids']
    if type(ids) is not list:
        return None
    for item in ids:
        if type(item) is not str:
            return 'project_original_input_type'
    return None


def project_message_message_id_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if type(value['message']['message_id']) is not str else None


def project_message_from_agent_id_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if type(value['message']['from_agent_id']) is not str else None


ROWS = (
    ('project_source_message_schema_type', '/source/message_schema', 'is a string',
     'project_original_input_type', project_source_message_schema_type, ('source', 'project_shape_valid'), 'project_type'),
    ('project_source_message_ids_type', '/source/message_ids', 'is an array',
     'project_original_input_type', project_source_message_ids_type, ('source', 'project_shape_valid'), 'project_type'),
    ('project_source_message_ids_items', '/source/message_ids/*', 'is a string',
     'project_original_input_type', project_source_message_ids_items, ('source', 'project_shape_valid'), 'project_type'),
    ('project_message_message_id_type', '/source/original_input/message_id', 'is a string',
     'project_original_input_type', project_message_message_id_type, ('message', 'project_shape_valid'), 'project_type'),
    ('project_message_from_agent_id_type', '/source/original_input/from_agent_id', 'is a string',
     'project_original_input_type', project_message_from_agent_id_type, ('message', 'project_shape_valid'), 'project_type'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('project_source_message_schema_type', g.Invariant('/source/message_schema', 'is a string'), 'project_original_input_type', project_source_message_schema_type),
        g.Guard('project_source_message_ids_type', g.Invariant('/source/message_ids', 'is an array'), 'project_original_input_type', project_source_message_ids_type),
        g.Guard('project_source_message_ids_items', g.Invariant('/source/message_ids/*', 'is a string'), 'project_original_input_type', project_source_message_ids_items),
        g.Guard('project_message_message_id_type', g.Invariant('/source/original_input/message_id', 'is a string'), 'project_original_input_type', project_message_message_id_type),
        g.Guard('project_message_from_agent_id_type', g.Invariant('/source/original_input/from_agent_id', 'is a string'), 'project_original_input_type', project_message_from_agent_id_type),
    ])
    context = None

    def check(complete):
        table.require('project_source_message_schema_type', complete, context)
        table.require('project_source_message_ids_type', complete, context)
        table.require('project_source_message_ids_items', complete, context)
        table.require('project_message_message_id_type', complete, context)
        table.require('project_message_from_agent_id_type', complete, context)
        return True
    return g.Case(table, check, context)
