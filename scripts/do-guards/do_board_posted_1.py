"""DO guard suite `board_posted_1` (sweep part 2A). Board source: crew.board_message_posted message copies.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def posted_application_subject(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    if value['event_type'] != 'crew.board_message_posted' or value['payload']['scope'] != 'application':
        return None
    return 'message_subject' if value['message']['subject'] != value['payload']['subject'] else None


def posted_application_priority(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    if value['event_type'] != 'crew.board_message_posted' or value['payload']['scope'] != 'application':
        return None
    return 'message_priority' if value['message']['priority'] != value['payload']['priority'] else None


def posted_application_target_type(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    if value['event_type'] != 'crew.board_message_posted' or value['payload']['scope'] != 'application':
        return None
    return 'message_target_type' if value['message']['receiver_agent_type'] != value['payload'].get('to_agent_type') else None


def posted_application_sender(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    if value['event_type'] != 'crew.board_message_posted' or value['payload']['scope'] != 'application':
        return None
    return 'message_sender' if value['message']['sender_agent_id'] != value['payload']['from_agent_id'] else None


def posted_application_target(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    if value['event_type'] != 'crew.board_message_posted' or value['payload']['scope'] != 'application':
        return None
    return 'message_target' if value['message']['receiver_agent_id'] != value['payload'].get('to_agent_id') else None


ROWS = (
    ('posted_application_subject', '/source/original_input/subject', "equals the payload's (posted, application)",
     'message_subject', posted_application_subject, ('event_type', 'payload', 'message', 'board_branch', 'application_shape_valid'), None),
    ('posted_application_priority', '/source/original_input/priority', "equals the payload's (posted, application)",
     'message_priority', posted_application_priority, ('event_type', 'payload', 'message', 'board_branch', 'application_shape_valid'), None),
    ('posted_application_target_type', '/source/original_input/receiver_agent_type', "equals the payload's to_agent_type (posted, application)",
     'message_target_type', posted_application_target_type, ('event_type', 'payload', 'message', 'board_branch', 'application_shape_valid'), None),
    ('posted_application_sender', '/source/original_input/sender_agent_id', "equals the payload's from_agent_id (posted, application)",
     'message_sender', posted_application_sender, ('event_type', 'payload', 'message', 'board_branch', 'application_shape_valid'), None),
    ('posted_application_target', '/source/original_input/receiver_agent_id', "equals the payload's to_agent_id (posted, application)",
     'message_target', posted_application_target, ('event_type', 'payload', 'message', 'board_branch', 'application_shape_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('posted_application_subject', g.Invariant('/source/original_input/subject', "equals the payload's (posted, application)"), 'message_subject', posted_application_subject),
        g.Guard('posted_application_priority', g.Invariant('/source/original_input/priority', "equals the payload's (posted, application)"), 'message_priority', posted_application_priority),
        g.Guard('posted_application_target_type', g.Invariant('/source/original_input/receiver_agent_type', "equals the payload's to_agent_type (posted, application)"), 'message_target_type', posted_application_target_type),
        g.Guard('posted_application_sender', g.Invariant('/source/original_input/sender_agent_id', "equals the payload's from_agent_id (posted, application)"), 'message_sender', posted_application_sender),
        g.Guard('posted_application_target', g.Invariant('/source/original_input/receiver_agent_id', "equals the payload's to_agent_id (posted, application)"), 'message_target', posted_application_target),
    ])
    context = None

    def check(complete):
        table.require('posted_application_subject', complete, context)
        table.require('posted_application_priority', complete, context)
        table.require('posted_application_target_type', complete, context)
        table.require('posted_application_sender', complete, context)
        table.require('posted_application_target', complete, context)
        return True
    return g.Case(table, check, context)
