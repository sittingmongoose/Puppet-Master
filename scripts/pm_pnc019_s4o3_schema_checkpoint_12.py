"""W3I schema guard table checkpoint_12 (generated).
sc_0606f93c3a8a4e07: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/recovery_epoch/type
sc_538d6afa4ac221d0: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/recovery_epoch/minimum
sc_fab11efb2ad3e43b: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/recovery_epoch/maximum
sc_661f74be67ede095: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/type
sc_9821a4b3a0f04b1c: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/pattern
sc_bf7e769c48310b05: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/type
sc_0ec30fc1e2073410: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/pattern
sc_8c38a40088411d35: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/type
"""
import pm_guard_isolation as g


def sc_0606f93c3a8a4e07(value, context):
    if value['sc_0606f93c3a8a4e07'] != []:
        return 'schema_invalid'
    return None


def sc_538d6afa4ac221d0(value, context):
    if value['sc_538d6afa4ac221d0'] != []:
        return 'schema_invalid'
    return None


def sc_fab11efb2ad3e43b(value, context):
    if value['sc_fab11efb2ad3e43b'] != []:
        return 'schema_invalid'
    return None


def sc_661f74be67ede095(value, context):
    if value['sc_661f74be67ede095'] != []:
        return 'schema_invalid'
    return None


def sc_9821a4b3a0f04b1c(value, context):
    if value['sc_9821a4b3a0f04b1c'] != []:
        return 'schema_invalid'
    return None


def sc_bf7e769c48310b05(value, context):
    if value['sc_bf7e769c48310b05'] != []:
        return 'schema_invalid'
    return None


def sc_0ec30fc1e2073410(value, context):
    if value['sc_0ec30fc1e2073410'] != []:
        return 'schema_invalid'
    return None


def sc_8c38a40088411d35(value, context):
    if value['sc_8c38a40088411d35'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_0606f93c3a8a4e07', g.Invariant('/checkpoint/index_read_token/source_selection/recovery_epoch', 'type at owner schema /properties/index_read_token/properties/source_selection/properties/recovery_epoch/type'), 'schema_invalid', sc_0606f93c3a8a4e07),
        g.Guard('sc_538d6afa4ac221d0', g.Invariant('/checkpoint/index_read_token/source_selection/recovery_epoch', 'minimum at owner schema /properties/index_read_token/properties/source_selection/properties/recovery_epoch/minimum'), 'schema_invalid', sc_538d6afa4ac221d0),
        g.Guard('sc_fab11efb2ad3e43b', g.Invariant('/checkpoint/index_read_token/source_selection/recovery_epoch', 'maximum at owner schema /properties/index_read_token/properties/source_selection/properties/recovery_epoch/maximum'), 'schema_invalid', sc_fab11efb2ad3e43b),
        g.Guard('sc_661f74be67ede095', g.Invariant('/checkpoint/index_read_token/source_selection/manifest_survivor_prefix_sha256', 'type at owner schema /properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/type'), 'schema_invalid', sc_661f74be67ede095),
        g.Guard('sc_9821a4b3a0f04b1c', g.Invariant('/checkpoint/index_read_token/source_selection/manifest_survivor_prefix_sha256', 'pattern at owner schema /properties/index_read_token/properties/source_selection/properties/manifest_survivor_prefix_sha256/pattern'), 'schema_invalid', sc_9821a4b3a0f04b1c),
        g.Guard('sc_bf7e769c48310b05', g.Invariant('/checkpoint/index_read_token/source_selection/retained_inventory_sha256', 'type at owner schema /properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/type'), 'schema_invalid', sc_bf7e769c48310b05),
        g.Guard('sc_0ec30fc1e2073410', g.Invariant('/checkpoint/index_read_token/source_selection/retained_inventory_sha256', 'pattern at owner schema /properties/index_read_token/properties/source_selection/properties/retained_inventory_sha256/pattern'), 'schema_invalid', sc_0ec30fc1e2073410),
        g.Guard('sc_8c38a40088411d35', g.Invariant('/checkpoint/index_read_token/source_selection/durable_watermarks_sha256', 'type at owner schema /properties/index_read_token/properties/source_selection/properties/durable_watermarks_sha256/type'), 'schema_invalid', sc_8c38a40088411d35),
    ])

    def check(value):
        table.require('sc_0606f93c3a8a4e07', value, context)
        table.require('sc_538d6afa4ac221d0', value, context)
        table.require('sc_fab11efb2ad3e43b', value, context)
        table.require('sc_661f74be67ede095', value, context)
        table.require('sc_9821a4b3a0f04b1c', value, context)
        table.require('sc_bf7e769c48310b05', value, context)
        table.require('sc_0ec30fc1e2073410', value, context)
        table.require('sc_8c38a40088411d35', value, context)
        return True
    return g.Case(table, check, context)
