"""W3I schema guard table checkpoint_6 (generated).
sc_6ede759f543faa93: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/required/source_selection
sc_b48604c1567bf9d5: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/additionalProperties
sc_fb20f22bdb7e812f: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/storage_instance_id/type
sc_9d118acdc0701738: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/storage_instance_id/format
sc_4c9b58ae9fc73211: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/checkpoint_key/type
sc_2495c3a38b670a7e: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/checkpoint_key/minLength
sc_6f02d8eae54bcd73: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/checkpoint_ref/type
sc_8bfb3353506901c9: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/checkpoint_ref/minLength
"""
import pm_guard_isolation as g


def sc_6ede759f543faa93(value, context):
    if value['sc_6ede759f543faa93'] != []:
        return 'schema_invalid'
    return None


def sc_b48604c1567bf9d5(value, context):
    if value['sc_b48604c1567bf9d5'] != []:
        return 'schema_invalid'
    return None


def sc_fb20f22bdb7e812f(value, context):
    if value['sc_fb20f22bdb7e812f'] != []:
        return 'schema_invalid'
    return None


def sc_9d118acdc0701738(value, context):
    if value['sc_9d118acdc0701738'] != []:
        return 'schema_invalid'
    return None


def sc_4c9b58ae9fc73211(value, context):
    if value['sc_4c9b58ae9fc73211'] != []:
        return 'schema_invalid'
    return None


def sc_2495c3a38b670a7e(value, context):
    if value['sc_2495c3a38b670a7e'] != []:
        return 'schema_invalid'
    return None


def sc_6f02d8eae54bcd73(value, context):
    if value['sc_6f02d8eae54bcd73'] != []:
        return 'schema_invalid'
    return None


def sc_8bfb3353506901c9(value, context):
    if value['sc_8bfb3353506901c9'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_6ede759f543faa93', g.Invariant('/checkpoint/index_read_token', 'required at owner schema /properties/index_read_token/required/source_selection'), 'schema_invalid', sc_6ede759f543faa93),
        g.Guard('sc_b48604c1567bf9d5', g.Invariant('/checkpoint/index_read_token', 'additionalProperties at owner schema /properties/index_read_token/additionalProperties'), 'schema_invalid', sc_b48604c1567bf9d5),
        g.Guard('sc_fb20f22bdb7e812f', g.Invariant('/checkpoint/index_read_token/storage_instance_id', 'type at owner schema /properties/index_read_token/properties/storage_instance_id/type'), 'schema_invalid', sc_fb20f22bdb7e812f),
        g.Guard('sc_9d118acdc0701738', g.Invariant('/checkpoint/index_read_token/storage_instance_id', 'format at owner schema /properties/index_read_token/properties/storage_instance_id/format'), 'schema_invalid', sc_9d118acdc0701738),
        g.Guard('sc_4c9b58ae9fc73211', g.Invariant('/checkpoint/index_read_token/checkpoint_key', 'type at owner schema /properties/index_read_token/properties/checkpoint_key/type'), 'schema_invalid', sc_4c9b58ae9fc73211),
        g.Guard('sc_2495c3a38b670a7e', g.Invariant('/checkpoint/index_read_token/checkpoint_key', 'minLength at owner schema /properties/index_read_token/properties/checkpoint_key/minLength'), 'schema_invalid', sc_2495c3a38b670a7e),
        g.Guard('sc_6f02d8eae54bcd73', g.Invariant('/checkpoint/index_read_token/checkpoint_ref', 'type at owner schema /properties/index_read_token/properties/checkpoint_ref/type'), 'schema_invalid', sc_6f02d8eae54bcd73),
        g.Guard('sc_8bfb3353506901c9', g.Invariant('/checkpoint/index_read_token/checkpoint_ref', 'minLength at owner schema /properties/index_read_token/properties/checkpoint_ref/minLength'), 'schema_invalid', sc_8bfb3353506901c9),
    ])

    def check(value):
        table.require('sc_6ede759f543faa93', value, context)
        table.require('sc_b48604c1567bf9d5', value, context)
        table.require('sc_fb20f22bdb7e812f', value, context)
        table.require('sc_9d118acdc0701738', value, context)
        table.require('sc_4c9b58ae9fc73211', value, context)
        table.require('sc_2495c3a38b670a7e', value, context)
        table.require('sc_6f02d8eae54bcd73', value, context)
        table.require('sc_8bfb3353506901c9', value, context)
        return True
    return g.Case(table, check, context)
