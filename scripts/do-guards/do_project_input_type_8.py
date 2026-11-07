"""DO guard suite `project_input_type_8` (sweep part 2A). Project original input adapter: exact types (OSI-247/299/301; project_original_input_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g

CONTEXT_FIELDS = {'files', 'operations', 'sender_node', 'related_message_ids'}


def project_context_files_items(value, context):
    found = value['message']['context']
    if type(found) is not dict or set(found.keys()) != CONTEXT_FIELDS or type(found['files']) is not list:
        return None
    for item in found['files']:
        if type(item) is not str:
            return 'project_original_input_type'
    return None


def project_context_operations_type(value, context):
    found = value['message']['context']
    if type(found) is not dict or set(found.keys()) != CONTEXT_FIELDS:
        return None
    return 'project_original_input_type' if type(found['operations']) is not list else None


def project_context_operations_items(value, context):
    found = value['message']['context']
    if type(found) is not dict or set(found.keys()) != CONTEXT_FIELDS or type(found['operations']) is not list:
        return None
    for item in found['operations']:
        if type(item) is not str:
            return 'project_original_input_type'
    return None


def project_context_related_message_ids_type(value, context):
    found = value['message']['context']
    if type(found) is not dict or set(found.keys()) != CONTEXT_FIELDS:
        return None
    return 'project_original_input_type' if type(found['related_message_ids']) is not list else None


def project_context_related_message_ids_items(value, context):
    found = value['message']['context']
    if type(found) is not dict or set(found.keys()) != CONTEXT_FIELDS or type(found['related_message_ids']) is not list:
        return None
    for item in found['related_message_ids']:
        if type(item) is not str:
            return 'project_original_input_type'
    return None


ROWS = (
    ('project_context_files_items', '/source/original_input/context/files/*', 'is a string',
     'project_original_input_type', project_context_files_items, ('message',), 'project_type'),
    ('project_context_operations_type', '/source/original_input/context/operations', 'is an array',
     'project_original_input_type', project_context_operations_type, ('message',), 'project_type'),
    ('project_context_operations_items', '/source/original_input/context/operations/*', 'is a string',
     'project_original_input_type', project_context_operations_items, ('message',), 'project_type'),
    ('project_context_related_message_ids_type', '/source/original_input/context/related_message_ids', 'is an array',
     'project_original_input_type', project_context_related_message_ids_type, ('message',), 'project_type'),
    ('project_context_related_message_ids_items', '/source/original_input/context/related_message_ids/*', 'is a string',
     'project_original_input_type', project_context_related_message_ids_items, ('message',), 'project_type'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('project_context_files_items', g.Invariant('/source/original_input/context/files/*', 'is a string'), 'project_original_input_type', project_context_files_items),
        g.Guard('project_context_operations_type', g.Invariant('/source/original_input/context/operations', 'is an array'), 'project_original_input_type', project_context_operations_type),
        g.Guard('project_context_operations_items', g.Invariant('/source/original_input/context/operations/*', 'is a string'), 'project_original_input_type', project_context_operations_items),
        g.Guard('project_context_related_message_ids_type', g.Invariant('/source/original_input/context/related_message_ids', 'is an array'), 'project_original_input_type', project_context_related_message_ids_type),
        g.Guard('project_context_related_message_ids_items', g.Invariant('/source/original_input/context/related_message_ids/*', 'is a string'), 'project_original_input_type', project_context_related_message_ids_items),
    ])
    context = None

    def check(complete):
        table.require('project_context_files_items', complete, context)
        table.require('project_context_operations_type', complete, context)
        table.require('project_context_operations_items', complete, context)
        table.require('project_context_related_message_ids_type', complete, context)
        table.require('project_context_related_message_ids_items', complete, context)
        return True
    return g.Case(table, check, context)
