"""W3I schema guard table checkpoint_9 (generated).
sc_376a117d5f76acd1: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/required/manifest_ref
sc_3c185e1bd9b6ab2b: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/required/manifest_bytes_sha256
sc_a758997cd04ab0f3: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/required/manifest_generation
sc_82156a2931b17736: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/required/recovery_epoch
sc_060257474fbd321d: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/required/manifest_survivor_prefix_sha256
sc_a3de845bc6f74274: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/required/retained_inventory_sha256
sc_25c4886ae562015e: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/required/durable_watermarks_sha256
sc_93e620b55f53a5c5: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/required/excluded_ranges_sha256
"""
import pm_guard_isolation as g


def sc_376a117d5f76acd1(value, context):
    if value['sc_376a117d5f76acd1'] != []:
        return 'schema_invalid'
    return None


def sc_3c185e1bd9b6ab2b(value, context):
    if value['sc_3c185e1bd9b6ab2b'] != []:
        return 'schema_invalid'
    return None


def sc_a758997cd04ab0f3(value, context):
    if value['sc_a758997cd04ab0f3'] != []:
        return 'schema_invalid'
    return None


def sc_82156a2931b17736(value, context):
    if value['sc_82156a2931b17736'] != []:
        return 'schema_invalid'
    return None


def sc_060257474fbd321d(value, context):
    if value['sc_060257474fbd321d'] != []:
        return 'schema_invalid'
    return None


def sc_a3de845bc6f74274(value, context):
    if value['sc_a3de845bc6f74274'] != []:
        return 'schema_invalid'
    return None


def sc_25c4886ae562015e(value, context):
    if value['sc_25c4886ae562015e'] != []:
        return 'schema_invalid'
    return None


def sc_93e620b55f53a5c5(value, context):
    if value['sc_93e620b55f53a5c5'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_376a117d5f76acd1', g.Invariant('/checkpoint/index_read_token/source_selection', 'required at owner schema /properties/index_read_token/properties/source_selection/required/manifest_ref'), 'schema_invalid', sc_376a117d5f76acd1),
        g.Guard('sc_3c185e1bd9b6ab2b', g.Invariant('/checkpoint/index_read_token/source_selection', 'required at owner schema /properties/index_read_token/properties/source_selection/required/manifest_bytes_sha256'), 'schema_invalid', sc_3c185e1bd9b6ab2b),
        g.Guard('sc_a758997cd04ab0f3', g.Invariant('/checkpoint/index_read_token/source_selection', 'required at owner schema /properties/index_read_token/properties/source_selection/required/manifest_generation'), 'schema_invalid', sc_a758997cd04ab0f3),
        g.Guard('sc_82156a2931b17736', g.Invariant('/checkpoint/index_read_token/source_selection', 'required at owner schema /properties/index_read_token/properties/source_selection/required/recovery_epoch'), 'schema_invalid', sc_82156a2931b17736),
        g.Guard('sc_060257474fbd321d', g.Invariant('/checkpoint/index_read_token/source_selection', 'required at owner schema /properties/index_read_token/properties/source_selection/required/manifest_survivor_prefix_sha256'), 'schema_invalid', sc_060257474fbd321d),
        g.Guard('sc_a3de845bc6f74274', g.Invariant('/checkpoint/index_read_token/source_selection', 'required at owner schema /properties/index_read_token/properties/source_selection/required/retained_inventory_sha256'), 'schema_invalid', sc_a3de845bc6f74274),
        g.Guard('sc_25c4886ae562015e', g.Invariant('/checkpoint/index_read_token/source_selection', 'required at owner schema /properties/index_read_token/properties/source_selection/required/durable_watermarks_sha256'), 'schema_invalid', sc_25c4886ae562015e),
        g.Guard('sc_93e620b55f53a5c5', g.Invariant('/checkpoint/index_read_token/source_selection', 'required at owner schema /properties/index_read_token/properties/source_selection/required/excluded_ranges_sha256'), 'schema_invalid', sc_93e620b55f53a5c5),
    ])

    def check(value):
        table.require('sc_376a117d5f76acd1', value, context)
        table.require('sc_3c185e1bd9b6ab2b', value, context)
        table.require('sc_a758997cd04ab0f3', value, context)
        table.require('sc_82156a2931b17736', value, context)
        table.require('sc_060257474fbd321d', value, context)
        table.require('sc_a3de845bc6f74274', value, context)
        table.require('sc_25c4886ae562015e', value, context)
        table.require('sc_93e620b55f53a5c5', value, context)
        return True
    return g.Case(table, check, context)
