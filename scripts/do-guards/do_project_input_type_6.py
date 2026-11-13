"""DO guard suite `project_input_type_6` (sweep part 2A). Project original input adapter: exact types (OSI-247/299/301; project_original_input_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def project_message_context_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if type(value['message']['context']) is not dict else None


def project_message_thread_id_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if value['message']['thread_id'] is not None and type(value['message']['thread_id']) is not str else None


def project_message_in_reply_to_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if value['message']['in_reply_to'] is not None and type(value['message']['in_reply_to']) is not str else None


def project_message_created_at_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if type(value['message']['created_at']) is not str else None


def project_message_read_by_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if type(value['message']['read_by']) is not list else None


ROWS = (
    ('project_message_context_type', '/source/original_input/context', 'is an object',
     'project_original_input_type', project_message_context_type, ('message', 'project_shape_valid'), 'project_type'),
    ('project_message_thread_id_type', '/source/original_input/thread_id', 'is a string or null',
     'project_original_input_type', project_message_thread_id_type, ('message', 'project_shape_valid'), 'project_type'),
    ('project_message_in_reply_to_type', '/source/original_input/in_reply_to', 'is a string or null',
     'project_original_input_type', project_message_in_reply_to_type, ('message', 'project_shape_valid'), 'project_type'),
    ('project_message_created_at_type', '/source/original_input/created_at', 'is a string',
     'project_original_input_type', project_message_created_at_type, ('message', 'project_shape_valid'), 'project_type'),
    ('project_message_read_by_type', '/source/original_input/read_by', 'is an array',
     'project_original_input_type', project_message_read_by_type, ('message', 'project_shape_valid'), 'project_type'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('project_message_context_type', g.Invariant('/source/original_input/context', 'is an object'), 'project_original_input_type', project_message_context_type),
        g.Guard('project_message_thread_id_type', g.Invariant('/source/original_input/thread_id', 'is a string or null'), 'project_original_input_type', project_message_thread_id_type),
        g.Guard('project_message_in_reply_to_type', g.Invariant('/source/original_input/in_reply_to', 'is a string or null'), 'project_original_input_type', project_message_in_reply_to_type),
        g.Guard('project_message_created_at_type', g.Invariant('/source/original_input/created_at', 'is a string'), 'project_original_input_type', project_message_created_at_type),
        g.Guard('project_message_read_by_type', g.Invariant('/source/original_input/read_by', 'is an array'), 'project_original_input_type', project_message_read_by_type),
    ])
    context = None

    def check(complete):
        table.require('project_message_context_type', complete, context)
        table.require('project_message_thread_id_type', complete, context)
        table.require('project_message_in_reply_to_type', complete, context)
        table.require('project_message_created_at_type', complete, context)
        table.require('project_message_read_by_type', complete, context)
        return True
    return g.Case(table, check, context)
