"""W3I schema guard table payload_replay_checkpointed_2 (generated).
sc_e9898021bbb3b218: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/project_id/maxLength
sc_70c39d969d2d2b85: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/project_id/pattern
sc_96a0f9ec9fb8426c: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/project_id/not
sc_d089ff84969891d2: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/continuity_id/maxLength
sc_cdf5d546016ea734: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/continuity_id/pattern
sc_3d850a45a7b23ec6: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/continuity_id/not
sc_5866e8894c215b26: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/stream_id/maxLength
sc_d32fb92ffa07def1: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/stream_id/pattern
"""
import pm_guard_isolation as g


def sc_e9898021bbb3b218(value, context):
    if value['sc_e9898021bbb3b218'] != []:
        return 'schema_invalid'
    return None


def sc_70c39d969d2d2b85(value, context):
    if value['sc_70c39d969d2d2b85'] != []:
        return 'schema_invalid'
    return None


def sc_96a0f9ec9fb8426c(value, context):
    if value['sc_96a0f9ec9fb8426c'] != []:
        return 'schema_invalid'
    return None


def sc_d089ff84969891d2(value, context):
    if value['sc_d089ff84969891d2'] != []:
        return 'schema_invalid'
    return None


def sc_cdf5d546016ea734(value, context):
    if value['sc_cdf5d546016ea734'] != []:
        return 'schema_invalid'
    return None


def sc_3d850a45a7b23ec6(value, context):
    if value['sc_3d850a45a7b23ec6'] != []:
        return 'schema_invalid'
    return None


def sc_5866e8894c215b26(value, context):
    if value['sc_5866e8894c215b26'] != []:
        return 'schema_invalid'
    return None


def sc_d32fb92ffa07def1(value, context):
    if value['sc_d32fb92ffa07def1'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_e9898021bbb3b218', g.Invariant('/payload_replay_checkpointed/project_id', 'maxLength at owner schema /properties/project_id/maxLength'), 'schema_invalid', sc_e9898021bbb3b218),
        g.Guard('sc_70c39d969d2d2b85', g.Invariant('/payload_replay_checkpointed/project_id', 'pattern at owner schema /properties/project_id/pattern'), 'schema_invalid', sc_70c39d969d2d2b85),
        g.Guard('sc_96a0f9ec9fb8426c', g.Invariant('/payload_replay_checkpointed/project_id', 'not at owner schema /properties/project_id/not'), 'schema_invalid', sc_96a0f9ec9fb8426c),
        g.Guard('sc_d089ff84969891d2', g.Invariant('/payload_replay_checkpointed/continuity_id', 'maxLength at owner schema /properties/continuity_id/maxLength'), 'schema_invalid', sc_d089ff84969891d2),
        g.Guard('sc_cdf5d546016ea734', g.Invariant('/payload_replay_checkpointed/continuity_id', 'pattern at owner schema /properties/continuity_id/pattern'), 'schema_invalid', sc_cdf5d546016ea734),
        g.Guard('sc_3d850a45a7b23ec6', g.Invariant('/payload_replay_checkpointed/continuity_id', 'not at owner schema /properties/continuity_id/not'), 'schema_invalid', sc_3d850a45a7b23ec6),
        g.Guard('sc_5866e8894c215b26', g.Invariant('/payload_replay_checkpointed/stream_id', 'maxLength at owner schema /properties/stream_id/maxLength'), 'schema_invalid', sc_5866e8894c215b26),
        g.Guard('sc_d32fb92ffa07def1', g.Invariant('/payload_replay_checkpointed/stream_id', 'pattern at owner schema /properties/stream_id/pattern'), 'schema_invalid', sc_d32fb92ffa07def1),
    ])

    def check(value):
        table.require('sc_e9898021bbb3b218', value, context)
        table.require('sc_70c39d969d2d2b85', value, context)
        table.require('sc_96a0f9ec9fb8426c', value, context)
        table.require('sc_d089ff84969891d2', value, context)
        table.require('sc_cdf5d546016ea734', value, context)
        table.require('sc_3d850a45a7b23ec6', value, context)
        table.require('sc_5866e8894c215b26', value, context)
        table.require('sc_d32fb92ffa07def1', value, context)
        return True
    return g.Case(table, check, context)
