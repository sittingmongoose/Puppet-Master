"""W3I schema guard table checkpoint_5 (generated).
sc_946d5f4e812c9d44: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/required/storage_instance_id
sc_c869ff6aa25ae834: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/required/checkpoint_key
sc_49c8c61c8b4d984f: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/required/checkpoint_ref
sc_2b9a3b8317a2e78f: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/required/generation_id
sc_22d57e85268b5612: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/required/generation_anchor_sha256
sc_fb68194aa615fe98: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/required/frontier_revision
sc_dce7fa4bb3ea47dd: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/required/frontier_sha256
sc_f2d76e4c45cd88c4: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/required/index_dataset_name
"""
import pm_guard_isolation as g


def sc_946d5f4e812c9d44(value, context):
    if value['sc_946d5f4e812c9d44'] != []:
        return 'schema_invalid'
    return None


def sc_c869ff6aa25ae834(value, context):
    if value['sc_c869ff6aa25ae834'] != []:
        return 'schema_invalid'
    return None


def sc_49c8c61c8b4d984f(value, context):
    if value['sc_49c8c61c8b4d984f'] != []:
        return 'schema_invalid'
    return None


def sc_2b9a3b8317a2e78f(value, context):
    if value['sc_2b9a3b8317a2e78f'] != []:
        return 'schema_invalid'
    return None


def sc_22d57e85268b5612(value, context):
    if value['sc_22d57e85268b5612'] != []:
        return 'schema_invalid'
    return None


def sc_fb68194aa615fe98(value, context):
    if value['sc_fb68194aa615fe98'] != []:
        return 'schema_invalid'
    return None


def sc_dce7fa4bb3ea47dd(value, context):
    if value['sc_dce7fa4bb3ea47dd'] != []:
        return 'schema_invalid'
    return None


def sc_f2d76e4c45cd88c4(value, context):
    if value['sc_f2d76e4c45cd88c4'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_946d5f4e812c9d44', g.Invariant('/checkpoint/index_read_token', 'required at owner schema /properties/index_read_token/required/storage_instance_id'), 'schema_invalid', sc_946d5f4e812c9d44),
        g.Guard('sc_c869ff6aa25ae834', g.Invariant('/checkpoint/index_read_token', 'required at owner schema /properties/index_read_token/required/checkpoint_key'), 'schema_invalid', sc_c869ff6aa25ae834),
        g.Guard('sc_49c8c61c8b4d984f', g.Invariant('/checkpoint/index_read_token', 'required at owner schema /properties/index_read_token/required/checkpoint_ref'), 'schema_invalid', sc_49c8c61c8b4d984f),
        g.Guard('sc_2b9a3b8317a2e78f', g.Invariant('/checkpoint/index_read_token', 'required at owner schema /properties/index_read_token/required/generation_id'), 'schema_invalid', sc_2b9a3b8317a2e78f),
        g.Guard('sc_22d57e85268b5612', g.Invariant('/checkpoint/index_read_token', 'required at owner schema /properties/index_read_token/required/generation_anchor_sha256'), 'schema_invalid', sc_22d57e85268b5612),
        g.Guard('sc_fb68194aa615fe98', g.Invariant('/checkpoint/index_read_token', 'required at owner schema /properties/index_read_token/required/frontier_revision'), 'schema_invalid', sc_fb68194aa615fe98),
        g.Guard('sc_dce7fa4bb3ea47dd', g.Invariant('/checkpoint/index_read_token', 'required at owner schema /properties/index_read_token/required/frontier_sha256'), 'schema_invalid', sc_dce7fa4bb3ea47dd),
        g.Guard('sc_f2d76e4c45cd88c4', g.Invariant('/checkpoint/index_read_token', 'required at owner schema /properties/index_read_token/required/index_dataset_name'), 'schema_invalid', sc_f2d76e4c45cd88c4),
    ])

    def check(value):
        table.require('sc_946d5f4e812c9d44', value, context)
        table.require('sc_c869ff6aa25ae834', value, context)
        table.require('sc_49c8c61c8b4d984f', value, context)
        table.require('sc_2b9a3b8317a2e78f', value, context)
        table.require('sc_22d57e85268b5612', value, context)
        table.require('sc_fb68194aa615fe98', value, context)
        table.require('sc_dce7fa4bb3ea47dd', value, context)
        table.require('sc_f2d76e4c45cd88c4', value, context)
        return True
    return g.Case(table, check, context)
