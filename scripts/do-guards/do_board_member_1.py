"""DO guard suite `board_member_1` (sweep part 2A). Board members: SP-320 and SP-720..722 member definitions, per member (board_member_definition_failures).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def member_definition_present(value, context):
    return 'board_member_definition_missing' if type(value['definition']) is not dict or type(value['orchestrator']) is not dict else None


def member_stored_header_property(value, context):
    definition = value['definition']
    if type(definition) is not dict or type(value['orchestrator']) is not dict:
        return None
    return 'board_member_stored_header' if 'schema_id' in definition.get('properties', {}) else None


def member_stored_header_required(value, context):
    definition = value['definition']
    if type(definition) is not dict or type(value['orchestrator']) is not dict:
        return None
    return 'board_member_stored_header' if 'schema_id' in definition.get('required', []) else None


def member_schema_id(value, context):
    definition = value['definition']
    if type(definition) is not dict or type(value['orchestrator']) is not dict:
        return None
    return 'board_member_schema_id' if definition.get('$id') != value['expected_id'] else None


def member_copy(value, context):
    if type(value['definition']) is not dict or type(value['orchestrator']) is not dict:
        return None
    return 'board_member_copy_drift' if value['definition_body'] != value['orchestrator'] else None


ROWS = (
    ('member_definition_present', '/$defs/{member}', 'exists in both the owner file and the Orchestrator file',
     'board_member_definition_missing', member_definition_present, ('definition', 'orchestrator'), None),
    ('member_stored_header_property', '/$defs/{member}/properties/schema_id', 'is absent (SP-320)',
     'board_member_stored_header', member_stored_header_property, ('definition', 'orchestrator'), 'stored_header'),
    ('member_stored_header_required', '/$defs/{member}/required', "does not list 'schema_id' (SP-320)",
     'board_member_stored_header', member_stored_header_required, ('definition', 'orchestrator'), 'stored_header'),
    ('member_schema_id', '/$defs/{member}/$id', "is 'pm.event_payload.{member}.v1'",
     'board_member_schema_id', member_schema_id, ('definition', 'orchestrator', 'expected_id'), None),
    ('member_copy', '/$defs/{member}', "less $schema and $id equals the Orchestrator's closed definition",
     'board_member_copy_drift', member_copy, ('definition', 'orchestrator', 'definition_body'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('member_definition_present', g.Invariant('/$defs/{member}', 'exists in both the owner file and the Orchestrator file'), 'board_member_definition_missing', member_definition_present),
        g.Guard('member_stored_header_property', g.Invariant('/$defs/{member}/properties/schema_id', 'is absent (SP-320)'), 'board_member_stored_header', member_stored_header_property),
        g.Guard('member_stored_header_required', g.Invariant('/$defs/{member}/required', "does not list 'schema_id' (SP-320)"), 'board_member_stored_header', member_stored_header_required),
        g.Guard('member_schema_id', g.Invariant('/$defs/{member}/$id', "is 'pm.event_payload.{member}.v1'"), 'board_member_schema_id', member_schema_id),
        g.Guard('member_copy', g.Invariant('/$defs/{member}', "less $schema and $id equals the Orchestrator's closed definition"), 'board_member_copy_drift', member_copy),
    ])
    context = None

    def check(complete):
        table.require('member_definition_present', complete, context)
        table.require('member_stored_header_property', complete, context)
        table.require('member_stored_header_required', complete, context)
        table.require('member_schema_id', complete, context)
        table.require('member_copy', complete, context)
        return True
    return g.Case(table, check, context)
