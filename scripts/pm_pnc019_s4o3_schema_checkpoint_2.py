"""W3I schema guard table checkpoint_2 (generated).
sc_0d0e3e7ccd5e1497: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/required/retired_publications
sc_d158f5f4b449e976: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/required/hold_refs
sc_f69d3b6c0af2c40e: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/additionalProperties
sc_175b31e5266183ce: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/schema_id/const
sc_50047dd97d8e017d: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/schema_version/const
sc_099ccf330f6866d4: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/projector_id/const
sc_cbc9c3d466f99809: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/projector_version/const
sc_67f7606bce449e84: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/storage_instance_id/maxLength
"""
import pm_guard_isolation as g


def sc_0d0e3e7ccd5e1497(value, context):
    if value['sc_0d0e3e7ccd5e1497'] != []:
        return 'schema_invalid'
    return None


def sc_d158f5f4b449e976(value, context):
    if value['sc_d158f5f4b449e976'] != []:
        return 'schema_invalid'
    return None


def sc_f69d3b6c0af2c40e(value, context):
    if value['sc_f69d3b6c0af2c40e'] != []:
        return 'schema_invalid'
    return None


def sc_175b31e5266183ce(value, context):
    if value['sc_175b31e5266183ce'] != []:
        return 'schema_invalid'
    return None


def sc_50047dd97d8e017d(value, context):
    if value['sc_50047dd97d8e017d'] != []:
        return 'schema_invalid'
    return None


def sc_099ccf330f6866d4(value, context):
    if value['sc_099ccf330f6866d4'] != []:
        return 'schema_invalid'
    return None


def sc_cbc9c3d466f99809(value, context):
    if value['sc_cbc9c3d466f99809'] != []:
        return 'schema_invalid'
    return None


def sc_67f7606bce449e84(value, context):
    if value['sc_67f7606bce449e84'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_0d0e3e7ccd5e1497', g.Invariant('/checkpoint/', 'required at owner schema /required/retired_publications'), 'schema_invalid', sc_0d0e3e7ccd5e1497),
        g.Guard('sc_d158f5f4b449e976', g.Invariant('/checkpoint/', 'required at owner schema /required/hold_refs'), 'schema_invalid', sc_d158f5f4b449e976),
        g.Guard('sc_f69d3b6c0af2c40e', g.Invariant('/checkpoint/', 'additionalProperties at owner schema /additionalProperties'), 'schema_invalid', sc_f69d3b6c0af2c40e),
        g.Guard('sc_175b31e5266183ce', g.Invariant('/checkpoint/schema_id', 'const at owner schema /properties/schema_id/const'), 'schema_invalid', sc_175b31e5266183ce),
        g.Guard('sc_50047dd97d8e017d', g.Invariant('/checkpoint/schema_version', 'const at owner schema /properties/schema_version/const'), 'schema_invalid', sc_50047dd97d8e017d),
        g.Guard('sc_099ccf330f6866d4', g.Invariant('/checkpoint/projector_id', 'const at owner schema /properties/projector_id/const'), 'schema_invalid', sc_099ccf330f6866d4),
        g.Guard('sc_cbc9c3d466f99809', g.Invariant('/checkpoint/projector_version', 'const at owner schema /properties/projector_version/const'), 'schema_invalid', sc_cbc9c3d466f99809),
        g.Guard('sc_67f7606bce449e84', g.Invariant('/checkpoint/storage_instance_id', 'maxLength at owner schema /properties/storage_instance_id/maxLength'), 'schema_invalid', sc_67f7606bce449e84),
    ])

    def check(value):
        table.require('sc_0d0e3e7ccd5e1497', value, context)
        table.require('sc_d158f5f4b449e976', value, context)
        table.require('sc_f69d3b6c0af2c40e', value, context)
        table.require('sc_175b31e5266183ce', value, context)
        table.require('sc_50047dd97d8e017d', value, context)
        table.require('sc_099ccf330f6866d4', value, context)
        table.require('sc_cbc9c3d466f99809', value, context)
        table.require('sc_67f7606bce449e84', value, context)
        return True
    return g.Case(table, check, context)
