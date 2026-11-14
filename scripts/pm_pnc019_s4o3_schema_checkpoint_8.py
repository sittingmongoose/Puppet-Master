"""W3I schema guard table checkpoint_8 (generated).
sc_468c25eab0f6a641: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/frontier_sha256/pattern
sc_1941d7d9342e836c: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/index_dataset_name/type
sc_58ff9e24ec5f5df5: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/index_dataset_name/minLength
sc_b26afa7b5708b08e: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/type
sc_3e92fd7f065448c0: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/required/storage_instance_id
sc_aae8d929da6b8146: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/required/current_ref
sc_4de8fc88f0e7c970: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/required/current_bytes_sha256
sc_2d87459f5229a517: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/index_read_token/properties/source_selection/required/selected_segment_generation
"""
import pm_guard_isolation as g


def sc_468c25eab0f6a641(value, context):
    if value['sc_468c25eab0f6a641'] != []:
        return 'schema_invalid'
    return None


def sc_1941d7d9342e836c(value, context):
    if value['sc_1941d7d9342e836c'] != []:
        return 'schema_invalid'
    return None


def sc_58ff9e24ec5f5df5(value, context):
    if value['sc_58ff9e24ec5f5df5'] != []:
        return 'schema_invalid'
    return None


def sc_b26afa7b5708b08e(value, context):
    if value['sc_b26afa7b5708b08e'] != []:
        return 'schema_invalid'
    return None


def sc_3e92fd7f065448c0(value, context):
    if value['sc_3e92fd7f065448c0'] != []:
        return 'schema_invalid'
    return None


def sc_aae8d929da6b8146(value, context):
    if value['sc_aae8d929da6b8146'] != []:
        return 'schema_invalid'
    return None


def sc_4de8fc88f0e7c970(value, context):
    if value['sc_4de8fc88f0e7c970'] != []:
        return 'schema_invalid'
    return None


def sc_2d87459f5229a517(value, context):
    if value['sc_2d87459f5229a517'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_468c25eab0f6a641', g.Invariant('/checkpoint/index_read_token/frontier_sha256', 'pattern at owner schema /properties/index_read_token/properties/frontier_sha256/pattern'), 'schema_invalid', sc_468c25eab0f6a641),
        g.Guard('sc_1941d7d9342e836c', g.Invariant('/checkpoint/index_read_token/index_dataset_name', 'type at owner schema /properties/index_read_token/properties/index_dataset_name/type'), 'schema_invalid', sc_1941d7d9342e836c),
        g.Guard('sc_58ff9e24ec5f5df5', g.Invariant('/checkpoint/index_read_token/index_dataset_name', 'minLength at owner schema /properties/index_read_token/properties/index_dataset_name/minLength'), 'schema_invalid', sc_58ff9e24ec5f5df5),
        g.Guard('sc_b26afa7b5708b08e', g.Invariant('/checkpoint/index_read_token/source_selection', 'type at owner schema /properties/index_read_token/properties/source_selection/type'), 'schema_invalid', sc_b26afa7b5708b08e),
        g.Guard('sc_3e92fd7f065448c0', g.Invariant('/checkpoint/index_read_token/source_selection', 'required at owner schema /properties/index_read_token/properties/source_selection/required/storage_instance_id'), 'schema_invalid', sc_3e92fd7f065448c0),
        g.Guard('sc_aae8d929da6b8146', g.Invariant('/checkpoint/index_read_token/source_selection', 'required at owner schema /properties/index_read_token/properties/source_selection/required/current_ref'), 'schema_invalid', sc_aae8d929da6b8146),
        g.Guard('sc_4de8fc88f0e7c970', g.Invariant('/checkpoint/index_read_token/source_selection', 'required at owner schema /properties/index_read_token/properties/source_selection/required/current_bytes_sha256'), 'schema_invalid', sc_4de8fc88f0e7c970),
        g.Guard('sc_2d87459f5229a517', g.Invariant('/checkpoint/index_read_token/source_selection', 'required at owner schema /properties/index_read_token/properties/source_selection/required/selected_segment_generation'), 'schema_invalid', sc_2d87459f5229a517),
    ])

    def check(value):
        table.require('sc_468c25eab0f6a641', value, context)
        table.require('sc_1941d7d9342e836c', value, context)
        table.require('sc_58ff9e24ec5f5df5', value, context)
        table.require('sc_b26afa7b5708b08e', value, context)
        table.require('sc_3e92fd7f065448c0', value, context)
        table.require('sc_aae8d929da6b8146', value, context)
        table.require('sc_4de8fc88f0e7c970', value, context)
        table.require('sc_2d87459f5229a517', value, context)
        return True
    return g.Case(table, check, context)
