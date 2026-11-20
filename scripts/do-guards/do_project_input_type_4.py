"""DO guard suite `project_input_type_4` (sweep part 2A). Project original input adapter: exact types (OSI-247/299/301; project_original_input_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def project_message_from_platform_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if type(value['message']['from_platform']) is not str else None


def project_message_to_agent_id_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if value['message']['to_agent_id'] is not None and type(value['message']['to_agent_id']) is not str else None


def project_message_to_agent_type_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if value['message']['to_agent_type'] is not None and type(value['message']['to_agent_type']) is not str else None


def project_message_to_node_id_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if value['message']['to_node_id'] is not None and type(value['message']['to_node_id']) is not str else None


def project_message_to_lane_id_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if value['message']['to_lane_id'] is not None and type(value['message']['to_lane_id']) is not str else None


ROWS = (
    ('project_message_from_platform_type', '/source/original_input/from_platform', 'is a string',
     'project_original_input_type', project_message_from_platform_type, ('message', 'project_shape_valid'), 'project_type'),
    ('project_message_to_agent_id_type', '/source/original_input/to_agent_id', 'is a string or null',
     'project_original_input_type', project_message_to_agent_id_type, ('message', 'project_shape_valid'), 'project_type'),
    ('project_message_to_agent_type_type', '/source/original_input/to_agent_type', 'is a string or null',
     'project_original_input_type', project_message_to_agent_type_type, ('message', 'project_shape_valid'), 'project_type'),
    ('project_message_to_node_id_type', '/source/original_input/to_node_id', 'is a string or null',
     'project_original_input_type', project_message_to_node_id_type, ('message', 'project_shape_valid'), 'project_type'),
    ('project_message_to_lane_id_type', '/source/original_input/to_lane_id', 'is a string or null',
     'project_original_input_type', project_message_to_lane_id_type, ('message', 'project_shape_valid'), 'project_type'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('project_message_from_platform_type', g.Invariant('/source/original_input/from_platform', 'is a string'), 'project_original_input_type', project_message_from_platform_type),
        g.Guard('project_message_to_agent_id_type', g.Invariant('/source/original_input/to_agent_id', 'is a string or null'), 'project_original_input_type', project_message_to_agent_id_type),
        g.Guard('project_message_to_agent_type_type', g.Invariant('/source/original_input/to_agent_type', 'is a string or null'), 'project_original_input_type', project_message_to_agent_type_type),
        g.Guard('project_message_to_node_id_type', g.Invariant('/source/original_input/to_node_id', 'is a string or null'), 'project_original_input_type', project_message_to_node_id_type),
        g.Guard('project_message_to_lane_id_type', g.Invariant('/source/original_input/to_lane_id', 'is a string or null'), 'project_original_input_type', project_message_to_lane_id_type),
    ])
    context = None

    def check(complete):
        table.require('project_message_from_platform_type', complete, context)
        table.require('project_message_to_agent_id_type', complete, context)
        table.require('project_message_to_agent_type_type', complete, context)
        table.require('project_message_to_node_id_type', complete, context)
        table.require('project_message_to_lane_id_type', complete, context)
        return True
    return g.Case(table, check, context)
