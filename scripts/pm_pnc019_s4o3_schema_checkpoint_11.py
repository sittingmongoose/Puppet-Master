"""W3I schema guard table checkpoint_11 (generated).
sc_c77e31c378b86561: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/selected_segment_generation/minimum
sc_b2ff4673d1c0d0af: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/selected_segment_generation/maximum
sc_114b5ee3544bd68f: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/manifest_ref/const
sc_8954682b0c79d890: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/type
sc_79421e238824107b: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/pattern
sc_c24bf87a1463d426: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/manifest_generation/type
sc_3657caef971efac6: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/manifest_generation/minimum
sc_96d8444027da6663: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/manifest_generation/maximum
"""
import pm_guard_isolation as g


def sc_c77e31c378b86561(value, context):
    if value['sc_c77e31c378b86561'] != []:
        return 'schema_invalid'
    return None


def sc_b2ff4673d1c0d0af(value, context):
    if value['sc_b2ff4673d1c0d0af'] != []:
        return 'schema_invalid'
    return None


def sc_114b5ee3544bd68f(value, context):
    if value['sc_114b5ee3544bd68f'] != []:
        return 'schema_invalid'
    return None


def sc_8954682b0c79d890(value, context):
    if value['sc_8954682b0c79d890'] != []:
        return 'schema_invalid'
    return None


def sc_79421e238824107b(value, context):
    if value['sc_79421e238824107b'] != []:
        return 'schema_invalid'
    return None


def sc_c24bf87a1463d426(value, context):
    if value['sc_c24bf87a1463d426'] != []:
        return 'schema_invalid'
    return None


def sc_3657caef971efac6(value, context):
    if value['sc_3657caef971efac6'] != []:
        return 'schema_invalid'
    return None


def sc_96d8444027da6663(value, context):
    if value['sc_96d8444027da6663'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_c77e31c378b86561', g.Invariant('/checkpoint/index_read_token/source_selection/selected_segment_generation', 'minimum at owner schema /properties/index_read_token/properties/source_selection/properties/selected_segment_generation/minimum'), 'schema_invalid', sc_c77e31c378b86561),
        g.Guard('sc_b2ff4673d1c0d0af', g.Invariant('/checkpoint/index_read_token/source_selection/selected_segment_generation', 'maximum at owner schema /properties/index_read_token/properties/source_selection/properties/selected_segment_generation/maximum'), 'schema_invalid', sc_b2ff4673d1c0d0af),
        g.Guard('sc_114b5ee3544bd68f', g.Invariant('/checkpoint/index_read_token/source_selection/manifest_ref', 'const at owner schema /properties/index_read_token/properties/source_selection/properties/manifest_ref/const'), 'schema_invalid', sc_114b5ee3544bd68f),
        g.Guard('sc_8954682b0c79d890', g.Invariant('/checkpoint/index_read_token/source_selection/manifest_bytes_sha256', 'type at owner schema /properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/type'), 'schema_invalid', sc_8954682b0c79d890),
        g.Guard('sc_79421e238824107b', g.Invariant('/checkpoint/index_read_token/source_selection/manifest_bytes_sha256', 'pattern at owner schema /properties/index_read_token/properties/source_selection/properties/manifest_bytes_sha256/pattern'), 'schema_invalid', sc_79421e238824107b),
        g.Guard('sc_c24bf87a1463d426', g.Invariant('/checkpoint/index_read_token/source_selection/manifest_generation', 'type at owner schema /properties/index_read_token/properties/source_selection/properties/manifest_generation/type'), 'schema_invalid', sc_c24bf87a1463d426),
        g.Guard('sc_3657caef971efac6', g.Invariant('/checkpoint/index_read_token/source_selection/manifest_generation', 'minimum at owner schema /properties/index_read_token/properties/source_selection/properties/manifest_generation/minimum'), 'schema_invalid', sc_3657caef971efac6),
        g.Guard('sc_96d8444027da6663', g.Invariant('/checkpoint/index_read_token/source_selection/manifest_generation', 'maximum at owner schema /properties/index_read_token/properties/source_selection/properties/manifest_generation/maximum'), 'schema_invalid', sc_96d8444027da6663),
    ])

    def check(value):
        table.require('sc_c77e31c378b86561', value, context)
        table.require('sc_b2ff4673d1c0d0af', value, context)
        table.require('sc_114b5ee3544bd68f', value, context)
        table.require('sc_8954682b0c79d890', value, context)
        table.require('sc_79421e238824107b', value, context)
        table.require('sc_c24bf87a1463d426', value, context)
        table.require('sc_3657caef971efac6', value, context)
        table.require('sc_96d8444027da6663', value, context)
        return True
    return g.Case(table, check, context)
