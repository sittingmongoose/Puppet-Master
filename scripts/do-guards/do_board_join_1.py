"""DO guard suite `board_join_1` (sweep part 2A). Board join: family member, envelope, replay policy, identity and terminal run anchor (DO-P1F-03 among them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g

BOARD = ('crew.board_message_posted', 'crew.board_message_read', 'crew.board_messages_archived')


def board_family_member(value, context):
    return 'board_family_payload_join' if value['event_type'] not in BOARD else None


def board_payload_schema_id(value, context):
    if value['event_type'] not in BOARD:
        return None
    return ('board_family_payload_join' if value['envelope'].get('payload_schema_id') != value['expected_payload_schema_id']
            else None)


def board_member_stored_header(value, context):
    return 'board_member_stored_header' if 'schema_id' in value['payload'] else None


def board_scope_partition(value, context):
    return 'scope_partition' if value['envelope'].get('scope_partition') != value['expected_scope_partition'] else None


def board_envelope_scope(value, context):
    return 'envelope_scope' if value['envelope'].get('scope') != value['payload'].get('scope') else None


ROWS = (
    ('board_family_member', '/event_type', 'is one of the three crew.board_* families',
     'board_family_payload_join', board_family_member, ('event_type',), 'board_family'),
    ('board_payload_schema_id', '/envelope/payload_schema_id', "names this family's member and the payload's schema_version",
     'board_family_payload_join', board_payload_schema_id, ('event_type', 'envelope', 'expected_payload_schema_id'), 'board_family'),
    ('board_member_stored_header', '/payload/schema_id', 'is absent (SP-320: the envelope names the member)',
     'board_member_stored_header', board_member_stored_header, ('payload',), None),
    ('board_scope_partition', '/envelope/scope_partition', 'equals the partition recomputed from the payload scope',
     'scope_partition', board_scope_partition, ('envelope', 'expected_scope_partition'), None),
    ('board_envelope_scope', '/envelope/scope', "equals the payload's",
     'envelope_scope', board_envelope_scope, ('envelope', 'payload'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('board_family_member', g.Invariant('/event_type', 'is one of the three crew.board_* families'), 'board_family_payload_join', board_family_member),
        g.Guard('board_payload_schema_id', g.Invariant('/envelope/payload_schema_id', "names this family's member and the payload's schema_version"), 'board_family_payload_join', board_payload_schema_id),
        g.Guard('board_member_stored_header', g.Invariant('/payload/schema_id', 'is absent (SP-320: the envelope names the member)'), 'board_member_stored_header', board_member_stored_header),
        g.Guard('board_scope_partition', g.Invariant('/envelope/scope_partition', 'equals the partition recomputed from the payload scope'), 'scope_partition', board_scope_partition),
        g.Guard('board_envelope_scope', g.Invariant('/envelope/scope', "equals the payload's"), 'envelope_scope', board_envelope_scope),
    ])
    context = None

    def check(complete):
        table.require('board_family_member', complete, context)
        table.require('board_payload_schema_id', complete, context)
        table.require('board_member_stored_header', complete, context)
        table.require('board_scope_partition', complete, context)
        table.require('board_envelope_scope', complete, context)
        return True
    return g.Case(table, check, context)
