"""W3I schema guard table checkpoint_16 (generated).
sc_0e87339392a9ba00: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/required/index_read_token
sc_73bd97bf30a7a947: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/required/index_through_sequence_id
sc_48cc5e5f61968379: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/required/source_cursor
sc_adf1d7ae3d52874c: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/required/filter_complete
sc_c1b2b07c2e81048d: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/required/state
sc_62057071f31b5835: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/required/withdrawn_at_utc
sc_7aa2141efc2134bb: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/required/hold_refs
sc_b92fb5e584a710ff: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/additionalProperties
"""
import pm_guard_isolation as g


def sc_0e87339392a9ba00(value, context):
    if value['sc_0e87339392a9ba00'] != []:
        return 'schema_invalid'
    return None


def sc_73bd97bf30a7a947(value, context):
    if value['sc_73bd97bf30a7a947'] != []:
        return 'schema_invalid'
    return None


def sc_48cc5e5f61968379(value, context):
    if value['sc_48cc5e5f61968379'] != []:
        return 'schema_invalid'
    return None


def sc_adf1d7ae3d52874c(value, context):
    if value['sc_adf1d7ae3d52874c'] != []:
        return 'schema_invalid'
    return None


def sc_c1b2b07c2e81048d(value, context):
    if value['sc_c1b2b07c2e81048d'] != []:
        return 'schema_invalid'
    return None


def sc_62057071f31b5835(value, context):
    if value['sc_62057071f31b5835'] != []:
        return 'schema_invalid'
    return None


def sc_7aa2141efc2134bb(value, context):
    if value['sc_7aa2141efc2134bb'] != []:
        return 'schema_invalid'
    return None


def sc_b92fb5e584a710ff(value, context):
    if value['sc_b92fb5e584a710ff'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_0e87339392a9ba00', g.Invariant('/checkpoint/retired_publications/*', 'required at owner schema /properties/retired_publications/items/required/index_read_token'), 'schema_invalid', sc_0e87339392a9ba00),
        g.Guard('sc_73bd97bf30a7a947', g.Invariant('/checkpoint/retired_publications/*', 'required at owner schema /properties/retired_publications/items/required/index_through_sequence_id'), 'schema_invalid', sc_73bd97bf30a7a947),
        g.Guard('sc_48cc5e5f61968379', g.Invariant('/checkpoint/retired_publications/*', 'required at owner schema /properties/retired_publications/items/required/source_cursor'), 'schema_invalid', sc_48cc5e5f61968379),
        g.Guard('sc_adf1d7ae3d52874c', g.Invariant('/checkpoint/retired_publications/*', 'required at owner schema /properties/retired_publications/items/required/filter_complete'), 'schema_invalid', sc_adf1d7ae3d52874c),
        g.Guard('sc_c1b2b07c2e81048d', g.Invariant('/checkpoint/retired_publications/*', 'required at owner schema /properties/retired_publications/items/required/state'), 'schema_invalid', sc_c1b2b07c2e81048d),
        g.Guard('sc_62057071f31b5835', g.Invariant('/checkpoint/retired_publications/*', 'required at owner schema /properties/retired_publications/items/required/withdrawn_at_utc'), 'schema_invalid', sc_62057071f31b5835),
        g.Guard('sc_7aa2141efc2134bb', g.Invariant('/checkpoint/retired_publications/*', 'required at owner schema /properties/retired_publications/items/required/hold_refs'), 'schema_invalid', sc_7aa2141efc2134bb),
        g.Guard('sc_b92fb5e584a710ff', g.Invariant('/checkpoint/retired_publications/*', 'additionalProperties at owner schema /properties/retired_publications/items/additionalProperties'), 'schema_invalid', sc_b92fb5e584a710ff),
    ])

    def check(value):
        table.require('sc_0e87339392a9ba00', value, context)
        table.require('sc_73bd97bf30a7a947', value, context)
        table.require('sc_48cc5e5f61968379', value, context)
        table.require('sc_adf1d7ae3d52874c', value, context)
        table.require('sc_c1b2b07c2e81048d', value, context)
        table.require('sc_62057071f31b5835', value, context)
        table.require('sc_7aa2141efc2134bb', value, context)
        table.require('sc_b92fb5e584a710ff', value, context)
        return True
    return g.Case(table, check, context)
