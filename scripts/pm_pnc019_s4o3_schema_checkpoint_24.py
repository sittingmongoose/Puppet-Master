"""W3I schema guard table checkpoint_24 (generated).
sc_6c9a0e4094caa29d: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/recovery_epoch
sc_8dcfc09ca9053770: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/manifest_survivor_prefix_sha256
sc_edb6653a250c3681: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/retained_inventory_sha256
sc_4f1eb1394c7c398a: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/durable_watermarks_sha256
sc_b6e5ad36ad48576b: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/excluded_ranges_sha256
sc_62bb7210b5dc56c0: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/retired_inputs_sha256
sc_5445096f6e49e5f9: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/additionalProperties
sc_10924a73acf9df0d: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/storage_instance_id/type
"""
import pm_guard_isolation as g


def sc_6c9a0e4094caa29d(value, context):
    if value['sc_6c9a0e4094caa29d'] != []:
        return 'schema_invalid'
    return None


def sc_8dcfc09ca9053770(value, context):
    if value['sc_8dcfc09ca9053770'] != []:
        return 'schema_invalid'
    return None


def sc_edb6653a250c3681(value, context):
    if value['sc_edb6653a250c3681'] != []:
        return 'schema_invalid'
    return None


def sc_4f1eb1394c7c398a(value, context):
    if value['sc_4f1eb1394c7c398a'] != []:
        return 'schema_invalid'
    return None


def sc_b6e5ad36ad48576b(value, context):
    if value['sc_b6e5ad36ad48576b'] != []:
        return 'schema_invalid'
    return None


def sc_62bb7210b5dc56c0(value, context):
    if value['sc_62bb7210b5dc56c0'] != []:
        return 'schema_invalid'
    return None


def sc_5445096f6e49e5f9(value, context):
    if value['sc_5445096f6e49e5f9'] != []:
        return 'schema_invalid'
    return None


def sc_10924a73acf9df0d(value, context):
    if value['sc_10924a73acf9df0d'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_6c9a0e4094caa29d', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/recovery_epoch'), 'schema_invalid', sc_6c9a0e4094caa29d),
        g.Guard('sc_8dcfc09ca9053770', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/manifest_survivor_prefix_sha256'), 'schema_invalid', sc_8dcfc09ca9053770),
        g.Guard('sc_edb6653a250c3681', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/retained_inventory_sha256'), 'schema_invalid', sc_edb6653a250c3681),
        g.Guard('sc_4f1eb1394c7c398a', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/durable_watermarks_sha256'), 'schema_invalid', sc_4f1eb1394c7c398a),
        g.Guard('sc_b6e5ad36ad48576b', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/excluded_ranges_sha256'), 'schema_invalid', sc_b6e5ad36ad48576b),
        g.Guard('sc_62bb7210b5dc56c0', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/required/retired_inputs_sha256'), 'schema_invalid', sc_62bb7210b5dc56c0),
        g.Guard('sc_5445096f6e49e5f9', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection', 'additionalProperties at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/additionalProperties'), 'schema_invalid', sc_5445096f6e49e5f9),
        g.Guard('sc_10924a73acf9df0d', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/storage_instance_id', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/storage_instance_id/type'), 'schema_invalid', sc_10924a73acf9df0d),
    ])

    def check(value):
        table.require('sc_6c9a0e4094caa29d', value, context)
        table.require('sc_8dcfc09ca9053770', value, context)
        table.require('sc_edb6653a250c3681', value, context)
        table.require('sc_4f1eb1394c7c398a', value, context)
        table.require('sc_b6e5ad36ad48576b', value, context)
        table.require('sc_62bb7210b5dc56c0', value, context)
        table.require('sc_5445096f6e49e5f9', value, context)
        table.require('sc_10924a73acf9df0d', value, context)
        return True
    return g.Case(table, check, context)
