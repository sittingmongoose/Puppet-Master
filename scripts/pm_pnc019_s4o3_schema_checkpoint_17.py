"""W3I schema guard table checkpoint_17 (generated).
sc_da6dc308413f9e91: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/schema_id/const
sc_974f08a7ed8f48e9: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/schema_version/const
sc_dd881a53a3c8374d: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/projector_id/const
sc_1674c07aa807c5bc: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/projector_version/const
sc_50e322c61e55286d: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/storage_instance_id/maxLength
sc_728098611bcfd2f8: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/storage_instance_id/pattern
sc_041f800b72ec0692: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/storage_instance_id/not
sc_4417932c0c4e3772: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/project_id/maxLength
"""
import pm_guard_isolation as g


def sc_da6dc308413f9e91(value, context):
    if value['sc_da6dc308413f9e91'] != []:
        return 'schema_invalid'
    return None


def sc_974f08a7ed8f48e9(value, context):
    if value['sc_974f08a7ed8f48e9'] != []:
        return 'schema_invalid'
    return None


def sc_dd881a53a3c8374d(value, context):
    if value['sc_dd881a53a3c8374d'] != []:
        return 'schema_invalid'
    return None


def sc_1674c07aa807c5bc(value, context):
    if value['sc_1674c07aa807c5bc'] != []:
        return 'schema_invalid'
    return None


def sc_50e322c61e55286d(value, context):
    if value['sc_50e322c61e55286d'] != []:
        return 'schema_invalid'
    return None


def sc_728098611bcfd2f8(value, context):
    if value['sc_728098611bcfd2f8'] != []:
        return 'schema_invalid'
    return None


def sc_041f800b72ec0692(value, context):
    if value['sc_041f800b72ec0692'] != []:
        return 'schema_invalid'
    return None


def sc_4417932c0c4e3772(value, context):
    if value['sc_4417932c0c4e3772'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_da6dc308413f9e91', g.Invariant('/checkpoint/retired_publications/*/schema_id', 'const at owner schema /properties/retired_publications/items/properties/schema_id/const'), 'schema_invalid', sc_da6dc308413f9e91),
        g.Guard('sc_974f08a7ed8f48e9', g.Invariant('/checkpoint/retired_publications/*/schema_version', 'const at owner schema /properties/retired_publications/items/properties/schema_version/const'), 'schema_invalid', sc_974f08a7ed8f48e9),
        g.Guard('sc_dd881a53a3c8374d', g.Invariant('/checkpoint/retired_publications/*/projector_id', 'const at owner schema /properties/retired_publications/items/properties/projector_id/const'), 'schema_invalid', sc_dd881a53a3c8374d),
        g.Guard('sc_1674c07aa807c5bc', g.Invariant('/checkpoint/retired_publications/*/projector_version', 'const at owner schema /properties/retired_publications/items/properties/projector_version/const'), 'schema_invalid', sc_1674c07aa807c5bc),
        g.Guard('sc_50e322c61e55286d', g.Invariant('/checkpoint/retired_publications/*/storage_instance_id', 'maxLength at owner schema /properties/retired_publications/items/properties/storage_instance_id/maxLength'), 'schema_invalid', sc_50e322c61e55286d),
        g.Guard('sc_728098611bcfd2f8', g.Invariant('/checkpoint/retired_publications/*/storage_instance_id', 'pattern at owner schema /properties/retired_publications/items/properties/storage_instance_id/pattern'), 'schema_invalid', sc_728098611bcfd2f8),
        g.Guard('sc_041f800b72ec0692', g.Invariant('/checkpoint/retired_publications/*/storage_instance_id', 'not at owner schema /properties/retired_publications/items/properties/storage_instance_id/not'), 'schema_invalid', sc_041f800b72ec0692),
        g.Guard('sc_4417932c0c4e3772', g.Invariant('/checkpoint/retired_publications/*/project_id', 'maxLength at owner schema /properties/retired_publications/items/properties/project_id/maxLength'), 'schema_invalid', sc_4417932c0c4e3772),
    ])

    def check(value):
        table.require('sc_da6dc308413f9e91', value, context)
        table.require('sc_974f08a7ed8f48e9', value, context)
        table.require('sc_dd881a53a3c8374d', value, context)
        table.require('sc_1674c07aa807c5bc', value, context)
        table.require('sc_50e322c61e55286d', value, context)
        table.require('sc_728098611bcfd2f8', value, context)
        table.require('sc_041f800b72ec0692', value, context)
        table.require('sc_4417932c0c4e3772', value, context)
        return True
    return g.Case(table, check, context)
