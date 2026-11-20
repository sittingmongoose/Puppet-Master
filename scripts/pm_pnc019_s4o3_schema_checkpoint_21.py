"""W3I schema guard table checkpoint_21 (generated).
sc_e7615458d9985728: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/storage_instance_id/format
sc_e9dc0c1829207958: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/checkpoint_key/type
sc_02d5d0f4c476e74a: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/checkpoint_key/minLength
sc_63c6bb612788ffdf: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/checkpoint_ref/type
sc_168466339dd2bfef: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/checkpoint_ref/minLength
sc_1d94ea4e9d1c6b98: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/generation_id/type
sc_4ad021018c6de386: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/generation_id/pattern
sc_c533ac699cc9e196: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/properties/generation_anchor_sha256/type
"""
import pm_guard_isolation as g


def sc_e7615458d9985728(value, context):
    if value['sc_e7615458d9985728'] != []:
        return 'schema_invalid'
    return None


def sc_e9dc0c1829207958(value, context):
    if value['sc_e9dc0c1829207958'] != []:
        return 'schema_invalid'
    return None


def sc_02d5d0f4c476e74a(value, context):
    if value['sc_02d5d0f4c476e74a'] != []:
        return 'schema_invalid'
    return None


def sc_63c6bb612788ffdf(value, context):
    if value['sc_63c6bb612788ffdf'] != []:
        return 'schema_invalid'
    return None


def sc_168466339dd2bfef(value, context):
    if value['sc_168466339dd2bfef'] != []:
        return 'schema_invalid'
    return None


def sc_1d94ea4e9d1c6b98(value, context):
    if value['sc_1d94ea4e9d1c6b98'] != []:
        return 'schema_invalid'
    return None


def sc_4ad021018c6de386(value, context):
    if value['sc_4ad021018c6de386'] != []:
        return 'schema_invalid'
    return None


def sc_c533ac699cc9e196(value, context):
    if value['sc_c533ac699cc9e196'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_e7615458d9985728', g.Invariant('/checkpoint/retired_publications/*/index_read_token/storage_instance_id', 'format at owner schema /properties/retired_publications/items/properties/index_read_token/properties/storage_instance_id/format'), 'schema_invalid', sc_e7615458d9985728),
        g.Guard('sc_e9dc0c1829207958', g.Invariant('/checkpoint/retired_publications/*/index_read_token/checkpoint_key', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/checkpoint_key/type'), 'schema_invalid', sc_e9dc0c1829207958),
        g.Guard('sc_02d5d0f4c476e74a', g.Invariant('/checkpoint/retired_publications/*/index_read_token/checkpoint_key', 'minLength at owner schema /properties/retired_publications/items/properties/index_read_token/properties/checkpoint_key/minLength'), 'schema_invalid', sc_02d5d0f4c476e74a),
        g.Guard('sc_63c6bb612788ffdf', g.Invariant('/checkpoint/retired_publications/*/index_read_token/checkpoint_ref', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/checkpoint_ref/type'), 'schema_invalid', sc_63c6bb612788ffdf),
        g.Guard('sc_168466339dd2bfef', g.Invariant('/checkpoint/retired_publications/*/index_read_token/checkpoint_ref', 'minLength at owner schema /properties/retired_publications/items/properties/index_read_token/properties/checkpoint_ref/minLength'), 'schema_invalid', sc_168466339dd2bfef),
        g.Guard('sc_1d94ea4e9d1c6b98', g.Invariant('/checkpoint/retired_publications/*/index_read_token/generation_id', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/generation_id/type'), 'schema_invalid', sc_1d94ea4e9d1c6b98),
        g.Guard('sc_4ad021018c6de386', g.Invariant('/checkpoint/retired_publications/*/index_read_token/generation_id', 'pattern at owner schema /properties/retired_publications/items/properties/index_read_token/properties/generation_id/pattern'), 'schema_invalid', sc_4ad021018c6de386),
        g.Guard('sc_c533ac699cc9e196', g.Invariant('/checkpoint/retired_publications/*/index_read_token/generation_anchor_sha256', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/properties/generation_anchor_sha256/type'), 'schema_invalid', sc_c533ac699cc9e196),
    ])

    def check(value):
        table.require('sc_e7615458d9985728', value, context)
        table.require('sc_e9dc0c1829207958', value, context)
        table.require('sc_02d5d0f4c476e74a', value, context)
        table.require('sc_63c6bb612788ffdf', value, context)
        table.require('sc_168466339dd2bfef', value, context)
        table.require('sc_1d94ea4e9d1c6b98', value, context)
        table.require('sc_4ad021018c6de386', value, context)
        table.require('sc_c533ac699cc9e196', value, context)
        return True
    return g.Case(table, check, context)
