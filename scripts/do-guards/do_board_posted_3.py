"""DO guard suite `board_posted_3` (sweep part 2A). Board source: crew.board_message_posted message copies.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def posted_project_priority(value, context):
    if value['event_type'] != 'crew.board_message_posted' or value['payload']['scope'] == 'application':
        return None
    return 'message_priority' if value['message'].get('priority') != value['payload'].get('priority') else None


def posted_project_to_agent_id(value, context):
    if value['event_type'] != 'crew.board_message_posted' or value['payload']['scope'] == 'application':
        return None
    return 'message_to_agent_id' if value['message'].get('to_agent_id') != value['payload'].get('to_agent_id') else None


def posted_project_to_agent_type(value, context):
    if value['event_type'] != 'crew.board_message_posted' or value['payload']['scope'] == 'application':
        return None
    return 'message_to_agent_type' if value['message'].get('to_agent_type') != value['payload'].get('to_agent_type') else None


def posted_project_content(value, context):
    if value['event_type'] != 'crew.board_message_posted' or value['payload']['scope'] == 'application':
        return None
    return 'message_content_join' if value['message'].get('content') != value['payload'].get('content') else None


def posted_project_content_ref(value, context):
    if value['event_type'] != 'crew.board_message_posted' or value['payload']['scope'] == 'application':
        return None
    return 'message_content_join' if value['message'].get('content_ref') != value['payload'].get('content_ref') else None


ROWS = (
    ('posted_project_priority', '/source/original_input/priority', "equals the payload's (posted, Project)",
     'message_priority', posted_project_priority, ('event_type', 'payload', 'message'), None),
    ('posted_project_to_agent_id', '/source/original_input/to_agent_id', "equals the payload's (posted, Project)",
     'message_to_agent_id', posted_project_to_agent_id, ('event_type', 'payload', 'message'), None),
    ('posted_project_to_agent_type', '/source/original_input/to_agent_type', "equals the payload's (posted, Project)",
     'message_to_agent_type', posted_project_to_agent_type, ('event_type', 'payload', 'message'), None),
    ('posted_project_content', '/source/original_input/content', "equals the payload's (posted, Project)",
     'message_content_join', posted_project_content, ('event_type', 'payload', 'message'), 'content_join'),
    ('posted_project_content_ref', '/source/original_input/content_ref', "equals the payload's (posted, Project)",
     'message_content_join', posted_project_content_ref, ('event_type', 'payload', 'message'), 'content_join'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('posted_project_priority', g.Invariant('/source/original_input/priority', "equals the payload's (posted, Project)"), 'message_priority', posted_project_priority),
        g.Guard('posted_project_to_agent_id', g.Invariant('/source/original_input/to_agent_id', "equals the payload's (posted, Project)"), 'message_to_agent_id', posted_project_to_agent_id),
        g.Guard('posted_project_to_agent_type', g.Invariant('/source/original_input/to_agent_type', "equals the payload's (posted, Project)"), 'message_to_agent_type', posted_project_to_agent_type),
        g.Guard('posted_project_content', g.Invariant('/source/original_input/content', "equals the payload's (posted, Project)"), 'message_content_join', posted_project_content),
        g.Guard('posted_project_content_ref', g.Invariant('/source/original_input/content_ref', "equals the payload's (posted, Project)"), 'message_content_join', posted_project_content_ref),
    ])
    context = None

    def check(complete):
        table.require('posted_project_priority', complete, context)
        table.require('posted_project_to_agent_id', complete, context)
        table.require('posted_project_to_agent_type', complete, context)
        table.require('posted_project_content', complete, context)
        table.require('posted_project_content_ref', complete, context)
        return True
    return g.Case(table, check, context)
