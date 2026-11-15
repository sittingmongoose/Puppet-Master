"""W3I schema guard table checkpoint_7 (generated).
sc_c221b515ec6e4e81: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/generation_id/type
sc_da14e12ea2384ba8: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/generation_id/pattern
sc_60fc150ed2d41e79: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/generation_anchor_sha256/type
sc_332b1ce67de86987: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/generation_anchor_sha256/pattern
sc_e3bb738b5a04bab6: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/frontier_revision/type
sc_7c9be375e67cfe4d: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/frontier_revision/minimum
sc_c9d3371096c27029: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/frontier_revision/maximum
sc_d4c9ada8ea3c5b60: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/frontier_sha256/type
"""
import pm_guard_isolation as g


def sc_c221b515ec6e4e81(value, context):
    if value['sc_c221b515ec6e4e81'] != []:
        return 'schema_invalid'
    return None


def sc_da14e12ea2384ba8(value, context):
    if value['sc_da14e12ea2384ba8'] != []:
        return 'schema_invalid'
    return None


def sc_60fc150ed2d41e79(value, context):
    if value['sc_60fc150ed2d41e79'] != []:
        return 'schema_invalid'
    return None


def sc_332b1ce67de86987(value, context):
    if value['sc_332b1ce67de86987'] != []:
        return 'schema_invalid'
    return None


def sc_e3bb738b5a04bab6(value, context):
    if value['sc_e3bb738b5a04bab6'] != []:
        return 'schema_invalid'
    return None


def sc_7c9be375e67cfe4d(value, context):
    if value['sc_7c9be375e67cfe4d'] != []:
        return 'schema_invalid'
    return None


def sc_c9d3371096c27029(value, context):
    if value['sc_c9d3371096c27029'] != []:
        return 'schema_invalid'
    return None


def sc_d4c9ada8ea3c5b60(value, context):
    if value['sc_d4c9ada8ea3c5b60'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_c221b515ec6e4e81', g.Invariant('/checkpoint/index_read_token/generation_id', 'type at owner schema /properties/index_read_token/properties/generation_id/type'), 'schema_invalid', sc_c221b515ec6e4e81),
        g.Guard('sc_da14e12ea2384ba8', g.Invariant('/checkpoint/index_read_token/generation_id', 'pattern at owner schema /properties/index_read_token/properties/generation_id/pattern'), 'schema_invalid', sc_da14e12ea2384ba8),
        g.Guard('sc_60fc150ed2d41e79', g.Invariant('/checkpoint/index_read_token/generation_anchor_sha256', 'type at owner schema /properties/index_read_token/properties/generation_anchor_sha256/type'), 'schema_invalid', sc_60fc150ed2d41e79),
        g.Guard('sc_332b1ce67de86987', g.Invariant('/checkpoint/index_read_token/generation_anchor_sha256', 'pattern at owner schema /properties/index_read_token/properties/generation_anchor_sha256/pattern'), 'schema_invalid', sc_332b1ce67de86987),
        g.Guard('sc_e3bb738b5a04bab6', g.Invariant('/checkpoint/index_read_token/frontier_revision', 'type at owner schema /properties/index_read_token/properties/frontier_revision/type'), 'schema_invalid', sc_e3bb738b5a04bab6),
        g.Guard('sc_7c9be375e67cfe4d', g.Invariant('/checkpoint/index_read_token/frontier_revision', 'minimum at owner schema /properties/index_read_token/properties/frontier_revision/minimum'), 'schema_invalid', sc_7c9be375e67cfe4d),
        g.Guard('sc_c9d3371096c27029', g.Invariant('/checkpoint/index_read_token/frontier_revision', 'maximum at owner schema /properties/index_read_token/properties/frontier_revision/maximum'), 'schema_invalid', sc_c9d3371096c27029),
        g.Guard('sc_d4c9ada8ea3c5b60', g.Invariant('/checkpoint/index_read_token/frontier_sha256', 'type at owner schema /properties/index_read_token/properties/frontier_sha256/type'), 'schema_invalid', sc_d4c9ada8ea3c5b60),
    ])

    def check(value):
        table.require('sc_c221b515ec6e4e81', value, context)
        table.require('sc_da14e12ea2384ba8', value, context)
        table.require('sc_60fc150ed2d41e79', value, context)
        table.require('sc_332b1ce67de86987', value, context)
        table.require('sc_e3bb738b5a04bab6', value, context)
        table.require('sc_7c9be375e67cfe4d', value, context)
        table.require('sc_c9d3371096c27029', value, context)
        table.require('sc_d4c9ada8ea3c5b60', value, context)
        return True
    return g.Case(table, check, context)
