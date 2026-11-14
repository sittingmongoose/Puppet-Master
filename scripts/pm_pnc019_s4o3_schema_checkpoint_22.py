"""W3I schema guard table checkpoint_22 (generated).
sc_57e596e4ab4c7a02: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/generation_anchor_sha256/pattern
sc_0809dbeed232b531: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/frontier_revision/type
sc_081469b025e127c7: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/frontier_revision/minimum
sc_960a752018cdb2e6: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/frontier_revision/maximum
sc_428281d2b422e507: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/frontier_sha256/type
sc_ea3d811cf1b7d03d: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/frontier_sha256/pattern
sc_815533e5bac2375f: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/index_dataset_name/type
sc_a194954a5e9d8636: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/index_dataset_name/minLength
"""
import pm_guard_isolation as g


def sc_57e596e4ab4c7a02(value, context):
    if value['sc_57e596e4ab4c7a02'] != []:
        return 'schema_invalid'
    return None


def sc_0809dbeed232b531(value, context):
    if value['sc_0809dbeed232b531'] != []:
        return 'schema_invalid'
    return None


def sc_081469b025e127c7(value, context):
    if value['sc_081469b025e127c7'] != []:
        return 'schema_invalid'
    return None


def sc_960a752018cdb2e6(value, context):
    if value['sc_960a752018cdb2e6'] != []:
        return 'schema_invalid'
    return None


def sc_428281d2b422e507(value, context):
    if value['sc_428281d2b422e507'] != []:
        return 'schema_invalid'
    return None


def sc_ea3d811cf1b7d03d(value, context):
    if value['sc_ea3d811cf1b7d03d'] != []:
        return 'schema_invalid'
    return None


def sc_815533e5bac2375f(value, context):
    if value['sc_815533e5bac2375f'] != []:
        return 'schema_invalid'
    return None


def sc_a194954a5e9d8636(value, context):
    if value['sc_a194954a5e9d8636'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_57e596e4ab4c7a02', g.Invariant('/checkpoint/retired_publications/*/index_read_token/generation_anchor_sha256', 'pattern at owner schema /properties/retired_publications/items/properties/index_read_token/properties/generation_anchor_sha256/pattern'), 'schema_invalid', sc_57e596e4ab4c7a02),
        g.Guard('sc_0809dbeed232b531', g.Invariant('/checkpoint/retired_publications/*/index_read_token/frontier_revision', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/frontier_revision/type'), 'schema_invalid', sc_0809dbeed232b531),
        g.Guard('sc_081469b025e127c7', g.Invariant('/checkpoint/retired_publications/*/index_read_token/frontier_revision', 'minimum at owner schema /properties/retired_publications/items/properties/index_read_token/properties/frontier_revision/minimum'), 'schema_invalid', sc_081469b025e127c7),
        g.Guard('sc_960a752018cdb2e6', g.Invariant('/checkpoint/retired_publications/*/index_read_token/frontier_revision', 'maximum at owner schema /properties/retired_publications/items/properties/index_read_token/properties/frontier_revision/maximum'), 'schema_invalid', sc_960a752018cdb2e6),
        g.Guard('sc_428281d2b422e507', g.Invariant('/checkpoint/retired_publications/*/index_read_token/frontier_sha256', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/frontier_sha256/type'), 'schema_invalid', sc_428281d2b422e507),
        g.Guard('sc_ea3d811cf1b7d03d', g.Invariant('/checkpoint/retired_publications/*/index_read_token/frontier_sha256', 'pattern at owner schema /properties/retired_publications/items/properties/index_read_token/properties/frontier_sha256/pattern'), 'schema_invalid', sc_ea3d811cf1b7d03d),
        g.Guard('sc_815533e5bac2375f', g.Invariant('/checkpoint/retired_publications/*/index_read_token/index_dataset_name', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/index_dataset_name/type'), 'schema_invalid', sc_815533e5bac2375f),
        g.Guard('sc_a194954a5e9d8636', g.Invariant('/checkpoint/retired_publications/*/index_read_token/index_dataset_name', 'minLength at owner schema /properties/retired_publications/items/properties/index_read_token/properties/index_dataset_name/minLength'), 'schema_invalid', sc_a194954a5e9d8636),
    ])

    def check(value):
        table.require('sc_57e596e4ab4c7a02', value, context)
        table.require('sc_0809dbeed232b531', value, context)
        table.require('sc_081469b025e127c7', value, context)
        table.require('sc_960a752018cdb2e6', value, context)
        table.require('sc_428281d2b422e507', value, context)
        table.require('sc_ea3d811cf1b7d03d', value, context)
        table.require('sc_815533e5bac2375f', value, context)
        table.require('sc_a194954a5e9d8636', value, context)
        return True
    return g.Case(table, check, context)
