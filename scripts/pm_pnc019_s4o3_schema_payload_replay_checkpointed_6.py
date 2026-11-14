"""W3I schema guard table payload_replay_checkpointed_6 (generated).
sc_68047b97e8970e2d: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/replay_checkpoint_ref/not
sc_f6f21eab79f0a35a: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/created_at_utc/type
sc_fbb2eb5cb778c2c5: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/created_at_utc/format
sc_56cd1d0a33193502: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/schema_id/const
sc_c5f17dd9f7ca8690: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/schema_version/const
"""
import pm_guard_isolation as g


def sc_68047b97e8970e2d(value, context):
    if value['sc_68047b97e8970e2d'] != []:
        return 'schema_invalid'
    return None


def sc_f6f21eab79f0a35a(value, context):
    if value['sc_f6f21eab79f0a35a'] != []:
        return 'schema_invalid'
    return None


def sc_fbb2eb5cb778c2c5(value, context):
    if value['sc_fbb2eb5cb778c2c5'] != []:
        return 'schema_invalid'
    return None


def sc_56cd1d0a33193502(value, context):
    if value['sc_56cd1d0a33193502'] != []:
        return 'schema_invalid'
    return None


def sc_c5f17dd9f7ca8690(value, context):
    if value['sc_c5f17dd9f7ca8690'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_68047b97e8970e2d', g.Invariant('/payload_replay_checkpointed/replay_checkpoint_ref', 'not at owner schema /properties/replay_checkpoint_ref/not'), 'schema_invalid', sc_68047b97e8970e2d),
        g.Guard('sc_f6f21eab79f0a35a', g.Invariant('/payload_replay_checkpointed/created_at_utc', 'type at owner schema /properties/created_at_utc/type'), 'schema_invalid', sc_f6f21eab79f0a35a),
        g.Guard('sc_fbb2eb5cb778c2c5', g.Invariant('/payload_replay_checkpointed/created_at_utc', 'format at owner schema /properties/created_at_utc/format'), 'schema_invalid', sc_fbb2eb5cb778c2c5),
        g.Guard('sc_56cd1d0a33193502', g.Invariant('/payload_replay_checkpointed/schema_id', 'const at owner schema /properties/schema_id/const'), 'schema_invalid', sc_56cd1d0a33193502),
        g.Guard('sc_c5f17dd9f7ca8690', g.Invariant('/payload_replay_checkpointed/schema_version', 'const at owner schema /properties/schema_version/const'), 'schema_invalid', sc_c5f17dd9f7ca8690),
    ])

    def check(value):
        table.require('sc_68047b97e8970e2d', value, context)
        table.require('sc_f6f21eab79f0a35a', value, context)
        table.require('sc_fbb2eb5cb778c2c5', value, context)
        table.require('sc_56cd1d0a33193502', value, context)
        table.require('sc_c5f17dd9f7ca8690', value, context)
        return True
    return g.Case(table, check, context)
