"""W3I schema guard table payload_redaction_applied_2 (generated).
sc_91125ec578b8f2a9: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/project_id/pattern
sc_b3f1b525f461a2b6: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/project_id/not
sc_87e0aeb7f15add7a: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/continuity_id/maxLength
sc_35a91a88a7094ca5: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/continuity_id/pattern
sc_6df64ba531430b1d: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/continuity_id/not
sc_3fdbe7b4a1979ad2: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/stream_id/maxLength
sc_5f01f18d9d86acb4: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/stream_id/pattern
sc_9f2b455e5c48e142: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/stream_id/not
"""
import pm_guard_isolation as g


def sc_91125ec578b8f2a9(value, context):
    if value['sc_91125ec578b8f2a9'] != []:
        return 'schema_invalid'
    return None


def sc_b3f1b525f461a2b6(value, context):
    if value['sc_b3f1b525f461a2b6'] != []:
        return 'schema_invalid'
    return None


def sc_87e0aeb7f15add7a(value, context):
    if value['sc_87e0aeb7f15add7a'] != []:
        return 'schema_invalid'
    return None


def sc_35a91a88a7094ca5(value, context):
    if value['sc_35a91a88a7094ca5'] != []:
        return 'schema_invalid'
    return None


def sc_6df64ba531430b1d(value, context):
    if value['sc_6df64ba531430b1d'] != []:
        return 'schema_invalid'
    return None


def sc_3fdbe7b4a1979ad2(value, context):
    if value['sc_3fdbe7b4a1979ad2'] != []:
        return 'schema_invalid'
    return None


def sc_5f01f18d9d86acb4(value, context):
    if value['sc_5f01f18d9d86acb4'] != []:
        return 'schema_invalid'
    return None


def sc_9f2b455e5c48e142(value, context):
    if value['sc_9f2b455e5c48e142'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_91125ec578b8f2a9', g.Invariant('/payload_redaction_applied/project_id', 'pattern at owner schema /properties/project_id/pattern'), 'schema_invalid', sc_91125ec578b8f2a9),
        g.Guard('sc_b3f1b525f461a2b6', g.Invariant('/payload_redaction_applied/project_id', 'not at owner schema /properties/project_id/not'), 'schema_invalid', sc_b3f1b525f461a2b6),
        g.Guard('sc_87e0aeb7f15add7a', g.Invariant('/payload_redaction_applied/continuity_id', 'maxLength at owner schema /properties/continuity_id/maxLength'), 'schema_invalid', sc_87e0aeb7f15add7a),
        g.Guard('sc_35a91a88a7094ca5', g.Invariant('/payload_redaction_applied/continuity_id', 'pattern at owner schema /properties/continuity_id/pattern'), 'schema_invalid', sc_35a91a88a7094ca5),
        g.Guard('sc_6df64ba531430b1d', g.Invariant('/payload_redaction_applied/continuity_id', 'not at owner schema /properties/continuity_id/not'), 'schema_invalid', sc_6df64ba531430b1d),
        g.Guard('sc_3fdbe7b4a1979ad2', g.Invariant('/payload_redaction_applied/stream_id', 'maxLength at owner schema /properties/stream_id/maxLength'), 'schema_invalid', sc_3fdbe7b4a1979ad2),
        g.Guard('sc_5f01f18d9d86acb4', g.Invariant('/payload_redaction_applied/stream_id', 'pattern at owner schema /properties/stream_id/pattern'), 'schema_invalid', sc_5f01f18d9d86acb4),
        g.Guard('sc_9f2b455e5c48e142', g.Invariant('/payload_redaction_applied/stream_id', 'not at owner schema /properties/stream_id/not'), 'schema_invalid', sc_9f2b455e5c48e142),
    ])

    def check(value):
        table.require('sc_91125ec578b8f2a9', value, context)
        table.require('sc_b3f1b525f461a2b6', value, context)
        table.require('sc_87e0aeb7f15add7a', value, context)
        table.require('sc_35a91a88a7094ca5', value, context)
        table.require('sc_6df64ba531430b1d', value, context)
        table.require('sc_3fdbe7b4a1979ad2', value, context)
        table.require('sc_5f01f18d9d86acb4', value, context)
        table.require('sc_9f2b455e5c48e142', value, context)
        return True
    return g.Case(table, check, context)
