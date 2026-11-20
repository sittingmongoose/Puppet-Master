"""DO guard suite `project_input_type_7` (sweep part 2A). Project original input adapter: exact types (OSI-247/299/301; project_original_input_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g

CONTEXT_FIELDS = ('files', 'operations', 'sender_node', 'related_message_ids')


def project_message_resolved_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    return 'project_original_input_type' if type(value['message']['resolved']) is not bool else None


def project_message_read_by_items(value, context):
    if value['project_shape_valid'] is not True:
        return None
    readers = value['message']['read_by']
    if type(readers) is not list:
        return None
    for item in readers:
        if type(item) is not str:
            return 'project_original_input_type'
    return None


def project_context_members(value, context):
    if value['project_shape_valid'] is not True:
        return None
    found = value['message']['context']
    if type(found) is not dict:
        return None
    return 'project_original_input_type' if set(found.keys()) != set(CONTEXT_FIELDS) else None


def project_context_sender_node(value, context):
    if value['project_shape_valid'] is not True:
        return None
    found = value['message']['context']
    if type(found) is not dict or set(found.keys()) != set(CONTEXT_FIELDS):
        return None
    node = found['sender_node']
    return 'project_original_input_type' if node is not None and type(node) is not str else None


def project_context_files_type(value, context):
    if value['project_shape_valid'] is not True:
        return None
    found = value['message']['context']
    if type(found) is not dict or set(found.keys()) != set(CONTEXT_FIELDS):
        return None
    return 'project_original_input_type' if type(found['files']) is not list else None


ROWS = (
    ('project_message_resolved_type', '/source/original_input/resolved', 'is a boolean',
     'project_original_input_type', project_message_resolved_type, ('message', 'project_shape_valid'), 'project_type'),
    ('project_message_read_by_items', '/source/original_input/read_by/*', 'is a string',
     'project_original_input_type', project_message_read_by_items, ('message', 'project_shape_valid'), 'project_type'),
    ('project_context_members', '/source/original_input/context', 'has exactly files, operations, sender_node and related_message_ids',
     'project_original_input_type', project_context_members, ('message', 'project_shape_valid'), 'project_type'),
    ('project_context_sender_node', '/source/original_input/context/sender_node', 'is a string or null',
     'project_original_input_type', project_context_sender_node, ('message', 'project_shape_valid'), 'project_type'),
    ('project_context_files_type', '/source/original_input/context/files', 'is an array',
     'project_original_input_type', project_context_files_type, ('message', 'project_shape_valid'), 'project_type'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('project_message_resolved_type', g.Invariant('/source/original_input/resolved', 'is a boolean'), 'project_original_input_type', project_message_resolved_type),
        g.Guard('project_message_read_by_items', g.Invariant('/source/original_input/read_by/*', 'is a string'), 'project_original_input_type', project_message_read_by_items),
        g.Guard('project_context_members', g.Invariant('/source/original_input/context', 'has exactly files, operations, sender_node and related_message_ids'), 'project_original_input_type', project_context_members),
        g.Guard('project_context_sender_node', g.Invariant('/source/original_input/context/sender_node', 'is a string or null'), 'project_original_input_type', project_context_sender_node),
        g.Guard('project_context_files_type', g.Invariant('/source/original_input/context/files', 'is an array'), 'project_original_input_type', project_context_files_type),
    ])
    context = None

    def check(complete):
        table.require('project_message_resolved_type', complete, context)
        table.require('project_message_read_by_items', complete, context)
        table.require('project_context_members', complete, context)
        table.require('project_context_sender_node', complete, context)
        table.require('project_context_files_type', complete, context)
        return True
    return g.Case(table, check, context)
