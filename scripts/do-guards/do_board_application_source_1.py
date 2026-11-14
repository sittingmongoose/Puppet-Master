"""DO guard suite `board_application_source_1` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g

LIMIT = 16384


def application_wrapper_size(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'application_wrapper_over_16k' if value['wrapper_packed_size'] > LIMIT else None


def application_body_representation(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    message = value['message']
    return ('application_message_body_representation'
            if (message['inline_text'] is None) == (message['blake3_payload_ref'] is None) else None)


ROWS = (
    ('application_wrapper_size', '/wrapper', "packs to at most Storage's 16 KiB value limit",
     'application_wrapper_over_16k', application_wrapper_size, ('wrapper_packed_size', 'board_branch', 'application_shape_valid'), None),
    ('application_body_representation', '/source/original_input/inline_text', 'xor blake3_payload_ref is present',
     'application_message_body_representation', application_body_representation, ('message', 'board_branch', 'application_shape_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('application_wrapper_size', g.Invariant('/wrapper', "packs to at most Storage's 16 KiB value limit"), 'application_wrapper_over_16k', application_wrapper_size),
        g.Guard('application_body_representation', g.Invariant('/source/original_input/inline_text', 'xor blake3_payload_ref is present'), 'application_message_body_representation', application_body_representation),
    ])
    context = None

    def check(complete):
        table.require('application_wrapper_size', complete, context)
        table.require('application_body_representation', complete, context)
        return True
    return g.Case(table, check, context)
