"""W3I schema guard table checkpoint_27 (generated).
sc_687c11ff4e3c79d4: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/type
sc_b06c7f05353a62c9: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/pattern
sc_9ba5fa117d6761e4: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/type
sc_d3f5e911451e1f40: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/pattern
sc_1ec9952c93962f98: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/type
sc_c1d06ba6a5735be6: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/pattern
sc_77ec72ff06372218: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/type
sc_73ed4b5e8bdeb479: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/pattern
"""
import pm_guard_isolation as g


def sc_687c11ff4e3c79d4(value, context):
    if value['sc_687c11ff4e3c79d4'] != []:
        return 'schema_invalid'
    return None


def sc_b06c7f05353a62c9(value, context):
    if value['sc_b06c7f05353a62c9'] != []:
        return 'schema_invalid'
    return None


def sc_9ba5fa117d6761e4(value, context):
    if value['sc_9ba5fa117d6761e4'] != []:
        return 'schema_invalid'
    return None


def sc_d3f5e911451e1f40(value, context):
    if value['sc_d3f5e911451e1f40'] != []:
        return 'schema_invalid'
    return None


def sc_1ec9952c93962f98(value, context):
    if value['sc_1ec9952c93962f98'] != []:
        return 'schema_invalid'
    return None


def sc_c1d06ba6a5735be6(value, context):
    if value['sc_c1d06ba6a5735be6'] != []:
        return 'schema_invalid'
    return None


def sc_77ec72ff06372218(value, context):
    if value['sc_77ec72ff06372218'] != []:
        return 'schema_invalid'
    return None


def sc_73ed4b5e8bdeb479(value, context):
    if value['sc_73ed4b5e8bdeb479'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_687c11ff4e3c79d4', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/manifest_survivor_prefix_sha256', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/type'), 'schema_invalid', sc_687c11ff4e3c79d4),
        g.Guard('sc_b06c7f05353a62c9', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/manifest_survivor_prefix_sha256', 'pattern at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/pattern'), 'schema_invalid', sc_b06c7f05353a62c9),
        g.Guard('sc_9ba5fa117d6761e4', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/retained_inventory_sha256', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/type'), 'schema_invalid', sc_9ba5fa117d6761e4),
        g.Guard('sc_d3f5e911451e1f40', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/retained_inventory_sha256', 'pattern at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/pattern'), 'schema_invalid', sc_d3f5e911451e1f40),
        g.Guard('sc_1ec9952c93962f98', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/durable_watermarks_sha256', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/type'), 'schema_invalid', sc_1ec9952c93962f98),
        g.Guard('sc_c1d06ba6a5735be6', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/durable_watermarks_sha256', 'pattern at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/pattern'), 'schema_invalid', sc_c1d06ba6a5735be6),
        g.Guard('sc_77ec72ff06372218', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/excluded_ranges_sha256', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/type'), 'schema_invalid', sc_77ec72ff06372218),
        g.Guard('sc_73ed4b5e8bdeb479', g.Invariant('/checkpoint/retired_publications/*/index_read_token/source_selection/excluded_ranges_sha256', 'pattern at owner schema /properties/retired_publications/items/properties/index_read_token/properties/source_selection/properties/excluded_ranges_sha256/pattern'), 'schema_invalid', sc_73ed4b5e8bdeb479),
    ])

    def check(value):
        table.require('sc_687c11ff4e3c79d4', value, context)
        table.require('sc_b06c7f05353a62c9', value, context)
        table.require('sc_9ba5fa117d6761e4', value, context)
        table.require('sc_d3f5e911451e1f40', value, context)
        table.require('sc_1ec9952c93962f98', value, context)
        table.require('sc_c1d06ba6a5735be6', value, context)
        table.require('sc_77ec72ff06372218', value, context)
        table.require('sc_73ed4b5e8bdeb479', value, context)
        return True
    return g.Case(table, check, context)
