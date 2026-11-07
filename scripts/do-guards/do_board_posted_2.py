"""DO guard suite `board_posted_2` (sweep part 2A). Board source: crew.board_message_posted message copies.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def posted_application_inline_text(value, context):
    if value['event_type'] != 'crew.board_message_posted' or value['payload']['scope'] != 'application':
        return None
    return 'message_content_join' if value['message']['inline_text'] != value['payload'].get('content') else None


def posted_application_payload_ref(value, context):
    if value['event_type'] != 'crew.board_message_posted' or value['payload']['scope'] != 'application':
        return None
    ref = value['payload'].get('content_ref', {})
    return 'message_content_join' if value['message']['blake3_payload_ref'] != ref.get('blake3_id') else None


def posted_project_message_id(value, context):
    if value['event_type'] != 'crew.board_message_posted' or value['payload']['scope'] == 'application':
        return None
    return 'message_message_id' if value['message'].get('message_id') != value['payload'].get('message_id') else None


def posted_project_from_agent_id(value, context):
    if value['event_type'] != 'crew.board_message_posted' or value['payload']['scope'] == 'application':
        return None
    return 'message_from_agent_id' if value['message'].get('from_agent_id') != value['payload'].get('from_agent_id') else None


def posted_project_subject(value, context):
    if value['event_type'] != 'crew.board_message_posted' or value['payload']['scope'] == 'application':
        return None
    return 'message_subject' if value['message'].get('subject') != value['payload'].get('subject') else None


ROWS = (
    ('posted_application_inline_text', '/source/original_input/inline_text', "equals the payload's content (posted, application)",
     'message_content_join', posted_application_inline_text, ('event_type', 'payload', 'message'), 'content_join'),
    ('posted_application_payload_ref', '/source/original_input/blake3_payload_ref', "equals the payload's content_ref.blake3_id (posted, application)",
     'message_content_join', posted_application_payload_ref, ('event_type', 'payload', 'message'), 'content_join'),
    ('posted_project_message_id', '/source/original_input/message_id', "equals the payload's (posted, Project)",
     'message_message_id', posted_project_message_id, ('event_type', 'payload', 'message'), None),
    ('posted_project_from_agent_id', '/source/original_input/from_agent_id', "equals the payload's (posted, Project)",
     'message_from_agent_id', posted_project_from_agent_id, ('event_type', 'payload', 'message'), None),
    ('posted_project_subject', '/source/original_input/subject', "equals the payload's (posted, Project)",
     'message_subject', posted_project_subject, ('event_type', 'payload', 'message'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('posted_application_inline_text', g.Invariant('/source/original_input/inline_text', "equals the payload's content (posted, application)"), 'message_content_join', posted_application_inline_text),
        g.Guard('posted_application_payload_ref', g.Invariant('/source/original_input/blake3_payload_ref', "equals the payload's content_ref.blake3_id (posted, application)"), 'message_content_join', posted_application_payload_ref),
        g.Guard('posted_project_message_id', g.Invariant('/source/original_input/message_id', "equals the payload's (posted, Project)"), 'message_message_id', posted_project_message_id),
        g.Guard('posted_project_from_agent_id', g.Invariant('/source/original_input/from_agent_id', "equals the payload's (posted, Project)"), 'message_from_agent_id', posted_project_from_agent_id),
        g.Guard('posted_project_subject', g.Invariant('/source/original_input/subject', "equals the payload's (posted, Project)"), 'message_subject', posted_project_subject),
    ])
    context = None

    def check(complete):
        table.require('posted_application_inline_text', complete, context)
        table.require('posted_application_payload_ref', complete, context)
        table.require('posted_project_message_id', complete, context)
        table.require('posted_project_from_agent_id', complete, context)
        table.require('posted_project_subject', complete, context)
        return True
    return g.Case(table, check, context)
