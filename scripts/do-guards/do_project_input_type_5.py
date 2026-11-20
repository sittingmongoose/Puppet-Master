"""DO guard suite `project_input_type_5` (sweep part 2A). Project original input adapter: exact types (OSI-247/299/301; project_original_input_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def project_message_message_type_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if type(value['message']['message_type']) is not str else None


def project_message_priority_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if type(value['message']['priority']) is not str else None


def project_message_subject_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if type(value['message']['subject']) is not str else None


def project_message_content_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if value['message']['content'] is not None and type(value['message']['content']) is not str else None


def project_message_content_ref_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if value['message']['content_ref'] is not None and type(value['message']['content_ref']) is not dict else None


ROWS = (
    ('project_message_message_type_type', '/source/original_input/message_type', 'is a string',
     'project_original_input_type', project_message_message_type_type, ('message', 'project_shape_valid'), 'project_type'),
    ('project_message_priority_type', '/source/original_input/priority', 'is a string',
     'project_original_input_type', project_message_priority_type, ('message', 'project_shape_valid'), 'project_type'),
    ('project_message_subject_type', '/source/original_input/subject', 'is a string',
     'project_original_input_type', project_message_subject_type, ('message', 'project_shape_valid'), 'project_type'),
    ('project_message_content_type', '/source/original_input/content', 'is a string or null',
     'project_original_input_type', project_message_content_type, ('message', 'project_shape_valid'), 'project_type'),
    ('project_message_content_ref_type', '/source/original_input/content_ref', 'is an object or null',
     'project_original_input_type', project_message_content_ref_type, ('message', 'project_shape_valid'), 'project_type'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('project_message_message_type_type', g.Invariant('/source/original_input/message_type', 'is a string'), 'project_original_input_type', project_message_message_type_type),
        g.Guard('project_message_priority_type', g.Invariant('/source/original_input/priority', 'is a string'), 'project_original_input_type', project_message_priority_type),
        g.Guard('project_message_subject_type', g.Invariant('/source/original_input/subject', 'is a string'), 'project_original_input_type', project_message_subject_type),
        g.Guard('project_message_content_type', g.Invariant('/source/original_input/content', 'is a string or null'), 'project_original_input_type', project_message_content_type),
        g.Guard('project_message_content_ref_type', g.Invariant('/source/original_input/content_ref', 'is an object or null'), 'project_original_input_type', project_message_content_ref_type),
    ])
    context = None

    def check(complete):
        table.require('project_message_message_type_type', complete, context)
        table.require('project_message_priority_type', complete, context)
        table.require('project_message_subject_type', complete, context)
        table.require('project_message_content_type', complete, context)
        table.require('project_message_content_ref_type', complete, context)
        return True
    return g.Case(table, check, context)
