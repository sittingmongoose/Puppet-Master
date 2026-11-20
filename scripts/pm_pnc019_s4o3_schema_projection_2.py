"""W3I schema guard table projection_2 (generated).
sc_106efa409546e26c: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/project_id/not
sc_e1749684d1956c6f: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/continuity_id/maxLength
sc_d85df49faea64a77: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/continuity_id/pattern
sc_8242347ac7322b65: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/continuity_id/not
sc_5f05b6ab8c9905af: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/stream_id/maxLength
sc_491e941e1e764952: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/stream_id/pattern
sc_357d0eae066190eb: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/stream_id/not
sc_370e4d0a333826b7: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/event_id/maxLength
"""
import pm_guard_isolation as g


def sc_106efa409546e26c(value, context):
    if value['sc_106efa409546e26c'] != []:
        return 'schema_invalid'
    return None


def sc_e1749684d1956c6f(value, context):
    if value['sc_e1749684d1956c6f'] != []:
        return 'schema_invalid'
    return None


def sc_d85df49faea64a77(value, context):
    if value['sc_d85df49faea64a77'] != []:
        return 'schema_invalid'
    return None


def sc_8242347ac7322b65(value, context):
    if value['sc_8242347ac7322b65'] != []:
        return 'schema_invalid'
    return None


def sc_5f05b6ab8c9905af(value, context):
    if value['sc_5f05b6ab8c9905af'] != []:
        return 'schema_invalid'
    return None


def sc_491e941e1e764952(value, context):
    if value['sc_491e941e1e764952'] != []:
        return 'schema_invalid'
    return None


def sc_357d0eae066190eb(value, context):
    if value['sc_357d0eae066190eb'] != []:
        return 'schema_invalid'
    return None


def sc_370e4d0a333826b7(value, context):
    if value['sc_370e4d0a333826b7'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_106efa409546e26c', g.Invariant('/projection/project_id', 'not at owner schema /properties/project_id/not'), 'schema_invalid', sc_106efa409546e26c),
        g.Guard('sc_e1749684d1956c6f', g.Invariant('/projection/continuity_id', 'maxLength at owner schema /properties/continuity_id/maxLength'), 'schema_invalid', sc_e1749684d1956c6f),
        g.Guard('sc_d85df49faea64a77', g.Invariant('/projection/continuity_id', 'pattern at owner schema /properties/continuity_id/pattern'), 'schema_invalid', sc_d85df49faea64a77),
        g.Guard('sc_8242347ac7322b65', g.Invariant('/projection/continuity_id', 'not at owner schema /properties/continuity_id/not'), 'schema_invalid', sc_8242347ac7322b65),
        g.Guard('sc_5f05b6ab8c9905af', g.Invariant('/projection/stream_id', 'maxLength at owner schema /properties/stream_id/maxLength'), 'schema_invalid', sc_5f05b6ab8c9905af),
        g.Guard('sc_491e941e1e764952', g.Invariant('/projection/stream_id', 'pattern at owner schema /properties/stream_id/pattern'), 'schema_invalid', sc_491e941e1e764952),
        g.Guard('sc_357d0eae066190eb', g.Invariant('/projection/stream_id', 'not at owner schema /properties/stream_id/not'), 'schema_invalid', sc_357d0eae066190eb),
        g.Guard('sc_370e4d0a333826b7', g.Invariant('/projection/event_id', 'maxLength at owner schema /properties/event_id/maxLength'), 'schema_invalid', sc_370e4d0a333826b7),
    ])

    def check(value):
        table.require('sc_106efa409546e26c', value, context)
        table.require('sc_e1749684d1956c6f', value, context)
        table.require('sc_d85df49faea64a77', value, context)
        table.require('sc_8242347ac7322b65', value, context)
        table.require('sc_5f05b6ab8c9905af', value, context)
        table.require('sc_491e941e1e764952', value, context)
        table.require('sc_357d0eae066190eb', value, context)
        table.require('sc_370e4d0a333826b7', value, context)
        return True
    return g.Case(table, check, context)
