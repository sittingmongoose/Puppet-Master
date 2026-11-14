"""W3I schema guard table checkpoint_19 (generated).
sc_87e4360a62fd7112: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/admitted_event_types/type
sc_124704ee0e6860f4: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/admitted_event_types/minItems
sc_c73bc9cd8bd2d358: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/admitted_event_types/uniqueItems
sc_69c80f6993afa290: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/admitted_event_types/items/enum
sc_ac384ac869f8f431: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/type
sc_4b479bac86abaf04: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/required/storage_instance_id
sc_5d31f220c74239be: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/required/checkpoint_key
sc_c2c3347350db46c5: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/index_read_token/required/checkpoint_ref
"""
import pm_guard_isolation as g


def sc_87e4360a62fd7112(value, context):
    if value['sc_87e4360a62fd7112'] != []:
        return 'schema_invalid'
    return None


def sc_124704ee0e6860f4(value, context):
    if value['sc_124704ee0e6860f4'] != []:
        return 'schema_invalid'
    return None


def sc_c73bc9cd8bd2d358(value, context):
    if value['sc_c73bc9cd8bd2d358'] != []:
        return 'schema_invalid'
    return None


def sc_69c80f6993afa290(value, context):
    if value['sc_69c80f6993afa290'] != []:
        return 'schema_invalid'
    return None


def sc_ac384ac869f8f431(value, context):
    if value['sc_ac384ac869f8f431'] != []:
        return 'schema_invalid'
    return None


def sc_4b479bac86abaf04(value, context):
    if value['sc_4b479bac86abaf04'] != []:
        return 'schema_invalid'
    return None


def sc_5d31f220c74239be(value, context):
    if value['sc_5d31f220c74239be'] != []:
        return 'schema_invalid'
    return None


def sc_c2c3347350db46c5(value, context):
    if value['sc_c2c3347350db46c5'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_87e4360a62fd7112', g.Invariant('/checkpoint/retired_publications/*/admitted_event_types', 'type at owner schema /properties/retired_publications/items/properties/admitted_event_types/type'), 'schema_invalid', sc_87e4360a62fd7112),
        g.Guard('sc_124704ee0e6860f4', g.Invariant('/checkpoint/retired_publications/*/admitted_event_types', 'minItems at owner schema /properties/retired_publications/items/properties/admitted_event_types/minItems'), 'schema_invalid', sc_124704ee0e6860f4),
        g.Guard('sc_c73bc9cd8bd2d358', g.Invariant('/checkpoint/retired_publications/*/admitted_event_types', 'uniqueItems at owner schema /properties/retired_publications/items/properties/admitted_event_types/uniqueItems'), 'schema_invalid', sc_c73bc9cd8bd2d358),
        g.Guard('sc_69c80f6993afa290', g.Invariant('/checkpoint/retired_publications/*/admitted_event_types/*', 'enum at owner schema /properties/retired_publications/items/properties/admitted_event_types/items/enum'), 'schema_invalid', sc_69c80f6993afa290),
        g.Guard('sc_ac384ac869f8f431', g.Invariant('/checkpoint/retired_publications/*/index_read_token', 'type at owner schema /properties/retired_publications/items/properties/index_read_token/type'), 'schema_invalid', sc_ac384ac869f8f431),
        g.Guard('sc_4b479bac86abaf04', g.Invariant('/checkpoint/retired_publications/*/index_read_token', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/required/storage_instance_id'), 'schema_invalid', sc_4b479bac86abaf04),
        g.Guard('sc_5d31f220c74239be', g.Invariant('/checkpoint/retired_publications/*/index_read_token', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/required/checkpoint_key'), 'schema_invalid', sc_5d31f220c74239be),
        g.Guard('sc_c2c3347350db46c5', g.Invariant('/checkpoint/retired_publications/*/index_read_token', 'required at owner schema /properties/retired_publications/items/properties/index_read_token/required/checkpoint_ref'), 'schema_invalid', sc_c2c3347350db46c5),
    ])

    def check(value):
        table.require('sc_87e4360a62fd7112', value, context)
        table.require('sc_124704ee0e6860f4', value, context)
        table.require('sc_c73bc9cd8bd2d358', value, context)
        table.require('sc_69c80f6993afa290', value, context)
        table.require('sc_ac384ac869f8f431', value, context)
        table.require('sc_4b479bac86abaf04', value, context)
        table.require('sc_5d31f220c74239be', value, context)
        table.require('sc_c2c3347350db46c5', value, context)
        return True
    return g.Case(table, check, context)
