"""W3I schema guard table projection_4 (generated).
sc_dee12ff237507f16: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/sequence_id/maximum
sc_afce97faaf882fa4: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/body_event_id/maxLength
sc_7190008f54c9551c: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/body_event_id/pattern
sc_9eedd886ba7cf192: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/body_event_id/not
"""
import pm_guard_isolation as g


def sc_dee12ff237507f16(value, context):
    if value['sc_dee12ff237507f16'] != []:
        return 'schema_invalid'
    return None


def sc_afce97faaf882fa4(value, context):
    if value['sc_afce97faaf882fa4'] != []:
        return 'schema_invalid'
    return None


def sc_7190008f54c9551c(value, context):
    if value['sc_7190008f54c9551c'] != []:
        return 'schema_invalid'
    return None


def sc_9eedd886ba7cf192(value, context):
    if value['sc_9eedd886ba7cf192'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_dee12ff237507f16', g.Invariant('/projection/sequence_id', 'maximum at owner schema /properties/sequence_id/maximum'), 'schema_invalid', sc_dee12ff237507f16),
        g.Guard('sc_afce97faaf882fa4', g.Invariant('/projection/body_event_id', 'maxLength at owner schema /properties/body_event_id/maxLength'), 'schema_invalid', sc_afce97faaf882fa4),
        g.Guard('sc_7190008f54c9551c', g.Invariant('/projection/body_event_id', 'pattern at owner schema /properties/body_event_id/pattern'), 'schema_invalid', sc_7190008f54c9551c),
        g.Guard('sc_9eedd886ba7cf192', g.Invariant('/projection/body_event_id', 'not at owner schema /properties/body_event_id/not'), 'schema_invalid', sc_9eedd886ba7cf192),
    ])

    def check(value):
        table.require('sc_dee12ff237507f16', value, context)
        table.require('sc_afce97faaf882fa4', value, context)
        table.require('sc_7190008f54c9551c', value, context)
        table.require('sc_9eedd886ba7cf192', value, context)
        return True
    return g.Case(table, check, context)
