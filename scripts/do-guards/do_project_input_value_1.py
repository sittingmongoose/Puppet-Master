"""DO guard suite `project_input_value_1` (sweep part 2A). Project original input adapter: enumerations, format and body representation.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def project_message_type_value(value, context):
    if value['project_types_valid'] is not True:
        return None
    return 'project_original_input_value' if value['message']['message_type'] not in ('Question', 'Answer', 'Update', 'Request', 'Decision', 'Warning', 'Announcement') else None


def project_priority_value(value, context):
    if value['project_types_valid'] is not True:
        return None
    return 'project_original_input_value' if value['message']['priority'] not in ('low', 'normal', 'high', 'urgent') else None


def project_message_schema_value(value, context):
    if value['project_types_valid'] is not True:
        return None
    return 'project_original_input_value' if value['source']['message_schema'] != 'original_project_agent_message' else None


def project_created_at_value(value, context):
    if value['project_types_valid'] is not True:
        return None
    return 'project_original_input_value' if value['created_at_conforms'] is not True else None


def project_body_representation(value, context):
    if value['project_types_valid'] is not True:
        return None
    return 'project_original_input_value' if (value['message']['content'] is None) == (value['message']['content_ref'] is None) else None


ROWS = (
    ('project_message_type_value', '/source/original_input/message_type', 'is an OSI-247 message type',
     'project_original_input_value', project_message_type_value, ('message', 'project_types_valid'), 'project_value'),
    ('project_priority_value', '/source/original_input/priority', 'is low, normal, high or urgent',
     'project_original_input_value', project_priority_value, ('message', 'project_types_valid'), 'project_value'),
    ('project_message_schema_value', '/source/message_schema', "is 'original_project_agent_message'",
     'project_original_input_value', project_message_schema_value, ('source', 'project_types_valid'), 'project_value'),
    ('project_created_at_value', '/source/original_input/created_at', 'is an RFC 3339 UTC date-time (the lane format checker)',
     'project_original_input_value', project_created_at_value, ('created_at_conforms', 'project_types_valid'), 'project_value'),
    ('project_body_representation', '/source/original_input/content', 'xor content_ref is present',
     'project_original_input_value', project_body_representation, ('message', 'project_types_valid'), 'project_value'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('project_message_type_value', g.Invariant('/source/original_input/message_type', 'is an OSI-247 message type'), 'project_original_input_value', project_message_type_value),
        g.Guard('project_priority_value', g.Invariant('/source/original_input/priority', 'is low, normal, high or urgent'), 'project_original_input_value', project_priority_value),
        g.Guard('project_message_schema_value', g.Invariant('/source/message_schema', "is 'original_project_agent_message'"), 'project_original_input_value', project_message_schema_value),
        g.Guard('project_created_at_value', g.Invariant('/source/original_input/created_at', 'is an RFC 3339 UTC date-time (the lane format checker)'), 'project_original_input_value', project_created_at_value),
        g.Guard('project_body_representation', g.Invariant('/source/original_input/content', 'xor content_ref is present'), 'project_original_input_value', project_body_representation),
    ])
    context = None

    def check(complete):
        table.require('project_message_type_value', complete, context)
        table.require('project_priority_value', complete, context)
        table.require('project_message_schema_value', complete, context)
        table.require('project_created_at_value', complete, context)
        table.require('project_body_representation', complete, context)
        return True
    return g.Case(table, check, context)
