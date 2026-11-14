"""W3I schema guard table checkpoint_3 (generated).
sc_2d49452fb7916a6f: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/storage_instance_id/pattern
sc_c21566779e1b65b0: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/storage_instance_id/not
sc_32e9bfaae30f5484: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/project_id/maxLength
sc_94bb09edc9966994: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/project_id/pattern
sc_202140c4f1c3427c: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/project_id/not
sc_1081704dff9aaba0: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/stream_id/maxLength
sc_25754d7e0319ed8b: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/stream_id/pattern
sc_bd7a4348aae8afbf: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/stream_id/not
"""
import pm_guard_isolation as g


def sc_2d49452fb7916a6f(value, context):
    if value['sc_2d49452fb7916a6f'] != []:
        return 'schema_invalid'
    return None


def sc_c21566779e1b65b0(value, context):
    if value['sc_c21566779e1b65b0'] != []:
        return 'schema_invalid'
    return None


def sc_32e9bfaae30f5484(value, context):
    if value['sc_32e9bfaae30f5484'] != []:
        return 'schema_invalid'
    return None


def sc_94bb09edc9966994(value, context):
    if value['sc_94bb09edc9966994'] != []:
        return 'schema_invalid'
    return None


def sc_202140c4f1c3427c(value, context):
    if value['sc_202140c4f1c3427c'] != []:
        return 'schema_invalid'
    return None


def sc_1081704dff9aaba0(value, context):
    if value['sc_1081704dff9aaba0'] != []:
        return 'schema_invalid'
    return None


def sc_25754d7e0319ed8b(value, context):
    if value['sc_25754d7e0319ed8b'] != []:
        return 'schema_invalid'
    return None


def sc_bd7a4348aae8afbf(value, context):
    if value['sc_bd7a4348aae8afbf'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_2d49452fb7916a6f', g.Invariant('/checkpoint/storage_instance_id', 'pattern at owner schema /properties/storage_instance_id/pattern'), 'schema_invalid', sc_2d49452fb7916a6f),
        g.Guard('sc_c21566779e1b65b0', g.Invariant('/checkpoint/storage_instance_id', 'not at owner schema /properties/storage_instance_id/not'), 'schema_invalid', sc_c21566779e1b65b0),
        g.Guard('sc_32e9bfaae30f5484', g.Invariant('/checkpoint/project_id', 'maxLength at owner schema /properties/project_id/maxLength'), 'schema_invalid', sc_32e9bfaae30f5484),
        g.Guard('sc_94bb09edc9966994', g.Invariant('/checkpoint/project_id', 'pattern at owner schema /properties/project_id/pattern'), 'schema_invalid', sc_94bb09edc9966994),
        g.Guard('sc_202140c4f1c3427c', g.Invariant('/checkpoint/project_id', 'not at owner schema /properties/project_id/not'), 'schema_invalid', sc_202140c4f1c3427c),
        g.Guard('sc_1081704dff9aaba0', g.Invariant('/checkpoint/stream_id', 'maxLength at owner schema /properties/stream_id/maxLength'), 'schema_invalid', sc_1081704dff9aaba0),
        g.Guard('sc_25754d7e0319ed8b', g.Invariant('/checkpoint/stream_id', 'pattern at owner schema /properties/stream_id/pattern'), 'schema_invalid', sc_25754d7e0319ed8b),
        g.Guard('sc_bd7a4348aae8afbf', g.Invariant('/checkpoint/stream_id', 'not at owner schema /properties/stream_id/not'), 'schema_invalid', sc_bd7a4348aae8afbf),
    ])

    def check(value):
        table.require('sc_2d49452fb7916a6f', value, context)
        table.require('sc_c21566779e1b65b0', value, context)
        table.require('sc_32e9bfaae30f5484', value, context)
        table.require('sc_94bb09edc9966994', value, context)
        table.require('sc_202140c4f1c3427c', value, context)
        table.require('sc_1081704dff9aaba0', value, context)
        table.require('sc_25754d7e0319ed8b', value, context)
        table.require('sc_bd7a4348aae8afbf', value, context)
        return True
    return g.Case(table, check, context)
