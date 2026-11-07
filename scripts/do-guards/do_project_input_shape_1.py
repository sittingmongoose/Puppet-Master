"""DO guard suite `project_input_shape_1` (sweep part 2A). Project original input adapter: shape (project_original_input_errors stops after it).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g

PROJECT_SOURCE_FIELDS = {'scope', 'storage_instance_id', 'server_id', 'thread_id', 'crew_id', 'run_id', 'operation_id',
                         'project_id', 'edition', 'interface', 'message_schema', 'message_ids', 'original_input'}
PROJECT_MESSAGE_FIELDS = {'message_id', 'from_agent_id', 'from_platform', 'to_agent_id', 'to_agent_type', 'to_node_id',
                          'to_lane_id', 'message_type', 'priority', 'subject', 'content', 'content_ref', 'context',
                          'thread_id', 'in_reply_to', 'created_at', 'read_by', 'resolved'}


def project_source_object(value, context):
    return 'project_original_input_shape' if type(value['source']) is not dict else None


def project_source_members(value, context):
    source = value['source']
    if type(source) is not dict:
        return None
    return 'project_original_input_shape' if set(source.keys()) != PROJECT_SOURCE_FIELDS else None


def project_message_object(value, context):
    if type(value['source']) is not dict:
        return None
    return 'project_original_input_shape' if type(value['message']) is not dict else None


def project_message_members(value, context):
    message = value['message']
    if type(value['source']) is not dict or type(message) is not dict:
        return None
    return 'project_original_input_shape' if set(message.keys()) != PROJECT_MESSAGE_FIELDS else None


ROWS = (
    ('project_source_object', '/source', 'is an object',
     'project_original_input_shape', project_source_object, ('source',), 'project_shape'),
    ('project_source_members', '/source', 'has exactly the Project adapter source members',
     'project_original_input_shape', project_source_members, ('source',), 'project_shape'),
    ('project_message_object', '/source/original_input', 'is an object',
     'project_original_input_shape', project_message_object, ('source', 'message'), 'project_shape'),
    ('project_message_members', '/source/original_input', 'has exactly the OSI-247 agent message members',
     'project_original_input_shape', project_message_members, ('source', 'message'), 'project_shape'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('project_source_object', g.Invariant('/source', 'is an object'), 'project_original_input_shape', project_source_object),
        g.Guard('project_source_members', g.Invariant('/source', 'has exactly the Project adapter source members'), 'project_original_input_shape', project_source_members),
        g.Guard('project_message_object', g.Invariant('/source/original_input', 'is an object'), 'project_original_input_shape', project_message_object),
        g.Guard('project_message_members', g.Invariant('/source/original_input', 'has exactly the OSI-247 agent message members'), 'project_original_input_shape', project_message_members),
    ])
    context = None

    def check(complete):
        table.require('project_source_object', complete, context)
        table.require('project_source_members', complete, context)
        table.require('project_message_object', complete, context)
        table.require('project_message_members', complete, context)
        return True
    return g.Case(table, check, context)
